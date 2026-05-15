// =========================================================================
// PISGAH BISDAC - MATRIX SYSTEM BACKEND v1.1 (OPTIMIZED)
// =========================================================================

// MASUKKAN ID SPREADSHEET ANDA DI SINI
const SPREADSHEET_ID = "1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc";

// Helper untuk memanggil database
function getDB() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    throw new Error("Gagal membuka Spreadsheet. Pastikan ID benar dan izin diberikan.");
  }
}

/**
 * 1. SETUP AWAL (JALANKAN FUNGSI INI SEKALI SAJA)
 */
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
      sheet.getRange(1, 1, 1, s.headers.length)
           .setFontWeight("bold")
           .setBackground("#0a192f")
           .setFontColor("white");
    }
  });

  const adminSheet = ss.getSheetByName('Admin');
  if (adminSheet.getLastRow() <= 1) {
    adminSheet.appendRow(['Admin Utama', '123456']);
  }
}

/**
 * 2. ENTRY POINT (GET) - Untuk cek koneksi sederhana
 */
function doGet(e) {
  return respond("success", "Backend Matrix System Aktif. Silakan gunakan metode POST.");
}

/**
 * 3. ENTRY POINT (POST) - Menerima request dari Frontend
 */
function doPost(e) {
  // CORS Handling
  if (!e || !e.postData || !e.postData.contents) {
    return respond("error", "Data tidak ditemukan");
  }

  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const data = payload.data || {};
    
    let responseData = null;

    switch (action) {
      case 'getInitialData': 
        responseData = getInitialData(); 
        break;
      case 'submitAbsensi': 
        responseData = submitAbsensi(data); 
        break;
      case 'submitKegiatan': 
        responseData = submitKegiatan(data); 
        break;
      case 'submitDoa': 
        responseData = submitDoa(data); 
        break;
      case 'changePin': 
        responseData = changePin(data); 
        break;
      
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
        return respond("error", "Aksi '" + action + "' tidak dikenali!");
    }
    
    return respond("success", "OK", responseData);
    
  } catch (err) {
    return respond("error", "Backend Error: " + err.toString());
  }
}

// Helper Response JSON
function respond(status, message, data = null) {
  const result = { status: status, message: message };
  if (data) result.data = data;
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 4. FUNGSI PENGAMBILAN DATA
 */
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
    const tipe = row['Tipe'];
    const id = row['ID_Anggota'];
    const tgl = row['Tanggal'];
    const status = row['Status'];
    
    if (!tipe || !id) return;
    if (!history[tipe]) history[tipe] = {};
    if (!history[tipe][id]) history[tipe][id] = {};
    
    history[tipe][id][tgl] = status;
  });
  
  return history;
}

function buildStats() {
  const data = getSheetData('Absensi');
  let historyByUnit = { 'ALL': [] };
  let tempMap = { 'ALL': {} };
  
  data.forEach(row => {
    const tgl = row['Tanggal'];
    const unit = (row['Unit'] || 'Umum').trim();
    const hadir = parseInt(row['Hadir']) || 0;
    const tamu = parseInt(row['Tamu']) || 0;
    const totalCount = hadir + tamu;
    
    if (!tempMap['ALL'][tgl]) tempMap['ALL'][tgl] = 0;
    tempMap['ALL'][tgl] += totalCount;
    
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

/**
 * 5. SUBMIT FORM
 */
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
  
  // Catat Ringkasan
  sheetSummary.appendRow([
    data.tanggal, 
    data.type, 
    data.unit, 
    data.tamu, 
    hadir, 
    alpha, 
    JSON.stringify(data.attendance)
  ]);
  
  // Hapus histori lama di tanggal/tipe/unit yang sama agar tidak duplikat
  const histValues = sheetHistory.getDataRange().getValues();
  for (let i = histValues.length - 1; i >= 1; i--) {
    if (histValues[i][0] === data.tanggal && 
        histValues[i][1] === data.type && 
        histValues[i][2] === data.unit) {
      sheetHistory.deleteRow(i + 1);
    }
  }
  
  // Masukkan histori baru satu per satu
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

function changePin(data) {
  const sheetName = data.role === 'admin' ? 'Admin' : 'Unit';
  const sheet = getDB().getSheetByName(sheetName);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(data.identifier).trim()) {
      if (String(rows[i][1]).trim() === String(data.oldPin).trim()) {
        sheet.getRange(i + 1, 2).setValue(data.newPin);
        return true;
      } else {
        throw new Error("PIN Lama Salah!");
      }
    }
  }
  throw new Error("Pengguna tidak ditemukan!");
}

/**
 * 6. CRUD ANGGOTA
 */
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

/**
 * 7. CRUD UNIT & ADMIN (Sesuai Struktur)
 */
function addUnit(data) {
  getDB().getSheetByName('Unit').appendRow([data.name, data.pin]);
  return true;
}

function updateUnit(data) {
  const sheet = getDB().getSheetByName('Unit');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(data.oldName).trim()) {
      sheet.getRange(i + 1, 1, 1, 2).setValues([[data.newName, data.pin]]);
      return true;
    }
  }
}

function deleteUnit(name) {
  const sheet = getDB().getSheetByName('Unit');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(name).trim()) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
}

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

/**
 * HELPER: Mengubah Sheet Menjadi JSON Object
 */
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
      
      // Konversi Tanggal ke string YYYY-MM-DD agar aman di Frontend
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