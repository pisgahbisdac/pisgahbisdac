import re

def main():
    # 1. Update laporan.html
    html_file = 'laporan.html'
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replaces for stat-cards
    replaces = [
        ('<div class="stat-card">\n      <div class="stat-header"><div class="stat-label">Total Saldo</div>',
         '<div class="stat-card clickable" onclick="openDashboardDetail(\'total\')">\n      <div class="stat-header"><div class="stat-label">Total Saldo</div>'),
        ('<div class="stat-card">\n      <div class="stat-header"><div class="stat-label">Kas Bersih (Non-Daerah)</div>',
         '<div class="stat-card clickable" onclick="openDashboardDetail(\'bersih\')">\n      <div class="stat-header"><div class="stat-label">Kas Bersih (Non-Daerah)</div>'),
        ('<div class="stat-card">\n      <div class="stat-header"><div class="stat-label">Pemasukan Periode</div>',
         '<div class="stat-card clickable" onclick="openDashboardDetail(\'in\')">\n      <div class="stat-header"><div class="stat-label">Pemasukan Periode</div>'),
        ('<div class="stat-card">\n      <div class="stat-header"><div class="stat-label">Pengeluaran Periode</div>',
         '<div class="stat-card clickable" onclick="openDashboardDetail(\'out\')">\n      <div class="stat-header"><div class="stat-label">Pengeluaran Periode</div>'),
        ('<div class="stat-card">\n      <div class="stat-header"><div class="stat-label">Kas Jemaat</div>',
         '<div class="stat-card clickable" onclick="openDashboardDetail(\'jemaat\')">\n      <div class="stat-header"><div class="stat-label">Kas Jemaat</div>'),
        ('<div class="stat-card">\n      <div class="stat-header"><div class="stat-label">Kas Daerah</div>',
         '<div class="stat-card clickable" onclick="openDashboardDetail(\'daerah\')">\n      <div class="stat-header"><div class="stat-label">Kas Daerah</div>'),
        ('<div class="stat-card">\n      <div class="stat-header"><div class="stat-label">Dana Pembangunan</div>',
         '<div class="stat-card clickable" onclick="openDashboardDetail(\'bangun\')">\n      <div class="stat-header"><div class="stat-label">Dana Pembangunan</div>')
    ]

    for old_str, new_str in replaces:
        content = content.replace(old_str, new_str)

    # Insert Modal HTML before Notification
    modal_html = """  <div id="dashboardDetailModal" class="modal-overlay" style="display:none; align-items:flex-end; z-index:1100;">
    <div class="modal-content slide-up" style="max-height: 85vh; overflow-y: hidden; display: flex; flex-direction: column;">
      <div class="modal-header">
        <div class="modal-title" id="dashDetailTitle">Rincian Transaksi</div>
        <button class="btn-icon-only" onclick="closeDashboardDetail()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="modal-body" style="overflow-y: auto; flex: 1; padding: 12px;" id="dashDetailContent">
      </div>
    </div>
  </div>

  <div class="notification" """
    content = content.replace('  <div class="notification" ', modal_html)

    # Insert JS functions before </script>
    js_code = """
    function closeDashboardDetail() {
      document.getElementById('dashboardDetailModal').style.display = 'none';
    }

    function openDashboardDetail(type) {
      if (!cachedSaldo) return;
      const month = parseInt(document.getElementById('dashMonth').value);
      const year = parseInt(document.getElementById('dashYear').value);
      let targetDateEnd = month === 0 ? new Date(year, 11, 31, 23, 59, 59) : new Date(year, month, 0, 23, 59, 59);

      const filteredInc = (cachedIncome || []).filter(x => { const d = new Date(x.date); return d.getFullYear() === year && (month === 0 || d.getMonth() + 1 === month); });
      const filteredExp = (cachedExpense || []).filter(x => { const d = new Date(x.date); return d.getFullYear() === year && (month === 0 || d.getMonth() + 1 === month); });
      const historicalInc = (cachedIncome || []).filter(x => new Date(x.date) <= targetDateEnd);
      const historicalExp = (cachedExpense || []).filter(x => new Date(x.date) <= targetDateEnd);

      let title = "";
      let txList = [];
      const isViewer = currentUser && currentUser.role === 'Viewer';

      if (type === 'total' || type === 'bersih') {
        title = type === 'total' ? "Semua Transaksi Saldo" : "Semua Transaksi Kas Bersih";
        historicalInc.forEach(x => { if (type === 'total' || x.alloc_jemaat > 0 || x.alloc_bangun > 0) txList.push({...x, isInc: true}); });
        historicalExp.forEach(x => { if (type === 'total' || x.source_balance === 'Kas Jemaat' || x.source_balance === 'Pembangunan') txList.push({...x, isInc: false}); });
      } else if (type === 'in') {
        title = "Pemasukan Periode Ini";
        filteredInc.forEach(x => txList.push({...x, isInc: true}));
      } else if (type === 'out') {
        title = "Pengeluaran Periode Ini";
        filteredExp.forEach(x => txList.push({...x, isInc: false}));
      } else if (type === 'jemaat') {
        title = "Rincian Kas Jemaat";
        historicalInc.forEach(x => { if (x.alloc_jemaat > 0) txList.push({...x, isInc: true, overrideAmt: x.alloc_jemaat}); });
        historicalExp.forEach(x => { if (x.source_balance === 'Kas Jemaat') txList.push({...x, isInc: false}); });
      } else if (type === 'daerah') {
        title = "Rincian Kas Daerah";
        historicalInc.forEach(x => { if (x.alloc_daerah > 0) txList.push({...x, isInc: true, overrideAmt: x.alloc_daerah}); });
        historicalExp.forEach(x => { if (x.source_balance === 'Daerah') txList.push({...x, isInc: false}); });
      } else if (type === 'bangun') {
        title = "Rincian Dana Pembangunan";
        historicalInc.forEach(x => { if (x.alloc_bangun > 0) txList.push({...x, isInc: true, overrideAmt: x.alloc_bangun}); });
        historicalExp.forEach(x => { if (x.source_balance === 'Pembangunan') txList.push({...x, isInc: false}); });
      }

      if (type === 'jemaat' && cachedSaldo.initJemaat) {
        txList.push({ isInc: true, overrideAmt: cachedSaldo.initJemaat, receipt_no: 'SALDO_AWAL', date: '2000-01-01', income_type: 'Saldo Awal Sistem', note: 'Diinput saat setup', nama_pemberi: 'Sistem' });
      }
      if (type === 'daerah' && cachedSaldo.initDaerah) {
        txList.push({ isInc: true, overrideAmt: cachedSaldo.initDaerah, receipt_no: 'SALDO_AWAL', date: '2000-01-01', income_type: 'Saldo Awal Sistem', note: 'Diinput saat setup', nama_pemberi: 'Sistem' });
      }
      if (type === 'bangun' && cachedSaldo.initBangun) {
        txList.push({ isInc: true, overrideAmt: cachedSaldo.initBangun, receipt_no: 'SALDO_AWAL', date: '2000-01-01', income_type: 'Saldo Awal Sistem', note: 'Diinput saat setup', nama_pemberi: 'Sistem' });
      }
      if (type === 'total') {
        const initT = (cachedSaldo.initJemaat || 0) + (cachedSaldo.initDaerah || 0) + (cachedSaldo.initBangun || 0);
        if (initT) txList.push({ isInc: true, overrideAmt: initT, receipt_no: 'SALDO_AWAL', date: '2000-01-01', income_type: 'Saldo Awal Sistem', note: 'Diinput saat setup', nama_pemberi: 'Sistem' });
      }
      if (type === 'bersih') {
        const initB = (cachedSaldo.initJemaat || 0) + (cachedSaldo.initBangun || 0);
        if (initB) txList.push({ isInc: true, overrideAmt: initB, receipt_no: 'SALDO_AWAL', date: '2000-01-01', income_type: 'Saldo Awal Sistem', note: 'Diinput saat setup', nama_pemberi: 'Sistem' });
      }

      txList.sort((a, b) => new Date(b.date) - new Date(a.date));

      document.getElementById('dashDetailTitle').textContent = title;
      
      let html = "";
      if (txList.length === 0) {
        html = `<div class="empty-state">Tidak ada transaksi.</div>`;
      } else {
        html = '<div style="display:flex; flex-direction:column; gap:8px;">';
        let totalVal = 0;
        txList.forEach(x => {
          const amt = x.overrideAmt || x.amount;
          if (x.isInc) totalVal += amt; else totalVal -= amt;
          const isPrivCategory = isViewer && x.isInc && isPrivateCategory(x.income_type);
          const displayPihak = x.isInc ? (isPrivCategory ? '*** (Privasi)' : (x.unit_name && x.unit_name !== '-' ? x.unit_name : (x.nama_pemberi || '-'))) : (x.nama_penerima || '-');
          const displayNote = isPrivCategory ? '*** (Privasi)' : (x.note || '-');
          
          let photoBtn = '';
          if (x.receipt_photo) { photoBtn = `<button class="btn btn-ghost" style="padding:4px 8px; font-size:12px; margin-top:8px;" onclick="openPhotoModal('${x.receipt_photo}')">Lihat Foto</button>`; }

          html += `
          <div style="padding: 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--empty-bg);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <div>
                <span class="badge ${x.isInc ? 'badge-green' : 'badge-red'}">${x.isInc ? 'Pemasukan' : 'Pengeluaran'}</span>
                <span class="badge badge-gray" style="margin-left:4px;">${x.receipt_no}</span>
              </div>
              <div class="${x.isInc ? 'amount-pos' : 'amount-neg'}" style="font-weight: 700; font-size: 16px;">${x.isInc ? '+' : '-'}${fmt(amt)}</div>
            </div>
            <div style="font-size: 12px; color: var(--text2);">
              <div style="margin-bottom:2px;">Tgl: <strong style="color:var(--text)">${fmtDate(x.date)}</strong></div>
              <div style="margin-bottom:2px;">Pihak: <strong style="color:var(--text)">${displayPihak}</strong></div>
              <div style="margin-bottom:2px;">Ket: <strong style="color:var(--text)">${x.isInc ? x.income_type : x.department}</strong></div>
              <div style="color:var(--text4);">${displayNote}</div>
            </div>
            ${photoBtn}
          </div>`;
        });
        html += `<div style="padding: 12px; border: 1px dashed var(--glass-border); border-radius: var(--radius); background: var(--empty-bg); display: flex; justify-content: space-between; margin-top: 8px;">
          <strong style="color:var(--text);">TOTAL AKUMULASI</strong>
          <strong class="${totalVal >= 0 ? 'amount-pos' : 'amount-neg'}" style="font-size: 16px;">${totalVal >= 0 ? '+' : ''}${fmt(totalVal)}</strong>
        </div>`;
        html += '</div>';
      }
      
      document.getElementById('dashDetailContent').innerHTML = html;
      document.getElementById('dashboardDetailModal').style.display = 'flex';
    }
  </script>"""
    content = content.replace('  </script>', js_code)

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)

    # 2. Add CSS to index.css
    css_file = 'src/index.css'
    with open(css_file, 'r', encoding='utf-8') as f:
        css_content = f.read()
        
    if '.stat-card.clickable' not in css_content:
        with open(css_file, 'a', encoding='utf-8') as f:
            f.write('\\n.stat-card.clickable { cursor: pointer; }\\n')

if __name__ == '__main__':
    main()
