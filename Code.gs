/**
 * KONFIGURASI BACKEND PISGAH BISDAC v1.0 (Admin Control Panel & Doa)
 * Updated: Pemisahan Sheet Absen secara dinamis per Unit
 * Spreadsheet ID: 1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc
 */

const SPREADSHEET_ID = '1-fWE3bjOlTU9VFITCgI6smG8d__vxjWpVMN35ODb-zc'; 
const DEFAULT_MASTER_PIN = '12345'; // Digunakan hanya untuk trigger otomatis pertama kali

function getDb() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doPost(e) {
  // CORS & Options Handling
  if (e.postData === undefined) return ContentService.createTextOutput(JSON.stringify({status:"ok"})).setMimeType(ContentService.MimeType.JSON);
  
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
      case 'deleteRole': result = deleteRole(data); break;
      case 'submitAbsen': result = submitAbsen(data); break; // Fungsi yang diupdate
      case 'addDoa': result = addDoa(data); break;
      case 'updateDoa': result = updateDoa(data); break;
      case 'deleteDoa': result = deleteDoa(data); break;
      default: result = { status: 'error', message: 'Action not found: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// -------------------------------------------------------------
// CORE FETCH DATA
// -------------------------------------------------------------
function getInitialData() {
  const db = getDb();
  const sheets = db.getSheets();
  
  const getSheetData = (sheet) => {
    const data = sheet.getDataRange().getValues();
    if(data.length < 2) return [];
    const headers = data.shift();
    return data.map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
  };

  let initData = {
    members: [],
    units: [],
    roles: [],
    doa: [],
    absen: []
  };
  
  // Ambil data dan gabungkan seluruh absen dari sheet yang terpisah
  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name === 'Members') initData.members = getSheetData(sheet);
    else if (name === 'Units') initData.units = getSheetData(sheet);
    else if (name === 'Jabatan') initData.roles = getSheetData(sheet);
    else if (name === 'Doa') initData.doa = getSheetData(sheet);
    else if (name.startsWith('Absen - ') || name === 'Absen') {
       let sheetAbsenData = getSheetData(sheet);
       let unitName = name.replace('Absen - ', '');
       if (name === 'Absen') unitName = 'Semua (Legacy)'; 
       sheetAbsenData = sheetAbsenData.map(r => ({...r, _SheetSource: unitName}));
       initData.absen = initData.absen.concat(sheetAbsenData);
    }
  });

  return { status: 'success', data: initData };
}

// -------------------------------------------------------------
// LOGIKA ABSENSI (OTOMATIS DIPISAH PER UNIT)
// -------------------------------------------------------------
function submitAbsen(data) {
  const db = getDb();
  
  try {
    const grouped = {};
    let memberUnitMap = null;
    
    // Helper: Cari tahu unit dari member jika frontend tidak mengirimkan "unit"
    const getMemberUnit = (identifier) => {
      if (!identifier) return null;
      if (!memberUnitMap) {
        memberUnitMap = {};
        const mSheet = db.getSheetByName('Members');
        if(mSheet && mSheet.getLastRow() > 1) {
          const membersData = mSheet.getDataRange().getValues();
          for(let i=1; i<membersData.length; i++) {
            memberUnitMap[membersData[i][0]] = membersData[i][4]; // Berdasarkan ID
            memberUnitMap[membersData[i][1]] = membersData[i][4]; // Berdasarkan Nama
          }
        }
      }
      return memberUnitMap[identifier] || null;
    };

    // Normalisasi format data dari Frontend
    let rowsToProcess = [];
    let globalTanggal = data.tanggal || new Date().toISOString().split('T')[0];

    if (data.records && Array.isArray(data.records)) {
      rowsToProcess = data.records;
    } else if (Array.isArray(data)) {
      rowsToProcess = data;
    } else {
      rowsToProcess = [data]; // Hanya submit 1 data
    }

    // Kelompokkan data yang masuk berdasarkan Unit
    rowsToProcess.forEach(row => {
      let u = row.unit || data.unit || getMemberUnit(row.id) || getMemberUnit(row.nama) || getMemberUnit(row.Nama) || 'Umum';
      if (!grouped[u]) grouped[u] = [];
      grouped[u].push(row);
    });
    
    // Masukkan data per kelompok ke dalam sheet yang relevan
    for (const [unit, records] of Object.entries(grouped)) {
      insertToUnitSheet(db, unit, globalTanggal, records);
    }
    
    return { status: 'success', message: 'Absensi berhasil diproses dan dipisah per unit' };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}

function insertToUnitSheet(db, unitName, globalTanggal, records) {
  const sheetName = 'Absen - ' + unitName;
  let sheet = db.getSheetByName(sheetName);
  
  // Jika sheet unit tersebut belum ada, otomatis buatkan!
  if (!sheet) {
    sheet = db.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, 5).setValues([['Timestamp', 'Tanggal', 'Nama', 'Status', 'Keterangan']])
         .setBackground("#D4AF37").setFontColor("#000000").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  
  const timestamp = new Date();
  const rowsToInsert = records.map(rec => [
    timestamp,
    globalTanggal || rec.tanggal || timestamp.toISOString().split('T')[0],
    rec.nama || rec.Nama || '-',
    rec.status || rec.Status || rec.kehadiran || '-',
    rec.keterangan || rec.Keterangan || ''
  ]);
  
  if (rowsToInsert.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToInsert.length, rowsToInsert[0].length).setValues(rowsToInsert);
  }
}

