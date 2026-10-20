import { supabaseGet, supabasePost, checkLaporanSupabaseHealth, migrateLaporanGASToSupabase, backupSupabaseToGAS } from './supabaseAdapter.js';
import { GMAHK_LOGO_BASE64 } from './modules/logoAsset.js';
import './modules/masterDataService.js';
import {
  openIncTypeModal, closeIncTypeModal, editIncType, cancelEditIncType, saveIncTypeForm, renderMasterIncTypes, deleteIncType,
  openDeptModal, closeDeptModal, cancelEditDept, saveDeptForm, editDept, renderMasterDepts, deleteDept,
  openUnitModal, closeUnitModal, editUnit, cancelEditUnit, saveUnitForm, renderMasterUnits, deleteUnit,
  updateMyAccount, getUserInitials, openUserModal, closeUserModal, editUser, cancelEditUser, saveUserForm,
  handleUserSort, handleUserSearch, toggleUserCardPw, renderUserCards, renderUsers, deleteUser
} from './modules/masterDataService.js';
import './modules/auditBackupService.js';
import './modules/receiptService.js';
import './modules/seriesService.js';
import './modules/uiService.js';
import './modules/bulletinService.js';
import './modules/reportExportService.js';
import {
  generateComplexReportHtml,
  doPrintReport,
  exportToExcel,
  exportHistoryExcel
} from './modules/reportExportService.js';

import {
  terbilang,
  generateReceiptHTML,
  generateReceiptImageBase64,
  upgradeOldReceiptsToHD,
  batchUploadOldReceipts,
  printTransaction
} from './modules/receiptService.js';

import {
  LOG_ACTION_LABELS,
  handleLogSearch,
  handleLogActionFilter,
  renderFilteredLogs,
  renderLogs,
  exportLogsToCSV,
  downloadFullBackup,
  validateBackupFile,
  closeBackupPreviewModal,
  saveIncomeDraft,
  restoreIncomeDraft,
  clearIncomeDraft,
  saveExpenseDraft,
  restoreExpenseDraft,
  clearExpenseDraft,
  setupDraftAutoSave
} from './modules/auditBackupService.js';

import {
  currentSeriesTab,
  currentSeriesFilterCat,
  currentSeriesSearch,
  cachedSeriesHistoryData,
  SERIES_CATEGORY_META,
  switchSeriesTab,
  handleSeriesCardClick,
  handleSeriesHistoryFilter,
  handleSeriesHistorySearch,
  isTxInPeriod,
  detectSeriesCat,
  renderSeriesHistory,
  renderSeriesHistoryTable,
  loadSeriesConfig,
  saveSeriesConfig,
  getNextReceiptNumber,
  autoGenerateReceipt
} from './modules/seriesService.js';

import {
  initPremiumDatePickers,
  initPasswordStrength,
  updateWelcomeGreeting,
  updateDepartmentDonutChart
} from './modules/uiService.js';

import {
  getRecentSabbaths,
  calculateNetBalancesAsOf,
  handleBulletinModeChange,
  openSabbathBulletinModal,
  closeSabbathBulletinModal,
  renderSabbathBulletinPreview,
  printSabbathBulletin,
  copySabbathBulletinWhatsApp
} from './modules/bulletinService.js';


(function () {
  const savedTheme = localStorage.getItem('BISDAC_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

function preLoadLogos() {
  try {
    const cached = localStorage.getItem('BISDAC_config');
    if (cached) {
      const config = JSON.parse(cached);
      document.addEventListener('DOMContentLoaded', () => {
        const loginLogoEls = document.querySelectorAll('.app-logo-login-img');
        const loginDefaultEls = document.querySelectorAll('.app-logo-login-default');
        if (config.logo_login && config.logo_login.trim() !== '') {
          loginLogoEls.forEach(el => { el.src = config.logo_login; el.style.display = 'block'; });
          loginDefaultEls.forEach(el => el.style.display = 'none');
        }
      });
    }
  } catch (e) { }
}
preLoadLogos();

// === ROLE CHECKER ===
function hasRole(user, targetRole) {
  if (!user || !user.role) return false;
  const roles = user.role.split(',').map(r => r.trim());
  return roles.includes(targetRole);
}
window.hasRole = hasRole;
window.showPage = showPage;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.toggleSidebarPin = toggleSidebarPin;
window.updatePinButtonState = updatePinButtonState;

const svgStore = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  edit: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="15" y1="22" x2="15" y2="2"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  church: '<path d="M18 22V10l-6-6-6 6v12"/><path d="M12 4v4"/><path d="M10 6h4"/><path d="M14 22v-4a2 2 0 0 0-4 0v4"/>',
  mappin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  hammer: '<path d="M14 14l6 6"/><path d="M15 13l-4-4 2-2 4 4-2 2z"/><path d="M11 9L6.5 4.5a2.12 2.12 0 0 0-3 0L2 6a2.12 2.12 0 0 0 0 3l4.5 4.5"/>',
  trendDown: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  trendUp: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  barChart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  bookOpen: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
  fileSearch: '<path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v3"/><polyline points="14 2 14 8 20 8"/><circle cx="5" cy="14" r="3"/><path d="m7.2 16.2 2.3 2.3"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
  refresh: '<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  filetext: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
  fileText: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
  printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  lockOpen: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'
};

function getIcon(name, sizeClass = 'lucide-sm') {
  return `<svg class="lucide ${sizeClass}" viewBox="0 0 24 24">${svgStore[name] || ''}</svg>`;
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('BISDAC_theme', newTheme);
  updateThemeIcons();
  if (typeof updateDashboardChart === 'function') {
    setTimeout(updateDashboardChart, 50);
  }
}

function updateThemeIcons() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const iconName = currentTheme === 'dark' ? 'sun' : 'moon';
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.innerHTML = getIcon(iconName, 'lucide-md');
  });
}

document.addEventListener('DOMContentLoaded', updateThemeIcons);

function closeDashboardDetail() {
  document.getElementById('dashboardDetailModal').style.display = 'none';
}

function openDashboardDetail(type, filterCat = null, filterKas = null) {
  console.log("openDashboardDetail called with type:", type, filterCat, filterKas);
  console.log("cachedSaldo:", cachedSaldo);
  if (!cachedSaldo) { console.log("returning early due to no cachedSaldo"); return; }
  const monthEl = document.getElementById('dashMonth');
  const yearEl = document.getElementById('dashYear');
  console.log("monthEl:", monthEl, "yearEl:", yearEl);
  if (!monthEl || !yearEl) { console.log("returning early due to missing elements"); return; }
  const month = parseInt(monthEl.value);
  const year = parseInt(yearEl.value);
  console.log("parsed month:", month, "year:", year);
  let targetDateEnd = month === 0 ? new Date(year, 11, 31, 23, 59, 59) : new Date(year, month, 0, 23, 59, 59);

  const filterFn = row => {
    const rYear = parseInt(row.year) || (new Date(row.date).getFullYear());
    const rMonth = parseInt(row.month) || (new Date(row.date).getMonth() + 1);
    return rYear === year && (month === 0 || rMonth === month);
  };

  const filteredInc = (cachedIncome || []).filter(filterFn);
  const filteredExp = (cachedExpense || []).filter(filterFn);

  // ADD DEBUG INFO TO DASHBOARD TITLE
  const dbTitle = document.querySelector('h2.content-title');
  if (dbTitle) {
    dbTitle.innerHTML = `Dashboard <span style="font-size:12px;color:red;display:block;">DEBUG: Total Inc=${(cachedIncome || []).length}, Filtered=${filteredInc.length}, Year=${year}</span>`;
  }
  const historicalInc = (cachedIncome || []).filter(x => new Date(x.date) <= targetDateEnd);
  const historicalExp = (cachedExpense || []).filter(x => new Date(x.date) <= targetDateEnd);

  let title = "";
  let txList = [];
  const perms = getRolePerms(currentUser ? currentUser.role : '');
  const isViewer = perms.isAnonymous;

  if (type === 'total' || type === 'bersih') {
    title = type === 'total' ? "Semua Transaksi Saldo" : "Semua Transaksi Kas Bersih";
    historicalInc.forEach(x => { if (type === 'total' || x.alloc_jemaat > 0 || x.alloc_bangun > 0) txList.push({ ...x, isInc: true }); });
    historicalExp.forEach(x => {
      if (x.department === 'Mutasi Kas / Setor Bank') return;
      if (type === 'total' || x.source_balance === 'Kas Jemaat' || x.source_balance === 'Pembangunan') txList.push({ ...x, isInc: false });
    });
  } else if (type === 'in') {
    title = "Pemasukan Periode Ini";
    filteredInc.forEach(x => txList.push({ ...x, isInc: true }));
  } else if (type === 'out') {
    title = "Pengeluaran Periode Ini";
    filteredExp.forEach(x => { if (x.department !== 'Mutasi Kas / Setor Bank') txList.push({ ...x, isInc: false }); });
  } else if (type === 'jemaat') {
    title = "Rincian Kas Jemaat";
    historicalInc.forEach(x => { if (x.alloc_jemaat > 0) txList.push({ ...x, isInc: true, overrideAmt: x.alloc_jemaat }); });
    historicalExp.forEach(x => { if (x.department !== 'Mutasi Kas / Setor Bank' && x.source_balance === 'Kas Jemaat') txList.push({ ...x, isInc: false }); });
  } else if (type === 'daerah') {
    title = "Rincian Kas Daerah";
    historicalInc.forEach(x => { if (x.alloc_daerah > 0) txList.push({ ...x, isInc: true, overrideAmt: x.alloc_daerah }); });
    historicalExp.forEach(x => { if (x.department !== 'Mutasi Kas / Setor Bank' && x.source_balance === 'Daerah') txList.push({ ...x, isInc: false }); });
  } else if (type === 'bangun') {
    title = "Rincian Dana Pembangunan";
    historicalInc.forEach(x => { if (x.alloc_bangun > 0) txList.push({ ...x, isInc: true, overrideAmt: x.alloc_bangun }); });
    historicalExp.forEach(x => { if (x.department !== 'Mutasi Kas / Setor Bank' && x.source_balance === 'Pembangunan') txList.push({ ...x, isInc: false }); });
  } else if (type === 'income_jemaat') {
    title = "Pemasukan Bulan Ini: Kas Jemaat";
    filteredInc.forEach(x => { if (x.alloc_jemaat > 0) txList.push({ ...x, isInc: true, overrideAmt: x.alloc_jemaat }); });
  } else if (type === 'income_daerah') {
    title = "Pemasukan Bulan Ini: Kas Daerah";
    filteredInc.forEach(x => { if (x.alloc_daerah > 0) txList.push({ ...x, isInc: true, overrideAmt: x.alloc_daerah }); });
  } else if (type === 'income_bangun') {
    title = "Pemasukan Bulan Ini: Pembangunan";
    filteredInc.forEach(x => { if (x.alloc_bangun > 0) txList.push({ ...x, isInc: true, overrideAmt: x.alloc_bangun }); });
  } else if (type === 'income_cat') {
    title = "Pemasukan: " + filterCat;
    if (filterKas) {
      title += " (" + filterKas.charAt(0).toUpperCase() + filterKas.slice(1) + ")";
    }
    filteredInc.forEach(x => {
      if (x.income_type === filterCat) {
        let amt = x.amount;
        if (filterKas === 'jemaat' && x.alloc_jemaat > 0) amt = x.alloc_jemaat;
        else if (filterKas === 'daerah' && x.alloc_daerah > 0) amt = x.alloc_daerah;
        else if (filterKas === 'bangun' && x.alloc_bangun > 0) amt = x.alloc_bangun;
        else if (filterKas) return; // skip if allocation is 0
        txList.push({ ...x, isInc: true, overrideAmt: amt });
      }
    });
  } else if (type === 'expense_cat') {
    title = "Pengeluaran: " + filterCat;
    filteredExp.forEach(x => {
      if (x.department === filterCat) {
        txList.push({ ...x, isInc: false });
      }
    });
  }

  if (type === 'jemaat' && cachedSaldo.initJemaat) {
    txList.push({ isInc: true, overrideAmt: cachedSaldo.initJemaat, receipt_no: 'SALDO_AWAL', date: '2000-01-01', income_type: 'Saldo Awal Sistem', note: 'Diinput saat setup', nama_pemberi: 'Sistem' });
  }
  if (type === 'daerah' && cachedSaldo.initDaerah) {
    txList.push({ isInc: true, overrideAmt: cachedSaldo.initDaerah, receipt_no: 'SALDO_AWAL', date: '2000-01-01', income_type: 'Saldo Awal Sistem', note: 'Diinput saat setup', nama_pemberi: 'Sistem' });
  }
  if (type === 'bangun' && cachedSaldo.initBangun) {
    txList.push({ isInc: true, overrideAmt: cachedSaldo.initBangun, receipt_no: 'SALDO_AWAL', date: '2000-01-01', income_type: 'Saldo Awal Sistem', note: 'Diinput saat setup', nama_pemberi: 'Sistem' });
  }
  if (type === 'total') {
    const initT = (cachedSaldo.initJemaat || 0) + (cachedSaldo.initDaerah || 0) + (cachedSaldo.initBangun || 0);
    if (initT) txList.push({ isInc: true, overrideAmt: initT, receipt_no: 'SALDO_AWAL', date: '2000-01-01', income_type: 'Saldo Awal Sistem', note: 'Diinput saat setup', nama_pemberi: 'Sistem' });
  }
  if (type === 'bersih') {
    const initB = (cachedSaldo.initJemaat || 0) + (cachedSaldo.initBangun || 0);
    if (initB) txList.push({ isInc: true, overrideAmt: initB, receipt_no: 'SALDO_AWAL', date: '2000-01-01', income_type: 'Saldo Awal Sistem', note: 'Diinput saat setup', nama_pemberi: 'Sistem' });
  }

  txList.sort((a, b) => new Date(b.date) - new Date(a.date));

  document.getElementById('dashDetailTitle').textContent = title;

  let html = "";
  if (txList.length === 0) {
    html = `<div class="empty-state">Tidak ada transaksi.</div>`;
  } else {
    let totalInc = 0;
    let totalExp = 0;
    let listHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column; gap:6px;">';

    txList.forEach(x => {
      const amt = x.overrideAmt || x.amount;
      if (x.isInc) totalInc += amt; else totalExp += amt;
      const isPrivCategory = isViewer && x.isInc && isPrivateCategory(x.income_type);
      const displayPihak = x.isInc ? (isPrivCategory ? '*** (Privasi)' : (x.unit_name && x.unit_name !== '-' ? x.unit_name : (x.nama_pemberi || '-'))) : (x.nama_penerima || '-');
      const displayNote = isPrivCategory ? '*** (Privasi)' : (x.note || '-');

      let photoBtn = '';
      photoBtn = getPhotoBtnText(x);

      listHtml += `
          <div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--empty-bg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge ${x.isInc ? 'badge-green' : 'badge-red'}" style="font-size:10px; padding:2px 7px;">${x.isInc ? 'IN' : 'OUT'}</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no}</span>
              </div>
              <div class="${x.isInc ? 'amount-pos' : 'amount-neg'}" style="font-weight: 700; font-size: 15px; white-space:nowrap;">${x.isInc ? '+' : '-'}${fmt(amt)}</div>
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
              <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
              <span style="color:var(--text4)">Pihak</span><strong style="color:var(--text); font-weight:600; overflow:hidden; text-overflow:ellipsis;">${displayPihak}</strong>
              <span style="color:var(--text4)">Ket</span><strong style="color:var(--text); font-weight:600;">${x.isInc ? x.income_type : x.department}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${displayNote}</span>
            </div>
            ${photoBtn}
          </div>`;
    });
    listHtml += '</div>';

    let totalVal = totalInc - totalExp;
    let summaryHtml = `
        <div class="dash-summary-grid" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
          <div style="background: rgba(5, 150, 105, 0.08); border: 1px solid rgba(5, 150, 105, 0.2); padding: 12px; border-radius: var(--radius); text-align: center; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 11px; color: var(--text3); margin-bottom: 4px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Pemasukan</div>
            <div class="amount-pos" style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">+${fmt(totalInc)}</div>
          </div>
          <div style="background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.2); padding: 12px; border-radius: var(--radius); text-align: center; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 11px; color: var(--text3); margin-bottom: 4px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Pengeluaran</div>
            <div class="amount-neg" style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">-${fmt(totalExp)}</div>
          </div>
          <div style="background: var(--empty-bg); border: 1px solid var(--glass-border); padding: 12px; border-radius: var(--radius); text-align: center; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 11px; color: var(--text3); margin-bottom: 4px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Saldo</div>
            <div class="${totalVal >= 0 ? 'amount-pos' : 'amount-neg'}" style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">${totalVal >= 0 ? '+' : ''}${fmt(totalVal)}</div>
          </div>
        </div>
        `;

    html = summaryHtml + listHtml;
  }

  document.getElementById('dashDetailContent').innerHTML = html;
  document.getElementById('dashboardDetailModal').style.display = 'flex';
}

const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbxv6_4xuZNgdKhav3W-64e_l7QrsaBQ7kV_A34SnjjT2hmn1NXma4uswa14h_5ifFCt2Q/exec';
const PEMBANGUNAN_URL = 'https://script.google.com/macros/s/AKfycbx35l57FiEOFXFbv93JuoVyiEWlYAblB60moTbfl8DtdfANRddzSDyzi3TxmAVDAB7fKQ/exec';
const INVENTARIS_URL = 'https://script.google.com/macros/s/AKfycbxv6_4xuZNgdKhav3W-64e_l7QrsaBQ7kV_A34SnjjT2hmn1NXma4uswa14h_5ifFCt2Q/exec';

function getActiveApiUrl() {
  const savedUrl = localStorage.getItem('BISDAC_api_url');
  if (savedUrl) return savedUrl;

  if (window.location.pathname.includes('pembangunan')) {
    return PEMBANGUNAN_URL;
  }
  if (window.location.pathname.includes('inventaris')) {
    return INVENTARIS_URL;
  }
  return DEFAULT_API_URL;
}

let currentIncPhotos = [];
let currentExpPhotos = [];
let currentMutPhotos = [];
let currentEditPhotos = [];
let currentReportData = null;

function parseRupiah(str) {
  if (!str) return 0;
  let val = String(str).replace(/[^0-9]/g, '');
  return parseFloat(val) || 0;
}

function formatRupiah(el) {
  let val = el.value.replace(/[^0-9]/g, '');
  if (val) {
    el.value = parseInt(val).toLocaleString('id-ID');
  } else {
    el.value = '';
  }
}


function printUnitReport(searchTermOverride = null) {
  if (!window.currentHistoryData || window.currentHistoryData.length === 0) return notify('Tidak ada data untuk dicetak.', 'error');

  const unitSearchTerm = (typeof searchTermOverride === 'string' ? searchTermOverride : '') || (document.getElementById('searchTrans')?.value.trim()) || '';

  const incByCat = {};
  const expByDept = {};
  let totalInc = 0;
  let totalExp = 0;

  window.currentHistoryData.forEach(x => {
    if (x.department === 'Mutasi Kas / Setor Bank' || x.income_type === 'Mutasi Kas / Setor Bank') return;
    if (x.type === 'income') {
      const isBangun = (x.income_type || '').toLowerCase().includes('pembangunan') || parseFloat(x.alloc_bangun || 0) > 0;
      if (isBangun) return;
      const cat = x.income_type || 'Lainnya';
      if (!incByCat[cat]) incByCat[cat] = [];
      incByCat[cat].push(x);
      totalInc += x.amount;
    } else {
      if (x.source_balance === 'Pembangunan') return;
      const dept = x.department || 'Lainnya';
      if (!expByDept[dept]) expByDept[dept] = [];
      expByDept[dept].push(x);
      totalExp += x.amount;
    }
  });

  const mNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  let periodStr = "Semua Waktu";
  const fM = parseInt(document.getElementById('filterMonth')?.value || 0);
  const fY = parseInt(document.getElementById('filterYear')?.value || 0);
  if (fM > 0 && fY > 0) periodStr = `${mNames[fM]} ${fY}`;
  else if (fM > 0) periodStr = `${mNames[fM]}`;
  else if (fY > 0) periodStr = `Tahun ${fY}`;

  currentReportData = {
    summary: { totalIncome: totalInc, totalExpense: totalExp, netBalance: totalInc - totalExp, balances: cachedSaldo || { total: 0 } },
    incByCategory: incByCat,
    expByDept: expByDept,
    month: fM || 0,
    year: fY || 0,
    customTitle: unitSearchTerm ? `LAPORAN PENCARIAN: ${unitSearchTerm.toUpperCase()}` : `LAPORAN PENCARIAN TRANSAKSI`,
    customPeriod: `Period: ${periodStr}`
  };

  showPage('laporan');
  renderReportView();

  const container = document.getElementById('printContainer');
  const content = document.getElementById('reportContent');
  if (container && content) {
    container.innerHTML = content.innerHTML;
  }

  setTimeout(() => { window.print(); }, 1500);
}

function getToken() { return localStorage.getItem('BISDAC_token'); }
function setToken(t) { localStorage.setItem('BISDAC_token', t); }
function clearToken() { localStorage.removeItem('BISDAC_token'); }

async function gasGet(action, params = {}) {
  const baseUrl = getActiveApiUrl();
  let url = `${baseUrl}?action=${encodeURIComponent(action)}`;
  const token = getToken();
  if (token) url += `&token=${encodeURIComponent(token)}`;
  url += `&_t=${Date.now()}`;
  Object.keys(params).forEach(k => {
    if (params[k] !== undefined && params[k] !== null) url += `&${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`;
  });
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const data = await res.json();
  return data;
}

async function gasPost(action, payload = {}) {
  const baseUrl = getActiveApiUrl();
  const bodyData = { action, ...payload };
  const token = getToken();
  if (token) bodyData.token = token;
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    redirect: 'follow',
    body: JSON.stringify(bodyData)
  });
  const data = await res.json();
  return data;
}

async function apiGet(action, params = {}) {
  if (action !== 'syncData' && !window.isBulkProcessing) showGlobalLoading();
  try {
    let res;
    let usedGasFallback = false;
    try {
      res = await supabaseGet(action, params);
      if (!res || !res.success) {
        console.warn('supabaseGet unsuccessful, trying GAS fallback:', res?.message);
        res = await gasGet(action, params);
        usedGasFallback = true;
      }
    } catch (sbErr) {
      console.warn('supabaseGet exception, falling back to GAS:', sbErr);
      res = await gasGet(action, params);
      usedGasFallback = true;
    }

    if (usedGasFallback) {
      setStatus('warning', 'Google Sheets Cadangan');
    }

    if (!res.success) {
      if (res.message && res.message.includes('Token tidak valid')) {
        if (typeof notify === 'function') notify('Sesi Anda telah berakhir. Halaman akan dimuat ulang...', 'error');
        setTimeout(() => { clearToken(); localStorage.removeItem('BISDAC_user'); window.location.reload(); }, 3000);
      }
      throw new Error(res.message || 'API Gagal');
    }
    return res;
  } finally {
    if (action !== 'syncData' && !window.isBulkProcessing) hideGlobalLoading();
  }
}

function showGlobalLoading(text = 'Proses sedang berlangsung...') {
  const overlay = document.getElementById('globalLoadingOverlay');
  const textEl = document.getElementById('globalLoadingText');
  if (overlay && textEl) {
    textEl.innerText = text;
    overlay.style.display = 'flex';
  }
}

window.showGlobalLoading = showGlobalLoading;

function hideGlobalLoading() {
  const overlay = document.getElementById('globalLoadingOverlay');
  if (overlay) overlay.style.display = 'none';
}
window.hideGlobalLoading = hideGlobalLoading;

async function apiPost(action, payload = {}) {
  if (action !== 'syncData' && !window.isBulkProcessing) showGlobalLoading();
  try {
    let res;
    let usedGasFallback = false;
    try {
      res = await supabasePost(action, payload);
      if (res && res.success) {
        // Dual Backup di background: sync Google Sheets tanpa memblokir UI
        gasPost(action, payload).catch(err => console.warn('Dual backup to GAS failed:', err));
        return res;
      } else {
        console.warn('supabasePost unsuccessful, trying GAS fallback:', res?.message);
        res = await gasPost(action, payload);
        usedGasFallback = true;
      }
    } catch (sbErr) {
      console.warn('supabasePost exception, falling back to GAS:', sbErr);
      res = await gasPost(action, payload);
      usedGasFallback = true;
    }

    if (usedGasFallback) {
      setStatus('warning', 'Google Sheets Cadangan');
    }

    if (!res.success) {
      if (res.message && res.message.includes('Token tidak valid')) {
        if (typeof notify === 'function') notify('Sesi Anda telah berakhir. Halaman akan dimuat ulang...', 'error');
        setTimeout(() => { clearToken(); localStorage.removeItem('BISDAC_user'); window.location.reload(); }, 3000);
      }
      throw new Error(res.message || 'Gagal menyimpan data.');
    }
    return res;
  } finally {
    if (action !== 'syncData' && !window.isBulkProcessing) hideGlobalLoading();
  }
}

async function apiPostWithFallback(action, payload = {}) {
  try { return await apiPost(action, payload); } catch (error) {
    if (error.message && (error.message.includes("tidak dikenali") || error.message.includes("not found") || error.message.includes("Action"))) {
      if (action === 'editRecord' || action === 'editBulkIncome') {
        throw new Error(`Server Apps Script perlu diperbarui (Lakukan New Deployment).`);
      }
    }
    throw error;
  }
}

async function login(username, password) {
  if (typeof showGlobalLoading === 'function') showGlobalLoading('Memverifikasi Login...');
  try {
    let res;
    try {
      res = await supabasePost('login', { username: username.trim().toLowerCase(), password: password });
    } catch (e) {
      console.warn('Supabase login error, fallback to GAS:', e);
    }
    if (!res || !res.success) {
      // Fallback check GAS
      const gasRes = await gasGet('login', { username: username.trim().toLowerCase(), password: password });
      if (gasRes && gasRes.success) {
        res = gasRes;
        setStatus('warning', 'Google Sheets Cadangan');
      }
    }
    if (res && res.success) {
      setToken(res.token);
      localStorage.setItem('BISDAC_user', JSON.stringify(res.user));
      return res;
    } else {
      throw new Error(res?.message || 'Login gagal');
    }
  } finally {
    if (typeof hideGlobalLoading === 'function') hideGlobalLoading();
  }
}

async function doLogout() {
  if (!currentUser || currentUser.role !== 'Publik') {
    if (typeof showCustomConfirm === 'function') {
      const yes = await showCustomConfirm('Konfirmasi', 'Apakah Anda yakin ingin keluar?');
      if (!yes) return;
    } else {
      if (!confirm('Apakah Anda yakin ingin keluar?')) return;
    }
  }
  clearToken(); localStorage.removeItem('BISDAC_user'); localStorage.removeItem('BISDAC_token'); window.location.reload();
}
function getCurrentUser() { const u = localStorage.getItem('BISDAC_user'); return u ? JSON.parse(u) : null; }

function loginAsPublic() {
  // Login langsung di latar belakang tanpa mengisi form di layar
  doLogin('test', 'Test1117!');
}

function getUserUnits(uname = null) {
  const targetUser = uname || (currentUser ? currentUser.username : null);
  if (!systemConfig.userUnits || !targetUser) return [];
  let units = systemConfig.userUnits;
  while (typeof units === 'string') {
    try { units = JSON.parse(units); } catch (e) { return []; }
  }
  for (const [key, val] of Object.entries(units || {})) {
    if (key.toLowerCase() === targetUser.toLowerCase()) {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return [val]; // backward compatibility
      return [];
    }
  }
  return [];
}

let systemConfig = {};
async function loadSystemConfig() {
  try {
    const cached = localStorage.getItem('BISDAC_config');
    if (cached) {
      systemConfig = JSON.parse(cached);
      if (typeof systemConfig.rolePermissions === 'string') { try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { } }
      if (typeof systemConfig.userUnits === 'string') { try { systemConfig.userUnits = JSON.parse(systemConfig.userUnits); } catch (e) { } }
      applyConfig();
    }
    const res = await apiGet('getConfig');
    if (res && res.success) {
      systemConfig = { ...systemConfig, ...(res.data || {}) };
      if (typeof systemConfig.rolePermissions === 'string') { try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { } }
      if (typeof systemConfig.userUnits === 'string') { try { systemConfig.userUnits = JSON.parse(systemConfig.userUnits); } catch (e) { } }
      localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
      applyConfig();
    }
  } catch (e) { throw e; }
}

function applyConfig() {
  const loginLogoEls = document.querySelectorAll('.app-logo-login-img'); const loginDefaultEls = document.querySelectorAll('.app-logo-login-default');
  if (systemConfig.logo_login && systemConfig.logo_login.trim() !== '') { loginLogoEls.forEach(el => { el.src = systemConfig.logo_login; el.style.display = 'block'; }); loginDefaultEls.forEach(el => { el.style.display = 'none'; }); }
  else { loginLogoEls.forEach(el => { el.style.display = 'none'; el.src = ''; }); loginDefaultEls.forEach(el => { el.style.display = 'block'; }); }
  const sidebarLogoEls = document.querySelectorAll('.app-logo-sidebar-img'); const sidebarDefaultEls = document.querySelectorAll('.app-logo-sidebar-default');
  if (systemConfig.logo_sidebar && systemConfig.logo_sidebar.trim() !== '') { sidebarLogoEls.forEach(el => { el.src = systemConfig.logo_sidebar; el.style.display = 'block'; }); sidebarDefaultEls.forEach(el => { el.style.display = 'none'; }); }
  else { sidebarLogoEls.forEach(el => { el.style.display = 'none'; el.src = ''; }); sidebarDefaultEls.forEach(el => { el.style.display = 'block'; }); }

  const appName = systemConfig.app_name || 'PISGAH BISDAC';
  const appSubtitle = systemConfig.app_subtitle || 'Gereja Masehi Advent';
  document.querySelectorAll('.app-name-display').forEach(el => el.textContent = appName);
  document.querySelectorAll('.app-subtitle-display').forEach(el => el.textContent = appSubtitle);

  const inputName = document.getElementById('settingAppName');
  if (inputName) inputName.value = systemConfig.app_name || '';
  const inputSub = document.getElementById('settingAppSubtitle');
  if (inputSub) inputSub.value = systemConfig.app_subtitle || '';
  const inputServer = document.getElementById('customApiUrlInput');
  if (inputServer) inputServer.value = localStorage.getItem('BISDAC_api_url') || '';

  const inputTransferBank = document.getElementById('settingTransferBank');
  if (inputTransferBank) inputTransferBank.value = systemConfig.transfer_bank || '';
  const inputTransferRek = document.getElementById('settingTransferRek');
  if (inputTransferRek) inputTransferRek.value = systemConfig.transfer_rekening || '';
  const inputTransferNama = document.getElementById('settingTransferNama');
  if (inputTransferNama) inputTransferNama.value = systemConfig.transfer_nama || '';

  const inputKota = document.getElementById('kotaKuitansiInput');
  if (inputKota) inputKota.value = systemConfig.kota_kuitansi || 'Manado';
  const inputH1 = document.getElementById('headerKuitansi1Input');
  if (inputH1) inputH1.value = systemConfig.header_kuitansi_1 || 'Gereja Masehi Advent Hari Ketujuh';
  const inputH2 = document.getElementById('headerKuitansi2Input');
  if (inputH2) inputH2.value = systemConfig.header_kuitansi_2 || 'Daerah Sumatera Kawasan Tengah';
  const inputH3 = document.getElementById('headerKuitansi3Input');
  if (inputH3) inputH3.value = systemConfig.header_kuitansi_3 || ('Jemaat ' + (systemConfig.app_title || 'Sistem'));

  const inTP = document.getElementById('targetPembangunanInput');
  if (inTP) inTP.value = systemConfig.target_pembangunan ? fmt(systemConfig.target_pembangunan) : '';
  const inTK = document.getElementById('komitmenTargetInput');
  if (inTK) inTK.value = systemConfig.komitmen_target ? fmt(systemConfig.komitmen_target) : '';
  const inRK = document.getElementById('komitmenRealisasiInput');
  if (inRK) inRK.value = systemConfig.komitmen_realisasi ? fmt(systemConfig.komitmen_realisasi) : '';

  // Background & Teks Sambutan Halaman Login / Loading
  const loginPage = document.getElementById('loginPage');
  if (loginPage) {
    if (systemConfig.login_bg && systemConfig.login_bg.trim() !== '') {
      loginPage.style.backgroundImage = `url("${systemConfig.login_bg}")`;
    } else {
      loginPage.style.backgroundImage = `url('/church_finance_bg.png')`;
    }
  }
  const previewLoginBg = document.getElementById('preview-login-bg');
  if (previewLoginBg) {
    previewLoginBg.src = systemConfig.login_bg || '/church_finance_bg.png';
  }

  const heroTitle = document.getElementById('loginHeroTitle');
  if (heroTitle) {
    heroTitle.innerHTML = systemConfig.login_title
      ? systemConfig.login_title.replace(/\n/g, '<br>')
      : 'Pengelolaan Transparan,<br><span class="text-champagne-gold">Pelayanan Maksimal.</span>';
  }
  const inputLoginTitle = document.getElementById('settingLoginTitle');
  if (inputLoginTitle) inputLoginTitle.value = systemConfig.login_title || '';

  const heroSubtitle = document.getElementById('loginHeroSubtitle');
  if (heroSubtitle) {
    heroSubtitle.textContent = systemConfig.login_subtitle || 'Sistem informasi keuangan terintegrasi jemaat untuk pencatatan kas, pelaporan kuitansi digital, dan transparansi perbendaharaan yang akuntabel.';
  }
  const inputLoginSub = document.getElementById('settingLoginSubtitle');
  if (inputLoginSub) inputLoginSub.value = systemConfig.login_subtitle || '';

  const sigKeys = ['sig_bendahara', 'sig_bangun', 'sig_ketua', 'sig_pendeta', 'sig_stempel'];
  sigKeys.forEach(k => {
    const imgEl = document.getElementById('preview-' + k.replace('_', '-'));
    const txtEl = document.getElementById('text-' + k.replace('_', '-'));
    if (imgEl && txtEl) {
      if (systemConfig[k] && systemConfig[k].trim() !== '') {
        imgEl.src = systemConfig[k];
        imgEl.style.display = 'block';
        txtEl.style.display = 'none';
      } else {
        imgEl.src = '';
        imgEl.style.display = 'none';
        txtEl.style.display = 'block';
      }
    }
  });

  if (currentUser) applyRoleAccess();

  // Load signature text inputs
  if (document.getElementById('sigNameBendahara')) document.getElementById('sigNameBendahara').value = systemConfig.sig_name_bendahara || 'Herbert JS Sagala';
  if (document.getElementById('sigTitleBendahara')) document.getElementById('sigTitleBendahara').value = systemConfig.sig_title_bendahara || 'Bendahara Jemaat';
  if (document.getElementById('sigNameBangun')) document.getElementById('sigNameBangun').value = systemConfig.sig_name_bangun || 'Parulian Parhusip';
  if (document.getElementById('sigTitleBangun')) document.getElementById('sigTitleBangun').value = systemConfig.sig_title_bangun || 'Ketua Pembangunan';
  if (document.getElementById('sigNameKetua')) document.getElementById('sigNameKetua').value = systemConfig.sig_name_ketua || 'Yosep Santoso';
  if (document.getElementById('sigTitleKetua')) document.getElementById('sigTitleKetua').value = systemConfig.sig_title_ketua || 'Ketua Jemaat';
  if (document.getElementById('sigNamePendeta')) document.getElementById('sigNamePendeta').value = systemConfig.sig_name_pendeta || 'Pdt. Joseph Sitohang';
  if (document.getElementById('sigTitlePendeta')) document.getElementById('sigTitlePendeta').value = systemConfig.sig_title_pendeta || 'Gembala Jemaat';
}

async function saveAppTextFromInputs() {
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus.settings?.edit && !hasRole(currentUser, 'Admin')) {
    return notify('Anda tidak memiliki izin mengubah pengaturan web.', 'error');
  }
  const name = document.getElementById('settingAppName').value;
  const subtitle = document.getElementById('settingAppSubtitle').value;
  systemConfig['app_name'] = name;
  systemConfig['app_subtitle'] = subtitle;
  localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
  applyConfig();
  try {
    await apiPostWithFallback('saveConfig', { key: 'app_name', value: name });
    await apiPostWithFallback('saveConfig', { key: 'app_subtitle', value: subtitle });
    notify('Nama aplikasi berhasil disimpan', 'success');
  } catch (err) { }
}

// === ROLE MANAGEMENT ===
window.hasRole = hasRole;

