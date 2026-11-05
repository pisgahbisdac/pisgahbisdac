import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';

export const supabasePortal = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
});

const KEYS = {
    MAIN: 'portal_main_blob',
    WARTA: 'portal_warta_blob',
    PASTORAL: 'portal_pastoral_blob',
    BOOKS: 'portal_books_blob',
    META: 'portal_sync_meta'
};

const safeJsonParse = (str, fallback = null) => {
    if (!str) return fallback;
    if (typeof str === 'object') return str;
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
};

/**
 * Membaca seluruh data Portal Utama dari Supabase dalam 1 query paralel (<150ms)
 */
export async function fetchPortalMainFromSupabase() {
    try {
        const { data, error } = await supabasePortal
            .from('config')
            .select('key, value')
            .in('key', [KEYS.MAIN, KEYS.WARTA, KEYS.PASTORAL, KEYS.META]);

        if (error) throw error;
        if (!data || data.length === 0) return null;

        const map = {};
        data.forEach(row => {
            map[row.key] = safeJsonParse(row.value, null);
        });

        if (!map[KEYS.MAIN]) return null;

        const pastoralObj = map[KEYS.PASTORAL] || {};
        const wartaArr = Array.isArray(map[KEYS.WARTA]) ? map[KEYS.WARTA] : (map[KEYS.MAIN]?.daftarWarta || map[KEYS.MAIN]?.wartaList);

        const merged = {
            ...(map[KEYS.MAIN] || {}),
            ...pastoralObj,
            ...(pastoralObj.prayerRequests ? { daftarDoa: pastoralObj.prayerRequests } : {}),
            ...(pastoralObj.annualCalendar ? { daftarKalender: pastoralObj.annualCalendar } : {}),
            ...(pastoralObj.memberBirthdays ? { daftarUltah: pastoralObj.memberBirthdays } : {}),
            ...(pastoralObj.officerAttendance ? { konfirmasiPetugas: pastoralObj.officerAttendance } : {}),
            ...(Array.isArray(wartaArr) ? { daftarWarta: wartaArr, wartaList: wartaArr } : {})
        };

        return {
            data: merged,
            meta: map[KEYS.META] || null,
            source: 'supabase'
        };
    } catch (err) {
        console.warn('[SupabasePortal] Gagal membaca cache portal dari Supabase:', err.message);
        return null;
    }
}

/**
 * Menyimpan seluruh payload getData dari GAS atau state aplikasi ke Supabase (terbagi rapi agar ringan)
 */
