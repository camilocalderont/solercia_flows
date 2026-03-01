# Plan Maestro - BokiBot by Solercia
## Fecha: 2026-03-01
## Version: 1.0

---

## Vision
BokiBot es un chatbot WhatsApp SaaS para agendamiento de citas y FAQs con IA, enfocado inicialmente en el nicho de salud (consultorios dentales) en Bogota, Colombia.

## Modelo de Negocio
- **Tipo**: B2B SaaS
- **Nicho primario**: Salud (odontologia, medicina general)
- **Nicho secundario**: Belleza (peluquerias, spas, barberias)
- **Pricing**: 3 tiers ($12, $30, $60 USD/mes aprox.)

---

## Fases de Implementacion

### FASE 1: ANALISIS Y DOCUMENTACION (Sesion Actual)
**Estado**: COMPLETADA
**Duracion**: ~10 minutos

**Entregables**:
- [x] Analisis de 6 subproyectos (boki-api, boki-bot, boki-front, solercia-web, n8n-flujos, infraestructura)
- [x] Modelo de datos documentado (31 entidades PG + 4 MongoDB)
- [x] Investigacion de mercado (Google Trends, GitHub, NPM, competidores)
- [x] Reporte de mercado con recomendaciones
- [x] Skill de market research reutilizable
- [x] Analisis de ramas y versiones
- [x] AGENTS.md con roles y convenciones
- [x] Identificacion de 8+ hallazgos criticos de seguridad
- [x] BLOQUEANTES.md actualizado

### FASE 2: ARQUITECTURA Y SEGURIDAD (Sesion Actual)
**Estado**: EN PROGRESO
**Objetivo**: Corregir fundamentos antes de construir

**Tareas**:
- [ ] Plan Maestro documentado
- [ ] Diagrama C4 del sistema
- [ ] Limpiar credenciales expuestas de TAREAS.md
- [ ] Mover API key Gemini a .env
- [ ] Documentar .env.example actualizado
- [ ] Preparar docker-compose para variables de entorno

### FASE 3: MVP-1 - PRODUCTO MINIMO VENDIBLE
**Estimado**: 1-2 semanas
**Objetivo**: Un chatbot WhatsApp funcional que se pueda demostrar

**Componentes MVP-1**:
1. **n8n flujos v2**: Queries parametrizadas, error handling, tokens seguros
2. **boki-api estable**: Endpoints core funcionando, auth seguro, CORS restringido
3. **solercia-web con chatbot**: Widget de chatbot en la pagina web
4. **Docker unificado**: Todos los servicios levantando sin errores
5. **Demo flow**: Un flujo de agendamiento completo (registro -> servicio -> cita -> confirmacion)

**Criterios de Aceptacion**:
- Un usuario puede hablar por WhatsApp y agendar una cita completa
- Las FAQs responden con IA basandose en datos de la empresa
- El admin (boki-front) puede ver las citas agendadas
- Todos los servicios corren en Docker sin credenciales expuestas

### FASE 4: BETA - PRIMER CLIENTE REAL
**Estimado**: 2-3 semanas despues de MVP-1
**Objetivo**: Validar con un cliente real (consultorio dental en Bogota)

**Tareas**:
1. Onboarding automatizado (subir FAQs por Excel/Word)
2. Panel admin funcional (boki-front) con stats reales
3. Integracion con Google Calendar
4. Notificaciones de citas (recordatorios por WhatsApp)
5. Metricas de uso (tokens, conversaciones, citas)
6. Pruebas end-to-end con Playwright

### FASE 5: LANZAMIENTO COMERCIAL
**Estimado**: 1-2 meses despues de Beta
**Objetivo**: Onboarding self-service, pricing, pagos

**Tareas**:
1. Landing page con pricing y demos
2. Sistema de pagos (Stripe, MercadoPago)
3. Onboarding self-service (crear cuenta -> configurar bot -> activar)
4. Multi-tenancy robusto
5. Campanas de marketing (presupuesto: $5.5M COP/mes)
6. Soporte al cliente (WhatsApp Business, email)

### FASE 6: ESCALAMIENTO
**Estimado**: 3-6 meses despues de lanzamiento
**Objetivo**: Crecer en clientes y features

**Tareas**:
1. Segundo nicho (belleza)
2. Integraciones adicionales (Instagram, Telegram)
3. Analytics avanzados con Grafana
4. AI mejorada (GPT-4o, respuestas mas contextuales)
5. Marketplace de templates de flujos
6. API publica para integraciones de terceros

---

## Prioridades de Seguridad (Pre-MVP)

| # | Accion | Impacto | Esfuerzo |
|---|--------|---------|----------|
| 1 | Rotar todos los tokens expuestos | CRITICO | 30 min |
| 2 | Quitar credenciales de git history | CRITICO | 1 hora |
| 3 | Migrar passwords a .env | ALTO | 30 min |
| 4 | Parametrizar queries SQL en n8n | ALTO | 2 horas |
| 5 | Restringir CORS en boki-api | MEDIO | 30 min |
| 6 | Cerrar puerto PostgreSQL 5433 | MEDIO | 5 min |
| 7 | Implementar rate limiting | MEDIO | 2 horas |
| 8 | Fix JWT_SECRET config bug | ALTO | 15 min |

---

## Metricas de Exito

### MVP-1
- Docker compose levanta sin errores
- Flujo de agendamiento completo por WhatsApp
- 0 credenciales expuestas
- Tiempo de respuesta < 5 segundos

### Beta
- 1 cliente real usando el sistema
- > 50 conversaciones procesadas
- > 10 citas agendadas
- Uptime > 99%

### Lanzamiento
- 10+ clientes pagando
- CAC < $50 USD
- MRR > $500 USD
- NPS > 50

---

## Stack Definitivo

| Componente | Tecnologia | Estado |
|------------|-----------|--------|
| Backend API | NestJS 11 + TypeScript | Existente (85%) |
| Workflows | n8n + OpenAI | Existente (75%) |
| Admin Frontend | Angular 20 + Material | Existente (70%) |
| Website | Angular 20 + Tailwind | Existente (45%) |
| Bot Legacy | Python + FastAPI | Existente (50%) - migrar a n8n |
| Base de datos | PostgreSQL 14.5 + MongoDB 7 | Existente |
| Infra | Docker + Traefik + Let's Encrypt | Existente |
| LLM | OpenAI (gpt-4o-mini / gpt-5-nano) | Existente |
| Monitoreo | Loki + Grafana (planificado) | Pendiente |
| Pagos | Stripe / MercadoPago | Pendiente |
