import os
for root, dirs, files in os.walk(r'c:\Desktop\SGP'):
    if 'node_modules' in root or '.venv' in root or '.git' in root or 'dist' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.py', '.md')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
            except:
                continue
            if '${' in content:
                content = content.replace('${', '${')
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print('Fixed', filepath)