export async function syncPortalMainToSupabase(fullPayload, sourceLabel = 'auto-sync') {
    if (!fullPayload || typeof fullPayload !== 'object') return false;
    try {
        const {
            wartaList,
            daftarWarta,
            prayerRequests,
            daftarDoa,
            annualCalendar,
            daftarKalender,
            memberBirthdays,
            daftarUltah,
            officerAttendance,
            konfirmasiPetugas,
            customSongs,
            ...mainRest
        } = fullPayload;

        const finalWarta = Array.isArray(daftarWarta) ? daftarWarta : (Array.isArray(wartaList) ? wartaList : null);
        const finalDoa = daftarDoa ?? prayerRequests;
        const finalKalender = daftarKalender ?? annualCalendar;
        const finalUltah = daftarUltah ?? memberBirthdays;
        const finalKonfirmasi = konfirmasiPetugas ?? officerAttendance;

        const rowsToUpsert = [
            {
                key: KEYS.MAIN,
                value: JSON.stringify(mainRest)
            },
            {
                key: KEYS.PASTORAL,
                value: JSON.stringify({
                    ...(finalDoa !== undefined ? { prayerRequests: finalDoa, daftarDoa: finalDoa } : {}),
                    ...(finalKalender !== undefined ? { annualCalendar: finalKalender, daftarKalender: finalKalender } : {}),
                    ...(finalUltah !== undefined ? { memberBirthdays: finalUltah, daftarUltah: finalUltah } : {}),
                    ...(finalKonfirmasi !== undefined ? { officerAttendance: finalKonfirmasi, konfirmasiPetugas: finalKonfirmasi } : {}),
                    ...(customSongs !== undefined ? { customSongs } : {})
                })
            },
            {
                key: KEYS.META,
                value: JSON.stringify({
                    updatedAt: new Date().toISOString(),
                    source: sourceLabel
                })
            }
        ];

        if (Array.isArray(finalWarta)) {
            rowsToUpsert.push({
                key: KEYS.WARTA,
                value: JSON.stringify(finalWarta)
            });
        }

        const { error } = await supabasePortal
            .from('config')
            .upsert(rowsToUpsert, { onConflict: 'key' });

        if (error) throw error;

        // Mirror ke tabel terstruktur (portal_warta, portal_jadwal, portal_pejabat) bila tabel sudah dibuat di Supabase
        try {
            if (Array.isArray(finalWarta) && finalWarta.length > 0) {
                const wartaRows = finalWarta.map((w, idx) => ({
                    row_index: Number(w.rowIndex) || (idx + 1),
                    tanggal: String(w.tanggal || ''),
                    judul: String(w.judul || ''),
                    kategori: String(w.kategori || 'Warta Sabat'),
                    penulis: String(w.penulis || 'Admin'),
                    isi: String(w.isi || ''),
                    gambar_url: String(w.gambarUrl || ''),
                    updated_at: new Date().toISOString()
                }));
                await supabasePortal.from('portal_warta').upsert(wartaRows, { onConflict: 'row_index' });
            }
            if (mainRest.jadwalDB && typeof mainRest.jadwalDB === 'object') {
                const monthsIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                const formatArrReadable = (arr) => {
                    if (!Array.isArray(arr) || arr.length === 0) return '-';
                    const valid = arr.filter(x => x && x.nama && x.nama !== '-' && x.nama.toLowerCase() !== String(x.tugas || '').toLowerCase());
                    if (valid.length === 0) return '-';
                    return valid.map(x => `${x.tugas}: ${x.nama}`).join(' • ');
                };
                const jadwalRows = [];
                const rincianRows = [];

                Object.entries(mainRest.jadwalDB).forEach(([tgl, j]) => {
                    const d = new Date(tgl + 'T00:00:00');
                    const isRabu = d.getDay() === 3;
                    const hariLabel = isNaN(d.getTime())
                        ? tgl
                        : `${isRabu ? 'Rabu' : 'Sabat'}, ${d.getDate()} ${monthsIndo[d.getMonth()]} ${d.getFullYear()}`;

                    const findTask = (arr, key) => {
                        if (!Array.isArray(arr)) return '';
                        const found = arr.find(x => (x.tugas || '').toLowerCase().includes(key));
                        return found && found.nama && found.nama !== '-' ? found.nama : '';
                    };

                    const speaker = isRabu
                        ? (findTask(j?.petugas, 'renungan') || findTask(j?.petugas, 'khotbah') || '-')
                        : (findTask(j?.khotbah, 'khotbah') || findTask(j?.khotbah, 'sermon') || '-');

                    const sus = j?.susunan || {};
                    const judulAyatParts = [];
                    if (sus.judulKhotbah) judulAyatParts.push(`"${sus.judulKhotbah}"`);
                    if (sus.ayatInti) judulAyatParts.push(`(${sus.ayatInti})`);
                    if (sus.ayatBersahutan) judulAyatParts.push(`Bersahutan: ${sus.ayatBersahutan}`);

                    const laguParts = [];
                    if (sus.laguBukaKhotbah) laguParts.push(`Buka Khotbah: ${sus.laguBukaKhotbah}`);
                    if (sus.laguTutupKhotbah) laguParts.push(`Tutup Khotbah: ${sus.laguTutupKhotbah}`);
                    if (sus.laguBukaSS) laguParts.push(`Buka SS: ${sus.laguBukaSS}`);
                    if (sus.laguTutupSS) laguParts.push(`Tutup SS: ${sus.laguTutupSS}`);

                    jadwalRows.push({
                        tanggal: tgl,
                        hari_ibadah: hariLabel,
                        pengkhotbah_renungan: speaker,
                        judul_dan_ayat: judulAyatParts.join(' ') || '-',
                        lagu_sion: laguParts.join(' • ') || '-',
                        petugas_khotbah: formatArrReadable(j?.khotbah),
                        petugas_sekolah_sabat: formatArrReadable(j?.sekolahSabat),
                        petugas_rabu: formatArrReadable(j?.petugas),
                        tim_musik: formatArrReadable(j?.musik),
                        tim_diakon: formatArrReadable(j?.diakon),
                        updated_at: new Date().toISOString()
                    });

                    const addRincian = (sesi, arr) => {
                        if (!Array.isArray(arr)) return;
                        arr.forEach((item, idx) => {
                            if (!item || !item.tugas) return;
                            rincianRows.push({
                                id: `${tgl}__${sesi.replace(/\s+/g, '_')}__${idx + 1}`,
                                tanggal: tgl,
                                hari_ibadah: hariLabel,
                                sesi_ibadah: sesi,
                                tugas: String(item.tugas || ''),
                                nama_petugas: String(item.nama || '-'),
                                updated_at: new Date().toISOString()
                            });
                        });
                    };
                    if (isRabu) {
                        addRincian('Ibadah Rabu', j?.petugas);
                    } else {
                        addRincian('Khotbah', j?.khotbah);
                        addRincian('Sekolah Sabat', j?.sekolahSabat);
                        addRincian('Musik', j?.musik);
                        addRincian('Diakon', j?.diakon);
                        addRincian('Perjamuan', j?.perjamuan);
                    }
                });

                if (jadwalRows.length > 0) {
                    await supabasePortal.from('portal_jadwal').upsert(jadwalRows, { onConflict: 'tanggal' });
                }
                if (rincianRows.length > 0) {
                    await supabasePortal.from('portal_jadwal_rincian').upsert(rincianRows, { onConflict: 'id' });
                }
            }
            if (Array.isArray(mainRest.dataPejabat) && mainRest.dataPejabat.length > 0) {
                const pejabatRows = mainRest.dataPejabat.map((p, idx) => ({
                    id: String(p.id || `pejabat_${idx + 1}`),
                    nama: String(p.nama || ''),
                    jabatan: String(p.jabatan || ''),
                    kategori: String(p.kategori || 'Lainnya'),
                    wa: String(p.wa || ''),
                    img: String(p.img || ''),
                    updated_at: new Date().toISOString()
                }));
                await supabasePortal.from('portal_pejabat').upsert(pejabatRows, { onConflict: 'id' });
            }
        } catch (mirrorErr) {
            // Abaikan jika tabel terstruktur opsional belum dibuat di SQL Editor
        }

        return true;
    } catch (err) {
        console.warn('[SupabasePortal] Gagal sinkronisasi state ke Supabase:', err.message);
        return false;
    }
}

