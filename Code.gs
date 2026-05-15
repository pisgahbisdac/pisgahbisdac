/**
 * KONFIGURASI BACKEND PISGAH BISDAC v1.0
 * Spreadsheet ID: 1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc
 */

const SPREADSHEET_ID = '1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc'; 

function getDb() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// ==============================================================
// ROUTER UTAMA
// ==============================================================
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const data = requestData.data;
    
    let result;
    switch (action) {
      case 'getInitialData': result = getInitialData(); break;
      case 'addMember': result = addMember(data); break;
      case 'updateMember': result = updateMember(data); break;
      case 'deleteMember': result = deleteMember(data); break;
      case 'addUnit': result = addUnit(data); break;
      case 'updateUnit': result = updateUnit(data); break;
      case 'deleteUnit': result = deleteUnit(data); break;
      case 'addRole': result = addRole(data); break;
      case 'updateRole': result = updateRole(data); break;
      case 'deleteRole': result = deleteRole(data); break;
      case 'addAdmin': result = addAdmin(data); break;
      case 'updateAdmin': result = updateAdmin(data); break;
      case 'deleteAdmin': result = deleteAdmin(data); break;
      case 'changePin': result = changePin(data); break;
      case 'submitAbsensi': result = submitAbsensi(data); break;
      case 'submitKegiatan': result = submitKegiatan(data); break;
      case 'submitDoa': result = submitDoa(data); break;
      default:
        result = { status: 'error', message: 'Aksi tidak dikenali: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getInitialData() {
  const db = getDb();
  let mSheet = db.getSheetByName('Members'); if(!mSheet) mSheet = createMemberSheet(db);
  let uSheet = db.getSheetByName('Units'); if(!uSheet) uSheet = createUnitSheet(db, mSheet);
  let rSheet = db.getSheetByName('Jabatan'); if(!rSheet) rSheet = createRoleSheet(db);
  let aSheet = db.getSheetByName('Admins'); if(!aSheet) aSheet = createAdminSheet(db);

  let members = [];
  if (mSheet.getLastRow() > 1) {
    const data = mSheet.getRange(2, 1, mSheet.getLastRow() - 1, 7).getValues();
    members = data.map(r => ({ id: r[0], nama: r[1], status: r[2], kelasTetap: r[3], unit: r[4], jabatan: r[5], tanggalLahir: r[6] }));
  }

  let units = [];
  if (uSheet.getLastRow() > 1) {
    const data = uSheet.getRange(2, 1, uSheet.getLastRow() - 1, 2).getValues();
    units = data.map(r => ({ name: String(r[0]).trim(), pin: String(r[1]).trim() }));
  }

  let roles = [];
  if (rSheet.getLastRow() > 1) {
    const data = rSheet.getRange(2, 1, rSheet.getLastRow() - 1, 1).getValues();
    roles = data.map(r => String(r[0]).trim());
  }

  let admins = [];
  if (aSheet.getLastRow() > 1) {
    const data = aSheet.getRange(2, 1, aSheet.getLastRow() - 1, 2).getValues();
    admins = data.map(r => ({ username: String(r[0]).trim(), pin: String(r[1]).trim() }));
  }

  const stats = getAttendanceStats(db);
  return { status: 'success', data: { members, units, roles, admins, stats } };
}

// ==============================================================
// STATISTIK DASHBOARD (Akurasi Tinggi & Sinkronisasi Tanggal)
// ==============================================================
function getAttendanceStats(ss) {
  let historyMap = { 'ALL': {} }; 
  let allUnits = new Set(['Umum', 'Tamu']);
  
  const mSheet = ss.getSheetByName('Members');
  const memberUnitMap = {};
  if (mSheet && mSheet.getLastRow() > 1) {
    const mData = mSheet.getDataRange().getValues();
    for (let i = 1; i < mData.length; i++) {
      let idStr = String(mData[i][0]).trim();
      let unitStr = String(mData[i][4] || 'Umum').trim();
      memberUnitMap[idStr] = unitStr; 
      allUnits.add(unitStr); // Kumpulkan semua unit yang ada
    }
  }

  const sheets = ss.getSheets().filter(s => s.getName().startsWith('Khotbah'));

  sheets.forEach(sheet => {
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    
    if (lastCol >= 3 && lastRow > 1) {
      const dates = sheet.getRange(1, 3, 1, lastCol - 2).getValues()[0];
      const data = sheet.getRange(2, 3, lastRow - 1, lastCol - 2).getValues();
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(r => r[0]);

      for (let c = 0; c < dates.length; c++) {
        let rawDate = dates[c];
        if (!rawDate) continue;
        
        let dateStr = rawDate instanceof Date ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(rawDate).trim();
        
        // Inisialisasi tanggal ini untuk SEMUA UNIT dengan nilai 0 agar array seimbang
        if (!historyMap['ALL'][dateStr]) historyMap['ALL'][dateStr] = 0;
        allUnits.forEach(u => {
            if (!historyMap[u]) historyMap[u] = {};
            if (!historyMap[u][dateStr]) historyMap[u][dateStr] = 0;
        });
        
        for (let r = 0; r < data.length; r++) {
          let count = 0;
          let unitName = 'Umum';

          if (ids[r] && ids[r].toString().toUpperCase() === "TAMU") {
            count = parseInt(data[r][c]) || 0;
            unitName = 'Tamu';
          } else if (String(data[r][c]).trim() === "Hadir") {
            count = 1;
            let foundId = String(ids[r]).trim();
            unitName = memberUnitMap[foundId] || 'Umum';
          }
          
          if (count > 0) {
            historyMap['ALL'][dateStr] += count; 
            historyMap[unitName][dateStr] += count;
          }
        }
      }
    }
  });

  const result = {};
  for (const unit in historyMap) {
    let sortedDates = Object.keys(historyMap[unit]).sort((a, b) => {
      const [y1, m1, d1] = a.split('-'); 
      const [y2, m2, d2] = b.split('-');
      return new Date(y1, m1-1, d1) - new Date(y2, m2-1, d2);
    });
    const recentDates = sortedDates.slice(-12);
    result[unit] = recentDates.map(d => ({ date: d, count: historyMap[unit][d] }));
  }

  if (!result['ALL']) result['ALL'] = [];
  return { historyByUnit: result, history: result['ALL'] };
}

// ==========================================
// 1. SETUP AWAL (JALANKAN FUNGSI INI SEKALI SAJA)
// ==========================================
function setup() {
  const ss = getDB();
  
  const sheets = [
    { name: 'Anggota', headers: ['ID', 'Nama', 'Tanggal Lahir', 'Status', 'Unit', 'Kategori', 'Jabatan'] },
    { name: 'Unit', headers: ['Nama Unit', 'PIN Akses'] },
    { name: 'Jabatan', headers: ['Nama Jabatan'] },
    { name: 'Admin', headers: ['Username', 'PIN Akses'] },
    { name: 'Absensi', headers: ['Tanggal', 'Tipe', 'Unit', 'Tamu', 'Hadir', 'Alpha', 'Data Mentah JSON'] },
    { name: 'RiwayatAbsen', headers: ['Tanggal', 'Tipe', 'Unit', 'ID_Anggota', 'Status'] },
    { name: 'Kegiatan', headers: ['Tanggal', 'Unit', 'Data Laporan JSON'] },
    { name: 'Doa', headers: ['Tanggal', 'Nama', 'Telp', 'Poin Doa JSON'] }
  ];

  sheets.forEach(s => {
    let sheet = ss.getSheetByName(s.name);
    if (!sheet) {
      sheet = ss.insertSheet(s.name);
      sheet.appendRow(s.headers);
      sheet.getRange(1, 1, 1, s.headers.length).setFontWeight("bold").setBackground("#0a192f").setFontColor("white");
    }
  });

  // Buat 1 Admin Default jika kosong
  const adminSheet = ss.getSheetByName('Admin');
  if (adminSheet.getLastRow() <= 1) {
    adminSheet.appendRow(['Admin Utama', '123456']);
  }
}

// ==========================================
// 2. ENTRY POINT (MENERIMA REQUEST DARI WEB)
// ==========================================
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const data = payload.data || {};
    
    let responseData = null;

    switch (action) {
      case 'getInitialData': responseData = getInitialData(); break;
      case 'submitAbsensi': responseData = submitAbsensi(data); break;
      case 'submitKegiatan': responseData = submitKegiatan(data); break;
      case 'submitDoa': responseData = submitDoa(data); break;
      case 'changePin': responseData = changePin(data); break;
      
      // CRUD ANGGOTA
      case 'addMember': responseData = addMember(data); break;
      case 'updateMember': responseData = updateMember(data); break;
      case 'deleteMember': responseData = deleteMember(data); break;
      
      // CRUD UNIT
      case 'addUnit': responseData = addUnit(data); break;
      case 'updateUnit': responseData = updateUnit(data); break;
      case 'deleteUnit': responseData = deleteUnit(data); break;
      
      // CRUD JABATAN
      case 'addRole': responseData = addRole(data); break;
      case 'updateRole': responseData = updateRole(data); break;
      case 'deleteRole': responseData = deleteRole(data); break;
      
      // CRUD ADMIN
      case 'addAdmin': responseData = addAdmin(data); break;
      case 'updateAdmin': responseData = updateAdmin(data); break;
      case 'deleteAdmin': responseData = deleteAdmin(data); break;
      
      default:
        return respond("error", "Aksi tidak dikenali!");
    }
    
    return respond("success", "OK", responseData);
    
  } catch (err) {
    return respond("error", err.toString());
  }
}

// Helper Response JSON
function respond(status, message, data = null) {
  const result = { status: status, message: message };
  if (data) result.data = data;
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 3. FUNGSI UTAMA PENGAMBILAN DATA
// ==========================================
function getInitialData() {
  return {
    members: getSheetData('Anggota'),
    units: getSheetData('Unit'),
    roles: getSheetData('Jabatan'),
    admins: getSheetData('Admin'),
    stats: buildStats(),
    attendanceHistory: buildAttendanceHistory()
  };
}

function buildAttendanceHistory() {
  const data = getSheetData('RiwayatAbsen');
  let history = {};
  
  data.forEach(row => {
    const tipe = row['Tipe'] || row.tipe;
    const id = row['ID_Anggota'] || row.id_anggota;
    const tgl = row['Tanggal'] || row.tanggal;
    const status = row['Status'] || row.status;
    
    if (!history[tipe]) history[tipe] = {};
    if (!history[tipe][id]) history[tipe][id] = {};
    
    history[tipe][id][tgl] = status;
  });
  
  return history;
}

function buildStats() {
  const data = getSheetData('Absensi');
  let historyByUnit = { 'ALL': [], 'Tamu': [] };
  
  let tempMap = { 'ALL': {}, 'Tamu': {} };
  
  data.forEach(row => {
    const tgl = row['Tanggal'];
    const unit = (row['Unit'] || 'Umum').trim();
    const hadir = parseInt(row['Hadir']) || 0;
    const tamu = parseInt(row['Tamu']) || 0;
    
    const totalCount = hadir + tamu;
    
    if (!tempMap['ALL'][tgl]) tempMap['ALL'][tgl] = 0;
    tempMap['ALL'][tgl] += totalCount;
    
    if (!tempMap['Tamu'][tgl]) tempMap['Tamu'][tgl] = 0;
    tempMap['Tamu'][tgl] += tamu;
    
    if (!tempMap[unit]) tempMap[unit] = {};
    if (!tempMap[unit][tgl]) tempMap[unit][tgl] = 0;
    tempMap[unit][tgl] += totalCount;
  });
  
  for (let u in tempMap) {
    historyByUnit[u] = [];
    let dates = Object.keys(tempMap[u]).sort(); 
    dates.forEach(d => {
      historyByUnit[u].push({ date: d, count: tempMap[u][d] });
    });
  }
  
  return { history: historyByUnit['ALL'], historyByUnit: historyByUnit };
}

// ==========================================
// 4. SUBMIT FORM & AKTIVITAS
// ==========================================
function submitAbsensi(data) {
  const ss = getDB();
  const sheetSummary = ss.getSheetByName('Absensi');
  const sheetHistory = ss.getSheetByName('RiwayatAbsen');
  
  let hadir = 0;
  let alpha = 0;
  for (let id in data.attendance) {
    if (data.attendance[id] === 'Hadir') hadir++;
    if (data.attendance[id] === 'Alpha') alpha++;
  }
  
  sheetSummary.appendRow([
    data.tanggal, 
    data.type, 
    data.unit, 
    data.tamu, 
    hadir, 
    alpha, 
    JSON.stringify(data.attendance)
  ]);
  
  const histDataRange = sheetHistory.getDataRange();
  const histValues = histDataRange.getValues();
  let rowsToDelete = [];
  
  for (let i = 1; i < histValues.length; i++) {
    if (histValues[i][0] === data.tanggal && histValues[i][1] === data.type && histValues[i][2] === data.unit) {
      rowsToDelete.push(i + 1);
    }
  }
  
  rowsToDelete.reverse().forEach(rowIdx => sheetHistory.deleteRow(rowIdx));
  
  for (let id in data.attendance) {
    sheetHistory.appendRow([
      data.tanggal,
      data.type,
      data.unit,
      id,
      data.attendance[id]
    ]);
  }
  
  return true;
}

function submitKegiatan(data) {
  const sheet = getDB().getSheetByName('Kegiatan');
  sheet.appendRow([data.tanggal, data.unit, JSON.stringify(data.laporan)]);
  return true;
}

function submitDoa(data) {
  const sheet = getDB().getSheetByName('Doa');
  sheet.appendRow([new Date().toISOString().split('T')[0], data.nama, data.telp, JSON.stringify(data.poin)]);
  return true;
}

// ==========================================
// 5. FITUR GANTI PIN
// ==========================================
function changePin(data) {
  const sheetName = data.role === 'admin' ? 'Admin' : 'Unit';
  const idColIndex = 0; 
  const pinColIndex = 1; 
  
  const sheet = getDB().getSheetByName(sheetName);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idColIndex]).trim() === String(data.identifier).trim()) {
      if (String(rows[i][pinColIndex]).trim() === String(data.oldPin).trim()) {
        sheet.getRange(i + 1, pinColIndex + 1).setValue(data.newPin);
        return true;
      } else {
        throw new Error("PIN Lama Salah!");
      }
    }
  }
  throw new Error("Pengguna tidak ditemukan!");
}

// ==========================================
// 6. CRUD JEMAAT (ANGGOTA)
// ==========================================
function addMember(data) {
  const sheet = getDB().getSheetByName('Anggota');
  const newId = "M" + new Date().getTime(); 
  sheet.appendRow([newId, data.nama, data.tanggalLahir, data.status, data.unit, data.kelasTetap, data.jabatan]);
  return true;
}

function updateMember(data) {
  const sheet = getDB().getSheetByName('Anggota');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.id)) {
      sheet.getRange(i + 1, 2, 1, 6).setValues([[data.nama, data.tanggalLahir, data.status, data.unit, data.kelasTetap, data.jabatan]]);
      return true;
    }
  }
  throw new Error("Member tidak ditemukan!");
}

function deleteMember(id) {
  const sheet = getDB().getSheetByName('Anggota');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// ==========================================
// 7. CRUD UNIT
// ==========================================
function addUnit(data) {
  const sheet = getDB().getSheetByName('Unit');
  sheet.appendRow([data.name, data.pin]);
  return true;
}

function updateUnit(data) {
  const sheet = getDB().getSheetByName('Unit');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(data.oldName).trim()) {
      sheet.getRange(i + 1, 1, 1, 2).setValues([[data.newName, data.pin]]);
      
      if (data.oldName !== data.newName) {
        updateUnitNameInMembers(data.oldName, data.newName);
      }
      return true;
    }
  }
  throw new Error("Unit tidak ditemukan!");
}

function deleteUnit(name) {
  const sheet = getDB().getSheetByName('Unit');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(name).trim()) {
      sheet.deleteRow(i + 1);
      updateUnitNameInMembers(name, 'Umum');
      return true;
    }
  }
  return false;
}

function updateUnitNameInMembers(oldName, newName) {
  const sheet = getDB().getSheetByName('Anggota');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][4]).trim() === String(oldName).trim()) {
      sheet.getRange(i + 1, 5).setValue(newName);
    }
  }
}

// ==========================================
// 8. CRUD JABATAN & ADMIN
// ==========================================
function addRole(name) {
  getDB().getSheetByName('Jabatan').appendRow([name]); return true;
}

function updateRole(data) {
  const sheet = getDB().getSheetByName('Jabatan');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(data.oldName).trim()) {
      sheet.getRange(i + 1, 1).setValue(data.newName); return true;
    }
  }
}

function deleteRole(name) {
  const sheet = getDB().getSheetByName('Jabatan');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(name).trim()) {
      sheet.deleteRow(i + 1); return true;
    }
  }
}

function addAdmin(data) {
  getDB().getSheetByName('Admin').appendRow([data.username, data.pin]); return true;
}

function updateAdmin(data) {
  const sheet = getDB().getSheetByName('Admin');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(data.oldUsername).trim()) {
      sheet.getRange(i + 1, 1, 1, 2).setValues([[data.newUsername, data.pin]]); return true;
    }
  }
}

function deleteAdmin(username) {
  const sheet = getDB().getSheetByName('Admin');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(username).trim()) {
      sheet.deleteRow(i + 1); return true;
    }
  }
}

// ==========================================
// HELPER: Mengubah Sheet Menjadi JSON Object
// ==========================================
function getSheetData(sheetName) {
  const sheet = getDB().getSheetByName(sheetName);
  if (!sheet) return [];
  
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return []; 
  
  const headers = rows[0];
  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      let cellValue = rows[i][j];
      if (cellValue instanceof Date) {
        let m = cellValue.getMonth() + 1;
        let d = cellValue.getDate();
        cellValue = cellValue.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
      }
      obj[headers[j]] = cellValue;
    }
    data.push(obj);
  }
  return data;
}