import re
import ast
from collections import defaultdict

with open('js_issues.txt', 'r') as f:
    lines = f.readlines()

issues = []
current_rule = None
for line in lines:
    line = line.strip()
    if line.startswith('--- Rule'):
        current_rule = line.split()[2]
    elif line and 'vamsi560_hr-onboarding-copy:' in line:
        path_part, dict_part = line.split(': ', 1)
        path = path_part.replace('vamsi560_hr-onboarding-copy:', '')
        loc = ast.literal_eval(dict_part)
        issues.append({'rule': current_rule, 'file': path, 'line': loc['startLine']})

file_issues = defaultdict(list)
for i in issues:
    file_issues[i['file']].append(i)

for file, file_issue_list in file_issues.items():
    with open(file, 'r', encoding='utf-8') as f:
        content_lines = f.readlines()
    
    modified = False
    for issue in file_issue_list:
        line_idx = issue['line'] - 1
        original_line = content_lines[line_idx]
        
        if issue['rule'] == 'javascript:S6479':
            # replace key={index} with key={`item-${index}`}
            new_line = re.sub(r'key=\{([a-zA-Z0-9_]+)\}', r'key={`item-${\1}`}', original_line)
            if new_line != original_line:
                content_lines[line_idx] = new_line
                modified = True
                
        elif issue['rule'] == 'javascript:S6582':
            # optional chaining
            # foo && foo.bar -> foo?.bar
            new_line = re.sub(r'([a-zA-Z0-9_]+)\s*&&\s*\1\.', r'\1?.', original_line)
            if new_line != original_line:
                content_lines[line_idx] = new_line
                modified = True
                
    if modified:
        with open(file, 'w', encoding='utf-8') as f:
            f.writelines(content_lines)
        print(f"Fixed issues in {file}")
