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
import { saveUserStudySync, loadUserStudySync } from '../../utils/supabasePortalAdapter';

export const HIGHLIGHT_PALETTE = {
    gold: {
        id: 'gold',
        label: 'Kuning Emas',
        dotClass: 'bg-amber-400 border-amber-200 ring-amber-400/50',
        verseBg: 'bg-amber-100/85 dark:bg-amber-500/20 border-l-4 border-l-amber-500 border border-amber-200/80 dark:border-amber-500/35 shadow-2xs',
        badgeBg: 'bg-amber-500 text-white',
        chipBg: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300'
    },
    emerald: {
        id: 'emerald',
        label: 'Hijau Zamrud',
        dotClass: 'bg-emerald-400 border-emerald-200 ring-emerald-400/50',
        verseBg: 'bg-emerald-100/85 dark:bg-emerald-500/20 border-l-4 border-l-emerald-500 border border-emerald-200/80 dark:border-emerald-500/35 shadow-2xs',
        badgeBg: 'bg-emerald-600 text-white',
        chipBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300'
    },
    sky: {
        id: 'sky',
        label: 'Biru Langit',
        dotClass: 'bg-sky-400 border-sky-200 ring-sky-400/50',
        verseBg: 'bg-sky-100/85 dark:bg-sky-500/20 border-l-4 border-l-sky-500 border border-sky-200/80 dark:border-sky-500/35 shadow-2xs',
        badgeBg: 'bg-sky-600 text-white',
        chipBg: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border-sky-300'
    },
    rose: {
        id: 'rose',
        label: 'Merah Muda',
        dotClass: 'bg-rose-400 border-rose-200 ring-rose-400/50',
        verseBg: 'bg-rose-100/85 dark:bg-rose-500/20 border-l-4 border-l-rose-500 border border-rose-200/80 dark:border-rose-500/35 shadow-2xs',
        badgeBg: 'bg-rose-600 text-white',
        chipBg: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-300'
    }
};
export const BIBLE_YEAR_365_PLAN = (() => {
    const allChapters = [];
    ALKITAB_BOOKS.forEach(b => {
        for (let ch = 1; ch <= b.pasal; ch++) {
            allChapters.push({ bookId: b.id, bookName: b.nama, singkat: b.singkat, chapter: ch });
        }
    });
    const total = allChapters.length; // 1189 pasal
    const plan = [];
    let dayCounter = 0;

    for (let m = 0; m < 12; m++) {
        const daysInMonth = BIBLE_YEAR_MONTH_DAYS[m];
        for (let d = 1; d <= daysInMonth; d++) {
            dayCounter++;
            const startIdx = Math.floor(((dayCounter - 1) * total) / 365);
            const endIdx = Math.floor((dayCounter * total) / 365) - 1;
            const dayChaps = allChapters.slice(startIdx, Math.max(startIdx + 1, endIdx + 1));
            const first = dayChaps[0];
            const last = dayChaps[dayChaps.length - 1];
            let label = '';
            if (first.bookId === last.bookId) {
                label = first.chapter === last.chapter
                    ? `${first.bookName} ${first.chapter}`
                    : `${first.bookName} ${first.chapter}–${last.chapter}`;
            } else {
                label = `${first.bookName} ${first.chapter} – ${last.bookName} ${last.chapter}`;
            }
            plan.push({
                day: dayCounter,
                month: m + 1,
                dayOfMonth: d,
                dateLabel: `${d} ${BIBLE_YEAR_MONTH_NAMES[m]}`,
                label,
                chapters: dayChaps
            });
        }
    }
    return plan;
})();

export const getCurrentDayOfYear365 = () => {
    const now = new Date();
    const m = now.getMonth();
    const d = Math.min(now.getDate(), BIBLE_YEAR_MONTH_DAYS[m]);
    let dayNum = d;
    for (let i = 0; i < m; i++) dayNum += BIBLE_YEAR_MONTH_DAYS[i];
    return Math.max(1, Math.min(365, dayNum));
};

