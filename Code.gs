// =========================================================================
// KONFIGURASI UTAMA
// =========================================================================
const SPREADSHEET_ID = "1A2CnyZkwVQDPxnHaLgYexSoVmh8IwWsRByWapgy6f58";
const IMAGE_PARENT_FOLDER_ID = "1AutGgLJM0AHZhYWGyfrD6TJQ1xpg97fm";

const SCHEDULE_CONFIGS = [
  { sheetName: "Jadwal Rabu", key: "petugas", headers: ["Tanggal", "Pemimpin Acara", "Renungan", "Judul", "Doa Buka", "Doa Tutup", "Tempat", "Lagu Pujian", "Persembahan Kas"] },
  { sheetName: "Jadwal SS", key: "sekolahSabat", headers: ["Tanggal", "Pianis", "Presider", "Ayat Inti & Doa Buka", "Berita Misi", "Doa Tutup"] },
  { sheetName: "Jadwal Khotbah", key: "khotbah", headers: ["Tanggal", "Pianis", "Khotbah", "Doa Syafaat", "Presider", "Song Leader", "Cerita Anak-anak", "Lagu Pujian"] },
  { sheetName: "Jadwal Diakon", key: "diakon", headers: ["Tanggal", "Diakon"] },
  { sheetName: "Jadwal Musik", key: "musik", headers: ["Tanggal", "Pianis SS", "Pianis Khotbah", "Gitar"] },
  { sheetName: "Jadwal Perjamuan", key: "perjamuan", headers: ["Tanggal", "Pelayan Perjamuan (L1)", "Pelayan Perjamuan (L2)", "Pelayan Perjamuan (P1)", "Pelayan Perjamuan (P2)"] }
];

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// GET DATA
// =========================================================================
function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const timezone = Session.getScriptTimeZone();
  
  // Baca sheet Pengaturan
  const sPengaturan = ss.getSheetByName("Pengaturan");
  const pengData = sPengaturan ? sPengaturan.getDataRange().getValues() : [];
  let youtubeUrl = "https://www.youtube.com/embed/videoseries?list=UUaTPS74NOHACRYU0zInVZ4g";
  let pengumuman = "";
  let kategoriPejabat = ["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"];
  
  for (let i = 1; i < pengData.length; i++) {
    if (pengData[i][0] === "YOUTUBE_URL") youtubeUrl = String(pengData[i][1]);
    if (pengData[i][0] === "PENGUMUMAN") pengumuman = String(pengData[i][1]);
    if (pengData[i][0] === "KATEGORI_PEJABAT") {
      try { kategoriPejabat = JSON.parse(pengData[i][1]); } catch(e) {}
    }
  }
  
  // Baca sheet Pejabat
  const sPejabat = ss.getSheetByName("Pejabat");
  const dataPejabat = [];
  if (sPejabat) {
    const pData = sPejabat.getDataRange().getValues();
    for (let i = 1; i < pData.length; i++) {
      if (pData[i][0]) {
        dataPejabat.push({
          id: String(pData[i][0]),
          jabatan: String(pData[i][1]),
          nama: String(pData[i][2]),
          wa: String(pData[i][3]).replace(/'/g, ''),
          img: String(pData[i][4]),
          kategori: pData[i][5] ? String(pData[i][5]) : 'Umum'
        });
      }
    }
  }
  
  // Baca semua jadwal
  const jadwalDB = {};
  SCHEDULE_CONFIGS.forEach(conf => {
    const sheet = ss.getSheetByName(conf.sheetName);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    for (let r = 1; r < data.length; r++) {
      const tglObj = data[r][0];
      if (!tglObj) continue;
      const dateStr = typeof tglObj === 'object' ? Utilities.formatDate(tglObj, timezone, "yyyy-MM-dd") : String(tglObj);
      if (!jadwalDB[dateStr]) initJadwalObj(jadwalDB, dateStr);
      const taskArray = [];
      for (let c = 1; c < conf.headers.length; c++) {
        taskArray.push({ tugas: conf.headers[c], nama: String(data[r][c] || "") });
      }
      jadwalDB[dateStr][conf.key] = taskArray;
    }
  });
  
  // Baca Susunan Lagu
  const sheetSusunan = ss.getSheetByName("Susunan_Lagu");
  if (sheetSusunan) {
    const dataSusunan = sheetSusunan.getDataRange().getValues();
    for (let r = 1; r < dataSusunan.length; r++) {
      const tglObj = dataSusunan[r][0];
      if (!tglObj) continue;
      const dateStr = typeof tglObj === 'object' ? Utilities.formatDate(tglObj, timezone, "yyyy-MM-dd") : String(tglObj);
      if (!jadwalDB[dateStr]) initJadwalObj(jadwalDB, dateStr);
      jadwalDB[dateStr].susunan = {
        ssLaguBuka: String(dataSusunan[r][1] || ""),
        ssLaguTutup: String(dataSusunan[r][2] || ""),
        kAyatBersahutan: String(dataSusunan[r][3] || ""),
        kLaguBuka: String(dataSusunan[r][4] || ""),
        kLaguPujian1_show: dataSusunan[r][5] === "YA",
        kLaguPujian1_judul: String(dataSusunan[r][6] || ""),
        kLaguPujian2_show: dataSusunan[r][7] === "YA",
        kLaguPujian2_judul: String(dataSusunan[r][8] || ""),
        kLaguPujian3_show: dataSusunan[r][9] === "YA",
        kLaguPujian3_judul: String(dataSusunan[r][10] || ""),
        kAyatInti: String(dataSusunan[r][11] || ""),
        kLaguTutup: String(dataSusunan[r][12] || "")
      };
    }
  }
  
  // Baca Warta
  const sWarta = ss.getSheetByName("Warta");
  const daftarWarta = [];
  if (sWarta) {
    const wartaData = sWarta.getDataRange().getValues();
    for (let i = 1; i < wartaData.length; i++) {
      if (wartaData[i][0]) {
        daftarWarta.push({
          rowIndex: i + 1,
          tanggal: Utilities.formatDate(new Date(wartaData[i][0]), timezone, "yyyy-MM-dd"),
          judul: wartaData[i][1] || "",
          isi: wartaData[i][2] || "",
          gambarUrl: wartaData[i][3] || "",
          penulis: wartaData[i][4] || ""
        });
      }
    }
  }
  
  return jsonResponse({ dataPejabat, jadwalDB, youtubeUrl, pengumuman, kategoriPejabat, daftarWarta });
}

