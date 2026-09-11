import React from 'react';

// ========================================================
// URL WEB APP MILIKMU
// ========================================================
const GAS_API_URL = "/api";

// --- INITIAL DATA ---
const defaultSusunan = {
    ssLaguBuka: "",
    ssLaguTutup: "",
    kAyatBersahutan: "",
    kLaguBuka: "",
    kLaguPujian1_show: false,
    kLaguPujian1_judul: "",
    kLaguPujian2_show: false,
    kLaguPujian2_judul: "",
    kLaguPujian3_show: false,
    kLaguPujian3_judul: "",
    kAyatInti: "",
    kLaguTutup: ""
};

const initialJadwalRabu = {
    title: "Ibadah Permintaan Doa (Rabu)", time: "19:00 WIB - selesai",
    petugas: [
        { tugas: "Pianis", nama: "" },
        { tugas: "Pemimpin Acara", nama: "" },
        { tugas: "Renungan", nama: "" },
        { tugas: "Doa Syafaat", nama: "" },
        { tugas: "Diakon", nama: "" }
    ]
};

const initialJadwalSabat = {
    title: "Ibadah Sabat (Sabtu)", time: "09:00 - 12:00 WIB",
    sekolahSabatTime: "09:00 - 10:30 WIB",
    sekolahSabat: [
        { tugas: "Pianis", nama: "" },
        { tugas: "Pembawa Acara", nama: "" },
        { tugas: "Ayat Inti & Doa Buka", nama: "" },
        { tugas: "Berita Misi", nama: "" },
        { tugas: "Pelayanan Perorangan", nama: "" }
    ],
    khotbahTime: "10:30 - 12:00 WIB",
    khotbah: [
        { tugas: "Khotbah", nama: "" },
        { tugas: "Pendamping 1", nama: "" },
        { tugas: "Pendamping 2", nama: "" },
        { tugas: "Cerita Anak-anak", nama: "" },
        { tugas: "Song Leader", nama: "" },
        { tugas: "Lagu Pujian", nama: "" }
    ],
    diakon: [
        { tugas: "Diakon 1", nama: "" },
        { tugas: "Diakon 2", nama: "" },
        { tugas: "Diakones 1", nama: "" },
        { tugas: "Diakones 2", nama: "" }
    ],
    musik: [
        { tugas: "Pianis", nama: "" },
        { tugas: "Keyboardis", nama: "" },
        { tugas: "Gitaris", nama: "" },
        { tugas: "Bassist", nama: "" },
        { tugas: "Saxophonist", nama: "" },
        { tugas: "Violinist", nama: "" }
    ],
    susunan: defaultSusunan,
    perjamuan: [
        { tugas: "P. Roti & Anggur 1", nama: "" }, { tugas: "P. Roti & Anggur 2", nama: "" }, { tugas: "P. Roti & Anggur 3", nama: "" }, { tugas: "P. Roti & Anggur 4", nama: "" }, { tugas: "P. Roti & Anggur 5", nama: "" },
        { tugas: "Persiapan Basuh Kaki 1", nama: "" }, { tugas: "Persiapan Basuh Kaki 2", nama: "" }, { tugas: "Persiapan Basuh Kaki 3", nama: "" },
        { tugas: "Pelayan Basuh Kaki 1", nama: "" }, { tugas: "Pelayan Basuh Kaki 2", nama: "" }, { tugas: "Pelayan Basuh Kaki 3", nama: "" },
        { tugas: "Pelayan Perjamuan (L1)", nama: "" }, { tugas: "Pelayan Perjamuan (P1)", nama: "" }, { tugas: "Pelayan Perjamuan (L2)", nama: "" }, { tugas: "Pelayan Perjamuan (P2)", nama: "" },
        { tugas: "Cuci Baskom 1", nama: "" }, { tugas: "Cuci Baskom 2", nama: "" }, { tugas: "Cuci Baskom 3", nama: "" }, { tugas: "Cuci Baskom 4", nama: "" },
        { tugas: "Cuci Alat Perjamuan", nama: "" }
    ]
};


let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

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
        const isIos = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod/.test(userAgent);
        };
        if (isIos()) {
            window.dispatchEvent(new CustomEvent('showIosInstallPrompt'));
        } else {
            alert("Aplikasi ini mungkin sudah terinstal atau browser tidak mendukung otomatis instalasi. Silakan cari opsi 'Tambahkan ke Layar Utama' atau 'Add to Home Screen' di menu browser Anda.");
        }
    }
};

const IosInstallModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-navy-50 text-navy-900 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                        <Icon name="Share" className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-xl text-navy-900 tracking-tight">Instal di iOS</h3>
                    <p className="text-sm text-navy-600 px-2 leading-relaxed">
                        Untuk menginstal aplikasi di iPhone/iPad: <br /><br />
                        1. Tekan ikon <b>Share</b> <Icon name="Share" className="w-4 h-4 inline" /> di menu bawah Safari.<br />
                        2. Gulir ke bawah dan pilih <br /><b className="text-navy-900">Tambahkan ke Layar Utama</b> (Add to Home Screen).
                    </p>
                    <button onClick={onClose} className="w-full bg-navy-900 text-gold-400 font-bold py-3.5 rounded-xl transition-all shadow-md mt-4">Saya Mengerti</button>
                </div>
            </div>
        </div>
    );
};

const initialDataPejabat = [
    { id: 'gembala', jabatan: "Gembala Jemaat", nama: "Pdt. [Nama Gembala]", wa: "", img: "https://ui-avatars.com/api/?name=Gembala+Jemaat&background=eff6ff&color=1e3a8a&size=512", kategori: "Kepemimpinan" },
    { id: 'ketua1', jabatan: "Ketua Jemaat 1", nama: "Bpk. [Nama Ketua 1]", wa: "", img: "https://ui-avatars.com/api/?name=Ketua+1&background=eff6ff&color=1e3a8a&size=512", kategori: "Kepemimpinan" },
    { id: 'ketua2', jabatan: "Ketua Jemaat 2", nama: "Bpk. [Nama Ketua 2]", wa: "", img: "https://ui-avatars.com/api/?name=Ketua+2&background=eff6ff&color=1e3a8a&size=512", kategori: "Kepemimpinan" },
    { id: 'sekretaris1', jabatan: "Sekretaris 1", nama: "Ibu [Nama Sekretaris 1]", wa: "", img: "https://ui-avatars.com/api/?name=Sekretaris+1&background=f0fdf4&color=14532d&size=512", kategori: "Kepemimpinan" },
    { id: 'sekretaris2', jabatan: "Sekretaris 2", nama: "Bpk. [Nama Sekretaris 2]", wa: "", img: "https://ui-avatars.com/api/?name=Sekretaris+2&background=f0fdf4&color=14532d&size=512", kategori: "Kepemimpinan" },
    { id: 'bendahara1', jabatan: "Bendahara 1", nama: "Ibu [Nama Bendahara 1]", wa: "", img: "https://ui-avatars.com/api/?name=Bendahara+1&background=fffbeb&color=78350f&size=512", kategori: "Keuangan" },
    { id: 'bendahara2', jabatan: "Bendahara 2", nama: "Ibu [Nama Bendahara 2]", wa: "", img: "https://ui-avatars.com/api/?name=Bendahara+2&background=fffbeb&color=78350f&size=512", kategori: "Keuangan" },
    { id: 'multimedia', jabatan: "Multimedia", nama: "Sdr. [Nama Multimedia]", wa: "", img: "https://ui-avatars.com/api/?name=Multimedia&background=e0e7ff&color=3730a3&size=512", kategori: "Departemen & Pelayanan" },
    { id: 'sound_system', jabatan: "Sound System", nama: "Sdr. [Nama Sound System]", wa: "", img: "https://ui-avatars.com/api/?name=Sound+System&background=e0e7ff&color=3730a3&size=512", kategori: "Departemen & Pelayanan" },
    { id: 'diakon', jabatan: "Ketua Diakon & Diakones", nama: "Bpk. [Nama Ketua Diakon]", wa: "", img: "https://ui-avatars.com/api/?name=Diakon+Diakones&background=f3f4f6&color=1f2937&size=512", kategori: "Departemen & Pelayanan" },
    { id: 'pemuda', jabatan: "Ketua Pemuda", nama: "Sdr. [Nama Ketua Pemuda]", wa: "", img: "https://ui-avatars.com/api/?name=Ketua+Pemuda&background=faf5ff&color=581c87&size=512", kategori: "Departemen & Pelayanan" }
];

// --- ICONS (SVG MAPPING) ---
const Icon = ({ name, className }) => {
    const icons = {
        Home: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
        BookOpen: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
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
        Search: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>,
        Image: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>,
        Upload: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>,
        PlusCircle: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>,
        Plus: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
        Trash2: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>,
        Camera: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>,
        Save: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
        Info: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>,
        Share: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
        Shield: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
        Copy: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>,
        FileText: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>,
        Bookmark: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
        BookmarkFilled: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
        Backspace: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>,
        ArrowRight: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><polyline points="12 5 19 12 12 19" /></svg>,
        Grid: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
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
    const d = new Date(dateString + 'T00:00:00');
    if (isNaN(d.getTime())) return dateString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatIndoDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString + 'T00:00:00');
    if (isNaN(d.getTime())) return dateString;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatIndoDateFull = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString + 'T00:00:00');
    if (isNaN(d.getTime())) return dateString;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
};

const SkeletonBlock = ({ className }) => <div className={`animate-pulse bg-navy-200 rounded-lg ${className}`}></div>;
const SkeletonList = ({ rows = 4 }) => (
    <div className="w-full space-y-4 py-2">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex justify-between items-center px-4 py-2 border-b border-navy-50/50 last:border-0 hover:bg-navy-50/30">
                <div className="w-1/3 h-4 bg-navy-100 animate-pulse rounded-md"></div>
                <div className="w-1/3 h-4 bg-navy-100 animate-pulse rounded-md"></div>
            </div>
        ))}
    </div>
);
const SkeletonCard = () => (
    <div className="flex items-center p-4 rounded-xl border border-navy-100 bg-white shadow-sm h-full w-full">
        <div className="w-14 h-14 rounded-full bg-navy-100 animate-pulse mr-4 shrink-0"></div>
        <div className="flex-1 space-y-2">
            <div className="w-1/3 h-3 bg-navy-100 animate-pulse rounded-md"></div>
            <div className="w-2/3 h-4 bg-navy-100 animate-pulse rounded-md"></div>
            <div className="w-1/2 h-3 bg-navy-100 animate-pulse rounded-md mt-2"></div>
        </div>
    </div>
);

