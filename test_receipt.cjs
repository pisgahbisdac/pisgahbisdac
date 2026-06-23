const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Capture all console logs
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  console.log('Navigating to laporan.html...');
  await page.goto('http://localhost:5173/laporan.html', { waitUntil: 'networkidle2' });
  
  console.log('Logging in...');
  await page.type('#username', 'bendahara');
  await page.type('#password', 'Admin1117!');
  await page.evaluate(() => {
    document.querySelector('button[onclick="handleLogin()"]').click();
  });
  
  console.log('Waiting for login to complete...');
  // Wait for the login screen to hide
  await page.waitForFunction(() => {
    return document.getElementById('login-screen') && document.getElementById('login-screen').style.display === 'none';
  }, { timeout: 10000 }).catch(e => console.log('Timeout waiting for login screen to hide'));
  
  // Wait a bit more for initial sync
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Evaluating state...');
  const state = await page.evaluate(() => {
    return {
      systemConfig_keys: Object.keys(window.systemConfig || {}),
      receipt_prefix_bangun: (window.systemConfig || {}).receipt_prefix_bangun,
      cachedIncomeLength: (window.cachedIncome || []).length,
      role: window.currentUser ? window.currentUser.role : null,
      incTypeOptions: Array.from(document.getElementById('incType').options).map(o => o.value),
      incTypeValue: document.getElementById('incType') ? document.getElementById('incType').value : null,
      incReceiptValue: document.getElementById('incReceipt') ? document.getElementById('incReceipt').value : null,
      incReceiptDisplay: document.getElementById('incReceipt') ? document.getElementById('incReceipt').style.display : null
    };
  });
  console.log('Initial State:', JSON.stringify(state, null, 2));
  
  console.log('Selecting Pembangunan...');
  await page.evaluate(() => {
    const sel = document.getElementById('incType');
    sel.value = 'Pembangunan';
    window.handleTypeChange();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const finalState = await page.evaluate(() => {
    return {
      incReceiptValue: document.getElementById('incReceipt').value,
      notifications: Array.from(document.querySelectorAll('.notification')).map(el => el.textContent)
    };
  });
  console.log('FINAL STATE:', JSON.stringify(finalState, null, 2));
  
  await browser.close();
})();
