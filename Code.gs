/**
 * =====================================================================
 * BACKEND PISGAH BISDAC v1.0 - MATRIX SYSTEM
 * =====================================================================
 */

const SPREADSHEET_ID = '1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc'; 

function getDb() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// =====================================================================
// 1. ROUTER UTAMA (API ENDPOINT)
// =====================================================================
function doPost(e) {
  // CORS Preflight / Fallback
  if (!e || !e.postData) return outputJSON({ status: 'error', message: 'No Data' });

  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const data = requestData.data || {};
    
    // Inisialisasi Sheet Dasar jika belum ada saat pertama kali dipanggil
    setupDatabase();

    let result;
    switch (action) {
      case 'getInitialData': result = getInitialData(); break;
      case 'changePin': result = changePin(data); break;
      case 'getRekapData': result = getRekapData(data); break;
      
      case 'submitAbsensi': result = submitAbsensi(data); break;
      case 'submitKegiatan': result = submitKegiatan(data); break;
      case 'submitDoa': result = submitDoa(data); break;
      
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
      
      default: result = { status: 'error', message: 'Aksi tidak dikenali!' };
    }
    
    return outputJSON(result);

  } catch (error) {
    return outputJSON({ status: 'error', message: error.toString() });
  }
}

// Untuk menangani Request GET ringan (jika diperlukan)
function doGet(e) {
  return outputJSON({ status: 'success', message: 'PISGAH BISDAC Backend API Active.' });
}

function outputJSON(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}


// =====================================================================
// 2. SETUP DATABASE (OTOMATIS MEMBUAT TAB JIKA KOSONG)
// =====================================================================
function setupDatabase() {
  const db = getDb();
  ensureSheet(db, 'Members', ['ID', 'Nama', 'Status', 'Kategori', 'Unit', 'Jabatan', 'Tanggal Lahir']);
  
  // Sheet Default Admin
  const adminSheet = ensureSheet(db, 'Admins', ['Username', 'PIN Akses']);
  if (adminSheet.getLastRow() === 1) {
    adminSheet.appendRow(['AdminUtama', '123456']); // Admin Bawaan
  }

  ensureSheet(db, 'Units', ['Nama Unit', 'PIN Akses']);
  ensureSheet(db, 'Jabatan', ['Nama Jabatan']);
  ensureSheet(db, 'Stats_History', ['Tanggal', 'Kategori', 'Total']);
}

function ensureSheet(db, sheetName, headers) {
  let sheet = db.getSheetByName(sheetName);
  if (!sheet) {
    sheet = db.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
         .setBackground('#0a192f').setFontColor('#D4AF37').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Helper: Membaca sheet menjadi array of objects
function readSheetAsObj(sheet) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return [];
  
  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = data[0];
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      let val = data[i][j];
      // Format tanggal jika objek date
      if (val instanceof Date) {
        val = new Date(val.getTime() - (val.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      }
      obj[headers[j]] = val;
    }
    rows.push(obj);
  }
  return rows;
}


// =====================================================================
// 3. PENGAMBILAN DATA AWAL (SYNC)
// =====================================================================
function getInitialData() {
  const db = getDb();
  const members = readSheetAsObj(db.getSheetByName('Members'));
  const units = readSheetAsObj(db.getSheetByName('Units'));
  const roles = readSheetAsObj(db.getSheetByName('Jabatan'));
  const admins = readSheetAsObj(db.getSheetByName('Admins'));
  const statsRows = readSheetAsObj(db.getSheetByName('Stats_History'));
  
  // Format Data Statistik untuk Chart Frontend
  let statsData = { history: [], historyByUnit: {} };
  statsRows.forEach(row => {
    let cat = row['Kategori'];
    let date = row['Tanggal'];
    let count = parseInt(row['Total']) || 0;
    
    if (!statsData.historyByUnit[cat]) statsData.historyByUnit[cat] = [];
    
    // Cek apakah tanggal sudah ada, jika ada ditimpa (update terakhir)
    let existingIndex = statsData.historyByUnit[cat].findIndex(x => x.date === date);
    if(existingIndex > -1) {
      statsData.historyByUnit[cat][existingIndex].count = count;
    } else {
      statsData.historyByUnit[cat].push({ date: date, count: count });
    }
  });

  return {
    status: 'success',
    data: { members, units, roles, admins, stats: statsData }
  };
}


// =====================================================================
// 4. AUTENTIKASI & PENGATURAN PIN
// =====================================================================
function changePin(data) {
  const db = getDb();
  let sheet, searchCol, pinCol;
  
  if (data.role === 'admin') {
    sheet = db.getSheetByName('Admins');
    searchCol = 1; // Username
    pinCol = 2;
  } else {
    sheet = db.getSheetByName('Units');
    searchCol = 1; // Nama Unit
    pinCol = 2;
  }

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][searchCol - 1] === data.identifier) {
      // Verifikasi PIN Lama
      if (String(rows[i][pinCol - 1]).trim() === String(data.oldPin).trim()) {
        sheet.getRange(i + 1, pinCol).setValue(String(data.newPin));
        return { status: 'success', message: 'PIN berhasil diubah!' };
      } else {
        return { status: 'error', message: 'PIN lama salah!' };
      }
    }
  }
  return { status: 'error', message: 'Pengguna tidak ditemukan!' };
}


// =====================================================================
// 5. FITUR TRANSAKSIONAL (ABSENSI, KEGIATAN, DOA)
// =====================================================================
function submitAbsensi(data) {
  const db = getDb();
  const sheetName = 'Absensi_' + data.type; // ex: Absensi_Khotbah
  const sheet = ensureSheet(db, sheetName, ['Tanggal', 'ID Anggota', 'Nama Anggota', 'Unit', 'Jabatan', 'Status', 'Tamu']);
  
  const membersSheet = db.getSheetByName('Members');
  const membersData = readSheetAsObj(membersSheet);
  
  let totalHadir = 0;
  let rowsToAppend = [];
  
  for (const id in data.attendance) {
    let status = data.attendance[id];
    let m = membersData.find(x => x.ID === id);
    if (m) {
      rowsToAppend.push([
        data.tanggal, id, m.Nama, m.Unit, m.Jabatan, status, 0
      ]);
      if (status === 'Hadir') totalHadir++;
    }
  }

  // Masukkan Baris Tamu (Jika ada)
  const tamuCount = parseInt(data.tamu) || 0;
  if (tamuCount > 0) {
    rowsToAppend.push([
      data.tanggal, 'TAMU', 'Tamu / Simpatisan', data.unit, '-', 'Hadir', tamuCount
    ]);
    totalHadir += tamuCount; // Tamu dihitung hadir
  }

  // Simpan massal ke sheet absensi
  if(rowsToAppend.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
  }

  // Perbarui Data Statistik History Dashboard (Hanya Khotbah yang dihitung sebagai Global)
  if (data.type === 'Khotbah') {
    const statSheet = ensureSheet(db, 'Stats_History', ['Tanggal', 'Kategori', 'Total']);
    
    // Simpan history untuk Unit yang bersangkutan
    statSheet.appendRow([data.tanggal, data.unit, totalHadir]);
    
    // Simpan history khusus Tamu
    if (tamuCount > 0) {
       statSheet.appendRow([data.tanggal, 'Tamu', tamuCount]);
    }
    
    // Kalkulasi Total Global untuk tanggal tersebut
    let allStatRows = statSheet.getDataRange().getValues();
    let totalGlobal = 0;
    
    for (let i = 1; i < allStatRows.length; i++) {
      let rTgl = allStatRows[i][0];
      if (rTgl instanceof Date) rTgl = new Date(rTgl.getTime() - (rTgl.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      
      // Hitung semua kategori KECUALI 'ALL' dan 'Tamu' (karena tamu sudah dihitung masuk ke global secara logika jika dipisah akan ganda)
      // Pada struktur sistem Anda, dashboard mengambil ALL.
      if (rTgl === data.tanggal && allStatRows[i][1] !== 'ALL' && allStatRows[i][1] !== 'Tamu') {
        totalGlobal += parseInt(allStatRows[i][2]) || 0;
      }
    }
    
    // Tulis/Update total ALL
    statSheet.appendRow([data.tanggal, 'ALL', totalGlobal + tamuCount]);
  }

  return { status: 'success' };
}

function submitKegiatan(data) {
  const db = getDb();
  const sheet = ensureSheet(db, 'Kegiatan', [
    'Tanggal', 'Unit', 'Poin 1', 'Poin 2', 'Poin 3', 'Poin 4', 'Poin 5', 
    'Poin 6', 'Poin 7', 'Poin 8', 'Poin 9', 'Poin 10'
  ]);
  
  let row = [data.tanggal, data.unit, ...data.laporan];
  sheet.appendRow(row);
  return { status: 'success' };
}

function submitDoa(data) {
  const db = getDb();
  const sheet = ensureSheet(db, 'Permohonan_Doa', ['Tanggal', 'Nama Pemohon', 'No HP', 'Pokok Doa']);
  
  let now = new Date().toISOString().split('T')[0];
  let poinStr = data.poin.join('\n- ');
  
  sheet.appendRow([now, data.nama, data.telp, '- ' + poinStr]);
  return { status: 'success' };
}


// =====================================================================
// 6. FITUR REKAPITULASI (AMBIL DATA BERDASARKAN FILTER)
// =====================================================================
function getRekapData(data) {
  const db = getDb();
  const sheetName = data.sheetName; // misal: "Absensi_Khotbah", "Kegiatan"
  const targetDate = data.tanggal;
  
  const sheet = db.getSheetByName(sheetName);
  if (!sheet) return { status: 'success', data: [] }; 
  
  const rawData = readSheetAsObj(sheet);
  
  // Filter berdasarkan kolom 'Tanggal'
  const filtered = rawData.filter(row => {
    let rowDateStr = row['Tanggal'];
    return rowDateStr === targetDate;
  });
  
  return { status: 'success', data: filtered };
}


// =====================================================================
// 7. CRUD MASTER (JEMAAT, UNIT, JABATAN, ADMIN)
// =====================================================================

// --- MASTER JEMAAT ---
function addMember(data) {
  const sheet = getDb().getSheetByName('Members');
  sheet.appendRow([
    data.id, data.nama, data.status, data.kelasTetap, data.unit, data.jabatan, data.tanggalLahir
  ]);
  return { status: 'success' };
}

function updateMember(data) {
  const sheet = getDb().getSheetByName('Members');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.getRange(i + 1, 2, 1, 6).setValues([[
        data.nama, data.status, data.kelasTetap, data.unit, data.jabatan, data.tanggalLahir
      ]]);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'Data tidak ditemukan' };
}

function deleteMember(data) {
  const sheet = getDb().getSheetByName('Members');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}

// --- MASTER UNIT ---
function addUnit(data) {
  const sheet = getDb().getSheetByName('Units');
  sheet.appendRow([data.newName, data.pin || Math.floor(1000 + Math.random() * 9000)]);
  return { status: 'success' };
}

function updateUnit(data) {
  const sheet = getDb().getSheetByName('Units');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.oldName) {
      sheet.getRange(i + 1, 1, 1, 2).setValues([[data.newName, data.pin]]);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}

function deleteUnit(data) {
  const sheet = getDb().getSheetByName('Units');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.name) {
      sheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}

// --- MASTER JABATAN ---
function addRole(data) {
  const sheet = getDb().getSheetByName('Jabatan');
  sheet.appendRow([data.newName]);
  return { status: 'success' };
}

function updateRole(data) {
  const sheet = getDb().getSheetByName('Jabatan');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.oldName) {
      sheet.getRange(i + 1, 1).setValue(data.newName);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}

function deleteRole(data) {
  const sheet = getDb().getSheetByName('Jabatan');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.name) {
      sheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}

// --- MASTER ADMIN ---
function addAdmin(data) {
  const sheet = getDb().getSheetByName('Admins');
  sheet.appendRow([data.newUsername, data.pin]);
  return { status: 'success' };
}

function updateAdmin(data) {
  const sheet = getDb().getSheetByName('Admins');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.oldUsername) {
      sheet.getRange(i + 1, 1, 1, 2).setValues([[data.newUsername, data.pin]]);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}

function deleteAdmin(data) {
  const sheet = getDb().getSheetByName('Admins');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.username) {
      sheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}