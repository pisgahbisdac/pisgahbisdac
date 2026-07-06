import re

html_path = '/home/sagala/pisgahbisdac/pisgahbisdac/laporan.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hex colors
content = content.replace('color: #FFD700', 'color: var(--primary)')
content = content.replace('color:#FFD700', 'color: var(--primary)')

# Replace rgba shadows
content = re.sub(r'rgba\(\s*255\s*,\s*215\s*,\s*0\s*,\s*[0-9.]+\s*\)', 'var(--primary)', content)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML inline styles updated successfully.")
