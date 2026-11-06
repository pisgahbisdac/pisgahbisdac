import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, Maximize, Minimize2, FileText, Download, Share2, Info, BookOpen, Search as SearchIcon, X, CheckCircle, Navigation, MapPin, Calendar, Phone, Mail, Clock, Globe, ArrowRight, User, PlusCircle, PenTool, Layout, ExternalLink, Menu, Music, Activity, Megaphone, Video, ArrowLeft, MoreHorizontal, MessageCircle, Heart, Star, Compass, Anchor, Copy, Check, Upload, Trash2, Map as MapIcon } from 'lucide-react';
import {
  GAS_API_URL,
  portalFetch,
  checkPortalSupabaseHealth,
  migratePortalGASToSupabase,
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

// ==========================================
// Pemuat On-Demand heic2any (~1,3 MB)
// Hanya diunduh saat admin benar-benar mengunggah foto HEIC/HEIF,
// sehingga tidak membebani pemuatan awal portal bagi jemaat.
// ==========================================
const HEIC2ANY_CDN_URL = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
let heic2anyLoaderPromise = null;
const loadHeic2any = () => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    if (typeof window.heic2any === 'function') return Promise.resolve(window.heic2any);
    if (!heic2anyLoaderPromise) {
        heic2anyLoaderPromise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = HEIC2ANY_CDN_URL;
            script.async = true;
            script.onload = () => resolve(typeof window.heic2any === 'function' ? window.heic2any : null);
            script.onerror = () => {
                heic2anyLoaderPromise = null; // izinkan percobaan ulang berikutnya
                resolve(null);
            };
            document.head.appendChild(script);
        });
    }
    return heic2anyLoaderPromise;
};

