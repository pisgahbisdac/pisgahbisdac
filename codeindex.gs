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
const SHEET_DOA = 'Pokok_Doa';
const SHEET_KALENDER = 'Agenda_Tahunan';
const SHEET_ULTAH = 'Ulang_Tahun_Jemaat';
const SHEET_KONFIRMASI_PETUGAS = 'Konfirmasi_Petugas';
const SHEET_LAGU_TAMBAHAN = 'Lagu_Tambahan';

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
  if (e.parameter.action === 'getCustomSongs') {
    return getCustomSongs();
  }
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
    if (action === 'getCustomSongs') return getCustomSongs();
    if (action === 'submitPrayer') return submitPrayer(payload.prayer);
    if (action === 'incrementPrayerCount') return incrementPrayerCount(payload.id);
    if (action === 'saveOfficerAttendance') return saveOfficerAttendance(payload.recordKey, payload.payload);

    // B. Verifikasi Keamanan Admin
    const currentPassword = getSetting('PASSWORD') || 'admin123';

    // Public actions yang tidak perlu password
    const publicActions = ['getPublicFolders', 'getPublicImages', 'verifyPassword', 'getBooks', 'getCustomSongs', 'submitPrayer', 'incrementPrayerCount', 'saveOfficerAttendance'];

    // Check password hanya untuk admin actions
    if (!publicActions.includes(action) && payload.password !== currentPassword && action !== 'changePassword') {
      return jsonResponse({ success: false, message: 'Akses Ditolak: Password salah.' });
    }

    // C. Aksi Admin
    switch (action) {
      case 'changePassword': return changePassword(payload.oldPassword, payload.newPassword);
      case 'saveYoutubeUrl':
        saveSettingRecord('YOUTUBE_URL', payload.url);
        if (payload.title !== undefined) saveSettingRecord('YOUTUBE_TITLE', payload.title);
        if (payload.channelTitle !== undefined) saveSettingRecord('YOUTUBE_CHANNEL_TITLE', payload.channelTitle);
        return jsonResponse({ success: true });
      case 'saveLiveUrl': return saveSetting('LIVE_URL', payload.url);
      case 'saveHeroImage': return saveHeroImages(payload.url);
      case 'savePengumuman': return saveSetting('PENGUMUMAN_DATA', payload.pengumuman);
      case 'saveKontakGereja': return saveSetting('KONTAK_GEREJA', payload.kontakGereja);
      case 'savePerjamuanDate':
        saveSettingRecord('PERJAMUAN_DATE', payload.tanggal);
        saveSettingRecord('PERPULUHAN_DATE', payload.tanggalPerpuluhan);
        if (payload.catatanPerjamuan !== undefined) saveSettingRecord('PERJAMUAN_NOTE', payload.catatanPerjamuan);
        if (payload.catatanPerpuluhan !== undefined) saveSettingRecord('PERPULUHAN_NOTE', payload.catatanPerpuluhan);
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

      // -- Lagu Sion Tambahan --
      case 'addCustomSong': return addCustomSong(payload.data || payload);
      case 'updateCustomSong': return updateCustomSong(payload.data || payload);
      case 'deleteCustomSong': return deleteCustomSong(payload.data || payload.id);

      // Di handler doPost, tambahkan case ini:
      case 'saveAnthemUrl': 
        saveSettingRecord('ANTHEM_URL', payload.url);
        if (payload.url2 !== undefined) saveSettingRecord('ANTHEM_URL2', payload.url2);
        if (payload.title !== undefined) saveSettingRecord('ANTHEM_TITLE', payload.title);
        if (payload.title2 !== undefined) saveSettingRecord('ANTHEM_TITLE2', payload.title2);
        return jsonResponse({ success: true });
        
      case 'saveCarouselEvents':
        return saveCarouselEvents(payload.carouselEvents);

      case 'saveCarouselVideos':
        saveSettingRecord('CAROUSEL_VIDEOS', typeof payload.carouselVideos === 'string' ? payload.carouselVideos : JSON.stringify(payload.carouselVideos));
        return jsonResponse({ success: true });

      // -- Pastoral, Pokok Doa, Kalender & Ulang Tahun Jemaat --
      case 'savePrayerRequests': return savePrayerRequests(payload.prayers);
      case 'saveAnnualCalendar': return saveAnnualCalendar(payload.calendarItems);
      case 'saveMemberBirthdays': return saveMemberBirthdays(payload.birthdays);

      default:
        return jsonResponse({ success: false, message: 'Action doPost tidak dikenali.' });
    }
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  }
}

