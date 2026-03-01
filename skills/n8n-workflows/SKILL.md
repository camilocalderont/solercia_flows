---
name: n8n-workflows
description: >
  Estandar para desarrollo de flujos n8n en BokiBot: seguridad, env vars, SQL parametrizado, sub-flujos, OpenAI.
  Trigger: When creating or modifying n8n workflows, JSON flows, or webhook configurations.
metadata:
  author: solercia
  version: "1.0"
---

## Cuando Usar Este Skill

Aplica este estandar siempre que:

- Crees o modifiques archivos JSON de flujos n8n (en `n8n-flujos/`)
- Configures nodos HTTP Request, PostgreSQL, OpenAI o Webhook en n8n
- Integres sub-flujos entre si (MainFlow -> AppointmentFlow, FlowFaqs, etc.)
- Trabajes con la API de WhatsApp Cloud (Meta) dentro de n8n
- Configures nodos de LangChain/OpenAI para conversaciones con IA
- Revises o audites flujos existentes

---

## Variables de Entorno (CRITICO)

**REGLA:** Toda URL, token o credencial DEBE usar `{{ $env.VARIABLE }}`. Nunca valores literales en el JSON del flujo.

### Variables Requeridas

| Variable | Descripcion | Ejemplo |
|---|---|---|
| `API_TOKEN` | Token de autenticacion para boki-api (headers `x-api-token` y `x-api-key`) | `tu-token-seguro-aqui` |
| `API_URL` | URL base de boki-api (sin slash final) | `https://boki-api.solercia.com.co` |
| `WEBHOOK_URL` | URL base de n8n para webhooks entre flujos (sin slash final) | `https://flows.solercia.com.co` |

### Uso Correcto en Nodos HTTP Request

```json
{
  "url": "={{ $env.API_URL }}/api/v1/professional/company/{{$node['DataSession'].json.company_id}}/agent",
  "sendHeaders": true,
  "specifyHeaders": "json",
  "jsonHeaders": "{\n  \"x-api-token\": \"{{ $env.API_TOKEN }}\",\n  \"x-api-key\": \"{{ $env.API_TOKEN }}\"\n}"
}
```

### Uso Correcto en Llamadas a Sub-Flujos

```json
{
  "url": "={{ $env.WEBHOOK_URL }}/webhook/7e145415-70db-43da-8158-7ae12133f8c4",
  "method": "POST"
}
```

### Configuracion en n8n

Las variables de entorno se configuran en: **Settings > Environment Variables** dentro de la interfaz de n8n, o mediante las variables `N8N_*` en el `docker-compose.yml`.

---

## Seguridad SQL (CRITICO)

### REGLA PRINCIPAL: NUNCA interpolar entrada del usuario directamente en cadenas SQL

Los nodos PostgreSQL de n8n ejecutan consultas como texto plano. La interpolacion directa de datos del usuario (mensajes de WhatsApp, nombres, cedulas) permite inyeccion SQL.

### Patron Preferido: Usar Endpoints de boki-api

En lugar de ejecutar SQL directo desde n8n, llama a los endpoints REST de boki-api donde TypeORM usa consultas parametrizadas:

```
// CORRECTO: Llamar al API en lugar de SQL directo
Nodo HTTP Request -> POST {{ $env.API_URL }}/api/v1/clients
Body: { "vcIdentificationNumber": "{{ $node['DataClient'].json.cedula }}" }

// INCORRECTO: SQL directo con entrada del usuario
Nodo PostgreSQL -> INSERT INTO "Client" (vc_identification_number) VALUES ('{{ $node['DataClient'].json.user_message }}')
```

### Si el SQL Directo es Inevitable

Cuando no exista un endpoint en boki-api y debas usar el nodo PostgreSQL:

1. **Siempre validar el formato** con un nodo Code antes de la consulta SQL:

```javascript
// Nodo Code: Validar y sanitizar ANTES del nodo PostgreSQL
const userInput = $node["Webhook"].json.body.user_message;

// Validar formato esperado (ejemplo: solo numeros para cedula)
if (!/^[0-9]+$/.test(userInput)) {
  return [{ json: { error: "Formato invalido", valid: false } }];
}

// Escapar comillas simples como minimo
const sanitized = userInput.replace(/'/g, "''");

return [{ json: { sanitized_value: sanitized, valid: true } }];
```

2. **Usar el valor sanitizado** en el nodo PostgreSQL:

```sql
-- Usar el valor ya validado y sanitizado
INSERT INTO "MessageHistory" (vc_message)
VALUES ('{{ $node["Sanitizar"].json.sanitized_value }}')
```

### Patrones Inseguros vs Seguros

```sql
-- INSEGURO: Entrada directa del usuario (mensaje de WhatsApp)
INSERT INTO "MessageHistory" (vc_message)
VALUES ('{{$node["Webhook"].json.body.user_message}}')
-- Un usuario podria enviar: '); DROP TABLE "Session"; --

-- SEGURO: Validacion previa + sanitizacion en nodo Code
INSERT INTO "MessageHistory" (vc_message)
VALUES ('{{ $node["Sanitizar"].json.sanitized_value }}')

-- MEJOR: Usar endpoint de boki-api
-- POST /api/v1/chat/message con body JSON (TypeORM parametriza automaticamente)
```

### Nodos con Riesgo Identificado en Flujos Actuales

| Flujo | Nodo | Riesgo | Mitigacion |
|---|---|---|---|
| MainFlow | `Insert-User-Message` | ALTO - mensaje WhatsApp directo en INSERT | Migrar a endpoint boki-api |
| RegisterClient | `Update Cedula` | MITIGADO - regex `^[0-9]+$` previo | Mantener regex, considerar endpoint |
| RegisterClient | `Update Name` | MITIGADO - regex `^[a-zA-Z]+$` previo | Mantener regex, considerar endpoint |
| RegisterClient | `Insert New Client` | MEDIO - nick_name sin sanitizar | Agregar validacion |
| FlowFaqs | `Execute a SQL query4` | ALTO - user_message y vc_user_name directos | Migrar a endpoint boki-api |
| FlowFaqs | `Execute a SQL query5` | ALTO - salida LLM (intencion) en UPDATE | Validar formato de salida LLM |

---

## Gestion de Credenciales

### Reglas

1. **Usar el sistema de credenciales nativo de n8n** para servicios externos (OpenAI, PostgreSQL, WhatsApp)
2. **Nunca almacenar tokens en texto plano** dentro del JSON del flujo
3. **Los IDs de credenciales** (`"id": "Z2mTqwzFo4gFozil"`) son referencias internas de n8n y son seguros en el JSON
4. **Variables de entorno** (`{{ $env.API_TOKEN }}`) para tokens que se usan en headers HTTP personalizados

### Ejemplo: Credencial de PostgreSQL (correcto)

```json
{
  "credentials": {
    "postgres": {
      "id": "Z2mTqwzFo4gFozil",
      "name": "Boki"
    }
  }
}
```

La credencial real se gestiona en n8n: **Settings > Credentials > PostgreSQL**.

### Ejemplo: Credencial de OpenAI (correcto)

```json
{
  "credentials": {
    "openAiApi": {
      "id": "7yW7cPT4eB1hwRFr",
      "name": "OpenAi account"
    }
  }
}
```

El API key de OpenAI se configura dentro de n8n, nunca en el JSON del flujo.

---

## Comunicacion Entre Sub-Flujos

### Arquitectura de BokiBot

```
                WhatsApp API
                     |
                [MainFlow]
                /    |    \
               /     |     \
[RegisterClient] [FlowFaqs] [AppointmentFlow]
                     |
               [Control-Tokens]
```

### Patron: MainFlow Invoca Sub-Flujos via Webhook

El MainFlow actua como orquestador. Cada sub-flujo expone un webhook POST y retorna su respuesta:

**MainFlow (nodo HTTP Request):**
```json
{
  "url": "={{ $env.WEBHOOK_URL }}/webhook/<UUID_DEL_SUBFLUJO>",
  "method": "POST",
  "sendBody": true,
  "bodyParameters": {
    "sessionId": "={{ $json.sessionId }}",
    "company_id": "={{ $json.company_id }}",
    "user_message": "={{ $json.user_message }}",
    "vc_step": "={{ $json.vc_step }}",
    "client": "={{ $json.client }}"
  }
}
```

**Sub-Flujo (nodo Webhook + Respond to Webhook):**
```json
// Nodo Webhook (entrada)
{
  "httpMethod": "POST",
  "path": "7e145415-70db-43da-8158-7ae12133f8c4",
  "responseMode": "responseNode"
}

// Nodo Respond to Webhook (salida)
{
  "respondWith": "json",
  "responseBody": "={{ $node['NodoProcesamiento'].json }}"
}
```

### Datos Estandar Entre Flujos

Todo sub-flujo recibe como minimo:

