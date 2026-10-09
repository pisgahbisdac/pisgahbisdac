const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';

async function test() {
  const url = `${SUPABASE_URL}/rest/v1/config?key=eq.sig_stempel`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  if (data && data.length > 0) {
    const val = data[0].value;
    console.log('sig_stempel length:', val ? val.length : 0);
    console.log('sig_stempel starts with:', val ? val.substring(0, 50) : 'null');
  } else {
    console.log('sig_stempel not found in DB');
  }
}

test();
