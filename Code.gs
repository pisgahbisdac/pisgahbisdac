function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    const action = e.parameter.action;

    // =====================================================
    // SIMPAN PERMOHONAN DOA
    // =====================================================
    if (action === "doa") {

      let sheet = ss.getSheetByName("Permohonan Doa");

      // Jika sheet belum ada → buat otomatis
      if (!sheet) {
        sheet = ss.insertSheet("Permohonan Doa");

        sheet.appendRow([
          "Waktu",
          "Nama",
          "No HP",
          "Isi Permohonan"
        ]);

        sheet.getRange(1, 1, 1, 4).setFontWeight("bold");
      }

      const nama = e.parameter.nama || "-";
      const hp = e.parameter.hp || "-";
      const pesan = e.parameter.pesan || "-";
      const waktu = e.parameter.waktu || new Date();

      sheet.appendRow([
        waktu,
        nama,
        hp,
        pesan
      ]);

      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          type: "doa",
          message: "Permohonan doa berhasil disimpan"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // =====================================================
    // SIMPAN ABSENSI
    // =====================================================
    if (action === "absensi") {

      let sheet = ss.getSheetByName("Absensi");

      // Jika sheet belum ada → buat otomatis
      if (!sheet) {
        sheet = ss.insertSheet("Absensi");

        sheet.appendRow([
          "Waktu",
          "Nama",
          "Kategori",
          "Subkelas",
          "Jabatan",
          "Kegiatan",
          "Status"
        ]);

        sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
      }

      const waktu = e.parameter.waktu || "-";
      const nama = e.parameter.nama || "-";
      const kategori = e.parameter.kategori || "-";
      const subkelas = e.parameter.subkelas || "-";
      const jabatan = e.parameter.jabatan || "-";
      const kegiatan = e.parameter.kegiatan || "-";
      const status = e.parameter.status || "-";

      sheet.appendRow([
        waktu,
        nama,
        kategori,
        subkelas,
        jabatan,
        kegiatan,
        status
      ]);

      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          type: "absensi",
          message: "Absensi berhasil disimpan"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // =====================================================
    // ACTION TIDAK DIKENALI
    // =====================================================
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: "Action tidak dikenali"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}