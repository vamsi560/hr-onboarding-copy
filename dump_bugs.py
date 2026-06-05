import json

with open("sonar_issues.json") as f:
    issues = json.load(f)

bugs = [i for i in issues if i['type'] == 'BUG']
with open("bugs_list.json", "w") as f:
    json.dump(bugs, f, indent=2)

criticals = [i for i in issues if i['severity'] == 'CRITICAL']
with open("criticals_list.json", "w") as f:
    json.dump(criticals, f, indent=2)
