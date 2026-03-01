# Analisis Completo: boki-api (NestJS Backend)

**Fecha de analisis:** 2026-03-01
**Repositorio:** github.com/camilocalderont/boki-api
**Rama activa:** master (7b42f33)
**Version:** 1.0.0

---

## 1. Resumen Ejecutivo

boki-api es el backend principal del ecosistema Solercia/Boki, construido con NestJS 11.1.6 y TypeScript 5.5 sobre Node 22-alpine. Implementa una arquitectura modular con 21 modulos de funcionalidad, base de datos dual (PostgreSQL + MongoDB), autenticacion JWT + API token, integracion con OpenAI para busqueda semantica y conversaciones inteligentes, y documentacion automatica via Swagger. El proyecto cuenta con aproximadamente 17,556 lineas de codigo y 43 migraciones de base de datos.

---

## 2. Stack Tecnologico

| Componente | Tecnologia | Version |
|---|---|---|
| Framework | NestJS | 11.1.6 |
| Lenguaje | TypeScript | 5.5 |
| Runtime | Node.js | 22-alpine |
| Base de datos relacional | PostgreSQL | 14.5 |
| ORM relacional | TypeORM | - |
| Base de datos documental | MongoDB | 7-jammy |
| ODM documental | Mongoose | - |
| Autenticacion | JWT + API Token | - |
| IA / LLM | OpenAI SDK | 4.104.0 |
| Busqueda semantica | pgvector | - |
| Documentacion API | Swagger / OpenAPI | Autogenerado |
| Validacion | Joi | - |
| Contenedores | Docker | Node 22-alpine |

---

## 3. Arquitectura Modular

### 3.1 Cadena de entrada

```
src/app.ts --> src/api/main.ts --> src/api/app.module.ts
```

### 3.2 Modulos de funcionalidad (21 total)

| # | Modulo | Base de datos | Completitud | Notas |
|---|---|---|---|---|
| 1 | appointment | PostgreSQL | 90% | Agendamiento completo |
| 2 | categoryService | PostgreSQL | 90% | Categorias de servicios |
| 3 | chat | PostgreSQL | **15%** | Stub incompleto |
| 4 | client | PostgreSQL | 90% | Gestion de clientes |
| 5 | company | PostgreSQL | 95% | Empresas multitenancy |
| 6 | companyBranch | PostgreSQL | 90% | Sucursales |
| 7 | companyPlan | PostgreSQL | 90% | Planes por empresa |
| 8 | companyPlanControlToken | PostgreSQL | 85% | Control de tokens |
| 9 | companyPrompts | PostgreSQL | 85% | Prompts por empresa |
| 10 | conversation | MongoDB | 90% | Estado de chat en tiempo real |
| 11 | dynamic_flows | PostgreSQL | **20%** | Stub incompleto |
| 12 | emailTemplates | PostgreSQL | 85% | Templates de correo |
| 13 | faqs | PostgreSQL | 90% | Preguntas frecuentes |
| 14 | health | N/A | 95% | Health checks |
| 15 | llm | PostgreSQL | 90% | Integracion LLM |
| 16 | plan | PostgreSQL | 90% | Planes de suscripcion |
| 17 | professional | PostgreSQL | 90% | Profesionales/agenda |
| 18 | semanticSearch | PostgreSQL + pgvector | 90% | Busqueda vectorial |
| 19 | service | PostgreSQL | 85% | Servicios ofrecidos |
| 20 | tags | PostgreSQL | 80% | Etiquetas/clasificacion |
| 21 | users | PostgreSQL | 95% | Usuarios y auth |

### 3.3 Distribucion de completitud

- **90%+ completitud:** 11 modulos
- **80-89% completitud:** 7 modulos
- **Stubs incompletos:** 2 modulos (dynamic_flows 20%, chat 15%)

---

## 4. Patrones de Diseno Clave

### 4.1 BaseCrudService con Lifecycle Hooks

El patron central del proyecto es `BaseCrudService<Entity, CreateDto, UpdateDto>` que provee operaciones CRUD genericas con hooks de ciclo de vida:

```
validateCreate() --> prepareCreateData() --> create() --> afterCreate()
validateUpdate() --> prepareUpdateData() --> update() --> afterUpdate()
```

Complementado por `BaseCrudController<Entity, CreateDto, UpdateDto>` que expone endpoints REST estandar.

### 4.2 Flujo de Autenticacion

- **Guard global:** `ApiTokenGuard` (valida header `x-api-token`)
- **Guard global:** `JwtAuthGuard` (valida Bearer token)
- **Decorador `@Public()`** para bypasear autenticacion
- **Rutas publicas hardcodeadas:** `POST /api/v1/users`, `POST /api/v1/users/login`, `POST /api/v1/semantic-search`

### 4.3 Formato de Respuesta Estandarizado

```typescript
{
  message: string,        // Mensaje en espanol
  data: T | null,
  errors?: Array<{
    code: string,         // Ej: "EMAIL_YA_EXISTE"
    message: string,      // Mensaje en espanol
    field: string
  }>
}
```

### 4.4 Interceptores Globales

- `ResponseInterceptor` - Estandariza formato de respuesta
- `DateFormatInterceptor` - Formateo consistente de fechas

---

## 5. Integracion OpenAI y Busqueda Semantica

- **SDK:** OpenAI 4.104.0
- **pgvector:** Busqueda semantica sobre PostgreSQL con embeddings vectoriales
- **Uso:** Generacion de respuestas inteligentes, clasificacion de intenciones, busqueda por similitud en FAQs y documentos

---

## 6. Migraciones

- **Total de migraciones:** 43
- **ORM:** TypeORM
- **Comandos:**
  - `npm run migration:generate -- -n NombreDescriptivo`
  - `npm run migration:run`

---

## 7. Hallazgos Criticos de Seguridad

| Severidad | Hallazgo | Descripcion |
|---|---|---|
| **CRITICA** | Secretos expuestos en .env | Credenciales en texto plano en archivos .env sin gestion de secretos |
| **CRITICA** | Bug en configuracion JWT_SECRET | Configuracion defectuosa del secreto JWT |
| **ALTA** | Sin rate limiting | No hay limitacion de tasa en endpoints de la API |
| **ALTA** | Busqueda semantica publica | Endpoint `/api/v1/semantic-search` es publico sin autenticacion |
| **ALTA** | CORS sin restricciones | CORS habilitado globalmente sin restriccion de origenes |

---

## 8. Ramas del Repositorio

| Rama | Estado | Descripcion |
|---|---|---|
| **master** | Activa | feat(n8n): endpoint create para n8n + auth sistema API Keys |
| Developer | Secundaria | Integracion MongoDB, cambios en esquemas de validacion |
| Luisito | Feature | Frecuencia de agendamiento, logica de disponibilidad |
| joi-pipes | Feature | Refactor de validacion con Joi |
| monorepo | Obsoleta | Intento de reestructuracion a monorepo |

---

## 9. Metricas

| Metrica | Valor |
|---|---|
| Lineas de codigo | ~17,556 |
| Modulos | 21 |
| Migraciones | 43 |
| Version | 1.0.0 |
| Completitud general | ~85% |

---

## 10. Recomendaciones

### Prioridad Critica (Bloquea produccion)

1. **Bloquear despliegue a produccion** hasta resolver hallazgos de seguridad criticos
2. **Rotar todas las credenciales** que hayan sido expuestas en el repositorio
3. **Implementar gestion de secretos** (AWS Secrets Manager, HashiCorp Vault, o similar)
4. **Corregir bug de JWT_SECRET** en configuracion
5. **Implementar rate limiting** en todos los endpoints

### Prioridad Alta

6. Restringir endpoint de busqueda semantica o agregar autenticacion
7. Configurar CORS con lista blanca de origenes permitidos
8. Completar modulos stub (dynamic_flows, chat) o removerlos
9. Agregar tests unitarios e integracion (cobertura actual: 0%)

### Prioridad Media

10. Limpiar ramas obsoletas (monorepo)
11. Documentar flujo de deployment
12. Implementar logging centralizado
13. Agregar health checks mas robustos

---

*Analisis generado el 2026-03-01 por Claude Code*
