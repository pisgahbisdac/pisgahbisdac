import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
 * Mengambil seluruh data Hadir dari Supabase
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

        // 3. Fetch Users
        const { data: rawUsers, error: errU } = await supabase.from('hadir_users').select('*');
        if (errU) throw errU;

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
        const users = (rawUsers || []).map(u => ({ nama: u.nama, subKelasNama: u.sub_kelas_nama, pin: u.pin }));

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
 */
export async function saveHadirToSupabase(payload = {}, activeAdminPin = null) {
    try {
        const promises = [];

        // 1. Simpan Jemaat
        if (payload.jemaat) {
            const rows = payload.jemaat.map(j => ({
                id: j.id,
                nama: j.nama,
                gender: j.gender,
                tgl_lahir: j.tglLahir || '',
                status_baptis: j.statusBaptis,
                status_jemaat: j.statusJemaat,
                kelas_nama: j.kelasNama,
                sub_kelas_nama: j.subKelasNama
            }));
            if (rows.length > 0) {
                promises.push(supabase.from('hadir_jemaat').upsert(rows, { onConflict: 'id' }));
            }
        }

        // 2. Simpan Kelas
        if (payload.kelas) {
            const rows = payload.kelas.map(k => ({ nama: k.nama }));
            if (rows.length > 0) {
                promises.push(supabase.from('hadir_kelas').upsert(rows, { onConflict: 'nama' }));
            }
        }

        // 3. Simpan Sub-Kelas
        if (payload.subKelas) {
            const rows = payload.subKelas.map(s => ({ nama: s.nama, kelas_nama: s.kelasNama }));
            if (rows.length > 0) {
                promises.push(supabase.from('hadir_sub_kelas').upsert(rows, { onConflict: 'nama' }));
            }
        }

        // 4. Simpan Users
        if (payload.users || activeAdminPin !== null) {
            const usersToSave = [...(payload.users || [])];
            if (activeAdminPin !== null && !usersToSave.some(u => u.nama === 'Admin Utama (Backup PIN)')) {
                usersToSave.push({ nama: 'Admin Utama (Backup PIN)', subKelasNama: 'Kebaktian Khotbah (Umum)', pin: activeAdminPin });
            }
            const rows = usersToSave.map(u => ({
                nama: u.nama,
                sub_kelas_nama: u.subKelasNama,
                pin: String(u.pin)
            }));
            if (rows.length > 0) {
                promises.push(supabase.from('hadir_users').upsert(rows, { onConflict: 'nama' }));
            }
        }

        // 5. Simpan Absen
        if (payload.absen && payload.absen.length > 0) {
            const rows = payload.absen.map(a => ({
                tanggal: a.tanggal,
                jemaat_nama: a.jemaatNama,
                status: a.status,
                sesi: a.sesi,
                sub_kelas_nama: a.subKelasNama || ''
            }));
            // Lakukan upsert dalam chunks 100 agar aman
            for (let i = 0; i < rows.length; i += 100) {
                const chunk = rows.slice(i, i + 100);
                promises.push(supabase.from('hadir_absen').upsert(chunk, { onConflict: 'tanggal,jemaat_nama,sesi' }));
            }
        }

        // 6. Simpan Tamu Tambahan
        if (payload.tamuTambahan && payload.tamuTambahan.length > 0) {
            const rows = payload.tamuTambahan.map(t => ({
                tanggal: t.tanggal,
                sesi: t.sesi,
                sub_kelas_nama: t.subKelasNama,
                jumlah: Number(t.jumlah) || 0
            }));
            promises.push(supabase.from('hadir_tamu').upsert(rows, { onConflict: 'tanggal,sesi,sub_kelas_nama' }));
        }

        // 7. Simpan Keterlibatan
        if (payload.keterlibatan && payload.keterlibatan.length > 0) {
            const rows = payload.keterlibatan.map(k => ({
                tanggal: k.tanggal,
                sub_kelas_nama: k.subKelasNama,
                values: k.values || {}
            }));
            promises.push(supabase.from('hadir_keterlibatan').upsert(rows, { onConflict: 'tanggal,sub_kelas_nama' }));
        }

        // 8. Simpan Doa List
        if (payload.doaList && payload.doaList.length > 0) {
            const rows = payload.doaList.map(d => ({
                id: d.id,
                nama: d.nama,
                no_hp: d.noHp,
                permohonan: d.permohonan,
                tanggal: d.tanggal
            }));
            promises.push(supabase.from('hadir_doa').upsert(rows, { onConflict: 'id' }));
        }

        const results = await Promise.all(promises);
        for (const res of results) {
            if (res.error) throw res.error;
        }

        return { success: true };
    } catch (err) {
        console.error('[Supabase Hadir] Save error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Hapus Jemaat beserta riwayat absensinya dari Supabase
 */
export async function deleteJemaatFromSupabase(id, nama) {
    try {
        const { error: errA } = await supabase.from('hadir_absen').delete().eq('jemaat_nama', nama);
        if (errA) throw errA;
        const { error: errJ } = await supabase.from('hadir_jemaat').delete().eq('id', id);
        if (errJ) throw errJ;
        return { success: true };
    } catch (err) {
        console.error('[Supabase Hadir] Delete Jemaat error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Hapus User/Petugas dari Supabase
 */
export async function deleteUserFromSupabase(nama) {
    try {
        const { error } = await supabase.from('hadir_users').delete().eq('nama', nama);
        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error('[Supabase Hadir] Delete User error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Hapus Kategori Kelas / Sub-Kelas dari Supabase
 */
export async function deleteKelasFromSupabase(nama, type) {
    try {
        if (type === 'kelas') {
            await supabase.from('hadir_sub_kelas').delete().eq('kelas_nama', nama);
            const { error } = await supabase.from('hadir_kelas').delete().eq('nama', nama);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('hadir_sub_kelas').delete().eq('nama', nama);
            if (error) throw error;
        }
        return { success: true };
    } catch (err) {
        console.error('[Supabase Hadir] Delete Kelas error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Hapus Permohonan Doa dari Supabase
 */
export async function deleteDoaFromSupabase(id) {
    try {
        const { error } = await supabase.from('hadir_doa').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error('[Supabase Hadir] Delete Doa error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Migrasi seluruh data dari Google Apps Script ke Supabase
 */
export async function migrateAllDataToSupabase(gasData, onProgress = () => {}) {
    try {
        onProgress('Menyiapkan migrasi kelas...');
        if (gasData.kelas && gasData.kelas.length > 0) {
            const kRows = gasData.kelas.map(k => ({ nama: k.nama }));
            await supabase.from('hadir_kelas').upsert(kRows, { onConflict: 'nama' });
        }

        onProgress('Menyimpan sub-kelas...');
        if (gasData.subKelas && gasData.subKelas.length > 0) {
            const sRows = gasData.subKelas.map(s => ({ nama: s.nama, kelas_nama: s.kelasNama }));
            await supabase.from('hadir_sub_kelas').upsert(sRows, { onConflict: 'nama' });
        }

        onProgress('Menyimpan data jemaat...');
        if (gasData.jemaat && gasData.jemaat.length > 0) {
            const jRows = gasData.jemaat.map(j => ({
                id: j.id,
                nama: j.nama,
                gender: j.gender,
                tgl_lahir: j.tglLahir || '',
                status_baptis: j.statusBaptis,
                status_jemaat: j.statusJemaat,
                kelas_nama: j.kelasNama,
                sub_kelas_nama: j.subKelasNama
            }));
            await supabase.from('hadir_jemaat').upsert(jRows, { onConflict: 'id' });
        }

        onProgress('Menyimpan akun petugas...');
        if (gasData.users && gasData.users.length > 0) {
            const uRows = gasData.users.map(u => ({
                nama: u.nama,
                sub_kelas_nama: u.subKelasNama,
                pin: String(u.pin)
            }));
            await supabase.from('hadir_users').upsert(uRows, { onConflict: 'nama' });
        }

        onProgress('Menyimpan riwayat presensi...');
        if (gasData.absen && gasData.absen.length > 0) {
            const rawAbsen = gasData.absen.filter(a => a.jemaatNama !== 'Tamu Tambahan');
            const total = rawAbsen.length;
            for (let i = 0; i < total; i += 100) {
                const chunk = rawAbsen.slice(i, i + 100).map(a => ({
                    tanggal: a.tanggal,
                    jemaat_nama: a.jemaatNama,
                    status: a.status,
                    sesi: a.sesi,
                    sub_kelas_nama: a.subKelasNama || ''
                }));
                await supabase.from('hadir_absen').upsert(chunk, { onConflict: 'tanggal,jemaat_nama,sesi' });
                onProgress(`Menyimpan presensi (${Math.min(i + 100, total)} / ${total})...`);
            }
        }

        onProgress('Menyimpan tamu & keterlibatan...');
        if (gasData.tamuTambahan && gasData.tamuTambahan.length > 0) {
            const tRows = gasData.tamuTambahan.map(t => ({
                tanggal: t.tanggal,
                sesi: t.sesi,
                sub_kelas_nama: t.subKelasNama,
                jumlah: Number(t.jumlah) || 0
            }));
            await supabase.from('hadir_tamu').upsert(tRows, { onConflict: 'tanggal,sesi,sub_kelas_nama' });
        }

        if (gasData.keterlibatan && gasData.keterlibatan.length > 0) {
            const ketRows = gasData.keterlibatan.map(k => ({
                tanggal: k.tanggal,
                sub_kelas_nama: k.subKelasNama,
                values: k.values || {}
            }));
            await supabase.from('hadir_keterlibatan').upsert(ketRows, { onConflict: 'tanggal,sub_kelas_nama' });
        }

        if (gasData.doaList && gasData.doaList.length > 0) {
            const dRows = gasData.doaList.map(d => ({
                id: d.id,
                nama: d.nama,
                no_hp: d.noHp,
                permohonan: d.permohonan,
                tanggal: d.tanggal
            }));
            await supabase.from('hadir_doa').upsert(dRows, { onConflict: 'id' });
        }

        onProgress('Migrasi selesai!');
        return { success: true };
    } catch (err) {
        console.error('[Supabase Hadir] Migration error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Memvalidasi PIN langsung (live real-time) ke tabel hadir_users di Supabase
 */
export async function verifyHadirPinWithSupabase(pin) {
    try {
        const isReady = await checkSupabaseHadirTables();
        if (!isReady) return null; // fallback jika tabel belum siap
        
        const cleanPin = String(pin).trim();
        const { data, error } = await supabase
            .from('hadir_users')
            .select('*')
            .eq('pin', cleanPin);

        if (error || !data || data.length === 0) {
            return { verified: false };
        }

        const adminUser = data.find(u => u.nama === 'Admin Utama (Backup PIN)');
        if (adminUser) {
            return { verified: true, role: 'admin', user: null, pin: adminUser.pin };
        }

        const matchedUser = data[0];
        return {
            verified: true,
            role: 'user',
            user: { nama: matchedUser.nama, subKelasNama: matchedUser.sub_kelas_nama, pin: matchedUser.pin }
        };
    } catch (err) {
        console.warn('[Supabase Hadir] Live PIN verification error:', err);
        return null;
    }
}

