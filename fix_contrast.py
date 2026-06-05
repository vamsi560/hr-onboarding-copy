import os
import glob
import re

css_files = glob.glob('src/components/**/*.css', recursive=True)

replacements = [
    (re.compile(r'#6366f1', re.IGNORECASE), '#4338ca'),
    (re.compile(r'#0d9488', re.IGNORECASE), '#0f766e'),
    (re.compile(r'#10b981', re.IGNORECASE), '#059669'),
    (re.compile(r'#dc2626', re.IGNORECASE), '#b91c1c'),
    (re.compile(r'#059669', re.IGNORECASE), '#047857'),
    (re.compile(r'var\(--text-secondary\)'), '#4b5563'),
    (re.compile(r'#888888', re.IGNORECASE), '#555555'),
    (re.compile(r'#666666', re.IGNORECASE), '#4b5563'),
    (re.compile(r'#999999', re.IGNORECASE), '#4b5563'),
    (re.compile(r'#888\b', re.IGNORECASE), '#555'),
    (re.compile(r'#666\b', re.IGNORECASE), '#4b5563'),
    (re.compile(r'#999\b', re.IGNORECASE), '#4b5563')
]

for filepath in css_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements:
        new_content = pattern.sub(replacement, new_content)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
