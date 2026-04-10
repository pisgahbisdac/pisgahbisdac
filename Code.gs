// =========================================================================
// KONFIGURASI TABEL JADWAL
// =========================================================================
var SCHEDULE_CONFIGS = [
  { sheetName: "Jadwal Rabu", key: "petugas", headers: ["Tanggal", "Pemimpin Acara", "Renungan", "Tempat", "Persembahan Kas", "Lagu Pujian"] },
  { sheetName: "Jadwal SS", key: "sekolahSabat", headers: ["Tanggal", "Pianis", "Presider", "Ayat Inti & Doa Buka", "Berita Misi", "Doa Tutup"] },
  { sheetName: "Jadwal Khotbah", key: "khotbah", headers: ["Tanggal", "Pianis", "Khotbah", "Doa Syafaat", "Presider", "Cerita Anak-anak", "Song Leader", "Lagu Pujian"] },
  { sheetName: "Jadwal Diakon", key: "diakon", headers: ["Tanggal", "Diakon"] },
  { sheetName: "Jadwal Musik", key: "musik", headers: ["Tanggal", "Pianis SS", "Pianis Khotbah"] },
  { sheetName: "Jadwal Perjamuan", key: "perjamuan", headers: ["Tanggal", "Pelayan Perjamuan (L1)", "Pelayan Perjamuan (L2)", "Pelayan Perjamuan (P1)", "Pelayan Perjamuan (P2)"] }
];

// =========================================================================
// FUNGSI UPLOAD GAMBAR KE GOOGLE DRIVE DAN HASILKAN THUMBNAIL URL
// =========================================================================
function uploadImageToDrive(base64Data, fileName) {
  try {
    var base64 = base64Data;
    if (base64Data && base64Data.includes(',')) {
      base64 = base64Data.split(',')[1];
    }
    var blob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/jpeg', fileName);
    var folderName = "Warta_Images_PISGAH";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileId = file.getId();
    // Thumbnail URL yang stabil
    return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000";
  } catch (e) {
    console.error("Upload gambar gagal: " + e.toString());
    return "";
  }
}

