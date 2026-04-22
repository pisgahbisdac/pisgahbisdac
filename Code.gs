// =========================================================================
// 1. KONFIGURASI UTAMA
// =========================================================================

// Ganti teks di dalam tanda kutip dengan ID asli milik Anda
const SPREADSHEET_ID = "MASUKKAN_ID_SPREADSHEET_ANDA_DI_SINI"; 
const FOLDER_GALERI_ID = "MASUKKAN_ID_FOLDER_DRIVE_ANDA_DI_SINI"; 

// Nama-nama Sheet / Tab di dalam Google Sheets
const SHEET_PENGATURAN = "Pengaturan";
const SHEET_PEJABAT = "Data_Pejabat";
const SHEET_WARTA = "Warta_Jemaat";

// Pemetaan Sheet untuk Jadwal
const CATEGORY_MAP = {
  rabu: "Jadwal_Rabu",
  sekolahSabat: "Jadwal_SS",
  khotbah: "Jadwal_Khotbah",
  diakon: "Jadwal_Diakon",
  musik: "Jadwal_Musik",
  perjamuan: "Jadwal_Perjamuan",
  susunanAcara: "Jadwal_Susunan"
};

const CATEGORY_MAP_REV = {
  'Jadwal_Rabu': 'petugas',
  'Jadwal_SS': 'sekolahSabat',
  'Jadwal_Khotbah': 'khotbah',
  'Jadwal_Diakon': 'diakon',
  'Jadwal_Musik': 'musik',
  'Jadwal_Perjamuan': 'perjamuan',
  'Jadwal_Susunan': 'susunan'
};