/**
 * Membaca daftar Buku Perpustakaan dari Supabase
 */
export async function fetchPortalBooksFromSupabase() {
    try {
        const { data, error } = await supabasePortal
            .from('config')
            .select('value')
            .eq('key', KEYS.BOOKS)
            .maybeSingle();

        if (error) throw error;
        if (!data || !data.value) return null;
        const parsed = safeJsonParse(data.value, null);
        if (!Array.isArray(parsed)) return null;
        return parsed;
    } catch (err) {
        console.warn('[SupabasePortal] Gagal membaca buku dari Supabase:', err.message);
        return null;
    }
}

/**
 * Menyimpan daftar Buku Perpustakaan ke Supabase
 */
export async function syncPortalBooksToSupabase(booksArray) {
    if (!Array.isArray(booksArray)) return false;
    try {
        const { error } = await supabasePortal
            .from('config')
            .upsert([{ key: KEYS.BOOKS, value: JSON.stringify(booksArray) }], { onConflict: 'key' });
        if (error) throw error;

        // Mirror ke tabel terstruktur portal_buku bila tabel sudah dibuat di Supabase
        try {
            const bookRows = booksArray.map((b, idx) => ({
                id: String(b.id || b.rowIndex || `book_${idx + 1}`),
                title: String(b.title || b.judul || ''),
                author: String(b.author || b.penulis || ''),
                category: String(b.category || b.kategori || 'Umum'),
                description: String(b.desc || b.deskripsi || ''),
                cover: String(b.cover || b.coverUrl || ''),
                pdf_url: String(b.pdfUrl || ''),
                updated_at: new Date().toISOString()
            }));
            if (bookRows.length > 0) {
                await supabasePortal.from('portal_buku').upsert(bookRows, { onConflict: 'id' });
            }
        } catch (mirrorErr) {
            // Abaikan jika tabel portal_buku belum dibuat
        }

        return true;
    } catch (err) {
        console.warn('[SupabasePortal] Gagal menyimpan buku ke Supabase:', err.message);
        return false;
    }
}

