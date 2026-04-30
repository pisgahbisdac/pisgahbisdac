/**
 * BACKEND GOOGLE APPS SCRIPT (GAS)
 * Versi: 2.8 (Debug Nama Sheet & Penambahan Data)
 */

const SPREADSHEET_ID = '1Z34p14RRS4NCSlD66NOz4l5QTmnKvckUl5-vKFbPyFQ'; 

// METHOD GET
function doGet(e) {
  try {
    const data = getInitialData();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

// METHOD POST
function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    let result = {};

    switch(req.action) {
      case 'submitKonfirmasi': result = submitKonfirmasi(req.payload); break;
      case 'verifyAdmin': result = verifyAdmin(req.username, req.password); break;
      case 'updateInfoWebsite': result = { success: updateInfoWebsite(req.target, req.terkumpul, req.rekening, req.judul) }; break;
      case 'tambahArtikel': result = tambahArtikel(req.title, req.content); break;
      case 'tambahPortofolio': result = tambahPortofolio(req.title, req.image); break;
      case 'hapusArtikel': result = { success: hapusArtikel(req.id) }; break;
      case 'hapusPortofolio': result = { success: hapusPortofolio(req.id) }; break;
      default: result = { error: "Action tidak ditemukan" };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
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
  const rekening = sheetInfo.getRange('B3').getValue();
  const judul = sheetInfo.getRange('B4').getValue();
  
  const sheetArtikel = ss.getSheetByName('Artikel');
  let dataArtikel = [];
  if (sheetArtikel) {
      const rowsArt = sheetArtikel.getDataRange().getValues();
      for (let i = 1; i < rowsArt.length; i++) {
        if(rowsArt[i][0]) { // Hanya ambil jika ID ada
          dataArtikel.push({
              id: rowsArt[i][0],
              title: rowsArt[i][1],
              content: rowsArt[i][2],
              image: rowsArt[i][3]
          });
        }
      }
  }

  const sheetPorto = ss.getSheetByName('Portfolio');
  let dataPorto = [];
  if (sheetPorto) {
      const rowsPorto = sheetPorto.getDataRange().getValues();
      for (let i = 1; i < rowsPorto.length; i++) {
        if(rowsPorto[i][0]) { // Hanya ambil jika ID ada
          dataPorto.push({
              id: rowsPorto[i][0],
              title: rowsPorto[i][1],
              image: rowsPorto[i][2]
          });
        }
      }
  }

  return { target, terkumpul, rekening, judul, artikel: dataArtikel, portfolio: dataPorto };
}

function submitKonfirmasi(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Konfirmasi');
  if(!sheet) return { success: false, error: "Sheet 'Konfirmasi' tidak ditemukan" };
  
  sheet.appendRow([new Date(), payload.nama, payload.jumlah, payload.keterangan]);
  return { success: true };
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

// FUNGSI: Tambah Berita (Artikel)
function tambahArtikel(title, content) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  // PERHATIKAN: Mencari nama tab 'Artikel' persis.
  const sheet = ss.getSheetByName('Artikel');
  
  if(!sheet) {
    return { success: false, error: "GAGAL: Tab bernama 'Artikel' tidak ada di Spreadsheet Anda." };
  }
  
  const uniqueId = 'ART-' + new Date().getTime();
  sheet.appendRow([uniqueId, title, content, '']); 
  return { success: true };
}

// FUNGSI: Tambah Galeri (Portfolio)
function tambahPortofolio(title, image) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  // PERHATIKAN: Mencari nama tab 'Portfolio' persis.
  const sheet = ss.getSheetByName('Portfolio');
  
  if(!sheet) {
    return { success: false, error: "GAGAL: Tab bernama 'Portfolio' tidak ada di Spreadsheet Anda." };
  }
  
  const uniqueId = 'PRT-' + new Date().getTime();
  sheet.appendRow([uniqueId, title, image]); 
  return { success: true };
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
  if(!sheet) return false;
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
  if(!sheet) return false;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}