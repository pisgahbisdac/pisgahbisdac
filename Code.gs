/**
 * KONFIGURASI SPREADSHEET
 * Pastikan ID Spreadsheet di bawah ini sesuai dengan milik Anda.
 */
var sheetId = "1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc";

/**
 * Fungsi pembantu untuk normalisasi teks
 */
function normalizeText(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * Handler Request GET
 */
function doGet(e) {
  var ss = SpreadsheetApp.openById(sheetId);
  var action = e.parameter.action;

  try {
    // 1. VERIFIKASI PIN LOGIN
    if (action === "verifyPin") {
      var pin = e.parameter.pin;
      var sheet = ss.getSheetByName("Pengaturan") || createSettingsSheet(ss);
      var data = sheet.getDataRange().getValues();
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][1].toString() === pin) {
          return createJsonResponse({ 
            success: true, 
            role: data[i][2], 
            account: data[i][0] 
          });
        }
      }
      return createJsonResponse({ success: false, message: "PIN Salah!" });
    }

    // 2. AMBIL DATA ANGGOTA (Untuk Tabel & Dropdown)
    if (action === "getMembers") {
      var sheet = ss.getSheetByName("Data Anggota") || createMemberSheet(ss);
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var members = [];
      
      for (var i = 1; i < data.length; i++) {
        var obj = {};
        headers.forEach(function(header, idx) {
          obj[normalizeHeader(header)] = data[i][idx];
        });
        members.push(obj);
      }
      return createJsonResponse(members);
    }

    // 3. AMBIL DATA UNTUK DASHBOARD (Statistik)
    if (action === "getDashboardData") {
      var sheetAbsensi = ss.getSheetByName("Absensi") || createAbsensiSheet(ss);
      var data = sheetAbsensi.getDataRange().getValues();
      // Logika sederhana menghitung jumlah hadir (H) hari ini / terakhir
      var lastCol = data[0].length - 1;
      var stats = { hadir: 0, absen: 0, total: data.length - 1 };
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][lastCol] === "H") stats.hadir++;
        else stats.absen++;
      }
      return createJsonResponse(stats);
    }

  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handler Request POST
 */
function doPost(e) {
  var ss = SpreadsheetApp.openById(sheetId);
  var params = JSON.parse(e.postData.contents);
  var action = params.action;

  try {
    // 1. PROSES ABSENSI
    if (action === "submitAttendance") {
      var sheetAbsensi = ss.getSheetByName("Absensi") || createAbsensiSheet(ss);
      var records = params.data; // Array of {nama, status, kategori, subkelas, jabatan}
      var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
      
      var data = sheetAbsensi.getDataRange().getValues();
      var headers = data[0];
      var colIndex = headers.indexOf(today);

      // Jika kolom tanggal hari ini belum ada, buat baru
      if (colIndex === -1) {
        colIndex = headers.length;
        sheetAbsensi.getRange(1, colIndex + 1)
          .setValue(today)
          .setFontWeight("bold")
          .setBackground("#D4AF37");
      } else {
        colIndex = colIndex + 1; // Convert to 1-based index
      }

      records.forEach(function(rec) {
        var rowIndex = -1;
        for (var i = 1; i < data.length; i++) {
          if (normalizeText(data[i][3]) === normalizeText(rec.nama)) {
            rowIndex = i + 1;
            break;
          }
        }

        if (rowIndex === -1) {
          rowIndex = sheetAbsensi.getLastRow() + 1;
          sheetAbsensi.getRange(rowIndex, 1, 1, 4).setValues([[rec.kategori, rec.subkelas, rec.jabatan, rec.nama]]);
        }
        sheetAbsensi.getRange(rowIndex, colIndex).setValue(rec.status);
      });

      return createJsonResponse({ success: true, message: "Absensi berhasil disimpan" });
    }

    // 2. TAMBAH / UPDATE ANGGOTA
    if (action === "upsertMember") {
      var sheet = ss.getSheetByName("Data Anggota") || createMemberSheet(ss);
      var member = params.memberData;
      var data = sheet.getDataRange().getValues();
      var rowIndex = -1;

      for (var i = 1; i < data.length; i++) {
        if (normalizeText(data[i][0]) === normalizeText(member.name)) {
          rowIndex = i + 1;
          break;
        }
      }

      var rowValues = [
        member.name, member.kategori, member.subkelas, member.jabatan,
        member.gender, member.statusNikah, member.pasangan || "-",
        member.ayah || "-", member.ibu || "-", member.alamat || "-"
      ];

      if (rowIndex !== -1) {
        sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
      return createJsonResponse({ success: true });
    }

  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * FUNGSI UTILITY & INISIALISASI SHEET
 */

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeHeader(text) {
  return text.toLowerCase().replace(/ /g, "_");
}

function createSettingsSheet(ss) {
  var sheet = ss.insertSheet("Pengaturan");
  sheet.appendRow(["Nama Akun / Kelas", "PIN AKSES", "HAK AKSES"]);
  sheet.appendRow(["Admin Utama", "1234", "Admin"]);
  sheet.appendRow(["Sekretaris Dewasa", "5555", "Dewasa"]);
  sheet.appendRow(["Sekretaris Anak", "8888", "Anak"]);
  sheet.getRange("A1:C1").setFontWeight("bold").setBackground("#D4AF37");
  return sheet;
}

function createMemberSheet(ss) {
  var sheet = ss.insertSheet("Data Anggota");
  var headers = ["Nama", "Kategori", "Sub-Kelas", "Jabatan", "Gender", "Status Nikah", "Pasangan", "Ayah", "Ibu", "Alamat"];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#D4AF37");
  return sheet;
}

function createAbsensiSheet(ss) {
  var sheet = ss.insertSheet("Absensi");
  var headers = ["Kategori", "Sub-Kelas", "Jabatan", "Nama"];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#112240").setFontColor("#FFFFFF");
  return sheet;
}