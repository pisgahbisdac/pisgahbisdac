// ==========================================
// MASTER DATA SERVICE (DEPTS, UNITS, CATEGORIES, USERS)
// ==========================================

const safeIcon = (name, size) => (typeof window.safeIcon === 'function' ? window.safeIcon(name, size) : (typeof getIcon === 'function' ? getIcon(name, size) : ''));
const hasRole = (user, targetRole) => {
  if (!user || !user.role) return false;
  if (typeof window.hasRole === 'function') return window.hasRole(user, targetRole);
  const roles = user.role.split(',').map(r => r.trim());
  return roles.includes(targetRole);
};
const getRolePerms = (roleStr) => (typeof window.getRolePerms === 'function' ? window.getRolePerms(roleStr) : {});
const notify = (msg, type) => (typeof window.notify === 'function' ? window.notify(msg, type) : alert(msg));
const apiPost = (...args) => (typeof window.apiPost === 'function' ? window.apiPost(...args) : window.apiPostWithFallback(...args));
const apiGet = (...args) => (typeof window.apiGet === 'function' ? window.apiGet(...args) : window.supabaseGet(...args));
const showCustomConfirm = (...args) => (typeof window.showCustomConfirm === 'function' ? window.showCustomConfirm(...args) : confirm(args[1]));
const loadMasterData = () => (typeof window.loadMasterData === 'function' ? window.loadMasterData() : null);

// Local editing state
let editingIncType = null;
let editingDept = null;
let editingUnit = null;
let editingUnitId = null;
let editingUser = null;

const getCatBadge = (name, isExp) => (typeof window.getCatBadge === 'function' ? window.getCatBadge(name, isExp) : 'badge-gray');
const validatePassword = (pw) => (typeof window.validatePassword === 'function' ? window.validatePassword(pw) : null);
const getUserUnits = (uname) => (typeof window.getUserUnits === 'function' ? window.getUserUnits(uname) : []);
const initForms = () => (typeof window.initForms === 'function' ? window.initForms() : null);

export function openIncTypeModal(isEdit = false) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.masterData?.edit && !hasRole(currentUser, 'Admin') && !hasRole(currentUser, 'Bendahara')) {
    return notify('Anda tidak memiliki izin menambah / mengubah kategori.', 'error');
  }
  if (!isEdit) {
    cancelEditIncType();
  }
  const modal = document.getElementById('incTypeModal');
  if (modal) {
    modal.style.display = 'flex';
  }
  setTimeout(() => {
    const input = document.getElementById('newIncTypeName');
    if (input) input.focus();
  }, 100);
}

export function closeIncTypeModal() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const modal = document.getElementById('incTypeModal');
  if (modal) modal.style.display = 'none';
  cancelEditIncType();
}

export function editIncType(name, pd, pj, pb) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus.masterData?.edit && !hasRole(currentUser, 'Admin')) {
    return notify('Anda tidak memiliki izin mengubah kategori.', 'error');
  }
  editingIncType = name;
  const title = document.getElementById('incTypeFormTitle');
  if (title) title.textContent = 'Ubah Kategori Masukan';
  document.getElementById('newIncTypeName').value = name;
  document.getElementById('newIncTypePctDaerah').value = pd;
  document.getElementById('newIncTypePctJemaat').value = pj;
  document.getElementById('newIncTypePctBangun').value = pb;
  const saveBtn = document.getElementById('incTypeSaveBtn');
  if (saveBtn) saveBtn.textContent = 'Update';
  openIncTypeModal(true);
}

export function cancelEditIncType() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  editingIncType = null;
  const title = document.getElementById('incTypeFormTitle');
  if (title) title.textContent = 'Tambah Kategori Masukan';
  const nameInput = document.getElementById('newIncTypeName');
  if (nameInput) nameInput.value = '';
  const dInput = document.getElementById('newIncTypePctDaerah');
  if (dInput) dInput.value = '0';
  const jInput = document.getElementById('newIncTypePctJemaat');
  if (jInput) jInput.value = '100';
  const bInput = document.getElementById('newIncTypePctBangun');
  if (bInput) bInput.value = '0';
  const saveBtn = document.getElementById('incTypeSaveBtn');
  if (saveBtn) saveBtn.textContent = 'Simpan';
}

