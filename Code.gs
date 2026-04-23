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
// HELPER: KONVERSI LINK LAMA KE LINK AMAN (THUMBNAIL)
// =========================================================================
function makeSafeImageUrl(url) {
  if (!url) return "";
  // Ubah format lama uc?export=view menjadi link thumbnail resolusi tinggi
  if (url.includes('drive.google.com/uc') && url.includes('id=')) {
    const idMatch = url.match(/id=([^&]+)/);
    if (idMatch && idMatch[1]) {
      return "https://drive.google.com/thumbnail?id=" + idMatch[1] + "&sz=w1200";
    }
  }
  return url;
}

// HELPER: BIKIN SIDIK JARI GAMBAR (MD5 Hash) UNTUK CEGAH DUPLIKASI
function getMd5Hash(str) {
  const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, str);
  let hash = "";
  for (let i = 0; i < signature.length; i++) {
    let byte = signature[i];
    if (byte < 0) byte += 256;
    let hex = byte.toString(16);
    if (hex.length == 1) hex = "0" + hex;
    hash += hex;
  }
  return hash.substring(0, 10).toUpperCase(); // Ambil 10 karakter pertama sidik jari
}


// =========================================================================
// 3. FUNGSI DATABASE (GETTER UTAMA)
// =========================================================================

function getInitialData() {
  // Ambil & perbaiki semua link Hero Image secara otomatis
  let rawHero = getSetting('HERO_IMAGE_URL') || "[]";
  let heroImages = [];
  try {
    let parsed = JSON.parse(rawHero);
    if (Array.isArray(parsed)) {
      heroImages = parsed.map(makeSafeImageUrl); // Konversi massal
    } else {
      heroImages = [makeSafeImageUrl(parsed)];
    }
  } catch(e) {
    heroImages = [];
  }

  return jsonResponse({
    success: true,
    dataPejabat: getPejabatDB(),
    jadwalDB: getJadwalDB(),
    kategoriPejabat: getKategoriDB(),
    youtubeUrl: getSetting('YOUTUBE_URL') || "https://www.youtube.com/embed/videoseries?list=UUaTPS74NOHACRYU0zInVZ4g",
    heroImageUrl: JSON.stringify(heroImages),
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
      judul: data[i][1] || '', 
      isi: data[i][2] || '', 
      gambarUrl: makeSafeImageUrl(data[i][3] || ''), // Otomatis perbaiki link lama
      penulis: data[i][4] || ''
    });
  }
  return wartaList;
}

// HELPER BARU: Buat atau cari folder di dalam folder utama "Pisgah_Web"
function getOrCreateNestedFolder(folderName) {
  const root = DriveApp.getRootFolder();
  let masterFolder;
  
  const masterFolders = root.getFoldersByName("Pisgah_Web");
  if (masterFolders.hasNext()) {
    masterFolder = masterFolders.next();
  } else {
    masterFolder = root.createFolder("Pisgah_Web");
    masterFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }

  const subFolders = masterFolder.getFoldersByName(folderName);
  if (subFolders.hasNext()) {
    return subFolders.next().getId();
  } else {
    const newFolder = masterFolder.createFolder(folderName);
    newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return newFolder.getId();
  }
}

function saveWarta(payload) {
  let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  let gambarUrl = payload.gambarUrl || "";
  
  if (gambarUrl && !gambarUrl.startsWith('http') && (gambarUrl.startsWith('data:image') || gambarUrl.length > 500)) {
    let hash = getMd5Hash(gambarUrl); // Buat Sidik Jari
    let targetFolderId = getOrCreateNestedFolder("Warta_Images");
    
    // NAMA FILE RAPI: Mengambil judul warta (Maks 30 huruf)
    let safeTitle = payload.judul ? payload.judul.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30) : "Gambar";
    let fileName = "Warta_" + safeTitle + "_" + hash + ".jpg";
    
    gambarUrl = uploadFileToDrive(gambarUrl, fileName, targetFolderId);
  }
  
  sheet.appendRow([ new Date(), payload.judul, payload.isi, gambarUrl, payload.penulis ]);
  return jsonResponse({ success: true });
}

