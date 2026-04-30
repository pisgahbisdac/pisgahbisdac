/**
 * BACKEND GOOGLE APPS SCRIPT (GAS)
 * Versi: 4.1 (Fix Image Link Drive & Admin State)
 */

const SPREADSHEET_ID = '1Z34p14RRS4NCSlD66NOz4l5QTmnKvckUl5-vKFbPyFQ'; 
const FOLDER_ID = '1XuGZzprXsY63lTeXv_M4JuRw3WUGRKnn'; // Pastikan Folder Drive ini memiliki izin akses "Siapa saja yang memiliki link dapat melihat"

function doGet(e) {
  try {
    const data = getInitialData();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    let result = {};

    switch(req.action) {
      case 'submitKonfirmasi': result = submitKonfirmasi(req.payload); break;
      case 'verifyAdmin': result = verifyAdmin(req.username, req.password); break;
      case 'updateInfoWebsite': result = { success: updateInfoWebsite(req.target, req.terkumpul, req.bank, req.norek, req.atasnama, req.judul) }; break;
      
      // Tambah Data dengan Upload Image
      case 'tambahArtikel': result = tambahArtikel(req.title, req.content); break;
      case 'tambahPortofolio': result = tambahPortofolio(req.title, req.imageData, req.desc); break;
      case 'tambahPanitia': result = tambahPanitia(req.nama, req.jabatan, req.imageData); break;
      
      // Edit Data dengan Dukungan Upload Image
      case 'editArtikel': result = editArtikel(req.id, req.title, req.content); break;
      case 'editPortofolio': result = editPortofolio(req.id, req.title, req.imageData, req.existingImage, req.desc); break;
      case 'editPanitia': result = editPanitia(req.id, req.nama, req.jabatan, req.imageData, req.existingImage); break;
      
      // Hapus Data
      case 'hapusArtikel': result = { success: hapusArtikel(req.id) }; break;
      case 'hapusPortofolio': result = { success: hapusPortofolio(req.id) }; break;
      case 'hapusPanitia': result = { success: hapusPanitia(req.id) }; break;
      
      default: result = { error: "Action tidak ditemukan" };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// FUNGSI HELPER: UPLOAD GAMBAR KE DRIVE
// ==========================================
function uploadImageToDrive(imageData) {
  if (!imageData || !imageData.base64) return "";
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const blob = Utilities.newBlob(Utilities.base64Decode(imageData.base64), imageData.mimeType, imageData.name);
    const file = folder.createFile(blob);
    
    // Memberikan izin akses publik agar gambar bisa dimunculkan di website html
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // PERBAIKAN: Menggunakan format thumbnail agar tidak terblokir oleh kebijakan cookie browser baru
    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
  } catch (e) {
    throw new Error("Gagal mengunggah gambar ke Drive: " + e.message);
  }
}

// ==========================================
// FUNGSI EKSEKUSI
// ==========================================

function getInitialData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const sheetInfo = ss.getSheetByName('Info');
  if (!sheetInfo) throw new Error("Sheet 'Info' tidak ditemukan!");
  
  const target = sheetInfo.getRange('B1').getValue();
  const terkumpul = sheetInfo.getRange('B2').getValue();
  const bank = sheetInfo.getRange('B3').getValue();
  const norek = sheetInfo.getRange('B4').getValue();
  const atasnama = sheetInfo.getRange('B5').getValue();
  const judul = sheetInfo.getRange('B6').getValue();
  
  const sheetArtikel = ss.getSheetByName('Artikel');
  let dataArtikel = [];
  if (sheetArtikel) {
      const rowsArt = sheetArtikel.getDataRange().getValues();
      for (let i = 1; i < rowsArt.length; i++) {
        if(rowsArt[i][0]) dataArtikel.push({ id: rowsArt[i][0], title: rowsArt[i][1], content: rowsArt[i][2] });
      }
  }

  const sheetPorto = ss.getSheetByName('Portfolio');
  let dataPorto = [];
  if (sheetPorto) {
      const rowsPorto = sheetPorto.getDataRange().getValues();
      for (let i = 1; i < rowsPorto.length; i++) {
        if(rowsPorto[i][0]) dataPorto.push({ id: rowsPorto[i][0], title: rowsPorto[i][1], image: rowsPorto[i][2], desc: rowsPorto[i][3] });
      }
  }

  const sheetPanitia = ss.getSheetByName('Panitia');
  let dataPanitia = [];
  if (sheetPanitia) {
      const rowsPanitia = sheetPanitia.getDataRange().getValues();
      for (let i = 1; i < rowsPanitia.length; i++) {
        if(rowsPanitia[i][0]) dataPanitia.push({ id: rowsPanitia[i][0], nama: rowsPanitia[i][1], jabatan: rowsPanitia[i][2], image: rowsPanitia[i][3] });
      }
  }

  return { target, terkumpul, bank, norek, atasnama, judul, artikel: dataArtikel, portfolio: dataPorto, panitia: dataPanitia };
}

function submitKonfirmasi(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Konfirmasi');
  if(!sheet) return { success: false, error: "Sheet 'Konfirmasi' tidak ditemukan" };
  sheet.appendRow([new Date(), payload.nama, payload.jumlah, payload.keterangan]);
  return { success: true };
}

function updateInfoWebsite(target, terkumpul, bank, norek, atasnama, judul) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Info');
  sheet.getRange('B1').setValue(target);
  sheet.getRange('B2').setValue(terkumpul);
  sheet.getRange('B3').setValue(bank);
  sheet.getRange('B4').setValue(norek);
  sheet.getRange('B5').setValue(atasnama);
  sheet.getRange('B6').setValue(judul);
  return true;
}

