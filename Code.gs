// =========================================================================
// 1. KONFIGURASI UTAMA
// =========================================================================

// WAJIB DIGANTI: Masukkan ID Spreadsheet dan ID Folder Google Drive Anda di sini
const SPREADSHEET_ID = '1pm4Bp_vmPixR-n0BDxrrisMJVo-BDMI5osxEXR0Rii8'; 
const FOLDER_GALERI_ID = '1AutGgLJM0AHZhYWGyfrD6TJQ1xpg97fm';

// Nama-nama Sheet di Database
const SHEET_PENGATURAN = 'Pengaturan';
const SHEET_PEJABAT = 'Pejabat';
const SHEET_WARTA = 'Warta';

// Kategori Sheet Jadwal
const CATEGORY_MAP = {
  'Ibadah Rabu': 'Jadwal_Rabu',
  'Sekolah Sabat': 'Jadwal_SS',
  'Khotbah': 'Jadwal_Khotbah',
  'Diakon': 'Jadwal_Diakon',
  'Musik': 'Jadwal_Musik',
  'Perjamuan': 'Jadwal_Perjamuan',
  'Susunan Acara': 'Jadwal_Susunan'
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
// 2. ROUTING UTAMA (doGet & doPost)
// =========================================================================

function doGet(e) {
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

    // A. Aksi Publik
    if (action === 'getPublicFolders') return getPublicFolders();
    if (action === 'getPublicImages') return getPublicImages(payload.folderId);
    if (action === 'verifyPassword') return verifyPassword(payload.password);

    // B. Verifikasi Keamanan Admin
    const currentPassword = getSetting('PASSWORD') || 'admin123';
    if (payload.password !== currentPassword && action !== 'changePassword') {
      return jsonResponse({ success: false, message: 'Akses Ditolak: Password salah.' });
    }

    // C. Aksi Admin
    switch (action) {
      case 'changePassword':     return changePassword(payload.oldPassword, payload.newPassword);
      case 'saveYoutubeUrl':     return saveSetting('YOUTUBE_URL', payload.url);
      case 'saveHeroImage':      return saveSetting('HERO_IMAGE_URL', payload.url);
      case 'savePengumuman':     return saveSetting('PENGUMUMAN_DATA', payload.pengumuman);
      
      // -- Manajemen Konten --
      case 'saveJadwal':         return saveJadwal(payload.tanggal, payload.tableData);
      case 'savePejabat':        return savePejabat(payload.data, payload.kategoriPejabat);
      
      // -- Warta --
      case 'saveWarta':          return saveWarta(payload);
      case 'updateWarta':        return updateWarta(payload);
      case 'deleteWarta':        return deleteWarta(payload.rowIndex);
      
      // -- Galeri --
      case 'listImageFolders':   return getPublicFolders();
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
    youtubeUrl: getSetting('YOUTUBE_URL') || "https://www.youtube.com/embed/videoseries?list=UUaTPS74NOHACRYU0zInVZ4g",
    heroImageUrl: getSetting('HERO_IMAGE_URL') || "./hero-default.png",
    pengumuman: getSetting('PENGUMUMAN_DATA') || JSON.stringify({ header: "Pengumuman", isi: "" }),
    daftarWarta: getDaftarWarta()
  });
}


// =========================================================================
// 4. HANDLER WARTA & PEJABAT
// =========================================================================
// (Fungsi Warta dan Pejabat tetap sama, disembunyikan logikanya untuk menjaga fungsionalitas)

function getDaftarWarta() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const wartaList = [];
  for (let i = 1; i < data.length; i++) {
    wartaList.push({
      rowIndex: i + 1,
      tanggal: data[i][0] ? Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), "dd MMM yyyy") : '',
      judul: data[i][1] || '', isi: data[i][2] || '', gambarUrl: data[i][3] || '', penulis: data[i][4] || ''
    });
  }
  return wartaList;
}

function saveWarta(payload) {
  let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  let gambarUrl = payload.gambarUrl || "";
  if (gambarUrl.startsWith('data:image')) gambarUrl = uploadBase64ToWartaFolder(gambarUrl, "Warta_" + Date.now());
  sheet.appendRow([ new Date(), payload.judul, payload.isi, gambarUrl, payload.penulis ]);
  return jsonResponse({ success: true });
}

