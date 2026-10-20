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
        let q = supabase.from('income').select('transaction_id, date, month, year, income_type, nama_pemberi, unit_name, receipt_no, amount, alloc_daerah, alloc_jemaat, alloc_bangun, note, created_by, created_at, approved_by');
        if (params.year) q = q.eq('year', params.year);
        if (params.month) q = q.eq('month', params.month);

        let p = supabase.from('income').select('transaction_id').not('receipt_photo', 'is', null).neq('receipt_photo', '');
        if (params.year) p = p.eq('year', params.year);
        if (params.month) p = p.eq('month', params.month);

        const [resData, resPhotos] = await Promise.all([q, p]);
        if (resData.error) throw resData.error;

        const photoMap = {};
        if (resPhotos.data) resPhotos.data.forEach(r => photoMap[r.transaction_id] = true);

        const data = resData.data || [];
        data.forEach(r => { r.receipt_photo = photoMap[r.transaction_id] ? true : false; });
        return { success: true, data };
      }

      case 'getExpenseList': {
        let q = supabase.from('expense').select('transaction_id, date, month, year, department, source_balance, receipt_no, amount, nama_penerima, note, created_by, created_at, approved_by');
        if (params.year) q = q.eq('year', params.year);
        if (params.month) q = q.eq('month', params.month);

        let p = supabase.from('expense').select('transaction_id').not('receipt_photo', 'is', null).neq('receipt_photo', '');
        if (params.year) p = p.eq('year', params.year);
        if (params.month) p = p.eq('month', params.month);

        const [resData, resPhotos] = await Promise.all([q, p]);
        if (resData.error) throw resData.error;

        const photoMap = {};
        if (resPhotos.data) resPhotos.data.forEach(r => photoMap[r.transaction_id] = true);

        const data = resData.data || [];
        data.forEach(r => { r.receipt_photo = photoMap[r.transaction_id] ? true : false; });
        return { success: true, data };
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
        const { data, error } = await supabase.from(table).select('receipt_photo, receipt_photo_2, receipt_photo_3').or(`transaction_id.eq."${params.id}",receipt_no.eq."${params.id}"`).single();
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

async function getNextSeqNum(table, prefix, year, month) {
  const yStr = year.toString();
  const mStr = month.toString().padStart(2, '0');
  const prefixFull = `${prefix}-${yStr}${mStr}`;
  const { data } = await supabase
    .from(table)
    .select('transaction_id')
    .like('transaction_id', `${prefixFull}%`)
    .order('transaction_id', { ascending: false })
    .limit(1);

  let nextNum = 1;
  if (data && data.length > 0) {
    const lastId = data[0].transaction_id;
    const lastNumStr = lastId.replace(prefixFull, '');
    const lastNum = parseInt(lastNumStr, 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }
  return nextNum;
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
        const year = parseInt(payload.date.split('-')[0]);
        const month = parseInt(payload.date.split('-')[1]);
        const nextNum = await getNextSeqNum('income', 'INC', year, month);
        const transaction_id = `INC-${year}${month.toString().padStart(2, '0')}${String(nextNum).padStart(3, '0')}`;

        const insertData = {
          transaction_id,
          date: payload.date,
          month,
          year,
          income_type: payload.income_type,
          nama_pemberi: payload.nama_pemberi,
          unit_name: payload.unit_name,
          receipt_no: payload.receipt_no || ('R-' + Date.now()),
          amount: payload.amount,
          alloc_daerah, alloc_jemaat, alloc_bangun,
          note: payload.note,
          created_by: username,
          created_at: new Date().toISOString(),
          receipt_photo: payload.receipt_photo_base64 || payload.photo || '',
          receipt_photo_2: payload.receipt_photo_base64_2 || payload.photo2 || '',
          receipt_photo_3: payload.receipt_photo_base64_3 || payload.photo3 || '',
          approved_by: ''
        };
        const { error } = await supabase.from('income').insert([insertData]);
        if (error) throw error;
        writeLog(username, 'INSERT_INCOME', `No. Bukti: ${payload.receipt_no} | Jenis: ${payload.income_type} | Rp ${Number(payload.amount).toLocaleString('id-ID')} | Dari: ${payload.nama_pemberi || '-'}`);
        return { success: true, message: 'Data berhasil disimpan' };
      }

      case 'saveExpense': {
        if (!isBendaharaOrAdmin) return { success: false, message: 'Akses ditolak.' };
        const year = parseInt(payload.date.split('-')[0]);
        const month = parseInt(payload.date.split('-')[1]);
        const nextNum = await getNextSeqNum('expense', 'EXP', year, month);
        const transaction_id = `EXP-${year}${month.toString().padStart(2, '0')}${String(nextNum).padStart(3, '0')}`;

        const insertData = {
          transaction_id,
          date: payload.date,
          month,
          year,
          department: payload.department,
          source_balance: payload.source_balance,
          receipt_no: payload.receipt_no || ('R-' + Date.now()),
          amount: payload.amount,
          note: payload.note,
          created_by: username,
          created_at: new Date().toISOString(),
          receipt_photo: payload.receipt_photo_base64 || payload.photo || '',
          nama_penerima: payload.nama_penerima || '-',
          receipt_photo_2: payload.receipt_photo_base64_2 || payload.photo2 || '',
          receipt_photo_3: payload.receipt_photo_base64_3 || payload.photo3 || '',
          approved_by: ''
        };
        const { error } = await supabase.from('expense').insert([insertData]);
        if (error) throw error;
        writeLog(username, 'INSERT_EXPENSE', `No. Bukti: ${payload.receipt_no} | Dept: ${payload.department} | Rp ${Number(payload.amount).toLocaleString('id-ID')} | Kepada: ${payload.nama_penerima || '-'}`);
        return { success: true, message: 'Data pengeluaran berhasil disimpan' };
      }

      case 'deleteRecord': {
        if (!isAdmin) return { success: false, message: 'Hanya Admin.' };
        const table = payload.type === 'income' ? 'income' : (payload.type === 'expense' ? 'expense' : 'users');
        const col = table === 'users' ? 'username' : 'transaction_id';
        const targetId = payload.id || payload.transaction_id;
        const { error } = await supabase.from(table).delete().eq(col, targetId);
        if (error) throw error;
        writeLog(username, 'DELETE_' + table.toUpperCase(), `Hapus ID: ${targetId} dari tabel ${table}`);
        return { success: true, message: 'Data berhasil dihapus.' };
      }

      case 'editRecord': {
        if (!isBendaharaOrAdmin) return { success: false, message: 'Hanya Admin atau Bendahara.' };
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
          if (payload.receipt_photo_base64 !== undefined) updateData.receipt_photo = payload.receipt_photo_base64;
          if (payload.receipt_photo_base64_2 !== undefined) updateData.receipt_photo_2 = payload.receipt_photo_base64_2;
          if (payload.receipt_photo_base64_3 !== undefined) updateData.receipt_photo_3 = payload.receipt_photo_base64_3;
          if (payload.photo !== undefined && !payload.receipt_photo_base64) updateData.receipt_photo = payload.photo;
          if (payload.photo2 !== undefined && !payload.receipt_photo_base64_2) updateData.receipt_photo_2 = payload.photo2;
          if (payload.photo3 !== undefined && !payload.receipt_photo_base64_3) updateData.receipt_photo_3 = payload.photo3;
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
          if (payload.receipt_photo_base64 !== undefined) updateData.receipt_photo = payload.receipt_photo_base64;
          if (payload.receipt_photo_base64_2 !== undefined) updateData.receipt_photo_2 = payload.receipt_photo_base64_2;
          if (payload.receipt_photo_base64_3 !== undefined) updateData.receipt_photo_3 = payload.receipt_photo_base64_3;
          if (payload.photo !== undefined && !payload.receipt_photo_base64) updateData.receipt_photo = payload.photo;
          if (payload.photo2 !== undefined && !payload.receipt_photo_base64_2) updateData.receipt_photo_2 = payload.photo2;
          if (payload.photo3 !== undefined && !payload.receipt_photo_base64_3) updateData.receipt_photo_3 = payload.photo3;
        }

        const targetId = payload.id || payload.transaction_id;
        const { error } = await supabase.from(table).update(updateData).eq('transaction_id', targetId);
        if (error) throw error;
        writeLog(username, 'EDIT_' + table.toUpperCase(), `Edit ID: ${targetId} | Rp ${Number(updateData.amount || 0).toLocaleString('id-ID')} | No. Bukti: ${updateData.receipt_no || '-'}`);
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
        if (payload.id) {
          let { data, error } = await supabase.from('departments').update({ name: payload.name }).eq('id', payload.id).select();
          if (error || !data || data.length === 0) {
            const res = await supabase.from('departments').update({ name: payload.name }).eq('name', payload.id).select();
            if (res.error) throw res.error;
          }
          return { success: true, message: 'Departemen berhasil diperbarui.' };
        } else {
          const { error } = await supabase.from('departments').insert([{ id: 'DEP-' + Date.now(), name: payload.name, active: true }]);
          if (error) throw error;
          return { success: true, message: 'Departemen berhasil disimpan.' };
        }
      }

      case 'deleteDepartment': {
        let { error } = await supabase.from('departments').delete().eq('id', payload.id || payload.name);
        if (error) {
          await supabase.from('departments').delete().eq('name', payload.name || payload.id);
        }
        return { success: true, message: 'Departemen dihapus.' };
      }

      case 'saveUnit': {
        if (payload.isUpdate && (payload.id || payload.oldName)) {
          let updated = false;

          // 1. Try updating by id first if provided
          if (payload.id) {
            const { data, error } = await supabase
              .from('units')
              .update({
                name: payload.name,
                note: payload.note || '',
                jumlah_anggota: payload.jumlah_anggota || 0
              })
              .eq('id', payload.id)
              .select();
            if (!error && data && data.length > 0) {
              updated = true;
            }
          }

          // 2. If not updated by id, update by oldName
          if (!updated && payload.oldName) {
            const { data, error } = await supabase
              .from('units')
              .update({
                name: payload.name,
                note: payload.note || '',
                jumlah_anggota: payload.jumlah_anggota || 0
              })
              .eq('name', payload.oldName)
              .select();
            if (error) throw error;
            if (data && data.length > 0) {
              updated = true;
            }
          }

          // 3. Fallback: If neither matched (e.g. record had no id and name mismatch), upsert
          if (!updated) {
            const { error } = await supabase.from('units').upsert([{
              name: payload.name,
              note: payload.note || '',
              jumlah_anggota: payload.jumlah_anggota || 0,
              active: true
            }], { onConflict: 'name' });
            if (error) throw error;
          }

          // 4. Cascade name update to income transactions if the name was changed
          if (payload.oldName && payload.oldName !== payload.name) {
            await supabase
              .from('income')
              .update({ unit_pemberi: payload.name })
              .eq('unit_pemberi', payload.oldName);
          }

          return { success: true, message: 'Unit berhasil diperbarui.' };
        } else {
          // New unit insert
          const { error } = await supabase.from('units').insert([{
            id: payload.id || ('UNT-' + Date.now()),
            name: payload.name,
            note: payload.note || '',
            jumlah_anggota: payload.jumlah_anggota || 0,
            active: true
          }]);
          if (error) throw error;
          return { success: true, message: 'Unit berhasil disimpan.' };
        }
      }

      case 'deleteUnit': {
        let query = supabase.from('units');
        if (payload.id) {
          const { error } = await query.delete().eq('id', payload.id);
          if (error) throw error;
        } else {
          const { error } = await query.delete().eq('name', payload.name);
          if (error) throw error;
        }
        return { success: true, message: 'Unit berhasil dihapus.' };
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
        const table = payload.type === 'income' ? 'income' : 'expense';
        const targetId = payload.transaction_id || payload.id;
        if (!targetId) return { success: false, message: 'ID transaksi tidak valid.' };

        const { data: trx, error: fetchErr } = await supabase.from(table).select('approved_by').eq('transaction_id', targetId).single();
        if (fetchErr) throw fetchErr;

        let effectiveRole = "Admin";
        if (role.includes('Pendeta')) effectiveRole = "Pendeta";
        else if (role.includes('Ketua Jemaat')) effectiveRole = "Ketua Jemaat";

        let currentApproved = trx.approved_by || '';
        if (currentApproved.includes(effectiveRole)) {
          return { success: true, message: 'Anda sudah menyetujui transaksi ini.' };
        }

        let newApproved = currentApproved ? (currentApproved + ',' + effectiveRole) : effectiveRole;

        const { error } = await supabase.from(table).update({ approved_by: newApproved }).eq('transaction_id', targetId);
        if (error) throw error;
        writeLog(username, 'APPROVE', `Menyetujui ${table} ID: ${targetId}`);
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
        const year = parseInt(payload.date.split('-')[0]);
        const month = parseInt(payload.date.split('-')[1]);
        let nextNum = await getNextSeqNum('income', 'INC', year, month);

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
            const transaction_id = `INC-${year}${month.toString().padStart(2, '0')}${String(nextNum).padStart(3, '0')}`;
            nextNum++;
            inserts.push({
              transaction_id,
              date: payload.date,
              month,
              year,
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
          writeLog(username, 'SAVE_BULK_INCOME', `Setoran Kolektif No. ${payload.receipt_no} | Unit: ${payload.unit_name} | ${inserts.length} jenis pemasukan`);
        }
        return { success: true, message: 'Setoran kolektif disimpan.' };
      }

      case 'editBulkIncome': {
        if (!isAdmin) return { success: false, message: 'Hanya Admin.' };
        // Hapus data lama berdasarkan old_receipt_no
        await supabase.from('income').delete().eq('receipt_no', payload.old_receipt_no);

        const { data: types } = await supabase.from('income_types').select('*');
        const inserts = [];
        const year = parseInt(payload.date.split('-')[0]);
        const month = parseInt(payload.date.split('-')[1]);
        let nextNum = await getNextSeqNum('income', 'INC', year, month);

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
            const transaction_id = `INC-${year}${month.toString().padStart(2, '0')}${String(nextNum).padStart(3, '0')}`;
            nextNum++;
            inserts.push({
              transaction_id,
              date: payload.date,
              month,
              year,
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
          writeLog(username, 'EDIT_BULK_INCOME', `Edit Setoran Kolektif No. ${payload.receipt_no} | Unit: ${payload.unit_name} | ${inserts.length} jenis pemasukan`);
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

/**
 * Cek apakah Supabase online dan tabel Laporan dapat diakses
 */
export async function checkLaporanSupabaseHealth() {
  try {
    const { data, error } = await supabase.from('config').select('key').limit(1);
    return !error;
  } catch (e) {
    return false;
  }
}

/**
 * 1-Klik Migrasi seluruh data dari Google Apps Script ke Supabase untuk Laporan
 */
export async function migrateLaporanGASToSupabase(gasUrl, onProgress = () => { }) {
  try {
    const fetchGas = async (action, params = {}) => {
      let url = `${gasUrl}?action=${encodeURIComponent(action)}`;
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null) url += `&${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`;
      });
      const res = await fetch(url);
      return await res.json();
    };

    onProgress('Mengambil konfigurasi sistem dari Google Sheets...');
    const configRes = await fetchGas('getConfig');
    if (configRes.success && configRes.data) {
      const configEntries = Object.entries(configRes.data).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));
      if (configEntries.length > 0) {
        await supabase.from('config').upsert(configEntries, { onConflict: 'key' });
      }
    }

    onProgress('Mengambil Master Data (Departemen, Unit, Jenis Pemasukan)...');
    const masterRes = await fetchGas('getMasterData');
    if (masterRes.success && masterRes.data) {
      const { departments, units, incomeTypes } = masterRes.data;
      if (departments && departments.length > 0) {
        const dRows = departments.map(d => ({ name: d.name, active: d.active !== false }));
        await supabase.from('departments').upsert(dRows, { onConflict: 'name' });
      }
      if (units && units.length > 0) {
        const uRows = units.map(u => ({ name: u.name, active: u.active !== false }));
        await supabase.from('units').upsert(uRows, { onConflict: 'name' });
      }
      if (incomeTypes && incomeTypes.length > 0) {
        const iRows = incomeTypes.map(it => ({
          name: it.name,
          pct_daerah: parseFloat(it.pct_daerah) || 0,
          pct_jemaat: parseFloat(it.pct_jemaat) || 0,
          pct_bangun: parseFloat(it.pct_bangun) || 0,
          active: it.active !== false
        }));
        await supabase.from('income_types').upsert(iRows, { onConflict: 'name' });
      }
    }

    onProgress('Mengambil data pengguna...');
    const usersRes = await fetchGas('getUsers');
    if (usersRes.success && Array.isArray(usersRes.data) && usersRes.data.length > 0) {
      const uRows = usersRes.data.map(u => ({
        username: u.username,
        password: u.password,
        nama: u.nama || u.username,
        role: u.role || 'Viewer',
        active: u.active !== false
      }));
      await supabase.from('users').upsert(uRows, { onConflict: 'username' });
    }

    onProgress('Mengambil data saldo awal...');
    const balancesRes = await fetchGas('getBalances');
    if (balancesRes.success && balancesRes.data) {
      const b = balancesRes.data;
      const bRows = [
        { department: 'Daerah', amount: parseFloat(b.initDaerah || b.daerah) || 0 },
        { department: 'Kas Jemaat', amount: parseFloat(b.initJemaat || b.jemaat) || 0 },
        { department: 'Pembangunan', amount: parseFloat(b.initBangun || b.bangun) || 0 }
      ];
      await supabase.from('balances').upsert(bRows, { onConflict: 'department' });
    }

    onProgress('Mengambil data transaksi pemasukan kas...');
    const incRes = await fetchGas('getIncomeList');
    let incCount = 0;
    if (incRes.success && Array.isArray(incRes.data) && incRes.data.length > 0) {
      const items = incRes.data;
      const chunkSize = 50;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize).map(item => ({
          transaction_id: item.transaction_id || ('INC-' + Date.now() + '-' + i),
          date: item.date ? String(item.date).split('T')[0] : '2026-01-01',
          month: parseInt(item.month) || (item.date ? parseInt(item.date.split('-')[1]) : 1),
          year: parseInt(item.year) || (item.date ? parseInt(item.date.split('-')[0]) : 2026),
          income_type: item.income_type || 'Perpuluhan',
          nama_pemberi: item.nama_pemberi || '-',
          unit_name: item.unit_name || '-',
          receipt_no: item.receipt_no || '',
          amount: parseFloat(item.amount) || 0,
          alloc_daerah: parseFloat(item.alloc_daerah) || 0,
          alloc_jemaat: parseFloat(item.alloc_jemaat) || 0,
          alloc_bangun: parseFloat(item.alloc_bangun) || 0,
          note: item.note || '',
          created_by: item.created_by || 'System',
          created_at: item.created_at || new Date().toISOString(),
          approved_by: item.approved_by || ''
        }));
        await supabase.from('income').upsert(chunk, { onConflict: 'transaction_id' });
        incCount += chunk.length;
        onProgress(`Menyimpan pemasukan (${incCount} / ${items.length})...`);
      }
    }

    onProgress('Mengambil data transaksi pengeluaran kas...');
    const expRes = await fetchGas('getExpenseList');
    let expCount = 0;
    if (expRes.success && Array.isArray(expRes.data) && expRes.data.length > 0) {
      const items = expRes.data;
      const chunkSize = 50;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize).map(item => ({
          transaction_id: item.transaction_id || ('EXP-' + Date.now() + '-' + i),
          date: item.date ? String(item.date).split('T')[0] : '2026-01-01',
          month: parseInt(item.month) || (item.date ? parseInt(item.date.split('-')[1]) : 1),
          year: parseInt(item.year) || (item.date ? parseInt(item.date.split('-')[0]) : 2026),
          department: item.department || '-',
          source_balance: item.source_balance || 'Kas Jemaat',
          receipt_no: item.receipt_no || '',
          amount: parseFloat(item.amount) || 0,
          nama_penerima: item.nama_penerima || '-',
          note: item.note || '',
          created_by: item.created_by || 'System',
          created_at: item.created_at || new Date().toISOString(),
          approved_by: item.approved_by || ''
        }));
        await supabase.from('expense').upsert(chunk, { onConflict: 'transaction_id' });
        expCount += chunk.length;
        onProgress(`Menyimpan pengeluaran (${expCount} / ${items.length})...`);
      }
    }

    return {
      success: true,
      message: `Migrasi Berhasil! Disimpan ke Supabase:\n- ${incCount} Transaksi Pemasukan\n- ${expCount} Transaksi Pengeluaran\n- Master Data & Pengguna Lengkap`
    };
  } catch (err) {
    console.error('migrateLaporanGASToSupabase Error:', err);
    return { success: false, message: err.message };
  }
}

