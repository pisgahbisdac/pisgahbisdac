const token = '601b7144-0867-48d9-a6e1-e8481a2b3e0e';
const base = 'https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec';
(async () => {
  try {
    console.log('Fetching Expense...');
    let r1 = await fetch(base + '?action=getExpenseList&token=' + token);
    console.log('Expense:', (await r1.text()).substring(0, 100));
    console.log('Fetching Balances...');
    let r2 = await fetch(base + '?action=getBalances&token=' + token);
    console.log('Balances:', (await r2.text()).substring(0, 100));
  } catch(e) { console.error(e); }
})();