function initJadwalObj(db, dateStr) {
  const isRabu = new Date(dateStr + "T00:00:00").getDay() === 3;
  if (isRabu) {
    db[dateStr] = { title: "Ibadah Permintaan Doa (Rabu)", time: "19:30 WIB - selesai", petugas: [] };
  } else {
    db[dateStr] = { title: "Ibadah Sabat (Sabtu)", time: "10:00 - 13:00 WIB", sekolahSabatTime: "11:45 - 12:40 WIB", khotbahTime: "10:00 - 11:40 WIB", sekolahSabat: [], khotbah: [], diakon: [], musik: [], perjamuan: [] };
  }
}



// =========================================================================
// POST DATA
// =========================================================================
function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sPengaturan = ss.getSheetByName("Pengaturan");
  const currentPassword = sPengaturan.getRange("B2").getValue().toString();
  const payload = JSON.parse(e.postData.contents);
  const action = payload.action;
  
  // Endpoint publik (tidak perlu password)
  if (action === 'getPublicImages') {
  return getPublicImagesHandler(payload);
}
  if (action === 'getPublicFolders') {   // <-- TAMBAHKAN INI
  return getPublicFoldersHandler();
}

// Handler untuk daftar folder publik
function getPublicFoldersHandler() {
  try {
    const parent = DriveApp.getFolderById(IMAGE_PARENT_FOLDER_ID);
    const folders = parent.getFolders();
    const list = [];
    while (folders.hasNext()) {
      let f = folders.next();
      list.push({ id: f.getId(), name: f.getName() });
    }
    return jsonResponse({ success: true, folders: list });
  } catch (err) {
    return jsonResponse({ success: false, message: err.toString() });
  }
}

  // Verifikasi password untuk semua aksi lain
  if (action !== "verifyPassword" && action !== "changePassword") {
    if (payload.password !== currentPassword) {
      return jsonResponse({ success: false, message: "Akses ditolak, password salah" });
    }
  }
  
  switch (action) {
    case "verifyPassword":
      return jsonResponse({ success: (payload.password === currentPassword) });
    case "changePassword":
      if (payload.password === currentPassword) {
        sPengaturan.getRange("B2").setValue(payload.newPassword);
        return jsonResponse({ success: true });
      }
      return jsonResponse({ success: false, message: "Password lama salah" });
    case "saveYoutubeUrl":
      updatePengaturan(sPengaturan, "YOUTUBE_URL", payload.youtubeUrl);
      return jsonResponse({ success: true });
    case "savePengumuman":
      updatePengaturan(sPengaturan, "PENGUMUMAN", payload.pengumuman);
      return jsonResponse({ success: true });
    case "saveJadwal":
      if (payload.data && payload.data.susunan) simpanSusunan(ss, payload.date, payload.data.susunan);
      simpanDataJadwal(ss, payload);
      return jsonResponse({ success: true });
    case "saveDataPejabat":
      simpanPejabat(ss, payload, sPengaturan);
      return jsonResponse({ success: true });
    case "saveWarta":
      return jsonResponse(tambahWarta(ss, payload));
    case "updateWarta":
      return jsonResponse(updateWarta(ss, payload));
    case "deleteWarta":
      const sW = ss.getSheetByName("Warta");
      if (sW) sW.deleteRow(payload.rowIndex);
      return jsonResponse({ success: true });
    case "createImageFolder":
      return jsonResponse(handleCreateImageFolder(payload));
    case "listImageFolders":
      return jsonResponse(handleListImageFolders());
    case "uploadImageToDrive":
      return jsonResponse(handleUploadImageToDrive(payload, ss));
    case "listImages":
      return jsonResponse(handleListImages(payload));
    case "deleteImage":
      return jsonResponse(handleDeleteImage(payload));
    default:
      return jsonResponse({ success: false, message: "Aksi tidak dikenali" });
  }
}