let selectedRoleTab = 'Admin';
const allRoles = ['Admin', 'Ketua Jemaat', 'Pendeta', 'Bendahara', 'Diakon', 'Operator', 'Viewer', 'Daerah', 'Publik'];
const allMenus = [
  {
    id: 'dashboard',
    label: 'Dashboard Utama',
    desc: 'Layar ringkasan saldo, KPI kas, dan grafik keuangan',
    actions: [
      { key: 'view', label: 'View (Lihat Dashboard)' }
    ]
  },
  {
    id: 'pemasukan',
    label: 'Pemasukan Kas',
    desc: 'Formulir pencatatan kas masuk / persembahan / perpuluhan',
    actions: [
      { key: 'view', label: 'View (Buka Form)' },
      { key: 'edit', label: 'Input / Simpan Transaksi' }
    ]
  },
  {
    id: 'pengeluaran',
    label: 'Pengeluaran Kas',
    desc: 'Formulir pengajuan dan pencatatan kas keluar',
    actions: [
      { key: 'view', label: 'View (Buka Form)' },
      { key: 'edit', label: 'Input / Simpan Transaksi' }
    ]
  },
  {
    id: 'pindahbuku',
    label: 'Pindah Buku (Mutasi Kas)',
    desc: 'Mutasi saldo kas antar pos/bank dan penarikan',
    actions: [
      { key: 'view', label: 'View (Buka Menu)' },
      { key: 'edit', label: 'Input / Simpan Mutasi' },
      { key: 'del', label: 'Hapus Data Mutasi' }
    ]
  },
  {
    id: 'laporan',
    label: 'Laporan Keuangan',
    desc: 'Rekap keuangan, buletin sabat, persepuluhan & cetak PDF',
    actions: [
      { key: 'view', label: 'View (Lihat & Pratinjau Cetak)' }
    ]
  },
  {
    id: 'riwayat',
    label: 'Riwayat Transaksi (Histori)',
    desc: 'Tabel riwayat kas, filter pencarian, dan persetujuan',
    actions: [
      { key: 'view', label: 'View (Lihat Riwayat Transaksi)' },
      { key: 'edit', label: 'Ubah Data Transaksi' },
      { key: 'del', label: 'Hapus Data Transaksi' },
      { key: 'approve', label: 'Approve / Validasi Kas Keluar' }
    ]
  },
  {
    id: 'masterData',
    label: 'Master Data (Kategori, Dept, Unit)',
    desc: 'Kelola kategori masukan, bidang pelayanan, dan unit / sektor jemaat',
    actions: [
      { key: 'view', label: 'View (Lihat Master Data)' },
      { key: 'edit', label: 'Tambah / Ubah Data' },
      { key: 'del', label: 'Hapus Data' }
    ]
  },
  {
    id: 'users',
    label: 'Manajemen Pengguna (User)',
    desc: 'Kelola akun staf, hak role, dan pengikatan unit',
    actions: [
      { key: 'view', label: 'View (Lihat Daftar User)' },
      { key: 'edit', label: 'Tambah / Ubah User' },
      { key: 'del', label: 'Hapus User' }
    ]
  },
  {
    id: 'akun',
    label: 'Pengaturan Akun (Sandi)',
    desc: 'Profil staf dan perubahan kata sandi pribadi',
    actions: [
      { key: 'view', label: 'View (Buka Menu Akun)' },
      { key: 'edit', label: 'Ubah Kata Sandi Pribadi' }
    ]
  },
  {
    id: 'settings',
    label: 'Pengaturan Web',
    desc: 'Ubah nama aplikasi, subtitle, dan logo gereja',
    actions: [
      { key: 'view', label: 'View (Buka Pengaturan Web)' },
      { key: 'edit', label: 'Ubah & Simpan Pengaturan' }
    ]
  },
  {
    id: 'series',
    label: 'Pengaturan No. Series',
    desc: 'Atur nomor seri bukti kas masuk, keluar, dan mutasi',
    actions: [
      { key: 'view', label: 'View (Buka Pengaturan Series)' },
      { key: 'edit', label: 'Ubah & Simpan No. Series' }
    ]
  },
  {
    id: 'logs',
    label: 'Audit Log Sistem',
    desc: 'Jejak log aktivitas pengguna (Read-only demi integritas audit)',
    actions: [
      { key: 'view', label: 'View (Lihat Audit Log)' }
    ]
  },
  {
    id: 'inventaris',
    label: 'Manajemen Inventaris / Aset',
    desc: 'Tautan ke modul pencatatan inventaris dan aset gereja',
    actions: [
      { key: 'view', label: 'Akses Menu Inventaris' }
    ]
  }
];

function getDefaultRolePerms(role) {
  const defs = {
    Admin: { menus: { dashboard: { view: true, edit: true, del: true }, pemasukan: { view: true, edit: true, del: true }, pengeluaran: { view: true, edit: true, del: true }, pindahbuku: { view: true, edit: true, del: true }, laporan: { view: true, edit: true, del: true }, riwayat: { view: true, edit: true, del: true, approve: true }, masterData: { view: true, edit: true, del: true }, users: { view: true, edit: true, del: true }, akun: { view: true, edit: true, del: true }, settings: { view: true, edit: true, del: true }, series: { view: true, edit: true, del: true }, logs: { view: true, edit: true, del: true }, inventaris: { view: true, edit: true, del: true } }, isAnonymous: false },
    Bendahara: { menus: { dashboard: { view: true, edit: true, del: true }, pemasukan: { view: true, edit: true, del: true }, pengeluaran: { view: true, edit: true, del: true }, pindahbuku: { view: true, edit: true, del: true }, laporan: { view: true, edit: true, del: true }, riwayat: { view: true, edit: true, del: true, approve: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, series: { view: true, edit: true, del: true }, logs: { view: false, edit: false, del: false }, inventaris: { view: true, edit: true, del: true } }, isAnonymous: false },
    Diakon: { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false, approve: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: true, edit: false, del: false } }, isAnonymous: false },
    Operator: { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: true, edit: true, del: true }, pengeluaran: { view: true, edit: true, del: true }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: false, edit: false, del: false }, riwayat: { view: true, edit: true, del: true, approve: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: false, edit: false, del: false } }, isAnonymous: false },
    Viewer: { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false, approve: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: true, edit: false, del: false } }, isAnonymous: false },
    Daerah: { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false, approve: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: true, edit: false, del: false } }, isAnonymous: false },
    Publik: { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: false, edit: false, del: false }, riwayat: { view: true, edit: false, del: false, approve: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: false, edit: false, del: false }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: false, edit: false, del: false } }, isAnonymous: true },
    "Ketua Jemaat": { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false, approve: true }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: true, edit: false, del: false } }, isAnonymous: false },
    Pendeta: { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false, approve: true }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: true, edit: false, del: false } }, isAnonymous: false }
  };
  return defs[role] || { menus: {}, isAnonymous: false };
}

async function resetRolePerms() {
  const isConfirm = await showCustomConfirm('Reset Hak Akses', `Kembalikan hak akses untuk role ${selectedRoleTab} ke pengaturan default?`);
  if (!isConfirm) return;
  if (typeof systemConfig.rolePermissions === 'string') { try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { systemConfig.rolePermissions = {}; } }
  if (!systemConfig.rolePermissions) systemConfig.rolePermissions = {};

  systemConfig.rolePermissions[selectedRoleTab] = getDefaultRolePerms(selectedRoleTab);
  localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
  renderRoles();
  notify(`Hak akses ${selectedRoleTab} di-reset.`, 'success');
}

function renderRoles() {
  if (typeof systemConfig.rolePermissions === 'string') {
    try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { systemConfig.rolePermissions = null; }
  }
  if (!systemConfig.rolePermissions || typeof systemConfig.rolePermissions !== 'object' || Object.keys(systemConfig.rolePermissions).length === 0) {
    systemConfig.rolePermissions = {};
    allRoles.forEach(r => {
      systemConfig.rolePermissions[r] = getDefaultRolePerms(r);
    });
  }

  // Pastikan role baru ditambahkan jika sebelumnya tidak ada (legacy config)
  allRoles.forEach(r => {
    if (!systemConfig.rolePermissions[r]) {
      systemConfig.rolePermissions[r] = getDefaultRolePerms(r);
    }
  });

  document.getElementById('roleTabs').innerHTML = allRoles.map(r => `
        <button class="btn ${selectedRoleTab === r ? 'btn-primary' : 'btn-ghost'}" onclick="selectRoleTab('${r}')" style="border-radius:20px; white-space:nowrap; padding: 6px 16px;">
          ${r}
        </button>
      `).join('');

  const perms = systemConfig.rolePermissions[selectedRoleTab] || getDefaultRolePerms(selectedRoleTab);

  let html = '';
  if (selectedRoleTab !== 'Admin') {
    html += `<div style="display:flex; flex-direction:column; gap:8px;">
        <div style="background:var(--input-bg); border:1px solid var(--glass-border); border-radius:var(--radius-lg); padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:700; color:var(--text); margin-bottom:8px;">Opsi Khusus: Mode Anonim</div>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" id="roleAnonCheckbox" ${perms.isAnonymous ? 'checked' : ''} onchange="updateRoleAnon('${selectedRoleTab}', this.checked)">
                <span style="color:var(--text2); font-size:14px;">Sembunyikan kolom sensitif (Pihak/Pemberi dan Unit) di tabel Riwayat. Cocok untuk Publik.</span>
              </label>
            </div>
            <button class="btn btn-outline" style="border-color:var(--red); color:var(--red); font-size:12px; padding:6px 12px;" onclick="resetRolePerms()">Reset Default</button>
          </div>
        </div>
        </div>`;
  } else {
    html += `<div style="padding:16px; background:var(--badge-blue-bg); color:var(--text); border-radius:var(--radius-lg); margin-bottom: 8px;">Role Admin selalu memiliki akses penuh ke semua modul.</div>`;
  }

  html += `<div class="grid-2" style="gap:16px; margin-top:8px;">`;
  allMenus.forEach(menu => {
    let mPerm = perms.menus[menu.id] || { view: false, edit: false, del: false, approve: false };
    if (selectedRoleTab === 'Admin') { mPerm = { view: true, edit: true, del: true, approve: true }; }
    const disabled = selectedRoleTab === 'Admin' ? 'disabled' : '';
    const isViewChecked = !!mPerm.view;

    html += `
          <div style="background:var(--input-bg); border:1px solid var(--glass-border); border-radius:var(--radius); padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:4px;">
                <div style="font-weight:700; color:var(--text); font-size:14.5px;">${menu.label}</div>
                ${menu.actions.length === 1 ? '<span class="badge badge-gray" style="font-size:10px; padding:1px 6px;">Read-Only</span>' : ''}
              </div>
              <div style="font-size:12px; color:var(--text3); margin-bottom:12px; line-height:1.3;">${menu.desc || ''}</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px; border-top:1px solid var(--glass-border); padding-top:10px;">
              ${menu.actions.map(act => {
      const isChecked = !!mPerm[act.key];
      const isActionDisabled = disabled || (act.key !== 'view' && !isViewChecked);
      const isSpecial = act.key === 'approve';
      return `
                  <label style="display:flex; align-items:center; justify-content:space-between; cursor:${isActionDisabled ? 'default' : 'pointer'}; opacity:${isActionDisabled && selectedRoleTab !== 'Admin' ? '0.45' : '1'}; ${isSpecial ? 'margin-top:4px; padding-top:6px; border-top:1px dashed var(--glass-border);' : ''}">
                    <span style="color:${isSpecial ? 'var(--accent-green)' : 'var(--text2)'}; font-size:13.5px; ${isSpecial ? 'font-weight:600;' : ''}">${act.label}</span>
                    <input type="checkbox" ${isActionDisabled ? 'disabled' : ''} ${isChecked ? 'checked' : ''} onchange="updateRolePerm('${selectedRoleTab}', '${menu.id}', '${act.key}', this.checked)">
                  </label>
                `;
    }).join('')}
            </div>
          </div>
        `;
  });
  html += `</div>`;
  document.getElementById('roleContent').innerHTML = html;
}

function updateRoleAnon(role, checked) {
  if (typeof systemConfig.rolePermissions === 'string') { try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { } }
  if (!systemConfig.rolePermissions[role]) systemConfig.rolePermissions[role] = { menus: {}, isAnonymous: false };
  systemConfig.rolePermissions[role].isAnonymous = checked;
}

function selectRoleTab(role) {
  selectedRoleTab = role;
  renderRoles();
}

function updateRolePerm(role, menuId, permType, checked) {
  if (typeof systemConfig.rolePermissions === 'string') { try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { } }
  if (!systemConfig.rolePermissions || typeof systemConfig.rolePermissions !== 'object') return;
  if (!systemConfig.rolePermissions[role]) systemConfig.rolePermissions[role] = { menus: {}, isAnonymous: false };
  if (!systemConfig.rolePermissions[role].menus[menuId]) systemConfig.rolePermissions[role].menus[menuId] = { view: false, edit: false, del: false, approve: false };
  systemConfig.rolePermissions[role].menus[menuId][permType] = checked;

  if (checked && (permType === 'edit' || permType === 'del' || permType === 'approve')) {
    systemConfig.rolePermissions[role].menus[menuId].view = true;
  }
  if (!checked && permType === 'view') {
    systemConfig.rolePermissions[role].menus[menuId].edit = false;
    systemConfig.rolePermissions[role].menus[menuId].del = false;
    systemConfig.rolePermissions[role].menus[menuId].approve = false;
  }

  localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig)); // AUTO-SAVE to local storage immediately
  renderRoles();
}

async function saveRolePermissions() {
  localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
  if (currentUser) applyRoleAccess();
  const btn = document.getElementById('btnSaveRolePerms');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Menyimpan...'; }
  try {
    await apiPostWithFallback('saveConfig', { key: 'rolePermissions', value: JSON.stringify(systemConfig.rolePermissions) });
    notify('Hak Akses berhasil disimpan', 'success');
  } catch (err) {
    notify('Gagal menyimpan Hak Akses', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = 'Simpan Hak Akses'; }
  }
}

function handleLogoUpload(event, keyType) {
  const file = event.target.files[0]; if (!file) return; notify('Memproses...', 'info');
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = async function () {
      const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
      const MAX = 150; let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } else { if (h > MAX) { w *= MAX / h; h = MAX; } }
      canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/png', 0.8);
      systemConfig[keyType] = dataUrl; localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig)); applyConfig();
      try { const res = await apiPostWithFallback('saveConfig', { key: keyType, value: dataUrl }); if (res.success) notify(`Logo tersimpan!`, 'success'); else throw new Error(res.message); } catch (err) { notify('Gagal: ' + err.message, 'error'); }
    }
    img.src = e.target.result;
  }
  reader.readAsDataURL(file);
}

function handleLoginBgUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  notify('Memproses gambar background...', 'info');
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = async function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const MAX_W = 1920;
      let w = img.width, h = img.height;
      if (w > MAX_W) {
        h = Math.round((h * MAX_W) / w);
        w = MAX_W;
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      systemConfig.login_bg = dataUrl;
      localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
      applyConfig();

      try {
        const res = await apiPostWithFallback('saveConfig', { key: 'login_bg', value: dataUrl });
        if (res.success) notify('Background halaman login berhasil diperbarui!', 'success');
        else throw new Error(res.message);
      } catch (err) {
        notify('Gagal menyimpan background: ' + err.message, 'error');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function resetLoginBg() {
  const isConfirm = await showCustomConfirm('Reset Background', 'Kembalikan gambar background login ke default?');
  if (!isConfirm) return;
  systemConfig.login_bg = '';
  localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
  applyConfig();
  try {
    await apiPostWithFallback('saveConfig', { key: 'login_bg', value: '' });
    notify('Background direset ke default.', 'success');
  } catch (err) {
    notify('Gagal reset: ' + err.message, 'error');
  }
}

async function saveLoginHeroText() {
  const title = (document.getElementById('settingLoginTitle')?.value || '').trim();
  const subtitle = (document.getElementById('settingLoginSubtitle')?.value || '').trim();

  systemConfig.login_title = title;
  systemConfig.login_subtitle = subtitle;
  localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
  applyConfig();

  try {
    await Promise.all([
      apiPostWithFallback('saveConfig', { key: 'login_title', value: title }),
      apiPostWithFallback('saveConfig', { key: 'login_subtitle', value: subtitle })
    ]);
    notify('Teks sambutan halaman login berhasil disimpan!', 'success');
  } catch (err) {
    notify('Gagal menyimpan teks: ' + err.message, 'error');
  }
}

function handleSignatureUpload(inputEl, previewId, textId, keyType) {
  const file = inputEl.files[0]; if (!file) return; notify('Memproses Tanda Tangan...', 'info');
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = async function () {
      const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
      const MAX = 300; let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } else { if (h > MAX) { w *= MAX / h; h = MAX; } }
      canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/png', 0.8);

      document.getElementById(previewId).src = dataUrl;
      document.getElementById(previewId).style.display = 'block';
      document.getElementById(textId).style.display = 'none';

      systemConfig[keyType] = dataUrl; localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
      try {
        const res = await apiPostWithFallback('saveConfig', { key: keyType, value: dataUrl });
        if (res.success) notify(`Tanda Tangan tersimpan!`, 'success'); else throw new Error(res.message);
      } catch (err) { notify('Gagal: ' + err.message, 'error'); }
    }
    img.src = e.target.result;
  }
  reader.readAsDataURL(file);
}

async function handleReceiptPhoto(event, type) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  const MAX_CHARS = 480000;
  let targetArray = type === 'income' ? currentIncPhotos : (type === 'expense' ? currentExpPhotos : (type === 'mutasi' ? currentMutPhotos : currentEditPhotos));
  let targetGridId = type === 'income' ? 'incPhotoGrid' : (type === 'expense' ? 'expPhotoGrid' : (type === 'mutasi' ? 'mutPhotoGrid' : 'editPhotoGrid'));
  let targetUploadBoxId = type === 'income' ? 'incPhotoUploadBox' : (type === 'expense' ? 'expPhotoUploadBox' : (type === 'mutasi' ? 'mutPhotoUploadBox' : 'editPhotoUploadBox'));

  const maxAllowed = type === 'edit' ? 3 : 2;
  if (targetArray.length + files.length > maxAllowed) {
    notify('Maksimal ' + maxAllowed + ' lampiran tambahan!', 'error');
    event.target.value = '';
    return;
  }

  setStatus('loading', 'Memproses gambar resolusi tinggi...');

  for (const file of files) {
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = new Image();
          img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let quality = 0.82; let scale = 1.0; let result = ''; let iterations = 0;
            let baseWidth = img.width; let baseHeight = img.height; const MAX_START = 1600;
            if (baseWidth > baseHeight && baseWidth > MAX_START) { baseHeight *= MAX_START / baseWidth; baseWidth = MAX_START; }
            else if (baseHeight > MAX_START) { baseWidth *= MAX_START / baseHeight; baseHeight = MAX_START; }

            do {
              canvas.width = Math.max(1, Math.floor(baseWidth * scale));
              canvas.height = Math.max(1, Math.floor(baseHeight * scale));
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              result = canvas.toDataURL('image/webp', quality);
              if (!result.startsWith('data:image/webp')) {
                result = canvas.toDataURL('image/jpeg', quality);
              }
              if (result.length > MAX_CHARS) {
                quality -= 0.08;
                if (quality < 0.60) { quality = 0.80; scale *= 0.85; }
              }
              iterations++;
            } while (result.length > MAX_CHARS && iterations < 12);

            // Failsafe: if still too large, gently scale down
            while (result.length > MAX_CHARS && scale > 0.3) {
              scale *= 0.8;
              canvas.width = Math.max(1, Math.floor(baseWidth * scale));
              canvas.height = Math.max(1, Math.floor(baseHeight * scale));
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              result = canvas.toDataURL('image/jpeg', 0.75);
            }
            resolve(result);
          };
          img.onerror = () => reject(new Error('Format gambar tidak didukung atau rusak.'));
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Gagal membaca file.'));
        reader.readAsDataURL(file);
      });
      targetArray.push(dataUrl);
      renderPhotoPreview(targetArray, targetGridId, targetUploadBoxId, type);
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  updateAppStatus(); // Reset status dot
  event.target.value = '';
}

function removePhoto(index, type) {
  let targetArray = type === 'income' ? currentIncPhotos : (type === 'expense' ? currentExpPhotos : (type === 'mutasi' ? currentMutPhotos : currentEditPhotos));
  let targetGridId = type === 'income' ? 'incPhotoGrid' : (type === 'expense' ? 'expPhotoGrid' : 'editPhotoGrid');
  let targetUploadBoxId = type === 'income' ? 'incPhotoUploadBox' : (type === 'expense' ? 'expPhotoUploadBox' : 'editPhotoUploadBox');

  targetArray.splice(index, 1);
  renderPhotoPreview(targetArray, targetGridId, targetUploadBoxId, type);
}

function renderPhotoPreview(arr, gridId, boxId, type) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  Array.from(grid.querySelectorAll('.photo-preview-container')).forEach(el => el.remove());

  if (type !== 'edit') {
    const div = document.createElement('div');
    div.className = 'photo-upload-box photo-preview-container';
    div.style.position = 'relative';
    div.style.background = '#f0fdf4';
    div.style.borderColor = '#86efac';
    div.style.cursor = 'not-allowed';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    div.innerHTML = '<span class="icon-placeholder" data-icon="fileText" data-size="lucide-lg" style="color: #16a34a;"></span><span style="margin-top:8px; font-size:10px; font-weight:600; color:#15803d; text-align:center;">Foto 1:<br>Kuitansi (Auto)</span>';
    grid.insertBefore(div, document.getElementById(boxId));
  }

  arr.forEach((url, i) => {
    const div = document.createElement('div');
    div.className = 'photo-upload-box photo-preview-container';
    div.style.position = 'relative';
    const img = document.createElement('img');
    img.src = url;
    img.className = 'photo-preview';
    img.alt = 'Foto ' + (type === 'edit' ? i + 1 : i + 2);

    div.appendChild(img);

    if (!(type === 'edit' && i === 0)) {
      const btn = document.createElement('button');
      btn.className = 'remove-photo-btn';
      btn.innerHTML = '×';
      btn.setAttribute('onclick', `removePhoto(${i}, '${type}')`);
      div.appendChild(btn);
    } else {
      const lockBadge = document.createElement('div');
      lockBadge.innerHTML = '<span class="icon-placeholder" data-icon="lock" data-size="lucide-sm"></span> Auto';
      lockBadge.style = 'position:absolute; top:4px; left:4px; background:rgba(0,0,0,0.6); color:white; font-size:9px; padding:2px 4px; border-radius:4px; z-index:10; display:flex; align-items:center; gap:2px;';
      div.appendChild(lockBadge);
    }

    grid.insertBefore(div, document.getElementById(boxId));
  });

  const maxAllowed = type === 'edit' ? 3 : 2;
  const uploadBox = document.getElementById(boxId);
  if (uploadBox) uploadBox.style.display = arr.length >= maxAllowed ? 'none' : 'flex';

  grid.querySelectorAll('.icon-placeholder').forEach(el => {
    if (typeof getIcon === 'function') {
      el.outerHTML = getIcon(el.getAttribute('data-icon'), el.getAttribute('data-size'));
    }
  });
}

function resetPhotoUpload(type) {
  if (type === 'income') { currentIncPhotos = []; renderPhotoPreview([], 'incPhotoGrid', 'incPhotoUploadBox', 'income'); document.getElementById('incPhotoUpload').value = ''; }
  else if (type === 'expense') { currentExpPhotos = []; renderPhotoPreview([], 'expPhotoGrid', 'expPhotoUploadBox', 'expense'); document.getElementById('expPhotoUpload').value = ''; }
  else if (type === 'mutasi') { currentMutPhotos = []; renderPhotoPreview([], 'mutPhotoGrid', 'mutPhotoUploadBox', 'mutasi'); document.getElementById('mutPhotoUpload').value = ''; }
  else if (type === 'edit') { currentEditPhotos = []; renderPhotoPreview([], 'editPhotoGrid', 'editPhotoUploadBox', 'edit'); document.getElementById('editTransPhoto').value = ''; }
}

let modalPhotoList = [];
let currentPhotoIndex = 0;
let currentViewingContext = null;
let isPhotoZoomed = false;

function openPhotoModal(url, url2 = '', url3 = '') {
  modalPhotoList = [url, url2, url3].filter(u => u && u.trim() !== '');
  if (modalPhotoList.length === 0) return;
  currentPhotoIndex = 0;
  isPhotoZoomed = false;
  updatePhotoModalView();
  const modal = document.getElementById('receiptPhotoModal');
  if (modal) modal.style.display = 'flex';
}

function changePhoto(dir) {
  currentPhotoIndex += dir;
  if (currentPhotoIndex < 0) currentPhotoIndex = modalPhotoList.length - 1;
  if (currentPhotoIndex >= modalPhotoList.length) currentPhotoIndex = 0;
  isPhotoZoomed = false;
  updatePhotoModalView();
}

function togglePhotoZoom() {
  const imgEl = document.getElementById('photoModalImg');
  const zoomLabel = document.getElementById('photoZoomLabel');
  if (!imgEl) return;
  isPhotoZoomed = !isPhotoZoomed;
  if (isPhotoZoomed) {
    imgEl.style.transform = 'scale(2)';
    imgEl.style.cursor = 'zoom-out';
    imgEl.style.maxHeight = 'none';
    imgEl.style.maxWidth = 'none';
    if (zoomLabel) zoomLabel.textContent = 'Reset Zoom';
  } else {
    imgEl.style.transform = 'scale(1)';
    imgEl.style.cursor = 'zoom-in';
    imgEl.style.maxHeight = '75vh';
    imgEl.style.maxWidth = '100%';
    if (zoomLabel) zoomLabel.textContent = 'Zoom 2x';
  }
}

function openCurrentPhotoFull() {
  const imgEl = document.getElementById('photoModalImg');
  if (!imgEl || !imgEl.src) return;
  const src = imgEl.src;
  if (src.startsWith('data:')) {
    try {
      const arr = src.split(',');
      const mime = (arr[0].match(/:(.*?);/) || ['', 'image/png'])[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    } catch (e) {
      console.warn('Blob conversion failed, fallback to direct open', e);
    }
  }
  const win = window.open();
  if (win) {
    win.document.write(`<title>Foto Kuitansi</title><body style="margin:0;background:#111;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="${src}" style="max-width:100%;height:auto;" /></body>`);
  } else {
    window.open(src, '_blank');
  }
}

function downloadCurrentPhoto() {
  const imgEl = document.getElementById('photoModalImg');
  if (!imgEl || !imgEl.src) return;
  const src = imgEl.src;
  const recNo = (currentViewingContext && currentViewingContext.record && (currentViewingContext.record.receipt_no || currentViewingContext.record.transaction_id)) || 'kuitansi';
  const a = document.createElement('a');
  a.href = src;
  a.download = `kuitansi-${recNo}-${currentPhotoIndex + 1}.webp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function regenerateReceiptInModal() {
  if (!currentViewingContext || !currentViewingContext.record) {
    notify('Konteks transaksi tidak ditemukan.', 'error');
    return;
  }
  const r = currentViewingContext.record;
  const type = currentViewingContext.type;
  showGlobalLoading('Membuat ulang kuitansi HD berwarna...');
  try {
    let actualTypeForHtml = type;
    const isMutasi = (r.department === 'Mutasi Kas / Setor Bank' || r.income_type === 'Mutasi Kas / Setor Bank');
    if (isMutasi) actualTypeForHtml = 'mutasi';

    const htmlStr = generateReceiptHTML(actualTypeForHtml, r);
    const genBase64 = await generateReceiptImageBase64(htmlStr, false);

    if (currentUser && (hasRole(currentUser, 'Admin') || hasRole(currentUser, 'Bendahara'))) {
      const editPayload = { ...r, type: type, receipt_photo_base64: genBase64 };
      r.receipt_photo = genBase64;
      apiPost('editRecord', editPayload).catch(e => console.error('Silent photo update failed', e));
    }

    modalPhotoList = [genBase64];
    currentPhotoIndex = 0;
    isPhotoZoomed = false;
    updatePhotoModalView();
    notify('Kuitansi berhasil diperbarui menjadi HD!', 'success');
  } catch (err) {
    console.error('Failed regenerating receipt', err);
    notify('Gagal membuat ulang kuitansi: ' + err.message, 'error');
  } finally {
    hideGlobalLoading();
  }
}

function updatePhotoModalView() {
  const imgEl = document.getElementById('photoModalImg');
  const prevEl = document.getElementById('prevPhotoBtn');
  const nextEl = document.getElementById('nextPhotoBtn');
  const cntEl = document.getElementById('photoCounter');
  const badgeEl = document.getElementById('photoQualityBadge');
  const btnRegen = document.getElementById('btnRegenerateHD');
  const zoomLabel = document.getElementById('photoZoomLabel');

  if (imgEl) {
    imgEl.style.transform = 'scale(1)';
    imgEl.style.cursor = 'zoom-in';
    imgEl.style.maxHeight = '75vh';
    imgEl.style.maxWidth = '100%';
  }
  if (zoomLabel) zoomLabel.textContent = 'Zoom 2x';
  isPhotoZoomed = false;

  const currentSrc = modalPhotoList[currentPhotoIndex] || '';
  if (imgEl) {
    imgEl.onload = function () {
      if (badgeEl) {
        const w = imgEl.naturalWidth;
        const h = imgEl.naturalHeight;
        if (w >= 1000 || h >= 1000) {
          badgeEl.textContent = `${w}×${h} HD`;
          badgeEl.style.background = 'rgba(16,185,129,0.15)';
          badgeEl.style.color = '#10b981';
          badgeEl.style.borderColor = 'rgba(16,185,129,0.3)';
        } else if (w > 0) {
          badgeEl.textContent = `${w}×${h} (Kompresi Lama)`;
          badgeEl.style.background = 'rgba(245,158,11,0.15)';
          badgeEl.style.color = '#f59e0b';
          badgeEl.style.borderColor = 'rgba(245,158,11,0.3)';
        }
      }
    };
    imgEl.src = currentSrc;
  }

  if (prevEl) prevEl.style.display = modalPhotoList.length > 1 ? 'flex' : 'none';
  if (nextEl) nextEl.style.display = modalPhotoList.length > 1 ? 'flex' : 'none';
  if (cntEl) cntEl.textContent = modalPhotoList.length > 1 ? `Foto ${currentPhotoIndex + 1} dari ${modalPhotoList.length}` : '';

  if (btnRegen) {
    if (currentViewingContext && currentViewingContext.record) {
      btnRegen.style.display = 'inline-flex';
    } else {
      btnRegen.style.display = 'none';
    }
  }
}

function closePhotoModal() {
  const modal = document.getElementById('receiptPhotoModal');
  if (modal) modal.style.display = 'none';
  const imgEl = document.getElementById('photoModalImg');
  if (imgEl) {
    imgEl.src = '';
    imgEl.style.transform = 'scale(1)';
  }
  isPhotoZoomed = false;
  currentViewingContext = null;
}

async function openPhotoModalById(id, type) {
  let r = null;
  if (type === 'income') {
    r = cachedIncome.find(x => (x.transaction_id || x.receipt_no) === id);
    if (!r && currentReportData && currentReportData.incByCategory) {
      const all = Object.values(currentReportData.incByCategory).flat();
      r = all.find(x => (x.transaction_id || x.receipt_no) === id);
    }
  } else {
    r = cachedExpense.find(x => (x.transaction_id || x.receipt_no) === id);
    if (!r && currentReportData && currentReportData.expByDept) {
      const all = Object.values(currentReportData.expByDept).flat();
      r = all.find(x => (x.transaction_id || x.receipt_no) === id);
    }
  }

  if (!r) {
    const allTrans = [...cachedIncome, ...cachedExpense];
    r = allTrans.find(x => (x.transaction_id || x.receipt_no) === id);
    if (r && r.income_type) type = 'income';
    else if (r) type = 'expense';
  }

  if (r) {
    currentViewingContext = { record: r, type: type };

    const generateAndShowAutoReceipt = () => {
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) overlay.style.display = 'flex';
      setTimeout(async () => {
        try {
          let actualTypeForHtml = type;
          const isMutasi = (r.department === 'Mutasi Kas / Setor Bank' || r.income_type === 'Mutasi Kas / Setor Bank');
          if (isMutasi) {
            actualTypeForHtml = 'mutasi';
            if (type === 'income') {
              const expSide = cachedExpense.find(x => (x.transaction_id || x.receipt_no) === (r.transaction_id || r.receipt_no));
              if (expSide) {
                r = expSide;
                type = 'expense';
                currentViewingContext = { record: r, type: type };
              }
            }
          }

          const htmlStr = generateReceiptHTML(actualTypeForHtml, r);
          const genBase64 = await generateReceiptImageBase64(htmlStr, false);

          if (currentUser && (hasRole(currentUser, 'Admin') || hasRole(currentUser, 'Bendahara'))) {
            const editPayload = { ...r, type: type, receipt_photo_base64: genBase64 };
            r.receipt_photo = genBase64; // Update local cache to prevent regenerating on next click
            apiPost('editRecord', editPayload).catch(e => console.error('Silent photo update failed', e));
          }
          openPhotoModal(genBase64, '', '');
        } catch (err) {
          console.error('Failed generating receipt on the fly', err);
          notify('Gagal membuat kuitansi otomatis.', 'error');
        } finally {
          if (overlay) overlay.style.display = 'none';
        }
      }, 10);
    };

    const isMissingPhoto = !r.receipt_photo && !r.receipt_photo_2 && !r.receipt_photo_3;
    if (!isMissingPhoto) {
      showGlobalLoading('Mengambil foto dari server...');
      try {
        const res = await apiGet('getTransactionPhotos', { id: (r.transaction_id || r.receipt_no), type: type });
        if (res && res.success && res.data) {
          const p1 = res.data.photo1 || '';
          const p2 = res.data.photo2 || '';
          const p3 = res.data.photo3 || '';

          // Cek apakah data terpotong akibat ekspor excel (32767 karakter) atau rusak
          if ((p1 && p1.length === 32767) || (p1 && !p1.startsWith('data:image/'))) {
            hideGlobalLoading();
            notify('Foto asli rusak. Membuat kuitansi otomatis...', 'info');
            generateAndShowAutoReceipt();
            return;
          }

          if (!p1 && !p2 && !p3) {
            hideGlobalLoading();
            generateAndShowAutoReceipt();
          } else {
            // Cek apakah p1 adalah kuitansi otomatis dari sistem lama yang buram/grayscale
            const isAutoReceipt = p1 && p1.includes('name=auto-receipt');
            if (isAutoReceipt && !p2 && !p3) {
              hideGlobalLoading();
              // Otomatis buat ulang kuitansi HD berwarna tajam
              generateAndShowAutoReceipt();
              return;
            }
            openPhotoModal(p1, p2, p3);
          }
        } else {
          hideGlobalLoading();
          generateAndShowAutoReceipt();
        }
      } catch (e) {
        hideGlobalLoading();
        generateAndShowAutoReceipt();
      } finally {
        hideGlobalLoading();
      }
    } else {
      generateAndShowAutoReceipt();
    }
  } else {
    notify('Data foto tidak ditemukan.', 'error');
  }
}

function getPhotoBtnIcon(r, isMasked = false) {
  if (isMasked) return '';
  let k = r.income_type ? 'income' : 'expense';
  let id = r.transaction_id || r.receipt_no;
  let count = (r.receipt_photo ? 1 : 0) + (r.receipt_photo_2 ? 1 : 0) + (r.receipt_photo_3 ? 1 : 0);
  if (count === 0) count = 1; // Auto-generated receipt is always available
  let content = count > 1 ? `<span style="font-size:10px; margin-left:2px; font-weight:bold">${count}</span>` : '';
  return `<button class="btn-icon-only" onclick="openPhotoModalById('${id}', '${k}')" style="margin-left:6px; color:var(--teal-pop);">${safeIcon('image', 'lucide-sm')}${content}</button>`;
}

function getPhotoBtnText(r, isMasked = false) {
  if (isMasked) return '';
  let k = r.income_type ? 'income' : 'expense';
  let id = r.transaction_id || r.receipt_no;
  let count = (r.receipt_photo ? 1 : 0) + (r.receipt_photo_2 ? 1 : 0) + (r.receipt_photo_3 ? 1 : 0);
  if (count === 0) count = 1; // Auto-generated receipt is always available
  let text = count > 1 ? `${safeIcon('image', 'lucide-sm')} <span style="margin-left:4px;">${count} Foto</span>` : `${safeIcon('image', 'lucide-sm')} <span style="margin-left:4px;">1 Foto</span>`;
  return `<button class="btn" style="flex:1; width:100%; justify-content:center; padding:6px 0; font-size:11px; background:rgba(20,184,166,0.1); color:var(--teal-pop); border:1px solid rgba(20,184,166,0.2);" onclick="openPhotoModalById('${id}', '${k}')">${text}</button>`;
}


async function saveSignatureText(key, value) {
  systemConfig[key] = value;
  localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
  try {
    await apiPostWithFallback('saveConfig', { key: key, value: value });
  } catch (err) { }
}

async function resetLogo(keyType) { systemConfig[keyType] = ''; localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig)); applyConfig(); try { await apiPostWithFallback('saveConfig', { key: keyType, value: '' }); notify(`Logo direset.`, 'success'); } catch (err) { } }

let currentUser = null; let masterData = null; let isServerOnline = false;
let cachedIncome = []; let cachedExpense = []; let cachedSaldo = { daerah: 0, jemaat: 0, bangun: 0, total: 0 };
try {
  if (localStorage.getItem('BISDAC_inc')) cachedIncome = JSON.parse(localStorage.getItem('BISDAC_inc'));
  if (localStorage.getItem('BISDAC_exp')) cachedExpense = JSON.parse(localStorage.getItem('BISDAC_exp'));
  if (localStorage.getItem('BISDAC_bal')) cachedSaldo = JSON.parse(localStorage.getItem('BISDAC_bal'));
} catch (e) { }
let pembangunanDataCache = null;


Object.defineProperty(window, 'currentReportData', { get: () => currentReportData, set: (v) => { currentReportData = v; }, configurable: true });
Object.defineProperty(window, 'currentUser', { get: () => currentUser, set: (v) => { currentUser = v; }, configurable: true });
Object.defineProperty(window, 'masterData', { get: () => masterData, set: (v) => { masterData = v; }, configurable: true });
Object.defineProperty(window, 'cachedIncome', { get: () => cachedIncome, set: (v) => { cachedIncome = v; }, configurable: true });
Object.defineProperty(window, 'cachedExpense', { get: () => cachedExpense, set: (v) => { cachedExpense = v; }, configurable: true });
Object.defineProperty(window, 'cachedSaldo', { get: () => cachedSaldo, set: (v) => { cachedSaldo = v; }, configurable: true });
Object.defineProperty(window, 'systemConfig', { get: () => systemConfig, set: (v) => { systemConfig = v; }, configurable: true });


async function loadPembangunanData() {
  try {
    const res = await fetch(PEMBANGUNAN_URL + "?t=" + Date.now());
    const text = await res.text();
    if (text.startsWith('<')) return; // Silently ignore HTML responses
    pembangunanDataCache = JSON.parse(text);
  } catch (e) { throw e; }
}
let editingUser = null; let editingUnit = null; let editingUnitId = null; let editingIncType = null;

function getCatBadge(catName, isExpense) { if (!catName) return 'badge-gray'; let seedString = catName + (isExpense ? "_OUT" : "_IN"); let hash1 = 0, hash2 = 0; for (let i = 0; i < seedString.length; i++) { hash1 = (hash1 << 5) - hash1 + seedString.charCodeAt(i); hash2 = seedString.charCodeAt(i) + ((hash2 << 5) - hash2); } let finalHue = Math.abs(hash1) % 360; let finalSat = 65 + (Math.abs(hash2) % 30); let lShift = (Math.abs(hash1 ^ hash2) % 24) - 12; return `badge-dynamic" style="--bh: ${finalHue}; --bs: ${finalSat}%; --bl-off: ${lShift}%;`; }
function isPrivateCategory(category) { if (!category) return false; const cat = category.toLowerCase(); return ['perpuluhan', 'persepuluhan', 'khusus jemaat', 'khusus daerah', 'terpadu', 'pembangunan'].some(c => cat.includes(c)); }
function validatePassword(pw) {
  if (pw.length < 8) return 'Minimal 8 karakter';
  if (!/[A-Z]/.test(pw)) return 'Harus ada huruf besar (A-Z)';
  if (!/[a-z]/.test(pw)) return 'Harus ada huruf kecil (a-z)';
  if (!/[0-9]/.test(pw)) return 'Harus ada angka (0-9)';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pw)) return 'Harus ada simbol (!@#$%^&*...)';
  return null;
}
function safeIcon(name, size) { return typeof getIcon === 'function' ? getIcon(name, size) : ''; }
function togglePassword(inputId, eyeId) { const input = document.getElementById(inputId); const eyeBtn = typeof eyeId === 'string' ? document.getElementById(eyeId) : eyeId; if (!input || !eyeBtn) return; if (input.type === "password") { input.type = "text"; eyeBtn.innerHTML = safeIcon('eye', 'lucide-md'); } else { input.type = "password"; eyeBtn.innerHTML = safeIcon('eyeOff', 'lucide-md'); } }
function fmt(n) { return Math.round(n || 0).toLocaleString('id-ID'); }
function fmtInputDate(iso) { if (!iso) return ''; const d = new Date(iso); if (isNaN(d.getTime())) return String(iso).split('T')[0]; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function fmtDate(iso) { if (!iso) return '-'; const d = new Date(iso); if (isNaN(d.getTime())) { const p = String(iso).split('T')[0].split('-'); if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`; return String(iso).split('T')[0]; } return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; }
function todayStr() { return fmtInputDate(new Date()); }
function setStatus(state, text) {
  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  if (dot && txt) {
    dot.className = 'status-dot ' + (state === 'warning' ? 'offline' : state);
    txt.textContent = text;
  }
  const topDot = document.getElementById('topbarDbStatusDot');
  const topTxt = document.getElementById('topbarDbStatusText');
  const topBadge = document.getElementById('topbarDbStatusBadge');
  if (topDot && topTxt && topBadge) {
    topTxt.textContent = text;
    if (state === 'online') {
      topBadge.style.background = 'rgba(16,185,129,0.1)';
      topBadge.style.color = '#059669';
      topBadge.style.borderColor = 'rgba(16,185,129,0.2)';
      topDot.style.background = '#10b981';
      topDot.style.boxShadow = '0 0 8px rgba(16,185,129,0.6)';
    } else if (state === 'warning') {
      topBadge.style.background = 'rgba(245,158,11,0.1)';
      topBadge.style.color = '#d97706';
      topBadge.style.borderColor = 'rgba(245,158,11,0.2)';
      topDot.style.background = '#f59e0b';
      topDot.style.boxShadow = '0 0 8px rgba(245,158,11,0.6)';
    } else if (state === 'offline') {
      topBadge.style.background = 'rgba(239,68,68,0.1)';
      topBadge.style.color = '#dc2626';
      topBadge.style.borderColor = 'rgba(239,68,68,0.2)';
      topDot.style.background = '#ef4444';
      topDot.style.boxShadow = 'none';
    } else {
      topBadge.style.background = 'rgba(100,116,139,0.1)';
      topBadge.style.color = '#64748b';
      topBadge.style.borderColor = 'rgba(100,116,139,0.2)';
      topDot.style.background = '#94a3b8';
      topDot.style.boxShadow = 'none';
    }
  }
}

