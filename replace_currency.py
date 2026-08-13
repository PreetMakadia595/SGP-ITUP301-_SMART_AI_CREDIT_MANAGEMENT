import os
import re

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return
    
    original = content
    # Replace $ followed by {
    content = re.sub(r'\$(?=\{)', '₹', content)
    # Replace $ followed by numbers (e.g. ₹0.05, ₹10, ₹100.00)
    content = re.sub(r'\$(?=\d)', '₹', content)
    # Replace "₹ INR" with "₹ INR"
    content = content.replace('₹ INR', '₹ INR')
    # Replace '$' with '₹' if it's literally alone in JSX text like `Cost (₹)` -> `Cost (₹)`
    content = content.replace('(₹)', '(₹)')

    if content != original:
        print(f'Updated {filepath}')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

for root, dirs, files in os.walk(r'c:\Desktop\SGP'):
    if 'node_modules' in root or '.venv' in root or '.git' in root or 'dist' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.py', '.md')):
            filepath = os.path.join(root, file)
            replace_in_file(filepath)
