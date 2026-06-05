import json
from collections import Counter

with open("sonar_issues.json") as f:
    issues = json.load(f)

# Group by severity and type
severities = Counter(i['severity'] for i in issues)
types = Counter(i['type'] for i in issues)
rules = Counter(i['rule'] for i in issues)

print("Severities:", severities)
print("Types:", types)
print("\nTop Rules:")
for rule, count in rules.most_common(10):
    example = next(i['message'] for i in issues if i['rule'] == rule)
    print(f"- {rule} ({count}): {example}")

# Count by file
files = Counter(i['component'] for i in issues)
print("\nTop Files:")
for file, count in files.most_common(10):
    print(f"- {file}: {count} issues")
