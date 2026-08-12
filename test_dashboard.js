const url = 'https://script.google.com/macros/s/AKfycbzz_RmKR_q_BQvS42Z4EkF7VVXLk-N8M_iZ3L0EJbH3kzMRnLKT0lQd8pULdOVbG2hAag/exec';

async function test() {
  const loginRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({action: 'login', username: 'admin', password: 'Admin1117@!'})
  });
  const loginData = await loginRes.json();
  console.log("Login:", loginData.success);
  if (!loginData.success) return console.log(loginData);

  const token = loginData.token;
  const dashRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({action: 'getDashboard', token: token, data: {month: 0, year: 2026}})
  });
  const dashData = await dashRes.json();
  console.log("Dashboard success:", dashData.success);
  if (dashData.success) {
    console.log("Total Saldo:", dashData.data.balances.totalSaldo);
    console.log("Income count:", dashData.data.income.length);
  } else {
    console.log(dashData);
  }
}
test();
