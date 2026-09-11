import re

with open('LaguSion_extracted.jsx', 'r', encoding='utf-8') as f:
    lagusion_comp = f.read()

with open('src/indexApp.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Insert LaguSion component right before Search
code = code.replace('const Search = ({ setActiveTab', lagusion_comp + '\nconst Search = ({ setActiveTab')

# 2. Add LaguSion props to Search
code = code.replace(
    'const Search = ({ setActiveTab, jadwalDB, rabuYMD, sabatYMD, tabs, daftarWarta, dataPejabat, pengumuman, daftarBuku, setInitialBook }) => {',
    'const Search = ({ setActiveTab, jadwalDB, rabuYMD, sabatYMD, tabs, daftarWarta, dataPejabat, pengumuman, daftarBuku, setInitialBook, laguSionDb = [], setLaguSionInitialSong }) => {'
)

# 3. Add laguSion array to results
code = code.replace(
    'laporan: []\n        };',
    'laporan: [],\n            laguSion: []\n        };'
)

# 4. Add laguSion search logic
search_logic = """
        // 7. Lagu Sion
        if (laguSionDb && laguSionDb.length > 0) {
            laguSionDb.forEach(song => {
                const numStr = song.number.toString();
                const matchesNum = numStr === q;
                const matchesTitle = song.title.toLowerCase().includes(q);
                let matchesLyrics = false;
                let matchedLine = '';
                for (const verse of song.verses) {
                    for (const line of verse.lines) {
                        if (line.toLowerCase().includes(q)) {
                            matchesLyrics = true;
                            matchedLine = line;
                            break;
                        }
                    }
                    if (matchesLyrics) break;
                }
                if (matchesNum || matchesTitle || matchesLyrics) {
                    results.laguSion.push({ song, matchedLine: matchesLyrics ? matchedLine : null });
                }
            });
            results.laguSion = results.laguSion.slice(0, 15);
        }
"""
code = code.replace(
    'return results;',
    search_logic + '\n        return results;'
)

# 5. Add laguSion dependency to useMemo
code = code.replace(
    '}, [query, daftarWarta, dataPejabat, jadwalDB, daftarBuku, pengumuman, rabuYMD, sabatYMD]);',
    '}, [query, daftarWarta, dataPejabat, jadwalDB, daftarBuku, pengumuman, rabuYMD, sabatYMD, laguSionDb]);'
)

# 6. Add laguSion UI in Search
ui_logic = """
                    {/* Hasil Lagu Sion */}
                    {searchResults.laguSion.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black text-gold-600 uppercase tracking-widest mb-3 px-2">Lagu Sion</h3>
                            <div className="bg-white rounded-2xl border border-navy-100/60 overflow-hidden shadow-sm">
                                {searchResults.laguSion.map((item, idx) => (
                                    <button key={idx} onClick={() => {
                                        if (setLaguSionInitialSong) setLaguSionInitialSong(item.song);
                                        setActiveTab('lagu_sion');
                                    }} className={`w-full flex items-center p-4 text-left hover:bg-gold-50/50 transition-colors ${idx !== searchResults.laguSion.length - 1 ? 'border-b border-navy-50' : ''}`}>
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mr-4 shrink-0 font-bold text-sm">
                                            {item.song.number}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-navy-800 truncate">{item.song.title}</div>
                                            <div className="text-xs text-navy-500 truncate">
                                                {item.matchedLine ? `"... ${item.matchedLine} ..."` : `Key: ${item.song.keyTime} | Composer: ${item.song.artist || 'Anonim'}`}
                                            </div>
                                        </div>
                                        <Icon name="ChevronRight" className="w-4 h-4 text-navy-300 ml-2" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
"""
code = code.replace(
    '{searchResults.warta.length > 0 && (',
    ui_logic + '\n                    {searchResults.warta.length > 0 && ('
)

# 7. Modify tabs array in App
code = code.replace(
    "{ id: 'lagu_sion', label: 'Lagu Sion', icon: 'Music', isExternal: true, link: 'https://play.lagusion.org/' },",
    "{ id: 'lagu_sion', label: 'Lagu Sion', icon: 'Music' },"
)

# 8. Add states and effect to App
states_logic = """
    const [laguSionDb, setLaguSionDb] = React.useState([]);
    const [laguSionInitialSong, setLaguSionInitialSong] = React.useState(null);
    const [laguSionSubTab, setLaguSionSubTab] = React.useState('numpad');

    React.useEffect(() => {
        fetch('/lagu_sion.json')
            .then(r => r.json())
            .then(data => setLaguSionDb(data))
            .catch(err => console.error("Error loading Lagu Sion DB:", err));
    }, []);
"""
code = code.replace(
    'const [bookFormModal, setBookFormModal] = React.useState(false);',
    'const [bookFormModal, setBookFormModal] = React.useState(false);\n' + states_logic
)

# 9. Pass props to Search in renderContent
code = code.replace(
    "case 'search': return <Search setActiveTab={setActiveTab} jadwalDB={jadwalDB} rabuYMD={rabuYMD} sabatYMD={sabatYMD} tabs={tabs} daftarWarta={daftarWarta} dataPejabat={dataPejabat} pengumuman={pengumuman} daftarBuku={daftarBuku} setInitialBook={setInitialBook} />;",
    "case 'search': return <Search setActiveTab={setActiveTab} jadwalDB={jadwalDB} rabuYMD={rabuYMD} sabatYMD={sabatYMD} tabs={tabs} daftarWarta={daftarWarta} dataPejabat={dataPejabat} pengumuman={pengumuman} daftarBuku={daftarBuku} setInitialBook={setInitialBook} laguSionDb={laguSionDb} setLaguSionInitialSong={setLaguSionInitialSong} />;"
)

# 10. Add case 'lagu_sion' to renderContent
code = code.replace(
    "case 'search': return <Search",
    "case 'lagu_sion': return <LaguSion setActiveTab={setActiveTab} subTab={laguSionSubTab} setSubTab={setLaguSionSubTab} initialSong={laguSionInitialSong} clearInitialSong={() => setLaguSionInitialSong(null)} laguSionDb={laguSionDb} />;\n            case 'search': return <Search"
)

# 11. Remove activeTab condition on back button
# The back button logic is:
code = code.replace(
    "{(activeTab === 'home' || activeTab === 'search') ? (",
    "{(activeTab === 'home' || activeTab === 'search' || activeTab === 'lagu_sion') ? ("
)
code = code.replace(
    "{(activeTab === 'search') && (",
    "{(activeTab === 'search' || activeTab === 'lagu_sion') && ("
)
code = code.replace(
    "{!(activeTab === 'home' || activeTab === 'search') ? 'flex-1' : ''}",
    "{!(activeTab === 'home' || activeTab === 'search' || activeTab === 'lagu_sion') ? 'flex-1' : ''}"
)

# 12. Bottom Navbar
code = code.replace(
    "activeTab === 'admin_dashboard' && activeTab !== 'hubungi' && (",
    "activeTab === 'admin_dashboard' && activeTab !== 'hubungi' && activeTab !== 'lagu_sion' && ("
)
code = code.replace(
    "{activeTab !== 'admin_dashboard' && activeTab !== 'hubungi' && (",
    "{activeTab !== 'admin_dashboard' && activeTab !== 'hubungi' && activeTab !== 'lagu_sion' && ("
)

# And Lagu Sion has its own bottom nav!
bottom_nav_logic = """
            {activeTab === 'lagu_sion' && (
                <nav className="fixed bottom-0 w-full backdrop-blur-xl pb-safe z-50 transition-all duration-300 bg-navy-900/95 border-t border-navy-800 shadow-[0_-8px_30px_rgba(11,26,48,0.4)]">
                    <div className="relative flex justify-around items-center max-w-lg mx-auto">
                        {(() => {
                            const lsTabs = [
                                { id: 'home', label: 'Home', icon: 'Home' },
                                { id: 'numpad', label: 'Numpad', icon: 'Grid' },
                                { id: 'lyrics', label: 'Lirik', icon: 'BookOpen' },
                                { id: 'index', label: 'Daftar', icon: 'List' }
                            ];
                            const activeIndex = lsTabs.findIndex(tab => tab.id === (laguSionSubTab || 'numpad'));
                            return (
                                <>
                                    {activeIndex !== -1 && (
                                        <div 
                                            className="absolute inset-y-0 left-0 transition-transform duration-350 ease-[cubic-bezier(0.34,1.5,0.64,1)] pointer-events-none z-0 will-change-transform"
                                            style={{ width: `${100 / lsTabs.length}%`, transform: `translateX(${activeIndex * 100}%)` }}
                                        >
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-b-full bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 shadow-[0_2px_10px_rgba(232,177,53,0.5)]" />
                                            <div className="mx-1 my-1.5 h-[calc(100%-12px)] rounded-2xl bg-gradient-to-b from-gold-400/25 via-gold-400/10 to-transparent border border-gold-400/30 shadow-sm" />
                                        </div>
                                    )}
                                    {lsTabs.map((tab) => {
                                        const isActive = tab.id === laguSionSubTab;
                                        return (
                                            <button 
                                                key={tab.id} 
                                                onClick={() => {
                                                    if (tab.id === 'home') setActiveTab('home');
                                                    else setLaguSionSubTab(tab.id);
                                                }}
                                                className={`relative z-10 flex flex-col items-center justify-center w-full py-3.5 transition-all duration-300 ${isActive ? 'text-gold-400 scale-105' : 'text-navy-400 hover:text-navy-300'}`}
                                            >
                                                <Icon name={tab.icon} className={`w-5 h-5 mb-1 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(232,177,53,0.5)]' : ''}`} />
                                                <span className={`text-[9px] uppercase tracking-widest transition-all duration-300 ${isActive ? 'font-black opacity-100 drop-shadow-md' : 'font-bold opacity-70'}`}>
                                                    {tab.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </>
                            );
                        })()}
                    </div>
                </nav>
            )}
"""
code = code.replace(
    '</main>',
    '</main>\n' + bottom_nav_logic
)

with open('src/indexApp.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

