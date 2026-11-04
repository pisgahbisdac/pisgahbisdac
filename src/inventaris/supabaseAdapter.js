import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let _invVerifiedCache = { username: null, role: null, nama: null, ts: 0 };

function writeInvAuditLog(username, action, detail) {
  supabase
    .from('logs')
    .insert([{
      id: 'LOG-INV-' + Date.now(),
      timestamp: new Date().toISOString(),
      username: username || 'Admin',
      action,
      detail
    }])
    .then();
}

/**
 * Login cepat Inventaris via tabel `users` di Supabase (<150ms)
 */
export async function loginInventoryViaSupabase(username, password) {
  try {
    // 1. Prioritaskan RPC server-side (SECURITY DEFINER)
    const { data: rpcRows, error: rpcErr } = await supabase.rpc('verify_bisdac_user', {
      p_username: (username || '').trim(),
      p_password: password || ''
    });

    if (!rpcErr && Array.isArray(rpcRows)) {
      if (rpcRows.length === 0) {
        return { success: false, message: 'Username tidak ditemukan atau tidak aktif.' };
      }
      const row = rpcRows[0];
      if (!row.verified) {
        return { success: false, message: 'Password salah.' };
      }
      const tokenPayload = {
        username: row.username,
        role: row.role || 'Viewer',
        nama: row.nama || row.username,
        iat: Date.now()
      };
      const token = btoa(JSON.stringify(tokenPayload));
      _invVerifiedCache = {
        username: row.username,
        role: row.role || 'Viewer',
        nama: row.nama || row.username,
        ts: Date.now()
      };
      writeInvAuditLog(row.username, 'INV_LOGIN', 'Login Inventaris via Supabase RPC');
      return {
        success: true,
        token,
        role: row.role || 'Viewer',
        nama: row.nama || row.username,
        user: { username: row.username, role: row.role || 'Viewer', nama: row.nama || row.username }
      };
    }

    // 2. Fallback ke tabel `users` bila RPC belum dijalankan
    const { data, error } = await supabase
      .from('users')
      .select('username, password, role, nama, active')
      .ilike('username', (username || '').trim())
      .eq('active', true)
      .single();

    if (error || !data) {
      return { success: false, message: 'Username tidak ditemukan atau tidak aktif.' };
    }
    if (data.password !== password) {
      return { success: false, message: 'Password salah.' };
    }

    const tokenPayload = {
      username: data.username,
      role: data.role || 'Viewer',
      nama: data.nama || data.username,
      iat: Date.now()
    };
    const token = btoa(JSON.stringify(tokenPayload));
    _invVerifiedCache = {
      username: data.username,
      role: data.role || 'Viewer',
      nama: data.nama || data.username,
      ts: Date.now()
    };

    writeInvAuditLog(data.username, 'INV_LOGIN', 'Login Inventaris via Supabase');
    return {
      success: true,
      token,
      role: data.role || 'Viewer',
      nama: data.nama || data.username,
      user: { username: data.username, role: data.role || 'Viewer', nama: data.nama || data.username }
    };
  } catch (err) {
    console.warn('loginInventoryViaSupabase error:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Validasi hak akses tulis Inventaris terhadap tabel `users` di Supabase
 */
export async function verifyInventoryWriteAccess() {
  try {
    let parsed = {};
    const userStr = localStorage.getItem('BISDAC_user');
    if (userStr) {
      try { parsed = JSON.parse(userStr); } catch (_) {}
    }
    const tokenStr = localStorage.getItem('BISDAC_token');
    if (!parsed.username && tokenStr) {
      try { parsed = JSON.parse(atob(tokenStr)); } catch (_) {}
    }

    const candidateUsername = (parsed.username || '').trim();
    const localRole = localStorage.getItem('BISDAC_role') || parsed.role || '';
    const localName = localStorage.getItem('BISDAC_name') || parsed.nama || candidateUsername || 'Admin';

    const checkAllowedRole = (roleStr) => {
      const roles = String(roleStr || '').split(',').map(r => r.trim());
      return (
        roles.includes('Admin') ||
        roles.includes('Bendahara') ||
        roles.includes('Diakon') ||
        roles.includes('Ketua Jemaat') ||
        roles.includes('Pendeta')
      );
    };

    if (candidateUsername) {
      const now = Date.now();
      if (
        _invVerifiedCache.username &&
        _invVerifiedCache.username.toLowerCase() === candidateUsername.toLowerCase() &&
        now - _invVerifiedCache.ts < 15000
      ) {
        if (!checkAllowedRole(_invVerifiedCache.role)) {
          return { allowed: false, message: 'Akses ditolak: Role Anda tidak memiliki izin mengubah data inventaris.' };
        }
        return { allowed: true, username: _invVerifiedCache.username, role: _invVerifiedCache.role, nama: _invVerifiedCache.nama };
      }

      let verifiedRow = null;
      const { data: rpcRows, error: rpcErr } = await supabase.rpc('verify_bisdac_user', {
        p_username: candidateUsername,
        p_password: null
      });
      if (!rpcErr && Array.isArray(rpcRows) && rpcRows.length > 0 && rpcRows[0].verified) {
        verifiedRow = rpcRows[0];
      } else if (rpcErr) {
        const { data, error } = await supabase
          .from('users')
          .select('username, role, nama, active')
          .ilike('username', candidateUsername)
          .eq('active', true)
          .single();
        if (!error && data) verifiedRow = data;
      }

      if (verifiedRow) {
        _invVerifiedCache = {
          username: verifiedRow.username,
          role: verifiedRow.role || 'Viewer',
          nama: verifiedRow.nama || verifiedRow.username,
          ts: now
        };
        if (!checkAllowedRole(verifiedRow.role)) {
          return { allowed: false, message: 'Akses ditolak: Role Anda tidak memiliki izin mengubah data inventaris.' };
        }
        return { allowed: true, username: verifiedRow.username, role: verifiedRow.role, nama: verifiedRow.nama || verifiedRow.username };
      }
    }

    // Fallback bila token berasal dari GAS lama yang tidak menyertakan JSON username
    if (tokenStr && checkAllowedRole(localRole)) {
      return { allowed: true, username: localName, role: localRole, nama: localName };
    }

    return { allowed: false, message: 'Sesi Admin tidak valid atau telah berakhir. Silakan login kembali.' };
  } catch (err) {
    console.warn('verifyInventoryWriteAccess error:', err);
    return { allowed: false, message: 'Gagal memverifikasi sesi Admin.' };
  }
}

/**
 * Cek apakah Supabase online dan tabel inventaris siap
 */
export async function checkInventarisSupabaseHealth() {
  try {
    const { data, error } = await supabase
      .from('inventaris')
      .select('id')
      .limit(1);

    if (error) {
      console.warn('Supabase Inventaris check error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase network unreachable:', err);
    return false;
  }
}

/**
 * Ambil seluruh data inventaris dari Supabase (dengan auto-pagination)
 */
export async function fetchInventoryFromSupabase() {
  try {
    let allData = [];
    const pageSize = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('inventaris')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (data && data.length > 0) {
        allData = allData.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          from += pageSize;
        }
      } else {
        hasMore = false;
      }
    }

    return { success: true, data: allData };
  } catch (err) {
    console.error('fetchInventoryFromSupabase Error:', err);
    return { success: false, message: err.message, data: [] };
  }
}

/**
 * Simpan / Update data inventaris ke Supabase (dengan validasi hak akses & jejak audit)
 */
export async function saveInventoryToSupabase(item) {
  try {
    const auth = await verifyInventoryWriteAccess();
    if (!auth.allowed) {
      return { success: false, message: auth.message };
    }

    // Jika hanya update parsial (mis. status peminjaman dari loanModal)
    if (item.isUpdate && item.id && item.name === undefined) {
      const partialUpdate = {};
      if (item.loan_status !== undefined) partialUpdate.loan_status = item.loan_status;
      if (item.borrowed_by !== undefined) partialUpdate.borrowed_by = item.borrowed_by;
      if (item.expected_return_date !== undefined) partialUpdate.expected_return_date = item.expected_return_date;
      if (item.status !== undefined) partialUpdate.status = item.status;

      const { data, error } = await supabase
        .from('inventaris')
        .update(partialUpdate)
        .eq('id', item.id)
        .select();

      if (error) throw error;
      writeInvAuditLog(auth.username, 'INV_LOAN_UPDATE', `Update peminjaman ID: ${item.id} -> ${item.loan_status || '-'}`);
      return { success: true, data, message: 'Status peminjaman berhasil diperbarui di Supabase' };
    }

    const finalId = item.id ? String(item.id).trim() : ('INV-' + Date.now().toString().slice(-6));

    const cleanItem = {
      id: finalId,
      name: item.name,
      category: item.category || 'Lainnya',
      source: item.source || '',
      date_acquired: item.date_acquired || '',
      location: item.location || '',
      pic: item.pic || '',
      qty: parseFloat(item.qty) || 1,
      unit: item.unit || 'Unit',
      value: parseFloat(item.value) || 0,
      taksasi: parseFloat(item.taksasi) || 0,
      status: item.status || 'Active',
      dispose_reason: item.dispose_reason || '',
      dispose_price: parseFloat(item.dispose_price) || 0,
      loan_status: item.loan_status || 'Tersedia',
      borrowed_by: item.borrowed_by || '',
      expected_return_date: item.expected_return_date || '',
      sub_items: typeof item.sub_items === 'object' ? JSON.stringify(item.sub_items) : (item.sub_items || ''),
      photo: item.photo || '',
      pic2: item.pic2 || '',
      pic3: item.pic3 || '',
      pic4: item.pic4 || '',
      depreciation_years: parseFloat(item.depreciation_years) || 5,
      created_at: item.created_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('inventaris')
      .upsert(cleanItem, { onConflict: 'id' })
      .select();

    if (error) throw error;
    writeInvAuditLog(auth.username, item.isUpdate ? 'INV_EDIT' : 'INV_INSERT', `${item.isUpdate ? 'Edit' : 'Tambah'} aset: ${cleanItem.name} (${finalId})`);
    return { success: true, data, id: finalId, message: 'Data inventaris berhasil disimpan di Supabase' };
  } catch (err) {
    console.error('saveInventoryToSupabase Error:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Hapus aset inventaris dari Supabase (dengan validasi hak akses & jejak audit)
 */
export async function deleteInventoryFromSupabase(id) {
  try {
    const auth = await verifyInventoryWriteAccess();
    if (!auth.allowed) {
      return { success: false, message: auth.message };
    }

    const { error } = await supabase
      .from('inventaris')
      .delete()
      .eq('id', id);

    if (error) throw error;
    writeInvAuditLog(auth.username, 'INV_DELETE', `Hapus aset ID: ${id}`);
    return { success: true, message: 'Data berhasil dihapus dari Supabase' };
  } catch (err) {
    console.error('deleteInventoryFromSupabase Error:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Ambil riwayat servis aset dari Supabase
 */
export async function fetchInventoryServicesFromSupabase(inventoryId) {
  try {
    const { data, error } = await supabase
      .from('inventory_services')
      .select('*')
      .eq('inventory_id', inventoryId)
      .order('service_date', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('fetchInventoryServicesFromSupabase Error:', err);
    return { success: false, message: err.message, data: [] };
  }
}

/**
 * Simpan riwayat servis aset ke Supabase (dengan validasi hak akses & jejak audit)
 */
export async function saveInventoryServiceToSupabase(payload) {
  try {
    const auth = await verifyInventoryWriteAccess();
    if (!auth.allowed) {
      return { success: false, message: auth.message };
    }

    const row = {
      inventory_id: payload.inventory_id,
      service_date: payload.service_date,
      description: payload.description || '',
      cost: parseFloat(payload.cost) || 0,
      created_by: auth.nama || auth.username || 'Admin',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('inventory_services')
      .insert([row]);

    if (error) throw error;
    writeInvAuditLog(auth.username, 'INV_SERVICE', `Catat servis ID: ${payload.inventory_id} | Rp ${Number(row.cost).toLocaleString('id-ID')}`);
    return { success: true, message: 'Riwayat servis berhasil dicatat di Supabase' };
  } catch (err) {
    console.error('saveInventoryServiceToSupabase Error:', err);
    return { success: false, message: err.message };
  }
}

/**
 * 1-Klik Migrasi seluruh data dari Google Apps Script ke Supabase
 */
export async function migrateInventarisGASToSupabase(gasUrl, onProgress = () => {}) {
  try {
    onProgress('Menghubungi Google Apps Script...');
    const url = new URL(gasUrl);
    url.searchParams.set('action', 'getInventory');
    url.searchParams.set('_t', Date.now());

    const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) {
      throw new Error(json.message || 'Gagal mengambil data dari Google Apps Script');
    }

    const items = json.data;
    if (items.length === 0) {
      return { success: true, count: 0, message: 'Tidak ada data inventaris di Google Sheets untuk dimigrasikan.' };
    }

    onProgress(`Ditemukan ${items.length} aset. Memulai migrasi ke Supabase...`);

    const chunkSize = 50;
    let migratedCount = 0;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize).map(item => ({
        id: String(item.id),
        name: item.name || 'Tanpa Nama',
        category: item.category || 'Lainnya',
        source: item.source || '',
        date_acquired: item.date_acquired ? String(item.date_acquired) : '',
        location: item.location || '',
        pic: item.pic || '',
        qty: parseFloat(item.qty) || 1,
        unit: item.unit || 'Unit',
        value: parseFloat(item.value) || 0,
        taksasi: parseFloat(item.taksasi) || 0,
        status: item.status || 'Active',
        dispose_reason: item.dispose_reason || '',
        dispose_price: parseFloat(item.dispose_price) || 0,
        loan_status: item.loan_status || 'Tersedia',
        borrowed_by: item.borrowed_by || '',
        expected_return_date: item.expected_return_date || '',
        sub_items: typeof item.sub_items === 'object' ? JSON.stringify(item.sub_items) : (item.sub_items || ''),
        photo: item.photo || '',
        pic2: item.pic2 || '',
        pic3: item.pic3 || '',
        pic4: item.pic4 || '',
        depreciation_years: parseFloat(item.depreciation_years) || 5,
        created_at: item.created_at || new Date().toISOString()
      }));

      const { error } = await supabase
        .from('inventaris')
        .upsert(chunk, { onConflict: 'id' });

      if (error) throw error;
      migratedCount += chunk.length;
      onProgress(`Migrasi berjalan: ${migratedCount} / ${items.length} aset tersimpan...`);
    }

    return {
      success: true,
      count: migratedCount,
      message: `Berhasil memigrasikan ${migratedCount} aset inventaris ke Supabase!`
    };
  } catch (err) {
    console.error('migrateInventarisGASToSupabase Error:', err);
    return { success: false, message: err.message };
  }
}
