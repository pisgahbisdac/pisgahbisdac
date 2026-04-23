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
  if (e && e.parameter && e.parameter.action === 'getData') return getInitialData();
  return syncSpreadsheetStructure();
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    if (action === 'getPublicFolders') return getPublicFolders();
    if (action === 'getPublicImages') return getPublicImages(payload.folderId);
    if (action === 'verifyPassword') return verifyPassword(payload.password);

    const currentPassword = getSetting('PASSWORD') || 'admin123';
    if (payload.password !== currentPassword && action !== 'changePassword') {
      return jsonResponse({ success: false, message: 'Akses Ditolak.' });
    }

    switch (action) {
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
      default: return jsonResponse({ success: false, message: 'Action tidak dikenali.' });
    }
  } catch (error) { return jsonResponse({ success: false, message: error.toString() }); }
}

// =========================================================================
// 3. FUNGSI DATABASE JADWAL (UPDATE: PEMETAAN WAKTU UNTUK UI TERDEKAT)
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
          // Waktu detail untuk tiap sesi (digunakan di Live/Terdekat)
          sekolahSabatTime: "11:45 - 12:40 WIB",
          khotbahTime: "10:00 - 11:45 WIB",
          petugas: [], sekolahSabat: [], khotbah: [], diakon: [], musik: [], perjamuan: [], susunan: {}
        };
      }

      for (let j = 1; j < headers.length; j++) {
        const tugas = headers[j];
        if (j === 0 || !tugas) continue; 

        let val = data[i][j];
        if (jsonKey === 'susunan') {
          if (val === 'Ya' || val === true) val = true;
          else if (val === 'Tidak' || val === false || val === '') val = false;
          db[tanggalStr].susunan[tugas] = val;
        } else {
          // Menambahkan info waktu ke setiap item petugas agar UI bisa langsung membacanya
          let itemTime = "";
          if (jsonKey === 'sekolahSabat') itemTime = "11:45 - 12:40 WIB";
          else if (jsonKey === 'khotbah') itemTime = "10:00 - 11:45 WIB";
          else if (jsonKey === 'petugas') itemTime = "19:30 WIB";

          db[tanggalStr][jsonKey].push({ 
            tugas: tugas, 
            nama: String(val || ''),
            jam: itemTime // Properti baru agar muncul di UI Terdekat
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
// 4. PEJABAT, WARTA & UTILITIES
// =========================================================================

function savePejabat(dataPejabat, kategoriPejabat) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PEJABAT);
  let targetFolderId = getOrCreateNestedFolder("Pejabat_Images");
  const rows = dataPejabat.map(p => {
    let img = p.img;
    if (img && img.startsWith('data:image')) {
      img = uploadFileToDrive(img, "PEJABAT_" + Date.now() + ".jpg", targetFolderId);
    } else if (img && img.includes('drive.google.com')) {
      img = makeSafeImageUrl(img);
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
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PEJABAT);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  return data.slice(1).filter(r => r[0]).map(r => ({
    id: r[0], jabatan: r[1], nama: r[2], wa: r[3], img: r[4], kategori: r[5] || "Lainnya"
  }));
}

function makeSafeImageUrl(url) {
  if (!url || typeof url !== 'string' || url.includes('thumbnail')) return url;
  let fileId = "";
  if (url.includes('id=')) fileId = url.split('id=')[1].split('&')[0];
  else if (url.includes('/d/')) fileId = url.split('/d/')[1].split('/')[0];
  return fileId ? "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1200" : url;
}

function syncSpreadsheetStructure() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  [SHEET_PENGATURAN, SHEET_PEJABAT, SHEET_WARTA].forEach(name => {
    if (!ss.getSheetByName(name)) ss.insertSheet(name);
  });
  return jsonResponse({ success: true, message: 'Struktur diperbarui.' });
}

function getInitialData() {
  return jsonResponse({
    success: true,
    dataPejabat: getPejabatDB(),
    jadwalDB: getJadwalDB(),
    kategoriPejabat: getKategoriDB(),
    youtubeUrl: getSetting('YOUTUBE_URL'),
    heroImageUrl: getSetting('HERO_IMAGE_URL') || "[]",
    pengumuman: getSetting('PENGUMUMAN_DATA'),
    daftarWarta: getDaftarWarta()
  });
}

function getSetting(key) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PENGATURAN);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  const row = data.find(r => r[0] === key);
  return row ? row[1] : null;
}

function saveSettingRecord(key, value) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PENGATURAN);
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => r[0] === key);
  if (idx !== -1) sheet.getRange(idx + 1, 2).setValue(value);
  else sheet.appendRow([key, value]);
}

function saveSetting(key, value) { saveSettingRecord(key, value); return jsonResponse({ success: true }); }
function getKategoriDB() { let v = getSetting('KATEGORI_PEJABAT'); return v ? JSON.parse(v) : ["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"]; }
function verifyPassword(p) { return jsonResponse({ success: p === (getSetting('PASSWORD') || 'admin123') }); }
function changePassword(o, n) { if (o === (getSetting('PASSWORD') || 'admin123')) { saveSettingRecord('PASSWORD', n); return jsonResponse({ success: true }); } return jsonResponse({ success: false }); }

function getOrCreateNestedFolder(name) {
  const root = DriveApp.getRootFolder();
  let master = root.getFoldersByName("Pisgah_Web").hasNext() ? root.getFoldersByName("Pisgah_Web").next() : root.createFolder("Pisgah_Web");
  let sub = master.getFoldersByName(name).hasNext() ? master.getFoldersByName(name).next() : master.createFolder(name);
  sub.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return sub.getId();
}

function uploadFileToDrive(base64, name, folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const split = base64.split(',');
    const blob = Utilities.newBlob(Utilities.base64Decode(split[1]), split[0].split(';')[0].replace('data:', ''), name);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1200";
  } catch (e) { return ""; }
}

function getDaftarWarta() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  return data.slice(1).map((r, i) => ({
    rowIndex: i + 2,
    tanggal: r[0] ? Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "dd MMM yyyy") : '',
    judul: r[1], isi: r[2], gambarUrl: makeSafeImageUrl(r[3]), penulis: r[4]
  }));
}

function jsonResponse(d) { return ContentService.createTextOutput(JSON.stringify(d)).setMimeType(ContentService.MimeType.JSON); }