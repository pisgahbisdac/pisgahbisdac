import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
 * Simpan / Update data inventaris ke Supabase
 */
export async function saveInventoryToSupabase(item) {
  try {
    const cleanItem = {
      id: item.id,
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
    return { success: true, data, message: 'Data inventaris berhasil disimpan di Supabase' };
  } catch (err) {
    console.error('saveInventoryToSupabase Error:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Hapus aset inventaris dari Supabase
 */
export async function deleteInventoryFromSupabase(id) {
  try {
    const { error } = await supabase
      .from('inventaris')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
 * Simpan riwayat servis aset ke Supabase
 */
export async function saveInventoryServiceToSupabase(payload) {
  try {
    const row = {
      inventory_id: payload.inventory_id,
      service_date: payload.service_date,
      description: payload.description || '',
      cost: parseFloat(payload.cost) || 0,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('inventory_services')
      .insert([row]);

    if (error) throw error;
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
