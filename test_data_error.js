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
      const loc = loginRes.headers.get('location');
      const res = await fetch(loc);
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
      const loc = dataRes.headers.get('location');
      const res = await fetch(loc);
      const text = await res.text();
      fs.writeFileSync('error_output.html', text);
      console.log("Saved to error_output.html");
    }
  } catch (e) {
      console.error(e);
  }
}
test();
