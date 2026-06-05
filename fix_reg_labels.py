import re

filepath = 'src/components/HR/RegisterCandidate.js'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

changed = False
pending_id = None

for i, line in enumerate(lines):
    # Process <label>
    if '<label>' in line or '<label ' in line:
        # Skip if already has htmlFor or it's a radio option wrapper
        if 'htmlFor=' not in line and 'className="radio-option"' not in line:
            # We don't want to break wrapping labels like <label><input/></label>
            if '<input' not in line:
                pending_id = f"reg_field_{i}"
                if '<label>' in line:
                    lines[i] = line.replace('<label>', f'<label htmlFor="{pending_id}">')
                else:
                    lines[i] = line.replace('<label ', f'<label htmlFor="{pending_id}" ')
                changed = True
                
    # Process the input/select/Input if we have a pending id
    if pending_id and ('<input' in line or '<select' in line or '<textarea' in line or '<Input' in line):
        if 'id=' not in line:
            if '<input' in line:
                lines[i] = line.replace('<input', f'<input id="{pending_id}"')
            elif '<select' in line:
                lines[i] = line.replace('<select', f'<select id="{pending_id}"')
            elif '<textarea' in line:
                lines[i] = line.replace('<textarea', f'<textarea id="{pending_id}"')
            elif '<Input' in line:
                lines[i] = line.replace('<Input', f'<Input id="{pending_id}"')
            pending_id = None
        else:
            # If it already has an id, update the label to match
            match = re.search(r'id=(["\'])(.*?)\1', line)
            if match:
                existing_id = match.group(2)
                for j in range(i-1, -1, -1):
                    if f'htmlFor="{pending_id}"' in lines[j]:
                        lines[j] = lines[j].replace(f'htmlFor="{pending_id}"', f'htmlFor="{existing_id}"')
                        break
                pending_id = None

if changed:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Updated RegisterCandidate.js")
