// =========================================================================
// 1. KONFIGURASI UTAMA
// =========================================================================

const SPREADSHEET_ID = '1pm4Bp_vmPixR-n0BDxrrisMJVo-BDMI5osxEXR0Rii8'; 
const FOLDER_GALERI_ID = '1AutGgLJM0AHZhYWGyfrD6TJQ1xpg97fm';

const SHEET_PENGATURAN = 'Pengaturan';
const SHEET_PEJABAT = 'Pejabat';
const SHEET_WARTA = 'Warta';

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
// 2. ROUTING UTAMA
// =========================================================================

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getData') {
    return getInitialData();
  }
  
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('PISGAH-BISDAC')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    const currentPassword = getSetting('PASSWORD') || 'admin123';
    
    const publicActions = ['getPublicFolders', 'getPublicImages', 'verifyPassword', 'getData'];
    
    if (!publicActions.includes(action)) {
      if (payload.password !== currentPassword) {
        return jsonResponse({ success: false, message: 'Akses Ditolak.' });
      }
    }

    switch (action) {
      case 'verifyPassword':      return jsonResponse({ success: payload.password === currentPassword });
      case 'changePassword':     return changePassword(payload.oldPassword, payload.newPassword);
      case 'saveYoutubeUrl':     return saveSetting('YOUTUBE_URL', payload.url);
      case 'saveHeroImage':      return saveHeroImages(payload.url);
      case 'savePengumuman':     return saveSetting('PENGUMUMAN_DATA', payload.pengumuman);
      case 'saveJadwal':         return saveJadwal(payload.tanggal, payload.tableData);
      case 'savePejabat':        return savePejabat(payload.data, payload.kategoriPejabat);
      case 'saveWarta':          return saveWarta(payload);
      case 'updateWarta':        return updateWarta(payload);
      case 'deleteWarta':        return deleteWarta(payload.rowIndex);
      case 'listImageFolders':   return getPublicFolders();
      case 'createImageFolder':  return createImageFolder(payload.folderName);
      case 'uploadImageToDrive': return uploadImageToDrive(payload.folderId, payload.title, payload.imageBase64);
      case 'deleteImage':        return deleteImage(payload.fileId);
      case 'getPublicFolders':   return getPublicFolders();
      case 'getPublicImages':    return getPublicImages(payload.folderId);
      default: return jsonResponse({ success: false, message: 'Action tidak dikenali.' });
    }
  } catch (error) { 
    return jsonResponse({ success: false, message: error.toString() }); 
  }
}

// =========================================================================
// 3. FUNGSI DATABASE JADWAL
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
      let rawTgl = data[i][0];
      if (!rawTgl) continue;
      
      let tanggalStr = (rawTgl instanceof Date) ? Utilities.formatDate(rawTgl, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(rawTgl);
      
      if (!db[tanggalStr]) {
        const dateObj = new Date(tanggalStr + "T00:00:00");
        const isRabu = dateObj.getDay() === 3;
        
        db[tanggalStr] = {
          title: isRabu ? "Ibadah Permintaan Doa (Rabu)" : "Ibadah Sabat (Sabtu)",
          time: isRabu ? "19:30 WIB - selesai" : "10:00 - 13:00 WIB",
          sekolahSabatTime: "11:45 - 12:40 WIB",
          khotbahTime: "10:00 - 11:45 WIB",
          petugas: [], sekolahSabat: [], khotbah: [], diakon: [], musik: [], perjamuan: [], susunan: {}
        };
      }

      for (let j = 1; j < headers.length; j++) {
        const tugas = headers[j];
        if (!tugas) continue; 

        let val = data[i][j];
        if (jsonKey === 'susunan') {
          if (val === 'Ya' || val === true || val === 'TRUE') val = true;
          else if (val === 'Tidak' || val === false || val === 'FALSE' || val === '') val = false;
          db[tanggalStr].susunan[tugas] = val;
        } else {
          db[tanggalStr][jsonKey].push({ 
            tugas: tugas, 
            nama: String(val || '')
          });
        }
      }
    }
  }
  return db;
}

function saveJadwal(tanggal, tableData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const grouped = {};

  Object.values(CATEGORY_MAP).forEach(s => {
    grouped[s] = {};
  });

  tableData.forEach(row => {
    const sName = CATEGORY_MAP[row[1]];
    if (sName) {
      grouped[sName][row[2]] = row[3];
    }
  });

  for (const [sName, taskData] of Object.entries(grouped)) {
    let sheet = ss.getSheetByName(sName);
    if (!sheet) sheet = ss.insertSheet(sName);
    
    let currentData = sheet.getDataRange().getValues();
    let headers = currentData[0];
    
    Object.keys(taskData).forEach(t => { 
      if (!headers.includes(t)) {
        headers.push(t);
        sheet.getRange(1, headers.length).setValue(t).setFontWeight("bold");
      }
    });

    const rowArr = new Array(headers.length).fill('');
    rowArr[0] = tanggal;
    
    Object.entries(taskData).forEach(([t, n]) => { 
      let idx = headers.indexOf(t); 
      if (idx !== -1 && idx > 0) rowArr[idx] = n; 
    });

    let rIdx = currentData.findIndex(r => {
      let d = r[0];
      let ds = (d instanceof Date) ? Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(d);
      return ds === tanggal;
    });

    if (rIdx !== -1) {
      sheet.getRange(rIdx + 1, 1, 1, rowArr.length).setValues([rowArr]);
    } else if (Object.keys(taskData).length > 0) {
      sheet.appendRow(rowArr);
    }
  }
  return jsonResponse({ success: true });
}

