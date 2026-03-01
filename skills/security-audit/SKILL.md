---
name: security-audit
description: >
  Auditoria de seguridad para BokiBot: gestion de credenciales, OWASP top 10, SQL injection, headers, CORS.
  Trigger: When reviewing code for security, managing credentials, configuring CORS, or auditing infrastructure.
metadata:
  author: solercia
  version: "1.0"
---

## When to Use

Ejecutar este skill cuando:
- Se revisa codigo nuevo para vulnerabilidades
- Se agregan/modifican credenciales o tokens
- Se configura CORS, headers de seguridad, o autenticacion
- Se audita la infraestructura Docker/Traefik
- Se revisan flujos n8n con queries SQL
- Se hace un release o deploy a produccion

---

## Credenciales (CRITICO)

### Reglas absolutas

1. **NUNCA** commitear credenciales reales a git
2. **SIEMPRE** usar `.env` para secrets
3. **SIEMPRE** tener `.env` en `.gitignore`
4. **SIEMPRE** mantener `.env.example` actualizado (sin valores reales)
5. **SI** se expone un secret: rotar INMEDIATAMENTE + purgar git history

### Donde buscar exposiciones

```bash
# En archivos versionados
grep -rn "password\|token\|secret\|apikey\|api_key" --include="*.yml" --include="*.json" --include="*.ts" --include="*.md" .

# En git history
git log -p --all -S "password" -- "*.yml" "*.json"

# En variables de entorno hardcoded
grep -rn "admin123\|SO5\|sk-proj\|EAAZAL\|AIzaSy" .
```

### Rotacion de tokens

| Token | Donde rotar | Impacto |
|-------|------------|---------|
| Meta Bot Token | Meta Business Suite → WhatsApp → API Setup | Bot deja de recibir mensajes |
| OpenAI API Key | platform.openai.com → API Keys | LLM deja de funcionar |
| Gemini API Key | Google Cloud Console → API Keys | Chatbot web sin IA |
| PostgreSQL Password | .env + docker compose restart | Todos los servicios se reconectan |
| API Token (boki-api) | .env + n8n env vars + restart | Flujos n8n pierden acceso |
| JWT Secret | .env + restart boki-api | Usuarios deben re-loguearse |

---

## OWASP Top 10 - Checklist

### 1. Injection (SQL/NoSQL)

```sql
-- ❌ VULNERABLE: Interpolacion directa de input de usuario
SELECT * FROM "Client" WHERE vc_phone = '{{$node["Webhook"].json.phone}}'

-- ✅ SEGURO: Query parametrizada (via boki-api endpoint)
-- En vez de SQL directo en n8n, llamar a:
-- POST /api/v1/clients/find-by-phone { "phone": "3001234567" }
```

### 2. Broken Authentication

```typescript
// ❌ VULNERABLE: JWT secret hardcoded
const jwtSecret = 'mi-secreto-123';

// ✅ SEGURO: JWT secret desde variable de entorno
const jwtSecret = process.env.JWT_SECRET;

// ❌ VULNERABLE: Sin expiracion de token
jwt.sign(payload, secret);

// ✅ SEGURO: Token con expiracion
jwt.sign(payload, secret, { expiresIn: '2h' });
```

### 3. Sensitive Data Exposure

```yaml
# ❌ VULNERABLE: Credenciales en docker-compose.yml
environment:
  MONGO_INITDB_ROOT_PASSWORD: admin123F

# ✅ SEGURO: Variables de entorno
environment:
  MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
```

### 4. XSS (Cross-Site Scripting)

```typescript
// ❌ VULNERABLE: innerHTML sin sanitizar
element.innerHTML = userInput;

// ✅ SEGURO: Angular sanitiza por defecto con interpolacion
// {{ userInput }} en templates Angular es seguro
```

### 5. CORS Misconfiguration

