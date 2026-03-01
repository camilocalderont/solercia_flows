---
name: backend-nestjs
description: >
  Estandar para desarrollar backend en NestJS 11 para boki-api: BaseCrudService, Guards, DTOs, Joi, naming conventions.
  Trigger: When creating NestJS modules, services, controllers, entities, DTOs, or migrations in boki-api.
metadata:
  author: solercia
  version: "1.0"
---

# Backend NestJS Skill - boki-api

Guia de referencia para desarrollar modulos, servicios, controladores, entidades y DTOs en el backend NestJS 11 del proyecto BokiBot.

---

## 1. When to Use

Activar este skill cuando se necesite:

- Crear un nuevo modulo NestJS en `boki-api/src/api/modules/`
- Crear o modificar entidades TypeORM (PostgreSQL)
- Crear o modificar esquemas Mongoose (MongoDB)
- Definir DTOs y validaciones Joi
- Extender `BaseCrudService` o `BaseCrudController`
- Configurar autenticacion (guards, decoradores `@Public()`, `@AllowApiKey()`)
- Generar migraciones de base de datos
- Agregar endpoints REST al API

---

## 2. Module Structure

Estructura estandar de un modulo feature en `boki-api/src/api/modules/`:

```
modules/
  myModule/
    myModule.module.ts              # Definicion del modulo NestJS
    controllers/
      myModule.controller.ts        # Controlador (extiende BaseCrudController)
    services/
      myModule.service.ts           # Servicio (extiende BaseCrudService)
    entities/
      myModule.entity.ts            # Entidad TypeORM
    dto/
      myModuleCreate.dto.ts         # DTO de creacion
      myModuleUpdate.dto.ts         # DTO de actualizacion
    schemas/
      myModuleCreate.schema.ts      # Validacion Joi para creacion
      myModuleUpdate.schema.ts      # Validacion Joi para actualizacion
    repositories/
      myModule.repository.ts        # Repositorio custom (opcional)
```

### Registro del modulo

1. Importar el modulo en `src/api/app.module.ts`
2. Registrar la entidad en `src/api/database/database.module.ts` (solo para PostgreSQL)

---

## 3. Naming Conventions (CRITICAL)

### Tablas de base de datos
- **Formato**: PascalCase, singular
- **Ejemplo**: `@Entity('Company')`, `@Entity('Professional')`, `@Entity('Service')`

### Columnas de base de datos
- **Formato**: snake_case con prefijo de tipo
- **Prefijos**:
  | Prefijo | Tipo | Ejemplo columna | Propiedad TS |
  |---------|------|-----------------|--------------|
  | `vc_` | varchar | `vc_email` | `VcEmail` |
  | `in_` | integer | `in_id` | `InId` |
  | `i_` | integer (alt) | `i_regular_price` | `IRegularPrice` |
  | `b_` | boolean | `b_is_active` | `BIsActive` |
  | `dt_` | datetime | `dt_date` | `DtDate` |
  | `d_` | decimal | `d_taxes` | `DTaxes` |
  | `tx_` | text | `tx_picture` | `TxPicture` |
- **Foreign keys**: snake_case sin prefijo de tipo: `company_id`, `category_id`
- **Timestamps**: siempre `created_at` y `updated_at`

### Propiedades TypeScript
- **Formato**: PascalCase
- **Ejemplo**: `VcEmail`, `InId`, `BIsActive`, `CompanyId`
- **Excepcion**: `created_at` y `updated_at` permanecen en snake_case
- **PrimaryKey**: siempre `Id` (PascalCase)

### DTOs
- **Creacion**: `Create{Entity}Dto` (ej: `CreateClientDto`, `CreateTagsDto`)
- **Actualizacion**: `Update{Entity}Dto` (ej: `UpdateClientDto`, `UpdateTagsDto`)
- **Archivos**: `{entity}Create.dto.ts`, `{entity}Update.dto.ts`

