import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Icon,
    stripHtml,
    isWartaPublished,
    sortBooksNewestFirst,
    ALKITAB_BOOKS,
    formatIndoDateShort
} from './portalShared';

export const UniversalSearchModal = ({
    isOpen,
    onClose,
    setActiveTab,
    jadwalDB = {},
    rabuYMD = '',
    sabatYMD = '',
    daftarWarta = [],
    dataPejabat = [],
    pengumuman = null,
    daftarBuku = [],
    setInitialBook = () => {},
    laguSionDb = [],
    setLaguSionInitialSong = () => {},
    setSelectedWarta = () => {}
}) => {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'lagu' | 'alkitab' | 'warta' | 'jadwal' | 'buku'
    const inputRef = useRef(null);

    // Auto-focus input saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 50);
        } else {
            setQuery('');
            setActiveCategory('all');
        }
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Hasil Pencarian Multi-Kategori
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q.length < 2) {
            return { lagu: [], alkitab: [], warta: [], jadwal: [], buku: [], total: 0 };
        }

        const out = {
            lagu: [],
            alkitab: [],
            warta: [],
            jadwal: [],
            buku: [],
            total: 0
        };

        // 1. Lagu Sion (berdasarkan nomor lagu atau judul/lirik)
        if (Array.isArray(laguSionDb) && laguSionDb.length) {
            const isNum = /^\d+$/.test(q);
            out.lagu = laguSionDb.filter(s => {
                if (isNum) return String(s.no || s.nomor || '').includes(q);
                const title = String(s.title || s.judul || '').toLowerCase();
                const lirik = String(s.lyrics || s.lirik || '').toLowerCase();
                return title.includes(q) || lirik.includes(q);
            }).slice(0, 8);
        }

        // 2. Alkitab (Kitab 1 - 66)
        if (Array.isArray(ALKITAB_BOOKS)) {
            out.alkitab = ALKITAB_BOOKS.filter(b => {
                const bName = String(b.name || '').toLowerCase();
                return bName.includes(q);
            }).slice(0, 6);
        }

        // 3. Warta Jemaat
        if (Array.isArray(daftarWarta) && daftarWarta.length) {
            out.warta = daftarWarta
                .filter(w => isWartaPublished(w.tanggal))
                .filter(w => {
                    const j = String(w.judul || '').toLowerCase();
                    const p = String(w.penulis || '').toLowerCase();
                    const isi = stripHtml(w.isi || '').toLowerCase();
                    return j.includes(q) || p.includes(q) || isi.includes(q);
                }).slice(0, 6);
        }

        // 4. Jadwal & Petugas Ibadah
        if (jadwalDB && typeof jadwalDB === 'object') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const allDates = [...new Set([...Object.keys(jadwalDB), rabuYMD, sabatYMD])].filter(Boolean).sort();
            allDates.forEach(dateStr => {
                const dObj = new Date(dateStr + "T00:00:00");
                if (dObj >= today && out.jadwal.length < 8) {
                    const jData = jadwalDB[dateStr];
                    const isRabu = dObj.getDay() === 3;
                    if (isRabu && jData?.petugas) {
                        jData.petugas.forEach(p => {
                            if (p.nama && String(p.nama).toLowerCase().includes(q)) {
                                out.jadwal.push({ date: dateStr, sesi: 'Ibadah Doa Rabu', tugas: p.tugas, nama: p.nama });
                            }
                        });
                    } else if (!isRabu && jData) {
                        ['khotbah', 'sekolahSabat', 'diakon', 'musik'].forEach(cat => {
                            if (Array.isArray(jData[cat])) {
                                jData[cat].forEach(p => {
                                    if (p.nama && String(p.nama).toLowerCase().includes(q)) {
                                        out.jadwal.push({ date: dateStr, sesi: 'Sabat (' + cat + ')', tugas: p.tugas, nama: p.nama });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }

        // 5. Pustaka Roh Nubuat / Buku
        if (Array.isArray(daftarBuku) && daftarBuku.length) {
            out.buku = sortBooksNewestFirst(
                daftarBuku.filter(b => {
                    const t = String(b.title || '').toLowerCase();
                    const a = String(b.author || '').toLowerCase();
                    const d = String(b.desc || '').toLowerCase();
                    return t.includes(q) || a.includes(q) || d.includes(q);
                }),
                daftarBuku
            ).slice(0, 6);
        }

        out.total = out.lagu.length + out.alkitab.length + out.warta.length + out.jadwal.length + out.buku.length;
        return out;
    }, [query, laguSionDb, daftarWarta, jadwalDB, rabuYMD, sabatYMD, daftarBuku]);

    if (!isOpen) return null;

    const handleSelectLagu = (song) => {
        setLaguSionInitialSong(song);
        setActiveTab('lagu_sion');
        onClose();
    };

    const handleSelectAlkitab = (book) => {
        try {
            localStorage.setItem('PISGAH_SELECTED_BOOK_NO', String(book.no));
            window.dispatchEvent(new CustomEvent('pisgah-open-alkitab-book', { detail: { bookNo: book.no } }));
        } catch (e) {}
        setActiveTab('alkitab');
        onClose();
    };

    const handleSelectWarta = (w) => {
        setSelectedWarta(w);
        setActiveTab('warta');
        onClose();
    };

    const handleSelectBuku = (b) => {
        setInitialBook(b);
        setActiveTab('belajar_perpustakaan');
        onClose();
    };

    const handleSelectJadwal = () => {
        setActiveTab('jadwal');
        onClose();
    };

    const categoryFilters = [
        { id: 'all', label: `Semua (${results.total})` },
        { id: 'lagu', label: `🎵 Lagu Sion (${results.lagu.length})` },
        { id: 'alkitab', label: `📖 Alkitab (${results.alkitab.length})` },
        { id: 'warta', label: `📰 Warta (${results.warta.length})` },
        { id: 'jadwal', label: `📅 Jadwal (${results.jadwal.length})` },
        { id: 'buku', label: `📚 Pustaka (${results.buku.length})` }
    ];

    const modalContent = (
        <div className="fixed inset-0 z-[500] flex items-start justify-center pt-12 sm:pt-20 px-4 pb-6 overflow-y-auto animate-fade-in">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
            />

            {/* Spotlight Container */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border-2 border-[#E2E8D8] dark:border-navy-700 overflow-hidden flex flex-col z-10 max-h-[85vh]">
                {/* Search Bar Header */}
                <div className="p-4 sm:p-5 border-b border-[#E2E8D8] dark:border-navy-800 flex items-center gap-3 bg-[#F7F9F3] dark:bg-navy-950/80">
                    <Icon name="Search" className="w-5 h-5 text-[#4A7045] dark:text-gold-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ketik lagu, kitab Alkitab, nama petugas, warta, atau buku..."
                        className="w-full bg-transparent text-navy-900 dark:text-white placeholder-[#596B4D]/60 dark:placeholder-gray-500 font-bold text-sm sm:text-base outline-none"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white shrink-0 cursor-pointer"
                        >
                            <Icon name="X" className="w-4 h-4" />
                        </button>
                    )}
                    <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-md border border-gray-300/50 dark:border-navy-700 bg-white/60 dark:bg-navy-900 shrink-0 select-none">
                        <span>ESC</span>
                    </div>
                </div>

                {/* Filter Tabs */}
                {query.trim().length >= 2 && results.total > 0 && (
                    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#E2E8D8] dark:border-navy-800 overflow-x-auto custom-scrollbar bg-white dark:bg-navy-900">
                        {categoryFilters.map(cf => (
                            <button
                                key={cf.id}
                                type="button"
                                onClick={() => setActiveCategory(cf.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${activeCategory === cf.id ? 'bg-[#4A7045] text-white dark:bg-gold-500 dark:text-navy-950' : 'text-[#596B4D] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'}`}
                            >
                                {cf.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Search Results Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-4">
                    {query.trim().length < 2 ? (
                        <div className="py-12 text-center text-[#596B4D] dark:text-gray-400 space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-[#4A7045]/10 dark:bg-gold-500/15 text-[#4A7045] dark:text-gold-400 flex items-center justify-center mx-auto mb-3">
                                <Icon name="Search" className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-navy-800 dark:text-white">Pencarian Universal PISGAH-BISDAC</p>
                            <p className="text-xs max-w-sm mx-auto">
                                Ketik judul/nomor <strong>Lagu Sion</strong>, nama kitab <strong>Alkitab</strong>, <strong>Jadwal Petugas</strong>, <strong>Warta Jemaat</strong>, atau <strong>Buku Rohani</strong>.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 pt-3">
                                {['LS 1', 'Matius', 'Sekolah Sabat', 'Warta', 'Keluarga'].map(hint => (
                                    <button
                                        key={hint}
                                        type="button"
                                        onClick={() => setQuery(hint)}
                                        className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-navy-800 text-navy-700 dark:text-gray-300 hover:bg-[#4A7045]/20 hover:text-[#2C3F21] dark:hover:text-gold-300 transition"
                                    >
                                        + {hint}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : results.total === 0 ? (
                        <div className="py-12 text-center text-[#596B4D] dark:text-gray-400">
                            <Icon name="Info" className="w-8 h-8 mx-auto text-[#D19B45] mb-2" />
                            <p className="text-sm font-bold text-navy-800 dark:text-white">Tidak ada hasil untuk "{query}"</p>
                            <p className="text-xs mt-1">Coba gunakan kata kunci yang lebih umum atau periksa ejaan.</p>
                        </div>
                    ) : (
                        <>
                            {/* Kategori: Lagu Sion */}
                            {(activeCategory === 'all' || activeCategory === 'lagu') && results.lagu.length > 0 && (
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4A7045] dark:text-gold-400 mb-2 px-1 flex items-center gap-1.5">
                                        <Icon name="Music" className="w-3.5 h-3.5" /> Lagu Sion ({results.lagu.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {results.lagu.map(s => (
                                            <button
                                                key={s.no || s.nomor}
                                                type="button"
                                                onClick={() => handleSelectLagu(s)}
                                                className="p-2.5 rounded-xl text-left bg-[#F7F9F3] dark:bg-navy-950/70 hover:bg-[#4A7045]/15 dark:hover:bg-gold-500/15 border border-[#E2E8D8] dark:border-navy-800 hover:border-[#4A7045] dark:hover:border-gold-500/50 transition cursor-pointer flex items-center gap-3 group"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-[#4A7045] text-white dark:bg-gold-500 dark:text-navy-950 font-black text-xs flex items-center justify-center shrink-0">
                                                    {s.no || s.nomor}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-navy-900 dark:text-white truncate group-hover:text-[#4A7045] dark:group-hover:text-gold-300">
                                                        {s.title || s.judul}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                                        Buka Lirik & Pemutar Musik &rarr;
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Kategori: Alkitab */}
                            {(activeCategory === 'all' || activeCategory === 'alkitab') && results.alkitab.length > 0 && (
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4A7045] dark:text-gold-400 mb-2 px-1 flex items-center gap-1.5">
                                        <Icon name="BookOpen" className="w-3.5 h-3.5" /> Kitab Alkitab ({results.alkitab.length})
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {results.alkitab.map(b => (
                                            <button
                                                key={b.no}
                                                type="button"
                                                onClick={() => handleSelectAlkitab(b)}
                                                className="p-2.5 rounded-xl text-left bg-[#F7F9F3] dark:bg-navy-950/70 hover:bg-[#4A7045]/15 dark:hover:bg-gold-500/15 border border-[#E2E8D8] dark:border-navy-800 hover:border-[#4A7045] dark:hover:border-gold-500/50 transition cursor-pointer flex items-center justify-between group"
                                            >
                                                <div>
                                                    <p className="text-xs font-black text-navy-900 dark:text-white group-hover:text-[#4A7045] dark:group-hover:text-gold-300">
                                                        {b.name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                        {b.chapters} Pasal • {b.testament}
                                                    </p>
                                                </div>
                                                <Icon name="ChevronRight" className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#4A7045] dark:group-hover:text-gold-400 shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Kategori: Warta Jemaat */}
                            {(activeCategory === 'all' || activeCategory === 'warta') && results.warta.length > 0 && (
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4A7045] dark:text-gold-400 mb-2 px-1 flex items-center gap-1.5">
                                        <Icon name="Megaphone" className="w-3.5 h-3.5" /> Warta Jemaat ({results.warta.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {results.warta.map((w, idx) => (
                                            <button
                                                key={w.id || idx}
                                                type="button"
                                                onClick={() => handleSelectWarta(w)}
                                                className="w-full p-2.5 rounded-xl text-left bg-[#F7F9F3] dark:bg-navy-950/70 hover:bg-[#4A7045]/15 dark:hover:bg-gold-500/15 border border-[#E2E8D8] dark:border-navy-800 hover:border-[#4A7045] dark:hover:border-gold-500/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-navy-900 dark:text-white truncate group-hover:text-[#4A7045] dark:group-hover:text-gold-300">
                                                        {w.judul}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                                        {stripHtml(w.isi || '')}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-[#4A7045] dark:text-gold-400 font-bold shrink-0">
                                                    {w.tanggal} &rarr;
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Kategori: Jadwal & Petugas */}
                            {(activeCategory === 'all' || activeCategory === 'jadwal') && results.jadwal.length > 0 && (
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4A7045] dark:text-gold-400 mb-2 px-1 flex items-center gap-1.5">
                                        <Icon name="Calendar" className="w-3.5 h-3.5" /> Jadwal Petugas Kebaktian ({results.jadwal.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {results.jadwal.map((j, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={handleSelectJadwal}
                                                className="p-2.5 rounded-xl text-left bg-[#F7F9F3] dark:bg-navy-950/70 hover:bg-[#4A7045]/15 dark:hover:bg-gold-500/15 border border-[#E2E8D8] dark:border-navy-800 hover:border-[#4A7045] dark:hover:border-gold-500/50 transition cursor-pointer flex flex-col justify-between group"
                                            >
                                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                    <span>{j.sesi}</span>
                                                    <span className="text-[#9A6B1A] dark:text-gold-300">{formatIndoDateShort(j.date)}</span>
                                                </div>
                                                <p className="text-xs font-black text-navy-900 dark:text-white">
                                                    {j.tugas}: <strong className="text-[#4A7045] dark:text-gold-400">{j.nama}</strong>
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Kategori: Pustaka / Buku Rohani */}
                            {(activeCategory === 'all' || activeCategory === 'buku') && results.buku.length > 0 && (
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4A7045] dark:text-gold-400 mb-2 px-1 flex items-center gap-1.5">
                                        <Icon name="Book" className="w-3.5 h-3.5" /> Buku Rohani & Roh Nubuat ({results.buku.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {results.buku.map(b => (
                                            <button
                                                key={b.id}
                                                type="button"
                                                onClick={() => handleSelectBuku(b)}
                                                className="p-2.5 rounded-xl text-left bg-[#F7F9F3] dark:bg-navy-950/70 hover:bg-[#4A7045]/15 dark:hover:bg-gold-500/15 border border-[#E2E8D8] dark:border-navy-800 hover:border-[#4A7045] dark:hover:border-gold-500/50 transition cursor-pointer flex items-center gap-3 group"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-black text-navy-900 dark:text-white truncate group-hover:text-[#4A7045] dark:group-hover:text-gold-300">
                                                        {b.title}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                                        {b.author || 'Roh Nubuat'}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-[#4A7045] dark:text-gold-400 font-bold shrink-0">
                                                    Baca &rarr;
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Modal */}
                <div className="p-3 border-t border-[#E2E8D8] dark:border-navy-800 bg-[#F7F9F3] dark:bg-navy-950/60 flex items-center justify-between text-[11px] text-[#596B4D] dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <span>PISGAH-BISDAC Universal Spotlight</span>
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1 rounded-lg bg-gray-200/80 dark:bg-navy-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-navy-700 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

