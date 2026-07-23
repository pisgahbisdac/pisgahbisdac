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
        photo2: r[18] || '',
        photo3: r[19] || '',
        photo4: r[20] || '',
        created_by: r[7],
        created_at: r[8],
        category: r[9] || '',
        source: r[10] || '',
        taksasi: r[11] || 0,
        qty: r[12] !== undefined && r[12] !== '' ? parseInt(r[12]) : 1,
        unit: r[13] || 'Unit',
        sub_items: r[14] || '',
        status: r[15] || 'Active',
        dispose_reason: r[16] || '',
        dispose_price: r[17] || 0
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
  const photo2 = data.photo2_base64 !== undefined ? data.photo2_base64 : '';
  const photo3 = data.photo3_base64 !== undefined ? data.photo3_base64 : '';
  const photo4 = data.photo4_base64 !== undefined ? data.photo4_base64 : '';
  
  if (data.isUpdate && data.id) {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.id) {
        if (data.date_acquired !== undefined) sheet.getRange(i + 1, 2).setValue(data.date_acquired);
        if (data.name !== undefined) sheet.getRange(i + 1, 3).setValue(data.name);
        if (data.value !== undefined) sheet.getRange(i + 1, 4).setValue(parseFloat(data.value) || 0);
        if (data.location !== undefined) sheet.getRange(i + 1, 5).setValue(data.location);
        if (data.pic !== undefined) sheet.getRange(i + 1, 6).setValue(data.pic);
        if (data.photo_base64 !== undefined) sheet.getRange(i + 1, 7).setValue(photo);
        if (data.photo2_base64 !== undefined) sheet.getRange(i + 1, 19).setValue(photo2);
        if (data.photo3_base64 !== undefined) sheet.getRange(i + 1, 20).setValue(photo3);
        if (data.photo4_base64 !== undefined) sheet.getRange(i + 1, 21).setValue(photo4);
        if (data.category !== undefined) sheet.getRange(i + 1, 10).setValue(data.category);
        if (data.source !== undefined) sheet.getRange(i + 1, 11).setValue(data.source);
        if (data.taksasi !== undefined) sheet.getRange(i + 1, 12).setValue(parseFloat(data.taksasi) || 0);
        if (data.qty !== undefined) sheet.getRange(i + 1, 13).setValue(parseInt(data.qty) || 1);
        if (data.unit !== undefined) sheet.getRange(i + 1, 14).setValue(data.unit);
        if (data.sub_items !== undefined) sheet.getRange(i + 1, 15).setValue(data.sub_items);
        if (data.status !== undefined) sheet.getRange(i + 1, 16).setValue(data.status);
        if (data.dispose_reason !== undefined) sheet.getRange(i + 1, 17).setValue(data.dispose_reason);
        if (data.dispose_price !== undefined) sheet.getRange(i + 1, 18).setValue(parseFloat(data.dispose_price) || 0);
        writeLog(user.username, 'UPDATE_INVENTORY', data.id);
        return { success: true, message: 'Inventaris berhasil diperbarui.' };
      }
    }
    return { success: false, message: 'Data inventaris tidak ditemukan.' };
  } else {
    // Generate new ID: INV-PISBIS-XXXXX
    const rand = Math.floor(10000 + Math.random() * 90000);
    const newId = 'INV-PISBIS-' + rand;
    
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
      parseFloat(data.taksasi) || 0,
      parseInt(data.qty) || 1,
      data.unit || 'Unit',
      data.sub_items || '',
      data.status || 'Active',
      data.dispose_reason || '',
      parseFloat(data.dispose_price) || 0,
      photo2,
      photo3,
      photo4
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
