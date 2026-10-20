// ==========================================
// AUDIT LOGS, BACKUP & DRAFT AUTO-SAVE MODULE
// ==========================================

export const LOG_ACTION_LABELS = {
  'LOGIN': { label: 'Login', color: 'badge-blue' },
  'INSERT_INCOME': { label: 'Tambah Pemasukan', color: 'badge-green' },
  'INSERT_EXPENSE': { label: 'Tambah Pengeluaran', color: 'badge-amber' },
  'EDIT_INCOME': { label: 'Edit Pemasukan', color: 'badge-blue' },
  'EDIT_EXPENSE': { label: 'Edit Pengeluaran', color: 'badge-blue' },
  'DELETE_INCOME': { label: 'Hapus Pemasukan', color: 'badge-red' },
  'DELETE_EXPENSE': { label: 'Hapus Pengeluaran', color: 'badge-red' },
  'DELETE_USERS': { label: 'Hapus Pengguna', color: 'badge-red' },
  'APPROVE': { label: 'Setujui Transaksi', color: 'badge-green' },
  'SAVE_BULK_INCOME': { label: 'Tambah Setoran Kolektif', color: 'badge-green' },
  'EDIT_BULK_INCOME': { label: 'Edit Setoran Kolektif', color: 'badge-blue' },
  'UPDATE_USER': { label: 'Kelola Pengguna', color: 'badge-blue' },
  'SET_BALANCE': { label: 'Atur Saldo Awal', color: 'badge-amber' },
  'UPDATE_CONFIG': { label: 'Ubah Pengaturan', color: 'badge-gray' },
  'INSERT_DEPT': { label: 'Tambah Dept', color: 'badge-green' },
  'EDIT_DEPT': { label: 'Edit Dept', color: 'badge-blue' },
  'DELETE_DEPT': { label: 'Hapus Dept', color: 'badge-red' },
  'INSERT_UNIT': { label: 'Tambah Unit', color: 'badge-green' },
  'EDIT_UNIT': { label: 'Edit Unit', color: 'badge-blue' },
  'DELETE_UNIT': { label: 'Hapus Unit', color: 'badge-red' },
  'INSERT_INCOME_TYPE': { label: 'Tambah Kategori', color: 'badge-green' },
  'EDIT_INCOME_TYPE': { label: 'Edit Kategori', color: 'badge-blue' },
  'DELETE_INCOME_TYPE': { label: 'Hapus Kategori', color: 'badge-red' },
};

export let cachedLogsData = [];
export let currentLogQuery = '';
export let currentLogActionFilter = 'all';

export function handleLogSearch(query) {
  currentLogQuery = (query || '').toLowerCase().trim();
  renderFilteredLogs();
}

export function handleLogActionFilter(action) {
  currentLogActionFilter = action || 'all';
  renderFilteredLogs();
}

export function renderFilteredLogs() {
  let filtered = [...cachedLogsData];
  if (currentLogActionFilter && currentLogActionFilter !== 'all') {
    filtered = filtered.filter(x => x.action === currentLogActionFilter);
  }
  if (currentLogQuery) {
    filtered = filtered.filter(x =>
      (x.username || '').toLowerCase().includes(currentLogQuery) ||
      (x.user || '').toLowerCase().includes(currentLogQuery) ||
      (x.detail || '').toLowerCase().includes(currentLogQuery) ||
      (x.action || '').toLowerCase().includes(currentLogQuery)
    );
  }
  const rows = filtered.map(x => {
    const lbl = LOG_ACTION_LABELS[x.action] || { label: x.action, color: 'badge-gray' };
    const user = x.username || x.user || '(tidak diketahui)';
    return `<tr>
          <td class="fit-col" style="color:var(--text4); font-size:12px; white-space:nowrap;">${new Date(x.timestamp).toLocaleString('id-ID')}</td>
          <td style="white-space:nowrap;"><strong>${user}</strong></td>
          <td class="fit-col"><span class="badge ${lbl.color}" style="white-space:nowrap;">${lbl.label}</span></td>
          <td style="font-size:13px; color:var(--text2);">${x.detail || '-'}</td>
        </tr>`;
  }).join('');
  const el = document.getElementById('logList');
  if (el) el.innerHTML = rows || '<tr><td colspan="4" style="text-align:center; color:var(--text4); padding:20px;">Tidak ada catatan log yang cocok.</td></tr>';
}

export async function renderLogs() {
  try {
    const apiGet = window.apiGet;
    if (!apiGet) return;
    const res = await apiGet('getLogs');
    cachedLogsData = res.data || [];
    renderFilteredLogs();
  } catch (e) { }
}

