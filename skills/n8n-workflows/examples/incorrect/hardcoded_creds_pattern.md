# Anti-Patron: Credenciales y URLs Hardcodeadas en Flujos n8n

## Descripcion del Problema

Cuando se incrustan tokens de API, API keys o URLs de servicios directamente en el JSON del flujo n8n, se generan multiples riesgos:

1. **Exposicion de secretos:** Si el archivo JSON se sube a un repositorio Git (aunque sea privado), las credenciales quedan en el historial para siempre
2. **Imposibilidad de rotar credenciales:** Cambiar un token requiere editar manualmente cada nodo en cada flujo que lo use
3. **Sin soporte multi-ambiente:** La misma URL hardcodeada de produccion no sirve para desarrollo o staging
4. **Riesgo de filtracion:** Cualquier persona con acceso al repositorio o a los backups de n8n obtiene acceso completo a las APIs

---

## Ejemplo Real: Token de API Hardcodeado

### Codigo Incorrecto (encontrado en AppointmentFlow.json v1)

```json
{
  "type": "n8n-nodes-base.httpRequest",
  "name": "Professional-Context",
  "parameters": {
    "url": "https://boki-api.solercia.com.co/api/v1/professional/company/{{$node['DataSession'].json.company_id}}/agent",
    "sendHeaders": true,
    "specifyHeaders": "json",
    "jsonHeaders": "{\n  \"x-api-token\": \"SMFGAHDJVqUr2xWifzjpLWC66qdNCPjFGonBROOKs\",\n  \"x-api-key\": \"n8n_prod_8K9mP2vL5xQ7wR4nT6yU3oI1aS0dF9gH...\"\n}"
  }
}
```

### Problemas

| Problema | Detalle |
|---|---|
| Token `x-api-token` en texto plano | `SMFGAHDJVqUr2xWifzjpLWC66qdNCPjFGonBROOKs` visible en el JSON |
| Token `x-api-key` en texto plano | `n8n_prod_8K9mP2vL5xQ7wR4nT6yU3oI1aS0dF9gH...` visible en el JSON |
| URL de produccion hardcodeada | `https://boki-api.solercia.com.co` fija en el flujo |

### Codigo Correcto (v2 corregido)

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

---

## Ejemplo Real: URLs de Webhooks Hardcodeadas

### Codigo Incorrecto (encontrado en MainFlow.json v1)

```json
{
  "type": "n8n-nodes-base.httpRequest",
  "name": "FaqsFlow",
  "parameters": {
    "url": "https://flows.solercia.com.co/webhook/abc12345-6789-4def-abcd-123456789abc",
    "method": "POST"
  }
}
```

```json
{
  "type": "n8n-nodes-base.httpRequest",
  "name": "RegisterFlow",
  "parameters": {
    "url": "https://flows.solercia.com.co/webhook/def12345-6789-4abc-defg-123456789def",
    "method": "POST"
  }
}
```

```json
{
  "type": "n8n-nodes-base.httpRequest",
  "name": "AppointmentFlow",
  "parameters": {
    "url": "https://flows.solercia.com.co/webhook/7e145415-70db-43da-8158-7ae12133f8c4",
    "method": "POST"
  }
}
```

### Problemas

| Problema | Impacto |
|---|---|
| URL de produccion repetida 3+ veces | Cambiar el dominio requiere editar cada nodo manualmente |
| Sin soporte para desarrollo local | Imposible probar flujos apuntando a `localhost:5678` |
| Acoplamiento rigido | Si el dominio de n8n cambia, todos los flujos se rompen |

### Codigo Correcto (v2 corregido)

```json
{
  "type": "n8n-nodes-base.httpRequest",
  "name": "FaqsFlow",
  "parameters": {
    "url": "={{ $env.WEBHOOK_URL }}/webhook/abc12345-6789-4def-abcd-123456789abc",
    "method": "POST"
  }
}
```

---

## Ejemplo Real: Multiples Nodos con el Mismo Token

### Codigo Incorrecto

En AppointmentFlow.json v1, el mismo token aparecia en 2 nodos diferentes:

```json
// Nodo Professional-Context
"jsonHeaders": "{ \"x-api-token\": \"SMFGAHDJVqUr2xWifzjpLWC66qdNCPjFGonBROOKs\" }"

// Nodo CreateAppointment
"jsonHeaders": "{ \"x-api-token\": \"SMFGAHDJVqUr2xWifzjpLWC66qdNCPjFGonBROOKs\" }"
```

Si el token se rota, hay que encontrar y actualizar CADA instancia en CADA flujo. Con variables de entorno, se cambia en un solo lugar.

---

## Impacto Real en BokiBot

### Lo Que Paso

En la version v1 de los flujos, se encontraron:

| Hallazgo | Cantidad | Archivo Afectado |
|---|---|---|
| Token `x-api-token` hardcodeado | 2 instancias | AppointmentFlow.json |
| Token `x-api-key` hardcodeado | 2 instancias | AppointmentFlow.json |
| URL `boki-api.solercia.com.co` hardcodeada | 2 instancias | AppointmentFlow.json |
| URL `flows.solercia.com.co` hardcodeada | 4 instancias | MainFlow.json (3), FlowFaqs.json (1) |

Todos estos valores fueron reemplazados en la version v2 con las variables de entorno correspondientes.

### Lo Que Podria Haber Pasado

1. Alguien clona el repositorio -> tiene acceso al token de produccion de boki-api
2. Con el token puede llamar a cualquier endpoint del API sin restriccion
3. Puede leer datos de todos los clientes, crear citas falsas, modificar registros
4. El token queda en el historial de Git incluso si se elimina despues

---

## Como Detectar Este Anti-Patron

### Busqueda Automatica en Archivos JSON

```bash
# Buscar URLs hardcodeadas de produccion
grep -rn "solercia.com.co" n8n-flujos/*.json

# Buscar posibles tokens (cadenas alfanumericas largas entre comillas)
grep -rnE '"[A-Za-z0-9_]{25,}"' n8n-flujos/*.json | grep -v '"id"' | grep -v '"name"'

# Verificar que los flujos USAN variables de entorno
grep -c '\$env\.' n8n-flujos/v2/*.json
```

### Que Buscar en una Revision de Flujo

- Cualquier URL que empiece con `https://` o `http://` en un nodo HTTP Request (debe ser `{{ $env.* }}`)
- Cualquier string alfanumerico largo en un header (debe ser `{{ $env.* }}`)
- Headers `Authorization`, `x-api-token`, `x-api-key`, `Bearer` con valores literales

---

## Solucion

Consultar el patron correcto en: `examples/correct/env_vars_pattern.md`

Resumen:
1. **Configurar variables de entorno** en n8n: `API_TOKEN`, `API_URL`, `WEBHOOK_URL`
2. **Referenciar con** `{{ $env.VARIABLE }}` en todos los nodos
3. **Usar el sistema de credenciales** de n8n para PostgreSQL, OpenAI y WhatsApp
4. **Verificar antes de commit** que ningun JSON contenga tokens o URLs de produccion en texto plano
