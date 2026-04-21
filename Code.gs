// =========================================================================
// 1. KONFIGURASI UTAMA
// =========================================================================

// WAJIB DIGANTI: Masukkan ID Spreadsheet dan ID Folder Google Drive Anda di sini
const SPREADSHEET_ID = '1A2CnyZkwVQDPxnHaLgYexSoVmh8IwWsRByWapgy6f58'; 
const FOLDER_GALERI_ID = '1AutGgLJM0AHZhYWGyfrD6TJQ1xpg97fm';

// Nama-nama Sheet di Database
const SHEET_PENGATURAN = 'Pengaturan';
const SHEET_PEJABAT = 'Pejabat';
const SHEET_WARTA = 'Warta';
const SHEET_JADWAL = 'Jadwal';


// =========================================================================
// 2. ROUTING UTAMA (doGet & doPost)
// =========================================================================

function doGet(e) {
  // Endpoint untuk mengambil seluruh data saat aplikasi pertama kali dimuat
  if (e.parameter.action === 'getData' || !e.parameter.action) {
    return getInitialData();
  }
  return jsonResponse({ success: false, message: 'Action doGet tidak valid.' });
}

function doPost(e) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    // A. Aksi Publik (Tanpa perlu verifikasi password)
    if (action === 'getPublicFolders') return getPublicFolders();
    if (action === 'getPublicImages') return getPublicImages(payload.folderId);
    if (action === 'verifyPassword') return verifyPassword(payload.password);

    // B. Verifikasi Keamanan Admin
    const currentPassword = getSetting('PASSWORD') || 'admin123';
    if (payload.password !== currentPassword && action !== 'changePassword') {
      return jsonResponse({ success: false, message: 'Akses Ditolak: Password salah.' });
    }

    // C. Aksi Admin (Membutuhkan password valid)
    switch (action) {
      // -- Pengaturan Admin --
      case 'changePassword':     return changePassword(payload.oldPassword, payload.newPassword);
      case 'saveYoutubeUrl':     return saveSetting('YOUTUBE_URL', payload.url);
      case 'saveHeroImage':      return saveSetting('HERO_IMAGE_URL', payload.url);
      case 'savePengumuman':     return saveSetting('PENGUMUMAN_DATA', payload.pengumuman);
      
      // -- Manajemen Konten --
      case 'saveJadwal':         return saveJadwal(payload.tanggal, payload.data);
      case 'savePejabat':        return savePejabat(payload.data, payload.kategoriPejabat);
      
      // -- Warta --
      case 'saveWarta':          return saveWarta(payload);
      case 'updateWarta':        return updateWarta(payload);
      case 'deleteWarta':        return deleteWarta(payload.rowIndex);
      
      // -- Galeri & Drive --
      case 'listImageFolders':   return getPublicFolders(); // Alias untuk frontend admin
      case 'createImageFolder':  return createImageFolder(payload.folderName);
      case 'uploadImageToDrive': return uploadImageToDrive(payload.folderId, payload.title, payload.imageBase64);
      case 'deleteImage':        return deleteImage(payload.fileId);

      default:
        return jsonResponse({ success: false, message: 'Action doPost tidak dikenali.' });
    }
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  }
}


// =========================================================================
// 3. FUNGSI DATABASE (GETTER UTAMA)
// =========================================================================

function getInitialData() {
  return jsonResponse({
    success: true,
    dataPejabat: getPejabatDB(),
    jadwalDB: getJadwalDB(),
    kategoriPejabat: getKategoriDB(),
    youtubeUrl: getSetting('YOUTUBE_URL') || "https://www.youtube.com/embed/EAO55pnNsgs",
    heroImageUrl: getSetting('HERO_IMAGE_URL') || "./pisgahgedung.png",
    pengumuman: getSetting('PENGUMUMAN_DATA') || JSON.stringify({ header: "Pengumuman", isi: "" }),
    daftarWarta: getDaftarWarta()
  });
}


// =========================================================================
// 4. HANDLER WARTA
// =========================================================================

function getDaftarWarta() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_WARTA);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const wartaList = [];
  for (let i = 1; i < data.length; i++) {
    wartaList.push({
      rowIndex: i + 1,
      tanggal: data[i][0] ? Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), "dd MMM yyyy") : '',
      judul: data[i][1] || '',
      isi: data[i][2] || '',
      gambarUrl: data[i][3] || '',
      penulis: data[i][4] || ''
    });
  }
  return wartaList;
}

