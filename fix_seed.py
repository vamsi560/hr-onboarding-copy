with open('backend/app/seed_data.py', 'r', encoding='utf-8') as f:
    content = f.read()
    
replacements = {
    '"john.doe@gmail.com"': 'JOHN_DOE_EMAIL',
    '"Shashank Tudum"': 'SHASHANK_NAME',
    '"Software Engineer"': 'SOFTWARE_ENGINEER',
    '"Sai Surya Vamsi Sapireddy"': 'VAMSI_NAME',
    '"2024-05-20T09:00:00.000Z"': 'DEFAULT_DATE'
}

for old, new in replacements.items():
    content = content.replace(old, new)
    
header = """JOHN_DOE_EMAIL = "john.doe@gmail.com"
SHASHANK_NAME = "Shashank Tudum"
SOFTWARE_ENGINEER = "Software Engineer"
VAMSI_NAME = "Sai Surya Vamsi Sapireddy"
DEFAULT_DATE = "2024-05-20T09:00:00.000Z"

"""

content = header + content

with open('backend/app/seed_data.py', 'w', encoding='utf-8') as f:
    f.write(content)
