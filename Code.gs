// ==========================================
// KONFIGURASI DATABASE (WAJIB DIISI NANTI)
// ==========================================
const SPREADSHEET_ID = '1Z34p14RRS4NCSlD66NOz4l5QTmnKvckUl5-vKFbPyFQ'; 
const FOLDER_ID = '1XuGZzprXsY63lTeXv_M4JuRw3WUGRKnn'; // Untuk menyimpan foto upload

// Fungsi utama untuk menampilkan halaman HTML
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Proposal Pembangunan')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ==========================================
// FUNGSI PENGAMBILAN DATA (READ)
// ==========================================
function getInitialData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Ambil Data Pengaturan (Target, Terkumpul, Rekening)
  const sheetInfo = ss.getSheetByName('Info');
  const infoData = sheetInfo.getRange('B1:B4').getValues(); 
  const info = {
    target: infoData[0][0],
    terkumpul: infoData[1][0],
    rekening: infoData[2][0],
    judulProposal: infoData[3][0]
  };

  // 2. Ambil Data Portfolio (Proposal memanjang ke bawah)
  const sheetPortfolio = ss.getSheetByName('Portfolio');
  const portData = sheetPortfolio.getDataRange().getValues();
  portData.shift(); // Buang header
  const portfolios = portData.map(row => ({
    id: row[0], imageUrl: row[1], title: row[2], description: row[3]
  })).filter(p => p.title !== "");

  // 3. Ambil Data Artikel
  const sheetArtikel = ss.getSheetByName('Artikel');
  const artData = sheetArtikel.getDataRange().getValues();
  artData.shift(); // Buang header
  const articles = artData.map(row => ({
    id: row[0], title: row[1], imageUrl: row[2], content: row[3], date: row[4]
  })).filter(a => a.title !== "");

  return { info: info, portfolios: portfolios, articles: articles.reverse() };
}

// ==========================================
// FUNGSI KONFIRMASI TRANSFER
// ==========================================
function submitKonfirmasi(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Konfirmasi');
    sheet.appendRow([new Date(), data.nama, data.jumlah, data.keterangan]);
    return { success: true, message: "Konfirmasi berhasil dikirim!" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// ==========================================
// FUNGSI ADMIN & AUTENTIKASI
// ==========================================
function verifyAdmin(username, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetInfo = ss.getSheetByName('Info');
  // Asumsi kredensial ada di B5 (Username) dan B6 (Password)
  const validUser = sheetInfo.getRange('B5').getValue();
  const validPass = sheetInfo.getRange('B6').getValue();
  
  if(username === validUser && password === validPass) {
    return { success: true };
  }
  return { success: false, message: "Username atau Password salah!" };
}

// ==========================================
// FUNGSI UPLOAD FILE KE GOOGLE DRIVE
// ==========================================
function uploadFileToDrive(base64Data, fileName) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const splitBase = base64Data.split(',');
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    const blob = Utilities.newBlob(byteCharacters, type, fileName);
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Mengembalikan URL untuk tag <img>
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (e) {
    throw new Error("Gagal upload gambar: " + e.message);
  }
}

// ==========================================
// FUNGSI CMS (CREATE, UPDATE, DELETE)
// ==========================================

function updateInfoWebsite(target, terkumpul, rekening, judul) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Info');
  sheet.getRange('B1').setValue(target);
  sheet.getRange('B2').setValue(terkumpul);
  sheet.getRange('B3').setValue(rekening);
  sheet.getRange('B4').setValue(judul);
  return true;
}

function simpanArtikel(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Artikel');
  
  if (data.id) {
    // Update Artikel Lama
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] == data.id) {
        sheet.getRange(i + 1, 2).setValue(data.title);
        sheet.getRange(i + 1, 3).setValue(data.imageUrl);
        sheet.getRange(i + 1, 4).setValue(data.content);
        return true;
      }
    }
  } else {
    // Buat Artikel Baru
    const newId = new Date().getTime();
    const dateStr = new Date().toLocaleDateString('id-ID');
    sheet.appendRow([newId, data.title, data.imageUrl, data.content, dateStr]);
    return true;
  }
}

function hapusArtikel(id) {
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
}