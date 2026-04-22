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
      case 'saveHeroImage':      return saveHeroImages(payload.url);
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
  if (gambarUrl.startsWith('data:image')) {
    let shortId = Math.random().toString(36).substr(2, 4).toUpperCase();
    gambarUrl = uploadBase64ToWartaFolder(gambarUrl, "WRT_" + shortId);
  }
  sheet.appendRow([ new Date(), payload.judul, payload.isi, gambarUrl, payload.penulis ]);
  return jsonResponse({ success: true });
}

function updateWarta(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  let gambarUrl = payload.gambarUrl || "";
  if (gambarUrl.startsWith('data:image')) {
    let shortId = Math.random().toString(36).substr(2, 4).toUpperCase();
    gambarUrl = uploadBase64ToWartaFolder(gambarUrl, "WRT_" + shortId);
  }
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
// 5. HANDLER JADWAL (TERPISAH PER KATEGORI & HORIZONTAL EXCEL-STYLE)
// =========================================================================

function getJadwalDB() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let db = {};

  // Loop setiap sheet kategori jadwal
  for (const [sheetName, jsonKey] of Object.entries(CATEGORY_MAP_REV)) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) continue; // Skip jika hanya ada header atau kosong

    const headers = data[0]; // Baris pertama adalah Kolom Tugas (cth: Tanggal, Pemimpin, Doa Buka...)
    
    // Mulai dari baris ke-2 (Baris Data)
    for (let i = 1; i < data.length; i++) {
      let tanggal = data[i][0];
      if (!tanggal) continue;
      
      // Normalisasi format tanggal (YYYY-MM-DD)
      if (tanggal instanceof Date) {
        tanggal = Utilities.formatDate(tanggal, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        tanggal = String(tanggal);
      }
      
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

      // Loop kolom-kolom ke samping (Mulai dari indeks 1, karena 0 adalah Tanggal)
      for (let j = 1; j < headers.length; j++) {
        const tugas = headers[j];
        let nama = data[i][j];
        
        if (!tugas) continue; // Skip jika headernya kosong

        // Masukkan data ke properti yang tepat
        if (jsonKey === 'susunan') {
          if (nama === 'Ya' || nama === true) nama = true;
          else if (nama === 'Tidak' || nama === false || nama === '') nama = false;
          db[tanggal].susunan[tugas] = nama;
        } else {
          // Hanya masukkan tugas, meskipun nama orangnya kosong (agar struktur di React tetap ada)
          db[tanggal][jsonKey].push({ tugas: tugas, nama: String(nama || '') });
        }
      }
    }
  }
  
  return db;
}

function saveJadwal(tanggal, tableData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. Ubah data array vertikal dari React menjadi Object per Sheet
  const groupedData = {};
  Object.values(CATEGORY_MAP).forEach(sheetName => groupedData[sheetName] = {});

  if (tableData && tableData.length > 0) {
    tableData.forEach(row => {
      const kategori = row[1]; // misal: 'Sekolah Sabat'
      const tugas = row[2];    // misal: 'Doa Buka'
      const nama = row[3];     // misal: 'Bpk. Budi'
      const sheetName = CATEGORY_MAP[kategori];
      
      if (sheetName) {
        groupedData[sheetName][tugas] = nama;
      }
    });
  }

  // 2. Tulis data ke masing-masing Sheet secara Horizontal (Baris/Kolom)
  for (const [sheetName, taskData] of Object.entries(groupedData)) {
    // Skip menyimpan jika tidak ada data tugas pada sheet tersebut (kecuali sheet Susunan Acara)
    if (Object.keys(taskData).length === 0 && sheetName !== CATEGORY_MAP['Susunan Acara']) continue;

    let sheet = ss.getSheetByName(sheetName);
    
    // Buat sheet jika tidak sengaja terhapus, beri header 'Tanggal'
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1).setValue('Tanggal');
      sheet.getRange(1, 1).setFontWeight("bold");
    }

    // Ambil header saat ini
    let headers = [];
    if (sheet.getLastColumn() > 0) {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    } else {
      headers = ['Tanggal'];
      sheet.getRange(1, 1).setValue('Tanggal');
    }

    // Periksa apakah ada Kolom Tugas baru yang perlu ditambahkan ke Header
    let headersModified = false;
    for (const tugas of Object.keys(taskData)) {
      if (!headers.includes(tugas)) {
        headers.push(tugas);
        headersModified = true;
      }
    }

    // Tulis ulang header jika ada penambahan kolom tugas baru
    if (headersModified) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }

    // Siapkan array baris kosong sepanjang header yang ada
    const rowArray = new Array(headers.length).fill('');
    rowArray[0] = tanggal; // Kolom 1 (Index 0) selalu Tanggal

    // Petakan nama orang ke kolom tugas yang sesuai
    for (const [tugas, nama] of Object.entries(taskData)) {
      const colIndex = headers.indexOf(tugas);
      if (colIndex !== -1) {
        rowArray[colIndex] = nama;
      }
    }

    // Cari apakah data tanggal ini sudah pernah ada sebelumnya
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      let rowDate = data[i][0];
      if (rowDate instanceof Date) {
        rowDate = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        rowDate = String(rowDate);
      }

      if (rowDate === tanggal) {
        rowIndex = i + 1; // +1 karena sheet dimulai dari indeks 1
        break;
      }
    }

    // Tulis ke spreadsheet
    if (rowIndex !== -1) {
      // Jika Tanggal sudah ada, timpa baris tersebut (Update)
      sheet.getRange(rowIndex, 1, 1, rowArray.length).setValues([rowArray]);
    } else {
      // Jika Tanggal belum ada, tambahkan di baris paling bawah (Insert Baru)
      if (Object.keys(taskData).length > 0) {
        sheet.appendRow(rowArray);
      }
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

function saveHeroImages(jsonStringArray) {
  try {
    let images = JSON.parse(jsonStringArray);
    let updatedImages = [];

    // OPTIMASI: Cari atau buat folder "Hero_Images" SEKALI SAJA di luar loop 
    // agar proses eksekusi berpuluh kali lipat lebih cepat.
    const parent = DriveApp.getFolderById(FOLDER_GALERI_ID);
    const folders = parent.getFoldersByName("Hero_Images");
    const folder = folders.hasNext() ? folders.next() : parent.createFolder("Hero_Images");
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