### Joi Schemas
- **Creacion**: `create{Entity}Schema` (ej: `createClientSchema`, `createTagsSchema`)
- **Actualizacion**: `update{Entity}Schema` (ej: `updateClientSchema`, `updateTagsSchema`)
- **Archivos**: `{entity}Create.schema.ts`, `{entity}Update.schema.ts`

---

## 4. BaseCrudService Pattern

Todos los servicios PostgreSQL deben extender `BaseCrudService<Entity, CreateDto, UpdateDto>`.

```typescript
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../../shared/services/crud.services';
import { MyEntity } from '../entities/myEntity.entity';
import { CreateMyEntityDto } from '../dto/myEntityCreate.dto';
import { UpdateMyEntityDto } from '../dto/myEntityUpdate.dto';
import { ApiErrorItem } from '~/api/shared/interfaces/api-response.interface';

@Injectable()
export class MyEntityService extends BaseCrudService<MyEntity, CreateMyEntityDto, UpdateMyEntityDto> {
  constructor(
    @InjectRepository(MyEntity)
    private readonly myEntityRepository: Repository<MyEntity>,
  ) {
    super(myEntityRepository);
  }
}
```

### Lifecycle Hooks

Los hooks disponibles para sobreescribir son:

| Hook | Fase | Uso |
|------|------|-----|
| `validateCreate(createDto)` | Antes de crear | Validar unicidad, reglas de negocio |
| `afterCreate(entity)` | Despues de crear | Enviar notificaciones, logs |
| `validateUpdate(id, updateDto)` | Antes de actualizar | Validar permisos, reglas |
| `prepareUpdateData(entity, updateDto)` | Antes de guardar update | Transformar datos |
| `afterUpdate(entity)` | Despues de actualizar | Side effects |

### Ejemplo de validateCreate

```typescript
protected async validateCreate(dto: CreateMyEntityDto): Promise<void> {
  const errors: ApiErrorItem[] = [];

  const existing = await this.myEntityRepository.findOne({
    where: { VcEmail: dto.VcEmail }
  });

  if (existing) {
    errors.push({
      code: 'EMAIL_YA_EXISTE',
      message: 'Ya existe un registro con este correo electronico.',
      field: 'VcEmail'
    });
  }

  if (errors.length > 0) {
    throw new ConflictException(errors, 'Error en la creacion');
  }
}
```

---

## 5. BaseCrudController Pattern

Todos los controladores PostgreSQL deben extender `BaseCrudController<Entity, CreateDto, UpdateDto>`.

```typescript
import { Controller, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { BaseCrudController } from '../../../shared/controllers/crud.controller';
import { MyEntity } from '../entities/myEntity.entity';
import { CreateMyEntityDto } from '../dto/myEntityCreate.dto';
import { UpdateMyEntityDto } from '../dto/myEntityUpdate.dto';
import { MyEntityService } from '../services/myEntity.service';
import { createMyEntitySchema } from '../schemas/myEntityCreate.schema';
import { updateMyEntitySchema } from '../schemas/myEntityUpdate.schema';

@Controller('my-entity')
@UsePipes(new ValidationPipe({
  transform: true,
  forbidNonWhitelisted: true,
  transformOptions: { enableImplicitConversion: true }
}))
export class MyEntityController extends BaseCrudController<MyEntity, CreateMyEntityDto, UpdateMyEntityDto> {
  constructor(
    @Inject(MyEntityService)
    private readonly myEntityService: MyEntityService
  ) {
    super(myEntityService, 'mi entidad', createMyEntitySchema, updateMyEntitySchema);
  }
}
```

