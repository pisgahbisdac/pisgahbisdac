/**
 * BACKEND GOOGLE APPS SCRIPT (GAS)
 * Versi: 3.0 (Info Bank Terpisah & Fitur Edit Galeri/Berita)
 */

const SPREADSHEET_ID = '1Z34p14RRS4NCSlD66NOz4l5QTmnKvckUl5-vKFbPyFQ'; 

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
      
      case 'tambahArtikel': result = tambahArtikel(req.title, req.content); break;
      case 'tambahPortofolio': result = tambahPortofolio(req.title, req.image, req.desc); break;
      
      case 'editArtikel': result = editArtikel(req.id, req.title, req.content); break;
      case 'editPortofolio': result = editPortofolio(req.id, req.title, req.image, req.desc); break;
      
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
  
  // URUTAN BARU UNTUK INFO SPREADSHEET
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
        if(rowsArt[i][0]) {
          dataArtikel.push({
              id: rowsArt[i][0],
              title: rowsArt[i][1],
              content: rowsArt[i][2]
          });
        }
      }
  }

  const sheetPorto = ss.getSheetByName('Portfolio');
  let dataPorto = [];
  if (sheetPorto) {
      const rowsPorto = sheetPorto.getDataRange().getValues();
      for (let i = 1; i < rowsPorto.length; i++) {
        if(rowsPorto[i][0]) {
          dataPorto.push({
              id: rowsPorto[i][0],
              title: rowsPorto[i][1],
              image: rowsPorto[i][2],
              desc: rowsPorto[i][3] // Kolom D untuk Narasi/Deskripsi
          });
        }
      }
  }

  return { target, terkumpul, bank, norek, atasnama, judul, artikel: dataArtikel, portfolio: dataPorto };
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
  
  // Karena baris bergeser, Data Login kini ada di B7 dan B8
  const validUser = sheetInfo.getRange('B7').getValue();
  const validPass = sheetInfo.getRange('B8').getValue();
  return (username == validUser && password == validPass) ? { success: true } : { success: false };
}

// -------------------
// FUNGSI TAMBAH DATA
// -------------------
function tambahArtikel(title, content) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Artikel');
  if(!sheet) return { success: false, error: "Tab 'Artikel' tidak ada." };
  const uniqueId = 'ART-' + new Date().getTime();
  sheet.appendRow([uniqueId, title, content, '']); 
  return { success: true };
}

function tambahPortofolio(title, image, desc) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Portfolio');
  if(!sheet) return { success: false, error: "Tab 'Portfolio' tidak ada." };
  const uniqueId = 'PRT-' + new Date().getTime();
  sheet.appendRow([uniqueId, title, image, desc]); 
  return { success: true };
}

// -------------------
// FUNGSI EDIT DATA BARU
// -------------------
function editArtikel(id, title, content) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Artikel');
  if(!sheet) return { success: false, error: "Tab 'Artikel' tidak ada." };
  
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.getRange(i + 1, 2).setValue(title);   // Kolom B: Judul
      sheet.getRange(i + 1, 3).setValue(content); // Kolom C: Konten
      return { success: true };
    }
  }
  return { success: false, error: "Data Artikel tidak ditemukan." };
}

function editPortofolio(id, title, image, desc) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Portfolio');
  if(!sheet) return { success: false, error: "Tab 'Portfolio' tidak ada." };
  
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.getRange(i + 1, 2).setValue(title); // Kolom B: Judul
      sheet.getRange(i + 1, 3).setValue(image); // Kolom C: Link Image
      sheet.getRange(i + 1, 4).setValue(desc);  // Kolom D: Narasi/Deskripsi
      return { success: true };
    }
  }
  return { success: false, error: "Data Galeri tidak ditemukan." };
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