/**
 * Memperbarui sebagian state di Supabase ketika Admin melakukan perubahan
 */
export async function applyPortalWriteToSupabase(action, payload, gasResult = null) {
    try {
        // 1. Operasi Buku Perpustakaan
        if (action === 'addBook' || action === 'updateBook' || action === 'saveBook' || action === 'deleteBook') {
            const existingBooks = (await fetchPortalBooksFromSupabase()) || [];
            if ((action === 'addBook' || action === 'updateBook' || action === 'saveBook') && (payload.data || payload.bookData)) {
                const b = payload.data || payload.bookData;
                const bookId = gasResult?.id || b.id || ('BOOK_' + Date.now());
                const newBook = {
                    ...b,
                    id: bookId,
                    title: b.title || b.judul || '',
                    author: b.author || b.penulis || '',
                    category: b.category || b.kategori || 'Umum',
                    desc: b.desc || b.deskripsi || '',
                    cover: b.cover || b.coverUrl || '',
                    pdfUrl: b.pdfUrl || ''
                };
                const idx = existingBooks.findIndex(item =>
                    (b.id && String(item.id) === String(b.id)) ||
                    (item.title && item.title === newBook.title)
                );
                if (idx >= 0) existingBooks[idx] = { ...existingBooks[idx], ...newBook };
                else existingBooks.unshift(newBook);
                await syncPortalBooksToSupabase(existingBooks);
            } else if (action === 'deleteBook') {
                const targetId = payload.data ?? payload.id ?? payload.rowIndex;
                const filtered = existingBooks.filter(item =>
                    String(item.id) !== String(targetId) && String(item.rowIndex) !== String(targetId)
                );
                await syncPortalBooksToSupabase(filtered);
            }
            return true;
        }

        // 2. Operasi Warta Jemaat
        if (action === 'saveWarta' || action === 'updateWarta' || action === 'deleteWarta') {
            const current = await fetchPortalMainFromSupabase();
            const wartaList = Array.isArray(current?.data?.wartaList) ? [...current.data.wartaList] : [];

            if (action === 'saveWarta') {
                const newRow = {
                    rowIndex: gasResult?.rowIndex || Date.now(),
                    tanggal: payload.tanggal || new Date().toISOString(),
                    judul: payload.judul || '',
                    kategori: payload.kategori || 'Pengumuman',
                    penulis: payload.penulis || 'Admin',
                    isi: payload.isi || '',
                    gambarUrl: gasResult?.gambarUrl || payload.gambarBase64 || ''
                };
                wartaList.unshift(newRow);
            } else if (action === 'updateWarta') {
                const idx = wartaList.findIndex(w => String(w.rowIndex) === String(payload.rowIndex));
                if (idx >= 0) {
                    wartaList[idx] = {
                        ...wartaList[idx],
                        judul: payload.judul ?? wartaList[idx].judul,
                        kategori: payload.kategori ?? wartaList[idx].kategori,
                        penulis: payload.penulis ?? wartaList[idx].penulis,
                        isi: payload.isi ?? wartaList[idx].isi,
                        ...(payload.tanggal ? { tanggal: payload.tanggal } : {}),
                        ...(gasResult?.gambarUrl ? { gambarUrl: gasResult.gambarUrl } : (payload.existingGambarUrl !== undefined ? { gambarUrl: payload.existingGambarUrl } : {}))
                    };
                }
            } else if (action === 'deleteWarta') {
                const filtered = wartaList.filter(w => String(w.rowIndex) !== String(payload.rowIndex));
                wartaList.length = 0;
                wartaList.push(...filtered);
            }

            await supabasePortal
                .from('config')
                .upsert([
                    { key: KEYS.WARTA, value: JSON.stringify(wartaList) },
                    { key: KEYS.META, value: JSON.stringify({ updatedAt: new Date().toISOString(), source: `admin:${action}` }) }
                ], { onConflict: 'key' });
            return true;
        }

        // 3. Operasi Pastoral & Lagu Tambahan
        const pastoralActions = [
            'savePrayerRequests',
            'saveAnnualCalendar',
            'saveMemberBirthdays',
            'saveOfficerAttendance',
            'addCustomSong',
            'updateCustomSong',
            'deleteCustomSong'
        ];

        if (pastoralActions.includes(action)) {
            const { data: row } = await supabasePortal
                .from('config')
                .select('value')
                .eq('key', KEYS.PASTORAL)
                .maybeSingle();
            const pastoral = safeJsonParse(row?.value, {}) || {};

            if (action === 'savePrayerRequests') pastoral.prayerRequests = payload.prayers ?? payload.data;
            if (action === 'saveAnnualCalendar') pastoral.annualCalendar = payload.calendarItems ?? payload.data;
            if (action === 'saveMemberBirthdays') pastoral.memberBirthdays = payload.birthdays ?? payload.data;
            if (action === 'saveOfficerAttendance') {
                if (payload.recordKey) {
                    const map = { ...(pastoral.officerAttendance || {}) };
                    if (payload.payload === null) delete map[payload.recordKey];
                    else map[payload.recordKey] = { ...payload.payload, updatedAt: Date.now() };
                    pastoral.officerAttendance = map;
                } else if (payload.data) {
                    pastoral.officerAttendance = payload.data;
                }
            }

            if (action === 'addCustomSong' || action === 'updateCustomSong') {
                const list = Array.isArray(pastoral.customSongs) ? [...pastoral.customSongs] : [];
                const song = payload.data || payload;
                const idx = list.findIndex(s => s.id === song.id || Number(s.number) === Number(song.number));
                if (idx >= 0) list[idx] = song;
                else list.push(song);
                list.sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0));
                pastoral.customSongs = list;
            } else if (action === 'deleteCustomSong') {
                const list = Array.isArray(pastoral.customSongs) ? [...pastoral.customSongs] : [];
                pastoral.customSongs = list.filter(s => s.id !== payload.id && Number(s.number) !== Number(payload.number));
            }

            await supabasePortal
                .from('config')
                .upsert([
                    { key: KEYS.PASTORAL, value: JSON.stringify(pastoral) },
                    { key: KEYS.META, value: JSON.stringify({ updatedAt: new Date().toISOString(), source: `admin:${action}` }) }
                ], { onConflict: 'key' });
            return true;
        }

        // 4. Operasi Konfigurasi & Jadwal Utama
        const mainActions = [
            'saveJadwal',
            'savePejabat',
            'saveYoutubeUrl',
            'saveAnthemUrl',
            'saveLiveUrl',
            'saveRekening',
            'savePerjamuanDate',
            'savePengumuman',
            'saveKontakGereja',
            'saveHeroImage',
            'saveCarouselEvents',
            'saveCarouselVideos'
        ];

        if (mainActions.includes(action)) {
            const { data: row } = await supabasePortal
                .from('config')
                .select('value')
                .eq('key', KEYS.MAIN)
                .maybeSingle();
            const mainObj = safeJsonParse(row?.value, {}) || {};

            if (action === 'saveJadwal' && payload.tanggal) {
                mainObj.jadwalDB = { ...(mainObj.jadwalDB || {}), [payload.tanggal]: payload.data };
            } else if (action === 'savePejabat') {
                if (payload.dataPejabat) mainObj.dataPejabat = payload.dataPejabat;
                if (payload.kategoriPejabat) mainObj.kategoriPejabat = payload.kategoriPejabat;
            } else if (action === 'saveYoutubeUrl') {
                mainObj.youtubeUrl = payload.url;
                if (payload.title !== undefined) mainObj.youtubeTitle = payload.title;
                if (payload.channelTitle !== undefined) mainObj.youtubeChannelTitle = payload.channelTitle;
            } else if (action === 'saveAnthemUrl') {
                mainObj.anthemUrl = payload.url;
                if (payload.url2 !== undefined) mainObj.anthemUrl2 = payload.url2;
                if (payload.title !== undefined) mainObj.anthemTitle = payload.title;
                if (payload.title2 !== undefined) mainObj.anthemTitle2 = payload.title2;
            } else if (action === 'saveLiveUrl') {
                mainObj.liveUrl = payload.url;
            } else if (action === 'saveRekening') {
                mainObj.daftarRekening = payload.daftarRekening;
            } else if (action === 'savePerjamuanDate') {
                if (payload.tanggal !== undefined) mainObj.perjamuanDate = payload.tanggal;
                if (payload.tanggalPerpuluhan !== undefined) mainObj.perpuluhanDate = payload.tanggalPerpuluhan;
                if (payload.catatanPerjamuan !== undefined) mainObj.perjamuanNote = payload.catatanPerjamuan;
                if (payload.catatanPerpuluhan !== undefined) mainObj.perpuluhanNote = payload.catatanPerpuluhan;
            } else if (action === 'savePengumuman') {
                mainObj.pengumuman = safeJsonParse(payload.pengumuman, payload.pengumuman);
            } else if (action === 'saveKontakGereja') {
                mainObj.kontakGereja = safeJsonParse(payload.kontakGereja, payload.kontakGereja);
            } else if (action === 'saveHeroImage') {
                const slides = gasResult?.updatedUrls || safeJsonParse(payload.url, payload.url);
                mainObj.heroImages = slides;
                mainObj.heroImageUrl = typeof slides === 'string' ? slides : JSON.stringify(slides);
            } else if (action === 'saveCarouselEvents') {
                mainObj.carouselEvents = gasResult?.updatedEvents || payload.carouselEvents;
            } else if (action === 'saveCarouselVideos') {
                mainObj.carouselVideos = payload.carouselVideos;
            }

            await supabasePortal
                .from('config')
                .upsert([
                    { key: KEYS.MAIN, value: JSON.stringify(mainObj) },
                    { key: KEYS.META, value: JSON.stringify({ updatedAt: new Date().toISOString(), source: `admin:${action}` }) }
                ], { onConflict: 'key' });
            return true;
        }

        return false;
    } catch (err) {
        console.warn(`[SupabasePortal] Gagal applyPortalWriteToSupabase (${action}):`, err.message);
        return false;
    }
}

