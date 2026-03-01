# Analisis Completo: Modelo de Datos

**Fecha de analisis:** 2026-03-01
**Entidades PostgreSQL:** 31 (en 20 modulos)
**Colecciones MongoDB:** 4
**Migraciones:** 46
**Puntuacion general:** 6.5/10

---

## 1. Resumen Ejecutivo

El modelo de datos de Solercia/Boki emplea una estrategia hibrida con PostgreSQL para datos operacionales y transaccionales (31 entidades en 20 modulos) y MongoDB para datos de conversacion en tiempo real (4 colecciones). La arquitectura demuestra una separacion clara de dominios y relaciones comprehensivas, pero presenta debilidades en auditoria, indexacion, integridad referencial y ausencia de soft deletes. El puntaje general es 6.5/10: una base solida que requiere hardening antes de produccion.

---

## 2. Estrategia de Base de Datos

| Aspecto | PostgreSQL | MongoDB |
|---|---|---|
| **Proposito** | Datos operacionales y transaccionales | Conversaciones en tiempo real |
| **ORM/ODM** | TypeORM | Mongoose |
| **Entidades** | 31 | 4 colecciones |
| **Migraciones** | 46 (TypeORM) | Schema-less |
| **Extensiones** | pgvector (busqueda semantica) | - |

---

## 3. Dominios del Modelo de Datos

### 3.1 Core Business (Negocio Principal)

Entidades relacionadas con la gestion central del negocio:

| Entidad | Descripcion | Relaciones clave |
|---|---|---|
| Company | Empresas / organizaciones | -> CompanyBranch, CompanyPlan, CompanyPrompts |
| CompanyBranch | Sucursales de empresa | -> Company, Professional |
| Users | Usuarios del sistema | -> Company |
| Client | Clientes / consumidores finales | -> Appointment |
| Contact | Contactos (potencial ambiguedad con Client) | -> Company |

### 3.2 Appointment & Service (Agendamiento y Servicios)

| Entidad | Descripcion | Relaciones clave |
|---|---|---|
| Appointment | Citas agendadas | -> Client, Professional, Service |
| Professional | Profesionales que atienden | -> CompanyBranch, Service |
| Service | Servicios ofrecidos | -> CategoryService, Professional |
| CategoryService | Categorias de servicios | -> Service |

### 3.3 FAQ & Knowledge (Conocimiento)

| Entidad | Descripcion | Relaciones clave |
|---|---|---|
| Faqs | Preguntas frecuentes | -> Company, Tags |
| Tags | Etiquetas/clasificacion | -> Faqs |
| SemanticSearch | Busqueda vectorial | pgvector embeddings |

### 3.4 LLM Flow & Automation (Flujos IA)

| Entidad | Descripcion | Relaciones clave |
|---|---|---|
| CompanyPrompts | Prompts por empresa | -> Company |
| DynamicFlows | Flujos dinamicos (stub) | -> Company |
| Chat | Mensajes de chat (stub) | -> Client, Company |
| EmailTemplates | Plantillas de correo | -> Company |

### 3.5 Subscription & Billing (Suscripcion y Facturacion)

| Entidad | Descripcion | Relaciones clave |
|---|---|---|
| Plan | Planes de suscripcion | -> CompanyPlan |
| CompanyPlan | Plan asignado a empresa | -> Company, Plan |
| CompanyPlanControlToken | Control de tokens por plan | -> CompanyPlan |

### 3.6 Conversation (MongoDB)

| Coleccion | Descripcion | Notas |
|---|---|---|
| conversations | Estado de conversacion activa | Documento con historial de mensajes |
| messages | Mensajes individuales | Referencia a conversacion |
| sessions | Sesiones de usuario | TTL para limpieza automatica |
| token_usage | Uso de tokens por sesion | Metricas de consumo |

---

## 4. Convenciones de Nomenclatura

### 4.1 Tablas

- **Formato:** PascalCase con primera letra mayuscula
- **Ejemplos:** `Users`, `Company`, `CompanyBranch`, `CategoryService`

### 4.2 Columnas

- **Formato:** snake_case con prefijo de tipo

| Prefijo | Tipo de dato | Ejemplo |
|---|---|---|
| `vc_` | VARCHAR / string | `vc_email`, `vc_name`, `vc_phone` |
| `i_` / `in_` | INTEGER | `in_id`, `i_company_id` |
| `tx_` | TEXT (largo) | `tx_description`, `tx_content` |
| `b_` | BOOLEAN | `b_active`, `b_deleted` |
| `dt_` | DATETIME / TIMESTAMP | `dt_created`, `dt_updated` |

### 4.3 TypeScript Properties

- **Formato:** PascalCase
- **Ejemplos:** `VcEmail`, `InId`, `BActive`, `DtCreated`

---

## 5. Migraciones

