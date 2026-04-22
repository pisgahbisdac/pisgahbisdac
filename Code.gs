/**
 * BACKEND GOOGLE APPS SCRIPT (GAS)
 * Versi: 2.5 (Fix: Sync Image & Bidirectional Data)
 */

const SPREADSHEET_ID = '1Z34p14RRS4NCSlD66NOz4l5QTmnKvckUl5-vKFbPyFQ'; 
const FOLDER_ID = '1XuGZzprXsY63lTeXv_M4JuRw3WUGRKnn';

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
      case 'submitKonfirmasi': result = submitKonfirmasi(req.payload); break;
      case 'verifyAdmin': result = verifyAdmin(req.username, req.password); break;
      case 'updateInfoWebsite': result = { success: updateInfoWebsite(req.target, req.terkumpul, req.rekening, req.judul) }; break;
      case 'uploadFileToDrive': 
        const url = uploadFileToDrive(req.base64, req.fileName);
        result = { success: true, url: url }; 
        break;
      case 'simpanArtikel': result = { success: simpanArtikel(req.payload) }; break;
      case 'hapusArtikel': result = { success: hapusArtikel(req.id) }; break;
      case 'simpanPortofolio': result = { success: simpanPortofolio(req.payload) }; break;
      case 'hapusPortofolio': result = { success: hapusPortofolio(req.id) }; break;
      default: result = { success: false, message: "Aksi tidak dikenali." };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * MENGAMBIL DATA DARI SPREADSHEET KE WEBSITE
 */
function getInitialData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Ambil Info Utama (B1:B4)
  const sheetInfo = ss.getSheetByName('Info');
  const infoData = sheetInfo.getRange('B1:B4').getValues(); 
  const info = {
    target: Number(infoData[0][0]) || 0,
    terkumpul: Number(infoData[1][0]) || 0,
    rekening: infoData[2][0] || "Belum diatur",
    judulProposal: infoData[3][0] || "Proposal Pembangunan"
  };

  // Ambil Portofolio
  const sheetPortfolio = ss.getSheetByName('Portfolio');
  const portData = sheetPortfolio.getDataRange().getValues();
  let portfolios = [];
  if (portData.length > 1) {
    portData.shift(); // Hapus header
    portfolios = portData.map(row => ({
      id: row[0], imageUrl: row[1], title: row[2], description: row[3]
    })).filter(p => p.title !== "");
  }

  // Ambil Artikel
  const sheetArtikel = ss.getSheetByName('Artikel');
  const artData = sheetArtikel.getDataRange().getValues();
  let articles = [];
  if (artData.length > 1) {
    artData.shift(); // Hapus header
    articles = artData.map(row => ({
      id: row[0], title: row[1], imageUrl: row[2], content: row[3], date: row[4]
    })).filter(a => a.title !== "");
  }

  return { success: true, info: info, portfolios: portfolios, articles: articles.reverse() };
}

/**
 * UPLOAD GAMBAR DAN KONVERSI KE DIRECT LINK
 */
function uploadFileToDrive(base64Data, fileName) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const splitBase = base64Data.split(',');
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    const blob = Utilities.newBlob(byteCharacters, type, fileName);
    const file = folder.createFile(blob);
    
    // Memberikan izin akses publik ke file tersebut
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // FORMAT PENTING: Mengubah ID file menjadi direct image link agar bisa muncul di tag <img>
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (e) {
    throw new Error("Gagal upload ke Drive: " + e.message);
  }
}

/**
 * SIMPAN ATAU UPDATE PORTOFOLIO (Sync ke Spreadsheet)
 */
function simpanPortofolio(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Portfolio');
  if (data.id) {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] == data.id) {
        sheet.getRange(i + 1, 2).setValue(data.imageUrl);
        sheet.getRange(i + 1, 3).setValue(data.title);
        sheet.getRange(i + 1, 4).setValue(data.description);
        return true;
      }
    }
  } else {
    const newId = "P" + new Date().getTime();
    sheet.appendRow([newId, data.imageUrl, data.title, data.description]);
  }
  return true;
}

/**
 * SIMPAN ATAU UPDATE ARTIKEL (Sync ke Spreadsheet)
 */
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
        return true;
      }
    }
  } else {
    const newId = "A" + new Date().getTime();
    const dateStr = new Date().toLocaleDateString('id-ID');
    sheet.appendRow([newId, data.title, data.imageUrl, data.content, dateStr]);
  }
  return true;
}

function updateInfoWebsite(target, terkumpul, rekening, judul) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Info');
  sheet.getRange('B1').setValue(target);
  sheet.getRange('B2').setValue(terkumpul);
  sheet.getRange('B3').setValue(rekening);
  sheet.getRange('B4').setValue(judul);
  return true;
}

function verifyAdmin(username, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetInfo = ss.getSheetByName('Info');
  const validUser = sheetInfo.getRange('B5').getValue();
  const validPass = sheetInfo.getRange('B6').getValue();
  return (username == validUser && password == validPass) ? { success: true } : { success: false };
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

function hapusPortofolio(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Portfolio');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function submitKonfirmasi(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Konfirmasi');
  sheet.appendRow([new Date(), data.nama, data.jumlah, data.keterangan]);
  return { success: true };
}