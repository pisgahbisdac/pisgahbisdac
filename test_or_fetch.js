const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';

async function test() {
  const id = 'K-10/2026/01';
  
  const url1 = `${SUPABASE_URL}/rest/v1/income?or=(transaction_id.eq.${id},receipt_no.eq.${id})`;
  const res1 = await fetch(url1, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } });
  console.log('Without quotes status:', res1.status, await res1.text());
  
  const url2 = `${SUPABASE_URL}/rest/v1/income?or=(transaction_id.eq.%22${id}%22,receipt_no.eq.%22${id}%22)`;
  const res2 = await fetch(url2, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } });
  console.log('With quotes status:', res2.status, await res2.text());
}
test();
