import urllib.request
import json

url = "https://sonarcloud.io/api/issues/search?componentKeys=vamsi560_hr-onboarding-copy&resolved=false&ps=500&p=1"
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

issues = data.get("issues", [])

# Fetch second page if needed
if data.get("total", 0) > 500:
    url2 = "https://sonarcloud.io/api/issues/search?componentKeys=vamsi560_hr-onboarding-copy&resolved=false&ps=500&p=2"
    req2 = urllib.request.Request(url2)
    with urllib.request.urlopen(req2) as response2:
        data2 = json.loads(response2.read().decode())
        issues.extend(data2.get("issues", []))

with open("sonar_issues.json", "w") as f:
    json.dump(issues, f, indent=2)

print(f"Saved {len(issues)} issues to sonar_issues.json")