// --- COMPONENTS ---
const Home = ({ setActiveTab, setJadwalSelectedDate, youtubeUrl, isLiveYoutube, youtubeTitle, heroImageUrl, jadwalDB, dataPejabat, isLoading, showPerjamuan, perjamuanYMD, showPerpuluhan, perpuluhanYMD }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    // Listen for search events from the mobile header
    React.useEffect(() => {
        const handleSearch = (e) => setSearchQuery(e.detail || '');
        window.addEventListener('homeSearch', handleSearch);
        return () => window.removeEventListener('homeSearch', handleSearch);
    }, []);

    const featureItems = [
        {
            id: 'sekolah_sabat',
            label: 'Sekolah Sabat',
            icon: 'BookOpen',
            isExternal: true,
            link: 'https://sabbath-school.adventech.io/in',
            colorClass: {
                bg: 'bg-blue-50',
                icon: 'text-blue-600',
                hoverBg: 'group-hover:bg-blue-100',
                hoverIcon: 'group-hover:text-blue-700',
                hoverText: 'group-hover:text-blue-800'
            }
        },
        {
            id: 'keanggotaan',
            label: 'Layanan Anggota',
            icon: 'Users',
            colorClass: {
                bg: 'bg-indigo-50',
                icon: 'text-indigo-600',
                hoverBg: 'group-hover:bg-indigo-100',
                hoverIcon: 'group-hover:text-indigo-700',
                hoverText: 'group-hover:text-indigo-800'
            }
        },
        {
            id: 'hubungi',
            label: 'Hubungi Kami',
            icon: 'Phone',
            colorClass: {
                bg: 'bg-green-50',
                icon: 'text-green-600',
                hoverBg: 'group-hover:bg-green-100',
                hoverIcon: 'group-hover:text-green-700',
                hoverText: 'group-hover:text-green-800'
            }
        },
        {
            id: 'lagu_sion',
            label: 'Lagu Sion',
            icon: 'Music',
            colorClass: {
                bg: 'bg-orange-50',
                icon: 'text-orange-600',
                hoverBg: 'group-hover:bg-orange-100',
                hoverIcon: 'group-hover:text-orange-700',
                hoverText: 'group-hover:text-orange-800'
            }
        },
        {
            id: 'perlawatan',
            label: 'Perlawatan',
            icon: 'Users',
            colorClass: {
                bg: 'bg-emerald-50',
                icon: 'text-emerald-600',
                hoverBg: 'group-hover:bg-emerald-100',
                hoverIcon: 'group-hover:text-emerald-700',
                hoverText: 'group-hover:text-emerald-800'
            }
        },
        {
            id: 'persembahan',
            label: 'Persembahan & Perpuluhan',
            icon: 'Gift',
            colorClass: {
                bg: 'bg-fuchsia-50',
                icon: 'text-fuchsia-600',
                hoverBg: 'group-hover:bg-fuchsia-100',
                hoverIcon: 'group-hover:text-fuchsia-700',
                hoverText: 'group-hover:text-fuchsia-800'
            }
        }
    ];

    const filteredItems = searchQuery.trim()
        ? featureItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : featureItems;

    // Global Search: Fitur, Halaman, Petugas, dan Pejabat
    const getGlobalSearchResults = () => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        const results = [];
        const seen = new Set();

        // 1. Search in App Pages / Features
        const appPages = [
            { id: 'home', title: 'Beranda / Home', desc: 'Halaman utama aplikasi', icon: 'Home' },
            { id: 'jadwal', title: 'Jadwal Pelayanan', desc: 'Jadwal petugas ibadah lengkap', icon: 'Calendar' },
            { id: 'live', title: 'Susunan Ibadah', desc: 'Susunan ibadah Sabat dan liturgi pelayanan', icon: 'FileText' },
            { id: 'persembahan', title: 'Persembahan & Perpuluhan', desc: 'Informasi donasi, QRIS, dan rekening', icon: 'Gift' },
            { id: 'keanggotaan', title: 'Layanan Anggota', desc: 'Informasi keanggotaan dan mutasi', icon: 'Users' },
            { id: 'member_baru', title: 'Member Baru', desc: 'Pendaftaran anggota baru', icon: 'Users' },
            { id: 'form_acms', title: 'Pindah Masuk ACMS', desc: 'Isi formulir perpindahan ACMS', icon: 'BookOpen' },
            { id: 'perlawatan', title: 'Perlawatan', desc: 'Permintaan perlawatan dari jemaat', icon: 'Users' },
            { id: 'buku_tamu', title: 'Buku Tamu', desc: 'Isi data kunjungan tamu jemaat', icon: 'Edit' },
            { id: 'hubungi', title: 'Hubungi Kami', desc: 'Kontak gembala dan pejabat jemaat', icon: 'Phone' },
            { id: 'belajar_alkitab', title: 'Doktrin Alkitab', desc: 'Pelajari dasar-dasar Alkitab', icon: 'BookOpen' },
            { id: 'belajar_28dasar', title: '28 Dasar Kepercayaan', desc: 'Doktrin gereja Masehi Advent Hari Ketujuh', icon: 'List' },
            { id: 'belajar_egw', title: 'Ellen G. White', desc: 'Mengenal tulisan roh nubuat', icon: 'BookOpen' },
            { id: 'sekolah_sabat', title: 'Sekolah Sabat', desc: 'Akses pelajaran harian Sekolah Sabat', icon: 'BookOpen', isExternal: true, link: 'https://sabbath-school.adventech.io/in' },
            { id: 'lagu_sion', title: 'Lagu Sion', desc: 'Buku nyanyian Lagu Sion online', icon: 'Music' }
        ];

        appPages.forEach(page => {
            if (page.title.toLowerCase().includes(q) || page.desc.toLowerCase().includes(q)) {
                results.push({
                    tipe: 'halaman',
                    nama: page.title,
                    tugas: page.desc,
                    section: 'Halaman / Fitur',
                    icon: page.icon,
                    action: () => page.isExternal ? window.open(page.link, '_blank') : setActiveTab(page.id)
                });
            }
        });

        // 2. Search in jadwalDB (upcoming schedules)
        if (jadwalDB) {
            Object.entries(jadwalDB).forEach(([date, data]) => {
                const sections = [
                    { key: 'petugas', label: 'Ibadah Rabu' },
                    { key: 'sekolahSabat', label: 'Sekolah Sabat' },
                    { key: 'khotbah', label: 'Ibadah Khotbah' },
                    { key: 'diakon', label: 'Petugas Diakon' },
                    { key: 'musik', label: 'Petugas Musik' },
                    { key: 'perjamuan', label: 'Perjamuan Kudus' }
                ];
                sections.forEach(({ key, label }) => {
                    if (data[key] && Array.isArray(data[key])) {
                        data[key].forEach(p => {
                            if (p.nama && p.nama.toLowerCase().includes(q)) {
                                const uid = `${p.nama}-${p.tugas}-${date}`;
                                if (!seen.has(uid)) {
                                    seen.add(uid);
                                    // Action untuk petugas: pindah ke tab jadwal
                                    results.push({ tipe: 'petugas', nama: p.nama, tugas: p.tugas, section: label, date: date, action: () => { setJadwalSelectedDate(date); setActiveTab('jadwal'); } });
                                }
                            }
                        });
                    }
                });
            });
        }

        // 3. Search in dataPejabat (church officials)
        if (dataPejabat) {
            dataPejabat.forEach(p => {
                if (p.nama && p.nama.toLowerCase().includes(q) || (p.jabatan && p.jabatan.toLowerCase().includes(q))) {
                    const uid = `pejabat-${p.id}`;
                    if (!seen.has(uid)) {
                        seen.add(uid);
                        // Action untuk pejabat: hubungi wa
                        results.push({ tipe: 'pejabat', nama: p.nama, tugas: p.jabatan, section: 'Pejabat Jemaat', date: null, img: p.img, wa: p.wa, action: () => window.open(`https://wa.me/${p.wa}`, '_blank') });
                    }
                }
            });
        }

        return results;
    };

    const globalResults = getGlobalSearchResults();

    const renderFeatureCard = (item) => {
        const labelParts = item.label.split(' ');
        const line1 = labelParts.length > 1 ? labelParts.slice(0, Math.ceil(labelParts.length / 2)).join(' ') : labelParts[0];
        const line2 = labelParts.length > 1 ? labelParts.slice(Math.ceil(labelParts.length / 2)).join(' ') : '';
        const cc = item.colorClass || {
            bg: 'bg-navy-50',
            icon: 'text-navy-600',
            hoverBg: 'group-hover:bg-gold-50',
            hoverIcon: 'group-hover:text-gold-500',
            hoverText: 'group-hover:text-gold-700'
        };

        const cardContent = (
            <>
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1rem] ${cc.bg} ${cc.hoverBg} transition-colors flex items-center justify-center mb-2.5 md:mb-3`}>
                    <Icon name={item.icon} className={`w-6 h-6 md:w-8 md:h-8 ${cc.icon} ${cc.hoverIcon} transition-colors`} />
                </div>
                <h3 className={`font-bold text-[11px] md:text-sm leading-tight text-navy-900 ${cc.hoverText} transition-colors`}>{line1}{line2 && <><br />{line2}</>}</h3>
            </>
        );

        if (item.isExternal) {
            return (
                <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className="bg-white p-4 md:p-6 rounded-[1.25rem] shadow-sm flex flex-col items-center text-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-navy-100/60 group">
                    {cardContent}
                </a>
            );
        }
        return (
            <div key={item.id} onClick={() => setActiveTab(item.id)} className="bg-white p-4 md:p-6 rounded-[1.25rem] shadow-sm flex flex-col items-center text-center justify-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-navy-100/60 group">
                {cardContent}
            </div>
        );
    };

    return (
        <div className="animate-fade-in relative z-10">
            {/* Hero Image + Overlapping Welcome Box */}
            <div className="-mx-4 md:mx-0 -mt-6 md:mt-0 mb-6 md:mb-10">
                {isLoading ? (
                    <div className="w-full overflow-hidden md:rounded-[1.5rem] relative z-0 bg-navy-200 animate-pulse" style={{ aspectRatio: '16/8.5' }}></div>
                ) : (
                    <div className="w-full overflow-hidden md:rounded-[1.5rem] relative z-0" style={{ aspectRatio: '16/8.5' }}>
                        <img loading="lazy" src={heroImageUrl}
                            alt="Hero Banner"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                {/* Welcome Box - overlapping hero */}
                <div className="relative z-10 mx-4 md:mx-6 -mt-6 md:-mt-7">
                    <div className="welcome-box-gradient rounded-[1.25rem] md:rounded-[1.5rem] shadow-lg border border-blue-100/80 px-5 py-3.5 md:px-8 md:py-4 flex items-center justify-center backdrop-blur-sm">
                        <h2 className="text-[0.95rem] md:text-lg font-bold text-navy-900 flex items-center flex-wrap justify-center gap-x-2">
                            <span>Selamat Datang di</span>
                            <img loading="lazy" src="./art1s-outline.svg" alt="ART1S" className="h-7 md:h-9 w-auto inline-block" style={{ verticalAlign: 'middle' }} />
                            <span>app</span>
                        </h2>
                    </div>
                </div>
            </div>

            {/* Global Search Results */}
            {searchQuery.trim() && globalResults.length > 0 && (
                <div className="mb-5 bg-white rounded-[1.25rem] shadow-sm border border-navy-100/60 overflow-hidden">
                    <div className="px-4 py-3 bg-navy-50/50 border-b border-navy-100/60 flex items-center">
                        <Icon name="Search" className="w-4 h-4 text-gold-500 mr-2" />
                        <h3 className="font-bold text-xs text-navy-700 uppercase tracking-widest">Hasil Pencarian ({globalResults.length})</h3>
                    </div>
                    <div className="divide-y divide-navy-50 max-h-64 overflow-y-auto">
                        {globalResults.map((p, i) => (
                            <div key={i}
                                onClick={() => p.action && p.action()}
                                className={`flex items-center px-4 py-3 hover:bg-navy-50/30 transition-colors ${p.action ? 'cursor-pointer' : ''}`}>
                                {p.img ? (
                                    <img loading="lazy" src={p.img} alt={p.nama} className="w-9 h-9 rounded-lg object-cover border border-navy-100 mr-3 shrink-0" />
                                ) : p.icon ? (
                                    <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center mr-3 shrink-0 text-navy-600">
                                        <Icon name={p.icon} className="w-5 h-5" />
                                    </div>
                                ) : (
                                    <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center mr-3 shrink-0 text-navy-400">
                                        <Icon name="Users" className="w-4 h-4" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-navy-900 truncate">{p.nama}</p>
                                    <p className="text-[11px] text-navy-500 font-medium truncate">{p.tugas}</p>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold-50 text-gold-600 border border-gold-200 font-bold uppercase tracking-wider">{p.section}</span>
                                    {p.date && <p className="text-[10px] text-navy-400 font-medium mt-1">{formatIndoDateShort(p.date)}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Feature Grid */}
            <div className={`grid ${filteredItems.length < 3 ? 'grid-cols-2' : 'grid-cols-3'} gap-3 md:gap-5 mb-5 md:mb-8`}>
                {filteredItems.map(item => renderFeatureCard(item))}
                {searchQuery.trim() && filteredItems.length === 0 && globalResults.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-navy-400 font-medium text-sm">
                        <Icon name="Search" className="w-8 h-8 mx-auto mb-2 text-navy-300" />
                        Tidak ditemukan hasil untuk "{searchQuery}"
                    </div>
                )}
            </div>

            {(showPerjamuan || showPerpuluhan) && (
                <div className="space-y-4 mb-6 md:mb-8">
                    {showPerjamuan && (
                        <div className="bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 p-5 md:p-6 rounded-[1.25rem] shadow flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in border border-gold-300">
                            <div className="text-center sm:text-left">
                                <h3 className="font-black text-[1.15rem] leading-none uppercase tracking-widest flex items-center justify-center sm:justify-start mb-1.5"><Icon name="Gift" className="w-4 h-4 mr-2" /> Sabat Perjamuan</h3>
                                <p className="text-sm text-navy-800 font-bold">{formatIndoDate(perjamuanYMD)}</p>
                            </div>
                            <button onClick={() => { setJadwalSelectedDate(perjamuanYMD); setActiveTab('jadwal'); }} className="bg-navy-900 text-gold-400 hover:text-gold-300 px-6 py-3 rounded-xl text-sm font-bold shadow hover:bg-navy-800 transition shrink-0 w-full sm:w-auto">Lihat Petugas</button>
                        </div>
                    )}

                    {showPerpuluhan && (
                        <div className="bg-gradient-to-br from-navy-900 to-navy-800 p-5 md:p-6 rounded-[1.25rem] shadow-lg border border-navy-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden animate-fade-in">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-400/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                            <div className="relative z-10 text-center sm:text-left">
                                <h3 className="font-black text-[1.15rem] leading-none uppercase tracking-widest flex items-center justify-center sm:justify-start mb-1.5 text-gold-400">
                                    <Icon name="Gift" className="w-4 h-4 mr-2" /> Sabat Perpuluhan
                                </h3>
                                <p className="text-sm text-navy-200 font-bold">{formatIndoDate(perpuluhanYMD)}</p>
                            </div>
                            <button onClick={() => setActiveTab('persembahan')} className="relative z-10 bg-gold-400 hover:bg-gold-300 text-navy-900 px-6 py-3 rounded-xl text-sm font-black shadow-md hover:shadow-lg transition-all shrink-0 w-full sm:w-auto">
                                Transfer Perpuluhan
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="mb-6 md:mb-10">
                <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-2">
                    <h2 className="text-[1.15rem] font-bold text-navy-900 flex items-center">
                        <Icon name="Video" className="w-[1.15rem] h-[1.15rem] mr-2 text-gold-500" />
                        {isLiveYoutube ? "Sedang Siaran Langsung" : "Video Terbaru"}
                    </h2>
                    {isLiveYoutube && (
                        <span className="flex items-center bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span> LIVE NOW
                        </span>
                    )}
                </div>
                {isLoading ? (
                    <div className="relative w-full overflow-hidden rounded-[1.25rem] md:rounded-[1.5rem] bg-navy-200 animate-pulse" style={{ paddingTop: '56.25%' }}></div>
                ) : (
                    <div className="space-y-3">
                        <div className="relative w-full overflow-hidden rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm" style={{ paddingTop: '56.25%' }}>
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={youtubeUrl}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen>
                            </iframe>
                        </div>
                        {youtubeTitle && (
                            <p className="text-xs font-bold text-navy-700 px-1 leading-snug">
                                {isLiveYoutube ? "🔴 " : ""} {youtubeTitle}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="mb-6 md:mb-10">
                <div className="flex items-center space-x-2 mb-4 px-1">
                    <Icon name="Headphones" className="w-[1.15rem] h-[1.15rem] text-gold-500" />
                    <h3 className="font-bold text-[1.15rem] text-navy-900">Podcast Kita</h3>
                </div>
                <div className="relative w-full overflow-hidden rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm" style={{ paddingTop: '56.25%' }}>
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        data-testid="embed-iframe"
                        src="https://open.spotify.com/embed/show/6PcT9H7ksbbJjsnl1qUfKB/video?utm_source=generator"
                        frameBorder="0"
                        allowFullScreen=""
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy">
                    </iframe>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center mb-5 md:mb-8 bg-white p-5 md:p-7 rounded-[1.5rem] shadow-sm border border-navy-100/60 text-center">
                <div className="w-16 h-16 mb-4 flex items-center justify-center overflow-hidden rounded-2xl shadow-inner border border-navy-100 bg-white p-2">
                    <img loading="lazy" src="./art1s-bg.svg" alt="ART1S Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-bold text-[1.15rem] text-navy-900 mb-1">Akses Lebih Cepat ⚡</h3>
                <p className="text-sm text-navy-600 mb-4 px-2">Dapatkan pengalaman terbaik dengan menginstal aplikasi ini ke layar utama Anda (Add to Home Screen).</p>
                <button onClick={() => window.installPWA && window.installPWA()} className="bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center w-full md:w-auto">
                    <Icon name="Download" className="w-5 h-5 mr-2" /> Download Web App
                </button>
            </div>

            <footer className="pt-6 pb-2 border-t border-navy-200 text-center text-navy-500 font-medium tracking-wide text-[10px] md:text-xs">
                Copyright &copy; by ART1S Tech Team 2026
            </footer>
        </div>
    );
};

const SusunanIbadah = ({ setActiveTab, activeSabat, sabatYMD, isLoading, laguSionDb, setLaguSionInitialSong }) => {
    const [openSection, setOpenSection] = React.useState('khotbah');

    const getOfficer = (arr, role) => arr?.find(p => p.tugas === role)?.nama || "-";
    const susunan = activeSabat.susunan || defaultSusunan;

    // Helper: navigate to Lagu Sion page with a specific song number
    const navigateToLaguSion = (lsNumber) => {
        const num = parseInt(lsNumber, 10);
        if (!num) return;
        const song = (laguSionDb || []).find(s => s.number === num);
        if (song) {
            setLaguSionInitialSong(song);
        } else {
            // Even if not found in db, navigate and let LaguSion handle it
            setLaguSionInitialSong({ number: num });
        }
        setActiveTab('lagu_sion');
    };

    // Helper: format lagu value for display
    // Admin cukup input angka (misal "205"), otomatis tampil "LS 205 - Pandanglah Pada Yesus"
    // Juga support format lama "LS 205" atau "LS 205 - Judul"
    const formatLagu = (value) => {
        if (!value || typeof value !== 'string') return value || "-";
        const trimmed = value.trim();
        if (!trimmed) return "-";

        // Case 1: Hanya angka (admin input baru)
        if (/^\d+$/.test(trimmed)) {
            const num = parseInt(trimmed, 10);
            const song = (laguSionDb || []).find(s => s.number === num);
            return song ? `LS ${num} - ${song.title}` : `LS ${num}`;
        }

        // Case 2: Format "LS XXX" tanpa judul — tambahkan judul otomatis
        const lsMatch = trimmed.match(/^LS\.?\s*(\d+)$/i);
        if (lsMatch) {
            const num = parseInt(lsMatch[1], 10);
            const song = (laguSionDb || []).find(s => s.number === num);
            return song ? `LS ${num} - ${song.title}` : `LS ${num}`;
        }

        // Case 3: Format lama "LS 205 - Judul" atau teks bebas — tampilkan apa adanya
        return trimmed;
    };

    // Helper: extract LS number from a description string
    const extractLsNumber = (desc) => {
        if (typeof desc !== 'string') return null;
        const match = desc.match(/LS\.?\s*(\d+)/i);
        return match ? match[1] : null;
    };

    const renderItem = (title, desc, isHighlight = false) => {
        const lsNumber = extractLsNumber(desc);
        const isLaguSionLink = !!lsNumber;

        if (isLaguSionLink) {
            return (
                <div
                    className={`flex items-center gap-3 py-3 px-4 border border-transparent rounded-xl mx-2 my-1 cursor-pointer group transition-all duration-200 hover:bg-blue-50/60 hover:border-blue-200/60 hover:shadow-sm active:scale-[0.985] ${isHighlight ? 'bg-gold-50/60 border-gold-100/50' : ''}`}
                    onClick={() => navigateToLaguSion(lsNumber)}
                    title={`Buka Lagu Sion No. ${lsNumber}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateToLaguSion(lsNumber); } }}
                >
                    <span className="text-sm text-navy-600 font-medium shrink-0" style={{ minWidth: '40%' }}>{title}</span>
                    <span className="text-sm break-words font-bold text-navy-800 group-hover:text-blue-700 transition-colors ml-auto text-right">{desc}</span>
                </div>
            );
        }

        return (
            <div className={`flex justify-between items-center py-3 px-4 border-b border-navy-50/50 last:border-0 transition-colors rounded-xl mx-2 my-1 ${isHighlight ? 'bg-gold-50 shadow-sm border-gold-100' : 'hover:bg-navy-50/30'}`}>
                <span className="text-sm text-navy-600 font-medium w-1/2 shrink-0">{title}</span>
                <span className={`text-sm text-right w-1/2 break-words ${isHighlight ? 'font-bold text-navy-900' : 'font-bold text-navy-800'}`}>{desc}</span>
            </div>
        );
    };

    const susunanTabs = [
        { 
            id: 'ss', 
            label: 'Sekolah Sabat', 
            icon: 'BookOpen',
            colorClass: {
                bg: 'bg-indigo-50',
                icon: 'text-indigo-600',
                hoverBg: 'group-hover:bg-indigo-100',
                hoverIcon: 'group-hover:text-indigo-700',
                hoverText: 'group-hover:text-indigo-800'
            }
        },
        { 
            id: 'khotbah', 
            label: 'Khotbah / Umum', 
            icon: 'List',
            colorClass: {
                bg: 'bg-blue-50',
                icon: 'text-blue-600',
                hoverBg: 'group-hover:bg-blue-100',
                hoverIcon: 'group-hover:text-blue-700',
                hoverText: 'group-hover:text-blue-800'
            }
        },
        { 
            id: 'diakon', 
            label: 'Diakon & Diakones', 
            icon: 'Users',
            colorClass: {
                bg: 'bg-emerald-50',
                icon: 'text-emerald-600',
                hoverBg: 'group-hover:bg-emerald-100',
                hoverIcon: 'group-hover:text-emerald-700',
                hoverText: 'group-hover:text-emerald-800'
            }
        },
        { 
            id: 'musik', 
            label: 'Pelayanan Musik', 
            icon: 'Music',
            colorClass: {
                bg: 'bg-rose-50',
                icon: 'text-rose-600',
                hoverBg: 'group-hover:bg-rose-100',
                hoverIcon: 'group-hover:text-rose-700',
                hoverText: 'group-hover:text-rose-800'
            }
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="relative">
                <div className="text-center pt-4 pb-6 md:pt-6 md:pb-8">
                    <h2 className="text-xl md:text-[1.75rem] font-black text-navy-900 uppercase tracking-widest leading-none">Susunan Ibadah</h2>
                    <p className="text-gold-600 font-bold mt-2 text-sm md:text-base">{formatIndoDate(sabatYMD)}</p>
                </div>

                <div className="flex flex-col">
                    {/* TABS GRID (BENTO BOX Style) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5 mb-6">
                        {susunanTabs.map(tab => {
                            const labelParts = tab.label.split(' ');
                            const line1 = labelParts.length > 1 ? labelParts.slice(0, Math.ceil(labelParts.length / 2)).join(' ') : labelParts[0];
                            const line2 = labelParts.length > 1 ? labelParts.slice(Math.ceil(labelParts.length / 2)).join(' ') : '';
                            const cc = tab.colorClass;
                            const isActive = openSection === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setOpenSection(tab.id)}
                                    className={`bg-white p-4 md:p-6 rounded-[1.25rem] shadow-sm flex flex-col items-center text-center justify-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-navy-100/60 group ${isActive ? 'border-navy-900 ring-2 ring-navy-900/10 scale-[1.02]' : ''}`}
                                >
                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1rem] ${isActive ? 'bg-navy-900' : cc.bg} ${cc.hoverBg} transition-colors flex items-center justify-center mb-2.5 md:mb-3`}>
                                        <Icon name={tab.icon} className={`w-6 h-6 md:w-8 md:h-8 ${isActive ? 'text-gold-400' : cc.icon} ${cc.hoverIcon} transition-colors`} />
                                    </div>
                                    <h3 className={`font-bold text-[11px] md:text-sm leading-tight text-navy-900 ${cc.hoverText} transition-colors`}>
                                        {line1}{line2 && <><br />{line2}</>}
                                    </h3>
                                </button>
                            );
                        })}
                    </div>

                    {/* TAB CONTENT */}
                    {openSection === 'ss' && (
                        <div className="animate-fade-in">
                            {isLoading ? (
                                <SkeletonList rows={6} />
                            ) : (
                                <>
                                    {renderItem("Lagu Pengantar", "LS 205 - Pandanglah Pada Yesus (reff saja)")}
                                    {renderItem("Pemimpin Acara", getOfficer(activeSabat.sekolahSabat, "Pembawa Acara"))}
                                    {renderItem("Lagu Buka", formatLagu(susunan.ssLaguBuka))}
                                    {renderItem("Ayat Inti & Doa Buka", getOfficer(activeSabat.sekolahSabat, "Ayat Inti & Doa Buka"))}
                                    {renderItem("Berita Misi", getOfficer(activeSabat.sekolahSabat, "Berita Misi"))}
                                    {renderItem("Diskusi Sekolah Sabat", "Kelas Pemuda 1, Kelas Dewasa, Kelas Pemuda 2, Kelas Anak-anak")}
                                    {renderItem("Pelayanan Perorangan", getOfficer(activeSabat.sekolahSabat, "Pelayanan Perorangan"))}
                                    {renderItem("Lagu Tutup", formatLagu(susunan.ssLaguTutup))}
                                    {renderItem("Doa Tutup", getOfficer(activeSabat.sekolahSabat, "Pelayanan Perorangan"))}
                                </>
                            )}
                        </div>
                    )}

                    {openSection === 'khotbah' && (
                        <div className="animate-fade-in">
                            {isLoading ? (
                                <SkeletonList rows={10} />
                            ) : (
                                <>
                                    {renderItem("Lagu Pengantar", "LS 515 - Tuhan Ada Dalam Bait Allah")}
                                    {renderItem("Lagu Sambutan", "LS 1 - Di Hadapan Hadirat-Mu")}
                                    {renderItem("Doa Buka", getOfficer(activeSabat.khotbah, "Khotbah"))}
                                    {renderItem("Ayat Bersahutan", getOfficer(activeSabat.khotbah, "Pendamping 1") + " - " + susunan.kAyatBersahutan)}
                                    {renderItem("Lagu Buka", formatLagu(susunan.kLaguBuka))}
                                    {renderItem("Doa Syafaat", getOfficer(activeSabat.khotbah, "Pendamping 1"))}
                                    {susunan.kLaguPujian1_show && renderItem("Lagu Pujian", susunan.kLaguPujian1_judul, true)}
                                    {renderItem("Bacaan Persembahan", getOfficer(activeSabat.khotbah, "Pendamping 2"))}
                                    {renderItem("Lagu Persembahan", "LS 260 - Bawa Persembahanmu")}
                                    {renderItem("Doa Persembahan", getOfficer(activeSabat.khotbah, "Pendamping 2"))}
                                    {susunan.kLaguPujian2_show && renderItem("Lagu Pujian", susunan.kLaguPujian2_judul, true)}
                                    {renderItem("Cerita Anak-anak", getOfficer(activeSabat.khotbah, "Cerita Anak-anak"))}
                                    {susunan.kLaguPujian3_show && renderItem("Lagu Pujian", susunan.kLaguPujian3_judul, true)}
                                    {renderItem("Ayat Inti", susunan.kAyatInti)}
                                    {renderItem("Lagu Tema", "Misi Kita")}
                                    {renderItem("Khotbah", getOfficer(activeSabat.khotbah, "Khotbah"), true)}
                                    {renderItem("Lagu Tutup", formatLagu(susunan.kLaguTutup))}
                                    {renderItem("Doa Berkat", "Pdt. David Indra Utomo")}
                                    {renderItem("Lagu Berkat", "LS 60 - Pada Akhir Kebaktian")}
                                    {renderItem("Pengumuman", "Dept. Komunikasi")}
                                </>
                            )}
                        </div>
                    )}

                    {openSection === 'diakon' && (
                        <div className="animate-fade-in">
                            {isLoading ? <SkeletonList rows={6} /> : activeSabat.diakon.map((p, idx) => <div key={idx}>{renderItem(p.tugas, p.nama)}</div>)}
                        </div>
                    )}

                    {openSection === 'musik' && (
                        <div className="animate-fade-in">
                            {isLoading ? <SkeletonList rows={5} /> : activeSabat.musik.map((p, idx) => <div key={idx}>{renderItem(p.tugas, p.nama)}</div>)}
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
        { id: 'alkitab', title: 'Alkitab', desc: 'Alkitab adalah firman Allah yang diilhamkan, satu-satunya aturan iman dan praktik.', img: 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9DZnExNzQ5MTg3MDg1NjE3LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/Cfq1749187085617.jpg', color: 'orange' },
        { id: '28dasar', title: '28 Dasar Kepercayaan', desc: 'Gereja Advent memegang keyakinan dasar tertentu sebagai ajaran Kitab Suci.', img: 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjc1L2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9mcEUxNzQ5NDcxNDI3NTExLmpwZw/w:1920,q:75/hope-images/67054013a60919c92d92c959/fpE1749471427511.jpg', color: 'green' },
        { id: 'egw', title: 'Ellen G. White', desc: 'Mengenal tulisan-tulisan yang diilhami untuk menuntun gereja pada akhir zaman.', img: 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9ISVMxNzQ3NzM1NjEyMzE5LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/HIS1747735612319.jpg', color: 'purple' }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-[1.5rem] shadow-sm border border-navy-100/60 overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="h-[13rem] overflow-hidden relative">
                            <img loading="lazy" src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/20 to-transparent"></div>
                            <h3 className="absolute bottom-5 left-5 text-white font-black tracking-wide text-xl">{item.title}</h3>
                        </div>
                        <div className="p-5 md:p-6 flex-1 flex flex-col">
                            <p className="text-navy-500 font-medium text-sm mb-6 flex-1 leading-relaxed">{item.desc}</p>
                            {item.isExternal ? (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-sm hover:shadow`}>
                                    <span className="tracking-wide">Mulai Belajar</span><Icon name="BookOpen" className="w-[1.15rem] h-[1.15rem]" />
                                </a>
                            ) : (
                                <button onClick={() => setActiveTab(`belajar_${item.id}`)} className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 bg-navy-50 hover:bg-navy-100 text-navy-800`}>
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

const ContactGembala = ({ dataPejabat, isLoading }) => {
    const gembala = dataPejabat.find(p => p.id === 'gembala');
    if (isLoading) {
        return (
            <div className="mt-10 bg-gold-400/10 border border-gold-200/50 rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between not-prose shadow-sm relative overflow-hidden">
                <div className="flex-1 text-center md:text-left mb-5 md:mb-0 md:mr-8 w-full">
                    <SkeletonBlock className="h-6 w-3/4 mb-2 mx-auto md:mx-0" />
                    <SkeletonBlock className="h-4 w-full mb-1" />
                    <SkeletonBlock className="h-4 w-5/6 mx-auto md:mx-0" />
                </div>
                <div className="w-full md:w-auto shrink-0">
                    <SkeletonCard />
                </div>
            </div>
        );
    }
    if (!gembala) return null;
    return (
        <div className="mt-10 bg-gold-400/10 border border-gold-200/50 rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between not-prose shadow-sm relative overflow-hidden">
            <div className="flex-1 text-center md:text-left mb-5 md:mb-0 md:mr-8 relative z-10">
                <h4 className="font-bold text-navy-900 text-xl tracking-tight mb-2">Ingin Pelajari Lebih Lanjut?</h4>
                <p className="text-[14px] text-navy-600 font-medium leading-relaxed">Jika Anda memiliki pertanyaan mendalam, membutuhkan bimbingan rohani, atau ingin berdiskusi lebih lanjut, jangan ragu untuk menghubungi Gembala Jemaat kami.</p>
            </div>
            <a href={`https://wa.me/${gembala.wa}`} target="_blank" rel="noopener noreferrer" className="relative z-10 flex items-center p-3 rounded-2xl border border-navy-100 bg-white hover:bg-gold-50 hover:border-gold-200 shadow-sm hover:shadow transition-all duration-300 group shrink-0 w-full md:w-auto">
                <img loading="lazy" src={gembala.img} alt={gembala.nama} className="w-[3.5rem] h-[3.5rem] rounded-full object-cover mr-4 border-[3px] border-gold-100 group-hover:border-gold-300 transition-colors shrink-0" />
                <div className="text-left pr-2">
                    <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest mb-0.5">{gembala.jabatan}</p>
                    <p className="font-bold text-navy-900 leading-tight text-sm">{gembala.nama}</p>
                    <p className="text-xs text-navy-500 mt-1.5 flex items-center font-bold tracking-wide"><Icon name="MessageCircle" className="w-[1rem] h-[1rem] mr-1.5 text-green-500" /> Hubungi via WA</p>
                </div>
            </a>
        </div>
    );
};

const DetailAlkitab = ({ setActiveTab, dataPejabat, isLoading }) => (
    <div className="bg-white rounded-[1.5rem] shadow-sm border border-navy-100/60 p-6 md:p-8 animate-fade-in relative z-10">
        <div className="prose max-w-none">
            <h1 className="text-[2rem] font-extrabold text-navy-900 mb-6 border-b pb-4 border-navy-50">Doktrin Alkitab</h1>
            <img loading="lazy" src="https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9DZnExNzQ5MTg3MDg1NjE3LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/Cfq1749187085617.jpg" alt="Bible Detail" className="w-full h-[18rem] object-cover rounded-[1.25rem] mb-8 shadow-sm" />
            <p className="text-lg text-navy-800 font-medium italic mb-6 leading-relaxed">"Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran." (2 Timotius 3:16)</p>
            <div className="space-y-4 text-navy-600 font-medium">
                <p>Kitab Suci, yang terdiri dari Perjanjian Lama dan Perjanjian Baru, adalah Firman Allah yang tertulis, diberikan melalui ilham ilahi. Penulis yang diilhami berbicara dan menulis saat mereka digerakkan oleh Roh Kudus.</p>
                <h3 className="text-navy-900 font-bold text-xl pt-2">Otoritas Firman Allah</h3>
                <p>Dalam Firman ini, Allah telah memberikan pengetahuan yang diperlukan bagi keselamatan manusia. Kitab Suci adalah wahyu yang tertinggi, otoritatif, dan merupakan standar karakter yang sempurna.</p>
                <h3 className="text-navy-900 font-bold text-xl pt-2">Ujian Pengalaman</h3>
                <p>Alkitab adalah ujian bagi pengalaman, penentu doktrin-doktrin yang otoritatif, dan catatan yang dapat dipercaya tentang tindakan Allah dalam sejarah dunia.</p>
                <div className="bg-gold-50 p-6 rounded-2xl border-l-[6px] border-gold-500 my-8 italic text-navy-900 font-bold shadow-sm">"Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku." (Mazmur 119:105)</div>
                <ContactGembala dataPejabat={dataPejabat} isLoading={isLoading} />
            </div>
        </div>
    </div>
);

const Detail28Dasar = ({ setActiveTab, dataPejabat, isLoading }) => {
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
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-navy-100/60 p-6 md:p-8 animate-fade-in relative z-10">
            <div className="prose max-w-none">
                <h1 className="text-[2rem] font-extrabold text-navy-900 mb-6 border-b pb-4 border-navy-50">28 Dasar Kepercayaan</h1>
                <img loading="lazy" src="https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjc1L2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9mcEUxNzQ5NDcxNDI3NTExLmpwZw/w:1920,q:75/hope-images/67054013a60919c92d92c959/fpE1749471427511.jpg" alt="28 Doctrine Detail" className="w-full h-[18rem] object-cover rounded-[1.25rem] mb-8 shadow-sm" />
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
                <ContactGembala dataPejabat={dataPejabat} isLoading={isLoading} />
            </div>
        </div>
    );
};

const DetailEGW = ({ setActiveTab, dataPejabat, isLoading }) => (
    <div className="bg-white rounded-[1.5rem] shadow-sm border border-navy-100/60 p-6 md:p-8 animate-fade-in relative z-10">
        <div className="prose max-w-none">
            <h1 className="text-[2rem] font-extrabold text-navy-900 mb-6 border-b pb-4 border-navy-50">Karunia Nubuat: Ellen G. White</h1>
            <img loading="lazy" src="https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9ISVMxNzQ3NzM1NjEyMzE5LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/HIS1747735612319.jpg" alt="EGW Detail" className="w-full h-[18rem] object-cover rounded-[1.25rem] mb-8 shadow-sm" />
            <div className="space-y-4 text-navy-600 font-medium">
                <p>Salah satu karunia Roh Kudus adalah nubuat. Karunia ini adalah tanda pengenal gereja yang sisa dan itu diwujudkan dalam pelayanan Ellen G. White.</p>
                <h3 className="text-navy-900 font-bold text-xl pt-2">Peran dalam Gereja</h3>
                <p>Sebagai utusan Tuhan, tulisan-tulisannya adalah sumber kebenaran yang terus menerus dan berwibawa yang memberikan hiburan, bimbingan, instruksi, dan koreksi kepada gereja.</p>
                <h3 className="text-navy-900 font-bold text-xl pt-2">Menunjuk ke Alkitab</h3>
                <p>Tulisan-tulisannya juga memperjelas bahwa Alkitab adalah standar di mana semua pengajaran dan pengalaman harus diuji. Beliau menyebut tulisan-tulisannya sebagai "terang yang lebih kecil untuk menuntun pria dan wanita kepada terang yang lebih besar" yaitu Alkitab.</p>
                <div className="bg-navy-900 p-6 rounded-2xl border-l-[6px] border-gold-400 my-8 shadow-md">
                    <h4 className="font-bold text-gold-400 mb-2 flex items-center"><Icon name="Info" className="w-5 h-5 mr-2" />Tahukah Anda?</h4>
                    <p className="text-sm font-medium text-navy-100 leading-relaxed">Ellen G. White adalah salah satu penulis wanita yang karyanya paling banyak diterjemahkan dalam sejarah kesusastraan dunia, dengan fokus utama pada pendidikan, kesehatan, dan kehidupan rohani.</p>
                </div>
                <ContactGembala dataPejabat={dataPejabat} isLoading={isLoading} />
            </div>
        </div>
    </div>
);

// Helper Rendering Sub-Group untuk Perjamuan
const renderPerjamuanGroup = (title, items) => (
    <div className="bg-white border border-purple-100 rounded-lg overflow-hidden shadow-sm">
        <h3 className="font-bold text-purple-800 text-sm mb-0 bg-purple-50 p-2.5 border-b border-purple-100 text-center uppercase tracking-wider">{title}</h3>
        <div className="flex flex-col">
            {items.map((p, i) => (
                <div key={i} className="flex justify-between items-center px-3 py-2 border-b border-purple-50 last:border-0 hover:bg-purple-50/50 transition">
                    <span className="text-xs text-purple-600 font-semibold w-1/2">{p.tugas}</span>
                    <span className="text-sm font-bold text-gray-800 text-right w-1/2">{p.nama}</span>
                </div>
            ))}
        </div>
    </div>
);

const Jadwal = ({ jadwalDB, jadwalSelectedDate, setJadwalSelectedDate, showPerjamuan, perjamuanYMD, activePerjamuan, isLoading, gdriveUrl }) => {
    // Generate list of Rabu & Sabtu dates from today onwards
    const today = React.useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

    const allDates = React.useMemo(() => {
        const dates = [];
        const seen = new Set();
        // Include explicitly selected date (e.g. from search) if valid
        if (jadwalSelectedDate) {
            const selDate = new Date(jadwalSelectedDate + 'T00:00:00');
            const selDay = selDate.getDay();
            if ((selDay === 3 || selDay === 6) && !isNaN(selDate.getTime())) {
                seen.add(jadwalSelectedDate);
                dates.push(jadwalSelectedDate);
            }
        }
        for (let i = 0; i <= 56; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const day = d.getDay();
            if (day === 3 || day === 6) {
                const ymd = toYMD(d);
                if (!seen.has(ymd)) { seen.add(ymd); dates.push(ymd); }
            }
        }
        Object.keys(jadwalDB || {}).forEach(dateStr => {
            if (!seen.has(dateStr)) {
                const d = new Date(dateStr + 'T00:00:00');
                if (d >= today && (d.getDay() === 3 || d.getDay() === 6)) { seen.add(dateStr); dates.push(dateStr); }
            }
        });
        dates.sort();
        return dates;
    }, [jadwalDB, today, jadwalSelectedDate]);

    const selectedDate = (jadwalSelectedDate && allDates.includes(jadwalSelectedDate)) ? jadwalSelectedDate : allDates[0] || null;
    const currentIndex = selectedDate ? allDates.indexOf(selectedDate) : 0;
    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex < allDates.length - 1;

    const handlePrev = () => { if (canGoPrev) setJadwalSelectedDate(allDates[currentIndex - 1]); };
    const handleNext = () => { if (canGoNext) setJadwalSelectedDate(allDates[currentIndex + 1]); };

    const isRabu = selectedDate ? new Date(selectedDate + 'T00:00:00').getDay() === 3 : false;
    const activeRabu = isRabu ? (jadwalDB?.[selectedDate] || initialJadwalRabu) : initialJadwalRabu;
    const activeSabat = !isRabu ? (jadwalDB?.[selectedDate] || initialJadwalSabat) : initialJadwalSabat;

    const handleShareRabu = () => {
        const formatTime = (t) => t ? t.replace(/:/g, '.') : '';

        let text = `*Pengumuman Ibadah Permintaan Doa*\n`;
        text += `*${formatIndoDate(selectedDate)}*\n`;
        text += `Pukul ${formatTime(activeRabu.time)}\n\n`;

        text += `*Petugas Pelayanan:*\n`;
        activeRabu.petugas.forEach(p => {
            if (p.tugas && p.nama) {
                text += `${p.tugas}: ${p.nama}\n`;
            }
        });
        text += `\n`;

        text += `Mohon kehadiran tepat waktu. Tuhan memberkati.`;

        if (navigator.share) {
            navigator.share({
                text: text
            }).catch(err => {
                console.log('Share failed:', err);
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert("Teks pengumuman disalin ke clipboard!");
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }).catch(err => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            });
        }
    };

    const handleShare = () => {
        const formatTime = (t) => t ? t.replace(/:/g, '.') : '';

        // Group diakon/diakones
        const diakonList = activeSabat.diakon.filter(p => p.tugas.toLowerCase().includes('diakon') && !p.tugas.toLowerCase().includes('diakones')).map(p => p.nama).filter(Boolean);
        const diakonesList = activeSabat.diakon.filter(p => p.tugas.toLowerCase().includes('diakones')).map(p => p.nama).filter(Boolean);

        let text = `*Pengumuman Ibadah Sabat*\n`;
        text += `*${formatIndoDate(selectedDate)}*\n`;
        text += `Pukul ${formatTime(activeSabat.time)}\n\n`;

        text += `*Sekolah Sabat (${formatTime(activeSabat.sekolahSabatTime)})*\n`;
        activeSabat.sekolahSabat.forEach(p => {
            if (p.tugas && p.nama) {
                text += `${p.tugas}: ${p.nama}\n`;
            }
        });
        text += `\n`;

        text += `*Diakon & Diakones*\n`;
        if (diakonList.length > 0) {
            text += `Diakon: ${diakonList.join(' & ')}\n`;
        }
        if (diakonesList.length > 0) {
            text += `Diakones: ${diakonesList.join(' & ')}\n`;
        }
        text += `\n`;

        text += `*Khotbah (${formatTime(activeSabat.khotbahTime)})*\n`;
        activeSabat.khotbah.forEach(p => {
            if (p.tugas && p.nama) {
                text += `${p.tugas}: ${p.nama}\n`;
            }
        });
        text += `\n`;

        text += `*Pelayanan Musik*\n`;
        activeSabat.musik.forEach(p => {
            if (p.tugas && p.nama) {
                text += `${p.tugas}: ${p.nama}\n`;
            }
        });
        text += `\n`;

        text += `Mohon kehadiran tepat waktu. Tuhan memberkati.`;

        if (navigator.share) {
            navigator.share({
                text: text
            }).catch(err => {
                console.log('Share failed:', err);
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert("Teks pengumuman disalin ke clipboard!");
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }).catch(err => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            });
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in relative z-10">
            {/* Tombol GDrive Jadwal Lengkap */}
            <div className="bg-white p-5 md:p-6 rounded-[1.25rem] shadow-sm border border-navy-100/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-navy-900 text-[1.15rem]">Jadwal Lengkap</h3>
                    <p className="text-sm text-navy-500 mt-1">Lihat dan unduh file PDF jadwal pelayanan bulanan / triwulan di Google Drive.</p>
                </div>
                <a href={gdriveUrl || "https://drive.google.com"} target="_blank" rel="noopener noreferrer" className="bg-navy-900 hover:bg-navy-800 text-gold-400 px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center shrink-0 w-full sm:w-auto justify-center">
                    <Icon name="BookOpen" className="w-[1.15rem] h-[1.15rem] mr-2 text-gold-500" /> Buka Google Drive
                </a>
            </div>

            {/* Date Picker Navigation */}
            {selectedDate && (
                <div className="bg-white p-4 md:p-5 rounded-[1.25rem] shadow-sm border border-navy-100/60">
                    <div className="flex items-center justify-between">
                        <button onClick={handlePrev} disabled={!canGoPrev} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${canGoPrev ? 'bg-navy-900 text-gold-400 hover:bg-navy-800 shadow-sm active:scale-95' : 'bg-navy-50 text-navy-200 cursor-not-allowed'}`}>
                            <Icon name="ChevronLeft" className="w-5 h-5" />
                        </button>
                        <div className="text-center flex-1 px-3">
                            <h3 className="font-black text-navy-900 text-lg tracking-tight">{formatIndoDateFull(selectedDate)}</h3>
                            <p className="text-xs font-semibold text-navy-400 mt-0.5 uppercase tracking-widest">{isRabu ? 'Ibadah Permintaan Doa' : 'Ibadah Sabat'}</p>
                        </div>
                        <button onClick={handleNext} disabled={!canGoNext} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${canGoNext ? 'bg-navy-900 text-gold-400 hover:bg-navy-800 shadow-sm active:scale-95' : 'bg-navy-50 text-navy-200 cursor-not-allowed'}`}>
                            <Icon name="ChevronRight" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Banner Spesial Perjamuan Kudus */}
            {showPerjamuan && (
                <div className="bg-gradient-to-br from-gold-50 to-white p-5 md:p-6 rounded-[1.25rem] shadow-sm border border-gold-200 relative overflow-hidden animate-fade-in">
                    <div className="absolute top-0 right-0 bg-gold-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-sm">Jadwal Spesial</div>
                    <div className="flex items-center space-x-3 mb-5 border-b border-gold-200 pb-3">
                        <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center text-gold-600"><Icon name="Gift" className="w-5 h-5" /></div>
                        <div>
                            <h2 className="text-xl font-black text-navy-900 leading-tight">Pelayanan Perjamuan Kudus</h2>
                            <p className="text-sm font-bold text-gold-600 mt-0.5">{formatIndoDate(perjamuanYMD)}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderPerjamuanGroup("Persiapan Roti & Anggur", activePerjamuan.slice(0, 5))}
                        {renderPerjamuanGroup("Persiapan & Basuh Kaki", activePerjamuan.slice(5, 11))}
                        {renderPerjamuanGroup("Pelayan Perjamuan", activePerjamuan.slice(11, 15))}
                        {renderPerjamuanGroup("Pembersihan Alat", activePerjamuan.slice(15, 20))}
                    </div>
                </div>
            )}

            {isRabu ? (
            <div className="bg-white p-5 md:p-7 rounded-[1.5rem] shadow-sm border border-navy-100/60 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 border-b pb-4 border-navy-50">
                    <div className="flex items-center space-x-3">
                        <Icon name="Calendar" className="w-[1.4rem] h-[1.4rem] text-gold-500" />
                        <div><h2 className="text-lg font-bold text-navy-900 tracking-tight">{activeRabu.title}</h2><p className="text-sm font-semibold text-navy-400 mt-0.5">{formatIndoDate(selectedDate)}</p></div>
                    </div>
                    <span className="text-xs font-bold text-navy-800 bg-gold-50 px-4 py-1.5 rounded-full mt-3 md:mt-0 w-fit border border-gold-200 uppercase tracking-widest shadow-sm">{activeRabu.time}</span>
                </div>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                        <div className="w-full"><SkeletonList rows={4} /></div>
                        <div className="w-full hidden md:block"><SkeletonList rows={4} /></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                            {activeRabu.petugas.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-navy-50/50 last:border-0 md:[&:nth-last-child(-n+2)]:border-0 px-2 hover:bg-navy-50/30 transition-colors rounded-lg"><span className="text-sm text-navy-500 font-medium">{p.tugas}</span><span className="text-sm font-bold text-navy-900 text-right">{p.nama}</span></div>
                            ))}
                        </div>
                        {/* Share Button */}
                        <div className="mt-6 pt-4 border-t border-navy-50 flex justify-end">
                            <button
                                onClick={handleShareRabu}
                                className="bg-navy-900 hover:bg-navy-800 text-gold-400 px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center w-full sm:w-auto"
                            >
                                <Icon name="Share" className="w-4 h-4 mr-2 text-gold-400" />
                                Bagikan Pengumuman
                            </button>
                        </div>
                    </>
                )}
            </div>
            ) : (
            <div className="bg-white p-5 md:p-7 rounded-[1.5rem] shadow-sm border-t-[6px] border-navy-800 border-x border-b border-navy-100/60 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b pb-4 border-navy-50">
                    <div className="flex items-center space-x-3">
                        <Icon name="Calendar" className="w-[1.4rem] h-[1.4rem] text-gold-500" />
                        <div><h2 className="text-lg font-bold text-navy-900 tracking-tight">{activeSabat.title}</h2><p className="text-sm font-semibold text-navy-400 mt-0.5">{formatIndoDate(selectedDate)}</p></div>
                    </div>
                    <span className="text-xs font-bold text-navy-800 bg-gold-50 px-4 py-1.5 rounded-full mt-3 md:mt-0 w-fit border border-gold-200 uppercase tracking-widest shadow-sm">Waktu: {activeSabat.time}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2 bg-navy-50/50 p-3 rounded-xl border border-navy-100/50"><h3 className="font-bold text-navy-800 text-sm uppercase tracking-wider">Sekolah Sabat</h3><span className="text-[11px] text-navy-600 font-bold bg-white px-2 py-0.5 rounded-full border border-navy-100">{activeSabat.sekolahSabatTime}</span></div>
                            {isLoading ? <SkeletonList rows={5} /> : <div className="flex flex-col">{activeSabat.sekolahSabat.map((p, idx) => (<div key={idx} className="flex justify-between items-center py-2 border-b border-navy-50/50 last:border-0 hover:bg-navy-50/30 transition-colors rounded-lg px-2"><span className="text-sm text-navy-500 font-medium">{p.tugas}</span><span className="text-sm font-bold text-navy-900 text-right">{p.nama}</span></div>))}</div>}
                        </div>
                        <div>
                            <div className="mb-2 bg-navy-50/50 p-3 rounded-xl border border-navy-100/50"><h3 className="font-bold text-navy-800 text-sm uppercase tracking-wider">Diakon & Diakones</h3></div>
                            {isLoading ? <SkeletonList rows={4} /> : <div className="flex flex-col">{activeSabat.diakon.map((p, idx) => (<div key={idx} className="flex justify-between items-center py-2 border-b border-navy-50/50 last:border-0 hover:bg-navy-50/30 transition-colors rounded-lg px-2"><span className="text-sm text-navy-500 font-medium">{p.tugas}</span><span className="text-sm font-bold text-navy-900 text-right">{p.nama}</span></div>))}</div>}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2 bg-navy-50/50 p-3 rounded-xl border border-navy-100/50"><h3 className="font-bold text-navy-800 text-sm uppercase tracking-wider">Khotbah / Umum</h3><span className="text-[11px] text-navy-600 font-bold bg-white px-2 py-0.5 rounded-full border border-navy-100">{activeSabat.khotbahTime}</span></div>
                            {isLoading ? <SkeletonList rows={6} /> : <div className="flex flex-col">{activeSabat.khotbah.map((p, idx) => (<div key={idx} className="flex justify-between items-center py-2 border-b border-navy-50/50 last:border-0 hover:bg-navy-50/30 transition-colors rounded-lg px-2"><span className="text-sm text-navy-500 font-medium">{p.tugas}</span><span className="text-sm font-bold text-navy-900 text-right">{p.nama}</span></div>))}</div>}
                        </div>
                        <div>
                            <div className="mb-2 bg-navy-50/50 p-3 rounded-xl border border-navy-100/50"><h3 className="font-bold text-navy-800 text-sm uppercase tracking-wider">Pelayanan Musik</h3></div>
                            {isLoading ? <SkeletonList rows={4} /> : <div className="flex flex-col">{activeSabat.musik.map((p, idx) => (<div key={idx} className="flex justify-between items-center py-2 border-b border-navy-50/50 last:border-0 hover:bg-navy-50/30 transition-colors rounded-lg px-2"><span className="text-sm text-navy-500 font-medium">{p.tugas}</span><span className="text-sm font-bold text-navy-900 text-right">{p.nama}</span></div>))}</div>}
                        </div>
                    </div>
                </div>

                {/* Share Button */}
                {!isLoading && (
                    <div className="mt-8 pt-6 border-t border-navy-50 flex justify-end">
                        <button
                            onClick={handleShare}
                            className="bg-navy-900 hover:bg-navy-800 text-gold-400 px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center w-full sm:w-auto"
                        >
                            <Icon name="Share" className="w-4 h-4 mr-2 text-gold-400" />
                            Bagikan Pengumuman
                        </button>
                    </div>
                )}
            </div>
            )}
        </div>
    );
};

const Live = ({ setActiveTab, activeRabu, activeSabat, rabuYMD, sabatYMD, youtubeUrl, isLiveYoutube, youtubeTitle, isLoading, laguSionDb, setLaguSionInitialSong }) => {
    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in">
            <SusunanIbadah setActiveTab={setActiveTab} activeSabat={activeSabat} sabatYMD={sabatYMD} isLoading={isLoading} laguSionDb={laguSionDb} setLaguSionInitialSong={setLaguSionInitialSong} />
        </div>
    );
};