// Handler untuk galeri publik
function getPublicImagesHandler(payload) {
  try {
    // Jika payload memiliki folderId, gunakan folder tersebut; jika tidak, gunakan folder induk
    let folderId = payload ? payload.folderId : null;
    let folder;
    if (folderId) {
      folder = DriveApp.getFolderById(folderId);
    } else {
      folder = DriveApp.getFolderById(IMAGE_PARENT_FOLDER_ID);
    }
    const files = folder.getFilesByType(MimeType.JPEG);
    const images = [];
    while (files.hasNext()) {
      const file = files.next();
      images.push({
        id: file.getId(),
        title: file.getName(),
        url: file.getUrl(),
        thumbnailUrl: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w200"
      });
    }
    return jsonResponse({ success: true, images: images });
  } catch (err) {
    return jsonResponse({ success: false, message: err.toString() });
  }
}

// =========================================================================
// FUNGSI PENDUKUNG SIMPAN
// =========================================================================
function updatePengaturan(sheet, key, value) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i+1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function simpanSusunan(ss, tanggal, susunan) {
  const sheet = ss.getSheetByName("Susunan_Lagu");
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const timezone = Session.getScriptTimeZone();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    const rowDate = typeof data[i][0] === 'object' ? Utilities.formatDate(data[i][0], timezone, "yyyy-MM-dd") : String(data[i][0]);
    if (rowDate === tanggal) { rowIndex = i+1; break; }
  }
  const rowData = [
    "'" + tanggal,
    susunan.ssLaguBuka || "",
    susunan.ssLaguTutup || "",
    susunan.kAyatBersahutan || "",
    susunan.kLaguBuka || "",
    susunan.kLaguPujian1_show ? "YA" : "TIDAK",
    susunan.kLaguPujian1_judul || "",
    susunan.kLaguPujian2_show ? "YA" : "TIDAK",
    susunan.kLaguPujian2_judul || "",
    susunan.kLaguPujian3_show ? "YA" : "TIDAK",
    susunan.kLaguPujian3_judul || "",
    susunan.kAyatInti || "",
    susunan.kLaguTutup || ""
  ];
  if (rowIndex > -1) sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  else sheet.appendRow(rowData);
}

function simpanDataJadwal(ss, payload) {
  const isRabu = new Date(payload.date + "T00:00:00").getDay() === 3;
  const timezone = Session.getScriptTimeZone();
  SCHEDULE_CONFIGS.forEach(conf => {
    if (isRabu && conf.key !== "petugas") return;
    if (!isRabu && conf.key === "petugas") return;
    const sheet = ss.getSheetByName(conf.sheetName);
    if (!sheet) return;
    const tasksFromPayload = payload.data[conf.key] || [];
    const rowData = ["'" + payload.date];
    for (let c = 1; c < conf.headers.length; c++) {
      const taskHeader = conf.headers[c];
      const match = tasksFromPayload.find(t => t.tugas === taskHeader);
      rowData.push(match ? match.nama : "");
    }
    const sheetData = sheet.getDataRange().getValues();
    let foundRow = -1;
    for (let r = 1; r < sheetData.length; r++) {
      const dStr = typeof sheetData[r][0] === 'object' ? Utilities.formatDate(sheetData[r][0], timezone, "yyyy-MM-dd") : String(sheetData[r][0]);
      if (dStr === payload.date) { foundRow = r+1; break; }
    }
    if (foundRow > -1) sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
    else sheet.appendRow(rowData);
  });
}

