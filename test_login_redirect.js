const url = 'https://script.google.com/macros/s/AKfycbzz_RmKR_q_BQvS42Z4EkF7VVXLk-N8M_iZ3L0EJbH3kzMRnLKT0lQd8pULdOVbG2hAag/exec';

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify({action: 'login', username: 'admin', password: 'Admin1117@!'}),
  redirect: 'manual'
}).then(r => {
    console.log("Login redirect status:", r.status);
    console.log("Login redirect location:", r.headers.get('location'));
    if(r.headers.get('location')) {
       return fetch(r.headers.get('location'));
    }
}).then(r => {
    if(r) {
       console.log("Final status:", r.status);
       return r.text();
    }
}).then(console.log).catch(console.error);
