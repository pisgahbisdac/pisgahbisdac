import os
import re

html_files = ['index.html', 'hadir.html', 'laporan.html', 'pembangunan.html']

for html_file in html_files:
    if not os.path.exists(html_file):
        continue
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the script type="text/babel" content
    match = re.search(r'<script type="text/babel">(.*?)</script>', content, re.DOTALL)
    if match:
        js_content = match.group(1)
        
        # Remove babel script and CDN links
        new_content = re.sub(r'<script type="text/babel">.*?</script>', '', content, flags=re.DOTALL)
        new_content = re.sub(r'<script src="https://unpkg\.com/@babel/standalone/babel\.min\.js"></script>', '', new_content)
        new_content = re.sub(r'<script src="https://unpkg\.com/react@18/umd/react\.production\.min\.js" crossorigin></script>', '', new_content)
        new_content = re.sub(r'<script src="https://unpkg\.com/react-dom@18/umd/react-dom\.production\.min\.js" crossorigin></script>', '', new_content)
        new_content = re.sub(r'<script src="https://cdn\.tailwindcss\.com"></script>', '', new_content)
        
        # Remove old tailwind config script
        new_content = re.sub(r'<script>\s*tailwind\.config = {.*?</script>', '', new_content, flags=re.DOTALL)
        
        # Also remove other inline theme scripts if any, but leave others
        
        # Insert the module script before closing body
        basename = os.path.splitext(html_file)[0]
        main_jsx_path = f"/src/{basename}.jsx"
        module_script = f'<script type="module" src="{main_jsx_path}"></script>\n'
        
        new_content = new_content.replace('</body>', f'{module_script}</body>')
        
        # Save back the HTML file
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        # Write the extracted JS to a new file
        app_file_path = f"src/{basename}App.jsx"
        with open(app_file_path, 'w', encoding='utf-8') as f:
            f.write("import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';\n")
            f.write("import ReactDOM from 'react-dom/client';\n")
            f.write(js_content)
            
        # Create main.jsx
        with open(f"src/{basename}.jsx", 'w', encoding='utf-8') as f:
            f.write(f"import React from 'react';\n")
            f.write(f"import ReactDOM from 'react-dom/client';\n")
            if basename == 'index':
                f.write("import './index.css';\n")
            f.write(f"import './style{basename if basename != 'index' else 'main'}.css';\n")
            f.write(f"import App from './{basename}App.jsx';\n")
            # Usually the extracted logic already has ReactDOM.render or root.render.
            # We might just import the file if it executes the render itself,
            # but let's check. If the extracted file has its own render logic, we just import it.
            f.write(f"// App component is rendered inside {basename}App.jsx\n")

print("Extraction completed.")
