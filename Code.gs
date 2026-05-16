/**
 * KONFIGURASI BACKEND PISGAH BISDAC v1.0
 * Spreadsheet ID: 1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc
 */

const SPREADSHEET_ID = '1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc'; 

function getDb() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// ==============================================================
// ROUTER UTAMA
// ==============================================================
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const data = requestData.data;
    
    let result;
    switch (action) {
      case 'getInitialData': result = getInitialData(); break;
      case 'addMember': result = addMember(data); break;
      case 'updateMember': result = updateMember(data); break;
      case 'deleteMember': result = deleteMember(data); break;
      case 'addUnit': result = addUnit(data); break;
      case 'updateUnit': result = updateUnit(data); break;
      case 'deleteUnit': result = deleteUnit(data); break;
      case 'addRole': result = addRole(data); break;
      case 'updateRole': result = updateRole(data); break;
      case 'deleteRole': result = deleteRole(data); break;
      case 'addAdmin': result = addAdmin(data); break;
      case 'updateAdmin': result = updateAdmin(data); break;
      case 'deleteAdmin': result = deleteAdmin(data); break;
      case 'changePin': result = changePin(data); break;
      case 'submitAbsensi': result = submitAbsensi(data); break;
      case 'submitKegiatan': result = submitKegiatan(data); break;
      case 'submitDoa': result = submitDoa(data); break;
      case 'getPrintData': result = getPrintData(data); break; // FUNGSI BARU DITAMBAHKAN
      default:
        result = { status: 'error', message: 'Aksi tidak dikenali: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getInitialData() {
  const db = getDb();
  let mSheet = db.getSheetByName('Members'); if(!mSheet) mSheet = createMemberSheet(db);
  let uSheet = db.getSheetByName('Units'); if(!uSheet) uSheet = createUnitSheet(db, mSheet);
  let rSheet = db.getSheetByName('Jabatan'); if(!rSheet) rSheet = createRoleSheet(db);
  let aSheet = db.getSheetByName('Admins'); if(!aSheet) aSheet = createAdminSheet(db);

  let members = [];
  if (mSheet.getLastRow() > 1) {
    const data = mSheet.getRange(2, 1, mSheet.getLastRow() - 1, 7).getValues();
    members = data.map(r => ({ id: r[0], nama: r[1], status: r[2], kelasTetap: r[3], unit: r[4], jabatan: r[5], tanggalLahir: r[6] }));
  }

  let units = [];
  if (uSheet.getLastRow() > 1) {
    const data = uSheet.getRange(2, 1, uSheet.getLastRow() - 1, 2).getValues();
    units = data.map(r => ({ name: String(r[0]).trim(), pin: String(r[1]).trim() }));
  }

  let roles = [];
  if (rSheet.getLastRow() > 1) {
    const data = rSheet.getRange(2, 1, rSheet.getLastRow() - 1, 1).getValues();
    roles = data.map(r => String(r[0]).trim());
  }

  let admins = [];
  if (aSheet.getLastRow() > 1) {
    const data = aSheet.getRange(2, 1, aSheet.getLastRow() - 1, 2).getValues();
    admins = data.map(r => ({ username: String(r[0]).trim(), pin: String(r[1]).trim() }));
  }

  const stats = getAttendanceStats(db);
  return { status: 'success', data: { members, units, roles, admins, stats } };
}

// ==============================================================
// AMBIL DATA CETAK ABSENSI DETAIL (FUNGSI BARU)
// ==============================================================
function getPrintData(data) {
  const db = getDb();
  let prefix = data.type; 
  let targetUnit = data.unit;
  
  if (data.type === 'Khotbah') targetUnit = 'Jemaat';
  if (data.unit === 'ALL' && data.type !== 'Khotbah') targetUnit = 'Global'; 
  
  const sheetName = `${prefix} - ${targetUnit}`;
  const sheet = db.getSheetByName(sheetName);
  
  if (!sheet) return { status: 'error', message: 'Lembar absensi belum dibuat.' };
  
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  
  if (lastCol < 3 || lastRow < 2) return { status: 'error', message: 'Belum ada data absensi.' };
  
  const headersRaw = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const headersStr = headersRaw.map(h => {
    if (h instanceof Date) return Utilities.formatDate(h, Session.getScriptTimeZone(), "yyyy-MM-dd");
    return String(h).trim();
  });
  
  let colIdx = headersStr.indexOf(String(data.tanggal).trim());
  if (colIdx === -1) return { status: 'error', message: `Tidak ada data absensi untuk tanggal ${data.tanggal}.` };
  
  // Ambil ID, Nama, dan Status pada kolom tanggal tersebut
  const listId = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(r => r[0]);
  const listNama = sheet.getRange(2, 2, lastRow - 1, 1).getValues().map(r => r[0]);
  const listStatus = sheet.getRange(2, colIdx + 1, lastRow - 1, 1).getValues().map(r => r[0]);
  
  let resultList = [];
  let tamuCount = 0;
  
  for (let i = 0; i < listId.length; i++) {
    let id = String(listId[i]).trim();
    if (!id) continue;
    
    if (id.toUpperCase() === "TAMU") {
      tamuCount = parseInt(listStatus[i]) || 0;
    } else {
      resultList.push({
        id: id,
        nama: listNama[i],
        status: listStatus[i] || 'Alpha' // Jika kosong dianggap Alpha
      });
    }
  }
  
  return { status: 'success', data: { list: resultList, tamu: tamuCount } };
}

// ==============================================================
// STATISTIK DASHBOARD (Akurasi Tinggi & Sinkronisasi Tanggal)
// ==============================================================
function getAttendanceStats(ss) {
  let historyMap = { 'ALL': {} }; 
  let allUnits = new Set(['Umum', 'Tamu']);
  
  const mSheet = ss.getSheetByName('Members');
  const memberUnitMap = {};
  if (mSheet && mSheet.getLastRow() > 1) {
    const mData = mSheet.getDataRange().getValues();
    for (let i = 1; i < mData.length; i++) {
      let idStr = String(mData[i][0]).trim();
      let unitStr = String(mData[i][4] || 'Umum').trim();
      memberUnitMap[idStr] = unitStr; 
      allUnits.add(unitStr); 
    }
  }

  const sheets = ss.getSheets().filter(s => s.getName().startsWith('Khotbah'));

  sheets.forEach(sheet => {
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    
    if (lastCol >= 3 && lastRow > 1) {
      const dates = sheet.getRange(1, 3, 1, lastCol - 2).getValues()[0];
      const data = sheet.getRange(2, 3, lastRow - 1, lastCol - 2).getValues();
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(r => r[0]);

      for (let c = 0; c < dates.length; c++) {
        let rawDate = dates[c];
        if (!rawDate) continue;
        
        let dateStr = rawDate instanceof Date ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(rawDate).trim();
        
        if (!historyMap['ALL'][dateStr]) historyMap['ALL'][dateStr] = 0;
        allUnits.forEach(u => {
            if (!historyMap[u]) historyMap[u] = {};
            if (!historyMap[u][dateStr]) historyMap[u][dateStr] = 0;
        });
        
        for (let r = 0; r < data.length; r++) {
          let count = 0;
          let unitName = 'Umum';

          if (ids[r] && ids[r].toString().toUpperCase() === "TAMU") {
            count = parseInt(data[r][c]) || 0;
            unitName = 'Tamu';
          } else if (String(data[r][c]).trim() === "Hadir") {
            count = 1;
            let foundId = String(ids[r]).trim();
            unitName = memberUnitMap[foundId] || 'Umum';
          }
          
          if (count > 0) {
            historyMap['ALL'][dateStr] += count; 
            historyMap[unitName][dateStr] += count;
          }
        }
      }
    }
  });

  const result = {};
  for (const unit in historyMap) {
    let sortedDates = Object.keys(historyMap[unit]).sort((a, b) => {
      const [y1, m1, d1] = a.split('-'); 
      const [y2, m2, d2] = b.split('-');
      return new Date(y1, m1-1, d1) - new Date(y2, m2-1, d2);
    });
    const recentDates = sortedDates.slice(-12);
    result[unit] = recentDates.map(d => ({ date: d, count: historyMap[unit][d] }));
  }

  if (!result['ALL']) result['ALL'] = [];
  return { historyByUnit: result, history: result['ALL'] };
}

// ==============================================================
// SIMPAN ABSEN & KEGIATAN
// ==============================================================
function submitAbsensi(data) {
  const db = getDb();
  let prefix = data.type; 
  let targetUnit = data.unit;
  if (data.type === 'Khotbah') targetUnit = 'Jemaat';
  if (data.unit === 'ALL' && data.type !== 'Khotbah') targetUnit = 'Global'; 
  
  const sheetName = `${prefix} - ${targetUnit}`;
  let sheet = db.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = db.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, 2).setValues([['ID Jemaat', 'Nama Lengkap']]).setBackground("#D4AF37").setFontWeight("bold");
    sheet.getRange(2, 1, 1, 2).setValues([['TAMU', 'Tamu / Simpatisan']]).setBackground("#f3f4f6").setFontWeight("bold");
    sheet.setFrozenRows(2); 
    sheet.setFrozenColumns(2); 
    sheet.setColumnWidth(2, 200);
  }
  
  const headersRaw = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  const headersStr = headersRaw.map(h => {
    if (h instanceof Date) return Utilities.formatDate(h, Session.getScriptTimeZone(), "yyyy-MM-dd");
    return String(h).trim();
  });
  
  let colIdx = headersStr.indexOf(String(data.tanggal).trim()) + 1;
  
  if (colIdx === 0) {
    colIdx = Math.max(sheet.getLastColumn() + 1, 3);
    sheet.getRange(1, colIdx).setValue(data.tanggal).setBackground("#0a192f").setFontColor("#D4AF37").setFontWeight("bold").setHorizontalAlignment("center");
  } else {
    const maxRow = Math.max(sheet.getLastRow(), 2);
    if (maxRow >= 2) sheet.getRange(2, colIdx, maxRow - 1, 1).clearContent().setBackground(null);
  }
  
  const mSheet = db.getSheetByName('Members');
  const mData = mSheet ? mSheet.getDataRange().getValues() : [];
  const memberMap = {};
  for (let i = 1; i < mData.length; i++) { memberMap[mData[i][0]] = mData[i][1]; }
  
  const matrixLastRow = Math.max(sheet.getLastRow(), 2);
  const existingIds = sheet.getRange(1, 1, matrixLastRow, 1).getValues().map(r => String(r[0]).trim());
  
  for (let id in data.attendance) {
    const status = data.attendance[id];
    let rowIdx = existingIds.indexOf(String(id).trim()) + 1;
    
    if (rowIdx === 0) {
      rowIdx = sheet.getLastRow() + 1;
      const nama = memberMap[id] || "Unknown";
      sheet.getRange(rowIdx, 1, 1, 2).setValues([[id, nama]]);
      existingIds.push(String(id).trim()); 
    }
    
    const cell = sheet.getRange(rowIdx, colIdx);
    cell.setValue(status).setHorizontalAlignment("center");
    
    if (status === 'Hadir') cell.setBackground('#e6f4ea').setFontColor('#137333').setFontWeight("bold");
    else if (status === 'Alpha') cell.setBackground('#fce8e6').setFontColor('#c5221f').setFontWeight("bold");
  }
  
  if (data.tamu !== undefined && data.tamu !== "" && parseInt(data.tamu) > 0) {
    let tamuRowIdx = existingIds.indexOf("TAMU") + 1;
    if (tamuRowIdx === 0) tamuRowIdx = 2; 
    sheet.getRange(tamuRowIdx, colIdx).setValue(data.tamu).setHorizontalAlignment("center").setFontWeight("bold").setBackground('#fffbeb').setFontColor('#b45309');
  }
  
  return { status: 'success', message: 'Absensi berhasil disimpan!' };
}