const Persembahan = ({ dataPejabat, isLoading, setActiveTab }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        const textToCopy = "5114477778";
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(() => {
                fallbackCopy(textToCopy);
            });
        } else {
            fallbackCopy(textToCopy);
        }
    };

    const fallbackCopy = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
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
        document.body.removeChild(textArea);
    };

    const bendaharas = dataPejabat.filter(p => (p.jabatan && p.jabatan.toLowerCase().includes('bendahara')) || (p.kategori && p.kategori.toLowerCase() === 'keuangan'));
    const qrisUrl = "https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/811ba11f-520e-4307-89d3-34cd3011d3c8/WhatsApp_Image_2025-05-16_at_12.01.55_65684299/w=1920,quality=90,fit=scale-down";
    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in relative z-10">
            <div className="relative pt-2 md:pt-4">
                <div className="flex items-center space-x-3 mb-6"><Icon name="Gift" className="w-[1.4rem] h-[1.4rem] text-gold-500" /><h2 className="text-xl font-bold text-navy-900 tracking-tight">Persembahan, Perpuluhan, Ucapan Syukur, dan Donasi</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch mb-8">
                    <div className="flex flex-col items-center p-6 bg-white/60 rounded-2xl border border-navy-100/50 h-full justify-center shadow-sm">
                        <div className="w-40 md:w-48 bg-white border border-navy-100 p-2.5 rounded-xl shadow-sm mb-4"><img loading="lazy" src={qrisUrl} alt="QRIS GMAHK Tidar 1" className="w-full h-auto object-contain rounded-lg" crossOrigin="anonymous" /></div>
                        <a href={qrisUrl} target="_blank" rel="noopener noreferrer" download="QRIS_GMAHK_Tidar1.jpg" className="bg-navy-900 hover:bg-navy-800 text-gold-400 px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow"><Icon name="Download" className="w-3.5 h-3.5" /><span>Download QRIS</span></a>
                    </div>
                    <div className="flex flex-col justify-center text-center p-6 bg-navy-900 border border-gold-300 rounded-2xl h-full shadow-sm text-gold-400">
                        <p className="text-xs md:text-sm font-bold mb-1 tracking-wide uppercase">Atau Transfer Bank ke:</p>
                        <div className="flex items-center justify-center space-x-2 my-1 select-all relative">
                            <span className="font-extrabold text-2xl md:text-3xl tracking-widest font-mono">511-44-7777-8</span>
                            <button
                                onClick={handleCopy}
                                className="p-1.5 md:p-2 rounded-lg bg-navy-800 hover:bg-navy-700 active:scale-95 transition-all text-gold-400 border border-gold-400/20 hover:border-gold-400/50 flex items-center justify-center focus:outline-none relative group"
                                title="Salin Nomor Rekening (Hanya Angka)"
                            >
                                {copied ? (
                                    <Icon name="Check" className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 animate-[pulse_1s_infinite]" />
                                ) : (
                                    <Icon name="Copy" className="w-4 h-4 md:w-5 md:h-5" />
                                )}

                                {copied && (
                                    <span className="absolute bottom-full mb-2 bg-emerald-600 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-lg font-bold whitespace-nowrap animate-fade-in z-20">
                                        Tersalin!
                                    </span>
                                )}
                            </button>
                        </div>
                        {copied && (
                            <span className="text-[10px] text-emerald-400 font-bold animate-fade-in block mb-1">
                                Nomor rekening berhasil disalin tanpa tanda hubung!
                            </span>
                        )}
                        <p className="text-xs md:text-sm font-bold opacity-90">BCA a/n GMAHK Tidar 1 Surabaya</p>
                    </div>
                </div>
                <div className="bg-white/60 p-5 md:p-6 rounded-2xl border border-navy-100/50 space-y-6 shadow-sm">
                    <div>
                        <h3 className="font-bold text-navy-900 text-sm mb-1.5 flex items-center"><span className="bg-gold-400/20 text-gold-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs mr-2 border border-gold-400/30 font-bold">1</span>Hubungi Bendahara</h3>
                        <p className="text-xs text-navy-600 mb-3 pl-7 font-medium">Kirim bukti transfer ke salah satu Bendahara kami:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 md:pl-7">
                            {isLoading ? (
                                <>
                                    <SkeletonCard />
                                    <SkeletonCard />
                                </>
                            ) : bendaharas.map((p, idx) => (
                                <a key={idx} href={`https://wa.me/${p.wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-2.5 rounded-xl border border-navy-100 bg-white hover:bg-gold-50 hover:border-gold-200 transition group shadow-sm"><img loading="lazy" src={p.img} alt={p.nama} className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-transparent group-hover:border-gold-400 transition" /><div><p className="text-[9px] font-bold text-navy-500 group-hover:text-gold-600 transition-colors uppercase tracking-widest">{p.jabatan}</p><p className="font-bold text-navy-900 text-sm">{p.nama}</p></div></a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-navy-900 text-sm mb-1.5 flex items-center"><span className="bg-navy-900/10 text-navy-800 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs mr-2 font-bold">2</span>Sertakan Keterangan</h3>
                        <p className="text-xs text-navy-600 mb-4 pl-7 font-medium">Sebutkan rincian nominal persembahan Anda pada chat WhatsApp:</p>
                        <div className="flex flex-wrap gap-2 pl-0 md:pl-7">
                            {['Perpuluhan', 'Persembahan Terpadu', 'Persembahan Khusus', 'Persembahan Syukur', 'Donasi Kas Gereja', 'Donasi Kas Departemen', 'Lain-lain'].map((item, i) => { const colors = ['bg-gold-500', 'bg-navy-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-teal-500', 'bg-gray-500']; return (<span key={i} className="flex items-center bg-white border border-navy-100 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold text-navy-700 shadow-sm"><span className={`w-1.5 h-1.5 rounded-full ${colors[i]} mr-2`}></span>{item}</span>); })}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

const Keanggotaan = ({ setActiveTab }) => (
    <div className="space-y-6 animate-fade-in relative z-10">
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60">
            <h2 className="text-[1.3rem] font-black mb-4 text-navy-900 border-b pb-3 border-navy-50">Layanan Keanggotaan</h2>
            <p className="text-sm font-medium text-navy-600 mb-6">Pilih jenis permohonan keanggotaan yang sesuai dengan status Anda saat ini.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                <button onClick={() => setActiveTab('member_baru')} className="w-full text-left p-5 rounded-[1.25rem] border border-navy-100/50 bg-navy-50/30 hover:bg-navy-50 transition-colors flex items-center justify-between h-full group shadow-sm"><div><h3 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors">Member Baru</h3><p className="text-xs font-medium text-navy-500 mt-1.5 leading-relaxed">Untuk yang belum pernah menjadi anggota GMAHK (Non-Adventist).</p></div><span className="text-gold-500 font-black text-xl ml-4 transform group-hover:translate-x-1 transition-transform">&rarr;</span></button>
                <button onClick={() => setActiveTab('form_acms')} className="w-full text-left p-5 rounded-[1.25rem] border border-navy-100/50 bg-navy-50/30 hover:bg-navy-50 transition-colors flex items-center justify-between h-full group shadow-sm"><div><h3 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors">Pindah Masuk - ACMS</h3><p className="text-xs font-medium text-navy-500 mt-1.5 leading-relaxed">Untuk anggota GMAHK yang ingin pindah ke Tidar 1.</p></div><span className="text-gold-500 font-black text-xl ml-4 transform group-hover:translate-x-1 transition-transform">&rarr;</span></button>
                <button onClick={() => setActiveTab('perlawatan')} className="w-full text-left p-5 rounded-[1.25rem] border border-navy-100/50 bg-navy-50/30 hover:bg-navy-50 transition-colors flex items-center justify-between h-full group shadow-sm"><div><h3 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors">Perlawatan</h3><p className="text-xs font-medium text-navy-500 mt-1.5 leading-relaxed">Permintaan perlawatan dari jemaat kepada pendeta atau officers gereja.</p></div><span className="text-gold-500 font-black text-xl ml-4 transform group-hover:translate-x-1 transition-transform">&rarr;</span></button>
                <button onClick={() => setActiveTab('buku_tamu')} className="w-full text-left p-5 rounded-[1.25rem] border border-navy-100/50 bg-navy-50/30 hover:bg-navy-50 transition-colors flex items-center justify-between h-full group shadow-sm"><div><h3 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors">Buku Tamu</h3><p className="text-xs font-medium text-navy-500 mt-1.5 leading-relaxed">Pengisian data kehadiran dan kunjungan bagi tamu jemaat.</p></div><span className="text-gold-500 font-black text-xl ml-4 transform group-hover:translate-x-1 transition-transform">&rarr;</span></button>
            </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60 pb-safe">
            <h2 className="text-[1.3rem] font-black mb-4 text-navy-900 border-b pb-3 border-navy-50">Jadwal Kegiatan & Pelayanan</h2>
            <p className="text-sm font-medium text-navy-600 mb-6">Lihat jadwal ibadah rutin dan daftar petugas pelayanan jemaat Tidar 1.</p>
            <button onClick={() => setActiveTab('jadwal')} className="w-full text-left p-5 rounded-[1.25rem] border border-gold-200 bg-gradient-to-br from-gold-50 to-white hover:border-gold-300 transition-colors flex items-center justify-between group shadow-sm"><div className="flex items-center"><div className="w-[3rem] h-[3rem] bg-gold-400 rounded-full flex items-center justify-center text-navy-900 mr-4 shrink-0 shadow-sm"><Icon name="Calendar" className="w-5 h-5" /></div><div><h3 className="font-bold text-navy-900">Lihat Jadwal Jemaat</h3><p className="text-xs font-medium text-navy-600 mt-1">Jadwal petugas ibadah hari Rabu dan Sabat.</p></div></div><span className="text-gold-500 font-black text-xl ml-4 transform group-hover:translate-x-1 transition-transform">&rarr;</span></button>
        </div>
    </div>
);

const MemberBaru = ({ setActiveTab, dataPejabat, isLoading }) => {
    const contacts = dataPejabat.filter(p => ['gembala', 'ketua1', 'ketua2'].includes(p.id));

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
                "Anggota baru dianjurkan untuk aktif dalam pelayanan gereja, seperti pelayanan sosial, sekolah Sabat, paduan suara, atau penginjilan.",
                "Bertumbuh secara rohani melalui doa, studi Alkitab, dan persekutuan dengan jemaat."
            ]
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60">
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

            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60">
                <h2 className="text-[1.3rem] font-black mb-4 text-navy-900 border-b pb-3 border-navy-50">Hubungi Pelayan Jemaat</h2>
                <p className="text-sm font-medium text-navy-600 mb-6">Silakan hubungi Pendeta atau Ketua Jemaat kami untuk bimbingan rohani dan persiapan keanggotaan:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                    {isLoading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : contacts.map(p => (<a key={p.id} href={`https://wa.me/${p.wa}`} target="_blank" className="flex items-center justify-between p-4 rounded-xl border border-navy-100 bg-white hover:bg-gold-50 hover:border-gold-200 transition-colors h-full group shadow-sm"><div className="flex items-center"><img loading="lazy" src={p.img} alt={p.nama} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-transparent group-hover:border-gold-400 transition-colors shrink-0" /><div><p className="font-bold text-navy-500 text-[10px] uppercase tracking-widest">{p.jabatan}</p><p className="text-sm font-bold text-navy-900 mt-1 leading-tight">{p.nama}</p></div></div><span className="text-gold-500 font-bold ml-2 opacity-50 group-hover:opacity-100 transition-opacity"><Icon name="MessageCircle" className="w-5 h-5" /></span></a>))}
                </div>
            </div>
        </div>
    );
};

const PindahMasuk = ({ setActiveTab, dataPejabat, isLoading }) => {
    const contacts = dataPejabat.filter(p => ['sekretaris1', 'sekretaris2'].includes(p.id));
    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60">
                <h2 className="text-[1.3rem] font-black mb-4 text-navy-900 border-b pb-3 border-navy-50">Pengurusan ACMS</h2>
                <p className="text-sm font-medium text-navy-600 mb-6">Silakan isi formulir ACMS atau hubungi Sekretaris Jemaat kami untuk bantuan kepindahan:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                    <button onClick={() => setActiveTab('form_acms')} className="flex items-center justify-between p-4 rounded-xl border border-gold-300 bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 transition-colors h-full w-full text-left shadow text-navy-900 group"><div className="flex items-center"><div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-navy-900 mr-4 shrink-0"><Icon name="BookOpen" className="w-5 h-5" /></div><div><p className="font-black text-navy-900 text-sm md:text-base leading-tight">Formulir Pindah Masuk</p><p className="text-xs font-bold text-navy-800 mt-1 opacity-90">Isi Data Online</p></div></div><span className="text-navy-900 font-bold ml-2 transform group-hover:translate-x-1 transition-transform">&rarr;</span></button>
                    {isLoading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : contacts.map(p => (<a key={p.id} href={`https://wa.me/${p.wa}`} target="_blank" className="flex items-center justify-between p-4 rounded-xl border border-navy-100 bg-white hover:bg-gold-50 hover:border-gold-200 transition-colors h-full group shadow-sm"><div className="flex items-center"><img loading="lazy" src={p.img} alt={p.nama} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-transparent group-hover:border-gold-400 transition-colors shrink-0" /><div><p className="font-bold text-navy-500 text-[10px] uppercase tracking-widest">{p.jabatan}</p><p className="text-sm font-bold text-navy-900 mt-1 leading-tight">{p.nama}</p></div></div><span className="text-gold-500 font-bold ml-2 opacity-50 group-hover:opacity-100 transition-opacity"><Icon name="MessageCircle" className="w-5 h-5" /></span></a>))}
                </div>
            </div>
        </div>
    );
};

const Hubungi = ({ setActiveTab, dataPejabat, isLoading }) => {
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

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in relative z-10">
                <div className="relative pt-2 md:pt-4">
                    <SkeletonBlock className="h-6 w-1/4 mb-5" />
                    <div className="grid grid-cols-3 gap-2 md:gap-6 items-stretch">
                        {[...Array(3)].map((_, i) => <SkeletonCardContact key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in relative z-10 pt-2 md:pt-4">
            {categories.map((cat, idx) => {
                const items = dataPejabat.filter(cat.filter);
                if (items.length === 0) return null;

                return (
                    <div key={idx} className="relative mb-10 last:mb-0">
                        <h2 className="text-xl md:text-2xl font-black mb-6 text-navy-900">{cat.title}</h2>
                        <div className="grid grid-cols-3 gap-2 md:gap-6 items-stretch">
                            {items.map((p, i) => (
                                <div key={i} className="flex flex-col bg-white p-2 sm:p-3 md:p-5 rounded-xl sm:rounded-2xl md:rounded-[2rem] shadow-sm border border-navy-100/60 hover:shadow-xl transition-all duration-300 group h-full">
                                    <div className="text-center mt-1 sm:mt-2 md:mt-3 mb-2 sm:mb-3 md:mb-5">
                                        <h3 className="font-black text-navy-900 text-[11px] sm:text-sm md:text-xl tracking-tight leading-tight group-hover:text-gold-600 transition-colors line-clamp-2 md:line-clamp-none">{p.nama}</h3>
                                        <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-navy-500 flex items-center justify-center mt-0.5 sm:mt-1 md:mt-2">{p.jabatan}</p>
                                    </div>
                                    <div className="w-full aspect-square mb-2 sm:mb-3 md:mb-5 overflow-hidden rounded-lg sm:rounded-xl md:rounded-[1.5rem] relative shadow-inner">
                                        <img loading="lazy" src={p.img} alt={p.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                    </div>
                                    <div className="mt-auto">
                                        <a href={`https://wa.me/${p.wa}`} target="_blank" rel="noopener noreferrer" className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-1.5 sm:py-2 md:py-3.5 rounded-md sm:rounded-lg md:rounded-full flex items-center justify-center transition-all shadow-md group-hover:shadow-lg">
                                            <Icon name="MessageCircle" className="w-3 h-3 sm:w-4 sm:h-4 md:w-[1.15rem] md:h-[1.15rem] md:mr-2 text-green-400" />
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
    );
};

const SignaturePad = ({ value, onChange }) => {
    const canvasRef = React.useRef(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [isEmpty, setIsEmpty] = React.useState(!value);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#1e293b'; // Slate 800 (navy)
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Load existing value if any
        if (value) {
            const img = new Image();
            img.src = value;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setIsEmpty(false);
            };
        }

        // To prevent scrolling on mobile devices when touching the signature area
        const preventDefault = (e) => {
            if (e.target === canvas) {
                e.preventDefault();
            }
        };

        // Attach touch move listener with passive: false to prevent scrolling
        document.body.addEventListener('touchstart', preventDefault, { passive: false });
        document.body.addEventListener('touchmove', preventDefault, { passive: false });
        document.body.addEventListener('touchend', preventDefault, { passive: false });

        return () => {
            document.body.removeEventListener('touchstart', preventDefault);
            document.body.removeEventListener('touchmove', preventDefault);
            document.body.removeEventListener('touchend', preventDefault);
        };
    }, []);

    React.useEffect(() => {
        if (!value) {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setIsEmpty(true);
            }
        }
    }, [value]);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        if (e.touches && e.touches[0]) {
            return {
                x: ((e.touches[0].clientX - rect.left) / rect.width) * canvas.width,
                y: ((e.touches[0].clientY - rect.top) / rect.height) * canvas.height
            };
        }

        return {
            x: ((e.clientX - rect.left) / rect.width) * canvas.width,
            y: ((e.clientY - rect.top) / rect.height) * canvas.height
        };
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const coords = getCoordinates(e);

        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const coords = getCoordinates(e);

        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        setIsEmpty(false);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        saveSignature();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        onChange('');
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Export the drawn canvas content to base64
        const dataUrl = canvas.toDataURL('image/png');
        onChange(dataUrl);
    };

    return (
        <div className="space-y-3">
            <div className="relative border-2 border-navy-200 bg-white rounded-2xl shadow-inner overflow-hidden h-44">
                {/* Background Guide Line and Text */}
                {isEmpty && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-navy-400/80 pointer-events-none select-none px-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 mb-2 animate-bounce">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                        <p className="text-xs font-bold uppercase tracking-wider">Tanda Tangan di Sini</p>
                        <p className="text-[10px] mt-1 font-medium">Gunakan mouse atau jari Anda</p>
                    </div>
                )}
                
                {/* Dashed baseline helper */}
                <div className="absolute left-6 right-6 bottom-8 border-b border-dashed border-navy-100 pointer-events-none"></div>

                <canvas
                    ref={canvasRef}
                    width={600}
                    height={176}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                />
            </div>
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={clearCanvas}
                    disabled={isEmpty}
                    className={`flex items-center text-xs font-bold px-4 py-2 rounded-xl transition ${
                        isEmpty 
                            ? 'bg-navy-50 text-navy-300 cursor-not-allowed' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm'
                    }`}
                >
                    <Icon name="Trash" className="w-3.5 h-3.5 mr-1.5" />
                    Hapus Tanda Tangan
                </button>
            </div>
        </div>
    );
};

const FormACMS = ({ setActiveTab, dataPejabat }) => {
    const [step, setStep] = React.useState('fill');

    // Scroll to top of the page when form step changes
    React.useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    const [isGenerating, setIsGenerating] = React.useState(false);
    const [formData, setFormData] = React.useState({ namaLengkap: '', jenisKelamin: 'Laki-laki', tanggalLahir: '', namaIbu: '', baptisanTanggal: '', baptisanTempat: '', baptisanPendeta: '', masaDisiplin: 'TIDAK', pernahPindah: 'BELUM', jemaatAsalNama: '', jemaatAsalAlamat: '', jemaatAsalSekretaris: '', jemaatAsalKontak: '', tandaTangan: '' });
    const [showCaptcha, setShowCaptcha] = React.useState(false);
    const [captcha, setCaptcha] = React.useState({ num1: 0, num2: 0 });
    const [captchaInput, setCaptchaInput] = React.useState('');
    const [captchaError, setCaptchaError] = React.useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.tandaTangan) {
            alert('Silakan isi tanda tangan digital Anda terlebih dahulu pada Bagian D.');
            return;
        }
        setStep('preview');
        window.scrollTo(0, 0);
    };
    const generateCaptcha = () => { setCaptcha({ num1: Math.floor(Math.random() * 10) + 1, num2: Math.floor(Math.random() * 10) + 1 }); setCaptchaInput(''); setCaptchaError(false); };
    const handleKirimClick = () => { generateCaptcha(); setShowCaptcha(true); };
    const verifyAndKirim = () => { if (parseInt(captchaInput) === captcha.num1 + captcha.num2) { setShowCaptcha(false); processPDF(); } else { setCaptchaError(true); generateCaptcha(); } };

    const processPDF = () => {
        setIsGenerating(true);
        const element = document.getElementById('pdf-content');
        const filename = `ACMS_03_${formData.namaLengkap.replace(/\s+/g, '_')}.pdf`;
        
        Promise.all([
            import('jspdf'),
            import('html2canvas-pro')
        ]).then(([jspdfModule, html2canvasModule]) => {
            const { jsPDF } = jspdfModule;
            const html2canvas = html2canvasModule.default;
            
            html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const imgWidth = 210;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
                pdf.save(filename);

                setIsGenerating(false);
                setStep('success');
            }).catch((err) => {
                console.error("PDF generation failed:", err);
                alert("Gagal membuat PDF. Silakan coba lagi.");
                setIsGenerating(false);
            });
        }).catch((err) => {
            console.error("Failed to load PDF libraries:", err);
            alert("Gagal memuat pustaka PDF. Silakan coba lagi.");
            setIsGenerating(false);
        });
    };

    if (step === 'success') {
        const contacts = dataPejabat ? dataPejabat.filter(p => ['sekretaris1', 'sekretaris2'].includes(p.id)) : [];
        
        const handleWhatsAppContact = (p) => {
            const text = `Syalom ${p.jabatan} ${p.nama},\n\nSaya ingin mengonfirmasi pengajuan permohonan pindah keanggotaan (ACMS) atas nama:\n\n` +
                `- *Nama Pemohon*: ${formData.namaLengkap}\n` +
                `- *Jenis Kelamin*: ${formData.jenisKelamin}\n` +
                `- *Jemaat Asal*: ${formData.jemaatAsalNama}\n\n` +
                `Saya telah mengunduh file PDF formulir permohonan pindah masuk ACMS. Berikut saya lampirkan dokumennya untuk dapat diproses lebih lanjut. Terima kasih, Tuhan memberkati.`;

            let cleaned = p.wa.replace(/[^0-9]/g, '');
            if (cleaned.startsWith('0')) {
                cleaned = '62' + cleaned.slice(1);
            }
            window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`, '_blank');
        };

        return (
            <div className="max-w-md mx-auto bg-white rounded-3xl border border-navy-100/60 shadow-xl overflow-hidden p-6 md:p-8 text-center space-y-6 my-4 animate-fade-in relative z-10">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto shadow-inner">
                    <Icon name="Check" className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-navy-900 tracking-tight">Dokumen Berhasil Dibuat!</h2>
                <p className="text-sm text-navy-600 leading-relaxed font-medium">
                    File PDF permohonan atas nama <b>{formData.namaLengkap}</b> telah berhasil <b>diunduh</b> ke perangkat Anda.
                </p>
                
                <div className="bg-navy-50/50 p-5 rounded-2xl text-left border border-navy-100 text-xs text-navy-700 space-y-3 shadow-inner">
                    <h3 className="font-bold text-navy-900 text-sm flex items-center border-b pb-2 border-navy-100/80">
                        <Icon name="Info" className="w-4.5 h-4.5 mr-1.5 text-gold-500" /> WhatsApp Direct Follow-up
                    </h3>
                    <p className="leading-relaxed">
                        Silakan hubungi Sekretaris Jemaat di bawah ini untuk konfirmasi cepat via WhatsApp. <b>Kirimkan file PDF permohonan yang baru saja diunduh kepada mereka.</b>
                    </p>
                    <div className="space-y-2 pt-1">
                        {contacts.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleWhatsAppContact(p)}
                                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-between group"
                            >
                                <span className="flex items-center text-left">
                                    <Icon name="Phone" className="w-4 h-4 mr-2" />
                                    <span>
                                        <span className="block text-[10px] uppercase opacity-75 font-semibold leading-tight">{p.jabatan}</span>
                                        <span className="text-xs font-bold leading-normal">{p.nama}</span>
                                    </span>
                                </span>
                                <span className="text-white font-black text-sm ml-2 transform group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-navy-50">
                    <button onClick={() => setActiveTab('keanggotaan')} className="w-full bg-navy-900 text-gold-400 hover:bg-navy-800 font-bold py-3.5 rounded-xl transition-all shadow-md">
                        Selesai & Kembali
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'preview') {
        return (
            <div className="space-y-6 animate-fade-in relative z-10">
                {showCaptcha && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/60 px-4 backdrop-blur-md">
                        <div className="bg-white rounded-[1.5rem] shadow-2xl p-6 md:p-8 max-w-sm w-full animate-fade-in text-center"><div className="w-16 h-16 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 scale-110"><Icon name="Shield" className="w-8 h-8" /></div><h3 className="text-2xl font-black text-navy-900 mb-2">Verifikasi Keamanan</h3><p className="text-sm font-medium text-navy-600 mb-6 leading-relaxed">Untuk menghindari spam otomatis, silakan selesaikan perhitungan sederhana berikut:</p><div className="flex items-center justify-center space-x-3 mb-6 bg-navy-50 p-5 rounded-2xl border border-navy-100/50 shadow-inner"><span className="text-2xl font-black text-navy-800 tracking-wider"> {captcha.num1} + {captcha.num2} = </span><input type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} className={`w-24 p-3 border-2 ${captchaError ? 'border-red-400 bg-red-50 text-red-700' : 'border-navy-200 bg-white text-navy-900 focus:border-gold-500'} rounded-xl text-3xl font-black text-center outline-none transition-colors drop-shadow-sm`} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') verifyAndKirim(); }} /></div>{captchaError && <p className="text-red-500 text-sm mb-6 font-bold animate-pulse">Jawaban salah, silakan coba lagi.</p>}<div className="flex justify-between space-x-4"><button onClick={() => setShowCaptcha(false)} className="w-1/2 py-3.5 text-navy-600 bg-navy-50 hover:bg-navy-100 rounded-xl transition font-bold">Batal</button><button onClick={verifyAndKirim} className="w-1/2 py-3.5 bg-navy-900 hover:bg-navy-800 text-gold-400 rounded-xl transition font-bold shadow-md">Kirim PDF</button></div></div>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 md:p-5 rounded-[1.5rem] shadow-sm border border-navy-100/60 gap-4">
                    <button onClick={() => setStep('fill')} className="text-navy-600 font-bold flex items-center hover:text-gold-600 transition-colors">&larr; Edit Formulir</button>
                    <button onClick={handleKirimClick} disabled={isGenerating} className={`w-full sm:w-auto ${isGenerating ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg'} px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center`}>{isGenerating ? <><span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></span> Memproses PDF...</> : <><Icon name="Download" className="w-4 h-4 mr-2" /> Unduh PDF & Kirim</>}</button>
                </div>
                <div className="bg-navy-100/50 shadow-inner overflow-x-auto border border-navy-200 rounded-[1.5rem] p-4 sm:p-8 relative">
                    <div className="absolute top-4 right-4 text-xs font-bold text-navy-400 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm z-10 pointer-events-none">Preview Saja</div>
                    <div className="w-max mx-auto shadow-xl bg-white relative rounded overflow-hidden">
                        <div
                            id="pdf-content"
                            className="pt-6 pb-4 px-8 bg-white text-black text-sm relative"
                            style={{
                                width: '210mm',
                                height: '297mm',
                                fontFamily: '"Open Sans", sans-serif',
                                boxSizing: 'border-box',
                                lineHeight: '1.15'
                            }}
                        >
                            <p className="text-[10px] text-gray-500 absolute top-4 right-10 leading-none">Form ACMS-03</p>
                            
                            {/* Header Section */}
                            <div className="flex justify-between items-center mb-6 mt-2">
                                <div className="w-[180px] flex justify-start">
                                    <img
                                        loading="lazy"
                                        src="https://i.postimg.cc/dQhq2HGf/png-acms-new-logo.png"
                                        alt="ACMS Logo"
                                        crossOrigin="anonymous"
                                        className="h-[50px] object-contain block"
                                    />
                                </div>
                                <div className="flex-1 text-center px-4">
                                    <h2 className="font-bold text-[14px] leading-tight">PERMOHONAN PERPINDAHAN ANGGOTA</h2>
                                    <h2 className="font-bold text-[14px] leading-tight mt-0.5">GMAHK KONFERENS JAWA KAWASAN TIMUR</h2>
                                    <h2 className="font-bold text-[14px] leading-tight mt-0.5">JEMAAT TIDAR 1 SURABAYA</h2>
                                </div>
                                <div className="w-[180px] flex flex-col items-center">
                                    <div className="border border-black bg-[#dce6f1] font-bold py-1 w-full text-center text-[11px]">DIISI OLEH PEMOHON</div>
                                    <p className="italic text-center mt-1 text-[10px] leading-tight">
                                        Bagi Pemohon yang namanya <br />
                                        <span className="font-bold not-italic">SUDAH</span> ada di ACMS
                                    </p>
                                </div>
                            </div>

                            {/* Section A */}
                            <div className="mb-4">
                                <p className="font-bold mb-1">
                                    A. PROFIL PEMOHON{' '}
                                    <span className="font-normal text-[11px]">
                                        (Mohon diisi sesuai dengan KTP/Akte Kelahiran / identitas lainnya menggunakan huruf besar)
                                    </span>
                                </p>
                                <table className="w-full ml-4" style={{ borderCollapse: 'separate', borderSpacing: '0 2px' }}>
                                    <tbody>
                                        <tr>
                                            <td className="w-1/4 py-0.5 align-top">1. Nama Lengkap</td>
                                            <td className="w-3/4 py-0.5 align-top">: <span className="uppercase">{formData.namaLengkap}</span></td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/4 py-0.5 align-top">2. Jenis Kelamin</td>
                                            <td className="w-3/4 py-0.5 align-top">: {formData.jenisKelamin}</td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/4 py-0.5 align-top">3. Tanggal Lahir</td>
                                            <td className="w-3/4 py-0.5 align-top">: {formatDate(formData.tanggalLahir)}</td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/4 py-0.5 align-top">4. Nama Ibu</td>
                                            <td className="w-3/4 py-0.5 align-top">: <span className="uppercase">{formData.namaIbu}</span></td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/4 py-0.5 align-top">5. Baptisan</td>
                                            <td className="w-3/4 py-0.5"></td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/4 py-0.5 pl-4 align-top">- tanggal</td>
                                            <td className="w-3/4 py-0.5 align-top">: {formatDate(formData.baptisanTanggal)}</td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/4 py-0.5 pl-4 align-top">- tempat</td>
                                            <td className="w-3/4 py-0.5 align-top">: <span className="uppercase">{formData.baptisanTempat}</span></td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/4 py-0.5 pl-4 align-top">- pendeta</td>
                                            <td className="w-3/4 py-0.5 align-top">: <span className="uppercase">{formData.baptisanPendeta}</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Section B */}
                            <div className="mb-4">
                                <p className="font-bold mb-1">B. PERNYATAAN PEMOHON</p>
                                <table className="w-full ml-4 mb-2" style={{ borderCollapse: 'separate', borderSpacing: '0 2px' }}>
                                    <tbody>
                                        <tr>
                                            <td className="w-[80%] py-0.5 align-top">1. Apakah Anda dalam masa disiplin Gereja?</td>
                                            <td className="w-[20%] py-0.5 font-bold align-top">: {formData.masaDisiplin}</td>
                                        </tr>
                                        <tr>
                                            <td className="w-[80%] py-0.5 align-top">2. Apakah Anda sudah pernah mengajukan permohonan perpindahan keanggotaan?</td>
                                            <td className="w-[20%] py-0.5 font-bold align-top">: {formData.pernahPindah}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p className="mb-1 text-sm font-medium">Dengan ini saya memohon agar memindahkan keanggotaan saya dari:</p>
                                <table className="w-full ml-4 mb-2" style={{ borderCollapse: 'separate', borderSpacing: '0 2px' }}>
                                    <tbody>
                                        <tr>
                                            <td className="w-1/4 py-0.5 align-top">1. Nama Jemaat Asal</td>
                                            <td className="w-3/4 py-0.5 align-top">: <span className="uppercase">{formData.jemaatAsalNama}</span></td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/4 py-0.5 align-top">2. Alamat Jemaat Asal</td>
                                            <td className="w-3/4 py-0.5 align-top">: {formData.jemaatAsalAlamat}</td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/4 py-0.5 align-top">3. Nama Sekretaris</td>
                                            <td className="w-3/4 py-0.5 align-top">: <span className="uppercase">{formData.jemaatAsalSekretaris}</span></td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/4 py-0.5 align-top">4. Telp/Email Aktif</td>
                                            <td className="w-3/4 py-0.5 align-top">: {formData.jemaatAsalKontak}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p className="mb-3 text-sm font-medium">Demikian permohonan ini saya ajukan tanpa ada paksaan dari pihak manapun.</p>
                                <div className="flex justify-end pr-6">
                                    <div className="text-center w-64 flex flex-col items-center">
                                        <p className="text-sm font-medium">Tempat/Tanggal diajukan:</p>
                                        <p className="text-sm font-medium">Surabaya, {formatDate(new Date())}</p>
                                        <div className="h-14 flex items-center justify-center my-1 relative w-full">
                                            {formData.tandaTangan ? (
                                                <img
                                                    src={formData.tandaTangan}
                                                    alt="Tanda Tangan"
                                                    crossOrigin="anonymous"
                                                    className="max-h-full max-w-[180px] object-contain block"
                                                />
                                            ) : (
                                                <div className="h-10"></div>
                                            )}
                                        </div>
                                        <p className="border-t border-black pt-0.5 w-full uppercase leading-none font-bold">( {formData.namaLengkap || '..........................'} )</p>
                                        <p className="text-[11px] mt-1">Nama dan Tanda Tangan Pemohon</p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mb-4 mt-4 pt-4 border-t-[1.5px] border-dashed border-gray-400">
                                <p className="font-bold text-center mb-3 tracking-wide text-[12px]">DIISI OLEH SEKRETARIS JEMAAT</p>
                                <p className="font-bold mb-1 text-[12px]">C. DATA KEPUTUSAN MAJELIS</p>
                                <table className="w-full ml-4" style={{ borderCollapse: 'separate', borderSpacing: '0 3px' }}>
                                    <tbody>
                                        <tr>
                                            <td className="w-[40%] py-0.5 align-bottom">1. Keputusan Majelis Tanggal</td>
                                            <td className="w-[60%] py-0.5 border-b border-dotted border-gray-500 align-bottom">: </td>
                                        </tr>
                                        <tr>
                                            <td className="w-[40%] py-0.5 align-bottom"> Nomor Keputusan</td>
                                            <td className="w-[60%] py-0.5 border-b border-dotted border-gray-500 align-bottom">: </td>
                                        </tr>
                                        <tr>
                                            <td className="w-[40%] py-0.5 align-bottom">2. Di proses tanggal</td>
                                            <td className="w-[60%] py-0.5 border-b border-dotted border-gray-500 align-bottom">: </td>
                                        </tr>
                                        <tr>
                                            <td className="w-[40%] py-0.5 align-bottom">3. Ketua Jemaat</td>
                                            <td className="w-[60%] py-0.5 border-b border-dotted border-gray-500 align-bottom">: </td>
                                        </tr>
                                        <tr>
                                            <td className="w-[40%] py-0.5 align-bottom">4. Gembala Jemaat</td>
                                            <td className="w-[60%] py-0.5 border-b border-dotted border-gray-500 align-bottom">: </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="flex justify-end pr-6 mt-4">
                                    <div className="text-center w-64">
                                        <p className="mb-10 text-sm font-medium">20........</p>
                                        <p className="border-t border-black pt-0.5 leading-none font-bold">( ........................................ )</p>
                                        <p className="text-[11px] mt-1">Nama dan Tanda Tangan Sekretaris Jemaat</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-4 pt-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400 font-sans">
                                <p>ACMS v.3.03</p>
                                <p>&copy; Copyright by ART1S Tech Team 2026</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-navy-100/60 relative overflow-hidden">
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
                    <div>
                        <h3 className="font-bold text-navy-900 border-b pb-2 mb-4 uppercase tracking-widest text-sm bg-navy-50/50 px-3 py-1.5 rounded-t-lg">D. TANDA TANGAN DIGITAL</h3>
                        <div className="px-3">
                            <label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-wide">Tanda Tangan Pemohon <span className="text-red-500">*</span></label>
                            <SignaturePad
                                value={formData.tandaTangan}
                                onChange={(dataUrl) => setFormData(prev => ({ ...prev, tandaTangan: dataUrl }))}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold py-4 rounded-xl transition mt-8 text-lg flex justify-center items-center shadow-lg hover:shadow-xl"><span className="mr-3">Lanjut Preview Formulir</span> <Icon name="ChevronRight" className="w-5 h-5 bg-navy-800 rounded-full" /></button>
                </form>
            </div>
        </div>
    );
};

const BukuTamu = ({ setActiveTab }) => {
    const [formData, setFormData] = React.useState({
        nama: '',
        wa: '',
        asalJemaat: '',
        kunjungan: 'Pertama kali',
        sumberInfo: '',
        pesan: ''
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [captcha, setCaptcha] = React.useState({ num1: 0, num2: 0 });
    const [captchaInput, setCaptchaInput] = React.useState('');
    const [showPublicList, setShowPublicList] = React.useState(false);
    const [publicList, setPublicList] = React.useState([]);
    const [isLoadingPublic, setIsLoadingPublic] = React.useState(false);

    const openPublicList = async () => {
        setShowPublicList(true);
        setIsLoadingPublic(true);
        try {
            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'getPublicBukuTamu'
                })
            });
            if (!response.ok) throw new Error('Jaringan bermasalah');
            const result = await response.json();
            if (result.success) {
                setPublicList(result.data || []);
            } else {
                console.error('Failed to load public guest list:', result.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingPublic(false);
        }
    };

    const generateCaptcha = React.useCallback(() => {
        const n1 = Math.floor(Math.random() * 9) + 1; // 1 to 9
        const n2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
        setCaptcha({ num1: n1, num2: n2 });
        setCaptchaInput('');
    }, []);

    React.useEffect(() => {
        generateCaptcha();
    }, [generateCaptcha]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nama.trim()) {
            alert('Nama Lengkap harus diisi.');
            return;
        }
        if (Number(captchaInput) !== captcha.num1 + captcha.num2) {
            alert('Jawaban pertanyaan keamanan salah. Silakan hitung kembali.');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'submitBukuTamu',
                    tanggal: new Date().toISOString().split('T')[0],
                    nama: formData.nama,
                    wa: formData.wa,
                    asalJemaat: formData.asalJemaat,
                    kunjungan: formData.kunjungan,
                    sumberInfo: formData.sumberInfo,
                    pesan: formData.pesan,
                    num1: captcha.num1,
                    num2: captcha.num2,
                    captchaAnswer: Number(captchaInput)
                })
            });

            if (!response.ok) throw new Error('Jaringan bermasalah');
            const result = await response.json();
            if (result.success) {
                setIsSuccess(true);
            } else {
                alert('Gagal mengirim data tamu: ' + (result.message || 'Terjadi kesalahan'));
                generateCaptcha();
            }
        } catch (err) {
            console.error(err);
            alert('Gagal terhubung ke server. Silakan coba beberapa saat lagi.');
            generateCaptcha();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-3xl border border-navy-100/60 shadow-xl overflow-hidden p-6 md:p-8 text-center space-y-6 my-4 animate-fade-in relative z-10">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto shadow-inner">
                    <Icon name="Check" className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-navy-900 tracking-tight">Kirim Berhasil!</h2>
                <p className="text-sm text-navy-600 leading-relaxed font-medium">
                    Terima kasih <b>{formData.nama}</b> telah mengisi buku tamu jemaat. <br />
                    Selamat berbakti di <b>GMAHK Tidar 1 Surabaya</b>. Tuhan Yesus memberkati!
                </p>
                <div className="pt-4 border-t border-navy-50 flex flex-col gap-3">
                    <button onClick={() => setActiveTab('home')} className="w-full bg-navy-900 text-gold-400 hover:bg-navy-800 font-bold py-3.5 rounded-xl transition-all shadow-md">
                        Kembali ke Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-navy-100/60 shadow-xl overflow-hidden p-6 md:p-8 space-y-6 my-4 animate-fade-in relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-navy-50 pb-5 gap-4">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-900 shadow-inner">
                        <Icon name="Edit" className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-black text-navy-900 text-xl tracking-tight">Buku Tamu Jemaat</h2>
                        <p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1">Selamat Datang di GMAHK Tidar 1</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={openPublicList}
                    className="text-xs font-bold text-navy-600 bg-navy-50 hover:bg-navy-100 hover:text-navy-900 px-3.5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-auto border border-navy-100/50"
                >
                    <Icon name="Users" className="w-4 h-4 text-gold-500" />
                    Daftar Tamu
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="nama"
                        required
                        placeholder="Masukkan nama lengkap Anda"
                        value={formData.nama}
                        onChange={handleChange}
                        className="w-full p-3.5 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-navy-900 shadow-sm font-bold text-sm tracking-wide transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Nomor WhatsApp</label>
                    <input
                        type="tel"
                        name="wa"
                        placeholder="Contoh: 081234567890"
                        value={formData.wa}
                        onChange={handleChange}
                        className="w-full p-3.5 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-navy-900 shadow-sm font-semibold text-sm transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Asal Jemaat</label>
                    <input
                        type="text"
                        name="asalJemaat"
                        placeholder="Contoh: GMAHK Darmo / Belum Anggota"
                        value={formData.asalJemaat}
                        onChange={handleChange}
                        className="w-full p-3.5 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-navy-900 shadow-sm font-semibold text-sm transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Kunjungan</label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, kunjungan: 'Pertama kali' }))}
                            className={`p-3 rounded-xl border text-sm font-bold transition-all shadow-sm ${formData.kunjungan === 'Pertama kali' ? 'border-navy-900 bg-navy-900 text-gold-400' : 'border-navy-200 bg-white text-navy-600 hover:bg-navy-50'}`}
                        >
                            Pertama kali
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, kunjungan: 'Pernah berkunjung' }))}
                            className={`p-3 rounded-xl border text-sm font-bold transition-all shadow-sm ${formData.kunjungan === 'Pernah berkunjung' ? 'border-navy-900 bg-navy-900 text-gold-400' : 'border-navy-200 bg-white text-navy-600 hover:bg-navy-50'}`}
                        >
                            Pernah berkunjung
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Tahu gereja ini dari mana?</label>
                    <input
                        type="text"
                        name="sumberInfo"
                        placeholder="Contoh: Google Maps / Diajak Teman / Lewat"
                        value={formData.sumberInfo}
                        onChange={handleChange}
                        className="w-full p-3.5 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-navy-900 shadow-sm font-semibold text-sm transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Kesan / Pesan (Opsional)</label>
                    <textarea
                        name="pesan"
                        rows="3"
                        placeholder="Tuliskan kesan atau pesan Anda..."
                        value={formData.pesan}
                        onChange={handleChange}
                        className="w-full p-3.5 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-navy-900 shadow-sm font-semibold text-sm transition-all resize-none"
                    ></textarea>
                </div>

                <div className="bg-navy-50/50 border border-navy-100 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-navy-700 uppercase tracking-widest">Pertanyaan Keamanan <span className="text-red-500">*</span></label>
                        <button 
                            type="button" 
                            onClick={generateCaptcha} 
                            className="text-xs text-navy-500 hover:text-gold-600 font-bold transition-colors flex items-center gap-1 focus:outline-none"
                            title="Ganti Pertanyaan"
                        >
                            Refresh Angka
                        </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        <span className="font-bold text-sm text-navy-800 bg-white border border-navy-200 px-4 py-3 rounded-xl shadow-sm text-center shrink-0 min-w-[120px] select-none">
                            {captcha.num1} + {captcha.num2} =
                        </span>
                        <input
                            type="number"
                            required
                            placeholder="Tulis jawaban Anda"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            className="flex-grow p-3.5 border border-navy-200 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-navy-900 shadow-sm font-bold text-sm tracking-wide transition-all"
                        />
                    </div>
                </div>

                <div className="pt-3 flex gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('home')}
                        className="flex-1 bg-navy-100 hover:bg-navy-200 text-navy-800 font-bold py-3.5 rounded-xl transition-all shadow-sm text-center"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center ${isSubmitting ? 'opacity-50' : ''}`}
                    >
                        {isSubmitting ? 'Mengirim...' : 'Kirim Buku Tamu'}
                    </button>
                </div>
            </form>

            {/* Modal Daftar Tamu 7 Hari Terakhir (Public) */}
            {showPublicList && (
                <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPublicList(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-navy-50 flex justify-between items-center bg-white sticky top-0">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center text-navy-900"><Icon name="Users" className="w-5 h-5 text-gold-500" /></div>
                                <div className="text-left">
                                    <h3 className="font-black text-base text-navy-900 tracking-tight">Tamu 7 Hari Terakhir</h3>
                                    <p className="text-[9px] font-bold text-navy-400 uppercase tracking-widest">Daftar Pengunjung Ibadah</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPublicList(false)} className="text-navy-400 hover:text-red-500 transition-colors bg-navy-50 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl pb-1">&times;</button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-navy-50/20 max-h-[50vh]">
                            {isLoadingPublic ? (
                                <div className="space-y-3">
                                    <SkeletonBlock className="h-14 w-full" />
                                    <SkeletonBlock className="h-14 w-full" />
                                    <SkeletonBlock className="h-14 w-full" />
                                </div>
                            ) : publicList.length > 0 ? (
                                <div className="space-y-2.5">
                                    {publicList.map((tamu, i) => (
                                        <div key={i} className="bg-white border border-navy-100/60 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3 text-left">
                                            <div className="min-w-0">
                                                <div className="font-bold text-navy-800 text-sm truncate">{tamu.nama}</div>
                                                <div className="text-[10px] text-navy-500 font-semibold mt-1">Asal: {tamu.asalJemaat || '—'}</div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-[9px] font-bold bg-navy-50 border border-navy-100 text-navy-500 px-2 py-0.5 rounded-full uppercase tracking-wider block">
                                                    {formatIndoDateShort(tamu.tanggal)}
                                                </span>
                                                <span className="text-[9px] font-bold text-gold-600 block mt-1">
                                                    {tamu.kunjungan}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 border border-dashed border-navy-200 rounded-2xl bg-white/50">
                                    <Icon name="Users" className="w-10 h-10 mx-auto text-navy-300 mb-2" />
                                    <p className="text-xs text-navy-500 font-bold">Belum ada tamu terdaftar dalam 7 hari terakhir.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-white border-t border-navy-50">
                            <button onClick={() => setShowPublicList(false)} className="w-full bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold py-3 rounded-xl transition-all text-sm shadow-md">
                                Tutup Halaman
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                onSuccess(password, result.youtubeApiKey, result.youtubeChannelId);
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
            <div className="bg-white rounded-[1.5rem] shadow-2xl p-6 md:p-8 max-w-sm w-full relative border border-navy-100/60">
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
                        {error && <p className="text-red-500 text-xs mt-2 font-bold flex items-center"><Icon name="Info" className="w-3.5 h-3.5 mr-1" /> Password salah, silakan coba lagi.</p>}
                    </div>
                    <button type="submit" disabled={isLoading} className={`w-full ${isLoading ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex items-center justify-center`}>
                        {isLoading ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Memverifikasi...</> : 'Masuk ke Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const BukuTamuAdmin = ({ adminToken }) => {
    const [tamuList, setTamuList] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [statusFilter, setStatusFilter] = React.useState('Semua'); // Semua, Belum di-follow up, Sudah dihubungi, Jemaat Baru, Tidak Aktif
    const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(null); // ID of row being updated

    const fetchTamu = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'getBukuTamu',
                    password: adminToken
                })
            });
            if (!response.ok) throw new Error('Jaringan bermasalah');
            const result = await response.json();
            if (result.success) {
                setTamuList(result.data || []);
            } else {
                alert('Gagal mengambil data buku tamu: ' + (result.message || 'Akses ditolak'));
            }
        } catch (err) {
            console.error(err);
            alert('Gagal terhubung ke server untuk mengambil data buku tamu.');
        } finally {
            setIsLoading(false);
        }
    }, [adminToken]);

    React.useEffect(() => {
        fetchTamu();
    }, [fetchTamu]);

    const handleStatusChange = async (id, newStatus) => {
        setIsUpdatingStatus(id);
        try {
            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'updateBukuTamuStatus',
                    password: adminToken,
                    id: id,
                    status: newStatus
                })
            });
            if (!response.ok) throw new Error('Jaringan bermasalah');
            const result = await response.json();
            if (result.success) {
                setTamuList(prev => prev.map(t => t.id === id ? { ...t, statusFollowUp: newStatus } : t));
            } else {
                alert('Gagal memperbarui status: ' + (result.message || 'Terjadi kesalahan'));
            }
        } catch (err) {
            console.error(err);
            alert('Gagal terhubung ke server.');
        } finally {
            setIsUpdatingStatus(null);
        }
    };

    const formatWhatsAppLink = (waNum, guestName) => {
        if (!waNum) return null;
        let cleaned = waNum.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.slice(1);
        }
        if (!cleaned.startsWith('62') && cleaned.length > 5) {
            cleaned = '62' + cleaned;
        }
        const message = encodeURIComponent(`Shalom ${guestName}, terima kasih telah berkunjung ke ibadah di GMAHK Tidar 1 Surabaya. Senang Anda bisa berbakti bersama kami.`);
        return `https://wa.me/${cleaned}?text=${message}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Sudah dihubungi': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'Jemaat Baru': return 'bg-green-50 text-green-700 border border-green-200';
            case 'Tidak Aktif': return 'bg-red-50 text-red-700 border border-red-200';
            default: return 'bg-yellow-50 text-yellow-700 border border-yellow-200'; // Belum di-follow up
        }
    };

    const filteredList = statusFilter === 'Semua' 
        ? tamuList 
        : tamuList.filter(t => t.statusFollowUp === statusFilter);

    const filterOptions = ['Semua', 'Belum di-follow up', 'Sudah dihubungi', 'Jemaat Baru', 'Tidak Aktif'];

    return (
        <div className="space-y-6 animate-fade-in bg-white p-2 md:p-4 rounded-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-emerald-50 p-5 rounded-[1.5rem] border border-emerald-200 shadow-sm gap-4">
                <div className="w-full md:w-2/3">
                    <h3 className="text-lg font-black text-navy-900 mb-1">Daftar Buku Tamu Jemaat</h3>
                    <p className="text-sm text-navy-800 font-medium leading-relaxed">
                        Pantau daftar pengunjung ibadah jemaat, hubungi via WhatsApp untuk follow-up, dan kelola status keaktifan mereka.
                    </p>
                </div>
                <button 
                    onClick={fetchTamu} 
                    disabled={isLoading}
                    className="bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold py-3 px-5 rounded-xl transition-all shadow-md flex items-center justify-center whitespace-nowrap self-stretch md:self-auto"
                >
                    <Icon name="Search" className="w-4 h-4 mr-2" />
                    Refresh Data
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto border border-navy-100/50 p-2 gap-2 rounded-2xl hide-scrollbar bg-navy-50/20">
                {filterOptions.map(opt => (
                    <button 
                        key={opt} 
                        onClick={() => setStatusFilter(opt)}
                        className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap font-bold transition-all ${statusFilter === opt ? 'bg-navy-900 text-gold-400 shadow-sm' : 'text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : filteredList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredList.map(tamu => {
                        const waLink = formatWhatsAppLink(tamu.wa, tamu.nama);
                        return (
                            <div key={tamu.id} className="bg-white rounded-2xl border border-navy-100/60 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-navy-900 text-base">{tamu.nama}</h4>
                                            <p className="text-[10px] font-bold text-navy-400 mt-0.5">{formatIndoDate(tamu.tanggal)}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(tamu.statusFollowUp)}`}>
                                            {tamu.statusFollowUp}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-navy-50">
                                        <div>
                                            <span className="text-navy-400 font-bold block">ASAL JEMAAT</span>
                                            <span className="font-bold text-navy-900">{tamu.asalJemaat || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-navy-400 font-bold block">KUNJUNGAN</span>
                                            <span className="font-bold text-navy-900">{tamu.kunjungan}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-navy-400 font-bold block">SUMBER INFORMASI</span>
                                            <span className="font-semibold text-navy-900">{tamu.sumberInfo || '—'}</span>
                                        </div>
                                    </div>

                                    {tamu.pesan && (
                                        <div className="bg-navy-50/40 border border-navy-100/60 p-3 rounded-xl text-xs text-navy-700 italic">
                                            "{tamu.pesan}"
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-navy-50 mt-4">
                                    <div className="flex-1 relative">
                                        <select
                                            value={tamu.statusFollowUp}
                                            disabled={isUpdatingStatus === tamu.id}
                                            onChange={(e) => handleStatusChange(tamu.id, e.target.value)}
                                            className="w-full p-2.5 pl-3 pr-10 border border-navy-200 rounded-xl bg-white text-xs font-bold text-navy-800 focus:ring-1 focus:ring-gold-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="Belum di-follow up">Belum di-follow up</option>
                                            <option value="Sudah dihubungi">Sudah dihubungi</option>
                                            <option value="Jemaat Baru">Jemaat Baru</option>
                                            <option value="Tidak Aktif">Tidak Aktif</option>
                                        </select>
                                        <Icon name="ChevronDown" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 pointer-events-none" />
                                    </div>

                                    {waLink && (
                                        <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center justify-center whitespace-nowrap"
                                        >
                                            <Icon name="Phone" className="w-3.5 h-3.5 mr-1.5" />
                                            Hubungi WA
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-navy-200 rounded-2xl bg-white/50">
                    <Icon name="Users" className="w-12 h-12 mx-auto text-navy-300 mb-3" />
                    <p className="text-sm font-medium text-navy-500">
                        Tidak ada data tamu untuk status <span className="font-bold text-navy-900">"{statusFilter}"</span>.
                    </p>
                </div>
            )}
        </div>
    );
};

const formatDateTimeIndo = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dayName}, ${day} ${monthName} ${year} pukul ${hours}:${minutes} WIB`;
};

const Perlawatan = ({ setActiveTab, dataPejabat, isLoading }) => {
    const [formData, setFormData] = React.useState({
        nama: '',
        wa: '',
        lokasi: '',
        rencanaTgl: '',
        tujuan: 'Doa & Penguatan',
        keterangan: ''
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [createdId, setCreatedId] = React.useState('');
    const [captcha, setCaptcha] = React.useState({ num1: 0, num2: 0 });
    const [captchaInput, setCaptchaInput] = React.useState('');

    const generateCaptcha = React.useCallback(() => {
        const n1 = Math.floor(Math.random() * 9) + 1; // 1 to 9
        const n2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
        setCaptcha({ num1: n1, num2: n2 });
        setCaptchaInput('');
    }, []);

    React.useEffect(() => {
        generateCaptcha();
    }, [generateCaptcha]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nama.trim() || !formData.wa.trim() || !formData.lokasi.trim() || !formData.rencanaTgl.trim()) {
            alert('Semua kolom bertanda bintang (*) harus diisi.');
            return;
        }
        if (Number(captchaInput) !== captcha.num1 + captcha.num2) {
            alert('Jawaban pertanyaan keamanan salah. Silakan hitung kembali.');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'submitPerlawatan',
                    tanggal: new Date().toISOString().split('T')[0],
                    nama: formData.nama,
                    wa: formData.wa,
                    lokasi: formData.lokasi,
                    rencanaTgl: formData.rencanaTgl,
                    tujuan: formData.tujuan,
                    keterangan: formData.keterangan,
                    num1: captcha.num1,
                    num2: captcha.num2,
                    captchaAnswer: Number(captchaInput)
                })
            });

            if (!response.ok) throw new Error('Jaringan bermasalah');
            const result = await response.json();
            if (result.success) {
                setCreatedId(result.id);
                setIsSuccess(true);
            } else {
                alert('Gagal mengirim permintaan: ' + (result.message || 'Terjadi kesalahan'));
                generateCaptcha();
            }
        } catch (err) {
            console.error(err);
            alert('Gagal terhubung ke server. Silakan coba beberapa saat lagi.');
            generateCaptcha();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWhatsAppContact = async (p) => {
        // Automatically update status to 'Sudah dijadwalkan' in the background (public endpoint bypass)
        try {
            await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'updatePerlawatanStatus',
                    id: createdId,
                    status: 'Sudah dijadwalkan'
                })
            });
        } catch (e) {
            console.error('Failed to auto-update status:', e);
        }

        // Generate prefilled WhatsApp text
        const tglFormatted = formatDateTimeIndo(formData.rencanaTgl) || formData.rencanaTgl;
        const text = `Syalom ${p.jabatan} ${p.nama},\n\nSaya ingin mengajukan permohonan perlawatan (kunjungan) dengan rincian berikut:\n\n` +
            `- *Nama Pemohon*: ${formData.nama}\n` +
            `- *WhatsApp*: ${formData.wa}\n` +
            `- *Lokasi / Alamat*: ${formData.lokasi}\n` +
            `- *Rencana Tanggal & Waktu*: ${tglFormatted}\n` +
            `- *Tujuan / Alasan*: ${formData.tujuan}\n` +
            (formData.keterangan ? `- *Keterangan Tambahan*: ${formData.keterangan}\n` : '') +
            `\nMohon kesediaan waktu pelayan jemaat untuk menjadwalkannya. Terima kasih, Tuhan memberkati.`;

        let cleaned = p.wa.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.slice(1);
        }
        window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const contacts = dataPejabat.filter(p => ['gembala', 'ketua1', 'ketua2'].includes(p.id));

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-3xl border border-navy-100/60 shadow-xl overflow-hidden p-6 md:p-8 text-center space-y-6 my-4 animate-fade-in relative z-10">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto shadow-inner">
                    <Icon name="Check" className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-navy-900 tracking-tight">Pengajuan Terkirim!</h2>
                <p className="text-sm text-navy-600 leading-relaxed font-medium">
                    Permintaan perlawatan atas nama <b>{formData.nama}</b> telah berhasil dikirimkan ke sistem.
                </p>
                
                <div className="bg-navy-50/50 p-5 rounded-2xl text-left border border-navy-100 text-xs text-navy-700 space-y-3 shadow-inner">
                    <h3 className="font-bold text-navy-900 text-sm flex items-center border-b pb-2 border-navy-100/80">
                        <Icon name="Info" className="w-4.5 h-4.5 mr-1.5 text-gold-500" /> WhatsApp Direct Follow-up
                    </h3>
                    <p className="leading-relaxed">
                        Silakan hubungi Pendeta atau Ketua Jemaat di bawah ini untuk konfirmasi cepat via WhatsApp. <b>Menghubungi mereka akan otomatis menjadwalkan perlawatan Anda.</b>
                    </p>
                    <div className="space-y-2 pt-1">
                        {contacts.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleWhatsAppContact(p)}
                                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-between group"
                            >
                                <span className="flex items-center text-left">
                                    <Icon name="Phone" className="w-4 h-4 mr-2" />
                                    <span>
                                        <span className="block text-[10px] uppercase opacity-75 font-semibold leading-tight">{p.jabatan}</span>
                                        <span className="text-xs font-bold leading-normal">{p.nama}</span>
                                    </span>
                                </span>
                                <span className="text-white font-black text-sm ml-2 transform group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-navy-50">
                    <button onClick={() => setActiveTab('home')} className="w-full bg-navy-900 text-gold-400 hover:bg-navy-800 font-bold py-3.5 rounded-xl transition-all shadow-md">
                        Kembali ke Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-navy-100/60 shadow-xl overflow-hidden p-6 md:p-8 space-y-6 my-4 animate-fade-in relative z-10">
            <div className="border-b border-navy-50 pb-5">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-900 shadow-inner">
                        <Icon name="Users" className="w-6 h-6 text-gold-500" />
                    </div>
                    <div>
                        <h2 className="font-black text-navy-900 text-xl tracking-tight">Permintaan Perlawatan</h2>
                        <p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1">Layanan Kunjungan Jemaat</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-wide">Nama Lengkap Pemohon <span className="text-red-500">*</span></label>
                    <input type="text" name="nama" value={formData.nama} onChange={handleChange} required className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors text-sm font-semibold bg-navy-50/50 shadow-sm" placeholder="Nama lengkap Anda..." />
                </div>

                <div>
                    <label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-wide">Nomor WhatsApp Aktif <span className="text-red-500">*</span></label>
                    <input type="tel" name="wa" value={formData.wa} onChange={handleChange} required className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors text-sm font-semibold bg-navy-50/50 shadow-sm" placeholder="Contoh: 08123456789..." />
                </div>

                <div>
                    <label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-wide">Alamat / Lokasi Kunjungan <span className="text-red-500">*</span></label>
                    <input type="text" name="lokasi" value={formData.lokasi} onChange={handleChange} required className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors text-sm font-semibold bg-navy-50/50 shadow-sm" placeholder="Alamat rumah atau lokasi perlawatan..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-wide">Tanggal & Waktu Rencana <span className="text-red-500">*</span></label>
                        <input type="datetime-local" name="rencanaTgl" value={formData.rencanaTgl} onChange={handleChange} required className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors text-sm font-semibold bg-navy-50/50 shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-wide">Tujuan / Alasan Kunjungan <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select name="tujuan" value={formData.tujuan} onChange={handleChange} required className="w-full p-3.5 pr-10 border border-navy-200 rounded-xl focus:border-gold-500 bg-navy-50/50 text-sm font-semibold outline-none appearance-none cursor-pointer shadow-sm">
                                <option value="Doa & Penguatan">Doa & Penguatan</option>
                                <option value="Konseling Rohani">Konseling Rohani</option>
                                <option value="Pembesukan Sakit">Pembesukan Sakit</option>
                                <option value="Pemberkatan Rumah">Pemberkatan Rumah</option>
                                <option value="Pengucapan Syukur">Pengucapan Syukur</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                            <Icon name="ChevronDown" className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-wide">Keterangan / Kebutuhan Khusus</label>
                    <textarea name="keterangan" value={formData.keterangan} onChange={handleChange} rows="3" className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors text-sm font-semibold bg-navy-50/50 shadow-sm" placeholder="Ceritakan kebutuhan perlawatan atau pesan khusus..." />
                </div>

                <div className="bg-navy-50/50 border border-navy-100 p-4 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-navy-700 uppercase tracking-wide">Pertanyaan Keamanan <span className="text-red-500">*</span></label>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm font-black text-navy-900 shrink-0 bg-white border border-navy-100 px-3 py-2 rounded-lg">{captcha.num1} + {captcha.num2} =</span>
                        <input type="number" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} required className="w-full p-2 border border-navy-200 rounded-lg focus:border-gold-500 outline-none transition-colors text-sm font-bold bg-white text-center shadow-inner" placeholder="?" />
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={`w-full ${isSubmitting ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all text-sm flex justify-center items-center`}>
                    {isSubmitting ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Mengirim...</> : 'Kirim Permintaan'}
                </button>
            </form>
        </div>
    );
};