let confirmPromiseResolve = null;
function showCustomConfirm(title, message) { return new Promise((resolve) => { confirmPromiseResolve = resolve; document.getElementById('confirmTitle').textContent = title; document.getElementById('confirmMessage').textContent = message; document.getElementById('customConfirmModal').style.display = 'flex'; }); }
document.getElementById('confirmYesBtn').addEventListener('click', () => { document.getElementById('customConfirmModal').style.display = 'none'; if (confirmPromiseResolve) confirmPromiseResolve(true); });
document.getElementById('confirmNoBtn').addEventListener('click', () => { document.getElementById('customConfirmModal').style.display = 'none'; if (confirmPromiseResolve) confirmPromiseResolve(false); });

async function saveServerSettings() {
  const newUrl = document.getElementById('customApiUrlInput').value.trim();
  if (newUrl === '') { localStorage.removeItem('BISDAC_api_url'); notify('Menggunakan URL bawaan.', 'success'); }
  else if (!newUrl.startsWith('https://script.google.com/macros/s/')) { notify('URL tidak valid.', 'error'); return; }
  else { localStorage.setItem('BISDAC_api_url', newUrl.endsWith('/') ? newUrl.slice(0, -1) : newUrl); notify('URL diperbarui!', 'success'); }
  await checkAPIConnection(); updateAppStatus();
}

function promptApiUrl() {
  const current = getActiveApiUrl();
  const input = prompt("Masukkan URL Apps Script (Kosongkan untuk kembali ke default):", current);
  if (input !== null) {
    const newUrl = input.trim();
    if (newUrl === '') {
      localStorage.removeItem('BISDAC_api_url');
      alert('URL dikembalikan ke bawaan sistem.');
      window.location.reload();
    } else if (!newUrl.startsWith('https://script.google.com/macros/s/')) {
      alert('URL tidak valid. Harus diawali dengan https://script.google.com/macros/s/');
    } else {
      localStorage.setItem('BISDAC_api_url', newUrl.endsWith('/') ? newUrl.slice(0, -1) : newUrl);
      alert('URL berhasil disimpan!');
      window.location.reload();
    }
  }
}
window.promptApiUrl = promptApiUrl;

async function checkAPIConnection() {
  setStatus('loading', 'Menghubungkan...');
  try {
    const isSbHealthy = await checkLaporanSupabaseHealth();
    if (isSbHealthy) {
      setStatus('online', 'Supabase Aktif');
      isServerOnline = true;
      return true;
    }
  } catch (e) {
    console.warn('Supabase check failed, checking GAS:', e);
  }

  // Check GAS fallback
  try {
    const baseUrl = getActiveApiUrl();
    if (!baseUrl || baseUrl.trim() === '') {
      setStatus('offline', 'URL Belum Diset!');
      isServerOnline = false;
      return false;
    }
    const url = `${baseUrl}?action=ping`;
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    }).catch(() => { throw new Error('Jaringan Error'); });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { throw new Error('URL API Tidak Valid (404)'); }
    if (json.success) {
      setStatus('warning', 'Google Sheets Cadangan');
      isServerOnline = true;
      return true;
    }
    throw new Error(json.message);
  } catch (e) {
    setStatus('offline', e.message || 'Koneksi Gagal');
    isServerOnline = false;
    return false;
  }
}

window.migrateLaporanToSupabase = async function () {
  const yes = await showCustomConfirm(
    'Konfirmasi Migrasi 1-Klik',
    'Mulai menyalin seluruh data historis dari Google Sheets ke database Supabase?\n\nSemua data di Google Sheets akan tetap tersimpan aman sebagai cadangan ganda.'
  );
  if (!yes) return;

  const btn = document.getElementById('btnMigrateLaporan');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> Memigrasikan...';
  }

  showGlobalLoading('Memulai migrasi data ke Supabase...');

  try {
    const res = await migrateLaporanGASToSupabase(getActiveApiUrl(), (progressText) => {
      showGlobalLoading(progressText);
    });

    if (res.success) {
      notify(res.message, 'success');
      await checkAPIConnection();
      if (typeof syncData === 'function') await syncData(true);
    } else {
      notify(`Migrasi gagal: ${res.message}`, 'error');
    }
  } catch (err) {
    notify(`Terjadi kesalahan saat migrasi: ${err.message}`, 'error');
  } finally {
    hideGlobalLoading();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
};

window.backupSupabaseToGoogleSheets = async function () {
  const yes = await showCustomConfirm(
    'Konfirmasi Pencadangan Supabase ke Sheets',
    'Mulai menyalin seluruh data transaksi (Pemasukan, Pengeluaran), Master Data, dan Saldo Awal dari database Supabase ke Google Sheets sebagai cadangan lengkap?'
  );
  if (!yes) return;

  const btn = document.getElementById('btnBackupToGas');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> Mencadangkan...';
  }

  showGlobalLoading('Memulai pencadangan data ke Google Sheets...');

  try {
    const res = await backupSupabaseToGAS(getActiveApiUrl(), (progressText) => {
      showGlobalLoading(progressText);
    });

    if (res.success) {
      notify(res.message, 'success');
    } else {
      notify(`Pencadangan gagal: ${res.message}`, 'error');
    }
  } catch (err) {
    notify(`Terjadi kesalahan: ${err.message}`, 'error');
  } finally {
    hideGlobalLoading();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
};

async function doLogin(autoUser, autoPass) {
  const user = (typeof autoUser === 'string') ? autoUser : document.getElementById('loginUser').value.trim();
  const pass = (typeof autoPass === 'string') ? autoPass : document.getElementById('loginPass').value;
  if (!user || !pass) { notify('Username & Password kosong!', 'error'); return; }
  const btn = document.getElementById('loginBtn'); const txt = document.getElementById('loginBtnText');
  btn.disabled = true; txt.innerHTML = '<span class="btn-spinner"></span> Validasi...';
  try {
    const res = await login(user, pass);
    if (res.success) { currentUser = res.user; notify('Login Berhasil.', 'success'); launchApp(); }
    else { notify(res.message, 'error'); }
  } catch (err) { notify(err.message, 'error'); } finally { btn.disabled = false; txt.textContent = 'Masuk Ke Sistem'; }
}

async function launchApp() {
  document.getElementById('loginPage').style.display = 'none'; document.getElementById('app').style.display = 'flex';
  const syncBtn = document.getElementById('floatingSyncBtn');
  if (syncBtn) {
    syncBtn.classList.remove('bottom-8', 'hidden');
    syncBtn.classList.add('bottom-28');
    syncBtn.style.display = 'flex';
    syncBtn.style.setProperty('display', 'flex', 'important');
  }
  const nameStr = currentUser.nama || currentUser.username || 'User';
  document.getElementById('userNameDisplay').textContent = nameStr;
  document.getElementById('userRoleDisplay').textContent = currentUser.role || 'Unknown';
  document.getElementById('userAvatar').textContent = nameStr.split(' ').filter(x => x).map(x => x[0]).join('').substring(0, 2).toUpperCase();

  applyRoleAccess();
  // Do not block UI! Run in background:
  Promise.all([loadSystemConfig(), syncAllData()]).then(() => {
    initForms();

    const urlParams = new URLSearchParams(window.location.search);
    const printId = urlParams.get('print');
    const printType = urlParams.get('type') || 'income';
    const searchQuery = urlParams.get('search');

    if (printId) {
      // Aktifkan sensor privasi (strict mode) jika ada parameter print
      const sensorCheckbox = document.getElementById('sensorUnit');
      if (sensorCheckbox) {
        sensorCheckbox.checked = true;
        applyReportSensor();
      }
      printTransaction(printType, printId);
    } else if (searchQuery) {
      // Isi input Cek Transaksi dan jalankan pencarian otomatis
      const searchInput = document.getElementById('searchReceiptInput');
      if (searchInput) {
        searchInput.value = searchQuery;
        searchByReceipt();
        // Scroll ke area pencarian
        const dashSearchCard = document.getElementById('dashSearchCard');
        if (dashSearchCard) dashSearchCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      const currentPage = document.querySelector('.page.active')?.id.replace('page-', '') || 'dashboard';
      if (currentPage === 'dashboard') renderDashboard();
    }
  }).catch(e => console.error(e));

  initForms(); // Run once immediately with cached data
  showPage('dashboard');
}

function getRolePerms(roleStr) {
  if (!roleStr) return { menus: {}, isAnonymous: false };
  const roles = roleStr.split(',').map(r => r.trim());
  let mergedPerms = { menus: {}, isAnonymous: false };
  let allAnonymous = true;

  roles.forEach(role => {
    let perms = null;
    if (systemConfig.rolePermissions && systemConfig.rolePermissions[role]) {
      perms = systemConfig.rolePermissions[role];
    } else if (role === 'Admin') {
      perms = { menus: { dashboard: { view: true, edit: true, del: true }, pemasukan: { view: true, edit: true, del: true }, pengeluaran: { view: true, edit: true, del: true }, pindahbuku: { view: true, edit: true, del: true }, laporan: { view: true, edit: true, del: true }, riwayat: { view: true, edit: true, del: true }, masterData: { view: true, edit: true, del: true }, users: { view: true, edit: true, del: true }, akun: { view: true, edit: true, del: true }, settings: { view: true, edit: true, del: true }, series: { view: true, edit: true, del: true }, logs: { view: true, edit: true, del: true }, inventaris: { view: true, edit: true, del: true } }, isAnonymous: false };
    } else if (role === 'Bendahara') {
      perms = { menus: { dashboard: { view: true, edit: true, del: true }, pemasukan: { view: true, edit: true, del: true }, pengeluaran: { view: true, edit: true, del: true }, pindahbuku: { view: true, edit: true, del: true }, laporan: { view: true, edit: true, del: true }, riwayat: { view: true, edit: true, del: true }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, series: { view: true, edit: true, del: true }, logs: { view: false, edit: false, del: false }, inventaris: { view: true, edit: true, del: true } }, isAnonymous: false };
    } else if (role === 'Viewer') {
      perms = { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: true, edit: false, del: false } }, isAnonymous: false };
    } else if (role === 'Daerah') {
      perms = { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: true, edit: false, del: false } }, isAnonymous: false };
    } else if (role === 'Diakon') {
      perms = { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: true, edit: false, del: false } }, isAnonymous: false };
    } else if (role === 'Operator') {
      perms = { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: true, edit: true, del: true }, pengeluaran: { view: true, edit: true, del: true }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: false, edit: false, del: false }, riwayat: { view: true, edit: true, del: true }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: false, edit: false, del: false } }, isAnonymous: false };
    } else if (role === 'Ketua Jemaat' || role === 'Pendeta') {
      perms = { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: true, edit: false, del: false } }, isAnonymous: false };
    } else if (role === 'Publik') {
      perms = { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: false, edit: false, del: false }, riwayat: { view: true, edit: false, del: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: false, edit: false, del: false }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false }, inventaris: { view: false, edit: false, del: false } }, isAnonymous: true };
    } else {
      perms = { menus: {}, isAnonymous: false };
    }

    if (role === 'Admin' || role === 'Bendahara') {
      if (!perms.menus.pindahbuku) perms.menus.pindahbuku = { view: true, edit: true, del: true };
      if (!perms.menus.series) perms.menus.series = { view: true, edit: true, del: true };
    }

    allMenus.forEach(menu => {
      if (!mergedPerms.menus[menu.id]) mergedPerms.menus[menu.id] = { view: false, edit: false, del: false, approve: false };
      const rp = perms.menus[menu.id] || { view: false, edit: false, del: false, approve: false };
      if (role === 'Admin') {
        mergedPerms.menus[menu.id] = { view: true, edit: true, del: true, approve: true };
      } else {
        if (rp.view) mergedPerms.menus[menu.id].view = true;
        if (rp.edit) mergedPerms.menus[menu.id].edit = true;
        if (rp.del) mergedPerms.menus[menu.id].del = true;
        if (rp.approve) mergedPerms.menus[menu.id].approve = true;
      }
    });

    if (role === 'Publik') perms.isAnonymous = true;
    if (!perms.isAnonymous) {
      allAnonymous = false;
    }
  });

  mergedPerms.isAnonymous = allAnonymous;
  return mergedPerms;
}

function applyRoleAccess() {
  if (!currentUser) return;
  const perms = getRolePerms(currentUser?.role || '');

  const mPemasukan = perms.menus.pemasukan || { view: false, edit: false, del: false };
  document.getElementById('navPemasukan').style.display = mPemasukan.view ? '' : 'none';
  if (document.getElementById('botPemasukan')) document.getElementById('botPemasukan').style.display = mPemasukan.view ? 'flex' : 'none';

  const mPengeluaran = perms.menus.pengeluaran || { view: false, edit: false, del: false };
  document.getElementById('navPengeluaran').style.display = mPengeluaran.view ? '' : 'none';
  if (document.getElementById('botPengeluaran')) document.getElementById('botPengeluaran').style.display = mPengeluaran.view ? 'flex' : 'none';

  const mPindahBuku = perms.menus.pindahbuku || { view: false, edit: false, del: false };
  if (document.getElementById('navPindahBuku')) document.getElementById('navPindahBuku').style.display = mPindahBuku.view ? '' : 'none';

  const mLaporan = perms.menus.laporan || { view: false, edit: false, del: false };
  if (document.getElementById('navLaporan')) document.getElementById('navLaporan').style.display = mLaporan.view ? '' : 'none';
  if (document.getElementById('botLaporan')) document.getElementById('botLaporan').style.display = mLaporan.view ? 'flex' : 'none';
  if (document.getElementById('navBuletinSabat')) document.getElementById('navBuletinSabat').style.display = (mLaporan.view || hasRole(currentUser, 'Publik')) ? '' : 'none';

  const mRiwayat = perms.menus.riwayat || { view: false, edit: false, del: false };
  document.getElementById('navRiwayat').style.display = mRiwayat.view ? '' : 'none';

  const btnJurnal = document.getElementById('btnJurnalDashboard'); if (btnJurnal) btnJurnal.style.display = (mPemasukan.edit || mPengeluaran.edit) ? '' : 'none';
  const recentTransCard = document.getElementById('recentTransCard'); if (recentTransCard) recentTransCard.style.display = mRiwayat.view ? '' : 'none';
  const btnPrint = document.getElementById('btnPrintReport'); if (btnPrint) btnPrint.style.display = '';
  const btnCombined = document.getElementById('btnCombinedReport'); if (btnCombined) btnCombined.style.display = '';

  const mMaster = perms.menus.masterData || { view: false, edit: false, del: false };
  document.getElementById('navMasterIncType').style.display = mMaster.view ? '' : 'none';
  document.getElementById('navMasterDept').style.display = mMaster.view ? '' : 'none';
  document.getElementById('navMasterUnit').style.display = mMaster.view ? '' : 'none';
  if (document.getElementById('masterNavLabel')) document.getElementById('masterNavLabel').style.display = mMaster.view ? '' : 'none';

  const btnAddIncType = document.getElementById('btnAddIncType'); if (btnAddIncType) btnAddIncType.style.display = mMaster.edit ? 'inline-flex' : 'none';
  const btnAddDept = document.getElementById('btnAddDept'); if (btnAddDept) btnAddDept.style.display = mMaster.edit ? 'inline-flex' : 'none';
  const btnAddUnit = document.getElementById('btnAddUnit'); if (btnAddUnit) btnAddUnit.style.display = mMaster.edit ? 'inline-flex' : 'none';

  const mUsers = perms.menus.users || { view: false, edit: false, del: false };
  document.getElementById('navUsers').style.display = mUsers.view ? '' : 'none';
  const btnAddUser = document.getElementById('btnAddUser'); if (btnAddUser) btnAddUser.style.display = mUsers.edit ? 'inline-flex' : 'none';

  const mSettings = perms.menus.settings || { view: false, edit: false, del: false };
  document.getElementById('navSettings').style.display = mSettings.view ? '' : 'none';
  document.getElementById('navRoles').style.display = hasRole(currentUser, 'Admin') ? '' : 'none';

  const mAkun = perms.menus.akun || { view: false, edit: false, del: false };
  document.getElementById('navAkun').style.display = mAkun.view ? '' : 'none';

  const mSeries = perms.menus.series || { view: false, edit: false, del: false };
  if (document.getElementById('navSeries')) document.getElementById('navSeries').style.display = mSeries.view ? '' : 'none';

  const mLogs = perms.menus.logs || { view: false, edit: false, del: false };
  if (document.getElementById('navLogs')) document.getElementById('navLogs').style.display = mLogs.view ? '' : 'none';

  const showAdminGroup = mMaster.view || mUsers.view || mSettings.view || mLogs.view || mSeries.view;
  document.getElementById('adminNavLabel').style.display = showAdminGroup ? '' : 'none';

  const sensorContainer = document.getElementById('reportSensorContainer');
  if (sensorContainer) sensorContainer.style.display = perms.menus.laporan?.view ? 'flex' : 'none';

  // Auto-enable Unit Filter for Operators or Diakons with bound units
  const userUnits = getUserUnits();
  if (currentUser && (hasRole(currentUser, 'Operator') || hasRole(currentUser, 'Diakon')) && userUnits.length > 0) {
    myUnitFilterActive = true;
    const btnToggle = document.getElementById('btnToggleMyUnit');
    if (btnToggle) {
      btnToggle.classList.add('active');
      btnToggle.innerHTML = safeIcon('filter', 'lucide-sm') + ' Hanya Unit Saya';
    }
  }

  if (!mPemasukan.edit) { document.querySelectorAll('.btn-save-pemasukan').forEach(el => el.style.display = 'none'); }
  if (!mPengeluaran.edit) { document.querySelectorAll('.btn-save-pengeluaran').forEach(el => el.style.display = 'none'); }

  const btnLogoutText = document.getElementById('btnLogoutText');
  const btnLogoutIcon = document.getElementById('btnLogoutIcon');
  const topbarHamburger = document.getElementById('topbarHamburger');
  const btnHeaderLogin = document.getElementById('btnHeaderLogin');
  const btnHeaderHomeIcon = document.getElementById('btnHeaderHomeIcon');
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main');
  const botSidebarMenu = document.getElementById('botSidebarMenu');

  if (hasRole(currentUser, 'Publik')) {
    if (btnLogoutText) btnLogoutText.textContent = 'Home / Login';
    if (btnLogoutIcon) btnLogoutIcon.innerHTML = '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>';
    if (topbarHamburger) topbarHamburger.style.display = 'none';
    if (btnHeaderLogin) btnHeaderLogin.style.display = 'inline-flex';
    if (btnHeaderHomeIcon) btnHeaderHomeIcon.style.display = 'inline-flex';
    if (sidebar) sidebar.style.display = 'none';
    if (mainArea) mainArea.style.marginLeft = '0px';
    if (botSidebarMenu) botSidebarMenu.style.display = 'none';
  } else {
    if (btnLogoutText) btnLogoutText.textContent = 'Keluar';
    if (btnLogoutIcon) btnLogoutIcon.innerHTML = '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />';
    if (topbarHamburger) topbarHamburger.style.display = '';
    if (btnHeaderLogin) btnHeaderLogin.style.display = 'none';
    if (btnHeaderHomeIcon) btnHeaderHomeIcon.style.display = 'inline-flex';
    if (sidebar) sidebar.style.display = '';
    if (mainArea) mainArea.style.marginLeft = '';
    if (botSidebarMenu) botSidebarMenu.style.display = '';
  }
}

let myUnitFilterActive = false;
function toggleMyUnitFilter() {
  myUnitFilterActive = !myUnitFilterActive;
  const btn = document.getElementById('btnFilterMyUnit');
  if (!btn) return;
  if (myUnitFilterActive) {
    btn.style.background = 'var(--accent-blue)';
    btn.style.color = 'white';
    btn.innerHTML = 'Hapus Filter Unit Saya';
  } else {
    btn.style.background = 'transparent';
    btn.style.color = 'var(--accent-blue)';
    btn.innerHTML = 'Transaksi Unit Saya';
  }
  renderHistory();
}

function goToMyUnitHistory() {
  myUnitFilterActive = true;
  const btn = document.getElementById('btnFilterMyUnit');
  if (btn) {
    btn.style.background = 'var(--accent-blue)';
    btn.style.color = 'white';
    btn.innerHTML = 'Hapus Filter Unit Saya';
  }
  showPage('riwayat');
  renderHistory();
}

function updateLastReceipts() {
  const lblInc = document.getElementById('lastIncReceipt');
  if (lblInc) {
    if (cachedIncome && cachedIncome.length > 0) {
      const sortedInc = [...cachedIncome].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
      lblInc.innerHTML = `No. Kuitansi Terakhir:<br><strong style="color:var(--text)">${sortedInc[0].receipt_no}</strong>`;
    } else {
      lblInc.textContent = 'Belum ada transaksi';
    }
  }
  const lblExp = document.getElementById('lastExpReceipt');
  if (lblExp) {
    if (cachedExpense && cachedExpense.length > 0) {
      const sortedExp = [...cachedExpense].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
      lblExp.innerHTML = `No. Bukti Terakhir:<br><strong style="color:var(--text)">${sortedExp[0].receipt_no}</strong>`;
    } else {
      lblExp.textContent = 'Belum ada transaksi';
    }
  }
}

async function syncAllData() {
  try {
    window.isBulkProcessing = true;
    await loadMasterData();
    await loadAllTransactions();
    await loadPembangunanData();
    updateAppStatus();
    if (masterData) renderDashboard();
    updateLastReceipts();
    return true;
  } catch (e) {
    notify('Sinkronisasi gagal: ' + e.message, 'error');
    return false;
  } finally {
    window.isBulkProcessing = false;
    hideGlobalLoading();
  }
}

async function handleManualSync() {
  const statusTxt = document.getElementById('appStatusText'); const statusDot = document.getElementById('appStatusDot');
  const floatBtn = document.getElementById('floatingSyncBtn');
  const floatIcon = document.getElementById('floatingSyncIcon');
  if (floatBtn) { floatBtn.disabled = true; }
  const btn = document.getElementById('btnForceSync');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Sync...'; }
  if (floatIcon) { floatIcon.innerHTML = `<i class="fa-solid fa-rotate fa-spin text-amber-500 text-xl md:text-lg"></i>`; }
  if (statusTxt) statusTxt.textContent = 'Sync...'; if (statusDot) statusDot.className = 'status-dot loading';

  await checkAPIConnection();
  const success = await syncAllData();

  if (floatBtn) { floatBtn.disabled = false; }
  if (floatIcon) { floatIcon.innerHTML = '<span class="absolute w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span><span class="absolute w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-75"></span>'; }
  if (btn) { btn.disabled = false; btn.innerHTML = safeIcon('refresh', 'lucide-sm') + ' Sinkronisasi'; }
  if (success) {
    notify('Data tersinkron!', 'success');
  }
}

async function loadMasterData() { const res = await apiGet('getMasterData'); if (res.success) masterData = res.data; }
function initForms() {
  if (!masterData) return;
  document.getElementById('incDate').value = todayStr(); document.getElementById('expDate').value = todayStr();
  const incSel = document.getElementById('incType');
  const perpuluhanGroup = ['Perpuluhan', 'Terpadu', 'Khusus Jemaat', 'Khusus Daerah']; const excludeList = ['Persembahan Khusus', ...perpuluhanGroup];
  let parentOptions = '<option value="">-- Kategori --</option><option value="Perpuluhan">Grup Perpuluhan (Otomatis)</option>';
  (masterData.incomeTypes || []).forEach(x => { if (!excludeList.includes(x.name)) { parentOptions += `<option value="${x.name}">${x.name}</option>`; } });
  incSel.innerHTML = parentOptions;
  document.getElementById('incUnit').innerHTML = '<option value="">-- Tanpa Unit --</option>' + (masterData.units || []).map(x => `<option value="${x.name}">${x.name}</option>`).join('');
  const userUnitContainer = document.getElementById('userUnitContainer');
  if (userUnitContainer) {
    userUnitContainer.innerHTML = (masterData.units || []).map(x => `
          <label class="unit-check-wrapper">
            <input type="checkbox" class="userUnitCheck" value="${x.name}">
            <div class="unit-check-box">${x.name}</div>
          </label>
        `).join('');
  }
  document.getElementById('expDept').innerHTML = '<option value="">-- Departemen --</option>' + (masterData.departments || []).map(x => `<option value="${x.name}">${x.name}</option>`).join('');
  const givers = new Set(); (cachedIncome || []).forEach(x => {
    if (x.nama_pemberi && x.nama_pemberi !== '-' && x.nama_pemberi !== 'Umum') {
      let g = x.nama_pemberi;
      if (g.toLowerCase().startsWith('kolektif ')) {
        g = g.substring(9).trim();
      } else if (g.toLowerCase().endsWith(' - kolektif')) {
        g = g.substring(0, g.length - 11).trim();
      }
      givers.add(g);
    }
  });
  const giverList = document.getElementById('giverList'); if (giverList) giverList.innerHTML = Array.from(givers).map(g => `<option value="${g}">`).join('');

  const receivers = new Set(); (cachedExpense || []).forEach(x => { if (x.nama_penerima && x.nama_penerima !== '-' && x.nama_penerima !== 'Umum') receivers.add(x.nama_penerima); });
  const receiverList = document.getElementById('receiverList'); if (receiverList) receiverList.innerHTML = Array.from(receivers).map(r => `<option value="${r}">`).join('');

  restoreIncomeDraft();
  restoreExpenseDraft();
  setupDraftAutoSave();
}

function handleTypeChange() {
  const type = document.getElementById('incType').value; const singleGrp = document.getElementById('incAmountSingleGroup'); const perpGrp = document.getElementById('incPerpuluhanGroup');
  if (singleGrp && perpGrp) { if (type === 'Perpuluhan') { singleGrp.style.display = 'none'; perpGrp.style.display = 'block'; } else { singleGrp.style.display = 'block'; perpGrp.style.display = 'none'; } }
  updateIncomeAlloc();
}

async function loadAllTransactions() {
  try {
    const [inc, exp, bal] = await Promise.all([
      apiGet('getIncomeList'),
      apiGet('getExpenseList'),
      apiGet('getBalances')
    ]);
    cachedIncome = Array.isArray(inc.data) ? inc.data : [];
    cachedExpense = Array.isArray(exp.data) ? exp.data : [];
    window.cachedIncome = cachedIncome;
    window.cachedExpense = cachedExpense;
    if (bal && bal.data) cachedSaldo = bal.data;
    try {
      localStorage.setItem('BISDAC_inc', JSON.stringify(cachedIncome));
      localStorage.setItem('BISDAC_exp', JSON.stringify(cachedExpense));
      localStorage.setItem('BISDAC_bal', JSON.stringify(cachedSaldo));
    } catch (e) { }

    if (currentUser && !hasRole(currentUser, 'Admin')) {
      const cUsername = (currentUser.username || '').toLowerCase().trim();
      const cNama = (currentUser.nama || '').toLowerCase().trim();
      const isPublik = hasRole(currentUser, 'Publik');

      const uUnits = getUserUnits(cUsername).map(u => String(u).toLowerCase().trim());

      const hidePhoto = (x) => {
        if (isPublik) return true;

        const pInputBy = String(x.input_by || '').toLowerCase().trim();
        const pInputter = String(x.inputter || '').toLowerCase().trim();
        const pUser = String(x.username || '').toLowerCase().trim();
        const pPemberi = String(x.nama_pemberi || '').toLowerCase().trim();
        const pPenerima = String(x.nama_penerima || '').toLowerCase().trim();
        const pUnit = String(x.unit_name || '').toLowerCase().trim();

        // Check direct ownership
        if (cUsername && (pInputBy === cUsername || pInputter === cUsername || pUser === cUsername)) return false;
        if (cNama && (pPemberi.includes(cNama) || pPenerima.includes(cNama))) return false;

        const rPerms = getRolePerms(currentUser?.role || '');
        const isApprover = rPerms && rPerms.menus && rPerms.menus.riwayat && rPerms.menus.riwayat.approve;
        if (isApprover || hasRole(currentUser, 'Pendeta') || hasRole(currentUser, 'Ketua Jemaat')) return false;

        if (uUnits.length > 0) {
          const matchUnit = uUnits.some(u => pUnit === u || pUnit.includes(u));
          if (matchUnit) return false;
        } else {
          // No units assigned. Operator or Bendahara (Pusat) see everything
          if (hasRole(currentUser, 'Operator') || hasRole(currentUser, 'Bendahara')) return false;
        }

        let hasMembers = false;
        if (masterData && masterData.units) {
          const uData = masterData.units.find(u => String(u.name).toLowerCase() === pUnit);
          if (uData && parseInt(uData.jumlah_anggota || 0) > 0) hasMembers = true;
        }
        const isExpense = x.type === 'expense';
        const incType = String(x.income_type || '').toLowerCase();
        const isTransparentInc = x.type === 'income' && (incType.includes('sabat') || incType.includes('rabu malam') || incType.includes('pembangunan')) && !hasMembers;

        if (isExpense || isTransparentInc) return false;

        return true;
      };

      cachedIncome.forEach(x => { if (hidePhoto(x)) x.receipt_photo = ''; });
      cachedExpense.forEach(x => { if (hidePhoto(x)) x.receipt_photo = ''; });
    }
    calculateExtendedBalances();
    updateGlobalApprovalBadge();
  } catch (e) { throw e; }
}

function calculateExtendedBalances() {
  let calcDaerah = cachedSaldo.initDaerah || 0; let calcJemaat = cachedSaldo.initJemaat || 0; let calcBangun = cachedSaldo.initBangun || 0;
  let bankDaerah = calcDaerah; let bankJemaat = calcJemaat; let bankBangun = calcBangun;
  let tanganDaerah = 0; let tanganJemaat = 0; let tanganBangun = 0;

  (cachedIncome || []).forEach(i => {
    if (i.income_type === 'Mutasi Kas / Setor Bank') return;
    calcDaerah += (i.alloc_daerah || 0); calcJemaat += (i.alloc_jemaat || 0); calcBangun += (i.alloc_bangun || 0);
    const isCashInc = (i.note || '').includes('[CASH]');
    if (isCashInc) {
      tanganDaerah += (i.alloc_daerah || 0); tanganJemaat += (i.alloc_jemaat || 0); tanganBangun += (i.alloc_bangun || 0);
    } else {
      bankDaerah += (i.alloc_daerah || 0); bankJemaat += (i.alloc_jemaat || 0); bankBangun += (i.alloc_bangun || 0);
    }
  });

  (cachedExpense || []).forEach(e => {
    const isMutasi = e.department === 'Mutasi Kas / Setor Bank';
    let srcBase = e.source_balance;

    // Normalize any explicit labels that were accidentally saved
    if (srcBase === 'Kas Daerah (Bank)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [BANK]'; }
    if (srcBase === 'Kas Daerah (Di Tangan)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [CASH]'; }
    if (srcBase === 'Kas Jemaat (Bank)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [BANK]'; }
    if (srcBase === 'Kas Jemaat (Di Tangan)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [CASH]'; }
    if (srcBase === 'Kas Pembangunan (Bank)') { srcBase = 'Pembangunan'; e.note = (e.note || '') + ' [BANK]'; }
    if (srcBase === 'Kas Pembangunan (Di Tangan)') { srcBase = 'Pembangunan'; e.note = (e.note || '') + ' [CASH]'; }

    const isCashExp = (e.note || '').includes('[CASH]');

    if (srcBase === 'Daerah') {
      if (!isMutasi) {
        calcDaerah -= e.amount;
        if (isCashExp) tanganDaerah -= e.amount; else bankDaerah -= e.amount;
      } else { tanganDaerah -= e.amount; bankDaerah += e.amount; }
    }
    else if (srcBase === 'Kas Jemaat') {
      if (!isMutasi) {
        calcJemaat -= e.amount;
        if (isCashExp) tanganJemaat -= e.amount; else bankJemaat -= e.amount;
      } else { tanganJemaat -= e.amount; bankJemaat += e.amount; }
    }
    else if (srcBase === 'Pembangunan') {
      if (!isMutasi) {
        calcBangun -= e.amount;
        if (isCashExp) tanganBangun -= e.amount; else bankBangun -= e.amount;
      } else { tanganBangun -= e.amount; bankBangun += e.amount; }
    }
  });

  cachedSaldo.daerah = calcDaerah;
  cachedSaldo.jemaat = calcJemaat;
  cachedSaldo.bangun = calcBangun;
  cachedSaldo.bankDaerah = bankDaerah;
  cachedSaldo.bankJemaat = bankJemaat;
  cachedSaldo.bankBangun = bankBangun;
  cachedSaldo.tanganDaerah = tanganDaerah;
  cachedSaldo.tanganJemaat = tanganJemaat;
  cachedSaldo.tanganBangun = tanganBangun;
}

function isTxFullyApproved(tx) {
  if (!tx || !tx.approved_by) return false;
  const app = String(tx.approved_by);
  return app.includes('Admin') || (app.includes('Ketua Jemaat') && app.includes('Pendeta'));
}

function hasUserApprovedTx(tx, user) {
  if (!tx || !user) return false;
  if (isTxFullyApproved(tx)) return true;
  const app = String(tx.approved_by || '');
  if (hasRole(user, 'Admin') && app.includes('Admin')) return true;
  if (hasRole(user, 'Ketua Jemaat') && app.includes('Ketua Jemaat')) return true;
  if (hasRole(user, 'Pendeta') && app.includes('Pendeta')) return true;
  return false;
}

function isTxPendingForUser(tx, user) {
  if (!tx || !user) return false;
  if (isTxFullyApproved(tx)) return false;
  const app = String(tx.approved_by || '');
  if (hasRole(user, 'Admin') && !app.includes('Admin')) return true;
  if (hasRole(user, 'Ketua Jemaat') && !app.includes('Ketua Jemaat')) return true;
  if (hasRole(user, 'Pendeta') && !app.includes('Pendeta')) return true;
  return false;
}

