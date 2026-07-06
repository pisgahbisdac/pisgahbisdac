import re
import os

html_path = '/home/sagala/pisgahbisdac/pisgahbisdac/laporan.html'
css_path = '/home/sagala/pisgahbisdac/pisgahbisdac/src/laporan/styles.css'
js_path = '/home/sagala/pisgahbisdac/pisgahbisdac/src/laporan/main.js'

os.makedirs(os.path.dirname(css_path), exist_ok=True)

with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

css_lines = []
js_lines = []
new_html_lines = []

in_style_1 = False
in_style_2 = False
in_script_1 = False
in_script_2 = False

for i, line in enumerate(lines):
    idx = i + 1
    
    # Style 1: 18 - 289
    if idx == 18:
        in_style_1 = True
        new_html_lines.append('  <link rel="stylesheet" href="/src/laporan/styles.css">\n')
        continue
    if idx == 289:
        in_style_1 = False
        continue
        
    # Style 2: 294 - 304
    if idx == 294:
        in_style_2 = True
        continue
    if idx == 304:
        in_style_2 = False
        continue
        
    # Script 1: 314 - 532
    if idx == 314:
        in_script_1 = True
        new_html_lines.append('  <script type="module" src="/src/laporan/main.js"></script>\n')
        continue
    if idx == 532:
        in_script_1 = False
        continue
        
    # Script 2: 2005 - 6482
    if idx == 2005:
        in_script_2 = True
        continue
    if idx == 6482:
        in_script_2 = False
        continue
        
    if in_style_1 or in_style_2:
        css_lines.append(line)
    elif in_script_1 or in_script_2:
        js_lines.append(line)
    else:
        # Replace document.write(getIcon(...)) with icon-placeholder
        # <script>document.write(getIcon('home', 'lucide-md'))</script>
        line_mod = re.sub(
            r"<script>\s*document\.write\(getIcon\('([^']+)',\s*'([^']+)'\)\)\s*</script>",
            r'<span class="icon-placeholder" data-icon="\1" data-size="\2"></span>',
            line
        )
        new_html_lines.append(line_mod)

with open(css_path, 'w', encoding='utf-8') as f:
    f.writelines(css_lines)

# Inject icon placeholder logic to main.js
js_injection = """

// --- INJECTED BY REFACTOR SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.icon-placeholder').forEach(el => {
        if (typeof getIcon === 'function') {
            el.outerHTML = getIcon(el.getAttribute('data-icon'), el.getAttribute('data-size'));
        }
    });
});
"""

js_code = "".join(js_lines)

# Find all function declarations to export to window
func_matches = re.findall(r'^    function ([a-zA-Z0-9_]+)\(', js_code, flags=re.MULTILINE)
func_matches2 = re.findall(r'^    async function ([a-zA-Z0-9_]+)\(', js_code, flags=re.MULTILINE)
func_matches3 = re.findall(r'^function ([a-zA-Z0-9_]+)\(', js_code, flags=re.MULTILINE)
func_matches4 = re.findall(r'^async function ([a-zA-Z0-9_]+)\(', js_code, flags=re.MULTILINE)

all_funcs = set(func_matches + func_matches2 + func_matches3 + func_matches4)

export_code = "\n// --- EXPORT TO WINDOW ---\n"
for func in all_funcs:
    export_code += f"window.{func} = {func};\n"

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_code)
    f.write(js_injection)
    f.write(export_code)

with open(html_path, 'w', encoding='utf-8') as f:
    f.writelines(new_html_lines)

print("Refactoring complete.")
print(f"CSS lines: {len(css_lines)}")
print(f"JS lines: {len(js_lines)}")
print(f"Functions exported: {len(all_funcs)}")