export const Alkitab = ({ setActiveTab, setHideGlobalBack }) => {
    const [selectedBook, setSelectedBook] = React.useState(null);
    const [selectedChapter, setSelectedChapter] = React.useState(null);
    const [returnTab, setReturnTab] = React.useState(() => {
        try {
            return window.__alkitabReturnTab || localStorage.getItem('alkitabReturnTab') || null;
        } catch (e) {
            return null;
        }
    });

    const handleBackNavigation = () => {
        const dest = returnTab || window.__alkitabReturnTab || localStorage.getItem('alkitabReturnTab');
        if (dest) {
            setReturnTab(null);
            window.__alkitabReturnTab = null;
            try {
                localStorage.removeItem('alkitabReturnTab');
            } catch (e) { }
            if (setActiveTab) {
                setActiveTab(dest);
                return;
            }
        }
        if (selectedBook && selectedChapter) {
            setSelectedChapter(null);
            setSelectedVerses(new Set());
            setSelectedAyat('');
        } else if (selectedBook) {
            setSelectedBook(null);
        } else if (window.history.length > 1) {
            window.history.back();
        } else if (setActiveTab) {
            setActiveTab('home');
        }
    };
    const [verses, setVerses] = React.useState([]);
    const [isLoadingChapter, setIsLoadingChapter] = React.useState(false);
    const [fetchError, setFetchError] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState(null);
    const [isSearching, setIsSearching] = React.useState(false);
    const [alkitabHomeTab, setAlkitabHomeTab] = React.useState('books'); // 'books' | 'saved' | 'bible_year'
    const [savedColorFilter, setSavedColorFilter] = React.useState('all');
    const [highlightsMap, setHighlightsMap] = React.useState(() => {
        try {
            const raw = localStorage.getItem('PISGAH_ALKITAB_HIGHLIGHTS');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    });

    React.useEffect(() => {
        const handleExternalHighlightsUpdate = () => {
            try {
                const raw = localStorage.getItem('PISGAH_ALKITAB_HIGHLIGHTS');
                if (raw) setHighlightsMap(JSON.parse(raw));
            } catch (e) { }
        };
        window.addEventListener('alkitab-highlights-changed', handleExternalHighlightsUpdate);
        window.addEventListener('storage', handleExternalHighlightsUpdate);
        return () => {
            window.removeEventListener('alkitab-highlights-changed', handleExternalHighlightsUpdate);
            window.removeEventListener('storage', handleExternalHighlightsUpdate);
        };
    }, []);
    const [noteModal, setNoteModal] = React.useState(null); // { keys: [], refLabel: '', textPreview: '', initialNote: '', defaultColor: 'gold' }
    const [noteInputText, setNoteInputText] = React.useState('');
    const [cardModalData, setCardModalData] = React.useState({ isOpen: false, reference: '', verseText: '', subtitle: 'SABDA TUHAN • ALKITAB TB', verseUrl: '' });
    const [bibleYearDone, setBibleYearDone] = React.useState(() => {
        try {
            const raw = localStorage.getItem('PISGAH_BIBLE_YEAR_DONE');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    });

    // --- FITUR SINKRONISASI CLOUD JEMAAT (TAHAP 5A: STABILO ALKITAB, RENCANA BACA & SEKOLAH SABAT) ---
    const [isCloudSyncOpen, setIsCloudSyncOpen] = React.useState(false);
    const [cloudSyncCode, setCloudSyncCode] = React.useState(() => {
        try {
            return localStorage.getItem('PISGAH_STUDY_SYNC_CODE') || '';
        } catch (e) {
            return '';
        }
    });
    const [cloudSyncStatus, setCloudSyncStatus] = React.useState({ loading: false, type: '', message: '' });

    React.useEffect(() => {
        const handleExternalBibleYear = () => {
            try {
                const raw = localStorage.getItem('PISGAH_BIBLE_YEAR_DONE');
                if (raw) setBibleYearDone(JSON.parse(raw));
            } catch (e) { }
        };
        window.addEventListener('bible-year-changed', handleExternalBibleYear);
        window.addEventListener('storage', handleExternalBibleYear);
        return () => {
            window.removeEventListener('bible-year-changed', handleExternalBibleYear);
            window.removeEventListener('storage', handleExternalBibleYear);
        };
    }, []);

    const handleCloudSave = async () => {
        const clean = (cloudSyncCode || '').trim();
        if (clean.length < 4) {
            setCloudSyncStatus({ loading: false, type: 'error', message: 'Masukkan minimal 4 karakter (contoh: Nomor HP atau Kode Unik Anda).' });
            return;
        }
        setCloudSyncStatus({ loading: true, type: 'info', message: 'Menyimpan data studi & stabilo ke Cloud Supabase...' });
        try {
            localStorage.setItem('PISGAH_STUDY_SYNC_CODE', clean);
            const ssInlineNotes = JSON.parse(localStorage.getItem('PISGAH_SS_INLINE_NOTES') || '[]');
            const ssReadProgress = JSON.parse(localStorage.getItem('PISGAH_SS_READ_PROGRESS') || '{}');
            await saveUserStudySync(clean, {
                highlightsMap,
                bibleYearDone,
                ssInlineNotes,
                ssReadProgress
            });
            setCloudSyncStatus({
                loading: false,
                type: 'success',
                message: `Berhasil disimpan ke Cloud! (${Object.keys(highlightsMap || {}).length} Stabilo/Catatan Ayat, ${bibleYearDone.length} Hari Bible Year, ${ssInlineNotes.length} Catatan Sekolah Sabat)`
            });
        } catch (err) {
            setCloudSyncStatus({ loading: false, type: 'error', message: err.message || 'Gagal menyimpan ke Cloud.' });
        }
    };

    const handleCloudLoad = async () => {
        const clean = (cloudSyncCode || '').trim();
        if (clean.length < 4) {
            setCloudSyncStatus({ loading: false, type: 'error', message: 'Masukkan minimal 4 karakter Kode Sinkronisasi Anda.' });
            return;
        }
        setCloudSyncStatus({ loading: true, type: 'info', message: 'Mengambil data dari Cloud Supabase...' });
        try {
            localStorage.setItem('PISGAH_STUDY_SYNC_CODE', clean);
            const cloudData = await loadUserStudySync(clean);
            if (!cloudData) {
                setCloudSyncStatus({ loading: false, type: 'error', message: 'Data belum ditemukan untuk kode tersebut. Silakan klik "Simpan ke Cloud" terlebih dahulu.' });
                return;
            }

            // Merge Highlights Map
            const mergedHighlights = { ...highlightsMap, ...(cloudData.highlightsMap || {}) };
            setHighlightsMap(mergedHighlights);
            localStorage.setItem('PISGAH_ALKITAB_HIGHLIGHTS', JSON.stringify(mergedHighlights));
            window.dispatchEvent(new CustomEvent('alkitab-highlights-changed', { detail: mergedHighlights }));

            // Merge Bible Year Done
            const mergedBibleYear = Array.from(new Set([...bibleYearDone, ...(Array.isArray(cloudData.bibleYearDone) ? cloudData.bibleYearDone : [])]));
            setBibleYearDone(mergedBibleYear);
            localStorage.setItem('PISGAH_BIBLE_YEAR_DONE', JSON.stringify(mergedBibleYear));
            window.dispatchEvent(new CustomEvent('bible-year-changed', { detail: mergedBibleYear }));

            // Merge Sabbath School Inline Notes
            if (Array.isArray(cloudData.ssInlineNotes)) {
                const localSSNotes = JSON.parse(localStorage.getItem('PISGAH_SS_INLINE_NOTES') || '[]');
                const noteMap = new Map();
                localSSNotes.forEach(n => { if (n && n.id) noteMap.set(n.id, n); });
                cloudData.ssInlineNotes.forEach(n => { if (n && n.id) noteMap.set(n.id, n); });
                const mergedSSNotes = Array.from(noteMap.values());
                localStorage.setItem('PISGAH_SS_INLINE_NOTES', JSON.stringify(mergedSSNotes));
                window.dispatchEvent(new CustomEvent('ss-inline-notes-changed', { detail: mergedSSNotes }));
            }

            // Merge Sabbath School Read Progress
            if (cloudData.ssReadProgress && typeof cloudData.ssReadProgress === 'object') {
                const localSSProg = JSON.parse(localStorage.getItem('PISGAH_SS_READ_PROGRESS') || '{}');
                const mergedSSProg = { ...localSSProg, ...cloudData.ssReadProgress };
                localStorage.setItem('PISGAH_SS_READ_PROGRESS', JSON.stringify(mergedSSProg));
                window.dispatchEvent(new CustomEvent('ss-read-progress-changed', { detail: mergedSSProg }));
            }

            setCloudSyncStatus({
                loading: false,
                type: 'success',
                message: `Sinkronisasi Berhasil! (${Object.keys(mergedHighlights).length} Stabilo/Catatan Ayat & ${mergedBibleYear.length} Hari Rencana Baca aktif)`
            });
        } catch (err) {
            setCloudSyncStatus({ loading: false, type: 'error', message: err.message || 'Gagal memuat dari Cloud.' });
        }
    };
    const [selectedPlanMonth, setSelectedPlanMonth] = React.useState(() => new Date().getMonth() + 1);
    const [planFilterMode, setPlanFilterMode] = React.useState('month'); // 'month' | 'unread' | 'completed'
    const planMonthScrollRef = React.useRef(null);
    const savedFilterScrollRef = React.useRef(null);
    const [isTargetCollapsed, setIsTargetCollapsed] = React.useState(() => {
        try {
            const saved = localStorage.getItem('PISGAH_TARGET_COLLAPSED');
            if (saved !== null) return saved === 'true';
            return typeof window !== 'undefined' ? window.innerWidth < 768 : true;
        } catch (e) {
            return true;
        }
    });
    const toggleTargetCollapse = () => {
        setIsTargetCollapsed(prev => {
            const next = !prev;
            try {
                localStorage.setItem('PISGAH_TARGET_COLLAPSED', String(next));
            } catch (e) { }
            return next;
        });
    };

    const [currentBookChapter, setCurrentBookChapter] = React.useState(() => {
        try {
            const raw = localStorage.getItem('PISGAH_ALKITAB_CURRENT_CHAPTER');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.bookId && parsed.chapter) return parsed;
            }
        } catch (e) { }
        const firstBook = ALKITAB_BOOKS[0];
        return { bookId: firstBook.id, bookName: firstBook.nama, singkat: firstBook.singkat, chapter: 1 };
    });

    const [fontSize, setFontSize] = React.useState(() => {
        try {
            const saved = parseInt(localStorage.getItem('PISGAH_ALKITAB_FONT_SIZE'), 10);
            if (!isNaN(saved) && saved >= 12 && saved <= 28) return saved;
        } catch (e) { }
        return 16;
    });
    const updateFontSize = (newSize) => {
        const clamped = Math.min(28, Math.max(12, newSize));
        setFontSize(clamped);
        try {
            localStorage.setItem('PISGAH_ALKITAB_FONT_SIZE', String(clamped));
        } catch (e) { }
    };
    const [selectedVerses, setSelectedVerses] = React.useState(new Set());
    const [selectedAyat, setSelectedAyat] = React.useState('');
    const [pendingTarget, setPendingTarget] = React.useState(null);

    // --- FITUR AUDIO ALKITAB (TEXT-TO-SPEECH BAHASA INDONESIA) ---
    const ALKITAB_TTS_SPEEDS = [0.8, 0.9, 1, 1.15, 1.2];
    const [ttsState, setTtsState] = React.useState('idle'); // 'idle' | 'playing' | 'paused'
    const [activePlayingAyat, setActivePlayingAyat] = React.useState(null);
    const [ttsRate, setTtsRate] = React.useState(1);

    const ttsStateRef = React.useRef('idle');
    ttsStateRef.current = ttsState;

    const ttsRateRef = React.useRef(1);
    ttsRateRef.current = ttsRate;

    const playlistRef = React.useRef([]);
    const currentIndexRef = React.useRef(0);
    const isStoppedRef = React.useRef(false);

    React.useEffect(() => {
        if (selectedBook) {
            const ch = selectedChapter || 1;
            const nextVal = { bookId: selectedBook.id, bookName: selectedBook.nama, singkat: selectedBook.singkat, chapter: ch };
            setCurrentBookChapter(nextVal);
            try {
                localStorage.setItem('PISGAH_ALKITAB_CURRENT_CHAPTER', JSON.stringify(nextVal));
            } catch (e) { }
        }
    }, [selectedBook, selectedChapter]);

    // Sinkronisasi status floating bar Alkitab ke level global agar mobile bottom nav disembunyikan sepenuhnya
    React.useEffect(() => {
        const isFloatingActive = (selectedVerses.size > 0 && ttsState === 'idle') || ttsState !== 'idle';
        window.dispatchEvent(new CustomEvent('alkitab-bar-state', { detail: { active: isFloatingActive } }));
        if (isFloatingActive) {
            document.body.classList.add('hide-main-nav');
        } else {
            document.body.classList.remove('hide-main-nav');
        }
        return () => {
            window.dispatchEvent(new CustomEvent('alkitab-bar-state', { detail: { active: false } }));
            document.body.classList.remove('hide-main-nav');
        };
    }, [selectedVerses.size, ttsState]);

    const scrollHorizontalBar = (ref, dir) => {
        if (!ref?.current) return;
        ref.current.scrollBy({ left: dir * 180, behavior: 'smooth' });
    };

    React.useEffect(() => {
        if (alkitabHomeTab === 'bible_year' && planMonthScrollRef.current) {
            const activeBtn = planMonthScrollRef.current.querySelector('[data-active-month="true"]');
            if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
                activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [alkitabHomeTab, selectedPlanMonth, planFilterMode]);

    const saveHighlightsToStorage = (nextMap) => {
        setHighlightsMap(nextMap);
        try {
            localStorage.setItem('PISGAH_ALKITAB_HIGHLIGHTS', JSON.stringify(nextMap));
        } catch (e) { }
        window.dispatchEvent(new CustomEvent('alkitab-highlights-changed', { detail: nextMap }));
    };

    const handleApplyHighlight = (colorId) => {
        if (!selectedBook || !selectedChapter || selectedVerses.size === 0) return;
        const nextMap = { ...highlightsMap };
        const sortedAyats = Array.from(selectedVerses).sort((a, b) => a - b);
        sortedAyats.forEach(ayatNum => {
            const vObj = verses.find(x => x.ayat === ayatNum);
            if (!vObj) return;
            const key = `${selectedBook.id}_${selectedChapter}_${ayatNum}`;
            const existing = nextMap[key];
            if (colorId === null) {
                delete nextMap[key];
            } else {
                nextMap[key] = {
                    key,
                    bookId: selectedBook.id,
                    bookName: selectedBook.nama,
                    chapter: selectedChapter,
                    ayat: ayatNum,
                    teks: vObj.teks,
                    color: colorId,
                    note: existing?.note || '',
                    updatedAt: Date.now()
                };
            }
        });
        saveHighlightsToStorage(nextMap);
        setSelectedVerses(new Set());
    };

    const handleOpenNoteForSelected = () => {
        if (!selectedBook || !selectedChapter || selectedVerses.size === 0) return;
        const sortedAyats = Array.from(selectedVerses).sort((a, b) => a - b);
        const firstAyat = sortedAyats[0];
        const firstKey = `${selectedBook.id}_${selectedChapter}_${firstAyat}`;
        const existing = highlightsMap[firstKey];
        const vTexts = sortedAyats.map(a => verses.find(x => x.ayat === a)?.teks || '').filter(Boolean);
        const refLabel = `${selectedBook.nama} ${selectedChapter}:${sortedAyats.join(', ')}`;
        setNoteInputText(existing?.note || '');
        setNoteModal({
            ayats: sortedAyats,
            bookId: selectedBook.id,
            bookName: selectedBook.nama,
            chapter: selectedChapter,
            refLabel,
            textPreview: vTexts.join(' '),
            defaultColor: existing?.color || 'gold'
        });
    };

    const handleSaveVerseNote = (e) => {
        if (e) e.preventDefault();
        if (!noteModal) return;
        const nextMap = { ...highlightsMap };
        if (noteModal.singleKey) {
            const existing = nextMap[noteModal.singleKey];
            if (existing) {
                nextMap[noteModal.singleKey] = {
                    ...existing,
                    note: noteInputText.trim(),
                    updatedAt: Date.now()
                };
            }
        } else if (noteModal.ayats && noteModal.ayats.length > 0) {
            noteModal.ayats.forEach(ayatNum => {
                const vObj = verses.find(x => x.ayat === ayatNum);
                if (!vObj) return;
                const key = `${noteModal.bookId}_${noteModal.chapter}_${ayatNum}`;
                const existing = nextMap[key];
                nextMap[key] = {
                    key,
                    bookId: noteModal.bookId,
                    bookName: noteModal.bookName,
                    chapter: noteModal.chapter,
                    ayat: ayatNum,
                    teks: vObj.teks,
                    color: existing?.color || noteModal.defaultColor || 'gold',
                    note: noteInputText.trim(),
                    updatedAt: Date.now()
                };
            });
        }
        saveHighlightsToStorage(nextMap);
        setNoteModal(null);
        setNoteInputText('');
        setSelectedVerses(new Set());
    };

    const handleDeleteSavedHighlight = (key) => {
        const nextMap = { ...highlightsMap };
        delete nextMap[key];
        saveHighlightsToStorage(nextMap);
    };

    const handleOpenCardForSelected = () => {
        if (!selectedBook || !selectedChapter || selectedVerses.size === 0) return;
        const sortedSelected = Array.from(selectedVerses).sort((a, b) => a - b);
        const textParts = [];
        for (const ayat of sortedSelected) {
            const v = verses.find(x => x.ayat === ayat);
            if (v) textParts.push(sortedSelected.length > 1 ? `[${ayat}] ${v.teks}` : v.teks);
        }
        let ranges = [];
        let start = sortedSelected[0];
        let end = start;
        for (let i = 1; i < sortedSelected.length; i++) {
            if (sortedSelected[i] === end + 1) {
                end = sortedSelected[i];
            } else {
                ranges.push(start === end ? `${start}` : `${start}-${end}`);
                start = sortedSelected[i];
                end = start;
            }
        }
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        const ayatString = ranges.join(', ');
        const appUrl = getCleanShareUrl('alkitab', {
            kitab: selectedBook.nama,
            pasal: selectedChapter,
            ayat: ayatString
        });
        setCardModalData({
            isOpen: true,
            reference: `${selectedBook.nama} ${selectedChapter}:${ayatString}`,
            verseText: textParts.join(' '),
            subtitle: 'SABDA TUHAN • ALKITAB TB',
            verseUrl: appUrl
        });
    };

    const toggleBibleYearDay = (dayNum) => {
        setBibleYearDone(prev => {
            const next = prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum];
            try {
                localStorage.setItem('PISGAH_BIBLE_YEAR_DONE', JSON.stringify(next));
            } catch (e) { }
            return next;
        });
    };


    const findIndonesianVoice = () => {
        if (!('speechSynthesis' in window)) return null;
        const voices = window.speechSynthesis.getVoices() || [];
        return (
            voices.find(v => v.lang === 'id-ID' || v.lang === 'id_ID' || v.lang.toLowerCase().startsWith('id')) ||
            voices.find(v => v.name && v.name.toLowerCase().includes('indonesia')) ||
            null
        );
    };

    const stopAudio = React.useCallback(() => {
        isStoppedRef.current = true;
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setTtsState('idle');
        setActivePlayingAyat(null);
    }, []);

    // Hentikan suara otomatis saat ganti kitab atau pasal
    React.useEffect(() => {
        stopAudio();
    }, [selectedBook, selectedChapter, stopAudio]);

    // Bersihkan audio saat komponen di-unmount
    React.useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const speakPlaylistItem = React.useCallback((index) => {
        if (isStoppedRef.current) return;
        const playlist = playlistRef.current;
        if (!playlist || index < 0 || index >= playlist.length) {
            setTtsState('idle');
            setActivePlayingAyat(null);
            return;
        }

        currentIndexRef.current = index;
        const currentItem = playlist[index];
        setActivePlayingAyat(currentItem.ayat || null);

        if (currentItem.ayat) {
            const el = document.getElementById(`ayat-${currentItem.ayat}`);
            if (el) {
                const headerOffset = 180;
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: Math.max(0, offsetPosition),
                    behavior: 'smooth'
                });
            }
        }

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(currentItem.text);
        utterance.lang = 'id-ID';
        utterance.rate = ttsRateRef.current;

        const voice = findIndonesianVoice();
        if (voice) utterance.voice = voice;

        utterance.onend = () => {
            if (isStoppedRef.current) return;
            setTimeout(() => {
                if (!isStoppedRef.current && ttsStateRef.current === 'playing') {
                    speakPlaylistItem(index + 1);
                }
            }, 260);
        };

        utterance.onerror = (e) => {
            if (e.error === 'interrupted' || e.error === 'canceled') return;
            console.warn('Alkitab TTS error:', e);
            if (!isStoppedRef.current && ttsStateRef.current === 'playing') {
                speakPlaylistItem(index + 1);
            }
        };

        window.speechSynthesis.speak(utterance);
        setTtsState('playing');
    }, []);

    const handlePlayChapter = (startFromAyat = 1) => {
        if (!('speechSynthesis' in window)) {
            alert("Browser Anda belum mendukung fitur audio suara Alkitab (Speech Synthesis).");
            return;
        }
        if (!selectedBook || !selectedChapter || verses.length === 0) return;

        isStoppedRef.current = false;
        const items = [];

        items.push({
            ayat: null,
            text: `Kitab ${selectedBook.nama}, pasal ${selectedChapter}.`
        });

        for (const v of verses) {
            if (v.type === 'title') {
                items.push({
                    ayat: null,
                    text: `${v.teks}.`
                });
            } else if (v.type === 'content') {
                items.push({
                    ayat: v.ayat,
                    text: `Ayat ${v.ayat}. ${v.teks}`
                });
            }
        }

        playlistRef.current = items;

        let startIndex = 0;
        if (startFromAyat && startFromAyat > 1) {
            const foundIdx = items.findIndex(it => it.ayat === parseInt(startFromAyat, 10));
            if (foundIdx !== -1) startIndex = foundIdx;
        }

        setTtsState('playing');
        speakPlaylistItem(startIndex);
    };

    const handlePlaySelectedVerses = () => {
        if (!('speechSynthesis' in window)) {
            alert("Browser Anda belum mendukung fitur audio suara Alkitab (Speech Synthesis).");
            return;
        }
        if (selectedVerses.size === 0 || !selectedBook) return;

        isStoppedRef.current = false;
        const sortedAyats = Array.from(selectedVerses).sort((a, b) => a - b);
        const items = [];

        items.push({
            ayat: null,
            text: `Kitab ${selectedBook.nama}, pasal ${selectedChapter}. Membaca ${sortedAyats.length} ayat.`
        });

        for (const aNum of sortedAyats) {
            const v = verses.find(x => x.ayat === aNum);
            if (v) {
                items.push({
                    ayat: aNum,
                    text: `Ayat ${aNum}. ${v.teks}`
                });
            }
        }

        playlistRef.current = items;
        setTtsState('playing');
        speakPlaylistItem(0);
    };

    const handlePlaySingleVerse = (verseObj) => {
        if (!('speechSynthesis' in window)) {
            alert("Browser Anda belum mendukung fitur audio suara Alkitab (Speech Synthesis).");
            return;
        }
        if (!selectedBook || !selectedChapter) return;

        isStoppedRef.current = false;
        const items = [
            {
                ayat: verseObj.ayat,
                text: `${selectedBook.nama} pasal ${selectedChapter} ayat ${verseObj.ayat}. ${verseObj.teks}`
            }
        ];

        playlistRef.current = items;
        setTtsState('playing');
        speakPlaylistItem(0);
    };

    const handleToggleChapterTTS = () => {
        if (!('speechSynthesis' in window)) {
            alert("Browser Anda belum mendukung fitur audio suara Alkitab (Speech Synthesis).");
            return;
        }

        if (ttsState === 'playing') {
            window.speechSynthesis.pause();
            setTtsState('paused');
        } else if (ttsState === 'paused') {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            } else {
                speakPlaylistItem(currentIndexRef.current);
            }
            setTtsState('playing');
        } else {
            const startAyat = selectedAyat ? parseInt(selectedAyat, 10) : 1;
            handlePlayChapter(startAyat);
        }
    };

    const handleNextAudioVerse = () => {
        if (currentIndexRef.current + 1 < playlistRef.current.length) {
            speakPlaylistItem(currentIndexRef.current + 1);
        } else {
            stopAudio();
        }
    };

    const handlePrevAudioVerse = () => {
        if (currentIndexRef.current > 0) {
            speakPlaylistItem(currentIndexRef.current - 1);
        }
    };

    const handleToggleTtsRate = () => {
        setTtsRate(prev => {
            const curIdx = ALKITAB_TTS_SPEEDS.indexOf(prev);
            const next = ALKITAB_TTS_SPEEDS[(curIdx + 1) % ALKITAB_TTS_SPEEDS.length];

            ttsRateRef.current = next;
            if (ttsStateRef.current === 'playing') {
                speakPlaylistItem(currentIndexRef.current);
            }
            return next;
        });
    };

    const handleStopTTS = stopAudio;

    const scrollToVerse = React.useCallback((ayatNum, endAyatNum = null) => {
        if (!ayatNum) return;
        const start = parseInt(ayatNum, 10);
        const end = endAyatNum ? parseInt(endAyatNum, 10) : start;

        // 1. Tandai langsung ke selectedVerses agar React merender ayat dalam status aktif/terpilih (border & badge emas)
        const targetSet = new Set();
        for (let v = start; v <= end; v++) {
            targetSet.add(v);
        }
        setSelectedVerses(targetSet);
        setSelectedAyat(String(start));

        // 2. Lakukan scrolling presisi dan animasi sorotan visual (spotlight)
        let attempts = 0;
        const maxAttempts = 30;

        const tryScroll = () => {
            const el = document.getElementById(`ayat-${start}`);
            if (el) {
                const headerOffset = 135;
                const rect = el.getBoundingClientRect();
                const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
                const targetY = Math.max(0, currentScrollY + rect.top - headerOffset);

                // Langsung posisikan window ke target (instant di awal agar langsung melompat tanpa tertinggal di atas)
                try {
                    window.scrollTo({
                        top: targetY,
                        behavior: attempts < 2 ? 'instant' : 'smooth'
                    });
                } catch (e) {
                    window.scrollTo(0, targetY);
                }

                // Scroll element ke viewport tengah
                try {
                    el.scrollIntoView({
                        behavior: attempts < 2 ? 'auto' : 'smooth',
                        block: 'center'
                    });
                } catch (e) { }

                // Sorot visual ayat dengan bingkai emas dan efek spotlight
                for (let v = start; v <= end; v++) {
                    const vEl = document.getElementById(`ayat-${v}`);
                    if (vEl) {
                        vEl.classList.add('ring-4', 'ring-gold-500', 'scale-[1.01]', 'shadow-xl');
                        setTimeout(() => {
                            try {
                                vEl.classList.remove('ring-4', 'scale-[1.01]', 'shadow-xl');
                            } catch (e) { }
                        }, 3500);
                    }
                }

                // Verifikasi berkala apakah ayat sudah benar-benar berada di area yang terlihat
                if (attempts < 10) {
                    attempts++;
                    setTimeout(() => {
                        const checkEl = document.getElementById(`ayat-${start}`);
                        if (checkEl) {
                            const r = checkEl.getBoundingClientRect();
                            const vh = window.innerHeight || 800;
                            // Jika ayat masih di luar area layar yang terlihat
                            if (r.top < 50 || r.top > vh - 60) {
                                tryScroll();
                            }
                        }
                    }, 150);
                }
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryScroll, 60);
            }
        };

        // Mulai eksekusi scroll
        setTimeout(tryScroll, 50);
    }, []);

    const processDirectTarget = React.useCallback((target) => {
        if (!target) return;
        const targetBookName = (target.bookName || target.kitab || '').trim().toLowerCase();
        const targetBookId = (target.bookId || '').toString().trim().toLowerCase();
        const matchedBook = ALKITAB_BOOKS.find(b => {
            const bName = b.nama.toLowerCase();
            const bSingkat = b.singkat.toLowerCase();
            const bId = String(b.id);
            return (
                (targetBookName && (bName === targetBookName || bSingkat === targetBookName || targetBookName.startsWith(bName) || bName.startsWith(targetBookName))) ||
                (targetBookId && (bId === targetBookId || bSingkat === targetBookId || bName === targetBookId))
            );
        });
        if (!matchedBook) return;

        const chapterNum = parseInt(target.chapter || target.pasal, 10) || 1;
        const rawVerse = String(target.verse || target.ayat || target.rawVerse || '1');
        const startAyat = parseInt(rawVerse.split('-')[0], 10) || 1;
        const endAyat = rawVerse.includes('-') ? (parseInt(rawVerse.split('-')[1], 10) || startAyat) : startAyat;

        setPendingTarget({
            bookId: matchedBook.id,
            chapter: chapterNum,
            startAyat,
            endAyat
        });

        if (target.returnTab) {
            setReturnTab(target.returnTab);
        }

        setSelectedBook(matchedBook);
        setSelectedChapter(chapterNum);
        setSelectedAyat(String(startAyat));
        setAlkitabHomeTab('books');
        setSearchQuery('');
        setSearchResults(null);
    }, []);

    React.useEffect(() => {
        let target = window.__alkitabDirectTarget || null;
        window.__alkitabDirectTarget = null;
        if (!target) {
            const directTargetStr = localStorage.getItem('alkitabDirectTarget');
            if (directTargetStr) {
                try {
                    target = JSON.parse(directTargetStr);
                    localStorage.removeItem('alkitabDirectTarget');
                } catch (e) { }
            }
        }
        if (!target) {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const bookName = searchParams.get('kitab') || searchParams.get('book') || searchParams.get('buku');
                const bookId = searchParams.get('bookId');
                const chapter = searchParams.get('pasal') || searchParams.get('chapter');
                const verse = searchParams.get('ayat') || searchParams.get('verse');
                if (bookName || bookId) {
                    target = {
                        bookName: bookName || '',
                        bookId: bookId || '',
                        chapter: chapter || 1,
                        verse: verse || 1
                    };
                }
            } catch (e) { }
        }
        if (target) {
            if (target.returnTab) setReturnTab(target.returnTab);
            processDirectTarget(target);
        }

        const handleDirectTargetEvent = (e) => {
            if (e.detail) {
                if (e.detail.returnTab) setReturnTab(e.detail.returnTab);
                processDirectTarget(e.detail);
            }
        };

        window.addEventListener('alkitab-direct-target', handleDirectTargetEvent);
        return () => {
            window.removeEventListener('alkitab-direct-target', handleDirectTargetEvent);
        };
    }, [processDirectTarget]);

    React.useEffect(() => {
        if (setHideGlobalBack) setHideGlobalBack(true);
        return () => { if (setHideGlobalBack) setHideGlobalBack(false); };
    }, [setHideGlobalBack]);

    const pl = ALKITAB_BOOKS.filter(b => b.testamen === 'PL');
    const pb = ALKITAB_BOOKS.filter(b => b.testamen === 'PB');

    const loadChapter = React.useCallback(async (bookId, chapter) => {
        setIsLoadingChapter(true);
        setFetchError(null);
        setVerses([]);
        setSelectedAyat('');
        try {
            // Load the entire book from our local static API cache
            const res = await fetch(import.meta.env.BASE_URL + `alkitab/${bookId}.json`);
            if (!res.ok) throw new Error('Data kitab belum tersedia');
            const bookData = await res.json();
            const chapterData = bookData[chapter];
            if (!chapterData) throw new Error('Pasal tidak ditemukan');

            // Deduplicate verses (Sabda API sometimes prepends duplicate verse fragments)
            const dedupedVerses = [];
            const seenVerses = new Set();
            const seenTitles = new Set();
            for (let i = chapterData.length - 1; i >= 0; i--) {
                const v = chapterData[i];
                if (v.type === 'title') {
                    if (!seenTitles.has(v.teks)) {
                        seenTitles.add(v.teks);
                        dedupedVerses.push(v);
                    }
                } else {
                    if (!seenVerses.has(v.ayat)) {
                        seenVerses.add(v.ayat);
                        dedupedVerses.push(v);
                    }
                }
            }
            dedupedVerses.reverse();

            setVerses(dedupedVerses);
            setSelectedVerses(new Set());
            setSelectedAyat('');
        } catch (err) {
            setFetchError('Kitab ini belum tersimpan di memori offline. Sambungkan internet sekali agar otomatis tersimpan.');
        }
        setIsLoadingChapter(false);
    }, []);

    const doSearch = React.useCallback(async (query) => {
        setIsSearching(true);
        try {
            const res = await fetch(`https://bolls.life/search/TB/?search=${encodeURIComponent(query)}&match_case=false&match_whole=false`);
            const data = await res.json();
            const lowerQuery = query.trim().toLowerCase();
            const filteredData = data.filter(item => {
                const cleanText = item.text.replace(/<[^>]+>/g, '').toLowerCase();
                return cleanText.includes(lowerQuery);
            });
            setSearchResults(filteredData);
        } catch (err) {
            console.error(err);
            setSearchResults([]);
        }
        setIsSearching(false);
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults(null);
            return;
        }
        doSearch(searchQuery);
    };

    React.useEffect(() => {
        const initialSearch = localStorage.getItem('alkitabInitialSearch');
        if (initialSearch) {
            setSearchQuery(initialSearch);
            localStorage.removeItem('alkitabInitialSearch');
            doSearch(initialSearch);
        }
    }, [doSearch]);

    React.useEffect(() => {
        if (selectedBook && selectedChapter) {
            loadChapter(selectedBook.id, selectedChapter);
            setSelectedVerses(new Set());
            try {
                const origin = window.location.origin;
                const ayatParam = selectedAyat ? `&ayat=${selectedAyat}` : '';
                const newUrl = `${origin}/?tab=alkitab&kitab=${encodeURIComponent(selectedBook.nama)}&pasal=${selectedChapter}${ayatParam}`;
                window.history.replaceState(window.history.state, '', newUrl);
            } catch (e) { }
        }
    }, [selectedBook, selectedChapter, loadChapter]);

    React.useEffect(() => {
        if (!isLoadingChapter && verses.length > 0 && pendingTarget) {
            if (selectedBook?.id === pendingTarget.bookId && selectedChapter === pendingTarget.chapter) {
                const { startAyat, endAyat } = pendingTarget;
                setPendingTarget(null);
                const targetSet = new Set();
                for (let v = startAyat; v <= endAyat; v++) {
                    targetSet.add(v);
                }
                setSelectedVerses(targetSet);
                setSelectedAyat(String(startAyat));
                scrollToVerse(startAyat, endAyat);
            }
        }
    }, [verses, isLoadingChapter, pendingTarget, selectedBook, selectedChapter, scrollToVerse]);

    const toggleVerse = (ayatNum) => {
        const newSet = new Set(selectedVerses);
        if (newSet.has(ayatNum)) {
            newSet.delete(ayatNum);
        } else {
            newSet.add(ayatNum);
        }
        setSelectedVerses(newSet);
    };

    const handleShareVerses = () => {
        if (selectedVerses.size === 0) return;
        const sortedSelected = Array.from(selectedVerses).sort((a, b) => a - b);
        let textParts = [];
        for (const ayat of sortedSelected) {
            const v = verses.find(x => x.ayat === ayat);
            if (v) textParts.push(`[${ayat}] ${v.teks}`);
        }

        let ranges = [];
        let start = sortedSelected[0];
        let end = start;
        for (let i = 1; i < sortedSelected.length; i++) {
            if (sortedSelected[i] === end + 1) {
                end = sortedSelected[i];
            } else {
                ranges.push(start === end ? `${start}` : `${start}-${end}`);
                start = sortedSelected[i];
                end = start;
            }
        }
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        const ayatString = ranges.join(', ');

        const appUrl = getCleanShareUrl('alkitab', {
            kitab: selectedBook.nama,
            pasal: selectedChapter,
            ayat: ayatString
        });
        const shareText = `${selectedBook.nama} ${selectedChapter}:${ayatString}\n\n${textParts.join('\n')}\n\nBaca selengkapnya di: ${appUrl}`;

        const fallbackCopy = (text) => {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => {
                    alert('Ayat berhasil disalin ke clipboard!');
                }).catch(err => console.error('Copy failed', err));
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    alert('Ayat berhasil disalin ke clipboard!');
                } catch (err) { }
                textArea.remove();
            }
        };

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (navigator.share && isMobile) {
            navigator.share({ text: shareText }).catch(() => fallbackCopy(shareText));
        } else {
            fallbackCopy(shareText);
        }
        setSelectedVerses(new Set());
    };

    const prevChapterInfo = React.useMemo(() => {
        if (!selectedBook || !selectedChapter) return null;
        if (selectedChapter > 1) {
            return { book: selectedBook, chapter: selectedChapter - 1 };
        }
        const bookIndex = ALKITAB_BOOKS.findIndex(b => b.id === selectedBook.id);
        if (bookIndex > 0) {
            const prevBook = ALKITAB_BOOKS[bookIndex - 1];
            return { book: prevBook, chapter: prevBook.pasal };
        }
        return null;
    }, [selectedBook, selectedChapter]);

    const nextChapterInfo = React.useMemo(() => {
        if (!selectedBook || !selectedChapter) return null;
        if (selectedChapter < selectedBook.pasal) {
            return { book: selectedBook, chapter: selectedChapter + 1 };
        }
        const bookIndex = ALKITAB_BOOKS.findIndex(b => b.id === selectedBook.id);
        if (bookIndex < ALKITAB_BOOKS.length - 1) {
            const nextBook = ALKITAB_BOOKS[bookIndex + 1];
            return { book: nextBook, chapter: 1 };
        }
        return null;
    }, [selectedBook, selectedChapter]);

    const filterBooks = (books) => books.filter(b => b.nama.toLowerCase().includes(searchQuery.toLowerCase()));

    const renderBookList = (books, title) => {
        const filtered = filterBooks(books);
        if (filtered.length === 0) return null;
        return (
            <div className="mb-6">
                <h3 className="text-sm font-black text-gold-600 uppercase tracking-widest mb-3 px-2">{title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {filtered.map((b) => (
                        <button
                            key={b.id}
                            onClick={() => { setSelectedBook(b); setSelectedChapter(null); setVerses([]); }}
                            className="bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700 p-3 rounded-xl hover:bg-gold-50 dark:hover:bg-navy-700 hover:border-gold-200 transition-colors text-left shadow-sm"
                        >
                            <span className="font-bold text-navy-900 dark:text-navy-100 text-sm">{b.nama}</span>
                            <span className="block text-xs text-navy-400 mt-0.5">{b.pasal} pasal</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderDropdowns = () => {
        const activeBookObj = selectedBook || ALKITAB_BOOKS.find(b => b.id === currentBookChapter?.bookId) || null;
        const activeChapterVal = selectedBook ? (selectedChapter || '') : (currentBookChapter?.chapter || '');
        return (
            <div className="flex-1 min-w-0 w-full flex flex-row items-center gap-1 sm:gap-2 bg-white dark:bg-navy-900 px-1 sm:px-2.5 py-1 sm:py-1.5 rounded-2xl shadow-sm border border-navy-100 dark:border-navy-800 overflow-hidden">
                {/* KITAB */}
                <div className="flex-1 min-w-[60px] sm:min-w-[100px] overflow-hidden">
                    <label className="text-[7.5px] sm:text-[9px] font-black text-navy-400 dark:text-navy-500 uppercase tracking-widest mb-0.5 block px-0.5 sm:px-1 truncate">Kitab</label>
                    <select
                        value={activeBookObj?.id || ''}
                        onChange={(e) => {
                            const newBook = ALKITAB_BOOKS.find(b => b.id === parseInt(e.target.value));
                            if (newBook) {
                                setSelectedBook(newBook);
                                setSelectedChapter(1);
                                setSelectedAyat('');
                            }
                        }}
                        className="w-full bg-navy-50 dark:bg-navy-800 border-none rounded-xl px-1 sm:px-2 py-1 text-navy-900 dark:text-white font-bold text-xs sm:text-sm focus:ring-2 focus:ring-gold-400 outline-none cursor-pointer truncate"
                    >
                        <option value="" disabled>Pilih Kitab...</option>
                        {ALKITAB_BOOKS.map(b => (
                            <option key={b.id} value={b.id}>{b.nama}</option>
                        ))}
                    </select>
                </div>

                {/* PASAL */}
                <div className="w-10 sm:w-16 shrink-0">
                    <label className="text-[7.5px] sm:text-[9px] font-black text-navy-400 dark:text-navy-500 uppercase tracking-widest mb-0.5 block px-0.5 sm:px-1 truncate text-center sm:text-left">Pasal</label>
                    <select
                        value={activeChapterVal}
                        onChange={(e) => {
                            const chNum = parseInt(e.target.value);
                            if (!selectedBook && activeBookObj) {
                                setSelectedBook(activeBookObj);
                            }
                            setSelectedChapter(chNum);
                            setSelectedAyat('');
                        }}
                        disabled={!activeBookObj}
                        className="w-full bg-navy-50 dark:bg-navy-800 border-none rounded-xl px-0.5 sm:px-2 py-1 text-navy-900 dark:text-white font-bold text-xs sm:text-sm focus:ring-2 focus:ring-gold-400 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    >
                        <option value="" disabled>--</option>
                        {activeBookObj && Array.from({ length: activeBookObj.pasal }, (_, i) => i + 1).map(ch => (
                            <option key={ch} value={ch}>{ch}</option>
                        ))}
                    </select>
                </div>

                {/* AYAT */}
                <div className="w-10 sm:w-16 shrink-0">
                    <label className="text-[7.5px] sm:text-[9px] font-black text-navy-400 dark:text-navy-500 uppercase tracking-widest mb-0.5 block px-0.5 sm:px-1 truncate text-center sm:text-left">Ayat</label>
                    <select
                        value={selectedAyat || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val) scrollToVerse(val);
                        }}
                        disabled={!selectedChapter || verses.length === 0}
                        className="w-full bg-navy-50 dark:bg-navy-800 border-none rounded-xl px-0.5 sm:px-2 py-1 text-navy-900 dark:text-white font-bold text-xs sm:text-sm focus:ring-2 focus:ring-gold-400 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    >
                        <option value="">--</option>
                        {verses.filter(v => v.type === 'content').map(v => (
                            <option key={`opt-${v.ayat}`} value={v.ayat}>{v.ayat}</option>
                        ))}
                    </select>
                </div>
            </div>
        );
    };

    const savedHighlightsList = React.useMemo(() => {
        return Object.values(highlightsMap || {}).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }, [highlightsMap]);

    const filteredSavedHighlights = React.useMemo(() => {
        return savedHighlightsList.filter(item => {
            if (savedColorFilter === 'all') return true;
            if (savedColorFilter === 'notes') return Boolean(item.note && item.note.trim());
            return item.color === savedColorFilter;
        });
    }, [savedHighlightsList, savedColorFilter]);

    // Selalu hitung dan perbarui tanggal hari ini secara realtime agar otomatis berganti setiap hari
    const [todayDayOfYear, setTodayDayOfYear] = React.useState(() => getCurrentDayOfYear365());

    React.useEffect(() => {
        const updateDay = () => {
            const curDay = getCurrentDayOfYear365();
            setTodayDayOfYear(prev => prev !== curDay ? curDay : prev);
        };
        updateDay();
        const timer = setInterval(updateDay, 60000); // Cek otomatis setiap 60 detik (khususnya saat pergantian hari tengah malam)
        return () => clearInterval(timer);
    }, []);

    // Target bacaan resmi hari ini murni sesuai tanggal kalender hari ini (selalu up to date)
    const todayPlanItem = React.useMemo(() => {
        return BIBLE_YEAR_365_PLAN[todayDayOfYear - 1] || BIBLE_YEAR_365_PLAN[0];
    }, [todayDayOfYear]);
    const calendarPlanItem = todayPlanItem;
    const activePlanItem = todayPlanItem; // Menjamin seluruh tampilan kartu & daftar hari selalu menampilkan bacaan hari ini
    const bibleYearPct = Math.round((bibleYearDone.length / 365) * 100);

    const renderAlkitabModals = () => (
        <>
            {noteModal && createPortal(
                <div className="fixed inset-0 z-[9998] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setNoteModal(null)}>
                    <div className="bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-700 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-navy-100 dark:border-navy-800">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gold-600 dark:text-gold-400 block">Renungan & Catatan Pribadi</span>
                                <h3 className="text-base font-black text-navy-900 dark:text-white">{noteModal.refLabel}</h3>
                            </div>
                            <button onClick={() => setNoteModal(null)} className="w-8 h-8 rounded-full bg-navy-50 dark:bg-navy-800 text-navy-500 hover:text-red-500 flex items-center justify-center font-bold cursor-pointer">✕</button>
                        </div>
                        {noteModal.textPreview && (
                            <p className="text-xs italic text-navy-600 dark:text-navy-300 bg-navy-50/70 dark:bg-navy-800/60 p-3 rounded-xl border-l-3 border-gold-500 mb-3 line-clamp-3">
                                "{noteModal.textPreview}"
                            </p>
                        )}
                        <form onSubmit={handleSaveVerseNote} className="space-y-3">
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-wider text-navy-500 dark:text-navy-300 block mb-1.5">Tulis Catatan / Renungan Ayat</label>
                                <textarea
                                    rows="4"
                                    autoFocus
                                    value={noteInputText}
                                    onChange={(e) => setNoteInputText(e.target.value)}
                                    placeholder="Tulis berkat rohani, poin khotbah, atau doa dari ayat ini..."
                                    className="w-full p-3 rounded-xl bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 text-xs sm:text-sm font-medium text-navy-900 dark:text-white outline-none focus:border-gold-500 resize-none"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setNoteModal(null)} className="px-4 py-2 rounded-xl bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 text-xs font-bold cursor-pointer">Batal</button>
                                <button type="submit" className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black shadow-sm cursor-pointer">Simpan Catatan</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
            <VerseImageCardModal
                isOpen={cardModalData.isOpen}
                onClose={() => setCardModalData(prev => ({ ...prev, isOpen: false }))}
                reference={cardModalData.reference}
                verseText={cardModalData.verseText}
                subtitle={cardModalData.subtitle}
                verseUrl={cardModalData.verseUrl}
            />
            {isCloudSyncOpen && createPortal(
                <div className="fixed inset-0 z-[9999] bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsCloudSyncOpen(false)}>
                    <div className="bg-white dark:bg-navy-900 border-2 border-sky-400/50 dark:border-gold-500/40 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-3 border-b border-navy-100 dark:border-navy-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-sky-500/15 dark:bg-gold-500/20 text-sky-600 dark:text-gold-400 flex items-center justify-center text-lg font-black shrink-0">
                                    ☁️
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-gold-400 block">Cloud Sync Jemaat (Supabase)</span>
                                    <h3 className="text-base font-black text-navy-900 dark:text-white">Sinkronisasi Stabilo & Catatan</h3>
                                </div>
                            </div>
                            <button type="button" onClick={() => setIsCloudSyncOpen(false)} className="w-8 h-8 rounded-full bg-navy-50 dark:bg-navy-800 text-navy-500 hover:text-red-500 flex items-center justify-center font-bold cursor-pointer">✕</button>
                        </div>

                        <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                            Simpan dan pulihkan seluruh <b>Stabilo Ayat Alkitab</b>, <b>Catatan Renungan</b>, <b>Progres Bible Year 365 Hari</b>, dan <b>Catatan Sekolah Sabat</b> Anda lintas HP/Laptop menggunakan Kode Unik atau Nomor HP Anda.
                        </p>

                        <div>
                            <label className="text-[11px] font-black uppercase tracking-wider text-navy-700 dark:text-navy-200 block mb-1.5">
                                Kode Sinkronisasi / Nomor HP Anda:
                            </label>
                            <input
                                type="text"
                                value={cloudSyncCode}
                                onChange={(e) => setCloudSyncCode(e.target.value)}
                                placeholder="Contoh: 08123456789 atau budi2026"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-700 text-sm font-bold text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                            />
                        </div>

                        {cloudSyncStatus.message && (
                            <div className={`p-3 rounded-xl text-xs font-bold border ${
                                cloudSyncStatus.type === 'success'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                    : cloudSyncStatus.type === 'error'
                                        ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                                        : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                            }`}>
                                {cloudSyncStatus.message}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={cloudSyncStatus.loading}
                                onClick={handleCloudSave}
                                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-600 hover:to-gold-600 text-navy-950 font-black text-xs shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                <span>☁️⬆️</span>
                                <span>Simpan ke Cloud</span>
                            </button>
                            <button
                                type="button"
                                disabled={cloudSyncStatus.loading}
                                onClick={handleCloudLoad}
                                className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                <span>☁️⬇️</span>
                                <span>Muat dari Cloud</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );

    if (!selectedBook) {
        return (
            <div className="animate-fade-in pb-10">
                {renderAlkitabModals()}
                <div className="sticky top-14 md:top-16 z-40 liquid-glass-header pt-2 pb-3 -mx-4 px-3 sm:px-4 md:-mx-8 md:px-8 flex flex-col gap-2.5 transition-all">
                    <div className="flex items-center gap-1.5 sm:gap-3 w-full max-w-4xl mx-auto">
                        <button
                            onClick={handleBackNavigation}
                            className={`h-9 sm:h-11 px-2.5 sm:px-3.5 flex items-center justify-center shadow-sm hover:shadow border rounded-2xl font-bold transition-all shrink-0 active:scale-95 group gap-1.5 ${
                                returnTab === 'susunan_ibadah'
                                    ? 'bg-gradient-to-r from-amber-400 to-gold-400 text-navy-950 border-amber-500/40 shadow-md font-black'
                                    : 'bg-white dark:bg-navy-800 border-navy-100/80 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white'
                            }`}
                            title={returnTab === 'belajar_sekolah_sabat' ? 'Kembali ke Sekolah Sabat' : returnTab === 'susunan_ibadah' ? 'Kembali ke Susunan Ibadah' : 'Kembali'}
                        >
                            <Icon name="ArrowLeft" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                            {returnTab === 'belajar_sekolah_sabat' && (
                                <span className="hidden sm:inline text-xs font-black text-[#4A7045] dark:text-gold-400">
                                    Sekolah Sabat
                                </span>
                            )}
                            {returnTab === 'susunan_ibadah' && (
                                <span className="text-xs font-black">
                                    Susunan Ibadah
                                </span>
                            )}
                        </button>
                        <div className="flex-1 min-w-0">
                            {renderDropdowns()}
                        </div>
                    </div>
                    <form onSubmit={handleSearch} className="relative flex items-center">
                        <Icon name="Search" className="absolute left-4 w-5 h-5 text-navy-400" />
                        <input
                            type="text"
                            placeholder="Cari Kitab atau ketik kata untuk cari ayat..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value === '') setSearchResults(null);
                            }}
                            className="w-full bg-white dark:bg-navy-900 border-2 border-navy-100 dark:border-navy-700 rounded-xl py-3 pl-12 pr-28 text-sm font-bold focus:outline-none focus:border-gold-400 dark:focus:border-gold-500 transition-colors text-navy-900 dark:text-white"
                        />
                        {searchQuery.trim() && (
                            <button type="submit" disabled={isSearching} className="absolute right-2 bg-gold-400 hover:bg-gold-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                                {isSearching ? 'Mencari...' : 'Cari Ayat'}
                            </button>
                        )}
                    </form>

                    {/* Tab Navigasi Fitur Alkitab (Daftar Kitab | Stabilo & Tersimpan | Rencana Baca 1 Tahun) */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-navy-100/70 dark:bg-navy-900/90 p-1 rounded-2xl border border-navy-200/60 dark:border-navy-800">
                        <button
                            type="button"
                            onClick={() => { setAlkitabHomeTab('books'); setSearchResults(null); }}
                            className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${alkitabHomeTab === 'books' ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-gold-400 shadow-sm' : 'text-navy-600 dark:text-navy-300 hover:text-navy-900'}`}
                        >
                            <Icon name="Book" className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                            <span className="truncate">66 Kitab</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAlkitabHomeTab('saved'); setSearchResults(null); }}
                            className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${alkitabHomeTab === 'saved' ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-gold-400 shadow-sm' : 'text-navy-600 dark:text-navy-300 hover:text-navy-900'}`}
                        >
                            <Icon name="Bookmark" className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">Stabilo ({savedHighlightsList.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setAlkitabHomeTab('bible_year');
                                setSearchResults(null);
                                setPlanFilterMode('month');
                                setSelectedPlanMonth(todayPlanItem.month);
                            }}
                            className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${alkitabHomeTab === 'bible_year' ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-gold-400 shadow-sm' : 'text-navy-600 dark:text-navy-300 hover:text-navy-900'}`}
                        >
                            <Icon name="Calendar" className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">Rencana Baca ({bibleYearPct}%)</span>
                        </button>
                    </div>
                </div>

                <div className="mt-4 sm:mt-5 space-y-4">
                    {/* Quick Access Banner Target Bacaan Hari Ini (Collapsible agar tidak menutupi daftar buku pada mobile) */}
                    {alkitabHomeTab !== 'bible_year' && !searchResults && (
                        isTargetCollapsed ? (
                            <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#1C3318]/90 via-navy-900 to-[#1C3318]/90 border border-emerald-500/30 shadow-xs flex items-center justify-between gap-2 text-xs">
                                <div
                                    onClick={() => {
                                        setAlkitabHomeTab('bible_year');
                                        setSearchResults(null);
                                        setPlanFilterMode('month');
                                        setSelectedPlanMonth(todayPlanItem.month);
                                    }}
                                    className="flex items-center gap-2 min-w-0 cursor-pointer"
                                >
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                                    <span className="text-[11px] font-black text-emerald-300 truncate">
                                        📅 Target Hari Ini: {todayPlanItem.label}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleTargetCollapse}
                                    className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-bold text-emerald-200 transition cursor-pointer shrink-0"
                                    title="Tampilkan Target Lengkap"
                                >
                                    Buka ▾
                                </button>
                            </div>
                        ) : (
                            <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#1C3318]/95 via-navy-900 to-[#1C3318]/95 border border-emerald-500/40 shadow-md flex flex-wrap items-center justify-between gap-2.5">
                                <div
                                    onClick={() => {
                                        setAlkitabHomeTab('bible_year');
                                        setSearchResults(null);
                                        setPlanFilterMode('month');
                                        setSelectedPlanMonth(todayPlanItem.month);
                                    }}
                                    className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                                    title="Buka Target Rencana Baca Hari Ini"
                                >
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-xs shadow-emerald-400/50"></span>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                                                📅 Target Hari Ini ({todayPlanItem.dateLabel} • Hari ke-{todayPlanItem.day})
                                            </span>
                                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-gold-500/20 text-gold-300 border border-gold-400/30">
                                                Bible Year
                                            </span>
                                        </div>
                                        <div className="text-xs sm:text-sm font-black text-white truncate group-hover:text-gold-300 transition-colors">
                                            📖 {todayPlanItem.label}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                    {todayPlanItem.chapters.map((ch, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => processDirectTarget({ bookName: ch.bookName, bookId: ch.bookId, chapter: ch.chapter, verse: 1 })}
                                            className="px-2 py-1 rounded-lg text-[11px] font-black bg-white/10 hover:bg-gold-500 hover:text-navy-950 text-emerald-200 hover:border-gold-400 border border-white/20 transition cursor-pointer flex items-center gap-1 active:scale-95"
                                            title={`Buka langsung ${ch.bookName} ${ch.chapter}`}
                                        >
                                            <Icon name="BookOpen" className="w-3 h-3" />
                                            <span>{ch.singkat} {ch.chapter}</span>
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAlkitabHomeTab('bible_year');
                                            setSearchResults(null);
                                            setPlanFilterMode('month');
                                            setSelectedPlanMonth(todayPlanItem.month);
                                        }}
                                        className="px-2 py-1 rounded-lg text-gold-400 hover:text-white hover:bg-white/10 text-xs font-black transition cursor-pointer flex items-center gap-1"
                                        title="Lihat Kalender Rencana Baca 1 Tahun"
                                    >
                                        <span className="text-[11px]">Rencana</span>
                                        <Icon name="ArrowRight" className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={toggleTargetCollapse}
                                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white/70 hover:text-white transition cursor-pointer shrink-0 flex items-center gap-1"
                                        title="Kecilkan Banner Target Hari Ini"
                                    >
                                        <span>Kecilkan</span>
                                        <span className="text-[11px]">▴</span>
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                    {searchResults ? (
                        <div>
                            <div className="flex justify-between items-end mb-4 px-2">
                                <h3 className="text-sm font-black text-gold-600 uppercase tracking-widest">Hasil Pencarian Ayat</h3>
                                <button onClick={() => { setSearchResults(null); setSearchQuery(''); }} className="text-xs font-bold text-navy-400 hover:text-navy-600 dark:hover:text-white transition">Tutup</button>
                            </div>
                            {searchResults.length === 0 ? (
                                <p className="text-center text-navy-400 py-10 font-semibold">Tidak ada ayat yang cocok dengan kata "{searchQuery}".</p>
                            ) : (
                                <div className="space-y-3">
                                    {searchResults.map((res, i) => {
                                        const b = ALKITAB_BOOKS.find(book => book.id === res.book);
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    if (b) {
                                                        processDirectTarget({
                                                            bookName: b.nama,
                                                            chapter: res.chapter,
                                                            verse: res.verse
                                                        });
                                                    }
                                                }}
                                                className="bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700 p-4 rounded-xl shadow-sm hover:border-gold-300 dark:hover:border-gold-500 transition cursor-pointer group"
                                            >
                                                <div className="font-black text-gold-500 text-xs mb-1.5">{b?.nama} {res.chapter}:{res.verse}</div>
                                                <p className="text-sm md:text-base text-navy-800 dark:text-navy-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: res.text.replace(/<mark>/g, '<mark className="bg-gold-200 dark:bg-gold-600/50 text-navy-900 dark:text-white rounded px-1">') }} />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : alkitabHomeTab === 'saved' ? (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 sm:p-5 border border-navy-100 dark:border-navy-800 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gold-600 dark:text-gold-400 block">Koleksi Pribadi Jemaat</span>
                                        <h3 className="text-base sm:text-lg font-black text-navy-900 dark:text-white flex items-center gap-2">
                                            <Icon name="Bookmark" className="w-5 h-5 text-gold-500" />
                                            Ayat Tersimpan, Stabilo & Catatan
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-gold-50 dark:bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-200 dark:border-gold-500/30">
                                            {savedHighlightsList.length} Ayat Ditandai
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => { setCloudSyncStatus({ loading: false, type: '', message: '' }); setIsCloudSyncOpen(true); }}
                                            className="px-3 py-1 rounded-full bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-400/40 text-xs font-black flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                                            title="Sinkronkan Stabilo & Catatan ke Cloud"
                                        >
                                            <span>☁️</span>
                                            <span>Cloud Sync</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Filter Warna Stabilo */}
                                <div className="relative flex items-center gap-1 min-w-0 max-w-full">
                                    <div
                                        ref={savedFilterScrollRef}
                                        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 min-w-0 flex-1 scroll-smooth"
                                        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onTouchMove={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => setSavedColorFilter('all')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${savedColorFilter === 'all' ? 'bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950' : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300'}`}
                                        >
                                            Semua ({savedHighlightsList.length})
                                        </button>
                                        {Object.values(HIGHLIGHT_PALETTE).map(pal => {
                                            const count = savedHighlightsList.filter(x => x.color === pal.id).length;
                                            return (
                                                <button
                                                    key={pal.id}
                                                    onClick={() => setSavedColorFilter(pal.id)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 border transition cursor-pointer ${savedColorFilter === pal.id ? pal.chipBg + ' ring-2 ring-gold-400/40 font-black' : 'bg-white dark:bg-navy-800 text-navy-600 dark:text-navy-300 border-navy-100 dark:border-navy-700'}`}
                                                >
                                                    <span className={`w-2.5 h-2.5 rounded-full ${pal.dotClass}`} />
                                                    <span>{pal.label} ({count})</span>
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setSavedColorFilter('notes')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${savedColorFilter === 'notes' ? 'bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950' : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300'}`}
                                        >
                                            📝 Ada Catatan ({savedHighlightsList.filter(x => x.note && x.note.trim()).length})
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {filteredSavedHighlights.length === 0 ? (
                                <div className="bg-white dark:bg-navy-900 rounded-2xl p-8 text-center border border-navy-100 dark:border-navy-800">
                                    <Icon name="Bookmark" className="w-10 h-10 text-navy-300 mx-auto mb-2" />
                                    <p className="font-bold text-navy-700 dark:text-navy-200 text-sm">Belum ada ayat yang distabilo atau disimpan pada kategori ini.</p>
                                    <p className="text-xs text-navy-400 mt-1">Buka salah satu kitab & pasal, ketuk ayat yang ingin ditandai, lalu pilih warna Stabilo atau Catatan di bagian bawah layar.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredSavedHighlights.map(item => {
                                        const pal = HIGHLIGHT_PALETTE[item.color] || HIGHLIGHT_PALETTE.gold;
                                        return (
                                            <div key={item.key} className={`rounded-2xl p-4 transition-all ${pal.verseBg} bg-white dark:bg-navy-800`}>
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <button
                                                        onClick={() => processDirectTarget({ bookName: item.bookName, bookId: item.bookId, chapter: item.chapter, verse: item.ayat })}
                                                        className="inline-flex items-center gap-1.5 font-black text-xs sm:text-sm text-navy-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-400 cursor-pointer"
                                                    >
                                                        <span className={`w-2.5 h-2.5 rounded-full ${pal.dotClass}`} />
                                                        <span>{item.bookName} {item.chapter}:{item.ayat}</span>
                                                        <Icon name="ArrowRight" className="w-3.5 h-3.5 opacity-60" />
                                                    </button>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => setCardModalData({
                                                                isOpen: true,
                                                                reference: `${item.bookName} ${item.chapter}:${item.ayat}`,
                                                                verseText: item.teks,
                                                                subtitle: 'AYAT PILIHAN • ALKITAB TB'
                                                            })}
                                                            className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-navy-900/90 hover:bg-gold-50 text-amber-800 dark:text-gold-300 text-[11px] font-extrabold border border-amber-300/70 dark:border-gold-500/30 flex items-center gap-1 cursor-pointer"
                                                            title="Buat Kartu Gambar Status WA"
                                                        >
                                                            <Icon name="Sparkles" className="w-3 h-3 text-gold-500" />
                                                            <span>Kartu Gambar</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setNoteInputText(item.note || '');
                                                                setNoteModal({
                                                                    singleKey: item.key,
                                                                    refLabel: `${item.bookName} ${item.chapter}:${item.ayat}`,
                                                                    textPreview: item.teks
                                                                });
                                                            }}
                                                            className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-navy-900/90 hover:bg-navy-50 text-navy-700 dark:text-navy-200 text-[11px] font-bold border border-navy-200 dark:border-navy-700 cursor-pointer"
                                                            title="Tambah / Edit Catatan"
                                                        >
                                                            📝 Catatan
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSavedHighlight(item.key)}
                                                            className="p-1.5 rounded-lg bg-white/80 dark:bg-navy-900/80 hover:bg-red-50 text-navy-400 hover:text-red-500 border border-navy-100 dark:border-navy-700 cursor-pointer"
                                                            title="Hapus Stabilo"
                                                        >
                                                            <Icon name="Trash" className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p
                                                    onClick={() => processDirectTarget({ bookName: item.bookName, bookId: item.bookId, chapter: item.chapter, verse: item.ayat })}
                                                    className="text-sm text-navy-900 dark:text-navy-100 leading-relaxed cursor-pointer"
                                                >
                                                    "{item.teks}"
                                                </p>
                                                {item.note && (
                                                    <div className="mt-2.5 p-2.5 rounded-xl bg-white/80 dark:bg-navy-950/70 border border-navy-200/60 dark:border-navy-700 text-xs text-navy-700 dark:text-gold-200">
                                                        <span className="font-black uppercase tracking-wider text-[10px] text-gold-600 dark:text-gold-400 block mb-0.5">📝 Catatan Pribadi:</span>
                                                        {item.note}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : alkitabHomeTab === 'bible_year' ? (
                        <div className="space-y-4">
                            {/* Kartu Bacaan Hari Ini & Progress Tahunan */}
                            <div className="bg-gradient-to-br from-[#1C3318] via-[#254221] to-[#132411] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-500/30">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-[10px] font-black uppercase tracking-widest">
                                                📅 Program Tahun Alkitab (Bible Year • 365 Hari)
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[10px] font-black">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                Sesuai Tanggal Kalender Hari Ini
                                            </span>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-black text-white">
                                            Bacaan Hari Ini ({todayPlanItem.dateLabel} • Hari ke-{todayPlanItem.day})
                                        </h3>
                                        <p className="text-xs sm:text-sm text-emerald-200 font-bold mt-0.5">
                                            Target Harian: <span className="text-gold-300 font-black">{todayPlanItem.label}</span>
                                            {currentBookChapter?.bookName && (
                                                <>
                                                    <span className="mx-1.5 opacity-60">•</span>
                                                    Terakhir Dibaca: <span className="text-emerald-100 font-extrabold">{currentBookChapter.bookName} {currentBookChapter.chapter}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleBibleYearDay(todayPlanItem.day)}
                                        className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition shadow-md cursor-pointer ${bibleYearDone.includes(todayPlanItem.day) ? 'bg-emerald-500 text-white border border-emerald-300' : 'bg-gold-500 hover:bg-gold-400 text-navy-950'}`}
                                    >
                                        <Icon name="CheckCircle" className="w-4 h-4" />
                                        <span>{bibleYearDone.includes(todayPlanItem.day) ? 'Selesai Dibaca Hari Ini ✅' : 'Tandai Selesai Hari Ini'}</span>
                                    </button>
                                </div>

                                {/* Tombol Cepat Buka Pasal Hari Ini (Sinkron dengan Pasal Buku Saat Ini) */}
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="text-[11px] font-bold text-emerald-200/90 mr-1">Buka langsung pasal hari ini:</span>
                                    {todayPlanItem.chapters.map((ch, idx) => {
                                        const isCurrentCh = ch.bookId === currentBookChapter?.bookId && ch.chapter === currentBookChapter?.chapter;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => processDirectTarget({ bookName: ch.bookName, bookId: ch.bookId, chapter: ch.chapter, verse: 1 })}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer flex items-center gap-1 ${isCurrentCh ? 'bg-gold-500 text-navy-950 border-gold-300 shadow-md ring-2 ring-gold-300/60' : 'bg-white/15 hover:bg-gold-500 hover:text-navy-950 text-white border-white/20'}`}
                                                title={isCurrentCh ? `Pasal Buku Saat Ini: ${ch.bookName} ${ch.chapter}` : `Buka ${ch.bookName} ${ch.chapter}`}
                                            >
                                                <Icon name="BookOpen" className="w-3.5 h-3.5" />
                                                <span>{ch.bookName} {ch.chapter}</span>
                                                {isCurrentCh && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-navy-950/20 ml-0.5">Saat Ini</span>}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Progress Bar Tahunan */}
                                <div className="bg-black/25 rounded-2xl p-3.5 border border-white/10">
                                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                        <span className="text-emerald-100">Progres Ketuntasan Baca Alkitab 1 Tahun</span>
                                        <span className="text-gold-300 font-black">{bibleYearDone.length} / 365 Hari ({bibleYearPct}%)</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-gold-400 to-emerald-400 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.max(2, bibleYearPct)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Filter Bulan Rencana Baca (Bisa di-slide horizontal di Mobile & dengan tombol geser) */}
                            <div className="bg-white dark:bg-navy-900 rounded-2xl p-3 sm:p-4 border border-navy-100 dark:border-navy-800 shadow-sm min-w-0 max-w-full">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-navy-400 dark:text-navy-400">
                                        Pilih Bulan / Status Bacaan (Geser ➔)
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => scrollHorizontalBar(planMonthScrollRef, -1)}
                                            className="w-6 h-6 rounded-lg bg-navy-50 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-600 dark:text-navy-300 flex items-center justify-center text-xs font-black cursor-pointer active:scale-95 transition"
                                            aria-label="Geser Kiri"
                                            title="Geser Kiri"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => scrollHorizontalBar(planMonthScrollRef, 1)}
                                            className="w-6 h-6 rounded-lg bg-navy-50 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-600 dark:text-navy-300 flex items-center justify-center text-xs font-black cursor-pointer active:scale-95 transition"
                                            aria-label="Geser Kanan"
                                            title="Geser Kanan"
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>
                                <div
                                    ref={planMonthScrollRef}
                                    className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 min-w-0 w-full scroll-smooth select-none"
                                    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchMove={(e) => e.stopPropagation()}
                                >
                                    {BIBLE_YEAR_MONTH_NAMES.map((mName, mIdx) => {
                                        const mNum = mIdx + 1;
                                        const isActive = planFilterMode === 'month' && selectedPlanMonth === mNum;
                                        return (
                                            <button
                                                key={mName}
                                                type="button"
                                                data-active-month={isActive ? 'true' : 'false'}
                                                onClick={() => { setPlanFilterMode('month'); setSelectedPlanMonth(mNum); }}
                                                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${isActive ? 'bg-gold-500 text-navy-950 font-black shadow-2xs' : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-100'}`}
                                            >
                                                {mName}
                                            </button>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        onClick={() => setPlanFilterMode('unread')}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${planFilterMode === 'unread' ? 'bg-amber-500 text-navy-950 font-black' : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300'}`}
                                    >
                                        Belum Dibaca ({365 - bibleYearDone.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPlanFilterMode('completed')}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${planFilterMode === 'completed' ? 'bg-emerald-600 text-white font-black' : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300'}`}
                                    >
                                        Selesai ({bibleYearDone.length})
                                    </button>
                                </div>
                            </div>

                            {/* Daftar Hari Rencana Baca */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {BIBLE_YEAR_365_PLAN.filter(item => {
                                    if (planFilterMode === 'unread') return !bibleYearDone.includes(item.day);
                                    if (planFilterMode === 'completed') return bibleYearDone.includes(item.day);
                                    return item.month === selectedPlanMonth;
                                }).map(item => {
                                    const isDone = bibleYearDone.includes(item.day);
                                    const isToday = item.day === todayPlanItem.day;
                                    return (
                                        <div
                                            key={item.day}
                                            id={`bible-plan-day-${item.day}`}
                                            className={`rounded-2xl p-3.5 border transition flex flex-col justify-between gap-2.5 ${isDone ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-300/80 dark:border-emerald-700/50' : isToday ? 'bg-gold-50/70 dark:bg-gold-500/10 border-2 border-gold-400 shadow-sm' : 'bg-white dark:bg-navy-900 border-navy-100 dark:border-navy-800'}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-gold-300">
                                                            Hari {item.day} • {item.dateLabel}
                                                        </span>
                                                        {isToday && (
                                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gold-500 text-navy-950">
                                                                Hari Ini
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="font-black text-sm sm:text-base text-navy-900 dark:text-white mt-1">
                                                        {item.label}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleBibleYearDay(item.day)}
                                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shrink-0 transition cursor-pointer ${isDone ? 'bg-emerald-600 text-white' : 'bg-navy-50 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-600 dark:text-navy-300 border border-navy-200 dark:border-navy-700'}`}
                                                    title={isDone ? 'Batal Tandai Selesai' : 'Tandai Sudah Dibaca'}
                                                >
                                                    <Icon name="Check" className="w-3.5 h-3.5" />
                                                    <span>{isDone ? 'Selesai' : 'Tandai'}</span>
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-navy-100/60 dark:border-navy-800">
                                                {item.chapters.map((ch, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => processDirectTarget({ bookName: ch.bookName, bookId: ch.bookId, chapter: ch.chapter, verse: 1 })}
                                                        className="px-2.5 py-1 rounded-lg bg-navy-50 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-700 dark:text-navy-200 text-[11px] font-bold transition cursor-pointer"
                                                    >
                                                        📖 {ch.singkat} {ch.chapter}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-2 mt-2">
                                <h2 className="text-xl md:text-2xl font-black text-navy-900 dark:text-white flex items-center">
                                    <Icon name="Book" className="w-6 h-6 mr-2 text-gold-500" />
                                    Alkitab TB
                                </h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => { setCloudSyncStatus({ loading: false, type: '', message: '' }); setIsCloudSyncOpen(true); }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-400/40 text-[11px] font-black tracking-wide transition cursor-pointer active:scale-95"
                                        title="Sinkronkan Stabilo, Rencana Baca & Catatan Sekolah Sabat Lintas Perangkat"
                                    >
                                        <span>☁️</span>
                                        <span>Cloud Sync</span>
                                    </button>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold tracking-wide">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        66 Kitab Siap Offline
                                    </span>
                                </div>
                            </div>
                            {renderBookList(pl, 'Perjanjian Lama')}
                            {renderBookList(pb, 'Perjanjian Baru')}
                            {filterBooks([...pl, ...pb]).length === 0 && (
                                <p className="text-center text-navy-400 py-10 font-semibold">Kitab tidak ditemukan. Tekan "Cari Ayat" untuk mencari isi ayat.</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (selectedBook && !selectedChapter) {
        const chapters = Array.from({ length: selectedBook.pasal }, (_, i) => i + 1);
        return (
            <div className="animate-fade-in pb-10">
                <div className="sticky top-14 md:top-16 z-40 liquid-glass-header pt-2 pb-2.5 -mx-4 px-2 sm:px-4 md:-mx-8 md:px-8 transition-all">
                    <div className="flex items-center gap-1 sm:gap-2 w-full max-w-4xl mx-auto">
                        <button
                            onClick={handleBackNavigation}
                            className={`h-9 sm:h-11 px-2 sm:px-3.5 flex items-center justify-center shadow-sm hover:shadow border rounded-2xl font-bold transition-all shrink-0 active:scale-95 group gap-1 ${
                                returnTab === 'susunan_ibadah'
                                    ? 'bg-gradient-to-r from-amber-400 to-gold-400 text-navy-950 border-amber-500/40 shadow-md font-black'
                                    : 'bg-white dark:bg-navy-800 border-navy-100/80 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white'
                            }`}
                            title={returnTab === 'belajar_sekolah_sabat' ? 'Kembali ke Sekolah Sabat' : returnTab === 'susunan_ibadah' ? 'Kembali ke Susunan Ibadah' : 'Kembali ke Daftar Kitab'}
                        >
                            <Icon name="ArrowLeft" className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
                            {returnTab === 'belajar_sekolah_sabat' && (
                                <span className="hidden sm:inline text-xs font-black text-[#4A7045] dark:text-gold-400">
                                    Sekolah Sabat
                                </span>
                            )}
                            {returnTab === 'susunan_ibadah' && (
                                <span className="text-xs font-black">
                                    Susunan Ibadah
                                </span>
                            )}
                        </button>
                        <div className="flex-1 min-w-0 overflow-hidden">
                            {renderDropdowns()}
                        </div>
                        <button
                            onClick={() => { setReturnTab(null); window.__alkitabReturnTab = null; try { localStorage.removeItem('alkitabReturnTab'); } catch (e) { } setSelectedBook(null); setSelectedChapter(null); setVerses([]); setSelectedVerses(new Set()); setSelectedAyat(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-[#4A7045]/10 dark:bg-gold-500/10 shadow-sm hover:shadow border border-[#4A7045]/20 dark:border-gold-500/30 rounded-2xl text-[#2C3F21] dark:text-gold-400 hover:bg-[#4A7045]/20 dark:hover:bg-gold-500/20 font-bold transition-all shrink-0 active:scale-95 group z-10"
                            title="Daftar Kitab (Home)"
                        >
                            <Icon name="Home" className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform" />
                        </button>
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="text-sm font-black text-gold-600 uppercase tracking-widest mb-3 px-2">Pilih Pasal</h3>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                        {chapters.map((ch) => (
                            <button key={ch} onClick={() => setSelectedChapter(ch)}
                                className="bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700 p-3 rounded-xl hover:bg-gold-50 dark:hover:bg-navy-700 hover:border-gold-200 transition-colors text-center shadow-sm font-bold text-navy-900 dark:text-navy-100">
                                {ch}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (selectedBook && selectedChapter) {
        return (
            <div className="animate-fade-in pb-44 sm:pb-48 md:pb-32">
                {renderAlkitabModals()}
                {/* Sticky Header: Tombol Panah (Kiri), Kotak Kitab (Tengah), Tombol Home (Kanan) */}
                <div className="sticky top-14 md:top-16 z-40 liquid-glass-header pt-2 pb-2.5 -mx-4 px-2 sm:px-4 md:-mx-8 md:px-8 transition-all">
                    <div className="flex items-center gap-1 sm:gap-2 w-full max-w-4xl mx-auto">
                        {/* Tombol Panah (Kembali) di sebelah kiri */}
                        <button
                            onClick={handleBackNavigation}
                            className={`h-9 sm:h-11 px-2 sm:px-3.5 flex items-center justify-center shadow-sm hover:shadow border rounded-2xl font-bold transition-all shrink-0 active:scale-95 group gap-1 ${
                                returnTab === 'susunan_ibadah'
                                    ? 'bg-gradient-to-r from-amber-400 to-gold-400 text-navy-950 border-amber-500/40 shadow-md font-black'
                                    : 'bg-white dark:bg-navy-800 border-navy-100/80 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white'
                            }`}
                            title={returnTab === 'belajar_sekolah_sabat' ? 'Kembali ke Sekolah Sabat' : returnTab === 'susunan_ibadah' ? 'Kembali ke Susunan Ibadah' : 'Kembali ke Pilih Pasal'}
                        >
                            <Icon name="ArrowLeft" className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
                            {returnTab === 'belajar_sekolah_sabat' && (
                                <span className="hidden sm:inline text-xs font-black text-[#4A7045] dark:text-gold-400">
                                    Sekolah Sabat
                                </span>
                            )}
                            {returnTab === 'susunan_ibadah' && (
                                <span className="text-xs font-black">
                                    Susunan Ibadah
                                </span>
                            )}
                        </button>

                        {/* Kotak Kitab (Dropdowns: Kitab, Pasal, Ayat) di tengah */}
                        <div className="flex-1 min-w-0 overflow-hidden">
                            {renderDropdowns()}
                        </div>

                        {/* Tombol Home di sebelah kanan */}
                        <button
                            onClick={() => { setSelectedBook(null); setSelectedChapter(null); setVerses([]); setSelectedVerses(new Set()); setSelectedAyat(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-[#4A7045]/10 dark:bg-gold-500/10 shadow-sm hover:shadow border border-[#4A7045]/20 dark:border-gold-500/30 rounded-2xl text-[#2C3F21] dark:text-gold-400 hover:bg-[#4A7045]/20 dark:hover:bg-gold-500/20 font-bold transition-all shrink-0 active:scale-95 group z-10"
                            title="Daftar Kitab (Home)"
                        >
                            <Icon name="Home" className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Navigation and Font Size Slider */}
                <div className="flex items-stretch gap-2 mt-4 h-14 md:h-12 w-full">
                    {prevChapterInfo ? (
                        <button onClick={() => { setSelectedBook(prevChapterInfo.book); setSelectedChapter(prevChapterInfo.chapter); setVerses([]); setSelectedAyat(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 flex flex-col items-start justify-center px-3 md:px-4 py-1.5 bg-white dark:bg-navy-800 rounded-xl border border-navy-100/80 dark:border-navy-700 shadow-sm hover:shadow hover:border-gold-300 dark:hover:border-gold-500/50 transition-all group min-w-0 overflow-hidden">
                            <span className="text-[9px] md:text-[10px] text-navy-400 dark:text-navy-400 font-black uppercase tracking-widest flex items-center gap-1 w-full"><Icon name="ChevronLeft" className="w-3 h-3 shrink-0 group-hover:-translate-x-0.5 transition-transform" /> <span className="truncate">Sebelumnya</span></span>
                            <span className="font-bold text-navy-800 dark:text-navy-100 text-[11px] md:text-sm pl-4 truncate w-full text-left">{prevChapterInfo.book.nama} {prevChapterInfo.chapter}</span>
                        </button>
                    ) : <div className="flex-1"></div>}

                    <div className="flex-[1.2] md:flex-[2] flex items-center justify-between md:justify-center gap-1 bg-navy-50 dark:bg-navy-800/50 rounded-xl px-1.5 md:px-2 py-1.5 h-full border border-transparent dark:border-navy-800 shrink-0">
                        <button onClick={() => updateFontSize(fontSize - 2)} disabled={fontSize <= 12} className="w-10 md:w-12 h-full flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-navy-700 text-navy-600 dark:text-navy-200 font-black text-xs md:text-sm shadow-sm transition-colors active:scale-95 disabled:opacity-40 cursor-pointer" title="Perkecil Teks (A-)">
                            A-
                        </button>
                        <div className="flex flex-col items-center justify-center px-2 min-w-[3rem]">
                            <span className="text-[10px] md:text-xs font-bold text-navy-600 dark:text-navy-300 leading-none">Ukuran</span>
                            <span className="text-[9px] md:text-[10px] text-gold-600 dark:text-gold-400 font-black tracking-tighter leading-none mt-1">{fontSize}px</span>
                        </div>
                        <button onClick={() => updateFontSize(fontSize + 2)} disabled={fontSize >= 28} className="w-10 md:w-12 h-full flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-navy-700 text-navy-600 dark:text-navy-200 font-black text-xs md:text-sm shadow-sm transition-colors active:scale-95 disabled:opacity-40 cursor-pointer" title="Perbesar Teks (A+)">
                            A+
                        </button>
                    </div>

                    {nextChapterInfo ? (
                        <button onClick={() => { setSelectedBook(nextChapterInfo.book); setSelectedChapter(nextChapterInfo.chapter); setVerses([]); setSelectedAyat(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 flex flex-col items-end justify-center px-3 md:px-4 py-1.5 bg-white dark:bg-navy-800 rounded-xl border border-navy-100/80 dark:border-navy-700 shadow-sm hover:shadow hover:border-gold-300 dark:hover:border-gold-500/50 transition-all group min-w-0 overflow-hidden">
                            <span className="text-[9px] md:text-[10px] text-navy-400 dark:text-navy-400 font-black uppercase tracking-widest flex items-center justify-end gap-1 w-full"><span className="truncate">Berikutnya</span> <Icon name="ChevronRight" className="w-3 h-3 shrink-0 group-hover:translate-x-0.5 transition-transform" /></span>
                            <span className="font-bold text-navy-800 dark:text-navy-100 text-[11px] md:text-sm pr-4 truncate w-full text-right">{nextChapterInfo.book.nama} {nextChapterInfo.chapter}</span>
                        </button>
                    ) : <div className="flex-1"></div>}
                </div>
                <div className="mt-6 bg-white dark:bg-navy-900 p-5 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100 dark:border-navy-800 min-h-[200px]">
                    {isLoadingChapter && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-10 h-10 border-4 border-navy-100 border-t-[#D19B45] rounded-full animate-spin mb-3"></div>
                            <p className="text-navy-500 font-bold uppercase tracking-widest text-xs animate-pulse">Memuat pasal...</p>
                        </div>
                    )}
                    {fetchError && !isLoadingChapter && (
                        <div className="text-center py-10">
                            <p className="text-red-500 font-bold mb-3">{fetchError}</p>
                            <button onClick={() => loadChapter(selectedBook.id, selectedChapter)} className="px-5 py-2 bg-navy-900 text-gold-400 rounded-xl font-bold text-sm hover:bg-navy-800 transition">Coba Lagi</button>
                        </div>
                    )}
                    {!isLoadingChapter && !fetchError && verses.length > 0 && (
                        <>
                            <div className="mb-6 sm:mb-8 border-b border-navy-100 dark:border-navy-800 pb-5 sm:pb-6">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-gold-600 uppercase tracking-widest">{selectedBook.testamen === 'PL' ? 'PERJANJIAN LAMA' : 'PERJANJIAN BARU'} • TERJEMAHAN BARU</span>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white tracking-tight">{selectedBook.nama} {selectedChapter}</h2>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Tombol Audio Alkitab */}
                                        <button
                                            onClick={handleToggleChapterTTS}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer ${ttsState === 'playing'
                                                ? 'bg-gold-500 text-white shadow-md shadow-gold-500/30 animate-pulse'
                                                : ttsState === 'paused'
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                                    : 'bg-gold-50 hover:bg-gold-100 dark:bg-gold-500/10 dark:hover:bg-gold-500/20 text-gold-700 dark:text-gold-300 border border-gold-300/60 dark:border-gold-500/30'
                                                }`}
                                            title={ttsState === 'playing' ? "Jeda Pembacaan Audio" : ttsState === 'paused' ? "Lanjutkan Pembacaan Audio" : "Dengarkan Pasal Ini (Suara Bahasa Indonesia)"}
                                        >
                                            <Icon name={ttsState === 'playing' ? "Pause" : "Volume2"} className={`w-4 h-4 ${ttsState === 'playing' ? 'text-white' : 'text-gold-600 dark:text-gold-400'}`} />
                                            <span>{ttsState === 'playing' ? 'Jeda' : ttsState === 'paused' ? 'Lanjut' : 'Dengarkan Audio'}</span>
                                        </button>

                                        {ttsState !== 'idle' && (
                                            <button
                                                onClick={handleStopTTS}
                                                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-bold text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                                                title="Hentikan Pembacaan"
                                            >
                                                <Icon name="Square" className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Berhenti</span>
                                            </button>
                                        )}

                                        {/* Pengatur Ukuran Huruf Cepat (A- / A+) */}
                                        <div className="flex items-center bg-navy-50 dark:bg-navy-800/90 rounded-xl p-0.5 border border-navy-200/60 dark:border-navy-700 text-xs" title="Ubah Ukuran Teks Alkitab">
                                            <button
                                                onClick={() => updateFontSize(fontSize - 2)}
                                                disabled={fontSize <= 12}
                                                className="px-2 py-1 rounded-lg font-black text-navy-700 dark:text-gold-300 hover:bg-white dark:hover:bg-navy-700 disabled:opacity-35 transition cursor-pointer"
                                            >
                                                A-
                                            </button>
                                            <span className="px-1.5 text-[10px] font-bold text-navy-400 dark:text-navy-400 select-none">{fontSize}px</span>
                                            <button
                                                onClick={() => updateFontSize(fontSize + 2)}
                                                disabled={fontSize >= 28}
                                                className="px-2 py-1 rounded-lg font-black text-navy-700 dark:text-gold-300 hover:bg-white dark:hover:bg-navy-700 disabled:opacity-35 transition cursor-pointer"
                                            >
                                                A+
                                            </button>
                                        </div>

                                        <span className="bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 text-xs font-bold px-3 py-1.5 rounded-full">
                                            {verses.filter(v => v.type === 'content').length} ayat
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {verses.map((a, index) => {
                                    if (a.type === 'title') {
                                        return (
                                            <h3 key={`title-${index}`} className="text-lg md:text-xl font-bold text-navy-900 dark:text-white mt-10 mb-5 border-l-4 border-gold-500 pl-3">
                                                {a.teks}
                                            </h3>
                                        );
                                    }
                                    const isSelected = selectedVerses.has(a.ayat);
                                    const isPlayingThis = activePlayingAyat === a.ayat;
                                    const vKey = `${selectedBook.id}_${selectedChapter}_${a.ayat}`;
                                    const hl = highlightsMap[vKey];
                                    const pal = hl ? (HIGHLIGHT_PALETTE[hl.color] || HIGHLIGHT_PALETTE.gold) : null;
                                    return (
                                        <div
                                            key={a.ayat}
                                            id={`ayat-${a.ayat}`}
                                            style={{ scrollMarginTop: '160px' }}
                                            onClick={() => toggleVerse(a.ayat)}
                                            className={`flex gap-3 sm:gap-4 items-start group transition-all duration-300 rounded-[1.25rem] p-3 md:p-4 -mx-3 md:-mx-4 cursor-pointer select-none ${isSelected
                                                ? 'bg-gold-50 dark:bg-gold-500/15 shadow-sm border-2 border-gold-400 dark:border-gold-500/60 ring-2 ring-gold-400/20'
                                                : isPlayingThis
                                                    ? 'bg-gold-100/80 dark:bg-gold-500/20 shadow-md border-2 border-gold-400 dark:border-gold-500 ring-2 ring-gold-400/30'
                                                    : pal
                                                        ? pal.verseBg
                                                        : 'hover:bg-navy-50/70 dark:hover:bg-navy-800/60 border border-transparent'
                                                }`}
                                        >
                                            <span
                                                className={`font-bold rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm ${isSelected
                                                    ? 'bg-[#D19B45] text-white'
                                                    : isPlayingThis
                                                        ? 'bg-gold-500 text-white animate-pulse'
                                                        : pal
                                                            ? pal.badgeBg
                                                            : 'text-navy-500 bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700'
                                                    }`}
                                                style={{ fontSize: Math.max(10, fontSize - 6) + 'px', width: '2.5em', height: '2.5em', marginTop: '0.25em' }}
                                            >
                                                {isPlayingThis ? (
                                                    <Icon name="Volume2" className="w-3.5 h-3.5" />
                                                ) : (
                                                    a.ayat
                                                )}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-navy-800 dark:text-navy-100 leading-relaxed transition-all" style={{ fontSize: fontSize + 'px' }}>
                                                    {a.teks}
                                                </p>
                                                {hl && hl.note && (
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setNoteInputText(hl.note || '');
                                                            setNoteModal({
                                                                singleKey: vKey,
                                                                refLabel: `${selectedBook.nama} ${selectedChapter}:${a.ayat}`,
                                                                textPreview: a.teks
                                                            });
                                                        }}
                                                        className="mt-2 p-2.5 rounded-xl bg-white/85 dark:bg-navy-950/75 border border-navy-200/70 dark:border-navy-700 text-xs text-navy-700 dark:text-gold-200 hover:border-gold-400 transition"
                                                        title="Klik untuk mengedit catatan"
                                                    >
                                                        <span className="font-black uppercase tracking-wider text-[10px] text-gold-600 dark:text-gold-400 block mb-0.5">📝 Catatan Pribadi:</span>
                                                        {hl.note}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tombol Dengarkan Ayat Ini Cepat */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isPlayingThis && ttsState === 'playing') {
                                                        handleToggleChapterTTS();
                                                    } else {
                                                        handlePlaySingleVerse(a);
                                                    }
                                                }}
                                                className={`p-1.5 rounded-lg transition-opacity shrink-0 ${isPlayingThis
                                                    ? 'opacity-100 text-gold-500'
                                                    : 'opacity-0 group-hover:opacity-100 focus:opacity-100 text-navy-400 hover:text-gold-600 dark:hover:text-gold-400'
                                                    }`}
                                                title={`Dengarkan Ayat ${a.ayat}`}
                                            >
                                                <Icon name={isPlayingThis && ttsState === 'playing' ? "Volume2" : "Volume1"} className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Navigasi Bawah: Sebelumnya, Ke Atas, Berikutnya */}
                            <div className="mt-10 pt-6 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between gap-2 sm:gap-4 select-none">
                                {prevChapterInfo ? (
                                    <button
                                        onClick={() => {
                                            setSelectedBook(prevChapterInfo.book);
                                            setSelectedChapter(prevChapterInfo.chapter);
                                            setVerses([]);
                                            setSelectedAyat('');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="flex-1 flex items-center justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-navy-50 hover:bg-gold-500 hover:text-navy-950 dark:bg-navy-800 dark:hover:bg-gold-500 dark:hover:text-navy-950 text-navy-700 dark:text-navy-200 border border-navy-100/80 dark:border-navy-700 transition-all cursor-pointer group shadow-sm active:scale-95 min-w-0"
                                        title={`Pasal Sebelumnya: ${prevChapterInfo.book.nama} ${prevChapterInfo.chapter}`}
                                    >
                                        <Icon name="ChevronLeft" className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                                        <div className="flex flex-col text-left truncate min-w-0">
                                            <span className="text-[9px] uppercase font-black text-navy-400 dark:text-navy-400 group-hover:text-navy-900 tracking-wider">Sebelumnya</span>
                                            <span className="text-xs sm:text-sm font-black truncate">{prevChapterInfo.book.nama} {prevChapterInfo.chapter}</span>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="flex-1" />
                                )}

                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gold-500/15 hover:bg-gold-500 text-gold-600 dark:text-gold-400 hover:text-navy-950 dark:hover:text-navy-950 border border-gold-500/30 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 group"
                                    title="Kembali ke Bagian Atas"
                                >
                                    <Icon name="ArrowUp" className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:-translate-y-0.5 transition-transform" />
                                    <span className="text-xs sm:text-sm font-black whitespace-nowrap">Ke Atas</span>
                                </button>

                                {nextChapterInfo ? (
                                    <button
                                        onClick={() => {
                                            setSelectedBook(nextChapterInfo.book);
                                            setSelectedChapter(nextChapterInfo.chapter);
                                            setVerses([]);
                                            setSelectedAyat('');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="flex-1 flex items-center justify-end gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-navy-50 hover:bg-gold-500 hover:text-navy-950 dark:bg-navy-800 dark:hover:bg-gold-500 dark:hover:text-navy-950 text-navy-700 dark:text-navy-200 border border-navy-100/80 dark:border-navy-700 transition-all cursor-pointer group shadow-sm active:scale-95 min-w-0"
                                        title={`Pasal Berikutnya: ${nextChapterInfo.book.nama} ${nextChapterInfo.chapter}`}
                                    >
                                        <div className="flex flex-col text-right truncate min-w-0">
                                            <span className="text-[9px] uppercase font-black text-navy-400 dark:text-navy-400 group-hover:text-navy-900 tracking-wider">Berikutnya</span>
                                            <span className="text-xs sm:text-sm font-black truncate">{nextChapterInfo.book.nama} {nextChapterInfo.chapter}</span>
                                        </div>
                                        <Icon name="ChevronRight" className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                ) : (
                                    <div className="flex-1" />
                                )}
                            </div>
                        </>
                    )}
                    {!isLoadingChapter && !fetchError && verses.length === 0 && (
                        <p className="text-center text-navy-400 py-10 font-semibold text-sm">Tidak ada data ayat.</p>
                    )}

                    {/* Toolbar Pemutar Audio Mengambang (Floating Audio Player) */}
                    {ttsState !== 'idle' && createPortal(
                        <>
                            <style>{`
                                .main-mobile-nav { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; transform: translate(-50%, 200px) !important; }
                                .floating-quick-actions-container { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; transform: translateY(100px) !important; }
                                .floating-alkitab-bar { bottom: calc(env(safe-area-inset-bottom, 0px) + 12px) !important; z-index: 70 !important; }
                                @media (min-width: 768px) { .floating-alkitab-bar { bottom: 24px !important; } }
                            `}</style>
                            <div className="fixed floating-alkitab-bar left-0 right-0 z-[70] flex justify-center px-3 sm:px-4 pointer-events-none animate-slide-up">
                                <div className="pointer-events-auto bg-navy-950/95 dark:bg-navy-900/95 backdrop-blur-md text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl sm:rounded-full shadow-2xl border border-gold-500/40 flex items-center gap-2 sm:gap-4 max-w-lg w-full justify-between">
                                    {/* Info Ayat Aktif */}
                                    <div
                                        onClick={() => activePlayingAyat && scrollToVerse(activePlayingAyat)}
                                        className="flex items-center gap-2 min-w-0 cursor-pointer group"
                                        title="Klik untuk menuju posisi ayat"
                                    >
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0 border border-gold-500/40">
                                            <Icon name="Volume2" className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400 ${ttsState === 'playing' ? 'animate-pulse' : ''}`} />
                                        </div>
                                        <div className="truncate max-w-[130px] sm:max-w-[220px]">
                                            <div className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-gold-400 truncate">
                                                {ttsState === 'playing' ? 'Sedang Membaca' : 'Audio Dijeda'}
                                            </div>
                                            <div className="text-[11px] sm:text-xs font-bold text-white group-hover:text-gold-300 transition-colors truncate">
                                                {selectedBook.nama} {selectedChapter}{activePlayingAyat ? ` : Ayat ${activePlayingAyat}` : ''}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                        {/* Prev Verse */}
                                        <button
                                            onClick={handlePrevAudioVerse}
                                            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                                            title="Ayat Sebelumnya"
                                        >
                                            <Icon name="SkipBack" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>

                                        {/* Play / Pause */}
                                        <button
                                            onClick={handleToggleChapterTTS}
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gold-500 hover:bg-gold-400 active:scale-95 text-navy-950 flex items-center justify-center font-black transition shadow-md cursor-pointer"
                                            title={ttsState === 'playing' ? "Jeda" : "Lanjutkan"}
                                        >
                                            <Icon name={ttsState === 'playing' ? "Pause" : "Play"} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                                        </button>

                                        {/* Next Verse */}
                                        <button
                                            onClick={handleNextAudioVerse}
                                            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                                            title="Ayat Berikutnya"
                                        >
                                            <Icon name="SkipForward" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>

                                        {/* Speed Toggle */}
                                        <button
                                            onClick={handleToggleTtsRate}
                                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[9px] sm:text-xs font-black text-gold-300 transition cursor-pointer"
                                            title="Ubah Kecepatan Suara (0.8x, 0.9x, 1x, 1.15x, 1.2x)"
                                        >
                                            {ttsRate}x
                                        </button>

                                        {/* Stop */}
                                        <button
                                            onClick={handleStopTTS}
                                            className="p-1.5 sm:p-2 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition cursor-pointer ml-0.5"
                                            title="Hentikan Pembacaan"
                                        >
                                            <Icon name="Square" className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>,
                        document.body
                    )}

                    {/* Bar Aksi Ayat Terpilih (Stabilo Warna, Catatan, Kartu Gambar, Dengarkan & Bagikan) */}
                    {selectedVerses.size > 0 && ttsState === 'idle' && createPortal(
                        <>
                            <style>{`
                                .main-mobile-nav { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; transform: translate(-50%, 200px) !important; }
                                .floating-quick-actions-container { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; transform: translateY(100px) !important; }
                                .floating-alkitab-bar { bottom: calc(env(safe-area-inset-bottom, 0px) + 12px) !important; z-index: 70 !important; }
                                @media (min-width: 768px) { .floating-alkitab-bar { bottom: 24px !important; } }
                            `}</style>
                            <div className="fixed floating-alkitab-bar left-0 right-0 z-[70] flex justify-center px-2.5 sm:px-4 pointer-events-none animate-slide-up">
                                <div className="pointer-events-auto flex flex-col gap-2 bg-navy-950/95 dark:bg-navy-900/95 backdrop-blur-md p-2.5 sm:p-3 rounded-3xl shadow-2xl border border-gold-500/40 max-w-xl w-full">
                                    {/* Baris 1: Pilihan Warna Stabilo & Catatan Pribadi */}
                                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-gold-300 mr-0.5">Stabilo:</span>
                                            {Object.values(HIGHLIGHT_PALETTE).map(pal => (
                                                <button
                                                    key={pal.id}
                                                    type="button"
                                                    onClick={() => handleApplyHighlight(pal.id)}
                                                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 ${pal.dotClass} hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-sm`}
                                                    title={`Stabilo ${pal.label}`}
                                                />
                                            ))}
                                            {Array.from(selectedVerses).some(aNum => Boolean(highlightsMap[`${selectedBook.id}_${selectedChapter}_${aNum}`])) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleApplyHighlight(null)}
                                                    className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/35 text-red-300 text-[10px] font-bold transition cursor-pointer ml-0.5"
                                                    title="Hapus Stabilo pada Ayat Terpilih"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={handleOpenNoteForSelected}
                                                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-gold-300 text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer"
                                                title="Tambah Catatan Pribadi pada Ayat Ini"
                                            >
                                                <span>📝 Catatan</span>
                                            </button>
                                            <button
                                                onClick={() => setSelectedVerses(new Set())}
                                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer text-xs"
                                                title="Batal Memilih"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>

                                    {/* Baris 2: Tombol Aksi (Dengarkan, Kartu Gambar Status WA, Bagikan Teks) */}
                                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                        <button
                                            onClick={handlePlaySelectedVerses}
                                            className="bg-gold-500 hover:bg-gold-400 text-navy-950 px-2.5 sm:px-4 py-2 rounded-2xl font-black text-[11px] sm:text-xs shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                                            title={`Dengarkan ${selectedVerses.size} Ayat Terpilih`}
                                        >
                                            <Icon name="Volume2" className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">Suara ({selectedVerses.size})</span>
                                        </button>
                                        <button
                                            onClick={handleOpenCardForSelected}
                                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-navy-950 px-2.5 sm:px-4 py-2 rounded-2xl font-black text-[11px] sm:text-xs shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                                            title="Buat Gambar Kartu Ayat untuk Status WA / IG Story"
                                        >
                                            <Icon name="Sparkles" className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">Kartu Gambar</span>
                                        </button>
                                        <button
                                            onClick={handleShareVerses}
                                            className="bg-[#4A7045] hover:bg-[#3A5836] text-white px-2.5 sm:px-4 py-2 rounded-2xl font-bold text-[11px] sm:text-xs shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                                            title={`Bagikan Teks ${selectedVerses.size} Ayat`}
                                        >
                                            <Icon name="Share" className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">Bagikan ({selectedVerses.size})</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>,
                        document.body
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default Alkitab;
