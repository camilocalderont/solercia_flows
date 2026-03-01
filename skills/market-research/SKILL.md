# Market Research Skill

## Descripcion
Skill reutilizable para investigacion de mercado de BokiBot. Recopila datos de multiples fuentes y genera reportes automaticos.

## Fuentes de datos
1. **Google Trends** (pytrends) - Interes de busqueda por keyword y region
2. **GitHub** (API publica) - Landscape de competidores open source
3. **Competidores** (scraping) - Pricing y features de SaaS competidores
4. **NPM** (API publica) - Popularidad de herramientas/frameworks de bot

## Requisitos
```bash
pip3 install pytrends --break-system-packages
```

## Ejecucion

### Completa (todas las fuentes)
```bash
cd /Users/camilocalderont/Proyectos/SOLERCIA/solercia_flows
python3 skills/market-research/scripts/trends.py && \
python3 skills/market-research/scripts/github.py && \
python3 skills/market-research/scripts/competitors.py && \
python3 skills/market-research/scripts/npm.py && \
python3 skills/market-research/scripts/compile.py
```

### Individual
```bash
# Solo Google Trends con keywords personalizados
python3 skills/market-research/scripts/trends.py --keywords "chatbot,odontologia,citas" --geo CO

# Solo GitHub con queries custom
python3 skills/market-research/scripts/github.py --queries "whatsapp+bot,chatbot+colombia"

# Solo NPM
python3 skills/market-research/scripts/npm.py --packages "whatsapp-web.js,baileys,telegraf"

# Solo competidores
python3 skills/market-research/scripts/competitors.py

# Compilar reporte
python3 skills/market-research/scripts/compile.py --data-dir ./docs/market-research
```

### Output
- Datos crudos: `./docs/market-research/*.json`
- Reporte compilado: `./docs/market-research/YYYY-MM-DD_reporte-mercado.md`

## Parametros

### trends.py
- `--keywords`: Keywords separados por coma (max 5 por grupo)
- `--geo`: Codigo de pais (default: CO)
- `--output`: Ruta del archivo de salida

### github.py
- `--queries`: Busquedas separadas por coma (formato URL encoded)
- `--output`: Ruta del archivo de salida

### competitors.py
- `--output`: Ruta del archivo de salida
- Competidores hardcodeados en el script (editar para agregar/quitar)

### npm.py
- `--packages`: Paquetes NPM separados por coma
- `--output`: Ruta del archivo de salida

### compile.py
- `--data-dir`: Directorio con los JSON de datos
- `--output`: Ruta del reporte final (default: auto-genera con fecha)

## Integracion con subagentes
Este skill puede ser invocado por cualquier agente que necesite datos de mercado. El CEO o Marketing agent pueden:
1. Ejecutar el skill completo para datos frescos
2. Ejecutar solo una fuente especifica
3. Leer los JSON para analisis personalizado
