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
  
  let statsData = { history: [], historyByUnit: {} };
  statsRows.forEach(row => {
    let cat = row['Kategori'];
    let date = row['Tanggal'];
    let count = parseInt(row['Total']) || 0;
    
    if (!statsData.historyByUnit[cat]) statsData.historyByUnit[cat] = [];
    
    let existingIndex = statsData.historyByUnit[cat].findIndex(x => x.date === date);
    if(existingIndex > -1) {
      statsData.historyByUnit[cat][existingIndex].count = count;
    } else {
      statsData.historyByUnit[cat].push({ date: date, count: count });
    }
  });

  return { status: 'success', data: { members, units, roles, admins, stats: statsData } };
}


// =====================================================================
// 4. AUTENTIKASI & PENGATURAN PIN
// =====================================================================
function changePin(data) {
  const db = getDb();
  let sheet, searchCol, pinCol;
  
  if (data.role === 'admin') { sheet = db.getSheetByName('Admins'); searchCol = 1; pinCol = 2; } 
  else { sheet = db.getSheetByName('Units'); searchCol = 1; pinCol = 2; }

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][searchCol - 1] === data.identifier) {
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
// 5. FITUR TRANSAKSIONAL (SISTEM ABSENSI MATRIX)
// =====================================================================
function submitAbsensi(data) {
  const db = getDb();
  const sheetName = 'Absensi_' + data.type; 
  let sheet = db.getSheetByName(sheetName);
  
  // Format Header Baru untuk Matrix
  const standardHeaders = ['ID Anggota', 'Nama Anggota', 'Unit', 'Jabatan', 'Status Baptis'];
  
  if (!sheet) {
    sheet = db.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, standardHeaders.length).setValues([standardHeaders])
         .setBackground('#0a192f').setFontColor('#D4AF37').setFontWeight('bold');
    
    // Kunci Baris Keterangan Jemaat & Baris Tamu
    sheet.setFrozenRows(2);
    sheet.setFrozenColumns(2); 
    
    // Pembuatan Baris 2 Khusus Untuk Total TAMU
    sheet.appendRow(['TAMU', 'Total Tamu / Simpatisan', '-', '-', '-']);
    sheet.getRange(2, 1, 1, standardHeaders.length).setBackground('#112240').setFontColor('#F59E0B').setFontWeight('bold');
  }

  let lastCol = sheet.getLastColumn();
  if(lastCol < standardHeaders.length) lastCol = standardHeaders.length;
  
  let headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  // Deteksi Kolom Tanggal (Atau Buat Baru di Kanan)
  let dateTarget = data.tanggal;
  let dateColIdx = headers.findIndex(h => {
    if(!h) return false;
    let hStr = h instanceof Date ? new Date(h.getTime() - (h.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : String(h);
    return hStr.startsWith(dateTarget);
  });

  if (dateColIdx === -1) {
    dateColIdx = headers.length; // Tambah di kolom paling ujung kanan
    sheet.getRange(1, dateColIdx + 1).setValue(dateTarget)
         .setBackground('#0a192f').setFontColor('#D4AF37').setFontWeight('bold').setHorizontalAlignment('center');
  }

  const dateCol = dateColIdx + 1; // Index untuk range getRange (1-based)
  
  // Tarik Data Anggota Terbaru dari Database (Agar Unit & Status Up-to-date)
  const membersSheet = db.getSheetByName('Members');
  const membersData = readSheetAsObj(membersSheet);
  const membersMap = {};
  membersData.forEach(m => membersMap[m.ID || m.id] = m);

  // Proses Input Tamu di Baris ke-2
  const tamuCount = parseInt(data.tamu) || 0;
  sheet.getRange(2, dateCol).setValue(tamuCount + ' Jiwa')
       .setHorizontalAlignment('center').setFontWeight('bold').setFontColor('#F59E0B').setBackground('#112240');

  // Proses Input Anggota
  const lastRow = sheet.getLastRow();
  let existingRows = [];
  if (lastRow > 2) existingRows = sheet.getRange(3, 1, lastRow - 2, 1).getValues(); // Ambil list ID di kolom A
  
  let rowIndexMap = {};
  for(let i=0; i<existingRows.length; i++) {
    if(existingRows[i][0]) rowIndexMap[existingRows[i][0]] = i + 3; // +3 karena Baris 1:Header, Baris 2:Tamu
  }
  
  let totalHadir = 0;
  let newRowsData = [];

  for (const id in data.attendance) {
    let status = data.attendance[id];
    if (status === 'Hadir') totalHadir++;
    
    let m = membersMap[id] || {};
    let mNama = m.Nama || m.nama || 'Unknown';
    let mUnit = m.Unit || m.unit || '-';
    let mJab = m.Jabatan || m.jabatan || 'Anggota';
    let mStat = m.Status || m.status || '-';

    if (rowIndexMap[id]) {
      // Jemaat Sudah Ada: Update identitas & absensi di baris yang sama
      let r = rowIndexMap[id];
      sheet.getRange(r, 2, 1, 4).setValues([[mNama, mUnit, mJab, mStat]]); // Sinkronisasi Identitas
      sheet.getRange(r, dateCol).setValue(status).setHorizontalAlignment('center');
    } else {
      // Jemaat Baru Pertama Kali Diabsen: Buat baris baru
      let newRow = new Array(dateColIdx + 1).fill('-');
      newRow[0] = id;
      newRow[1] = mNama;
      newRow[2] = mUnit;
      newRow[3] = mJab;
      newRow[4] = mStat;
      newRow[dateColIdx] = status;
      newRowsData.push(newRow);
    }
  }

  // Sisipkan Baris Anggota Baru Sekaligus (Optimasi Kinerja)
  if (newRowsData.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, newRowsData.length, newRowsData[0].length).setValues(newRowsData);
  }

  // Update Data Statistik Dashboard
  if (data.type === 'Khotbah') {
    const statSheet = ensureSheet(db, 'Stats_History', ['Tanggal', 'Kategori', 'Total']);
    statSheet.appendRow([data.tanggal, data.unit, totalHadir]);
    if (tamuCount > 0) statSheet.appendRow([data.tanggal, 'Tamu', tamuCount]);
    
    let allStatRows = statSheet.getDataRange().getValues();
    let totalGlobal = 0;
    
    for (let i = 1; i < allStatRows.length; i++) {
      let rTgl = allStatRows[i][0];
      if (rTgl instanceof Date) rTgl = new Date(rTgl.getTime() - (rTgl.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      
      if (rTgl === data.tanggal && allStatRows[i][1] !== 'ALL' && allStatRows[i][1] !== 'Tamu') {
        totalGlobal += parseInt(allStatRows[i][2]) || 0;
      }
    }
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
  sheet.appendRow([data.tanggal, data.unit, ...data.laporan]);
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
// 6. FITUR REKAPITULASI (PEMBACAAN TABEL MATRIX)
// =====================================================================
function getRekapData(data) {
  const db = getDb();
  const sheetName = data.sheetName; 
  const targetDate = data.tanggal; 
  
  const sheet = db.getSheetByName(sheetName);
  if (!sheet) return { status: 'success', data: [] }; 
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return { status: 'success', data: [] }; 
  
  const rawData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = rawData[0];
  
  // Kondisi Khusus untuk Laporan Kegiatan (Format Klasik Baris)
  if (sheetName === 'Kegiatan' || sheetName === 'Permohonan_Doa') {
    const filtered = [];
    for (let i = 1; i < rawData.length; i++) {
      let rowDateStr = String(rawData[i][0] || '').trim();
      if (rowDateStr instanceof Date) rowDateStr = new Date(rowDateStr.getTime() - (rowDateStr.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      else if (rowDateStr.includes('/')) {
        let parts = rowDateStr.split('/');
        if (parts.length === 3) rowDateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      
      if (rowDateStr.startsWith(targetDate)) {
        let obj = {};
        for(let j=0; j<headers.length; j++) obj[headers[j]] = rawData[i][j];
        filtered.push(obj);
      }
    }
    return { status: 'success', data: filtered };
  }

  // PEMBACAAN UNTUK FORMAT MATRIX (Absensi Khotbah, SS, dll)
  let dateColIdx = -1;
  for (let j = 4; j < headers.length; j++) { // Mulai dari index 4 (Kolom Date Pertama)
    let hStr = headers[j];
    if (hStr instanceof Date) hStr = new Date(hStr.getTime() - (hStr.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    else hStr = String(hStr);

    if (hStr.startsWith(targetDate)) { dateColIdx = j; break; }
  }

  if (dateColIdx === -1) return { status: 'success', data: [] }; // Tanggal tidak ditemukan

  const filtered = [];
  
  // Masukkan Baris 2 (Tamu) ke Paling Atas Rekapan
  let tamuVal = String(rawData[1][dateColIdx]).trim();
  filtered.push({
    'Nama Anggota': '👤 TOTAL TAMU / SIMPATISAN',
    'Unit': '-',
    'Jabatan': '-',
    'Status Baptis': '-',
    'Kehadiran': tamuVal && tamuVal !== '-' ? tamuVal : '0 Jiwa'
  });

  // Masukkan Baris 3 dan Seterusnya (Anggota)
  for (let i = 2; i < rawData.length; i++) {
    let att = rawData[i][dateColIdx];
    if (att === "" || att === "-") continue; // Abaikan anggota yang kosong absensinya pada tanggal ini

    filtered.push({
      'Nama Anggota': rawData[i][1],
      'Unit': rawData[i][2],
      'Jabatan': rawData[i][3],
      'Status Baptis': rawData[i][4],
      'Kehadiran': att
    });
  }

  return { status: 'success', data: filtered };
}


// =====================================================================
// 7. CRUD MASTER (JEMAAT, UNIT, JABATAN, ADMIN)
// =====================================================================
function addMember(data) {
  getDb().getSheetByName('Members').appendRow([
    data.id, data.nama, data.status, data.kelasTetap, data.unit, data.jabatan, data.tanggalLahir
  ]);
  return { status: 'success' };
}
function updateMember(data) {
  const sheet = getDb().getSheetByName('Members'); const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.getRange(i + 1, 2, 1, 6).setValues([[ data.nama, data.status, data.kelasTetap, data.unit, data.jabatan, data.tanggalLahir ]]);
      return { status: 'success' };
    }
  } return { status: 'error' };
}
function deleteMember(data) {
  const sheet = getDb().getSheetByName('Members'); const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) { if (rows[i][0] === data.id) { sheet.deleteRow(i + 1); return { status: 'success' }; } } return { status: 'error' };
}

function addUnit(data) { getDb().getSheetByName('Units').appendRow([data.newName, data.pin || Math.floor(1000 + Math.random() * 9000)]); return { status: 'success' }; }
function updateUnit(data) {
  const sheet = getDb().getSheetByName('Units'); const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) { if (rows[i][0] === data.oldName) { sheet.getRange(i + 1, 1, 1, 2).setValues([[data.newName, data.pin]]); return { status: 'success' }; } } return { status: 'error' };
}
function deleteUnit(data) {
  const sheet = getDb().getSheetByName('Units'); const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) { if (rows[i][0] === data.name) { sheet.deleteRow(i + 1); return { status: 'success' }; } } return { status: 'error' };
}

function addRole(data) { getDb().getSheetByName('Jabatan').appendRow([data.newName]); return { status: 'success' }; }
function updateRole(data) {
  const sheet = getDb().getSheetByName('Jabatan'); const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) { if (rows[i][0] === data.oldName) { sheet.getRange(i + 1, 1).setValue(data.newName); return { status: 'success' }; } } return { status: 'error' };
}
function deleteRole(data) {
  const sheet = getDb().getSheetByName('Jabatan'); const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) { if (rows[i][0] === data.name) { sheet.deleteRow(i + 1); return { status: 'success' }; } } return { status: 'error' };
}

function addAdmin(data) { getDb().getSheetByName('Admins').appendRow([data.newUsername, data.pin]); return { status: 'success' }; }
function updateAdmin(data) {
  const sheet = getDb().getSheetByName('Admins'); const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) { if (rows[i][0] === data.oldUsername) { sheet.getRange(i + 1, 1, 1, 2).setValues([[data.newUsername, data.pin]]); return { status: 'success' }; } } return { status: 'error' };
}
function deleteAdmin(data) {
  const sheet = getDb().getSheetByName('Admins'); const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) { if (rows[i][0] === data.username) { sheet.deleteRow(i + 1); return { status: 'success' }; } } return { status: 'error' };
}

// =====================================================================
// MENU CUSTOM & TEMA SPREADSHEET (DARK & GOLD)
// =====================================================================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('✨ PISGAH MATRIX')
    .addItem('🎨 Terapkan Tema (Dark & Gold)', 'applyMatrixThemeToSpreadsheet')
    .addToUi();
}

function applyMatrixThemeToSpreadsheet() {
  const db = getDb();
  const sheets = db.getSheets();
  
  sheets.forEach(sheet => {
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow === 0 || lastCol === 0) return; 
    
    const headerRange = sheet.getRange(1, 1, 1, lastCol);
    headerRange.setBackground('#0a192f').setFontColor('#D4AF37').setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
    
    if (lastRow > 1) {
      const bodyRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
      bodyRange.setBackground('#112240').setFontColor('#e6f1ff').setVerticalAlignment('middle').setHorizontalAlignment('center');
      bodyRange.setBorder(true, true, true, true, true, true, '#D4AF37', SpreadsheetApp.BorderStyle.SOLID);
    }
    
    for (let i = 1; i <= lastCol; i++) {
      sheet.autoResizeColumn(i);
      let currentWidth = sheet.getColumnWidth(i);
      sheet.setColumnWidth(i, currentWidth + 20); 
    }
  });
  
  SpreadsheetApp.getActiveSpreadsheet().toast('Tema Matrix (Dark & Gold) berhasil diterapkan ke semua sheet!', 'SELESAI');
}