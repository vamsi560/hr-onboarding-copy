import re
import os

files_to_fix = [
    'src/components/Auth/Login.js',
    'src/components/HR/DocumentExpiry.js',
    'src/components/TAG/OfferLetters/OfferLetterPreviewPage.js',
    'src/components/TAG/OfferLetters/OfferLetterForm.js',
    'src/components/HR/referenceCheck.js',
    'src/components/HR/registerCandidate.js',
    'src/components/TAG/OfferLetters/OfferLettersDashboard.js',
    'src/components/HR/HRreview.js',
    'src/components/Forms/OnboardingForm.js'
]

def fix_labels(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    changed = False
    
    pending_id = None
    
    for i, line in enumerate(lines):
        if 'forgot-password' in line and '<label' in line:
            lines[i] = line.replace('<label', '<button type="button"').replace('</label>', '</button>')
            changed = True
            continue
            
        if '<label' in line and 'htmlFor=' not in line:
            if '<input' in line and '</label>' in line:
                continue 
                
            pending_id = f"field_{i}"
            lines[i] = line.replace('<label', f'<label htmlFor="{pending_id}"')
            changed = True
            
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
            f.write('\n'.join(lines))
        print(f"Updated {filepath}")

for f in files_to_fix:
    fix_labels(f)
