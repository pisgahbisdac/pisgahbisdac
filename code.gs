// ============================================================
//  SiKas — Sistem Keuangan Gereja
//  Google Apps Script Backend (laporan.gs) - UPDATED: Multi-Photo Support (3 Foto)
//  Tempel seluruh file ini ke Apps Script Editor Anda
// ============================================================
const SPREADSHEET_ID = '11sU4BhJAu1h5_5Bz2DGxftIy-2b-o62Sq5sewzR6OaQ';
const INVENTORY_SPREADSHEET_ID = '11sU4BhJAu1h5_5Bz2DGxftIy-2b-o62Sq5sewzR6OaQ';

const SHEETS = {
  INCOME:       'Income',
  EXPENSE:      'Expense',
  DEPARTMENTS:  'Departments',
  UNITS:        'Units',
  INCOME_TYPES: 'IncomeTypes',
  BALANCES:     'Balances',
  USERS:        'Users',
  LOGS:         'Logs',
  CONFIG:       'Config',
  INVENTORY:    'Inventory',
  INVENTORY_SERVICE: 'Inventory_Service'
};

// ============================================================
//  CORS HEADER HELPER
// ============================================================
function hasRole(userRoleStr, targetRole) {
  if (!userRoleStr) return false;
  const roles = userRoleStr.split(',').map(r => r.trim());
  return roles.includes(targetRole);
}

function corsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
//  ENTRY POINT — doGet
// ============================================================
function doGet(e) {
  try {
    const action = e.parameter.action;
    const token  = e.parameter.token;

    if (action === 'ping') {
      return corsResponse({ success: true, message: 'pong' });
    }

    if (action === 'login') {
      return corsResponse(handleLogin(e.parameter));
    }

    if (action === 'getConfig') {
      return corsResponse(getConfig());
    }
    
    if (action === 'getInventory') {
      return corsResponse(getInventory());
    }
    
    if (action === 'getInventoryService') {
      return corsResponse(getInventoryService(e.parameter));
    }

    const user = verifyToken(token);
    if (!user) {
      return corsResponse({ success: false, message: 'Token tidak valid atau session kedaluwarsa.' });
    }

    switch (action) {
      case 'getDashboard':    return corsResponse(getDashboard(e.parameter, user));
      case 'getMasterData':   return corsResponse(getMasterData());
      case 'getIncomeList':   return corsResponse(getIncomeList(e.parameter));
      case 'getExpenseList':  return corsResponse(getExpenseList(e.parameter));
      case 'getMonthlyReport':return corsResponse(getMonthlyReport(e.parameter));
      case 'getBalances':     return corsResponse(getBalances());
      case 'getUsers':        return corsResponse(getUsers(user));
      case 'getLogs':         return corsResponse(getLogs(user));

      default:
        return corsResponse({ success: false, message: 'Action tidak dikenali: ' + action });
    }
  } catch (err) {
    return corsResponse({ success: false, message: 'Error doGet: ' + err.message });
  }
}

// ============================================================
//  ENTRY POINT — doPost
// ============================================================
function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action;
    const token  = body.token;
    const data   = body.data || {};

    // Handle login & ping WITHOUT token verification
    if (action === 'login') return corsResponse(handleLogin(body));
    if (action === 'ping')  return corsResponse({ success: true, message: 'pong' });

    // Handle public GET-equivalent actions (no token needed)
    if (action === 'getConfig')           return corsResponse(getConfig());
    if (action === 'getInventory')        return corsResponse(getInventory());
    if (action === 'getInventoryService') return corsResponse(getInventoryService(data));

    const user = verifyToken(token);
    if (!user) {
      return corsResponse({ success: false, message: 'Token tidak valid atau session kedaluwarsa.' });
    }

    const adminOnly   = [
      'saveDepartment', 'deleteRecord', 'saveUnit', 'saveUser', 
      'setInitialBalance', 'deleteDepartment', 'deleteUnit',
      'saveConfig', 'saveIncomeType', 'deleteIncomeType'
    ];
    const bendaharaUp = ['saveIncome', 'saveBulkIncome', 'saveExpense', 'editRecord', 'editBulkIncome'];
    const inventoryUp = ['saveInventory', 'deleteInventory'];
    const approvers = ['Ketua Jemaat', 'Pendeta', 'Admin'];

    // --- PERBAIKAN HAK AKSES BENDAHARA ---
    if (adminOnly.includes(action) && !hasRole(user.role, 'Admin')) {
      if (action === 'saveConfig' && hasRole(user.role, 'Bendahara') && data.key === 'receipt_series') {
        // Izinkan Bendahara jika hanya menyimpan 'receipt_series' (No. Series)
      } else {
        return corsResponse({ success: false, message: 'Akses ditolak. Hanya Admin.' });
      }
    }
    // -------------------------------------
    
    if (bendaharaUp.includes(action) && !hasRole(user.role, 'Admin') && !hasRole(user.role, 'Bendahara') && !hasRole(user.role, 'Pendeta') && !hasRole(user.role, 'Ketua Jemaat')) {
      return corsResponse({ success: false, message: 'Akses ditolak. Anda tidak memiliki role untuk menginput data.' });
    }

    if (inventoryUp.includes(action) && !hasRole(user.role, 'Admin') && !hasRole(user.role, 'Bendahara') && !hasRole(user.role, 'Diakon')) {
      return corsResponse({ success: false, message: 'Akses ditolak. Anda tidak memiliki role untuk mengelola inventaris.' });
    }

    switch (action) {
      // GET-equivalent actions (now routed via POST)
      case 'getDashboard':    return corsResponse(getDashboard(data, user));
      case 'getMasterData':   return corsResponse(getMasterData());
      case 'getIncomeList':   return corsResponse(getIncomeList(data));
      case 'getExpenseList':  return corsResponse(getExpenseList(data));
      case 'getMonthlyReport':return corsResponse(getMonthlyReport(data));
      case 'getBalances':     return corsResponse(getBalances());
      case 'getUsers':        return corsResponse(getUsers(user));
      case 'getLogs':         return corsResponse(getLogs(user));
      // POST actions
      case 'saveIncome':        return corsResponse(saveIncome(data, user));
      case 'saveBulkIncome':    return corsResponse(saveBulkIncome(data, user));
      case 'saveExpense':       return corsResponse(saveExpense(data, user));
      case 'saveDepartment':    return corsResponse(saveDepartment(data, user));
      case 'saveUnit':          return corsResponse(saveUnit(data, user));
      case 'saveUser':          return corsResponse(saveUser(data, user));
      case 'setInitialBalance': return corsResponse(setInitialBalance(data, user));
      case 'deleteRecord':      return corsResponse(deleteRecord(data, user));
      case 'editRecord':        return corsResponse(editRecord(data, user));
      case 'editBulkIncome':    return corsResponse(editBulkIncome(data, user));
      case 'deleteDepartment':  return corsResponse(deleteDepartment(data, user));
      case 'deleteUnit':        return corsResponse(deleteUnit(data, user));
      case 'saveConfig':        return corsResponse(saveConfig(data, user));
      case 'deleteIncomeType':  return corsResponse(deleteIncomeType(data, user));
      case 'saveIncomeType':    return corsResponse(saveIncomeType(data, user));
      case 'saveInventory':     return corsResponse(saveInventory(data, user));
      case 'deleteInventory':   return corsResponse(deleteInventory(data, user));
      case 'saveInventoryService': return corsResponse(saveInventoryService(data, user));
      case 'deleteInventoryService': return corsResponse(deleteInventoryService(data, user));
      case 'approveTransaction':
        if (!hasRole(user.role, 'Admin') && !hasRole(user.role, 'Ketua Jemaat') && !hasRole(user.role, 'Pendeta')) return corsResponse({ success: false, message: 'Akses ditolak. Hanya Ketua Jemaat, Pendeta, atau Admin.' });
        return corsResponse(approveTransaction(data, user));
      default:
        return corsResponse({ success: false, message: 'Action tidak dikenali: ' + action });
    }
  } catch (err) {
    return corsResponse({ success: false, message: 'Error doPost: ' + err.message });
  }
}

