function doPost(e) {
  var sheetId = "1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc";
  var ss = SpreadsheetApp.openById(sheetId);
  
  // Ambil data dari aplikasi
  var nama = e.parameter.nama;
  var kegiatan = e.parameter.kegiatan; // Ini akan berisi "Sekolah Sabat" atau "Khotbah"
  var waktu = e.parameter.waktu;
  
  // Pilih sheet berdasarkan nama kegiatan
  // Pastikan nama tab di Spreadsheet sama persis dengan nama kegiatan ini
  var sheet = ss.getSheetByName(kegiatan);
  
  // Jika sheet tidak ditemukan, gunakan sheet pertama sebagai cadangan
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }

  if (nama) {
    // Menambahkan baris: Tanggal, Nama, Jenis Kegiatan
    sheet.appendRow([waktu, nama, kegiatan]);
    return ContentService.createTextOutput("Sukses").setMimeType(ContentService.MimeType.TEXT);
  }
  
  return ContentService.createTextOutput("Gagal: Data tidak lengkap").setMimeType(ContentService.MimeType.TEXT);
}