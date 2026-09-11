with open('App_ref.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = -1
end = -1
for i, line in enumerate(lines):
    if line.startswith('const LaguSion = '):
        start = i
    if start != -1 and line.startswith('// --- COMPONENT: SEARCH ---'):
        end = i
        break

with open('LaguSion_extracted.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines[start:end])
