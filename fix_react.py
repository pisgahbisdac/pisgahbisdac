import glob
import re

for filepath in glob.glob('src/*App.jsx'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove lines like `const { useState, useEffect, useMemo, useRef } = React;`
    content = re.sub(r'const\s+\{.*?\}\s*=\s*React;', '', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("React imports fixed.")
