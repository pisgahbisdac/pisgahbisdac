import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';

// URL Edge Function untuk semua operasi TULIS (service_role diamankan di server)
const EDGE_WRITE_URL = `${SUPABASE_URL}/functions/v1/hadir-write`;

// Client hanya untuk READ (SELECT) — anon key aman untuk baca
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Helper: Kirim request ke Edge Function hadir-write (operasi tulis)
 * @param {string} action - nama aksi
 * @param {object} payload - data yang dikirim
 * @param {string} pin - PIN petugas/admin untuk otorisasi
 */
async function callWriteFunction(action, payload, pin) {
    try {
        const res = await fetch(EDGE_WRITE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ action, payload, pin }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
            throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        return { success: true, data };
    } catch (err) {
        console.error(`[Edge Function] ${action} error:`, err);
        return { success: false, error: err.message };
    }
}

/**
 * Memeriksa apakah tabel hadir di Supabase sudah dibuat
 */
export async function checkSupabaseHadirTables() {
    try {
        const { error } = await supabase.from('hadir_jemaat').select('id').limit(1);
        if (error) {
            console.warn('[Supabase Hadir] Check failed or table not found:', error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.warn('[Supabase Hadir] Exception checking tables:', e);
        return false;
    }
}

/**
 * Mengambil seluruh data Hadir dari Supabase (READ-ONLY via anon key)
 */
export async function fetchHadirFromSupabase() {
    try {
        // 1. Fetch Jemaat
        const { data: rawJemaat, error: errJ } = await supabase.from('hadir_jemaat').select('*').order('nama');
        if (errJ) throw errJ;

        // 2. Fetch Kelas & Sub-Kelas
        const { data: rawKelas, error: errK } = await supabase.from('hadir_kelas').select('*');
        if (errK) throw errK;

        const { data: rawSubKelas, error: errSub } = await supabase.from('hadir_sub_kelas').select('*');
        if (errSub) throw errSub;

        // 3. Fetch Users (nama & sub_kelas_nama saja, PIN disembunyikan di server)
        const { data: rawUsers, error: errU } = await supabase.from('hadir_users').select('nama, sub_kelas_nama');
        if (errU) {
            // hadir_users mungkin diblokir untuk anon — fallback ke array kosong
            console.warn('[Supabase Hadir] hadir_users tidak dapat diakses via anon:', errU.message);
        }

        // 4. Fetch Absen dengan pagination (karena default Supabase limit 1000)
        let allAbsen = [];
        let from = 0;
        const step = 1000;
        while (true) {
            const { data: chunk, error: errA } = await supabase
                .from('hadir_absen')
                .select('*')
                .order('tanggal', { ascending: false })
                .range(from, from + step - 1);
            if (errA) throw errA;
            if (!chunk || chunk.length === 0) break;
            allAbsen = allAbsen.concat(chunk);
            if (chunk.length < step) break;
            from += step;
        }

        // 5. Fetch Tamu Tambahan
        const { data: rawTamu, error: errT } = await supabase.from('hadir_tamu').select('*');
        if (errT) throw errT;

        // 6. Fetch Keterlibatan
        const { data: rawKeterlibatan, error: errKet } = await supabase.from('hadir_keterlibatan').select('*');
        if (errKet) throw errKet;

        // 7. Fetch Doa List
        const { data: rawDoa, error: errD } = await supabase.from('hadir_doa').select('*').order('created_at', { ascending: false });
        if (errD) throw errD;

        // Format ke struktur data aplikasi hadir
        const jemaat = (rawJemaat || []).map(j => ({
            id: j.id,
            nama: j.nama,
            gender: j.gender,
            tglLahir: j.tgl_lahir || '',
            statusBaptis: j.status_baptis,
            statusJemaat: j.status_jemaat,
            kelasNama: j.kelas_nama,
            subKelasNama: j.sub_kelas_nama
        }));

        const kelas = (rawKelas || []).map(k => ({ nama: k.nama }));
        const subKelas = (rawSubKelas || []).map(s => ({ nama: s.nama, kelasNama: s.kelas_nama }));
        // PIN tidak diambil dari sini — hanya nama & subKelas untuk tampilan
        const users = (rawUsers || []).map(u => ({ nama: u.nama, subKelasNama: u.sub_kelas_nama, pin: null }));

        const absen = allAbsen.map(a => ({
            tanggal: a.tanggal,
            jemaatNama: a.jemaat_nama,
            status: a.status,
            sesi: a.sesi,
            subKelasNama: a.sub_kelas_nama || ''
        }));

        const tamuTambahan = (rawTamu || []).map(t => ({
            tanggal: t.tanggal,
            sesi: t.sesi,
            subKelasNama: t.sub_kelas_nama,
            jumlah: Number(t.jumlah) || 0
        }));

        const keterlibatan = (rawKeterlibatan || []).map(k => ({
            tanggal: k.tanggal,
            subKelasNama: k.sub_kelas_nama,
            values: k.values || {}
        }));

        const doaList = (rawDoa || []).map(d => ({
            id: d.id,
            nama: d.nama,
            noHp: d.no_hp,
            permohonan: d.permohonan,
            tanggal: d.tanggal
        }));

        return {
            success: true,
            data: {
                jemaat,
                kelas,
                subKelas,
                users,
                absen,
                tamuTambahan,
                keterlibatan,
                doaList
            }
        };
    } catch (err) {
        console.error('[Supabase Hadir] Fetch error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Menyimpan data delta/override ke Supabase
 * — Diarahkan ke Edge Function hadir-write (service_role di server)
 */
export async function saveHadirToSupabase(payload = {}, activeAdminPin = null) {
    return callWriteFunction('save_hadir', { ...payload, activeAdminPin }, activeAdminPin);
}

/**
 * Hapus Jemaat beserta riwayat absensinya dari Supabase
 */
export async function deleteJemaatFromSupabase(id, nama, adminPin) {
    return callWriteFunction('delete_jemaat', { id, nama }, adminPin);
}

/**
 * Hapus User/Petugas dari Supabase
 */
export async function deleteUserFromSupabase(nama, adminPin) {
    return callWriteFunction('delete_user', { nama }, adminPin);
}

/**
 * Hapus Kategori Kelas / Sub-Kelas dari Supabase
 */
export async function deleteKelasFromSupabase(nama, type, adminPin) {
    return callWriteFunction('delete_kelas', { nama, type }, adminPin);
}

/**
 * Hapus Permohonan Doa dari Supabase
 */
export async function deleteDoaFromSupabase(id, adminPin) {
    return callWriteFunction('delete_doa', { id }, adminPin);
}

/**
 * Migrasi seluruh data dari Google Apps Script ke Supabase
 */
export async function migrateAllDataToSupabase(gasData, onProgress = () => {}, adminPin) {
    onProgress('Mengirim data ke server...');
    const result = await callWriteFunction('migrate_all', { gasData }, adminPin);
    if (result.success) {
        onProgress('Migrasi selesai!');
    }
    return result;
}

/**
 * Memvalidasi PIN langsung (live).
 * Prioritas: Edge Function (service_role aman) → fallback ke query langsung (anon)
 */
export async function verifyHadirPinWithSupabase(pin) {
    try {
        const isReady = await checkSupabaseHadirTables();
        if (!isReady) return null;

        const cleanPin = String(pin).trim();

        // === JALUR 1: Edge Function (aman, service_role di server) ===
        try {
            const res = await fetch(EDGE_WRITE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ action: 'verify_pin', payload: {}, pin: cleanPin }),
                signal: AbortSignal.timeout(5000), // timeout 5 detik
            });

            if (res.ok) {
                const data = await res.json();
                if (!data.error) return data; // { verified, role, user }
            }
        } catch (edgeErr) {
            console.warn('[Supabase Hadir] Edge Function tidak tersedia, fallback ke DB langsung:', edgeErr.message);
        }

        // === JALUR 2: Fallback — query langsung ke hadir_users via anon ===
        // (Digunakan saat Edge Function belum di-deploy)
        const { data: users, error: pinErr } = await supabase
            .from('hadir_users')
            .select('nama, sub_kelas_nama, pin')
            .eq('pin', cleanPin);

        if (pinErr || !users || users.length === 0) {
            return { verified: false };
        }

        const isAdmin = users.some(u => u.nama === 'Admin Utama (Backup PIN)');
        const matchedUser = users[0];

        if (isAdmin) {
            return { verified: true, role: 'admin', user: null, pin: matchedUser.pin };
        }
        return {
            verified: true,
            role: 'user',
            user: { nama: matchedUser.nama, subKelasNama: matchedUser.sub_kelas_nama, pin: matchedUser.pin }
        };

    } catch (err) {
        console.warn('[Supabase Hadir] PIN verification error:', err);
        return null;
    }
}