### Endpoints automaticos del BaseCrudController

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST /` | Crear | Valida con Joi, retorna 201 |
| `GET /` | Listar todos | Acepta query params como filtros |
| `GET /:id` | Obtener uno | Retorna 404 si no existe |
| `PUT /:id` | Actualizar | Valida con Joi, retorna 200 |
| `DELETE /:id` | Eliminar | Retorna 200 |

El segundo parametro del `super()` (`entityName`) se usa en los mensajes de respuesta en espanol:
- `"mi entidad creado de forma exitosa"`
- `"Lista de mi entidad obtenida de forma exitosa"`

---

## 6. Authentication

### Guards globales

Dos guards se aplican globalmente (registrados en `app.module.ts`):

1. **`ApiTokenGuard`**: Valida el header `x-api-token` contra `JWT_SECRET`. Se aplica a TODAS las peticiones.
2. **`JwtAuthGuard`**: Valida el Bearer token JWT. Se aplica despues del ApiTokenGuard.

### Decoradores de acceso

```typescript
import { Public } from '../../../shared/decorators/public.decorator';
import { AllowApiKey } from '../../../shared/decorators/allow-api-key.decorator';

// Bypass completo de autenticacion JWT
@Public()
@Get('public-endpoint')
async publicMethod() { ... }

// Permitir acceso con API Key (header x-api-key) ademas de JWT
@AllowApiKey()
@Post()
async createWithApiKey() { ... }
```

### Rutas publicas hardcodeadas

Estas rutas no requieren autenticacion JWT:
- `POST /api/v1/users` (registro)
- `POST /api/v1/users/login` (login)
- `POST /api/v1/semantic-search` (busqueda semantica)

### Flujo de autenticacion

```
Request
  -> ApiTokenGuard (valida x-api-token)
  -> JwtAuthGuard:
       1. Es @Public()? -> Permitir
       2. Es ruta publica hardcodeada? -> Permitir
       3. Tiene @AllowApiKey() y header x-api-key valido? -> Permitir
       4. Tiene Bearer token JWT valido? -> Permitir
       5. Rechazar con 401
```

---

## 7. Response Format

Todas las respuestas del API siguen esta estructura estandarizada (gestionada por `ResponseInterceptor`):

### Respuesta exitosa

```json
{
  "status": "success",
  "message": "Cliente creado de forma exitosa",
  "data": { ... }
}
```

### Respuesta de error

```json
{
  "status": "error",
  "message": "Error en la creacion del cliente",
  "errors": [
    {
      "code": "EMAIL_YA_EXISTE",
      "message": "Ya existe un cliente con este correo electronico.",
      "field": "VcEmail"
    }
  ]
}
```

### Reglas

- Los mensajes siempre van en **espanol**
- Los codigos de error usan **SCREAMING_SNAKE_CASE** en espanol (ej: `EMAIL_YA_EXISTE`, `TOKEN_EXPIRADO`)
- El campo `field` indica la propiedad que causo el error (usa nombre de propiedad TS, ej: `VcEmail`)
- Los controladores retornan `ApiControllerResponse<T>` con `{ message, data }`
- El `ResponseInterceptor` envuelve automaticamente con `{ status: 'success', message, data }`

---

## 8. Anti-Patterns

### NO: Logica de negocio en el controlador

```typescript
// MAL - Logica directamente en el controlador
@Controller('client')
export class ClientController {
  @Post()
  async create(@Body() dto: any) {
    const existing = await this.repo.findOne({ where: { VcEmail: dto.email } });
    if (existing) throw new ConflictException('Ya existe');
    return await this.repo.save(dto);
  }
}
```

**Solucion**: Mover toda la logica al servicio, usar `validateCreate()`.

### NO: Nombrar columnas sin prefijo de tipo

```typescript
// MAL - Columnas sin prefijo
@Column({ name: 'email' })
email: string;

@Column({ name: 'active' })
isActive: boolean;
```

**Solucion**: Usar prefijos `vc_email`, `b_is_active`.

### NO: Propiedades TypeScript en camelCase

```typescript
// MAL - camelCase en propiedades
@Column({ name: 'vc_first_name' })
firstName: string;  // Deberia ser VcFirstName
```

**Solucion**: Usar PascalCase: `VcFirstName`.

### NO: Crear controladores sin extender BaseCrudController

```typescript
// MAL - Controlador manual sin heredar
@Controller('product')
export class ProductController {
  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  create(@Body() dto) { return this.service.create(dto); }