// ============================================================
//  AUTH & TOKEN CACHING
// ============================================================
function handleLogin(params) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const [username, passHashOrText, role, nama, aktif] = rows[i];
    if (username.toString().toLowerCase() === params.username.toString().toLowerCase() && aktif === true) {
      
      const inputHash = hashPassword(params.password);
      
      if (inputHash === passHashOrText || params.password === passHashOrText) {
        const token = generateToken();
        const userData = {
          username: username,
          role: role,
          nama: nama,
          expires: Date.now() + 24 * 60 * 60 * 1000  // 24 jam
        };
        
        CacheService.getScriptCache().put(token, JSON.stringify(userData), 21600);
        writeLog(username, 'LOGIN', 'Login berhasil');
        return { success: true, token, user: { username, role, nama } };
      }
    }
  }
  return { success: false, message: 'Username atau password salah atau akun dinonaktifkan.' };
}

function verifyToken(token) {
  if (!token) return null;
  const cached = CacheService.getScriptCache().get(token);
  if (!cached) return null;
  
  const session = JSON.parse(cached);
  if (Date.now() > session.expires) {
    CacheService.getScriptCache().remove(token);
    return null;
  }
  return session;
}

function generateToken() {
  return Utilities.getUuid();
}

function hashPassword(password) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

// ============================================================
//  CONFIG (LOGO & PENGATURAN)
// ============================================================
function getConfig() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEETS.CONFIG);
    if (!sheet) return { success: true, data: {} };
    
    const data = sheet.getDataRange().getValues();
    let config = {};
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) config[data[i][0]] = data[i][1];
    }
    return { success: true, data: config };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function saveConfig(data, user) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEETS.CONFIG);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.CONFIG);
      sheet.appendRow(['Key', 'Value']);
      sheet.getRange(1, 1, 1, 2).setBackground('#1a2e22').setFontColor('#ffffff').setFontWeight('bold');
    }
    
    const rows = sheet.getDataRange().getValues();
    let found = false;
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.key) {
        sheet.getRange(i + 1, 2).setValue(data.value);
        found = true;
        break;
      }
    }
    
    if (!found) {
      sheet.appendRow([data.key, data.value]);
    }
    
    writeLog(user.username, 'UPDATE_CONFIG', `Update pengaturan: ${data.key}`);
    return { success: true, message: 'Pengaturan berhasil disimpan.' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

// ============================================================
//  DASHBOARD
// ============================================================
function getDashboard(params, user) {
  const month = parseInt(params.month) || 0;
  const year  = parseInt(params.year)  || new Date().getFullYear();

  const income  = getAllIncome();
  const expense = getAllExpense();

  const filterFn = row => {
    const d = new Date(row.date);
    return d.getFullYear() === year && (month === 0 || d.getMonth() + 1 === month);
  };

  const filteredInc = income.filter(filterFn);
  const filteredExp = expense.filter(filterFn);

  let targetDateEnd;
  if (month === 0) {
    targetDateEnd = new Date(year, 11, 31, 23, 59, 59);
  } else {
    targetDateEnd = new Date(year, month, 0, 23, 59, 59);
  }

  const historicalInc = income.filter(row => new Date(row.date) <= targetDateEnd);
  const historicalExp = expense.filter(row => new Date(row.date) <= targetDateEnd);

  const balances    = computeBalances(historicalInc, historicalExp);
  const totalIncome = filteredInc.reduce((s, i) => s + i.amount, 0);
  const totalExpense= filteredExp.reduce((s, e) => s + e.amount, 0);

  const byCategory = {};
  filteredInc.forEach(i => {
    if (!byCategory[i.income_type]) byCategory[i.income_type] = 0;
    byCategory[i.income_type] += i.amount;
  });

  const byDept = {};
  filteredExp.forEach(e => {
    if (!byDept[e.department]) byDept[e.department] = 0;
    byDept[e.department] += e.amount;
  });

  const recent = [
    ...filteredInc.map(i => ({ ...i, kind: 'income' })),
    ...filteredExp.map(e => ({ ...e, kind: 'expense' }))
  ]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 10);

  return {
    success: true,
    data: {
      balances,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      byCategory,
      byDept,
      recent
    }
  };
}

// ============================================================
//  SALDO — Perhitungan Dinamis
// ============================================================
function computeBalances(income, expense) {
  const ss        = SpreadsheetApp.getActiveSpreadsheet();
  const balSheet  = ss.getSheetByName(SHEETS.BALANCES);
  const balData   = balSheet.getDataRange().getValues();

  let initDaerah = 0, initJemaat = 0, initBangun = 0;
  for (let i = 1; i < balData.length; i++) {
    const source = balData[i][0];
    const balance = parseFloat(balData[i][1]) || 0;
    if (source === 'Daerah')      initDaerah = balance;
    if (source === 'Kas Jemaat')  initJemaat = balance;
    if (source === 'Pembangunan') initBangun = balance;
  }

  let daerah = initDaerah;
  let jemaat = initJemaat;
  let bangun = initBangun;

  income.forEach(i => {
    daerah += (i.alloc_daerah  || 0);
    jemaat += (i.alloc_jemaat  || 0);
    bangun += (i.alloc_bangun  || 0);
  });

  expense.forEach(e => {
    const src = e.source_balance || '';
    if (src.includes('Daerah'))      daerah -= e.amount;
    if (src.includes('Kas Jemaat'))  jemaat -= e.amount;
    if (src.includes('Pembangunan')) bangun -= e.amount;
  });

  return {
    daerah,
    jemaat,
    bangun,
    total: daerah + jemaat + bangun,
    initDaerah,
    initJemaat,
    initBangun
  };
}

function getBalances() {
  const income  = getAllIncome();
  const expense = getAllExpense();
  return { success: true, data: computeBalances(income, expense) };
}

// ============================================================
//  PEMASUKAN — CRUD (UPDATED: Multi-Photo)
// ============================================================
function saveIncome(data, user) {
  const required = ['date', 'income_type', 'receipt_no', 'amount'];
  for (const f of required) {
    if (!data[f]) return { success: false, message: `Field '${f}' wajib diisi.` };
  }

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INCOME);

  const existing = sheet.getDataRange().getValues();
  for (let i = 1; i < existing.length; i++) {
    if (existing[i][7] === data.receipt_no) {
      return { success: false, message: 'Nomor kuitansi sudah digunakan: ' + data.receipt_no };
    }
  }

  const typeConfig = getIncomeTypeConfig(data.income_type);
  const amount     = parseFloat(data.amount);
  let allocDaerah = 0, allocJemaat = 0, allocBangun = 0;

  if (data.income_type === 'Persembahan Khusus') {
    allocDaerah = amount * (parseFloat(data.alloc_pct_daerah) || 0) / 100;
    allocJemaat = amount * (parseFloat(data.alloc_pct_jemaat) || 0) / 100;
    allocBangun = amount * (parseFloat(data.alloc_pct_bangun) || 0) / 100;
  } else if (typeConfig) {
    allocDaerah = amount * (typeConfig.pct_daerah || 0) / 100;
    allocJemaat = amount * (typeConfig.pct_jemaat || 0) / 100;
    allocBangun = amount * (typeConfig.pct_bangun || 0) / 100;
  } else {
    return { success: false, message: 'Jenis pemasukan tidak ditemukan: ' + data.income_type };
  }

  const d = new Date(data.date);
  const id = generateTransactionId('INC');
  const receipt_photo   = data.receipt_photo_base64   || '';
  const receipt_photo_2 = data.receipt_photo_base64_2 || '';
  const receipt_photo_3 = data.receipt_photo_base64_3 || '';

  sheet.appendRow([
    id,
    data.date,
    d.getMonth() + 1,
    d.getFullYear(),
    data.income_type,
    data.nama_pemberi || '',
    data.unit_name    || '-',
    data.receipt_no,
    amount,
    allocDaerah,
    allocJemaat,
    allocBangun,
    data.note         || '',
    user.username,
    new Date().toISOString(),
    receipt_photo,
    receipt_photo_2,
    receipt_photo_3,
    '' // approved_by
  ]);

  writeLog(user.username, 'SAVE_INCOME', `ID: ${id}, Jenis: ${data.income_type}, Nominal: ${amount}`);
  return { success: true, message: 'Pemasukan berhasil disimpan.', id };
}