| Campo | Tipo | Descripcion |
|---|---|---|
| `sessionId` | string | ID unico de la sesion activa |
| `company_id` | number | ID de la empresa |
| `user_message` | string | Mensaje del usuario de WhatsApp |
| `vc_step` | string | Paso actual del flujo |
| `client` | object | Datos del cliente (Id, vc_phone, vc_first_name, etc.) |

### Modo de Respuesta

Siempre usar `responseMode: "responseNode"` en el webhook del sub-flujo para tener control explicito sobre cuando y que se responde. Esto permite procesar toda la logica antes de enviar la respuesta al MainFlow.

---

## Integracion WhatsApp

### API de WhatsApp Cloud (Meta)

BokiBot recibe mensajes a traves del nodo **WhatsApp Trigger** de n8n, que usa la credencial OAuth de WhatsApp configurada en n8n.

### Estructura de Mensaje Entrante

```javascript
// Acceso a datos del mensaje entrante en nodos Code
const phoneNumber = $('InboundMessaage').item.json.messages?.[0]?.from;
const messageText = $('InboundMessaage').item.json.messages?.[0]?.text?.body;
const messageId = $('InboundMessaage').item.json.messages?.[0]?.id;
const phoneNumberId = $('InboundMessaage').item.json.metadata?.phone_number_id;
const waId = $('InboundMessaage').item.json.contacts?.[0]?.wa_id;
```

### Tipos de Mensaje Soportados

1. **Texto simple:** Respuesta directa con `text.body`
2. **Botones interactivos:** Hasta 3 botones con `interactive.button`
3. **Listas:** Menu desplegable con `interactive.list` (hasta 10 secciones, 10 items por seccion)

### Envio de Mensajes

Para enviar mensajes de vuelta al usuario, usar el nodo HTTP Request hacia la API de Meta:

```json
{
  "url": "https://graph.facebook.com/v21.0/{{ $env.WHATSAPP_PHONE_ID }}/messages",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer {{ $env.WHATSAPP_TOKEN }}"
  },
  "body": {
    "messaging_product": "whatsapp",
    "to": "{{ $json.phone_number }}",
    "type": "text",
    "text": { "body": "{{ $json.response_message }}" }
  }
}
```

---

## Nodos OpenAI / LLM

### Modelo Usado

BokiBot utiliza `gpt-5-nano` como modelo principal para:
- Agendamiento de citas (AppointmentFlow)
- Clasificacion de intenciones (FlowFaqs - ContextAgent)
- Generacion de respuestas naturales (FlowFaqs - GenradorMessage)

### Patron: Respuesta en JSON Estructurado

Cuando el LLM debe responder en formato JSON, incluir en el system prompt:

1. La estructura JSON esperada con tipos de datos
2. Ejemplos concretos de entrada/salida
3. La instruccion explicita: "Responde UNICAMENTE en formato JSON valido"

**Ejemplo del AppointmentFlow:**
```
FORMATO:
{
  "ServiceId": null o number,
  "ProfessionalId": null o number,
  "DtDate": null o "YYYY-MM-DD",
  "TStartTime": null o "HH:MM",
  "step": "nombre_del_step_actual",
  "message": "Tu mensaje amigable para el cliente aqui"
}
```

### Patron: Clasificacion de Intenciones

Usar un agente LangChain con output parser para clasificar intenciones del usuario:

```
CATEGORIAS:
{{ JSON.stringify($node["CompanyServices"].json.services) }}

ESPECIALES:
- welcome: saludos/presentaciones
- finish: despedidas/agradecimientos

FORMATO:
{"intencion": "categoria_o_welcome_o_finish", "idIntencion": numero_o_null}
```

### Memoria de Conversacion

Usar `memoryPostgresChat` (Postgres Chat Memory) para mantener contexto entre mensajes:

```json
{
  "sessionIdType": "customKey",
  "sessionKey": "={{ $('Webhook').first().json.body.sessionId }}",
  "tableName": "MessageHistory",
  "contextWindowLength": 10
}
```

- `contextWindowLength: 10` limita a los ultimos 10 mensajes para controlar consumo de tokens
- La tabla `MessageHistory` se comparte entre flujos

### Seguimiento de Tokens

El flujo **Control-Tokens** rastrea el consumo de tokens por sesion:

1. El sub-flujo que usa OpenAI termina su ejecucion
2. El MainFlow llama al webhook de Control-Tokens pasando `sessionId` y `executionId`
3. Control-Tokens consulta la API interna de n8n para obtener datos de la ejecucion
4. Extrae `promptTokens` y `completionTokens` de los nodos LLM
5. Inserta el total en la tabla `SessionControlTokens`

---

## Gestion de Sesiones

### Ciclo de Vida de una Sesion

1. **Creacion:** El MainFlow crea una sesion en la tabla `Session` cuando llega un mensaje sin sesion activa
2. **Tracking de estado:** El campo `vc_step` indica el paso actual del flujo (welcome, service_selection, etc.)
3. **Actualizacion:** Cada sub-flujo actualiza `vc_step` segun el progreso del usuario
4. **Finalizacion:** El step `finish` indica que la sesion termino

### Estructura de Sesion

```sql
-- Tabla Session
vc_session_id    -- UUID unico (formato: MP_<uuid>)
vc_step          -- Paso actual: welcome, service_selection, confirmed, finish, etc.
vc_phone         -- Telefono del usuario (wa_id)
vc_workflow_id   -- ID del workflow de n8n activo
dt_created_at    -- Timestamp de creacion
dt_updated_at    -- Timestamp de ultima actualizacion
```

### Generacion de Session ID

```javascript
// Patron usado en MainFlow - DataSession
function generateSessionId() {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return `MP_${uuid}`;
}
```

### Deteccion de Sesion Existente

El MainFlow consulta la ultima sesion del telefono y verifica si esta activa:

```sql
SELECT * FROM "Session" s
WHERE s.vc_phone = '{{ waId }}'
ORDER BY dt_created_at DESC
LIMIT 1
```

Si `vc_step != 'finish'` y la sesion existe, se reutiliza. Si no, se crea una nueva.

### Timeout de Sesiones

Actualmente no se implementa timeout automatico de sesiones. Se recomienda agregar:
- Un campo `dt_last_activity` actualizado en cada interaccion
- Un flujo cron que cierre sesiones inactivas por mas de 30 minutos
- O verificar la antiguedad de la sesion al consultar la ultima sesion activa

---

## Manejo de Errores

### Patron Try/Catch en n8n

n8n permite configurar comportamiento de error por nodo. Usar las opciones de error de cada nodo:

1. **Always Output Data:** Activar en nodos criticos para que el flujo continue incluso si el nodo falla

```json
{
  "name": "UltimaSession",
  "alwaysOutputData": true
}
```

2. **Error Workflow:** Configurar un flujo dedicado que se ejecute cuando cualquier flujo falla:
   - En Settings del flujo: configurar "Error Workflow"
   - El error workflow recibe el contexto del error y puede notificar al equipo

3. **Nodo If para Validar Respuestas:**

```javascript
// Despues de un nodo HTTP Request o PostgreSQL
// Nodo If: Verificar que la respuesta sea valida
{{ $json.data !== undefined && $json.data !== null }}
```

### Patron de Fallback

Para nodos criticos (OpenAI, API externa), implementar un camino alternativo:

```
[OpenAI Node] --exito--> [Procesar Respuesta]
      |
      +--error--> [Mensaje de Fallback] --> [Respond to Webhook]
                  "Lo siento, hubo un problema. Intenta de nuevo."
```

### Reintentos para APIs Externas

Configurar reintentos en nodos HTTP Request hacia APIs externas (OpenAI, Meta):

```json
{
  "options": {
    "retry": {
      "enabled": true,
      "maxRetries": 3,
      "retryInterval": 1000
    }
  }
}
```

---

## Estructura de Flujos

### Convencion de Nombres

| Elemento | Convencion | Ejemplo |
|---|---|---|
| Archivo JSON | PascalCase descriptivo | `AppointmentFlow.json`, `MainFlow.json` |
| Nombre del flujo | PascalCase | `AppointmentFlow`, `RegisterClient` |
| Nodos | PascalCase descriptivo | `DataSession`, `Professional-Context` |
| Webhooks | UUID auto-generado | `7e145415-70db-43da-8158-7ae12133f8c4` |
| Variables de entorno | UPPER_SNAKE_CASE | `API_TOKEN`, `WEBHOOK_URL` |

### Patron MainFlow -> Sub-Flujos

1. **MainFlow** es siempre el punto de entrada (recibe el webhook de WhatsApp)
2. Cada funcionalidad autonoma se implementa como un **sub-flujo** independiente
3. La comunicacion es via **webhooks HTTP POST**
4. Cada sub-flujo retorna su resultado al MainFlow que se encarga de enviar la respuesta final al usuario