function saveWarta(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_WARTA) || ss.insertSheet(SHEET_WARTA);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Tanggal', 'Judul', 'Isi', 'Gambar URL', 'Penulis']);
  }
  
  let gambarUrl = payload.gambarUrl || "";
  // Jika gambar berupa base64, simpan ke drive agar sheet tidak berat
  if (gambarUrl.startsWith('data:image')) {
    gambarUrl = uploadBase64ToWartaFolder(gambarUrl, "Warta_" + Date.now());
  }

  sheet.appendRow([ new Date(), payload.judul, payload.isi, gambarUrl, payload.penulis ]);
  return jsonResponse({ success: true });
}

function updateWarta(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  if (!sheet) return jsonResponse({ success: false, message: "Sheet Warta tidak ditemukan." });

  let gambarUrl = payload.gambarUrl || "";
  if (gambarUrl.startsWith('data:image')) {
    gambarUrl = uploadBase64ToWartaFolder(gambarUrl, "Warta_" + Date.now());
  }

  sheet.getRange(payload.rowIndex, 2).setValue(payload.judul);
  sheet.getRange(payload.rowIndex, 3).setValue(payload.isi);
  sheet.getRange(payload.rowIndex, 4).setValue(gambarUrl);
  sheet.getRange(payload.rowIndex, 5).setValue(payload.penulis);
  return jsonResponse({ success: true });
}

function deleteWarta(rowIndex) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  if (sheet) sheet.deleteRow(rowIndex);
  return jsonResponse({ success: true });
}


// =========================================================================
// 5. HANDLER JADWAL & PEJABAT
// =========================================================================

function getJadwalDB() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_JADWAL);
  if (!sheet) return {};

  const data = sheet.getDataRange().getValues();
  let db = {};
  for (let i = 1; i < data.length; i++) {
    try {
      if (data[i][0] && data[i][1]) db[data[i][0]] = JSON.parse(data[i][1]);
    } catch (e) { console.error("Error parse jadwal baris", i); }
  }
  return db;
}

function saveJadwal(tanggal, dataObj) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_JADWAL);
  const data = sheet.getDataRange().getValues();
  let found = false;

  const jsonString = JSON.stringify(dataObj);

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === tanggal) {
      sheet.getRange(i + 1, 2).setValue(jsonString);
      found = true;
      break;
    }
  }
  if (!found) sheet.appendRow([tanggal, jsonString]);
  return jsonResponse({ success: true });
}

function getPejabatDB() {
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
        kategori: data[i][5] || "Lainnya"
      });
    }
  }
  return result;
}

function savePejabat(dataPejabat, kategoriPejabat) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PEJABAT);
  sheet.clear();
  sheet.appendRow(['ID', 'Jabatan', 'Nama', 'WA', 'Image Base64', 'Kategori']);
  
  if (dataPejabat && dataPejabat.length > 0) {
    const rows = dataPejabat.map(p => [p.id, p.jabatan, p.nama, "'" + p.wa, p.img, p.kategori]);
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  // Simpan kategori terbaru ke pengaturan
  saveSettingRecord('KATEGORI_PEJABAT', JSON.stringify(kategoriPejabat));
  return jsonResponse({ success: true });
}

function getKategoriDB() {
  const val = getSetting('KATEGORI_PEJABAT');
  if (val) {
    try { return JSON.parse(val); } catch(e) {}
  }
  return ["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"];
}


// =========================================================================
// 6. HANDLER PENGATURAN UMUM
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
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      found = true;
      break;
    }
  }
  if (!found) sheet.appendRow([key, value]);
}

function saveSetting(key, value) {
  saveSettingRecord(key, value);
  return jsonResponse({ success: true });
}

function verifyPassword(pass) {
  const currentPass = getSetting('PASSWORD') || 'admin123';
  return jsonResponse({ success: pass === currentPass });
}

function changePassword(oldPass, newPass) {
  const currentPass = getSetting('PASSWORD') || 'admin123';
  if (oldPass === currentPass) {
    saveSettingRecord('PASSWORD', newPass);
    return jsonResponse({ success: true });
  }
  return jsonResponse({ success: false, message: 'Password lama salah.' });
}


// =========================================================================
// 7. HANDLER MEDIA GALERI (GOOGLE DRIVE)
// =========================================================================

