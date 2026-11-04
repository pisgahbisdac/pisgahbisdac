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

export const GaleriPublik = () => {
    const [folders, setFolders] = React.useState([]);
    const [selectedFolderId, setSelectedFolderId] = React.useState('');
    const [media, setMedia] = React.useState([]);
    const [loadingFolders, setLoadingFolders] = React.useState(false);
    const [loadingMedia, setLoadingMedia] = React.useState(false);
    const [error, setError] = React.useState('');

    // Level 1: Search, Filter, Sort
    const [searchQuery, setSearchQuery] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('all'); // 'all', 'sabat', 'event', 'youth'
    const [yearFilter, setYearFilter] = React.useState('all'); // 'all' atau tahun spesifik
    const [sortOrder, setSortOrder] = React.useState('latest'); // 'latest' | 'az'

    // Level 2: Sub-filter & Viewers
    const [mediaFilter, setMediaFilter] = React.useState('all'); // 'all', 'image', 'video'
    const [lightboxIndex, setLightboxIndex] = React.useState(null);
    const [selectedVideo, setSelectedVideo] = React.useState(null);

    // Cache cover album
    const [folderCovers, setFolderCovers] = React.useState(() => {
        try {
            const cached = localStorage.getItem('pisgah_gallery_covers');
            return cached ? JSON.parse(cached) : {};
        } catch {
            return {};
        }
    });

    const loadFolders = async () => {
        setLoadingFolders(true);
        setError('');
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'getPublicFolders' })
            });
            const data = await res.json();
            if (data.success) {
                setFolders(data.folders || []);
            } else {
                setError('Gagal memuat folder: ' + data.message);
            }
        } catch (err) {
            setError('Gagal terhubung ke server.');
        }
        setLoadingFolders(false);
    };

    const loadMedia = async (folderId) => {
        if (!folderId) return;
        setLoadingMedia(true);
        setError('');
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'getPublicImages', folderId })
            });
            const data = await res.json();
            if (data.success) {
                setMedia(data.media || []);
                // Simpan cover pertama ke cache jika belum ada
                const firstImg = (data.media || []).find(m => m.type !== 'video');
                if (firstImg && firstImg.url) {
                    setFolderCovers(prev => {
                        const updated = { ...prev, [folderId]: firstImg.url };
                        try { localStorage.setItem('pisgah_gallery_covers', JSON.stringify(updated)); } catch (e) { }
                        return updated;
                    });
                }
            } else {
                setError('Gagal memuat media: ' + data.message);
            }
        } catch (err) {
            setError('Gagal memuat media.');
        }
        setLoadingMedia(false);
    };

    React.useEffect(() => { loadFolders(); }, []);
    React.useEffect(() => {
        if (selectedFolderId) {
            loadMedia(selectedFolderId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedFolderId]);

    // Olah data folder dengan tanggal & kategori
    const processedFolders = React.useMemo(() => {
        return folders.map(f => {
            const parsedDate = parseFolderDate(f.name);
            const catInfo = getFolderCategoryInfo(f.name);
            const dateLabel = formatFolderDateLabel(parsedDate);
            return {
                ...f,
                parsedDate,
                catInfo,
                dateLabel
            };
        });
    }, [folders]);

    // Kumpulan tahun unik yang tersedia dari album kegiatan
    const availableYears = React.useMemo(() => {
        const years = new Set();
        processedFolders.forEach(f => {
            if (f.parsedDate) {
                const yr = new Date(f.parsedDate).getFullYear();
                if (yr && yr >= 2000 && yr <= 2099) years.add(String(yr));
            } else {
                const match = f.name.match(/\b(20\d{2})\b/);
                if (match) years.add(match[1]);
            }
        });
        return Array.from(years).sort((a, b) => b.localeCompare(a));
    }, [processedFolders]);

    // Filter & sort folders untuk Level 1
    const filteredFolders = React.useMemo(() => {
        let result = [...processedFolders];

        if (categoryFilter !== 'all') {
            result = result.filter(f => f.catInfo.category === categoryFilter);
        }

        if (yearFilter !== 'all') {
            result = result.filter(f => {
                let yr = '';
                if (f.parsedDate) {
                    yr = String(new Date(f.parsedDate).getFullYear());
                } else {
                    const match = f.name.match(/\b(20\d{2})\b/);
                    if (match) yr = match[1];
                }
                return yr === yearFilter;
            });
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(f =>
                f.name.toLowerCase().includes(q) ||
                f.dateLabel.toLowerCase().includes(q) ||
                f.catInfo.label.toLowerCase().includes(q)
            );
        }

        if (sortOrder === 'latest') {
            result.sort((a, b) => {
                if (b.parsedDate !== a.parsedDate) return b.parsedDate - a.parsedDate;
                return a.name.localeCompare(b.name);
            });
        } else {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }, [processedFolders, categoryFilter, yearFilter, searchQuery, sortOrder]);

    // Active folder saat di Level 2
    const activeFolder = React.useMemo(() => {
        return processedFolders.find(f => f.id === selectedFolderId) || null;
    }, [processedFolders, selectedFolderId]);

    // Media terfilter untuk Level 2
    const filteredMedia = React.useMemo(() => {
        if (mediaFilter === 'image') return media.filter(m => m.type !== 'video');
        if (mediaFilter === 'video') return media.filter(m => m.type === 'video');
        return media;
    }, [media, mediaFilter]);

    const imagesOnly = React.useMemo(() => {
        return filteredMedia.filter(m => m.type !== 'video');
    }, [filteredMedia]);

    // Keyboard navigation untuk Lightbox Foto
    React.useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                setLightboxIndex(prev => (prev < imagesOnly.length - 1 ? prev + 1 : 0));
            } else if (e.key === 'ArrowLeft') {
                setLightboxIndex(prev => (prev > 0 ? prev - 1 : imagesOnly.length - 1));
            } else if (e.key === 'Escape') {
                setLightboxIndex(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, imagesOnly.length]);

    // Lock scroll body saat modal lightbox / video player aktif agar tetap stabil di tengah layar
    React.useEffect(() => {
        if (lightboxIndex !== null || selectedVideo !== null) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [lightboxIndex, selectedVideo]);

    if (loadingFolders) {
        return (
            <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-navy-100 border-t-gold-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-navy-600 dark:text-navy-300 font-bold text-sm">Memuat daftar album galeri...</p>
                <p className="text-navy-400 text-xs mt-1">Menghubungkan ke arsip dokumentasi jemaat</p>
            </div>
        );
    }

    if (error && !selectedFolderId) {
        return (
            <div className="text-center py-12 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 p-6">
                <Icon name="Info" className="w-10 h-10 mx-auto text-red-500 mb-2" />
                <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
                <button
                    onClick={loadFolders}
                    className="mt-4 px-4 py-2 bg-navy-900 text-gold-400 text-xs font-bold rounded-xl"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    if (folders.length === 0) {
        return (
            <div className="text-center py-16 bg-navy-50/50 dark:bg-navy-900/30 rounded-2xl border border-dashed border-navy-200 p-6">
                <Icon name="Folder" className="w-12 h-12 mx-auto text-navy-300 mb-3" />
                <h4 className="text-base font-bold text-navy-800 dark:text-navy-200">Belum ada album galeri</h4>
                <p className="text-xs text-navy-500 mt-1">Dokumentasi kegiatan akan segera diperbarui oleh pengurus.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* ========== MODAL LIGHTBOX FOTO INTERAKTIF (Dimount ke document.body agar 100% di Tengah Layar) ========== */}
            {lightboxIndex !== null && imagesOnly[lightboxIndex] && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 p-4 select-none backdrop-blur-md animate-fade-in"
                    onClick={() => setLightboxIndex(null)}
                >
                    {/* Top Bar Lightbox */}
                    <div
                        className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2">
                            <span className="bg-navy-900/80 border border-navy-700/80 px-3 py-1.5 rounded-full text-xs font-bold text-gold-400 shadow-md">
                                {lightboxIndex + 1} / {imagesOnly.length}
                            </span>
                            <span className="text-xs text-navy-200 hidden sm:inline max-w-xs md:max-w-md truncate">
                                {imagesOnly[lightboxIndex].title}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Tombol Bagikan Foto */}
                            <button
                                onClick={async () => {
                                    const currentImg = imagesOnly[lightboxIndex];
                                    const photoUrl = formatImageUrl(currentImg.url);
                                    const shareTitle = currentImg.title || 'Foto Dokumentasi Jemaat Pisgah BISDAC';
                                    const shareText = `*${shareTitle}*\nDokumentasi GMAHK Jemaat Pisgah BISDAC:\n${photoUrl}`;

                                    if (navigator.share) {
                                        try {
                                            await navigator.share({
                                                title: shareTitle,
                                                text: shareText
                                            });
                                            return;
                                        } catch (e) {
                                            if (e.name === 'AbortError') return;
                                        }
                                    }
                                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                                title="Bagikan foto ke WhatsApp / Media Sosial"
                            >
                                <Icon name="Share2" className="w-4 h-4" />
                                <span className="hidden sm:inline">Bagi Foto</span>
                            </button>
                            <a
                                href={imagesOnly[lightboxIndex].url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 hover:bg-gold-500 hover:text-navy-950 text-white rounded-xl text-xs font-bold transition shadow-sm"
                                title="Unduh foto resolusi penuh"
                            >
                                <Icon name="Download" className="w-4 h-4" />
                                <span className="hidden sm:inline">Unduh</span>
                            </a>
                            <button
                                onClick={() => setLightboxIndex(null)}
                                className="text-white hover:text-gold-400 bg-white/15 hover:bg-white/25 rounded-xl w-9 h-9 flex items-center justify-center transition"
                                title="Tutup (Esc)"
                            >
                                <Icon name="X" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tombol Panah Kiri (Prev) */}
                    {imagesOnly.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex(prev => (prev > 0 ? prev - 1 : imagesOnly.length - 1));
                            }}
                            className="absolute left-3 md:left-6 text-white hover:text-gold-400 bg-black/40 hover:bg-black/70 border border-white/10 rounded-full w-11 h-11 flex items-center justify-center transition-all z-20"
                            title="Foto Sebelumnya"
                        >
                            <Icon name="ChevronLeft" className="w-6 h-6" />
                        </button>
                    )}

                    {/* Gambar Lightbox */}
                    <div className="relative max-w-full max-h-[82vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <img
                            src={formatImageUrl(imagesOnly[lightboxIndex].url)}
                            className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl transition-all duration-300"
                            alt={imagesOnly[lightboxIndex].title || 'Foto Galeri'}
                        />
                    </div>

                    {/* Tombol Panah Kanan (Next) */}
                    {imagesOnly.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex(prev => (prev < imagesOnly.length - 1 ? prev + 1 : 0));
                            }}
                            className="absolute right-3 md:right-6 text-white hover:text-gold-400 bg-black/40 hover:bg-black/70 border border-white/10 rounded-full w-11 h-11 flex items-center justify-center transition-all z-20"
                            title="Foto Selanjutnya"
                        >
                            <Icon name="ChevronRight" className="w-6 h-6" />
                        </button>
                    )}
                </div>,
                document.body
            )}

            {/* ========== MODAL POP-UP VIDEO PLAYER (Dimount ke document.body) ========== */}
            {selectedVideo && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 select-none backdrop-blur-md animate-fade-in"
                    onClick={() => setSelectedVideo(null)}
                >
                    <div
                        className="w-full max-w-3xl bg-navy-900 rounded-2xl overflow-hidden shadow-2xl border border-navy-700 animate-scale-up"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-800 bg-navy-950">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse"></div>
                                <h4 className="text-sm font-bold text-white truncate max-w-md">
                                    {selectedVideo.title || 'Video Dokumentasi'}
                                </h4>
                            </div>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="text-navy-400 hover:text-white rounded-lg p-1 transition"
                            >
                                <Icon name="X" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                            <iframe
                                src={`https://drive.google.com/file/d/${selectedVideo.id}/preview`}
                                className="w-full h-full border-0"
                                allow="autoplay; encrypted-media; fullscreen"
                                allowFullScreen
                                title={selectedVideo.title}
                            />
                        </div>

                        <div className="p-4 bg-navy-950 flex flex-wrap items-center justify-between gap-3 border-t border-navy-800">
                            <span className="text-xs text-navy-300">
                                Jika video lambat atau tidak berputar, buka langsung di Google Drive:
                            </span>
                            <a
                                href={selectedVideo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-xl font-bold text-xs transition shadow-sm"
                            >
                                Buka di Google Drive <Icon name="ExternalLink" className="w-3.5 h-3.5 ml-1" />
                            </a>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ========== LEVEL 1: KOLEKSI ALBUM KEGIATAN ========== */}
            {!selectedFolderId && (
                <div className="space-y-6 animate-fade-in">
                    {/* Header Galeri & Banner */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 p-6 rounded-2xl text-white shadow-lg border border-navy-700/50">
                        <div>
                            <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <Icon name="Folder" className="w-4 h-4" /> Koleksi Dokumentasi Jemaat
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-white">
                                Pilih Album Kegiatan
                            </h3>
                            <p className="text-xs md:text-sm text-navy-200 mt-1">
                                Temukan kenangan momen foto & video ibadah Sabat serta seluruh kegiatan gereja.
                            </p>
                        </div>

                        {/* Quick Stat Badge */}
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 self-start md:self-auto">
                            <Icon name="Image" className="w-5 h-5 text-gold-400" />
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-navy-200">Total Album</div>
                                <div className="text-base md:text-lg font-black text-white leading-none">{folders.length} Folder</div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar: Pencarian, Kategori, Tahun, Urutan */}
                    <div className="bg-white dark:bg-navy-900/60 p-3 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm space-y-2.5">
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                            {/* Kolom Pencarian */}
                            <div className="relative flex-1">
                                <Icon name="Search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Cari album (contoh: Sabat, KKR, Youth, Mei)..."
                                    className="w-full pl-10 pr-9 py-2.5 bg-navy-50/70 dark:bg-navy-800/60 border border-navy-200 dark:border-navy-700 rounded-xl text-xs md:text-sm font-medium text-navy-800 dark:text-navy-100 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 dark:hover:text-white"
                                    >
                                        <Icon name="X" className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Filter Kategori */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                                {[
                                    { id: 'all', label: 'Semua' },
                                    { id: 'sabat', label: 'Ibadah Sabat' },
                                    { id: 'event', label: 'Acara Khusus' },
                                    { id: 'youth', label: 'Pemuda & Anak' },
                                    { id: 'sosial', label: 'Bakti Sosial' },
                                ].map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategoryFilter(cat.id)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${categoryFilter === cat.id
                                            ? 'bg-navy-900 text-gold-400 shadow-sm'
                                            : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tombol Urutan */}
                            <button
                                onClick={() => setSortOrder(prev => (prev === 'latest' ? 'az' : 'latest'))}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-xl text-xs font-bold transition border border-navy-200/50 dark:border-navy-700 shrink-0"
                                title="Ganti Urutan"
                            >
                                <Icon name="Calendar" className="w-3.5 h-3.5 text-gold-500" />
                                <span>{sortOrder === 'latest' ? 'Terbaru' : 'Nama A-Z'}</span>
                            </button>
                        </div>

                        {/* Filter Tahun Album */}
                        {availableYears.length > 0 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none border-t border-navy-100 dark:border-navy-800/80 pt-2.5">
                                <span className="text-[11px] font-bold text-navy-400 dark:text-navy-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                                    <Icon name="Calendar" className="w-3.5 h-3.5 text-gold-500" /> Tahun:
                                </span>
                                <button
                                    onClick={() => setYearFilter('all')}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${yearFilter === 'all'
                                        ? 'bg-gold-500 text-navy-950 shadow-xs'
                                        : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700'}`}
                                >
                                    Semua ({processedFolders.length})
                                </button>
                                {availableYears.map(yr => {
                                    const count = processedFolders.filter(f => {
                                        if (f.parsedDate) return String(new Date(f.parsedDate).getFullYear()) === yr;
                                        const m = f.name.match(/\b(20\d{2})\b/);
                                        return m && m[1] === yr;
                                    }).length;
                                    return (
                                        <button
                                            key={yr}
                                            onClick={() => setYearFilter(yr)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${yearFilter === yr
                                                ? 'bg-gold-500 text-navy-950 shadow-xs'
                                                : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700'}`}
                                        >
                                            {yr} {count > 0 && <span className="opacity-75 text-[10px]">({count})</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Grid Kartu Album */}
                    {filteredFolders.length === 0 ? (
                        <div className="text-center py-16 bg-navy-50/50 dark:bg-navy-900/30 rounded-2xl border border-dashed border-navy-200 dark:border-navy-800 p-6">
                            <Icon name="Folder" className="w-12 h-12 mx-auto text-navy-300 dark:text-navy-600 mb-3" />
                            <h4 className="text-base font-bold text-navy-800 dark:text-navy-200">Tidak ada album ditemukan</h4>
                            <p className="text-xs text-navy-500 mt-1 max-w-sm mx-auto">
                                {searchQuery ? `Tidak ada album yang sesuai dengan "${searchQuery}". Coba kata kunci lain.` : 'Belum ada album di kategori ini.'}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 px-4 py-2 bg-navy-900 text-gold-400 text-xs font-bold rounded-xl"
                                >
                                    Reset Pencarian
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredFolders.map(folder => {
                                const cover = folder.coverUrl || folderCovers[folder.id];
                                return (
                                    <div
                                        key={folder.id}
                                        onClick={() => setSelectedFolderId(folder.id)}
                                        className="group bg-white dark:bg-navy-900 rounded-2xl overflow-hidden border border-navy-100 dark:border-navy-800 shadow-sm hover:shadow-xl hover:border-gold-300 dark:hover:border-gold-500/50 transition-all duration-300 cursor-pointer flex flex-col transform hover:-translate-y-1"
                                    >
                                        {/* Sampul / Cover Kartu */}
                                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy-950">
                                            {cover ? (
                                                <>
                                                    <img
                                                        src={formatImageUrl(cover)}
                                                        alt={folder.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        referrerPolicy="no-referrer"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                </>
                                            ) : (
                                                <div className={`w-full h-full bg-gradient-to-br ${folder.catInfo.cardBg} flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
                                                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                                                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-2 border border-white/15 text-gold-300 shadow-lg">
                                                        <Icon name={folder.catInfo.icon || 'Folder'} className="w-7 h-7" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Badge Kategori */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-sm ${folder.catInfo.badgeBg}`}>
                                                    {folder.catInfo.label}
                                                </span>
                                            </div>

                                            {/* Tanggal di Pojok Bawah Sampul */}
                                            {folder.dateLabel && (
                                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10">
                                                    <Icon name="Calendar" className="w-3.5 h-3.5 text-gold-400" />
                                                    <span>{folder.dateLabel}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Konten Judul & Aksi */}
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-navy-900 dark:text-white text-sm md:text-base line-clamp-2 leading-snug group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                                                    {folder.name}
                                                </h4>
                                                {!folder.dateLabel && (
                                                    <p className="text-[11px] text-navy-400 mt-1">Dokumentasi Acara</p>
                                                )}
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-navy-50 dark:border-navy-800 flex items-center justify-between text-xs font-bold text-gold-600 dark:text-gold-400">
                                                <span className="flex items-center gap-1.5 text-navy-500 dark:text-navy-400 text-[11px] font-medium">
                                                    <Icon name="Folder" className="w-3.5 h-3.5" /> Buka Album
                                                </span>
                                                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                    Lihat Foto <Icon name="ArrowRight" className="w-3.5 h-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ========== LEVEL 2: ISI ALBUM KEGIATAN ========== */}
            {selectedFolderId && (
                <div className="space-y-6 animate-fade-in">
                    {/* Header Navigasi Album */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-navy-900 p-4 md:p-5 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setSelectedFolderId('');
                                    setMedia([]);
                                    setMediaFilter('all');
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-navy-100 hover:bg-navy-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-white rounded-xl text-xs md:text-sm font-bold transition shadow-sm group"
                            >
                                <Icon name="ArrowLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span>Daftar Album</span>
                            </button>

                            <div className="h-6 w-px bg-navy-200 dark:bg-navy-700 hidden sm:block"></div>

                            <div>
                                <h3 className="text-base md:text-lg font-black text-navy-900 dark:text-white line-clamp-1">
                                    {activeFolder ? activeFolder.name : 'Album Kegiatan'}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-navy-500 dark:text-navy-400 mt-0.5">
                                    {activeFolder?.dateLabel && (
                                        <span className="flex items-center gap-1">
                                            <Icon name="Calendar" className="w-3.5 h-3.5 text-gold-500" />
                                            {activeFolder.dateLabel}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span>{loadingMedia ? 'Memuat media...' : `${media.length} media`}</span>
                                </div>
                            </div>
                        </div>

                        {/* Dropdown Pindah Album Cepat */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-navy-500 hidden lg:inline">Pindah Album:</label>
                            <select
                                value={selectedFolderId}
                                onChange={(e) => setSelectedFolderId(e.target.value)}
                                className="w-full md:w-auto px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-bold text-navy-800 dark:text-navy-100 focus:outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
                            >
                                {filteredFolders.map(f => (
                                    <option key={f.id} value={f.id}>
                                        📁 {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Sub-filter Bar (Semua | Foto | Video) */}
                    {!loadingMedia && media.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 dark:border-navy-800 pb-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setMediaFilter('all')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${mediaFilter === 'all'
                                        ? 'bg-navy-900 text-gold-400 shadow-sm'
                                        : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700'
                                        }`}
                                >
                                    Semua ({media.length})
                                </button>
                                <button
                                    onClick={() => setMediaFilter('image')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${mediaFilter === 'image'
                                        ? 'bg-navy-900 text-gold-400 shadow-sm'
                                        : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700'
                                        }`}
                                >
                                    Foto ({media.filter(m => m.type !== 'video').length})
                                </button>
                                <button
                                    onClick={() => setMediaFilter('video')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${mediaFilter === 'video'
                                        ? 'bg-navy-900 text-gold-400 shadow-sm'
                                        : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700'
                                        }`}
                                >
                                    Video ({media.filter(m => m.type === 'video').length})
                                </button>
                            </div>

                            <span className="text-xs text-navy-400 hidden sm:inline">
                                Klik foto untuk perbesar & unduh • Klik video untuk menonton
                            </span>
                        </div>
                    )}

                    {/* Konten Grid Media */}
                    {loadingMedia ? (
                        <div className="text-center py-16 bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800">
                            <div className="w-10 h-10 border-4 border-navy-100 border-t-gold-500 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-navy-600 dark:text-navy-300 font-bold text-sm">Memuat foto & video...</p>
                            <p className="text-navy-400 text-xs mt-1">Mengambil dokumentasi dari Google Drive</p>
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="text-center py-16 bg-navy-50/50 dark:bg-navy-900/30 rounded-2xl border border-dashed border-navy-200 dark:border-navy-800 p-6">
                            <Icon name="Image" className="w-12 h-12 mx-auto text-navy-300 dark:text-navy-600 mb-3" />
                            <h4 className="text-base font-bold text-navy-800 dark:text-navy-200">
                                {mediaFilter === 'all' ? 'Belum ada foto/video di album ini.' : `Tidak ada ${mediaFilter === 'video' ? 'video' : 'foto'} di album ini.`}
                            </h4>
                            {mediaFilter !== 'all' && (
                                <button
                                    onClick={() => setMediaFilter('all')}
                                    className="mt-3 px-4 py-2 bg-navy-900 text-gold-400 text-xs font-bold rounded-xl"
                                >
                                    Tampilkan Semua Media
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {filteredMedia.map(item => {
                                const isVideo = item.type === 'video';
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white dark:bg-navy-900 rounded-2xl shadow-sm border border-navy-100 dark:border-navy-800 overflow-hidden group cursor-pointer hover:shadow-lg transition-all relative flex flex-col"
                                    >
                                        {isVideo ? (
                                            <div
                                                onClick={() => setSelectedVideo(item)}
                                                className="relative w-full aspect-square bg-navy-950 overflow-hidden group"
                                            >
                                                <img
                                                    src={formatImageUrl(item.thumbnailUrl || item.url)}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                                {/* Badge Video */}
                                                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                                                    <Icon name="Video" className="w-3 h-3 text-gold-400" />
                                                    VIDEO
                                                </div>
                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-gold-500 text-navy-950 rounded-full p-3.5 shadow-xl transform group-hover:scale-110 transition-transform">
                                                        <Icon name="Play" className="w-6 h-6 ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="relative w-full aspect-square bg-navy-50 dark:bg-navy-950 overflow-hidden"
                                                onClick={() => {
                                                    const idx = imagesOnly.findIndex(img => img.id === item.id);
                                                    if (idx !== -1) setLightboxIndex(idx);
                                                }}
                                            >
                                                <img
                                                    src={formatImageUrl(item.url)}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    referrerPolicy="no-referrer"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-200">
                                                        <Icon name="Eye" className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Judul File */}
                                        {item.title && (
                                            <div className="p-2.5 bg-white dark:bg-navy-900 border-t border-navy-50 dark:border-navy-800">
                                                <p className="text-[11px] font-medium text-navy-700 dark:text-navy-300 truncate" title={item.title}>
                                                    {item.title}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
// --- PENCARIAN & HIGHLIGHT KATA KUNCI WARTA ---
export const highlightSearchText = (text, query) => {
    if (!text || !query || !query.trim()) return text;
    const trimmed = query.trim();
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = String(text).split(regex);
    if (parts.length <= 1) return text;
    return parts.map((part, i) =>
        regex.test(part) ? (
            <mark key={i} className="bg-amber-200 dark:bg-amber-800/80 text-navy-950 dark:text-amber-100 px-0.5 rounded font-bold">
                {part}
            </mark>
        ) : part
    );
};

// ========== WARTA PAGE PORTAL BERITA PROFESIONAL ==========
export const WartaPage = ({ daftarWarta, setActiveTab, selectedWarta, setSelectedWarta, setHideGlobalBack }) => {
    const [showGallery, setShowGallery] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [selectedCategory, setSelectedCategory] = React.useState('Semua');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [fontSizeLevel, setFontSizeLevel] = React.useState(0); // 0: normal, 1: large, 2: extra-large
    const [lightboxIndex, setLightboxIndex] = React.useState(null);
    const [lightboxImg, setLightboxImg] = React.useState(null);
    const [copiedLink, setCopiedLink] = React.useState(false);
    const [modalSlide, setModalSlide] = React.useState(0);
    const [imageErrors, setImageErrors] = React.useState({});
    const readingProgressBarRef = React.useRef(null);

    // Kesiapan Offline (PWA & Sanctuary Network)
    const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
    React.useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Fallback cache warta lokal jika offline / sinyal lemah di dalam gereja
    const effectiveWarta = React.useMemo(() => {
        let list = [];
        if (daftarWarta && daftarWarta.length > 0) {
            try {
                localStorage.setItem('PISGAH_OFFLINE_WARTA_CACHE', JSON.stringify(daftarWarta));
            } catch (e) { }
            list = daftarWarta;
        } else {
            try {
                const cached = localStorage.getItem('PISGAH_OFFLINE_WARTA_CACHE');
                if (cached) list = JSON.parse(cached);
            } catch (e) { }
        }
        // Jemaat publik hanya melihat warta yang jadwal tayangnya sudah tiba
        return (list || []).filter(w => isWartaPublished(w.tanggal));
    }, [daftarWarta]);

    const ITEMS_PER_PAGE = 8;

    React.useEffect(() => {
        if (setHideGlobalBack) setHideGlobalBack(true);
        return () => { if (setHideGlobalBack) setHideGlobalBack(false); };
    }, [setHideGlobalBack]);

    // Reset halaman saat filter berubah
    React.useEffect(() => {
        setCurrentPage(1);
    }, [effectiveWarta, selectedCategory, searchQuery]);

    // Reset slide & scroll ke atas saat membuka atau menutup berita
    React.useEffect(() => {
        setModalSlide(0);
        setLightboxIndex(null);
        setLightboxImg(null);
        scrollToTop();
    }, [selectedWarta]);

    // Reading Progress Listener saat membaca warta (langsung manipulasi DOM ref via rAF agar 0 re-render saat scrolling di mobile)
    React.useEffect(() => {
        if (!selectedWarta) {
            if (readingProgressBarRef.current) {
                readingProgressBarRef.current.style.width = '0%';
            }
            return;
        }
        let rafId = null;
        const updateProgress = () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                const bar = readingProgressBarRef.current;
                if (!bar) return;
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const pct = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
                bar.style.width = `${pct}%`;
            });
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
        return () => {
            window.removeEventListener('scroll', updateProgress);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [selectedWarta]);

    const handleImageError = (key) => {
        setImageErrors(prev => ({ ...prev, [key]: true }));
    };

    // --- FITUR BOOKMARK WARTA (OFFLINE READ LATER) ---
    const [bookmarkedIds, setBookmarkedIds] = React.useState(() => {
        try {
            const saved = localStorage.getItem('PISGAH_SAVED_WARTA');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const toggleBookmark = (rowIndex) => {
        setBookmarkedIds(prev => {
            const next = prev.includes(rowIndex) ? prev.filter(id => id !== rowIndex) : [...prev, rowIndex];
            try {
                localStorage.setItem('PISGAH_SAVED_WARTA', JSON.stringify(next));
            } catch (e) { }
            return next;
        });
    };

    // --- FITUR SUARA WARTA (TEXT-TO-SPEECH BAHASA INDONESIA) ---
    const WARTA_TTS_SPEEDS = [0.8, 0.9, 1, 1.15, 1.2];
    const [ttsState, setTtsState] = React.useState('idle'); // 'idle' | 'playing' | 'paused'
    const [ttsRate, setTtsRate] = React.useState(1);
    const ttsRateRef = React.useRef(1);
    ttsRateRef.current = ttsRate;

    React.useEffect(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setTtsState('idle');
    }, [selectedWarta]);

    const startWartaSpeech = (rate = ttsRateRef.current) => {
        if (!selectedWarta) return;
        window.speechSynthesis.cancel();
        const plainText = `${selectedWarta.judul}. Warta dari ${selectedWarta.penulis || 'Redaksi Warta Jemaat'}. ${stripHtml(selectedWarta.isi || '')}`;
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.lang = 'id-ID';
        utterance.rate = rate;

        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id'));
        if (idVoice) utterance.voice = idVoice;

        utterance.onend = () => setTtsState('idle');
        utterance.onerror = () => setTtsState('idle');

        window.speechSynthesis.speak(utterance);
        setTtsState('playing');
    };

    const handleToggleTTS = () => {
        if (!('speechSynthesis' in window)) {
            alert("Browser Anda belum mendukung fitur pembaca suara warta (Speech Synthesis).");
            return;
        }
        if (ttsState === 'playing') {
            window.speechSynthesis.pause();
            setTtsState('paused');
        } else if (ttsState === 'paused') {
            window.speechSynthesis.resume();
            setTtsState('playing');
        } else {
            startWartaSpeech(ttsRateRef.current);
        }
    };

    const handleToggleTtsRate = () => {
        setTtsRate(prev => {
            const curIdx = WARTA_TTS_SPEEDS.indexOf(prev);
            const next = WARTA_TTS_SPEEDS[(curIdx + 1) % WARTA_TTS_SPEEDS.length];
            ttsRateRef.current = next;
            if (ttsState === 'playing') {
                startWartaSpeech(next);
            }
            return next;
        });
    };

    const handleStopTTS = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setTtsState('idle');
    };

    // Helper format pesan warta resmi untuk dibagikan (Format WhatsApp Lengkap)
    const getWartaFormattedShareText = (warta) => {
        if (!warta) return '';
        const wartaUrl = getWartaShareUrl(warta);
        const plainText = stripHtml(warta.isi || '').replace(/\s+/g, ' ').trim().slice(0, 260);
        const title = warta.judul || 'Warta Jemaat PISGAH BISDAC';
        const dateStr = formatIndoDate(warta.tanggal);
        const author = warta.penulis || 'Redaksi';

        let text = `📰 *WARTA JEMAAT PISGAH BISDAC*\n*${title}*\n📅 ${dateStr} | ✍️ ${author}`;
        if (plainText) {
            text += `\n\n"${plainText}..."`;
        }
        text += `\n\n🔗 *Baca selengkapnya di portal resmi:*\n${wartaUrl}`;
        return text;
    };

    // --- FITUR SALIN FORMAT WHATSAPP CEPAT ---
    const [copiedQuote, setCopiedQuote] = React.useState(false);
    const handleCopyQuote = () => {
        if (!selectedWarta) return;
        const textMsg = getWartaFormattedShareText(selectedWarta);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textMsg).then(() => {
                setCopiedQuote(true);
                setTimeout(() => setCopiedQuote(false), 2500);
            });
        } else {
            window.prompt("Salin teks warta berikut:", textMsg);
        }
    };

    // Urutkan warta dari tanggal terbaru ke terlama
    const sortedWarta = React.useMemo(() => {
        return [...(effectiveWarta || [])].sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
    }, [effectiveWarta]);

    // Filter berdasarkan kategori & kata kunci pencarian
    const filteredWarta = React.useMemo(() => {
        return sortedWarta.filter(w => {
            if (selectedCategory === 'Tersimpan') {
                if (!bookmarkedIds.includes(w.rowIndex)) return false;
            } else if (selectedCategory !== 'Semua') {
                const info = parseWartaInfo(w);
                if (info.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
            }

            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            const inTitle = (w.judul || '').toLowerCase().includes(q);
            const inBody = (stripHtml(w.isi || '')).toLowerCase().includes(q);
            const inAuthor = (w.penulis || '').toLowerCase().includes(q);
            return inTitle || inBody || inAuthor;
        });
    }, [sortedWarta, selectedCategory, searchQuery, bookmarkedIds]);

    // Hitung total berita per kategori untuk badge tab
    const categoryCounts = React.useMemo(() => {
        const counts = { 'Semua': sortedWarta.length, 'Tersimpan': bookmarkedIds.length };
        WARTA_CATEGORIES.forEach(cat => { counts[cat] = 0; });
        sortedWarta.forEach(w => {
            const info = parseWartaInfo(w);
            counts[info.category] = (counts[info.category] || 0) + 1;
        });
        return counts;
    }, [sortedWarta, bookmarkedIds]);

    // Artikel Utama (Featured Hero): Tampilkan di tab "Semua" tanpa pencarian di halaman 1
    const isShowingFeatured = (selectedCategory === 'Semua') && !searchQuery.trim() && (currentPage === 1) && (filteredWarta.length > 0);
    const featuredWarta = isShowingFeatured ? filteredWarta[0] : null;
    const gridArticles = isShowingFeatured ? filteredWarta.slice(1) : filteredWarta;

    // Pagination
    const totalPages = Math.ceil(gridArticles.length / ITEMS_PER_PAGE);
    const paginatedWarta = React.useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return gridArticles.slice(start, end);
    }, [gridArticles, currentPage]);

    // Bersihkan HTML artikel warta di level komponen: paksa eager loading & auto decoding untuk semua gambar sisipan agar tidak blank/hilang saat scroll di mobile
    const cleanedArticleHtml = React.useMemo(() => {
        if (!selectedWarta?.isi) return '';
        return selectedWarta.isi
            .replace(/<img\b([^>]*)>/gi, (match, attrs) => {
                let newAttrs = attrs;
                if (!/loading=/i.test(newAttrs)) {
                    newAttrs += ' loading="eager"';
                } else {
                    newAttrs = newAttrs.replace(/loading=["'][^"']*["']/gi, 'loading="eager"');
                }
                if (!/decoding=/i.test(newAttrs)) {
                    newAttrs += ' decoding="auto"';
                } else {
                    newAttrs = newAttrs.replace(/decoding=["'][^"']*["']/gi, 'decoding="auto"');
                }
                return `<img${newAttrs}>`;
            });
    }, [selectedWarta?.isi]);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fungsi Berbagi Cerdas (Native Web Share dengan Fallback WhatsApp) - Menggunakan format WhatsApp resmi yang rapi & lengkap
    const handleSmartShare = async (title, customText) => {
        if (!selectedWarta) return;
        const textMsg = customText || getWartaFormattedShareText(selectedWarta);
        const shareTitle = selectedWarta.judul || title || 'Warta Jemaat PISGAH BISDAC';

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: textMsg
                });
                return;
            } catch (err) {
                if (err.name === 'AbortError') return;
            }
        }
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`, '_blank');
    };

    const handleShareWA = () => {
        if (!selectedWarta) return;
        const textMsg = getWartaFormattedShareText(selectedWarta);
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`, '_blank');
    };

    const handleCopyLink = () => {
        try {
            const shareUrl = getWartaShareUrl(selectedWarta);
            navigator.clipboard.writeText(shareUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2500);
        } catch (e) { }
    };

    // Halaman Galeri Dokumentasi Terpisah
    if (showGallery) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white dark:bg-navy-900 p-4 rounded-[1.5rem] shadow-sm border border-navy-100 dark:border-navy-800">
                    <div className="flex items-center gap-3 ml-2">
                        <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center">
                            <Icon name="Image" className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-navy-900 dark:text-gold-400">Galeri Dokumentasi Jemaat</h2>
                            <p className="text-xs text-navy-500 dark:text-navy-400">Arsip foto momen pelayanan dan kegiatan</p>
                        </div>
                    </div>
                    <button onClick={() => setShowGallery(false)} className="bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-700 dark:text-gold-300 px-4 py-2 rounded-xl font-bold transition flex items-center shadow-sm">
                        <Icon name="ArrowLeft" className="w-4 h-4 mr-2" /> Kembali ke Warta
                    </button>
                </div>
                <div className="glass-box rounded-[1.5rem] p-6 shadow-sm border border-navy-100/60 dark:border-navy-800">
                    <GaleriPublik />
                </div>
            </div>
        );
    }

    // ==============================================================
    // TAMPILAN HALAMAN DETAIL BACA BERITA (NEWS ARTICLE READER VIEW)
    // ==============================================================
    if (selectedWarta) {
        const info = parseWartaInfo(selectedWarta);
        const rawUrls = parseGambarUrls(selectedWarta.gambarUrl);
        const safeUrls = rawUrls.map(u => formatImageUrl(u)).filter(u => u.startsWith('http') || u.startsWith('data:image'));

        // Artikel Rekomendasi / Terkait (ambil 3 artikel lain selain yang sedang dibaca)
        const relatedWarta = sortedWarta.filter(w => w.rowIndex !== selectedWarta.rowIndex).slice(0, 3);

        const fontSizeClass = fontSizeLevel === 2
            ? 'text-xl md:text-2xl leading-loose'
            : (fontSizeLevel === 1 ? 'text-lg md:text-xl leading-relaxed' : 'text-base md:text-lg leading-relaxed');

        return (
            <div className="space-y-6 animate-fade-in pb-16 max-w-5xl mx-auto">
                {/* Top Action Bar & Breadcrumbs (Sleek, Compact, Single-Row di Mobile & Desktop) */}
                <div className="liquid-glass-box px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl flex items-center justify-between gap-2 sticky top-16 md:top-[4.5rem] z-40 transition-all relative warta-no-print print:hidden no-print shadow-sm">
                    {/* Reading Progress Indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-navy-100/70 dark:bg-navy-800/80 rounded-b-2xl overflow-hidden pointer-events-none">
                        <div
                            ref={readingProgressBarRef}
                            className="h-full bg-gradient-to-r from-gold-500 via-amber-400 to-gold-300 transition-[width] duration-75 ease-out"
                            style={{ width: '0%' }}
                        />
                    </div>

                    {/* Sisi Kiri: Tombol Kembali & Breadcrumb */}
                    <div className="flex items-center gap-2 min-w-0 shrink-0">
                        <button
                            onClick={() => setSelectedWarta(null)}
                            className="bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-gold-300 border border-navy-200/80 dark:border-navy-700/80 hover:border-gold-500/50 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs flex items-center shrink-0 active:scale-95 group"
                        >
                            <Icon name="ArrowLeft" className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="hidden xs:inline">Semua Warta</span>
                            <span className="xs:hidden">Kembali</span>
                        </button>
                        <div className="hidden lg:flex items-center text-xs text-navy-400 dark:text-navy-500 truncate">
                            <span className="cursor-pointer hover:underline" onClick={() => setSelectedWarta(null)}>Warta</span>
                            <span className="mx-1.5">/</span>
                            <span className="font-semibold text-navy-600 dark:text-gold-400/80">{info.category}</span>
                        </div>
                    </div>

                    {/* Sisi Kanan: Action Buttons Baris Tunggal Rapi (Tidak Melipat ke Baris Baru) */}
                    <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto hide-scrollbar py-0.5 ml-auto shrink-0">
                        {/* Tombol Suara (Text-to-Speech) */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleToggleTTS}
                                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1 text-xs font-bold ${ttsState === 'playing' ? 'bg-gold-500 text-white animate-pulse' : (ttsState === 'paused' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-700 dark:text-gold-300')}`}
                                title={ttsState === 'playing' ? "Jeda Pembacaan Warta" : (ttsState === 'paused' ? "Lanjutkan Pembacaan Warta" : "Dengarkan Warta (Suara Bahasa Indonesia)")}
                            >
                                <Icon name={ttsState === 'playing' ? "Pause" : "Volume2"} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${ttsState === 'playing' ? 'text-white' : 'text-gold-500'}`} />
                                <span className="hidden md:inline">{ttsState === 'playing' ? 'Jeda' : (ttsState === 'paused' ? 'Lanjut' : 'Dengarkan')}</span>
                            </button>
                            {/* Tombol Kecepatan Suara Warta */}
                            <button
                                onClick={handleToggleTtsRate}
                                className="px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-xl bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-700 dark:text-gold-300 font-black text-[11px] sm:text-xs transition shadow-2xs"
                                title="Ubah Kecepatan Suara Warta (0.8x, 0.9x, 1x, 1.15x, 1.2x)"
                            >
                                {ttsRate}x
                            </button>
                            {ttsState !== 'idle' && (
                                <button
                                    onClick={handleStopTTS}
                                    className="p-1.5 sm:p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 transition shadow-2xs"
                                    title="Hentikan Pembacaan"
                                >
                                    <Icon name="Square" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Tombol Simpan Warta (Bookmark) */}
                        <button
                            onClick={() => toggleBookmark(selectedWarta.rowIndex)}
                            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1 text-xs font-bold ${bookmarkedIds.includes(selectedWarta.rowIndex) ? 'bg-amber-500 text-white' : 'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-600 dark:text-gold-300'}`}
                            title={bookmarkedIds.includes(selectedWarta.rowIndex) ? "Hapus dari Warta Tersimpan" : "Simpan Warta untuk Dibaca Nanti"}
                        >
                            <Icon name="Bookmark" className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${bookmarkedIds.includes(selectedWarta.rowIndex) ? 'fill-current' : ''}`} />
                            <span className="hidden lg:inline">{bookmarkedIds.includes(selectedWarta.rowIndex) ? 'Tersimpan' : 'Simpan'}</span>
                        </button>

                        {/* Tombol Salin Format WA (Di Desktop / Tablet) */}
                        <button
                            onClick={handleCopyQuote}
                            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition shadow-2xs items-center gap-1 text-xs font-bold hidden sm:flex ${copiedQuote ? 'bg-emerald-600 text-white' : 'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-600 dark:text-gold-300'}`}
                            title="Salin Teks Format WhatsApp untuk Status / Grup"
                        >
                            <Icon name="MessageCircle" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="hidden lg:inline">{copiedQuote ? 'Tersalin' : 'Format WA'}</span>
                        </button>

                        {/* Pengatur Ukuran Huruf (A- / A+) */}
                        <div className="flex items-center bg-navy-50 dark:bg-navy-800/80 rounded-xl p-0.5 sm:p-1 border border-navy-200/50 dark:border-navy-700/50 text-[11px] sm:text-xs" title="Ukuran Teks Berita">
                            <button
                                onClick={() => setFontSizeLevel(p => Math.max(0, p - 1))}
                                disabled={fontSizeLevel === 0}
                                className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg font-bold transition ${fontSizeLevel === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-navy-700 text-navy-700 dark:text-gold-300'}`}
                            >
                                A-
                            </button>
                            <button
                                onClick={() => setFontSizeLevel(p => Math.min(2, p + 1))}
                                disabled={fontSizeLevel === 2}
                                className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg font-bold transition ${fontSizeLevel === 2 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-navy-700 text-navy-700 dark:text-gold-300'}`}
                            >
                                A+
                            </button>
                        </div>

                        {/* Tombol Cetak (Tablet & Desktop) */}
                        <button
                            onClick={() => window.print()}
                            className="p-1.5 sm:p-2 bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-600 dark:text-gold-300 rounded-xl transition shadow-2xs hidden md:flex items-center"
                            title="Cetak Berita (Format Buletin Resmi)"
                        >
                            <Icon name="Printer" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        {/* Tombol Salin Link (Tablet & Desktop) */}
                        <button
                            onClick={handleCopyLink}
                            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition shadow-2xs items-center gap-1 text-xs font-bold hidden sm:flex ${copiedLink ? 'bg-emerald-600 text-white' : 'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-600 dark:text-gold-300'}`}
                            title="Salin Tautan"
                        >
                            {copiedLink ? <Icon name="CheckCircle" className="w-3.5 h-3.5 text-white" /> : <Icon name="Copy" className="w-3.5 h-3.5" />}
                            {copiedLink && <span className="hidden lg:inline text-[11px]">Tersalin</span>}
                        </button>

                        {/* Tombol Share Cerdas (Native Web Share / WA) */}
                        <button
                            onClick={() => handleSmartShare(info.cleanTitle)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 shadow-2xs shrink-0 active:scale-95"
                            title="Bagikan Warta"
                        >
                            <Icon name="Share2" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Bagikan</span>
                        </button>
                    </div>
                </div>

                {/* Article Header Card */}
                <article className="bg-white dark:bg-navy-900 rounded-[1.75rem] p-6 sm:p-8 md:p-10 shadow-sm border border-navy-100/80 dark:border-navy-800 relative warta-article-print">
                    {/* Print Header: Official Church Masthead (Hanya muncul saat dicetak) */}
                    <div className="hidden print:block border-b-2 border-black pb-4 mb-6 text-center">
                        <h2 className="text-xl font-black uppercase tracking-wider text-black">GEREJA MASEHI ADVENT HARI KETUJUH</h2>
                        <h3 className="text-base font-bold text-gray-900">JEMAAT PISGAH BATAM (PISGAH BISDAC)</h3>
                        <p className="text-xs text-gray-600 mt-0.5">Buletin Resmi Warta Jemaat & Kabar Pelayanan</p>
                        <div className="flex justify-between items-center text-[10px] text-gray-600 mt-3 pt-2 border-t border-gray-300">
                            <span>Tanggal: {formatIndoDate(selectedWarta.tanggal)}</span>
                            <span>Kategori: {info.category}</span>
                            <span>Penulis: {selectedWarta.penulis || 'Redaksi Warta'}</span>
                        </div>
                    </div>
                    {/* Category Pill & Reading Time */}
                    <div className="flex flex-wrap items-center gap-2.5 mb-4">
                        <span className={`text-[11px] md:text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full border shadow-xs ${info.categoryStyle.bg}`}>
                            {info.category}
                        </span>
                        <span className="text-xs font-semibold text-navy-500 dark:text-navy-400 flex items-center bg-navy-50 dark:bg-navy-800 px-3 py-1.5 rounded-full">
                            <Icon name="Clock" className="w-3.5 h-3.5 mr-1.5 text-gold-500" />
                            {info.readingTime}
                        </span>
                    </div>

                    {/* Headline Title */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-navy-950 dark:text-gold-400 leading-[1.2] tracking-tight mb-6">
                        {info.cleanTitle}
                    </h1>

                    {/* Byline Metadata Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-5 rounded-2xl bg-navy-50/70 dark:bg-navy-950/60 border border-navy-100 dark:border-navy-800/80 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-navy-900 text-white font-black text-sm flex items-center justify-center shadow-sm">
                                {(selectedWarta.penulis || 'Redaksi').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-navy-900 dark:text-gold-300">
                                    {selectedWarta.penulis || 'Redaksi Warta Jemaat'}
                                </p>
                                <p className="text-[11px] text-navy-500 dark:text-navy-400">
                                    PISGAH BISDAC Publishing
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center text-xs font-semibold text-navy-600 dark:text-navy-300 gap-1.5">
                            <Icon name="Calendar" className="w-4 h-4 text-gold-500" />
                            <span>{formatIndoDate(selectedWarta.tanggal)}</span>
                        </div>
                    </div>

                    {/* Featured Photo / Image Carousel Showcase */}
                    {safeUrls.length > 0 && (
                        <div className="space-y-3 mb-10 print:mb-6">
                            <div className="relative w-full rounded-2xl overflow-hidden bg-navy-950 h-[240px] sm:h-[320px] md:h-[400px] max-h-[420px] shadow-md border border-navy-100 dark:border-navy-800 group print:bg-white print:border-none print:shadow-none print:h-auto print:max-h-[380px]">
                                <div className="flex transition-transform duration-500 ease-out h-full print:block" style={{ transform: `translateX(-${modalSlide * 100}%)` }}>
                                    {safeUrls.map((url, idx) => (
                                        <div key={idx} className={`w-full h-full flex-shrink-0 relative flex items-center justify-center bg-navy-950 overflow-hidden print:bg-white print:h-auto ${idx !== modalSlide ? 'print:hidden' : ''}`}>
                                            {!imageErrors[`detail-${idx}`] ? (
                                                <>
                                                    {/* Ambient blurred backdrop */}
                                                    <img
                                                        src={url}
                                                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none print:hidden"
                                                        alt=""
                                                        aria-hidden="true"
                                                    />
                                                    <img
                                                        src={url}
                                                        className="relative z-10 max-h-full w-auto h-full object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.01] print:max-h-[340px] print:mx-auto print:rounded-xl print:border print:border-navy-100"
                                                        alt={`${info.cleanTitle} - Gambar ${idx + 1}`}
                                                        onError={(e) => {
                                                            handleImageErrorFallback(e, url);
                                                            if (e.target && e.target.dataset && e.target.dataset.triedFallback === '2') {
                                                                handleImageError(`detail-${idx}`);
                                                            }
                                                        }}
                                                        onClick={() => setLightboxIndex(idx)}
                                                        referrerPolicy="no-referrer"
                                                    />
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-red-400 bg-red-50 dark:bg-navy-950 print:hidden">
                                                    <span className="text-sm font-medium">Gambar gagal dimuat</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Lightbox Zoom Pill Overlay */}
                                <button
                                    onClick={() => setLightboxIndex(modalSlide)}
                                    className="absolute bottom-4 right-4 bg-navy-900/80 hover:bg-navy-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow transition print:hidden"
                                >
                                    <Icon name="ZoomIn" className="w-3.5 h-3.5 text-gold-400" /> Perbesar Foto
                                </button>

                                {/* Slide Counter Badge */}
                                {safeUrls.length > 1 && (
                                    <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-md print:hidden">
                                        {modalSlide + 1} / {safeUrls.length}
                                    </div>
                                )}

                                {/* Navigation Arrows */}
                                {safeUrls.length > 1 && (
                                    <div className="print:hidden">
                                        <button
                                            onClick={() => setModalSlide(p => (p === 0 ? safeUrls.length - 1 : p - 1))}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-navy-900/90 hover:bg-white text-navy-900 dark:text-gold-400 p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                                            title="Foto Sebelumnya"
                                        >
                                            <Icon name="ChevronLeft" className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setModalSlide(p => (p + 1) % safeUrls.length)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-navy-900/90 hover:bg-white text-navy-900 dark:text-gold-400 p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                                            title="Foto Selanjutnya"
                                        >
                                            <Icon name="ChevronRight" className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Filmstrip Thumbnails (jika ada lebih dari 1 foto) */}
                            {safeUrls.length > 1 && (
                                <div className="flex gap-2.5 overflow-x-auto pb-1 hide-scrollbar print:hidden">
                                    {safeUrls.map((url, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setModalSlide(idx)}
                                            className={`relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${modalSlide === idx ? 'border-gold-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={url} className="w-full h-full object-cover" alt="thumbnail" referrerPolicy="no-referrer" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Article Body Content */}
                    <div
                        className={`prose max-w-none text-navy-800 dark:text-white warta-content pt-2 ${fontSizeClass}`}
                        onClick={(e) => {
                            if (e.target && e.target.tagName === 'IMG' && e.target.src) {
                                setLightboxImg(e.target.src);
                            }
                        }}
                        dangerouslySetInnerHTML={{ __html: cleanedArticleHtml }}
                    />

                    {/* Redaksi Signature & Sharing Bar */}
                    <div className="mt-12 pt-8 border-t border-navy-100 dark:border-navy-800 space-y-6 warta-no-print print:hidden no-print">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-navy-50 to-gold-50/30 dark:from-navy-950 dark:to-navy-900 border border-navy-100 dark:border-navy-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center font-black text-xl shadow-sm">
                                    P
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-navy-900 dark:text-gold-400 text-sm">Redaksi Warta Jemaat</h4>
                                    <p className="text-xs text-navy-500 dark:text-navy-400">GMAHK Jemaat Pisgah Batam International Seventh-Day Adventist Church</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleSmartShare(info.cleanTitle)} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                                    <Icon name="Share2" className="w-4 h-4" /> Bagikan Warta
                                </button>
                                <button onClick={handleCopyLink} className="px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                                    <Icon name="Copy" className="w-4 h-4" /> Salin Link
                                </button>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Section Warta Lainnya (Related Stories) */}
                {relatedWarta.length > 0 && (
                    <div className="mt-12 space-y-5 warta-no-print print:hidden no-print">
                        <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
                            <h3 className="text-xl font-extrabold text-navy-900 dark:text-gold-400 flex items-center gap-2">
                                <Icon name="BookOpen" className="w-5 h-5 text-gold-500" /> Warta Terkini Lainnya
                            </h3>
                            <button
                                onClick={() => { setSelectedWarta(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-navy-800/90 text-navy-800 dark:text-gold-300 border border-navy-200/80 dark:border-navy-700/80 hover:border-gold-500/60 dark:hover:border-gold-500/60 hover:bg-gold-50/80 dark:hover:bg-navy-700/80 hover:text-gold-600 dark:hover:text-gold-400 font-extrabold text-xs shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 group backdrop-blur-md"
                            >
                                <span>Lihat Semua</span>
                                <Icon name="ChevronRight" className="w-3.5 h-3.5 text-gold-500 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {relatedWarta.map((item) => {
                                const itemInfo = parseWartaInfo(item);
                                const itemUrls = parseGambarUrls(item.gambarUrl).map(u => formatImageUrl(u)).filter(u => u.startsWith('http') || u.startsWith('data:image'));
                                const itemThumb = itemUrls.length > 0 ? itemUrls[0] : null;

                                return (
                                    <div
                                        key={item.rowIndex}
                                        onClick={() => { setSelectedWarta(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-navy-100 dark:border-navy-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                                    >
                                        <div className="aspect-video rounded-xl overflow-hidden bg-navy-50 dark:bg-navy-950 mb-3 relative">
                                            {itemThumb ? (
                                                <img src={itemThumb} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={itemInfo.cleanTitle} referrerPolicy="no-referrer" onError={(e) => handleImageErrorFallback(e, itemThumb)} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-navy-300 dark:text-navy-700">
                                                    <Icon name="Image" className="w-8 h-8 opacity-40" />
                                                </div>
                                            )}
                                            {/* Penulis di posisi kiri sampul */}
                                            <div className="absolute top-2 left-2 bg-white/95 dark:bg-navy-900/90 text-navy-800 dark:text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-black/5 dark:border-white/10">
                                                <Icon name="User" className="w-2.5 h-2.5 text-gold-500 shrink-0" />
                                                <span className="truncate max-w-[90px]">{item.penulis || 'Redaksi'}</span>
                                            </div>
                                            {/* Kategori di posisi kanan sampul */}
                                            <span className={`absolute top-2 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs ${itemInfo.categoryStyle.bg} border border-black/5 dark:border-white/10`}>
                                                {itemInfo.category}
                                            </span>
                                        </div>
                                        {/* Tanggal terbit di bawah gambar sampul thumbnail */}
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-navy-500 dark:text-gold-400/80 mb-1.5">
                                            <Icon name="Calendar" className="w-3 h-3 text-gold-500 shrink-0" />
                                            <span>{formatIndoDateTime(item.tanggal)}</span>
                                        </div>
                                        <h4 className="font-bold text-sm text-navy-900 dark:text-gold-300 group-hover:text-gold-600 line-clamp-2 leading-snug mb-1.5">
                                            {itemInfo.cleanTitle}
                                        </h4>
                                        <p className="text-[11px] text-navy-500 dark:text-navy-400 line-clamp-2 leading-relaxed mb-3 flex-1">
                                            {itemInfo.excerpt}
                                        </p>
                                        <div className="mt-auto pt-2 border-t border-navy-50 dark:border-navy-800/80 flex items-center justify-between text-[10px] text-navy-400">
                                            <span>{formatIndoDateShort(item.tanggal)}</span>
                                            <span className="font-bold text-gold-600 dark:text-gold-400 flex items-center gap-0.5">Baca <Icon name="ChevronRight" className="w-3 h-3" /></span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Lightbox Modal (Full-Screen Image Zoom Dimount ke document.body) */}
                {lightboxIndex !== null && safeUrls[lightboxIndex] && createPortal(
                    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-fade-in">
                        <div className="flex justify-between items-center text-white">
                            <span className="text-sm font-semibold text-white/80">
                                Foto {lightboxIndex + 1} dari {safeUrls.length}
                            </span>
                            <button
                                onClick={() => setLightboxIndex(null)}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xl transition"
                            >
                                <Icon name="X" className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center relative p-2">
                            <img
                                src={safeUrls[lightboxIndex]}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                                alt="Perbesar Foto"
                                referrerPolicy="no-referrer"
                            />

                            {safeUrls.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setLightboxIndex(p => (p === 0 ? safeUrls.length - 1 : p - 1))}
                                        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                                    >
                                        <Icon name="ChevronLeft" className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => setLightboxIndex(p => (p + 1) % safeUrls.length)}
                                        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                                    >
                                        <Icon name="ChevronRight" className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="text-center text-white/60 text-xs">
                            Tekan tombol silang atau area luar untuk kembali
                        </div>
                    </div>,
                    document.body
                )}

                {/* Lightbox Modal untuk Gambar Sisipan Artikel */}
                {lightboxImg && createPortal(
                    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-fade-in" onClick={() => setLightboxImg(null)}>
                        <div className="flex justify-between items-center text-white" onClick={(e) => e.stopPropagation()}>
                            <span className="text-sm font-semibold text-white/80">
                                Perbesar Gambar Sisipan
                            </span>
                            <button
                                onClick={() => setLightboxImg(null)}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xl transition"
                                title="Tutup"
                            >
                                <Icon name="X" className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center relative p-2" onClick={() => setLightboxImg(null)}>
                            <img
                                src={lightboxImg}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                alt="Perbesar Gambar Sisipan"
                                referrerPolicy="no-referrer"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className="text-center text-white/60 text-xs">
                            Tekan tombol silang atau area luar untuk kembali
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        );
    }

    // ==============================================================
    // TAMPILAN BERANDA PORTAL BERITA (NEWSROOM HOMEPAGE GRID & HERO)
    // ==============================================================
    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in relative pb-16">
            {/* STICKY TOP BAR: TOMBOL KEMBALI + FILTER KATEGORI */}
            <div className="sticky top-16 md:top-[4.5rem] z-[35] rounded-2xl px-3 sm:px-4 py-2.5 liquid-glass-header transition-all print:hidden no-print flex items-center gap-2.5 sm:gap-3 shadow-sm border border-navy-100/50 dark:border-navy-700/50">
                <button
                    onClick={() => {
                        if (window.history.length > 1) {
                            window.history.back();
                        } else {
                            setActiveTab('home');
                        }
                    }}
                    className="flex items-center justify-center px-3.5 py-2 rounded-xl liquid-glass-pill text-navy-700 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white font-extrabold transition-all gap-1.5 group shrink-0 shadow-xs"
                    title="Kembali ke Halaman Sebelumnya"
                >
                    <Icon name="ArrowLeft" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-xs sm:text-sm">Kembali</span>
                </button>

                <div className="h-6 w-px bg-navy-200/60 dark:bg-navy-700/60 shrink-0" />

                {/* Filter Kategori Navigation Pills (Horizontal Scroll) */}
                <div className="flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar py-0.5 min-w-0">
                    <button
                        onClick={() => setSelectedCategory('Semua')}
                        className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${selectedCategory === 'Semua' ? 'bg-navy-900 dark:bg-gold-500 text-gold-400 dark:text-navy-950 shadow-xs scale-102' : 'text-navy-700 dark:text-navy-300 hover:bg-navy-100/70 dark:hover:bg-navy-800/80 bg-white/60 dark:bg-navy-900/60 border border-navy-200/60 dark:border-navy-700/60'}`}
                    >
                        <span>Semua Berita</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedCategory === 'Semua' ? 'bg-gold-500/20 text-gold-300 dark:bg-navy-900/20 dark:text-navy-950' : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400'}`}>
                            {categoryCounts['Semua'] || 0}
                        </span>
                    </button>

                    {WARTA_CATEGORIES.map((cat) => {
                        const count = categoryCounts[cat] || 0;
                        const isActive = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${isActive ? 'bg-navy-900 dark:bg-gold-500 text-gold-400 dark:text-navy-950 shadow-xs scale-102' : 'text-navy-700 dark:text-navy-300 hover:bg-navy-100/70 dark:hover:bg-navy-800/80 bg-white/60 dark:bg-navy-900/60 border border-navy-200/60 dark:border-navy-700/60'}`}
                            >
                                <span>{cat}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-gold-500/20 text-gold-300 dark:bg-navy-900/20 dark:text-navy-950' : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}

                    {/* Tab Warta Tersimpan (Bookmark Offline) */}
                    <button
                        onClick={() => setSelectedCategory('Tersimpan')}
                        className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${selectedCategory === 'Tersimpan' ? 'bg-amber-500 dark:bg-amber-400 text-white dark:text-navy-950 shadow-xs scale-102' : 'text-amber-700 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-navy-800/80 bg-white/60 dark:bg-navy-900/60 border border-amber-200/60 dark:border-navy-700/60'}`}
                    >
                        <Icon name="Bookmark" className={`w-3.5 h-3.5 ${selectedCategory === 'Tersimpan' ? 'fill-current' : ''}`} />
                        <span>Tersimpan</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedCategory === 'Tersimpan' ? 'bg-black/20 text-white dark:text-navy-950' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'}`}>
                            {categoryCounts['Tersimpan'] || 0}
                        </span>
                    </button>
                </div>
            </div>
            {/* OFFLINE INDICATOR BANNER */}
            {isOffline && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Icon name="WifiOff" className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-bold">Mode Offline Aktif</span>
                            <p className="text-[11px] opacity-80">Anda sedang mengakses warta yang tersimpan di perangkat. Tetap terbaca lancar di dalam gedung gereja.</p>
                        </div>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-900 dark:text-amber-200 px-2.5 py-1 rounded-full font-black uppercase shrink-0">
                        Tersimpan Lokal
                    </span>
                </div>
            )}

            {/* PORTAL MASTHEAD & EDITORIAL HEADER */}
            <header className="bg-gradient-to-br from-navy-950 via-navy-900 to-[#172554] rounded-[1.75rem] p-6 sm:p-8 md:p-10 shadow-lg text-white relative overflow-hidden border border-navy-800/80">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-gold-500 text-navy-950 font-black text-[10px] md:text-xs uppercase tracking-widest px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                                <Icon name="Sparkles" className="w-3.5 h-3.5" /> Portal Resmi Jemaat
                            </span>
                            <span className="text-gold-200/80 text-xs font-semibold">
                                {formatIndoDate(new Date())}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                            Warta & Kabar Pelayanan
                        </h1>
                        <p className="text-xs sm:text-sm text-navy-200 font-medium leading-relaxed">
                            Buletin resmi ibadah, informasi kegiatan pelayanan, renungan rohani, dan seputar kabar jemaat PISGAH BISDAC.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                        {/* Tombol Akses Galeri Dokumentasi */}
                        <button
                            onClick={() => setShowGallery(true)}
                            className="bg-white/10 hover:bg-white/20 text-gold-300 hover:text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 border border-white/10 backdrop-blur-sm shadow-sm"
                        >
                            <Icon name="Image" className="w-4 h-4 text-gold-400" />
                            <span>Galeri Foto</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar & Instant Filter */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari judul berita, topik kegiatan, pengumuman, atau penulis..."
                            className="w-full bg-navy-900/90 text-white placeholder-navy-400 px-4 py-3.5 pl-11 pr-10 rounded-xl text-sm border border-white/15 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition shadow-inner"
                        />
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-400">
                            <Icon name="Search" className="w-4 h-4" />
                        </span>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white p-1"
                            >
                                <Icon name="X" className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* STATUS FILTER / HASIL PENCARIAN */}
            {(selectedCategory !== 'Semua' || searchQuery.trim()) && (
                <div className="flex items-center justify-between text-xs text-navy-600 dark:text-navy-300 px-2">
                    <p>
                        Menampilkan <strong>{filteredWarta.length}</strong> warta
                        {selectedCategory !== 'Semua' && <span> dalam kategori <strong>"{selectedCategory}"</strong></span>}
                        {searchQuery.trim() && <span> dengan kata kunci <strong>"{searchQuery}"</strong></span>}
                    </p>
                    <button
                        onClick={() => { setSelectedCategory('Semua'); setSearchQuery(''); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 dark:bg-navy-800/90 text-gold-600 dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-navy-700 border border-navy-200/80 dark:border-navy-700 font-extrabold text-xs shadow-xs hover:shadow transition-all active:scale-95 shrink-0"
                    >
                        <Icon name="RotateCcw" className="w-3 h-3" />
                        <span>Reset Filter</span>
                    </button>
                </div>
            )}

            {/* EMPTY STATE */}
            {filteredWarta.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white dark:bg-navy-900 rounded-[1.75rem] border border-dashed border-navy-200 dark:border-navy-800 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-navy-50 dark:bg-navy-800 text-navy-400 flex items-center justify-center mx-auto mb-4">
                        <Icon name={selectedCategory === 'Tersimpan' ? "Bookmark" : "Search"} className="w-8 h-8 opacity-60 text-gold-500" />
                    </div>
                    <h3 className="text-lg font-bold text-navy-900 dark:text-gold-400 mb-1">
                        {selectedCategory === 'Tersimpan' ? 'Belum Ada Warta yang Disimpan' : 'Tidak Ada Warta yang Ditemukan'}
                    </h3>
                    <p className="text-xs text-navy-500 dark:text-navy-400 max-w-sm mx-auto mb-5">
                        {selectedCategory === 'Tersimpan'
                            ? 'Klik ikon bookmark pada warta atau renungan apa saja untuk menyimpannya di sini agar mudah dibaca kembali bahkan tanpa internet.'
                            : 'Coba gunakan kata kunci pencarian yang lain atau pilih kategori berita yang berbeda.'}
                    </p>
                    <button
                        onClick={() => { setSelectedCategory('Semua'); setSearchQuery(''); }}
                        className="bg-navy-900 hover:bg-navy-800 text-gold-400 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
                    >
                        Tampilkan Semua Warta
                    </button>
                </div>
            ) : (
                <>
                    {/* FEATURED HEADLINE HERO (BERITA UTAMA BESAR) */}
                    {featuredWarta && (() => {
                        const featInfo = parseWartaInfo(featuredWarta);
                        const featUrls = parseGambarUrls(featuredWarta.gambarUrl).map(u => formatImageUrl(u)).filter(u => u.startsWith('http') || u.startsWith('data:image'));
                        const featThumb = featUrls.length > 0 ? featUrls[0] : null;

                        return (
                            <section
                                onClick={() => setSelectedWarta(featuredWarta)}
                                className="bg-white dark:bg-navy-900 rounded-[1.75rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-navy-100/90 dark:border-navy-800 group cursor-pointer"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                                    {/* Cover Visual Proporsional (5 Kolom di Desktop, Max Height Dibatasi) */}
                                    <div className="lg:col-span-5 relative h-[210px] sm:h-[250px] md:h-[280px] lg:h-full lg:min-h-[280px] lg:max-h-[320px] bg-navy-950 overflow-hidden flex items-center justify-center">
                                        {featThumb ? (
                                            <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-navy-950">
                                                {/* Ambient Blurred Backdrop agar proporsi foto apapun tampil rapi & elegan */}
                                                <img
                                                    src={featThumb}
                                                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                                                    alt=""
                                                    aria-hidden="true"
                                                />
                                                <img
                                                    src={featThumb}
                                                    className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                    alt={featInfo.cleanTitle}
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => handleImageErrorFallback(e, featThumb)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full min-h-[210px] flex flex-col items-center justify-center text-navy-400 bg-gradient-to-br from-navy-900 to-navy-950">
                                                <Icon name="Image" className="w-14 h-14 opacity-30 mb-2" />
                                                <span className="text-xs font-bold uppercase tracking-widest text-navy-500">Warta Pisgah BISDAC</span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden pointer-events-none"></div>

                                        {/* Floating Badge Berita Utama */}
                                        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                                            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
                                                <span className="w-2 h-2 rounded-full bg-white"></span> Berita Utama
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md ${featInfo.categoryStyle.badge}`}>
                                                {featInfo.category}
                                            </span>
                                        </div>

                                        {featUrls.length > 1 && (
                                            <div className="absolute top-4 right-4 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 z-10">
                                                <Icon name="Image" className="w-3.5 h-3.5" /> +{featUrls.length - 1} Foto
                                            </div>
                                        )}
                                    </div>

                                    {/* Text Info Hero Berita (7 Kolom di Desktop - Luas, Terbaca & Proporsional) */}
                                    <div className="lg:col-span-7 p-5 sm:p-6 md:p-8 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 text-xs text-navy-500 dark:text-navy-400 mb-2.5">
                                                <span className="flex items-center font-semibold">
                                                    <Icon name="Calendar" className="w-3.5 h-3.5 mr-1.5 text-gold-500" />
                                                    {formatIndoDate(featuredWarta.tanggal)}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center font-semibold">
                                                    <Icon name="Clock" className="w-3.5 h-3.5 mr-1 text-gold-500" />
                                                    {featInfo.readingTime}
                                                </span>
                                            </div>

                                            <h2 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-black text-navy-950 dark:text-gold-400 group-hover:text-gold-600 leading-tight tracking-tight mb-3 transition-colors line-clamp-2">
                                                {highlightSearchText(featInfo.cleanTitle, searchQuery)}
                                            </h2>

                                            <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-300 line-clamp-3 leading-relaxed font-normal mb-5">
                                                {highlightSearchText(featInfo.excerpt, searchQuery)}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-navy-900 dark:bg-gold-500 text-gold-400 dark:text-navy-950 font-black text-xs flex items-center justify-center">
                                                    {(featuredWarta.penulis || 'R').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs font-bold text-navy-800 dark:text-navy-200">
                                                    {featuredWarta.penulis || 'Redaksi Warta'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleBookmark(featuredWarta.rowIndex);
                                                    }}
                                                    className={`p-2 rounded-xl border transition-all ${bookmarkedIds.includes(featuredWarta.rowIndex) ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 text-navy-500 dark:text-navy-300 border-navy-200/50 dark:border-navy-700'}`}
                                                    title={bookmarkedIds.includes(featuredWarta.rowIndex) ? "Hapus dari Simpanan" : "Simpan Warta"}
                                                >
                                                    <Icon name="Bookmark" className={`w-4 h-4 ${bookmarkedIds.includes(featuredWarta.rowIndex) ? 'fill-current' : ''}`} />
                                                </button>
                                                <span className="bg-navy-900 group-hover:bg-gold-500 text-gold-400 group-hover:text-navy-950 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm">
                                                    Baca Selengkapnya →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        );
                    })()}

                    {/* SECTION TITLE BERITA TERBARU */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-2 h-6 bg-gold-500 rounded-full"></div>
                            <h3 className="text-lg md:text-xl font-black text-navy-950 dark:text-gold-400">
                                {isShowingFeatured ? 'Warta & Pengumuman Lainnya' : `Daftar Berita ${selectedCategory !== 'Semua' ? '• ' + selectedCategory : ''}`}
                            </h3>
                        </div>
                        <span className="text-xs font-bold text-navy-500 dark:text-navy-400 bg-navy-50 dark:bg-navy-800 px-3 py-1 rounded-lg">
                            Halaman {currentPage} dari {totalPages || 1}
                        </span>
                    </div>

                    {/* EDITORIAL NEWS GRID (3 - 4 KOLOM) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                        {paginatedWarta.map((warta) => {
                            const info = parseWartaInfo(warta);
                            const rawUrls = parseGambarUrls(warta.gambarUrl);
                            const safeUrls = rawUrls.map(u => formatImageUrl(u)).filter(u => u.startsWith('http') || u.startsWith('data:image'));
                            const thumbnailImg = safeUrls.length > 0 ? safeUrls[0] : null;

                            return (
                                <article
                                    key={warta.rowIndex}
                                    onClick={() => setSelectedWarta(warta)}
                                    className="bg-white dark:bg-navy-900 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border border-navy-100/80 dark:border-navy-800 group cursor-pointer transform hover:-translate-y-1"
                                >
                                    {/* Thumbnail Visual (16:9) */}
                                    <div className="relative aspect-video bg-navy-950 overflow-hidden">
                                        {thumbnailImg ? (
                                            <img
                                                src={thumbnailImg}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                alt={info.cleanTitle}
                                                referrerPolicy="no-referrer"
                                                onError={(e) => handleImageErrorFallback(e, thumbnailImg)}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-navy-400 bg-gradient-to-br from-navy-900 to-navy-950">
                                                <Icon name="Image" className="w-10 h-10 mb-1 opacity-30" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Pisgah BISDAC</span>
                                            </div>
                                        )}

                                        {/* Penulis di posisi kiri sampul */}
                                        <div className="absolute top-3 left-3 bg-white/95 dark:bg-navy-900/90 text-navy-900 dark:text-gold-300 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md flex items-center gap-1 z-10 border border-black/5 dark:border-white/10">
                                            <Icon name="User" className="w-3 h-3 text-gold-500 shrink-0" />
                                            <span className="truncate max-w-[110px]">{warta.penulis || 'Redaksi'}</span>
                                        </div>

                                        {/* Kategori di posisi kanan sampul thumbnail */}
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md ${info.categoryStyle.badge}`}>
                                                {info.category}
                                            </span>
                                        </div>

                                        {/* Multi-Photo Indicator */}
                                        {safeUrls.length > 1 && (
                                            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1 z-10">
                                                <Icon name="Image" className="w-3 h-3" /> +{safeUrls.length - 1}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        {/* Tanggal terbit di bawah gambar sampul thumbnail */}
                                        <div className="flex items-center gap-2 text-[11px] font-semibold text-navy-500 dark:text-navy-400 mb-2">
                                            <span className="flex items-center gap-1 font-bold text-navy-700 dark:text-gold-300">
                                                <Icon name="Calendar" className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                                                {formatIndoDateTime(warta.tanggal)}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Icon name="Clock" className="w-3 h-3 text-gold-500" />
                                                {info.readingTime}
                                            </span>
                                        </div>

                                        <h3 className="font-extrabold text-navy-950 dark:text-gold-400 text-base leading-snug mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
                                            {highlightSearchText(info.cleanTitle, searchQuery)}
                                        </h3>

                                        <p className="text-xs text-navy-600 dark:text-navy-300 line-clamp-3 mb-4 flex-1 leading-relaxed">
                                            {highlightSearchText(info.excerpt, searchQuery)}
                                        </p>

                                        {/* Card Footer */}
                                        <div className="mt-auto pt-3 border-t border-navy-50 dark:border-navy-800/80 flex items-center justify-between">
                                            <span className="text-[11px] text-navy-500 dark:text-navy-400 font-bold flex items-center truncate mr-2">
                                                <Icon name="Edit" className="w-3 h-3 mr-1 text-gold-400 shrink-0" />
                                                <span className="truncate">{warta.penulis || 'Admin'}</span>
                                            </span>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleBookmark(warta.rowIndex);
                                                    }}
                                                    className={`p-1.5 rounded-lg border transition-all ${bookmarkedIds.includes(warta.rowIndex) ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 text-navy-500 dark:text-navy-300 border-navy-200/50 dark:border-navy-700'}`}
                                                    title={bookmarkedIds.includes(warta.rowIndex) ? "Hapus dari Simpanan" : "Simpan Warta"}
                                                >
                                                    <Icon name="Bookmark" className={`w-3.5 h-3.5 ${bookmarkedIds.includes(warta.rowIndex) ? 'fill-current' : ''}`} />
                                                </button>
                                                <span className="bg-gold-500 hover:bg-gold-600 text-white dark:text-navy-950 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center shadow-xs transition-colors shrink-0">
                                                    Baca <Icon name="ChevronRight" className="w-3 h-3 ml-0.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-10 pt-6 border-t border-navy-100 dark:border-navy-800">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all shadow-sm ${currentPage === 1
                                    ? 'bg-navy-50 dark:bg-navy-800 text-navy-300 dark:text-navy-600 cursor-not-allowed'
                                    : 'bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-gold-300 hover:bg-gold-50 dark:hover:bg-navy-800 hover:text-gold-600'}`}
                            >
                                <Icon name="ChevronLeft" className="w-5 h-5" />
                            </button>

                            <div className="flex gap-1.5 px-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${page === currentPage
                                            ? 'bg-navy-950 dark:bg-gold-500 text-gold-400 dark:text-navy-950 shadow-md scale-105'
                                            : 'bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all shadow-sm ${currentPage === totalPages
                                    ? 'bg-navy-50 dark:bg-navy-800 text-navy-300 dark:text-navy-600 cursor-not-allowed'
                                    : 'bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-gold-300 hover:bg-gold-50 dark:hover:bg-navy-800 hover:text-gold-600'}`}
                            >
                                <Icon name="ChevronRight" className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
// ========== AKHIR WARTA PAGE ==========

export default WartaPage;
