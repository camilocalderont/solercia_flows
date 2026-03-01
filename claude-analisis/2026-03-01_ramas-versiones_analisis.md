# Analisis Completo: Ramas y Versiones de Todos los Repositorios

**Fecha de analisis:** 2026-03-01

---

## 1. Resumen Ejecutivo

El ecosistema Solercia/Boki se compone de 5 proyectos distribuidos entre el monorepo principal (solercia_flows) y 3 repositorios independientes en GitHub. Este documento consolida el estado de ramas, versiones y commits recientes de cada uno para proveer una vision completa del estado del codigo.

---

## 2. Mapa de Repositorios

| Proyecto | Repositorio | Tipo |
|---|---|---|
| solercia_flows | Monorepo principal (local) | Monorepo con Docker Compose |
| boki-api | github.com/camilocalderont/boki-api | Repositorio independiente |
| boki-bot | github.com/camilocalderont/boki-bot | Repositorio independiente |
| boki-front | github.com/camilocalderont/boki-front | Repositorio independiente |
| solercia-web | Parte de solercia_flows | Directorio en monorepo (sin git separado) |

---

## 3. Detalle por Repositorio

### 3.1 solercia_flows (Monorepo Principal)

| Aspecto | Valor |
|---|---|
| **Rama actual** | main |
| **Ramas** | main, agitated-khorana |
| **Tags** | Ninguno |
| **Contenido** | Docker Compose, n8n flujos, configuracion Traefik, solercia-web |

**Commits recientes:**

| Hash | Mensaje |
|---|---|
| 09c25eb | Add CLAUDE.md for repository guidance and documentation |
| a5a6ac9 | se elimina bolt.diy del proyecto, se incluye el boki-api y la base de datos mongodb en el docker-compose.yml |
| 31c45ff | Actualizacion de la configuracion de Docker y Traefik: middlewares, headers, variables de entorno |
| e0fdf92 | Actualizacion Docker y Traefik: reglas de redireccion, certificados SAN, contexto empresarial |
| 68de7e9 | Eliminacion script de entrada para n8n, nuevo archivo CSS tema Solercia |

**Archivos staged/modificados:**