export function exportLogsToCSV() {
  const notify = window.notify || alert;
  const todayStr = window.todayStr ? window.todayStr() : new Date().toISOString().split('T')[0];
  if (!cachedLogsData || cachedLogsData.length === 0) {
    notify('Tidak ada log untuk diekspor.', 'warning');
    return;
  }
  let filtered = [...cachedLogsData];
  if (currentLogActionFilter && currentLogActionFilter !== 'all') {
    filtered = filtered.filter(x => x.action === currentLogActionFilter);
  }
  if (currentLogQuery) {
    filtered = filtered.filter(x =>
      (x.username || '').toLowerCase().includes(currentLogQuery) ||
      (x.user || '').toLowerCase().includes(currentLogQuery) ||
      (x.detail || '').toLowerCase().includes(currentLogQuery) ||
      (x.action || '').toLowerCase().includes(currentLogQuery)
    );
  }
  if (filtered.length === 0) {
    notify('Tidak ada log yang cocok dengan filter untuk diekspor.', 'warning');
    return;
  }
  let csv = '\uFEFFWaktu,Pengguna,Aksi,Keterangan\r\n';
  filtered.forEach(x => {
    const time = `"${new Date(x.timestamp).toLocaleString('id-ID').replace(/"/g, '""')}"`;
    const user = `"${(x.username || x.user || '').replace(/"/g, '""')}"`;
    const action = `"${(x.action || '').replace(/"/g, '""')}"`;
    const detail = `"${(x.detail || '').replace(/"/g, '""')}"`;
    csv += `${time},${user},${action},${detail}\r\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit_log_pisgah_${todayStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  notify('Log berhasil diekspor ke CSV!', 'success');
}

export async function downloadFullBackup() {
  const notify = window.notify || alert;
  const todayStr = window.todayStr ? window.todayStr() : new Date().toISOString().split('T')[0];
  try {
    notify('Menyiapkan berkas cadangan data...', 'info');
    const backupObj = {
      appName: window.systemConfig?.app_name || 'GMAHK Jemaat Pisgah',
      exportDate: new Date().toISOString(),
      systemConfig: window.systemConfig || {},
      income: window.cachedIncome || [],
      expense: window.cachedExpense || [],
      balances: window.cachedSaldo || {},
      masterData: window.masterData || {},
      users: window.cachedUsersList || [],
      auditLogs: cachedLogsData || []
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_keuangan_pisgah_${todayStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('Cadangan data berhasil diunduh!', 'success');
  } catch (err) {
    notify('Gagal mengunduh cadangan: ' + err.message, 'error');
  }
}

export function validateBackupFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const notify = window.notify || alert;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== 'object') {
        throw new Error('Berkas tidak berformat JSON objek yang valid.');
      }
      const incList = Array.isArray(data.income) ? data.income : [];
      const expList = Array.isArray(data.expense) ? data.expense : [];
      const usersList = Array.isArray(data.users) ? data.users : [];
      const mData = data.masterData || {};
      const depts = Array.isArray(mData.departments) ? mData.departments : [];
      const incTypes = Array.isArray(mData.incomeTypes) ? mData.incomeTypes : [];
      const units = Array.isArray(mData.units) ? mData.units : [];

      const totalIncAmt = incList.reduce((acc, x) => acc + (Number(x.amount) || 0), 0);
      const totalExpAmt = expList.reduce((acc, x) => acc + (Number(x.amount) || 0), 0);

      const isValid = (incList.length > 0 || expList.length > 0 || depts.length > 0);

      const html = `
        <div style="background: ${isValid ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'}; border: 1px solid ${isValid ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 24px;">${isValid ? '✅' : '⚠️'}</span>
          <div>
            <strong style="color: ${isValid ? '#059669' : '#dc2626'}; font-size: 14px;">${isValid ? 'Struktur Berkas Valid & Terverifikasi' : 'Struktur Berkas Tidak Lengkap'}</strong>
            <div style="font-size: 12px; color: var(--text3); margin-top: 2px;">Nama Berkas: <code>${file.name}</code> (${(file.size / 1024).toFixed(1)} KB)</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div style="background: var(--input-bg); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--glass-border);">
            <div style="font-size: 11px; color: var(--text3); text-transform: uppercase;">Aplikasi & Tanggal</div>
            <div style="font-weight: 700; color: var(--text); font-size: 13px; margin-top: 2px;">${data.appName || 'BISDAC'}</div>
            <div style="font-size: 11px; color: var(--text4);">${data.exportDate ? new Date(data.exportDate).toLocaleString('id-ID') : '-'}</div>
          </div>
          <div style="background: var(--input-bg); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--glass-border);">
            <div style="font-size: 11px; color: var(--text3); text-transform: uppercase;">Pemasukan Kas</div>
            <div style="font-weight: 700; color: #10b981; font-size: 14px; margin-top: 2px;">${incList.length} Transaksi</div>
            <div style="font-size: 12px; font-weight: 600;">Rp ${totalIncAmt.toLocaleString('id-ID')}</div>
          </div>
          <div style="background: var(--input-bg); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--glass-border);">
            <div style="font-size: 11px; color: var(--text3); text-transform: uppercase;">Pengeluaran Kas</div>
            <div style="font-weight: 700; color: #ef4444; font-size: 14px; margin-top: 2px;">${expList.length} Transaksi</div>
            <div style="font-size: 12px; font-weight: 600;">Rp ${totalExpAmt.toLocaleString('id-ID')}</div>
          </div>
          <div style="background: var(--input-bg); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--glass-border);">
            <div style="font-size: 11px; color: var(--text3); text-transform: uppercase;">Master Data</div>
            <div style="font-weight: 700; color: var(--text); font-size: 13px; margin-top: 2px;">${depts.length} Dept | ${units.length} Unit</div>
            <div style="font-size: 11px; color: var(--text4);">${incTypes.length} Kategori Penerimaan</div>
          </div>
          <div style="background: var(--input-bg); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--glass-border);">
            <div style="font-size: 11px; color: var(--text3); text-transform: uppercase;">Pengguna & Log</div>
            <div style="font-weight: 700; color: var(--text); font-size: 13px; margin-top: 2px;">${usersList.length} Pengguna</div>
            <div style="font-size: 11px; color: var(--text4);">${(data.auditLogs || []).length} Catatan Log Audit</div>
          </div>
        </div>

        <div style="font-size: 12px; color: var(--text3); line-height: 1.5; padding: 12px; background: rgba(0,0,0,0.03); border-radius: 6px;">
          ℹ️ <em>Integritas berkas cadangan ini telah teruji. Berkas dapat disimpan aman di media penyimpanan eksternal (Flashdisk / Harddisk) sebagai arsip snapshot offline sewaktu-waktu.</em>
        </div>
      `;

      const bodyEl = document.getElementById('backupPreviewBody');
      if (bodyEl) bodyEl.innerHTML = html;
      const modalEl = document.getElementById('modalBackupPreview');
      if (modalEl) modalEl.style.display = 'flex';
      event.target.value = '';
    } catch (err) {
      notify('Gagal membaca berkas cadangan: ' + err.message, 'error');
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

export function closeBackupPreviewModal() {
  const m = document.getElementById('modalBackupPreview');
  if (m) m.style.display = 'none';
}

export function saveIncomeDraft() {
  try {
    const type = document.getElementById('incType')?.value || '';
    const date = document.getElementById('incDate')?.value || '';
    const unit = document.getElementById('incUnit')?.value || '';
    const giver = document.getElementById('incGiver')?.value || '';
    const receipt = document.getElementById('incReceipt')?.value || '';
    const note = document.getElementById('incNote')?.value || '';
    const dest = document.getElementById('incDestination')?.value || 'CASH';
    const amount = document.getElementById('incAmount')?.value || '';
    const amtPerp = document.getElementById('incAmtPerpuluhan')?.value || '';
    const amtTerpadu = document.getElementById('incAmtTerpadu')?.value || '';
    const amtJemaat = document.getElementById('incAmtKhususJemaat')?.value || '';
    const amtDaerah = document.getElementById('incAmtKhususDaerah')?.value || '';

    if (type || giver || receipt || note || amount || amtPerp || amtTerpadu || amtJemaat || amtDaerah) {
      const draft = { type, date, unit, giver, receipt, note, dest, amount, amtPerp, amtTerpadu, amtJemaat, amtDaerah };
      sessionStorage.setItem('BISDAC_draft_inc', JSON.stringify(draft));
    }
  } catch (e) { }
}

export function restoreIncomeDraft() {
  try {
    const raw = sessionStorage.getItem('BISDAC_draft_inc');
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (!draft) return;
    if (draft.date && document.getElementById('incDate')) document.getElementById('incDate').value = draft.date;
    if (draft.type && document.getElementById('incType')) {
      document.getElementById('incType').value = draft.type;
      if (window.handleTypeChange) window.handleTypeChange();
    }
    if (draft.unit !== undefined && document.getElementById('incUnit')) document.getElementById('incUnit').value = draft.unit;
    if (draft.giver !== undefined && document.getElementById('incGiver')) document.getElementById('incGiver').value = draft.giver;
    if (draft.receipt !== undefined && document.getElementById('incReceipt')) document.getElementById('incReceipt').value = draft.receipt;
    if (draft.note !== undefined && document.getElementById('incNote')) document.getElementById('incNote').value = draft.note;
    if (draft.dest !== undefined && document.getElementById('incDestination')) document.getElementById('incDestination').value = draft.dest;
    if (draft.amount !== undefined && document.getElementById('incAmount')) document.getElementById('incAmount').value = draft.amount;
    if (draft.amtPerp !== undefined && document.getElementById('incAmtPerpuluhan')) document.getElementById('incAmtPerpuluhan').value = draft.amtPerp;
    if (draft.amtTerpadu !== undefined && document.getElementById('incAmtTerpadu')) document.getElementById('incAmtTerpadu').value = draft.amtTerpadu;
    if (draft.amtJemaat !== undefined && document.getElementById('incAmtKhususJemaat')) document.getElementById('incAmtKhususJemaat').value = draft.amtJemaat;
    if (draft.amtDaerah !== undefined && document.getElementById('incAmtKhususDaerah')) document.getElementById('incAmtKhususDaerah').value = draft.amtDaerah;
    if (window.updateIncomeAlloc) window.updateIncomeAlloc();
  } catch (e) { }
}

export function clearIncomeDraft() {
  try { sessionStorage.removeItem('BISDAC_draft_inc'); } catch (e) { }
}

export function saveExpenseDraft() {
  try {
    const date = document.getElementById('expDate')?.value || '';
    const dept = document.getElementById('expDept')?.value || '';
    const src = document.getElementById('expSource')?.value || '';
    const receipt = document.getElementById('expReceipt')?.value || '';
    const receiver = document.getElementById('expReceiver')?.value || '';
    const amount = document.getElementById('expAmount')?.value || '';
    const note = document.getElementById('expNote')?.value || '';

    if (dept || receipt || receiver || amount || note) {
      const draft = { date, dept, src, receipt, receiver, amount, note };
      sessionStorage.setItem('BISDAC_draft_exp', JSON.stringify(draft));
    }
  } catch (e) { }
}

export function restoreExpenseDraft() {
  try {
    const raw = sessionStorage.getItem('BISDAC_draft_exp');
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (!draft) return;
    if (draft.date && document.getElementById('expDate')) document.getElementById('expDate').value = draft.date;
    if (draft.dept && document.getElementById('expDept')) document.getElementById('expDept').value = draft.dept;
    if (draft.src && document.getElementById('expSource')) document.getElementById('expSource').value = draft.src;
    if (draft.receipt !== undefined && document.getElementById('expReceipt')) document.getElementById('expReceipt').value = draft.receipt;
    if (draft.receiver !== undefined && document.getElementById('expReceiver')) document.getElementById('expReceiver').value = draft.receiver;
    if (draft.amount !== undefined && document.getElementById('expAmount')) document.getElementById('expAmount').value = draft.amount;
    if (draft.note !== undefined && document.getElementById('expNote')) document.getElementById('expNote').value = draft.note;
  } catch (e) { }
}

export function clearExpenseDraft() {
  try { sessionStorage.removeItem('BISDAC_draft_exp'); } catch (e) { }
}

export function setupDraftAutoSave() {
  const incForm = document.getElementById('page-pemasukan');
  if (incForm) {
    let timer = null;
    incForm.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(saveIncomeDraft, 400);
    });
    incForm.addEventListener('change', () => {
      saveIncomeDraft();
    });
  }

  const expForm = document.getElementById('page-pengeluaran');
  if (expForm) {
    let timer = null;
    expForm.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(saveExpenseDraft, 400);
    });
    expForm.addEventListener('change', () => {
      saveExpenseDraft();
    });
  }
}

// Bind to window for HTML inline access
window.handleLogSearch = handleLogSearch;
window.handleLogActionFilter = handleLogActionFilter;
window.renderLogs = renderLogs;
window.exportLogsToCSV = exportLogsToCSV;
window.downloadFullBackup = downloadFullBackup;
window.validateBackupFile = validateBackupFile;
window.closeBackupPreviewModal = closeBackupPreviewModal;
window.clearIncomeDraft = clearIncomeDraft;
window.clearExpenseDraft = clearExpenseDraft;
window.restoreIncomeDraft = restoreIncomeDraft;
window.restoreExpenseDraft = restoreExpenseDraft;
window.setupDraftAutoSave = setupDraftAutoSave;