function submitKegiatan(data) {
  const db = getDb();
  let targetUnit = data.unit === 'ALL' ? 'Global' : data.unit;
  const sheetName = `Kegiatan - ${targetUnit}`;
  const kList = [ "Anggota datang tepat waktu di S.S.", "Membaca Alkitab setiap hari", "Pelajaran S.S. setiap hari", "Renungan Pagi setiap hari", "Hadir Pertemuan Rabu Malam", "Melakukan Jangkauan Keluar (Pemberian Alkitab, Berdoa untuk orang lain)", "Melakukan Perlawatan Pemeliharaan (Mendoakan yang sakit, Anggota absen)", "Memberikan / Membagikan Risalah / Buku Rohani", "Terlibat Kegiatan Kelompok Kecil", "Mengikuti / Terlibat Program Berdoa (777 / 1752 dll)" ];
  
  let sheet = db.getSheetByName(sheetName);
  if (!sheet) {
    sheet = db.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, 2).setValues([['No', 'Keterangan Kegiatan']]).setBackground("#D4AF37").setFontWeight("bold");
    const initRows = kList.map((k, i) => [i + 1, k]);
    sheet.getRange(2, 1, initRows.length, 2).setValues(initRows);
    sheet.setFrozenRows(1); sheet.setFrozenColumns(2); sheet.setColumnWidth(2, 350);
  }
  
  const headersRaw = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  const headersStr = headersRaw.map(h => h instanceof Date ? Utilities.formatDate(h, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(h).trim());
  let colIdx = headersStr.indexOf(String(data.tanggal).trim()) + 1;
  
  if (colIdx === 0) {
    colIdx = Math.max(sheet.getLastColumn() + 1, 3);
    sheet.getRange(1, colIdx).setValue(data.tanggal).setBackground("#0a192f").setFontColor("#D4AF37").setFontWeight("bold").setHorizontalAlignment("center");
  } else {
    const maxRow = Math.max(sheet.getLastRow(), 2);
    if (maxRow >= 2) sheet.getRange(2, colIdx, maxRow - 1, 1).clearContent().setBackground(null);
  }
  
  const values = data.laporan.map(val => [val || 0]);
  sheet.getRange(2, colIdx, values.length, 1).setValues(values).setHorizontalAlignment("center").setFontWeight("bold").setBackground('#e6f4ea').setFontColor('#137333');
  return { status: 'success', message: 'Kegiatan berhasil disimpan!' };
}

