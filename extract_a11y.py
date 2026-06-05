import json

with open('sonar_issues.json', 'r') as f:
    data = json.load(f)
if isinstance(data, dict):
    issues = data.get('issues', [])
else:
    issues = data

targets = ['javascript:S6853', 'javascript:S6848', 'css:S7924']
results = {t: {} for t in targets}

for issue in issues:
    rule = issue.get('rule')
    if rule in targets:
        comp = issue.get('component', '').split(':')[-1]
        if 'src/components' in comp:
            line = issue.get('textRange', {}).get('startLine', 'N/A')
            msg = issue.get('message', '')
            if comp not in results[rule]:
                results[rule][comp] = []
            results[rule][comp].append({'line': line, 'msg': msg})

for rule in targets:
    print(f'\n--- {rule} ---')
    for comp, lines in results[rule].items():
        print(f'{comp}:')
        for l in lines:
            print(f"  Line {l['line']}: {l['msg']}")
