const fs = require('fs');
const dbFile = '/home/sagala/pisgahbisdac/pisgahbisdac/server/db.json';
if (!fs.existsSync(dbFile)) {
  console.log('No db.json found at ' + dbFile);
  process.exit(1);
}
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
const income = db.income || [];
const may = income.filter(x => x.date && x.date.startsWith('2026-05'));

let totalAmt = 0;
let totalJemaat = 0;
let jTotCalculated = 0;

may.forEach(x => {
  if ((x.income_type || '').toLowerCase().includes('pembangunan') || parseFloat(x.alloc_bangun || 0) > 0) return; // skip
  if (x.income_type === 'Saldo Awal' || x.income_type === 'Saldo Awal Sistem') return;

  const amt = parseFloat(x.amount || 0);
  const jmt = parseFloat(x.alloc_jemaat || 0);
  totalAmt += amt;
  totalJemaat += jmt;
  
  const t = x.income_type || 'Lain-Lain';
  let calcJ = 0;
  if (t === 'Terpadu') calcJ = amt * 0.5;
  else if (t !== 'Perpuluhan' && t !== 'Khusus Daerah') calcJ = amt;

  jTotCalculated += calcJ;

  if (Math.abs(jmt - calcJ) > 1) {
    console.log('MISMATCH:', x.date, t, 'receipt:', x.receipt_no, 'amt:', amt, 'alloc_jemaat:', jmt, 'expected:', calcJ);
  }
});

console.log('--- SUMMARY ---');
console.log('Total Amount (sum of amt):', totalAmt);
console.log('Total Jemaat (sum of alloc_jemaat):', totalJemaat);
console.log('Total Jemaat Calculated (sum of formula):', jTotCalculated);
