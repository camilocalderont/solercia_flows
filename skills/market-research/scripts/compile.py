#!/usr/bin/env python3
"""Compile all market research data into a final report."""
import json, os, argparse
from datetime import datetime

def load_json(path):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception as e:
        return {'error': str(e)}

def main():
    parser = argparse.ArgumentParser(description='Compile market research report')
    parser.add_argument('--data-dir', default='./docs/market-research', help='Directory with raw data')
    parser.add_argument('--output', default=None, help='Output file path')
    args = parser.parse_args()

    if args.output is None:
        args.output = os.path.join(args.data_dir, f'{datetime.now().strftime("%Y-%m-%d")}_reporte-mercado.md')

    trends = load_json(os.path.join(args.data_dir, 'google_trends_data.json'))
    github = load_json(os.path.join(args.data_dir, 'github_landscape.json'))
    competitors = load_json(os.path.join(args.data_dir, 'competitors_data.json'))
    npm = load_json(os.path.join(args.data_dir, 'npm_downloads.json'))

    report = f"""# Reporte de Investigacion de Mercado - BokiBot
## Fecha: {datetime.now().strftime('%Y-%m-%d')}
## Fuentes utilizadas

| Fuente | Estado | Datos |
|--------|--------|-------|
| Google Trends | {'OK' if 'trends' in trends else 'ERROR'} | {len(trends.get('trends', {}))} grupos de keywords |
| GitHub Repos | {'OK' if isinstance(github, list) else 'ERROR'} | {len(github) if isinstance(github, list) else 0} repos |
| Competidores | {'OK' if isinstance(competitors, dict) and 'error' not in competitors else 'ERROR'} | {len([k for k in competitors if not k.startswith('error')]) if isinstance(competitors, dict) else 0} competidores |
| NPM Downloads | {'OK' if isinstance(npm, dict) and 'error' not in npm else 'ERROR'} | {len(npm) if isinstance(npm, dict) else 0} paquetes |

---

### 1. Ecosistema Open Source (GitHub)

| Repo | Estrellas | Forks | Lenguaje | Descripcion |
|------|-----------|-------|----------|-------------|
"""
    if isinstance(github, list):
        for r in github[:15]:
            desc = (r.get('description') or '')[:60]
            report += f"| [{r['name']}]({r['url']}) | {r['stars']:,} | {r['forks']:,} | {r.get('language','N/A')} | {desc} |\n"

    report += "\n### 2. Popularidad de Herramientas (NPM)\n\n| Paquete | Descargas/mes |\n|---------|---------------|\n"
    if isinstance(npm, dict):
        sorted_npm = sorted(npm.items(), key=lambda x: x[1].get('downloads', 0) if isinstance(x[1], dict) else 0, reverse=True)
        for pkg, data in sorted_npm:
            dl = data.get('downloads', 'N/A') if isinstance(data, dict) else 'Error'
            report += f"| {pkg} | {dl:,} |\n" if isinstance(dl, int) else f"| {pkg} | {dl} |\n"

    report += "\n### 3. Competidores y Pricing\n\n| Nombre | Titulo | Precios encontrados |\n|--------|--------|--------------------|\n"
    if isinstance(competitors, dict):
        for name, data in competitors.items():
            if isinstance(data, dict):
                pricing_data = data.get('pricing_data', {})
                if isinstance(pricing_data, dict):
                    title = pricing_data.get('title', 'N/A')[:50]
                    prices = ', '.join(pricing_data.get('prices_found', [])[:5]) or 'No disponible'
                    report += f"| {name} | {title} | {prices} |\n"

    report += """
### 4. Analisis de datos disponible

Los datos crudos en formato JSON estan disponibles en:
- `./docs/market-research/google_trends_data.json`
- `./docs/market-research/github_landscape.json`
- `./docs/market-research/competitors_data.json`
- `./docs/market-research/npm_downloads.json`

> **Nota**: Este reporte se genera automaticamente con los datos recolectados. Para un analisis mas profundo con recomendaciones de nicho, modelo de negocio y campanas, consultar el reporte manual complementario.
"""

    with open(args.output, 'w') as f:
        f.write(report)
    print(f'OK: Report written to {args.output}')

if __name__ == '__main__':
    main()
