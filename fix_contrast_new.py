import re
import glob

# Common low-contrast replacements
replacements = {
    r'#888888': '#595959',
    r'#888': '#595959',
    r'#999999': '#595959',
    r'#999': '#595959',
    r'#777777': '#595959',
    r'#777': '#595959',
    r'#a0aec0': '#718096', # tailwind gray-400 -> gray-500
    r'#cbd5e0': '#a0aec0', # tailwind gray-300 -> gray-400
    r'#6366f1': '#4f46e5', # tailwind indigo-500 -> indigo-600
    r'color:\s*rgba\(255,\s*255,\s*255,\s*0\.5\)': 'color: rgba(255, 255, 255, 0.7)',
    r'color:\s*rgba\(0,\s*0,\s*0,\s*0\.5\)': 'color: rgba(0, 0, 0, 0.7)',
    r'color:\s*#666666': 'color: #444444',
    r'color:\s*#666': 'color: #444444',
    r'color:\s*gray': 'color: #595959'
}

css_files = glob.glob('src/**/*.css', recursive=True)

for file in css_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for old, new in replacements.items():
        content = re.sub(old, new, content, flags=re.IGNORECASE)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Contrast fixes applied.")
