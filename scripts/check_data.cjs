const https = require("https");
const SUPABASE_URL = "https://lxapdcjquipdowscfgtq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w";

function get(path) {
  return new Promise((resolve, reject) => {
    const url = SUPABASE_URL + path;
    const req = https.get(url, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      }
    }, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on("error", reject);
  });
}

async function main() {
  const inc = await get("/rest/v1/income?select=date,month,year,income_type,amount,alloc_daerah,alloc_jemaat,alloc_bangun,note");
  const exp = await get("/rest/v1/expense?select=date,month,year,department,source_balance,amount,note");
  const cfg = await get("/rest/v1/config?select=key,value");
  console.log("Income count:", inc.length, "Expense count:", exp.length);
  console.log("Config keys:", cfg.map(c => c.key + "=" + c.value).slice(0, 15));
  console.log("October 2026 Income:", JSON.stringify(inc.filter(x => x.year == 2026 && x.month == 10), null, 2));
  console.log("October 2026 Expense:", JSON.stringify(exp.filter(x => x.year == 2026 && x.month == 10), null, 2));
}
main();
