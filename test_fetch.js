const url = 'https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec?action=getIncomeList&token=601b7144-0867-48d9-a6e1-e8481a2b3e0e';
fetch(url, {redirect: 'follow'})
  .then(res => res.text())
  .then(text => console.log('Response:', text.substring(0, 500)))
  .catch(err => console.error('Error:', err));