function saveBulkIncome(data, user) {
  const required = ['date', 'unit_name', 'receipt_no', 'items'];
  for (const f of required) {
    if (!data[f]) return { success: false, message: `Field '${f}' wajib diisi.` };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INCOME);
  const d = new Date(data.date);

  const existing = sheet.getDataRange().getValues();
  for (let i = 1; i < existing.length; i++) {
    if (existing[i][7] === data.receipt_no) {
      return { success: false, message: 'Nomor kuitansi kolektif ini sudah digunakan sebelumnya: ' + data.receipt_no };
    }
  }

  const types = getIncomeTypes();
  const receipt_photo   = data.receipt_photo_base64   || '';
  const receipt_photo_2 = data.receipt_photo_base64_2 || '';
  const receipt_photo_3 = data.receipt_photo_base64_3 || '';

  data.items.forEach(item => {
    const amount = parseFloat(item.amount) || 0;
    if (amount > 0) {
      const typeConfig = types.find(t => t.name === item.income_type);
      let allocDaerah = 0, allocJemaat = 0, allocBangun = 0;

      if (typeConfig) {
        allocDaerah = amount * (typeConfig.pct_daerah || 0) / 100;
        allocJemaat = amount * (typeConfig.pct_jemaat || 0) / 100;
        allocBangun = amount * (typeConfig.pct_bangun || 0) / 100;
      }

      const id = generateTransactionId('INC');
      sheet.appendRow([
        id,
        data.date,
        d.getMonth() + 1,
        d.getFullYear(),
        item.income_type,
        'Kolektif ' + data.unit_name, 
        data.unit_name,
        data.receipt_no,
        amount,
        allocDaerah,
        allocJemaat,
        allocBangun,
        item.note || 'Setoran Kolektif',
        user.username,
        new Date().toISOString(),
        receipt_photo,
        receipt_photo_2,
        receipt_photo_3,
        '' // approved_by
      ]);
    }
  });

  writeLog(user.username, 'SAVE_BULK_INCOME', `Kuitansi Kolektif: ${data.receipt_no}, Unit: ${data.unit_name}`);
  return { success: true, message: 'Setoran kolektif berhasil disimpan ke sistem.' };
}


function getIncomeList(params) {
  const month = params && params.month ? parseInt(params.month) : 0;
  const year  = params && params.year ? parseInt(params.year) : 0;
  let   rows  = getAllIncome();

  if (year  > 0) rows = rows.filter(r => parseInt(r.year) === year);
  if (month > 0) rows = rows.filter(r => parseInt(r.month) === month);

  return { success: true, data: rows };
}

function getAllIncome() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INCOME);
  const rows  = sheet.getDataRange().getValues();
  const result = [];
  
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[0]) continue;
    result.push({
      transaction_id: r[0],
      date:           r[1],
      month:          parseInt(r[2]),
      year:           parseInt(r[3]),
      income_type:    r[4],
      nama_pemberi:   r[5],
      unit_name:      r[6],
      receipt_no:     r[7],
      amount:         parseFloat(r[8]) || 0,
      alloc_daerah:   parseFloat(r[9]) || 0,
      alloc_jemaat:   parseFloat(r[10]) || 0,
      alloc_bangun:   parseFloat(r[11]) || 0,
      note:           r[12],
      created_by:     r[13],
      created_at:     r[14],
      receipt_photo:    r[15] || '',
      receipt_photo_2:  r[16] || '',
      receipt_photo_3:  r[17] || '',
      approved_by:      r[18] || ''
    });
  }
  return result;
}

// ============================================================
//  PENGELUARAN — CRUD (UPDATED: Multi-Photo)
// ============================================================
function saveExpense(data, user) {
  const required = ['date', 'department', 'source_balance', 'receipt_no', 'amount'];
  for (const f of required) {
    if (!data[f]) return { success: false, message: `Field '${f}' wajib diisi.` };
  }

  const amount = parseFloat(data.amount);

  const income   = getAllIncome();
  const expense  = getAllExpense();
  const balances = computeBalances(income, expense);

  let available = 0;
  const src = data.source_balance || '';
  if (src.includes('Daerah'))      available = balances.daerah;
  if (src.includes('Kas Jemaat'))  available = balances.jemaat;
  if (src.includes('Pembangunan')) available = balances.bangun;

  if (amount > available) {
    return {
      success: false,
      message: `Saldo ${data.source_balance} tidak mencukupi. Tersedia: ${available.toLocaleString('id-ID')}`
    };
  }

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.EXPENSE);

  const existing = sheet.getDataRange().getValues();
  for (let i = 1; i < existing.length; i++) {
    if (existing[i][6] === data.receipt_no) {
      return { success: false, message: 'Nomor bukti sudah digunakan: ' + data.receipt_no };
    }
  }

  const d  = new Date(data.date);
  const id = generateTransactionId('EXP');
  const receipt_photo   = data.receipt_photo_base64   || '';
  const receipt_photo_2 = data.receipt_photo_base64_2 || '';
  const receipt_photo_3 = data.receipt_photo_base64_3 || '';
  
  const receiver = data.nama_penerima || data.receiver || data.recipient || data.penerima || '-';

  sheet.appendRow([
    id,
    data.date,
    d.getMonth() + 1,
    d.getFullYear(),
    data.department,
    data.source_balance,
    data.receipt_no,
    amount,
    data.note || '',
    user.username,
    new Date().toISOString(),
    receipt_photo,
    receiver,
    receipt_photo_2,
    receipt_photo_3,
    data.approved_by || ''
  ]);

  if (data.department === 'Mutasi Kas / Setor Bank') {
    const incSheet = ss.getSheetByName(SHEETS.INCOME);
    const incId = generateTransactionId('INC');
    let aD = 0, aJ = 0, aB = 0;
    const srcStr = (data.source_balance || '');
    if (srcStr.includes('Daerah')) aD = amount;
    else if (srcStr.includes('Kas Jemaat')) aJ = amount;
    else if (srcStr.includes('Pembangunan')) aB = amount;

    incSheet.appendRow([
      incId,
      data.date,
      d.getMonth() + 1,
      d.getFullYear(),
      'Mutasi Kas / Setor Bank',
      'Sistem (Mutasi)',
      '-',
      data.receipt_no,
      amount,
      aD, aJ, aB,
      data.note || 'Mutasi Setor Bank',
      user.username,
      new Date().toISOString(),
      receipt_photo,
      receipt_photo_2,
      receipt_photo_3,
      data.approved_by || ''
    ]);
  }

  writeLog(user.username, 'SAVE_EXPENSE', `ID: ${id}, Dept: ${data.department}, Nominal: ${amount}`);
  return { success: true, message: 'Pengeluaran berhasil disimpan.', id };
}

