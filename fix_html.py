import os
import re

html_files = ['index.html', 'hadir.html', 'laporan.html', 'pembangunan.html']

for html_file in html_files:
    if not os.path.exists(html_file):
        continue
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove stylesheet links for style*.css
    new_content = re.sub(r'<link\s+rel="stylesheet"\s+href="\.\/style.*?\.css"\s*>', '', content)
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("HTML fixed.")
