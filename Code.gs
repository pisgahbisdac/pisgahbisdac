/**
 * KONFIGURASI BACKEND PISGAH BISDAC - MATRIX EDITION
 * Spreadsheet ID: 1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc
 */

const SPREADSHEET_ID = '1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc'; 

function getDb() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== 'ID_SPREADSHEET_ANDA') {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
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
      case 'submitAttendance': result = submitAttendance(data); break;
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
  const values = sheet.getDataRange().getValues();
  
  const members = values.length > 1 ? values.slice(1).map(r => ({ 
    id: r[0], 
    nama: r[1], 
    status: r[2],
    kelasTetap: r[3] || 'Tidak Ada' 
  })) : [];
  return { status: 'success', members };
}

function submitAttendance(data) {
  const ss = getDb();
  let sheetName = "";
  
  if (data.type === 'khotbah') sheetName = "Absensi_Khotbah";
  else if (data.type === 'sekolah_sabat' || data.type === 'ss_dewasa' || data.type === 'ss_anak') sheetName = "Absensi_" + (data.category || "SS").replace(/\s+/g, "_");
  else if (data.type === 'pa') sheetName = "Absensi_PA";
  else if (data.type === 'kegiatan') return submitMatrixKegiatan(ss, data);
  
  const sheet = ss.getSheetByName(sheetName) || createMatrixSheet(ss, sheetName);
  
  const dateStr = data.tanggal; 
  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 2)).getValues()[0];
  let colIdx = headers.indexOf(dateStr) + 1;
  
  // Jika tanggal belum ada, buat kolom baru di paling kanan
  if (colIdx === 0) {
    colIdx = sheet.getLastColumn() + 1;
    sheet.getRange(1, colIdx).setValue(dateStr).setBackground("#D4AF37").setFontWeight("bold").setHorizontalAlignment("center");
  }

  data.records.forEach(rec => {
    if (rec.status === 'Hadir') {
      let rowIdx = findMemberRow(sheet, rec.memberId);
      if (rowIdx === -1) {
        rowIdx = sheet.getLastRow() + 1;
        sheet.getRange(rowIdx, 1, 1, 2).setValues([[rec.memberId, rec.nama]]);
      }
      // Hanya menulis "Hadir", tanpa jabatan (sesuai instruksi)
      sheet.getRange(rowIdx, colIdx).setValue("Hadir").setHorizontalAlignment("center");
    }
  });

  // Simpan baris Tamu di bawah
  if (data.tamu !== undefined && data.tamu > 0) {
    let tamuRowIdx = findTamuRow(sheet);
    if (tamuRowIdx === -1) {
      tamuRowIdx = sheet.getLastRow() + 1;
      sheet.getRange(tamuRowIdx, 2).setValue("Tamu").setFontWeight("bold");
    }
    sheet.getRange(tamuRowIdx, colIdx).setValue(data.tamu).setHorizontalAlignment("center");
  }

  return { status: 'success' };
}

function submitMatrixKegiatan(ss, data) {
  const sheetName = "Rekap_Kegiatan_Triwulan";
  const kegiatanList = [
    "Anggota datang tepat waktu di SS",
    "Anggota membaca Alkitab setiap hari",
    "Anggota Renungan Pagi setiap hari",
    "Anggota Belajar SS setiap hari",
    "Anggota hadir di Kebaktian Rabu Malam",
    "Anggota melakukan Jangkauan Keluar",
    "Anggota melakukan Perlawatan Pemeliharaan",
    "Anggota melakukan Doa (777, 1752 & Subuh)",
    "Anggota terlibat Kelompok Kecil",
    "Anggota membagikan risalah/buku rohani"
  ];
  
  const sheet = ss.getSheetByName(sheetName) || createMatrixSheet(ss, sheetName, "No", "Deskripsi Kegiatan");
  if (sheet.getLastRow() <= 1) {
    const initRows = kegiatanList.map((k, i) => [i + 1, k]);
    sheet.getRange(2, 1, initRows.length, 2).setValues(initRows);
  }

  const dateStr = data.tanggal;
  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 2)).getValues()[0];
  let colIdx = headers.indexOf(dateStr) + 1;
  
  if (colIdx === 0) {
    colIdx = sheet.getLastColumn() + 1;
    sheet.getRange(1, colIdx).setValue(dateStr).setBackground("#D4AF37").setFontWeight("bold").setHorizontalAlignment("center");
  }

  const values = data.poin.map(p => [p]);
  sheet.getRange(2, colIdx, values.length, 1).setValues(values).setHorizontalAlignment("center");
  return { status: 'success' };
}

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
  sheet.getRange(1, 1, 1, 4).setValues([['ID', 'Nama', 'Status', 'KelasTetap']]).setBackground("#D4AF37").setFontWeight("bold");
  sheet.setFrozenRows(1);
  return sheet;
}

function createMatrixSheet(ss, name, h1 = "MemberID", h2 = "Nama") {
  const sheet = ss.insertSheet(name);
  sheet.getRange(1, 1, 1, 2).setValues([[h1, h2]]).setBackground("#D4AF37").setFontWeight("bold");
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2); // Mengunci Kolom ID dan Nama
  return sheet;
}

function addMember(data) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Members') || createMainSheet(ss);
  const id = "M-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  sheet.appendRow([id, data.nama, data.status, data.kelasTetap || 'Tidak Ada']);
  return { status: 'success', id };
}