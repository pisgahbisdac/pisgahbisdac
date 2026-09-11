import re

with open('codeindex.gs', 'r', encoding='utf-8') as f:
    code = f.read()

# codeindex.gs: saveYoutubeUrl
code = code.replace(
    "      case 'saveYoutubeUrl': return saveSetting('YOUTUBE_URL', payload.url);",
    "      case 'saveYoutubeUrl':\n        saveSettingRecord('YOUTUBE_URL', payload.url);\n        if (payload.title !== undefined) saveSettingRecord('YOUTUBE_TITLE', payload.title);\n        if (payload.channelTitle !== undefined) saveSettingRecord('YOUTUBE_CHANNEL_TITLE', payload.channelTitle);\n        return jsonResponse({ success: true });"
)

# codeindex.gs: saveAnthemUrl
code = code.replace(
    "        if (payload.url2 !== undefined) saveSettingRecord('ANTHEM_URL2', payload.url2);",
    "        if (payload.url2 !== undefined) saveSettingRecord('ANTHEM_URL2', payload.url2);\n        if (payload.title !== undefined) saveSettingRecord('ANTHEM_TITLE', payload.title);\n        if (payload.title2 !== undefined) saveSettingRecord('ANTHEM_TITLE2', payload.title2);"
)

# codeindex.gs: getInitialData
code = code.replace(
    "    anthemUrl2: getSetting('ANTHEM_URL2') || '',",
    "    anthemUrl2: getSetting('ANTHEM_URL2') || '',\n    anthemTitle: getSetting('ANTHEM_TITLE') || 'Adventist Church Anthem',\n    anthemTitle2: getSetting('ANTHEM_TITLE2') || 'Video Tambahan',\n    youtubeTitle: getSetting('YOUTUBE_TITLE') || 'Video Penting',\n    youtubeChannelTitle: getSetting('YOUTUBE_CHANNEL_TITLE') || 'Youtube Channel',"
)

with open('codeindex.gs', 'w', encoding='utf-8') as f:
    f.write(code)

