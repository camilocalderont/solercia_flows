# Patron Seguro: SQL en Flujos n8n

## Problema

Los nodos PostgreSQL de n8n ejecutan consultas como texto plano. Si se interpola directamente la entrada del usuario (mensajes de WhatsApp), se abre la puerta a inyeccion SQL.

---

## Patron Preferido: Usar Endpoints de boki-api

La mejor solucion es NO ejecutar SQL directo desde n8n. En su lugar, llamar a los endpoints REST de boki-api donde TypeORM usa consultas parametrizadas automaticamente.

### Ejemplo: Registrar un Mensaje en el Historial

**En lugar de** un nodo PostgreSQL con SQL directo:

```sql
-- INSEGURO: No hacer esto
INSERT INTO "MessageHistory" (vc_session_id, vc_message)
VALUES ('{{$node["Webhook"].json.body.sessionId}}', '{{$node["Webhook"].json.body.user_message}}')
```

**Usar** un nodo HTTP Request hacia boki-api:

```json
{
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "={{ $env.API_URL }}/api/v1/chat/message",
    "method": "POST",
    "sendHeaders": true,
    "specifyHeaders": "json",
    "jsonHeaders": "{\n  \"x-api-token\": \"{{ $env.API_TOKEN }}\"\n}",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "sessionId",
          "value": "={{ $node['Webhook'].json.body.sessionId }}"
        },
        {
          "name": "message",
          "value": "={{ $node['Webhook'].json.body.user_message }}"
        }
      ]
    }
  }
}
```

En boki-api, TypeORM parametriza automaticamente:

```typescript
// boki-api - El servicio usa TypeORM que parametriza la consulta
await this.messageHistoryRepo.save({
  VcSessionId: dto.sessionId,
  VcMessage: dto.message, // Valor seguro, parametrizado por TypeORM
});
```

---

## Patron Alternativo: Validacion Previa en Nodo Code

Cuando no exista un endpoint en boki-api y debas usar SQL directo, **siempre** interponer un nodo Code que valide y sanitice la entrada.

### Ejemplo: Validar Cedula (Solo Numeros)

**Nodo 1: Code - "ValidarCedula"**

```javascript
const userInput = $node["Webhook"].json.body.user_message;

// Validar que solo contenga numeros
if (!/^[0-9]{5,15}$/.test(userInput)) {
  return [{
    json: {
      valid: false,
      error: "La cedula debe contener solo numeros (5-15 digitos)"
    }
  }];
}

return [{
  json: {
    valid: true,
    sanitized_cedula: userInput
  }
}];
```

**Nodo 2: If - "EsCedulaValida"**

```
Condicion: {{ $json.valid === true }}
  -> true: Continua al nodo SQL
  -> false: Responde con mensaje de error al usuario
```

**Nodo 3: PostgreSQL - "BuscarClientePorCedula"** (solo si paso la validacion)

```sql
SELECT * FROM "Client"
WHERE vc_identification_number = '{{ $node["ValidarCedula"].json.sanitized_cedula }}'
```

### Ejemplo: Validar Nombre (Solo Letras y Espacios)

**Nodo Code - "ValidarNombre"**

```javascript
const userInput = $node["Webhook"].json.body.user_message;

// Validar que solo contenga letras, espacios y tildes
if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,100}$/.test(userInput)) {
  return [{
    json: {
      valid: false,
      error: "El nombre solo puede contener letras y espacios"
    }
  }];
}

// Escapar comillas simples como proteccion adicional
const sanitized = userInput.replace(/'/g, "''");

return [{
  json: {
    valid: true,
    sanitized_name: sanitized
  }
}];
```

---

## Patron: Sanitizacion General para Texto Libre

Cuando se necesite almacenar texto libre (como mensajes de chat), y no sea posible usar un endpoint de boki-api:

**Nodo Code - "SanitizarTexto"**

```javascript
const userInput = $node["Webhook"].json.body.user_message || '';

// Limitar longitud
const trimmed = userInput.substring(0, 500);

// Escapar comillas simples (proteccion basica contra SQL injection)
const sanitized = trimmed.replace(/'/g, "''");

// Remover caracteres de control y null bytes
const cleaned = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

return [{
  json: {
    sanitized_message: cleaned,
    original_length: userInput.length,
    was_truncated: userInput.length > 500
  }
}];
```

---

## Resumen de la Estrategia de Mitigacion

| Prioridad | Estrategia | Proteccion |
|---|---|---|
| 1 (Mejor) | Usar endpoints de boki-api con TypeORM | Parametrizacion completa automatica |
| 2 | Validar formato con regex + nodo If | Rechaza entradas que no cumplen el patron |
| 3 | Escapar comillas simples en nodo Code | Proteccion basica contra inyeccion |
| 4 (Peor) | Interpolar directamente sin validacion | SIN PROTECCION - nunca hacer esto |

---

## Flujo de Decision

```
Necesito ejecutar una operacion en la BD?
  |
  +-> Existe un endpoint en boki-api?
  |     +-> SI: Usar nodo HTTP Request -> endpoint boki-api
  |     +-> NO: Crear el endpoint en boki-api (recomendado)
  |               |
  |               +-> No es posible crear el endpoint ahora?
  |                     +-> Agregar nodo Code de validacion ANTES del nodo PostgreSQL
  |                     +-> Validar formato con regex
  |                     +-> Escapar comillas simples
  |                     +-> Usar nodo If para rechazar entrada invalida
```