  // Reimplementando lo que BaseCrudController ya provee
}
```

**Solucion**: Extender `BaseCrudController` y solo sobreescribir lo necesario.

### NO: Validaciones sin Joi

```typescript
// MAL - Validar manualmente en el controlador
@Post()
async create(@Body() dto: any) {
  if (!dto.VcName) throw new BadRequestException('Nombre requerido');
  if (dto.VcName.length < 2) throw new BadRequestException('Minimo 2 caracteres');
}
```

**Solucion**: Definir un esquema Joi y usar `@UseJoiValidationPipe()`.

### NO: Mensajes en ingles

```typescript
// MAL - Mensajes en ingles
throw new NotFoundException('Entity not found');
return { message: 'Created successfully', data };
```

**Solucion**: Siempre en espanol: `'Entidad no encontrada'`, `'Creado de forma exitosa'`.

---

## 9. Quick Reference

| Concepto | Patron |
|----------|--------|
| Tabla DB | `@Entity('MiEntidad')` - PascalCase singular |
| Columna varchar | `@Column({ name: 'vc_nombre' })` `VcNombre: string` |
| Columna int | `@Column({ name: 'in_edad' })` `InEdad: number` |
| Columna boolean | `@Column({ name: 'b_activo' })` `BActivo: boolean` |
| Columna datetime | `@Column({ name: 'dt_fecha' })` `DtFecha: Date` |
| Columna decimal | `@Column({ name: 'd_precio' })` `DPrecio: number` |
| Columna text | `@Column({ name: 'tx_nota' })` `TxNota: string` |
| Foreign key | `@Column({ name: 'company_id' })` `CompanyId: number` |
| Primary key | `@PrimaryGeneratedColumn()` `Id: number` |
| Timestamps | `@CreateDateColumn({ name: 'created_at' })` `created_at: Date` |
| DTO crear | `export class CreateMyEntityDto { VcNombre: string; }` |
| DTO actualizar | `export class UpdateMyEntityDto { VcNombre?: string; }` |
| Joi schema | `Joi.object({ VcNombre: Joi.string().required() }).messages(joiMessagesES)` |
| Servicio | `extends BaseCrudService<Entity, CreateDto, UpdateDto>` |
| Controlador | `extends BaseCrudController<Entity, CreateDto, UpdateDto>` |
| Ruta publica | `@Public()` en metodo o clase |
| API key | `@AllowApiKey()` en metodo |
| Error code | `SCREAMING_SNAKE_CASE` en espanol |
| Respuesta | `{ message: 'en espanol', data: T }` |

---

## 10. Checklist

Antes de cerrar una tarea de backend, verificar:

- [ ] La entidad usa `@Entity('NombrePascalCase')` con nombre singular
- [ ] Las columnas tienen prefijo de tipo (`vc_`, `in_`, `b_`, `dt_`, `d_`, `tx_`)
- [ ] Las propiedades TypeScript estan en PascalCase
- [ ] La entidad tiene `Id`, `created_at` y `updated_at`
- [ ] El servicio extiende `BaseCrudService` (o `MongoCrudService` para MongoDB)
- [ ] El controlador extiende `BaseCrudController` (o `MongoCrudController`)
- [ ] Existen DTOs de creacion y actualizacion
- [ ] Existen schemas Joi para validacion de creacion y actualizacion
- [ ] Los schemas Joi usan `.messages(joiMessagesES)` para mensajes en espanol
- [ ] Los mensajes de error y respuesta estan en espanol
- [ ] Los codigos de error usan SCREAMING_SNAKE_CASE en espanol
- [ ] El modulo esta registrado en `app.module.ts`
- [ ] La entidad esta registrada en `database.module.ts` (si es PostgreSQL)
- [ ] Se generaron y ejecutaron las migraciones necesarias
- [ ] No hay logica de negocio en los controladores
- [ ] No hay credenciales hardcodeadas
