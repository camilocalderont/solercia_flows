#!/usr/bin/env python3
"""NPM downloads research - tool popularity."""
import urllib.request, json, os, argparse

def main():
    parser = argparse.ArgumentParser(description='NPM package popularity')
    parser.add_argument('--packages', default='botpress,@botpress/sdk,whatsapp-web.js,venom-bot,@builderbot/bot,node-telegram-bot-api,telegraf,discord.js,@grammyjs/core,baileys', help='Comma-separated package names')
    parser.add_argument('--output', default='./docs/market-research/npm_downloads.json', help='Output file path')
    args = parser.parse_args()

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    packages = [p.strip() for p in args.packages.split(',')]

    results = {}
    for pkg in packages:
        try:
            url = f'https://api.npmjs.org/downloads/point/last-month/{pkg}'
            req = urllib.request.Request(url)
            resp = urllib.request.urlopen(req, timeout=10)
            data = json.loads(resp.read())
            results[pkg] = data
            print(f'OK: {pkg} -> {data.get("downloads", 0):,} downloads/month')
        except Exception as e:
            results[pkg] = {'error': str(e)}

    with open(args.output, 'w') as f:
        json.dump(results, f, indent=2)

if __name__ == '__main__':
    main()