export async function saveIncTypeForm() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.masterData?.edit && !hasRole(currentUser, 'Admin') && !hasRole(currentUser, 'Bendahara')) {
    return notify('Anda tidak memiliki izin menambah / mengubah kategori.', 'error');
  }
  const name = document.getElementById('newIncTypeName').value.trim();
  const pd = parseFloat(document.getElementById('newIncTypePctDaerah').value) || 0;
  const pj = parseFloat(document.getElementById('newIncTypePctJemaat').value) || 0;
  const pb = parseFloat(document.getElementById('newIncTypePctBangun').value) || 0;
  if (!name) { notify('Isi Nama Kategori!', 'error'); return; }

  const totalPct = pd + pj + pb;
  if (Math.round(totalPct) !== 100) {
    notify(`Total alokasi harus 100% (saat ini ${totalPct}%)`, 'error');
    return;
  }

  const btn = document.getElementById('incTypeSaveBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Proses...'; }
  try {
    await apiPostWithFallback('saveIncomeType', {
      name,
      pct_daerah: pd,
      pct_jemaat: pj,
      pct_bangun: pb,
      oldName: editingIncType,
      isUpdate: !!editingIncType
    });
    notify(editingIncType ? 'Kategori berhasil diperbarui' : 'Kategori berhasil disimpan', 'success');
    closeIncTypeModal();
    await loadMasterData();
    renderMasterIncTypes();
    initForms();
  } catch (e) {
    notify(e.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = editingIncType ? 'Update' : 'Simpan';
    }
  }
}

