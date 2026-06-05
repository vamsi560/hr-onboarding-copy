import os
import re

files_to_fix = [
    'src/components/TAG/OfferLetters/OfferLettersDashboard.js',
    'src/components/HR/HRReview.js',
    'src/components/Validation/Validation.js',
    'src/components/Layout/Header.js',
    'src/components/UI/ContextualHelp.js',
    'src/components/UI/Tooltip.js',
    'src/components/HR/HRChat.js',
    'src/components/HR/HRCandidateWorkflow.js',
    'src/components/Chat/ChatWidget.js',
    'src/components/Layout/Sidebar.js',
    'src/components/UI/Modal.js'
]

def fix_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    changed = False
    for i, line in enumerate(lines):
        if 'onClick=' in line and any(tag in line for tag in ['<div', '<span', '<li', '<i ']):
            if 'role=' not in line:
                line = line.replace('onClick=', 'role="button" tabIndex={0} onKeyDown={(e) => { if(e.key === \'Enter\') { e.target.click(); } }} onClick=')
                lines[i] = line
                changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"Updated {filepath}")

for f in files_to_fix:
    fix_file(f)