function simpanPejabat(ss, payload, sPengaturan) {
  const sPejabat = ss.getSheetByName("Pejabat");
  const lastRow = sPejabat.getLastRow();
  if (lastRow > 1) sPejabat.getRange(2, 1, lastRow-1, 6).clearContent();
  const newRows = payload.dataPejabat.map(p => [p.id, p.jabatan, p.nama, "'" + p.wa, p.img, p.kategori || "Lainnya"]);
  if (newRows.length > 0) sPejabat.getRange(2, 1, newRows.length, 6).setValues(newRows);
  if (payload.kategoriPejabat) updatePengaturan(sPengaturan, "KATEGORI_PEJABAT", JSON.stringify(payload.kategoriPejabat));
}

function tambahWarta(ss, payload) {
  let sWarta = ss.getSheetByName("Warta");
  if (!sWarta) {
    sWarta = ss.insertSheet("Warta");
    sWarta.appendRow(["Tanggal", "Judul", "Isi", "URL Gambar", "Penulis"]);
    sWarta.getRange(1,1,1,5).setFontWeight("bold");
  }
  let gambarUrl = payload.gambarUrl || "";
  if (gambarUrl.startsWith("data:image")) gambarUrl = uploadImageToDrive(gambarUrl, "warta_" + Date.now() + ".jpg");
  sWarta.appendRow([new Date(), payload.judul, payload.isi, gambarUrl, payload.penulis || ""]);
  return { success: true };
}

function updateWarta(ss, payload) {
  const sWarta = ss.getSheetByName("Warta");
  if (!sWarta) return { success: false, message: "Sheet Warta tidak ditemukan" };
  if (!payload.rowIndex || payload.rowIndex < 2) return { success: false, message: "RowIndex tidak valid" };
  let gambarUrl = payload.gambarUrl || "";
  if (gambarUrl.startsWith("data:image")) gambarUrl = uploadImageToDrive(gambarUrl, "warta_" + Date.now() + ".jpg");
  sWarta.getRange(payload.rowIndex, 2, 1, 4).setValues([[payload.judul || "", payload.isi || "", gambarUrl, payload.penulis || ""]]);
  return { success: true };
}

// =========================================================================
// MANAJEMEN DRIVE & GAMBAR
// =========================================================================
function uploadImageToDrive(base64Data, fileName) {
  try {
    const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const blob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/jpeg', fileName);
    const folderName = "Warta_Images_PISGAH";
    const folders = DriveApp.getFoldersByName(folderName);
    const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
  } catch (e) {
    console.error("Upload gambar gagal: " + e.toString());
    return "";
  }
}

function handleCreateImageFolder(data) {
  try {
    const parent = DriveApp.getFolderById(IMAGE_PARENT_FOLDER_ID);
    const folders = parent.getFoldersByName(data.folderName);
    const folder = folders.hasNext() ? folders.next() : parent.createFolder(data.folderName);
    return { success: true, folderId: folder.getId(), folderName: folder.getName() };
  } catch (e) { return { success: false, message: e.toString() }; }
}

function handleListImageFolders() {
  try {
    const parent = DriveApp.getFolderById(IMAGE_PARENT_FOLDER_ID);
    const folders = parent.getFolders();
    const list = [];
    while (folders.hasNext()) {
      let f = folders.next();
      list.push({ id: f.getId(), name: f.getName() });
    }
    return { success: true, folders: list };
  } catch (e) { return { success: false, message: e.toString() }; }
}

