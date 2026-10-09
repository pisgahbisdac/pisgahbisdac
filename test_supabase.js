import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.from('users').select('*').ilike('username', 'admin').eq('active', true).single();
  console.log('Test 1 (active=true):', { data, error });

  const { data: d2, error: e2 } = await supabase.from('users').select('*').ilike('username', 'admin').single();
  console.log('Test 2 (no active filter):', { data: d2, error: e2 });
}

test();
