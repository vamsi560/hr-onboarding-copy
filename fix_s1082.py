import json
import re

with open('sonar_issues.json') as f:
    issues = json.load(f)

for issue in issues:
    if issue['rule'] in ['javascript:S1082', 'javascript:S6848']:
        file_path = issue['component'].split(':')[-1]
        line_num = issue['textRange']['startLine'] - 1 # 0-indexed
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except FileNotFoundError:
            continue
            
        line_text = lines[line_num]
        
        # We need to add role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') e.target.click(); }}
        # We find onClick={...} and insert after it, or just insert inside the opening tag
        if 'role="button"' not in line_text:
            if '<div ' in line_text:
                lines[line_num] = line_text.replace('<div ', '<div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === \'Enter\') e.currentTarget.click(); }} ')
            elif '<span ' in line_text:
                lines[line_num] = line_text.replace('<span ', '<span role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === \'Enter\') e.currentTarget.click(); }} ')
            elif '<li ' in line_text:
                lines[line_num] = line_text.replace('<li ', '<li role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === \'Enter\') e.currentTarget.click(); }} ')
            elif '<a ' in line_text:
                lines[line_num] = line_text.replace('<a ', '<a role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === \'Enter\') e.currentTarget.click(); }} ')
                
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
                
print("S1082 and S6848 fixes applied.")