function updateWarta(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  let gambarUrl = payload.gambarUrl || "";
  if (gambarUrl.startsWith('data:image')) gambarUrl = uploadBase64ToWartaFolder(gambarUrl, "Warta_" + Date.now());
  sheet.getRange(payload.rowIndex, 2).setValue(payload.judul);
  sheet.getRange(payload.rowIndex, 3).setValue(payload.isi);
  sheet.getRange(payload.rowIndex, 4).setValue(gambarUrl);
  sheet.getRange(payload.rowIndex, 5).setValue(payload.penulis);
  return jsonResponse({ success: true });
}

function deleteWarta(rowIndex) {
  SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA).deleteRow(rowIndex);
  return jsonResponse({ success: true });
}

function getPejabatDB() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PEJABAT);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  let result = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) result.push({ id: data[i][0], jabatan: data[i][1], nama: data[i][2], wa: data[i][3], img: data[i][4], kategori: data[i][5] || "Lainnya" });
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
  saveSettingRecord('KATEGORI_PEJABAT', JSON.stringify(kategoriPejabat));
  return jsonResponse({ success: true });
}

function getKategoriDB() {
  const val = getSetting('KATEGORI_PEJABAT');
  if (val) { try { return JSON.parse(val); } catch(e) {} }
  return ["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"];
}


// =========================================================================
// 5. HANDLER JADWAL (TERPISAH PER KATEGORI SHEET)
// =========================================================================

function getJadwalDB() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let db = {};

  // Loop setiap sheet kategori jadwal
  for (const [sheetName, jsonKey] of Object.entries(CATEGORY_MAP_REV)) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;

    const data = sheet.getDataRange().getValues();
    
    // Mulai dari baris ke-2 (Baris 1 adalah Header)
    for (let i = 1; i < data.length; i++) {
      let tanggal = data[i][0];
      if (!tanggal) continue;
      
      // Normalisasi format tanggal (YYYY-MM-DD)
      if (tanggal instanceof Date) {
        tanggal = Utilities.formatDate(tanggal, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        tanggal = String(tanggal);
      }

      const tugas = data[i][1];    // Kolom B: Tugas/Item
      let nama = data[i][2];       // Kolom C: Nama Petugas/Nilai
      
      // Buat kerangka tanggal jika belum ada
      if (!db[tanggal]) {
        const dateObj = new Date(tanggal + "T00:00:00");
        const isRabu = dateObj.getDay() === 3;
        
        db[tanggal] = {
          title: isRabu ? "Ibadah Permintaan Doa (Rabu)" : "Ibadah Sabat (Sabtu)",
          time: isRabu ? "19:30 WIB - selesai" : "10:00 - 13:00 WIB",
          sekolahSabatTime: "11:45 - 12:40 WIB",
          khotbahTime: "10:00 - 11:45 WIB",
          petugas: [], sekolahSabat: [], khotbah: [], diakon: [], musik: [], perjamuan: [], susunan: {}
        };
      }

      // Masukkan data ke properti yang tepat sesuai nama Sheet-nya
      if (jsonKey === 'susunan') {
        if (nama === 'Ya' || nama === true) nama = true;
        else if (nama === 'Tidak' || nama === false) nama = false;
        db[tanggal].susunan[tugas] = nama;
      } else {
        db[tanggal][jsonKey].push({ tugas: tugas, nama: String(nama) });
      }
    }
  }
  
  return db;
}

function saveJadwal(tanggal, tableData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. Kelompokkan data yang masuk berdasarkan nama Sheet
  const groupedData = {};
  Object.values(CATEGORY_MAP).forEach(sheetName => groupedData[sheetName] = []);

  if (tableData && tableData.length > 0) {
    tableData.forEach(row => {
      const kategori = row[1]; // Kategori dari React ('Ibadah Rabu', 'Sekolah Sabat', dll)
      const sheetName = CATEGORY_MAP[kategori];
      
      if (sheetName) {
        // Simpan dalam format [Tanggal, Tugas, Nama]
        groupedData[sheetName].push([row[0], row[2], row[3]]);
      }
    });
  }

  // 2. Tulis data ke masing-masing Sheet
  for (const [sheetName, rows] of Object.entries(groupedData)) {
    let sheet = ss.getSheetByName(sheetName);
    
    // Buat sheet jika tidak sengaja terhapus
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Tanggal', 'Tugas/Item', 'Nama Petugas/Nilai']);
      sheet.getRange("A1:C1").setFontWeight("bold");
    }

    const data = sheet.getDataRange().getValues();

    // Hapus baris lama dengan TANGGAL YANG SAMA di sheet ini
    // Loop mundur agar indeks tidak bergeser saat baris dihapus
    for (let i = data.length - 1; i > 0; i--) {
      let rowDate = data[i][0];
      if (rowDate instanceof Date) {
        rowDate = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        rowDate = String(rowDate);
      }

      if (rowDate === tanggal) {
        sheet.deleteRow(i + 1); // +1 karena getValues base-0, deleteRow base-1
      }
    }

    // Append baris baru (jika ada) ke sheet ini
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }
  }

  return jsonResponse({ success: true });
}