function handleUploadImageToDrive(data, ss) {
  try {
    let folder = DriveApp.getFolderById(data.folderId);
    let blob;
    let fileName = data.title;
    let finalMimeType = "image/jpeg";
    let finalExtension = ".jpg";

    // 1. Proses data Base64 dari payload
    let base64Data = data.imageBase64;
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }

    // 2. Cek apakah ini file HEIC (berdasarkan ekstensi nama file)
    let isHeic = fileName.toLowerCase().endsWith('.heic');
    if (isHeic) {
      console.log("File HEIC terdeteksi, mencoba konversi ke JPEG...");
      // Simpan sementara sebagai file blob
      let tempBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'application/octet-stream', fileName + '.heic');
      let tempFile = folder.createFile(tempBlob);
      let tempFileId = tempFile.getId();

      // Gunakan thumbnail dari Drive sebagai sumber konversi
      let thumbnailUrl = `https://drive.google.com/thumbnail?id=${tempFileId}&sz=w1000`;
      let imageBlob = UrlFetchApp.fetch(thumbnailUrl, {
        headers: { authorization: "Bearer " + ScriptApp.getOAuthToken() }
      }).getBlob();

      blob = imageBlob.getAs("image/jpeg");
      fileName = fileName.replace(/\.heic$/i, '');

      // Hapus file sementara
      tempFile.setTrashed(true);
    } else {
      // 3. Jika bukan HEIC, proses seperti biasa
      let decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png', fileName + '.png');
      blob = decodedBlob.getAs("image/jpeg");
    }

    // 4. Buat file final di folder tujuan
    let finalBlob = blob.setName(fileName + finalExtension);
    let file = folder.createFile(finalBlob);
    let url = "https://drive.google.com/uc?export=view&id=" + file.getId();

    // 5. Catat ke sheet log (opsional)
    let sheet = ss.getSheetByName('Gambar');
    if (!sheet) {
      sheet = ss.insertSheet('Gambar');
      sheet.appendRow(['ID', 'Title', 'FolderId', 'URL', 'Tanggal', 'OriginalFormat']);
    }
    sheet.appendRow([file.getId(), fileName, data.folderId, url, new Date().toISOString(), isHeic ? 'HEIC (converted)' : 'Direct']);

    return { success: true, fileId: file.getId(), url: url };
  } catch (e) {
    console.error("Upload error: " + e.toString());
    return { success: false, message: e.toString() };
  }
}

// =========================================================================
// SETUP PERTAMA KALI (Jalankan manual sekali)
// =========================================================================
function SETUP_PERTAMA_KALI() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  let sPengaturan = ss.getSheetByName("Pengaturan");
  if (!sPengaturan) {
    sPengaturan = ss.insertSheet("Pengaturan");
    sPengaturan.appendRow(["Konfigurasi", "Nilai"]);
    sPengaturan.appendRow(["PASSWORD", "admin"]);
    sPengaturan.appendRow(["YOUTUBE_URL", "https://www.youtube.com/embed/videoseries?list=UUaTPS74NOHACRYU0zInVZ4g"]);
    sPengaturan.appendRow(["PENGUMUMAN", ""]);
    sPengaturan.appendRow(["KATEGORI_PEJABAT", JSON.stringify(["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"])]);
    sPengaturan.getRange("A1:B1").setFontWeight("bold");
    sPengaturan.setColumnWidth(1, 150);
    sPengaturan.setColumnWidth(2, 400);
  }
  
  let sPejabat = ss.getSheetByName("Pejabat");
  if (!sPejabat) {
    sPejabat = ss.insertSheet("Pejabat");
    sPejabat.appendRow(["ID", "Jabatan", "Nama", "WhatsApp", "Link Foto", "Kategori"]);
    sPejabat.getRange("A1:F1").setFontWeight("bold");
    sPejabat.setFrozenRows(1);
    sPejabat.appendRow(["gembala", "Gembala Jemaat", "Pdt. [Nama Gembala]", "'62800000000", "https://ui-avatars.com/api/?name=Gembala+Jemaat&background=eff6ff&color=1e3a8a&size=128", "Gembala"]);
  }
  
  SCHEDULE_CONFIGS.forEach(conf => {
    let sheet = ss.getSheetByName(conf.sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(conf.sheetName);
      sheet.appendRow(conf.headers);
      sheet.getRange(1, 1, 1, conf.headers.length).setFontWeight("bold").setBackground("#eef2f6");
      sheet.setFrozenRows(1);
    }
  });
  
  let sSusunan = ss.getSheetByName("Susunan_Lagu");
  if (!sSusunan) {
    sSusunan = ss.insertSheet("Susunan_Lagu");
    sSusunan.appendRow(["Tanggal", "SS Lagu Buka", "SS Lagu Tutup", "Khotbah Ayat Bersahutan", "Khotbah Lagu Buka", "Pujian 1 Tampil", "Pujian 1 Judul", "Pujian 2 Tampil", "Pujian 2 Judul", "Pujian 3 Tampil", "Pujian 3 Judul", "Ayat Inti", "Lagu Tutup"]);
    sSusunan.setFrozenRows(1);
  }
  
  let sWarta = ss.getSheetByName("Warta");
  if (!sWarta) {
    sWarta = ss.insertSheet("Warta");
    sWarta.appendRow(["Tanggal", "Judul", "Isi", "URL Gambar", "Penulis"]);
    sWarta.getRange(1,1,1,5).setFontWeight("bold");
  }
  
  Logger.log("SETUP SELESAI! Silakan deploy ulang Web App.");
}