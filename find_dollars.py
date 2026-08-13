import os, re
for root, dirs, files in os.walk(r'c:\Desktop\SGP\frontend'):
    if 'node_modules' in root: continue
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            lines = content.split('\n')
            for i, line in enumerate(lines):
                # check for $ followed by { that is not inside backticks
                if re.search(r'(?<!`)\$(?=\{)', line) or re.search(r'\$(?=\d)', line):
                    print(f'{file}:{i+1}: {line.strip()}')
