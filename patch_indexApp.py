import re

with open('src/indexApp.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variables to main App
content = content.replace(
    "const [perjamuanDate, setPerjamuanDate] = React.useState('');\n    const [perpuluhanDate, setPerpuluhanDate] = React.useState('');",
    "const [perjamuanDate, setPerjamuanDate] = React.useState('');\n    const [perpuluhanDate, setPerpuluhanDate] = React.useState('');\n    const [perjamuanNote, setPerjamuanNote] = React.useState('');\n    const [perpuluhanNote, setPerpuluhanNote] = React.useState('');"
)

# 2. Add to getInitialData
content = content.replace(
    "if (cached.perjamuanDate) setPerjamuanDate(cached.perjamuanDate);\n                        if (cached.perpuluhanDate) setPerpuluhanDate(cached.perpuluhanDate);",
    "if (cached.perjamuanDate) setPerjamuanDate(cached.perjamuanDate);\n                        if (cached.perpuluhanDate) setPerpuluhanDate(cached.perpuluhanDate);\n                        if (cached.perjamuanNote) setPerjamuanNote(cached.perjamuanNote);\n                        if (cached.perpuluhanNote) setPerpuluhanNote(cached.perpuluhanNote);"
)
content = content.replace(
    "cached.perjamuanDate = editPerjamuanDate;\n                        cached.perpuluhanDate = editPerpuluhanDate;",
    "cached.perjamuanDate = editPerjamuanDate;\n                        cached.perpuluhanDate = editPerpuluhanDate;\n                        cached.perjamuanNote = editPerjamuanNote;\n                        cached.perpuluhanNote = editPerpuluhanNote;"
)
content = content.replace(
    "if (data.perjamuanDate !== undefined) setPerjamuanDate(data.perjamuanDate || '');\n                if (data.perpuluhanDate !== undefined) setPerpuluhanDate(data.perpuluhanDate || '');",
    "if (data.perjamuanDate !== undefined) setPerjamuanDate(data.perjamuanDate || '');\n                if (data.perpuluhanDate !== undefined) setPerpuluhanDate(data.perpuluhanDate || '');\n                if (data.perjamuanNote !== undefined) setPerjamuanNote(data.perjamuanNote || '');\n                if (data.perpuluhanNote !== undefined) setPerpuluhanNote(data.perpuluhanNote || '');"
)

# 3. Add to AdminDashboard props
content = content.replace(
    "perjamuanDate, setPerjamuanDate, perpuluhanDate, setPerpuluhanDate,",
    "perjamuanDate, setPerjamuanDate, perpuluhanDate, setPerpuluhanDate, perjamuanNote, setPerjamuanNote, perpuluhanNote, setPerpuluhanNote,"
)

# 4. Add to AdminDashboard state
content = content.replace(
    "const [editPerjamuanDate, setEditPerjamuanDate] = React.useState(perjamuanDate);\n    const [editPerpuluhanDate, setEditPerpuluhanDate] = React.useState(perpuluhanDate);",
    "const [editPerjamuanDate, setEditPerjamuanDate] = React.useState(perjamuanDate);\n    const [editPerpuluhanDate, setEditPerpuluhanDate] = React.useState(perpuluhanDate);\n    const [editPerjamuanNote, setEditPerjamuanNote] = React.useState(perjamuanNote);\n    const [editPerpuluhanNote, setEditPerpuluhanNote] = React.useState(perpuluhanNote);"
)

# 5. Add to AdminDashboard useEffect sync
content = content.replace(
    "setEditPerjamuanDate(perjamuanDate);\n        setEditPerpuluhanDate(perpuluhanDate);",
    "setEditPerjamuanDate(perjamuanDate);\n        setEditPerpuluhanDate(perpuluhanDate);\n        setEditPerjamuanNote(perjamuanNote);\n        setEditPerpuluhanNote(perpuluhanNote);"
)
content = content.replace(
    "}, [perjamuanDate, perpuluhanDate, daftarRekening]);",
    "}, [perjamuanDate, perpuluhanDate, perjamuanNote, perpuluhanNote, daftarRekening]);"
)

# 6. Add to handleSavePerjamuanDate payload
content = content.replace(
    "tanggal: editPerjamuanDate,\n                    tanggalPerpuluhan: editPerpuluhanDate\n                })",
    "tanggal: editPerjamuanDate,\n                    tanggalPerpuluhan: editPerpuluhanDate,\n                    catatanPerjamuan: editPerjamuanNote,\n                    catatanPerpuluhan: editPerpuluhanNote\n                })"
)

# 7. Add to handleSavePerjamuanDate state setters
content = content.replace(
    "setPerjamuanDate(editPerjamuanDate);\n                setPerpuluhanDate(editPerpuluhanDate);",
    "setPerjamuanDate(editPerjamuanDate);\n                setPerpuluhanDate(editPerpuluhanDate);\n                setPerjamuanNote(editPerjamuanNote);\n                setPerpuluhanNote(editPerpuluhanNote);"
)
content = content.replace(
    "setPerjamuanDate(editPerjamuanDate);\n            setPerpuluhanDate(editPerpuluhanDate);",
    "setPerjamuanDate(editPerjamuanDate);\n            setPerpuluhanDate(editPerpuluhanDate);\n            setPerjamuanNote(editPerjamuanNote);\n            setPerpuluhanNote(editPerpuluhanNote);"
)

# 8. Add to Home props
content = content.replace(
    "setInitialBook, showPerjamuan, perjamuanYMD, showPerpuluhan, perpuluhanYMD, kontakGereja }) => {",
    "setInitialBook, showPerjamuan, perjamuanYMD, showPerpuluhan, perpuluhanYMD, perjamuanNote, perpuluhanNote, kontakGereja }) => {"
)

# 9. Add to main render tags for Home and AdminDashboard
content = content.replace(
    "showPerpuluhan={showPerpuluhan} perpuluhanYMD={perpuluhanYMD} kontakGereja",
    "showPerpuluhan={showPerpuluhan} perpuluhanYMD={perpuluhanYMD} perjamuanNote={perjamuanNote} perpuluhanNote={perpuluhanNote} kontakGereja"
)

content = content.replace(
    "perpuluhanDate={perpuluhanDate} setPerpuluhanDate={setPerpuluhanDate} daftarRekening",
    "perpuluhanDate={perpuluhanDate} setPerpuluhanDate={setPerpuluhanDate} perjamuanNote={perjamuanNote} setPerjamuanNote={setPerjamuanNote} perpuluhanNote={perpuluhanNote} setPerpuluhanNote={setPerpuluhanNote} daftarRekening"
)


# 10. Admin UI Textareas
content = re.sub(
    r"(onClick=\{.*?setEditPerjamuanDate\(''\).*?</button>\s*</div>\s*</div>)",
    r'\1\n\n                                        <div className="mt-4">\n                                            <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Catatan / Pengumuman</label>\n                                            <textarea value={editPerjamuanNote} onChange={e => setEditPerjamuanNote(e.target.value)} placeholder="Contoh: Bawa alat perjamuan..." className="w-full p-3.5 border-2 border-navy-200 focus:border-gold-500 rounded-xl outline-none transition-all bg-white text-sm font-medium text-navy-900 shadow-sm min-h-[80px]" />\n                                        </div>',
    content
)

content = re.sub(
    r"(onClick=\{.*?setEditPerpuluhanDate\(''\).*?</button>\s*</div>\s*</div>)",
    r'\1\n\n                                        <div className="mt-4">\n                                            <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Catatan / Pengumuman</label>\n                                            <textarea value={editPerpuluhanNote} onChange={e => setEditPerpuluhanNote(e.target.value)} placeholder="Contoh: Amplop tersedia di..." className="w-full p-3.5 border-2 border-navy-200 focus:border-gold-500 rounded-xl outline-none transition-all bg-white text-sm font-medium text-navy-900 shadow-sm min-h-[80px]" />\n                                        </div>',
    content
)

# 11. Banners UI in Home
content = re.sub(
    r"(<p className=\"text-2xl md:text-3xl font-extrabold opacity-95 tracking-tight\">\{formatIndoDate\(perjamuanYMD\)\}</p>)",
    r'\1\n                                        {perjamuanNote && <p className="text-sm font-medium mt-2 opacity-90 whitespace-pre-wrap leading-tight">{perjamuanNote}</p>}',
    content
)
content = re.sub(
    r"(<p className=\"text-2xl md:text-3xl text-white dark:text-navy-200 font-extrabold tracking-tight\">\{formatIndoDate\(perpuluhanYMD\)\}</p>)",
    r'\1\n                                        {perpuluhanNote && <p className="text-sm font-medium mt-2 opacity-90 text-white/90 dark:text-navy-300 whitespace-pre-wrap leading-tight">{perpuluhanNote}</p>}',
    content
)

# Banner Spesial (expanded view Perjamuan)
content = re.sub(
    r"(<p className=\"text-sm font-bold text-navy-700 dark:text-amber-200/90 mt-0\.5\">\{formatIndoDate\(perjamuanYMD\)\}</p>)",
    r'\1\n                        {perjamuanNote && <p className="text-xs font-medium text-navy-600 dark:text-amber-100/80 mt-1 whitespace-pre-wrap">{perjamuanNote}</p>}',
    content
)

with open('src/indexApp.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