function getExpenseList(params) {
  const month = params && params.month ? parseInt(params.month) : 0;
  const year  = params && params.year ? parseInt(params.year) : 0;
  let   rows  = getAllExpense();

  if (year  > 0) rows = rows.filter(r => parseInt(r.year) === year);
  if (month > 0) rows = rows.filter(r => parseInt(r.month) === month);

  return { success: true, data: rows };
}

function getAllExpense() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.EXPENSE);
  const rows  = sheet.getDataRange().getValues();
  const result = [];
  
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[0]) continue;
    result.push({
      transaction_id: r[0],
      date:           r[1],
      month:          parseInt(r[2]),
      year:           parseInt(r[3]),
      department:     r[4],
      source_balance: r[5],
      receipt_no:     r[6],
      amount:         parseFloat(r[7]) || 0,
      note:           r[8],
      created_by:     r[9],
      created_at:     r[10],
      receipt_photo:    r[11] || '',
      nama_penerima:    r[12] || '-',
      receipt_photo_2:  r[13] || '',
      receipt_photo_3:  r[14] || '',
      approved_by:      r[15] || ''
    });
  }
  return result;
}

// ============================================================
//  LAPORAN BULANAN
// ============================================================
function getMonthlyReport(params) {
  const month = parseInt(params.month);
  const year  = parseInt(params.year);

  if (!month || !year) return { success: false, message: 'Bulan dan tahun wajib diisi.' };

  const allIncome = getAllIncome();
  const allExpense = getAllExpense();

  const income  = allIncome.filter(r => parseInt(r.month) === month && parseInt(r.year) === year);
  const expense = allExpense.filter(r => parseInt(r.month) === month && parseInt(r.year) === year);

  const targetDateEnd = new Date(year, month, 0, 23, 59, 59);
  const historicalInc = allIncome.filter(row => new Date(row.date) <= targetDateEnd);
  const historicalExp = allExpense.filter(row => new Date(row.date) <= targetDateEnd);

  const balances = computeBalances(historicalInc, historicalExp);

  const totalInc = income.reduce((s, i) => s + i.amount, 0);
  const totalExp = expense.reduce((s, e) => s + e.amount, 0);

  const incByCategory = {};
  income.forEach(i => {
    if (!incByCategory[i.income_type]) incByCategory[i.income_type] = [];
    const row = { ...i };
    incByCategory[i.income_type].push(row);
  });

  const expByDept = {};
  expense.forEach(e => {
    if (!expByDept[e.department]) expByDept[e.department] = [];
    expByDept[e.department].push(e);
  });

  return {
    success: true,
    data: {
      month, year,
      summary: {
        totalIncome:  totalInc,
        totalExpense: totalExp,
        netBalance:   totalInc - totalExp,
        balances
      },
      incByCategory,
      expByDept
    }
  };
}

// ============================================================
//  MASTER DATA — GET
// ============================================================
function getMasterData() {
  return {
    success: true,
    data: {
      departments:  getDepartments(),
      units:        getUnits(),
      incomeTypes:  getIncomeTypes()
    }
  };
}

function getDepartments() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.DEPARTMENTS);
  const rows  = sheet.getDataRange().getValues();
  return rows.slice(1)
    .filter(r => r && r[0] && r[2] === true)
    .map(r => ({ id: r[0], name: r[1] }));
}

function getUnits() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.UNITS);
  const rows  = sheet.getDataRange().getValues();
  
  return rows.slice(1)
    .filter(r => r && r[0] && r[3] === true)
    .map(r => ({ 
      id: r[0], 
      name: r[1], 
      note: r[2],
      jumlah_anggota: parseInt(r[4]) || 0
    }));
}

function getIncomeTypes() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INCOME_TYPES);
  const rows  = sheet.getDataRange().getValues();
  return rows.slice(1)
    .filter(r => r && r[0] && r[5] === true)
    .map(r => ({
      id:         r[0],
      name:       r[1],
      pct_daerah: parseFloat(r[2]) || 0,
      pct_jemaat: parseFloat(r[3]) || 0,
      pct_bangun: parseFloat(r[4]) || 0
    }));
}

function getIncomeTypeConfig(typeName) {
  const types = getIncomeTypes();
  return types.find(t => t.name === typeName) || null;
}

// ============================================================
//  MASTER KATEGORI PEMASUKAN — CRUD
// ============================================================
function saveIncomeType(data, user) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INCOME_TYPES);
  const rows  = sheet.getDataRange().getValues();

  if (data.isUpdate && data.oldName) {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === data.oldName) {
        sheet.getRange(i + 1, 2).setValue(data.name);
        sheet.getRange(i + 1, 3).setValue(parseFloat(data.pct_daerah) || 0);
        sheet.getRange(i + 1, 4).setValue(parseFloat(data.pct_jemaat) || 0);
        sheet.getRange(i + 1, 5).setValue(parseFloat(data.pct_bangun) || 0);
        sheet.getRange(i + 1, 6).setValue(true);
        
        writeLog(user.username, 'UPDATE_INC_TYPE', data.name);
        return { success: true, message: 'Kategori masukan berhasil diperbarui.' };
      }
    }
    return { success: false, message: 'Kategori asal tidak ditemukan.' };
  } 
  else {
    const id = 'INCTYPE-' + Date.now();
    sheet.appendRow([id, data.name, parseFloat(data.pct_daerah)||0, parseFloat(data.pct_jemaat)||0, parseFloat(data.pct_bangun)||0, true]);
    writeLog(user.username, 'ADD_INC_TYPE', data.name);
    return { success: true, message: 'Kategori masukan berhasil ditambahkan.' };
  }
}

function deleteIncomeType(data, user) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INCOME_TYPES);
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.name) {
      sheet.getRange(i + 1, 6).setValue(false);
      writeLog(user.username, 'DELETE_INC_TYPE', data.name);
      return { success: true, message: 'Kategori berhasil dinonaktifkan.' };
    }
  }
  return { success: false, message: 'Kategori tidak ditemukan.' };
}

// ============================================================
//  MASTER DEPARTEMEN — CRUD
// ============================================================
function saveDepartment(data, user) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.DEPARTMENTS);

  if (data.id) {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.id) {
        sheet.getRange(i + 1, 2).setValue(data.name);
        sheet.getRange(i + 1, 3).setValue(data.active !== false);
        writeLog(user.username, 'UPDATE_DEPT', data.id);
        return { success: true, message: 'Departemen diperbarui.' };
      }
    }
    return { success: false, message: 'ID departemen tidak ditemukan.' };
  } else {
    const id = 'DEPT-' + Date.now();
    sheet.appendRow([id, data.name, true]);
    writeLog(user.username, 'ADD_DEPT', data.name);
    return { success: true, message: 'Departemen berhasil ditambahkan.', id };
  }
}

function deleteDepartment(data, user) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.DEPARTMENTS);
  const rows  = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.name || rows[i][0] === data.id) {
      sheet.getRange(i + 1, 3).setValue(false);
      writeLog(user.username, 'DELETE_DEPT', data.name || data.id);
      return { success: true, message: 'Departemen berhasil dinonaktifkan.' };
    }
  }
  return { success: false, message: 'Departemen tidak ditemukan.' };
}

