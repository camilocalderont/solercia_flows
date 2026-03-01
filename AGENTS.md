# AGENTS.md - BokiBot / Solercia Multi-Agent System

## Proyecto
**BokiBot** by Solercia Solutions SAS - Chatbot WhatsApp para agendamiento de citas y FAQs con IA.

## Stack Tecnologico
- **Backend**: NestJS 11 + TypeScript 5.5 (boki-api)
- **Bot Legacy**: Python + FastAPI (boki-bot)
- **Admin Frontend**: Angular 20 + Material + Tailwind (boki-front)
- **Website**: Angular 20.1 + Tailwind (solercia-web)
- **Workflows**: n8n con OpenAI integration
- **Base de datos**: PostgreSQL 14.5 + MongoDB 7
- **Infra**: Docker + Traefik + Let's Encrypt
- **LLM**: OpenAI (gpt-4o-mini, gpt-5-nano)

## Convenciones

### Git
- Conventional Commits: `feat(scope): descripcion`, `fix(scope): ...`, `docs(scope): ...`
- Ramas: `feat/nombre`, `fix/nombre`, `docs/nombre`
- Commits frecuentes por bloque completado
- Nunca commitear .env, credenciales, o API keys

### Backend (NestJS - boki-api)
- Tablas: PascalCase (`Company`, `Professional`)
- Columnas: snake_case con prefijo de tipo (`vc_email`, `in_id`, `b_is_active`, `dt_date`)
- Properties TypeScript: PascalCase (`VcEmail`, `InId`)
- DTOs: `Create{Entity}Dto`, `Update{Entity}Dto`
- Joi schemas: `create{Entity}Schema`, `update{Entity}Schema`
- Servicios extienden `BaseCrudService` con lifecycle hooks
- Controladores extienden `BaseCrudController`
- Respuestas API en espanol con estructura estandar `{ message, data, errors }`

### Frontend (Angular)
- Componentes standalone (no NgModules)
- Lazy loading por defecto
- Tailwind CSS para styling
- Servicios con error handling centralizado

### Docker
- Todos los servicios en un solo `docker-compose.yml`
- Red compartida: `red_solercia_com_co`
- Variables de entorno en `.env` (nunca hardcodear)
- Build multi-stage para produccion

## Roles de Agentes

### CEO / Product Owner
**Responsabilidad**: Toma decisiones estrategicas, prioriza features, define roadmap.
- Consulta reportes de mercado de otros agentes
- Aprueba/rechaza cambios arquitecturales
- Define nicho y modelo de negocio
- Valida que cada fase entregue valor

### Arquitecto / Tech Lead
**Responsabilidad**: Disena arquitectura, valida codigo, define patrones.
- Revisa cada subproyecto (boki-api, boki-front, solercia-web, n8n-flujos)
- Identifica deuda tecnica y propone soluciones
- Valida integraciones entre servicios
- Define standards de codigo y testing

### Marketing / Market Research
**Responsabilidad**: Investiga mercado, define campanas, valida producto.
- Ejecuta skill `market-research` para datos frescos
- Analiza nichos y competencia
- Propone estrategia de go-to-market
- Define pricing y posicionamiento
- Skill: `./skills/market-research/`

### Backend Developer
**Responsabilidad**: Implementa logica de negocio en boki-api.
- Sigue patrones de `BaseCrudService` y `BaseCrudController`
- Crea migraciones TypeORM para cambios de schema
- Implementa validaciones con Joi
- Configura autenticacion JWT + API tokens

### Frontend Developer
**Responsabilidad**: Implementa UI en boki-front y solercia-web.
- Componentes standalone Angular 20
- Integra con boki-api via servicios HTTP
- Implementa responsive design con Tailwind
- Sigue patrones de `DataGridComponent` y `DialogService`

### DevOps / Infra
**Responsabilidad**: Gestiona Docker, Traefik, CI/CD, seguridad.
- Mantiene docker-compose.yml
- Configura certificados SSL
- Implementa rate limiting y security headers
- Monitorea logs y alertas
- Sigue recomendaciones de `SEGURIDAD_RECOMENDACIONES.md`

### QA / Testing
**Responsabilidad**: Pruebas de cada fase.
- Playwright para e2e tests
- Smoke tests de servicios Docker
- Valida flujos n8n end-to-end
- Reporta bugs y blockers en `BLOQUEANTES.md`

## Definition of Done

Un feature esta "done" cuando:
1. Codigo implementado y funcional
2. Sin errores en consola/logs
3. Documentado en CLAUDE.md si afecta arquitectura
4. Commit con mensaje descriptivo (Conventional Commits)
5. Docker services levantan sin errores
6. No hay credenciales expuestas

## Skills Disponibles

Todos los skills estan en `./skills/` con symlinks en `.claude/skills/`.

### Skills del Proyecto (creados para BokiBot)

