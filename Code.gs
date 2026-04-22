// ==========================================
// KONFIGURASI DATABASE
// ==========================================
const SPREADSHEET_ID = '1Z34p14RRS4NCSlD66NOz4l5QTmnKvckUl5-vKFbPyFQ'; 
const FOLDER_ID = '1XuGZzprXsY63lTeXv_M4JuRw3WUGRKnn';

// ==========================================
// API GET REQUEST (Mengirim Data ke Website)
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

// ==========================================
// API POST REQUEST (Menerima Data/Aksi dari Website)
// ==========================================
function doPost(e) {
  try {
    // Parse data JSON yang dikirim dari Frontend GitHub
    const req = JSON.parse(e.postData.contents);
    let result = {};

    if (req.action === 'submitKonfirmasi') {
      result = submitKonfirmasi(req.payload);
    } else if (req.action === 'verifyAdmin') {
      result = verifyAdmin(req.username, req.password);
    } else if (req.action === 'updateInfoWebsite') {
      result = { success: updateInfoWebsite(req.target, req.terkumpul, req.rekening, req.judul) };
    } else if (req.action === 'uploadFileToDrive') {
      const url = uploadFileToDrive(req.base64, req.fileName);
      result = { success: true, url: url };
    } else if (req.action === 'simpanArtikel') {
      result = { success: simpanArtikel(req.payload) };
    } else if (req.action === 'hapusArtikel') {
      result = { success: hapusArtikel(req.id) };
    } else {
      result = { success: false, message: "Action tidak dikenali." };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// FUNGSI UTAMA PENGELOLAAN SPREADSHEET
// ==========================================
function getInitialData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const sheetInfo = ss.getSheetByName('Info');
  const infoData = sheetInfo.getRange('B1:B4').getValues(); 
  const info = {
    target: Number(infoData[0][0]) || 0,
    terkumpul: Number(infoData[1][0]) || 0,
    rekening: infoData[2][0] || "Belum diatur",
    judulProposal: infoData[3][0] || "Proposal Pembangunan"
  };

  const sheetPortfolio = ss.getSheetByName('Portfolio');
  const portData = sheetPortfolio.getDataRange().getValues();
  if (portData.length > 1) portData.shift(); else var portfolios = [];
  var portfolios = portData.map(row => ({
    id: row[0], imageUrl: row[1], title: row[2], description: row[3]
  })).filter(p => p.title !== "");

  const sheetArtikel = ss.getSheetByName('Artikel');
  const artData = sheetArtikel.getDataRange().getValues();
  if (artData.length > 1) artData.shift(); else var articles = [];
  var articles = artData.map(row => ({
    id: row[0], title: row[1], imageUrl: row[2], content: row[3], date: row[4]
  })).filter(a => a.title !== "");

  return { success: true, info: info, portfolios: portfolios, articles: articles.reverse() };
}

function updateInfoWebsite(target, terkumpul, rekening, judul) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Info');
  sheet.getRange('B1').setValue(target);
  sheet.getRange('B2').setValue(terkumpul);
  sheet.getRange('B3').setValue(rekening);
  sheet.getRange('B4').setValue(judul);
  SpreadsheetApp.flush(); 
  return true;
}

function simpanArtikel(data) {
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
}

function submitKonfirmasi(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Konfirmasi');
  sheet.appendRow([new Date(), data.nama, data.jumlah, data.keterangan]);
  return { success: true, message: "Data konfirmasi terkirim!" };
}

function uploadFileToDrive(base64Data, fileName) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const splitBase = base64Data.split(',');
  const type = splitBase[0].split(';')[0].replace('data:', '');
  const byteCharacters = Utilities.base64Decode(splitBase[1]);
  const blob = Utilities.newBlob(byteCharacters, type, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return "https://drive.google.com/uc?export=view&id=" + file.getId();
}

function verifyAdmin(username, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetInfo = ss.getSheetByName('Info');
  const validUser = sheetInfo.getRange('B5').getValue();
  const validPass = sheetInfo.getRange('B6').getValue();
  if(username == validUser && password == validPass) {
      return { success: true };
  } else {
      return { success: false, message: "Username/Password Salah!" };
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