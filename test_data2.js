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

    if (!token) {
        console.log("No token obtained");
        return;
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
      const data = await res.json();
      console.log("Total Income Records:", data.data ? data.data.length : data);
      if (data.data && data.data.length > 0) {
        console.log("First 3 records years:", data.data.slice(0, 3).map(r => r.year));
        console.log("Last 3 records years:", data.data.slice(-3).map(r => r.year));
      }
    }
  } catch (e) {
      console.error(e);
  }
}
test();