// ============================================================
//  MASTER UNIT — CRUD
// ============================================================
function saveUnit(data, user) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.UNITS);
  const rows  = sheet.getDataRange().getValues();

  if (data.isUpdate && data.oldName) {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === data.oldName) {
        sheet.getRange(i + 1, 2).setValue(data.name);
        sheet.getRange(i + 1, 3).setValue(data.note || '');
        sheet.getRange(i + 1, 4).setValue(true);
        sheet.getRange(i + 1, 5).setValue(data.jumlah_anggota || 0);
        
        writeLog(user.username, 'UPDATE_UNIT', data.name);
        return { success: true, message: 'Unit diperbarui.' };
      }
    }
    return { success: false, message: 'Unit asal tidak ditemukan.' };
  } else {
    const id = 'UNIT-' + Date.now();
    sheet.appendRow([id, data.name, data.note || '', true, data.jumlah_anggota || 0]);
    writeLog(user.username, 'ADD_UNIT', data.name);
    return { success: true, message: 'Unit berhasil ditambahkan.', id };
  }
}

function deleteUnit(data, user) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.UNITS);
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.name || rows[i][0] === data.id) {
      sheet.getRange(i + 1, 4).setValue(false);
      writeLog(user.username, 'DELETE_UNIT', data.name || data.id);
      return { success: true, message: 'Unit berhasil dinonaktifkan.' };
    }
  }
  return { success: false, message: 'Unit tidak ditemukan.' };
}

// ============================================================
//  USER MANAGEMENT — CRUD
// ============================================================
function getUsers(requestUser) {
  if (!hasRole(requestUser.role, 'Admin')) {
    return { success: false, message: 'Hanya Admin yang dapat mengelola daftar user.' };
  }
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const rows  = sheet.getDataRange().getValues();
  const result = [];
  
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[0]) continue;
    result.push({
      username: r[0],
      password: r[1],
      role:     r[2],
      nama:     r[3],
      active:   r[4] === true
    });
  }
  return { success: true, data: result };
}

function saveUser(data, user) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const rows  = sheet.getDataRange().getValues();

  if (data.isUpdate) {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().toLowerCase() === data.username.toString().toLowerCase()) {
        sheet.getRange(i + 1, 3).setValue(data.role);
        sheet.getRange(i + 1, 4).setValue(data.nama);
        sheet.getRange(i + 1, 5).setValue(data.active !== false);
        
        if (data.password && data.password.trim() !== '') {
          sheet.getRange(i + 1, 2).setValue(data.password);
        }
        
        writeLog(user.username, 'UPDATE_USER', data.username);
        return { success: true, message: 'Akun user berhasil diperbarui.' };
      }
    }
    return { success: false, message: 'User tidak ditemukan.' };
  } else {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().toLowerCase() === data.username.toString().toLowerCase()) {
        return { success: false, message: 'Username sudah digunakan oleh akun lain.' };
      }
    }
    if (!data.password) {
      return { success: false, message: 'Password wajib diisi untuk user baru.' };
    }
    
    sheet.appendRow([
      data.username.toString().toLowerCase(),
      data.password,
      data.role,
      data.nama,
      true
    ]);
    
    writeLog(user.username, 'ADD_USER', data.username);
    return { success: true, message: 'User baru berhasil dibuat.' };
  }
}

// ============================================================
//  SET SALDO AWAL (Admin saja)
// ============================================================
function setInitialBalance(data, user) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.BALANCES);
  const rows  = sheet.getDataRange().getValues();

  const map = { 'Daerah': 0, 'Kas Jemaat': 0, 'Pembangunan': 0 };
  if (data.daerah      !== undefined) map['Daerah']      = parseFloat(data.daerah) || 0;
  if (data.jemaat      !== undefined) map['Kas Jemaat']  = parseFloat(data.jemaat) || 0;
  if (data.pembangunan !== undefined) map['Pembangunan'] = parseFloat(data.pembangunan) || 0;

  for (let i = 1; i < rows.length; i++) {
    const sumber = rows[i][0];
    if (map[sumber] !== undefined) {
      sheet.getRange(i + 1, 2).setValue(map[sumber]);
    }
  }

  writeLog(user.username, 'SET_BALANCE', JSON.stringify(map));
  return { success: true, message: 'Saldo awal berhasil disesuaikan.' };
}

// ============================================================
//  HAPUS TRANSAKSI (Hard Delete - Admin saja)
// ============================================================
function deleteRecord(data, user) {
  const sheetMap = { income: SHEETS.INCOME, expense: SHEETS.EXPENSE, users: SHEETS.USERS };
  const sheetName = sheetMap[data.type];
  if (!sheetName) return { success: false, message: 'Tipe data penghapusan tidak valid.' };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const rows  = sheet.getDataRange().getValues();

  const searchColIdx = 0;
  let deletedCount = 0;
  let receiptNo = '';
  let isMutasi = false;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][searchColIdx].toString() === data.transaction_id.toString()) {
      receiptNo = rows[i][data.type === 'income' ? 7 : 6] || '';
      const deptCol = rows[i][4] || ''; // income_type or department
      if (deptCol === 'Mutasi Kas / Setor Bank') isMutasi = true;

      sheet.deleteRow(i + 1);
      deletedCount++;
      writeLog(user.username, 'DELETE_' + data.type.toUpperCase(), data.transaction_id);
      break;
    }
  }

  // Jika Mutasi, hapus juga pasangannya di sheet sebelahnya (Income / Expense)
  if (deletedCount > 0 && isMutasi && receiptNo) {
    const otherSheetName = data.type === 'income' ? SHEETS.EXPENSE : SHEETS.INCOME;
    const otherSheet = ss.getSheetByName(otherSheetName);
    const otherRows = otherSheet.getDataRange().getValues();
    const otherReceiptCol = data.type === 'income' ? 6 : 7; // receipt_no index in expense is 6, income is 7
    for (let i = otherRows.length - 1; i >= 1; i--) {
      if (otherRows[i][otherReceiptCol] === receiptNo && otherRows[i][4] === 'Mutasi Kas / Setor Bank') {
        otherSheet.deleteRow(i + 1);
        break; // Assuming only 1 pair
      }
    }
  }

  if (deletedCount > 0) return { success: true, message: 'Data berhasil dihapus selamanya.' };
  return { success: false, message: 'Data tidak ditemukan.' };
}

// ============================================================
//  APPROVE TRANSAKSI (Ketua Jemaat & Pendeta)
// ============================================================
function approveTransaction(data, user) {
  const sheetMap = { income: SHEETS.INCOME, expense: SHEETS.EXPENSE };
  const sheetName = sheetMap[data.type];
  if (!sheetName) return { success: false, message: 'Tipe data tidak valid.' };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const rows  = sheet.getDataRange().getValues();

  const searchColIdx = 0;
  const targetColIdx = data.type === 'income' ? 19 : 16; // 1-based index (S for income, P for expense)
  
  let effectiveRole = "Admin";
  if (hasRole(user.role, 'Pendeta')) effectiveRole = "Pendeta";
  else if (hasRole(user.role, 'Ketua Jemaat')) effectiveRole = "Ketua Jemaat";

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][searchColIdx].toString() === data.transaction_id.toString()) {
      let approvedBy = rows[i][targetColIdx - 1] || '';
      
      if (approvedBy.includes(effectiveRole)) {
        return { success: true, message: 'Anda sudah menyetujui transaksi ini.' };
      }
      
      let newApprovedBy = approvedBy;
      if (newApprovedBy) {
        newApprovedBy += ',' + effectiveRole;
      } else {
        newApprovedBy = effectiveRole;
      }
      
      sheet.getRange(i + 1, targetColIdx).setValue(newApprovedBy);
      writeLog(user.username, 'APPROVE_' + data.type.toUpperCase(), data.transaction_id);
      return { success: true, message: 'Transaksi berhasil disetujui.' };
    }
  }
  return { success: false, message: 'Data tidak ditemukan.' };
}