// =========================================================================
// INISIALISASI SHEET
// =========================================================================
function checkAndInitSheets() {
  var ss = SpreadsheetApp.openById("1FbdIMEHbY5PY61kx3SFTLjq2CZUISmeQObuO_qPJ5MM");
  
  // Sheet Pengaturan
  var sPengaturan = ss.getSheetByName("Pengaturan");
  if (!sPengaturan) {
    sPengaturan = ss.insertSheet("Pengaturan");
    sPengaturan.appendRow(["Konfigurasi", "Nilai"]);
    sPengaturan.appendRow(["PASSWORD", "admin"]);
    sPengaturan.appendRow(["YOUTUBE_URL", "https://www.youtube-nocookie.com/embed?listType=playlist&list=UUz6rQ_5zP0Y0c8V7aKx2jLQ"]);
    sPengaturan.appendRow(["PENGUMUMAN", ""]);
    sPengaturan.appendRow(["KATEGORI_PEJABAT", JSON.stringify(["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"])]);
    sPengaturan.getRange("A1:B1").setFontWeight("bold");
    sPengaturan.setColumnWidth(1, 150);
    sPengaturan.setColumnWidth(2, 400);
  }
  
  // Sheet Pejabat
  var sPejabat = ss.getSheetByName("Pejabat");
  if (!sPejabat) {
    sPejabat = ss.insertSheet("Pejabat");
    sPejabat.appendRow(["ID", "Jabatan", "Nama", "WhatsApp", "Link Foto", "Kategori"]);
    sPejabat.getRange("A1:F1").setFontWeight("bold");
    sPejabat.setFrozenRows(1);
    var initialPejabat = [
      ["gembala", "Gembala Jemaat", "Pdt. [Nama Gembala]", "62800000000", "https://ui-avatars.com/api/?name=Gembala+Jemaat&background=eff6ff&color=1e3a8a&size=128", "Gembala"],
      ["ketua", "Ketua Jemaat", "Bpk. [Nama Ketua]", "62800000000", "https://ui-avatars.com/api/?name=Ketua+Jemaat&background=eff6ff&color=1e3a8a&size=128", "Officers"],
      ["sekertaris", "Sekertaris", "Bpk. [Nama Sekertaris]", "62800000000", "https://ui-avatars.com/api/?name=Sekertaris&background=eff6ff&color=1e3a8a&size=128", "Officers"],
      ["bendahara", "Bendahara", "Ibu [Nama Bendahara]", "62800000000", "https://ui-avatars.com/api/?name=Bendahara&background=f0fdf4&color=14532d&size=128", "Officers"],
      ["penginjilan", "Penginjilan", "Bpk. [Nama Penginjilan]", "62800000000", "https://ui-avatars.com/api/?name=Penginjilan+2&background=f0fdf4&color=14532d&size=128", "Departemen & Pelayanan"],
      ["ss", "Sekolah Sabat", "Ibu. [Nama Sekolah Sabat]", "62800000000", "https://ui-avatars.com/api/?name=Sekolah+Sabat&background=fffbeb&color=78350f&size=128", "Departemen & Pelayanan"],
      ["diakon", "Ketua Diakon", "Ibu. [Nama Ketua Diakon]", "62800000000", "https://ui-avatars.com/api/?name=Ketua+Diakon&background=fffbeb&color=78350f&size=128", "Departemen & Pelayanan"],
      ["rumah", "Rumah Tangga", "Sdr. [Nama Rumah Tangga]", "62800000000", "https://ui-avatars.com/api/?name=Rumah+Tangga&background=e0e7ff&color=3730a3&size=128", "Departemen & Pelayanan"],
      ["pemuda", "Pemuda", "Sdr. [Nama Pemuda]", "62800000000", "https://ui-avatars.com/api/?name=Pemuda&background=e0e7ff&color=3730a3&size=128", "Departemen & Pelayanan"],
      ["hotline", "Hotline", "Bpk. [Nama Hotline]", "62800000000", "https://ui-avatars.com/api/?name=Hotline&background=f3f4f6&color=1f2937&size=128", "Lainnya"],
      ["komunikasi", "Komunikasi", "Sdr. [Nama Komunikasi]", "62800000000", "https://ui-avatars.com/api/?name=Kominikasi&background=faf5ff&color=581c87&size=128", "Lainnya"]
    ];
    sPejabat.getRange(2, 1, initialPejabat.length, 6).setValues(initialPejabat);
  }
  
  // Sheet Jadwal
  for (var i = 0; i < SCHEDULE_CONFIGS.length; i++) {
    var conf = SCHEDULE_CONFIGS[i];
    var sheet = ss.getSheetByName(conf.sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(conf.sheetName);
      sheet.appendRow(conf.headers);
      sheet.getRange(1, 1, 1, conf.headers.length).setFontWeight("bold").setBackground("#eef2f6");
      sheet.setFrozenRows(1);
    }
  }
  
  // Sheet Susunan Lagu
  var sSusunan = ss.getSheetByName("Susunan_Lagu");
  if (!sSusunan) {
    sSusunan = ss.insertSheet("Susunan_Lagu");
    sSusunan.appendRow([
      "Tanggal", "SS Lagu Buka", "SS Lagu Tutup", "Khotbah Ayat Bersahutan",
      "Khotbah Lagu Buka", "Pujian 1 Tampil", "Pujian 1 Judul",
      "Pujian 2 Tampil", "Pujian 2 Judul", "Pujian 3 Tampil", "Pujian 3 Judul",
      "Ayat Inti", "Lagu Tutup"
    ]);
    sSusunan.setFrozenRows(1);
  }
  
  // Sheet Warta
  var sWarta = ss.getSheetByName("Warta");
  if (!sWarta) {
    sWarta = ss.insertSheet("Warta");
    sWarta.appendRow(["Tanggal", "Judul", "Isi", "URL Gambar", "Penulis"]);
    sWarta.getRange(1,1,1,5).setFontWeight("bold");
  } else {
    // Cek apakah kolom Penulis sudah ada
    var headers = sWarta.getRange(1,1,1,sWarta.getLastColumn()).getValues()[0];
    if (headers.indexOf("Penulis") === -1) {
      sWarta.getRange(1, sWarta.getLastColumn()+1).setValue("Penulis");
    }
  }
  
  return ss;
}