// =========================================================================
// FUNGSI UTAMA: UPLOAD GAMBAR DAN KONVERSI KE DIRECT LINK
// =========================================================================
function uploadFileToDrive(base64Data, fileName, targetFolderId) {
  try {
    // Target folder set karvanu
    let folder;
    try {
        const defaultId = typeof FOLDER_GALERI_ID !== 'undefined' ? FOLDER_GALERI_ID : '';
        folder = DriveApp.getFolderById(targetFolderId || defaultId);
    } catch(err) {
        // Jo folder na male to navu folder banavo
        const folders = DriveApp.getFoldersByName("PISGAH_GALERI_UPLOADS");
        folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("PISGAH_GALERI_UPLOADS");
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    let byteCharacters;
    let type = 'image/jpeg'; // Default type
    
    // String base64 format ma chhe ke nahi te check karo
    if (base64Data.includes(',')) {
      const splitBase = base64Data.split(',');
      type = splitBase[0].split(';')[0].replace('data:', '');
      byteCharacters = Utilities.base64Decode(splitBase[1]);
    } else {
      // Raw Base64 mate
      byteCharacters = Utilities.base64Decode(base64Data);
      if (base64Data.startsWith('UklG')) type = 'image/webp';
      else if (base64Data.startsWith('iVBORw')) type = 'image/png';
      else if (base64Data.startsWith('/9j/')) type = 'image/jpeg';
    }
    
    const blob = Utilities.newBlob(byteCharacters, type, fileName);
    const file = folder.createFile(blob);
    
    // File ne public access aapo
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Direct image link return karo
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (e) {
    throw new Error("Drive ma upload karvama bhul: " + e.message);
  }
}

// =========================================================================
// IMPLEMENTASI FUNGSI PADA PENYIMPANAN DATA
// =========================================================================

// 1. PENYIMPANAN PEJABAT / PELAYAN JEMAAT
function savePejabat(payload) {
  try {
    let pejabatArray = payload.data;
    
    // Looping data pejabat: jika ada foto baru (Base64) atau string panjang, ubah jadi link Drive
    for (let i = 0; i < pejabatArray.length; i++) {
      if (pejabatArray[i].img && (pejabatArray[i].img.startsWith('data:image') || pejabatArray[i].img.length > 500)) {
        let shortId = Math.random().toString(36).substr(2, 4).toUpperCase();
        let fileName = "PEJABAT_" + pejabatArray[i].id + "_" + shortId + ".jpg";
        
        // Panggil fungsi konversi direct link
        pejabatArray[i].img = uploadFileToDrive(pejabatArray[i].img, fileName, FOLDER_GALERI_ID); 
      }
    }
    
    saveSettingRecord('DATA_PEJABAT', JSON.stringify(pejabatArray));
    saveSettingRecord('KATEGORI_PEJABAT', JSON.stringify(payload.kategoriPejabat));
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

// 2. PENYIMPANAN WARTA BARU
function saveWarta(payload) {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
    let gambarUrl = payload.gambarUrl || "";
    
    if (gambarUrl.startsWith('data:image') || gambarUrl.length > 500) {
      let shortId = Math.random().toString(36).substr(2, 4).toUpperCase();
      // Panggil fungsi konversi direct link
      gambarUrl = uploadFileToDrive(gambarUrl, "WRT_" + shortId + ".jpg", FOLDER_GALERI_ID);
    }
    
    sheet.appendRow([ new Date(), payload.judul, payload.isi, gambarUrl, payload.penulis ]);
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

// 3. UPDATE WARTA EKSISTING
function updateWarta(payload) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
    let gambarUrl = payload.gambarUrl || "";
    
    if (gambarUrl.startsWith('data:image') || gambarUrl.length > 500) {
      let shortId = Math.random().toString(36).substr(2, 4).toUpperCase();
      // Panggil fungsi konversi direct link
      gambarUrl = uploadFileToDrive(gambarUrl, "WRT_" + shortId + ".jpg", FOLDER_GALERI_ID);
    }
    
    sheet.getRange(payload.rowIndex, 2).setValue(payload.judul);
    sheet.getRange(payload.rowIndex, 3).setValue(payload.isi);
    sheet.getRange(payload.rowIndex, 4).setValue(gambarUrl);
    sheet.getRange(payload.rowIndex, 5).setValue(payload.penulis);
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

// 4. PENYIMPANAN CAROUSEL / HERO IMAGES
function saveHeroImages(jsonStringArray) {
  try {
    let images = JSON.parse(jsonStringArray);
    let updatedImages = [];

    // Buat/Cari folder khusus Hero Banner
    const parent = DriveApp.getFolderById(FOLDER_GALERI_ID);
    const folders = parent.getFoldersByName("Hero_Images");
    const heroFolder = folders.hasNext() ? folders.next() : parent.createFolder("Hero_Images");
    heroFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    for (let i = 0; i < images.length; i++) {
      let img = images[i];
      if (img.startsWith('data:image') || img.length > 500) {
        let shortId = Math.random().toString(36).substr(2, 4).toUpperCase();
        let fileName = "HERO_" + shortId + ".jpg"; 
        
        // Panggil fungsi konversi direct link ke dalam folder khusus
        let url = uploadFileToDrive(img, fileName, heroFolder.getId());
        if (url) updatedImages.push(url);
      } else {
        updatedImages.push(img); // Jika sudah berupa link pendek, langsung masukkan
      }
    }
    
    saveSettingRecord('HERO_IMAGE_URL', JSON.stringify(updatedImages));
    return jsonResponse({ success: true, updatedUrls: updatedImages });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

// 5. UPLOAD GAMBAR GALERI
function uploadImageToDrive(payload) {
  try {
    // Panggil fungsi konversi direct link untuk fitur galeri
    let url = uploadFileToDrive(payload.imageBase64, payload.title + ".jpg", payload.folderId);
    return jsonResponse({ success: true, url: url });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// 9. SETUP DATABASE PERTAMA KALI
// =========================================================================
function SETUP_PERTAMA_KALI() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  let sPengaturan = ss.getSheetByName(SHEET_PENGATURAN) || ss.insertSheet(SHEET_PENGATURAN);
  if (sPengaturan.getLastRow() === 0) {
    sPengaturan.appendRow(['Key', 'Value']);
    sPengaturan.appendRow(['PASSWORD', 'admin123']);
    sPengaturan.appendRow(['YOUTUBE_URL', 'https://www.youtube.com/embed/videoseries?list=UUaTPS74NOHACRYU0zInVZ4g']);
    sPengaturan.appendRow(['HERO_IMAGE_URL', './pisgahgedung.png']);
    sPengaturan.appendRow(['PENGUMUMAN_DATA', JSON.stringify({ header: "Pengumuman", isi: "" })]);
    sPengaturan.appendRow(['KATEGORI_PEJABAT', JSON.stringify(["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"])]);
    sPengaturan.getRange("A1:B1").setFontWeight("bold");
  }

  let sPejabat = ss.getSheetByName(SHEET_PEJABAT) || ss.insertSheet(SHEET_PEJABAT);
  if (sPejabat.getLastRow() === 0) {
    sPejabat.appendRow(['ID', 'Jabatan', 'Nama', 'WA', 'Image Base64', 'Kategori']);
    sPejabat.getRange("A1:F1").setFontWeight("bold");
  }

  let sWarta = ss.getSheetByName(SHEET_WARTA) || ss.insertSheet(SHEET_WARTA);
  if (sWarta.getLastRow() === 0) {
    sWarta.appendRow(['Tanggal', 'Judul', 'Isi', 'Gambar URL', 'Penulis']);
    sWarta.getRange("A1:E1").setFontWeight("bold");
  }

  // BIKIN TAB-TAB JADWAL DENGAN HEADER HORIZONTAL ('Tanggal' Saja)
  Object.values(CATEGORY_MAP).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Tanggal']);
      sheet.getRange("A1").setFontWeight("bold");
    }
  });

  Logger.log("SETUP BERHASIL! Format Excel Horizontal (Tugas di Header, Nama di Bawahnya) sudah disiapkan.");
}