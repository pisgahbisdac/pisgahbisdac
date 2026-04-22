// ==========================================
// KONFIGURASI DATABASE
// ==========================================
// PASTIKAN ID DI BAWAH INI BENAR
const SPREADSHEET_ID = '1Z34p14RRS4NCSlD66NOz4l5QTmnKvckUl5-vKFbPyFQ'; 
const FOLDER_ID = '1XuGZzprXsY63lTeXv_M4JuRw3WUGRKnn'; // Untuk menyimpan foto upload

/**
 * Fungsi untuk mengetes koneksi ke Spreadsheet.
 * Jalankan fungsi ini secara manual di editor Apps Script untuk melihat apakah ID sudah benar.
 */
function testConnection() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log("Koneksi Berhasil! Nama Spreadsheet: " + ss.getName());
    return "Koneksi Berhasil!";
  } catch (e) {
    Logger.log("Koneksi Gagal: " + e.toString());
    return "Gagal: " + e.toString();
  }
}

/**
 * Fungsi utama untuk melayani permintaan web.
 * Ditambahkan header keamanan untuk mengizinkan embed di domain lain.
 */
function doGet(e) {
  var output = HtmlService.createTemplateFromFile('Index').evaluate();
  
  return output
    .setTitle('Proposal Pembangunan')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) // Mengizinkan iframe/domain luar
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// --- PENGAMBILAN DATA ---
function getInitialData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 1. Data Info Utama
    const sheetInfo = ss.getSheetByName('Info');
    const infoData = sheetInfo.getRange('B1:B4').getValues(); 
    const info = {
      target: Number(infoData[0][0]) || 0,
      terkumpul: Number(infoData[1][0]) || 0,
      rekening: infoData[2][0] || "Belum diatur",
      judulProposal: infoData[3][0] || "Proposal Pembangunan"
    };

    // 2. Data Portfolio
    const sheetPortfolio = ss.getSheetByName('Portfolio');
    const portData = sheetPortfolio.getDataRange().getValues();
    if (portData.length > 1) {
      portData.shift(); 
    } else {
      var portfolios = [];
    }
    var portfolios = portData.map(row => ({
      id: row[0], imageUrl: row[1], title: row[2], description: row[3]
    })).filter(p => p.title !== "");

    // 3. Data Artikel
    const sheetArtikel = ss.getSheetByName('Artikel');
    const artData = sheetArtikel.getDataRange().getValues();
    if (artData.length > 1) {
      artData.shift();
    } else {
      var articles = [];
    }
    var articles = artData.map(row => ({
      id: row[0], title: row[1], imageUrl: row[2], content: row[3], date: row[4]
    })).filter(a => a.title !== "");

    return { info: info, portfolios: portfolios, articles: articles.reverse() };
  } catch (err) {
    console.error("Error getInitialData: " + err.message);
    return { error: err.message };
  }
}

// --- PENULISAN DATA (CMS) ---
function updateInfoWebsite(target, terkumpul, rekening, judul) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Info');
    sheet.getRange('B1').setValue(target);
    sheet.getRange('B2').setValue(terkumpul);
    sheet.getRange('B3').setValue(rekening);
    sheet.getRange('B4').setValue(judul);
    SpreadsheetApp.flush(); 
    return true;
  } catch (e) {
    return false;
  }
}

function simpanArtikel(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Artikel');
    
    if (data.id) {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.id) {
          sheet.getRange(i + 1, 2).setValue(data.title);
          sheet.getRange(i + 1, 3).setValue(data.imageUrl);
          sheet.getRange(i + 1, 4).setValue(data.content);
          break;
        }
      }
    } else {
      const newId = new Date().getTime();
      const dateStr = new Date().toLocaleDateString('id-ID');
      sheet.appendRow([newId, data.title, data.imageUrl, data.content, dateStr]);
    }
    SpreadsheetApp.flush();
    return true;
  } catch (e) {
    return false;
  }
}

// --- FUNGSI LAINNYA ---
function submitKonfirmasi(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Konfirmasi');
    sheet.appendRow([new Date(), data.nama, data.jumlah, data.keterangan]);
    return { success: true, message: "Data tersimpan di Spreadsheet!" };
  } catch (e) {
    return { success: false, message: "Gagal menyimpan: " + e.message };
  }
}

function uploadFileToDrive(base64Data, fileName) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const splitBase = base64Data.split(',');
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    const blob = Utilities.newBlob(byteCharacters, type, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (e) {
    throw new Error("Gagal upload ke Drive: " + e.message);
  }
}

function verifyAdmin(username, password) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetInfo = ss.getSheetByName('Info');
    const validUser = sheetInfo.getRange('B5').getValue();
    const validPass = sheetInfo.getRange('B6').getValue();
    return { success: (username == validUser && password == validPass) };
  } catch (e) {
    return { success: false };
  }
}

function hapusArtikel(id) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Artikel');
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] == id) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}