export function renderMasterIncTypes() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const listEl = document.getElementById('incTypeList');
  if (!listEl) return;
  const types = masterData?.incomeTypes || [];
  const resv = ['Perpuluhan', 'Terpadu', 'Khusus Jemaat', 'Khusus Daerah', 'Persembahan Khusus'];

  const perms = getRolePerms(currentUser?.role || '');
  const mMaster = perms.menus?.masterData || { view: false, edit: false, del: false };
  const canEdit = mMaster.edit || hasRole(currentUser, 'Admin') || hasRole(currentUser, 'Bendahara');
  const canDel = mMaster.del || hasRole(currentUser, 'Admin') || hasRole(currentUser, 'Bendahara');

  if (types.length === 0) {
    listEl.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text3);">Belum ada kategori masukan. Klik tombol "+ Tambah Kategori" untuk menambahkan.</div>';
  } else {
    listEl.innerHTML = types.map((x, i) => {
      const escapedName = (x.name || '').replace(/'/g, "\\'");
      const isSystem = resv.includes(x.name);

      return `
        <div class="unit-item-card">
          <div style="display:flex; align-items:center; gap:12px; min-width:0; flex:1;">
            <div class="unit-number-badge">${i + 1}</div>
            <div style="min-width:0; flex:1;">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
                <span class="badge ${getCatBadge(x.name, false)}" style="font-weight:700; font-size:13px; padding:3px 8px;">
                  ${x.name || '-'}
                </span>
                ${isSystem ? '<span class="badge badge-gray" style="font-size:10px; padding:2px 6px;">Sistem</span>' : ''}
              </div>
              <div style="display:flex; flex-wrap:wrap; align-items:center; gap:6px; font-size:11.5px; color:var(--text3);">
                <span style="background:rgba(59,130,246,0.1); color:#3b82f6; padding:1px 6px; border-radius:4px; font-weight:600;">D: ${x.pct_daerah}%</span>
                <span style="background:rgba(16,185,129,0.1); color:#10b981; padding:1px 6px; border-radius:4px; font-weight:600;">J: ${x.pct_jemaat}%</span>
                <span style="background:rgba(245,158,11,0.1); color:#f59e0b; padding:1px 6px; border-radius:4px; font-weight:600;">B: ${x.pct_bangun}%</span>
              </div>
            </div>
          </div>
          ${(!isSystem && (canEdit || canDel)) ? `
            <div style="display:flex; gap:6px; align-items:center; flex-shrink:0; margin-left:12px;">
              ${canEdit ? `<button class="btn-icon-only" title="Ubah Kategori" onclick="editIncType('${escapedName}', ${x.pct_daerah}, ${x.pct_jemaat}, ${x.pct_bangun})">${safeIcon('edit')}</button>` : ''}
              ${canDel ? `<button class="btn-icon-only" style="color:var(--red-pop);" title="Hapus Kategori" onclick="deleteIncType('${escapedName}')">${safeIcon('trash')}</button>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  const elTotal = document.getElementById('summaryTotalIncTypes');
  if (elTotal) elTotal.textContent = types.length;
}

export async function deleteIncType(name) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const cachedIncome = window.cachedIncome || [];
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.masterData?.del && !hasRole(currentUser, 'Admin') && !hasRole(currentUser, 'Bendahara')) {
    return notify('Anda tidak memiliki izin menghapus kategori.', 'error');
  }
  const usedCount = (cachedIncome || []).filter(x => x.income_type === name).length;
  let confirmMsg = `Yakin ingin menghapus kategori ${name}?`;
  if (usedCount > 0) {
    confirmMsg = `PERINGATAN: Kategori "${name}" saat ini tercatat digunakan pada ${usedCount} transaksi pemasukan!\n\nMenghapusnya dari Master Data dapat mempengaruhi filter/rekap laporan. Tetap ingin menghapus?`;
  }
  if (await showCustomConfirm('Hapus Kategori', confirmMsg)) {
    try {
      await apiPost('deleteIncomeType', { name });
      notify('Kategori terhapus', 'success');
      await loadMasterData();
      renderMasterIncTypes();
      initForms();
    } catch (e) {
      notify(e.message, 'error');
    }
  }
}

export function openDeptModal(isEdit = false) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.masterData?.edit && !hasRole(currentUser, 'Admin') && !hasRole(currentUser, 'Bendahara')) {
    return notify('Anda tidak memiliki izin menambah / mengubah departemen.', 'error');
  }
  if (!isEdit) {
    cancelEditDept();
  }
  const modal = document.getElementById('deptModal');
  if (modal) {
    modal.style.display = 'flex';
  }
  setTimeout(() => {
    const input = document.getElementById('deptName');
    if (input) input.focus();
  }, 100);
}

export function closeDeptModal() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const modal = document.getElementById('deptModal');
  if (modal) modal.style.display = 'none';
  cancelEditDept();
}

export function cancelEditDept() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  editingDept = null;
  const title = document.getElementById('deptFormTitle');
  if (title) title.textContent = 'Tambah Departemen';
  const nameInput = document.getElementById('deptName');
  if (nameInput) nameInput.value = '';
  const saveBtn = document.getElementById('deptSaveBtn');
  if (saveBtn) saveBtn.textContent = 'Simpan';
}

export async function saveDeptForm() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.masterData?.edit && !hasRole(currentUser, 'Admin') && !hasRole(currentUser, 'Bendahara')) {
    return notify('Anda tidak memiliki izin menambah / mengubah departemen.', 'error');
  }
  const name = document.getElementById('deptName').value.trim();
  if (!name) { notify('Isi Nama Bidang / Departemen!', 'error'); return; }
  const btn = document.getElementById('deptSaveBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Proses...'; }
  try {
    await apiPost('saveDepartment', { id: editingDept, name });
    notify(editingDept ? 'Departemen berhasil diperbarui' : 'Departemen berhasil disimpan', 'success');
    closeDeptModal();
    await loadMasterData();
    renderMasterDepts();
    initForms();
  } catch (e) {
    notify(e.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = editingDept ? 'Update' : 'Simpan';
    }
  }
}

export function editDept(id, name) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.masterData?.edit && !hasRole(currentUser, 'Admin') && !hasRole(currentUser, 'Bendahara')) {
    return notify('Anda tidak memiliki izin mengubah departemen.', 'error');
  }
  editingDept = id;
  const title = document.getElementById('deptFormTitle');
  if (title) title.textContent = 'Ubah Departemen';
  document.getElementById('deptName').value = name;
  const saveBtn = document.getElementById('deptSaveBtn');
  if (saveBtn) saveBtn.textContent = 'Update';
  openDeptModal(true);
}

export function renderMasterDepts() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const listEl = document.getElementById('deptList');
  if (!listEl) return;
  const depts = masterData?.departments || [];

  const perms = getRolePerms(currentUser?.role || '');
  const mMaster = perms.menus?.masterData || { view: false, edit: false, del: false };
  const canEdit = mMaster.edit || hasRole(currentUser, 'Admin') || hasRole(currentUser, 'Bendahara');
  const canDel = mMaster.del || hasRole(currentUser, 'Admin') || hasRole(currentUser, 'Bendahara');

  if (depts.length === 0) {
    listEl.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text3);">Belum ada departemen terdaftar. Klik tombol "+ Tambah Departemen" untuk menambahkan.</div>';
  } else {
    listEl.innerHTML = depts.map((x, i) => {
      const escapedName = (x.name || '').replace(/'/g, "\\'");
      const escapedId = (x.id || x.name || '').replace(/'/g, "\\'");

      return `
        <div class="unit-item-card">
          <div style="display:flex; align-items:center; gap:12px; min-width:0; flex:1;">
            <div class="unit-number-badge">${i + 1}</div>
            <div style="min-width:0; flex:1;">
              <div style="font-weight:600; font-size:14.5px; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${(x.name || '')}">
                ${x.name || '-'}
              </div>
              <div style="margin-top:4px;">
                <span style="font-size:11.5px; color:var(--text3);">Departemen Pelayanan</span>
              </div>
            </div>
          </div>
          ${(canEdit || canDel) ? `
            <div style="display:flex; gap:6px; align-items:center; flex-shrink:0; margin-left:12px;">
              ${canEdit ? `<button class="btn-icon-only" title="Ubah Departemen" onclick="editDept('${escapedId}', '${escapedName}')">${safeIcon('edit')}</button>` : ''}
              ${canDel ? `<button class="btn-icon-only" style="color:var(--red-pop);" title="Hapus Departemen" onclick="deleteDept('${escapedId}')">${safeIcon('trash')}</button>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  const elTotal = document.getElementById('summaryTotalDepts');
  if (elTotal) elTotal.textContent = depts.length;
}

export async function deleteDept(id) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const cachedExpense = window.cachedExpense || [];
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.masterData?.del && !hasRole(currentUser, 'Admin') && !hasRole(currentUser, 'Bendahara')) {
    return notify('Anda tidak memiliki izin menghapus departemen.', 'error');
  }
  const usedCount = (cachedExpense || []).filter(x => x.department === id).length;
  let confirmMsg = `Yakin ingin menghapus departemen "${id}"?`;
  if (usedCount > 0) {
    confirmMsg = `PERINGATAN: Departemen "${id}" saat ini tercatat digunakan pada ${usedCount} transaksi pengeluaran!\n\nMenghapusnya dari Master Data dapat mempengaruhi filter/rekap laporan. Tetap ingin menghapus?`;
  }
  if (await showCustomConfirm('Hapus Departemen', confirmMsg)) {
    try {
      await apiPost('deleteDepartment', { id, name: id });
      notify('Departemen terhapus', 'success');
      await loadMasterData();
      renderMasterDepts();
      initForms();
    } catch (e) {
      notify(e.message, 'error');
    }
  }
}

export function openUnitModal(isEdit = false) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.masterData?.edit && !hasRole(currentUser, 'Admin') && !hasRole(currentUser, 'Bendahara')) {
    return notify('Anda tidak memiliki izin menambah / mengubah unit.', 'error');
  }
  if (!isEdit) {
    cancelEditUnit();
  }
  const modal = document.getElementById('unitModal');
  if (modal) {
    modal.style.display = 'flex';
  }
  setTimeout(() => {
    const input = document.getElementById('unitName');
    if (input) input.focus();
  }, 50);
}

export function closeUnitModal() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const modal = document.getElementById('unitModal');
  if (modal) {
    modal.style.display = 'none';
  }
  cancelEditUnit();
}