/**
 * Wrapper cerdas pengganti fetch(GAS_API_URL, options) untuk operasi POST / GET Portal Utama.
 * - Untuk `getBooks`: Mengambil instan dari Supabase (<150ms) dan memperbarui dari GAS di latar belakang.
 * - Untuk aksi tulis Admin (`save*`, `update*`, `delete*`): Menyimpan ke GAS + otomatis meng-update Supabase.
 */
export async function portalFetch(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();

    if (method === 'POST' && options.body) {
        const payload = safeJsonParse(options.body, {});
        const action = payload?.action;

        // Fast-path untuk getBooks
        if (action === 'getBooks') {
            const supaBooks = await fetchPortalBooksFromSupabase();
            if (supaBooks && supaBooks.length > 0) {
                // Background refresh dari GAS agar tetap tersinkronisasi
                fetch(url, options)
                    .then(r => r.json())
                    .then(res => {
                        const list = res?.data?.data || res?.data || res?.books;
                        if (Array.isArray(list) && list.length > 0) {
                            syncPortalBooksToSupabase(list);
                        }
                    })
                    .catch(() => {});

                const responseObj = { status: 'success', success: true, data: supaBooks, books: supaBooks, source: 'supabase' };
                return {
                    ok: true,
                    status: 200,
                    json: async () => responseObj,
                    text: async () => JSON.stringify(responseObj)
                };
            }

            // Jika belum ada di Supabase, ambil dari GAS lalu seed ke Supabase
            const res = await fetch(url, options);
            const clone = res.clone();
            clone.json().then(json => {
                const list = json?.data?.data || json?.data || json?.books;
                if (Array.isArray(list) && list.length > 0) {
                    syncPortalBooksToSupabase(list);
                }
            }).catch(() => {});
            return res;
        }

        // Untuk aksi tulis Admin: jalankan ke GAS dan sinkronkan ke Supabase
        if (action && action !== 'verifyAdmin' && action !== 'changePassword' && action !== 'uploadImageToDrive') {
            try {
                const res = await fetch(url, options);
                const text = await res.text();
                let parsed = safeJsonParse(text, null);
                if (!parsed && (text.includes('"success":true') || text.includes('success') || text.trim() === '')) {
                    parsed = { success: true };
                }
                if (parsed && (parsed.success || parsed.status === 'success')) {
                    await applyPortalWriteToSupabase(action, payload, parsed);
                }
                return {
                    ok: res.ok,
                    status: res.status,
                    json: async () => parsed || { success: false, message: 'Respons server tidak valid' },
                    text: async () => text
                };
            } catch (err) {
                // Jika GAS timeout karena redirect CORS namun ada password/token admin, tetap update Supabase secara optimis
                if (payload.password || payload.adminToken) {
                    await applyPortalWriteToSupabase(action, payload, { success: true });
                }
                throw err;
            }
        }
    }

    return fetch(url, options);
}