function verifyAdmin(username, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetInfo = ss.getSheetByName('Info');
  const validUser = sheetInfo.getRange('B7').getValue();
  const validPass = sheetInfo.getRange('B8').getValue();
  return (username == validUser && password == validPass) ? { success: true } : { success: false };
}

// -------------------
// FUNGSI TAMBAH DATA & UPLOAD
// -------------------
function tambahArtikel(title, content) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Artikel');
  if(!sheet) return { success: false, error: "Tab 'Artikel' tidak ada." };
  const uniqueId = 'ART-' + new Date().getTime();
  sheet.appendRow([uniqueId, title, content, '']); 
  return { success: true };
}

function tambahPortofolio(title, imageData, desc) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Portfolio');
  if(!sheet) return { success: false, error: "Tab 'Portfolio' tidak ada." };
  
  let imageUrl = "";
  if (imageData && imageData.base64) {
    imageUrl = uploadImageToDrive(imageData);
  }

  const uniqueId = 'PRT-' + new Date().getTime();
  sheet.appendRow([uniqueId, title, imageUrl, desc]); 
  return { success: true };
}

function tambahPanitia(nama, jabatan, imageData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Panitia');
  if(!sheet) return { success: false, error: "Tab 'Panitia' tidak ada." };
  
  let imageUrl = "";
  if (imageData && imageData.base64) {
    imageUrl = uploadImageToDrive(imageData);
  }

  const uniqueId = 'PNT-' + new Date().getTime();
  sheet.appendRow([uniqueId, nama, jabatan, imageUrl]); 
  return { success: true };
}

// -------------------
// FUNGSI EDIT DATA & UPDATE GAMBAR
// -------------------
function editArtikel(id, title, content) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Artikel');
  if(!sheet) return { success: false, error: "Tab 'Artikel' tidak ada." };
  
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.getRange(i + 1, 2).setValue(title);
      sheet.getRange(i + 1, 3).setValue(content);
      return { success: true };
    }
  }
  return { success: false, error: "Data Artikel tidak ditemukan." };
}

function editPortofolio(id, title, imageData, existingImage, desc) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Portfolio');
  if(!sheet) return { success: false, error: "Tab 'Portfolio' tidak ada." };
  
  let finalImageUrl = existingImage;
  if (imageData && imageData.base64) {
    finalImageUrl = uploadImageToDrive(imageData);
  }
  
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.getRange(i + 1, 2).setValue(title);
      sheet.getRange(i + 1, 3).setValue(finalImageUrl);
      sheet.getRange(i + 1, 4).setValue(desc);
      return { success: true };
    }
  }
  return { success: false, error: "Data Galeri tidak ditemukan." };
}

function editPanitia(id, nama, jabatan, imageData, existingImage) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Panitia');
  if(!sheet) return { success: false, error: "Tab 'Panitia' tidak ada." };
  
  let finalImageUrl = existingImage;
  if (imageData && imageData.base64) {
    finalImageUrl = uploadImageToDrive(imageData);
  }

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.getRange(i + 1, 2).setValue(nama);
      sheet.getRange(i + 1, 3).setValue(jabatan);
      sheet.getRange(i + 1, 4).setValue(finalImageUrl);
      return { success: true };
    }
  }
  return { success: false, error: "Data Panitia tidak ditemukan." };
}

// -------------------
// FUNGSI HAPUS DATA
// -------------------
function hapusArtikel(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Artikel');
  if(!sheet) return false;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) { sheet.deleteRow(i + 1); return true; }
  }
  return false;
}

function hapusPortofolio(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Portfolio');
  if(!sheet) return false;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) { sheet.deleteRow(i + 1); return true; }
  }
  return false;
}

function hapusPanitia(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Panitia');
  if(!sheet) return false;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) { sheet.deleteRow(i + 1); return true; }
  }
  return false;
}