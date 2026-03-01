# Analisis Completo: n8n Flujos de Automatizacion

**Fecha de analisis:** 2026-03-01
**Ubicacion:** n8n-flujos/
**Total de flujos:** 5

---

## 1. Resumen Ejecutivo

Los flujos de n8n constituyen el motor de automatizacion del ecosistema Solercia/Boki, gestionando la interaccion con usuarios via WhatsApp, agendamiento inteligente de citas con IA, registro de clientes, respuestas a preguntas frecuentes y control de consumo de tokens. La arquitectura es solida (8/10) pero presenta deficiencias criticas en seguridad (4/10), manejo de errores (3/10) y testing (0/10).

---

## 2. Inventario de Flujos

| # | Flujo | Archivo | Funcion Principal |
|---|---|---|---|
| 1 | MainFlow | MainFlow.json | Ingestion de mensajes WhatsApp, gestion de sesiones, enrutamiento a sub-flujos |
| 2 | AppointmentFlow | AppointmentFlow.json | Agendamiento de citas con IA usando OpenAI gpt-5-nano |
| 3 | RegisterClient | RegisterClient.json | Registro de clientes en 2 pasos (cedula + nombre) |
| 4 | FlowFaqs | FlowFaqs.json | Clasificacion de intenciones, recuperacion de FAQs, generacion de respuestas con IA |
| 5 | Control-Tokens | Control-Tokens.json | Seguimiento de uso de tokens por sesion |

---

## 3. Analisis Detallado por Flujo

### 3.1 MainFlow

**Funcion:** Punto de entrada principal para mensajes de WhatsApp.

**Flujo de ejecucion:**
1. Recibe mensaje via webhook de WhatsApp
2. Gestiona sesiones de usuario
3. Determina el contexto/estado del usuario
4. Enruta al sub-flujo correspondiente (FAQs, Registro, Agendamiento)
5. Retorna respuesta al usuario

**Componentes clave:**
- Webhook de ingestion
- Gestion de estado de sesion
- Router/Switch de flujos
- Respuesta via API de WhatsApp

### 3.2 AppointmentFlow

**Funcion:** Agendamiento inteligente de citas con profesionales.

**Componentes clave:**
- **OpenAI gpt-5-nano**: Modelo de IA para conversacion natural sobre citas
- **Contexto de profesionales**: Informacion de disponibilidad y especialidades
- **LangChain Memory**: Memoria de conversacion para continuidad
- **Logica de disponibilidad**: Verificacion de horarios y slots disponibles

**Flujo de ejecucion:**
1. Recibe solicitud de cita del MainFlow
2. Carga contexto del profesional (especialidad, horarios)
3. Usa LangChain memory para mantener contexto de conversacion
4. OpenAI gpt-5-nano genera respuestas naturales
5. Valida disponibilidad en base de datos
6. Confirma y crea la cita

### 3.3 RegisterClient

**Funcion:** Registro de nuevos clientes en proceso de 2 pasos.

**Flujo de ejecucion:**
1. **Paso 1:** Solicita y valida numero de cedula
2. **Paso 2:** Solicita y registra nombre completo
3. Crea el registro en la base de datos
4. Retorna confirmacion

**Caracteristicas:**
- Validacion de formato de cedula
- Verificacion de duplicados
- Flujo conversacional simple y directo

### 3.4 FlowFaqs

**Funcion:** Respuestas inteligentes a preguntas frecuentes.

**Flujo de ejecucion:**
1. Recibe pregunta del usuario
2. Clasifica la intencion del mensaje
3. Recupera FAQs relevantes de la base de datos
4. Genera respuesta con IA usando contexto de FAQs
5. Retorna respuesta natural al usuario

**Problema identificado:**
- **Wait de 3 segundos innecesario** en el flujo que agrega latencia sin justificacion tecnica

### 3.5 Control-Tokens

**Funcion:** Seguimiento y control de consumo de tokens de IA.

**Componentes:**
- Tabla `SessionControlTokens` para tracking
- Registro de tokens consumidos por sesion
- **Limitacion:** No implementa limite por request, solo tracking

---

## 4. Evaluacion por Area