/**
 * Pemeriksaan kesehatan & status sinkronisasi Portal di Supabase
 */
export async function checkPortalSupabaseHealth() {
    try {
        const start = performance.now();
        const { data, error } = await supabasePortal
            .from('config')
            .select('key, value')
            .in('key', [KEYS.MAIN, KEYS.WARTA, KEYS.PASTORAL, KEYS.BOOKS, KEYS.META]);
        const latencyMs = Math.round(performance.now() - start);
        if (error) throw error;

        const keysFound = (data || []).map(r => r.key);
        const metaRow = (data || []).find(r => r.key === KEYS.META);
        const meta = safeJsonParse(metaRow?.value, {});

        return {
            connected: true,
            latencyMs,
            seeded: keysFound.includes(KEYS.MAIN),
            keysCount: keysFound.length,
            updatedAt: meta?.updatedAt || null,
            source: meta?.source || null
        };
    } catch (err) {
        return {
            connected: false,
            latencyMs: null,
            seeded: false,
            error: err.message
        };
    }
}

/**
 * Migrasi / Sinkronisasi 1-Klik penuh dari Google Apps Script (Sheets) ke Supabase untuk Portal Utama
 */
export async function migratePortalGASToSupabase(gasUrl, onProgress = () => {}) {
    try {
        onProgress('Mengambil data utama & jadwal dari Google Sheets...');
        const mainRes = await fetch(`${gasUrl}?action=getData&t=${Date.now()}`, { redirect: 'follow' });
        const mainData = await mainRes.json();

        onProgress('Menyimpan Jadwal, Warta, Pejabat & Konfigurasi ke Supabase...');
        await syncPortalMainToSupabase(mainData, 'manual-migration');

        onProgress('Mengambil katalog Buku Perpustakaan dari Google Sheets...');
        try {
            const bookRes = await fetch(gasUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'getBooks' })
            });
            const bookJson = await bookRes.json();
            const bookList = bookJson?.data?.data || bookJson?.data || bookJson?.books;
            if (Array.isArray(bookList) && bookList.length > 0) {
                onProgress(`Menyimpan ${bookList.length} buku perpustakaan ke Supabase...`);
                await syncPortalBooksToSupabase(bookList);
            }
        } catch (bookErr) {
            console.warn('Skip sinkronisasi buku:', bookErr);
        }

        const health = await checkPortalSupabaseHealth();
        return {
            success: true,
            health,
            message: `Sinkronisasi Portal ke Supabase Berhasil! (Latensi: ${health.latencyMs}ms)`
        };
    } catch (err) {
        return {
            success: false,
            message: 'Gagal menyinkronkan GAS ke Supabase: ' + err.message
        };
    }
}

