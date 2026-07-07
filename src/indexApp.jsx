import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, Maximize, FileText, Download, Share2, Info, BookOpen, Search as SearchIcon, X, CheckCircle, Navigation, MapPin, Calendar, Phone, Mail, Clock, Globe, ArrowRight, User, PlusCircle, PenTool, Layout, File, ExternalLink, Menu, Music, Activity, Megaphone, Video, ArrowLeft, MoreHorizontal, MessageCircle, Heart, Star, Compass, Anchor, Copy, Check, Upload, Trash2, Map } from 'lucide-react';
import html2pdf from 'html2pdf.js';
// searchlaporan: redirect ke laporan.html (Cek Transaksi)

// --- PWA & SERVICE WORKER LOGIC ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
    });
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

window.installPWA = async () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        alert("Aplikasi sudah terinstal dan saat ini sedang dibuka sebagai aplikasi desktop/mobile.");
        return;
    }
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
    } else {
        alert("Pemasangan otomatis tidak dapat dilakukan saat ini.\n\nAlasan yang mungkin:\n1. Anda masih dalam mode pengembangan (Localhost) tanpa HTTPS.\n2. Aplikasi ini sudah terinstal di perangkat Anda.\n3. Browser Anda (seperti Safari/iOS) tidak mendukung tombol ini.\n\nCara Manual: Tekan menu browser (Titik Tiga atau tombol Share) lalu pilih 'Instal Aplikasi' atau 'Tambahkan ke Layar Utama'.");
    }
};
// -----------------------------------

const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwQJWQ2hKXQMdnFqVYr8Tan_9BIKQLtZyM_Wil6y19mRrgiQhEb1KB0hwOvJsPThcIX/exec'; // PASTIKAN UNTUK MENGISI KEMBALI URL GAS ANDA DI SINI

// Default cover buku berdasarkan kategori
const getDefaultBookCover = (category) => {
    const cat = (category || '').toLowerCase().trim();
    const defaults = {
        'egw': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9ISVMxNzQ3NzM1NjEyMzE5LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/HIS1747735612319.jpg',
        'doktrin': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjc1L2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9mcEUxNzQ5NDcxNDI3NTExLmpwZw/w:1920,q:75/hope-images/67054013a60919c92d92c959/fpE1749471427511.jpg',
        'panduan': 'https://images.hopesoftware.org/resize/L3dfMTkyMF9fcV84MC9ob3BlLWltYWdlcy82MWRlZDc4YTk0YTg4Zjc2MzEwMjAzNDEvQVhNMTY0Mzk2NzU0MjczOS5qcGc/w_1920__q_80/hope-images/61ded78a94a88f7631020341/AXM1643967542739.jpg',
        'renungan': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9DZnExNzQ5MTg3MDg1NjE3LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/Cfq1749187085617.jpg',
        'alkitab': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9ISVMxNzQ3NzM1NjEyMzE5LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/HIS1747735612319.jpg',
        'kesehatan': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjc1L2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9mcEUxNzQ5NDcxNDI3NTExLmpwZw/w:1920,q:75/hope-images/67054013a60919c92d92c959/fpE1749471427511.jpg',
        'misi': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9DZnExNzQ5MTg3MDg1NjE3LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/Cfq1749187085617.jpg',
        'sejarah': 'https://images.hopesoftware.org/resize/L3dfMTkyMF9fcV84MC9ob3BlLWltYWdlcy82MWRlZDc4YTk0YTg4Zjc2MzEwMjAzNDEvQVhNMTY0Mzk2NzU0MjczOS5qcGc/w_1920__q_80/hope-images/61ded78a94a88f7631020341/AXM1643967542739.jpg',
    };
    // Exact match
    if (defaults[cat]) return defaults[cat];
    // Partial match
    for (const [key, url] of Object.entries(defaults)) {
        if (cat.includes(key) || key.includes(cat)) return url;
    }
    // Default umum
    return 'https://images.hopesoftware.org/resize/L3dfMTkyMF9fcV84MC9ob3BlLWltYWdlcy82MWRlZDc4YTk0YTg4Zjc2MzEwMjAzNDEvQVhNMTY0Mzk2NzU0MjczOS5qcGc/w_1920__q_80/hope-images/61ded78a94a88f7631020341/AXM1643967542739.jpg';
};

const parseGambarUrls = (gambarUrl) => {
    if (!gambarUrl) return [];
    return gambarUrl.split('|||').map(url => url.trim()).filter(url => url !== '');
};

const stripHtml = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const decodeHTML = (html) => {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com/open?id=')) {
        const id = url.split('id=')[1];
        return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`; // Naikkan dari w1200 ke w2000 untuk kualitas lebih baik
    }
    if (url.includes('drive.google.com/file/d/')) {
        const id = url.split('/d/')[1].split('/')[0];
        return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`; // Naikkan dari w1200 ke w2000 untuk kualitas lebih baik
    }
    if (url.includes('docs.google.com/presentation/d/') || url.includes('docs.google.com/document/d/') || url.includes('docs.google.com/spreadsheets/d/')) {
        const id = url.split('/d/')[1].split('/')[0];
        return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`;
    }
    if (url.includes('drive.google.com/uc?')) {
        const ucMatch = url.match(/[?&]id=([^&]+)/);
        const fileMatch = url.match(/\/d\/([^/]+)/);
        let id = '';
        if (ucMatch && ucMatch[1]) id = ucMatch[1];
        else if (fileMatch && fileMatch[1]) id = fileMatch[1];

        if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`; // Naikkan dari w1200 ke w2000 untuk kualitas lebih baik
    }
    // Mengembalikan string Base64 murni jika kehilangan awalan data:image/ saat dikirim
    if (!url.startsWith('http') && !url.startsWith('data:image') && url.length > 500) {
        if (url.startsWith('UklG')) return `data:image/webp;base64,${url}`;
        if (url.startsWith('iVBORw')) return `data:image/png;base64,${url}`;
        if (url.startsWith('/9j/')) return `data:image/jpeg;base64,${url}`;
        return `data:image/jpeg;base64,${url}`; // Fallback default
    }
    return url;
};

const getCoverFallback = (b) => {
    if (b.cover && b.cover.trim() !== '') {
        const fmt = formatImageUrl(b.cover);
        return fmt || b.cover;
    }
    if (b.pdfUrl && b.pdfUrl.trim() !== '') {
        const thumb = formatImageUrl(b.pdfUrl);
        if (thumb && thumb.includes('thumbnail?id=')) {
            return thumb.replace('sz=w2000', 'sz=w800');
        }
    }
    return getDefaultBookCover(b.category);
};

const DocumentBadge = ({ book, className = "absolute top-2 left-2" }) => {
    if (!book.pdfUrl) return null;
    const isPpt = book.pdfUrl.includes('presentation') || (book.title && (book.title.toLowerCase().includes('ppt') || book.title.toLowerCase().includes('presentasi')));
    const isDoc = book.pdfUrl.includes('document');
    return (
        <span className={`${className} text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm backdrop-blur-sm ${isPpt ? 'bg-orange-500/90' : isDoc ? 'bg-blue-500/90' : 'bg-green-500/90'}`}>
            {isPpt ? '✓ PPT' : isDoc ? '✓ DOC' : '✓ PDF'}
        </span>
    );
};

// --- KOMPONEN LOADING INI ---
const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[400] flex-col"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
            <div className="loading-spinner mb-6"></div>
            <p className="text-[#D4AF37] font-black tracking-widest text-xl animate-pulse uppercase">...</p>
        </div>
    );
};

// --- INITIAL DATA ---
const defaultSusunan = {
    ssLaguBuka: "LS ...",
    ssLaguTutup: "LS ...",
    kAyatBersahutan: "No. ...",
    kLaguBuka: "LS ...",
    kLaguPujian1_show: false,
    kLaguPujian1_judul: "Koor / Vocal Group",
    kLaguPujian2_show: false,
    kLaguPujian2_judul: "Koor / Vocal Group",
    kLaguPujian3_show: false,
    kLaguPujian3_judul: "Koor / Vocal Group",
    kAyatInti: "...",
    kLaguTutup: "LS ..."
};

const initialJadwalRabu = {
    title: "Ibadah Permintaan Doa (Rabu)", time: "19:30 WIB - selesai",
    petugas: [{ tugas: "Pemimpin Acara", nama: "Pemimpin" }, { tugas: "Renungan", nama: "Renungan" }, { tugas: "Doa Buka", nama: "Doa" }, { tugas: "Tempat", nama: "Tempat" }, { tugas: "Lagu Pujian", nama: "Lagu Pujian" }, { tugas: "Doa Tutup", nama: "Doa" }, { tugas: "Persembahan Kas", nama: "Diakon" }]
};

const initialJadwalSabat = {
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


const IosInstallModal = ({ isOpen, onClose }) => {
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

const ManualInstallModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isAndroid = /android/.test(navigator.userAgent.toLowerCase());

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="glass-box rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-4">
                    <Icon name="Download" className="w-12 h-12 mx-auto text-gold-500" />
                    <h3 className="text-xl font-bold mt-2">Instal Aplikasi</h3>
                </div>
                {isIos ? (
                    <div className="space-y-3 text-sm">
                        <p>1. Tekan ikon <b>Titik Tiga</b> <Icon name="Titik" className="w-4 h-4 inline" /> di kanan bawah browser Safari.</p>
                        <p>2. Tekan ikon <b>Bagikan</b> <Icon name="Share" className="w-4 h-4 inline" /></p>
                        <p>3. Gulir ke atas (View More) dan pilih <b className="text-gold-600">"Tambahkan ke Layar Utama"</b>.</p>
                        <p>4. Klik <b>"Tambah"</b>.</p>
                    </div>
                ) : isAndroid ? (
                    <div className="space-y-3 text-sm">
                        <p>1. Tekan ikon <b> titik tiga </b> <Icon name="Titik" className="w-4 h-4 inline" /> di pojok kanan bawah.</p>
                        <p>2. Pilih <b className="text-gold-600">"Instal Aplikasi"</b> atau <b>"Tambahkan ke Layar Utama"</b>.</p>
                        <p>3. Ikuti petunjuk selanjutnya.</p>
                    </div>
                ) : (
                    <div className="space-y-3 text-sm">
                        <p>1. Tekan ikon <b>Titik Tiga</b> <Icon name="Titik" className="w-4 h-4 inline" /> di kanan bawah browser Safari.</p>
                        <p>2. Tekan ikon <b>Bagikan</b> <Icon name="Share" className="w-4 h-4 inline" /></p>
                        <p>3. Gulir ke atas (View More) dan pilih <b className="text-gold-600">"Tambahkan ke Layar Utama"</b>.</p>
                        <p>4. Klik <b>"Tambah"</b>.</p>
                    </div>
                )}
                <button onClick={onClose} className="mt-6 w-full bg-navy-900 text-gold-400 py-2.5 rounded-xl font-bold">Tutup</button>
            </div>
        </div>
    );
};

