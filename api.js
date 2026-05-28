// ============================================================
//  api.js — Modul API untuk menghubungkan Frontend ke GAS
//  Tambahkan file ini ke proyek GitHub Pages Anda
// ============================================================

// Ganti dengan URL deployment Google Apps Script Anda
const API_URL = 'https://script.google.com/macros/s/AKfycbwL6zRobieJ7Y3Xehr_YbxRXyw26FE9FkOZ35c9NgrWx05ifUF07dv2hq-zaQ1oKEjg/exec';

// Token disimpan di sessionStorage (hilang saat tab ditutup)
function getToken() { return sessionStorage.getItem('sikas_token'); }
function setToken(t) { sessionStorage.setItem('sikas_token', t); }
function clearToken() { sessionStorage.removeItem('sikas_token'); }

// ============================================================
//  BASE FETCH HELPERS
// ============================================================

// GET request — untuk ambil data
async function apiGet(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('token', getToken() || '');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res  = await fetch(url.toString());
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Request gagal');
  return data;
}

// POST request — untuk simpan data
async function apiPost(action, payload = {}) {
  const body = JSON.stringify({ action, token: getToken(), data: payload });
  const res  = await fetch(API_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Request gagal');
  return data;
}

// ============================================================
//  AUTH
// ============================================================
async function login(username, password) {
  const url = new URL(API_URL);
  url.searchParams.set('action', 'login');
  url.searchParams.set('username', username);
  url.searchParams.set('password', password);

  const res  = await fetch(url.toString());
  const data = await res.json();

  if (data.success) {
    setToken(data.token);
    // Simpan info user di sessionStorage
    sessionStorage.setItem('sikas_user', JSON.stringify(data.user));
  }
  return data;
}

function logout() {
  clearToken();
  sessionStorage.removeItem('sikas_user');
  window.location.reload();
}

function getCurrentUser() {
  const u = sessionStorage.getItem('sikas_user');
  return u ? JSON.parse(u) : null;
}

// ============================================================
//  DASHBOARD
// ============================================================
async function getDashboard(month, year) {
  return apiGet('getDashboard', { month, year });
}

// ============================================================
//  MASTER DATA
// ============================================================
async function getMasterData() {
  return apiGet('getMasterData');
}

// ============================================================
//  PEMASUKAN
// ============================================================
async function saveIncome(data) {
  return apiPost('saveIncome', data);
}

async function getIncomeList(month, year) {
  return apiGet('getIncomeList', { month, year });
}

// ============================================================
//  PENGELUARAN
// ============================================================
async function saveExpense(data) {
  return apiPost('saveExpense', data);
}

async function getExpenseList(month, year) {
  return apiGet('getExpenseList', { month, year });
}

// ============================================================
//  LAPORAN
// ============================================================
async function getMonthlyReport(month, year) {
  return apiGet('getMonthlyReport', { month, year });
}

// ============================================================
//  SALDO
// ============================================================
async function getBalances() {
  return apiGet('getBalances');
}

// ============================================================
//  ADMIN
// ============================================================
async function saveDepartment(data) {
  return apiPost('saveDepartment', data);
}

async function saveUnit(data) {
  return apiPost('saveUnit', data);
}

async function saveUser(data) {
  return apiPost('saveUser', data);
}

async function setInitialBalance(daerah, jemaat, pembangunan) {
  return apiPost('setInitialBalance', { daerah, jemaat, pembangunan });
}

async function deleteRecord(type, transaction_id) {
  return apiPost('deleteRecord', { type, transaction_id });
}

// ============================================================
//  CONTOH PENGGUNAAN
//  (Copy snippet ini ke dalam keuangan-gereja.html Anda)
// ============================================================

/*

// ── Login ──────────────────────────────────────────────────
const result = await login('admin', 'Admin1234');
if (result.success) console.log('Masuk sebagai:', result.user.nama);

// ── Dashboard ─────────────────────────────────────────────
const dash = await getDashboard(5, 2026);
console.log('Saldo total:', dash.data.balances.total);
console.log('Pemasukan bulan ini:', dash.data.totalIncome);

// ── Simpan Pemasukan ──────────────────────────────────────
await saveIncome({
  date:        '2026-05-28',
  income_type: 'Perpuluhan',
  unit_name:   'Unit A',
  receipt_no:  'T-099',
  amount:      750000,
  note:        'Sabat 28 Mei'
});

// ── Simpan Pengeluaran ────────────────────────────────────
await saveExpense({
  date:           '2026-05-28',
  department:     'Diakonia',
  source_balance: 'Kas Jemaat',
  receipt_no:     'B-088',
  amount:         200000,
  note:           'Bantuan jemaat'
});

// ── Laporan Bulanan ───────────────────────────────────────
const laporan = await getMonthlyReport(5, 2026);
console.log('Detail per kategori:', laporan.data.incByCategory);

// ── Master Data (untuk isi dropdown) ─────────────────────
const master = await getMasterData();
// master.data.departments → daftar departemen
// master.data.units       → daftar unit pemberi
// master.data.incomeTypes → jenis pemasukan + persentase alokasi

// ── Set Saldo Awal (sekali saja) ──────────────────────────
await setInitialBalance(2000000, 1500000, 3000000);

*/