| Metrica | Valor |
|---|---|
| Total de migraciones | 46 |
| ORM | TypeORM |
| Formato | TypeScript |
| Comando de generacion | `npm run migration:generate -- -n NombreDescriptivo` |
| Comando de ejecucion | `npm run migration:run` |

---

## 6. Fortalezas del Modelo

| # | Fortaleza | Descripcion |
|---|---|---|
| 1 | **Separacion clara de dominios** | Cada dominio de negocio tiene entidades bien definidas y separadas |
| 2 | **Relaciones comprehensivas** | Relaciones entre entidades bien establecidas con foreign keys |
| 3 | **JSONB para configuracion flexible** | Uso de campos JSONB en PostgreSQL para configuraciones dinamicas sin esquema fijo |
| 4 | **Tracking temporal** | Campos `dt_created` y `dt_updated` en la mayoria de entidades |
| 5 | **Estrategia hibrida acertada** | PostgreSQL para datos estructurados, MongoDB para conversaciones en tiempo real |
| 6 | **pgvector para busqueda semantica** | Uso de extension vectorial para busqueda por similitud |
| 7 | **Nomenclatura consistente** | Prefijos de tipo en columnas facilitan identificacion rapida |

---

## 7. Debilidades del Modelo

| # | Debilidad | Severidad | Descripcion |
|---|---|---|---|
| 1 | **Sin audit trail** | Alta | No hay tabla de auditoria ni registro de cambios (quien, cuando, que) |
| 2 | **Indexacion incompleta** | Alta | Faltan indices en columnas frecuentemente consultadas (foreign keys, campos de busqueda) |
| 3 | **Integridad referencial debil** | Alta | Algunas relaciones carecen de constraints ON DELETE/ON UPDATE apropiados |
| 4 | **Sin soft deletes** | Media | No hay mecanismo de borrado logico; los registros se eliminan fisicamente |
| 5 | **Ambiguedad Contact/Client** | Media | Dos entidades (Contact y Client) con propositos potencialmente superpuestos |
| 6 | **Tablas de chat en BD incorrecta** | Media | Las tablas de chat estan en PostgreSQL cuando deberian estar en MongoDB junto con conversaciones |
| 7 | **Sin versionado de esquema** | Baja | No hay mecanismo para versionar cambios de esquema mas alla de migraciones |
| 8 | **Sin particionamiento** | Baja | Tablas de alto volumen (mensajes, tokens) sin estrategia de particionamiento |

---

## 8. Diagrama de Relaciones (Simplificado)

```
                    [Company]
                   /    |    \
                  /     |     \
    [CompanyBranch] [CompanyPlan] [CompanyPrompts]
         |              |
    [Professional]   [Plan]
         |              |
    [Service]    [CompanyPlanControlToken]
         |
    [CategoryService]
         |
    [Appointment] <-- [Client]

    [Faqs] <-> [Tags]

    [SemanticSearch] (pgvector)

    --- MongoDB ---
    [conversations] -> [messages]
    [sessions] -> [token_usage]
```

---

## 9. Recomendaciones

### Prioridad Critica

1. **Implementar audit trail** - Crear tabla de auditoria para registrar todos los cambios (usuario, timestamp, entidad, accion, valores antes/despues)
2. **Agregar indices faltantes** - Analizar queries lentas y agregar indices en foreign keys y campos de busqueda frecuente
3. **Fortalecer integridad referencial** - Revisar y agregar constraints ON DELETE CASCADE/SET NULL/RESTRICT apropiados

### Prioridad Alta

4. **Implementar soft deletes** - Agregar campo `b_deleted` y `dt_deleted` en todas las entidades, filtrar en queries
5. **Resolver ambiguedad Contact/Client** - Definir claramente el proposito de cada entidad o unificar
6. **Mover tablas de chat a MongoDB** - Migrar entidades de chat a MongoDB para consistencia con el dominio de conversaciones

### Prioridad Media

7. Agregar indices compuestos para queries frecuentes
8. Implementar estrategia de particionamiento para tablas de alto volumen
9. Agregar constraints de validacion a nivel de base de datos (CHECK constraints)
10. Documentar el modelo de datos con diagrama ER completo

### Prioridad Baja

11. Evaluar normalizacion/desnormalizacion segun patrones de acceso
12. Implementar materialized views para reportes complejos
13. Agregar comentarios a tablas y columnas en PostgreSQL

---

## 10. Conclusion

El modelo de datos tiene una base solida con buena separacion de dominios y una estrategia hibrida acertada entre PostgreSQL y MongoDB. Sin embargo, la puntuacion de 6.5/10 refleja debilidades significativas que deben abordarse antes de produccion: la falta de audit trail, indexacion incompleta y ausencia de soft deletes son las mas criticas. Con las mejoras recomendadas, el modelo podria alcanzar facilmente un 8.5/10.

---

*Analisis generado el 2026-03-01 por Claude Code*
