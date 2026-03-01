#!/usr/bin/env python3
"""GitHub landscape research - find open source competitors."""
import urllib.request, json, os, sys, argparse

def main():
    parser = argparse.ArgumentParser(description='GitHub competitor landscape')
    parser.add_argument('--queries', default='chatbot+appointment+booking,whatsapp+chatbot+scheduling,chatbot+agenda+citas,n8n+chatbot+whatsapp,appointment+bot+calendar', help='Comma-separated search queries')
    parser.add_argument('--output', default='./docs/market-research/github_landscape.json', help='Output file path')
    args = parser.parse_args()

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    queries = [q.strip() for q in args.queries.split(',')]

    all_repos = []
    for q in queries:
        try:
            url = f'https://api.github.com/search/repositories?q={q}&sort=stars&order=desc&per_page=10'
            req = urllib.request.Request(url, headers={'User-Agent': 'BokiBot-Research/1.0'})
            resp = urllib.request.urlopen(req, timeout=15)
            data = json.loads(resp.read())
            for r in data.get('items', []):
                all_repos.append({
                    'name': r['full_name'], 'stars': r['stargazers_count'],
                    'forks': r['forks_count'], 'description': r['description'],
                    'url': r['html_url'], 'language': r['language'],
                    'updated': r['updated_at'], 'topics': r.get('topics', []),
                    'query': q
                })
            print(f'OK: {q} -> {len(data.get("items", []))} repos')
        except Exception as e:
            print(f'SKIP: {q} -> {e}')

    seen = set()
    unique = []
    for r in sorted(all_repos, key=lambda x: x['stars'], reverse=True):
        if r['name'] not in seen:
            seen.add(r['name'])
            unique.append(r)

    with open(args.output, 'w') as f:
        json.dump(unique, f, indent=2)
    print(f'Total unique repos: {len(unique)}')

if __name__ == '__main__':
    main()