const PerlawatanAdmin = ({ adminToken }) => {
    const [perlawatanList, setPerlawatanList] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [statusFilter, setStatusFilter] = React.useState('Semua'); // Semua, Belum dijadwalkan, Sudah dijadwalkan, Selesai dilawat, Dibatalkan
    const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(null); // ID of row being updated

    const fetchPerlawatan = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'getPerlawatan',
                    password: adminToken
                })
            });
            if (!response.ok) throw new Error('Jaringan bermasalah');
            const result = await response.json();
            if (result.success) {
                setPerlawatanList(result.data || []);
            } else {
                alert('Gagal mengambil data perlawatan: ' + (result.message || 'Akses ditolak'));
            }
        } catch (err) {
            console.error(err);
            alert('Gagal terhubung ke server untuk mengambil data perlawatan.');
        } finally {
            setIsLoading(false);
        }
    }, [adminToken]);

    React.useEffect(() => {
        fetchPerlawatan();
    }, [fetchPerlawatan]);

    const handleStatusChange = async (id, newStatus) => {
        setIsUpdatingStatus(id);
        try {
            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'updatePerlawatanStatus',
                    password: adminToken,
                    id: id,
                    status: newStatus
                })
            });
            if (!response.ok) throw new Error('Jaringan bermasalah');
            const result = await response.json();
            if (result.success) {
                setPerlawatanList(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
            } else {
                alert('Gagal memperbarui status: ' + (result.message || 'Terjadi kesalahan'));
            }
        } catch (err) {
            console.error(err);
            alert('Gagal terhubung ke server.');
        } finally {
            setIsUpdatingStatus(null);
        }
    };

    const formatWhatsAppLink = (waNum, applicantName, purpose, datePlanned) => {
        if (!waNum) return null;
        let cleaned = waNum.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.slice(1);
        }
        if (!cleaned.startsWith('62') && cleaned.length > 5) {
            cleaned = '62' + cleaned;
        }
        const dateStr = formatDateTimeIndo(datePlanned);
        const message = encodeURIComponent(`Shalom ${applicantName}, kami dari GMAHK Tidar 1 Surabaya menghubungi Anda mengenai permohonan perlawatan (${purpose}) yang diajukan untuk rencana tanggal ${dateStr}. Kami ingin mengonfirmasi jadwal kunjungan tersebut.`);
        return `https://wa.me/${cleaned}?text=${message}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Sudah dijadwalkan': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'Selesai dilawat': return 'bg-green-50 text-green-700 border border-green-200';
            case 'Dibatalkan': return 'bg-red-50 text-red-700 border border-red-200';
            default: return 'bg-yellow-50 text-yellow-700 border border-yellow-200'; // Belum dijadwalkan
        }
    };

    const filteredList = statusFilter === 'Semua' 
        ? perlawatanList 
        : perlawatanList.filter(p => p.status === statusFilter);

    const filterOptions = ['Semua', 'Belum dijadwalkan', 'Sudah dijadwalkan', 'Selesai dilawat', 'Dibatalkan'];

    return (
        <div className="space-y-6 animate-fade-in bg-white p-2 md:p-4 rounded-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-teal-50 p-5 rounded-[1.5rem] border border-teal-200 shadow-sm gap-4">
                <div className="w-full md:w-2/3">
                    <h3 className="text-lg font-black text-navy-900 mb-1">Daftar Permintaan Perlawatan</h3>
                    <p className="text-sm text-navy-800 font-medium leading-relaxed">
                        Pantau daftar permintaan kunjungan jemaat, hubungi pemohon via WhatsApp untuk koordinasi jadwal, dan kelola status perlawatan.
                    </p>
                </div>
                <button 
                    onClick={fetchPerlawatan} 
                    disabled={isLoading}
                    className="bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold py-3 px-5 rounded-xl transition-all shadow-md flex items-center justify-center whitespace-nowrap self-stretch md:self-auto"
                >
                    <Icon name="Search" className="w-4 h-4 mr-2" />
                    Refresh Data
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto border border-navy-100/50 p-2 gap-2 rounded-2xl hide-scrollbar bg-navy-50/20">
                {filterOptions.map(opt => (
                    <button 
                        key={opt} 
                        onClick={() => setStatusFilter(opt)}
                        className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap font-bold transition-all ${statusFilter === opt ? 'bg-navy-900 text-gold-400 shadow-sm' : 'text-navy-500 hover:bg-navy-50 hover:text-navy-800'}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : filteredList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredList.map(item => {
                        const waLink = formatWhatsAppLink(item.wa, item.nama, item.tujuan, item.rencanaTgl);
                        return (
                            <div key={item.id} className="bg-white rounded-2xl border border-navy-100/60 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-navy-900 text-base">{item.nama}</h4>
                                            <p className="text-[10px] font-bold text-navy-400 mt-0.5">Diajukan: {formatIndoDate(item.tanggalPengajuan)}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 pt-2 text-xs border-t border-navy-50">
                                        <div>
                                            <span className="text-navy-400 font-bold block">RENCANA TANGGAL & WAKTU</span>
                                            <span className="font-bold text-navy-900">{formatDateTimeIndo(item.rencanaTgl)}</span>
                                        </div>
                                        <div>
                                            <span className="text-navy-400 font-bold block">TUJUAN / ALASAN</span>
                                            <span className="font-bold text-navy-900">{item.tujuan}</span>
                                        </div>
                                        <div>
                                            <span className="text-navy-400 font-bold block">ALAMAT / LOKASI KUNJUNGAN</span>
                                            <span className="font-semibold text-navy-900">{item.lokasi}</span>
                                        </div>
                                    </div>

                                    {item.keterangan && (
                                        <div className="bg-navy-50/40 border border-navy-100/60 p-3 rounded-xl text-xs text-navy-700 italic">
                                            "{item.keterangan}"
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-navy-50 mt-4">
                                    <div className="flex-1 relative">
                                        <select
                                            value={item.status}
                                            disabled={isUpdatingStatus === item.id}
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                            className="w-full p-2.5 pl-3 pr-10 border border-navy-200 rounded-xl bg-white text-xs font-bold text-navy-800 focus:ring-1 focus:ring-gold-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="Belum dijadwalkan">Belum dijadwalkan</option>
                                            <option value="Sudah dijadwalkan">Sudah dijadwalkan</option>
                                            <option value="Selesai dilawat">Selesai dilawat</option>
                                            <option value="Dibatalkan">Dibatalkan</option>
                                        </select>
                                        <Icon name="ChevronDown" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 pointer-events-none" />
                                    </div>

                                    {waLink && (
                                        <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center justify-center whitespace-nowrap"
                                        >
                                            <Icon name="Phone" className="w-3.5 h-3.5 mr-1.5" />
                                            Hubungi WA
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-navy-200 rounded-2xl bg-white/50">
                    <Icon name="Users" className="w-12 h-12 mx-auto text-navy-300 mb-3" />
                    <p className="text-sm font-medium text-navy-500">
                        Tidak ada data perlawatan untuk status <span className="font-bold text-navy-900">"{statusFilter}"</span>.
                    </p>
                </div>
            )}
        </div>
    );
};

const AdminDashboard = ({ dataPejabat, setDataPejabat, jadwalDB, setJadwalDB, adminToken, setAdminToken, youtubeUrl, setYoutubeUrl, autoDetectYoutube, setAutoDetectYoutube, youtubeTitle, isLiveYoutube, kategoriPejabat, setKategoriPejabat, heroImageUrl, setHeroImageUrl, gdriveUrl, setGdriveUrl, youtubeApiKey, setYoutubeApiKey, youtubeChannelId, setYoutubeChannelId }) => {
    const [adminTab, setAdminTab] = React.useState('jadwal'); // jadwal, pelayan, pengaturan

    const adminFeatures = [
        {
            id: 'jadwal',
            label: 'Kelola Jadwal',
            icon: 'Calendar',
            colorClass: {
                bg: 'bg-blue-50',
                icon: 'text-blue-600',
                hoverBg: 'group-hover:bg-blue-100',
                hoverIcon: 'group-hover:text-blue-700',
                hoverText: 'group-hover:text-blue-800'
            }
        },
        {
            id: 'pelayan',
            label: 'Kelola Pejabat',
            icon: 'Users',
            colorClass: {
                bg: 'bg-indigo-50',
                icon: 'text-indigo-600',
                hoverBg: 'group-hover:bg-indigo-100',
                hoverIcon: 'group-hover:text-indigo-700',
                hoverText: 'group-hover:text-indigo-800'
            }
        },
        {
            id: 'buku_tamu',
            label: 'Daftar Tamu',
            icon: 'Edit',
            colorClass: {
                bg: 'bg-emerald-50',
                icon: 'text-emerald-600',
                hoverBg: 'group-hover:bg-emerald-100',
                hoverIcon: 'group-hover:text-emerald-700',
                hoverText: 'group-hover:text-emerald-800'
            }
        },
        {
            id: 'perlawatan',
            label: 'Daftar Perlawatan',
            icon: 'MessageCircle',
            colorClass: {
                bg: 'bg-teal-50',
                icon: 'text-teal-600',
                hoverBg: 'group-hover:bg-teal-100',
                hoverIcon: 'group-hover:text-teal-700',
                hoverText: 'group-hover:text-teal-800'
            }
        },
        {
            id: 'pengaturan',
            label: 'Pengaturan Admin',
            icon: 'Settings',
            colorClass: {
                bg: 'bg-amber-50',
                icon: 'text-amber-600',
                hoverBg: 'group-hover:bg-amber-100',
                hoverIcon: 'group-hover:text-amber-700',
                hoverText: 'group-hover:text-amber-800'
            }
        }
    ];

    const renderAdminFeatureCard = (item) => {
        const labelParts = item.label.split(' ');
        const line1 = labelParts.length > 1 ? labelParts.slice(0, Math.ceil(labelParts.length / 2)).join(' ') : labelParts[0];
        const line2 = labelParts.length > 1 ? labelParts.slice(Math.ceil(labelParts.length / 2)).join(' ') : '';
        const cc = item.colorClass;
        const isActive = adminTab === item.id;

        return (
            <div key={item.id} onClick={() => setAdminTab(item.id)} className={`bg-white p-4 md:p-6 rounded-[1.25rem] shadow-sm flex flex-col items-center text-center justify-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-navy-100/60 group ${isActive ? 'border-navy-900 ring-2 ring-navy-900/10 scale-[1.02]' : ''}`}>
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1rem] ${isActive ? 'bg-navy-900' : cc.bg} ${cc.hoverBg} transition-colors flex items-center justify-center mb-2.5 md:mb-3`}>
                    <Icon name={item.icon} className={`w-6 h-6 md:w-8 md:h-8 ${isActive ? 'text-gold-400' : cc.icon} ${cc.hoverIcon} transition-colors`} />
                </div>
                <h3 className={`font-bold text-[11px] md:text-sm leading-tight text-navy-900 ${cc.hoverText} transition-colors`}>{line1}{line2 && <><br />{line2}</>}</h3>
            </div>
        );
    };

    // Scroll to top of the page when admin dashboard tab changes
    React.useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [adminTab]);

    const [viewMonth, setViewMonth] = React.useState(new Date().getMonth());
    const [viewYear, setViewYear] = React.useState(new Date().getFullYear());
    const [subTab, setSubTab] = React.useState('rabu');
    const [editingDate, setEditingDate] = React.useState(null);
    const [editForm, setEditForm] = React.useState([]);
    const [isSavingJadwal, setIsSavingJadwal] = React.useState(false);
    const [isSavingPejabat, setIsSavingPejabat] = React.useState(false);

    // State Ganti Password
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [showOldPass, setShowOldPass] = React.useState(false);
    const [showNewPass, setShowNewPass] = React.useState(false);
    const [isChangingPass, setIsChangingPass] = React.useState(false);

    // State URL YouTube
    const [editYoutubeUrl, setEditYoutubeUrl] = React.useState(youtubeUrl);
    const [editAutoDetect, setEditAutoDetect] = React.useState(autoDetectYoutube);
    const [editYoutubeApiKey, setEditYoutubeApiKey] = React.useState(youtubeApiKey || '');
    const [editYoutubeChannelId, setEditYoutubeChannelId] = React.useState(youtubeChannelId || '');
    const [isSavingUrl, setIsSavingUrl] = React.useState(false);

    React.useEffect(() => {
        setEditAutoDetect(autoDetectYoutube);
    }, [autoDetectYoutube]);

    React.useEffect(() => {
        setEditYoutubeUrl(youtubeUrl);
    }, [youtubeUrl]);

    React.useEffect(() => {
        setEditYoutubeApiKey(youtubeApiKey || '');
    }, [youtubeApiKey]);

    React.useEffect(() => {
        setEditYoutubeChannelId(youtubeChannelId || '');
    }, [youtubeChannelId]);

    // State Hero Image
    const [editHeroUrl, setEditHeroUrl] = React.useState(heroImageUrl);
    const [isSavingHero, setIsSavingHero] = React.useState(false);
    const [heroPreview, setHeroPreview] = React.useState(heroImageUrl);

    // State Google Drive URL
    const [editGdriveUrl, setEditGdriveUrl] = React.useState(gdriveUrl);
    const [isSavingGdrive, setIsSavingGdrive] = React.useState(false);

    React.useEffect(() => {
        setEditGdriveUrl(gdriveUrl);
    }, [gdriveUrl]);



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
    const columns = subTab === 'susunanAcara' ? ["Status Pengisian"] : getActiveArray(isRabu ? initialJadwalRabu : initialJadwalSabat, subTab).map(p => p.tugas);

    const handleEditClick = (date) => {
        setEditingDate(date);
        const existingData = jadwalDB[date] || (isRabu ? initialJadwalRabu : initialJadwalSabat);
        if (subTab === 'susunanAcara') {
            setEditForm(JSON.parse(JSON.stringify(existingData.susunan || defaultSusunan)));
        } else {
            setEditForm(JSON.parse(JSON.stringify(getActiveArray(existingData, subTab))));
        }
    };

    const handleEditFormChange = (index, value) => {
        const newForm = [...editForm];
        newForm[index].nama = value;
        setEditForm(newForm);
    };

    const handleEditFormChangeSusunan = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
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

        fetch(GAS_API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveJadwal',
                password: adminToken, // Otorisasi
                tanggal: date,
                data: baseData
            })
        })
            .then(res => res.json())
            .then(result => {
                setIsSavingJadwal(false);
                if (result.success) {
                    setJadwalDB({ ...jadwalDB, [date]: baseData });
                    setEditingDate(null);
                } else { alert("Gagal menyimpan: " + (result.message || "Akses ditolak.")); }
            })
            .catch(err => { alert("Gagal terhubung ke server."); setIsSavingJadwal(false); });
    };

    // HAPUS (RESET) JADWAL
    const handleDeleteRow = (date) => {
        if (!jadwalDB[date]) return;
        if (window.confirm(`Kembalikan jadwal ${formatIndoDateShort(date)} ke default?`)) {
            setIsSavingJadwal(true);
            const defaultData = JSON.parse(JSON.stringify(isRabu ? initialJadwalRabu : initialJadwalSabat));

            fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveJadwal',
                    password: adminToken, // Otorisasi
                    tanggal: date,
                    data: defaultData
                })
            })
                .then(res => res.json())
                .then(result => {
                    setIsSavingJadwal(false);
                    if (result.success) {
                        const newDB = { ...jadwalDB };
                        delete newDB[date];
                        setJadwalDB(newDB);
                    } else { alert("Gagal mereset: " + (result.message || "Akses ditolak.")); }
                })
                .catch(err => { alert("Gagal mereset data."); setIsSavingJadwal(false); });
        }
    };

    // SIMPAN PEJABAT
    const handleSimpanPejabat = () => {
        setIsSavingPejabat(true);
        fetch(GAS_API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'savePejabat',
                password: adminToken, // Otorisasi
                data: dataPejabat,
                kategoriPejabat: kategoriPejabat
            })
        })
            .then(res => res.json())
            .then(result => {
                setIsSavingPejabat(false);
                if (result.success) {
                    alert("Berhasil! Data Pelayan Jemaat tersimpan di Google Sheets.");
                } else { alert("Gagal menyimpan: " + (result.message || "Akses ditolak.")); }
            })
            .catch(err => { alert("Gagal menyimpan data Pejabat."); setIsSavingPejabat(false); });
    };

    // GANTI PASSWORD
    const handleGantiPassword = async (e) => {
        e.preventDefault();
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

    // SIMPAN YOUTUBE URL & DETEKSI OTOMATIS
    const handleSaveYoutubeSettings = async (e) => {
        e.preventDefault();
        setIsSavingUrl(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ 
                    action: 'saveYoutubeSettings', 
                    password: adminToken, 
                    url: editYoutubeUrl, 
                    autoDetect: editAutoDetect,
                    apiKey: editYoutubeApiKey,
                    channelId: editYoutubeChannelId
                })
            });
            const result = await res.json();
            if (result.success) {
                alert("Pengaturan YouTube berhasil diperbarui!");
                setYoutubeUrl(editYoutubeUrl);
                setAutoDetectYoutube(editAutoDetect);
                setYoutubeApiKey(editYoutubeApiKey);
                setYoutubeChannelId(editYoutubeChannelId);
            } else {
                alert("Gagal merubah pengaturan: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsSavingUrl(false);
    };

    // SIMPAN HERO IMAGE URL
    const handleSaveHeroImage = async (e) => {
        e.preventDefault();
        setIsSavingHero(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveHeroImage', password: adminToken, url: editHeroUrl })
            });
            const result = await res.json();
            if (result.success) {
                alert("Hero Image berhasil diperbarui!");
                setHeroImageUrl(editHeroUrl);
                setHeroPreview(editHeroUrl);
            } else {
                alert("Gagal merubah Hero Image: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsSavingHero(false);
    };

    // SIMPAN GOOGLE DRIVE URL
    const handleSaveGdriveUrl = async (e) => {
        e.preventDefault();
        setIsSavingGdrive(true);
        try {
            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveGdriveUrl', password: adminToken, url: editGdriveUrl })
            });
            const result = await res.json();
            if (result.success) {
                alert("Link Google Drive berhasil diperbarui!");
                setGdriveUrl(editGdriveUrl);
            } else {
                alert("Gagal menyimpan: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsSavingGdrive(false);
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
                const MAX_WIDTH = 1000;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Convert to webp with 0.6 quality for better compression
                const dataUrl = canvas.toDataURL('image/webp', 0.6);
                setEditHeroUrl(dataUrl);
                setHeroPreview(dataUrl);
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
        <div className="space-y-6 animate-fade-in relative z-10">
            {/* Admin navigation cards (Homepage Style) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5">
                {adminFeatures.map(item => renderAdminFeatureCard(item))}
            </div>

            <div className={`rounded-[1.5rem] shadow-sm border border-navy-100/60 overflow-hidden p-4 md:p-6 ${(adminTab === 'jadwal' || adminTab === 'buku_tamu' || adminTab === 'perlawatan') ? 'bg-navy-50/30' : 'bg-white'}`}>
                    {adminTab === 'jadwal' && (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex items-center gap-2">
                                <button onClick={() => scrollTabs('left')} className="hidden md:flex p-2.5 bg-white border border-navy-100 rounded-xl shadow-sm text-navy-500 hover:text-gold-500 hover:border-gold-200 shrink-0 transition" title="Scroll Kiri">
                                    <Icon name="ChevronLeft" className="w-5 h-5" />
                                </button>

                                <div ref={scrollContainerRef} className="bg-white rounded-[1.25rem] flex-1 flex overflow-x-auto border border-navy-100/50 p-2 gap-2 hide-scrollbar scroll-smooth shadow-sm">
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
                                    <p><b>Jadwal Spesial:</b> Perjamuan Kudus hanya dilaksanakan pada <span className="font-bold underline text-gold-600">Sabtu terakhir</span> di bulan Maret, Juni, Oktober, dan Desember. Mengisi jadwal pada tanggal lain tidak akan memunculkannya secara otomatis di bulan tersebut.</p>
                                </div>
                            )}

                            <div className="bg-white border border-navy-100/60 rounded-2xl shadow-sm overflow-hidden">
                                <div className="flex flex-col md:flex-row justify-between items-center p-5 border-b border-navy-50 gap-4 bg-white">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-navy-50 rounded-full flex items-center justify-center text-gold-500 mr-4 hidden md:flex shrink-0 shadow-inner"><Icon name="Calendar" className="w-5 h-5" /></div>
                                        <div><h3 className="font-black text-xl text-navy-900 tracking-tight">{currentSubTabLabel}</h3><p className="text-[10px] text-navy-500 uppercase tracking-widest font-bold mt-1">Triwulan: {getTriwulan(viewMonth)}</p></div>
                                    </div>
                                    <div className="flex items-center border border-navy-100 rounded-xl overflow-hidden bg-white shadow-sm">
                                        <button onClick={prevMonth} className="p-2.5 hover:bg-navy-50 hover:text-gold-500 transition-colors text-navy-600"><Icon name="ChevronLeft" className="w-5 h-5" /></button>
                                        <div className="px-4 py-2.5 font-black text-sm bg-navy-50 flex items-center min-w-[150px] justify-center text-navy-900 tracking-wide"><Icon name="Calendar" className="w-4 h-4 mr-2 text-gold-500" />{monthNames[viewMonth].toUpperCase()} {viewYear}</div>
                                        <button onClick={nextMonth} className="p-2.5 hover:bg-navy-50 hover:text-gold-500 transition-colors text-navy-600"><Icon name="ChevronRight" className="w-5 h-5" /></button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className={`w-full text-left border-collapse ${subTab === 'perjamuan' ? 'min-w-[2800px]' : subTab === 'susunanAcara' ? 'min-w-[400px]' : 'min-w-[800px]'}`}>
                                        <thead className="bg-navy-50/50 border-b border-navy-100/60">
                                            <tr>
                                                <th className="p-4 text-[10px] md:text-xs font-black text-navy-500 uppercase tracking-widest text-center w-36">Tanggal</th>
                                                {columns.map((col, i) => <th key={i} className="p-4 text-[10px] md:text-xs font-black text-navy-500 uppercase tracking-widest text-center">{col}</th>)}
                                                <th className="p-4 text-[10px] md:text-xs font-black text-navy-500 uppercase tracking-widest text-center w-28">Aksi</th>
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
                                                        <td className="p-4 text-center align-middle border-r border-navy-50/50 bg-navy-50/10">
                                                            <div className="font-bold text-navy-400 text-xs tracking-wider mb-0.5">{isRabu ? 'RABU' : 'SABTU'}</div>
                                                            <div className="text-sm font-black text-navy-900">{formatIndoDateShort(date)}</div>
                                                        </td>

                                                        {subTab === 'susunanAcara' ? (
                                                            isEditing ? (
                                                                <td colSpan="2" className="p-4 bg-gold-50/30">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                                                        <div className="space-y-3 p-5 bg-white rounded-2xl border border-navy-100/60 shadow-sm h-fit">
                                                                            <h4 className="font-black text-sm text-navy-800 border-b border-navy-50 pb-2">Sekolah Sabat</h4>
                                                                            <div><label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">Lagu Buka</label><input type="text" value={editForm.ssLaguBuka || ''} onChange={(e) => handleEditFormChangeSusunan('ssLaguBuka', e.target.value)} placeholder="Ketik nomor lagu, misal: 210" className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" /></div>
                                                                            <div><label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">Lagu Tutup</label><input type="text" value={editForm.ssLaguTutup || ''} onChange={(e) => handleEditFormChangeSusunan('ssLaguTutup', e.target.value)} placeholder="Ketik nomor lagu, misal: 251" className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" /></div>
                                                                        </div>
                                                                        <div className="space-y-3 p-5 bg-white rounded-xl border border-navy-100/60 shadow-sm">
                                                                            <h4 className="font-black text-sm text-gold-600 border-b border-navy-50 pb-2">Khotbah Umum</h4>
                                                                            <div><label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">Ayat Bersahutan</label><input type="text" value={editForm.kAyatBersahutan || ''} onChange={(e) => handleEditFormChangeSusunan('kAyatBersahutan', e.target.value)} placeholder="Contoh: No. 12" className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" /></div>
                                                                            <div><label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">Lagu Buka</label><input type="text" value={editForm.kLaguBuka || ''} onChange={(e) => handleEditFormChangeSusunan('kLaguBuka', e.target.value)} placeholder="Ketik nomor lagu, misal: 15" className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" /></div>

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
                                                                            <div><label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">Lagu Tutup</label><input type="text" value={editForm.kLaguTutup || ''} onChange={(e) => handleEditFormChangeSusunan('kLaguTutup', e.target.value)} placeholder="Ketik nomor lagu, misal: 300" className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" /></div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-5 flex justify-end space-x-3">
                                                                        <button onClick={() => setEditingDate(null)} className="px-5 py-2.5 text-navy-600 bg-navy-100 hover:bg-navy-200 rounded-xl text-sm font-bold transition-colors">Batal</button>
                                                                        <button onClick={() => handleSaveRow(date)} disabled={isSavingJadwal} className={`px-5 py-2.5 text-navy-900 bg-gold-400 hover:bg-gold-500 rounded-xl text-sm font-bold transition-colors shadow-sm ${isSavingJadwal ? 'opacity-50' : ''}`}><Icon name="Check" className="w-4 h-4 mr-1.5 inline" /> Simpan Susunan</button>
                                                                    </div>
                                                                </td>
                                                            ) : (
                                                                <>
                                                                    <td className="p-4 text-center align-middle border-r border-navy-50/50">
                                                                        <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm ${isSaved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-navy-100 text-navy-500 border border-navy-200'}`}>
                                                                            {isSaved ? 'Sudah Diatur' : 'Default'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-4 text-center align-middle">
                                                                        <div className="flex justify-center space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button onClick={() => handleEditClick(date)} className="p-2.5 text-navy-500 hover:text-gold-500 hover:bg-navy-50 rounded-xl transition-colors" title="Edit Susunan"><Icon name="Edit" className="w-4 h-4" /></button>
                                                                            {isSaved ? (<button onClick={() => handleDeleteRow(date)} className="p-2.5 text-navy-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Reset Default"><Icon name="Trash" className="w-4 h-4" /></button>) : (<div className="w-10"></div>)}
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            )
                                                        ) : (
                                                            <>
                                                                {dataArray.map((p, i) => (
                                                                    <td key={i} className="p-4 text-center align-middle border-r border-navy-50/50">
                                                                        {isEditing ? (
                                                                            <input type="text" value={editForm[i]?.nama || ''} onChange={(e) => handleEditFormChange(i, e.target.value)} className="w-full p-2.5 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 focus:border-gold-500 outline-none shadow-inner bg-navy-50/50" />
                                                                        ) : (
                                                                            <div className="flex flex-col items-center">
                                                                                <span className="font-bold text-navy-900 text-sm mb-1.5">{p.nama}</span>
                                                                                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-sm ${isSaved ? 'bg-gold-50 text-gold-600 border border-gold-200' : 'bg-navy-50 text-navy-400 border border-navy-100'}`}>{isSaved ? 'Terkunci' : 'Default'}</span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                ))}
                                                                <td className="p-4 text-center align-middle">
                                                                    {isEditing ? (
                                                                        <div className="flex justify-center space-x-1.5">
                                                                            <button onClick={() => handleSaveRow(date)} disabled={isSavingJadwal} className={`p-2.5 text-navy-900 bg-gold-400 hover:bg-gold-500 rounded-xl transition-colors shadow-sm ${isSavingJadwal ? 'opacity-50' : ''}`}><Icon name="Check" className="w-4 h-4" /></button>
                                                                            <button onClick={() => setEditingDate(null)} className="p-2.5 text-navy-600 bg-navy-100 hover:bg-navy-200 rounded-xl transition-colors"><Icon name="X" className="w-4 h-4" /></button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex justify-center space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button onClick={() => handleEditClick(date)} className="p-2.5 text-navy-500 hover:text-gold-500 hover:bg-navy-50 rounded-xl transition-colors" title="Edit Baris"><Icon name="Edit" className="w-4 h-4" /></button>
                                                                            {isSaved ? (<button onClick={() => handleDeleteRow(date)} className="p-2.5 text-navy-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Hapus (Kembali ke Default)"><Icon name="Trash" className="w-4 h-4" /></button>) : (<div className="w-10"></div>)}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </>
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
                                                                <img loading="lazy" src={p.img} alt={p.nama} className="w-full h-full rounded-xl object-cover border-2 border-white shadow-sm" />
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
                        <div className="max-w-md mx-auto animate-fade-in space-y-6">
                            <div className="bg-white border border-navy-100/60 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 pb-5">
                                    <div className="w-12 h-12 bg-navy-50 rounded-full flex items-center justify-center text-navy-900 shadow-inner"><Icon name="Settings" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 text-lg tracking-tight">Ganti Password Admin</h3><p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1 mt-1">Keamanan Otentikasi</p></div>
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

                            <div className="bg-white border border-navy-100/60 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 pb-5">
                                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner"><Icon name="Video" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 text-lg tracking-tight">Pengaturan YouTube</h3><p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1">Live Streaming & Video</p></div>
                                </div>
                                <form onSubmit={handleSaveYoutubeSettings} className="space-y-5">
                                    {/* Toggle Auto Detect */}
                                    <div className="flex items-center justify-between p-3.5 bg-navy-50/50 border border-navy-100 rounded-xl">
                                        <div className="pr-4">
                                            <span className="block text-sm font-bold text-navy-900">Deteksi Otomatis Channel</span>
                                            <span className="block text-[11px] text-navy-500 mt-0.5">Otomatis deteksi siaran langsung atau video terbaru dari @art1stv</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={editAutoDetect} onChange={e => setEditAutoDetect(e.target.checked)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-navy-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-navy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                                        </label>
                                    </div>

                                    {editAutoDetect ? (
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl bg-gold-50/50 border border-gold-200 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] uppercase tracking-widest font-bold text-gold-600">Status Terdeteksi</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLiveYoutube ? 'bg-red-500 text-white animate-pulse' : 'bg-navy-100 text-navy-700'}`}>
                                                        {isLiveYoutube ? '🔴 SEDANG LIVE' : 'REKAMAN / OFFLINE'}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-bold text-navy-900 leading-snug">
                                                    {youtubeTitle || "Tidak dapat membaca judul"}
                                                </div>
                                                <div className="text-[10px] font-mono text-navy-500 truncate mt-1">
                                                    {youtubeUrl}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-widest">YouTube Data API Key (v3)</label>
                                                    <input type="text" value={editYoutubeApiKey} onChange={e => setEditYoutubeApiKey(e.target.value)} required className="w-full p-3 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-xs font-mono font-medium shadow-sm" placeholder="Masukkan YouTube API Key..." />
                                                    <p className="text-[9px] text-navy-500 mt-1">Buat API key di Google Cloud Console dengan library YouTube Data API v3 diaktifkan.</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-navy-700 mb-1.5 uppercase tracking-widest">YouTube Channel ID</label>
                                                    <input type="text" value={editYoutubeChannelId} onChange={e => setEditYoutubeChannelId(e.target.value)} required className="w-full p-3 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-xs font-mono font-medium shadow-sm" placeholder="UCNwVpE7CqpcKVcaUnZhUWTQ" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Tautan Video Embed Manual</label>
                                                <textarea value={editYoutubeUrl} onChange={e => setEditYoutubeUrl(e.target.value)} required rows="3" className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm leading-relaxed"></textarea>
                                                <p className="text-[10px] text-navy-500 mt-2 font-bold leading-relaxed bg-navy-50 p-2.5 rounded-lg border border-navy-100">Pastikan URL diawali dengan <br /><span className="text-gold-600">https://www.youtube.com/embed/</span>... atau <br /><span className="text-gold-600">https://www.youtube-nocookie.com/embed/</span>...</p>
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" disabled={isSavingUrl} className={`w-full ${isSavingUrl ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all mt-6 flex justify-center items-center`}>
                                        {isSavingUrl ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan Pengaturan'}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white border border-navy-100/60 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 pb-5">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-inner"><Icon name="Image" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 text-lg tracking-tight">Hero Image Banner</h3><p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1">Gambar Utama Homepage</p></div>
                                </div>
                                <div className="mb-5">
                                    <div className="relative w-full overflow-hidden rounded-xl border border-navy-100 shadow-sm" style={{ aspectRatio: '16/8.5' }}>
                                        <img loading="lazy" src={heroPreview} alt="Hero Preview" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <form onSubmit={handleSaveHeroImage} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Upload Gambar Hero</label>
                                        <div className="flex items-center space-x-3">
                                            <label className="flex-1 flex items-center justify-center bg-navy-50 border-2 border-dashed border-navy-200 rounded-xl py-4 px-4 cursor-pointer hover:border-gold-400 hover:bg-gold-50 transition-all group">
                                                <Icon name="Upload" className="w-5 h-5 mr-2 text-navy-400 group-hover:text-gold-500 transition-colors" />
                                                <span className="text-sm font-bold text-navy-500 group-hover:text-gold-600 transition-colors">Pilih file gambar...</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleHeroFileUpload} />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">Atau Masukkan URL Gambar</label>
                                        <input type="text" value={editHeroUrl} onChange={e => { setEditHeroUrl(e.target.value); setHeroPreview(e.target.value); }} placeholder="https://example.com/hero.jpg" className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm" />
                                    </div>
                                    <button type="submit" disabled={isSavingHero} className={`w-full ${isSavingHero ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex justify-center items-center`}>
                                        {isSavingHero ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan Hero Image'}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white border border-navy-100/60 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 pb-5">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner"><Icon name="BookOpen" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 text-lg tracking-tight">Link Google Drive Jadwal</h3><p className="text-xs text-navy-500 font-bold uppercase tracking-widest mt-1">Tombol di Halaman Jadwal</p></div>
                                </div>
                                <form onSubmit={handleSaveGdriveUrl} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 mb-2 uppercase tracking-widest">URL Google Drive</label>
                                        <input type="url" value={editGdriveUrl} onChange={e => setEditGdriveUrl(e.target.value)} required placeholder="https://drive.google.com/drive/folders/..." className="w-full p-3.5 border border-navy-200 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 text-sm font-mono font-medium shadow-sm" />
                                        <p className="text-[10px] text-navy-500 mt-2 font-bold leading-relaxed bg-navy-50 p-2.5 rounded-lg border border-navy-100">Link ini akan digunakan oleh tombol <span className="text-gold-600">"Buka Google Drive"</span> di halaman Jadwal Pelayanan.</p>
                                    </div>
                                    <button type="submit" disabled={isSavingGdrive} className={`w-full ${isSavingGdrive ? 'bg-navy-300 text-navy-500 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-gold-400 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex justify-center items-center`}>
                                        {isSavingGdrive ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan Link Google Drive'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {adminTab === 'buku_tamu' && (
                        <BukuTamuAdmin adminToken={adminToken} />
                    )}
                    {adminTab === 'perlawatan' && (
                        <PerlawatanAdmin adminToken={adminToken} />
                    )}

            </div>
        </div>
    );
};




// --- COMPONENT: LAGU SION MINI-APP ---
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

// --- COMPONENT: SEARCH ---
const Search = ({ setActiveTab, setJadwalSelectedDate, jadwalDB, rabuYMD, sabatYMD, tabs, dataPejabat, laguSionDb = [], setSelectedLaguSionSong }) => {
    const [query, setQuery] = React.useState('');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter menus
    const appPages = [
        { id: 'home', title: 'Beranda / Home', desc: 'Halaman utama aplikasi', icon: 'Home' },
        { id: 'jadwal', title: 'Jadwal Pelayanan', desc: 'Jadwal petugas ibadah lengkap', icon: 'Calendar' },
        { id: 'live', title: 'Susunan Ibadah', desc: 'Susunan ibadah Sabat dan liturgi pelayanan', icon: 'FileText' },
        { id: 'persembahan', title: 'Persembahan & Perpuluhan', desc: 'Informasi donasi, QRIS, dan rekening', icon: 'Gift' },
        { id: 'keanggotaan', title: 'Layanan Anggota', desc: 'Informasi keanggotaan dan mutasi', icon: 'Users' },
        { id: 'member_baru', title: 'Member Baru', desc: 'Pendaftaran anggota baru', icon: 'Users' },
        { id: 'form_acms', title: 'Pindah Masuk ACMS', desc: 'Isi formulir perpindahan ACMS', icon: 'BookOpen' },
        { id: 'buku_tamu', title: 'Buku Tamu', desc: 'Isi data kunjungan tamu jemaat', icon: 'Edit' },
        { id: 'hubungi', title: 'Hubungi Kami', desc: 'Kontak gembala dan pejabat jemaat', icon: 'Phone' },
        { id: 'belajar_alkitab', title: 'Doktrin Alkitab', desc: 'Pelajari dasar-dasar Alkitab', icon: 'BookOpen' },
        { id: 'belajar_28dasar', title: '28 Dasar Kepercayaan', desc: 'Doktrin gereja Masehi Advent Hari Ketujuh', icon: 'List' },
        { id: 'belajar_egw', title: 'Ellen G. White', desc: 'Mengenal tulisan roh nubuat', icon: 'BookOpen' },
        { id: 'sekolah_sabat', title: 'Sekolah Sabat', desc: 'Akses pelajaran harian Sekolah Sabat', icon: 'BookOpen', isExternal: true, link: 'https://sabbath-school.adventech.io/in' },
        { id: 'lagu_sion', title: 'Lagu Sion', desc: 'Buku nyanyian Lagu Sion online', icon: 'Music' }
    ];

    const filteredMenus = query.trim() ? appPages.filter(m => m.title.toLowerCase().includes(query.toLowerCase()) || m.desc.toLowerCase().includes(query.toLowerCase())) : [];

    // Filter future schedules for the officer
    let futureJadwal = [];
    // Filter pejabat
    let foundPejabat = [];
    // Filter Lagu Sion
    let foundLaguSion = [];

    if (query.trim().length >= 2) {
        const qLower = query.toLowerCase();

        // Lagu Sion Search
        if (laguSionDb && laguSionDb.length > 0) {
            laguSionDb.forEach(song => {
                const numStr = song.number.toString();
                const matchesNum = numStr === qLower;
                const matchesTitle = song.title.toLowerCase().includes(qLower);
                let matchesLyrics = false;
                let matchedLine = '';
                
                for (const verse of song.verses) {
                    for (const line of verse.lines) {
                        if (line.toLowerCase().includes(qLower)) {
                            matchesLyrics = true;
                            matchedLine = line;
                            break;
                        }
                    }
                    if (matchesLyrics) break;
                }
                
                if (matchesNum || matchesTitle || matchesLyrics) {
                    foundLaguSion.push({
                        song,
                        matchedLine: matchesLyrics ? matchedLine : null
                    });
                }
            });
        }

        // Jadwal Search
        const allDatesInDB = Object.keys(jadwalDB || {});
        if (rabuYMD && !allDatesInDB.includes(rabuYMD)) allDatesInDB.push(rabuYMD);
        if (sabatYMD && !allDatesInDB.includes(sabatYMD)) allDatesInDB.push(sabatYMD);

        const uniqueDates = [...new Set(allDatesInDB)];
        uniqueDates.sort((a, b) => new Date(a) - new Date(b));

        uniqueDates.forEach(dateStr => {
            const dObj = new Date(dateStr + "T00:00:00");
            if (dObj >= today) {
                const jData = jadwalDB?.[dateStr];
                const isRabu = dObj.getDay() === 3;
                let foundTugas = [];

                if (isRabu) {
                    const data = jData ? jData.petugas : initialJadwalRabu.petugas;
                    if (data) {
                        data.forEach(p => {
                            if ((p.nama && p.nama.toLowerCase().includes(qLower)) || (p.tugas && p.tugas.toLowerCase().includes(qLower))) {
                                foundTugas.push({ role: p.tugas, name: p.nama });
                            }
                        });
                    }
                } else {
                    const sourceData = jData || initialJadwalSabat;
                    const categories = ['sekolahSabat', 'khotbah', 'diakon', 'musik', 'perjamuan'];
                    categories.forEach(cat => {
                        if (sourceData[cat]) {
                            sourceData[cat].forEach(p => {
                                if ((p.nama && p.nama.toLowerCase().includes(qLower)) || (p.tugas && p.tugas.toLowerCase().includes(qLower))) {
                                    foundTugas.push({ role: p.tugas, name: p.nama });
                                }
                            });
                        }
                    });
                }

                if (foundTugas.length > 0) {
                    futureJadwal.push({
                        date: dateStr,
                        isRabu: isRabu,
                        tugas: foundTugas
                    });
                }
            }
        });

        // Pejabat Search
        if (dataPejabat) {
            dataPejabat.forEach(p => {
                if ((p.nama && p.nama.toLowerCase().includes(qLower)) || (p.jabatan && p.jabatan.toLowerCase().includes(qLower))) {
                    foundPejabat.push(p);
                }
            });
        }
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400">
                    <Icon name="Search" className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    autoFocus
                    placeholder="Pencarian jadwal, fitur..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-navy-100/80 rounded-2xl text-base font-bold text-navy-900 placeholder-navy-300 outline-none focus:border-gold-500 shadow-sm transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {query.trim().length > 0 && (
                <div className="space-y-6">
                    {/* Menus / Fitur */}
                    <div>
                        <h3 className="text-xs font-black text-navy-500 uppercase tracking-widest mb-3 px-2">Menu & Fitur Aplikasi</h3>
                        {filteredMenus.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-navy-100/60 overflow-hidden shadow-sm">
                                {filteredMenus.map((m, i) => (
                                    <button key={i} onClick={() => m.isExternal ? window.open(m.link, '_blank') : setActiveTab(m.id)} className={`w-full flex items-center p-4 text-left hover:bg-gold-50/50 transition-colors ${i !== filteredMenus.length - 1 ? 'border-b border-navy-50' : ''}`}>
                                        <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-600 mr-4">
                                            <Icon name={m.icon} className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-navy-800">{m.title}</div>
                                            <div className="text-xs text-navy-500">{m.desc}</div>
                                        </div>
                                        <Icon name="ChevronRight" className="w-4 h-4 text-navy-300" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-6 border border-dashed border-navy-200 rounded-2xl bg-white/50">
                                <p className="text-sm text-navy-500 font-medium">Tidak ada fitur ditemukan untuk <span className="font-bold text-navy-900">"{query}"</span></p>
                            </div>
                        )}
                    </div>

                    {query.trim().length >= 2 && (
                        <>
                            {/* Lagu Sion */}
                            {foundLaguSion.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-black text-gold-600 uppercase tracking-widest mb-3 px-2 mt-4">Lagu Sion Edisi Baru</h3>
                                    <div className="bg-white rounded-2xl border border-navy-100/60 overflow-hidden shadow-sm mb-4">
                                        {foundLaguSion.slice(0, 15).map((item, idx) => (
                                            <button key={idx} onClick={() => {
                                                setSelectedLaguSionSong(item.song);
                                                setActiveTab('lagu_sion');
                                            }} className={`w-full flex items-center p-4 text-left hover:bg-gold-50/50 transition-colors ${idx !== foundLaguSion.slice(0, 15).length - 1 ? 'border-b border-navy-50' : ''}`}>
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

                            {/* Pejabat Jemaat */}
                            {foundPejabat.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-black text-gold-600 uppercase tracking-widest mb-3 px-2 mt-4">Pejabat Jemaat</h3>
                                    <div className="space-y-3">
                                        {foundPejabat.map((p, idx) => (
                                            <div key={idx} onClick={() => p.wa ? window.open(`https://wa.me/${p.wa}`, '_blank') : null} className={`bg-white rounded-2xl border border-navy-100/60 p-4 flex items-center shadow-sm transition-colors ${p.wa ? 'cursor-pointer hover:border-gold-300' : ''}`}>
                                                {p.img ? (
                                                    <img loading="lazy" src={p.img} alt={p.nama} className="w-10 h-10 rounded-xl object-cover mr-4 shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-600 mr-4 shrink-0">
                                                        <Icon name="Users" className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="font-bold text-navy-800">{p.nama}</div>
                                                    <div className="text-xs text-navy-500">{p.jabatan}</div>
                                                </div>
                                                {p.wa && <Icon name="Phone" className="w-4 h-4 text-green-500" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Jadwal Tugas */}
                            <div>
                                <h3 className="text-xs font-black text-gold-600 uppercase tracking-widest mb-3 px-2 mt-4">Jadwal Tugas Mendatang</h3>
                                {futureJadwal.length > 0 ? (
                                    <div className="space-y-3">
                                        {futureJadwal.map((jadwal, idx) => (
                                            <div key={idx} onClick={() => { setJadwalSelectedDate(jadwal.date); setActiveTab('jadwal'); }} className="bg-white rounded-2xl border border-navy-100/60 p-4 shadow-sm cursor-pointer hover:border-gold-300 transition-colors">
                                                <div className="flex justify-between items-start mb-3 border-b border-navy-50 pb-2">
                                                    <div className="font-black text-navy-800">{formatIndoDate(jadwal.date)}</div>
                                                    <div className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md ${jadwal.isRabu ? 'bg-navy-100 text-navy-700' : 'bg-gold-100 text-gold-700'}`}>{jadwal.isRabu ? 'RABU' : 'SABAT'}</div>
                                                </div>
                                                <div className="space-y-2 mt-3">
                                                    {jadwal.tugas.map((t, i) => (
                                                        <div key={i} className="flex justify-between items-center text-sm gap-2">
                                                            <span className="text-navy-500 font-medium truncate shrink-0 max-w-[40%]">{t.role}</span>
                                                            <span className="font-bold text-navy-900 bg-gold-50 px-2 py-0.5 rounded text-xs truncate max-w-[60%]">{t.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-6 border border-dashed border-navy-200 rounded-2xl bg-white/50">
                                        <p className="text-sm text-navy-500 font-medium">Tidak ada tugas ditemukan untuk <span className="font-bold text-navy-900">"{query}"</span></p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {query.trim() === '' && (
                <div className="text-center pt-10 pb-6 opacity-60">
                    <Icon name="Search" className="w-12 h-12 mx-auto text-navy-300 mb-3" />
                    <p className="text-sm font-medium text-navy-500">Ketik kata kunci untuk mencari menu, fitur, pejabat, atau jadwal petugas gereja.</p>
                </div>
            )}
        </div>
    );
};

const App = () => {
    const [isAppLoading, setIsAppLoading] = React.useState(true);

    // --- HISTORY API (TOMBOL BACK ANDROID: LOGIKA "UP") ---
    const getInitialTab = () => {
        const hash = window.location.hash.replace('#', '');
        return hash || 'home';
    };
    const [activeTab, setRawActiveTab] = React.useState(getInitialTab());

    const setActiveTab = React.useCallback((tabId) => {
        setRawActiveTab(tabId);
        // Mengganti hash di URL tanpa menambah tumpukan riwayat (history stack tetap stabil)
        window.history.replaceState(window.history.state, '', `#${tabId}`);
    }, []);

    // Scroll to top of the page when switching to a new tab/page
    React.useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

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
                        } else if (currentTab === 'member_baru' || currentTab === 'pindah_masuk' || currentTab === 'form_acms' || currentTab === 'perlawatan' || currentTab === 'buku_tamu') {
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
    const [kategoriPejabat, setKategoriPejabat] = React.useState(["Kepemimpinan", "Keuangan", "Departemen & Pelayanan", "Lainnya"]);
    const [youtubeUrl, setYoutubeUrl] = React.useState("https://www.youtube-nocookie.com/embed?listType=playlist&list=UUNwVpE7CqpcKVcaUnZhUWTQ");
    const [isLiveYoutube, setIsLiveYoutube] = React.useState(false);
    const [youtubeTitle, setYoutubeTitle] = React.useState("");
    const [autoDetectYoutube, setAutoDetectYoutube] = React.useState(true);
    const [youtubeApiKey, setYoutubeApiKey] = React.useState("");
    const [youtubeChannelId, setYoutubeChannelId] = React.useState("UCNwVpE7CqpcKVcaUnZhUWTQ");
    const [heroImageUrl, setHeroImageUrl] = React.useState("./hero-default.jpg");
    const [gdriveUrl, setGdriveUrl] = React.useState("https://drive.google.com");

    const [jadwalSelectedDate, setJadwalSelectedDate] = React.useState(null);

    // Token Admin (berisi password valid setelah login)
    const [adminToken, setAdminToken] = React.useState('');

    // Lagu Sion Mini-App states
    const [laguSionDb, setLaguSionDb] = React.useState([]);
    const [laguSionInitialSong, setLaguSionInitialSong] = React.useState(null);

    React.useEffect(() => {
        fetch('/lagu_sion.json')
            .then(r => r.json())
            .then(data => setLaguSionDb(data))
            .catch(err => console.error("Error loading global Lagu Sion DB:", err));
    }, []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextRabu = new Date(today);
    nextRabu.setDate(today.getDate() + ((3 - today.getDay() + 7) % 7));
    const rabuYMD = toYMD(nextRabu);

    let nextSabat = new Date(today);
    nextSabat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));
    const sabatYMD = toYMD(nextSabat);

    const getNextPerjamuan = () => {
        const year = today.getFullYear();
        const months = [2, 5, 9, 11];
        for (let m of months) {
            let lastDay = new Date(year, m + 1, 0);
            let lastSat = new Date(lastDay);
            lastSat.setDate(lastDay.getDate() - ((lastDay.getDay() + 1) % 7));
            if (today <= lastSat) return lastSat;
        }
        let lastDayNextYear = new Date(year + 1, 3, 0);
        let lastSatNextYear = new Date(lastDayNextYear);
        lastSatNextYear.setDate(lastDayNextYear.getDate() - ((lastDayNextYear.getDay() + 1) % 7));
        return lastSatNextYear;
    };

    const nextPerjamuanObj = getNextPerjamuan();
    const perjamuanYMD = toYMD(nextPerjamuanObj);

    const diffTime = nextPerjamuanObj - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const showPerjamuan = diffDays <= 8 && diffDays >= 0;

    const getSecondSaturday = (year, monthIndex) => {
        const d = new Date(year, monthIndex, 1);
        const day = d.getDay();
        const firstSatOffset = (6 - day + 7) % 7;
        const secondSatDate = 1 + firstSatOffset + 7;
        return new Date(year, monthIndex, secondSatDate);
    };

    const getNextPerpuluhan = () => {
        const year = today.getFullYear();
        const month = today.getMonth();
        const secondSatCurrent = getSecondSaturday(year, month);

        if (today <= secondSatCurrent) {
            return secondSatCurrent;
        } else {
            let nextMonth = month + 1;
            let nextYear = year;
            if (nextMonth > 11) {
                nextMonth = 0;
                nextYear += 1;
            }
            return getSecondSaturday(nextYear, nextMonth);
        }
    };

    const nextPerpuluhanObj = getNextPerpuluhan();
    const perpuluhanYMD = toYMD(nextPerpuluhanObj);
    const diffTimePerpuluhan = nextPerpuluhanObj - today;
    const diffDaysPerpuluhan = Math.ceil(diffTimePerpuluhan / (1000 * 60 * 60 * 24));
    const showPerpuluhan = diffDaysPerpuluhan <= 8 && diffDaysPerpuluhan >= 0;

    const activeRabu = jadwalDB[rabuYMD] || initialJadwalRabu;
    const activeSabat = jadwalDB[sabatYMD] || initialJadwalSabat;
    const activePerjamuan = jadwalDB[perjamuanYMD]?.perjamuan || initialJadwalSabat.perjamuan;

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

    const jadwalKhususRabu = jadwalDB[displayRabuYMD] || initialJadwalRabu;
    const jadwalKhususSabat = jadwalDB[displaySabatYMD] || initialJadwalSabat;
    // ------------------------------ // MENGAMBIL DATA DARI REST API (Stale-While-Revalidate)
    const CACHE_KEY = 'art1s_app_data';

    const applyData = React.useCallback((data) => {
        if (data.dataPejabat) setDataPejabat(data.dataPejabat);
        if (data.jadwalDB) setJadwalDB(data.jadwalDB);
        if (data.youtubeUrl) setYoutubeUrl(data.youtubeUrl);
        if (data.isLiveYoutube !== undefined) setIsLiveYoutube(data.isLiveYoutube);
        if (data.youtubeTitle !== undefined) setYoutubeTitle(data.youtubeTitle);
        if (data.autoDetectYoutube !== undefined) setAutoDetectYoutube(data.autoDetectYoutube);
        if (data.youtubeChannelId !== undefined) setYoutubeChannelId(data.youtubeChannelId);
        if (data.kategoriPejabat) setKategoriPejabat(data.kategoriPejabat);
        if (data.heroImageUrl) setHeroImageUrl(data.heroImageUrl);
        if (data.gdriveUrl) setGdriveUrl(data.gdriveUrl);

    }, []);

    React.useEffect(() => {
        // Step 1: Show cached data instantly (no loading spinner)
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                applyData(JSON.parse(cached));
                setIsAppLoading(false); // Instant UI from cache
            }
        } catch (e) {
            console.warn('Failed to load cached data:', e);
        }

        // Step 2: Always fetch fresh data in background
        fetch(`${GAS_API_URL}?action=getData`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Jaringan bermasalah atau API tidak ditemukan');
                }
                return response.json();
            })
            .then(data => {
                applyData(data);
                setIsAppLoading(false);
                // Save fresh data to localStorage for next visit
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                } catch (e) {
                    console.warn('Failed to cache data:', e);
                }
            })
            .catch(error => {
                console.error('Error fetching data, menggunakan data default:', error);
                setIsAppLoading(false);
            });
    }, []);

    // FIX TYPO: Memperbaiki penulisan state yang sebelumnya kurang kurung siku
    const [isAdminLoggedIn, setIsAdminLoggedIn] = React.useState(false);
    const [showLoginModal, setShowLoginModal] = React.useState(false);
    const [showIosPrompt, setShowIosPrompt] = React.useState(false);
    const [laguSionSubTab, setLaguSionSubTab] = React.useState('numpad');

    React.useEffect(() => {
        const handler = () => setShowIosPrompt(true);
        window.addEventListener('showIosInstallPrompt', handler);
        return () => window.removeEventListener('showIosInstallPrompt', handler);
    }, []);

    const tabs = [
        { id: 'home', label: 'Home', icon: 'Home' },
        { id: 'belajar', label: 'Belajar', icon: 'BookOpen' },
        { id: 'live', label: 'Ibadah', icon: 'FileText' },
        { id: 'jadwal', label: 'Jadwal', icon: 'Calendar' },
        { id: 'persembahan', label: 'Persembahan', icon: 'Gift' }
    ];

    const handleAdminClick = () => { if (isAdminLoggedIn) { setActiveTab('admin_dashboard'); } else { setShowLoginModal(true); } };
    const handleLogout = () => { setIsAdminLoggedIn(false); setAdminToken(''); setActiveTab('home'); };

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <Home setActiveTab={setActiveTab} setJadwalSelectedDate={setJadwalSelectedDate} youtubeUrl={youtubeUrl} isLiveYoutube={isLiveYoutube} youtubeTitle={youtubeTitle} heroImageUrl={heroImageUrl} jadwalDB={jadwalDB} dataPejabat={dataPejabat} isLoading={isAppLoading} showPerjamuan={showPerjamuan} perjamuanYMD={perjamuanYMD} showPerpuluhan={showPerpuluhan} perpuluhanYMD={perpuluhanYMD} />;
            case 'belajar': return <Belajar setActiveTab={setActiveTab} />;
            case 'belajar_alkitab': return <DetailAlkitab setActiveTab={setActiveTab} dataPejabat={dataPejabat} isLoading={isAppLoading} />;
            case 'belajar_28dasar': return <Detail28Dasar setActiveTab={setActiveTab} dataPejabat={dataPejabat} isLoading={isAppLoading} />;
            case 'belajar_egw': return <DetailEGW setActiveTab={setActiveTab} dataPejabat={dataPejabat} isLoading={isAppLoading} />;
            case 'live': return <Live setActiveTab={setActiveTab} activeRabu={activeRabu} activeSabat={activeSabat} rabuYMD={rabuYMD} sabatYMD={sabatYMD} youtubeUrl={youtubeUrl} isLiveYoutube={isLiveYoutube} youtubeTitle={youtubeTitle} isLoading={isAppLoading} laguSionDb={laguSionDb} setLaguSionInitialSong={setLaguSionInitialSong} />;
            case 'jadwal': return <Jadwal jadwalDB={jadwalDB} jadwalSelectedDate={jadwalSelectedDate} setJadwalSelectedDate={setJadwalSelectedDate} showPerjamuan={showPerjamuan} perjamuanYMD={perjamuanYMD} activePerjamuan={activePerjamuan} isLoading={isAppLoading} gdriveUrl={gdriveUrl} />;
            case 'persembahan': return <Persembahan dataPejabat={dataPejabat} isLoading={isAppLoading} setActiveTab={setActiveTab} />;

            case 'keanggotaan': return <Keanggotaan setActiveTab={setActiveTab} />;
            case 'perlawatan': return <Perlawatan setActiveTab={setActiveTab} dataPejabat={dataPejabat} isLoading={isAppLoading} />;
            case 'member_baru': return <MemberBaru setActiveTab={setActiveTab} dataPejabat={dataPejabat} isLoading={isAppLoading} />;
            case 'pindah_masuk': return <PindahMasuk setActiveTab={setActiveTab} dataPejabat={dataPejabat} isLoading={isAppLoading} />;
            case 'hubungi': return <Hubungi setActiveTab={setActiveTab} dataPejabat={dataPejabat} isLoading={isAppLoading} />;
            case 'form_acms': return <FormACMS setActiveTab={setActiveTab} dataPejabat={dataPejabat} />;
            case 'buku_tamu': return <BukuTamu setActiveTab={setActiveTab} />;
            case 'admin_dashboard': return isAdminLoggedIn ? <AdminDashboard dataPejabat={dataPejabat} setDataPejabat={setDataPejabat} jadwalDB={jadwalDB} setJadwalDB={setJadwalDB} adminToken={adminToken} setAdminToken={setAdminToken} youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl} autoDetectYoutube={autoDetectYoutube} setAutoDetectYoutube={setAutoDetectYoutube} youtubeTitle={youtubeTitle} isLiveYoutube={isLiveYoutube} kategoriPejabat={kategoriPejabat} setKategoriPejabat={setKategoriPejabat} heroImageUrl={heroImageUrl} setHeroImageUrl={setHeroImageUrl} gdriveUrl={gdriveUrl} setGdriveUrl={setGdriveUrl} youtubeApiKey={youtubeApiKey} setYoutubeApiKey={setYoutubeApiKey} youtubeChannelId={youtubeChannelId} setYoutubeChannelId={setYoutubeChannelId} /> : <Home setActiveTab={setActiveTab} setJadwalSelectedDate={setJadwalSelectedDate} youtubeUrl={youtubeUrl} isLiveYoutube={isLiveYoutube} youtubeTitle={youtubeTitle} heroImageUrl={heroImageUrl} jadwalDB={jadwalDB} dataPejabat={dataPejabat} isLoading={isAppLoading} showPerjamuan={showPerjamuan} perjamuanYMD={perjamuanYMD} showPerpuluhan={showPerpuluhan} perpuluhanYMD={perpuluhanYMD} />;
            case 'search': return <Search setActiveTab={setActiveTab} setJadwalSelectedDate={setJadwalSelectedDate} jadwalDB={jadwalDB} rabuYMD={rabuYMD} sabatYMD={sabatYMD} tabs={tabs} dataPejabat={dataPejabat} laguSionDb={laguSionDb} setSelectedLaguSionSong={setLaguSionInitialSong} />;
            case 'lagu_sion': return <LaguSion setActiveTab={setActiveTab} subTab={laguSionSubTab} setSubTab={setLaguSionSubTab} initialSong={laguSionInitialSong} clearInitialSong={() => setLaguSionInitialSong(null)} laguSionDb={laguSionDb} />;
            default: return <Home setActiveTab={setActiveTab} setJadwalSelectedDate={setJadwalSelectedDate} youtubeUrl={youtubeUrl} isLiveYoutube={isLiveYoutube} youtubeTitle={youtubeTitle} heroImageUrl={heroImageUrl} jadwalDB={jadwalDB} dataPejabat={dataPejabat} isLoading={isAppLoading} showPerjamuan={showPerjamuan} perjamuanYMD={perjamuanYMD} showPerpuluhan={showPerpuluhan} perpuluhanYMD={perpuluhanYMD} />;
        }
    };

    // UI Rendering
    // Menghapus blocking loading page (menggunakan optimistic UI/default rendering)
    // agar bisa interaktif di bawah 1 detik! Mencegah "stuck di loading page".

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={(token, apiKey, channelId) => { setAdminToken(token); setIsAdminLoggedIn(true); if (apiKey) setYoutubeApiKey(apiKey); if (channelId) setYoutubeChannelId(channelId); setShowLoginModal(false); setActiveTab('admin_dashboard'); }} />
            <IosInstallModal isOpen={showIosPrompt} onClose={() => setShowIosPrompt(false)} />

            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-navy-50 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 gap-3">
                    {(activeTab === 'home' || activeTab === 'search' || activeTab === 'lagu_sion') ? (
                        <div className="flex-1 flex items-center gap-2">
                            {(activeTab === 'search' || activeTab === 'lagu_sion') && (
                                <button onClick={() => setActiveTab('home')} className="w-10 h-10 flex items-center justify-start shrink-0 text-navy-600 hover:text-gold-500 transition-all border border-transparent">
                                    <Icon name="ArrowLeft" className="w-6 h-6" />
                                </button>
                            )}
                            <button onClick={() => setActiveTab('search')} className="w-full flex items-center bg-navy-50/80 border border-navy-100/60 rounded-full text-sm font-medium text-navy-400 hover:bg-white hover:border-navy-200 focus:border-gold-400 transition-all shadow-sm">
                                <div className="pl-3.5 pr-2 py-2.5 text-navy-400">
                                    <Icon name="Search" className="w-4 h-4" />
                                </div>
                                <span className="truncate pr-4 text-left">Pencarian jadwal, fitur...</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 flex justify-start">
                                <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-start text-navy-600 border border-transparent hover:text-gold-500 transition-all">
                                    <Icon name="ArrowLeft" className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 flex justify-center items-center shrink-0">
                                <img loading="lazy" src="./art1s-outline.svg" alt="ART1S" className="h-6 w-auto opacity-80" />
                            </div>
                        </>
                    )}
                    <div className={`flex justify-end ${!(activeTab === 'home' || activeTab === 'search' || activeTab === 'lagu_sion') ? 'flex-1' : ''}`}>
                        {isAdminLoggedIn ? (
                            <button onClick={handleLogout} className="w-10 h-10 bg-white border border-navy-100/60 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition flex items-center justify-center shrink-0 shadow-sm"><Icon name="LogOut" className="w-4 h-4" /></button>
                        ) : (
                            <button onClick={handleAdminClick} className="w-10 h-10 bg-white border border-navy-100/60 rounded-full text-navy-400 hover:text-navy-600 hover:bg-navy-50/50 transition flex items-center justify-center shrink-0 shadow-sm"><Icon name="LogIn" className="w-4 h-4" /></button>
                        )}
                    </div>
                </div>
            </header>



            <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 pb-32 md:pb-32 overflow-x-hidden">
                <div key={activeTab} className="animate-page-enter">
                    {renderContent()}
                </div>
            </main>

            <nav className={`fixed bottom-0 w-full backdrop-blur-xl pb-safe z-50 transition-all duration-300 ${
                activeTab === 'lagu_sion' 
                    ? 'bg-navy-900/95 border-t border-navy-800 shadow-[0_-8px_30px_rgba(11,26,48,0.4)]' 
                    : 'bg-white/95 border-t border-navy-100/50 shadow-[0_-8px_30px_rgb(11,26,48,0.04)]'
            }`}>
                <div className="relative flex justify-around items-center max-w-lg mx-auto">
                    {(() => {
                        const currentNavTabs = activeTab === 'lagu_sion' ? [
                            { id: 'home', label: 'Home', icon: 'Home' },
                            { id: 'numpad', label: 'Numpad', icon: 'Grid' },
                            { id: 'live', label: 'Ibadah', icon: 'FileText' },
                            { id: 'lyrics', label: 'Lirik', icon: 'BookOpen' },
                            { id: 'index', label: 'Daftar', icon: 'List' }
                        ] : tabs;

                        const activeIndex = currentNavTabs.findIndex(tab => 
                            activeTab === 'lagu_sion' 
                                ? tab.id === laguSionSubTab 
                                : activeTab.startsWith(tab.id)
                        );

                        if (activeIndex === -1) return null;
                        return (
                            <div 
                                className="absolute inset-y-0 left-0 transition-transform duration-350 ease-[cubic-bezier(0.34,1.5,0.64,1)] pointer-events-none z-0 will-change-transform"
                                style={{
                                    width: `${100 / currentNavTabs.length}%`,
                                    transform: `translateX(${activeIndex * 100}%)`
                                }}
                            >
                                {/* Top Accent Line */}
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-b-full transition-all duration-300 ${
                                    activeTab === 'lagu_sion' 
                                        ? 'bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 shadow-[0_2px_10px_rgba(232,177,53,0.5)]' 
                                        : 'bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 shadow-[0_2px_8px_rgba(11,26,48,0.35)]'
                                }`} />
                                {/* Active Background Pill */}
                                <div className={`mx-1 my-1.5 h-[calc(100%-12px)] rounded-2xl shadow-sm transition-all duration-300 ${
                                    activeTab === 'lagu_sion' 
                                        ? 'bg-gradient-to-b from-gold-400/25 via-gold-400/10 to-transparent border border-gold-400/30' 
                                        : 'bg-gradient-to-b from-navy-900/12 via-navy-900/5 to-transparent border border-navy-900/10'
                                }`} />
                            </div>
                        );
                    })()}

                    {(() => {
                        const currentNavTabs = activeTab === 'lagu_sion' ? [
                            { id: 'home', label: 'Home', icon: 'Home' },
                            { id: 'numpad', label: 'Numpad', icon: 'Grid' },
                            { id: 'live', label: 'Ibadah', icon: 'FileText' },
                            { id: 'lyrics', label: 'Lirik', icon: 'BookOpen' },
                            { id: 'index', label: 'Daftar', icon: 'List' }
                        ] : tabs;

                        return currentNavTabs.map(tab => {
                            const isActive = activeTab === 'lagu_sion' 
                                ? laguSionSubTab === tab.id 
                                : activeTab.startsWith(tab.id);

                            const isLaguSion = activeTab === 'lagu_sion';

                            return (
                                <button 
                                    key={tab.id} 
                                    onClick={() => {
                                        if (activeTab === 'lagu_sion') {
                                            if (tab.id === 'home') {
                                                setActiveTab('home');
                                            } else if (tab.id === 'live') {
                                                setActiveTab('live');
                                            } else {
                                                if (laguSionSubTab === tab.id) {
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                } else {
                                                    setLaguSionSubTab(tab.id);
                                                }
                                            }
                                        } else {
                                            if (activeTab === tab.id) {
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            } else {
                                                setActiveTab(tab.id);
                                            }
                                        }
                                    }} 
                                    className={`relative z-10 flex flex-col items-center flex-1 pt-2.5 pb-2 transition-all duration-200 select-none active:scale-90 ${
                                        isActive 
                                            ? isLaguSion ? 'text-gold-400' : 'text-navy-900' 
                                            : isLaguSion ? 'text-gold-100/50 hover:text-gold-300' : 'text-navy-400 hover:text-navy-600'
                                    }`}
                                >
                                    <Icon 
                                        name={tab.icon} 
                                        className={`w-6 h-6 mb-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.5,0.64,1)] ${
                                            isActive 
                                                ? isLaguSion 
                                                    ? 'stroke-[2.5px] -translate-y-1 scale-110 text-gold-400 drop-shadow-[0_2px_8px_rgba(232,177,53,0.5)]' 
                                                    : 'stroke-[2.5px] -translate-y-1 scale-110 text-navy-900 drop-shadow-xs' 
                                                : 'stroke-[2px]'
                                        }`} 
                                    />
                                    <span className={`text-[10px] tracking-wide transition-all duration-300 ${
                                        isActive 
                                            ? isLaguSion ? 'font-black opacity-100 scale-105 text-gold-400' : 'font-black opacity-100 scale-105 text-navy-900' 
                                            : 'font-semibold opacity-70'
                                    }`}>
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        });
                    })()}
                </div>
            </nav>

            {/* Floating Action Button (Hubungi / WA) */}
            {activeTab !== 'admin_dashboard' && activeTab !== 'hubungi' && activeTab !== 'lagu_sion' && (
                <button
                    onClick={() => setActiveTab('hubungi')}
                    className="fixed bottom-28 right-6 md:right-8 z-40 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center animate-fade-in border border-green-400/50"
                    aria-label="Hubungi Kami"
                    title="Hubungi Kami"
                >
                    <Icon name="Phone" className="w-6 h-6 md:w-7 md:h-7 drop-shadow-sm" />
                </button>
            )}
        </div>
    );
};

export default App;
