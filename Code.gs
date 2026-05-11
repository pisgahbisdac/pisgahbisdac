var sheetId = "1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc"; // ID Spreadsheet Anda

function normalizeText(text) {

  return String(text)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function doGet(e) {
  var ss = SpreadsheetApp.openById(sheetId);
  
  if (e.parameter.action === "verifyPin") {
    var sheet = ss.getSheetByName("Pengaturan");
    
    // Jika tab Pengaturan belum ada, buat otomatis
    if (!sheet) {
      sheet = ss.insertSheet("Pengaturan");
      sheet.appendRow(["Nama Akun / Kelas", "PIN AKSES", "HAK AKSES"]);
      sheet.appendRow(["Admin Utama", "1234", "Admin"]);
      sheet.appendRow(["Sekretaris Dewasa", "5555", "Dewasa"]);
      sheet.appendRow(["Sekretaris Anak", "8888", "Anak"]);
      sheet.appendRow(["Sekretaris Khotbah", "9999", "Khotbah"]); // PENAMBAHAN AKUN KHOTBAH
      sheet.getRange("A1:C1").setFontWeight("bold").setBackground("#D4AF37");
      sheet.setColumnWidth(1, 200);
      sheet.setColumnWidth(2, 150);
      sheet.setColumnWidth(3, 150);
    }
    
    var data = sheet.getDataRange().getValues();
    var inputPin = e.parameter.pin.toString();
    var isValid = false;
    var accountName = "";
    var accessLevel = "Admin";
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1].toString() === inputPin) {
        isValid = true;
        accountName = data[i][0];
        if (data[i].length > 2 && data[i][2]) {
            accessLevel = data[i][2].toString();
        } else {
            var accLower = accountName.toLowerCase();
            if (accLower.indexOf("anak") !== -1) accessLevel = "Anak";
            else if (accLower.indexOf("dewasa") !== -1) accessLevel = "Dewasa";
            else if (accLower.indexOf("khotbah") !== -1) accessLevel = "Khotbah"; // DETEKSI KHOTBAH
        }
        break;
      }
    }
    
    var result = { valid: isValid, account: accountName, accessLevel: accessLevel };
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  if (!e || !e.parameter) {

  return ContentService
    .createTextOutput("Error: Request kosong")
    .setMimeType(ContentService.MimeType.TEXT);
}

  var lock = LockService.getScriptLock();
  lock.waitLock(30000); 
  
  try {
    var ss = SpreadsheetApp.openById(sheetId);
    var action = e.parameter.action;
    var waktu = e.parameter.waktu;

// =====================================================
// SIMPAN DATABASE ANGGOTA JEMAAT
// =====================================================
if (action === "saveMember") {

  var nama = e.parameter.nama || "-";
  var kategori = e.parameter.kategori || "-";
  var subkelas = e.parameter.subkelas || "-";
  var jabatan = e.parameter.jabatan || "-";

  var memberSheet = ss.getSheetByName("Database Jemaat");

  // Buat sheet otomatis
  if (!memberSheet) {

    memberSheet = ss.insertSheet("Database Jemaat");

    memberSheet.appendRow([
      "ID",
      "Nama Jemaat",
      "Kategori",
      "Sub Kelas",
      "Jabatan",
      "Terakhir Update"
    ]);

    memberSheet
      .getRange("A1:F1")
      .setFontWeight("bold")
      .setBackground("#0A192F")
      .setFontColor("#FFFFFF");

    memberSheet.setFrozenRows(1);
    memberSheet.autoResizeColumns(1, 6);
  }

  var data = memberSheet.getDataRange().getValues();

  var existingRow = -1;

  for (var i = 1; i < data.length; i++) {

    if (
      normalizeText(data[i][1]) ===
      normalizeText(nama)
    ) {

      existingRow = i + 1;
      break;
    }
  }

  // UPDATE
  if (existingRow !== -1) {

    memberSheet.getRange(existingRow, 3).setValue(kategori);
    memberSheet.getRange(existingRow, 4).setValue(subkelas);
    memberSheet.getRange(existingRow, 5).setValue(jabatan);
    memberSheet.getRange(existingRow, 6).setValue(Utilities.formatDate(
  new Date(),
  Session.getScriptTimeZone(),
  "dd/MM/yyyy HH:mm:ss"
));

  }

  // INSERT BARU
  else {

    memberSheet.appendRow([
      Date.now(),
      nama,
      kategori,
      subkelas,
      jabatan,
      Utilities.formatDate(
  new Date(),
  Session.getScriptTimeZone(),
  "dd/MM/yyyy HH:mm:ss"
)
    ]);
  }

  return ContentService
    .createTextOutput("Sukses Simpan Anggota")
    .setMimeType(ContentService.MimeType.TEXT);
}

// =====================================================
// PERMOHONAN DOA
// =====================================================
if (action === "doa") {

  var sheetDoa = ss.getSheetByName("Permohonan Doa");

  // Jika sheet belum ada
  if (!sheetDoa) {

    sheetDoa = ss.insertSheet("Permohonan Doa");

    sheetDoa.appendRow([
      "Waktu",
      "Nama",
      "No HP",
      "Isi Permohonan"
    ]);

    sheetDoa.getRange("A1:D1")
      .setFontWeight("bold")
      .setBackground("#D4AF37");

    sheetDoa.setFrozenRows(1);

    sheetDoa.setColumnWidth(1, 180);
    sheetDoa.setColumnWidth(2, 220);
    sheetDoa.setColumnWidth(3, 180);
    sheetDoa.setColumnWidth(4, 500);
  }

  var nama = e.parameter.nama || "-";
  var hp = e.parameter.hp || "-";
  var pesan = e.parameter.pesan || "-";

  sheetDoa.appendRow([
    Utilities.formatDate(
  new Date(),
  Session.getScriptTimeZone(),
  "dd/MM/yyyy HH:mm:ss"
),
    nama,
    hp,
    pesan
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: "Permohonan doa berhasil disimpan"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

    if (action === "keterlibatan") {
      var sheetName = "Keterlibatan Kelas";
      var sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow([
          "Tanggal", "1. Tepat Waktu SS", "2. Baca Alkitab", "3. Renungan Pagi", 
          "4. Belajar SS", "5. Hadir Rabu Malam", "6. Jangkauan Keluar", 
          "7. Perlawatan (Nurturing)", "8. Doa 777/Subuh", "9. Kelompok Kecil", "10. Membagikan Buku/Risalah"
        ]);
        sheet.getRange("A1:K1").setFontWeight("bold").setBackground("#D4AF37");
        sheet.setFrozenRows(1);
      }
      
      sheet.appendRow([
        waktu, e.parameter.k1, e.parameter.k2, e.parameter.k3, e.parameter.k4, e.parameter.k5,
        e.parameter.k6, e.parameter.k7, e.parameter.k8, e.parameter.k9, e.parameter.k10
      ]);
      return ContentService.createTextOutput("Sukses Keterlibatan").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // ALUR 2: ABSENSI
    var nama = e.parameter.nama;
    var kegiatan = (e.parameter.kegiatan || "")
  .toString()
  .substring(0, 95);

    if (!kegiatan) {
  return ContentService
    .createTextOutput("Error: Nama kegiatan kosong")
    .setMimeType(ContentService.MimeType.TEXT);
}
    var kategori = e.parameter.kategori || "-";
    var subkelas = e.parameter.subkelas || "-";
    var jabatan = e.parameter.jabatan || "-";
    var status = e.parameter.status || "Hadir"; 
    
    var sheetAbsensi = ss.getSheetByName(kegiatan);
    if (!sheetAbsensi) {
      sheetAbsensi = ss.insertSheet(kegiatan);
      sheetAbsensi.appendRow(["Kategori", "Sub Kelas", "Jabatan", "Nama Jemaat"]);
      sheetAbsensi.getRange("A1:D1").setFontWeight("bold").setBackground("#0A192F").setFontColor("#FFFFFF");
      sheetAbsensi.setFrozenRows(1);
      sheetAbsensi.setFrozenColumns(4);
    }

    if (nama) {
      var lastCol = sheetAbsensi.getLastColumn();
      if (lastCol < 4) lastCol = 4;
      
      var headers = sheetAbsensi.getRange(1, 1, 1, lastCol).getValues()[0];
      var tanggalHeader = Utilities.formatDate(
  new Date(),
  Session.getScriptTimeZone(),
  "dd/MM/yyyy"
);

var colIndex = headers.indexOf(tanggalHeader) + 1;
      
      if (colIndex === 0) {
        colIndex = lastCol + 1;
        sheetAbsensi.getRange(1, colIndex).setValue(
  Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd/MM/yyyy"
  )
)
                    .setFontWeight("bold")
                    .setBackground("#D4AF37")
                    .setFontColor("#000000");
      }

      var lastRow = sheetAbsensi.getLastRow();
      var rowIndex = -1;
      
      if (lastRow > 1) {
        var names = sheetAbsensi.getRange(2, 4, lastRow - 1, 1).getValues();
        for (var i = 0; i < names.length; i++) {
          if (
  normalizeText(names[i][0]) ===
  normalizeText(nama)
) {
            rowIndex = i + 2; 
            break;
          }
        }
      }
      
      if (rowIndex === -1) {
        rowIndex = lastRow + 1;
        sheetAbsensi.getRange(rowIndex, 1).setValue(kategori);
        sheetAbsensi.getRange(rowIndex, 2).setValue(subkelas);
        sheetAbsensi.getRange(rowIndex, 3).setValue(jabatan);
        sheetAbsensi.getRange(rowIndex, 4).setValue(nama);
      }

      sheetAbsensi.getRange(rowIndex, colIndex).setValue(status);
      return ContentService.createTextOutput("Sukses Absensi").setMimeType(ContentService.MimeType.TEXT);
    }
    
    return ContentService.createTextOutput("Gagal: Data tidak lengkap").setMimeType(ContentService.MimeType.TEXT);
    
  } catch(error) {
    return ContentService.createTextOutput("Error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  } finally {
    lock.releaseLock();
  }
}