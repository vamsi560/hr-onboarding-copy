import re
filepath = r'C:\Users\VMADMIN\.gemini\antigravity\brain\a7f66b2a-1743-4521-8543-7a8a3de7060b\task.md'
with open(filepath, 'r') as f:
    content = f.read()

parts = content.split('## Phase 4:')
if len(parts) > 1:
    parts[1] = parts[1].replace('[x]', '[ ]')
    with open(filepath, 'w') as f:
        f.write('## Phase 4:'.join(parts))
