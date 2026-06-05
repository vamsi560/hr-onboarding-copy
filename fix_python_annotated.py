import os
import re

directory = 'backend/app'

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We need to replace `current_user: dict = Depends(...)` 
    # with `current_user: Annotated[dict, Depends(...)]`
    # or `credentials: HTTPAuthorizationCredentials = Depends(security)`
    
    # We will regex for `(\w+):\s*([a-zA-Z_0-9\[\]]+)\s*=\s*Depends\((.*?)\)`
    # Wait, the Depends(...) can span multiple lines if there are parentheses.
    # In these files it's mostly on a single line. Let's do a simple regex first.
    
    pattern = re.compile(r'(\w+):\s*([a-zA-Z_0-9\[\]]+)\s*=\s*Depends\((.*?)\)')
    
    if not pattern.search(content):
        return
        
    new_content = content
    
    # Function to replace
    def repl(m):
        var_name = m.group(1)
        type_name = m.group(2)
        depends_val = m.group(3)
        return f"{var_name}: Annotated[{type_name}, Depends({depends_val})]"

    new_content = pattern.sub(repl, new_content)
    
    if new_content != content:
        # Check if typing import exists
        if 'from typing import' in new_content:
            if 'Annotated' not in new_content:
                new_content = re.sub(r'(from typing import .*?)$', r'\1, Annotated', new_content, flags=re.MULTILINE)
        else:
            new_content = "from typing import Annotated\n" + new_content
            
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.py'):
            process_file(os.path.join(root, file))
