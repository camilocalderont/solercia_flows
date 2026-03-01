# Patron Correcto: Variables de Entorno en Flujos n8n

## Principio

Toda URL, token o credencial que pueda variar entre ambientes (desarrollo, staging, produccion) DEBE usar variables de entorno de n8n con la sintaxis `{{ $env.VARIABLE }}`.

---

## Variables de Entorno Requeridas en BokiBot

| Variable | Descripcion | Ejemplo Produccion | Ejemplo Desarrollo |
|---|---|---|---|
| `API_TOKEN` | Token para autenticacion con boki-api | `token-seguro-produccion` | `token-desarrollo-local` |
| `API_URL` | URL base de boki-api (sin `/` final) | `https://boki-api.solercia.com.co` | `http://localhost:3000` |
| `WEBHOOK_URL` | URL base de n8n para webhooks (sin `/` final) | `https://flows.solercia.com.co` | `http://localhost:5678` |

---

## Ejemplo 1: Nodo HTTP Request con Headers de Autenticacion

### Correcto

```json
{
  "type": "n8n-nodes-base.httpRequest",
  "name": "Professional-Context",
  "parameters": {
    "url": "={{ $env.API_URL }}/api/v1/professional/company/{{$node['DataSession'].json.company_id}}/agent",
    "sendHeaders": true,
    "specifyHeaders": "json",
    "jsonHeaders": "{\n  \"x-api-token\": \"{{ $env.API_TOKEN }}\",\n  \"x-api-key\": \"{{ $env.API_TOKEN }}\"\n}"
  }
}
```

Observar:
- `{{ $env.API_URL }}` para la URL base
- `{{ $env.API_TOKEN }}` para ambos headers de autenticacion
- Los datos dinamicos del flujo (`company_id`) se combinan normalmente con la variable de entorno

---

## Ejemplo 2: Llamada a Sub-Flujo via Webhook

### Correcto

```json
{
  "type": "n8n-nodes-base.httpRequest",
  "name": "FaqsFlow",
  "parameters": {
    "url": "={{ $env.WEBHOOK_URL }}/webhook/abc12345-6789-4def-abcd-123456789abc",
    "method": "POST",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"sessionId\": \"{{ $json.sessionId }}\",\n  \"company_id\": {{ $json.company_id }},\n  \"user_message\": \"{{ $json.user_message }}\"\n}"
  }
}
```

Observar:
- `{{ $env.WEBHOOK_URL }}` para la URL base de n8n
- El UUID del webhook (`abc12345-...`) es un path fijo del flujo, no una credencial
- El body del POST contiene datos dinamicos del flujo (sessionId, company_id, etc.)

---

## Ejemplo 3: Crear Cita via boki-api

### Correcto

```json
{
  "type": "n8n-nodes-base.httpRequest",
  "name": "CreateAppointment",
  "parameters": {
    "url": "={{ $env.API_URL }}/api/v1/appointments",
    "method": "POST",
    "sendHeaders": true,
    "specifyHeaders": "json",
    "jsonHeaders": "{\n  \"x-api-token\": \"{{ $env.API_TOKEN }}\",\n  \"x-api-key\": \"{{ $env.API_TOKEN }}\",\n  \"Content-Type\": \"application/json\"\n}",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"ServiceId\": {{ $json.ServiceId }},\n  \"ProfessionalId\": {{ $json.ProfessionalId }},\n  \"DtDate\": \"{{ $json.DtDate }}\",\n  \"TStartTime\": \"{{ $json.TStartTime }}\",\n  \"ClientId\": {{ $node['DataSession'].json.client.id }}\n}"
  }
}
```

---

## Ejemplo 4: Combinacion de Variables de Entorno con Expresiones n8n

Las variables de entorno se pueden combinar con cualquier expresion de n8n:

```
// URL con parametro dinamico
={{ $env.API_URL }}/api/v1/clients/{{ $json.clientId }}

// URL con query string
={{ $env.API_URL }}/api/v1/faqs?companyId={{ $json.company_id }}&category={{ $json.category }}

// Webhook con path del sub-flujo
={{ $env.WEBHOOK_URL }}/webhook/{{ $json.target_webhook_id }}
```

---

## Donde Configurar las Variables de Entorno

### Opcion 1: Interfaz de n8n

En la interfaz web de n8n: **Settings > Environment Variables**

Agregar cada variable con su valor correspondiente al ambiente.

### Opcion 2: Docker Compose

En el archivo `docker-compose.yml`, dentro de la seccion del servicio `flows`:

```yaml
services:
  flows:
    image: n8nio/n8n
    environment:
      - API_TOKEN=${BOKI_API_TOKEN}
      - API_URL=https://boki-api.${DOMAIN_NAME}
      - WEBHOOK_URL=https://flows.${DOMAIN_NAME}
```

De esta forma, las variables de n8n se alimentan de las variables del archivo `.env` del proyecto.

### Opcion 3: Archivo .env de n8n

Si n8n se configura con un archivo `.env` propio:

```env
API_TOKEN=tu-token-seguro
API_URL=https://boki-api.solercia.com.co
WEBHOOK_URL=https://flows.solercia.com.co
```

---

## Verificacion Rapida

Para verificar que un flujo JSON no contiene URLs o tokens hardcodeados, buscar estos patrones que NO deberian existir:

```bash
# Buscar URLs hardcodeadas de produccion
grep -n "solercia.com.co" flujo.json

# Buscar posibles tokens hardcodeados (cadenas largas alfanumericas)
grep -nE '"[A-Za-z0-9]{30,}"' flujo.json

# Verificar que se usan variables de entorno
grep -c '\$env\.' flujo.json
# El resultado debe ser > 0 si el flujo llama a APIs externas
```

---

## Resumen

| Elemento | Patron Correcto | Patron Incorrecto |
|---|---|---|
| URL de boki-api | `{{ $env.API_URL }}/api/v1/...` | `https://boki-api.solercia.com.co/api/v1/...` |
| URL de webhooks | `{{ $env.WEBHOOK_URL }}/webhook/...` | `https://flows.solercia.com.co/webhook/...` |
| Token API | `{{ $env.API_TOKEN }}` | `SMFGAHDJVqUr2xWifzjpLWC66qdNCPjFGonBROOKs` |
| Credenciales de BD | Sistema de credenciales de n8n | Cadena de conexion en el nodo |
| API Key de OpenAI | Sistema de credenciales de n8n | API key en texto plano |
