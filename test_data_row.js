import fs from 'fs';
const url = 'https://script.google.com/macros/s/AKfycbzz_RmKR_q_BQvS42Z4EkF7VVXLk-N8M_iZ3L0EJbH3kzMRnLKT0lQd8pULdOVbG2hAag/exec';

async function test() {
  try {
    const loginRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({action: 'login', username: 'admin', password: 'Admin1117@!'}),
      redirect: 'manual'
    });
    
    let token = '';
    if (loginRes.status === 302) {
      const res = await fetch(loginRes.headers.get('location'));
      const data = await res.json();
      token = data.token;
    }

    const dataRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({action: 'getIncomeList', token: token, data: {}}),
      redirect: 'manual'
    });
    
    if (dataRes.status === 302) {
      const res = await fetch(dataRes.headers.get('location'));
      const text = await res.text();
      try {
         const data = JSON.parse(text);
         if (data.data && data.data.length > 0) {
             console.log("FIRST ROW DATA:", JSON.stringify(data.data[data.data.length - 1], null, 2));
         } else {
             console.log("NO DATA or SUCCESS=FALSE:", data);
         }
      } catch(e) {
         console.log("PARSE ERROR. HTML OUTPUT:");
         console.log(text.substring(0, 500));
      }
    }
  } catch (e) {
      console.error(e);
  }
}
test();
