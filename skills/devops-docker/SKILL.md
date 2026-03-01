---
name: devops-docker
description: >
  Estandar DevOps para Docker, Traefik y despliegue de BokiBot: compose, networking, SSL, seguridad, env management.
  Trigger: When modifying docker-compose.yml, Traefik config, Dockerfiles, or deployment configuration.
metadata:
  author: solercia
  version: "1.0"
---

# Skill: DevOps Docker - BokiBot/Solercia

## 1. Cuando Usar Esta Skill

Activar esta skill cuando se trabaje en cualquiera de las siguientes situaciones:

- Modificar o agregar servicios en `docker-compose.yml`
- Configurar o ajustar Traefik (routers, middlewares, certificados)
- Crear o editar un `Dockerfile`
- Gestionar variables de entorno (`.env`, `.env.example`)
- Configurar redes, volumenes o persistencia de datos
- Resolver problemas de conectividad entre servicios
- Agregar un nuevo subdominio o servicio al stack
- Revisar la seguridad de la infraestructura Docker

---

## 2. Docker Compose (OBLIGATORIO)

### Reglas Fundamentales

1. **Un solo archivo `docker-compose.yml`**: Todos los servicios DEBEN definirse en el archivo raiz del proyecto. No fragmentar en multiples archivos compose.

2. **Red compartida `red_solercia_com_co`**: Todos los servicios DEBEN conectarse a esta red bridge. Es la red interna que permite la comunicacion entre contenedores.

```yaml
networks:
  red_solercia_com_co:
    name: red_solercia_com_co
    driver: bridge
```

3. **Variables en `.env`, NUNCA credenciales en codigo**: Toda configuracion sensible se referencia desde el archivo `.env` usando la sintaxis `${VARIABLE}`. Valores por defecto solo para configuraciones no sensibles: `${API_VERSION:-1}`.

4. **Builds multi-stage para produccion**: Los servicios con codigo propio (como `boki-api`) DEBEN usar Dockerfile multi-stage para optimizar el tamano de imagen.

```yaml
# CORRECTO: build multi-stage con target de produccion
boki-api:
  build:
    context: ./boki-api
    dockerfile: Dockerfile
    target: production
```

5. **Healthchecks en TODOS los servicios**: Cada servicio DEBE tener un healthcheck configurado. Los servicios dependientes usan `depends_on` con `condition: service_healthy`.

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
  interval: 10s
  timeout: 5s
  retries: 5
```

6. **`restart: unless-stopped`**: Todos los servicios DEBEN usar esta politica de reinicio (o `always` para servicios criticos como n8n).

7. **`container_name` explicito**: Cada servicio DEBE tener un `container_name` definido para facilitar la identificacion en logs y comandos.

### Estructura del Servicio

Orden recomendado de las claves en cada servicio:

```yaml
servicio:
  image: o build:          # 1. Origen de la imagen
  container_name:          # 2. Nombre del contenedor
  restart: unless-stopped  # 3. Politica de reinicio
  healthcheck:             # 4. Verificacion de salud
  environment:             # 5. Variables de entorno
  depends_on:              # 6. Dependencias
  networks:                # 7. Redes
  volumes:                 # 8. Volumenes
  labels:                  # 9. Labels de Traefik (si aplica)
  # ports: NUNCA exponer directamente (excepto Traefik)
```

---

## 3. Traefik Reverse Proxy

### Configuracion Base

Traefik es el unico punto de entrada al stack. Maneja:

- **HTTPS automatico** con Let's Encrypt (challenge TLS)
- **Certificado SAN** unico que cubre todos los subdominios
- **Redireccion HTTP a HTTPS** automatica y permanente
- **Middlewares de seguridad** globales

### Certificado SAN (Subject Alternative Name)

Un solo certificado cubre todos los subdominios. Se configura en los argumentos de Traefik:

```yaml
command:
  # Certificado SAN: un solo certificado para todos los subdominios
  - "--entrypoints.websecure.http.tls.domains[0].main=${SUBDOMAIN_WEB}.${DOMAIN_NAME}"
  - "--entrypoints.websecure.http.tls.domains[0].sans=${SUBDOMAIN_FLOWS}.${DOMAIN_NAME},${SUBDOMAIN_BOKI_API}.${DOMAIN_NAME}"
