import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const id = 'INC-2026100912345'; // fake old id
  
  // try to fetch without quotes
  const { data: data1, error: err1 } = await supabase.from('income').select('transaction_id').or(`transaction_id.eq.${id},receipt_no.eq.${id}`);
  console.log('Without quotes:', err1 ? err1.message : data1.length);
  
  // try to fetch with quotes
  const { data: data2, error: err2 } = await supabase.from('income').select('transaction_id').or(`transaction_id.eq."${id}",receipt_no.eq."${id}"`);
  console.log('With quotes:', err2 ? err2.message : data2.length);
}

test();
