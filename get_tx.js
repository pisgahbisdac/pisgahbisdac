const fs = require('fs');
const content = fs.readFileSync('code_backup.gs', 'utf8');
const match = content.match(/const mockData = (.*?);/s);
if (match) {
  const data = JSON.parse(match[1]);
  console.log("INCOME:");
  console.log(data.income.find(x => x.receipt_no === 'PB-261002'));
  console.log("EXPENSE:");
  console.log(data.expense.find(x => x.receipt_no === 'PB-261002'));
}
