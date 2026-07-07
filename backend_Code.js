// =========================================================================
// 1. KONFIGURASI UTAMA
// =========================================================================

// WAJIB DIGANTI: Masukkan ID Spreadsheet dan ID Folder Google Drive Anda di sini, 
// ATAU gunakan Script Properties (Pengaturan Proyek GAS > Script Properties) agar ID terlindungi saat push ke GitHub.
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';
const FOLDER_GALERI_ID = PropertiesService.getScriptProperties().getProperty('FOLDER_GALERI_ID') || '';

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

    // A. Aksi Publik (tidak perlu password)
    if (action === 'getPublicFolders') return getPublicFolders();
    if (action === 'getPublicImages') return getPublicImages(payload.folderId);
    if (action === 'verifyPassword') return verifyPassword(payload.password);
    if (action === 'getBooks') return getBooks();

    // B. Verifikasi Keamanan Admin
    const currentPassword = getSetting('PASSWORD') || 'admin123';

    // Public actions yang tidak perlu password
    const publicActions = ['getPublicFolders', 'getPublicImages', 'verifyPassword', 'getBooks'];

    // Check password hanya untuk admin actions
    if (!publicActions.includes(action) && payload.password !== currentPassword && action !== 'changePassword') {
      return jsonResponse({ success: false, message: 'Akses Ditolak: Password salah.' });
    }

    // C. Aksi Admin
    switch (action) {
      case 'changePassword': return changePassword(payload.oldPassword, payload.newPassword);
      case 'saveYoutubeUrl': return saveSetting('YOUTUBE_URL', payload.url);
      case 'saveLiveUrl': return saveSetting('LIVE_URL', payload.url);
      case 'saveHeroImage': return saveHeroImages(payload.url);
      case 'savePengumuman': return saveSetting('PENGUMUMAN_DATA', payload.pengumuman);
      case 'saveKontakGereja': return saveSetting('KONTAK_GEREJA', payload.kontakGereja);
      case 'savePerjamuanDate':
        saveSettingRecord('PERJAMUAN_DATE', payload.tanggal);
        saveSettingRecord('PERPULUHAN_DATE', payload.tanggalPerpuluhan);
        return jsonResponse({ success: true });

      // PENAMBAHAN: Aksi untuk menyimpan Rekening dan QRIS
      case 'saveRekening':
        saveSettingRecord('DAFTAR_REKENING', JSON.stringify(payload.daftarRekening || []));
        return jsonResponse({ success: true, message: 'Pengaturan Rekening & QRIS berhasil disimpan.' });

      // -- Manajemen Konten --
      case 'saveJadwal': return saveJadwal(payload.tanggal, payload.tableData);

      // =====================================================================
      // BUG FIX: savePejabat sekarang membaca payload.dataPejabat (bukan payload.data)
      // Frontend mengirim: { action, password, dataPejabat: [...], kategoriPejabat: [...] }
      // =====================================================================
      case 'savePejabat': return savePejabat(payload.dataPejabat, payload.kategoriPejabat);

      // -- Warta --
      case 'createWarta': return saveWarta(payload.data ? JSON.parse(payload.data) : payload);
      case 'saveWarta': return saveWarta(payload.data ? JSON.parse(payload.data) : payload);
      case 'updateWarta': return updateWarta(payload.data ? JSON.parse(payload.data) : payload);
      case 'deleteWarta': return deleteWarta(payload.rowIndex);
      case 'uploadChunk': return handleUploadChunk(payload);

      // -- Galeri --
      case 'listImageFolders': return getPublicFolders();
      case 'createImageFolder': return createImageFolder(payload.folderName);
      case 'uploadImageToDrive': return uploadImageToDrive(payload.folderId, payload.title, payload.imageBase64);
      case 'deleteImage': return deleteImage(payload.fileId);

      // -- Buku --
      case 'addBook': return addBook(payload.data || payload);
      case 'updateBook': return updateBook(payload.data || payload);
      case 'deleteBook': return deleteBook(payload.data || payload.id);

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
  if (url.includes('drive.google.com/uc') && url.includes('id=')) {
    const idMatch = url.match(/id=([^&]+)/);
    if (idMatch && idMatch[1]) {
      return "https://drive.google.com/thumbnail?id=" + idMatch[1] + "&sz=w1200";
    }
  }
  return url;
}

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
  return hash.substring(0, 10).toUpperCase();
}

