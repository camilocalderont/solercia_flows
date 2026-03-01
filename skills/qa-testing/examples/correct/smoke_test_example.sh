#!/bin/bash
# ✅ CORRECTO: Smoke test que verifica un servicio

# Verificar que el contenedor esta corriendo
check_container() {
  local name=$1
  if docker ps --filter "name=${name}" --filter "status=running" --format '{{.Names}}' | grep -q "${name}"; then
    echo "[PASS] Container '${name}' esta corriendo"
    return 0
  else
    echo "[FAIL] Container '${name}' NO esta corriendo"
    return 1
  fi
}

# Verificar endpoint HTTP con codigo esperado
check_url() {
  local label=$1
  local url=$2
  local expected=${3:-200}

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -k "${url}" 2>/dev/null || echo "000")
  if [ "${HTTP_CODE}" = "${expected}" ]; then
    echo "[PASS] ${label} (HTTP ${HTTP_CODE})"
    return 0
  else
    echo "[FAIL] ${label} - esperado ${expected}, obtuvo ${HTTP_CODE}"
    return 1
  fi
}

# Verificar que no hay credenciales hardcoded
check_no_hardcoded_creds() {
  local file=$1
  if grep -qE '(password|token|secret).*=.*[a-zA-Z0-9]{8,}' "${file}" 2>/dev/null; then
    echo "[FAIL] Credenciales hardcoded en ${file}"
    return 1
  else
    echo "[PASS] Sin credenciales hardcoded en ${file}"
    return 0
  fi
}

# Ejecucion
check_container "boki-api"
check_url "boki-api Swagger" "https://boki-api.solercia.com.co/api-docs"
check_no_hardcoded_creds "docker-compose.yml"