function updateGlobalApprovalBadge() {
  const navItem = document.getElementById('navRiwayat');
  const topBadge = document.getElementById('globalApprovalBadge');
  const topBtn = document.getElementById('globalApprovalBtn');
  if (!navItem && !topBadge) return;

  const isAdmin = currentUser && hasRole(currentUser, 'Admin');
  const rolePerms = currentUser ? getRolePerms(currentUser?.role || '') : null;
  const canApprove = rolePerms && rolePerms.menus && rolePerms.menus.riwayat && rolePerms.menus.riwayat.approve;
  const isApprover = currentUser && (canApprove || isAdmin);
  const isBendahara = currentUser && hasRole(currentUser, 'Bendahara');
  const dashAlert = document.getElementById('dashApprovalAlert');
  const dashDesc = document.getElementById('approvalAlertDesc');

  if (!isApprover && !isBendahara) {
    if (navItem) navItem.classList.remove('has-notification');
    if (topBadge) topBadge.style.display = 'none';
    if (topBtn) topBtn.style.display = 'none';
    if (dashAlert) dashAlert.style.display = 'none';
    return;
  }
  if (topBtn) topBtn.style.display = 'block';

  let list = [...(cachedIncome || []).map(x => ({ ...x })), ...(cachedExpense || []).map(x => ({ ...x }))];
  list = groupTransactions(list);
  let pendingCount = 0;
  list.forEach(x => {
    const deleteId = x.transaction_id || x.receipt_no || '';
    if (!deleteId) return;
    if (x.department === 'Mutasi Kas / Setor Bank' || x.income_type === 'Mutasi Kas / Setor Bank') return;
    if (isTxFullyApproved(x)) return;

    if (isApprover) {
      if (isTxPendingForUser(x, currentUser)) pendingCount += 1;
    } else if (isBendahara) {
      pendingCount += 1;
    }
  });

  if (pendingCount > 0) {
    if (navItem) navItem.classList.add('has-notification');
    if (topBadge) {
      topBadge.innerText = pendingCount;
      topBadge.style.display = 'inline-flex';
    }
    if (dashAlert) {
      dashAlert.style.display = 'block';
      if (dashDesc) {
        if (isApprover) {
          dashDesc.textContent = `Terdapat ${pendingCount} transaksi pengeluaran kas yang membutuhkan disposisi / persetujuan Anda.`;
        } else {
          dashDesc.textContent = `Terdapat ${pendingCount} transaksi pengeluaran kas yang sedang menunggu persetujuan Ketua Jemaat / Pendeta.`;
        }
      }
    }
  } else {
    if (navItem) navItem.classList.remove('has-notification');
    if (topBadge) topBadge.style.display = 'none';
    if (dashAlert) dashAlert.style.display = 'none';
  }
}

window.navigateToApprovals = function () {
  showPage('riwayat');
};

function searchByReceipt() {
  const q = document.getElementById('searchReceiptInput').value.trim().toLowerCase(); const resultDiv = document.getElementById('receiptSearchResult');
  const perms = getRolePerms(currentUser?.role || '');
  const isViewer = perms.isAnonymous;
  if (!q) { resultDiv.style.display = 'none'; return; }

  let validUnitNames = [];
  if (masterData && masterData.units) {
    validUnitNames = masterData.units
      .filter(u => String(u.id || '').toLowerCase() === q || String(u.id || '').toLowerCase().includes(q))
      .map(u => String(u.name).toLowerCase());
  }

  const foundIncomes = cachedIncome.filter(x =>
    String(x.receipt_no || '').toLowerCase().includes(q) ||
    validUnitNames.includes(String(x.unit_name || '').toLowerCase())
  ).map(x => ({ ...x, isInc: true }));

  const foundExpenses = cachedExpense.filter(x =>
    String(x.receipt_no || '').toLowerCase().includes(q)
  ).map(x => ({ ...x, isInc: false }));

  const allFound = [...foundIncomes, ...foundExpenses]; allFound.sort((a, b) => new Date(b.date) - new Date(a.date));
  window.currentHistoryData = allFound.map(x => ({ ...x, type: x.isInc ? 'income' : 'expense' }));
  resultDiv.style.display = 'block';

  if (allFound.length > 0) {
    let html = '<div style="max-height: 70vh; overflow-y: auto; padding-right: 6px;">';

    const isUnitSearch = validUnitNames.length > 0;
    if (isUnitSearch && foundIncomes.length > 0) {
      const monthlySum = {};
      const ketSum = {};
      let totalIncSearch = 0;
      foundIncomes.forEach(inc => {
        const d = new Date(inc.date);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlySum[k] = (monthlySum[k] || 0) + inc.amount;

        const ket = inc.income_type || '-';
        ketSum[ket] = (ketSum[ket] || 0) + inc.amount;

        totalIncSearch += inc.amount;
      });

      html += `<div style="background:var(--badge-gray-bg); border:1px solid var(--glass-border); padding:16px; border-radius:var(--radius); margin-bottom:16px;">
        <div style="font-size:12px; color:var(--text3); margin-bottom:12px; font-weight:700; text-transform:uppercase;">Akumulasi Pemasukan Unit</div>
        <button class="btn btn-primary" style="width:100%; justify-content:center; padding:10px; margin-bottom:16px; font-size:13px;" onclick="printUnitReport('${q}')">${safeIcon('printer', 'lucide-sm')} Cetak PDF Laporan Unit Ini</button>`;

      html += `<div style="margin-bottom:8px;"><strong style="font-size:11px; color:var(--text3);">Berdasarkan Bulan</strong></div>`;
      Object.keys(monthlySum).sort((a, b) => b.localeCompare(a)).forEach(k => {
        const [y, m] = k.split('-');
        const mNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        html += `<div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px; border-bottom:1px solid var(--glass-border); padding-bottom:6px;">
          <span style="color:var(--text2)">${mNames[parseInt(m)]} ${y}</span><strong class="amount-pos">+${fmt(monthlySum[k])}</strong>
        </div>`;
      });

      html += `<div style="margin-bottom:8px; margin-top:12px;"><strong style="font-size:11px; color:var(--text3);">Berdasarkan Keterangan</strong></div>`;
      Object.keys(ketSum).sort((a, b) => ketSum[b] - ketSum[a]).forEach(ket => {
        html += `<div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px; border-bottom:1px solid var(--glass-border); padding-bottom:6px;">
          <span style="color:var(--text2)">${ket}</span><strong class="amount-pos">+${fmt(ketSum[ket])}</strong>
        </div>`;
      });

      html += `<div style="display:flex; justify-content:space-between; font-size:14px; margin-top:12px; padding-top:4px;">
          <strong style="color:var(--text)">TOTAL KESELURUHAN</strong><strong class="amount-pos">+${fmt(totalIncSearch)}</strong>
        </div></div>`;
    }

    allFound.slice(0, 100).forEach(found => {
      const isPrivCategory = isViewer && found.isInc && isPrivateCategory(found.income_type);
      const displayPihak = found.isInc
        ? (isPrivCategory ? '*** (Privasi)' : (found.unit_name && found.unit_name !== '-' ? found.unit_name : (found.nama_pemberi || '-')))
        : (found.nama_penerima || '-');
      const displayNote = isPrivCategory ? '*** (Privasi)' : (found.note || '-');

      let photoBtn = '';
      photoBtn = getPhotoBtnText(found);

      html += `
        <div style="padding: 16px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--empty-bg); margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="badge badge-gray">${found.receipt_no}</span>
            <span class="badge ${found.isInc ? 'badge-green' : 'badge-red'}">${found.isInc ? 'Pemasukan' : 'Pengeluaran'}</span>
          </div>
          <div style="font-size: 13px; color: var(--text2); margin-bottom: 4px;">Tgl: <strong style="color: var(--text)">${fmtDate(found.date)}</strong></div>
          <div style="font-size: 13px; color: var(--text2); margin-bottom: 4px;">Pihak: <strong style="color: var(--text)">${displayPihak}</strong></div>
          <div style="font-size: 13px; color: var(--text2); margin-bottom: 8px;">Ket: <strong style="color: var(--text)">${found.isInc ? found.income_type : found.department}</strong><br><span style="font-size:12px; color:var(--text4)">${displayNote}</span></div>
          <div class="${found.isInc ? 'amount-pos' : 'amount-neg'}" style="font-size: 22px; font-weight: 800; letter-spacing:-0.5px;">${found.isInc ? '+' : '-'}${fmt(found.amount)}</div>
          ${photoBtn}
        </div>`;
    });
    if (allFound.length > 100) html += `<div style="text-align:center; font-size:12px; color:var(--text4); margin-top:8px;">Dan ${allFound.length - 100} transaksi lainnya...</div>`;
    html += '</div>'; resultDiv.innerHTML = html;
  } else { resultDiv.innerHTML = `<div class="empty-state">Data tidak ditemukan.</div>`; }
}

function groupTransactions(arr) {
  const grouped = [];
  const map = {};
  arr.forEach(x => {
    if (x.receipt_no && x.receipt_no !== '-' && x.receipt_no !== 'SALDO_AWAL') {
      if (!map[x.receipt_no]) {
        map[x.receipt_no] = { ...x, amount: 0, _items: [] };
        grouped.push(map[x.receipt_no]);
      }
      map[x.receipt_no].amount += parseFloat(x.amount);
      map[x.receipt_no]._items.push(x.income_type || x.department || 'Item');
    } else {
      grouped.push(x);
    }
  });
  grouped.forEach(x => {
    if (x._items && x._items.length > 1) {
      const lbl = `Kolektif (${x._items.length} item)`;
      if (x.type === 'income' || x.kind === 'income' || x.isInc || x.income_type) x.income_type = lbl;
      if (x.type === 'expense' || x.kind === 'expense' || x.department) x.department = lbl;
    }
  });
  return grouped;
}

let dashChartInstance = null;
let dashChartMode = 'bar';

function setDashboardChartMode(mode) {
  dashChartMode = mode;
  const btnBar = document.getElementById('btnChartModeBar');
  const btnLine = document.getElementById('btnChartModeLine');
  if (btnBar && btnLine) {
    if (mode === 'bar') {
      btnBar.classList.add('active');
      btnLine.classList.remove('active');
    } else {
      btnLine.classList.add('active');
      btnBar.classList.remove('active');
    }
  }
  updateDashboardChart();
}

function populateChartCategoryOptions() {
  const filterSelect = document.getElementById('dashChartCategoryFilter');
  if (!filterSelect) return;
  const currentVal = filterSelect.value || 'all';

  const incTypes = new Set();
  (cachedIncome || []).forEach(x => {
    if (x.income_type && x.income_type !== 'Mutasi Kas / Setor Bank' && !x.income_type.startsWith('Kolektif (')) {
      incTypes.add(x.income_type.trim());
    }
  });
  if (masterData && masterData.incomeTypes) {
    masterData.incomeTypes.forEach(x => {
      if (x.name && x.name !== 'Mutasi Kas / Setor Bank') incTypes.add(x.name.trim());
    });
  }

  const expDepts = new Set();
  (cachedExpense || []).forEach(x => {
    if (x.department && x.department !== 'Mutasi Kas / Setor Bank' && !x.department.startsWith('Kolektif (')) {
      expDepts.add(x.department.trim());
    }
  });
  if (masterData && masterData.departments) {
    masterData.departments.forEach(x => {
      if (x.name && x.name !== 'Mutasi Kas / Setor Bank') expDepts.add(x.name.trim());
    });
  }

  const sortedInc = Array.from(incTypes).sort((a, b) => a.localeCompare(b));
  const sortedExp = Array.from(expDepts).sort((a, b) => a.localeCompare(b));

  let html = `
    <option value="all">Semua (Total Pemasukan & Pengeluaran)</option>
    <option value="pembangunan">Dana Pembangunan (Masuk & Keluar)</option>
    <optgroup label="--- Jenis Penerimaan / Pemasukan ---">
      ${sortedInc.map(cat => `<option value="inc:${cat}">${cat}</option>`).join('')}
    </optgroup>
    <optgroup label="--- Jenis Pengeluaran / Departemen ---">
      ${sortedExp.map(dept => `<option value="exp:${dept}">${dept}</option>`).join('')}
    </optgroup>
  `;
  filterSelect.innerHTML = html;
  if ([...filterSelect.options].some(o => o.value === currentVal)) {
    filterSelect.value = currentVal;
  } else {
    filterSelect.value = 'all';
  }
}