| Area | Puntuacion | Justificacion |
|---|---|---|
| **Arquitectura** | 8/10 | Buena separacion de responsabilidades, flujos modulares, patron de sub-flujos |
| **Seguridad** | 4/10 | SQL injection, tokens hardcodeados, webhooks sin proteccion |
| **Manejo de errores** | 3/10 | Minimo manejo de errores, sin fallbacks, sin reintentos |
| **Testing** | 0/10 | No hay tests de ningun tipo |
| **Rendimiento** | 6/10 | Wait innecesario de 3s, consultas no optimizadas |
| **Mantenibilidad** | 7/10 | Estructura clara pero falta documentacion interna |

---

## 5. Hallazgos Criticos de Seguridad

### 5.1 Inyeccion SQL

| Severidad | Descripcion |
|---|---|
| **CRITICA** | Consultas SQL sin parametrizar en multiples flujos. Las entradas del usuario se concatenan directamente en strings SQL, permitiendo inyeccion SQL. |

**Ejemplo de riesgo:**
```sql
-- Vulnerable: entrada del usuario directamente en la consulta
SELECT * FROM clients WHERE cedula = '${userInput}'

-- Deberia ser parametrizado:
SELECT * FROM clients WHERE cedula = $1
```

### 5.2 Credenciales Hardcodeadas

| Severidad | Descripcion |
|---|---|
| **CRITICA** | API tokens y credenciales embebidos directamente en los archivos JSON de los flujos |

### 5.3 Webhook UUIDs Hardcodeados

| Severidad | Descripcion |
|---|---|
| **ALTA** | UUIDs de webhooks hardcodeados en los flujos, lo que dificulta rotacion y expone rutas predecibles |

---

## 6. Problemas de Rendimiento

| Problema | Ubicacion | Impacto |
|---|---|---|
| Wait de 3 segundos innecesario | FlowFaqs | Agrega 3s de latencia a cada consulta de FAQ sin razon tecnica |
| Consultas SQL no optimizadas | Multiples flujos | Potencial impacto en carga alta |

---

## 7. Gestion de Tokens

| Aspecto | Estado |
|---|---|
| Tracking por sesion | Implementado via SessionControlTokens |
| Limite por request | **No implementado** |
| Limite por sesion | Parcial (tracking sin enforcement) |
| Alerta de consumo | No implementado |
| Dashboard de uso | No implementado |

---

## 8. Recomendaciones

### Prioridad Critica (Seguridad)

1. **Parametrizar TODAS las consultas SQL** - Riesgo de inyeccion SQL activo
2. **Remover credenciales hardcodeadas** - Usar credenciales de n8n nativas
3. **Asegurar webhooks** - Implementar validacion de firma/token en webhooks
4. **Rotar webhook UUIDs** - Generar nuevos UUIDs y usar configuracion dinamica

### Prioridad Alta

5. **Remover wait de 3 segundos** en FlowFaqs
6. **Implementar manejo de errores** en cada flujo (try/catch, fallbacks)
7. **Agregar limites por request** en control de tokens
8. **Implementar reintentos** para llamadas a APIs externas (OpenAI, WhatsApp)

### Prioridad Media

9. Agregar logging estructurado en cada paso critico
10. Implementar circuit breaker para dependencias externas
11. Crear flujo de monitoreo/alertas
12. Documentar flujos con notas dentro de n8n

### Prioridad Baja

13. Crear tests de integracion para flujos
14. Implementar versionado de flujos
15. Crear dashboard de metricas de uso

---

## 9. Diagrama de Arquitectura

```
                    WhatsApp API
                         |
                    [MainFlow]
                    /    |    \
                   /     |     \
    [RegisterClient] [FlowFaqs] [AppointmentFlow]
                         |            |
                         |      [OpenAI gpt-5-nano]
                         |      [LangChain Memory]
                         |
                   [Control-Tokens]
                         |
                   [PostgreSQL DB]
```

---

## 10. Conclusion

Los flujos de n8n demuestran una arquitectura bien pensada con buena separacion de responsabilidades y uso innovador de IA (gpt-5-nano con LangChain memory). Sin embargo, las deficiencias de seguridad son criticas y deben abordarse antes de cualquier exposicion a produccion. La inyeccion SQL y las credenciales hardcodeadas representan riesgos inmediatos que podrian comprometer datos de usuarios y la integridad del sistema.

---

*Analisis generado el 2026-03-01 por Claude Code*