// =========================================================================
// 4. PEJABAT, WARTA, HERO & PENGATURAN
// =========================================================================

function savePejabat(dataPejabat, kategoriPejabat) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_PEJABAT);
  if (!sheet) sheet = ss.insertSheet(SHEET_PEJABAT);
  
  let targetFolderId = getOrCreateNestedFolder("Pejabat_Images");
  const rows = dataPejabat.map(p => {
    let img = p.img;
    if (img && img.startsWith('data:image')) {
      // Abaikan error upload per-individu jika ada yang gagal agar yang lain selamat
      try { img = uploadFileToDrive(img, "PEJABAT_" + Date.now() + ".jpg", targetFolderId); } 
      catch(e) { img = ""; }
    }
    return [p.id, p.jabatan, p.nama, "'" + p.wa, img, p.kategori];
  });
  
  sheet.clear();
  sheet.appendRow(['ID', 'Jabatan', 'Nama', 'WA', 'Image_URL', 'Kategori']);
  if (rows.length > 0) sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  
  saveSettingRecord('KATEGORI_PEJABAT', JSON.stringify(kategoriPejabat));
  return jsonResponse({ success: true });
}

function getPejabatDB() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_PEJABAT);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  return data.slice(1).filter(r => r[0]).map(r => ({
    id: r[0], jabatan: r[1], nama: r[2], wa: r[3], img: r[4], kategori: r[5] || "Lainnya"
  }));
}

function saveHeroImages(urlsJson) {
  try {
    const urls = JSON.parse(urlsJson);
    const targetFolderId = getOrCreateNestedFolder("Hero_Carousel");
    
    const processedUrls = urls.map((url, i) => {
      if (url.startsWith('data:image')) {
        try { return uploadFileToDrive(url, "HERO_" + i + "_" + Date.now() + ".webp", targetFolderId); }
        catch(e) { return url; }
      }
      return url;
    });
    
    saveSettingRecord('HERO_IMAGE_URL', JSON.stringify(processedUrls));
    return jsonResponse({ success: true, updatedUrls: processedUrls });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function saveWarta(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_WARTA);
  if (!sheet) sheet = ss.insertSheet(SHEET_WARTA);
  
  let finalUrls = [];
  
  if (payload.gambarUrl) {
    const targetFolderId = getOrCreateNestedFolder("Warta_Images");
    const images = payload.gambarUrl.split('|||'); // Pecah string gambar multi
    
    for (let i = 0; i < images.length; i++) {
      let img = images[i].trim();
      if (img.startsWith('data:image')) {
        try {
          let uploadedUrl = uploadFileToDrive(img, "WARTA_" + Date.now() + "_" + i + ".jpg", targetFolderId);
          if (uploadedUrl) finalUrls.push(uploadedUrl);
        } catch (e) {
          // Tangkap error jika 1 gambar gagal agar gambar lain tetap bisa jalan
          console.error("Gagal upload gambar warta ke-" + i, e);
        }
      } else if (img !== "") {
        finalUrls.push(img); 
      }
    }
  }
  
  let stringUrlUntukDisimpan = finalUrls.join('|||'); // Gabung kembali untuk spreadsheet
  
  sheet.appendRow([new Date(), payload.judul, payload.isi, stringUrlUntukDisimpan, payload.penulis]);
  return jsonResponse({ success: true });
}

function updateWarta(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  const row = payload.rowIndex;
  
  let finalUrls = [];
  
  if (payload.gambarUrl) {
    const targetFolderId = getOrCreateNestedFolder("Warta_Images");
    const images = payload.gambarUrl.split('|||');
    
    for (let i = 0; i < images.length; i++) {
      let img = images[i].trim();
      if (img.startsWith('data:image')) {
        try {
          let uploadedUrl = uploadFileToDrive(img, "WARTA_" + Date.now() + "_" + i + ".jpg", targetFolderId);
          if (uploadedUrl) finalUrls.push(uploadedUrl);
        } catch (e) {
          console.error("Gagal update gambar warta ke-" + i, e);
        }
      } else if (img !== "") {
        finalUrls.push(img); // Pertahankan gambar yang tidak diganti
      }
    }
  }
  
  let stringUrlUntukDisimpan = finalUrls.join('|||');
  
  sheet.getRange(row, 2, 1, 4).setValues([[payload.judul, payload.isi, stringUrlUntukDisimpan, payload.penulis]]);
  return jsonResponse({ success: true });
}

function deleteWarta(row) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  sheet.deleteRow(row);
  return jsonResponse({ success: true });
}

