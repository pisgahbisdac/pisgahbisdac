/**
 * BACKEND GOOGLE APPS SCRIPT (GAS)
 * Sistem Informasi Pembangunan & Donasi
 * Update: Thumbnail API (=w1000) & Auto-Permission
 */

// ==========================================
// KONFIGURASI ID (SESUAIKAN DENGAN MILIK ANDA)
// ==========================================
const SPREADSHEET_ID = '1Z34p14RRS4NCSlD66NOz4l5QTmnKvckUl5-vKFbPyFQ'; 
const FOLDER_ID = '1XuGZzprXsY63lTeXv_M4JuRw3WUGRKnn';

// ==========================================
// 1. ROUTING UTAMA (GET & POST)
// ==========================================
function doGet(e) {
  try {
    const data = getInitialData();
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    let result = {};

    switch(req.action) {
      // Autentikasi & Info Website
      case 'verifyAdmin': result = verifyAdmin(req.username, req.password); break;
      case 'updateInfoWebsite': result = { success: updateInfoWebsite(req.target, req.terkumpul, req.bank, req.norek, req.atasnama, req.judul) }; break;
      
      // Sistem Konfirmasi Donasi
      case 'submitKonfirmasi': result = submitKonfirmasi(req.payload); break;
      case 'getKonfirmasi': result = { success: true, data: getKonfirmasiData() }; break;
      case 'confirmDonasi': result = confirmDonasi(req.rowIdx, req.jumlah); break;

      // Fitur Tambah Data
      case 'tambahPortofolio': result = tambahPortofolio(req.title, req.desc, req.imageData); break;
      case 'tambahArtikel': result = tambahArtikel(req.title, req.content); break;
      case 'tambahPanitia': result = tambahPanitia(req.nama, req.jabatan, req.imageData); break;

      // Fitur Edit Data
      case 'editPortofolio': result = editPortofolio(req.id, req.title, req.desc, req.imageData, req.existingImage); break;
      case 'editArtikel': result = editArtikel(req.id, req.title, req.content); break;
      case 'editPanitia': result = editPanitia(req.id, req.nama, req.jabatan, req.imageData, req.existingImage); break;

      // Fitur Hapus Data
      case 'hapusPortofolio': result = { success: hapusData('Portfolio', req.id) }; break;
      case 'hapusArtikel': result = { success: hapusData('Artikel', req.id) }; break;
      case 'hapusPanitia': result = { success: hapusData('Panitia', req.id) }; break;

      default: result = { success: false, error: "Action tidak dikenal" };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message, stack: err.stack }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// 2. FUNGSI PENYELAMAT URL GAMBAR (Auto-Format ke =w1000)
// ==========================================
function formatDriveUrl(url) {
  if (!url || typeof url !== 'string') return "";
  // Jika URL bukan dari Google Drive (misal link Unsplash/placeholder), biarkan saja
  if (!url.includes("drive.google.com") && !url.includes("googleusercontent.com")) return url;
  
  // Ekstrak ID File Google Drive (biasanya 33 karakter)
  const match = url.match(/[-\w]{25,}/);
  if (match) {
    return "https://drive.google.com/thumbnail?id=" + match[0] + "&sz=w1000";
  }
  return url;
}

// ==========================================
// 3. FUNGSI PENGAMBILAN DATA (READ)
// ==========================================
function getInitialData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const infoSheet = ss.getSheetByName('Info');
  
  const info = {
    judul: infoSheet.getRange('B1').getValue() || '',
    target: infoSheet.getRange('B2').getValue() || 0,
    terkumpul: infoSheet.getRange('B3').getValue() || 0,
    bank: infoSheet.getRange('B4').getValue() || '',
    norek: infoSheet.getRange('B5').getValue() || '',
    atasnama: infoSheet.getRange('B6').getValue() || ''
  };

  const getSheetData = (sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    const rows = sheet.getDataRange().getValues();
    const data = [];
    for (let i = 1; i < rows.length; i++) {
      if (sheetName === 'Portfolio') data.push({ id: rows[i][0], title: rows[i][1], desc: rows[i][2], image: formatDriveUrl(rows[i][3]) });
      if (sheetName === 'Artikel') data.push({ id: rows[i][0], title: rows[i][1], content: rows[i][2] });
      if (sheetName === 'Panitia') data.push({ id: rows[i][0], nama: rows[i][1], jabatan: rows[i][2], image: formatDriveUrl(rows[i][3]) });
    }
    return data;
  };

  return {
    ...info,
    portfolio: getSheetData('Portfolio'),
    artikel: getSheetData('Artikel'),
    panitia: getSheetData('Panitia')
  };
}

// ==========================================
// 4. FUNGSI UPLOAD GAMBAR KE GOOGLE DRIVE
// ==========================================
function uploadImageToDrive(fileObj) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const contentType = fileObj.mimeType;
    const bytes = Utilities.base64Decode(fileObj.base64);
    const blob = Utilities.newBlob(bytes, contentType, new Date().getTime() + '_' + fileObj.name);
    
    // Buat file
    const file = folder.createFile(blob);
    
    // Otomatis ubah permission file menjadi Publik (Viewer)
    // Ini mencegah error "Tanpa Bukti" meskipun folder belum di-share
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Kembalikan URL dalam bentuk thumbnail w1000 agar bisa tampil di tag <img>
    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
  } catch (f) {
    return "";
  }
}