### Organizacion de Archivos

```
n8n-flujos/
  MainFlow.json           # Version original (v1)
  AppointmentFlow.json
  RegisterClient.json
  FlowFaqs.json
  Control-Tokens.json
  v2/                     # Version con mejoras de seguridad
    MainFlow.json
    AppointmentFlow.json
    RegisterClient.json
    FlowFaqs.json
    Control-Tokens.json
    CHANGELOG.md
```

---

## Anti-Patrones

### 1. SQL con Entrada del Usuario Sin Validar

```sql
-- NUNCA hacer esto
INSERT INTO "MessageHistory" (vc_message)
VALUES ('{{$node["Webhook"].json.body.user_message}}')
```

El usuario puede enviar `'); DROP TABLE "Session"; --` y destruir datos.

### 2. Credenciales Hardcodeadas

```json
// NUNCA hacer esto
{
  "jsonHeaders": "{ \"x-api-token\": \"SMFGAHDJVqUr2xWifzjpLWC66qdNCPjFGonBROOKs\" }"
}
```

Si el JSON se sube a Git, las credenciales quedan expuestas.

### 3. URLs Hardcodeadas

```json
// NUNCA hacer esto
{
  "url": "https://boki-api.solercia.com.co/api/v1/professional"
}
```

Hace imposible desplegar en diferentes ambientes (desarrollo, staging, produccion).

### 4. Wait Innecesarios

```json
// EVITAR: agrega latencia sin justificacion
{
  "type": "n8n-nodes-base.wait",
  "parameters": { "amount": 3, "unit": "seconds" }
}
```

Solo usar waits cuando haya una razon tecnica real (rate limiting, esperar propagacion).

### 5. Nodos SQL Sin Nombre Descriptivo

```json
// EVITAR: nombres genericos
{ "name": "Execute a SQL query4" }

// CORRECTO: nombre que describe la operacion
{ "name": "InsertMessageHistory" }
```

### 6. Sin Manejo de Errores en Nodos Criticos

Cada nodo que llama a un servicio externo (API, base de datos, OpenAI) debe tener al menos `alwaysOutputData: true` o un camino de error alternativo.

---

## Checklist Antes de Desplegar un Flujo

### Seguridad
- [ ] Ninguna credencial hardcodeada en el JSON (tokens, API keys, passwords)
- [ ] Todas las URLs usan `{{ $env.VARIABLE }}` en lugar de valores literales
- [ ] Las consultas SQL que reciben entrada del usuario tienen validacion previa
- [ ] Los webhooks de sub-flujos usan UUIDs (no rutas predecibles)

### Variables de Entorno
- [ ] `API_TOKEN` configurado en n8n
- [ ] `API_URL` configurado en n8n
- [ ] `WEBHOOK_URL` configurado en n8n
- [ ] Todas las variables referenciadas en el flujo existen en la configuracion de n8n

### Estructura
- [ ] El flujo tiene un nombre descriptivo en PascalCase
- [ ] Los nodos tienen nombres descriptivos (no genericos como "Execute a SQL query4")
- [ ] El flujo sigue el patron MainFlow -> sub-flujo si es una nueva funcionalidad
- [ ] El sub-flujo usa `responseMode: "responseNode"` en su webhook

### Manejo de Errores
- [ ] Los nodos criticos tienen `alwaysOutputData: true` o caminos de error
- [ ] Las llamadas a APIs externas tienen configuracion de reintentos
- [ ] Existe al menos un mensaje de fallback si algo falla
- [ ] El flujo de error (Error Workflow) esta configurado

### OpenAI / LLM
- [ ] El system prompt especifica el formato de respuesta esperado
- [ ] Se incluyen ejemplos de entrada/salida en el prompt
- [ ] La memoria de conversacion tiene un `contextWindowLength` razonable (5-10)
- [ ] El flujo Control-Tokens se invoca despues de cada ejecucion con LLM

### Rendimiento
- [ ] No hay nodos Wait sin justificacion tecnica
- [ ] Las consultas SQL estan optimizadas (indices, limites)
- [ ] Se prefieren endpoints de boki-api sobre SQL directo

### Documentacion
- [ ] El CHANGELOG se actualizo con los cambios realizados
- [ ] Los nodos complejos tienen comentarios en nodos Sticky Note de n8n

## Keywords
n8n, workflows, flujos, webhook, whatsapp, sql, openai, langchain, session, tokens, boki, sub-flow
