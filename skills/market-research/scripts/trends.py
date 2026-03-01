#!/usr/bin/env python3
"""Google Trends research script for BokiBot market analysis."""
import json, time, os, sys, argparse

def main():
    parser = argparse.ArgumentParser(description='Google Trends research')
    parser.add_argument('--keywords', default='chatbot citas,chatbot whatsapp,agendar citas online,bot whatsapp,chatbot empresa', help='Comma-separated keywords')
    parser.add_argument('--geo', default='CO', help='Country code (default: CO)')
    parser.add_argument('--output', default='./docs/market-research/google_trends_data.json', help='Output file path')
    args = parser.parse_args()

    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    try:
        from pytrends.request import TrendReq
    except ImportError:
        print('ERROR: pip install pytrends')
        sys.exit(1)

    pytrends = TrendReq(hl='es-CO', tz=300)
    keywords = [k.strip() for k in args.keywords.split(',')]

    # Split into groups of 5 (pytrends limit)
    groups = [keywords[i:i+5] for i in range(0, len(keywords), 5)]
    all_results = {'trends': {}, 'related': {}, 'suggestions': {}}

    for group in groups:
        try:
            pytrends.build_payload(group, cat=0, timeframe='today 12-m', geo=args.geo)
            interest = pytrends.interest_over_time()
            if not interest.empty:
                interest.index = interest.index.astype(str)
                all_results['trends'][','.join(group)] = {
                    col: dict(zip(interest.index, interest[col].tolist()))
                    for col in interest.columns
                }

            related = pytrends.related_queries()
            for kw, data in related.items():
                all_results['related'][kw] = {}
                for qtype, df in data.items():
                    if df is not None and hasattr(df, 'to_dict'):
                        all_results['related'][kw][qtype] = df.to_dict(orient='records')

            for kw in group:
                sugg = pytrends.suggestions(kw)
                all_results['suggestions'][kw] = sugg

            time.sleep(3)
        except Exception as e:
            all_results[f'error_{",".join(group)}'] = str(e)
            print(f'ERROR: {e}')
            time.sleep(5)

    # Regional interest
    try:
        pytrends.build_payload(['chatbot'], cat=0, timeframe='today 12-m', geo=args.geo)
        regions = pytrends.interest_by_region(resolution='CITY')
        if not regions.empty:
            all_results['regions'] = regions.to_dict(orient='dict')
    except Exception as e:
        all_results['regions_error'] = str(e)

    with open(args.output, 'w') as f:
        json.dump(all_results, f, indent=2, default=str)
    print(f'OK: Google Trends data saved to {args.output}')

if __name__ == '__main__':
    main()