// -------------------------------------------------------------
// CRUD MEMBERS
// -------------------------------------------------------------
function addMember(data) {
  const sheet = getDb().getSheetByName('Members');
  const newId = 'M' + new Date().getTime();
  sheet.appendRow([newId, data.nama, data.status, data.kategori, data.unit, data.jabatan]);
  return { status: 'success', id: newId };
}

function updateMember(data) {
  const sheet = getDb().getSheetByName('Members');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) {
      sheet.getRange(i + 1, 2, 1, 5).setValues([[data.nama, data.status, data.kategori, data.unit, data.jabatan]]);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'Member not found' };
}

function deleteMember(data) {
  const sheet = getDb().getSheetByName('Members');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) {
      sheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'Member not found' };
}

// -------------------------------------------------------------
// CRUD UNITS & ROLES
// -------------------------------------------------------------
function addUnit(data) {
  const sheet = getDb().getSheetByName('Units');
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  sheet.appendRow([data.namaUnit || data.nama, pin]);
  return { status: 'success' };
}
function updateUnit(data) {
  const sheet = getDb().getSheetByName('Units');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.oldName || values[i][0] == data.id) {
      sheet.getRange(i + 1, 1, 1, 1).setValue(data.namaUnit || data.nama);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}
function deleteUnit(data) {
  const sheet = getDb().getSheetByName('Units');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.namaUnit || values[i][0] == data.id) {
      sheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}

function addRole(data) {
  const sheet = getDb().getSheetByName('Jabatan');
  sheet.appendRow([data.namaJabatan || data.nama]);
  return { status: 'success' };
}
function deleteRole(data) {
  const sheet = getDb().getSheetByName('Jabatan');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.namaJabatan || values[i][0] == data.id) {
      sheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}

// -------------------------------------------------------------
// CRUD DOA
// -------------------------------------------------------------
function addDoa(data) {
  const sheet = getDb().getSheetByName('Doa');
  sheet.appendRow([new Date(), data.nama, data.pokokDoa, 'Aktif']);
  return { status: 'success' };
}
function updateDoa(data) {
  const sheet = getDb().getSheetByName('Doa');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (new Date(values[i][0]).getTime() == new Date(data.timestamp).getTime() && values[i][1] == data.nama) {
      sheet.getRange(i + 1, 4).setValue(data.status); 
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}
function deleteDoa(data) {
  const sheet = getDb().getSheetByName('Doa');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (new Date(values[i][0]).getTime() == new Date(data.timestamp).getTime() && values[i][1] == data.nama) {
      sheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'error' };
}