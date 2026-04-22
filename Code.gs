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
// 2. FUNGSI UTAMA API (GET & POST)
// =========================================================================

function doGet(e) {
  let action = e.parameter.action;
  
  if (action === 'getWarta') {
    return jsonResponse({ success: true, data: getWarta() });
  }

  // Default: Ambil semua data untuk inisialisasi aplikasi
  return jsonResponse({
    success: true,
    youtubeUrl: getSetting('YOUTUBE_URL') || "",
    heroImageUrl: getSetting('HERO_IMAGE_URL') || "[]",
    pengumuman: JSON.parse(getSetting('PENGUMUMAN_DATA') || '{"header":"Pengumuman","isi":""}'),
    kategoriPejabat: JSON.parse(getSetting('KATEGORI_PEJABAT') || '["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"]'),
    dataPejabat: getDataPejabat(),
    jadwalDB: getJadwalDB(),
    daftarWarta: getWarta()
  });
}

function doPost(e) {
  try {
    let payload = JSON.parse(e.postData.contents);
    let action = payload.action;

    // Cek Password (Kecuali aksi login)
    let currentPassword = getSetting('PASSWORD') || 'admin123';
    if (action !== 'login' && payload.password !== currentPassword) {
      return jsonResponse({ success: false, message: 'Password salah atau sesi kadaluarsa.' });
    }

    switch (action) {
      case 'login':              return jsonResponse({ success: payload.password === currentPassword });
      case 'changePassword':     return changePassword(payload.oldPassword, payload.newPassword);
      case 'saveYoutubeUrl':     return saveSettingRecord('YOUTUBE_URL', payload.url);
      case 'saveHeroImage':      return saveHeroImages(payload.url); // Memanggil fungsi upload khusus
      case 'savePengumuman':     return saveSettingRecord('PENGUMUMAN_DATA', JSON.stringify(payload.pengumuman));
      case 'savePejabat':        return savePejabat(payload);
      case 'saveJadwal':         return saveJadwal(payload);
      case 'saveWarta':          return saveWarta(payload);
      case 'updateWarta':        return updateWarta(payload);
      case 'deleteWarta':        return deleteWarta(payload.rowIndex);
      case 'uploadImageToDrive': return uploadImageToDrive(payload);
      case 'deleteImage':        return deleteImage(payload.fileId);
      default:                   return jsonResponse({ success: false, message: 'Aksi tidak valid' });
    }
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  }
}

// =========================================================================
// 3. FUNGSI PENGATURAN & AUTHENTIKASI
// =========================================================================

function getSetting(key) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PENGATURAN);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return null;
}

function saveSettingRecord(key, value) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PENGATURAN);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return jsonResponse({ success: true });
    }
  }
  sheet.appendRow([key, value]);
  return jsonResponse({ success: true });
}

function changePassword(oldPassword, newPassword) {
  let current = getSetting('PASSWORD') || 'admin123';
  if (oldPassword === current) {
    saveSettingRecord('PASSWORD', newPassword);
    return jsonResponse({ success: true });
  }
  return jsonResponse({ success: false, message: 'Password lama salah!' });
}

// =========================================================================
// 4. FUNGSI PENGAMBILAN DATA (GETTERS)
// =========================================================================

function getDataPejabat() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PEJABAT);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  let result = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      result.push({
        id: data[i][0],
        jabatan: data[i][1],
        nama: data[i][2],
        wa: data[i][3],
        img: data[i][4],
        kategori: data[i][5] || 'Lainnya'
      });
    }
  }
  return result;
}

function getWarta() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  let result = [];
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1]) { // Pastikan judul ada
      result.push({
        rowIndex: i + 1,
        tanggal: Utilities.formatDate(new Date(data[i][0]), "Asia/Jakarta", "dd MMMM yyyy"),
        judul: data[i][1],
        isi: data[i][2],
        gambarUrl: data[i][3] || "",
        penulis: data[i][4] || "Admin"
      });
    }
  }
  return result;
}

function getJadwalDB() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let db = {};

  Object.entries(CATEGORY_MAP).forEach(([jsonKey, sheetName]) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return; 

    const headers = data[0]; 
    
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row[0]) continue; 
      
      let dateStr;
      try {
        let d = new Date(row[0]);
        let m = d.getMonth() + 1;
        let day = d.getDate();
        dateStr = `${d.getFullYear()}-${m < 10 ? '0'+m : m}-${day < 10 ? '0'+day : day}`;
      } catch(e) { continue; }

      if (!db[dateStr]) db[dateStr] = {};
      
      if (jsonKey === 'susunanAcara') {
        if (!db[dateStr].susunan) db[dateStr].susunan = {};
        for (let c = 1; c < headers.length; c++) {
          if (headers[c]) {
            let val = row[c];
            if (val === 'Ya' || val === true || val === 'TRUE') val = true;
            if (val === 'Tidak' || val === false || val === 'FALSE') val = false;
            db[dateStr].susunan[headers[c]] = val;
          }
        }
      } else {
        let arr = [];
        for (let c = 1; c < headers.length; c++) {
          if (headers[c]) {
            arr.push({ tugas: headers[c], nama: row[c] || "" });
          }
        }
        db[dateStr][jsonKey] = arr;
      }
    }
  });

  return db;
}

