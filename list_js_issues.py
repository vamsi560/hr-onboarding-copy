import json

with open('sonar_issues.json') as f:
    issues = json.load(f)

for rule in ['javascript:S3358', 'javascript:S6479', 'javascript:S6582']:
    filtered = [i for i in issues if i['rule'] == rule]
    print(f"--- Rule {rule} ({len(filtered)}) ---")
    for i in filtered:
        print(f"{i['component']}: {i.get('textRange', {})}")
