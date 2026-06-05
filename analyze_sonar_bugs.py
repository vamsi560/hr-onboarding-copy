import json

with open("sonar_issues.json") as f:
    issues = json.load(f)

bugs = [i for i in issues if i['type'] == 'BUG']
print(f"Total BUGS: {len(bugs)}")
for b in bugs[:5]:
    print(f"- {b['component']}:{b['line']} - {b['message']}")

print("\n")
criticals = [i for i in issues if i['severity'] == 'CRITICAL']
print(f"Total CRITICAL: {len(criticals)}")
for c in criticals[:5]:
    print(f"- {c['component']}:{c.get('line', 'N/A')} - {c['message']}")