// ============================================================
//  EDIT TRANSAKSI (Bendahara & Admin) — UPDATED: Multi-Photo
// ============================================================
function editRecord(data, user) {
  const sheetMap = { income: SHEETS.INCOME, expense: SHEETS.EXPENSE };
  const sheetName = sheetMap[data.type];
  if (!sheetName) return { success: false, message: 'Tipe data edit tidak valid.' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const rows = sheet.getDataRange().getValues();

  let targetRowIndex = -1;
  let originalRowData = null;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString() === data.transaction_id.toString()) {
      targetRowIndex = i + 1;
      originalRowData = rows[i];
      break;
    }
  }

  if (targetRowIndex === -1) return { success: false, message: 'Data asli tidak ditemukan.' };

  const approvedBy = originalRowData[data.type === 'income' ? 18 : 15] || '';
  const isFullyApproved = approvedBy.includes('Ketua Jemaat') && approvedBy.includes('Pendeta');

  const d = new Date(data.date);

  if (data.type === 'income') {
    const typeConfig = getIncomeTypeConfig(data.income_type);
    const amount = parseFloat(data.amount);
    let allocDaerah = 0, allocJemaat = 0, allocBangun = 0;

    if (data.income_type === 'Persembahan Khusus') {
      allocDaerah = originalRowData[9] || 0;
      allocJemaat = originalRowData[10] || 0;
      allocBangun = originalRowData[11] || 0;
    } else if (typeConfig) {
      allocDaerah = amount * (typeConfig.pct_daerah || 0) / 100;
      allocJemaat = amount * (typeConfig.pct_jemaat || 0) / 100;
      allocBangun = amount * (typeConfig.pct_bangun || 0) / 100;
    }

    // Perbaikan: Hapus pengecekan !== '' agar user bisa menghapus foto
    let photoInc = originalRowData[15] || '';
    if (data.receipt_photo_base64 !== undefined) {
      photoInc = data.receipt_photo_base64;
    }
    let photoInc2 = originalRowData[16] || '';
    if (data.receipt_photo_base64_2 !== undefined) {
      photoInc2 = data.receipt_photo_base64_2;
    }
    let photoInc3 = originalRowData[17] || '';
    if (data.receipt_photo_base64_3 !== undefined) {
      photoInc3 = data.receipt_photo_base64_3;
    }

    if (!isFullyApproved) {
      sheet.getRange(targetRowIndex, 2).setValue(data.date);
      sheet.getRange(targetRowIndex, 3).setValue(d.getMonth() + 1);
      sheet.getRange(targetRowIndex, 4).setValue(d.getFullYear());
      sheet.getRange(targetRowIndex, 5).setValue(data.income_type);
      if(data.nama_pemberi !== undefined) sheet.getRange(targetRowIndex, 6).setValue(data.nama_pemberi);
      sheet.getRange(targetRowIndex, 7).setValue(data.unit_name || '-');
      sheet.getRange(targetRowIndex, 8).setValue(data.receipt_no);
      sheet.getRange(targetRowIndex, 9).setValue(amount);
      sheet.getRange(targetRowIndex, 10).setValue(allocDaerah);
      sheet.getRange(targetRowIndex, 11).setValue(allocJemaat);
      sheet.getRange(targetRowIndex, 12).setValue(allocBangun);
      sheet.getRange(targetRowIndex, 13).setValue(data.note || '');
    }
    sheet.getRange(targetRowIndex, 16).setValue(photoInc);
    sheet.getRange(targetRowIndex, 17).setValue(photoInc2);
    sheet.getRange(targetRowIndex, 18).setValue(photoInc3);

    // Sync photo to expense if it's Mutasi Kas
    if (originalRowData[4] === 'Mutasi Kas / Setor Bank') {
      const expSheet = ss.getSheetByName(SHEETS.EXPENSE);
      const expRows = expSheet.getDataRange().getValues();
      const incomeReceiptNo = originalRowData[7];
      for (let i = 1; i < expRows.length; i++) {
        if (expRows[i][4] === 'Mutasi Kas / Setor Bank' && expRows[i][6] === incomeReceiptNo) {
          expSheet.getRange(i + 1, 12).setValue(photoInc);
          expSheet.getRange(i + 1, 14).setValue(photoInc2);
          expSheet.getRange(i + 1, 15).setValue(photoInc3);
          break;
        }
      }
    }

  } else if (data.type === 'expense') {
    const amount = parseFloat(data.amount);

    // Perbaikan: Hapus pengecekan !== '' agar user bisa menghapus foto
    let photoExp = originalRowData[11] || '';
    if (data.receipt_photo_base64 !== undefined) {
      photoExp = data.receipt_photo_base64;
    }
    let photoExp2 = originalRowData[13] || '';
    if (data.receipt_photo_base64_2 !== undefined) {
      photoExp2 = data.receipt_photo_base64_2;
    }
    let photoExp3 = originalRowData[14] || '';
    if (data.receipt_photo_base64_3 !== undefined) {
      photoExp3 = data.receipt_photo_base64_3;
    }

    const receiver = data.nama_penerima || data.receiver || data.recipient || data.penerima || '-';

    if (!isFullyApproved) {
      sheet.getRange(targetRowIndex, 2).setValue(data.date);
      sheet.getRange(targetRowIndex, 3).setValue(d.getMonth() + 1);
      sheet.getRange(targetRowIndex, 4).setValue(d.getFullYear());
      sheet.getRange(targetRowIndex, 5).setValue(data.department);
      sheet.getRange(targetRowIndex, 6).setValue(data.source_balance);
      sheet.getRange(targetRowIndex, 7).setValue(data.receipt_no);
      sheet.getRange(targetRowIndex, 8).setValue(amount);
      sheet.getRange(targetRowIndex, 9).setValue(data.note || '');
      sheet.getRange(targetRowIndex, 13).setValue(receiver);
    }
    sheet.getRange(targetRowIndex, 12).setValue(photoExp);
    sheet.getRange(targetRowIndex, 14).setValue(photoExp2);
    sheet.getRange(targetRowIndex, 15).setValue(photoExp3);

    // Sync photo to shadow income if it's Mutasi Kas
    if (originalRowData[4] === 'Mutasi Kas / Setor Bank') {
      const incSheet = ss.getSheetByName(SHEETS.INCOME);
      const incRows = incSheet.getDataRange().getValues();
      const expenseReceiptNo = originalRowData[6];
      for (let i = 1; i < incRows.length; i++) {
        if (incRows[i][4] === 'Mutasi Kas / Setor Bank' && incRows[i][7] === expenseReceiptNo) {
          incSheet.getRange(i + 1, 16).setValue(photoExp);
          incSheet.getRange(i + 1, 17).setValue(photoExp2);
          incSheet.getRange(i + 1, 18).setValue(photoExp3);
          break;
        }
      }
    }
  }

  writeLog(user.username, 'EDIT_' + data.type.toUpperCase(), data.transaction_id);
  return { success: true, message: 'Transaksi berhasil diperbarui.' };
}