// =========================================================================
// MENGAMBIL DATA (doGet)
// =========================================================================
function doGet(e) {
  var ss = checkAndInitSheets();
  
  // Baca Pengaturan
  var sPengaturan = ss.getSheetByName("Pengaturan");
  var pengData = sPengaturan.getDataRange().getValues();
  var youtubeUrl = "https://www.youtube-nocookie.com/embed?listType=playlist&list=UUz6rQ_5zP0Y0c8V7aKx2jLQ";
  var pengumuman = "";
  var kategoriPejabat = ["Gembala", "Officers", "Departemen & Pelayanan", "Lainnya"];
  for (var i = 1; i < pengData.length; i++) {
    if (pengData[i][0] === "YOUTUBE_URL") youtubeUrl = pengData[i][1].toString();
    if (pengData[i][0] === "PENGUMUMAN") pengumuman = pengData[i][1].toString();
    if (pengData[i][0] === "KATEGORI_PEJABAT") {
      try { kategoriPejabat = JSON.parse(pengData[i][1].toString()); } catch(e) {}
    }
  }
  
  // Baca Pejabat
  var sPejabat = ss.getSheetByName("Pejabat");
  var pData = sPejabat.getDataRange().getValues();
  var dataPejabat = [];
  for (var i = 1; i < pData.length; i++) {
    if (pData[i][0]) {
      dataPejabat.push({
        id: pData[i][0].toString(),
        jabatan: pData[i][1].toString(),
        nama: pData[i][2].toString(),
        wa: pData[i][3].toString().replace(/'/g, ''),
        img: pData[i][4].toString(),
        kategori: pData[i][5] ? pData[i][5].toString() : 'Umum'
      });
    }
  }
  
  // Baca Jadwal
  var jadwalDB = {};
  for (var i = 0; i < SCHEDULE_CONFIGS.length; i++) {
    var conf = SCHEDULE_CONFIGS[i];
    var sheet = ss.getSheetByName(conf.sheetName);
    if (!sheet) continue;
    var data = sheet.getDataRange().getValues();
    for (var r = 1; r < data.length; r++) {
      var tglObj = data[r][0];
      if (!tglObj || tglObj === "") continue;
      var dateStr = typeof tglObj === 'object' ? Utilities.formatDate(tglObj, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(tglObj);
      if (!jadwalDB[dateStr]) {
        var isRabu = new Date(dateStr + "T00:00:00").getDay() === 3;
        if (isRabu) {
          jadwalDB[dateStr] = { title: "Ibadah Permintaan Doa (Rabu)", time: "19:30 WIB - selesai", petugas: [] };
        } else {
          jadwalDB[dateStr] = { title: "Ibadah Sabat (Sabtu)", time: "10:00 - 13:00 WIB", sekolahSabatTime: "11:45 - 12:40 WIB", khotbahTime: "10:00 - 11:40 WIB", sekolahSabat: [], khotbah: [], diakon: [], musik: [], perjamuan: [] };
        }
      }
      var taskArray = [];
      for (var c = 1; c < conf.headers.length; c++) {
        taskArray.push({
          tugas: conf.headers[c],
          nama: data[r][c] ? data[r][c].toString() : ""
        });
      }
      jadwalDB[dateStr][conf.key] = taskArray;
    }
  }
  
  // Baca Susunan Lagu
  var sheetSusunan = ss.getSheetByName("Susunan_Lagu");
  if (sheetSusunan) {
    var dataSusunan = sheetSusunan.getDataRange().getValues();
    for (var r = 1; r < dataSusunan.length; r++) {
      var tglObj = dataSusunan[r][0];
      if (!tglObj) continue;
      var dateStr = typeof tglObj === 'object' ? Utilities.formatDate(tglObj, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(tglObj);
      if (!jadwalDB[dateStr]) {
        var isRabu = new Date(dateStr + "T00:00:00").getDay() === 3;
        if (isRabu) {
          jadwalDB[dateStr] = { title: "Ibadah Permintaan Doa (Rabu)", time: "19:30 - selesai", petugas: [] };
        } else {
          jadwalDB[dateStr] = { title: "Ibadah Sabat (Sabtu)", time: "10:00 - 13:00 WIB", sekolahSabatTime: "11:45 - 12:40 WIB", khotbahTime: "10:00 - 11:40 WIB", sekolahSabat: [], khotbah: [], diakon: [], musik: [], perjamuan: [] };
        }
      }
      jadwalDB[dateStr].susunan = {
        ssLaguBuka: dataSusunan[r][1] ? String(dataSusunan[r][1]) : "",
        ssLaguTutup: dataSusunan[r][2] ? String(dataSusunan[r][2]) : "",
        kAyatBersahutan: dataSusunan[r][3] ? String(dataSusunan[r][3]) : "",
        kLaguBuka: dataSusunan[r][4] ? String(dataSusunan[r][4]) : "",
        kLaguPujian1_show: dataSusunan[r][5] === "YA",
        kLaguPujian1_judul: dataSusunan[r][6] ? String(dataSusunan[r][6]) : "",
        kLaguPujian2_show: dataSusunan[r][7] === "YA",
        kLaguPujian2_judul: dataSusunan[r][8] ? String(dataSusunan[r][8]) : "",
        kLaguPujian3_show: dataSusunan[r][9] === "YA",
        kLaguPujian3_judul: dataSusunan[r][10] ? String(dataSusunan[r][10]) : "",
        kAyatInti: dataSusunan[r][11] ? String(dataSusunan[r][11]) : "",
        kLaguTutup: dataSusunan[r][12] ? String(dataSusunan[r][12]) : ""
      };
    }
  }
  
  // Baca Warta (dengan rowIndex)
  var sWarta = ss.getSheetByName("Warta");
  var daftarWarta = [];
  if (sWarta) {
    var wartaData = sWarta.getDataRange().getValues();
    for (var i = 1; i < wartaData.length; i++) {
      if (wartaData[i][0]) {
        daftarWarta.push({
          rowIndex: i + 1,
          tanggal: Utilities.formatDate(wartaData[i][0], Session.getScriptTimeZone(), "yyyy-MM-dd"),
          judul: wartaData[i][1] || "",
          isi: wartaData[i][2] || "",
          gambarUrl: wartaData[i][3] || "",
          penulis: wartaData[i][4] || ""
        });
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    dataPejabat: dataPejabat,
    jadwalDB: jadwalDB,
    youtubeUrl: youtubeUrl,
    pengumuman: pengumuman,
    kategoriPejabat: kategoriPejabat,
    daftarWarta: daftarWarta
  })).setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// MENYIMPAN DATA (doPost)
// =========================================================================
function doPost(e) {
  var ss = checkAndInitSheets();
  var payload = JSON.parse(e.postData.contents);
  var action = payload.action;
  
  var sPengaturan = ss.getSheetByName("Pengaturan");
  var currentPassword = sPengaturan.getRange("B2").getValue().toString();
  
  // Verifikasi password (kecuali verifyPassword dan changePassword)
  if (action !== "verifyPassword" && action !== "changePassword") {
    if (payload.password !== currentPassword) {
      return ContentService.createTextOutput(JSON.stringify({success: false, message: "Akses ditolak, password salah"})).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // 1. Verify password
  if (action === "verifyPassword") {
    var success = (payload.password === currentPassword);
    return ContentService.createTextOutput(JSON.stringify({success: success})).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 2. Change password
  if (action === "changePassword") {
    if (payload.password === currentPassword) {
      sPengaturan.getRange("B2").setValue(payload.newPassword);
      return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({success: false, message: "Password lama salah"})).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // 3. Save YouTube URL
  if (action === "saveYoutubeUrl") {
    var pengData = sPengaturan.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < pengData.length; i++) {
      if (pengData[i][0] === "YOUTUBE_URL") {
        sPengaturan.getRange(i+1, 2).setValue(payload.youtubeUrl);
        found = true;
        break;
      }
    }
    if (!found) sPengaturan.appendRow(["YOUTUBE_URL", payload.youtubeUrl]);
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 4. Save Pengumuman
  if (action === "savePengumuman") {
    var pengData = sPengaturan.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < pengData.length; i++) {
      if (pengData[i][0] === "PENGUMUMAN") {
        sPengaturan.getRange(i+1, 2).setValue(payload.pengumuman);
        found = true;
        break;
      }
    }
    if (!found) sPengaturan.appendRow(["PENGUMUMAN", payload.pengumuman]);
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 5. Save Jadwal
  if (action === "saveJadwal") {
    if (payload.data && payload.data.susunan) {
      simpanSusunanAcaraKeTab(ss, payload.date, payload.data.susunan);
    }
    var targetDateObj = new Date(payload.date + "T00:00:00");
    var isRabu = targetDateObj.getDay() === 3;
    for (var i = 0; i < SCHEDULE_CONFIGS.length; i++) {
      var conf = SCHEDULE_CONFIGS[i];
      if (isRabu && conf.key !== "petugas") continue;
      if (!isRabu && conf.key === "petugas") continue;
      var sheet = ss.getSheetByName(conf.sheetName);
      if (!sheet) continue;
      var tasksFromPayload = payload.data[conf.key] || [];
      var rowData = ["'" + payload.date];
      for (var c = 1; c < conf.headers.length; c++) {
        var taskHeader = conf.headers[c];
        var personName = "";
        for (var p = 0; p < tasksFromPayload.length; p++) {
          if (tasksFromPayload[p].tugas === taskHeader) {
            personName = tasksFromPayload[p].nama;
            break;
          }
        }
        rowData.push(personName);
      }
      var sheetData = sheet.getDataRange().getValues();
      var foundRow = -1;
      for (var r = 1; r < sheetData.length; r++) {
        var dStr = typeof sheetData[r][0] === 'object' ? Utilities.formatDate(sheetData[r][0], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(sheetData[r][0]);
        if (dStr === payload.date) {
          foundRow = r+1;
          break;
        }
      }
      if (foundRow > -1) {
        sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 6. Save Data Pejabat
  if (action === "saveDataPejabat") {
    var sPejabat = ss.getSheetByName("Pejabat");
    if (sPejabat.getLastRow() > 1) {
      sPejabat.getRange(2, 1, sPejabat.getLastRow()-1, 6).clearContent();
    }
    var newRows = [];
    for (var i = 0; i < payload.dataPejabat.length; i++) {
      var p = payload.dataPejabat[i];
      newRows.push([p.id, p.jabatan, p.nama, "'" + p.wa, p.img, p.kategori || "Lainnya"]);
    }
    if (newRows.length > 0) {
      sPejabat.getRange(2, 1, newRows.length, 6).setValues(newRows);
    }
    if (payload.kategoriPejabat) {
      var pengData = sPengaturan.getDataRange().getValues();
      var foundKat = false;
      for (var i = 1; i < pengData.length; i++) {
        if (pengData[i][0] === "KATEGORI_PEJABAT") {
          sPengaturan.getRange(i+1, 2).setValue(JSON.stringify(payload.kategoriPejabat));
          foundKat = true;
          break;
        }
      }
      if (!foundKat) sPengaturan.appendRow(["KATEGORI_PEJABAT", JSON.stringify(payload.kategoriPejabat)]);
    }
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ==================== FITUR WARTA ====================
  // 7. Save Warta (tambah baru)
  if (action === "saveWarta") {
    var sWarta = ss.getSheetByName("Warta");
    if (!sWarta) {
      sWarta = ss.insertSheet("Warta");
      sWarta.appendRow(["Tanggal", "Judul", "Isi", "URL Gambar", "Penulis"]);
      sWarta.getRange(1,1,1,5).setFontWeight("bold");
    }
    var tanggal = new Date();
    var gambarUrl = "";
    if (payload.gambarUrl && payload.gambarUrl.startsWith("data:image")) {
      gambarUrl = uploadImageToDrive(payload.gambarUrl, "warta_" + new Date().getTime() + ".jpg");
    } else {
      gambarUrl = payload.gambarUrl || "";
    }
    sWarta.appendRow([tanggal, payload.judul, payload.isi, gambarUrl, payload.penulis || ""]);
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 8. Update Warta (edit)
  if (action === "updateWarta") {
    try {
      var sWarta = ss.getSheetByName("Warta");
      if (!sWarta) {
        return ContentService.createTextOutput(JSON.stringify({success: false, message: "Sheet Warta tidak ditemukan"}));
      }
      var rowIndex = payload.rowIndex;
      if (!rowIndex || rowIndex < 2) {
        return ContentService.createTextOutput(JSON.stringify({success: false, message: "RowIndex tidak valid"}));
      }
      var gambarUrl = payload.gambarUrl;
      if (payload.gambarUrl && payload.gambarUrl.startsWith("data:image")) {
        gambarUrl = uploadImageToDrive(payload.gambarUrl, "warta_" + new Date().getTime() + ".jpg");
      }
      sWarta.getRange(rowIndex, 2).setValue(payload.judul || "");
      sWarta.getRange(rowIndex, 3).setValue(payload.isi || "");
      sWarta.getRange(rowIndex, 4).setValue(gambarUrl || "");
      sWarta.getRange(rowIndex, 5).setValue(payload.penulis || "");
      return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({success: false, message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // 9. Delete Warta
  if (action === "deleteWarta") {
    var sWarta = ss.getSheetByName("Warta");
    if (!sWarta) {
      return ContentService.createTextOutput(JSON.stringify({success: false, message: "Sheet Warta tidak ditemukan"})).setMimeType(ContentService.MimeType.JSON);
    }
    sWarta.deleteRow(payload.rowIndex);
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false, message: "Aksi tidak dikenali"})).setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// FUNGSI BANTU: Simpan Susunan Acara
// =========================================================================
function simpanSusunanAcaraKeTab(ss, tanggal, susunan) {
  var sheet = ss.getSheetByName("Susunan_Lagu");
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    var rowDate = typeof data[i][0] === 'object' ? Utilities.formatDate(data[i][0], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(data[i][0]);
    if (rowDate === tanggal) {
      rowIndex = i+1;
      break;
    }
  }
  var rowData = [
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
  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

// =========================================================================
// FUNGSI MIGRASI (opsional, jalankan sekali jika perlu)
// =========================================================================
function migrateWartaToThumbnail() {
  var ss = SpreadsheetApp.openById("1FbdIMEHbY5PY61kx3SFTLjq2CZUISmeQObuO_qPJ5MM");
  var sheet = ss.getSheetByName("Warta");
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var url = data[i][3];
    if (url && (url.includes("uc?export=view&id=") || url.includes("file/d/"))) {
      var fileId = null;
      if (url.includes("uc?export=view&id=")) {
        var match = url.match(/id=([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
      } else if (url.includes("file/d/")) {
        var match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
      }
      if (fileId) {
        var newUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000";
        sheet.getRange(i+1, 4).setValue(newUrl);
        Logger.log("Migrated: " + url + " -> " + newUrl);
      }
    }
  }
  Logger.log("Migrasi selesai");
}