function processMultipleImages(gambarUrlStr, judul) {
  if (!gambarUrlStr) return "";
  let urls = gambarUrlStr.split('|||');
  let processedUrls = [];

  for (let i = 0; i < urls.length; i++) {
    let url = urls[i].trim();
    if (url && !url.startsWith('http') && (url.startsWith('data:image') || url.length > 500)) {
      let hash = getMd5Hash(url);
      let targetFolderId = getOrCreateNestedFolder("Warta_Images");
      let safeTitle = judul ? judul.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30) : "Gambar";
      let fileName = "Warta_" + safeTitle + "_" + (i + 1) + "_" + hash + ".jpg";
      let uploadedUrl = uploadFileToDrive(url, fileName, targetFolderId);
      processedUrls.push(uploadedUrl);
    } else {
      processedUrls.push(url);
    }
  }
  return processedUrls.join('|||');
}

// =========================================================================
// 3. FUNGSI DATABASE (GETTER UTAMA)
// =========================================================================

function getInitialData() {
  let rawHero = getSetting('HERO_IMAGE_URL') || "[]";
  let heroImages = [];
  try {
    let parsed = JSON.parse(rawHero);
    if (Array.isArray(parsed)) {
      heroImages = parsed.map(makeSafeImageUrl);
    } else {
      heroImages = [makeSafeImageUrl(parsed)];
    }
  } catch (e) {
    heroImages = [];
  }

  return jsonResponse({
    success: true,
    dataPejabat: getPejabatDB(),
    jadwalDB: getJadwalDB(),
    kategoriPejabat: getKategoriDB(),
    youtubeUrl: getSetting('YOUTUBE_URL') || "https://www.youtube.com/embed/EAO55pnNsgs",
    liveUrl: getSetting('LIVE_URL') || "https://www.youtube.com/embed/live_stream?channel=UCaTPS74NOHACRYU0zInVZ4g",
    heroImageUrl: JSON.stringify(heroImages),
    pengumuman: getSetting('PENGUMUMAN_DATA') || JSON.stringify({ header: "Pengumuman", isi: "" }),
    kontakGereja: getSetting('KONTAK_GEREJA'),
    daftarWarta: getDaftarWarta(),
    perjamuanDate: getSetting('PERJAMUAN_DATE') || '',
    perpuluhanDate: getSetting('PERPULUHAN_DATE') || '',
    daftarRekening: getSetting('DAFTAR_REKENING') || '',
    legacyNamaBank: getSetting('NAMA_BANK') || 'Mandiri',
    legacyRekeningBank: getSetting('REKENING_BANK') || '1090001711043',
    legacyAtasNama: getSetting('ATAS_NAMA') || 'GMAHK PISGAH BISDAC',
    legacyQrisUrl: getSetting('QRIS_URL') || ''
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
    let rawImageStr = data[i][3] || '';
    let processedImages = rawImageStr.toString().split('|||').map(u => makeSafeImageUrl(u.trim())).filter(u => u).join('|||');

    wartaList.push({
      rowIndex: i + 1,
      tanggal: data[i][0] ? Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), "yyyy-MM-dd") : '',
      judul: data[i][1] || '',
      isi: data[i][2] || '',
      gambarUrl: processedImages,
      penulis: data[i][4] || ''
    });
  }
  return wartaList;
}

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
  let finalGambarUrl = processMultipleImages(payload.gambarUrl, payload.judul);
  sheet.appendRow([new Date(), payload.judul, payload.isi, finalGambarUrl, payload.penulis]);
  return jsonResponse({ success: true });
}

function updateWarta(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  let finalGambarUrl = processMultipleImages(payload.gambarUrl, payload.judul);
  sheet.getRange(payload.rowIndex, 2).setValue(payload.judul);
  sheet.getRange(payload.rowIndex, 3).setValue(payload.isi);
  sheet.getRange(payload.rowIndex, 4).setValue(finalGambarUrl);
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
        img: makeSafeImageUrl(data[i][4] || ''),
        kategori: data[i][5] || "Lainnya"
      });
    }
  }
  return result;
}