export function editUnit(name, note, jumlah, id) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.masterData?.edit && !hasRole(currentUser, 'Admin') && !hasRole(currentUser, 'Bendahara')) {
    return notify('Anda tidak memiliki izin mengubah unit.', 'error');
  }
  editingUnit = name;
  editingUnitId = id || null;
  const title = document.getElementById('unitFormTitle');
  if (title) title.textContent = 'Ubah Unit / Sektor';
  const nameEl = document.getElementById('unitName');
  if (nameEl) nameEl.value = name;
  const noteEl = document.getElementById('unitNote');
  if (noteEl) noteEl.value = note || '';
  const jumlahEl = document.getElementById('unitJumlah');
  if (jumlahEl) jumlahEl.value = jumlah || 0;
  const saveBtn = document.getElementById('unitSaveBtn');
  if (saveBtn) saveBtn.textContent = 'Update';
  openUnitModal(true);
}

export function cancelEditUnit() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  editingUnit = null;
  editingUnitId = null;
  const title = document.getElementById('unitFormTitle');
  if (title) title.textContent = 'Tambah Unit / Sektor';
  const nameEl = document.getElementById('unitName');
  if (nameEl) nameEl.value = '';
  const noteEl = document.getElementById('unitNote');
  if (noteEl) noteEl.value = '';
  const jumlahEl = document.getElementById('unitJumlah');
  if (jumlahEl) jumlahEl.value = '';
  const saveBtn = document.getElementById('unitSaveBtn');
  if (saveBtn) saveBtn.textContent = 'Simpan';
}

export async function saveUnitForm() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.masterData?.edit && !hasRole(currentUser, 'Admin') && !hasRole(currentUser, 'Bendahara')) {
    return notify('Anda tidak memiliki izin menambah / mengubah unit.', 'error');
  }
  const nameInput = document.getElementById('unitName');
  const noteInput = document.getElementById('unitNote');
  const jumlahInput = document.getElementById('unitJumlah');
  const name = nameInput ? nameInput.value.trim() : '';
  const note = noteInput ? noteInput.value.trim() : '';
  const jumlah = parseInt(jumlahInput ? jumlahInput.value : 0) || 0;
  if (!name) { notify('Lengkapi Nama Unit!', 'error'); return; }
  const btn = document.getElementById('unitSaveBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> Proses...';
  }
  try {
    await apiPost('saveUnit', {
      id: editingUnitId,
      name,
      note,
      jumlah_anggota: jumlah,
      oldName: editingUnit,
      isUpdate: !!editingUnit
    });
    notify(editingUnit ? 'Unit berhasil diperbarui' : 'Unit berhasil disimpan', 'success');
    closeUnitModal();
    await loadMasterData();
    renderMasterUnits();
    initForms();
  } catch (e) {
    notify(e.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = editingUnit ? 'Update' : 'Simpan';
    }
  }
}

