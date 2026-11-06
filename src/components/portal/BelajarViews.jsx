import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, Maximize, Minimize2, FileText, Download, Share2, Info, BookOpen, Search as SearchIcon, X, CheckCircle, Navigation, MapPin, Calendar, Phone, Mail, Clock, Globe, ArrowRight, User, PlusCircle, PenTool, Layout, ExternalLink, Menu, Music, Activity, Megaphone, Video, ArrowLeft, MoreHorizontal, MessageCircle, Heart, Star, Compass, Anchor, Copy, Check, Upload, Trash2, Map as MapIcon } from 'lucide-react';
import {
  GAS_API_URL,
  portalFetch,
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

export const Belajar = ({ setActiveTab }) => {
    const items = [
        { id: 'sekolah_sabat', title: 'Sekolah Sabat', desc: 'Akses pelajaran harian Sekolah Sabat Dewasa lengkap dengan Ayat Hafalan, renungan harian, dan Alkitab.', img: 'https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/ecfa0085-8c09-46ef-97df-6be05cd44019/1000129545/w=800,quality=80,fit=scale-down', color: 'blue' },
        { id: 'belajar', title: 'Belajar Online', desc: 'Pembelajaran tanpa batas, lebih banyak kemungkinan untuk mengenal-Nya, Bertemulah dengan-Nya kapan dan dimana saja', img: 'https://suaranubuatan.id/wp-content/uploads/2021/09/book-4126481_1920.jpg', color: 'purple', isExternal: true, link: 'https://suaranubuatan.id/' },
        { id: 'alkitab', title: 'Alkitab', desc: 'Alkitab adalah firman Allah yang diilhamkan, satu-satunya aturan iman dan praktik.', img: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1200&auto=format&fit=crop', color: 'orange' },
        { id: '28dasar', title: '28 Dasar Kepercayaan', desc: 'Gereja Advent memegang keyakinan dasar tertentu sebagai ajaran Kitab Suci.', img: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=1200&auto=format&fit=crop', color: 'green' },
        { id: 'perpustakaan', title: 'Buku-Buku', desc: 'Baca, Download Buku dan bervagai bahan untuk khotbah dan pemahaman lainnya.', img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop', color: 'purple' },
        { id: 'egw', title: 'Ellen G. White', desc: 'Mengenal tulisan-tulisan yang diilhami untuk menuntun gereja pada akhir zaman.', img: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop', color: 'purple' }
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
                    <div key={item.id} className="w-full sm:w-80 md:w-72 lg:w-64 glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 overflow-hidden flex flex-col group hover:border-gold-400 dark:hover:border-gold-500 hover:shadow-md transition-all duration-300">
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
                                <button
                                    onClick={() => {
                                        if (item.id === 'alkitab') {
                                            setActiveTab('alkitab');
                                        } else {
                                            setActiveTab(`belajar_${item.id}`);
                                        }
                                    }}
                                    className="w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 bg-navy-50 dark:bg-navy-800 hover:bg-[#4A7045] hover:text-white dark:hover:bg-gold-500 dark:hover:text-navy-950 text-navy-800 dark:text-gray-200 cursor-pointer shadow-xs"
                                >
                                    <span className="tracking-wide">
                                        {item.id === 'alkitab' ? 'Buka Alkitab Digital' : item.id === 'perpustakaan' ? 'Baca Pustaka Buku' : item.id === 'sekolah_sabat' ? 'Buka Sekolah Sabat' : 'Pelajari Detail'}
                                    </span>
                                    <Icon name={item.id === 'alkitab' ? 'Book' : 'BookOpen'} className="w-[1.15rem] h-[1.15rem]" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const ContactGembala = ({ dataPejabat }) => {
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

export const DetailAlkitab = ({ setActiveTab, dataPejabat }) => (
    <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-6 md:p-8 animate-fade-in relative z-10">
        <div className="prose max-w-none">
            <h1 className="text-[2rem] font-extrabold text-navy-900 mb-6 border-b pb-4 border-navy-50">Doktrin Alkitab</h1>
            <img src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1200&auto=format&fit=crop" loading="lazy" alt="Bible Detail" className="w-full h-[18rem] object-cover rounded-[1.25rem] mb-8 shadow-sm" />
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

export const Detail28Dasar = ({ setActiveTab, dataPejabat }) => {
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
                <img src="https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=1200&auto=format&fit=crop" loading="lazy" alt="28 Doctrine Detail" className="w-full h-[18rem] object-cover rounded-[1.25rem] mb-8 shadow-sm" />
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

export const DetailEGW = ({ setActiveTab, dataPejabat }) => (
    <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-6 md:p-8 animate-fade-in relative z-10">
        <div className="prose max-w-none">
            <h1 className="text-[2rem] font-extrabold text-navy-900 mb-6 border-b pb-4 border-navy-50">Karunia Nubuat: Ellen G. White</h1>
            <img src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop" loading="lazy" alt="EGW Detail" className="w-full h-[18rem] object-cover rounded-[1.25rem] mb-8 shadow-sm" />
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

export const Detailperpustakaan = ({ setActiveTab, dataPejabat, initialBook, onBookOpened, setHideGlobalBack, daftarBuku = [] }) => {
    const [selectedBook, setSelectedBook] = React.useState(initialBook || null);
    const [booksFromServer, setBooksFromServer] = React.useState(() => (Array.isArray(daftarBuku) && daftarBuku.length > 0 ? daftarBuku : []));
    const [isLoadingBooks, setIsLoadingBooks] = React.useState(!daftarBuku || daftarBuku.length === 0);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortBy, setSortBy] = React.useState('newest'); // 'newest' (default) | 'title_asc' | 'title_desc' | 'author'

    React.useEffect(() => {
        if (setHideGlobalBack) setHideGlobalBack(true);
        return () => { if (setHideGlobalBack) setHideGlobalBack(false); };
    }, [setHideGlobalBack]);

    // Reset initialBook ketika dibuka dari menu pencarian
    React.useEffect(() => {
        if (selectedBook && onBookOpened) {
            onBookOpened();
        }
    }, [selectedBook, onBookOpened]);

    // Load books dari backend saat komponen mount
    React.useEffect(() => {
        const loadBooks = async () => {
            if (!booksFromServer || booksFromServer.length === 0) {
                setIsLoadingBooks(true);
            }
            try {
                const res = await portalFetch(GAS_API_URL, {
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

    const categoryCounts = React.useMemo(() => {
        const counts = { 'Semua': booksFromServer.length };
        booksFromServer.forEach(b => {
            if (b.category) {
                counts[b.category] = (counts[b.category] || 0) + 1;
            }
        });
        return counts;
    }, [booksFromServer]);

    // Menandai 3 buku teratas sebagai "Baru" untuk kemudahan identifikasi jemaat
    const newestBookIds = React.useMemo(() => {
        return new Set(sortBooksNewestFirst(booksFromServer, booksFromServer).slice(0, 3).map(b => String(b.id)));
    }, [booksFromServer]);

    // Filter dan pengurutan buku: Posisi paling atas selalu yang terbaru secara default
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

        if (sortBy === 'title_asc') {
            return result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }
        if (sortBy === 'title_desc') {
            return result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        }
        if (sortBy === 'author') {
            return result.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
        }

        // Default 'newest': Posisi paling atas selalu yang paling baru
        return sortBooksNewestFirst(result, booksFromServer);
    }, [booksFromServer, activeCategory, searchQuery, sortBy]);

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
        <div className="space-y-6 sm:space-y-8 animate-fade-in relative pb-16">
            {/* STICKY TOP BAR: TOMBOL KEMBALI + FILTER KATEGORI */}
            <div className="sticky top-16 md:top-[4.5rem] z-[35] rounded-2xl px-3 sm:px-4 py-2.5 liquid-glass-header transition-all print:hidden no-print flex items-center gap-2.5 sm:gap-3 shadow-sm border border-navy-100/50 dark:border-navy-700/50">
                <button
                    onClick={() => {
                        if (window.history.length > 1) {
                            window.history.back();
                        } else {
                            setActiveTab('belajar');
                        }
                    }}
                    className="flex items-center justify-center px-3.5 py-2 rounded-xl liquid-glass-pill text-navy-700 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white font-extrabold transition-all gap-1.5 group shrink-0 shadow-xs cursor-pointer"
                    title="Kembali ke Halaman Sebelumnya"
                >
                    <Icon name="ArrowLeft" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-xs sm:text-sm">Kembali</span>
                </button>

                <div className="h-6 w-px bg-navy-200/60 dark:bg-navy-700/60 shrink-0" />

                {/* Filter Kategori Navigation Pills (Horizontal Scroll) */}
                <div className="flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar py-0.5 min-w-0">
                    {categories.map((cat) => {
                        const count = categoryCounts[cat] || 0;
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${isActive
                                    ? 'bg-navy-900 dark:bg-gold-500 text-gold-400 dark:text-navy-950 shadow-xs scale-102 font-extrabold'
                                    : 'text-navy-700 dark:text-navy-300 hover:bg-navy-100/70 dark:hover:bg-navy-800/80 bg-white/60 dark:bg-navy-900/60 border border-navy-200/60 dark:border-navy-700/60'
                                    }`}
                            >
                                <span>{cat}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive
                                    ? 'bg-gold-500/20 text-gold-300 dark:bg-navy-900/20 dark:text-navy-950'
                                    : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400'
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Kotak Konten Utama Perpustakaan Buku */}
            <div className="space-y-6 glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-5 md:p-6">
                {/* Header */}
                <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop" loading="lazy" alt="Buku" className="w-full h-[14rem] object-cover" />
                    <div className="p-6">
                        <h1 className="text-[1.75rem] font-extrabold text-navy-900 dark:text-white mb-2">Perpustakaan Buku</h1>
                        <p className="text-navy-500 dark:text-navy-300 font-medium text-sm leading-relaxed">Baca dan unduh buku-buku rohani langsung di sini. Pilih buku untuk membacanya.</p>
                    </div>
                </div>

                {/* Bar Pencarian & Pengurutan Buku */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                    <div className="relative flex-1">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
                            <Icon name="Search" className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari judul, pengarang, atau deskripsi..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-white dark:bg-navy-900 border border-navy-100/80 dark:border-navy-700/80 rounded-2xl text-sm font-semibold text-navy-900 dark:text-white placeholder-navy-300 dark:placeholder-navy-500 outline-none focus:border-gold-500 shadow-sm transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-navy-100 dark:bg-navy-800 text-navy-500 dark:text-navy-400 hover:bg-navy-200 transition flex items-center justify-center">
                                <Icon name="X" className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown Pengurutan Buku (Rapi, Terstruktur & Proporsional di Mobile Maupun Desktop) */}
                    <div className="flex items-center justify-between sm:justify-start gap-2 bg-white dark:bg-navy-900 px-3.5 py-2.5 sm:py-3 border border-navy-100/80 dark:border-navy-700/80 rounded-2xl shadow-sm shrink-0">
                        <div className="flex items-center gap-1.5 text-navy-500 dark:text-navy-400">
                            <Icon name="ArrowDownUp" className="w-4 h-4 text-gold-500 shrink-0" />
                            <span className="text-xs font-bold whitespace-nowrap">Urutan:</span>
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-xs font-extrabold text-navy-800 dark:text-gold-400 outline-none cursor-pointer pr-1"
                        >
                            <option value="newest" className="dark:bg-navy-900">✨ Terbaru</option>
                            <option value="title_asc" className="dark:bg-navy-900">Judul (A - Z)</option>
                            <option value="title_desc" className="dark:bg-navy-900">Judul (Z - A)</option>
                            <option value="author" className="dark:bg-navy-900">Penulis (A - Z)</option>
                        </select>
                    </div>
                </div>

                {/* Status Kategori Aktif & Hasil Filter */}
                <div className="flex items-center justify-between text-xs font-bold text-navy-500 dark:text-navy-400 px-1 pt-1">
                    <span>
                        Menampilkan <b>{filteredBooks.length}</b> buku {activeCategory !== 'Semua' ? `dalam kategori "${activeCategory}"` : 'tersedia'}
                        {searchQuery.trim() && ` untuk pencarian "${searchQuery}"`}
                    </span>
                    {activeCategory !== 'Semua' && (
                        <button
                            onClick={() => setActiveCategory('Semua')}
                            className="text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                        >
                            <span>Tampilkan Semua Kategori</span>
                        </button>
                    )}
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
                            {filteredBooks.map((book, idx) => {
                                const isNew = newestBookIds.has(String(book.id)) && sortBy === 'newest' && !searchQuery.trim();
                                return (
                                    <div
                                        key={book.id}
                                        className={`w-full glass-box rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 cursor-pointer ${isNew ? 'border-2 border-emerald-400/80 dark:border-emerald-500/80 shadow-emerald-500/5' : 'border border-navy-100/60 dark:border-navy-700/60 hover:border-gold-400 dark:hover:border-gold-500'}`}
                                        onClick={() => setSelectedBook(book)}
                                    >
                                        <div className="h-[10rem] overflow-hidden relative">
                                            <img
                                                src={getCoverFallback(book)}
                                                alt={book.title}
                                                loading="lazy"
                                                decoding="async"
                                                referrerPolicy="no-referrer"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                onError={(e) => handleBookCoverError(e, book)}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
                                            <DocumentBadge book={book} />
                                            <div className="absolute top-2 right-2 flex items-center gap-1">
                                                {isNew && (
                                                    <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                                        Baru
                                                    </span>
                                                )}
                                                <span className="bg-gold-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    {book.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-3 flex-1 flex flex-col">
                                            <p className="font-bold text-navy-900 text-sm leading-tight mb-1 line-clamp-3">{book.title}</p>
                                            <p className="text-xs text-navy-400 font-semibold mb-3">{book.author}</p>
                                            <button className="mt-auto w-full py-2 rounded-xl bg-navy-900 text-gold-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-navy-800 transition">
                                                <Icon name="BookOpen" className="w-3.5 h-3.5" /> Baca Buku
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
        </div>
    );
};

export default Belajar;