```

### Middlewares de Seguridad

Se definen como labels en el servicio `traefik` y se referencian en los routers:

| Middleware | Funcion |
|---|---|
| `secure-headers` | HSTS, XSS filter, content-type nosniff, frame deny |
| `n8n-headers` | Como secure-headers pero permite frames (SAMEORIGIN) |
| `compress` | Compresion gzip/brotli |
| `rate-limit` | Limite de peticiones (50 avg / 100 burst) |
| `secure-stack` | Cadena: compress + rate-limit (se aplica globalmente) |
| `n8n-stack` | Cadena: n8n-headers + compress + rate-limit |
| `redirect-to-www` | Redirige dominio raiz a www |

### Patron de Labels para un Servicio

Para exponer un servicio a traves de Traefik, se usan labels:

```yaml
labels:
  - traefik.enable=true
  - traefik.docker.network=red_solercia_com_co

  # Router HTTPS
  - traefik.http.routers.NOMBRE.rule=Host(`${SUBDOMAIN}.${DOMAIN_NAME}`)
  - traefik.http.routers.NOMBRE.entrypoints=websecure
  - traefik.http.routers.NOMBRE.tls=true
  - traefik.http.routers.NOMBRE.tls.certresolver=letsencrypt
  - traefik.http.routers.NOMBRE.service=NOMBRE@docker
  - traefik.http.routers.NOMBRE.middlewares=secure-stack@docker

  # Servicio (puerto interno del contenedor)
  - traefik.http.services.NOMBRE.loadbalancer.server.port=PUERTO_INTERNO
```

### Estructura de Dominios

| Subdominio | Servicio | Puerto Interno |
|---|---|---|
| `www.solercia.com.co` | solercia-web (nginx) | 80 |
| `flows.solercia.com.co` | n8n | 5678 |
| `boki-api.solercia.com.co` | boki-api (NestJS) | 3000 |
| `traefik.solercia.com.co` | Dashboard Traefik | api@internal |
| `solercia.com.co` | Redirige a www | - |

---

## 4. Variables de Entorno (CRITICO)

### Reglas Estrictas

1. **`.env` para TODOS los secretos**: Contrasenas, API keys, tokens, credenciales de base de datos. NUNCA en codigo.

2. **`.env.example` como plantilla**: Contiene TODAS las variables con valores vacios o de ejemplo. Se commitea a git.

3. **`.gitignore` DEBE incluir `.env`**: Verificar siempre que `.env` esta en `.gitignore`. NUNCA commitear el archivo `.env`.

4. **Convenciones de nombres de variables**:

| Prefijo/Patron | Uso | Ejemplo |
|---|---|---|
| `DOMAIN_NAME` | Dominio principal | `solercia.com.co` |
| `SUBDOMAIN_*` | Subdominios | `SUBDOMAIN_WEB=www` |
| `POSTGRES_*` | Credenciales PostgreSQL | `POSTGRES_PASSWORD=` |
| `MONGO_*` | Credenciales MongoDB | `MONGO_PASSWORD=` |
| `META_*` | WhatsApp Meta API | `META_BOT_TOKEN=` |
| `ACC_*` | Twilio | `ACC_SID=` |
| `LLM_*` | OpenAI/LLM | `LLM_APIKEY=` |
| `JWT_*` | Autenticacion | `JWT_SECRET=` |
| `ACME_*` | Let's Encrypt | `ACME_EMAIL=` |
| `TRAEFIK_*` | Traefik auth | `TRAEFIK_BASIC_AUTH_USER=` |

5. **Valores por defecto** solo para configuraciones NO sensibles:

```yaml
# CORRECTO: valor por defecto para configuracion
API_VERSION: ${API_VERSION:-1}
LLM_MODEL: ${LLM_MODEL:-gpt-4o-mini}
GENERIC_TIMEZONE: ${GENERIC_TIMEZONE:-America/Bogota}

# INCORRECTO: valor por defecto para secreto
JWT_SECRET: ${JWT_SECRET:-mi-secreto-123}  # NUNCA HACER ESTO
```

---

## 5. Exposicion de Puertos

### Regla Principal

**Solo Traefik expone puertos al host** (80 y 443). Todos los demas servicios se comunican exclusivamente a traves de la red interna Docker.

```yaml
# CORRECTO: Solo Traefik expone puertos
traefik:
  ports:
    - "80:80"
    - "443:443"

# CORRECTO: Servicio interno sin puertos expuestos
postgres:
  # SIN seccion 'ports:'
  networks:
    - red_solercia_com_co

