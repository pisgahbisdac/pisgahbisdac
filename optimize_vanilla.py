import os
import re

files = ['pembangunan.html', 'laporan.html']

for html_file in files:
    if not os.path.exists(html_file):
        continue
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove CDN tailwind
    content = re.sub(r'<script src="https://cdn\.tailwindcss\.com"></script>', '', content)
    
    # Remove tailwind.config script
    content = re.sub(r'<script>\s*tailwind\.config = {.*?</script>', '', content, flags=re.DOTALL)
    
    # Check if module script is already there
    basename = os.path.splitext(html_file)[0]
    module_script = f'<script type="module" src="/src/{basename}Entry.js"></script>'
    
    if module_script not in content:
        content = content.replace('</body>', f'    {module_script}\n</body>')
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    # Create the entry js
    entry_path = f"src/{basename}Entry.js"
    with open(entry_path, 'w', encoding='utf-8') as f:
        f.write("import './index.css';\n")
        f.write("console.log('Optimized " + basename + " loaded');\n")

print("Optimized.")
