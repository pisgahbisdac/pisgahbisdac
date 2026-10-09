const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';

async function test() {
  const url3 = `${SUPABASE_URL}/rest/v1/users`;
  const res3 = await fetch(url3, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const data3 = await res3.json();
  console.log('Result 3 (all users):', data3);
}

test();
