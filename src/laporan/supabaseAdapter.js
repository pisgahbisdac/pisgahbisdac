import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function supabaseGet(action, params = {}) {
  try {
    switch (action) {
      case 'ping':
        return { success: true, message: 'pong' };

      case 'getConfig': {
        const { data, error } = await supabase.from('config').select('*');
        if (error) throw error;
        const config = {};
        if (data) data.forEach(c => config[c.key] = c.value);
        return { success: true, data: config };
      }

      case 'getMasterData': {
        const { data: depts } = await supabase.from('departments').select('*').eq('active', true);
        const { data: units } = await supabase.from('units').select('*').eq('active', true);
        const { data: incTypes } = await supabase.from('income_types').select('*').eq('active', true);
        return { success: true, data: { departments: depts || [], units: units || [], incomeTypes: incTypes || [] } };
      }

      case 'getIncomeList': {
        let q = supabase.from('income').select('*');
        if (params.year) q = q.eq('year', params.year);
        if (params.month) q = q.eq('month', params.month);
        const { data, error } = await q;
        if (error) throw error;
        return { success: true, data: data || [] };
      }

      case 'getExpenseList': {
        let q = supabase.from('expense').select('*');
        if (params.year) q = q.eq('year', params.year);
        if (params.month) q = q.eq('month', params.month);
        const { data, error } = await q;
        if (error) throw error;
        return { success: true, data: data || [] };
      }

      case 'getBalances': {
        const { data, error } = await supabase.from('balances').select('*');
        if (error) throw error;
        let initDaerah = 0, initJemaat = 0, initBangun = 0;
        if (data) {
          data.forEach(b => {
            if (b.source === 'Daerah') initDaerah = parseFloat(b.balance) || 0;
            if (b.source === 'Kas Jemaat') initJemaat = parseFloat(b.balance) || 0;
            if (b.source === 'Pembangunan') initBangun = parseFloat(b.balance) || 0;
          });
        }
        return { success: true, data: { initDaerah, initJemaat, initBangun, daerah: initDaerah, jemaat: initJemaat, bangun: initBangun, total: initDaerah + initJemaat + initBangun } };
      }

      case 'getUsers': {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        return { success: true, data: data || [] };
      }

      case 'getLogs': {
        const { data, error } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(50);
        if (error) throw error;
        return { success: true, data: data || [] };
      }
      
      case 'getTransactionPhotos': {
        const table = params.type === 'income' ? 'income' : 'expense';
        const { data, error } = await supabase.from(table).select('receipt_photo, receipt_photo_2, receipt_photo_3').or(`transaction_id.eq.${params.id},receipt_no.eq.${params.id}`).single();
        if (error || !data) return { success: false, message: 'Transaksi tidak ditemukan' };
        return { success: true, data: { photo1: data.receipt_photo || '', photo2: data.receipt_photo_2 || '', photo3: data.receipt_photo_3 || '' } };
      }

      default:
        return { success: false, message: 'Supabase GET action not mapped: ' + action };
    }
  } catch (err) {
    console.error('Supabase GET Error:', err);
    return { success: false, message: err.message };
  }
}

function writeLog(username, action, detail) {
  supabase.from('logs').insert([{ id: 'LOG-' + Date.now(), timestamp: new Date().toISOString(), username, action, detail }]).then();
}

