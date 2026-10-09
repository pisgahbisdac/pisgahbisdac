const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';

async function test() {
  const url = `${SUPABASE_URL}/rest/v1/income?select=transaction_id,receipt_photo,receipt_no&limit=5`;
  const res = await fetch(url, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } });
  const data = await res.json();
  data.forEach(d => {
     if (d.receipt_photo) {
        console.log('ID:', d.transaction_id);
        console.log('Start:', String(d.receipt_photo).substring(0, 50));
        console.log('End:', String(d.receipt_photo).substring(String(d.receipt_photo).length - 50));
     }
  });
}
test();