// =========================================================================
// HELPER: KONVERSI LINK LAMA KE LINK AMAN (THUMBNAIL / DIRECT CDN)
// =========================================================================
function makeSafeImageUrl(url) {
  if (!url) return "";
  // Dukungan untuk objek slide carousel (berisi url, badge, title, subtitle)
  if (typeof url === 'object') {
    let copy = {};
    for (let key in url) { copy[key] = url[key]; }
    if (copy.url && typeof copy.url === 'string') copy.url = makeSafeImageUrl(copy.url);
    if (copy.imageUrl && typeof copy.imageUrl === 'string') copy.imageUrl = makeSafeImageUrl(copy.imageUrl);
    return copy;
  }
  if (typeof url !== 'string') return "";
  
  // Format Google Drive: drive.google.com/uc?id=, drive.google.com/thumbnail?id=, drive.google.com/file/d/
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
    if (ucMatch && ucMatch[1]) {
      return "https://lh3.googleusercontent.com/d/" + ucMatch[1];
    }
    const fileDMatch = url.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    if (fileDMatch && fileDMatch[1]) {
      return "https://lh3.googleusercontent.com/d/" + fileDMatch[1];
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
      try {
        let hash = getMd5Hash(url);
        let targetFolderId = getOrCreateNestedFolder("Warta_Images");
        let safeTitle = judul ? judul.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30) : "Gambar";
        let fileName = "Warta_" + safeTitle + "_" + (i + 1) + "_" + hash + ".jpg";
        let uploadedUrl = uploadFileToDrive(url, fileName, targetFolderId);
        if (uploadedUrl) {
          processedUrls.push(uploadedUrl);
        } else if (url.length <= 48000) {
          processedUrls.push(url);
        }
      } catch (err) {
        // Cegah hilangnya foto jika operasi Drive bermasalah, tetap simpan base64 jika muat di sel Sheets
        if (url && url.length <= 48000) {
          processedUrls.push(url);
        }
      }
    } else if (url) {
      processedUrls.push(makeSafeImageUrl(url));
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
    anthemUrl: getSetting('ANTHEM_URL') || '',
    anthemUrl2: getSetting('ANTHEM_URL2') || '',
    anthemTitle: getSetting('ANTHEM_TITLE') || 'Adventist Church Anthem',
    anthemTitle2: getSetting('ANTHEM_TITLE2') || 'Video Tambahan',
    youtubeTitle: getSetting('YOUTUBE_TITLE') || 'Video Penting',
    youtubeChannelTitle: getSetting('YOUTUBE_CHANNEL_TITLE') || 'Youtube Channel',
    liveUrl: getSetting('LIVE_URL') || "https://www.youtube.com/embed/live_stream?channel=UCaTPS74NOHACRYU0zInVZ4g",
    heroImageUrl: JSON.stringify(heroImages),
    pengumuman: getSetting('PENGUMUMAN_DATA') || JSON.stringify({ header: "Pengumuman", isi: "" }),
    kontakGereja: getSetting('KONTAK_GEREJA'),
    daftarWarta: getDaftarWarta(),
    perjamuanDate: getSetting('PERJAMUAN_DATE') || '',
    perpuluhanDate: getSetting('PERPULUHAN_DATE') || '',
    perjamuanNote: getSetting('PERJAMUAN_NOTE') || '',
    perpuluhanNote: getSetting('PERPULUHAN_NOTE') || '',
    daftarRekening: getSetting('DAFTAR_REKENING') || '',
    legacyNamaBank: getSetting('NAMA_BANK') || 'Mandiri',
    legacyRekeningBank: getSetting('REKENING_BANK') || '1090001711043',
    legacyAtasNama: getSetting('ATAS_NAMA') || 'GMAHK PISGAH BISDAC',
    legacyQrisUrl: getSetting('QRIS_URL') || '',
    carouselEvents: getSetting('CAROUSEL_EVENTS') || '',
    carouselVideos: getSetting('CAROUSEL_VIDEOS') || '',
    daftarDoa: getDoaDB(),
    daftarKalender: getKalenderDB(),
    daftarUltah: getUltahDB(),
    konfirmasiPetugas: getKonfirmasiPetugasDB(),
    customSongs: getCustomSongsData()
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

    let formattedDate = '';
    if (data[i][0]) {
      try {
        let d = new Date(data[i][0]);
        if (!isNaN(d.getTime())) {
          formattedDate = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
        }
      } catch (e) {
        formattedDate = String(data[i][0]);
      }
    }

    wartaList.push({
      rowIndex: i + 1,
      tanggal: formattedDate,
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
  let publishDate = new Date();
  if (payload.tanggal) {
    let customDate = new Date(payload.tanggal);
    if (!isNaN(customDate.getTime())) {
      publishDate = customDate;
    }
  }
  sheet.appendRow([publishDate, payload.judul, payload.isi, finalGambarUrl, payload.penulis]);
  return jsonResponse({ success: true });
}

function updateWarta(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WARTA);
  let finalGambarUrl = processMultipleImages(payload.gambarUrl, payload.judul);
  if (payload.tanggal) {
    let customDate = new Date(payload.tanggal);
    if (!isNaN(customDate.getTime())) {
      sheet.getRange(payload.rowIndex, 1).setValue(customDate);
    }
  }
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

          let canonicalKey = tugas;
          const tLower = String(tugas).toLowerCase().trim();
          if (tLower === 'sslagutema' || tLower.includes('outro tutup') || tLower.includes('lagu tema ss')) canonicalKey = 'ssLaguTema';
          else if (tLower === 'klagurespon' || tLower.includes('lagu respon') || tLower.includes('syafaat')) canonicalKey = 'kLaguRespon';
          else if (tLower === 'klagutema' || tLower.includes('lagu tema khotbah') || tLower.includes('jemaat duduk')) canonicalKey = 'kLaguTema';
          else if (tLower === 'ssayatinti' || tLower === 'ayat inti ss' || tLower === 'ayat inti (ss)') canonicalKey = 'ssAyatInti';
          else if (tLower === 'sslagubuka' || tLower.includes('lagu buka ss')) canonicalKey = 'ssLaguBuka';
          else if (tLower === 'sslagututup' || tLower.includes('lagu tutup ss')) canonicalKey = 'ssLaguTutup';
          else if (tLower === 'kayatbersahutan' || tLower.includes('ayat bersahutan')) canonicalKey = 'kAyatBersahutan';
          else if (tLower === 'klagubuka' || tLower.includes('lagu buka khotbah')) canonicalKey = 'kLaguBuka';
          else if (tLower === 'kayatinti' || tLower.includes('ayat inti khotbah')) canonicalKey = 'kAyatInti';
          else if (tLower === 'klagututup' || tLower.includes('lagu tutup khotbah')) canonicalKey = 'kLaguTutup';

          db[tanggal].susunan[canonicalKey] = nama;
          if (canonicalKey !== tugas) {
            db[tanggal].susunan[tugas] = nama;
          }
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
      let found = headers.includes(tugas);
      if (!found && sheetName === CATEGORY_MAP['Susunan Acara']) {
        const tLower = String(tugas).toLowerCase().trim();
        for (let c = 0; c < headers.length; c++) {
          const hLower = String(headers[c]).toLowerCase().trim();
          if (
            (tLower === 'sslagutema' && (hLower.includes('outro tutup') || hLower.includes('lagu tema ss'))) ||
            (tLower === 'klagurespon' && (hLower.includes('lagu respon') || hLower.includes('syafaat'))) ||
            (tLower === 'klagutema' && (hLower.includes('lagu tema khotbah') || hLower.includes('jemaat duduk'))) ||
            (tLower === 'ssayatinti' && hLower.includes('ayat inti ss')) ||
            (tLower === 'sslagubuka' && hLower.includes('lagu buka ss')) ||
            (tLower === 'sslagututup' && hLower.includes('lagu tutup ss')) ||
            (tLower === 'kayatbersahutan' && hLower.includes('ayat bersahutan')) ||
            (tLower === 'klagubuka' && hLower.includes('lagu buka khotbah')) ||
            (tLower === 'kayatinti' && hLower.includes('ayat inti khotbah')) ||
            (tLower === 'klagututup' && hLower.includes('lagu tutup khotbah'))
          ) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        headers.push(tugas);
        headersModified = true;
      }
    }

    if (headersModified) {
      if (headers.length > sheet.getMaxColumns()) {
        sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
      }
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }

    const rowArray = new Array(headers.length).fill('');
    rowArray[0] = tanggal;

    for (const [tugas, nama] of Object.entries(taskData)) {
      let colIndex = headers.indexOf(tugas);
      if (colIndex === -1 && sheetName === CATEGORY_MAP['Susunan Acara']) {
        const tLower = String(tugas).toLowerCase().trim();
        for (let c = 0; c < headers.length; c++) {
          const hLower = String(headers[c]).toLowerCase().trim();
          if (
            (tLower === 'sslagutema' && (hLower.includes('outro tutup') || hLower.includes('lagu tema ss'))) ||
            (tLower === 'klagurespon' && (hLower.includes('lagu respon') || hLower.includes('syafaat'))) ||
            (tLower === 'klagutema' && (hLower.includes('lagu tema khotbah') || hLower.includes('jemaat duduk'))) ||
            (tLower === 'ssayatinti' && hLower.includes('ayat inti ss')) ||
            (tLower === 'sslagubuka' && hLower.includes('lagu buka ss')) ||
            (tLower === 'sslagututup' && hLower.includes('lagu tutup ss')) ||
            (tLower === 'kayatbersahutan' && hLower.includes('ayat bersahutan')) ||
            (tLower === 'klagubuka' && hLower.includes('lagu buka khotbah')) ||
            (tLower === 'kayatinti' && hLower.includes('ayat inti khotbah')) ||
            (tLower === 'klagututup' && hLower.includes('lagu tutup khotbah'))
          ) {
            colIndex = c;
            break;
          }
        }
      }
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

    if (rowArray.length > sheet.getMaxColumns()) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), rowArray.length - sheet.getMaxColumns());
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
    while (subFolders.hasNext()) {
      const f = subFolders.next();
      let coverUrl = '';
      try {
        const files = f.getFiles();
        while (files.hasNext()) {
          const file = files.next();
          const mime = file.getMimeType();
          if (mime.startsWith('image/')) {
            coverUrl = "https://drive.google.com/uc?export=view&id=" + file.getId();
            break;
          }
        }
      } catch (err) {}
      folders.push({ id: f.getId(), name: f.getName(), coverUrl: coverUrl });
    }
    return jsonResponse({ success: true, folders: folders });
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
      return "https://lh3.googleusercontent.com/d/" + existingFile.getId();
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

    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (eShare) {
      console.warn("Peringatan setSharing Drive: " + eShare);
    }

    return "https://lh3.googleusercontent.com/d/" + file.getId();
  } catch (e) {
    throw new Error("Gagal upload ke Drive: " + e.message);
  }
}