// =====================================================================
// BUG FIX: Parameter diubah dari (data, kategoriPejabat) menjadi
// (dataPejabat, kategoriPejabat) agar sinkron dengan payload frontend.
// Frontend mengirim: payload.dataPejabat (bukan payload.data)
// =====================================================================
function savePejabat(dataPejabat, kategoriPejabat) {
  // Guard: pastikan data yang masuk adalah array yang valid
  if (!dataPejabat || !Array.isArray(dataPejabat)) {
    return jsonResponse({ success: false, message: 'Data pejabat tidak valid atau kosong.' });
  }

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PEJABAT);

  // Proses upload foto baru (Base64 → Google Drive)
  let targetFolderId = getOrCreateNestedFolder("Pejabat_Images");

  for (let i = 0; i < dataPejabat.length; i++) {
    let imgData = dataPejabat[i].img;

    // Hanya upload jika gambar adalah Base64 (bukan URL https://)
    if (imgData && !imgData.startsWith('http') &&
      (imgData.startsWith('data:image') || imgData.length > 500)) {

      let hash = getMd5Hash(imgData);
      let safeName = dataPejabat[i].nama
        ? dataPejabat[i].nama.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30)
        : "Profil";
      let fileName = "Pejabat_" + safeName + "_" + hash + ".jpg";

      // uploadFileToDrive sudah cek duplikasi otomatis via nama file
      dataPejabat[i].img = uploadFileToDrive(imgData, fileName, targetFolderId);
    }
  }

  // Tulis ulang seluruh sheet Pejabat
  sheet.clear();
  sheet.appendRow(['ID', 'Jabatan', 'Nama', 'WA', 'Image URL', 'Kategori']);

  if (dataPejabat.length > 0) {
    const rows = dataPejabat.map(p => [
      p.id || '',
      p.jabatan || '',
      p.nama || '',
      "'" + (p.wa || ''),   // Awalan ' agar WA tidak dianggap angka
      p.img || '',
      p.kategori || 'Lainnya'
    ]);
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  // Simpan daftar kategori
  if (kategoriPejabat && Array.isArray(kategoriPejabat)) {
    saveSettingRecord('KATEGORI_PEJABAT', JSON.stringify(kategoriPejabat));
  }

  return jsonResponse({ success: true, message: 'Data pejabat berhasil disimpan.' });
}

function getKategoriDB() {
  const val = getSetting('KATEGORI_PEJABAT');
  if (val) { try { return JSON.parse(val); } catch (e) { } }
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
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      let val = data[i][1];
      // Jika ternyata Google membaca sebagai Date object, kembalikan ke string YYYY-MM-DD
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      return val;
    }
  }
  return null;
}

function saveSettingRecord(key, value) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PENGATURAN);
  const data = sheet.getDataRange().getValues();
  let found = false;

  // Mencegah konversi zona waktu otomatis di Google Sheets
  // Khusus untuk pengaturan tanggal, tambahkan awalan tanda kutip (') agar murni menjadi teks
  let finalValue = value;
  if (key === 'PERJAMUAN_DATE' || key === 'PERPULUHAN_DATE') {
    // Jika value kosong, biarkan kosong, jika ada tanggal, tambahkan kutip
    finalValue = value ? "'" + value : "";
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(finalValue);
      found = true;
      break;
    }
  }

  if (!found) sheet.appendRow([key, finalValue]);
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
        const directUrl = isVideo ? file.getUrl() : "https://drive.google.com/uc?export=view&id=" + fileId;
        media.push({
          id: fileId,
          title: file.getName(),
          url: directUrl,
          thumbnailUrl: directUrl,
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
    } catch (err) {
      const folders = DriveApp.getFoldersByName("PISGAH_UPLOADS");
      folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("PISGAH_UPLOADS");
    }

    // Cegah duplikasi: cek apakah file dengan nama sama sudah ada
    const existingFiles = folder.getFilesByName(fileName);
    if (existingFiles.hasNext()) {
      const existingFile = existingFiles.next();
      return "https://drive.google.com/thumbnail?id=" + existingFile.getId() + "&sz=w1200";
    }

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

    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1200";
  } catch (e) {
    throw new Error("Gagal upload ke Drive: " + e.message);
  }
}

