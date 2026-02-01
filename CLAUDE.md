# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a multi-service monorepo for Solercia, consisting of:
- **n8n (flows)**: Workflow automation platform (n8n.io) with Solercia branding
- **boki-api**: NestJS backend API for WhatsApp bot and business logic
- **solercia-web**: Angular 20 website/frontend
- **Traefik**: Reverse proxy with automatic SSL/TLS certificates

All services run in Docker containers orchestrated by [docker-compose.yml](docker-compose.yml).

## Common Commands

### Docker Orchestration (All Services)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f [service-name]

# Restart specific service
docker compose restart [service-name]

# Stop all services
docker compose down

# Rebuild and restart a service
docker compose up -d --build [service-name]
```

Service names: `traefik`, `postgres`, `flows`, `solercia-web`, `mongo_db`, `boki-api`

### Solercia Web (Angular)

```bash
cd solercia-web

# Install dependencies
npm install

# Development server (http://localhost:4200)
npm start
# or
ng serve

# Build for production
npm run build

# Run tests
npm test

# Watch mode build
npm run watch

# Generate component
ng generate component component-name
```

Build script available: `./build-web.sh` (builds and shows Docker restart instructions)

### Boki API (NestJS)

```bash
cd boki-api

# Install dependencies
npm install

# Development mode (watch mode with tsx)
npm run start:dev

# Production mode
npm start

# Build
npm run build

# Lint
npm run lint

# Database migrations
npm run migration:generate -- -n MigrationName
npm run migration:run

