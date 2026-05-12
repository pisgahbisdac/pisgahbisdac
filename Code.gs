/**
 * KONFIGURASI BACKEND PISGAH BISDAC v4.4 (Admin Control Panel & Doa)
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
      case 'updateRole': result = updateRole(data); break;
      case 'deleteRole': result = deleteRole(data); break;
      case 'addAdmin': result = addAdmin(data); break;
      case 'updateAdmin': result = updateAdmin(data); break;
      case 'deleteAdmin': result = deleteAdmin(data); break;
      case 'changePin': result = changePin(data); break;
      case 'submitAttendance': result = submitAttendance(data); break;
      case 'submitDoa': result = submitDoa(data); break; // Endpoint baru untuk Permohonan Doa
      default: result = { status: 'error', message: 'Aksi tidak dikenal' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getInitialData() {
  const ss = getDb();
  const sheet = ss.getSheetByName('Members') || createMainSheet(ss);
  const unitSheet = ss.getSheetByName('Units') || createUnitSheet(ss, sheet);
  const roleSheet = ss.getSheetByName('Jabatan') || createRoleSheet(ss);
  const adminSheet = ss.getSheetByName('Admins') || createAdminSheet(ss);
  
  const values = sheet.getDataRange().getValues();
  const members = values.length > 1 ? values.slice(1).map(r => ({ 
    id: r[0], nama: r[1], status: r[2], kelasTetap: r[3], unit: r[4] || 'Umum', jabatan: r[5] || 'Anggota'
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
      return { name: r[0], pin: pin.toString() };
    });
  }

  const roleValues = roleSheet.getDataRange().getValues();
  const roles = roleValues.length > 1 ? roleValues.slice(1).map(r => r[0]) : [];

  const adminValues = adminSheet.getDataRange().getValues();
  let admins = [];
  if (adminValues.length > 1) {
    admins = adminValues.slice(1).map(r => ({ username: r[0], pin: r[1].toString() }));
  }

  const stats = getAttendanceStats(ss);

  return { status: 'success', members, units, roles, admins, stats };
}

// --- FUNGSI PERMOHONAN DOA ---
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

// --- FUNGSI PENGELOLAAN DATA MASTER ADMIN ---
function createAdminSheet(ss) {
  const sheet = ss.insertSheet('Admins');
  sheet.getRange(1, 1, 1, 2).setValues([['Username', 'PIN Akses']]).setBackground("#D4AF37").setFontWeight("bold");
  sheet.appendRow(['Master Admin', DEFAULT_MASTER_PIN]);
  return sheet;
}

function addAdmin(data) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Admins');
  sheet.appendRow([data.username, data.pin]);
  return { status: 'success' };
}

function updateAdmin(data) {
  const ss = getDb();
  const aSheet = ss.getSheetByName('Admins');
  const aValues = aSheet.getRange(2, 1, aSheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < aValues.length; i++) {
    if (aValues[i][0] === data.oldUsername) { 
      aSheet.getRange(i + 2, 1, 1, 2).setValues([[data.newUsername, data.pin]]); 
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'Admin tidak ditemukan' };
}

function deleteAdmin(username) {
  const ss = getDb();
  const aSheet = ss.getSheetByName('Admins');
  if (aSheet.getLastRow() <= 2) {
    return { status: 'error', message: 'Tidak bisa menghapus satu-satunya Admin!' };
  }
  const aValues = aSheet.getRange(2, 1, aSheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < aValues.length; i++) {
    if (aValues[i][0] === username) { 
      aSheet.deleteRow(i + 2); 
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'Admin tidak ditemukan' };
}

// --- FUNGSI GANTI PIN USER & ADMIN ---
function changePin(data) {
  const ss = getDb();
  if (data.role === 'unit') {
    const sheet = ss.getSheetByName('Units');
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === data.identifier) {
        if (values[i][1].toString() !== data.oldPin) return { status: 'error', message: 'PIN LAMA SALAH!' };
        sheet.getRange(i + 2, 2).setValue(data.newPin);
        return { status: 'success' };
      }
    }
  } else if (data.role === 'admin') {
    const sheet = ss.getSheetByName('Admins');
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === data.identifier) {
        if (values[i][1].toString() !== data.oldPin) return { status: 'error', message: 'PIN LAMA SALAH!' };
        sheet.getRange(i + 2, 2).setValue(data.newPin);
        return { status: 'success' };
      }
    }
  }
  return { status: 'error', message: 'Pengguna tidak ditemukan' };
}

// --- FUNGSI PENGELOLAAN MEMBER ---
function addMember(data) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Members');
  const id = "M-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  sheet.appendRow([id, data.nama, data.status, data.kelasTetap, data.unit || 'Umum', data.jabatan || 'Anggota']);
  return { status: 'success', id };
}

function updateMember(data) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Members');
  const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] == data.id) {
      sheet.getRange(i + 1, 2, 1, 5).setValues([[data.nama, data.status, data.kelasTetap, data.unit, data.jabatan || 'Anggota']]);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'Member tidak ditemukan' };
}

function deleteMember(id) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Members');
  const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] == id) { sheet.deleteRow(i + 1); return { status: 'success' }; }
  }
  return { status: 'error' };
}

// --- FUNGSI PENGELOLAAN UNIT ---
function addUnit(data) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Units');
  const pin = data.pin || Math.floor(1000 + Math.random() * 9000).toString();
  sheet.appendRow([data.name, pin]);
  return { status: 'success' };
}

function updateUnit(data) {
  const ss = getDb();
  const uSheet = ss.getSheetByName('Units');
  const uValues = uSheet.getRange(2, 1, uSheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < uValues.length; i++) {
    if (uValues[i][0] === data.oldName) { 
      uSheet.getRange(i + 2, 1, 1, 2).setValues([[data.newName, data.pin]]); 
      break; 
    }
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

// --- FUNGSI PENGELOLAAN JABATAN ---
function addRole(roleName) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Jabatan');
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

// --- FUNGSI ABSENSI ---
function submitAttendance(data) {

  const ss = getDb();
  let sheetName = "";

  // ========================================
  // KHOTBAH
  // ========================================

  if (data.type === 'khotbah') {

    sheetName = "Absensi_Khotbah";
  }

  // ========================================
  // SEKOLAH SABAT
  // ========================================

  else if (data.type === 'sekolah_sabat') {

    // SS DEWASA
    if (data.category === 'ss_dewasa') {

      sheetName = "Absensi_SS_Dewasa";
    }

    // SS ANAK
    else if (data.category === 'ss_anak') {

      sheetName = "Absensi_SS_Anak";
    }

    // PENDALAMAN
    else if (data.category === 'pendalaman') {

      sheetName = "Absensi_Pendalaman";
    }

    // DEFAULT
    else {

      sheetName = "Absensi_Lainnya";
    }
  }

  // ========================================
  // KEGIATAN
  // ========================================

  else if (data.type === 'kegiatan') {

    return submitMatrixKegiatan(ss, data);
  }

  // ========================================
  // AMBIL / BUAT SHEET
  // ========================================

  const sheet =
    ss.getSheetByName(sheetName)
    || createMatrixSheet(ss, sheetName);

  const dateStr =
    data.tanggal ||
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'dd/MM/yyyy'
    );

  const headers =
    sheet.getRange(
      1,
      1,
      1,
      Math.max(sheet.getLastColumn(), 1)
    ).getValues()[0];

  let colIdx =
    headers.indexOf(dateStr) + 1;

  // ========================================
  // BUAT KOLOM TANGGAL
  // ========================================

  if (colIdx === 0) {

    colIdx = sheet.getLastColumn() + 1;

    sheet.getRange(1, colIdx)
      .setValue(dateStr)
      .setBackground("#D4AF37")
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
  }

  // ========================================
  // SIMPAN ABSENSI
  // ========================================

  data.records.forEach(rec => {

    let rowIdx =
      findMemberRow(sheet, rec.memberId);

    if (rowIdx === -1) {

      rowIdx = sheet.getLastRow() + 1;

      sheet.getRange(
        rowIdx,
        1,
        1,
        2
      ).setValues([
        [
          rec.memberId,
          rec.nama
        ]
      ]);
    }

    const bgStatus =
      rec.status === 'Hadir'
      ? '#e6f4ea'
      : '#fce8e6';

    const fontColor =
      rec.status === 'Hadir'
      ? '#137333'
      : '#c5221f';

    sheet.getRange(
      rowIdx,
      colIdx
    )
    .setValue(rec.status)
    .setHorizontalAlignment("center")
    .setBackground(bgStatus)
    .setFontColor(fontColor);
  });

  // ========================================
  // SIMPAN TAMU
  // ========================================

  if (data.tamu > 0) {

    let tamuRowIdx =
      findTamuRow(sheet);

    if (tamuRowIdx === -1) {

      tamuRowIdx =
        sheet.getLastRow() + 1;

      sheet.getRange(
        tamuRowIdx,
        2
      )
      .setValue("Tamu")
      .setFontWeight("bold");
    }

    sheet.getRange(
      tamuRowIdx,
      colIdx
    )
    .setValue(data.tamu)
    .setHorizontalAlignment("center");
  }

  return {
    status: 'success'
  };
}

function submitMatrixKegiatan(ss, data) {
  const sheetName = "Rekap_Kegiatan_Triwulan";
  const kList = ["Datang tepat waktu", "Baca Alkitab", "Renungan Pagi", "Belajar SS", "Rabu Malam", "Jangkauan Keluar", "Perlawatan", "Doa", "Kelompok Kecil", "Bagi Risalah"];
  const sheet = ss.getSheetByName(sheetName) || createMatrixSheet(ss, sheetName);
  
  if (sheet.getLastRow() <= 1) {
    const initRows = kList.map((k, i) => [i + 1, k]);
    sheet.getRange(2, 1, initRows.length, 2).setValues(initRows);
  }

  const dateStr = data.tanggal;
  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  let colIdx = headers.indexOf(dateStr) + 1;
  
  if (colIdx === 0) {
    colIdx = sheet.getLastColumn() + 1;
    sheet.getRange(1, colIdx).setValue(dateStr).setBackground("#D4AF37").setFontWeight("bold").setHorizontalAlignment("center");
  }

  const values = data.poin.map(p => [p]);
  sheet.getRange(2, colIdx, values.length, 1).setValues(values);
  return { status: 'success' };
}

function getAttendanceStats(ss) {
  const sheet = ss.getSheetByName('Absensi_Khotbah');
  let history = [];
  
  if (sheet) {
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    
    if (lastCol >= 3 && lastRow > 1) {
      const startCol = Math.max(3, lastCol - 11); 
      const numCols = lastCol - startCol + 1;
      
      const dates = sheet.getRange(1, startCol, 1, numCols).getValues()[0];
      const data = sheet.getRange(2, startCol, lastRow - 1, numCols).getValues();
      const names = sheet.getRange(2, 2, lastRow - 1, 1).getValues().map(r => r[0]);

      for (let c = 0; c < numCols; c++) {
        let count = 0;
        for (let r = 0; r < data.length; r++) {
          if (names[r] === "Tamu") {
            count += parseInt(data[r][c]) || 0;
          } else if (data[r][c] === "Hadir") {
            count++;
          }
        }
        history.push({ date: dates[c], count: count });
      }
    }
  }
  return { history };
}

// --- HELPER FUNCTIONS ---
function findMemberRow(sheet, id) {
  if (sheet.getLastRow() < 2) return -1;
  const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let i = 0; i < ids.length; i++) { if (ids[i][0] == id) return i + 1; }
  return -1;
}

function findTamuRow(sheet) {
  if (sheet.getLastRow() < 2) return -1;
  const names = sheet.getRange(1, 2, sheet.getLastRow(), 1).getValues();
  for (let i = 0; i < names.length; i++) { if (names[i][0] === "Tamu") return i + 1; }
  return -1;
}

function createMainSheet(ss) {
  const sheet = ss.insertSheet('Members');
  sheet.getRange(1, 1, 1, 6).setValues([['ID', 'Nama', 'Status', 'Kategori', 'Unit', 'Jabatan']]).setBackground("#D4AF37").setFontWeight("bold");
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
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);
  return sheet;
}