function uploadImageToDrive(folderId, title, base64Data) {
  try {
    let ext = ".jpg";
    if (base64Data && (base64Data.includes('image/png') || base64Data.startsWith('iVBORw'))) {
      ext = ".png";
    } else if (base64Data && (base64Data.includes('image/webp') || base64Data.startsWith('UklG'))) {
      ext = ".webp";
    }
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
    images = images.slice(0, 10); // Batasi maksimal 10 slide carousel

    let updatedImages = [];
    let targetFolderId = getOrCreateNestedFolder("Hero_Images");

    for (let i = 0; i < images.length; i++) {
      let item = images[i];
      if (typeof item === 'object' && item !== null) {
        let slide = {};
        for (let key in item) { slide[key] = item[key]; }
        let imgUrl = slide.url || slide.imageUrl || '';
        if (imgUrl && typeof imgUrl === 'string' && !imgUrl.startsWith('http') && (imgUrl.startsWith('data:image') || imgUrl.length > 500)) {
          let hash = getMd5Hash(imgUrl);
          let fileName = "Hero_Banner_" + hash + ".jpg";
          let uploadedUrl = uploadFileToDrive(imgUrl, fileName, targetFolderId);
          if (uploadedUrl) slide.url = uploadedUrl;
        }
        updatedImages.push(slide);
      } else if (item && typeof item === 'string' && !item.startsWith('http') && (item.startsWith('data:image') || item.length > 500)) {
        let hash = getMd5Hash(item);
        let fileName = "Hero_Banner_" + hash + ".jpg";
        let uploadedUrl = uploadFileToDrive(item, fileName, targetFolderId);
        if (uploadedUrl) updatedImages.push(uploadedUrl);
      } else if (item) {
        updatedImages.push(item);
      }
    }

    saveSettingRecord('HERO_IMAGE_URL', JSON.stringify(updatedImages));
    return jsonResponse({ success: true, updatedUrls: updatedImages });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function saveCarouselEvents(payloadEvents) {
  try {
    let events = typeof payloadEvents === 'string' ? JSON.parse(payloadEvents) : payloadEvents;
    if (!Array.isArray(events)) events = [];

    let targetFolderId = getOrCreateNestedFolder("Acara_Images");
    for (let i = 0; i < events.length; i++) {
      let evt = events[i];
      if (evt && evt.imageUrl && typeof evt.imageUrl === 'string' && !evt.imageUrl.startsWith('http') && (evt.imageUrl.startsWith('data:image') || evt.imageUrl.length > 500)) {
        let hash = getMd5Hash(evt.imageUrl);
        let safeTitle = evt.title ? evt.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30) : "Acara";
        let fileName = "Acara_" + safeTitle + "_" + hash + ".jpg";
        let uploadedUrl = uploadFileToDrive(evt.imageUrl, fileName, targetFolderId);
        if (uploadedUrl) {
          evt.imageUrl = uploadedUrl;
        }
      }
    }
    saveSettingRecord('CAROUSEL_EVENTS', JSON.stringify(events));
    return jsonResponse({ success: true, updatedEvents: events });
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

// =========================================================================
// 7B. HANDLER LAGU SION TAMBAHAN
// =========================================================================

function getOrCreateSongSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_LAGU_TAMBAHAN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_LAGU_TAMBAHAN);
    const headers = [['ID', 'Nomor', 'Judul', 'Pengarang', 'Nada_Ketukan', 'Verses_JSON', 'Lirik_Teks', 'Updated_At']];
    sheet.getRange(1, 1, 1, 8).setValues(headers).setBackground('#C49A45').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 80);
    sheet.setColumnWidth(3, 220);
    sheet.setColumnWidth(4, 150);
    sheet.setColumnWidth(5, 100);
    sheet.setColumnWidth(6, 200);
    sheet.setColumnWidth(7, 300);
    sheet.setColumnWidth(8, 150);
  }
  return sheet;
}