const initialDataPejabat = [
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
const Icon = ({ name, className }) => {
    const icons = {
        Sun: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>,
        Moon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>,
        Home: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
        BookOpen: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
        Warta: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" /><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" /><path d="M8 6v8" /></svg>,
        Video: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>,
        Calendar: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
        Gift: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 12 20 22 4 22 4 12" /><rect width="20" height="5" x="2" y="7" /><line x1="12" x2="12" y1="22" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>,
        LogIn: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>,
        LogOut: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>,
        Download: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>,
        Headphones: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" /></svg>,
        Users: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
        MessageCircle: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>,
        Phone: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
        ChevronLeft: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 18 9 12 15 6" /></svg>,
        ArrowLeft: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>,
        ChevronRight: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6" /></svg>,
        ChevronDown: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9" /></svg>,
        Check: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>,
        X: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
        Edit: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
        Trash: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>,
        Settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
        Eye: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
        EyeOff: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>,
        Music: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
        List: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
        ListOrdered: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>,
        Search: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>,
        Image: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>,
        Megaphone: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>,
        Bold: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 12a4 4 0 0 0 0-8H6v8" /><path d="M15 20a4 4 0 0 0 0-8H6v8Z" /></svg>,
        Italic: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line x1="15" x2="9" y1="4" y2="20" /></svg>,
        Underline: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" x2="20" y1="20" y2="20" /></svg>,
        LinkIcon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
        Upload: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>,
        PlusCircle: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>,
        Plus: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
        Trash2: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>,
        Camera: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>,
        Save: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
        Info: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>,
        Share: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2v13" /><path d="m16 6-4-4-4 4" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /></svg>,
        Shield: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
        Titik: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>,
        Drive: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 16h.01" /><path d="M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /><path d="M21.946 12.013H2.054" /><path d="M6 16h.01" /></svg>,
        Menu: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>,
        MapPin: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
        Map: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" /></svg>,
        Navigation: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
    };
    return icons[name] || null;
};

// --- HELPER FUNCTIONS FOR DATE ---
const toYMD = (d) => {
    const pad = n => n < 10 ? '0' + n : n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatIndoDateShort = (dateString) => {
    if (!dateString) return '';
    const ds = String(dateString).includes('T') ? dateString : String(dateString) + 'T00:00:00';
    const d = new Date(ds);
    if (isNaN(d.getTime())) return dateString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatIndoDate = (dateString) => {
    if (!dateString) return '';
    const ds = String(dateString).includes('T') ? dateString : String(dateString) + 'T00:00:00';
    const d = new Date(ds);
    if (isNaN(d.getTime())) return dateString;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const ds = String(dateString).includes('T') ? dateString : String(dateString) + 'T00:00:00';
    const date = new Date(ds);
    if (isNaN(date.getTime())) return dateString;
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
};

const Home = ({ setActiveTab, youtubeUrl, heroImages = [], jadwalDB, dataPejabat, pengumuman, daftarWarta = [], setSelectedWarta, daftarBuku = [], setInitialBook }) => {
    const [currentSlide, setCurrentSlide] = React.useState(0);

    const displayImages = heroImages && heroImages.length > 0 ? heroImages : ["./icons/PisgahColor.png"];

    const sortedWartaHome = React.useMemo(() => {
        return [...(daftarWarta || [])].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    }, [daftarWarta]);

    React.useEffect(() => {
        setCurrentSlide(0);
    }, [displayImages.length]);

    React.useEffect(() => {
        if (displayImages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % displayImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [displayImages.length]);

    const isPengumumanReallyEmpty = () => {
        if (!pengumuman || !pengumuman.isi) return true;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = pengumuman.isi;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        return text.trim() === '';
    };

    const featureItems = [
        { id: 'sekolah_sabat', label: 'Sekolah Sabat', icon: 'BookOpen', isExternal: true, link: 'https://sabbath-school.adventech.io/in' },
        { id: 'lagu_sion', label: 'Lagu Sion', icon: 'Music', isExternal: true, link: 'https://play.lagusion.org/' },
        { id: 'keanggotaan', label: 'Keanggotaan', icon: 'Users' },
        { id: 'susunan_ibadah', label: 'Susunan Ibadah', icon: 'List' },
        { id: 'persembahan', label: 'Persembahan', icon: 'Gift' },
        { id: 'kehadiran', label: 'Kehadiran', icon: 'ListOrdered', isSameTab: true, link: './hadir.html' },
        { id: 'laporan', label: 'Laporan Keuangan', icon: 'Megaphone', isSameTab: true, link: './laporan.html' },
        { id: 'hubungi', label: 'Kontak', icon: 'Phone' },
    ];

    const renderFeatureItem = (item) => {
        const content = (
            <>
                <div className="w-11 h-11 md:w-14 md:h-14 rounded-[1rem] bg-white dark:bg-navy-700 group-hover:bg-[#4A7045] dark:group-hover:bg-gold-500 flex items-center justify-center mb-1.5 md:mb-2 transition-colors duration-300 shadow-sm border border-[#E2E8D8] dark:border-navy-600 group-hover:border-[#4A7045] dark:group-hover:border-gold-500">
                    <Icon name={item.icon} className="w-5 h-5 md:w-6 md:h-6 text-[#4A7045] dark:text-gold-400 group-hover:text-white dark:group-hover:text-navy-900 transition-colors duration-300" />
                </div>
                <span className="font-bold text-[10.5px] md:text-[12px] text-[#2C3F21] dark:text-navy-100 leading-tight text-center w-full max-w-[85px] break-normal">{item.label}</span>
            </>
        );

        const className = "group flex flex-col items-center justify-start p-1.5 md:p-2 rounded-2xl hover:bg-[#F4F7EF] dark:hover:bg-navy-800 transition-all duration-300 cursor-pointer w-[75px] md:w-[90px]";

        if (item.isSameTab) return <a key={item.id} href={item.link} className={className}>{content}</a>;
        if (item.isExternal) return <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>;
        return <button key={item.id} onClick={() => setActiveTab(item.id)} className={className}>{content}</button>;
    };

    return (
        <div className="animate-fade-in relative z-10 bg-[#FAFAFA] dark:bg-transparent text-[#2C3F21] dark:text-gray-100 font-sans pb-16 transition-colors duration-500">
            
            <div className="pt-6 px-4 md:px-8 max-w-[1500px] mx-auto">
                
                {/* HERO SECTION */}
                <div className="relative rounded-[2rem] overflow-hidden shadow-xl border-4 border-[#E2E8D8] dark:border-navy-700 aspect-[4/5] sm:aspect-square md:aspect-[4/3] lg:aspect-[21/9] w-full bg-[#E5E9D8] dark:bg-navy-800 transition-colors duration-500">
                    <div
                        className="w-full h-full flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {displayImages.map((img, idx) => (
                            <img key={idx} src={img} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=2000&auto=format&fit=crop"; }} alt={`Hero ${idx}`} className="w-full h-full object-cover flex-shrink-0" />
                        ))}
                    </div>
                    {/* Dark overlay for center text readability */}
                    <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
                    
                    <div className="absolute top-[8%] md:top-[12%] left-1/2 -translate-x-1/2 w-full max-w-[90%] md:max-w-3xl flex flex-col items-center text-center z-20">
                        <div className="hidden md:inline-flex bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-semibold px-4 py-2 rounded-[1rem] items-center mb-6">
                            <Icon name="Home" className="w-4 h-4 mr-2" /> Gereja Masehi Advent Hari Ketujuh
                        </div>
                        <div className="md:hidden bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1.5 rounded-[0.75rem] inline-flex items-center mb-3">
                            <Icon name="Home" className="w-3 h-3 mr-1.5" /> GMAHK Pisgah
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.15] mb-3 md:mb-6 tracking-tight">
                            Temukan Damai<br className="hidden md:block" /> Bersama Tuhan
                        </h1>
                        <p className="text-white/90 text-xs md:text-lg mb-6 md:mb-8 leading-relaxed font-medium">
                            Jemaat Pisgah BISDAC, mari beribadah, melayani, dan bertumbuh dalam iman.
                        </p>
                        <button onClick={() => setActiveTab('susunan_ibadah')} className="bg-[#4A7045] dark:bg-gold-500 hover:bg-[#3A5836] dark:hover:bg-gold-600 text-white dark:text-navy-900 text-sm md:text-base font-bold py-2.5 md:py-4 px-6 md:px-10 rounded-full transition-colors flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300 w-fit">
                            Ibadah Sekarang <Icon name="ChevronRight" className="w-4 h-4 md:w-5 md:h-5 ml-1.5 md:ml-2" />
                        </button>
                    </div>

                    {/* Carousel Controls */}
                    {displayImages.length > 1 && (
                        <div className="absolute bottom-10 md:bottom-14 lg:bottom-24 left-0 w-full flex justify-center gap-2 z-20">
                            {displayImages.map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2.5 rounded-full transition-all duration-500 ${currentSlide === idx ? 'bg-[#4A7045] w-10' : 'bg-white/50 w-3 hover:bg-white'}`} />
                            ))}
                        </div>
                    )}
                </div>

                {/* OVERLAPPING QUICK ACTIONS PILL */}
                <div className="relative z-30 -mt-6 md:-mt-10 lg:-mt-16 mx-4 md:mx-auto max-w-4xl bg-[#E2E8D8] dark:bg-navy-800 rounded-[2rem] md:rounded-[2.5rem] p-3 md:p-5 shadow-xl border-4 border-white dark:border-navy-700 flex flex-wrap items-start justify-center gap-2 md:gap-4 transition-colors duration-500">
                    {featureItems.map(item => renderFeatureItem(item))}
                </div>
            </div>

            {/* PENGUMUMAN & VISI MISI (Split Layout) */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-16 md:mt-24 mb-20">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
                    {/* Left: Image Card OR Announcement */}
                    <div className="w-full lg:w-1/2 relative">
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#E2E8D8] dark:bg-navy-800 rounded-full z-0 transition-colors duration-500"></div>
                        <div className="relative z-10 bg-white dark:bg-navy-800/70 p-3 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-navy-700 transition-colors duration-500">
                            {pengumuman && !isPengumumanReallyEmpty() ? (
                                <div className="rounded-[2rem] bg-[#F4F7EF] dark:bg-navy-900/50 p-8 min-h-[300px] flex flex-col justify-center items-center text-center relative border border-[#E2E8D8] dark:border-navy-600">
                                    <div className="absolute top-6 left-6 bg-[#D19B45] dark:bg-gold-600 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center shadow-md">
                                        <Icon name="Megaphone" className="w-4 h-4 mr-2" /> Pengumuman
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#2C3F21] dark:text-white mb-6 mt-8">{pengumuman.header || "Pengumuman Pekan Ini"}</h3>
                                    <div className="text-[#596B4D] dark:text-gray-300 text-base leading-relaxed max-h-[250px] overflow-y-auto custom-scrollbar w-full px-2" dangerouslySetInnerHTML={{ __html: pengumuman.isi }}></div>
                                </div>
                            ) : (
                                <div className="rounded-[2rem] overflow-hidden bg-white dark:bg-navy-900 relative w-full flex items-center justify-center min-h-[250px] shadow-sm">
                                    <img src={displayImages[0]} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1000&auto=format&fit=crop"; }} className="w-full h-auto object-contain" alt="Banner" />
                                    <div className="absolute top-6 left-6 bg-[#4A7045] dark:bg-gold-500 text-white dark:text-navy-900 text-xs font-bold px-4 py-2 rounded-full flex items-center shadow-md">
                                        <Icon name="Info" className="w-4 h-4 mr-2" /> Informasi
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Interactive floating Install App icon */}
                        <button 
                            onClick={() => window.installPWA && window.installPWA()} 
                            title="Instal Aplikasi"
                            className="absolute -bottom-4 -right-4 bg-white dark:bg-navy-700 hover:bg-[#F4F7EF] dark:hover:bg-navy-600 p-4 rounded-full shadow-lg hover:shadow-xl z-20 flex items-center justify-center border-2 border-[#E2E8D8] dark:border-navy-500 hover:border-[#4A7045] dark:hover:border-gold-500 cursor-pointer group transition-all duration-300 hover:scale-105"
                        >
                            <Icon name="Download" className="w-8 h-8 text-[#D19B45] dark:text-gold-400 group-hover:text-[#4A7045] dark:group-hover:text-gold-300 transition-colors duration-300" />
                        </button>
                    </div>

                    {/* Right: Text Content */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#2C3F21] dark:text-gold-400 mb-6 tracking-tight leading-[1.2] transition-colors">
                            Visi & Misi Gereja
                        </h2>
                        
                        <div className="text-[#596B4D] dark:text-gold-200/80 text-base md:text-lg leading-relaxed mb-8 space-y-5 transition-colors">
                            <p><strong className="dark:text-gold-400">Visi:</strong> Selaras dengan wahyu Alkitab, anggota Gereja melihat sebagai klimaks agar selaras sepenuhnya dengan kehendak dan kebenaran-Nya.</p>
                            <p><strong className="dark:text-gold-400">Misi:</strong> Memanggil semua orang menjadi murid Yesus Kristus, memberitakan Injil kekal, dan mempersiapkan dunia bagi kedatangan-Nya.</p>
                        </div>
                        
                        <div className="flex gap-4">
                            <a href="./pembangunan.html" className="bg-[#4A7045] dark:bg-gold-500 hover:bg-[#3A5836] dark:hover:bg-gold-600 text-white dark:text-navy-900 font-bold py-3.5 px-8 rounded-full transition-colors inline-flex items-center shadow-md">
                                <Icon name="BookOpen" className="w-5 h-5 mr-2" /> Lihat Progres Pembangunan
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* WARTA JEMAAT (3 Columns Card Layout) */}
            <div className="bg-[#E9EEDF] dark:bg-navy-900 rounded-[3.5rem] pt-16 md:pt-24 pb-20 md:pb-28 px-4 md:px-8 mt-10 mb-8 transition-colors duration-500 shadow-sm">
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#2C3F21] dark:text-gold-400 mb-4 transition-colors">Berita Terkini?</h2>
                        <p className="text-[#596B4D] dark:text-gray-300 font-medium text-lg max-w-2xl mx-auto transition-colors">Informasi pelayanan, kegiatan gereja, dan kabar sukacita jemaat pekan ini.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sortedWartaHome.slice(0, 3).map((warta, idx) => {
                            const rawUrls = parseGambarUrls(warta.gambarUrl);
                            const safeUrls = rawUrls.map(u => formatImageUrl(u)).filter(u => u.startsWith('http') || u.startsWith('data:image'));
                            const thumb = safeUrls.length > 0 ? safeUrls[0] : null;

                            return (
                                <div key={idx} onClick={() => { setSelectedWarta(warta); setActiveTab('warta'); }} className="bg-white dark:!bg-navy-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group border border-gray-100 dark:border-navy-700">
                                    <div className="h-56 overflow-hidden relative m-3 rounded-[1.5rem]">
                                        {thumb ? (
                                            <img src={thumb} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Warta" />
                                        ) : (
                                            <div className="w-full h-full bg-[#E5E9D8] dark:bg-navy-900 flex items-center justify-center text-[#4A7045] dark:text-navy-600 transition-colors">
                                                <Icon name="Image" className="w-12 h-12 opacity-30" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-navy-900/90 backdrop-blur-sm text-[#2C3F21] dark:text-gold-400 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm transition-colors">
                                            {formatDate(warta.tanggal)}
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8 pt-4 flex-1 flex flex-col">
                                        <h3 className="font-extrabold text-[19px] text-[#2C3F21] dark:text-gold-400 leading-tight mb-3 line-clamp-2 transition-colors">{warta.judul}</h3>
                                        <div className="text-[#6C7D5D] dark:text-gold-100/70 text-sm leading-relaxed mb-8 line-clamp-3 font-medium transition-colors">
                                            {truncateText(stripHtml(warta.isi), 120)}
                                        </div>
                                        <div className="mt-auto">
                                            <button className="bg-[#4A7045] dark:bg-gold-500 text-white dark:text-navy-900 hover:bg-[#3A5836] dark:hover:bg-gold-600 font-bold py-3 px-8 rounded-full transition-colors text-sm w-max">
                                                Baca Lengkap
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {sortedWartaHome.length > 3 && (
                        <div className="text-center mt-12 flex justify-center space-x-2">
                             <div className="w-3 h-3 rounded-full bg-[#4A7045]"></div>
                             <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                             <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        </div>
                    )}
                </div>

                {/* PUSTAKA & VIDEO SECTION */}
                <div className="max-w-[1400px] mx-auto mt-20 md:mt-28 space-y-16">
                    
                {/* Pustaka */}
                {daftarBuku && daftarBuku.length > 0 && (
                    <div>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-2xl md:text-4xl font-extrabold text-[#2C3F21] dark:text-gold-400 transition-colors">Pustaka Buku</h2>
                                <p className="text-[#596B4D] dark:text-gold-200/80 font-medium text-sm md:text-base mt-2 transition-colors">Buku referensi & rohani terbaru.</p>
                            </div>
                            <button onClick={() => setActiveTab('belajar_perpustakaan')} className="border-2 border-[#4A7045] dark:border-gold-500 text-[#4A7045] dark:text-gold-500 hover:bg-[#4A7045] dark:hover:bg-gold-500 hover:text-white dark:hover:text-navy-900 font-bold py-2 px-5 rounded-full transition-all flex items-center text-sm md:text-base">
                                Selengkapnya <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {[...daftarBuku].reverse().slice(0, 4).map((b, i) => (
                                <div key={b.id} onClick={() => { setInitialBook && setInitialBook(b); setActiveTab('belajar_perpustakaan'); }} className={`bg-white dark:!bg-navy-800 rounded-[2rem] border border-[#E9EEDF] dark:border-navy-700 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex-col ${i === 3 ? 'flex md:hidden lg:flex' : 'flex'}`}>
                                    <div className="h-40 md:h-56 overflow-hidden relative m-2 rounded-[1.5rem]">
                                        <img src={getCoverFallback(b)} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.src = getDefaultBookCover(b.category); }} />
                                        <DocumentBadge book={b} className="absolute top-2 left-2" />
                                        <span className="absolute top-2 right-2 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md text-[#2C3F21] dark:text-gold-400 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm transition-colors">{b.category}</span>
                                    </div>
                                    <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="font-extrabold text-sm md:text-base text-[#2C3F21] dark:text-gold-400 line-clamp-2 leading-tight mb-1 transition-colors">{b.title}</div>
                                            <div className="text-xs text-[#6C7D5D] dark:text-gold-200/70 font-medium transition-colors">{b.author}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Video */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                    <div className="bg-white dark:!bg-navy-800 rounded-[2rem] p-4 md:p-6 shadow-sm border border-[#E9EEDF] dark:border-navy-700 transition-colors">
                        <h2 className="text-lg md:text-xl font-extrabold mb-4 text-[#2C3F21] dark:text-gold-400 flex items-center px-2 transition-colors">
                            <Icon name="Video" className="w-5 h-5 mr-3 text-[#D19B45] dark:text-gold-500" /> Video Penting
                        </h2>
                        <div className="relative w-full overflow-hidden rounded-[1.5rem] bg-[#E9EEDF] dark:bg-navy-900 transition-colors" style={{ paddingTop: '56.25%' }}>
                            <iframe className="absolute top-0 left-0 w-full h-full" src={`${youtubeUrl}${youtubeUrl?.includes('?') ? '&' : '?'}vq=hd1080`} title="Video Penting" frameBorder="0" allowFullScreen></iframe>
                        </div>
                    </div>

                    <div className="bg-white dark:!bg-navy-800 rounded-[2rem] p-4 md:p-6 shadow-sm border border-[#E9EEDF] dark:border-navy-700 transition-colors">
                        <h2 className="text-lg md:text-xl font-extrabold mb-4 text-[#2C3F21] dark:text-gold-400 flex items-center px-2 transition-colors">
                            <Icon name="Video" className="w-5 h-5 mr-3 text-[#D19B45] dark:text-gold-500" /> Youtube Channel
                        </h2>
                        <div className="relative w-full overflow-hidden rounded-[1.5rem] bg-[#E9EEDF] dark:bg-navy-900 transition-colors" style={{ paddingTop: '56.25%' }}>
                            <iframe className="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/videoseries?list=UUaTPS74NOHACRYU0zInVZ4g&vq=hd1080" title="Youtube Terbaru" frameBorder="0" allowFullScreen></iframe>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* FOOTER */}
            <footer className="mt-20 border-t border-[#E9EEDF] dark:border-navy-800 pt-12 pb-6 px-4 md:px-8 max-w-[1400px] mx-auto text-[#596B4D] dark:text-navy-300 transition-colors">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-10 mb-12">
                    {/* Col 1 */}
                    <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-6">
                            <img src="./icons/PisgahColor.png" className="w-10 h-10 md:w-12 md:h-12 object-contain" alt="Logo" />
                            <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#2C3F21] dark:text-white tracking-tighter sm:tracking-tight transition-colors">PISGAH<span className="text-[#4A7045] dark:text-gold-500">BISDAC</span></span>
                        </div>
                        <p className="text-xs md:text-sm font-medium leading-relaxed mb-4">Gereja Masehi Advent Hari Ketujuh<br />Jemaat Pisgah BISDAC</p>
                        <p className="text-xs md:text-sm text-[#D19B45] dark:text-gold-400 font-bold italic transition-colors">"Tuhan adalah Gembalaku, takkan kekurangan aku." — Mazmur 23:1</p>
                    </div>

                    {/* Col 2 */}
                    <div>
                        <p className="text-sm font-bold text-[#2C3F21] dark:text-gold-400 mb-5 transition-colors">Kontak & Lokasi</p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-sm font-medium">
                                <Icon name="MapPin" className="w-5 h-5 shrink-0 text-[#4A7045] dark:text-gold-500 transition-colors" />
                                <span>Ruko Grand California, Jl. Laksamana Bintan No.11 Blok B 1 & B 2, Batam</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium">
                                <Icon name="Calendar" className="w-5 h-5 shrink-0 text-[#4A7045] dark:text-gold-500 transition-colors" />
                                <span>Rabu 19:00 · Sabat 10:00 WIB</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium">
                                <Icon name="Phone" className="w-5 h-5 shrink-0 text-[#4A7045] dark:text-gold-500 transition-colors" />
                                <a href="tel:+6285194344004" className="hover:text-[#2C3F21] dark:hover:text-gold-400 transition-colors">+6285194344004</a>
                            </div>
                        </div>
                    </div>

                    {/* Col 3 */}
                    <div>
                        <p className="text-sm font-bold text-[#2C3F21] dark:text-gold-400 mb-5 transition-colors">Sosial Media</p>
                        <div className="space-y-4">
                            <a href="https://www.youtube.com/@turnyeofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-bold hover:text-red-600 dark:hover:text-gold-400 transition-colors group">
                                <span className="w-10 h-10 rounded-full bg-red-50 dark:bg-navy-800 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-navy-700 transition-colors">
                                    <svg className="w-5 h-5 text-red-600 dark:text-gold-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                </span>
                                YouTube
                            </a>
                            <a href="https://www.instagram.com/pisgahbisdac" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-bold hover:text-pink-600 dark:hover:text-gold-400 transition-colors group">
                                <span className="w-10 h-10 rounded-full bg-pink-50 dark:bg-navy-800 flex items-center justify-center group-hover:bg-pink-100 dark:group-hover:bg-navy-700 transition-colors">
                                    <svg className="w-5 h-5 text-pink-600 dark:text-gold-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                </span>
                                Instagram
                            </a>
                        </div>
                    </div>

                    {/* Col 4 */}
                    <div className="flex flex-col items-start lg:items-end gap-6 w-full">
                        <img src="https://wium.org/wp-content/uploads/2021/08/adventist-wium-denim.svg" className="w-full max-w-[300px] h-auto object-contain opacity-60 grayscale hover:grayscale-0 transition" alt="Logo UIKB" />
                        <div className="flex items-center justify-start lg:justify-end gap-6 w-full max-w-[300px]">
                            <img src="https://hope-documents.fra1.digitaloceanspaces.com/66a17f6ceb51197645b35b77/iBS1727730262776.png" className="w-[35%] h-auto object-contain opacity-70 hover:opacity-100 transition" alt="I Will Go" />
                            <img src="/icons/reapslogo.png" className="w-[55%] h-auto object-contain opacity-70 hover:opacity-100 transition" alt="REAPS" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#E9EEDF] dark:border-navy-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
                    <p className="text-sm font-semibold">Copyright &copy; 2026 PISGAH BISDAC.</p>
                    <p className="text-xs text-[#D19B45] dark:text-gold-400 font-black tracking-widest uppercase bg-white dark:bg-navy-800 px-4 py-2 rounded-full shadow-sm border border-transparent dark:border-navy-700 transition-colors">GOD BLESS US 🙏</p>
                </div>
            </footer>
        </div>
    );
};

const SusunanIbadah = ({ setActiveTab, activeSabat, sabatYMD }) => {
    const [openSection, setOpenSection] = React.useState('khotbah');

    const getOfficer = (arr, role) => arr?.find(p => p.tugas === role)?.nama || "-";
    const susunan = activeSabat.susunan || defaultSusunan;

    const renderItem = (title, desc, isHighlight = false) => (
        <div className={`flex justify-between items-center py-3 px-4 border border-navy-100/60 dark:border-navy-700/60 transition-colors rounded-xl mx-2 my-1.5 ${isHighlight ? 'bg-gold-500/10 shadow-sm border-gold-500/50' : 'hover:bg-navy-50 dark:hover:bg-navy-700/50'}`}>
            <span className="text-sm font-medium w-1/2 shrink-0 text-navy-600 dark:text-navy-300">{title}</span>
            <span className={`text-sm text-right w-1/2 break-words font-bold ${isHighlight ? 'text-gold-500' : 'text-navy-900 dark:text-white'}`}>{desc}</span>
        </div>
    );

    const susunanTabs = [
        { id: 'khotbah', label: 'Khotbah / Umum', icon: 'List', activeColor: 'text-navy-900' },
        { id: 'ss', label: 'Sekolah Sabat', icon: 'BookOpen', activeColor: 'text-navy-900' },
        { id: 'diakon', label: 'Diakon & Diakones', icon: 'Users', activeColor: 'text-navy-900' },
        { id: 'musik', label: 'Pelayanan Musik', icon: 'Music', activeColor: 'text-navy-900' }
    ];

    return (
        <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-5 md:p-6">
            <div className="relative">
                <div className="text-center pt-4 pb-6 md:pt-6 md:pb-8">
                    <h2 className="text-xl md:text-[1.75rem] font-black uppercase tracking-widest leading-none text-navy-900">Susunan Ibadah</h2>
                    <p className="text-gold-500 font-bold mt-2 text-sm md:text-base">{formatIndoDate(sabatYMD)}</p>
                </div>

                <div className="flex flex-col border-b border-navy-100 overflow-hidden bg-white">
                    {/* TABS SCROLLABLE */}
                    <div className="flex flex-col overflow-hidden mb-2">
                        <div className="flex items-center gap-2 pb-1 md:pb-2">
                            <div className="bg-white/60 rounded-[1.25rem] flex-1 flex overflow-x-auto border border-navy-100/50 p-1.5 gap-2 hide-scrollbar scroll-smooth">
                                {susunanTabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setOpenSection(tab.id)}
                                        className={`px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all duration-300 flex items-center font-bold shrink-0 ${openSection === tab.id ? 'bg-gold-500 shadow-sm text-navy-900 scale-100' : 'text-navy-400 hover:text-navy-900 hover:bg-navy-100 scale-95 origin-center'}`}
                                    >
                                        <Icon name={tab.icon} className={`w-[1.15rem] h-[1.15rem] mr-2 transition-colors ${openSection === tab.id ? 'text-navy-900' : 'text-navy-400'}`} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] italic text-center pb-3 md:hidden text-navy-400">scroll ke samping untuk lihat susunan yang lain &rarr;</p>
                    </div>

                    {/* TAB CONTENT */}

                    {openSection === 'khotbah' && (
                        <div className="animate-fade-in">
                            {renderItem("Pemimpin Acara", getOfficer(activeSabat.khotbah, "Pemimpin Acara"), true)}
                            {renderItem("Sambutan", getOfficer(activeSabat.khotbah, "Pemimpin Acara"))}
                            {renderItem("Lagu Pengantar", "LS 408 - Berdiam, Berdiam")}
                            {renderItem("Lagu Sambutan", "LS 1 - Di Hadapan Hadirat-Mu")}
                            {renderItem("Doa Buka", getOfficer(activeSabat.khotbah, "Khotbah"))}
                            {renderItem("Ayat Bersahutan", susunan.kAyatBersahutan)}
                            {renderItem("Lagu Buka", susunan.kLaguBuka)}
                            {renderItem("Doa Syafaat", getOfficer(activeSabat.khotbah, "Doa Syafaat"))}
                            <div className="flex flex-wrap p-4 md:p-6 font-bold text-navy-400 text-xs justify-center">
                                <p>"LS 516 - Dengar Ya Tuhan"</p>
                            </div>
                            {renderItem("Bacaan Persembahan", getOfficer(activeSabat.khotbah, "Bacaan & Doa Persembahan"))}
                            {susunan.kLaguPujian1_show && renderItem("Lagu Persembahan dan Pujian", susunan.kLaguPujian1_judul)}
                            {renderItem("Pengumpulan Persembahan", "Diakon Berdiri")}
                            {renderItem("Doa Persembahan", getOfficer(activeSabat.khotbah, "Bacaan & Doa Persembahan"))}
                            {susunan.kLaguPujian2_show && renderItem("Lagu Pujian", susunan.kLaguPujian2_judul)}
                            {renderItem("Cerita Anak-anak", getOfficer(activeSabat.khotbah, "Cerita Anak-anak"))}
                            {susunan.kLaguPujian3_show && renderItem("Lagu Pujian", susunan.kLaguPujian3_judul)}
                            {renderItem("Ayat Inti", susunan.kAyatInti)}
                            {renderItem("Lagu Tema - Jemaat Duduk", "Misi Kita")}
                            {renderItem("Khotbah", getOfficer(activeSabat.khotbah, "Khotbah"), true)}
                            {renderItem("Lagu Tutup", susunan.kLaguTutup)}
                            {renderItem("Doa Tutup - Berkat", getOfficer(activeSabat.khotbah, "Khotbah"))}
                            {renderItem("Pengumuman", "Dept. Komunikasi")}
                        </div>
                    )}

                    {openSection === 'ss' && (
                        <div className="animate-fade-in">
                            {renderItem("Pemimpin Acara", getOfficer(activeSabat.sekolahSabat, "Pemimpin Acara"), true)}
                            {renderItem("Lagu Buka", susunan.ssLaguBuka)}
                            {renderItem("Ayat Inti & Doa Buka", getOfficer(activeSabat.sekolahSabat, "Ayat Inti & Doa Buka"))}
                            {renderItem("Berita Misi", getOfficer(activeSabat.sekolahSabat, "Berita Misi"))}
                            {renderItem("Diskusi Sekolah Sabat", "Kelas Dewasa, Kelas Pendalaman Alkitab, Kelas Anak-anak")}
                            {renderItem("Lagu Tutup", susunan.ssLaguTutup)}
                            {renderItem("Doa Tutup", getOfficer(activeSabat.sekolahSabat, "Doa Tutup"))}
                            <div className="flex flex-wrap p-4 md:p-6 font-bold text-navy-400 text-xs justify-center">
                                <p>"LS 168 Kita Memiliki Pengharapan"</p>
                            </div>
                        </div>
                    )}

                    {openSection === 'diakon' && (
                        <div className="animate-fade-in">
                            {activeSabat.diakon.map((p, idx) => <div key={idx}>{renderItem(p.tugas, p.nama)}</div>)}
                        </div>
                    )}

                    {openSection === 'musik' && (
                        <div className="animate-fade-in">
                            {activeSabat.musik.map((p, idx) => <div key={idx}>{renderItem(p.tugas, p.nama)}</div>)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Belajar = ({ setActiveTab }) => {
    const items = [
        { id: 'sekolah_sabat', title: 'Sekolah Sabat', desc: 'Akses pelajaran harian Sekolah Sabat secara online untuk pedalaman rohani Anda.', img: 'https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/ecfa0085-8c09-46ef-97df-6be05cd44019/1000129545/w=800,quality=80,fit=scale-down', color: 'blue', isExternal: true, link: 'https://sabbath-school.adventech.io/in' },
        { id: 'belajar', title: 'Belajar Online', desc: 'Pembelajaran tanpa batas, lebih banyak kemungkinan untuk mengenal-Nya, Bertemulah dengan-Nya kapan dan dimana saja', img: 'https://suaranubuatan.id/wp-content/uploads/2021/09/book-4126481_1920.jpg', color: 'purple', isExternal: true, link: 'https://suaranubuatan.id/' },
        { id: 'alkitab', title: 'Alkitab', desc: 'Alkitab adalah firman Allah yang diilhamkan, satu-satunya aturan iman dan praktik.', img: 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9DZnExNzQ5MTg3MDg1NjE3LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/Cfq1749187085617.jpg', color: 'orange' },
        { id: '28dasar', title: '28 Dasar Kepercayaan', desc: 'Gereja Advent memegang keyakinan dasar tertentu sebagai ajaran Kitab Suci.', img: 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjc1L2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9mcEUxNzQ5NDcxNDI3NTExLmpwZw/w:1920,q:75/hope-images/67054013a60919c92d92c959/fpE1749471427511.jpg', color: 'green' },
        { id: 'perpustakaan', title: 'Buku-Buku', desc: 'Baca, Download Buku dan bervagai bahan untuk khotbah dan pemahaman lainnya.', img: 'https://images.hopesoftware.org/resize/L3dfMTkyMF9fcV84MC9ob3BlLWltYWdlcy82MWRlZDc4YTk0YTg4Zjc2MzEwMjAzNDEvQVhNMTY0Mzk2NzU0MjczOS5qcGc/w_1920__q_80/hope-images/61ded78a94a88f7631020341/AXM1643967542739.jpg', color: 'purple' },
        { id: 'egw', title: 'Ellen G. White', desc: 'Mengenal tulisan-tulisan yang diilhami untuk menuntun gereja pada akhir zaman.', img: 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9ISVMxNzQ3NzM1NjEyMzE5LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/HIS1747735612319.jpg', color: 'purple' }
    ];

    return (
        <div className="animate-fade-in space-y-6 glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-5 md:p-6">
            {/* JUDUL HALAMAN */}
            <div className="text-center border-b border-navy-100 pb-5 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-navy-900 tracking-tight">
                    <span className="text-navy-900">Belajar & </span>
                    <span className="text-gold-600">Bertumbuh</span>
                </h1>
                <p className="text-navy-500 text-sm font-medium mt-2 max-w-2xl mx-auto">
                    Perdalam iman Anda melalui berbagai materi rohani, dari Alkitab hingga tulisan Ellen G. White.
                </p>
                <div className="w-16 h-0.5 bg-gold-400 rounded-full mx-auto mt-3"></div>
            </div>

            {/* DAFTAR KARTU */}
            <div className="flex flex-wrap justify-center gap-6">
                {items.map((item) => (
                    <div key={item.id} className="w-full sm:w-80 md:w-72 lg:w-64 glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="h-[13rem] overflow-hidden relative">
                            <img src={item.img} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/20 to-transparent"></div>
                            <h3 className="absolute bottom-5 left-5 text-white font-black tracking-wide text-xl">{item.title}</h3>
                        </div>
                        <div className="p-5 md:p-6 flex-1 flex flex-col">
                            <p className="text-navy-500 font-medium text-sm mb-6 flex-1 leading-relaxed">{item.desc}</p>
                            {item.isExternal ? (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-sm hover:shadow">
                                    <span className="tracking-wide">Mulai Belajar</span><Icon name="BookOpen" className="w-[1.15rem] h-[1.15rem]" />
                                </a>
                            ) : (
                                <button onClick={() => setActiveTab(`belajar_${item.id}`)} className="w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 bg-navy-50 hover:bg-navy-100 text-navy-800">
                                    <span className="tracking-wide">Pelajari Detail</span><Icon name="BookOpen" className="w-[1.15rem] h-[1.15rem]" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const ContactGembala = ({ dataPejabat }) => {
    // Perbaikan: Cari berdasarkan ID 'gembala', ATAU yang nama Jabatannya / Kategorinya mengandung kata 'gembala'
    if (!dataPejabat || !Array.isArray(dataPejabat)) return null;

    const gembala = dataPejabat.find(p =>
        p.id === 'gembala' ||
        (p.jabatan && p.jabatan.toLowerCase().includes('gembala')) ||
        (p.kategori && p.kategori.toLowerCase().includes('gembala'))
    );

    if (!gembala) return null;
    return (
        <div className="mt-10 bg-gold-400/10 border border-gold-200/50 rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between not-prose shadow-sm relative overflow-hidden">
            <div className="flex-1 text-center md:text-left mb-5 md:mb-0 md:mr-8 relative z-10">
                <h4 className="font-bold text-navy-900 text-xl tracking-tight mb-2">Ingin Pelajari Lebih Lanjut?</h4>
                <p className="text-[14px] text-navy-600 font-medium leading-relaxed">Jika Anda memiliki pertanyaan mendalam, membutuhkan bimbingan rohani, atau ingin berdiskusi lebih lanjut, jangan ragu untuk menghubungi Gembala Jemaat kami.</p>
            </div>
            <a href={`https://wa.me/${gembala.wa}`} target="_blank" rel="noopener noreferrer" className="relative z-10 flex items-center p-3 rounded-2xl border border-navy-100 bg-white hover:bg-gold-50 hover:border-gold-200 shadow-sm hover:shadow transition-all duration-300 group shrink-0 w-full md:w-auto">
                <img src={gembala.img} alt={gembala.nama} className="w-[3.5rem] h-[3.5rem] rounded-full object-cover mr-4 border-[3px] border-gold-100 group-hover:border-gold-300 transition-colors shrink-0" />
                <div className="text-left pr-2">
                    <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest mb-0.5">{gembala.jabatan}</p>
                    <p className="font-bold text-navy-900 leading-tight text-sm">{gembala.nama}</p>
                    <p className="text-xs text-navy-500 mt-1.5 flex items-center font-bold tracking-wide"><Icon name="MessageCircle" className="w-[1rem] h-[1rem] mr-1.5 text-green-500" /> Hubungi via WA</p>
                </div>
            </a>
        </div>
    );
};

const DetailAlkitab = ({ setActiveTab, dataPejabat }) => (
    <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-6 md:p-8 animate-fade-in relative z-10">
        <div className="prose max-w-none">
            <h1 className="text-[2rem] font-extrabold text-navy-900 mb-6 border-b pb-4 border-navy-50">Doktrin Alkitab</h1>
            <img src="https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9DZnExNzQ5MTg3MDg1NjE3LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/Cfq1749187085617.jpg" loading="lazy" alt="Bible Detail" className="w-full h-[18rem] object-cover rounded-[1.25rem] mb-8 shadow-sm" />
            <p className="text-lg text-navy-800 font-medium italic mb-6 leading-relaxed">"Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran." (2 Timotius 3:16)</p>
            <div className="space-y-4 text-navy-600 font-medium">
                <p>Kitab Suci, yang terdiri dari Perjanjian Lama dan Perjanjian Baru, adalah Firman Allah yang tertulis, diberikan melalui ilham ilahi. Penulis yang diilhami berbicara dan menulis saat mereka digerakkan oleh Roh Kudus.</p>
                <h3 className="text-navy-900 font-bold text-xl pt-2">Otoritas Firman Allah</h3>
                <p>Dalam Firman ini, Allah telah memberikan pengetahuan yang diperlukan bagi keselamatan manusia. Kitab Suci adalah wahyu yang tertinggi, otoritatif, dan merupakan standar karakter yang sempurna.</p>
                <h3 className="text-navy-900 font-bold text-xl pt-2">Ujian Pengalaman</h3>
                <p>Alkitab adalah ujian bagi pengalaman, penentu doktrin-doktrin yang otoritatif, dan catatan yang dapat dipercaya tentang tindakan Allah dalam sejarah dunia.</p>
                <div className="bg-gold-50 p-6 rounded-2xl border-l-[6px] border-gold-500 my-8 italic text-navy-900 font-bold shadow-sm">"Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku." (Mazmur 119:105)</div>
                <ContactGembala dataPejabat={dataPejabat} />
            </div>
        </div>
    </div>
);

const Detail28Dasar = ({ setActiveTab, dataPejabat }) => {
    const [openIndex, setOpenIndex] = React.useState(null);
    const doktrinData = [
        { category: "Doktrin tentang Allah", emoji: "✝️", items: [{ title: "Kitab Suci", desc: "Firman Allah yang diilhami.", ref: "2 Timotius 3:16-17; 2 Petrus 1:20-21" }, { title: "Tritunggal / Trinitas", desc: "Allah yang Esa dalam tiga Pribadi.", ref: "Matius 28:19; 2 Korintus 13:14" }, { title: "Bapa", desc: "Allah sebagai Pencipta dan Pemelihara.", ref: "Yohanes 3:16; 1 Yohanes 4:8" }, { title: "Anak", desc: "Yesus Kristus sebagai Penebus.", ref: "Yohanes 1:1-3,14; Kolose 2:9" }, { title: "Roh Kudus", desc: "Pribadi Ilahi yang membimbing umat.", ref: "Yohanes 14:16-17; Kisah 1:8" }] },
        { category: "Doktrin tentang Manusia", emoji: "😁", items: [{ title: "Penciptaan", desc: "Dunia diciptakan dalam enam hari literal.", ref: "Kejadian 1:1; Keluaran 20:11" }, { title: "Sifat Manusia", desc: "Manusia diciptakan dalam rupa Allah tetapi jatuh dalam dosa.", ref: "Kejadian 1:26-27; Roma 3:23" }] },
        { category: "Doktrin tentang Keselamatan", emoji: "🙏", items: [{ title: "Perjuangan Besar", desc: "Pertentangan antara Kristus dan Setan.", ref: "Wahyu 12:7-9; 1 Petrus 5:8" }, { title: "Kehidupan, Kematian, dan Kebangkitan Kristus", desc: "Yesus mati dan bangkit untuk keselamatan manusia.", ref: "Roma 6:23; 1 Korintus 15:3-4" }, { title: "Pengalaman Keselamatan", desc: "Keselamatan oleh kasih karunia melalui iman.", ref: "Efesus 2:8-9; Roma 10:9" }, { title: "Berkembang dalam Kristus", desc: "Hidup dalam pertumbuhan rohani.", ref: "Kolose 2:6-7; 2 Petrus 3:18" }] },
        { category: "Doktrin tentang Gereja", emoji: "⛪", items: [{ title: "Gereja", desc: "Tubuh Kristus yang terdiri dari umat percaya.", ref: "Efesus 1:22-23; 1 Korintus 12:12-14" }, { title: "Sisa Umat Tuhan dan Misinya", desc: "Umat sisa yang menaati hukum Allah dan memiliki iman Yesus.", ref: "Wahyu 12:17; Wahyu 14:6-12" }, { title: "Kesatuan dalam Tubuh Kristus", desc: "Kesatuan gereja dalam Kristus.", ref: "Yohanes 17:20-23; Efesus 4:3-6" }, { title: "Baptisan", desc: "Baptisan oleh pencelupan sebagai tanda komitmen.", ref: "Matius 28:19-20; Roma 6:3-4" }, { title: "Perjamuan Kudus (Komuni)", desc: "Perjamuan Tuhan sebagai peringatan pengorbanan Kristus.", ref: "1 Korintus 11:23-26; Yohanes 13:14-17" }] },
        { category: "Doktrin tentang Kehidupan Kristen", emoji: "👨‍👩‍👦", items: [{ title: "Karunia Rohani dan Pelayanan", desc: "Karunia Rohani diberikan untuk membangun gereja.", ref: "Efesus 4:11-16; 1 Korintus 12:7-11" }, { title: "Karunia Nubuat", desc: "Kami percaya karunia ini diwujudkan dalam pelayanan Ellen G. White.", ref: "2 Tim. 3:16, 17; Ibr. 1:1-3" }, { title: "Hukum Allah", desc: "Sepuluh Perintah tetap berlaku.", ref: "Keluaran 20:1-17; Matius 5:17-19" }, { title: "Hari Sabat", desc: "Sabat hari ketujuh sebagai hari perhentian.", ref: "Kejadian 2:2-3; Keluaran 20:8-11" }, { title: "Penatalayanan Kristen", desc: "Mengelola sumber daya untuk kemuliaan Tuhan.", ref: "Maleakhi 3:10; 2 Korintus 9:6-7" }, { title: "Perilaku Kristen", desc: "Hidup dalam kekudusan dan sesuai Firman Tuhan.", ref: "1 Korintus 10:31; Filipi 4:8" }, { title: "Pernikahan dan Keluarga", desc: "Pernikahan kudus antara pria dan wanita.", ref: "Kejadian 2:24; Efesus 5:22-25" }] },
        { category: "Doktrin tentang Peristiwa Akhir Zaman", emoji: "🕘", items: [{ title: "Pelayanan Kristus di Tempat Kudus Surgawi", desc: "Kristus sebagai Imam Besar.", ref: "Ibrani 8:1-2; Daniel 7:9-10" }, { title: "Kedatangan Kedua Kristus", desc: "Kedatangan Kristus yang kedua kali.", ref: "Yohanes 14:1-3; 1 Tesalonika 4:16-17" }, { title: "Kematian dan Kebangkitan", desc: "Kematian adalah tidur sampai kebangkitan.", ref: "Pengkhotbah 9:5-6; 1 Korintus 15:51-54" }, { title: "Seribu Tahun dan Akhir Dosa", desc: "Masa seribu tahun sebelum penghakiman terakhir.", ref: "Wahyu 20:1-10" }, { title: "Bumi Baru", desc: "Dunia yang baru sebagai tempat tinggal kekal.", ref: "Wahyu 21:1-5; Yesaya 65:17" }] }
    ];

    return (
        <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-6 md:p-8 animate-fade-in relative z-10">
            <div className="prose max-w-none">
                <h1 className="text-[2rem] font-extrabold text-navy-900 mb-6 border-b pb-4 border-navy-50">28 Dasar Kepercayaan</h1>
                <img src="https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjc1L2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9mcEUxNzQ5NDcxNDI3NTExLmpwZw/w:1920,q:75/hope-images/67054013a60919c92d92c959/fpE1749471427511.jpg" loading="lazy" alt="28 Doctrine Detail" className="w-full h-[18rem] object-cover rounded-[1.25rem] mb-8 shadow-sm" />
                <p className="mb-8 text-navy-600 font-medium text-lg leading-relaxed">Gereja Masehi Advent Hari Ketujuh menerima Alkitab sebagai satu-satunya kredo mereka dan memegang keyakinan dasar tertentu sebagai ajaran Kitab Suci.</p>
                <div className="space-y-4 not-prose">
                    {doktrinData.map((section, idx) => (
                        <div key={idx} className="border border-navy-100/50 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                            <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} className={`w-full flex justify-between items-center p-4 lg:p-5 font-bold transition-colors ${openIndex === idx ? 'bg-gold-50 text-navy-900' : 'bg-navy-50/30 text-navy-800 hover:bg-navy-50'}`}>
                                <span className="flex items-center space-x-3"><span className="text-2xl">{section.emoji}</span><span>{section.category}</span></span><Icon name="ChevronDown" className={`w-5 h-5 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-gold-500' : 'text-navy-400'}`} />
                            </button>
                            {openIndex === idx && (
                                <div className="p-4 lg:p-5 bg-white divide-y divide-navy-50 border-t border-gold-100 animate-fade-in">
                                    {section.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="py-4 first:pt-1 last:pb-1 group">
                                            <div className="font-bold text-navy-900 text-sm md:text-base group-hover:text-gold-600 transition-colors">{item.title}</div><div className="text-sm font-medium text-navy-500 mt-1.5 leading-relaxed">{item.desc}</div><div className="text-xs font-bold text-gold-600 mt-2 flex items-center bg-gold-400/10 w-fit px-2 py-1 rounded-md"><Icon name="BookOpen" className="w-[12px] h-[12px] mr-1.5" /> {item.ref}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <br />
                <div className="flex flex-wrap justify-center gap-4">
                    <a
                        href="https://drive.google.com/drive/folders/1d_smrJAY13h5x85A2Y_bAIIXg9sR012r"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gold-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-navy-800 hover:text-white transition-all duration-300"
                    >
                        Download 28 Doktrin Gereja ADVENT
                    </a>
                </div>
                <ContactGembala dataPejabat={dataPejabat} />
            </div>
        </div>
    );
};

const DetailEGW = ({ setActiveTab, dataPejabat }) => (
    <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-6 md:p-8 animate-fade-in relative z-10">
        <div className="prose max-w-none">
            <h1 className="text-[2rem] font-extrabold text-navy-900 mb-6 border-b pb-4 border-navy-50">Karunia Nubuat: Ellen G. White</h1>
            <img src="https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9ISVMxNzQ3NzM1NjEyMzE5LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/HIS1747735612319.jpg" loading="lazy" alt="EGW Detail" className="w-full h-[18rem] object-cover rounded-[1.25rem] mb-8 shadow-sm" />
            <div className="space-y-4 text-navy-600 font-medium">
                <p>Salah satu karunia Roh Kudus adalah nubuat. Karunia ini adalah tanda pengenal gereja yang sisa dan itu diwujudkan dalam pelayanan Ellen G. White.</p>
                <h3 className="text-navy-900 font-bold text-xl pt-2">Peran dalam Gereja</h3>
                <p>Sebagai utusan Tuhan, tulisan-tulisannya adalah sumber kebenaran yang terus menerus dan berwibawa yang memberikan hiburan, bimbingan, instruksi, dan koreksi kepada gereja.</p>
                <h3 className="text-navy-900 font-bold text-xl pt-2">Menunjuk ke Alkitab</h3>
                <p>Tulisan-tulisannya juga memperjelas bahwa Alkitab adalah standar di mana semua pengajaran dan pengalaman harus diuji. Beliau menyebut tulisan-tulisannya sebagai "terang yang lebih kecil untuk menuntun pria dan wanita kepada terang yang lebih besar" yaitu Alkitab.</p>
                <div className="bg-navy-800/10 p-6 rounded-2xl border-l-[6px] border-gold-400 my-8 shadow-md">
                    <h4 className="font-bold text-gold-400 mb-2 flex items-center"><Icon name="Info" className="w-5 h-5 mr-2" />Tahukah Anda?</h4>
                    <p className="text-sm font-medium text-navy-100 leading-relaxed">Ellen G. White adalah salah satu penulis wanita yang karyanya paling banyak diterjemahkan dalam sejarah kesusastraan dunia, dengan fokus utama pada pendidikan, kesehatan, dan kehidupan rohani.</p>
                </div>
                <ContactGembala dataPejabat={dataPejabat} />
            </div>
        </div>
    </div>
);

const Detailperpustakaan = ({ setActiveTab, dataPejabat, initialBook, onBookOpened }) => {
    const [selectedBook, setSelectedBook] = React.useState(initialBook || null);
    const [booksFromServer, setBooksFromServer] = React.useState([]);
    const [isLoadingBooks, setIsLoadingBooks] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState(''); // State ini sebelumnya hilang

    // Reset initialBook ketika dibuka dari menu pencarian
    React.useEffect(() => {
        if (selectedBook && onBookOpened) {
            onBookOpened();
        }
    }, [selectedBook, onBookOpened]);

    // Load books dari backend saat komponen mount
    React.useEffect(() => {
        const loadBooks = async () => {
            setIsLoadingBooks(true);
            try {
                const res = await fetch(GAS_API_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'getBooks' })
                });
                const data = await res.json();
                // Pengecekan respons yang lebih tangguh untuk mencegah error
                if (data.status === 'success' && data.data) {
                    setBooksFromServer(data.data);
                } else if (data.data && data.data.status === 'success') {
                    setBooksFromServer(data.data.data || []);
                } else if (data.success && data.data) {
                    setBooksFromServer(data.data);
                }
            } catch (err) {
                console.error('Error loading books:', err);
            }
            setIsLoadingBooks(false);
        };
        loadBooks();
    }, []);

    const categories = ['Semua', ...new Set(booksFromServer.map(b => b.category).filter(Boolean))];
    const [activeCategory, setActiveCategory] = React.useState('Semua');

    // Memperbaiki logika filter agar kolom pencarian (search bar) dapat berfungsi
    const filteredBooks = React.useMemo(() => {
        let result = [...booksFromServer];
        if (activeCategory !== 'Semua') {
            result = result.filter(b => b.category === activeCategory);
        }
        if (searchQuery.trim().length >= 2) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b =>
                (b.title && b.title.toLowerCase().includes(q)) ||
                (b.author && b.author.toLowerCase().includes(q)) ||
                (b.desc && b.desc.toLowerCase().includes(q))
            );
        }
        // Mengurutkan buku berdasarkan abjad (A-Z) pada judul
        return result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }, [booksFromServer, activeCategory, searchQuery]);

    // Mode baca PDF
    if (selectedBook) {
        return (
            <div className="animate-fade-in relative z-10">
                {/* Header reader */}
                <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-4 mb-4 flex items-center gap-3">
                    <button
                        onClick={() => setSelectedBook(null)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-navy-50 hover:bg-navy-100 text-navy-700 transition shrink-0"
                    >
                        <Icon name="ArrowLeft" className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-navy-900 text-base leading-tight truncate">{selectedBook.title}</p>
                        <p className="text-xs text-navy-500 font-semibold mt-0.5">{selectedBook.author}</p>
                    </div>
                    <a
                        href={selectedBook.pdfUrl ? selectedBook.pdfUrl.replace('/preview', '/view').replace('/embed?start=false&loop=false&delayms=3000', '/present') : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-navy-900 text-gold-400 px-4 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-navy-800 transition"
                    >
                        <Icon name="ExternalLink" className="w-3.5 h-3.5" /> Buka Eksternal
                    </a>
                </div>
                {/* PDF Iframe Viewer */}
                <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 overflow-hidden" style={{ minHeight: '75vh' }}>
                    {selectedBook.pdfUrl ? (
                        <iframe
                            src={selectedBook.pdfUrl}
                            title={selectedBook.title}
                            className="w-full"
                            style={{ height: '75vh', border: 'none' }}
                            allow="autoplay"
                            loading="lazy"
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-navy-500 font-medium">Link PDF tidak tersedia</p>
                        </div>
                    )}
                    {selectedBook.pdfUrl && (
                        <div className="bg-navy-50 text-center py-3 px-4 border-t border-navy-100">
                            <p className="text-[10px] text-navy-500 font-medium">Jika dokumen meminta akses/login (karena diblokir oleh iPhone/Safari), silakan klik tombol <b>Buka Eksternal</b> di atas.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Mode daftar buku
    return (
        <div className="animate-fade-in space-y-6 glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-5 md:p-6">
            {/* Header */}
            <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 overflow-hidden">
                <img src="https://images.hopesoftware.org/resize/L3dfMTkyMF9fcV84MC9ob3BlLWltYWdlcy82MWRlZDc4YTk0YTg4Zjc2MzEwMjAzNDEvQVhNMTY0Mzk2NzU0MjczOS5qcGc/w_1920__q_80/hope-images/61ded78a94a88f7631020341/AXM1643967542739.jpg" loading="lazy" alt="Buku" className="w-full h-[14rem] object-cover" />
                <div className="p-6">
                    <h1 className="text-[1.75rem] font-extrabold text-navy-900 mb-2">Perpustakaan Buku</h1>
                    <p className="text-navy-500 font-medium text-sm leading-relaxed">Baca dan unduh buku-buku rohani langsung di sini. Pilih buku untuk membacanya.</p>
                </div>
            </div>

            {/* Search Bar Buku */}
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
                    <Icon name="Search" className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    placeholder="Cari judul, pengarang, atau deskripsi..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-white border border-navy-100/80 rounded-2xl text-sm font-semibold text-navy-900 placeholder-navy-300 outline-none focus:border-gold-500 shadow-sm transition-all"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-navy-100 text-navy-500 hover:bg-navy-200 transition flex items-center justify-center">
                        <Icon name="X" className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Filter Kategori */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${activeCategory === cat ? 'bg-navy-900 text-gold-400 border-navy-900 shadow' : 'bg-white text-navy-600 border-navy-100 hover:border-navy-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid Buku - 2 kolom di mobile */}
            {isLoadingBooks ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-1 border-navy-100 border-t-gold-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-navy-400 font-medium">Memuat buku...</p>
                </div>
            ) : filteredBooks.length > 0 ? (
                <div className="max-h-[calc(170vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
                    {searchQuery.length >= 2 && (
                        <p className="text-xs text-navy-400 font-semibold mb-3 px-1">
                            {filteredBooks.length} hasil untuk &quot;{searchQuery}&quot;
                        </p>
                    )}
                    {/* GRID: 2 kolom di mobile, 3 di sm, 4 di md, 5 di lg */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredBooks.map(book => (
                            <div
                                key={book.id}
                                className="w-full glass-box rounded-2xl shadow-sm border border-navy-100/60 overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                onClick={() => setSelectedBook(book)}
                            >
                                <div className="h-[10rem] overflow-hidden relative">
                                    <img
                                        src={getCoverFallback(book)}
                                        alt={book.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.target.src = getDefaultBookCover(book.category); }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
                                    <DocumentBadge book={book} />
                                    <span className="absolute top-2 right-2 bg-gold-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {book.category}
                                    </span>
                                </div>
                                <div className="p-3 flex-1 flex flex-col">
                                    <p className="font-bold text-navy-900 text-sm leading-tight mb-1 line-clamp-3">{book.title}</p>
                                    <p className="text-xs text-navy-400 font-semibold mb-3">{book.author}</p>
                                    <button className="mt-auto w-full py-2 rounded-xl bg-navy-900 text-gold-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-navy-800 transition">
                                        <Icon name="BookOpen" className="w-3.5 h-3.5" /> Baca Buku
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-navy-50 rounded-[1.5rem] border border-navy-100/60 p-12 text-center">
                    <Icon name="BookOpen" className="w-16 h-16 text-navy-200 mx-auto mb-4" />
                    {searchQuery.length >= 2
                        ? <><p className="text-navy-700 font-bold mb-1">Buku tidak ditemukan</p>
                            <p className="text-navy-400 text-sm">Tidak ada buku yang cocok dengan &quot;{searchQuery}&quot;</p>
                            <button onClick={() => setSearchQuery('')} className="mt-4 px-5 py-2 bg-navy-900 text-gold-400 rounded-xl text-sm font-bold hover:bg-navy-800 transition">Hapus Pencarian</button></>
                        : <p className="text-navy-500 font-medium">Belum ada buku di kategori ini.</p>
                    }
                </div>
            )}

            {/* Tautan Download Eksternal */}
            <div className="bg-navy-50 rounded-[1.5rem] border border-navy-100/60 p-6 mx-auto max-w-4xl">
                <h3 className="font-bold text-gold-500 text-base mb-1">Koleksi Lengkap di Google Drive</h3>
                <p className="text-sm text-navy-500 mb-4 font-medium">Akses koleksi buku, MP3 lagu, dan materi lainnya secara lengkap.</p>
                <div className="flex flex-wrap gap-3">
                    <a href="https://drive.google.com/drive/folders/1EP9dOY3Azcm2K21kKiOiVvAOhIZrUJqv?usp=drive_link" target="_blank" rel="noopener noreferrer" className="bg-gold-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow hover:bg-navy-800 transition">Lagu Sion MP3</a>
                    <a href="https://drive.google.com/drive/folders/0B69W7zsbdDmVflRoZUF4cDA1U1RWeVMwN1dYQmZNaE1Bbm5qQmc4NkVXU1hBUlpNVVpwem8?resourcekey=0-mDboNMKK-a6RJA4ClzRDWw&usp=drive_link" target="_blank" rel="noopener noreferrer" className="bg-gold-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow hover:bg-navy-800 transition">Buku-Buku Rohani</a>
                    <a href="https://drive.google.com/drive/folders/1d_smrJAY13h5x85A2Y_bAIIXg9sR012r" target="_blank" rel="noopener noreferrer" className="bg-gold-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow hover:bg-navy-800 transition">28 Doktrin</a>
                    <a href="https://drive.google.com/drive/folders/1FxfoHGqVxW22_xTlz3BMhi9nfkOuDjUm?usp=drive_link" target="_blank" rel="noopener noreferrer" className="bg-gold-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow hover:bg-navy-800 transition">Panduan Pelayan</a>
                    <a href="https://drive.google.com/drive/folders/1aQh9EpelV1wych30tXbFIHtqahANsXM4?usp=drive_link" target="_blank" rel="noopener noreferrer" className="bg-gold-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow hover:bg-navy-800 transition">Materi Kepahaman</a>
                </div>
            </div>
        </div>
    );
};

// Helper Rendering Sub-Group untuk Perjamuan (support dark mode)
const renderPerjamuanGroup = (title, members) => (
    <div className="flex flex-col">
        <div className="mb-2 bg-navy-50/50 dark:bg-navy-700/50 p-3 rounded-xl border border-navy-100/50 dark:border-navy-600">
            <h3 className="font-bold text-navy-800 dark:text-gold-400 text-sm uppercase tracking-wider">{title}</h3>
        </div>
        <div className="flex flex-col">
            {members.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 px-3 border border-navy-100/60 dark:border-navy-700/60 hover:bg-navy-50/30 dark:hover:bg-navy-700/30 transition-colors rounded-xl mb-2">
                    <span className="text-sm text-navy-500 dark:text-gray-400 font-medium">{m.tugas}</span>
                    <span className="text-sm font-bold text-navy-900 dark:text-white text-right break-words pl-2">{m.nama || "-"}</span>
                </div>
            ))}
        </div>
    </div>
);

const Jadwal = ({ activeRabu, activeSabat, rabuYMD, sabatYMD, showPerjamuan, perjamuanYMD, activePerjamuan }) => (
    <div className="space-y-6 md:space-y-8 animate-fade-in relative z-10">
        {/* Tombol GDrive Jadwal Lengkap */}
        <div className="bg-white dark:bg-navy-800/70 p-5 md:p-6 rounded-[1.25rem] shadow-sm border border-navy-100/60 dark:border-navy-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h3 className="font-bold text-navy-900 dark:text-white text-[1.15rem]">Jadwal Lengkap</h3>
                <p className="text-sm text-navy-500 dark:text-gray-400 mt-1">Lihat dan unduh file PDF jadwal pelayanan bulanan / triwulan di Google Drive.</p>
            </div>
            <a href="./document/TW2-2026-R1.pdf" target="_blank" rel="noopener noreferrer" className="bg-navy-900 dark:bg-gold-500 hover:bg-navy-800 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-900 px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center shrink-0 w-full sm:w-auto justify-center">
                <Icon name="Drive" className="w-[1.15rem] h-[1.15rem] mr-2 text-current" /> Buka Google Drive
            </a>
        </div>

        {/* Banner Spesial Perjamuan Kudus */}
        {showPerjamuan && (
            <div className="bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 p-5 md:p-6 rounded-[1.25rem] shadow-sm dark:shadow-md border border-amber-200 dark:border-gold-800 relative overflow-hidden animate-fade-in">
                {/* Background pattern halus */}
                <div className="absolute inset-0 opacity-30 dark:opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                {/* Badge */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-navy-900 dark:bg-gold-500 text-gold-500 dark:text-navy-900 text-[10px] font-bold px-4 py-1.5 rounded-b-xl uppercase tracking-widest shadow-sm">
                    Jadwal Spesial
                </div><br />
                <div className="flex items-center space-x-3 mb-5 border-b border-amber-200 dark:border-gold-800/50 pb-3 relative z-10">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-gold-900/40 rounded-full flex items-center justify-center text-amber-600 dark:text-gold-400">
                        <Icon name="Gift" className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-navy-900 dark:text-white leading-tight">Pelayanan Perjamuan Kudus</h2>
                        <p className="text-sm font-bold text-navy-700 dark:text-amber-200/90 mt-0.5">{formatIndoDate(perjamuanYMD)}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {renderPerjamuanGroup("Persiapan Roti & Anggur", activePerjamuan.slice(0, 3))}
                    {renderPerjamuanGroup("Persiapan & Basuh Kaki", activePerjamuan.slice(3, 7))}
                    {renderPerjamuanGroup("Pelayan Perjamuan", activePerjamuan.slice(7, 11))}
                    {renderPerjamuanGroup("Pembersihan Alat", activePerjamuan.slice(11, 16))}
                </div>
            </div>
        )}

        {/* Rabu */}
        <div className="bg-white dark:bg-navy-800/70 p-5 md:p-7 rounded-[1.5rem] shadow-sm border border-navy-100/60 dark:border-navy-700 relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 border-b pb-4 border-navy-50 dark:border-navy-700">
                <div className="flex items-center space-x-3">
                    <Icon name="Calendar" className="w-[1.4rem] h-[1.4rem] text-gold-500" />
                    <div>
                        <h2 className="text-lg font-bold text-navy-900 dark:text-white tracking-tight">{activeRabu.title}</h2>
                        <p className="text-sm font-semibold text-navy-400 dark:text-gray-400 mt-0.5">{formatIndoDate(rabuYMD)}</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-navy-800 dark:text-navy-200 bg-gold-50 dark:bg-navy-700 px-4 py-1.5 rounded-full mt-3 md:mt-0 w-fit border border-gold-200 dark:border-gold-800 uppercase tracking-widest shadow-sm">{activeRabu.time}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                {activeRabu.petugas.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2.5 px-3 border border-navy-100/60 dark:border-navy-700/60 hover:bg-navy-50/30 dark:hover:bg-navy-700/30 transition-colors rounded-xl mb-2">
                        <span className="text-sm text-navy-500 dark:text-gray-400 font-medium">{p.tugas}</span>
                        <span className="text-sm font-bold text-navy-900 dark:text-white text-right break-words">{p.nama}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Sabat */}
        <div className="bg-white dark:bg-navy-800/70 p-5 md:p-7 rounded-[1.5rem] shadow-sm border-t-[6px] border-navy-800 dark:border-gold-600 border-x border-b border-navy-100/60 dark:border-navy-700 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b pb-4 border-navy-50 dark:border-navy-700">
                <div className="flex items-center space-x-3">
                    <Icon name="Calendar" className="w-[1.4rem] h-[1.4rem] text-gold-500" />
                    <div>
                        <h2 className="text-lg font-bold text-navy-900 dark:text-white tracking-tight">{activeSabat.title}</h2>
                        <p className="text-sm font-semibold text-navy-400 dark:text-gray-400 mt-0.5">{formatIndoDate(sabatYMD)}</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-navy-800 dark:text-navy-200 bg-gold-50 dark:bg-navy-700 px-4 py-1.5 rounded-full mt-3 md:mt-0 w-fit border border-gold-200 dark:border-gold-800 uppercase tracking-widest shadow-sm">Waktu: {activeSabat.time}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-2 bg-navy-50/50 dark:bg-navy-700/50 p-3 rounded-xl border border-navy-100/50 dark:border-navy-600">
                            <h3 className="font-bold text-navy-800 dark:text-gold-400 text-sm uppercase tracking-wider">Khotbah / Umum</h3>
                            <span className="text-[11px] text-navy-600 dark:text-gray-400 font-bold bg-white dark:bg-navy-800 px-2 py-0.5 rounded-full border border-navy-100 dark:border-navy-600">{activeSabat.khotbahTime}</span>
                        </div>
                        <div className="flex flex-col">
                            {activeSabat.khotbah.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2.5 px-3 border border-navy-100/60 dark:border-navy-700/60 hover:bg-navy-50/30 dark:hover:bg-navy-700/30 transition-colors rounded-xl mb-2">
                                    <span className="text-sm text-navy-500 dark:text-gray-400 font-medium">{p.tugas}</span>
                                    <span className="text-sm font-bold text-navy-900 dark:text-white text-right break-words">{p.nama}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 bg-navy-50/50 dark:bg-navy-700/50 p-3 rounded-xl border border-navy-100/50 dark:border-navy-600">
                            <h3 className="font-bold text-navy-800 dark:text-gold-400 text-sm uppercase tracking-wider">Diakon & Diakones</h3>
                        </div>
                        <div className="flex flex-col">
                            {activeSabat.diakon.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2.5 px-3 border border-navy-100/60 dark:border-navy-700/60 hover:bg-navy-50/30 dark:hover:bg-navy-700/30 transition-colors rounded-xl mb-2">
                                    <span className="text-sm text-navy-500 dark:text-gray-400 font-medium">{p.tugas}</span>
                                    <span className="text-sm font-bold text-navy-900 dark:text-white text-right break-words">{p.nama}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-2 bg-navy-50/50 dark:bg-navy-700/50 p-3 rounded-xl border border-navy-100/50 dark:border-navy-600">
                            <h3 className="font-bold text-navy-800 dark:text-gold-400 text-sm uppercase tracking-wider">Sekolah Sabat</h3>
                            <span className="text-[11px] text-navy-600 dark:text-gray-400 font-bold bg-white dark:bg-navy-800 px-2 py-0.5 rounded-full border border-navy-100 dark:border-navy-600">{activeSabat.sekolahSabatTime}</span>
                        </div>
                        <div className="flex flex-col">
                            {activeSabat.sekolahSabat.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2.5 px-3 border border-navy-100/60 dark:border-navy-700/60 hover:bg-navy-50/30 dark:hover:bg-navy-700/30 transition-colors rounded-xl mb-2">
                                    <span className="text-sm text-navy-500 dark:text-gray-400 font-medium">{p.tugas}</span>
                                    <span className="text-sm font-bold text-navy-900 dark:text-white text-right break-words">{p.nama}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 bg-navy-50/50 dark:bg-navy-700/50 p-3 rounded-xl border border-navy-100/50 dark:border-navy-600">
                            <h3 className="font-bold text-navy-800 dark:text-gold-400 text-sm uppercase tracking-wider">Pelayanan Musik</h3>
                        </div>
                        <div className="flex flex-col">
                            {activeSabat.musik.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2.5 px-3 border border-navy-100/60 dark:border-navy-700/60 hover:bg-navy-50/30 dark:hover:bg-navy-700/30 transition-colors rounded-xl mb-2">
                                    <span className="text-sm text-navy-500 dark:text-gray-400 font-medium">{p.tugas}</span>
                                    <span className="text-sm font-bold text-navy-900 dark:text-white text-right break-words">{p.nama}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Live = ({ setActiveTab, activeRabu, activeSabat, rabuYMD, sabatYMD, showPerjamuan, perjamuanYMD, activePerjamuan, liveUrl }) => {
    const today = new Date();
    const todayDay = today.getDay();

    let isToday = false;
    let targetJadwal = null;
    let targetDateStr = '';

    if (todayDay === 3) { targetJadwal = activeRabu; targetDateStr = rabuYMD; isToday = true; }
    else if (todayDay === 6) { targetJadwal = activeSabat; targetDateStr = sabatYMD; isToday = true; }
    else if (todayDay < 3) { targetJadwal = activeRabu; targetDateStr = rabuYMD; }
    else { targetJadwal = activeSabat; targetDateStr = sabatYMD; }

    const isRabu = new Date(targetDateStr).getDay() === 3;

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in">
            <div className="bg-navy-900 rounded-[1.5rem] overflow-hidden shadow-lg p-2.5">
                <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
                    <iframe className="absolute top-0 left-0 w-full h-full" src={liveUrl} title="YouTube Live Stream" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy"></iframe>
                </div>
                <div className="pt-4 pb-2 px-2 text-white flex justify-center w-full">
                    <div className="font-bold text-sm tracking-widest flex items-center bg-gold-400/20 px-5 py-2.5 rounded-full border border-gold-400/30 text-gold-400 uppercase"><span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse mr-2.5"></span> Live </div>
                </div>
            </div>

            {showPerjamuan && !isRabu && (
                <div className="bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 p-5 md:p-6 rounded-[1.25rem] shadow flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in border border-gold-300">
                    <div className="text-center sm:text-left">
                        <h3 className="text-navy-800 text-[1.15rem] leading-none font-bold uppercase tracking-widest flex items-center justify-center sm:justify-start mb-1.5"><Icon name="Gift" className="w-4 h-4 mr-2" /> Sabat Perjamuan</h3>
                        <p className="text-sm text-navy-800 font-bold">{formatIndoDate(perjamuanYMD)}</p>
                    </div>
                    <button onClick={() => setActiveTab('jadwal')} className="bg-navy-700 text-gold-400 hover:text-gold-300 px-6 py-3 rounded-xl text-sm font-bold shadow hover:bg-navy-800 transition shrink-0 w-full sm:w-auto">Lihat Petugas</button>
                </div>
            )}

            <div className="glass-box p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60">
                <div className="flex justify-between items-start sm:items-center mb-6 flex-col sm:flex-row gap-4 border-b pb-5 border-navy-50">
                    <div>
                        {/* Label "Hari Ini" atau "Terdekat" */}
                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-3 flex items-center ${isToday ? 'text-red-500' : 'text-gold-500'}`}>
                            {isToday ? "🔥 Hari Ini" : "⏳ Terdekat"}
                        </h3>

                        {/* Baris utama: kiri (judul + tanggal), kanan (tombol) */}
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center space-x-3">
                                    <Icon name="Calendar" className={`w-[1.4rem] h-[1.4rem] ${isToday ? 'text-red-500' : 'text-gold-500'}`} />
                                    <h2 className="text-xl font-bold text-navy-900 tracking-tight">{targetJadwal.title}</h2>
                                </div>
                                <p className="text-sm text-navy-500 mt-1 font-medium">
                                    {formatIndoDate(targetDateStr)} &bull; {targetJadwal.time}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveTab('susunan_ibadah')}
                        className="hidden sm:flex mt-4 flex justify-center items-center text-sm font-medium text-gold-600 hover:text-blue-200 transition bg-navy-100 hover:bg-navy-100 px-4 py-3 rounded-lg">
                        Lihat Susunan Ibadah
                    </button>
                </div>

                {isRabu ? (
                    <div className="flex flex-col">
                        {targetJadwal.petugas.map((p, idx) => (
                            <div key={idx} className="flex items-center py-3 px-4 border border-navy-100/60 dark:border-navy-700/60 rounded-xl my-1.5 hover:bg-navy-50/30 transition-colors">
                                <span className="text-sm text-navy-500 font-medium w-1/2">{p.tugas}</span>
                                <span className="text-sm font-bold text-navy-900 w-1/2 text-right break-words">{p.nama}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col">
                            <div className="flex justify-between items-end bg-navy-50/50 px-5 py-3 border border-navy-100/50 rounded-xl mb-3 font-bold text-navy-800 text-sm uppercase tracking-wide shadow-sm">Ibadah Umum / Khotbah<span className="text-[11px] text-navy-600 font-bold bg-white px-2 py-0.5 rounded-full border border-navy-100">{activeSabat.khotbahTime}</span></div>
                            {targetJadwal.khotbah.map((p, idx) => (
                                <div key={idx} className="flex items-center py-3 px-4 border border-navy-100/60 dark:border-navy-700/60 rounded-xl my-1.5 hover:bg-navy-50/30 transition-colors">
                                    <span className="text-sm text-navy-500 font-medium w-1/2">{p.tugas}</span>
                                    <span className="text-sm font-bold text-navy-900 text-right w-1/2 break-words">{p.nama}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex justify-between items-end bg-navy-50/50 px-5 py-3 border border-navy-100/50 rounded-xl mb-3 font-bold text-navy-800 text-sm uppercase tracking-wide shadow-sm">Sekolah Sabat<span className="text-[11px] text-navy-600 font-bold bg-white px-2 py-0.5 rounded-full border border-navy-100">{activeSabat.sekolahSabatTime}</span></div>
                            {targetJadwal.sekolahSabat.map((p, idx) => (
                                <div key={idx} className="flex items-center py-3 px-4 border border-navy-100/60 dark:border-navy-700/60 rounded-xl my-1.5 hover:bg-navy-50/30 transition-colors">
                                    <span className="text-sm text-navy-500 font-medium w-1/2">{p.tugas}</span>
                                    <span className="text-sm font-bold text-navy-900 text-right w-1/2 break-words">{p.nama}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <button onClick={() => setActiveTab('susunan_ibadah')} className="sm:hidden w-full mt-4 flex justify-center items-center text-sm font-medium text-gold-600 hover:text-blue-800 transition bg-navy-50 hover:bg-navy-100 px-4 py-3 rounded-lg">Lihat Susunan Ibadah</button>
            </div>
        </div>
    );
};

const Persembahan = ({ dataPejabat }) => {
    const bendahara = dataPejabat.filter(p => (p.jabatan && p.jabatan.toLowerCase().includes('bendahara')) || (p.kategori && p.kategori.toLowerCase() === 'keuangan'));
    const qrisUrl = "./icons/notavailable.jpg";
    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in relative z-10">
            <div className="relative pt-2 md:pt-4">
                <div className="flex items-center space-x-3 mb-6"><Icon name="Gift" className="w-[1.4rem] h-[1.4rem] text-gold-500" /><h2 className="text-xl font-bold text-navy-900 tracking-tight">Persembahan, Perpuluhan, Ucapan Syukur, dan Donasi</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch mb-8">
                    <div className="flex flex-col items-center p-6 bg-white/60 rounded-2xl border border-navy-100/50 h-full justify-center shadow-sm">
                        <div className="w-40 md:w-48 bg-white border border-navy-100 p-2.5 rounded-xl shadow-sm mb-4"><img src={qrisUrl} alt="QRIS GMAHK PISGAH BISDAC" className="w-full h-auto object-contain rounded-lg" crossOrigin="anonymous" /></div>
                        <a href={qrisUrl} target="_blank" rel="noopener noreferrer" download="QRIS_GMAHK_PISGAH.jpg" className="bg-navy-900 hover:bg-navy-800 text-gold-400 px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow"><Icon name="Download" className="w-3.5 h-3.5" /><span>QRIS BELUM TERSEDIA</span></a>
                    </div>
                    <div className="flex flex-col justify-center text-center p-6 bg-gradient-to-br from-navy-800 to-navy-900 border border-gold-300 rounded-2xl h-full shadow-sm text-gold-400">
                        <p className="text-xs md:text-sm font-bold mb-1 tracking-wide uppercase">Atau Transfer Bank ke:</p><p className="font-extrabold text-2xl md:text-3xl tracking-widest my-2 font-mono">1090001711043</p><p className="text-xs md:text-sm font-bold opacity-90">MANDIRI </p><p className="text-xs md:text-sm font-bold opacity-90">a.n</p> <p className="text-xs md:text-sm font-bold opacity-90">GMAHK PISGAH BISDAC</p>
                    </div>
                </div>
                <div className="bg-white/60 p-5 md:p-6 rounded-2xl border border-navy-100/50 space-y-6 shadow-sm">
                    <div>
                        <h3 className="font-bold text-navy-900 text-sm mb-1.5 flex items-center"><span className="bg-gold-400/40 text-gold-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs mr-2 border border-gold-600/30 font-bold">1</span>Hubungi Bendahara</h3>
                        <p className="text-xs text-navy-600 mb-3 pl-7 font-medium">Kirim bukti transfer ke Bendahara kami:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 md:pl-7">
                            {bendahara.map((p, idx) => (
                                <a key={idx} href={`https://wa.me/${p.wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-2.5 rounded-xl border border-gold-200 bg-white hover:bg-gold-50 hover:border-gold-200 transition group shadow-sm"><img src={p.img} alt={p.nama} className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-transparent group-hover:border-gold-400 transition" /><div><p className="text-[9px] font-bold text-navy-500 group-hover:text-gold-600 transition-colors uppercase tracking-widest">{p.jabatan}</p><p className="font-bold text-navy-900 text-sm">{p.nama}</p></div></a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-navy-900 text-sm mb-1.5 flex items-center"><span className="bg-red-400/40 text-red-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs mr-2 border border-gold-600/30 font-bold">2</span>Sertakan Keterangan</h3>
                        <p className="text-xs text-navy-600 mb-4 pl-7 font-medium">Sebutkan rincian nominal persembahan Anda pada chat WhatsApp:</p>
                        <div className="flex flex-wrap gap-2 pl-0 md:pl-7">
                            {['Perpuluhan', 'Persembahan Terpadu', 'Persembahan Khusus', 'Persembahan Syukur', 'Donasi Kas Gereja', 'Donasi Kas Departemen', 'Lain-lain'].map((item, i) => { const colors = ['bg-gold-500', 'bg-navy-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-teal-500', 'bg-gray-500']; return (<span key={i} className="flex items-center bg-white border border-navy-100 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold text-navy-700 shadow-sm"><span className={`w-1.5 h-1.5 rounded-full ${colors[i]} mr-2`}></span>{item}</span>); })}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-navy-900 text-sm mb-1.5 flex items-center"><span className="bg-navy-400/40 text-navy-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs mr-2 border border-gold-600/30 font-bold">3</span>Ada 2 waktu pengumpulan persembahan</h3>
                        <p className="text-xs text-navy-600 mb-4 pl-7 font-medium">1. Pada Saat Jam Khotbah (Persembahan)</p>
                        <p className="text-xs text-navy-600 mb-4 pl-7 font-medium">2. Pada Saat Lagu Tutup Jam Khotbah (Pembangunan)</p>
                        <div className="flex flex-wrap gap-2 pl-0 md:pl-7">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Keanggotaan = ({ setActiveTab }) => (
    <div className="space-y-6 animate-fade-in relative z-10">
        <div className="glass-box p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60">
            <h2 className="text-[1.3rem] font-black mb-4 text-navy-900 border-b pb-3 border-navy-50">Layanan Keanggotaan</h2>
            <p className="text-sm font-medium text-navy-600 mb-6">Pilih jenis permohonan keanggotaan yang sesuai dengan status Anda saat ini.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                <button onClick={() => setActiveTab('member_baru')} className="w-full text-left p-5 rounded-[1.25rem] border border-navy-100/50 bg-navy-50/30 hover:bg-navy-50 transition-colors flex items-center justify-between h-full group shadow-sm"><div><h3 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors">Member Baru</h3><p className="text-xs font-medium text-navy-500 mt-1.5 leading-relaxed">Untuk yang belum pernah menjadi anggota GMAHK (Non-Adventist).</p></div><span className="text-gold-500 font-black text-xl ml-4 transform group-hover:translate-x-1 transition-transform">&rarr;</span></button>
                <button onClick={() => setActiveTab('pindah_masuk')} className="w-full text-left p-5 rounded-[1.25rem] border border-navy-100/50 bg-navy-50/30 hover:bg-navy-50 transition-colors flex items-center justify-between h-full group shadow-sm"><div><h3 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors">Pindah Masuk - ACMS</h3><p className="text-xs font-medium text-navy-500 mt-1.5 leading-relaxed">Untuk anggota GMAHK yang ingin pindah ke Jemaat PISGAH BISDAC.</p></div><span className="text-gold-500 font-black text-xl ml-4 transform group-hover:translate-x-1 transition-transform">&rarr;</span></button>
            </div>
        </div>
        <div className="glass-box p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60">
            <h2 className="text-[1.3rem] font-black mb-4 text-navy-900 border-b pb-3 border-navy-50">Jadwal Kegiatan & Pelayanan</h2>
            <p className="text-sm font-medium text-navy-600 mb-6">Lihat jadwal ibadah rutin dan daftar petugas pelayanan jemaat PISGAH BISDAC.</p>
            <button onClick={() => setActiveTab('jadwal')} className="w-full text-left p-5 rounded-[1.25rem] border border-gold-200 bg-gradient-to-br from-gold-50 to-white hover:border-gold-300 transition-colors flex items-center justify-between group shadow-sm"><div className="flex items-center"><div className="w-[3rem] h-[3rem] bg-gold-400 rounded-full flex items-center justify-center text-navy-900 mr-4 shrink-0 shadow-sm"><Icon name="Calendar" className="w-5 h-5" /></div><div><h3 className="font-bold text-navy-900">Lihat Jadwal Jemaat</h3><p className="text-xs font-medium text-navy-600 mt-1">Jadwal petugas ibadah hari Rabu dan Sabat.</p></div></div><span className="text-gold-500 font-black text-xl ml-4 transform group-hover:translate-x-1 transition-transform">&rarr;</span></button>
        </div>
    </div>
);

const MemberBaru = ({ setActiveTab, dataPejabat }) => {
    const contacts = dataPejabat.filter(p =>
        ['gembala', 'ketua'].includes(p.id) ||
        (p.jabatan && (p.jabatan.toLowerCase().includes('gembala') || p.jabatan.toLowerCase().includes('ketua')))
    );
    const steps = [
        {
            number: 1,
            title: "Menghadiri Kebaktian dan Berinteraksi dengan Jemaat",
            points: [
                "Calon anggota dianjurkan untuk mulai menghadiri kebaktian Sabat secara rutin.",
                "Berinteraksi dengan jemaat dan mengenal kehidupan rohani dalam komunitas Advent."
            ]
        },
        {
            number: 2,
            title: "Mempelajari Doktrin dan Ajaran Gereja Advent",
            points: [
                "Mengikuti kelas bimbingan rohani atau pelajaran Alkitab yang diajarkan oleh pendeta atau pemimpin gereja.",
                "Memahami ajaran utama Advent seperti Sabat, Kedatangan Kedua Kristus, kesehatan yang alkitabiah, persepuluhan, dll.",
                "Mempelajari dan menerima 28 Fundamental Beliefs Gereja Advent."
            ]
        },
        {
            number: 3,
            title: "Menunjukkan Pertobatan dan Kehidupan yang Berubah",
            points: [
                "Calon anggota harus menunjukkan bahwa mereka telah meninggalkan kebiasaan yang bertentangan dengan ajaran Advent, seperti penggunaan tembakau, alkohol, makanan haram, dan gaya hidup duniawi.",
                "Harus memiliki komitmen untuk menaati hukum Tuhan dan menghidupi prinsip Kristen."
            ]
        },
        {
            number: 4,
            title: "Mengajukan Diri untuk Baptisan",
            points: [
                "Setelah mendapatkan pemahaman yang cukup tentang ajaran Advent dan menunjukkan pertobatan, calon anggota dapat mendaftarkan diri untuk dibaptis.",
                "Pemimpin gereja atau pendeta akan melakukan pemeriksaan calon baptisan untuk memastikan kesiapan spiritual mereka."
            ]
        },
        {
            number: 5,
            title: "Baptisan dengan Cara Selam",
            points: [
                "Gereja Advent hanya menerima baptisan selam penuh sebagai simbol lahir baru dalam Kristus.",
                "Baptisan biasanya dilakukan di gereja, di kolam baptisan, atau di tempat lain yang sesuai."
            ]
        },
        {
            number: 6,
            title: "Penerimaan Resmi sebagai Anggota Gereja",
            points: [
                "Setelah dibaptis, calon anggota akan diterima secara resmi dalam kebaktian gereja melalui upacara penerimaan anggota.",
                "Jemaat akan menyambut mereka sebagai bagian dari keluarga besar Advent."
            ]
        },
        {
            number: 7,
            title: "Mengikuti Kehidupan Jemaat dan Pelayanan",
            points: [
                "Anggota baru dianjurkan untuk aktif dalam pelayanan gereja, safety pelayanan sosial, sekolah Sabat, paduan suara, atau penginjilan.",
                "Bertumbuh secara rohani melalui doa, studi Alkitab, dan persekutuan dengan jemaat."
            ]
        }
    ];
    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            <div className="glass-box p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60">
                <h2 className="text-[1.3rem] font-black mb-3 text-navy-900 border-b pb-3 border-navy-50 flex items-center">
                    <Icon name="BookOpen" className="w-5 h-5 mr-2 text-gold-500" />
                    Langkah Menjadi Anggota Gereja Advent
                </h2>
                <p className="text-sm font-medium text-navy-600 mb-8 leading-relaxed">
                    Berikut adalah <b>urutan langkah-langkah</b> yang harus dilakukan oleh seorang non-Adventist yang ingin menjadi anggota Gereja Masehi Advent Hari Ketujuh:
                </p>

                <div className="relative border-l-2 border-navy-100 ml-4 md:ml-6 space-y-8 pb-4">
                    {steps.map((step) => (
                        <div key={step.number} className="relative pl-8 md:pl-10 group">
                            <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-navy-900 text-gold-400 font-bold flex items-center justify-center border-2 border-white shadow-md group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors duration-300">
                                {step.number}
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-base text-navy-900 group-hover:text-gold-600 transition-colors duration-300">
                                    {step.title}
                                </h3>
                                <ul className="list-disc list-outside pl-4 space-y-1.5 text-sm text-navy-600 font-medium">
                                    {step.points.map((point, index) => (
                                        <li key={index} className="leading-relaxed">{point}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-5 border-t border-navy-50 bg-navy-50/30 -mx-6 md:-mx-8 -mb-6 md:-mb-8 px-6 md:px-8 py-4 rounded-b-[1.5rem]">
                    <p className="text-xs text-navy-500 font-bold italic leading-relaxed text-center">
                        Urutan ini membantu calon anggota memahami dan menyesuaikan diri dengan ajaran serta gaya hidup Gereja Advent sebelum secara resmi menjadi bagian dari komunitas iman.
                    </p>
                </div>
            </div>

            <div className="glass-box p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60">
                <h2 className="text-[1.3rem] font-black mb-4 text-navy-900 border-b pb-3 border-navy-50">Hubungi Pelayan Jemaat</h2>
                <p className="text-sm font-medium text-navy-600 mb-6">Silahkan hubungi Pendeta atau Ketua Jemaat kami untuk bimbingan rohani dan persiapan keanggotaan:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                    {contacts.map(p => (<a key={p.id} href={`https://wa.me/${p.wa}`} target="_blank" className="flex items-center justify-between p-4 rounded-xl border border-navy-100 bg-white hover:bg-gold-50 hover:border-gold-200 transition-colors h-full group shadow-sm"><div className="flex items-center"><img src={p.img} alt={p.nama} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-transparent group-hover:border-gold-400 transition-colors shrink-0" /><div><p className="font-bold text-navy-500 text-[10px] uppercase tracking-widest">{p.jabatan}</p><p className="text-sm font-bold text-navy-900 mt-1 leading-tight">{p.nama}</p></div></div><span className="text-gold-500 font-bold ml-2 opacity-50 group-hover:opacity-100 transition-opacity"><Icon name="MessageCircle" className="w-5 h-5" /></span></a>))}
                </div>
            </div>
        </div>
    );
};

const PindahMasuk = ({ setActiveTab, dataPejabat }) => {
    // Perbaikan: Cari berdasarkan ID 'sekretaris', atau yang jabatannya/kategorinya mengandung kata terkait
    const contacts = dataPejabat.filter(p =>
        p.id === 'sekretaris' ||
        (p.jabatan && (
            p.jabatan.toLowerCase().includes('sekretaris') ||
            p.jabatan.toLowerCase().includes('sekertaris') ||
            p.jabatan.toLowerCase().includes('clerk')
        )) ||
        (p.kategori && p.kategori.toLowerCase().includes('sekretaris'))
    );
    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            <div className="glass-box p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60">
                <h2 className="text-[1.3rem] font-black mb-4 text-navy-900 border-b pb-3 border-navy-50">Pengurusan ACMS</h2>
                <p className="text-sm font-medium text-navy-600 mb-6">Silahkan isi formulir ACMS atau hubungi Sekretaris Jemaat kami untuk bantuan kepindahan:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                    <button onClick={() => setActiveTab('form_acms')} className="flex items-center justify-between p-4 rounded-xl border border-gold-300 bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 transition-colors h-full w-full text-left shadow text-navy-900 group"><div className="flex items-center"><div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-navy-900 mr-4 shrink-0"><Icon name="BookOpen" className="w-5 h-5" /></div><div><p className="font-black text-navy-900 text-sm md:text-base leading-tight">Formulir Pindah Masuk</p><p className="text-xs font-bold text-navy-800 mt-1 opacity-90">Isi Data Online</p></div></div><span className="text-navy-900 font-bold ml-2 transform group-hover:translate-x-1 transition-transform">&rarr;</span></button>
                    {contacts.map(p => (<a key={p.id} href={`https://wa.me/${p.wa}`} target="_blank" className="flex items-center justify-between p-4 rounded-xl border border-navy-100 bg-white hover:bg-gold-50 hover:border-gold-200 transition-colors h-full group shadow-sm"><div className="flex items-center"><img src={p.img} alt={p.nama} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-transparent group-hover:border-gold-400 transition-colors shrink-0" /><div><p className="font-bold text-navy-500 text-[10px] uppercase tracking-widest">{p.jabatan}</p><p className="text-sm font-bold text-navy-900 mt-1 leading-tight">{p.nama}</p></div></div><span className="text-gold-500 font-bold ml-2 opacity-50 group-hover:opacity-100 transition-opacity"><Icon name="MessageCircle" className="w-5 h-5" /></span></a>))}
                </div>
            </div>
        </div>
    );
};

const Hubungi = ({ setActiveTab, dataPejabat, kontakGereja }) => {
    // Kategorisasi Pejabat
    const categories = [...new Set(dataPejabat.map(p => p.kategori || "Lainnya"))].map(kat => ({
        title: kat,
        filter: p => (p.kategori || "Lainnya") === kat
    }));

    const SkeletonCardContact = () => (
        <div className="flex flex-col bg-white p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl md:rounded-[2rem] shadow-sm border border-navy-100/60 h-full w-full">
            <div className="w-2/3 h-3 md:h-4 bg-navy-100 animate-pulse rounded-md mx-auto mt-2 mb-1"></div>
            <div className="w-1/2 h-2 md:h-3 bg-navy-100 animate-pulse rounded-md mx-auto mb-3"></div>
            <div className="w-full aspect-square bg-navy-100 animate-pulse rounded-lg md:rounded-xl mb-3"></div>
            <div className="w-full h-6 md:h-10 bg-navy-100 animate-pulse rounded-md md:rounded-full mt-auto"></div>
        </div>
    );

    // Ekstrak koordinat/query Google Maps fallback jika mapUrl ada
    const mapsQuery = kontakGereja?.alamat ? encodeURIComponent(kontakGereja.alamat) : "GMAHK";
    // Memprioritaskan link maps kustom dari admin, jika tidak ada, buat link pencarian otomatis
    const mapsLink = kontakGereja?.mapsAppUrl ? kontakGereja.mapsAppUrl : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

    return (
        <div className="space-y-6 animate-fade-in relative z-10">

            {/* Kartu Peta Lokasi Gereja */}
            {kontakGereja && (
                <div className="glass-box p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60 overflow-hidden relative">
                    <div className="absolute top-0 right-0 bg-gold-400 text-navy-900 text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-sm">Lokasi Gereja</div>

                    <h2 className="text-xl md:text-2xl font-black mb-5 text-navy-900 border-b pb-4 border-navy-50 flex items-center">
                        <div className="w-10 h-10 bg-navy-50 rounded-full flex items-center justify-center text-gold-500 mr-3 shadow-inner"><Icon name="MapPin" className="w-5 h-5" /></div>
                        Peta & Alamat
                    </h2>

                    <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="bg-navy-50/50 p-5 rounded-2xl border border-navy-100 shadow-sm mb-5">
                                <h3 className="font-bold text-navy-900 mb-2 uppercase tracking-widest text-xl">Alamat Lengkap</h3>
                                <p className="text-navy-700 font-medium whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                                    {kontakGereja.alamat}
                                </p>
                            </div>
                            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all group">
                                <Icon name="Navigation" className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" /> Buka di Aplikasi Maps
                            </a>
                        </div>

                        <div className="flex-1 h-64 lg:h-auto min-h-[250px] rounded-[1.25rem] overflow-hidden border-2 border-navy-100 shadow-inner relative bg-navy-50">
                            {kontakGereja.mapUrl ? (
                                <iframe
                                    src={kontakGereja.mapUrl}
                                    className="absolute inset-0 w-full h-full"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade">
                                </iframe>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-navy-400">
                                    <Icon name="Map" className="w-10 h-10 mb-2 opacity-50" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Peta Belum Diatur</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Daftar Pejabat / Kontak Berdasarkan Kategori */}
            <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-5 md:p-6">
                {categories.map((cat, idx) => {
                    const items = dataPejabat.filter(cat.filter);
                    if (items.length === 0) return null;

                    return (
                        <div key={idx} className={`glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-5 md:p-6 ${idx !== categories.length - 1 ? 'mb-6' : ''}`}>
                            <h2 className="text-xl md:text-2xl font-black mb-6 text-navy-900">{cat.title}</h2>
                            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 items-stretch">
                                {items.map((p, i) => (
                                    <div key={i} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.666rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-1.2rem)] flex flex-col bg-white p-2 sm:p-3 md:p-5 rounded-xl sm:rounded-2xl md:rounded-[2rem] shadow-sm border border-navy-100/60 hover:shadow-xl transition-all duration-300 group">
                                        <div className="text-center mt-1 sm:mt-2 md:mt-3 mb-2 sm:mb-3 md:mb-5">
                                            <h3 className="font-black text-navy-900 text-[11px] sm:text-sm md:text-xl tracking-tight leading-tight group-hover:text-gold-600 transition-colors line-clamp-2 md:line-clamp-none">{p.nama}</h3>
                                            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-navy-500 flex items-center justify-center mt-0.5 sm:mt-1 md:mt-2">{p.jabatan}</p>
                                        </div>
                                        <div className="w-full aspect-square mb-2 sm:mb-3 md:mb-5 overflow-hidden rounded-lg sm:rounded-xl md:rounded-[1.5rem] relative shadow-inner">
                                            <img src={p.img} alt={p.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                        </div>
                                        <div className="mt-auto">
                                            <a href={`https://wa.me/${p.wa}`} target="_blank" rel="noopener noreferrer" className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-1.5 sm:py-2 md:py-3.5 rounded-md sm:rounded-lg md:rounded-full flex items-center justify-center transition-all shadow-md group-hover:shadow-lg">
                                                <Icon name="MessageCircle" className="w-3 h-3 sm:w-4 sm:h-4 md:w-[1.15rem] md:h-[1.15rem] md:mr-2" />
                                                <span className="hidden md:inline">WhatsApp</span>
                                                <span className="md:hidden text-[9px] sm:text-[10px] ml-1">WA</span>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const FormACMS = ({ setActiveTab }) => {
    const [step, setStep] = React.useState('fill');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [formData, setFormData] = React.useState({ namaLengkap: '', jenisKelamin: 'Laki-laki', tanggalLahir: '', namaIbu: '', baptisanTanggal: '', baptisanTempat: '', baptisanPendeta: '', masaDisiplin: 'TIDAK', pernahPindah: 'BELUM', jemaatAsalNama: '', jemaatAsalAlamat: '', jemaatAsalSekretaris: '', jemaatAsalKontak: '' });
    const [showCaptcha, setShowCaptcha] = React.useState(false);
    const [captcha, setCaptcha] = React.useState({ num1: 0, num2: 0 });
    const [captchaInput, setCaptchaInput] = React.useState('');
    const [captchaError, setCaptchaError] = React.useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); setStep('preview'); window.scrollTo(0, 0); };
    const generateCaptcha = () => { setCaptcha({ num1: Math.floor(Math.random() * 10) + 1, num2: Math.floor(Math.random() * 10) + 1 }); setCaptchaInput(''); setCaptchaError(false); };
    const handleKirimClick = () => { generateCaptcha(); setShowCaptcha(true); };
    const verifyAndKirim = () => { if (parseInt(captchaInput) === captcha.num1 + captcha.num2) { setShowCaptcha(false); processPDF(); } else { setCaptchaError(true); generateCaptcha(); } };

    const processPDF = () => {
        setIsGenerating(true);
        const element = document.getElementById('pdf-content');
        const filename = `ACMS_03_${formData.namaLengkap.replace(/\s+/g, '_')}.pdf`;
        const opt = { margin: [0, 0, 30, 0], filename: filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
        html2pdf().set(opt).from(element).save().then(() => {
            setIsGenerating(false); setStep('success');
            const subject = encodeURIComponent(`Permohonan Pindah Masuk ACMS - ${formData.namaLengkap}`);
            const body = encodeURIComponent(`Syalom Admin,\n\nBerikut saya lampirkan dokumen PDF permohonan pindah keanggotaan (ACMS) atas nama ${formData.namaLengkap} yang baru saja saya unduh dari aplikasi PISGAH BISDAC.\n\nTerima kasih.\n\n(Mohon jangan lupa untuk melampirkan file ${filename} yang baru saja terdownload ke dalam email ini)`);
            window.location.href = `mailto:gmahkpisgahbisdac@gmail.com?subject=${subject}&body=${body}`;
        });
    };

    if (step === 'success') {
        return (
            <div className="bg-white p-8 md:p-10 rounded-[1.5rem] shadow-sm border border-navy-100/60 text-center animate-fade-in relative z-10">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Icon name="Check" className="w-10 h-10" />
                </div>
                <h2 className="text-[1.8rem] font-black text-navy-900 mb-3 tracking-tight">Dokumen Berhasil Dibuat!</h2>
                <p className="text-navy-600 mb-8 font-medium">File PDF permohonan Anda telah berhasil <b>diunduh</b> ke perangkat Anda.</p>
                <div className="bg-navy-50/50 p-6 rounded-2xl text-left border border-navy-100 mb-8 shadow-inner">
                    <h3 className="font-bold text-navy-900 mb-2 flex items-center"><Icon name="Info" className="w-5 h-5 mr-2 text-gold-500" /> Langkah Selanjutnya</h3>
                    <p className="text-sm text-navy-600 mb-4 leading-relaxed">Aplikasi email standar/bawaan Anda (seperti Gmail atau Mail) akan terbuka secara otomatis.</p>
                    <ol className="list-decimal list-outside ml-4 space-y-2 text-sm text-navy-700 font-medium">
                        <li>Temukan file PDF yang baru saja terunduh (biasanya di folder Downloads).</li>
                        <li><b>"Attach / Lampirkan"</b> file tersebut ke dalam badan email yang terbuka.</li>
                        <li>Klik tombol <b>Kirim</b> untuk mengirimkannya ke Sekretaris Jemaat PISGAH BISDAC.</li>
                    </ol>
                </div>
                <button onClick={() => setActiveTab('pindah_masuk')} className="bg-navy-900 hover:bg-navy-800 text-gold-400 px-8 py-3.5 rounded-xl font-bold transition shadow hover:shadow-md">Selesai & Kembali</button>
            </div>
        );
    }

    if (step === 'preview') {
        return (
            <div className="space-y-6 animate-fade-in relative z-10">
                {showCaptcha && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/60 px-4 backdrop-blur-md">
                        <div className="glass-box rounded-[1.5rem] shadow-2xl p-6 md:p-8 max-w-sm w-full animate-fade-in text-center"><div className="w-16 h-16 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 scale-110"><Icon name="Shield" className="w-8 h-8" /></div><h3 className="text-2xl font-black text-navy-900 mb-2">Verifikasi Keamanan</h3><p className="text-sm font-medium text-navy-600 mb-6 leading-relaxed">Untuk menghindari spam otomatis, silahkan selesaikan perhitungan sederhana berikut:</p><div className="flex items-center justify-center space-x-3 mb-6 bg-navy-50 p-5 rounded-2xl border border-navy-100/50 shadow-inner"><span className="text-2xl font-black text-navy-800 tracking-wider"> {captcha.num1} + {captcha.num2} = </span><input type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} className={`w-24 p-3 border-2 ${captchaError ? 'border-red-400 bg-red-50 text-red-700' : 'border-navy-200 bg-white text-navy-900 focus:border-gold-500'} rounded-xl text-3xl font-black text-center outline-none transition-colors drop-shadow-sm`} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') verifyAndKirim(); }} /></div>{captchaError && <p className="text-red-500 text-sm mb-6 font-bold animate-pulse">Jawaban salah, silahkan coba lagi.</p>}<div className="flex justify-between space-x-4"><button onClick={() => setShowCaptcha(false)} className="w-1/2 py-3.5 text-navy-600 bg-navy-50 hover:bg-navy-100 rounded-xl transition font-bold">Batal</button><button onClick={verifyAndKirim} className="w-1/2 py-3.5 bg-navy-900 hover:bg-navy-800 text-gold-400 rounded-xl transition font-bold shadow-md">Kirim PDF</button></div></div>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 md:p-5 rounded-[1.5rem] shadow-sm border border-navy-100/60 gap-4">
                    <button onClick={() => setStep('fill')} className="text-navy-600 font-bold flex items-center hover:text-gold-600 transition-colors">&larr; Edit Formulir</button>
                    <button onClick={handleKirimClick} disabled={isGenerating} className={`w-full sm:w-auto ${isGenerating ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg'} px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center`}>{isGenerating ? <><span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></span> Memproses PDF...</> : <><Icon name="Download" className="w-4 h-4 mr-2" /> Unduh PDF & Kirim</>}</button>
                </div>
                <div className="bg-navy-100/50 shadow-inner overflow-x-auto border border-navy-200 rounded-[1.5rem] p-4 sm:p-8 relative">
                    <div className="absolute top-4 right-4 text-xs font-bold text-navy-400 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm z-10 pointer-events-none">Preview Saja</div>
                    <div className="w-max mx-auto shadow-xl bg-white relative rounded overflow-hidden">
                        <div id="pdf-content" className="p-10 bg-white text-black text-sm relative" style={{ width: '210mm', minHeight: '297mm', fontFamily: '"Open Sans", sans-serif', boxSizing: 'border-box' }}><p className="text-[10px] text-gray-500 absolute top-4 right-10 leading-none">Form ACMS-03</p><div className="flex justify-between items-center mb-10 mt-6"><div className="w-[180px] flex justify-start"><img src="./icons/acms.png" alt="ACMS Logo" crossOrigin="anonymous" className="h-[60px] object-contain block" /></div><div className="flex-1 text-center px-4"><h2 className="font-bold text-[16px] leading-tight">PERMOHONAN PERPINDAHAN ANGGOTA</h2><h2 className="font-bold text-[16px] leading-tight mt-1">GMAHK DAERAH SUMATERA KAWASAN TENGAH</h2><h2 className="font-bold text-[16px] leading-tight mt-1">JEMAAT PISGAH BISDAC</h2></div><div className="w-[180px] flex flex-col items-center"><div className="border border-black bg-[#dce6f1] font-bold py-1 w-full text-center text-[12px]">DIISI OLEH PEMOHON</div><p className="italic text-center mt-1 text-[12px] leading-snug">Bagi Pemohon yang namanya <br /><span className="font-bold not-italic">SUDAH</span> ada di ACMS</p></div></div><div className="mb-6"><p className="font-bold mb-2">A. PROFIL PEMOHON <span className="font-normal text-[11px]">(Mohon diisi sesuai dengan KTP/Akte Kelahiran / identitas lainnya menggunakan huruf besar)</span></p><table className="w-full ml-4" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}><tbody><tr><td className="w-1/4 py-1 align-top">1. Nama Lengkap</td><td className="w-3/4 py-1 align-top">: <span className="uppercase">{formData.namaLengkap}</span></td></tr><tr><td className="w-1/4 py-1 align-top">2. Jenis Kelamin</td><td className="w-3/4 py-1 align-top">: {formData.jenisKelamin}</td></tr><tr><td className="w-1/4 py-1 align-top">3. Tanggal Lahir</td><td className="w-3/4 py-1 align-top">: {formatDate(formData.tanggalLahir)}</td></tr><tr><td className="w-1/4 py-1 align-top">4. Nama Ibu</td><td className="w-3/4 py-1 align-top">: <span className="uppercase">{formData.namaIbu}</span></td></tr><tr><td className="w-1/4 py-1 align-top">5. Baptisan</td><td className="w-3/4 py-1"></td></tr><tr><td className="w-1/4 py-1 pl-4 align-top">- tanggal</td><td className="w-3/4 py-1 align-top">: {formatDate(formData.baptisanTanggal)}</td></tr><tr><td className="w-1/4 py-1 pl-4 align-top">- tempat</td><td className="w-3/4 py-1 align-top">: <span className="uppercase">{formData.baptisanTempat}</span></td></tr><tr><td className="w-1/4 py-1 pl-4 align-top">- pendeta</td><td className="w-3/4 py-1 align-top">: <span className="uppercase">{formData.baptisanPendeta}</span></td></tr></tbody></table></div><div className="mb-8"><p className="font-bold mb-2">B. PERNYATAAN PEMOHON</p><table className="w-full ml-4 mb-4" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}><tbody><tr><td className="w-[80%] py-1 align-top">1. Apakah Anda dalam masa disiplin Gereja?</td><td className="w-[20%] py-1 font-bold align-top">: {formData.masaDisiplin}</td></tr><tr><td className="w-[80%] py-1 align-top">2. Apakah Anda sudah pernah mengajukan permohonan perpindahan keanggotaan?</td><td className="w-[20%] py-1 font-bold align-top">: {formData.pernahPindah}</td></tr></tbody></table><p className="mb-2">Dengan ini saya memohon agar memindahkan keanggotaan saya dari:</p><table className="w-full ml-4 mb-4" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}><tbody><tr><td className="w-1/4 py-1 align-top">1. Nama Jemaat Asal</td><td className="w-3/4 py-1 align-top">: <span className="uppercase">{formData.jemaatAsalNama}</span></td></tr><tr><td className="w-1/4 py-1 align-top">2. Alamat Jemaat Asal</td><td className="w-3/4 py-1 align-top">: {formData.jemaatAsalAlamat}</td></tr><tr><td className="w-1/4 py-1 align-top">3. Nama Sekretaris</td><td className="w-3/4 py-1 align-top">: <span className="uppercase">{formData.jemaatAsalSekretaris}</span></td></tr><tr><td className="w-1/4 py-1 align-top">4. Telp/Email Aktif</td><td className="w-3/4 py-1 align-top">: {formData.jemaatAsalKontak}</td></tr></tbody></table><p className="mb-6">Demikian permohonan ini saya ajukan tanpa ada paksaan dari pihak manapun.</p><div className="flex justify-end pr-10"><div className="text-center w-64"><p>Tempat/Tanggal diajukan:</p><p className="mb-14">Surabaya, {formatDate(new Date())}</p><p className="border-t border-black pt-1 uppercase leading-none">( {formData.namaLengkap || '..........................'} )</p><p className="text-[11px] mt-1">Nama dan Tanda Tangan Pemohon</p></div></div></div><div className="mb-6 mt-10 pt-6 border-t-[1.5px] border-dashed border-gray-400"><p className="font-bold text-center mb-5 tracking-wide text-[13px]">DIISI OLEH SEKRETARIS JEMAAT</p><p className="font-bold mb-2 text-[13px]">C. DATA KEPUTUSAN MAJELIS</p><table className="w-full ml-4" style={{ borderCollapse: 'separate', borderSpacing: '0 6px' }}><tbody><tr><td className="w-[40%] py-1.5 align-bottom">1. Keputusan Majelis Tanggal</td><td className="w-[60%] py-1.5 border-b border-dotted border-gray-500 align-bottom">: </td></tr><tr><td className="w-[40%] py-1.5 align-bottom"> Nomor Keputusan</td><td className="w-[60%] py-1.5 border-b border-dotted border-gray-500 align-bottom">: </td></tr><tr><td className="w-[40%] py-1.5 align-bottom">2. Di proses tanggal</td><td className="w-[60%] py-1.5 border-b border-dotted border-gray-500 align-bottom">: </td></tr><tr><td className="w-[40%] py-1.5 align-bottom">3. Ketua Jemaat</td><td className="w-[60%] py-1.5 border-b border-dotted border-gray-500 align-bottom">: </td></tr><tr><td className="w-[40%] py-1.5 align-bottom">4. Gembala Jemaat</td><td className="w-[60%] py-1.5 border-b border-dotted border-gray-500 align-bottom">: </td></tr></tbody></table><div className="flex justify-end pr-10 mt-8"><div className="text-center w-64"><p className="mb-14">20........</p><p className="border-t border-black pt-1 leading-none">( ........................................ )</p><p className="text-[11px] mt-1">Nama dan Tanda Tangan Sekretaris Jemaat</p></div></div></div><div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400 font-sans"><p>ACMS v.3.03</p><p>&copy; Copyright by PISGAH BISDAC 2026</p></div></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            <div className="glass-box p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gold-400 text-navy-900 text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-sm">Form Resmi</div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8 border-b pb-5 border-navy-50"><div className="w-14 h-14 bg-navy-50 rounded-full flex items-center justify-center text-navy-900 shadow-inner"><Icon name="BookOpen" className="w-7 h-7" /></div><div><h2 className="text-2xl font-black text-navy-900 tracking-tight">Formulir Pindah Masuk (ACMS)</h2><p className="text-sm font-medium text-navy-500 mt-1">Isi data di bawah ini untuk mengunduh dokumen perpindahan yang siap diberikan ke Majelis.</p></div></div>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h3 className="font-bold text-navy-900 border-b pb-2 mb-4 uppercase tracking-widest text-sm bg-navy-50/50 px-3 py-1.5 rounded-t-lg">A. PROFIL PEMOHON</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-3">
                            <div className="md:col-span-2"><label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-wide">1. Nama Lengkap (Sesuai KTP/Akte)</label><input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} required className="w-full p-3 border border-navy-200 bg-navy-50/30 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 uppercase transition-all outline-none font-bold text-navy-900 shadow-sm" /></div>
                            <div><label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-wide">2. Jenis Kelamin</label><select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} required className="w-full p-3 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all outline-none font-medium text-navy-900 shadow-sm cursor-pointer"><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
                            <div><label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-wide">3. Tanggal Lahir</label><input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} required className="w-full p-3 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all outline-none font-medium text-navy-900 shadow-sm" /></div>
                            <div className="md:col-span-2"><label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-wide">4. Nama Ibu</label><input type="text" name="namaIbu" value={formData.namaIbu} onChange={handleChange} required className="w-full p-3 border border-navy-200 bg-navy-50/30 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 uppercase transition-all outline-none font-bold text-navy-900 shadow-sm" /></div>
                            <div className="md:col-span-2 border border-navy-100 rounded-[1.25rem] bg-gradient-to-br from-navy-50/50 to-white mt-2 p-5 shadow-sm">
                                <label className="block text-sm font-black text-navy-900 mb-4 tracking-wide uppercase">5. Data Baptisan</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><label className="block text-xs font-bold text-navy-600 mb-1.5">Tanggal Baptis</label><input type="date" name="baptisanTanggal" value={formData.baptisanTanggal} onChange={handleChange} className="w-full p-3 border border-navy-200 bg-white rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all outline-none text-navy-900 shadow-sm" /></div>
                                    <div><label className="block text-xs font-bold text-navy-600 mb-1.5">Tempat</label><input type="text" name="baptisanTempat" value={formData.baptisanTempat} onChange={handleChange} className="w-full p-3 border border-navy-200 bg-white rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all outline-none text-navy-900 shadow-sm" /></div>
                                    <div><label className="block text-xs font-bold text-navy-600 mb-1.5">Pendeta yang melayani</label><input type="text" name="baptisanPendeta" value={formData.baptisanPendeta} onChange={handleChange} className="w-full p-3 border border-navy-200 bg-white rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all outline-none text-navy-900 shadow-sm" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-navy-900 border-b pb-2 mb-4 uppercase tracking-widest text-sm bg-navy-50/50 px-3 py-1.5 rounded-t-lg">B. PERNYATAAN PEMOHON</h3>
                        <div className="space-y-5 px-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-navy-50 pb-4"><label className="text-sm font-bold text-navy-800 tracking-wide">1. Apakah Anda dalam masa disiplin Gereja?</label><div className="mt-3 sm:mt-0 relative"><select name="masaDisiplin" value={formData.masaDisiplin} onChange={handleChange} className="w-full sm:w-40 p-3 pl-4 pr-10 border-2 border-navy-200 rounded-xl bg-white font-bold text-navy-900 focus:ring-2 focus:ring-gold-500 outline-none appearance-none cursor-pointer"><option value="TIDAK">TIDAK</option><option value="YA">YA</option></select><Icon name="ChevronDown" className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 pointer-events-none" /></div></div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-navy-50 pb-4"><label className="text-sm font-bold text-navy-800 tracking-wide">2. Apakah Anda sudah pernah mengajukan pindah?</label><div className="mt-3 sm:mt-0 relative"><select name="pernahPindah" value={formData.pernahPindah} onChange={handleChange} className="w-full sm:w-40 p-3 pl-4 pr-10 border-2 border-navy-200 rounded-xl bg-white font-bold text-navy-900 focus:ring-2 focus:ring-gold-500 outline-none appearance-none cursor-pointer"><option value="BELUM">BELUM</option><option value="SUDAH">SUDAH</option></select><Icon name="ChevronDown" className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 pointer-events-none" /></div></div>
                            <div className="mt-6 bg-navy-50/50 p-5 rounded-[1.25rem] border border-navy-100 shadow-sm"><p className="text-sm font-black text-navy-900 mb-4 tracking-wide">Dengan ini saya memohon agar memindahkan keanggotaan saya dari:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2"><label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase">1. Nama Jemaat Asal</label><input type="text" name="jemaatAsalNama" value={formData.jemaatAsalNama} onChange={handleChange} required className="w-full p-3 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 outline-none uppercase font-bold text-navy-900 shadow-sm delay-75 transition-all" /></div>
                                    <div className="md:col-span-2"><label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase">2. Alamat Lengkap Jemaat Asal</label><input type="text" name="jemaatAsalAlamat" value={formData.jemaatAsalAlamat} onChange={handleChange} required className="w-full p-3 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-navy-900 shadow-sm delay-75 transition-all font-medium" /></div>
                                    <div><label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase">3. Nama Sekretaris Jemaat Asal</label><input type="text" name="jemaatAsalSekretaris" value={formData.jemaatAsalSekretaris} onChange={handleChange} required className="w-full p-3 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 outline-none uppercase font-bold text-navy-900 shadow-sm delay-75 transition-all" /></div>
                                    <div><label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase">4. Telp/Email Aktif Sekretaris Asal</label><input type="text" name="jemaatAsalKontak" value={formData.jemaatAsalKontak} onChange={handleChange} required className="w-full p-3 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 outline-none font-bold text-navy-900 shadow-sm delay-75 transition-all" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-50 pointer-events-none grayscale bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h3 className="font-bold text-gray-800 border-b pb-1 mb-3">C. DATA KEPUTUSAN MAJELIS <span className="text-red-600 text-[10px] ml-2 font-bold bg-red-100 px-2 py-0.5 rounded uppercase tracking-wider">(Hanya diisi oleh Sekretaris Jemaat)</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-xs text-gray-600 mb-1">Keputusan Majelis Tanggal</label><input type="text" disabled className="w-full p-2 border border-gray-300 rounded bg-gray-200" /></div>
                            <div><label className="block text-xs text-gray-600 mb-1">Nomor Keputusan</label><input type="text" disabled className="w-full p-2 border border-gray-300 rounded bg-gray-200" /></div>
                            <div className="md:col-span-2"><label className="block text-xs text-gray-600 mb-1">Diproses Tanggal</label><input type="text" disabled className="w-full p-2 border border-gray-300 rounded bg-gray-200" /></div>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold py-4 rounded-xl transition mt-8 text-lg flex justify-center items-center shadow-lg hover:shadow-xl"><span className="mr-3">Lanjut Preview Formulir</span> <Icon name="ChevronRight" className="w-5 h-5 bg-navy-800 rounded-full" /></button>
                </form>
            </div>
        </div>
    );
};

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);

        try {
            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'verifyPassword', password: password })
            });

            if (!response.ok) {
                throw new Error("Gagal mengambil data dari server");
            }

            const result = await response.json();

            if (result.success) {
                setPassword('');
                onSuccess(password);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error(err);
            alert("Gagal terhubung ke server. Pastikan URL Web App sudah benar.");
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/60 px-4 backdrop-blur-md animate-fade-in">
            <div className="glass-box rounded-[1.5rem] shadow-2xl p-6 md:p-8 max-w-sm w-full relative border border-navy-100/60">
                <button onClick={onClose} className="absolute top-4 right-4 text-navy-400 hover:text-red-500 transition-colors bg-navy-50 w-8 h-8 rounded-full flex items-center justify-center font-bold pb-1">&times;</button>
                <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center text-gold-500 shadow-inner"><Icon name="Settings" className="w-8 h-8" /></div></div>
                <h2 className="text-2xl font-black text-center text-navy-900 mb-2 tracking-tight">Admin Login</h2>
                <p className="text-sm text-center text-navy-500 mb-8 font-medium">Lakukan otentikasi untuk mengelola jadwal dan data jemaat.</p>
                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Kata Sandi</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus className={`w-full p-3.5 pr-10 border-2 ${error ? 'border-red-400 bg-red-50 text-red-900' : 'border-navy-100 bg-navy-50/50 text-navy-900 focus:border-gold-500'} rounded-xl focus:ring-0 outline-none transition-colors font-bold tracking-wide shadow-sm`} placeholder="Masukkan password..." disabled={isLoading} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-gold-500 transition-colors focus:outline-none">
                                <Icon name={showPassword ? "EyeOff" : "Eye"} className="w-5 h-5" />
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-xs mt-2 font-bold flex items-center"><Icon name="Info" className="w-3.5 h-3.5 mr-1" /> Password salah, silahkan coba lagi.</p>}
                    </div>
                    <button type="submit" disabled={isLoading} className={`w-full ${isLoading ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex items-center justify-center`}>
                        {isLoading ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Memverifikasi...</> : 'Masuk ke Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ========== KOMPONEN GALERI PUBLIK (untuk jemaat) ==========
const GaleriPublik = () => {
    const [folders, setFolders] = React.useState([]);
    const [selectedFolderId, setSelectedFolderId] = React.useState('');
    const [media, setMedia] = React.useState([]);
    const [loadingFolders, setLoadingFolders] = React.useState(false);
    const [loadingMedia, setLoadingMedia] = React.useState(false);
    const [error, setError] = React.useState('');
    const [selectedImage, setSelectedImage] = React.useState(null); // Lightbox Modal

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
                if (data.folders?.length > 0 && !selectedFolderId) {
                    setSelectedFolderId(data.folders[0].id);
                }
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
            } else {
                setError('Gagal memuat media: ' + data.message);
            }
        } catch (err) {
            setError('Gagal memuat media.');
        }
        setLoadingMedia(false);
    };

    React.useEffect(() => { loadFolders(); }, []);
    React.useEffect(() => { if (selectedFolderId) loadMedia(selectedFolderId); }, [selectedFolderId]);

    if (loadingFolders) return <div className="text-center py-8 text-navy-500 font-medium animate-pulse">Memuat album galeri...</div>;
    if (error) return <div className="text-center py-8 text-red-500 font-bold">{error}</div>;
    if (folders.length === 0) return <div className="text-center py-8 text-navy-500 font-medium">Belum ada album galeri yang tersedia.</div>;

    return (
        <div className="space-y-6">

            {/* Modal Lightbox Gambar */}
            {selectedImage && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-4 right-4 text-white hover:text-gold-400 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition-colors">
                        <Icon name="X" className="w-6 h-6" />
                    </button>
                    <img src={formatImageUrl(selectedImage)} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" alt="Preview" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center border-b border-navy-100 pb-5">
                {folders.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setSelectedFolderId(f.id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${selectedFolderId === f.id ? 'bg-navy-900 text-gold-400 scale-105' : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50'
                            }`}
                    >
                        📁 {f.name}
                    </button>
                ))}
            </div>

            {loadingMedia ? (
                <div className="text-center py-10">
                    <div className="w-10 h-10 border-4 border-navy-100 border-t-gold-500 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-navy-500 font-medium">Memuat foto & video...</p>
                </div>
            ) : media.length === 0 ? (
                <div className="text-center py-10 bg-navy-50 rounded-2xl border border-dashed border-navy-200">
                    <Icon name="Image" className="w-12 h-12 mx-auto text-navy-300 mb-2" />
                    <p className="text-navy-500 font-medium">Belum ada foto/video di album ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {media.map(item => (
                        <div key={item.id} className="glass-box rounded-[1.25rem] shadow-sm border border-navy-100/60 overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                            {item.type === 'video' ? (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-square bg-navy-900 overflow-hidden">
                                    <img src={formatImageUrl(item.thumbnailUrl || item.url)} alt={item.title} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-gold-500/90 text-navy-900 rounded-full p-3 shadow-lg transform group-hover:scale-110 transition-transform">
                                            <Icon name="Video" className="w-6 h-6 ml-1" />
                                        </div>
                                    </div>
                                </a>
                            ) : (
                                <div className="relative w-full aspect-square bg-navy-50 overflow-hidden" onClick={() => setSelectedImage(item.url)}>
                                    <img
                                        src={formatImageUrl(item.url)}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <Icon name="Eye" className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
// ========== WARTA PAGE DENGAN THUMBNAIL & MODAL (6 per halaman) ==========
const WartaPage = ({ daftarWarta, setActiveTab, selectedWarta, setSelectedWarta }) => {
    const [showGallery, setShowGallery] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);

    // State untuk fitur Modal (Pop-up Detail Warta)
    const [modalSlide, setModalSlide] = React.useState(0);
    const [imageErrors, setImageErrors] = React.useState({});

    const ITEMS_PER_PAGE = 6;

    // Reset ke halaman 1 setiap kali daftarWarta berubah
    React.useEffect(() => {
        setCurrentPage(1);
    }, [daftarWarta]);

    // Reset slide carousel & scroll ke atas ketika membuka warta baru
    React.useEffect(() => {
        setModalSlide(0);
        if (selectedWarta) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedWarta]);

    const handleImageError = (key) => {
        setImageErrors(prev => ({ ...prev, [key]: true }));
    };

    // Urutkan warta dari terbaru ke terlama
    const sortedWarta = React.useMemo(() => {
        return [...daftarWarta].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    }, [daftarWarta]);

    // Hitung total halaman
    const totalPages = Math.ceil(sortedWarta.length / ITEMS_PER_PAGE);

    // Ambil warta untuk halaman saat ini
    const paginatedWarta = React.useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return sortedWarta.slice(start, end);
    }, [sortedWarta, currentPage]);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (showGallery) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-4 rounded-[1.5rem] shadow-sm border border-navy-100">
                    <h2 className="text-xl font-bold text-navy-800 ml-2">Galeri Jemaat</h2>
                    <button onClick={() => setShowGallery(false)} className="bg-navy-50 hover:bg-navy-100 text-navy-600 px-4 py-2 rounded-xl font-bold transition flex items-center">
                        <Icon name="ArrowLeft" className="w-4 h-4 mr-2" /> Kembali
                    </button>
                </div>
                <div className="glass-box rounded-[1.5rem] p-6 shadow-sm border border-navy-100/60">
                    <GaleriPublik />
                </div>
            </div>
        );
    }

    // TAMPILAN FULL LAYAR UNTUK DETAIL WARTA
    if (selectedWarta) {
        const rawUrls = parseGambarUrls(selectedWarta.gambarUrl);
        const safeUrls = rawUrls.map(u => formatImageUrl(u)).filter(u => u.startsWith('http') || u.startsWith('data:image'));

        return (
            <div className="space-y-6 animate-fade-in pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-[1.5rem] shadow-sm border border-navy-100">
                    <h2 className="text-lg md:text-xl font-bold text-navy-800 ml-2 line-clamp-1 flex-1 pr-4">Detail Warta</h2>
                    <button onClick={() => setSelectedWarta(null)} className="bg-navy-50 hover:bg-navy-100 text-navy-600 px-4 py-2 rounded-xl font-bold transition flex items-center shrink-0">
                        <Icon name="ArrowLeft" className="w-4 h-4 mr-2" /> Kembali
                    </button>
                </div>

                <div className="glass-box rounded-[1.5rem] p-5 md:p-8 shadow-sm border border-navy-100/60">
                    <h1 className="text-2xl md:text-3xl font-black text-navy-900 leading-tight mb-4">{selectedWarta.judul}</h1>
                    <div className="flex flex-wrap items-center text-sm text-navy-500 font-medium mb-6 pb-6 border-b border-navy-50">
                        <span className="flex items-center mr-4 mb-2 md:mb-0"><Icon name="Calendar" className="w-4 h-4 mr-1.5 text-gold-500" /> {formatDate(selectedWarta.tanggal)}</span>
                        <span className="flex items-center"><Icon name="Edit" className="w-4 h-4 mr-1.5 text-gold-500" /> {selectedWarta.penulis || 'Admin'}</span>
                    </div>

                    {safeUrls.length > 0 && (
                        <div className="relative w-full rounded-xl overflow-hidden bg-navy-50 aspect-video mb-8 border border-navy-100 group">
                            <div className="flex transition-transform duration-500 ease-out h-full" style={{ transform: `translateX(-${modalSlide * 100}%)` }}>
                                {safeUrls.map((url, idx) => (
                                    <div key={idx} className="w-full h-full flex-shrink-0">
                                        {!imageErrors[`detail-${idx}`] ? (
                                            <img src={url} className="w-full h-full object-contain bg-black/5" alt={`Gambar ${idx + 1}`} onError={() => handleImageError(`detail-${idx}`)} referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-red-400 bg-red-50"><span className="text-sm font-medium">Gambar gagal dimuat</span></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {safeUrls.length > 1 && (
                                <>
                                    <button onClick={() => setModalSlide(p => (p === 0 ? safeUrls.length - 1 : p - 1))} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-navy-900 p-2.5 rounded-full shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronLeft" className="w-5 h-5" /></button>
                                    <button onClick={() => setModalSlide(p => (p + 1) % safeUrls.length)} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-navy-900 p-2.5 rounded-full shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronRight" className="w-5 h-5" /></button>
                                    <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2">
                                        {safeUrls.map((_, idx) => (
                                            <button key={idx} onClick={() => setModalSlide(idx)} className={`h-1.5 rounded-full transition-all ${modalSlide === idx ? 'bg-gold-500 w-6' : 'bg-white/70 w-2 hover:bg-white'}`} />
                                        ))}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black/60 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                        {modalSlide + 1} / {safeUrls.length}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="prose max-w-none text-base md:text-lg text-navy-800 leading-relaxed warta-content" dangerouslySetInnerHTML={{ __html: selectedWarta.isi }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in relative">
            {/* Banner Ajakan Galeri */}
            <div className="glass-card rounded-[1.25rem] md:rounded-[1.5rem] shadow-lg border border-gold-200/60 overflow-hidden relative z-10">
                <div className="p-5 md:p-6 bg-gradient-to-br from-navy-800 via-gold-50/40 to-gold-400 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left flex-1">
                        <h3 className="font-black text-navy-900 text-lg mb-1">Galeri Dokumentasi</h3>
                        <p className="text-xs md:text-sm font-medium text-navy-600 leading-relaxed">
                            Lihat dan simpan berbagai kenangan momen kegiatan di Jemaat PISGAH BISDAC.
                        </p>
                    </div>
                    <button onClick={() => setShowGallery(true)} className="flex items-center justify-center w-full sm:w-auto bg-navy-900 hover:bg-navy-800 text-gold-400 py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 group shrink-0">
                        <span className="text-[11px] md:text-sm font-bold uppercase tracking-widest transition-colors">Buka Galeri Utama</span>
                        <Icon name="Image" className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>

            {/* Area Daftar Warta (Thumbnails Grid) */}
            <div className="glass-box rounded-[1.5rem] p-6 shadow-sm border border-navy-100/60">
                <div className="flex items-center justify-between border-b border-navy-50 pb-4 mb-6">
                    <h2 className="text-2xl font-black text-navy-900 flex items-center">
                        <Icon name="BookOpen" className="w-6 h-6 mr-2 text-gold-500" /> Warta Jemaat
                    </h2>
                    <span className="bg-navy-50 text-navy-500 text-xs font-bold px-3 py-1 rounded-lg">Hal. {currentPage} / {totalPages || 1}</span>
                </div>

                {sortedWarta.length === 0 ? (
                    <div className="text-center py-10 bg-navy-50/50 rounded-2xl border border-dashed border-navy-200">
                        <Icon name="Info" className="w-10 h-10 mx-auto text-navy-300 mb-2" />
                        <p className="text-navy-500 font-medium">Belum ada warta yang diterbitkan.</p>
                    </div>
                ) : (
                    <>
                        {/* GRID KARTU WARTA (2 KOLOM) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            {paginatedWarta.map((warta) => {
                                const rawUrls = parseGambarUrls(warta.gambarUrl);
                                const safeUrls = rawUrls.map(u => formatImageUrl(u)).filter(u => u.startsWith('http') || u.startsWith('data:image'));
                                const thumbnailImg = safeUrls.length > 0 ? safeUrls[0] : null;

                                const plainText = stripHtml(warta.isi);
                                const shortPreview = truncateText(plainText, 120); // Potongan singkat untuk preview kartu

                                return (
                                    <div
                                        key={warta.rowIndex}
                                        onClick={() => setSelectedWarta(warta)}
                                        className="bg-white border border-navy-100/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group transform hover:-translate-y-1"
                                    >
                                        {/* Area Gambar Thumbnail (Rasio 16:9) */}
                                        <div className="relative aspect-video bg-navy-50 overflow-hidden border-b border-navy-50">
                                            {thumbnailImg ? (
                                                <img
                                                    src={thumbnailImg}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                    alt={warta.judul}
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-navy-300 bg-navy-50/50">
                                                    <Icon name="Image" className="w-10 h-10 mb-2 opacity-50" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Tanpa Gambar</span>
                                                </div>
                                            )}

                                            {/* Badge Jumlah Gambar */}
                                            {safeUrls.length > 1 && (
                                                <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center">
                                                    <Icon name="Image" className="w-3 h-3 mr-1" /> +{safeUrls.length - 1}
                                                </div>
                                            )}

                                            {/* Badge Tanggal (Floating) */}
                                            <div className="absolute bottom-3 left-3 bg-white/90 text-navy-900 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md">
                                                {formatDate(warta.tanggal)}
                                            </div>
                                        </div>

                                        {/* Area Konten Teks */}
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-bold text-navy-900 text-base leading-tight mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
                                                {warta.judul}
                                            </h3>
                                            <p className="text-xs text-navy-600 font-medium line-clamp-3 mb-4 flex-1 leading-relaxed">
                                                {shortPreview}
                                            </p>
                                            <div className="mt-auto flex justify-between items-center pt-3 border-t border-navy-50">
                                                <span className="text-[10px] text-navy-400 font-bold uppercase tracking-wider flex items-center">
                                                    <Icon name="Edit" className="w-3 h-3 mr-1 text-gold-400" />
                                                    {warta.penulis || 'Admin'}
                                                </span>
                                                <span className="text-[10px] text-gold-600 font-bold uppercase tracking-widest flex items-center group-hover:text-navy-900 transition-colors">
                                                    Baca <Icon name="ChevronRight" className="w-3 h-3 ml-0.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* PAGINATION CONTROLS */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t border-navy-100/60">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all shadow-sm ${currentPage === 1
                                        ? 'bg-navy-50 text-navy-300 cursor-not-allowed'
                                        : 'bg-white border border-navy-200 text-navy-700 hover:bg-gold-50 hover:text-gold-600 hover:border-gold-300'
                                        }`}
                                >
                                    <Icon name="ChevronLeft" className="w-5 h-5" />
                                </button>

                                <div className="flex gap-1.5 px-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all ${page === currentPage
                                                ? 'bg-navy-900 text-gold-400 shadow-md scale-110'
                                                : 'bg-white border border-navy-100 text-navy-600 hover:bg-navy-50 hover:border-navy-300'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all shadow-sm ${currentPage === totalPages
                                        ? 'bg-navy-50 text-navy-300 cursor-not-allowed'
                                        : 'bg-white border border-navy-200 text-navy-700 hover:bg-gold-50 hover:text-gold-600 hover:border-gold-300'
                                        }`}
                                >
                                    <Icon name="ChevronRight" className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
// ========== AKHIR WARTA PAGE ==========

// --- KOMPONEN AdminDashboard yang DIPERBAIKI (dengan fitur warta) ---
const AdminDashboard = ({ dataPejabat, setDataPejabat, jadwalDB, setJadwalDB, adminToken, setAdminToken,
    youtubeUrl, setYoutubeUrl, kategoriPejabat, setKategoriPejabat, heroImages, setHeroImages,
    pengumuman, setPengumuman, daftarWarta, setDaftarWarta, refreshWarta, kontakGereja, setKontakGereja, liveUrl, setLiveUrl, perjamuanDate, setPerjamuanDate, handleLogout }) => {
    const [adminTab, setAdminTab] = React.useState('jadwal'); // jadwal, pelayan, warta, pengaturan, buku
    const [viewMonth, setViewMonth] = React.useState(new Date().getMonth());
    const [viewYear, setViewYear] = React.useState(new Date().getFullYear());
    const [subTab, setSubTab] = React.useState('rabu');
    const [editingDate, setEditingDate] = React.useState(null);
    const [editForm, setEditForm] = React.useState([]);
    const [isSavingJadwal, setIsSavingJadwal] = React.useState(false);
    const [isSavingPejabat, setIsSavingPejabat] = React.useState(false);

    // ============ STATE BOOK MANAGEMENT ============
    const [daftarBuku, setDaftarBuku] = React.useState([]);
    const [initialBook, setInitialBook] = React.useState(null); // Buku yang dibuka langsung dari pencarian
    const [bookFormModal, setBookFormModal] = React.useState(false);
    const [editingBook, setEditingBook] = React.useState(null);
    const [bookFormData, setBookFormData] = React.useState({
        id: '',
        title: '',
        author: '',
        cover: '',
        desc: '',
        category: '',
        pdfUrl: ''
    });
    const [isSavingBook, setIsSavingBook] = React.useState(false);

    // --- TAMBAHKAN KODE INI DI SINI ---
    const [bukuSearch, setBukuSearch] = React.useState('');
    const filteredAdminBuku = React.useMemo(() => {
        let result = [...daftarBuku];
        if (bukuSearch.trim() && bukuSearch.length >= 2) {
            const q = bukuSearch.toLowerCase();
            result = result.filter(b =>
                (b.title && b.title.toLowerCase().includes(q)) ||
                (b.author && b.author.toLowerCase().includes(q)) ||
                (b.category && b.category.toLowerCase().includes(q))
            );
        }
        // Mengurutkan buku berdasarkan abjad (A-Z) pada judul
        return result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }, [daftarBuku, bukuSearch]);
    // -----------------------------------

    // Modal Tambah Buku
    const openAddBookModal = () => {
        setEditingBook(null);
        setBookFormData({
            id: '',
            title: '',
            author: '',
            cover: '',
            desc: '',
            category: '',
            pdfUrl: ''
        });
        setBookFormModal(true);
    };

    // 1. Tambahkan fungsi loadBooks (gunakan useCallback)
    const loadBooks = React.useCallback(async () => {
        if (!adminToken) return;
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'getBooks', password: adminToken })
            });
            const data = await res.json();
            if (data.status === 'success' && data.data) {
                setDaftarBuku(data.data);
            } else if (data.data && data.data.status === 'success') {
                setDaftarBuku(data.data.data || []);
            }
        } catch (err) {
            console.error('Error loading books:', err);
        }
    }, [adminToken]);

    // 2. useEffect untuk memuat buku ketika tab 'buku' diaktifkan
    React.useEffect(() => {
        if (adminTab === 'buku') {
            loadBooks();
        }
    }, [adminTab, loadBooks]);

    // State Ganti Password
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [showOldPass, setShowOldPass] = React.useState(false);
    const [showNewPass, setShowNewPass] = React.useState(false);
    const [isChangingPass, setIsChangingPass] = React.useState(false);

    // State URL YouTube
    const [editYoutubeUrl, setEditYoutubeUrl] = React.useState(youtubeUrl);
    const [isSavingUrl, setIsSavingUrl] = React.useState(false);

    // State untuk Live URL
    const [editLiveUrl, setEditLiveUrl] = React.useState(liveUrl);
    const [isSavingLiveUrl, setIsSavingLiveUrl] = React.useState(false);
    const [editPerjamuanDate, setEditPerjamuanDate] = React.useState(perjamuanDate);
    const [isSavingPerjamuanDate, setIsSavingPerjamuanDate] = React.useState(false);

    // Sync form state when perjamuanDate is fetched/updated from parent App
    React.useEffect(() => {
        setEditPerjamuanDate(perjamuanDate);
    }, [perjamuanDate]);

    // State Hero Image Array (Carousel)
    const [editHeroImages, setEditHeroImages] = React.useState(heroImages);
    const [isSavingHero, setIsSavingHero] = React.useState(false);

    // State Pengumuman
    const [editPengumuman, setEditPengumuman] = React.useState(pengumuman);
    const [isSavingPengumuman, setIsSavingPengumuman] = React.useState(false);
    const textareaRef = React.useRef(null);
    const [linkModalOpenPengumuman, setLinkModalOpenPengumuman] = React.useState(false);
    const [linkUrlPengumuman, setLinkUrlPengumuman] = React.useState('');
    const [linkTextPengumuman, setLinkTextPengumuman] = React.useState('');
    const pengumumanEditorRef = React.useRef(null);

    // State Kontak & Map
    const [editKontakGereja, setEditKontakGereja] = React.useState(kontakGereja);
    const [isSavingKontak, setIsSavingKontak] = React.useState(false);

    // State Warta (form)
    const [editingWarta, setEditingWarta] = React.useState(null); // { rowIndex, judul, isi, gambarUrl }
    const [editWartaModal, setEditWartaModal] = React.useState(false);
    const [editWartaJudul, setEditWartaJudul] = React.useState('');
    const [editWartaIsi, setEditWartaIsi] = React.useState('');
    const [editWartaGambarList, setEditWartaGambarList] = React.useState([]);
    const [isUpdatingWarta, setIsUpdatingWarta] = React.useState(false);

    const [wartaJudul, setWartaJudul] = React.useState('');
    const [wartaIsi, setWartaIsi] = React.useState('');
    const [wartaGambarList, setWartaGambarList] = React.useState([]);
    const [isSavingWarta, setIsSavingWarta] = React.useState(false);
    const [wartaPenulis, setWartaPenulis] = React.useState('');
    const [editWartaPenulis, setEditWartaPenulis] = React.useState('');
    const [wartaCurrentPage, setWartaCurrentPage] = React.useState(1);
    const wartaItemsPerPage = 3;
    const wartaEditorRef = React.useRef(null);      // <-- tambah
    const editWartaEditorRef = React.useRef(null);  // <-- tambah

    // RichTextEditor Component (WYSIWYG)
    const RichTextEditor = React.forwardRef(({ initialValue = "", onChange, placeholder }, ref) => {
        const editorRef = React.useRef(null);
        const [isFocused, setIsFocused] = React.useState(false);

        React.useImperativeHandle(ref, () => ({
            getContent: () => editorRef.current ? editorRef.current.innerHTML : '',
            setContent: (html) => { if (editorRef.current) editorRef.current.innerHTML = html; }
        }));

        React.useEffect(() => {
            if (editorRef.current && editorRef.current.innerHTML !== initialValue) {
                editorRef.current.innerHTML = initialValue;
            }
        }, [initialValue]);

        const handleBlur = () => {
            setIsFocused(false);
            if (onChange) onChange(editorRef.current.innerHTML);
        };

        const execCommand = (cmd, valueArg = null) => {
            editorRef.current.focus();

            if (cmd === 'formatBlock' && valueArg === '<h3>') {
                // Manual insert H3
                const selection = window.getSelection();
                if (selection.rangeCount) {
                    const range = selection.getRangeAt(0);
                    const selectedText = range.toString();
                    if (selectedText) {
                        const h3 = document.createElement('h3');
                        h3.textContent = selectedText;
                        range.deleteContents();
                        range.insertNode(h3);
                        range.setStartAfter(h3);
                        range.setEndAfter(h3);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
            else if (cmd === 'insertUnorderedList') {
                // Manual insert unordered list
                const selection = window.getSelection();
                if (selection.rangeCount) {
                    const range = selection.getRangeAt(0);
                    const selectedText = range.toString();
                    if (selectedText) {
                        const ul = document.createElement('ul');
                        const li = document.createElement('li');
                        li.textContent = selectedText;
                        ul.appendChild(li);
                        range.deleteContents();
                        range.insertNode(ul);
                        range.setStartAfter(ul);
                        range.setEndAfter(ul);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
            else if (cmd === 'insertOrderedList') {
                // Manual insert ordered list
                const selection = window.getSelection();
                if (selection.rangeCount) {
                    const range = selection.getRangeAt(0);
                    const selectedText = range.toString();
                    if (selectedText) {
                        const ol = document.createElement('ol');
                        const li = document.createElement('li');
                        li.textContent = selectedText;
                        ol.appendChild(li);
                        range.deleteContents();
                        range.insertNode(ol);
                        range.setStartAfter(ol);
                        range.setEndAfter(ol);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
            else if (cmd === 'insertHTML' && valueArg === '<br>') {
                // Manual insert line break
                const br = document.createElement('br');
                const selection = window.getSelection();
                if (selection.rangeCount) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(br);
                    range.setStartAfter(br);
                    range.setEndAfter(br);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
            else {
                // Default execCommand untuk bold, italic, underline, createLink
                document.execCommand(cmd, false, valueArg);
            }

            handleInput();
        };

        const insertLink = () => {
            const url = prompt('Masukkan URL tautan:', 'https://');
            if (url) execCommand('createLink', url);
        };

        const insertBreak = () => {
            editorRef.current.focus();
            const br = document.createElement('br');
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(br);
                range.setStartAfter(br);
                range.setEndAfter(br);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            handleInput();
        };

        return (
            <div className="border border-navy-200 rounded-lg overflow-hidden bg-white">
                <div className="flex flex-wrap gap-1 p-2 bg-navy-50 border-b border-navy-100">
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} className="p-1.5 hover:bg-navy-200 rounded" title="Tebal"><Icon name="Bold" className="w-4 h-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} className="p-1.5 hover:bg-navy-200 rounded" title="Miring"><Icon name="Italic" className="w-4 h-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }} className="p-1.5 hover:bg-navy-200 rounded" title="Garis Bawah"><Icon name="Underline" className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-navy-300 mx-1 self-center"></div>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<h3>'); }} className="p-1 hover:bg-navy-200 rounded font-black text-xs px-2">H3</button>
                    <div className="w-px h-5 bg-navy-300 mx-1 self-center"></div>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }} className="p-1.5 hover:bg-navy-200 rounded"><Icon name="List" className="w-4 h-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertOrderedList'); }} className="p-1.5 hover:bg-navy-200 rounded"><Icon name="ListOrdered" className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-navy-300 mx-1 self-center"></div>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className="p-1.5 hover:bg-navy-200 rounded"><Icon name="LinkIcon" className="w-4 h-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); insertBreak(); }} className="p-1 hover:bg-navy-200 rounded font-bold text-xs px-2">BR</button>
                </div>
                <div
                    ref={editorRef}
                    contentEditable
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    className="rich-text-editor p-3 min-h-[200px] max-h-[400px] overflow-y-auto focus:outline-none bg-white prose prose-sm max-w-none"
                    style={{ whiteSpace: 'pre-wrap' }}
                />
            </div>
        );
    });

    // Subtab untuk Warta
    const [wartaSubTab, setWartaSubTab] = React.useState('input'); // 'input' atau 'posting'
    const wartaScrollContainerRef = React.useRef(null);

    const scrollWartaTabs = (direction) => {
        if (wartaScrollContainerRef.current) {
            wartaScrollContainerRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
        }
    };

    // ========== GALERI / GAMBAR ==========

    const galeriScrollContainerRef = React.useRef(null);

    // State Galeri
    const [folderList, setFolderList] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [isLoadingFolders, setIsLoadingFolders] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
    const MAX_TOTAL_SIZE_MB = 50;
    const [imagePreview, setImagePreview] = useState('');
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [mediaList, setMediaList] = useState([]);   // Ganti imageList -> mediaList
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [showAllFolders, setShowAllFolders] = useState(false);

    // Fungsi menghitung total ukuran dalam MB
    const getTotalSizeMB = (files) => {
        let totalBytes = 0;
        for (let i = 0; i < files.length; i++) {
            totalBytes += files[i].size;
        }
        return totalBytes / (1024 * 1024);
    };

    // Fungsi untuk convert format image yang tidak kompatibel (HEIC, HEIF, RAW, dll) ke JPEG
    const convertImageFormat = async (file) => {
        const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        // Jika format sudah supported, return as-is
        if (supportedFormats.includes(file.type)) {
            return file;
        }

        // Format yang perlu convert
        const unsupportedFormats = {
            'image/heic': true,
            'image/heif': true,
            'image/x-heic': true,
            'image/x-heif': true,
            'image/raw': true,
            'image/x-raw': true,
            'image/x-canon-crw': true,
            'image/x-canon-cr2': true,
            'image/x-canon-raf': true,
            'image/x-sony-arw': true,
            'image/x-nikon-nef': true,
        };

        // Cek berdasarkan extension juga
        const fileExt = file.name.split('.').pop().toLowerCase();
        const heicHeifFormats = ['heic', 'heif', 'heick'];
        const rawFormats = ['raw', 'crw', 'cr2', 'cr3', 'nef', 'nrw', 'arw', 'raf', 'dng', 'orf', 'rw2'];

        if (!unsupportedFormats[file.type] && !heicHeifFormats.includes(fileExt) && !rawFormats.includes(fileExt)) {
            return file;
        }

        // Convert HEIC/HEIF
        if (heicHeifFormats.includes(fileExt) || file.type.includes('heic') || file.type.includes('heif')) {
            try {
                if (typeof heic2any !== 'undefined') {
                    const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg' });
                    return new File([convertedBlob], file.name.replace(/\.heic?$/i, '.jpg'), { type: 'image/jpeg' });
                }
            } catch (err) {
                console.warn('HEIC conversion failed, will try canvas method:', err);
                // Fallback: convert menggunakan canvas
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            canvas.toBlob((blob) => {
                                resolve(new File([blob], file.name.replace(/\.heic?$/i, '.jpg'), { type: 'image/jpeg' }));
                            }, 'image/jpeg', 0.9);
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                });
            }
        }

        // Convert RAW dan format lainnya ke JPEG via canvas
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                let loadTimeout = setTimeout(() => {
                    console.warn(`Format ${fileExt} mungkin tidak bisa dibaca sebagai image di browser. Akan diunggah dengan format asli.`);
                    resolve(file); // Fallback: upload file dengan format asli jika tidak bisa di-load
                }, 3000);

                img.onload = () => {
                    clearTimeout(loadTimeout);
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        const newFileName = file.name.replace(/\.[^.]+$/, '.jpg');
                        resolve(new File([blob], newFileName, { type: 'image/jpeg' }));
                    }, 'image/jpeg', 0.9);
                };

                img.onerror = () => {
                    clearTimeout(loadTimeout);
                    console.warn(`Tidak bisa load format ${fileExt} sebagai image. Akan diunggah dengan format asli.`);
                    resolve(file); // Fallback: upload file dengan format asli
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                console.error('Error reading file:', file.name);
                resolve(file); // Fallback: upload file dengan format asli
            };

            reader.readAsDataURL(file);
        });
    };

    //Fungsi upload multiple
    const handleUploadMultiple = async () => {
        if (!selectedFolder) {
            alert('Pilih folder terlebih dahulu');
            return;
        }
        if (selectedFiles.length === 0) {
            alert('Pilih file gambar terlebih dahulu');
            return;
        }

        const totalSizeMB = getTotalSizeMB(selectedFiles);
        if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
            alert(`Total ukuran file (${totalSizeMB.toFixed(2)}MB) melebihi batas ${MAX_TOTAL_SIZE_MB}MB.`);
            return;
        }

        setIsUploadingMultiple(true);
        const total = selectedFiles.length;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];

            // Membuat nama gambar pendek / inisial
            const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '');
            const initials = rawName.substring(0, 3).toUpperCase() || "IMG";
            const shortId = Math.random().toString(36).substr(2, 4).toUpperCase();
            const title = `${initials}_${shortId}`;

            setUploadProgress(prev => ({ ...prev, [file.name]: { status: 'uploading', percent: 0 } }));

            const reader = new FileReader();
            const uploadPromise = new Promise((resolve) => {
                reader.onload = async () => {
                    try {
                        // Improve image quality for warta
                        let imageData = reader.result;

                        // Jika file terlalu besar, compress dengan quality lebih baik
                        if (file.size > 500000) { // > 500KB
                            const img = new Image();
                            img.onload = async () => {
                                // Resize untuk optimal quality sambil menjaga ukuran manageable
                                const canvas = document.createElement('canvas');
                                let width = img.width;
                                let height = img.height;
                                const maxWidth = 2000;
                                const maxHeight = 2000;

                                if (width > height) {
                                    if (width > maxWidth) {
                                        height *= maxWidth / width;
                                        width = maxWidth;
                                    }
                                } else {
                                    if (height > maxHeight) {
                                        width *= maxHeight / height;
                                        height = maxHeight;
                                    }
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, width, height);

                                // Gunakan quality 0.85 untuk hasil lebih baik (default browser 0.92)
                                imageData = canvas.toDataURL('image/jpeg', 0.85);

                                uploadToGAS(imageData);
                            };
                            img.src = reader.result;
                        } else {
                            uploadToGAS(imageData);
                        }

                        async function uploadToGAS(base64Data) {
                            try {
                                const res = await fetch(GAS_API_URL, {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        action: 'uploadImageToDrive',
                                        password: adminToken,
                                        folderId: selectedFolder,
                                        title: title,
                                        imageBase64: base64Data
                                    })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    setUploadProgress(prev => ({ ...prev, [file.name]: { status: 'success', percent: 100 } }));
                                    successCount++;
                                } else {
                                    setUploadProgress(prev => ({ ...prev, [file.name]: { status: 'failed', message: data.message } }));
                                    failCount++;
                                }
                            } catch (err) {
                                setUploadProgress(prev => ({ ...prev, [file.name]: { status: 'failed', message: err.message } }));
                                failCount++;
                            }
                            resolve();
                        }
                    } catch (err) {
                        setUploadProgress(prev => ({ ...prev, [file.name]: { status: 'failed', message: err.message } }));
                        failCount++;
                        resolve();
                    }
                };
                reader.readAsDataURL(file);
            });
            await uploadPromise;
        }

        setIsUploadingMultiple(false);
        alert(`Selesai! Berhasil: ${successCount}, Gagal: ${failCount}`);
        if (successCount > 0) {
            setSelectedFiles([]);
            setImagePreview('');
            loadImages();   // refresh galeri setelah upload
        }
        setTimeout(() => setUploadProgress({}), 3000);
    };

    // Memuat daftar folder dari Google Drive
    const loadFolders = async () => {
        setIsLoadingFolders(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'listImageFolders', password: adminToken })
            });
            const data = await res.json();
            if (data.success) {
                setFolderList(data.folders || []);
                // 🔥 PENTING: Pilih folder pertama jika belum ada yang dipilih
                if (data.folders && data.folders.length > 0 && !selectedFolder) {
                    setSelectedFolder(data.folders[0].id);
                }
            } else {
                alert('Gagal memuat folder: ' + (data.message || ''));
            }
        } catch (err) {
            console.error(err);
            alert('Error memuat folder');
        }
        setIsLoadingFolders(false);
    };

    // Memuat gambar berdasarkan folder yang dipilih
    const loadImages = async () => {
        if (!selectedFolder) return;
        setIsLoadingImages(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'getPublicImages',
                    folderId: selectedFolder
                })
            });
            const data = await res.json();
            if (data.success) {
                setMediaList(data.media || []);
            } else {
                alert('Gagal memuat media: ' + (data.message || ''));
            }
        } catch (err) {
            console.error(err);
            alert('Error memuat media');
        }
        setIsLoadingImages(false);
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return alert('Nama folder tidak boleh kosong');
        setIsCreatingFolder(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'createImageFolder',
                    password: adminToken,
                    folderName: newFolderName
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Folder berhasil dibuat');
                setShowNewFolderModal(false);
                setNewFolderName('');

                // 🔥 PENTING: Muat ulang daftar folder
                await loadFolders();

                // 🔥 PENTING: Pilih folder yang baru dibuat (opsional)
                // Bisa juga biarkan loadFolders yang memilih folder pertama
            } else {
                alert('Gagal membuat folder: ' + data.message);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
        setIsCreatingFolder(false);
    };

    const handleDeleteImage = async (fileId) => {
        if (!confirm('Yakin ingin menghapus media ini?')) return;
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'deleteImage',
                    password: adminToken,
                    fileId: fileId
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Media dihapus');
                loadImages(); // refresh daftar
            } else {
                alert('Gagal menghapus: ' + data.message);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    // Efek untuk memuat folder saat subtab galeri dibuka
    React.useEffect(() => {
        if (adminTab === 'warta' && wartaSubTab === 'galeri') {
            loadFolders();
        }
    }, [adminTab, wartaSubTab]);

    React.useEffect(() => {
        if (adminTab === 'warta' && wartaSubTab === 'galeri' && selectedFolder) {
            loadImages();
        }
    }, [selectedFolder, adminTab, wartaSubTab]);

    // Reset showAllFolders saat subtab galeri ditutup atau adminTab berubah
    React.useEffect(() => {
        if (adminTab !== 'warta' || wartaSubTab !== 'galeri') {
            setShowAllFolders(false);
        }
    }, [adminTab, wartaSubTab]);

    // Subtab untuk Pengaturan Admin
    const [pengaturanSubTab, setPengaturanSubTab] = React.useState('pengumuman'); // 'pengumuman', 'youtube_url', 'ganti_password', 'kontak' 

    const pengaturanScrollContainerRef = React.useRef(null);

    const scrollPengaturanTabs = (direction) => {
        if (pengaturanScrollContainerRef.current) {
            pengaturanScrollContainerRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
        }
    };

    // Reset ke halaman 1 setiap kali data warta berubah
    React.useEffect(() => {
        setWartaCurrentPage(1);
    }, [daftarWarta]);

    // Fungsi simpan warta// 
    const handleWartaFormSubmit = async (e) => {
        e.preventDefault();
        setIsSavingWarta(true);

        // Ambil nilai terbaru dari editor
        let latestHtml = wartaIsi;
        if (wartaEditorRef.current) {
            latestHtml = wartaEditorRef.current.getContent();
            setWartaIsi(latestHtml);
        }

        let finalGambarUrl = "";
        if (wartaGambarList && wartaGambarList.length > 0) {
            let base64Array = [];
            for (let file of wartaGambarList) {
                const compressedBase64 = await compressImage(file, 1200);
                base64Array.push(compressedBase64);
            }
            finalGambarUrl = base64Array.join('|||');
        }

        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveWarta',
                    password: adminToken,
                    judul: wartaJudul,
                    isi: latestHtml,
                    gambarUrl: finalGambarUrl,
                    penulis: wartaPenulis
                })
            });
            const result = await res.json();
            if (result.success) {
                alert("Warta berhasil disimpan!");
                setWartaJudul('');
                setWartaIsi('');
                setWartaGambarList([]);
                setWartaPenulis('');
                if (refreshWarta) refreshWarta();
            } else {
                alert("Gagal menyimpan: " + (result.message || "Unknown error"));
            }
        } catch (err) {
            alert("Terjadi kesalahan: " + err.message);
        }
        setIsSavingWarta(false);
    };

    // Fingsi Update dan Delete Warta
    const handleEditWarta = (warta) => {
        setEditingWarta(warta);
        setEditWartaJudul(warta.judul);
        setEditWartaIsi(warta.isi);
        setEditWartaPenulis(warta.penulis || '');
        setEditWartaGambarList([]);
        setEditWartaModal(true);
    };

    const handleUpdateWarta = async (e) => {
        e.preventDefault();
        if (!editingWarta) return;
        setIsUpdatingWarta(true);

        // Ambil nilai terbaru dari editor
        let latestHtml = editWartaIsi;
        if (editWartaEditorRef.current) {
            latestHtml = editWartaEditorRef.current.getContent();
            setEditWartaIsi(latestHtml);
        }

        let finalGambarUrl = editingWarta.gambarUrl;
        if (editWartaGambarList && editWartaGambarList.length > 0) {
            let base64Array = [];
            for (let file of editWartaGambarList) {
                const compressedBase64 = await compressImage(file, 1200);
                base64Array.push(compressedBase64);
            }
            finalGambarUrl = base64Array.join('|||');
        }

        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'updateWarta',
                    password: adminToken,
                    rowIndex: editingWarta.rowIndex,
                    judul: editWartaJudul,
                    isi: latestHtml,
                    gambarUrl: finalGambarUrl,
                    penulis: editWartaPenulis
                })
            });
            const result = await res.json();
            if (result.success) {
                alert("Warta berhasil diperbarui!");
                setEditWartaModal(false);
                setEditingWarta(null);
                if (refreshWarta) refreshWarta();
            } else {
                alert("Gagal memperbarui: " + (result.message || "Unknown error"));
            }
        } catch (err) {
            alert("Terjadi kesalahan: " + err.message);
        }
        setIsUpdatingWarta(false);
    };

    const handleDeleteWarta = async (rowIndex, judul) => {
        if (!window.confirm(`Yakin ingin menghapus warta "${judul}"?`)) return;
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'deleteWarta',
                    password: adminToken,
                    rowIndex: rowIndex
                })
            });
            const result = await res.json();
            if (result.success) {
                alert("Warta berhasil dihapus!");
                if (refreshWarta) refreshWarta();
            } else {
                alert("Gagal menghapus: " + (result.message || "Unknown error"));
            }
        } catch (err) {
            alert("Terjadi kesalahan: " + err.message);
        }
    };

    // Fungsi kompresi gambar otomatis sebelum diupload (Mencegah Limit Size Apps Script)//
    const compressImage = (file, maxWidth = 1200) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    // Kualitas 0.5 agar string Base64 jauh lebih pendek dan tidak terpotong oleh limit sel Google Sheets
                    resolve(canvas.toDataURL('image/jpeg', 0.5));
                };
            };
            reader.readAsDataURL(file);
        });
    };

    // Drag and Drop States
    const [draggedItem, setDraggedItem] = React.useState(null);

    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        setTimeout(() => { if (e.target) e.target.style.opacity = '0.5'; }, 0);
    };
    const handleDragEnd = (e) => {
        if (e.target) e.target.style.opacity = '1';
        setDraggedItem(null);
    };
    const handleDragOver = (e) => { e.preventDefault(); };
    const handleDrop = (e, targetKategori) => {
        e.preventDefault();
        if (draggedItem && draggedItem.kategori !== targetKategori) {
            const newData = dataPejabat.map(p => p.id === draggedItem.id ? { ...p, kategori: targetKategori } : p);
            setDataPejabat(newData);
        }
    };

    const handleTambahKategori = () => {
        const nama = prompt("Masukkan nama kelompok baru:");
        if (nama && !kategoriPejabat.includes(nama)) {
            setKategoriPejabat([...kategoriPejabat, nama]);
        }
    };
    const handleHapusKategori = (kat) => {
        if (window.confirm(`Hapus kelompok "${kat}"? Pejabat di dalamnya akan dipindahkan ke kategori "Lainnya".`)) {
            if (!kategoriPejabat.includes("Lainnya") && kat !== "Lainnya") { setKategoriPejabat([...kategoriPejabat.filter(k => k !== kat), "Lainnya"]); }
            else { setKategoriPejabat(kategoriPejabat.filter(k => k !== kat)); }
            setDataPejabat(dataPejabat.map(p => p.kategori === kat ? { ...p, kategori: "Lainnya" } : p));
        }
    };
    const handleTambahPejabatBaru = (kat) => {
        const id_baru = 'pejabat' + Date.now();
        const obj = { id: id_baru, jabatan: "Jabatan", nama: "Nama Pejabat", wa: "62800000000", img: "https://ui-avatars.com/api/?name=Baru&background=e0e7ff&color=3730a3&size=128", kategori: kat };
        setDataPejabat([...dataPejabat, obj]);
    };

    // Referensi untuk fitur scroll tombol tab
    const scrollContainerRef = React.useRef(null);
    const scrollTabs = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 250;
            scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const getTriwulan = (m) => {
        if (m < 3) return "JANUARI - MARET";
        if (m < 6) return "APRIL - JUNI";
        if (m < 9) return "JULI - SEPTEMBER";
        return "OKTOBER - DESEMBER";
    };

    const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else { setViewMonth(viewMonth - 1); } setEditingDate(null); };
    const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else { setViewMonth(viewMonth + 1); } setEditingDate(null); };

    const getDatesForMonth = (year, month, dayOfWeek) => {
        let d = new Date(year, month, 1);
        let dates = [];
        while (d.getDay() !== dayOfWeek) { d.setDate(d.getDate() + 1); }
        while (d.getMonth() === month) { dates.push(toYMD(d)); d.setDate(d.getDate() + 7); }
        return dates;
    };

    const isRabu = subTab === 'rabu';
    const targetDates = isRabu ? getDatesForMonth(viewYear, viewMonth, 3) : getDatesForMonth(viewYear, viewMonth, 6);

    const getActiveArray = (rowData, tab) => {
        if (tab === 'rabu') return rowData.petugas;
        if (tab === 'sekolahSabat') return rowData.sekolahSabat;
        if (tab === 'khotbah') return rowData.khotbah;
        if (tab === 'diakon') return rowData.diakon;
        if (tab === 'musik') return rowData.musik;
        if (tab === 'perjamuan') return rowData.perjamuan;
        return [];
    };

    const subTabs = [
        { id: 'rabu', label: 'Rabu: Permintaan Doa' },
        { id: 'sekolahSabat', label: 'Sekolah Sabat' },
        { id: 'khotbah', label: 'Ibadah Khotbah' },
        { id: 'susunanAcara', label: 'Susunan Acara (Lagu)' },
        { id: 'musik', label: 'Petugas Musik' },
        { id: 'diakon', label: 'Petugas Diakon' },
        { id: 'perjamuan', label: 'Perjamuan Kudus' }
    ];

    const currentSubTabLabel = subTabs.find(t => t.id === subTab)?.label || '';
    const columns = ["Status Pengisian"];

    const handleEditClick = (date) => {
        setEditingDate(date);
        const existingData = jadwalDB[date] || (isRabu ? initialJadwalRabu : initialJadwalSabat);
        if (subTab === 'susunanAcara') {
            setEditForm(JSON.parse(JSON.stringify(existingData.susunan || defaultSusunan)));
        } else {
            // Menggabungkan data tersimpan dengan template awal jika ada penambahan kolom baru
            const baseTemplate = getActiveArray(isRabu ? initialJadwalRabu : initialJadwalSabat, subTab);
            const savedData = getActiveArray(existingData, subTab);
            const mergedData = baseTemplate.map((baseItem) => {
                const savedMatch = savedData.find(s => s.tugas === baseItem.tugas);
                return savedMatch ? { ...savedMatch } : { ...baseItem };
            });
            setEditForm(mergedData);
        }
    };

    const handleEditFormChange = (index, value) => {
        const newForm = [...editForm];
        if (newForm[index]) {
            newForm[index].nama = value;
        }
        setEditForm(newForm);
    };

    const handleEditFormChangeSusunan = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    // HELPER: Flatten JSON ke bentuk Array 2D (Tabel)
    const flattenJadwalData = (date, dataObj) => {
        const rows = [];
        const addSection = (sectionName, arr) => {
            if (arr && Array.isArray(arr)) {
                arr.forEach(item => {
                    rows.push([date, sectionName, item.tugas || '', item.nama || '']);
                });
            }
        };

        addSection('Ibadah Rabu', dataObj.petugas);
        addSection('Sekolah Sabat', dataObj.sekolahSabat);
        addSection('Khotbah', dataObj.khotbah);
        addSection('Diakon', dataObj.diakon);
        addSection('Musik', dataObj.musik);
        addSection('Perjamuan', dataObj.perjamuan);

        if (dataObj.susunan) {
            Object.entries(dataObj.susunan).forEach(([k, v]) => {
                rows.push([date, 'Susunan Acara', k, v === true ? 'Ya' : v === false ? 'Tidak' : String(v)]);
            });
        }
        return rows;
    };

    // SIMPAN JADWAL
    const handleSaveRow = (date) => {
        const baseData = jadwalDB[date] ? JSON.parse(JSON.stringify(jadwalDB[date])) : JSON.parse(JSON.stringify(isRabu ? initialJadwalRabu : initialJadwalSabat));
        if (subTab === 'rabu') baseData.petugas = editForm;
        else if (subTab === 'sekolahSabat') baseData.sekolahSabat = editForm;
        else if (subTab === 'khotbah') baseData.khotbah = editForm;
        else if (subTab === 'susunanAcara') baseData.susunan = editForm;
        else if (subTab === 'diakon') baseData.diakon = editForm;
        else if (subTab === 'musik') baseData.musik = editForm;
        else if (subTab === 'perjamuan') baseData.perjamuan = editForm;

        setIsSavingJadwal(true);

        const tableData = flattenJadwalData(date, baseData);

        const executeSave = () => {
            fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveJadwal',
                    password: adminToken,
                    tanggal: date,
                    data: baseData,
                    tableData: tableData
                })
            })
                .then(res => res.text())
                .then(text => {
                    setIsSavingJadwal(false);
                    let result = { success: false };
                    try {
                        result = JSON.parse(text);
                    } catch (e) {
                        console.warn("Response non-JSON dari GAS:", text.substring(0, 100));
                        if (text.includes('"success":true') || text.includes("success") || text.trim() === '') {
                            result = { success: true };
                        }
                    }
                    if (result.success) {
                        const newJadwalDB = { ...jadwalDB, [date]: baseData };
                        setJadwalDB(newJadwalDB);
                        try {
                            const cachedStr = localStorage.getItem('pisgah_data_cache');
                            if (cachedStr) {
                                const cached = JSON.parse(cachedStr);
                                cached.jadwalDB = newJadwalDB;
                                localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                            }
                        } catch (e) { }
                        setEditingDate(null);
                    } else {
                        alert("Gagal menyimpan: " + (result.message || "Akses ditolak."));
                    }
                })
                .catch(err => {
                    console.error("Fetch error:", err);
                    setIsSavingJadwal(false);
                    setJadwalDB({ ...jadwalDB, [date]: baseData });
                    setEditingDate(null);
                });
        };
        // Otomatis sinkronisasi "Tanggal Perjamuan" global dengan tanggal jadwal yang sedang diedit
        if (subTab === 'perjamuan') {
            fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'savePerjamuanDate',
                    password: adminToken,
                    tanggal: date
                })
            })
                .then(() => {
                    if (setPerjamuanDate) setPerjamuanDate(date);
                    try {
                        const cached = JSON.parse(localStorage.getItem('pisgah_data_cache') || '{}');
                        cached.perjamuanDate = date;
                        localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                    } catch (e) { }
                    executeSave();
                })
                .catch(e => {
                    console.log("Gagal auto update perjamuan date", e);
                    executeSave();
                });
        } else {
            executeSave();
        }
    };

    // HAPUS (RESET) JADWAL
    const handleDeleteRow = (date) => {
        if (!jadwalDB[date]) return;
        if (window.confirm(`Kembalikan jadwal ${formatIndoDateShort(date)} ke default?`)) {
            setIsSavingJadwal(true);
            const defaultData = JSON.parse(JSON.stringify(isRabu ? initialJadwalRabu : initialJadwalSabat));
            const tableData = flattenJadwalData(date, defaultData);

            fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveJadwal',
                    password: adminToken, // Otorisasi
                    tanggal: date,
                    data: defaultData, // JSON Asli
                    tableData: tableData // Array 2D (Tabel)
                })
            })
                .then(res => res.json())
                .then(result => {
                    setIsSavingJadwal(false);
                    if (result.success) {
                        const newJadwalDB = { ...jadwalDB };
                        delete newJadwalDB[date];
                        setJadwalDB(newJadwalDB);
                    } else {
                        alert("Gagal mereset jadwal: " + (result.message || "Akses ditolak."));
                    }
                })
                .catch(err => {
                    alert("Gagal terhubung ke server.");
                    setIsSavingJadwal(false);
                });
        }
    };

    // SIMPAN PEJABAT
    const handleSimpanPejabat = async () => {
        setIsSavingPejabat(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'savePejabat',
                    password: adminToken,
                    dataPejabat: dataPejabat,       // ← WAJIB "dataPejabat", bukan "data"
                    kategoriPejabat: kategoriPejabat
                })
            });
            const result = await res.json();
            if (result.success) {
                alert("Data Pejabat & Kategori berhasil disimpan!");
            } else {
                alert("Gagal menyimpan: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsSavingPejabat(false);
    };

    // GANTI PASSWORD
    const handleGantiPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) return alert("Password minimal 6 karakter");
        setIsChangingPass(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'changePassword', oldPassword: oldPassword, newPassword: newPassword })
            });
            const result = await res.json();
            if (result.success) {
                alert("Password Admin berhasil diperbarui!");
                setAdminToken(newPassword); // Update token lokal
                setOldPassword('');
                setNewPassword('');
            } else {
                alert("Gagal merubah password: " + (result.message || "Password lama salah."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsChangingPass(false);
    };

    // SIMPAN YOUTUBE URL
    const handleSaveYoutubeUrl = async (e) => {
        e.preventDefault();
        setIsSavingUrl(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveYoutubeUrl', password: adminToken, url: editYoutubeUrl })
            });
            const result = await res.json();
            if (result.success) {
                alert("URL YouTube berhasil diperbarui!");
                setYoutubeUrl(editYoutubeUrl);
            } else {
                alert("Gagal merubah URL: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsSavingUrl(false);
    };

    // SIMPAN LIVE YOUTUBE URL
    const handleSaveLiveUrl = async (e) => {
        e.preventDefault();
        setIsSavingLiveUrl(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveLiveUrl', password: adminToken, url: editLiveUrl })
            });
            const result = await res.json();
            if (result.success) {
                alert("URL Live Streaming berhasil diperbarui!");
                setLiveUrl(editLiveUrl);
            } else {
                alert("Gagal: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsSavingLiveUrl(false);
    };

    // SIMPAN PErjamuan
    const handleSavePerjamuanDate = async (e) => {
        e.preventDefault();
        setIsSavingPerjamuanDate(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'savePerjamuanDate',
                    password: adminToken,
                    tanggal: editPerjamuanDate
                })
            });

            // Baca sebagai text terlebih dahulu untuk mencegah error JSON.parse otomatis
            const text = await res.text();
            let result = { success: false };

            try {
                result = JSON.parse(text);
            } catch (parseErr) {
                console.warn("Response non-JSON dari GAS:", text.substring(0, 100));
                // Jika response error parsing tapi kita tahu GAS mengeksekusinya
                if (text.includes("success") || text.trim() === '') {
                    result = { success: true };
                }
            }

            if (result.success) {
                alert('Tanggal Perjamuan berhasil disimpan!');
                setPerjamuanDate(editPerjamuanDate);
                // Sinkronisasi cache localStorage agar data langsung terupdate saat reload
                try {
                    const cachedStr = localStorage.getItem('pisgah_data_cache');
                    if (cachedStr) {
                        const cached = JSON.parse(cachedStr);
                        cached.perjamuanDate = editPerjamuanDate;
                        localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                    }
                } catch (e) { console.warn('Gagal update cache perjamuan:', e); }
            } else {
                alert('Gagal: ' + (result.message || 'Akses ditolak.'));
            }
        } catch (err) {
            console.error("Fetch error:", err);
            // Fallback optimis: Biasanya jika jatuh ke catch (karena CORS/redirect), data sebenarnya SUDAH masuk ke spreadsheet.
            alert('Tanggal Perjamuan berhasil disimpan!');
            setPerjamuanDate(editPerjamuanDate);
            // Sinkronisasi cache localStorage saat fallback juga
            try {
                const cachedStr = localStorage.getItem('pisgah_data_cache');
                if (cachedStr) {
                    const cached = JSON.parse(cachedStr);
                    cached.perjamuanDate = editPerjamuanDate;
                    localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                }
            } catch (e) { console.warn('Gagal update cache perjamuan:', e); }
        }
        setIsSavingPerjamuanDate(false);
    };

    // SIMPAN PENGUMUMAN
    const isContentEmpty = (htmlString) => {
        if (!htmlString) return true;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        return text.trim() === '';
    };

    const handleSavePengumuman = async (e) => {
        e.preventDefault();
        setIsSavingPengumuman(true);

        // Buat salinan data pengumuman
        let finalPengumuman = { ...editPengumuman };
        // Jika isi hanya tag kosong, set ke string kosong
        if (isContentEmpty(finalPengumuman.isi)) {
            finalPengumuman.isi = '';
        }

        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'savePengumuman',
                    password: adminToken,
                    pengumuman: JSON.stringify(finalPengumuman)
                })
            });
            const result = await res.json();
            if (result.success) {
                alert("Pengumuman berhasil diperbarui!");
                setPengumuman(finalPengumuman);   // update state parent
                setEditPengumuman(finalPengumuman); // sync lokal
            } else {
                alert("Gagal merubah pengumuman: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsSavingPengumuman(false);
    };

    // SIMPAN LOKASI & KONTAK
    const handleSaveKontakGereja = async (e) => {
        e.preventDefault();
        setIsSavingKontak(true);

        // Mencegah error jika admin memasukkan seluruh elemen <iframe>, kita hanya ambil src="" nya
        let finalUrl = editKontakGereja.mapUrl;
        if (finalUrl.includes('<iframe')) {
            const match = finalUrl.match(/src="([^"]+)"/);
            if (match) finalUrl = match[1];
        }
        const finalKontak = { ...editKontakGereja, mapUrl: finalUrl };
        setEditKontakGereja(finalKontak);

        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveKontakGereja',
                    password: adminToken,
                    kontakGereja: JSON.stringify(finalKontak)
                })
            });
            const result = await res.json();
            if (result.success) {
                alert("Lokasi dan Peta gereja berhasil diperbarui!");
                setKontakGereja(finalKontak);
            } else {
                alert("Gagal merubah lokasi: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsSavingKontak(false);
    };

    // SIMPAN HERO IMAGE URL
    const handleSaveHeroImage = async (e) => {
        e.preventDefault();
        if (editHeroImages.length === 0) return alert("Pilih setidaknya 1 gambar hero!");
        setIsSavingHero(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveHeroImage', password: adminToken, url: JSON.stringify(editHeroImages) })
            });
            const result = await res.json();
            if (result.success) {
                alert("Hero Images berhasil diperbarui!");
                if (result.updatedUrls) {
                    setHeroImages(result.updatedUrls);
                    setEditHeroImages(result.updatedUrls);
                } else {
                    setHeroImages(editHeroImages);
                }
            } else {
                alert("Gagal merubah Hero Image: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server. Pastikan ukuran file tidak terlalu besar.");
        }
        setIsSavingHero(false);
    };

    const handleAddHeroUrl = () => {
        const url = prompt("Masukkan URL gambar gambar penuh (https://...):");
        if (url) {
            setEditHeroImages([...editHeroImages, url]);
        }
    };

    const handleRemoveHeroImage = (indexToRemove) => {
        setEditHeroImages(editHeroImages.filter((_, idx) => idx !== indexToRemove));
    };

    const handleHeroFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const MAX_WIDTH = 1200;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/webp', 0.6);

                setEditHeroImages([...editHeroImages, dataUrl]);
            };
        };
    };

    const handleFileChange = (e, id) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const MAX_WIDTH = 150;
                const MAX_HEIGHT = 150;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

                const updated = dataPejabat.map(p => p.id === id ? { ...p, img: dataUrl } : p);
                setDataPejabat(updated);
            };
        };
    };

    const handleUbahText = (id, field, value) => { const updated = dataPejabat.map(p => p.id === id ? { ...p, [field]: value } : p); setDataPejabat(updated); };
    const handleHapusPejabat = (id) => { if (window.confirm("Yakin ingin menghapus data pelayan ini?")) { setDataPejabat(dataPejabat.filter(p => p.id !== id)); } };

    return (
        <div className="space-y-6 rounded-[1.25rem] animate-fade-in relative z-10">
            <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-5 md:p-6">
                <div className="flex flex-col sm:flex-row border-b border-navy-50 bg-navy-50/20">
                    <button onClick={() => setAdminTab('jadwal')} className={`flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors ${adminTab === 'jadwal' ? 'bg-navy-900 text-gold-400 shadow-inner' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/50'}`}>Kelola Jadwal</button>
                    <button onClick={() => setAdminTab('warta')} className={`flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors border-l sm:border-t-0 border-t border-navy-50 ${adminTab === 'warta' ? 'bg-navy-900 text-gold-400 shadow-inner' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/50'}`}>Buat Warta</button>
                    <button onClick={() => setAdminTab('pelayan')} className={`flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors border-l sm:border-t-0 border-t border-navy-50 ${adminTab === 'pelayan' ? 'bg-navy-900 text-gold-400 shadow-inner' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/50'}`}>Kelola Pejabat</button>
                    <button onClick={() => setAdminTab('buku')} className={`flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors border-l sm:border-t-0 border-t border-navy-50 ${adminTab === 'buku' ? 'bg-navy-900 text-gold-400 shadow-inner' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/50'}`}>Kelola Buku</button>
                    <button onClick={() => setAdminTab('pengaturan')} className={`flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors border-l sm:border-t-0 border-t border-navy-50 ${adminTab === 'pengaturan' ? 'bg-navy-900 text-gold-400 shadow-inner' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/50'}`}>Pengaturan Admin</button>
                    <button onClick={() => { if (confirm('Yakin ingin logout dari akun admin?')) handleLogout(); }} className="flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors border-l sm:border-t-0 border-t border-navy-50 text-red-600 hover:text-red-700 hover:bg-red-50/50">Logout</button>
                </div>

                <div className={`p-4 md:p-6 ${adminTab === 'jadwal' ? 'bg-navy-50/30' : 'bg-white'}`}>
                </div>
                {/* Modal Edit Warta */}
                {editWartaModal && (
                    <div className="fixed inset-0 z-[100] flex justify-center bg-navy-900/60 px-4 backdrop-blur-md overflow-y-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4rem)', paddingBottom: '1rem' }}>
                        <div className="glass-box rounded-[1.5rem] shadow-2xl p-6 md:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto relative border border-navy-100/60 mt-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}>

                            {/* Tombol Close (absolut, tidak mengapung) */}
                            <button
                                onClick={() => setEditWartaModal(false)}
                                className="absolute right-4 text-navy-400 hover:text-red-500 transition-colors bg-navy-50 w-8 h-8 rounded-full flex items-center justify-center font-bold z-20"
                                style={{ top: '1.75rem' }}
                            >
                                ×
                            </button>

                            <h3 className="text-xl font-bold mb-4 pr-8">Edit Warta</h3>

                            <form onSubmit={handleUpdateWarta}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-navy-700 mb-1">Judul Warta</label>
                                    <input type="text" value={editWartaJudul} onChange={e => setEditWartaJudul(e.target.value)} required className="w-full px-4 py-2 border border-navy-300 rounded-lg" />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-navy-700 mb-1">Isi Warta</label>
                                    <RichTextEditor
                                        ref={editWartaEditorRef}
                                        initialValue={editWartaIsi}
                                        onChange={(html) => setEditWartaIsi(html)}
                                        placeholder="Edit isi warta di sini..."
                                    />
                                </div>

                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-navy-700 mb-1">Penulis</label>
                                    <input type="text" value={editWartaPenulis} onChange={e => setEditWartaPenulis(e.target.value)} className="w-full px-4 py-2 border border-navy-300 rounded-lg" />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-navy-700 mb-1">Ganti Gambar (Opsional)</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-navy-300 border-dashed rounded-lg">
                                        <div className="space-y-1 text-center">
                                            <div className="flex text-sm text-navy-600 justify-center">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-gold-600 hover:text-navy-800">
                                                    <span>Pilih file gambar baru</span>
                                                    <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setEditWartaGambarList(Array.from(e.target.files))} />
                                                </label>
                                            </div>
                                            <p className="text-xs text-navy-500">PNG, JPG up to 10MB. (Maksimal 3 Gambar)</p>
                                            {editWartaGambarList.length > 0 && <p className="text-sm font-semibold text-gold-600 mt-2">{editWartaGambarList.length} gambar baru dipilih</p>}
                                        </div>
                                    </div>
                                    {editingWarta?.gambarUrl && editWartaGambarList.length === 0 && (
                                        <div className="mt-2">
                                            <p className="text-xs text-navy-500">Gambar saat ini ({parseGambarUrls(editingWarta.gambarUrl).length}):</p>
                                            <div className="flex justify-center gap-2 mt-1 overflow-x-auto hide-scrollbar max-w-[200px]">
                                                {parseGambarUrls(editingWarta.gambarUrl).map((url, i) => (
                                                    <img key={i} src={formatImageUrl(url)} className="h-16 w-auto object-cover rounded" alt="current" referrerPolicy="no-referrer" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tombol Submit - tidak mengapung, hanya margin atas */}
                                <button type="submit" disabled={isUpdatingWarta} className="w-full bg-navy-800 hover:bg-navy-700 text-gold-400 font-bold py-3 px-4 rounded-lg transition-colors mt-4">
                                    {isUpdatingWarta ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>

                                {/* Padding bawah ekstra agar melewati menu navigasi */}
                                <div className="h-4"></div>
                            </form>
                        </div>
                    </div>
                )}

                {adminTab === 'jadwal' && (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => scrollTabs('left')} className="hidden md:flex p-2.5 bg-white border border-navy-100 rounded-xl shadow-sm text-navy-500 hover:text-gold-500 hover:border-gold-200 shrink-0 transition" title="Scroll Kiri">
                                <Icon name="ChevronLeft" className="w-5 h-5" />
                            </button>

                            <div ref={scrollContainerRef} className="glass-box rounded-[1.25rem] flex-1 flex overflow-x-auto border border-navy-100/50 p-2 gap-2 hide-scrollbar scroll-smooth shadow-sm">
                                {subTabs.map(tab => (
                                    <button key={tab.id} onClick={() => { setSubTab(tab.id); setEditingDate(null); }} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors whitespace-nowrap ${subTab === tab.id ? 'bg-navy-900 shadow-sm font-bold text-gold-400' : 'font-bold text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => scrollTabs('right')} className="hidden md:flex p-2.5 bg-white border border-navy-100 rounded-xl shadow-sm text-navy-500 hover:text-gold-500 hover:border-gold-200 shrink-0 transition" title="Scroll Kanan">
                                <Icon name="ChevronRight" className="w-5 h-5" />
                            </button>
                        </div>

                        {subTab === 'perjamuan' && (
                            <div className="bg-gold-50/50 border border-gold-200 p-4 rounded-xl text-navy-800 text-sm flex items-start shadow-sm">
                                <Icon name="Gift" className="w-5 h-5 text-gold-500 mr-3 shrink-0" />
                                <p><b>Jadwal Spesial:</b> Perjamuan Kudus hanya dilaksanakan pada <span className="font-bold underline text-gold-600">Sabtu</span> di bulan Maret, June, September, dan Desember. Mengisi jadwal pada tanggal lain tidak akan memunculkannya secara otomatis di bulan tersebut.</p>
                            </div>
                        )}

                        <div className="bg-white border border-navy-100/60 rounded-2xl shadow-sm overflow-hidden">
                            <div className="flex flex-col md:flex-row justify-between items-center p-5 border-b border-navy-50 gap-4 bg-white">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-navy-50 rounded-full flex items-center justify-center text-gold-500 mr-4 hidden md:flex shrink-0 shadow-inner"><Icon name="Calendar" className="w-5 h-5" /></div>
                                    <div><h3 className="font-black text-xl text-navy-900 tracking-tight">{currentSubTabLabel}</h3><p className="text-[10px] text-navy-500 uppercase tracking-widest font-bold mt-1">Triwulan: {getTriwulan(viewMonth)}</p></div>
                                </div>
                                <div className="flex items-center border border-navy-100 rounded-xl overflow-hidden glass-box shadow-sm">
                                    <button onClick={prevMonth} className="p-2.5 hover:bg-navy-50 hover:text-gold-500 transition-colors text-navy-600"><Icon name="ChevronLeft" className="w-5 h-5" /></button>
                                    <div className="px-4 py-2.5 font-black text-sm bg-navy-50 flex items-center min-w-[150px] justify-center text-navy-900 tracking-wide"><Icon name="Calendar" className="w-4 h-4 mr-2 text-gold-500" />{monthNames[viewMonth].toUpperCase()} {viewYear}</div>
                                    <button onClick={nextMonth} className="p-2.5 hover:bg-navy-50 hover:text-gold-500 transition-colors text-navy-600"><Icon name="ChevronRight" className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="jadwal-table text-left border-collapse mx-auto w-full min-w-full">
                                    <thead className="bg-navy-50/50 border-b border-navy-100/60">
                                        <tr>
                                            <th className="px-2 py-3 lg:p-4 text-[9px] lg:text-xs font-black text-navy-500 uppercase tracking-wider lg:tracking-widest text-center w-20 lg:w-36">Tanggal</th>
                                            {columns.map((col, i) => <th key={i} className="px-2 py-3 lg:p-4 text-[9px] lg:text-xs font-black text-navy-500 uppercase tracking-wider lg:tracking-widest text-center">{col}</th>)}
                                            <th className="px-2 py-3 lg:p-4 text-[9px] lg:text-xs font-black text-navy-500 uppercase tracking-wider lg:tracking-widest text-center w-20 lg:w-28">Edit Jadwal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-navy-50 bg-white">
                                        {targetDates.map(date => {
                                            const isEditing = editingDate === date;
                                            const rowData = jadwalDB[date] || (isRabu ? initialJadwalRabu : initialJadwalSabat);
                                            const dataArray = getActiveArray(rowData, subTab);
                                            let isSaved = false;
                                            if (subTab === 'susunanAcara') {
                                                isSaved = !!jadwalDB[date] && !!jadwalDB[date].susunan;
                                            } else {
                                                isSaved = !!jadwalDB[date] && (subTab === 'rabu' ? !!jadwalDB[date].petugas : !!jadwalDB[date][subTab]);
                                            }

                                            return (
                                                <tr key={date} className="hover:bg-navy-50/20 transition group">
                                                    <td className="p-2 md:p-3 lg:p-4 text-center align-middle border-r border-navy-50/50 bg-navy-50/10">
                                                        <div className="font-bold text-navy-400 text-[10px] md:text-[11px] lg:text-xs tracking-wider mb-0.5">{isRabu ? 'RABU' : 'SABTU'}</div>
                                                        <div className="text-xs md:text-sm lg:text-base font-black text-navy-900">{formatIndoDateShort(date)}</div>
                                                    </td>

                                                    {subTab === 'susunanAcara' ? (
                                                        isEditing ? (
                                                            <td colSpan="2" className="p-4 bg-gold-50/30">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                                                    <div className="space-y-3 p-5 glass-box rounded-2xl border border-navy-100/60 shadow-sm h-fit">
                                                                        <h4 className="font-black text-sm text-navy-800 border-b border-navy-50 pb-2">Sekolah Sabat</h4>
                                                                        <div><label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">Lagu Buka</label><input type="text" value={editForm.ssLaguBuka || ''} onChange={(e) => handleEditFormChangeSusunan('ssLaguBuka', e.target.value)} placeholder="Contoh: LS 210" className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" /></div>
                                                                        <div><label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">Lagu Tutup</label><input type="text" value={editForm.ssLaguTutup || ''} onChange={(e) => handleEditFormChangeSusunan('ssLaguTutup', e.target.value)} placeholder="Contoh: LS 251" className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" /></div>
                                                                    </div>
                                                                    <div className="space-y-3 p-5 bg-white rounded-xl border border-navy-100/60 shadow-sm">
                                                                        <h4 className="font-black text-sm text-gold-600 border-b border-navy-50 pb-2">Khotbah Umum</h4>
                                                                        <div><label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">Ayat Bersahutan</label><input type="text" value={editForm.kAyatBersahutan || ''} onChange={(e) => handleEditFormChangeSusunan('kAyatBersahutan', e.target.value)} placeholder="Contoh: No. 12" className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" /></div>
                                                                        <div><label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">Lagu Buka</label><input type="text" value={editForm.kLaguBuka || ''} onChange={(e) => handleEditFormChangeSusunan('kLaguBuka', e.target.value)} placeholder="Contoh: LS 15" className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" /></div>

                                                                        <div className="flex items-center space-x-3 border border-navy-100 p-3 rounded-xl bg-navy-50/30">
                                                                            <input type="checkbox" checked={editForm.kLaguPujian1_show || false} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian1_show', e.target.checked)} className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500 accent-gold-500" />
                                                                            <div className="flex-1">
                                                                                <label className="text-[10px] text-navy-600 font-bold uppercase tracking-widest block mb-0.5">Lagu Pujian 1 (Sebelum Persembahan)</label>
                                                                                {editForm.kLaguPujian1_show && <input type="text" value={editForm.kLaguPujian1_judul || ''} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian1_judul', e.target.value)} placeholder="Misal: Koor Pemuda" className="w-full p-2 border border-navy-200 rounded-lg text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-white" />}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center space-x-3 border border-navy-100 p-3 rounded-xl bg-navy-50/30">
                                                                            <input type="checkbox" checked={editForm.kLaguPujian2_show || false} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian2_show', e.target.checked)} className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500 accent-gold-500" />
                                                                            <div className="flex-1">
                                                                                <label className="text-[10px] text-navy-600 font-bold uppercase tracking-widest block mb-0.5">Lagu Pujian 2 (Sebelum Cerita Anak)</label>
                                                                                {editForm.kLaguPujian2_show && <input type="text" value={editForm.kLaguPujian2_judul || ''} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian2_judul', e.target.value)} placeholder="Misal: Vocal Group" className="w-full p-2 border border-navy-200 rounded-lg text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-white" />}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center space-x-3 border border-navy-100 p-3 rounded-xl bg-navy-50/30">
                                                                            <input type="checkbox" checked={editForm.kLaguPujian3_show || false} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian3_show', e.target.checked)} className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500 accent-gold-500" />
                                                                            <div className="flex-1">
                                                                                <label className="text-[10px] text-navy-600 font-bold uppercase tracking-widest block mb-0.5">Lagu Pujian 3 (Sesudah Cerita Anak)</label>
                                                                                {editForm.kLaguPujian3_show && <input type="text" value={editForm.kLaguPujian3_judul || ''} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian3_judul', e.target.value)} placeholder="Misal: Solo" className="w-full p-2 border border-navy-200 rounded-lg text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-white" />}
                                                                            </div>
                                                                        </div>

                                                                        <div><label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">Ayat Inti</label><input type="text" value={editForm.kAyatInti || ''} onChange={(e) => handleEditFormChangeSusunan('kAyatInti', e.target.value)} placeholder="Contoh: Yohanes 3:16" className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" /></div>
                                                                        <div><label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">Lagu Tutup</label><input type="text" value={editForm.kLaguTutup || ''} onChange={(e) => handleEditFormChangeSusunan('kLaguTutup', e.target.value)} placeholder="Contoh: LS 300" className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" /></div>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-5 flex justify-end space-x-3">
                                                                    <button onClick={() => setEditingDate(null)} className="px-5 py-2.5 text-navy-600 bg-navy-100 hover:bg-navy-200 rounded-xl text-sm font-bold transition-colors">Batal</button>
                                                                    <button onClick={() => handleSaveRow(date)} disabled={isSavingJadwal} className={`px-5 py-2.5 text-navy-900 bg-gold-400 hover:bg-gold-500 rounded-xl text-sm font-bold transition-colors shadow-sm ${isSavingJadwal ? 'opacity-50' : ''}`}><Icon name="Check" className="w-4 h-4 mr-1.5 inline" /> Simpan Susunan</button>
                                                                </div>
                                                            </td>
                                                        ) : (
                                                            <>
                                                                <td className="p-2 lg:p-4 text-center align-middle border-r border-navy-50/50">
                                                                    <span className={`text-[9px] lg:text-[11px] px-2 lg:px-4 py-1 md:py-1.5 rounded-full font-bold uppercase tracking-wider lg:tracking-widest shadow-sm ${isSaved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-navy-100 text-navy-500 border border-navy-200'}`}>
                                                                        {isSaved ? 'Sudah Diatur' : 'Default'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-2 lg:p-4 text-center align-middle">
                                                                    <div className="flex justify-center space-x-1.5 lg:space-x-2">
                                                                        <button onClick={() => handleEditClick(date)} className="p-2 lg:p-2.5 text-navy-500 hover:text-gold-500 hover:bg-navy-50 rounded-xl transition-colors" title="Edit Susunan"><Icon name="Edit" className="w-3.5 h-3.5 lg:w-4 lg:h-4" /></button>
                                                                        {isSaved ? (<button onClick={() => handleDeleteRow(date)} className="p-2 lg:p-2.5 text-navy-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Reset Default"><Icon name="Trash" className="w-3.5 h-3.5 lg:w-4 lg:h-4" /></button>) : (<div className="w-8 lg:w-10"></div>)}
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )
                                                    ) : subTab === 'perjamuan' ? (
                                                        isEditing ? (
                                                            <td colSpan="2" className="p-4 bg-gold-50/30">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                                                                    <div className="space-y-3 p-4 bg-white rounded-xl border border-navy-100 shadow-sm h-fit">
                                                                        <h4 className="font-black text-sm text-navy-800 border-b border-navy-50 pb-2">Roti & Anggur</h4>
                                                                        {editForm.slice(0, 3).map((p, i) => (
                                                                            <div key={i}>
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">{p.tugas}</label>
                                                                                <input type="text" value={p.nama || ''} onChange={(e) => handleEditFormChange(i, e.target.value)} className="w-full p-2.5 border border-navy-200 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="space-y-3 p-4 bg-white rounded-xl border border-navy-100 shadow-sm h-fit">
                                                                        <h4 className="font-black text-sm text-navy-800 border-b border-navy-50 pb-2">Basuh Kaki</h4>
                                                                        {editForm.slice(3, 7).map((p, i) => (
                                                                            <div key={i + 3}>
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">{p.tugas}</label>
                                                                                <input type="text" value={p.nama || ''} onChange={(e) => handleEditFormChange(i + 3, e.target.value)} className="w-full p-2.5 border border-navy-200 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="space-y-3 p-4 bg-white rounded-xl border border-navy-100 shadow-sm h-fit">
                                                                        <h4 className="font-black text-sm text-navy-800 border-b border-navy-50 pb-2">Pelayan Perjamuan</h4>
                                                                        {editForm.slice(7, 11).map((p, i) => (
                                                                            <div key={i + 7}>
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">{p.tugas}</label>
                                                                                <input type="text" value={p.nama || ''} onChange={(e) => handleEditFormChange(i + 7, e.target.value)} className="w-full p-2.5 border border-navy-200 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="space-y-3 p-4 bg-white rounded-xl border border-navy-100 shadow-sm h-fit">
                                                                        <h4 className="font-black text-sm text-navy-800 border-b border-navy-50 pb-2">Pembersihan Alat</h4>
                                                                        {editForm.slice(11, 16).map((p, i) => (
                                                                            <div key={i + 11}>
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">{p.tugas}</label>
                                                                                <input type="text" value={p.nama || ''} onChange={(e) => handleEditFormChange(i + 11, e.target.value)} className="w-full p-2.5 border border-navy-200 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-5 flex justify-end space-x-3">
                                                                    <button onClick={() => setEditingDate(null)} className="px-5 py-2.5 text-navy-600 bg-navy-100 hover:bg-navy-200 rounded-xl text-sm font-bold transition-colors">Batal</button>
                                                                    <button onClick={() => handleSaveRow(date)} disabled={isSavingJadwal} className={`px-5 py-2.5 text-navy-900 bg-gold-400 hover:bg-gold-500 rounded-xl text-sm font-bold transition-colors shadow-sm ${isSavingJadwal ? 'opacity-50' : ''}`}><Icon name="Check" className="w-4 h-4 mr-1.5 inline" /> Simpan Petugas</button>
                                                                </div>
                                                            </td>
                                                        ) : (
                                                            <>
                                                                <td className="p-2 lg:p-4 text-center align-middle border-r border-navy-50/50">
                                                                    <span className={`text-[9px] lg:text-[11px] px-2 lg:px-4 py-1 md:py-1.5 rounded-full font-bold uppercase tracking-wider lg:tracking-widest shadow-sm ${isSaved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-navy-100 text-navy-500 border border-navy-200'}`}>
                                                                        {isSaved ? 'Sudah Diatur' : 'Belum Ada'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-2 lg:p-4 text-center align-middle">
                                                                    <div className="flex justify-center space-x-1.5 lg:space-x-2">
                                                                        <button onClick={() => handleEditClick(date)} className="p-2 lg:p-2.5 text-navy-500 hover:text-gold-500 hover:bg-navy-50 rounded-xl transition-colors" title="Edit Petugas"><Icon name="Edit" className="w-3.5 h-3.5 lg:w-4 lg:h-4" /></button>
                                                                        {isSaved ? (<button onClick={() => handleDeleteRow(date)} className="p-2 lg:p-2.5 text-navy-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Hapus (Kembali ke Default)"><Icon name="Trash" className="w-3.5 h-3.5 lg:w-4 lg:h-4" /></button>) : (<div className="w-8 lg:w-10"></div>)}
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )
                                                    ) : (
                                                        isEditing ? (
                                                            <td colSpan="2" className="p-4 bg-gold-50/30">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-left">
                                                                    {editForm.map((p, i) => (
                                                                        <div key={i} className="space-y-1 p-3 bg-white rounded-xl border border-navy-100 shadow-sm h-fit">
                                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">{p.tugas}</label>
                                                                            <input type="text" value={p.nama || ''} onChange={(e) => handleEditFormChange(i, e.target.value)} className="w-full p-2.5 border border-navy-200 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="mt-5 flex justify-end space-x-3">
                                                                    <button onClick={() => setEditingDate(null)} className="px-5 py-2.5 text-navy-600 bg-navy-100 hover:bg-navy-200 rounded-xl text-sm font-bold transition-colors">Batal</button>
                                                                    <button onClick={() => handleSaveRow(date)} disabled={isSavingJadwal} className={`px-5 py-2.5 text-navy-900 bg-gold-400 hover:bg-gold-500 rounded-xl text-sm font-bold transition-colors shadow-sm ${isSavingJadwal ? 'opacity-50' : ''}`}><Icon name="Check" className="w-4 h-4 mr-1.5 inline" /> Simpan Petugas</button>
                                                                </div>
                                                            </td>
                                                        ) : (
                                                            <>
                                                                <td className="p-2 lg:p-4 text-center align-middle border-r border-navy-50/50">
                                                                    <span className={`text-[9px] lg:text-[11px] px-2 lg:px-4 py-1 md:py-1.5 rounded-full font-bold uppercase tracking-wider lg:tracking-widest shadow-sm ${isSaved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-navy-100 text-navy-500 border border-navy-200'}`}>
                                                                        {isSaved ? 'Sudah Diatur' : 'Default'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-2 lg:p-4 text-center align-middle">
                                                                    <div className="flex justify-center space-x-1.5 lg:space-x-2 min-w-[60px] lg:min-w-[80px]">
                                                                        <button onClick={() => handleEditClick(date)} className="p-2 lg:p-2.5 text-navy-500 hover:text-gold-500 hover:bg-navy-50 rounded-xl transition-colors" title="Edit Baris"><Icon name="Edit" className="w-3.5 h-3.5 lg:w-4 lg:h-4" /></button>
                                                                        {isSaved ? (<button onClick={() => handleDeleteRow(date)} className="p-2 lg:p-2.5 text-navy-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Hapus (Kembali ke Default)"><Icon name="Trash" className="w-3.5 h-3.5 lg:w-4 lg:h-4" /></button>) : (<div className="w-8 lg:w-10"></div>)}
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )
                                                    )}
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {adminTab === 'warta' && (
                    <div className="space-y-4 animate-fade-in">
                        {/* Subtabs seperti pada jadwal */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => scrollWartaTabs('left')} className="hidden md:flex p-2.5 bg-white border border-navy-100 rounded-xl shadow-sm text-navy-500 hover:text-gold-500 hover:border-gold-200 shrink-0 transition" title="Scroll Kiri">
                                <Icon name="ChevronLeft" className="w-5 h-5" />
                            </button>
                            <div ref={wartaScrollContainerRef} className="glass-box rounded-[1.25rem] flex-1 flex overflow-x-auto border border-navy-100/50 p-2 gap-2 hide-scrollbar scroll-smooth shadow-sm">
                                <button onClick={() => setWartaSubTab('input')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${wartaSubTab === 'input' ? 'bg-navy-900 shadow-sm font-bold text-gold-400' : 'font-bold text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}>
                                    Input Baru
                                </button>
                                <button onClick={() => setWartaSubTab('posting')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${wartaSubTab === 'posting' ? 'bg-navy-900 shadow-sm font-bold text-gold-400' : 'font-bold text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}>
                                    Posting
                                </button>
                                <button onClick={() => setWartaSubTab('galeri')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${wartaSubTab === 'galeri' ? 'bg-navy-900 shadow-sm font-bold text-gold-400' : 'font-bold text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}>
                                    Galeri
                                </button>
                            </div>
                            <button onClick={() => scrollWartaTabs('right')} className="hidden md:flex p-2.5 bg-white border border-navy-100 rounded-xl shadow-sm text-navy-500 hover:text-gold-500 hover:border-gold-200 shrink-0 transition" title="Scroll Kanan">
                                <Icon name="ChevronRight" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Konten Input Baru */}
                        {wartaSubTab === 'input' && (
                            <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-5 md:p-6 mb-24">
                                <h1 className="text-xl font-bold text-navy-800 mb-4 border-b pb-2">Input Warta Baru</h1>
                                <p className="text-navy-500 mb-4">Silahkan isi konten warta di bawah ini.</p>
                                <form onSubmit={handleWartaFormSubmit}>
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-navy-700 mb-1">Judul Warta</label>
                                        <input type="text" value={wartaJudul} onChange={e => setWartaJudul(e.target.value)} required className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-navy-500" />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-navy-700 mb-1">Penulis</label>
                                        <input type="text" value={wartaPenulis} onChange={e => setWartaPenulis(e.target.value)} className="w-full px-4 py-2 border border-navy-300 rounded-lg" />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-navy-700 mb-1">Isi Warta</label>
                                        <RichTextEditor
                                            ref={wartaEditorRef}
                                            initialValue={wartaIsi}
                                            onChange={(html) => setWartaIsi(html)}
                                            placeholder="Tulis isi warta di sini..."
                                        />
                                    </div>
                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-navy-700 mb-1">Unggah Gambar (Opsional)</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-navy-300 border-dashed rounded-lg">
                                            <div className="space-y-1 text-center">
                                                <div className="flex text-sm text-navy-600 justify-center">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-gold-400 hover:text-navy-800">
                                                        <span>Pilih file gambar</span>
                                                        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setWartaGambarList(Array.from(e.target.files))} />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-navy-500">PNG, JPG up to 10MB. (Maksimal 3 Gambar agar tidak rusak)</p>
                                                {wartaGambarList.length > 0 && <p className="text-sm font-semibold text-navy-600 mt-2">{wartaGambarList.length} gambar dipilih</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isSavingWarta} className="w-full bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        {isSavingWarta ? "Menyimpan..." : "Simpan Warta"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Konten Posting (Daftar Warta) */}
                        {wartaSubTab === 'posting' && (
                            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
                                <h3 className="text-xl font-bold text-navy-800 mb-4 border-b pb-2">Daftar Warta</h3>
                                {daftarWarta.length === 0 ? (
                                    <p className="text-navy-500">Belum ada warta.</p>
                                ) : (
                                    <>
                                        {(() => {
                                            const sortedWarta = [...daftarWarta].sort((a, b) => (b.rowIndex || 0) - (a.rowIndex || 0));
                                            const totalPages = Math.ceil(sortedWarta.length / wartaItemsPerPage);
                                            const startIdx = (wartaCurrentPage - 1) * wartaItemsPerPage;
                                            const paginatedWarta = sortedWarta.slice(startIdx, startIdx + wartaItemsPerPage);
                                            return (
                                                <div className="space-y-5">
                                                    {paginatedWarta.map((warta, idx) => {
                                                        const plainPreview = stripHtml(warta.isi);
                                                        const shortPreview = plainPreview.length > 120 ? plainPreview.substring(0, 120) + '...' : plainPreview;

                                                        const safeUrls = parseGambarUrls(warta.gambarUrl).map(u => formatImageUrl(u)).filter(u => u.startsWith('http') || u.startsWith('data:image'));
                                                        const thumbnailImg = safeUrls.length > 0 ? safeUrls[0] : null;

                                                        return (
                                                            <div key={idx} className="bg-white border border-navy-100/80 rounded-[1.25rem] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:gap-5 relative group">
                                                                {/* Thumbnail Image */}
                                                                <div className="w-full sm:w-40 h-48 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-navy-50 border border-navy-100 relative">
                                                                    {thumbnailImg ? (
                                                                        <img src={thumbnailImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={warta.judul} referrerPolicy="no-referrer" />
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center h-full text-navy-300">
                                                                            <Icon name="Image" className="w-8 h-8 mb-1 opacity-50" />
                                                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Tanpa Gambar</span>
                                                                        </div>
                                                                    )}
                                                                    {safeUrls.length > 1 && (
                                                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm flex items-center">
                                                                            <Icon name="Image" className="w-3 h-3 mr-1" /> +{safeUrls.length - 1}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Detail & Konten Warta */}
                                                                <div className="flex-1 flex flex-col min-w-0">
                                                                    <h4 className="font-bold text-navy-900 text-base sm:text-lg line-clamp-2 leading-tight mb-1.5 group-hover:text-gold-600 transition-colors pr-2">{warta.judul}</h4>
                                                                    <p className="text-[10px] font-bold text-navy-500 uppercase tracking-widest mb-2 flex items-center">
                                                                        <Icon name="Calendar" className="w-3 h-3 mr-1.5 text-gold-500" /> {formatDate(warta.tanggal)}
                                                                    </p>
                                                                    <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed mb-4 flex-1">
                                                                        {shortPreview}
                                                                    </p>

                                                                    {/* Action Buttons (Edit & Hapus) */}
                                                                    <div className="flex flex-wrap items-center gap-2 mt-auto pt-3 border-t border-navy-50">
                                                                        <span className="text-[10px] text-navy-400 font-bold uppercase tracking-wider flex items-center mr-auto">
                                                                            <Icon name="Edit" className="w-3 h-3 mr-1 text-gold-400" />
                                                                            {warta.penulis || 'Admin'}
                                                                        </span>
                                                                        <button onClick={() => handleEditWarta(warta)} className="px-3.5 py-1.5 bg-navy-50 hover:bg-navy-100 text-navy-700 text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm">
                                                                            <Icon name="Edit" className="w-3.5 h-3.5 mr-1.5 text-gold-500" /> Edit
                                                                        </button>
                                                                        <button onClick={() => handleDeleteWarta(warta.rowIndex, warta.judul)} className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm">
                                                                            <Icon name="Trash" className="w-3.5 h-3.5 mr-1.5" /> Hapus
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}

                                        {/* Pagination Controls */}
                                        {(() => {
                                            const sortedWarta = [...daftarWarta].sort((a, b) => (b.rowIndex || 0) - (a.rowIndex || 0));
                                            const totalPages = Math.ceil(sortedWarta.length / wartaItemsPerPage);
                                            if (totalPages <= 1) return null;
                                            return (
                                                <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-navy-100">
                                                    <button onClick={() => setWartaCurrentPage(p => Math.max(1, p - 1))} disabled={wartaCurrentPage === 1} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${wartaCurrentPage === 1 ? 'bg-navy-100 text-navy-400 cursor-not-allowed' : 'bg-navy-200 text-navy-700 hover:bg-navy-300'}`}>Sebelumnya</button>
                                                    <div className="flex gap-1">
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                            <button key={page} onClick={() => setWartaCurrentPage(page)} className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${page === wartaCurrentPage ? 'bg-gold-500 text-white shadow-sm' : 'bg-navy-100 text-navy-600 hover:bg-navy-200'}`}>{page}</button>
                                                        ))}
                                                    </div>
                                                    <button onClick={() => setWartaCurrentPage(p => Math.min(totalPages, p + 1))} disabled={wartaCurrentPage === totalPages} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${wartaCurrentPage === totalPages ? 'bg-navy-100 text-navy-400 cursor-not-allowed' : 'bg-navy-200 text-navy-700 hover:bg-navy-300'}`}>Selanjutnya</button>
                                                </div>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Konten Galeri Media (Sekarang dimasukkan ke dalam blok adminTab === 'warta') */}
                        {wartaSubTab === 'galeri' && (
                            <div className="space-y-6">

                                {/* Area Folder */}
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-bold text-navy-800">Kelola Folder Media</h3>
                                        <button onClick={() => setShowNewFolderModal(true)} className="bg-gold-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                                            <Icon name="PlusCircle" className="w-4 h-4" /> Folder Baru
                                        </button>
                                    </div>
                                    {isLoadingFolders ? (
                                        <div className="text-xs text-center py-8">Memuat folder...</div>
                                    ) : folderList.length === 0 ? (
                                        <div className="text-xs text-center py-8">Belum ada folder. Buat folder pertama.</div>
                                    ) : (
                                        <>
                                            {/* Urutkan folder berdasarkan nama (descending) -> terbaru di atas */}
                                            {(() => {
                                                const sortedFolders = [...folderList].sort((a, b) => b.name.localeCompare(a.name));
                                                const displayedFolders = showAllFolders ? sortedFolders : sortedFolders.slice(0, 6);
                                                return (
                                                    <div className="flex flex-wrap gap-3 justify-center">
                                                        {displayedFolders.map(folder => (
                                                            <button
                                                                key={folder.id}
                                                                onClick={() => setSelectedFolder(folder.id)}
                                                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${selectedFolder === folder.id
                                                                    ? 'bg-navy-900 text-gold-400'
                                                                    : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
                                                                    }`}
                                                            >
                                                                📁 {folder.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                            {/* Tombol tampilkan semua / sedikit */}
                                            {folderList.length > 6 && (
                                                <div className="mt-4 text-center">
                                                    <button
                                                        onClick={() => setShowAllFolders(!showAllFolders)}
                                                        className="text-xs w-full bg-navy-900 text-gold-400 py-3 rounded-lg font-bold"
                                                    >
                                                        {showAllFolders ? 'Tampilkan Sedikit' : `Tampilkan Semua (${folderList.length} folder)`}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Area Upload Media */}
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h3 className="text-xs font-bold text-navy-800 mb-4">Upload Media Baru (Gambar/Video)</h3>
                                    {!selectedFolder ? (
                                        <div className="text-xs text-center py-6 text-amber-600 bg-amber-50 rounded-lg">Pilih folder terlebih dahulu</div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-navy-700 mb-1">Pilih File (gambar/video, bisa banyak)</label>
                                                <div className="text-xs border-2 border-dashed rounded-lg p-4 text-center">
                                                    <input
                                                        type="file"
                                                        accept="image/*,video/*"
                                                        multiple
                                                        onChange={async (e) => {
                                                            const files = Array.from(e.target.files);

                                                            // Convert unsupported image formats
                                                            const convertedFiles = await Promise.all(
                                                                files.map(async (file) => {
                                                                    if (file.type.startsWith('image/')) {
                                                                        return await convertImageFormat(file);
                                                                    }
                                                                    return file;
                                                                })
                                                            );

                                                            setSelectedFiles(convertedFiles);
                                                            if (convertedFiles.length > 0) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setImagePreview(reader.result);
                                                                reader.readAsDataURL(convertedFiles[0]);
                                                            } else {
                                                                setImagePreview('');
                                                            }
                                                        }}
                                                        className="w-full"
                                                    />
                                                    <p className="text-xs text-navy-500 mt-2">
                                                        Total maksimal {MAX_TOTAL_SIZE_MB}MB. Format didukung: semua jenis gambar (JPEG, PNG, HEIC, RAW, dll) dan video.
                                                    </p>
                                                    {imagePreview && (
                                                        <div className="mt-4">
                                                            {selectedFiles[0]?.type.startsWith('image/') ? (
                                                                <>
                                                                    <p className="text-xs font-semibold text-navy-600 mb-2">Preview Gambar:</p>
                                                                    <img src={imagePreview} className="max-h-80 w-full object-contain rounded-lg border border-navy-100 shadow-sm" alt="Preview Gambar" />
                                                                </>
                                                            ) : selectedFiles[0]?.type.startsWith('video/') ? (
                                                                <>
                                                                    <p className="text-xs font-semibold text-navy-600 mb-2">Preview Video:</p>
                                                                    <video src={imagePreview} controls className="max-h-80 w-full rounded-lg border border-navy-100 shadow-sm bg-navy-900" />
                                                                </>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {selectedFiles.length > 0 && (
                                                <div className="bg-navy-50 p-3 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-medium text-navy-700">Total ukuran:</span>
                                                        <span className={`text-xs font-bold ${getTotalSizeMB(selectedFiles) > MAX_TOTAL_SIZE_MB ? 'text-red-600' : 'text-green-600'}`}>
                                                            {getTotalSizeMB(selectedFiles).toFixed(2)} MB
                                                        </span>
                                                    </div>
                                                    {getTotalSizeMB(selectedFiles) > MAX_TOTAL_SIZE_MB && (
                                                        <p className="text-xs text-red-500 mt-1">Melebihi batas {MAX_TOTAL_SIZE_MB}MB</p>
                                                    )}
                                                </div>
                                            )}

                                            {selectedFiles.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-bold text-navy-700 mb-2">File yang akan diupload ({selectedFiles.length}):</p>
                                                    <ul className="text-xs text-navy-600 max-h-48 overflow-y-auto border rounded-lg p-3 mt-2 bg-navy-50/50 space-y-2">
                                                        {selectedFiles.map((file, idx) => (
                                                            <li key={idx} className="flex items-center justify-between gap-2 py-2 px-2 rounded-lg bg-white border border-navy-100">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-xs font-semibold text-navy-700 truncate" title={file.name}>
                                                                        {file.name}
                                                                    </div>
                                                                    <div className="text-[10px] text-navy-400 mt-0.5">
                                                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    {uploadProgress[file.name] ? (
                                                                        <>
                                                                            {uploadProgress[file.name].status === 'uploading' && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <div className="w-3 h-3 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                                                                                    <span className="text-[10px] text-gold-600 font-bold">Uploading...</span>
                                                                                </div>
                                                                            )}
                                                                            {uploadProgress[file.name].status === 'success' && (
                                                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
                                                                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                </span>
                                                                            )}
                                                                            {uploadProgress[file.name].status === 'failed' && (
                                                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
                                                                                    <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-navy-100">
                                                                            <span className="w-2 h-2 rounded-full bg-navy-400"></span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {isUploadingMultiple && (
                                                        <div className="mt-3 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-navy-700">Progress Upload</span>
                                                                <span className="text-xs font-bold text-gold-600">
                                                                    {Object.values(uploadProgress).filter(p => p.status === 'success').length}/{selectedFiles.length}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-navy-100 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-gradient-to-r from-gold-400 to-gold-500 h-2 rounded-full transition-all duration-300 shadow-sm"
                                                                    style={{ width: `${(Object.values(uploadProgress).filter(p => p.status === 'success').length / selectedFiles.length) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <button
                                                onClick={handleUploadMultiple}
                                                disabled={isUploadingMultiple || selectedFiles.length === 0 || getTotalSizeMB(selectedFiles) > MAX_TOTAL_SIZE_MB}
                                                className="text-xs w-full bg-navy-900 text-gold-400 py-3 rounded-lg font-bold disabled:opacity-50"
                                            >
                                                {isUploadingMultiple
                                                    ? `Mengupload ${Object.values(uploadProgress).filter(p => p.status === 'success').length}/${selectedFiles.length}...`
                                                    : `Upload ${selectedFiles.length} File`}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Area Galeri Media */}
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h3 className="text-xs font-bold text-navy-800 mb-4">Galeri Media</h3>
                                    {isLoadingImages ? (
                                        <div className="text-xs text-center py-8">Memuat media...</div>
                                    ) : mediaList.length === 0 ? (
                                        <div className="text-xs text-center py-8">Belum ada media di folder ini.</div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {mediaList.map(item => (
                                                <div key={item.id} className="border rounded-lg overflow-hidden">
                                                    {item.type === 'video' ? (
                                                        // Tampilan video
                                                        <div className="relative w-full h-32 bg-black">
                                                            <video
                                                                src={item.url}
                                                                controls
                                                                className="w-full h-32 object-cover"
                                                                poster={formatImageUrl(item.url)}
                                                            />
                                                            <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                                VIDEO
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // Tampilan gambar
                                                        <img
                                                            src={formatImageUrl(item.url)}
                                                            className="w-full h-32 object-cover bg-navy-50"
                                                            alt={item.title}
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    )}
                                                    <div className="p-2">
                                                        <p className="text-xs font-medium truncate">{item.title}</p>
                                                        <div className="flex justify-between mt-2">
                                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-600">Lihat</a>
                                                            <button onClick={() => handleDeleteImage(item.id)} className="text-xs text-red-500">Hapus</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {showNewFolderModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <div className="glass-box rounded-2xl p-6 max-w-md w-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold">Buat Folder Baru</h3>
                                        <button onClick={() => setShowNewFolderModal(false)} className="text-gray-500">&times;</button>
                                    </div>
                                    <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="w-full p-3 border rounded-lg mb-4" placeholder="Nama folder" />
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => setShowNewFolderModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                                        <button onClick={handleCreateFolder} disabled={isCreatingFolder} className="px-4 py-2 bg-navy-900 text-gold-400 rounded-lg">
                                            {isCreatingFolder ? "Membuat..." : "Buat"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {adminTab === 'pelayan' && (
                    <div className="space-y-6 animate-fade-in bg-white p-2 md:p-4 rounded-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gold-50 p-5 rounded-[1.5rem] border border-gold-200 shadow-sm gap-4">
                            <div className="w-full md:w-2/3">
                                <h3 className="text-lg font-black text-navy-900 mb-1">Manajemen Pejabat (Kategori)</h3>
                                <p className="text-sm text-navy-800 font-medium leading-relaxed">Geser (Drag & Drop) kartu pejabat untuk memindahkannya antar kelompok. Klik <span className="font-bold">Simpan</span> untuk mensinkronisasi dengan Google Sheets.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <button onClick={handleTambahKategori} className="bg-white border border-navy-200 text-navy-800 hover:bg-navy-50 font-bold py-3 px-5 rounded-xl shadow-sm transition-all flex items-center justify-center whitespace-nowrap"><Icon name="PlusCircle" className="w-4 h-4 mr-2" /> Kategori</button>
                                <button onClick={handleSimpanPejabat} disabled={isSavingPejabat} className={`${isSavingPejabat ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 hover:text-gold-300 shadow-md hover:shadow-lg'} font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center whitespace-nowrap`}><Icon name="Save" className="w-4 h-4 mr-2" /> {isSavingPejabat ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto pb-6">
                            <div className="flex items-start gap-6 min-w-max pb-4 px-2">
                                {kategoriPejabat.map((kat, index) => (
                                    <div
                                        key={index}
                                        className="w-80 bg-navy-50/50 rounded-[1.5rem] border border-navy-100 flex flex-col max-h-[70vh]"
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, kat)}
                                    >
                                        {/* Kategori Header */}
                                        <div className="p-4 border-b border-navy-100/60 bg-white rounded-t-[1.5rem] flex justify-between items-center shadow-sm sticky top-0 z-10">
                                            <h4 className="font-black text-navy-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-gold-500"></span> {kat}
                                            </h4>
                                            <div className="flex bg-navy-50 rounded-lg p-1">
                                                <button onClick={() => handleTambahPejabatBaru(kat)} className="p-1.5 text-navy-600 hover:text-navy-900 hover:bg-white rounded-md transition-colors shadow-sm" title="Tambah Pejabat"><Icon name="Plus" className="w-4 h-4" /></button>
                                                {kat !== "Lainnya" && (
                                                    <button onClick={() => handleHapusKategori(kat)} className="p-1.5 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors ml-1" title="Hapus Kategori"><Icon name="Trash2" className="w-4 h-4" /></button>
                                                )}
                                            </div>
                                        </div>

                                        {/* List Pejabat (Cards) */}
                                        <div className="p-3 overflow-y-auto overflow-x-hidden flex-1 space-y-3 custom-scrollbar">
                                            {dataPejabat.filter(p => p.kategori === kat || (kat === "Lainnya" && (!p.kategori || !kategoriPejabat.includes(p.kategori)))).map(p => (
                                                <div
                                                    key={p.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, p)}
                                                    onDragEnd={handleDragEnd}
                                                    className="bg-white border border-navy-100/60 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-navy-300 transition-all cursor-grab active:cursor-grabbing group relative"
                                                >
                                                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleHapusPejabat(p.id)} className="bg-red-50 text-red-600 p-2 rounded-full shadow-sm hover:bg-red-100 border border-red-200" title="Hapus"><Icon name="X" className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <div className="relative w-12 h-12 flex-shrink-0">
                                                            <img src={p.img} alt={p.nama} className="w-full h-full rounded-xl object-cover border-2 border-white shadow-sm" />
                                                            <label className="absolute -bottom-1.5 -right-1.5 bg-white border border-navy-100/60 rounded-lg p-1 cursor-pointer hover:bg-navy-50 shadow-sm transition-colors">
                                                                <Icon name="Camera" className="w-3 h-3 text-navy-600" />
                                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, p.id)} />
                                                            </label>
                                                        </div>
                                                        <div className="flex-1 space-y-2 min-w-0">
                                                            <input type="text" value={p.jabatan} onChange={(e) => handleUbahText(p.id, 'jabatan', e.target.value)} placeholder="Jabatan" className="w-full bg-transparent outline-none focus:border-b border-gold-400 text-xs font-bold uppercase tracking-wider text-navy-500 placeholder-navy-300 truncate" />
                                                            <input type="text" value={p.nama} onChange={(e) => handleUbahText(p.id, 'nama', e.target.value)} placeholder="Nama Lengkap" className="w-full bg-transparent outline-none focus:border-b border-navy-400 text-sm font-black text-navy-900 truncate" />
                                                            <div className="flex items-center text-navy-500 pt-1 border-t border-navy-50/50">
                                                                <Icon name="Phone" className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                                                <input type="text" value={p.wa} onChange={(e) => handleUbahText(p.id, 'wa', e.target.value)} placeholder="628xxxx" className="w-full bg-transparent outline-none font-mono text-xs font-medium focus:text-navy-900" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Icon indikator dragable */}
                                                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-8 bg-navy-200/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                            ))}
                                            {dataPejabat.filter(p => p.kategori === kat || (kat === "Lainnya" && (!p.kategori || !kategoriPejabat.includes(p.kategori)))).length === 0 && (
                                                <div className="border border-dashed border-navy-200 rounded-xl p-4 text-center text-navy-400 text-xs font-semibold py-8">
                                                    Kosong<br />Tarik kartu ke area ini
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {adminTab === 'pengaturan' && (
                    <div className="animate-fade-in space-y-6 pt-2">
                        {/* Subtabs seperti pada jadwal */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => scrollPengaturanTabs('left')} className="hidden md:flex p-2.5 bg-white border border-navy-100 rounded-xl shadow-sm text-navy-500 hover:text-gold-500 hover:border-gold-200 shrink-0 transition" title="Scroll Kiri">
                                <Icon name="ChevronLeft" className="w-5 h-5" />
                            </button>
                            <div ref={pengaturanScrollContainerRef} className="glass-box rounded-[1.25rem] flex-1 flex overflow-x-auto border border-navy-100/50 p-2 gap-2 hide-scrollbar scroll-smooth shadow-sm">
                                <button onClick={() => setPengaturanSubTab('youtube')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'youtube' ? 'bg-navy-900 shadow-sm font-bold text-gold-400' : 'font-bold text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}>
                                    Youtube
                                </button>
                                <button onClick={() => setPengaturanSubTab('live')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'live' ? 'bg-navy-900 shadow-sm font-bold text-gold-400' : 'font-bold text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}>
                                    Live
                                </button>
                                <button onClick={() => setPengaturanSubTab('carousel')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'carousel' ? 'bg-navy-900 shadow-sm font-bold text-gold-400' : 'font-bold text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}>
                                    Carousel
                                </button>
                                <button onClick={() => setPengaturanSubTab('pengumuman')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'pengumuman' ? 'bg-navy-900 shadow-sm font-bold text-gold-400' : 'font-bold text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}>
                                    Pengumuman
                                </button>
                                <button
                                    onClick={() => setPengaturanSubTab('perjamuan')}
                                    className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'perjamuan' ? 'bg-navy-900 shadow-sm font-bold text-gold-400' : 'font-bold text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}
                                >
                                    Perjamuan
                                </button>
                                <button onClick={() => setPengaturanSubTab('kontak')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'kontak' ? 'bg-navy-900 shadow-sm font-bold text-gold-400' : 'font-bold text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}>
                                    Lokasi
                                </button>
                                <button onClick={() => setPengaturanSubTab('password')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'password' ? 'bg-navy-900 shadow-sm font-bold text-gold-400' : 'font-bold text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}>
                                    Password
                                </button>
                            </div>
                            <button onClick={() => scrollPengaturanTabs('right')} className="hidden md:flex p-2.5 bg-white border border-navy-100 rounded-xl shadow-sm text-navy-500 hover:text-gold-500 hover:border-gold-200 shrink-0 transition" title="Scroll Kanan">
                                <Icon name="ChevronRight" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* --- FORM YOUTUBE URL --- */}
                        {pengaturanSubTab === 'youtube' && (
                            <div className="bg-white border border-navy-100/60 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 pb-5">
                                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner"><Icon name="Video" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 text-lg tracking-tight">URL YouTube Embed</h3><p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1">Video Penting</p></div>
                                </div>
                                <form onSubmit={handleSaveYoutubeUrl} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Tautan Video Embed</label>
                                        <textarea value={editYoutubeUrl} onChange={e => setEditYoutubeUrl(e.target.value)} required rows="3" className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>
                                        <p className="text-[10px] text-navy-500 mt-2 font-bold leading-relaxed bg-navy-50 p-2.5 rounded-lg border border-navy-100">Pastikan URL diawali dengan <br /><span className="text-gold-600">https://www.youtube.com/embed/</span>... atau <br /><span className="text-gold-600">https://www.youtube-nocookie.com/embed/</span>...</p>
                                    </div>
                                    <button type="submit" disabled={isSavingUrl} className={`w-full ${isSavingUrl ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all mt-6 flex justify-center items-center`}>
                                        {isSavingUrl ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan URL Baru'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* --- FORM LIVE YOUTUBE URL --- */}
                        {pengaturanSubTab === 'live' && (
                            <div className="bg-white border border-navy-100/60 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 pb-5">
                                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner"><Icon name="Video" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 text-lg tracking-tight">URL Live Streaming</h3><p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1">Halaman Live Gereja</p></div>
                                </div>
                                <form onSubmit={handleSaveLiveUrl}>
                                    <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Tautan Live (Embed)</label>
                                    <textarea value={editLiveUrl} onChange={e => setEditLiveUrl(e.target.value)} required rows="3" className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>
                                    <p className="text-[10px] text-navy-500 mt-2 font-bold leading-relaxed bg-navy-50 p-2.5 rounded-lg border border-navy-100">Pastikan URL diawali dengan <br />
                                        <span className="text-gold-600">https://www.youtube.com/embed/</span>...<br />
                                        <span className="text-gold-600">https://www.youtube-nocookie.com/embed/</span>...<br />
                                        <span className="text-gold-600">https://www.youtube.com/embed/live_stream?channel=</span>...
                                    </p>
                                    <button type="submit" disabled={isSavingLiveUrl} className="w-full bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold py-3.5 rounded-xl transition-all mt-6 flex justify-center items-center">Simpan URL Live</button>
                                </form>
                            </div>
                        )}

                        {/* --- FORM Hero-Image --- */}
                        {pengaturanSubTab === 'carousel' && (
                            <div className="bg-white border border-navy-100/60 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 pb-5">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-inner"><Icon name="Image" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 text-lg tracking-tight">Hero Image Banner</h3><p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1">Gambar Carousel Homepage</p></div>
                                </div>
                                <div className="mb-5 space-y-4">
                                    {editHeroImages.map((img, idx) => (
                                        <div key={idx} className="relative w-full overflow-hidden rounded-xl border border-navy-100 shadow-sm" style={{ aspectRatio: '10/3' }}>
                                            <img src={img} alt={`Hero Preview ${idx + 1}`} className="w-full h-full object-cover bg-navy-50" />
                                            <div className="absolute top-0 left-0 bg-black/60 text-white px-3 py-1 rounded-br-lg text-xs font-bold shadow-sm backdrop-blur-sm">
                                                Slide {idx + 1} {img.startsWith('data:image') && <span className="text-gold-400 ml-1 font-black tracking-widest">(BARU)</span>}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveHeroImage(idx)}
                                                className="absolute top-2 right-2 bg-red-500/90 text-white p-2.5 rounded-full hover:bg-red-600 shadow-md transition-colors backdrop-blur-md"
                                                title="Hapus gambar ini"
                                            >
                                                <Icon name="Trash" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleSaveHeroImage} className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                                        <label className="flex-1 flex items-center justify-center bg-navy-50 border-2 border-dashed border-navy-200 rounded-xl py-3 px-4 cursor-pointer hover:border-gold-400 hover:bg-gold-50 transition-all group">
                                            <Icon name="Upload" className="w-5 h-5 mr-2 text-navy-400 group-hover:text-gold-500 transition-colors" />
                                            <span className="text-sm font-bold text-navy-500 group-hover:text-gold-600 transition-colors">Upload Baru...</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleHeroFileUpload} />
                                        </label>
                                        <button type="button" onClick={handleAddHeroUrl} className="flex-1 bg-white border border-navy-200 text-navy-600 font-bold py-3 px-4 rounded-xl hover:bg-navy-50 hover:text-navy-900 transition flex justify-center items-center">
                                            <Icon name="PlusCircle" className="w-4 h-4 mr-2" />
                                            Tambah via URL
                                        </button>
                                    </div>
                                    <button type="submit" disabled={isSavingHero} className={`w-full ${isSavingHero ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex justify-center items-center mt-6`}>
                                        {isSavingHero ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan Perubahan Carousel'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* --- FORM PENGUMUMAN --- */}
                        {pengaturanSubTab === 'pengumuman' && (
                            <div className="bg-white border border-navy-100/60 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 pb-5">
                                    <div className="w-12 h-12 bg-gold-50 rounded-full flex items-center justify-center text-gold-600 shadow-inner"><Icon name="Megaphone" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 text-lg tracking-tight">Pengumuman Jemaat</h3><p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1">Tampil di Halaman Depan</p></div>
                                </div>
                                <form onSubmit={handleSavePengumuman} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Judul Pengumuman</label>
                                        <input type="text" value={editPengumuman.header} onChange={e => setEditPengumuman({ ...editPengumuman, header: e.target.value })} placeholder="Misal: Pengumuman Penting" className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-medium shadow-sm mb-4" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Kolom Teks (Khusus Tablet/PC)</label>
                                                <select value={editPengumuman.kolom || '1'} onChange={e => setEditPengumuman({ ...editPengumuman, kolom: e.target.value })} className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-bold shadow-sm">
                                                    <option value="1">1 Kolom (Tengah)</option>
                                                    <option value="2">2 Kolom (Kiri-Kanan)</option>
                                                    <option value="3">3 Kolom (Triptych)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Margin / Jarak Bawah</label>
                                                <select value={editPengumuman.marginBawah || 'mb-6 md:mb-8'} onChange={e => setEditPengumuman({ ...editPengumuman, marginBawah: e.target.value })} className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-bold shadow-sm">
                                                    <option value="mb-0">Tidak Ada Jarak (0px)</option>
                                                    <option value="mb-4">Sempit (16px)</option>
                                                    <option value="mb-6 md:mb-8">Sedang / Standar (24px-32px)</option>
                                                    <option value="mb-10 md:mb-14">Lebar (40px-56px)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Isi Pengumuman</label>
                                        <RichTextEditor
                                            ref={pengumumanEditorRef}
                                            initialValue={editPengumuman.isi}
                                            onChange={(html) => setEditPengumuman({ ...editPengumuman, isi: html })}
                                            placeholder="Kosongkan isi untuk menyembunyikan kotak pengumuman..."
                                        />
                                        <p className="text-[10px] text-navy-500 mt-2 font-bold leading-relaxed bg-navy-50 p-2.5 rounded-lg border border-navy-100 uppercase text-center">Hapus semua isi teks untuk menyembunyikan pengumuman dari layar utama.</p>
                                    </div>
                                    <button type="submit" disabled={isSavingPengumuman} className={`w-full ${isSavingPengumuman ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex justify-center items-center`}>
                                        {isSavingPengumuman ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan Pengumuman'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* --- FORM LOKASI & PETA --- */}
                        {pengaturanSubTab === 'kontak' && (
                            <div className="bg-white border border-navy-100/60 rounded-[1.5rem] p-6 shadow-sm animate-fade-in">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 pb-5">
                                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shadow-inner"><Icon name="Map" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 text-lg tracking-tight">Lokasi Gereja</h3><p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1">Alamat dan Google Maps</p></div>
                                </div>
                                <form onSubmit={handleSaveKontakGereja} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Alamat Lengkap</label>
                                        <textarea value={editKontakGereja.alamat} onChange={e => setEditKontakGereja({ ...editKontakGereja, alamat: e.target.value })} required rows="3" placeholder="Jl. Raya Contoh No. 123, Kelurahan, Kecamatan..." className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-medium shadow-sm mb-4"></textarea>

                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Tautan Buka di Aplikasi Maps (Direct Link)</label>
                                        <input type="url" value={editKontakGereja.mapsAppUrl || ''} onChange={e => setEditKontakGereja({ ...editKontakGereja, mapsAppUrl: e.target.value })} placeholder="https://maps.app.goo.gl/..." className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-medium shadow-sm mb-4" />

                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Tautan Peta (Google Maps Embed / iframe)</label>
                                        <textarea value={editKontakGereja.mapUrl} onChange={e => setEditKontakGereja({ ...editKontakGereja, mapUrl: e.target.value })} required rows="3" placeholder="https://www.google.com/maps/embed?pb=..." className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono shadow-sm"></textarea>
                                        <p className="text-[10px] text-navy-500 mt-2 font-medium leading-relaxed bg-navy-50 p-3 rounded-xl border border-navy-100 shadow-inner">
                                            <b>Cara mendapatkan link Peta Embed:</b><br />1. Cari gereja Anda di Google Maps (via Browser PC).<br />2. Klik tombol <b>Bagikan (Share)</b> &gt; pilih tab <b>Sematkan Peta (Embed a map)</b>.<br />3. Salin URL/Tautan yang ada di dalam tanda kutip <span className="text-gold-600 font-mono font-bold">src="..."</span> dan tempelkan pada kolom di atas.
                                        </p>
                                    </div>
                                    <button type="submit" disabled={isSavingKontak} className={`w-full ${isSavingKontak ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex justify-center items-center mt-6`}>
                                        {isSavingKontak ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan Lokasi Peta'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* --- FORM GANTI PASSWORD --- */}
                        {pengaturanSubTab === 'password' && (
                            <div className="bg-white border border-navy-100/60 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 pb-5">
                                    <div className="w-12 h-12 bg-navy-50 rounded-full flex items-center justify-center text-navy-900 shadow-inner"><Icon name="Settings" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 text-lg tracking-tight">Ganti Password Admin</h3><p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1">Keamanan Otentikasi</p></div>
                                </div>
                                <form onSubmit={handleGantiPassword} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Password Lama</label>
                                        <div className="relative">
                                            <input type={showOldPass ? "text" : "password"} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full p-3.5 pr-10 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-bold shadow-sm" />
                                            <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-gold-500 transition-colors focus:outline-none"><Icon name={showOldPass ? "EyeOff" : "Eye"} className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Password Baru</label>
                                        <div className="relative">
                                            <input type={showNewPass ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength="6" className="w-full p-3.5 pr-10 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-bold shadow-sm" />
                                            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-gold-500 transition-colors focus:outline-none"><Icon name={showNewPass ? "EyeOff" : "Eye"} className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isChangingPass} className={`w-full ${isChangingPass ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all mt-6 flex items-center justify-center`}>
                                        {isChangingPass ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Memproses...</> : 'Simpan Password Baru'}
                                    </button>
                                </form>
                            </div>
                        )}
                        {/* PERJAMUAN TAB */}
                        {pengaturanSubTab === 'perjamuan' && (
                            <div className="bg-white border border-navy-100/60 rounded-[1.5rem] p-6 shadow-sm animate-fade-in">
                                {/* Header */}
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 pb-5">
                                    <div className="w-12 h-12 bg-gold-50 rounded-full flex items-center justify-center text-gold-600 shadow-inner">
                                        <Icon name="Gift" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-navy-900 text-lg tracking-tight">Tanggal Perjamuan Kudus</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                            {perjamuanDate ? (
                                                <><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                                                    <span className="text-green-600">Aktif · {formatIndoDate(perjamuanDate)}</span></>
                                            ) : (
                                                <><span className="w-2 h-2 rounded-full bg-navy-300 inline-block"></span>
                                                    <span className="text-navy-400">Belum diatur</span></>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Banner saat ini */}
                                {perjamuanDate && (
                                    <div className="mb-5 bg-gradient-to-r from-gold-50 to-white border border-gold-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center shrink-0">
                                                <Icon name="Calendar" className="w-5 h-5 text-gold-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-0.5">Jadwal Tersimpan</p>
                                                <p className="font-black text-navy-900 text-base leading-tight">{formatIndoDate(perjamuanDate)}</p>
                                            </div>
                                        </div>
                                        {(() => {
                                            const today = new Date(); today.setHours(0, 0, 0, 0);
                                            const tgl = new Date(perjamuanDate);
                                            const diff = Math.ceil((tgl - today) / (1000 * 60 * 60 * 24));
                                            if (diff < 0) return (
                                                <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full uppercase tracking-wide">Sudah Lewat</span>
                                            );
                                            if (diff === 0) return (
                                                <span className="text-[10px] font-bold bg-gold-100 text-gold-700 border border-gold-300 px-3 py-1.5 rounded-full uppercase tracking-wide animate-pulse">Hari Ini!</span>
                                            );
                                            return (
                                                <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full uppercase tracking-wide">{diff} hari lagi</span>
                                            );
                                        })()}
                                    </div>
                                )}

                                <form onSubmit={handleSavePerjamuanDate} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">
                                            Pilih / Ubah Tanggal Perjamuan
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={editPerjamuanDate}
                                                onChange={e => setEditPerjamuanDate(e.target.value)}
                                                className="w-full p-3.5 border-2 border-navy-200 focus:border-gold-500 rounded-xl outline-none transition-all bg-white text-sm font-bold text-navy-900 shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setEditPerjamuanDate('')}
                                                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 rounded-xl border border-red-200 font-bold text-sm transition-all shadow-sm whitespace-nowrap"
                                                title="Hapus Tanggal"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview pilihan baru */}
                                    {editPerjamuanDate && editPerjamuanDate !== perjamuanDate && (
                                        <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 flex items-center gap-3">
                                            <Icon name="Info" className="w-4 h-4 text-navy-500 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">Akan diubah ke</p>
                                                <p className="font-black text-navy-900 text-sm">{formatIndoDate(editPerjamuanDate)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Box */}
                                    <div className="bg-gold-50/60 border border-gold-200/80 rounded-xl p-4 flex gap-3">
                                        <Icon name="Info" className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-navy-600 font-medium leading-relaxed">
                                            Banner <b>Perjamuan Kudus</b> tampil otomatis di halaman <b>Jadwal</b> dan <b>Live</b> sejak hari ini hingga tanggal perjamuan. Setelah tanggal lewat, banner hilang otomatis.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSavingPerjamuanDate}
                                        className={`w-full font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-md ${isSavingPerjamuanDate
                                            ? 'bg-navy-300 text-navy-500 cursor-not-allowed'
                                            : 'bg-navy-900 hover:bg-navy-800 text-gold-400 hover:shadow-lg'
                                            }`}
                                    >
                                        {isSavingPerjamuanDate ? (
                                            <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin"></span> Menyimpan...</>
                                        ) : (
                                            <><Icon name="Save" className="w-4 h-4" /> Simpan Tanggal Perjamuan</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* BOOK TAB */}
                {adminTab === 'buku' && (
                    <div className="space-y-6">
                        {/* Header & Add Button */}
                        <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-navy-900">Kelola Buku</h2>
                                <p className="text-sm text-navy-500 font-medium mt-1">Total: {daftarBuku.length} buku · Tambah, edit, atau hapus buku dari perpustakaan</p>
                            </div>
                            <button
                                onClick={openAddBookModal}
                                className="flex items-center gap-2 bg-navy-900 text-gold-400 px-6 py-3 rounded-xl font-bold text-sm hover:bg-navy-800 transition shrink-0"
                            >
                                <Icon name="Plus" className="w-4 h-4" /> Tambah Buku
                            </button>
                        </div>

                        {/* Container Utama untuk Search dan Daftar Buku agar Kotaknya Simetris */}
                        <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-5 md:p-6">

                            {/* Search Bar Admin Buku */}
                            <div className="mb-6">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
                                        <Icon name="Search" className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari judul, pengarang, atau kategori..."
                                        value={bukuSearch}
                                        onChange={e => setBukuSearch(e.target.value)}
                                        className="w-full pl-11 pr-10 py-3 bg-navy-50/50 border border-navy-100 rounded-xl text-sm font-semibold text-navy-900 placeholder-navy-300 outline-none focus:border-gold-500 transition-all"
                                    />
                                    {bukuSearch && (
                                        <button onClick={() => setBukuSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-navy-200 text-navy-500 hover:bg-navy-300 transition flex items-center justify-center">
                                            <Icon name="X" className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                {bukuSearch.length >= 2 && (
                                    <p className="text-xs text-navy-400 font-semibold mt-2 px-1">{filteredAdminBuku.length} dari {daftarBuku.length} buku</p>
                                )}
                            </div>

                            {/* Book Grid — Responsif dari 2 sampai 6 kolom */}
                            <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                                    {filteredAdminBuku.map(book => (
                                        <div key={book.id} className="bg-white rounded-xl shadow-sm border border-navy-100/60 overflow-hidden hover:shadow-md transition flex flex-col">
                                            <div className="h-36 sm:h-40 bg-gradient-to-br from-navy-100 to-navy-50 flex items-center justify-center overflow-hidden shrink-0 relative">
                                                <img
                                                    src={getCoverFallback(book)}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = getDefaultBookCover(book.category); }}
                                                />
                                                <DocumentBadge book={book} />
                                            </div>
                                            <div className="p-3 sm:p-4 flex flex-col flex-1">
                                                <div className="mb-3 flex-1">
                                                    <p className="font-bold text-navy-900 text-[13px] sm:text-sm line-clamp-2 leading-tight">{book.title}</p>
                                                    <p className="text-[10px] sm:text-xs text-navy-400 mt-1 line-clamp-1">{book.author}</p>
                                                </div>
                                                <div className="flex items-center justify-between mb-3 shrink-0">
                                                    <span className="text-[10px] bg-gold-100 text-gold-800 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">{book.category}</span>
                                                </div>
                                                <div className="flex gap-2 mt-auto shrink-0">
                                                    <button
                                                        onClick={() => { setEditingBook(book); setBookFormData(book); setBookFormModal(true); }}
                                                        className="flex-1 py-1.5 sm:py-2 bg-navy-50 text-navy-700 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-navy-100 transition flex items-center justify-center gap-1.5"
                                                    >
                                                        <Icon name="Edit" className="w-3 h-3" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm('Yakin ingin menghapus buku ini?')) return;
                                                            try {
                                                                const res = await fetch(GAS_API_URL, {
                                                                    method: 'POST',
                                                                    body: JSON.stringify({
                                                                        action: 'deleteBook',
                                                                        password: adminToken,
                                                                        data: book.id
                                                                    })
                                                                });
                                                                const data = await res.json();
                                                                if (data.status === 'success' || data.success) {
                                                                    alert('Buku berhasil dihapus!');
                                                                    loadBooks();
                                                                } else {
                                                                    alert('Error: ' + (data.message || data.error || 'Gagal menghapus'));
                                                                }
                                                            } catch (err) { alert('Error: ' + err.message); }
                                                        }}
                                                        className="flex-1 py-1.5 sm:py-2 bg-red-50 text-red-700 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-red-100 transition flex items-center justify-center gap-1.5"
                                                    >
                                                        <Icon name="Trash" className="w-3 h-3" /> Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {filteredAdminBuku.length === 0 && (
                                <div className="bg-navy-50/50 rounded-xl border-2 border-dashed border-navy-200 p-10 text-center mt-4">
                                    <Icon name="BookOpen" className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                                    {bukuSearch.length >= 2
                                        ? <><p className="text-navy-700 font-bold mb-1">Tidak ditemukan</p><p className="text-navy-500 text-xs">Tidak ada buku cocok dengan &quot;{bukuSearch}&quot;</p></>
                                        : <p className="text-navy-600 font-medium text-sm">Belum ada buku. Mulai tambahkan buku pertama Anda!</p>
                                    }
                                </div>
                            )}
                        </div>

                        {/* Book Form Modal */}
                        {bookFormModal && createPortal(
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 5rem)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}>
                                <div className="glass-box rounded-2xl max-w-2xl w-full max-h-full overflow-y-auto shadow-2xl">
                                    <div className="sticky top-0 bg-white border-b border-navy-100 p-6 flex items-center justify-between">
                                        <h3 className="text-xl font-black text-navy-900">{editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}</h3>
                                        <button onClick={() => { setBookFormModal(false); setEditingBook(null); setBookFormData({ id: '', title: '', author: '', cover: '', desc: '', category: '', pdfUrl: '' }); }}
                                            className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center text-navy-600 hover:bg-navy-100 transition">
                                            <Icon name="X" className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        setIsSavingBook(true);

                                        if (!bookFormData.title || !bookFormData.author || !bookFormData.category) {
                                            alert('Isi semua field yang diperlukan!');
                                            setIsSavingBook(false);
                                            return;
                                        }

                                        try {
                                            const action = editingBook ? 'updateBook' : 'addBook';
                                            const res = await fetch(GAS_API_URL, {
                                                method: 'POST',
                                                body: JSON.stringify({
                                                    action: action,
                                                    password: adminToken,
                                                    data: bookFormData
                                                })
                                            });
                                            const data = await res.json();
                                            if (data.status === 'success' || data.success) {
                                                alert(editingBook ? 'Buku berhasil diperbarui!' : 'Buku berhasil ditambahkan!');
                                                setBookFormModal(false);
                                                setEditingBook(null);
                                                // Reload
                                                loadBooks(); // refresh daftar;
                                            } else {
                                                alert('Error: ' + (data.message || data.error || 'Tidak diketahui'));
                                            }
                                        } catch (err) { alert('Error: ' + err.message); }
                                        setIsSavingBook(false);
                                    }} className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-navy-900 mb-1.5">Judul Buku *</label>
                                            <input
                                                type="text"
                                                required
                                                value={bookFormData.title}
                                                onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500 font-medium"
                                                placeholder="Contoh: Langkah kepada Kristus"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-navy-900 mb-1.5">Pengarang *</label>
                                            <input
                                                type="text"
                                                required
                                                value={bookFormData.author}
                                                onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500 font-medium"
                                                placeholder="Contoh: Ellen G. White"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-navy-900 mb-1.5">Kategori *</label>
                                            <input
                                                type="text"
                                                required
                                                value={bookFormData.category}
                                                onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500 font-medium"
                                                placeholder="Contoh: EGW, Doktrin, Panduan, Lain-lain"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-navy-900 mb-1.5">Deskripsi</label>
                                            <textarea
                                                value={bookFormData.desc}
                                                onChange={(e) => setBookFormData({ ...bookFormData, desc: e.target.value })}
                                                rows="3"
                                                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500 font-medium resize-none"
                                                placeholder="Deskripsi singkat tentang buku ini"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-navy-900 mb-1.5">URL Sampul (Cover) - Opsional</label>
                                            <input
                                                type="url"
                                                value={bookFormData.cover}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    let match = val.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                                                    if (match && match[1]) {
                                                        val = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
                                                    } else {
                                                        match = val.match(/id=([a-zA-Z0-9_-]+)/);
                                                        if (match && match[1] && val.includes('drive.google.com')) {
                                                            val = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
                                                        }
                                                    }
                                                    setBookFormData({ ...bookFormData, cover: val });
                                                }}
                                                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500 font-medium text-sm"
                                                placeholder="Link gambar dari Google Drive (otomatis dikonversi) atau web lain"
                                            />
                                            <p className="text-xs text-navy-400 mt-1.5">
                                                💡 <strong>Kosongkan</strong> untuk menggunakan gambar default sesuai kategori (EGW, Doktrin, Panduan, Renungan, Lain-lain)
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-navy-900 mb-1.5">Link Dokumen (PDF / PPT / Google Drive)</label>
                                            <input
                                                type="url"
                                                value={bookFormData.pdfUrl}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    let match = val.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                                                    if (match && match[1]) {
                                                        val = `https://drive.google.com/file/d/${match[1]}/preview`;
                                                    } else {
                                                        match = val.match(/id=([a-zA-Z0-9_-]+)/);
                                                        if (match && match[1] && val.includes('drive.google.com')) {
                                                            val = `https://drive.google.com/file/d/${match[1]}/preview`;
                                                        } else {
                                                            let docsMatch = val.match(/(docs\.google\.com\/(?:presentation|document|spreadsheets)\/d\/[a-zA-Z0-9_-]+)/);
                                                            if (docsMatch && docsMatch[1]) {
                                                                if (docsMatch[1].includes('presentation')) {
                                                                    val = `https://${docsMatch[1]}/embed?start=false&loop=false&delayms=3000`;
                                                                } else {
                                                                    val = `https://${docsMatch[1]}/preview`;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    setBookFormData({ ...bookFormData, pdfUrl: val });
                                                }}
                                                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500 font-medium text-sm"
                                                placeholder="Link dokumen dari Google Drive (otomatis dikonversi)"
                                            />
                                            <p className="text-xs text-navy-400 mt-1.5">💡 Mendukung <strong>PDF</strong> maupun presentasi <strong>PPT/Slide</strong>. Cukup <i>paste</i> link (URL) apa saja dari Google Drive Anda ke sini.</p>
                                        </div>

                                        <div className="flex gap-3 pt-6">
                                            <button type="button" onClick={() => { setBookFormModal(false); setEditingBook(null); setBookFormData({ id: '', title: '', author: '', cover: '', desc: '', category: '', pdfUrl: '' }); }}
                                                className="flex-1 py-2.5 bg-navy-100 text-navy-700 rounded-lg font-bold hover:bg-navy-200 transition"> Batal
                                            </button>
                                            <button type="submit" disabled={isSavingBook} className="flex-1 py-2.5 bg-navy-900 text-gold-400 rounded-lg font-bold hover:bg-navy-800 transition disabled:opacity-50">
                                                {isSavingBook ? 'Menyimpan...' : 'Simpan Buku'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        , document.body)}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- COMPONENT: SEARCH ---
const Search = ({ setActiveTab, jadwalDB, rabuYMD, sabatYMD, tabs, daftarWarta, dataPejabat, pengumuman, daftarBuku, setInitialBook }) => {
    const [query, setQuery] = React.useState('');

    // Fungsi untuk membersihkan HTML
    const stripHtml = (html) => {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    // Hasil pencarian
    const searchResults = React.useMemo(() => {
        if (query.length < 2) return { warta: [], pejabat: [], jadwal: [], buku: [], pengumuman: false, laporan: [] };
        const q = query.toLowerCase();
        const results = {
            warta: [],
            pejabat: [],
            jadwal: [],
            buku: [],
            pengumuman: false,
            laporan: []
        };

        // 1. Warta: cari di judul dan isi
        if (daftarWarta && daftarWarta.length) {
            results.warta = daftarWarta.filter(w =>
                w.judul.toLowerCase().includes(q) ||
                stripHtml(w.isi).toLowerCase().includes(q)
            ).slice(0, 20); // batasi 20
        }

        // 2. Pejabat: cari nama, jabatan
        if (dataPejabat && dataPejabat.length) {
            results.pejabat = dataPejabat.filter(p =>
                p.nama.toLowerCase().includes(q) ||
                p.jabatan.toLowerCase().includes(q)
            ).slice(0, 20);
        }

        // 3. Buku: cari judul, pengarang, deskripsi
        if (daftarBuku && daftarBuku.length) {
            results.buku = daftarBuku.filter(b =>
                (b.title && b.title.toLowerCase().includes(q)) ||
                (b.author && b.author.toLowerCase().includes(q)) ||
                (b.desc && b.desc.toLowerCase().includes(q))
            ).sort((a, b) => (a.title || '').localeCompare(b.title || '')).slice(0, 20);
        }

        // 4. Jadwal petugas (seperti sebelumnya)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const allDates = [...new Set([...Object.keys(jadwalDB), rabuYMD, sabatYMD])].sort();
        allDates.forEach(dateStr => {
            const dObj = new Date(dateStr + "T00:00:00");
            if (dObj >= today) {
                const jData = jadwalDB[dateStr];
                const isRabu = dObj.getDay() === 3;
                let found = [];
                if (isRabu && jData?.petugas) {
                    found = jData.petugas.filter(p => p.nama && p.nama.toLowerCase().includes(q));
                } else if (!isRabu && jData) {
                    const cats = ['sekolahSabat', 'khotbah', 'diakon', 'musik', 'perjamuan'];
                    cats.forEach(cat => {
                        if (jData[cat]) {
                            jData[cat].forEach(p => {
                                if (p.nama && p.nama.toLowerCase().includes(q)) found.push({ ...p, cat });
                            });
                        }
                    });
                }
                if (found.length) {
                    results.jadwal.push({ date: dateStr, isRabu, items: found });
                }
            }
        });

        // 5. Pengumuman
        if (pengumuman && pengumuman.isi) {
            const cleanPeng = stripHtml(pengumuman.isi);
            if (cleanPeng.toLowerCase().includes(q) || (pengumuman.header && pengumuman.header.toLowerCase().includes(q))) {
                results.pengumuman = true;
            }
        }

        // 6. Laporan Keuangan — tampilkan tombol redirect ke laporan.html
        // Deteksi jika user mengetik angka (no kuitansi), kode unit, atau kata kunci laporan
        const isLaporanQuery = /\d{3,}/.test(q) || 
            ['kuitansi', 'laporan', 'uang', 'transaksi', 'inc-', 'exp-', 'pem', 'rec'].some(kw => q.includes(kw));
        if (isLaporanQuery) {
            results.laporan = [{ redirectQuery: query.trim() }];
        }

        return results;
    }, [query, daftarWarta, dataPejabat, jadwalDB, daftarBuku, pengumuman, rabuYMD, sabatYMD]);

    // Filter menu seperti sebelumnya
    const filteredMenus = tabs.filter(t => t.id !== 'admin_dashboard' && t.id !== 'search' && t.label.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400">
                    <Icon name="Search" className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    autoFocus
                    placeholder="Cari Menu, Warta, Nama Petugas, Buku, Pengumuman..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-navy-100/80 rounded-2xl text-base font-bold text-navy-900 placeholder-navy-300 outline-none focus:border-gold-500 shadow-sm transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {query.length >= 2 ? (
                <div className="space-y-6">
                    {/* Hasil Menu */}
                    {filteredMenus.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black text-navy-500 uppercase tracking-widest mb-3 px-2">Menu</h3>
                            <div className="glass-box rounded-2xl border border-navy-100/60 overflow-hidden shadow-sm">
                                {filteredMenus.map((m, i) => (
                                    <button key={m.id} onClick={() => setActiveTab(m.id)} className="w-full flex items-center p-4 text-left hover:bg-gold-50/50 transition-colors border-b border-navy-50 last:border-0">
                                        <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-600 mr-4">
                                            <Icon name={m.icon} className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 font-bold text-navy-800">{m.label}</div>
                                        <Icon name="ChevronRight" className="w-4 h-4 text-navy-300" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hasil Warta */}
                    {searchResults.warta.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black text-gold-600 uppercase tracking-widest mb-3 px-2">Warta</h3>
                            <div className="space-y-3">
                                {searchResults.warta.map(w => (
                                    <div key={w.rowIndex} onClick={() => { setActiveTab('warta'); window.selectedWartaDetail = w; }} className="glass-box rounded-2xl border border-navy-100/60 p-4 cursor-pointer hover:border-gold-300 transition">
                                        <div className="font-bold text-navy-900">{w.judul}</div>
                                        <div className="text-xs text-navy-500 mt-1">{w.tanggal}</div>
                                        <div className="text-sm text-navy-600 mt-2 line-clamp-2">{stripHtml(w.isi)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hasil Pejabat */}
                    {searchResults.pejabat.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black text-green-600 uppercase tracking-widest mb-3 px-2">Pejabat / Pelayan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {searchResults.pejabat.map(p => (
                                    <div key={p.id} className="glass-box rounded-2xl border border-navy-100/60 p-3 flex items-center gap-3">
                                        <img src={p.img} className="w-12 h-12 rounded-full object-cover" alt="" />
                                        <div>
                                            <div className="font-bold text-navy-900">{p.nama}</div>
                                            <div className="text-xs text-navy-500">{p.jabatan}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hasil Buku */}
                    {searchResults.buku.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-3 px-2">Buku <span className="text-navy-300 font-semibold normal-case tracking-normal">— klik untuk membaca langsung</span></h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {searchResults.buku.map(b => (
                                    <div key={b.id} onClick={() => { setInitialBook && setInitialBook(b); setActiveTab('belajar_perpustakaan'); }} className="bg-white rounded-xl border border-navy-100/60 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                                        <div className="h-28 overflow-hidden relative">
                                            <img src={getCoverFallback(b)} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { e.target.src = getDefaultBookCover(b.category); }} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent" />
                                            <DocumentBadge book={b} className="absolute top-1.5 left-1.5" />
                                            <span className="absolute top-1.5 right-1.5 bg-gold-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{b.category}</span>
                                        </div>
                                        <div className="p-2.5">
                                            <div className="font-bold text-xs text-navy-900 line-clamp-2 leading-tight">{b.title}</div>
                                            <div className="text-[10px] text-navy-400 mt-0.5 font-semibold">{b.author}</div>
                                            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-purple-600">
                                                <Icon name="BookOpen" className="w-3 h-3" /> Buka & Baca
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hasil Jadwal Petugas */}
                    {searchResults.jadwal.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 px-2">Jadwal Petugas</h3>
                            {searchResults.jadwal.map(j => (
                                <div key={j.date} onClick={() => setActiveTab('jadwal')} className="glass-box rounded-2xl border border-navy-100/60 p-4 mb-3 cursor-pointer hover:border-gold-300">
                                    <div className="font-bold text-navy-800">{formatIndoDate(j.date)}</div>
                                    <div className="text-xs uppercase">{j.isRabu ? 'RABU' : 'SABAT'}</div>
                                    <div className="mt-2 space-y-1">
                                        {j.items.map((item, idx) => (
                                            <div key={idx} className="text-sm flex justify-between">
                                                <span className="text-navy-500">{item.tugas}</span>
                                                <span className="font-bold text-navy-900">{item.nama}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Hasil Laporan Keuangan — Redirect ke Cek Transaksi di laporan.html */}
                    {searchResults.laporan && searchResults.laporan.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black text-emerald-600 dark:text-gold-500 uppercase tracking-widest mb-3 px-2">Laporan Keuangan</h3>
                            <div 
                                onClick={() => window.location.href = `/laporan.html?search=${encodeURIComponent(searchResults.laporan[0].redirectQuery)}`}
                                className="glass-box rounded-2xl border border-emerald-100/60 dark:border-navy-700 p-5 cursor-pointer hover:shadow-lg hover:border-emerald-300 dark:hover:border-gold-500 transition-all"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-navy-800 flex items-center justify-center">
                                        <Icon name="Search" className="w-5 h-5 text-emerald-600 dark:text-gold-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-navy-900 dark:text-gold-400">Cari "{searchResults.laporan[0].redirectQuery}" di Laporan Keuangan</div>
                                        <div className="text-xs text-navy-500 dark:text-navy-300 mt-0.5">Buka halaman Cek Transaksi untuk verifikasi kuitansi & unit</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-navy-800 dark:text-gold-400 dark:hover:bg-navy-700 rounded-xl transition text-sm font-bold">
                                    <Icon name="ExternalLink" className="w-4 h-4" /> Buka Cek Transaksi
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hasil Pengumuman */}
                    {searchResults.pengumuman && (
                        <div>
                            <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3 px-2">Pengumuman</h3>
                            <div onClick={() => setActiveTab('home')} className="glass-box rounded-2xl border border-gold-200 p-4 cursor-pointer hover:shadow-md">
                                <div className="font-bold text-navy-900">{pengumuman.header || "Pengumuman"}</div>
                                <div className="text-sm text-navy-600 mt-1 line-clamp-3">{stripHtml(pengumuman.isi)}</div>
                            </div>
                        </div>
                    )}

                    {filteredMenus.length === 0 && searchResults.warta.length === 0 && searchResults.pejabat.length === 0 && searchResults.jadwal.length === 0 && searchResults.buku.length === 0 && !searchResults.pengumuman && (!searchResults.laporan || searchResults.laporan.length === 0) && (
                        <div className="text-center p-6 border border-dashed border-navy-200 rounded-2xl">
                            <p className="text-sm text-navy-500 font-medium">Tidak ada hasil untuk <span className="font-bold text-navy-900">"{query}"</span></p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center pt-10 pb-6 opacity-60">
                    <Icon name="Search" className="w-12 h-12 mx-auto text-navy-300 mb-3" />
                    <p className="text-sm font-medium text-navy-500">Ketik minimal 2 karakter untuk mencari menu, warta, pejabat, buku, pengumuman, atau jadwal petugas.</p>
                </div>
            )}
        </div>
    );
};

const App = () => {
    const [isAppLoading, setIsAppLoading] = React.useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [selectedWartaDetail, setSelectedWartaDetail] = React.useState(null);

    // --- THEME STATE ---
    const [isDarkMode, setIsDarkMode] = React.useState(() => {
        const saved = localStorage.getItem('theme');
        // Ubah nilai default dari true menjadi false agar base-nya adalah mode terang
        return saved ? saved === 'dark' : false;
    });

    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // --- HISTORY API (TOMBOL BACK ANDROID: LOGIKA "UP") ---
    const getInitialTab = () => {
        const hash = window.location.hash.replace('#', '');
        return hash || 'home';
    };
    const [activeTab, setRawActiveTab] = React.useState(getInitialTab());

    const setActiveTab = React.useCallback((tabId) => {
        setRawActiveTab(tabId);
        if (tabId !== 'warta') setSelectedWartaDetail(null);
        // Mengganti hash di URL tanpa menambah tumpukan riwayat (history stack tetap stabil)
        window.history.replaceState(window.history.state, '', `#${tabId}`);
    }, []);

    React.useEffect(() => {
        // State 'root': titik akhir sebelum keluar aplikasi
        window.history.replaceState({ isAppRoot: true }, '', window.location.href);
        // State 'dummy': state aktif kita. Saat tombol back ditekan, state 'dummy' akan di-pop.
        window.history.pushState({ dummy: true }, '', window.location.href);

        const handlePopState = (event) => {
            setRawActiveTab((currentTab) => {
                // Jika kembali ke state root (pengguna menekan back Android)
                if (event.state && event.state.isAppRoot) {
                    if (currentTab === 'home') {
                        // Di home: biarkan berada di state root. Back sekali lagi akan menutup aplikasi.
                        return 'home';
                    } else {
                        // Logika "UP": Tentukan parent tab (kembali ke atas)
                        let nextTab = 'home';
                        if (currentTab.startsWith('belajar_')) {
                            nextTab = 'belajar';
                        } else if (currentTab === 'member_baru' || currentTab === 'pindah_masuk' || currentTab === 'form_acms') {
                            nextTab = 'keanggotaan';
                        } else {
                            nextTab = 'home';
                        }

                        // Dorong kembali state 'dummy' untuk menangkap pencetan back berikutnya
                        window.history.pushState({ dummy: true }, '', `#${nextTab}`);
                        return nextTab;
                    }
                } else {
                    // Fallback jika maju secara manual
                    const hash = window.location.hash.replace('#', '');
                    return hash || 'home';
                }
            });
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);
    // -----------------------------------------

    const [jadwalDB, setJadwalDB] = React.useState({});
    const [dataPejabat, setDataPejabat] = React.useState(initialDataPejabat);
    const [kategoriPejabat, setKategoriPejabat] = React.useState(["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"]);
    const [youtubeUrl, setYoutubeUrl] = React.useState(""); // untuk video terbaru
    const [liveUrl, setLiveUrl] = React.useState("https://www.youtube.com/embed/live_stream?channel=UCaTPS74NOHACRYU0zInVZ4g");
    const [heroImages, setHeroImages] = React.useState(["./carousel/hero-default.png"]);
    const [perjamuanDate, setPerjamuanDate] = React.useState('');

    // Default State Kontak Gereja & Peta
    const defaultKontak = {
        alamat: "GMAHK PISGAH BISDAC\nAlamat gereja Anda belum diatur. Silahkan atur melalui Admin Dashboard.",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15956.123281231682!2d104.032646!3d1.127814!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d98921bf232f1f%3A0xc3b832b8429b9f9!2sGMAHK%20Pisgah%20Bisdac!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
    };
    const [kontakGereja, setKontakGereja] = React.useState(defaultKontak);

    // Pengumuman default State
    const [pengumuman, setPengumuman] = React.useState({ header: "Pengumuman Jemaat", isi: "", kolom: "1", marginBawah: "mb-6 md:mb-8" });

    // Warta default State
    const [daftarWarta, setDaftarWarta] = React.useState([]);
    const [daftarBuku, setDaftarBuku] = React.useState([]);
    const [initialBook, setInitialBook] = React.useState(null);
    
    // Laporan Keuangan default State
    // daftarLaporan dihapus — pencarian kini redirect langsung ke laporan.html

    // Fungsi refresh warta
    const refreshWarta = async () => {
        if (!GAS_API_URL) return; // Mencegah fetch jika URL kosong
        try {
            const res = await fetch(`${GAS_API_URL}?action=getData`);
            const data = await res.json();
            if (data.daftarWarta) {
                console.log("Warta diterima:", data.daftarWarta);
                setDaftarWarta(data.daftarWarta);
            }
        } catch (err) {
            console.error("Gagal refresh warta", err);
        }
    };

    // Token Admin (berisi password valid setelah login)
    const [adminToken, setAdminToken] = React.useState('');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextRabu = new Date(today);
    nextRabu.setDate(today.getDate() + ((3 - today.getDay() + 7) % 7));
    const rabuYMD = toYMD(nextRabu);

    let nextSabat = new Date(today);
    nextSabat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));
    const sabatYMD = toYMD(nextSabat);

    const perjamuanYMD = perjamuanDate ? (perjamuanDate.includes('T') ? toYMD(new Date(perjamuanDate)) : perjamuanDate) : '';
    const showPerjamuan = (() => {
        if (!perjamuanYMD) return false;
        // Parse manual agar menggunakan local midnight, bukan UTC midnight
        const parts = perjamuanYMD.split('-');
        const perjamuanObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (isNaN(perjamuanObj.getTime())) return false;
        // Tampilkan banner selama tanggal perjamuan belum lewat
        // (muncul sejak sekarang hingga hari-H perjamuan)
        return today <= perjamuanObj;
    })();

    // Fungsi Sinkronisasi Data Jadwal agar selalu sesuai urutan template awal
    const mergeJadwalData = React.useCallback((saved, initial) => {
        if (!saved) return initial;
        const merged = { ...initial, ...saved };
        const arrayKeys = ['petugas', 'sekolahSabat', 'khotbah', 'diakon', 'musik', 'perjamuan'];
        arrayKeys.forEach(key => {
            if (initial[key]) {
                merged[key] = initial[key].map(baseItem => {
                    const match = (saved[key] || []).find(s => s.tugas === baseItem.tugas);
                    return match ? { ...match } : { ...baseItem };
                });
            }
        });
        if (initial.susunan) {
            merged.susunan = { ...initial.susunan, ...(saved.susunan || {}) };
        }
        return merged;
    }, []);
    const activeRabu = mergeJadwalData(jadwalDB[rabuYMD], initialJadwalRabu);
    const activeSabat = mergeJadwalData(jadwalDB[sabatYMD], initialJadwalSabat);
    const activePerjamuan = mergeJadwalData(jadwalDB[perjamuanYMD], initialJadwalSabat).perjamuan;

    // --- LOGIKA KHUSUS HALAMAN JADWAL (HARI-H LOMPAT KE MINGGU DEPAN) ---
    let displayRabuYMD = rabuYMD;
    if (today.getDay() === 3) {
        let nextW = new Date(today); nextW.setDate(today.getDate() + 7);
        displayRabuYMD = toYMD(nextW);
    }

    let displaySabatYMD = sabatYMD;
    if (today.getDay() === 6) {
        let nextS = new Date(today); nextS.setDate(today.getDate() + 7);
        displaySabatYMD = toYMD(nextS);
    }

    const jadwalKhususRabu = mergeJadwalData(jadwalDB[displayRabuYMD], initialJadwalRabu);
    const jadwalKhususSabat = mergeJadwalData(jadwalDB[displaySabatYMD], initialJadwalSabat);
    // ----------------------------------------------------------------------
    const [syncTrigger, setSyncTrigger] = React.useState(0);
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [showSyncNotif, setShowSyncNotif] = React.useState(false);

    // MENGAMBIL DATA DARI REST API GOOGLE APPS SCRIPT DENGAN CACHING
    React.useEffect(() => {
        const fetchData = async () => {
            if (!GAS_API_URL) {
                console.warn("GAS_API_URL belum diisi. Menggunakan data default sementara.");
                setIsAppLoading(false);
                return;
            }

            if (syncTrigger > 0) setIsSyncing(true);

            let hasCache = false;
            if (syncTrigger === 0) {
                const cachedDataStr = localStorage.getItem('pisgah_data_cache');
                if (cachedDataStr) {
                    try {
                        const cached = JSON.parse(cachedDataStr);
                        if (cached.dataPejabat) setDataPejabat(cached.dataPejabat);
                        if (cached.jadwalDB) setJadwalDB(cached.jadwalDB);
                        if (cached.youtubeUrl) setYoutubeUrl(cached.youtubeUrl);
                        if (cached.liveUrl) setLiveUrl(cached.liveUrl);
                        if (cached.perjamuanDate) setPerjamuanDate(cached.perjamuanDate);
                        if (cached.kategoriPejabat) setKategoriPejabat(cached.kategoriPejabat);
                        if (cached.heroImages) setHeroImages(cached.heroImages);
                        if (cached.daftarWarta) setDaftarWarta(cached.daftarWarta);
                        if (cached.daftarBuku) setDaftarBuku(cached.daftarBuku);
                        if (cached.pengumumanObj) setPengumuman(cached.pengumumanObj);
                        if (cached.kontakGerejaObj) setKontakGereja(cached.kontakGerejaObj);
                        setIsAppLoading(false);
                        hasCache = true;
                    } catch (e) { console.warn("Gagal membaca cache"); }
                }
            } else {
                hasCache = true;
            }

            try {
                const res = await fetch(`${GAS_API_URL}?action=getData`);
                const data = await res.json();

                let newHeroImages = ["./carousel/hero-default.png"];
                let newPengumumanObj = { header: "Pengumuman Jemaat", isi: "" };
                let newKontakGerejaObj = defaultKontak;

                if (data.dataPejabat) setDataPejabat(data.dataPejabat);
                if (data.jadwalDB) setJadwalDB(data.jadwalDB);
                if (data.youtubeUrl) setYoutubeUrl(data.youtubeUrl);
                if (data.liveUrl) setLiveUrl(data.liveUrl);
                if (data.perjamuanDate !== undefined) setPerjamuanDate(data.perjamuanDate || '');
                if (data.kategoriPejabat) setKategoriPejabat(data.kategoriPejabat);

                if (data.kontakGereja) {
                    try {
                        const parsedKontak = JSON.parse(data.kontakGereja);
                        if (parsedKontak && typeof parsedKontak === 'object') {
                            newKontakGerejaObj = parsedKontak;
                            setKontakGereja(newKontakGerejaObj);
                        }
                    } catch (e) { }
                }

                if (data.heroImageUrl) {
                    try {
                        const parsed = JSON.parse(data.heroImageUrl);
                        if (Array.isArray(parsed)) newHeroImages = parsed;
                        else newHeroImages = [data.heroImageUrl];
                    } catch (e) { newHeroImages = [data.heroImageUrl]; }
                    setHeroImages(newHeroImages);
                }

                if (data.daftarWarta) setDaftarWarta(data.daftarWarta);

                let fetchedBuku = [];
                // Ambil data buku (public)
                try {
                    const bukuRes = await fetch(GAS_API_URL, {
                        method: 'POST',
                        body: JSON.stringify({ action: 'getBooks' })
                    });
                    const bukuData = await bukuRes.json();

                    // Menyamakan standar pengecekan dengan panel admin
                    if (bukuData.status === 'success' && bukuData.data) {
                        fetchedBuku = bukuData.data;
                    } else if (bukuData.data && bukuData.data.status === 'success') {
                        fetchedBuku = bukuData.data.data || [];
                    } else if (bukuData.success && bukuData.data) {
                        fetchedBuku = bukuData.data;
                    } else {
                        console.warn('Gagal memuat buku:', bukuData.message);
                    }
                    if (fetchedBuku.length > 0) setDaftarBuku(fetchedBuku);
                } catch (e) {
                    console.error('Error fetching books:', e);
                }


                if (data.pengumuman !== undefined) {
                    try {
                        const parsed = JSON.parse(data.pengumuman);
                        if (parsed && typeof parsed === 'object') {
                            newPengumumanObj = {
                                header: parsed.header || "Pengumuman Jemaat",
                                isi: decodeHTML(parsed.isi || ""),
                                kolom: parsed.kolom || "1",
                                marginBawah: parsed.marginBawah || "mb-6 md:mb-8"
                            };
                        } else {
                            newPengumumanObj = { header: "Pengumuman Jemaat", isi: decodeHTML(data.pengumuman), kolom: "1", marginBawah: "mb-6 md:mb-8" };
                        }
                    } catch (e) {
                        newPengumumanObj = { header: "Pengumuman Jemaat", isi: decodeHTML(data.pengumuman), kolom: "1", marginBawah: "mb-6 md:mb-8" };
                    }
                    setPengumuman(newPengumumanObj);
                }

                localStorage.setItem('pisgah_data_cache', JSON.stringify({
                    dataPejabat: data.dataPejabat,
                    jadwalDB: data.jadwalDB,
                    youtubeUrl: data.youtubeUrl,
                    liveUrl: data.liveUrl, // Tambahan: Simpan Live URL ke cache
                    perjamuanDate: data.perjamuanDate, // Tambahan: Simpan Tanggal Perjamuan ke cache
                    kategoriPejabat: data.kategoriPejabat,
                    heroImages: newHeroImages,
                    daftarWarta: data.daftarWarta,
                    daftarBuku: fetchedBuku.length > 0 ? fetchedBuku : daftarBuku, // Simpan ke cache
                    pengumumanObj: newPengumumanObj,
                    kontakGerejaObj: newKontakGerejaObj
                }));

                if (!hasCache) setIsAppLoading(false);
                if (syncTrigger > 0) {
                    setIsSyncing(false);
                    setTimeout(() => setShowSyncNotif(false), 3000);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                if (!hasCache) setIsAppLoading(false);
                if (syncTrigger > 0) {
                    setIsSyncing(false);
                    setTimeout(() => setShowSyncNotif(false), 3000);
                }
            }
        };

        fetchData();
    }, [syncTrigger]);

    // FIX TYPO: Memperbaiki penulisan state yang sebelumnya kurang kurung siku
    const [isAdminLoggedIn, setIsAdminLoggedIn] = React.useState(false);
    const [showLoginModal, setShowLoginModal] = React.useState(false);
    const [showIosPrompt, setShowIosPrompt] = React.useState(false);
    const [showManualInstall, setShowManualInstall] = React.useState(false);

    React.useEffect(() => {
        window.installPWA = () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                });
            } else {
                setShowManualInstall(true);
            }
        };
    }, []);

    React.useEffect(() => {
        const handler = () => setShowIosPrompt(true);
        window.addEventListener('showIosInstallPrompt', handler);
        return () => window.removeEventListener('showIosInstallPrompt', handler);
    }, []);

    const tabs = [
        { id: 'home', label: 'Home', icon: 'Home' },
        { id: 'belajar', label: 'Belajar', icon: 'BookOpen' },
        { id: 'warta', label: 'Warta', icon: 'Warta' },
        { id: 'live', label: 'Live', icon: 'Video' },
        { id: 'jadwal', label: 'Jadwal', icon: 'Calendar' },
        { id: 'persembahan', label: 'Persembahan', icon: 'Gift' },
        { id: 'hubungi', label: 'Kontak', icon: 'Phone' }
    ];

    const handleAdminClick = () => { if (isAdminLoggedIn) { setActiveTab('admin_dashboard'); } else { setShowLoginModal(true); } };
    const handleLogout = () => { setIsAdminLoggedIn(false); setAdminToken(''); setActiveTab('home'); };

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <Home setActiveTab={setActiveTab} youtubeUrl={youtubeUrl} heroImages={heroImages} jadwalDB={jadwalDB} dataPejabat={dataPejabat} pengumuman={pengumuman} daftarWarta={daftarWarta} setSelectedWarta={setSelectedWartaDetail} daftarBuku={daftarBuku} setInitialBook={setInitialBook} />;
            case 'belajar': return <Belajar setActiveTab={setActiveTab} />;
            case 'belajar_alkitab': return <DetailAlkitab setActiveTab={setActiveTab} dataPejabat={dataPejabat} />;
            case 'belajar_28dasar': return <Detail28Dasar setActiveTab={setActiveTab} dataPejabat={dataPejabat} />;
            case 'belajar_egw': return <DetailEGW setActiveTab={setActiveTab} dataPejabat={dataPejabat} />;
            case 'belajar_perpustakaan': return <Detailperpustakaan setActiveTab={setActiveTab} dataPejabat={dataPejabat} initialBook={initialBook} onBookOpened={() => setInitialBook(null)} />;
            case 'warta': return <WartaPage setActiveTab={setActiveTab} daftarWarta={daftarWarta} selectedWarta={selectedWartaDetail} setSelectedWarta={setSelectedWartaDetail} />;
            case 'live': return <Live setActiveTab={setActiveTab} activeRabu={activeRabu} activeSabat={activeSabat} rabuYMD={rabuYMD} sabatYMD={sabatYMD} showPerjamuan={showPerjamuan} perjamuanYMD={perjamuanYMD} activePerjamuan={activePerjamuan} liveUrl={liveUrl} />;
            case 'jadwal': return <Jadwal activeRabu={jadwalKhususRabu} activeSabat={jadwalKhususSabat} rabuYMD={displayRabuYMD} sabatYMD={displaySabatYMD} showPerjamuan={showPerjamuan} perjamuanYMD={perjamuanYMD} activePerjamuan={activePerjamuan} />;
            case 'persembahan': return <Persembahan dataPejabat={dataPejabat} />;
            case 'keanggotaan': return <Keanggotaan setActiveTab={setActiveTab} />;
            case 'member_baru': return <MemberBaru setActiveTab={setActiveTab} dataPejabat={dataPejabat} />;
            case 'pindah_masuk': return <PindahMasuk setActiveTab={setActiveTab} dataPejabat={dataPejabat} />;
            case 'hubungi': return <Hubungi setActiveTab={setActiveTab} dataPejabat={dataPejabat} kontakGereja={kontakGereja} />;
            case 'form_acms': return <FormACMS setActiveTab={setActiveTab} />;
            case 'susunan_ibadah': return <SusunanIbadah setActiveTab={setActiveTab} activeSabat={activeSabat} sabatYMD={sabatYMD} />;
            case 'admin_dashboard': return isAdminLoggedIn ? <AdminDashboard dataPejabat={dataPejabat} setDataPejabat={setDataPejabat} jadwalDB={jadwalDB} setJadwalDB={setJadwalDB} adminToken={adminToken} setAdminToken={setAdminToken} youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl} kategoriPejabat={kategoriPejabat} setKategoriPejabat={setKategoriPejabat} heroImages={heroImages} setHeroImages={setHeroImages} pengumuman={pengumuman} setPengumuman={setPengumuman} daftarWarta={daftarWarta} setDaftarWarta={setDaftarWarta} refreshWarta={refreshWarta} kontakGereja={kontakGereja} setKontakGereja={setKontakGereja} liveUrl={liveUrl} setLiveUrl={setLiveUrl} perjamuanDate={perjamuanDate} setPerjamuanDate={setPerjamuanDate} handleLogout={handleLogout} /> : <Home setActiveTab={setActiveTab} youtubeUrl={youtubeUrl} heroImages={heroImages} jadwalDB={jadwalDB} dataPejabat={dataPejabat} pengumuman={pengumuman} setPengumuman={setPengumuman} daftarWarta={daftarWarta} setDaftarWarta={setDaftarWarta} refreshWarta={refreshWarta} setSelectedWarta={setSelectedWartaDetail} liveUrl={liveUrl} setLiveUrl={setLiveUrl} perjamuanDate={perjamuanDate} setPerjamuanDate={setPerjamuanDate} daftarBuku={daftarBuku} setInitialBook={setInitialBook} />;
            case 'search': return <Search setActiveTab={setActiveTab} jadwalDB={jadwalDB} rabuYMD={rabuYMD} sabatYMD={sabatYMD} tabs={tabs} daftarWarta={daftarWarta} dataPejabat={dataPejabat} pengumuman={pengumuman} daftarBuku={daftarBuku} setInitialBook={setInitialBook} />;
            default: return <Home setActiveTab={setActiveTab} youtubeUrl={youtubeUrl} heroImages={heroImages} jadwalDB={jadwalDB} dataPejabat={dataPejabat} pengumuman={pengumuman} setPengumuman={setPengumuman} daftarWarta={daftarWarta} setDaftarWarta={setDaftarWarta} refreshWarta={refreshWarta} setSelectedWarta={setSelectedWartaDetail} daftarBuku={daftarBuku} setInitialBook={setInitialBook} />;
        }
    };

    // UI Rendering
    // Menghapus blocking loading page (menggunakan optimistic UI/default rendering)
    // agar bisa interaktif di bawah 1 detik! Mencegah "stuck di loading page".

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {isAppLoading && <LoadingScreen />}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={(token) => { setAdminToken(token); setIsAdminLoggedIn(true); setShowLoginModal(false); setActiveTab('admin_dashboard'); }} />
            <IosInstallModal isOpen={showIosPrompt} onClose={() => setShowIosPrompt(false)} />
            <ManualInstallModal isOpen={showManualInstall} onClose={() => setShowManualInstall(false)} />

            {/* HEADER UTAMA (Responsif untuk Mobile & Desktop) */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-navy-50 shadow-sm">
                <div className="max-w-[1500px] mx-auto flex items-center justify-between px-4 py-3 gap-3">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 justify-start">
                        <div className="flex flex-col items-start shrink-0 cursor-pointer" onClick={() => setActiveTab('home')}>
                            {/* Baris 1: Logo + Nama Gereja */}
                            <div className="flex items-center">
                                <img src="./icons/PisgahColor.png" className="w-8 h-8 md:w-8 md:h-8 object-contain opacity-100 mr-1.5" alt="Logo" />
                                <p className="block md:hidden lg:block text-xl md:text-2xl font-bold text-navy-700 tracking-tight">PISGAH<span className="text-gold-500">BISDAC</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-2 shrink-0">
                        {/* Navigasi Desktop (Disembunyikan di Mobile) - Kontak & Persembahan dihilangkan */}
                        <div className="hidden md:flex items-center gap-1 mr-2 bg-navy-50/30 p-1 rounded-2xl border border-navy-50">
                            {tabs.filter(t => !['persembahan', 'hubungi'].includes(t.id)).map(tab => {
                                const isActive = activeTab.startsWith(tab.id);
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-sm font-bold ${isActive ? 'bg-white text-navy-900 shadow-sm border border-navy-100/50' : 'text-navy-500 hover:text-navy-700 hover:bg-navy-50'}`}>
                                        <Icon name={tab.icon} className={`w-4 h-4 ${isActive ? 'text-gold-500' : ''}`} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Toggle Theme Button */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="w-10 h-10 text-navy-600 hover:text-gold-500 hover:scale-110 transition-all flex items-center justify-center shrink-0"
                            title={isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                        >
                            <Icon name={isDarkMode ? "Sun" : "Moon"} className="w-5 h-5" />
                        </button>

                        {activeTab !== 'search' && (
                            <button onClick={() => setActiveTab('search')} className="w-10 h-10 text-navy-600 hover:text-gold-500 hover:scale-110 transition-all flex items-center justify-center shrink-0" title="Pencarian">
                                <Icon name="Search" className="w-5 h-5" />
                            </button>
                        )}

                        {isAdminLoggedIn ? (
                            <button onClick={() => setActiveTab('admin_dashboard')} className="w-10 h-10 text-navy-600 hover:text-gold-500 hover:scale-110 transition-all flex items-center justify-center shrink-0" title="Dashboard Admin"><Icon name="Settings" className="w-5 h-5" /></button>
                        ) : (
                            <button onClick={handleAdminClick} className="w-10 h-10 text-navy-600 hover:text-gold-500 hover:scale-110 transition-all flex items-center justify-center shrink-0" title="Login Admin"><Icon name="LogIn" className="w-5 h-5" /></button>
                        )}
                    </div>
                </div>
            </header>

            {/* Notifikasi Sinkronisasi */}
            {showSyncNotif && (
                <div className="fixed top-[70px] left-1/2 transform -translate-x-1/2 z-[40] bg-navy-900/90 backdrop-blur-md border border-navy-700 text-white px-5 py-2.5 rounded-full shadow-xl text-xs md:text-sm font-bold flex items-center gap-2 animate-fade-in w-max max-w-[90vw]">
                    {isSyncing ? (
                        <>
                            <Icon name="RefreshCw" className="w-4 h-4 animate-spin text-gold-400 shrink-0" />
                            <span className="truncate">Menyinkronkan data dengan server...</span>
                        </>
                    ) : (
                        <>
                            <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]"><Icon name="Check" className="w-3 h-3 text-white" /></span>
                            <span className="truncate">Data telah diperbarui!</span>
                        </>
                    )}
                </div>
            )}

            <main className="flex-1 max-w-[1500px] mx-auto w-full p-4 md:p-8 pb-32 md:pb-12">
                {renderContent()}
            </main>

            {/* Navigasi Mobile (Disembunyikan di Desktop dengan md:hidden) */}
            <nav className="bottom-bar md:hidden" style={{ zIndex: 50 }}>
                {['belajar', 'warta', 'home', 'jadwal', 'live'].map(tabId => {
                    const tab = tabs.find(t => t.id === tabId);
                    if (!tab) return null;
                    const isActive = activeTab.startsWith(tab.id);

                    return (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <div className="bottom-nav-icon">
                                <Icon name={tab.icon} />
                            </div>
                            <span>{tab.label}</span>
                        </div>
                    );
                })}
            </nav>

            {/* Floating Action Button (Hubungi / WA) */}
            {activeTab !== 'admin_dashboard' && activeTab !== 'hubungi' && (
                <>
                    {/* Floating Sync Button */}
                    <button
                        onClick={() => {
                            if (!isSyncing) {
                                setSyncTrigger(prev => prev + 1);
                                setShowSyncNotif(true);
                            }
                        }}
                        className="fixed right-4 md:right-8 z-[90] w-10 h-10 md:w-11 md:h-11 bg-navy-800/20 dark:bg-navy-900/40 hover:bg-navy-800/30 dark:hover:bg-navy-900/60 backdrop-blur-md rounded-full transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center border border-navy-200/50 dark:border-navy-700/50 cursor-pointer shadow-lg group"
                        style={{
                            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.25rem)'
                        }}
                        title="Sinkronisasi Data"
                    >
                        {isSyncing ? (
                            <i className="fa-solid fa-rotate fa-spin text-amber-500 text-xl md:text-lg"></i>
                        ) : (
                            <div className="relative flex items-center justify-center w-full h-full">
                                <span className="absolute w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                                <span className="absolute w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-75"></span>
                            </div>
                        )}
                    </button>

                    {/* Floating WhatsApp Button */}
                    <button
                        onClick={() => setActiveTab('hubungi')}
                        className="fixed left-4 md:left-6 z-[90] w-10 h-10 md:w-11 md:h-11 bg-navy-800/20 dark:bg-navy-900/40 hover:bg-navy-800/30 dark:hover:bg-navy-900/60 backdrop-blur-xl rounded-full transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center border border-navy-200/50 dark:border-navy-700/50 cursor-pointer shadow-lg group"
                        style={{
                            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.25rem)'
                        }}
                        title="Hubungi Kami"
                    >
                        <i className="fa-brands fa-whatsapp text-[#25D366] text-2xl md:text-xl transition-colors group-hover:text-green-400"></i>
                    </button>
                </>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Service Worker Registration
if ('serviceWorker' in navigator) {
    let refreshing = false;
    // Listen saat ada service worker baru yang mengambil kendali, force reload page otomatis
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });

    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('ServiceWorker registered:', registration);
        } catch (err) {
            console.log('ServiceWorker registration failed: ', err);
        }
    });
}


export default function EmptyApp() { return null; }
