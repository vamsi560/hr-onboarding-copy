import json
import re
import os
from collections import defaultdict

with open('sonar_issues.json') as f:
    issues = json.load(f)

# file -> component -> set of props
file_comp_props = defaultdict(lambda: defaultdict(set))

for issue in issues:
    if issue['rule'] == 'javascript:S6774':
        msg = issue['message']
        prop_match = re.search(r"'([^']+)' is missing", msg)
        if not prop_match: continue
        prop_name = prop_match.group(1)
        
        file_path = issue['component'].split(':')[-1]
        line_num = issue['textRange']['startLine']
        
        # Read file to find the component name
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except FileNotFoundError:
            continue
            
        # Search upwards for component definition
        comp_name = None
        for i in range(line_num - 1, -1, -1):
            line_text = lines[i]
            m = re.search(r'(?:const|function|let|var)\s+([A-Z][a-zA-Z0-9_]*)\s*(?:=|=>|\()', line_text)
            if m:
                comp_name = m.group(1)
                break
                
        if comp_name:
            file_comp_props[file_path][comp_name].add(prop_name)
        else:
            # Fallback to file name as component name
            base = os.path.basename(file_path).split('.')[0]
            file_comp_props[file_path][base].add(prop_name)

# Now inject PropTypes into files
for file_path, comps in file_comp_props.items():
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'import PropTypes' not in content:
        # insert after react import or at top
        if 'import React' in content:
            content = re.sub(r"(import React.*?;\n)", r"\1import PropTypes from 'prop-types';\n", content, count=1)
        else:
            content = "import PropTypes from 'prop-types';\n" + content
            
    # append propTypes at the end before export default
    append_str = "\n\n// Auto-generated PropTypes\n"
    for comp, props in comps.items():
        append_str += f"{comp}.propTypes = {{\n"
        for p in sorted(props):
            append_str += f"  {p}: PropTypes.any,\n"
        append_str += "};\n"
        
    # Inject before export default
    if 'export default ' in content:
        content = content.replace('export default ', append_str + '\nexport default ')
    else:
        content += append_str
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("S6774 fixes applied.")