function updateWarta(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  let gambarUrl = payload.gambarUrl || "";
  
  if (gambarUrl && !gambarUrl.startsWith('http') && (gambarUrl.startsWith('data:image') || gambarUrl.length > 500)) {
    let hash = getMd5Hash(gambarUrl); // Buat Sidik Jari
    let targetFolderId = getOrCreateNestedFolder("Warta_Images");
    
    // NAMA FILE RAPI: Mengambil judul warta
    let safeTitle = payload.judul ? payload.judul.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30) : "Gambar";
    let fileName = "Warta_" + safeTitle + "_" + hash + ".jpg";
    
    gambarUrl = uploadFileToDrive(gambarUrl, fileName, targetFolderId);
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
    if (data[i][0]) {
      result.push({ 
        id: data[i][0], 
        jabatan: data[i][1], 
        nama: data[i][2], 
        wa: data[i][3], 
        img: makeSafeImageUrl(data[i][4] || ''), // Otomatis perbaiki link lama
        kategori: data[i][5] || "Lainnya" 
      });
    }
  }
  return result;
}

function savePejabat(dataPejabat, kategoriPejabat) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PEJABAT);
  
  if (dataPejabat && dataPejabat.length > 0) {
    let targetFolderId = getOrCreateNestedFolder("Pejabat_Images");
    
    for (let i = 0; i < dataPejabat.length; i++) {
      let imgData = dataPejabat[i].img;
      
      if (imgData && !imgData.startsWith('http') && (imgData.startsWith('data:image') || imgData.length > 500)) {
        let hash = getMd5Hash(imgData); // Buat Sidik Jari Unik Foto
        
        // NAMA FILE RAPI: Mengambil nama pejabat
        let safeName = dataPejabat[i].nama ? dataPejabat[i].nama.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30) : "Profil";
        let fileName = "Pejabat_" + safeName + "_" + hash + ".jpg";
        
        // Teruskan targetFolderId, gunakan nama file dari HASH untuk cegah duplikasi
        dataPejabat[i].img = uploadFileToDrive(imgData, fileName, targetFolderId);
      }
    }
  }

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

  for (const [sheetName, jsonKey] of Object.entries(CATEGORY_MAP_REV)) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) continue; 

    const headers = data[0]; 
    
    for (let i = 1; i < data.length; i++) {
      let tanggal = data[i][0];
      if (!tanggal) continue;
      
      if (tanggal instanceof Date) {
        tanggal = Utilities.formatDate(tanggal, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        tanggal = String(tanggal);
      }
      
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

      for (let j = 1; j < headers.length; j++) {
        const tugas = headers[j];
        let nama = data[i][j];
        
        if (!tugas) continue; 

        if (jsonKey === 'susunan') {
          if (nama === 'Ya' || nama === true) nama = true;
          else if (nama === 'Tidak' || nama === false || nama === '') nama = false;
          db[tanggal].susunan[tugas] = nama;
        } else {
          db[tanggal][jsonKey].push({ tugas: tugas, nama: String(nama || '') });
        }
      }
    }
  }
  
  return db;
}

function saveJadwal(tanggal, tableData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const groupedData = {};
  Object.values(CATEGORY_MAP).forEach(sheetName => groupedData[sheetName] = {});

  if (tableData && tableData.length > 0) {
    tableData.forEach(row => {
      const kategori = row[1]; 
      const tugas = row[2];    
      const nama = row[3];     
      const sheetName = CATEGORY_MAP[kategori];
      
      if (sheetName) {
        groupedData[sheetName][tugas] = nama;
      }
    });
  }

  for (const [sheetName, taskData] of Object.entries(groupedData)) {
    if (Object.keys(taskData).length === 0 && sheetName !== CATEGORY_MAP['Susunan Acara']) continue;

    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1).setValue('Tanggal');
      sheet.getRange(1, 1).setFontWeight("bold");
    }

    let headers = [];
    if (sheet.getLastColumn() > 0) {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    } else {
      headers = ['Tanggal'];
      sheet.getRange(1, 1).setValue('Tanggal');
    }

    let headersModified = false;
    for (const tugas of Object.keys(taskData)) {
      if (!headers.includes(tugas)) {
        headers.push(tugas);
        headersModified = true;
      }
    }

    if (headersModified) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }

    const rowArray = new Array(headers.length).fill('');
    rowArray[0] = tanggal; 

    for (const [tugas, nama] of Object.entries(taskData)) {
      const colIndex = headers.indexOf(tugas);
      if (colIndex !== -1) {
        rowArray[colIndex] = nama;
      }
    }

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
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex !== -1) {
      sheet.getRange(rowIndex, 1, 1, rowArray.length).setValues([rowArray]);
    } else {
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
      if (isImage || isVideo) {
        const fileId = file.getId();
        // Menggunakan uc?export=view yang jauh lebih stabil untuk menampilkan foto asli tanpa pecah
        const directUrl = isVideo ? file.getUrl() : "https://drive.google.com/uc?export=view&id=" + fileId;
        media.push({ 
          id: fileId, 
          title: file.getName(), 
          url: directUrl, 
          thumbnailUrl: directUrl, // Gunakan url asli agar tidak pecah/error
          type: isVideo ? 'video' : 'image' 
        });
      }
    }
    return jsonResponse({ success: true, media: media });
  } catch (e) { return jsonResponse({ success: false, message: e.toString() }); }
}