# INCORRECTO: Base de datos con puerto expuesto
postgres:
  ports:
    - "5432:5432"  # PELIGRO: accesible desde internet
```

### Desarrollo Local

Para acceso temporal desde el host durante desarrollo, usar binding a `127.0.0.1`:

```yaml
# Solo para desarrollo, NUNCA en produccion
# Descomentar temporalmente:
# ports:
#   - "127.0.0.1:5433:5432"
```

### Comunicacion Entre Servicios

Los servicios se referencian por su nombre de servicio dentro de la red Docker:

```yaml
# Dentro de la red Docker, el host es el nombre del servicio
POSTGRES_DB_HOST: postgres        # No localhost, no IP
MONGO_URI: mongodb://...@mongo_db:27017/...  # Nombre del servicio como host
```

---

## 6. Volumenes y Persistencia

### Volumenes Nombrados (Bases de Datos)

Usar volumenes nombrados para datos que deben persistir entre reinicios:

```yaml
volumes:
  postgres-data:     # Datos de PostgreSQL
  n8n_data:          # Datos y configuracion de n8n
  mongo_data:        # Datos de MongoDB
  mongo_config:      # Configuracion de MongoDB
```

```yaml
# En el servicio:
postgres:
  volumes:
    - "postgres-data:/var/lib/postgresql/data"

mongo_db:
  volumes:
    - mongo_data:/data/db
    - mongo_config:/data/configdb
```

### Bind Mounts (Codigo y Configuracion)

Usar bind mounts para archivos que se editan en el host:

```yaml
# Codigo compilado (solo lectura)
solercia-web:
  volumes:
    - ./solercia-web/dist/solercia-web/browser:/usr/share/nginx/html:ro
    - ./solercia-web/nginx.conf:/etc/nginx/conf.d/default.conf:ro

# Archivos de la aplicacion
boki-api:
  volumes:
    - ./boki-api/uploads:/app/uploads
    - ./boki-api/logs:/app/logs

# Configuracion de Traefik
traefik:
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro  # SIEMPRE :ro
    - ./traefik/logs:/logs
    - ./traefik/certs:/certs
```

### Reglas de Volumenes

- **Docker socket siempre `:ro`**: El socket de Docker se monta solo lectura por seguridad.
- **Archivos estaticos `:ro`**: HTML, configuracion de nginx, etc.
- **Datos de aplicacion sin `:ro`**: uploads, logs, datos de BD necesitan escritura.
- **Nunca montar `/` o directorios del sistema**.

---

## 7. Checklist de Seguridad

Antes de hacer deploy o merge de cambios de infraestructura, verificar:

- [ ] **Sin credenciales hardcodeadas**: Todas las contrasenas, tokens y API keys estan en `.env`
- [ ] **`.env` en `.gitignore`**: El archivo `.env` NO se sube a git
- [ ] **`.env.example` actualizado**: Toda nueva variable se agrega a `.env.example` sin valores reales
- [ ] **Sin puertos de BD expuestos**: PostgreSQL (5432) y MongoDB (27017) NO tienen seccion `ports:`
- [ ] **Solo Traefik expone 80/443**: Ningun otro servicio tiene puertos mapeados al host
- [ ] **Healthchecks configurados**: Todos los servicios tienen `healthcheck:`
- [ ] **`depends_on` con `condition: service_healthy`**: Servicios dependientes esperan a que sus dependencias esten saludables
- [ ] **Headers de seguridad activos**: HSTS, XSS filter, content-type nosniff via Traefik
- [ ] **Docker socket en solo lectura**: `/var/run/docker.sock:/var/run/docker.sock:ro`
- [ ] **Usuario no-root en Dockerfile**: La imagen usa un usuario no privilegiado (`USER nodejs`)
- [ ] **`dumb-init` como entrypoint**: Para manejo correcto de senales en contenedores
- [ ] **Politica de reinicio definida**: `restart: unless-stopped` en todos los servicios
- [ ] **Red Docker correcta**: Todos los servicios en `red_solercia_com_co`
- [ ] **Certificados SSL/TLS funcionando**: Verificar que Let's Encrypt emite y renueva correctamente

---

## 8. Anti-Patrones (NO HACER)

### 8.1 Credenciales Hardcodeadas

```yaml
# MAL: Credenciales directamente en el compose
environment:
  POSTGRES_PASSWORD: mi_password_super_secreta
  JWT_SECRET: abc123
  LLM_APIKEY: sk-1234567890abcdef

