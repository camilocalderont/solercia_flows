# Bloqueantes para Camilo

## URGENTE - Seguridad (requiere accion humana)

1. **~~API Key Gemini EXPUESTA en TAREAS.md~~** → CORREGIDO (removida del archivo)
   - **ACCION PENDIENTE**: Rotar la key en Google Cloud Console (ya fue expuesta en git history)
   - La nueva key debe ir en `.env` como `GEMINI_API_KEY`

2. **~~Credenciales PostgreSQL hardcodeadas~~** → YA USA .env
   - **ACCION PENDIENTE**: Verificar que el password en `.env` sea fuerte (no `SO5!2025`)

3. **boki-bot .env VERSIONADO con credenciales reales** (repo independiente):
   - Meta Bot Token: `EAAZAL8ZCr4U7MBO...` (EXPUESTO)
   - OpenAI API Key (comentada pero visible): `sk-proj-j6pBZ...`
   - API Token: `SMFGAHDJVqUr2xWifzjpLWC66qdNCPjFGonBROOKs`
   - PostgreSQL password: `SU2orange!` (comentado pero visible)
   - **ACCION**: Rotar TODOS estos tokens, purgar git history de boki-bot

4. **~~API tokens expuestos en flujos n8n~~** → CORREGIDO en v2
   - **ACCION PENDIENTE**: Importar los flows de `n8n-flujos/v2/` en n8n
   - Configurar variables de entorno en n8n: `API_TOKEN`, `API_URL`, `WEBHOOK_URL`

5. **~~MongoDB credentials hardcoded en docker-compose.yml~~** → CORREGIDO
   - **ACCION PENDIENTE**: Definir `MONGO_USER`, `MONGO_PASSWORD`, `MONGO_DB_NAME` en `.env`

6. **SQL Injection en flujos n8n**: Variables interpoladas sin parametrizar
   - Documentado en `n8n-flujos/v2/CHANGELOG.md`
   - **ACCION**: Migrar queries directas a boki-api endpoints (mediano plazo)

## Pendientes de codigo (no bloqueantes)

7. **JWT_SECRET config bug** en boki-api/src/api/config.ts
   - Lee de variable equivocada
   - **ACCION**: Verificar y corregir en siguiente iteracion

8. **CORS sin restricciones** en boki-api
   - **ACCION**: Restringir a dominios permitidos

9. **Semantic search endpoint publico** en boki-api
   - **ACCION**: Agregar autenticacion

## Tokens/Credenciales necesarias para produccion

10. **Slack/Discord Webhook** - para alertas de seguridad y monitoreo
11. **OpenAI API Key** - para LLM en boki-api (verificar la actual)
12. **Meta/WhatsApp API credentials** - para integracion WhatsApp (rotar las expuestas)
13. **Presupuesto para campanas** - investigacion de mercado sugiere $5.5M COP/mes minimo

## Decisiones pendientes del humano

14. **Nicho primario**: Salud (recomendado) vs belleza vs restaurantes
15. **Modelo de negocio**: B2B SaaS (recomendado) con 3 tiers ($12/$30/$60 USD/mes)
16. **Dominio/branding**: BokiBot vs Solercia como marca del chatbot
17. **API del chatbot web**: Usar OpenAI (existente) o Gemini (nueva key) para el widget web
