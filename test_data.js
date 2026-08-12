const url = 'https://script.google.com/macros/s/AKfycbzz_RmKR_q_BQvS42Z4EkF7VVXLk-N8M_iZ3L0EJbH3kzMRnLKT0lQd8pULdOVbG2hAag/exec';

async function test() {
  const loginRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({action: 'login', username: 'admin', password: 'Admin1117@!'})
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  
  // getIncomeList does NOT filter by year if we pass all=true or something?
  // Let's just fetch all income using getIncomeList
  const dashRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({action: 'getIncomeList', token: token, data: {month: 0, year: 2024}}) // Try 2024!
  });
  const dashData = await dashRes.json();
  console.log("2024 Income count:", dashData.data ? dashData.data.length : dashData);
  
  const dashRes2 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({action: 'getIncomeList', token: token, data: {month: 0, year: 2025}}) // Try 2025!
  });
  const dashData2 = await dashRes2.json();
  console.log("2025 Income count:", dashData2.data ? dashData2.data.length : dashData2);
}
test();