with open('src/indexApp.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# indexApp.jsx: App state
app = app.replace(
    'const [anthemUrl2, setAnthemUrl2] = React.useState(""); // untuk video tambahan',
    'const [anthemUrl2, setAnthemUrl2] = React.useState(""); // untuk video tambahan\n    const [anthemTitle, setAnthemTitle] = React.useState("");\n    const [anthemTitle2, setAnthemTitle2] = React.useState("");\n    const [youtubeTitle, setYoutubeTitle] = React.useState("");\n    const [youtubeChannelTitle, setYoutubeChannelTitle] = React.useState("");'
)

# indexApp.jsx: getInitialData parsing
app = app.replace(
    "if (data.anthemUrl2 !== undefined) setAnthemUrl2(data.anthemUrl2 || '');",
    "if (data.anthemUrl2 !== undefined) setAnthemUrl2(data.anthemUrl2 || '');\n                if (data.anthemTitle !== undefined) setAnthemTitle(data.anthemTitle || 'Adventist Church Anthem');\n                if (data.anthemTitle2 !== undefined) setAnthemTitle2(data.anthemTitle2 || 'Video Tambahan');\n                if (data.youtubeTitle !== undefined) setYoutubeTitle(data.youtubeTitle || 'Video Penting');\n                if (data.youtubeChannelTitle !== undefined) setYoutubeChannelTitle(data.youtubeChannelTitle || 'Youtube Channel');"
)

# indexApp.jsx: Home Props
app = app.replace(
    'const Home = ({ setActiveTab, youtubeUrl, anthemUrl, anthemUrl2, heroImages',
    'const Home = ({ setActiveTab, youtubeUrl, anthemUrl, anthemUrl2, anthemTitle, anthemTitle2, youtubeTitle, youtubeChannelTitle, heroImages'
)

# indexApp.jsx: App routing
app = app.replace(
    'anthemUrl2={anthemUrl2}',
    'anthemUrl2={anthemUrl2} anthemTitle={anthemTitle} anthemTitle2={anthemTitle2} youtubeTitle={youtubeTitle} youtubeChannelTitle={youtubeChannelTitle}'
)
app = app.replace(
    'setAnthemUrl2={setAnthemUrl2}',
    'setAnthemUrl2={setAnthemUrl2} anthemTitle={anthemTitle} setAnthemTitle={setAnthemTitle} anthemTitle2={anthemTitle2} setAnthemTitle2={setAnthemTitle2} youtubeTitle={youtubeTitle} setYoutubeTitle={setYoutubeTitle} youtubeChannelTitle={youtubeChannelTitle} setYoutubeChannelTitle={setYoutubeChannelTitle}'
)

# indexApp.jsx: AdminDashboard props
app = app.replace(
    'youtubeUrl, setYoutubeUrl, anthemUrl, setAnthemUrl, anthemUrl2, setAnthemUrl2, kategoriPejabat',
    'youtubeUrl, setYoutubeUrl, anthemUrl, setAnthemUrl, anthemUrl2, setAnthemUrl2, anthemTitle, setAnthemTitle, anthemTitle2, setAnthemTitle2, youtubeTitle, setYoutubeTitle, youtubeChannelTitle, setYoutubeChannelTitle, kategoriPejabat'
)

# indexApp.jsx: AdminDashboard states
app = app.replace(
    'const [editAnthemUrl2, setEditAnthemUrl2] = React.useState(anthemUrl2);',
    'const [editAnthemUrl2, setEditAnthemUrl2] = React.useState(anthemUrl2);\n    const [editAnthemTitle, setEditAnthemTitle] = React.useState(anthemTitle || "Adventist Church Anthem");\n    const [editAnthemTitle2, setEditAnthemTitle2] = React.useState(anthemTitle2 || "Video Tambahan");\n    const [editYoutubeTitle, setEditYoutubeTitle] = React.useState(youtubeTitle || "Video Penting");\n    const [editYoutubeChannelTitle, setEditYoutubeChannelTitle] = React.useState(youtubeChannelTitle || "Youtube Channel");'
)

# indexApp.jsx: AdminDashboard UI
admin_ui_target1 = """                                        <textarea value={editYoutubeUrl} onChange={e => setEditYoutubeUrl(e.target.value)} required rows="3" className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>
                                    </div>"""
admin_ui_replace1 = """                                        <textarea value={editYoutubeUrl} onChange={e => setEditYoutubeUrl(e.target.value)} required rows="3" className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Judul Kotak Video Penting</label>
                                        <input type="text" value={editYoutubeTitle} onChange={e => setEditYoutubeTitle(e.target.value)} className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-medium shadow-sm" placeholder="Video Penting" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Judul Kotak Youtube Channel</label>
                                        <input type="text" value={editYoutubeChannelTitle} onChange={e => setEditYoutubeChannelTitle(e.target.value)} className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-medium shadow-sm" placeholder="Youtube Channel" />
                                    </div>"""
app = app.replace(admin_ui_target1, admin_ui_replace1)

admin_ui_target2 = """                                        <textarea value={editAnthemUrl} onChange={e => setEditAnthemUrl(e.target.value)} rows="3" placeholder="https://www.youtube.com/embed/..." className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Tautan Video Kedua (Opsional)</label>
                                        <textarea value={editAnthemUrl2} onChange={e => setEditAnthemUrl2(e.target.value)} rows="3" placeholder="https://www.youtube.com/embed/..." className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>"""
admin_ui_replace2 = """                                        <input type="text" value={editAnthemTitle} onChange={e => setEditAnthemTitle(e.target.value)} className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-medium shadow-sm mb-3" placeholder="Adventist Church Anthem" />
                                        <textarea value={editAnthemUrl} onChange={e => setEditAnthemUrl(e.target.value)} rows="3" placeholder="https://www.youtube.com/embed/..." className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Tautan Video Kedua (Opsional)</label>
                                        <input type="text" value={editAnthemTitle2} onChange={e => setEditAnthemTitle2(e.target.value)} className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-medium shadow-sm mb-3" placeholder="Video Tambahan" />
                                        <textarea value={editAnthemUrl2} onChange={e => setEditAnthemUrl2(e.target.value)} rows="3" placeholder="https://www.youtube.com/embed/..." className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>"""
app = app.replace(admin_ui_target2, admin_ui_replace2)

# indexApp.jsx: handleSaveYoutubeUrl
app = app.replace(
    "body: JSON.stringify({ action: 'saveYoutubeUrl', password: adminToken, url: editYoutubeUrl })",
    "body: JSON.stringify({ action: 'saveYoutubeUrl', password: adminToken, url: editYoutubeUrl, title: editYoutubeTitle, channelTitle: editYoutubeChannelTitle })"
)
app = app.replace(
    "setYoutubeUrl(editYoutubeUrl);",
    "setYoutubeUrl(editYoutubeUrl);\n                setYoutubeTitle(editYoutubeTitle);\n                setYoutubeChannelTitle(editYoutubeChannelTitle);"
)

# indexApp.jsx: handleSaveAnthemUrl
app = app.replace(
    "url2: editAnthemUrl2 })",
    "url2: editAnthemUrl2, title: editAnthemTitle, title2: editAnthemTitle2 })"
)
app = app.replace(
    "setAnthemUrl2(editAnthemUrl2);",
    "setAnthemUrl2(editAnthemUrl2);\n                setAnthemTitle(editAnthemTitle);\n                setAnthemTitle2(editAnthemTitle2);"
)

# indexApp.jsx: Home Video Titles
app = app.replace('> Adventist Church Anthem', '>{anthemTitle || "Adventist Church Anthem"}')
app = app.replace('> Video Tambahan', '>{anthemTitle2 || "Video Tambahan"}')
app = app.replace('> Video Penting', '>{youtubeTitle || "Video Penting"}')
app = app.replace('> Youtube Channel', '>{youtubeChannelTitle || "Youtube Channel"}')

with open('src/indexApp.jsx', 'w', encoding='utf-8') as f:
    f.write(app)