function getCustomSongsData() {
  try {
    const sheet = getOrCreateSongSheet();
    if (sheet.getLastRow() <= 1) return [];
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
    return rows
      .filter(r => String(r[0]).trim() !== '' || String(r[1]).trim() !== '')
      .map(r => {
        let verses = [];
        try {
          if (r[5]) verses = JSON.parse(r[5]);
        } catch (e) {
          verses = [];
        }
        return {
          id: String(r[0] || ('LS_' + r[1])),
          number: parseInt(r[1], 10) || 0,
          title: String(r[2] || ''),
          artist: String(r[3] || ''),
          keyTime: String(r[4] || ''),
          verses: verses,
          rawLyrics: String(r[6] || ''),
          isCustom: true
        };
      })
      .filter(s => s.number > 0 && s.title.trim() !== '');
  } catch (e) {
    return [];
  }
}

function getCustomSongs() {
  try {
    const data = getCustomSongsData();
    return jsonResponse({ success: true, status: 'success', data: data });
  } catch (e) {
    return jsonResponse({ success: false, status: 'error', message: e.toString() });
  }
}

function addCustomSong(data) {
  try {
    const sheet = getOrCreateSongSheet();
    const newId = 'LS_' + (data.number || new Date().getTime());
    const versesJson = typeof data.verses === 'string' ? data.verses : JSON.stringify(data.verses || []);
    sheet.appendRow([
      newId,
      parseInt(data.number, 10) || '',
      data.title || '',
      data.artist || '',
      data.keyTime || '',
      versesJson,
      data.rawLyrics || '',
      new Date().toISOString()
    ]);
    return jsonResponse({ success: true, status: 'success', id: newId, message: 'Lagu berhasil ditambahkan' });
  } catch (e) {
    return jsonResponse({ success: false, status: 'error', message: e.toString() });
  }
}

