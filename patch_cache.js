const fs = require('fs');
let code = fs.readFileSync('/home/sagala/pisgahbisdac/pisgahbisdac/code.gs', 'utf8');

const cacheHelpers = 
// ============================================================
//  CACHE SERVICE HELPER
// ============================================================
function getCacheVersion() {
  try {
    const cache = CacheService.getScriptCache();
    let v = cache.get('CACHE_VERSION');
    if (!v) {
      v = Date.now().toString();
      cache.put('CACHE_VERSION', v, 21600);
    }
    return v;
  } catch (e) {
    return Date.now().toString();
  }
}

function bumpCacheVersion() {
  try {
    CacheService.getScriptCache().put('CACHE_VERSION', Date.now().toString(), 21600);
  } catch(e) {}
}

function putCachedChunks(baseKey, dataObj) {
  try {
    const cache = CacheService.getScriptCache();
    const str = JSON.stringify(dataObj);
    const chunkSize = 100000;
    const chunks = Math.ceil(str.length / chunkSize);
    const data = {};
    const versionedKey = baseKey + '_' + getCacheVersion();
    data[\_chunks\] = chunks.toString();
    for (let i = 0; i < chunks; i++) {
      data[\_\] = str.slice(i * chunkSize, (i + 1) * chunkSize);
    }
    cache.putAll(data, 21600);
  } catch (e) {}
}

function getCachedChunks(baseKey) {
  try {
    const cache = CacheService.getScriptCache();
    const versionedKey = baseKey + '_' + getCacheVersion();
    const chunksStr = cache.get(\_chunks\);
    if (!chunksStr) return null;
    const chunks = parseInt(chunksStr);
    const keys = [];
    for (let i = 0; i < chunks; i++) keys.push(\_\);
    const dataMap = cache.getAll(keys);
    let fullStr = '';
    for (let i = 0; i < chunks; i++) {
      if (dataMap[\_\] === undefined) return null;
      fullStr += dataMap[\_\];
    }
    return JSON.parse(fullStr);
  } catch (e) {
    return null;
  }
}
;

// Inject cache helpers
code = code.replace('// ============================================================', cacheHelpers + '\n// ============================================================');

// Add bumpCacheVersion to doPost
code = code.replace(
  /const adminOnly\s*=\s*\[/, 
  \const modifiesData = ['saveIncome', 'saveBulkIncome', 'saveExpense', 'saveDepartment', 'saveUnit', 'setInitialBalance', 'deleteRecord', 'editRecord', 'editBulkIncome', 'deleteDepartment', 'deleteUnit', 'saveIncomeType', 'deleteIncomeType', 'approveTransaction'];\n    const adminOnly = [);
code = code.replace(
  /return corsResponse\(approveTransaction\(data, user\)\);\n\s*default:/g, 
  \const resultApprove = approveTransaction(data, user); if (resultApprove.success) bumpCacheVersion(); return corsResponse(resultApprove);\n      default:);

// We should replace all 'return corsResponse(saveIncome(data, user));' with catching result
const ops = [
  'saveIncome', 'saveBulkIncome', 'saveExpense', 'saveDepartment', 
  'saveUnit', 'setInitialBalance', 'deleteRecord', 'editRecord', 
  'editBulkIncome', 'deleteDepartment', 'deleteUnit', 'saveIncomeType', 
  'deleteIncomeType'
];

ops.forEach(op => {
  const regex = new RegExp(\case '\':\\s+return corsResponse\\(\\\(data, user\\)\\);\, 'g');
  code = code.replace(regex, \case '\': const res_\ = \(data, user); if (res_\.success) bumpCacheVersion(); return corsResponse(res_\);\);
});

// Now for getAllIncome
const oldGetAllIncome = \unction getAllIncome() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INCOME);\;
const newGetAllIncome = \unction getAllIncome() {
  const cached = getCachedChunks('ALL_INCOME');
  if (cached) return cached;
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INCOME);\;
code = code.replace(oldGetAllIncome, newGetAllIncome);

code = code.replace(
  \  return result;\n}\n\n// ============================================================\n//  PENGELUARAN\,
  \  putCachedChunks('ALL_INCOME', result);\n  return result;\n}\n\n// ============================================================\n//  PENGELUARAN);

// Now for getAllExpense
const oldGetAllExpense = \unction getAllExpense() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.EXPENSE);\;
const newGetAllExpense = \unction getAllExpense() {
  const cached = getCachedChunks('ALL_EXPENSE');
  if (cached) return cached;
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.EXPENSE);\;
code = code.replace(oldGetAllExpense, newGetAllExpense);

code = code.replace(
  \  return result;\n}\n\n// ============================================================\n//  FOTO\,
  \  putCachedChunks('ALL_EXPENSE', result);\n  return result;\n}\n\n// ============================================================\n//  FOTO);

// Now for getMasterData
const oldGetMasterData = \unction getMasterData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();\;
const newGetMasterData = \unction getMasterData() {
  const cached = getCachedChunks('MASTER_DATA');
  if (cached) return { success: true, data: cached };
  const ss = SpreadsheetApp.getActiveSpreadsheet();\;
code = code.replace(oldGetMasterData, newGetMasterData);

code = code.replace(
  \  return {
    success: true,
    data: {
      departments,
      units,
      incomeTypes
    }
  };
}\,
  \  const data = { departments, units, incomeTypes };
  putCachedChunks('MASTER_DATA', data);
  return { success: true, data };
});

fs.writeFileSync('/home/sagala/pisgahbisdac/pisgahbisdac/code.gs', code);
console.log('Cache injection complete.');
