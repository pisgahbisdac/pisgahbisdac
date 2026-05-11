function doPost(e) {
  var sheetId = "1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc";
  var sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
  
  // Ambil data dari parameter
  var nama = e.parameter.nama;
  var kegiatan = e.parameter.kegiatan;
  
  // Jika parameter kosong (biasanya karena format payload), coba ambil dari postData
  if (!nama && e.postData && e.postData.contents) {
    var data = JSON.parse(e.postData.contents);
    nama = data.nama;
    kegiatan = data.kegiatan;
  }

  if (nama) {
    sheet.appendRow([new Date(), nama, kegiatan || "Hadir"]);
    return ContentService.createTextOutput("Sukses").setMimeType(ContentService.MimeType.TEXT);
  }
  
  return ContentService.createTextOutput("Gagal: Nama Kosong").setMimeType(ContentService.MimeType.TEXT);
}