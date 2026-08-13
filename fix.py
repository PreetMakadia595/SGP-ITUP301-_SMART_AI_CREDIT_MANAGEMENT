import os
for root, dirs, files in os.walk(r'c:\Desktop\SGP'):
    if any(ignore in root for ignore in ['node_modules', '.venv', '.git', 'dist']):
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.py', '.md')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                continue
            if '${' in content:
                content = content.replace('${', '${')
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed {path}")