function submitDoa(data) {
  const db = getDb();
  let sheet = db.getSheetByName('Permohonan Doa');
  if (!sheet) {
    sheet = db.insertSheet('Permohonan Doa');
    sheet.appendRow(['Timestamp', 'Nama Lengkap', 'No Telp', 'Poin Doa', 'Status']);
    sheet.getRange(1, 1, 1, 5).setBackground("#3B82F6").setFontColor("#ffffff").setFontWeight("bold");
  }
  sheet.appendRow([ new Date(), data.nama, data.telp, data.poin.join(' | '), 'Menunggu' ]);
  return { status: 'success' };
}

// ==============================================================
// CRUD MASTER DATA
// ==============================================================
function addMember(data) {
  const sheet = getDb().getSheetByName('Members');
  const newId = 'M' + new Date().getTime();
  sheet.appendRow([newId, data.nama, data.status, data.kelasTetap, data.unit, data.jabatan, data.tanggalLahir]);
  return { status: 'success' };
}
function updateMember(data) {
  const sheet = getDb().getSheetByName('Members');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      sheet.getRange(i + 1, 2, 1, 6).setValues([[data.nama, data.status, data.kelasTetap, data.unit, data.jabatan, data.tanggalLahir]]);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}
function deleteMember(id) {
  const sheet = getDb().getSheetByName('Members');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id) { sheet.deleteRow(i + 1); return { status: 'success' }; }
  }
  return { status: 'error' };
}
function addUnit(data) {
  const sheet = getDb().getSheetByName('Units');
  const pin = data.pin || Math.floor(1000 + Math.random() * 9000).toString();
  sheet.appendRow([data.name, pin]);
  return { status: 'success' };
}
function updateUnit(data) {
  const db = getDb(); const uSheet = db.getSheetByName('Units');
  const values = uSheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === data.oldName.trim()) {
      uSheet.getRange(i + 1, 1, 1, 2).setValues([[data.newName, data.pin]]);
      if(data.oldName !== data.newName) {
        const mSheet = db.getSheetByName('Members');
        if(mSheet && mSheet.getLastRow() > 1) {
          const mData = mSheet.getDataRange().getValues();
          for(let j=1; j<mData.length; j++) { if(String(mData[j][4]).trim() === data.oldName.trim()) mSheet.getRange(j + 1, 5).setValue(data.newName); }
        }
      }
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}
function deleteUnit(name) {
  const db = getDb(); const uSheet = db.getSheetByName('Units');
  const values = uSheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === name.trim()) {
      uSheet.deleteRow(i + 1);
      const mSheet = db.getSheetByName('Members');
      if(mSheet && mSheet.getLastRow() > 1) {
        const mData = mSheet.getDataRange().getValues();
        for(let j=1; j<mData.length; j++) { if(String(mData[j][4]).trim() === name.trim()) mSheet.getRange(j + 1, 5).setValue('Umum'); }
      }
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}
function addRole(name) { getDb().getSheetByName('Jabatan').appendRow([name]); return { status: 'success' }; }
function updateRole(data) {
  const sheet = getDb().getSheetByName('Jabatan'); const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) { if (String(values[i][0]).trim() === data.oldName.trim()) { sheet.getRange(i + 1, 1).setValue(data.newName); return { status: 'success' }; } }
  return { status: 'error' };
}
function deleteRole(name) {
  const sheet = getDb().getSheetByName('Jabatan'); const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) { if (String(values[i][0]).trim() === name.trim()) { sheet.deleteRow(i + 1); return { status: 'success' }; } }
  return { status: 'error' };
}
function addAdmin(data) { getDb().getSheetByName('Admins').appendRow([data.username, data.pin]); return { status: 'success' }; }
function updateAdmin(data) {
  const sheet = getDb().getSheetByName('Admins'); const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) { if (String(values[i][0]).trim() === data.oldUsername.trim()) { sheet.getRange(i + 1, 1, 1, 2).setValues([[data.newUsername, data.pin]]); return { status: 'success' }; } }
  return { status: 'error' };
}
function deleteAdmin(username) {
  const sheet = getDb().getSheetByName('Admins'); const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) { if (String(values[i][0]).trim() === username.trim()) { sheet.deleteRow(i + 1); return { status: 'success' }; } }
  return { status: 'error' };
}
function changePin(data) {
  const sheetName = data.role === 'admin' ? 'Admins' : 'Units'; const sheet = getDb().getSheetByName(sheetName);
  if(!sheet) return {status: 'error'};
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(data.identifier).trim() && String(values[i][1]).trim() === String(data.oldPin).trim()) {
      sheet.getRange(i + 1, 2).setValue(data.newPin); return { status: 'success' };
    }
  }
  return { status: 'error' };
}

