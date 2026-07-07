const cachedIncome = [
  { income_type: 'Perpuluhan', unit_name: 'SS 1', nama_pemberi: 'Budi', amount: '1000', alloc_daerah: '1000', alloc_jemaat: '0', alloc_bangun: '0', date: '2026-06-15' },
  { income_type: 'Terpadu', unit_name: 'SS 2', nama_pemberi: 'Kolektif', amount: '500', alloc_daerah: '250', alloc_jemaat: '250', alloc_bangun: '0', date: '2026-06-15' },
  { income_type: 'Khusus', unit_name: 'SS 1', nama_pemberi: 'Kolektif SS 1', amount: '200', alloc_daerah: '0', alloc_jemaat: '200', alloc_bangun: '0', date: '2026-06-15' }
];

const systemConfig = { app_name: 'Gereja' };
const periodStr = 'Juni 2026';

function fmt(n) { return Math.round(n || 0).toLocaleString('id-ID'); }

function generatePartisipasiReportHtml(data) {
      const isMatch = (dateStr) => { return true; };

      const parts = {}; // Group by unit_name -> nama_pemberi -> income_type -> amount
      let grandTotal = 0;
      let grandTotalCats = {};
      let allocDaerah = 0;
      let allocJemaat = 0;
      let allocBangun = 0;

      (cachedIncome || []).filter(x => isMatch(x.date)).forEach(x => {
        if (x.income_type === 'Mutasi Kas / Setor Bank') return;
        const unit = (x.unit_name && x.unit_name !== '-') ? x.unit_name : 'Lainnya / Tanpa Unit';
        let pemberi = (x.nama_pemberi && x.nama_pemberi !== '-') ? x.nama_pemberi : 'Hamba Tuhan';
        const pStr = String(pemberi).toLowerCase();
        if (pStr.startsWith('kolektif ')) {
          pemberi = String(pemberi).substring(9).trim();
        } else if (pStr === 'kolektif') {
          pemberi = 'Umum';
        }
        
        const cat = x.income_type || 'Lainnya';
        const amt = parseFloat(x.amount || 0);

        if (!parts[unit]) parts[unit] = { total: 0, givers: {}, cats: {} };
        if (!parts[unit].givers[pemberi]) parts[unit].givers[pemberi] = { total: 0, cats: {} };
        
        if (!parts[unit].givers[pemberi].cats[cat]) parts[unit].givers[pemberi].cats[cat] = 0;
        parts[unit].givers[pemberi].cats[cat] += amt;
        parts[unit].givers[pemberi].total += amt;

        if (!parts[unit].cats[cat]) parts[unit].cats[cat] = 0;
        parts[unit].cats[cat] += amt;
        parts[unit].total += amt;

        if (!grandTotalCats[cat]) grandTotalCats[cat] = 0;
        grandTotalCats[cat] += amt;
        grandTotal += amt;
        
        allocDaerah += parseFloat(x.alloc_daerah || 0);
        allocJemaat += parseFloat(x.alloc_jemaat || 0);
        allocBangun += parseFloat(x.alloc_bangun || 0);
      });

      let tbodyHtml = '';
      let no = 1;
      
      const sortedUnits = Object.keys(parts).sort((a,b) => a.localeCompare(b));

      sortedUnits.forEach(unit => {
        const uData = parts[unit];
        const sortedGivers = Object.keys(uData.givers).sort((a,b) => a.localeCompare(b));
        
        tbodyHtml += `
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="2" style="padding: 8px; border: 1px solid #e2e8f0; text-align: left; font-size: 14px;">UNIT PEMBERI: ${unit.toUpperCase()}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-size: 14px;">Total Unit: Rp ${fmt(uData.total)}</td>
          </tr>
        `;

        sortedGivers.forEach(giver => {
          const gData = uData.givers[giver];
          
          let catDetails = [];
          Object.keys(gData.cats).forEach(cat => {
            if(gData.cats[cat] > 0) {
              catDetails.push(`${cat}: Rp ${fmt(gData.cats[cat])}`);
            }
          });

          tbodyHtml += `
            <tr>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; width: 40px; font-size: 12px;">${no++}</td>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 12px;">
                <div style="font-weight: 600;">${giver}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${catDetails.join(', ')}</div>
              </td>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right; font-size: 12px; font-weight: 500;">Rp ${fmt(gData.total)}</td>
            </tr>
          `;
        });
      });

      if (sortedUnits.length === 0) {
        tbodyHtml += `<tr><td colspan="3" style="text-align: center; padding: 20px; color: #64748b; font-style: italic;">Tidak ada data partisipasi di periode ini.</td></tr>`;
      }

      let grandCatHtml = '';
      Object.keys(grandTotalCats).forEach(cat => {
        grandCatHtml += `<div>${cat}: <span style="font-weight:600;">Rp ${fmt(grandTotalCats[cat])}</span></div>`;
      });

      return `
        <!DOCTYPE html>
        <html>
        <head>
        </head>
        <body>
              ${tbodyHtml}
              <tr class="total-row">
                <td colspan="2" style="text-align: right; padding: 12px 8px; font-size: 14px;">GRAND TOTAL:</td>
                <td style="text-align: right; padding: 12px 8px; font-size: 14px; color: #059669;">Rp ${fmt(grandTotal)}</td>
              </tr>
            </tbody>
          </table>

          <div style="font-size: 12px; margin-top: 20px; padding: 15px; border: 1px solid #e2e8f0; background-color: #f8fafc; border-radius: 6px;">
            <div style="font-weight:bold; margin-bottom: 8px;">Ringkasan Grand Total Per Kategori (Seluruh Unit):</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              ${grandCatHtml}
            </div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #cbd5e1;">
              <div style="font-weight:bold; margin-bottom: 8px; color: #334155;">Ringkasan Alokasi Distribusi:</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-weight: 500;">
                <div style="color: #ea580c;">Daerah: Rp ${fmt(allocDaerah)}</div>
                <div style="color: #2563eb;">Jemaat: Rp ${fmt(allocJemaat)}</div>
                <div style="color: #059669;">Pembangunan: Rp ${fmt(allocBangun)}</div>
              </div>
            </div>

            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-weight: bold; font-size: 14px; text-align: right;">
              TOTAL KESELURUHAN: Rp ${fmt(grandTotal)}
            </div>
          </div>
        </body>
        </html>
      `;
}
console.log(generatePartisipasiReportHtml({}));
