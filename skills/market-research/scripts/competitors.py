#!/usr/bin/env python3
"""Scrape competitor pricing and features."""
import urllib.request, json, re, os, ssl, argparse

def main():
    parser = argparse.ArgumentParser(description='Competitor pricing scraper')
    parser.add_argument('--output', default='./docs/market-research/competitors_data.json', help='Output file path')
    args = parser.parse_args()

    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    competitors = {
        'tidio': {'url': 'https://www.tidio.com', 'pricing': 'https://www.tidio.com/pricing/'},
        'manychat': {'url': 'https://manychat.com', 'pricing': 'https://manychat.com/pricing'},
        'landbot': {'url': 'https://landbot.io', 'pricing': 'https://landbot.io/pricing'},
        'botpress': {'url': 'https://botpress.com', 'pricing': 'https://botpress.com/pricing'},
        'tawk': {'url': 'https://www.tawk.to', 'pricing': 'https://www.tawk.to/pricing/'},
        'respond_io': {'url': 'https://respond.io', 'pricing': 'https://respond.io/pricing'},
        'wati': {'url': 'https://www.wati.io', 'pricing': 'https://www.wati.io/pricing/'},
        'trengo': {'url': 'https://trengo.com', 'pricing': 'https://trengo.com/pricing'},
    }

    results = {}
    for name, urls in competitors.items():
        results[name] = {'urls': urls}
        for page_type, url in urls.items():
            try:
                req = urllib.request.Request(url, headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': 'text/html', 'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8'
                })
                resp = urllib.request.urlopen(req, timeout=15, context=ctx)
                html = resp.read().decode('utf-8', errors='ignore')[:50000]

                title = re.search(r'<title>(.*?)</title>', html, re.I|re.S)
                desc = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.I)
                prices = re.findall(r'\$\d+[\d,.]*(?:/mo(?:nth)?)?', html)

                results[name][page_type + '_data'] = {
                    'title': title.group(1).strip() if title else '',
                    'description': desc.group(1).strip() if desc else '',
                    'prices_found': list(set(prices))[:10],
                    'status': 'ok'
                }
                print(f'OK: {name}/{page_type}')
            except Exception as e:
                results[name][page_type + '_data'] = {'error': str(e), 'status': 'failed'}
                print(f'SKIP: {name}/{page_type} -> {e}')

    with open(args.output, 'w') as f:
        json.dump(results, f, indent=2)

if __name__ == '__main__':
    main()