/**
 * Mengambil data lintas-modul untuk Beranda (Ulang Tahun Jemaat dari hadir_jemaat & Progress Pembangunan)
 */
export async function fetchCrossModulePortalWidgets() {
    const result = {
        hadirBirthdays: null,
        hadirPrayers: null,
        pembangunanProgress: null
    };

    try {
        const [jemaatRes, doaRes, pmbRow] = await Promise.all([
            supabasePortal.from('hadir_jemaat').select('id, nama, tgl_lahir, kelas_nama, sub_kelas_nama').not('tgl_lahir', 'is', null),
            supabasePortal.from('hadir_doa').select('id, tanggal, nama, permohonan').order('created_at', { ascending: false }).limit(20),
            supabasePortal.from('config').select('key, value').in('key', ['pembangunan_main_blob', 'target_pembangunan'])
        ]);

        if (jemaatRes.data && jemaatRes.data.length > 0) {
            result.hadirBirthdays = jemaatRes.data
                .filter(j => j.nama && j.tgl_lahir)
                .map(j => {
                    const parts = String(j.tgl_lahir).trim().split(/[-/]/);
                    let m = 1, d = 1;
                    if (parts.length >= 3) {
                        if (parts[0].length === 4) {
                            m = parseInt(parts[1], 10) || 1;
                            d = parseInt(parts[2], 10) || 1;
                        } else {
                            d = parseInt(parts[0], 10) || 1;
                            m = parseInt(parts[1], 10) || 1;
                        }
                    }
                    return {
                        id: `hadir_bday_${j.id}`,
                        nama: j.nama,
                        birthMonth: m,
                        birthDay: d,
                        birthDate: j.tgl_lahir,
                        kategori: j.sub_kelas_nama || j.kelas_nama || 'Anggota Jemaat',
                        wa: '',
                        fromHadir: true
                    };
                });
        }

        if (doaRes.data && doaRes.data.length > 0) {
            result.hadirPrayers = doaRes.data.map(d => ({
                id: `hadir_doa_${d.id}`,
                senderName: d.nama || 'Anggota Jemaat',
                isAnonymous: false,
                category: 'Doa Syafaat',
                content: d.permohonan || '',
                privacy: 'public',
                prayedCount: 1,
                isAnswered: false,
                createdAt: d.tanggal ? new Date(d.tanggal).toISOString() : new Date().toISOString(),
                fromHadir: true
            })).filter(d => d.content);
        }

        if (pmbRow.data && pmbRow.data.length > 0) {
            const pmbMap = {};
            pmbRow.data.forEach(r => { pmbMap[r.key] = safeJsonParse(r.value, r.value); });
            if (pmbMap.pembangunan_main_blob?.statistik) {
                result.pembangunanProgress = pmbMap.pembangunan_main_blob.statistik;
            }
        }
    } catch (err) {
        console.warn('[SupabasePortal] Cross-module fetch warning:', err.message);
    }

    return result;
}

