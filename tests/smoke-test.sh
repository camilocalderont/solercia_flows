#!/bin/bash
# ===========================================
# BokiBot Platform - Smoke Tests
# ===========================================
# Run after docker compose up to verify all services are healthy
# Usage: ./tests/smoke-test.sh [domain]
# Example: ./tests/smoke-test.sh solercia.com.co
#          ./tests/smoke-test.sh localhost

set -euo pipefail

DOMAIN=${1:-localhost}
PROTOCOL=${2:-https}
PASS=0
FAIL=0
TOTAL=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_pass() {
  ((PASS++))
  ((TOTAL++))
  echo -e "${GREEN}[PASS]${NC} $1"
}

log_fail() {
  ((FAIL++))
  ((TOTAL++))
  echo -e "${RED}[FAIL]${NC} $1"
}

log_info() {
  echo -e "${YELLOW}[INFO]${NC} $1"
}

echo "================================================"
echo "  BokiBot Smoke Tests"
echo "  Domain: ${DOMAIN}"
echo "  Protocol: ${PROTOCOL}"
echo "  Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================================"
echo ""

# --- 1. Docker Services ---
log_info "Checking Docker services..."

check_container() {
  local name=$1
  if docker ps --filter "name=${name}" --filter "status=running" --format '{{.Names}}' | grep -q "${name}"; then
    log_pass "Container '${name}' is running"
  else
    log_fail "Container '${name}' is NOT running"
  fi
}

check_container "traefik"
check_container "postgres"
check_container "flows"
check_container "solercia-web"
check_container "mongo_boki"
check_container "boki-api"

echo ""

# --- 2. HTTP Health Checks ---
log_info "Checking HTTP endpoints..."

check_url() {
  local label=$1
  local url=$2
  local expected_code=${3:-200}

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -k "${url}" 2>/dev/null || echo "000")
  if [ "${HTTP_CODE}" = "${expected_code}" ]; then
    log_pass "${label} (HTTP ${HTTP_CODE})"
  else
    log_fail "${label} - expected ${expected_code}, got ${HTTP_CODE}"
  fi
}

# Website
check_url "solercia-web (www)" "${PROTOCOL}://www.${DOMAIN}" "200"

# n8n Flows
check_url "n8n Flows" "${PROTOCOL}://flows.${DOMAIN}" "200"

# boki-api health
check_url "boki-api Swagger" "${PROTOCOL}://boki-api.${DOMAIN}/api-docs" "200"

# boki-api health endpoint
check_url "boki-api Health" "${PROTOCOL}://boki-api.${DOMAIN}/api/v1/health" "200"

echo ""

# --- 3. Database Connectivity ---
log_info "Checking database connectivity..."

# PostgreSQL via docker exec
if docker exec postgres pg_isready -U postgres -d n8n >/dev/null 2>&1; then
  log_pass "PostgreSQL is ready"
else
  log_fail "PostgreSQL is NOT ready"
fi

# MongoDB via docker exec
if docker exec mongo_boki mongosh --quiet --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
  log_pass "MongoDB is ready"
else
  log_fail "MongoDB is NOT ready"
fi

echo ""

# --- 4. SSL Certificate Check ---
if [ "${PROTOCOL}" = "https" ] && [ "${DOMAIN}" != "localhost" ]; then
  log_info "Checking SSL certificates..."

  check_ssl() {
    local subdomain=$1
    local fqdn="${subdomain}.${DOMAIN}"
    local expiry
    expiry=$(echo | openssl s_client -servername "${fqdn}" -connect "${fqdn}:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
    if [ -n "${expiry}" ]; then
      log_pass "SSL cert for ${fqdn} (expires: ${expiry})"
    else
      log_fail "SSL cert for ${fqdn} - could not verify"
    fi
  }

  check_ssl "www"
  check_ssl "flows"
  check_ssl "boki-api"
  echo ""
fi

# --- 5. Network Check ---
log_info "Checking Docker network..."

if docker network inspect red_solercia_com_co >/dev/null 2>&1; then
  CONNECTED=$(docker network inspect red_solercia_com_co --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null)
  log_pass "Docker network 'red_solercia_com_co' exists (containers: ${CONNECTED})"
else
  log_fail "Docker network 'red_solercia_com_co' does NOT exist"
fi

echo ""

# --- 6. Security Checks ---
log_info "Running basic security checks..."

# Check no exposed credentials in docker-compose
if grep -qE '(password|token|secret).*=.*[a-zA-Z0-9]{6,}' docker-compose.yml 2>/dev/null; then
  MATCHES=$(grep -cE '(password|token|secret).*=.*[a-zA-Z0-9]{6,}' docker-compose.yml 2>/dev/null)
  log_fail "Found ${MATCHES} potential hardcoded credentials in docker-compose.yml"
else
  log_pass "No hardcoded credentials in docker-compose.yml"
fi

# Check .env exists and is not tracked
if [ -f .env ]; then
  if git ls-files --error-unmatch .env >/dev/null 2>&1; then
    log_fail ".env file is tracked by git!"
  else
    log_pass ".env file exists and is NOT tracked by git"
  fi
else
  log_fail ".env file does not exist (copy from .env.example)"
fi

# Check PostgreSQL port not exposed externally
if grep -q '"5433:5432"' docker-compose.yml 2>/dev/null; then
  log_fail "PostgreSQL port 5433 is exposed externally"
else
  log_pass "PostgreSQL port is NOT exposed externally"
fi

echo ""

# --- Summary ---
echo "================================================"
echo "  RESULTS: ${PASS} passed, ${FAIL} failed (${TOTAL} total)"
echo "================================================"

if [ ${FAIL} -gt 0 ]; then
  echo -e "${RED}Some tests failed. Check the output above.${NC}"
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi
