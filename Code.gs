/**
 * KONFIGURASI BACKEND PISGAH BISDAC v1.0 (Admin Control Panel & Doa)
 * Spreadsheet ID: 1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc
 */

const SPREADSHEET_ID = '1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc'; 
const DEFAULT_MASTER_PIN = '12345'; // Digunakan hanya untuk trigger otomatis pertama kali

function getDb() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

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
      
      // --- TAMBAHKAN 3 BARIS INI AGAR AKSI DIKENALI ---
      case 'submitAbsensi': result = submitAbsensi(data); break;
      case 'submitKegiatan': result = submitKegiatan(data); break;
      case 'submitDoa': result = submitDoa(data); break;
      // ------------------------------------------------

      default:
        result = { status: 'error', message: 'Aksi tidak dikenali: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==============================================================
// CORE FETCH DATA
// ==============================================================
function getInitialData() {
  const ss = getDb();
  const sheet = ss.getSheetByName('Members') || createMainSheet(ss);
  const unitSheet = ss.getSheetByName('Units') || createUnitSheet(ss, sheet);
  const roleSheet = ss.getSheetByName('Jabatan') || createRoleSheet(ss);
  const adminSheet = ss.getSheetByName('Admins') || createAdminSheet(ss);
  
  const values = sheet.getDataRange().getValues();
  const members = values.length > 1 ? values.slice(1).map(r => ({ 
    id: r[0], nama: r[1], status: r[2], kelasTetap: r[3], unit: r[4] || 'Umum', jabatan: r[5] || 'Anggota', tanggalLahir: r[6] instanceof Date ? Utilities.formatDate(r[6], Session.getScriptTimeZone(), 'yyyy-MM-dd') : (r[6] || '')
  })) : [];

  const unitValues = unitSheet.getDataRange().getValues();
  let units = [];
  if (unitValues.length > 1) {
    units = unitValues.slice(1).map((r, i) => {
      let pin = r[1];
      if (!pin) {
        pin = Math.floor(1000 + Math.random() * 9000).toString();
        unitSheet.getRange(i + 2, 2).setValue(pin);
      }
      return { name: r[0], pin: pin.toString().trim() }; 
    });
  }

  const roleValues = roleSheet.getDataRange().getValues();
  const roles = roleValues.length > 1 ? roleValues.slice(1).map(r => r[0]) : [];

  const adminValues = adminSheet.getDataRange().getValues();
  let admins = [];
  if (adminValues.length > 1) {
    admins = adminValues.slice(1).map(r => ({ username: r[0], pin: r[1].toString().trim() }));
  }

  const stats = getAttendanceStats(ss);

  return { status: 'success', members, units, roles, admins, stats };
}

// ==============================================================
// FUNGSI ABSENSI 
// ==============================================================
function submitAttendance(data) {
  const ss = getDb();
  
  if (data.type === 'kegiatan') return submitMatrixKegiatan(ss, data);

  let prefix = "";
  if (data.type === 'khotbah') prefix = "Khotbah";
  else if (data.type === 'sekolah_sabat') {
    if (data.category === 'ss_dewasa') prefix = "SS_Dewasa";
    else if (data.category === 'ss_anak') prefix = "SS_Anak";
    else if (data.category === 'pendalaman') prefix = "Pendalaman";
    else prefix = "Absensi";
  }

  const mSheet = ss.getSheetByName('Members');
  const mData = mSheet.getDataRange().getValues();
  const memberUnitMap = {};
  if (mData.length > 1) {
    for (let i = 1; i < mData.length; i++) {
      memberUnitMap[mData[i][0]] = mData[i][4] || 'Umum';
    }
  }

  const grouped = {};
  data.records.forEach(rec => {
    let unit = memberUnitMap[rec.memberId] || 'Umum';
    if (data.type === 'khotbah') unit = 'Jemaat';
    if (!grouped[unit]) grouped[unit] = [];
    grouped[unit].push(rec);
  });

  const dateStr = data.tanggal || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');

  for (const unit in grouped) {
    const safeUnitName = unit.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    const sheetName = `${prefix}_${safeUnitName}`; 
    let sheet = ss.getSheetByName(sheetName) || createMatrixSheet(ss, sheetName);

    const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    let colIdx = headers.indexOf(dateStr) + 1;

    if (colIdx === 0) {
      colIdx = sheet.getLastColumn() + 1;
      sheet.getRange(1, colIdx).setValue(dateStr).setBackground("#D4AF37").setFontWeight("bold").setHorizontalAlignment("center");
    }

    grouped[unit].forEach(rec => {
      let rowIdx = findMemberRow(sheet, rec.memberId);
      if (rowIdx === -1) {
        rowIdx = sheet.getLastRow() + 1;
        sheet.getRange(rowIdx, 1, 1, 2).setValues([[rec.memberId, rec.nama]]);
      }
      const bgStatus = rec.status === 'Hadir' ? '#e6f4ea' : '#fce8e6';
      const fontColor = rec.status === 'Hadir' ? '#137333' : '#c5221f';
      sheet.getRange(rowIdx, colIdx).setValue(rec.status).setHorizontalAlignment("center").setBackground(bgStatus).setFontColor(fontColor);
    });
  }

  if (data.tamu > 0) {
    let targetUnit = 'Jemaat';
    const unitKeys = Object.keys(grouped);
    if (unitKeys.length === 1) targetUnit = unitKeys[0];
    else if (data.unitFilter && data.unitFilter !== 'ALL') targetUnit = data.unitFilter;

    const safeTarget = targetUnit.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    const sheetName = `${prefix}_${safeTarget}`;
    let sheet = ss.getSheetByName(sheetName) || createMatrixSheet(ss, sheetName);
    
    const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    let colIdx = headers.indexOf(dateStr) + 1;
    if (colIdx === 0) {
      colIdx = sheet.getLastColumn() + 1;
      sheet.getRange(1, colIdx).setValue(dateStr).setBackground("#D4AF37").setFontWeight("bold").setHorizontalAlignment("center");
    }

    let tamuRowIdx = findTamuRow(sheet);
    if (tamuRowIdx === -1) {
      sheet.insertRowBefore(2);
      tamuRowIdx = 2;
      sheet.getRange(tamuRowIdx, 1, 1, 2).setValues([['TAMU', 'Tamu']]).setFontWeight("bold").setBackground("#f3f4f6").setFontColor("#000000");
    }
    sheet.getRange(tamuRowIdx, colIdx).setValue(data.tamu).setHorizontalAlignment("center");
  }

  return { status: 'success' };
}

function submitMatrixKegiatan(ss, data) {
  const safeTarget = (data.unitFilter && data.unitFilter !== 'ALL') ? data.unitFilter.replace(/[^a-zA-Z0-9 ]/g, "").trim() : 'Jemaat';
  const sheetName = `Kegiatan_${safeTarget}`;
  const kList = [
    "Anggota datang tepat waktu di S.S.",
    "Membaca Alkitab setiap hari",
    "Pelajaran S.S. setiap hari",
    "Renungan Pagi setiap hari",
    "Hadir Pertemuan Rabu Malam",
    "Melakukan Jangkauan Keluar (Pemberian Alkitab, Berdoa untuk orang lain, Membagikan makanan/pakaian)",
    "Melakukan Perlawatan Pemeliharaan (Mendoakan yang sakit, Anggota S.S. yang sudah lama tidak hadir)",
    "Memberikan / Membagikan Risalah / Buku Rohani",
    "Terlibat Kegiatan Kelompok Kecil",
    "Mengikuti / Terlibat Program Berdoa (777 / 1752 dll)"
  ];
  
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, 2).setValues([['No', 'Keterangan Kegiatan']]).setBackground("#D4AF37").setFontColor("#000000").setFontWeight("bold");
    const initRows = kList.map((k, i) => [i + 1, k]);
    sheet.getRange(2, 1, initRows.length, 2).setValues(initRows);
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(2);
    sheet.setColumnWidth(2, 300);
  }

  const dateStr = data.tanggal;
  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  let colIdx = headers.indexOf(dateStr) + 1;
  
  if (colIdx === 0) {
    colIdx = sheet.getLastColumn() + 1;
    sheet.getRange(1, colIdx).setValue(dateStr).setBackground("#D4AF37").setFontColor("#000000").setFontWeight("bold").setHorizontalAlignment("center");
  }

  const values = data.poin.map(p => [p]);
  sheet.getRange(2, colIdx, values.length, 1).setValues(values);
  return { status: 'success' };
}

// ==============================================================
// STATISTIK DASHBOARD (Membaca Semua & Memisah per Unit)
// ==============================================================
function getAttendanceStats(ss) {
  let historyMap = { 'ALL': {} }; 
  
  // Ambil Map Nama -> Unit dari data Member
  const mSheet = ss.getSheetByName('Members');
  const memberUnitMap = {};
  if (mSheet && mSheet.getLastRow() > 1) {
    const mData = mSheet.getDataRange().getValues();
    for (let i = 1; i < mData.length; i++) {
      memberUnitMap[mData[i][1]] = mData[i][4] || 'Umum'; // Map By Nama
    }
  }

  // Tarik data Khotbah
  const sheets = ss.getSheets().filter(s => s.getName().startsWith('Khotbah_') || s.getName() === 'Absensi_Khotbah');

  sheets.forEach(sheet => {
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    
    if (lastCol >= 3 && lastRow > 1) {
      const dates = sheet.getRange(1, 3, 1, lastCol - 2).getValues()[0];
      const data = sheet.getRange(2, 3, lastRow - 1, lastCol - 2).getValues();
      const names = sheet.getRange(2, 2, lastRow - 1, 1).getValues().map(r => r[0]);

      for (let c = 0; c < dates.length; c++) {
        const dateStr = dates[c];
        if (!dateStr) continue;
        
        if (!historyMap['ALL'][dateStr]) historyMap['ALL'][dateStr] = 0;
        
        for (let r = 0; r < data.length; r++) {
          let count = 0;
          let unitName = 'Umum';

          if (names[r] === "TAMU" || names[r] === "Tamu") {
            count = parseInt(data[r][c]) || 0;
            unitName = 'Tamu'; // Tamu tetap dihitung secara global, opsional dipisah di UI
          } else if (data[r][c] === "Hadir") {
            count = 1;
            unitName = memberUnitMap[names[r]] || 'Umum';
          }
          
          if (count > 0) {
            historyMap['ALL'][dateStr] += count; // Tambah ke Global
            
            // Tambah ke Unit spesifik
            if (!historyMap[unitName]) historyMap[unitName] = {};
            if (!historyMap[unitName][dateStr]) historyMap[unitName][dateStr] = 0;
            historyMap[unitName][dateStr] += count;
          }
        }
      }
    }
  });

  const result = {};
  for (const unit in historyMap) {
    let sortedDates = Object.keys(historyMap[unit]).sort((a, b) => {
      const [d1, m1, y1] = a.split('/');
      const [d2, m2, y2] = b.split('/');
      return new Date(y1, m1-1, d1) - new Date(y2, m2-1, d2);
    });
    const recentDates = sortedDates.slice(-12);
    result[unit] = recentDates.map(d => ({ date: d, count: historyMap[unit][d] }));
  }

  if (!result['ALL']) result['ALL'] = [];

  return { historyByUnit: result, history: result['ALL'] };
}

// ==============================================================
// FUNGSI PERMOHONAN DOA
// ==============================================================
function submitDoa(data) {
  const ss = getDb();
  let sheet = ss.getSheetByName('Permohonan_Doa');
  if (!sheet) {
    sheet = ss.insertSheet('Permohonan_Doa');
    sheet.getRange(1, 1, 1, 4).setValues([['Waktu', 'Nama', 'No Telepon', 'Poin Doa']]).setBackground("#3B82F6").setFontColor("white").setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(4, 400);
  }
  
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
  const poinString = data.poin.map((p, i) => `${i + 1}. ${p}`).join('\n');
  
  sheet.appendRow([timestamp, data.nama, data.telp, poinString]);
  return { status: 'success' };
}

// ==============================================================
// CRUD DATA MASTER (Admin, Unit, Member, Jabatan)
// ==============================================================
function createAdminSheet(ss) {
  const sheet = ss.insertSheet('Admins');
  sheet.getRange(1, 1, 1, 2).setValues([['Username', 'PIN Akses']]).setBackground("#D4AF37").setFontWeight("bold");
  sheet.appendRow(['Master Admin', DEFAULT_MASTER_PIN]);
  return sheet;
}
function addAdmin(data) {
  const sheet = getDb().getSheetByName('Admins');
  sheet.appendRow([data.username, data.pin]);
  return { status: 'success' };
}
function updateAdmin(data) {
  const aSheet = getDb().getSheetByName('Admins');
  const aValues = aSheet.getRange(2, 1, aSheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < aValues.length; i++) {
    if (aValues[i][0] === data.oldUsername) { 
      aSheet.getRange(i + 2, 1, 1, 2).setValues([[data.newUsername, data.pin]]); 
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}
function deleteAdmin(username) {
  const aSheet = getDb().getSheetByName('Admins');
  if (aSheet.getLastRow() <= 2) return { status: 'error', message: 'Tidak bisa menghapus satu-satunya Admin!' };
  const aValues = aSheet.getRange(2, 1, aSheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < aValues.length; i++) {
    if (aValues[i][0] === username) { aSheet.deleteRow(i + 2); return { status: 'success' }; }
  }
  return { status: 'error' };
}

function changePin(data) {
  const ss = getDb();
  if (data.role === 'unit') {
    const sheet = ss.getSheetByName('Units');
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === data.identifier) {
        if (values[i][1].toString().trim() !== data.oldPin.trim()) return { status: 'error', message: 'PIN LAMA SALAH!' };
        sheet.getRange(i + 2, 2).setValue(data.newPin);
        return { status: 'success' };
      }
    }
  } else if (data.role === 'admin') {
    const sheet = ss.getSheetByName('Admins');
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === data.identifier) {
        if (values[i][1].toString().trim() !== data.oldPin.trim()) return { status: 'error', message: 'PIN LAMA SALAH!' };
        sheet.getRange(i + 2, 2).setValue(data.newPin);
        return { status: 'success' };
      }
    }
  }
  return { status: 'error' };
}

function addMember(data) {
  const sheet = getDb().getSheetByName('Members');
  const id = "M-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  sheet.appendRow([id, data.nama, data.status, data.kelasTetap, data.unit || 'Umum', data.jabatan || 'Anggota', data.tanggalLahir || '']);
  return { status: 'success', id };
}
function updateMember(data) {
  const sheet = getDb().getSheetByName('Members');
  const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] == data.id) {
      sheet.getRange(i + 1, 2, 1, 6).setValues([[data.nama, data.status, data.kelasTetap, data.unit, data.jabatan || 'Anggota', data.tanggalLahir || '']]);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}
function deleteMember(id) {
  const sheet = getDb().getSheetByName('Members');
  const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] == id) { sheet.deleteRow(i + 1); return { status: 'success' }; }
  }
  return { status: 'error' };
}

function addUnit(data) {
  const sheet = getDb().getSheetByName('Units');
  const pin = data.pin || Math.floor(1000 + Math.random() * 9000).toString();
  sheet.appendRow([data.name, pin]);
  return { status: 'success' };
}
function updateUnit(data) {
  const ss = getDb();
  const uSheet = ss.getSheetByName('Units');
  const uValues = uSheet.getRange(2, 1, uSheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < uValues.length; i++) {
    if (uValues[i][0] === data.oldName) { uSheet.getRange(i + 2, 1, 1, 2).setValues([[data.newName, data.pin]]); break; }
  }
  const mSheet = ss.getSheetByName('Members');
  if(mSheet.getLastRow() > 1) {
    const mValues = mSheet.getRange(2, 5, mSheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < mValues.length; i++) {
      if (mValues[i][0] === data.oldName) { mSheet.getRange(i + 2, 5).setValue(data.newName); }
    }
  }
  return { status: 'success' };
}
function deleteUnit(unitName) {
  const ss = getDb();
  const uSheet = ss.getSheetByName('Units');
  const uValues = uSheet.getRange(2, 1, uSheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < uValues.length; i++) {
    if (uValues[i][0] === unitName) { uSheet.deleteRow(i + 2); break; }
  }
  const mSheet = ss.getSheetByName('Members');
  if(mSheet.getLastRow() > 1) {
    const mValues = mSheet.getRange(2, 5, mSheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < mValues.length; i++) {
      if (mValues[i][0] === unitName) { mSheet.getRange(i + 2, 5).setValue('Umum'); }
    }
  }
  return { status: 'success' };
}

function addRole(roleName) {
  const sheet = getDb().getSheetByName('Jabatan');
  sheet.appendRow([roleName]);
  return { status: 'success' };
}
function updateRole(data) {
  const ss = getDb();
  const rSheet = ss.getSheetByName('Jabatan');
  const rValues = rSheet.getRange(2, 1, rSheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < rValues.length; i++) {
    if (rValues[i][0] === data.oldName) { rSheet.getRange(i + 2, 1).setValue(data.newName); break; }
  }
  const mSheet = ss.getSheetByName('Members');
  if(mSheet.getLastRow() > 1) {
    const mValues = mSheet.getRange(2, 6, mSheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < mValues.length; i++) {
      if (mValues[i][0]) {
        let rolesArr = mValues[i][0].toString().split(',').map(s => s.trim());
        let updated = false;
        for(let j = 0; j < rolesArr.length; j++) {
          if(rolesArr[j] === data.oldName) { rolesArr[j] = data.newName; updated = true; }
        }
        if(updated) mSheet.getRange(i + 2, 6).setValue(rolesArr.join(', '));
      }
    }
  }
  return { status: 'success' };
}
function deleteRole(roleName) {
  const ss = getDb();
  const rSheet = ss.getSheetByName('Jabatan');
  if (rSheet.getLastRow() > 1) {
    const rValues = rSheet.getRange(2, 1, rSheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < rValues.length; i++) {
      if (rValues[i][0] === roleName) { rSheet.deleteRow(i + 2); break; }
    }
  }
  const mSheet = ss.getSheetByName('Members');
  if(mSheet.getLastRow() > 1) {
    const mValues = mSheet.getRange(2, 6, mSheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < mValues.length; i++) {
      if (mValues[i][0]) {
        let rolesArr = mValues[i][0].toString().split(',').map(s => s.trim());
        let newArr = rolesArr.filter(r => r !== roleName);
        if (newArr.length !== rolesArr.length) {
          mSheet.getRange(i + 2, 6).setValue(newArr.length > 0 ? newArr.join(', ') : 'Anggota');
        }
      }
    }
  }
  return { status: 'success' };
}

// ==============================================================
// HELPER: PEMBUATAN SHEET & PENATAAN BARIS
// ==============================================================
function findMemberRow(sheet, id) {
  if (sheet.getLastRow() < 3) return -1;
  const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let i = 0; i < ids.length; i++) { if (ids[i][0] == id) return i + 1; }
  return -1;
}

function findTamuRow(sheet) {
  if (sheet.getLastRow() < 2) return -1;
  const names = sheet.getRange(1, 2, sheet.getLastRow(), 1).getValues();
  for (let i = 0; i < names.length; i++) { if (names[i][0] === "Tamu" || names[i][0] === "TAMU") return i + 1; }
  return -1;
}

function createMainSheet(ss) {
  const sheet = ss.insertSheet('Members');
  sheet.getRange(1, 1, 1, 7).setValues([['ID', 'Nama', 'Status', 'Kategori', 'Unit', 'Jabatan', 'Tanggal Lahir']]).setBackground("#D4AF37").setFontWeight("bold");
  sheet.setFrozenRows(1);
  return sheet;
}

function createUnitSheet(ss, memberSheet) {
  const sheet = ss.insertSheet('Units');
  sheet.getRange(1, 1, 1, 2).setValues([['Nama Unit', 'PIN Akses']]).setBackground("#D4AF37").setFontWeight("bold");
  if(memberSheet && memberSheet.getLastRow() > 1) {
    const unitsData = memberSheet.getRange(2, 5, memberSheet.getLastRow() - 1, 1).getValues();
    const uniqueUnits = [...new Set(unitsData.map(r => r[0]).filter(u => u && u !== 'Umum'))];
    if(uniqueUnits.length > 0) {
      const rows = uniqueUnits.map(u => [u, Math.floor(1000 + Math.random() * 9000).toString()]);
      sheet.getRange(2, 1, rows.length, 2).setValues(rows);
    }
  }
  return sheet;
}

function createRoleSheet(ss) {
  const sheet = ss.insertSheet('Jabatan');
  sheet.getRange(1, 1).setValue('Nama Jabatan').setBackground("#D4AF37").setFontWeight("bold");
  const defaultRoles = [['Anggota'], ['Guru'], ['Pemimpin'], ['Kordinator']];
  sheet.getRange(2, 1, defaultRoles.length, 1).setValues(defaultRoles);
  return sheet;
}

function createMatrixSheet(ss, name) {
  const sheet = ss.insertSheet(name);
  sheet.getRange(1, 1, 1, 2).setValues([['MemberID', 'Nama']]).setBackground("#D4AF37").setFontWeight("bold");
  sheet.getRange(2, 1, 1, 2).setValues([['TAMU', 'Tamu']]).setFontWeight("bold").setBackground("#f3f4f6").setFontColor("#000000");
  sheet.setFrozenRows(2); 
  sheet.setFrozenColumns(2);
  return sheet;
}


// --- TAMBAHKAN 3 FUNGSI INI DI BARIS PALING BAWAH FILE CODE.GS ANDA ---

function submitAbsensi(data) {
  const db = getDb();
  let sheet = db.getSheetByName('Absensi');
  // Jika sheet belum ada, otomatis buatkan
  if (!sheet) {
    sheet = db.insertSheet('Absensi');
    sheet.appendRow(['Timestamp', 'Tanggal', 'Kategori', 'Unit', 'Tamu', 'Total Hadir', 'Total Alpha', 'Data Mentah']);
    sheet.getRange(1, 1, 1, 8).setBackground("#D4AF37").setFontWeight("bold");
  }
  
  let hadirCount = 0;
  let alphaCount = 0;
  
  // Hitung jumlah kehadiran
  for (let id in data.attendance) {
    if (data.attendance[id] === 'Hadir') hadirCount++;
    else if (data.attendance[id] === 'Alpha') alphaCount++;
  }
  
  // Simpan baris data ke spreadsheet
  sheet.appendRow([
    new Date(),
    data.tanggal,
    data.type,
    data.unit,
    data.tamu,
    hadirCount,
    alphaCount,
    JSON.stringify(data.attendance)
  ]);
  
  return { status: 'success', message: 'Absensi berhasil disimpan!' };
}

function submitKegiatan(data) {
  const db = getDb();
  let sheet = db.getSheetByName('Kegiatan');
  if (!sheet) {
    sheet = db.insertSheet('Kegiatan');
    sheet.appendRow(['Timestamp', 'Tanggal', 'Unit', 'Poin 1', 'Poin 2', 'Poin 3', 'Poin 4', 'Poin 5', 'Poin 6', 'Poin 7', 'Poin 8', 'Poin 9', 'Poin 10']);
    sheet.getRange(1, 1, 1, 13).setBackground("#10B981").setFontWeight("bold");
  }
  
  let row = [new Date(), data.tanggal, data.unit];
  row = row.concat(data.laporan); // Gabungkan array laporan
  
  sheet.appendRow(row);
  return { status: 'success', message: 'Laporan Kegiatan berhasil disimpan!' };
}

function submitDoa(data) {
  const db = getDb();
  let sheet = db.getSheetByName('Permohonan Doa');
  if (!sheet) {
    sheet = db.insertSheet('Permohonan Doa');
    sheet.appendRow(['Timestamp', 'Nama Lengkap', 'No Telp', 'Poin Doa', 'Status']);
    sheet.getRange(1, 1, 1, 5).setBackground("#3B82F6").setFontWeight("bold");
  }
  
  sheet.appendRow([
    new Date(),
    data.nama,
    data.telp,
    data.poin.join(' | '),
    'Menunggu'
  ]);
  return { status: 'success', message: 'Permohonan Doa berhasil dikirim!' };
}