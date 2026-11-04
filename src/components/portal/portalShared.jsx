import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, Maximize, Minimize2, FileText, Download, Share2, Info, BookOpen, Search as SearchIcon, X, CheckCircle, Navigation, MapPin, Calendar, Phone, Mail, Clock, Globe, ArrowRight, User, PlusCircle, PenTool, Layout, ExternalLink, Menu, Music, Activity, Megaphone, Video, ArrowLeft, MoreHorizontal, MessageCircle, Heart, Star, Compass, Anchor, Copy, Check, Upload, Trash2, Map as MapIcon } from 'lucide-react';
import {
    portalFetch,
    fetchPortalMainFromSupabase,
    syncPortalMainToSupabase,
    fetchPortalBooksFromSupabase,
    syncPortalBooksToSupabase,
    checkPortalSupabaseHealth,
    migratePortalGASToSupabase,
    fetchCrossModulePortalWidgets,
    saveUserStudySync,
    loadUserStudySync
} from '../../utils/supabasePortalAdapter';

export {
    portalFetch,
    fetchPortalMainFromSupabase,
    syncPortalMainToSupabase,
    fetchPortalBooksFromSupabase,
    syncPortalBooksToSupabase,
    checkPortalSupabaseHealth,
    migratePortalGASToSupabase,
    fetchCrossModulePortalWidgets,
    saveUserStudySync,
    loadUserStudySync
};

export const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwQJWQ2hKXQMdnFqVYr8Tan_9BIKQLtZyM_Wil6y19mRrgiQhEb1KB0hwOvJsPThcIX/exec'; // PASTIKAN UNTUK MENGISI KEMBALI URL GAS ANDA DI SINI

// Generator Sampul Buku Digital Elegan (SVG Data URI - 100% Offline & Tidak Pernah Rusak)
export const getSvgBookCover = (title = 'Buku Rohani', category = 'Buku') => {
    const rawTitle = (title || 'Buku Rohani').trim();
    const safeTitle = rawTitle
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    const cat = (category || 'Pustaka').toUpperCase().trim();

    // Palet warna mewah berdasarkan kategori buku
    let c1 = '#0f172a', c2 = '#1e293b', accent = '#fbbf24';
    const cLower = (category || '').toLowerCase();
    if (cLower.includes('egw') || cLower.includes('ellen')) {
        c1 = '#2e1065'; c2 = '#3b0764'; accent = '#fcd34d'; // Ungu Rohani EGW
    } else if (cLower.includes('doktrin') || cLower.includes('dasar')) {
        c1 = '#064e3b'; c2 = '#065f46'; accent = '#6ee7b7'; // Hijau Doktrin
    } else if (cLower.includes('renungan') || cLower.includes('doa')) {
        c1 = '#78350f'; c2 = '#92400e'; accent = '#fde68a'; // Amber Hangat Renungan
    } else if (cLower.includes('kesehatan') || cLower.includes('hidup')) {
        c1 = '#14532d'; c2 = '#166534'; accent = '#86efac'; // Hijau Kesehatan
    } else if (cLower.includes('misi') || cLower.includes('pemuda')) {
        c1 = '#0c4a6e'; c2 = '#075985'; accent = '#7dd3fc'; // Biru Misi
    } else if (cLower.includes('panduan') || cLower.includes('pedoman')) {
        c1 = '#1e1b4b'; c2 = '#312e81'; accent = '#a5b4fc'; // Indigo Panduan
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="100%" height="100%">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${c1}" />
                <stop offset="100%" stop-color="${c2}" />
            </linearGradient>
            <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#B47F24" />
                <stop offset="50%" stop-color="#FCD34D" />
                <stop offset="100%" stop-color="#D97706" />
            </linearGradient>
        </defs>
        <rect width="400" height="560" fill="url(#bg)" />
        <rect x="0" y="0" width="28" height="560" fill="#000000" opacity="0.3" />
        <line x1="28" y1="0" x2="28" y2="560" stroke="#ffffff" stroke-width="1" opacity="0.12" />
        <rect x="22" y="22" width="356" height="516" rx="14" fill="none" stroke="url(#gold)" stroke-width="2.5" opacity="0.75" />
        <rect x="30" y="30" width="340" height="500" rx="10" fill="none" stroke="${accent}" stroke-width="1" opacity="0.35" stroke-dasharray="8,5" />
        <rect x="50" y="55" width="300" height="28" rx="14" fill="${accent}" opacity="0.18" />
        <text x="200" y="74" fill="${accent}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="900" letter-spacing="3" text-anchor="middle">${cat}</text>
        <circle cx="200" cy="180" r="46" fill="#ffffff" opacity="0.05" />
        <circle cx="200" cy="180" r="38" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.85" />
        <path d="M182 170 C188 166, 196 166, 200 172 C204 166, 212 166, 218 170 L218 194 C212 190, 204 190, 200 195 C196 190, 188 190, 182 194 Z" fill="url(#gold)" opacity="0.95" />
        <foreignObject x="45" y="248" width="310" height="190">
            <div xmlns="http://www.w3.org/1999/xhtml" style="color:#ffffff; font-family:system-ui, -apple-system, sans-serif; font-size:21px; font-weight:800; line-height:1.35; text-align:center; text-shadow:0 2px 4px rgba(0,0,0,0.6); display:-webkit-box; -webkit-line-clamp:5; -webkit-box-orient:vertical; overflow:hidden;">
                ${safeTitle}
            </div>
        </foreignObject>
        <line x1="110" y1="465" x2="290" y2="465" stroke="url(#gold)" stroke-width="1.5" opacity="0.6" />
        <text x="200" y="495" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="800" letter-spacing="2.5" text-anchor="middle" opacity="0.85">GMAHK PISGAH BISDAC</text>
        <text x="200" y="515" fill="${accent}" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" letter-spacing="1.5" text-anchor="middle" opacity="0.7">PUSTAKA DIGITAL</text>
    </svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Default cover buku berkualitas tinggi berdasarkan kategori (pengganti domain lama yang sudah mati)
export const BOOK_CATEGORY_DEFAULTS = {
    'egw': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1000&auto=format&fit=crop',
    'ellen': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1000&auto=format&fit=crop',
    'doktrin': 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=1000&auto=format&fit=crop',
    'dasar': 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=1000&auto=format&fit=crop',
    'panduan': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop',
    'pedoman': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop',
    'renungan': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1000&auto=format&fit=crop',
    'doa': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1000&auto=format&fit=crop',
    'alkitab': 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1000&auto=format&fit=crop',
    'kesehatan': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop',
    'hidup': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop',
    'misi': 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1000&auto=format&fit=crop',
    'pemuda': 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1000&auto=format&fit=crop',
    'sejarah': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1000&auto=format&fit=crop',
    'umum': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop'
};

export const getDefaultBookCover = (category) => {
    const cat = (category || '').toLowerCase().trim();
    if (!cat) return BOOK_CATEGORY_DEFAULTS['umum'];
    if (BOOK_CATEGORY_DEFAULTS[cat]) return BOOK_CATEGORY_DEFAULTS[cat];
    for (const [key, url] of Object.entries(BOOK_CATEGORY_DEFAULTS)) {
        if (key && (cat.includes(key) || key.includes(cat))) return url;
    }
    return BOOK_CATEGORY_DEFAULTS['umum'];
};

export const parseGambarUrls = (gambarUrl) => {
    if (!gambarUrl) return [];
    return gambarUrl.split('|||').map(url => url.trim()).filter(url => url !== '');
};

export const stripHtml = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const WARTA_CATEGORIES = [
    'Warta Sabat',
    'Berita Jemaat',
    'Pengumuman',
    'Kegiatan & Acara',
    'Pemuda & Remaja',
    'Renungan'
];

export const parseWartaInfo = (warta) => {
    if (!warta) {
        return {
            category: 'Berita Jemaat',
            cleanTitle: '',
            readingTime: '1 mnt baca',
            categoryStyle: {
                bg: 'bg-gold-50 dark:bg-navy-900',
                text: 'text-gold-700 dark:text-gold-300',
                border: 'border-gold-300 dark:border-gold-700/60',
                badge: 'bg-gold-500 text-white dark:bg-gold-500 dark:text-navy-950',
                dot: 'bg-gold-500'
            },
            wordCount: 0,
            excerpt: ''
        };
    }

    let rawTitle = (warta.judul || '').trim();
    let category = 'Berita Jemaat';
    let cleanTitle = rawTitle;

    // Cek apakah ada format kategori dalam kurung siku: [Kategori] Judul
    const bracketMatch = rawTitle.match(/^\[(.*?)\]\s*(.*)$/);
    if (bracketMatch) {
        category = bracketMatch[1].trim();
        cleanTitle = bracketMatch[2].trim() || rawTitle;
    } else {
        // Deteksi kategori otomatis berdasarkan kata kunci judul dan isi
        const haystack = (rawTitle + ' ' + (warta.isi || '')).toLowerCase();
        if (haystack.includes('warta sabat') || haystack.includes('kebaktian') || haystack.includes('khotbah') || haystack.includes('jadwal sabat') || haystack.includes('petugas sabat')) {
            category = 'Warta Sabat';
        } else if (haystack.includes('pengumuman') || haystack.includes('perhatian') || haystack.includes('diberitahukan')) {
            category = 'Pengumuman';
        } else if (haystack.includes('pemuda') || haystack.includes('adventist youth') || haystack.includes('pathfinder') || haystack.includes('ay')) {
            category = 'Pemuda & Remaja';
        } else if (haystack.includes('baksos') || haystack.includes('seminar') || haystack.includes('kegiatan') || haystack.includes('acara') || haystack.includes('pelayanan') || haystack.includes('bazaar')) {
            category = 'Kegiatan & Acara';
        } else if (haystack.includes('renungan') || haystack.includes('ayat') || haystack.includes('firman') || haystack.includes('doa') || haystack.includes('inspirasi')) {
            category = 'Renungan';
        }
    }

    const plain = stripHtml(warta.isi || '');
    const words = plain.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = `${Math.max(1, Math.ceil(words / 180))} mnt baca`;

    // Palet warna per kategori layaknya majalah / portal berita
    const styles = {
        'Warta Sabat': {
            bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
            badge: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-navy-950',
            dot: 'bg-emerald-500'
        },
        'Pengumuman': {
            bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
            badge: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-navy-950',
            dot: 'bg-amber-500'
        },
        'Kegiatan & Acara': {
            bg: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
            badge: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-navy-950',
            dot: 'bg-blue-500'
        },
        'Pemuda & Remaja': {
            bg: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
            badge: 'bg-purple-600 text-white dark:bg-purple-500 dark:text-navy-950',
            dot: 'bg-purple-500'
        },
        'Renungan': {
            bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
            badge: 'bg-rose-600 text-white dark:bg-rose-500 dark:text-navy-950',
            dot: 'bg-rose-500'
        },
        'Berita Jemaat': {
            bg: 'bg-gold-50 text-gold-900 border-gold-200 dark:bg-navy-900 dark:text-gold-300 dark:border-gold-500/40',
            badge: 'bg-gold-500 text-white dark:bg-gold-500 dark:text-navy-950',
            dot: 'bg-gold-500'
        }
    };

    const categoryStyle = styles[category] || styles['Berita Jemaat'];

    return {
        category,
        cleanTitle,
        readingTime,
        categoryStyle,
        wordCount: words,
        excerpt: truncateText(plain, 140)
    };
};

export const decodeHTML = (html) => {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

// Fungsi kompresi gambar otomatis berbasis WebP (Mencegah Limit Size Apps Script, Menghemat Kuota hingga 85%, & Menjaga Transparansi)
export const compressImage = (file, maxWidth = 1280, quality = 0.75) => {
    return new Promise((resolve, reject) => {
        if (!file) return resolve('');

        // Jika input sudah berupa string base64 / data URL
        if (typeof file === 'string' && file.startsWith('data:image')) {
            const img = new Image();
            img.onerror = () => resolve(file);
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                try {
                    const q = quality || 0.75;
                    const webpData = canvas.toDataURL('image/webp', q);
                    if (webpData && webpData.startsWith('data:image/webp')) {
                        return resolve(webpData);
                    }
                    resolve(canvas.toDataURL('image/jpeg', q));
                } catch (e) {
                    resolve(file);
                }
            };
            img.src = file;
            return;
        }

        const mimeType = (file.type || '').toLowerCase();
        const fileName = (file.name || '').toLowerCase();
        const isSvg = mimeType === 'image/svg+xml' || fileName.endsWith('.svg');

        // Jika berkas SVG, langsung gunakan DataURL tanpa rasterisasi agar tetap vektor transparan
        if (isSvg) {
            const svgReader = new FileReader();
            svgReader.onload = (e) => resolve(e.target.result);
            svgReader.onerror = () => reject(new Error('Gagal membaca berkas SVG.'));
            svgReader.readAsDataURL(file);
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
        reader.onload = (event) => {
            const img = new Image();
            img.onerror = () => reject(new Error('Format berkas gambar tidak valid.'));
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // Prioritaskan kompresi WebP modern untuk efisiensi ruang maksimum & transparansi sempurna
                try {
                    const webpData = canvas.toDataURL('image/webp', quality || 0.75);
                    if (webpData && webpData.startsWith('data:image/webp')) {
                        resolve(webpData);
                        return;
                    }
                } catch (e) { }

                // Fallback jika browser lawas
                try {
                    resolve(canvas.toDataURL('image/jpeg', quality || 0.75));
                } catch (e) {
                    resolve(event.target.result);
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
};

// Helper pengatur posisi scroll halaman agar selalu kembali ke puncak saat navigasi menu
export const scrollToTop = () => {
    try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (e) {
        window.scrollTo(0, 0);
    }
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
};

export const getGoogleDriveFileId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Jika input langsung berupa Google Drive ID murni (25-45 karakter alfanumerik)
    if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) return trimmed;

    // Format drive.google.com, docs.google.com, lh3.googleusercontent.com
    const match = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=[^&]+&)?id=|thumbnail\?id=)|docs\.google\.com\/(?:presentation|document|spreadsheets)\/d\/|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]{20,})/);
    if (match) return match[1];

    // Format query param id= di mana saja
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
    if (idParamMatch) return idParamMatch[1];

    // Format /d/ID di mana saja
    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    if (dMatch) return dMatch[1];

    return null;
};

export const handleImageErrorFallback = (e, originalUrl) => {
    if (!e || !e.target) return;
    const driveId = getGoogleDriveFileId(originalUrl || e.target.src);
    if (driveId) {
        const currentSrc = e.target.src || '';
        if (!e.target.dataset.triedFallback) {
            e.target.dataset.triedFallback = '1';
            if (currentSrc.includes('lh3.googleusercontent.com')) {
                e.target.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
                return;
            }
            e.target.src = `https://lh3.googleusercontent.com/d/${driveId}`;
        } else if (e.target.dataset.triedFallback === '1') {
            e.target.dataset.triedFallback = '2';
            e.target.src = `https://drive.google.com/uc?export=view&id=${driveId}`;
        }
    }
};

export const formatImageUrl = (url) => {
    if (!url) return '';
    const trimmed = typeof url === 'string' ? url.trim() : '';
    if (!trimmed) return '';
    if (trimmed.includes('hopesoftware.org')) return '';

    const driveId = getGoogleDriveFileId(trimmed);
    if (driveId) {
        return `https://lh3.googleusercontent.com/d/${driveId}`;
    }

    // Mengembalikan string Base64 murni jika kehilangan awalan data:image/ saat dikirim
    if (!trimmed.startsWith('http') && !trimmed.startsWith('data:image') && trimmed.length > 500) {
        if (trimmed.startsWith('UklG')) return `data:image/webp;base64,${trimmed}`;
        if (trimmed.startsWith('iVBORw')) return `data:image/png;base64,${trimmed}`;
        if (trimmed.startsWith('/9j/')) return `data:image/jpeg;base64,${trimmed}`;
        return `data:image/jpeg;base64,${trimmed}`; // Fallback default
    }
    return trimmed;
};

export const getCoverFallback = (b) => {
    if (!b) return getDefaultBookCover('Umum');

    // 1. PRIORITAS UTAMA: Jika bagian "URL Sampul (Cover)" diisi, gunakan link tersebut!
    // Sesuai permintaan pengguna: jika mengisi bagian ini maka akan menggunakan link nya
    if (b.cover && typeof b.cover === 'string' && b.cover.trim() !== '' && !b.cover.includes('hopesoftware.org')) {
        const coverDriveId = getGoogleDriveFileId(b.cover);
        if (coverDriveId) {
            return `https://lh3.googleusercontent.com/d/${coverDriveId}`;
        }
        const fmt = formatImageUrl(b.cover);
        if (fmt) {
            return fmt;
        }
        return b.cover.trim();
    }

    // 2. JIKA KOSONG: Otomatis diambil dari halaman awal dokumen PDF buku (Google Drive)
    const pdfDriveId = getGoogleDriveFileId(b.pdfUrl || b.fileUrl || b.url || b.link || b.driveUrl);
    if (pdfDriveId) {
        return `https://lh3.googleusercontent.com/d/${pdfDriveId}`;
    }

    // 3. Cek jika b.id sendiri adalah file ID Google Drive
    const idDriveId = getGoogleDriveFileId(b.id);
    if (idDriveId) {
        return `https://lh3.googleusercontent.com/d/${idDriveId}`;
    }

    // 4. JIKA TIDAK ADA HALAMAN SAMPUL / KOSONG / TIDAK ADA LINK: Gunakan default sesuai kategori
    return getDefaultBookCover(b.category);
};

export const handleBookCoverError = (e, book) => {
    if (!e || !e.target) return;

    // 1. Jika URL thumbnail drive.google.com / lh3 gagal, coba mirror alternatifnya
    const driveId = getGoogleDriveFileId(book?.cover) || getGoogleDriveFileId(book?.pdfUrl || book?.fileUrl || book?.url || book?.link || (e.target && e.target.src));
    if (driveId && !e.target.dataset.triedMirror) {
        e.target.dataset.triedMirror = '1';
        if (e.target.src.includes('lh3.googleusercontent.com')) {
            e.target.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
            return;
        }
        e.target.src = `https://lh3.googleusercontent.com/d/${driveId}`;
        return;
    }

    // 2. Jika link cover khusus gagal atau link PDF gagal: gunakan default sesuai kategori
    const defaultCover = getDefaultBookCover(book?.category);
    if (defaultCover && e.target.src !== defaultCover) {
        e.target.src = defaultCover;
        return;
    }

    // 3. Fallback terakhir jika offline / default tidak dapat dimuat: sampul SVG digital
    e.target.onerror = null;
    e.target.src = getSvgBookCover(book?.title, book?.category);
};

export const DocumentBadge = ({ book, className = "absolute top-2 left-2" }) => {
    if (!book.pdfUrl) return null;
    const isPpt = book.pdfUrl.includes('presentation') || (book.title && (book.title.toLowerCase().includes('ppt') || book.title.toLowerCase().includes('presentasi')));
    const isDoc = book.pdfUrl.includes('document');
    return (
        <span className={`${className} text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm backdrop-blur-sm ${isPpt ? 'bg-orange-500/90' : isDoc ? 'bg-blue-500/90' : 'bg-green-500/90'}`}>
            {isPpt ? '✓ PPT' : isDoc ? '✓ DOC' : '✓ PDF'}
        </span>
    );
};

// Helper pengurutan buku agar posisi paling atas selalu yang terbaru
export const sortBooksNewestFirst = (booksList = [], referenceList = []) => {
    if (!Array.isArray(booksList)) return [];

    const refMap = new Map();
    const refArr = Array.isArray(referenceList) && referenceList.length > 0 ? referenceList : booksList;
    refArr.forEach((b, idx) => {
        if (b && b.id !== undefined) refMap.set(String(b.id), idx);
    });

    return [...booksList].sort((a, b) => {
        // 1. Cek tanggal/waktu eksplisit jika tersedia
        const timeA = a.createdAt || a.created_at || a.timestamp || a.tanggal || a.date;
        const timeB = b.createdAt || b.created_at || b.timestamp || b.tanggal || b.date;
        if (timeA && timeB) {
            const tA = new Date(timeA).getTime();
            const tB = new Date(timeB).getTime();
            if (!isNaN(tA) && !isNaN(tB) && tA !== tB) {
                return tB - tA; // Tanggal terbaru di atas
            }
        }

        // 2. Cek angka pada ID (Google Apps Script generate 'BK' + new Date().getTime())
        const digitsA = String(a.id || '').replace(/\D/g, '');
        const digitsB = String(b.id || '').replace(/\D/g, '');
        if (digitsA && digitsB) {
            const numA = Number(digitsA);
            const numB = Number(digitsB);
            if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
                if (Math.abs(digitsA.length - digitsB.length) <= 3) {
                    return numB - numA; // Timestamp milidetik atau ID numerik lebih besar = lebih baru = di atas
                }
            }
        }

        // 3. Fallback: urutan baris di Google Sheets (data di baris paling bawah adalah yang paling baru ditambahkan)
        const orderA = refMap.has(String(a.id)) ? refMap.get(String(a.id)) : -1;
        const orderB = refMap.has(String(b.id)) ? refMap.get(String(b.id)) : -1;
        if (orderA !== -1 && orderB !== -1 && orderA !== orderB) {
            return orderB - orderA; // Baris bawah di sheet = terbaru = di atas
        }

        return 0;
    });
};

// --- KOMPONEN LOADING & SKELETON PLACEHOLDER ---
export const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[400] flex-col"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
            <div className="loading-spinner mb-6"></div>
            <p className="text-[#D4AF37] font-black tracking-widest text-xl animate-pulse uppercase">...</p>
        </div>
    );
};

