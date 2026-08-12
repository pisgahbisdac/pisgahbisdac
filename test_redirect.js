const url = 'https://script.google.com/macros/s/AKfycbzz_RmKR_q_BQvS42Z4EkF7VVXLk-N8M_iZ3L0EJbH3kzMRnLKT0lQd8pULdOVbG2hAag/exec';
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify({action: 'ping'}),
  redirect: 'manual'
}).then(r => {
    console.log("Status:", r.status);
    console.log("Location:", r.headers.get('location'));
}).catch(console.error);
