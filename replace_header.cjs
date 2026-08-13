const fs = require('fs');
const file = 'src/laporan/main.js';
let content = fs.readFileSync(file, 'utf8');

const headerStartStr = '<th colspan="17" style="border: none; background: white; padding-bottom: 20px;">';
const headerEndStr = '</th>';

const startIdx = content.indexOf(headerStartStr);
const endIdx = content.indexOf(headerEndStr, startIdx) + headerEndStr.length;

let headerBlock = content.substring(startIdx, endIdx);

let expenseHeader = headerBlock.replace('colspan="17"', 'colspan="7"');
expenseHeader = expenseHeader.replace('<h3 style="margin:5px 0 0 0; font-size: 12pt;">LAPORAN KEUANGAN JEMAAT</h3>', '<h3 style="margin:5px 0 0 0; font-size: 12pt;">LAMPIRAN: RINCIAN PENGELUARAN JEMAAT & DAERAH</h3>');

const targetToReplace = `            <tr>
              <th colspan="7" style="border: none; padding-bottom: 15px; color: #000; font-family: sans-serif; text-align: center;">
                <h3 style="margin:0; font-size: 11pt; text-align: center;">LAMPIRAN: RINCIAN PENGELUARAN JEMAAT & DAERAH</h3>
              </th>
            </tr>`;

if(content.indexOf(targetToReplace) === -1) {
  console.log('Could not find target to replace. Looking for similar...');
} else {
  content = content.replace(targetToReplace, '            <tr>\n              ' + expenseHeader + '\n            </tr>');
  fs.writeFileSync(file, content);
  console.log('Replaced successfully!');
}