// =========================================================================
// 5. FUNGSI PENYIMPANAN DATA (SETTERS)
// =========================================================================

function savePejabat(payload) {
  try {
    let pejabatArray = payload.data;
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PEJABAT);
    
    // Simpan semua pejabat ke sheet
    sheet.clearContents();
    sheet.appendRow(['ID', 'Jabatan', 'Nama', 'WA', 'Image Base64', 'Kategori']);
    pejabatArray.forEach(p => {
      sheet.appendRow([p.id, p.jabatan, p.nama, p.wa, p.img, p.kategori]);
    });
    
    saveSettingRecord('KATEGORI_PEJABAT', JSON.stringify(payload.kategoriPejabat));
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function saveJadwal(payload) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const dateStr = payload.tanggal; 
    const tableData = payload.tableData; 
    
    let organized = {};
    tableData.forEach(row => {
      let sectionName = row[1];
      let colHeader = row[2];
      let colValue = row[3];
      if (!organized[sectionName]) organized[sectionName] = {};
      organized[sectionName][colHeader] = colValue;
    });

    Object.entries(organized).forEach(([sectionName, columnsObj]) => {
      let sheetName = "";
      if (sectionName === 'Ibadah Rabu') sheetName = CATEGORY_MAP['rabu'];
      else if (sectionName === 'Sekolah Sabat') sheetName = CATEGORY_MAP['sekolahSabat'];
      else if (sectionName === 'Khotbah') sheetName = CATEGORY_MAP['khotbah'];
      else if (sectionName === 'Diakon') sheetName = CATEGORY_MAP['diakon'];
      else if (sectionName === 'Musik') sheetName = CATEGORY_MAP['musik'];
      else if (sectionName === 'Perjamuan') sheetName = CATEGORY_MAP['perjamuan'];
      else if (sectionName === 'Susunan Acara') sheetName = CATEGORY_MAP['susunanAcara'];

      if (sheetName) {
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
           sheet = ss.insertSheet(sheetName);
           sheet.appendRow(['Tanggal']);
        }
        
        let data = sheet.getDataRange().getValues();
        let headers = data[0];
        
        // Update headers if needed
        Object.keys(columnsObj).forEach(colName => {
          if (headers.indexOf(colName) === -1) {
            headers.push(colName);
            sheet.getRange(1, headers.length).setValue(colName);
          }
        });

        // Cari baris tanggal
        let targetRowIndex = -1;
        for (let r = 1; r < data.length; r++) {
          if (!data[r][0]) continue;
          let d = new Date(data[r][0]);
          let m = d.getMonth() + 1;
          let day = d.getDate();
          let rowDateStr = `${d.getFullYear()}-${m < 10 ? '0'+m : m}-${day < 10 ? '0'+day : day}`;
          if (rowDateStr === dateStr) {
            targetRowIndex = r + 1;
            break;
          }
        }

        if (targetRowIndex === -1) {
          targetRowIndex = sheet.getLastRow() + 1;
          sheet.getRange(targetRowIndex, 1).setValue(dateStr);
        }

        // Tulis nilai
        Object.entries(columnsObj).forEach(([colName, colVal]) => {
          let colIndex = headers.indexOf(colName) + 1;
          sheet.getRange(targetRowIndex, colIndex).setValue(colVal);
        });
      }
    });

    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function saveWarta(payload) {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
    sheet.appendRow([ new Date(), payload.judul, payload.isi, payload.gambarUrl || "", payload.penulis ]);
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function updateWarta(payload) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
    sheet.getRange(payload.rowIndex, 2).setValue(payload.judul);
    sheet.getRange(payload.rowIndex, 3).setValue(payload.isi);
    sheet.getRange(payload.rowIndex, 4).setValue(payload.gambarUrl || "");
    sheet.getRange(payload.rowIndex, 5).setValue(payload.penulis);
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function deleteWarta(rowIndex) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
    sheet.deleteRow(rowIndex);
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

// =========================================================================
// 6. FUNGSI UPLOAD GAMBAR KE GOOGLE DRIVE
// =========================================================================

function uploadImageToDrive(payload) {
  try {
    // Ambil target folder dari payload, jika kosong gunakan FOLDER_GALERI_ID bawaan
    const targetFolderId = payload.folderId || FOLDER_GALERI_ID; 
    let folder;
    
    // CEGAH ERROR: Jika ID Folder kosong, jangan panggil getFolderById
    if (!targetFolderId || targetFolderId.trim() === "") {
        const folders = DriveApp.getFoldersByName("PISGAH_GALERI_UPLOADS");
        folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("PISGAH_GALERI_UPLOADS");
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } else {
        try {
            folder = DriveApp.getFolderById(targetFolderId);
        } catch(err) {
            // Buat folder backup otomatis jika folder utama terhapus/gagal/tidak valid
            const folders = DriveApp.getFoldersByName("PISGAH_GALERI_UPLOADS");
            folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("PISGAH_GALERI_UPLOADS");
            folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        }
    }

    const base64Data = payload.imageBase64;
    const splitBase = base64Data.split(','); 
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    
    // Tentukan ekstensi file
    let ext = ""; 
    if (type.includes("jpeg") || type.includes("jpg")) ext = ".jpg"; 
    else if (type.includes("png")) ext = ".png"; 
    else if (type.includes("mp4") || type.includes("video")) ext = ".mp4";
    else ext = ".webp";

    // Beri nama file
    const title = payload.title || ("IMG_" + Math.random().toString(36).substr(2, 4).toUpperCase());
    
    // Simpan ke Drive
    const file = folder.createFile(Utilities.newBlob(byteCharacters, type, title + ext));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // FORMAT PENTING: Selalu kembalikan Direct Link agar bisa dirender pada tag <img>
    const directUrl = "https://drive.google.com/uc?export=view&id=" + file.getId();
    
    return jsonResponse({ success: true, fileId: file.getId(), url: directUrl });
  } catch (e) { 
    return jsonResponse({ success: false, message: e.toString() }); 
  }
}

function deleteImage(fileId) {
  try { DriveApp.getFileById(fileId).setTrashed(true); return jsonResponse({ success: true }); } 
  catch (e) { return jsonResponse({ success: false, message: e.toString() }); }
}

function saveHeroImages(jsonStringArray) {
  try {
    let images = JSON.parse(jsonStringArray);
    let updatedImages = [];

    // OPTIMASI: Cari atau buat folder "Hero_Images" SEKALI SAJA di luar loop 
    // agar proses eksekusi berpuluh kali lipat lebih cepat.
    let folder;
    try {
      const parent = DriveApp.getFolderById(FOLDER_GALERI_ID);
      const folders = parent.getFoldersByName("Hero_Images");
      folder = folders.hasNext() ? folders.next() : parent.createFolder("Hero_Images");
    } catch(err) {
      const folders = DriveApp.getFoldersByName("Hero_Images");
      folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("Hero_Images");
    }
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    for (let i = 0; i < images.length; i++) {
      let img = images[i];
      if (img.startsWith('data:image')) {
        let shortId = Math.random().toString(36).substr(2, 4).toUpperCase();
        let fileName = "HERO_" + shortId; 
        
        // Panggil fungsi upload yang lebih ringan
        let url = uploadBase64ToFolderOptimized(folder, img, fileName);
        if (url) updatedImages.push(url);
      } else {
        updatedImages.push(img);
      }
    }
    
    saveSettingRecord('HERO_IMAGE_URL', JSON.stringify(updatedImages));
    return jsonResponse({ success: true, updatedUrls: updatedImages });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

// Fungsi upload baru yang lebih singkat karena folder sudah disediakan
function uploadBase64ToFolderOptimized(folder, base64Data, fileName) {
  try {
    const splitBase = base64Data.split(','); 
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(splitBase[1]), type, fileName + ".jpg"));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return `https://drive.google.com/uc?export=view&id=${file.getId()}`;
  } catch (e) { return ""; }
}

function uploadBase64ToWartaFolder(base64Data, fileName) {
  try {
    let folder;
    try {
      const parent = DriveApp.getFolderById(FOLDER_GALERI_ID);
      const folders = parent.getFoldersByName("Warta_Images");
      folder = folders.hasNext() ? folders.next() : parent.createFolder("Warta_Images");
    } catch(err) {
      const folders = DriveApp.getFoldersByName("Warta_Images");
      folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("Warta_Images");
    }
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const splitBase = base64Data.split(','); const type = splitBase[0].split(';')[0].replace('data:', '');
    const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(splitBase[1]), type, fileName + ".jpg"));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return `https://drive.google.com/uc?export=view&id=${file.getId()}`;
  } catch (e) { return ""; }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// 7. SETUP DATABASE PERTAMA KALI
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