function updateDashboardChart() {
  const canvas = document.getElementById('dashFinanceChart');
  if (!canvas) return;
  if (typeof Chart === 'undefined') {
    setTimeout(updateDashboardChart, 250);
    return;
  }

  const yearInput = document.getElementById('dashYear');
  const year = parseInt(yearInput ? yearInput.value : new Date().getFullYear()) || new Date().getFullYear();
  const filterSelect = document.getElementById('dashChartCategoryFilter');
  const filterVal = filterSelect ? filterSelect.value : 'all';

  const subtitle = document.getElementById('dashChartSubtitle');
  if (subtitle) {
    let filterLabel = 'Semua Transaksi Kas';
    if (filterVal === 'pembangunan') filterLabel = 'Kategori Pembangunan';
    else if (filterVal.startsWith('inc:')) filterLabel = `Penerimaan: ${filterVal.substring(4)}`;
    else if (filterVal.startsWith('exp:')) filterLabel = `Pengeluaran: ${filterVal.substring(4)}`;
    subtitle.textContent = `Grafik per bulan selama tahun ${year} (${filterLabel})`;
  }

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const incomeData = [];
  const expenseData = [];

  let totalYearIn = 0;
  let totalYearOut = 0;

  months.forEach(m => {
    const monthInc = (cachedIncome || []).filter(x => {
      const rYear = parseInt(x.year) || (new Date(x.date).getFullYear());
      const rMonth = parseInt(x.month) || (new Date(x.date).getMonth() + 1);
      return rYear === year && rMonth === m;
    });

    const monthExp = (cachedExpense || []).filter(x => {
      const rYear = parseInt(x.year) || (new Date(x.date).getFullYear());
      const rMonth = parseInt(x.month) || (new Date(x.date).getMonth() + 1);
      return rYear === year && rMonth === m;
    });

    let mIn = 0;
    let mOut = 0;

    if (filterVal === 'all') {
      mIn = monthInc.filter(x => x.income_type !== 'Mutasi Kas / Setor Bank').reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
      mOut = monthExp.filter(x => x.department !== 'Mutasi Kas / Setor Bank').reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    } else if (filterVal === 'pembangunan') {
      mIn = monthInc.reduce((s, x) => {
        if ((parseFloat(x.alloc_bangun) || 0) > 0) return s + parseFloat(x.alloc_bangun);
        if ((x.income_type || '').toLowerCase().includes('bangun')) return s + (parseFloat(x.amount) || 0);
        return s;
      }, 0);
      mOut = monthExp.reduce((s, x) => {
        if (x.department === 'Mutasi Kas / Setor Bank') return s;
        if ((x.department || '').toLowerCase().includes('bangun') || x.source_balance === 'Pembangunan') return s + (parseFloat(x.amount) || 0);
        return s;
      }, 0);
    } else if (filterVal.startsWith('inc:')) {
      const targetCat = filterVal.substring(4).toLowerCase().trim();
      mIn = monthInc.filter(x => {
        const cat = (x.income_type || '').toLowerCase().trim();
        if (targetCat === 'perpuluhan' || targetCat === 'persepuluhan') {
          return cat.includes('perpuluhan') || cat.includes('persepuluhan');
        }
        return cat === targetCat;
      }).reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);

      mOut = monthExp.filter(x => {
        if (x.department === 'Mutasi Kas / Setor Bank') return false;
        const dept = (x.department || '').toLowerCase().trim();
        return dept === targetCat;
      }).reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    } else if (filterVal.startsWith('exp:')) {
      const targetDept = filterVal.substring(4).toLowerCase().trim();
      mOut = monthExp.filter(x => {
        if (x.department === 'Mutasi Kas / Setor Bank') return false;
        const dept = (x.department || '').toLowerCase().trim();
        return dept === targetDept;
      }).reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);

      mIn = monthInc.filter(x => {
        const cat = (x.income_type || '').toLowerCase().trim();
        return cat === targetDept;
      }).reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    }

    incomeData.push(mIn);
    expenseData.push(mOut);
    totalYearIn += mIn;
    totalYearOut += mOut;
  });

  const summaryEl = document.getElementById('dashChartSummary');
  if (summaryEl) {
    const net = totalYearIn - totalYearOut;
    const netColor = net >= 0 ? 'var(--accent-green, #10b981)' : 'var(--accent-orange, #f43f5e)';
    const netSign = net >= 0 ? '+' : '';
    summaryEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#10b981;"></span>
        <span style="color:var(--text3);">Penerimaan Setahun:</span>
        <strong style="color:var(--accent-green, #10b981);">Rp ${fmt(totalYearIn)}</strong>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#f43f5e;"></span>
        <span style="color:var(--text3);">Pengeluaran Setahun:</span>
        <strong style="color:var(--accent-orange, #f43f5e);">Rp ${fmt(totalYearOut)}</strong>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${netColor};"></span>
        <span style="color:var(--text3);">Surplus / Defisit:</span>
        <strong style="color:${netColor};">${netSign}Rp ${fmt(net)}</strong>
      </div>
    `;
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  const isOnlyInc = filterVal.startsWith('inc:') && expenseData.every(v => v === 0);
  const isOnlyExp = filterVal.startsWith('exp:') && incomeData.every(v => v === 0);

  const datasets = [];

  if (!isOnlyExp) {
    datasets.push({
      label: 'Penerimaan',
      data: incomeData,
      backgroundColor: dashChartMode === 'line' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.85)',
      borderColor: '#10b981',
      borderWidth: 2,
      borderRadius: dashChartMode === 'bar' ? 6 : 0,
      fill: dashChartMode === 'line',
      tension: 0.35,
      pointRadius: dashChartMode === 'line' ? 4 : 0,
      pointHoverRadius: 6,
      pointBackgroundColor: '#10b981'
    });
  }

  if (!isOnlyInc) {
    datasets.push({
      label: 'Pengeluaran',
      data: expenseData,
      backgroundColor: dashChartMode === 'line' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.85)',
      borderColor: '#f43f5e',
      borderWidth: 2,
      borderRadius: dashChartMode === 'bar' ? 6 : 0,
      fill: dashChartMode === 'line',
      tension: 0.35,
      pointRadius: dashChartMode === 'line' ? 4 : 0,
      pointHoverRadius: 6,
      pointBackgroundColor: '#f43f5e'
    });
  }

  if (dashChartInstance) {
    dashChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  dashChartInstance = new Chart(ctx, {
    type: dashChartMode,
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      onClick: (event, elements) => {
        if (elements && elements.length > 0) {
          const monthIndex = elements[0].index + 1;
          const dashMonthSelect = document.getElementById('dashMonth');
          if (dashMonthSelect) {
            dashMonthSelect.value = String(monthIndex);
            renderDashboard();
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: textColor,
            font: { size: 12, family: 'Inter, system-ui, sans-serif', weight: 600 },
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8
          }
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#ffffff' : '#0f172a',
          bodyColor: isDark ? '#e2e8f0' : '#334155',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function (context) {
              const val = context.parsed.y || 0;
              return ` ${context.dataset.label}: Rp ${fmt(val)}`;
            },
            afterBody: function (contexts) {
              if (contexts.length >= 2) {
                const inVal = contexts.find(c => c.dataset.label === 'Penerimaan')?.parsed.y || 0;
                const outVal = contexts.find(c => c.dataset.label === 'Pengeluaran')?.parsed.y || 0;
                const diff = inVal - outVal;
                const sign = diff >= 0 ? '+' : '';
                return `\n Selisih: ${sign}Rp ${fmt(diff)}`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: gridColor,
            drawBorder: false
          },
          ticks: {
            color: textColor,
            font: { size: 11, family: 'Inter, system-ui, sans-serif' }
          }
        },
        y: {
          grid: {
            color: gridColor,
            drawBorder: false
          },
          ticks: {
            color: textColor,
            font: { size: 11, family: 'Inter, system-ui, sans-serif' },
            callback: function (val) {
              if (val >= 1000000000) return (val / 1000000000).toFixed(1) + ' M';
              if (val >= 1000000) return (val / 1000000).toFixed(0) + ' Jt';
              if (val >= 1000) return (val / 1000).toFixed(0) + ' Rb';
              return val;
            }
          }
        }
      }
    }
  });
}

function renderDashboard() {
  updateWelcomeGreeting();
  updateGlobalApprovalBadge();

  const userUnits = getUserUnits();
  if (userUnits.length > 0) {
    if (document.getElementById('dashSearchCard')) document.getElementById('dashSearchCard').style.display = 'none';
    if (document.getElementById('dashUnitToggleContainer')) document.getElementById('dashUnitToggleContainer').style.display = 'block';
    if (document.getElementById('riwayatGlobalSearch')) document.getElementById('riwayatGlobalSearch').style.display = 'none';
    if (document.getElementById('btnFilterMyUnit')) document.getElementById('btnFilterMyUnit').style.display = 'inline-flex';
    document.getElementById('dashUnitToggleContainer').innerHTML = `<button class="btn btn-primary" onclick="goToMyUnitHistory()" style="white-space:normal;">Lihat Transaksi Unit Saya (${userUnits.join(', ')})</button>`;
  } else {
    if (document.getElementById('dashSearchCard')) document.getElementById('dashSearchCard').style.display = 'block';
    if (document.getElementById('dashUnitToggleContainer')) document.getElementById('dashUnitToggleContainer').style.display = 'none';
    if (document.getElementById('riwayatGlobalSearch')) document.getElementById('riwayatGlobalSearch').style.display = 'flex';
    if (document.getElementById('btnFilterMyUnit')) document.getElementById('btnFilterMyUnit').style.display = 'none';
  }

  if (!cachedSaldo) return;

  populateChartCategoryOptions();
  updateDashboardChart();
  const month = parseInt(document.getElementById('dashMonth').value); const year = parseInt(document.getElementById('dashYear').value);
  const perms = getRolePerms(currentUser ? currentUser.role : '');
  const isViewer = perms.isAnonymous;
  let targetDateEnd = month === 0 ? new Date(year, 11, 31, 23, 59, 59) : new Date(year, month, 0, 23, 59, 59);

  const filteredInc = (cachedIncome || []).filter(x => {
    const rYear = parseInt(x.year) || (new Date(x.date).getFullYear());
    const rMonth = parseInt(x.month) || (new Date(x.date).getMonth() + 1);
    return rYear === year && (month === 0 || rMonth === month);
  });
  const filteredExp = (cachedExpense || []).filter(x => {
    const rYear = parseInt(x.year) || (new Date(x.date).getFullYear());
    const rMonth = parseInt(x.month) || (new Date(x.date).getMonth() + 1);
    return rYear === year && (month === 0 || rMonth === month);
  });

  updateDepartmentDonutChart(filteredExp);
  const historicalInc = (cachedIncome || []).filter(x => new Date(x.date) <= targetDateEnd);
  const historicalExp = (cachedExpense || []).filter(x => new Date(x.date) <= targetDateEnd);

  let calcDaerah = cachedSaldo.initDaerah || 0; let calcJemaat = cachedSaldo.initJemaat || 0; let calcBangun = cachedSaldo.initBangun || 0;
  let bankDaerah = calcDaerah; let bankJemaat = calcJemaat; let bankBangun = calcBangun;
  let tanganDaerah = 0; let tanganJemaat = 0; let tanganBangun = 0;

  historicalInc.forEach(i => {
    if (i.income_type === 'Mutasi Kas / Setor Bank') return;
    calcDaerah += (i.alloc_daerah || 0); calcJemaat += (i.alloc_jemaat || 0); calcBangun += (i.alloc_bangun || 0);
    const isCashInc = (i.note || '').includes('[CASH]');
    if (isCashInc) {
      tanganDaerah += (i.alloc_daerah || 0); tanganJemaat += (i.alloc_jemaat || 0); tanganBangun += (i.alloc_bangun || 0);
    } else {
      bankDaerah += (i.alloc_daerah || 0); bankJemaat += (i.alloc_jemaat || 0); bankBangun += (i.alloc_bangun || 0);
    }
  });
  historicalExp.forEach(e => {
    const isMutasi = e.department === 'Mutasi Kas / Setor Bank';
    let srcBase = e.source_balance;

    // Normalize any explicit labels
    if (srcBase === 'Kas Daerah (Bank)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [BANK]'; }
    if (srcBase === 'Kas Daerah (Di Tangan)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [CASH]'; }
    if (srcBase === 'Kas Jemaat (Bank)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [BANK]'; }
    if (srcBase === 'Kas Jemaat (Di Tangan)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [CASH]'; }
    if (srcBase === 'Kas Pembangunan (Bank)') { srcBase = 'Pembangunan'; e.note = (e.note || '') + ' [BANK]'; }
    if (srcBase === 'Kas Pembangunan (Di Tangan)') { srcBase = 'Pembangunan'; e.note = (e.note || '') + ' [CASH]'; }

    const isCashExp = (e.note || '').includes('[CASH]');

    if (srcBase === 'Daerah') {
      if (!isMutasi) {
        calcDaerah -= e.amount;
        if (isCashExp) tanganDaerah -= e.amount; else bankDaerah -= e.amount;
      } else { tanganDaerah -= e.amount; bankDaerah += e.amount; }
    }
    else if (srcBase === 'Kas Jemaat') {
      if (!isMutasi) {
        calcJemaat -= e.amount;
        if (isCashExp) tanganJemaat -= e.amount; else bankJemaat -= e.amount;
      } else { tanganJemaat -= e.amount; bankJemaat += e.amount; }
    }
    else if (srcBase === 'Pembangunan') {
      if (!isMutasi) {
        calcBangun -= e.amount;
        if (isCashExp) tanganBangun -= e.amount; else bankBangun -= e.amount;
      } else { tanganBangun -= e.amount; bankBangun += e.amount; }
    }
  });

  const calcTotal = calcDaerah + calcJemaat + calcBangun; const saldoAccrued = calcTotal - calcDaerah;
  const totalIn = filteredInc.reduce((s, x) => s + x.amount, 0); const totalOut = filteredExp.reduce((s, x) => s + (x.department !== 'Mutasi Kas / Setor Bank' ? x.amount : 0), 0);

  let totalPemberiPersepuluhan = 0; let totalAnggotaSistem = 0;
  if (masterData && masterData.units) totalAnggotaSistem = masterData.units.reduce((s, u) => s + (parseInt(u.jumlah_anggota) || 0), 0);
  const unitsGavePersepuluhan = new Set(); filteredInc.forEach(x => { if ((x.income_type || '').toLowerCase().includes('persepuluhan') || (x.income_type || '').toLowerCase().includes('perpuluhan')) unitsGavePersepuluhan.add(x.unit_name); });
  if (masterData && masterData.units) masterData.units.forEach(u => { if (unitsGavePersepuluhan.has(u.name)) totalPemberiPersepuluhan += (parseInt(u.jumlah_anggota) || 0); });

  const targetPembangunan = (systemConfig.target_pembangunan !== undefined && systemConfig.target_pembangunan !== '') ? parseInt(systemConfig.target_pembangunan) : (pembangunanDataCache?.target ? parseInt(pembangunanDataCache.target) : 2500000000);
  const persentaseBangun = (calcBangun / targetPembangunan) * 100; const visualPercentBangun = persentaseBangun > 100 ? 100 : persentaseBangun;

  const targetKomitmen = (systemConfig.komitmen_target !== undefined && systemConfig.komitmen_target !== '') ? parseInt(systemConfig.komitmen_target) : (pembangunanDataCache?.komitmen_target ? parseInt(pembangunanDataCache.komitmen_target) : 77300000);
  let komitmenSaatIni = (systemConfig.komitmen_realisasi !== undefined && systemConfig.komitmen_realisasi !== '') ? parseInt(systemConfig.komitmen_realisasi) : (pembangunanDataCache?.komitmen_realisasi ? parseInt(pembangunanDataCache.komitmen_realisasi) : 63356900);
  if ((systemConfig.komitmen_realisasi === undefined || systemConfig.komitmen_realisasi === '') && komitmenSaatIni === 53376900) komitmenSaatIni = 63356900; // Force update pending API cache sync
  const persentaseKomitmen = (komitmenSaatIni / targetKomitmen) * 100;
  const visualPercentKomitmen = persentaseKomitmen > 100 ? 100 : persentaseKomitmen;

  const isPublik = currentUser && hasRole(currentUser, 'Publik');
  const clkCls = isPublik ? 'stat-card' : 'stat-card clickable';
  const oClick = (type) => isPublik ? '' : `onclick="openDashboardDetail('${type}')"`;

  document.getElementById('statsGrid').innerHTML = `
    ${isPublik ? '' : `<div class="${clkCls}" ${oClick('total')}>
      <div class="stat-header"><div class="stat-label">Total Saldo</div><div class="stat-icon c-teal">${safeIcon('shield', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-blue, #3a86ff)">${fmt(calcTotal)}</div>
      <div style="font-size: 11px; margin-top: 8px; color: var(--text3); border-top: 1px solid var(--glass-border); padding-top: 6px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Di Tangan:</span> <strong style="color:var(--text2)">${fmt(tanganDaerah + tanganJemaat + tanganBangun)}</strong></div>
        <div style="display:flex; justify-content:space-between"><span>Di Bank:</span> <strong style="color:var(--text2)">${fmt(bankDaerah + bankJemaat + bankBangun)}</strong></div>
      </div>
    </div>
    <div class="${clkCls}" ${oClick('bersih')}>
      <div class="stat-header"><div class="stat-label">Kas Bersih Jemaat</div><div class="stat-icon c-moss">${safeIcon('log', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-cyan, #00d2ff)">${fmt(saldoAccrued)}</div>
      <div style="font-size: 11px; margin-top: 8px; color: var(--text3); border-top: 1px solid var(--glass-border); padding-top: 6px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Di Tangan:</span> <strong style="color:var(--text2)">${fmt(tanganJemaat + tanganBangun)}</strong></div>
        <div style="display:flex; justify-content:space-between"><span>Di Bank:</span> <strong style="color:var(--text2)">${fmt(bankJemaat + bankBangun)}</strong></div>
      </div>
    </div>`}
    <div class="${clkCls}" ${oClick('in')}>
      <div class="stat-header"><div class="stat-label">Pemasukan Periode</div><div class="stat-icon c-green">${safeIcon('trendUp', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-green, #00e676)">+${fmt(totalIn)}</div>
    </div>
    <div class="${clkCls}" ${oClick('out')}>
      <div class="stat-header"><div class="stat-label">Pengeluaran Periode</div><div class="stat-icon c-red">${safeIcon('trendDown', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-orange, #ff6b6b)">-${fmt(totalOut)}</div>
    </div>
    <div class="${clkCls}" ${oClick('jemaat')}>
      <div class="stat-header"><div class="stat-label">Kas Jemaat</div><div class="stat-icon c-gold">${safeIcon('church', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-gold, #ffd166)">${fmt(calcJemaat)}</div>
      <div style="font-size: 11px; margin-top: 8px; color: var(--text3); border-top: 1px solid var(--glass-border); padding-top: 6px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Di Tangan:</span> <strong style="color:var(--accent-gold, #ffd166)">${fmt(tanganJemaat)}</strong></div>
        <div style="display:flex; justify-content:space-between"><span>Di Bank:</span> <strong style="color:var(--accent-gold, #ffd166)">${fmt(bankJemaat)}</strong></div>
      </div>
    </div>
    ${isPublik ? '' : `<div class="${clkCls}" ${oClick('daerah')}>
      <div class="stat-header"><div class="stat-label">Kas Daerah</div><div class="stat-icon c-teal">${safeIcon('mappin', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-purple, #9d4edd)">${fmt(calcDaerah)}</div>
      <div style="font-size: 11px; margin-top: 8px; color: var(--text3); border-top: 1px solid var(--glass-border); padding-top: 6px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Di Tangan:</span> <strong style="color:var(--accent-purple, #9d4edd)">${fmt(tanganDaerah)}</strong></div>
        <div style="display:flex; justify-content:space-between"><span>Di Bank:</span> <strong style="color:var(--accent-purple, #9d4edd)">${fmt(bankDaerah)}</strong></div>
      </div>
    </div>`}
    <div class="${clkCls}" ${oClick('bangun')}>
      <div class="stat-header"><div class="stat-label">Total Dana Pembangunan</div><div class="stat-icon c-teal">${safeIcon('hammer', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-blue, #3a86ff)">${fmt(calcBangun)}</div>
      <div style="font-size: 11px; margin-top: 8px; color: var(--text3); border-top: 1px solid var(--glass-border); padding-top: 6px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Di Tangan:</span> <strong style="color:var(--accent-blue, #3a86ff)">${fmt(tanganBangun)}</strong></div>
        <div style="display:flex; justify-content:space-between"><span>Di Bank:</span> <strong style="color:var(--accent-blue, #3a86ff)">${fmt(bankBangun)}</strong></div>
      </div>
      <div class="stat-sub" style="margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; font-weight: 700; color: var(--text-muted, var(--accent-gold, #ffd166));"><span>TARGET:</span><span style="color: var(--accent-gold, #ffd166, var(--teal-pop));">${persentaseBangun.toFixed(2)}%</span></div>
        <div style="font-size: 11px; margin-bottom: 6px; font-weight: 700; color: var(--text-muted, var(--accent-gold, #ffd166)); word-break: break-word; line-height: 1.1;">${fmt(targetPembangunan).toUpperCase()}</div>
        <div class="saldo-bar-track" style="height: 6px;"><div class="saldo-bar-fill" style="width:${visualPercentBangun}%; background: var(--accent-gold, #ffd166, var(--teal-pop));"></div></div>
      </div>
    </div>
    ${(isPublik || targetKomitmen <= 0 || komitmenSaatIni <= 0) ? '' : `<div class="stat-card">
      <div class="stat-header"><div class="stat-label">Komitmen Pembangunan</div><div class="stat-icon c-moss">${safeIcon('hammer', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-cyan, #00d2ff)">${fmt(komitmenSaatIni)}</div>
      <div class="stat-sub" style="margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; font-weight: 700; color: var(--text-muted, var(--text3));"><span>TARGET:</span><span style="color: var(--accent-cyan, var(--teal-pop));">${persentaseKomitmen.toFixed(2)}%</span></div>
        <div style="font-size: 11px; margin-bottom: 6px; font-weight: 700; color: var(--text-muted, var(--text3)); word-break: break-word; line-height: 1.1;">${fmt(targetKomitmen).toUpperCase()}</div>
        <div class="saldo-bar-track" style="height: 6px;"><div class="saldo-bar-fill" style="width:${visualPercentKomitmen}%; background: var(--accent-cyan, var(--teal-pop));"></div></div>
      </div>
    </div>`}
    <div class="stat-card">
      <div class="stat-header"><div class="stat-label">Partisipasi Jemaat</div><div class="stat-icon c-red">${safeIcon('users', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--text-main, var(--text))">${totalPemberiPersepuluhan} <span style="font-size:16px; color: var(--text-muted, var(--text4))">/ ${totalAnggotaSistem}</span></div>
    </div>
  `;

  const dashMainGrid = document.querySelector('.dashboard-main-grid');
  if (dashMainGrid) {
    dashMainGrid.style.display = isPublik ? 'none' : '';
  }

  const maxVal = Math.max(calcDaerah, calcJemaat, calcBangun, 1);
  document.getElementById('saldoBars').innerHTML = `
    <div class="saldo-bar-wrap" style="cursor:pointer;" onclick="openDashboardDetail('jemaat')"><div class="saldo-bar-label"><span>Kas Jemaat</span><span>${fmt(calcJemaat)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${(calcJemaat / maxVal * 100).toFixed(0)}%; background:var(--accent-gold, var(--gold))"></div></div></div>
    <div class="saldo-bar-wrap" style="cursor:pointer;" onclick="openDashboardDetail('daerah')"><div class="saldo-bar-label"><span>Kas Daerah</span><span>${fmt(calcDaerah)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${(calcDaerah / maxVal * 100).toFixed(0)}%; background:var(--accent-purple, var(--text3))"></div></div></div>
    <div class="saldo-bar-wrap" style="cursor:pointer;" onclick="openDashboardDetail('bangun')"><div class="saldo-bar-label"><span>Dana Pembangunan</span><span>${fmt(calcBangun)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${(calcBangun / maxVal * 100).toFixed(0)}%; background:var(--accent-blue, var(--teal-pop))"></div></div></div>
  `;

  let periodDaerah = 0; let periodJemaat = 0; let periodBangun = 0;
  filteredInc.forEach(i => { periodDaerah += (i.alloc_daerah || 0); periodJemaat += (i.alloc_jemaat || 0); periodBangun += (i.alloc_bangun || 0); });
  const periodTotal = periodDaerah + periodJemaat + periodBangun;

  if (periodTotal === 0) {
    document.getElementById('allocBars').innerHTML = '<div class="empty-state" style="border:none; background:transparent;">Belum ada pemasukan.</div>';
  } else {
    const pctD = ((periodDaerah / periodTotal) * 100).toFixed(1); const pctJ = ((periodJemaat / periodTotal) * 100).toFixed(1); const pctB = ((periodBangun / periodTotal) * 100).toFixed(1);
    document.getElementById('allocBars').innerHTML = `
      <div class="saldo-bar-wrap" style="cursor:pointer;" onclick="openDashboardDetail('income_jemaat')"><div class="saldo-bar-label"><span>Kas Jemaat (${pctJ}%)</span><span>${fmt(periodJemaat)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${pctJ}%; background:var(--accent-gold, var(--gold))"></div></div></div>
      <div class="saldo-bar-wrap" style="cursor:pointer;" onclick="openDashboardDetail('income_daerah')"><div class="saldo-bar-label"><span>Kas Daerah (${pctD}%)</span><span>${fmt(periodDaerah)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${pctD}%; background:var(--accent-purple, var(--text3))"></div></div></div>
      <div class="saldo-bar-wrap" style="cursor:pointer;" onclick="openDashboardDetail('income_bangun')"><div class="saldo-bar-label"><span>Pembangunan (${pctB}%)</span><span>${fmt(periodBangun)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${pctB}%; background:var(--accent-blue, var(--teal-pop))"></div></div></div>
    `;
  }

  const jBreak = {}; const dBreak = {}; const bBreak = {};
  filteredInc.forEach(x => { if (x.alloc_jemaat > 0) jBreak[x.income_type] = (jBreak[x.income_type] || 0) + x.alloc_jemaat; if (x.alloc_daerah > 0) dBreak[x.income_type] = (dBreak[x.income_type] || 0) + x.alloc_daerah; if (x.alloc_bangun > 0) bBreak[x.income_type] = (bBreak[x.income_type] || 0) + x.alloc_bangun; });
  let catInTable = '<div class="table-wrap" style="margin-top:0; border:none;"><table class="summary-table" style="font-size:13px; width:100%;"><tbody>';
  if (filteredInc.length === 0) { catInTable += '<tr><td colspan="2" style="text-align:center"><div class="empty-state">Tidak ada pemasukan.</div></td></tr>'; } else {
    if (Object.keys(jBreak).length > 0) { catInTable += `<tr><td colspan="2" style="background: var(--empty-bg);"><strong style="color:var(--accent-gold, var(--gold));">Masuk ke Kas Jemaat</strong></td></tr>`; Object.entries(jBreak).forEach(([k, v]) => { catInTable += `<tr style="cursor:pointer;" onclick="openDashboardDetail('income_cat', '${k}', 'jemaat')"><td style="padding-left: 24px;"><span class="badge ${getCatBadge(k, false)}">${k}</span></td><td class="fit-col amount-pos" style="text-align:right">${fmt(v)}</td></tr>`; }); }
    if (Object.keys(dBreak).length > 0) { catInTable += `<tr><td colspan="2" style="background: var(--empty-bg);"><strong style="color:var(--accent-purple, var(--text3));">Masuk ke Kas Daerah</strong></td></tr>`; Object.entries(dBreak).forEach(([k, v]) => { catInTable += `<tr style="cursor:pointer;" onclick="openDashboardDetail('income_cat', '${k}', 'daerah')"><td style="padding-left: 24px;"><span class="badge ${getCatBadge(k, false)}">${k}</span></td><td class="fit-col amount-pos" style="text-align:right">${fmt(v)}</td></tr>`; }); }
    if (Object.keys(bBreak).length > 0) { catInTable += `<tr><td colspan="2" style="background: var(--empty-bg);"><strong style="color:var(--accent-blue, var(--teal-pop));">Masuk ke Pembangunan</strong></td></tr>`; Object.entries(bBreak).forEach(([k, v]) => { catInTable += `<tr style="cursor:pointer;" onclick="openDashboardDetail('income_cat', '${k}', 'bangun')"><td style="padding-left: 24px;"><span class="badge ${getCatBadge(k, false)}">${k}</span></td><td class="fit-col amount-pos" style="text-align:right">${fmt(v)}</td></tr>`; }); }
  }
  document.getElementById('kategoriInTable').innerHTML = catInTable + '</tbody></table></div>';

  const catOutBreak = {}; filteredExp.forEach(x => { if (x.department !== 'Mutasi Kas / Setor Bank') catOutBreak[x.department] = (catOutBreak[x.department] || 0) + x.amount; });
  let catOutTable = '<div class="table-wrap" style="margin-top:0; border:none;"><table class="summary-table" style="font-size:13px; width:100%;"><tbody>';
  if (Object.keys(catOutBreak).length === 0) { catOutTable += '<tr><td colspan="2" style="text-align:center"><div class="empty-state">Tidak ada pengeluaran.</div></td></tr>'; } else { Object.entries(catOutBreak).forEach(([k, v]) => { catOutTable += `<tr style="cursor:pointer;" onclick="openDashboardDetail('expense_cat', '${k}')"><td><span class="badge ${getCatBadge(k, true)}">${k}</span></td><td class="fit-col amount-neg" style="text-align:right">-${fmt(v)}</td></tr>`; }); }
  document.getElementById('kategoriOutTable').innerHTML = catOutTable + '</tbody></table></div>';

  let combined = [...filteredInc.map(x => ({ ...x, kind: 'income', style: 'amount-pos', sign: '+', badge: 'badge-green', label: 'In' })), ...filteredExp.map(x => ({ ...x, kind: 'expense', style: 'amount-neg', sign: '-', badge: 'badge-red', label: 'Out' }))];
  const uUnitsDash = getUserUnits();
  if (currentUser && (hasRole(currentUser, 'Operator') || hasRole(currentUser, 'Diakon')) && uUnitsDash.length > 0) {
    combined = combined.filter(x => {
      const txUnitLower = String(x.unit_name || '').toLowerCase().trim();
      return uUnitsDash.some(u => String(u).toLowerCase().trim() === txUnitLower);
    });
  }
  combined = groupTransactions(combined);
  const recent = combined.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (recent.length === 0) {
    document.getElementById('recentTransContainer').innerHTML = '<div class="empty-state" style="padding:20px; text-align:center;">Belum ada aktivitas.</div>';
  } else {
    let desktopHtml = recent.map(x => {
      const isPrivCategory = isViewer && x.kind === 'income' && isPrivateCategory(x.income_type);
      const shouldHide = isViewer && isPrivCategory;
      let photoBtn = getPhotoBtnIcon(x);
      const shortReceipt = x.receipt_no && x.receipt_no.length > 12 ? x.receipt_no.substring(0, 12) + '…' : x.receipt_no;
      return `<tr><td class="fit-col">${fmtDate(x.date)}</td><td class="fit-col"><span class="badge ${x.badge}">${x.label}</span></td><td style="max-width:250px; white-space:normal; word-wrap:break-word;"><span class="badge ${getCatBadge(x.income_type || x.department, x.kind !== 'income')}">${x.income_type || x.department}</span><br><div style="font-size:12px; color:var(--text-muted, var(--text4)); margin-top:4px;">${shouldHide ? '***' : (x.note || '-')}</div></td><td class="fit-col"><div style="display:flex; align-items:center; gap:6px;"><span class="badge badge-gray" title="${x.receipt_no}" style="width:105px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-block; vertical-align:middle; text-align:center;">${shortReceipt}</span><span style="display:inline-flex;align-items:center;vertical-align:middle;">${photoBtn}</span></div></td><td class="fit-col ${x.style}" style="text-align:right">${x.sign}${fmt(x.amount)}</td></tr>`;
    }).join('');

    let mobileHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column;">' + recent.map(x => {
      const isPrivCategory = isViewer && x.kind === 'income' && isPrivateCategory(x.income_type);
      const shouldHide = isViewer && isPrivCategory;
      const isInc = x.kind === 'income';
      let photoBtn = getPhotoBtnText(x);
      return `
          <div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge ${x.badge}" style="font-size:10px; padding:2px 7px;">${isInc ? 'IN' : 'OUT'}</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no}</span>
              </div>
              <div class="${x.style}" style="font-weight: 700; font-size: 15px; white-space:nowrap;">${x.sign}${fmt(x.amount)}</div>
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
              <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
              <span style="color:var(--text4)">Ket</span><strong style="color:var(--text); font-weight:600;">${x.income_type || x.department}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${shouldHide ? '***' : (x.note || '-')}</span>
            </div>
            ${photoBtn}
          </div>`;
    }).join('') + '</div>';

    document.getElementById('recentTransContainer').innerHTML = `
          <div class="desktop-only" style="width:100%; overflow:hidden;">
            <table class="table-log" style="width:100%; table-layout:auto;">
              <thead><tr><th style="white-space:normal;">Tanggal</th><th>Alur</th><th>Keterangan</th><th style="white-space:normal;">Bukti</th><th style="text-align:right; white-space:normal;">Nominal</th></tr></thead>
              <tbody>${desktopHtml}</tbody>
            </table>
          </div>
          <div class="mobile-only" style="padding-bottom:12px;">${mobileHtml}</div>
        `;
  }

  // Auto-Sync to Pembangunan Server
  if (pembangunanDataCache && parseInt(pembangunanDataCache.terkumpul) !== calcBangun) {
    const payload = {
      action: 'updateInfoWebsite',
      target: pembangunanDataCache.target,
      terkumpul: calcBangun,
      komitmen: pembangunanDataCache.komitmen,
      komitmen_target: pembangunanDataCache.komitmen_target,
      komitmen_realisasi: pembangunanDataCache.komitmen_realisasi,
      bank: pembangunanDataCache.bank,
      norek: pembangunanDataCache.norek,
      atasnama: pembangunanDataCache.atasnama,
      judul: pembangunanDataCache.judul
    };
    fetch(PEMBANGUNAN_URL, { method: 'POST', body: JSON.stringify(payload) })
      .then(() => { pembangunanDataCache.terkumpul = calcBangun; console.log("Synced calcBangun to Pembangunan."); })
      .catch(e => console.error("Failed to sync to Pembangunan", e));
  }
}

function getIncomeTypeConfig(name) { return masterData.incomeTypes.find(x => x.name === name) || null; }

function updateIncomeAlloc() {
  const type = document.getElementById('incType').value; let allocD = 0, allocJ = 0, allocB = 0;
  if (type === 'Perpuluhan') {
    const amtP = parseRupiah(document.getElementById('incAmtPerpuluhan').value); const amtT = parseRupiah(document.getElementById('incAmtTerpadu').value); const amtKJ = parseRupiah(document.getElementById('incAmtKhususJemaat').value); const amtKD = parseRupiah(document.getElementById('incAmtKhususDaerah').value);
    const getPct = (name) => { const cfg = getIncomeTypeConfig(name); return cfg ? { d: cfg.pct_daerah, j: cfg.pct_jemaat, b: cfg.pct_bangun } : { d: 0, j: 0, b: 0 }; };
    const cp = getPct('Perpuluhan'), ct = getPct('Terpadu'), ckj = getPct('Khusus Jemaat'), ckd = getPct('Khusus Daerah');
    allocD = (amtP * cp.d / 100) + (amtT * ct.d / 100) + (amtKJ * ckj.d / 100) + (amtKD * ckd.d / 100);
    allocJ = (amtP * cp.j / 100) + (amtT * ct.j / 100) + (amtKJ * ckj.j / 100) + (amtKD * ckd.j / 100);
    allocB = (amtP * cp.b / 100) + (amtT * ct.b / 100) + (amtKJ * ckj.b / 100) + (amtKD * ckd.b / 100);
  } else {
    const amount = parseRupiah(document.getElementById('incAmount').value); const cfg = getIncomeTypeConfig(type);
    if (cfg) { allocD = amount * cfg.pct_daerah / 100; allocJ = amount * cfg.pct_jemaat / 100; allocB = amount * cfg.pct_bangun / 100; }
  }
  document.getElementById('allocDaerahVal').textContent = fmt(allocD); document.getElementById('allocJemaatVal').textContent = fmt(allocJ); document.getElementById('allocBangunVal').textContent = fmt(allocB);
}

function isReceiptDuplicate(receipt_no, exclude_id = null) {
  if (!receipt_no || receipt_no === '-') return false;
  const allTransactions = [...(cachedIncome || []), ...(cachedExpense || [])];
  return allTransactions.some(x => {
    if (String(x.receipt_no).trim().toLowerCase() !== String(receipt_no).trim().toLowerCase()) return false;
    if (exclude_id) {
      const xId = x.transaction_id || x.receipt_no;
      if (String(xId) === String(exclude_id)) return false;
    }
    return true;
  });
}

async function saveIncomeForm() {
  const date = document.getElementById('incDate').value; const type = document.getElementById('incType').value;
  if (date) {
    const d = new Date(date);
    if (checkMonthClosed(d.getMonth() + 1, d.getFullYear())) { notify('Bulan ini sudah ditutup. Tidak dapat menambah transaksi.', 'error'); return; }
  }
  const unit = document.getElementById('incUnit').value; const giver = document.getElementById('incGiver').value.trim();
  const receipt = document.getElementById('incReceipt').value.trim(); const note = document.getElementById('incNote').value.trim();

  if (!date || !type || !receipt) { notify('Lengkapi data!', 'error'); return; }
  if (isReceiptDuplicate(receipt)) {
    const proceed = await showCustomConfirm('Konfirmasi Kuitansi', 'No. Kuitansi sudah ada! Apakah ini kuitansi kolektif dan Anda tetap ingin menyimpannya?');
    if (!proceed) return;
  }

  const dest = document.getElementById('incDestination') ? document.getElementById('incDestination').value : 'CASH';
  let finalNote = note;
  if (dest === 'BANK') finalNote = '[BANK] ' + note;
  else if (dest === 'CASH') finalNote = '[CASH] ' + note;

  let itemsToProcess = [];
  let amountToProcess = 0;
  let pctD = 0, pctJ = 100, pctB = 0;

  if (type === 'Perpuluhan') {
    ['Perpuluhan', 'Terpadu', 'Khusus Jemaat', 'Khusus Daerah'].forEach(k => { const val = parseRupiah(document.getElementById(`incAmt${k.replace(/\s/g, '')}`).value); if (val > 0) itemsToProcess.push({ income_type: k, amount: val, note: finalNote }); });
    if (itemsToProcess.length === 0) { notify('Isi nominal perpuluhan!', 'error'); return; }
  } else {
    amountToProcess = parseRupiah(document.getElementById('incAmount').value); if (amountToProcess <= 0) { notify('Isi nominal!', 'error'); return; }
    const cfg = getIncomeTypeConfig(type);
    if (cfg) {
      pctD = cfg.pct_daerah; pctJ = cfg.pct_jemaat; pctB = cfg.pct_bangun;
    } else {
      const tLower = type.toLowerCase();
      const isSabat13 = tLower.includes('sabat') && tLower.includes('13');
      const isSabat = tLower.includes('sabat') && !tLower.includes('13');
      if (type === 'Khusus Daerah' || type === 'Perpuluhan' || isSabat13) { pctD = 100; pctJ = 0; }
      else if (type === 'Terpadu' || isSabat) { pctD = 50; pctJ = 50; }
    }
  }

  const btn = document.getElementById('savIncBtn');
  btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Memproses...';
  notify('Transaksi ' + receipt + ' diproses di latar belakang...', 'info');

  // Snapshot foto SEBELUM reset (karena resetPhotoUpload akan mengosongkan array)
  const savedIncPhotos = [...currentIncPhotos];

  // Reset form synchronously
  document.getElementById('incType').value = ''; handleTypeChange(); document.getElementById('incUnit').value = ''; document.getElementById('incGiver').value = ''; document.getElementById('incReceipt').value = ''; document.getElementById('incAmount').value = ''; document.getElementById('incAmtPerpuluhan').value = ''; document.getElementById('incAmtTerpadu').value = ''; document.getElementById('incAmtKhususJemaat').value = ''; document.getElementById('incAmtKhususDaerah').value = ''; document.getElementById('incNote').value = '';
  resetPhotoUpload('income');
  updateIncomeAlloc();
  clearIncomeDraft();
  btn.disabled = false; btn.innerHTML = `Posting Pemasukan`;

  // Async IIFE for background processing
  (async () => {
    try {
      let genBase64 = null;
      // Gunakan snapshot foto (bukan currentIncPhotos yang sudah dikosongkan)
      const photosToSave = [...savedIncPhotos];
      if (type === 'Perpuluhan') {
        try {
          const mappedItems = itemsToProcess.map(x => {
            let alloc_d = 0, alloc_j = 0, alloc_b = 0;
            if (x.income_type === 'Perpuluhan' || x.income_type === 'Khusus Daerah') alloc_d = x.amount;
            else if (x.income_type === 'Terpadu') { alloc_d = x.amount / 2; alloc_j = x.amount / 2; }
            else if (x.income_type === 'Khusus Jemaat') alloc_j = x.amount;
            return { ...x, alloc_daerah: alloc_d, alloc_jemaat: alloc_j, alloc_bangun: alloc_b, date, receipt_no: receipt };
          });
          const htmlStr = generateReceiptHTML('income', { receipt_no: receipt, date, nama_pemberi: giver || 'Umum', unit_name: unit || '-' }, mappedItems);
          genBase64 = await generateReceiptImageBase64(htmlStr);
        } catch (e) { console.error('Failed generating receipt', e); }

        if (genBase64) { photosToSave.unshift(genBase64); if (photosToSave.length > 3) photosToSave.pop(); }

        await apiPost('saveBulkIncome', { date, unit_name: unit || '-', nama_pemberi: giver || 'Umum', receipt_no: receipt, items: itemsToProcess, receipt_photo_base64: photosToSave[0] || '', receipt_photo_base64_2: photosToSave[1] || '', receipt_photo_base64_3: photosToSave[2] || '' });
      } else {
        try {
          const mappedItems = [{
            income_type: type, amount: amountToProcess, note: finalNote, date, receipt_no: receipt,
            alloc_daerah: amountToProcess * (pctD / 100), alloc_jemaat: amountToProcess * (pctJ / 100), alloc_bangun: amountToProcess * (pctB / 100)
          }];
          const htmlStr = generateReceiptHTML('income', { receipt_no: receipt, date, nama_pemberi: giver || 'Umum', unit_name: unit || '-' }, mappedItems);
          genBase64 = await generateReceiptImageBase64(htmlStr);
        } catch (e) { console.error('Failed generating receipt', e); }

        if (genBase64) { photosToSave.unshift(genBase64); if (photosToSave.length > 3) photosToSave.pop(); }

        await apiPost('saveIncome', { date, income_type: type, unit_name: unit || '-', nama_pemberi: giver || 'Umum', receipt_no: receipt, amount: amountToProcess, note: finalNote, alloc_pct_daerah: pctD, alloc_pct_jemaat: pctJ, alloc_pct_bangun: pctB, receipt_photo_base64: photosToSave[0] || '', receipt_photo_base64_2: photosToSave[1] || '', receipt_photo_base64_3: photosToSave[2] || '' });
      }
      notify('Pemasukan ' + receipt + ' berhasil disimpan!', 'success');
      await syncAllData(); renderIncomeList();
    } catch (err) {
      notify('Gagal menyimpan pemasukan ' + receipt + ': ' + err.message, 'error');
    }
  })();
}

function renderIncomeList() {
  const perms = getRolePerms(currentUser?.role || '');
  const isAnon = perms.isAnonymous;
  const list = groupTransactions([...(cachedIncome || []).map(x => ({ ...x }))]).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  if (list.length === 0) {
    document.getElementById('incomeLogContainer').innerHTML = '<div class="empty-state" style="padding:20px; text-align:center;">Kosong.</div>';
  } else {
    let desktopHtml = list.map(x => {
      let nText = x.note || '-';
      let bBadge = '';
      if (nText.includes('[BANK]')) { nText = nText.replace(/\[BANK\]\s?|\s?\[BANK\]/g, ''); bBadge = '<span class="badge badge-green" style="font-size:10px; padding:2px 4px; margin-right:4px;">VIA BANK</span>'; }
      else if (nText.includes('[CASH]')) { nText = nText.replace(/\[CASH\]\s?|\s?\[CASH\]/g, ''); bBadge = '<span class="badge badge-amber" style="font-size:10px; padding:2px 4px; margin-right:4px;">TUNAI</span>'; }
      return `<tr><td class="fit-col">${fmtDate(x.date)}</td><td><span class="badge ${getCatBadge(x.income_type, false)}">${x.income_type}</span><br><span style="font-size:12px; color:var(--text4)">${isAnon ? '***' : (bBadge + nText)}</span></td><td class="fit-col"><span style="font-family:monospace">${x.receipt_no}</span>${getPhotoBtnIcon(x)}</td><td class="fit-col amount-pos" style="text-align:right">+${fmt(x.amount)}</td></tr>`;
    }).join('');

    let mobileHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column;">' + list.map(x => {
      let photoBtn = getPhotoBtnText(x);
      let nText = x.note || '-';
      let bBadge = '';
      if (nText.includes('[BANK]')) { nText = nText.replace(/\[BANK\]\s?|\s?\[BANK\]/g, ''); bBadge = '<span class="badge badge-green" style="font-size:10px; padding:2px 4px; margin-right:4px;">VIA BANK</span>'; }
      else if (nText.includes('[CASH]')) { nText = nText.replace(/\[CASH\]\s?|\s?\[CASH\]/g, ''); bBadge = '<span class="badge badge-amber" style="font-size:10px; padding:2px 4px; margin-right:4px;">TUNAI</span>'; }
      return `
          <div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge badge-blue" style="font-size:10px; padding:2px 7px;">IN</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no}</span>
              </div>
              <div class="amount-pos" style="font-weight: 700; font-size: 15px; white-space:nowrap;">+${fmt(x.amount)}</div>
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
              <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
              <span style="color:var(--text4)">Ket</span><strong style="color:var(--text); font-weight:600;">${x.income_type}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${isAnon ? '***' : (bBadge + nText)}</span>
            </div>
            <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
              ${photoBtn}
            </div>
          </div>`;
    }).join('') + '</div>';

    document.getElementById('incomeLogContainer').innerHTML = `
          <div class="desktop-only" style="width:100%; overflow:hidden;">
            <table class="table-log" style="width:100%; table-layout:auto;">
              <thead><tr><th style="white-space:normal;">Tanggal</th><th>Kategori</th><th style="white-space:normal;">Bukti</th><th style="text-align:right; white-space:normal;">Nominal</th></tr></thead>
              <tbody>${desktopHtml}</tbody>
            </table>
          </div>
          <div class="mobile-only" style="padding-bottom:12px;">${mobileHtml}</div>
        `;
  }
}

function getSaldoForSource(src) {
  if (src === 'Daerah|BANK') return cachedSaldo.bankDaerah;
  if (src === 'Daerah|CASH') return cachedSaldo.tanganDaerah;
  if (src === 'Kas Jemaat|BANK') return cachedSaldo.bankJemaat;
  if (src === 'Kas Jemaat|CASH') return cachedSaldo.tanganJemaat;
  if (src === 'Pembangunan|BANK') return cachedSaldo.bankBangun;
  if (src === 'Pembangunan|CASH') return cachedSaldo.tanganBangun;
  if (src === 'Daerah') return cachedSaldo.daerah;
  if (src === 'Kas Jemaat') return cachedSaldo.jemaat;
  if (src === 'Pembangunan') return cachedSaldo.bangun;
  return 0;
}

function checkSaldo() {
  const src = document.getElementById('expSource').value; const amount = parseRupiah(document.getElementById('expAmount').value);
  let avail = Math.round(getSaldoForSource(src));
  document.getElementById('saldoTersedia').textContent = fmt(avail); document.getElementById('saldoWarning').style.display = amount > avail ? 'flex' : 'none';
}

function checkMutSaldo() {
  const src = document.getElementById('mutSource').value; const amount = parseRupiah(document.getElementById('mutAmount').value);
  let avail = Math.round(getSaldoForSource(src));
  document.getElementById('mutSaldoTersedia').textContent = fmt(avail); document.getElementById('mutSaldoWarning').style.display = amount > avail ? 'flex' : 'none';
}

function showCashTransactions() {
  const src = document.getElementById('mutSource').value;
  const [baseSrc, type] = src.split('|');
  if (type !== 'CASH') return;

  const inc = window.cachedIncome || [];
  const exp = window.cachedExpense || [];
  let history = [];

  inc.forEach(i => {
    if (i.income_type === 'Mutasi Kas / Setor Bank') return;
    const isCashInc = (i.note || '').includes('[CASH]');
    let amount = 0;
    if (baseSrc === 'Daerah') amount = i.alloc_daerah || 0;
    else if (baseSrc === 'Kas Jemaat') amount = i.alloc_jemaat || 0;
    else if (baseSrc === 'Pembangunan') amount = i.alloc_bangun || 0;

    if (amount > 0 && isCashInc === (type === 'CASH')) {
      history.push({ date: i.date, note: i.note, in: amount, out: 0, rawDate: new Date(i.date) });
    }
  });

  exp.forEach(e => {
    const isMutasi = e.department === 'Mutasi Kas / Setor Bank';
    let srcBase = e.source_balance;
    if (srcBase === 'Kas Daerah (Bank)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [BANK]'; }
    if (srcBase === 'Kas Daerah (Di Tangan)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [CASH]'; }
    if (srcBase === 'Kas Jemaat (Bank)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [BANK]'; }
    if (srcBase === 'Kas Jemaat (Di Tangan)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [CASH]'; }
    if (srcBase === 'Kas Pembangunan (Bank)') { srcBase = 'Pembangunan'; e.note = (e.note || '') + ' [BANK]'; }
    if (srcBase === 'Kas Pembangunan (Di Tangan)') { srcBase = 'Pembangunan'; e.note = (e.note || '') + ' [CASH]'; }

    if (srcBase === baseSrc) {
      const isCashExp = (e.note || '').includes('[CASH]');
      if (!isMutasi && isCashExp) {
        history.push({ date: e.date, note: e.note, in: 0, out: e.amount, rawDate: new Date(e.date) });
      } else if (isMutasi) {
        history.push({ date: e.date, note: e.note, in: 0, out: e.amount, rawDate: new Date(e.date) });
      }
    }
  });

  history.sort((a, b) => a.rawDate - b.rawDate);
  let runSaldo = 0;
  let html = '';
  history.forEach(h => {
    runSaldo += h.in;
    runSaldo -= h.out;
    html += `<tr><td>${(h.date || '').substring(0, 10)}</td><td>${h.note || ''}</td><td style="text-align:right">${h.in > 0 ? fmt(h.in) : '-'}</td><td style="text-align:right">${h.out > 0 ? fmt(h.out) : '-'}</td><td style="text-align:right">${fmt(runSaldo)}</td></tr>`;
  });

  if (history.length === 0) {
    html = `<tr><td colspan="5" style="text-align:center">Belum ada mutasi cash untuk sumber ini.</td></tr>`;
  }

  const tbody = document.getElementById('ledgerTableBody');
  if (tbody) tbody.innerHTML = html;

  const subTitle = document.getElementById('ledgerSubTitle');
  const srcOpt = document.querySelector('#mutSource option:checked');
  if (subTitle && srcOpt) subTitle.innerText = 'Sumber: ' + srcOpt.text;

  const modal = document.getElementById('ledgerModal');
  if (modal) modal.style.display = 'flex';
}

function hideLedgerModal() {
  const modal = document.getElementById('ledgerModal');
  if (modal) modal.style.display = 'none';
}

async function saveExpenseForm() {
  const date = document.getElementById('expDate').value; const dept = document.getElementById('expDept').value;
  if (date) {
    const d = new Date(date);
    if (checkMonthClosed(d.getMonth() + 1, d.getFullYear())) { notify('Bulan ini sudah ditutup. Tidak dapat menambah transaksi.', 'error'); return; }
  }
  const rawSrc = document.getElementById('expSource').value;
  const receipt = document.getElementById('expReceipt').value.trim();
  const amount = parseRupiah(document.getElementById('expAmount').value);
  let note = document.getElementById('expNote').value.trim();
  const receiver = document.getElementById('expReceiver').value.trim();

  const [src, type] = rawSrc.includes('|') ? rawSrc.split('|') : [rawSrc, ''];
  if (type === 'BANK' && !note.includes('[BANK]')) note = (note + ' [BANK]').trim();
  if (type === 'CASH' && !note.includes('[CASH]')) note = (note + ' [CASH]').trim();

  if (!date || !dept || !receipt || amount <= 0) { notify('Lengkapi data!', 'error'); return; }
  if (isReceiptDuplicate(receipt)) {
    const proceed = await showCustomConfirm('Konfirmasi Kuitansi', 'No. Bukti/Kuitansi sudah ada! Apakah ini kuitansi kolektif dan Anda tetap ingin menyimpannya?');
    if (!proceed) return;
  }
  let avail = Math.round(getSaldoForSource(rawSrc));
  if (amount > avail) { notify('Saldo tidak cukup!', 'error'); return; }

  const btn = document.getElementById('savExpBtn');
  btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Memproses...';
  notify('Transaksi ' + receipt + ' diproses di latar belakang...', 'info');

  // Snapshot foto SEBELUM reset
  const savedExpPhotos = [...currentExpPhotos];

  // Reset UI synchronously
  document.getElementById('expDept').value = ''; document.getElementById('expReceipt').value = ''; document.getElementById('expAmount').value = ''; document.getElementById('expNote').value = ''; document.getElementById('expReceiver').value = '';
  resetPhotoUpload('expense');
  clearExpenseDraft();
  btn.disabled = false; btn.innerHTML = `Posting Pengeluaran`;

  // Async IIFE for background processing
  (async () => {
    try {
      const photosToSave = [...savedExpPhotos];
      try {
        const mappedItems = [{
          department: dept, amount, note, date, receipt_no: receipt
        }];
        const htmlStr = generateReceiptHTML('expense', { receipt_no: receipt, date, nama_penerima: receiver || '-' }, mappedItems);
        let genBase64 = await generateReceiptImageBase64(htmlStr);
        if (genBase64) { photosToSave.unshift(genBase64); if (photosToSave.length > 3) photosToSave.pop(); }
      } catch (e) { console.error('Failed generating receipt', e); }

      await apiPost('saveExpense', { date, department: dept, source_balance: src, receipt_no: receipt, amount, note, receipt_photo_base64: photosToSave[0] || '', receipt_photo_base64_2: photosToSave[1] || '', receipt_photo_base64_3: photosToSave[2] || '', nama_penerima: receiver || '-' });
      notify('Pengeluaran ' + receipt + ' berhasil disimpan!', 'success');
      await syncAllData(); renderExpenseList();
    } catch (err) {
      notify('Gagal menyimpan pengeluaran ' + receipt + ': ' + err.message, 'error');
    }
  })();
}

async function saveMutasiForm() {
  const date = document.getElementById('mutDate').value;
  const dept = 'Mutasi Kas / Setor Bank';
  if (date) {
    const d = new Date(date);
    if (checkMonthClosed(d.getMonth() + 1, d.getFullYear())) { notify('Bulan ini sudah ditutup. Tidak dapat mutasi.', 'error'); return; }
  }
  const rawSrc = document.getElementById('mutSource').value;
  const receipt = document.getElementById('mutReceipt').value.trim();
  const amount = parseRupiah(document.getElementById('mutAmount').value);
  let note = document.getElementById('mutNote').value.trim();
  const receiver = 'Kas Utama (Bank)';

  const [src, type] = rawSrc.includes('|') ? rawSrc.split('|') : [rawSrc, ''];
  if (type === 'BANK' && !note.includes('[BANK]')) note = (note + ' [BANK]').trim();
  if (type === 'CASH' && !note.includes('[CASH]')) note = (note + ' [CASH]').trim();

  if (!date || !receipt || amount <= 0) { notify('Lengkapi data!', 'error'); return; }
  if (isReceiptDuplicate(receipt)) {
    const proceed = await showCustomConfirm('Konfirmasi Kuitansi', 'No. Bukti Setor sudah ada! Apakah Anda tetap ingin menyimpannya?');
    if (!proceed) return;
  }
  let avail = Math.round(getSaldoForSource(rawSrc));
  if (amount > avail) { notify('Saldo tidak cukup!', 'error'); return; }

  const btn = document.getElementById('savMutBtn');
  btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Memproses...';
  notify('Transaksi ' + receipt + ' diproses di latar belakang...', 'info');

  // Snapshot foto SEBELUM reset
  const savedMutPhotos = [...currentMutPhotos];

  // Reset form synchronously
  document.getElementById('mutReceipt').value = ''; document.getElementById('mutAmount').value = ''; document.getElementById('mutNote').value = '';
  resetPhotoUpload('mutasi');
  btn.disabled = false; btn.innerHTML = `Proses Setoran Bank`;

  // Async IIFE for background processing
  (async () => {
    try {
      const photosToSave = [...savedMutPhotos];
      try {
        const mappedItems = [{
          department: dept, amount, note, date, receipt_no: receipt
        }];
        const htmlStr = generateReceiptHTML('mutasi', { receipt_no: receipt, date, nama_penerima: receiver }, mappedItems);
        let genBase64 = await generateReceiptImageBase64(htmlStr);
        if (genBase64) { photosToSave.unshift(genBase64); if (photosToSave.length > 3) photosToSave.pop(); }
      } catch (e) { console.error('Failed generating receipt', e); }

      await apiPost('saveExpense', { date, department: dept, source_balance: src, receipt_no: receipt, amount, note, receipt_photo_base64: photosToSave[0] || '', receipt_photo_base64_2: photosToSave[1] || '', receipt_photo_base64_3: photosToSave[2] || '', nama_penerima: receiver, approved_by: 'Admin,Ketua Jemaat,Pendeta' });
      notify('Mutasi ' + receipt + ' berhasil Setor ke Bank!', 'success');
      await syncAllData(); renderMutasiList();
    } catch (err) {
      notify('Gagal menyimpan mutasi ' + receipt + ': ' + err.message, 'error');
    }
  })();
}

function renderExpenseList() {
  const perms = getRolePerms(currentUser?.role || '');
  const isAnon = perms.isAnonymous;
  const list = [...cachedExpense].filter(x => x.department !== 'Mutasi Kas / Setor Bank').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  if (list.length === 0) {
    document.getElementById('expenseLogContainer').innerHTML = '<div class="empty-state" style="padding:20px; text-align:center;">Kosong.</div>';
  } else {
    let desktopHtml = list.map(x => `<tr><td class="fit-col">${fmtDate(x.date)}</td><td><span class="badge ${getCatBadge(x.department, true)}">${x.department}</span><br><span style="font-size:12px; color:var(--text4)">${isAnon ? '***' : (x.note || '-')}<br>Penerima: ${isAnon ? '***' : (x.nama_penerima || '-')}</span></td><td class="fit-col"><span class="badge badge-gray">${x.receipt_no}</span>${getPhotoBtnIcon(x)}</td><td class="fit-col amount-neg" style="text-align:right">-${fmt(x.amount)}</td></tr>`).join('');

    let mobileHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column;">' + list.map(x => {
      let photoBtn = getPhotoBtnText(x);
      return `
          <div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge badge-red" style="font-size:10px; padding:2px 7px;">OUT</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no}</span>
              </div>
              <div class="amount-neg" style="font-weight: 700; font-size: 15px; white-space:nowrap;">-${fmt(x.amount)}</div>
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
              <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
              <span style="color:var(--text4)">Pihak</span><strong style="color:var(--text); font-weight:600; overflow:hidden; text-overflow:ellipsis;">${isAnon ? '***' : (x.nama_penerima || '-')}</strong>
              <span style="color:var(--text4)">Ket</span><strong style="color:var(--text); font-weight:600;">${x.department}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${isAnon ? '***' : (x.note || '-')}</span>
            </div>
            <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
              ${photoBtn}
            </div>
          </div>`;
    }).join('') + '</div>';

    document.getElementById('expenseLogContainer').innerHTML = `
          <div class="desktop-only" style="width:100%; overflow:hidden;">
            <table class="table-log" style="width:100%; table-layout:auto;">
              <thead><tr><th class="fit-col">Tanggal</th><th>Bidang</th><th class="fit-col">Bukti</th><th class="fit-col" style="text-align:right">Nominal</th></tr></thead>
              <tbody>${desktopHtml}</tbody>
            </table>
          </div>
          <div class="mobile-only" style="padding-bottom:12px;">${mobileHtml}</div>
        `;
  }
}

function renderMutasiList() {
  const perms = getRolePerms(currentUser?.role || '');
  const isAnon = perms.isAnonymous;
  const resultDiv = document.getElementById('mutasiLogContainer');
  if (!resultDiv) return;
  let list = (cachedExpense || []).filter(x => x.department === 'Mutasi Kas / Setor Bank');
  list.sort((a, b) => new Date(b.date) - new Date(a.date));
  list = list.slice(0, 15);
  if (list.length === 0) {
    resultDiv.innerHTML = '<div class="empty-state" style="padding:20px; text-align:center;">Belum ada mutasi setoran bank.</div>';
  } else {
    let desktopHtml = list.map(x => {
      let srcName = x.source_balance || '-';
      if (srcName !== '-' && !srcName.toLowerCase().startsWith('kas ')) srcName = 'Kas ' + srcName;
      let dariKe = `<span style="font-size:11px; font-weight:600; color:var(--text);"><span style="color:var(--text3)">Dari:</span> ${srcName} &rarr; <span style="color:var(--text3)">Ke:</span> ${x.nama_penerima || 'Kas Utama (Bank)'}</span><br>`;
      return `<tr><td class="fit-col">${fmtDate(x.date)}</td><td>${dariKe}<span style="font-size:12px; color:var(--text4)">${isAnon ? '***' : (x.note || '-')}</span></td><td class="fit-col"><span style="font-family:monospace">${x.receipt_no}</span>${getPhotoBtnIcon(x)}</td><td class="fit-col amount-pos" style="text-align:right">+${fmt(x.amount)}</td></tr>`;
    }).join('');

    let mobileHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column;">' + list.map(x => {
      let photoBtn = getPhotoBtnText(x);
      let srcName = x.source_balance || '-';
      if (srcName !== '-' && !srcName.toLowerCase().startsWith('kas ')) srcName = 'Kas ' + srcName;
      return `
          <div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge badge-blue" style="font-size:10px; padding:2px 7px;">MUT</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no}</span>
              </div>
              <div class="amount-pos" style="font-weight: 700; font-size: 15px; white-space:nowrap;">+${fmt(x.amount)}</div>
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
              <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
              <span style="color:var(--text4)">Rute</span><strong style="color:var(--text); font-weight:600;">Dari: ${srcName} &rarr; Ke: ${x.nama_penerima || 'Kas Utama (Bank)'}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${isAnon ? '***' : (x.note || '-')}</span>
            </div>
            <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
              ${photoBtn}
            </div>
          </div>`;
    }).join('') + '</div>';

    resultDiv.innerHTML = `
          <div class="desktop-only" style="width:100%; overflow:hidden;">
            <table class="table-log" style="width:100%; table-layout:auto;">
              <thead><tr><th style="white-space:normal;">Tanggal</th><th>Keterangan</th><th style="white-space:normal;">Bukti</th><th style="text-align:right; white-space:normal;">Nominal</th></tr></thead>
              <tbody>${desktopHtml}</tbody>
            </table>
          </div>
          <div class="mobile-only" style="padding-bottom:12px;">${mobileHtml}</div>
        `;
  }
}

async function loadReport() {
  const month = parseInt(document.getElementById('rptMonth').value);
  const year = parseInt(document.getElementById('rptYear').value);
  const mode = document.getElementById('rptMode') ? document.getElementById('rptMode').value : 'bulanan';
  const rc = document.getElementById('reportContent');

  rc.innerHTML = '<div style="text-align:center; padding:40px;"><span class="spinner"></span> Menyusun Laporan...</div>';

  try {
    // Calculate locally to support "Akumulasi dari awal" instantly
    let totalInc = 0; let totalExp = 0;
    const incByCat = {}; const expByDept = {};

    let saldoAwal = (cachedSaldo.initJemaat || 0) + (cachedSaldo.initDaerah || 0);

    let saldoAwalJemaat = cachedSaldo.initJemaat || 0;

    if (mode === 'bulanan') {
      const isBefore = (dateStr) => {
        const d = new Date(dateStr);
        if (year !== 0 && d.getFullYear() < year) return true;
        if (year !== 0 && d.getFullYear() === year && month !== 0 && (d.getMonth() + 1) < month) return true;
        return false;
      };
      (cachedIncome || []).forEach(x => {
        if (x.income_type === 'Mutasi Kas / Setor Bank') return;
        if (isBefore(x.date)) {
          let amtUmum = parseFloat(x.amount || 0) - parseFloat(x.alloc_bangun || 0);
          if (amtUmum > 0) {
            saldoAwal += amtUmum;

            // PREFER EXPLICIT ALLOC IF IT EXISTS, FALLBACK TO MATH
            let jemaatAmt = 0;
            if (x.alloc_jemaat !== undefined && x.alloc_jemaat !== null && x.alloc_jemaat !== '') {
              jemaatAmt = parseFloat(x.alloc_jemaat) || 0;
            } else {
              const t = x.income_type || '';
              const tLower = t.toLowerCase();
              const isSabat13 = tLower.includes('sabat') && tLower.includes('13');
              const isSabat = tLower.includes('sabat') && !tLower.includes('13');

              if (t === 'Perpuluhan' || t === 'Khusus Daerah' || isSabat13) {
                jemaatAmt = 0;
              } else if (t === 'Terpadu' || isSabat) {
                jemaatAmt = amtUmum * 0.5;
              } else if (t !== 'Saldo Awal Sistem' && t !== 'Saldo Awal') {
                jemaatAmt = amtUmum;
              }
            }

            saldoAwalJemaat += jemaatAmt;
          }
        }
      });
      (cachedExpense || []).forEach(x => {
        const isMutasi = x.department === 'Mutasi Kas / Setor Bank';
        if (isBefore(x.date) && x.source_balance !== 'Pembangunan' && !isMutasi) {
          saldoAwal -= parseFloat(x.amount || 0);
          const sb = x.source_balance || '';
          if (sb === 'Kas Jemaat' || sb === 'Kas Jemaat (Di Tangan)' || sb === 'Kas Jemaat (Bank)') {
            saldoAwalJemaat -= parseFloat(x.amount || 0);
          }
        }
      });
    }

    const isMatch = (dateStr) => {
      const d = new Date(dateStr);
      if (mode === 'akumulasi') {
        if (year !== 0) {
          if (d.getFullYear() > year) return false;
          if (d.getFullYear() === year && month !== 0 && (d.getMonth() + 1) > month) return false;
        }
        return true;
      } else {
        if (year !== 0 && d.getFullYear() !== year) return false;
        if (month !== 0 && (d.getMonth() + 1) !== month) return false;
        return true;
      }
    };

    (cachedIncome || []).filter(x => isMatch(x.date)).forEach(x => {
      if (x.income_type === 'Mutasi Kas / Setor Bank') return;

      let amtUmum = parseFloat(x.amount || 0) - parseFloat(x.alloc_bangun || 0);
      if (amtUmum <= 0) return; // Entirely for pembangunan, skip it here.

      let clone = { ...x, amount: amtUmum };
      const cat = clone.income_type || 'Lainnya';
      if (!incByCat[cat]) incByCat[cat] = [];
      incByCat[cat].push(clone);
      totalInc += amtUmum;
    });

    (cachedExpense || []).filter(x => isMatch(x.date)).forEach(x => {
      if (x.source_balance === 'Pembangunan') return;
      if (x.department === 'Mutasi Kas / Setor Bank') return;
      const dept = x.department || 'Lainnya';
      if (!expByDept[dept]) expByDept[dept] = [];
      expByDept[dept].push(x);
      totalExp += parseFloat(x.amount || 0);
    });

    currentReportData = {
      summary: {
        saldoAwal: saldoAwal,
        saldoAwalJemaat: saldoAwalJemaat,
        periodIncome: totalInc,
        totalIncome: totalInc + saldoAwal,
        totalExpense: totalExp,
        netBalance: totalInc + saldoAwal - totalExp,
        balances: cachedSaldo || { total: 0 }
      },
      incByCategory: incByCat,
      expByDept: expByDept,
      month: month,
      year: year,
      mode: mode
    };

    renderReportView();
    const exportMenu = document.getElementById('btnExportMenu');
    if (exportMenu) exportMenu.style.display = 'inline-block';
    const printMenu = document.getElementById('btnPrintMenu');
    if (printMenu) printMenu.style.display = 'inline-block';
    const partisipasiBtn = document.getElementById('btnModalPartisipasi');
    if (partisipasiBtn) {
      const allowedRoles = ['Admin', 'Bendahara', 'Ketua Jemaat', 'Pendeta', 'Gembala'];
      if (currentUser && allowedRoles.includes(currentUser.role)) {
        partisipasiBtn.style.display = 'block';
      } else {
        partisipasiBtn.style.display = 'none';
      }
    }
  } catch (e) {
    rc.innerHTML = `<div style="text-align:center; padding:20px; color:var(--red-pop)">Gagal memuat: ${e.message}</div>`;
  }
}

// [Report Generation & Export extracted to ./modules/reportExportService.js]

function applyReportSensor() {
  if (currentReportData) renderReportView();
}

function openClosingModal() {
  const modal = document.getElementById('closingMonthModal');
  const mSel = document.getElementById('closingMonthSelect');
  const yInp = document.getElementById('closingYearInput');

  const d = new Date();
  mSel.value = d.getMonth() + 1;
  yInp.value = d.getFullYear();

  if (currentReportData && currentReportData.month > 0 && currentReportData.year > 0) {
    mSel.value = currentReportData.month;
    yInp.value = currentReportData.year;
  }

  updateClosingModalStatus();
  modal.style.display = 'flex';
}

function closeClosingModal() {
  document.getElementById('closingMonthModal').style.display = 'none';
}

function updateClosingModalStatus() {
  const month = document.getElementById('closingMonthSelect').value;
  const year = document.getElementById('closingYearInput').value;
  const key = `closed_${year}_${month}`;
  const isClosed = String(systemConfig[key]) === 'true';

  const statusEl = document.getElementById('closingModalStatus');
  const btn = document.getElementById('btnToggleClosingModal');

  if (isClosed) {
    statusEl.innerHTML = '<span style="color:var(--red-pop);">Terkunci (Ditutup)</span>';
    btn.textContent = 'Buka Buku';
    btn.className = 'btn btn-outline';
  } else {
    statusEl.innerHTML = '<span style="color:var(--green-pop);">Terbuka (Bisa Diedit)</span>';
    btn.textContent = 'Tutup Buku';
    btn.className = 'btn btn-danger';
  }
}

async function toggleCloseMonthFromModal() {
  const month = document.getElementById('closingMonthSelect').value;
  const year = document.getElementById('closingYearInput').value;
  const key = `closed_${year}_${month}`;
  const isClosed = String(systemConfig[key]) === 'true';

  const mNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthName = mNames[parseInt(month)];

  const msg = isClosed
    ? `Buka kembali buku bulan ${monthName} ${year}?`
    : `Tutup buku bulan ${monthName} ${year}? Setelah ditutup, transaksi pada bulan ini tidak bisa ditambah, diedit, atau dihapus.`;

  if (await showCustomConfirm(isClosed ? 'Buka Buku' : 'Tutup Buku', msg)) {
    const newVal = isClosed ? 'false' : 'true';
    systemConfig[key] = newVal;
    localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
    try {
      await apiPostWithFallback('saveConfig', { key: key, value: newVal });
      notify(`Bulan ${monthName} ${year} berhasil ${isClosed ? 'dibuka' : 'ditutup'}.`, 'success');
      updateClosingModalStatus();
      if (currentReportData) renderReportView(); // update background if open
    } catch (e) {
      notify('Gagal menyimpan status tutup buku: ' + e.message, 'error');
    }
  }
}

function checkMonthClosed(month, year) {
  if (!month || !year) return false;
  return String(systemConfig[`closed_${year}_${month}`]) === 'true';
}

function renderReportView() {
  const data = currentReportData; if (!data) return notify('Tidak ada data laporan aktif.', 'error');
  const s = data.summary; const bal = s.balances || cachedSaldo || { total: 0 };
  const isViewer = getRolePerms(currentUser?.role || '').isAnonymous || (currentUser && (hasRole(currentUser, 'Viewer') || hasRole(currentUser, 'Publik')));

  const rolePerms = currentUser ? getRolePerms(currentUser?.role || '') : null;
  const canApprove = rolePerms && rolePerms.menus && rolePerms.menus.riwayat && rolePerms.menus.riwayat.approve;
  const isApprover = currentUser && (canApprove || hasRole(currentUser, 'Admin'));

  const mNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const isSensor = document.getElementById('sensorUnit') ? document.getElementById('sensorUnit').checked : false;

  const btnManage = document.getElementById('btnManageClosing');
  if (btnManage) {
    if (currentUser && hasRole(currentUser, 'Admin')) {
      btnManage.style.display = 'inline-block';
    } else {
      btnManage.style.display = 'none';
    }
  }

  const title = data.customTitle || "FINANCIAL REPORT";
  document.getElementById('reportContent').innerHTML = generateComplexReportHtml(false);

  const pmbContainer = document.getElementById('reportContentPembangunan');
  if (pmbContainer) {
    if (data.mode === 'akumulasi') {
      pmbContainer.innerHTML = '<div style="text-align:center; padding:40px; font-weight:600; color:var(--text3);">Laporan Pembangunan hanya tersedia pada Mode Bulanan</div>';
    } else {
      pmbContainer.innerHTML = generatePembangunanReportHtml(data, false);
    }
  }
}

function switchReportTab(tabId) {
  document.querySelectorAll('.report-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('#reportContentContainer .tab-panel').forEach(panel => panel.classList.remove('active'));

  if (tabId === 'umum') {
    document.getElementById('tabLaporanUmum').classList.add('active');
    document.getElementById('reportContent').classList.add('active');
  } else if (tabId === 'pembangunan') {
    document.getElementById('tabLaporanPembangunan').classList.add('active');
    document.getElementById('reportContentPembangunan').classList.add('active');
  }
}

let historySortCol = 'date';
let historySortDesc = true;
function toggleSortHistory(col) {
  if (historySortCol === col) {
    historySortDesc = !historySortDesc;
  } else {
    historySortCol = col;
    historySortDesc = true;
  }
  historyCurrentPage = 1; // Reset page on sort
  renderHistory();
}

let historyCurrentPage = 1;
const historyItemsPerPage = 20;

function changeHistoryPage(page) {
  historyCurrentPage = page;
  renderHistory();
}
window.changeHistoryPage = changeHistoryPage;

function renderHistory() {
  const q = document.getElementById('searchTrans').value.toLowerCase();
  const type = document.getElementById('filterType').value; const month = parseInt(document.getElementById('filterMonth')?.value || 0); const year = parseInt(document.getElementById('filterYear')?.value || 0);
  const filterApproval = document.getElementById('filterApproval')?.value || '';

  let list = [];
  if (type === '' || type === 'income' || type === 'mutasi') (cachedIncome || []).forEach(x => {
    if (x.income_type === 'Mutasi Kas / Setor Bank') return;
    if (type === '' || type === 'income') {
      list.push({ ...x, type: 'income', badge: 'badge-green', label: 'In', style: 'amount-pos', sign: '+' });
    }
  });
  if (type === '' || type === 'expense' || type === 'mutasi') (cachedExpense || []).forEach(x => {
    if (x.department === 'Mutasi Kas / Setor Bank') {
      if (type === '' || type === 'mutasi') {
        list.push({ ...x, type: 'expense', badge: 'badge-blue', label: 'Mut', style: 'amount-pos', sign: '+' });
      }
    } else {
      if (type === '' || type === 'expense') {
        list.push({ ...x, type: 'expense', badge: 'badge-red', label: 'Out', style: 'amount-neg', sign: '-' });
      }
    }
  });

  list = list.filter(x => {
    const d = new Date(x.date);
    if (year !== 0 && d.getFullYear() !== year) return false;
    if (month !== 0 && (d.getMonth() + 1) !== month) return false;

    if (filterApproval) {
      const isAdminApp = x.approved_by && x.approved_by.includes('Admin');
      const isKetua = x.approved_by && x.approved_by.includes('Ketua Jemaat');
      const isPendeta = x.approved_by && x.approved_by.includes('Pendeta');
      const isApproved = isAdminApp || (isKetua && isPendeta);
      if (filterApproval === 'pending' && isApproved) return false;
      if (filterApproval === 'approved' && !isApproved) return false;
    }

    const canSearchNames = currentUser && (hasRole(currentUser, 'Admin') || hasRole(currentUser, 'Bendahara'));

    if (q) {
      let m = false;
      if (String(x.receipt_no || '').toLowerCase().includes(q)) m = true;
      if (String(x.note || '').toLowerCase().includes(q)) m = true;
      if (String(x.income_type || '').toLowerCase().includes(q)) m = true;
      if (String(x.department || '').toLowerCase().includes(q)) m = true;
      if (String(x.amount || '').includes(q)) m = true;
      if (String(x.unit_name || '').toLowerCase().includes(q)) m = true;
      if (masterData && masterData.units) {
        const matchedUnitNames = masterData.units.filter(u => String(u.id || '').toLowerCase().includes(q)).map(u => String(u.name).toLowerCase());
        if (matchedUnitNames.includes(String(x.unit_name || '').toLowerCase())) m = true;
      }
      if (canSearchNames) {
        if (String(x.nama_pemberi || '').toLowerCase().includes(q)) m = true;
        if (String(x.nama_penerima || '').toLowerCase().includes(q)) m = true;
      }
      if (!m) return false;
    }

    const userUnits = getUserUnits();
    if (myUnitFilterActive && userUnits.length > 0) {
      if (!userUnits.includes(x.unit_name)) return false;
    }

    return true;
  });

  list = groupTransactions(list);

  list.sort((a, b) => {
    let valA, valB;
    if (historySortCol === 'date') {
      valA = new Date(a.date).getTime(); valB = new Date(b.date).getTime();
    } else if (historySortCol === 'type') {
      valA = a.type; valB = b.type;
    } else if (historySortCol === 'category') {
      valA = String(a.income_type || a.department || '').toLowerCase(); valB = String(b.income_type || b.department || '').toLowerCase();
    } else if (historySortCol === 'receipt') {
      valA = String(a.receipt_no || '').toLowerCase(); valB = String(b.receipt_no || '').toLowerCase();
    } else if (historySortCol === 'pihak') {
      valA = String(a.nama_pemberi || a.nama_penerima || '').toLowerCase(); valB = String(b.nama_pemberi || b.nama_penerima || '').toLowerCase();
    } else if (historySortCol === 'amount') {
      valA = a.amount || 0; valB = b.amount || 0;
    }

    if (typeof valA === 'string' && typeof valB === 'string') {
      const cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      if (cmp < 0) return historySortDesc ? 1 : -1;
      if (cmp > 0) return historySortDesc ? -1 : 1;
      return 0;
    } else {
      if (valA < valB) return historySortDesc ? 1 : -1;
      if (valA > valB) return historySortDesc ? -1 : 1;
      return 0;
    }
  });

  window.currentHistoryData = list;

  const rolePerms = currentUser ? getRolePerms(currentUser?.role || '') : null;
  const canApprove = rolePerms && rolePerms.menus && rolePerms.menus.riwayat && rolePerms.menus.riwayat.approve;
  const isApprover = currentUser && (canApprove || hasRole(currentUser, 'Admin'));
  const roleNeeded = currentUser ? currentUser.role : '';

  let pendingToApprove = [];
  if (isApprover) {
    pendingToApprove = list.filter(x => {
      const isMutasi = x.department === 'Mutasi Kas / Setor Bank' || x.income_type === 'Mutasi Kas / Setor Bank';
      if (isMutasi) return false;

      const deleteId = x.transaction_id || x.receipt_no || '';
      if (!deleteId) return false;
      const isFullyApproved = x.approved_by && (x.approved_by.includes('Admin') || (x.approved_by.includes('Ketua Jemaat') && x.approved_by.includes('Pendeta')));
      if (isFullyApproved) return false;
      if (!x.approved_by || !x.approved_by.includes(roleNeeded)) return true;
      return false;
    });
  }

  const btnApproveBulk = document.getElementById('btnApproveBulk');
  if (btnApproveBulk) {
    if (pendingToApprove.length > 0) {
      btnApproveBulk.style.display = 'inline-flex';
      btnApproveBulk.innerHTML = `${safeIcon('check', 'lucide-sm')} <span>Approve Semua (${pendingToApprove.length})</span>`;
      window.pendingBulkApproveList = pendingToApprove.map(x => ({ type: x.type, id: x.transaction_id || x.receipt_no }));
    } else {
      btnApproveBulk.style.display = 'none';
      window.pendingBulkApproveList = [];
    }
  }

  const printBtn = document.getElementById('btnPrintUnit');
  if (printBtn) {
    printBtn.style.display = (q || month > 0 || year > 0 || filterApproval) ? 'inline-flex' : 'none';
  }

  const perms = getRolePerms(currentUser?.role || '');
  const mRiwayat = perms.menus.riwayat || { view: true, edit: false, del: false };
  const mPindahBuku = perms.menus.pindahbuku || { view: false, edit: false, del: false };
  const isAdmin = hasRole(currentUser, 'Admin');
  const canEdit = mRiwayat.edit || isAdmin;
  const canDel = mRiwayat.del || isAdmin;
  const isViewer = getRolePerms(currentUser?.role || '').isAnonymous || (currentUser && (hasRole(currentUser, 'Viewer') || hasRole(currentUser, 'Publik')));
  const isAnon = perms.isAnonymous;

  let sumIn = 0; let sumOut = 0;
  const monthlyBreak = {}; // { 'Jan 2025': {inc:0, exp:0} }
  const catBreakIn = {}; // { 'Perpuluhan': 1234 }
  const catBreakOut = {}; // { 'Gaji': 5678 }
  const mNamesShort = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  list.forEach(x => {
    if (x.type === 'income') { sumIn += x.amount; const cat = x.income_type || 'Lainnya'; catBreakIn[cat] = (catBreakIn[cat] || 0) + x.amount; }
    else if (x.type === 'expense') {
      const isMutasi = x.department === 'Mutasi Kas / Setor Bank';
      if (!isMutasi) {
        sumOut += x.amount; const cat = x.department || 'Lainnya'; catBreakOut[cat] = (catBreakOut[cat] || 0) + x.amount;
      }
    }

    const isMut = x.department === 'Mutasi Kas / Setor Bank';
    if (!isMut) {
      const d = new Date(x.date); const mKey = `${mNamesShort[d.getMonth() + 1]} ${d.getFullYear()}`;
      if (!monthlyBreak[mKey]) monthlyBreak[mKey] = { inc: 0, exp: 0 };
      if (x.type === 'income') monthlyBreak[mKey].inc += x.amount; else monthlyBreak[mKey].exp += x.amount;
    }
  });
  let summaryHtml = '';
  if (myUnitFilterActive || q || month > 0 || year > 0) {
    let totalNeedsApprove = list.filter(x => x.transaction_id || x.receipt_no).length;
    let totalApproved = list.filter(x => x.approved_by && (x.approved_by.includes('Admin') || (x.approved_by.includes('Ketua Jemaat') && x.approved_by.includes('Pendeta')))).length;

    // --- Top summary cards with proper gap ---
    summaryHtml = `
          <div style="margin-bottom:16px; padding:16px 20px; background:var(--input-bg); border:1px solid var(--glass-border); border-radius:var(--radius-lg); overflow:hidden;">
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:16px 24px;">
              <div>
                <div style="font-size:12px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Pemasukan</div>
                <div class="amount-pos" style="font-size:18px; font-weight:800; font-family:monospace; word-break:break-all;">+${fmt(sumIn)}</div>
              </div>
              <div>
                <div style="font-size:12px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Pengeluaran</div>
                <div class="amount-neg" style="font-size:18px; font-weight:800; font-family:monospace; word-break:break-all;">-${fmt(sumOut)}</div>
              </div>
              <div>
                <div style="font-size:12px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Bersih</div>
                <div style="font-size:18px; font-weight:800; font-family:monospace; word-break:break-all; color:${(sumIn - sumOut) >= 0 ? 'var(--accent-green)' : 'var(--accent-orange)'}">${fmt(sumIn - sumOut)}</div>
              </div>
              <div>
                <div style="font-size:12px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Total Data</div>
                <div style="font-size:18px; font-weight:800; font-family:monospace; color:var(--text)">${list.length} Baris</div>
              </div>
              <div>
                <div style="font-size:12px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Telah Disetujui</div>
                <div style="font-size:18px; font-weight:800; font-family:monospace; color:${totalApproved === totalNeedsApprove && totalNeedsApprove > 0 ? 'var(--accent-green)' : 'var(--text)'}">${totalApproved} / ${totalNeedsApprove}</div>
              </div>
            </div>`;

    // --- Per-month breakdown ---
    const monthKeys = Object.keys(monthlyBreak);
    if (monthKeys.length > 1) {
      summaryHtml += `
            <div style="margin-top:14px; border-top:1px solid var(--glass-border); padding-top:12px;">
              <div style="font-size:12px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Rincian Per Bulan</div>
              
              <div class="desktop-only">
                <table style="font-size:13px; width:100%; border-collapse:collapse; table-layout:fixed;">
                  <colgroup><col style="width:22%"><col style="width:26%"><col style="width:26%"><col style="width:26%"></colgroup>
                  <thead><tr style="border-bottom:1px solid var(--glass-border);">
                    <th style="text-align:left; padding:8px 4px 8px 0; color:var(--text3); font-weight:600;">Bulan</th>
                    <th style="text-align:right; padding:8px 4px; color:var(--text3); font-weight:600;">Masuk</th>
                    <th style="text-align:right; padding:8px 4px; color:var(--text3); font-weight:600;">Keluar</th>
                    <th style="text-align:right; padding:8px 0 8px 4px; color:var(--text3); font-weight:600;">Bersih</th>
                  </tr></thead>
                  <tbody>${monthKeys.map(k => {
        const v = monthlyBreak[k]; const net = v.inc - v.exp;
        return `<tr style="border-bottom:1px solid var(--glass-border);">
                      <td style="padding:8px 4px 8px 0; color:var(--text); word-break:break-word; font-weight:500;">${k}</td>
                      <td class="amount-pos" style="text-align:right; padding:8px 4px; font-family:monospace; word-break:break-all; font-size:13px;">${fmt(v.inc)}</td>
                      <td class="amount-neg" style="text-align:right; padding:8px 4px; font-family:monospace; word-break:break-all; font-size:13px;">${fmt(v.exp)}</td>
                      <td style="text-align:right; padding:8px 0 8px 4px; font-weight:700; font-family:monospace; word-break:break-all; font-size:13px; color:${net >= 0 ? 'var(--accent-green)' : 'var(--accent-orange)'}">${fmt(net)}</td>
                    </tr>`;
      }).join('')}</tbody>
                </table>
              </div>

              <div class="mobile-only">
                ${monthKeys.map(k => {
        const v = monthlyBreak[k]; const net = v.inc - v.exp;
        return `
                  <div style="padding:10px 0; border-bottom:1px solid var(--glass-border);">
                    <div style="font-size:13px; font-weight:700; color:var(--text); margin-bottom:6px;">${k}</div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                      <span style="font-size:13px; color:var(--text3);">Masuk:</span>
                      <span class="amount-pos" style="font-size:14px; font-family:monospace; font-weight:600;">${fmt(v.inc)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                      <span style="font-size:13px; color:var(--text3);">Keluar:</span>
                      <span class="amount-neg" style="font-size:14px; font-family:monospace; font-weight:600;">${fmt(v.exp)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:6px; padding-top:6px; border-top:1px dashed var(--glass-border);">
                      <span style="font-size:13px; color:var(--text2); font-weight:600;">Bersih:</span>
                      <span style="font-size:15px; font-family:monospace; font-weight:800; color:${net >= 0 ? 'var(--accent-green)' : 'var(--accent-orange)'}">${fmt(net)}</span>
                    </div>
                  </div>`;
      }).join('')}
              </div>

            </div>`;
    }

    // --- Per-category breakdown ---
    const hasInCat = Object.keys(catBreakIn).length > 0;
    const hasOutCat = Object.keys(catBreakOut).length > 0;
    if (hasInCat || hasOutCat) {
      summaryHtml += `
            <div style="margin-top:14px; border-top:1px solid var(--glass-border); padding-top:12px;">
              <div style="font-size:12px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px;">Rincian Per Kategori</div>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px;">`;
      if (hasInCat) {
        summaryHtml += `<div>
              <div style="font-size:12px; font-weight:700; color:var(--accent-green); margin-bottom:8px; text-transform:uppercase;">Pemasukan</div>
              ${Object.entries(catBreakIn).sort((a, b) => b[1] - a[1]).map(([k, v]) => `
                <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--glass-border); gap:8px;">
                  <span style="font-size:13px; color:var(--text2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${k}</span>
                  <span class="amount-pos" style="font-size:13px; font-weight:700; font-family:monospace; white-space:nowrap;">${fmt(v)}</span>
                </div>`).join('')}
            </div>`;
      }
      if (hasOutCat) {
        summaryHtml += `<div>
              <div style="font-size:12px; font-weight:700; color:var(--accent-orange); margin-bottom:8px; text-transform:uppercase;">Pengeluaran</div>
              ${Object.entries(catBreakOut).sort((a, b) => b[1] - a[1]).map(([k, v]) => `
                <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--glass-border); gap:8px;">
                  <span style="font-size:13px; color:var(--text2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${k}</span>
                  <span class="amount-neg" style="font-size:13px; font-weight:700; font-family:monospace; white-space:nowrap;">${fmt(v)}</span>
                </div>`).join('')}
            </div>`;
      }
      summaryHtml += `</div></div>`;
    }

    summaryHtml += `</div>`;
  }

  if (list.length === 0) {
    document.getElementById('historyListContainer').innerHTML = summaryHtml + '<div class="empty-state" style="padding:20px; text-align:center;">Data kosong.</div>';
  } else {
    const userUnits = getUserUnits();

    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / historyItemsPerPage);
    if (historyCurrentPage > totalPages && totalPages > 0) historyCurrentPage = totalPages;
    if (historyCurrentPage < 1) historyCurrentPage = 1;

    const startIndex = (historyCurrentPage - 1) * historyItemsPerPage;
    const endIndex = Math.min(startIndex + historyItemsPerPage, totalItems);
    const paginatedList = list.slice(startIndex, endIndex);

    let desktopHtml = paginatedList.map(x => {
      const isMutasi = x.department === 'Mutasi Kas / Setor Bank' || x.income_type === 'Mutasi Kas / Setor Bank';
      const txCanEdit = isMutasi ? (mPindahBuku.edit || isAdmin) : canEdit;
      const txCanDel = isMutasi ? (mPindahBuku.del || isAdmin) : canDel;

      const txUnitLower = String(x.unit_name || '').toLowerCase().trim();
      const belongsToUserUnits = userUnits.some(u => String(u).toLowerCase().trim() === txUnitLower);

      let hasMembers = false;
      if (masterData && masterData.units) {
        const uData = masterData.units.find(u => String(u.name).toLowerCase().trim() === txUnitLower);
        if (uData && parseInt(uData.jumlah_anggota || 0) > 0) hasMembers = true;
      }
      const isExpense = x.type === 'expense';
      const incType = String(x.income_type || '').toLowerCase();
      const isTransparentInc = x.type === 'income' && (incType.includes('sabat') || incType.includes('rabu malam') || incType.includes('pembangunan')) && !hasMembers;
      const isTransparent = isExpense || isTransparentInc;

      const isPrivCategory = isViewer && x.type === 'income' && isPrivateCategory(x.income_type);
      const isOtherUnit = userUnits.length > 0 && x.type === 'income' && !belongsToUserUnits;

      // DO NOT HIDE if the transaction belongs to the user's bound units!
      let shouldHide = !belongsToUserUnits && (isAnon || isOtherUnit || isPrivCategory);
      if (isTransparent) shouldHide = false;

      const deleteId = x.transaction_id || x.receipt_no || '';
      let photoBtn = getPhotoBtnIcon(x, shouldHide && !isApprover);
      let pihak = '';
      if (x.type === 'income') {
        pihak = shouldHide ? '***' : (x.nama_pemberi || '-');
        if (typeof pihak === 'string' && pihak.toLowerCase().startsWith('kolektif ')) {
          pihak = pihak.substring(9).trim();
        } else if (typeof pihak === 'string' && pihak.toLowerCase().endsWith(' - kolektif')) {
          pihak = pihak.substring(0, pihak.length - 11).trim();
        }
      } else if (isMutasi) {
        let srcName = x.source_balance || '-';
        if (srcName !== '-' && !srcName.toLowerCase().startsWith('kas ')) srcName = 'Kas ' + srcName;
        pihak = `Dari: ${srcName} &rarr; Ke: ${x.nama_penerima || 'Kas Utama (Bank)'}`;
      } else {
        pihak = shouldHide ? '***' : (x.nama_penerima || '-');
      }

      let approveBadge = '';
      if (isMutasi) {
        approveBadge = `<span class="badge" style="background:var(--accent-green);color:white;font-size:9px;">Disetujui</span>`;
      } else if (x.approved_by) {
        const isAdminApp = x.approved_by.includes('Admin');
        const isKetua = x.approved_by.includes('Ketua Jemaat');
        const isPendeta = x.approved_by.includes('Pendeta');
        if (isAdminApp || (isKetua && isPendeta)) approveBadge = `<span class="badge" style="background:var(--accent-green);color:white;font-size:9px;">Disetujui</span>`;
        else {
          let pendingWho = [];
          if (!isKetua) pendingWho.push('Ketua');
          if (!isPendeta) pendingWho.push('Pendeta');
          approveBadge = `<span class="badge badge-amber" style="font-size:9px;" title="Menunggu: ${pendingWho.join(' & ')}">Menunggu: ${pendingWho.join(' & ')}</span>`;
        }
      } else {
        approveBadge = `<span class="badge badge-gray" style="font-size:9px;" title="Menunggu: Ketua & Pendeta">Menunggu: Ketua & Pendeta</span>`;
      }

      let approveBtn = '';
      if (isApprover && deleteId && !isMutasi) {
        if (hasUserApprovedTx(x, currentUser)) {
          approveBtn = `<button class="btn-icon-only" style="color:var(--text4); cursor:default;" title="Sudah Di-Approve" disabled>${safeIcon('check', 'lucide-sm')}</button>`;
        } else {
          approveBtn = `<button class="btn-icon-only" style="color:var(--accent-green);" title="Approve" onclick="approveTx('${x.type}', '${deleteId}')">${safeIcon('check', 'lucide-sm')}</button>`;
        }
      }

      let nText = x.note || '-';
      let bBadge = '';
      if (nText.includes('[BANK]')) { nText = nText.replace(/\[BANK\]\s?|\s?\[BANK\]/g, ''); bBadge = '<span class="badge badge-green" style="font-size:10px; padding:2px 4px; margin-right:4px;">VIA BANK</span>'; }
      else if (nText.includes('[CASH]')) { nText = nText.replace(/\[CASH\]\s?|\s?\[CASH\]/g, ''); bBadge = '<span class="badge badge-amber" style="font-size:10px; padding:2px 4px; margin-right:4px;">TUNAI</span>'; }

      return `
      <tr>
        <td class="fit-col">${fmtDate(x.date)}</td>
        <td class="fit-col"><span class="badge ${x.badge}">${x.label}</span></td>
        <td><span class="badge ${getCatBadge(x.income_type || x.department, x.type !== 'income')}">${x.income_type || x.department || '-'}</span><br><span style="font-size:12px; color:var(--text4)">${shouldHide ? '***' : (bBadge + nText)}</span></td>
        <td class="fit-col"><span class="badge badge-gray">${x.receipt_no || '-'}</span> ${photoBtn}</td>
        <td>${pihak}</td>
        <td class="fit-col" style="text-align:right; font-weight:800;">
          ${isMutasi ?
          `<div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px; line-height:1.2;"><span class="amount-neg" style="font-size:12px;">-${fmt(x.amount)}</span><span class="amount-pos" style="font-size:12px;">+${fmt(x.amount)}</span></div>` :
          `<span class="${x.style}">${x.sign}${fmt(x.amount)}</span>`
        }
          <div style="margin-top:4px;">${approveBadge}</div>
        </td>
        <td class="fit-col" style="text-align:right; white-space:nowrap;">
          ${approveBtn}
          ${deleteId ? `<button class="btn-icon-only" style="color:var(--text3);" onclick="printTransaction('${x.type}', '${deleteId}')" title="Cetak Kuitansi">${safeIcon('printer', 'lucide-sm')}</button>` : ''}
          ${txCanEdit && deleteId ? `<button class="btn-icon-only" onclick="openEditTrans('${x.type}', '${deleteId}')">${safeIcon('edit', 'lucide-sm')}</button>` : ''}
          ${txCanDel && deleteId ? `<button class="btn-icon-only" style="color:var(--red-pop)" onclick="deleteTransaction('${x.type}', '${deleteId}')">${safeIcon('trash', 'lucide-sm')}</button>` : ''}
        </td>
      </tr>`;
    }).join('');

    let mobileHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column;">' + paginatedList.map(x => {
      const isMutasi = x.department === 'Mutasi Kas / Setor Bank' || x.income_type === 'Mutasi Kas / Setor Bank';
      const txCanEdit = isMutasi ? (mPindahBuku.edit || isAdmin) : canEdit;
      const txCanDel = isMutasi ? (mPindahBuku.del || isAdmin) : canDel;

      const txUnitLower = String(x.unit_name || '').toLowerCase().trim();
      const belongsToUserUnits = userUnits.some(u => String(u).toLowerCase().trim() === txUnitLower);

      let hasMembers = false;
      if (masterData && masterData.units) {
        const uData = masterData.units.find(u => String(u.name).toLowerCase().trim() === txUnitLower);
        if (uData && parseInt(uData.jumlah_anggota || 0) > 0) hasMembers = true;
      }
      const isExpense = x.type === 'expense';
      const incType = String(x.income_type || '').toLowerCase();
      const isTransparentInc = x.type === 'income' && (incType.includes('sabat') || incType.includes('rabu malam') || incType.includes('pembangunan')) && !hasMembers;
      const isTransparent = isExpense || isTransparentInc;

      const isPrivCategory = isViewer && x.type === 'income' && isPrivateCategory(x.income_type);
      const isInc = x.type === 'income';
      const isOtherUnit = userUnits.length > 0 && x.type === 'income' && !belongsToUserUnits;

      // DO NOT HIDE if the transaction belongs to the user's bound units!
      let shouldHide = !belongsToUserUnits && (isAnon || isOtherUnit || isPrivCategory);
      if (isTransparent) shouldHide = false;

      const deleteId = x.transaction_id || x.receipt_no || '';
      let pihak = '';
      if (x.type === 'income') {
        pihak = shouldHide ? '***' : (x.nama_pemberi || '-');
        if (typeof pihak === 'string' && pihak.toLowerCase().startsWith('kolektif ')) {
          pihak = pihak.substring(9).trim();
        } else if (typeof pihak === 'string' && pihak.toLowerCase().endsWith(' - kolektif')) {
          pihak = pihak.substring(0, pihak.length - 11).trim();
        }
      } else if (isMutasi) {
        let srcName = x.source_balance || '-';
        if (srcName !== '-' && !srcName.toLowerCase().startsWith('kas ')) srcName = 'Kas ' + srcName;
        pihak = `Dari: ${srcName} &rarr; Ke: ${x.nama_penerima || 'Kas Utama (Bank)'}`;
      } else {
        pihak = shouldHide ? '***' : (x.nama_penerima || '-');
      }

      let photoBtn = getPhotoBtnText(x, shouldHide && !isApprover);
      let approveBadgeDesktop = '';
      let approveBadgeMobile = '';
      if (isMutasi) {
        approveBadgeDesktop = `<span class="badge" style="background:var(--accent-green);color:white;font-size:9px; font-weight:700; letter-spacing:0.3px;">DISETUJUI</span>`;
        approveBadgeMobile = `<span class="badge" style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); z-index:2; padding:3px 10px; border-radius:12px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 2px 4px rgba(0,0,0,0.1); background:var(--accent-green);color:white;font-size:9px; font-weight:700; letter-spacing:0.3px;">DISETUJUI</span>`;
      } else if (x.approved_by) {
        const isAdminApp = x.approved_by.includes('Admin');
        const isKetua = x.approved_by.includes('Ketua Jemaat');
        const isPendeta = x.approved_by.includes('Pendeta');
        if (isAdminApp || (isKetua && isPendeta)) {
          approveBadgeDesktop = `<span class="badge" style="background:var(--accent-green);color:white;font-size:9px; font-weight:700; letter-spacing:0.3px;">DISETUJUI</span>`;
          approveBadgeMobile = `<span class="badge" style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); z-index:2; padding:3px 10px; border-radius:12px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 2px 4px rgba(0,0,0,0.1); background:var(--accent-green);color:white;font-size:9px; font-weight:700; letter-spacing:0.3px;">DISETUJUI</span>`;
        } else {
          let pendingWho = [];
          if (!isKetua) pendingWho.push('Ketua');
          if (!isPendeta) pendingWho.push('Pendeta');
          approveBadgeDesktop = `<span class="badge badge-amber" style="font-size:9px; font-weight:700; letter-spacing:0.3px;" title="Menunggu: ${pendingWho.join(' & ')}">MENUNGGU: ${pendingWho.join(' & ').toUpperCase()}</span>`;
          approveBadgeMobile = `<span class="badge badge-amber" style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); z-index:2; padding:3px 10px; border-radius:12px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 2px 4px rgba(0,0,0,0.1); background:var(--input-bg); font-size:9px; font-weight:700; letter-spacing:0.3px;" title="Menunggu: ${pendingWho.join(' & ')}">MENUNGGU: ${pendingWho.join(' & ').toUpperCase()}</span>`;
        }
      } else {
        approveBadgeDesktop = `<span class="badge badge-gray" style="font-size:9px; font-weight:700; letter-spacing:0.3px;" title="Menunggu: Ketua & Pendeta">MENUNGGU: KETUA & PENDETA</span>`;
        approveBadgeMobile = `<span class="badge badge-gray" style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); z-index:2; padding:3px 10px; border-radius:12px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 2px 4px rgba(0,0,0,0.1); background:var(--input-bg); font-size:9px; font-weight:700; letter-spacing:0.3px;" title="Menunggu: Ketua & Pendeta">MENUNGGU: KETUA & PENDETA</span>`;
      }

      let approveBtn = '';
      if (isApprover && deleteId && !isMutasi) {
        if (hasUserApprovedTx(x, currentUser)) {
          approveBtn = `<button class="btn" style="padding:4px 8px; font-size:9px; background:var(--badge-gray-bg); color:var(--text4); border:1px solid var(--glass-border); cursor:default;display:inline-flex;align-items:center;gap:4px;" disabled>${safeIcon('check', 'lucide-sm')} Approved</button>`;
        } else {
          approveBtn = `<button class="btn" style="padding:4px 8px; font-size:9px; background:rgba(16,185,129,0.1); color:var(--accent-green); border:1px solid rgba(16,185,129,0.2);display:inline-flex;align-items:center;gap:4px;" onclick="approveTx('${x.type}', '${deleteId}')">${safeIcon('check', 'lucide-sm')} Approve</button>`;
        }
      }

      let editBtn = txCanEdit && deleteId ? `<button class="btn" style="flex:1; justify-content:center; padding:6px 0; font-size:11px; background:var(--input-bg); color:var(--text); border:1px solid var(--glass-border);" onclick="openEditTrans('${x.type}', '${deleteId}')">${safeIcon('edit', 'lucide-sm')} <span style="margin-left:4px">Edit</span></button>` : '';
      let delBtn = txCanDel && deleteId ? `<button class="btn" style="flex:1; justify-content:center; padding:6px 0; font-size:11px; background:rgba(244,63,94,0.1); color:var(--rose-pop); border:1px solid rgba(244,63,94,0.2);" onclick="deleteTransaction('${x.type}', '${deleteId}')">${safeIcon('trash', 'lucide-sm')} <span style="margin-left:4px">Hapus</span></button>` : '';

      let cetakBtn = deleteId ? `<button class="btn" style="flex:1; justify-content:center; padding:6px 0; font-size:11px; background:var(--input-bg); color:var(--text); border:1px solid var(--glass-border);" onclick="printTransaction('${x.type}', '${deleteId}')" title="Cetak Kuitansi">${safeIcon('printer', 'lucide-sm')} <span style="margin-left:4px">Cetak</span></button>` : '';

      return `
          <div class="dash-tx-card" style="position:relative; margin: 20px 12px 12px 12px; padding: 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
            ${approveBadgeMobile}
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge ${x.badge}" style="font-size:10px; padding:2px 7px;">${isMutasi ? 'MUT' : (isInc ? 'IN' : 'OUT')}</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no || '-'}</span>
              </div>
              ${isMutasi ?
          `<div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px; font-weight: 700; font-size: 13px; white-space:nowrap; margin-bottom:2px; line-height:1.2;"><span class="amount-neg">-${fmt(x.amount)}</span><span class="amount-pos">+${fmt(x.amount)}</span></div>` :
          `<div class="${x.style}" style="font-weight: 700; font-size: 15px; white-space:nowrap; margin-bottom:2px;">${x.sign}${fmt(x.amount)}</div>`
        }
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 6px 8px; font-size: 11px; color: var(--text2); margin-top:8px; align-items:center;">
              <span style="color:var(--text4); display:flex; align-items:center; height:100%;">Tgl</span>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:var(--text); font-weight:600; display:flex; align-items:center; height:100%;">${fmtDate(x.date)}</strong>
                <div style="display:flex; gap:4px;">
                  ${approveBtn}
                </div>
              </div>
              <span style="color:var(--text4)">Pihak</span><strong style="color:var(--text); font-weight:600; overflow:hidden; text-overflow:ellipsis;">${pihak}</strong>
              <span style="color:var(--text4)">Ket</span><strong style="color:var(--text); font-weight:600;">${x.income_type || x.department || '-'}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${shouldHide ? '***' : (() => { let nT = x.note || '-'; let bB = ''; if (nT.includes('[BANK]')) { nT = nT.replace(/\[BANK\]\s?|\s?\[BANK\]/g, ''); bB = '<span class="badge badge-green" style="font-size:10px; padding:2px 4px; margin-right:4px;">VIA BANK</span>'; } else if (nT.includes('[CASH]')) { nT = nT.replace(/\[CASH\]\s?|\s?\[CASH\]/g, ''); bB = '<span class="badge badge-amber" style="font-size:10px; padding:2px 4px; margin-right:4px;">TUNAI</span>'; } return bB + nT; })()}</span>
            </div>
            <div style="display:flex; gap:6px; margin-top:12px; width:100%; flex-wrap:wrap;">
              ${photoBtn}
              ${cetakBtn}
              ${editBtn}
              ${delBtn}
            </div>
          </div>`;
    }).join('') + '</div>';

    const getSortIcon = (col) => {
      if (historySortCol !== col) return '<span style="opacity:0.3; font-size:10px; margin-left:4px;">↕</span>';
      return historySortDesc ? '<span style="font-size:10px; margin-left:4px;">▼</span>' : '<span style="font-size:10px; margin-left:4px;">▲</span>';
    };

    document.getElementById('historyListContainer').innerHTML = summaryHtml + `
          <div class="desktop-only scrollable" style="width:100%; overflow:hidden; border:none;">
            <table class="table-history" style="width:100%; table-layout:auto;">
              <thead>
                <tr>
                  <th style="cursor:pointer; user-select:none; white-space:normal;" onclick="toggleSortHistory('date')">Tanggal ${getSortIcon('date')}</th>
                  <th style="cursor:pointer; user-select:none; white-space:normal;" onclick="toggleSortHistory('type')">Alur ${getSortIcon('type')}</th>
                  <th style="cursor:pointer; user-select:none;" onclick="toggleSortHistory('category')">Kategori & Keterangan ${getSortIcon('category')}</th>
                  <th style="cursor:pointer; user-select:none; white-space:normal;" onclick="toggleSortHistory('receipt')">Bukti ${getSortIcon('receipt')}</th>
                  <th style="cursor:pointer; user-select:none;" onclick="toggleSortHistory('pihak')">Pihak ${getSortIcon('pihak')}</th>
                  <th style="text-align:right; cursor:pointer; user-select:none; white-space:normal;" onclick="toggleSortHistory('amount')">Nominal ${getSortIcon('amount')}</th>
                  <th style="text-align:right; white-space:normal;">Aksi</th>
                </tr>
              </thead>
              <tbody>${desktopHtml}</tbody>
            </table>
          </div>
          <div class="mobile-only" style="padding-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; margin-bottom:16px; padding: 0 12px;">
              <span style="font-size:12px; color:var(--text3); font-weight:600;">Urut Berdasarkan:</span>
              <select class="select-sm" style="font-size:12px; padding:4px 24px 4px 8px; width:auto; border-radius:var(--radius);" onchange="historySortCol=this.value.split('|')[0]; historySortDesc=(this.value.split('|')[1]==='desc'); historyCurrentPage=1; renderHistory();">
                 <option value="date|desc" ${historySortCol === 'date' && historySortDesc ? 'selected' : ''}>Tanggal (Terbaru)</option>
                 <option value="date|asc" ${historySortCol === 'date' && !historySortDesc ? 'selected' : ''}>Tanggal (Terlama)</option>
                 <option value="amount|desc" ${historySortCol === 'amount' && historySortDesc ? 'selected' : ''}>Nominal (Tertinggi)</option>
                 <option value="amount|asc" ${historySortCol === 'amount' && !historySortDesc ? 'selected' : ''}>Nominal (Terendah)</option>
                 <option value="receipt|asc" ${historySortCol === 'receipt' && !historySortDesc ? 'selected' : ''}>Bukti (A-Z)</option>
                 <option value="receipt|desc" ${historySortCol === 'receipt' && historySortDesc ? 'selected' : ''}>Bukti (Z-A)</option>
              </select>
            </div>
            ${mobileHtml}
          </div>
        `;

    if (totalPages > 1) {
      const paginationHtml = `
            <div style="display:flex; justify-content:center; align-items:center; gap: 16px; padding: 16px; margin-top: 12px; border-top: 1px solid var(--glass-border);">
              <button class="btn btn-ghost" style="padding:6px 12px; border: 1px solid var(--glass-border);" ${historyCurrentPage === 1 ? 'disabled' : `onclick="changeHistoryPage(${historyCurrentPage - 1})"`}>&laquo; Prev</button>
              <span style="font-size:13px; color:var(--text3); font-weight: 600;">Hal ${historyCurrentPage} dari ${totalPages}</span>
              <button class="btn btn-ghost" style="padding:6px 12px; border: 1px solid var(--glass-border);" ${historyCurrentPage === totalPages ? 'disabled' : `onclick="changeHistoryPage(${historyCurrentPage + 1})"`}>Next &raquo;</button>
            </div>
          `;
      document.getElementById('historyListContainer').innerHTML += paginationHtml;
    }
  }
}

let currentEditTransaction = null;

function handleEditTypeChange() {
  if (!currentEditTransaction) return;
  const catSelect = document.getElementById('editTransCat');
  if (!catSelect) return;

  const type = catSelect.value;
  const bulkGrp = document.getElementById('editTransBulkGroup');
  const amtWrapper = document.getElementById('editTransAmtWrapper');

  if (type === 'Perpuluhan') {
    if (bulkGrp) bulkGrp.style.display = 'block';
    if (amtWrapper) amtWrapper.style.display = 'none';
  } else {
    if (bulkGrp) bulkGrp.style.display = 'none';
    if (amtWrapper) amtWrapper.style.display = 'block';
  }
}

async function openEditTrans(type, id) {
  const list = type === 'income' ? cachedIncome : cachedExpense;
  const trx = list.find(x => (x.transaction_id || x.receipt_no) === id);
  if (!trx) { notify('Transaksi tidak ditemukan.', 'error'); return; }

  if (document.getElementById('editTransModal')) document.getElementById('editTransModal').style.display = 'flex';
  if (document.getElementById('editTransDate')) document.getElementById('editTransDate').value = fmtInputDate(trx.date);
  if (document.getElementById('editTransReceipt')) document.getElementById('editTransReceipt').value = trx.receipt_no || '';
  if (document.getElementById('editTransNote')) {
    let nT = trx.note || '';
    let dest = 'CASH';
    if (nT.includes('[BANK]')) {
      nT = nT.replace(/\[BANK\]\s?|\s?\[BANK\]/g, '');
      dest = 'BANK';
    } else if (nT.includes('[CASH]')) {
      nT = nT.replace(/\[CASH\]\s?|\s?\[CASH\]/g, '');
      dest = 'CASH';
    }
    document.getElementById('editTransNote').value = nT;
    if (document.getElementById('editTransDestination')) document.getElementById('editTransDestination').value = dest;
  }

  const catSelect = document.getElementById('editTransCat');
  const subCatSelect = document.getElementById('editTransSubCat');
  const subCatGroup = document.getElementById('editTransSubCatGroup');
  if (catSelect) catSelect.innerHTML = '';
  if (subCatSelect) subCatSelect.innerHTML = '';

  currentEditTransaction = { type, id: trx.transaction_id || trx.receipt_no, old_receipt_no: trx.receipt_no, original: trx };

  if (type === 'income') {
    if (document.getElementById('editTransDestinationGroup')) document.getElementById('editTransDestinationGroup').style.display = 'block';
    if (document.getElementById('editTransCatLabel')) document.getElementById('editTransCatLabel').textContent = 'Kategori';
    const perpuluhanGroup = ['Perpuluhan', 'Terpadu', 'Khusus Jemaat', 'Khusus Daerah'];
    const excludeList = ['Persembahan Khusus', ...perpuluhanGroup];

    if (catSelect) catSelect.add(new Option('Perpuluhan (Grup Kolektif)', 'Perpuluhan'));
    const existingTypes = [];
    (masterData.incomeTypes || []).forEach(x => {
      existingTypes.push(x.name);
      if (!excludeList.includes(x.name) && catSelect) catSelect.add(new Option(x.name, x.name));
    });

    if (trx.income_type && !existingTypes.includes(trx.income_type) && !perpuluhanGroup.includes(trx.income_type) && catSelect) {
      catSelect.add(new Option(trx.income_type + ' (Histori)', trx.income_type));
    }

    const isBulk = perpuluhanGroup.includes(trx.income_type) || (trx.nama_pemberi && (String(trx.nama_pemberi).toLowerCase().startsWith('kolektif') || String(trx.nama_pemberi).toLowerCase().endsWith('- kolektif')));

    if (catSelect) {
      catSelect.value = isBulk ? 'Perpuluhan' : trx.income_type;
    }

    if (document.getElementById('editTransUnitGroup')) document.getElementById('editTransUnitGroup').style.display = 'block';
    if (document.getElementById('editTransSourceGroup')) document.getElementById('editTransSourceGroup').style.display = 'none';

    const unitSelect = document.getElementById('editTransUnit');
    if (unitSelect) {
      unitSelect.innerHTML = '<option value="">-- Tanpa Unit --</option>';
      const existingUnits = [];
      (masterData.units || []).forEach(x => { existingUnits.push(x.name); unitSelect.add(new Option(x.name, x.name)); });
      if (trx.unit_name && trx.unit_name !== '-' && !existingUnits.includes(trx.unit_name)) unitSelect.add(new Option(trx.unit_name + ' (Histori)', trx.unit_name));
      unitSelect.value = trx.unit_name || '';
    }

    if (document.getElementById('editTransPihakGroup')) document.getElementById('editTransPihakGroup').style.display = 'block';
    if (document.getElementById('editTransPihakLabel')) document.getElementById('editTransPihakLabel').textContent = 'Nama Pemberi';
    if (document.getElementById('editTransPihak')) document.getElementById('editTransPihak').value = (isBulk && trx.nama_pemberi && (String(trx.nama_pemberi).toLowerCase().startsWith('kolektif') || String(trx.nama_pemberi).toLowerCase().endsWith('- kolektif'))) ? 'Umum' : (trx.nama_pemberi || '');

    if (document.getElementById('editTransAmtPerpuluhan')) document.getElementById('editTransAmtPerpuluhan').value = '';
    if (document.getElementById('editTransAmtTerpadu')) document.getElementById('editTransAmtTerpadu').value = '';
    if (document.getElementById('editTransAmtKhususJemaat')) document.getElementById('editTransAmtKhususJemaat').value = '';
    if (document.getElementById('editTransAmtKhususDaerah')) document.getElementById('editTransAmtKhususDaerah').value = '';

    if (isBulk) {
      const allItems = cachedIncome.filter(x => x.receipt_no === trx.receipt_no && perpuluhanGroup.includes(x.income_type));
      allItems.forEach(item => {
        if (item.income_type === 'Perpuluhan' && document.getElementById('editTransAmtPerpuluhan')) document.getElementById('editTransAmtPerpuluhan').value = item.amount;
        if (item.income_type === 'Terpadu' && document.getElementById('editTransAmtTerpadu')) document.getElementById('editTransAmtTerpadu').value = item.amount;
        if (item.income_type === 'Khusus Jemaat' && document.getElementById('editTransAmtKhususJemaat')) document.getElementById('editTransAmtKhususJemaat').value = item.amount;
        if (item.income_type === 'Khusus Daerah' && document.getElementById('editTransAmtKhususDaerah')) document.getElementById('editTransAmtKhususDaerah').value = item.amount;
      });
    } else {
      if (document.getElementById('editTransAmount')) document.getElementById('editTransAmount').value = trx.amount;
    }

  } else {
    if (document.getElementById('editTransDestinationGroup')) document.getElementById('editTransDestinationGroup').style.display = 'none';
    if (document.getElementById('editTransCatLabel')) document.getElementById('editTransCatLabel').textContent = 'Departemen';
    const existingDepts = [];
    (masterData.departments || []).forEach(x => { existingDepts.push(x.name); if (catSelect) catSelect.add(new Option(x.name, x.name)); });
    existingDepts.push('Mutasi Kas / Setor Bank'); if (catSelect) catSelect.add(new Option('Mutasi Kas / Setor Bank', 'Mutasi Kas / Setor Bank'));
    if (trx.department && !existingDepts.includes(trx.department) && catSelect) catSelect.add(new Option(trx.department + ' (Histori)', trx.department));
    if (catSelect) catSelect.value = trx.department || '';

    if (document.getElementById('editTransUnitGroup')) document.getElementById('editTransUnitGroup').style.display = 'none';
    if (document.getElementById('editTransSourceGroup')) document.getElementById('editTransSourceGroup').style.display = 'block';
    if (document.getElementById('editTransSource')) document.getElementById('editTransSource').value = trx.source_balance || 'Kas Jemaat';

    if (document.getElementById('editTransPihakGroup')) document.getElementById('editTransPihakGroup').style.display = 'block';
    if (document.getElementById('editTransPihakLabel')) document.getElementById('editTransPihakLabel').textContent = 'Nama Penerima';
    if (document.getElementById('editTransPihak')) document.getElementById('editTransPihak').value = trx.nama_penerima || '';

    if (document.getElementById('editTransAmount')) document.getElementById('editTransAmount').value = trx.amount;
  }

  // Load existing photos into edit preview
  if (trx.receipt_photo || trx.receipt_photo_2 || trx.receipt_photo_3) {
    showGlobalLoading('Memuat foto asli dari server...');
    try {
      const res = await apiGet('getTransactionPhotos', { id: trx.transaction_id || trx.receipt_no, type: type });
      if (res && res.success && res.data) {
        currentEditPhotos = [res.data.photo1, res.data.photo2, res.data.photo3].filter(p => p && String(p).trim() !== '');
      } else {
        currentEditPhotos = [];
      }
    } catch (e) {
      notify((e.message || 'Gagal memuat foto asli.') + ' | URL: ' + getActiveApiUrl().substring(0, 45) + '...', 'error');
      currentEditPhotos = [];
    } finally {
      hideGlobalLoading();
    }
  } else {
    currentEditPhotos = [];
  }
  renderPhotoPreview(currentEditPhotos, 'editPhotoGrid', 'editPhotoUploadBox', 'edit');

  handleEditTypeChange();

  // Check if fully approved and disable fields if so
  const isFullyApproved = trx.approved_by && (trx.approved_by.includes('Admin') || (trx.approved_by.includes('Ketua Jemaat') && trx.approved_by.includes('Pendeta')));
  const inputsToLock = [
    'editTransDate', 'editTransReceipt', 'editTransNote', 'editTransCat', 'editTransUnit',
    'editTransPihak', 'editTransAmount', 'editTransSource', 'editTransAmtPerpuluhan',
    'editTransAmtTerpadu', 'editTransAmtKhususJemaat', 'editTransAmtKhususDaerah'
  ];
  inputsToLock.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = isFullyApproved;
  });

  if (isFullyApproved) {
    document.getElementById('editTransNote').placeholder = 'Transaksi disetujui penuh, hanya foto yang bisa diubah.';
  }
}

function closeEditModal() {
  if (document.getElementById('editTransModal')) document.getElementById('editTransModal').style.display = 'none';
  currentEditTransaction = null;
  resetPhotoUpload('edit');
  const inputsToLock = [
    'editTransDate', 'editTransReceipt', 'editTransNote', 'editTransCat', 'editTransUnit',
    'editTransPihak', 'editTransAmount', 'editTransSource', 'editTransAmtPerpuluhan',
    'editTransAmtTerpadu', 'editTransAmtKhususJemaat', 'editTransAmtKhususDaerah'
  ];
  inputsToLock.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = false;
  });
  document.getElementById('editTransNote').placeholder = '';
}

async function saveEditTransaction() {
  if (!currentEditTransaction) return;

  const date = document.getElementById('editTransDate').value;
  if (date) {
    const d = new Date(date);
    if (checkMonthClosed(d.getMonth() + 1, d.getFullYear())) { notify('Bulan ini sudah ditutup. Tidak dapat mengubah transaksi.', 'error'); return; }
  }
  const receipt = document.getElementById('editTransReceipt').value.trim();
  let note = document.getElementById('editTransNote').value.trim();
  if (currentEditTransaction.type === 'income') {
    const dest = document.getElementById('editTransDestination') ? document.getElementById('editTransDestination').value : 'CASH';
    if (dest === 'BANK') note = '[BANK] ' + note;
    else if (dest === 'CASH') note = '[CASH] ' + note;
  }

  if (!date || !receipt) { notify('Tgl dan Kuitansi wajib diisi!', 'error'); return; }
  if (receipt !== String(currentEditTransaction.old_receipt_no || '').trim() && isReceiptDuplicate(receipt, currentEditTransaction.id)) {
    const proceed = await showCustomConfirm('Konfirmasi Kuitansi', 'No. Kuitansi sudah ada! Apakah ini kuitansi kolektif dan Anda tetap ingin menyimpannya?');
    if (!proceed) return;
  }

  const btn = document.getElementById('btnSaveEditTrans');
  btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Menyimpan...';

  try {
    const sortedPhotos = [...currentEditPhotos].sort((a, b) => {
      const isA = String(a).startsWith('data:');
      const isB = String(b).startsWith('data:');
      return (isA === isB) ? 0 : isA ? -1 : 1;
    });

    console.log("=== DEBUG EDIT PHOTOS ===");
    console.log("currentEditPhotos length:", currentEditPhotos.length);
    console.log("sortedPhotos length:", sortedPhotos.length);
    console.log("Photo 1 size:", sortedPhotos[0] ? sortedPhotos[0].length : 0);
    console.log("Photo 2 size:", sortedPhotos[1] ? sortedPhotos[1].length : 0);
    console.log("Photo 3 size:", sortedPhotos[2] ? sortedPhotos[2].length : 0);

    if (currentEditTransaction.type === 'income') {
      const cat = document.getElementById('editTransCat').value;
      const unit = document.getElementById('editTransUnit').value || '-';
      const pihak = document.getElementById('editTransPihak').value.trim() || 'Umum';

      if (cat === 'Perpuluhan') {
        const items = [];
        ['Perpuluhan', 'Terpadu', 'Khusus Jemaat', 'Khusus Daerah'].forEach(k => {
          if (document.getElementById(`editTransAmt${k.replace(/\s/g, '')}`)) {
            const val = parseFloat(document.getElementById(`editTransAmt${k.replace(/\s/g, '')}`).value) || 0;
            if (val > 0) items.push({ income_type: k, amount: val, note, nama_pemberi: pihak });
          }
        });

        if (items.length === 0) throw new Error('Isi setidaknya satu nominal kolektif!');

        const payload = {
          action: 'editBulkIncome',
          old_receipt_no: currentEditTransaction.old_receipt_no,
          date: date,
          receipt_no: receipt,
          unit_name: unit,
          nama_pemberi: pihak,
          items: items,
          receipt_photo_base64: sortedPhotos[0] || '', receipt_photo_base64_2: sortedPhotos[1] || '', receipt_photo_base64_3: sortedPhotos[2] || '',
          original_photo: currentEditTransaction.original.receipt_photo
        };
        await apiPostWithFallback('editBulkIncome', payload);
      } else {
        const amount = parseFloat(document.getElementById('editTransAmount').value) || 0;
        if (amount <= 0) throw new Error('Nominal tidak valid!');

        const payload = {
          type: 'income',
          transaction_id: currentEditTransaction.id,
          date, receipt_no: receipt, amount, note,
          receipt_photo_base64: sortedPhotos[0] || '', receipt_photo_base64_2: sortedPhotos[1] || '', receipt_photo_base64_3: sortedPhotos[2] || '',
          original: currentEditTransaction.original,
          income_type: cat,
          unit_name: unit,
          nama_pemberi: pihak
        };
        await apiPostWithFallback('editRecord', payload);
      }
    } else {
      const amount = parseFloat(document.getElementById('editTransAmount').value) || 0;
      if (amount <= 0) throw new Error('Nominal tidak valid!');
      const cat = document.getElementById('editTransCat').value;
      const source = document.getElementById('editTransSource').value;
      const pihak = document.getElementById('editTransPihak').value.trim() || '-';

      const payload = {
        type: 'expense',
        transaction_id: currentEditTransaction.id,
        date, receipt_no: receipt, amount, note,
        receipt_photo_base64: sortedPhotos[0] || '', receipt_photo_base64_2: sortedPhotos[1] || '', receipt_photo_base64_3: sortedPhotos[2] || '',
        original: currentEditTransaction.original,
        department: cat,
        source_balance: source,
        nama_penerima: pihak
      };
      await apiPostWithFallback('editRecord', payload);
    }

    notify('Berhasil disimpan!', 'success');
    closeEditModal();
    await syncAllData();
    renderHistory();
  } catch (e) {
    notify(e.message, 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = 'Simpan';
  }
}

async function deleteTransaction(type, id) {
  const arr = type === 'income' ? cachedIncome : cachedExpense;
  const tx = arr.find(x => x.id === id);
  if (tx && tx.date) {
    const d = new Date(tx.date);
    if (checkMonthClosed(d.getMonth() + 1, d.getFullYear())) { notify('Bulan ini sudah ditutup. Tidak dapat menghapus transaksi.', 'error'); return; }
  }
  const isConfirm = await showCustomConfirm('Hapus Permanen', 'Anda yakin?');
  if (!isConfirm) return;
  try { await apiPost('deleteRecord', { type, transaction_id: id }); notify('Dihapus.', 'success'); await syncAllData(); renderHistory(); }
  catch (e) { notify(e.message, 'error'); }
}

// [Receipt Service extracted to ./modules/receiptService.js]
function openBulkPrintModal() {
  document.getElementById('bulkPrintModal').style.display = 'flex';
}

function closeBulkPrintModal() {
  document.getElementById('bulkPrintModal').style.display = 'none';
  document.getElementById('bulkPrintStart').value = '';
  document.getElementById('bulkPrintEnd').value = '';
}

window.toggleBulkPrintCat = function (caller) {
  const allCb = document.getElementById('bpCatAll');
  const catCbs = document.querySelectorAll('.bpCatCheck');
  if (caller === 'all') {
    if (allCb.checked) {
      catCbs.forEach(cb => cb.checked = false);
    }
  } else {
    let anyChecked = false;
    catCbs.forEach(cb => { if (cb.checked) anyChecked = true; });
    if (anyChecked) allCb.checked = false;
    else if (!allCb.checked) allCb.checked = true; // prevent zero selection by defaulting to all
  }
};

function doBulkPrint() {
  const startReceipt = document.getElementById('bulkPrintStart').value.trim();
  const endReceipt = document.getElementById('bulkPrintEnd').value.trim();

  const chkAll = document.getElementById('bpCatAll').checked;
  const chkInc = document.querySelector('.bpCatCheck[value="income"]').checked;
  const chkExp = document.querySelector('.bpCatCheck[value="expense"]').checked;
  const chkMut = document.querySelector('.bpCatCheck[value="mutasi"]').checked;

  const doInc = chkAll || chkInc;
  const doExp = chkAll || chkExp;
  const doMut = chkAll || chkMut;

  const myUnitOnly = document.getElementById('bulkPrintMyUnitOnly') && document.getElementById('bulkPrintMyUnitOnly').checked;

  if (!startReceipt || !endReceipt) {
    notify('Harap isi rentang tanggal dengan lengkap', 'error');
    return;
  }

  let pool = [];
  if (doInc) {
    (cachedIncome || []).forEach(x => pool.push({ ...x, _bpType: 'income' }));
  }
  if (doExp || doMut) {
    (cachedExpense || []).forEach(x => {
      const isMut = x.department === 'Mutasi Kas / Setor Bank';
      if (isMut && doMut) pool.push({ ...x, _bpType: 'expense' });
      else if (!isMut && doExp) pool.push({ ...x, _bpType: 'expense' });
    });
  }

  let uniqueReceipts = new Set();
  let txToPrint = [];
  const userUnits = getUserUnits();

  pool.forEach(tx => {
    const d = tx.date || '';
    if (d >= startReceipt && d <= endReceipt) {
      if (myUnitOnly) {
        const txUnitLower = String(tx.unit_name || '').toLowerCase().trim();
        const belongsToUserUnits = userUnits.some(u => String(u).toLowerCase().trim() === txUnitLower);
        if (!belongsToUserUnits) return;
      }
      const r = tx.receipt_no || '';
      if (r !== '-' && r !== '') {
        const uKey = tx._bpType + '_' + r;
        if (!uniqueReceipts.has(uKey)) {
          uniqueReceipts.add(uKey);
          txToPrint.push(tx);
        }
      } else {
        txToPrint.push(tx);
      }
    }
  });

  if (txToPrint.length === 0) {
    notify('Tidak ada transaksi pada kriteria tersebut', 'error');
    return;
  }

  txToPrint.sort((a, b) => {
    const rA = String(a.receipt_no || '').trim();
    const rB = String(b.receipt_no || '').trim();
    // Sort by receipt_no first with numeric sorting if both exist and are not '-'
    if (rA && rB && rA !== '-' && rB !== '-') {
      const cmpReceipt = rA.localeCompare(rB, undefined, { numeric: true, sensitivity: 'base' });
      if (cmpReceipt !== 0) return cmpReceipt;
    }
    // Fallback to date sorting
    const cmpDate = String(a.date || '').localeCompare(String(b.date || ''));
    if (cmpDate !== 0) return cmpDate;

    // Final fallback
    return rA.localeCompare(rB, undefined, { numeric: true, sensitivity: 'base' });
  });

  let allHtml = '';
  txToPrint.forEach(tx => {
    allHtml += generateReceiptHTML(tx._bpType, tx);
  });

  document.getElementById('printContainer').innerHTML = allHtml;

  setTimeout(() => {
    window.print();
    closeBulkPrintModal();
  }, 1000);
}

async function approveTx(type, id) {
  const isConfirm = await showCustomConfirm('Approve Transaksi', 'Apakah Anda menyetujui transaksi ini?');
  if (!isConfirm) return;
  try {
    await apiPostWithFallback('approveTransaction', { type, transaction_id: id });
    notify('Transaksi disetujui.', 'success');
    await syncAllData();
    renderHistory();
  }
  catch (e) { notify(e.message, 'error'); }
}

async function approveBulkTx() {
  const list = window.pendingBulkApproveList || [];
  if (list.length === 0) return;
  const isConfirm = await showCustomConfirm('Approve Semua', `Anda yakin menyetujui ${list.length} transaksi sekaligus? (Mungkin butuh beberapa detik)`);
  if (!isConfirm) return;

  const btn = document.getElementById('btnApproveBulk');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Memproses...'; }

  notify(`Memproses approval ${list.length} transaksi...`, 'info');
  let successCount = 0;
  let failCount = 0;

  window.isBulkProcessing = true;
  showGlobalLoading(`Memproses 0 dari ${list.length} data...`);

  for (let i = 0; i < list.length; i++) {
    showGlobalLoading(`Memproses ${i + 1} dari ${list.length} data...`);
    try {
      await apiPostWithFallback('approveTransaction', { type: list[i].type, transaction_id: list[i].id });
      successCount++;
    } catch (e) {
      console.error(e);
      failCount++;
    }
  }

  window.isBulkProcessing = false;
  hideGlobalLoading();

  if (failCount > 0) {
    notify(`Selesai. ${successCount} berhasil, ${failCount} gagal.`, 'error');
  } else {
    notify(`Berhasil menyetujui ${successCount} transaksi!`, 'success');
  }

  if (btn) { btn.disabled = false; btn.innerHTML = `${safeIcon('check', 'lucide-sm')} <span style="margin-left:4px;">Approve Semua</span>`; }
  await handleManualSync();
}

// [Master Data CRUD extracted to ./modules/masterDataService.js]

function notify(msg, type = 'success') {
  const el = document.getElementById('notification'); const icon = document.getElementById('notifIcon'); const text = document.getElementById('notifMsg');
  if (!el || !text || !icon) return;
  el.className = 'notification ' + type; text.textContent = msg;
  let iconName = 'check';
  if (type === 'error' || type === 'warning') iconName = 'alert';
  else if (type === 'info') iconName = 'info';
  icon.innerHTML = safeIcon(iconName, 'lucide-md');
  el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3000);
}
window.notify = notify;

function updateAppStatus() {
  const dot = document.getElementById('appStatusDot'); const txt = document.getElementById('appStatusText');
  if (dot && txt) { dot.className = 'status-dot ' + (isServerOnline ? 'online' : 'offline'); txt.textContent = isServerOnline ? 'Online' : 'Offline'; }
}

function updateBottomNavIndicator() {
  const bottomBar = document.getElementById('bottomBar');
  if (!bottomBar) return;
  const activeItem = bottomBar.querySelector('.bottom-nav-item.active');
  if (activeItem && activeItem.style.display !== 'none') {
    const rect = activeItem.getBoundingClientRect();
    const barRect = bottomBar.getBoundingClientRect();
    const center = rect.left - barRect.left + rect.width / 2;
    bottomBar.style.setProperty('--hole-x', `${center}px`);
  }
}
window.addEventListener('resize', updateBottomNavIndicator);

const PAGE_PERMISSION_MAP = {
  dashboard: 'dashboard',
  pemasukan: 'pemasukan',
  pengeluaran: 'pengeluaran',
  pindahbuku: 'pindahbuku',
  laporan: 'laporan',
  riwayat: 'riwayat',
  masterIncType: 'masterData',
  masterDept: 'masterData',
  masterUnit: 'masterData',
  users: 'users',
  settings: 'settings',
  roles: 'settings',
  series: 'series',
  logs: 'logs',
  inventaris: 'inventaris',
  akun: 'akun'
};

function showPage(pageId) {
  try {
    if (currentUser) {
      if (pageId === 'roles') {
        if (!hasRole(currentUser, 'Admin')) {
          notify('Hanya Admin yang berhak mengakses pengaturan Hak Akses.', 'error');
          showPage('dashboard');
          return;
        }
      }
      const perms = getRolePerms(currentUser?.role || '');
      const requiredMenu = PAGE_PERMISSION_MAP[pageId];
      if (requiredMenu && perms && perms.menus && perms.menus[requiredMenu] && perms.menus[requiredMenu].view === false) {
        notify('Anda tidak memiliki hak akses untuk membuka menu ini.', 'error');
        if (pageId !== 'dashboard') {
          showPage('dashboard');
        }
        return;
      }
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[onclick*="showPage('${pageId}')"]`);
    if (activeNav) activeNav.classList.add('active');
    const activeBotNav = document.querySelector(`.bottom-nav-item[data-target="${pageId}"]`);
    if (activeBotNav) activeBotNav.classList.add('active');
    const titles = { dashboard: 'Dashboard', pemasukan: 'Pemasukan', pengeluaran: 'Pengeluaran', pindahbuku: 'Pindah Buku', laporan: 'Laporan', riwayat: 'Histori', masterIncType: 'Kategori', masterDept: 'Departemen', masterUnit: 'Unit', users: 'Manajemen User', settings: 'Pengaturan Web', series: 'No. Series', roles: 'Hak Akses Menu', logs: 'Audit Log' };
    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) pageTitleEl.textContent = titles[pageId] || 'Dashboard';
    if (window.innerWidth <= 1100 && typeof closeSidebar === 'function') {
      closeSidebar();
    }
  } catch (domErr) {
    console.error('showPage DOM switch error:', domErr);
  }

  try {
    if (pageId === 'dashboard') {
      if (typeof renderDashboard === 'function') renderDashboard();
    } else if (pageId === 'pemasukan') {
      if (typeof renderIncomeList === 'function') renderIncomeList();
    } else if (pageId === 'pengeluaran') {
      if (typeof renderExpenseList === 'function') renderExpenseList();
    } else if (pageId === 'pindahbuku') {
      if (typeof renderMutasiList === 'function') renderMutasiList();
    } else if (pageId === 'riwayat') {
      if (typeof renderHistory === 'function') renderHistory();
    } else if (pageId === 'laporan') {
      const rpt = document.getElementById('reportContent');
      if (rpt) rpt.innerHTML = '';
    } else if (pageId === 'masterIncType') {
      if (typeof renderMasterIncTypes === 'function') renderMasterIncTypes();
    } else if (pageId === 'masterDept') {
      if (typeof renderMasterDepts === 'function') renderMasterDepts();
    } else if (pageId === 'masterUnit') {
      if (typeof renderMasterUnits === 'function') renderMasterUnits();
    } else if (pageId === 'users') {
      if (typeof renderUsers === 'function') renderUsers();
    } else if (pageId === 'logs') {
      if (typeof renderLogs === 'function') renderLogs();
    } else if (pageId === 'roles') {
      if (typeof renderRoles === 'function') renderRoles();
    } else if (pageId === 'series') {
      if (typeof window.loadSeriesConfig === 'function') window.loadSeriesConfig();
    }
  } catch (renderErr) {
    console.error(`Error rendering page content for ${pageId}:`, renderErr);
  }

  if (typeof updateBottomNavIndicator === 'function') {
    setTimeout(updateBottomNavIndicator, 50);
  }
}
function doPrintCombined() {
  try {
    if (!currentReportData) return notify('Generate laporan terlebih dahulu', 'error');
    if (currentReportData.mode === 'akumulasi') return notify('Laporan Pembangunan hanya tersedia untuk Mode Bulanan', 'error');

    let htmlCombined = '';

    const hasJemaat = (currentReportData.incByCategory || currentReportData.expByDept);
    if (hasJemaat) {
      htmlCombined += generateComplexReportHtml(false);
    }

    const htmlPembangunan = generatePembangunanReportHtml(currentReportData, false);
    const hasPembangunan = htmlPembangunan && htmlPembangunan.trim() !== '' && htmlPembangunan.includes('<tr>');
    if (hasPembangunan) {
      if (hasJemaat) {
        htmlCombined += '<div style="page-break-before: always; margin-top: 1cm;"></div>';
      }
      htmlCombined += htmlPembangunan;
    }

    if (!htmlCombined) {
      return notify('Tidak ada data Laporan Umum maupun Pembangunan untuk dicetak.', 'error');
    }

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const baseUrl = window.location.origin + window.location.pathname;
    iframe.contentDocument.write(`<html><head><base href="${baseUrl}"><title>Laporan Gabungan</title><style>@page { size: landscape; margin: 1cm; } @media print { body { margin: 0; } table { page-break-inside: auto; } thead { display: table-header-group; } }</style></head><body onload="setTimeout(function(){ window.focus(); window.print(); }, 800)">${htmlCombined}</body></html>`);
    iframe.contentDocument.close();

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 15000);
  } catch (e) {
    console.error('doPrintCombined error:', e);
    notify('Error cetak PDF Gabungan: ' + e.message, 'error');
    alert('Error cetak PDF Gabungan: ' + e.message + '\\n\\nStack: ' + e.stack);
  }
}

function doPrintPembangunan() {
  if (!currentReportData) return notify('Generate laporan terlebih dahulu', 'error');
  if (currentReportData.mode === 'akumulasi') return notify('Laporan Pembangunan hanya tersedia untuk Mode Bulanan', 'error');

  const html = generatePembangunanReportHtml(currentReportData);
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  iframe.contentDocument.write(`<html><head><title>Laporan Pembangunan</title><style>@media print { body { margin: 0; } table { page-break-inside: auto; } thead { display: table-header-group; } }</style></head><body onload="setTimeout(function(){ window.focus(); window.print(); }, 800)">${html}</body></html>`);
  iframe.contentDocument.close();

  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 15000);
}

function exportPembangunanExcel() {
  try {
    if (!currentReportData) return notify('Generate laporan terlebih dahulu', 'error');
    if (currentReportData.mode === 'akumulasi') return notify('Laporan Pembangunan hanya tersedia untuk Mode Bulanan', 'error');

    const tableHtml = generatePembangunanReportHtml(currentReportData, true);

    const html = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="utf-8">
          </head>
          <body style="background-color: white;">
            ${tableHtml}
          </body>
          </html>
        `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const month = document.getElementById('rptMonth') ? document.getElementById('rptMonth').value : currentReportData.month;
    const year = document.getElementById('rptYear') ? document.getElementById('rptYear').value : currentReportData.year;
    a.download = 'Laporan_Pembangunan_' + month + '_' + year + '.xls';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('Export Excel Pembangunan berhasil.', 'success');
  } catch (e) {
    console.error('exportPembangunanExcel error:', e);
    notify('Error export Excel: ' + e.message, 'error');
  }
}

function generatePembangunanReportHtml(data, isExcel = false) {
  if (!data) return '';
  const targetMonth = data.month;
  const targetYear = data.year;
  const targetDateStart = new Date(targetYear, targetMonth - 1, 1);
  const targetDateEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);

  const isViewer = currentUser && (hasRole(currentUser, 'Viewer') || hasRole(currentUser, 'Publik'));
  const isSensorUnit = isViewer || (document.getElementById('sensorUnit') ? document.getElementById('sensorUnit').checked : false);
  const isManualSignature = document.getElementById('manualSignature') ? document.getElementById('manualSignature').checked : false;

  // Pemasukan & Pengeluaran Bulan Ini
  let pemBulanIni = (cachedIncome || []).filter(x => {
    const tDate = new Date(x.date);
    return tDate >= targetDateStart && tDate <= targetDateEnd && (x.alloc_bangun > 0 || (x.income_type || '').toLowerCase().includes('pembangunan')) && x.income_type !== 'Mutasi Kas / Setor Bank';
  });

  let pengBulanIni = (cachedExpense || []).filter(x => {
    const tDate = new Date(x.date);
    return tDate >= targetDateStart && tDate <= targetDateEnd && x.source_balance === 'Pembangunan';
  });

  pengBulanIni = pengBulanIni.filter(x => x.department !== 'Mutasi Kas / Setor Bank');

  pemBulanIni.sort((a, b) => new Date(a.date) - new Date(b.date));
  pengBulanIni.sort((a, b) => new Date(a.date) - new Date(b.date));

  const allTx = [...pemBulanIni, ...pengBulanIni];
  const hasTransactions = allTx.length > 0;
  let gembalaApprovedAll = hasTransactions;
  let ketuaApprovedAll = hasTransactions;
  if (hasTransactions) {
    let hasExpenses = false;
    for (let i = 0; i < allTx.length; i++) {
      const x = allTx[i];
      if (x.income_type !== undefined) continue; // Skip income transactions
      hasExpenses = true;
      const isAdminApp = x.approved_by && x.approved_by.includes('Admin');
      const isKetua = x.approved_by && x.approved_by.includes('Ketua Jemaat');
      const isPendeta = x.approved_by && x.approved_by.includes('Pendeta');
      if (!isAdminApp && !isPendeta) gembalaApprovedAll = false;
      if (!isAdminApp && !isKetua) ketuaApprovedAll = false;
    }
    if (!hasExpenses) {
      gembalaApprovedAll = true;
      ketuaApprovedAll = true;
    }
  }

  const useBenImg = !isManualSignature && hasTransactions && systemConfig.sig_bendahara;
  const useKetuaImg = !isManualSignature && ketuaApprovedAll && systemConfig.sig_ketua;
  const useGembalaImg = !isManualSignature && gembalaApprovedAll && systemConfig.sig_pendeta;
  const useBgnImg = !isManualSignature && hasTransactions && systemConfig.sig_bangun;


  // Saldo Awal Pembangunan (dari awal waktu s.d targetDateStart - 1 ms)
  let calcBangun = cachedSaldo.initBangun || 0;
  (cachedIncome || []).forEach(i => {
    if (new Date(i.date) < targetDateStart) {
      const isBangun = (i.alloc_bangun > 0 || (i.income_type || '').toLowerCase().includes('pembangunan')) && i.income_type !== 'Mutasi Kas / Setor Bank';
      if (isBangun) {
        calcBangun += parseFloat(i.alloc_bangun || i.amount || 0);
      }
    }
  });
  (cachedExpense || []).forEach(e => {
    if (new Date(e.date) < targetDateStart && e.source_balance === 'Pembangunan') {
      if (e.department !== 'Mutasi Kas / Setor Bank') {
        calcBangun -= e.amount;
      }
    }
  });
  const saldoAwal = calcBangun;
  const fmtEx = (n) => isExcel ? n : fmt(n);

  // Akumulasi Pemasukan
  let sumPemasukan = 0;
  let pemRows = pemBulanIni.map(x => {
    const amt = parseFloat(x.alloc_bangun || x.amount || 0);
    sumPemasukan += amt;
    let dNote = x.note || x.nama_pemberi || 'Pembangunan';
    const targetUnit = (x.unit_name && x.unit_name !== '-') ? String(x.unit_name).trim() : (x.nama_pemberi ? String(x.nama_pemberi).trim() : '');

    if (isSensorUnit && targetUnit) {
      const uData = masterData && masterData.units
        ? masterData.units.find(u => String(u.name).toLowerCase() === targetUnit.toLowerCase())
        : null;
      const unitHasMembers = uData && (parseInt(uData.jumlah_anggota || 0) > 0);
      if (unitHasMembers) {
        dNote = 'Unit *** (Privasi)';
      }
    }

    return `<tr>
          <td style="border:1px solid #000; padding:4px; text-align:center;">${fmtDate(x.date)}</td>
          <td style="border:1px solid #000; padding:4px;">${x.receipt_no || '-'}</td>
          <td style="border:1px solid #000; padding:4px;">${dNote}</td>
          <td style="border:1px solid #000; padding:4px; text-align:right;">${fmtEx(amt)}</td>
        </tr>`;
  }).join('');

  if (pemBulanIni.length === 0) {
    pemRows = `<tr><td colspan="4" style="border:1px solid #000; padding:4px; text-align:center;">Kosong</td></tr>`;
  }

  // Akumulasi Pengeluaran
  let sumPengeluaran = 0;
  let pengRows = pengBulanIni.map(x => {
    const amt = parseFloat(x.amount || 0);
    sumPengeluaran += amt;
    let dNote = x.note || 'Pengeluaran Pembangunan';
    return `<tr>
          <td style="border:1px solid #000; padding:4px; text-align:center;">${fmtDate(x.date)}</td>
          <td style="border:1px solid #000; padding:4px;">${x.receipt_no || '-'}</td>
          <td style="border:1px solid #000; padding:4px;">${dNote}</td>
          <td style="border:1px solid #000; padding:4px; text-align:right;">${fmtEx(amt)}</td>
        </tr>`;
  }).join('');

  if (pengBulanIni.length === 0) {
    pengRows = `<tr><td colspan="4" style="border:1px solid #000; padding:4px; text-align:center;">Kosong</td></tr>`;
  }

  const mNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthName = mNames[targetMonth];

  const ts = `border-collapse:collapse; width:100%; font-family:sans-serif; font-size:10pt;`;
  const th = `border:1px solid #000; padding:4px; font-weight:bold; text-align:center;`;

  let html = `
        <table style="width: 100%; border: none; margin-bottom: 20px; color: #000; font-family: sans-serif;">
          <tr>
            <td style="width: 100px; border: none; text-align: left; vertical-align: middle; padding: 0;">
              <img src="${GMAHK_LOGO_BASE64}" style="width: 80px; height: auto;" alt="Logo Kiri" />
            </td>
            <td style="border: none; text-align: center; vertical-align: middle; padding: 0;">
              <h2 style="margin:0; font-size: 14pt; font-weight: bold;">GMAHK Jemaat ${systemConfig.app_name || 'PISGAH BISDAC'}</h2>
              <h3 style="margin:5px 0 0 0; font-size: 12pt;">Laporan Keuangan Pembangunan</h3>
              <p style="margin:5px 0 0 0; font-size: 10pt;">Bulan/Tahun: <strong>${monthName} ${targetYear}</strong></p>
            </td>
            <td style="width: 100px; border: none; text-align: right; vertical-align: middle; padding: 0;">
              <img src="${systemConfig.logo_sidebar || systemConfig.logo_login || './icons/PisgahColor.png'}" style="width: 80px; height: auto;" alt="Logo Kanan" />
            </td>
          </tr>
        </table>

        <div style="font-family:sans-serif; font-weight:bold; margin-bottom:4px;">Pemasukan</div>
        <table style="${ts}; margin-bottom:16px;">
          <thead>
            <tr>
              <th style="${th} width:15%;">Tanggal</th>
              <th style="${th} width:20%;">No. Voucher/kwitansi</th>
              <th style="${th} width:40%;">Deskripsi Penerimaan</th>
              <th style="${th} width:25%;">Amount IDR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; font-style:italic; background-color:yellow;"><center>Saldo Awal</center></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; text-align:right; background-color:yellow;">IDR &nbsp; &nbsp; ${fmtEx(saldoAwal)}</td>
            </tr>            
            <tr><td colspan="4" style="background-color:#4472c4; height:12px; border:1px solid #000;"></td></tr>
            ${pemRows}
            <tr>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; font-style:italic; background-color:#ffc000;"><center>Total pembangunan bulan ini</center></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; text-align:right; background-color:#ffc000;">IDR &nbsp; &nbsp; ${fmtEx(sumPemasukan)}</td>
            </tr>
            <tr>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; font-style:italic; background-color:yellow;"><center>Total saldo Pemasukan</center></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; text-align:right; background-color:yellow;">IDR &nbsp; &nbsp; ${fmtEx(saldoAwal + sumPemasukan)}</td>
            </tr>
          </tbody>
        </table>

        <div style="font-family:sans-serif; font-weight:bold; margin-bottom:4px;">Pengeluaran</div>
        <table style="${ts}">
          <thead>
            <tr>
              <th style="${th} width:15%;">Tanggal</th>
              <th style="${th} width:20%;">No. Voucher/kwitansi</th>
              <th style="${th} width:40%;">Deskripsi Pengeluaran</th>
              <th style="${th} width:25%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${pengRows}
            <tr>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; font-style:italic;"><center>Total saldo Pengeluaran</center></td>
              <td style="border:1px solid #000; padding:4px; text-align:right;">IDR &nbsp; &nbsp; ${sumPengeluaran === 0 ? '-' : fmtEx(sumPengeluaran)}</td>
            </tr>
            <tr>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; font-style:italic; background-color:yellow;"><center>Saldo Akhir Pembangunan</center></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; text-align:right; background-color:yellow;">IDR &nbsp; &nbsp; ${fmtEx(saldoAwal + sumPemasukan - sumPengeluaran)}</td>
            </tr>
            <tr style="page-break-inside: avoid;"><td colspan="7" style="border: none; padding: 0;">
      `;

  const imgBen = useBenImg ? `<img src="${systemConfig.sig_bendahara}" style="height:60px; max-width:140px; object-fit:contain; margin:5px auto; display:block;">` : `<br><br><br><br><br>`;
  const imgBgn = useBgnImg ? `<div style="position:relative; margin:10px auto 5px auto; height:90px; width:180px;"><img src="${systemConfig.sig_stempel || '/stamp.png'}" style="position: absolute; top: 50%; left: 5px; transform: translate(-50%, -50%) rotate(-5deg); height: 110px; width: 110px; opacity: 0.9; z-index: 5; pointer-events: none;"><img src="${systemConfig.sig_bangun}" style="height:90px; max-width:180px; object-fit:contain; position:relative; z-index:10; display:block; margin:0 auto; filter: contrast(1.5) drop-shadow(0.5px 0.5px 0px #000) drop-shadow(-0.5px -0.5px 0px #000);"></div>` : `<br><br><br><br><br>`;
  const imgKet = useKetuaImg ? `<img src="${systemConfig.sig_ketua}" style="height:60px; max-width:140px; object-fit:contain; margin:5px auto; display:block;">` : `<br><br><br><br><br>`;
  const imgPen = useGembalaImg ? `<img src="${systemConfig.sig_pendeta}" style="height:60px; max-width:140px; object-fit:contain; margin:5px auto; display:block;">` : `<br><br><br><br><br>`;

  const nameBen = systemConfig.sig_name_bendahara || 'Herbert JS Sagala';
  const titleBen = systemConfig.sig_title_bendahara || 'Bendahara Jemaat';
  const nameBgn = systemConfig.sig_name_bangun || 'Parulian Parhusip';
  const titleBgn = systemConfig.sig_title_bangun || 'Ketua Pembangunan';
  const nameKet = systemConfig.sig_name_ketua || 'Yosep Santoso';
  const titleKet = systemConfig.sig_title_ketua || 'Ketua Jemaat';
  const namePen = systemConfig.sig_name_pendeta || 'Pdt. Joseph Sitohang';
  const titlePen = systemConfig.sig_title_pendeta || 'Gembala Jemaat';

  const signHtml = `
        <table style="width: 100%; margin-top: 40px; text-align: center; font-family: sans-serif; font-size: 10pt; color: #000; border: none; background: transparent; page-break-inside: avoid;">
          <tr>
            <td style="width: 25%; border: none; vertical-align: top;">Dibuat Oleh,</td>
            <td style="width: 25%; border: none; vertical-align: top;">Disetujui Oleh,</td>
            <td style="width: 25%; border: none; vertical-align: top;">Disahkan Oleh,</td>
            <td style="width: 25%; border: none; vertical-align: top;">Mengetahui,</td>
          </tr>
          <tr>
            <td style="width: 25%; border: none; vertical-align: middle; height: 100px;">${imgBen}</td>
            <td style="width: 25%; border: none; vertical-align: middle; height: 100px;">${imgBgn}</td>
            <td style="width: 25%; border: none; vertical-align: middle; height: 100px;">${imgKet}</td>
            <td style="width: 25%; border: none; vertical-align: middle; height: 100px;">${imgPen}</td>
          </tr>
          <tr>
            <td style="width: 25%; border: none; vertical-align: bottom;"><strong>${nameBen}</strong><br>${titleBen}</td>
            <td style="width: 25%; border: none; vertical-align: bottom;"><strong>${nameBgn}</strong><br>${titleBgn}</td>
            <td style="width: 25%; border: none; vertical-align: bottom;"><strong>${nameKet}</strong><br>${titleKet}</td>
            <td style="width: 25%; border: none; vertical-align: bottom;"><strong>${namePen}</strong><br>${titlePen}</td>
          </tr>
        </table>
      `;

  html += signHtml;
  html += `</td></tr></tbody></table>`;

  return html;
}

function openSidebar() { document.getElementById('sidebar').classList.add('open'); document.getElementById('overlay').classList.add('show'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }

function toggleSidebarPin() {
  const isPinned = document.body.classList.toggle('sidebar-pinned');
  localStorage.setItem('pisgah_sidebar_pinned', isPinned ? 'true' : 'false');
  updatePinButtonState();
}

function updatePinButtonState() {
  const btn = document.getElementById('btnPinSidebar');
  if (!btn) return;
  const isPinned = document.body.classList.contains('sidebar-pinned');
  btn.classList.toggle('active', isPinned);
  btn.title = isPinned ? 'Lepas Kunci Sidebar (Mode Mini)' : 'Kunci Sidebar (Tetap Terbuka)';
}
window.toggleSidebarPin = toggleSidebarPin;
window.updatePinButtonState = updatePinButtonState;

const initLaporanApp = async () => {
  try {
    if (localStorage.getItem('pisgah_sidebar_pinned') === 'true' && window.innerWidth > 1100) {
      document.body.classList.add('sidebar-pinned');
    }
  } catch (e) { }
  updatePinButtonState();
  const urlParams = new URLSearchParams(window.location.search);
  const printId = urlParams.get('print');
  const searchQuery = urlParams.get('search');

  const tk = getToken();
  if (tk) {
    currentUser = getCurrentUser();
    if (currentUser) {
      if (document.getElementById('loginBtnText')) document.getElementById('loginBtnText').innerHTML = '<span class="spinner"></span> Memulihkan...';
      launchApp();
      return;
    }
  }

  if (printId || searchQuery) {
    setStatus('loading', searchQuery ? 'Mencari Transaksi...' : 'Menyiapkan Kuitansi (Publik)...');
    doLogin('test', 'Test1117!');
    return;
  }

  setStatus('loading', 'Menghubungkan...');
  // Run both concurrently without awaiting so the UI is responsive
  loadSystemConfig();
  checkAPIConnection();
};

window.onload = initLaporanApp;
if (document.readyState === 'complete') {
  initLaporanApp();
}




window.showCashTransactions = showCashTransactions;
window.hideLedgerModal = hideLedgerModal;

// --- INJECTED BY REFACTOR SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.icon-placeholder').forEach(el => {
    if (typeof getIcon === 'function') {
      el.outerHTML = getIcon(el.getAttribute('data-icon'), el.getAttribute('data-size'));
    }
  });
});

// --- EXPORT TO WINDOW ---
window.checkSaldo = checkSaldo;
window.generateComplexReportHtml = generateComplexReportHtml;
window.generateReceiptHTML = generateReceiptHTML;
window.saveSignatureText = saveSignatureText;
window.saveIncTypeForm = saveIncTypeForm;
window.getIncomeTypeConfig = getIncomeTypeConfig;
window.getPhotoBtnText = getPhotoBtnText;
window.loadAllTransactions = loadAllTransactions;
window.isReceiptDuplicate = isReceiptDuplicate;
window.getPhotoBtnIcon = getPhotoBtnIcon;
window.updateMyAccount = updateMyAccount;
window.removePhoto = removePhoto;
window.goToMyUnitHistory = goToMyUnitHistory;
window.doPrintReport = doPrintReport;
window.togglePassword = togglePassword;
window.updateClosingModalStatus = updateClosingModalStatus;
window.renderMasterUnits = renderMasterUnits;
window.renderUsers = renderUsers;
window.saveMutasiForm = saveMutasiForm;
window.apiPost = apiPost;
window.renderPhotoPreview = renderPhotoPreview;
window.loadReport = loadReport;
window.renderMasterDepts = renderMasterDepts;
window.toggleTheme = toggleTheme;
window.getSaldoForSource = getSaldoForSource;
window.deleteIncType = deleteIncType;
window.syncAllData = syncAllData;
window.saveUnitForm = saveUnitForm;
window.deleteTransaction = deleteTransaction;
window.clearToken = clearToken;
window.validatePassword = validatePassword;
window.deleteDept = deleteDept;
window.saveEditTransaction = saveEditTransaction;
window.handleEditTypeChange = handleEditTypeChange;
window.openBulkPrintModal = openBulkPrintModal;
window.renderRoles = renderRoles;
window.selectRoleTab = selectRoleTab;
window.handleManualSync = handleManualSync;
window.openSidebar = openSidebar;
window.formatRupiah = formatRupiah;
window.renderDashboard = renderDashboard;
window.setDashboardChartMode = setDashboardChartMode;
window.updateDashboardChart = updateDashboardChart;
window.editUser = editUser;
window.toggleUserCardPw = toggleUserCardPw;
window.getCatBadge = getCatBadge;
window.doPrintCombined = doPrintCombined;
window.changePhoto = changePhoto;
window.closeBulkPrintModal = closeBulkPrintModal;
window.deleteUser = deleteUser;
window.updateRolePerm = updateRolePerm;
window.exportHistoryExcel = exportHistoryExcel;
window.getIcon = getIcon;
window.openDashboardDetail = openDashboardDetail;
window.closeDashboardDetail = closeDashboardDetail;
window.handleSignatureUpload = handleSignatureUpload;
window.getToken = getToken;
window.openPhotoModalById = openPhotoModalById;
window.fmtDate = fmtDate;
window.launchApp = launchApp;
window.initForms = initForms;
window.renderLogs = renderLogs;
window.handleLogSearch = handleLogSearch;
window.handleLogActionFilter = handleLogActionFilter;
window.exportLogsToCSV = exportLogsToCSV;
window.downloadFullBackup = downloadFullBackup;
window.validateBackupFile = validateBackupFile;
window.closeBackupPreviewModal = closeBackupPreviewModal;
window.clearIncomeDraft = clearIncomeDraft;
window.clearExpenseDraft = clearExpenseDraft;
window.updateAppStatus = updateAppStatus;
window.loginAsPublic = loginAsPublic;
window.approveBulkTx = approveBulkTx;
window.saveExpenseForm = saveExpenseForm;
window.getActiveApiUrl = getActiveApiUrl;
window.groupTransactions = groupTransactions;
window.updateBottomNavIndicator = updateBottomNavIndicator;
window.notify = notify;
window.saveRolePermissions = saveRolePermissions;
window.closeClosingModal = closeClosingModal;
window.todayStr = todayStr;
window.applyConfig = applyConfig;
window.updateIncomeAlloc = updateIncomeAlloc;
window.safeIcon = safeIcon;
window.editIncType = editIncType;
window.handleLogoUpload = handleLogoUpload;
window.handleLoginBgUpload = handleLoginBgUpload;
window.resetLoginBg = resetLoginBg;
window.saveLoginHeroText = saveLoginHeroText;
window.updateRoleAnon = updateRoleAnon;
window.handleReceiptPhoto = handleReceiptPhoto;
window.saveDeptForm = saveDeptForm;
window.openPhotoModal = openPhotoModal;
window.checkAPIConnection = checkAPIConnection;
window.fmtInputDate = fmtInputDate;
window.openClosingModal = openClosingModal;
window.showGlobalLoading = showGlobalLoading;
window.renderReportView = renderReportView;
window.setStatus = setStatus;
window.renderMasterIncTypes = renderMasterIncTypes;
window.showCustomConfirm = showCustomConfirm;
window.updateLastReceipts = updateLastReceipts;
window.doLogin = doLogin;
window.updateThemeIcons = updateThemeIcons;
window.terbilang = terbilang;
window.apiPostWithFallback = apiPostWithFallback;
window.cancelEditUnit = cancelEditUnit;
window.searchByReceipt = searchByReceipt;
window.updateGlobalApprovalBadge = updateGlobalApprovalBadge;
window.generatePembangunanReportHtml = generatePembangunanReportHtml;
window.switchReportTab = switchReportTab;
window.renderIncomeList = renderIncomeList;
window.login = login;
window.renderHistory = renderHistory;
window.toggleMyUnitFilter = toggleMyUnitFilter;
window.resetPhotoUpload = resetPhotoUpload;
window.resetRolePerms = resetRolePerms;
window.checkMutSaldo = checkMutSaldo;
window.getDefaultRolePerms = getDefaultRolePerms;
window.toggleSortHistory = toggleSortHistory;
window.saveUserForm = saveUserForm;
window.printUnitReport = printUnitReport;
window.setToken = setToken;
window.closeSidebar = closeSidebar;
window.resetLogo = resetLogo;
window.closePhotoModal = closePhotoModal;
window.doPrintPembangunan = doPrintPembangunan;
window.renderExpenseList = renderExpenseList;
window.applyReportSensor = applyReportSensor;
window.closeEditModal = closeEditModal;
window.saveAppTextFromInputs = saveAppTextFromInputs;
window.getRolePerms = getRolePerms;
window.exportToExcel = exportToExcel;
window.exportPembangunanExcel = exportPembangunanExcel;
window.saveServerSettings = saveServerSettings;
window.saveIncomeForm = saveIncomeForm;
window.printTransaction = printTransaction;
window.updatePhotoModalView = updatePhotoModalView;
window.getUserUnits = getUserUnits;
window.parseRupiah = parseRupiah;
window.cancelEditDept = cancelEditDept;
window.openEditTrans = openEditTrans;
window.toggleCloseMonthFromModal = toggleCloseMonthFromModal;
window.showPage = showPage;
window.togglePhotoZoom = togglePhotoZoom;
window.openCurrentPhotoFull = openCurrentPhotoFull;
window.downloadCurrentPhoto = downloadCurrentPhoto;
window.regenerateReceiptInModal = regenerateReceiptInModal;
window.upgradeOldReceiptsToHD = upgradeOldReceiptsToHD;

function doPrintPartisipasi() {
  const allowedRoles = ['Admin', 'Bendahara', 'Ketua Jemaat', 'Pendeta', 'Gembala'];
  if (!currentUser || !allowedRoles.some(r => hasRole(currentUser, r))) {
    return notify('Anda tidak memiliki akses untuk mencetak laporan ini.', 'error');
  }
  if (!currentReportData) return notify('Generate laporan terlebih dahulu', 'error');

  const html = generatePartisipasiReportHtml(currentReportData);
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(html);
  iframe.contentWindow.document.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
}
window.doPrintPartisipasi = doPrintPartisipasi;

function generatePartisipasiReportHtml(data) {
  const mNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  let periodStr = `Periode: ${mNames[data.month] || ''} ${data.year || ''}`.trim();
  if (data.mode === 'akumulasi') {
    periodStr = `S/d: ${mNames[data.month] || ''} ${data.year || ''}`.trim();
    if (data.month === 0) periodStr = `S/d: Akhir Tahun ${data.year || ''}`.trim();
  }

  // Filter incomes
  const isMatch = (dateStr) => {
    const d = new Date(dateStr);
    if (data.mode === 'akumulasi') {
      if (data.year !== 0) {
        if (d.getFullYear() > data.year) return false;
        if (d.getFullYear() === data.year && data.month !== 0 && (d.getMonth() + 1) > data.month) return false;
      }
      return true;
    } else {
      if (data.year !== 0 && d.getFullYear() !== data.year) return false;
      if (data.month !== 0 && (d.getMonth() + 1) !== data.month) return false;
      return true;
    }
  };

  const parts = {}; // Group by unit_name -> nama_pemberi -> income_type -> amount
  let grandTotal = 0;
  let grandTotalCats = {};
  let allocDaerah = 0;
  let allocJemaat = 0;
  let allocBangun = 0;

  const isSensorUnit = document.getElementById('sensorUnit') ? document.getElementById('sensorUnit').checked : false;

  (cachedIncome || []).filter(x => isMatch(x.date)).forEach(x => {
    if (x.income_type === 'Mutasi Kas / Setor Bank') return;
    let unit = (x.unit_name && x.unit_name !== '-') ? x.unit_name : 'Lainnya / Tanpa Unit';
    let pemberi = (x.nama_pemberi && x.nama_pemberi !== '-') ? x.nama_pemberi : 'Hamba Tuhan';

    if (isSensorUnit && unit !== 'Lainnya / Tanpa Unit') {
      const uData = masterData && masterData.units
        ? masterData.units.find(u => String(u.name).toLowerCase() === String(unit).toLowerCase())
        : null;
      const unitHasMembers = uData && (parseInt(uData.jumlah_anggota || 0) > 0);
      if (unitHasMembers) {
        unit = 'Unit *** (Privasi)';
      }
    }

    const pStr = String(pemberi).toLowerCase();
    if (pStr.startsWith('kolektif ')) {
      pemberi = String(pemberi).substring(9).trim();
    } else if (pStr.endsWith(' - kolektif')) {
      pemberi = String(pemberi).substring(0, pemberi.length - 11).trim();
    } else if (pStr === 'kolektif') {
      pemberi = 'Umum';
    }

    const cat = x.income_type || 'Lainnya';
    const amt = parseFloat(x.amount || 0);

    if (!parts[unit]) parts[unit] = { total: 0, givers: {}, cats: {} };
    if (!parts[unit].givers[pemberi]) parts[unit].givers[pemberi] = { total: 0, cats: {} };

    if (!parts[unit].givers[pemberi].cats[cat]) parts[unit].givers[pemberi].cats[cat] = 0;
    parts[unit].givers[pemberi].cats[cat] += amt;
    parts[unit].givers[pemberi].total += amt;

    if (!parts[unit].cats[cat]) parts[unit].cats[cat] = 0;
    parts[unit].cats[cat] += amt;
    parts[unit].total += amt;

    if (!grandTotalCats[cat]) grandTotalCats[cat] = 0;
    grandTotalCats[cat] += amt;
    grandTotal += amt;

    allocDaerah += parseFloat(x.alloc_daerah || 0);
    allocJemaat += parseFloat(x.alloc_jemaat || 0);
    allocBangun += parseFloat(x.alloc_bangun || 0);
  });

  let tbodyHtml = '';
  let no = 1;

  const sortedUnits = Object.keys(parts).sort((a, b) => a.localeCompare(b));

  sortedUnits.forEach(unit => {
    const uData = parts[unit];
    const sortedGivers = Object.keys(uData.givers).sort((a, b) => a.localeCompare(b));

    tbodyHtml += `
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="2" style="padding: 8px; border: 1px solid #e2e8f0; text-align: left; font-size: 14px;">UNIT PEMBERI: ${unit.toUpperCase()}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-size: 14px;">Total Unit: Rp ${fmt(uData.total)}</td>
          </tr>
        `;

    sortedGivers.forEach(giver => {
      const gData = uData.givers[giver];

      let catDetails = [];
      Object.keys(gData.cats).forEach(cat => {
        if (gData.cats[cat] > 0) {
          catDetails.push(`${cat}: Rp ${fmt(gData.cats[cat])}`);
        }
      });

      tbodyHtml += `
            <tr>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; width: 40px; font-size: 12px;">${no++}</td>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 12px;">
                <div style="font-weight: 600;">${giver}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${catDetails.join(', ')}</div>
              </td>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right; font-size: 12px; font-weight: 500;">Rp ${fmt(gData.total)}</td>
            </tr>
          `;
    });
  });

  if (sortedUnits.length === 0) {
    tbodyHtml += `<tr><td colspan="3" style="text-align: center; padding: 20px; color: #64748b; font-style: italic;">Tidak ada data partisipasi di periode ini.</td></tr>`;
  }

  let grandCatHtml = '';
  Object.keys(grandTotalCats).forEach(cat => {
    grandCatHtml += `<div>${cat}: <span style="font-weight:600;">Rp ${fmt(grandTotalCats[cat])}</span></div>`;
  });

  return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background: white; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 5px; color: #0f172a; text-transform: uppercase; }
            h2 { text-align: center; font-size: 14px; margin-bottom: 20px; color: #475569; font-weight: normal; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; font-size: 12px; color: #334155; text-align: left; }
            td { border: 1px solid #e2e8f0; }
            .total-row td { background-color: #f8fafc; font-weight: bold; border-top: 2px solid #94a3b8; }
            @media print {
              @page { size: A4 portrait; margin: 15mm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>LAPORAN PARTISIPASI JEMAAT (PER UNIT PEMBERI)</h1>
          <h2>${systemConfig.app_name || 'Gereja'} - ${periodStr}</h2>

          <table>
            <thead>
              <tr>
                <th style="width:40px; text-align:center;">No</th>
                <th>Nama Anggota & Rincian Kategori</th>
                <th style="text-align:right; width:150px;">Total Bantuan</th>
              </tr>
            </thead>
            <tbody>
              ${tbodyHtml}
              <tr class="total-row">
                <td colspan="2" style="text-align: right; padding: 12px 8px; font-size: 14px;">GRAND TOTAL:</td>
                <td style="text-align: right; padding: 12px 8px; font-size: 14px; color: #059669;">Rp ${fmt(grandTotal)}</td>
              </tr>
            </tbody>
          </table>

          <div style="font-size: 12px; margin-top: 20px; padding: 15px; border: 1px solid #e2e8f0; background-color: #f8fafc; border-radius: 6px; page-break-inside: avoid; break-inside: avoid;">
            <div style="font-weight:bold; margin-bottom: 8px;">Ringkasan Grand Total Per Kategori (Seluruh Unit):</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              ${grandCatHtml}
            </div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #cbd5e1;">
              <div style="font-weight:bold; margin-bottom: 8px; color: #334155;">Ringkasan Alokasi Distribusi:</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-weight: 500;">
                <div style="color: #ea580c;">Daerah: Rp ${fmt(allocDaerah)}</div>
                <div style="color: #2563eb;">Jemaat: Rp ${fmt(allocJemaat)}</div>
                <div style="color: #059669;">Pembangunan: Rp ${fmt(allocBangun)}</div>
              </div>
            </div>

            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-weight: bold; font-size: 14px; text-align: right;">
              TOTAL KESELURUHAN: Rp ${fmt(grandTotal)}
            </div>
          </div>
          
          <div style="margin-top: 40px; font-size: 12px; text-align: right; color: #64748b;">
            Dicetak pada: ${new Date().toLocaleString('id-ID')}
          </div>
        </body>
        </html>
      `;
}

window.apiGet = apiGet;
window.fmt = fmt;
window.calculateExtendedBalances = calculateExtendedBalances;
window.loadSystemConfig = loadSystemConfig;
window.deleteUnit = deleteUnit;
window.editUnit = editUnit;
window.openUnitModal = openUnitModal;
window.closeUnitModal = closeUnitModal;
window.openIncTypeModal = openIncTypeModal;
window.closeIncTypeModal = closeIncTypeModal;
window.editIncType = editIncType;
window.saveIncTypeForm = saveIncTypeForm;
window.deleteIncType = deleteIncType;
window.openDeptModal = openDeptModal;
window.closeDeptModal = closeDeptModal;
window.editDept = editDept;
window.saveDeptForm = saveDeptForm;
window.deleteDept = deleteDept;
window.approveTx = approveTx;
window.checkMonthClosed = checkMonthClosed;
window.cancelEditUser = cancelEditUser;
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.handleUserSort = handleUserSort;
window.handleUserSearch = handleUserSearch;
window.deleteUser = deleteUser;
window.loadMasterData = loadMasterData;
window.getCurrentUser = getCurrentUser;
window.renderMutasiList = renderMutasiList;
window.hideGlobalLoading = hideGlobalLoading;
window.cancelEditIncType = cancelEditIncType;
window.loadPembangunanData = loadPembangunanData;
window.doBulkPrint = doBulkPrint;
window.isPrivateCategory = isPrivateCategory;
window.doLogout = doLogout;
window.preLoadLogos = preLoadLogos;
window.handleTypeChange = handleTypeChange;

window.toggleEditMode = function (containerId, btnId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let isLocked = container.hasAttribute('disabled');
  const btn = document.getElementById(btnId);

  if (isLocked) {
    container.removeAttribute('disabled');
    if (btn) {
      btn.innerHTML = '<span class="icon-placeholder" data-icon="lockOpen" data-size="lucide-md"></span> Mode Edit Aktif';
      btn.classList.add('badge-gold');
      btn.classList.remove('badge-gray');
    }
  } else {
    container.setAttribute('disabled', 'disabled');
    if (btn) {
      btn.innerHTML = '<span class="icon-placeholder" data-icon="lock" data-size="lucide-md"></span> Mode Edit';
      btn.classList.remove('badge-gold');
      btn.classList.add('badge-gray');
    }
  }

  document.querySelectorAll('.icon-placeholder').forEach(el => {
    if (typeof getIcon === 'function' && el.parentElement) {
      el.outerHTML = getIcon(el.getAttribute('data-icon'), el.getAttribute('data-size'));
    }
  });
};

// [No. Series Config & Generator extracted to ./modules/seriesService.js]
window.renderSeriesHistory = renderSeriesHistory;

document.addEventListener('DOMContentLoaded', () => {
  // Wrap text nodes in sidebar nav items and logout btn to hide them smoothly
  document.querySelectorAll('.nav-item').forEach(item => {
    item.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
        const span = document.createElement('span');
        span.className = 'sidebar-text';
        span.textContent = child.textContent;
        item.replaceChild(span, child);
      }
    });
  });
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
        const span = document.createElement('span');
        span.className = 'sidebar-text';
        span.textContent = child.textContent;
        logoutBtn.replaceChild(span, child);
      }
    });
  }

  const curY = new Date().getFullYear();
  let html = '';
  for (let y = 2024; y <= curY + 5; y++) {
    html += `<option value="${y}" ${y === curY ? 'selected' : ''}>${y}</option>`;
  }
  let seriesYearEl = document.getElementById('seriesYear');
  if (seriesYearEl) {
    seriesYearEl.innerHTML = html;
    document.getElementById('seriesMonth').value = (new Date().getMonth() + 1).toString();
  }
});

// --- Table Column Resizer ---
function initTableResizer(table) {
  if (table.classList.contains('resizable-initialized')) return;
  table.classList.add('resizable-initialized');

  const cols = table.querySelectorAll('th');
  [].forEach.call(cols, function (col) {
    if (col.querySelector('.resizer')) return;

    const resizer = document.createElement('div');
    resizer.classList.add('resizer');
    col.appendChild(resizer);

    let x = 0;
    let w = 0;

    const mouseDownHandler = function (e) {
      x = e.clientX;
      const styles = window.getComputedStyle(col);
      w = parseInt(styles.width, 10);

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      resizer.classList.add('resizing');
    };

    const mouseMoveHandler = function (e) {
      const dx = e.clientX - x;
      col.style.width = `${w + dx}px`;
      col.style.minWidth = `${w + dx}px`;
      col.style.maxWidth = 'none';
    };

    const mouseUpHandler = function () {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      resizer.classList.remove('resizing');
    };

    resizer.addEventListener('mousedown', mouseDownHandler);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // ELEMENT_NODE
          if (node.tagName === 'TABLE' && (node.classList.contains('table-log') || node.classList.contains('table-report') || node.classList.contains('table-history'))) {
            initTableResizer(node);
          }
          const tables = node.querySelectorAll ? node.querySelectorAll('.table-log, .table-report, .table-history') : [];
          tables.forEach(initTableResizer);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll('.table-log, .table-report, .table-history').forEach(initTableResizer);
});

// [UI Enhancements extracted to ./modules/uiService.js]
// [Sabbath Bulletin Service extracted to ./modules/bulletinService.js]
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initPremiumDatePickers();
    initPasswordStrength('userPassword', 'userPassStrength');
    initPasswordStrength('myNewPassword', 'myNewPassStrength');
  }, 1000);
});
