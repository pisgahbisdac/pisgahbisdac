import re

file_path = 'laporan.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add CSS links to head
head_links = """  <link rel="stylesheet" href="/src/index.css">
  <link rel="stylesheet" href="/src/stylelaporan.css">
</head>"""
content = content.replace('</head>', head_links)

# Remove the laporanEntry script at the end
content = re.sub(r'<script type="module" src="/src/laporanEntry\.js"></script>', '', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed laporan.html CSS links.")
