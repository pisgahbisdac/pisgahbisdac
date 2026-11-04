import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, Maximize, Minimize2, FileText, Download, Share2, Info, BookOpen, Search as SearchIcon, X, CheckCircle, Navigation, MapPin, Calendar, Phone, Mail, Clock, Globe, ArrowRight, User, PlusCircle, PenTool, Layout, ExternalLink, Menu, Music, Activity, Megaphone, Video, ArrowLeft, MoreHorizontal, MessageCircle, Heart, Star, Compass, Anchor, Copy, Check, Upload, Trash2, Map as MapIcon } from 'lucide-react';
import {
  GAS_API_URL,
  getSvgBookCover,
  BOOK_CATEGORY_DEFAULTS,
  getDefaultBookCover,
  parseGambarUrls,
  stripHtml,
  truncateText,
  WARTA_CATEGORIES,
  parseWartaInfo,
  decodeHTML,
  compressImage,
  scrollToTop,
  getGoogleDriveFileId,
  handleImageErrorFallback,
  formatImageUrl,
  getCoverFallback,
  handleBookCoverError,
  DocumentBadge,
  sortBooksNewestFirst,
  LoadingScreen,
  defaultSusunan,
  initialJadwalRabu,
  initialJadwalSabat,
  ALKITAB_BOOKS,
  IosInstallModal,
  ManualInstallModal,
  PwaInstallBanner,
  initialDataPejabat,
  Icon,
  toYMD,
  formatIndoDateShort,
  formatIndoDate,
  formatDate,
  formatIndoDateTime,
  isWartaPublished,
  getYouTubeVideoId,
  formatYouTubeEmbedUrl,
  VideoThumbnail,
  getCleanBaseUrl,
  getCleanShareUrl,
  getWartaShareUrl,
  createGoogleCalendarUrl,
  shareEventToWhatsApp,
  AcaraTerdekat,
  DAILY_VERSES,
  PISGAH_DEFAULT_COORDS,
  getAstronomicalSunsetWIB,
  getSabbathSunsetSchedule,
  DEFAULT_PLACEHOLDER_OFFICERS,
  isRealOfficerName,
  findOfficerPhoneFromPejabat,
  sendWhatsAppOfficerReminder,
  SabbathCountdownWidget,
  renderHighlightedText,
  VERSE_CARD_THEMES,
  VerseImageCardModal,
  DailyVerseWidget,
  OFFICER_ATTENDANCE_STORAGE_KEY,
  PRAYER_REQUESTS_STORAGE_KEY,
  PRAYED_IDS_STORAGE_KEY,
  MEMBER_BIRTHDAYS_STORAGE_KEY,
  ANNUAL_CALENDAR_STORAGE_KEY,
  getOfficerAttendanceKey,
  loadOfficerAttendanceMap,
  saveOfficerAttendanceRecord,
  useOfficerAttendance,
  findSecretaryPhone,
  OfficerAttendanceModal,
  PRAYER_CATEGORIES,
  INITIAL_PRAYER_REQUESTS,
  loadPrayerRequests,
  savePrayerRequests,
  parsePrayerContent,
  PrayerContentRenderer,
  ScrollableFilterBar,
  PrayerRequestWallWidget,
  INITIAL_MEMBER_BIRTHDAYS,
  LEGACY_DUMMY_BDAY_IDS,
  INITIAL_ANNUAL_CALENDAR,
  loadMemberBirthdays,
  saveMemberBirthdays,
  loadAnnualCalendar,
  saveAnnualCalendar,
  BirthdayAndCalendarWidget,
  QuickDutyFinderWidget,
  DEFAULT_HERO_CAPTIONS,
  parseFolderDate,
  getFolderCategoryInfo,
  formatFolderDateLabel,
  BIBLE_YEAR_MONTH_NAMES,
  BIBLE_YEAR_MONTH_DAYS
} from './portalShared';