// ==========================================
// 5. SISTEM KONFIRMASI & VALIDASI DONASI
// ==========================================
function submitKonfirmasi(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Konfirmasi');
  if(!sheet) return { success: false, error: "Sheet 'Konfirmasi' tidak ditemukan" };
  
  let buktiUrl = "";
  if (payload.bukti && payload.bukti.base64) {
    buktiUrl = uploadImageToDrive(payload.bukti);
  }
  
  sheet.appendRow([new Date(), payload.nama, payload.jumlah, payload.keterangan, buktiUrl, "Pending"]);
  return { success: true };
}

function getKonfirmasiData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Konfirmasi');
  if (!sheet) return [];
  
  const rows = sheet.getDataRange().getValues();
  let data = [];
  
  for (let i = 1; i < rows.length; i++) { 
    // Lewati baris kosong
    if (!rows[i][1] && !rows[i][2]) continue;
    
    data.push({
      rowIdx: i + 1,
      date: rows[i][0],
      nama: rows[i][1],
      jumlah: rows[i][2],
      ket: rows[i][3],
      bukti: formatDriveUrl(rows[i][4]), // Format ulang URL lama
      status: rows[i][5] || 'Pending'
    });
  }
  return data;
}

function confirmDonasi(rowIdx, jumlah) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const konfSheet = ss.getSheetByName('Konfirmasi');
  if (!konfSheet) return { success: false, error: 'Sheet Konfirmasi tidak ditemukan' };
  
  const currentStatus = konfSheet.getRange(rowIdx, 6).getValue();
  if (currentStatus === 'Confirmed') {
    return { success: false, error: 'Donasi ini sudah dikonfirmasi sebelumnya' };
  }
  
  konfSheet.getRange(rowIdx, 6).setValue('Confirmed');
  
  try {
    const infoSheet = ss.getSheetByName('Info');
    if (infoSheet) {
      let currentTerkumpul = infoSheet.getRange('B3').getValue();
      currentTerkumpul = Number(currentTerkumpul) || 0;
      let donasiBaru = Number(jumlah) || 0;
      
      infoSheet.getRange('B3').setValue(currentTerkumpul + donasiBaru);
    }
  } catch (e) {
    return { success: false, error: 'Gagal menambah saldo utama: ' + e.message };
  }
  
  return { success: true };
}

// ==========================================
// 6. PENGATURAN INFO UTAMA & ADMIN
// ==========================================
function verifyAdmin(username, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetInfo = ss.getSheetByName('Info');
  
  const validUser = sheetInfo.getRange('B7').getValue();
  const validPass = sheetInfo.getRange('B8').getValue();
  
  return (username == validUser && password == validPass) ? { success: true } : { success: false };
}

function updateInfoWebsite(target, terkumpul, bank, norek, atasnama, judul) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Info');
  
  sheet.getRange('B1').setValue(judul);
  sheet.getRange('B2').setValue(target);
  sheet.getRange('B3').setValue(terkumpul);
  sheet.getRange('B4').setValue(bank);
  sheet.getRange('B5').setValue(norek);
  sheet.getRange('B6').setValue(atasnama);
  
  return true;
}

// ==========================================
// 7. FUNGSI TAMBAH DATA (CREATE)
// ==========================================
function tambahPortofolio(title, desc, imageData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Portfolio');
  if(!sheet) return { success: false, error: "Sheet Portfolio tidak ditemukan" };
  
  let imageUrl = "";
  if (imageData && imageData.base64) imageUrl = uploadImageToDrive(imageData);
  
  const id = Utilities.getUuid();
  sheet.appendRow([id, title, desc, imageUrl]);
  return { success: true };
}

function tambahArtikel(title, content) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Artikel');
  if(!sheet) return { success: false, error: "Sheet Artikel tidak ditemukan" };
  
  const id = Utilities.getUuid();
  sheet.appendRow([id, title, content]);
  return { success: true };
}

function tambahPanitia(nama, jabatan, imageData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Panitia');
  if(!sheet) return { success: false, error: "Sheet Panitia tidak ditemukan" };
  
  let imageUrl = "";
  if (imageData && imageData.base64) imageUrl = uploadImageToDrive(imageData);
  
  const id = Utilities.getUuid();
  sheet.appendRow([id, nama, jabatan, imageUrl]);
  return { success: true };
}

// ==========================================
// 8. FUNGSI EDIT DATA (UPDATE)
// ==========================================
function editPortofolio(id, title, desc, imageData, existingImage) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Portfolio');
  const rows = sheet.getDataRange().getValues();
  
  let finalImage = existingImage;
  if (imageData && imageData.base64) finalImage = uploadImageToDrive(imageData);

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.getRange(i + 1, 2).setValue(title);
      sheet.getRange(i + 1, 3).setValue(desc);
      sheet.getRange(i + 1, 4).setValue(finalImage);
      return { success: true };
    }
  }
  return { success: false, error: "ID tidak ditemukan" };
}

function editArtikel(id, title, content) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Artikel');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.getRange(i + 1, 2).setValue(title);
      sheet.getRange(i + 1, 3).setValue(content);
      return { success: true };
    }
  }
  return { success: false, error: "ID tidak ditemukan" };
}

function editPanitia(id, nama, jabatan, imageData, existingImage) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Panitia');
  const rows = sheet.getDataRange().getValues();
  
  let finalImage = existingImage;
  if (imageData && imageData.base64) finalImage = uploadImageToDrive(imageData);

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.getRange(i + 1, 2).setValue(nama);
      sheet.getRange(i + 1, 3).setValue(jabatan);
      sheet.getRange(i + 1, 4).setValue(finalImage);
      return { success: true };
    }
  }
  return { success: false, error: "ID tidak ditemukan" };
}

// ==========================================
// 9. FUNGSI HAPUS DATA (DELETE)
// ==========================================
function hapusData(sheetName, id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;
  
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}