// ==========================================
// RichTextEditor Component (WYSIWYG)
// Ditempatkan di level modul agar komponen tidak unmount saat parent re-render
// ==========================================
export const RichTextEditor = React.forwardRef(({ initialValue = "", onChange, placeholder, onUploadImage, allowImage = true }, ref) => {
    const editorRef = React.useRef(null);
    const lastHtmlRef = React.useRef(initialValue);
    const savedRangeRef = React.useRef(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const [showImageModal, setShowImageModal] = React.useState(false);
    const [isReplacingImage, setIsReplacingImage] = React.useState(false);
    const [imageTab, setImageTab] = React.useState('upload'); // 'upload' | 'url'
    const [imageUrlInput, setImageUrlInput] = React.useState('');
    const [imageCaption, setImageCaption] = React.useState('');
    const [imageAlignment, setImageAlignment] = React.useState('center'); // 'center' | 'left' | 'right' | 'full'
    const [selectedFileObj, setSelectedFileObj] = React.useState(null);
    const [selectedFilePreview, setSelectedFilePreview] = React.useState('');
    const [isProcessingImage, setIsProcessingImage] = React.useState(false);
    const [inlineUploadError, setInlineUploadError] = React.useState('');
    const [selectedFigure, setSelectedFigure] = React.useState(null);
    const fileInputRef = React.useRef(null);

    // Simpan range/posisi kursor secara proaktif
    const saveSelection = React.useCallback(() => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current) {
            const range = sel.getRangeAt(0);
            if (editorRef.current.contains(range.commonAncestorContainer)) {
                savedRangeRef.current = range.cloneRange();
            }
        }
    }, []);

    React.useImperativeHandle(ref, () => ({
        getContent: () => {
            if (!editorRef.current) return '';
            const clone = editorRef.current.cloneNode(true);
            const marker = clone.querySelector('#warta-insert-target');
            if (marker) marker.remove();
            clone.querySelectorAll('.ring-4').forEach(el => {
                el.classList.remove('ring-4', 'ring-gold-400', 'ring-offset-2');
            });
            return clone.innerHTML;
        },
        setContent: (html) => {
            if (editorRef.current) {
                editorRef.current.innerHTML = html || '';
                lastHtmlRef.current = html || '';
            }
        },
        focus: () => {
            if (editorRef.current) editorRef.current.focus();
        }
    }));

    // Inisialisasi awal saat dimuat
    React.useEffect(() => {
        if (editorRef.current && initialValue && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = initialValue;
            lastHtmlRef.current = initialValue;
        }
    }, []);

    // Sinkronisasi nilai eksternal jika form di-reset atau ganti data tanpa merusak kursor yang sedang mengetik
    React.useEffect(() => {
        if (editorRef.current && initialValue !== lastHtmlRef.current) {
            if (document.activeElement !== editorRef.current && !editorRef.current.contains(document.activeElement)) {
                editorRef.current.innerHTML = initialValue || '';
                lastHtmlRef.current = initialValue || '';
            }
        }
    }, [initialValue]);

    const handleInput = () => {
        if (editorRef.current) {
            saveSelection();
            const clone = editorRef.current.cloneNode(true);
            const marker = clone.querySelector('#warta-insert-target');
            if (marker) marker.remove();
            clone.querySelectorAll('.ring-4').forEach(el => {
                el.classList.remove('ring-4', 'ring-gold-400', 'ring-offset-2');
            });
            const currentHtml = clone.innerHTML;
            lastHtmlRef.current = currentHtml;
            if (onChange) {
                onChange(currentHtml);
            }
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        saveSelection();
        handleInput();
    };

    const handleEditorClick = (e) => {
        saveSelection();
        const fig = e.target.closest('figure[data-warta-image="true"]');
        if (fig) {
            setSelectedFigure(fig);
        } else {
            setSelectedFigure(null);
        }
    };

    const openImageModal = () => {
        setIsReplacingImage(false);
        // Simpan kursor sebelum modal terbuka
        saveSelection();

        // Hapus penanda lama jika ada
        if (editorRef.current) {
            const oldMarker = editorRef.current.querySelector('#warta-insert-target');
            if (oldMarker) oldMarker.remove();
        }

        // Buat penanda visual posisi kursor
        const marker = document.createElement('div');
        marker.id = 'warta-insert-target';
        marker.className = 'warta-insert-indicator flex items-center gap-2 p-2.5 my-3 bg-gradient-to-r from-amber-50 to-gold-50 dark:from-navy-850 dark:to-navy-800 border-2 border-dashed border-gold-400 rounded-xl text-navy-900 dark:text-gold-300 font-bold text-xs shadow-md select-none animate-pulse';
        marker.setAttribute('contenteditable', 'false');
        marker.innerHTML = '<span class="w-2.5 h-2.5 rounded-full bg-gold-500 animate-ping"></span> 📸 <span class="tracking-wide">[Posisi Gambar Akan Disisipkan Tepat di Sini]</span>';

        let inserted = false;
        let range = null;

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current) {
            const r = sel.getRangeAt(0);
            if (editorRef.current.contains(r.commonAncestorContainer)) {
                range = r;
            }
        }
        if (!range && savedRangeRef.current && editorRef.current) {
            if (editorRef.current.contains(savedRangeRef.current.commonAncestorContainer)) {
                range = savedRangeRef.current;
            }
        }

        if (range && editorRef.current) {
            try {
                range.deleteContents();
                range.insertNode(marker);
                inserted = true;
            } catch (err) {
                console.warn("Could not insert marker at range:", err);
            }
        }

        if (!inserted && editorRef.current) {
            editorRef.current.appendChild(marker);
        }

        setTimeout(() => {
            if (marker && marker.scrollIntoView) {
                marker.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 50);

        setImageUrlInput('');
        setImageCaption('');
        setImageAlignment('center');
        setSelectedFileObj(null);
        setSelectedFilePreview('');
        setInlineUploadError('');
        setImageTab('upload');
        setShowImageModal(true);
    };

    const openReplaceImageModal = (fig) => {
        if (!fig) return;
        setIsReplacingImage(true);
        setSelectedFigure(fig);

        const img = fig.querySelector('img');
        const existingSrc = img?.src || '';
        const captionEl = fig.querySelector('figcaption');
        const existingCaption = captionEl ? captionEl.textContent : '';

        let existingAlign = 'center';
        if (fig.className.includes('float-left')) existingAlign = 'left';
        else if (fig.className.includes('float-right')) existingAlign = 'right';
        else if (fig.className.includes('w-full')) existingAlign = 'full';

        setImageUrlInput(existingSrc.startsWith('http') ? existingSrc : '');
        setImageCaption(existingCaption);
        setImageAlignment(existingAlign);
        setSelectedFileObj(null);
        setSelectedFilePreview(existingSrc);
        setInlineUploadError('');
        setImageTab(existingSrc.startsWith('http') ? 'url' : 'upload');
        setShowImageModal(true);
    };

    const closeImageModal = () => {
        if (editorRef.current) {
            const marker = editorRef.current.querySelector('#warta-insert-target');
            if (marker) marker.remove();
        }
        setShowImageModal(false);
        setIsReplacingImage(false);
        handleInput();
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    const setFigureAlignment = (fig, align) => {
        if (!fig) return;
        let alignClasses = 'my-6 mx-auto block text-center max-w-full clear-both';
        let imgClasses = 'rounded-2xl shadow-md max-w-full h-auto mx-auto block border border-navy-100 dark:border-navy-800 transition hover:shadow-lg cursor-pointer';

        if (align === 'left') {
            alignClasses = 'my-4 float-left mr-6 mb-4 max-w-[48%] text-left clear-left';
            imgClasses = 'rounded-xl shadow-md max-w-full h-auto block border border-navy-100 dark:border-navy-800 transition hover:shadow-lg cursor-pointer';
        } else if (align === 'right') {
            alignClasses = 'my-4 float-right ml-6 mb-4 max-w-[48%] text-right clear-right';
            imgClasses = 'rounded-xl shadow-md max-w-full h-auto block border border-navy-100 dark:border-navy-800 transition hover:shadow-lg cursor-pointer';
        } else if (align === 'full') {
            alignClasses = 'my-6 w-full block text-center clear-both';
            imgClasses = 'rounded-2xl shadow-md w-full h-auto block border border-navy-100 dark:border-navy-800 transition hover:shadow-lg cursor-pointer';
        }

        fig.className = alignClasses;
        const img = fig.querySelector('img');
        if (img) img.className = imgClasses;
        handleInput();
    };

    const deleteFigure = (fig) => {
        if (!fig) return;
        fig.remove();
        setSelectedFigure(null);
        handleInput();
    };

    const execCommand = (cmd, valueArg = null) => {
        if (!editorRef.current) return;
        editorRef.current.focus();

        if (cmd === 'formatBlock' && valueArg === '<h3>') {
            const selection = window.getSelection();
            if (selection && selection.rangeCount) {
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
            const selection = window.getSelection();
            if (selection && selection.rangeCount) {
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
            const selection = window.getSelection();
            if (selection && selection.rangeCount) {
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
            const br = document.createElement('br');
            const selection = window.getSelection();
            if (selection && selection.rangeCount) {
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
            document.execCommand(cmd, false, valueArg);
        }

        saveSelection();
        handleInput();
    };

    const insertLink = () => {
        const url = prompt('Masukkan URL tautan:', 'https://');
        if (url) execCommand('createLink', url);
    };

    const insertBreak = () => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        const br = document.createElement('br');
        const selection = window.getSelection();
        if (selection && selection.rangeCount) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(br);
            range.setStartAfter(br);
            range.setEndAfter(br);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        saveSelection();
        handleInput();
    };

    const handleConfirmInsert = async () => {
        setInlineUploadError('');
        let finalUrl = '';

        if (imageTab === 'upload') {
            if (!selectedFileObj) {
                setInlineUploadError('Silakan pilih berkas foto terlebih dahulu.');
                return;
            }
            setIsProcessingImage(true);
            try {
                const compressed = await compressImage(selectedFileObj, 1000);
                if (onUploadImage) {
                    finalUrl = await onUploadImage(compressed, selectedFileObj.name);
                } else {
                    finalUrl = compressed;
                }
            } catch (err) {
                setInlineUploadError('Gagal memproses foto: ' + err.message);
                setIsProcessingImage(false);
                return;
            }
            setIsProcessingImage(false);
        } else {
            finalUrl = imageUrlInput.trim();
            if (!finalUrl) {
                setInlineUploadError('Silakan masukkan link URL gambar yang valid.');
                return;
            }
        }

        // Mode Ganti Foto pada gambar sisipan yang sudah ada di editor
        if (isReplacingImage && selectedFigure) {
            const img = selectedFigure.querySelector('img');
            if (img) {
                img.src = finalUrl;
                img.alt = imageCaption || 'Foto Warta';
            }

            let captionEl = selectedFigure.querySelector('figcaption');
            if (imageCaption && imageCaption.trim()) {
                if (!captionEl) {
                    captionEl = document.createElement('figcaption');
                    selectedFigure.appendChild(captionEl);
                }
                captionEl.className = 'text-xs text-center text-navy-500 dark:text-navy-400 mt-2 italic font-medium';
                captionEl.setAttribute('contenteditable', 'true');
                captionEl.textContent = imageCaption.trim();
            } else if (captionEl) {
                captionEl.remove();
            }

            setFigureAlignment(selectedFigure, imageAlignment);

            setShowImageModal(false);
            setIsReplacingImage(false);
            handleInput();

            setTimeout(() => {
                if (editorRef.current) {
                    editorRef.current.focus();
                }
                if (selectedFigure && selectedFigure.scrollIntoView) {
                    selectedFigure.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                selectedFigure.classList.add('ring-4', 'ring-gold-400', 'ring-offset-2');
                setTimeout(() => {
                    selectedFigure.classList.remove('ring-4', 'ring-gold-400', 'ring-offset-2');
                }, 2500);
            }, 60);
            return;
        }

        // Cari penanda visual target
        const marker = editorRef.current?.querySelector('#warta-insert-target');

        // Susun elemen figure profesional
        const figure = document.createElement('figure');
        figure.setAttribute('data-warta-image', 'true');
        figure.setAttribute('contenteditable', 'false');

        let alignClasses = 'my-6 mx-auto block text-center max-w-full clear-both';
        let imgClasses = 'rounded-2xl shadow-md max-w-full h-auto mx-auto block border border-navy-100 dark:border-navy-800 transition hover:shadow-lg cursor-pointer';

        if (imageAlignment === 'left') {
            alignClasses = 'my-4 float-left mr-6 mb-4 max-w-[48%] text-left clear-left';
            imgClasses = 'rounded-xl shadow-md max-w-full h-auto block border border-navy-100 dark:border-navy-800 transition hover:shadow-lg cursor-pointer';
        } else if (imageAlignment === 'right') {
            alignClasses = 'my-4 float-right ml-6 mb-4 max-w-[48%] text-right clear-right';
            imgClasses = 'rounded-xl shadow-md max-w-full h-auto block border border-navy-100 dark:border-navy-800 transition hover:shadow-lg cursor-pointer';
        } else if (imageAlignment === 'full') {
            alignClasses = 'my-6 w-full block text-center clear-both';
            imgClasses = 'rounded-2xl shadow-md w-full h-auto block border border-navy-100 dark:border-navy-800 transition hover:shadow-lg cursor-pointer';
        }

        figure.className = alignClasses;

        const img = document.createElement('img');
        img.src = finalUrl;
        img.alt = imageCaption || 'Foto Warta';
        img.className = imgClasses;
        img.style.maxHeight = '480px';
        img.style.objectFit = 'contain';
        img.setAttribute('loading', 'eager');
        img.setAttribute('decoding', 'auto');
        figure.appendChild(img);

        if (imageCaption && imageCaption.trim()) {
            const captionEl = document.createElement('figcaption');
            captionEl.className = 'text-xs text-center text-navy-500 dark:text-navy-400 mt-2 italic font-medium';
            captionEl.setAttribute('contenteditable', 'true');
            captionEl.textContent = imageCaption.trim();
            figure.appendChild(captionEl);
        }

        if (marker && marker.parentNode) {
            marker.parentNode.replaceChild(figure, marker);
        } else if (editorRef.current) {
            editorRef.current.appendChild(figure);
        }

        // Tambahkan baris kosong setelah gambar agar bisa langsung lanjut mengetik
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        if (figure.parentNode) {
            figure.parentNode.insertBefore(p, figure.nextSibling);
        }

        setShowImageModal(false);
        handleInput();

        // Fokuskan kursor tepat di bawah gambar di baris baru dan scroll secara halus tanpa lompat
        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.focus();
                const sel = window.getSelection();
                if (sel) {
                    const newRange = document.createRange();
                    newRange.selectNodeContents(p);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                    savedRangeRef.current = newRange.cloneRange();
                }
            }
            if (figure && figure.scrollIntoView) {
                figure.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            figure.classList.add('ring-4', 'ring-gold-400', 'ring-offset-2');
            setTimeout(() => {
                figure.classList.remove('ring-4', 'ring-gold-400', 'ring-offset-2');
            }, 2500);
        }, 60);
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = items[i].getAsFile();
                    if (file) {
                        openImageModal();
                        setSelectedFileObj(file);
                        setSelectedFilePreview(URL.createObjectURL(file));
                        setImageTab('upload');
                    }
                    break;
                }
            }
        }
    };

    const handleDrop = async (e) => {
        const files = e.dataTransfer?.files;
        if (files && files.length > 0 && files[0].type.startsWith('image/')) {
            e.preventDefault();
            const file = files[0];
            openImageModal();
            setSelectedFileObj(file);
            setSelectedFilePreview(URL.createObjectURL(file));
            setImageTab('upload');
        }
    };

    return (
        <div className="border border-navy-200 dark:border-navy-700 rounded-xl overflow-hidden bg-white dark:bg-navy-900 shadow-sm relative">
            {/* Main Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-navy-50 dark:bg-navy-800 border-b border-navy-100 dark:border-navy-700/60">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} className="p-1.5 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-200 rounded transition" title="Tebal (Bold)"><Icon name="Bold" className="w-4 h-4" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} className="p-1.5 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-200 rounded transition" title="Miring (Italic)"><Icon name="Italic" className="w-4 h-4" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }} className="p-1.5 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-200 rounded transition" title="Garis Bawah (Underline)"><Icon name="Underline" className="w-4 h-4" /></button>
                <div className="w-px h-5 bg-navy-300 dark:bg-navy-700 mx-1 self-center"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<h3>'); }} className="p-1 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-gold-400 rounded font-black text-xs px-2 transition" title="Subjudul (H3)">H3</button>
                <div className="w-px h-5 bg-navy-300 dark:bg-navy-700 mx-1 self-center"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }} className="p-1.5 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-200 rounded transition" title="Daftar Poin (Bullet List)"><Icon name="List" className="w-4 h-4" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertOrderedList'); }} className="p-1.5 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-200 rounded transition" title="Daftar Nomor (Numbered List)"><Icon name="ListOrdered" className="w-4 h-4" /></button>
                <div className="w-px h-5 bg-navy-300 dark:bg-navy-700 mx-1 self-center"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className="p-1.5 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-200 rounded transition" title="Sisipkan Tautan (Link)"><Icon name="LinkIcon" className="w-4 h-4" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertBreak(); }} className="p-1 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-navy-200 rounded font-bold text-xs px-2 transition" title="Garis Baru (Line Break)">BR</button>
                <div className="w-px h-5 bg-navy-300 dark:bg-navy-700 mx-1 self-center"></div>
                {allowImage && (
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); openImageModal(); }}
                        onClick={openImageModal}
                        className="p-1.5 px-2.5 bg-gold-400/20 hover:bg-gold-400/30 text-gold-700 dark:text-gold-300 border border-gold-400/40 rounded-lg flex items-center gap-1.5 font-extrabold text-xs transition shadow-sm ml-auto sm:ml-0 active:scale-95"
                        title="Sisipkan Gambar di Posisi Kursor Tulisan"
                    >
                        <Icon name="Image" className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                        <span>+ Sisipkan Gambar</span>
                    </button>
                )}
            </div>

            {/* Sub-Toolbar Konteks: Format Gambar Terpilih */}
            {selectedFigure && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 px-3 bg-amber-50/90 dark:bg-navy-800/90 border-b border-gold-300/50 dark:border-navy-700 text-xs animate-fade-in">
                    <div className="flex items-center gap-1.5 font-extrabold text-navy-900 dark:text-gold-400">
                        <Icon name="Image" className="w-3.5 h-3.5 text-gold-500" />
                        <span>Format Gambar Terpilih:</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                        <button
                            type="button"
                            onClick={() => openReplaceImageModal(selectedFigure)}
                            className="px-2.5 py-1 rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 text-[11px] font-extrabold transition shadow-xs flex items-center gap-1 active:scale-95"
                            title="Ganti gambar ini dengan foto baru dari HP/Laptop atau URL"
                        >
                            <Icon name="RefreshCw" className="w-3 h-3 stroke-[2.5]" />
                            <span>Ganti Foto</span>
                        </button>
                        <div className="w-px h-4 bg-navy-200 dark:bg-navy-700 mx-0.5 self-center"></div>
                        <button
                            type="button"
                            onClick={() => setFigureAlignment(selectedFigure, 'center')}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-[11px] font-bold hover:bg-gold-50 text-navy-800 dark:text-navy-200 shadow-xs"
                            title="Rata Tengah"
                        >
                            ↔ Tengah
                        </button>
                        <button
                            type="button"
                            onClick={() => setFigureAlignment(selectedFigure, 'left')}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-[11px] font-bold hover:bg-gold-50 text-navy-800 dark:text-navy-200 shadow-xs"
                            title="Rata Kiri"
                        >
                            ⬅ Kiri
                        </button>
                        <button
                            type="button"
                            onClick={() => setFigureAlignment(selectedFigure, 'right')}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-[11px] font-bold hover:bg-gold-50 text-navy-800 dark:text-navy-200 shadow-xs"
                            title="Rata Kanan"
                        >
                            ➡ Kanan
                        </button>
                        <button
                            type="button"
                            onClick={() => setFigureAlignment(selectedFigure, 'full')}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-[11px] font-bold hover:bg-gold-50 text-navy-800 dark:text-navy-200 shadow-xs"
                            title="Lebar Penuh"
                        >
                            ⬛ Penuh
                        </button>
                        <button
                            type="button"
                            onClick={() => deleteFigure(selectedFigure)}
                            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold transition ml-1"
                            title="Hapus Gambar Ini"
                        >
                            <Icon name="Trash" className="w-3 h-3 inline mr-1" /> Hapus Foto
                        </button>
                    </div>
                </div>
            )}

            {/* ContentEditable Canvas */}
            <div
                ref={editorRef}
                contentEditable
                onFocus={() => { setIsFocused(true); saveSelection(); }}
                onBlur={handleBlur}
                onInput={handleInput}
                onClick={handleEditorClick}
                onDoubleClick={(e) => {
                    const fig = e.target.closest('figure[data-warta-image="true"]');
                    if (fig) openReplaceImageModal(fig);
                }}
                onKeyUp={saveSelection}
                onMouseUp={saveSelection}
                onSelect={saveSelection}
                onTouchEnd={saveSelection}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="rich-text-editor p-4 min-h-[240px] max-h-[500px] overflow-y-auto focus:outline-none bg-white dark:bg-navy-900 dark:text-white prose prose-sm max-w-none"
                style={{ whiteSpace: 'pre-wrap' }}
            />

            {/* Modal Sisipkan Gambar (Dimount Langsung ke document.body via Portal agar 100% di Tengah Layar) */}
            {showImageModal && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 bg-navy-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
                    <div className="bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 rounded-2xl max-w-lg w-full p-5 md:p-6 shadow-2xl relative text-left my-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold">
                                    <Icon name={isReplacingImage ? "RefreshCw" : "Image"} className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-navy-900 dark:text-gold-400 text-base">
                                        {isReplacingImage ? "Ganti Foto Sisipan" : "Sisipkan Gambar ke Isi Warta"}
                                    </h3>
                                    <p className="text-[11px] text-navy-500 dark:text-navy-400">
                                        {isReplacingImage ? "Pilih foto pengganti baru dari perangkat atau masukkan URL baru" : "Gambar akan muncul tepat pada posisi kursor tulisan yang telah ditandai"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeImageModal}
                                className="p-1.5 text-navy-400 hover:text-navy-600 dark:hover:text-navy-200 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition"
                            >
                                <Icon name="X" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mode Tab: Upload vs URL */}
                        <div className="flex rounded-xl bg-navy-100 dark:bg-navy-800 p-1 mb-4">
                            <button
                                type="button"
                                onClick={() => setImageTab('upload')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${imageTab === 'upload' ? 'bg-white dark:bg-navy-900 text-navy-900 dark:text-gold-400 shadow-sm' : 'text-navy-600 dark:text-navy-300'}`}
                            >
                                <Icon name="Upload" className="w-3.5 h-3.5" /> Unggah Foto Perangkat
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageTab('url')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${imageTab === 'url' ? 'bg-white dark:bg-navy-900 text-navy-900 dark:text-gold-400 shadow-sm' : 'text-navy-600 dark:text-navy-300'}`}
                            >
                                <Icon name="LinkIcon" className="w-3.5 h-3.5" /> Masukkan Link (URL)
                            </button>
                        </div>

                        {/* Upload Area */}
                        {imageTab === 'upload' ? (
                            <div className="mb-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setSelectedFileObj(file);
                                            setSelectedFilePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                {selectedFilePreview ? (
                                    <div className="relative border border-navy-200 dark:border-navy-700 rounded-xl p-3 bg-navy-50/50 dark:bg-navy-950 text-center">
                                        <img src={selectedFilePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain shadow-sm" />
                                        <div className="mt-2.5 flex items-center justify-between text-xs text-navy-500 dark:text-navy-400 px-2">
                                            <span className="truncate max-w-[200px] font-medium">{selectedFileObj?.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-gold-600 hover:text-gold-700 dark:text-gold-400 font-bold underline"
                                            >
                                                Ganti Foto
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-navy-300 dark:border-navy-700 hover:border-gold-500 rounded-xl p-7 text-center cursor-pointer transition hover:bg-gold-50/20 dark:hover:bg-navy-800/50"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center mx-auto mb-2.5">
                                            <Icon name="Upload" className="w-6 h-6" />
                                        </div>
                                        <p className="text-xs font-bold text-navy-800 dark:text-navy-200 mb-1">Klik untuk Memilih Foto dari HP atau Laptop</p>
                                        <p className="text-[11px] text-navy-400">Mendukung format JPG, PNG, atau WebP (Otomatis dikompres)</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider mb-1.5">URL Gambar Eksternal</label>
                                <input
                                    type="url"
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    placeholder="https://contoh.com/foto-kegiatan.jpg"
                                    className="w-full p-2.5 border border-navy-200 dark:border-navy-700 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950 dark:text-white focus:border-gold-500 outline-none"
                                />
                                {imageUrlInput && (
                                    <div className="mt-2 p-2 border border-navy-100 dark:border-navy-800 rounded-lg text-center bg-navy-50/30">
                                        <img src={imageUrlInput} alt="Preview" className="max-h-36 mx-auto rounded object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Caption Field */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider mb-1">
                                Keterangan / Takarir Foto <span className="text-navy-400 font-normal">(Opsional)</span>
                            </label>
                            <input
                                type="text"
                                value={imageCaption}
                                onChange={(e) => setImageCaption(e.target.value)}
                                placeholder="Contoh: Suasana ibadah Sabat di GMAHK Pisgah"
                                className="w-full p-2.5 border border-navy-200 dark:border-navy-700 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950 dark:text-white focus:border-gold-500 outline-none"
                            />
                        </div>

                        {/* Alignment Options */}
                        <div className="mb-5">
                            <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider mb-1.5">
                                Tata Letak / Posisi Gambar
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'center', label: '↔ Tengah' },
                                    { id: 'left', label: '⬅ Kiri' },
                                    { id: 'right', label: '➡ Kanan' },
                                    { id: 'full', label: '⬛ Penuh' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setImageAlignment(opt.id)}
                                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${imageAlignment === opt.id ? 'bg-gold-500 text-navy-950 border-gold-500 shadow-sm' : 'border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {inlineUploadError && (
                            <p className="text-xs text-red-500 mb-3 font-semibold">{inlineUploadError}</p>
                        )}

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100 dark:border-navy-800">
                            <button
                                type="button"
                                onClick={closeImageModal}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmInsert}
                                disabled={isProcessingImage}
                                className="px-5 py-2 rounded-xl text-xs font-bold bg-navy-900 text-gold-400 hover:bg-navy-800 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400 transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {isProcessingImage ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        <span>Memproses Foto...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icon name="Check" className="w-3.5 h-3.5" />
                                        <span>{isReplacingImage ? "Perbarui & Ganti Foto" : "Sisipkan ke Tulisan"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
});

// --- PANEL ADMIN TAHAP 3: KELOLA POKOK DOA (PUBLIK & PRIVAT), KONFIRMASI PETUGAS, ULANG TAHUN & KALENDER ---
export const AdminPastoralAndCalendarPanel = () => {
    const [section, setSection] = React.useState('prayers'); // 'prayers' | 'attendance' | 'birthdays' | 'calendar'
    const [prayers, setPrayers] = React.useState(() => loadPrayerRequests());
    const [birthdays, setBirthdays] = React.useState(() => loadMemberBirthdays());
    const [calendarItems, setCalendarItems] = React.useState(() => loadAnnualCalendar());
    const attendanceMap = useOfficerAttendance();

    // Form Ulang Tahun Baru / Edit
    const [editingBdayId, setEditingBdayId] = React.useState(null);
    const [newBdayName, setNewBdayName] = React.useState('');
    const [newBdayDay, setNewBdayDay] = React.useState(1);
    const [newBdayMonth, setNewBdayMonth] = React.useState(new Date().getMonth() + 1);
    const [newBdayKat, setNewBdayKat] = React.useState('Anggota Jemaat');
    const [newBdayWa, setNewBdayWa] = React.useState('');

    // Form Kalender Tahunan Baru / Edit
    const [editingCalId, setEditingCalId] = React.useState(null);
    const [newCalTitle, setNewCalTitle] = React.useState('');
    const [newCalDate, setNewCalDate] = React.useState('');
    const [newCalQuarter, setNewCalQuarter] = React.useState(1);
    const [newCalCat, setNewCalCat] = React.useState('Kegiatan Gereja');
    const [newCalLoc, setNewCalLoc] = React.useState('GMAHK Jemaat Pisgah BISDAC - Batam');
    const [newCalDesc, setNewCalDesc] = React.useState('');

    const [isSyncingSheets, setIsSyncingSheets] = React.useState(false);

    const handleRefreshFromSheets = async () => {
        if (!GAS_API_URL) return;
        setIsSyncingSheets(true);
        try {
            const res = await fetch(`${GAS_API_URL}?action=getData`);
            const data = await res.json();
            if (data.daftarDoa && Array.isArray(data.daftarDoa)) {
                setPrayers(data.daftarDoa);
                savePrayerRequests(data.daftarDoa, false);
            }
            if (data.daftarKalender && Array.isArray(data.daftarKalender)) {
                setCalendarItems(data.daftarKalender);
                saveAnnualCalendar(data.daftarKalender, false);
            }
            if (data.daftarUltah && Array.isArray(data.daftarUltah)) {
                setBirthdays(data.daftarUltah);
                saveMemberBirthdays(data.daftarUltah, false);
            }
            if (data.konfirmasiPetugas && typeof data.konfirmasiPetugas === 'object') {
                try {
                    localStorage.setItem(OFFICER_ATTENDANCE_STORAGE_KEY, JSON.stringify(data.konfirmasiPetugas));
                    window.dispatchEvent(new CustomEvent('pisgah-attendance-updated'));
                } catch (e) { }
            }
            alert('✅ Berhasil menyinkronkan data dari Google Spreadsheet!');
        } catch (e) {
            alert('Gagal menyinkronkan data: ' + e.message);
        } finally {
            setIsSyncingSheets(false);
        }
    };

    React.useEffect(() => {
        const syncPrayers = () => setPrayers(loadPrayerRequests());
        const syncCal = () => {
            setBirthdays(loadMemberBirthdays());
            setCalendarItems(loadAnnualCalendar());
        };
        window.addEventListener('pisgah-prayer-updated', syncPrayers);
        window.addEventListener('pisgah-calendar-updated', syncCal);
        return () => {
            window.removeEventListener('pisgah-prayer-updated', syncPrayers);
            window.removeEventListener('pisgah-calendar-updated', syncCal);
        };
    }, []);

    const handleToggleAnswered = (id) => {
        setPrayers(prev => {
            const next = prev.map(p => String(p.id) === String(id) ? { ...p, isAnswered: !p.isAnswered } : p);
            savePrayerRequests(next, true);
            return next;
        });
    };

    const handleDeletePrayer = (id) => {
        if (!window.confirm('Hapus pokok doa ini?')) return;
        const next = prayers.filter(p => String(p.id) !== String(id));
        setPrayers(next);
        savePrayerRequests(next, true);
    };

    const handleShareSinglePrayerWA = (p) => {
        if (!p) return;
        const items = parsePrayerContent(p.content);
        let formattedContent = `"${p.content}"`;
        if (items.length > 1 || (items.length === 1 && items[0].num)) {
            formattedContent = items.map(it => {
                if (it.isHeader) return `*${it.text}*`;
                return `${it.num ? `${it.num}.` : '•'} ${it.text}`;
            }).join('\n');
        }
        const catObj = PRAYER_CATEGORIES.find(c => c.id === p.category);
        const catIcon = catObj?.icon || '🙏';
        const isPriv = p.privacy === 'private';
        const dateStr = p.createdAt ? formatIndoDateShort(toYMD(new Date(p.createdAt))) : 'Hari ini';

        const text =
            (isPriv ? `*🔒 POKOK DOA KHUSUS (PASTORAL/PRIVAT)*\n` : `*🙏 POKOK DOA JEMAAT*\n`) +
            `*GMAHK Jemaat Pisgah BISDAC - Batam*\n\n` +
            `👤 *Dari:* ${p.senderName || 'Jemaat'}\n` +
            `🏷️ *Kategori:* ${catIcon} ${p.category || 'Umum'}${isPriv ? ' _(Rahasia/Privat)_' : ''}\n` +
            `📅 *Tanggal:* ${dateStr}\n\n` +
            `*Permohonan Pokok Doa:*\n${formattedContent}\n\n` +
            `_(Telah didukung dalam doa: ${p.prayedCount || 1}x)_\n\n` +
            `_"Karena itu hendaklah kamu saling mengaku dosamu dan saling mendoakan, supaya kamu sembuh. Doa orang yang benar, bila dengan yakin didoakan, sangat besar kuasanya."_ (Yakobus 5:16)\n\n` +
            `Kirim & dukung pokok doa jemaat di:\n${getCleanShareUrl('jadwal')}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleAddBirthday = (e) => {
        e.preventDefault();
        if (!newBdayName.trim()) return;
        const itemData = {
            id: editingBdayId || ('bday_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
            nama: newBdayName.trim(),
            birthDay: parseInt(newBdayDay, 10) || 1,
            birthMonth: parseInt(newBdayMonth, 10) || 1,
            kategori: newBdayKat.trim() || 'Anggota Jemaat',
            wa: newBdayWa.trim()
        };
        const next = editingBdayId
            ? birthdays.map(b => String(b.id) === String(editingBdayId) ? itemData : b)
            : [...birthdays, itemData];
        setBirthdays(next);
        saveMemberBirthdays(next, true);
        setEditingBdayId(null);
        setNewBdayName('');
        setNewBdayWa('');
    };

    const handleStartEditBirthday = (b) => {
        setEditingBdayId(b.id);
        setNewBdayName(b.nama || '');
        setNewBdayDay(b.birthDay || 1);
        setNewBdayMonth(b.birthMonth || 1);
        setNewBdayKat(b.kategori || 'Anggota Jemaat');
        setNewBdayWa(b.wa || '');
    };

    const handleDeleteBirthday = (id, idx) => {
        const next = birthdays.filter((b, i) => {
            if (b && b.id !== undefined && id !== undefined) {
                return String(b.id) !== String(id);
            }
            return i !== idx;
        });
        setBirthdays(next);
        saveMemberBirthdays(next, true);
        if (editingBdayId && String(editingBdayId) === String(id)) {
            setEditingBdayId(null);
            setNewBdayName('');
            setNewBdayWa('');
        }
    };

    const [isSyncingHadirDB, setIsSyncingHadirDB] = React.useState(false);

    const handleSyncBirthdaysFromHadirDB = async () => {
        setIsSyncingHadirDB(true);
        try {
            let jemaatList = [];
            // 1. Cek cache lokal database presensi jemaat (hadir.html)
            try {
                const cached = localStorage.getItem('pisgah_data_cache');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && Array.isArray(parsed.jemaat) && parsed.jemaat.length > 0) {
                        jemaatList = parsed.jemaat;
                    }
                }
            } catch (e) { }

            // 2. Jika cache kosong, tarik langsung dari API Kehadiran Apps Script
            const HADIR_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwW-Km_huyHl-RZ18MSjVXTF46bNJGDb634-hqqhGCwRgV2VsCqx6vG3dmQSqStJhE-/exec";
            if (jemaatList.length === 0 && HADIR_APPS_SCRIPT_URL) {
                try {
                    const res = await fetch(`${HADIR_APPS_SCRIPT_URL}?_=${Date.now()}`);
                    const json = await res.json();
                    if (json && json.success && json.data && Array.isArray(json.data.jemaat)) {
                        jemaatList = json.data.jemaat;
                        try { localStorage.setItem('pisgah_data_cache', JSON.stringify(json.data)); } catch (e) { }
                    }
                } catch (e) {
                    console.warn('Gagal fetch hadir API:', e);
                }
            }

            if (jemaatList.length === 0) {
                alert('Tidak ditemukan data jemaat dari Database Presensi (hadir.html). Silakan pastikan koneksi internet aktif atau buka laman Kehadiran.');
                setIsSyncingHadirDB(false);
                return;
            }

            // 3. Filter dan ekstrak tanggal lahir jemaat
            let syncedCount = 0;
            const currentMap = new Map();
            birthdays.forEach(b => {
                if (b && b.nama) {
                    currentMap.set(b.nama.trim().toLowerCase(), { ...b });
                }
            });

            jemaatList.forEach((j, idx) => {
                const rawDate = (j.tglLahir || '').trim();
                if (!rawDate) return;

                let day = null;
                let month = null;

                // Format YYYY-MM-DD
                if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(rawDate)) {
                    const parts = rawDate.split('-');
                    month = parseInt(parts[1], 10);
                    day = parseInt(parts[2], 10);
                }
                // Format DD-MM-YYYY atau DD/MM/YYYY
                else if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/.test(rawDate)) {
                    const parts = rawDate.split(/[-\/]/);
                    day = parseInt(parts[0], 10);
                    month = parseInt(parts[1], 10);
                }
                // Format DD-MM atau DD/MM
                else if (/^\d{1,2}[-\/]\d{1,2}$/.test(rawDate)) {
                    const parts = rawDate.split(/[-\/]/);
                    day = parseInt(parts[0], 10);
                    month = parseInt(parts[1], 10);
                }

                if (!day || !month || day < 1 || day > 31 || month < 1 || month > 12) return;

                const nameKey = (j.nama || '').trim().toLowerCase();
                if (!nameKey) return;

                const phone = (j.telepon || j.wa || '').trim();
                const kat = (j.subKelasNama || j.kelasNama || 'Anggota Jemaat').trim();

                const existing = currentMap.get(nameKey);
                if (existing) {
                    existing.birthDay = day;
                    existing.birthMonth = month;
                    if (phone && !existing.wa) existing.wa = phone;
                    if (kat && (!existing.kategori || existing.kategori === 'Anggota Jemaat')) existing.kategori = kat;
                    currentMap.set(nameKey, existing);
                } else {
                    currentMap.set(nameKey, {
                        id: `bday_hadir_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
                        nama: j.nama.trim(),
                        birthDay: day,
                        birthMonth: month,
                        kategori: kat,
                        wa: phone
                    });
                    syncedCount++;
                }
            });

            const merged = Array.from(currentMap.values()).sort((a, b) => {
                if (a.birthMonth !== b.birthMonth) return (a.birthMonth || 0) - (b.birthMonth || 0);
                return (a.birthDay || 0) - (b.birthDay || 0);
            });

            setBirthdays(merged);
            saveMemberBirthdays(merged, true);
            alert(`Sinkronisasi Database Presensi Berhasil!\n\n• ${syncedCount} jemaat baru ditambahkan ke kalender ulang tahun.\n• Total ${merged.length} jemaat tersimpan & tersinkron ke Google Sheets.`);
        } catch (err) {
            console.error('Error syncing birthdays from hadir DB:', err);
            alert('Gagal menyinkronkan data ulang tahun: ' + (err.message || 'Terjadi kesalahan'));
        } finally {
            setIsSyncingHadirDB(false);
        }
    };

    const handleClearAllBirthdays = () => {
        if (!window.confirm('Kosongkan seluruh daftar ulang tahun jemaat?')) return;
        setBirthdays([]);
        saveMemberBirthdays([], true);
        setEditingBdayId(null);
    };

    const handleAddCalendarItem = (e) => {
        e.preventDefault();
        if (!newCalTitle.trim() || !newCalDate) return;
        const itemData = {
            id: editingCalId || ('cal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
            title: newCalTitle.trim(),
            dateYMD: newCalDate,
            quarter: parseInt(newCalQuarter, 10) || 1,
            category: newCalCat.trim() || 'Kegiatan Gereja',
            location: newCalLoc.trim() || 'GMAHK Jemaat Pisgah BISDAC - Batam',
            desc: newCalDesc.trim()
        };
        const next = editingCalId
            ? calendarItems.map(c => String(c.id) === String(editingCalId) ? itemData : c)
            : [...calendarItems, itemData];
        setCalendarItems(next);
        saveAnnualCalendar(next, true);
        setEditingCalId(null);
        setNewCalTitle('');
        setNewCalDate('');
        setNewCalDesc('');
    };

    const handleStartEditCalendarItem = (c) => {
        setEditingCalId(c.id);
        setNewCalTitle(c.title || '');
        setNewCalDate(c.dateYMD || '');
        setNewCalQuarter(c.quarter || 1);
        setNewCalCat(c.category || 'Kegiatan Gereja');
        setNewCalLoc(c.location || 'GMAHK Jemaat Pisgah BISDAC - Batam');
        setNewCalDesc(c.desc || '');
    };

    const handleDeleteCalendarItem = (id, idx) => {
        const next = calendarItems.filter((c, i) => {
            if (c && c.id !== undefined && id !== undefined) {
                return String(c.id) !== String(id);
            }
            return i !== idx;
        });
        setCalendarItems(next);
        saveAnnualCalendar(next, true);
        if (editingCalId && String(editingCalId) === String(id)) {
            setEditingCalId(null);
            setNewCalTitle('');
            setNewCalDate('');
            setNewCalDesc('');
        }
    };

    const handleClearAllCalendarItems = () => {
        if (!window.confirm('Kosongkan seluruh agenda kalender tahunan?')) return;
        setCalendarItems([]);
        saveAnnualCalendar([], true);
        setEditingCalId(null);
    };

    const attendanceRecords = React.useMemo(() => {
        return Object.entries(attendanceMap || {})
            .map(([key, val]) => ({ key, ...val }))
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }, [attendanceMap]);

    const privatePrayersCount = prayers.filter(p => p.privacy === 'private').length;

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            {/* Status Sinkronisasi Google Spreadsheet */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs font-bold text-emerald-950 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span className="truncate">
                        Tersinkronisasi dengan Google Spreadsheet (Sheet: <code>Pokok_Doa</code>, <code>Agenda_Tahunan</code>, <code>Ulang_Tahun_Jemaat</code>, <code>Konfirmasi_Petugas</code>)
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleRefreshFromSheets}
                    disabled={isSyncingSheets}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    title="Muat ulang seluruh data terbaru langsung dari Google Spreadsheet"
                >
                    <Icon name="RefreshCw" className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSheets ? 'Menyinkronkan...' : 'Sinkronkan dari Spreadsheet'}</span>
                </button>
            </div>

            {/* Sub-Navigasi Ruang Pastoral & Kalender */}
            <div className="flex flex-wrap items-center gap-2 bg-navy-50/70 p-2 rounded-2xl border border-navy-100">
                <button
                    type="button"
                    onClick={() => setSection('prayers')}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-2 ${section === 'prayers' ? 'bg-navy-900 text-gold-400 shadow-sm' : 'text-navy-600 hover:bg-white'}`}
                >
                    <span>🙏 Pokok Doa ({prayers.length})</span>
                    {privatePrayersCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-navy-950 text-[10px] font-black">
                            🔒 {privatePrayersCount} Privat
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setSection('attendance')}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${section === 'attendance' ? 'bg-navy-900 text-gold-400 shadow-sm' : 'text-navy-600 hover:bg-white'}`}
                >
                    ✅ Konfirmasi Petugas ({attendanceRecords.length})
                </button>
                <button
                    type="button"
                    onClick={() => setSection('birthdays')}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${section === 'birthdays' ? 'bg-navy-900 text-gold-400 shadow-sm' : 'text-navy-600 hover:bg-white'}`}
                >
                    🎂 Ulang Tahun Jemaat ({birthdays.length})
                </button>
                <button
                    type="button"
                    onClick={() => setSection('calendar')}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${section === 'calendar' ? 'bg-navy-900 text-gold-400 shadow-sm' : 'text-navy-600 hover:bg-white'}`}
                >
                    📅 Kalender Tahunan ({calendarItems.length})
                </button>
            </div>

            {section === 'prayers' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-navy-800 flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <strong>Ruang Doa Pastoral (Pendeta & Majelis):</strong> Menampilkan seluruh pokok doa jemaat, baik yang bersifat <strong>🌐 Publik</strong> maupun <strong>🔒 Privat (Rahasia Khusus Gembala/Majelis)</strong>.
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prayers.map(p => (
                            <div
                                key={p.id}
                                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${p.privacy === 'private' ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-navy-100'}`}
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${p.privacy === 'private' ? 'bg-amber-500 text-navy-950' : 'bg-emerald-500/15 text-emerald-700'}`}>
                                                {p.privacy === 'private' ? '🔒 Privat (Khusus Majelis)' : '🌐 Publik (Ibadah Rabu)'}
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy-100 text-navy-700">
                                                {p.category}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-bold text-navy-400">
                                            🙏 {p.prayedCount || 1}x
                                        </span>
                                    </div>
                                    <PrayerContentRenderer content={p.content} />
                                </div>
                                <div className="pt-3 border-t border-navy-100 flex items-center justify-between gap-2">
                                    <div className="text-xs font-extrabold text-navy-800">
                                        👤 {p.senderName}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => handleShareSinglePrayerWA(p)}
                                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-[#25D366] text-emerald-700 hover:text-white border border-emerald-200 hover:border-[#25D366] text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                                            title="Bagikan Pokok Doa ini ke WhatsApp"
                                        >
                                            <Icon name="WhatsApp" className="w-3.5 h-3.5" />
                                            <span>Share</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleAnswered(p.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${p.isAnswered ? 'bg-emerald-600 text-white' : 'bg-navy-100 text-navy-700 hover:bg-emerald-500 hover:text-white'}`}
                                        >
                                            {p.isAnswered ? '✅ Sudah Didoakan' : 'Tandai Didoakan'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePrayer(p.id)}
                                            className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white cursor-pointer"
                                            title="Hapus Pokok Doa"
                                        >
                                            <Icon name="Trash" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {section === 'attendance' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-navy-50/60 border border-navy-100 text-xs sm:text-sm text-navy-700">
                        Daftar rekap petugas ibadah yang telah menekan tombol <strong>Konfirmasi Hadir ✅</strong> atau <strong>Berhalangan ⚠️</strong> pada halaman Jadwal & Home.
                    </div>
                    {attendanceRecords.length === 0 ? (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-navy-200 text-navy-400 text-sm font-bold">
                            Belum ada data konfirmasi kehadiran petugas yang masuk.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {attendanceRecords.map(rec => (
                                <div key={rec.key} className="p-4 rounded-2xl bg-white border border-navy-100 flex items-start justify-between gap-3 shadow-xs">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${rec.status === 'hadir' ? 'bg-emerald-500/20 text-emerald-700' : 'bg-amber-500/20 text-amber-700'}`}>
                                                {rec.status === 'hadir' ? '✅ Siap Hadir' : '⚠️ Berhalangan'}
                                            </span>
                                            <span className="text-xs font-bold text-navy-500">{formatIndoDateShort(rec.dateStr)}</span>
                                        </div>
                                        <h4 className="font-black text-navy-900 text-sm">{rec.nama} — {rec.tugas}</h4>
                                        <p className="text-xs text-navy-500">{rec.sesi}</p>
                                        {rec.substitute && <p className="text-xs font-bold text-amber-700 mt-1">🔄 Usulan Pengganti: {rec.substitute}</p>}
                                        {rec.note && <p className="text-xs text-navy-600 mt-0.5">📝 Catatan: {rec.note}</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => saveOfficerAttendanceRecord(rec.key, null)}
                                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                                        title="Hapus Konfirmasi"
                                    >
                                        <Icon name="Trash" className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {section === 'birthdays' && (
                <div className="space-y-5">
                    <form onSubmit={handleAddBirthday} className="p-4 sm:p-5 rounded-2xl bg-navy-50/50 border border-navy-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                        <div>
                            <label className="text-[10px] font-black uppercase text-navy-500 block mb-1">Nama Jemaat</label>
                            <input type="text" required value={newBdayName} onChange={e => setNewBdayName(e.target.value)} placeholder="Nama Lengkap..." className="w-full p-2.5 rounded-xl border border-navy-200 text-xs font-bold bg-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-black uppercase text-navy-500 block mb-1">Tanggal</label>
                                <input type="number" min="1" max="31" value={newBdayDay} onChange={e => setNewBdayDay(e.target.value)} className="w-full p-2.5 rounded-xl border border-navy-200 text-xs font-bold bg-white" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-navy-500 block mb-1">Bulan</label>
                                <select value={newBdayMonth} onChange={e => setNewBdayMonth(e.target.value)} className="w-full p-2.5 rounded-xl border border-navy-200 text-xs font-bold bg-white">
                                    {BIBLE_YEAR_MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-navy-500 block mb-1">Departemen / Kelompok</label>
                            <input type="text" value={newBdayKat} onChange={e => setNewBdayKat(e.target.value)} placeholder="Misal: Pemuda Advent" className="w-full p-2.5 rounded-xl border border-navy-200 text-xs font-bold bg-white" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-navy-500 block mb-1">No. WA (Opsional)</label>
                            <input type="text" value={newBdayWa} onChange={e => setNewBdayWa(e.target.value)} placeholder="628..." className="w-full p-2.5 rounded-xl border border-navy-200 text-xs font-bold bg-white" />
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-400 font-black text-xs cursor-pointer">
                                {editingBdayId ? '💾 Simpan Edit' : '+ Tambah Ultah'}
                            </button>
                            {editingBdayId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingBdayId(null);
                                        setNewBdayName('');
                                        setNewBdayWa('');
                                    }}
                                    className="py-2.5 px-3 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-700 font-bold text-xs cursor-pointer"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-navy-500">
                            Total {birthdays.length} data ulang tahun jemaat
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                disabled={isSyncingHadirDB}
                                onClick={handleSyncBirthdaysFromHadirDB}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                                title="Sinkronkan data jemaat & tanggal lahir dari sistem kehadiran (hadir.html / Database Presensi)"
                            >
                                <Icon name="RefreshCw" className={`w-3.5 h-3.5 ${isSyncingHadirDB ? 'animate-spin' : ''}`} />
                                <span>{isSyncingHadirDB ? 'Menyinkronkan...' : 'Sinkron dari DB Presensi'}</span>
                            </button>
                            {birthdays.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearAllBirthdays}
                                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                >
                                    <Icon name="Trash" className="w-3.5 h-3.5" />
                                    <span>Hapus Semua</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {birthdays.length === 0 ? (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-navy-200 text-navy-400 text-sm font-bold">
                            Daftar ulang tahun jemaat kosong. Silakan tambahkan data ulang tahun baru melalui formulir di atas.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {birthdays.map((b, idx) => (
                                <div key={b.id || idx} className="p-3.5 rounded-xl bg-white border border-navy-100 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="text-xs font-black text-gold-600">🎂 {b.birthDay} {BIBLE_YEAR_MONTH_NAMES[(b.birthMonth || 1) - 1]}</div>
                                        <div className="text-sm font-black text-navy-900 truncate">{b.nama}</div>
                                        <div className="text-xs text-navy-500 truncate">{b.kategori}{b.wa ? ` • ${b.wa}` : ''}</div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleStartEditBirthday(b)}
                                            className="p-2 rounded-lg bg-navy-50 text-navy-600 hover:bg-navy-900 hover:text-gold-400 transition cursor-pointer"
                                            title="Edit Data Ulang Tahun"
                                        >
                                            <Icon name="Edit" className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteBirthday(b.id, idx)}
                                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition cursor-pointer"
                                            title="Hapus Data Ulang Tahun"
                                        >
                                            <Icon name="Trash" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {section === 'calendar' && (
                <div className="space-y-5">
                    <form onSubmit={handleAddCalendarItem} className="p-4 sm:p-5 rounded-2xl bg-navy-50/50 border border-navy-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
                        <div>
                            <label className="text-[10px] font-black uppercase text-navy-500 block mb-1">Nama Kegiatan Gereja</label>
                            <input type="text" required value={newCalTitle} onChange={e => setNewCalTitle(e.target.value)} placeholder="Contoh: KKR Jemaat / Sabat Tamu" className="w-full p-2.5 rounded-xl border border-navy-200 text-xs font-bold bg-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-black uppercase text-navy-500 block mb-1">Tanggal</label>
                                <input type="date" required value={newCalDate} onChange={e => setNewCalDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-navy-200 text-xs font-bold bg-white" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-navy-500 block mb-1">Triwulan</label>
                                <select value={newCalQuarter} onChange={e => setNewCalQuarter(e.target.value)} className="w-full p-2.5 rounded-xl border border-navy-200 text-xs font-bold bg-white">
                                    <option value={1}>Triwulan I</option>
                                    <option value={2}>Triwulan II</option>
                                    <option value={3}>Triwulan III</option>
                                    <option value={4}>Triwulan IV</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-navy-500 block mb-1">Kategori Departemen</label>
                            <input type="text" value={newCalCat} onChange={e => setNewCalCat(e.target.value)} placeholder="Misal: Ibadah Sakramen / PA" className="w-full p-2.5 rounded-xl border border-navy-200 text-xs font-bold bg-white" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[10px] font-black uppercase text-navy-500 block mb-1">Keterangan Singkat</label>
                            <input type="text" value={newCalDesc} onChange={e => setNewCalDesc(e.target.value)} placeholder="Deskripsi acara..." className="w-full p-2.5 rounded-xl border border-navy-200 text-xs font-bold bg-white" />
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-400 font-black text-xs cursor-pointer">
                                {editingCalId ? '💾 Simpan Edit Agenda' : '+ Tambah Agenda Kalender'}
                            </button>
                            {editingCalId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingCalId(null);
                                        setNewCalTitle('');
                                        setNewCalDate('');
                                        setNewCalDesc('');
                                    }}
                                    className="py-2.5 px-3 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-700 font-bold text-xs cursor-pointer"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-navy-500">
                            Total {calendarItems.length} agenda kegiatan tahunan
                        </span>
                        <div className="flex items-center gap-2">
                            {calendarItems.length === 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCalendarItems(INITIAL_ANNUAL_CALENDAR);
                                        saveAnnualCalendar(INITIAL_ANNUAL_CALENDAR);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-700 text-xs font-bold cursor-pointer"
                                >
                                    🔄 Muat Contoh Default
                                </button>
                            )}
                            {calendarItems.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearAllCalendarItems}
                                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                >
                                    <Icon name="Trash" className="w-3.5 h-3.5" />
                                    <span>Hapus Semua</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {calendarItems.length === 0 ? (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-navy-200 text-navy-400 text-sm font-bold">
                            Daftar agenda kalender tahunan kosong. Silakan tambahkan kegiatan baru melalui formulir di atas.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {calendarItems.map((c, idx) => (
                                <div key={c.id || idx} className="p-3.5 rounded-xl bg-white border border-navy-100 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="text-xs font-black text-gold-600">TW {c.quarter} • {formatIndoDateShort(c.dateYMD)} • {c.category}</div>
                                        <div className="text-sm font-black text-navy-900 truncate">{c.title}</div>
                                        {c.desc && <div className="text-xs text-navy-500 truncate">{c.desc}</div>}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleStartEditCalendarItem(c)}
                                            className="p-2 rounded-lg bg-navy-50 text-navy-600 hover:bg-navy-900 hover:text-gold-400 transition cursor-pointer"
                                            title="Edit Agenda Kalender"
                                        >
                                            <Icon name="Edit" className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCalendarItem(c.id, idx)}
                                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition cursor-pointer"
                                            title="Hapus Agenda Kalender"
                                        >
                                            <Icon name="Trash" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- MODAL SELECTOR LAGU SION UNTUK ADMIN ---
export const AdminSongPickerModal = ({ isOpen, onClose, onSelect, laguSionDb = [], title = "Pilih Lagu Sion" }) => {
    const [query, setQuery] = React.useState('');
    const [formatMode, setFormatMode] = React.useState('full'); // 'full' -> "LS 15 - Judul", 'simple' -> "LS 15"
    const [localDb, setLocalDb] = React.useState(laguSionDb || []);

    React.useEffect(() => {
        if (laguSionDb && laguSionDb.length > 0) {
            setLocalDb(laguSionDb);
        } else if (isOpen) {
            fetch('./lagu_sion.json')
                .then(r => r.json())
                .then(d => setLocalDb(d))
                .catch(e => console.error(e));
        }
    }, [laguSionDb, isOpen]);

    React.useEffect(() => {
        if (isOpen) {
            setQuery('');
        }
    }, [isOpen]);

    const filtered = React.useMemo(() => {
        if (!localDb || localDb.length === 0) return [];
        const q = query.trim().toLowerCase();
        if (!q) return localDb;
        const numQ = parseInt(q, 10);
        return localDb.filter(s => {
            if (!isNaN(numQ) && s.number === numQ) return true;
            if (String(s.number).includes(q)) return true;
            if (s.title && s.title.toLowerCase().includes(q)) return true;
            if (s.verses && s.verses.some(v => v.lines && v.lines.some(l => l.toLowerCase().includes(q)))) return true;
            return false;
        }).sort((a, b) => {
            if (!isNaN(numQ)) {
                if (a.number === numQ) return -1;
                if (b.number === numQ) return 1;
            }
            return a.number - b.number;
        });
    }, [localDb, query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-navy-900 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-navy-100 dark:border-navy-700 overflow-hidden animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-gold-500/10 to-transparent border-b border-navy-100 dark:border-navy-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gold-500 text-navy-950 font-black flex items-center justify-center shadow-sm">
                            🎵
                        </div>
                        <div>
                            <h3 className="font-black text-base text-navy-900 dark:text-white">{title}</h3>
                            <p className="text-[11px] text-navy-500 dark:text-gray-400">Tersedia {localDb.length || 525} Lagu Sion</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-600 dark:text-gray-300 flex items-center justify-center font-bold transition cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Search Bar & Options */}
                <div className="p-4 border-b border-navy-100 dark:border-navy-800 space-y-3 bg-navy-50/50 dark:bg-navy-950/40">
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400">
                            <Icon name="Search" className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Ketik nomor lagu (1-525) atau judul lagu..."
                            autoFocus
                            className="w-full bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl py-2.5 pl-10 pr-9 text-sm font-bold text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-navy-400 hover:text-navy-600 dark:hover:text-white"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                        <span className="text-[11px] font-bold text-navy-500 dark:text-gray-400">
                            Format Masukan:
                        </span>
                        <div className="flex items-center bg-white dark:bg-navy-800 rounded-lg p-0.5 border border-navy-200 dark:border-navy-700">
                            <button
                                type="button"
                                onClick={() => setFormatMode('full')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${formatMode === 'full' ? 'bg-gold-500 text-navy-950 shadow-xs' : 'text-navy-500 dark:text-gray-400 hover:text-navy-900'}`}
                            >
                                LS No - Judul (Rekomendasi)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormatMode('simple')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${formatMode === 'simple' ? 'bg-gold-500 text-navy-950 shadow-xs' : 'text-navy-500 dark:text-gray-400 hover:text-navy-900'}`}
                            >
                                LS No Saja
                            </button>
                        </div>
                    </div>
                </div>

                {/* Song List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-navy-50 dark:divide-navy-800/60 max-h-[55vh]">
                    {filtered.length === 0 ? (
                        <div className="p-8 text-center text-navy-400 dark:text-gray-500 text-xs">
                            Tidak ada lagu yang cocok dengan pencarian "{query}".
                        </div>
                    ) : (
                        filtered.slice(0, 100).map(song => {
                            const formattedVal = formatMode === 'simple'
                                ? `LS ${song.number}`
                                : `LS ${song.number} - ${song.title}`;
                            return (
                                <div
                                    key={song.number}
                                    onClick={() => {
                                        onSelect(formattedVal);
                                        onClose();
                                    }}
                                    className="pt-1.5 first:pt-0 flex items-center justify-between p-2.5 rounded-xl hover:bg-gold-50 dark:hover:bg-navy-800 cursor-pointer transition group"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                                        <div className="w-9 h-9 rounded-xl bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-400/30 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-gold-500 group-hover:text-navy-950 transition-colors">
                                            {song.number}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-xs sm:text-sm text-navy-900 dark:text-white truncate group-hover:text-gold-600 dark:group-hover:text-gold-400">
                                                {song.title}
                                            </div>
                                            <div className="text-[10px] text-navy-500 dark:text-gray-400 truncate">
                                                {song.keyTime} {song.artist ? `• ${song.artist}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(formattedVal);
                                            onClose();
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 text-xs font-bold shrink-0 opacity-80 group-hover:opacity-100 transition shadow-2xs hover:scale-105"
                                    >
                                        Pilih
                                    </button>
                                </div>
                            );
                        })
                    )}
                    {filtered.length > 100 && (
                        <div className="p-3 text-center text-xs text-navy-400">
                            Menampilkan 100 lagu pertama. Ketik nomor atau kata kunci lebih spesifik untuk menyaring.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MODAL SELECTOR AYAT ALKITAB UNTUK ADMIN ---
export const AdminBibleVersePickerModal = ({ isOpen, onClose, onSelect, title = "Pilih Ayat Alkitab", isAyatBersahutan = false, alkitabBooks = ALKITAB_BOOKS }) => {
    const [pickerTab, setPickerTab] = React.useState(isAyatBersahutan ? 'bersahutan' : 'alkitab');
    const [bookFilter, setBookFilter] = React.useState('ALL'); // 'ALL' | 'PL' | 'PB'
    const [bookSearch, setBookSearch] = React.useState('');
    const [selectedBook, setSelectedBook] = React.useState(null);
    const [selectedChapter, setSelectedChapter] = React.useState(1);
    const [verseStart, setVerseStart] = React.useState('');
    const [verseEnd, setVerseEnd] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            setPickerTab(isAyatBersahutan ? 'bersahutan' : 'alkitab');
            setSelectedBook(alkitabBooks?.find(b => b.nama === 'Yohanes') || alkitabBooks?.[0] || null);
            setSelectedChapter(1);
            setVerseStart('1');
            setVerseEnd('');
            setBookSearch('');
        }
    }, [isOpen, isAyatBersahutan, alkitabBooks]);

    const filteredBooks = React.useMemo(() => {
        let list = alkitabBooks || [];
        if (bookFilter === 'PL') list = list.filter(b => b.testamen === 'PL');
        if (bookFilter === 'PB') list = list.filter(b => b.testamen === 'PB');
        if (bookSearch.trim()) {
            const q = bookSearch.trim().toLowerCase();
            list = list.filter(b => b.nama.toLowerCase().includes(q) || b.singkat.toLowerCase().includes(q));
        }
        return list;
    }, [alkitabBooks, bookFilter, bookSearch]);

    // Live preview string
    const previewVerseString = React.useMemo(() => {
        if (!selectedBook) return '';
        const ch = selectedChapter || 1;
        const vStart = String(verseStart).trim();
        const vEnd = String(verseEnd).trim();

        if (vStart && vEnd && vEnd !== vStart) {
            return `${selectedBook.nama} ${ch}:${vStart}-${vEnd}`;
        } else if (vStart) {
            return `${selectedBook.nama} ${ch}:${vStart}`;
        }
        return `${selectedBook.nama} ${ch}`;
    }, [selectedBook, selectedChapter, verseStart, verseEnd]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-navy-900 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-navy-100 dark:border-navy-700 overflow-hidden animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-emerald-500/10 via-gold-500/10 to-transparent border-b border-navy-100 dark:border-navy-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center shadow-sm">
                            📖
                        </div>
                        <div>
                            <h3 className="font-black text-base text-navy-900 dark:text-white">{title}</h3>
                            <p className="text-[11px] text-navy-500 dark:text-gray-400">Pilih Kitab, Pasal, dan Nomor Ayat</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-600 dark:text-gray-300 flex items-center justify-center font-bold transition cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs (Alkitab vs No. Bersahutan) */}
                {isAyatBersahutan && (
                    <div className="flex border-b border-navy-100 dark:border-navy-800 p-2 bg-navy-50/50 dark:bg-navy-950/50 gap-2">
                        <button
                            type="button"
                            onClick={() => setPickerTab('bersahutan')}
                            className={`flex-1 py-2 rounded-xl text-xs font-black transition ${pickerTab === 'bersahutan' ? 'bg-gold-500 text-navy-950 shadow-sm' : 'text-navy-600 dark:text-gray-300 hover:bg-navy-100 dark:hover:bg-navy-800'}`}
                        >
                            📜 No. Bacaan Bersahutan (Buku Lagu)
                        </button>
                        <button
                            type="button"
                            onClick={() => setPickerTab('alkitab')}
                            className={`flex-1 py-2 rounded-xl text-xs font-black transition ${pickerTab === 'alkitab' ? 'bg-gold-500 text-navy-950 shadow-sm' : 'text-navy-600 dark:text-gray-300 hover:bg-navy-100 dark:hover:bg-navy-800'}`}
                        >
                            📖 Dari Kitab Alkitab
                        </button>
                    </div>
                )}

                {/* Tab: Bacaan Bersahutan No. 1 - 72 */}
                {pickerTab === 'bersahutan' ? (
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                            Pilih nomor bacaan bersahutan dari bagian belakang buku Lagu Sion (No. 1 s/d No. 72):
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {Array.from({ length: 72 }, (_, i) => i + 1).map(num => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => {
                                        onSelect(`No. ${num}`);
                                        onClose();
                                    }}
                                    className="p-2.5 rounded-xl bg-navy-50 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-900 dark:text-white font-black text-xs transition cursor-pointer border border-navy-100 dark:border-navy-700 shadow-2xs active:scale-95"
                                >
                                    No. {num}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Tab: Alkitab */
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                        {/* Selector Kitab */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <label className="text-xs font-black text-navy-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-600 flex items-center justify-center text-[10px]">1</span>
                                    <span>Pilih Kitab:</span>
                                    {selectedBook && <span className="text-gold-600 dark:text-gold-400 font-bold">{selectedBook.nama} ({selectedBook.pasal} ps)</span>}
                                </label>
                                <div className="flex items-center gap-1 text-[11px] font-bold">
                                    {['ALL', 'PL', 'PB'].map(f => (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => setBookFilter(f)}
                                            className={`px-2 py-0.5 rounded-md transition ${bookFilter === f ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950' : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-gray-300'}`}
                                        >
                                            {f === 'ALL' ? 'Semua (66)' : f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <input
                                type="text"
                                value={bookSearch}
                                onChange={e => setBookSearch(e.target.value)}
                                placeholder="Cari nama kitab (misal: Yohanes, Kejadian, Mazmur)..."
                                className="w-full p-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-bold text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
                            />

                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 border border-navy-100 dark:border-navy-800 rounded-xl">
                                {filteredBooks.map(b => {
                                    const isSel = selectedBook?.id === b.id;
                                    return (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedBook(b);
                                                setSelectedChapter(1);
                                            }}
                                            className={`p-1.5 rounded-lg text-left text-xs font-bold truncate transition cursor-pointer ${isSel ? 'bg-gold-500 text-navy-950 font-black shadow-2xs' : 'hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-800 dark:text-gray-200'}`}
                                        >
                                            {b.nama}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selector Pasal */}
                        {selectedBook && (
                            <div className="space-y-2">
                                <label className="text-xs font-black text-navy-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-600 flex items-center justify-center text-[10px]">2</span>
                                    <span>Pilih Pasal ({selectedBook.nama}):</span>
                                </label>
                                <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 max-h-28 overflow-y-auto p-1 border border-navy-100 dark:border-navy-800 rounded-xl">
                                    {Array.from({ length: selectedBook.pasal }, (_, i) => i + 1).map(ch => {
                                        const isSel = selectedChapter === ch;
                                        return (
                                            <button
                                                key={ch}
                                                type="button"
                                                onClick={() => setSelectedChapter(ch)}
                                                className={`py-1.5 rounded-lg text-center text-xs font-black transition cursor-pointer ${isSel ? 'bg-gold-500 text-navy-950 shadow-2xs' : 'bg-navy-50 dark:bg-navy-800 hover:bg-gold-100 text-navy-800 dark:text-gray-200'}`}
                                            >
                                                {ch}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Input Nomor Ayat (Mulai & Sampai) */}
                        {selectedBook && (
                            <div className="space-y-2">
                                <label className="text-xs font-black text-navy-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-600 flex items-center justify-center text-[10px]">3</span>
                                    <span>Nomor Ayat (Bisa Tunggal atau Rentang):</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-[10px] font-bold text-navy-500 block mb-1">Ayat Mulai:</span>
                                        <input
                                            type="text"
                                            value={verseStart}
                                            onChange={e => setVerseStart(e.target.value)}
                                            placeholder="Contoh: 16"
                                            className="w-full p-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-bold text-navy-900 dark:text-white outline-none focus:ring-2 focus:ring-gold-400"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-navy-500 block mb-1">Sampai Ayat (Opsional):</span>
                                        <input
                                            type="text"
                                            value={verseEnd}
                                            onChange={e => setVerseEnd(e.target.value)}
                                            placeholder="Contoh: 17 (kosongkan jika 1 ayat)"
                                            className="w-full p-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-bold text-navy-900 dark:text-white outline-none focus:ring-2 focus:ring-gold-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Live Preview Box & Submit */}
                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-gold-50 dark:from-navy-800 dark:to-navy-800/80 rounded-2xl border border-emerald-200 dark:border-navy-700 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                            <div className="text-center sm:text-left min-w-0">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                                    Hasil Pilihan Ayat:
                                </span>
                                <span className="text-base sm:text-lg font-black text-navy-900 dark:text-white truncate block">
                                    📖 {previewVerseString}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    onSelect(previewVerseString);
                                    onClose();
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer active:scale-95 shrink-0"
                            >
                                ✓ Gunakan Ayat Ini
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// =========================================================================
// HELPER PARSER & FORMATTER LIRIK LAGU SION
// =========================================================================
const parseLyricsToVerses = (rawText) => {
    if (!rawText || !rawText.trim()) return [];
    const blocks = rawText.split(/\n\s*\n+/);
    let baitCount = 0;
    const verses = [];

    blocks.forEach(block => {
        const rawLines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (rawLines.length === 0) return;

        let label = '';
        let type = 'bait';
        let lines = [...rawLines];

        const firstLine = rawLines[0];
        const chorusMatch = firstLine.match(/^(?:\[?\s*(?:koor|reff|refrain|chorus)\s*\]?:?)\s*(.*)$/i);
        const baitMatch = firstLine.match(/^(?:\[?\s*(?:bait|verse)?\s*(\d+)[\.\:\s\]]*)\s*(.*)$/i);

        if (chorusMatch && (firstLine.toLowerCase().includes('koor') || firstLine.toLowerCase().includes('reff') || firstLine.toLowerCase().includes('refrain') || firstLine.toLowerCase().includes('chorus'))) {
            type = 'chorus';
            label = 'Reff';
            const remainder = (chorusMatch[1] || '').trim();
            if (remainder) {
                lines = [remainder, ...rawLines.slice(1)];
            } else {
                lines = rawLines.slice(1);
            }
        } else if (baitMatch && (firstLine.toLowerCase().includes('bait') || firstLine.toLowerCase().includes('verse') || /^\d+[\.\:\)]/.test(firstLine))) {
            baitCount = parseInt(baitMatch[1], 10) || (baitCount + 1);
            type = 'bait';
            label = `Bait ${baitCount}`;
            const remainder = (baitMatch[2] || '').trim();
            if (remainder) {
                lines = [remainder, ...rawLines.slice(1)];
            } else {
                lines = rawLines.slice(1);
            }
        } else {
            baitCount += 1;
            label = `Bait ${baitCount}`;
            type = 'bait';
        }

        if (lines.length > 0) {
            verses.push({ label, type, lines });
        }
    });

    return verses;
};

const versesToRawText = (verses) => {
    if (!Array.isArray(verses) || verses.length === 0) return '';
    return verses.map(v => {
        const lbl = (v.type === 'chorus' && (!v.label || v.label.toLowerCase() === 'koor')) ? 'Reff' : (v.label || (v.type === 'chorus' ? 'Reff' : 'Bait'));
        const linesStr = Array.isArray(v.lines) ? v.lines.join('\n') : String(v.lines || '');
        return `[${lbl}]\n${linesStr}`;
    }).join('\n\n');
};

// =========================================================================
// PANEL KELOLA LAGU SION UNTUK ADMIN
// =========================================================================
export const AdminLaguPanel = ({
    customSongs = [],
    setCustomSongs,
    laguSionDb = [],
    setLaguSionDb,
    adminToken,
    setLaguSionInitialSong,
    setLaguSionSubTab,
    setActiveTab
}) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterMode, setFilterMode] = React.useState('custom'); // 'custom' | 'all'
    const [modalOpen, setModalOpen] = React.useState(false);
    const [editingSong, setEditingSong] = React.useState(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [deleteConfirmSong, setDeleteConfirmSong] = React.useState(null);
    const [statusMsg, setStatusMsg] = React.useState(null);

    const [form, setForm] = React.useState({
        id: '',
        number: '',
        title: '',
        artist: '',
        keyTime: '',
        rawLyrics: ''
    });

    const getNextSongNumber = () => {
        if (!laguSionDb || laguSionDb.length === 0) return 526;
        const maxNum = Math.max(525, ...laguSionDb.map(s => Number(s.number) || 0));
        return maxNum + 1;
    };

    const handleOpenAddModal = () => {
        setEditingSong(null);
        setForm({
            id: '',
            number: String(getNextSongNumber()),
            title: '',
            artist: '',
            keyTime: '',
            rawLyrics: ''
        });
        setStatusMsg(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (song) => {
        setEditingSong(song);
        const lyricsText = song.rawLyrics || versesToRawText(song.verses);
        setForm({
            id: song.id || ('LS_' + song.number),
            number: String(song.number || ''),
            title: song.title || '',
            artist: song.artist || '',
            keyTime: song.keyTime || '',
            rawLyrics: lyricsText
        });
        setStatusMsg(null);
        setModalOpen(true);
    };

    const handleInsertBait = () => {
        const parsed = parseLyricsToVerses(form.rawLyrics);
        const baitNums = parsed.filter(v => v.type === 'bait').map(v => {
            const m = (v.label || '').match(/\d+/);
            return m ? parseInt(m[0], 10) : 0;
        });
        const nextBait = (baitNums.length > 0 ? Math.max(...baitNums) : 0) + 1;
        const prefix = form.rawLyrics.trim() ? '\n\n' : '';
        setForm(prev => ({ ...prev, rawLyrics: prev.rawLyrics + prefix + `Bait ${nextBait}:\n` }));
    };

    const handleInsertReff = () => {
        const prefix = form.rawLyrics.trim() ? '\n\n' : '';
        setForm(prev => ({ ...prev, rawLyrics: prev.rawLyrics + prefix + 'Reff:\n' }));
    };

    const previewVerses = React.useMemo(() => {
        return parseLyricsToVerses(form.rawLyrics);
    }, [form.rawLyrics]);

    const handleSaveSong = async (e) => {
        if (e) e.preventDefault();
        const num = parseInt(form.number, 10);
        if (isNaN(num) || num <= 0) {
            alert('Nomor lagu harus berupa angka positif!');
            return;
        }
        if (!form.title.trim()) {
            alert('Judul lagu tidak boleh kosong!');
            return;
        }

        const parsedVerses = parseLyricsToVerses(form.rawLyrics);
        if (parsedVerses.length === 0 && !confirm('Lirik lagu masih kosong. Apakah Anda tetap ingin menyimpan lagu ini?')) {
            return;
        }

        setIsSaving(true);
        setStatusMsg(null);

        const songPayload = {
            id: form.id || editingSong?.id || ('LS_' + num),
            number: num,
            title: form.title.trim(),
            artist: form.artist.trim(),
            keyTime: form.keyTime.trim(),
            verses: parsedVerses,
            rawLyrics: form.rawLyrics.trim(),
            isCustom: true
        };

        let updatedList = [...customSongs];
        if (editingSong) {
            const idx = updatedList.findIndex(s => s.id === editingSong.id || Number(s.number) === Number(editingSong.number));
            if (idx >= 0) {
                updatedList[idx] = songPayload;
            } else {
                updatedList.push(songPayload);
            }
        } else {
            const existingIdx = updatedList.findIndex(s => Number(s.number) === num);
            if (existingIdx >= 0) {
                updatedList[existingIdx] = songPayload;
            } else {
                updatedList.push(songPayload);
            }
        }

        updatedList.sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0));
        setCustomSongs(updatedList);
        try {
            localStorage.setItem('pisgah_custom_songs', JSON.stringify(updatedList));
        } catch (err) { }

        if (GAS_API_URL) {
            try {
                const action = editingSong ? 'updateCustomSong' : 'addCustomSong';
                const res = await portalFetch(GAS_API_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action,
                        password: adminToken,
                        adminToken,
                        data: songPayload,
                        ...songPayload
                    })
                });
                const result = await res.json();
                if (result.success || result.status === 'success') {
                    if (result.id && !editingSong) {
                        songPayload.id = result.id;
                        const finalized = updatedList.map(s => Number(s.number) === num ? { ...s, id: result.id } : s);
                        setCustomSongs(finalized);
                        try { localStorage.setItem('pisgah_custom_songs', JSON.stringify(finalized)); } catch (e) { }
                    }
                }
            } catch (err) {
                console.warn("Lagu tersimpan di cache lokal (sinkronisasi online pending):", err);
            }
        }

        setIsSaving(false);
        setModalOpen(false);
        setStatusMsg({ type: 'success', text: `Lagu LS ${num} - "${form.title.trim()}" berhasil disimpan!` });
        setTimeout(() => setStatusMsg(null), 5000);
    };

    const handleDeleteSong = async (song) => {
        if (!song) return;
        setIsDeleting(true);
        const targetId = song.id || ('LS_' + song.number);
        const targetNum = Number(song.number);

        const updatedList = customSongs.filter(s => s.id !== targetId && Number(s.number) !== targetNum);
        setCustomSongs(updatedList);
        try {
            localStorage.setItem('pisgah_custom_songs', JSON.stringify(updatedList));
        } catch (e) { }

        if (GAS_API_URL) {
            try {
                await portalFetch(GAS_API_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'deleteCustomSong',
                        password: adminToken,
                        adminToken,
                        id: targetId,
                        data: targetId,
                        number: targetNum
                    })
                });
            } catch (err) {
                console.warn("Gagal hapus lagu di server:", err);
            }
        }

        setIsDeleting(false);
        setDeleteConfirmSong(null);
        setStatusMsg({ type: 'success', text: `Lagu LS ${targetNum} berhasil dihapus.` });
        setTimeout(() => setStatusMsg(null), 4000);
    };

    const handleViewInLaguSion = (song) => {
        try {
            localStorage.setItem('laguSionReturnTab', 'admin_dashboard');
            window.__laguSionReturnTab = 'admin_dashboard';
        } catch (e) { }
        if (setLaguSionInitialSong) setLaguSionInitialSong(song);
        if (setLaguSionSubTab) setLaguSionSubTab('lyrics');
        if (setActiveTab) setActiveTab('lagu_sion');
    };

    const displayedSongs = React.useMemo(() => {
        const source = filterMode === 'custom' ? customSongs : laguSionDb;
        const q = searchQuery.trim().toLowerCase();
        if (!q) return source;

        return source.filter(s => {
            const numStr = String(s.number || '');
            const titleStr = (s.title || '').toLowerCase();
            const artistStr = (s.artist || '').toLowerCase();
            const keyStr = (s.keyTime || '').toLowerCase();
            const lyricsStr = (s.rawLyrics || (s.verses || []).map(v => (v.lines || []).join(' ')).join(' ')).toLowerCase();
            return numStr.includes(q) || titleStr.includes(q) || artistStr.includes(q) || keyStr.includes(q) || lyricsStr.includes(q);
        });
    }, [customSongs, laguSionDb, filterMode, searchQuery]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Tombol Tambah */}
            <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-400 text-navy-950 flex items-center justify-center font-black shadow-md shrink-0">
                        <Icon name="Music" className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-navy-900">Kelola Lagu Sion</h2>
                        <p className="text-xs md:text-sm text-navy-500 font-medium mt-0.5">
                            Total: <strong className="text-navy-800">{laguSionDb.length} lagu</strong> ({525} Bawaan + <span className="text-gold-600 font-bold">{customSongs.length} Tambahan</span>)
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-navy-950 font-black px-5 py-3 rounded-xl text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                        <Icon name="Plus" className="w-4 h-4 stroke-[3]" />
                        <span>Tambah Lagu Baru</span>
                    </button>
                </div>
            </div>

            {/* Notifikasi Status */}
            {statusMsg && (
                <div className={`p-4 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-sm animate-fade-in ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    <Icon name={statusMsg.type === 'success' ? 'CheckCircle' : 'AlertCircle'} className="w-5 h-5 shrink-0" />
                    <span>{statusMsg.text}</span>
                </div>
            )}

            {/* Container Konten Utama */}
            <div className="glass-box rounded-[1.5rem] shadow-sm border border-navy-100/60 p-5 md:p-6 space-y-5">
                {/* Filter Tabs & Search Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-navy-100/70">
                    <div className="flex items-center bg-navy-50 p-1 rounded-xl shrink-0">
                        <button
                            type="button"
                            onClick={() => setFilterMode('custom')}
                            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${filterMode === 'custom' ? 'bg-navy-900 text-gold-400 shadow-sm' : 'text-navy-600 hover:text-navy-900'}`}
                        >
                            Lagu Tambahan ({customSongs.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterMode('all')}
                            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${filterMode === 'all' ? 'bg-navy-900 text-gold-400 shadow-sm' : 'text-navy-600 hover:text-navy-900'}`}
                        >
                            Semua Lagu ({laguSionDb.length})
                        </button>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
                            <Icon name="Search" className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nomor, judul, pengarang, nada, atau lirik..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl text-xs md:text-sm font-semibold text-navy-900 placeholder-navy-400 outline-none focus:border-gold-500 transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-navy-200 text-navy-600 hover:bg-navy-300 flex items-center justify-center text-xs"
                            >
                                <Icon name="X" className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Empty State jika belum ada lagu kustom dan filter 'custom' */}
                {customSongs.length === 0 && filterMode === 'custom' ? (
                    <div className="p-8 md:p-12 text-center rounded-2xl border-2 border-dashed border-navy-100 bg-navy-50/30 flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-gold-100 text-gold-700 flex items-center justify-center mb-3">
                            <Icon name="Music" className="w-7 h-7" />
                        </div>
                        <h3 className="text-base md:text-lg font-black text-navy-900 mb-1">Belum Ada Lagu Tambahan</h3>
                        <p className="text-xs md:text-sm text-navy-500 max-w-md leading-relaxed mb-5">
                            Lagu Sion standar memuat nomor 1 s/d 525. Anda dapat menambahkan lagu tambahan baru (seperti LS 526, lagu rohani, atau suplemen) yang akan otomatis dapat dicari dan dipilih di Susunan Acara dan Lagu Sion.
                        </p>
                        <button
                            type="button"
                            onClick={handleOpenAddModal}
                            className="inline-flex items-center gap-2 bg-navy-900 text-gold-400 hover:bg-navy-800 font-bold px-6 py-2.5 rounded-xl text-xs md:text-sm shadow transition active:scale-95"
                        >
                            <Icon name="Plus" className="w-4 h-4" />
                            <span>Tambah Lagu Pertama (LS {getNextSongNumber()})</span>
                        </button>
                    </div>
                ) : displayedSongs.length === 0 ? (
                    <div className="p-8 text-center text-navy-400 font-medium text-sm">
                        Tidak ada lagu yang cocok dengan pencarian "{searchQuery}".
                    </div>
                ) : (
                    <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
                        {displayedSongs.map((song) => {
                            const isCustom = Boolean(song.isCustom || customSongs.some(cs => Number(cs.number) === Number(song.number)));
                            const vCount = (song.verses || []).length;
                            const baitCount = (song.verses || []).filter(v => v.type === 'bait' || v.type === 'verse').length;
                            const chorusCount = (song.verses || []).filter(v => v.type === 'chorus').length;

                            return (
                                <div
                                    key={song.id || song.number}
                                    className={`p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isCustom ? 'bg-gradient-to-r from-amber-50/40 via-white to-white border-amber-200/80 shadow-xs hover:border-amber-400' : 'bg-white border-navy-100 hover:border-navy-200'}`}
                                >
                                    {/* Info Kiri */}
                                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shrink-0 ${isCustom ? 'bg-gradient-to-tr from-amber-500 to-gold-400 text-navy-950 shadow-sm' : 'bg-navy-100 text-navy-800'}`}>
                                            <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-75">LS</span>
                                            <span className="text-sm font-black leading-none">{song.number}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold text-sm md:text-base text-navy-950 truncate">
                                                    {song.title}
                                                </h4>
                                                {isCustom && (
                                                    <span className="text-[10px] font-black uppercase tracking-wider bg-gold-100 text-gold-800 px-2 py-0.5 rounded-full border border-gold-300/40">
                                                        Tambahan
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-navy-500 mt-0.5 flex-wrap">
                                                {song.artist && <span>Oleh: <strong className="text-navy-700">{song.artist}</strong></span>}
                                                {song.keyTime && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="px-1.5 py-0.5 bg-navy-50 rounded text-navy-700 font-semibold">{song.keyTime}</span>
                                                    </>
                                                )}
                                                {vCount > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{baitCount > 0 ? `${baitCount} Bait` : ''}{chorusCount > 0 ? ` + ${chorusCount} Reff` : ''}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons Kanan */}
                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        <button
                                            type="button"
                                            onClick={() => handleViewInLaguSion(song)}
                                            className="px-3 py-1.5 rounded-lg bg-navy-50 hover:bg-gold-100 text-navy-800 hover:text-gold-900 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                                            title="Lihat Tampilan Lagu di Lagu Sion"
                                        >
                                            <Icon name="Music" className="w-3.5 h-3.5 text-gold-600" />
                                            <span>Lihat</span>
                                        </button>

                                        {isCustom && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEditModal(song)}
                                                    className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                                                    title="Edit Lagu"
                                                >
                                                    <Icon name="PenTool" className="w-3.5 h-3.5" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteConfirmSong(song)}
                                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                                                    title="Hapus Lagu Ini"
                                                >
                                                    <Icon name="Trash2" className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Tambah / Edit Lagu */}
            {modalOpen && createPortal(
                <div className="fixed inset-0 z-[99999] bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fade-in">
                    <div className="bg-white dark:bg-navy-900 rounded-[1.75rem] shadow-2xl border border-navy-100 max-w-2xl w-full p-5 md:p-7 space-y-5 my-auto max-h-[92vh] flex flex-col overflow-hidden">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-3 border-b border-navy-100 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold">
                                    <Icon name="Music" className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-navy-900 dark:text-white">
                                        {editingSong ? `Edit Lagu: LS ${form.number}` : 'Tambah Lagu Baru'}
                                    </h3>
                                    <p className="text-xs text-navy-400">
                                        Lagu Sion & Lagu Rohani Tambahan
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-navy-50 hover:bg-navy-100 text-navy-500 flex items-center justify-center transition cursor-pointer"
                            >
                                <Icon name="X" className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form Fields */}
                        <form onSubmit={handleSaveSong} className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Nomor Lagu */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-navy-700 dark:text-navy-300 mb-1">
                                        Nomor Lagu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={form.number}
                                        onChange={(e) => setForm({ ...form, number: e.target.value })}
                                        placeholder="Misal: 526"
                                        className="w-full px-3.5 py-2.5 bg-navy-50/50 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 transition"
                                    />
                                    <p className="text-[11px] text-navy-400 mt-1">
                                        💡 Lagu bawaan 1-525. Lagu baru disarankan dimulai dari 526 dst.
                                    </p>
                                </div>

                                {/* Nada Dasar & Ketukan */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-navy-700 dark:text-navy-300 mb-1">
                                        Nada Dasar & Ketukan (Key Time)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.keyTime}
                                        onChange={(e) => setForm({ ...form, keyTime: e.target.value })}
                                        placeholder="Contoh: D 4/4 atau G 3/4"
                                        className="w-full px-3.5 py-2.5 bg-navy-50/50 border border-navy-200 rounded-xl text-sm font-medium text-navy-900 outline-none focus:border-gold-500 transition"
                                    />
                                    <p className="text-[11px] text-navy-400 mt-1">
                                        Digunakan untuk nada pembuka & ketukan birama.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Judul Lagu */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-navy-700 dark:text-navy-300 mb-1">
                                        Judul Lagu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="Contoh: Kasih Allah Yang Agung"
                                        className="w-full px-3.5 py-2.5 bg-navy-50/50 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 transition"
                                    />
                                </div>

                                {/* Pengarang / Artis */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-navy-700 dark:text-navy-300 mb-1">
                                        Pengarang / Pencipta / Artis
                                    </label>
                                    <input
                                        type="text"
                                        value={form.artist}
                                        onChange={(e) => setForm({ ...form, artist: e.target.value })}
                                        placeholder="Contoh: Fanny Crosby (Opsional)"
                                        className="w-full px-3.5 py-2.5 bg-navy-50/50 border border-navy-200 rounded-xl text-sm font-medium text-navy-900 outline-none focus:border-gold-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Lirik Teks */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-black uppercase tracking-wider text-navy-700 dark:text-navy-300">
                                        Lirik Lagu
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={handleInsertBait}
                                            className="px-2 py-1 bg-navy-100 hover:bg-navy-200 text-navy-800 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                        >
                                            <Icon name="Plus" className="w-3 h-3" /> Bait Baru
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleInsertReff}
                                            className="px-2 py-1 bg-gold-100 hover:bg-gold-200 text-gold-900 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                        >
                                            <Icon name="Plus" className="w-3 h-3" /> Reff / Chorus
                                        </button>
                                    </div>
                                </div>

                                <textarea
                                    rows="8"
                                    value={form.rawLyrics}
                                    onChange={(e) => setForm({ ...form, rawLyrics: e.target.value })}
                                    placeholder={`Bait 1:\nDi hadapan hadirat-Mu kami bersujud\nMenyembah Engkau Tuhan kekal abadi\n\nReff:\nPuji Tuhan haleluya\nKasih-Nya kekal selamanya\n\nBait 2:\n...`}
                                    className="w-full p-3.5 bg-navy-50/50 border border-navy-200 rounded-xl text-xs md:text-sm font-mono text-navy-900 outline-none focus:border-gold-500 transition leading-relaxed resize-y"
                                />

                                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 space-y-1">
                                    <p className="font-bold flex items-center gap-1">
                                        <span>💡 Petunjuk Format Lirik:</span>
                                    </p>
                                    <ul className="list-disc list-inside space-y-0.5 text-amber-800 font-medium">
                                        <li>Pisahkan setiap bait dan reff dengan <strong>satu baris kosong</strong> (tekan Enter 2x).</li>
                                        <li>Beri awalan <strong>Reff:</strong> atau <strong>Chorus:</strong> untuk bagian refrain.</li>
                                        <li>Bait dapat diawali dengan <strong>Bait 1:</strong>, <strong>Bait 2:</strong> dst., atau otomatis diberi nomor.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Pratinjau Format Langsung (Live Preview) */}
                            {previewVerses.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-navy-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-wider text-gold-700">
                                            Pratinjau Tampilan ({previewVerses.length} Bagian)
                                        </span>
                                        <span className="text-[11px] text-navy-400">
                                            Akan tampil di Lagu Sion seperti ini:
                                        </span>
                                    </div>

                                    <div className="p-4 bg-navy-50/50 rounded-2xl border border-navy-100 space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
                                        {previewVerses.map((verse, idx) => {
                                            const isCh = verse.type === 'chorus';
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`p-3 rounded-xl ${isCh ? 'bg-amber-100/60 border-l-4 border-amber-500 text-navy-900' : 'bg-white border border-navy-100 text-navy-800'}`}
                                                >
                                                    <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${isCh ? 'text-amber-800' : 'text-navy-400'}`}>
                                                        {isCh && (!verse.label || verse.label.toLowerCase() === 'koor') ? 'Reff' : (verse.label || (isCh ? 'Reff' : `Bait ${idx + 1}`))}
                                                    </span>
                                                    <div className={`text-xs leading-relaxed font-medium ${isCh ? 'italic' : ''}`}>
                                                        {verse.lines.map((l, li) => (
                                                            <p key={li}>{l}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-navy-200 text-navy-700 font-bold text-xs md:text-sm hover:bg-navy-50 transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-navy-950 font-black text-xs md:text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin"></span>
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="CheckCircle" className="w-4 h-4" />
                                            <span>Simpan Lagu</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                , document.body)}

            {/* Modal Konfirmasi Hapus Lagu */}
            {deleteConfirmSong && createPortal(
                <div className="fixed inset-0 z-[99999] bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl border border-red-100 max-w-sm w-full p-5 space-y-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                            <Icon name="Trash2" className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-black text-navy-900">Hapus Lagu Ini?</h4>
                            <p className="text-xs text-navy-500 mt-1">
                                Anda yakin ingin menghapus <strong>LS {deleteConfirmSong.number} - {deleteConfirmSong.title}</strong>? Lagu ini tidak akan muncul lagi di daftar Lagu Sion.
                            </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmSong(null)}
                                className="flex-1 py-2 rounded-xl bg-navy-50 text-navy-700 font-bold text-xs hover:bg-navy-100 transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDeleteSong(deleteConfirmSong)}
                                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                            >
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
                , document.body)}
        </div>
    );
};

// --- KOMPONEN AdminDashboard yang DIPERBAIKI (dengan fitur warta) ---
export const AdminDashboard = ({ dataPejabat, setDataPejabat, jadwalDB, setJadwalDB, adminToken, setAdminToken,
    youtubeUrl, setYoutubeUrl, anthemUrl, setAnthemUrl, anthemUrl2, setAnthemUrl2, anthemTitle, setAnthemTitle, anthemTitle2, setAnthemTitle2, youtubeTitle, setYoutubeTitle, youtubeChannelTitle, setYoutubeChannelTitle, kategoriPejabat, setKategoriPejabat, heroImages, setHeroImages,
    pengumuman, setPengumuman, daftarWarta, setDaftarWarta, refreshWarta, kontakGereja, setKontakGereja, liveUrl, setLiveUrl, perjamuanDate, setPerjamuanDate, perpuluhanDate, setPerpuluhanDate, perjamuanNote, setPerjamuanNote, perpuluhanNote, setPerpuluhanNote, daftarRekening, setDaftarRekening, handleLogout, carouselEvents, setCarouselEvents, carouselVideos, setCarouselVideos, laguSionDb = [], setLaguSionDb, customSongs = [], setCustomSongs = () => {}, setLaguSionInitialSong = () => {}, setLaguSionSubTab = () => {}, setActiveTab = () => {} }) => {
    const [adminTab, setAdminTab] = React.useState('jadwal'); // jadwal, pelayan, warta, pengaturan, buku, pastoral, lagu
    React.useEffect(() => {
        scrollToTop();
    }, [adminTab]);
    const [viewMonth, setViewMonth] = React.useState(new Date().getMonth());
    const [viewYear, setViewYear] = React.useState(new Date().getFullYear());
    const [subTab, setSubTab] = React.useState('rabu');
    const [editingDate, setEditingDate] = React.useState(null);
    const [editForm, setEditForm] = React.useState([]);
    const [isSavingJadwal, setIsSavingJadwal] = React.useState(false);
    const [isSavingPejabat, setIsSavingPejabat] = React.useState(false);

    // Modal Selector Lagu Sion & Ayat Alkitab untuk Susunan Acara
    const [songPicker, setSongPicker] = React.useState(null); // { field: string, title?: string }
    const [versePicker, setVersePicker] = React.useState(null); // { field: string, isAyatBersahutan?: boolean, title?: string }

    const openSongPicker = (field, title) => {
        setSongPicker({ field, title: title || "Pilih Lagu Sion" });
    };

    const openVersePicker = (field, isAyatBersahutan = false, title) => {
        setVersePicker({ field, isAyatBersahutan, title: title || "Pilih Ayat Alkitab" });
    };

    // ============ STATE CAROUSEL EVENTS & VIDEOS ============
    const [editCarouselEvents, setEditCarouselEvents] = React.useState([]);
    const [isSavingCarouselEvents, setIsSavingCarouselEvents] = React.useState(false);
    const [editCarouselVideos, setEditCarouselVideos] = React.useState(carouselVideos || []);
    const [isSavingCarouselVideos, setIsSavingCarouselVideos] = React.useState(false);
    React.useEffect(() => {
        if (carouselEvents) setEditCarouselEvents(JSON.parse(JSON.stringify(carouselEvents)));
        if (carouselVideos) setEditCarouselVideos(JSON.parse(JSON.stringify(carouselVideos)));
    }, [carouselEvents, carouselVideos]);

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
        // Posisi paling atas selalu yang terbaru
        return sortBooksNewestFirst(result, daftarBuku);
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
            const res = await portalFetch(GAS_API_URL, {
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

    // State URL Anthem
    const [editAnthemUrl, setEditAnthemUrl] = React.useState(anthemUrl);
    const [editAnthemUrl2, setEditAnthemUrl2] = React.useState(anthemUrl2);
    const [editAnthemTitle, setEditAnthemTitle] = React.useState(anthemTitle || "Adventist Church Anthem");
    const [editAnthemTitle2, setEditAnthemTitle2] = React.useState(anthemTitle2 || "Video Tambahan");
    const [editYoutubeTitle, setEditYoutubeTitle] = React.useState(youtubeTitle || "Video Penting");
    const [editYoutubeChannelTitle, setEditYoutubeChannelTitle] = React.useState(youtubeChannelTitle || "Youtube Channel");
    const [isSavingAnthemUrl, setIsSavingAnthemUrl] = React.useState(false);

    // State untuk Live URL
    const [editLiveUrl, setEditLiveUrl] = React.useState(liveUrl);
    const [isSavingLiveUrl, setIsSavingLiveUrl] = React.useState(false);
    const [editPerjamuanDate, setEditPerjamuanDate] = React.useState(perjamuanDate);
    const [editPerpuluhanDate, setEditPerpuluhanDate] = React.useState(perpuluhanDate);
    const [editPerjamuanNote, setEditPerjamuanNote] = React.useState(perjamuanNote);
    const [editPerpuluhanNote, setEditPerpuluhanNote] = React.useState(perpuluhanNote);
    const [isSavingPerjamuanDate, setIsSavingPerjamuanDate] = React.useState(false);

    const [editDaftarRekening, setEditDaftarRekening] = React.useState(daftarRekening || []);
    const [isSavingRekening, setIsSavingRekening] = React.useState(false);

    // Sync form state when props are fetched/updated from parent App
    React.useEffect(() => {
        setEditYoutubeUrl(youtubeUrl);
        setEditYoutubeTitle(youtubeTitle || "Video Penting");
        setEditYoutubeChannelTitle(youtubeChannelTitle || "Youtube Channel");
        setEditAnthemUrl(anthemUrl);
        setEditAnthemUrl2(anthemUrl2);
        setEditAnthemTitle(anthemTitle || "Adventist Church Anthem");
        setEditAnthemTitle2(anthemTitle2 || "Video Tambahan");
        setEditLiveUrl(liveUrl);
        setEditPerjamuanDate(perjamuanDate);
        setEditPerpuluhanDate(perpuluhanDate);
        setEditPerjamuanNote(perjamuanNote);
        setEditPerpuluhanNote(perpuluhanNote);
        setEditHeroImages(prev => {
            if (!prev || prev.length === 0) {
                if (heroImages && Array.isArray(heroImages) && heroImages.length > 0) {
                    return heroImages;
                }
                try {
                    const saved = localStorage.getItem('pisgah_hero_slides');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                    }
                } catch (e) { }
            }
            return prev;
        });
    }, [youtubeUrl, youtubeTitle, youtubeChannelTitle, anthemUrl, anthemUrl2, anthemTitle, anthemTitle2, liveUrl, perjamuanDate, perpuluhanDate, perjamuanNote, perpuluhanNote, daftarRekening, heroImages]);

    // State Hero Image Array (Carousel)
    const [editHeroImages, setEditHeroImages] = React.useState(() => {
        if (heroImages && Array.isArray(heroImages) && heroImages.length > 0) return heroImages;
        try {
            const saved = localStorage.getItem('pisgah_hero_slides');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) { }
        return heroImages || [];
    });
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
    const [wartaKategori, setWartaKategori] = React.useState('Warta Sabat');
    const [editWartaKategori, setEditWartaKategori] = React.useState('Warta Sabat');
    const [editWartaViewMode, setEditWartaViewMode] = React.useState('editor'); // 'editor' | 'preview'
    const [wartaViewMode, setWartaViewMode] = React.useState('editor'); // 'editor' | 'preview'
    const [wartaSearchPosting, setWartaSearchPosting] = React.useState('');
    const [wartaGambarList, setWartaGambarList] = React.useState([]);
    const [wartaCoverUrlInput, setWartaCoverUrlInput] = React.useState('');
    const [isSavingWarta, setIsSavingWarta] = React.useState(false);
    const [wartaPenulis, setWartaPenulis] = React.useState('');
    const [editWartaPenulis, setEditWartaPenulis] = React.useState('');
    const [editWartaCoverUrlInput, setEditWartaCoverUrlInput] = React.useState('');
    const [wartaCurrentPage, setWartaCurrentPage] = React.useState(1);
    const wartaItemsPerPage = 6;
    const wartaEditorRef = React.useRef(null);      // <-- tambah
    const editWartaEditorRef = React.useRef(null);  // <-- tambah

    // Jadwal Publikasi Warta
    const [wartaPublishType, setWartaPublishType] = React.useState('now'); // 'now' | 'scheduled'
    const [wartaScheduledDate, setWartaScheduledDate] = React.useState('');
    const [editWartaPublishType, setEditWartaPublishType] = React.useState('now'); // 'now' | 'scheduled'
    const [editWartaScheduledDate, setEditWartaScheduledDate] = React.useState('');
    const [wartaStatusFilter, setWartaStatusFilter] = React.useState('all'); // 'all' | 'published' | 'scheduled'

    // ============ AUTOSAVE DRAFT RUANG REDAKSI & STUDIO ============
    const [draftNewAvailable, setDraftNewAvailable] = React.useState(null);
    const [autosaveNewStatus, setAutosaveNewStatus] = React.useState('');
    const [autosaveEditStatus, setAutosaveEditStatus] = React.useState('');

    // Periksa draft input baru tersimpan di localStorage saat awal dibuka
    React.useEffect(() => {
        try {
            const raw = localStorage.getItem('PISGAH_WARTA_DRAFT_NEW');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && (parsed.judul || parsed.isi)) {
                    setDraftNewAvailable(parsed);
                }
            }
        } catch (e) { }
    }, []);

    // Autosave debounced untuk warta baru
    React.useEffect(() => {
        if (!wartaJudul && !wartaIsi && !wartaPenulis) return;
        setAutosaveNewStatus('Menyimpan draft...');
        const timer = setTimeout(() => {
            try {
                const currentContent = wartaEditorRef.current ? wartaEditorRef.current.getContent() : wartaIsi;
                const draftObj = {
                    judul: wartaJudul,
                    isi: currentContent,
                    penulis: wartaPenulis,
                    kategori: wartaKategori,
                    publishType: wartaPublishType,
                    scheduledDate: wartaScheduledDate,
                    timestamp: Date.now()
                };
                localStorage.setItem('PISGAH_WARTA_DRAFT_NEW', JSON.stringify(draftObj));
                setAutosaveNewStatus('Draft tersimpan');
            } catch (e) { }
        }, 1200);
        return () => clearTimeout(timer);
    }, [wartaJudul, wartaIsi, wartaPenulis, wartaKategori, wartaPublishType, wartaScheduledDate]);

    const handleRestoreNewDraft = () => {
        if (!draftNewAvailable) return;
        setWartaJudul(draftNewAvailable.judul || '');
        setWartaIsi(draftNewAvailable.isi || '');
        setWartaPenulis(draftNewAvailable.penulis || '');
        if (draftNewAvailable.kategori) setWartaKategori(draftNewAvailable.kategori);
        if (draftNewAvailable.publishType) setWartaPublishType(draftNewAvailable.publishType);
        if (draftNewAvailable.scheduledDate) setWartaScheduledDate(draftNewAvailable.scheduledDate);
        if (wartaEditorRef.current) wartaEditorRef.current.setContent(draftNewAvailable.isi || '');
        setDraftNewAvailable(null);
    };

    const handleDiscardNewDraft = () => {
        localStorage.removeItem('PISGAH_WARTA_DRAFT_NEW');
        setDraftNewAvailable(null);
        setAutosaveNewStatus('');
    };

    // Autosave debounced untuk modal edit warta fullscreen
    React.useEffect(() => {
        if (!editWartaModal || !editingWarta) return;
        setAutosaveEditStatus('Menyimpan...');
        const timer = setTimeout(() => {
            try {
                const currentContent = editWartaEditorRef.current ? editWartaEditorRef.current.getContent() : editWartaIsi;
                const draftObj = {
                    judul: editWartaJudul,
                    isi: currentContent,
                    penulis: editWartaPenulis,
                    kategori: editWartaKategori,
                    timestamp: Date.now()
                };
                localStorage.setItem('PISGAH_WARTA_DRAFT_EDIT_' + editingWarta.rowIndex, JSON.stringify(draftObj));
                setAutosaveEditStatus('Draft tersimpan');
            } catch (e) { }
        }, 1200);
        return () => clearTimeout(timer);
    }, [editWartaModal, editingWarta, editWartaJudul, editWartaIsi, editWartaPenulis, editWartaKategori]);


    // Subtab untuk Warta
    const [wartaSubTab, setWartaSubTab] = React.useState('input'); // 'input' atau 'posting'
    React.useEffect(() => {
        scrollToTop();
    }, [wartaSubTab]);
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
    const [newFolderCategory, setNewFolderCategory] = useState('sabat');
    const [newFolderDate, setNewFolderDate] = useState(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    });
    const [newFolderTopic, setNewFolderTopic] = useState('');
    const [isManualFolderName, setIsManualFolderName] = useState(false);
    const [adminFolderSearch, setAdminFolderSearch] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [mediaList, setMediaList] = useState([]);   // Ganti imageList -> mediaList
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [showAllFolders, setShowAllFolders] = useState(false);

    // Otomatis susun nama folder standar berdasarkan Kategori, Tanggal & Topik
    React.useEffect(() => {
        if (!showNewFolderModal || isManualFolderName) return;

        let prefix = 'Sabat';
        if (newFolderCategory === 'sabat') prefix = 'Sabat';
        else if (newFolderCategory === 'youth') prefix = 'Youth';
        else if (newFolderCategory === 'event') prefix = 'Acara Khusus';
        else if (newFolderCategory === 'sosial') prefix = 'Bakti Sosial';
        else prefix = '';

        let dateStr = '';
        if (newFolderDate) {
            const parts = newFolderDate.split('-');
            if (parts.length === 3) {
                const day = parseInt(parts[2], 10);
                const monthIdx = parseInt(parts[1], 10) - 1;
                const year = parts[0];
                const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                dateStr = `${day} ${months[monthIdx] || ''} ${year}`;
            }
        }

        const cleanTopic = (newFolderTopic || '').trim();
        if (newFolderCategory === 'manual') {
            setNewFolderName(cleanTopic);
            return;
        }

        if (prefix && dateStr) {
            setNewFolderName(cleanTopic ? `${prefix} ${dateStr} - ${cleanTopic}` : `${prefix} ${dateStr}`);
        } else if (prefix) {
            setNewFolderName(cleanTopic ? `${prefix} - ${cleanTopic}` : prefix);
        } else {
            setNewFolderName(cleanTopic ? `${cleanTopic} ${dateStr}`.trim() : dateStr);
        }
    }, [newFolderCategory, newFolderDate, newFolderTopic, showNewFolderModal, isManualFolderName]);

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
                const heic2any = await loadHeic2any();
                if (heic2any) {
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
                                ctx.clearRect(0, 0, width, height);
                                ctx.drawImage(img, 0, 0, width, height);

                                // Deteksi transparansi berkas (PNG / WebP / GIF)
                                const isTrans = file.type === 'image/png' || file.type === 'image/webp' || file.name.toLowerCase().endsWith('.png');
                                let hasAlpha = false;
                                if (isTrans) {
                                    try {
                                        const pData = ctx.getImageData(0, 0, width, height).data;
                                        for (let j = 3; j < pData.length; j += 16) {
                                            if (pData[j] < 250) { hasAlpha = true; break; }
                                        }
                                    } catch (e) { hasAlpha = isTrans; }
                                }

                                imageData = hasAlpha ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.85);

                                uploadToGAS(imageData);
                            };
                            img.src = reader.result;
                        } else {
                            uploadToGAS(imageData);
                        }

                        async function uploadToGAS(base64Data) {
                            try {
                                const res = await portalFetch(GAS_API_URL, {
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
            const res = await portalFetch(GAS_API_URL, {
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
            const res = await portalFetch(GAS_API_URL, {
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
            const res = await portalFetch(GAS_API_URL, {
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
            const res = await portalFetch(GAS_API_URL, {
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
    const [pengaturanSubTab, setPengaturanSubTab] = React.useState('pengumuman'); // 'pengumuman', 'youtube_url', 'ganti_password', 'kontak', 'database'
    const [supaHealth, setSupaHealth] = React.useState(null);
    const [isSyncingSupa, setIsSyncingSupa] = React.useState(false);
    const [supaSyncProgress, setSupaSyncProgress] = React.useState('');

    React.useEffect(() => {
        if (adminTab === 'pengaturan' && pengaturanSubTab === 'database') {
            checkPortalSupabaseHealth().then(setSupaHealth);
        }
    }, [adminTab, pengaturanSubTab]);

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

    const handleRemoveWartaImage = (indexToRemove) => {
        setWartaGambarList(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSetMainWartaImage = (index) => {
        setWartaGambarList(prev => {
            const next = [...prev];
            const [target] = next.splice(index, 1);
            next.unshift(target);
            return next;
        });
    };

    const handleAddWartaImages = (newFiles) => {
        const newItems = newFiles.map((file, idx) => ({
            id: `new_${idx}_${Date.now()}_${Math.random()}`,
            url: URL.createObjectURL(file),
            file: file,
            sizeStr: file.size < 1024 * 1024 ? (file.size / 1024).toFixed(0) + ' KB' : (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        }));
        setWartaGambarList(prev => [...prev, ...newItems]);
    };

    const handleRemoveEditWartaImage = (indexToRemove) => {
        setEditWartaGambarList(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSetMainEditWartaImage = (index) => {
        setEditWartaGambarList(prev => {
            const next = [...prev];
            const [target] = next.splice(index, 1);
            next.unshift(target);
            return next;
        });
    };

    const handleAddEditWartaImages = async (newFiles) => {
        if (!newFiles || newFiles.length === 0) return;
        for (let idx = 0; idx < newFiles.length; idx++) {
            const file = newFiles[idx];
            const originalSizeStr = file.size < 1024 * 1024 ? (file.size / 1024).toFixed(0) + ' KB' : (file.size / (1024 * 1024)).toFixed(1) + ' MB';
            try {
                const webpBase64 = await compressImage(file, 1280, 0.75);
                const approxBytes = Math.round((webpBase64.length * 3) / 4);
                const compressedSizeStr = approxBytes < 1024 * 1024 ? (approxBytes / 1024).toFixed(0) + ' KB' : (approxBytes / (1024 * 1024)).toFixed(1) + ' MB';
                const newItem = {
                    id: `new_${idx}_${Date.now()}_${Math.random()}`,
                    type: 'new',
                    url: webpBase64,
                    file: file,
                    base64: webpBase64,
                    sizeStr: `${compressedSizeStr} (WebP)`,
                    originalSizeStr: originalSizeStr
                };
                setEditWartaGambarList(prev => [...prev, newItem]);
            } catch (err) {
                const fallbackItem = {
                    id: `new_${idx}_${Date.now()}_${Math.random()}`,
                    type: 'new',
                    url: URL.createObjectURL(file),
                    file: file,
                    sizeStr: originalSizeStr
                };
                setEditWartaGambarList(prev => [...prev, fallbackItem]);
            }
        }
    };

    const getActiveAdminPassword = () => {
        if (adminToken) return adminToken;
        try {
            return sessionStorage.getItem('PISGAH_ADMIN_SESSION_TOKEN') || localStorage.getItem('PISGAH_ADMIN_SESSION_TOKEN') || '';
        } catch (e) {
            return '';
        }
    };

    const syncWartaLocalCache = (updaterFn) => {
        setDaftarWarta(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];
            const nextList = updaterFn(safePrev);
            try {
                localStorage.setItem('PISGAH_OFFLINE_WARTA_CACHE', JSON.stringify(nextList));
                const rawCache = localStorage.getItem('pisgah_data_cache');
                if (rawCache) {
                    const parsedCache = JSON.parse(rawCache);
                    parsedCache.daftarWarta = nextList;
                    localStorage.setItem('pisgah_data_cache', JSON.stringify(parsedCache));
                }
            } catch (e) { }
            return nextList;
        });
    };

    // Fungsi upload gambar inline langsung ke Google Drive
    const handleUploadInlineImage = async (base64Data, filename) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            const upRes = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'uploadImageToDrive',
                    password: getActiveAdminPassword(),
                    folderId: null,
                    title: `WartaInline_${(filename || 'gambar').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25)}_${Date.now()}`,
                    imageBase64: base64Data
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const upText = await upRes.text();
            const upData = JSON.parse(upText);
            if (upData && upData.success && upData.url) {
                return upData.url;
            }
        } catch (e) {
            console.warn("Upload inline image to Drive failed, fallback to base64:", e);
        }
        return base64Data;
    };

    // Helper pengecekan aman berkas File atau Blob
    const isFileOrBlob = (obj) => {
        if (!obj || typeof obj !== 'object') return false;
        try {
            if (typeof window !== 'undefined') {
                if (typeof window.File === 'function' && obj instanceof window.File) return true;
                if (typeof window.Blob === 'function' && obj instanceof window.Blob) return true;
            }
        } catch (e) { }
        return Boolean(obj && typeof obj.slice === 'function' && (typeof obj.size === 'number' || typeof obj.type === 'string'));
    };

    // Helper upload foto sampul/dokumentasi warta ke Google Drive / Fallback kompresi Base64 aman
    const uploadWartaPhotoItem = async (fileOrBase64, idx = 0) => {
        try {
            if (!fileOrBase64) return '';

            // 1. Jika sudah berupa HTTP/HTTPS URL
            if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('http')) {
                const driveId = getGoogleDriveFileId(fileOrBase64);
                return driveId ? `https://lh3.googleusercontent.com/d/${driveId}` : formatImageUrl(fileOrBase64);
            }

            // 2. Jika input berupa File/Blob atau string Base64
            let base64Str = fileOrBase64;
            if (typeof fileOrBase64 === 'object' && fileOrBase64.base64) {
                base64Str = fileOrBase64.base64;
            } else if (isFileOrBlob(fileOrBase64)) {
                base64Str = await compressImage(fileOrBase64, 1280, 0.75);
            }
            if (typeof base64Str === 'string' && (base64Str.startsWith('data:image') || base64Str.length > 500)) {
                if (!base64Str.startsWith('data:image')) {
                    base64Str = formatImageUrl(base64Str);
                }

                // Upaya 1: Upload ke Google Drive melalui Google Apps Script (timeout 25 detik yang wajar)
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 25000);
                    const upRes = await portalFetch(GAS_API_URL, {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'uploadImageToDrive',
                            password: getActiveAdminPassword(),
                            folderId: null,
                            title: `Warta_${Date.now()}_${idx + 1}`,
                            imageBase64: base64Str
                        }),
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);
                    const upText = await upRes.text();
                    const upData = JSON.parse(upText);
                    if (upData && upData.success && upData.url) {
                        const driveId = getGoogleDriveFileId(upData.url);
                        return driveId ? `https://lh3.googleusercontent.com/d/${driveId}` : upData.url;
                    }
                } catch (upErr) {
                    console.warn("Upload foto warta ke Google Drive server tidak berhasil atau timeout, beralih ke kompresi base64 mandiri:", upErr);
                }

                // Upaya 2 (Fallback Aman & Pasti): Jika Drive gagal/timeout, kompres ke Base64 ringkas (< 44.000 karakter)
                // agar foto tetap tersimpan sempurna di sel Google Sheets (batas 50.000 karakter)
                try {
                    const compact = await compressImage(fileOrBase64, 550, 0.55);
                    if (compact && compact.length <= 44000) return compact;
                    const ultraCompact = await compressImage(fileOrBase64, 420, 0.45);
                    if (ultraCompact && ultraCompact.length <= 44000) return ultraCompact;
                } catch (cmpErr) {
                    console.warn("Gagal membuat fallback kompresi base64:", cmpErr);
                }
            }
            return typeof base64Str === 'string' ? base64Str : '';
        } catch (e) {
            console.warn("Gagal memproses foto warta:", e);
            return '';
        }
    };

    // Pastikan isi HTML warta tidak melebihi batas 50.000 karakter sel Google Sheets akibat gambar inline base64
    const prepareWartaHtmlForSave = async (rawHtml) => {
        let html = rawHtml || '';
        if (html.includes('data:image/')) {
            const regex = /src=["'](data:image\/[^"']+)["']/g;
            const matches = [...html.matchAll(regex)];
            for (let i = 0; i < matches.length; i++) {
                const dataUri = matches[i][1];
                if (dataUri && dataUri.length > 1000) {
                    const uploadedUrl = await handleUploadInlineImage(dataUri, `inline_${i + 1}`);
                    if (uploadedUrl && !uploadedUrl.startsWith('data:image/')) {
                        html = html.split(dataUri).join(uploadedUrl);
                    }
                }
            }
        }
        if (html.length > 47000) {
            html = html.replace(/<img[^>]+src=["']data:image\/[^"']+["'][^>]*>/gi, '');
        }
        if (html.length > 48500) {
            html = html.substring(0, 48500);
        }
        return html;
    };

    // Fungsi simpan warta
    const handleWartaFormSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        // Ambil nilai terbaru dari editor
        let latestHtml = wartaIsi;
        if (wartaEditorRef.current) {
            latestHtml = wartaEditorRef.current.getContent();
            setWartaIsi(latestHtml);
        }

        if (!wartaJudul.trim()) {
            alert("Judul warta tidak boleh kosong!");
            return;
        }

        const activePwd = getActiveAdminPassword();
        if (!activePwd) {
            alert("Sesi login admin Anda perlu disegarkan. Silakan keluar (Logout) lalu masuk (Login) kembali.");
            return;
        }

        setIsSavingWarta(true);

        try {
            let finalJudul = wartaJudul.trim();
            if (wartaKategori && !finalJudul.startsWith('[')) {
                finalJudul = `[${wartaKategori}] ${finalJudul}`;
            }

            // Gabungkan gambar dari wartaGambarList dan input URL sampul langsung
            let workingImageList = [...wartaGambarList];
            if (wartaCoverUrlInput && wartaCoverUrlInput.trim()) {
                const driveId = getGoogleDriveFileId(wartaCoverUrlInput);
                const directUrl = driveId
                    ? `https://lh3.googleusercontent.com/d/${driveId}`
                    : formatImageUrl(wartaCoverUrlInput.trim());
                if (!workingImageList.some(img => (img.url || img) === directUrl)) {
                    workingImageList.unshift({
                        id: `url_cover_${Date.now()}`,
                        url: directUrl,
                        type: 'url'
                    });
                }
            }

            let finalGambarUrl = "";
            if (workingImageList && workingImageList.length > 0) {
                let uploadedUrls = [];
                for (let i = 0; i < workingImageList.length; i++) {
                    const item = workingImageList[i];
                    const fileObj = item.file || item;
                    if (isFileOrBlob(fileObj)) {
                        const urlOrB64 = await uploadWartaPhotoItem(fileObj, i);
                        if (urlOrB64) uploadedUrls.push(urlOrB64);
                    } else if (typeof item === 'string' && !item.startsWith('blob:')) {
                        const urlOrB64 = await uploadWartaPhotoItem(item, i);
                        if (urlOrB64) uploadedUrls.push(urlOrB64);
                    } else if (item.url && typeof item.url === 'string' && !item.url.startsWith('blob:')) {
                        const urlOrB64 = await uploadWartaPhotoItem(item.url, i);
                        if (urlOrB64) uploadedUrls.push(urlOrB64);
                    }
                }
                const validUrls = uploadedUrls.filter(u => u && typeof u === 'string' && (u.startsWith('http') || u.startsWith('data:image')));
                finalGambarUrl = validUrls.join('|||');
                if (finalGambarUrl.length > 47000) {
                    finalGambarUrl = validUrls[0] || '';
                }
            }

            const safeHtml = await prepareWartaHtmlForSave(latestHtml);
            const publishTimestamp = (wartaPublishType === 'scheduled' && wartaScheduledDate)
                ? new Date(wartaScheduledDate).toISOString()
                : new Date(Date.now() - 5000).toISOString();

            const wartaPayload = {
                judul: finalJudul,
                isi: safeHtml,
                gambarUrl: finalGambarUrl,
                penulis: wartaPenulis || 'Redaksi Warta',
                tanggal: publishTimestamp
            };

            const sendSaveRequest = async (imgUrlOverride) => {
                const bodyObj = {
                    action: 'saveWarta',
                    password: activePwd,
                    ...wartaPayload,
                    gambarUrl: imgUrlOverride !== undefined ? imgUrlOverride : wartaPayload.gambarUrl,
                    data: JSON.stringify({
                        ...wartaPayload,
                        gambarUrl: imgUrlOverride !== undefined ? imgUrlOverride : wartaPayload.gambarUrl
                    })
                };
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 45000);
                try {
                    const res = await portalFetch(GAS_API_URL, {
                        method: 'POST',
                        body: JSON.stringify(bodyObj),
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);
                    const rawText = await res.text();
                    try {
                        return JSON.parse(rawText);
                    } catch (parseErr) {
                        throw new Error("Respons server tidak valid: " + rawText.substring(0, 120));
                    }
                } catch (fetchErr) {
                    clearTimeout(timeoutId);
                    if (fetchErr.name === 'AbortError') {
                        throw new Error("Koneksi ke server timeout (45 detik). Silakan coba lagi.");
                    }
                    throw fetchErr;
                }
            };

            let result = await sendSaveRequest();
            if (!result.success && finalGambarUrl) {
                // Retry tanpa gambar jika ada kendala kolom gambar di server
                result = await sendSaveRequest('');
            }

            if (result && (result.success || result.status === 'success')) {
                const maxRowIndex = (Array.isArray(daftarWarta) && daftarWarta.length > 0)
                    ? Math.max(...daftarWarta.map(w => Number(w.rowIndex) || 1))
                    : 1;
                const optimisticWarta = {
                    rowIndex: maxRowIndex + 1,
                    ...wartaPayload
                };
                syncWartaLocalCache(prev => [optimisticWarta, ...prev]);

                alert(wartaPublishType === 'scheduled'
                    ? `Warta berhasil dijadwalkan tayang pada ${formatIndoDateTime(publishTimestamp)}!`
                    : "Warta berhasil dipublikasikan ke Portal Berita!");
                try {
                    localStorage.removeItem('PISGAH_WARTA_DRAFT_NEW');
                } catch (e) { }
                setDraftNewAvailable(null);
                setAutosaveNewStatus('');
                setWartaJudul('');
                setWartaIsi('');
                setWartaGambarList([]);
                setWartaCoverUrlInput('');
                setWartaPenulis('');
                setWartaPublishType('now');
                setWartaScheduledDate('');
                setWartaKategori('Warta Sabat');
                setWartaViewMode('editor');
                if (wartaEditorRef.current) wartaEditorRef.current.setContent('');
                setWartaSubTab('posting');
                if (refreshWarta) refreshWarta();
            } else {
                alert("Gagal menyimpan warta: " + (result?.message || "Unknown error"));
            }
        } catch (err) {
            alert("Terjadi kesalahan saat mempublikasikan warta: " + err.message);
        } finally {
            setIsSavingWarta(false);
        }
    };

    // Fungsi Update dan Delete Warta
    const handleEditWarta = (warta) => {
        const info = parseWartaInfo(warta);
        setEditingWarta(warta);

        let initialKategori = info.category || 'Warta Sabat';
        let initialJudul = info.cleanTitle || warta.judul || '';
        let initialIsi = warta.isi || '';
        let initialPenulis = warta.penulis || '';

        const pubDate = new Date(warta.tanggal);
        const isFuture = !isNaN(pubDate.getTime()) && pubDate.getTime() > Date.now();
        setEditWartaPublishType(isFuture ? 'scheduled' : 'now');
        if (isFuture) {
            const pad = n => n < 10 ? '0' + n : n;
            const y = pubDate.getFullYear();
            const m = pad(pubDate.getMonth() + 1);
            const d = pad(pubDate.getDate());
            const h = pad(pubDate.getHours());
            const min = pad(pubDate.getMinutes());
            setEditWartaScheduledDate(`${y}-${m}-${d}T${h}:${min}`);
        } else {
            setEditWartaScheduledDate('');
        }

        try {
            const rawDraft = localStorage.getItem('PISGAH_WARTA_DRAFT_EDIT_' + warta.rowIndex);
            if (rawDraft) {
                const parsed = JSON.parse(rawDraft);
                if (parsed && (parsed.judul || parsed.isi)) {
                    if (parsed.kategori) initialKategori = parsed.kategori;
                    if (parsed.judul) initialJudul = parsed.judul;
                    if (parsed.isi) initialIsi = parsed.isi;
                    if (parsed.penulis) initialPenulis = parsed.penulis;
                }
            }
        } catch (e) { }

        setEditWartaKategori(initialKategori);
        setEditWartaJudul(initialJudul);
        setEditWartaIsi(initialIsi);
        setEditWartaPenulis(initialPenulis);
        const existingPhotos = parseGambarUrls(warta.gambarUrl).map((url, idx) => ({
            id: `exist_${idx}_${Date.now()}`,
            type: 'existing',
            url: url
        }));
        setEditWartaGambarList(existingPhotos);
        setEditWartaCoverUrlInput('');
        setEditWartaViewMode('editor');
        setEditWartaModal(true);
    };

    // Lock scroll body saat modal edit warta (full 1 layar) terbuka
    React.useEffect(() => {
        if (editWartaModal) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [editWartaModal]);

    const handleUpdateWarta = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!editingWarta) return;

        // Ambil nilai terbaru dari editor
        let latestHtml = editWartaIsi;
        if (editWartaEditorRef.current) {
            latestHtml = editWartaEditorRef.current.getContent();
            setEditWartaIsi(latestHtml);
        }

        if (!editWartaJudul.trim()) {
            alert("Judul warta tidak boleh kosong!");
            return;
        }

        const activePwd = getActiveAdminPassword();
        if (!activePwd) {
            alert("Sesi login admin Anda perlu disegarkan. Silakan keluar (Logout) lalu masuk (Login) kembali.");
            return;
        }

        setIsUpdatingWarta(true);

        try {
            let finalJudul = editWartaJudul.trim();
            if (editWartaKategori && !finalJudul.startsWith('[')) {
                finalJudul = `[${editWartaKategori}] ${finalJudul}`;
            }

            let workingImageList = [...editWartaGambarList];
            if (editWartaCoverUrlInput && editWartaCoverUrlInput.trim()) {
                const driveId = getGoogleDriveFileId(editWartaCoverUrlInput);
                const directUrl = driveId
                    ? `https://lh3.googleusercontent.com/d/${driveId}`
                    : formatImageUrl(editWartaCoverUrlInput.trim());
                if (!workingImageList.some(img => (img.url || img) === directUrl)) {
                    workingImageList.unshift({
                        id: `url_cover_${Date.now()}`,
                        url: directUrl,
                        type: 'url'
                    });
                }
            }

            let finalGambarUrl = "";
            if (workingImageList && workingImageList.length > 0) {
                let urlParts = [];
                for (let i = 0; i < workingImageList.length; i++) {
                    const item = workingImageList[i];
                    const fileObj = item.file || item;
                    if (isFileOrBlob(fileObj)) {
                        const uploaded = await uploadWartaPhotoItem(fileObj, i);
                        if (uploaded) urlParts.push(uploaded);
                    } else if (item.type === 'existing' && item.url) {
                        urlParts.push(item.url);
                    } else if (typeof item === 'string' && !item.startsWith('blob:')) {
                        const uploaded = await uploadWartaPhotoItem(item, i);
                        if (uploaded) urlParts.push(uploaded);
                    } else if (item.url && typeof item.url === 'string' && !item.url.startsWith('blob:')) {
                        const uploaded = await uploadWartaPhotoItem(item.url, i);
                        if (uploaded) urlParts.push(uploaded);
                    }
                }
                const validUrls = urlParts.filter(u => u && typeof u === 'string' && (u.startsWith('http') || u.startsWith('data:image')));
                finalGambarUrl = validUrls.join('|||');
                if (finalGambarUrl.length > 47000) {
                    finalGambarUrl = validUrls[0] || '';
                }
            }

            const safeHtml = await prepareWartaHtmlForSave(latestHtml);
            const publishTimestamp = (editWartaPublishType === 'scheduled' && editWartaScheduledDate)
                ? new Date(editWartaScheduledDate).toISOString()
                : (editWartaPublishType === 'now' && !isWartaPublished(editingWarta.tanggal)
                    ? new Date(Date.now() - 5000).toISOString()
                    : (editingWarta.tanggal || new Date(Date.now() - 5000).toISOString()));

            const updatePayload = {
                rowIndex: editingWarta.rowIndex,
                judul: finalJudul,
                isi: safeHtml,
                gambarUrl: finalGambarUrl,
                penulis: editWartaPenulis || 'Redaksi Warta',
                tanggal: publishTimestamp
            };

            const sendUpdateRequest = async (imgUrlOverride) => {
                const payloadWithImg = {
                    ...updatePayload,
                    gambarUrl: imgUrlOverride !== undefined ? imgUrlOverride : updatePayload.gambarUrl
                };
                const res = await portalFetch(GAS_API_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'updateWarta',
                        password: activePwd,
                        ...payloadWithImg,
                        data: JSON.stringify(payloadWithImg)
                    })
                });
                const rawText = await res.text();
                try {
                    return JSON.parse(rawText);
                } catch (parseErr) {
                    throw new Error("Respons server tidak valid: " + rawText.substring(0, 120));
                }
            };

            let result = await sendUpdateRequest();
            if (!result.success && finalGambarUrl) {
                result = await sendUpdateRequest('');
            }

            if (result && (result.success || result.status === 'success')) {
                syncWartaLocalCache(prev => prev.map(w => Number(w.rowIndex) === Number(editingWarta.rowIndex) ? { ...w, ...updatePayload } : w));
                alert(editWartaPublishType === 'scheduled'
                    ? `Warta berhasil dijadwalkan tayang pada ${formatIndoDateTime(publishTimestamp)}!`
                    : "Warta berhasil diperbarui!");
                try {
                    localStorage.removeItem('PISGAH_WARTA_DRAFT_EDIT_' + editingWarta.rowIndex);
                } catch (e) { }
                setAutosaveEditStatus('');
                setEditWartaModal(false);
                setEditingWarta(null);
                setEditWartaCoverUrlInput('');
                setEditWartaPublishType('now');
                setEditWartaScheduledDate('');
                if (refreshWarta) refreshWarta();
            } else {
                alert("Gagal memperbarui: " + (result?.message || "Unknown error"));
            }
        } catch (err) {
            alert("Terjadi kesalahan: " + err.message);
        } finally {
            setIsUpdatingWarta(false);
        }
    };

    const handlePublishNow = async (warta) => {
        if (!window.confirm(`Tayangkan warta "${warta.judul}" sekarang juga agar langsung dapat dibaca oleh seluruh jemaat?`)) return;
        const activePwd = getActiveAdminPassword();
        try {
            const nowIso = new Date(Date.now() - 5000).toISOString();
            const updatePayload = {
                rowIndex: warta.rowIndex,
                judul: warta.judul,
                isi: warta.isi,
                gambarUrl: warta.gambarUrl,
                penulis: warta.penulis,
                tanggal: nowIso
            };
            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'updateWarta',
                    password: activePwd,
                    ...updatePayload,
                    data: JSON.stringify(updatePayload)
                })
            });
            const rawText = await res.text();
            const result = JSON.parse(rawText);
            if (result && (result.success || result.status === 'success')) {
                syncWartaLocalCache(prev => prev.map(w => Number(w.rowIndex) === Number(warta.rowIndex) ? { ...w, tanggal: nowIso } : w));
                alert("Warta berhasil ditayangkan langsung!");
                if (refreshWarta) refreshWarta();
            } else {
                alert("Gagal memperbarui: " + (result?.message || "Unknown error"));
            }
        } catch (err) {
            alert("Terjadi kesalahan: " + err.message);
        }
    };

    const handleDeleteWarta = async (rowIndex, judul) => {
        if (!window.confirm(`Yakin ingin menghapus warta "${judul}"?`)) return;
        const activePwd = getActiveAdminPassword();
        try {
            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'deleteWarta',
                    password: activePwd,
                    rowIndex: rowIndex
                })
            });
            const rawText = await res.text();
            const result = JSON.parse(rawText);
            if (result && (result.success || result.status === 'success')) {
                syncWartaLocalCache(prev => prev.filter(w => Number(w.rowIndex) !== Number(rowIndex)));
                alert("Warta berhasil dihapus!");
                if (refreshWarta) refreshWarta();
            } else {
                alert("Gagal menghapus: " + (result?.message || "Unknown error"));
            }
        } catch (err) {
            alert("Terjadi kesalahan: " + err.message);
        }
    };

    // Kompresi gambar warta didelegasikan ke compressImage utama di atas yang menjaga transparansi PNG/WebP/SVG

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
            const sus = existingData.susunan || {};
            setEditForm({ ...defaultSusunan, ...sus });
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
            portalFetch(GAS_API_URL, {
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
            portalFetch(GAS_API_URL, {
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
                        if (perpuluhanDate) cached.perpuluhanDate = perpuluhanDate;
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

            portalFetch(GAS_API_URL, {
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
            const res = await portalFetch(GAS_API_URL, {
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
            const res = await portalFetch(GAS_API_URL, {
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
        window.notifyLoading?.("Menyimpan URL YouTube...", "Sedang menyinkronkan link video ke server...");
        try {
            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveYoutubeUrl', password: adminToken, url: editYoutubeUrl, title: editYoutubeTitle, channelTitle: editYoutubeChannelTitle })
            });
            const result = await res.json();
            if (result.success) {
                alert("URL YouTube berhasil diperbarui!");
                setYoutubeUrl(editYoutubeUrl);
                setYoutubeTitle(editYoutubeTitle);
                setYoutubeChannelTitle(editYoutubeChannelTitle);
                try {
                    const cachedStr = localStorage.getItem('pisgah_data_cache');
                    if (cachedStr) {
                        const cached = JSON.parse(cachedStr);
                        cached.youtubeUrl = editYoutubeUrl;
                        cached.youtubeTitle = editYoutubeTitle;
                        cached.youtubeChannelTitle = editYoutubeChannelTitle;
                        localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                    }
                } catch (e) { }
                if (setCarouselVideos) {
                    setCarouselVideos(prev => {
                        if (!prev || prev.length === 0) return [{ title: editYoutubeTitle || "Video Penting", url: editYoutubeUrl }];
                        let found = false;
                        const updated = prev.map(v => {
                            if (v.url === youtubeUrl || v.title === (youtubeTitle || "Video Penting")) {
                                found = true;
                                return { ...v, title: editYoutubeTitle || "Video Penting", url: editYoutubeUrl };
                            }
                            return v;
                        });
                        return found ? updated : [{ title: editYoutubeTitle || "Video Penting", url: editYoutubeUrl }, ...prev];
                    });
                }
            } else {
                alert("Gagal merubah URL: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsSavingUrl(false);
    };

    // SIMPAN ANTHEM URL
    const handleSaveAnthemUrl = async (e) => {
        e.preventDefault();
        setIsSavingAnthemUrl(true);
        window.notifyLoading?.("Menyimpan Lagu Pujian...", "Sedang memperbarui link lagu pujian...");
        try {
            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveAnthemUrl', password: adminToken, url: editAnthemUrl, url2: editAnthemUrl2, title: editAnthemTitle, title2: editAnthemTitle2 })
            });
            const result = await res.json();
            if (result.success) {
                alert("URL Anthem berhasil diperbarui!");
                setAnthemUrl(editAnthemUrl);
                setAnthemUrl2(editAnthemUrl2);
                setAnthemTitle(editAnthemTitle);
                setAnthemTitle2(editAnthemTitle2);
                try {
                    const cachedStr = localStorage.getItem('pisgah_data_cache');
                    if (cachedStr) {
                        const cached = JSON.parse(cachedStr);
                        cached.anthemUrl = editAnthemUrl;
                        cached.anthemUrl2 = editAnthemUrl2;
                        cached.anthemTitle = editAnthemTitle;
                        cached.anthemTitle2 = editAnthemTitle2;
                        localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                    }
                } catch (e) { }
                if (setCarouselVideos) {
                    setCarouselVideos(prev => {
                        if (!prev) return prev;
                        return prev.map(v => {
                            if (v.url === anthemUrl || v.title === (anthemTitle || "Adventist Church Anthem")) {
                                return { ...v, title: editAnthemTitle || "Adventist Church Anthem", url: editAnthemUrl };
                            }
                            if (v.url === anthemUrl2 || v.title === (anthemTitle2 || "Video Tambahan")) {
                                return { ...v, title: editAnthemTitle2 || "Video Tambahan", url: editAnthemUrl2 };
                            }
                            return v;
                        });
                    });
                }
            } else {
                alert("Gagal merubah URL: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsSavingAnthemUrl(false);
    };

    // SIMPAN LIVE YOUTUBE URL
    const handleSaveLiveUrl = async (e) => {
        e.preventDefault();
        setIsSavingLiveUrl(true);
        window.notifyLoading?.("Menyimpan Live Streaming...", "Sedang memperbarui tautan siaran langsung...");
        try {
            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveLiveUrl', password: adminToken, url: editLiveUrl })
            });
            const result = await res.json();
            if (result.success) {
                alert("URL Live Streaming berhasil diperbarui!");
                setLiveUrl(editLiveUrl);
                try {
                    const cachedStr = localStorage.getItem('pisgah_data_cache');
                    if (cachedStr) {
                        const cached = JSON.parse(cachedStr);
                        cached.liveUrl = editLiveUrl;
                        localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                    }
                } catch (e) { }
            } else {
                alert("Gagal: " + (result.message || "Akses ditolak."));
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }
        setIsSavingLiveUrl(false);
    };

    // SIMPAN REKENING & QRIS
    const handleSaveRekening = async (e) => {
        e.preventDefault();
        setIsSavingRekening(true);
        window.notifyLoading?.("Menyimpan Rekening & QRIS...", "Sedang menyinkronkan data rekening persembahan...");
        try {
            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveRekening',
                    password: adminToken,
                    daftarRekening: editDaftarRekening
                })
            });

            const text = await res.text();
            let result = { success: false };

            try {
                result = JSON.parse(text);
            } catch (parseErr) {
                if (text.includes("success") || text.trim() === '') result = { success: true };
            }

            if (result.success) {
                alert('Pengaturan Rekening & QRIS berhasil disimpan!');
                setDaftarRekening(editDaftarRekening);
                try {
                    const cachedStr = localStorage.getItem('pisgah_data_cache');
                    if (cachedStr) {
                        const cached = JSON.parse(cachedStr);
                        cached.daftarRekening = JSON.stringify(editDaftarRekening);
                        localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                    }
                } catch (e) { }
            } else {
                alert('Gagal: ' + (result.message || 'Akses ditolak.'));
            }
        } catch (err) {
            alert('Pengaturan berhasil disimpan (Optimis)!');
            setDaftarRekening(editDaftarRekening);
            try {
                const cachedStr = localStorage.getItem('pisgah_data_cache');
                if (cachedStr) {
                    const cached = JSON.parse(cachedStr);
                    cached.daftarRekening = JSON.stringify(editDaftarRekening);
                    localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                }
            } catch (e) { }
        }
        setIsSavingRekening(false);
    };

    // --- Helper functions for Rekening/QRIS Array ---
    const handleAddRekening = () => {
        setEditDaftarRekening([...editDaftarRekening, { id: Date.now(), namaBank: '', rekeningBank: '', atasNama: '', qrisUrl: '', logoUrl: '' }]);
    };
    const handleUpdateRekening = (id, field, value) => {
        setEditDaftarRekening(editDaftarRekening.map(r => r.id === id ? { ...r, [field]: value } : r));
    };
    const handleRemoveRekening = (id) => {
        setEditDaftarRekening(editDaftarRekening.filter(r => r.id !== id));
    };

    // SIMPAN PErjamuan & Perpuluhan
    const handleSavePerjamuanDate = async (e) => {
        e.preventDefault();
        setIsSavingPerjamuanDate(true);
        window.notifyLoading?.("Menyimpan Jadwal Perjamuan & Perpuluhan...", "Sedang menyinkronkan tanggal ke server...");
        try {
            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'savePerjamuanDate',
                    password: adminToken,
                    tanggal: editPerjamuanDate,
                    tanggalPerpuluhan: editPerpuluhanDate,
                    catatanPerjamuan: editPerjamuanNote,
                    catatanPerpuluhan: editPerpuluhanNote
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
                alert('Jadwal Sabat Khusus berhasil disimpan!');
                setPerjamuanDate(editPerjamuanDate);
                setPerpuluhanDate(editPerpuluhanDate);
                setPerjamuanNote(editPerjamuanNote);
                setPerpuluhanNote(editPerpuluhanNote);
                // Sinkronisasi cache localStorage agar data langsung terupdate saat reload
                try {
                    const cachedStr = localStorage.getItem('pisgah_data_cache');
                    if (cachedStr) {
                        const cached = JSON.parse(cachedStr);
                        cached.perjamuanDate = editPerjamuanDate;
                        cached.perpuluhanDate = editPerpuluhanDate;
                        cached.perjamuanNote = editPerjamuanNote;
                        cached.perpuluhanNote = editPerpuluhanNote;
                        localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                    }
                } catch (e) { console.warn('Gagal update cache:', e); }
            } else {
                alert('Gagal: ' + (result.message || 'Akses ditolak.'));
            }
        } catch (err) {
            console.error("Fetch error:", err);
            // Fallback optimis: Biasanya jika jatuh ke catch (karena CORS/redirect), data sebenarnya SUDAH masuk ke spreadsheet.
            alert('Jadwal Sabat Khusus berhasil disimpan (Optimis)!');
            setPerjamuanDate(editPerjamuanDate);
            setPerpuluhanDate(editPerpuluhanDate);
            setPerjamuanNote(editPerjamuanNote);
            setPerpuluhanNote(editPerpuluhanNote);
            // Sinkronisasi cache localStorage saat fallback juga
            try {
                const cachedStr = localStorage.getItem('pisgah_data_cache');
                if (cachedStr) {
                    const cached = JSON.parse(cachedStr);
                    cached.perjamuanDate = editPerjamuanDate;
                    cached.perpuluhanDate = editPerpuluhanDate;
                    localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                }
            } catch (e) { console.warn('Gagal update cache:', e); }
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
        window.notifyLoading?.("Menyimpan Pengumuman...", "Sedang menyinkronkan teks pengumuman ke database...");

        // Buat salinan data pengumuman
        let finalPengumuman = { ...editPengumuman };
        // Jika isi hanya tag kosong, set ke string kosong
        if (isContentEmpty(finalPengumuman.isi)) {
            finalPengumuman.isi = '';
        }

        try {
            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'savePengumuman',
                    password: adminToken,
                    pengumuman: JSON.stringify(finalPengumuman)
                })
            });
            const result = await res.json();
            if (result.success) {
                window.notifySuccess?.("Pengumuman Berhasil Disimpan! ✅", "Teks pengumuman terbaru telah aktif di Homepage.");
                setPengumuman(finalPengumuman);   // update state parent
                setEditPengumuman(finalPengumuman); // sync lokal
            } else {
                window.notifyError?.("Gagal Menyimpan Pengumuman ❌", result.message || "Akses ditolak.");
            }
        } catch (err) {
            window.notifyError?.("Kendala Terhubung ke Server ❌", "Gagal menghubungi server Google Apps Script.", err.message);
        } finally {
            setIsSavingPengumuman(false);
        }
    };

    // SIMPAN LOKASI & KONTAK
    const handleSaveKontakGereja = async (e) => {
        e.preventDefault();
        setIsSavingKontak(true);
        window.notifyLoading?.("Menyimpan Kontak & Peta Lokasi...", "Sedang menyinkronkan informasi gereja ke server...");

        // Mencegah error jika admin memasukkan seluruh elemen <iframe>, kita hanya ambil src="" nya
        let finalUrl = editKontakGereja.mapUrl;
        if (finalUrl.includes('<iframe')) {
            const match = finalUrl.match(/src="([^"]+)"/);
            if (match) finalUrl = match[1];
        }
        const finalKontak = { ...editKontakGereja, mapUrl: finalUrl };
        setEditKontakGereja(finalKontak);

        try {
            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveKontakGereja',
                    password: adminToken,
                    kontakGereja: JSON.stringify(finalKontak)
                })
            });
            const result = await res.json();
            if (result.success) {
                window.notifySuccess?.("Kontak & Peta Berhasil Disimpan! ✅", "Informasi kontak dan tautan Google Maps gereja berhasil diperbarui.");
                setKontakGereja(finalKontak);
            } else {
                window.notifyError?.("Gagal Menyimpan Kontak & Peta ❌", result.message || "Akses ditolak.");
            }
        } catch (err) {
            window.notifyError?.("Kendala Terhubung ke Server ❌", "Gagal menghubungi server Google Apps Script.", err.message);
        } finally {
            setIsSavingKontak(false);
        }
    };

    // SIMPAN HERO IMAGE URL & CAPTION DINAMIS (MAKSIMAL 10 SLIDE)
    const handleSaveHeroImage = async (e) => {
        e.preventDefault();
        if (editHeroImages.length === 0) {
            window.notifyWarning?.("Peringatan", "Pilih setidaknya 1 gambar hero banner!");
            return;
        }
        if (editHeroImages.length > 10) {
            window.notifyWarning?.("Perhatian", "Maksimal carousel adalah 10 slide. Sistem akan membatasi dan menyimpan 10 slide pertama.");
        }
        setIsSavingHero(true);
        window.notifyLoading?.("Menyimpan Hero Banner & Caption...", "Sedang mempersiapkan data slide dan caption teks...");

        try {
            // Batasi maksimal 10 slide carousel dan upload Base64 ke Drive jika ada
            const updatedSlides = editHeroImages.slice(0, 10).map((raw, i) => {
                const fallback = DEFAULT_HERO_CAPTIONS[i % DEFAULT_HERO_CAPTIONS.length] || DEFAULT_HERO_CAPTIONS[0];
                return typeof raw === 'object' && raw !== null
                    ? {
                        url: raw.url || raw.imageUrl || '',
                        badge: raw.badge !== undefined ? raw.badge : fallback.badge,
                        title: raw.title !== undefined ? raw.title : fallback.title,
                        subtitle: raw.subtitle !== undefined ? raw.subtitle : fallback.subtitle,
                        ...raw
                    }
                    : {
                        url: raw || '',
                        badge: fallback.badge,
                        title: fallback.title,
                        subtitle: fallback.subtitle
                    };
            });

            for (let i = 0; i < updatedSlides.length; i++) {
                const item = updatedSlides[i];
                if (item.url && item.url.startsWith('data:image')) {
                    window.notifyLoading?.("Mengunggah Gambar ke Google Drive...", `Sedang mengunggah gambar Slide #${i + 1} ke Google Drive gereja...`);
                    try {
                        const upRes = await portalFetch(GAS_API_URL, {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'uploadImageToDrive',
                                password: adminToken,
                                folderId: null,
                                title: `Hero_Slide_${i + 1}_${Date.now()}`,
                                imageBase64: item.url
                            })
                        });
                        const upData = await upRes.json();
                        if (upData.success && upData.url) {
                            item.url = upData.url;
                        } else {
                            console.warn("Upload response:", upData);
                        }
                    } catch (uploadErr) {
                        console.warn("Gagal upload hero image ke Drive:", uploadErr);
                        window.notifyWarning?.("Upload Drive Terkendala", `Slide #${i + 1} gagal diunggah ke Google Drive: ${uploadErr.message}. Menyimpan dengan data gambar saat ini.`);
                    }
                }
                updatedSlides[i] = item;
            }

            window.notifyLoading?.("Menyinkronkan ke Server...", "Sedang menyimpan konfigurasi slide carousel ke Google Apps Script...");

            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveHeroImage', password: adminToken, url: JSON.stringify(updatedSlides) })
            });
            const result = await res.json();
            if (result.success) {
                window.notifySuccess?.("Hero Banner & Caption Berhasil Disimpan! ✅", "Semua slide dan caption teks telah tersimpan ke server dan database.");
                const finalSlides = (result.updatedUrls && Array.isArray(result.updatedUrls) && result.updatedUrls.length > 0)
                    ? result.updatedUrls.map((u, idx) => {
                        const orig = updatedSlides[idx] || {};
                        const fallback = DEFAULT_HERO_CAPTIONS[idx % DEFAULT_HERO_CAPTIONS.length] || DEFAULT_HERO_CAPTIONS[0];
                        if (typeof u === 'object' && u !== null) {
                            return {
                                ...fallback,
                                ...orig,
                                ...u,
                                url: u.url || u.imageUrl || orig.url || ''
                            };
                        }
                        return {
                            url: u || orig.url || '',
                            badge: orig.badge !== undefined ? orig.badge : fallback.badge,
                            title: orig.title !== undefined ? orig.title : fallback.title,
                            subtitle: orig.subtitle !== undefined ? orig.subtitle : fallback.subtitle
                        };
                    })
                    : updatedSlides;
                setHeroImages(finalSlides);
                setEditHeroImages(finalSlides);
                try {
                    localStorage.setItem('pisgah_hero_slides', JSON.stringify(finalSlides));
                    const cachedStr = localStorage.getItem('pisgah_data_cache');
                    if (cachedStr) {
                        const cached = JSON.parse(cachedStr);
                        cached.heroImages = finalSlides;
                        localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                    }
                } catch (e) { }
            } else {
                window.notifyError?.("Gagal Menyimpan Hero Banner ❌", result.message || "Akses ditolak atau token admin tidak valid.", "Silakan periksa password admin Anda atau muat ulang halaman.");
            }
        } catch (err) {
            window.notifyError?.("Kendala Terhubung ke Server ❌", "Tidak dapat terhubung ke Google Apps Script.", `Detail kendala: ${err.message || 'Koneksi jaringan terputus atau batas waktu terlewati.'}. Pastikan ukuran file tidak terlalu besar.`);
        } finally {
            setIsSavingHero(false);
        }
    };

    // SIMPAN CAROUSEL EVENTS (ACARA TERDEKAT)
    const handleSaveCarouselEvents = async (e) => {
        e.preventDefault();
        setIsSavingCarouselEvents(true);
        window.notifyLoading?.("Menyimpan Acara Terdekat...", "Sedang mempersiapkan data agenda acara...");
        try {
            // Upload Base64 image via uploadImageToDrive jika ada, agar langsung menjadi URL Drive
            const updatedList = [...editCarouselEvents];
            for (let i = 0; i < updatedList.length; i++) {
                const item = { ...updatedList[i] };
                if (item.imageUrl && item.imageUrl.startsWith('data:image')) {
                    window.notifyLoading?.("Mengunggah Poster Acara...", `Sedang mengunggah poster untuk "${item.title || 'Acara'}" ke Google Drive...`);
                    try {
                        const upRes = await portalFetch(GAS_API_URL, {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'uploadImageToDrive',
                                password: adminToken,
                                folderId: null,
                                title: `Acara_${(item.title || 'event').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
                                imageBase64: item.imageUrl
                            })
                        });
                        const upData = await upRes.json();
                        if (upData.success && upData.url) {
                            item.imageUrl = upData.url;
                        }
                    } catch (uploadErr) {
                        console.warn("Gagal upload via uploadImageToDrive:", uploadErr);
                    }
                }
                updatedList[i] = item;
            }

            window.notifyLoading?.("Menyinkronkan ke Server...", "Sedang menyimpan agenda acara terdekat ke database...");
            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveCarouselEvents', password: adminToken, carouselEvents: updatedList })
            });
            const result = await res.json();
            if (result.success) {
                window.notifySuccess?.("Acara Terdekat Berhasil Disimpan! ✅", "Daftar agenda acara terdekat berhasil diperbarui di Homepage dan Jadwal.");
                const finalEvents = result.updatedEvents || updatedList;
                setCarouselEvents(finalEvents);
                setEditCarouselEvents(finalEvents);
            } else {
                window.notifyError?.("Gagal Menyimpan Acara Terdekat ❌", result.message || "Akses ditolak.", "Periksa kembali password admin Anda.");
            }
        } catch (err) {
            window.notifyError?.("Kendala Terhubung ke Server ❌", "Gagal menghubungi server Google Apps Script.", `Detail: ${err.message || 'Koneksi jaringan terputus.'}`);
        } finally {
            setIsSavingCarouselEvents(false);
        }
    };

    // SIMPAN CAROUSEL VIDEOS (GALERI VIDEO)
    const handleSaveCarouselVideos = async (e) => {
        e.preventDefault();
        setIsSavingCarouselVideos(true);
        window.notifyLoading?.("Menyimpan Video Carousel...", "Sedang menyinkronkan video ke server...");
        try {
            const cleanedVideos = editCarouselVideos.map(vid => {
                const cleanUrl = formatYouTubeEmbedUrl(vid.url);
                return {
                    ...vid,
                    title: (vid.title || '').trim(),
                    url: cleanUrl || (vid.url || '').trim(),
                    thumbnail: (vid.thumbnail || '').trim()
                };
            });
            const res = await portalFetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveCarouselVideos', password: adminToken, carouselVideos: cleanedVideos })
            });
            const result = await res.json();
            if (result.success) {
                window.notifySuccess?.("Galeri Video Berhasil Diperbarui! ✅", "Daftar video carousel telah berhasil disimpan.");
                setCarouselVideos(cleanedVideos);
                setEditCarouselVideos(cleanedVideos);
                try {
                    const cachedStr = localStorage.getItem('pisgah_data_cache');
                    if (cachedStr) {
                        const cached = JSON.parse(cachedStr);
                        cached.carouselVideos = JSON.stringify(cleanedVideos);
                        localStorage.setItem('pisgah_data_cache', JSON.stringify(cached));
                    }
                } catch (e) { }
            } else {
                window.notifyError?.("Gagal Menyimpan Galeri Video ❌", result.message || "Akses ditolak.");
            }
        } catch (err) {
            window.notifyError?.("Kendala Terhubung ke Server ❌", "Gagal menghubungi server.", err.message);
        } finally {
            setIsSavingCarouselVideos(false);
        }
    };

    const moveCarouselVideo = (index, direction) => {
        setEditCarouselVideos(prev => {
            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= prev.length) return prev;
            const next = [...prev];
            const temp = next[index];
            next[index] = next[targetIndex];
            next[targetIndex] = temp;
            return next;
        });
    };

    const updateHeroSlide = (idx, field, value) => {
        setEditHeroImages(prev => {
            const next = [...prev];
            const raw = next[idx];
            const fallback = DEFAULT_HERO_CAPTIONS[idx % DEFAULT_HERO_CAPTIONS.length] || DEFAULT_HERO_CAPTIONS[0];
            const current = typeof raw === 'object' && raw !== null
                ? {
                    url: raw.url || raw.imageUrl || '',
                    badge: raw.badge !== undefined ? raw.badge : fallback.badge,
                    title: raw.title !== undefined ? raw.title : fallback.title,
                    subtitle: raw.subtitle !== undefined ? raw.subtitle : fallback.subtitle,
                    ...raw
                }
                : {
                    url: raw || '',
                    badge: fallback.badge,
                    title: fallback.title,
                    subtitle: fallback.subtitle
                };
            current[field] = value;
            next[idx] = current;
            return next;
        });
    };

    const moveHeroSlide = (index, direction) => {
        setEditHeroImages(prev => {
            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= prev.length) return prev;
            const next = [...prev];
            const temp = next[index];
            next[index] = next[targetIndex];
            next[targetIndex] = temp;
            return next;
        });
    };

    const handleAddHeroUrl = () => {
        if (editHeroImages.length >= 10) {
            return alert("Maksimal carousel adalah 10 slide gambar! Silakan hapus slide yang tidak digunakan terlebih dahulu.");
        }
        const url = prompt("Masukkan URL gambar baru (https://...):");
        if (url && url.trim()) {
            setEditHeroImages(prev => {
                if (prev.length >= 10) {
                    alert("Maksimal carousel adalah 10 slide gambar!");
                    return prev;
                }
                const idx = prev.length;
                const fallback = DEFAULT_HERO_CAPTIONS[idx % DEFAULT_HERO_CAPTIONS.length] || DEFAULT_HERO_CAPTIONS[0];
                return [...prev, {
                    url: url.trim(),
                    badge: fallback.badge,
                    title: fallback.title,
                    subtitle: fallback.subtitle
                }];
            });
        }
    };

    const handleRemoveHeroImage = (indexToRemove) => {
        if (editHeroImages.length <= 1) {
            alert("Harus ada minimal 1 slide gambar pada carousel!");
            return;
        }
        setEditHeroImages(editHeroImages.filter((_, idx) => idx !== indexToRemove));
    };

    const handleHeroFileUpload = (e) => {
        if (editHeroImages.length >= 10) {
            alert("Maksimal carousel adalah 10 slide gambar! Silakan hapus slide yang tidak digunakan terlebih dahulu.");
            e.target.value = '';
            return;
        }
        const file = e.target.files && e.target.files[0];
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

                setEditHeroImages(prev => {
                    if (prev.length >= 10) {
                        alert("Maksimal carousel adalah 10 slide gambar!");
                        return prev;
                    }
                    const idx = prev.length;
                    const fallback = DEFAULT_HERO_CAPTIONS[idx % DEFAULT_HERO_CAPTIONS.length] || DEFAULT_HERO_CAPTIONS[0];
                    return [...prev, {
                        url: dataUrl,
                        badge: fallback.badge,
                        title: fallback.title,
                        subtitle: fallback.subtitle
                    }];
                });
            };
        };
        e.target.value = '';
    };

    const handleEventFileUpload = (e, index) => {
        const file = e.target.files && e.target.files[0];
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
                const dataUrl = canvas.toDataURL('image/webp', 0.7);

                const newArr = [...editCarouselEvents];
                newArr[index] = { ...newArr[index], imageUrl: dataUrl };
                setEditCarouselEvents(newArr);
            };
        };
        e.target.value = '';
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
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const isTrans = file.type === 'image/png' || file.type === 'image/webp' || file.name.toLowerCase().endsWith('.png');
                let hasAlpha = false;
                if (isTrans) {
                    try {
                        const d = ctx.getImageData(0, 0, width, height).data;
                        for (let k = 3; k < d.length; k += 16) {
                            if (d[k] < 250) { hasAlpha = true; break; }
                        }
                    } catch (e) { hasAlpha = isTrans; }
                }

                const dataUrl = hasAlpha ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.7);

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
                    <button onClick={() => setAdminTab('pastoral')} className={`flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors border-l sm:border-t-0 border-t border-navy-50 ${adminTab === 'pastoral' ? 'bg-navy-900 text-gold-400 shadow-inner' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/50'}`}>Doa & Kalender</button>
                    <button onClick={() => setAdminTab('pelayan')} className={`flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors border-l sm:border-t-0 border-t border-navy-50 ${adminTab === 'pelayan' ? 'bg-navy-900 text-gold-400 shadow-inner' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/50'}`}>Kelola Pejabat</button>
                    <button onClick={() => setAdminTab('buku')} className={`flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors border-l sm:border-t-0 border-t border-navy-50 ${adminTab === 'buku' ? 'bg-navy-900 text-gold-400 shadow-inner' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/50'}`}>Kelola Buku</button>
                    <button onClick={() => setAdminTab('lagu')} className={`flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors border-l sm:border-t-0 border-t border-navy-50 ${adminTab === 'lagu' ? 'bg-navy-900 text-gold-400 shadow-inner' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/50'}`}>Kelola Lagu</button>
                    <button onClick={() => setAdminTab('pengaturan')} className={`flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors border-l sm:border-t-0 border-t border-navy-50 ${adminTab === 'pengaturan' ? 'bg-navy-900 text-gold-400 shadow-inner' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/50'}`}>Pengaturan Admin</button>
                    <button onClick={() => { if (confirm('Yakin ingin logout dari akun admin?')) handleLogout(); }} className="flex-1 py-4 font-bold text-sm md:text-base text-center transition-colors border-l sm:border-t-0 border-t border-navy-50 text-red-600 hover:text-red-700 hover:bg-red-50/50">Logout</button>
                </div>

                <div className={`p-4 md:p-6 ${adminTab === 'jadwal' ? 'bg-navy-50/30' : 'bg-white'}`}>
                </div>
                {/* Modal Edit Warta (Full 1 Layar Penuh via createPortal) */}
                {editWartaModal && createPortal(
                    <div className="fixed inset-0 z-[99999] bg-gray-50 dark:bg-[#0b1a30] text-navy-900 dark:text-gray-100 flex flex-col overflow-hidden animate-fade-in">
                        {/* Header Bar Fullscreen Studio */}
                        <header className="sticky top-0 z-30 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-b border-navy-100 dark:border-navy-800 shadow-sm px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between gap-3 shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.confirm('Tutup editor warta? Perubahan yang belum disimpan akan hilang.')) {
                                            try {
                                                localStorage.removeItem('PISGAH_WARTA_DRAFT_EDIT_' + editingWarta.rowIndex);
                                            } catch (e) { }
                                            setAutosaveEditStatus('');
                                            setEditWartaModal(false);
                                            setEditingWarta(null);
                                        }
                                    }}
                                    className="p-2 sm:px-3 sm:py-2 bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-700 dark:text-gold-300 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-xs shrink-0"
                                >
                                    <Icon name="ArrowLeft" className="w-4 h-4" />
                                    <span className="hidden sm:inline">Kembali / Batal</span>
                                </button>
                                <div className="h-6 w-px bg-navy-200 dark:bg-navy-700 hidden sm:block"></div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base sm:text-lg font-black text-navy-950 dark:text-gold-400 truncate">
                                            Edit Warta & Berita
                                        </h2>
                                        <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500/15 text-gold-600 dark:text-gold-300 border border-gold-400/30">
                                            {editWartaKategori}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-navy-400 dark:text-navy-500 truncate hidden md:block">
                                        {editWartaJudul || 'Tanpa Judul'}
                                    </p>
                                </div>
                            </div>

                            {/* Actions: Mode Switcher & Simpan */}
                            <div className="flex items-center gap-2 shrink-0">
                                {autosaveEditStatus && (
                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hidden md:flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-lg">
                                        <Icon name="CheckCircle" className="w-3.5 h-3.5 text-emerald-500" /> {autosaveEditStatus}
                                    </span>
                                )}
                                <div className="flex items-center bg-navy-50 dark:bg-navy-800 p-1 rounded-xl border border-navy-100 dark:border-navy-700/60 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setEditWartaViewMode('editor')}
                                        className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${editWartaViewMode === 'editor' ? 'bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950 shadow-sm' : 'text-navy-600 dark:text-navy-300 hover:text-navy-900'}`}
                                    >
                                        <Icon name="Edit" className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Editor</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (editWartaEditorRef.current) setEditWartaIsi(editWartaEditorRef.current.getContent());
                                            setEditWartaViewMode('preview');
                                        }}
                                        className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${editWartaViewMode === 'preview' ? 'bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950 shadow-sm' : 'text-navy-600 dark:text-navy-300 hover:text-navy-900'}`}
                                    >
                                        <Icon name="Eye" className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Pratinjau</span>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleUpdateWarta}
                                    disabled={isUpdatingWarta}
                                    className="bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-md disabled:opacity-50"
                                >
                                    {isUpdatingWarta ? (
                                        <>
                                            <Icon name="RefreshCw" className="w-4 h-4 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="Check" className="w-4 h-4" />
                                            <span>Simpan Perubahan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </header>

                        {/* Scrollable Form Body */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6">
                            <div className="max-w-5xl mx-auto w-full pb-20">
                                {editWartaViewMode === 'editor' ? (
                                    <form onSubmit={handleUpdateWarta} className="space-y-6">
                                        {/* Kategori Selector */}
                                        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-100 dark:border-navy-800 shadow-sm">
                                            <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider mb-2.5">
                                                Kategori Berita <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                                {WARTA_CATEGORIES.map(cat => {
                                                    const isSelected = editWartaKategori === cat;
                                                    return (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => setEditWartaKategori(cat)}
                                                            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition border text-center flex items-center justify-center gap-1.5 ${isSelected ? 'bg-navy-900 text-gold-400 border-navy-900 dark:bg-gold-500 dark:text-navy-950 dark:border-gold-500 shadow-sm scale-102' : 'bg-navy-50/50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-600 dark:text-navy-300 border-navy-200/60 dark:border-navy-700'}`}
                                                        >
                                                            <span>{cat}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Judul & Penulis Card */}
                                        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 sm:p-6 border border-navy-100 dark:border-navy-800 shadow-sm space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider mb-1.5">
                                                    Judul Warta / Berita <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editWartaJudul}
                                                    onChange={e => setEditWartaJudul(e.target.value)}
                                                    required
                                                    placeholder="Judul warta..."
                                                    className="w-full px-4 py-3 border border-navy-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white rounded-xl focus:ring-2 focus:ring-gold-500 text-base font-bold shadow-xs"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider">
                                                        Penulis / Redaksi
                                                    </label>
                                                    <span className="text-[11px] text-navy-400">Pilih preset atau ketik manual:</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                    {['Redaksi Warta', 'Pendeta Jemaat', 'Ketua Jemaat', 'Sekretariat Jemaat', 'Dep. Komunikasi', 'Departemen Pemuda'].map(tag => (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => setEditWartaPenulis(tag)}
                                                            className={`text-[11px] px-3 py-1 rounded-lg transition font-medium border ${editWartaPenulis === tag ? 'bg-gold-500 text-navy-950 border-gold-500 font-bold' : 'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-300 border-navy-200/60 dark:border-navy-700'}`}
                                                        >
                                                            + {tag}
                                                        </button>
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={editWartaPenulis}
                                                    onChange={e => setEditWartaPenulis(e.target.value)}
                                                    placeholder="Nama penulis atau redaksi..."
                                                    className="w-full px-4 py-2.5 border border-navy-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white rounded-xl text-sm"
                                                />
                                            </div>

                                            {/* Waktu Publikasi (Langsung vs Terjadwal) */}
                                            <div className="bg-navy-50/70 dark:bg-navy-950/60 p-4 rounded-xl border border-navy-200/60 dark:border-navy-800 space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-navy-800 dark:text-navy-200 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Icon name="Calendar" className="w-3.5 h-3.5 text-gold-500" />
                                                        Jadwal Publikasi
                                                    </label>
                                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${editWartaPublishType === 'now' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'}`}>
                                                        {editWartaPublishType === 'now' ? '🟢 Terbit Langsung' : '🟡 Terjadwal Otomatis'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-navy-800 dark:text-navy-200">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="editWartaPublishType"
                                                            value="now"
                                                            checked={editWartaPublishType === 'now'}
                                                            onChange={() => setEditWartaPublishType('now')}
                                                            className="text-gold-500 focus:ring-gold-500"
                                                        />
                                                        <span>Publikasikan Sekarang</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="editWartaPublishType"
                                                            value="scheduled"
                                                            checked={editWartaPublishType === 'scheduled'}
                                                            onChange={() => {
                                                                setEditWartaPublishType('scheduled');
                                                                if (!editWartaScheduledDate) {
                                                                    const tm = new Date();
                                                                    tm.setDate(tm.getDate() + 1);
                                                                    tm.setHours(8, 0, 0, 0);
                                                                    const pad = n => n < 10 ? '0' + n : n;
                                                                    setEditWartaScheduledDate(`${tm.getFullYear()}-${pad(tm.getMonth() + 1)}-${pad(tm.getDate())}T08:00`);
                                                                }
                                                            }}
                                                            className="text-gold-500 focus:ring-gold-500"
                                                        />
                                                        <span>Jadwalkan Waktu Tayang</span>
                                                    </label>
                                                </div>
                                                {editWartaPublishType === 'scheduled' && (
                                                    <div className="pt-2.5 border-t border-navy-200/50 dark:border-navy-800/80 flex flex-col sm:flex-row sm:items-center gap-2">
                                                        <span className="text-xs text-navy-600 dark:text-navy-400 font-medium shrink-0">Waktu Tayang:</span>
                                                        <input
                                                            type="datetime-local"
                                                            value={editWartaScheduledDate}
                                                            onChange={e => setEditWartaScheduledDate(e.target.value)}
                                                            className="px-3 py-1.5 border border-navy-300 dark:border-navy-700 rounded-lg text-xs bg-white dark:bg-navy-900 text-navy-900 dark:text-white font-bold"
                                                        />
                                                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                                            * Warta akan otomatis tayang saat jam ini tiba.
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Foto Dokumentasi & Sampul Card */}
                                        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 sm:p-6 border border-navy-100 dark:border-navy-800 shadow-sm space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-100 dark:border-navy-800/80 pb-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider">
                                                        Foto Sampul & Dokumentasi Berita
                                                    </label>
                                                    <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">
                                                        Foto pertama (paling kiri) otomatis menjadi <strong>Sampul Utama</strong>. Klik <em>"Set Utama"</em> untuk memilih foto sampul lain, atau ikon tempat sampah untuk menghapus foto tertentu.
                                                    </p>
                                                </div>
                                                <label className="relative cursor-pointer bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 px-4 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition shrink-0 self-start sm:self-auto">
                                                    <Icon name="Upload" className="w-4 h-4" />
                                                    <span>+ Unggah Berkas</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files);
                                                            if (files.length > 0) {
                                                                handleAddEditWartaImages(files);
                                                            }
                                                            e.target.value = '';
                                                        }}
                                                    />
                                                </label>
                                            </div>

                                            {/* Opsi Masukkan URL Sampul Langsung */}
                                            <div className="p-3.5 rounded-xl bg-navy-50/70 dark:bg-navy-950/70 border border-navy-100 dark:border-navy-800">
                                                <label className="block text-xs font-bold text-navy-800 dark:text-gold-400 mb-1">
                                                    URL Sampul (Cover) - Opsional
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        value={editWartaCoverUrlInput}
                                                        onChange={(e) => setEditWartaCoverUrlInput(e.target.value)}
                                                        placeholder="Tempel link Google Drive atau URL gambar (https://...)"
                                                        className="flex-1 p-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-gold-500 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!editWartaCoverUrlInput.trim()) return;
                                                            const driveId = getGoogleDriveFileId(editWartaCoverUrlInput);
                                                            const directUrl = driveId
                                                                ? `https://lh3.googleusercontent.com/d/${driveId}`
                                                                : formatImageUrl(editWartaCoverUrlInput.trim());
                                                            setEditWartaGambarList(prev => [
                                                                { id: `url_edit_${Date.now()}`, url: directUrl, type: 'url' },
                                                                ...prev
                                                            ]);
                                                            setEditWartaCoverUrlInput('');
                                                        }}
                                                        className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs transition cursor-pointer shrink-0"
                                                    >
                                                        + Gunakan Link
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-1">
                                                    💡 <strong>Tips:</strong> Anda dapat menempelkan link Google Drive publik, Google Photos, atau URL gambar web langsung tanpa perlu mengunggah berkas.
                                                </p>
                                            </div>

                                            {/* Grid Foto Warta */}
                                            {editWartaGambarList && editWartaGambarList.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
                                                    {editWartaGambarList.map((item, idx) => {
                                                        const isMain = idx === 0;
                                                        const displayUrl = item.type === 'existing' ? formatImageUrl(item.url) : item.url;
                                                        return (
                                                            <div
                                                                key={item.id || idx}
                                                                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition group bg-navy-950 shadow-sm ${isMain ? 'border-gold-500 ring-2 ring-gold-400/40' : 'border-navy-200 dark:border-navy-700 hover:border-navy-400'}`}
                                                            >
                                                                <img
                                                                    src={displayUrl}
                                                                    className="w-full h-full object-cover"
                                                                    alt="foto warta"
                                                                    referrerPolicy="no-referrer"
                                                                    onError={(e) => handleImageErrorFallback(e, displayUrl)}
                                                                />

                                                                {/* Badge Sampul Utama atau Tombol Set Utama */}
                                                                {isMain ? (
                                                                    <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-gold-500 text-navy-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                                                                        <span>★ Sampul Utama</span>
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSetMainEditWartaImage(idx)}
                                                                        className="absolute top-2 left-2 bg-navy-950/75 hover:bg-gold-500 hover:text-navy-950 text-gold-300 text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-xs transition flex items-center gap-1 shadow border border-gold-500/30"
                                                                        title="Jadikan Foto Ini sebagai Sampul Utama"
                                                                    >
                                                                        <span>⭐ Set Utama</span>
                                                                    </button>
                                                                )}

                                                                {/* Status Label (Lama / Baru) */}
                                                                <span className="absolute bottom-2 left-2 bg-navy-950/80 text-[9px] font-semibold text-white/90 px-2 py-0.5 rounded-md backdrop-blur-xs">
                                                                    {item.type === 'existing' ? 'Foto Saat Ini' : (item.sizeStr || 'Foto Baru')}
                                                                </span>

                                                                {/* Tombol Hapus Foto */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveEditWartaImage(idx)}
                                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center font-bold text-xs shadow-md transition hover:scale-110"
                                                                    title="Hapus Foto Ini"
                                                                >
                                                                    <Icon name="Trash" className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-8 border-2 border-dashed border-navy-200 dark:border-navy-700 rounded-2xl text-center text-xs text-navy-500 dark:text-navy-400 space-y-2">
                                                    <p>Belum ada foto sampul untuk warta ini.</p>
                                                    <p className="text-[11px] text-navy-400">Klik tombol <strong>+ Tambah Foto</strong> di kanan atas untuk mengunggah foto sampul atau dokumentasi berita.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rich Text Editor Card */}
                                        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 sm:p-6 border border-navy-100 dark:border-navy-800 shadow-sm space-y-3">
                                            <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider">
                                                Isi Warta / Artikel Berita <span className="text-red-500">*</span>
                                            </label>
                                            <RichTextEditor
                                                ref={editWartaEditorRef}
                                                initialValue={editWartaIsi}
                                                onChange={(html) => setEditWartaIsi(html)}
                                                onUploadImage={handleUploadInlineImage}
                                                placeholder="Tulis isi warta secara lengkap..."
                                            />
                                        </div>

                                        {/* Bottom Action Footer */}
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm('Tutup editor warta? Perubahan yang belum disimpan akan hilang.')) {
                                                        setEditWartaModal(false);
                                                        setEditingWarta(null);
                                                    }
                                                }}
                                                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-100 font-bold text-sm transition"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isUpdatingWarta}
                                                className="w-full sm:w-auto bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 font-bold px-8 py-3 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
                                            >
                                                {isUpdatingWarta ? "Menyimpan Perubahan..." : "Simpan Perubahan Warta"}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    /* Pratinjau Berita Warta */
                                    <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-10 border border-navy-100 dark:border-navy-800 shadow-lg space-y-6">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gold-500 text-navy-950 shadow-sm">
                                                {editWartaKategori}
                                            </span>
                                            <span className="text-xs text-navy-400">
                                                Pratinjau Tampilan Berita
                                            </span>
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy-950 dark:text-gold-400 leading-tight">
                                            {editWartaJudul || 'Judul Warta'}
                                        </h1>
                                        <div className="flex items-center gap-3 text-xs text-navy-500 border-y border-navy-100 dark:border-navy-800 py-3">
                                            <span className="font-bold text-navy-800 dark:text-gold-300">{editWartaPenulis || 'Redaksi Warta'}</span>
                                            <span>•</span>
                                            <span>{formatIndoDate(editingWarta?.tanggal || new Date().toISOString())}</span>
                                        </div>

                                        {editWartaGambarList && editWartaGambarList.length > 0 && (
                                            <div className="aspect-video rounded-2xl overflow-hidden bg-navy-950 relative shadow-md">
                                                <img
                                                    src={editWartaGambarList[0].type === 'existing' ? formatImageUrl(editWartaGambarList[0].url) : editWartaGambarList[0].url}
                                                    className="w-full h-full object-cover"
                                                    alt="Sampul Berita"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => handleImageErrorFallback(e, editWartaGambarList[0]?.url)}
                                                />
                                                <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-gold-500 text-navy-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg shadow-md">
                                                    ★ Sampul Utama
                                                </span>
                                            </div>
                                        )}

                                        <div
                                            className="prose max-w-none text-navy-800 dark:text-navy-100 warta-content pt-2"
                                            dangerouslySetInnerHTML={{ __html: editWartaIsi || '<p class="text-navy-400 italic">Belum ada konten warta...</p>' }}
                                        />
                                        <div className="pt-6 border-t border-navy-100 dark:border-navy-800 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setEditWartaViewMode('editor')}
                                                className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                                            >
                                                <Icon name="Edit" className="w-3.5 h-3.5" /> Kembali ke Mode Edit
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
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
                                                                    <div className="space-y-4 p-5 glass-box rounded-2xl border border-navy-100/60 shadow-sm h-fit">
                                                                        <h4 className="font-black text-sm text-navy-800 border-b border-navy-50 pb-2">Sekolah Sabat</h4>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Lagu Buka (SS)</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('ssLaguBuka', 'Pilih Lagu Buka Sekolah Sabat')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-amber-300/60"
                                                                                    title="Pilih langsung dari 525 Lagu Sion"
                                                                                >
                                                                                    <span>🎵</span>
                                                                                    <span>Pilih Lagu</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.ssLaguBuka || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('ssLaguBuka', e.target.value)}
                                                                                    placeholder="Contoh: LS 210 - Sucikanlah Harapanku"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('ssLaguBuka', 'Pilih Lagu Buka Sekolah Sabat')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-gold-50 text-gold-700 hover:text-navy-900 border border-gold-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Ayat Inti (SS)</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openVersePicker('ssAyatInti', false, 'Pilih Ayat Inti Sekolah Sabat')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-emerald-300/60"
                                                                                    title="Pilih Kitab, Pasal, dan Ayat Alkitab"
                                                                                >
                                                                                    <span>📖</span>
                                                                                    <span>Pilih Ayat</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.ssAyatInti || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('ssAyatInti', e.target.value)}
                                                                                    placeholder="Contoh: Yohanes 3:16 atau Mazmur 23:1"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openVersePicker('ssAyatInti', false, 'Pilih Ayat Inti Sekolah Sabat')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-700 hover:text-navy-900 border border-emerald-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Lagu Tutup (SS)</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('ssLaguTutup', 'Pilih Lagu Tutup Sekolah Sabat')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-amber-300/60"
                                                                                    title="Pilih langsung dari 525 Lagu Sion"
                                                                                >
                                                                                    <span>🎵</span>
                                                                                    <span>Pilih Lagu</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.ssLaguTutup || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('ssLaguTutup', e.target.value)}
                                                                                    placeholder="Contoh: LS 251 - Tetap Pada-Mu"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('ssLaguTutup', 'Pilih Lagu Tutup Sekolah Sabat')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-gold-50 text-gold-700 hover:text-navy-900 border border-gold-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Outro Tutup Sekolah Sabat</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('ssLaguTema', 'Pilih Outro Tutup Sekolah Sabat')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-amber-300/60"
                                                                                    title="Pilih langsung dari Lagu Sion"
                                                                                >
                                                                                    <span>🎵</span>
                                                                                    <span>Pilih Lagu</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.ssLaguTema || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('ssLaguTema', e.target.value)}
                                                                                    placeholder="Default: LS 168 Kita Memiliki Pengharapan"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('ssLaguTema', 'Pilih Outro Tutup Sekolah Sabat')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-gold-50 text-gold-700 hover:text-navy-900 border border-gold-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-4 p-5 bg-white rounded-xl border border-navy-100/60 shadow-sm">
                                                                        <h4 className="font-black text-sm text-gold-600 border-b border-navy-50 pb-2">Khotbah Umum</h4>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Lagu Pengantar (Khotbah)</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguPengantar', 'Pilih Lagu Pengantar Khotbah')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-amber-300/60"
                                                                                    title="Pilih langsung dari 525 Lagu Sion"
                                                                                >
                                                                                    <span>🎵</span>
                                                                                    <span>Pilih Lagu</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.kLaguPengantar || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('kLaguPengantar', e.target.value)}
                                                                                    placeholder="Default: LS 408 - Berdiam, Berdiam"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguPengantar', 'Pilih Lagu Pengantar Khotbah')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-gold-50 text-gold-700 hover:text-navy-900 border border-gold-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Lagu Sambutan (Khotbah)</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguSambutan', 'Pilih Lagu Sambutan Khotbah')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-amber-300/60"
                                                                                    title="Pilih langsung dari 525 Lagu Sion"
                                                                                >
                                                                                    <span>🎵</span>
                                                                                    <span>Pilih Lagu</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.kLaguSambutan || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('kLaguSambutan', e.target.value)}
                                                                                    placeholder="Default: LS 1 - Di Hadapan Hadirat-Mu"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguSambutan', 'Pilih Lagu Sambutan Khotbah')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-gold-50 text-gold-700 hover:text-navy-900 border border-gold-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Ayat Bersahutan</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openVersePicker('kAyatBersahutan', true, 'Pilih Ayat Bersahutan (No. atau Alkitab)')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-emerald-300/60"
                                                                                    title="Pilih No. Bersahutan 1-72 atau dari Kitab Alkitab"
                                                                                >
                                                                                    <span>📖</span>
                                                                                    <span>Pilih Ayat / No.</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.kAyatBersahutan || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('kAyatBersahutan', e.target.value)}
                                                                                    placeholder="Contoh: No. 12 atau Mazmur 23:1-6"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openVersePicker('kAyatBersahutan', true, 'Pilih Ayat Bersahutan (No. atau Alkitab)')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-700 hover:text-navy-900 border border-emerald-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Lagu Buka (Khotbah)</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguBuka', 'Pilih Lagu Buka Khotbah')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-amber-300/60"
                                                                                    title="Pilih langsung dari 525 Lagu Sion"
                                                                                >
                                                                                    <span>🎵</span>
                                                                                    <span>Pilih Lagu</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.kLaguBuka || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('kLaguBuka', e.target.value)}
                                                                                    placeholder="Contoh: LS 15 - Berlutut Di Hadirat-Mu"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguBuka', 'Pilih Lagu Buka Khotbah')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-gold-50 text-gold-700 hover:text-navy-900 border border-gold-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Lagu Respon Syafaat (Tombol Tengah)</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguRespon', 'Pilih Lagu Respon Syafaat')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-amber-300/60"
                                                                                    title="Pilih langsung dari 525 Lagu Sion"
                                                                                >
                                                                                    <span>🎵</span>
                                                                                    <span>Pilih Lagu</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.kLaguRespon || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('kLaguRespon', e.target.value)}
                                                                                    placeholder="Default: LS 516 - Dengar Ya Tuhan"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguRespon', 'Pilih Lagu Respon Syafaat')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-gold-50 text-gold-700 hover:text-navy-900 border border-gold-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        <div className="border border-navy-100 p-3 rounded-xl bg-navy-50/30 space-y-2">
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <div className="flex items-center space-x-2.5">
                                                                                    <input type="checkbox" checked={editForm.kLaguPujian1_show || false} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian1_show', e.target.checked)} className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500 accent-gold-500" />
                                                                                    <label className="text-[10px] text-navy-600 font-bold uppercase tracking-widest">Lagu Pujian 1 (Sebelum Persembahan)</label>
                                                                                </div>
                                                                                {editForm.kLaguPujian1_show && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => openSongPicker('kLaguPujian1_judul', 'Pilih Lagu Sion untuk Pujian 1')}
                                                                                        className="text-[10.5px] font-bold text-amber-700 bg-amber-100/60 hover:bg-amber-100 px-2 py-0.5 rounded transition cursor-pointer border border-amber-300/60"
                                                                                    >
                                                                                        🎵 Dari Lagu Sion
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            {editForm.kLaguPujian1_show && (
                                                                                <input type="text" value={editForm.kLaguPujian1_judul || ''} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian1_judul', e.target.value)} placeholder="Misal: Koor Pemuda atau LS 10" className="w-full p-2 border border-navy-200 rounded-lg text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-white" />
                                                                            )}
                                                                        </div>

                                                                        <div className="border border-navy-100 p-3 rounded-xl bg-navy-50/30 space-y-2">
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <div className="flex items-center space-x-2.5">
                                                                                    <input type="checkbox" checked={editForm.kLaguPujian2_show || false} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian2_show', e.target.checked)} className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500 accent-gold-500" />
                                                                                    <label className="text-[10px] text-navy-600 font-bold uppercase tracking-widest">Lagu Pujian 2 (Sebelum Cerita Anak)</label>
                                                                                </div>
                                                                                {editForm.kLaguPujian2_show && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => openSongPicker('kLaguPujian2_judul', 'Pilih Lagu Sion untuk Pujian 2')}
                                                                                        className="text-[10.5px] font-bold text-amber-700 bg-amber-100/60 hover:bg-amber-100 px-2 py-0.5 rounded transition cursor-pointer border border-amber-300/60"
                                                                                    >
                                                                                        🎵 Dari Lagu Sion
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            {editForm.kLaguPujian2_show && (
                                                                                <input type="text" value={editForm.kLaguPujian2_judul || ''} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian2_judul', e.target.value)} placeholder="Misal: Vocal Group atau LS 20" className="w-full p-2 border border-navy-200 rounded-lg text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-white" />
                                                                            )}
                                                                        </div>

                                                                        <div className="border border-navy-100 p-3 rounded-xl bg-navy-50/30 space-y-2">
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <div className="flex items-center space-x-2.5">
                                                                                    <input type="checkbox" checked={editForm.kLaguPujian3_show || false} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian3_show', e.target.checked)} className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500 accent-gold-500" />
                                                                                    <label className="text-[10px] text-navy-600 font-bold uppercase tracking-widest">Lagu Pujian 3 (Sesudah Cerita Anak)</label>
                                                                                </div>
                                                                                {editForm.kLaguPujian3_show && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => openSongPicker('kLaguPujian3_judul', 'Pilih Lagu Sion untuk Pujian 3')}
                                                                                        className="text-[10.5px] font-bold text-amber-700 bg-amber-100/60 hover:bg-amber-100 px-2 py-0.5 rounded transition cursor-pointer border border-amber-300/60"
                                                                                    >
                                                                                        🎵 Dari Lagu Sion
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            {editForm.kLaguPujian3_show && (
                                                                                <input type="text" value={editForm.kLaguPujian3_judul || ''} onChange={(e) => handleEditFormChangeSusunan('kLaguPujian3_judul', e.target.value)} placeholder="Misal: Solo atau LS 35" className="w-full p-2 border border-navy-200 rounded-lg text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-white" />
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Ayat Inti</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openVersePicker('kAyatInti', false, 'Pilih Ayat Inti Khotbah')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-emerald-300/60"
                                                                                    title="Pilih Kitab, Pasal, dan Ayat Alkitab"
                                                                                >
                                                                                    <span>📖</span>
                                                                                    <span>Pilih Ayat</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.kAyatInti || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('kAyatInti', e.target.value)}
                                                                                    placeholder="Contoh: Yohanes 3:16"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openVersePicker('kAyatInti', false, 'Pilih Ayat Inti Khotbah')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-700 hover:text-navy-900 border border-emerald-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Lagu Tema - Jemaat Duduk</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguTema', 'Pilih Lagu Tema Khotbah')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-amber-300/60"
                                                                                    title="Pilih dari Lagu Sion atau ketik judul langsung"
                                                                                >
                                                                                    <span>🎵</span>
                                                                                    <span>Pilih Lagu</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.kLaguTema || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('kLaguTema', e.target.value)}
                                                                                    placeholder="Default: Misi Kita atau nomor LS"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguTema', 'Pilih Lagu Tema Khotbah')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-gold-50 text-gold-700 hover:text-navy-900 border border-gold-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Lagu Tutup (Khotbah)</label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguTutup', 'Pilih Lagu Tutup Khotbah')}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition cursor-pointer border border-amber-300/60"
                                                                                    title="Pilih langsung dari 525 Lagu Sion"
                                                                                >
                                                                                    <span>🎵</span>
                                                                                    <span>Pilih Lagu</span>
                                                                                </button>
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.kLaguTutup || ''}
                                                                                    onChange={(e) => handleEditFormChangeSusunan('kLaguTutup', e.target.value)}
                                                                                    placeholder="Contoh: LS 300 - Pandang Pada Yesus"
                                                                                    className="w-full p-2.5 pr-20 border border-navy-200 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSongPicker('kLaguTutup', 'Pilih Lagu Tutup Khotbah')}
                                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-gold-50 text-gold-700 hover:text-navy-900 border border-gold-300/60 rounded-lg shadow-2xs transition cursor-pointer"
                                                                                >
                                                                                    Pilih ▾
                                                                                </button>
                                                                            </div>
                                                                        </div>
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
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <input type="text" value={p.nama || ''} onChange={(e) => handleEditFormChange(i, e.target.value)} className="flex-1 min-w-0 p-2.5 border border-navy-200 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" />
                                                                                    {isRealOfficerName(p.nama, p.tugas) && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => sendWhatsAppOfficerReminder({ nama: p.nama, tugas: p.tugas, sesi: 'Ibadah Perjamuan Kudus (Roti & Anggur)', dateStr: date, waktu: '09:00 - 12:00 WIB', dataPejabat })}
                                                                                            className="w-9 h-9 shrink-0 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
                                                                                            title={`Kirim Pengingat WA ke ${p.nama}`}
                                                                                        >
                                                                                            <Icon name="WhatsApp" className="w-4 h-4 text-white" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="space-y-3 p-4 bg-white rounded-xl border border-navy-100 shadow-sm h-fit">
                                                                        <h4 className="font-black text-sm text-navy-800 border-b border-navy-50 pb-2">Basuh Kaki</h4>
                                                                        {editForm.slice(3, 7).map((p, i) => (
                                                                            <div key={i + 3}>
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">{p.tugas}</label>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <input type="text" value={p.nama || ''} onChange={(e) => handleEditFormChange(i + 3, e.target.value)} className="flex-1 min-w-0 p-2.5 border border-navy-200 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" />
                                                                                    {isRealOfficerName(p.nama, p.tugas) && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => sendWhatsAppOfficerReminder({ nama: p.nama, tugas: p.tugas, sesi: 'Ibadah Perjamuan Kudus (Basuh Kaki)', dateStr: date, waktu: '09:00 - 12:00 WIB', dataPejabat })}
                                                                                            className="w-9 h-9 shrink-0 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
                                                                                            title={`Kirim Pengingat WA ke ${p.nama}`}
                                                                                        >
                                                                                            <Icon name="WhatsApp" className="w-4 h-4 text-white" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="space-y-3 p-4 bg-white rounded-xl border border-navy-100 shadow-sm h-fit">
                                                                        <h4 className="font-black text-sm text-navy-800 border-b border-navy-50 pb-2">Pelayan Perjamuan</h4>
                                                                        {editForm.slice(7, 11).map((p, i) => (
                                                                            <div key={i + 7}>
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">{p.tugas}</label>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <input type="text" value={p.nama || ''} onChange={(e) => handleEditFormChange(i + 7, e.target.value)} className="flex-1 min-w-0 p-2.5 border border-navy-200 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" />
                                                                                    {isRealOfficerName(p.nama, p.tugas) && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => sendWhatsAppOfficerReminder({ nama: p.nama, tugas: p.tugas, sesi: 'Ibadah Perjamuan Kudus (Pelayan Perjamuan)', dateStr: date, waktu: '09:00 - 12:00 WIB', dataPejabat })}
                                                                                            className="w-9 h-9 shrink-0 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
                                                                                            title={`Kirim Pengingat WA ke ${p.nama}`}
                                                                                        >
                                                                                            <Icon name="WhatsApp" className="w-4 h-4 text-white" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="space-y-3 p-4 bg-white rounded-xl border border-navy-100 shadow-sm h-fit">
                                                                        <h4 className="font-black text-sm text-navy-800 border-b border-navy-50 pb-2">Pembersihan Alat</h4>
                                                                        {editForm.slice(11, 16).map((p, i) => (
                                                                            <div key={i + 11}>
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">{p.tugas}</label>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <input type="text" value={p.nama || ''} onChange={(e) => handleEditFormChange(i + 11, e.target.value)} className="flex-1 min-w-0 p-2.5 border border-navy-200 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" />
                                                                                    {isRealOfficerName(p.nama, p.tugas) && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => sendWhatsAppOfficerReminder({ nama: p.nama, tugas: p.tugas, sesi: 'Ibadah Perjamuan Kudus (Pembersihan Alat)', dateStr: date, waktu: '09:00 - 12:00 WIB', dataPejabat })}
                                                                                            className="w-9 h-9 shrink-0 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
                                                                                            title={`Kirim Pengingat WA ke ${p.nama}`}
                                                                                        >
                                                                                            <Icon name="WhatsApp" className="w-4 h-4 text-white" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
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
                                                                    {editForm.map((p, i) => {
                                                                        const sesiLabelMap = {
                                                                            rabu: 'Ibadah Rabu Malam',
                                                                            sekolahSabat: 'Sekolah Sabat',
                                                                            khotbah: 'Khotbah / Ibadah Umum Sabat',
                                                                            diakon: 'Pelayanan Diakon & Diakones',
                                                                            musik: 'Pelayanan Musik'
                                                                        };
                                                                        const waktuLabelMap = {
                                                                            rabu: '19:30 - 21:00 WIB',
                                                                            sekolahSabat: '09:00 - 10:30 WIB',
                                                                            khotbah: '10:45 - 12:00 WIB',
                                                                            diakon: '08:45 - 12:00 WIB',
                                                                            musik: '09:00 - 12:00 WIB'
                                                                        };
                                                                        return (
                                                                            <div key={i} className="space-y-1 p-3 bg-white rounded-xl border border-navy-100 shadow-sm h-fit">
                                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 block mb-1">{p.tugas}</label>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <input type="text" value={p.nama || ''} onChange={(e) => handleEditFormChange(i, e.target.value)} className="flex-1 min-w-0 p-2.5 border border-navy-200 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-gold-500 bg-navy-50/50 transition-colors" />
                                                                                    {isRealOfficerName(p.nama, p.tugas) && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => sendWhatsAppOfficerReminder({
                                                                                                nama: p.nama,
                                                                                                tugas: p.tugas,
                                                                                                sesi: sesiLabelMap[subTab] || 'Ibadah Jemaat',
                                                                                                dateStr: date,
                                                                                                waktu: waktuLabelMap[subTab] || '',
                                                                                                dataPejabat
                                                                                            })}
                                                                                            className="w-9 h-9 shrink-0 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
                                                                                            title={`Kirim Pengingat WA ke ${p.nama}`}
                                                                                        >
                                                                                            <Icon name="WhatsApp" className="w-4 h-4 text-white" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
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
                                                                        <button onClick={() => handleEditClick(date)} className="p-2 lg:p-2.5 text-navy-500 hover:text-gold-500 hover:bg-navy-50 rounded-xl transition-colors" title="Edit Baris & Kirim Pengingat WA"><Icon name="Edit" className="w-3.5 h-3.5 lg:w-4 lg:h-4" /></button>
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

                        {/* Konten Input Baru - Redaksi Studio */}
                        {wartaSubTab === 'input' && (
                            <div className="glass-box rounded-[1.75rem] shadow-sm border border-navy-100/60 p-5 md:p-8 mb-24 bg-white dark:bg-navy-900">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-5 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold">
                                            <Icon name="Warta" className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h1 className="text-xl md:text-2xl font-black text-navy-900 dark:text-gold-400">Ruang Redaksi Warta</h1>
                                                {autosaveNewStatus && (
                                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-md">
                                                        <Icon name="CheckCircle" className="w-3 h-3 text-emerald-500" /> {autosaveNewStatus}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-navy-500 dark:text-navy-400">Tulis, atur kategori, dan publikasikan warta jemaat dengan standar portal berita.</p>
                                        </div>
                                    </div>

                                    {/* Mode Switcher: Tulis vs Pratinjau */}
                                    <div className="flex items-center bg-navy-50 dark:bg-navy-800 p-1 rounded-xl border border-navy-100 dark:border-navy-700/60 self-start sm:self-center">
                                        <button
                                            type="button"
                                            onClick={() => setWartaViewMode('editor')}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${wartaViewMode === 'editor' ? 'bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950 shadow-sm' : 'text-navy-600 dark:text-navy-300 hover:text-navy-900'}`}
                                        >
                                            <Icon name="Edit" className="w-3.5 h-3.5" /> Editor
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (wartaEditorRef.current) setWartaIsi(wartaEditorRef.current.getContent());
                                                setWartaViewMode('preview');
                                            }}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${wartaViewMode === 'preview' ? 'bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950 shadow-sm' : 'text-navy-600 dark:text-navy-300 hover:text-navy-900'}`}
                                        >
                                            <Icon name="Eye" className="w-3.5 h-3.5" /> Pratinjau Berita
                                        </button>
                                    </div>
                                </div>

                                {/* Banner Pemulihan Draft Otomatis */}
                                {draftNewAvailable && (
                                    <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2.5">
                                            <Icon name="Info" className="w-5 h-5 text-amber-500 shrink-0" />
                                            <div>
                                                <p className="font-bold text-amber-900 dark:text-amber-200">Ditemukan draft artikel tersimpan otomatis dari sesi sebelumnya</p>
                                                <p className="text-[11px] text-amber-700 dark:text-amber-300">Judul: "{draftNewAvailable.judul || 'Tanpa Judul'}"</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <button
                                                type="button"
                                                onClick={handleRestoreNewDraft}
                                                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shadow-xs"
                                            >
                                                Pulihkan Draft
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDiscardNewDraft}
                                                className="px-3 py-1.5 bg-white dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-100 rounded-xl font-bold transition border border-navy-200 dark:border-navy-700"
                                            >
                                                Abaikan & Hapus
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {wartaViewMode === 'editor' ? (
                                    <form onSubmit={handleWartaFormSubmit} className="space-y-6">
                                        {/* Kategori Berita Pills */}
                                        <div>
                                            <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider mb-2.5">
                                                Kategori Berita <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                                {WARTA_CATEGORIES.map(cat => {
                                                    const isSelected = wartaKategori === cat;
                                                    return (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => setWartaKategori(cat)}
                                                            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition border text-center flex items-center justify-center gap-1.5 ${isSelected ? 'bg-navy-900 text-gold-400 border-navy-900 dark:bg-gold-500 dark:text-navy-950 dark:border-gold-500 shadow-sm scale-102' : 'bg-navy-50/50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-600 dark:text-navy-300 border-navy-200/60 dark:border-navy-700'}`}
                                                        >
                                                            <span>{cat}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Judul Warta */}
                                        <div>
                                            <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider mb-1.5">
                                                Judul Warta / Berita <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={wartaJudul}
                                                onChange={e => setWartaJudul(e.target.value)}
                                                required
                                                placeholder="Contoh: Jadwal Kebaktian Sabat Raya & Perjamuan Kudus..."
                                                className="w-full px-4 py-3 border border-navy-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white rounded-xl focus:ring-2 focus:ring-gold-500 text-sm font-semibold shadow-xs"
                                            />
                                        </div>

                                        {/* Penulis / Redaksi dengan Presets */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider">
                                                    Penulis / Redaksi
                                                </label>
                                                <span className="text-[11px] text-navy-400">Pilih preset atau ketik manual:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                {['Redaksi Warta', 'Pendeta Jemaat', 'Ketua Jemaat', 'Sekretariat Jemaat', 'Dep. Komunikasi', 'Departemen Pemuda'].map(tag => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => setWartaPenulis(tag)}
                                                        className={`text-[11px] px-3 py-1 rounded-lg transition font-medium border ${wartaPenulis === tag ? 'bg-gold-500 text-navy-950 border-gold-500 font-bold' : 'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-300 border-navy-200/60 dark:border-navy-700'}`}
                                                    >
                                                        + {tag}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                value={wartaPenulis}
                                                onChange={e => setWartaPenulis(e.target.value)}
                                                placeholder="Nama penulis atau redaksi..."
                                                className="w-full px-4 py-2.5 border border-navy-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white rounded-xl text-sm"
                                            />
                                        </div>

                                        {/* Waktu Publikasi (Langsung vs Terjadwal) */}
                                        <div className="bg-navy-50/70 dark:bg-navy-950/60 p-4 rounded-xl border border-navy-200/60 dark:border-navy-800 space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-navy-800 dark:text-navy-200 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Icon name="Calendar" className="w-3.5 h-3.5 text-gold-500" />
                                                    Jadwal Publikasi
                                                </label>
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${wartaPublishType === 'now' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'}`}>
                                                    {wartaPublishType === 'now' ? '🟢 Langsung Tayang' : '🟡 Terjadwal Otomatis'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-navy-800 dark:text-navy-200">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="wartaPublishType"
                                                        value="now"
                                                        checked={wartaPublishType === 'now'}
                                                        onChange={() => setWartaPublishType('now')}
                                                        className="text-gold-500 focus:ring-gold-500"
                                                    />
                                                    <span>Publikasikan Sekarang</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="wartaPublishType"
                                                        value="scheduled"
                                                        checked={wartaPublishType === 'scheduled'}
                                                        onChange={() => {
                                                            setWartaPublishType('scheduled');
                                                            if (!wartaScheduledDate) {
                                                                const tm = new Date();
                                                                tm.setDate(tm.getDate() + 1);
                                                                tm.setHours(8, 0, 0, 0);
                                                                const pad = n => n < 10 ? '0' + n : n;
                                                                setWartaScheduledDate(`${tm.getFullYear()}-${pad(tm.getMonth() + 1)}-${pad(tm.getDate())}T08:00`);
                                                            }
                                                        }}
                                                        className="text-gold-500 focus:ring-gold-500"
                                                    />
                                                    <span>Jadwalkan Waktu Tayang</span>
                                                </label>
                                            </div>
                                            {wartaPublishType === 'scheduled' && (
                                                <div className="pt-2.5 border-t border-navy-200/50 dark:border-navy-800/80 flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <span className="text-xs text-navy-600 dark:text-navy-400 font-medium shrink-0">Waktu Tayang:</span>
                                                    <input
                                                        type="datetime-local"
                                                        value={wartaScheduledDate}
                                                        onChange={e => setWartaScheduledDate(e.target.value)}
                                                        className="px-3 py-1.5 border border-navy-300 dark:border-navy-700 rounded-lg text-xs bg-white dark:bg-navy-900 text-navy-900 dark:text-white font-bold"
                                                    />
                                                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                                        * Warta otomatis muncul ke jemaat saat jam ini tiba.
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Foto Dokumentasi & Sampul Berita */}
                                        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 sm:p-6 border border-navy-100 dark:border-navy-800 shadow-sm space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-100 dark:border-navy-800/80 pb-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider">
                                                        Foto Sampul & Dokumentasi Berita
                                                    </label>
                                                    <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">
                                                        Foto pertama (paling kiri) otomatis menjadi <strong>Sampul Utama</strong>. Klik <em>"Set Utama"</em> pada foto mana pun untuk mengubah sampul berita.
                                                    </p>
                                                </div>
                                                <label className="relative cursor-pointer bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 px-4 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition shrink-0 self-start sm:self-auto">
                                                    <Icon name="Upload" className="w-4 h-4" />
                                                    <span>+ Unggah Berkas</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files);
                                                            if (files.length > 0) {
                                                                handleAddWartaImages(files);
                                                            }
                                                            e.target.value = '';
                                                        }}
                                                    />
                                                </label>
                                            </div>

                                            {/* Opsi Masukkan URL Sampul Langsung */}
                                            <div className="p-3.5 rounded-xl bg-navy-50/70 dark:bg-navy-950/70 border border-navy-100 dark:border-navy-800">
                                                <label className="block text-xs font-bold text-navy-800 dark:text-gold-400 mb-1">
                                                    URL Sampul (Cover) - Opsional
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        value={wartaCoverUrlInput}
                                                        onChange={(e) => setWartaCoverUrlInput(e.target.value)}
                                                        placeholder="Tempel link Google Drive atau URL gambar (https://...)"
                                                        className="flex-1 p-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-gold-500 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!wartaCoverUrlInput.trim()) return;
                                                            const driveId = getGoogleDriveFileId(wartaCoverUrlInput);
                                                            const directUrl = driveId
                                                                ? `https://lh3.googleusercontent.com/d/${driveId}`
                                                                : formatImageUrl(wartaCoverUrlInput.trim());
                                                            setWartaGambarList(prev => [
                                                                { id: `url_${Date.now()}`, url: directUrl, type: 'url' },
                                                                ...prev
                                                            ]);
                                                            setWartaCoverUrlInput('');
                                                        }}
                                                        className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs transition cursor-pointer shrink-0"
                                                    >
                                                        + Gunakan Link
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-1">
                                                    💡 <strong>Tips:</strong> Anda dapat menempelkan link Google Drive publik, Google Photos, atau URL gambar web langsung tanpa perlu mengunggah berkas.
                                                </p>
                                            </div>

                                            {/* Preview Grid Foto Terpilih */}
                                            {wartaGambarList && wartaGambarList.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
                                                    {wartaGambarList.map((item, idx) => {
                                                        const isMain = idx === 0;
                                                        const displayUrl = item.url || (item.file ? URL.createObjectURL(item.file) : (isFileOrBlob(item) ? URL.createObjectURL(item) : ''));
                                                        const sizeStr = item.sizeStr || (isFileOrBlob(item) ? (item.size < 1024 * 1024 ? (item.size / 1024).toFixed(0) + ' KB' : (item.size / (1024 * 1024)).toFixed(1) + ' MB') : '');
                                                        return (
                                                            <div
                                                                key={item.id || idx}
                                                                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition group bg-navy-950 shadow-sm ${isMain ? 'border-gold-500 ring-2 ring-gold-400/40' : 'border-navy-200 dark:border-navy-700 hover:border-navy-400'}`}
                                                            >
                                                                <img src={displayUrl} className="w-full h-full object-cover" alt="preview" />

                                                                {/* Badge Sampul Utama atau Tombol Set Utama */}
                                                                {isMain ? (
                                                                    <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-gold-500 text-navy-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                                                                        <span>★ Sampul Utama</span>
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSetMainWartaImage(idx)}
                                                                        className="absolute top-2 left-2 bg-navy-950/75 hover:bg-gold-500 hover:text-navy-950 text-gold-300 text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-xs transition flex items-center gap-1 shadow border border-gold-500/30"
                                                                        title="Jadikan Foto Ini sebagai Sampul Utama"
                                                                    >
                                                                        <span>⭐ Set Utama</span>
                                                                    </button>
                                                                )}

                                                                {sizeStr && (
                                                                    <span className="absolute bottom-2 left-2 bg-navy-950/80 text-[9px] font-semibold text-white/90 px-2 py-0.5 rounded-md backdrop-blur-xs">
                                                                        {sizeStr}
                                                                    </span>
                                                                )}

                                                                {/* Tombol Hapus Foto */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveWartaImage(idx)}
                                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center font-bold text-xs shadow-md transition hover:scale-110"
                                                                    title="Hapus Foto Ini"
                                                                >
                                                                    <Icon name="Trash" className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-8 border-2 border-dashed border-navy-200 dark:border-navy-700 rounded-2xl bg-navy-50/40 dark:bg-navy-950/40 text-center space-y-3">
                                                    <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center mx-auto">
                                                        <Icon name="Upload" className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <label className="relative cursor-pointer bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-sm transition">
                                                            <Icon name="Image" className="w-4 h-4" />
                                                            <span>Pilih Foto Berita / Sampul</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                multiple
                                                                className="sr-only"
                                                                onChange={(e) => {
                                                                    const files = Array.from(e.target.files);
                                                                    if (files.length > 0) {
                                                                        handleAddWartaImages(files);
                                                                    }
                                                                    e.target.value = '';
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                    <p className="text-xs text-navy-500 dark:text-navy-400">
                                                        Mendukung format PNG (transparansi utuh), JPG, dan WebP hingga 5MB
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Isi Warta / Berita */}
                                        <div>
                                            <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider mb-1.5">
                                                Konten & Isi Warta <span className="text-red-500">*</span>
                                            </label>
                                            <RichTextEditor
                                                ref={wartaEditorRef}
                                                initialValue={wartaIsi}
                                                onChange={(html) => setWartaIsi(html)}
                                                onUploadImage={handleUploadInlineImage}
                                                placeholder="Tuliskan isi berita, susunan acara, jadwal, atau pengumuman di sini..."
                                            />
                                        </div>

                                        {/* Action Bar */}
                                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-navy-100 dark:border-navy-800">
                                            <button
                                                type="submit"
                                                disabled={isSavingWarta}
                                                className="w-full sm:flex-1 bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 shadow-md hover:shadow-lg font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                                            >
                                                <Icon name="Warta" className="w-4 h-4" />
                                                <span>{isSavingWarta ? "Sedang Mempublikasikan..." : "Publikasikan Warta Sekarang"}</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm('Yakin ingin mengosongkan formulir warta ini?')) {
                                                        setWartaJudul('');
                                                        setWartaIsi('');
                                                        setWartaGambarList([]);
                                                        setWartaPenulis('');
                                                        try {
                                                            localStorage.removeItem('PISGAH_WARTA_DRAFT_NEW');
                                                        } catch (e) { }
                                                        setDraftNewAvailable(null);
                                                        setAutosaveNewStatus('');
                                                        if (wartaEditorRef.current) wartaEditorRef.current.setContent('');
                                                    }
                                                }}
                                                className="w-full sm:w-auto px-5 py-3.5 bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-600 dark:text-navy-300 rounded-xl text-xs font-bold transition"
                                            >
                                                Bersihkan Form
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    /* LIVE PREVIEW TAB */
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-gold-50 dark:bg-navy-950/60 border border-gold-200 dark:border-gold-800 text-xs text-navy-800 dark:text-gold-300 flex items-center justify-between">
                                            <span>Pratinjau tampilan warta di halaman pembaca sebelum diterbitkan:</span>
                                            <button
                                                onClick={() => setWartaViewMode('editor')}
                                                className="text-xs font-bold text-navy-900 dark:text-gold-400 underline"
                                            >
                                                ← Kembali ke Editor
                                            </button>
                                        </div>

                                        <article className="border border-navy-100 dark:border-navy-800 rounded-2xl p-6 sm:p-8 bg-white dark:bg-navy-900 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gold-500 text-navy-950">
                                                    {wartaKategori}
                                                </span>
                                                <span className="text-xs text-navy-400">
                                                    {formatIndoDate(new Date())}
                                                </span>
                                            </div>

                                            <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-gold-400 leading-tight mb-4">
                                                {wartaJudul || '(Judul Warta Belum Diisi)'}
                                            </h1>

                                            <p className="text-xs text-navy-500 mb-6 pb-4 border-b border-navy-100">
                                                Ditulis oleh: <strong>{wartaPenulis || 'Redaksi Warta'}</strong>
                                            </p>

                                            {wartaGambarList && wartaGambarList.length > 0 && (
                                                <div className="aspect-video rounded-2xl overflow-hidden bg-navy-950 mb-6 relative shadow-md">
                                                    <img
                                                        src={wartaGambarList[0].url || (wartaGambarList[0].file ? URL.createObjectURL(wartaGambarList[0].file) : (isFileOrBlob(wartaGambarList[0]) ? URL.createObjectURL(wartaGambarList[0]) : ''))}
                                                        className="w-full h-full object-cover"
                                                        alt="Sampul Berita"
                                                    />
                                                    <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-gold-500 text-navy-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg shadow-md">
                                                        ★ Sampul Utama
                                                    </span>
                                                </div>
                                            )}

                                            <div
                                                className="prose max-w-none text-navy-800 dark:text-navy-100 warta-content"
                                                dangerouslySetInnerHTML={{ __html: wartaIsi || '<p class="italic text-navy-400">Belum ada konten warta yang ditulis...</p>' }}
                                            />
                                        </article>

                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setWartaViewMode('editor')}
                                                className="px-5 py-2.5 rounded-xl bg-navy-100 text-navy-700 text-xs font-bold"
                                            >
                                                Kembali Edit
                                            </button>
                                            <button
                                                onClick={handleWartaFormSubmit}
                                                disabled={isSavingWarta}
                                                className="px-6 py-2.5 rounded-xl bg-navy-900 text-gold-400 font-bold text-xs shadow-sm"
                                            >
                                                {isSavingWarta ? "Menyimpan..." : "Publikasikan Sekarang"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Konten Posting (Daftar & Manajemen Warta) */}
                        {wartaSubTab === 'posting' && (
                            <div className="glass-box rounded-[1.75rem] shadow-sm border border-navy-100/60 p-5 md:p-8 bg-white dark:bg-navy-900 mb-24">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-100 dark:border-navy-800 pb-4 mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-navy-900 dark:text-gold-400">Daftar & Manajemen Warta</h3>
                                        <p className="text-xs text-navy-500 dark:text-navy-400">Total {daftarWarta.length} berita & pengumuman telah diterbitkan.</p>
                                    </div>

                                    {/* Search Filter Posting */}
                                    <div className="relative w-full sm:w-64">
                                        <input
                                            type="text"
                                            value={wartaSearchPosting}
                                            onChange={e => setWartaSearchPosting(e.target.value)}
                                            placeholder="Cari judul warta..."
                                            className="w-full text-xs py-2 pl-8 pr-3 border border-navy-200 dark:border-navy-700 rounded-xl bg-navy-50/50 dark:bg-navy-950 text-navy-900 dark:text-white"
                                        />
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-400">
                                            <Icon name="Search" className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </div>

                                {/* Status Filter Tabs */}
                                <div className="flex flex-wrap items-center gap-2 mb-6">
                                    <button
                                        onClick={() => { setWartaStatusFilter('all'); setWartaCurrentPage(1); }}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${wartaStatusFilter === 'all' ? 'bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950 shadow-sm' : 'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300'}`}
                                    >
                                        <span>Semua Status</span>
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${wartaStatusFilter === 'all' ? 'bg-gold-500/20 text-gold-300 dark:bg-navy-900/20 dark:text-navy-950' : 'bg-navy-200/60 dark:bg-navy-700 text-navy-600 dark:text-navy-300'}`}>
                                            {daftarWarta.length}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => { setWartaStatusFilter('published'); setWartaCurrentPage(1); }}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${wartaStatusFilter === 'published' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'}`}
                                    >
                                        <span>🟢 Terpublikasi</span>
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${wartaStatusFilter === 'published' ? 'bg-white/20 text-white' : 'bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200'}`}>
                                            {daftarWarta.filter(w => isWartaPublished(w.tanggal)).length}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => { setWartaStatusFilter('scheduled'); setWartaCurrentPage(1); }}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${wartaStatusFilter === 'scheduled' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'}`}
                                    >
                                        <span>🟡 Terjadwal</span>
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${wartaStatusFilter === 'scheduled' ? 'bg-white/20 text-white' : 'bg-amber-200/60 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200'}`}>
                                            {daftarWarta.filter(w => !isWartaPublished(w.tanggal)).length}
                                        </span>
                                    </button>
                                </div>

                                {daftarWarta.length === 0 ? (
                                    <div className="text-center py-12 text-navy-400">
                                        <Icon name="BookOpen" className="w-12 h-12 mx-auto opacity-30 mb-2" />
                                        <p className="font-semibold text-sm">Belum ada warta yang diterbitkan.</p>
                                    </div>
                                ) : (
                                    <>
                                        {(() => {
                                            const sortedWarta = [...daftarWarta]
                                                .sort((a, b) => (b.rowIndex || 0) - (a.rowIndex || 0))
                                                .filter(w => {
                                                    if (wartaStatusFilter === 'published' && !isWartaPublished(w.tanggal)) return false;
                                                    if (wartaStatusFilter === 'scheduled' && isWartaPublished(w.tanggal)) return false;
                                                    if (!wartaSearchPosting.trim()) return true;
                                                    const q = wartaSearchPosting.toLowerCase();
                                                    return (w.judul || '').toLowerCase().includes(q) || (w.penulis || '').toLowerCase().includes(q);
                                                });

                                            const totalPages = Math.ceil(sortedWarta.length / wartaItemsPerPage);
                                            const startIdx = (wartaCurrentPage - 1) * wartaItemsPerPage;
                                            const paginatedWarta = sortedWarta.slice(startIdx, startIdx + wartaItemsPerPage);

                                            return (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {paginatedWarta.map((warta, idx) => {
                                                        const info = parseWartaInfo(warta);
                                                        const safeUrls = parseGambarUrls(warta.gambarUrl).map(u => formatImageUrl(u)).filter(u => u.startsWith('http') || u.startsWith('data:image'));
                                                        const thumbnailImg = safeUrls.length > 0 ? safeUrls[0] : null;

                                                        return (
                                                            <div key={idx} className="bg-white dark:bg-navy-950/60 border border-navy-100/90 dark:border-navy-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4 relative group">
                                                                {/* Thumbnail Image */}
                                                                <div className="w-full sm:w-44 md:w-full lg:w-40 h-44 sm:h-32 md:h-44 lg:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-navy-950 relative border border-navy-100 dark:border-navy-800">
                                                                    {thumbnailImg ? (
                                                                        <img src={thumbnailImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={info.cleanTitle} referrerPolicy="no-referrer" onError={(e) => handleImageErrorFallback(e, thumbnailImg)} />
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center h-full text-navy-400">
                                                                            <Icon name="Image" className="w-8 h-8 opacity-40 mb-1" />
                                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-navy-500">Tanpa Foto</span>
                                                                        </div>
                                                                    )}
                                                                    <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs ${info.categoryStyle.badge}`}>
                                                                        {info.category}
                                                                    </span>
                                                                    {safeUrls.length > 1 && (
                                                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                                                                            +{safeUrls.length - 1} Foto
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Detail & Konten Warta */}
                                                                <div className="flex-1 flex flex-col min-w-0">
                                                                    <div className="flex items-center gap-1.5 text-[11px] text-navy-500 dark:text-navy-400 mb-1 font-semibold flex-wrap">
                                                                        <Icon name="Calendar" className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                                                                        <span>{formatIndoDateTime(warta.tanggal)}</span>
                                                                        <span>•</span>
                                                                        <span>{info.readingTime}</span>
                                                                        {isWartaPublished(warta.tanggal) ? (
                                                                            <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
                                                                                🟢 Tayang
                                                                            </span>
                                                                        ) : (
                                                                            <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40 animate-pulse">
                                                                                🟡 Terjadwal
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <h4 className="font-extrabold text-navy-950 dark:text-gold-400 text-sm sm:text-base leading-snug line-clamp-2 mb-1.5 group-hover:text-gold-600 transition-colors">
                                                                        {info.cleanTitle}
                                                                    </h4>

                                                                    <p className="text-xs text-navy-600 dark:text-navy-300 line-clamp-2 leading-relaxed mb-3 flex-1">
                                                                        {info.excerpt}
                                                                    </p>

                                                                    {/* Action Buttons (Edit & Hapus) */}
                                                                    <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-3 border-t border-navy-50 dark:border-navy-800">
                                                                        <span className="text-[11px] text-navy-400 dark:text-navy-500 font-bold flex items-center mr-auto">
                                                                            <Icon name="Edit" className="w-3 h-3 mr-1 text-gold-400" />
                                                                            {warta.penulis || 'Admin'}
                                                                        </span>

                                                                        {!isWartaPublished(warta.tanggal) && (
                                                                            <button
                                                                                onClick={() => handlePublishNow(warta)}
                                                                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                                                                                title="Tayangkan warta ini sekarang tanpa menunggu jadwal"
                                                                            >
                                                                                <Icon name="Play" className="w-3.5 h-3.5" /> Tayang Sekarang
                                                                            </button>
                                                                        )}

                                                                        <button
                                                                            onClick={() => handleEditWarta(warta)}
                                                                            className="px-2.5 py-1.5 bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-700 dark:text-gold-300 text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                                                                        >
                                                                            <Icon name="Edit" className="w-3.5 h-3.5 text-gold-500" /> Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteWarta(warta.rowIndex, warta.judul)}
                                                                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                                                                        >
                                                                            <Icon name="Trash" className="w-3.5 h-3.5" /> Hapus
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
                                            const sortedWarta = [...daftarWarta]
                                                .sort((a, b) => (b.rowIndex || 0) - (a.rowIndex || 0))
                                                .filter(w => {
                                                    if (wartaStatusFilter === 'published' && !isWartaPublished(w.tanggal)) return false;
                                                    if (wartaStatusFilter === 'scheduled' && isWartaPublished(w.tanggal)) return false;
                                                    if (!wartaSearchPosting.trim()) return true;
                                                    const q = wartaSearchPosting.toLowerCase();
                                                    return (w.judul || '').toLowerCase().includes(q) || (w.penulis || '').toLowerCase().includes(q);
                                                });

                                            const totalPages = Math.ceil(sortedWarta.length / wartaItemsPerPage);
                                            if (totalPages <= 1) return null;
                                            return (
                                                <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-navy-100 dark:border-navy-800">
                                                    <button
                                                        onClick={() => setWartaCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={wartaCurrentPage === 1}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${wartaCurrentPage === 1 ? 'bg-navy-50 dark:bg-navy-800 text-navy-400 cursor-not-allowed' : 'bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-gold-300 hover:bg-navy-200'}`}
                                                    >
                                                        Sebelumnya
                                                    </button>
                                                    <div className="flex gap-1">
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                            <button
                                                                key={page}
                                                                onClick={() => setWartaCurrentPage(page)}
                                                                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${page === wartaCurrentPage ? 'bg-navy-900 dark:bg-gold-500 text-gold-400 dark:text-navy-950 shadow-sm' : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300'}`}
                                                            >
                                                                {page}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={() => setWartaCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={wartaCurrentPage === totalPages}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${wartaCurrentPage === totalPages ? 'bg-navy-50 dark:bg-navy-800 text-navy-400 cursor-not-allowed' : 'bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-gold-300 hover:bg-navy-200'}`}
                                                    >
                                                        Selanjutnya
                                                    </button>
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
                                            {/* Pencarian Folder untuk Admin */}
                                            <div className="mb-4">
                                                <div className="relative">
                                                    <Icon name="Search" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                                                    <input
                                                        type="text"
                                                        value={adminFolderSearch}
                                                        onChange={e => setAdminFolderSearch(e.target.value)}
                                                        placeholder="Cari folder (misal: Sabat, April, Youth, KKR)..."
                                                        className="w-full pl-8 pr-8 py-2 bg-navy-50 border border-navy-200 rounded-xl text-xs font-medium text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                                    />
                                                    {adminFolderSearch && (
                                                        <button onClick={() => setAdminFolderSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700">
                                                            <Icon name="X" className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Urutkan folder secara kronologis (terbaru di atas) */}
                                            {(() => {
                                                const sortedFolders = [...folderList].sort((a, b) => {
                                                    const da = parseFolderDate(a.name);
                                                    const db = parseFolderDate(b.name);
                                                    if (db !== da) return db - da;
                                                    return b.name.localeCompare(a.name);
                                                });
                                                const filtered = adminFolderSearch.trim()
                                                    ? sortedFolders.filter(f => f.name.toLowerCase().includes(adminFolderSearch.toLowerCase().trim()))
                                                    : sortedFolders;
                                                const displayedFolders = showAllFolders || adminFolderSearch.trim() ? filtered : filtered.slice(0, 8);
                                                return (
                                                    <div className="flex flex-wrap gap-2.5 justify-center">
                                                        {displayedFolders.length === 0 ? (
                                                            <p className="text-xs text-navy-400 py-3">Tidak ada folder yang cocok dengan pencarian.</p>
                                                        ) : (
                                                            displayedFolders.map(folder => (
                                                                <button
                                                                    key={folder.id}
                                                                    onClick={() => setSelectedFolder(folder.id)}
                                                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${selectedFolder === folder.id
                                                                        ? 'bg-navy-900 text-gold-400 shadow-sm scale-105'
                                                                        : 'bg-navy-50 text-navy-700 hover:bg-navy-100 border border-navy-100'
                                                                        }`}
                                                                >
                                                                    📁 {folder.name}
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            {/* Tombol tampilkan semua / sedikit */}
                                            {!adminFolderSearch.trim() && folderList.length > 8 && (
                                                <div className="mt-4 text-center">
                                                    <button
                                                        onClick={() => setShowAllFolders(!showAllFolders)}
                                                        className="text-xs w-full bg-navy-900 text-gold-400 py-2.5 rounded-xl font-bold transition hover:bg-navy-800"
                                                    >
                                                        {showAllFolders ? 'Tampilkan Lebih Sedikit' : `Tampilkan Semua (${folderList.length} Folder)`}
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
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in">
                                <div className="glass-box rounded-3xl p-6 max-w-lg w-full bg-white border border-navy-100 shadow-2xl">
                                    {/* Header Modal */}
                                    <div className="flex justify-between items-center mb-5 pb-3 border-b border-navy-100">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl bg-gold-100 text-gold-600 flex items-center justify-center">
                                                <Icon name="Folder" className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-navy-900">Buat Folder Album Baru</h3>
                                                <p className="text-[11px] text-navy-500">Folder akan otomatis dibuat di Google Drive & dikelompokkan ke Galeri</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowNewFolderModal(false)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition text-lg"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* 1. Pilihan Kategori */}
                                        <div>
                                            <label className="block text-xs font-bold text-navy-700 mb-1.5">
                                                1. Pilih Kategori Galeri:
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {[
                                                    { id: 'sabat', label: 'Ibadah Sabat', icon: 'Church', badge: 'border-amber-400 text-amber-800 bg-amber-50' },
                                                    { id: 'youth', label: 'Pemuda & Anak', icon: 'Users', badge: 'border-indigo-400 text-indigo-800 bg-indigo-50' },
                                                    { id: 'event', label: 'Acara Khusus', icon: 'Calendar', badge: 'border-emerald-400 text-emerald-800 bg-emerald-50' },
                                                    { id: 'sosial', label: 'Bakti Sosial', icon: 'Heart', badge: 'border-rose-400 text-rose-800 bg-rose-50' },
                                                    { id: 'manual', label: 'Lainnya / Manual', icon: 'Edit', badge: 'border-navy-300 text-navy-800 bg-navy-50' },
                                                ].map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewFolderCategory(cat.id);
                                                            if (cat.id === 'manual') setIsManualFolderName(true);
                                                        }}
                                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-1.5 ${newFolderCategory === cat.id
                                                            ? 'ring-2 ring-gold-400 shadow-sm ' + cat.badge
                                                            : 'border-navy-200 text-navy-600 hover:bg-navy-50'
                                                            }`}
                                                    >
                                                        <Icon name={cat.icon} className="w-3.5 h-3.5 shrink-0 text-gold-500" />
                                                        <span className="truncate">{cat.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 2. Tanggal Kegiatan */}
                                        {newFolderCategory !== 'manual' && (
                                            <div>
                                                <label className="block text-xs font-bold text-navy-700 mb-1">
                                                    2. Tanggal Pelaksanaan Kegiatan:
                                                </label>
                                                <input
                                                    type="date"
                                                    value={newFolderDate}
                                                    onChange={e => {
                                                        setIsManualFolderName(false);
                                                        setNewFolderDate(e.target.value);
                                                    }}
                                                    className="w-full p-2.5 bg-navy-50 border border-navy-200 rounded-xl text-xs font-semibold text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                                />
                                            </div>
                                        )}

                                        {/* 3. Tema / Topik Acara */}
                                        <div>
                                            <label className="block text-xs font-bold text-navy-700 mb-1">
                                                3. {newFolderCategory === 'sabat' ? 'Judul Khotbah / Tema Sabat (Opsional):' : 'Nama Acara / Keterangan:'}
                                            </label>
                                            <input
                                                type="text"
                                                value={newFolderTopic}
                                                onChange={e => {
                                                    setIsManualFolderName(false);
                                                    setNewFolderTopic(e.target.value);
                                                }}
                                                placeholder={
                                                    newFolderCategory === 'sabat'
                                                        ? 'Contoh: Firman Hingga Kekekalan'
                                                        : newFolderCategory === 'youth'
                                                            ? 'Contoh: Youth Camp Cibubur'
                                                            : newFolderCategory === 'event'
                                                                ? 'Contoh: KKR Kebangunan Rohani'
                                                                : newFolderCategory === 'sosial'
                                                                    ? 'Contoh: Kunjungan Panti Jompo'
                                                                    : 'Ketik nama folder lengkap...'
                                                }
                                                className="w-full p-2.5 bg-navy-50 border border-navy-200 rounded-xl text-xs font-semibold text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                            />
                                        </div>

                                        {/* 4. Pratinjau Nama Folder Akhir */}
                                        <div className="bg-navy-50 p-3.5 rounded-xl border border-navy-200/80">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[11px] font-bold text-navy-700 flex items-center gap-1">
                                                    <Icon name="Folder" className="w-3.5 h-3.5 text-gold-500" /> Hasil Nama Folder di Google Drive:
                                                </span>
                                                {!isManualFolderName && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsManualFolderName(true)}
                                                        className="text-[10px] text-gold-600 font-bold hover:underline"
                                                    >
                                                        Edit Manual
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                value={newFolderName}
                                                onChange={e => {
                                                    setIsManualFolderName(true);
                                                    setNewFolderName(e.target.value);
                                                }}
                                                className="w-full p-2 bg-white border border-gold-300 rounded-lg text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                            />
                                            <p className="text-[10px] text-navy-500 mt-1.5">
                                                💡 Format ini otomatis dikenali oleh filter kategori & urutan tanggal di Galeri Jemaat.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-navy-100">
                                        <button
                                            onClick={() => setShowNewFolderModal(false)}
                                            className="px-4 py-2 bg-navy-50 hover:bg-navy-100 text-navy-700 rounded-xl text-xs font-bold transition"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleCreateFolder}
                                            disabled={isCreatingFolder || !newFolderName.trim()}
                                            className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isCreatingFolder ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Membuat Folder...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Icon name="PlusCircle" className="w-4 h-4" />
                                                    <span>Buat Folder</span>
                                                </>
                                            )}
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
                            <button onClick={() => scrollPengaturanTabs('left')} className="hidden md:flex p-2.5 bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-700 rounded-xl shadow-sm text-navy-500 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 hover:border-gold-200 shrink-0 transition" title="Scroll Kiri">
                                <Icon name="ChevronLeft" className="w-5 h-5" />
                            </button>
                            <div ref={pengaturanScrollContainerRef} className="glass-box rounded-[1.25rem] flex-1 flex overflow-x-auto border border-navy-100/50 dark:border-navy-700/60 p-2 gap-2 hide-scrollbar scroll-smooth shadow-sm">
                                <button onClick={() => setPengaturanSubTab('video')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'video' ? 'bg-navy-900 dark:bg-gold-500 shadow-sm font-bold text-gold-400 dark:text-navy-950' : 'font-bold text-navy-500 dark:text-gray-400 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-800 dark:hover:text-gray-200'}`}>
                                    Galeri Video
                                </button>
                                <button onClick={() => setPengaturanSubTab('live')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'live' ? 'bg-navy-900 dark:bg-gold-500 shadow-sm font-bold text-gold-400 dark:text-navy-950' : 'font-bold text-navy-500 dark:text-gray-400 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-800 dark:hover:text-gray-200'}`}>
                                    Live
                                </button>
                                <button onClick={() => setPengaturanSubTab('carousel')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'carousel' ? 'bg-navy-900 dark:bg-gold-500 shadow-sm font-bold text-gold-400 dark:text-navy-950' : 'font-bold text-navy-500 dark:text-gray-400 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-800 dark:hover:text-gray-200'}`}>
                                    Carousel
                                </button>
                                <button onClick={() => setPengaturanSubTab('pengumuman')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'pengumuman' ? 'bg-navy-900 dark:bg-gold-500 shadow-sm font-bold text-gold-400 dark:text-navy-950' : 'font-bold text-navy-500 dark:text-gray-400 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-800 dark:hover:text-gray-200'}`}>
                                    Pengumuman
                                </button>
                                <button
                                    onClick={() => setPengaturanSubTab('perjamuan')}
                                    className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'perjamuan' ? 'bg-navy-900 dark:bg-gold-500 shadow-sm font-bold text-gold-400 dark:text-navy-950' : 'font-bold text-navy-500 dark:text-gray-400 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-800 dark:hover:text-gray-200'}`}
                                >
                                    Perjamuan
                                </button>
                                <button
                                    onClick={() => setPengaturanSubTab('perpuluhan')}
                                    className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'perpuluhan' ? 'bg-navy-900 dark:bg-gold-500 shadow-sm font-bold text-gold-400 dark:text-navy-950' : 'font-bold text-navy-500 dark:text-gray-400 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-800 dark:hover:text-gray-200'}`}
                                >
                                    Perpuluhan
                                </button>
                                <button onClick={() => setPengaturanSubTab('kontak')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'kontak' ? 'bg-navy-900 dark:bg-gold-500 shadow-sm font-bold text-gold-400 dark:text-navy-950' : 'font-bold text-navy-500 dark:text-gray-400 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-800 dark:hover:text-gray-200'}`}>
                                    Lokasi
                                </button>
                                <button onClick={() => setPengaturanSubTab('rekening')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'rekening' ? 'bg-navy-900 dark:bg-gold-500 shadow-sm font-bold text-gold-400 dark:text-navy-950' : 'font-bold text-navy-500 dark:text-gray-400 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-800 dark:hover:text-gray-200'}`}>
                                    Rekening & QRIS
                                </button>
                                <button onClick={() => setPengaturanSubTab('password')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors ${pengaturanSubTab === 'password' ? 'bg-navy-900 dark:bg-gold-500 shadow-sm font-bold text-gold-400 dark:text-navy-950' : 'font-bold text-navy-500 dark:text-gray-400 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-800 dark:hover:text-gray-200'}`}>
                                    Password
                                </button>
                                <button onClick={() => setPengaturanSubTab('database')} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${pengaturanSubTab === 'database' ? 'bg-emerald-700 text-white shadow-sm font-bold' : 'font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-navy-800'}`}>
                                    <span>⚡ Supabase Hybrid</span>
                                </button>
                            </div>
                            <button onClick={() => scrollPengaturanTabs('right')} className="hidden md:flex p-2.5 bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-700 rounded-xl shadow-sm text-navy-500 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 hover:border-gold-200 shrink-0 transition" title="Scroll Kanan">
                                <Icon name="ChevronRight" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* --- FORM GALERI VIDEO --- */}
                        {pengaturanSubTab === 'video' && (
                            <div className="bg-white dark:bg-navy-900 border border-navy-100/60 dark:border-navy-700 rounded-[1.5rem] p-6 shadow-sm mt-6">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 dark:border-navy-800 pb-5">
                                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 shadow-inner"><Icon name="Video" className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="font-black text-navy-900 dark:text-gold-400 text-lg tracking-tight">Galeri Video (Beranda)</h3>
                                        <p className="text-xs text-navy-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Daftar Video Carousel Homepage</p>
                                    </div>
                                </div>
                                <form onSubmit={handleSaveCarouselVideos} className="space-y-4">
                                    {editCarouselVideos.map((vid, idx) => {
                                        const ytid = getYouTubeVideoId(vid.url);
                                        const listMatch = vid.url?.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
                                        const isPlaylist = vid.url?.includes('list=') || vid.url?.includes('videoseries') || vid.url?.includes('/playlist');
                                        const isLive = !isPlaylist && vid.url?.includes('live_stream');
                                        const previewThumb = vid.thumbnail || (ytid ? `https://img.youtube.com/vi/${ytid}/mqdefault.jpg` : null);

                                        return (
                                            <div key={idx} className="p-4 sm:p-5 border border-navy-100 dark:border-navy-700 rounded-2xl relative bg-navy-50/40 dark:bg-navy-950/50 space-y-3 shadow-sm">
                                                <div className="flex items-center justify-between border-b border-navy-100/60 dark:border-navy-800 pb-2.5">
                                                    <span className="text-xs font-black uppercase tracking-wider text-navy-800 dark:text-gold-400 flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-xs shadow-inner">
                                                            {idx + 1}
                                                        </span>
                                                        Video #{idx + 1}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            disabled={idx === 0}
                                                            onClick={() => moveCarouselVideo(idx, -1)}
                                                            className={`p-1.5 rounded-lg border text-xs transition ${idx === 0 ? 'text-gray-300 dark:text-gray-600 border-transparent cursor-not-allowed' : 'text-navy-600 dark:text-gray-300 border-navy-200 dark:border-navy-700 hover:bg-white dark:hover:bg-navy-800 shadow-sm'}`}
                                                            title="Pindah ke Atas"
                                                        >
                                                            <Icon name="ChevronUp" className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={idx === editCarouselVideos.length - 1}
                                                            onClick={() => moveCarouselVideo(idx, 1)}
                                                            className={`p-1.5 rounded-lg border text-xs transition ${idx === editCarouselVideos.length - 1 ? 'text-gray-300 dark:text-gray-600 border-transparent cursor-not-allowed' : 'text-navy-600 dark:text-gray-300 border-navy-200 dark:border-navy-700 hover:bg-white dark:hover:bg-navy-800 shadow-sm'}`}
                                                            title="Pindah ke Bawah"
                                                        >
                                                            <Icon name="ChevronDown" className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditCarouselVideos(editCarouselVideos.filter((_, i) => i !== idx))}
                                                            className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/30 rounded-lg p-1.5 transition ml-1"
                                                            title="Hapus Video"
                                                        >
                                                            <Icon name="Trash" className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                                                    {/* Preview Thumbnail Box */}
                                                    <div className="md:col-span-1">
                                                        <label className="block text-xs font-bold text-navy-600 dark:text-gray-300 mb-1">Preview Thumbnail</label>
                                                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-navy-100 dark:bg-navy-900 border border-navy-200 dark:border-navy-700 relative flex items-center justify-center shadow-inner">
                                                            {previewThumb ? (
                                                                <img src={previewThumb} alt="Preview" className="w-full h-full object-cover" />
                                                            ) : isLive ? (
                                                                <div className="text-center p-2">
                                                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-wider block">● LIVE STREAM</span>
                                                                    <span className="text-[9px] text-navy-400 dark:text-gray-400">Siaran Langsung Channel</span>
                                                                </div>
                                                            ) : isPlaylist ? (
                                                                <div className="text-center p-2">
                                                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider flex items-center justify-center gap-1">
                                                                        <Icon name="List" className="w-3.5 h-3.5" /> PLAYLIST
                                                                    </span>
                                                                    <span className="text-[9px] text-navy-400 dark:text-gray-400">Daftar Putar Video</span>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center p-2 text-navy-400 dark:text-gray-500">
                                                                    <Icon name="Video" className="w-6 h-6 mx-auto mb-1 opacity-50" />
                                                                    <span className="text-[10px] font-medium block">Thumbnail Otomatis</span>
                                                                </div>
                                                            )}
                                                            {ytid ? (
                                                                <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-sm text-[9px] text-white px-1.5 py-0.5 rounded font-mono border border-white/20">
                                                                    ID: {ytid}
                                                                </span>
                                                            ) : listMatch ? (
                                                                <span className="absolute bottom-1 right-1 bg-amber-950/80 backdrop-blur-sm text-[9px] text-amber-300 px-1.5 py-0.5 rounded font-mono border border-amber-500/30">
                                                                    List: {listMatch[1].slice(0, 10)}...
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    {/* Form Inputs */}
                                                    <div className="md:col-span-2 space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-bold text-navy-600 dark:text-gray-300 mb-1">Judul Video #{idx + 1}</label>
                                                            <input
                                                                type="text"
                                                                value={vid.title}
                                                                onChange={(e) => {
                                                                    const newArr = [...editCarouselVideos];
                                                                    newArr[idx].title = e.target.value;
                                                                    setEditCarouselVideos(newArr);
                                                                }}
                                                                className="w-full border-2 border-navy-100 dark:border-navy-700 dark:bg-navy-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
                                                                placeholder="Cth: Adventist Church Anthem / Video Khotbah"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-navy-600 dark:text-gray-300 mb-1">URL YouTube (Watch / Share / Live / Embed)</label>
                                                            <input
                                                                type="text"
                                                                value={vid.url}
                                                                onChange={(e) => {
                                                                    const newArr = [...editCarouselVideos];
                                                                    newArr[idx].url = e.target.value;
                                                                    setEditCarouselVideos(newArr);
                                                                }}
                                                                onBlur={(e) => {
                                                                    const formatted = formatYouTubeEmbedUrl(e.target.value);
                                                                    if (formatted && formatted !== e.target.value) {
                                                                        const newArr = [...editCarouselVideos];
                                                                        newArr[idx].url = formatted;
                                                                        setEditCarouselVideos(newArr);
                                                                    }
                                                                }}
                                                                className="w-full border-2 border-navy-100 dark:border-navy-700 dark:bg-navy-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm font-mono focus:border-gold-400 focus:outline-none"
                                                                placeholder="Cth: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                                                                required
                                                            />
                                                            <p className="text-[10px] text-navy-400 dark:text-gray-400 mt-1">Mendukung link YouTube biasa, share youtu.be, live, shorts, atau embed.</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-navy-600 dark:text-gray-300 mb-1">URL Thumbnail Kustom (Opsional)</label>
                                                            <input
                                                                type="text"
                                                                value={vid.thumbnail || ''}
                                                                onChange={(e) => {
                                                                    const newArr = [...editCarouselVideos];
                                                                    newArr[idx].thumbnail = e.target.value;
                                                                    setEditCarouselVideos(newArr);
                                                                }}
                                                                className="w-full border-2 border-navy-100 dark:border-navy-700 dark:bg-navy-900 dark:text-gray-100 rounded-xl px-3 py-1.5 text-xs focus:border-gold-400 focus:outline-none"
                                                                placeholder="Kosongkan untuk otomatis menggunakan thumbnail YouTube HD"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <button type="button" onClick={() => setEditCarouselVideos([...editCarouselVideos, { title: "", url: "" }])} className="w-full border-2 border-dashed border-navy-200 dark:border-navy-700 text-navy-600 dark:text-gray-300 font-bold py-3 px-4 rounded-xl hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-gold-400 transition flex justify-center items-center">
                                        <Icon name="PlusCircle" className="w-4 h-4 mr-2" /> Tambah Video ke Galeri
                                    </button>

                                    <p className="text-[10px] text-navy-500 dark:text-gray-400 mt-2 font-bold leading-relaxed bg-navy-50 dark:bg-navy-950 p-2.5 rounded-lg border border-navy-100 dark:border-navy-800">
                                        Video yang ditambahkan di sini akan tampil secara berurutan pada slider <strong>Galeri Video</strong> di halaman Beranda. Pastikan URL berupa link embed YouTube (<span className="text-gold-600 dark:text-gold-400">https://www.youtube.com/embed/...</span>).
                                    </p>

                                    <button type="submit" disabled={isSavingCarouselVideos} className={`w-full ${isSavingCarouselVideos ? 'bg-navy-300 dark:bg-navy-800 text-navy-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex justify-center items-center mt-6`}>
                                        {isSavingCarouselVideos ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan Galeri Video'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* --- FORM LIVE YOUTUBE URL --- */}
                        {pengaturanSubTab === 'live' && (
                            <div className="bg-white dark:bg-navy-900 border border-navy-100/60 dark:border-navy-700 rounded-[1.5rem] p-6 shadow-sm mt-6">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 dark:border-navy-800 pb-5">
                                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 shadow-inner"><Icon name="Video" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 dark:text-gold-400 text-lg tracking-tight">URL Live Streaming</h3><p className="text-xs text-navy-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Halaman Live Ibadah Gereja</p></div>
                                </div>
                                <form onSubmit={handleSaveLiveUrl}>
                                    <label className="block text-xs font-bold text-navy-700 dark:text-gray-200 mb-2 uppercase tracking-widest">Tautan Live (Embed)</label>
                                    <textarea value={editLiveUrl} onChange={e => setEditLiveUrl(e.target.value)} required rows="3" className="w-full p-3.5 border border-navy-200 dark:border-navy-700 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 dark:bg-navy-950 text-sm font-mono font-medium dark:text-gray-100 shadow-sm leading-relaxed"></textarea>
                                    <p className="text-[10px] text-navy-500 dark:text-gray-400 mt-2 font-bold leading-relaxed bg-navy-50 dark:bg-navy-950 p-2.5 rounded-lg border border-navy-100 dark:border-navy-800">Pastikan URL diawali dengan <br />
                                        <span className="text-gold-600 dark:text-gold-400">https://www.youtube.com/embed/</span>...<br />
                                        <span className="text-gold-600 dark:text-gold-400">https://www.youtube-nocookie.com/embed/</span>...<br />
                                        <span className="text-gold-600 dark:text-gold-400">https://www.youtube.com/embed/live_stream?channel=</span>...
                                    </p>
                                    <button type="submit" disabled={isSavingLiveUrl} className="w-full bg-navy-900 dark:bg-gold-500 hover:bg-navy-800 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-900 font-bold py-3.5 rounded-xl transition-all mt-6 flex justify-center items-center shadow-md hover:shadow-lg">
                                        {isSavingLiveUrl ? 'Menyimpan...' : 'Simpan URL Live'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* --- FORM Hero-Image --- */}
                        {pengaturanSubTab === 'carousel' && (
                            <>
                                <div className="bg-white dark:bg-navy-900 border border-navy-100/60 dark:border-navy-700 rounded-[1.5rem] p-6 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-navy-50 dark:border-navy-800 pb-5 mb-6 gap-3">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 shadow-inner">
                                                <Icon name="Image" className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-navy-900 dark:text-gold-400 text-lg tracking-tight">Hero Banner & Caption Dinamis</h3>
                                                <p className="text-xs text-navy-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Kelola Gambar & Teks Tiap Slide Homepage</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border w-max ${editHeroImages.length >= 10 ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-gold-300 border-navy-100 dark:border-navy-700'}`}>
                                            {editHeroImages.length} / 10 Slide Aktif
                                        </span>
                                    </div>

                                    {/* List Slide Cards */}
                                    <div className="space-y-6 mb-6">
                                        {editHeroImages.map((rawSlide, idx) => {
                                            const slide = typeof rawSlide === 'object' && rawSlide !== null ? rawSlide : { url: rawSlide };
                                            const fallback = DEFAULT_HERO_CAPTIONS[idx % DEFAULT_HERO_CAPTIONS.length] || DEFAULT_HERO_CAPTIONS[0];
                                            const imgUrl = slide.url || slide.imageUrl || '';
                                            const badgeVal = slide.badge !== undefined ? slide.badge : fallback.badge;
                                            const titleVal = slide.title !== undefined ? slide.title : fallback.title;
                                            const subtitleVal = slide.subtitle !== undefined ? slide.subtitle : fallback.subtitle;

                                            return (
                                                <div key={idx} className="p-4 sm:p-5 border-2 border-navy-100 dark:border-navy-700 rounded-2xl bg-navy-50/30 dark:bg-navy-950/50 shadow-sm hover:shadow-md transition-all">
                                                    <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-black">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="text-sm font-black text-navy-800 dark:text-white uppercase tracking-tight">
                                                                Slide #{idx + 1}
                                                            </span>
                                                            {imgUrl.startsWith('data:image') && (
                                                                <span className="text-[10px] font-black tracking-widest text-gold-500 bg-gold-50 dark:bg-gold-950 px-2 py-0.5 rounded-full border border-gold-200 dark:border-gold-800">
                                                                    BARU
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                disabled={idx === 0}
                                                                onClick={() => moveHeroSlide(idx, -1)}
                                                                className="p-1.5 rounded-lg border border-navy-200 dark:border-navy-700 text-navy-600 dark:text-gray-300 hover:bg-white dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                                                title="Geser Naik"
                                                            >
                                                                <Icon name="ChevronLeft" className="w-3.5 h-3.5 rotate-90" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={idx === editHeroImages.length - 1}
                                                                onClick={() => moveHeroSlide(idx, 1)}
                                                                className="p-1.5 rounded-lg border border-navy-200 dark:border-navy-700 text-navy-600 dark:text-gray-300 hover:bg-white dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                                                title="Geser Turun"
                                                            >
                                                                <Icon name="ChevronRight" className="w-3.5 h-3.5 rotate-90" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveHeroImage(idx)}
                                                                className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ml-1"
                                                                title="Hapus Slide Ini"
                                                            >
                                                                <Icon name="Trash" className="w-3.5 h-3.5" /> Hapus
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                                        {/* Preview & Ganti Gambar (Col 4) */}
                                                        <div className="lg:col-span-4 flex flex-col space-y-2.5">
                                                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-navy-200 dark:border-navy-700 bg-navy-900 shadow-inner group/img">
                                                                {imgUrl ? (
                                                                    <img src={formatImageUrl(imgUrl)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center text-navy-400">
                                                                        <Icon name="Image" className="w-8 h-8 mb-1 opacity-50" />
                                                                        <span className="text-[11px] font-bold">Belum Ada Gambar</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex gap-2">
                                                                    <label className="flex-1 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-800 text-navy-700 dark:text-gray-200 text-xs font-bold py-2 px-3 rounded-xl border border-navy-200 dark:border-navy-700 flex items-center justify-center cursor-pointer transition shadow-sm">
                                                                        <Icon name="Upload" className="w-3.5 h-3.5 mr-1 text-navy-500 dark:text-gold-400" />
                                                                        Ganti File
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files && e.target.files[0];
                                                                                if (!file) return;
                                                                                const reader = new FileReader();
                                                                                reader.readAsDataURL(file);
                                                                                reader.onload = (ev) => {
                                                                                    const imgEl = new Image();
                                                                                    imgEl.src = ev.target.result;
                                                                                    imgEl.onload = () => {
                                                                                        const MAX_WIDTH = 1200;
                                                                                        let w = imgEl.width;
                                                                                        let h = imgEl.height;
                                                                                        if (w > MAX_WIDTH) { h *= MAX_WIDTH / w; w = MAX_WIDTH; }
                                                                                        const cvs = document.createElement('canvas');
                                                                                        cvs.width = w; cvs.height = h;
                                                                                        cvs.getContext('2d').drawImage(imgEl, 0, 0, w, h);
                                                                                        updateHeroSlide(idx, 'url', cvs.toDataURL('image/webp', 0.6));
                                                                                    };
                                                                                };
                                                                            }}
                                                                        />
                                                                    </label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newUrl = prompt("Masukkan URL gambar baru (https://...):", imgUrl.startsWith('data:image') ? '' : imgUrl);
                                                                            if (newUrl !== null && newUrl.trim()) {
                                                                                updateHeroSlide(idx, 'url', newUrl.trim());
                                                                            }
                                                                        }}
                                                                        className="bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-800 text-navy-700 dark:text-gray-200 text-xs font-bold py-2 px-3 rounded-xl border border-navy-200 dark:border-navy-700 flex items-center justify-center transition shadow-sm"
                                                                        title="Ganti URL via Dialog Popup"
                                                                    >
                                                                        URL Popup
                                                                    </button>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[11px] font-bold text-navy-600 dark:text-gray-400 mb-1">
                                                                        URL Link Gambar:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={imgUrl.startsWith('data:image') ? '' : imgUrl}
                                                                        onChange={(e) => updateHeroSlide(idx, 'url', e.target.value)}
                                                                        placeholder={imgUrl.startsWith('data:image') ? 'File lokal terupload (siap simpan ke Drive). Atau tempel link baru...' : 'Tempel URL Gambar (https://...) atau Link Google Drive di sini'}
                                                                        className="w-full border-2 border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-900 dark:text-white rounded-xl px-3 py-1.5 text-xs focus:border-gold-400 focus:outline-none transition-colors"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Caption Form (Col 8) */}
                                                        <div className="lg:col-span-8 space-y-3">
                                                            <div>
                                                                <label className="block text-xs font-bold text-navy-700 dark:text-gray-300 mb-1">
                                                                    Label Badge (Kapsul Kecil di Atas Judul)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={badgeVal}
                                                                    onChange={(e) => updateHeroSlide(idx, 'badge', e.target.value)}
                                                                    placeholder="Cth: Gereja Masehi Advent Hari Ketujuh"
                                                                    className="w-full border-2 border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-900 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:border-gold-400 focus:outline-none transition-colors"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-navy-700 dark:text-gray-300 mb-1">
                                                                    Judul Slide Utama (Besar)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={titleVal}
                                                                    onChange={(e) => updateHeroSlide(idx, 'title', e.target.value)}
                                                                    placeholder="Cth: Temukan Damai Bersama Tuhan"
                                                                    className="w-full border-2 border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-900 dark:text-white rounded-xl px-3.5 py-2 text-sm font-bold focus:border-gold-400 focus:outline-none transition-colors"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-navy-700 dark:text-gray-300 mb-1">
                                                                    Subjudul / Deskripsi Kalimat
                                                                </label>
                                                                <textarea
                                                                    rows="2"
                                                                    value={subtitleVal}
                                                                    onChange={(e) => updateHeroSlide(idx, 'subtitle', e.target.value)}
                                                                    placeholder="Cth: Jemaat Pisgah BISDAC, mari beribadah, melayani, dan bertumbuh dalam iman."
                                                                    className="w-full border-2 border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-900 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:border-gold-400 focus:outline-none transition-colors leading-relaxed"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Action Buttons: Tambah & Simpan */}
                                    <form onSubmit={handleSaveHeroImage} className="space-y-4 pt-2 border-t border-navy-50 dark:border-navy-800">
                                        {editHeroImages.length >= 10 ? (
                                            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-xl text-center">
                                                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                                                    Batas maksimal 10 slide carousel telah tercapai. Hapus slide yang tidak digunakan jika ingin menambahkan slide baru.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                                                <label className="flex-1 flex items-center justify-center bg-navy-50 dark:bg-navy-800 border-2 border-dashed border-navy-200 dark:border-navy-700 rounded-xl py-3 px-4 cursor-pointer hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-navy-700 transition-all group">
                                                    <Icon name="Upload" className="w-5 h-5 mr-2 text-navy-400 group-hover:text-gold-500 transition-colors" />
                                                    <span className="text-sm font-bold text-navy-600 dark:text-gray-200 group-hover:text-gold-600 transition-colors">+ Upload Slide Baru ({editHeroImages.length}/10)</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleHeroFileUpload} />
                                                </label>
                                                <button type="button" onClick={handleAddHeroUrl} className="flex-1 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-navy-600 dark:text-gray-200 font-bold py-3 px-4 rounded-xl hover:bg-navy-50 dark:hover:bg-navy-800 transition flex justify-center items-center">
                                                    <Icon name="PlusCircle" className="w-4 h-4 mr-2" />
                                                    + Tambah Slide via URL
                                                </button>
                                            </div>
                                        )}
                                        <button type="submit" disabled={isSavingHero} className={`w-full ${isSavingHero ? 'bg-navy-300 dark:bg-navy-700 text-navy-500 dark:text-gray-400 cursor-not-allowed' : 'bg-navy-900 dark:bg-gold-500 hover:bg-navy-800 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex justify-center items-center mt-6`}>
                                            {isSavingHero ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan Slide & Caption...</> : 'Simpan Perubahan Banner & Caption'}
                                        </button>
                                    </form>
                                </div>
                                {/* --- FORM CAROUSEL EVENTS (ACARA TERDEKAT) --- */}
                                <div className="bg-white dark:bg-navy-900 border border-navy-100/60 dark:border-navy-700 rounded-[1.5rem] p-6 shadow-sm mt-6">
                                    <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 dark:border-navy-800 pb-5">
                                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 shadow-inner"><Icon name="Calendar" className="w-6 h-6" /></div>
                                        <div><h3 className="font-black text-navy-900 dark:text-gold-400 text-lg tracking-tight">Acara Terdekat</h3><p className="text-xs text-navy-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Acara pada Jadwal & Home</p></div>
                                    </div>
                                    <form onSubmit={handleSaveCarouselEvents} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {editCarouselEvents.map((evt, idx) => (
                                                <div key={idx} className="p-4 sm:p-5 border border-navy-100 dark:border-navy-700 rounded-2xl bg-white dark:bg-navy-950/60 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between">
                                                    <div className="flex items-center justify-between border-b border-navy-50 dark:border-navy-800 pb-2.5 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 rounded-full bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-black">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="text-xs font-black text-navy-800 dark:text-white tracking-tight uppercase">
                                                                Acara #{idx + 1}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditCarouselEvents(editCarouselEvents.filter((_, i) => i !== idx))}
                                                            className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1"
                                                            title="Hapus Acara ini"
                                                        >
                                                            <Icon name="Trash" className="w-3.5 h-3.5" /> Hapus
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-bold text-navy-600 dark:text-gray-300 mb-1">Tanggal Acara</label>
                                                            <input type="text" value={evt.dateStr} onChange={(e) => { const newArr = [...editCarouselEvents]; newArr[idx].dateStr = e.target.value; setEditCarouselEvents(newArr); }} className="w-full border-2 border-navy-100 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" placeholder="Cth: 31 OKTOBER 2026" required />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-navy-600 dark:text-gray-300 mb-1">Judul Acara</label>
                                                            <input type="text" value={evt.title} onChange={(e) => { const newArr = [...editCarouselEvents]; newArr[idx].title = e.target.value; setEditCarouselEvents(newArr); }} className="w-full border-2 border-navy-100 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" placeholder="Cth: Perayaan Ulang Tahun Jemaat" required />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-navy-600 dark:text-gray-300 mb-1">Lokasi</label>
                                                            <input type="text" value={evt.location} onChange={(e) => { const newArr = [...editCarouselEvents]; newArr[idx].location = e.target.value; setEditCarouselEvents(newArr); }} className="w-full border-2 border-navy-100 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" placeholder="Cth: Gedung Gereja Pisgah" required />
                                                        </div>
                                                        <div className="pt-1">
                                                            <label className="block text-xs font-bold text-navy-600 dark:text-gray-300 mb-1.5">Gambar Background Acara <span className="text-navy-400 dark:text-gray-400 font-normal">(Opsional)</span></label>

                                                            {/* Preview Gambar jika ada */}
                                                            {evt.imageUrl && (
                                                                <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden mb-3 border border-navy-100 dark:border-navy-700 shadow-sm bg-navy-900 group/img">
                                                                    <img
                                                                        src={formatImageUrl(evt.imageUrl)}
                                                                        alt={`Preview ${evt.title || 'Acara'}`}
                                                                        className="w-full h-full object-cover"
                                                                        referrerPolicy="no-referrer"
                                                                        onError={(e) => handleImageErrorFallback(e, evt.imageUrl)}
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                                                                    <div className="absolute bottom-2.5 left-3 text-white text-xs font-bold drop-shadow">
                                                                        {evt.imageUrl.startsWith('data:image') ? (
                                                                            <span className="bg-gold-500/90 text-navy-950 px-2.5 py-1 rounded-md text-[11px] font-black tracking-wide shadow">
                                                                                BARU DIUPLOAD (Siap Simpan)
                                                                            </span>
                                                                        ) : (
                                                                            <span className="bg-black/60 backdrop-blur-sm text-gray-200 px-2 py-0.5 rounded text-[11px]">
                                                                                Gambar Aktif
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newArr = [...editCarouselEvents];
                                                                            newArr[idx].imageUrl = '';
                                                                            setEditCarouselEvents(newArr);
                                                                        }}
                                                                        className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-lg shadow-md transition-all flex items-center gap-1 text-xs font-bold backdrop-blur-sm"
                                                                        title="Hapus gambar ini"
                                                                    >
                                                                        <Icon name="Trash" className="w-3.5 h-3.5" /> Hapus
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* Pilihan Upload Langsung atau Input URL */}
                                                            <div className="space-y-2">
                                                                <label className="flex items-center justify-center bg-navy-50 dark:bg-navy-800 border-2 border-dashed border-navy-200 dark:border-navy-700 rounded-xl py-2.5 px-4 cursor-pointer hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-navy-700 transition-all group">
                                                                    <Icon name="Upload" className="w-4 h-4 mr-2 text-navy-400 group-hover:text-gold-500 transition-colors" />
                                                                    <span className="text-xs font-bold text-navy-600 dark:text-gray-200 group-hover:text-gold-600 transition-colors">
                                                                        {evt.imageUrl ? 'Ganti Gambar (Upload dari Galeri/File)...' : 'Upload Gambar dari Galeri/File...'}
                                                                    </span>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={(e) => handleEventFileUpload(e, idx)}
                                                                    />
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    value={evt.imageUrl && evt.imageUrl.startsWith('data:image') ? '' : (evt.imageUrl || '')}
                                                                    onChange={(e) => {
                                                                        const newArr = [...editCarouselEvents];
                                                                        newArr[idx].imageUrl = e.target.value;
                                                                        setEditCarouselEvents(newArr);
                                                                    }}
                                                                    className="w-full border-2 border-navy-100 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:border-gold-400 focus:outline-none"
                                                                    placeholder={evt.imageUrl && evt.imageUrl.startsWith('data:image') ? 'Gambar lokal telah diupload. Atau tempel URL gambar baru di sini...' : 'Atau tempel URL Gambar / Link Google Drive (https://...)'}
                                                                />
                                                                <p className="text-[11px] text-navy-500 dark:text-gray-400 leading-normal">
                                                                    💡 <strong>Bisa upload langsung</strong> dari HP/PC (seperti carousel), atau <strong>tempel link Google Drive</strong> (pastikan link diset publik: <em>&quot;Siapa saja yang memiliki link&quot;</em>).
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button type="button" onClick={() => setEditCarouselEvents([...editCarouselEvents, { dateStr: "", title: "", location: "", imageUrl: "" }])} className="w-full border-2 border-dashed border-navy-200 dark:border-navy-700 text-navy-600 dark:text-gray-300 font-bold py-3 px-4 rounded-xl hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-gold-400 transition flex justify-center items-center">
                                            <Icon name="PlusCircle" className="w-4 h-4 mr-2" /> Tambah Acara
                                        </button>

                                        <button type="submit" disabled={isSavingCarouselEvents} className={`w-full ${isSavingCarouselEvents ? 'bg-navy-300 dark:bg-navy-800 text-navy-500 dark:text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex justify-center items-center mt-6`}>
                                            {isSavingCarouselEvents ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan Acara Terdekat'}
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}

                        {/* --- FORM PENGUMUMAN --- */}
                        {pengaturanSubTab === 'pengumuman' && (
                            <div className="bg-white dark:bg-navy-900 border border-navy-100/60 dark:border-navy-700 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 dark:border-navy-800 pb-5">
                                    <div className="w-12 h-12 bg-gold-50 dark:bg-gold-900/40 rounded-full flex items-center justify-center text-gold-600 dark:text-gold-400 shadow-inner"><Icon name="Megaphone" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 dark:text-gold-400 text-lg tracking-tight">Pengumuman Jemaat</h3><p className="text-xs text-navy-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Tampil di Halaman Depan</p></div>
                                </div>
                                <form onSubmit={handleSavePengumuman} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Judul Pengumuman</label>
                                        <input type="text" value={editPengumuman.header} onChange={e => setEditPengumuman({ ...editPengumuman, header: e.target.value })} placeholder="Misal: Pengumuman Penting" className="w-full p-3.5 border border-navy-200 dark:border-navy-700 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 dark:bg-navy-950 dark:text-white text-sm font-medium shadow-sm mb-4" />



                                        <label className="block text-xs font-bold text-navy-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Isi Pengumuman</label>
                                        <RichTextEditor
                                            ref={pengumumanEditorRef}
                                            initialValue={editPengumuman.isi}
                                            onChange={(html) => setEditPengumuman({ ...editPengumuman, isi: html })}
                                            placeholder="Kosongkan isi untuk menyembunyikan kotak pengumuman..."
                                        />
                                        <p className="text-[10px] text-navy-500 dark:text-gray-400 mt-2 font-bold leading-relaxed bg-navy-50 dark:bg-navy-950 p-2.5 rounded-lg border border-navy-100 dark:border-navy-800 uppercase text-center">Hapus semua isi teks untuk menyembunyikan pengumuman dari layar utama.</p>
                                    </div>
                                    <button type="submit" disabled={isSavingPengumuman} className={`w-full ${isSavingPengumuman ? 'bg-navy-300 dark:bg-navy-800 text-navy-500 dark:text-gray-400 cursor-not-allowed' : 'bg-navy-900 dark:bg-gold-500 hover:bg-navy-800 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex justify-center items-center`}>
                                        {isSavingPengumuman ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan Pengumuman'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* --- FORM LOKASI & PETA --- */}
                        {pengaturanSubTab === 'kontak' && (
                            <div className="bg-white dark:bg-navy-900 border border-navy-100/60 dark:border-navy-700 rounded-[1.5rem] p-6 shadow-sm animate-fade-in">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 dark:border-navy-800 pb-5">
                                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-inner"><Icon name="Map" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 dark:text-gold-400 text-lg tracking-tight">Lokasi Gereja</h3><p className="text-xs text-navy-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Alamat dan Google Maps</p></div>
                                </div>
                                <form onSubmit={handleSaveKontakGereja} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Alamat Lengkap</label>
                                        <textarea value={editKontakGereja.alamat} onChange={e => setEditKontakGereja({ ...editKontakGereja, alamat: e.target.value })} required rows="3" placeholder="Jl. Raya Contoh No. 123, Kelurahan, Kecamatan..." className="w-full p-3.5 border border-navy-200 dark:border-navy-700 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 dark:bg-navy-950 dark:text-white text-sm font-medium shadow-sm mb-4"></textarea>

                                        <label className="block text-xs font-bold text-navy-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Tautan Buka di Aplikasi Maps (Direct Link)</label>
                                        <input type="url" value={editKontakGereja.mapsAppUrl || ''} onChange={e => setEditKontakGereja({ ...editKontakGereja, mapsAppUrl: e.target.value })} placeholder="https://maps.app.goo.gl/..." className="w-full p-3.5 border border-navy-200 dark:border-navy-700 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 dark:bg-navy-950 dark:text-white text-sm font-medium shadow-sm mb-4" />

                                        <label className="block text-xs font-bold text-navy-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Tautan Peta (Google Maps Embed / iframe)</label>
                                        <textarea value={editKontakGereja.mapUrl} onChange={e => setEditKontakGereja({ ...editKontakGereja, mapUrl: e.target.value })} required rows="3" placeholder="https://www.google.com/maps/embed?pb=..." className="w-full p-3.5 border border-navy-200 dark:border-navy-700 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 dark:bg-navy-950 dark:text-white text-sm font-mono shadow-sm mb-4"></textarea>

                                        <label className="block text-xs font-bold text-navy-700 dark:text-gray-300 mb-2 uppercase tracking-widest">URL Gambar Banner Informasi (Opsional)</label>
                                        <input type="url" value={editKontakGereja.informasiImageUrl || ''} onChange={e => setEditKontakGereja({ ...editKontakGereja, informasiImageUrl: e.target.value })} placeholder="URL Gambar Banner Informasi (Opsional)" className="w-full p-3.5 border border-navy-200 dark:border-navy-700 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 dark:bg-navy-950 dark:text-white text-sm font-medium shadow-sm" />

                                        <p className="text-[10px] text-navy-500 dark:text-gray-400 mt-2 font-medium leading-relaxed bg-navy-50 dark:bg-navy-950 p-3 rounded-xl border border-navy-100 dark:border-navy-800 shadow-inner">
                                            <b>Cara mendapatkan link Peta Embed:</b><br />1. Cari gereja Anda di Google Maps (via Browser PC).<br />2. Klik tombol <b>Bagikan (Share)</b> &gt; pilih tab <b>Sematkan Peta (Embed a map)</b>.<br />3. Salin URL/Tautan yang ada di dalam tanda kutip <span className="text-gold-600 dark:text-gold-400 font-mono font-bold">src="..."</span> dan tempelkan pada kolom di atas.
                                        </p>
                                    </div>
                                    <button type="submit" disabled={isSavingKontak} className={`w-full ${isSavingKontak ? 'bg-navy-300 dark:bg-navy-800 text-navy-500 dark:text-gray-400 cursor-not-allowed' : 'bg-navy-900 dark:bg-gold-500 hover:bg-navy-800 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all flex justify-center items-center mt-6`}>
                                        {isSavingKontak ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan Lokasi Peta'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* --- FORM REKENING & QRIS --- */}
                        {pengaturanSubTab === 'rekening' && (
                            <div className="bg-white dark:bg-navy-900 border border-navy-100/60 dark:border-navy-700 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 border-b border-navy-50 dark:border-navy-800 pb-5">
                                    <div className="w-12 h-12 bg-navy-50 dark:bg-navy-800 rounded-full flex items-center justify-center text-navy-900 dark:text-gold-400 shadow-inner shrink-0"><Icon name="CreditCard" className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="font-black text-navy-900 dark:text-gold-400 text-lg tracking-tight">Pengaturan Rekening & QRIS</h3>
                                        <p className="text-xs text-navy-500 dark:text-gray-400 font-medium leading-relaxed mt-1">Ubah nomor rekening dan gambar QRIS untuk menu Persembahan.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveRekening} className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-navy-900 dark:text-white text-sm flex items-center"><Icon name="CreditCard" className="w-4 h-4 mr-2 text-gold-500" />Daftar Opsi Pembayaran</h4>
                                            <button type="button" onClick={handleAddRekening} className="text-xs bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-gold-400 font-bold px-3 py-1.5 rounded-lg flex items-center transition"><Icon name="Plus" className="w-3.5 h-3.5 mr-1" /> Tambah Opsi</button>
                                        </div>
                                        {editDaftarRekening.length === 0 ? (
                                            <div className="text-center py-4 text-xs text-navy-500 dark:text-gray-400 bg-navy-50/50 dark:bg-navy-950 rounded-xl border border-navy-100 dark:border-navy-800">Belum ada pengaturan Rekening & QRIS.</div>
                                        ) : (
                                            <div className="space-y-6">
                                                {editDaftarRekening.map((rek, idx) => (
                                                    <div key={rek.id || idx} className="bg-navy-50/50 dark:bg-navy-950/60 p-5 rounded-2xl border border-navy-200 dark:border-navy-700 relative group shadow-sm flex flex-col md:flex-row gap-6">
                                                        <button type="button" onClick={() => handleRemoveRekening(rek.id)} className="absolute -top-3 -right-3 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 p-2 rounded-full hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100 shadow-md z-10"><Icon name="X" className="w-4 h-4" /></button>

                                                        {/* QRIS Input Section */}
                                                        <div className="w-full md:w-1/3 flex flex-col gap-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Icon name="Smartphone" className="w-4 h-4 text-navy-600 dark:text-gold-400" />
                                                                <span className="text-xs font-bold text-navy-800 dark:text-gray-200">QRIS (Opsional)</span>
                                                            </div>
                                                            {rek.qrisUrl && (
                                                                <img src={rek.qrisUrl} className="w-24 h-24 rounded-xl object-contain border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 mx-auto md:mx-0 shadow-sm" onError={(e) => e.target.src = './icons/notavailable.jpg'} />
                                                            )}
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-navy-700 dark:text-gray-300 mb-1.5 uppercase tracking-widest">Link Gambar QRIS</label>
                                                                <input type="text" value={rek.qrisUrl || ''} onChange={(e) => handleUpdateRekening(rek.id, 'qrisUrl', e.target.value)} className="w-full p-2.5 border border-navy-200 dark:border-navy-700 rounded-lg focus:border-gold-500 outline-none transition-colors bg-white dark:bg-navy-900 dark:text-white text-xs shadow-sm" placeholder="URL gambar QRIS..." />
                                                            </div>
                                                        </div>

                                                        {/* Rekening Input Section */}
                                                        <div className="w-full md:w-2/3 space-y-4">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Icon name="CreditCard" className="w-4 h-4 text-navy-600 dark:text-gold-400" />
                                                                <span className="text-xs font-bold text-navy-800 dark:text-gray-200">Rekening Bank</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-navy-700 dark:text-gray-300 mb-1.5 uppercase tracking-widest">Nama Bank</label>
                                                                    <input type="text" value={rek.namaBank || ''} onChange={(e) => handleUpdateRekening(rek.id, 'namaBank', e.target.value)} className="w-full p-2.5 border border-navy-200 dark:border-navy-700 rounded-lg focus:border-gold-500 outline-none transition-colors bg-white dark:bg-navy-900 dark:text-white text-xs font-bold shadow-sm" placeholder="Contoh: Mandiri" required />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-navy-700 dark:text-gray-300 mb-1.5 uppercase tracking-widest">Link Logo Bank (Opsional)</label>
                                                                    <input type="text" value={rek.logoUrl || ''} onChange={(e) => handleUpdateRekening(rek.id, 'logoUrl', e.target.value)} className="w-full p-2.5 border border-navy-200 dark:border-navy-700 rounded-lg focus:border-gold-500 outline-none transition-colors bg-white dark:bg-navy-900 dark:text-white text-xs shadow-sm" placeholder="URL gambar logo..." />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-navy-700 dark:text-gray-300 mb-1.5 uppercase tracking-widest">Atas Nama</label>
                                                                    <input type="text" value={rek.atasNama || ''} onChange={(e) => handleUpdateRekening(rek.id, 'atasNama', e.target.value)} className="w-full p-2.5 border border-navy-200 dark:border-navy-700 rounded-lg focus:border-gold-500 outline-none transition-colors bg-white dark:bg-navy-900 dark:text-white text-xs font-bold shadow-sm" placeholder="Contoh: GMAHK Pisgah" required />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-navy-700 dark:text-gray-300 mb-1.5 uppercase tracking-widest">Nomor Rekening</label>
                                                                    <input type="text" value={rek.rekeningBank || ''} onChange={(e) => handleUpdateRekening(rek.id, 'rekeningBank', e.target.value)} className="w-full p-2.5 border border-navy-200 dark:border-navy-700 rounded-lg focus:border-gold-500 outline-none transition-colors bg-white dark:bg-navy-900 dark:text-white text-sm font-bold shadow-sm font-mono tracking-wider" placeholder="Contoh: 1090001711043" required />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button type="submit" disabled={isSavingRekening} className={`w-full ${isSavingRekening ? 'bg-navy-300 dark:bg-navy-800 text-navy-500 dark:text-gray-400 cursor-not-allowed' : 'bg-navy-900 dark:bg-gold-500 hover:bg-navy-800 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all mt-6 flex items-center justify-center`}>
                                        {isSavingRekening ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Menyimpan...</> : 'Simpan Pengaturan'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* --- FORM GANTI PASSWORD --- */}
                        {pengaturanSubTab === 'password' && (
                            <div className="bg-white dark:bg-navy-900 border border-navy-100/60 dark:border-navy-700 rounded-[1.5rem] p-6 shadow-sm">
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 dark:border-navy-800 pb-5">
                                    <div className="w-12 h-12 bg-navy-50 dark:bg-navy-800 rounded-full flex items-center justify-center text-navy-900 dark:text-gold-400 shadow-inner"><Icon name="Settings" className="w-6 h-6" /></div>
                                    <div><h3 className="font-black text-navy-900 dark:text-gold-400 text-lg tracking-tight">Ganti Password Admin</h3><p className="text-xs text-navy-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Keamanan Otentikasi</p></div>
                                </div>
                                <form onSubmit={handleGantiPassword} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Password Lama</label>
                                        <div className="relative">
                                            <input type={showOldPass ? "text" : "password"} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full p-3.5 pr-10 border border-navy-200 dark:border-navy-700 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 dark:bg-navy-950 dark:text-white text-sm font-bold shadow-sm" />
                                            <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors focus:outline-none"><Icon name={showOldPass ? "EyeOff" : "Eye"} className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-navy-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Password Baru</label>
                                        <div className="relative">
                                            <input type={showNewPass ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength="6" className="w-full p-3.5 pr-10 border border-navy-200 dark:border-navy-700 rounded-xl focus:border-gold-500 outline-none transition-colors bg-navy-50/50 dark:bg-navy-950 dark:text-white text-sm font-bold shadow-sm" />
                                            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors focus:outline-none"><Icon name={showNewPass ? "EyeOff" : "Eye"} className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isChangingPass} className={`w-full ${isChangingPass ? 'bg-navy-300 dark:bg-navy-800 text-navy-500 dark:text-gray-400 cursor-not-allowed' : 'bg-navy-900 dark:bg-gold-500 hover:bg-navy-800 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 shadow-md hover:shadow-lg'} font-bold py-3.5 rounded-xl transition-all mt-6 flex items-center justify-center`}>
                                        {isChangingPass ? <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin mr-2"></span> Memproses...</> : 'Simpan Password Baru'}
                                    </button>
                                </form>
                            </div>
                        )}
                        {/* --- PANEL SINKRONISASI SUPABASE HYBRID --- */}
                        {pengaturanSubTab === 'database' && (
                            <div className="bg-white dark:bg-navy-900 border border-navy-100/60 dark:border-navy-700 rounded-[1.5rem] p-6 shadow-sm space-y-6 animate-fade-in">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-50 dark:border-navy-800 pb-5">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner font-black text-xl">⚡</div>
                                        <div>
                                            <h3 className="font-black text-navy-900 dark:text-gold-400 text-lg tracking-tight">Arsitektur Dual-Database (Supabase + Google Sheets)</h3>
                                            <p className="text-xs text-navy-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Akselerasi Baca Instan &lt;150ms &amp; Backup Otomatis</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => checkPortalSupabaseHealth().then(setSupaHealth)}
                                        className="px-4 py-2 rounded-xl bg-navy-50 dark:bg-navy-800 hover:bg-navy-100 text-navy-700 dark:text-gray-200 text-xs font-bold transition self-start sm:self-auto"
                                    >
                                        🔄 Cek Status
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-2xl bg-navy-50/60 dark:bg-navy-950 border border-navy-100 dark:border-navy-800">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400 block mb-1">Status Koneksi Supabase</span>
                                        <span className={`text-base font-black flex items-center gap-2 ${supaHealth?.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                                            {supaHealth ? (supaHealth.connected ? '🟢 Terhubung Aktif' : '🟠 Terputus / Offline') : 'Memeriksa...'}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-navy-50/60 dark:bg-navy-950 border border-navy-100 dark:border-navy-800">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400 block mb-1">Kecepatan Respon (Latensi)</span>
                                        <span className="text-base font-black text-navy-900 dark:text-white">
                                            {supaHealth?.latencyMs ? `${supaHealth.latencyMs} ms (Instan)` : '-'}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-navy-50/60 dark:bg-navy-950 border border-navy-100 dark:border-navy-800">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400 block mb-1">Sinkronisasi Terakhir</span>
                                        <span className="text-xs font-bold text-navy-800 dark:text-gray-200 block">
                                            {supaHealth?.updatedAt ? new Date(supaHealth.updatedAt).toLocaleString('id-ID') : (supaHealth?.seeded ? 'Tersedia' : 'Belum di-seed')}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5 leading-relaxed">
                                    <p className="font-bold">💡 Cara Kerja Dual-Database Portal Utama:</p>
                                    <p>• Saat jemaat membuka aplikasi, data Jadwal, Warta, Buku, dan Pengumuman dimuat langsung dari <strong>Supabase</strong> dalam waktu &lt;150 milidetik tanpa harus menunggu cold-start Google Apps Script.</p>
                                    <p>• Setiap kali Admin menyimpan perubahan, data langsung diperbarui ke <strong>Supabase</strong> sekaligus dicadangkan ke <strong>Google Sheets (GAS)</strong>.</p>
                                </div>

                                {supaSyncProgress && (
                                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-navy-800 border border-amber-200 dark:border-navy-700 text-xs font-bold text-amber-900 dark:text-gold-300 flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0"></span>
                                        <span>{supaSyncProgress}</span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    disabled={isSyncingSupa}
                                    onClick={async () => {
                                        setIsSyncingSupa(true);
                                        setSupaSyncProgress('Memulai sinkronisasi penuh dari Google Sheets ke Supabase...');
                                        const res = await migratePortalGASToSupabase(GAS_API_URL, (msg) => setSupaSyncProgress(msg));
                                        setIsSyncingSupa(false);
                                        setSupaSyncProgress('');
                                        if (res.health) setSupaHealth(res.health);
                                        alert(res.message);
                                    }}
                                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <span>⚡ Sinkronkan Penuh Google Sheets (GAS) → Supabase Sekarang</span>
                                </button>
                            </div>
                        )}
                        {/* PERJAMUAN TAB */}
                        {pengaturanSubTab === 'perjamuan' && (
                            <div className="bg-white dark:bg-navy-900 border border-navy-100/60 dark:border-navy-700 rounded-[1.5rem] p-6 shadow-sm animate-fade-in">
                                {/* Header */}
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 dark:border-navy-800 pb-5">
                                    <div className="w-12 h-12 bg-gold-50 dark:bg-gold-900/40 rounded-full flex items-center justify-center text-gold-600 dark:text-gold-400 shadow-inner">
                                        <Icon name="Calendar" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-navy-900 dark:text-gold-400 text-lg tracking-tight">Jadwal Perjamuan Kudus</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                            <span className="text-navy-500 dark:text-gray-400">Berlangsung Tiap 3 Bulan</span>
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSavePerjamuanDate} className="space-y-8">
                                    {/* Perjamuan Section */}
                                    <div className="space-y-4">
                                        {perjamuanDate && (
                                            <div className="bg-gradient-to-r from-gold-50 to-white dark:from-navy-800 dark:to-navy-950 border border-gold-200 dark:border-gold-700/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gold-100 dark:bg-gold-900/50 rounded-full flex items-center justify-center shrink-0">
                                                        <Icon name="Calendar" className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-navy-400 dark:text-gold-300/80 uppercase tracking-widest mb-0.5">Jadwal Aktif</p>
                                                        <p className="font-black text-navy-900 dark:text-white text-base leading-tight">{formatIndoDate(perjamuanDate)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-bold text-navy-700 dark:text-gray-200 mb-2 uppercase tracking-widest">
                                                Pilih / Ubah Tanggal Perjamuan
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    value={editPerjamuanDate}
                                                    onChange={e => setEditPerjamuanDate(e.target.value)}
                                                    className="w-full p-3.5 border-2 border-navy-200 dark:border-navy-700 focus:border-gold-500 rounded-xl outline-none transition-all bg-white dark:bg-navy-950 text-sm font-bold text-navy-900 dark:text-white shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setEditPerjamuanDate('')}
                                                    className="bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-4 rounded-xl border border-red-200 dark:border-red-800 font-bold text-sm transition-all shadow-sm whitespace-nowrap"
                                                >Hapus</button>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-xs font-bold text-navy-700 dark:text-gray-200 mb-2 uppercase tracking-widest">
                                                Catatan / Pengumuman
                                            </label>
                                            <textarea
                                                value={editPerjamuanNote}
                                                onChange={e => setEditPerjamuanNote(e.target.value)}
                                                placeholder="Contoh: Bawa alat perjamuan masing-masing..."
                                                className="w-full p-3.5 border-2 border-navy-200 dark:border-navy-700 focus:border-gold-500 rounded-xl outline-none transition-all bg-white dark:bg-navy-950 text-sm font-medium text-navy-900 dark:text-white shadow-sm min-h-[80px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Info Box */}
                                    <div className="bg-gold-50/60 dark:bg-gold-950/40 border border-gold-200/80 dark:border-gold-800/60 rounded-xl p-4 flex gap-3">
                                        <Icon name="Info" className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-navy-600 dark:text-gray-300 font-medium leading-relaxed">
                                            Banner <b>Perjamuan Kudus</b> akan tampil otomatis di halaman utama sejak pengaturan ini disimpan hingga hari-H. Setelah tanggal lewat, banner akan hilang secara otomatis.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSavingPerjamuanDate}
                                        className={`w-full font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-md ${isSavingPerjamuanDate
                                            ? 'bg-navy-300 dark:bg-navy-800 text-navy-500 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-navy-900 dark:bg-gold-500 hover:bg-navy-800 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 hover:shadow-lg'
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

                        {/* PERPULUHAN TAB */}
                        {pengaturanSubTab === 'perpuluhan' && (
                            <div className="bg-white dark:bg-navy-900 border border-navy-100/60 dark:border-navy-700 rounded-[1.5rem] p-6 shadow-sm animate-fade-in">
                                {/* Header */}
                                <div className="flex items-center space-x-4 mb-6 border-b border-navy-50 dark:border-navy-800 pb-5">
                                    <div className="w-12 h-12 bg-navy-50 dark:bg-navy-800 rounded-full flex items-center justify-center text-navy-600 dark:text-gold-400 shadow-inner">
                                        <Icon name="Gift" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-navy-900 dark:text-gold-400 text-lg tracking-tight">Jadwal Sabat Perpuluhan</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                            <span className="text-navy-500 dark:text-gray-400">Berlangsung Tiap Bulan</span>
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSavePerjamuanDate} className="space-y-8">
                                    {/* Perpuluhan Section */}
                                    <div className="space-y-4">
                                        {perpuluhanDate && (
                                            <div className="bg-gradient-to-r from-navy-50 to-white dark:from-navy-800 dark:to-navy-950 border border-navy-200 dark:border-navy-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-navy-100 dark:bg-navy-700 rounded-full flex items-center justify-center shrink-0">
                                                        <Icon name="Calendar" className="w-5 h-5 text-navy-600 dark:text-gold-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-navy-500 dark:text-gold-300/80 uppercase tracking-widest mb-0.5">Jadwal Aktif</p>
                                                        <p className="font-black text-navy-900 dark:text-white text-base leading-tight">{formatIndoDate(perpuluhanDate)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-bold text-navy-700 dark:text-gray-200 mb-2 uppercase tracking-widest">
                                                Pilih / Ubah Tanggal Perpuluhan
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    value={editPerpuluhanDate}
                                                    onChange={e => setEditPerpuluhanDate(e.target.value)}
                                                    className="w-full p-3.5 border-2 border-navy-200 dark:border-navy-700 focus:border-gold-500 rounded-xl outline-none transition-all bg-white dark:bg-navy-950 text-sm font-bold text-navy-900 dark:text-white shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setEditPerpuluhanDate('')}
                                                    className="bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-4 rounded-xl border border-red-200 dark:border-red-800 font-bold text-sm transition-all shadow-sm whitespace-nowrap"
                                                >Hapus</button>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-xs font-bold text-navy-700 dark:text-gray-200 mb-2 uppercase tracking-widest">
                                                Catatan / Pengumuman
                                            </label>
                                            <textarea
                                                value={editPerpuluhanNote}
                                                onChange={e => setEditPerpuluhanNote(e.target.value)}
                                                placeholder="Contoh: Amplop tersedia di pintu masuk..."
                                                className="w-full p-3.5 border-2 border-navy-200 dark:border-navy-700 focus:border-gold-500 rounded-xl outline-none transition-all bg-white dark:bg-navy-950 text-sm font-medium text-navy-900 dark:text-white shadow-sm min-h-[80px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Info Box */}
                                    <div className="bg-navy-50/60 dark:bg-navy-950/50 border border-navy-200/80 dark:border-navy-700 rounded-xl p-4 flex gap-3">
                                        <Icon name="Info" className="w-4 h-4 text-navy-600 dark:text-gold-400 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-navy-600 dark:text-gray-300 font-medium leading-relaxed">
                                            Banner <b>Sabat Perpuluhan</b> akan tampil otomatis di halaman utama sejak pengaturan ini disimpan hingga hari-H. Setelah tanggal lewat, banner akan hilang secara otomatis.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSavingPerjamuanDate}
                                        className={`w-full font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-md ${isSavingPerjamuanDate
                                            ? 'bg-navy-300 dark:bg-navy-800 text-navy-500 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-navy-900 dark:bg-gold-500 hover:bg-navy-800 dark:hover:bg-gold-600 text-gold-400 dark:text-navy-950 hover:shadow-lg'
                                            }`}
                                    >
                                        {isSavingPerjamuanDate ? (
                                            <><span className="w-4 h-4 border-2 border-navy-500 border-t-white rounded-full animate-spin"></span> Menyimpan...</>
                                        ) : (
                                            <><Icon name="Save" className="w-4 h-4" /> Simpan Tanggal Perpuluhan</>
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
                                                    loading="lazy"
                                                    decoding="async"
                                                    referrerPolicy="no-referrer"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => handleBookCoverError(e, book)}
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
                                                                const res = await portalFetch(GAS_API_URL, {
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
                                            const res = await portalFetch(GAS_API_URL, {
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
                                                        val = `https://lh3.googleusercontent.com/d/${match[1]}`;
                                                    } else {
                                                        match = val.match(/id=([a-zA-Z0-9_-]+)/);
                                                        if (match && match[1] && val.includes('drive.google.com')) {
                                                            val = `https://lh3.googleusercontent.com/d/${match[1]}`;
                                                        }
                                                    }
                                                    setBookFormData({ ...bookFormData, cover: val });
                                                }}
                                                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500 font-medium text-sm"
                                                placeholder="Kosongkan agar otomatis diambil dari halaman awal dokumen PDF buku"
                                            />
                                            <p className="text-xs text-navy-400 mt-1.5">
                                                💡 <strong>Kosongkan</strong> untuk otomatis mengambil gambar sampul dari halaman awal buku (PDF Google Drive).
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-navy-900 mb-1.5">Link Dokumen (PDF / PPT / Google Drive)</label>
                                            <input
                                                type="url"
                                                value={bookFormData.pdfUrl}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    let driveId = getGoogleDriveFileId(val);
                                                    if (driveId) {
                                                        let newPdfUrl = `https://drive.google.com/file/d/${driveId}/preview`;
                                                        setBookFormData({ ...bookFormData, pdfUrl: newPdfUrl });
                                                        return;
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

                {adminTab === 'pastoral' && (
                    <AdminPastoralAndCalendarPanel />
                )}

                {adminTab === 'lagu' && (
                    <AdminLaguPanel
                        customSongs={customSongs}
                        setCustomSongs={setCustomSongs}
                        laguSionDb={laguSionDb}
                        setLaguSionDb={setLaguSionDb}
                        adminToken={adminToken}
                        setLaguSionInitialSong={setLaguSionInitialSong}
                        setLaguSionSubTab={setLaguSionSubTab}
                        setActiveTab={setActiveTab}
                    />
                )}

                {/* Modal Selector Lagu Sion & Ayat Alkitab untuk Susunan Acara */}
                <AdminSongPickerModal
                    isOpen={Boolean(songPicker)}
                    onClose={() => setSongPicker(null)}
                    laguSionDb={laguSionDb}
                    title={songPicker?.title || "Pilih Lagu Sion"}
                    onSelect={(val) => {
                        if (songPicker?.field) {
                            handleEditFormChangeSusunan(songPicker.field, val);
                        }
                    }}
                />

                <AdminBibleVersePickerModal
                    isOpen={Boolean(versePicker)}
                    onClose={() => setVersePicker(null)}
                    isAyatBersahutan={Boolean(versePicker?.isAyatBersahutan)}
                    title={versePicker?.title || "Pilih Ayat Alkitab"}
                    alkitabBooks={ALKITAB_BOOKS}
                    onSelect={(val) => {
                        if (versePicker?.field) {
                            handleEditFormChangeSusunan(versePicker.field, val);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