/**
 * Sinkronisasi Cloud Catatan Sekolah Sabat, Refleksi & Highlight Alkitab Jemaat (Tahap 5)
 */
export async function saveUserStudySync(syncCode, studyPayload) {
    const cleanCode = String(syncCode || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanCode || cleanCode.length < 4) {
        throw new Error('Kode Sinkronisasi minimal 4 karakter (contoh: nomor HP atau kode unik Anda).');
    }
    const key = `user_sync_${cleanCode}`;
    const valueObj = {
        updatedAt: new Date().toISOString(),
        ...studyPayload
    };
    const { error } = await supabasePortal
        .from('config')
        .upsert([{ key, value: JSON.stringify(valueObj) }], { onConflict: 'key' });
    if (error) throw error;
    return valueObj;
}

export async function loadUserStudySync(syncCode) {
    const cleanCode = String(syncCode || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanCode || cleanCode.length < 4) {
        throw new Error('Kode Sinkronisasi minimal 4 karakter.');
    }
    const key = `user_sync_${cleanCode}`;
    const { data, error } = await supabasePortal
        .from('config')
        .select('value')
        .eq('key', key)
        .maybeSingle();
    if (error) throw error;
    if (!data || !data.value) return null;
    return safeJsonParse(data.value, null);
}