// Komponen Kerangka Loading (Skeleton Card) untuk visual transisi halus saat data sedang dimuat
export const HomeCardSkeleton = ({ count = 2, height = "h-48", variant = "cards" }) => {
    if (variant === "full") {
        return (
            <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-navy-900 p-6 md:p-8 shadow-xl border-2 border-[#E2E8D8] dark:border-navy-700 animate-pulse flex flex-col justify-between min-h-[220px]">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-5 w-36 bg-gray-200 dark:bg-navy-800 rounded-full"></div>
                        <div className="h-4 w-20 bg-gray-200 dark:bg-navy-800 rounded-full"></div>
                    </div>
                    <div className="h-7 w-2/3 bg-gray-300 dark:bg-navy-700 rounded-xl"></div>
                    <div className="h-4 w-1/2 bg-gray-200 dark:bg-navy-800 rounded-lg"></div>
                    <div className="space-y-2 pt-2">
                        <div className="h-20 w-full bg-gray-100 dark:bg-navy-950/70 rounded-2xl border border-gray-200/50 dark:border-navy-800"></div>
                    </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-navy-800 flex items-center justify-between">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-navy-800 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-navy-800 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full animate-pulse">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`rounded-2xl bg-gray-200/80 dark:bg-navy-800/60 p-5 border border-gray-300/40 dark:border-navy-700/50 flex flex-col justify-between ${height}`}
                >
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 bg-gray-300 dark:bg-navy-700 rounded-full"></div>
                            <div className="h-3 w-16 bg-gray-300 dark:bg-navy-700 rounded-full"></div>
                        </div>
                        <div className="h-5 w-3/4 bg-gray-300 dark:bg-navy-700 rounded-lg"></div>
                        <div className="h-3 w-1/2 bg-gray-300/70 dark:bg-navy-700/60 rounded"></div>
                    </div>
                    <div className="pt-3 border-t border-gray-300/40 dark:border-navy-700/50 flex items-center justify-between">
                        <div className="h-3 w-20 bg-gray-300 dark:bg-navy-700 rounded"></div>
                        <div className="h-6 w-24 bg-gray-300 dark:bg-navy-700 rounded-xl"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Komponen Kartu Standar Beranda (HomeCard) untuk menyeragamkan desain border, padding, header, badge, & footer
export const HomeCard = ({
    badgeIcon,
    badgeText,
    badgeRightText,
    title,
    subtitle,
    children,
    footerLeft,
    footerRight,
    headerRightContent,
    className = "",
    containerClassName = ""
}) => {
    return (
        <div className={`relative overflow-hidden rounded-[2rem] bg-white dark:bg-navy-900 p-5 sm:p-6 md:p-8 shadow-xl border-2 border-[#E2E8D8] dark:border-navy-700 flex flex-col justify-between group ${containerClassName}`}>
            <div className="flex-1 flex flex-col min-h-0">
                {/* Header Kartu */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-4 border-b border-[#E2E8D8] dark:border-navy-800">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            {badgeText && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A7045]/10 dark:bg-gold-500/15 text-[#2C3F21] dark:text-gold-400 font-extrabold text-[11px] uppercase tracking-wider border border-[#4A7045]/20 dark:border-gold-500/30">
                                    {badgeIcon && <Icon name={badgeIcon} className="w-3.5 h-3.5" />}
                                    <span>{badgeText}</span>
                                </span>
                            )}
                            {badgeRightText && (
                                <span className="text-[11px] text-[#596B4D] dark:text-gray-400 font-medium">
                                    {badgeRightText}
                                </span>
                            )}
                        </div>
                        {title && (
                            <h3 className="text-xl md:text-2xl font-black text-[#2C3F21] dark:text-white tracking-tight">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-xs md:text-sm text-[#596B4D] dark:text-gray-400 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {headerRightContent && (
                        <div className="self-start xl:self-auto shrink-0 w-full xl:w-auto">
                            {headerRightContent}
                        </div>
                    )}
                </div>

                {/* Konten Isi */}
                <div className={`mt-4 flex-1 flex flex-col min-h-0 ${className}`}>
                    {children}
                </div>
            </div>

            {/* Footer Kartu */}
            {(footerLeft || footerRight) && (
                <div className="pt-3 mt-4 border-t border-[#E2E8D8] dark:border-navy-800 flex items-center justify-between text-[11px] text-[#596B4D] dark:text-gray-400 flex-wrap gap-2">
                    <div>{footerLeft}</div>
                    <div>{footerRight}</div>
                </div>
            )}
        </div>
    );
};

// --- INITIAL DATA ---
export const defaultSusunan = {
    ssLaguBuka: "LS ...",
    ssAyatInti: "...",
    ssLaguTutup: "LS ...",
    ssLaguTema: "LS 168 Kita Memiliki Pengharapan",
    kLaguPengantar: "LS 408 - Berdiam, Berdiam",
    kLaguSambutan: "LS 1 - Di Hadapan Hadirat-Mu",
    kAyatBersahutan: "No. ...",
    kLaguBuka: "LS ...",
    kLaguRespon: "LS 516 - Dengar Ya Tuhan",
    kLaguPujian1_show: false,
    kLaguPujian1_judul: "Koor / Vocal Group",
    kLaguPujian2_show: false,
    kLaguPujian2_judul: "Koor / Vocal Group",
    kLaguPujian3_show: false,
    kLaguPujian3_judul: "Koor / Vocal Group",
    kAyatInti: "...",
    kLaguTema: "Misi Kita",
    kLaguTutup: "LS ..."
};

export const initialJadwalRabu = {
    title: "Ibadah Permintaan Doa (Rabu)", time: "19:30 WIB - selesai",
    petugas: [{ tugas: "Pemimpin Acara", nama: "Pemimpin" }, { tugas: "Renungan", nama: "Renungan" }, { tugas: "Doa Buka", nama: "Doa" }, { tugas: "Tempat", nama: "Tempat" }, { tugas: "Lagu Pujian", nama: "Lagu Pujian" }, { tugas: "Doa Tutup", nama: "Doa" }, { tugas: "Persembahan Kas", nama: "Diakon" }]
};

export const initialJadwalSabat = {
    title: "Ibadah Sabat (Sabtu)", time: "10:00 - 13:00 WIB",
    sekolahSabatTime: "11:45 - 12:40 WIB",
    sekolahSabat: [{ tugas: "Pianis", nama: "Pianis" }, { tugas: "Pemimpin Acara", nama: "Pemimpin Acara" }, { tugas: "Ayat Inti & Doa Buka", nama: "Pemimpin Acara" }, { tugas: "Berita Misi", nama: "Video" }, { tugas: "Doa Tutup", nama: "Doa Tutup" }],
    khotbahTime: "10:00 - 11:45 WIB",
    khotbah: [{ tugas: "Pianis", nama: "Pianis" }, { tugas: "Khotbah", nama: "Sermon" }, { tugas: "Doa Syafaat", nama: "Syafaat" }, { tugas: "Pemimpin Acara", nama: "Pemimpin Acara" }, { tugas: "Bacaan & Doa Persembahan", nama: "Pemimpin Acara" }, { tugas: "Song Leader", nama: "Pemimpin Acara" }, { tugas: "Cerita Anak-anak", nama: "Sermonette" }, { tugas: "Lagu Pujian", nama: "SpesialSong" }],
    diakon: [{ tugas: "Diakon", nama: "Diakon" }],
    musik: [{ tugas: "Pianis SS", nama: "Pianis SS" }, { tugas: "Pianis Khotbah", nama: "Pianis Khotbah" }, { tugas: "Gitar", nama: "Gitar" }],
    susunan: defaultSusunan,
    perjamuan: [
        // Roti & Anggur (0-3)
        { tugas: "Persiapan Roti", nama: "Diakones" },
        { tugas: "Persiapan Anggur", nama: "Diakones" },
        { tugas: "Penata Meja Perjamuan", nama: "Diakones" },
        // Basuh Kaki (4-7)
        { tugas: "Koord. Basuh Kaki Pria", nama: "Diakon" },
        { tugas: "Koord. Basuh Kaki Wanita", nama: "Diakones" },
        { tugas: "Persiapan Air & Baskom 1", nama: "" },
        { tugas: "Persiapan Air & Baskom 2", nama: "" },
        // Pelayan Perjamuan (8-11)
        { tugas: "Pelayan Perjamuan (L1)", nama: "" },
        { tugas: "Pelayan Perjamuan (P1)", nama: "" },
        { tugas: "Pelayan Perjamuan (L2)", nama: "" },
        { tugas: "Pelayan Perjamuan (P2)", nama: "" },
        // Pembersihan Alat (12-16)
        { tugas: "Pembersihan Gelas", nama: "" },
        { tugas: "Pembersihan Nampan", nama: "" },
        { tugas: "Pembersihan Baskom", nama: "" },
        { tugas: "Pencucian Handuk 1", nama: "" },
        { tugas: "Pencucian Handuk 2", nama: "" }
    ]
};

// 66 Kitab Alkitab Terjemahan Baru (PL & PB) - Tersedia untuk Alkitab Digital dan Admin Selector
export const ALKITAB_BOOKS = [
    { id: 1, nama: 'Kejadian', singkat: 'Kej', pasal: 50, testamen: 'PL' },
    { id: 2, nama: 'Keluaran', singkat: 'Kel', pasal: 40, testamen: 'PL' },
    { id: 3, nama: 'Imamat', singkat: 'Im', pasal: 27, testamen: 'PL' },
    { id: 4, nama: 'Bilangan', singkat: 'Bil', pasal: 36, testamen: 'PL' },
    { id: 5, nama: 'Ulangan', singkat: 'Ul', pasal: 34, testamen: 'PL' },
    { id: 6, nama: 'Yosua', singkat: 'Yos', pasal: 24, testamen: 'PL' },
    { id: 7, nama: 'Hakim-hakim', singkat: 'Hak', pasal: 21, testamen: 'PL' },
    { id: 8, nama: 'Rut', singkat: 'Rut', pasal: 4, testamen: 'PL' },
    { id: 9, nama: '1 Samuel', singkat: '1Sam', pasal: 31, testamen: 'PL' },
    { id: 10, nama: '2 Samuel', singkat: '2Sam', pasal: 24, testamen: 'PL' },
    { id: 11, nama: '1 Raja-raja', singkat: '1Raj', pasal: 22, testamen: 'PL' },
    { id: 12, nama: '2 Raja-raja', singkat: '2Raj', pasal: 25, testamen: 'PL' },
    { id: 13, nama: '1 Tawarikh', singkat: '1Taw', pasal: 29, testamen: 'PL' },
    { id: 14, nama: '2 Tawarikh', singkat: '2Taw', pasal: 36, testamen: 'PL' },
    { id: 15, nama: 'Ezra', singkat: 'Ezr', pasal: 10, testamen: 'PL' },
    { id: 16, nama: 'Nehemia', singkat: 'Neh', pasal: 13, testamen: 'PL' },
    { id: 17, nama: 'Ester', singkat: 'Est', pasal: 10, testamen: 'PL' },
    { id: 18, nama: 'Ayub', singkat: 'Ayb', pasal: 42, testamen: 'PL' },
    { id: 19, nama: 'Mazmur', singkat: 'Mzm', pasal: 150, testamen: 'PL' },
    { id: 20, nama: 'Amsal', singkat: 'Ams', pasal: 31, testamen: 'PL' },
    { id: 21, nama: 'Pengkhotbah', singkat: 'Pkh', pasal: 12, testamen: 'PL' },
    { id: 22, nama: 'Kidung Agung', singkat: 'Kid', pasal: 8, testamen: 'PL' },
    { id: 23, nama: 'Yesaya', singkat: 'Yes', pasal: 66, testamen: 'PL' },
    { id: 24, nama: 'Yeremia', singkat: 'Yer', pasal: 52, testamen: 'PL' },
    { id: 25, nama: 'Ratapan', singkat: 'Rat', pasal: 5, testamen: 'PL' },
    { id: 26, nama: 'Yehezkiel', singkat: 'Yeh', pasal: 48, testamen: 'PL' },
    { id: 27, nama: 'Daniel', singkat: 'Dan', pasal: 12, testamen: 'PL' },
    { id: 28, nama: 'Hosea', singkat: 'Hos', pasal: 14, testamen: 'PL' },
    { id: 29, nama: 'Yoel', singkat: 'Yoe', pasal: 3, testamen: 'PL' },
    { id: 30, nama: 'Amos', singkat: 'Am', pasal: 9, testamen: 'PL' },
    { id: 31, nama: 'Obaja', singkat: 'Ob', pasal: 1, testamen: 'PL' },
    { id: 32, nama: 'Yunus', singkat: 'Yun', pasal: 4, testamen: 'PL' },
    { id: 33, nama: 'Mikha', singkat: 'Mi', pasal: 7, testamen: 'PL' },
    { id: 34, nama: 'Nahum', singkat: 'Nah', pasal: 3, testamen: 'PL' },
    { id: 35, nama: 'Habakuk', singkat: 'Hab', pasal: 3, testamen: 'PL' },
    { id: 36, nama: 'Zefanya', singkat: 'Zef', pasal: 3, testamen: 'PL' },
    { id: 37, nama: 'Hagai', singkat: 'Hag', pasal: 2, testamen: 'PL' },
    { id: 38, nama: 'Zakharia', singkat: 'Za', pasal: 14, testamen: 'PL' },
    { id: 39, nama: 'Maleakhi', singkat: 'Mal', pasal: 4, testamen: 'PL' },
    { id: 40, nama: 'Matius', singkat: 'Mat', pasal: 28, testamen: 'PB' },
    { id: 41, nama: 'Markus', singkat: 'Mrk', pasal: 16, testamen: 'PB' },
    { id: 42, nama: 'Lukas', singkat: 'Luk', pasal: 24, testamen: 'PB' },
    { id: 43, nama: 'Yohanes', singkat: 'Yoh', pasal: 21, testamen: 'PB' },
    { id: 44, nama: 'Kisah Para Rasul', singkat: 'Kis', pasal: 28, testamen: 'PB' },
    { id: 45, nama: 'Roma', singkat: 'Rom', pasal: 16, testamen: 'PB' },
    { id: 46, nama: '1 Korintus', singkat: '1Kor', pasal: 16, testamen: 'PB' },
    { id: 47, nama: '2 Korintus', singkat: '2Kor', pasal: 13, testamen: 'PB' },
    { id: 48, nama: 'Galatia', singkat: 'Gal', pasal: 6, testamen: 'PB' },
    { id: 49, nama: 'Efesus', singkat: 'Ef', pasal: 6, testamen: 'PB' },
    { id: 50, nama: 'Filipi', singkat: 'Flp', pasal: 4, testamen: 'PB' },
    { id: 51, nama: 'Kolose', singkat: 'Kol', pasal: 4, testamen: 'PB' },
    { id: 52, nama: '1 Tesalonika', singkat: '1Tes', pasal: 5, testamen: 'PB' },
    { id: 53, nama: '2 Tesalonika', singkat: '2Tes', pasal: 3, testamen: 'PB' },
    { id: 54, nama: '1 Timotius', singkat: '1Tim', pasal: 6, testamen: 'PB' },
    { id: 55, nama: '2 Timotius', singkat: '2Tim', pasal: 4, testamen: 'PB' },
    { id: 56, nama: 'Titus', singkat: 'Tit', pasal: 3, testamen: 'PB' },
    { id: 57, nama: 'Filemon', singkat: 'Flm', pasal: 1, testamen: 'PB' },
    { id: 58, nama: 'Ibrani', singkat: 'Ibr', pasal: 13, testamen: 'PB' },
    { id: 59, nama: 'Yakobus', singkat: 'Yak', pasal: 5, testamen: 'PB' },
    { id: 60, nama: '1 Petrus', singkat: '1Pet', pasal: 5, testamen: 'PB' },
    { id: 61, nama: '2 Petrus', singkat: '2Pet', pasal: 3, testamen: 'PB' },
    { id: 62, nama: '1 Yohanes', singkat: '1Yoh', pasal: 5, testamen: 'PB' },
    { id: 63, nama: '2 Yohanes', singkat: '2Yoh', pasal: 1, testamen: 'PB' },
    { id: 64, nama: '3 Yohanes', singkat: '3Yoh', pasal: 1, testamen: 'PB' },
    { id: 65, nama: 'Yudas', singkat: 'Yud', pasal: 1, testamen: 'PB' },
    { id: 66, nama: 'Wahyu', singkat: 'Why', pasal: 22, testamen: 'PB' },
];


export const IosInstallModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="glass-box rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-navy-50 text-navy-900 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                        <Icon name="Share" className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-xl text-navy-900 tracking-tight">Instal di iOS</h3>
                    <p className="text-sm text-navy-600 px-2 leading-relaxed">
                        Untuk menginstal aplikasi di iPhone/iPad: <br /><br />
                        1. Tekan ikon <b>Titik Tiga</b> <Icon name="Titik" className="w-4 h-4 inline" /> di kanan bawah Safari. <br />
                        2. Lalu icon <b>Share</b> <Icon name="Share" className="w-4 h-4 inline" /> <br />
                        3. Gulir ke bawah dan pilih <br /><b className="text-navy-900">Tambahkan ke Layar Utama</b> (Add to Home Screen).
                    </p>
                    <button onClick={onClose} className="w-full bg-navy-900 text-gold-400 font-bold py-3.5 rounded-xl transition-all shadow-md mt-4">Saya Mengerti</button>
                </div>
            </div>
        </div>
    );
};

export const ManualInstallModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const isIos = typeof navigator !== 'undefined' && /iphone|ipad|ipod/.test((navigator.userAgent || '').toLowerCase());
    const isAndroid = typeof navigator !== 'undefined' && /android/.test((navigator.userAgent || '').toLowerCase());
    const [activeOsTab, setActiveOsTab] = React.useState(isIos ? 'ios' : isAndroid ? 'android' : 'desktop');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
            <div className="glass-box rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl animate-scale-up border-2 border-navy-100 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-navy-100 dark:border-navy-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#4A7045]/15 dark:bg-gold-500/20 text-[#4A7045] dark:text-gold-400 flex items-center justify-center">
                            <Icon name="MonitorDown" className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-extrabold text-navy-900 dark:text-white leading-tight">Panduan Pasang Aplikasi PWA</h3>
                            <p className="text-[11px] text-navy-500 dark:text-gray-400">GMAHK Jemaat Pisgah BISDAC</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-navy-800 transition cursor-pointer">
                        <Icon name="X" className="w-5 h-5" />
                    </button>
                </div>

                {/* OS Switcher Tabs */}
                <div className="flex rounded-xl bg-navy-100/70 dark:bg-navy-800 p-1 mb-4 gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveOsTab('ios')}
                        className={`flex-1 py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${activeOsTab === 'ios' ? 'bg-white dark:bg-navy-900 text-[#4A7045] dark:text-gold-400 shadow-xs' : 'text-navy-600 dark:text-gray-300 hover:text-navy-900'}`}
                    >
                        <span>🍎 iPhone / iPad</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveOsTab('android')}
                        className={`flex-1 py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${activeOsTab === 'android' ? 'bg-white dark:bg-navy-900 text-[#4A7045] dark:text-gold-400 shadow-xs' : 'text-navy-600 dark:text-gray-300 hover:text-navy-900'}`}
                    >
                        <span>🤖 Android</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveOsTab('desktop')}
                        className={`flex-1 py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${activeOsTab === 'desktop' ? 'bg-white dark:bg-navy-900 text-[#4A7045] dark:text-gold-400 shadow-xs' : 'text-navy-600 dark:text-gray-300 hover:text-navy-900'}`}
                    >
                        <span>💻 PC / Laptop</span>
                    </button>
                </div>

                {/* Tab Content */}
                {activeOsTab === 'ios' && (
                    <div className="space-y-3 text-xs sm:text-sm text-navy-700 dark:text-gray-200">
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-300 text-xs">
                            💡 <b>Penting:</b> Pemasangan di iPhone/iPad wajib menggunakan browser <b>Safari</b>.
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                            <div>Buka alamat website gereja ini di browser bawaan <b>Safari</b>.</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                            <div>Ketuk tombol <b>Bagikan (Share)</b> <Icon name="Share" className="w-3.5 h-3.5 inline text-blue-500 mx-1" /> (ikon kotak panah ke atas di bilah navigasi Safari).</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                            <div>Gulir menu ke bawah lalu pilih opsi <b className="text-[#4A7045] dark:text-gold-400">"Tambahkan ke Layar Utama" (Add to Home Screen)</b>.</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">4</span>
                            <div>Ketuk tombol <b>"Tambah" (Add)</b> di sudut kanan atas. Ikon aplikasi resmi GMAHK Pisgah akan langsung muncul di home screen iPhone/iPad Anda!</div>
                        </div>
                    </div>
                )}

                {activeOsTab === 'android' && (
                    <div className="space-y-3 text-xs sm:text-sm text-navy-700 dark:text-gray-200">
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300 text-xs">
                            💡 Gunakan browser <b>Google Chrome</b> atau <b>Samsung Internet</b> untuk instalasi 1-klik otomatis.
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                            <div>Buka menu browser dengan mengetuk ikon <b>Titik Tiga (⋮)</b> di sudut kanan atas Chrome.</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                            <div>Pilih menu <b className="text-[#4A7045] dark:text-gold-400">"Instal aplikasi"</b> atau <b>"Tambahkan ke Layar Utama"</b>.</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                            <div>Ketuk tombol <b>"Instal"</b> pada jendela konfirmasi. Aplikasi Pisgah BISDAC akan terpasang di daftar aplikasi HP Anda dan siap digunakan offline.</div>
                        </div>
                    </div>
                )}

                {activeOsTab === 'desktop' && (
                    <div className="space-y-3 text-xs sm:text-sm text-navy-700 dark:text-gray-200">
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-300 text-xs">
                            💡 Didukung di <b>Google Chrome</b>, <b>Microsoft Edge</b>, dan <b>Brave</b> pada sistem Windows, macOS, & Linux.
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                            <div>Perhatikan di ujung kanan <b>Bilah Alamat (URL Bar)</b> di bagian atas browser Anda.</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                            <div>Klik ikon <b>Pasang / Install App</b> <Icon name="MonitorDown" className="w-3.5 h-3.5 inline text-blue-500 mx-1" /> (ikon monitor berpanah atau tanda tambah ⊕).</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                            <div>Klik <b>"Instal"</b>. Jendela aplikasi mandiri akan terbuka dan pintasan dibuat di Desktop & Menu Start komputer Anda.</div>
                        </div>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            if (window.installPWA) window.installPWA();
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#4A7045] dark:bg-gold-500 hover:bg-[#3A5836] dark:hover:bg-gold-600 text-white dark:text-navy-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                        <Icon name="MonitorDown" className="w-4 h-4" />
                        <span>Coba Pasang Otomatis</span>
                    </button>
                    <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-gray-300 font-bold text-xs sm:text-sm cursor-pointer">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

// Banner PWA Kaya Informasi di Halaman Depan
export const PwaInstallBanner = ({ onOpenGuide }) => {
    const [isDismissed, setIsDismissed] = React.useState(() => {
        try {
            const val = localStorage.getItem('pisgah_pwa_banner_dismissed_until');
            return val && Number(val) > Date.now();
        } catch (e) {
            return false;
        }
    });

    const isStandalone = typeof window !== 'undefined' && (
        Boolean(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        window.navigator.standalone === true
    );

    if (isStandalone || isDismissed) return null;

    const handleDismiss = () => {
        try {
            localStorage.setItem('pisgah_pwa_banner_dismissed_until', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
        } catch (e) { }
        setIsDismissed(true);
    };

    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1C2C16] via-[#2A4422] to-[#1E3019] dark:from-navy-900 dark:via-navy-950 dark:to-navy-900 p-5 sm:p-7 text-white shadow-xl border-2 border-[#4A7045]/60 dark:border-gold-500/40 animate-fade-in group flex flex-col justify-between h-full">
            <div className="absolute top-0 right-0 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/40 font-extrabold text-[10.5px] uppercase tracking-wider">
                            <Icon name="MonitorDown" className="w-3.5 h-3.5" /> Pasang Aplikasi Resmi PWA
                        </span>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="text-white/60 hover:text-white text-xs px-2.5 py-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                            title="Tutup ajakan pasang selama 7 hari"
                        >
                            ✕ Nanti Saja
                        </button>
                    </div>

                    <div className="max-w-2xl mb-4">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
                            Pasang di Layar Utama HP atau Komputer Anda
                        </h2>
                        <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-medium">
                            Akses warta jemaat, Alkitab digital, Buku Lagu Sion, dan jadwal ibadah secara instan dengan 1-ketukan tanpa perlu membuka browser tiap kali.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
                        <div className="p-3 rounded-xl bg-white/10 dark:bg-navy-800/80 backdrop-blur-sm border border-white/15">
                            <div className="text-lg mb-1">⚡</div>
                            <div className="text-xs font-black text-gold-300">1-Ketukan Cepat</div>
                            <div className="text-[10px] text-white/75 mt-0.5 leading-tight">Buka langsung dari home screen tanpa ketik alamat web</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/10 dark:bg-navy-800/80 backdrop-blur-sm border border-white/15">
                            <div className="text-lg mb-1">📶</div>
                            <div className="text-xs font-black text-gold-300">Mode Offline</div>
                            <div className="text-[10px] text-white/75 mt-0.5 leading-tight">Warta, alkitab & lagu tetap bisa dibaca tanpa internet</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/10 dark:bg-navy-800/80 backdrop-blur-sm border border-white/15">
                            <div className="text-lg mb-1">📱</div>
                            <div className="text-xs font-black text-gold-300">Layar Penuh</div>
                            <div className="text-[10px] text-white/75 mt-0.5 leading-tight">Tampilan bersih lega bebas bilah navigasi browser</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/10 dark:bg-navy-800/80 backdrop-blur-sm border border-white/15">
                            <div className="text-lg mb-1">💾</div>
                            <div className="text-xs font-black text-gold-300">Sangat Ringan</div>
                            <div className="text-[10px] text-white/75 mt-0.5 leading-tight">Ukuran &lt; 3 MB, hemat memori dan hemat baterai</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap pt-2">
                    <button
                        type="button"
                        onClick={() => window.installPWA && window.installPWA()}
                        className="px-5 py-2.5 rounded-xl bg-[#D19B45] hover:bg-[#B4791E] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                    >
                        <Icon name="MonitorDown" className="w-4 h-4" />
                        <span>Pasang Aplikasi Sekarang</span>
                    </button>
                    <button
                        type="button"
                        onClick={onOpenGuide}
                        className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-white/20"
                    >
                        <Icon name="Info" className="w-4 h-4 text-gold-300" />
                        <span>Panduan Cara Pasang (iOS / Android / PC)</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const initialDataPejabat = [
    { id: 'gembala', jabatan: "Gembala Jemaat", nama: "Pdt. [Nama Gembala]", wa: "62800000000", img: "https://ui-avatars.com/api/?name=Gembala+Jemaat&background=eff6ff&color=1e3a8a&size=512", kategori: "Gembala" },
    { id: 'ketua', jabatan: "Ketua Jemaat", nama: "Bpk. [Nama Ketua]", wa: "62800000000", img: "https://ui-avatars.com/api/?name=Ketua+Jemaat&background=eff6ff&color=1e3a8a&size=512", kategori: "Officers" },
    { id: 'sekretaris', jabatan: "sekretaris", nama: "Bpk. [Nama sekretaris]", wa: "62800000000", img: "https://ui-avatars.com/api/?name=sekretaris&background=eff6ff&color=1e3a8a&size=512", kategori: "Officers" },
    { id: 'bendahara', jabatan: "Bendahara", nama: "Bpk. [Nama Bendahara]", wa: "62800000000", img: "https://ui-avatars.com/api/?name=Bendahara+Jemaat&background=f0fdf4&color=14532d&size=512", kategori: "Officers" },
    { id: 'penginjilan', jabatan: "Penginjilan", nama: "Bpk. [Nama Penginjilan]", wa: "62800000000", img: "https://ui-avatars.com/api/?name=Penginjilan&background=f0fdf4&color=14532d&size=512", kategori: "Departemen & Pelayanan" },
    { id: 'ss', jabatan: "Sekolah Sabat", nama: "Ibu. [Nama Sekolah Sabat]", wa: "62800000000", img: "https://ui-avatars.com/api/?name=Sekolah+Sabat&background=fffbeb&color=78350f&size=512", kategori: "Departemen & Pelayanan" },
    { id: 'diakon', jabatan: "Ketua Diakon", nama: "Ibu. [Nama Ketua Diakon]", wa: "62800000000", img: "https://ui-avatars.com/api/?name=Ketua+Diakon&background=fffbeb&color=78350f&size=512", kategori: "Departemen & Pelayanan" },
    { id: 'rumah', jabatan: "Rumah Tangga", nama: "Sdr. [Nama Rumah Tangga]", wa: "62800000000", img: "https://ui-avatars.com/api/?name=Rumah+Tangga&background=e0e7ff&color=3730a3&size=512", kategori: "Departemen & Pelayanan" },
    { id: 'pemuda', jabatan: "Pemuda", nama: "Sdr. [Nama Pemuda]", wa: "62800000000", img: "https://ui-avatars.com/api/?name=Pemuda&background=e0e7ff&color=3730a3&size=512", kategori: "Departemen & Pelayanan" },
    { id: 'hotline', jabatan: "Hotline", nama: "Bpk. [Nama Hotline]", wa: "62800000000", img: "https://ui-avatars.com/api/?name=Hotline&background=f3f4f6&color=1f2937&size=512", kategori: "Lainnya" },
    { id: 'komunikasi', jabatan: "komunikasi", nama: "Sdr. [Nama Komunikasi]", wa: "62800000000", img: "https://ui-avatars.com/api/?name=Kominikasi&background=faf5ff&color=581c87&size=512", kategori: "Lainnya" }
];

// --- ICONS (SVG MAPPING) ---
// Peta renderer ikon di level modul. Setiap ikon berupa fungsi sehingga hanya ikon yang diminta
// yang dibuat (sebelumnya seluruh 93 SVG dibuat ulang pada setiap render <Icon>).
const ICON_RENDERERS = {
    Cross: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="2" x2="12" y2="22" /><line x1="5" y1="8" x2="19" y2="8" /></svg>,
    Layers: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
    Tv: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="15" x="2" y="7" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></svg>,
    Maximize2: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" x2="14" y1="3" y2="10" /><line x1="3" x2="10" y1="21" y2="14" /></svg>,
    Bell: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>,
    Building: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>,
    UserPlus: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>,
    Send: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>,
    Backspace: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>,
    Grid: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>,
    Sun: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>,
    Moon: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>,
    Home: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    ClipboardCheck: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></svg>,
    Church: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2" /><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" /><path d="M18 22V5l-6-3-6 3v17" /><path d="M12 7v5" /><path d="M10 9h4" /></svg>,
    FileText: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>,
    Rupiah: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><text x="12" y="15.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="currentColor" stroke="none" fontFamily="system-ui, -apple-system, sans-serif">Rp</text></svg>,
    BarChart: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>,
    BookOpen: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
    Warta: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" /><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" /><path d="M8 6v8" /></svg>,
    Video: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>,
    Calendar: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
    Gift: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 12 20 22 4 22 4 12" /><rect width="20" height="5" x="2" y="7" /><line x1="12" x2="12" y1="22" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>,
    LogIn: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>,
    LogOut: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>,
    Download: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>,
    MonitorDown: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" /><line x1="12" x2="12" y1="17" y2="21" /><line x1="8" x2="16" y1="21" y2="21" /><polyline points="15 8 12 11 9 8" /><line x1="12" x2="12" y1="2" y2="11" /></svg>,
    Headphones: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" /></svg>,
    Users: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    User: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    Refresh: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" /></svg>,
    MessageCircle: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>,
    Phone: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
    ChevronLeft: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 18 9 12 15 6" /></svg>,
    ArrowLeft: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>,
    ArrowRight: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 5 7 7-7 7" /><path d="M5 12h14" /></svg>,
    ArrowUp: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>,
    ChevronRight: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6" /></svg>,
    ChevronDown: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9" /></svg>,
    ChevronUp: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="18 15 12 9 6 15" /></svg>,
    Check: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>,
    X: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    Edit: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    Trash: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>,
    Settings: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    Eye: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
    EyeOff: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>,
    Music: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
    List: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    ListOrdered: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>,
    Search: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>,
    Image: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>,
    Megaphone: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>,
    Bold: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 12a4 4 0 0 0 0-8H6v8" /><path d="M15 20a4 4 0 0 0 0-8H6v8Z" /></svg>,
    Italic: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line x1="15" x2="9" y1="4" y2="20" /></svg>,
    Underline: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" x2="20" y1="20" y2="20" /></svg>,
    LinkIcon: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    Upload: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>,
    PlusCircle: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>,
    Plus: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
    Minus: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /></svg>,
    Trash2: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>,
    Camera: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>,
    Save: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
    Info: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>,
    Share: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2v13" /><path d="m16 6-4-4-4 4" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /></svg>,
    Shield: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    Titik: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>,
    Drive: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 16h.01" /><path d="M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /><path d="M21.946 12.013H2.054" /><path d="M6 16h.01" /></svg>,
    Menu: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>,
    MapPin: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
    Map: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" /></svg>,
    Navigation: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>,
    Package: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    Play: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="6 3 20 12 6 21 6 3" /></svg>,
    Pause: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
    Folder: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>,
    Heart: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>,
    Clock: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Share2: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
    Copy: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>,
    Tag: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><circle cx="7" cy="7" r=".5" fill="currentColor" /></svg>,
    Printer: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>,
    Sparkles: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
    ZoomIn: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
    CheckCircle: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    WifiOff: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.58 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>,
    RefreshCw: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>,
    ExternalLink: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
    Bookmark: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>,
    Star: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    Volume2: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>,
    Volume1: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>,
    SkipBack: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" /></svg>,
    SkipForward: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></svg>,
    Square: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" /></svg>,
    CalendarPlus: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M10 16h4" /><path d="M12 14v4" /></svg>,
    AlertTriangle: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    Maximize: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>,
    Minimize: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>,
    WhatsApp: (className) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
};

export const Icon = ({ name, className }) => {
    const render = ICON_RENDERERS[name];
    return render ? render(className) : null;
};

// --- HELPER FUNCTIONS FOR DATE ---
export const toYMD = (d) => {
    const pad = n => n < 10 ? '0' + n : n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatIndoDateShort = (dateString) => {
    if (!dateString) return '';
    const ds = String(dateString).includes('T') ? dateString : String(dateString) + 'T00:00:00';
    const d = new Date(ds);
    if (isNaN(d.getTime())) return dateString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatIndoDate = (dateString) => {
    if (!dateString) return '';
    const ds = String(dateString).includes('T') ? dateString : String(dateString) + 'T00:00:00';
    const d = new Date(ds);
    if (isNaN(d.getTime())) return dateString;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const ds = String(dateString).includes('T') ? dateString : String(dateString) + 'T00:00:00';
    const date = new Date(ds);
    if (isNaN(date.getTime())) return dateString;
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
};

export const formatIndoDateTime = (dateString) => {
    if (!dateString) return '';
    const ds = String(dateString).includes('T') ? dateString : String(dateString).replace(' ', 'T');
    const d = new Date(ds);
    if (isNaN(d.getTime())) return dateString;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const pad = n => n < 10 ? '0' + n : n;
    const hasTime = String(dateString).includes(':') || String(dateString).includes('T');
    if (hasTime) {
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} pk ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`;
    }
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const isWartaPublished = (tanggalStr) => {
    if (!tanggalStr) return true;
    try {
        const ds = String(tanggalStr).includes('T') ? tanggalStr : String(tanggalStr).replace(' ', 'T');
        const pubDate = new Date(ds);
        if (isNaN(pubDate.getTime())) return true;
        return pubDate.getTime() <= Date.now();
    } catch (e) {
        return true;
    }
};

export const getYouTubeVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;
    let clean = url.trim();
    if (clean.includes('live_stream') || clean.includes('videoseries')) return null;
    const iframeMatch = clean.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) clean = iframeMatch[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
    const regExp = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/;
    const m = clean.match(regExp);
    if (m && m[1] && m[1] !== 'videoseries' && m[1] !== 'live_stream') return m[1];
    const fallback = clean.match(/(?:v=|vi\/|\/v\/|youtu\.be\/|\/embed\/|\/live\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
    return (fallback && fallback[1] !== 'videoseries' && fallback[1] !== 'live_stream') ? fallback[1] : null;
};

export const formatYouTubeEmbedUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    let clean = url.trim();
    const iframeMatch = clean.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) clean = iframeMatch[1];

    if (clean.includes('live_stream')) {
        return clean;
    }

    const listMatch = clean.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
    const ytid = getYouTubeVideoId(clean);

    if (listMatch) {
        const listId = listMatch[1];
        if (ytid) {
            return `https://www.youtube.com/embed/${ytid}?list=${listId}`;
        }
        return `https://www.youtube.com/embed/videoseries?list=${listId}`;
    }

    if (ytid) {
        return `https://www.youtube.com/embed/${ytid}`;
    }

    return clean;
};

export const VideoThumbnail = ({ video, ytid }) => {
    const isPlaylist = video.url?.includes('list=') || video.url?.includes('videoseries') || video.url?.includes('/playlist');
    const isLive = !isPlaylist && (video.url?.includes('live_stream') || (!ytid && video.title?.toLowerCase().includes('live')));
    const customThumb = video.thumbnail || video.poster;
    const [imgSrc, setImgSrc] = React.useState(() => {
        if (customThumb) return customThumb;
        if (ytid) return `https://img.youtube.com/vi/${ytid}/maxresdefault.jpg`;
        return null;
    });
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        if (customThumb) {
            setImgSrc(customThumb);
            setHasError(false);
        } else if (ytid) {
            setImgSrc(`https://img.youtube.com/vi/${ytid}/maxresdefault.jpg`);
            setHasError(false);
        } else {
            setImgSrc(null);
            setHasError(false);
        }
    }, [ytid, customThumb]);

    const handleImgError = () => {
        if (imgSrc?.includes('maxresdefault.jpg') && ytid) {
            setImgSrc(`https://img.youtube.com/vi/${ytid}/mqdefault.jpg`);
        } else if (imgSrc?.includes('mqdefault.jpg') && ytid) {
            setImgSrc(`https://img.youtube.com/vi/${ytid}/hqdefault.jpg`);
        } else {
            setHasError(true);
        }
    };

    const handleImgLoad = (e) => {
        if (e.target.naturalWidth === 120 && e.target.naturalHeight === 90 && ytid && imgSrc?.includes('maxresdefault.jpg')) {
            setImgSrc(`https://img.youtube.com/vi/${ytid}/mqdefault.jpg`);
        }
    };

    if (imgSrc && !hasError) {
        return (
            <img
                src={imgSrc}
                alt={video.title}
                loading="lazy"
                decoding="async"
                onError={handleImgError}
                onLoad={handleImgLoad}
                className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 group-hover/play:scale-105 transition-transform duration-700 ease-out"
            />
        );
    }

    if (isLive) {
        return (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1c2d1b] via-[#111f10] to-[#0a1209] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent"></div>
                <img src="./icons/PisgahColor.png" alt="Logo" className="w-12 h-12 md:w-14 md:h-14 object-contain mb-2 drop-shadow-md opacity-90 group-hover/card:scale-110 group-hover/play:scale-110 transition-transform duration-700" />
                <span className="text-white font-extrabold text-xs md:text-sm tracking-wide drop-shadow">GMAHK PISGAH BISDAC</span>
                <span className="text-red-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    Live Streaming Channel
                </span>
            </div>
        );
    }

    if (isPlaylist) {
        return (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent"></div>
                <img src="./icons/PisgahColor.png" alt="Logo" className="w-12 h-12 md:w-14 md:h-14 object-contain mb-2 drop-shadow-md opacity-90 group-hover/card:scale-110 group-hover/play:scale-110 transition-transform duration-700" />
                <span className="text-white font-extrabold text-xs md:text-sm tracking-wide drop-shadow">GMAHK PISGAH BISDAC</span>
                <span className="text-amber-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1 flex items-center gap-1.5">
                    <Icon name="List" className="w-3.5 h-3.5 text-amber-400" />
                    Daftar Putar Video (Playlist)
                </span>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#2C3F21] to-[#141d0f] dark:from-navy-950 dark:to-navy-900 flex flex-col items-center justify-center p-4 select-none">
            <Icon name="Video" className="w-12 h-12 text-white/30 mb-2 group-hover/card:scale-110 group-hover/play:scale-110 transition-transform duration-700" />
            <span className="text-white/80 font-bold text-xs text-center line-clamp-1 max-w-[80%]">{video.title}</span>
        </div>
    );
};

export const getCleanBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
        return `${window.location.origin}/`;
    }
    return 'https://pisgahbisdac.app/';
};

export const getCleanShareUrl = (tab = 'home', params = {}) => {
    const origin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'https://pisgahbisdac.app';
    if (!tab || tab === 'home') {
        return `${origin}/`;
    }
    const query = new URLSearchParams();
    query.set('tab', tab);
    if (params && typeof params === 'object') {
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                query.set(key, String(val));
            }
        });
    }
    return `${origin}/?${query.toString()}`;
};