export const LaguSion = ({ setActiveTab, initialSong, clearInitialSong, laguSionDb = [], subTab = 'numpad', setSubTab = () => { } }) => {
    const [songNo, setSongNo] = React.useState('');
    const [selectedSong, setSelectedSong] = React.useState(null);
    const [indexTab, setIndexTab] = React.useState('number'); // number, alphabet
    const [searchQuery, setSearchQuery] = React.useState('');
    const [db, setDb] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    // Navigasi Kembali ke Tab Sebelumnya (misal Susunan Ibadah)
    const [returnTab, setReturnTab] = React.useState(() => {
        try {
            return window.__laguSionReturnTab || localStorage.getItem('laguSionReturnTab') || null;
        } catch (e) {
            return null;
        }
    });

    React.useEffect(() => {
        const rt = window.__laguSionReturnTab || localStorage.getItem('laguSionReturnTab');
        if (rt) setReturnTab(rt);
    }, [initialSong, subTab]);

    const handleReturnNavigation = () => {
        const dest = returnTab || window.__laguSionReturnTab || localStorage.getItem('laguSionReturnTab');
        try {
            localStorage.removeItem('laguSionReturnTab');
            window.__laguSionReturnTab = null;
        } catch (e) { }
        setReturnTab(null);
        if (dest) {
            setActiveTab(dest);
        } else {
            setActiveTab('susunan_ibadah');
        }
    };

    const [lyricFontSize, setLyricFontSize] = React.useState(() => {
        try {
            const saved = parseInt(localStorage.getItem('PISGAH_LAGUSION_FONT_SIZE'), 10);
            if (!isNaN(saved) && saved >= 14 && saved <= 36) return saved;
        } catch (e) { }
        return 18;
    });
    const updateLyricFontSize = (newSize) => {
        const clamped = Math.min(36, Math.max(14, newSize));
        setLyricFontSize(clamped);
        try {
            localStorage.setItem('PISGAH_LAGUSION_FONT_SIZE', String(clamped));
        } catch (e) { }
    };

    // Koleksi Lagu Favorit Pribadi (localStorage)
    const [favoriteSongNos, setFavoriteSongNos] = React.useState(() => {
        try {
            const raw = localStorage.getItem('PISGAH_LAGUSION_FAVORITES');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    });

    const toggleFavoriteSong = (num) => {
        if (!num) return;
        setFavoriteSongNos(prev => {
            const exists = prev.includes(num);
            const next = exists ? prev.filter(n => n !== num) : [...prev, num];
            try {
                localStorage.setItem('PISGAH_LAGUSION_FAVORITES', JSON.stringify(next));
            } catch (e) { }
            return next;
        });
    };

    // Pembidik Nada Dasar (Pitch Pipe Synth via Web Audio API)
    const [pitchPipeOpen, setPitchPipeOpen] = React.useState(false);
    const [activePlayingNote, setActivePlayingNote] = React.useState(null);

    const PITCH_NOTES = [
        { note: 'C', label: 'C (Do)', freq: 261.63 },
        { note: 'D', label: 'D (Re)', freq: 293.66 },
        { note: 'Eb', label: 'Eb/D#', freq: 311.13 },
        { note: 'E', label: 'E (Mi)', freq: 329.63 },
        { note: 'F', label: 'F (Fa)', freq: 349.23 },
        { note: 'G', label: 'G (Sol)', freq: 392.00 },
        { note: 'Ab', label: 'Ab/G#', freq: 415.30 },
        { note: 'A', label: 'A (La)', freq: 440.00 },
        { note: 'Bb', label: 'Bb/A#', freq: 466.16 },
        { note: 'B', label: 'B (Si)', freq: 493.88 }
    ];

    const playPitch = (freq, noteName) => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.35, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 2.5);
            setActivePlayingNote(noteName);
            setTimeout(() => {
                setActivePlayingNote(null);
            }, 2500);
        } catch (e) {
            console.warn('Audio tone error:', e);
        }
    };

    // Load lyrics from public/lagu_sion.json if not passed from parent
    React.useEffect(() => {
        if (laguSionDb && laguSionDb.length > 0) {
            setDb(laguSionDb);
        } else {
            setIsLoading(true);
            fetch('./lagu_sion.json')
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
            // Max 4 digits
            if (songNo.length < 4) {
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
            const maxNum = db.length > 0 ? Math.max(...db.map(s => Number(s.number) || 0)) : 525;
            alert(`Lagu nomor ${songNo} tidak ditemukan. Silakan masukkan nomor antara 1 dan ${maxNum}.`);
        }
    };

    // Navigate to Prev/Next song
    const handlePrevNext = (direction) => {
        if (!selectedSong || !db || db.length === 0) return;
        const currentIndex = db.findIndex(s => s.number === selectedSong.number);
        if (currentIndex >= 0) {
            let nextIndex = currentIndex + direction;
            if (nextIndex < 0) nextIndex = db.length - 1;
            if (nextIndex >= db.length) nextIndex = 0;
            setSelectedSong(db[nextIndex]);
        }
    };

    // Tampilan Layar Penuh (Fullscreen Mode)
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const fullscreenScrollRef = React.useRef(null);

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            setIsFullscreen(true);
            try {
                const elem = document.documentElement;
                if (elem && elem.requestFullscreen) {
                    elem.requestFullscreen().catch(() => {});
                } else if (elem && elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                }
            } catch (e) { }
        } else {
            setIsFullscreen(false);
            try {
                if (document.fullscreenElement && document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            } catch (e) { }
        }
    };

    // Sinkronkan state isFullscreen saat keluar via ESC keyboard atau gesture browser
    React.useEffect(() => {
        const handleFsChange = () => {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        document.addEventListener('webkitfullscreenchange', handleFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
            document.removeEventListener('webkitfullscreenchange', handleFsChange);
        };
    }, []);

    // Reset scroll posisi atas saat ganti lagu di fullscreen
    React.useEffect(() => {
        if (isFullscreen && fullscreenScrollRef.current) {
            fullscreenScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedSong, isFullscreen]);

    // Keyboard navigation di fullscreen
    React.useEffect(() => {
        if (!isFullscreen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsFullscreen(false);
                if (document.fullscreenElement && document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                }
            } else if (e.key === 'ArrowLeft') {
                handlePrevNext(-1);
            } else if (e.key === 'ArrowRight') {
                handlePrevNext(1);
            } else if (e.key === '+' || e.key === '=') {
                updateLyricFontSize(lyricFontSize + 2);
            } else if (e.key === '-') {
                updateLyricFontSize(lyricFontSize - 2);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen, lyricFontSize, selectedSong, db]);

    // Share song
    const handleShare = () => {
        if (!selectedSong) return;

        let lyricsLines = [];
        let chorusRef = null;
        const verses = selectedSong.verses || [];
        for (let i = 0; i < verses.length; i++) {
            const v = verses[i];
            const vLabel = (v.type === 'chorus' && (!v.label || v.label.toLowerCase() === 'koor')) ? 'Reff' : v.label;
            lyricsLines.push(`[${vLabel}]\n${v.lines.join('\n')}`);
            if (v.type === 'chorus') chorusRef = v;
            if ((v.type === 'verse' || v.type === 'bait') && chorusRef) {
                const nextV = verses[i + 1];
                if (!nextV || nextV.type !== 'chorus') {
                    const cLabel = (!chorusRef.label || chorusRef.label.toLowerCase() === 'koor') ? 'Reff' : chorusRef.label;
                    lyricsLines.push(`[${cLabel}]\n${chorusRef.lines.join('\n')}`);
                }
            }
        }

        const lyricsText = lyricsLines.join('\n\n');
        const appUrl = getCleanShareUrl('lagu_sion', { song: selectedSong.number });
        const shareText = `Lagu Sion No. ${selectedSong.number} - ${selectedSong.title}\nKey/Time: ${selectedSong.keyTime}\n\n${lyricsText}\n\nNyanyikan di: ${appUrl}`;

        const fallbackCopy = (text) => {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }).catch(err => console.error('Copy failed', err));
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                textArea.remove();
            }
        };

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (navigator.share && isMobile) {
            navigator.share({
                title: `Lagu Sion No. ${selectedSong.number} - ${selectedSong.title}`,
                text: shareText,
            }).catch(err => {
                console.log('Error sharing:', err);
                fallbackCopy(shareText);
            });
        } else {
            fallbackCopy(shareText);
        }
    };

    // Sorted index list
    const indexedSongs = React.useMemo(() => {
        let list = [...db];

        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            list = list.filter(song => {
                if (String(song.number) === q) return true;
                if (song.title.toLowerCase().includes(q)) return true;
                if (song.verses && song.verses.some(v => v.lines && v.lines.some(line => line.toLowerCase().includes(q)))) return true;
                return false;
            });
        }

        if (indexTab === 'alphabet') {
            list.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            list.sort((a, b) => a.number - b.number);
        }
        return list;
    }, [db, indexTab, searchQuery]);

    const favoriteSongs = React.useMemo(() => {
        return db.filter(song => favoriteSongNos.includes(song.number)).sort((a, b) => a.number - b.number);
    }, [db, favoriteSongNos]);

    return (
        <div className={`animate-fade-in relative z-10 ${subTab === 'numpad' ? 'pb-2' : 'pb-32'}`}>
            {isLoading && (
                <div className="fixed inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
                    <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-bold text-navy-500 tracking-wider uppercase">Memuat Database Lagu...</p>
                </div>
            )}

            {/* Desktop SubTab Navigation Bar */}
            <div className="hidden md:flex items-center justify-center mt-1 mb-6">
                <div className="bg-white dark:bg-navy-800/90 backdrop-blur-md p-1.5 rounded-2xl border border-navy-100 dark:border-navy-700 shadow-sm flex items-center gap-2">
                    {Boolean(returnTab) && (
                        <button
                            onClick={handleReturnNavigation}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-gold-400 hover:from-amber-300 hover:to-gold-300 text-navy-950 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                            title={`Kembali ke ${returnTab === 'admin_dashboard' ? 'Admin Dashboard' : 'Susunan Ibadah'}`}
                        >
                            <Icon name="ArrowLeft" className="w-4 h-4 stroke-[3]" />
                            <span>{returnTab === 'admin_dashboard' ? 'Admin' : 'Susunan Ibadah'}</span>
                        </button>
                    )}
                    <button
                        onClick={() => setSubTab('numpad')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${subTab === 'numpad'
                            ? 'bg-gradient-to-r from-[#D19B45] to-[#B8863B] text-white shadow-md'
                            : 'text-navy-600 dark:text-navy-300 hover:text-navy-950 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-700/50'
                            }`}
                    >
                        <Icon name="Grid" className="w-4 h-4" />
                        <span>Numpad</span>
                    </button>
                    <button
                        onClick={() => {
                            if (selectedSong) setSubTab('lyrics');
                        }}
                        disabled={!selectedSong}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${!selectedSong
                            ? 'opacity-40 cursor-not-allowed text-navy-400'
                            : subTab === 'lyrics'
                                ? 'bg-gradient-to-r from-[#D19B45] to-[#B8863B] text-white shadow-md'
                                : 'text-navy-600 dark:text-navy-300 hover:text-navy-950 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-700/50'
                            }`}
                        title={!selectedSong ? 'Pilih lagu terlebih dahulu' : 'Lihat lirik lagu'}
                    >
                        <Icon name="BookOpen" className="w-4 h-4" />
                        <span>Lirik Lagu</span>
                    </button>
                    <button
                        onClick={() => setSubTab('favorites')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${subTab === 'favorites'
                            ? 'bg-gradient-to-r from-[#D19B45] to-[#B8863B] text-white shadow-md'
                            : 'text-navy-600 dark:text-navy-300 hover:text-navy-950 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-700/50'
                            }`}
                    >
                        <Icon name="Star" className={`w-4 h-4 ${subTab === 'favorites' ? 'fill-current' : ''}`} />
                        <span>Favorit ({favoriteSongs.length})</span>
                    </button>
                    <button
                        onClick={() => setSubTab('index')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${subTab === 'index'
                            ? 'bg-gradient-to-r from-[#D19B45] to-[#B8863B] text-white shadow-md'
                            : 'text-navy-600 dark:text-navy-300 hover:text-navy-950 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-700/50'
                            }`}
                    >
                        <Icon name="List" className="w-4 h-4" />
                        <span>Daftar Lagu</span>
                    </button>
                </div>
            </div>

            {/* Shared Search Box for Numpad and Index */}
            {(subTab === 'numpad' || subTab === 'index') && (
                <div className="max-w-xl mx-auto mt-2 mb-4 px-4">
                    <div className="flex items-center justify-between gap-2 mb-2 px-1">
                        <span className="text-xs font-black text-navy-800 dark:text-navy-100 uppercase tracking-wider flex items-center gap-1.5">
                            <Icon name="Music" className="w-4 h-4 text-gold-500" />
                            Lagu Sion
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            525 Lagu Siap Offline
                        </span>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Icon name="Search" className="h-5 w-5 text-navy-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari judul, nomor, atau lirik lagu..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value.trim() !== '' && subTab === 'numpad') {
                                    setSubTab('index');
                                }
                            }}
                            className="block w-full pl-11 pr-10 py-3.5 bg-white border border-navy-100/80 rounded-2xl text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-navy-400 hover:text-navy-600 outline-none"
                            >
                                <Icon name="X" className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Subtab: Numpad */}
            {subTab === 'numpad' && (
                <div className="flex flex-col px-4 mt-2">
                    <div className="max-w-md w-full mx-auto bg-white dark:bg-navy-800 rounded-[2rem] overflow-hidden shadow-2xl border border-navy-100 dark:border-navy-700 flex flex-col transition-colors">
                        {/* Song Number display */}
                        <div className="bg-gradient-to-r from-[#D19B45] to-[#B8863B] dark:from-gold-600 dark:to-gold-500 text-white text-5xl font-black tracking-widest py-5 md:py-8 text-center shrink-0 shadow-inner">
                            {songNo || '---'}
                        </div>

                        {/* Numpad Keypad Grid */}
                        <div className="grid grid-cols-3 bg-transparent divide-x divide-y divide-navy-100 dark:divide-navy-700 border-t border-b border-navy-100 dark:border-navy-700 text-navy-900 dark:text-white shrink-0 select-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button key={num} onClick={() => handleKeyPress(num)} className="py-3 md:py-6 text-3xl font-bold hover:bg-navy-50 dark:hover:bg-navy-700/50 active:bg-navy-100 dark:active:bg-navy-600 transition-colors cursor-pointer outline-none">
                                    {num}
                                </button>
                            ))}
                            <button onClick={() => handleKeyPress('clear')} className="py-3 md:py-6 text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/40 transition-colors cursor-pointer outline-none">
                                Clear
                            </button>
                            <button onClick={() => handleKeyPress(0)} className="py-3 md:py-6 text-3xl font-bold hover:bg-navy-50 dark:hover:bg-navy-700/50 active:bg-navy-100 dark:active:bg-navy-600 transition-colors cursor-pointer outline-none">
                                0
                            </button>
                            <button onClick={() => handleKeyPress('backspace')} className="py-3 md:py-6 flex items-center justify-center hover:bg-navy-50 dark:hover:bg-navy-700/50 active:bg-navy-100 dark:active:bg-navy-600 transition-colors cursor-pointer outline-none text-navy-600 dark:text-navy-300">
                                <Icon name="Backspace" className="w-7 h-7" />
                            </button>
                        </div>

                        {/* Go Button */}
                        <button onClick={handleGo} className="w-full bg-[#4A7045] hover:bg-[#3A5836] dark:bg-navy-900 dark:hover:bg-navy-950 text-white py-4 md:py-6 font-black text-xl tracking-widest uppercase transition-colors shrink-0 cursor-pointer outline-none shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
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
                            <div className="bg-navy-900 text-white px-4 sm:px-5 py-3 rounded-2xl flex items-center justify-between shadow-md">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    {Boolean(returnTab) ? (
                                        <button
                                            onClick={handleReturnNavigation}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-gold-400 hover:from-amber-300 hover:to-gold-300 text-navy-950 font-black active:scale-95 transition-all text-xs cursor-pointer shadow-sm group"
                                            title={`Kembali ke ${returnTab === 'admin_dashboard' ? 'Admin Dashboard' : 'Susunan Ibadah'}`}
                                        >
                                            <Icon name="ArrowLeft" className="w-4 h-4 stroke-[3] group-hover:-translate-x-0.5 transition-transform" />
                                            <span>{returnTab === 'admin_dashboard' ? 'Admin' : 'Susunan Ibadah'}</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setSubTab('numpad')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-gold-500 hover:text-navy-950 text-gold-400 active:scale-95 transition-all text-xs font-bold cursor-pointer group"
                                            title="Kembali ke Numpad (Pilih Lagu)"
                                        >
                                            <Icon name="ArrowLeft" className="w-4 h-4 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
                                            <span>Numpad</span>
                                        </button>
                                    )}
                                    <span className="font-black text-base sm:text-lg text-gold-400 truncate">
                                        Lagu Sion No. {selectedSong.number}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => handlePrevNext(-1)}
                                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors text-white"
                                        title="Lagu Sebelumnya"
                                    >
                                        <Icon name="ChevronLeft" className="w-5 h-5 stroke-2" />
                                    </button>
                                    <button
                                        onClick={() => handlePrevNext(1)}
                                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors text-white"
                                        title="Lagu Berikutnya"
                                    >
                                        <Icon name="ChevronRight" className="w-5 h-5 stroke-2" />
                                    </button>
                                </div>
                            </div>

                            {/* Gold Song Title block */}
                            <div className="bg-gradient-to-r from-[#D19B45] to-[#B8863B] text-white px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl flex items-center justify-between gap-2 sm:gap-3 shadow-md">
                                <div className="flex-1 min-w-0 pr-1">
                                    <h2 className="font-black text-lg sm:text-xl leading-tight truncate">{selectedSong.title}</h2>
                                    <p className="text-xs text-amber-100/90 font-medium mt-0.5 truncate">
                                        {selectedSong.keyTime} {selectedSong.artist ? `| ${selectedSong.artist}` : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                    {/* Pengatur Ukuran Huruf Lirik (A- / A+) */}
                                    <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-xl p-0.5 sm:p-1 border border-white/20" title="Ukuran Huruf Lirik Lagu">
                                        <button
                                            type="button"
                                            onClick={() => updateLyricFontSize(lyricFontSize - 2)}
                                            disabled={lyricFontSize <= 14}
                                            className="px-1.5 sm:px-2 py-1 rounded-lg font-black text-xs text-white hover:bg-white/20 disabled:opacity-35 transition cursor-pointer"
                                            title="Perkecil Lirik (A-)"
                                        >
                                            A-
                                        </button>
                                        <span className="px-1 text-[10px] font-bold text-amber-100 select-none">{lyricFontSize}px</span>
                                        <button
                                            type="button"
                                            onClick={() => updateLyricFontSize(lyricFontSize + 2)}
                                            disabled={lyricFontSize >= 36}
                                            className="px-1.5 sm:px-2 py-1 rounded-lg font-black text-xs text-white hover:bg-white/20 disabled:opacity-35 transition cursor-pointer"
                                            title="Perbesar Lirik (A+)"
                                        >
                                            A+
                                        </button>
                                    </div>

                                    {/* Tombol Simpan ke Favorit */}
                                    <button
                                        type="button"
                                        onClick={() => toggleFavoriteSong(selectedSong.number)}
                                        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-colors relative shrink-0 cursor-pointer ${favoriteSongNos.includes(selectedSong.number)
                                                ? 'bg-amber-300 text-navy-950 shadow-md ring-2 ring-white/50'
                                                : 'bg-white/15 hover:bg-white/25 active:bg-white/35 text-white'
                                            }`}
                                        title={favoriteSongNos.includes(selectedSong.number) ? "Hapus dari Favorit" : "Simpan ke Lagu Favorit"}
                                    >
                                        <Icon name="Star" className={`w-4 h-4 sm:w-5 sm:h-5 ${favoriteSongNos.includes(selectedSong.number) ? 'fill-current' : ''}`} />
                                    </button>

                                    {/* Tombol Pitch Pipe (Pembidik Nada Dasar) */}
                                    <button
                                        type="button"
                                        onClick={() => setPitchPipeOpen(prev => !prev)}
                                        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-colors relative shrink-0 cursor-pointer ${pitchPipeOpen
                                                ? 'bg-white text-navy-950 shadow-md ring-2 ring-gold-300'
                                                : 'bg-white/15 hover:bg-white/25 active:bg-white/35 text-white'
                                            }`}
                                        title="Buka Pembidik Nada Dasar (Pitch Pipe)"
                                    >
                                        <span className="text-sm sm:text-base select-none">🎵</span>
                                    </button>

                                    {/* Tombol Tampilan Penuh (Fullscreen) */}
                                    <button
                                        type="button"
                                        onClick={toggleFullscreen}
                                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 transition-colors relative shrink-0 cursor-pointer text-white"
                                        title="Tampilan Penuh (Layar Penuh)"
                                    >
                                        <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>

                                    <button onClick={handleShare} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 transition-colors relative shrink-0 cursor-pointer" title="Bagikan Lirik Lagu">
                                        <Icon name="Share" className="w-4 h-4 sm:w-5 sm:h-5" />
                                        {copied && (
                                            <span className="absolute -top-9 right-0 bg-navy-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap animate-fade-in">
                                                Disalin!
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Panel Pembidik Nada Dasar (Pitch Pipe) */}
                            {pitchPipeOpen && (
                                <div className="bg-navy-950/95 dark:bg-navy-900 border-2 border-gold-400/80 rounded-2xl p-3.5 shadow-xl animate-scale-up space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-base">🎵</span>
                                            <div>
                                                <h4 className="text-xs font-black text-gold-400 uppercase tracking-wider">Pembidik Nada Dasar (Pitch Pipe)</h4>
                                                <p className="text-[10px] text-gray-300">Klik nada untuk membunyikan Do / Acuan Nada</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPitchPipeOpen(false)}
                                            className="text-gray-400 hover:text-white p-1 rounded-lg text-xs"
                                            title="Tutup Pitch Pipe"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                                        {PITCH_NOTES.map(p => {
                                            const isPlaying = activePlayingNote === p.note;
                                            return (
                                                <button
                                                    key={p.note}
                                                    type="button"
                                                    onClick={() => playPitch(p.freq, p.note)}
                                                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center active:scale-95 ${isPlaying
                                                            ? 'bg-gold-500 text-navy-950 shadow-lg scale-105 ring-2 ring-white'
                                                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                                        }`}
                                                    title={`Bunyikan nada ${p.label} (${p.freq} Hz)`}
                                                >
                                                    <span className="text-sm font-black">{p.note}</span>
                                                    <span className="text-[9px] opacity-75 font-medium">{p.label.split(' ')[1] || ''}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Lyrics sheet card */}
                            <div className="bg-white dark:bg-navy-900 rounded-3xl border border-navy-100/50 dark:border-navy-800 p-6 md:p-8 shadow-sm space-y-6 select-text">
                                {(() => {
                                    let result = [];
                                    let chorusRef = null;
                                    const verses = selectedSong.verses || [];

                                    for (let i = 0; i < verses.length; i++) {
                                        const v = verses[i];
                                        result.push(v);
                                        if (v.type === 'chorus') chorusRef = v;

                                        if ((v.type === 'verse' || v.type === 'bait') && chorusRef) {
                                            const nextV = verses[i + 1];
                                            if (!nextV || nextV.type !== 'chorus') {
                                                result.push({ ...chorusRef, isAuto: true });
                                            }
                                        }
                                    }

                                    return result.map((verse, idx) => {
                                        const isCh = verse.type === 'chorus';
                                        return (
                                            <div key={idx} className={`space-y-2 ${isCh ? 'pl-4 border-l-4 border-[#D19B45] bg-[#D19B45]/10 py-2 pr-2 rounded-r-lg' : ''} ${verse.isAuto ? 'opacity-90' : ''}`}>
                                                <div className={`text-xs font-black uppercase tracking-wider ${isCh ? 'text-[#D19B45]' : 'text-navy-400 dark:text-navy-400'}`}>
                                                    {isCh && (!verse.label || verse.label.toLowerCase() === 'koor') ? 'Reff' : verse.label} {verse.isAuto && <span className="text-[10px] ml-1 opacity-60 normal-case font-normal">(otomatis)</span>}
                                                </div>
                                                <div
                                                    className={`leading-relaxed font-medium transition-all ${isCh ? 'italic text-navy-800 dark:text-gold-200' : 'text-navy-900 dark:text-navy-100'}`}
                                                    style={{ fontSize: `${lyricFontSize}px` }}
                                                >
                                                    {verse.lines.map((line, lIdx) => (
                                                        <p key={lIdx} className="mb-1">{line}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            {/* Action Buttons below lyrics */}
                            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                                {Boolean(returnTab) && (
                                    <button
                                        onClick={handleReturnNavigation}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-gold-400 hover:from-amber-300 hover:to-gold-300 text-navy-950 font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95"
                                        title={`Kembali ke ${returnTab === 'admin_dashboard' ? 'Admin Dashboard' : 'Susunan Ibadah'}`}
                                    >
                                        <Icon name="ArrowLeft" className="w-4 h-4 stroke-[3]" />
                                        <span>Kembali ke {returnTab === 'admin_dashboard' ? 'Admin' : 'Susunan Ibadah'}</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setSubTab('numpad')}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-800 dark:text-navy-100 font-bold text-xs uppercase tracking-wider transition-all border border-navy-100 dark:border-navy-700 shadow-sm cursor-pointer active:scale-95 group"
                                >
                                    <Icon name="Grid" className="w-4 h-4 text-gold-500 group-hover:text-navy-950" />
                                    <span>Kembali ke Numpad</span>
                                </button>
                                <button
                                    onClick={() => setSubTab('index')}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-800 dark:text-navy-100 font-bold text-xs uppercase tracking-wider transition-all border border-navy-100 dark:border-navy-700 shadow-sm cursor-pointer active:scale-95 group"
                                >
                                    <Icon name="List" className="w-4 h-4 text-gold-500 group-hover:text-navy-950" />
                                    <span>Daftar Lagu</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleFullscreen}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95"
                                    title="Tampilan Layar Penuh (Fullscreen)"
                                >
                                    <Maximize className="w-4 h-4 stroke-[2.5]" />
                                    <span>Tampilan Penuh</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-3xl border border-navy-100/50 p-10 shadow-sm flex flex-col items-center justify-center text-center opacity-70">
                            <Icon name="BookOpen" className="w-14 h-14 text-navy-300 mb-4 animate-pulse" />
                            <h3 className="font-black text-navy-800 uppercase tracking-widest text-sm mb-2">Belum ada lirik aktif</h3>
                            <p className="text-xs text-navy-500 max-w-xs leading-relaxed">Ketik nomor lagu di Numpad atau cari judul/lirik di kotak pencarian di atas.</p>
                            <button onClick={() => setSubTab('numpad')} className="mt-5 px-6 py-3 bg-gradient-to-r from-[#D19B45] to-[#B8863B] hover:from-[#c58f3c] hover:to-[#a97831] text-white text-xs font-black rounded-full uppercase tracking-widest shadow-lg shadow-gold-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                                Buka Numpad
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Subtab: Favorites (Lagu Favorit) */}
            {subTab === 'favorites' && (
                <div className="max-w-xl mx-auto space-y-4 px-4">
                    <div className="bg-white dark:bg-navy-850 rounded-2xl border border-navy-100/50 dark:border-navy-700 px-4 py-3 flex items-center justify-between shadow-sm">
                        <button
                            onClick={() => setSubTab('numpad')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-50 hover:bg-gold-500 hover:text-navy-950 text-navy-700 dark:text-navy-200 dark:bg-navy-800 font-bold text-xs transition-all cursor-pointer group"
                            title="Kembali ke Numpad"
                        >
                            <Icon name="ArrowLeft" className="w-4 h-4 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
                            <span>Numpad</span>
                        </button>
                        <div className="flex items-center gap-1.5 text-xs font-black text-navy-800 dark:text-gold-400">
                            <Icon name="Star" className="w-4 h-4 fill-current text-gold-500" />
                            <span>Koleksi Favorit ({favoriteSongs.length} Lagu)</span>
                        </div>
                    </div>

                    {favoriteSongs.length === 0 ? (
                        <div className="bg-white dark:bg-navy-850 rounded-3xl border border-navy-100/50 dark:border-navy-700 p-8 sm:p-10 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-gold-500 mb-3">
                                <Icon name="Star" className="w-8 h-8" />
                            </div>
                            <h3 className="font-black text-navy-900 dark:text-white uppercase tracking-wider text-sm mb-1">
                                Belum Ada Lagu Favorit
                            </h3>
                            <p className="text-xs text-navy-500 dark:text-gray-400 max-w-xs leading-relaxed mb-5">
                                Tandai lagu favorit Anda dengan menekan ikon bintang ⭐ pada daftar lagu atau halaman lirik untuk akses cepat sewaktu-waktu.
                            </p>
                            <button
                                onClick={() => setSubTab('index')}
                                className="px-5 py-2.5 bg-gradient-to-r from-[#D19B45] to-[#B8863B] hover:from-[#c58f3c] hover:to-[#a97831] text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-md transition active:scale-95 cursor-pointer"
                            >
                                Jelajahi Daftar Lagu
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-navy-850 rounded-3xl border border-navy-100/50 dark:border-navy-700 overflow-hidden shadow-sm divide-y divide-navy-50 dark:divide-navy-800">
                            {favoriteSongs.map((song) => (
                                <div
                                    key={song.number}
                                    className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-gold-50/40 dark:hover:bg-navy-800/60 transition-colors group"
                                >
                                    <div
                                        onClick={() => {
                                            setSelectedSong(song);
                                            setSubTab('lyrics');
                                        }}
                                        className="flex items-center min-w-0 flex-1 cursor-pointer pr-2"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 to-amber-500/10 border border-gold-500/30 flex items-center justify-center text-gold-700 dark:text-gold-400 mr-3 shrink-0 font-black text-sm">
                                            {song.number}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-navy-900 dark:text-white truncate group-hover:text-gold-500 transition-colors">
                                                {song.title}
                                            </div>
                                            <div className="text-xs text-navy-500 dark:text-gray-400 truncate">
                                                {song.keyTime} {song.artist ? `| ${song.artist}` : ''}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedSong(song);
                                                setSubTab('lyrics');
                                            }}
                                            className="px-2.5 py-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500 text-gold-700 hover:text-navy-950 dark:text-gold-300 font-bold text-xs transition cursor-pointer"
                                            title="Buka Lirik"
                                        >
                                            Lirik &rarr;
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleFavoriteSong(song.number)}
                                            className="p-2 rounded-lg text-amber-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-navy-800 transition cursor-pointer"
                                            title="Hapus dari Favorit"
                                        >
                                            <Icon name="Star" className="w-4 h-4 fill-current" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Subtab: Index (Daftar) */}
            {subTab === 'index' && (
                <div className="max-w-xl mx-auto space-y-4 px-4">
                    <div className="bg-white dark:bg-navy-850 rounded-2xl border border-navy-100/50 dark:border-navy-700 px-4 py-3 flex items-center justify-between shadow-sm">
                        <button
                            onClick={() => setSubTab('numpad')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-50 hover:bg-gold-500 hover:text-navy-950 text-navy-700 dark:text-navy-200 dark:bg-navy-800 font-bold text-xs transition-all cursor-pointer group"
                            title="Kembali ke Numpad"
                        >
                            <Icon name="ArrowLeft" className="w-4 h-4 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
                            <span>Numpad</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-navy-400 uppercase tracking-wide hidden sm:inline">Urutkan:</span>
                            <div className="flex bg-navy-100/60 dark:bg-navy-800 p-0.5 rounded-lg">
                                <button onClick={() => setIndexTab('number')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${indexTab === 'number' ? 'bg-white dark:bg-navy-900 text-navy-900 dark:text-white shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}>
                                    Nomor
                                </button>
                                <button onClick={() => setIndexTab('alphabet')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${indexTab === 'alphabet' ? 'bg-white dark:bg-navy-900 text-navy-900 dark:text-white shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}>
                                    Abjad
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-navy-850 rounded-3xl border border-navy-100/50 dark:border-navy-700 overflow-hidden shadow-sm divide-y divide-navy-50 dark:divide-navy-800">
                        {indexedSongs.map((song) => (
                            <div
                                key={song.number}
                                className="w-full flex items-center p-3.5 sm:p-4 text-left hover:bg-gold-50/50 dark:hover:bg-navy-800/60 transition-colors"
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedSong(song);
                                        setSubTab('lyrics');
                                    }}
                                    className="flex items-center min-w-0 flex-1 text-left cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-800 flex items-center justify-center text-navy-600 dark:text-navy-300 mr-3 sm:mr-4 shrink-0 font-black text-sm">
                                        {song.number}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-navy-800 dark:text-white truncate">{song.title}</div>
                                        <div className="text-xs text-navy-500 dark:text-gray-400 truncate">{song.keyTime} {song.artist ? `| ${song.artist}` : ''}</div>
                                    </div>
                                </button>

                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleFavoriteSong(song.number)}
                                        className="p-2 rounded-lg text-amber-500 hover:bg-gold-100/50 dark:hover:bg-navy-800 transition cursor-pointer"
                                        title={favoriteSongNos.includes(song.number) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                                    >
                                        <Icon name="Star" className={`w-4 h-4 ${favoriteSongNos.includes(song.number) ? 'fill-current' : 'opacity-35 hover:opacity-100'}`} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedSong(song);
                                            setSubTab('lyrics');
                                        }}
                                        className="p-1 text-navy-300 hover:text-navy-600 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                                    >
                                        <Icon name="ChevronRight" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fullscreen Lyrics Overlay (createPortal ke document.body) */}
            {isFullscreen && selectedSong && createPortal(
                <div className="fixed inset-0 z-[999999] bg-[#0c1222] text-slate-100 flex flex-col overflow-hidden select-text animate-fade-in font-sans">
                    {/* Header Bar */}
                    <div className="shrink-0 bg-navy-900/95 backdrop-blur-md border-b border-gold-500/30 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 shadow-lg">
                        {/* Kiri: Nomor & Judul Lagu */}
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <span className="shrink-0 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-gold-400 text-navy-950 font-black text-xs sm:text-sm tracking-wider shadow-sm">
                                LS {selectedSong.number}
                            </span>
                            <div className="min-w-0">
                                <h2 className="font-black text-sm sm:text-base md:text-lg text-white truncate leading-tight">
                                    {selectedSong.title}
                                </h2>
                                <p className="text-[10px] sm:text-xs text-amber-200/80 truncate">
                                    {selectedSong.keyTime} {selectedSong.artist ? `• ${selectedSong.artist}` : ''}
                                </p>
                            </div>
                        </div>

                        {/* Kanan: Kontrol (Ukuran Font, Pitch Pipe, Navigasi Lagu, Keluar) */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            {/* Font Size A- / A+ */}
                            <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/15" title="Ukuran Font Lirik">
                                <button
                                    type="button"
                                    onClick={() => updateLyricFontSize(lyricFontSize - 2)}
                                    disabled={lyricFontSize <= 14}
                                    className="px-2 py-1 rounded-lg font-black text-xs text-white hover:bg-white/20 disabled:opacity-30 transition cursor-pointer"
                                    title="Perkecil Font (A-)"
                                >
                                    A-
                                </button>
                                <span className="px-1.5 text-[11px] font-bold text-amber-200 select-none">
                                    {lyricFontSize}px
                                </span>
                                <button
                                    type="button"
                                    onClick={() => updateLyricFontSize(lyricFontSize + 2)}
                                    disabled={lyricFontSize >= 36}
                                    className="px-2 py-1 rounded-lg font-black text-xs text-white hover:bg-white/20 disabled:opacity-30 transition cursor-pointer"
                                    title="Perbesar Font (A+)"
                                >
                                    A+
                                </button>
                            </div>

                            {/* Tombol Pitch Pipe di Fullscreen */}
                            <button
                                type="button"
                                onClick={() => setPitchPipeOpen(prev => !prev)}
                                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer text-sm ${pitchPipeOpen ? 'bg-amber-400 text-navy-950 font-bold shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                title="Pembidik Nada Dasar (Pitch Pipe)"
                            >
                                🎵
                            </button>

                            {/* Tombol Favorit */}
                            <button
                                type="button"
                                onClick={() => toggleFavoriteSong(selectedSong.number)}
                                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${favoriteSongNos.includes(selectedSong.number) ? 'bg-amber-300 text-navy-950 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                title={favoriteSongNos.includes(selectedSong.number) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                            >
                                <Icon name="Star" className={`w-4 h-4 ${favoriteSongNos.includes(selectedSong.number) ? 'fill-current' : ''}`} />
                            </button>

                            {/* Navigasi Lagu Prev / Next */}
                            <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/15">
                                <button
                                    type="button"
                                    onClick={() => handlePrevNext(-1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 text-white active:scale-95 transition cursor-pointer"
                                    title="Lagu Sebelumnya (←)"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePrevNext(1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 text-white active:scale-95 transition cursor-pointer"
                                    title="Lagu Berikutnya (→)"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Tombol Keluar Layar Penuh */}
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/35 text-red-200 hover:text-white border border-red-400/30 transition-all font-bold text-xs cursor-pointer active:scale-95 ml-1"
                                title="Keluar Tampilan Penuh (ESC)"
                            >
                                <Minimize2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Keluar</span>
                            </button>
                        </div>
                    </div>

                    {/* Panel Pitch Pipe (jika dibuka saat fullscreen) */}
                    {pitchPipeOpen && (
                        <div className="shrink-0 bg-navy-900 border-b border-gold-400/40 p-3 sm:px-6 shadow-md animate-scale-up">
                            <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
                                <span className="text-xs font-bold text-gold-300">🎵 Pembidik Nada Dasar:</span>
                                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
                                    {PITCH_NOTES.map(p => {
                                        const isPlaying = activePlayingNote === p.note;
                                        return (
                                            <button
                                                key={p.note}
                                                type="button"
                                                onClick={() => playPitch(p.freq, p.note)}
                                                className={`py-1 px-2 sm:px-2.5 rounded-lg text-xs font-black transition-all cursor-pointer ${isPlaying ? 'bg-gold-500 text-navy-950 scale-105' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                                title={`Bunyikan nada ${p.label}`}
                                            >
                                                {p.note}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPitchPipeOpen(false)}
                                    className="text-gray-400 hover:text-white p-1 text-xs"
                                    title="Tutup Pitch Pipe"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Area Lirik Scrollable */}
                    <div ref={fullscreenScrollRef} className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 py-8 sm:py-12 scroll-smooth">
                        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
                            {(() => {
                                let result = [];
                                let chorusRef = null;
                                const verses = selectedSong.verses || [];

                                for (let i = 0; i < verses.length; i++) {
                                    const v = verses[i];
                                    result.push(v);
                                    if (v.type === 'chorus') chorusRef = v;

                                    if ((v.type === 'verse' || v.type === 'bait') && chorusRef) {
                                        const nextV = verses[i + 1];
                                        if (!nextV || nextV.type !== 'chorus') {
                                            result.push({ ...chorusRef, isAuto: true });
                                        }
                                    }
                                }

                                return result.map((verse, idx) => {
                                    const isCh = verse.type === 'chorus';
                                    return (
                                        <div key={idx} className={`space-y-2 ${isCh ? 'pl-4 sm:pl-6 border-l-4 border-amber-400 bg-amber-400/10 py-3.5 pr-4 rounded-r-2xl' : ''} ${verse.isAuto ? 'opacity-90' : ''}`}>
                                            <div className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isCh ? 'text-amber-400' : 'text-amber-200/70'}`}>
                                                {isCh && (!verse.label || verse.label.toLowerCase() === 'koor') ? 'Reff' : verse.label} {verse.isAuto && <span className="text-[10px] sm:text-xs ml-1 opacity-60 normal-case font-normal">(otomatis)</span>}
                                            </div>
                                            <div
                                                className={`leading-relaxed font-medium transition-all ${isCh ? 'italic text-amber-100 font-semibold' : 'text-slate-100'}`}
                                                style={{ fontSize: `${lyricFontSize}px` }}
                                            >
                                                {verse.lines.map((line, lIdx) => (
                                                    <p key={lIdx} className="mb-1.5">{line}</p>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* Bottom Status / Navigation Bar */}
                    <div className="shrink-0 bg-navy-900/90 border-t border-white/10 px-4 py-2.5 flex items-center justify-between text-xs text-gray-400 select-none">
                        <button
                            type="button"
                            onClick={() => handlePrevNext(-1)}
                            className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold cursor-pointer active:scale-95 transition"
                        >
                            <ChevronLeft className="w-4 h-4" /> Lagu Sebelumnya
                        </button>
                        <span className="hidden md:inline text-[11px] text-gray-400">
                            Gunakan panah keyboard (← / →) untuk ganti lagu • ESC untuk keluar
                        </span>
                        <button
                            type="button"
                            onClick={() => handlePrevNext(1)}
                            className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold cursor-pointer active:scale-95 transition"
                        >
                            Lagu Berikutnya <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
};

export default LaguSion;