// ============================================================
//  EDIT KOLEKTIF (Edit Bulk Income) — UPDATED: Multi-Photo
// ============================================================
function editBulkIncome(data, user) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INCOME);
  const rows = sheet.getDataRange().getValues();

  if (data.receipt_no !== data.old_receipt_no) {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][7] === data.receipt_no) {
        return { success: false, message: 'Nomor kuitansi baru sudah digunakan: ' + data.receipt_no };
      }
    }
  }

  let existingApprovedBy = '';
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][7] === data.old_receipt_no) {
      existingApprovedBy = rows[i][18] || '';
      break;
    }
  }

  const isFullyApproved = existingApprovedBy.includes('Ketua Jemaat') && existingApprovedBy.includes('Pendeta');

  const receipt_photo   = data.receipt_photo_base64 !== undefined ? data.receipt_photo_base64 : data.original_photo;
  const receipt_photo_2 = data.receipt_photo_base64_2 !== undefined ? data.receipt_photo_base64_2 : (data.original_photo_2 || '');
  const receipt_photo_3 = data.receipt_photo_base64_3 !== undefined ? data.receipt_photo_base64_3 : (data.original_photo_3 || '');

  if (isFullyApproved) {
    // Only update photos, do not delete or modify nominals
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][7] === data.old_receipt_no) {
        sheet.getRange(i + 1, 16).setValue(receipt_photo);
        sheet.getRange(i + 1, 17).setValue(receipt_photo_2);
        sheet.getRange(i + 1, 18).setValue(receipt_photo_3);
      }
    }
    writeLog(user.username, 'EDIT_BULK_INCOME_PHOTO_ONLY', data.old_receipt_no);
    return { success: true, message: 'Transaksi kolektif disetujui penuh, hanya foto yang diperbarui.' };
  }

  let deletedCount = 0;
  for (let i = rows.length - 1; i >= 1; i--) {
    if (rows[i][7] === data.old_receipt_no) {
      sheet.deleteRow(i + 1);
      deletedCount++;
    }
  }

  const d = new Date(data.date);
  const types = getIncomeTypes();

  data.items.forEach(item => {
    const amount = parseFloat(item.amount) || 0;
    if (amount > 0) {
      const typeConfig = types.find(t => t.name === item.income_type);
      let allocDaerah = 0, allocJemaat = 0, allocBangun = 0;

      if (typeConfig) {
        allocDaerah = amount * (typeConfig.pct_daerah || 0) / 100;
        allocJemaat = amount * (typeConfig.pct_jemaat || 0) / 100;
        allocBangun = amount * (typeConfig.pct_bangun || 0) / 100;
      }

      const id = generateTransactionId('INC');
      sheet.appendRow([
        id,
        data.date,
        d.getMonth() + 1,
        d.getFullYear(),
        item.income_type,
        'Kolektif ' + data.unit_name, 
        data.unit_name,
        data.receipt_no,
        amount,
        allocDaerah,
        allocJemaat,
        allocBangun,
        item.note || 'Setoran Kolektif (Kemaskini)',
        user.username,
        new Date().toISOString(),
        receipt_photo,
        receipt_photo_2,
        receipt_photo_3,
        existingApprovedBy
      ]);
    }
  });

  writeLog(user.username, 'EDIT_BULK_INCOME', `Kuitansi: ${data.old_receipt_no} -> ${data.receipt_no}`);
  return { success: true, message: 'Setoran kolektif berhasil diperbarui.' };
}

// ============================================================
//  LOG SYSTEM
// ============================================================
function writeLog(username, action, detail) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.LOGS);
    sheet.appendRow([new Date().toISOString(), username, action, detail]);
  } catch(e) {}
}

function getLogs(user) {
  if (!hasRole(user.role, 'Admin')) return { success: false, message: 'Akses ditolak.' };
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.LOGS);
  const rows  = sheet.getDataRange().getValues();
  const result = [];
  
  for (let i = rows.length - 1; i >= 1 && result.length < 100; i--) {
    const r = rows[i];
    if (!r || !r[0]) continue;
    result.push({
      timestamp: r[0],
      user:      r[1],
      action:    r[2],
      detail:    r[3]
    });
  }
  return { success: true, data: result };
}

// ============================================================
//  ID GENERATOR
// ============================================================
function generateTransactionId(prefix) {
  const now = new Date();
  const stamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getTime()).slice(-5);
  return `${prefix}-${stamp}`;
}

// ============================================================
//  SETUP SPREADSHEET — UPDATED: Multi-Photo columns
// ============================================================
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inventorySS = SpreadsheetApp.getActiveSpreadsheet();

  function createSheet(name, headers, targetSS = ss) {
    let sheet = targetSS.getSheetByName(name);
    
    if (!sheet) {
      sheet = targetSS.insertSheet(name);
    }
    
    // Pastikan header selalu terupdate meskipun sheet sudah ada
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#1a2e22').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    return sheet;
  }

  // Perbaikan: Menambahkan 'approved_by' pada urutan paling akhir
  createSheet(SHEETS.INCOME, [
    'transaction_id','date','month','year','income_type',
    'nama_pemberi','unit_name','receipt_no','amount',
    'alloc_daerah','alloc_jemaat','alloc_bangun',
    'note','created_by','created_at', 'receipt_photo',
    'receipt_photo_2', 'receipt_photo_3', 'approved_by'
  ]);
  
  createSheet(SHEETS.EXPENSE, [
    'transaction_id','date','month','year','department',
    'source_balance','receipt_no','amount','note',
    'created_by','created_at', 'receipt_photo', 'nama_penerima',
    'receipt_photo_2', 'receipt_photo_3', 'approved_by'
  ]);

  createSheet(SHEETS.DEPARTMENTS, ['id', 'name', 'active']);
  createSheet(SHEETS.UNITS, ['id', 'name', 'note', 'active', 'jumlah_anggota']);
  createSheet(SHEETS.INCOME_TYPES, ['id', 'name', 'pct_daerah', 'pct_jemaat', 'pct_bangun', 'active']);
  createSheet(SHEETS.BALANCES, ['source', 'balance']);
  createSheet(SHEETS.USERS, ['username', 'password', 'role', 'nama', 'active']);
  createSheet(SHEETS.LOGS, ['timestamp', 'user', 'action', 'detail']);
  createSheet(SHEETS.CONFIG, ['Key', 'Value']);
  
  // Perbaikan: Lengkapi seluruh kolom inventaris agar otomatis terbuat di Spreadsheet yang tepat
  createSheet(SHEETS.INVENTORY, [
    'id', 'date_acquired', 'name', 'value', 'location', 'pic', 'photo', 'created_by', 'created_at',
    'category', 'source', 'taksasi', 'qty', 'unit', 'sub_items', 'status', 'dispose_reason', 'dispose_price', 'pic2', 'pic3', 'pic4',
    'loan_status', 'borrowed_by', 'borrow_date', 'expected_return_date', 'depreciation_years'
  ], inventorySS);

  // Tabel riwayat servis
  createSheet(SHEETS.INVENTORY_SERVICE, [
    'service_id', 'inventory_id', 'service_date', 'description', 'cost', 'created_by', 'created_at'
  ], inventorySS);
}

// ============================================================
// INVENTORY CRUD
// ============================================================
function getInventorySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEETS.INVENTORY);
}

function getInventory() {
  try {
    const sheet = getInventorySheet();
    if (!sheet) return { success: false, message: 'Sheet Inventory tidak ditemukan' };
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, data: [] };
    
    const headers = data[0];
    const items = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const item = {};
      headers.forEach((h, idx) => {
        item[h] = row[idx];
      });
      items.push(item);
    }
    
    return { success: true, data: items };
  } catch (e) {
    return { success: false, message: 'Error getInventory: ' + e.message };
  }
}

