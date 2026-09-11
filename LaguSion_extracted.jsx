const LaguSion = ({ setActiveTab, initialSong, clearInitialSong, laguSionDb = [], subTab = 'numpad', setSubTab = () => {} }) => {
    const [songNo, setSongNo] = React.useState('');
    const [selectedSong, setSelectedSong] = React.useState(null);
    const [indexTab, setIndexTab] = React.useState('number'); // number, alphabet
    const [db, setDb] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    // Load lyrics from public/lagu_sion.json if not passed from parent
    React.useEffect(() => {
        if (laguSionDb && laguSionDb.length > 0) {
            setDb(laguSionDb);
        } else {
            setIsLoading(true);
            fetch('/lagu_sion.json')
                .then(r => r.json())
                .then(data => {
                    setDb(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Error loading Lagu Sion inside component:", err);
                    setIsLoading(false);
                });
        }
    }, [laguSionDb]);

    // Handle initial song from global search
    React.useEffect(() => {
        if (initialSong) {
            setSelectedSong(initialSong);
            setSubTab('lyrics');
            clearInitialSong();
        }
    }, [initialSong, clearInitialSong]);

    // Numpad Key Press
    const handleKeyPress = (val) => {
        if (val === 'clear') {
            setSongNo('');
        } else if (val === 'backspace') {
            setSongNo(prev => prev.slice(0, -1));
        } else {
            // Max 3 digits
            if (songNo.length < 3) {
                setSongNo(prev => prev + val);
            }
        }
    };

    // Go to lyrics
    const handleGo = () => {
        if (!songNo) return;
        const num = parseInt(songNo, 10);
        const song = db.find(s => s.number === num);
        if (song) {
            setSelectedSong(song);
            setSubTab('lyrics');
            setSongNo('');
        } else {
            alert(`Lagu nomor ${songNo} tidak ditemukan. Silakan masukkan nomor antara 1 dan 525.`);
        }
    };

    // Navigate to Prev/Next song
    const handlePrevNext = (direction) => {
        if (!selectedSong) return;
        let nextNum = selectedSong.number + direction;
        if (nextNum < 1) nextNum = 525;
        if (nextNum > 525) nextNum = 1;
        const nextSong = db.find(s => s.number === nextNum);
        if (nextSong) {
            setSelectedSong(nextSong);
        }
    };

    // Share song
    const handleShare = () => {
        if (!selectedSong) return;
        const lyricsText = selectedSong.verses.map(v => `[${v.label}]\n${v.lines.join('\n')}`).join('\n\n');
        const shareText = `Lagu Sion No. ${selectedSong.number} - ${selectedSong.title}\nKey/Time: ${selectedSong.keyTime}\n\n${lyricsText}`;
        
        if (navigator.share) {
            navigator.share({
                title: `Lagu Sion No. ${selectedSong.number} - ${selectedSong.title}`,
                text: shareText,
            }).catch(err => console.log('Error sharing:', err));
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    // Sorted index list
    const indexedSongs = React.useMemo(() => {
        const list = [...db];
        if (indexTab === 'alphabet') {
            list.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            list.sort((a, b) => a.number - b.number);
        }
        return list;
    }, [db, indexTab]);

    return (
        <div className="animate-fade-in relative z-10 pb-32">
            {isLoading && (
                <div className="fixed inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
                    <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-bold text-navy-500 tracking-wider uppercase">Memuat Database Lagu...</p>
                </div>
            )}

            {/* Subtab: Numpad */}
            {subTab === 'numpad' && (
                <div className="flex flex-col justify-end min-h-[calc(100vh-220px)] pb-2">
                    <div className="max-w-md w-full mx-auto bg-sky-400 rounded-3xl overflow-hidden shadow-lg border border-sky-300/30 flex flex-col mt-auto">
                        {/* Song Number display */}
                        <div className="bg-navy-900 text-white text-5xl font-black tracking-widest py-8 text-center shrink-0">
                            {songNo || '---'}
                        </div>

                        {/* Numpad Keypad Grid */}
                        <div className="grid grid-cols-3 bg-sky-400 divide-x divide-y divide-sky-300/40 border-t border-b border-sky-300/40 text-white shrink-0 select-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button key={num} onClick={() => handleKeyPress(num)} className="py-5 text-2xl font-bold hover:bg-sky-300/20 active:bg-sky-300/40 transition-colors cursor-pointer outline-none">
                                    {num}
                                </button>
                            ))}
                            <button onClick={() => handleKeyPress('clear')} className="py-5 text-sm font-bold uppercase tracking-wider hover:bg-sky-300/20 active:bg-sky-300/40 transition-colors cursor-pointer outline-none">
                                Clear
                            </button>
                            <button onClick={() => handleKeyPress(0)} className="py-5 text-2xl font-bold hover:bg-sky-300/20 active:bg-sky-300/40 transition-colors cursor-pointer outline-none">
                                0
                            </button>
                            <button onClick={() => handleKeyPress('backspace')} className="py-5 flex items-center justify-center hover:bg-sky-300/20 active:bg-sky-300/40 transition-colors cursor-pointer outline-none">
                                <Icon name="Backspace" className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Go Button */}
                        <button onClick={handleGo} className="w-full bg-navy-900 hover:bg-navy-800 text-white py-5 font-black text-lg tracking-widest uppercase transition-colors shrink-0 cursor-pointer outline-none">
                            Go
                        </button>
                    </div>
                </div>
            )}

            {/* Subtab: Lyrics */}
            {subTab === 'lyrics' && (
                <div className="space-y-4 max-w-xl mx-auto">
                    {selectedSong ? (
                        <>
                            {/* Navy Song navigation header */}
                            <div className="bg-navy-900 text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-md">
                                <span className="font-black text-lg text-gold-400">Lagu Sion No. {selectedSong.number}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handlePrevNext(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
                                        <Icon name="ArrowLeft" className="w-5 h-5 stroke-2" />
                                    </button>
                                    <button onClick={() => handlePrevNext(1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
                                        <Icon name="ArrowRight" className="w-5 h-5 stroke-2" />
                                    </button>
                                </div>
                            </div>

                            {/* Sky Blue Song Title block */}
                            <div className="bg-sky-400 text-white px-5 py-4 rounded-2xl flex items-center justify-between shadow-md">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h2 className="font-black text-xl leading-tight truncate">{selectedSong.title}</h2>
                                    <p className="text-xs text-sky-100 font-medium mt-0.5 truncate">
                                        {selectedSong.keyTime} {selectedSong.artist ? `| ${selectedSong.artist}` : ''}
                                    </p>
                                </div>
                                <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 transition-colors relative shrink-0">
                                    <Icon name="Share" className="w-5 h-5" />
                                    {copied && (
                                        <span className="absolute -top-9 right-0 bg-navy-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap animate-fade-in">
                                            Disalin!
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Lyrics sheet card */}
                            <div className="bg-white rounded-3xl border border-navy-100/50 p-6 md:p-8 shadow-sm space-y-6 select-text">
                                {selectedSong.verses.map((verse, idx) => {
                                    const isCh = verse.type === 'chorus';
                                    return (
                                        <div key={idx} className={`space-y-2 ${isCh ? 'pl-4 border-l-4 border-sky-400 bg-sky-50/30 py-2 pr-2 rounded-r-lg' : ''}`}>
                                            <div className={`text-xs font-black uppercase tracking-wider ${isCh ? 'text-sky-500' : 'text-navy-400'}`}>
                                                {verse.label}
                                            </div>
                                            <div className={`text-base md:text-lg leading-relaxed font-medium ${isCh ? 'italic text-navy-800' : 'text-navy-900'}`}>
                                                {verse.lines.map((line, lIdx) => (
                                                    <p key={lIdx} className="mb-1">{line}</p>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-3xl border border-navy-100/50 p-10 shadow-sm flex flex-col items-center justify-center text-center opacity-70">
                            <Icon name="BookOpen" className="w-14 h-14 text-navy-300 mb-4 animate-pulse" />
                            <h3 className="font-black text-navy-800 uppercase tracking-widest text-sm mb-2">Belum ada lirik aktif</h3>
                            <p className="text-xs text-navy-500 max-w-xs leading-relaxed">Ketik nomor lagu di Numpad atau cari judul/lirik di kotak pencarian di atas.</p>
                            <button onClick={() => setSubTab('numpad')} className="mt-5 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-md transition-all">
                                Buka Numpad
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Subtab: Index (Daftar) */}
            {subTab === 'index' && (
                <div className="max-w-xl mx-auto space-y-4">
                    <div className="bg-white rounded-2xl border border-navy-100/50 px-4 py-3 flex items-center justify-between shadow-sm">
                        <span className="text-xs font-black text-navy-400 uppercase tracking-wide">Urutkan Daftar</span>
                        <div className="flex bg-navy-100/60 p-0.5 rounded-lg">
                            <button onClick={() => setIndexTab('number')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${indexTab === 'number' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}>
                                Nomor
                            </button>
                            <button onClick={() => setIndexTab('alphabet')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${indexTab === 'alphabet' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}>
                                Abjad
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-navy-100/50 overflow-hidden shadow-sm">
                        {indexedSongs.map((song, idx) => (
                            <button key={song.number} onClick={() => {
                                setSelectedSong(song);
                                setSubTab('lyrics');
                            }} className={`w-full flex items-center p-4 text-left hover:bg-gold-50/50 transition-colors ${idx !== indexedSongs.length - 1 ? 'border-b border-navy-50' : ''}`}>
                                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-600 mr-4 shrink-0 font-black text-sm">
                                    {song.number}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-navy-800 truncate">{song.title}</div>
                                    <div className="text-xs text-navy-500 truncate">{song.keyTime} {song.artist ? `| ${song.artist}` : ''}</div>
                                </div>
                                <Icon name="ChevronRight" className="w-4 h-4 text-navy-300 ml-2" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