function updateCustomSong(data) {
  try {
    const sheet = getOrCreateSongSheet();
    if (sheet.getLastRow() <= 1) return jsonResponse({ success: false, message: 'Lagu tidak ditemukan' });
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
    const targetId = String(data.id || ('LS_' + data.number)).trim();
    const versesJson = typeof data.verses === 'string' ? data.verses : JSON.stringify(data.verses || []);

    for (let i = 0; i < rows.length; i++) {
      const rowId = String(rows[i][0]).trim();
      const rowNum = String(rows[i][1]).trim();
      if (rowId === targetId || (data.number && rowNum === String(data.number))) {
        sheet.getRange(i + 2, 2, 1, 7).setValues([[
          parseInt(data.number, 10) || rows[i][1],
          data.title || '',
          data.artist || '',
          data.keyTime || '',
          versesJson,
          data.rawLyrics || '',
          new Date().toISOString()
        ]]);
        return jsonResponse({ success: true, status: 'success', message: 'Lagu berhasil diperbarui' });
      }
    }
    return jsonResponse({ success: false, status: 'error', message: 'Lagu tidak ditemukan' });
  } catch (e) {
    return jsonResponse({ success: false, status: 'error', message: e.toString() });
  }
}

function deleteCustomSong(songIdOrNum) {
  try {
    const id = String(songIdOrNum).trim();
    const sheet = getOrCreateSongSheet();
    if (sheet.getLastRow() <= 1) return jsonResponse({ success: false, message: 'Lagu tidak ditemukan' });
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    for (let i = 0; i < rows.length; i++) {
      const rowId = String(rows[i][0]).trim();
      const rowNum = String(rows[i][1]).trim();
      if (rowId === id || rowNum === id || ('LS_' + rowNum) === id) {
        sheet.deleteRow(i + 2);
        return jsonResponse({ success: true, status: 'success', message: 'Lagu berhasil dihapus' });
      }
    }
    return jsonResponse({ success: false, status: 'error', message: 'Lagu tidak ditemukan' });
  } catch (e) {
    return jsonResponse({ success: false, status: 'error', message: e.toString() });
  }
}

// =========================================================================
// 8. HANDLER POKOK DOA, KALENDER KEGIATAN, ULANG TAHUN & KONFIRMASI PETUGAS
// =========================================================================

function getOrCreateDoaSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_DOA);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_DOA);
    const headers = [['ID', 'Tanggal Dibuat', 'Nama Pengirim', 'Anonim', 'Kategori', 'Isi Pokok Doa', 'Privasi', 'Jumlah Doa', 'Sudah Didoakan']];
    sheet.getRange(1, 1, 1, 9).setValues(headers).setBackground('#4A7045').setFontColor('#FFFFFF').setFontWeight('bold');
    const initialSeed = [
      ['pray_seed_1', '2026-10-21T12:00:00.000Z', 'Majelis & Pelayan Jemaat', false, 'Pelayanan', 'Kiranya Tuhan mencurahkan Roh Kudus bagi seluruh keluarga besar GMAHK Jemaat Pisgah BISDAC - Batam agar semakin bertumbuh dalam iman, kasih persaudaraan, dan semangat penginjilan.', 'public', 18, false],
      ['pray_seed_2', '2026-10-22T09:30:00.000Z', 'Hamba Tuhan (Anonim)', true, 'Kesehatan', 'Mohon dukungan doa pada Ibadah Rabu Malam untuk kesembuhan dan pemulihan kesehatan orang tua serta anggota jemaat yang sedang dalam masa perawatan.', 'public', 14, false],
      ['pray_seed_3', '2026-10-22T15:15:00.000Z', 'Keluarga Jemaat Pisgah', false, 'Syukur', 'Mengucap syukur atas pemeliharaan Tuhan sepanjang pekan ini dalam pekerjaan, pendidikan anak-anak, dan berkat kesehatan yang Tuhan nyatakan.', 'public', 21, false]
    ];
    sheet.getRange(2, 1, initialSeed.length, 9).setValues(initialSeed);
  }
  return sheet;
}

function getDoaDB() {
  try {
    const sheet = getOrCreateDoaSheet();
    if (sheet.getLastRow() <= 1) return [];
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues();
    const list = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        list.push({
          id: String(row[0]),
          createdAt: row[1] instanceof Date ? row[1].toISOString() : String(row[1] || ''),
          senderName: String(row[2] || ''),
          isAnonymous: Boolean(row[3] === true || String(row[3]).toLowerCase() === 'true'),
          category: String(row[4] || 'Lainnya'),
          content: String(row[5] || ''),
          privacy: String(row[6] || 'public'),
          prayedCount: parseInt(row[7], 10) || 0,
          isAnswered: Boolean(row[8] === true || String(row[8]).toLowerCase() === 'true')
        });
      }
    }
    return list;
  } catch (e) {
    return [];
  }
}