```typescript
// ❌ VULNERABLE: CORS abierto a todos
app.enableCors(); // Sin restricciones

// ✅ SEGURO: CORS restringido
app.enableCors({
  origin: [
    'https://www.solercia.com.co',
    'https://boki-api.solercia.com.co',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});
```

### 6. Security Headers

Verificar que Traefik incluye:

| Header | Valor esperado |
|--------|---------------|
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload |
| X-Content-Type-Options | nosniff |
| X-XSS-Protection | 1; mode=block |
| X-Frame-Options | DENY (o SAMEORIGIN para n8n) |
| Content-Security-Policy | Configurado segun servicio |

---

## Auditoria de Infraestructura

### Docker

| Verificacion | Comando | Esperado |
|-------------|---------|----------|
| No puertos DB expuestos | `docker compose config \| grep "ports"` | Solo 80 y 443 |
| .env no trackeado | `git ls-files .env` | Vacio |
| Healthchecks activos | `docker inspect --format='{{.State.Health}}' CONTAINER` | healthy |
| Red aislada | `docker network inspect red_solercia_com_co` | Solo servicios del proyecto |

### n8n Flujos

| Verificacion | Buscar | Severidad |
|-------------|--------|-----------|
| Tokens hardcoded | `SMFGAHDJVqUr`, `sk-proj-`, `EAAZAL` en JSON | CRITICO |
| URLs hardcoded | `solercia.com.co` hardcoded (sin `$env`) | ALTO |
| SQL injection | `'{{$node[` en queries SQL | CRITICO |
| Webhook URLs publicos | UUIDs de webhook en logs/docs | MEDIO |

---

## Anti-Patterns

### No: Credenciales en codigo fuente

```typescript
// ❌ PROHIBIDO
const config = {
  database: {
    password: 'SO5!2025',     // NUNCA hardcodear
    host: '192.168.1.100',    // NUNCA IPs fijas
  },
  openai: {
    apiKey: 'sk-proj-abc123', // NUNCA API keys en codigo
  },
};

// ✅ CORRECTO
const config = {
  database: {
    password: process.env.POSTGRES_DB_PASSWORD,
    host: process.env.POSTGRES_DB_HOST,
  },
  openai: {
    apiKey: process.env.LLM_APIKEY,
  },
};
```

### No: Git history con secrets

```bash
# ❌ El .env ya fue commiteado? El secret esta en el history
# Aunque lo borres del archivo, sigue en git log

# ✅ Purgar con BFG Repo Cleaner
bfg --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# O con git filter-repo
git filter-repo --path .env --invert-paths
```

---

## Procedimiento de Auditoria

1. **Escanear credenciales**: `grep -rn` por patrones conocidos
2. **Verificar .gitignore**: `.env`, `*.key`, `*.pem` estan ignorados
3. **Revisar docker-compose**: Sin passwords hardcoded, sin puertos expuestos
4. **Revisar n8n flows**: Sin tokens, sin SQL injection
5. **Verificar headers**: HSTS, XSS, CSP via curl
6. **Verificar CORS**: Solo dominios permitidos
7. **Verificar JWT**: Secret fuerte, expiracion configurada
8. **Documentar hallazgos**: En `claude-logs/BLOQUEANTES.md`

---

## Comandos

```bash
# Buscar credenciales expuestas
grep -rn "password\|token\|secret\|apikey" --include="*.{yml,json,ts,md}" .

# Verificar headers de seguridad
curl -I https://www.solercia.com.co 2>/dev/null | grep -i "strict\|x-frame\|x-content\|x-xss"

# Verificar CORS
curl -H "Origin: https://evil.com" -I https://boki-api.solercia.com.co/api/v1/health

# Verificar .env no trackeado
git ls-files .env

# Verificar puertos expuestos
docker compose config | grep -A2 "ports:"

# Escanear git history
git log --all --oneline -p | grep -i "password\|token\|secret" | head -20
```