# Seed data
npm run seed:agendamiento
npm run seed:personero
```

API runs on port 3000 with Swagger docs at `/api-docs` when running.

## Architecture

### Boki API - NestJS Backend

**Technology Stack:**
- NestJS framework with TypeScript
- Dual database: PostgreSQL (TypeORM) + MongoDB (Mongoose)
- OpenAI integration for LLM-powered conversations
- WhatsApp integration (Meta/Twilio providers)
- JWT authentication with API token guards
- Swagger/OpenAPI documentation

**Module Organization:**

Entry point chain: `src/app.ts` → `src/api/main.ts` → `src/api/app.module.ts`

20 feature modules in [src/api/modules](boki-api/src/api/modules):
- **PostgreSQL modules**: appointment, categoryService, chat, client, company, companyBranch, companyPlan, companyPlanControlToken, companyPrompts, emailTemplates, faqs, llm, plan, professional, semanticSearch, service, tags, users
- **MongoDB modules**: conversation (real-time chat state)
- **Utility modules**: health (health checks)

**Key Patterns:**

1. **Base Classes for CRUD Operations:**
   - `BaseCrudService<Entity, CreateDto, UpdateDto>` - Generic service with lifecycle hooks
   - `BaseCrudController<Entity, CreateDto, UpdateDto>` - Generic controller with standard REST endpoints
   - Override lifecycle hooks: `validateCreate()`, `prepareCreateData()`, `afterCreate()`, `validateUpdate()`, `prepareUpdateData()`, `afterUpdate()`

2. **Authentication Flow:**
   - Global guards: `ApiTokenGuard` (validates `x-api-token` header) + `JwtAuthGuard` (validates Bearer token)
   - Use `@Public()` decorator to bypass authentication
   - Hardcoded public routes: `POST /api/v1/users`, `POST /api/v1/users/login`, `POST /api/v1/semantic-search`

3. **Naming Conventions:**
   - Database tables: PascalCase with capital first letter (e.g., `@Entity('Users')`)
   - Database columns: snake_case with type prefix (e.g., `vc_email`, `in_id`)
   - TypeScript properties: PascalCase (e.g., `VcEmail`, `InId`)
   - DTOs: `Create{Entity}Dto`, `Update{Entity}Dto`
   - Joi schemas: `create{Entity}Schema`, `update{Entity}Schema`

4. **Response Format:**
   All API responses follow this structure:
   ```typescript
   {
     message: string,        // Human-readable message in Spanish
     data: T | null,
     errors?: Array<{
       code: string,         // Error code (e.g., "EMAIL_YA_EXISTE")
       message: string,      // Error message in Spanish
       field: string         // Field that caused the error
     }>
   }
   ```

5. **Global Interceptors:**
   - `ResponseInterceptor` - Standardizes response format
   - `DateFormatInterceptor` - Formats dates consistently

**Important Files:**
- [boki-api/src/api/config.ts](boki-api/src/api/config.ts) - Environment configuration
- [boki-api/src/api/shared/](boki-api/src/api/shared/) - Base classes, guards, decorators, interceptors
- [boki-api/src/api/database/](boki-api/src/api/database/) - TypeORM config and seeds

### Solercia Web - Angular Frontend

**Technology Stack:**
- Angular 20 with TypeScript
- Tailwind CSS for styling
- Standalone components (no NgModules)

**Structure:**
- [solercia-web/src/app/](solercia-web/src/app/) - Application root
- [solercia-web/src/app/pages/](solercia-web/src/app/pages/) - Page components
- [solercia-web/src/app/shared/](solercia-web/src/app/shared/) - Shared components and utilities
- [solercia-web/src/assets/](solercia-web/src/assets/) - Static assets

Build output: `dist/solercia-web/browser/` (served by nginx in Docker)

### Deployment Architecture

**Traefik Configuration:**
- Automatic HTTPS with Let's Encrypt
- Single SAN certificate covering all subdomains
- Configured middlewares: compression, rate limiting, security headers
- Domain routing based on `.env` variables

**Domain Structure:**
- `${SUBDOMAIN_WEB}.${DOMAIN_NAME}` → solercia-web (Angular)
- `${SUBDOMAIN_FLOWS}.${DOMAIN_NAME}` → n8n flows
- `${SUBDOMAIN_BOKI_API}.${DOMAIN_NAME}` → boki-api (NestJS)
- `${DOMAIN_NAME}` → redirects to www subdomain

**Important Environment Variables:**

Create `.env` from `.env.example` in the root directory:
- `DOMAIN_NAME`, `SUBDOMAIN_*` - Domain configuration
- `POSTGRES_*` - PostgreSQL credentials (used by n8n and boki-api)
- `ACME_EMAIL` - Let's Encrypt notifications
- `GENERIC_TIMEZONE` - Default: America/Bogota

For boki-api, also configure `boki-api/.env` (see `boki-api/.env.example`):
- Database credentials (PostgreSQL + MongoDB)
- JWT_SECRET - Authentication secret
- LLM_APIKEY, LLM_MODEL - OpenAI configuration
- META_* - WhatsApp Meta provider credentials
- ACC_* - Twilio provider credentials

## Development Workflow

### Adding New API Endpoints (boki-api)

When adding new feature modules:

1. Create module structure in `src/api/modules/[module-name]/`
2. Extend `BaseCrudService` or `MongoCrudService` for service layer
3. Extend `BaseCrudController` for controller layer
4. Create TypeORM entity (PostgreSQL) or Mongoose schema (MongoDB)
5. Create DTOs and Joi validation schemas
6. Register module in `src/api/app.module.ts`
7. Register entity in `src/api/database/database.module.ts` (if using PostgreSQL)

### Adding New Angular Components (solercia-web)

```bash
cd solercia-web
ng generate component pages/component-name
```

Components are standalone by default in Angular 20.

### Database Changes (boki-api)

For PostgreSQL schema changes:

```bash
cd boki-api
npm run migration:generate -- -n DescriptiveName
npm run migration:run
```

Migrations are required for production deployments.

## Special Notes

### n8n Customization

The n8n instance has Solercia branding applied via Traefik middlewares. Custom CSS and favicon injection are commented out in [docker-compose.yml](docker-compose.yml) but available for re-enabling.

### Database Isolation

- **PostgreSQL**: Shared between n8n and boki-api (separate databases/schemas)
- **MongoDB**: Dedicated to boki-api for real-time conversation data

### Security

- All HTTP traffic automatically redirects to HTTPS
- JWT tokens expire after 2 hours
- Passwords hashed with bcrypt (10 rounds)
- Global CORS enabled on boki-api
- Security headers enforced via Traefik middlewares

### API Versioning

API endpoints are prefixed with `/api/v{VERSION}` where VERSION comes from `.env` (default: 1).