| Estado | Archivo |
|---|---|
| M | .gitignore |
| A | DYNAMIC_FLOWS_INTEGRATION_GUIDE.md |
| A | SEGURIDAD_RECOMENDACIONES.md |
| A | TAREAS.md |
| A | boki-bot (submodulo) |
| A | boki-front (submodulo) |
| A | n8n-flujos/*.json (5 flujos) |
| ?? | CLAUDE-AUTONOMO.md |

---

### 3.2 boki-api

| Aspecto | Valor |
|---|---|
| **Repositorio** | github.com/camilocalderont/boki-api |
| **Rama actual** | master (7b42f33) |
| **Version** | 1.0.0 |
| **Framework** | NestJS 11, TypeScript 5.5 |

**Ramas:**

| Rama | Estado | Ultimo commit / Descripcion |
|---|---|---|
| **master** | Activa | feat(n8n): endpoint create para n8n + auth sistema API Keys |
| Developer | Secundaria | Integracion MongoDB, cambios en esquemas de validacion |
| Luisito | Feature | Frecuencia de agendamiento, logica de disponibilidad |
| joi-pipes | Feature | Refactor de validacion con Joi pipes |
| monorepo | Obsoleta | Intento de reestructuracion a monorepo (abandonada) |

**Analisis de ramas:**

```
master ─────────────────────────────── (activa, 7b42f33)
  │
  ├── Developer ────────────────────── (MongoDB, validacion)
  │
  ├── Luisito ──────────────────────── (scheduling, availability)
  │
  ├── joi-pipes ────────────────────── (Joi refactor)
  │
  └── monorepo ─────────────────────── (obsoleta/abandonada)
```

---

### 3.3 boki-bot

| Aspecto | Valor |
|---|---|
| **Repositorio** | github.com/camilocalderont/boki-bot |
| **Rama actual** | flujos_quemados_whatsapp |
| **Version** | No especificada |
| **Framework** | Python con FastAPI |

**Ramas:**

| Rama | Estado | Descripcion |
|---|---|---|
| **flujos_quemados_whatsapp** | Activa | Flujos hardcoded de WhatsApp |
| master | Base | Rama principal |

**Ultimo commit relevante:**
- `feat(ai-appointment)` - Integracion con OpenAI para agendamiento por IA

**Nota:** Este proyecto parece ser una version anterior/alternativa del bot de WhatsApp, posiblemente reemplazado por la combinacion de boki-api + n8n flows.

---

### 3.4 boki-front

| Aspecto | Valor |
|---|---|
| **Repositorio** | github.com/camilocalderont/boki-front |
| **Rama actual** | master (6521573) |
| **Version** | 0.0.0 |
| **Framework** | Angular 20, Angular Material 20, Tailwind CSS 3.4.1 |
| **Bug conocido** | Nombre del paquete en package.json: `"boki-from"` (typo, deberia ser `"boki-front"`) |

**Ramas:**

| Rama | Estado | Descripcion |
|---|---|---|
| **master** | Activa | feat(plans): custom confirmation dialog |
| pnmc | Secundaria | Desarrollo alternativo |

---

### 3.5 solercia-web

| Aspecto | Valor |
|---|---|
| **Repositorio** | Parte del monorepo solercia_flows (sin git separado) |
| **Rama** | Sigue la rama del monorepo (main) |
| **Version** | 0.0.0 |
| **Framework** | Angular 20.1.0, Tailwind CSS 3.4.13 |

**Nota:** solercia-web no tiene repositorio git independiente. Su historial de cambios esta integrado en el monorepo principal solercia_flows.

---

## 4. Tabla Comparativa de Versiones

| Proyecto | Version | Framework | Framework Version | Lenguaje |
|---|---|---|---|---|
| solercia_flows | N/A | Docker Compose | - | YAML/Config |
| boki-api | 1.0.0 | NestJS | 11.1.6 | TypeScript 5.5 |
| boki-bot | No definida | FastAPI | - | Python |
| boki-front | 0.0.0 | Angular | 20.0.0 | TypeScript |
| solercia-web | 0.0.0 | Angular | 20.1.0 | TypeScript |

---

## 5. Estado de Ramas Consolidado

### Total de ramas por repositorio

| Repositorio | Ramas | Activa | Obsoletas |
|---|---|---|---|
| solercia_flows | 2 | main | agitated-khorana (?) |
| boki-api | 5 | master | monorepo |
| boki-bot | 2 | flujos_quemados_whatsapp | - |
| boki-front | 2 | master | - |
| solercia-web | N/A | (sigue monorepo) | - |
| **Total** | **11** | **4** | **1-2** |

### Convencion de ramas

| Repositorio | Rama principal | Convencion de nombres |
|---|---|---|
| solercia_flows | main | Descriptiva / autogenerada |
| boki-api | master | Feature branches (Developer, Luisito, etc.) |
| boki-bot | flujos_quemados_whatsapp | Descriptiva en espanol |
| boki-front | master | Descriptiva |

**Nota:** No hay convencion unificada de nombres de ramas entre repositorios. Algunos usan `main`, otros `master`, y las ramas feature no siguen un patron consistente (no hay prefijos como `feature/`, `bugfix/`, etc.).

---

## 6. Diagrama de Dependencias entre Repos

```
solercia_flows (monorepo)
├── docker-compose.yml
│   ├── traefik (config)
│   ├── postgres (imagen oficial)
│   ├── mongo_db (imagen oficial)
│   ├── flows / n8n (imagen oficial + n8n-flujos/)
│   ├── boki-api ──────── github.com/camilocalderont/boki-api (submodulo)
│   └── solercia-web ──── (directorio local, Angular 20.1.0)
│
├── boki-front ────────── github.com/camilocalderont/boki-front (submodulo)
│   └── Consume: boki-api REST endpoints
│
└── boki-bot ──────────── github.com/camilocalderont/boki-bot (submodulo)
    └── Consume: OpenAI API (version legacy?)
```

---

## 7. Recomendaciones

### Prioridad Alta

1. **Unificar convencion de rama principal** - Decidir entre `main` y `master` y aplicar uniformemente
2. **Establecer convencion de nombres de ramas** - Implementar prefijos: `feature/`, `bugfix/`, `hotfix/`, `release/`
3. **Limpiar ramas obsoletas** - Eliminar rama `monorepo` de boki-api
4. **Definir versiones** - Asignar versiones semanticas (semver) significativas a boki-bot (sin version) y boki-front/solercia-web (0.0.0)
5. **Corregir typo** - Renombrar paquete `"boki-from"` a `"boki-front"` en package.json

### Prioridad Media

6. Implementar tags de release en todos los repositorios
7. Configurar proteccion de ramas principales (branch protection rules)
8. Establecer flujo de Git Flow o GitHub Flow unificado
9. Evaluar si boki-bot sigue siendo necesario o si fue reemplazado por n8n flows
10. Considerar mover boki-front al monorepo o definir claramente la estrategia de repos

### Prioridad Baja

11. Configurar CI/CD pipelines para cada repositorio
12. Implementar conventional commits en todos los repos
13. Agregar CHANGELOG.md automatizado
14. Configurar dependabot o renovate para actualizacion de dependencias

---

## 8. Conclusion

El ecosistema Solercia/Boki tiene una estructura de repositorios funcional pero que carece de convenciones unificadas. La mezcla de `main` y `master`, la ausencia de versionado semantico real, y la falta de una estrategia de branching definida son areas de mejora que facilitarian la colaboracion y el proceso de release. La rama `monorepo` abandonada en boki-api y el proyecto boki-bot (posiblemente legacy) deberian evaluarse para limpieza.

---

*Analisis generado el 2026-03-01 por Claude Code*
