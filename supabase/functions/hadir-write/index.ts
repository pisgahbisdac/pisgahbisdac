/**
 * SUPABASE EDGE FUNCTION: hadir-write
 * ─────────────────────────────────────────────────────────────────────────────
 * Menangani semua operasi TULIS (INSERT / UPDATE / DELETE / UPSERT) ke database
 * Bisdac secara aman menggunakan service_role key di sisi server.
 *
 * Frontend hanya menggunakan anon key (READ-ONLY).
 * Semua operasi tulis harus melewati Edge Function ini dengan verifikasi PIN.
 *
 * Request body (POST application/json):
 * {
 *   "pin": "1234",          // PIN petugas atau admin
 *   "action": "save_hadir", // nama aksi (lihat daftar di bawah)
 *   "payload": { ... }      // data yang akan disimpan
 * }
 *
 * Daftar action yang didukung:
 *   - save_hadir           → upsert jemaat, kelas, absen, users, dll (bulk)
 *   - delete_jemaat        → hapus jemaat + absensinya
 *   - delete_user          → hapus petugas
 *   - delete_kelas         → hapus kelas atau sub-kelas
 *   - delete_doa           → hapus permohonan doa
 *   - migrate_all          → migrasi massal dari GAS ke Supabase
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Buat client dengan service_role key (disimpan sebagai Supabase Secret)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body = await req.json();
    const { pin, action, payload } = body;

    // ─── Validasi input dasar ───────────────────────────────────────────────
    if (!pin || !action) {
      return json({ error: 'PIN dan action wajib diisi' }, 400);
    }

    // ─── Verifikasi PIN ─────────────────────────────────────────────────────
    const cleanPin = String(pin).trim();
    const { data: users, error: pinErr } = await supabaseAdmin
      .from('hadir_users')
      .select('nama, sub_kelas_nama, pin')
      .eq('pin', cleanPin);

    if (pinErr || !users || users.length === 0) {
      return json({ error: 'PIN tidak valid atau tidak dikenali' }, 403);
    }

    const isAdmin = users.some(u => u.nama === 'Admin Utama (Backup PIN)');
    const matchedUser = users[0];

    // Aksi tertentu hanya untuk admin
    const adminOnlyActions = ['delete_jemaat', 'delete_user', 'delete_kelas', 'migrate_all'];
    if (adminOnlyActions.includes(action) && !isAdmin) {
      return json({ error: 'Akses ditolak. Hanya Admin yang dapat melakukan aksi ini.' }, 403);
    }

    // ─── Eksekusi aksi ──────────────────────────────────────────────────────
    switch (action) {

      case 'save_hadir': {
        // Upsert semua tabel dari payload delta
        const errors: string[] = [];

        if (payload.jemaat?.length > 0) {
          const rows = payload.jemaat.map((j: any) => ({
            id: j.id, nama: j.nama, gender: j.gender,
            tgl_lahir: j.tglLahir || '', status_baptis: j.statusBaptis,
            status_jemaat: j.statusJemaat, kelas_nama: j.kelasNama,
            sub_kelas_nama: j.subKelasNama,
          }));
          const { error } = await supabaseAdmin.from('hadir_jemaat').upsert(rows, { onConflict: 'id' });
          if (error) errors.push(`jemaat: ${error.message}`);
        }

        if (payload.kelas?.length > 0) {
          const rows = payload.kelas.map((k: any) => ({ nama: k.nama }));
          const { error } = await supabaseAdmin.from('hadir_kelas').upsert(rows, { onConflict: 'nama' });
          if (error) errors.push(`kelas: ${error.message}`);
        }

        if (payload.subKelas?.length > 0) {
          const rows = payload.subKelas.map((s: any) => ({ nama: s.nama, kelas_nama: s.kelasNama }));
          const { error } = await supabaseAdmin.from('hadir_sub_kelas').upsert(rows, { onConflict: 'nama' });
          if (error) errors.push(`sub_kelas: ${error.message}`);
        }

        if (payload.users?.length > 0 || payload.activeAdminPin != null) {
          const usersToSave = [...(payload.users || [])];
          if (payload.activeAdminPin != null && !usersToSave.some((u: any) => u.nama === 'Admin Utama (Backup PIN)')) {
            usersToSave.push({ nama: 'Admin Utama (Backup PIN)', subKelasNama: 'Kebaktian Khotbah (Umum)', pin: payload.activeAdminPin });
          }
          const rows = usersToSave.map((u: any) => ({
            nama: u.nama, sub_kelas_nama: u.subKelasNama, pin: String(u.pin),
          }));
          if (rows.length > 0) {
            const { error } = await supabaseAdmin.from('hadir_users').upsert(rows, { onConflict: 'nama' });
            if (error) errors.push(`users: ${error.message}`);
          }
        }

        if (payload.absen?.length > 0) {
          for (let i = 0; i < payload.absen.length; i += 100) {
            const chunk = payload.absen.slice(i, i + 100).map((a: any) => ({
              tanggal: a.tanggal, jemaat_nama: a.jemaatNama,
              status: a.status, sesi: a.sesi, sub_kelas_nama: a.subKelasNama || '',
            }));
            const { error } = await supabaseAdmin.from('hadir_absen').upsert(chunk, { onConflict: 'tanggal,jemaat_nama,sesi' });
            if (error) errors.push(`absen[${i}]: ${error.message}`);
          }
        }

        if (payload.tamuTambahan?.length > 0) {
          const rows = payload.tamuTambahan.map((t: any) => ({
            tanggal: t.tanggal, sesi: t.sesi,
            sub_kelas_nama: t.subKelasNama, jumlah: Number(t.jumlah) || 0,
          }));
          const { error } = await supabaseAdmin.from('hadir_tamu').upsert(rows, { onConflict: 'tanggal,sesi,sub_kelas_nama' });
          if (error) errors.push(`tamu: ${error.message}`);
        }

        if (payload.keterlibatan?.length > 0) {
          const rows = payload.keterlibatan.map((k: any) => ({
            tanggal: k.tanggal, sub_kelas_nama: k.subKelasNama, values: k.values || {},
          }));
          const { error } = await supabaseAdmin.from('hadir_keterlibatan').upsert(rows, { onConflict: 'tanggal,sub_kelas_nama' });
          if (error) errors.push(`keterlibatan: ${error.message}`);
        }

        if (payload.doaList?.length > 0) {
          const rows = payload.doaList.map((d: any) => ({
            id: d.id, nama: d.nama, no_hp: d.noHp, permohonan: d.permohonan, tanggal: d.tanggal,
          }));
          const { error } = await supabaseAdmin.from('hadir_doa').upsert(rows, { onConflict: 'id' });
          if (error) errors.push(`doa: ${error.message}`);
        }

        if (errors.length > 0) return json({ error: errors.join('; ') }, 500);
        return json({ success: true });
      }

      case 'delete_jemaat': {
        const { id, nama } = payload;
        if (!id || !nama) return json({ error: 'id dan nama jemaat wajib diisi' }, 400);
        const { error: errA } = await supabaseAdmin.from('hadir_absen').delete().eq('jemaat_nama', nama);
        if (errA) return json({ error: errA.message }, 500);
        const { error: errJ } = await supabaseAdmin.from('hadir_jemaat').delete().eq('id', id);
        if (errJ) return json({ error: errJ.message }, 500);
        return json({ success: true });
      }

      case 'delete_user': {
        const { nama } = payload;
        if (!nama) return json({ error: 'nama user wajib diisi' }, 400);
        const { error } = await supabaseAdmin.from('hadir_users').delete().eq('nama', nama);
        if (error) return json({ error: error.message }, 500);
        return json({ success: true });
      }

      case 'delete_kelas': {
        const { nama, type } = payload;
        if (!nama || !type) return json({ error: 'nama dan type wajib diisi' }, 400);
        if (type === 'kelas') {
          await supabaseAdmin.from('hadir_sub_kelas').delete().eq('kelas_nama', nama);
          const { error } = await supabaseAdmin.from('hadir_kelas').delete().eq('nama', nama);
          if (error) return json({ error: error.message }, 500);
        } else {
          const { error } = await supabaseAdmin.from('hadir_sub_kelas').delete().eq('nama', nama);
          if (error) return json({ error: error.message }, 500);
        }
        return json({ success: true });
      }

      case 'delete_doa': {
        const { id } = payload;
        if (!id) return json({ error: 'id doa wajib diisi' }, 400);
        const { error } = await supabaseAdmin.from('hadir_doa').delete().eq('id', id);
        if (error) return json({ error: error.message }, 500);
        return json({ success: true });
      }

      case 'migrate_all': {
        // Migrasi massal - hanya admin
        const { gasData } = payload;
        const errors: string[] = [];

        if (gasData?.kelas?.length > 0) {
          const rows = gasData.kelas.map((k: any) => ({ nama: k.nama }));
          const { error } = await supabaseAdmin.from('hadir_kelas').upsert(rows, { onConflict: 'nama' });
          if (error) errors.push(`kelas: ${error.message}`);
        }
        if (gasData?.subKelas?.length > 0) {
          const rows = gasData.subKelas.map((s: any) => ({ nama: s.nama, kelas_nama: s.kelasNama }));
          const { error } = await supabaseAdmin.from('hadir_sub_kelas').upsert(rows, { onConflict: 'nama' });
          if (error) errors.push(`sub_kelas: ${error.message}`);
        }
        if (gasData?.jemaat?.length > 0) {
          const rows = gasData.jemaat.map((j: any) => ({
            id: j.id, nama: j.nama, gender: j.gender, tgl_lahir: j.tglLahir || '',
            status_baptis: j.statusBaptis, status_jemaat: j.statusJemaat,
            kelas_nama: j.kelasNama, sub_kelas_nama: j.subKelasNama,
          }));
          const { error } = await supabaseAdmin.from('hadir_jemaat').upsert(rows, { onConflict: 'id' });
          if (error) errors.push(`jemaat: ${error.message}`);
        }
        if (gasData?.users?.length > 0) {
          const rows = gasData.users.map((u: any) => ({
            nama: u.nama, sub_kelas_nama: u.subKelasNama, pin: String(u.pin),
          }));
          const { error } = await supabaseAdmin.from('hadir_users').upsert(rows, { onConflict: 'nama' });
          if (error) errors.push(`users: ${error.message}`);
        }
        if (gasData?.absen?.length > 0) {
          const rawAbsen = gasData.absen.filter((a: any) => a.jemaatNama !== 'Tamu Tambahan');
          for (let i = 0; i < rawAbsen.length; i += 100) {
            const chunk = rawAbsen.slice(i, i + 100).map((a: any) => ({
              tanggal: a.tanggal, jemaat_nama: a.jemaatNama,
              status: a.status, sesi: a.sesi, sub_kelas_nama: a.subKelasNama || '',
            }));
            const { error } = await supabaseAdmin.from('hadir_absen').upsert(chunk, { onConflict: 'tanggal,jemaat_nama,sesi' });
            if (error) errors.push(`absen[${i}]: ${error.message}`);
          }
        }
        if (gasData?.tamuTambahan?.length > 0) {
          const rows = gasData.tamuTambahan.map((t: any) => ({
            tanggal: t.tanggal, sesi: t.sesi,
            sub_kelas_nama: t.subKelasNama, jumlah: Number(t.jumlah) || 0,
          }));
          const { error } = await supabaseAdmin.from('hadir_tamu').upsert(rows, { onConflict: 'tanggal,sesi,sub_kelas_nama' });
          if (error) errors.push(`tamu: ${error.message}`);
        }
        if (gasData?.keterlibatan?.length > 0) {
          const rows = gasData.keterlibatan.map((k: any) => ({
            tanggal: k.tanggal, sub_kelas_nama: k.subKelasNama, values: k.values || {},
          }));
          const { error } = await supabaseAdmin.from('hadir_keterlibatan').upsert(rows, { onConflict: 'tanggal,sub_kelas_nama' });
          if (error) errors.push(`keterlibatan: ${error.message}`);
        }
        if (gasData?.doaList?.length > 0) {
          const rows = gasData.doaList.map((d: any) => ({
            id: d.id, nama: d.nama, no_hp: d.noHp, permohonan: d.permohonan, tanggal: d.tanggal,
          }));
          const { error } = await supabaseAdmin.from('hadir_doa').upsert(rows, { onConflict: 'id' });
          if (error) errors.push(`doa: ${error.message}`);
        }

        if (errors.length > 0) return json({ error: errors.join('; ') }, 500);
        return json({ success: true });
      }

      case 'verify_pin': {
        // Verifikasi PIN — hasilnya dikembalikan ke frontend tanpa mengekspos data PIN lain
        const isAdmin = users.some((u: any) => u.nama === 'Admin Utama (Backup PIN)');
        if (isAdmin) {
          return json({ verified: true, role: 'admin', user: null, pin: matchedUser.pin });
        }
        return json({
          verified: true,
          role: 'user',
          user: { nama: matchedUser.nama, subKelasNama: matchedUser.sub_kelas_nama },
        });
      }

      default:
        return json({ error: `Aksi tidak dikenal: ${action}` }, 400);
    }

  } catch (err: any) {
    console.error('[hadir-write] Unexpected error:', err);
    return json({ error: err?.message ?? 'Internal server error' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