// ============================================================
//  SINKRONISASI / CADANGKAN SUPABASE KE GOOGLE SHEETS
// ============================================================
export async function backupSupabaseToGAS(gasUrl, onProgress = () => { }) {
  try {
    onProgress('Mengambil master data & pengaturan dari Supabase...');
    const [deptRes, unitRes, typeRes, balRes, cfgRes] = await Promise.all([
      supabase.from('departments').select('*').order('id', { ascending: true }),
      supabase.from('units').select('*').order('id', { ascending: true }),
      supabase.from('income_types').select('*').order('id', { ascending: true }),
      supabase.from('initial_balances').select('*'),
      supabase.from('app_config').select('*')
    ]);

    const departments = deptRes.data || [];
    const units = unitRes.data || [];
    const incomeTypes = typeRes.data || [];
    const balances = balRes.data || [];
    const config = {};
    (cfgRes.data || []).forEach(row => {
      config[row.key] = row.value;
    });

    onProgress('Mengambil data transaksi pemasukan dari Supabase...');
    let allIncome = [];
    let fromInc = 0;
    const stepInc = 1000;
    while (true) {
      const { data: chunk, error } = await supabase
        .from('income')
        .select('*')
        .order('date', { ascending: true })
        .range(fromInc, fromInc + stepInc - 1);
      if (error) throw error;
      if (!chunk || chunk.length === 0) break;
      allIncome = allIncome.concat(chunk);
      if (chunk.length < stepInc) break;
      fromInc += stepInc;
      onProgress(`Mengambil pemasukan (${allIncome.length} data)...`);
    }

    onProgress('Mengambil data transaksi pengeluaran dari Supabase...');
    let allExpense = [];
    let fromExp = 0;
    const stepExp = 1000;
    while (true) {
      const { data: chunk, error } = await supabase
        .from('expense')
        .select('*')
        .order('date', { ascending: true })
        .range(fromExp, fromExp + stepExp - 1);
      if (error) throw error;
      if (!chunk || chunk.length === 0) break;
      allExpense = allExpense.concat(chunk);
      if (chunk.length < stepExp) break;
      fromExp += stepExp;
      onProgress(`Mengambil pengeluaran (${allExpense.length} data)...`);
    }

    onProgress(`Mengunggah ke Google Sheets (${allIncome.length} Pemasukan, ${allExpense.length} Pengeluaran)...`);

    let token = localStorage.getItem('BISDAC_token') || '';
    if (!token) {
      try {
        const u = JSON.parse(localStorage.getItem('BISDAC_user') || '{}');
        if (u && u.username && u.role) {
          token = btoa(JSON.stringify({ username: u.username, role: u.role, nama: u.nama || u.username }));
        }
      } catch (e) { }
    }

    const payload = {
      action: 'syncSupabaseToSheets',
      token,
      data: {
        departments,
        units,
        incomeTypes,
        balances,
        config,
        income: allIncome,
        expense: allExpense
      }
    };

    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    return json;
  } catch (err) {
    console.error('backupSupabaseToGAS Error:', err);
    return { success: false, message: 'Gagal mencadangkan ke Sheets: ' + err.message };
  }
}