function uploadImageToDrive(folderId, title, base64Data) {
  try {
    let ext = ".jpg";
    const directUrl = uploadFileToDrive(base64Data, title + ext, folderId);
    return jsonResponse({ success: true, url: directUrl });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function saveHeroImages(payloadData) {
  try {
    let images = typeof payloadData === 'string' ? JSON.parse(payloadData) : payloadData;
    if (!Array.isArray(images)) images = [images];

    let updatedImages = [];
    let targetFolderId = getOrCreateNestedFolder("Hero_Images");

    for (let i = 0; i < images.length; i++) {
      let img = images[i];
      if (img && typeof img === 'string' && !img.startsWith('http') && (img.startsWith('data:image') || img.length > 500)) {
        let hash = getMd5Hash(img);
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

// =========================================================================
// 8. FUNGSI UPLOAD GAMBAR CHUNKED
// =========================================================================

function handleUploadChunk(payload) {
  try {
    const chunk = payload.chunk;
    const filename = payload.filename;
    const isFirst = payload.isFirst;
    const isLast = payload.isLast;
    let fileId = payload.fileId;

    let tempFolderId = getOrCreateNestedFolder("Temp_Uploads");
    let folder = DriveApp.getFolderById(tempFolderId);

    let tempFile;
    if (isFirst) {
      tempFile = folder.createFile("temp_" + filename + ".txt", chunk);
      fileId = tempFile.getId();
    } else {
      tempFile = DriveApp.getFileById(fileId);
      let currentContent = tempFile.getBlob().getDataAsString();
      tempFile.setContent(currentContent + chunk);
    }

    if (isLast) {
      let fullBase64 = tempFile.getBlob().getDataAsString();
      let byteCharacters = Utilities.base64Decode(fullBase64);

      let wartaFolderId = getOrCreateNestedFolder("Warta_Images");
      let wartaFolder = DriveApp.getFolderById(wartaFolderId);

      let type = 'image/jpeg';
      if (filename.toLowerCase().endsWith('.png')) type = 'image/png';
      else if (filename.toLowerCase().endsWith('.webp')) type = 'image/webp';

      let blob = Utilities.newBlob(byteCharacters, type, filename);
      let finalFile = wartaFolder.createFile(blob);
      finalFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      tempFile.setTrashed(true);

      return jsonResponse({ success: true, fileId: finalFile.getId() });
    } else {
      return jsonResponse({ success: true, fileId: fileId });
    }
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

// =========================================================================
// 9. MANAJEMEN BUKU (PERPUSTAKAAN)
// =========================================================================

const SHEET_BUKU = 'Buku';

function getOrCreateBookSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_BUKU);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_BUKU);
    const headers = [['ID', 'Judul', 'Pengarang', 'Cover URL', 'Deskripsi', 'Kategori', 'PDF URL']];
    sheet.getRange(1, 1, 1, 7).setValues(headers).setBackground('#D4AF37').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 220);
    sheet.setColumnWidth(3, 150);
    sheet.setColumnWidth(4, 200);
    sheet.setColumnWidth(5, 200);
    sheet.setColumnWidth(6, 100);
    sheet.setColumnWidth(7, 250);
  }
  return sheet;
}

function getDefaultCover(category) {
  const cat = (category || '').toLowerCase().trim();
  const defaults = {
    'egw': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9ISVMxNzQ3NzM1NjEyMzE5LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/HIS1747735612319.jpg',
    'doktrin': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjc1L2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9mcEUxNzQ5NDcxNDI3NTExLmpwZw/w:1920,q:75/hope-images/67054013a60919c92d92c959/fpE1749471427511.jpg',
    '28 doktrin': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjc1L2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9mcEUxNzQ5NDcxNDI3NTExLmpwZw/w:1920,q:75/hope-images/67054013a60919c92d92c959/fpE1749471427511.jpg',
    'panduan': 'https://images.hopesoftware.org/resize/L3dfMTkyMF9fcV84MC9ob3BlLWltYWdlcy82MWRlZDc4YTk0YTg4Zjc2MzEwMjAzNDEvQVhNMTY0Mzk2NzU0MjczOS5qcGc/w_1920__q_80/hope-images/61ded78a94a88f7631020341/AXM1643967542739.jpg',
    'renungan': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9DZnExNzQ5MTg3MDg1NjE3LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/Cfq1749187085617.jpg',
    'alkitab': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9ISVMxNzQ3NzM1NjEyMzE5LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/HIS1747735612319.jpg',
    'kesehatan': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjc1L2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9mcEUxNzQ5NDcxNDI3NTExLmpwZw/w:1920,q:75/hope-images/67054013a60919c92d92c959/fpE1749471427511.jpg',
    'sejarah': 'https://images.hopesoftware.org/resize/L3dfMTkyMF9fcV84MC9ob3BlLWltYWdlcy82MWRlZDc4YTk0YTg4Zjc2MzEwMjAzNDEvQVhNMTY0Mzk2NzU0MjczOS5qcGc/w_1920__q_80/hope-images/61ded78a94a88f7631020341/AXM1643967542739.jpg',
    'misi': 'https://images.hopesoftware.org/resize/L3c6MTkyMCxxOjgwL2hvcGUtaW1hZ2VzLzY3MDU0MDEzYTYwOTE5YzkyZDkyYzk1OS9DZnExNzQ5MTg3MDg1NjE3LmpwZw/w:1920,q:80/hope-images/67054013a60919c92d92c959/Cfq1749187085617.jpg',
  };
  if (defaults[cat]) return defaults[cat];
  for (const key of Object.keys(defaults)) {
    if (cat.includes(key) || key.includes(cat)) return defaults[key];
  }
  return 'https://images.hopesoftware.org/resize/L3dfMTkyMF9fcV84MC9ob3BlLWltYWdlcy82MWRlZDc4YTk0YTg4Zjc2MzEwMjAzNDEvQVhNMTY0Mzk2NzU0MjczOS5qcGc/w_1920__q_80/hope-images/61ded78a94a88f7631020341/AXM1643967542739.jpg';
}

function getBooks() {
  try {
    const sheet = getOrCreateBookSheet();
    if (sheet.getLastRow() <= 1) return jsonResponse({ success: true, status: 'success', data: [] });
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
    const books = rows
      .filter(r => String(r[0]).trim() !== '')
      .map(r => {
        const category = String(r[5] || '').trim();
        const cover = String(r[3] || '').trim();
        return {
          id: String(r[0]).trim(),
          title: String(r[1]).trim(),
          author: String(r[2]).trim(),
          cover: cover || getDefaultCover(category),
          desc: String(r[4]).trim(),
          category: category,
          pdfUrl: String(r[6] || '').trim()
        };
      });
    return jsonResponse({ success: true, status: 'success', data: books });
  } catch (e) {
    return jsonResponse({ success: false, status: 'error', message: e.toString() });
  }
}

function addBook(data) {
  try {
    const sheet = getOrCreateBookSheet();
    const newId = 'BK' + new Date().getTime();
    sheet.appendRow([
      newId,
      data.title || '',
      data.author || '',
      data.cover || '',
      data.desc || '',
      data.category || '',
      data.pdfUrl || ''
    ]);
    return jsonResponse({ success: true, status: 'success', id: newId, message: 'Buku berhasil ditambahkan' });
  } catch (e) {
    return jsonResponse({ success: false, status: 'error', message: e.toString() });
  }
}

function updateBook(data) {
  try {
    const sheet = getOrCreateBookSheet();
    if (sheet.getLastRow() <= 1) return jsonResponse({ success: false, message: 'Buku tidak ditemukan' });
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]).trim() === String(data.id).trim()) {
        sheet.getRange(i + 2, 2, 1, 6).setValues([[
          data.title || '',
          data.author || '',
          data.cover || '',
          data.desc || '',
          data.category || '',
          data.pdfUrl || ''
        ]]);
        return jsonResponse({ success: true, status: 'success', message: 'Buku berhasil diperbarui' });
      }
    }
    return jsonResponse({ success: false, status: 'error', message: 'Buku tidak ditemukan' });
  } catch (e) {
    return jsonResponse({ success: false, status: 'error', message: e.toString() });
  }
}

function deleteBook(bookId) {
  try {
    const id = typeof bookId === 'object' ? (bookId.id || '') : String(bookId);
    const sheet = getOrCreateBookSheet();
    if (sheet.getLastRow() <= 1) return jsonResponse({ success: false, message: 'Buku tidak ditemukan' });
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]).trim() === String(id).trim()) {
        sheet.deleteRow(i + 2);
        return jsonResponse({ success: true, status: 'success', message: 'Buku berhasil dihapus' });
      }
    }
    return jsonResponse({ success: false, status: 'error', message: 'Buku tidak ditemukan' });
  } catch (e) {
    return jsonResponse({ success: false, status: 'error', message: e.toString() });
  }
}
