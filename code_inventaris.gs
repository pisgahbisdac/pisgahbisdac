// ============================================================
//  INVENTORY CRUD
// ============================================================
function getInventory() {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.INVENTORY);
  if (!sheet) return { success: true, data: [] };
  const rows  = sheet.getDataRange().getValues();
  const result = [];
  
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r && r[0]) {
      result.push({
        id: r[0],
        date_acquired: r[1],
        name: r[2],
        value: r[3],
        location: r[4],
        pic: r[5],
        photo: r[6],
        created_by: r[7],
        created_at: r[8],
        category: r[9] || '',
        source: r[10] || '',
        taksasi: r[11] || 0
      });
    }
  }
  return { success: true, data: result };
}

function saveInventory(data, user) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.INVENTORY);
  if (!sheet) return { success: false, message: 'Sheet Inventory tidak ditemukan.' };
  
  const rows = sheet.getDataRange().getValues();
  const photo = data.photo_base64 !== undefined ? data.photo_base64 : '';
  
  if (data.isUpdate && data.id) {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.id) {
        if (data.date_acquired !== undefined) sheet.getRange(i + 1, 2).setValue(data.date_acquired);
        if (data.name !== undefined) sheet.getRange(i + 1, 3).setValue(data.name);
        if (data.value !== undefined) sheet.getRange(i + 1, 4).setValue(parseFloat(data.value) || 0);
        if (data.location !== undefined) sheet.getRange(i + 1, 5).setValue(data.location);
        if (data.pic !== undefined) sheet.getRange(i + 1, 6).setValue(data.pic);
        if (data.photo_base64 !== undefined) sheet.getRange(i + 1, 7).setValue(photo);
        if (data.category !== undefined) sheet.getRange(i + 1, 10).setValue(data.category);
        if (data.source !== undefined) sheet.getRange(i + 1, 11).setValue(data.source);
        if (data.taksasi !== undefined) sheet.getRange(i + 1, 12).setValue(parseFloat(data.taksasi) || 0);
        writeLog(user.username, 'UPDATE_INVENTORY', data.id);
        return { success: true, message: 'Inventaris berhasil diperbarui.' };
      }
    }
    return { success: false, message: 'Data inventaris tidak ditemukan.' };
  } else {
    // Generate new ID: INV-YYYYMMDD-RANDOM
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    const newId = 'INV-' + dateStr + '-' + rand;
    
    sheet.appendRow([
      newId,
      data.date_acquired || '',
      data.name || '',
      parseFloat(data.value) || 0,
      data.location || '',
      data.pic || '',
      photo,
      user.username,
      new Date().toISOString(),
      data.category || '',
      data.source || '',
      parseFloat(data.taksasi) || 0
    ]);
    writeLog(user.username, 'ADD_INVENTORY', newId);
    return { success: true, message: 'Inventaris berhasil ditambahkan.', id: newId };
  }
}

function deleteInventory(data, user) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.INVENTORY);
  if (!sheet) return { success: false, message: 'Sheet Inventory tidak ditemukan.' };
  const rows  = sheet.getDataRange().getValues();
  
  for (let i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] === data.id) {
      sheet.deleteRow(i + 1);
      writeLog(user.username, 'DELETE_INVENTORY', data.id);
      return { success: true, message: 'Inventaris berhasil dihapus.' };
    }
  }
  return { success: false, message: 'Data inventaris tidak ditemukan.' };
}