export function renderMasterUnits() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const units = masterData?.units || [];
  const listEl = document.getElementById('unitList');
  if (!listEl) return;

  const perms = getRolePerms(currentUser?.role || '');
  const mMaster = perms.menus?.masterData || { view: false, edit: false, del: false };
  const canEdit = mMaster.edit || hasRole(currentUser, 'Admin') || hasRole(currentUser, 'Bendahara');
  const canDel = mMaster.del || hasRole(currentUser, 'Admin') || hasRole(currentUser, 'Bendahara');

  if (units.length === 0) {
    listEl.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text3);">Belum ada unit terdaftar. Klik tombol "+ Tambah Unit" untuk menambahkan.</div>';
  } else {
    listEl.innerHTML = units.map((x, i) => {
      const escapedName = (x.name || '').replace(/'/g, "\\'");
      const escapedNote = (x.note || '').replace(/'/g, "\\'");
      const escapedId = (x.id || '').replace(/'/g, "\\'");
      const jumlahAnggota = parseInt(x.jumlah_anggota) || 0;

      return `
        <div class="unit-item-card">
          <div style="display:flex; align-items:center; gap:12px; min-width:0; flex:1;">
            <div class="unit-number-badge">${i + 1}</div>
            <div style="min-width:0; flex:1;">
              <div style="font-weight:600; font-size:14.5px; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${(x.name || '')}">
                ${x.name || '-'}
              </div>
              <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:4px;">
                <span class="unit-jiwa-badge">
                  ${safeIcon('users', 'lucide-xs')}
                  <span>${jumlahAnggota} Jiwa</span>
                </span>
                ${x.note ? `<span class="unit-note-text" title="${(x.note || '')}">${x.note}</span>` : ''}
              </div>
            </div>
          </div>
          ${(canEdit || canDel) ? `
            <div style="display:flex; gap:6px; align-items:center; flex-shrink:0; margin-left:12px;">
              ${canEdit ? `<button class="btn-icon-only" title="Ubah Unit" onclick="editUnit('${escapedName}', '${escapedNote}', ${jumlahAnggota}, '${escapedId}')">${safeIcon('edit')}</button>` : ''}
              ${canDel ? `<button class="btn-icon-only" style="color:var(--red-pop);" title="Hapus Unit" onclick="deleteUnit('${escapedName}', '${escapedId}')">${safeIcon('trash')}</button>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  const elUnits = document.getElementById('summaryTotalUnits');
  const elAnggota = document.getElementById('summaryTotalAnggota');
  if (elUnits && elAnggota) {
    elUnits.textContent = units.length;
    elAnggota.textContent = units.reduce((acc, u) => acc + (parseInt(u.jumlah_anggota) || 0), 0);
  }
}
export async function deleteUnit(name, id) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const cachedIncome = window.cachedIncome || [];
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.masterData?.del && !hasRole(currentUser, 'Admin') && !hasRole(currentUser, 'Bendahara')) {
    return notify('Anda tidak memiliki izin menghapus unit.', 'error');
  }
  const usedCount = (cachedIncome || []).filter(x => x.unit_name === name).length;
  let confirmMsg = `Yakin ingin menghapus unit "${name}"?`;
  if (usedCount > 0) {
    confirmMsg = `PERINGATAN: Unit "${name}" saat ini tercatat digunakan pada ${usedCount} transaksi pemasukan!\n\nTetap ingin menghapus?`;
  }
  if (await showCustomConfirm('Hapus Unit', confirmMsg)) {
    try {
      await apiPost('deleteUnit', { name, id });
      notify('Unit terhapus', 'success');
      await loadMasterData();
      renderMasterUnits();
      initForms();
    } catch (e) {
      notify(e.message, 'error');
    }
  }
}

export async function updateMyAccount() {
  const currentUser = window.currentUser || null;
  const newUsername = document.getElementById('myNewUsername').value.trim();
  const p1 = document.getElementById('myNewPassword').value;
  const p2 = document.getElementById('myNewPasswordConfirm').value;

  if (!newUsername && !p1) { notify('Isi username baru atau sandi baru', 'error'); return; }
  if (p1 && p1 !== p2) { notify('Kata sandi tidak cocok', 'error'); return; }
  if (p1) { const pwErr = validatePassword(p1); if (pwErr) { notify('Sandi tidak valid: ' + pwErr, 'error'); return; } }
  if (newUsername && newUsername.length < 3) { notify('Username minimal 3 karakter', 'error'); return; }

  const btn = document.getElementById('btnUpdateMyPassword');
  btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Memproses...';
  try {
    const payload = {
      username: currentUser.username,
      nama: currentUser.nama,
      role: currentUser.role,
      isUpdate: true
    };
    if (p1) payload.password = p1;
    if (newUsername && newUsername !== currentUser.username) {
      payload.newUsername = newUsername;
    }
    await apiPost('saveUser', payload);

    // Update local session if username changed
    if (newUsername && newUsername !== currentUser.username) {
      currentUser.username = newUsername;
      localStorage.setItem('BISDAC_user', JSON.stringify(currentUser));
    }

    notify('Akun berhasil diperbarui', 'success');
    document.getElementById('myNewUsername').value = '';
    document.getElementById('myNewPassword').value = '';
    document.getElementById('myNewPasswordConfirm').value = '';
  } catch (e) { notify(e.message, 'error'); }
  finally { btn.disabled = false; btn.innerHTML = 'Simpan Perubahan'; }
}

/* ======== USER MANAGEMENT ======== */
let cachedUsersList = [];
let currentUsersSort = 'name_asc';
let currentUsersQuery = '';
let originalUserPassword = '';

export function getUserInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export function openUserModal(isEdit = false) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.users?.edit && !hasRole(currentUser, 'Admin')) {
    return notify('Anda tidak memiliki izin menambah / mengubah user.', 'error');
  }
  if (!isEdit) {
    cancelEditUser();
  }
  const modal = document.getElementById('userModal');
  if (modal) {
    modal.style.display = 'flex';
  }
  setTimeout(() => {
    const input = document.getElementById(isEdit ? 'userFullName' : 'userName');
    if (input) input.focus();
  }, 50);
}

export function closeUserModal() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const modal = document.getElementById('userModal');
  if (modal) {
    modal.style.display = 'none';
  }
  cancelEditUser();
}

export function editUser(username, nama, role, password = null) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus.users?.edit && !hasRole(currentUser, 'Admin')) {
    return notify('Anda tidak memiliki izin mengubah user.', 'error');
  }
  editingUser = username;
  const title = document.getElementById('userFormTitle');
  if (title) title.textContent = 'Ubah Akun';
  const unameInput = document.getElementById('userName');
  if (unameInput) {
    unameInput.value = username;
    unameInput.disabled = true;
  }
  const nameInput = document.getElementById('userFullName');
  if (nameInput) nameInput.value = nama;

  let currentPw = password;
  if (!currentPw) {
    const userObj = cachedUsersList.find(u => u.username === username);
    if (userObj) currentPw = userObj.password;
  }
  originalUserPassword = currentPw || '';

  const pwInput = document.getElementById('userPassword');
  if (pwInput) {
    pwInput.value = currentPw || '';
    pwInput.dispatchEvent(new Event('input'));
  }

  const rolesArray = (role || '').split(',').map(r => r.trim());
  document.querySelectorAll('input[name="userRoleChk"]').forEach(chk => {
    chk.checked = rolesArray.includes(chk.value);
  });

  const boundUnits = getUserUnits(username);
  document.querySelectorAll('.userUnitCheck').forEach(chk => {
    chk.checked = boundUnits.includes(chk.value);
  });

  const saveBtn = document.getElementById('saveUserBtn');
  if (saveBtn) saveBtn.innerHTML = 'Update';
  const cancelBtn = document.getElementById('cancelEditUserBtn');
  if (cancelBtn) cancelBtn.style.display = 'inline-flex';

  openUserModal(true);
}

export function cancelEditUser() {
  editingUser = null;
  originalUserPassword = '';
  const title = document.getElementById('userFormTitle');
  if (title) title.textContent = 'Tambah User';
  const unameInput = document.getElementById('userName');
  if (unameInput) {
    unameInput.value = '';
    unameInput.disabled = false;
  }
  const nameInput = document.getElementById('userFullName');
  if (nameInput) nameInput.value = '';
  const pwInput = document.getElementById('userPassword');
  if (pwInput) {
    pwInput.value = '';
    pwInput.dispatchEvent(new Event('input'));
  }

  document.querySelectorAll('input[name="userRoleChk"]').forEach(chk => chk.checked = false);
  const viewChk = document.querySelector('input[name="userRoleChk"][value="Viewer"]');
  if (viewChk) viewChk.checked = true;

  document.querySelectorAll('.userUnitCheck').forEach(chk => chk.checked = false);

  const saveBtn = document.getElementById('saveUserBtn');
  if (saveBtn) saveBtn.innerHTML = 'Simpan';
}

export async function saveUserForm() {
  const currentUser = window.currentUser || null;
  const systemConfig = window.systemConfig || {};
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus?.users?.edit && !hasRole(currentUser, 'Admin')) {
    return notify('Anda tidak memiliki izin menambah / mengubah user.', 'error');
  }
  const username = document.getElementById('userName').value.trim();
  const nama = document.getElementById('userFullName').value.trim();
  const password = document.getElementById('userPassword').value;
  const roleChecks = document.querySelectorAll('input[name="userRoleChk"]:checked');
  const role = Array.from(roleChecks).map(chk => chk.value).join(', ');
  const unitChecks = document.querySelectorAll('.userUnitCheck:checked');
  const unitsArray = Array.from(unitChecks).map(chk => chk.value);

  if (!username || !role) { notify('Lengkapi data wajib!', 'error'); return; }
  if (password && (!editingUser || password !== originalUserPassword)) {
    const pwErr = validatePassword(password);
    if (pwErr) { notify('Sandi tidak valid: ' + pwErr, 'error'); return; }
  }
  if (!editingUser && !password) { notify('Password wajib diisi untuk user baru!', 'error'); return; }

  const btn = document.getElementById('saveUserBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> Proses...';
  }
  try {
    await apiPost('saveUser', { username, nama, role, password, isUpdate: !!editingUser });

    if (!systemConfig.userUnits) systemConfig.userUnits = {};
    while (typeof systemConfig.userUnits === 'string') {
      try { systemConfig.userUnits = JSON.parse(systemConfig.userUnits); } catch (e) { systemConfig.userUnits = {}; break; }
    }

    if (unitsArray.length > 0) {
      Object.keys(systemConfig.userUnits).forEach(k => { if (k.toLowerCase() === username.toLowerCase()) delete systemConfig.userUnits[k]; });
      systemConfig.userUnits[username] = unitsArray;
    } else {
      Object.keys(systemConfig.userUnits).forEach(k => { if (k.toLowerCase() === username.toLowerCase()) delete systemConfig.userUnits[k]; });
    }
    await apiPostWithFallback('saveConfig', { key: 'userUnits', value: JSON.stringify(systemConfig.userUnits) });

    notify('Berhasil', 'success');
    closeUserModal();
    renderUsers();
  } catch (e) {
    notify(e.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = editingUser ? 'Update' : 'Simpan';
    }
  }
}

export function handleUserSort(sortKey) {
  currentUsersSort = sortKey;
  renderUserCards();
}

export function handleUserSearch(query) {
  currentUsersQuery = (query || '').toLowerCase().trim();
  renderUserCards();
}

export function toggleUserCardPw(el, uname) {
  const textSpan = el.querySelector('.pw-text');
  const eyeSpan = el.querySelector('.pw-eye');
  if (!textSpan) return;
  const isRevealed = textSpan.getAttribute('data-revealed') === 'true';
  if (isRevealed) {
    textSpan.textContent = '••••••••';
    textSpan.setAttribute('data-revealed', 'false');
    if (eyeSpan) eyeSpan.textContent = '👁️';
  } else {
    const userObj = cachedUsersList.find(u => u.username === uname);
    textSpan.textContent = (userObj && userObj.password) ? userObj.password : '(tidak ada sandi)';
    textSpan.setAttribute('data-revealed', 'true');
    if (eyeSpan) eyeSpan.textContent = '🔒';
  }
}

export function renderUserCards() {
  const listEl = document.getElementById('userList');
  if (!listEl) return;

  let list = [...cachedUsersList];

  // Filter
  if (currentUsersQuery) {
    list = list.filter(u =>
      (u.nama || '').toLowerCase().includes(currentUsersQuery) ||
      (u.username || '').toLowerCase().includes(currentUsersQuery) ||
      (u.role || '').toLowerCase().includes(currentUsersQuery)
    );
  }

  // Sort
  list.sort((a, b) => {
    switch (currentUsersSort) {
      case 'name_desc':
        return (b.nama || '').localeCompare(a.nama || '');
      case 'user_asc':
        return (a.username || '').localeCompare(b.username || '');
      case 'user_desc':
        return (b.username || '').localeCompare(a.username || '');
      case 'role_asc': {
        const rolePriority = (rStr) => {
          const r = (rStr || '').toLowerCase();
          if (r.includes('admin')) return 1;
          if (r.includes('bendahara')) return 2;
          if (r.includes('ketua')) return 3;
          if (r.includes('pendeta')) return 4;
          if (r.includes('diakon')) return 5;
          if (r.includes('viewer')) return 6;
          return 7;
        };
        const diff = rolePriority(a.role) - rolePriority(b.role);
        return diff !== 0 ? diff : (a.nama || '').localeCompare(b.nama || '');
      }
      case 'units_desc': {
        const uA = getUserUnits(a.username).length;
        const uB = getUserUnits(b.username).length;
        return uB - uA || (a.nama || '').localeCompare(b.nama || '');
      }
      case 'name_asc':
      default:
        return (a.nama || '').localeCompare(b.nama || '');
    }
  });

  const summaryEl = document.getElementById('summaryTotalUsers');
  if (summaryEl) {
    summaryEl.textContent = cachedUsersList.length;
  }

  if (list.length === 0) {
    listEl.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text3);">Tidak ada pengguna yang cocok.</div>';
    return;
  }

  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  const mUsers = perms.menus?.users || { view: false, edit: false, del: false };
  const canEdit = mUsers.edit || hasRole(currentUser, 'Admin');
  const canDel = mUsers.del || hasRole(currentUser, 'Admin');

  listEl.innerHTML = list.map(x => {
    const uUnit = getUserUnits(x.username);
    const escapedUname = (x.username || '').replace(/'/g, "\\'");
    const escapedNama = (x.nama || '').replace(/'/g, "\\'");
    const escapedRole = (x.role || '').replace(/'/g, "\\'");
    const initials = getUserInitials(x.nama || x.username);

    return `
      <div class="user-item-card">
        <div style="display:flex; align-items:flex-start; gap:14px; min-width:0; flex:1;">
          <div class="user-avatar-badge">${initials}</div>
          <div style="min-width:0; flex:1;">
            <div style="display:flex; align-items:baseline; gap:8px; flex-wrap:wrap;">
              <span style="font-weight:700; font-size:15px; color:var(--text); line-height:1.2;">${x.nama || '-'}</span>
              <span class="user-username-tag">@${x.username}</span>
            </div>
            
            <div style="display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-top:6px;">
              <span class="user-pw-chip" title="Klik untuk lihat/sembunyikan kata sandi" style="cursor:pointer; user-select:none;" onclick="toggleUserCardPw(this, '${escapedUname}')">
                <span style="font-size:11px; opacity:0.7;">🔑</span>
                <span class="pw-text" data-revealed="false" style="font-family:monospace; font-size:11.5px; letter-spacing:1px;">••••••••</span>
                <span class="pw-eye" style="font-size:10px; opacity:0.6; margin-left:2px;">👁️</span>
              </span>
            </div>

            <div style="display:flex; flex-wrap:wrap; align-items:center; gap:5px; margin-top:8px;">
              ${(x.role || '').split(',').filter(Boolean).map(r => {
      const rt = r.trim();
      let badgeClass = 'badge-gray';
      if (rt === 'Admin') badgeClass = 'badge-blue';
      else if (rt === 'Bendahara') badgeClass = 'badge-green';
      else if (rt === 'Ketua Jemaat' || rt === 'Pendeta') badgeClass = 'badge-purple';
      return `<span class="badge ${badgeClass}" style="font-size:10.5px; padding:2px 7px;">${rt}</span>`;
    }).join('')}
              ${uUnit.map(u => `
                <span class="badge badge-gold" style="font-size:10.5px; padding:2px 7px; display:inline-flex; align-items:center; gap:3px;" title="Terikat Unit: ${u}">
                  ${safeIcon('users', 'lucide-xs')} ${u}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        ${(canEdit || (canDel && x.username !== 'admin')) ? `
          <div style="display:flex; gap:6px; align-items:center; flex-shrink:0; margin-left:10px;">
            ${canEdit ? `<button class="btn-icon-only" title="Ubah User" onclick="editUser('${escapedUname}', '${escapedNama}', '${escapedRole}')">${safeIcon('edit')}</button>` : ''}
            ${(canDel && x.username !== 'admin') ? `<button class="btn-icon-only" style="color:var(--red-pop);" title="Hapus User" onclick="deleteUser('${escapedUname}')">${safeIcon('trash')}</button>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

export async function renderUsers() {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  try {
    const res = await apiGet('getUsers');
    cachedUsersList = res.data || [];
    renderUserCards();
  } catch (e) {
    notify('Gagal memuat pengguna: ' + e.message, 'error');
  }
}

export async function deleteUser(username) {
  const currentUser = window.currentUser || null;
  const masterData = window.masterData || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus.users?.del && !hasRole(currentUser, 'Admin')) {
    return notify('Anda tidak memiliki izin menghapus user.', 'error');
  }
  if (await showCustomConfirm('Hapus User', `Yakin ingin menghapus user @${username}?`)) {
    try {
      await apiPost('deleteRecord', { type: 'users', transaction_id: username });
      notify('Terhapus', 'success');
      renderUsers();
    } catch (e) {
      notify(e.message, 'error');
    }
  }
}

// Bind to window for HTML inline access
window.openIncTypeModal = openIncTypeModal;
window.closeIncTypeModal = closeIncTypeModal;
window.editIncType = editIncType;
window.cancelEditIncType = cancelEditIncType;
window.saveIncTypeForm = saveIncTypeForm;
window.renderMasterIncTypes = renderMasterIncTypes;
window.deleteIncType = deleteIncType;
window.openDeptModal = openDeptModal;
window.closeDeptModal = closeDeptModal;
window.cancelEditDept = cancelEditDept;
window.saveDeptForm = saveDeptForm;
window.editDept = editDept;
window.renderMasterDepts = renderMasterDepts;
window.deleteDept = deleteDept;
window.openUnitModal = openUnitModal;
window.closeUnitModal = closeUnitModal;
window.editUnit = editUnit;
window.cancelEditUnit = cancelEditUnit;
window.saveUnitForm = saveUnitForm;
window.renderMasterUnits = renderMasterUnits;
window.deleteUnit = deleteUnit;
window.updateMyAccount = updateMyAccount;
window.getUserInitials = getUserInitials;
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.editUser = editUser;
window.cancelEditUser = cancelEditUser;
window.saveUserForm = saveUserForm;
window.handleUserSort = handleUserSort;
window.handleUserSearch = handleUserSearch;
window.toggleUserCardPw = toggleUserCardPw;
window.renderUserCards = renderUserCards;
window.renderUsers = renderUsers;
window.deleteUser = deleteUser;