| Skill | Descripcion | Trigger | Path |
|-------|------------|---------|------|
| `backend-nestjs` | NestJS 11: BaseCrudService, Guards, DTOs, Joi, naming | Crear/modificar modulos en boki-api | [SKILL.md](skills/backend-nestjs/SKILL.md) |
| `frontend-angular` | Angular 20: standalone, signals, Tailwind, zoneless | Crear/modificar componentes en solercia-web o boki-front | [SKILL.md](skills/frontend-angular/SKILL.md) |
| `n8n-workflows` | n8n: seguridad, env vars, SQL, sub-flujos, OpenAI | Crear/modificar flujos n8n | [SKILL.md](skills/n8n-workflows/SKILL.md) |
| `devops-docker` | Docker, Traefik, SSL, networking, env management | Modificar docker-compose, Dockerfiles, Traefik | [SKILL.md](skills/devops-docker/SKILL.md) |
| `qa-testing` | Smoke tests, Playwright, quality gates, validacion | Escribir tests, validar implementaciones | [SKILL.md](skills/qa-testing/SKILL.md) |
| `security-audit` | OWASP, credenciales, SQL injection, headers, CORS | Auditar seguridad, gestionar credenciales | [SKILL.md](skills/security-audit/SKILL.md) |
| `market-research` | Google Trends, GitHub, competidores, NPM | Investigacion de mercado | [SKILL.md](skills/market-research/SKILL.md) |

### Skills Copiados de Gentleman-Skills

| Skill | Descripcion | Path |
|-------|------------|------|
| `typescript` | TypeScript strict: const types, flat interfaces, utility types | [SKILL.md](skills/typescript/SKILL.md) |
| `playwright` | Playwright E2E: Page Objects, selectores, MCP workflow | [SKILL.md](skills/playwright/SKILL.md) |

### Skills SDD (Spec-Driven Development) de agent-teams-lite

| Skill | Descripcion | Comando | Path |
|-------|------------|---------|------|
| `sdd-init` | Inicializar contexto SDD en el proyecto | `/sdd-init` | [SKILL.md](skills/sdd-init/SKILL.md) |
| `sdd-explore` | Investigar codebase antes de proponer cambios | `/sdd-explore` | [SKILL.md](skills/sdd-explore/SKILL.md) |
| `sdd-propose` | Crear propuesta de cambio | `/sdd-new <nombre>` | [SKILL.md](skills/sdd-propose/SKILL.md) |
| `sdd-spec` | Escribir especificaciones del cambio | `/sdd-continue` | [SKILL.md](skills/sdd-spec/SKILL.md) |
| `sdd-design` | Diseno tecnico detallado | `/sdd-continue` | [SKILL.md](skills/sdd-design/SKILL.md) |
| `sdd-tasks` | Desglose de tareas | `/sdd-continue` | [SKILL.md](skills/sdd-tasks/SKILL.md) |
| `sdd-apply` | Implementar codigo | `/sdd-apply` | [SKILL.md](skills/sdd-apply/SKILL.md) |
| `sdd-verify` | Verificar implementacion | `/sdd-verify` | [SKILL.md](skills/sdd-verify/SKILL.md) |
| `sdd-archive` | Archivar cambio completado | `/sdd-archive` | [SKILL.md](skills/sdd-archive/SKILL.md) |

## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `CLAUDE.md` | Guia tecnica del proyecto |
| `AGENTS.md` | Roles de agentes, convenciones y skills |
| `docker-compose.yml` | Orquestacion de servicios |
| `.env` / `.env.example` | Variables de entorno |
| `claude-logs/ESTADO.md` | Estado actual del proyecto |
| `claude-logs/BLOQUEANTES.md` | Bloqueantes para el humano |
| `claude-logs/TIEMPO.md` | Registro de tiempo por fase |
| `SEGURIDAD_RECOMENDACIONES.md` | Plan de seguridad |
| `DYNAMIC_FLOWS_INTEGRATION_GUIDE.md` | Guia de flujos dinamicos |

## Estructura del Proyecto

```
solercia_flows/
├── boki-api/          # NestJS backend (repo independiente)
├── boki-bot/          # Python WhatsApp bot (repo independiente)
├── boki-front/        # Angular admin frontend (repo independiente)
├── solercia-web/      # Angular website (parte del monorepo)
├── n8n-flujos/        # Workflows n8n en JSON
│   └── v2/            # Flujos limpiados sin credenciales
├── traefik/           # Config Traefik (certs, logs)
├── skills/            # Skills reutilizables (18 skills)
│   ├── backend-nestjs/    # NestJS patterns
│   ├── frontend-angular/  # Angular 20 patterns
│   ├── n8n-workflows/     # n8n flow patterns
│   ├── devops-docker/     # Docker/Traefik patterns
│   ├── qa-testing/        # Testing patterns
│   ├── security-audit/    # Security review patterns
│   ├── market-research/   # Market research scripts
│   ├── typescript/        # TypeScript strict (Gentleman)
│   ├── playwright/        # E2E testing (Gentleman)
│   └── sdd-*/             # SDD skills (9 skills, agent-teams-lite)
├── .claude/skills/    # Symlinks a ./skills/*
├── claude-analisis/   # Reportes de analisis
├── claude-logs/       # Logs de sesion autonoma
├── docs/              # Documentacion
│   ├── market-research/
│   ├── phases/
│   └── c4/
├── tests/             # Scripts de prueba
├── docker-compose.yml
├── CLAUDE.md
├── AGENTS.md
└── .env.example
```