# BIEN: Referencias a .env
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  JWT_SECRET: ${JWT_SECRET}
  LLM_APIKEY: ${LLM_APIKEY}
```

### 8.2 Puertos de Base de Datos Expuestos

```yaml
# MAL: BD accesible desde internet
postgres:
  ports:
    - "5432:5432"

mongo_db:
  ports:
    - "27017:27017"

# BIEN: Sin puertos expuestos, solo red interna
postgres:
  networks:
    - red_solercia_com_co
  # Sin seccion ports
```

### 8.3 Sin Healthcheck

```yaml
# MAL: Sin healthcheck ni depends_on condicional
boki-api:
  depends_on:
    - mongo_db  # No espera a que este saludable

# BIEN: Healthcheck + depends_on condicional
boki-api:
  healthcheck:
    test: ["CMD", "wget", "--spider", "http://localhost:3000/api-docs"]
    interval: 30s
    timeout: 10s
    retries: 3
  depends_on:
    mongo_db:
      condition: service_healthy
```

### 8.4 Imagen sin Tag de Version

```yaml
# MAL: Sin tag o con 'latest'
image: postgres
image: nginx:latest
image: traefik:latest

# BIEN: Tag de version especifico
image: postgres:14.5
image: nginx:1.27-alpine
image: traefik:v3.5.0
```

### 8.5 Docker Socket sin Solo Lectura

```yaml
# MAL: Socket con permisos de escritura
volumes:
  - /var/run/docker.sock:/var/run/docker.sock

# BIEN: Socket en solo lectura
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

### 8.6 Correr como Root en Produccion

```dockerfile
# MAL: Proceso corriendo como root
CMD ["node", "dist/app.js"]

# BIEN: Usuario no privilegiado
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodejs
USER nodejs
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/app.js"]
```

### 8.7 Red por Defecto de Docker

```yaml
# MAL: Sin red definida (usa la red por defecto)
services:
  mi-servicio:
    image: mi-imagen

# BIEN: Red explicita compartida
services:
  mi-servicio:
    image: mi-imagen
    networks:
      - red_solercia_com_co

networks:
  red_solercia_com_co:
    name: red_solercia_com_co
    driver: bridge
```

---

## 9. Comandos de Referencia

### Gestion de Servicios

```bash
# Iniciar todos los servicios
docker compose up -d

# Detener todos los servicios
docker compose down

# Ver logs en tiempo real
docker compose logs -f [servicio]

# Reiniciar un servicio especifico
docker compose restart [servicio]

# Reconstruir y reiniciar un servicio
docker compose up -d --build [servicio]

# Ver estado de los servicios
docker compose ps

# Ver uso de recursos
docker stats
```

### Nombres de servicios disponibles:

`traefik`, `postgres`, `flows`, `solercia-web`, `mongo_db`, `boki-api`

### Depuracion

```bash
# Verificar configuracion del compose (sin ejecutar)
docker compose config

# Inspeccionar un contenedor
docker inspect [container_name]

# Ejecutar comando dentro de un contenedor
docker exec -it [container_name] sh

# Ver redes Docker
docker network ls
docker network inspect red_solercia_com_co

# Ver volumenes
docker volume ls

# Verificar certificados SSL
docker exec traefik cat /certs/acme.json | jq '.letsencrypt.Certificates'

# Ver logs de Traefik
docker exec traefik cat /logs/traefik.log | tail -50
```

### Mantenimiento

```bash
# Limpiar imagenes no utilizadas
docker image prune -a

# Limpiar volumenes huerfanos (CUIDADO: puede eliminar datos)
docker volume prune

# Limpiar todo lo no utilizado
docker system prune -a

# Backup de volumen de PostgreSQL
docker exec postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB_NAME} > backup.sql

# Backup de volumen de MongoDB
docker exec mongo_boki mongodump --archive=/tmp/backup.gz --gzip
docker cp mongo_boki:/tmp/backup.gz ./backup-mongo.gz
```

### Despliegue

```bash
# Despliegue completo (pull + build + restart)
docker compose pull && docker compose up -d --build

# Despliegue de un solo servicio sin downtime
docker compose up -d --build --no-deps [servicio]

# Verificar que todo esta corriendo
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```