function getDaftarWarta() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_WARTA);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  return data.slice(1).map((r, i) => ({
    rowIndex: i + 2,
    tanggal: r[0] ? Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "dd MMM yyyy") : '',
    judul: r[1], 
    isi: r[2], 
    gambarUrl: r[3], 
    penulis: r[4]
  })).filter(w => w.judul);
}

// =========================================================================
// 5. SETTINGS & UTILITIES
// =========================================================================

function getInitialData() {
  return jsonResponse({
    success: true,
    dataPejabat: getPejabatDB(),
    jadwalDB: getJadwalDB(),
    kategoriPejabat: getKategoriDB(),
    youtubeUrl: getSetting('YOUTUBE_URL') || "https://www.youtube.com/embed/videoseries?list=UUaTPS74NOHACRYU0zInVZ4g",
    heroImageUrl: getSetting('HERO_IMAGE_URL') || "[]",
    pengumuman: getSetting('PENGUMUMAN_DATA') || '{"header":"Pengumuman","isi":""}',
    daftarWarta: getDaftarWarta()
  });
}

function getSetting(key) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_PENGATURAN);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  const row = data.find(r => r[0] === key);
  return row ? row[1] : null;
}

function saveSettingRecord(key, value) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_PENGATURAN);
  if (!sheet) sheet = ss.insertSheet(SHEET_PENGATURAN);
  
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => r[0] === key);
  if (idx !== -1) sheet.getRange(idx + 1, 2).setValue(value);
  else sheet.appendRow([key, value]);
}

function saveSetting(key, value) { 
  saveSettingRecord(key, value); 
  return jsonResponse({ success: true }); 
}

function getKategoriDB() { 
  let v = getSetting('KATEGORI_PEJABAT'); 
  return v ? JSON.parse(v) : ["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"]; 
}

function changePassword(o, n) { 
  const current = getSetting('PASSWORD') || 'admin123';
  if (o === current) { 
    saveSettingRecord('PASSWORD', n); 
    return jsonResponse({ success: true }); 
  } 
  return jsonResponse({ success: false, message: 'Password lama salah.' }); 
}

function getOrCreateNestedFolder(name) {
  const root = DriveApp.getRootFolder();
  let master;
  const masterItr = root.getFoldersByName("Pisgah_Web");
  if (masterItr.hasNext()) master = masterItr.next();
  else master = root.createFolder("Pisgah_Web");
  
  let sub;
  const subItr = master.getFoldersByName(name);
  if (subItr.hasNext()) sub = subItr.next();
  else sub = master.createFolder(name);
  
  sub.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return sub.getId();
}

function uploadFileToDrive(base64, name, folderId) {
  // Jika gagal mendecode base64, kita lempar (throw) error agar ditangkap blok try-catch di luarnya
  const folder = DriveApp.getFolderById(folderId);
  const split = base64.split(',');
  const contentType = split[0].split(';')[0].replace('data:', '');
  const blob = Utilities.newBlob(Utilities.base64Decode(split[1]), contentType, name);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // Menggunakan Endpoint Download Langsung (uc?export=view) untuk menghindari gambar pecah (thumbnail)
  return "https://drive.google.com/uc?export=view&id=" + file.getId();
}

// --- GALERI / FOLDER DRIVE ---
function getPublicFolders() {
  try {
    const parentFolder = DriveApp.getFolderById(FOLDER_GALERI_ID);
    const folders = parentFolder.getFolders();
    const list = [];
    while (folders.hasNext()) {
      const f = folders.next();
      list.push({ id: f.getId(), name: f.getName() });
    }
    return jsonResponse({ success: true, folders: list });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function getPublicImages(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const media = [];
    while (files.hasNext()) {
      const f = files.next();
      const mime = f.getMimeType();
      const type = mime.startsWith('video/') ? 'video' : 'image';
      media.push({
        id: f.getId(),
        title: f.getName(),
        type: type,
        url: f.getDownloadUrl(),
        // Untuk thumbnail di galeri admin, kita tetap bisa pakai endpoint ini, atau bisa diganti uc juga.
        thumbnailUrl: "https://drive.google.com/uc?export=view&id=" + f.getId()
      });
    }
    return jsonResponse({ success: true, media: media });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function createImageFolder(name) {
  try {
    const parent = DriveApp.getFolderById(FOLDER_GALERI_ID);
    const newFolder = parent.createFolder(name);
    newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function uploadImageToDrive(folderId, title, base64) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const split = base64.split(',');
    const contentType = split[0].split(';')[0].replace('data:', '');
    const blob = Utilities.newBlob(Utilities.base64Decode(split[1]), contentType, title);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return jsonResponse({ success: true, id: file.getId() });
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

function jsonResponse(d) { 
  return ContentService.createTextOutput(JSON.stringify(d)).setMimeType(ContentService.MimeType.JSON); 
}