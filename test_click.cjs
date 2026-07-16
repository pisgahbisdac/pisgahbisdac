const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Tangkap console log
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173/laporan.html', { waitUntil: 'networkidle2' });
  
  // Login
  await page.type('#loginUsername', 'bendahara');
  await page.type('#loginPassword', 'Benda1117@');
  await page.click('button.btn-primary');
  
  await page.waitForTimeout(2000);
  
  // Klik No. Series
  await page.evaluate(() => {
    switchPage('series');
  });
  
  await page.waitForTimeout(1000);
  
  // Isi data
  await page.type('#series_Pemasukan_start', '260701');
  
  // Klik simpan
  await page.click('#btnSaveSeries');
  
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