export async function supabasePost(action, payload = {}) {
  try {
    const userStr = localStorage.getItem('BISDAC_user');
    const user = userStr ? JSON.parse(userStr) : {};
    const username = user.username || 'System';
    const role = user.role || 'Viewer';

    // Helper functions for checking auth
    const userRoles = role ? role.split(',').map(r => r.trim()) : [];
    const isAdmin = userRoles.includes('Admin') || userRoles.includes('Ketua Jemaat') || userRoles.includes('Pendeta');
    const isBendaharaOrAdmin = userRoles.includes('Bendahara') || isAdmin;

    switch (action) {
      case 'login': {
        const { data, error } = await supabase.from('users').select('*').ilike('username', payload.username).eq('active', true).single();
        if (error || !data) return { success: false, message: 'Username salah atau dinonaktifkan.' };
        if (data.password !== payload.password) return { success: false, message: 'Password salah.' };
        const token = btoa(JSON.stringify({ username: data.username, role: data.role, nama: data.nama }));
        writeLog(data.username, 'LOGIN', 'Login via Supabase');
        return { success: true, token, user: { username: data.username, role: data.role, nama: data.nama } };
      }

      case 'saveIncome': {
        if (!isBendaharaOrAdmin) return { success: false, message: 'Akses ditolak.' };
        const { data: types } = await supabase.from('income_types').select('*').eq('name', payload.income_type).single();
        let alloc_daerah = 0, alloc_jemaat = 0, alloc_bangun = 0;
        if (types) {
           alloc_daerah = (payload.amount * (types.pct_daerah || 0)) / 100;
           alloc_jemaat = (payload.amount * (types.pct_jemaat || 0)) / 100;
           alloc_bangun = (payload.amount * (types.pct_bangun || 0)) / 100;
        }
        if (payload.income_type === 'Mutasi Kas / Setor Bank') {
            alloc_daerah = 0; alloc_jemaat = 0; alloc_bangun = 0;
        }
        const insertData = {
           transaction_id: 'INC-' + Date.now() + Math.floor(Math.random()*1000),
           date: payload.date,
           month: parseInt(payload.date.split('-')[1]),
           year: parseInt(payload.date.split('-')[0]),
           income_type: payload.income_type,
           nama_pemberi: payload.nama_pemberi,
           unit_name: payload.unit_name,
           receipt_no: payload.receipt_no || ('R-' + Date.now()),
           amount: payload.amount,
           alloc_daerah, alloc_jemaat, alloc_bangun,
           note: payload.note,
           created_by: username,
           created_at: new Date().toISOString(),
           receipt_photo: payload.photo || '',
           receipt_photo_2: payload.photo2 || '',
           receipt_photo_3: payload.photo3 || '',
           approved_by: ''
        };
        const { error } = await supabase.from('income').insert([insertData]);
        if (error) throw error;
        writeLog(username, 'INSERT_INCOME', 'Rp ' + payload.amount + ' - ' + payload.nama_pemberi);
        return { success: true, message: 'Data berhasil disimpan' };
      }

      case 'saveExpense': {
        if (!isBendaharaOrAdmin) return { success: false, message: 'Akses ditolak.' };
        const insertData = {
           transaction_id: 'EXP-' + Date.now() + Math.floor(Math.random()*1000),
           date: payload.date,
           month: parseInt(payload.date.split('-')[1]),
           year: parseInt(payload.date.split('-')[0]),
           department: payload.department,
           source_balance: payload.source_balance,
           receipt_no: payload.receipt_no || ('R-' + Date.now()),
           amount: payload.amount,
           note: payload.note,
           created_by: username,
           created_at: new Date().toISOString(),
           receipt_photo: payload.photo || '',
           nama_penerima: payload.nama_penerima || '-',
           receipt_photo_2: payload.photo2 || '',
           receipt_photo_3: payload.photo3 || '',
           approved_by: ''
        };
        const { error } = await supabase.from('expense').insert([insertData]);
        if (error) throw error;
        writeLog(username, 'INSERT_EXPENSE', 'Rp ' + payload.amount + ' - ' + payload.department);
        return { success: true, message: 'Data pengeluaran berhasil disimpan' };
      }

      case 'deleteRecord': {
        if (!isAdmin) return { success: false, message: 'Hanya Admin.' };
        const table = payload.type === 'income' ? 'income' : (payload.type === 'expense' ? 'expense' : 'users');
        const col = table === 'users' ? 'username' : 'transaction_id';
        const targetId = payload.id || payload.transaction_id;
        const { error } = await supabase.from(table).delete().eq(col, targetId);
        if (error) throw error;
        writeLog(username, 'DELETE_' + table.toUpperCase(), 'ID: ' + targetId);
        return { success: true, message: 'Data berhasil dihapus.' };
      }

      case 'editRecord': {
        if (!isAdmin) return { success: false, message: 'Hanya Admin.' };
        const table = payload.type === 'income' ? 'income' : 'expense';
        
        let updateData = {};
        if (table === 'income') {
            const { data: types } = await supabase.from('income_types').select('*').eq('name', payload.income_type).single();
            let alloc_daerah = 0, alloc_jemaat = 0, alloc_bangun = 0;
            if (types && payload.income_type !== 'Mutasi Kas / Setor Bank') {
               alloc_daerah = (payload.amount * types.pct_daerah) / 100;
               alloc_jemaat = (payload.amount * types.pct_jemaat) / 100;
               alloc_bangun = (payload.amount * types.pct_bangun) / 100;
            }
            updateData = {
               date: payload.date,
               month: parseInt(payload.date.split('-')[1]),
               year: parseInt(payload.date.split('-')[0]),
               income_type: payload.income_type,
               nama_pemberi: payload.nama_pemberi,
               unit_name: payload.unit_name,
               receipt_no: payload.receipt_no,
               amount: payload.amount,
               alloc_daerah, alloc_jemaat, alloc_bangun,
               note: payload.note
            };
        } else {
            updateData = {
               date: payload.date,
               month: parseInt(payload.date.split('-')[1]),
               year: parseInt(payload.date.split('-')[0]),
               department: payload.department,
               source_balance: payload.source_balance,
               receipt_no: payload.receipt_no,
               amount: payload.amount,
               nama_penerima: payload.nama_penerima,
               note: payload.note
            };
        }

        const targetId = payload.id || payload.transaction_id;
        const { error } = await supabase.from(table).update(updateData).eq('transaction_id', targetId);
        if (error) throw error;
        writeLog(username, 'EDIT_' + table.toUpperCase(), 'ID: ' + targetId);
        return { success: true, message: 'Data berhasil diedit.' };
      }

      case 'setInitialBalance': {
        if (!isAdmin) return { success: false, message: 'Hanya Admin.' };
        for (const k of ['daerah', 'jemaat', 'pembangunan']) {
            if (payload[k] !== undefined) {
               const src = k === 'daerah' ? 'Daerah' : (k === 'jemaat' ? 'Kas Jemaat' : 'Pembangunan');
               await supabase.from('balances').upsert({ source: src, balance: payload[k] });
            }
        }
        writeLog(username, 'SET_BALANCE', JSON.stringify(payload));
        return { success: true, message: 'Saldo awal disesuaikan.' };
      }

      case 'saveDepartment': {
        const { error } = await supabase.from('departments').insert([{ id: 'DEP-' + Date.now(), name: payload.name }]);
        if (error) throw error;
        return { success: true, message: 'Departemen disimpan.' };
      }

      case 'deleteDepartment': {
        const { error } = await supabase.from('departments').delete().eq('name', payload.name);
        if (error) throw error;
        return { success: true, message: 'Departemen dihapus.' };
      }

      case 'saveUnit': {
        const { error } = await supabase.from('units').insert([{ id: 'UNT-' + Date.now(), name: payload.name, note: payload.note, jumlah_anggota: payload.jumlah_anggota }]);
        if (error) throw error;
        return { success: true, message: 'Unit disimpan.' };
      }
      
      case 'deleteUnit': {
        const { error } = await supabase.from('units').delete().eq('name', payload.name);
        if (error) throw error;
        return { success: true, message: 'Unit dihapus.' };
      }

      case 'saveIncomeType': {
        if (payload.isUpdate) {
            await supabase.from('income_types').update({ 
                name: payload.name, pct_daerah: payload.pct_daerah, pct_jemaat: payload.pct_jemaat, pct_bangun: payload.pct_bangun 
            }).eq('name', payload.oldName);
        } else {
            await supabase.from('income_types').insert([{ 
                id: 'TYP-' + Date.now(), name: payload.name, pct_daerah: payload.pct_daerah, pct_jemaat: payload.pct_jemaat, pct_bangun: payload.pct_bangun 
            }]);
        }
        return { success: true, message: 'Jenis pemasukan disimpan.' };
      }
      
      case 'deleteIncomeType': {
        await supabase.from('income_types').delete().eq('name', payload.name);
        return { success: true, message: 'Jenis pemasukan dihapus.' };
      }

      case 'approveTransaction': {
        if (!isAdmin) return { success: false, message: 'Hanya Admin/Ketua.' };
        const table = payload.type === 'income' ? 'income' : 'expense';
        await supabase.from(table).update({ approved_by: username }).in('transaction_id', payload.ids);
        return { success: true, message: 'Berhasil disetujui.' };
      }

      case 'saveUser': {
        if (!isAdmin) return { success: false, message: 'Hanya Admin.' };
        const userData = { username: payload.username, password: payload.password, role: payload.role, nama: payload.nama, active: payload.aktif };
        const { error } = await supabase.from('users').upsert(userData);
        if (error) throw error;
        writeLog(username, 'UPDATE_USER', `Update user: ${payload.username}`);
        return { success: true, message: 'Pengguna berhasil disimpan.' };
      }

      case 'saveBulkIncome': {
        if (!isBendaharaOrAdmin) return { success: false, message: 'Akses ditolak.' };
        const { data: types } = await supabase.from('income_types').select('*');
        const inserts = [];
        for (const item of payload.items) {
           const amount = parseFloat(item.amount) || 0;
           if (amount > 0) {
               const typeConf = types.find(t => t.name === item.income_type);
               let ad = 0, aj = 0, ab = 0;
               if (typeConf) {
                  ad = (amount * typeConf.pct_daerah) / 100;
                  aj = (amount * typeConf.pct_jemaat) / 100;
                  ab = (amount * typeConf.pct_bangun) / 100;
               }
               inserts.push({
                   transaction_id: 'INC-' + Date.now() + Math.floor(Math.random()*1000),
                   date: payload.date,
                   month: parseInt(payload.date.split('-')[1]),
                   year: parseInt(payload.date.split('-')[0]),
                   income_type: item.income_type,
                   nama_pemberi: 'Kolektif ' + payload.unit_name,
                   unit_name: payload.unit_name,
                   receipt_no: payload.receipt_no,
                   amount: amount,
                   alloc_daerah: ad, alloc_jemaat: aj, alloc_bangun: ab,
                   note: item.note || 'Setoran Kolektif',
                   created_by: username,
                   created_at: new Date().toISOString(),
                   receipt_photo: payload.receipt_photo_base64 || '',
                   receipt_photo_2: payload.receipt_photo_base64_2 || '',
                   receipt_photo_3: payload.receipt_photo_base64_3 || '',
                   approved_by: ''
               });
           }
        }
        if (inserts.length > 0) {
           const { error } = await supabase.from('income').insert(inserts);
           if (error) throw error;
           writeLog(username, 'SAVE_BULK_INCOME', `Kolektif: ${payload.receipt_no}`);
        }
        return { success: true, message: 'Setoran kolektif disimpan.' };
      }

      case 'editBulkIncome': {
        if (!isAdmin) return { success: false, message: 'Hanya Admin.' };
        // Hapus data lama berdasarkan old_receipt_no
        await supabase.from('income').delete().eq('receipt_no', payload.old_receipt_no);
        
        const { data: types } = await supabase.from('income_types').select('*');
        const inserts = [];
        for (const item of payload.items) {
           const amount = parseFloat(item.amount) || 0;
           if (amount > 0) {
               const typeConf = types.find(t => t.name === item.income_type);
               let ad = 0, aj = 0, ab = 0;
               if (typeConf) {
                  ad = (amount * typeConf.pct_daerah) / 100;
                  aj = (amount * typeConf.pct_jemaat) / 100;
                  ab = (amount * typeConf.pct_bangun) / 100;
               }
               inserts.push({
                   transaction_id: 'INC-' + Date.now() + Math.floor(Math.random()*1000),
                   date: payload.date,
                   month: parseInt(payload.date.split('-')[1]),
                   year: parseInt(payload.date.split('-')[0]),
                   income_type: item.income_type,
                   nama_pemberi: 'Kolektif ' + payload.unit_name,
                   unit_name: payload.unit_name,
                   receipt_no: payload.receipt_no,
                   amount: amount,
                   alloc_daerah: ad, alloc_jemaat: aj, alloc_bangun: ab,
                   note: item.note || 'Setoran Kolektif',
                   created_by: username,
                   created_at: new Date().toISOString(),
                   receipt_photo: payload.receipt_photo_base64 || payload.original_photo || '',
                   receipt_photo_2: payload.receipt_photo_base64_2 || '',
                   receipt_photo_3: payload.receipt_photo_base64_3 || '',
                   approved_by: ''
               });
           }
        }
        if (inserts.length > 0) {
           const { error } = await supabase.from('income').insert(inserts);
           if (error) throw error;
           writeLog(username, 'EDIT_BULK_INCOME', `Kolektif: ${payload.receipt_no}`);
        }
        return { success: true, message: 'Setoran kolektif berhasil diedit.' };
      }

      case 'saveConfig': {
        if (!isAdmin && !(role.includes('Bendahara') && payload.key === 'receipt_series')) {
          return { success: false, message: 'Akses ditolak.' };
        }
        const { error } = await supabase.from('config').upsert({ key: payload.key, value: payload.value });
        if (error) throw error;
        writeLog(username, 'UPDATE_CONFIG', `Update pengaturan: ${payload.key}`);
        return { success: true, message: 'Pengaturan berhasil disimpan.' };
      }

      default:
        return { success: false, message: 'Supabase POST action not mapped: ' + action };
    }
  } catch (err) {
    console.error('Supabase POST Error:', err);
    return { success: false, message: err.message };
  }
}
