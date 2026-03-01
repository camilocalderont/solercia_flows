# Anti-Patron: Inyeccion SQL en Flujos n8n

## Descripcion del Problema

Los nodos PostgreSQL de n8n ejecutan consultas como texto plano. Cuando se interpola directamente la entrada del usuario (mensajes de WhatsApp, nombres, cedulas) en la cadena SQL, un atacante puede manipular la consulta para leer, modificar o eliminar datos de la base de datos.

---

## Ejemplo Real: Insert de Mensaje de Usuario

### Codigo Vulnerable (encontrado en FlowFaqs.json)

```json
{
  "type": "n8n-nodes-base.postgres",
  "name": "Execute a SQL query4",
  "parameters": {
    "operation": "executeQuery",
    "query": "INSERT INTO \"MessageHistory\" (\n    vc_session_id,\n    vc_user_name,\n    vc_message\n) VALUES (\n    '{{$node[\"Webhook\"].json.body.sessionId}}',\n    '{{$node[\"Webhook\"].json.body.vc_user_name}}',\n    '{{$node[\"Webhook\"].json.body.user_message}}'\n) RETURNING *;"
  }
}
```

La consulta resultante es:

```sql
INSERT INTO "MessageHistory" (
    vc_session_id,
    vc_user_name,
    vc_message
) VALUES (
    '{{sessionId}}',
    '{{vc_user_name}}',
    '{{user_message}}'    -- PELIGRO: entrada directa del usuario
) RETURNING *;
```

### Escenario de Ataque

Un usuario envia este mensaje por WhatsApp:

```
'); DROP TABLE "Session"; --
```

La consulta ejecutada seria:

```sql
INSERT INTO "MessageHistory" (
    vc_session_id,
    vc_user_name,
    vc_message
) VALUES (
    'MP_abc123',
    'Juan',
    ''); DROP TABLE "Session"; --'
) RETURNING *;
```

Resultado: La tabla `Session` se elimina por completo, destruyendo todas las sesiones activas.

---

## Ejemplo Real: Update con Entrada del Usuario

### Codigo Vulnerable (encontrado en RegisterClient.json)

```json
{
  "type": "n8n-nodes-base.postgres",
  "name": "Update Cedula",
  "parameters": {
    "operation": "executeQuery",
    "query": "UPDATE \"Session\" SET vc_identification = '{{$node[\"DataClient\"].json.user_message}}' WHERE vc_session_id = '{{$node[\"DataClient\"].json.sessionId}}'"
  }
}
```

**Nota:** En RegisterClient, este nodo esta parcialmente mitigado por un nodo previo `Validate Cedula Input` que verifica `^[0-9]+$`. Sin embargo, si esa validacion se remueve o se modifica incorrectamente, la vulnerabilidad queda expuesta.

### Escenario de Ataque (si no hay validacion previa)

Un usuario envia:

```
' OR '1'='1'; UPDATE "Client" SET vc_email='atacante@evil.com' WHERE '1'='1
```

La consulta ejecutada seria:

```sql
UPDATE "Session"
SET vc_identification = '' OR '1'='1'; UPDATE "Client" SET vc_email='atacante@evil.com' WHERE '1'='1'
WHERE vc_session_id = 'MP_abc123'
```

Resultado: Todos los emails de todos los clientes se cambian al email del atacante.

---

## Ejemplo Real: Salida de LLM en SQL

### Codigo Vulnerable (encontrado en FlowFaqs.json)

```json
{
  "type": "n8n-nodes-base.postgres",
  "name": "Execute a SQL query5",
  "parameters": {
    "operation": "executeQuery",
    "query": "UPDATE \"Session\"\nSET \n  vc_step = '{{ $json.output.intencion }}',\n  dt_updated_at = NOW()\nWHERE vc_session_id = '{{$node[\"Webhook\"].json.body.sessionId}}';"
  }
}
```

Aqui `$json.output.intencion` es la salida del modelo de IA (LLM). Aunque el LLM deberia responder con una categoria predefinida, un prompt injection podria manipular la salida del LLM para incluir SQL malicioso.

### Escenario de Ataque (prompt injection -> SQL injection)

Un usuario envia un mensaje crafteado que logra que el LLM responda:

```json
{"intencion": "welcome'; DROP TABLE \"SessionControlTokens\"; --", "idIntencion": null}
```

La consulta ejecutada seria:

```sql
UPDATE "Session"
SET
  vc_step = 'welcome'; DROP TABLE "SessionControlTokens"; --',
  dt_updated_at = NOW()
WHERE vc_session_id = 'MP_abc123';
```

---

## Por Que Es Critico en BokiBot

1. **La entrada viene de WhatsApp:** Cualquier persona con el numero de telefono puede enviar mensajes arbitrarios
2. **No hay firewall de aplicacion:** Los mensajes llegan directamente al nodo PostgreSQL sin pasar por ninguna capa de validacion
3. **Acceso directo a la base de datos:** Los nodos PostgreSQL de n8n ejecutan las consultas con los mismos permisos que la conexion configurada
4. **Datos sensibles:** La base de datos contiene informacion personal de clientes (cedulas, telefonos, emails, nombres)

---

## Nodos Vulnerables Identificados

| Flujo | Nodo | Campo Peligroso | Severidad |
|---|---|---|---|
| MainFlow | `Insert-User-Message` | `messages[0].text.body` (mensaje WhatsApp) | ALTA |
| RegisterClient | `Insert New Client` | `vc_nick` (nickname de WhatsApp) | MEDIA |
| RegisterClient | `InsertHistory` | `text.body` (texto generado por sistema) | MEDIA |
| FlowFaqs | `Execute a SQL query4` | `user_message` y `vc_user_name` | ALTA |
| FlowFaqs | `Execute a SQL query5` | `output.intencion` (salida del LLM) | ALTA |
| FlowFaqs | `MessageSystem` | `output.message` (salida del LLM) | MEDIA |

---

## Solucion

Consultar el patron seguro en: `examples/correct/sql_safe_pattern.md`

Resumen:
1. **Preferir** llamar endpoints de boki-api (TypeORM parametriza automaticamente)
2. **Si es inevitable SQL directo:** interponer un nodo Code con validacion regex y escape de comillas simples
3. **Nunca** interpolar entrada de usuario directamente en cadenas SQL