function getPublicFolders() {
  const folders = [];
  try {
    const parent = DriveApp.getFolderById(FOLDER_GALERI_ID);
    const subFolders = parent.getFolders();
    while (subFolders.hasNext()) {
      const f = subFolders.next();
      folders.push({ id: f.getId(), name: f.getName() });
    }
    folders.sort((a, b) => a.name.localeCompare(b.name));
    return jsonResponse({ success: true, folders: folders });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function getPublicImages(folderId) {
  const media = [];
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getMimeType();
      const isVideo = mimeType.startsWith('video/');
      const isImage = mimeType.startsWith('image/');
      
      if (isImage || isVideo) {
        media.push({
          id: file.getId(),
          title: file.getName(),
          url: file.getUrl(),
          thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w500-h500`,
          type: isVideo ? 'video' : 'image'
        });
      }
    }
    return jsonResponse({ success: true, media: media });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function createImageFolder(folderName) {
  try {
    const parent = DriveApp.getFolderById(FOLDER_GALERI_ID);
    const newFolder = parent.createFolder(folderName);
    newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return jsonResponse({ success: true, folderId: newFolder.getId() });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function uploadImageToDrive(folderId, title, base64Data) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const splitBase = base64Data.split(',');
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    
    // Tentukan ekstensi file
    let ext = "";
    if (type.includes("jpeg") || type.includes("jpg")) ext = ".jpg";
    else if (type.includes("png")) ext = ".png";
    else if (type.includes("mp4")) ext = ".mp4";
    else if (type.includes("video")) ext = ".mp4";
    
    const fileName = title + ext;
    const blob = Utilities.newBlob(byteCharacters, type, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return jsonResponse({ success: true, fileId: file.getId(), url: file.getUrl() });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function deleteImage(fileId) {
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

// Utility: Upload gambar warta ke subfolder di dalam Galeri
function uploadBase64ToWartaFolder(base64Data, fileName) {
  try {
    const parent = DriveApp.getFolderById(FOLDER_GALERI_ID);
    const folders = parent.getFoldersByName("Warta_Images");
    const folder = folders.hasNext() ? folders.next() : parent.createFolder("Warta_Images");
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const splitBase = base64Data.split(',');
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    const blob = Utilities.newBlob(byteCharacters, type, fileName + ".jpg");

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    // Return URL yang ramah untuk tag <img>
    return `https://drive.google.com/uc?export=view&id=${file.getId()}`;
  } catch (e) {
    return ""; // Fallback kosong jika gagal
  }
}


// =========================================================================
// 8. FUNGSI UTILITIES
// =========================================================================

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


// =========================================================================
// 9. SETUP DATABASE PERTAMA KALI
// =========================================================================
// Jalankan fungsi ini SECARA MANUAL 1 KALI SAJA dari editor script
// untuk membuat semua sheet (tab) yang dibutuhkan agar tidak error.

function SETUP_PERTAMA_KALI() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Setup Pengaturan
  let sPengaturan = ss.getSheetByName(SHEET_PENGATURAN) || ss.insertSheet(SHEET_PENGATURAN);
  if (sPengaturan.getLastRow() === 0) {
    sPengaturan.appendRow(['Key', 'Value']);
    sPengaturan.appendRow(['PASSWORD', 'admin123']);
    sPengaturan.appendRow(['YOUTUBE_URL', 'https://www.youtube.com/embed/EAO55pnNsgs']);
    sPengaturan.appendRow(['HERO_IMAGE_URL', './pisgahgedung.png']);
    sPengaturan.appendRow(['PENGUMUMAN_DATA', JSON.stringify({ header: "Pengumuman", isi: "" })]);
    sPengaturan.appendRow(['KATEGORI_PEJABAT', JSON.stringify(["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"])]);
    sPengaturan.getRange("A1:B1").setFontWeight("bold");
  }

  // 2. Setup Pejabat
  let sPejabat = ss.getSheetByName(SHEET_PEJABAT) || ss.insertSheet(SHEET_PEJABAT);
  if (sPejabat.getLastRow() === 0) {
    sPejabat.appendRow(['ID', 'Jabatan', 'Nama', 'WA', 'Image Base64', 'Kategori']);
    sPejabat.getRange("A1:F1").setFontWeight("bold");
  }

  // 3. Setup Jadwal
  let sJadwal = ss.getSheetByName(SHEET_JADWAL) || ss.insertSheet(SHEET_JADWAL);
  if (sJadwal.getLastRow() === 0) {
    sJadwal.appendRow(['Tanggal', 'Data JSON']);
    sJadwal.getRange("A1:B1").setFontWeight("bold");
  }

  // 4. Setup Warta
  let sWarta = ss.getSheetByName(SHEET_WARTA) || ss.insertSheet(SHEET_WARTA);
  if (sWarta.getLastRow() === 0) {
    sWarta.appendRow(['Tanggal', 'Judul', 'Isi', 'Gambar URL', 'Penulis']);
    sWarta.getRange("A1:E1").setFontWeight("bold");
  }

  Logger.log("SETUP BERHASIL! Database siap digunakan.");
}