function createImageFolder(folderName) {
  try { DriveApp.getFolderById(FOLDER_GALERI_ID).createFolder(folderName).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); return jsonResponse({ success: true }); } 
  catch (e) { return jsonResponse({ success: false, message: e.toString() }); }
}

// =========================================================================
// 7. FUNGSI UPLOAD GAMBAR UTAMA
// =========================================================================

function uploadFileToDrive(base64Data, fileName, customFolderId) {
  try {
    const folderId = customFolderId || FOLDER_GALERI_ID;
    let folder;
    
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch(err) {
      const folders = DriveApp.getFoldersByName("PISGAH_UPLOADS");
      folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("PISGAH_UPLOADS");
    }

    // --- CEGAH DUPLIKASI (Mencegah upload jika file foto yang sama persis sudah ada) ---
    const existingFiles = folder.getFilesByName(fileName);
    if (existingFiles.hasNext()) {
      const existingFile = existingFiles.next();
      return "https://drive.google.com/thumbnail?id=" + existingFile.getId() + "&sz=w1200";
    }
    // -----------------------------------------------------------------------------------

    let type = 'image/jpeg';
    let byteCharacters;

    if (base64Data.includes(',')) {
      const splitBase = base64Data.split(',');
      type = splitBase[0].split(';')[0].replace('data:', '');
      byteCharacters = Utilities.base64Decode(splitBase[1]);
    } else {
      byteCharacters = Utilities.base64Decode(base64Data);
      if (base64Data.startsWith('UklG')) type = 'image/webp';
      else if (base64Data.startsWith('iVBORw')) type = 'image/png';
      else if (base64Data.startsWith('/9j/')) type = 'image/jpeg';
    }

    const blob = Utilities.newBlob(byteCharacters, type, fileName);
    const file = folder.createFile(blob);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // FORMAT PENTING: Mengubah ID file menjadi link thumbnail resolusi tinggi
    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1200";
  } catch (e) {
    throw new Error("Gagal upload ke Drive: " + e.message);
  }
}

// Fungsi Panggilan Cepat untuk fitur Galeri Manual
function uploadImageToDrive(folderId, title, base64Data) {
  try {
    let ext = ".jpg"; 
    const directUrl = uploadFileToDrive(base64Data, title + ext, folderId);
    return jsonResponse({ success: true, url: directUrl });
  } catch (e) { 
    return jsonResponse({ success: false, message: e.toString() }); 
  }
}

// Fungsi Panggilan Cepat untuk Hero Images
function saveHeroImages(payloadData) {
  try {
    let images = typeof payloadData === 'string' ? JSON.parse(payloadData) : payloadData;
    if (!Array.isArray(images)) images = [images];
    
    let updatedImages = [];
    let targetFolderId = getOrCreateNestedFolder("Hero_Images");

    for (let i = 0; i < images.length; i++) {
      let img = images[i];
      if (img && typeof img === 'string' && !img.startsWith('http') && (img.startsWith('data:image') || img.length > 500)) {
        let hash = getMd5Hash(img); // Buat Sidik Jari
        
        // NAMA FILE RAPI
        let fileName = "Hero_Banner_" + hash + ".jpg";
        
        let url = uploadFileToDrive(img, fileName, targetFolderId);
        if (url) updatedImages.push(url);
      } else if (img) {
        updatedImages.push(img); 
      }
    }
    
    saveSettingRecord('HERO_IMAGE_URL', JSON.stringify(updatedImages));
    return jsonResponse({ success: true, updatedUrls: updatedImages });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function deleteImage(fileId) {
  try { DriveApp.getFileById(fileId).setTrashed(true); return jsonResponse({ success: true }); } 
  catch (e) { return jsonResponse({ success: false, message: e.toString() }); }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}