// =========================================================================
// 6. HANDLER PENGATURAN UMUM & GALERI
// =========================================================================

function getSetting(key) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PENGATURAN);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) if (data[i][0] === key) return data[i][1];
  return null;
}

function saveSettingRecord(key, value) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PENGATURAN);
  const data = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) { sheet.getRange(i + 1, 2).setValue(value); found = true; break; }
  }
  if (!found) sheet.appendRow([key, value]);
}

function saveSetting(key, value) { saveSettingRecord(key, value); return jsonResponse({ success: true }); }
function verifyPassword(pass) { const currentPass = getSetting('PASSWORD') || 'admin123'; return jsonResponse({ success: pass === currentPass }); }

function changePassword(oldPass, newPass) {
  const currentPass = getSetting('PASSWORD') || 'admin123';
  if (oldPass === currentPass) { saveSettingRecord('PASSWORD', newPass); return jsonResponse({ success: true }); }
  return jsonResponse({ success: false, message: 'Password lama salah.' });
}

// (Fungsi Galeri tetap sama)
function getPublicFolders() {
  const folders = [];
  try {
    const parent = DriveApp.getFolderById(FOLDER_GALERI_ID);
    const subFolders = parent.getFolders();
    while (subFolders.hasNext()) { const f = subFolders.next(); folders.push({ id: f.getId(), name: f.getName() }); }
    folders.sort((a, b) => a.name.localeCompare(b.name)); return jsonResponse({ success: true, folders: folders });
  } catch (e) { return jsonResponse({ success: false, message: e.toString() }); }
}

function getPublicImages(folderId) {
  const media = [];
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next(); const mimeType = file.getMimeType();
      const isVideo = mimeType.startsWith('video/'); const isImage = mimeType.startsWith('image/');
      if (isImage || isVideo) media.push({ id: file.getId(), title: file.getName(), url: file.getUrl(), thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w500-h500`, type: isVideo ? 'video' : 'image' });
    }
    return jsonResponse({ success: true, media: media });
  } catch (e) { return jsonResponse({ success: false, message: e.toString() }); }
}

function createImageFolder(folderName) {
  try { DriveApp.getFolderById(FOLDER_GALERI_ID).createFolder(folderName).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); return jsonResponse({ success: true }); } 
  catch (e) { return jsonResponse({ success: false, message: e.toString() }); }
}

function uploadImageToDrive(folderId, title, base64Data) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const splitBase = base64Data.split(','); const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    let ext = ""; if (type.includes("jpeg") || type.includes("jpg")) ext = ".jpg"; else if (type.includes("png")) ext = ".png"; else if (type.includes("mp4") || type.includes("video")) ext = ".mp4";
    const file = folder.createFile(Utilities.newBlob(byteCharacters, type, title + ext));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return jsonResponse({ success: true, fileId: file.getId(), url: file.getUrl() });
  } catch (e) { return jsonResponse({ success: false, message: e.toString() }); }
}

function deleteImage(fileId) {
  try { DriveApp.getFileById(fileId).setTrashed(true); return jsonResponse({ success: true }); } 
  catch (e) { return jsonResponse({ success: false, message: e.toString() }); }
}

function uploadBase64ToWartaFolder(base64Data, fileName) {
  try {
    const parent = DriveApp.getFolderById(FOLDER_GALERI_ID);
    const folders = parent.getFoldersByName("Warta_Images");
    const folder = folders.hasNext() ? folders.next() : parent.createFolder("Warta_Images");
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

  // BIKIN TAB-TAB JADWAL SECARA TERPISAH
  Object.values(CATEGORY_MAP).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Tanggal', 'Tugas/Item', 'Nama Petugas/Nilai']);
      sheet.getRange("A1:C1").setFontWeight("bold");
    }
  });

  Logger.log("SETUP BERHASIL! Database dipisah ke dalam Sheet Jadwal_... dengan rapi.");
}