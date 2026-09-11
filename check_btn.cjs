const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: "new"
  });
  const page = await browser.newPage();
  
  // Navigate to Dashboard first, then to laporan.html
  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(2000);
  
  // Login
  await page.type('input[type="text"]', 'bendahara');
  await page.type('input[type="password"]', 'Benda1117@');
  await page.click('button.bg-navy-900');
  
  await page.waitForTimeout(3000);
  
  // Go to Laporan Keuangan
  await page.goto('http://localhost:5174/laporan.html');
  await page.waitForTimeout(3000);
  
  const info = await page.evaluate(() => {
    const btn = document.getElementById('floatingSyncBtn');
    if (!btn) return 'BUTTON NOT FOUND';
    const comp = window.getComputedStyle(btn);
    return {
      className: btn.className,
      styleDisplay: btn.style.display,
      styleVisibility: btn.style.visibility,
      styleBottom: btn.style.bottom,
      compDisplay: comp.display,
      compVisibility: comp.visibility,
      compZIndex: comp.zIndex,
      compBottom: comp.bottom,
      rect: btn.getBoundingClientRect().toJSON()
    };
  });
  
  console.log(JSON.stringify(info, null, 2));
  
  await browser.close();
})();
