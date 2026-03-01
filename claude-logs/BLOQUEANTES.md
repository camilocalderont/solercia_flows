# Bloqueantes para Camilo

## URGENTE - Seguridad

1. **API Key Gemini EXPUESTA en TAREAS.md** (linea 19): `AIzaSyBHE6h1HAKciAEyvhTazu1Mnx_K0rre4tI`
   - **ACCION**: Rotar INMEDIATAMENTE en Google Cloud Console
   - Mover a `.env` y nunca versionar
   - TAREAS.md esta staged en git (versionado)

2. **Credenciales PostgreSQL hardcodeadas** en docker-compose.yml: `SO5!2025`
   - Ya documentado en SEGURIDAD_RECOMENDACIONES.md
   - **ACCION**: Migrar a .env, rotar password

3. **boki-bot .env VERSIONADO con credenciales reales**:
   - Meta Bot Token: `EAAZAL8ZCr4U7MBO...` (EXPUESTO)
   - OpenAI API Key (comentada pero visible): `sk-proj-j6pBZ...`
   - API Token: `SMFGAHDJVqUr2xWifzjpLWC66qdNCPjFGonBROOKs`
   - PostgreSQL password: `SU2orange!` (comentado pero visible)
   - **ACCION**: Rotar TODOS estos tokens, quitar .env del tracking de git

4. **API tokens expuestos en flujos n8n** (AppointmentFlow.json):
   - `x-api-token: SMFGAHDJVqUr2xWifzjpLWC66qdNCPjFGonBROOKs`
   - Webhook UUIDs hardcodeados
   - **ACCION**: Usar n8n Credentials management, rotar tokens

5. **SQL Injection en flujos n8n**: Variables interpoladas sin parametrizar en queries PostgreSQL
   - **ACCION**: Implementar queries parametrizadas en todos los nodos PostgreSQL

## Tokens/Credenciales necesarias

4. **Slack/Discord Webhook** - para alertas de seguridad
5. **OpenAI API Key** - para LLM en boki-api
6. **Meta/WhatsApp API credentials** - para integracion WhatsApp
7. **Presupuesto para campanas** - investigacion de mercado sugiere necesidad de validacion

## Decisiones pendientes del humano

8. **Nicho primario**: Salud/belleza vs restaurantes vs otro - definir con base en reporte de mercado
9. **Modelo de negocio**: B2B vs B2C vs hibrido
10. **Dominio/branding**: BokiBot vs Solercia como marca del chatbot