export const getWartaShareUrl = (warta) => {
    if (!warta) return getCleanShareUrl('warta');
    const id = warta.rowIndex !== undefined && warta.rowIndex !== null ? warta.rowIndex : warta.id;
    if (id !== undefined && id !== null && id !== '') {
        return getCleanShareUrl('warta', { id });
    }
    return getCleanShareUrl('warta');
};

export const createGoogleCalendarUrl = (event) => {
    if (!event) return '#';
    const title = encodeURIComponent(event.title || 'Acara GMAHK Pisgah BISDAC');
    const details = encodeURIComponent(`Acara GMAHK Pisgah BISDAC\nTanggal: ${event.dateStr || ''}\nLokasi: ${event.location || ''}\nMari beribadah & melayani bersama!`);
    const location = encodeURIComponent(event.location || 'GMAHK Pisgah BISDAC, Batam');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
};

export const shareEventToWhatsApp = (event) => {
    if (!event) return;
    const eventUrl = getCleanShareUrl('jadwal');
    const text = `*Acara GMAHK Pisgah BISDAC*\n\n📌 *${event.title || ''}*\n🗓️ ${event.dateStr || ''}\n📍 ${event.location || 'GMAHK Pisgah BISDAC'}\n\nMari hadir bersama dan bertumbuh dalam iman! Info selengkapnya:\n${eventUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
};

export const AcaraTerdekat = ({ allDates = [], selectedDate, handlePrev, handleNext, canGoPrev, canGoNext, title, setActiveTab, carouselEvents, handleDateSelect }) => {
    const dateInputRef = React.useRef(null);
    const [currentEventIdx, setCurrentEventIdx] = React.useState(0);
    const [isEventHovered, setIsEventHovered] = React.useState(false);
    const [isEventPaused, setIsEventPaused] = React.useState(false);
    const eventTouchStartX = React.useRef(0);
    const eventTouchEndX = React.useRef(0);
    const eventsToDisplay = Array.isArray(carouselEvents) ? carouselEvents : [];

    React.useEffect(() => {
        setCurrentEventIdx(0);
    }, [eventsToDisplay.length]);

    React.useEffect(() => {
        if (eventsToDisplay.length <= 1 || isEventHovered || isEventPaused) return;
        const timer = setInterval(() => {
            setCurrentEventIdx((prev) => (prev + 1) % eventsToDisplay.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [eventsToDisplay.length, isEventHovered, isEventPaused]);

    const handleEventTouchStart = (e) => {
        eventTouchStartX.current = e.targetTouches[0].clientX;
    };
    const handleEventTouchMove = (e) => {
        eventTouchEndX.current = e.targetTouches[0].clientX;
    };
    const handleEventTouchEnd = () => {
        if (!eventTouchStartX.current || !eventTouchEndX.current) return;
        const diff = eventTouchStartX.current - eventTouchEndX.current;
        if (diff > 50) {
            setCurrentEventIdx(prev => (prev === eventsToDisplay.length - 1 ? 0 : prev + 1));
        } else if (diff < -50) {
            setCurrentEventIdx(prev => (prev === 0 ? eventsToDisplay.length - 1 : prev - 1));
        }
        eventTouchStartX.current = 0;
        eventTouchEndX.current = 0;
    };

    return (
        <div className="w-full mx-auto px-4 md:px-8 lg:px-[6vw] mt-12 md:mt-16 mb-4">
            {eventsToDisplay.length > 0 && (
                <>
                    <h3 className="text-[10px] md:text-xs font-black text-[#D19B45] dark:text-gold-500 uppercase tracking-[0.2em] mb-1">Jangan Lewatkan</h3>
                    <h2 className="text-xl md:text-2xl font-extrabold text-[#2C3F21] dark:text-white mb-4">Acara Terdekat</h2>

                    {/* Elevated Dark Card Carousel with Ambient Halo Glow */}
                    <div className="relative w-full">
                        {/* Dark Mode Ambient Halo Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/20 via-[#D19B45]/20 to-emerald-600/20 rounded-[2.2rem] blur-xl opacity-0 dark:opacity-75 -z-10 transition-opacity duration-700 pointer-events-none"></div>

                        <div
                            className="relative w-full rounded-[2rem] overflow-hidden bg-[#2C3F21] dark:bg-navy-950 shadow-2xl border-2 border-[#E2E8D8] dark:border-navy-800 aspect-[16/10] sm:aspect-video md:aspect-[21/9] flex items-end p-6 md:p-10 text-white group select-none"
                            onMouseEnter={() => setIsEventHovered(true)}
                            onMouseLeave={() => setIsEventHovered(false)}
                            onTouchStart={handleEventTouchStart}
                            onTouchMove={handleEventTouchMove}
                            onTouchEnd={handleEventTouchEnd}
                        >
                            {eventsToDisplay[currentEventIdx]?.imageUrl ? (
                                <>
                                    <img
                                        src={formatImageUrl(eventsToDisplay[currentEventIdx].imageUrl)}
                                        alt="Event Background"
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => handleImageErrorFallback(e, eventsToDisplay[currentEventIdx].imageUrl)}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25 pointer-events-none"></div>
                                </>
                            ) : (
                                <div className="absolute top-0 right-0 w-[60%] sm:w-[50%] h-full opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-700">
                                    <div className="absolute top-[-30%] right-[-10%] w-[100%] sm:w-[80%] pt-[100%] sm:pt-[80%] rounded-full border-[30px] sm:border-[50px] border-white"></div>
                                </div>
                            )}

                            <div className="relative z-10 w-full max-w-[90%] sm:max-w-[80%]">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    {eventsToDisplay[currentEventIdx]?.dateStr && (
                                        <span className="inline-flex max-w-[calc(100%-85px)] truncate items-center bg-[#D19B45] text-[#2C3F21] text-xs sm:text-sm font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                                            <Icon name="Calendar" className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                            <span className="truncate">{eventsToDisplay[currentEventIdx].dateStr}</span>
                                        </span>
                                    )}
                                    <span className="inline-flex items-center bg-black/40 backdrop-blur-md text-white border border-white/20 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                                        Acara Mendatang
                                    </span>
                                </div>
                                <h3 className="text-xl sm:text-2xl md:text-4xl font-extrabold leading-tight mb-2 tracking-tight text-white drop-shadow-md line-clamp-3 sm:line-clamp-none">
                                    {eventsToDisplay[currentEventIdx]?.title || ''}
                                </h3>
                                {eventsToDisplay[currentEventIdx]?.location && (
                                    <p className="text-xs sm:text-sm md:text-base text-gray-200 dark:text-navy-100 flex items-center font-medium opacity-95 drop-shadow">
                                        <Icon name="MapPin" className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0 text-[#D19B45] dark:text-gold-400" />
                                        <span className="truncate">{eventsToDisplay[currentEventIdx].location}</span>
                                    </p>
                                )}

                                {/* Action Buttons: Google Calendar & WhatsApp & Slide Indicator */}
                                <div className="flex items-center justify-between gap-3 mt-4 pt-1 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={createGoogleCalendarUrl(eventsToDisplay[currentEventIdx])}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/25 transition-all active:scale-95 shadow-sm"
                                            title="Simpan Acara ke Google Calendar"
                                        >
                                            <Icon name="Calendar" className="w-3.5 h-3.5 mr-1.5 text-gold-300" />
                                            + Kalender
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => shareEventToWhatsApp(eventsToDisplay[currentEventIdx])}
                                            className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl bg-[#25D366]/30 hover:bg-[#25D366]/50 backdrop-blur-md text-white border border-[#25D366]/40 transition-all active:scale-95 shadow-sm"
                                            title="Bagikan Acara ke WhatsApp"
                                        >
                                            <Icon name="Share" className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                                            Bagikan WA
                                        </button>
                                    </div>

                                    {/* Event Dots & Pause Button */}
                                    {eventsToDisplay.length > 1 && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 shadow-md shrink-0">
                                            {eventsToDisplay.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setCurrentEventIdx(idx)}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentEventIdx ? 'w-6 bg-[#D19B45]' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                                                    aria-label={`Ke acara ${idx + 1}`}
                                                />
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setIsEventPaused(prev => !prev)}
                                                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors ml-1"
                                                title={isEventPaused ? "Lanjutkan Slide" : "Jeda Slide"}
                                                aria-label={isEventPaused ? "Lanjutkan Slide" : "Jeda Slide"}
                                            >
                                                <Icon name={isEventPaused ? "Play" : "Pause"} className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Event Controls */}
                            {eventsToDisplay.length > 1 && (
                                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-2 z-20">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentEventIdx(prev => (prev === 0 ? eventsToDisplay.length - 1 : prev - 1))}
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 active:scale-95 flex items-center justify-center transition-all backdrop-blur-md border border-white/20 text-white shadow-lg"
                                        title="Acara Sebelumnya"
                                        aria-label="Acara Sebelumnya"
                                    >
                                        <Icon name="ChevronLeft" className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentEventIdx(prev => (prev === eventsToDisplay.length - 1 ? 0 : prev + 1))}
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 active:scale-95 flex items-center justify-center transition-all backdrop-blur-md border border-white/20 text-white shadow-lg"
                                        title="Acara Selanjutnya"
                                        aria-label="Acara Selanjutnya"
                                    >
                                        <Icon name="ChevronRight" className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* White Pill Schedule */}
            <div className="mt-4 bg-white dark:bg-navy-800 rounded-2xl md:rounded-full p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-navy-700 flex items-center justify-between">
                <button onClick={handlePrev} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#2C3F21] dark:bg-navy-900 text-[#D19B45] dark:text-gold-400 flex items-center justify-center shrink-0 transition-colors shadow-md ${!canGoPrev ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3A5836] dark:hover:bg-navy-800'}`} disabled={!canGoPrev}><Icon name="ChevronLeft" className="w-4 h-4 sm:w-5 sm:h-5" /></button>

                <div className="flex-1 text-center px-2 sm:px-4 min-w-0">
                    <h4 className="text-sm sm:text-base font-extrabold text-[#2C3F21] dark:text-white truncate">{selectedDate ? formatIndoDate(selectedDate) : '-'}</h4>
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-[#596B4D] dark:text-navy-400 uppercase tracking-widest truncate">{title}</p>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button onClick={handleNext} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#2C3F21] dark:bg-navy-900 text-[#D19B45] dark:text-gold-400 flex items-center justify-center transition-colors shadow-md mr-0 sm:mr-3 ${!canGoNext ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3A5836] dark:hover:bg-navy-800'}`} disabled={!canGoNext}><Icon name="ChevronRight" className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    <div className="relative inline-flex">
                        <input
                            ref={dateInputRef}
                            type="date"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            value={selectedDate || ''}
                            onChange={(e) => {
                                if (e.target.value && handleDateSelect) handleDateSelect(e.target.value);
                            }}
                            title="Pilih Tanggal Jadwal"
                        />
                        <button onClick={() => { if (dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') dateInputRef.current.showPicker(); }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-2xl bg-[#2C3F21] dark:bg-navy-900 text-[#D19B45] dark:text-gold-400 flex items-center justify-center hover:bg-[#3A5836] dark:hover:bg-navy-800 transition-colors shadow-lg relative z-20"><Icon name="Calendar" className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// KOLEKSI AYAT EMAS ALKITAB HARIAN
// ============================================================
export const DAILY_VERSES = [
    {
        bookId: 'YER', bookName: 'Yeremia', chapter: 29, verse: 11,
        text: 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.',
        theme: 'Pengharapan & Damai',
        gold: ['TUHAN', 'hari depan yang penuh harapan'],
        emerald: ['rancangan damai sejahtera']
    },
    {
        bookId: 'FIL', bookName: 'Filipi', chapter: 4, verse: 13,
        text: 'Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.',
        theme: 'Kekuatan Iman',
        gold: ['Dia yang memberi kekuatan'],
        emerald: ['Segala perkara dapat kutanggung']
    },
    {
        bookId: 'MZM', bookName: 'Mazmur', chapter: 23, verse: '1-3',
        text: 'TUHAN adalah gembalaku, takkan kekurangan aku. Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang; Ia menyegarkan jiwaku.',
        theme: 'Penyertaan Tuhan',
        gold: ['TUHAN adalah gembalaku'],
        emerald: ['padang yang berumput hijau', 'air yang tenang', 'menyegarkan jiwaku']
    },
    {
        bookId: 'YES', bookName: 'Yesaya', chapter: 40, verse: 31,
        text: 'Tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.',
        theme: 'Kekuatan Baru',
        gold: ['menanti-nantikan TUHAN', 'rajawali'],
        emerald: ['kekuatan baru']
    },
    {
        bookId: 'YOH', bookName: 'Yohanes', chapter: 14, verse: '1-3',
        text: 'Janganlah gelisah hatimu; percayalah kepada Allah, percayalah juga kepada-Ku. Di rumah Bapa-Ku banyak tempat tinggal... Aku pergi ke situ untuk menyediakan tempat bagimu.',
        theme: 'Kedatangan Kristus',
        gold: ['Allah', 'kepada-Ku', 'rumah Bapa-Ku'],
        emerald: ['Janganlah gelisah hatimu', 'menyediakan tempat bagimu']
    },
    {
        bookId: 'AMS', bookName: 'Amsal', chapter: 3, verse: '5-6',
        text: 'Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri. Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu.',
        theme: 'Pimpinan Hidup',
        gold: ['TUHAN', 'segenap hatimu'],
        emerald: ['meluruskan jalanmu']
    },
    {
        bookId: 'MZM', bookName: 'Mazmur', chapter: 46, verse: 2,
        text: 'Allah bagi kita tempat perlindungan dan kekuatan, sebagai penolong dalam kesesakan sangat terbukti.',
        theme: 'Tempat Perlindungan',
        gold: ['Allah'],
        emerald: ['tempat perlindungan dan kekuatan', 'penolong dalam kesesakan']
    },
    {
        bookId: 'ROM', bookName: 'Roma', chapter: 8, verse: 28,
        text: 'Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.',
        theme: 'Rencana Allah',
        gold: ['Allah', 'rencana Allah'],
        emerald: ['mendatangkan kebaikan', 'mengasihi Dia']
    },
    {
        bookId: 'KEL', bookName: 'Keluaran', chapter: 20, verse: '8-10',
        text: 'Ingatlah dan kuduskanlah hari Sabat: enam hari lamanya engkau akan bekerja dan melakukan segala pekerjaanmu, tetapi hari ketujuh adalah hari Sabat TUHAN, Allahmu.',
        theme: 'Hari Sabat Kudus',
        gold: ['kuduskanlah hari Sabat', 'TUHAN, Allahmu'],
        emerald: ['hari ketujuh adalah hari Sabat']
    },
    {
        bookId: 'MAT', bookName: 'Matius', chapter: 11, verse: 28,
        text: 'Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.',
        theme: 'Kelegaan Sejati',
        gold: ['Marilah kepada-Ku'],
        emerald: ['Aku akan memberi kelegaan']
    },
    {
        bookId: 'YOS', bookName: 'Yosua', chapter: 1, verse: 9,
        text: 'Bukankah telah Kuperintahkan kepadamu: kuatkan dan teguhkanlah hatimu? Janganlah kecut dan tawar hati, sebab TUHAN, Allahmu, menyertai engkau, ke mana pun engkau pergi.',
        theme: 'Keberanian & Keteguhan',
        gold: ['TUHAN, Allahmu, menyertai engkau'],
        emerald: ['kuatkan dan teguhkanlah hatimu']
    },
    {
        bookId: '1KO', bookName: '1 Korintus', chapter: 10, verse: 13,
        text: 'Pencobaan-pencobaan yang kamu alami ialah pencobaan biasa... Allah setia dan karena itu Ia tidak akan membiarkan kamu dicobai melampaui kekuatanmu. Pada waktu kamu dicobai Ia akan memberikan kepadamu jalan keluar.',
        theme: 'Kesetiaan Allah',
        gold: ['Allah setia'],
        emerald: ['jalan keluar']
    },
    {
        bookId: 'WAH', bookName: 'Wahyu', chapter: 14, verse: '6-7',
        text: 'Takutlah akan Allah dan muliakanlah Dia, karena telah tiba saat penghakiman-Nya, dan sembahlah Dia yang telah menjadikan langit dan bumi dan laut dan semua mata air.',
        theme: 'Pekabaran Akhir Zaman',
        gold: ['Takutlah akan Allah', 'muliakanlah Dia'],
        emerald: ['sembahlah Dia yang telah menjadikan langit dan bumi']
    },
    {
        bookId: 'RAT', bookName: 'Ratapan', chapter: 3, verse: '22-23',
        text: 'Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!',
        theme: 'Kasih Setia Baru Tiap Pagi',
        gold: ['kasih setia TUHAN', 'besar kesetiaan-Mu'],
        emerald: ['selalu baru tiap pagi', 'rahmat-Nya']
    },
    {
        bookId: 'ZAP', bookName: 'Zefanya', chapter: 3, verse: 17,
        text: 'TUHAN Allahmu ada di antaramu sebagai pahlawan yang memberi kemenangan. Ia bergirang karena engkau dengan sukacita, Ia membaharui engkau dalam kasih-Nya.',
        theme: 'Kasih yang Membaharui',
        gold: ['TUHAN Allahmu', 'pahlawan yang memberi kemenangan'],
        emerald: ['sukacita', 'membaharui engkau dalam kasih-Nya']
    },
    {
        bookId: 'MZM', bookName: 'Mazmur', chapter: 119, verse: 105,
        text: 'Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.',
        theme: 'Pelita Kehidupan',
        gold: ['Firman-Mu'],
        emerald: ['pelita bagi kakiku', 'terang bagi jalanku']
    },
    {
        bookId: 'YES', bookName: 'Yesaya', chapter: 41, verse: 10,
        text: 'Janganlah takut, sebab Aku menyertai engkau, janganlah bimbang, sebab Aku ini Allahmu; Aku akan meneguhkan, bahkan akan menolong engkau; Aku akan memegang engkau dengan tangan kanan-Ku yang membawa kemenangan.',
        theme: 'Jangan Bimbang',
        gold: ['Aku menyertai engkau', 'Aku ini Allahmu'],
        emerald: ['Janganlah takut', 'tangan kanan-Ku yang membawa kemenangan']
    },
    {
        bookId: 'FIL', bookName: 'Filipi', chapter: 4, verse: '6-7',
        text: 'Janganlah hendaknya kamu kuatir tentang apa pun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur. Damai sejahtera Allah akan memelihara hati dan pikiranmu.',
        theme: 'Doa & Ucapan Syukur',
        gold: ['Allah', 'Damai sejahtera Allah'],
        emerald: ['doa dan permohonan', 'ucapan syukur', 'memelihara hati dan pikiranmu']
    },
    {
        bookId: '1PT', bookName: '1 Petrus', chapter: 5, verse: 7,
        text: 'Serahkanlah segala kekuatiranmu kepada-Nya, sebab Ia yang memelihara kamu.',
        theme: 'Kelegaan & Penyerahan',
        gold: ['kepada-Nya'],
        emerald: ['Serahkanlah segala kekuatiranmu', 'Ia yang memelihara kamu']
    },
    {
        bookId: 'IBR', bookName: 'Ibrani', chapter: 11, verse: 1,
        text: 'Iman adalah dasar dari segala sesuatu yang kita harapkan dan bukti dari segala sesuatu yang tidak kita lihat.',
        theme: 'Hakikat Iman',
        gold: ['Iman', 'harapkan'],
        emerald: ['dasar', 'bukti']
    },
    {
        bookId: 'YAK', bookName: 'Yakobus', chapter: 1, verse: 5,
        text: 'Tetapi apabila di antara kamu ada yang kekurangan hikmat, hendaklah ia memintakannya kepada Allah, yang memberikan kepada semua orang dengan murah hati, maka hal itu akan diberikan kepadanya.',
        theme: 'Hikmat Ilahi',
        gold: ['Allah', 'murah hati'],
        emerald: ['kekurangan hikmat', 'diberikan kepadanya']
    },
    {
        bookId: 'GAL', bookName: 'Galatia', chapter: 5, verse: '22-23',
        text: 'Tetapi buah Roh ialah: kasih, sukacita, damai sejahtera, kesabaran, kemurahan, kebaikan, kesetiaan, kelemahlembutan, penguasaan diri.',
        theme: 'Buah Roh',
        gold: ['buah Roh'],
        emerald: ['kasih', 'sukacita', 'damai sejahtera', 'kesabaran', 'kemurahan', 'kebaikan', 'kesetiaan', 'kelemahlembutan', 'penguasaan diri']
    },
    {
        bookId: 'MZM', bookName: 'Mazmur', chapter: 91, verse: '1-2',
        text: 'Orang yang duduk dalam lindungan Yang Mahatinggi dan bermalam dalam naungan Yang Mahakuasa akan berkata kepada TUHAN: "Tempat perlindunganku dan kubu pertahananku, Allahku, yang kupercayai."',
        theme: 'Lindungan Yang Mahatinggi',
        gold: ['Yang Mahatinggi', 'Yang Mahakuasa', 'TUHAN', 'Allahku'],
        emerald: ['lindungan', 'Tempat perlindunganku dan kubu pertahananku']
    },
    {
        bookId: 'KOL', bookName: 'Kolose', chapter: 3, verse: '12-14',
        text: 'Kenakanlah belas kasihan, kemurahan, kerendahan hati, kelemahlembutan dan kesabaran... Dan di atas semuanya itu: kenakanlah kasih, sebagai pengikat yang mempersatukan dan menyempurnakan.',
        theme: 'Kasih Persaudaraan',
        gold: ['kenakanlah kasih', 'pengikat yang mempersatukan'],
        emerald: ['belas kasihan', 'kemurahan', 'kerendahan hati', 'kelemahlembutan', 'kesabaran']
    },
    {
        bookId: 'MZM', bookName: 'Mazmur', chapter: 121, verse: '1-2',
        text: 'Aku melayangkan mataku ke gunung-gunung; dari manakah akan datang pertolonganku? Pertolonganku ialah dari TUHAN, yang menjadikan langit dan bumi.',
        theme: 'Pertolongan Sejati',
        gold: ['TUHAN, yang menjadikan langit dan bumi'],
        emerald: ['Pertolonganku ialah dari TUHAN']
    },
    {
        bookId: '1TE', bookName: '1 Tesalonika', chapter: 5, verse: '16-18',
        text: 'Bersukacitalah senantiasa. Tetaplah berdoa. Mengucap syukurlah dalam segala hal, sebab itulah yang dikehendaki Allah di dalam Kristus Yesus bagi kamu.',
        theme: 'Sukacita & Syukur',
        gold: ['Kristus Yesus', 'dikehendaki Allah'],
        emerald: ['Bersukacitalah senantiasa', 'Tetaplah berdoa', 'Mengucap syukurlah']
    },
    {
        bookId: 'YES', bookName: 'Yesaya', chapter: 58, verse: '13-14',
        text: 'Apabila engkau tidak menginjak-injak hukum Sabat... dan menyebutkan hari Sabat "hari kenikmatan"... maka engkau akan bersenang-senang karena TUHAN.',
        theme: 'Kenikmatan Sabat',
        gold: ['TUHAN', 'bersenang-senang karena TUHAN'],
        emerald: ['hukum Sabat', 'hari kenikmatan']
    },
    {
        bookId: 'EFN', bookName: 'Efesus', chapter: 2, verse: '8-9',
        text: 'Sebab karena kasih karunia kamu diselamatkan oleh iman; itu bukan hasil usahamu, tetapi pemberian Allah, itu bukan hasil pekerjaanmu: jangan ada orang yang memegahkan diri.',
        theme: 'Kasih Karunia',
        gold: ['Allah', 'pemberian Allah'],
        emerald: ['kasih karunia', 'diselamatkan oleh iman']
    },
    {
        bookId: 'MZM', bookName: 'Mazmur', chapter: 103, verse: '1-3',
        text: 'Pujilah TUHAN, hai jiwaku! Pujilah nama-Nya yang kudus, hai segenap batinku! Pujilah TUHAN, hai jiwaku, dan janganlah lupakan segala kebaikan-Nya!',
        theme: 'Pujian & Rasa Syukur',
        gold: ['Pujilah TUHAN', 'nama-Nya yang kudus'],
        emerald: ['janganlah lupakan segala kebaikan-Nya']
    },
    {
        bookId: 'WAH', bookName: 'Wahyu', chapter: 21, verse: 4,
        text: 'Dan Ia akan menghapus segala air mata dari mata mereka, dan maut tidak akan ada lagi; tidak akan ada lagi perkabungan, atau ratap tangis, atau dukacita, sebab segala sesuatu yang lama itu telah berlalu.',
        theme: 'Pengharapan Kekal',
        gold: ['Ia akan menghapus segala air mata'],
        emerald: ['maut tidak akan ada lagi']
    },
    {
        bookId: 'YOH', bookName: 'Yohanes', chapter: 3, verse: 16,
        text: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.',
        theme: 'Kasih Terbesar',
        gold: ['kasih Allah', 'Anak-Nya yang tunggal'],
        emerald: ['percaya kepada-Nya tidak binasa', 'hidup yang kekal']
    }
];

// ============================================================
// PERHITUNGAN ASTRONOMIS WAKTU MATAHARI TERBENAM (BUKA & TUTUP SABAT)
// Lokasi Default: GMAHK Jemaat Pisgah Bisdac, Batam (1.1278° LU, 104.0326° BT, UTC+7 WIB)
// ============================================================
export const PISGAH_DEFAULT_COORDS = { lat: 1.1278, lng: 104.0326, tz: 7, city: 'Batam, Kepri' };

export const getAstronomicalSunsetWIB = (dateInput, coords = PISGAH_DEFAULT_COORDS) => {
    const d = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput + 'T12:00:00');
    if (isNaN(d.getTime())) {
        return { hours: 18, minutes: 10, totalMinutes: 18 * 60 + 10, formatted: '18:10' };
    }
    const startOfYear = new Date(d.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((d - startOfYear) / (1000 * 60 * 60 * 24));
    const rad = Math.PI / 180;
    const deg = 180 / Math.PI;

    // Fractional year (gamma) in radians
    const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + 0.5);

    // Equation of time (in minutes)
    const eqTime = 229.18 * (
        0.000075 +
        0.001868 * Math.cos(gamma) -
        0.032077 * Math.sin(gamma) -
        0.014615 * Math.cos(2 * gamma) -
        0.040849 * Math.sin(2 * gamma)
    );

    // Solar declination (in radians)
    const decl =
        0.006918 -
        0.399912 * Math.cos(gamma) +
        0.070257 * Math.sin(gamma) -
        0.006758 * Math.cos(2 * gamma) +
        0.000907 * Math.sin(2 * gamma) -
        0.002697 * Math.cos(3 * gamma) +
        0.00148 * Math.sin(3 * gamma);

    // Zenith untuk matahari terbenam standar (90.833 derajat)
    const latRad = coords.lat * rad;
    const zenithRad = 90.833 * rad;
    const cosHA = (Math.cos(zenithRad) / (Math.cos(latRad) * Math.cos(decl))) - (Math.tan(latRad) * Math.tan(decl));
    const clampedCosHA = Math.max(-1, Math.min(1, cosHA));
    const haDeg = Math.acos(clampedCosHA) * deg;

    // Waktu sunset dalam menit dari tengah malam UTC, lalu tambah zona waktu (WIB = UTC+7)
    const sunsetUTCMinutes = 720 - 4 * (coords.lng - haDeg) - eqTime;
    const localMinutes = Math.round(sunsetUTCMinutes + coords.tz * 60);
    const hours = Math.floor(localMinutes / 60);
    const minutes = localMinutes % 60;
    const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    return {
        hours,
        minutes,
        totalMinutes: hours * 60 + minutes,
        formatted
    };
};

// Menghitung jadwal Buka Sabat (Jumat sore) & Tutup Sabat (Sabtu sore) untuk pekan berjalan atau tanggal terpilih
export const getSabbathSunsetSchedule = (refDateInput = new Date()) => {
    const ref = refDateInput instanceof Date ? new Date(refDateInput) : new Date(refDateInput + 'T12:00:00');
    const day = ref.getDay(); // 0: Min ... 5: Jum, 6: Sab
    const fridayDate = new Date(ref);
    fridayDate.setHours(12, 0, 0, 0);

    if (day === 6) {
        // Jika hari Sabtu, Jumatnya adalah kemarin (H-1)
        fridayDate.setDate(ref.getDate() - 1);
    } else {
        // Hari Minggu–Jumat: cari Jumat pekan ini
        const diffToFriday = (5 - day + 7) % 7;
        fridayDate.setDate(ref.getDate() + diffToFriday);
    }

    const saturdayDate = new Date(fridayDate);
    saturdayDate.setDate(fridayDate.getDate() + 1);

    const bukaSabat = getAstronomicalSunsetWIB(fridayDate);
    const tutupSabat = getAstronomicalSunsetWIB(saturdayDate);

    return {
        fridayDate,
        saturdayDate,
        fridayYMD: toYMD(fridayDate),
        saturdayYMD: toYMD(saturdayDate),
        bukaSabat,
        tutupSabat,
        location: PISGAH_DEFAULT_COORDS.city
    };
};

// ============================================================
// HELPER PENGINGAT WHATSAPP SEKALI KLIK UNTUK PETUGAS IBADAH
// ============================================================
export const DEFAULT_PLACEHOLDER_OFFICERS = new Set([
    '-', '', 'pemimpin', 'renungan', 'doa', 'tempat', 'lagu pujian', 'diakon', 'diakones',
    'pianis', 'pemimpin acara', 'video', 'doa tutup', 'sermon', 'syafaat', 'sermonette',
    'spesialsong', 'pianis ss', 'pianis khotbah', 'gitar'
]);

export const isRealOfficerName = (nama, tugas = '') => {
    if (!nama || typeof nama !== 'string') return false;
    const clean = nama.trim();
    if (!clean || clean === '-' || clean === '...') return false;
    if (DEFAULT_PLACEHOLDER_OFFICERS.has(clean.toLowerCase())) return false;
    if (tugas && clean.toLowerCase() === String(tugas).trim().toLowerCase()) return false;
    return true;
};

export const findOfficerPhoneFromPejabat = (officerName, dataPejabat = []) => {
    if (!officerName || !Array.isArray(dataPejabat)) return '';
    const normalizeName = (str) =>
        String(str || '')
            .toLowerCase()
            .replace(/^(pdt\.|bpk\.|ibu\.|ibu|sdr\.|sdri\.|zw\.|eld\.|ev\.)\s*/gi, '')
            .replace(/[^a-z0-9\s]/gi, '')
            .trim();

    const target = normalizeName(officerName);
    if (!target || target.length < 3) return '';

    const match = dataPejabat.find(p => {
        if (!p || !p.nama || !p.wa) return false;
        const pClean = normalizeName(p.nama);
        if (!pClean || pClean.includes('nama ')) return false;
        return pClean === target || pClean.includes(target) || target.includes(pClean);
    });

    if (match && match.wa) {
        const digits = String(match.wa).replace(/\D/g, '');
        if (digits && digits !== '62800000000' && digits.length >= 9) {
            return digits.startsWith('0') ? '62' + digits.slice(1) : digits;
        }
    }
    return '';
};

export const sendWhatsAppOfficerReminder = ({ nama, tugas, sesi, dateStr, waktu, dataPejabat = [] }) => {
    if (!nama) return;
    const jadwalUrl = getCleanShareUrl('jadwal');
    const kertasAcaraUrl = getCleanShareUrl('susunan_ibadah');
    const formattedDate = dateStr ? formatIndoDate(dateStr) : '-';
    const timeLabel = waktu || 'Sesuai Jadwal Ibadah';

    const message =
        `Shalom *${nama.trim()}* 🙏,\n\n` +
        `Salam kasih dalam Tuhan Yesus. Mengingatkan dengan kasih untuk jadwal pelayanan Anda di *GMAHK Jemaat Pisgah Bisdac*:\n\n` +
        `🗓️ *Hari/Tanggal:* ${formattedDate}\n` +
        `⛪ *Kebaktian:* ${sesi || 'Ibadah Jemaat'}\n` +
        `⏰ *Waktu:* ${timeLabel}\n` +
        `📋 *Tugas Pelayanan:* *${tugas || 'Pelayan Ibadah'}*\n\n` +
        `Mohon kesediaannya untuk hadir 15 menit lebih awal untuk doa persiapan bersama. Apabila berhalangan hadir, mohon dapat menginformasikan lebih awal kepada Koordinator Ibadah / Sekretaris Gereja.\n\n` +
        `📄 *Lihat Jadwal & Kertas Acara:*\n` +
        `• Jadwal: ${jadwalUrl}\n` +
        `• Kertas Acara: ${kertasAcaraUrl}\n\n` +
        `Terima kasih atas pelayanan Anda. Tuhan Yesus memberkati! 🕊️`;

    const phone = findOfficerPhoneFromPejabat(nama, dataPejabat);
    const waUrl = phone
        ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
};

export const shareSabbathDutyRecapToWhatsApp = ({ activeSabat, sabatYMD, jadwalDB = {} }) => {
    const today = new Date();
    // Cari tanggal Sabat terdekat jika tidak ada
    let targetDate = sabatYMD || (activeSabat?.date) || '';
    if (!targetDate && jadwalDB && typeof jadwalDB === 'object') {
        const dates = Object.keys(jadwalDB).sort();
        targetDate = dates.find(d => {
            const dt = new Date(d + 'T00:00:00');
            return dt >= today && dt.getDay() === 6;
        }) || dates[0] || '';
    }

    const sData = activeSabat || (targetDate && jadwalDB[targetDate]) || {};
    const dateFormatted = targetDate ? formatIndoDate(targetDate) : 'Sabat Ini';

    let msg = `*📋 REKAP JADWAL PETUGAS IBADAH SABAT*\n`;
    msg += `*GMAHK Jemaat Pisgah BISDAC - Batam*\n`;
    msg += `🗓️ *${dateFormatted}*\n\n`;

    // 1. Sekolah Sabat
    msg += `🏫 *SEKOLAH SABAT (09:15 WIB)*\n`;
    const ssList = Array.isArray(sData.sekolahSabat) ? sData.sekolahSabat : [];
    if (ssList.length > 0) {
        ssList.forEach(p => {
            if (p.nama && p.tugas) msg += `• ${p.tugas}: *${p.nama}*\n`;
        });
    } else {
        msg += `• Petugas terjadwal sesuai pengumuman\n`;
    }
    msg += `\n`;

    // 2. Kebaktian Khotbah
    msg += `🕊️ *KEBAKTIAN KHOTBAH (10:30 WIB)*\n`;
    const khotbahList = Array.isArray(sData.khotbah) ? sData.khotbah : [];
    if (khotbahList.length > 0) {
        khotbahList.forEach(p => {
            if (p.nama && p.tugas) msg += `• ${p.tugas}: *${p.nama}*\n`;
        });
    } else {
        msg += `• Petugas terjadwal sesuai susunan acara\n`;
    }
    msg += `\n`;

    // 3. Pelayanan Musik
    const musikList = Array.isArray(sData.musik) ? sData.musik : [];
    if (musikList.length > 0) {
        msg += `🎶 *PELAYANAN MUSIK*\n`;
        musikList.forEach(p => {
            if (p.nama && p.tugas) msg += `• ${p.tugas}: *${p.nama}*\n`;
        });
        msg += `\n`;
    }

    // 4. Pelayanan Diakon
    const diakonList = Array.isArray(sData.diakon) ? sData.diakon : [];
    if (diakonList.length > 0) {
        msg += `🤝 *PELAYANAN DIAKON & DIAKONES*\n`;
        diakonList.forEach(p => {
            if (p.nama && p.tugas) msg += `• ${p.tugas}: *${p.nama}*\n`;
        });
        msg += `\n`;
    }

    msg += `_Catatan: Mohon seluruh petugas dapat hadir 15 menit lebih awal untuk doa konsistori bersama._\n\n`;
    msg += `📱 *Kertas Acara & Warta Digital:*\n${getCleanShareUrl('susunan_ibadah')}\n\n`;
    msg += `Tuhan Yesus memberkati pelayanan kita bersama! 🙏`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
};

// ============================================================
// WIDGET 1: SABBATH COUNTDOWN & GREETING (ASTRONOMICAL SUNSET)
// ============================================================
export const SabbathCountdownWidget = ({ setActiveTab }) => {
    const [status, setStatus] = React.useState(() => {
        const sched = getSabbathSunsetSchedule(new Date());
        return {
            isSabbath: false,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            bukaFormatted: sched.bukaSabat.formatted,
            tutupFormatted: sched.tutupSabat.formatted,
            fridayShort: formatIndoDateShort(sched.fridayYMD),
            saturdayShort: formatIndoDateShort(sched.saturdayYMD),
            location: sched.location
        };
    });

    React.useEffect(() => {
        const calculate = () => {
            const now = new Date();
            const day = now.getDay(); // 0: Min, 1: Sen, ..., 5: Jum, 6: Sab
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            const todaySunset = getAstronomicalSunsetWIB(now);
            // Cek apakah saat ini sedang dalam jam Sabat Kudus (Jumat setelah sunset s/d Sabtu sebelum sunset)
            const isSabbath =
                (day === 5 && currentMinutes >= todaySunset.totalMinutes) ||
                (day === 6 && currentMinutes < todaySunset.totalMinutes);

            if (isSabbath) {
                const sched = getSabbathSunsetSchedule(now);
                const end = new Date(sched.saturdayDate);
                end.setHours(sched.tutupSabat.hours, sched.tutupSabat.minutes, 0, 0);

                const diff = Math.max(0, end.getTime() - now.getTime());
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);

                setStatus({
                    isSabbath: true,
                    days: 0,
                    hours,
                    minutes,
                    seconds,
                    bukaFormatted: sched.bukaSabat.formatted,
                    tutupFormatted: sched.tutupSabat.formatted,
                    fridayShort: formatIndoDateShort(sched.fridayYMD),
                    saturdayShort: formatIndoDateShort(sched.saturdayYMD),
                    location: sched.location
                });
            } else {
                // Jika hari Sabtu dan sudah lewat waktu tutup Sabat, hitung menuju Jumat minggu depan
                const refForNext = new Date(now);
                if (day === 6 && currentMinutes >= todaySunset.totalMinutes) {
                    refForNext.setDate(now.getDate() + 2);
                }
                const sched = getSabbathSunsetSchedule(refForNext);
                const target = new Date(sched.fridayDate);
                target.setHours(sched.bukaSabat.hours, sched.bukaSabat.minutes, 0, 0);

                const diff = Math.max(0, target.getTime() - now.getTime());
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);

                setStatus({
                    isSabbath: false,
                    days,
                    hours,
                    minutes,
                    seconds,
                    bukaFormatted: sched.bukaSabat.formatted,
                    tutupFormatted: sched.tutupSabat.formatted,
                    fridayShort: formatIndoDateShort(sched.fridayYMD),
                    saturdayShort: formatIndoDateShort(sched.saturdayYMD),
                    location: sched.location
                });
            }
        };

        calculate();
        const interval = setInterval(calculate, 1000);
        return () => clearInterval(interval);
    }, []);

    if (status.isSabbath) {
        return (
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2C3F21] via-[#3A5836] to-[#4A7045] dark:from-navy-950 dark:via-navy-900 dark:to-navy-800 text-white p-6 md:p-7 shadow-xl border-2 border-[#D19B45]/40 flex flex-col justify-between group">
                <div className="absolute top-0 right-0 w-44 h-44 bg-[#D19B45]/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#D19B45] text-navy-950 font-black text-[11px] uppercase tracking-wider shadow-md">
                        🕊️ Hari Sabat Kudus
                    </span>
                    <span className="text-[11px] text-white/90 font-bold bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 flex items-center gap-1.5">
                        <Icon name="Sun" className="w-3.5 h-3.5 text-gold-300" />
                        Tutup Sabat: pk {status.tutupFormatted} WIB
                    </span>
                </div>
                <div className="relative z-10 mb-4">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2">
                        Selamat Hari Sabat!
                    </h3>
                    <p className="text-white/90 text-xs md:text-sm leading-relaxed font-light italic">
                        "Kuduskanlah hari Sabat-Ku, menjadi tanda antara Aku dan kamu, supaya kamu mengetahui bahwa Akulah TUHAN, Allahmu."
                    </p>
                    <span className="block text-[11px] font-bold text-[#D19B45] dark:text-gold-400 mt-1">
                        — Yehezkiel 20:20
                    </span>
                </div>

                {/* Info Buka & Tutup Sabat Otomatis */}
                <div className="relative z-10 grid grid-cols-2 gap-2.5 mb-4 bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shrink-0">
                            <Icon name="Sun" className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="block text-[9px] uppercase tracking-wider text-white/70 font-bold truncate">Buka Sabat (Jumat)</span>
                            <span className="block text-xs sm:text-sm font-black text-white">{status.bukaFormatted} WIB</span>
                            <span className="block text-[10px] text-white/60 truncate">{status.fridayShort}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 border-l border-white/15 pl-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gold-400/20 border border-gold-300/30 flex items-center justify-center text-gold-300 shrink-0">
                            <Icon name="Moon" className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="block text-[9px] uppercase tracking-wider text-white/70 font-bold truncate">Tutup Sabat (Sabtu)</span>
                            <span className="block text-xs sm:text-sm font-black text-gold-300">{status.tutupFormatted} WIB</span>
                            <span className="block text-[10px] text-white/60 truncate">{status.saturdayShort}</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-3 pt-3 border-t border-white/15">
                    <button
                        onClick={() => setActiveTab('susunan_ibadah')}
                        className="bg-[#D19B45] hover:bg-[#B8863B] active:scale-95 text-navy-950 text-xs md:text-sm font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                        <Icon name="List" className="w-4 h-4" /> Susunan Ibadah
                    </button>
                    <button
                        onClick={() => setActiveTab('lagu_sion')}
                        className="bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition-all backdrop-blur-md border border-white/20 flex items-center gap-1.5"
                    >
                        <Icon name="Music" className="w-4 h-4" /> Lagu Sion
                    </button>
                    <span className="text-[11px] text-white/80 ml-auto font-mono bg-black/25 px-2.5 py-1 rounded-lg">
                        Tutup dlm: {String(status.hours).padStart(2, '0')}:{String(status.minutes).padStart(2, '0')}:{String(status.seconds).padStart(2, '0')}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-[#F7F9F3] to-[#E9EFE2] dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 p-6 md:p-7 shadow-xl border-2 border-[#E2E8D8] dark:border-navy-700 flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#4A7045]/10 dark:bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-between gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A7045]/10 dark:bg-gold-500/15 text-[#2C3F21] dark:text-gold-400 font-extrabold text-[11px] uppercase tracking-wider border border-[#4A7045]/20 dark:border-gold-500/30">
                    <Icon name="Sun" className="w-3.5 h-3.5 text-[#D19B45] dark:text-gold-400" /> Waktu Sabat & Sunset
                </span>
                <span className="text-[11px] text-[#596B4D] dark:text-gray-400 font-bold flex items-center gap-1">
                    <Icon name="MapPin" className="w-3 h-3 text-[#D19B45]" /> {status.location}
                </span>
            </div>

            <div className="relative z-10 mb-3">
                <h3 className="text-xl md:text-2xl font-black text-[#2C3F21] dark:text-white tracking-tight leading-snug">
                    Menyambut Hari Sabat Kudus
                </h3>
                <p className="text-[#596B4D] dark:text-gray-300 text-xs md:text-sm mt-0.5">
                    Hitung mundur otomatis menuju waktu matahari terbenam (Buka Sabat).
                </p>
            </div>

            {/* Jadwal Buka & Tutup Sabat Otomatis (Sunset Pekan Ini) */}
            <div className="relative z-10 grid grid-cols-2 gap-2.5 mb-3 bg-white/85 dark:bg-navy-950/60 p-3 rounded-2xl border border-[#E2E8D8] dark:border-navy-700/80 shadow-2xs">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 dark:bg-gold-500/15 border border-amber-500/30 flex items-center justify-center text-[#D19B45] dark:text-gold-400 shrink-0">
                        <Icon name="Sun" className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-[9px] uppercase tracking-wider text-[#596B4D] dark:text-gray-400 font-extrabold truncate">🌅 Buka Sabat (Jumat)</span>
                        <span className="block text-xs sm:text-sm font-black text-[#2C3F21] dark:text-gold-400">{status.bukaFormatted} WIB</span>
                        <span className="block text-[10px] text-[#596B4D] dark:text-gray-400 font-medium truncate">{status.fridayShort}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 border-l border-[#E2E8D8] dark:border-navy-700 pl-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#4A7045]/15 dark:bg-emerald-500/15 border border-[#4A7045]/30 flex items-center justify-center text-[#4A7045] dark:text-emerald-400 shrink-0">
                        <Icon name="Moon" className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-[9px] uppercase tracking-wider text-[#596B4D] dark:text-gray-400 font-extrabold truncate">🌇 Tutup Sabat (Sabtu)</span>
                        <span className="block text-xs sm:text-sm font-black text-[#2C3F21] dark:text-emerald-400">{status.tutupFormatted} WIB</span>
                        <span className="block text-[10px] text-[#596B4D] dark:text-gray-400 font-medium truncate">{status.saturdayShort}</span>
                    </div>
                </div>
            </div>

            {/* Countdown Tiles */}
            <div className="relative z-10 grid grid-cols-4 gap-2 md:gap-3 my-1">
                <div className="bg-white/80 dark:bg-navy-950/70 backdrop-blur-md rounded-2xl p-2.5 text-center border border-[#E2E8D8] dark:border-navy-700 shadow-sm">
                    <span className="block text-xl md:text-2xl font-black text-[#2C3F21] dark:text-gold-400 font-mono">
                        {status.days}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-bold text-[#596B4D] dark:text-gray-400 uppercase tracking-wider">
                        Hari
                    </span>
                </div>
                <div className="bg-white/80 dark:bg-navy-950/70 backdrop-blur-md rounded-2xl p-2.5 text-center border border-[#E2E8D8] dark:border-navy-700 shadow-sm">
                    <span className="block text-xl md:text-2xl font-black text-[#2C3F21] dark:text-gold-400 font-mono">
                        {String(status.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-bold text-[#596B4D] dark:text-gray-400 uppercase tracking-wider">
                        Jam
                    </span>
                </div>
                <div className="bg-white/80 dark:bg-navy-950/70 backdrop-blur-md rounded-2xl p-2.5 text-center border border-[#E2E8D8] dark:border-navy-700 shadow-sm">
                    <span className="block text-xl md:text-2xl font-black text-[#2C3F21] dark:text-gold-400 font-mono">
                        {String(status.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-bold text-[#596B4D] dark:text-gray-400 uppercase tracking-wider">
                        Menit
                    </span>
                </div>
                <div className="bg-white/80 dark:bg-navy-950/70 backdrop-blur-md rounded-2xl p-2.5 text-center border border-[#E2E8D8] dark:border-navy-700 shadow-sm">
                    <span className="block text-xl md:text-2xl font-black text-[#D19B45] dark:text-gold-400 font-mono">
                        {String(status.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-bold text-[#596B4D] dark:text-gray-400 uppercase tracking-wider">
                        Detik
                    </span>
                </div>
            </div>

            <div className="relative z-10 pt-3 mt-2.5 border-t border-[#E2E8D8] dark:border-navy-700/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#596B4D] dark:text-gray-400 italic">
                    "Ingatlah dan kuduskanlah hari Sabat"
                </span>
                <button
                    onClick={() => setActiveTab('jadwal')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-navy-800/90 text-[#4A7045] dark:text-gold-400 border border-[#C5D5BC] dark:border-navy-700 hover:border-[#4A7045] dark:hover:border-gold-500/60 hover:bg-[#F2F6ED] dark:hover:bg-navy-700/80 font-extrabold text-xs shadow-xs hover:shadow transition-all duration-200 active:scale-95 group backdrop-blur-md"
                >
                    <span>Lihat Jadwal</span>
                    <Icon name="ChevronRight" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
};

// ============================================================
// WIDGET 2: AYAT HARIAN & RENUNGAN INSPIRATIF
// ============================================================
// Helper: Highlighting keywords with warm gold and fresh emerald accents (without boxes)
export const renderHighlightedText = (text, goldWords = [], emeraldWords = []) => {
    if (!text) return null;

    const defaultGold = ['TUHAN', 'Allah', 'Kristus', 'Yesus', 'Roh Kudus', 'Bapa-Ku', 'Allahmu'];
    const defaultEmerald = ['damai sejahtera', 'kasih karunia', 'sukacita'];

    const phraseMap = {};
    [...defaultGold, ...(goldWords || [])].forEach(w => {
        if (w && w.trim()) phraseMap[w.trim().toLowerCase()] = { orig: w.trim(), type: 'gold' };
    });
    [...defaultEmerald, ...(emeraldWords || [])].forEach(w => {
        if (w && w.trim()) phraseMap[w.trim().toLowerCase()] = { orig: w.trim(), type: 'emerald' };
    });

    const allPhrases = Object.values(phraseMap).map(x => x.orig).sort((a, b) => b.length - a.length);
    if (allPhrases.length === 0) return text;

    const escapeRegex = (s) => s.replace(/[-/\^$*+?.()|[\]{}]/g, '\$&');
    const pattern = new RegExp(`(${allPhrases.map(escapeRegex).join('|')})`, 'gi');

    const parts = text.split(pattern);

    return parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        const match = phraseMap[lowerPart];
        if (match) {
            if (match.type === 'gold') {
                return (
                    <span
                        key={index}
                        className="font-black text-[#B87714] dark:text-[#FBBF24]"
                    >
                        {part}
                    </span>
                );
            } else {
                return (
                    <span
                        key={index}
                        className="font-black text-[#266825] dark:text-[#34D399]"
                    >
                        {part}
                    </span>
                );
            }
        }
        return part;
    });
};

export const VERSE_CARD_THEMES = [
    {
        id: 'navy_gold',
        name: 'Royal Navy',
        bgStart: '#071120',
        bgMid: '#0F2544',
        bgEnd: '#060D1A',
        accent: '#E5B05C',
        accentSoft: 'rgba(229, 176, 92, 0.18)',
        textMain: '#FFFFFF',
        textSub: '#FDE68A',
        badgeBg: 'rgba(229, 176, 92, 0.2)',
        previewClass: 'from-[#071120] via-[#0F2544] to-[#060D1A] border-[#E5B05C]'
    },
    {
        id: 'emerald_forest',
        name: 'Hijau Pisgah',
        bgStart: '#0D2618',
        bgMid: '#1B432C',
        bgEnd: '#091A10',
        accent: '#FBBF24',
        accentSoft: 'rgba(251, 191, 36, 0.16)',
        textMain: '#FFFFFF',
        textSub: '#A7F3D0',
        badgeBg: 'rgba(16, 185, 129, 0.22)',
        previewClass: 'from-[#0D2618] via-[#1B432C] to-[#091A10] border-emerald-400'
    },
    {
        id: 'sunset_sabbath',
        name: 'Senja Sabat',
        bgStart: '#2E1035',
        bgMid: '#6D2346',
        bgEnd: '#1E0B24',
        accent: '#FCD34D',
        accentSoft: 'rgba(252, 211, 77, 0.18)',
        textMain: '#FFFFFF',
        textSub: '#FDE68A',
        badgeBg: 'rgba(251, 146, 60, 0.22)',
        previewClass: 'from-[#2E1035] via-[#6D2346] to-[#1E0B24] border-amber-300'
    },
    {
        id: 'midnight_purple',
        name: 'Ungu Agung',
        bgStart: '#160F30',
        bgMid: '#2B1E58',
        bgEnd: '#0D0820',
        accent: '#F59E0B',
        accentSoft: 'rgba(245, 158, 11, 0.18)',
        textMain: '#FFFFFF',
        textSub: '#DDD6FE',
        badgeBg: 'rgba(167, 139, 250, 0.2)',
        previewClass: 'from-[#160F30] via-[#2B1E58] to-[#0D0820] border-purple-400'
    },
    {
        id: 'ivory_classic',
        name: 'Krem Klasik',
        bgStart: '#FFFDF9',
        bgMid: '#F7EFE1',
        bgEnd: '#EFE2C9',
        accent: '#9A6519',
        accentSoft: 'rgba(154, 101, 25, 0.14)',
        textMain: '#1E293B',
        textSub: '#78350F',
        badgeBg: 'rgba(180, 127, 36, 0.15)',
        previewClass: 'from-[#FFFDF9] via-[#F7EFE1] to-[#EFE2C9] border-amber-700 text-navy-900'
    }
];

export const VerseImageCardModal = ({ isOpen, onClose, reference = '', verseText = '', subtitle = 'SABDA HIDUP • ALKITAB TB', verseUrl = '' }) => {
    const canvasRef = React.useRef(null);
    const [themeId, setThemeId] = React.useState('navy_gold');
    const [aspect, setAspect] = React.useState('story'); // 'story' (1080x1920) | 'square' (1080x1080)
    const [customNote, setCustomNote] = React.useState('');
    const [previewUrl, setPreviewUrl] = React.useState('');
    const [isSharing, setIsSharing] = React.useState(false);
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [copyFeedback, setCopyFeedback] = React.useState('');
    const [downloadFeedback, setDownloadFeedback] = React.useState(false);
    const [copyTextFeedback, setCopyTextFeedback] = React.useState(false);

    const activeTheme = VERSE_CARD_THEMES.find(t => t.id === themeId) || VERSE_CARD_THEMES[0];

    // Helper untuk mendapatkan link URL ayat secara dinamis jika tidak diberikan langsung
    const targetVerseUrl = React.useMemo(() => {
        if (verseUrl) return verseUrl;
        if (!reference) return getCleanShareUrl('alkitab');
        const match = reference.trim().match(/^(.+?)\s+(\d+)\s*:\s*(.+)$/);
        if (match) {
            return getCleanShareUrl('alkitab', {
                kitab: match[1].trim(),
                pasal: match[2].trim(),
                ayat: match[3].trim()
            });
        }
        return getCleanShareUrl('alkitab');
    }, [verseUrl, reference]);

    const notePart = customNote && customNote.trim() ? `\n\n💬 _"${customNote.trim()}"_` : '';
    const linkPart = targetVerseUrl ? `\n\n📖 Baca & renungkan di Alkitab Digital:\n${targetVerseUrl}` : '';
    const shareText = `📖 *${reference}*\n\n"${verseText}"${notePart}\n\n🕊️ _GMAHK Jemaat Pisgah BISDAC - Batam_${linkPart}`;

    const handleCopyTextWithLink = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopyTextFeedback(true);
            setTimeout(() => setCopyTextFeedback(false), 3000);
        } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = shareText;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopyTextFeedback(true);
            setTimeout(() => setCopyTextFeedback(false), 3000);
        }
    };

    const drawCardToCanvas = React.useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isOpen) return;
        const ctx = canvas.getContext('2d');
        const W = 1080;
        const H = aspect === 'story' ? 1920 : 1080;
        canvas.width = W;
        canvas.height = H;

        // 1. Background Gradient
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, activeTheme.bgStart);
        grad.addColorStop(0.5, activeTheme.bgMid);
        grad.addColorStop(1, activeTheme.bgEnd);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // 2. Ambient Glow Circles
        ctx.save();
        const glow1 = ctx.createRadialGradient(W * 0.85, H * 0.15, 20, W * 0.85, H * 0.15, 420);
        glow1.addColorStop(0, activeTheme.accentSoft);
        glow1.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow1;
        ctx.fillRect(0, 0, W, H);

        const glow2 = ctx.createRadialGradient(W * 0.15, H * 0.85, 20, W * 0.15, H * 0.85, 460);
        glow2.addColorStop(0, activeTheme.accentSoft);
        glow2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow2;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();

        // 3. Decorative Outer & Inner Gold Frames
        const pad = aspect === 'story' ? 64 : 52;
        ctx.save();
        ctx.strokeStyle = activeTheme.accent;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 3;
        ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([12, 8]);
        ctx.strokeRect(pad + 18, pad + 18, W - (pad + 18) * 2, H - (pad + 18) * 2);
        ctx.restore();

        // 4. Top Header Pill
        const topY = aspect === 'story' ? 175 : 130;
        ctx.save();
        ctx.font = '800 24px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = activeTheme.accent;
        ctx.textAlign = 'center';
        ctx.letterSpacing = '4px';
        ctx.fillText((subtitle || 'SABDA TUHAN • ALKITAB TB').toUpperCase(), W / 2, topY);

        // Decorative divider line under header
        ctx.beginPath();
        ctx.moveTo(W / 2 - 90, topY + 26);
        ctx.lineTo(W / 2 + 90, topY + 26);
        ctx.strokeStyle = activeTheme.accent;
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        // 5. Giant Quotation Mark Watermark
        ctx.save();
        ctx.font = '900 220px Georgia, serif';
        ctx.fillStyle = activeTheme.accent;
        ctx.globalAlpha = 0.15;
        ctx.textAlign = 'center';
        ctx.fillText('“', W / 2, aspect === 'story' ? 430 : 290);
        ctx.restore();

        // 6. Word-Wrap Verse Text Automatically
        const cleanVerse = (verseText || '').replace(/\s+/g, ' ').trim();
        const maxTextWidth = W - (pad + 75) * 2;
        let fontSize = aspect === 'story' ? 50 : 42;
        if (cleanVerse.length > 350) fontSize = aspect === 'story' ? 34 : 28;
        else if (cleanVerse.length > 240) fontSize = aspect === 'story' ? 40 : 33;
        else if (cleanVerse.length > 150) fontSize = aspect === 'story' ? 45 : 37;

        ctx.font = `600 ${fontSize}px Georgia, "Times New Roman", serif`;
        const words = cleanVerse.split(' ');
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxTextWidth && currentLine) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);

        const lineHeight = Math.round(fontSize * 1.52);
        const totalTextHeight = lines.length * lineHeight;
        const centerY = aspect === 'story' ? H * 0.49 : H * 0.48;
        let startY = centerY - totalTextHeight / 2 + fontSize / 2;

        ctx.save();
        ctx.fillStyle = activeTheme.textMain;
        ctx.textAlign = 'center';
        ctx.font = `600 ${fontSize}px Georgia, "Times New Roman", serif`;
        lines.forEach((line, idx) => {
            ctx.fillText(line, W / 2, startY + idx * lineHeight);
        });
        ctx.restore();

        // 7. Reference Badge (Book Chapter:Verse)
        const refY = startY + lines.length * lineHeight + (aspect === 'story' ? 58 : 38);
        ctx.save();
        ctx.font = `900 ${aspect === 'story' ? 38 : 34}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = activeTheme.accent;
        ctx.textAlign = 'center';
        ctx.fillText(`— ${reference} —`, W / 2, refY);
        ctx.restore();

        // 8. Optional Personal Reflection / Note
        if (customNote.trim()) {
            ctx.save();
            ctx.font = `italic 600 ${aspect === 'story' ? 28 : 24}px system-ui, -apple-system, sans-serif`;
            ctx.fillStyle = activeTheme.textSub;
            ctx.textAlign = 'center';
            const trimmedNote = customNote.trim().slice(0, 90);
            ctx.fillText(`"${trimmedNote}"`, W / 2, refY + (aspect === 'story' ? 56 : 42));
            ctx.restore();
        }

        // 9. Footer Church Branding Watermark
        const footerY = H - pad - (aspect === 'story' ? 85 : 60);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(W / 2 - 210, footerY - 38);
        ctx.lineTo(W / 2 + 210, footerY - 38);
        ctx.strokeStyle = activeTheme.accent;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.globalAlpha = 0.95;
        ctx.font = '900 24px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = activeTheme.accent;
        ctx.textAlign = 'center';
        ctx.fillText('GMAHK JEMAAT PISGAH BISDAC - BATAM', W / 2, footerY);

        ctx.globalAlpha = 0.75;
        ctx.font = '700 20px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = activeTheme.textSub;
        ctx.fillText('PISGAH BISDAC • Alkitab Digital Jemaat', W / 2, footerY + 32);
        ctx.restore();

        // Konversi Canvas ke Blob URL untuk ditampilkan via tag <img> asli (mendukung Long-Press Save di HP)
        try {
            canvas.toBlob((blob) => {
                if (blob) {
                    const newUrl = URL.createObjectURL(blob);
                    setPreviewUrl(prev => {
                        if (prev && prev.startsWith('blob:')) {
                            try { URL.revokeObjectURL(prev); } catch (e) { }
                        }
                        return newUrl;
                    });
                }
            }, 'image/png');
        } catch (e) {
            try {
                setPreviewUrl(canvas.toDataURL('image/png'));
            } catch (err) { }
        }
    }, [isOpen, aspect, activeTheme, verseText, reference, subtitle, customNote]);

    React.useEffect(() => {
        drawCardToCanvas();
    }, [drawCardToCanvas]);

    React.useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                try { URL.revokeObjectURL(previewUrl); } catch (e) { }
            }
        };
    }, [previewUrl]);

    if (!isOpen) return null;

    // Helper simpan / unduh berkas gambar HD
    const handleDownloadImage = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsDownloading(true);
        const safeRef = (reference || 'Ayat').replace(/[^a-zA-Z0-9_-]/g, '-');
        const filename = `Kartu-Ayat-${safeRef}-PisgahBisdac.png`;

        try {
            // Gunakan canvas.toBlob agar tidak terkena pembatasan data URL pada peramban mobile (iOS/Android)
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error("Gagal membuat blob gambar");

            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.setAttribute('download', filename);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                try {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                } catch (e) { }
            }, 30000);

            setDownloadFeedback(true);
            setTimeout(() => setDownloadFeedback(false), 3000);
        } catch (err) {
            console.warn("Download via blob gagal, coba fallback dataURL:", err);
            try {
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = filename;
                link.setAttribute('download', filename);
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    try { document.body.removeChild(link); } catch (e) { }
                }, 1000);
                setDownloadFeedback(true);
                setTimeout(() => setDownloadFeedback(false), 3000);
            } catch (fallbackErr) {
                alert("Peramban Anda membatasi pengunduhan otomatis. Silakan tekan dan tahan (long-press) gambar kartu di atas lalu pilih 'Simpan Gambar' ke Galeri foto HP Anda.");
            }
        } finally {
            setIsDownloading(false);
        }
    };

    // Helper salin gambar langsung ke Clipboard (Dapat ditempel langsung di WhatsApp / Sosmed dengan Ctrl + V)
    const handleCopyImage = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error("Gagal menghasilkan gambar");

            if (navigator.clipboard && typeof window.ClipboardItem !== 'undefined' && navigator.clipboard.write) {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                setCopyFeedback('copied');
                setTimeout(() => setCopyFeedback(''), 3500);
                return true;
            } else {
                throw new Error("ClipboardItem tidak didukung");
            }
        } catch (err) {
            console.warn("Gagal menyalin gambar langsung:", err);
            try {
                await navigator.clipboard.writeText(shareText);
                setCopyFeedback('text_copied');
                setTimeout(() => setCopyFeedback(''), 3500);
            } catch (e) {
                setCopyFeedback('failed');
                setTimeout(() => setCopyFeedback(''), 3500);
            }
            return false;
        }
    };

    // Helper bagikan gambar ke WhatsApp / Media Sosial
    const handleShareImage = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsSharing(true);
        const safeRef = (reference || 'Ayat').replace(/[^a-zA-Z0-9_-]/g, '-');
        const filename = `Kartu-Ayat-${safeRef}-PisgahBisdac.png`;

        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error("Gagal menghasilkan gambar");

            const file = new File([blob], filename, { type: 'image/png' });

            // 1. Coba Web Share API bawaan (Sangat optimal untuk HP Android & iOS Safari)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: `Kartu Ayat ${reference}`,
                        text: shareText,
                        files: [file]
                    });
                    setIsSharing(false);
                    return;
                } catch (shareErr) {
                    if (shareErr.name === 'AbortError') {
                        setIsSharing(false);
                        return;
                    }
                    console.warn("Web Share API dengan file gagal, melanjutkan ke mode copy & WhatsApp Web:", shareErr);
                }
            }

            // 2. Jika Web Share API tidak mendukung file gambar (seperti Desktop PC / WA Web):
            // Salin gambar ke clipboard agar pengguna tinggal menempelkan (Ctrl+V) di WA!
            let isCopied = false;
            if (navigator.clipboard && typeof window.ClipboardItem !== 'undefined' && navigator.clipboard.write) {
                try {
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    isCopied = true;
                } catch (cErr) { }
            }

            // Unduh file gambar otomatis ke komputer/perangkat
            handleDownloadImage();

            // Buka WhatsApp
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
            window.open(waUrl, '_blank');

            if (isCopied) {
                alert("✨ GAMBAR KARTU BERHASIL DISALIN & DIUNDUH!\n\nSaat chat WhatsApp terbuka:\n👉 Tekan Tempel (Ctrl + V di PC atau Paste di HP) pada kolom chat untuk langsung mengirim gambar kartu ayat ini.");
            } else {
                alert("✨ GAMBAR KARTU TELAH DIUNDUH!\n\nSaat chat WhatsApp terbuka:\n👉 Klik ikon lampiran (klip 📎 / foto 📷) lalu pilih kartu ayat yang baru saja diunduh untuk mengirimnya.");
            }
        } catch (err) {
            console.error("Gagal membagikan kartu:", err);
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
            window.open(waUrl, '_blank');
        } finally {
            setIsSharing(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-700 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl my-auto max-h-[94vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-navy-100 dark:border-navy-800">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gold-600 dark:text-gold-400 block">Status WA & Instagram Story</span>
                        <h3 className="text-base sm:text-lg font-black text-navy-900 dark:text-white flex items-center gap-2">
                            <Icon name="Sparkles" className="w-5 h-5 text-gold-500" />
                            Pembuat Kartu Gambar Ayat
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-navy-50 dark:bg-navy-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-navy-500 hover:text-red-500 flex items-center justify-center font-bold transition cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Canvas & Real Image Preview Column */}
                    <div className="md:col-span-6 flex flex-col items-center justify-center bg-navy-950/5 dark:bg-navy-950/60 rounded-2xl p-3 border border-navy-100 dark:border-navy-800">
                        {/* Hidden Canvas untuk rendering grafik HD */}
                        <canvas
                            ref={canvasRef}
                            style={{ display: 'none' }}
                        />

                        {/* Real <img> Tag: Menjamin dapat ditekan & tahan (Long-Press) di SEMUA HP untuk Simpan / Bagikan! */}
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt={`Kartu Ayat ${reference}`}
                                className={`rounded-xl shadow-lg border border-black/10 transition-all select-none ${aspect === 'story' ? 'max-h-[340px] sm:max-h-[390px] w-auto aspect-[9/16]' : 'max-h-[290px] sm:max-h-[330px] w-auto aspect-square'}`}
                            />
                        ) : (
                            <div className={`rounded-xl bg-navy-900/10 dark:bg-navy-950 flex items-center justify-center ${aspect === 'story' ? 'h-[340px] aspect-[9/16]' : 'h-[290px] aspect-square'}`}>
                                <span className="text-xs font-bold text-navy-400 animate-pulse">Menyiapkan kartu...</span>
                            </div>
                        )}

                        <div className="text-center mt-2.5 space-y-1">
                            <span className="text-[10px] font-bold text-navy-400 block">
                                Resolusi HD ({aspect === 'story' ? '1080 × 1920 px • Status WA / Story' : '1080 × 1080 px • Persegi'})
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-gold-400 bg-amber-50 dark:bg-navy-800/80 px-2.5 py-0.5 rounded-full border border-amber-200/60 dark:border-navy-700">
                                💡 <strong>Tips HP:</strong> Tekan & tahan gambar untuk 'Simpan ke Foto'
                            </span>
                        </div>
                    </div>

                    {/* Customization Controls Column */}
                    <div className="md:col-span-6 space-y-4">
                        {/* Aspect Ratio Picker */}
                        <div>
                            <label className="text-[11px] font-black uppercase tracking-wider text-navy-500 dark:text-navy-300 block mb-1.5">1. Ukuran Gambar</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAspect('story')}
                                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1.5 cursor-pointer ${aspect === 'story' ? 'bg-gold-500 text-navy-950 border-gold-500 shadow-sm font-black' : 'bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-navy-200 border-navy-200 dark:border-navy-700'}`}
                                >
                                    <span>📱 Status WA / Story (9:16)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAspect('square')}
                                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1.5 cursor-pointer ${aspect === 'square' ? 'bg-gold-500 text-navy-950 border-gold-500 shadow-sm font-black' : 'bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-navy-200 border-navy-200 dark:border-navy-700'}`}
                                >
                                    <span>🖼️ Persegi / Feed (1:1)</span>
                                </button>
                            </div>
                        </div>

                        {/* Theme Picker */}
                        <div>
                            <label className="text-[11px] font-black uppercase tracking-wider text-navy-500 dark:text-navy-300 block mb-1.5">2. Tema Warna Latar</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {VERSE_CARD_THEMES.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setThemeId(t.id)}
                                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border-2 transition flex items-center gap-2 cursor-pointer ${themeId === t.id ? 'border-gold-500 ring-2 ring-gold-400/30 bg-gold-50/40 dark:bg-navy-800 font-black' : 'border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-800/60'}`}
                                    >
                                        <span className={`w-4 h-4 rounded-full bg-gradient-to-br ${t.previewClass} shrink-0 border`} />
                                        <span className="truncate text-navy-800 dark:text-navy-100 text-[11px]">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Optional Short Caption */}
                        <div>
                            <label className="text-[11px] font-black uppercase tracking-wider text-navy-500 dark:text-navy-300 block mb-1.5">3. Catatan / Ucapan Singkat (Opsional)</label>
                            <input
                                type="text"
                                maxLength={80}
                                value={customNote}
                                onChange={(e) => setCustomNote(e.target.value)}
                                placeholder="Misal: Selamat Hari Sabat / Tuhan Memberkati..."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 text-xs font-semibold text-navy-900 dark:text-white outline-none focus:border-gold-500"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 space-y-2">
                            {/* Tombol 1: Kirim Gambar ke WhatsApp */}
                            <button
                                type="button"
                                onClick={handleShareImage}
                                disabled={isSharing}
                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                            >
                                <Icon name="WhatsApp" className="w-4 h-4" />
                                <span>{isSharing ? 'Menyiapkan Gambar...' : 'Kirim Gambar ke WhatsApp'}</span>
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                                {/* Tombol 2: Salin Gambar ke Clipboard */}
                                <button
                                    type="button"
                                    onClick={handleCopyImage}
                                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 ${copyFeedback === 'copied' ? 'bg-emerald-600 text-white border-emerald-600 font-black' : 'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-gold-300 border-navy-200 dark:border-navy-700'}`}
                                >
                                    <Icon name={copyFeedback === 'copied' ? "Check" : "Copy"} className="w-3.5 h-3.5 shrink-0" />
                                    <span>{copyFeedback === 'copied' ? 'Tersalin! (Ctrl+V)' : 'Salin Gambar'}</span>
                                </button>

                                {/* Tombol 3: Unduh Gambar HD */}
                                <button
                                    type="button"
                                    onClick={handleDownloadImage}
                                    disabled={isDownloading}
                                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 ${downloadFeedback ? 'bg-emerald-600 text-white border-emerald-600 font-black' : 'bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-400 text-gold-400 dark:text-navy-950 border-transparent'}`}
                                >
                                    <Icon name={downloadFeedback ? "Check" : "Download"} className="w-3.5 h-3.5 shrink-0" />
                                    <span>{downloadFeedback ? 'Tersimpan!' : (isDownloading ? 'Menyimpan...' : 'Simpan / Unduh')}</span>
                                </button>
                            </div>

                            {/* Tombol 4: Salin Teks Ayat & Link Lengkap */}
                            <button
                                type="button"
                                onClick={handleCopyTextWithLink}
                                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 ${copyTextFeedback ? 'bg-emerald-600 text-white border-emerald-600 font-black' : 'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800/80 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-200 border-navy-200 dark:border-navy-700'}`}
                            >
                                <Icon name={copyTextFeedback ? "Check" : "FileText"} className="w-3.5 h-3.5 shrink-0 text-gold-500" />
                                <span>{copyTextFeedback ? 'Teks & Link Ayat Berhasil Disalin! ✨' : 'Salin Teks Ayat & Link'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const DailyVerseWidget = ({ setActiveTab }) => {
    const todayIndex = React.useMemo(() => {
        const d = new Date();
        return (d.getDate() + d.getMonth() * 31) % DAILY_VERSES.length;
    }, []);

    const [verseIdx, setVerseIdx] = React.useState(todayIndex);
    const [copied, setCopied] = React.useState(false);
    const [audioPlaying, setAudioPlaying] = React.useState(false);
    const [showCardModal, setShowCardModal] = React.useState(false);

    const verse = DAILY_VERSES[verseIdx] || DAILY_VERSES[0];

    React.useEffect(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setAudioPlaying(false);
    }, [verseIdx]);

    const handleToggleAudio = () => {
        if (!('speechSynthesis' in window)) {
            alert("Browser Anda belum mendukung fitur audio (Speech Synthesis).");
            return;
        }
        if (audioPlaying) {
            window.speechSynthesis.cancel();
            setAudioPlaying(false);
        } else {
            window.speechSynthesis.cancel();
            const textToSpeak = `${verse.bookName} pasal ${verse.chapter} ayat ${verse.verse}. ${verse.text}`;
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'id-ID';
            utterance.rate = 0.95;
            const voices = window.speechSynthesis.getVoices();
            const idVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id'));
            if (idVoice) utterance.voice = idVoice;
            utterance.onend = () => setAudioPlaying(false);
            utterance.onerror = () => setAudioPlaying(false);
            window.speechSynthesis.speak(utterance);
            setAudioPlaying(true);
        }
    };

    const handleNextVerse = () => {
        setVerseIdx(prev => (prev + 1) % DAILY_VERSES.length);
    };

    const handleCopy = () => {
        const verseUrl = getCleanShareUrl('alkitab', {
            kitab: verse.bookName,
            pasal: verse.chapter,
            ayat: verse.verse
        });
        const shareText = `📖 *Ayat Alkitab Hari Ini*\n\n"${verse.text}"\n\n📌 *${verse.bookName} ${verse.chapter}:${verse.verse}*\nTema: ${verse.theme}\n\n🕊️ _GMAHK Pisgah BISDAC_\n${verseUrl}`;
        navigator.clipboard.writeText(shareText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => { });
    };

    const handleShareWA = () => {
        const verseUrl = getCleanShareUrl('alkitab', {
            kitab: verse.bookName,
            pasal: verse.chapter,
            ayat: verse.verse
        });
        const shareText = `📖 *Ayat Alkitab Hari Ini*\n\n"${verse.text}"\n\n📌 *${verse.bookName} ${verse.chapter}:${verse.verse}*\nTema: ${verse.theme}\n\n🕊️ _GMAHK Pisgah BISDAC_\n${verseUrl}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    };

    const handleOpenAlkitab = () => {
        const targetPayload = {
            bookName: verse.bookName,
            bookId: verse.bookId,
            chapter: verse.chapter,
            verse: verse.verse
        };
        window.__alkitabDirectTarget = targetPayload;
        try {
            localStorage.setItem('alkitabDirectTarget', JSON.stringify(targetPayload));
        } catch (e) {
            console.error(e);
        }
        window.dispatchEvent(new CustomEvent('alkitab-direct-target', { detail: targetPayload }));
        setActiveTab('alkitab');
    };

    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FEFDFB] via-white to-[#F4F8EE] dark:from-navy-950 dark:via-navy-900 dark:to-[#081524] p-5 sm:p-7 shadow-xl shadow-amber-900/5 dark:shadow-black/40 border border-amber-200/80 dark:border-navy-700/80 flex flex-col justify-between group transition-all duration-300">
            {/* Ambient Lighting & Decorative Watermark */}
            <div className="absolute top-0 right-0 w-52 h-52 bg-gradient-to-br from-[#D19B45]/20 to-amber-300/5 dark:from-gold-500/15 dark:to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-8 -right-4 text-[#D19B45]/10 dark:text-gold-400/10 font-serif font-black text-9xl sm:text-[11rem] leading-none select-none pointer-events-none">”</div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between gap-2.5 mb-3.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D19B45] to-[#B37F2C] text-white font-black text-[11px] uppercase tracking-wider shadow-sm shadow-amber-900/20">
                        <Icon name="BookOpen" className="w-3.5 h-3.5 text-white" /> Ayat Hari Ini
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold text-[#2F6126] dark:text-[#6EE7B7] bg-[#E9F6E7] dark:bg-emerald-950/70 border border-[#C2E3BC] dark:border-emerald-600/40 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {verse.theme}
                    </span>
                </div>
                <button
                    onClick={handleNextVerse}
                    title="Ganti Ayat Lain"
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/90 dark:bg-navy-800/90 hover:bg-amber-50 dark:hover:bg-navy-700 text-[#596B4D] dark:text-gray-300 transition-all text-xs flex items-center gap-1.5 font-bold border border-amber-200/80 dark:border-navy-700 shadow-2xs active:scale-95 cursor-pointer group"
                >
                    <Icon name="Refresh" className="w-3.5 h-3.5 text-[#D19B45] dark:text-gold-400 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="hidden sm:inline font-bold">Ganti Ayat</span>
                </button>
            </div>

            {/* Verse Content Area */}
            <div className="relative z-10 my-auto py-2">
                {/* Quotation Mark & Label */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[#D19B45] dark:text-gold-400 font-serif text-4xl sm:text-5xl leading-none opacity-80 select-none">“</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-700/70 dark:text-gold-400/70 flex items-center gap-1">
                        <Icon name="Heart" className="w-3 h-3 text-[#D19B45]" /> Sabda Hidup
                    </span>
                </div>

                <div className="pl-3.5 sm:pl-4 border-l-3 border-[#D19B45] dark:border-gold-400 my-1.5">
                    <p className="text-[#1A2E16] dark:text-gray-100 text-[15px] sm:text-base md:text-[1.08rem] leading-relaxed sm:leading-loose font-semibold tracking-normal">
                        {renderHighlightedText(verse.text, verse.gold, verse.emerald)}
                    </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-navy-700/60 flex items-center justify-between flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D19B45]/15 dark:bg-gold-500/15 border border-[#D19B45]/30 dark:border-gold-400/30">
                        <Icon name="Bookmark" className="w-3.5 h-3.5 text-[#D19B45] dark:text-gold-400" />
                        <span className="font-black text-xs sm:text-sm text-[#2C3F21] dark:text-gold-300 tracking-wider">
                            {verse.bookName} {verse.chapter}:{verse.verse}
                        </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#596B4D] dark:text-gray-400">
                        <Icon name="Book" className="w-3 h-3 text-[#D19B45]" /> Alkitab Terjemahan Baru (TB)
                    </span>
                </div>
            </div>

            {/* Actions (Mobile-Optimized Grid & Flex) */}
            <div className="relative z-10 pt-4 mt-3 border-t border-amber-200/60 dark:border-navy-700/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <button
                    onClick={handleOpenAlkitab}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#3D6335] via-[#4A7045] to-[#598553] hover:from-[#32522B] hover:to-[#4A7045] active:scale-98 text-white dark:from-gold-500 dark:to-amber-500 dark:hover:from-gold-600 dark:hover:to-amber-600 dark:text-navy-950 text-xs sm:text-sm font-black px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#4A7045]/20 dark:shadow-gold-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                    <Icon name="BookOpen" className="w-4 h-4" />
                    <span>Buka di Alkitab</span>
                    <Icon name="ArrowRight" className="w-3.5 h-3.5 opacity-80 -mr-0.5" />
                </button>
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleToggleAudio}
                        className={`bg-white/90 dark:bg-navy-800/90 hover:bg-amber-50 dark:hover:bg-navy-700 active:scale-95 text-xs font-bold px-3 py-2.5 rounded-xl transition-all border flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${audioPlaying ? 'border-gold-500 text-gold-600 dark:text-gold-400 bg-gold-50/50 animate-pulse' : 'border-amber-200/80 dark:border-navy-600 text-[#2C3F21] dark:text-gray-200'}`}
                        title="Dengarkan Suara Ayat Ini"
                    >
                        <Icon name={audioPlaying ? "Square" : "Volume2"} className={`w-3.5 h-3.5 ${audioPlaying ? 'text-red-500' : 'text-[#D19B45] dark:text-gold-400'}`} />
                        <span>{audioPlaying ? 'Stop' : 'Audio'}</span>
                    </button>
                    <button
                        onClick={() => setShowCardModal(true)}
                        className="bg-amber-50/90 dark:bg-gold-500/15 hover:bg-amber-100 dark:hover:bg-gold-500/25 active:scale-95 text-amber-900 dark:text-gold-300 text-xs font-extrabold px-3 py-2.5 rounded-xl transition-all border border-amber-300/80 dark:border-gold-500/40 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        title="Buat Gambar Kartu Ayat untuk Status WA / IG Story"
                    >
                        <Icon name="Sparkles" className="w-3.5 h-3.5 text-[#D19B45] dark:text-gold-400" />
                        <span>Kartu Gambar</span>
                    </button>
                    <button
                        onClick={handleCopy}
                        className="bg-white/90 dark:bg-navy-800/90 hover:bg-amber-50 dark:hover:bg-navy-700 active:scale-95 text-[#2C3F21] dark:text-gray-200 text-xs font-bold px-3 py-2.5 rounded-xl transition-all border border-amber-200/80 dark:border-navy-600 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <Icon name="Check" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Tersalin!</span>
                            </>
                        ) : (
                            <>
                                <Icon name="Share" className="w-3.5 h-3.5 text-[#596B4D] dark:text-gray-300" />
                                <span>Salin</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleShareWA}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20 cursor-pointer"
                    >
                        <Icon name="WhatsApp" className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                    </button>
                </div>
            </div>
            <VerseImageCardModal
                isOpen={showCardModal}
                onClose={() => setShowCardModal(false)}
                reference={`${verse.bookName} ${verse.chapter}:${verse.verse}`}
                verseText={verse.text}
                subtitle={`AYAT HARI INI • ${(verse.theme || 'SABDA HIDUP').toUpperCase()}`}
                verseUrl={getCleanShareUrl('alkitab', {
                    kitab: verse.bookName,
                    pasal: verse.chapter,
                    ayat: verse.verse
                })}
            />
        </div>
    );
};

// ============================================================
// TAHAP 3: SISTEM KONFIRMASI KEHADIRAN PETUGAS, POKOK DOA & KALENDER/ULTAH
// ============================================================
export const OFFICER_ATTENDANCE_STORAGE_KEY = 'PISGAH_OFFICER_ATTENDANCE_V1';
export const PRAYER_REQUESTS_STORAGE_KEY = 'PISGAH_PRAYER_REQUESTS_V1';
export const PRAYED_IDS_STORAGE_KEY = 'PISGAH_PRAYED_IDS_V1';
export const MEMBER_BIRTHDAYS_STORAGE_KEY = 'PISGAH_MEMBER_BIRTHDAYS_V1';
export const ANNUAL_CALENDAR_STORAGE_KEY = 'PISGAH_ANNUAL_CALENDAR_V1';

export const getOfficerAttendanceKey = (dateStr, tugas, nama) => {
    const cleanDate = String(dateStr || '').trim();
    const cleanTugas = String(tugas || '').trim().toLowerCase();
    const cleanNama = String(nama || '').trim().toLowerCase();
    return `${cleanDate}__${cleanTugas}__${cleanNama}`;
};

export const loadOfficerAttendanceMap = () => {
    try {
        const raw = localStorage.getItem(OFFICER_ATTENDANCE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
};

export const saveOfficerAttendanceRecord = (recordKey, payload) => {
    try {
        const current = loadOfficerAttendanceMap();
        if (payload === null) {
            delete current[recordKey];
        } else {
            current[recordKey] = {
                ...payload,
                updatedAt: Date.now()
            };
        }
        localStorage.setItem(OFFICER_ATTENDANCE_STORAGE_KEY, JSON.stringify(current));
        window.dispatchEvent(new CustomEvent('pisgah-attendance-updated'));

        if (GAS_API_URL) {
            portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveOfficerAttendance', recordKey, payload })
            }).catch(e => console.warn('Gagal sinkron konfirmasi petugas ke Google Sheets:', e));
        }
    } catch (e) { }
};

export const useOfficerAttendance = () => {
    const [attendanceMap, setAttendanceMap] = React.useState(() => loadOfficerAttendanceMap());
    React.useEffect(() => {
        const refresh = () => setAttendanceMap(loadOfficerAttendanceMap());
        window.addEventListener('pisgah-attendance-updated', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('pisgah-attendance-updated', refresh);
            window.removeEventListener('storage', refresh);
        };
    }, []);
    return attendanceMap;
};

export const findSecretaryPhone = (dataPejabat = []) => {
    if (!Array.isArray(dataPejabat)) return '';
    // Prioritaskan mencari pejabat dengan jabatan atau ID Sekretaris
    const sec = dataPejabat.find(p => {
        const j = String(p.jabatan || '').toLowerCase();
        const id = String(p.id || '').toLowerCase();
        return j.includes('sekretaris') || j.includes('sekertaris') || id.includes('sekretaris') || id.includes('sekertaris');
    });
    if (sec && sec.wa) {
        const digits = String(sec.wa).replace(/\D/g, '');
        if (digits && digits !== '62800000000' && digits.length >= 9) {
            return digits.startsWith('0') ? '62' + digits.slice(1) : digits;
        }
    }
    // Fallback ke pengurus jemaat lain jika nomor sekretaris belum diatur
    const fallback = dataPejabat.find(p => {
        const j = String(p.jabatan || '').toLowerCase();
        return j.includes('ketua') || j.includes('gembala') || j.includes('pendeta');
    });
    if (fallback && fallback.wa) {
        const digits = String(fallback.wa).replace(/\D/g, '');
        if (digits && digits !== '62800000000' && digits.length >= 9) {
            return digits.startsWith('0') ? '62' + digits.slice(1) : digits;
        }
    }
    return '6285194344004';
};

export const OfficerAttendanceModal = ({ modalData, onClose, dataPejabat = [] }) => {
    const [status, setStatus] = React.useState('hadir');
    const [substitute, setSubstitute] = React.useState('');
    const [note, setNote] = React.useState('');

    React.useEffect(() => {
        if (modalData) {
            setStatus(modalData.existing?.status || 'hadir');
            setSubstitute(modalData.existing?.substitute || '');
            setNote(modalData.existing?.note || '');
        }
    }, [modalData]);

    if (!modalData) return null;

    const recordKey = getOfficerAttendanceKey(modalData.dateStr, modalData.tugas, modalData.nama);

    const handleSave = (sendWa = false) => {
        const payload = {
            dateStr: modalData.dateStr,
            sesi: modalData.sesi,
            waktu: modalData.waktu,
            tugas: modalData.tugas,
            nama: modalData.nama,
            status,
            substitute: substitute.trim(),
            note: note.trim()
        };
        saveOfficerAttendanceRecord(recordKey, payload);

        if (sendWa) {
            const formattedDate = modalData.dateStr ? formatIndoDate(modalData.dateStr) : '-';
            const statusText = status === 'hadir' ? '✅ *SIAP HADIR MELAYANI*' : '⚠️ *BERHALANGAN HADIR*';
            let waMsg =
                `Shalom Sekretaris Jemaat *GMAHK Jemaat Pisgah BISDAC - Batam* 🙏,\n\n` +
                `Berikut konfirmasi kehadiran tugas pelayanan ibadah saya:\n\n` +
                `👤 *Nama Petugas:* ${modalData.nama}\n` +
                `📋 *Tugas Pelayanan:* ${modalData.tugas}\n` +
                `⛪ *Kebaktian:* ${modalData.sesi || 'Ibadah Jemaat'}\n` +
                `🗓️ *Hari/Tanggal:* ${formattedDate}\n` +
                `⏰ *Waktu:* ${modalData.waktu || 'Sesuai Jadwal'}\n` +
                `📌 *Status Kehadiran:* ${statusText}\n`;

            if (status === 'berhalangan' && substitute.trim()) {
                waMsg += `🔄 *Usulan Pengganti:* ${substitute.trim()}\n`;
            }
            if (note.trim()) {
                waMsg += `📝 *Keterangan:* ${note.trim()}\n`;
            }
            waMsg += `\nTerima kasih. Tuhan Yesus memberkati pelayanan kita bersama! 🕊️`;

            const targetPhone = findSecretaryPhone(dataPejabat);
            const waUrl = targetPhone
                ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(waMsg)}`
                : `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;
            window.open(waUrl, '_blank');
        }
        onClose();
    };

    const handleReset = () => {
        saveOfficerAttendanceRecord(recordKey, null);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-700 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-navy-100 dark:border-navy-800">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#4A7045] dark:text-gold-400 block">
                            Konfirmasi Kehadiran Pelayan Ibadah
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-navy-900 dark:text-white mt-0.5">
                            {modalData.nama}
                        </h3>
                        <p className="text-xs font-bold text-navy-500 dark:text-navy-300 mt-0.5">
                            {modalData.tugas} • {modalData.dateStr ? formatIndoDateShort(modalData.dateStr) : ''}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-navy-50 dark:bg-navy-800 text-navy-500 hover:text-red-500 flex items-center justify-center font-bold cursor-pointer">✕</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[11px] font-black uppercase tracking-wider text-navy-500 dark:text-navy-300 block mb-2">
                            Pilih Status Kesiapan Anda:
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setStatus('hadir')}
                                className={`p-3 rounded-2xl border-2 text-left transition flex flex-col gap-1 cursor-pointer ${status === 'hadir' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-sm' : 'bg-navy-50/50 dark:bg-navy-800 border-navy-100 dark:border-navy-700 text-navy-600 dark:text-navy-300'}`}
                            >
                                <span className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                                    <span>✅ Siap Hadir</span>
                                </span>
                                <span className="text-[10px] opacity-80 font-medium">Saya siap melayani tepat waktu</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('berhalangan')}
                                className={`p-3 rounded-2xl border-2 text-left transition flex flex-col gap-1 cursor-pointer ${status === 'berhalangan' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300 shadow-sm' : 'bg-navy-50/50 dark:bg-navy-800 border-navy-100 dark:border-navy-700 text-navy-600 dark:text-navy-300'}`}
                            >
                                <span className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                                    <span>⚠️ Berhalangan</span>
                                </span>
                                <span className="text-[10px] opacity-80 font-medium">Perlu koordinasi / pengganti</span>
                            </button>
                        </div>
                    </div>

                    {status === 'berhalangan' && (
                        <div>
                            <label className="text-[11px] font-black uppercase tracking-wider text-navy-500 dark:text-navy-300 block mb-1">
                                Nama Petugas Pengganti (Jika sudah ada)
                            </label>
                            <input
                                type="text"
                                value={substitute}
                                onChange={(e) => setSubstitute(e.target.value)}
                                placeholder="Misal: Bpk. / Ibu ... (Opsional)"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 text-xs sm:text-sm font-bold text-navy-900 dark:text-white outline-none focus:border-gold-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-[11px] font-black uppercase tracking-wider text-navy-500 dark:text-navy-300 block mb-1">
                            Catatan Tambahan (Opsional)
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={status === 'hadir' ? 'Misal: Hadir 15 menit sebelum mulai...' : 'Misal: Sedang dinas luar kota / sakit...'}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 text-xs sm:text-sm font-medium text-navy-900 dark:text-white outline-none focus:border-gold-500"
                        />
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => handleSave(false)}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#4A7045] hover:bg-[#3A5836] dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-navy-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Icon name="CheckCircle" className="w-4 h-4" />
                            <span>Simpan Status Konfirmasi</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSave(true)}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] dark:text-emerald-400 hover:text-white border border-[#25D366]/40 font-extrabold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Icon name="WhatsApp" className="w-4 h-4" />
                            <span>Simpan & Kabari Sekretaris via WA</span>
                        </button>
                        {modalData.existing && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full py-1.5 text-[11px] font-bold text-red-500 hover:text-red-600 cursor-pointer"
                            >
                                Reset / Batalkan Status Konfirmasi
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ============================================================
// DATA & HELPER DINDING POKOK DOA (IBADAH RABU & PASTORAL)
// ============================================================
export const PRAYER_CATEGORIES = [
    { id: 'Kesehatan', label: 'Kesehatan & Pemulihan', icon: '🙏', badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
    { id: 'Keluarga', label: 'Keluarga & Rumah Tangga', icon: '🏠', badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
    { id: 'Pekerjaan', label: 'Pekerjaan & Pendidikan', icon: '💼', badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30' },
    { id: 'Rohani', label: 'Pertumbuhan Iman', icon: '📖', badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
    { id: 'Syukur', label: 'Ucapan Syukur', icon: '✨', badgeClass: 'bg-gold-500/20 text-amber-800 dark:text-gold-300 border-gold-500/40' },
    { id: 'Pelayanan', label: 'Pelayanan Gereja', icon: '⛪', badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
    { id: 'Lainnya', label: 'Lainnya', icon: '📌', badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30' }
];

export const INITIAL_PRAYER_REQUESTS = [
    {
        id: 'pray_seed_1',
        senderName: 'Majelis & Pelayan Jemaat',
        isAnonymous: false,
        category: 'Pelayanan',
        content: 'Kiranya Tuhan mencurahkan Roh Kudus bagi seluruh keluarga besar GMAHK Jemaat Pisgah BISDAC - Batam agar semakin bertumbuh dalam iman, kasih persaudaraan, dan semangat penginjilan.',
        privacy: 'public',
        prayedCount: 18,
        isAnswered: false,
        createdAt: '2026-10-21T12:00:00.000Z'
    },
    {
        id: 'pray_seed_2',
        senderName: 'Hamba Tuhan (Anonim)',
        isAnonymous: true,
        category: 'Kesehatan',
        content: 'Mohon dukungan doa pada Ibadah Rabu Malam untuk kesembuhan dan pemulihan kesehatan orang tua serta anggota jemaat yang sedang dalam masa perawatan.',
        privacy: 'public',
        prayedCount: 14,
        isAnswered: false,
        createdAt: '2026-10-22T09:30:00.000Z'
    },
    {
        id: 'pray_seed_3',
        senderName: 'Keluarga Jemaat Pisgah',
        isAnonymous: false,
        category: 'Syukur',
        content: 'Mengucap syukur atas pemeliharaan Tuhan sepanjang pekan ini dalam pekerjaan, pendidikan anak-anak, dan berkat kesehatan yang Tuhan nyatakan.',
        privacy: 'public',
        prayedCount: 21,
        isAnswered: false,
        createdAt: '2026-10-22T15:15:00.000Z'
    }
];

export const loadPrayerRequests = () => {
    try {
        const raw = localStorage.getItem(PRAYER_REQUESTS_STORAGE_KEY);
        if (raw !== null) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) { }
    return INITIAL_PRAYER_REQUESTS;
};

export const savePrayerRequests = (list, syncToBackend = false, token = '') => {
    try {
        localStorage.setItem(PRAYER_REQUESTS_STORAGE_KEY, JSON.stringify(list));
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('pisgah-prayer-updated'));
        }, 0);

        if (syncToBackend && GAS_API_URL) {
            const pwd = token || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('PISGAH_ADMIN_SESSION_TOKEN') : '') || '';
            portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'savePrayerRequests', password: pwd, prayers: list })
            }).catch(e => console.warn('Gagal sinkron pokok doa ke Google Sheets:', e));
        }
    } catch (e) { }
};

// Helper Parser Pokok Doa (Mendukung Multi-Baris via Enter, Penomoran Otomatis 1. 2. 3., dan Bullet Point)
export const parsePrayerContent = (rawContent) => {
    if (!rawContent || typeof rawContent !== 'string') return [];
    let text = rawContent.trim();
    if (!text) return [];

    // Bersihkan tanda kutip pembuka dan penutup bila seluruh pokok doa diapit kutipan ("...", '...', “...”)
    text = text.replace(/^["'“”«»]+|["'“”«»]+$/g, '').trim();

    // 1. Cek jika terdapat perpindahan baris (Enter)
    const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (rawLines.length > 1) {
        let currentItemNumber = 0;
        return rawLines.map((line) => {
            if (line.endsWith(':') || line.toLowerCase().startsWith('mohon doa:') || line.toLowerCase().startsWith('pokok doa:')) {
                return { isHeader: true, text: line };
            }
            const cleanLine = line.replace(/^["'“”«»]+|["'“”«»]+$/g, '').trim();
            const numMatch = cleanLine.match(/^(\d+)[\.\)]\s*(.*)$/);
            if (numMatch) {
                currentItemNumber = parseInt(numMatch[1], 10) || (currentItemNumber + 1);
                return { num: String(currentItemNumber), text: numMatch[2].trim().replace(/[,;]\s*$/, '') };
            }
            const bulletMatch = cleanLine.match(/^[-*•]\s*(.*)$/);
            if (bulletMatch) {
                currentItemNumber += 1;
                return { num: String(currentItemNumber), text: bulletMatch[1].trim().replace(/[,;]\s*$/, '') };
            }
            currentItemNumber += 1;
            return { num: String(currentItemNumber), text: cleanLine.replace(/[,;]\s*$/, '') };
        });
    }

    // 2. Baris tunggal: deteksi penomoran tersemat di tengah kalimat seperti "1. ... 2. ... 3. ..."
    const numberedRegex = /(?:^|[\s,;]+)(\d+)[\.\)]\s+/g;
    const matches = [...text.matchAll(numberedRegex)];
    if (matches.length > 1) {
        const items = [];
        const firstMatchIndex = matches[0].index;
        if (firstMatchIndex > 0) {
            const intro = text.slice(0, firstMatchIndex).trim();
            if (intro) items.push({ isHeader: true, text: intro });
        }
        for (let i = 0; i < matches.length; i++) {
            const currentMatch = matches[i];
            const num = currentMatch[1];
            const startIndex = currentMatch.index + currentMatch[0].length;
            const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : text.length;
            let itemText = text.slice(startIndex, endIndex).trim().replace(/[,;]\s*$/, '').replace(/^["'“”«»]+|["'“”«»]+$/g, '').trim();
            if (itemText) {
                items.push({ num, text: itemText });
            }
        }
        if (items.length > 0) return items;
    }

    // 3. Baris tunggal: deteksi bullet tersemat seperti "- ... - ..."
    const bulletParts = text.split(/(?:^|[\s,;]+)[-*•]\s+/).map(s => s.trim().replace(/[,;]\s*$/, '').replace(/^["'“”«»]+|["'“”«»]+$/g, '').trim()).filter(Boolean);
    if (bulletParts.length > 1) {
        return bulletParts.map((t, idx) => ({ num: String(idx + 1), text: t }));
    }

    // 4. Jika hanya 1 kalimat namun berawalan angka nomor seperti "1. ..."
    const singleMatch = text.match(/^(\d+)[\.\)]\s*(.*)$/);
    if (singleMatch) {
        return [{ num: singleMatch[1], text: singleMatch[2].trim().replace(/^["'“”«»]+|["'“”«»]+$/g, '').trim() }];
    }

    // 5. Kalimat biasa tanpa format list
    return [{ num: null, text }];
};

// Komponen Perender Tampilan Pokok Doa Rapi & Terstruktur
export const PrayerContentRenderer = ({ content }) => {
    const items = React.useMemo(() => parsePrayerContent(content), [content]);

    if (!items || items.length === 0) return null;

    // Jika berupa 1 teks pendek biasa tanpa penomoran
    if (items.length === 1 && !items[0].num && !items[0].isHeader) {
        return (
            <p className="text-xs sm:text-sm text-[#2C3F21] dark:text-gray-100 leading-relaxed font-medium whitespace-pre-line">
                "{items[0].text}"
            </p>
        );
    }

    return (
        <div className="space-y-1.5 my-1 text-xs sm:text-sm text-[#2C3F21] dark:text-gray-100 leading-relaxed font-medium">
            {items.map((it, idx) => {
                if (it.isHeader) {
                    return (
                        <p key={idx} className="font-bold text-[#2C3F21] dark:text-gold-300 pt-0.5">
                            {it.text}
                        </p>
                    );
                }
                return (
                    <div key={idx} className="flex items-start gap-2.5 bg-white/60 dark:bg-navy-900/60 p-2 sm:p-2.5 rounded-xl border border-[#E2E8D8]/70 dark:border-navy-800/80 shadow-2xs">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#4A7045]/15 dark:bg-gold-500/20 text-[#4A7045] dark:text-gold-400 border border-[#4A7045]/30 dark:border-gold-500/40 text-[10px] font-black flex items-center justify-center mt-0.5 select-none">
                            {it.num || (idx + 1)}
                        </span>
                        <span className="flex-1 min-w-0 font-medium">
                            {it.text}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// Komponen Helper Baris Filter Scrollable Interaktif (Dukungan Mouse Wheel, Drag Desktop, Touch Mobile, & Tombol Panah Kiri/Kanan)
export const ScrollableFilterBar = ({ children, className = "" }) => {
    const scrollContainerRef = React.useRef(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);
    const isMouseDown = React.useRef(false);
    const startX = React.useRef(0);
    const scrollLeftVal = React.useRef(0);
    const isDragging = React.useRef(false);

    const updateScrollButtons = React.useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const hasOverflow = el.scrollWidth > el.clientWidth + 2;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }, []);

    React.useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        updateScrollButtons();
        const handleResize = () => updateScrollButtons();
        window.addEventListener('resize', handleResize);
        let observer = null;
        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(() => updateScrollButtons());
            observer.observe(el);
        }
        return () => {
            window.removeEventListener('resize', handleResize);
            if (observer) observer.disconnect();
        };
    }, [updateScrollButtons, children]);

    const handleScrollLeft = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
            setTimeout(updateScrollButtons, 320);
        }
    };

    const handleScrollRight = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
            setTimeout(updateScrollButtons, 320);
        }
    };

    // Dukungan mouse wheel horizontal (Desktop)
    const handleWheel = (e) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        if (el.scrollWidth > el.clientWidth) {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
                el.scrollLeft += e.deltaY;
                e.preventDefault();
                updateScrollButtons();
            } else if (e.deltaX !== 0) {
                el.scrollLeft += e.deltaX;
                updateScrollButtons();
            }
        }
    };

    // Dukungan mouse drag to scroll (Desktop)
    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        isMouseDown.current = true;
        isDragging.current = false;
        startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeftVal.current = scrollContainerRef.current.scrollLeft;
    };

    const handleMouseMove = (e) => {
        if (!isMouseDown.current) return;
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX.current);
        if (Math.abs(walk) > 4) {
            isDragging.current = true;
        }
        scrollContainerRef.current.scrollLeft = scrollLeftVal.current - walk;
        updateScrollButtons();
    };

    const handleMouseUp = () => {
        isMouseDown.current = false;
    };

    const handleClickCapture = (e) => {
        if (isDragging.current) {
            e.stopPropagation();
            e.preventDefault();
            isDragging.current = false;
        }
    };

    return (
        <div className="relative w-full my-2.5 flex items-center group">
            {/* Tombol Panah Kiri */}
            {canScrollLeft && (
                <button
                    type="button"
                    onClick={handleScrollLeft}
                    aria-label="Geser Kiri"
                    className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white dark:bg-navy-800 text-[#2C3F21] dark:text-gold-400 shadow-md border border-[#E2E8D8] dark:border-navy-700 flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer"
                >
                    <Icon name="ChevronLeft" className="w-4 h-4" />
                </button>
            )}

            {/* Kontainer Baris Filter Scrollable */}
            <div
                ref={scrollContainerRef}
                onScroll={updateScrollButtons}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClickCapture={handleClickCapture}
                className={`w-full flex items-center gap-1.5 overflow-x-auto py-1 px-1 scroll-smooth cursor-grab active:cursor-grabbing select-none ${className}`}
                style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {children}
            </div>

            {/* Tombol Panah Kanan */}
            {canScrollRight && (
                <button
                    type="button"
                    onClick={handleScrollRight}
                    aria-label="Geser Kanan"
                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white dark:bg-navy-800 text-[#2C3F21] dark:text-gold-400 shadow-md border border-[#E2E8D8] dark:border-navy-700 flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer"
                >
                    <Icon name="ChevronRight" className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export const PrayerRequestWallWidget = ({ dataPejabat = [], compact = false }) => {
    const [prayers, setPrayers] = React.useState(() => loadPrayerRequests());
    const [prayedIds, setPrayedIds] = React.useState(() => {
        try {
            const raw = localStorage.getItem(PRAYED_IDS_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    });
    const [categoryFilter, setCategoryFilter] = React.useState('all');
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [senderName, setSenderName] = React.useState('');
    const [isAnonymous, setIsAnonymous] = React.useState(false);
    const [category, setCategory] = React.useState('Kesehatan');
    const [privacy, setPrivacy] = React.useState('public'); // 'public' | 'private'
    const [content, setContent] = React.useState('');
    const [submitSuccessMsg, setSubmitSuccessMsg] = React.useState(null);

    React.useEffect(() => {
        const sync = () => setPrayers(loadPrayerRequests());
        window.addEventListener('pisgah-prayer-updated', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('pisgah-prayer-updated', sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const publicPrayers = React.useMemo(() => {
        return prayers
            .filter(p => p.privacy !== 'private')
            .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [prayers, categoryFilter]);

    const handlePraySupport = (id) => {
        const alreadyPrayed = prayedIds.includes(id);
        const nextPrayedIds = alreadyPrayed ? prayedIds.filter(x => x !== id) : [...prayedIds, id];
        setPrayedIds(nextPrayedIds);
        try {
            localStorage.setItem(PRAYED_IDS_STORAGE_KEY, JSON.stringify(nextPrayedIds));
        } catch (e) { }

        const nextList = prayers.map(p => {
            if (p.id !== id) return p;
            const currentCount = Number(p.prayedCount || 0);
            return {
                ...p,
                prayedCount: alreadyPrayed ? Math.max(0, currentCount - 1) : currentCount + 1
            };
        });
        setPrayers(nextList);
        savePrayerRequests(nextList, false);

        if (!alreadyPrayed && GAS_API_URL) {
            fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'incrementPrayerCount', id })
            }).catch(e => console.warn('Gagal increment doa ke Google Sheets:', e));
        }
    };

    const handleSubmitPrayer = (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        const finalName = isAnonymous ? 'Hamba Tuhan (Anonim)' : (senderName.trim() || 'Anggota Jemaat');
        const newPrayer = {
            id: 'pray_' + Date.now(),
            senderName: finalName,
            isAnonymous,
            category,
            content: content.trim(),
            privacy,
            prayedCount: 1,
            isAnswered: false,
            createdAt: new Date().toISOString()
        };

        const nextList = [newPrayer, ...prayers];
        setPrayers(nextList);
        savePrayerRequests(nextList, false);

        if (GAS_API_URL) {
            fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'submitPrayer', prayer: newPrayer })
            }).catch(e => console.warn('Gagal kirim doa ke Google Sheets:', e));
        }

        setContent('');
        setIsFormOpen(false);
        setSubmitSuccessMsg({
            privacy,
            prayer: newPrayer
        });
        setTimeout(() => setSubmitSuccessMsg(null), 9000);
    };

    const handleSendPrivateToPastorWA = (prayerObj) => {
        const pastorPhone = findCoordinatorPhone(dataPejabat);
        const items = parsePrayerContent(prayerObj.content);
        let formattedContent = `"${prayerObj.content}"`;
        if (items.length > 1 || (items.length === 1 && items[0].num)) {
            formattedContent = items.map(it => {
                if (it.isHeader) return `*${it.text}*`;
                return `  ${it.num ? `${it.num}.` : '•'} ${it.text}`;
            }).join('\n');
        }
        const text =
            `Shalom Gembala / Majelis *GMAHK Jemaat Pisgah BISDAC - Batam* 🙏,\n\n` +
            `Saya ingin menyampaikan *Pokok Doa Khusus (${prayerObj.privacy === 'private' ? 'Privat / Pastoral' : 'Ibadah Rabu'})*:\n\n` +
            `👤 *Nama:* ${prayerObj.senderName}\n` +
            `🏷️ *Kategori:* ${prayerObj.category}\n` +
            `🙏 *Pokok Doa:*\n${formattedContent}\n\n` +
            `Terima kasih atas dukungan doa Gembala & Majelis. Tuhan Yesus memberkati. 🕊️`;
        const waUrl = pastorPhone
            ? `https://api.whatsapp.com/send?phone=${pastorPhone}&text=${encodeURIComponent(text)}`
            : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
    };

    const handleShareWednesdayRecapWA = () => {
        const topPublic = publicPrayers.slice(0, 8);
        let text = `*🙏 POKOK DOA SYAFAAT IBADAH RABU MALAM*\n*GMAHK Jemaat Pisgah BISDAC - Batam*\n\n`;
        topPublic.forEach((p, idx) => {
            const items = parsePrayerContent(p.content);
            let formattedContent = `"${p.content}"`;
            if (items.length > 1 || (items.length === 1 && items[0].num)) {
                formattedContent = items.map(it => {
                    if (it.isHeader) return `*${it.text}*`;
                    return `  ${it.num ? `${it.num}.` : '•'} ${it.text}`;
                }).join('\n');
            }
            text += `${idx + 1}. *[${p.category}] ${p.senderName}:*\n${formattedContent}\n_(Didoakan ${p.prayedCount || 1}x)_\n\n`;
        });
        text += `_"Karena itu hendaklah kamu saling mengaku dosamu dan saling mendoakan, supaya kamu sembuh."_ (Yakobus 5:16)\n\n` +
            `Kirim pokok doa Anda di: ${getCleanShareUrl('jadwal')}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <HomeCard
            badgeText="🙏 Persekutuan Doa Rabu & Pastoral"
            title="Kotak & Dinding Pokok Doa Jemaat"
            subtitle="Pokok doa jemaat untuk Ibadah Rabu Malam atau secara khusus (privat) oleh Pendeta & Majelis."
            containerClassName="h-full"
            headerRightContent={(
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsFormOpen(prev => !prev)}
                        className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#4A7045] hover:bg-[#3A5836] dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-navy-950 font-black text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95"
                    >
                        <Icon name={isFormOpen ? "X" : "Plus"} className="w-4 h-4" />
                        <span>{isFormOpen ? 'Tutup Form' : '+ Kirim Pokok Doa'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleShareWednesdayRecapWA}
                        className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] dark:text-emerald-400 hover:text-white border border-[#25D366]/30 font-extrabold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                        title="Bagikan Daftar Pokok Doa ke Grup WA Ibadah Rabu"
                    >
                        <Icon name="WhatsApp" className="w-4 h-4" />
                        <span>Rekap WA</span>
                    </button>
                </div>
            )}
            footerLeft={<span>Persekutuan Doa Rabu Malam &bull; 19:30 WIB</span>}
            footerRight={<span className="font-bold text-[#4A7045] dark:text-gold-400">{publicPrayers.length} Pokok Doa Aktif</span>}
        >

            {/* Notifikasi Sukses Kirim Doa */}
            {submitSuccessMsg && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                    <div className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        {submitSuccessMsg.privacy === 'private' ? (
                            <>🔒 Pokok doa <strong>Privat (Khusus Pendeta/Majelis)</strong> telah disimpan di Ruang Pastoral Admin.</>
                        ) : (
                            <>✨ Puji Tuhan! Pokok doa Anda telah ditambahkan ke <strong>Dinding Doa Jemaat</strong>.</>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => handleSendPrivateToPastorWA(submitSuccessMsg.prayer)}
                        className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                    >
                        <Icon name="WhatsApp" className="w-3.5 h-3.5" />
                        <span>Teruskan Langsung ke WA Gembala/Majelis</span>
                    </button>
                </div>
            )}

            {/* Form Kirim Pokok Doa */}
            {isFormOpen && (
                <form onSubmit={handleSubmitPrayer} className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#F7F9F3] dark:bg-navy-950/80 border-2 border-[#C5D5BC] dark:border-gold-500/40 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-[#2C3F21] dark:text-gold-300">
                                    Nama Pengirim / Keluarga
                                </label>
                                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A7045] dark:text-gold-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="rounded accent-[#4A7045]"
                                    />
                                    <span>Kirim sebagai Anonim</span>
                                </label>
                            </div>
                            <input
                                type="text"
                                disabled={isAnonymous}
                                value={isAnonymous ? 'Hamba Tuhan (Anonim)' : senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                placeholder="Contoh: Kel. Bpk. ... / Sdr. ..."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-[#E2E8D8] dark:border-navy-700 text-xs sm:text-sm font-bold text-navy-900 dark:text-white outline-none focus:border-gold-500 disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-black uppercase tracking-wider text-[#2C3F21] dark:text-gold-300 block mb-1.5">
                                Kategori Pokok Doa
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-[#E2E8D8] dark:border-navy-700 text-xs sm:text-sm font-bold text-navy-900 dark:text-white outline-none focus:border-gold-500 cursor-pointer"
                            >
                                {PRAYER_CATEGORIES.map(c => (
                                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Opsi Privasi: Publik vs Privat */}
                    <div>
                        <label className="text-[11px] font-black uppercase tracking-wider text-[#2C3F21] dark:text-gold-300 block mb-1.5">
                            Privasi Pengiriman Doa
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setPrivacy('public')}
                                className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${privacy === 'public' ? 'bg-white dark:bg-navy-800 border-[#4A7045] dark:border-gold-500 shadow-xs' : 'bg-white/50 dark:bg-navy-900/50 border-[#E2E8D8] dark:border-navy-800 opacity-75'}`}
                            >
                                <div className="text-xs font-black text-[#2C3F21] dark:text-gold-400">🌐 Publik (Dinding Doa Ibadah Rabu)</div>
                                <div className="text-[11px] text-[#596B4D] dark:text-gray-400 mt-0.5">Tampil di halaman Doa agar jemaat lain dapat ikut mendoakan bersama.</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrivacy('private')}
                                className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${privacy === 'private' ? 'bg-white dark:bg-navy-800 border-amber-500 shadow-xs' : 'bg-white/50 dark:bg-navy-900/50 border-[#E2E8D8] dark:border-navy-800 opacity-75'}`}
                            >
                                <div className="text-xs font-black text-amber-700 dark:text-amber-400">🔒 Privat (Khusus Pendeta & Majelis)</div>
                                <div className="text-[11px] text-[#596B4D] dark:text-gray-400 mt-0.5">Hanya muncul di Dashboard Admin Pastoral & dapat dikirim ke WA Gembala.</div>
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                            <label className="text-[11px] font-black uppercase tracking-wider text-[#2C3F21] dark:text-gold-300">
                                Isi Pokok Doa / Pergumulan / Ucapan Syukur
                            </label>
                            <span className="text-[10px] text-[#596B4D] dark:text-gold-400 font-semibold">
                                💡 Tekan Enter untuk membuat poin 1, 2, 3...
                            </span>
                        </div>
                        <textarea
                            rows="4"
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Tuliskan pokok doa Anda di sini...&#10;Jika ada beberapa pokok doa, tekan Enter untuk membuat baris baru:&#10;1. Doakan kesehatan anggota keluarga&#10;2. Doakan pekerjaan & studi anak&#10;3. Doakan perintisan pelayanan"
                            className="w-full p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-[#E2E8D8] dark:border-navy-700 text-xs sm:text-sm font-medium text-navy-900 dark:text-white outline-none focus:border-gold-500 resize-y"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className="px-4 py-2 rounded-xl bg-gray-200/70 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-xs font-bold cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-[#4A7045] hover:bg-[#3A5836] dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-navy-950 text-xs sm:text-sm font-black shadow-md cursor-pointer"
                        >
                            🙏 Kirim Pokok Doa
                        </button>
                    </div>
                </form>
            )}

            {/* Filter Kategori Doa */}
            <div className="mt-4">
                <ScrollableFilterBar>
                    <button
                        type="button"
                        onClick={() => setCategoryFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${categoryFilter === 'all' ? 'bg-[#2C3F21] text-white dark:bg-gold-500 dark:text-navy-950 font-black' : 'bg-[#F4F7EF] dark:bg-navy-800 text-[#596B4D] dark:text-navy-300'}`}
                    >
                        Semua Doa ({prayers.filter(p => p.privacy !== 'private').length})
                    </button>
                    {PRAYER_CATEGORIES.map(c => {
                        const count = prayers.filter(p => p.privacy !== 'private' && p.category === c.id).length;
                        return (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setCategoryFilter(c.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${categoryFilter === c.id ? 'bg-[#2C3F21] text-white dark:bg-gold-500 dark:text-navy-950 font-black' : 'bg-[#F4F7EF] dark:bg-navy-800 text-[#596B4D] dark:text-navy-300'}`}
                            >
                                {c.icon} {c.id} ({count})
                            </button>
                        );
                    })}
                </ScrollableFilterBar>
            </div>

            {/* Daftar Kartu Pokok Doa Publik */}
            {publicPrayers.length === 0 ? (
                <div className="mt-4 p-8 text-center rounded-2xl border border-dashed border-[#C5D5BC] dark:border-navy-700 bg-[#F7F9F3]/60 dark:bg-navy-950/40 flex-1 flex flex-col items-center justify-center">
                    <p className="text-xs sm:text-sm font-bold text-[#596B4D] dark:text-gray-400">
                        Belum ada pokok doa publik untuk kategori ini.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsFormOpen(true)}
                        className="mt-2 text-xs font-black text-[#4A7045] dark:text-gold-400 hover:underline cursor-pointer"
                    >
                        + Kirim Pokok Doa Pertama
                    </button>
                </div>
            ) : (
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 ${compact ? 'max-h-[420px] overflow-y-auto custom-scrollbar pr-1 flex-1 content-start' : ''}`}>
                    {(compact ? publicPrayers : publicPrayers.slice(0, 6)).map(item => {
                        const catObj = PRAYER_CATEGORIES.find(c => c.id === item.category) || PRAYER_CATEGORIES[0];
                        const hasPrayed = prayedIds.includes(item.id);
                        return (
                            <div
                                key={item.id}
                                className="p-4 rounded-2xl bg-[#F7F9F3] dark:bg-navy-950/70 border border-[#E2E8D8] dark:border-navy-800 flex flex-col justify-between gap-3 shadow-xs hover:border-[#4A7045]/60 dark:hover:border-gold-500/40 transition"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${catObj.badgeClass}`}>
                                            {catObj.icon} {item.category}
                                        </span>
                                        {item.isAnswered && (
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                                                ✅ Dijawab / Didoakan
                                            </span>
                                        )}
                                    </div>
                                    <PrayerContentRenderer content={item.content} />
                                </div>

                                <div className="pt-2.5 border-t border-[#E2E8D8]/80 dark:border-navy-800 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="text-xs font-extrabold text-[#2C3F21] dark:text-gold-400 truncate">
                                            {item.senderName}
                                        </div>
                                        <div className="text-[10px] text-[#596B4D] dark:text-gray-400">
                                            {formatIndoDateShort(toYMD(new Date(item.createdAt || Date.now())))}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handlePraySupport(item.id)}
                                        className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 shrink-0 transition cursor-pointer active:scale-95 ${hasPrayed ? 'bg-[#4A7045] dark:bg-gold-500 text-white dark:text-navy-950 shadow-xs' : 'bg-white dark:bg-navy-800 text-[#2C3F21] dark:text-gold-300 border border-[#C5D5BC] dark:border-navy-700 hover:border-[#4A7045]'}`}
                                    >
                                        <span>🙏</span>
                                        <span>{hasPrayed ? 'Turut Mendoakan' : 'Saya Ikut Doakan'}</span>
                                        <span className="px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15 text-[10px] font-black">
                                            {item.prayedCount || 1}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </HomeCard>
    );
};

// ============================================================
// DATA & WIDGET ULANG TAHUN JEMAAT & KALENDER KEGIATAN TAHUNAN
// ============================================================
export const INITIAL_MEMBER_BIRTHDAYS = [];
export const LEGACY_DUMMY_BDAY_IDS = new Set(['bday_1', 'bday_2', 'bday_3', 'bday_4']);

export const INITIAL_ANNUAL_CALENDAR = [
    { id: 'cal_1', title: 'Perjamuan Kudus Triwulan I', dateYMD: '2026-03-28', quarter: 1, category: 'Ibadah Sakramen', location: 'GMAHK Jemaat Pisgah BISDAC - Batam', desc: 'Kebaktian Perjamuan Kudus & Basuh Kaki Triwulan I' },
    { id: 'cal_2', title: 'Pekan Doa Rumah Tangga & Keluarga', dateYMD: '2026-05-09', quarter: 2, category: 'Pelayanan Keluarga', location: 'GMAHK Jemaat Pisgah BISDAC - Batam', desc: 'Kebaktian Kebangunan Rohani Keluarga Advent' },
    { id: 'cal_3', title: 'Perjamuan Kudus Triwulan II', dateYMD: '2026-06-27', quarter: 2, category: 'Ibadah Sakramen', location: 'GMAHK Jemaat Pisgah BISDAC - Batam', desc: 'Kebaktian Perjamuan Kudus & Basuh Kaki Triwulan II' },
    { id: 'cal_4', title: 'Sabat Pathfinder & Adventurer Sedunia', dateYMD: '2026-09-19', quarter: 3, category: 'Pemuda & Anak', location: 'GMAHK Jemaat Pisgah BISDAC - Batam', desc: 'Pelayanan Khusus Klub Pathfinder & Adventurer' },
    { id: 'cal_5', title: 'Perjamuan Kudus Triwulan III', dateYMD: '2026-09-26', quarter: 3, category: 'Ibadah Sakramen', location: 'GMAHK Jemaat Pisgah BISDAC - Batam', desc: 'Kebaktian Perjamuan Kudus & Basuh Kaki Triwulan III' },
    { id: 'cal_6', title: 'Pekan Doa Akhir Tahun & Syukur', dateYMD: '2026-11-07', quarter: 4, category: 'Kerohanian', location: 'GMAHK Jemaat Pisgah BISDAC - Batam', desc: 'Pekan Doa Sedunia & Kebaktian Ucapan Syukur' },
    { id: 'cal_7', title: 'Perjamuan Kudus Triwulan IV & Tutup Tahun', dateYMD: '2026-12-26', quarter: 4, category: 'Ibadah Sakramen', location: 'GMAHK Jemaat Pisgah BISDAC - Batam', desc: 'Kebaktian Perjamuan Kudus Penutup Tahun' }
];

export const loadMemberBirthdays = () => {
    try {
        const raw = localStorage.getItem(MEMBER_BIRTHDAYS_STORAGE_KEY);
        if (raw !== null) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.filter(item => item && !LEGACY_DUMMY_BDAY_IDS.has(item.id));
            }
        }
    } catch (e) { }
    return INITIAL_MEMBER_BIRTHDAYS;
};

export const saveMemberBirthdays = (list, syncToBackend = false, token = '') => {
    try {
        const safeList = Array.isArray(list) ? list : [];
        localStorage.setItem(MEMBER_BIRTHDAYS_STORAGE_KEY, JSON.stringify(safeList));
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('pisgah-calendar-updated'));
        }, 0);

        if (syncToBackend && GAS_API_URL) {
            const pwd = token || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('PISGAH_ADMIN_SESSION_TOKEN') : '') || '';
            portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveMemberBirthdays', password: pwd, birthdays: safeList })
            }).catch(e => console.warn('Gagal sinkron ultah jemaat ke Google Sheets:', e));
        }
    } catch (e) { }
};

export const loadAnnualCalendar = () => {
    try {
        const raw = localStorage.getItem(ANNUAL_CALENDAR_STORAGE_KEY);
        if (raw !== null) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) { }
    return INITIAL_ANNUAL_CALENDAR;
};

export const saveAnnualCalendar = (list, syncToBackend = false, token = '') => {
    try {
        const safeList = Array.isArray(list) ? list : [];
        localStorage.setItem(ANNUAL_CALENDAR_STORAGE_KEY, JSON.stringify(safeList));
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('pisgah-calendar-updated'));
        }, 0);

        if (syncToBackend && GAS_API_URL) {
            const pwd = token || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('PISGAH_ADMIN_SESSION_TOKEN') : '') || '';
            portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveAnnualCalendar', password: pwd, calendarItems: safeList })
            }).catch(e => console.warn('Gagal sinkron kalender tahunan ke Google Sheets:', e));
        }
    } catch (e) { }
};

export const BirthdayAndCalendarWidget = () => {
    const [activeMode, setActiveMode] = React.useState('calendar'); // 'calendar' | 'birthday'
    const [monthFilter, setMonthFilter] = React.useState('all'); // 'all' | 'prev' | 'current' | 'next'
    const [birthdays, setBirthdays] = React.useState(() => loadMemberBirthdays());
    const [calendarItems, setCalendarItems] = React.useState(() => loadAnnualCalendar());

    React.useEffect(() => {
        const sync = () => {
            setBirthdays(loadMemberBirthdays());
            setCalendarItems(loadAnnualCalendar());
        };
        window.addEventListener('pisgah-calendar-updated', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('pisgah-calendar-updated', sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const todayDate = new Date();
    const currentMonth = todayDate.getMonth() + 1;
    const currentDay = todayDate.getDate();
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const allowedMonths = React.useMemo(() => new Set([prevMonth, currentMonth, nextMonth]), [prevMonth, currentMonth, nextMonth]);

    const getMonthOrderRank = React.useCallback((m) => {
        const num = Number(m);
        if (num === currentMonth) return 0; // Bulan Ini paling atas
        if (num === nextMonth) return 1;    // Bulan Depan urutan ke-2
        if (num === prevMonth) return 2;    // Bulan Lalu urutan ke-3
        return 3;
    }, [currentMonth, nextMonth, prevMonth]);

    const extractEventMonth = (ev) => {
        if (!ev || !ev.dateYMD) return 0;
        const parts = String(ev.dateYMD).trim().split(/[-/]/);
        if (parts.length >= 2) {
            return parts[0].length === 4 ? (parseInt(parts[1], 10) || 0) : (parseInt(parts[1], 10) || 0);
        }
        return 0;
    };

    // Hanya ambil Ulang Tahun dari 3 bulan (1 bulan terakhir, bulan ini, 1 bulan berikutnya)
    const threeMonthsBirthdays = React.useMemo(() => {
        return birthdays.filter(b => allowedMonths.has(Number(b.birthMonth)));
    }, [birthdays, allowedMonths]);

    const sortedBirthdays = React.useMemo(() => {
        return [...threeMonthsBirthdays]
            .filter(b => {
                const m = Number(b.birthMonth);
                if (monthFilter === 'prev') return m === prevMonth;
                if (monthFilter === 'current') return m === currentMonth;
                if (monthFilter === 'next') return m === nextMonth;
                return true;
            })
            .sort((a, b) => {
                const isTodayA = Number(a.birthMonth) === currentMonth && Number(a.birthDay) === currentDay;
                const isTodayB = Number(b.birthMonth) === currentMonth && Number(b.birthDay) === currentDay;
                if (isTodayA && !isTodayB) return -1;
                if (!isTodayA && isTodayB) return 1;

                const rankA = getMonthOrderRank(a.birthMonth);
                const rankB = getMonthOrderRank(b.birthMonth);
                if (rankA !== rankB) return rankA - rankB;
                return (Number(a.birthDay) || 1) - (Number(b.birthDay) || 1);
            });
    }, [threeMonthsBirthdays, monthFilter, prevMonth, currentMonth, nextMonth, currentDay, getMonthOrderRank]);

    // Hanya ambil Kalender Tahunan dari 3 bulan (1 bulan terakhir, bulan ini, 1 bulan berikutnya)
    const threeMonthsCalendar = React.useMemo(() => {
        return calendarItems.filter(item => allowedMonths.has(extractEventMonth(item)));
    }, [calendarItems, allowedMonths]);

    const filteredCalendar = React.useMemo(() => {
        return [...threeMonthsCalendar]
            .filter(item => {
                const m = extractEventMonth(item);
                if (monthFilter === 'prev') return m === prevMonth;
                if (monthFilter === 'current') return m === currentMonth;
                if (monthFilter === 'next') return m === nextMonth;
                return true;
            })
            .sort((a, b) => {
                const mA = extractEventMonth(a);
                const mB = extractEventMonth(b);
                const rankA = getMonthOrderRank(mA);
                const rankB = getMonthOrderRank(mB);
                if (rankA !== rankB) return rankA - rankB;
                return String(a.dateYMD || '').localeCompare(String(b.dateYMD || ''));
            });
    }, [threeMonthsCalendar, monthFilter, prevMonth, currentMonth, nextMonth, getMonthOrderRank]);

    const handleSendBirthdayWA = (b) => {
        const monthLabel = BIBLE_YEAR_MONTH_NAMES[(b.birthMonth || 1) - 1] || '';
        const msg =
            `🎉 *Selamat Ulang Tahun, ${b.nama}!* 🎂🙏\n` +
            `_(${b.birthDay} ${monthLabel})_\n\n` +
            `Keluarga besar *GMAHK Jemaat Pisgah BISDAC - Batam* mengucapkan selamat bersyukur atas bertambahnya usia yang Tuhan karuniakan.\n\n` +
            `📖 *"TUHAN memberkati engkau dan melindungi engkau; TUHAN menyinari engkau dengan wajah-Nya dan memberi engkau kasih karunia."* (Bilangan 6:24-25)\n\n` +
            `Kiranya umur panjang, kesehatan, dan sukacita senantiasa menyertai kehidupan dan pelayanan Anda. Tuhan Yesus memberkati! 🕊️`;
        const digits = String(b.wa || '').replace(/\D/g, '');
        const cleanPhone = digits ? (digits.startsWith('0') ? '62' + digits.slice(1) : digits) : '';
        const url = cleanPhone
            ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
            : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const handleAddCalendarItemToGCal = (ev) => {
        const ymdClean = String(ev.dateYMD || '2026-01-01').replace(/-/g, '');
        const title = `${ev.title} - GMAHK Jemaat Pisgah BISDAC Batam`;
        const details = `${ev.desc || ev.title}\nKategori: ${ev.category || 'Kegiatan Gereja'}\nPortal: ${getCleanBaseUrl()}`;
        const location = ev.location || 'GMAHK Jemaat Pisgah BISDAC - Batam';
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${ymdClean}T090000/${ymdClean}T123000&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
        window.open(url, '_blank');
    };

    return (
        <HomeCard
            badgeIcon="Calendar"
            badgeText="Agenda & Perhatian Jemaat"
            title="Kalender Kegiatan & Ulang Tahun"
            subtitle="Agenda program kegiatan jemaat dan ucapan syukur hari ulang tahun anggota."
            containerClassName="h-full"
            headerRightContent={(
                <div className="flex items-center bg-[#F4F7EF] dark:bg-navy-950 p-1 rounded-2xl border border-[#E2E8D8] dark:border-navy-800 self-start md:self-auto">
                    <button
                        type="button"
                        onClick={() => setActiveMode('calendar')}
                        className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${activeMode === 'calendar' ? 'bg-[#2C3F21] text-white dark:bg-gold-500 dark:text-navy-950 shadow-xs' : 'text-[#596B4D] dark:text-navy-300'}`}
                    >
                        <span>📅 Kalender ({threeMonthsCalendar.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveMode('birthday')}
                        className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${activeMode === 'birthday' ? 'bg-[#2C3F21] text-white dark:bg-gold-500 dark:text-navy-950 shadow-xs' : 'text-[#596B4D] dark:text-navy-300'}`}
                    >
                        <span>🎂 Ulang Tahun ({threeMonthsBirthdays.length})</span>
                    </button>
                </div>
            )}
            footerLeft={<span>Rentang: {BIBLE_YEAR_MONTH_NAMES[prevMonth - 1]} – {BIBLE_YEAR_MONTH_NAMES[nextMonth - 1]}</span>}
            footerRight={(
                <span className="font-bold text-[#4A7045] dark:text-gold-400">
                    {activeMode === 'calendar' ? `${filteredCalendar.length} Kegiatan` : `${sortedBirthdays.length} Jemaat`}
                </span>
            )}
        >

            {/* Filter 3 Bulan (1 Bulan Terakhir, Bulan Ini, 1 Bulan Berikutnya) */}
            <div className="mt-4">
                <ScrollableFilterBar>
                    {[
                        { id: 'all', label: `3 Bulan (${BIBLE_YEAR_MONTH_NAMES[prevMonth - 1]}–${BIBLE_YEAR_MONTH_NAMES[nextMonth - 1]})` },
                        { id: 'prev', label: `Bulan Lalu (${BIBLE_YEAR_MONTH_NAMES[prevMonth - 1]})` },
                        { id: 'current', label: `⭐ Bulan Ini (${BIBLE_YEAR_MONTH_NAMES[currentMonth - 1]})` },
                        { id: 'next', label: `Bulan Depan (${BIBLE_YEAR_MONTH_NAMES[nextMonth - 1]})` }
                    ].map(f => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setMonthFilter(f.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${monthFilter === f.id ? 'bg-[#4A7045] text-white dark:bg-gold-500 dark:text-navy-950 font-black' : 'bg-[#F4F7EF] dark:bg-navy-800 text-[#596B4D] dark:text-navy-300'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </ScrollableFilterBar>
            </div>

            {activeMode === 'calendar' ? (
                <div className="mt-4 flex-1 flex flex-col">
                    {filteredCalendar.length === 0 ? (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-[#C5D5BC] dark:border-navy-700 text-[#596B4D] dark:text-gray-400 text-xs sm:text-sm font-bold flex-1 flex items-center justify-center">
                            Belum ada agenda kalender kegiatan pada periode {monthFilter === 'prev' ? BIBLE_YEAR_MONTH_NAMES[prevMonth - 1] : monthFilter === 'current' ? BIBLE_YEAR_MONTH_NAMES[currentMonth - 1] : monthFilter === 'next' ? BIBLE_YEAR_MONTH_NAMES[nextMonth - 1] : `${BIBLE_YEAR_MONTH_NAMES[prevMonth - 1]}–${BIBLE_YEAR_MONTH_NAMES[nextMonth - 1]}`}.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[540px] overflow-y-auto custom-scrollbar pr-1 flex-1 content-start">
                            {filteredCalendar.map(ev => {
                                const evMonth = extractEventMonth(ev);
                                const isThisMonth = evMonth === currentMonth;
                                const isNextMonth = evMonth === nextMonth;
                                return (
                                    <div
                                        key={ev.id}
                                        className="p-4 rounded-2xl border flex flex-col justify-between gap-3 transition bg-[#F7F9F3] dark:bg-navy-950/70 border-[#E2E8D8] dark:border-navy-800 hover:border-[#4A7045] dark:hover:border-gold-500/50"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#4A7045]/15 text-[#2C3F21] dark:bg-gold-500/15 dark:text-gold-400">
                                                        TW {ev.quarter || 1} • {ev.category}
                                                    </span>
                                                    {isThisMonth ? (
                                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                                                            Bulan Ini
                                                        </span>
                                                    ) : isNextMonth ? (
                                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300">
                                                            Bulan Depan
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gray-200 dark:bg-navy-800 text-gray-600 dark:text-gray-400">
                                                            Bulan Lalu
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-bold text-[#9A6B1A] dark:text-gold-300">
                                                    {formatIndoDateShort(ev.dateYMD)}
                                                </span>
                                            </div>
                                            <h4 className="text-sm sm:text-base font-black text-[#2C3F21] dark:text-white leading-snug">
                                                {ev.title}
                                            </h4>
                                            {ev.desc && (
                                                <p className="text-xs text-[#596B4D] dark:text-gray-400 mt-1 line-clamp-2">
                                                    {ev.desc}
                                                </p>
                                            )}
                                        </div>
                                        <div className="pt-2.5 border-t border-[#E2E8D8]/80 dark:border-navy-800 flex items-center justify-between gap-2">
                                            <span className="text-[11px] text-[#596B4D] dark:text-gray-400 truncate flex items-center gap-1">
                                                <Icon name="MapPin" className="w-3 h-3 text-[#D19B45] shrink-0" />
                                                <span className="truncate">{ev.location || 'GMAHK Pisgah'}</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleAddCalendarItemToGCal(ev)}
                                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-800 hover:bg-[#4A7045] hover:text-white dark:hover:bg-gold-500 dark:hover:text-navy-950 text-[#2C3F21] dark:text-gold-300 border border-[#C5D5BC] dark:border-navy-700 text-[11px] font-extrabold shrink-0 transition cursor-pointer flex items-center gap-1"
                                                title="Simpan ke Google Calendar HP"
                                            >
                                                <Icon name="CalendarPlus" className="w-3.5 h-3.5" />
                                                <span>+ Kalender HP</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                sortedBirthdays.length === 0 ? (
                    <div className="mt-4 p-8 text-center rounded-2xl border border-dashed border-[#C5D5BC] dark:border-navy-700 text-[#596B4D] dark:text-gray-400 text-xs sm:text-sm font-bold flex-1 flex items-center justify-center">
                        Belum ada data ulang tahun jemaat pada periode {monthFilter === 'prev' ? BIBLE_YEAR_MONTH_NAMES[prevMonth - 1] : monthFilter === 'current' ? BIBLE_YEAR_MONTH_NAMES[currentMonth - 1] : monthFilter === 'next' ? BIBLE_YEAR_MONTH_NAMES[nextMonth - 1] : `${BIBLE_YEAR_MONTH_NAMES[prevMonth - 1]}–${BIBLE_YEAR_MONTH_NAMES[nextMonth - 1]}`}.
                    </div>
                ) : (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[540px] overflow-y-auto custom-scrollbar pr-1 flex-1 content-start">
                        {sortedBirthdays.map(b => {
                            const monthName = BIBLE_YEAR_MONTH_NAMES[(b.birthMonth || 1) - 1] || '';
                            const bMonth = Number(b.birthMonth);
                            const bDay = Number(b.birthDay);
                            const isToday = bMonth === currentMonth && bDay === currentDay;
                            const isThisMonth = bMonth === currentMonth;
                            const isNextMonth = bMonth === nextMonth;
                            return (
                                <div
                                    key={b.id}
                                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition ${isToday ? 'bg-gradient-to-br from-amber-100/90 via-amber-50 to-white dark:from-gold-500/20 dark:via-navy-900 dark:to-navy-950 border-amber-400 dark:border-gold-400 shadow-md ring-2 ring-amber-400/40' : 'bg-[#F7F9F3] dark:bg-navy-950/70 border-[#E2E8D8] dark:border-navy-800 hover:border-[#4A7045] dark:hover:border-gold-500/50'}`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${isToday ? 'bg-amber-500 text-white shadow-xs' : 'bg-gold-500/20 text-amber-800 dark:text-gold-300'}`}>
                                                🎂 {b.birthDay} {monthName}
                                            </span>
                                            {isToday ? (
                                                <span className="text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs animate-pulse">
                                                    🎉 Hari Ini!
                                                </span>
                                            ) : isThisMonth ? (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                                                    Bulan Ini
                                                </span>
                                            ) : isNextMonth ? (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300">
                                                    Bulan Depan
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gray-200 dark:bg-navy-800 text-gray-600 dark:text-gray-400">
                                                    Bulan Lalu
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-sm sm:text-base font-black text-[#2C3F21] dark:text-white">
                                            {b.nama}
                                        </h4>
                                        <p className="text-xs text-[#596B4D] dark:text-gray-400 font-semibold mt-0.5">
                                            {b.kategori || 'Anggota Jemaat'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSendBirthdayWA(b)}
                                        className="w-full py-2 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] dark:text-emerald-400 hover:text-white border border-[#25D366]/30 text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Icon name="WhatsApp" className="w-3.5 h-3.5" />
                                        <span>🎉 Kirim Ucapan WA</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )
            )}

        </HomeCard>
    );
};

// ============================================================
// WIDGET 3: CARI TUGAS PELAYANAN SAYA (+ KONFIRMASI KEHADIRAN)
// ============================================================
export const QuickDutyFinderWidget = ({ jadwalDB, setActiveTab, dataPejabat = [] }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [attendanceModal, setAttendanceModal] = React.useState(null);
    const attendanceMap = useOfficerAttendance();

    const dutiesFound = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query || query.length < 2) return [];

        const results = [];
        const todayStr = toYMD(new Date());

        const dates = Object.keys(jadwalDB || {}).filter(d => d >= todayStr).sort();

        dates.forEach(dateStr => {
            const j = jadwalDB[dateStr];
            if (!j) return;
            const isRabu = new Date(dateStr + 'T00:00:00').getDay() === 3;

            const checkOfficer = (p, sesi, waktu) => {
                if (!p || !p.nama) return;
                const officerName = String(p.nama).toLowerCase();
                if (officerName.includes(query)) {
                    results.push({
                        dateStr,
                        formattedDate: formatIndoDate(dateStr),
                        sesi,
                        waktu: waktu || (isRabu ? '19:30 WIB - selesai' : '10:00 - 13:00 WIB'),
                        tugas: p.tugas || 'Petugas',
                        nama: p.nama
                    });
                }
            };

            if (isRabu && Array.isArray(j.petugas)) {
                j.petugas.forEach(p => checkOfficer(p, 'Ibadah Permintaan Doa', j.time || '19:30 WIB - selesai'));
            } else {
                if (Array.isArray(j.sekolahSabat)) j.sekolahSabat.forEach(p => checkOfficer(p, 'Sekolah Sabat', j.sekolahSabatTime || '11:45 - 12:40 WIB'));
                if (Array.isArray(j.khotbah)) j.khotbah.forEach(p => checkOfficer(p, 'Kebaktian Khotbah', j.khotbahTime || '10:00 - 11:45 WIB'));
                if (Array.isArray(j.diakon)) j.diakon.forEach(p => checkOfficer(p, 'Pelayanan Diakon', j.time || '10:00 - 13:00 WIB'));
                if (Array.isArray(j.musik)) j.musik.forEach(p => checkOfficer(p, 'Pelayanan Musik', j.time || '10:00 - 13:00 WIB'));
            }
        });

        return results;
    }, [jadwalDB, searchQuery]);

    return (
        <HomeCard
            badgeIcon="Users"
            badgeText="Pelayanan Jemaat"
            title="Cari & Konfirmasi Tugas Pelayanan Saya"
            subtitle="Cek jadwal penugasan Anda pada kebaktian mendatang dan lakukan konfirmasi kesiapan hadir langsung dari sini."
            headerRightContent={(
                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                    <button
                        type="button"
                        onClick={() => shareSabbathDutyRecapToWhatsApp({ jadwalDB })}
                        className="px-3.5 py-2.5 sm:py-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] dark:text-emerald-400 hover:text-white border border-[#25D366]/30 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
                        title="Bagikan format rekap seluruh petugas Sabat pekan ini ke WhatsApp Majelis"
                    >
                        <Icon name="WhatsApp" className="w-4 h-4" />
                        <span>WA</span>
                    </button>
                    <div className="relative flex-1 sm:w-60 md:w-64 max-w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama pelayan (misal: Sarah)..."
                            className="w-full box-border bg-[#F4F7EF] dark:bg-navy-950 border border-[#E2E8D8] dark:border-navy-700 text-[#2C3F21] dark:text-white rounded-2xl px-4 py-2.5 sm:py-3 pl-11 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#4A7045] dark:focus:ring-gold-500 transition shadow-inner placeholder-[#596B4D]/60 dark:placeholder-gray-500"
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596B4D] dark:text-gray-400 pointer-events-none">
                            <Icon name="Search" className="w-4 h-4" />
                        </div>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                            >
                                <Icon name="X" className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
            footerLeft="Konfirmasi kesiapan hadir Anda untuk kelancaran ibadah"
            footerRight="GMAHK Jemaat Pisgah BISDAC"
        >
            <OfficerAttendanceModal modalData={attendanceModal} onClose={() => setAttendanceModal(null)} dataPejabat={dataPejabat} />

            {searchQuery.trim().length >= 2 ? (
                dutiesFound.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                        {dutiesFound.map((item, idx) => {
                            const recKey = getOfficerAttendanceKey(item.dateStr, item.tugas, item.nama);
                            const att = attendanceMap[recKey];
                            return (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-[#F7F9F3] dark:bg-navy-950/70 border border-[#E2E8D8] dark:border-navy-700/80 hover:border-[#4A7045] dark:hover:border-gold-500 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#4A7045]/15 text-[#2C3F21] dark:bg-gold-500/15 dark:text-gold-400">
                                                {item.sesi}
                                            </span>
                                            <span className="text-xs text-[#596B4D] dark:text-gray-400 font-semibold">
                                                {item.formattedDate}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-extrabold text-[#2C3F21] dark:text-white mt-2">
                                            {item.tugas}
                                        </h4>
                                        <div className="flex items-center justify-between gap-2 mt-1">
                                            <p className="text-xs text-[#596B4D] dark:text-gray-300 font-medium flex items-center gap-1.5">
                                                <Icon name="User" className="w-3.5 h-3.5 text-[#D19B45]" />
                                                <span>Petugas: <strong>{item.nama}</strong></span>
                                            </p>
                                            {att && (
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${att.status === 'hadir' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'}`}>
                                                    {att.status === 'hadir' ? '✅ Siap Hadir' : '⚠️ Berhalangan'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3.5 flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setAttendanceModal({ ...item, existing: att })}
                                            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${att?.status === 'hadir' ? 'bg-emerald-600 text-white' : att?.status === 'berhalangan' ? 'bg-amber-500 text-navy-950' : 'bg-[#4A7045] hover:bg-[#3A5836] dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-navy-950'}`}
                                        >
                                            <Icon name="CheckCircle" className="w-3.5 h-3.5" />
                                            <span>{att ? 'Ubah Konfirmasi' : 'Konfirmasi Hadir'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => sendWhatsAppOfficerReminder({
                                                nama: item.nama,
                                                tugas: item.tugas,
                                                sesi: item.sesi,
                                                dateStr: item.dateStr,
                                                waktu: item.waktu,
                                                dataPejabat
                                            })}
                                            title={`Kirim Pengingat WhatsApp ke ${item.nama}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] dark:text-emerald-400 hover:text-white border border-[#25D366]/30 text-xs font-extrabold transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
                                        >
                                            <Icon name="WhatsApp" className="w-3.5 h-3.5" />
                                            <span>WA</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-6 rounded-2xl bg-[#F7F9F3] dark:bg-navy-950/40 border border-dashed border-[#E2E8D8] dark:border-navy-700 text-center">
                        <Icon name="Info" className="w-7 h-7 mx-auto text-[#D19B45] mb-2" />
                        <p className="text-sm font-bold text-[#2C3F21] dark:text-white">
                            Tidak ditemukan jadwal penugasan untuk "{searchQuery}"
                        </p>
                        <p className="text-xs text-[#596B4D] dark:text-gray-400 mt-1 max-w-md mx-auto">
                            Nama tersebut belum terdaftar pada jadwal kebaktian terdekat. Jika terdapat pergantian atau penugasan baru, silakan konfirmasi ke koordinator jadwal.
                        </p>
                    </div>
                )
            ) : (
                <div className="pt-2 text-xs text-[#596B4D] dark:text-gray-400 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Ketik minimal 2 huruf nama untuk mencari & mengonfirmasi kehadiran pelayanan Anda di kebaktian mendatang.</span>
                </div>
            )}
        </HomeCard>
    );
};

// ============================================================================
// KOMPONEN NAVIGASI KONSOLIDASI: IBADAH & SISTEM GEREJA
// ============================================================================

export const IbadahNavHeader = ({ activeSubTab, setActiveTab }) => {
    const tabs = [
        { id: 'susunan_ibadah', label: '📜 Kertas Acara' },
        { id: 'jadwal', label: '📅 Jadwal & Petugas' },
        { id: 'live', label: '🔴 Live Streaming' }
    ];

    return (
        <div className="w-full max-w-xl mx-auto mb-6 p-1.5 bg-[#F4F7EF] dark:bg-navy-950/80 rounded-2xl border border-[#E2E8D8] dark:border-navy-800 flex items-center justify-center gap-1.5 shadow-sm">
            {tabs.map(t => {
                const isActive = activeSubTab === t.id;
                return (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${isActive ? 'bg-[#4A7045] text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm' : 'text-[#596B4D] dark:text-gray-400 hover:text-[#2C3F21] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        <span>{t.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export const SistemGerejaModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    if (typeof document === 'undefined') return null;

    const systems = [
        {
            title: "Presensi & Sekolah Sabat",
            desc: "Pencatatan absensi jemaat, 10 poin keterlibatan kelas, & doa syafaat.",
            icon: "ClipboardCheck",
            color: "text-emerald-700 dark:text-emerald-400",
            bg: "bg-emerald-500/15 border-emerald-500/30",
            link: "./hadir.html"
        },
        {
            title: "Laporan Keuangan & Kas",
            desc: "Kas perbendaharaan, kuitansi digital transaksi, & buletin Sabat.",
            icon: "BarChart",
            color: "text-amber-800 dark:text-gold-300",
            bg: "bg-amber-500/15 border-amber-500/30",
            link: "./laporan.html"
        },
        {
            title: "Inventaris Aset Gereja",
            desc: "Katalog aset barang, label QR Code, & peminjaman inventaris.",
            icon: "Package",
            color: "text-blue-800 dark:text-sky-300",
            bg: "bg-sky-500/15 border-sky-500/30",
            link: "./inventaris.html"
        },
        {
            title: "Worship Presenter",
            desc: "Aplikasi desktop multimedia presentasi lirik lagu & Alkitab.",
            icon: "MonitorDown",
            color: "text-purple-800 dark:text-purple-300",
            bg: "bg-purple-500/15 border-purple-500/30",
            link: "./worship-presenter.html"
        }
    ];

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div onClick={onClose} className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm" />

            <div className="relative w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border-2 border-[#E2E8D8] dark:border-navy-700 overflow-hidden z-10 flex flex-col my-auto">
                <div className="p-4 sm:p-5 border-b border-[#E2E8D8] dark:border-navy-800 flex items-center justify-between bg-[#F7F9F3] dark:bg-navy-950">
                    <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-[#4A7045]/15 dark:bg-gold-500/15 text-[#4A7045] dark:text-gold-400 flex items-center justify-center font-black">
                            <Icon name="Layers" className="w-5 h-5" />
                        </span>
                        <div>
                            <h4 className="text-base font-black text-navy-900 dark:text-white">Sistem Manajemen Gereja</h4>
                            <p className="text-xs text-[#596B4D] dark:text-gray-400">Aplikasi & Tata Kelola Jemaat Pisgah BISDAC</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 cursor-pointer">
                        <Icon name="X" className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-navy-900">
                    {systems.map((s, idx) => (
                        <a
                            key={idx}
                            href={s.link}
                            className="p-4 rounded-2xl bg-[#F7F9F3] dark:bg-navy-950/70 hover:bg-white dark:hover:bg-navy-800 border border-[#E2E8D8] dark:border-navy-800 hover:border-[#4A7045] dark:hover:border-gold-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                            <div>
                                <div className={`w-10 h-10 rounded-xl ${s.bg} border flex items-center justify-center ${s.color} mb-3 group-hover:scale-105 transition-transform`}>
                                    <Icon name={s.icon} className="w-5 h-5" />
                                </div>
                                <h5 className="text-sm font-black text-navy-900 dark:text-white group-hover:text-[#4A7045] dark:group-hover:text-gold-300 transition-colors">
                                    {s.title}
                                </h5>
                                <p className="text-[11px] text-[#596B4D] dark:text-gray-400 mt-1 leading-snug">
                                    {s.desc}
                                </p>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-[#E2E8D8]/70 dark:border-navy-800 flex items-center justify-between text-xs font-bold text-[#4A7045] dark:text-gold-400">
                                <span>Buka Modul</span>
                                <Icon name="ChevronRight" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </a>
                    ))}
                </div>

                <div className="p-3 bg-[#F7F9F3] dark:bg-navy-950/60 border-t border-[#E2E8D8] dark:border-navy-800 flex items-center justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-navy-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-300 dark:hover:bg-navy-700 transition cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ============================================================================
// DAFTAR CAPTION TEKS UNTUK TIAP SLIDE HERO BANNER (DAPAT DIUBAH DI SINI)
// ============================================================================
export const DEFAULT_HERO_CAPTIONS = [
    {
        badge: "Gereja Masehi Advent Hari Ketujuh",
        title: "Temukan Damai Bersama Tuhan",
        subtitle: "Jemaat Pisgah BISDAC, mari beribadah, melayani, dan bertumbuh dalam iman."
    },
    {
        badge: "Ibadah & Sabat Suci",
        title: "Bertumbuh Dalam Firman",
        subtitle: "Bergabunglah dalam persekutuan doa, Sekolah Sabat, dan kebaktian bersama kami."
    },
    {
        badge: "Komunitas Kasih",
        title: "Satu Tubuh di Dalam Kristus",
        subtitle: "Menebarkan kasih, sukacita, dan pengharapan bagi sesama dan keluarga."
    },
    {
        badge: "Keluarga Allah",
        title: "Melayani Dengan Sukacita",
        subtitle: "Menjangkau jiwa dan mempersiapkan kedatangan Tuhan yang kedua kali."
    },
    {
        badge: "Pendidikan & Kaum Muda",
        title: "Generasi Beriman & Berpengharapan",
        subtitle: "Membimbing anak-anak dan pemuda bertumbuh teguh dalam kebenaran Firman Tuhan."
    },
    {
        badge: "Doa & Pengharapan",
        title: "Kekuatan di Dalam Doa",
        subtitle: "Bawalah segala pergumulan hidup ke hadirat Tuhan yang penuh kasih dan kuasa."
    },
    {
        badge: "Pelayanan Kesehatan",
        title: "Hidup Sehat & Berkat Jasmani",
        subtitle: "Menjaga bait suci Allah dengan gaya hidup sehat dan seimbang jasmani rohani."
    },
    {
        badge: "Misi & Penginjilan",
        title: "Membawa Terang ke Tengah Dunia",
        subtitle: "Menyampaikan Kabar Baik keselamatan kepada sesama dengan penuh ketulusan."
    },
    {
        badge: "Pujian & Penyembahan",
        title: "Memuliakan Nama Sang Pencipta",
        subtitle: "Mengangkat puji-pujian dengan segenap hati dan jiwa bagi kemuliaan-Nya."
    },
    {
        badge: "Pengharapan Mulia",
        title: "Menyambut Kedatangan Kristus",
        subtitle: "Maranatha! Bersiaplah dengan setia menantikan kedatangan Sang Raja Damai."
    }
];

export const parseFolderDate = (name) => {
    if (!name) return 0;
    const lower = name.toLowerCase().trim();
    const monthMap = {
        jan: 0, januari: 0, january: 0,
        feb: 1, februari: 1, february: 1,
        mar: 2, maret: 2, march: 2,
        apr: 3, april: 3,
        mei: 4, may: 4,
        jun: 5, juni: 5, june: 5,
        jul: 6, juli: 6, july: 6,
        agu: 7, ags: 7, agust: 7, agustus: 7, aug: 7, august: 7,
        sep: 8, sept: 8, september: 8,
        okt: 9, oct: 9, oktober: 9, october: 9,
        nov: 10, november: 10,
        des: 11, dec: 11, desember: 11, december: 11
    };

    // Pola 1: "20 June 2026", "Sabat. 25 april 2026", "Sabat. 18april26", "Sabat, 25 Jul 2026", "6 Juni 2026"
    const pattern1 = /(\d{1,2})[\s\.\-_,]*([a-zA-Z]+)[\s\.\-_,]*(\d{2,4})/;
    const m1 = lower.match(pattern1);
    if (m1) {
        const day = parseInt(m1[1], 10);
        const monthKey = m1[2].substring(0, 3);
        let year = parseInt(m1[3], 10);
        if (year < 100) year += 2000;
        const month = monthMap[m1[2]] !== undefined ? monthMap[m1[2]] : (monthMap[monthKey] !== undefined ? monthMap[monthKey] : 0);
        return new Date(year, month, day).getTime();
    }

    // Pola 2: "KKR April 2026", "Mei 2026", "April 26"
    const pattern2 = /([a-zA-Z]+)[\s\.\-_,]*(\d{2,4})/;
    const m2 = lower.match(pattern2);
    if (m2 && (monthMap[m2[1]] !== undefined || monthMap[m2[1].substring(0, 3)] !== undefined)) {
        const month = monthMap[m2[1]] !== undefined ? monthMap[m2[1]] : monthMap[m2[1].substring(0, 3)];
        let year = parseInt(m2[2], 10);
        if (year < 100) year += 2000;
        return new Date(year, month, 1).getTime();
    }

    // Pola 3: Tahun saja "Youth Camp 2026"
    const pattern3 = /(\d{4})/;
    const m3 = lower.match(pattern3);
    if (m3) {
        const year = parseInt(m3[1], 10);
        return new Date(year, 0, 1).getTime();
    }

    return 0;
};

// Helper kategori & styling kartu album
export const getFolderCategoryInfo = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('sabat')) {
        return {
            category: 'sabat',
            label: 'Ibadah Sabat',
            badgeBg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300',
            cardBg: 'from-amber-600 via-amber-700 to-navy-900',
            icon: 'Church'
        };
    }
    if (lower.includes('youth') || lower.includes('pemuda') || lower.includes('anak') || lower.includes('pathfinder') || lower.includes('camp') || lower.includes('adventurer')) {
        return {
            category: 'youth',
            label: 'Pemuda & Anak',
            badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300',
            cardBg: 'from-blue-600 via-indigo-700 to-navy-900',
            icon: 'Users'
        };
    }
    if (lower.includes('sosial') || lower.includes('baksos') || lower.includes('panti') || lower.includes('donor') || lower.includes('masyarakat')) {
        return {
            category: 'sosial',
            label: 'Bakti Sosial',
            badgeBg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300',
            cardBg: 'from-rose-600 via-rose-700 to-navy-900',
            icon: 'Heart'
        };
    }
    if (lower.includes('kkr') || lower.includes('seminar') || lower.includes('kesehatan') || lower.includes('holistic') || lower.includes('kebangunan') || lower.includes('retreat') || lower.includes('revival') || lower.includes('konser')) {
        return {
            category: 'event',
            label: 'Acara Khusus',
            badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300',
            cardBg: 'from-emerald-600 via-teal-700 to-navy-900',
            icon: 'Calendar'
        };
    }
    return {
        category: 'umum',
        label: 'Dokumentasi',
        badgeBg: 'bg-gold-100 text-navy-900 border-gold-300 dark:bg-gold-950/70 dark:text-gold-300',
        cardBg: 'from-navy-800 via-navy-900 to-gold-700',
        icon: 'Image'
    };
};

export const formatFolderDateLabel = (timestamp) => {
    if (!timestamp || timestamp <= 0) return '';
    const d = new Date(timestamp);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const BIBLE_YEAR_MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
export const BIBLE_YEAR_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// --- MODAL PREVIEW LAGU SION INSTAN DI KERTAS ACARA ---
export const SongPreviewModal = ({ isOpen, onClose, song, onOpenFull }) => {
    if (!isOpen || !song) return null;

    const [activePlayingNote, setActivePlayingNote] = React.useState(null);

    // Pembidik Nada (Web Audio API Synth)
    const playPitch = (freq, noteName) => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 2.2);
            setActivePlayingNote(noteName);
            setTimeout(() => {
                setActivePlayingNote(null);
            }, 2200);
        } catch (e) {
            console.warn('Audio tone error:', e);
        }
    };

    // Ekstrak nada dasar jika ada (misal: "D 4/4" -> mainkan D)
    const startingNote = React.useMemo(() => {
        if (!song.keyTime) return null;
        const match = song.keyTime.match(/^([A-G][b#]?)/i);
        if (!match) return null;
        const n = match[1].toUpperCase();
        const noteFreqMap = {
            'C': 261.63, 'C#': 277.18, 'DB': 277.18,
            'D': 293.66, 'D#': 311.13, 'EB': 311.13,
            'E': 329.63,
            'F': 349.23, 'F#': 369.99, 'GB': 369.99,
            'G': 392.00, 'G#': 415.30, 'AB': 415.30,
            'A': 440.00, 'A#': 466.16, 'BB': 466.16,
            'B': 493.88
        };
        const freq = noteFreqMap[n];
        return freq ? { note: n, freq } : null;
    }, [song.keyTime]);

    // Format lirik dari format array song.verses (lagu_sion.json) maupun string song.lyrics
    const parsedVerses = React.useMemo(() => {
        if (!song) return [];
        if (Array.isArray(song.verses) && song.verses.length > 0) {
            return song.verses.map(v => {
                const isKoor = v.type === 'chorus' || (v.label && (v.label.toLowerCase() === 'koor' || v.label.toLowerCase() === 'reff'));
                const label = isKoor ? 'Koor / Reff' : (v.label || 'Bait');
                const lines = Array.isArray(v.lines) ? v.lines : (typeof v.lines === 'string' ? v.lines.split('\n') : []);
                return {
                    label,
                    type: isKoor ? 'chorus' : 'bait',
                    lines: lines.map(l => String(l).trim()).filter(Boolean)
                };
            });
        }
        if (song.lyrics) {
            const rawSections = String(song.lyrics).split(/\n\n+/);
            return rawSections.map((sec, idx) => ({
                label: `Bait ${idx + 1}`,
                type: 'bait',
                lines: sec.split('\n').map(l => l.trim()).filter(Boolean)
            }));
        }
        return [];
    }, [song]);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            <div onClick={onClose} className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm" />

            <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border-2 border-[#E2E8D8] dark:border-navy-700 overflow-hidden z-10 flex flex-col my-auto">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-[#E2E8D8] dark:border-navy-800 bg-[#F7F9F3] dark:bg-navy-950 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-gold-400 font-black text-base flex items-center justify-center border border-amber-500/25 shrink-0 shadow-xs">
                            #{song.number}
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-gold-400 block">
                                Lagu Sion Digital
                            </span>
                            <h3 className="font-extrabold text-base sm:text-lg text-navy-900 dark:text-white truncate">
                                {song.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-navy-600 dark:text-gray-400 flex-wrap">
                                {song.keyTime && (
                                    <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-amber-700 dark:text-gold-400">
                                        🎵 {song.keyTime}
                                    </span>
                                )}
                                {song.artist && song.artist !== '-' && (
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                        • {song.artist}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 transition cursor-pointer shrink-0"
                        aria-label="Tutup"
                    >
                        <Icon name="X" className="w-5 h-5" />
                    </button>
                </div>

                {/* Bar Pembidik Nada Dasar (Pitch Pipe) */}
                {startingNote && (
                    <div className="px-4 py-2.5 bg-amber-500/10 dark:bg-navy-950/80 border-b border-[#E2E8D8] dark:border-navy-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 dark:text-gold-300 flex items-center gap-1.5">
                            <Icon name="Music" className="w-3.5 h-3.5" />
                            <span>Nada Dasar: <strong>{song.keyTime}</strong></span>
                        </span>
                        <button
                            type="button"
                            onClick={() => playPitch(startingNote.freq, startingNote.note)}
                            className={`px-3 py-1 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                                activePlayingNote === startingNote.note
                                    ? 'bg-amber-600 text-white animate-pulse'
                                    : 'bg-amber-500/20 hover:bg-amber-500 text-amber-900 dark:text-gold-300 hover:text-white border border-amber-500/30'
                            }`}
                            title={`Bunyikan nada ${startingNote.note}`}
                        >
                            <span>🔊 {activePlayingNote === startingNote.note ? 'Membunyikan...' : `Bunyikan Nada (${startingNote.note})`}</span>
                        </button>
                    </div>
                )}

                {/* Lyrics Container */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 max-h-[60vh] select-text">
                    {parsedVerses.length > 0 ? (
                        parsedVerses.map((verse, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-2xl border transition-all ${
                                    verse.type === 'chorus'
                                        ? 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/30'
                                        : 'bg-[#F7F9F3] dark:bg-navy-950/60 border-[#E2E8D8]/60 dark:border-navy-800/60'
                                }`}
                            >
                                {verse.label && (
                                    <div className="flex items-center justify-center mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                            verse.type === 'chorus'
                                                ? 'bg-amber-500/25 text-amber-900 dark:text-gold-300 border border-amber-500/30'
                                                : 'bg-navy-900/10 text-navy-800 dark:bg-white/10 dark:text-gray-300'
                                        }`}>
                                            {verse.label}
                                        </span>
                                    </div>
                                )}
                                <div className="space-y-1 text-center">
                                    {verse.lines.map((line, lIdx) => (
                                        <p
                                            key={lIdx}
                                            className={`text-sm sm:text-base leading-relaxed ${
                                                verse.type === 'chorus'
                                                    ? 'font-bold text-amber-950 dark:text-amber-100'
                                                    : 'font-medium text-navy-900 dark:text-gray-100'
                                            }`}
                                        >
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm font-medium text-navy-600 dark:text-gray-400 text-center py-6">
                            Lirik belum tersedia untuk lagu ini.
                        </p>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-3.5 sm:p-4 bg-[#F7F9F3] dark:bg-navy-950 border-t border-[#E2E8D8] dark:border-navy-800 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            if (onOpenFull) onOpenFull(song);
                            onClose();
                        }}
                        className="text-xs font-bold text-amber-700 dark:text-gold-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                        <Icon name="ExternalLink" className="w-3.5 h-3.5" />
                        <span>Buka Layar Penuh</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-navy-900 text-white dark:bg-navy-700 text-xs font-bold hover:bg-navy-800 transition cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- MODAL LAYAR TV LOBI KIOSK VIEW UNTUK KERTAS ACARA ---
export const LobbyTvModal = ({ isOpen, onClose, activeSabat, sabatYMD, formatIndoDate = (d) => d }) => {
    if (!isOpen) return null;
    if (typeof document === 'undefined') return null;

    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [isAutoScroll, setIsAutoScroll] = React.useState(false);
    const scrollContainerRef = React.useRef(null);

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    React.useEffect(() => {
        if (!isAutoScroll) return;
        const el = scrollContainerRef.current;
        if (!el) return;

        let frameId;
        const speed = 0.5;
        const step = () => {
            if (!scrollContainerRef.current) return;
            const container = scrollContainerRef.current;
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
                container.scrollTop = 0;
            } else {
                container.scrollTop += speed;
            }
            frameId = requestAnimationFrame(step);
        };
        frameId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameId);
    }, [isAutoScroll]);

    React.useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                setIsAutoScroll(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const susunan = activeSabat?.susunan || {};
    const ssItems = susunan.sekolahSabat || [];
    const khotbahItems = susunan.khotbah || [];
    const diakonList = Array.isArray(activeSabat?.diakon) ? activeSabat.diakon : [];
    const musikList = Array.isArray(activeSabat?.musik) ? activeSabat.musik : [];

    const timeString = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#070E1A] text-white flex flex-col overflow-hidden animate-fade-in select-none">
            {/* TOP BAR / HEADER KIOSK */}
            <header className="px-6 py-4 bg-[#0B1728]/95 border-b border-gold-500/30 flex items-center justify-between shadow-xl backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4">
                    <img src="./icons/PisgahColor.png" alt="Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(209,155,69,0.5)]" />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-widest text-gold-400 bg-gold-500/15 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                                TV LOBI &bull; KERTAS ACARA
                            </span>
                            <span className="text-xs text-gray-400 font-semibold">GMAHK Jemaat Pisgah BISDAC</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5">
                            SUSUNAN ACARA IBADAH SABAT
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Live Digital Clock */}
                    <div className="text-right">
                        <div className="text-2xl md:text-3xl font-black font-mono tracking-widest text-gold-400 drop-shadow-[0_0_8px_rgba(209,155,69,0.4)]">
                            {timeString} <span className="text-xs font-bold text-gray-400">WIB</span>
                        </div>
                        <p className="text-xs font-bold text-gray-300">
                            {formatIndoDate(sabatYMD || new Date().toISOString().slice(0, 10))}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 border-l border-navy-700 pl-4">
                        <button
                            type="button"
                            onClick={() => setIsAutoScroll(prev => !prev)}
                            className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                isAutoScroll ? 'bg-gold-500 text-navy-950 font-black' : 'bg-navy-800 text-gray-300 hover:text-white border border-navy-700'
                            }`}
                            title="Spasi untuk toggle Auto-Scroll"
                        >
                            <Icon name={isAutoScroll ? 'Pause' : 'Play'} className="w-4 h-4" />
                            <span>{isAutoScroll ? 'Pause' : 'Auto-Scroll'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen().catch(() => {});
                                } else {
                                    document.exitFullscreen().catch(() => {});
                                }
                            }}
                            className="w-9 h-9 rounded-xl bg-navy-800 hover:bg-navy-700 text-gray-300 hover:text-white flex items-center justify-center transition border border-navy-700 cursor-pointer"
                            title="Layar Penuh (F11)"
                        >
                            <Icon name="Maximize2" className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Tutup (ESC)"
                        >
                            <Icon name="X" className="w-4 h-4" />
                            <span>Tutup</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* CONTENT 2-KOLOM BESAR LOBI */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto">
                    {/* KOLOM KIRI (7 Kolom): ACARA KHOTBAH & SEKOLAH SABAT */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Kebaktian Khotbah */}
                        <div className="bg-[#0B1728]/80 border-2 border-gold-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gold-500/20">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-3.5 h-3.5 rounded-full bg-gold-400 animate-pulse" />
                                    <h2 className="text-xl font-black text-gold-400 uppercase tracking-widest">
                                        Kebaktian Khotbah (10:30 WIB)
                                    </h2>
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ibadah Utama</span>
                            </div>

                            <div className="space-y-2.5">
                                {khotbahItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-navy-900/60 border border-navy-800/80 hover:border-gold-500/40 transition">
                                        <span className="text-sm font-semibold text-gray-300">{item.tugas}</span>
                                        <span className="text-base font-extrabold text-white text-right">{item.nama || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sekolah Sabat */}
                        <div className="bg-[#0B1728]/80 border-2 border-emerald-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-500/20">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                                    <h2 className="text-xl font-black text-emerald-300 uppercase tracking-widest">
                                        Sekolah Sabat (09:15 WIB)
                                    </h2>
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pelajaran Firman</span>
                            </div>

                            <div className="space-y-2.5">
                                {ssItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-navy-900/60 border border-navy-800/80 hover:border-emerald-500/40 transition">
                                        <span className="text-sm font-semibold text-gray-300">{item.tugas}</span>
                                        <span className="text-base font-extrabold text-white text-right">{item.nama || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN (5 Kolom): PETUGAS DIAKON & MUSIK & INFO JEMAAT */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Pelayanan Musik */}
                        {musikList.length > 0 && (
                            <div className="bg-[#0B1728]/80 border border-navy-700 rounded-3xl p-5 shadow-xl">
                                <h3 className="text-sm font-black text-gold-400 uppercase tracking-widest pb-2 mb-3 border-b border-navy-700 flex items-center gap-2">
                                    <Icon name="Music" className="w-4 h-4 text-gold-400" />
                                    Pelayanan Musik & Pujian
                                </h3>
                                <div className="space-y-2">
                                    {musikList.map((m, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg bg-navy-900/50 text-sm">
                                            <span className="text-gray-400 font-medium">{m.tugas}</span>
                                            <span className="text-white font-bold">{m.nama}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pelayanan Diakon */}
                        {diakonList.length > 0 && (
                            <div className="bg-[#0B1728]/80 border border-navy-700 rounded-3xl p-5 shadow-xl">
                                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest pb-2 mb-3 border-b border-navy-700 flex items-center gap-2">
                                    <Icon name="Users" className="w-4 h-4 text-emerald-400" />
                                    Pelayanan Diakon & Diakones
                                </h3>
                                <div className="space-y-2">
                                    {diakonList.map((d, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg bg-navy-900/50 text-sm">
                                            <span className="text-gray-400 font-medium">{d.tugas}</span>
                                            <span className="text-white font-bold">{d.nama}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Kotak Salam Sabat */}
                        <div className="bg-gradient-to-br from-gold-500/15 via-navy-900/80 to-navy-950 p-6 rounded-3xl border border-gold-500/30 text-center shadow-lg">
                            <p className="text-gold-300 font-serif italic text-base">
                                &ldquo;Ingatlah dan kuduskanlah hari Sabat: enam hari lamanya engkau akan bekerja dan melakukan segala pekerjaanmu, tetapi hari ketujuh adalah hari Sabat TUHAN, Allahmu.&rdquo;
                            </p>
                            <p className="text-xs font-black text-gold-400 mt-2 tracking-widest uppercase">
                                — Keluaran 20:8-10 —
                            </p>
                            <div className="mt-4 pt-3 border-t border-gold-500/20 text-[11px] text-gray-400 font-medium">
                                Web & Warta Digital: <span className="text-gold-300 font-bold">pisgahbisdac.app</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
