# Estado del Proyecto - 2026-03-01

## Resumen de Repositorios y Versiones

| Repo | Tipo | Rama activa | Version | Stack | Completitud |
|------|------|-------------|---------|-------|-------------|
| solercia_flows | Monorepo principal | main | N/A | Docker + Traefik + n8n | 70% |
| boki-api | Repo independiente | master | 1.0.0 | NestJS 11 + TypeScript 5.5 + PostgreSQL + MongoDB | 85% |
| boki-bot | Repo independiente | flujos_quemados_whatsapp | N/A | Python + FastAPI | 50% |
| boki-front | Repo independiente | master | 0.0.0 | Angular 20 + Material + Tailwind | 70% |
| solercia-web | Parte del monorepo | main | 0.0.0 | Angular 20.1 + Tailwind | 55% |
| n8n-flujos | Parte del monorepo | main | v2 | n8n + OpenAI | 80% |

## Ramas por Repositorio

### boki-api (5 ramas)
- **master** (activa): API funcional con auth JWT + API tokens, endpoints CRUD, OpenAI, Swagger
- **Developer**: Integracion MongoDB para contactos y estados de conversacion
- **Luisito**: Scheduling de frecuencia, logica de disponibilidad profesional
- **joi-pipes**: Refactor de validaciones con Joi
- **monorepo**: Intento de reestructura como monorepo (stale)

### boki-bot (2 ramas)
- **flujos_quemados_whatsapp** (activa): Flujos hardcoded con AI para appointment
- **master**: Version base

### boki-front (2 ramas)
- **master** (activa): Admin frontend con CRUD completo
- **pnmc**: Rama secundaria

### solercia_flows (2 ramas)
- **main** (activa): Monorepo con docker-compose, n8n flujos, web
- **agitated-khorana**: Rama secundaria (no accesible)

## Progreso de la Sesion Autonoma

### FASE 0: Bootstrap - COMPLETADA
- Directorios creados
- Timing configurado
- Inventario (198 archivos)
- Bloqueantes documentados

### FASE 1: Analisis Profundo - COMPLETADA
- [x] 1.1 Analisis de subproyectos (boki-api, boki-bot, boki-front, solercia-web)
- [x] 1.2 Analisis de flujos n8n (5 flujos analizados)
- [x] 1.3 Modelo de datos (31 entidades PostgreSQL + 4 colecciones MongoDB)
- [x] 1.4 Investigacion de mercado (Google Trends, GitHub, competidores, NPM)
- [x] 1.5 Skill reutilizable de Market Research
- [x] Compilacion de reporte de mercado final
- [x] Escritura de reportes de analisis en ./claude-analisis/

### FASE 2: Arquitectura y Planificacion - COMPLETADA
- [x] AGENTS.md con roles y convenciones
- [x] Plan Maestro en docs/phases/PLAN-MAESTRO.md
- [x] C4 diagramas en docs/c4/C4-SISTEMA.md
- [x] ESTADO.md y BLOQUEANTES.md actualizados

### FASE 3: Implementacion MVP-1 - COMPLETADA
- [x] 3.1 Docker Compose seguro:
  - MongoDB credentials movidas a .env (eliminadas hardcoded `admin:admin123F`)
  - MONGO_URI usa variables de entorno
  - PostgreSQL port 5433 ya no expuesto externamente
  - .env.example actualizado con TODAS las variables necesarias
- [x] 3.2 Frontend + chatbot widget:
  - Componente ChatbotWidgetComponent creado para solercia-web
  - Integrado en app.html como widget flotante global
  - HttpClient provisto en app.config.ts
  - API key Gemini removida de TAREAS.md → movida a .env
- [x] 3.3 Flujos n8n v2 limpiados:
  - 5 flows JSON en n8n-flujos/v2/
  - API token hardcoded eliminado (SMFGAHDJVqUr...BROOKs)
  - URLs hardcodeadas reemplazadas por env vars
  - SQL injection risks documentados en CHANGELOG.md
- [x] 3.4 Smoke tests:
  - Script tests/smoke-test.sh (ejecutable)
  - Verifica: contenedores, endpoints HTTP, databases, SSL, red Docker, seguridad

### HALLAZGOS CRITICOS DE SEGURIDAD
1. ~~API Key Gemini expuesta en TAREAS.md~~ **CORREGIDO** (removida del archivo)
2. ~~PostgreSQL password hardcodeado en docker-compose.yml~~ **YA USABA .env**
3. boki-bot .env con Meta Token y OpenAI Key expuestos → PENDIENTE HUMANO
4. ~~API tokens expuestos en flujos n8n~~ **CORREGIDO** en v2
5. SQL Injection en queries de n8n → DOCUMENTADO, migrar a API endpoints
6. JWT_SECRET lee de variable equivocada en config.ts → PENDIENTE
7. CORS sin restricciones en boki-api → PENDIENTE
8. Semantic search endpoint es publico → PENDIENTE
9. ~~MongoDB credentials hardcoded en docker-compose.yml~~ **CORREGIDO**

### FASES PENDIENTES
- FASE 4: Cierre y documentacion final
