const fs = require('fs');
const html = fs.readFileSync('dist/laporan.html', 'utf8');
const startIndex = html.indexOf('<div id="editTransModal"');
const endIndex = html.indexOf('<!-- MODAL: IMAGE VIEWER (Gallery) -->');
const snippet = html.substring(startIndex, endIndex);
let depth = 0;
const regex = /<\/?div[^>]*>/g;
let match;
while ((match = regex.exec(snippet)) !== null) {
  if (match[0].startsWith('</')) depth--;
  else if (!match[0].endsWith('/>')) depth++;
  console.log(depth, match[0]);
}