function submitPrayer(prayer) {
  try {
    if (!prayer) return jsonResponse({ success: false, message: 'Data doa tidak boleh kosong' });
    const sheet = getOrCreateDoaSheet();
    const newId = prayer.id || ('pray_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6));
    const nowIso = prayer.createdAt || new Date().toISOString();
    sheet.appendRow([
      newId,
      nowIso,
      prayer.senderName || '',
      Boolean(prayer.isAnonymous),
      prayer.category || 'Lainnya',
      prayer.content || '',
      prayer.privacy || 'public',
      parseInt(prayer.prayedCount, 10) || 1,
      Boolean(prayer.isAnswered)
    ]);
    return jsonResponse({ success: true, id: newId, message: 'Pokok doa berhasil dikirim dan dicatat di spreadsheet.' });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function incrementPrayerCount(prayerId) {
  try {
    const sheet = getOrCreateDoaSheet();
    if (sheet.getLastRow() <= 1) return jsonResponse({ success: false, message: 'Doa tidak ditemukan' });
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]).trim() === String(prayerId).trim()) {
        const cell = sheet.getRange(i + 2, 8);
        const currentVal = parseInt(cell.getValue(), 10) || 0;
        cell.setValue(currentVal + 1);
        return jsonResponse({ success: true, nextCount: currentVal + 1 });
      }
    }
    return jsonResponse({ success: false, message: 'Doa tidak ditemukan' });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function savePrayerRequests(prayers) {
  try {
    const sheet = getOrCreateDoaSheet();
    sheet.clear();
    const headers = [['ID', 'Tanggal Dibuat', 'Nama Pengirim', 'Anonim', 'Kategori', 'Isi Pokok Doa', 'Privasi', 'Jumlah Doa', 'Sudah Didoakan']];
    sheet.getRange(1, 1, 1, 9).setValues(headers).setBackground('#4A7045').setFontColor('#FFFFFF').setFontWeight('bold');
    if (Array.isArray(prayers) && prayers.length > 0) {
      const rows = prayers.map(p => [
        p.id || ('pray_' + Date.now()),
        p.createdAt || new Date().toISOString(),
        p.senderName || '',
        Boolean(p.isAnonymous),
        p.category || 'Lainnya',
        p.content || '',
        p.privacy || 'public',
        parseInt(p.prayedCount, 10) || 0,
        Boolean(p.isAnswered)
      ]);
      sheet.getRange(2, 1, rows.length, 9).setValues(rows);
    }
    return jsonResponse({ success: true, message: 'Daftar pokok doa berhasil diperbarui di spreadsheet.' });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function getOrCreateKalenderSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_KALENDER);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_KALENDER);
    const headers = [['ID', 'Judul Kegiatan', 'Tanggal (YYYY-MM-DD)', 'Triwulan', 'Kategori', 'Lokasi', 'Keterangan']];
    sheet.getRange(1, 1, 1, 7).setValues(headers).setBackground('#2C3F21').setFontColor('#FFFFFF').setFontWeight('bold');
    const initialSeed = [
      ['cal_1', 'Perjamuan Kudus Triwulan I', "'2026-03-28", 1, 'Ibadah Sakramen', 'GMAHK Jemaat Pisgah BISDAC - Batam', 'Kebaktian Perjamuan Kudus & Basuh Kaki Triwulan I'],
      ['cal_2', 'Pekan Doa Rumah Tangga & Keluarga', "'2026-05-09", 2, 'Pelayanan Keluarga', 'GMAHK Jemaat Pisgah BISDAC - Batam', 'Kebaktian Kebangunan Rohani Keluarga Advent'],
      ['cal_3', 'Perjamuan Kudus Triwulan II', "'2026-06-27", 2, 'Ibadah Sakramen', 'GMAHK Jemaat Pisgah BISDAC - Batam', 'Kebaktian Perjamuan Kudus & Basuh Kaki Triwulan II'],
      ['cal_4', 'Sabat Pathfinder & Adventurer Sedunia', "'2026-09-19", 3, 'Pemuda & Anak', 'GMAHK Jemaat Pisgah BISDAC - Batam', 'Pelayanan Khusus Klub Pathfinder & Adventurer'],
      ['cal_5', 'Perjamuan Kudus Triwulan III', "'2026-09-26", 3, 'Ibadah Sakramen', 'GMAHK Jemaat Pisgah BISDAC - Batam', 'Kebaktian Perjamuan Kudus & Basuh Kaki Triwulan III'],
      ['cal_6', 'Pekan Doa Akhir Tahun & Syukur', "'2026-11-07", 4, 'Kerohanian', 'GMAHK Jemaat Pisgah BISDAC - Batam', 'Pekan Doa Sedunia & Kebaktian Ucapan Syukur'],
      ['cal_7', 'Perjamuan Kudus Triwulan IV & Tutup Tahun', "'2026-12-26", 4, 'Ibadah Sakramen', 'GMAHK Jemaat Pisgah BISDAC - Batam', 'Kebaktian Perjamuan Kudus Penutup Tahun']
    ];
    sheet.getRange(2, 1, initialSeed.length, 7).setValues(initialSeed);
  }
  return sheet;
}

function getKalenderDB() {
  try {
    const sheet = getOrCreateKalenderSheet();
    if (sheet.getLastRow() <= 1) return [];
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
    const list = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        let rawDate = row[2];
        let ymd = '';
        if (rawDate instanceof Date) {
          ymd = Utilities.formatDate(rawDate, 'GMT+7', 'yyyy-MM-dd');
        } else {
          ymd = String(rawDate || '').replace(/['"]/g, '').trim();
        }
        list.push({
          id: String(row[0]),
          title: String(row[1] || ''),
          dateYMD: ymd,
          quarter: parseInt(row[3], 10) || 1,
          category: String(row[4] || 'Kegiatan Gereja'),
          location: String(row[5] || 'GMAHK Jemaat Pisgah BISDAC - Batam'),
          desc: String(row[6] || '')
        });
      }
    }
    return list;
  } catch (e) {
    return [];
  }
}

function saveAnnualCalendar(calendarItems) {
  try {
    const sheet = getOrCreateKalenderSheet();
    sheet.clear();
    const headers = [['ID', 'Judul Kegiatan', 'Tanggal (YYYY-MM-DD)', 'Triwulan', 'Kategori', 'Lokasi', 'Keterangan']];
    sheet.getRange(1, 1, 1, 7).setValues(headers).setBackground('#2C3F21').setFontColor('#FFFFFF').setFontWeight('bold');
    if (Array.isArray(calendarItems) && calendarItems.length > 0) {
      const rows = calendarItems.map(c => [
        c.id || ('cal_' + Date.now()),
        c.title || '',
        "'" + String(c.dateYMD || '').replace(/['"]/g, '').trim(),
        parseInt(c.quarter, 10) || 1,
        c.category || 'Kegiatan Gereja',
        c.location || 'GMAHK Jemaat Pisgah BISDAC - Batam',
        c.desc || ''
      ]);
      sheet.getRange(2, 1, rows.length, 7).setValues(rows);
    }
    return jsonResponse({ success: true, message: 'Agenda kalender tahunan berhasil disimpan di spreadsheet.' });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function getOrCreateUltahSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_ULTAH);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_ULTAH);
    const headers = [['ID', 'Nama Jemaat', 'Tanggal', 'Bulan', 'Kategori', 'No. WhatsApp']];
    sheet.getRange(1, 1, 1, 6).setValues(headers).setBackground('#D19B45').setFontColor('#FFFFFF').setFontWeight('bold');
  }
  return sheet;
}

