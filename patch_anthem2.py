import re

with open('src/indexApp.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State in App
content = content.replace(
    'const [anthemUrl, setAnthemUrl] = React.useState(""); // untuk Adventist Church Anthem',
    'const [anthemUrl, setAnthemUrl] = React.useState(""); // untuk Adventist Church Anthem\n    const [anthemUrl2, setAnthemUrl2] = React.useState(""); // untuk video tambahan'
)

# 2. getInitialData
content = content.replace(
    "if (cached.anthemUrl !== undefined) setAnthemUrl(cached.anthemUrl || '');",
    "if (cached.anthemUrl !== undefined) setAnthemUrl(cached.anthemUrl || '');\n                        if (cached.anthemUrl2 !== undefined) setAnthemUrl2(cached.anthemUrl2 || '');"
)
content = content.replace(
    "if (data.anthemUrl !== undefined) setAnthemUrl(data.anthemUrl || '');",
    "if (data.anthemUrl !== undefined) setAnthemUrl(data.anthemUrl || '');\n                if (data.anthemUrl2 !== undefined) setAnthemUrl2(data.anthemUrl2 || '');"
)
content = content.replace(
    "anthemUrl: data.anthemUrl || '',",
    "anthemUrl: data.anthemUrl || '',\n                    anthemUrl2: data.anthemUrl2 || '',"
)

# 3. App routing (Home & AdminDashboard)
content = content.replace(
    "youtubeUrl={youtubeUrl} anthemUrl={anthemUrl}",
    "youtubeUrl={youtubeUrl} anthemUrl={anthemUrl} anthemUrl2={anthemUrl2}"
)
content = content.replace(
    "anthemUrl={anthemUrl} setAnthemUrl={setAnthemUrl}",
    "anthemUrl={anthemUrl} setAnthemUrl={setAnthemUrl} anthemUrl2={anthemUrl2} setAnthemUrl2={setAnthemUrl2}"
)

# 4. AdminDashboard props
content = content.replace(
    "youtubeUrl, setYoutubeUrl, anthemUrl, setAnthemUrl, kategoriPejabat",
    "youtubeUrl, setYoutubeUrl, anthemUrl, setAnthemUrl, anthemUrl2, setAnthemUrl2, kategoriPejabat"
)

# 5. AdminDashboard state & save
content = content.replace(
    "const [editAnthemUrl, setEditAnthemUrl] = React.useState(anthemUrl);",
    "const [editAnthemUrl, setEditAnthemUrl] = React.useState(anthemUrl);\n    const [editAnthemUrl2, setEditAnthemUrl2] = React.useState(anthemUrl2);"
)

content = content.replace(
    "body: JSON.stringify({ action: 'saveAnthemUrl', password: adminToken, url: editAnthemUrl })",
    "body: JSON.stringify({ action: 'saveAnthemUrl', password: adminToken, url: editAnthemUrl, url2: editAnthemUrl2 })"
)

content = content.replace(
    "setAnthemUrl(editAnthemUrl);\n            } else {",
    "setAnthemUrl(editAnthemUrl);\n                setAnthemUrl2(editAnthemUrl2);\n            } else {"
)

# 6. AdminDashboard UI
admin_ui_target = """                                        <textarea value={editAnthemUrl} onChange={e => setEditAnthemUrl(e.target.value)} rows="3" placeholder="https://www.youtube.com/embed/..." className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>
                                        <p className="text-[10px] text-navy-500 mt-2 font-bold leading-relaxed bg-navy-50 p-2.5 rounded-lg border border-navy-100">Kotak video akan muncul di atas section Video Penting di halaman utama.<br />Kosongkan untuk menyembunyikan kotak anthem. Pastikan URL diawali dengan <br /><span className="text-gold-600">https://www.youtube.com/embed/</span>...</p>
                                    </div>"""

admin_ui_replace = """                                        <textarea value={editAnthemUrl} onChange={e => setEditAnthemUrl(e.target.value)} rows="3" placeholder="https://www.youtube.com/embed/..." className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Tautan Video Kedua (Opsional)</label>
                                        <textarea value={editAnthemUrl2} onChange={e => setEditAnthemUrl2(e.target.value)} rows="3" placeholder="https://www.youtube.com/embed/..." className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>
                                        <p className="text-[10px] text-navy-500 mt-2 font-bold leading-relaxed bg-navy-50 p-2.5 rounded-lg border border-navy-100">Jika diisi, video akan terbagi dua secara proporsional.<br />Kosongkan jika hanya ingin satu video besar. Pastikan URL diawali dengan <br /><span className="text-gold-600">https://www.youtube.com/embed/</span>...</p>
                                    </div>"""
content = content.replace(admin_ui_target, admin_ui_replace)

# 7. Home props
content = content.replace(
    "const Home = ({ setActiveTab, youtubeUrl, anthemUrl, heroImages",
    "const Home = ({ setActiveTab, youtubeUrl, anthemUrl, anthemUrl2, heroImages"
)

# 8. Home UI
home_ui_target = """                        {/* Adventist Church Anthem */}
                        {anthemUrl && (
                            <div className="glass-box rounded-[2rem] p-4 md:p-6 transition-colors">
                                <h2 className="text-lg md:text-xl font-extrabold mb-4 text-[#2C3F21] dark:text-gold-400 flex items-center px-2 transition-colors">
                                    <Icon name="Music" className="w-5 h-5 mr-3 text-[#D19B45] dark:text-gold-500" /> Adventist Church Anthem
                                </h2>
                                <div className="relative w-full overflow-hidden rounded-[1.5rem] bg-[#E9EEDF] dark:bg-navy-900 transition-colors" style={{ paddingTop: '56.25%' }}>
                                    <iframe className="absolute top-0 left-0 w-full h-full" src={`${anthemUrl}${anthemUrl?.includes('?') ? '&' : '?'}vq=hd1080`} title="Adventist Church Anthem" frameBorder="0" allowFullScreen></iframe>
                                </div>
                            </div>
                        )}"""

home_ui_replace = """                        {/* Adventist Church Anthem & Additional Video */}
                        {(anthemUrl || anthemUrl2) && (
                            <div className={`grid grid-cols-1 ${anthemUrl && anthemUrl2 ? 'lg:grid-cols-2 gap-8 md:gap-12' : ''} mb-8`}>
                                {anthemUrl && (
                                    <div className="glass-box rounded-[2rem] p-4 md:p-6 transition-colors">
                                        <h2 className="text-lg md:text-xl font-extrabold mb-4 text-[#2C3F21] dark:text-gold-400 flex items-center px-2 transition-colors">
                                            <Icon name="Music" className="w-5 h-5 mr-3 text-[#D19B45] dark:text-gold-500" /> Adventist Church Anthem
                                        </h2>
                                        <div className="relative w-full overflow-hidden rounded-[1.5rem] bg-[#E9EEDF] dark:bg-navy-900 transition-colors" style={{ paddingTop: '56.25%' }}>
                                            <iframe className="absolute top-0 left-0 w-full h-full" src={`${anthemUrl}${anthemUrl?.includes('?') ? '&' : '?'}vq=hd1080`} title="Adventist Church Anthem" frameBorder="0" allowFullScreen></iframe>
                                        </div>
                                    </div>
                                )}
                                {anthemUrl2 && (
                                    <div className="glass-box rounded-[2rem] p-4 md:p-6 transition-colors">
                                        <h2 className="text-lg md:text-xl font-extrabold mb-4 text-[#2C3F21] dark:text-gold-400 flex items-center px-2 transition-colors">
                                            <Icon name="Youtube" className="w-5 h-5 mr-3 text-[#D19B45] dark:text-gold-500" /> Video Tambahan
                                        </h2>
                                        <div className="relative w-full overflow-hidden rounded-[1.5rem] bg-[#E9EEDF] dark:bg-navy-900 transition-colors" style={{ paddingTop: '56.25%' }}>
                                            <iframe className="absolute top-0 left-0 w-full h-full" src={`${anthemUrl2}${anthemUrl2?.includes('?') ? '&' : '?'}vq=hd1080`} title="Video Tambahan" frameBorder="0" allowFullScreen></iframe>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}"""
content = content.replace(home_ui_target, home_ui_replace)

with open('src/indexApp.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
