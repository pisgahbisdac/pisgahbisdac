import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Tangkap console log
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173/laporan.html', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    doLogin('bendahara', 'Benda1117@');
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    document.getElementById('navSeries').click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.type('#series_Pemasukan_start', '260701');
  
  await page.evaluate(() => saveSeriesConfig());
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