function saveInventory(data, user) {
  try {
    const sheet = getInventorySheet();
    if (!sheet) return { success: false, message: 'Sheet Inventory tidak ditemukan' };
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    
    const colIdx = {};
    headers.forEach((h, i) => colIdx[h] = i);
    
    if (data.id) {
      // UPDATE
      let found = false;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][colIdx['id']] === data.id) {
          found = true;
          if (data.date_acquired !== undefined) sheet.getRange(i + 1, colIdx['date_acquired'] + 1).setValue(data.date_acquired);
          if (data.name !== undefined) sheet.getRange(i + 1, colIdx['name'] + 1).setValue(data.name);
          if (data.value !== undefined) sheet.getRange(i + 1, colIdx['value'] + 1).setValue(data.value);
          if (data.location !== undefined) sheet.getRange(i + 1, colIdx['location'] + 1).setValue(data.location);
          if (data.pic !== undefined) sheet.getRange(i + 1, colIdx['pic'] + 1).setValue(data.pic);
          if (data.photo !== undefined) sheet.getRange(i + 1, colIdx['photo'] + 1).setValue(data.photo);
          if (data.category !== undefined) sheet.getRange(i + 1, colIdx['category'] + 1).setValue(data.category);
          if (data.source !== undefined) sheet.getRange(i + 1, colIdx['source'] + 1).setValue(data.source);
          if (data.taksasi !== undefined) sheet.getRange(i + 1, colIdx['taksasi'] + 1).setValue(data.taksasi);
          if (data.qty !== undefined) sheet.getRange(i + 1, colIdx['qty'] + 1).setValue(data.qty);
          if (data.unit !== undefined) sheet.getRange(i + 1, colIdx['unit'] + 1).setValue(data.unit);
          if (data.sub_items !== undefined) sheet.getRange(i + 1, colIdx['sub_items'] + 1).setValue(data.sub_items);
          if (data.status !== undefined) sheet.getRange(i + 1, colIdx['status'] + 1).setValue(data.status);
          if (data.dispose_reason !== undefined) sheet.getRange(i + 1, colIdx['dispose_reason'] + 1).setValue(data.dispose_reason);
          if (data.dispose_price !== undefined) sheet.getRange(i + 1, colIdx['dispose_price'] + 1).setValue(data.dispose_price);
          if (data.pic2 !== undefined) sheet.getRange(i + 1, colIdx['pic2'] + 1).setValue(data.pic2);
          if (data.pic3 !== undefined) sheet.getRange(i + 1, colIdx['pic3'] + 1).setValue(data.pic3);
          if (data.pic4 !== undefined) sheet.getRange(i + 1, colIdx['pic4'] + 1).setValue(data.pic4);
          
          if (data.loan_status !== undefined) sheet.getRange(i + 1, colIdx['loan_status'] + 1).setValue(data.loan_status);
          if (data.borrowed_by !== undefined) sheet.getRange(i + 1, colIdx['borrowed_by'] + 1).setValue(data.borrowed_by);
          if (data.borrow_date !== undefined) sheet.getRange(i + 1, colIdx['borrow_date'] + 1).setValue(data.borrow_date);
          if (data.expected_return_date !== undefined) sheet.getRange(i + 1, colIdx['expected_return_date'] + 1).setValue(data.expected_return_date);
          if (data.depreciation_years !== undefined) sheet.getRange(i + 1, colIdx['depreciation_years'] + 1).setValue(data.depreciation_years);
          
          writeLog(user.username, 'UPDATE_INVENTORY', 'Updated: ' + data.id);
          return { success: true, message: 'Inventaris berhasil diupdate' };
        }
      }
      if (!found) return { success: false, message: 'ID tidak ditemukan' };
    } else {
      // INSERT
      const id = generateTransactionId('INV');
      const newRow = [];
      headers.forEach(h => {
        if (h === 'id') newRow.push(id);
        else if (h === 'created_by') newRow.push(user.username);
        else if (h === 'created_at') newRow.push(new Date().toISOString());
        else if (data[h] !== undefined) newRow.push(data[h]);
        else newRow.push('');
      });
      sheet.appendRow(newRow);
      writeLog(user.username, 'SAVE_INVENTORY', 'Added: ' + id);
      return { success: true, message: 'Inventaris berhasil ditambahkan', id: id };
    }
  } catch (e) {
    return { success: false, message: 'Error saveInventory: ' + e.message };
  }
}

// ============================================================
// INVENTORY SERVICE LOGS CRUD
// ============================================================
function getInventoryServiceSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEETS.INVENTORY_SERVICE);
}

function getInventoryService(params) {
  try {
    const sheet = getInventoryServiceSheet();
    if (!sheet) return { success: false, message: 'Sheet Inventory_Service tidak ditemukan' };
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, data: [] };
    
    const headers = data[0];
    const items = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const item = {};
      headers.forEach((h, idx) => {
        item[h] = row[idx];
      });
      
      // Filter by inventory_id if provided
      if (params && params.inventory_id && item.inventory_id !== params.inventory_id) {
        continue;
      }
      
      items.push(item);
    }
    
    return { success: true, data: items };
  } catch (e) {
    return { success: false, message: 'Error getInventoryService: ' + e.message };
  }
}

function saveInventoryService(data, user) {
  try {
    const sheet = getInventoryServiceSheet();
    if (!sheet) return { success: false, message: 'Sheet Inventory_Service tidak ditemukan' };
    
    const id = generateTransactionId('SRV');
    const cost = parseFloat(data.cost) || 0;
    
    sheet.appendRow([
      id,
      data.inventory_id,
      data.service_date,
      data.description,
      cost,
      user.username,
      new Date().toISOString()
    ]);
    
    writeLog(user.username, 'SAVE_INVENTORY_SERVICE', `Ditambahkan untuk: ${data.inventory_id}, Biaya: ${cost}`);
    return { success: true, message: 'Riwayat servis berhasil disimpan', id: id };
  } catch (e) {
    return { success: false, message: 'Error saveInventoryService: ' + e.message };
  }
}

function deleteInventoryService(data, user) {
  try {
    const sheet = getInventoryServiceSheet();
    if (!sheet) return { success: false, message: 'Sheet Inventory_Service tidak ditemukan' };
    
    const rows = sheet.getDataRange().getValues();
    const service_id = data.service_id;
    let found = false;
    
    // Asumsi service_id di kolom A (index 0)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === service_id) {
        sheet.deleteRow(i + 1);
        found = true;
        break;
      }
    }
    
    if (found) {
      writeLog(user.username, 'DELETE_INVENTORY_SERVICE', 'Hapus: ' + service_id);
      return { success: true, message: 'Riwayat servis berhasil dihapus' };
    } else {
      return { success: false, message: 'ID Servis tidak ditemukan' };
    }
  } catch (e) {
    return { success: false, message: 'Error deleteInventoryService: ' + e.message };
  }
}

function deleteInventory(data, user) {
  try {
    const sheet = getInventorySheet();
    if (!sheet) return { success: false, message: 'Sheet Inventory tidak ditemukan' };
    const rows = sheet.getDataRange().getValues();
    const colIdxId = rows[0].indexOf('id');
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][colIdxId] === data.id) {
        sheet.deleteRow(i + 1);
        writeLog(user.username, 'DELETE_INVENTORY', 'Deleted: ' + data.id);
        return { success: true, message: 'Inventaris berhasil dihapus' };
      }
    }
    return { success: false, message: 'ID tidak ditemukan' };
  } catch (e) {
    return { success: false, message: 'Error deleteInventory: ' + e.message };
  }
}