function getUltahDB() {
  try {
    const sheet = getOrCreateUltahSheet();
    if (sheet.getLastRow() <= 1) return [];
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
    const list = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[0] || row[1]) {
        list.push({
          id: String(row[0] || ('bday_' + (i + 1))),
          nama: String(row[1] || ''),
          birthDay: parseInt(row[2], 10) || 1,
          birthMonth: parseInt(row[3], 10) || 1,
          kategori: String(row[4] || 'Anggota Jemaat'),
          wa: String(row[5] || '').replace(/['"]/g, '').trim()
        });
      }
    }
    return list;
  } catch (e) {
    return [];
  }
}

function saveMemberBirthdays(birthdays) {
  try {
    const sheet = getOrCreateUltahSheet();
    sheet.clear();
    const headers = [['ID', 'Nama Jemaat', 'Tanggal', 'Bulan', 'Kategori', 'No. WhatsApp']];
    sheet.getRange(1, 1, 1, 6).setValues(headers).setBackground('#D19B45').setFontColor('#FFFFFF').setFontWeight('bold');
    if (Array.isArray(birthdays) && birthdays.length > 0) {
      const rows = birthdays.map(b => [
        b.id || ('bday_' + Date.now()),
        b.nama || '',
        parseInt(b.birthDay, 10) || 1,
        parseInt(b.birthMonth, 10) || 1,
        b.kategori || 'Anggota Jemaat',
        "'" + String(b.wa || '').replace(/['"]/g, '').trim()
      ]);
      sheet.getRange(2, 1, rows.length, 6).setValues(rows);
    }
    return jsonResponse({ success: true, message: 'Daftar ulang tahun jemaat berhasil disimpan di spreadsheet.' });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}

function getOrCreateKonfirmasiPetugasSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_KONFIRMASI_PETUGAS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_KONFIRMASI_PETUGAS);
    const headers = [['Record Key', 'Tanggal Ibadah', 'Tugas', 'Nama Petugas', 'Status', 'Catatan', 'Waktu Update']];
    sheet.getRange(1, 1, 1, 7).setValues(headers).setBackground('#1C3318').setFontColor('#FFFFFF').setFontWeight('bold');
  }
  return sheet;
}

function getKonfirmasiPetugasDB() {
  try {
    const sheet = getOrCreateKonfirmasiPetugasSheet();
    if (sheet.getLastRow() <= 1) return {};
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
    const map = {};
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        map[String(row[0])] = {
          tanggal: String(row[1] || ''),
          tugas: String(row[2] || ''),
          nama: String(row[3] || ''),
          status: String(row[4] || 'hadir'),
          note: String(row[5] || ''),
          updatedAt: row[6] || Date.now()
        };
      }
    }
    return map;
  } catch (e) {
    return {};
  }
}

function saveOfficerAttendance(recordKey, payload) {
  try {
    const sheet = getOrCreateKonfirmasiPetugasSheet();
    const key = String(recordKey || '').trim();
    if (!key) return jsonResponse({ success: false, message: 'Record key kosong' });

    if (sheet.getLastRow() > 1) {
      const keys = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
      for (let i = 0; i < keys.length; i++) {
        if (String(keys[i][0]).trim() === key) {
          if (payload === null) {
            sheet.deleteRow(i + 2);
            return jsonResponse({ success: true, message: 'Konfirmasi berhasil dihapus' });
          } else {
            sheet.getRange(i + 2, 2, 1, 6).setValues([[
              payload.tanggal || '',
              payload.tugas || '',
              payload.nama || '',
              payload.status || 'hadir',
              payload.note || '',
              new Date().toISOString()
            ]]);
            return jsonResponse({ success: true, message: 'Konfirmasi petugas diperbarui' });
          }
        }
      }
    }

    if (payload !== null) {
      sheet.appendRow([
        key,
        payload.tanggal || '',
        payload.tugas || '',
        payload.nama || '',
        payload.status || 'hadir',
        payload.note || '',
        new Date().toISOString()
      ]);
    }
    return jsonResponse({ success: true, message: 'Konfirmasi petugas disimpan di spreadsheet' });
  } catch (e) {
    return jsonResponse({ success: false, message: e.toString() });
  }
}
