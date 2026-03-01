# Estado del Proyecto - 2026-03-01

## Resumen de Repositorios y Versiones

| Repo | Tipo | Rama activa | Version | Stack | Completitud |
|------|------|-------------|---------|-------|-------------|
| solercia_flows | Monorepo principal | main | N/A | Docker + Traefik + n8n | 60% |
| boki-api | Repo independiente | master | 1.0.0 | NestJS 11 + TypeScript 5.5 + PostgreSQL + MongoDB | 85% |
| boki-bot | Repo independiente | flujos_quemados_whatsapp | N/A | Python + FastAPI | 50% |
| boki-front | Repo independiente | master | 0.0.0 | Angular 20 + Material + Tailwind | 70% |
| solercia-web | Parte del monorepo | main | 0.0.0 | Angular 20.1 + Tailwind | 45% |
| n8n-flujos | Parte del monorepo | main | N/A | n8n + OpenAI | 75% |

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

### FASE 1: Analisis Profundo - EN PROGRESO
- [x] 1.1 Analisis de subproyectos (boki-api, boki-bot, boki-front, solercia-web)
- [x] 1.2 Analisis de flujos n8n (5 flujos analizados)
- [x] 1.3 Modelo de datos (31 entidades PostgreSQL + 4 colecciones MongoDB)
- [x] 1.4 Investigacion de mercado (Google Trends, GitHub, competidores, NPM)
- [x] 1.5 Skill reutilizable de Market Research
- [ ] Compilacion de reporte de mercado final
- [ ] Escritura de reportes de analisis en ./claude-analisis/

### HALLAZGOS CRITICOS DE SEGURIDAD
1. API Key Gemini expuesta en TAREAS.md
2. PostgreSQL password hardcodeado en docker-compose.yml
3. boki-bot .env con Meta Token y OpenAI Key expuestos
4. API tokens expuestos en flujos n8n
5. SQL Injection en queries de n8n
6. JWT_SECRET lee de variable equivocada en config.ts
7. CORS sin restricciones en boki-api
8. Semantic search endpoint es publico

### FASES PENDIENTES
- FASE 2: Arquitectura y planificacion
- FASE 3: Implementacion MVP-1
- FASE 4: Cierre y documentacion final