// ==============================================================
// PEMBUATAN TAB OTOMATIS
// ==============================================================
function createMemberSheet(ss) {
  const sheet = ss.insertSheet('Members');
  sheet.getRange(1, 1, 1, 7).setValues([['ID', 'Nama', 'Status', 'Kategori', 'Unit', 'Jabatan', 'Tanggal Lahir']]).setBackground("#D4AF37").setFontWeight("bold");
  sheet.setFrozenRows(1); return sheet;
}
function createUnitSheet(ss, memberSheet) {
  const sheet = ss.insertSheet('Units');
  sheet.getRange(1, 1, 1, 2).setValues([['Nama Unit', 'PIN Akses']]).setBackground("#D4AF37").setFontWeight("bold");
  if(memberSheet && memberSheet.getLastRow() > 1) {
    const unitsData = memberSheet.getRange(2, 5, memberSheet.getLastRow() - 1, 1).getValues();
    const uniqueUnits = [...new Set(unitsData.map(r => r[0]).filter(u => u && u !== 'Umum'))];
    if(uniqueUnits.length > 0) {
      const rows = uniqueUnits.map(u => [u, Math.floor(1000 + Math.random() * 9000).toString()]);
      sheet.getRange(2, 1, rows.length, 2).setValues(rows);
    }
  }
  return sheet;
}
function createRoleSheet(ss) {
  const sheet = ss.insertSheet('Jabatan');
  sheet.getRange(1, 1).setValue('Nama Jabatan').setBackground("#D4AF37").setFontWeight("bold");
  sheet.getRange(2, 1, 5, 1).setValues([['Anggota'], ['Pemimpin Unit'], ['Sekretaris Unit'], ['Pendeta'], ['Ketua Jemaat']]);
  return sheet;
}
function createAdminSheet(ss) {
  const sheet = ss.insertSheet('Admins');
  sheet.getRange(1, 1, 1, 2).setValues([['Username', 'PIN Akses']]).setBackground("#D4AF37").setFontWeight("bold");
  sheet.appendRow(['Admin Utama', '12345']); return sheet;
}