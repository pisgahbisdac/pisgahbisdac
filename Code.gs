/**
 * BACKEND GOOGLE APPS SCRIPT (GAS)
 * Versi: 2.7 (Penambahan Fitur Tambah Galeri & Berita)
 */

const SPREADSHEET_ID = '1Z34p14RRS4NCSlD66NOz4l5QTmnKvckUl5-vKFbPyFQ'; 
const FOLDER_ID = '1XuGZzprXsY63lTeXv_M4JuRw3WUGRKnn';

// METHOD GET (Digunakan saat pertama kali load web untuk ambil data)
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

// METHOD POST (Menangani request dari Web)
function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    let result = {};

    switch(req.action) {
      case 'submitKonfirmasi': 
        result = submitKonfirmasi(req.payload); 
        break;
      case 'verifyAdmin': 
        result = verifyAdmin(req.username, req.password); 
        break;
      case 'updateInfoWebsite': 
        result = { success: updateInfoWebsite(req.target, req.terkumpul, req.rekening, req.judul) }; 
        break;
      case 'tambahArtikel': 
        result = { success: tambahArtikel(req.title, req.content) }; 
        break;
      case 'tambahPortofolio': 
        result = { success: tambahPortofolio(req.title, req.image) }; 
        break;
      case 'hapusArtikel': 
        result = { success: hapusArtikel(req.id) }; 
        break;
      case 'hapusPortofolio': 
        result = { success: hapusPortofolio(req.id) }; 
        break;
      default: 
        result = { error: "Action tidak ditemukan" };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// KUMPULAN FUNGSI EKSEKUSI
// ==========================================

function getInitialData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Baca Data Global (Info)
  const sheetInfo = ss.getSheetByName('Info');
  const target = sheetInfo.getRange('B1').getValue();
  const terkumpul = sheetInfo.getRange('B2').getValue();
  const rekening = sheetInfo.getRange('B3').getValue();
  const judul = sheetInfo.getRange('B4').getValue();
  
  // Baca Data Artikel
  const sheetArtikel = ss.getSheetByName('Artikel');
  let dataArtikel = [];
  if (sheetArtikel) {
      const rowsArt = sheetArtikel.getDataRange().getValues();
      for (let i = 1; i < rowsArt.length; i++) {
        dataArtikel.push({
            id: rowsArt[i][0],
            title: rowsArt[i][1],
            content: rowsArt[i][2],
            image: rowsArt[i][3] // Sesuaikan index jika kolom gambar beda
        });
      }
  }

  // Baca Data Portfolio (Galeri)
  const sheetPorto = ss.getSheetByName('Portfolio');
  let dataPorto = [];
  if (sheetPorto) {
      const rowsPorto = sheetPorto.getDataRange().getValues();
      for (let i = 1; i < rowsPorto.length; i++) {
        dataPorto.push({
            id: rowsPorto[i][0],
            title: rowsPorto[i][1],
            image: rowsPorto[i][2] // Sesuaikan index jika kolom beda
        });
      }
  }

  return { target, terkumpul, rekening, judul, artikel: dataArtikel, portfolio: dataPorto };
}

function submitKonfirmasi(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Konfirmasi');
  if(!sheet) return { success: false, error: "Sheet Konfirmasi tidak ditemukan di Spreadsheet" };
  
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

// FUNGSI BARU: Tambah Berita
function tambahArtikel(title, content) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Artikel');
  if(!sheet) return false;
  
  // Buat ID unik acak menggunakan Timestamp
  const uniqueId = 'ART-' + new Date().getTime();
  
  // Memasukkan [ID, Judul, Konten, (Kolom kosong jika tidak pakai gambar)]
  sheet.appendRow([uniqueId, title, content, '']); 
  return true;
}

// FUNGSI BARU: Tambah Galeri/Portfolio
function tambahPortofolio(title, image) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Portfolio');
  if(!sheet) return false;
  
  const uniqueId = 'PRT-' + new Date().getTime();
  
  // Memasukkan [ID, Judul, Link Gambar]
  sheet.appendRow([uniqueId, title, image]); 
  return true;
}

function verifyAdmin(username, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetInfo = ss.getSheetByName('Info');
  
  const validUser = sheetInfo.getRange('B5').getValue();
  const validPass = sheetInfo.getRange('B6').getValue();
  
  if (username == validUser && password == validPass) {
    return { success: true };
  } else {
    return { success: false };
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