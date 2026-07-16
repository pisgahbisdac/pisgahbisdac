    (function () {
      const savedTheme = localStorage.getItem('BISDAC_theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
    })();

    function preLoadLogos() {
      try {
        const cached = localStorage.getItem('BISDAC_config');
        if (cached) {
          const config = JSON.parse(cached);
          document.addEventListener('DOMContentLoaded', () => {
            const loginLogoEls = document.querySelectorAll('.app-logo-login-img');
            const loginDefaultEls = document.querySelectorAll('.app-logo-login-default');
            if (config.logo_login && config.logo_login.trim() !== '') {
              loginLogoEls.forEach(el => { el.src = config.logo_login; el.style.display = 'block'; });
              loginDefaultEls.forEach(el => el.style.display = 'none');
            }
          });
        }
      } catch (e) { }
    }
    preLoadLogos();

    const svgStore = {
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
      moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
      search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      edit: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
      trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
      building: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="15" y1="22" x2="15" y2="2"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/>',
      users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      church: '<path d="M18 22V10l-6-6-6 6v12"/><path d="M12 4v4"/><path d="M10 6h4"/><path d="M14 22v-4a2 2 0 0 0-4 0v4"/>',
      mappin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
      hammer: '<path d="M14 14l6 6"/><path d="M15 13l-4-4 2-2 4 4-2 2z"/><path d="M11 9L6.5 4.5a2.12 2.12 0 0 0-3 0L2 6a2.12 2.12 0 0 0 0 3l4.5 4.5"/>',
      trendDown: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
      trendUp: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
      check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
      hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
      clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
      home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
      key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
      log: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
      plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
      log: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
      save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
      plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
      refresh: '<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
      eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
      eyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>',
      image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
      printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
      user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
    };

    function getIcon(name, sizeClass = 'lucide-sm') {
      return `<svg class="lucide ${sizeClass}" viewBox="0 0 24 24">${svgStore[name] || ''}</svg>`;
    }

    function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('BISDAC_theme', newTheme);
      updateThemeIcons();
    }

    function updateThemeIcons() {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const iconName = currentTheme === 'dark' ? 'sun' : 'moon';
      document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.innerHTML = getIcon(iconName, 'lucide-md');
      });
    }

    document.addEventListener('DOMContentLoaded', updateThemeIcons);

    function closeDashboardDetail() {
      document.getElementById('dashboardDetailModal').style.display = 'none';
    }

    function openDashboardDetail(type) {
      console.log("openDashboardDetail called with type:", type);
      console.log("cachedSaldo:", cachedSaldo);
      if (!cachedSaldo) { console.log("returning early due to no cachedSaldo"); return; }
      const monthEl = document.getElementById('dashMonth');
      const yearEl = document.getElementById('dashYear');
      console.log("monthEl:", monthEl, "yearEl:", yearEl);
      if (!monthEl || !yearEl) { console.log("returning early due to missing elements"); return; }
      const month = parseInt(monthEl.value);
      const year = parseInt(yearEl.value);
      console.log("parsed month:", month, "year:", year);
      let targetDateEnd = month === 0 ? new Date(year, 11, 31, 23, 59, 59) : new Date(year, month, 0, 23, 59, 59);

      console.log("filtering inc/exp");
      const filteredInc = (cachedIncome || []).filter(x => { const d = new Date(x.date); return d.getFullYear() === year && (month === 0 || d.getMonth() + 1 === month); });
      const filteredExp = (cachedExpense || []).filter(x => { const d = new Date(x.date); return d.getFullYear() === year && (month === 0 || d.getMonth() + 1 === month); });
      const historicalInc = (cachedIncome || []).filter(x => new Date(x.date) <= targetDateEnd);
      const historicalExp = (cachedExpense || []).filter(x => new Date(x.date) <= targetDateEnd);

      let title = "";
      let txList = [];
      const perms = getRolePerms(currentUser ? currentUser.role : '');
      const isViewer = perms.isAnonymous;

      if (type === 'total' || type === 'bersih') {
        title = type === 'total' ? "Semua Transaksi Saldo" : "Semua Transaksi Kas Bersih";
        historicalInc.forEach(x => { if (type === 'total' || x.alloc_jemaat > 0 || x.alloc_bangun > 0) txList.push({ ...x, isInc: true }); });
        historicalExp.forEach(x => { 
          if (x.department === 'Mutasi Kas / Setor Bank') return;
          if (type === 'total' || x.source_balance === 'Kas Jemaat' || x.source_balance === 'Pembangunan') txList.push({ ...x, isInc: false }); 
        });
      } else if (type === 'in') {
        title = "Pemasukan Periode Ini";
        filteredInc.forEach(x => txList.push({ ...x, isInc: true }));
      } else if (type === 'out') {
        title = "Pengeluaran Periode Ini";
        filteredExp.forEach(x => { if (x.department !== 'Mutasi Kas / Setor Bank') txList.push({ ...x, isInc: false }); });
      } else if (type === 'jemaat') {
        title = "Rincian Kas Jemaat";
        historicalInc.forEach(x => { if (x.alloc_jemaat > 0) txList.push({ ...x, isInc: true, overrideAmt: x.alloc_jemaat }); });
        historicalExp.forEach(x => { if (x.department !== 'Mutasi Kas / Setor Bank' && x.source_balance === 'Kas Jemaat') txList.push({ ...x, isInc: false }); });
      } else if (type === 'daerah') {
        title = "Rincian Kas Daerah";
        historicalInc.forEach(x => { if (x.alloc_daerah > 0) txList.push({ ...x, isInc: true, overrideAmt: x.alloc_daerah }); });
        historicalExp.forEach(x => { if (x.department !== 'Mutasi Kas / Setor Bank' && x.source_balance === 'Daerah') txList.push({ ...x, isInc: false }); });
      } else if (type === 'bangun') {
        title = "Rincian Dana Pembangunan";
        historicalInc.forEach(x => { if (x.alloc_bangun > 0) txList.push({ ...x, isInc: true, overrideAmt: x.alloc_bangun }); });
        historicalExp.forEach(x => { if (x.department !== 'Mutasi Kas / Setor Bank' && x.source_balance === 'Pembangunan') txList.push({ ...x, isInc: false }); });
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
        let totalInc = 0;
        let totalExp = 0;
        let listHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column; gap:6px;">';

        txList.forEach(x => {
          const amt = x.overrideAmt || x.amount;
          if (x.isInc) totalInc += amt; else totalExp += amt;
          const isPrivCategory = isViewer && x.isInc && isPrivateCategory(x.income_type);
          const displayPihak = x.isInc ? (isPrivCategory ? '*** (Privasi)' : (x.unit_name && x.unit_name !== '-' ? x.unit_name : (x.nama_pemberi || '-'))) : (x.nama_penerima || '-');
          const displayNote = isPrivCategory ? '*** (Privasi)' : (x.note || '-');

          let photoBtn = '';
          photoBtn = getPhotoBtnText(x);

          listHtml += `
          <div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--empty-bg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge ${x.isInc ? 'badge-green' : 'badge-red'}" style="font-size:10px; padding:2px 7px;">${x.isInc ? 'IN' : 'OUT'}</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no}</span>
              </div>
              <div class="${x.isInc ? 'amount-pos' : 'amount-neg'}" style="font-weight: 700; font-size: 15px; white-space:nowrap;">${x.isInc ? '+' : '-'}${fmt(amt)}</div>
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
              <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
              <span style="color:var(--text4)">Pihak</span><strong style="color:var(--text); font-weight:600; overflow:hidden; text-overflow:ellipsis;">${displayPihak}</strong>
              <span style="color:var(--text4)">Ket</span><strong style="color:var(--text); font-weight:600;">${x.isInc ? x.income_type : x.department}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${displayNote}</span>
            </div>
            ${photoBtn}
          </div>`;
        });
        listHtml += '</div>';

        let totalVal = totalInc - totalExp;
        let summaryHtml = `
        <div class="dash-summary-grid" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
          <div style="background: rgba(5, 150, 105, 0.08); border: 1px solid rgba(5, 150, 105, 0.2); padding: 12px; border-radius: var(--radius); text-align: center; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 11px; color: var(--text3); margin-bottom: 4px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Pemasukan</div>
            <div class="amount-pos" style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">+${fmt(totalInc)}</div>
          </div>
          <div style="background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.2); padding: 12px; border-radius: var(--radius); text-align: center; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 11px; color: var(--text3); margin-bottom: 4px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Pengeluaran</div>
            <div class="amount-neg" style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">-${fmt(totalExp)}</div>
          </div>
          <div style="background: var(--empty-bg); border: 1px solid var(--glass-border); padding: 12px; border-radius: var(--radius); text-align: center; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 11px; color: var(--text3); margin-bottom: 4px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Saldo</div>
            <div class="${totalVal >= 0 ? 'amount-pos' : 'amount-neg'}" style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">${totalVal >= 0 ? '+' : ''}${fmt(totalVal)}</div>
          </div>
        </div>
        `;

        html = summaryHtml + listHtml;
      }

      document.getElementById('dashDetailContent').innerHTML = html;
      document.getElementById('dashboardDetailModal').style.display = 'flex';
    }
    const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec';

    let currentIncPhotos = [];
    let currentExpPhotos = [];
    let currentMutPhotos = [];
    let currentEditPhotos = [];
    let currentReportData = null;

    function parseRupiah(str) {
      if (!str) return 0;
      let val = String(str).replace(/[^0-9]/g, '');
      return parseFloat(val) || 0;
    }

    function formatRupiah(el) {
      let val = el.value.replace(/[^0-9]/g, '');
      if (val) {
        el.value = parseInt(val).toLocaleString('id-ID');
      } else {
        el.value = '';
      }
    }

    function getActiveApiUrl() { const savedUrl = localStorage.getItem('BISDAC_api_url'); return (savedUrl && savedUrl.trim() !== '') ? savedUrl.trim() : DEFAULT_API_URL; }
    function printUnitReport(searchTermOverride = null) {
      if (!window.currentHistoryData || window.currentHistoryData.length === 0) return notify('Tidak ada data untuk dicetak.', 'error');

      const unitSearchTerm = (typeof searchTermOverride === 'string' ? searchTermOverride : '') || (document.getElementById('searchTrans')?.value.trim()) || '';

      const incByCat = {};
      const expByDept = {};
      let totalInc = 0;
      let totalExp = 0;

      window.currentHistoryData.forEach(x => {
        if (x.department === 'Mutasi Kas / Setor Bank' || x.income_type === 'Mutasi Kas / Setor Bank') return;
        if (x.type === 'income') {
          const cat = x.income_type || 'Lainnya';
          if (!incByCat[cat]) incByCat[cat] = [];
          incByCat[cat].push(x);
          totalInc += x.amount;
        } else {
          const dept = x.department || 'Lainnya';
          if (!expByDept[dept]) expByDept[dept] = [];
          expByDept[dept].push(x);
          totalExp += x.amount;
        }
      });

      const mNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      let periodStr = "Semua Waktu";
      const fM = parseInt(document.getElementById('filterMonth')?.value || 0);
      const fY = parseInt(document.getElementById('filterYear')?.value || 0);
      if (fM > 0 && fY > 0) periodStr = `${mNames[fM]} ${fY}`;
      else if (fM > 0) periodStr = `${mNames[fM]}`;
      else if (fY > 0) periodStr = `Tahun ${fY}`;

      currentReportData = {
        summary: { totalIncome: totalInc, totalExpense: totalExp, netBalance: totalInc - totalExp, balances: cachedSaldo || { total: 0 } },
        incByCategory: incByCat,
        expByDept: expByDept,
        month: fM || 0,
        year: fY || 0,
        customTitle: unitSearchTerm ? `LAPORAN PENCARIAN: ${unitSearchTerm.toUpperCase()}` : `LAPORAN PENCARIAN TRANSAKSI`,
        customPeriod: `Period: ${periodStr}`
      };

      showPage('laporan');
      renderReportView();

      const container = document.getElementById('printContainer');
      const content = document.getElementById('reportContent');
      if (container && content) {
        container.innerHTML = content.innerHTML;
      }

      setTimeout(() => { window.print(); }, 1500);
    }

    function getToken() { return sessionStorage.getItem('BISDAC_token'); }
    function setToken(t) { sessionStorage.setItem('BISDAC_token', t); }
    function clearToken() { sessionStorage.removeItem('BISDAC_token'); }

    async function apiGet(action, params = {}) {
      const url = new URL(getActiveApiUrl());
      url.searchParams.set('action', action); url.searchParams.set('token', getToken() || ''); url.searchParams.set('_t', Date.now());
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' }).catch(() => { localStorage.removeItem('BISDAC_api_url'); throw new Error('Jaringan Error. URL di-reset.'); });
      if (!res.ok) {
        if (res.status === 404 || res.status === 400) { localStorage.removeItem('BISDAC_api_url'); }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) {
        if (data.message && data.message.includes('Token tidak valid')) {
          setTimeout(() => { clearToken(); sessionStorage.removeItem('BISDAC_user'); window.location.reload(); }, 2500);
        }
        throw new Error(data.message || 'API Gagal');
      }
      return data;
    }

    function showGlobalLoading(text = 'Proses sedang berlangsung...') {
      const overlay = document.getElementById('globalLoadingOverlay');
      const textEl = document.getElementById('globalLoadingText');
      if (overlay && textEl) {
        textEl.innerText = text;
        overlay.style.display = 'flex';
      }
    }

    window.showGlobalLoading = showGlobalLoading;

    function hideGlobalLoading() {
      const overlay = document.getElementById('globalLoadingOverlay');
      if (overlay) overlay.style.display = 'none';
    }
    window.hideGlobalLoading = hideGlobalLoading;

    async function apiPost(action, payload = {}) {
      if (action !== 'syncData' && !window.isBulkProcessing) showGlobalLoading();
      try {
        const body = JSON.stringify({ action, token: getToken(), data: payload });
        const res = await fetch(getActiveApiUrl(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow', body: body }).catch(() => { localStorage.removeItem('BISDAC_api_url'); throw new Error('Jaringan Error. URL di-reset.'); });
        if (!res.ok) {
          if (res.status === 404 || res.status === 400) { localStorage.removeItem('BISDAC_api_url'); }
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!data.success) {
          if (data.message && data.message.includes('Token tidak valid')) {
            setTimeout(() => { clearToken(); sessionStorage.removeItem('BISDAC_user'); window.location.reload(); }, 2500);
          }
          throw new Error(data.message || 'Gagal mengirim data.');
        }
        return data;
      } finally {
        if (action !== 'syncData' && !window.isBulkProcessing) hideGlobalLoading();
      }
    }

    async function apiPostWithFallback(action, payload = {}) {
      try { return await apiPost(action, payload); } catch (error) {
        if (error.message && (error.message.includes("tidak dikenali") || error.message.includes("not found") || error.message.includes("Action"))) {
          if (action === 'editRecord' || action === 'editBulkIncome') {
            throw new Error(`Server Apps Script perlu diperbarui (Lakukan New Deployment).`);
          }
        }
        throw error;
      }
    }

    async function login(username, password) {
      const url = new URL(getActiveApiUrl());
      url.searchParams.set('action', 'login'); url.searchParams.set('username', username.trim().toLowerCase()); url.searchParams.set('password', password); url.searchParams.set('_t', Date.now());
      const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' }).catch(() => { localStorage.removeItem('BISDAC_api_url'); throw new Error('Jaringan Error. URL di-reset.'); });
      if (!res.ok) {
        if (res.status === 404 || res.status === 400) { localStorage.removeItem('BISDAC_api_url'); }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) { setToken(data.token); sessionStorage.setItem('BISDAC_user', JSON.stringify(data.user)); }
      return data;
    }

    async function doLogout() {
      if (!currentUser || currentUser.role !== 'Publik') {
        if (typeof showCustomConfirm === 'function') {
          const yes = await showCustomConfirm('Konfirmasi', 'Apakah Anda yakin ingin keluar?');
          if (!yes) return;
        } else {
          if (!confirm('Apakah Anda yakin ingin keluar?')) return;
        }
      }
      clearToken(); sessionStorage.removeItem('BISDAC_user'); sessionStorage.removeItem('BISDAC_token'); window.location.reload();
    }
    function getCurrentUser() { const u = sessionStorage.getItem('BISDAC_user'); return u ? JSON.parse(u) : null; }

    function loginAsPublic() {
      // Login langsung di latar belakang tanpa mengisi form di layar
      doLogin('test', 'Test1117!');
    }

    function getUserUnits(uname = null) {
      const targetUser = uname || (currentUser ? currentUser.username : null);
      if (!systemConfig.userUnits || !targetUser) return [];
      let units = systemConfig.userUnits;
      while (typeof units === 'string') {
        try { units = JSON.parse(units); } catch (e) { return []; }
      }
      for (const [key, val] of Object.entries(units || {})) {
        if (key.toLowerCase() === targetUser.toLowerCase()) {
          if (Array.isArray(val)) return val;
          if (typeof val === 'string') return [val]; // backward compatibility
          return [];
        }
      }
      return [];
    }

    let systemConfig = {};
    async function loadSystemConfig() {
      try {
        const cached = localStorage.getItem('BISDAC_config');
        if (cached) {
          systemConfig = JSON.parse(cached);
          if (typeof systemConfig.rolePermissions === 'string') { try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { } }
          if (typeof systemConfig.userUnits === 'string') { try { systemConfig.userUnits = JSON.parse(systemConfig.userUnits); } catch (e) { } }
          applyConfig();
        }
        const res = await apiGet('getConfig');
        if (res && res.success) {
          systemConfig = { ...systemConfig, ...(res.data || {}) };
          if (typeof systemConfig.rolePermissions === 'string') { try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { } }
          if (typeof systemConfig.userUnits === 'string') { try { systemConfig.userUnits = JSON.parse(systemConfig.userUnits); } catch (e) { } }
          localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
          applyConfig();
        }
      } catch (e) { }
    }

    function applyConfig() {
      const loginLogoEls = document.querySelectorAll('.app-logo-login-img'); const loginDefaultEls = document.querySelectorAll('.app-logo-login-default');
      if (systemConfig.logo_login && systemConfig.logo_login.trim() !== '') { loginLogoEls.forEach(el => { el.src = systemConfig.logo_login; el.style.display = 'block'; }); loginDefaultEls.forEach(el => { el.style.display = 'none'; }); }
      else { loginLogoEls.forEach(el => { el.style.display = 'none'; el.src = ''; }); loginDefaultEls.forEach(el => { el.style.display = 'block'; }); }
      const sidebarLogoEls = document.querySelectorAll('.app-logo-sidebar-img'); const sidebarDefaultEls = document.querySelectorAll('.app-logo-sidebar-default');
      if (systemConfig.logo_sidebar && systemConfig.logo_sidebar.trim() !== '') { sidebarLogoEls.forEach(el => { el.src = systemConfig.logo_sidebar; el.style.display = 'block'; }); sidebarDefaultEls.forEach(el => { el.style.display = 'none'; }); }
      else { sidebarLogoEls.forEach(el => { el.style.display = 'none'; el.src = ''; }); sidebarDefaultEls.forEach(el => { el.style.display = 'block'; }); }

      const appName = systemConfig.app_name || 'PISGAH BISDAC';
      const appSubtitle = systemConfig.app_subtitle || 'Gereja Masehi Advent';
      document.querySelectorAll('.app-name-display').forEach(el => el.textContent = appName);
      document.querySelectorAll('.app-subtitle-display').forEach(el => el.textContent = appSubtitle);

      const inputName = document.getElementById('settingAppName');
      if (inputName) inputName.value = systemConfig.app_name || '';
      const inputSub = document.getElementById('settingAppSubtitle');
      if (inputSub) inputSub.value = systemConfig.app_subtitle || '';
      const inputServer = document.getElementById('customApiUrlInput');
      if (inputServer) inputServer.value = localStorage.getItem('BISDAC_api_url') || '';

      const inputKota = document.getElementById('kotaKuitansiInput');
      if (inputKota) inputKota.value = systemConfig.kota_kuitansi || 'Manado';
      const inputH1 = document.getElementById('headerKuitansi1Input');
      if (inputH1) inputH1.value = systemConfig.header_kuitansi_1 || 'Gereja Masehi Advent Hari Ketujuh';
      const inputH2 = document.getElementById('headerKuitansi2Input');
      if (inputH2) inputH2.value = systemConfig.header_kuitansi_2 || 'Daerah Sumatera Kawasan Tengah';
      const inputH3 = document.getElementById('headerKuitansi3Input');
      if (inputH3) inputH3.value = systemConfig.header_kuitansi_3 || ('Jemaat ' + (systemConfig.app_title || 'Sistem'));

      const inTP = document.getElementById('targetPembangunanInput');
      if (inTP) inTP.value = systemConfig.target_pembangunan ? fmt(systemConfig.target_pembangunan) : '';
      const inTK = document.getElementById('komitmenTargetInput');
      if (inTK) inTK.value = systemConfig.komitmen_target ? fmt(systemConfig.komitmen_target) : '';
      const inRK = document.getElementById('komitmenRealisasiInput');
      if (inRK) inRK.value = systemConfig.komitmen_realisasi ? fmt(systemConfig.komitmen_realisasi) : '';

      const sigKeys = ['sig_bendahara', 'sig_bangun', 'sig_ketua', 'sig_pendeta'];
      sigKeys.forEach(k => {
        const imgEl = document.getElementById('preview-' + k.replace('_', '-'));
        const txtEl = document.getElementById('text-' + k.replace('_', '-'));
        if (imgEl && txtEl) {
          if (systemConfig[k] && systemConfig[k].trim() !== '') {
            imgEl.src = systemConfig[k];
            imgEl.style.display = 'block';
            txtEl.style.display = 'none';
          } else {
            imgEl.src = '';
            imgEl.style.display = 'none';
            txtEl.style.display = 'block';
          }
        }
      });

      applyRoleAccess();

      // Load signature text inputs
      if (document.getElementById('sigNameBendahara')) document.getElementById('sigNameBendahara').value = systemConfig.sig_name_bendahara || 'Herbert JS Sagala';
      if (document.getElementById('sigTitleBendahara')) document.getElementById('sigTitleBendahara').value = systemConfig.sig_title_bendahara || 'Bendahara Jemaat';
      if (document.getElementById('sigNameBangun')) document.getElementById('sigNameBangun').value = systemConfig.sig_name_bangun || 'Parulian Parhusip';
      if (document.getElementById('sigTitleBangun')) document.getElementById('sigTitleBangun').value = systemConfig.sig_title_bangun || 'Ketua Pembangunan';
      if (document.getElementById('sigNameKetua')) document.getElementById('sigNameKetua').value = systemConfig.sig_name_ketua || 'Yosep Santoso';
      if (document.getElementById('sigTitleKetua')) document.getElementById('sigTitleKetua').value = systemConfig.sig_title_ketua || 'Ketua Jemaat';
      if (document.getElementById('sigNamePendeta')) document.getElementById('sigNamePendeta').value = systemConfig.sig_name_pendeta || 'Pdt. Joseph Sitohang';
      if (document.getElementById('sigTitlePendeta')) document.getElementById('sigTitlePendeta').value = systemConfig.sig_title_pendeta || 'Gembala Jemaat';
    }

    async function saveAppTextFromInputs() {
      const name = document.getElementById('settingAppName').value;
      const subtitle = document.getElementById('settingAppSubtitle').value;
      systemConfig['app_name'] = name;
      systemConfig['app_subtitle'] = subtitle;
      localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
      applyConfig();
      try {
        await apiPostWithFallback('saveConfig', { key: 'app_name', value: name });
        await apiPostWithFallback('saveConfig', { key: 'app_subtitle', value: subtitle });
        notify('Nama aplikasi berhasil disimpan', 'success');
      } catch (err) { }
    }

    // === ROLE MANAGEMENT ===
    let selectedRoleTab = 'Admin';
    const allRoles = ['Admin', 'Ketua Jemaat', 'Pendeta', 'Bendahara', 'Viewer', 'Publik'];
    const allMenus = [
      { id: 'dashboard', label: 'Dashboard Utama' },
      { id: 'pemasukan', label: 'Pemasukan' },
      { id: 'pengeluaran', label: 'Pengeluaran' },
      { id: 'pindahbuku', label: 'Pindah Buku (Mutasi)' },
      { id: 'laporan', label: 'Laporan Keuangan' },
      { id: 'riwayat', label: 'Riwayat (Histori)' },
      { id: 'masterData', label: 'Kategori, Departemen & Unit' },
      { id: 'users', label: 'Manajemen User' },
      { id: 'akun', label: 'Pengaturan Akun (Sandi)' },
      { id: 'settings', label: 'Pengaturan Web' },
      { id: 'series', label: 'Pengaturan No. Series' },
      { id: 'logs', label: 'Audit Log' }
    ];

    function getDefaultRolePerms(role) {
      const defs = {
        Admin: { menus: { dashboard: { view: true, edit: true, del: true }, pemasukan: { view: true, edit: true, del: true }, pengeluaran: { view: true, edit: true, del: true }, pindahbuku: { view: true, edit: true, del: true }, laporan: { view: true, edit: true, del: true }, riwayat: { view: true, edit: true, del: true, approve: true }, masterData: { view: true, edit: true, del: true }, users: { view: true, edit: true, del: true }, akun: { view: true, edit: true, del: true }, settings: { view: true, edit: true, del: true }, series: { view: true, edit: true, del: true }, logs: { view: true, edit: true, del: true } }, isAnonymous: false },
        Bendahara: { menus: { dashboard: { view: true, edit: true, del: true }, pemasukan: { view: true, edit: true, del: true }, pengeluaran: { view: true, edit: true, del: true }, pindahbuku: { view: true, edit: true, del: true }, laporan: { view: true, edit: true, del: true }, riwayat: { view: true, edit: true, del: true, approve: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, series: { view: true, edit: true, del: true }, logs: { view: false, edit: false, del: false } }, isAnonymous: false },
        Viewer: { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false, approve: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false } }, isAnonymous: false },
        Publik: { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: false, edit: false, del: false }, riwayat: { view: true, edit: false, del: false, approve: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: false, edit: false, del: false }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false } }, isAnonymous: true },
        "Ketua Jemaat": { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false, approve: true }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false } }, isAnonymous: false },
        Pendeta: { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false, approve: true }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false } }, isAnonymous: false }
      };
      return defs[role] || { menus: {}, isAnonymous: false };
    }

    async function resetRolePerms() {
      const isConfirm = await showCustomConfirm('Reset Hak Akses', `Kembalikan hak akses untuk role ${selectedRoleTab} ke pengaturan default?`);
      if (!isConfirm) return;
      if (typeof systemConfig.rolePermissions === 'string') { try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { systemConfig.rolePermissions = {}; } }
      if (!systemConfig.rolePermissions) systemConfig.rolePermissions = {};

      systemConfig.rolePermissions[selectedRoleTab] = getDefaultRolePerms(selectedRoleTab);
      localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
      renderRoles();
      notify(`Hak akses ${selectedRoleTab} di-reset.`, 'success');
    }

    function renderRoles() {
      if (typeof systemConfig.rolePermissions === 'string') {
        try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { systemConfig.rolePermissions = null; }
      }
      if (!systemConfig.rolePermissions || typeof systemConfig.rolePermissions !== 'object' || Object.keys(systemConfig.rolePermissions).length === 0) {
        systemConfig.rolePermissions = {};
        allRoles.forEach(r => {
          systemConfig.rolePermissions[r] = getDefaultRolePerms(r);
        });
      }

      // Pastikan role baru ditambahkan jika sebelumnya tidak ada (legacy config)
      allRoles.forEach(r => {
        if (!systemConfig.rolePermissions[r]) {
          systemConfig.rolePermissions[r] = getDefaultRolePerms(r);
        }
      });

      document.getElementById('roleTabs').innerHTML = allRoles.map(r => `
        <button class="btn ${selectedRoleTab === r ? 'btn-primary' : 'btn-ghost'}" onclick="selectRoleTab('${r}')" style="border-radius:20px; white-space:nowrap; padding: 6px 16px;">
          ${r}
        </button>
      `).join('');

      const perms = systemConfig.rolePermissions[selectedRoleTab] || getDefaultRolePerms(selectedRoleTab);

      let html = '';
      if (selectedRoleTab !== 'Admin') {
        html += `<div style="display:flex; flex-direction:column; gap:8px;">
        <div style="background:var(--input-bg); border:1px solid var(--glass-border); border-radius:var(--radius-lg); padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:700; color:var(--text); margin-bottom:8px;">Opsi Khusus: Mode Anonim</div>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" id="roleAnonCheckbox" ${perms.isAnonymous ? 'checked' : ''} onchange="updateRoleAnon('${selectedRoleTab}', this.checked)">
                <span style="color:var(--text2); font-size:14px;">Sembunyikan kolom sensitif (Pihak/Pemberi dan Unit) di tabel Riwayat. Cocok untuk Publik.</span>
              </label>
            </div>
            <button class="btn btn-outline" style="border-color:var(--red); color:var(--red); font-size:12px; padding:6px 12px;" onclick="resetRolePerms()">Reset Default</button>
          </div>
        </div>
        </div>`;
      } else {
        html += `<div style="padding:16px; background:var(--badge-blue-bg); color:var(--text); border-radius:var(--radius-lg); margin-bottom: 8px;">Role Admin selalu memiliki akses penuh ke semua modul.</div>`;
      }

      html += `<div class="grid-2" style="gap:16px; margin-top:8px;">`;
      allMenus.forEach(menu => {
        let mPerm = perms.menus[menu.id] || { view: false, edit: false, del: false };
        if (selectedRoleTab === 'Admin') { mPerm = { view: true, edit: true, del: true, approve: true }; }
        const disabled = selectedRoleTab === 'Admin' ? 'disabled' : '';
        html += `
          <div style="background:var(--input-bg); border:1px solid var(--glass-border); border-radius:var(--radius); padding:16px;">
            <div style="font-weight:700; color:var(--text); margin-bottom:12px; border-bottom:1px solid var(--glass-border); padding-bottom:8px;">${menu.label}</div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
                <span style="color:var(--text2); font-size:14px;">View (Lihat)</span>
                <input type="checkbox" ${disabled} ${mPerm.view ? 'checked' : ''} onchange="updateRolePerm('${selectedRoleTab}', '${menu.id}', 'view', this.checked)">
              </label>
              <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
                <span style="color:var(--text2); font-size:14px;">Edit / Add</span>
                <input type="checkbox" ${disabled} ${mPerm.edit ? 'checked' : ''} onchange="updateRolePerm('${selectedRoleTab}', '${menu.id}', 'edit', this.checked)">
              </label>
              <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
                <span style="color:var(--text2); font-size:14px;">Delete (Hapus)</span>
                <input type="checkbox" ${disabled} ${mPerm.del ? 'checked' : ''} onchange="updateRolePerm('${selectedRoleTab}', '${menu.id}', 'del', this.checked)">
              </label>
              ${menu.id === 'riwayat' ? `
              <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; margin-top:4px; padding-top:8px; border-top:1px dashed var(--glass-border);">
                <span style="color:var(--text2); font-size:14px; font-weight:600;">Approve / Validasi</span>
                <input type="checkbox" ${disabled} ${mPerm.approve ? 'checked' : ''} onchange="updateRolePerm('${selectedRoleTab}', '${menu.id}', 'approve', this.checked)">
              </label>` : ''}
            </div>
          </div>
        `;
      });
      html += `</div>`;
      document.getElementById('roleContent').innerHTML = html;
    }

    function updateRoleAnon(role, checked) {
      if (typeof systemConfig.rolePermissions === 'string') { try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { } }
      if (!systemConfig.rolePermissions[role]) systemConfig.rolePermissions[role] = { menus: {}, isAnonymous: false };
      systemConfig.rolePermissions[role].isAnonymous = checked;
    }

    function selectRoleTab(role) {
      selectedRoleTab = role;
      renderRoles();
    }

    function updateRolePerm(role, menuId, permType, checked) {
      if (typeof systemConfig.rolePermissions === 'string') { try { systemConfig.rolePermissions = JSON.parse(systemConfig.rolePermissions); } catch (e) { } }
      if (!systemConfig.rolePermissions || typeof systemConfig.rolePermissions !== 'object') return;
      if (!systemConfig.rolePermissions[role]) systemConfig.rolePermissions[role] = { menus: {}, isAnonymous: false };
      if (!systemConfig.rolePermissions[role].menus[menuId]) systemConfig.rolePermissions[role].menus[menuId] = { view: false, edit: false, del: false, approve: false };
      systemConfig.rolePermissions[role].menus[menuId][permType] = checked;

      localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig)); // AUTO-SAVE to local storage immediately

      if (checked && (permType === 'edit' || permType === 'del' || permType === 'approve')) {
        systemConfig.rolePermissions[role].menus[menuId].view = true;
        renderRoles();
      }
      if (!checked && permType === 'view') {
        systemConfig.rolePermissions[role].menus[menuId].edit = false;
        systemConfig.rolePermissions[role].menus[menuId].del = false;
        systemConfig.rolePermissions[role].menus[menuId].approve = false;
        renderRoles();
      }
    }

    async function saveRolePermissions() {
      localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
      applyRoleAccess();
      const btn = document.getElementById('btnSaveRolePerms');
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Menyimpan...'; }
      try {
        await apiPostWithFallback('saveConfig', { key: 'rolePermissions', value: JSON.stringify(systemConfig.rolePermissions) });
        notify('Hak Akses berhasil disimpan', 'success');
      } catch (err) {
        notify('Gagal menyimpan Hak Akses', 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = 'Simpan Hak Akses'; }
      }
    }

    function handleLogoUpload(event, keyType) {
      const file = event.target.files[0]; if (!file) return; notify('Memproses...', 'info');
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = async function () {
          const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
          const MAX = 150; let w = img.width, h = img.height;
          if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } else { if (h > MAX) { w *= MAX / h; h = MAX; } }
          canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/png', 0.8);
          systemConfig[keyType] = dataUrl; localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig)); applyConfig();
          try { const res = await apiPostWithFallback('saveConfig', { key: keyType, value: dataUrl }); if (res.success) notify(`Logo tersimpan!`, 'success'); else throw new Error(res.message); } catch (err) { notify('Gagal: ' + err.message, 'error'); }
        }
        img.src = e.target.result;
      }
      reader.readAsDataURL(file);
    }

    function handleSignatureUpload(inputEl, previewId, textId, keyType) {
      const file = inputEl.files[0]; if (!file) return; notify('Memproses Tanda Tangan...', 'info');
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = async function () {
          const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
          const MAX = 300; let w = img.width, h = img.height;
          if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } else { if (h > MAX) { w *= MAX / h; h = MAX; } }
          canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/png', 0.8);

          document.getElementById(previewId).src = dataUrl;
          document.getElementById(previewId).style.display = 'block';
          document.getElementById(textId).style.display = 'none';

          systemConfig[keyType] = dataUrl; localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
          try {
            const res = await apiPostWithFallback('saveConfig', { key: keyType, value: dataUrl });
            if (res.success) notify(`Tanda Tangan tersimpan!`, 'success'); else throw new Error(res.message);
          } catch (err) { notify('Gagal: ' + err.message, 'error'); }
        }
        img.src = e.target.result;
      }
      reader.readAsDataURL(file);
    }

    async function handleReceiptPhoto(event, type) {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;
      const MAX_CHARS = 48000;
      let targetArray = type === 'income' ? currentIncPhotos : (type === 'expense' ? currentExpPhotos : (type === 'mutasi' ? currentMutPhotos : currentEditPhotos));
      let targetGridId = type === 'income' ? 'incPhotoGrid' : (type === 'expense' ? 'expPhotoGrid' : (type === 'mutasi' ? 'mutPhotoGrid' : 'editPhotoGrid'));
      let targetUploadBoxId = type === 'income' ? 'incPhotoUploadBox' : (type === 'expense' ? 'expPhotoUploadBox' : (type === 'mutasi' ? 'mutPhotoUploadBox' : 'editPhotoUploadBox'));

      if (targetArray.length + files.length > 3) {
        notify('Maksimal 3 foto per transaksi!', 'error');
        event.target.value = '';
        return;
      }

      setStatus('loading', 'Memproses gambar...');

      for (const file of files) {
        try {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (e) {
              const img = new Image();
              img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let quality = 0.95; let scale = 1.0; let result = ''; let iterations = 0;
                let baseWidth = img.width; let baseHeight = img.height; const MAX_START = 1600;
                if (baseWidth > baseHeight && baseWidth > MAX_START) { baseHeight *= MAX_START / baseWidth; baseWidth = MAX_START; }
                else if (baseHeight > MAX_START) { baseWidth *= MAX_START / baseHeight; baseHeight = MAX_START; }

                do {
                  canvas.width = Math.floor(baseWidth * scale);
                  canvas.height = Math.floor(baseHeight * scale);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  result = canvas.toDataURL('image/jpeg', quality);
                  if (result.length > MAX_CHARS) {
                    quality -= 0.15;
                    if (quality < 0.4) { quality = 0.8; scale *= 0.7; }
                  }
                  iterations++;
                } while (result.length > MAX_CHARS && iterations < 25);

                // Failsafe: if still too large, forcefully reduce it
                while (result.length > MAX_CHARS && scale > 0.1) {
                  scale *= 0.5;
                  canvas.width = Math.floor(baseWidth * scale);
                  canvas.height = Math.floor(baseHeight * scale);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  result = canvas.toDataURL('image/jpeg', 0.6);
                }
                resolve(result);
              };
              img.onerror = () => reject(new Error('Format gambar tidak didukung atau rusak.'));
              img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Gagal membaca file.'));
            reader.readAsDataURL(file);
          });
          targetArray.push(dataUrl);
          renderPhotoPreview(targetArray, targetGridId, targetUploadBoxId, type);
        } catch (err) {
          notify(err.message, 'error');
        }
      }

      updateAppStatus(); // Reset status dot
      event.target.value = '';
    }

    function removePhoto(index, type) {
      let targetArray = type === 'income' ? currentIncPhotos : (type === 'expense' ? currentExpPhotos : (type === 'mutasi' ? currentMutPhotos : currentEditPhotos));
      let targetGridId = type === 'income' ? 'incPhotoGrid' : (type === 'expense' ? 'expPhotoGrid' : 'editPhotoGrid');
      let targetUploadBoxId = type === 'income' ? 'incPhotoUploadBox' : (type === 'expense' ? 'expPhotoUploadBox' : 'editPhotoUploadBox');

      targetArray.splice(index, 1);
      renderPhotoPreview(targetArray, targetGridId, targetUploadBoxId, type);
    }

    function renderPhotoPreview(arr, gridId, boxId, type) {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      Array.from(grid.querySelectorAll('.photo-preview-container')).forEach(el => el.remove());

      arr.forEach((url, i) => {
        const div = document.createElement('div');
        div.className = 'photo-upload-box photo-preview-container';
        div.style.position = 'relative';
        const img = document.createElement('img');
        img.src = url;
        img.className = 'photo-preview';
        img.alt = 'Foto ' + (i + 1);
        const btn = document.createElement('button');
        btn.className = 'remove-photo-btn';
        btn.innerHTML = '×';
        btn.setAttribute('onclick', `removePhoto(${i}, '${type}')`);
        div.appendChild(img);
        div.appendChild(btn);
        grid.insertBefore(div, document.getElementById(boxId));
      });

      const uploadBox = document.getElementById(boxId);
      if (uploadBox) uploadBox.style.display = arr.length >= 3 ? 'none' : 'flex';
    }

    function resetPhotoUpload(type) {
      if (type === 'income') { currentIncPhotos = []; renderPhotoPreview([], 'incPhotoGrid', 'incPhotoUploadBox', 'income'); document.getElementById('incPhotoUpload').value = ''; }
      else if (type === 'expense') { currentExpPhotos = []; renderPhotoPreview([], 'expPhotoGrid', 'expPhotoUploadBox', 'expense'); document.getElementById('expPhotoUpload').value = ''; }
      else if (type === 'mutasi') { currentMutPhotos = []; renderPhotoPreview([], 'mutPhotoGrid', 'mutPhotoUploadBox', 'mutasi'); document.getElementById('mutPhotoUpload').value = ''; }
      else if (type === 'edit') { currentEditPhotos = []; renderPhotoPreview([], 'editPhotoGrid', 'editPhotoUploadBox', 'edit'); document.getElementById('editTransPhoto').value = ''; }
    }

    let modalPhotoList = [];
    let currentPhotoIndex = 0;

    function openPhotoModal(url, url2 = '', url3 = '') {
      modalPhotoList = [url, url2, url3].filter(u => u && u.trim() !== '');
      if (modalPhotoList.length === 0) return;
      currentPhotoIndex = 0;
      updatePhotoModalView();
      document.getElementById('receiptPhotoModal').style.display = 'flex';
    }

    function changePhoto(dir) {
      currentPhotoIndex += dir;
      if (currentPhotoIndex < 0) currentPhotoIndex = modalPhotoList.length - 1;
      if (currentPhotoIndex >= modalPhotoList.length) currentPhotoIndex = 0;
      updatePhotoModalView();
    }

    function updatePhotoModalView() {
      const imgEl = document.getElementById('photoModalImg');
      const prevEl = document.getElementById('prevPhotoBtn');
      const nextEl = document.getElementById('nextPhotoBtn');
      const cntEl = document.getElementById('photoCounter');
      if (imgEl) imgEl.src = modalPhotoList[currentPhotoIndex];
      if (prevEl) prevEl.style.display = modalPhotoList.length > 1 ? 'flex' : 'none';
      if (nextEl) nextEl.style.display = modalPhotoList.length > 1 ? 'flex' : 'none';
      if (cntEl) cntEl.textContent = modalPhotoList.length > 1 ? `Foto ${currentPhotoIndex + 1} dari ${modalPhotoList.length}` : '';
    }

    function closePhotoModal() {
      document.getElementById('receiptPhotoModal').style.display = 'none';
      document.getElementById('photoModalImg').src = '';
    }
    function openPhotoModalById(id, type) {
      let r = null;
      if (type === 'income') {
        r = cachedIncome.find(x => (x.transaction_id || x.receipt_no) === id);
        if (!r && currentReportData && currentReportData.incByCategory) {
          const all = Object.values(currentReportData.incByCategory).flat();
          r = all.find(x => (x.transaction_id || x.receipt_no) === id);
        }
      } else {
        r = cachedExpense.find(x => (x.transaction_id || x.receipt_no) === id);
        if (!r && currentReportData && currentReportData.expByDept) {
          const all = Object.values(currentReportData.expByDept).flat();
          r = all.find(x => (x.transaction_id || x.receipt_no) === id);
        }
      }

      if (!r) {
        const allTrans = [...cachedIncome, ...cachedExpense];
        r = allTrans.find(x => (x.transaction_id || x.receipt_no) === id);
      }

      if (r) {
        openPhotoModal(r.receipt_photo, r.receipt_photo_2, r.receipt_photo_3);
      } else {
        notify('Data foto tidak ditemukan.', 'error');
      }
    }

    function getPhotoBtnIcon(r, isMasked = false) {
      if (isMasked || !r.receipt_photo) return '';
      let k = r.income_type ? 'income' : 'expense';
      let id = r.transaction_id || r.receipt_no;
      let count = 1 + (r.receipt_photo_2 ? 1 : 0) + (r.receipt_photo_3 ? 1 : 0);
      let content = count > 1 ? `<span style="font-size:10px; margin-left:2px; font-weight:bold">${count}</span>` : '';
      return `<button class="btn-icon-only" onclick="openPhotoModalById('${id}', '${k}')" style="margin-left:6px; color:var(--teal-pop);">${safeIcon('image', 'lucide-sm')}${content}</button>`;
    }

    function getPhotoBtnText(r, isMasked = false) {
      if (isMasked || !r.receipt_photo) return '';
      let k = r.income_type ? 'income' : 'expense';
      let id = r.transaction_id || r.receipt_no;
      let count = 1 + (r.receipt_photo_2 ? 1 : 0) + (r.receipt_photo_3 ? 1 : 0);
      let text = count > 1 ? `${safeIcon('image', 'lucide-sm')} <span style="margin-left:4px;">${count} Foto</span>` : `${safeIcon('image', 'lucide-sm')} <span style="margin-left:4px;">Foto</span>`;
      return `<button class="btn" style="flex:1; width:100%; justify-content:center; padding:6px 0; font-size:11px; background:rgba(20,184,166,0.1); color:var(--teal-pop); border:1px solid rgba(20,184,166,0.2);" onclick="openPhotoModalById('${id}', '${k}')">${text}</button>`;
    }


    async function saveSignatureText(key, value) {
      systemConfig[key] = value;
      localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
      try {
        await apiPostWithFallback('saveConfig', { key: key, value: value });
      } catch (err) { }
    }

    async function resetLogo(keyType) { systemConfig[keyType] = ''; localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig)); applyConfig(); try { await apiPostWithFallback('saveConfig', { key: keyType, value: '' }); notify(`Logo direset.`, 'success'); } catch (err) { } }

    let currentUser = null; let masterData = null; let cachedIncome = []; let cachedExpense = []; let cachedSaldo = { daerah: 0, jemaat: 0, bangun: 0, total: 0 }; let isServerOnline = false;
    let pembangunanDataCache = null;
    const PEMBANGUNAN_URL = 'https://script.google.com/macros/s/AKfycbxvNICOilB-oQG3WfI6nrj_kYjG3tGMBZYndE4K3jw_TuvjR7lOMsyyyCyNHTNCKUOOMg/exec';

    async function loadPembangunanData() {
      try {
        const res = await fetch(PEMBANGUNAN_URL + "?t=" + Date.now());
        pembangunanDataCache = await res.json();
      } catch (e) { console.error('Failed to load Pembangunan Data', e); }
    }
    let editingUser = null; let editingUnit = null; let editingIncType = null;

    function getCatBadge(catName, isExpense) { if (!catName) return 'badge-gray'; let seedString = catName + (isExpense ? "_OUT" : "_IN"); let hash1 = 0, hash2 = 0; for (let i = 0; i < seedString.length; i++) { hash1 = (hash1 << 5) - hash1 + seedString.charCodeAt(i); hash2 = seedString.charCodeAt(i) + ((hash2 << 5) - hash2); } let finalHue = Math.abs(hash1) % 360; let finalSat = 65 + (Math.abs(hash2) % 30); let lShift = (Math.abs(hash1 ^ hash2) % 24) - 12; return `badge-dynamic" style="--bh: ${finalHue}; --bs: ${finalSat}%; --bl-off: ${lShift}%;`; }
    function isPrivateCategory(category) { if (!category) return false; const cat = category.toLowerCase(); return ['perpuluhan', 'persepuluhan', 'khusus jemaat', 'khusus daerah', 'terpadu', 'pembangunan'].some(c => cat.includes(c)); }
    function validatePassword(pw) {
      if (pw.length < 8) return 'Minimal 8 karakter';
      if (!/[A-Z]/.test(pw)) return 'Harus ada huruf besar (A-Z)';
      if (!/[a-z]/.test(pw)) return 'Harus ada huruf kecil (a-z)';
      if (!/[0-9]/.test(pw)) return 'Harus ada angka (0-9)';
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pw)) return 'Harus ada simbol (!@#$%^&*...)';
      return null;
    }
    function safeIcon(name, size) { return typeof getIcon === 'function' ? getIcon(name, size) : ''; }
    function togglePassword(inputId, eyeId) { const input = document.getElementById(inputId); const eyeBtn = document.getElementById(eyeId); if (input.type === "password") { input.type = "text"; eyeBtn.innerHTML = safeIcon('eye', 'lucide-md'); } else { input.type = "password"; eyeBtn.innerHTML = safeIcon('eyeOff', 'lucide-md'); } }
    function fmt(n) { return Math.round(n || 0).toLocaleString('id-ID'); }
    function fmtInputDate(iso) { if (!iso) return ''; const d = new Date(iso); if (isNaN(d.getTime())) return String(iso).split('T')[0]; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
    function fmtDate(iso) { if (!iso) return '-'; const d = new Date(iso); if (isNaN(d.getTime())) { const p = String(iso).split('T')[0].split('-'); if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`; return String(iso).split('T')[0]; } return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; }
    function todayStr() { return fmtInputDate(new Date()); }
    function setStatus(state, text) { const dot = document.getElementById('statusDot'); const txt = document.getElementById('statusText'); if (dot && txt) { dot.className = 'status-dot ' + state; txt.textContent = text; } }

    let confirmPromiseResolve = null;
    function showCustomConfirm(title, message) { return new Promise((resolve) => { confirmPromiseResolve = resolve; document.getElementById('confirmTitle').textContent = title; document.getElementById('confirmMessage').textContent = message; document.getElementById('customConfirmModal').style.display = 'flex'; }); }
    document.getElementById('confirmYesBtn').addEventListener('click', () => { document.getElementById('customConfirmModal').style.display = 'none'; if (confirmPromiseResolve) confirmPromiseResolve(true); });
    document.getElementById('confirmNoBtn').addEventListener('click', () => { document.getElementById('customConfirmModal').style.display = 'none'; if (confirmPromiseResolve) confirmPromiseResolve(false); });

    async function saveServerSettings() {
      const newUrl = document.getElementById('customApiUrlInput').value.trim();
      if (newUrl === '') { localStorage.removeItem('BISDAC_api_url'); notify('Menggunakan URL bawaan.', 'success'); }
      else if (!newUrl.startsWith('https://script.google.com/macros/s/')) { notify('URL tidak valid.', 'error'); return; }
      else { localStorage.setItem('BISDAC_api_url', newUrl.endsWith('/') ? newUrl.slice(0, -1) : newUrl); notify('URL diperbarui!', 'success'); }
      await checkAPIConnection(); updateAppStatus();
    }

    async function checkAPIConnection() {
      setStatus('loading', 'Menghubungkan...');
      try {
        const url = getActiveApiUrl(); if (!url || url.trim() === '') { setStatus('offline', 'URL Belum Diset!'); isServerOnline = false; return false; }
        const res = await fetch(`${url}?action=ping&_t=${Date.now()}`, { method: 'GET', redirect: 'follow' }).catch(() => { throw new Error('Jaringan Error'); });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success) { setStatus('online', 'Server Online'); isServerOnline = true; return true; }
        throw new Error(json.message);
      } catch (e) { setStatus('offline', 'Koneksi Gagal'); isServerOnline = false; return false; }
    }

    async function doLogin(autoUser, autoPass) {
      const user = (typeof autoUser === 'string') ? autoUser : document.getElementById('loginUser').value.trim();
      const pass = (typeof autoPass === 'string') ? autoPass : document.getElementById('loginPass').value;
      if (!user || !pass) { notify('Username & Password kosong!', 'error'); return; }
      const btn = document.getElementById('loginBtn'); const txt = document.getElementById('loginBtnText');
      btn.disabled = true; txt.innerHTML = '<span class="btn-spinner"></span> Validasi...';
      try {
        const res = await login(user, pass);
        if (res.success) { currentUser = res.user; notify('Login Berhasil.', 'success'); launchApp(); }
        else { notify(res.message, 'error'); }
      } catch (err) { notify(err.message, 'error'); } finally { btn.disabled = false; txt.textContent = 'Masuk Ke Sistem'; }
    }

    async function launchApp() {
      document.getElementById('loginPage').style.display = 'none'; document.getElementById('app').style.display = 'flex';
      const syncBtn = document.getElementById('floatingSyncBtn');
      if (syncBtn) { syncBtn.classList.remove('bottom-8'); syncBtn.classList.add('bottom-28'); }
      const nameStr = currentUser.nama || currentUser.username || 'User';
      document.getElementById('userNameDisplay').textContent = nameStr;
      document.getElementById('userRoleDisplay').textContent = currentUser.role || 'Unknown';
      document.getElementById('userAvatar').textContent = nameStr.split(' ').filter(x => x).map(x => x[0]).join('').substring(0, 2).toUpperCase();

      applyRoleAccess();
      // Do not block UI! Run in background:
      Promise.all([loadSystemConfig(), syncAllData()]).then(() => {
        initForms();
        
        const urlParams = new URLSearchParams(window.location.search);
        const printId = urlParams.get('print');
        const printType = urlParams.get('type') || 'income';
        const searchQuery = urlParams.get('search');
        
        if (printId) {
            // Aktifkan sensor privasi (strict mode) jika ada parameter print
            const sensorCheckbox = document.getElementById('sensorPemasukan');
            if (sensorCheckbox) {
                sensorCheckbox.checked = true;
                applyReportSensor();
            }
            printTransaction(printType, printId);
        } else if (searchQuery) {
            // Isi input Cek Transaksi dan jalankan pencarian otomatis
            const searchInput = document.getElementById('searchReceiptInput');
            if (searchInput) {
                searchInput.value = searchQuery;
                searchByReceipt();
                // Scroll ke area pencarian
                const dashSearchCard = document.getElementById('dashSearchCard');
                if (dashSearchCard) dashSearchCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            const currentPage = document.querySelector('.page.active')?.id.replace('page-', '') || 'dashboard';
            if (currentPage === 'dashboard') renderDashboard();
        }
      }).catch(e => console.error(e));

      initForms(); // Run once immediately with cached data
      showPage('dashboard');
    }

    function getRolePerms(role) {
      let perms = { menus: {}, isAnonymous: false };
      if (systemConfig.rolePermissions && systemConfig.rolePermissions[role]) {
        perms = systemConfig.rolePermissions[role];
        if (!perms.menus.pindahbuku) {
          if (role === 'Admin' || role === 'Bendahara') {
            perms.menus.pindahbuku = { view: true, edit: true, del: true };
          } else {
            perms.menus.pindahbuku = { view: false, edit: false, del: false };
          }
        }
        if (!perms.menus.series) {
          if (role === 'Admin' || role === 'Bendahara') {
            perms.menus.series = { view: true, edit: true, del: true };
          } else {
            perms.menus.series = { view: false, edit: false, del: false };
          }
        }
      } else if (role === 'Admin') {
        perms = { menus: { dashboard: { view: true, edit: true, del: true }, pemasukan: { view: true, edit: true, del: true }, pengeluaran: { view: true, edit: true, del: true }, pindahbuku: { view: true, edit: true, del: true }, laporan: { view: true, edit: true, del: true }, riwayat: { view: true, edit: true, del: true }, masterData: { view: true, edit: true, del: true }, users: { view: true, edit: true, del: true }, akun: { view: true, edit: true, del: true }, settings: { view: true, edit: true, del: true }, series: { view: true, edit: true, del: true }, logs: { view: true, edit: true, del: true } }, isAnonymous: false };
      } else if (role === 'Bendahara') {
        perms = { menus: { dashboard: { view: true, edit: true, del: true }, pemasukan: { view: true, edit: true, del: true }, pengeluaran: { view: true, edit: true, del: true }, pindahbuku: { view: true, edit: true, del: true }, laporan: { view: true, edit: true, del: true }, riwayat: { view: true, edit: true, del: true }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, series: { view: true, edit: true, del: true }, logs: { view: false, edit: false, del: false } }, isAnonymous: false };
      } else if (role === 'Viewer') {
        perms = { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false } }, isAnonymous: false };
      } else if (role === 'Ketua Jemaat' || role === 'Pendeta') {
        perms = { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: true, edit: false, del: false }, riwayat: { view: true, edit: false, del: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false } }, isAnonymous: false };
      } else if (role === 'Publik') {
        perms = { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: false, edit: false, del: false }, pengeluaran: { view: false, edit: false, del: false }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: false, edit: false, del: false }, riwayat: { view: true, edit: false, del: false }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: false, edit: false, del: false }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false } }, isAnonymous: true };
      } else if (role === 'Operator') {
        perms = { menus: { dashboard: { view: true, edit: false, del: false }, pemasukan: { view: true, edit: true, del: true }, pengeluaran: { view: true, edit: true, del: true }, pindahbuku: { view: false, edit: false, del: false }, laporan: { view: false, edit: false, del: false }, riwayat: { view: true, edit: true, del: true }, masterData: { view: false, edit: false, del: false }, users: { view: false, edit: false, del: false }, akun: { view: true, edit: true, del: true }, settings: { view: false, edit: false, del: false }, logs: { view: false, edit: false, del: false } }, isAnonymous: false };
      }

      // Strict enforcement
      if (role === 'Publik') {
        perms.isAnonymous = true;
      }
      return perms;
    }

    function applyRoleAccess() {
      const perms = getRolePerms(currentUser.role);

      const mPemasukan = perms.menus.pemasukan || { view: false, edit: false, del: false };
      document.getElementById('navPemasukan').style.display = mPemasukan.view ? '' : 'none';
      if (document.getElementById('botPemasukan')) document.getElementById('botPemasukan').style.display = mPemasukan.view ? 'flex' : 'none';

      const mPengeluaran = perms.menus.pengeluaran || { view: false, edit: false, del: false };
      document.getElementById('navPengeluaran').style.display = mPengeluaran.view ? '' : 'none';
      if (document.getElementById('botPengeluaran')) document.getElementById('botPengeluaran').style.display = mPengeluaran.view ? 'flex' : 'none';

      const mPindahBuku = perms.menus.pindahbuku || { view: false, edit: false, del: false };
      if (document.getElementById('navPindahBuku')) document.getElementById('navPindahBuku').style.display = mPindahBuku.view ? '' : 'none';

      const mLaporan = perms.menus.laporan || { view: false, edit: false, del: false };
      if (document.getElementById('navLaporan')) document.getElementById('navLaporan').style.display = mLaporan.view ? '' : 'none';
      if (document.getElementById('botLaporan')) document.getElementById('botLaporan').style.display = mLaporan.view ? 'flex' : 'none';

      const mRiwayat = perms.menus.riwayat || { view: false, edit: false, del: false };
      document.getElementById('navRiwayat').style.display = mRiwayat.view ? '' : 'none';

      const btnJurnal = document.getElementById('btnJurnalDashboard'); if (btnJurnal) btnJurnal.style.display = (mPemasukan.edit || mPengeluaran.edit) ? '' : 'none';
      const recentTransCard = document.getElementById('recentTransCard'); if (recentTransCard) recentTransCard.style.display = mRiwayat.view ? '' : 'none';
      const btnPrint = document.getElementById('btnPrintReport'); if (btnPrint) btnPrint.style.display = '';

      const mMaster = perms.menus.masterData || { view: false, edit: false, del: false };
      document.getElementById('navMasterIncType').style.display = mMaster.view ? '' : 'none';
      document.getElementById('navMasterDept').style.display = mMaster.view ? '' : 'none';
      document.getElementById('navMasterUnit').style.display = mMaster.view ? '' : 'none';

      const mUsers = perms.menus.users || { view: false, edit: false, del: false };
      document.getElementById('navUsers').style.display = mUsers.view ? '' : 'none';

      const mSettings = perms.menus.settings || { view: false, edit: false, del: false };
      document.getElementById('navSettings').style.display = mSettings.view ? '' : 'none';
      document.getElementById('navRoles').style.display = mSettings.view ? '' : 'none';

      const mAkun = perms.menus.akun || { view: false, edit: false, del: false };
      document.getElementById('navAkun').style.display = mAkun.view ? '' : 'none';

      const mSeries = perms.menus.series || { view: false, edit: false, del: false };
      if (document.getElementById('navSeries')) document.getElementById('navSeries').style.display = mSeries.view ? '' : 'none';

      const mLogs = perms.menus.logs || { view: false, edit: false, del: false };
      if (document.getElementById('navLogs')) document.getElementById('navLogs').style.display = mLogs.view ? '' : 'none';

      const showAdminGroup = mMaster.view || mUsers.view || mSettings.view || mLogs.view || mSeries.view;
      document.getElementById('adminNavLabel').style.display = showAdminGroup ? '' : 'none';

      const sensorContainer = document.getElementById('reportSensorContainer');
      if (sensorContainer) sensorContainer.style.display = perms.menus.laporan?.view ? 'flex' : 'none';

      // Auto-enable Unit Filter for Operators
      const userUnits = getUserUnits();
      if (currentUser && currentUser.role === 'Operator' && userUnits.length > 0) {
        myUnitFilterActive = true;
        const btnToggle = document.getElementById('btnToggleMyUnit');
        if (btnToggle) {
          btnToggle.classList.add('active');
          btnToggle.innerHTML = safeIcon('filter', 'lucide-sm') + ' Hanya Unit Saya';
        }
      }

      if (!mPemasukan.edit) { document.querySelectorAll('.btn-save-pemasukan').forEach(el => el.style.display = 'none'); }
      if (!mPengeluaran.edit) { document.querySelectorAll('.btn-save-pengeluaran').forEach(el => el.style.display = 'none'); }

      const btnLogoutText = document.getElementById('btnLogoutText');
      const btnLogoutIcon = document.getElementById('btnLogoutIcon');
      const topbarHamburger = document.getElementById('topbarHamburger');
      const btnHeaderLogin = document.getElementById('btnHeaderLogin');
      const btnHeaderHomeIcon = document.getElementById('btnHeaderHomeIcon');
      const sidebar = document.getElementById('sidebar');
      const mainArea = document.querySelector('.main');
      const botSidebarMenu = document.getElementById('botSidebarMenu');

      if (currentUser.role === 'Publik') {
        if (btnLogoutText) btnLogoutText.textContent = 'Home / Login';
        if (btnLogoutIcon) btnLogoutIcon.innerHTML = '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>';
        if (topbarHamburger) topbarHamburger.style.display = 'none';
        if (btnHeaderLogin) btnHeaderLogin.style.display = 'inline-flex';
        if (btnHeaderHomeIcon) btnHeaderHomeIcon.style.display = 'inline-flex';
        if (sidebar) sidebar.style.display = 'none';
        if (mainArea) mainArea.style.marginLeft = '0px';
        if (botSidebarMenu) botSidebarMenu.style.display = 'none';
      } else {
        if (btnLogoutText) btnLogoutText.textContent = 'Keluar';
        if (btnLogoutIcon) btnLogoutIcon.innerHTML = '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />';
        if (topbarHamburger) topbarHamburger.style.display = '';
        if (btnHeaderLogin) btnHeaderLogin.style.display = 'none';
        if (btnHeaderHomeIcon) btnHeaderHomeIcon.style.display = 'inline-flex';
        if (sidebar) sidebar.style.display = '';
        if (mainArea) mainArea.style.marginLeft = '';
        if (botSidebarMenu) botSidebarMenu.style.display = '';
      }
    }

    let myUnitFilterActive = false;
    function toggleMyUnitFilter() {
      myUnitFilterActive = !myUnitFilterActive;
      const btn = document.getElementById('btnFilterMyUnit');
      if (!btn) return;
      if (myUnitFilterActive) {
        btn.style.background = 'var(--accent-blue)';
        btn.style.color = 'white';
        btn.innerHTML = 'Hapus Filter Unit Saya';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = 'var(--accent-blue)';
        btn.innerHTML = 'Transaksi Unit Saya';
      }
      renderHistory();
    }

    function goToMyUnitHistory() {
      myUnitFilterActive = true;
      const btn = document.getElementById('btnFilterMyUnit');
      if (btn) {
        btn.style.background = 'var(--accent-blue)';
        btn.style.color = 'white';
        btn.innerHTML = 'Hapus Filter Unit Saya';
      }
      showPage('riwayat');
      renderHistory();
    }

    function updateLastReceipts() {
      const lblInc = document.getElementById('lastIncReceipt');
      if (lblInc) {
        if (cachedIncome && cachedIncome.length > 0) {
          const sortedInc = [...cachedIncome].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
          lblInc.innerHTML = `No. Kuitansi Terakhir: <strong style="color:var(--text)">${sortedInc[0].receipt_no}</strong>`;
        } else {
          lblInc.textContent = 'Belum ada transaksi';
        }
      }
      const lblExp = document.getElementById('lastExpReceipt');
      if (lblExp) {
        if (cachedExpense && cachedExpense.length > 0) {
          const sortedExp = [...cachedExpense].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
          lblExp.innerHTML = `No. Bukti Terakhir: <strong style="color:var(--text)">${sortedExp[0].receipt_no}</strong>`;
        } else {
          lblExp.textContent = 'Belum ada transaksi';
        }
      }
    }

    async function syncAllData() {
      try {
        await Promise.all([loadMasterData(), loadAllTransactions(), loadPembangunanData()]);
        updateAppStatus();
        if (masterData) renderDashboard();
        updateLastReceipts();
      } catch (e) {
        notify('Sinkronisasi gagal: ' + e.message, 'error');
      }
    }

    async function handleManualSync() {
      const statusTxt = document.getElementById('appStatusText'); const statusDot = document.getElementById('appStatusDot');
      const floatBtn = document.getElementById('floatingSyncBtn');
      const floatIcon = document.getElementById('floatingSyncIcon');
      if (floatBtn) { floatBtn.disabled = true; }
      const btn = document.getElementById('btnForceSync');
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Sync...'; }
      if (floatIcon) { floatIcon.innerHTML = `<i class="fa-solid fa-rotate fa-spin text-amber-500 text-xl md:text-lg"></i>`; }
      if (statusTxt) statusTxt.textContent = 'Sync...'; if (statusDot) statusDot.className = 'status-dot loading';
      await checkAPIConnection(); await syncAllData();
      if (floatBtn) { floatBtn.disabled = false; }
      if (floatIcon) { floatIcon.innerHTML = '<span class="absolute w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span><span class="absolute w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-75"></span>'; }
      if (btn) { btn.disabled = false; btn.innerHTML = safeIcon('refresh', 'lucide-sm') + ' Sinkronisasi'; }
      notify('Data tersinkron!', 'success');
    }

    async function loadMasterData() { const res = await apiGet('getMasterData'); if (res.success) masterData = res.data; }
    function initForms() {
      if (!masterData) return;
      document.getElementById('incDate').value = todayStr(); document.getElementById('expDate').value = todayStr();
      const incSel = document.getElementById('incType');
      const perpuluhanGroup = ['Perpuluhan', 'Terpadu', 'Khusus Jemaat', 'Khusus Daerah']; const excludeList = ['Persembahan Khusus', ...perpuluhanGroup];
      let parentOptions = '<option value="">-- Kategori --</option><option value="Perpuluhan">Grup Perpuluhan (Otomatis)</option>';
      (masterData.incomeTypes || []).forEach(x => { if (!excludeList.includes(x.name)) { parentOptions += `<option value="${x.name}">${x.name}</option>`; } });
      incSel.innerHTML = parentOptions;
      document.getElementById('incUnit').innerHTML = '<option value="">-- Tanpa Unit --</option>' + (masterData.units || []).map(x => `<option value="${x.name}">${x.name}</option>`).join('');
      const userUnitContainer = document.getElementById('userUnitContainer');
      if (userUnitContainer) {
        userUnitContainer.innerHTML = (masterData.units || []).map(x => `
          <label class="unit-check-wrapper">
            <input type="checkbox" class="userUnitCheck" value="${x.name}">
            <div class="unit-check-box">${x.name}</div>
          </label>
        `).join('');
      }
      document.getElementById('expDept').innerHTML = '<option value="">-- Departemen --</option>' + (masterData.departments || []).map(x => `<option value="${x.name}">${x.name}</option>`).join('');
      const givers = new Set(); (cachedIncome || []).forEach(x => { if (x.nama_pemberi && x.nama_pemberi !== '-' && x.nama_pemberi !== 'Umum') givers.add(x.nama_pemberi); });
      const giverList = document.getElementById('giverList'); if (giverList) giverList.innerHTML = Array.from(givers).map(g => `<option value="${g}">`).join('');

      const receivers = new Set(); (cachedExpense || []).forEach(x => { if (x.nama_penerima && x.nama_penerima !== '-' && x.nama_penerima !== 'Umum') receivers.add(x.nama_penerima); });
      const receiverList = document.getElementById('receiverList'); if (receiverList) receiverList.innerHTML = Array.from(receivers).map(r => `<option value="${r}">`).join('');
    }

    function handleTypeChange() {
      const type = document.getElementById('incType').value; const singleGrp = document.getElementById('incAmountSingleGroup'); const perpGrp = document.getElementById('incPerpuluhanGroup');
      if (singleGrp && perpGrp) { if (type === 'Perpuluhan') { singleGrp.style.display = 'none'; perpGrp.style.display = 'block'; } else { singleGrp.style.display = 'block'; perpGrp.style.display = 'none'; } }
      updateIncomeAlloc();
    }

    async function loadAllTransactions() {
      try {
        const [inc, exp, bal] = await Promise.all([apiGet('getIncomeList'), apiGet('getExpenseList'), apiGet('getBalances')]);
        cachedIncome = Array.isArray(inc.data) ? inc.data : [];
        cachedExpense = Array.isArray(exp.data) ? exp.data : [];
        if (bal && bal.data) cachedSaldo = bal.data;

        if (currentUser && currentUser.role !== 'Admin') {
          const cUsername = (currentUser.username || '').toLowerCase().trim();
          const cNama = (currentUser.nama || '').toLowerCase().trim();
          const isPublik = currentUser.role === 'Publik';

          const uUnits = getUserUnits(cUsername).map(u => String(u).toLowerCase().trim());

          const hidePhoto = (x) => {
            if (isPublik) return true;

            const pInputBy = String(x.input_by || '').toLowerCase().trim();
            const pInputter = String(x.inputter || '').toLowerCase().trim();
            const pUser = String(x.username || '').toLowerCase().trim();
            const pPemberi = String(x.nama_pemberi || '').toLowerCase().trim();
            const pPenerima = String(x.nama_penerima || '').toLowerCase().trim();
            const pUnit = String(x.unit_name || '').toLowerCase().trim();

            // Check direct ownership
            if (cUsername && (pInputBy === cUsername || pInputter === cUsername || pUser === cUsername)) return false;
            if (cNama && (pPemberi.includes(cNama) || pPenerima.includes(cNama))) return false;

            const rPerms = getRolePerms(currentUser.role);
            const isApprover = rPerms && rPerms.menus && rPerms.menus.riwayat && rPerms.menus.riwayat.approve;
            if (isApprover || currentUser.role === 'Pendeta' || currentUser.role === 'Ketua Jemaat') return false;

            if (uUnits.length > 0) {
              const matchUnit = uUnits.some(u => pUnit === u || pUnit.includes(u));
              if (matchUnit) return false;
            } else {
              // No units assigned. Operator or Bendahara (Pusat) see everything
              if (currentUser.role === 'Operator' || currentUser.role === 'Bendahara') return false;
            }

            let hasMembers = false;
            if (masterData && masterData.units) {
              const uData = masterData.units.find(u => String(u.name).toLowerCase() === pUnit);
              if (uData && parseInt(uData.jumlah_anggota || 0) > 0) hasMembers = true;
            }
            const isExpense = x.type === 'expense';
            const incType = String(x.income_type || '').toLowerCase();
            const isTransparentInc = x.type === 'income' && (incType.includes('sabat') || incType.includes('rabu malam') || incType.includes('pembangunan')) && !hasMembers;

            if (isExpense || isTransparentInc) return false;

            return true;
          };

          cachedIncome.forEach(x => { if (hidePhoto(x)) x.receipt_photo = ''; });
          cachedExpense.forEach(x => { if (hidePhoto(x)) x.receipt_photo = ''; });
        }
        calculateExtendedBalances();
        updateGlobalApprovalBadge();
      } catch (e) { }
    }

    function calculateExtendedBalances() {
      let calcDaerah = cachedSaldo.initDaerah || 0; let calcJemaat = cachedSaldo.initJemaat || 0; let calcBangun = cachedSaldo.initBangun || 0;
      let bankDaerah = calcDaerah; let bankJemaat = calcJemaat; let bankBangun = calcBangun;
      let tanganDaerah = 0; let tanganJemaat = 0; let tanganBangun = 0;

      (cachedIncome || []).forEach(i => {
        calcDaerah += (i.alloc_daerah || 0); calcJemaat += (i.alloc_jemaat || 0); calcBangun += (i.alloc_bangun || 0);
        const isCashInc = (i.note || '').includes('[CASH]');
        if (isCashInc) {
          tanganDaerah += (i.alloc_daerah || 0); tanganJemaat += (i.alloc_jemaat || 0); tanganBangun += (i.alloc_bangun || 0);
        } else {
          bankDaerah += (i.alloc_daerah || 0); bankJemaat += (i.alloc_jemaat || 0); bankBangun += (i.alloc_bangun || 0);
        }
      });

      (cachedExpense || []).forEach(e => {
        const isMutasi = e.department === 'Mutasi Kas / Setor Bank';
        let srcBase = e.source_balance;

        // Normalize any explicit labels that were accidentally saved
        if (srcBase === 'Kas Daerah (Bank)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [BANK]'; }
        if (srcBase === 'Kas Daerah (Di Tangan)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [CASH]'; }
        if (srcBase === 'Kas Jemaat (Bank)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [BANK]'; }
        if (srcBase === 'Kas Jemaat (Di Tangan)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [CASH]'; }
        if (srcBase === 'Kas Pembangunan (Bank)') { srcBase = 'Pembangunan'; e.note = (e.note || '') + ' [BANK]'; }
        if (srcBase === 'Kas Pembangunan (Di Tangan)') { srcBase = 'Pembangunan'; e.note = (e.note || '') + ' [CASH]'; }

        const isCashExp = (e.note || '').includes('[CASH]');

        if (srcBase === 'Daerah') {
          if (!isMutasi) {
            calcDaerah -= e.amount;
            if (isCashExp) tanganDaerah -= e.amount; else bankDaerah -= e.amount;
          } else { tanganDaerah -= e.amount; bankDaerah += e.amount; }
        }
        else if (srcBase === 'Kas Jemaat') {
          if (!isMutasi) {
            calcJemaat -= e.amount;
            if (isCashExp) tanganJemaat -= e.amount; else bankJemaat -= e.amount;
          } else { tanganJemaat -= e.amount; bankJemaat += e.amount; }
        }
        else if (srcBase === 'Pembangunan') {
          if (!isMutasi) {
            calcBangun -= e.amount;
            if (isCashExp) tanganBangun -= e.amount; else bankBangun -= e.amount;
          } else { tanganBangun -= e.amount; bankBangun += e.amount; }
        }
      });

      cachedSaldo.daerah = calcDaerah;
      cachedSaldo.jemaat = calcJemaat;
      cachedSaldo.bangun = calcBangun;
      cachedSaldo.bankDaerah = bankDaerah;
      cachedSaldo.bankJemaat = bankJemaat;
      cachedSaldo.bankBangun = bankBangun;
      cachedSaldo.tanganDaerah = tanganDaerah;
      cachedSaldo.tanganJemaat = tanganJemaat;
      cachedSaldo.tanganBangun = tanganBangun;
    }

    function updateGlobalApprovalBadge() {
      const badge = document.getElementById('navRiwayatBadge');
      if (!badge) return;

      const rolePerms = currentUser ? getRolePerms(currentUser.role) : null;
      const canApprove = rolePerms && rolePerms.menus && rolePerms.menus.riwayat && rolePerms.menus.riwayat.approve;
      const isApprover = currentUser && (canApprove || currentUser.role === 'Admin');
      const roleNeeded = currentUser ? currentUser.role : '';

      if (!isApprover && currentUser.role !== 'Bendahara') {
        badge.style.display = 'none';
        return;
      }

      let list = [...(cachedIncome || []), ...(cachedExpense || [])];
      let pendingCount = list.filter(x => {
        const deleteId = x.transaction_id || x.receipt_no || '';
        if (!deleteId) return false;
        if (x.department === 'Mutasi Kas / Setor Bank' || x.income_type === 'Mutasi Kas / Setor Bank') return false;
        const isFullyApproved = x.approved_by && (x.approved_by.includes('Admin') || (x.approved_by.includes('Ketua Jemaat') && x.approved_by.includes('Pendeta')));
        if (isFullyApproved) return false;
        if (!x.approved_by || !x.approved_by.includes(roleNeeded)) return true;
        return false;
      }).length;

      if (pendingCount > 0) {
        badge.innerText = pendingCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    function searchByReceipt() {
      const q = document.getElementById('searchReceiptInput').value.trim().toLowerCase(); const resultDiv = document.getElementById('receiptSearchResult');
      const perms = getRolePerms(currentUser.role);
      const isViewer = perms.isAnonymous;
      if (!q) { resultDiv.style.display = 'none'; return; }

      let validUnitNames = [];
      if (masterData && masterData.units) {
        validUnitNames = masterData.units
          .filter(u => String(u.id || '').toLowerCase() === q || String(u.id || '').toLowerCase().includes(q))
          .map(u => String(u.name).toLowerCase());
      }

      const foundIncomes = cachedIncome.filter(x =>
        String(x.receipt_no || '').toLowerCase().includes(q) ||
        validUnitNames.includes(String(x.unit_name || '').toLowerCase())
      ).map(x => ({ ...x, isInc: true }));

      const foundExpenses = cachedExpense.filter(x =>
        String(x.receipt_no || '').toLowerCase().includes(q)
      ).map(x => ({ ...x, isInc: false }));

      const allFound = [...foundIncomes, ...foundExpenses]; allFound.sort((a, b) => new Date(b.date) - new Date(a.date));
      window.currentHistoryData = allFound.map(x => ({ ...x, type: x.isInc ? 'income' : 'expense' }));
      resultDiv.style.display = 'block';

      if (allFound.length > 0) {
        let html = '<div style="max-height: 380px; overflow-y: auto; padding-right: 6px;">';

        const isUnitSearch = validUnitNames.length > 0;
        if (isUnitSearch && foundIncomes.length > 0) {
          const monthlySum = {};
          const ketSum = {};
          let totalIncSearch = 0;
          foundIncomes.forEach(inc => {
            const d = new Date(inc.date);
            const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlySum[k] = (monthlySum[k] || 0) + inc.amount;

            const ket = inc.income_type || '-';
            ketSum[ket] = (ketSum[ket] || 0) + inc.amount;

            totalIncSearch += inc.amount;
          });

          html += `<div style="background:var(--badge-gray-bg); border:1px solid var(--glass-border); padding:16px; border-radius:var(--radius); margin-bottom:16px;">
        <div style="font-size:12px; color:var(--text3); margin-bottom:12px; font-weight:700; text-transform:uppercase;">Akumulasi Pemasukan Unit</div>
        <button class="btn btn-primary" style="width:100%; justify-content:center; padding:10px; margin-bottom:16px; font-size:13px;" onclick="printUnitReport('${q}')">${safeIcon('printer', 'lucide-sm')} Cetak PDF Laporan Unit Ini</button>`;

          html += `<div style="margin-bottom:8px;"><strong style="font-size:11px; color:var(--text3);">Berdasarkan Bulan</strong></div>`;
          Object.keys(monthlySum).sort((a, b) => b.localeCompare(a)).forEach(k => {
            const [y, m] = k.split('-');
            const mNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            html += `<div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px; border-bottom:1px solid var(--glass-border); padding-bottom:6px;">
          <span style="color:var(--text2)">${mNames[parseInt(m)]} ${y}</span><strong class="amount-pos">+${fmt(monthlySum[k])}</strong>
        </div>`;
          });

          html += `<div style="margin-bottom:8px; margin-top:12px;"><strong style="font-size:11px; color:var(--text3);">Berdasarkan Keterangan</strong></div>`;
          Object.keys(ketSum).sort((a, b) => ketSum[b] - ketSum[a]).forEach(ket => {
            html += `<div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px; border-bottom:1px solid var(--glass-border); padding-bottom:6px;">
          <span style="color:var(--text2)">${ket}</span><strong class="amount-pos">+${fmt(ketSum[ket])}</strong>
        </div>`;
          });

          html += `<div style="display:flex; justify-content:space-between; font-size:14px; margin-top:12px; padding-top:4px;">
          <strong style="color:var(--text)">TOTAL KESELURUHAN</strong><strong class="amount-pos">+${fmt(totalIncSearch)}</strong>
        </div></div>`;
        }

        allFound.slice(0, 100).forEach(found => {
          const isPrivCategory = isViewer && found.isInc && isPrivateCategory(found.income_type);
          const displayPihak = found.isInc
            ? (isPrivCategory ? '*** (Privasi)' : (found.unit_name && found.unit_name !== '-' ? found.unit_name : (found.nama_pemberi || '-')))
            : (found.nama_penerima || '-');
          const displayNote = isPrivCategory ? '*** (Privasi)' : (found.note || '-');

          let photoBtn = '';
          photoBtn = getPhotoBtnText(found);

          html += `
        <div style="padding: 16px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--empty-bg); margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="badge badge-gray">${found.receipt_no}</span>
            <span class="badge ${found.isInc ? 'badge-green' : 'badge-red'}">${found.isInc ? 'Pemasukan' : 'Pengeluaran'}</span>
          </div>
          <div style="font-size: 13px; color: var(--text2); margin-bottom: 4px;">Tgl: <strong style="color: var(--text)">${fmtDate(found.date)}</strong></div>
          <div style="font-size: 13px; color: var(--text2); margin-bottom: 4px;">Pihak: <strong style="color: var(--text)">${displayPihak}</strong></div>
          <div style="font-size: 13px; color: var(--text2); margin-bottom: 8px;">Ket: <strong style="color: var(--text)">${found.isInc ? found.income_type : found.department}</strong><br><span style="font-size:12px; color:var(--text4)">${displayNote}</span></div>
          <div class="${found.isInc ? 'amount-pos' : 'amount-neg'}" style="font-size: 22px; font-weight: 800; letter-spacing:-0.5px;">${found.isInc ? '+' : '-'}${fmt(found.amount)}</div>
          ${photoBtn}
        </div>`;
        });
        if (allFound.length > 100) html += `<div style="text-align:center; font-size:12px; color:var(--text4); margin-top:8px;">Dan ${allFound.length - 100} transaksi lainnya...</div>`;
        html += '</div>'; resultDiv.innerHTML = html;
      } else { resultDiv.innerHTML = `<div class="empty-state">Data tidak ditemukan.</div>`; }
    }

    function groupTransactions(arr) {
      const grouped = [];
      const map = {};
      arr.forEach(x => {
        if (x.receipt_no && x.receipt_no !== '-' && x.receipt_no !== 'SALDO_AWAL') {
          if (!map[x.receipt_no]) {
            map[x.receipt_no] = { ...x, amount: 0, _items: [] };
            grouped.push(map[x.receipt_no]);
          }
          map[x.receipt_no].amount += parseFloat(x.amount);
          map[x.receipt_no]._items.push(x.income_type || x.department || 'Item');
        } else {
          grouped.push(x);
        }
      });
      grouped.forEach(x => {
        if (x._items && x._items.length > 1) {
          const lbl = `Kolektif (${x._items.length} item)`;
          if (x.type === 'income' || x.kind === 'income' || x.isInc || x.income_type) x.income_type = lbl;
          if (x.type === 'expense' || x.kind === 'expense' || x.department) x.department = lbl;
        }
      });
      return grouped;
    }

    function renderDashboard() {
      const userUnits = getUserUnits();
      if (userUnits.length > 0) {
        if (document.getElementById('dashSearchCard')) document.getElementById('dashSearchCard').style.display = 'none';
        if (document.getElementById('dashUnitToggleContainer')) document.getElementById('dashUnitToggleContainer').style.display = 'block';
        if (document.getElementById('riwayatGlobalSearch')) document.getElementById('riwayatGlobalSearch').style.display = 'none';
        if (document.getElementById('btnFilterMyUnit')) document.getElementById('btnFilterMyUnit').style.display = 'inline-flex';
        document.getElementById('dashUnitToggleContainer').innerHTML = `<button class="btn btn-primary" onclick="goToMyUnitHistory()" style="white-space:normal;">Lihat Transaksi Unit Saya (${userUnits.join(', ')})</button>`;
      } else {
        if (document.getElementById('dashSearchCard')) document.getElementById('dashSearchCard').style.display = 'block';
        if (document.getElementById('dashUnitToggleContainer')) document.getElementById('dashUnitToggleContainer').style.display = 'none';
        if (document.getElementById('riwayatGlobalSearch')) document.getElementById('riwayatGlobalSearch').style.display = 'flex';
        if (document.getElementById('btnFilterMyUnit')) document.getElementById('btnFilterMyUnit').style.display = 'none';
      }

      if (!cachedSaldo) return;
      const month = parseInt(document.getElementById('dashMonth').value); const year = parseInt(document.getElementById('dashYear').value);
      const perms = getRolePerms(currentUser ? currentUser.role : '');
      const isViewer = perms.isAnonymous;
      let targetDateEnd = month === 0 ? new Date(year, 11, 31, 23, 59, 59) : new Date(year, month, 0, 23, 59, 59);

      const filteredInc = (cachedIncome || []).filter(x => { const d = new Date(x.date); return d.getFullYear() === year && (month === 0 || d.getMonth() + 1 === month); });
      const filteredExp = (cachedExpense || []).filter(x => { const d = new Date(x.date); return d.getFullYear() === year && (month === 0 || d.getMonth() + 1 === month); });
      const historicalInc = (cachedIncome || []).filter(x => new Date(x.date) <= targetDateEnd);
      const historicalExp = (cachedExpense || []).filter(x => new Date(x.date) <= targetDateEnd);

      let calcDaerah = cachedSaldo.initDaerah || 0; let calcJemaat = cachedSaldo.initJemaat || 0; let calcBangun = cachedSaldo.initBangun || 0;
      let bankDaerah = calcDaerah; let bankJemaat = calcJemaat; let bankBangun = calcBangun;
      let tanganDaerah = 0; let tanganJemaat = 0; let tanganBangun = 0;

      historicalInc.forEach(i => {
        calcDaerah += (i.alloc_daerah || 0); calcJemaat += (i.alloc_jemaat || 0); calcBangun += (i.alloc_bangun || 0);
        const isCashInc = (i.note || '').includes('[CASH]');
        if (isCashInc) {
          tanganDaerah += (i.alloc_daerah || 0); tanganJemaat += (i.alloc_jemaat || 0); tanganBangun += (i.alloc_bangun || 0);
        } else {
          bankDaerah += (i.alloc_daerah || 0); bankJemaat += (i.alloc_jemaat || 0); bankBangun += (i.alloc_bangun || 0);
        }
      });
      historicalExp.forEach(e => {
        const isMutasi = e.department === 'Mutasi Kas / Setor Bank';
        let srcBase = e.source_balance;

        // Normalize any explicit labels
        if (srcBase === 'Kas Daerah (Bank)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [BANK]'; }
        if (srcBase === 'Kas Daerah (Di Tangan)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [CASH]'; }
        if (srcBase === 'Kas Jemaat (Bank)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [BANK]'; }
        if (srcBase === 'Kas Jemaat (Di Tangan)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [CASH]'; }
        if (srcBase === 'Kas Pembangunan (Bank)') { srcBase = 'Pembangunan'; e.note = (e.note || '') + ' [BANK]'; }
        if (srcBase === 'Kas Pembangunan (Di Tangan)') { srcBase = 'Pembangunan'; e.note = (e.note || '') + ' [CASH]'; }

        const isCashExp = (e.note || '').includes('[CASH]');

        if (srcBase === 'Daerah') {
          if (!isMutasi) {
            calcDaerah -= e.amount;
            if (isCashExp) tanganDaerah -= e.amount; else bankDaerah -= e.amount;
          } else { tanganDaerah -= e.amount; bankDaerah += e.amount; }
        }
        else if (srcBase === 'Kas Jemaat') {
          if (!isMutasi) {
            calcJemaat -= e.amount;
            if (isCashExp) tanganJemaat -= e.amount; else bankJemaat -= e.amount;
          } else { tanganJemaat -= e.amount; bankJemaat += e.amount; }
        }
        else if (srcBase === 'Pembangunan') {
          if (!isMutasi) {
            calcBangun -= e.amount;
            if (isCashExp) tanganBangun -= e.amount; else bankBangun -= e.amount;
          } else { tanganBangun -= e.amount; bankBangun += e.amount; }
        }
      });

      const calcTotal = calcDaerah + calcJemaat + calcBangun; const saldoAccrued = calcTotal - calcDaerah;
      const totalIn = filteredInc.reduce((s, x) => s + x.amount, 0); const totalOut = filteredExp.reduce((s, x) => s + x.amount, 0);

      let totalPemberiPersepuluhan = 0; let totalAnggotaSistem = 0;
      if (masterData && masterData.units) totalAnggotaSistem = masterData.units.reduce((s, u) => s + (parseInt(u.jumlah_anggota) || 0), 0);
      const unitsGavePersepuluhan = new Set(); filteredInc.forEach(x => { if ((x.income_type || '').toLowerCase().includes('persepuluhan') || (x.income_type || '').toLowerCase().includes('perpuluhan')) unitsGavePersepuluhan.add(x.unit_name); });
      if (masterData && masterData.units) masterData.units.forEach(u => { if (unitsGavePersepuluhan.has(u.name)) totalPemberiPersepuluhan += (parseInt(u.jumlah_anggota) || 0); });

      const targetPembangunan = (systemConfig.target_pembangunan !== undefined && systemConfig.target_pembangunan !== '') ? parseInt(systemConfig.target_pembangunan) : (pembangunanDataCache?.target ? parseInt(pembangunanDataCache.target) : 2500000000);
      const persentaseBangun = (calcBangun / targetPembangunan) * 100; const visualPercentBangun = persentaseBangun > 100 ? 100 : persentaseBangun;

      const targetKomitmen = (systemConfig.komitmen_target !== undefined && systemConfig.komitmen_target !== '') ? parseInt(systemConfig.komitmen_target) : (pembangunanDataCache?.komitmen_target ? parseInt(pembangunanDataCache.komitmen_target) : 77300000);
      let komitmenSaatIni = (systemConfig.komitmen_realisasi !== undefined && systemConfig.komitmen_realisasi !== '') ? parseInt(systemConfig.komitmen_realisasi) : (pembangunanDataCache?.komitmen_realisasi ? parseInt(pembangunanDataCache.komitmen_realisasi) : 63356900);
      if ((systemConfig.komitmen_realisasi === undefined || systemConfig.komitmen_realisasi === '') && komitmenSaatIni === 53376900) komitmenSaatIni = 63356900; // Force update pending API cache sync
      const persentaseKomitmen = (komitmenSaatIni / targetKomitmen) * 100;
      const visualPercentKomitmen = persentaseKomitmen > 100 ? 100 : persentaseKomitmen;

      const isPublik = currentUser && currentUser.role === 'Publik';
      const clkCls = isPublik ? 'stat-card' : 'stat-card clickable';
      const oClick = (type) => isPublik ? '' : `onclick="openDashboardDetail('${type}')"`;

      document.getElementById('statsGrid').innerHTML = `
    ${isPublik ? '' : `<div class="${clkCls}" ${oClick('total')}>
      <div class="stat-header"><div class="stat-label">Total Saldo</div><div class="stat-icon c-teal">${safeIcon('shield', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-blue, #3a86ff)">${fmt(calcTotal)}</div>
      <div style="font-size: 11px; margin-top: 8px; color: var(--text3); border-top: 1px solid var(--glass-border); padding-top: 6px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Di Tangan:</span> <strong style="color:var(--text2)">${fmt(tanganDaerah + tanganJemaat + tanganBangun)}</strong></div>
        <div style="display:flex; justify-content:space-between"><span>Di Bank:</span> <strong style="color:var(--text2)">${fmt(bankDaerah + bankJemaat + bankBangun)}</strong></div>
      </div>
    </div>
    <div class="${clkCls}" ${oClick('bersih')}>
      <div class="stat-header"><div class="stat-label">Kas Bersih (Non-Daerah)</div><div class="stat-icon c-moss">${safeIcon('log', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-cyan, #00d2ff)">${fmt(saldoAccrued)}</div>
      <div style="font-size: 11px; margin-top: 8px; color: var(--text3); border-top: 1px solid var(--glass-border); padding-top: 6px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Di Tangan:</span> <strong style="color:var(--text2)">${fmt(tanganJemaat + tanganBangun)}</strong></div>
        <div style="display:flex; justify-content:space-between"><span>Di Bank:</span> <strong style="color:var(--text2)">${fmt(bankJemaat + bankBangun)}</strong></div>
      </div>
    </div>`}
    <div class="${clkCls}" ${oClick('in')}>
      <div class="stat-header"><div class="stat-label">Pemasukan Periode</div><div class="stat-icon c-green">${safeIcon('trendUp', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-green, #00e676)">+${fmt(totalIn)}</div>
    </div>
    <div class="${clkCls}" ${oClick('out')}>
      <div class="stat-header"><div class="stat-label">Pengeluaran Periode</div><div class="stat-icon c-red">${safeIcon('trendDown', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-orange, #ff6b6b)">-${fmt(totalOut)}</div>
    </div>
    <div class="${clkCls}" ${oClick('jemaat')}>
      <div class="stat-header"><div class="stat-label">Kas Jemaat</div><div class="stat-icon c-gold">${safeIcon('church', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-gold, #ffd166)">${fmt(calcJemaat)}</div>
      <div style="font-size: 11px; margin-top: 8px; color: var(--text3); border-top: 1px solid var(--glass-border); padding-top: 6px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Di Tangan:</span> <strong style="color:var(--accent-gold, #ffd166)">${fmt(tanganJemaat)}</strong></div>
        <div style="display:flex; justify-content:space-between"><span>Di Bank:</span> <strong style="color:var(--accent-gold, #ffd166)">${fmt(bankJemaat)}</strong></div>
      </div>
    </div>
    ${isPublik ? '' : `<div class="${clkCls}" ${oClick('daerah')}>
      <div class="stat-header"><div class="stat-label">Kas Daerah</div><div class="stat-icon c-teal">${safeIcon('mappin', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-purple, #9d4edd)">${fmt(calcDaerah)}</div>
      <div style="font-size: 11px; margin-top: 8px; color: var(--text3); border-top: 1px solid var(--glass-border); padding-top: 6px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Di Tangan:</span> <strong style="color:var(--accent-purple, #9d4edd)">${fmt(tanganDaerah)}</strong></div>
        <div style="display:flex; justify-content:space-between"><span>Di Bank:</span> <strong style="color:var(--accent-purple, #9d4edd)">${fmt(bankDaerah)}</strong></div>
      </div>
    </div>`}
    <div class="${clkCls}" ${oClick('bangun')}>
      <div class="stat-header"><div class="stat-label">Total Dana Pembangunan</div><div class="stat-icon c-teal">${safeIcon('hammer', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-blue, #3a86ff)">${fmt(calcBangun)}</div>
      <div style="font-size: 11px; margin-top: 8px; color: var(--text3); border-top: 1px solid var(--glass-border); padding-top: 6px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Di Tangan:</span> <strong style="color:var(--accent-blue, #3a86ff)">${fmt(tanganBangun)}</strong></div>
        <div style="display:flex; justify-content:space-between"><span>Di Bank:</span> <strong style="color:var(--accent-blue, #3a86ff)">${fmt(bankBangun)}</strong></div>
      </div>
      <div class="stat-sub" style="margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; font-weight: 700; color: var(--text-muted, var(--accent-gold, #ffd166));"><span>TARGET:</span><span style="color: var(--accent-gold, #ffd166, var(--teal-pop));">${persentaseBangun.toFixed(2)}%</span></div>
        <div style="font-size: 11px; margin-bottom: 6px; font-weight: 700; color: var(--text-muted, var(--accent-gold, #ffd166)); word-break: break-word; line-height: 1.1;">${fmt(targetPembangunan).toUpperCase()}</div>
        <div class="saldo-bar-track" style="height: 6px;"><div class="saldo-bar-fill" style="width:${visualPercentBangun}%; background: var(--accent-gold, #ffd166, var(--teal-pop));"></div></div>
      </div>
    </div>
    ${(isPublik || targetKomitmen <= 0 || komitmenSaatIni <= 0) ? '' : `<div class="stat-card">
      <div class="stat-header"><div class="stat-label">Komitmen Pembangunan</div><div class="stat-icon c-moss">${safeIcon('hammer', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--accent-cyan, #00d2ff)">${fmt(komitmenSaatIni)}</div>
      <div class="stat-sub" style="margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; font-weight: 700; color: var(--text-muted, var(--text3));"><span>TARGET:</span><span style="color: var(--accent-cyan, var(--teal-pop));">${persentaseKomitmen.toFixed(2)}%</span></div>
        <div style="font-size: 11px; margin-bottom: 6px; font-weight: 700; color: var(--text-muted, var(--text3)); word-break: break-word; line-height: 1.1;">${fmt(targetKomitmen).toUpperCase()}</div>
        <div class="saldo-bar-track" style="height: 6px;"><div class="saldo-bar-fill" style="width:${visualPercentKomitmen}%; background: var(--accent-cyan, var(--teal-pop));"></div></div>
      </div>
    </div>`}
    <div class="stat-card">
      <div class="stat-header"><div class="stat-label">Partisipasi Jemaat</div><div class="stat-icon c-red">${safeIcon('users', 'lucide-lg')}</div></div>
      <div class="stat-value" style="color: var(--text-main, var(--text))">${totalPemberiPersepuluhan} <span style="font-size:16px; color: var(--text-muted, var(--text4))">/ ${totalAnggotaSistem}</span></div>
    </div>
  `;

      const dashMainGrid = document.querySelector('.dashboard-main-grid');
      if (dashMainGrid) {
        dashMainGrid.style.display = isPublik ? 'none' : '';
      }

      const maxVal = Math.max(calcDaerah, calcJemaat, calcBangun, 1);
      document.getElementById('saldoBars').innerHTML = `
    <div class="saldo-bar-wrap"><div class="saldo-bar-label"><span>Kas Jemaat</span><span>${fmt(calcJemaat)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${(calcJemaat / maxVal * 100).toFixed(0)}%; background:var(--accent-gold, var(--gold))"></div></div></div>
    <div class="saldo-bar-wrap"><div class="saldo-bar-label"><span>Kas Daerah</span><span>${fmt(calcDaerah)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${(calcDaerah / maxVal * 100).toFixed(0)}%; background:var(--accent-purple, var(--text3))"></div></div></div>
    <div class="saldo-bar-wrap"><div class="saldo-bar-label"><span>Dana Pembangunan</span><span>${fmt(calcBangun)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${(calcBangun / maxVal * 100).toFixed(0)}%; background:var(--accent-blue, var(--teal-pop))"></div></div></div>
  `;

      let periodDaerah = 0; let periodJemaat = 0; let periodBangun = 0;
      filteredInc.forEach(i => { periodDaerah += (i.alloc_daerah || 0); periodJemaat += (i.alloc_jemaat || 0); periodBangun += (i.alloc_bangun || 0); });
      const periodTotal = periodDaerah + periodJemaat + periodBangun;

      if (periodTotal === 0) {
        document.getElementById('allocBars').innerHTML = '<div class="empty-state" style="border:none; background:transparent;">Belum ada pemasukan.</div>';
      } else {
        const pctD = ((periodDaerah / periodTotal) * 100).toFixed(1); const pctJ = ((periodJemaat / periodTotal) * 100).toFixed(1); const pctB = ((periodBangun / periodTotal) * 100).toFixed(1);
        document.getElementById('allocBars').innerHTML = `
      <div class="saldo-bar-wrap"><div class="saldo-bar-label"><span>Kas Jemaat (${pctJ}%)</span><span>${fmt(periodJemaat)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${pctJ}%; background:var(--accent-gold, var(--gold))"></div></div></div>
      <div class="saldo-bar-wrap"><div class="saldo-bar-label"><span>Kas Daerah (${pctD}%)</span><span>${fmt(periodDaerah)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${pctD}%; background:var(--accent-purple, var(--text3))"></div></div></div>
      <div class="saldo-bar-wrap"><div class="saldo-bar-label"><span>Pembangunan (${pctB}%)</span><span>${fmt(periodBangun)}</span></div><div class="saldo-bar-track"><div class="saldo-bar-fill" style="width:${pctB}%; background:var(--accent-blue, var(--teal-pop))"></div></div></div>
    `;
      }

      const jBreak = {}; const dBreak = {}; const bBreak = {};
      filteredInc.forEach(x => { if (x.alloc_jemaat > 0) jBreak[x.income_type] = (jBreak[x.income_type] || 0) + x.alloc_jemaat; if (x.alloc_daerah > 0) dBreak[x.income_type] = (dBreak[x.income_type] || 0) + x.alloc_daerah; if (x.alloc_bangun > 0) bBreak[x.income_type] = (bBreak[x.income_type] || 0) + x.alloc_bangun; });
      let catInTable = '<div class="table-wrap" style="margin-top:0; border:none;"><table class="summary-table" style="font-size:13px; width:100%;"><tbody>';
      if (filteredInc.length === 0) { catInTable += '<tr><td colspan="2" style="text-align:center"><div class="empty-state">Tidak ada pemasukan.</div></td></tr>'; } else {
        if (Object.keys(jBreak).length > 0) { catInTable += `<tr><td colspan="2" style="background: var(--empty-bg);"><strong style="color:var(--accent-gold, var(--gold));">Masuk ke Kas Jemaat</strong></td></tr>`; Object.entries(jBreak).forEach(([k, v]) => { catInTable += `<tr><td style="padding-left: 24px;"><span class="badge ${getCatBadge(k, false)}">${k}</span></td><td class="fit-col amount-pos" style="text-align:right">${fmt(v)}</td></tr>`; }); }
        if (Object.keys(dBreak).length > 0) { catInTable += `<tr><td colspan="2" style="background: var(--empty-bg);"><strong style="color:var(--accent-purple, var(--text3));">Masuk ke Kas Daerah</strong></td></tr>`; Object.entries(dBreak).forEach(([k, v]) => { catInTable += `<tr><td style="padding-left: 24px;"><span class="badge ${getCatBadge(k, false)}">${k}</span></td><td class="fit-col amount-pos" style="text-align:right">${fmt(v)}</td></tr>`; }); }
        if (Object.keys(bBreak).length > 0) { catInTable += `<tr><td colspan="2" style="background: var(--empty-bg);"><strong style="color:var(--accent-blue, var(--teal-pop));">Masuk ke Pembangunan</strong></td></tr>`; Object.entries(bBreak).forEach(([k, v]) => { catInTable += `<tr><td style="padding-left: 24px;"><span class="badge ${getCatBadge(k, false)}">${k}</span></td><td class="fit-col amount-pos" style="text-align:right">${fmt(v)}</td></tr>`; }); }
      }
      document.getElementById('kategoriInTable').innerHTML = catInTable + '</tbody></table></div>';

      const catOutBreak = {}; filteredExp.forEach(x => { catOutBreak[x.department] = (catOutBreak[x.department] || 0) + x.amount; });
      let catOutTable = '<div class="table-wrap" style="margin-top:0; border:none;"><table class="summary-table" style="font-size:13px; width:100%;"><tbody>';
      if (Object.keys(catOutBreak).length === 0) { catOutTable += '<tr><td colspan="2" style="text-align:center"><div class="empty-state">Tidak ada pengeluaran.</div></td></tr>'; } else { Object.entries(catOutBreak).forEach(([k, v]) => { catOutTable += `<tr><td><span class="badge ${getCatBadge(k, true)}">${k}</span></td><td class="fit-col amount-neg" style="text-align:right">-${fmt(v)}</td></tr>`; }); }
      document.getElementById('kategoriOutTable').innerHTML = catOutTable + '</tbody></table></div>';

      let combined = [...filteredInc.map(x => ({ ...x, kind: 'income', style: 'amount-pos', sign: '+', badge: 'badge-green', label: 'In' })), ...filteredExp.map(x => ({ ...x, kind: 'expense', style: 'amount-neg', sign: '-', badge: 'badge-red', label: 'Out' }))];
      const uUnitsDash = getUserUnits();
      if (currentUser && currentUser.role === 'Operator' && uUnitsDash.length > 0) {
        combined = combined.filter(x => {
          const txUnitLower = String(x.unit_name || '').toLowerCase().trim();
          return uUnitsDash.some(u => String(u).toLowerCase().trim() === txUnitLower);
        });
      }
      combined = groupTransactions(combined);
      const recent = combined.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      if (recent.length === 0) {
        document.getElementById('recentTransContainer').innerHTML = '<div class="empty-state" style="padding:20px; text-align:center;">Belum ada aktivitas.</div>';
      } else {
        let desktopHtml = recent.map(x => {
          const isPrivCategory = isViewer && x.kind === 'income' && isPrivateCategory(x.income_type);
          const shouldHide = isViewer && isPrivCategory;
          let photoBtn = getPhotoBtnIcon(x);
          return `<tr><td class="fit-col">${fmtDate(x.date)}</td><td class="fit-col"><span class="badge ${x.badge}">${x.label}</span></td><td><span class="badge ${getCatBadge(x.income_type || x.department, x.kind !== 'income')}">${x.income_type || x.department}</span><br><span style="font-size:12px; color:var(--text-muted, var(--text4))">${shouldHide ? '***' : (x.note || '-')}</span></td><td class="fit-col"><span class="badge badge-gray">${x.receipt_no}</span> ${photoBtn}</td><td class="fit-col ${x.style}" style="text-align:right">${x.sign}${fmt(x.amount)}</td></tr>`;
        }).join('');

        let mobileHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column;">' + recent.map(x => {
          const isPrivCategory = isViewer && x.kind === 'income' && isPrivateCategory(x.income_type);
          const shouldHide = isViewer && isPrivCategory;
          const isInc = x.kind === 'income';
          let photoBtn = getPhotoBtnText(x);
          return `
          <div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge ${x.badge}" style="font-size:10px; padding:2px 7px;">${isInc ? 'IN' : 'OUT'}</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no}</span>
              </div>
              <div class="${x.style}" style="font-weight: 700; font-size: 15px; white-space:nowrap;">${x.sign}${fmt(x.amount)}</div>
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
              <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
              <span style="color:var(--text4)">Ket</span><strong style="color:var(--text); font-weight:600;">${x.income_type || x.department}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${shouldHide ? '***' : (x.note || '-')}</span>
            </div>
            ${photoBtn}
          </div>`;
        }).join('') + '</div>';

        document.getElementById('recentTransContainer').innerHTML = `
          <div class="desktop-only table-wrap" style="border:none;">
            <table class="table-log">
              <thead><tr><th class="fit-col">Tanggal</th><th class="fit-col">Alur</th><th>Keterangan</th><th class="fit-col">Bukti</th><th class="fit-col" style="text-align:right">Nominal</th></tr></thead>
              <tbody>${desktopHtml}</tbody>
            </table>
          </div>
          <div class="mobile-only" style="padding-bottom:12px;">${mobileHtml}</div>
        `;
      }

      // Auto-Sync to Pembangunan Server
      if (pembangunanDataCache && parseInt(pembangunanDataCache.terkumpul) !== calcBangun) {
        const payload = {
          action: 'updateInfoWebsite',
          target: pembangunanDataCache.target,
          terkumpul: calcBangun,
          komitmen: pembangunanDataCache.komitmen,
          komitmen_target: pembangunanDataCache.komitmen_target,
          komitmen_realisasi: pembangunanDataCache.komitmen_realisasi,
          bank: pembangunanDataCache.bank,
          norek: pembangunanDataCache.norek,
          atasnama: pembangunanDataCache.atasnama,
          judul: pembangunanDataCache.judul
        };
        fetch(PEMBANGUNAN_URL, { method: 'POST', body: JSON.stringify(payload) })
          .then(() => { pembangunanDataCache.terkumpul = calcBangun; console.log("Synced calcBangun to Pembangunan."); })
          .catch(e => console.error("Failed to sync to Pembangunan", e));
      }
    }

    function getIncomeTypeConfig(name) { return masterData.incomeTypes.find(x => x.name === name) || null; }

    function updateIncomeAlloc() {
      const type = document.getElementById('incType').value; let allocD = 0, allocJ = 0, allocB = 0;
      if (type === 'Perpuluhan') {
        const amtP = parseRupiah(document.getElementById('incAmtPerpuluhan').value); const amtT = parseRupiah(document.getElementById('incAmtTerpadu').value); const amtKJ = parseRupiah(document.getElementById('incAmtKhususJemaat').value); const amtKD = parseRupiah(document.getElementById('incAmtKhususDaerah').value);
        const getPct = (name) => { const cfg = getIncomeTypeConfig(name); return cfg ? { d: cfg.pct_daerah, j: cfg.pct_jemaat, b: cfg.pct_bangun } : { d: 0, j: 0, b: 0 }; };
        const cp = getPct('Perpuluhan'), ct = getPct('Terpadu'), ckj = getPct('Khusus Jemaat'), ckd = getPct('Khusus Daerah');
        allocD = (amtP * cp.d / 100) + (amtT * ct.d / 100) + (amtKJ * ckj.d / 100) + (amtKD * ckd.d / 100);
        allocJ = (amtP * cp.j / 100) + (amtT * ct.j / 100) + (amtKJ * ckj.j / 100) + (amtKD * ckd.j / 100);
        allocB = (amtP * cp.b / 100) + (amtT * ct.b / 100) + (amtKJ * ckj.b / 100) + (amtKD * ckd.b / 100);
      } else {
        const amount = parseRupiah(document.getElementById('incAmount').value); const cfg = getIncomeTypeConfig(type);
        if (cfg) { allocD = amount * cfg.pct_daerah / 100; allocJ = amount * cfg.pct_jemaat / 100; allocB = amount * cfg.pct_bangun / 100; }
      }
      document.getElementById('allocDaerahVal').textContent = fmt(allocD); document.getElementById('allocJemaatVal').textContent = fmt(allocJ); document.getElementById('allocBangunVal').textContent = fmt(allocB);
    }

    function isReceiptDuplicate(receipt_no, exclude_id = null) {
      if (!receipt_no || receipt_no === '-') return false;
      const allTransactions = [...(cachedIncome || []), ...(cachedExpense || [])];
      return allTransactions.some(x => {
        if (String(x.receipt_no).trim().toLowerCase() !== String(receipt_no).trim().toLowerCase()) return false;
        if (exclude_id) {
          const xId = x.transaction_id || x.receipt_no;
          if (String(xId) === String(exclude_id)) return false;
        }
        return true;
      });
    }

    async function saveIncomeForm() {
      const date = document.getElementById('incDate').value; const type = document.getElementById('incType').value;
      if (date) {
        const d = new Date(date);
        if (checkMonthClosed(d.getMonth() + 1, d.getFullYear())) { notify('Bulan ini sudah ditutup. Tidak dapat menambah transaksi.', 'error'); return; }
      }
      const unit = document.getElementById('incUnit').value; const giver = document.getElementById('incGiver').value.trim();
      const receipt = document.getElementById('incReceipt').value.trim(); const note = document.getElementById('incNote').value.trim();

      if (!date || !type || !receipt) { notify('Lengkapi data!', 'error'); return; }
      if (isReceiptDuplicate(receipt)) {
        const proceed = await showCustomConfirm('Konfirmasi Kuitansi', 'No. Kuitansi sudah ada! Apakah ini kuitansi kolektif dan Anda tetap ingin menyimpannya?');
        if (!proceed) return;
      }

      const dest = document.getElementById('incDestination') ? document.getElementById('incDestination').value : 'CASH';
      let finalNote = note;
      if (dest === 'BANK') finalNote = '[BANK] ' + note;
      else if (dest === 'CASH') finalNote = '[CASH] ' + note;

      const btn = document.getElementById('savIncBtn'); btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Proses...';
      try {
        if (type === 'Perpuluhan') {
          const items = [];
          ['Perpuluhan', 'Terpadu', 'Khusus Jemaat', 'Khusus Daerah'].forEach(k => { const val = parseRupiah(document.getElementById(`incAmt${k.replace(/\s/g, '')}`).value); if (val > 0) items.push({ income_type: k, amount: val, note: finalNote }); });
          if (items.length === 0) throw new Error('Isi nominal perpuluhan!');
          await apiPost('saveBulkIncome', { date, unit_name: unit || '-', nama_pemberi: giver || 'Umum', receipt_no: receipt, items, receipt_photo_base64: currentIncPhotos[0] || '', receipt_photo_base64_2: currentIncPhotos[1] || '', receipt_photo_base64_3: currentIncPhotos[2] || '' });
        } else {
          const amount = parseRupiah(document.getElementById('incAmount').value); if (amount <= 0) throw new Error('Isi nominal!');
          let pctD = 0; let pctJ = 100; let pctB = 0;
          const cfg = getIncomeTypeConfig(type);
          if (cfg) {
            pctD = cfg.pct_daerah; pctJ = cfg.pct_jemaat; pctB = cfg.pct_bangun;
          } else {
            const tLower = type.toLowerCase();
            const isSabat13 = tLower.includes('sabat') && tLower.includes('13');
            const isSabat = tLower.includes('sabat') && !tLower.includes('13');
            if (type === 'Khusus Daerah' || type === 'Perpuluhan' || isSabat13) { pctD = 100; pctJ = 0; }
            else if (type === 'Terpadu' || isSabat) { pctD = 50; pctJ = 50; }
          }
          await apiPost('saveIncome', { date, income_type: type, unit_name: unit || '-', nama_pemberi: giver || 'Umum', receipt_no: receipt, amount, note: finalNote, alloc_pct_daerah: pctD, alloc_pct_jemaat: pctJ, alloc_pct_bangun: pctB, receipt_photo_base64: currentIncPhotos[0] || '', receipt_photo_base64_2: currentIncPhotos[1] || '', receipt_photo_base64_3: currentIncPhotos[2] || '' });
        }
        notify('Berhasil disimpan!', 'success');

        document.getElementById('incType').value = ''; handleTypeChange(); document.getElementById('incUnit').value = ''; document.getElementById('incGiver').value = ''; document.getElementById('incReceipt').value = ''; document.getElementById('incAmount').value = ''; document.getElementById('incAmtPerpuluhan').value = ''; document.getElementById('incAmtTerpadu').value = ''; document.getElementById('incAmtKhususJemaat').value = ''; document.getElementById('incAmtKhususDaerah').value = ''; document.getElementById('incNote').value = '';
        resetPhotoUpload('income');

        updateIncomeAlloc(); await syncAllData(); renderIncomeList();
      } catch (err) { notify(err.message, 'error'); } finally { btn.disabled = false; btn.innerHTML = `Posting Pemasukan`; }
    }

    function renderIncomeList() {
      const perms = getRolePerms(currentUser.role);
      const isAnon = perms.isAnonymous;
      const list = groupTransactions([...cachedIncome]).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
      if (list.length === 0) {
        document.getElementById('incomeLogContainer').innerHTML = '<div class="empty-state" style="padding:20px; text-align:center;">Kosong.</div>';
      } else {
        let desktopHtml = list.map(x => {
          let nText = x.note || '-';
          let bBadge = '';
          if (nText.includes('[BANK]')) { nText = nText.replace(/\[BANK\]\s?|\s?\[BANK\]/g, ''); bBadge = '<span class="badge badge-green" style="font-size:10px; padding:2px 4px; margin-right:4px;">VIA BANK</span>'; }
          else if (nText.includes('[CASH]')) { nText = nText.replace(/\[CASH\]\s?|\s?\[CASH\]/g, ''); bBadge = '<span class="badge badge-amber" style="font-size:10px; padding:2px 4px; margin-right:4px;">TUNAI</span>'; }
          return `<tr><td class="fit-col">${fmtDate(x.date)}</td><td><span class="badge ${getCatBadge(x.income_type, false)}">${x.income_type}</span><br><span style="font-size:12px; color:var(--text4)">${isAnon ? '***' : (bBadge + nText)}</span></td><td class="fit-col"><span style="font-family:monospace">${x.receipt_no}</span>${getPhotoBtnIcon(x)}</td><td class="fit-col amount-pos" style="text-align:right">+${fmt(x.amount)}</td></tr>`;
        }).join('');

        let mobileHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column;">' + list.map(x => {
          let photoBtn = getPhotoBtnText(x);
          let nText = x.note || '-';
          let bBadge = '';
          if (nText.includes('[BANK]')) { nText = nText.replace(/\[BANK\]\s?|\s?\[BANK\]/g, ''); bBadge = '<span class="badge badge-green" style="font-size:10px; padding:2px 4px; margin-right:4px;">VIA BANK</span>'; }
          else if (nText.includes('[CASH]')) { nText = nText.replace(/\[CASH\]\s?|\s?\[CASH\]/g, ''); bBadge = '<span class="badge badge-amber" style="font-size:10px; padding:2px 4px; margin-right:4px;">TUNAI</span>'; }
          return `
          <div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge badge-blue" style="font-size:10px; padding:2px 7px;">IN</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no}</span>
              </div>
              <div class="amount-pos" style="font-weight: 700; font-size: 15px; white-space:nowrap;">+${fmt(x.amount)}</div>
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
              <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
              <span style="color:var(--text4)">Ket</span><strong style="color:var(--text); font-weight:600;">${x.income_type}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${isAnon ? '***' : (bBadge + nText)}</span>
            </div>
            <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
              ${photoBtn}
            </div>
          </div>`;
        }).join('') + '</div>';

        document.getElementById('incomeLogContainer').innerHTML = `
          <div class="desktop-only table-wrap" style="border:none;">
            <table class="table-log">
              <thead><tr><th class="fit-col">Tanggal</th><th>Kategori</th><th class="fit-col">Bukti</th><th class="fit-col" style="text-align:right">Nominal</th></tr></thead>
              <tbody>${desktopHtml}</tbody>
            </table>
          </div>
          <div class="mobile-only" style="padding-bottom:12px;">${mobileHtml}</div>
        `;
      }
    }

    function getSaldoForSource(src) {
      if (src === 'Daerah|BANK') return cachedSaldo.bankDaerah;
      if (src === 'Daerah|CASH') return cachedSaldo.tanganDaerah;
      if (src === 'Kas Jemaat|BANK') return cachedSaldo.bankJemaat;
      if (src === 'Kas Jemaat|CASH') return cachedSaldo.tanganJemaat;
      if (src === 'Pembangunan|BANK') return cachedSaldo.bankBangun;
      if (src === 'Pembangunan|CASH') return cachedSaldo.tanganBangun;
      if (src === 'Daerah') return cachedSaldo.daerah;
      if (src === 'Kas Jemaat') return cachedSaldo.jemaat;
      if (src === 'Pembangunan') return cachedSaldo.bangun;
      return 0;
    }

    function checkSaldo() {
      const src = document.getElementById('expSource').value; const amount = parseRupiah(document.getElementById('expAmount').value);
      let avail = Math.round(getSaldoForSource(src));
      document.getElementById('saldoTersedia').textContent = fmt(avail); document.getElementById('saldoWarning').style.display = amount > avail ? 'flex' : 'none';
    }

    function checkMutSaldo() {
      const src = document.getElementById('mutSource').value; const amount = parseRupiah(document.getElementById('mutAmount').value);
      let avail = Math.round(getSaldoForSource(src));
      document.getElementById('mutSaldoTersedia').textContent = fmt(avail); document.getElementById('mutSaldoWarning').style.display = amount > avail ? 'flex' : 'none';
    }

    async function saveExpenseForm() {
      const date = document.getElementById('expDate').value; const dept = document.getElementById('expDept').value;
      if (date) {
        const d = new Date(date);
        if (checkMonthClosed(d.getMonth() + 1, d.getFullYear())) { notify('Bulan ini sudah ditutup. Tidak dapat menambah transaksi.', 'error'); return; }
      }
      const rawSrc = document.getElementById('expSource').value;
      const receipt = document.getElementById('expReceipt').value.trim();
      const amount = parseRupiah(document.getElementById('expAmount').value);
      let note = document.getElementById('expNote').value.trim();
      const receiver = document.getElementById('expReceiver').value.trim();

      const [src, type] = rawSrc.includes('|') ? rawSrc.split('|') : [rawSrc, ''];
      if (type === 'BANK' && !note.includes('[BANK]')) note = (note + ' [BANK]').trim();
      if (type === 'CASH' && !note.includes('[CASH]')) note = (note + ' [CASH]').trim();

      if (!date || !dept || !receipt || amount <= 0) { notify('Lengkapi data!', 'error'); return; }
      if (isReceiptDuplicate(receipt)) {
        const proceed = await showCustomConfirm('Konfirmasi Kuitansi', 'No. Bukti/Kuitansi sudah ada! Apakah ini kuitansi kolektif dan Anda tetap ingin menyimpannya?');
        if (!proceed) return;
      }
      let avail = Math.round(getSaldoForSource(rawSrc));
      if (amount > avail) { notify('Saldo tidak cukup!', 'error'); return; }

      const btn = document.getElementById('savExpBtn'); btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Proses...';
      try {
        await apiPost('saveExpense', { date, department: dept, source_balance: src, receipt_no: receipt, amount, note, receipt_photo_base64: currentExpPhotos[0] || '', receipt_photo_base64_2: currentExpPhotos[1] || '', receipt_photo_base64_3: currentExpPhotos[2] || '', nama_penerima: receiver || '-' });
        notify('Berhasil!', 'success');
        document.getElementById('expDept').value = ''; document.getElementById('expReceipt').value = ''; document.getElementById('expAmount').value = ''; document.getElementById('expNote').value = ''; document.getElementById('expReceiver').value = '';
        resetPhotoUpload('expense');
        await syncAllData(); renderExpenseList();
      } catch (err) { notify(err.message, 'error'); } finally { btn.disabled = false; btn.innerHTML = `Posting Pengeluaran`; }
    }

    async function saveMutasiForm() {
      const date = document.getElementById('mutDate').value;
      const dept = 'Mutasi Kas / Setor Bank';
      if (date) {
        const d = new Date(date);
        if (checkMonthClosed(d.getMonth() + 1, d.getFullYear())) { notify('Bulan ini sudah ditutup. Tidak dapat mutasi.', 'error'); return; }
      }
      const rawSrc = document.getElementById('mutSource').value;
      const receipt = document.getElementById('mutReceipt').value.trim();
      const amount = parseRupiah(document.getElementById('mutAmount').value);
      let note = document.getElementById('mutNote').value.trim();
      const receiver = 'Kas Utama (Bank)';

      const [src, type] = rawSrc.includes('|') ? rawSrc.split('|') : [rawSrc, ''];

      if (!date || !receipt || amount <= 0) { notify('Lengkapi data!', 'error'); return; }
      if (isReceiptDuplicate(receipt)) {
        const proceed = await showCustomConfirm('Konfirmasi Kuitansi', 'No. Bukti Setor sudah ada! Apakah Anda tetap ingin menyimpannya?');
        if (!proceed) return;
      }
      let avail = Math.round(getSaldoForSource(rawSrc));
      if (amount > avail) { notify('Saldo tidak cukup!', 'error'); return; }

      const btn = document.getElementById('savMutBtn'); btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Proses...';
      try {
        await apiPost('saveExpense', { date, department: dept, source_balance: src, receipt_no: receipt, amount, note, receipt_photo_base64: currentMutPhotos[0] || '', receipt_photo_base64_2: currentMutPhotos[1] || '', receipt_photo_base64_3: currentMutPhotos[2] || '', nama_penerima: receiver, approved_by: 'Admin,Ketua Jemaat,Pendeta' });
        notify('Berhasil Setor ke Bank!', 'success');
        document.getElementById('mutReceipt').value = ''; document.getElementById('mutAmount').value = ''; document.getElementById('mutNote').value = '';
        resetPhotoUpload('mutasi');
        await syncAllData(); renderMutasiList();
      } catch (err) { notify(err.message, 'error'); } finally { btn.disabled = false; btn.innerHTML = `Proses Setoran Bank`; }
    }

    function renderExpenseList() {
      const perms = getRolePerms(currentUser.role);
      const isAnon = perms.isAnonymous;
      const list = [...cachedExpense].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
      if (list.length === 0) {
        document.getElementById('expenseLogContainer').innerHTML = '<div class="empty-state" style="padding:20px; text-align:center;">Kosong.</div>';
      } else {
        let desktopHtml = list.map(x => `<tr><td class="fit-col">${fmtDate(x.date)}</td><td><span class="badge ${getCatBadge(x.department, true)}">${x.department}</span><br><span style="font-size:12px; color:var(--text4)">${isAnon ? '***' : (x.note || '-')}<br>Penerima: ${isAnon ? '***' : (x.nama_penerima || '-')}</span></td><td class="fit-col"><span class="badge badge-gray">${x.receipt_no}</span>${getPhotoBtnIcon(x)}</td><td class="fit-col amount-neg" style="text-align:right">-${fmt(x.amount)}</td></tr>`).join('');

        let mobileHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column;">' + list.map(x => {
          let photoBtn = getPhotoBtnText(x);
          return `
          <div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge badge-red" style="font-size:10px; padding:2px 7px;">OUT</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no}</span>
              </div>
              <div class="amount-neg" style="font-weight: 700; font-size: 15px; white-space:nowrap;">-${fmt(x.amount)}</div>
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
              <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
              <span style="color:var(--text4)">Pihak</span><strong style="color:var(--text); font-weight:600; overflow:hidden; text-overflow:ellipsis;">${isAnon ? '***' : (x.nama_penerima || '-')}</strong>
              <span style="color:var(--text4)">Ket</span><strong style="color:var(--text); font-weight:600;">${x.department}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${isAnon ? '***' : (x.note || '-')}</span>
            </div>
            <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
              ${photoBtn}
            </div>
          </div>`;
        }).join('') + '</div>';

        document.getElementById('expenseLogContainer').innerHTML = `
          <div class="desktop-only table-wrap" style="border:none;">
            <table class="table-log">
              <thead><tr><th class="fit-col">Tanggal</th><th>Bidang</th><th class="fit-col">Bukti</th><th class="fit-col" style="text-align:right">Nominal</th></tr></thead>
              <tbody>${desktopHtml}</tbody>
            </table>
          </div>
          <div class="mobile-only" style="padding-bottom:12px;">${mobileHtml}</div>
        `;
      }
    }

    function renderMutasiList() {
      const perms = getRolePerms(currentUser.role);
      const isAnon = perms.isAnonymous;
      const resultDiv = document.getElementById('mutasiLogContainer');
      if (!resultDiv) return;
      let list = (cachedExpense || []).filter(x => x.department === 'Mutasi Kas / Setor Bank');
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      list = list.slice(0, 10);
      if (list.length === 0) {
        resultDiv.innerHTML = '<div class="empty-state" style="padding:20px; text-align:center;">Belum ada mutasi setoran bank.</div>';
      } else {
        let desktopHtml = list.map(x => `<tr><td class="fit-col">${fmtDate(x.date)}</td><td><span style="font-size:12px; color:var(--text4)">${isAnon ? '***' : (x.note || '-')}</span></td><td class="fit-col"><span style="font-family:monospace">${x.receipt_no}</span>${getPhotoBtnIcon(x)}</td><td class="fit-col amount-pos" style="text-align:right">+${fmt(x.amount)}</td></tr>`).join('');

        let mobileHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column;">' + list.map(x => {
          let photoBtn = getPhotoBtnText(x);
          return `
          <div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge badge-blue" style="font-size:10px; padding:2px 7px;">MUT</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no}</span>
              </div>
              <div class="amount-pos" style="font-weight: 700; font-size: 15px; white-space:nowrap;">+${fmt(x.amount)}</div>
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
              <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${isAnon ? '***' : (x.note || '-')}</span>
            </div>
            <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
              ${photoBtn}
            </div>
          </div>`;
        }).join('') + '</div>';

        resultDiv.innerHTML = `
          <div class="desktop-only table-wrap" style="border:none;">
            <table class="table-log">
              <thead><tr><th class="fit-col">Tanggal</th><th>Keterangan</th><th class="fit-col">Bukti</th><th class="fit-col" style="text-align:right">Nominal</th></tr></thead>
              <tbody>${desktopHtml}</tbody>
            </table>
          </div>
          <div class="mobile-only" style="padding-bottom:12px;">${mobileHtml}</div>
        `;
      }
    }

    async function loadReport() {
      const month = parseInt(document.getElementById('rptMonth').value);
      const year = parseInt(document.getElementById('rptYear').value);
      const mode = document.getElementById('rptMode') ? document.getElementById('rptMode').value : 'bulanan';
      const rc = document.getElementById('reportContent');

      rc.innerHTML = '<div style="text-align:center; padding:40px;"><span class="spinner"></span> Menyusun Laporan...</div>';

      try {
        // Calculate locally to support "Akumulasi dari awal" instantly
        let totalInc = 0; let totalExp = 0;
        const incByCat = {}; const expByDept = {};

        let saldoAwal = (cachedSaldo.initJemaat || 0) + (cachedSaldo.initDaerah || 0);

        let saldoAwalJemaat = cachedSaldo.initJemaat || 0;

        if (mode === 'bulanan') {
          const isBefore = (dateStr) => {
            const d = new Date(dateStr);
            if (year !== 0 && d.getFullYear() < year) return true;
            if (year !== 0 && d.getFullYear() === year && month !== 0 && (d.getMonth() + 1) < month) return true;
            return false;
          };
          (cachedIncome || []).forEach(x => {
            const isBangun = (x.income_type || '').toLowerCase().includes('pembangunan') || parseFloat(x.alloc_bangun || 0) > 0;
            if (isBefore(x.date) && !isBangun) {
              saldoAwal += parseFloat(x.amount || 0);
              saldoAwalJemaat += (parseFloat(x.alloc_jemaat) || 0);
            }
          });
          (cachedExpense || []).forEach(x => {
            const isMutasi = x.department === 'Mutasi Kas / Setor Bank';
            if (isBefore(x.date) && x.source_balance !== 'Pembangunan' && !isMutasi) {
              saldoAwal -= parseFloat(x.amount || 0);
              const sb = x.source_balance || '';
              if (sb === 'Kas Jemaat' || sb === 'Kas Jemaat (Di Tangan)' || sb === 'Kas Jemaat (Bank)') {
                saldoAwalJemaat -= parseFloat(x.amount || 0);
              }
            }
          });
        }

        const isMatch = (dateStr) => {
          const d = new Date(dateStr);
          if (mode === 'akumulasi') {
            if (year !== 0) {
              if (d.getFullYear() > year) return false;
              if (d.getFullYear() === year && month !== 0 && (d.getMonth() + 1) > month) return false;
            }
            return true;
          } else {
            if (year !== 0 && d.getFullYear() !== year) return false;
            if (month !== 0 && (d.getMonth() + 1) !== month) return false;
            return true;
          }
        };

        (cachedIncome || []).filter(x => isMatch(x.date)).forEach(x => {
          if (x.income_type === 'Mutasi Kas / Setor Bank') return;
          const isBangun = (x.income_type || '').toLowerCase().includes('pembangunan') || parseFloat(x.alloc_bangun || 0) > 0;
          if (isBangun) return;
          const cat = x.income_type || 'Lainnya';
          if (!incByCat[cat]) incByCat[cat] = [];
          incByCat[cat].push(x);
          totalInc += parseFloat(x.amount || 0);
        });

        (cachedExpense || []).filter(x => isMatch(x.date)).forEach(x => {
          if (x.department === 'Mutasi Kas / Setor Bank') return;
          if (x.source_balance === 'Pembangunan') return;
          const dept = x.department || 'Lainnya';
          if (!expByDept[dept]) expByDept[dept] = [];
          expByDept[dept].push(x);
          totalExp += parseFloat(x.amount || 0);
        });

        currentReportData = {
          summary: {
            saldoAwal: saldoAwal,
            saldoAwalJemaat: saldoAwalJemaat,
            periodIncome: totalInc,
            totalIncome: totalInc + saldoAwal,
            totalExpense: totalExp,
            netBalance: totalInc + saldoAwal - totalExp,
            balances: cachedSaldo || { total: 0 }
          },
          incByCategory: incByCat,
          expByDept: expByDept,
          month: month,
          year: year,
          mode: mode
        };

        renderReportView();
        const exportBtn = document.getElementById('btnExportExcel');
        if (exportBtn) exportBtn.style.display = 'inline-block';
        const printBtn = document.getElementById('btnPrintReport');
        if (printBtn) printBtn.style.display = 'inline-block';
        const pmbBtn = document.getElementById('btnPembangunanReport');
        if (pmbBtn) pmbBtn.style.display = 'inline-block';
        const pmbExpBtn = document.getElementById('btnExportPembangunanExcel');
        if (pmbExpBtn) pmbExpBtn.style.display = 'inline-block';
        const partisipasiBtn = document.getElementById('btnPartisipasiReport');
        if (partisipasiBtn) {
          const allowedRoles = ['Admin', 'Bendahara', 'Ketua Jemaat', 'Pendeta', 'Gembala'];
          if (currentUser && allowedRoles.includes(currentUser.role)) {
            partisipasiBtn.style.display = 'inline-block';
          } else {
            partisipasiBtn.style.display = 'none';
          }
        }
      } catch (e) {
        rc.innerHTML = `<div style="text-align:center; padding:20px; color:var(--red-pop)">Gagal memuat: ${e.message}</div>`;
      }
    }

    function generateComplexReportHtml(isExcel = false) {
      if (!currentReportData) return '';
      const month = currentReportData.month;
      const year = currentReportData.year;
      const mode = currentReportData.mode;

      const isViewer = currentUser && (currentUser.role === 'Viewer' || currentUser.role === 'Publik');
      const isSensorName = isViewer || (document.getElementById('sensorPemasukan') ? document.getElementById('sensorPemasukan').checked : false);
      const isSensorUnit = isViewer || (document.getElementById('sensorUnit') ? document.getElementById('sensorUnit').checked : false);

      const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const periodStr = mode === 'bulanan' ? `${monthNames[month] || '-'} ${year || '-'}` : (mode === 'akumulasi' ? `Akumulasi Thn ${year || '-'}` : (currentReportData.customPeriod || 'Pencarian'));

      const groupedInc = {};
      let totalInc = 0; let totalExp = 0;
      const incByCat = {}; const expByDept = {};
      const saldoAwal = (currentReportData.summary && currentReportData.summary.saldoAwal) || 0;
      const saldoAwalJemaat = (currentReportData.summary && currentReportData.summary.saldoAwalJemaat) || 0;

      const txIn = [];
      if (currentReportData.incByCategory) {
        Object.values(currentReportData.incByCategory).forEach(arr => arr.forEach(x => {
          if (x.income_type !== 'Mutasi Kas / Setor Bank') txIn.push(x);
        }));
      }
      const txOut = [];
      if (currentReportData.expByDept) {
        Object.values(currentReportData.expByDept).forEach(arr => arr.forEach(x => {
          if (x.department !== 'Mutasi Kas / Setor Bank') txOut.push(x);
        }));
      }

      const allTx = [...txIn, ...txOut];
      const hasTransactions = allTx.length > 0;
      
      let gembalaApprovedAll = hasTransactions;
      let ketuaApprovedAll = hasTransactions;
      
      if (hasTransactions) {
        for (let i = 0; i < allTx.length; i++) {
          const x = allTx[i];
          const isAdminApp = x.approved_by && x.approved_by.includes('Admin');
          const isKetua = x.approved_by && x.approved_by.includes('Ketua Jemaat');
          const isPendeta = x.approved_by && x.approved_by.includes('Pendeta');
          if (!isAdminApp && !isPendeta) gembalaApprovedAll = false;
          if (!isAdminApp && !isKetua) ketuaApprovedAll = false;
        }
      }

      const isManualSignature = document.getElementById('manualSignature') ? document.getElementById('manualSignature').checked : false;
      const useBenImg = !isManualSignature && hasTransactions && systemConfig.sig_bendahara;
      const useKetuaImg = !isManualSignature && ketuaApprovedAll && systemConfig.sig_ketua;
      const useGembalaImg = !isManualSignature && gembalaApprovedAll && systemConfig.sig_pendeta;

      let totalIncJemaat = 0;
      let totalExpJemaat = 0;
      const incJemaatByCat = {};
      const expJemaatByDept = {};

      txIn.forEach(x => {
        const key = x.receipt_no ? x.receipt_no : (x.date + '|' + (x.nama_pemberi || 'Umum'));
        if (!groupedInc[key]) {
          groupedInc[key] = {
            tanggal: x.date,
            nama: x.unit_name && x.unit_name !== '-' ? x.unit_name : (x.nama_pemberi || '-'),
            hasUnit: !!(x.unit_name && x.unit_name !== '-'),
            kwitansi: x.receipt_no || '-',
            perpuluhan: 0,
            terpadu: 0,
            khususJemaat: 0,
            khususDaerah: 0,
            allocDaerah: 0,
            allocJemaat: 0,
            isPerorangan: false
          };
        }
        const t = x.income_type || 'Lain-Lain';
        const amt = parseFloat(x.amount) || 0;
        let amtJemaat = parseFloat(x.alloc_jemaat) || 0;

        const tLower = t.toLowerCase();
        const isSabat13 = tLower.includes('sabat') && tLower.includes('13');
        const isSabat = tLower.includes('sabat') && !tLower.includes('13');

        // FORCE STRICT MATH TO PREVENT DATA INCONSISTENCIES
        if (t === 'Perpuluhan' || t === 'Khusus Daerah' || isSabat13) {
          amtJemaat = 0;
        } else if (t === 'Terpadu' || isSabat) {
          amtJemaat = amt * 0.5;
        } else if (t !== 'Saldo Awal Sistem' && t !== 'Saldo Awal') {
          amtJemaat = amt; // Khusus Jemaat / Sumbangan / Others get 100%
        }

        if (t === 'Perpuluhan') { groupedInc[key].perpuluhan += amt; groupedInc[key].isPerorangan = true; }
        else if (t === 'Terpadu') { groupedInc[key].terpadu += amt; groupedInc[key].isPerorangan = true; }
        else if (isSabat) { groupedInc[key].terpadu += amt; }
        else if (t === 'Khusus Daerah' || isSabat13) groupedInc[key].khususDaerah += amt;
        else groupedInc[key].khususJemaat += amt;

        groupedInc[key].allocDaerah += parseFloat(x.alloc_daerah || 0);
        groupedInc[key].allocJemaat += amtJemaat;

        incByCat[t] = (incByCat[t] || 0) + amt;
        totalInc += amt;

        if (amtJemaat > 0 && t !== 'Saldo Awal Sistem' && t !== 'Saldo Awal') {
          const jCat = isSabat ? 'Terpadu' : t;
          incJemaatByCat[jCat] = (incJemaatByCat[jCat] || 0) + amtJemaat;
          totalIncJemaat += amtJemaat;
        }
      });

      txOut.forEach(x => {
        const isMutasi = x.department === 'Mutasi Kas / Setor Bank';
        let d = x.department || 'Lain-Lain';
        if (isMutasi) d = 'Mutasi Kas / Setor Bank (Pindah Buku)';
        const amt = parseFloat(x.amount || 0);
        expByDept[d] = (expByDept[d] || 0) + amt;
        if (!isMutasi) totalExp += amt;

        if (x.source_balance === 'Kas Jemaat') {
          expJemaatByDept[d] = (expJemaatByDept[d] || 0) + amt;
          if (!isMutasi) totalExpJemaat += amt;
        }
      });

      const topRows = [];
      const bottomRows = [];
      Object.values(groupedInc).forEach(g => {
        if (g.isPerorangan || isPrivateCategory(g.nama)) topRows.push(g);
        else bottomRows.push(g);
      });

      const sortFn = (a, b) => new Date(a.tanggal) - new Date(b.tanggal) || String(a.kwitansi || '').localeCompare(String(b.kwitansi || ''));
      topRows.sort(sortFn);
      bottomRows.sort(sortFn);

      const rightPanel = [];
      rightPanel.push({ label: 'Kas Jemaat Terakhir Bulan Sebelumnya', val: saldoAwalJemaat, bold: true, isColored: true });
      rightPanel.push({ label: 'PEMASUKAN', val: null, bold: true });

      const incOrder = ['Terpadu', 'Khusus Jemaat', 'Bunga Bank', 'Lain-Lain'];
      const seenInc = new Set();
      incOrder.forEach(k => {
        let v = incJemaatByCat[k] || 0;
        let displayK = k === 'Terpadu' ? 'Persembahan Terpadu' : k;
        if (k === 'Khusus Jemaat') displayK = 'Persembahan Khusus Kas Jemaat';
        if (v > 0 || incJemaatByCat[k] !== undefined) { rightPanel.push({ label: displayK, val: v, indent: true }); seenInc.add(k); }
      });
      Object.entries(incJemaatByCat).forEach(([k, v]) => {
        if (!seenInc.has(k)) rightPanel.push({ label: k, val: v, indent: true });
      });
      rightPanel.push({ label: 'Total Pemasukan', val: totalIncJemaat, bold: true, isColored: true });

      rightPanel.push({ label: 'PENGELUARAN', val: null, bold: true });
      Object.entries(expJemaatByDept).forEach(([k, v]) => rightPanel.push({ label: k, val: v, indent: true }));
      rightPanel.push({ label: 'Total Pengeluaran', val: totalExpJemaat, bold: true, isColored: true });

      const saldoAkhirJemaat = saldoAwalJemaat + totalIncJemaat - totalExpJemaat;
      
      const isUpToReportEnd = (dateStr) => {
        const d = new Date(dateStr);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        if (year !== 0 && y > year) return false;
        if (year !== 0 && y === year && month !== 0 && m > month) return false;
        return true;
      };

      const isMatchDate = (dateStr) => {
        const d = new Date(dateStr);
        if (mode === 'akumulasi') {
          if (year !== 0) {
            if (d.getFullYear() > year) return false;
            if (d.getFullYear() === year && month !== 0 && (d.getMonth() + 1) > month) return false;
          }
          return true;
        } else {
          if (year !== 0 && d.getFullYear() !== year) return false;
          if (month !== 0 && (d.getMonth() + 1) !== month) return false;
          return true;
        }
      };

      let calcBankJ = cachedSaldo.initJemaat || 0; let calcCashJ = 0;
      let calcBankD = cachedSaldo.initDaerah || 0; let calcCashD = 0;

      (cachedIncome || []).forEach(i => {
        if (!isUpToReportEnd(i.date)) return;
        const isCashInc = (i.note || '').includes('[CASH]');
        let amtJ = parseFloat(i.alloc_jemaat) || 0;
        let amtD = parseFloat(i.alloc_daerah) || 0;

        if (isMatchDate(i.date)) {
           const t = i.income_type || 'Lain-Lain';
           const amt = parseFloat(i.amount) || 0;
           const tLower = t.toLowerCase();
           const isSabat13 = tLower.includes('sabat') && tLower.includes('13');
           const isSabat = tLower.includes('sabat') && !tLower.includes('13');
           if (t === 'Perpuluhan' || t === 'Khusus Daerah' || isSabat13) {
             amtJ = 0; amtD = amt;
           } else if (t === 'Terpadu' || isSabat) {
             amtJ = amt * 0.5; amtD = amt * 0.5;
           } else if (t !== 'Saldo Awal Sistem' && t !== 'Saldo Awal' && !tLower.includes('pembangunan') && !(parseFloat(i.alloc_bangun)>0)) {
             amtJ = amt; amtD = 0;
           }
        }

        if (isCashInc) {
          calcCashD += amtD; calcCashJ += amtJ;
        } else {
          calcBankD += amtD; calcBankJ += amtJ;
        }
      });

      (cachedExpense || []).forEach(e => {
        if (!isUpToReportEnd(e.date)) return;
        const isMutasi = e.department === 'Mutasi Kas / Setor Bank';
        let srcBase = e.source_balance;
        if (srcBase === 'Kas Daerah (Bank)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [BANK]'; }
        if (srcBase === 'Kas Daerah (Di Tangan)') { srcBase = 'Daerah'; e.note = (e.note || '') + ' [CASH]'; }
        if (srcBase === 'Kas Jemaat (Bank)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [BANK]'; }
        if (srcBase === 'Kas Jemaat (Di Tangan)') { srcBase = 'Kas Jemaat'; e.note = (e.note || '') + ' [CASH]'; }

        const isCashExp = (e.note || '').includes('[CASH]');
        const amt = parseFloat(e.amount || 0);
        
        if (srcBase === 'Daerah') {
          if (!isMutasi) {
            if (isCashExp) calcCashD -= amt; else calcBankD -= amt;
          } else { calcCashD -= amt; calcBankD += amt; }
        }
        else if (srcBase === 'Kas Jemaat') {
          if (!isMutasi) {
            if (isCashExp) calcCashJ -= amt; else calcBankJ -= amt;
          } else { calcCashJ -= amt; calcBankJ += amt; }
        }
      });

      rightPanel.push({ label: 'Saldo Akhir Bulan ini', val: saldoAkhirJemaat, bold: true, isBorderTop: true, isColored: true });
      rightPanel.push({ label: 'Kas Pada Jemaat', val: saldoAkhirJemaat, indent: true });
      rightPanel.push({ label: 'CASH ON HAND / Tunai', val: calcCashJ, indent: true });
      rightPanel.push({ label: 'SALDO DI BANK', val: calcBankJ, indent: true });
      rightPanel.push({ label: '<span style="font-size:6.5pt;">Balance Saldo Kas Jemaat</span>', val: saldoAkhirJemaat, bold: true, large: true, isBorderTop: true, isColoredDark: true });

      // Tambahan info Uang Daerah
      rightPanel.push({ label: '', val: null }); // Spacer

      let sumPerpuluhan = 0;
      let sumTerpaduDaerah = 0;
      let sumKhususDaerah = 0;

      Object.entries(incByCat).forEach(([k, amt]) => {
        const cfg = getIncomeTypeConfig(k);
        let dAmt = 0;
        if (cfg) {
          dAmt = amt * (cfg.pct_daerah || 0) / 100;
        } else {
          const kLower = k.toLowerCase();
          const isSabat13 = kLower.includes('sabat') && kLower.includes('13');
          const isSabat = kLower.includes('sabat') && !kLower.includes('13');
          if (k === 'Khusus Daerah' || k === 'Perpuluhan' || isSabat13) {
            dAmt = amt;
          } else if (k === 'Terpadu' || isSabat) {
            dAmt = amt / 2;
          }
        }

        const kL = k.toLowerCase();
        if (kL.includes('perpuluhan')) {
          sumPerpuluhan += dAmt;
        } else if (kL.includes('terpadu') || (kL.includes('sabat') && !kL.includes('13'))) {
          sumTerpaduDaerah += dAmt;
        } else if (dAmt > 0) {
          sumKhususDaerah += dAmt;
        }
      });

      const sumPemasukanDaerah = sumPerpuluhan + sumTerpaduDaerah + sumKhususDaerah;

      const saldoAwalDaerah = saldoAwal - saldoAwalJemaat;
      let sumPengeluaranDaerah = 0;
      txOut.forEach(x => {
        if (x.source_balance === 'Daerah') sumPengeluaranDaerah += parseFloat(x.amount || 0);
      });
      const totalKewajiban = saldoAwalDaerah - sumPengeluaranDaerah;
      const saldoAkhirDaerah = totalKewajiban + sumPemasukanDaerah;

      rightPanel.push({ label: 'Saldo Awal Daerah', val: saldoAwalDaerah, indent: true, bold: true, isLightDaerah: true });
      rightPanel.push({ label: 'Pengeluaran Daerah', val: sumPengeluaranDaerah, indent: true, isLightDaerah: true });
      rightPanel.push({ label: 'Kewajiban ke Daerah Bulan Ini', val: totalKewajiban, bold: true, isLightDaerah: true });

      rightPanel.push({ label: 'Pemasukan Untuk Daerah Bulan Ini', val: sumPemasukanDaerah, indent: true, bold: true, isLightDaerah: true });
      rightPanel.push({ label: 'Perpuluhan', val: sumPerpuluhan, indent: true, isLightDaerah: true });
      rightPanel.push({ label: '50% Terpadu Daerah', val: sumTerpaduDaerah, indent: true, isLightDaerah: true });
      rightPanel.push({ label: 'Persembahan Khusus Daerah', val: sumKhususDaerah, indent: true, isLightDaerah: true });
      rightPanel.push({ label: 'Tunai Di Tangan (Daerah)', val: calcCashD, indent: true, isLightDaerah: true });
      rightPanel.push({ label: 'Saldo Bank (Daerah)', val: calcBankD, indent: true, isLightDaerah: true });
      rightPanel.push({ label: '<span style="font-size:6pt;">Total Uang Untuk Daerah</span>', val: saldoAkhirDaerah, bold: true, large: true, isBorderTop: true, isColoredDaerah: true });

      const imgBen = useBenImg ? `<img src="${systemConfig.sig_bendahara}" style="height:60px; object-fit:contain; margin:5px 0;">` : `<br><br><br><br><br>`;
      const imgKet = useKetuaImg ? `<img src="${systemConfig.sig_ketua}" style="height:60px; object-fit:contain; margin:5px 0;">` : `<br><br><br><br><br>`;
      const imgPen = useGembalaImg ? `<img src="${systemConfig.sig_pendeta}" style="height:60px; object-fit:contain; margin:5px 0;">` : `<br><br><br><br><br>`;

      const nameBen = systemConfig.sig_name_bendahara || 'Herbert JS Sagala';
      const titleBen = systemConfig.sig_title_bendahara || 'Bendahara Jemaat';
      const nameKet = systemConfig.sig_name_ketua || 'Yosep Santoso';
      const titleKet = systemConfig.sig_title_ketua || 'Ketua Jemaat';
      const namePen = systemConfig.sig_name_pendeta || 'Pdt. Joseph Sitohang';
      const titlePen = systemConfig.sig_title_pendeta || 'Gembala Jemaat';

      const signHtml = `
        <table style="width: 100%; margin-top: 40px; text-align: center; font-family: sans-serif; font-size: 10pt; color: #000; border: none; background: transparent;">
          <tr>
            <td style="width: 33%; border: none; vertical-align: bottom;">Dibuat Oleh,<br>${imgBen}<br><strong>${nameBen}</strong><br>${titleBen}</td>
            <td style="width: 33%; border: none; vertical-align: bottom;">Disahkan Oleh,<br>${imgKet}<br><strong>${nameKet}</strong><br>${titleKet}</td>
            <td style="width: 33%; border: none; vertical-align: bottom;">Mengetahui,<br>${imgPen}<br><strong>${namePen}</strong><br>${titlePen}</td>
          </tr>
        </table>
      `;

      const tableStyle = isExcel ? 'border-collapse: collapse; font-family: Calibri, sans-serif; font-size: 10pt;' : 'border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 6.5pt; table-layout: fixed; word-wrap: break-word;';
      const thStyle = isExcel ? 'border: 1px solid #000; padding: 4px; font-weight: bold; text-align: center; background-color: #e2e8f0;' : 'border: 1px solid #000; padding: 3px 1px; font-weight: bold; text-align: center; background-color: #e2e8f0; color: #000; font-size: 5.5pt; line-height: 1.1;';
      const tdStyle = isExcel ? 'border: 1px solid #000; padding: 4px;' : 'border: 1px solid #000; padding: 3px 2px; color: #000; vertical-align: middle;';
      const numStyle = isExcel ? "mso-number-format:'\\#\\,\\#\\#0'; text-align: right;" : 'text-align: right; white-space: nowrap;';

      let html = `
        <table style="${tableStyle}">
          <thead>
            <tr>
              <th colspan="17" style="border: none; background: white; padding-bottom: 20px;">
                <table style="width: 100%; border: none; margin: 0; color: #000; font-family: sans-serif;">
                  <tr>
                    <td style="width: 100px; border: none; text-align: left; vertical-align: middle; padding: 0;">
                      <img src="data:image/png;base64,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" style="width: 80px; height: auto;" alt="Logo Kiri" />
                    </td>
                    <td style="border: none; text-align: center; vertical-align: middle; padding: 0;">
                      <h2 style="margin:0; font-size: 14pt; font-weight: bold;">DAERAH SUMATERA KAWASAN TENGAH</h2>
                      <h3 style="margin:5px 0 0 0; font-size: 12pt;">LAPORAN KEUANGAN JEMAAT</h3>
                      <p style="margin:5px 0 0 0; font-size: 10pt;">Nama Jemaat: <strong>PISGAH - BISDAC</strong></p>
                      <p style="margin:5px 0 0 0; font-size: 10pt;">Bulan/Tahun: <strong>${periodStr}</strong></p>
                    </td>
                    <td style="width: 100px; border: none; text-align: right; vertical-align: middle; padding: 0;">
                      <img src="./icons/PisgahColor.png" style="width: 80px; height: auto;" alt="Logo Kanan" />
                    </td>
                  </tr>
                </table>
              </th>
            </tr>
            <tr>
              <th colspan="8" style="${thStyle}">RINGKASAN</th>
              <th colspan="4" style="${thStyle}">UANG DAERAH</th>
              <th colspan="3" style="${thStyle}">UANG JEMAAT</th>
              <th colspan="2" style="${thStyle}">LAPORAN KEUANGAN</th>
            </tr>
            <tr>
              <th style="${thStyle} width: 2%;">No</th>
              <th style="${thStyle} width: 4.5%;">Tanggal</th>
              <th style="${thStyle} width: 9.5%;">Nama Unit Pemberi /<br>Perpuluhan & Terpadu</th>
              <th style="${thStyle} width: 4.5%;">Nomor<br>Kwitansi</th>
              <th style="${thStyle} width: 5.5%;">Perpuluhan</th>
              <th style="${thStyle} width: 5.5%;">Persembahan<br>Terpadu</th>
              <th style="${thStyle} width: 5.5%;">Persembahan Khusus<br>Kas Jemaat</th>
              <th style="${thStyle} width: 6%;">TOTAL<br>Receipt</th>
              <th style="${thStyle} width: 5.5%;">Perpuluhan</th>
              <th style="${thStyle} width: 5.5%;">50% Terpadu<br>Daerah</th>
              <th style="${thStyle} width: 5.5%;">Persembahan<br>Khusus</th>
              <th style="${thStyle} width: 6%;">Jumlah Uang<br>Daerah</th>
              <th style="${thStyle} width: 5.5%;">50% Terpadu<br>Jemaat</th>
              <th style="${thStyle} width: 5.5%;">Persembahan Khusus<br>Kas Jemaat</th>
              <th style="${thStyle} width: 6%;">Jumlah Uang<br>Jemaat</th>
              <th style="${thStyle} width: 11%;">Pemasukan &<br>Pengeluaran Jemaat</th>
              <th style="${thStyle} width: 6.5%;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
      `;

      let sumTop = { p: 0, t: 0, k: 0, tot: 0, d_p: 0, d_t: 0, d_k: 0, d_tot: 0, j_t: 0, j_k: 0, j_tot: 0 };
      let sumBot = { p: 0, t: 0, k: 0, tot: 0, d_p: 0, d_t: 0, d_k: 0, d_tot: 0, j_t: 0, j_k: 0, j_tot: 0 };

      let rightIdx = 0;

      const renderRow = (isTop, data, rowNum) => {
        let isLabel = (typeof data === 'string' || !data);
        let p = 0, t = 0, k = 0, tot = 0, dp = 0, dt = 0, dk = 0, dtot = 0, jt = 0, jk = 0, jtot = 0;
        let c1 = '', c2 = '', c3 = '', c4 = '';

        if (data && !isLabel) {
          p = data.perpuluhan; t = data.terpadu; k = data.khususJemaat;
          tot = p + t + k + data.khususDaerah;

          dp = data.allocDaerah || 0;
          if (dp === 0) { dp = p + (t * 0.5) + data.khususDaerah; }
          dtot = dp;

          const s = isTop ? sumTop : sumBot;
          s.p += p; s.t += t; s.k += k; s.tot += tot;
          s.d_p += p; s.d_t += (t * 0.5); s.d_k += data.khususDaerah; s.d_tot += (p + (t * 0.5) + data.khususDaerah);
          s.j_t += (t * 0.5); s.j_k += k; s.j_tot += ((t * 0.5) + k);

          const isPrivCategory = isPrivateCategory(data.nama);
          let dNama = data.nama;
          if (isPrivCategory) {
            dNama = '*** (Privasi)';
          } else if (isTop && data.hasUnit && isSensorUnit) {
            dNama = 'Unit *** (Privasi)';
          } else if (isTop && !data.hasUnit && isSensorName) {
            dNama = '*** (Privasi)';
          }

          c1 = rowNum; c2 = fmtDate(data.tanggal); c3 = dNama; c4 = data.kwitansi;
        } else if (data === 'label_top') {
          c3 = 'PERPULUHAN & TERPADU';
        } else if (data === 'label_bot') {
          c3 = 'PERSEMBAHAN & KHUSUS';
        } else if (data === 'label_total') {
          c3 = 'TOTAL';
        }

        const fmtEx = (n) => n === 0 ? '-' : (isExcel ? n : fmt(n));
        let bStyle = '';
        let totBg = '#f9fafb';
        if (data === 'label_total') {
          bStyle = 'font-weight:bold; background-color:#ffd966;';
          totBg = '#ffd966';
        } else if (isLabel) {
          bStyle = 'font-weight:bold; background-color:#f3f4f6;';
          totBg = '#f3f4f6';
        }

        let out_dp = '-', out_dt = '-', out_dk = '-', out_dtot = '-', out_jt = '-', out_jk = '-', out_jtot = '-';
        if (data && !isLabel) {
          out_dp = fmtEx(data.perpuluhan); out_dt = fmtEx(data.terpadu * 0.5); out_dk = fmtEx(data.khususDaerah); out_dtot = fmtEx(data.perpuluhan + data.terpadu * 0.5 + data.khususDaerah);
          out_jt = fmtEx(data.terpadu * 0.5); out_jk = fmtEx(data.khususJemaat); out_jtot = fmtEx(data.terpadu * 0.5 + data.khususJemaat);
        } else if (data === 'label_total') {
          const s = sumTop; const sb = sumBot;
          out_dp = fmtEx(s.d_p + sb.d_p); out_dt = fmtEx(s.d_t + sb.d_t); out_dk = fmtEx(s.d_k + sb.d_k); out_dtot = fmtEx(s.d_tot + sb.d_tot);
          out_jt = fmtEx(s.j_t + sb.j_t); out_jk = fmtEx(s.j_k + sb.j_k); out_jtot = fmtEx(s.j_tot + sb.j_tot);
          p = s.p + sb.p; t = s.t + sb.t; k = s.k + sb.k; tot = s.tot + sb.tot;
        }

        html += `<tr>
          <td style="${tdStyle} ${bStyle} text-align:center;">${c1}</td>
          <td style="${tdStyle} ${bStyle} white-space:nowrap;">${c2}</td>
          <td style="${tdStyle} ${bStyle}">${c3}</td>
          <td style="${tdStyle} ${bStyle} mso-number-format:'\\@';">${c4}</td>
          <td style="${tdStyle} ${numStyle} ${bStyle}">${(data === 'label_top' || data === 'label_bot') ? '' : fmtEx(p)}</td>
          <td style="${tdStyle} ${numStyle} ${bStyle}">${(data === 'label_top' || data === 'label_bot') ? '' : fmtEx(t)}</td>
          <td style="${tdStyle} ${numStyle} ${bStyle}">${(data === 'label_top' || data === 'label_bot') ? '' : fmtEx(k)}</td>
          <td style="${tdStyle} ${numStyle} font-weight:bold; background-color:${totBg};">${(data === 'label_top' || data === 'label_bot') ? '' : fmtEx(tot)}</td>
          
          <td style="${tdStyle} ${numStyle} ${bStyle}">${(data === 'label_top' || data === 'label_bot') ? '' : out_dp}</td>
          <td style="${tdStyle} ${numStyle} ${bStyle}">${(data === 'label_top' || data === 'label_bot') ? '' : out_dt}</td>
          <td style="${tdStyle} ${numStyle} ${bStyle}">${(data === 'label_top' || data === 'label_bot') ? '' : out_dk}</td>
          <td style="${tdStyle} ${numStyle} font-weight:bold; background-color:${totBg};">${(data === 'label_top' || data === 'label_bot') ? '' : out_dtot}</td>
          
          <td style="${tdStyle} ${numStyle} ${bStyle}">${(data === 'label_top' || data === 'label_bot') ? '' : out_jt}</td>
          <td style="${tdStyle} ${numStyle} ${bStyle}">${(data === 'label_top' || data === 'label_bot') ? '' : out_jk}</td>
          <td style="${tdStyle} ${numStyle} font-weight:bold; background-color:${totBg};">${(data === 'label_top' || data === 'label_bot') ? '' : out_jtot}</td>
        `;

        if (rightIdx < rightPanel.length) {
          const rp = rightPanel[rightIdx];
          const b = rp.bold ? 'font-weight:bold;' : '';
          const l = rp.large ? 'font-size:8pt;' : '';
          const i = rp.indent ? 'padding-left:20px;' : '';
          const bt = rp.isBorderTop ? 'border-top: 2px solid #000;' : '';
          let bg = '';
          if (rp.isColored) bg = 'background-color:#ffd966;';
          else if (rp.isColoredDark) bg = 'background-color:#f1c232;'; // Darker yellow/gold
          else if (rp.isColoredDaerah) bg = 'background-color:#ff9800; color:#000;';
          else if (rp.isLightDaerah) bg = 'background-color:#ffe0b2; color:#000;';

          const v = rp.val !== null ? fmtEx(rp.val) : '';
          html += `
            <td style="${tdStyle} ${b} ${l} ${i} ${bt} ${bg}">${rp.label}</td>
            <td style="${tdStyle} ${numStyle} ${b} ${l} ${bt} ${bg}">${v}</td>
          </tr>`;
        } else {
          html += `
            <td style="${tdStyle}"></td>
            <td style="${tdStyle}"></td>
          </tr>`;
        }
        rightIdx++;
      };

      renderRow(true, 'label_top', '');
      topRows.forEach((r, i) => renderRow(true, r, i + 1));

      renderRow(false, 'label_bot', '');
      bottomRows.forEach((r, i) => renderRow(false, r, i + 1));

      renderRow(false, 'label_total', '');

      while (rightIdx < rightPanel.length) {
        renderRow(false, null, '');
      }

      html += `</tbody></table>`;

      // SIGNATURE FOR MAIN REPORT
      html += signHtml;

      // --- EXPENSES TABLE ---
      html += `
        <table style="${tableStyle} margin-top: 30px; page-break-before: always;">
          <thead>
            <tr>
              <th colspan="7" style="border: none; padding-bottom: 15px; color: #000; font-family: sans-serif; text-align: center;">
                <h3 style="margin:0; font-size: 11pt; text-align: center;">LAMPIRAN: RINCIAN PENGELUARAN JEMAAT & DAERAH</h3>
              </th>
            </tr>
            <tr>
              <th style="${thStyle} width: 4%;">No</th>
              <th style="${thStyle} width: 10%;">Tanggal</th>
              <th style="${thStyle} width: 12%;">No Bukti</th>
              <th style="${thStyle} width: 14%;">Sumber Kas</th>
              <th style="${thStyle} width: 16%;">Bagian / Dept</th>
              <th style="${thStyle} width: 30%;">Keterangan</th>
              <th style="${thStyle} width: 14%;">Nominal</th>
            </tr>
          </thead>
          <tbody>
      `;
      txOut.sort((a, b) => {
        const sA = (a.source_balance || '').toLowerCase();
        const sB = (b.source_balance || '').toLowerCase();
        if (sA < sB) return -1;
        if (sA > sB) return 1;
        return new Date(a.date) - new Date(b.date);
      });

      if (txOut.length === 0) {
        html += `<tr><td colspan="7" style="${tdStyle} text-align:center;">Tidak ada pengeluaran pada periode ini.</td></tr>`;
      } else {
        let grandExp = 0;
        let currentSource = null;
        let currentSourceTotal = 0;
        let rowIdx = 1;

        txOut.forEach((x, i) => {
          const s = x.source_balance || '-';

          if (currentSource !== null && currentSource !== s) {
            html += `<tr>
              <td colspan="6" style="${tdStyle} text-align:right; font-weight:bold; background-color:#f3f4f6;">Subtotal ${currentSource}</td>
              <td style="${tdStyle} ${numStyle} font-weight:bold; background-color:#f3f4f6;">${isExcel ? currentSourceTotal : fmt(currentSourceTotal)}</td>
            </tr>`;
            currentSourceTotal = 0;
          }
          currentSource = s;

          const amt = parseFloat(x.amount || 0);
          grandExp += amt;
          currentSourceTotal += amt;

          const dDept = x.department || '-';
          const dNote = x.note || '-';

          html += `<tr>
            <td style="${tdStyle} text-align:center;">${rowIdx++}</td>
            <td style="${tdStyle} text-align:center;">${fmtDate(x.date)}</td>
            <td style="${tdStyle} mso-number-format:'\\@';">${x.receipt_no || '-'}</td>
            <td style="${tdStyle}">${x.source_balance || '-'}</td>
            <td style="${tdStyle}">${dDept}</td>
            <td style="${tdStyle}">${dNote}</td>
            <td style="${tdStyle} ${numStyle}">${isExcel ? amt : fmt(amt)}</td>
          </tr>`;
        });

        if (currentSource !== null) {
          html += `<tr>
            <td colspan="6" style="${tdStyle} text-align:right; font-weight:bold; background-color:#f3f4f6;">Subtotal ${currentSource}</td>
            <td style="${tdStyle} ${numStyle} font-weight:bold; background-color:#f3f4f6;">${isExcel ? currentSourceTotal : fmt(currentSourceTotal)}</td>
          </tr>`;
        }

        html += `<tr>
          <td colspan="6" style="${tdStyle} text-align:right; font-weight:bold; background-color:#ffd966;">TOTAL PENGELUARAN</td>
          <td style="${tdStyle} ${numStyle} font-weight:bold; background-color:#ffd966;">${isExcel ? grandExp : fmt(grandExp)}</td>
        </tr>`;
      }
      html += `</tbody></table>`;

      // SIGNATURE FOR EXPENSES
      html += signHtml;

      return html;
    }

    function doPrintReport() {
      try {
        if (!currentReportData || (!currentReportData.incByCategory && !currentReportData.expByDept)) {
          return notify('Laporan kosong. Buat laporan terlebih dahulu.', 'error');
        }
        const html = generateComplexReportHtml(false);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const baseUrl = window.location.origin + window.location.pathname;
        iframe.contentDocument.write(`<html><head><base href="${baseUrl}"><title>Laporan Keuangan</title><style>@page { size: landscape; margin: 1cm; } @media print { body { margin: 0; } }</style></head><body onload="setTimeout(function(){ window.focus(); window.print(); }, 800)">${html}</body></html>`);
        iframe.contentDocument.close();

        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 15000);
      } catch (e) {
        console.error('doPrintReport error:', e);
        notify('Error cetak PDF: ' + e.message, 'error');
        alert('Error cetak PDF: ' + e.message + '\n\nStack: ' + e.stack);
      }
    }

    function exportToExcel() {
      try {
        if (!currentReportData || (!currentReportData.incByCategory && !currentReportData.expByDept)) {
          return notify('Laporan kosong. Buat laporan terlebih dahulu.', 'error');
        }

        const tableHtml = generateComplexReportHtml(true);

        const html = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="utf-8">
          </head>
          <body style="background-color: white;">
            ${tableHtml}
          </body>
          </html>
        `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laporan_Keuangan_Jemaat_${document.getElementById('rptMonth').value}_${document.getElementById('rptYear').value}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        notify('Export Excel berhasil.', 'success');
      } catch (e) {
        console.error('exportToExcel error:', e);
        notify('Error export Excel: ' + e.message, 'error');
        alert('Error export Excel: ' + e.message + '\n\nStack: ' + e.stack);
      }
    }

    function exportHistoryExcel() {
      try {
        if (!window.currentHistoryData || window.currentHistoryData.length === 0) {
          return notify('Data histori kosong.', 'error');
        }

        let tableHtml = `
          <table border="1" style="border-collapse: collapse; font-family: Calibri, sans-serif; font-size: 10pt;">
            <thead>
              <tr style="background-color: #e2e8f0; font-weight: bold; text-align: center;">
                <th style="padding: 4px;">Tanggal</th>
                <th style="padding: 4px;">Alur</th>
                <th style="padding: 4px;">Kategori / Dept</th>
                <th style="padding: 4px;">Keterangan / Catatan</th>
                <th style="padding: 4px;">Nomor Bukti</th>
                <th style="padding: 4px;">Pihak Terkait</th>
                <th style="padding: 4px;">Nominal</th>
              </tr>
            </thead>
            <tbody>
        `;

        const userUnits = getUserUnits();
        const perms = getRolePerms(currentUser?.role || '');
        const isViewer = perms.isAnonymous || (currentUser && (currentUser.role === 'Viewer' || currentUser.role === 'Publik'));
        const isAnon = perms.isAnonymous;

        window.currentHistoryData.forEach(x => {
          if (x.department === 'Mutasi Kas / Setor Bank' || x.income_type === 'Mutasi Kas / Setor Bank') return;
          const txUnitLower = String(x.unit_name || '').toLowerCase().trim();
          const belongsToUserUnits = userUnits.some(u => String(u).toLowerCase().trim() === txUnitLower);

          let hasMembers = false;
          if (masterData && masterData.units) {
            const uData = masterData.units.find(u => String(u.name).toLowerCase().trim() === txUnitLower);
            if (uData && parseInt(uData.jumlah_anggota || 0) > 0) hasMembers = true;
          }
          const isExpense = x.type === 'expense';
          const incType = String(x.income_type || '').toLowerCase();
          const isTransparentInc = x.type === 'income' && (incType.includes('sabat') || incType.includes('rabu malam') || incType.includes('pembangunan')) && !hasMembers;
          const isTransparent = isExpense || isTransparentInc;

          const isPrivCategory = isViewer && x.type === 'income' && isPrivateCategory(x.income_type);
          const isOtherUnit = userUnits.length > 0 && x.type === 'income' && !belongsToUserUnits;

          let shouldHide = !belongsToUserUnits && (isAnon || isOtherUnit || isPrivCategory);
          if (isTransparent) shouldHide = false;

          const isInc = x.type === 'income';
          const tgl = fmtDate(x.date);
          const alur = isInc ? 'Pemasukan' : 'Pengeluaran';
          const ket = x.income_type || x.department || '';
          const note = shouldHide ? '***' : (x.note || '');
          const bukti = x.receipt_no || '';
          const pihakRaw = isInc ? (x.nama_pemberi || '') : (x.nama_penerima || '');
          const pihak = shouldHide ? '***' : pihakRaw;
          const nominal = x.amount || 0;

          tableHtml += `
            <tr>
              <td style="padding: 4px;">${tgl}</td>
              <td style="padding: 4px;">${alur}</td>
              <td style="padding: 4px;">${ket}</td>
              <td style="padding: 4px;">${note}</td>
              <td style="padding: 4px; mso-number-format:'\\@';">${bukti}</td>
              <td style="padding: 4px;">${pihak}</td>
              <td style="padding: 4px; text-align: right; mso-number-format:'\\#\\,\\#\\#0';">${nominal}</td>
            </tr>
          `;
        });

        tableHtml += `</tbody></table>`;

        const html = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head><meta charset="utf-8"></head>
          <body style="background-color: white;">${tableHtml}</body>
          </html>
        `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const now = new Date();
        a.download = `Histori_Transaksi_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xls`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        notify('Export Excel histori berhasil.', 'success');
      } catch (e) {
        console.error('exportHistoryExcel error:', e);
        notify('Error export Excel: ' + e.message, 'error');
      }
    }

    function applyReportSensor() {
      if (currentReportData) renderReportView();
    }

    function openClosingModal() {
      const modal = document.getElementById('closingMonthModal');
      const mSel = document.getElementById('closingMonthSelect');
      const yInp = document.getElementById('closingYearInput');

      const d = new Date();
      mSel.value = d.getMonth() + 1;
      yInp.value = d.getFullYear();

      if (currentReportData && currentReportData.month > 0 && currentReportData.year > 0) {
        mSel.value = currentReportData.month;
        yInp.value = currentReportData.year;
      }

      updateClosingModalStatus();
      modal.style.display = 'flex';
    }

    function closeClosingModal() {
      document.getElementById('closingMonthModal').style.display = 'none';
    }

    function updateClosingModalStatus() {
      const month = document.getElementById('closingMonthSelect').value;
      const year = document.getElementById('closingYearInput').value;
      const key = `closed_${year}_${month}`;
      const isClosed = String(systemConfig[key]) === 'true';

      const statusEl = document.getElementById('closingModalStatus');
      const btn = document.getElementById('btnToggleClosingModal');

      if (isClosed) {
        statusEl.innerHTML = '<span style="color:var(--red-pop);">Terkunci (Ditutup)</span>';
        btn.textContent = 'Buka Buku';
        btn.className = 'btn btn-outline';
      } else {
        statusEl.innerHTML = '<span style="color:var(--green-pop);">Terbuka (Bisa Diedit)</span>';
        btn.textContent = 'Tutup Buku';
        btn.className = 'btn btn-danger';
      }
    }

    async function toggleCloseMonthFromModal() {
      const month = document.getElementById('closingMonthSelect').value;
      const year = document.getElementById('closingYearInput').value;
      const key = `closed_${year}_${month}`;
      const isClosed = String(systemConfig[key]) === 'true';

      const mNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const monthName = mNames[parseInt(month)];

      const msg = isClosed
        ? `Buka kembali buku bulan ${monthName} ${year}?`
        : `Tutup buku bulan ${monthName} ${year}? Setelah ditutup, transaksi pada bulan ini tidak bisa ditambah, diedit, atau dihapus.`;

      if (await showCustomConfirm(isClosed ? 'Buka Buku' : 'Tutup Buku', msg)) {
        const newVal = isClosed ? 'false' : 'true';
        systemConfig[key] = newVal;
        localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
        try {
          await apiPostWithFallback('saveConfig', { key: key, value: newVal });
          notify(`Bulan ${monthName} ${year} berhasil ${isClosed ? 'dibuka' : 'ditutup'}.`, 'success');
          updateClosingModalStatus();
          if (currentReportData) renderReportView(); // update background if open
        } catch (e) {
          notify('Gagal menyimpan status tutup buku: ' + e.message, 'error');
        }
      }
    }

    function checkMonthClosed(month, year) {
      if (!month || !year) return false;
      return String(systemConfig[`closed_${year}_${month}`]) === 'true';
    }

    function renderReportView() {
      const data = currentReportData; if (!data) return notify('Tidak ada data laporan aktif.', 'error');
      const s = data.summary; const bal = s.balances || cachedSaldo || { total: 0 };
      const isViewer = getRolePerms(currentUser?.role || '').isAnonymous || (currentUser && (currentUser.role === 'Viewer' || currentUser.role === 'Publik'));

      const rolePerms = currentUser ? getRolePerms(currentUser.role) : null;
      const canApprove = rolePerms && rolePerms.menus && rolePerms.menus.riwayat && rolePerms.menus.riwayat.approve;
      const isApprover = currentUser && (canApprove || currentUser.role === 'Admin');

      const mNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      const isSensor = document.getElementById('sensorPemasukan') ? document.getElementById('sensorPemasukan').checked : false;

      const btnManage = document.getElementById('btnManageClosing');
      if (btnManage) {
        if (currentUser && currentUser.role === 'Admin') {
          btnManage.style.display = 'inline-block';
        } else {
          btnManage.style.display = 'none';
        }
      }

      const title = data.customTitle || "FINANCIAL REPORT";
      let periodStr = data.customPeriod || `Period: ${mNames[data.month] || ''} ${data.year || ''}`.trim();
      if (!data.customPeriod && data.mode === 'akumulasi') {
        periodStr = `As per: ${mNames[data.month] || ''} ${data.year || ''}`.trim();
        if (data.month === 0) periodStr = `As per: Akhir Tahun ${data.year || ''}`.trim();
      }

      let html = `
    <div class="card" style="margin-top:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <div>
          <h2 style="font-size:24px; color:var(--text); font-weight:800; letter-spacing:-0.5px;">${title}</h2>
          <p style="color:var(--text3); font-size:14px; font-weight:500;">${periodStr}</p>
        </div>
      </div>
      <div class="report-summary">
        <div class="report-card"><div class="report-card-label">Saldo Awal</div><div class="report-card-val amount-pos" style="color:var(--text)">${fmt(s.saldoAwal || 0)}</div></div>
        <div class="report-card"><div class="report-card-label">Income Periode</div><div class="report-card-val amount-pos">+${fmt(s.periodIncome !== undefined ? s.periodIncome : s.totalIncome)}</div></div>
        <div class="report-card"><div class="report-card-label">Expense Periode</div><div class="report-card-val amount-neg">-${fmt(s.totalExpense)}</div></div>
        <div class="report-card"><div class="report-card-label">Net Balance</div><div class="report-card-val ${s.netBalance >= 0 ? 'amount-pos' : 'amount-neg'}">${fmt(s.netBalance)}</div></div>
        <div class="report-card no-print"><div class="report-card-label">Total Assets</div><div class="report-card-val" style="color:var(--teal-pop)">${fmt(bal.total)}</div></div>
      </div>
    </div>
  `;

      html += `<div class="card"><div class="form-section-title">A. Detail Pemasukan</div>`;
      if (Object.keys(data.incByCategory || {}).length === 0) html += '<div class="empty-state">Kosong</div>';
      else {
        Object.entries(data.incByCategory).forEach(([category, items]) => {
          const isPrivCategory = isViewer && isPrivateCategory(category);
          const tot = items.reduce((sum, x) => sum + x.amount, 0);
          const desktopHtml = `<table class="table-report">
              <thead><tr><th class="fit-col">Tanggal</th><th>Pemberi</th><th class="fit-col">Ref</th><th>Keterangan</th><th class="fit-col" style="text-align:right">Subtotal</th></tr></thead>
              <tbody>
                ${items.map(x => {
            const isMasked = isPrivCategory || isSensor;
            const displayNote = isMasked ? '*** (Privasi)' : (x.note || '-');
            let rawPemberi = (x.nama_pemberi && x.nama_pemberi !== '-' && x.nama_pemberi !== 'Umum') ? x.nama_pemberi : (x.unit_name || '-');
            const photoBtn = getPhotoBtnIcon(x, isMasked && !isApprover);
            return `<tr><td class="fit-col">${fmtDate(x.date)}</td><td>${isMasked ? '***' : rawPemberi}</td><td class="fit-col"><span style="font-family:monospace">${x.receipt_no}</span>${photoBtn}</td><td>${displayNote}</td><td class="fit-col amount-pos" style="text-align:right">${fmt(x.amount)}</td></tr>`
          }).join('')}
              </tbody>
            </table>`;

          const mobileHtml = `<div class="dash-detail-list" style="display:flex; flex-direction:column;">${items.map(x => {
            const isMasked = isPrivCategory || isSensor;
            const displayNote = isMasked ? '*** (Privasi)' : (x.note || '-');
            let rawPemberi = (x.nama_pemberi && x.nama_pemberi !== '-' && x.nama_pemberi !== 'Umum') ? x.nama_pemberi : (x.unit_name || '-');
            let photoBtn = '';
            photoBtn = getPhotoBtnText(x, isMasked && !isApprover);
            return `<div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
                <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                  <span class="badge badge-green" style="font-size:10px; padding:2px 7px;">IN</span>
                  <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no || '-'}</span>
                </div>
                <div class="amount-pos" style="font-weight: 700; font-size: 15px; white-space:nowrap;">+${fmt(x.amount)}</div>
              </div>
              <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
                <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
                <span style="color:var(--text4)">Pemberi</span><strong style="color:var(--text); font-weight:600; overflow:hidden; text-overflow:ellipsis;">${isMasked ? '***' : rawPemberi}</strong>
                <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${displayNote}</span>
              </div>
              ${photoBtn}
            </div>`;
          }).join('')}</div>`;

          html += `
        <div style="margin-bottom:24px">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--glass-border); padding-bottom:8px; margin-bottom:12px; page-break-after: avoid; break-after: avoid;">
            <strong style="color:var(--text)">${category}</strong><strong class="amount-pos">${fmt(tot)}</strong>
          </div>
          <div class="desktop-only table-wrap scrollable" style="border:none;">${desktopHtml}</div>
          <div class="mobile-only">${mobileHtml}</div>
        </div>`;
        });
      }
      html += '</div><div class="card"><div class="form-section-title">B. Detail Pengeluaran</div>';
      if (Object.keys(data.expByDept || {}).length === 0) html += '<div class="empty-state">Kosong</div>';
      else {
        Object.entries(data.expByDept).forEach(([dept, items]) => {
          const tot = items.reduce((sum, x) => sum + x.amount, 0);
          const desktopHtml = `<table class="table-report">
              <thead><tr><th class="fit-col">Tanggal</th><th class="fit-col">Sumber Kas</th><th class="fit-col">Ref</th><th>Keperluan</th><th class="fit-col" style="text-align:right">Subtotal</th></tr></thead>
              <tbody>
                ${items.map(x => `<tr><td class="fit-col">${fmtDate(x.date)}</td><td class="fit-col"><span class="badge badge-gold">${x.source_balance}</span></td><td class="fit-col"><span style="font-family:monospace">${x.receipt_no}</span>${getPhotoBtnIcon(x)}</td><td>${x.note || '-'}${x.nama_penerima ? `<br><small style="color:var(--text3)">Penerima: ${x.nama_penerima}</small>` : ''}</td><td class="fit-col amount-neg" style="text-align:right">-${fmt(x.amount)}</td></tr>`).join('')}
              </tbody>
            </table>`;

          const mobileHtml = `<div class="dash-detail-list" style="display:flex; flex-direction:column;">${items.map(x => {
            let photoBtn = '';
            photoBtn = getPhotoBtnText(x);
            return `<div class="dash-tx-card" style="margin: 0 0 16px 0; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
                <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                  <span class="badge badge-red" style="font-size:10px; padding:2px 7px;">OUT</span>
                  <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no || '-'}</span>
                </div>
                <div class="amount-neg" style="font-weight: 700; font-size: 15px; white-space:nowrap;">-${fmt(x.amount)}</div>
              </div>
              <div style="display:grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: 11px; color: var(--text2);">
                <span style="color:var(--text4)">Tgl</span><strong style="color:var(--text); font-weight:600;">${fmtDate(x.date)}</strong>
                <span style="color:var(--text4)">Sumber</span><strong style="color:var(--accent-gold, var(--gold)); font-weight:600; overflow:hidden; text-overflow:ellipsis;">${x.source_balance}</strong>
                <span style="color:var(--text4)">Penerima</span><strong style="color:var(--text); font-weight:600; overflow:hidden; text-overflow:ellipsis;">${x.nama_penerima || '-'}</strong>
                <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${x.note || '-'}</span>
              </div>
              ${photoBtn}
            </div>`;
          }).join('')}</div>`;

          html += `
        <div style="margin-bottom:24px">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--glass-border); padding-bottom:8px; margin-bottom:12px; page-break-after: avoid; break-after: avoid;">
            <strong style="color:var(--text)">${dept}</strong><strong class="amount-neg">-${fmt(tot)}</strong>
          </div>
          <div class="desktop-only table-wrap scrollable" style="border:none;">${desktopHtml}</div>
          <div class="mobile-only">${mobileHtml}</div>
        </div>`;
        });
      }
      document.getElementById('reportContent').innerHTML = html + '</div>';
    }

    let historySortCol = 'date';
    let historySortDesc = true;
    function toggleSortHistory(col) {
      if (historySortCol === col) {
        historySortDesc = !historySortDesc;
      } else {
        historySortCol = col;
        historySortDesc = true;
      }
      renderHistory();
    }

    function renderHistory() {
      const q = document.getElementById('searchTrans').value.toLowerCase();
      const type = document.getElementById('filterType').value; const month = parseInt(document.getElementById('filterMonth')?.value || 0); const year = parseInt(document.getElementById('filterYear')?.value || 0);
      const filterApproval = document.getElementById('filterApproval')?.value || '';

      let list = [];
      if (type !== 'expense') (cachedIncome || []).forEach(x => list.push({ ...x, type: 'income', badge: 'badge-green', label: 'In', style: 'amount-pos', sign: '+' }));
      if (type !== 'income') (cachedExpense || []).forEach(x => list.push({ ...x, type: 'expense', badge: 'badge-red', label: 'Out', style: 'amount-neg', sign: '-' }));

      list = list.filter(x => {
        const d = new Date(x.date);
        if (year !== 0 && d.getFullYear() !== year) return false;
        if (month !== 0 && (d.getMonth() + 1) !== month) return false;

        if (filterApproval) {
          const isAdminApp = x.approved_by && x.approved_by.includes('Admin');
          const isKetua = x.approved_by && x.approved_by.includes('Ketua Jemaat');
          const isPendeta = x.approved_by && x.approved_by.includes('Pendeta');
          const isApproved = isAdminApp || (isKetua && isPendeta);
          if (filterApproval === 'pending' && isApproved) return false;
          if (filterApproval === 'approved' && !isApproved) return false;
        }

        const canSearchNames = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Bendahara');

        if (q) {
          let m = false;
          if (String(x.receipt_no || '').toLowerCase().includes(q)) m = true;
          if (String(x.note || '').toLowerCase().includes(q)) m = true;
          if (String(x.income_type || '').toLowerCase().includes(q)) m = true;
          if (String(x.department || '').toLowerCase().includes(q)) m = true;
          if (String(x.amount || '').includes(q)) m = true;
          if (String(x.unit_name || '').toLowerCase().includes(q)) m = true;
          if (masterData && masterData.units) {
            const matchedUnitNames = masterData.units.filter(u => String(u.id || '').toLowerCase().includes(q)).map(u => String(u.name).toLowerCase());
            if (matchedUnitNames.includes(String(x.unit_name || '').toLowerCase())) m = true;
          }
          if (canSearchNames) {
            if (String(x.nama_pemberi || '').toLowerCase().includes(q)) m = true;
            if (String(x.nama_penerima || '').toLowerCase().includes(q)) m = true;
          }
          if (!m) return false;
        }

        const userUnits = getUserUnits();
        if (myUnitFilterActive && userUnits.length > 0) {
          if (!userUnits.includes(x.unit_name)) return false;
        }

        return true;
      });

      list = groupTransactions(list);

      list.sort((a, b) => {
        let valA, valB;
        if (historySortCol === 'date') {
          valA = new Date(a.date).getTime(); valB = new Date(b.date).getTime();
        } else if (historySortCol === 'type') {
          valA = a.type; valB = b.type;
        } else if (historySortCol === 'category') {
          valA = String(a.income_type || a.department || '').toLowerCase(); valB = String(b.income_type || b.department || '').toLowerCase();
        } else if (historySortCol === 'receipt') {
          valA = String(a.receipt_no || '').toLowerCase(); valB = String(b.receipt_no || '').toLowerCase();
        } else if (historySortCol === 'pihak') {
          valA = String(a.nama_pemberi || a.nama_penerima || '').toLowerCase(); valB = String(b.nama_pemberi || b.nama_penerima || '').toLowerCase();
        } else if (historySortCol === 'amount') {
          valA = a.amount || 0; valB = b.amount || 0;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          const cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
          if (cmp < 0) return historySortDesc ? 1 : -1;
          if (cmp > 0) return historySortDesc ? -1 : 1;
          return 0;
        } else {
          if (valA < valB) return historySortDesc ? 1 : -1;
          if (valA > valB) return historySortDesc ? -1 : 1;
          return 0;
        }
      });

      window.currentHistoryData = list;

      const rolePerms = currentUser ? getRolePerms(currentUser.role) : null;
      const canApprove = rolePerms && rolePerms.menus && rolePerms.menus.riwayat && rolePerms.menus.riwayat.approve;
      const isApprover = currentUser && (canApprove || currentUser.role === 'Admin');
      const roleNeeded = currentUser ? currentUser.role : '';

      let pendingToApprove = [];
      if (isApprover) {
        pendingToApprove = list.filter(x => {
          const deleteId = x.transaction_id || x.receipt_no || '';
          if (!deleteId) return false;
          const isFullyApproved = x.approved_by && (x.approved_by.includes('Admin') || (x.approved_by.includes('Ketua Jemaat') && x.approved_by.includes('Pendeta')));
          if (isFullyApproved) return false;
          if (!x.approved_by || !x.approved_by.includes(roleNeeded)) return true;
          return false;
        });
      }

      const btnApproveBulk = document.getElementById('btnApproveBulk');
      if (btnApproveBulk) {
        if (pendingToApprove.length > 0) {
          btnApproveBulk.style.display = 'inline-flex';
          btnApproveBulk.innerHTML = `${safeIcon('check', 'lucide-sm')} <span>Approve Semua (${pendingToApprove.length})</span>`;
          window.pendingBulkApproveList = pendingToApprove.map(x => ({ type: x.type, id: x.transaction_id || x.receipt_no }));
        } else {
          btnApproveBulk.style.display = 'none';
          window.pendingBulkApproveList = [];
        }
      }

      const printBtn = document.getElementById('btnPrintUnit');
      if (printBtn) {
        printBtn.style.display = (q || month > 0 || year > 0 || filterApproval) ? 'inline-flex' : 'none';
      }

      const perms = getRolePerms(currentUser.role);
      const mRiwayat = perms.menus.riwayat || { view: true, edit: false, del: false };
      const mPindahBuku = perms.menus.pindahbuku || { view: false, edit: false, del: false };
      const isAdmin = currentUser.role === 'Admin';
      const canEdit = mRiwayat.edit || isAdmin;
      const canDel = mRiwayat.del || isAdmin;
      const isViewer = getRolePerms(currentUser?.role || '').isAnonymous || (currentUser && (currentUser.role === 'Viewer' || currentUser.role === 'Publik'));
      const isAnon = perms.isAnonymous;

      let sumIn = 0; let sumOut = 0;
      const monthlyBreak = {}; // { 'Jan 2025': {inc:0, exp:0} }
      const catBreakIn = {}; // { 'Perpuluhan': 1234 }
      const catBreakOut = {}; // { 'Gaji': 5678 }
      const mNamesShort = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      list.forEach(x => {
        if (x.type === 'income') { sumIn += x.amount; const cat = x.income_type || 'Lainnya'; catBreakIn[cat] = (catBreakIn[cat] || 0) + x.amount; }
        else if (x.type === 'expense') {
          const isMutasi = x.department === 'Mutasi Kas / Setor Bank';
          if (!isMutasi) {
            sumOut += x.amount; const cat = x.department || 'Lainnya'; catBreakOut[cat] = (catBreakOut[cat] || 0) + x.amount;
          }
        }
        
        const isMut = x.department === 'Mutasi Kas / Setor Bank';
        if (!isMut) {
          const d = new Date(x.date); const mKey = `${mNamesShort[d.getMonth() + 1]} ${d.getFullYear()}`;
          if (!monthlyBreak[mKey]) monthlyBreak[mKey] = { inc: 0, exp: 0 };
          if (x.type === 'income') monthlyBreak[mKey].inc += x.amount; else monthlyBreak[mKey].exp += x.amount;
        }
      });
      let summaryHtml = '';
      if (myUnitFilterActive || q || month > 0 || year > 0) {
        let totalNeedsApprove = list.filter(x => x.transaction_id || x.receipt_no).length;
        let totalApproved = list.filter(x => x.approved_by && (x.approved_by.includes('Admin') || (x.approved_by.includes('Ketua Jemaat') && x.approved_by.includes('Pendeta')))).length;

        // --- Top summary cards with proper gap ---
        summaryHtml = `
          <div style="margin-bottom:16px; padding:16px 20px; background:var(--input-bg); border:1px solid var(--glass-border); border-radius:var(--radius-lg); overflow:hidden;">
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:16px 24px;">
              <div>
                <div style="font-size:12px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Pemasukan</div>
                <div class="amount-pos" style="font-size:18px; font-weight:800; font-family:monospace; word-break:break-all;">+${fmt(sumIn)}</div>
              </div>
              <div>
                <div style="font-size:12px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Pengeluaran</div>
                <div class="amount-neg" style="font-size:18px; font-weight:800; font-family:monospace; word-break:break-all;">-${fmt(sumOut)}</div>
              </div>
              <div>
                <div style="font-size:12px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Bersih</div>
                <div style="font-size:18px; font-weight:800; font-family:monospace; word-break:break-all; color:${(sumIn - sumOut) >= 0 ? 'var(--accent-green)' : 'var(--accent-orange)'}">${fmt(sumIn - sumOut)}</div>
              </div>
              <div>
                <div style="font-size:12px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Total Data</div>
                <div style="font-size:18px; font-weight:800; font-family:monospace; color:var(--text)">${list.length} Baris</div>
              </div>
              <div>
                <div style="font-size:12px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Telah Disetujui</div>
                <div style="font-size:18px; font-weight:800; font-family:monospace; color:${totalApproved === totalNeedsApprove && totalNeedsApprove > 0 ? 'var(--accent-green)' : 'var(--text)'}">${totalApproved} / ${totalNeedsApprove}</div>
              </div>
            </div>`;

        // --- Per-month breakdown ---
        const monthKeys = Object.keys(monthlyBreak);
        if (monthKeys.length > 1) {
          summaryHtml += `
            <div style="margin-top:14px; border-top:1px solid var(--glass-border); padding-top:12px;">
              <div style="font-size:12px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Rincian Per Bulan</div>
              
              <div class="desktop-only">
                <table style="font-size:13px; width:100%; border-collapse:collapse; table-layout:fixed;">
                  <colgroup><col style="width:22%"><col style="width:26%"><col style="width:26%"><col style="width:26%"></colgroup>
                  <thead><tr style="border-bottom:1px solid var(--glass-border);">
                    <th style="text-align:left; padding:8px 4px 8px 0; color:var(--text3); font-weight:600;">Bulan</th>
                    <th style="text-align:right; padding:8px 4px; color:var(--text3); font-weight:600;">Masuk</th>
                    <th style="text-align:right; padding:8px 4px; color:var(--text3); font-weight:600;">Keluar</th>
                    <th style="text-align:right; padding:8px 0 8px 4px; color:var(--text3); font-weight:600;">Bersih</th>
                  </tr></thead>
                  <tbody>${monthKeys.map(k => {
            const v = monthlyBreak[k]; const net = v.inc - v.exp;
            return `<tr style="border-bottom:1px solid var(--glass-border);">
                      <td style="padding:8px 4px 8px 0; color:var(--text); word-break:break-word; font-weight:500;">${k}</td>
                      <td class="amount-pos" style="text-align:right; padding:8px 4px; font-family:monospace; word-break:break-all; font-size:13px;">${fmt(v.inc)}</td>
                      <td class="amount-neg" style="text-align:right; padding:8px 4px; font-family:monospace; word-break:break-all; font-size:13px;">${fmt(v.exp)}</td>
                      <td style="text-align:right; padding:8px 0 8px 4px; font-weight:700; font-family:monospace; word-break:break-all; font-size:13px; color:${net >= 0 ? 'var(--accent-green)' : 'var(--accent-orange)'}">${fmt(net)}</td>
                    </tr>`;
          }).join('')}</tbody>
                </table>
              </div>

              <div class="mobile-only">
                ${monthKeys.map(k => {
            const v = monthlyBreak[k]; const net = v.inc - v.exp;
            return `
                  <div style="padding:10px 0; border-bottom:1px solid var(--glass-border);">
                    <div style="font-size:13px; font-weight:700; color:var(--text); margin-bottom:6px;">${k}</div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                      <span style="font-size:13px; color:var(--text3);">Masuk:</span>
                      <span class="amount-pos" style="font-size:14px; font-family:monospace; font-weight:600;">${fmt(v.inc)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                      <span style="font-size:13px; color:var(--text3);">Keluar:</span>
                      <span class="amount-neg" style="font-size:14px; font-family:monospace; font-weight:600;">${fmt(v.exp)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:6px; padding-top:6px; border-top:1px dashed var(--glass-border);">
                      <span style="font-size:13px; color:var(--text2); font-weight:600;">Bersih:</span>
                      <span style="font-size:15px; font-family:monospace; font-weight:800; color:${net >= 0 ? 'var(--accent-green)' : 'var(--accent-orange)'}">${fmt(net)}</span>
                    </div>
                  </div>`;
          }).join('')}
              </div>

            </div>`;
        }

        // --- Per-category breakdown ---
        const hasInCat = Object.keys(catBreakIn).length > 0;
        const hasOutCat = Object.keys(catBreakOut).length > 0;
        if (hasInCat || hasOutCat) {
          summaryHtml += `
            <div style="margin-top:14px; border-top:1px solid var(--glass-border); padding-top:12px;">
              <div style="font-size:12px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px;">Rincian Per Kategori</div>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px;">`;
          if (hasInCat) {
            summaryHtml += `<div>
              <div style="font-size:12px; font-weight:700; color:var(--accent-green); margin-bottom:8px; text-transform:uppercase;">Pemasukan</div>
              ${Object.entries(catBreakIn).sort((a, b) => b[1] - a[1]).map(([k, v]) => `
                <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--glass-border); gap:8px;">
                  <span style="font-size:13px; color:var(--text2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${k}</span>
                  <span class="amount-pos" style="font-size:13px; font-weight:700; font-family:monospace; white-space:nowrap;">${fmt(v)}</span>
                </div>`).join('')}
            </div>`;
          }
          if (hasOutCat) {
            summaryHtml += `<div>
              <div style="font-size:12px; font-weight:700; color:var(--accent-orange); margin-bottom:8px; text-transform:uppercase;">Pengeluaran</div>
              ${Object.entries(catBreakOut).sort((a, b) => b[1] - a[1]).map(([k, v]) => `
                <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--glass-border); gap:8px;">
                  <span style="font-size:13px; color:var(--text2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${k}</span>
                  <span class="amount-neg" style="font-size:13px; font-weight:700; font-family:monospace; white-space:nowrap;">${fmt(v)}</span>
                </div>`).join('')}
            </div>`;
          }
          summaryHtml += `</div></div>`;
        }

        summaryHtml += `</div>`;
      }

      if (list.length === 0) {
        document.getElementById('historyListContainer').innerHTML = summaryHtml + '<div class="empty-state" style="padding:20px; text-align:center;">Data kosong.</div>';
      } else {
        const userUnits = getUserUnits();

        let desktopHtml = list.map(x => {
          const isMutasi = x.department === 'Mutasi Kas / Setor Bank' || x.income_type === 'Mutasi Kas / Setor Bank';
          const txCanEdit = canEdit || (isMutasi && mPindahBuku.edit);
          const txCanDel = canDel || (isMutasi && mPindahBuku.del);
          
          const txUnitLower = String(x.unit_name || '').toLowerCase().trim();
          const belongsToUserUnits = userUnits.some(u => String(u).toLowerCase().trim() === txUnitLower);

          let hasMembers = false;
          if (masterData && masterData.units) {
            const uData = masterData.units.find(u => String(u.name).toLowerCase().trim() === txUnitLower);
            if (uData && parseInt(uData.jumlah_anggota || 0) > 0) hasMembers = true;
          }
          const isExpense = x.type === 'expense';
          const incType = String(x.income_type || '').toLowerCase();
          const isTransparentInc = x.type === 'income' && (incType.includes('sabat') || incType.includes('rabu malam') || incType.includes('pembangunan')) && !hasMembers;
          const isTransparent = isExpense || isTransparentInc;

          const isPrivCategory = isViewer && x.type === 'income' && isPrivateCategory(x.income_type);
          const isOtherUnit = userUnits.length > 0 && x.type === 'income' && !belongsToUserUnits;

          // DO NOT HIDE if the transaction belongs to the user's bound units!
          let shouldHide = !belongsToUserUnits && (isAnon || isOtherUnit || isPrivCategory);
          if (isTransparent) shouldHide = false;

          const deleteId = x.transaction_id || x.receipt_no || '';
          let photoBtn = getPhotoBtnIcon(x, shouldHide && !isApprover);
          const pihak = x.type === 'income' ? (shouldHide ? '***' : (x.nama_pemberi || '-')) : (shouldHide ? '***' : (x.nama_penerima || '-'));

          let approveBadge = '';
          if (isMutasi) {
            approveBadge = `<span class="badge" style="background:var(--accent-green);color:white;font-size:9px;">Disetujui</span>`;
          } else if (x.approved_by) {
            const isAdminApp = x.approved_by.includes('Admin');
            const isKetua = x.approved_by.includes('Ketua Jemaat');
            const isPendeta = x.approved_by.includes('Pendeta');
            if (isAdminApp || (isKetua && isPendeta)) approveBadge = `<span class="badge" style="background:var(--accent-green);color:white;font-size:9px;">Disetujui</span>`;
            else {
              let pendingWho = [];
              if (!isKetua) pendingWho.push('Ketua');
              if (!isPendeta) pendingWho.push('Pendeta');
              approveBadge = `<span class="badge badge-amber" style="font-size:9px;" title="Menunggu: ${pendingWho.join(' & ')}">Menunggu: ${pendingWho.join(' & ')}</span>`;
            }
          } else {
            approveBadge = `<span class="badge badge-gray" style="font-size:9px;" title="Menunggu: Ketua & Pendeta">Menunggu: Ketua & Pendeta</span>`;
          }

          let approveBtn = '';
          if (isApprover && deleteId && !isMutasi) {
            const isFullyApproved = x.approved_by && (x.approved_by.includes('Admin') || (x.approved_by.includes('Ketua Jemaat') && x.approved_by.includes('Pendeta')));
            if (isFullyApproved || (x.approved_by && x.approved_by.includes(roleNeeded))) {
              approveBtn = `<button class="btn-icon-only" style="color:var(--text4); cursor:default;" title="Sudah Di-Approve" disabled>${safeIcon('check', 'lucide-sm')}</button>`;
            } else {
              approveBtn = `<button class="btn-icon-only" style="color:var(--accent-green);" title="Approve" onclick="approveTx('${x.type}', '${deleteId}')">${safeIcon('check', 'lucide-sm')}</button>`;
            }
          }

          let nText = x.note || '-';
          let bBadge = '';
          if (nText.includes('[BANK]')) { nText = nText.replace(/\[BANK\]\s?|\s?\[BANK\]/g, ''); bBadge = '<span class="badge badge-green" style="font-size:10px; padding:2px 4px; margin-right:4px;">VIA BANK</span>'; }
          else if (nText.includes('[CASH]')) { nText = nText.replace(/\[CASH\]\s?|\s?\[CASH\]/g, ''); bBadge = '<span class="badge badge-amber" style="font-size:10px; padding:2px 4px; margin-right:4px;">TUNAI</span>'; }

          return `
      <tr>
        <td class="fit-col">${fmtDate(x.date)}</td>
        <td class="fit-col"><span class="badge ${x.badge}">${x.label}</span></td>
        <td><span class="badge ${getCatBadge(x.income_type || x.department, x.type !== 'income')}">${x.income_type || x.department || '-'}</span><br><span style="font-size:12px; color:var(--text4)">${shouldHide ? '***' : (bBadge + nText)}</span></td>
        <td class="fit-col"><span class="badge badge-gray">${x.receipt_no || '-'}</span> ${photoBtn}</td>
        <td>${pihak}</td>
        <td class="fit-col ${x.style}" style="text-align:right; font-weight:800;">${x.sign}${fmt(x.amount)}<div style="margin-top:4px;">${approveBadge}</div></td>
        <td class="fit-col" style="text-align:right; white-space:nowrap;">
          ${approveBtn}
          ${deleteId ? `<button class="btn-icon-only" style="color:var(--text3);" onclick="printTransaction('${x.type}', '${deleteId}')" title="Cetak Kuitansi">${safeIcon('printer', 'lucide-sm')}</button>` : ''}
          ${txCanEdit && deleteId ? `<button class="btn-icon-only" onclick="openEditTrans('${x.type}', '${deleteId}')">${safeIcon('edit', 'lucide-sm')}</button>` : ''}
          ${txCanDel && deleteId ? `<button class="btn-icon-only" style="color:var(--red-pop)" onclick="deleteTransaction('${x.type}', '${deleteId}')">${safeIcon('trash', 'lucide-sm')}</button>` : ''}
        </td>
      </tr>`;
        }).join('');

        let mobileHtml = '<div class="dash-detail-list" style="display:flex; flex-direction:column;">' + list.map(x => {
          const isMutasi = x.department === 'Mutasi Kas / Setor Bank' || x.income_type === 'Mutasi Kas / Setor Bank';
          const txCanEdit = canEdit || (isMutasi && mPindahBuku.edit);
          const txCanDel = canDel || (isMutasi && mPindahBuku.del);

          const txUnitLower = String(x.unit_name || '').toLowerCase().trim();
          const belongsToUserUnits = userUnits.some(u => String(u).toLowerCase().trim() === txUnitLower);

          let hasMembers = false;
          if (masterData && masterData.units) {
            const uData = masterData.units.find(u => String(u.name).toLowerCase().trim() === txUnitLower);
            if (uData && parseInt(uData.jumlah_anggota || 0) > 0) hasMembers = true;
          }
          const isExpense = x.type === 'expense';
          const incType = String(x.income_type || '').toLowerCase();
          const isTransparentInc = x.type === 'income' && (incType.includes('sabat') || incType.includes('rabu malam') || incType.includes('pembangunan')) && !hasMembers;
          const isTransparent = isExpense || isTransparentInc;

          const isPrivCategory = isViewer && x.type === 'income' && isPrivateCategory(x.income_type);
          const isInc = x.type === 'income';
          const isOtherUnit = userUnits.length > 0 && x.type === 'income' && !belongsToUserUnits;

          // DO NOT HIDE if the transaction belongs to the user's bound units!
          let shouldHide = !belongsToUserUnits && (isAnon || isOtherUnit || isPrivCategory);
          if (isTransparent) shouldHide = false;

          const deleteId = x.transaction_id || x.receipt_no || '';
          const pihak = x.type === 'income' ? (shouldHide ? '***' : (x.nama_pemberi || '-')) : (shouldHide ? '***' : (x.nama_penerima || '-'));

          let photoBtn = getPhotoBtnText(x, shouldHide && !isApprover);
          let approveBadgeDesktop = '';
          let approveBadgeMobile = '';
          if (isMutasi) {
            approveBadgeDesktop = `<span class="badge" style="background:var(--accent-green);color:white;font-size:9px; font-weight:700; letter-spacing:0.3px;">DISETUJUI</span>`;
            approveBadgeMobile = `<span class="badge" style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); z-index:2; padding:3px 10px; border-radius:12px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 2px 4px rgba(0,0,0,0.1); background:var(--accent-green);color:white;font-size:9px; font-weight:700; letter-spacing:0.3px;">DISETUJUI</span>`;
          } else if (x.approved_by) {
            const isAdminApp = x.approved_by.includes('Admin');
            const isKetua = x.approved_by.includes('Ketua Jemaat');
            const isPendeta = x.approved_by.includes('Pendeta');
            if (isAdminApp || (isKetua && isPendeta)) {
              approveBadgeDesktop = `<span class="badge" style="background:var(--accent-green);color:white;font-size:9px; font-weight:700; letter-spacing:0.3px;">DISETUJUI</span>`;
              approveBadgeMobile = `<span class="badge" style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); z-index:2; padding:3px 10px; border-radius:12px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 2px 4px rgba(0,0,0,0.1); background:var(--accent-green);color:white;font-size:9px; font-weight:700; letter-spacing:0.3px;">DISETUJUI</span>`;
            } else {
              let pendingWho = [];
              if (!isKetua) pendingWho.push('Ketua');
              if (!isPendeta) pendingWho.push('Pendeta');
              approveBadgeDesktop = `<span class="badge badge-amber" style="font-size:9px; font-weight:700; letter-spacing:0.3px;" title="Menunggu: ${pendingWho.join(' & ')}">MENUNGGU: ${pendingWho.join(' & ').toUpperCase()}</span>`;
              approveBadgeMobile = `<span class="badge badge-amber" style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); z-index:2; padding:3px 10px; border-radius:12px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 2px 4px rgba(0,0,0,0.1); background:var(--input-bg); font-size:9px; font-weight:700; letter-spacing:0.3px;" title="Menunggu: ${pendingWho.join(' & ')}">MENUNGGU: ${pendingWho.join(' & ').toUpperCase()}</span>`;
            }
          } else {
            approveBadgeDesktop = `<span class="badge badge-gray" style="font-size:9px; font-weight:700; letter-spacing:0.3px;" title="Menunggu: Ketua & Pendeta">MENUNGGU: KETUA & PENDETA</span>`;
            approveBadgeMobile = `<span class="badge badge-gray" style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); z-index:2; padding:3px 10px; border-radius:12px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 2px 4px rgba(0,0,0,0.1); background:var(--input-bg); font-size:9px; font-weight:700; letter-spacing:0.3px;" title="Menunggu: Ketua & Pendeta">MENUNGGU: KETUA & PENDETA</span>`;
          }

          let approveBtn = '';
          if (isApprover && deleteId && !isMutasi) {
            const isFullyApproved = x.approved_by && (x.approved_by.includes('Admin') || (x.approved_by.includes('Ketua Jemaat') && x.approved_by.includes('Pendeta')));
            if (isFullyApproved || (x.approved_by && x.approved_by.includes(roleNeeded))) {
              approveBtn = `<button class="btn" style="padding:4px 8px; font-size:9px; background:var(--badge-gray-bg); color:var(--text4); border:1px solid var(--glass-border); cursor:default;display:inline-flex;align-items:center;gap:4px;" disabled>${safeIcon('check', 'lucide-sm')} Approved</button>`;
            } else {
              approveBtn = `<button class="btn" style="padding:4px 8px; font-size:9px; background:rgba(16,185,129,0.1); color:var(--accent-green); border:1px solid rgba(16,185,129,0.2);display:inline-flex;align-items:center;gap:4px;" onclick="approveTx('${x.type}', '${deleteId}')">${safeIcon('check', 'lucide-sm')} Approve</button>`;
            }
          }

          let editBtn = txCanEdit && deleteId ? `<button class="btn" style="flex:1; justify-content:center; padding:6px 0; font-size:11px; background:var(--input-bg); color:var(--text); border:1px solid var(--glass-border);" onclick="openEditTrans('${x.type}', '${deleteId}')">${safeIcon('edit', 'lucide-sm')} <span style="margin-left:4px">Edit</span></button>` : '';
          let delBtn = txCanDel && deleteId ? `<button class="btn" style="flex:1; justify-content:center; padding:6px 0; font-size:11px; background:rgba(244,63,94,0.1); color:var(--rose-pop); border:1px solid rgba(244,63,94,0.2);" onclick="deleteTransaction('${x.type}', '${deleteId}')">${safeIcon('trash', 'lucide-sm')} <span style="margin-left:4px">Hapus</span></button>` : '';

          let cetakBtn = deleteId ? `<button class="btn" style="padding:4px 8px; font-size:9px; background:var(--input-bg); color:var(--text); border:1px solid var(--glass-border);display:inline-flex;align-items:center;gap:4px;" onclick="printTransaction('${x.type}', '${deleteId}')" title="Cetak">${safeIcon('printer', 'lucide-sm')} Cetak</button>` : '';

          return `
          <div class="dash-tx-card" style="position:relative; margin: 20px 12px 12px 12px; padding: 12px; border: 1px solid var(--glass-border); border-radius: var(--radius); background: var(--input-bg);">
            ${approveBadgeMobile}
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 8px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-width:0;">
                <span class="badge ${x.badge}" style="font-size:10px; padding:2px 7px;">${isInc ? 'IN' : 'OUT'}</span>
                <span style="font-size:11px; color:var(--text3); font-family:monospace;">${x.receipt_no || '-'}</span>
              </div>
              <div class="${x.style}" style="font-weight: 700; font-size: 15px; white-space:nowrap; margin-bottom:2px;">${x.sign}${fmt(x.amount)}</div>
            </div>
            <div style="display:grid; grid-template-columns: auto 1fr; gap: 6px 8px; font-size: 11px; color: var(--text2); margin-top:8px; align-items:center;">
              <span style="color:var(--text4); display:flex; align-items:center; height:100%;">Tgl</span>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:var(--text); font-weight:600; display:flex; align-items:center; height:100%;">${fmtDate(x.date)}</strong>
                <div style="display:flex; gap:4px;">
                  ${approveBtn}
                  ${cetakBtn}
                </div>
              </div>
              <span style="color:var(--text4)">Pihak</span><strong style="color:var(--text); font-weight:600; overflow:hidden; text-overflow:ellipsis;">${pihak}</strong>
              <span style="color:var(--text4)">Ket</span><strong style="color:var(--text); font-weight:600;">${x.income_type || x.department || '-'}</strong>
              <span style="color:var(--text4)">Note</span><span style="color:var(--text4); overflow:hidden; text-overflow:ellipsis;">${shouldHide ? '***' : (() => { let nT = x.note || '-'; let bB = ''; if (nT.includes('[BANK]')) { nT = nT.replace(/\[BANK\]\s?|\s?\[BANK\]/g, ''); bB = '<span class="badge badge-green" style="font-size:10px; padding:2px 4px; margin-right:4px;">VIA BANK</span>'; } else if (nT.includes('[CASH]')) { nT = nT.replace(/\[CASH\]\s?|\s?\[CASH\]/g, ''); bB = '<span class="badge badge-amber" style="font-size:10px; padding:2px 4px; margin-right:4px;">TUNAI</span>'; } return bB + nT; })()}</span>
            </div>
            <div style="display:flex; gap:6px; margin-top:12px; width:100%;">
              ${photoBtn}
              ${editBtn}
              ${delBtn}
            </div>
          </div>`;
        }).join('') + '</div>';

        const getSortIcon = (col) => {
          if (historySortCol !== col) return '<span style="opacity:0.3; font-size:10px; margin-left:4px;">↕</span>';
          return historySortDesc ? '<span style="font-size:10px; margin-left:4px;">▼</span>' : '<span style="font-size:10px; margin-left:4px;">▲</span>';
        };

        document.getElementById('historyListContainer').innerHTML = summaryHtml + `
          <div class="desktop-only table-wrap scrollable" style="border:none;">
            <table class="table-history">
              <thead>
                <tr>
                  <th class="fit-col" style="cursor:pointer; user-select:none;" onclick="toggleSortHistory('date')">Tanggal ${getSortIcon('date')}</th>
                  <th class="fit-col" style="cursor:pointer; user-select:none;" onclick="toggleSortHistory('type')">Alur ${getSortIcon('type')}</th>
                  <th style="cursor:pointer; user-select:none;" onclick="toggleSortHistory('category')">Kategori & Keterangan ${getSortIcon('category')}</th>
                  <th class="fit-col" style="cursor:pointer; user-select:none;" onclick="toggleSortHistory('receipt')">Bukti ${getSortIcon('receipt')}</th>
                  <th style="cursor:pointer; user-select:none;" onclick="toggleSortHistory('pihak')">Pihak ${getSortIcon('pihak')}</th>
                  <th class="fit-col" style="text-align:right; cursor:pointer; user-select:none;" onclick="toggleSortHistory('amount')">Nominal ${getSortIcon('amount')}</th>
                  <th class="fit-col" style="text-align:right">Aksi</th>
                </tr>
              </thead>
              <tbody>${desktopHtml}</tbody>
            </table>
          </div>
          <div class="mobile-only" style="padding-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; margin-bottom:16px; padding: 0 12px;">
              <span style="font-size:12px; color:var(--text3); font-weight:600;">Urut Berdasarkan:</span>
              <select class="select-sm" style="font-size:12px; padding:4px 24px 4px 8px; width:auto; border-radius:var(--radius);" onchange="historySortCol=this.value.split('|')[0]; historySortDesc=(this.value.split('|')[1]==='desc'); renderHistory();">
                 <option value="date|desc" ${historySortCol === 'date' && historySortDesc ? 'selected' : ''}>Tanggal (Terbaru)</option>
                 <option value="date|asc" ${historySortCol === 'date' && !historySortDesc ? 'selected' : ''}>Tanggal (Terlama)</option>
                 <option value="amount|desc" ${historySortCol === 'amount' && historySortDesc ? 'selected' : ''}>Nominal (Tertinggi)</option>
                 <option value="amount|asc" ${historySortCol === 'amount' && !historySortDesc ? 'selected' : ''}>Nominal (Terendah)</option>
                 <option value="receipt|asc" ${historySortCol === 'receipt' && !historySortDesc ? 'selected' : ''}>Bukti (A-Z)</option>
                 <option value="receipt|desc" ${historySortCol === 'receipt' && historySortDesc ? 'selected' : ''}>Bukti (Z-A)</option>
              </select>
            </div>
            ${mobileHtml}
          </div>
        `;
      }
    }

    let currentEditTransaction = null;

    function handleEditTypeChange() {
      if (!currentEditTransaction) return;
      const catSelect = document.getElementById('editTransCat');
      if (!catSelect) return;

      const type = catSelect.value;
      const bulkGrp = document.getElementById('editTransBulkGroup');
      const amtWrapper = document.getElementById('editTransAmtWrapper');

      if (type === 'Perpuluhan') {
        if (bulkGrp) bulkGrp.style.display = 'block';
        if (amtWrapper) amtWrapper.style.display = 'none';
      } else {
        if (bulkGrp) bulkGrp.style.display = 'none';
        if (amtWrapper) amtWrapper.style.display = 'block';
      }
    }

    function openEditTrans(type, id) {
      const list = type === 'income' ? cachedIncome : cachedExpense;
      const trx = list.find(x => (x.transaction_id || x.receipt_no) === id);
      if (!trx) { notify('Transaksi tidak ditemukan.', 'error'); return; }

      if (document.getElementById('editTransModal')) document.getElementById('editTransModal').style.display = 'flex';
      if (document.getElementById('editTransDate')) document.getElementById('editTransDate').value = fmtInputDate(trx.date);
      if (document.getElementById('editTransReceipt')) document.getElementById('editTransReceipt').value = trx.receipt_no || '';
      if (document.getElementById('editTransNote')) {
        let nT = trx.note || '';
        let dest = 'CASH';
        if (nT.includes('[BANK]')) {
          nT = nT.replace(/\[BANK\]\s?|\s?\[BANK\]/g, '');
          dest = 'BANK';
        } else if (nT.includes('[CASH]')) {
          nT = nT.replace(/\[CASH\]\s?|\s?\[CASH\]/g, '');
          dest = 'CASH';
        }
        document.getElementById('editTransNote').value = nT;
        if (document.getElementById('editTransDestination')) document.getElementById('editTransDestination').value = dest;
      }

      const catSelect = document.getElementById('editTransCat');
      const subCatSelect = document.getElementById('editTransSubCat');
      const subCatGroup = document.getElementById('editTransSubCatGroup');
      if (catSelect) catSelect.innerHTML = '';
      if (subCatSelect) subCatSelect.innerHTML = '';

      currentEditTransaction = { type, id: trx.transaction_id || trx.receipt_no, old_receipt_no: trx.receipt_no, original: trx };

      if (type === 'income') {
        if (document.getElementById('editTransDestinationGroup')) document.getElementById('editTransDestinationGroup').style.display = 'block';
        if (document.getElementById('editTransCatLabel')) document.getElementById('editTransCatLabel').textContent = 'Kategori';
        const perpuluhanGroup = ['Perpuluhan', 'Terpadu', 'Khusus Jemaat', 'Khusus Daerah'];
        const excludeList = ['Persembahan Khusus', ...perpuluhanGroup];

        if (catSelect) catSelect.add(new Option('Perpuluhan (Grup Kolektif)', 'Perpuluhan'));
        const existingTypes = [];
        (masterData.incomeTypes || []).forEach(x => {
          existingTypes.push(x.name);
          if (!excludeList.includes(x.name) && catSelect) catSelect.add(new Option(x.name, x.name));
        });

        if (trx.income_type && !existingTypes.includes(trx.income_type) && !perpuluhanGroup.includes(trx.income_type) && catSelect) {
          catSelect.add(new Option(trx.income_type + ' (Histori)', trx.income_type));
        }

        const isBulk = perpuluhanGroup.includes(trx.income_type) || (trx.nama_pemberi && String(trx.nama_pemberi).startsWith('Kolektif'));

        if (catSelect) {
          catSelect.value = isBulk ? 'Perpuluhan' : trx.income_type;
        }

        if (document.getElementById('editTransUnitGroup')) document.getElementById('editTransUnitGroup').style.display = 'block';
        if (document.getElementById('editTransSourceGroup')) document.getElementById('editTransSourceGroup').style.display = 'none';

        const unitSelect = document.getElementById('editTransUnit');
        if (unitSelect) {
          unitSelect.innerHTML = '<option value="">-- Tanpa Unit --</option>';
          const existingUnits = [];
          (masterData.units || []).forEach(x => { existingUnits.push(x.name); unitSelect.add(new Option(x.name, x.name)); });
          if (trx.unit_name && trx.unit_name !== '-' && !existingUnits.includes(trx.unit_name)) unitSelect.add(new Option(trx.unit_name + ' (Histori)', trx.unit_name));
          unitSelect.value = trx.unit_name || '';
        }

        if (document.getElementById('editTransPihakGroup')) document.getElementById('editTransPihakGroup').style.display = 'block';
        if (document.getElementById('editTransPihakLabel')) document.getElementById('editTransPihakLabel').textContent = 'Nama Pemberi';
        if (document.getElementById('editTransPihak')) document.getElementById('editTransPihak').value = (isBulk && trx.nama_pemberi && trx.nama_pemberi.startsWith('Kolektif')) ? 'Umum' : (trx.nama_pemberi || '');

        if (document.getElementById('editTransAmtPerpuluhan')) document.getElementById('editTransAmtPerpuluhan').value = '';
        if (document.getElementById('editTransAmtTerpadu')) document.getElementById('editTransAmtTerpadu').value = '';
        if (document.getElementById('editTransAmtKhususJemaat')) document.getElementById('editTransAmtKhususJemaat').value = '';
        if (document.getElementById('editTransAmtKhususDaerah')) document.getElementById('editTransAmtKhususDaerah').value = '';

        if (isBulk) {
          const allItems = cachedIncome.filter(x => x.receipt_no === trx.receipt_no && perpuluhanGroup.includes(x.income_type));
          allItems.forEach(item => {
            if (item.income_type === 'Perpuluhan' && document.getElementById('editTransAmtPerpuluhan')) document.getElementById('editTransAmtPerpuluhan').value = item.amount;
            if (item.income_type === 'Terpadu' && document.getElementById('editTransAmtTerpadu')) document.getElementById('editTransAmtTerpadu').value = item.amount;
            if (item.income_type === 'Khusus Jemaat' && document.getElementById('editTransAmtKhususJemaat')) document.getElementById('editTransAmtKhususJemaat').value = item.amount;
            if (item.income_type === 'Khusus Daerah' && document.getElementById('editTransAmtKhususDaerah')) document.getElementById('editTransAmtKhususDaerah').value = item.amount;
          });
        } else {
          if (document.getElementById('editTransAmount')) document.getElementById('editTransAmount').value = trx.amount;
        }

      } else {
        if (document.getElementById('editTransDestinationGroup')) document.getElementById('editTransDestinationGroup').style.display = 'none';
        if (document.getElementById('editTransCatLabel')) document.getElementById('editTransCatLabel').textContent = 'Departemen';
        const existingDepts = [];
        (masterData.departments || []).forEach(x => { existingDepts.push(x.name); if (catSelect) catSelect.add(new Option(x.name, x.name)); });
        existingDepts.push('Mutasi Kas / Setor Bank'); if (catSelect) catSelect.add(new Option('Mutasi Kas / Setor Bank', 'Mutasi Kas / Setor Bank'));
        if (trx.department && !existingDepts.includes(trx.department) && catSelect) catSelect.add(new Option(trx.department + ' (Histori)', trx.department));
        if (catSelect) catSelect.value = trx.department || '';

        if (document.getElementById('editTransUnitGroup')) document.getElementById('editTransUnitGroup').style.display = 'none';
        if (document.getElementById('editTransSourceGroup')) document.getElementById('editTransSourceGroup').style.display = 'block';
        if (document.getElementById('editTransSource')) document.getElementById('editTransSource').value = trx.source_balance || 'Kas Jemaat';

        if (document.getElementById('editTransPihakGroup')) document.getElementById('editTransPihakGroup').style.display = 'block';
        if (document.getElementById('editTransPihakLabel')) document.getElementById('editTransPihakLabel').textContent = 'Nama Penerima';
        if (document.getElementById('editTransPihak')) document.getElementById('editTransPihak').value = trx.nama_penerima || '';

        if (document.getElementById('editTransAmount')) document.getElementById('editTransAmount').value = trx.amount;
      }

      // Load existing photos into edit preview
      currentEditPhotos = [trx.receipt_photo, trx.receipt_photo_2, trx.receipt_photo_3].filter(p => p && String(p).trim() !== '');
      renderPhotoPreview(currentEditPhotos, 'editPhotoGrid', 'editPhotoUploadBox', 'edit');

      handleEditTypeChange();

      // Check if fully approved and disable fields if so
      const isFullyApproved = trx.approved_by && (trx.approved_by.includes('Admin') || (trx.approved_by.includes('Ketua Jemaat') && trx.approved_by.includes('Pendeta')));
      const inputsToLock = [
        'editTransDate', 'editTransReceipt', 'editTransNote', 'editTransCat', 'editTransUnit',
        'editTransPihak', 'editTransAmount', 'editTransSource', 'editTransAmtPerpuluhan',
        'editTransAmtTerpadu', 'editTransAmtKhususJemaat', 'editTransAmtKhususDaerah'
      ];
      inputsToLock.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = isFullyApproved;
      });

      if (isFullyApproved) {
        document.getElementById('editTransNote').placeholder = 'Transaksi disetujui penuh, hanya foto yang bisa diubah.';
      }
    }

    function closeEditModal() {
      if (document.getElementById('editTransModal')) document.getElementById('editTransModal').style.display = 'none';
      currentEditTransaction = null;
      resetPhotoUpload('edit');
      const inputsToLock = [
        'editTransDate', 'editTransReceipt', 'editTransNote', 'editTransCat', 'editTransUnit',
        'editTransPihak', 'editTransAmount', 'editTransSource', 'editTransAmtPerpuluhan',
        'editTransAmtTerpadu', 'editTransAmtKhususJemaat', 'editTransAmtKhususDaerah'
      ];
      inputsToLock.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
      });
      document.getElementById('editTransNote').placeholder = '';
    }

    async function saveEditTransaction() {
      if (!currentEditTransaction) return;

      const date = document.getElementById('editTransDate').value;
      if (date) {
        const d = new Date(date);
        if (checkMonthClosed(d.getMonth() + 1, d.getFullYear())) { notify('Bulan ini sudah ditutup. Tidak dapat mengubah transaksi.', 'error'); return; }
      }
      const receipt = document.getElementById('editTransReceipt').value.trim();
      let note = document.getElementById('editTransNote').value.trim();
      if (currentEditTransaction.type === 'income') {
        const dest = document.getElementById('editTransDestination') ? document.getElementById('editTransDestination').value : 'CASH';
        if (dest === 'BANK') note = '[BANK] ' + note;
        else if (dest === 'CASH') note = '[CASH] ' + note;
      }

      if (!date || !receipt) { notify('Tgl dan Kuitansi wajib diisi!', 'error'); return; }
      if (receipt !== String(currentEditTransaction.old_receipt_no || '').trim() && isReceiptDuplicate(receipt, currentEditTransaction.id)) {
        const proceed = await showCustomConfirm('Konfirmasi Kuitansi', 'No. Kuitansi sudah ada! Apakah ini kuitansi kolektif dan Anda tetap ingin menyimpannya?');
        if (!proceed) return;
      }

      const btn = document.getElementById('btnSaveEditTrans');
      btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Menyimpan...';

      try {
        const sortedPhotos = [...currentEditPhotos].sort((a, b) => {
          const isA = String(a).startsWith('data:');
          const isB = String(b).startsWith('data:');
          return (isA === isB) ? 0 : isA ? -1 : 1;
        });

        console.log("=== DEBUG EDIT PHOTOS ===");
        console.log("currentEditPhotos length:", currentEditPhotos.length);
        console.log("sortedPhotos length:", sortedPhotos.length);
        console.log("Photo 1 size:", sortedPhotos[0] ? sortedPhotos[0].length : 0);
        console.log("Photo 2 size:", sortedPhotos[1] ? sortedPhotos[1].length : 0);
        console.log("Photo 3 size:", sortedPhotos[2] ? sortedPhotos[2].length : 0);

        if (currentEditTransaction.type === 'income') {
          const cat = document.getElementById('editTransCat').value;
          const unit = document.getElementById('editTransUnit').value || '-';
          const pihak = document.getElementById('editTransPihak').value.trim() || 'Umum';

          if (cat === 'Perpuluhan') {
            const items = [];
            ['Perpuluhan', 'Terpadu', 'Khusus Jemaat', 'Khusus Daerah'].forEach(k => {
              if (document.getElementById(`editTransAmt${k.replace(/\s/g, '')}`)) {
                const val = parseFloat(document.getElementById(`editTransAmt${k.replace(/\s/g, '')}`).value) || 0;
                if (val > 0) items.push({ income_type: k, amount: val, note, nama_pemberi: pihak });
              }
            });

            if (items.length === 0) throw new Error('Isi setidaknya satu nominal kolektif!');

            const payload = {
              action: 'editBulkIncome',
              old_receipt_no: currentEditTransaction.old_receipt_no,
              date: date,
              receipt_no: receipt,
              unit_name: unit,
              nama_pemberi: pihak,
              items: items,
              receipt_photo_base64: sortedPhotos[0] || '', receipt_photo_base64_2: sortedPhotos[1] || '', receipt_photo_base64_3: sortedPhotos[2] || '',
              original_photo: currentEditTransaction.original.receipt_photo
            };
            await apiPostWithFallback('editBulkIncome', payload);
          } else {
            const amount = parseFloat(document.getElementById('editTransAmount').value) || 0;
            if (amount <= 0) throw new Error('Nominal tidak valid!');

            const payload = {
              type: 'income',
              transaction_id: currentEditTransaction.id,
              date, receipt_no: receipt, amount, note,
              receipt_photo_base64: sortedPhotos[0] || '', receipt_photo_base64_2: sortedPhotos[1] || '', receipt_photo_base64_3: sortedPhotos[2] || '',
              original: currentEditTransaction.original,
              income_type: cat,
              unit_name: unit,
              nama_pemberi: pihak
            };
            await apiPostWithFallback('editRecord', payload);
          }
        } else {
          const amount = parseFloat(document.getElementById('editTransAmount').value) || 0;
          if (amount <= 0) throw new Error('Nominal tidak valid!');
          const cat = document.getElementById('editTransCat').value;
          const source = document.getElementById('editTransSource').value;
          const pihak = document.getElementById('editTransPihak').value.trim() || '-';

          const payload = {
            type: 'expense',
            transaction_id: currentEditTransaction.id,
            date, receipt_no: receipt, amount, note,
            receipt_photo_base64: sortedPhotos[0] || '', receipt_photo_base64_2: sortedPhotos[1] || '', receipt_photo_base64_3: sortedPhotos[2] || '',
            original: currentEditTransaction.original,
            department: cat,
            source_balance: source,
            nama_penerima: pihak
          };
          await apiPostWithFallback('editRecord', payload);
        }

        notify('Berhasil disimpan!', 'success');
        closeEditModal();
        await syncAllData();
        renderHistory();
      } catch (e) {
        notify(e.message, 'error');
      } finally {
        btn.disabled = false; btn.innerHTML = 'Simpan';
      }
    }

    async function deleteTransaction(type, id) {
      const arr = type === 'income' ? cachedIncome : cachedExpense;
      const tx = arr.find(x => x.id === id);
      if (tx && tx.date) {
        const d = new Date(tx.date);
        if (checkMonthClosed(d.getMonth() + 1, d.getFullYear())) { notify('Bulan ini sudah ditutup. Tidak dapat menghapus transaksi.', 'error'); return; }
      }
      const isConfirm = await showCustomConfirm('Hapus Permanen', 'Anda yakin?');
      if (!isConfirm) return;
      try { await apiPost('deleteRecord', { type, transaction_id: id }); notify('Dihapus.', 'success'); await syncAllData(); renderHistory(); }
      catch (e) { notify(e.message, 'error'); }
    }

    function terbilang(angka) {
      const bilne = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
      if (angka < 12) return bilne[angka];
      if (angka < 20) return terbilang(angka - 10) + " Belas";
      if (angka < 100) return terbilang(Math.floor(angka / 10)) + " Puluh " + (angka % 10 !== 0 ? terbilang(angka % 10) : "");
      if (angka < 200) return "Seratus " + (angka - 100 !== 0 ? terbilang(angka - 100) : "");
      if (angka < 1000) return terbilang(Math.floor(angka / 100)) + " Ratus " + (angka % 100 !== 0 ? terbilang(angka % 100) : "");
      if (angka < 2000) return "Seribu " + (angka - 1000 !== 0 ? terbilang(angka - 1000) : "");
      if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + " Ribu " + (angka % 1000 !== 0 ? terbilang(angka % 1000) : "");
      if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + " Juta " + (angka % 1000000 !== 0 ? terbilang(angka % 1000000) : "");
      if (angka < 1000000000000) return terbilang(Math.floor(angka / 1000000000)) + " Milyar " + (angka % 1000000000 !== 0 ? terbilang(angka % 1000000000) : "");
      return "";
    }

    function generateReceiptHTML(type, mainTx) {
      const isIncome = type === 'income';
      const arr = isIncome ? cachedIncome : cachedExpense;
      const targetReceipt = mainTx.receipt_no;
      const targetDate = mainTx.date;

      let items = [];
      if (isIncome && targetReceipt && targetReceipt !== '-') {
        items = arr.filter(x => x.receipt_no === targetReceipt && x.date === targetDate);
        const getWeight = (t) => {
          let str = (t || '').toLowerCase();
          if (str.includes('perpuluhan')) return 1;
          if (str.includes('terpadu')) return 2;
          if (str.includes('khusus')) return 3;
          return 4;
        };
        items.sort((a, b) => getWeight(a.income_type) - getWeight(b.income_type));
      } else {
        items = [mainTx];
      }

      let totalAmt = 0;
      let finalTableHtml = '';

      let ths = '';
      let tds = '';

      const userUnits = getUserUnits();
      const perms = getRolePerms(currentUser?.role || '');
      const isViewer = perms.isAnonymous || (currentUser && (currentUser.role === 'Viewer' || currentUser.role === 'Publik'));
      const isAnon = perms.isAnonymous;
      let receiptHasHiddenItems = false;

      const parsedItems = items.map(x => {
        const txUnitLower = String(x.unit_name || '').toLowerCase().trim();
        const belongsToUserUnits = userUnits.some(u => String(u).toLowerCase().trim() === txUnitLower);
        let hasMembers = false;
        if (masterData && masterData.units) {
          const uData = masterData.units.find(u => String(u.name).toLowerCase().trim() === txUnitLower);
          if (uData && parseInt(uData.jumlah_anggota || 0) > 0) hasMembers = true;
        }
        const incType = String(x.income_type || '').toLowerCase();
        const isTransparentInc = isIncome && (incType.includes('sabat') || incType.includes('rabu malam') || incType.includes('pembangunan')) && !hasMembers;
        const isPrivCategory = isViewer && isIncome && isPrivateCategory(x.income_type);
        const isOtherUnit = userUnits.length > 0 && isIncome && !belongsToUserUnits;
        let shouldHide = !belongsToUserUnits && (isAnon || isOtherUnit || isPrivCategory);
        if (isTransparentInc || !isIncome) shouldHide = false;

        if (shouldHide) receiptHasHiddenItems = true;
        return { ...x, shouldHide };
      });

      parsedItems.forEach(x => {
        const amt = parseFloat(x.amount) || 0;
        totalAmt += amt;
        let detailStr = '';
        let cleanNote = '';
        let headerTitle = isIncome ? (x.income_type || 'PEMASUKAN') : (x.department || 'PENGELUARAN');

        if (x.shouldHide) {
          headerTitle = '*** (PRIVASI)';
          cleanNote = '<br><span style="font-size: 10px; color: #444; font-weight: normal;"><i>Ket: ***</i></span>';
        } else {
          let details = [];
          if (parseFloat(x.alloc_daerah) > 0) details.push(`Daerah: Rp ${fmt(x.alloc_daerah)}`);
          if (parseFloat(x.alloc_jemaat) > 0) details.push(`Jemaat: Rp ${fmt(x.alloc_jemaat)}`);
          if (parseFloat(x.alloc_bangun) > 0) details.push(`Bangun: Rp ${fmt(x.alloc_bangun)}`);
          detailStr = details.length > 0 ? `<br><span style="font-weight: 500; font-size: 10px; color:#444;">(${details.join(' | ')})</span>` : '';

          if (x.note && x.note.trim() !== '') {
            let rawNote = x.note.replace(/\[BANK\]|\[CASH\]/g, '').trim();
            if (rawNote) cleanNote = `<br><span style="font-size: 10px; color: #444; font-weight: normal;"><i>Ket: ${rawNote}</i></span>`;
          }
        }

        ths += `<th style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 11px; font-weight:700; text-transform: uppercase;">${headerTitle}</th>`;
        tds += `<td style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 12px; vertical-align: top;">${fmt(amt)}${detailStr}${cleanNote}</td>`;
      });
      ths += `<th style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 11px; font-weight:800; background: #e8e8e8;">TOTAL</th>`;
      tds += `<td style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 12px; font-weight:800; background: #fafafa; vertical-align: top;">${fmt(totalAmt)}</td>`;

      finalTableHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #333;">
          <thead>
            <tr style="background: #f5f5f5;">
              ${ths}
            </tr>
          </thead>
          <tbody>
            <tr>
              ${tds}
            </tr>
          </tbody>
        </table>
      `;

      let pihakName = isIncome ? (mainTx.nama_pemberi || mainTx.pihak || 'Umum') : (mainTx.nama_penerima || mainTx.pihak || 'Umum');
      if (receiptHasHiddenItems) pihakName = '*** (Privasi)';
      const docTitle = isIncome ? 'BUKTI PEMASUKAN' : 'BUKTI PENGELUARAN';
      const pihakLabel = isIncome ? 'Telah Terima Dari' : 'Dibayarkan Kepada';
      const signLabel1 = isIncome ? 'Penyetor,' : 'Penerima,';

      const isCopy = (!currentUser || currentUser.role !== 'Bendahara');
      const watermarkHtml = isCopy ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 45px; font-weight: 900; color: rgba(220, 38, 38, 0.15); z-index: 10; pointer-events: none; border: 6px solid rgba(220, 38, 38, 0.15); padding: 10px 20px; letter-spacing: 8px; border-radius: 10px; white-space: nowrap;">CERTIFIED TRUE COPY</div>` : '';

      return `
        <div class="receipt-page" style="position: relative; font-family: 'Inter', 'Helvetica Neue', sans-serif; padding: 15px 15px 10px 15px; max-width: 100%; min-height: 95mm; height: max-content; margin: 0; color: #111; background: white; box-sizing: border-box; page-break-inside: avoid; border-bottom: 1px dashed #ccc;">
          ${watermarkHtml}
          <div style="position: relative; z-index: 1;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #222; padding-bottom: 8px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="data:image/png;base64,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" style="width: 65px; height: 65px; object-fit: contain;">
              <div>
                <h2 style="margin: 0; font-size: 13px; font-weight: 800; text-transform: uppercase;">${systemConfig.header_kuitansi_1 || 'Gereja Masehi Advent Hari Ketujuh'}</h2>
                <h3 style="margin: 2px 0 0 0; font-size: 12px; font-weight: 700; color:#333;">${systemConfig.header_kuitansi_2 || 'Daerah Sumatera Kawasan Tengah'}</h3>
                <h3 style="margin: 2px 0 0 0; font-size: 12px; font-weight: 600; color:#444;">${systemConfig.header_kuitansi_3 || ('Jemaat ' + (systemConfig.app_title || 'Sistem'))}</h3>
              </div>
            </div>
            <div style="display: flex; align-items: center; text-align: right;">
              <div>
                <h1 style="margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 0.5px; color: #000;">${docTitle}</h1>
                <p style="margin: 3px 0 0 0; font-size: 12px; color:#333;"><strong>No: <span style="font-size: 16px; color:#000;">${targetReceipt || '-'}</span></strong></p>
              </div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 12px; line-height: 1.4;">
            <tr>
              <td style="width: 150px; padding: 4px 0; vertical-align: top; white-space: nowrap;"><strong>${pihakLabel}</strong></td>
              <td style="width: 10px; padding: 4px 0; vertical-align: top;">:</td>
              <td style="padding: 4px 0; vertical-align: top; font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pihakName}</td>
            </tr>
            <tr>
              <td style="width: 150px; padding: 4px 0; vertical-align: top; white-space: nowrap;"><strong>Tanggal</strong></td>
              <td style="width: 10px; padding: 4px 0; vertical-align: top;">:</td>
              <td style="padding: 4px 0; vertical-align: top; font-weight: 600; font-size: 13px;">${fmtDate(mainTx.date) || '-'}</td>
            </tr>
            <tr>
              <td style="width: 150px; padding: 4px 0; vertical-align: top; white-space: nowrap;"><strong>Uang Sebesar</strong></td>
              <td style="width: 10px; padding: 4px 0; vertical-align: top;">:</td>
              <td style="padding: 6px 8px; vertical-align: top; font-style: italic; background:#f5f5f5; border:1px solid #ddd; font-weight: 500;">
                ${terbilang(totalAmt).replace(/\s+/g, ' ').trim()} Rupiah
              </td>
            </tr>
            <tr>
              <td style="width: 150px; padding: 4px 0; vertical-align: top; white-space: nowrap;"><strong>Total</strong></td>
              <td style="width: 10px; padding: 4px 0; vertical-align: top;">:</td>
              <td style="padding: 4px 0; vertical-align: top; font-weight: 700; font-size: 14px;">Rp ${fmt(totalAmt)}</td>
            </tr>
          </table>

          ${finalTableHtml}

          <div style="display: flex; justify-content: ${isIncome ? 'flex-end' : 'space-between'}; margin-top: 10px; text-align: center; font-size: 12px;">
            ${!isIncome ? `
            <div style="width: 180px;">
              <p style="margin: 0 0 50px 0; color:#333;">${signLabel1}</p>
              <p style="margin: 0; text-decoration: underline; font-weight: 600; color:#111;">${pihakName}</p>
            </div>
            ` : ''}
            <div style="width: 180px;">
              <p style="margin: 0 0 5px 0; color:#333;">${systemConfig.kota_kuitansi || 'Manado'}, ${fmtDate(mainTx.date)}</p>
              <p style="margin: 0; color:#333; position: relative; z-index: 2;">Bendahara,</p>
              <div style="height: 50px; position: relative; z-index: 1;">
                ${(systemConfig.sig_bendahara) ? `<img src="${systemConfig.sig_bendahara}" style="max-height: 80px; max-width: 150px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); object-fit: contain;">` : ''}
              </div>
              <p style="margin: 0; text-decoration: underline; font-weight: 600; color:#111; position: relative; z-index: 2;">${systemConfig.sig_name_bendahara || '....................'}</p>
            </div>
          </div>
          </div>
        </div>
      `;
    }

    function printTransaction(type, receiptOrId) {
      const arr = type === 'income' ? cachedIncome : cachedExpense;
      const mainTx = arr.find(x => x.receipt_no === receiptOrId || x.transaction_id === receiptOrId || x.id === receiptOrId);
      if (!mainTx) { notify('Transaksi tidak ditemukan.', 'error'); return; }

      document.getElementById('printContainer').innerHTML = generateReceiptHTML(type, mainTx);
      setTimeout(() => { window.print(); }, 1000);
    }

    function openBulkPrintModal() {
      document.getElementById('bulkPrintModal').style.display = 'flex';
    }

    function closeBulkPrintModal() {
      document.getElementById('bulkPrintModal').style.display = 'none';
      document.getElementById('bulkPrintStart').value = '';
      document.getElementById('bulkPrintEnd').value = '';
    }

    function doBulkPrint() {
      const startReceipt = document.getElementById('bulkPrintStart').value.trim();
      const endReceipt = document.getElementById('bulkPrintEnd').value.trim();
      const type = document.getElementById('bulkPrintType').value;
      const myUnitOnly = document.getElementById('bulkPrintMyUnitOnly') && document.getElementById('bulkPrintMyUnitOnly').checked;

      if (!startReceipt || !endReceipt) {
        notify('Harap isi rentang tanggal dengan lengkap', 'error');
        return;
      }

      const arr = type === 'income' ? cachedIncome : cachedExpense;
      let uniqueReceipts = new Set();
      let txToPrint = [];
      const userUnits = getUserUnits();

      arr.forEach(tx => {
        const d = tx.date || '';
        if (d >= startReceipt && d <= endReceipt) {
          if (myUnitOnly) {
            const txUnitLower = String(tx.unit_name || '').toLowerCase().trim();
            const belongsToUserUnits = userUnits.some(u => String(u).toLowerCase().trim() === txUnitLower);
            if (!belongsToUserUnits) return;
          }
          const r = tx.receipt_no || '';
          if (r !== '-' && r !== '') {
            if (!uniqueReceipts.has(r)) {
              uniqueReceipts.add(r);
              txToPrint.push(tx);
            }
          } else {
            txToPrint.push(tx);
          }
        }
      });

      if (txToPrint.length === 0) {
        notify('Tidak ada transaksi pada rentang tanggal tersebut', 'error');
        return;
      }

      txToPrint.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

      let allHtml = '';
      txToPrint.forEach(tx => {
        allHtml += generateReceiptHTML(type, tx);
      });

      document.getElementById('printContainer').innerHTML = allHtml;
      setTimeout(() => {
        window.print();
        closeBulkPrintModal();
      }, 1500);
    }

    async function approveTx(type, id) {
      const isConfirm = await showCustomConfirm('Approve Transaksi', 'Apakah Anda menyetujui transaksi ini?');
      if (!isConfirm) return;
      try {
        await apiPostWithFallback('approveTransaction', { type, transaction_id: id });
        notify('Transaksi disetujui.', 'success');
        await syncAllData();
        renderHistory();
      }
      catch (e) { notify(e.message, 'error'); }
    }

    async function approveBulkTx() {
      const list = window.pendingBulkApproveList || [];
      if (list.length === 0) return;
      const isConfirm = await showCustomConfirm('Approve Semua', `Anda yakin menyetujui ${list.length} transaksi sekaligus? (Mungkin butuh beberapa detik)`);
      if (!isConfirm) return;

      const btn = document.getElementById('btnApproveBulk');
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Memproses...'; }

      notify(`Memproses approval ${list.length} transaksi...`, 'info');
      let successCount = 0;
      let failCount = 0;

      window.isBulkProcessing = true;
      showGlobalLoading(`Memproses 0 dari ${list.length} data...`);

      for (let i = 0; i < list.length; i++) {
        showGlobalLoading(`Memproses ${i + 1} dari ${list.length} data...`);
        try {
          await apiPostWithFallback('approveTransaction', { type: list[i].type, transaction_id: list[i].id });
          successCount++;
        } catch (e) {
          console.error(e);
          failCount++;
        }
      }

      window.isBulkProcessing = false;
      hideGlobalLoading();

      if (failCount > 0) {
        notify(`Selesai. ${successCount} berhasil, ${failCount} gagal.`, 'error');
      } else {
        notify(`Berhasil menyetujui ${successCount} transaksi!`, 'success');
      }

      if (btn) { btn.disabled = false; btn.innerHTML = `${safeIcon('check', 'lucide-sm')} <span style="margin-left:4px;">Approve Semua</span>`; }
      await handleManualSync();
    }

    function editIncType(name, pd, pj, pb) {
      editingIncType = name; document.getElementById('incTypeFormTitle').textContent = 'Ubah Kategori';
      document.getElementById('newIncTypeName').value = name; document.getElementById('newIncTypePctDaerah').value = pd; document.getElementById('newIncTypePctJemaat').value = pj; document.getElementById('newIncTypePctBangun').value = pb;
      document.getElementById('incTypeSaveBtn').innerHTML = 'Update'; document.getElementById('incTypeCancelBtn').style.display = 'inline-flex';
    }
    function cancelEditIncType() {
      editingIncType = null; document.getElementById('incTypeFormTitle').textContent = 'Kategori Baru';
      document.getElementById('newIncTypeName').value = ''; document.getElementById('newIncTypePctDaerah').value = '0'; document.getElementById('newIncTypePctJemaat').value = '100'; document.getElementById('newIncTypePctBangun').value = '0';
      document.getElementById('incTypeSaveBtn').innerHTML = 'Simpan'; document.getElementById('incTypeCancelBtn').style.display = 'none';
    }
    async function saveIncTypeForm() {
      const name = document.getElementById('newIncTypeName').value.trim(); const pd = parseFloat(document.getElementById('newIncTypePctDaerah').value) || 0; const pj = parseFloat(document.getElementById('newIncTypePctJemaat').value) || 0; const pb = parseFloat(document.getElementById('newIncTypePctBangun').value) || 0;
      if (!name) { notify('Isi Nama!', 'error'); return; }
      const btn = document.getElementById('incTypeSaveBtn'); btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Proses...';
      try { await apiPostWithFallback('saveIncomeType', { name, pct_daerah: pd, pct_jemaat: pj, pct_bangun: pb, oldName: editingIncType, isUpdate: !!editingIncType }); notify('Berhasil', 'success'); cancelEditIncType(); await loadMasterData(); renderMasterIncTypes(); initForms(); }
      catch (e) { notify(e.message, 'error'); } finally { btn.disabled = false; btn.innerHTML = 'Simpan'; }
    }
    function renderMasterIncTypes() {
      const resv = ['Perpuluhan', 'Terpadu', 'Khusus Jemaat', 'Khusus Daerah', 'Persembahan Khusus'];
      document.getElementById('incTypeList').innerHTML = (masterData?.incomeTypes || []).map(x => `<div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--glass-border)"><div><span class="badge ${getCatBadge(x.name, false)}" style="margin-bottom:4px;">${x.name}</span><br><small style="color:var(--text3)">D:${x.pct_daerah}% J:${x.pct_jemaat}% B:${x.pct_bangun}%</small></div><div style="display:flex; gap:6px;">${resv.includes(x.name) ? '<span style="font-size:10px; color:var(--text4)">Sistem</span>' : `<button class="btn-icon-only" onclick="editIncType('${x.name.replace(/'/g, "\\'")}', ${x.pct_daerah}, ${x.pct_jemaat}, ${x.pct_bangun})">${safeIcon('edit')}</button><button class="btn-icon-only" style="color:var(--red-pop);" onclick="deleteIncType('${x.name.replace(/'/g, "\\'")}')">${safeIcon('trash')}</button>`}</div></div>`).join('') || '<div class="empty-state">No Data</div>';
    }
    async function deleteIncType(name) { if (await showCustomConfirm('Hapus', `Hapus ${name}?`)) { try { await apiPost('deleteIncomeType', { name }); notify('Terhapus', 'success'); await loadMasterData(); renderMasterIncTypes(); initForms(); } catch (e) { notify(e.message, 'error'); } } }

    let editingDept = null;
    function cancelEditDept() { editingDept = null; document.getElementById('deptName').value = ''; document.getElementById('deptSaveBtn').textContent = 'Simpan'; document.getElementById('deptCancelBtn').style.display = 'none'; }
    async function saveDeptForm() {
      const name = document.getElementById('deptName').value.trim(); if (!name) { notify('Isi Nama Bidang!', 'error'); return; }
      const btn = document.getElementById('deptSaveBtn'); btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Proses...';
      try { await apiPost('saveDepartment', { id: editingDept, name }); notify('Berhasil', 'success'); cancelEditDept(); await loadMasterData(); renderMasterDepts(); initForms(); }
      catch (e) { notify(e.message, 'error'); } finally { btn.disabled = false; btn.innerHTML = 'Simpan'; }
    }
    function renderMasterDepts() { document.getElementById('deptList').innerHTML = (masterData?.departments || []).map(x => `<div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--glass-border)"><span>${x.name}</span><button class="btn-icon-only" style="color:var(--red-pop);" onclick="deleteDept('${x.id || x.name}')">${safeIcon('trash')}</button></div>`).join('') || '<div class="empty-state">No Data</div>'; }
    async function deleteDept(id) { if (await showCustomConfirm('Hapus', 'Yakin?')) { try { await apiPost('deleteDepartment', { id, name: id }); notify('Terhapus', 'success'); await loadMasterData(); renderMasterDepts(); initForms(); } catch (e) { notify(e.message, 'error'); } } }

    function editUnit(name, note, jumlah) {
      editingUnit = name; document.getElementById('unitFormTitle').textContent = 'Ubah Unit';
      document.getElementById('unitName').value = name; document.getElementById('unitNote').value = note || ''; document.getElementById('unitJumlah').value = jumlah || 0;
      document.getElementById('unitSaveBtn').textContent = 'Update'; document.getElementById('unitCancelBtn').style.display = 'inline-flex';
    }
    function cancelEditUnit() {
      editingUnit = null; document.getElementById('unitFormTitle').textContent = 'Tambah Unit';
      document.getElementById('unitName').value = ''; document.getElementById('unitNote').value = ''; document.getElementById('unitJumlah').value = '';
      document.getElementById('unitSaveBtn').textContent = 'Simpan'; document.getElementById('unitCancelBtn').style.display = 'none';
    }
    async function saveUnitForm() {
      const name = document.getElementById('unitName').value.trim(); const note = document.getElementById('unitNote').value.trim(); const jumlah = parseInt(document.getElementById('unitJumlah').value) || 0; if (!name) { notify('Lengkapi ID & Nama!', 'error'); return; }
      const btn = document.getElementById('unitSaveBtn'); btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Proses...';
      try { await apiPost('saveUnit', { name, note, jumlah_anggota: jumlah, oldName: editingUnit, isUpdate: !!editingUnit }); notify('Berhasil', 'success'); cancelEditUnit(); await loadMasterData(); renderMasterUnits(); initForms(); }
      catch (e) { notify(e.message, 'error'); } finally { btn.disabled = false; btn.innerHTML = 'Simpan'; }
    }
    function renderMasterUnits() { document.getElementById('unitList').innerHTML = (masterData?.units || []).map(x => `<div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--glass-border)"><div><strong>${x.name}</strong>${x.jumlah_anggota ? `<br><small style="color:var(--text3)">${x.jumlah_anggota} Jiwa</small>` : ''}</div><div style="display:flex; gap:6px;"><button class="btn-icon-only" onclick="editUnit('${x.name.replace(/'/g, "\\'")}', '${(x.note || '').replace(/'/g, "\\'")}', ${x.jumlah_anggota || 0})">${safeIcon('edit')}</button><button class="btn-icon-only" style="color:var(--red-pop);" onclick="deleteUnit('${x.name.replace(/'/g, "\\'")}')">${safeIcon('trash')}</button></div></div>`).join('') || '<div class="empty-state">No Data</div>'; }
    async function deleteUnit(name) { if (await showCustomConfirm('Hapus', `Yakin?`)) { try { await apiPost('deleteUnit', { name }); notify('Terhapus', 'success'); await loadMasterData(); renderMasterUnits(); initForms(); } catch (e) { notify(e.message, 'error'); } } }
    async function updateMyAccount() {
      const newUsername = document.getElementById('myNewUsername').value.trim();
      const p1 = document.getElementById('myNewPassword').value;
      const p2 = document.getElementById('myNewPasswordConfirm').value;

      if (!newUsername && !p1) { notify('Isi username baru atau sandi baru', 'error'); return; }
      if (p1 && p1 !== p2) { notify('Kata sandi tidak cocok', 'error'); return; }
      if (p1) { const pwErr = validatePassword(p1); if (pwErr) { notify('Sandi tidak valid: ' + pwErr, 'error'); return; } }
      if (newUsername && newUsername.length < 3) { notify('Username minimal 3 karakter', 'error'); return; }

      const btn = document.getElementById('btnUpdateMyPassword');
      btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Memproses...';
      try {
        const payload = {
          username: currentUser.username,
          nama: currentUser.nama,
          role: currentUser.role,
          isUpdate: true
        };
        if (p1) payload.password = p1;
        if (newUsername && newUsername !== currentUser.username) {
          payload.newUsername = newUsername;
        }
        await apiPost('saveUser', payload);

        // Update local session if username changed
        if (newUsername && newUsername !== currentUser.username) {
          currentUser.username = newUsername;
          sessionStorage.setItem('BISDAC_user', JSON.stringify(currentUser));
        }

        notify('Akun berhasil diperbarui', 'success');
        document.getElementById('myNewUsername').value = '';
        document.getElementById('myNewPassword').value = '';
        document.getElementById('myNewPasswordConfirm').value = '';
      } catch (e) { notify(e.message, 'error'); }
      finally { btn.disabled = false; btn.innerHTML = 'Simpan Perubahan'; }
    }

    /* ======== USER MANAGEMENT ======== */
    function editUser(username, nama, role) {
      editingUser = username; document.getElementById('userFormTitle').textContent = 'Ubah Akun';
      document.getElementById('userName').value = username; document.getElementById('userName').disabled = true;
      document.getElementById('userFullName').value = nama; document.getElementById('userRole').value = role; document.getElementById('userPassword').value = '';
      const boundUnits = getUserUnits(username);
      document.querySelectorAll('.userUnitCheck').forEach(chk => { chk.checked = boundUnits.includes(chk.value); });
      document.getElementById('saveUserBtn').innerHTML = 'Update'; document.getElementById('cancelEditUserBtn').style.display = 'inline-flex';
    }
    function cancelEditUser() {
      editingUser = null; document.getElementById('userFormTitle').textContent = 'Tambah User';
      document.getElementById('userName').value = ''; document.getElementById('userName').disabled = false;
      document.getElementById('userFullName').value = ''; document.getElementById('userRole').value = 'Viewer'; document.getElementById('userPassword').value = '';
      document.querySelectorAll('.userUnitCheck').forEach(chk => chk.checked = false);
      document.getElementById('saveUserBtn').innerHTML = 'Simpan'; document.getElementById('cancelEditUserBtn').style.display = 'none';
    }
    async function saveUserForm() {
      const username = document.getElementById('userName').value.trim(); const nama = document.getElementById('userFullName').value.trim(); const role = document.getElementById('userRole').value; const password = document.getElementById('userPassword').value;
      const unitChecks = document.querySelectorAll('.userUnitCheck:checked');
      const unitsArray = Array.from(unitChecks).map(chk => chk.value);
      if (!username || !role) { notify('Lengkapi data wajib!', 'error'); return; }
      if (password) { const pwErr = validatePassword(password); if (pwErr) { notify('Sandi tidak valid: ' + pwErr, 'error'); return; } }
      if (!editingUser && !password) { notify('Password wajib diisi untuk user baru!', 'error'); return; }
      const btn = document.getElementById('saveUserBtn'); btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Proses...';
      try {
        await apiPost('saveUser', { username, nama, role, password, isUpdate: !!editingUser });

        if (!systemConfig.userUnits) systemConfig.userUnits = {};
        while (typeof systemConfig.userUnits === 'string') {
          try { systemConfig.userUnits = JSON.parse(systemConfig.userUnits); } catch (e) { systemConfig.userUnits = {}; break; }
        }

        if (unitsArray.length > 0) {
          Object.keys(systemConfig.userUnits).forEach(k => { if (k.toLowerCase() === username.toLowerCase()) delete systemConfig.userUnits[k]; });
          systemConfig.userUnits[username] = unitsArray;
        } else {
          Object.keys(systemConfig.userUnits).forEach(k => { if (k.toLowerCase() === username.toLowerCase()) delete systemConfig.userUnits[k]; });
        }
        await apiPostWithFallback('saveConfig', { key: 'userUnits', value: JSON.stringify(systemConfig.userUnits) });

        notify('Berhasil', 'success'); cancelEditUser(); renderUsers();
      }
      catch (e) { notify(e.message, 'error'); } finally { btn.disabled = false; btn.innerHTML = editingUser ? 'Update' : 'Simpan'; }
    }
    async function renderUsers() {
      try {
        const res = await apiGet('getUsers');
        document.getElementById('userList').innerHTML = (res.data || []).map(x => {
          const uUnit = getUserUnits(x.username);
          return `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; padding:16px 20px; border-bottom:1px solid var(--glass-border)">
          <div style="display:flex; flex-direction:column; gap:6px; flex:1; min-width:200px;">
            <div style="font-weight:700; font-size:15px; color:var(--text); line-height:1.2;">${x.nama}</div>
            <div style="font-size:12px; color:var(--text3); display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-top:2px;">
              <span style="font-family:monospace; color:var(--text2); background:var(--badge-gray-bg); padding:2px 6px; border-radius:4px; word-break:break-all;">@${x.username}</span>
              <span style="font-family:monospace; color:var(--text); background:var(--glass-bg); border:1px solid var(--glass-border); padding:2px 6px; border-radius:4px; word-break:break-all;" title="Password Saat Ini">🔑 ${x.password || '***'}</span>
              <span class="badge ${x.role === 'Admin' ? 'badge-blue' : (x.role === 'Bendahara' ? 'badge-green' : 'badge-gray')}" style="font-size:10px;">${x.role}</span>
              ${uUnit.map(u => `<span class="badge badge-gold" style="font-size:10px;" title="Terikat dengan Unit">${u}</span>`).join(' ')}
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn-icon-only" style="background:var(--input-bg); border:1px solid var(--glass-border);" onclick="editUser('${x.username}', '${x.nama}', '${x.role}')">${safeIcon('edit')}</button>
            ${x.username === 'admin' ? '' : `<button class="btn-icon-only" style="background:var(--input-bg); border:1px solid var(--glass-border); color:var(--red-pop);" onclick="deleteUser('${x.username}')">${safeIcon('trash')}</button>`}
          </div>
        </div>`;
        }).join('') || '<div class="empty-state">No Data</div>';
      } catch (e) { }
    }
    async function deleteUser(username) { if (await showCustomConfirm('Hapus', `Yakin?`)) { try { await apiPost('deleteRecord', { type: 'users', transaction_id: username }); notify('Terhapus', 'success'); renderUsers(); } catch (e) { notify(e.message, 'error'); } } }

    async function renderLogs() { try { const res = await apiGet('getLogs'); document.getElementById('logList').innerHTML = (res.data || []).map(x => `<tr><td class="fit-col" style="color:var(--text4); font-size:12px;">${new Date(x.timestamp).toLocaleString('id-ID')}</td><td><strong>${x.user}</strong></td><td class="fit-col"><span class="badge badge-gray">${x.action}</span></td><td>${x.detail}</td></tr>`).join(''); } catch (e) { } }

    function notify(msg, type = 'success') {
      const el = document.getElementById('notification'); const icon = document.getElementById('notifIcon'); const text = document.getElementById('notifMsg');
      if (!el || !text || !icon) return;
      el.className = 'notification ' + type; text.textContent = msg;
      icon.innerHTML = type === 'success' ? safeIcon('check', 'lucide-md') : safeIcon('alert', 'lucide-md');
      el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3000);
    }
    window.notify = notify;

    function updateAppStatus() {
      const dot = document.getElementById('appStatusDot'); const txt = document.getElementById('appStatusText');
      if (dot && txt) { dot.className = 'status-dot ' + (isServerOnline ? 'online' : 'offline'); txt.textContent = isServerOnline ? 'Online' : 'Offline'; }
    }

    function updateBottomNavIndicator() {
      const bottomBar = document.getElementById('bottomBar');
      if (!bottomBar) return;
      const activeItem = bottomBar.querySelector('.bottom-nav-item.active');
      if (activeItem && activeItem.style.display !== 'none') {
        const rect = activeItem.getBoundingClientRect();
        const barRect = bottomBar.getBoundingClientRect();
        const center = rect.left - barRect.left + rect.width / 2;
        bottomBar.style.setProperty('--hole-x', `${center}px`);
      }
    }
    window.addEventListener('resize', updateBottomNavIndicator);

    function showPage(pageId) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const target = document.getElementById('page-' + pageId); if (target) target.classList.add('active');
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));
      const activeNav = document.querySelector(`.nav-item[onclick*="showPage('${pageId}')"]`); if (activeNav) activeNav.classList.add('active');
      const activeBotNav = document.querySelector(`.bottom-nav-item[data-target="${pageId}"]`); if (activeBotNav) activeBotNav.classList.add('active');
      const titles = { dashboard: 'Dashboard', pemasukan: 'Pemasukan', pengeluaran: 'Pengeluaran', pindahbuku: 'Pindah Buku', laporan: 'Laporan', riwayat: 'Histori', masterIncType: 'Kategori', masterDept: 'Departemen', masterUnit: 'Unit', users: 'Manajemen User', settings: 'Pengaturan Web', series: 'No. Series', roles: 'Hak Akses Menu', logs: 'Audit Log' };
      document.getElementById('pageTitle').textContent = titles[pageId] || 'Dashboard';
      if (window.innerWidth <= 1100) {
        closeSidebar();
      }
      if (pageId === 'dashboard') renderDashboard(); else if (pageId === 'pemasukan') renderIncomeList(); else if (pageId === 'pengeluaran') renderExpenseList(); else if (pageId === 'pindahbuku') renderMutasiList(); else if (pageId === 'riwayat') renderHistory(); else if (pageId === 'laporan') { document.getElementById('reportContent').innerHTML = ''; } else if (pageId === 'masterIncType') renderMasterIncTypes(); else if (pageId === 'masterDept') renderMasterDepts(); else if (pageId === 'masterUnit') renderMasterUnits(); else if (pageId === 'users') renderUsers(); else if (pageId === 'logs') renderLogs(); else if (pageId === 'roles') renderRoles();

      setTimeout(updateBottomNavIndicator, 50); // Small delay to ensure display is calculated
    }
    function doPrintPembangunan() {
      if (!currentReportData) return notify('Generate laporan terlebih dahulu', 'error');
      if (currentReportData.mode === 'akumulasi') return notify('Laporan Pembangunan hanya tersedia untuk Mode Bulanan', 'error');

      const html = generatePembangunanReportHtml(currentReportData);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.contentDocument.write(`<html><head><title>Laporan Pembangunan</title><style>@media print { body { margin: 0; } }</style></head><body onload="setTimeout(function(){ window.focus(); window.print(); }, 800)">${html}</body></html>`);
      iframe.contentDocument.close();

      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 15000);
    }

    function exportPembangunanExcel() {
      try {
        if (!currentReportData) return notify('Generate laporan terlebih dahulu', 'error');
        if (currentReportData.mode === 'akumulasi') return notify('Laporan Pembangunan hanya tersedia untuk Mode Bulanan', 'error');

        const tableHtml = generatePembangunanReportHtml(currentReportData, true);

        const html = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="utf-8">
          </head>
          <body style="background-color: white;">
            ${tableHtml}
          </body>
          </html>
        `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const month = document.getElementById('rptMonth') ? document.getElementById('rptMonth').value : currentReportData.month;
        const year = document.getElementById('rptYear') ? document.getElementById('rptYear').value : currentReportData.year;
        a.download = 'Laporan_Pembangunan_' + month + '_' + year + '.xls';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        notify('Export Excel Pembangunan berhasil.', 'success');
      } catch (e) {
        console.error('exportPembangunanExcel error:', e);
        notify('Error export Excel: ' + e.message, 'error');
      }
    }

    function generatePembangunanReportHtml(data, isExcel = false) {
      if (!data) return '';
      const targetMonth = data.month;
      const targetYear = data.year;
      const targetDateStart = new Date(targetYear, targetMonth - 1, 1);
      const targetDateEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);

      const isViewer = currentUser && (currentUser.role === 'Viewer' || currentUser.role === 'Publik');
      const isSensorName = isViewer || (document.getElementById('sensorPemasukan') ? document.getElementById('sensorPemasukan').checked : false);
      const isSensorUnit = isViewer || (document.getElementById('sensorUnit') ? document.getElementById('sensorUnit').checked : false);
      const isManualSignature = document.getElementById('manualSignature') ? document.getElementById('manualSignature').checked : false;

      // Pemasukan & Pengeluaran Bulan Ini
      const pemBulanIni = (cachedIncome || []).filter(x => {
        const tDate = new Date(x.date);
        return tDate >= targetDateStart && tDate <= targetDateEnd && (x.alloc_bangun > 0 || (x.income_type || '').toLowerCase().includes('pembangunan'));
      }).sort((a, b) => new Date(a.date) - new Date(b.date));

      const pengBulanIni = (cachedExpense || []).filter(x => {
        const tDate = new Date(x.date);
        return tDate >= targetDateStart && tDate <= targetDateEnd && x.source_balance === 'Pembangunan';
      }).sort((a, b) => new Date(a.date) - new Date(b.date));

      const allTx = [...pemBulanIni, ...pengBulanIni];
      const hasTransactions = allTx.length > 0;
      let gembalaApprovedAll = hasTransactions;
      let ketuaApprovedAll = hasTransactions;
      if (hasTransactions) {
        for (let i = 0; i < allTx.length; i++) {
          const x = allTx[i];
          const isAdminApp = x.approved_by && x.approved_by.includes('Admin');
          const isKetua = x.approved_by && x.approved_by.includes('Ketua Jemaat');
          const isPendeta = x.approved_by && x.approved_by.includes('Pendeta');
          if (!isAdminApp && !isPendeta) gembalaApprovedAll = false;
          if (!isAdminApp && !isKetua) ketuaApprovedAll = false;
        }
      }
      
      const useBenImg = !isManualSignature && hasTransactions && systemConfig.sig_bendahara;
      const useKetuaImg = !isManualSignature && ketuaApprovedAll && systemConfig.sig_ketua;
      const useGembalaImg = !isManualSignature && gembalaApprovedAll && systemConfig.sig_pendeta;
      const useBgnImg = !isManualSignature && hasTransactions && systemConfig.sig_bangun;


      // Saldo Awal Pembangunan (dari awal waktu s.d targetDateStart - 1 ms)
      let calcBangun = cachedSaldo.initBangun || 0;
      (cachedIncome || []).forEach(i => { if (new Date(i.date) < targetDateStart) calcBangun += (i.alloc_bangun || 0); });
      (cachedExpense || []).forEach(e => { if (new Date(e.date) < targetDateStart && e.source_balance === 'Pembangunan') calcBangun -= e.amount; });
      const saldoAwal = calcBangun;
      const fmtEx = (n) => isExcel ? n : fmt(n);

      // Akumulasi Pemasukan
      let sumPemasukan = 0;
      let pemRows = pemBulanIni.map(x => {
        const amt = parseFloat(x.alloc_bangun || x.amount || 0);
        sumPemasukan += amt;
        const hasUnit = !!(x.unit_name && x.unit_name !== '-');
        let dNote = x.note || x.nama_pemberi || 'Pembangunan';
        if (hasUnit && isSensorUnit) dNote = 'Unit *** (Privasi)';
        else if (!hasUnit && isSensorName) dNote = '*** (Privasi)';
        return `<tr>
          <td style="border:1px solid #000; padding:4px; text-align:center;">${fmtDate(x.date)}</td>
          <td style="border:1px solid #000; padding:4px;">${x.receipt_no || '-'}</td>
          <td style="border:1px solid #000; padding:4px;">${dNote}</td>
          <td style="border:1px solid #000; padding:4px; text-align:right;">${fmtEx(amt)}</td>
        </tr>`;
      }).join('');

      if (pemBulanIni.length === 0) {
        pemRows = `<tr><td colspan="4" style="border:1px solid #000; padding:4px; text-align:center;">Kosong</td></tr>`;
      }

      // Akumulasi Pengeluaran
      let sumPengeluaran = 0;
      let pengRows = pengBulanIni.map(x => {
        const amt = parseFloat(x.amount || 0);
        sumPengeluaran += amt;
        const hasUnit = !!(x.unit_name && x.unit_name !== '-');
        let dNote = x.note || 'Pengeluaran Pembangunan';
        if (hasUnit && isSensorUnit) dNote = 'Unit *** (Privasi)';
        else if (!hasUnit && isSensorName) dNote = '*** (Privasi)';
        return `<tr>
          <td style="border:1px solid #000; padding:4px; text-align:center;">${fmtDate(x.date)}</td>
          <td style="border:1px solid #000; padding:4px;">${x.receipt_no || '-'}</td>
          <td style="border:1px solid #000; padding:4px;">${dNote}</td>
          <td style="border:1px solid #000; padding:4px; text-align:right;">${fmtEx(amt)}</td>
        </tr>`;
      }).join('');

      if (pengBulanIni.length === 0) {
        pengRows = `<tr><td colspan="4" style="border:1px solid #000; padding:4px; text-align:center;">Kosong</td></tr>`;
      }

      const mNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const monthName = mNames[targetMonth];

      const ts = `border-collapse:collapse; width:100%; font-family:sans-serif; font-size:10pt;`;
      const th = `border:1px solid #000; padding:4px; font-weight:bold; text-align:center;`;

      let html = `
        <table style="width: 100%; border: none; margin-bottom: 20px; color: #000; font-family: sans-serif;">
          <tr>
            <td style="width: 100px; border: none; text-align: left; vertical-align: middle; padding: 0;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA0gAAANICAYAAAD958/bAAAABmJLR0QA/wD/AP+gvaeTAAAgAElEQVR4nOzde3hdZZ3+//uzdpqeoJzLqWLb7PRgtFKSnVJgNHJGBMFxJ2lLURERUcbxgMfxa3XGGdRR+anjARA5t2lUHM8KQscBSpN28DDl1KRULCii0AItbZO9Pr8/Cg6UtiTpWvtZe+/367q8vEqyP8+tpO2+91rPsyQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABg6Cx0AABAhi1SNHd1076Dowb2jQZK+8U539fj3L5R5Pt67Psq0r7mtq/L6iXfR1Ld9v+2epnGyzVeUr2kcZJG7zC9TtLeO1l1UNJTO/nnGyS5pI2SDUrxRlO0zeWbJN8kRdtM8UZJG2OzDebaYGYb4jjekHN7YlsutyHa9NSGVT98ZHNy/wcBAKoNBQkAatAxCxsmbt1mk3Kyw1w6yM0PNfeJkh3k0qEmTZTrIJkOUvX9XbFZ8j9L9idJj7n0ZzP/oxQ95h7/2Tx6JDZ/eOOTWt/3076tocMCAMqr2v7SA4Ca13xB86i6p5+YHLs1qKSXSXqZougIxf4ymSZJOkLSmMAxK8WfJK13ab25PyTpIUVa76Xcg9Fg1N9z031/DR0QAJAsChIAVKCmYlP93tG2hkHzRkkN5sq7lDepQdLLtf32NaTvCcn6JPXL4j6L1RdLffWjtebO6/r/HDocAGD4KEgAkGHNFzSPip7aOM1ivUKmqXI1uekVcr1SL97Tg2zZIFO/ue6RabXHukd10ereGx94UNv3UgEAMoiCBAAZMWdBflI8oNkyzZbbkWb+KpemSMqFzoZEbZB0j6TfyP1ui/zuxzdGv2O/EwBkAwUJAMrPWjumNrrZbMU2202zTZot6aDQwRDMoMvuMdPd8u3/qd8S3X3HD+7f2Wl+AIAUUZAAIGVzFuQnDG6LZ+Vy0bHuOk7S0ZIODJ0LFWGtSXe4bFUUx7cfof5fd3erFDoUAFQzChIAJGmRotZ7p70qtvi4yDXHpTmSGsWft0jGU3L1mnSXS3eNrtt2++03PvRE6FAAUE34CxsA9kCxqNy6uvwMuR8rtxNlOl6uA0LnQk1ZK9ktpvgON93Wu6T/D6EDAUAloyABwDC0tbXVbTrkD60uazPXa0w61qW9QucCnuPSvZH8V7LoV2aDv1yx+MFHQ2cCgEpCQQKAl1CYP22q4tKJcjtR0omS9gudCRiGZ68w+S2jnsn9jIMfAGD3KEgAsIO5xab9S9HWE9x0ktxPkmxy4EhAUrZIdoeZ31xy3byqq+9u8UwmAHgBChIA6NmrRCU/Q4rfINlrJY0KnQkog8dM+pmkH1qdfr7ihr4nQwcCgNAoSABqUrGo3FpNnRtZ9AY3nWnSzNCZgMC2SH67md0ij2/q6Vr7QOhAABACBQlAzWgqNu01LrfldMneJNepkiaEzgRklct+G5nfZFb63orFD/42dB4AKBcKEoCqduRZk/etH113kqQzXHqTpPGhMwGVx9fJ9YPYvXtV99o7xL4lAFWMggSg6jTPm3ZgVCqdLbO/l3S82E8EJMak38v1vVj+3ZVL++8UZQlAlaEgAagKc4uTxpaiMW9w6VxJp4hSBKTPtV7y7z17Zen20HEAIAkUJAAVq1hUbp1Ne51ZfK6ks3lgKxDUPWbqHiz59f/T3d8XOgwAjBQFCUDFaWlvODYyLXSzN8t1QOg8AF7AJS13042jSqMXL+9e/XjoQAAwHBQkABWh+ZyZh0YDg+2Sv13Sq0LnATAkWyXdbNK14x6ddNOyZcsGQwcCgJdCQQKQWU3FpvpxtvUUmRZKOltSXehMAEbsEbmui+rib624ce2a0GEAYFcoSAAyp6Wj4ZXmeociW8AtdEDVcclvN9e3cr516fLu9c+EDgQAz0dBApAJTcWm+vHR1je6/ALJThB/PgG1YKNkXa74Kyu7+v83dBgAkHgDAiCwucVph5dy8Ts81rtkmhg6D4BATKvM/culffZdvOryVQOh4wCoXRQkAOW3SFHrvY2vd/lF2v7Moih0JAAZ4f5HRfpWXSn3jeXdDzwcOg6A2kNBAlA2TcWmvcbltsx3t380aWboPAAyrSTpp+5+6cql/XeEDgOgdlCQAKSutTh9ilvpnTJdIGm/0HkAVBhuvwNQRhQkAKmZU2xo9sje69I8cUQ3gD3l/keL7HJtrftKz033/TV0HADViYIEIFmLFBXuyZ8u08ckHR06DoCqtEnu34rdv7Cqe+1DocMAqC4UJACJ2H5M95ZOl31U0ozQeQDUhAGTlnikz/Yu7lsdOgyA6kBBArBHjj1z+t7bxsbnSX6JpMND5wFQk1zSjznQAUASKEgARmR2MX9QXaT3S3qXpH1C5wEASTKz293iz/Qu7v9Z6CwAKhMFCcCwNM+bdmDO4/e4632SJoTOAwC78GuT/rWnq+872n6FCQCGhIIEYEgoRgAq1G9M+gxFCcBQUZAA7NbsYv6gOtMHZLpY0rjQeQBgJFz220j+LxQlAC+FggRgp1rPnnGA6gc+7LL3SBobOg8AJGRlJH18RVffL0IHAZBNFCQALzBr4azxYwY2v8ddH5G0b+g8AJCSO+T2sd6la34VOgiAbKEgAZAkNV/QPCp6csPbFGuRzA4NnQcAysNvURxd0tu95tehkwDIBgoSUOsWKWq9N//3Lv2bpIbQcQAggFjSd2Ppo6u6+vpDhwEQFgUJqGGFzqknyKN/l3Rk6CwAkAEDkn17MPZ/uru777HQYQCEQUECalDzvGkzojj+tKRi6CwAkEGPm+lzj2/UZX0/7dsaOgyA8qIgATWked60A6NS6RMyu0hSXeg8AJBxa0z6OEeDA7WFggTUgLnFSWNLuTH/4K6PiYe8AsBw3SXzD/Qu6b8zdBAA6aMgAVWu0J4/Q+Zflmxy4CgAUMncpOstKl2yYvGDj4YOAyA9FCSgSrV2TJ3mHv1/Mp0aOgsAVJGNZvq3TaXRX1rdvXpb6DAAkkdBAqrMsw96vcRdH5VUHzoPAFQnv9/c3tuztO/noZMASBYFCage1trRsNBln5V0SOgwAFAjfpSzuovvWnLfutBBACSDggRUgebi1FdFUfQNSceEzgIANWizmT5dmrDPF1ddvmogdBgAe4aCBFSwZ0+n+zC30wFAJvxO5hdy2h1Q2ShIQIVqaZ/6erPoq5KmhM4CAPgbN+l6bat7X89N9/01dBgAw0dBAipMoTj5EIvqPufSwtBZAAC79KjJP9TT1X9t6CAAhoeCBFQOa21vfKebXyppn9BhAABD8vOc1V3IIQ5A5aAgARWgtTh9ikfxFZKfEDoLAGDYNpvp0z0z+j6vRYpDhwGwexQkINus0NnwDnP7gkt7hQ4DANgjd3ice/vK7vvvDx0EwK5RkICMKsyfNtVL8ZUmvS50FgBAYp4x06deXur79+5ulUKHAfBiFCQgaxYpKtzXcL7cvihpfOg4AIAUmJbn3N5+V9eae0NHAfBCFCQgQ47unDG55IPXSHpN6CwAgNRtMdMi9iYB2UJBAjKitaPhXJd9VdLeobMAAMrJfimL39a7pP8PoZMAoCABwR2zsGHiwFa7QqYzQ2cBAASzUeYf6l3Sf3noIECtoyABARU6Gt8k+TclHRg6CwAgPHN9RwN1F/bcdN9fQ2cBahUFCQhgzoL8hNKgvmLSuaGzAAAy5xFzndeztO/noYMAtYiCBJRZa+fUFnm02KV86CwAgMxyuX9ls4+5ZHX36m2hwwC1hIIElI8VOhr/QfLPSaoPHQYAUAFMq6IonrfixrVrQkcBagUFCSiD2cX8QaMiu9rlrw+dBQBQcZ6S66LepX3Xhw4C1AIKEpCy1nkNx3ts10k6LHQWAEDlMum6TfHoi1Z3r346dBagmlGQgJS0tbXVbTp4/T9L+pCkKHQeAEA18PtNuY6ergd+EzoJUK1yoQMA1aj5nJmHDo7b8ANJ54gPIoCqY9J/RtJ7Y2mSSVNC50EtsQMlf8vhrzzgkUdWP/7r0GmAasQbNyBhLZ35NnMtlnRI6CwAUrFpczz6kNXdq59+9vf7baEDoTaZ6apcact7lnevfyZ0FqCacNsPkBwrdDS+11y/EOUIqFou3fG8PSAbg4ZBTXPXeYPRmDuPKjbw2AggQRQkIAFzFuQnFDry3ZJfJmlU6DwA0hOZlofOADzPkbnIVrV25IuhgwDVgoIE7KGWzvzseFC/lvT3obMASJ+57gydAdjBBJe6WjsaPlcssr8c2FMUJGAPFDobOsx1u9ikDdSKeDCOV4QOAeyEueySdbn8L49Z2DAxdBigklGQgBEoFpUrtOcvldtiSeNC5wFQNr9b1b2WfUfILtdrB7bZyjnFhubQUYBKRUEChum4+Ufsty7K/1imD4uTIIGa4rJfhc4ADMHLPLJlLZ35N4cOAlQiChIwDC3F6dO3lurvlHRK6CwAyi+SfhE6AzAULu1lrqWF9vylWsT7PWA4+A0DDFFre8NZFpV6Jc0InQVAEAOjnon+K3QIYBhMpg+33NPwgzkL8hNChwEqBQUJGIJCR+N73ey7kvYOnQVAIKY77/jB/U+FjgEMl5mdHg/qjqM7Z0wOnQWoBBQkYDfa2trqCh35rz37fCN+vwA1zNxvDp0B2AOvLGlwZaG98TWhgwBZxxs+YBfmFpv2f/rg9b+Q9K7QWQCEV4r9B6EzAHvEdYDMf9HSmV8YOgqQZRQkYCeOKjbkB6Mtd5r0utBZAGTCmlXda38XOgSQgNHmuobDG4Bd4zcGsIPWeQ3H5yLrkWx66CwAMuO7oQMACdp+eMN9Dde3vXXymNBhgKyhIAHPU2jPn+Ox/VTSfqGzAMiOWOoOnQFImrnN2/RM3W3N86YdGDoLkCUUJOBZhY78R2S6VlJ96CwAMmXtqq6+u0OHAFJydBTH/zV7/pSXhw4CZAUFCTWvWFSu0J7/qqR/k2Sh8wDInGskeegQQIpeUTcYLW/uyB8VOgiQBRQk1LT8afnR63L5G2V6d+gsADIpHsyVrgkdAkid2aE56b8K8xpODR0FCI2ChJo1t9i0/34T/Ga52kNnAZBZN99944O/Dx0CKAeX9lJsP2ztyJ8fOgsQEgUJNanQ2fCywWjrHZL9XegsADLM/NuhIwBlVufS5YXOhg+GDgKEQkFCzSnMnzZVbsskzQidBUCmPby5NOam0CGAAExuny+05y8Ve3NRgyhIqCnNHfmjNBgvlzQ1dBYAGWd+2eru1dtCxwCCMX24pbPhazxQFrWGH3jUjNbOaX8XSbfKNDF0FgCZ99TAltKVoUMAoZnbhYV7G29ovqB5VOgsQLlQkFATWjsbT3ePfy5pn9BZAGSfua789ffXbQidA8gG78xtfPL7zWccNi50EqAcKEioei3tjfPc/SZJY0NnAVARNpfqR30+dAggS1z++tz48T9vLk7lg0ZUPQoSqlprZ+N8M79OErcGABgSl3911fX3/jF0DiBr3P24KIpubT17xgGhswBpoiCharV25M939+sk5UJnAVAZTHq6vl5fCJ0DyLCjvH7wluZ50w4MHQRICwUJVamlM/9uly4XP+MAhsP0hTuv6/9z6BhAxh0ZxfGtxyxs4NAjVCXePKLqFDry7zLXV8SzGwAMh2v9llHj2HsEDM2rBrbpV3OL0w4PHQRIGgUJVeXZJ39/TZQjAMNkpvf/9rrfbgqdA6gcNn0wim+bsyA/KXQSIEkUJFSNQnv+o3Lj018Aw+e6taerrzt0DKACNcaDWlbobHhZ6CBAUihIqAotHY2XyPSvoXMAqEhbI9fFoUMAFazB3G6d3Tn9sNBBgCRQkFDxCh2N7zX550LnAFCZ3PTpFd1994TOAVQyl/J1XlrWfM7MQ0NnAfYUBQkVrbUjf77kXwqdA0DF+rVP2Idbc4FkNEYD224rFCcfEjoIsCcoSKhYLe3581z6pjiQAcDIDLrpvFWXrxoIHQSoHjbdo1E/52GyqGQUJFSk1vaGt5jpCvEzDGCkzD+6cknf3aFjANXG5LO8fvCWucWm/UNnAUaCN5eoOC3tjfPc7Crx8wtg5H7au6T/C3s6JFdy/hwCdu7IUrT1J03Fpr1CBwGGiz/YUVFa5jWeZOZXi59dACP3qOLB8yT5Hk8yTdjzOEB1cmnO2GjrD9reOnlM6CzAcPAmExWj0N74Gov9PyXVh84CoGINuqmzt3vdn5IYVops7yTmANXKpNdt2jzqxra2trrQWYChoiChIsyZN2WWzL8vaWzoLAAql0uXrFzStyzBkfskOAuoTuZnbzpk/be1iPedqAz8oCLzWorTp8el3M2S9gudBUBFu2FlV99liU50pyABQ+E6p/We/L+HjgEMBQUJmTZnQX6SRYM/k2li6CwAKtqv482bL0h6qEn5pGcC1cpN7yt0Nn4idA7gpVCQkFmtZ884IB7UzZJNDhwFQGV7OKrTGat++MjmpAe7bGbSM4Gq5v7pQkf+XaFjALtDQUImzS1OGuv1g/8paUboLAAq2pOm6PQVN/StT2O4uV6Rxlygyn210NH4ptAhgF2hICFzikXlBqIxN0o6NnQWABVtm0V+dk/XA79JY/icBfkJMh2exmygykWSX99azM8NHQTYGQoSMufBqPFLJp0VOgeAiuYmf0fP4v5bU1tgQHMlWVrzgSo31nP6YUtx+vTQQYAdUZCQKYX2/EdNfnHoHAAqm5k+2tPVf22aa7jsxDTnA1XPdYBFpZ8WipMPCR0FeD4KEjKjpb1xnkyfCZ0DQKWzy3uW9H02/WWcggTsuSnK1f2oqdi0V+ggwHMoSMiEQufUE8z8anG7CoA9YNJ/To7XXJT2OrOL+YMkvTrtdYCa4GoeF21d2tbWVhc6CiBRkJABLcXp0+VRt6T60FkAVLRflTZvnt/drVLaC+VMZ4gPdIAknbb54PVfCh0CkChICGxusWl/i0o/lLRf6CwAKpdJK+qfyb0hjWcd7XS9SOeWYx2glrj0npbO/LtD5wD49AvBNF/QPCrasPFnMh0fOguAivabunj08cu7Vz9ejsWai1OPiKLoQfEhI5CGksnO6ula86PQQVC7+MMdwUQbn/wq5QjAnvH7o6h0SrnKkSRZLjpH/P0JpCXn8hubi1NfFToIahd/wCOI1s78hyW/IHQOABXtAcWlthWLH3y0bCsuUmSut5ZtPaA27R1F0X8es7BhYuggqE0UJJRda3vDWe7619A5AFQyXyfzE3u71/2pnKsW7m08S1JjOdcEatSUgW12U/60/OjQQVB7KEgoq+Z502a42TXiZw/AyD2sXO6E3iX9fyj7yuYfLPuaQO06Zt8Jujx0CNSeXOgAqB3HzT9iP4+j2yQdGjoLgIr1qMe5163seqCv3Au3dk77O7n/v3KvC9Qyk159+Cv3f+yR1Y/3hs6C2sGn+CiLYlG5raX6xS7lQ2cBULEejWIdv7L7/vtDLO4efzTEugB0WaG98TWhQ6B2UJBQFuus8VJJp4TOAaBiPebyE1d0990TYvFn35ydFmJtABqlyL/XWpw+JXQQ1AYKElLX0t749zL/QOgcACrWY3Ecn7Cyq/9/A61vivzSQGsDkCTXAR6Vvtd8xmHjQkdB9aMgIVWtHdNebebXiocSAxiZx+I4PmFV99rfhQpQaM8X5Zoban0Af3NkNG4chzYgdRzSgNQcN/+I/QY9ulUSzzEAMBJ/iaLSib1dDwYrR/nT8qPHjdF3Je3/gi+41ivyL0s2UdKBQcIBtWnWYa/c76+PrH6iJ3QQVC+uICEttrVUf60k7hcGMBJ/MUUnrlj84G9Dhth3b31kZ4fLWBSf3buk/xPufn6IXEAtM9kXmjsb54TOgepFQUIqCh35D0t6Q+gcACqQ6a+m6MSergd+EzJGS3H6dDO96OQ6k37fs2TtSknKjbLflz8ZUPPqI/elrWfPOCB0EFQnChIS19KZb5P0z6FzAKhIG0zxqaHLkSSzKP4PSaN3/IJLtwfIA+CFjvD6UlexyHYRJI+ChEQ1nzPzUHMtllQXOguAivO4m45/7upMSIXOxrdIfsLOvuam5eXOA2Bn/IR1Uf7joVOg+lCQkJi2tra6aGBgiaRDQmcBUHE2mMWnrFzSd3foIHMW5CfJ/Yu7+rqV7I5y5gGwW59sbc/znEUkioKExGw6eP0/S+JJ1wCGKzNXjrRIUWlQ10rabxff8dRkrQl2qh6AF4ncdN3c4rTDQwdB9aAgIREt8xpPkvSh0DkAVJzH3XRiFq4cSVLrvfl/NOl1u/q6S8u7u1UqZyYAL+mggSi+Tot4X4tk8IOEPTZn3pSDLfZrxc8TgOF5PJZOyko5auloeKVLn9nd95j5zeXKA2DoTHpd4Z7Gj4XOgerAG1rsKYvj3JVi3xGA4dkgxaeu6ur7n9BBJGnWwlnjTdYlaczuvi+y+BdligRguMw/2dLecGzoGKh8FCTskZaOxg+K5x0BGJ4NUnxyb9fa3tBBnjNm2+avS3rFS3zboysWP8j+IyC76sxs8dxi0/6hg6CyUZAwYq2dU1tM/i+hcwCoKJkrR4WO/EUuLXyp7zPpF5K8DJEAjNzLBqOtl4cOgcpGQcKIzFmQn+AeLZFUHzoLgIrxeCydkKVy1No5tUXSLo/0fr7Y7acpxwGQjL9v6Wh8Z+gQqFwUJIxIaVBfkdQQOgeAivF4LJ2UlT1HknTMwoaJ8ug7kkYP4du35kb5j9POBCAZJv9iS3H69NA5UJkoSBi21vaGs0w6N3QOABUjUwcySFLzBc2jBgZsqUsvH+JLfrHihr4nUw0FIEnjLCrd2HxB86jQQVB5KEgYlmMWNkx02TdD5wBQMTK350iSoo1PflWu1w71+839u2nmAZCKo3JPbvx46BCoPBQkDIdt26qrZJoYOgiAipC5PUeS1NrRcLHkFwzjJQM5H/PD1AIBSI27Pt5SnNYaOgcqCwUJQ1bobHiHmZ0eOgeAipC5PUeSVJjXcKrLhnQow9+4/Wh59+rHU4oEIF11FsXXNZ9x2LjQQVA5KEgYksL8aVPl9u+hcwCoCJnbcyRJc4oNzRZbt6S64bzOTFelFAlAeUyLxo77XOgQqBwUJLykYlE5leJrJe0dOguAzHsii7fVFeZPmxpH9mOX9hrWC93/OO7Rw3+WUiwA5WK6qLU9f0roGKgMFCS8pHW5hvdJOjZ0DgCZt0GKT8nalaPmedMOVKn0E0kHD/vFZtcsW7ZsMPlUAMrM3HTVkWdN3jd0EGQfBQm71doxdZrcPh06B4DMy+SVo+YzDhuXi+MfSTaS56GUlIuuSDwUgFAOGzWmjlvt8JIoSNi1RYpcdqWksaGjAMi0TF45KhaVs3HjbnBpzkheb66bem98YG3SuQAE5Dp/Tkf+5NAxkG0UJOxS4d7GiyX7u9A5AGRaJp9zJEnrLP//mXTWiAe4hnfaHYBKYC5dfuyZ09lXjV2iIGGnWovTp5j8X0LnAJBpmS1HLe35T8r07j0YcWdPd9/yxAIByAyXXj4wtvSvoXMguyhI2BnzqHTVsE97AlBLnohiPzGL5ai1M/92M31yj4a4Lk0oDoAMcumiQnvja0LnQDZRkPAihY78hZLaQucAkFlPRLGftKK7f1XoIDsqtOfb3fVNSTbSGSat6F3a98MEYwHInsjMvzW3OIl91ngRChJeoFCcfIgkLjsD2JUNUnxKJsvRvIZTZbpWUm5P5sSRfSKhSAAyzKV8ycb8U+gcyB4KEl4oqvuyJJ4RAGBnMrvnqNA+7UTFdpOk0Xsyx8xuX7l4zc0JxQKQcW76UGvHtFeHzoFsoSDhbwrzGk6VVAydA0AmZbccdTYcYxbfJGnMHo6KS9IHk8gEoGLUSfE3tYj3xPg//DBA0vaHKSq2/widA0AmZbYctXTmZ8vtx0kcKuPSt1ctWbMiiVwAKodLcwr3NLw9dA5kBwUJkiQbN/aTkqaGzgEgczZ4HJ2SxXLUXJz6KpNuVjK3BT9p8SB7EYBaZfbZYxY2TAwdA9lAQYLmzJsyy2TvC50DQOY8EcV+4sruB3pCB9lR87xpMyKLbpHrgEQGmn2it3vdnxKZBaAS7TewzXg4NCRRkCBZ7LlvSBoVOgiATMnuUd7zp02N4vgWmZL6tPeuyaU13GIMYEGhfdqJoUMgPApSjSt0Nr5FrrmhcwDIlMyWo+bi1CNUKv1S0uEJjdyak53X3a1SQvMAVDC3+MvNFzTzoXGNoyDVsDkL8hMUxzzzCMDzbfA4OjWL5ajQ2fCyKIpulWxyYkNdn7qra829ic0DUNFMmhlt2PAPoXMgLApSDYsH9SmZHRo6B4DMeMIsPimLe47mLMhPktttkhqSmmnSivF/nvT5pOYBqBJm/6/5nJm8P6phFKQaVZiXb5L07tA5AGTGE2bxyT1L1q4MHWRHc4vTDvdBJVqOJG1UnJu3bNmywQRnAqgOE3IDA58NHQLhUJBqlMf6ojiYAcB2Gz2OTs1iOZozb8rBA1F8s0v5JOea2UU93fc/uMeDPB6bQBwAGePSOYX2xnvQOM4AACAASURBVNeEzoEwKEg1qLUjXzTp5NA5AGTCE2ZxNo/yPmfmoXEc/ZdJMxMdbLqiZ8maGxOZNWATEpkDIGtM5l8qFpULHQTlR0GqMc1nHDbOpX8PnQNAJmzI6m11heLkQ6KBgVslm57w6JXjxwwmtwHbREECqtdRD0aN54cOgfKjINWYaPz4D0g6InQOAMFt9Dg6JYvl6JiFDRMV1d0iaUaig01/tTjXvuzqdVuSGunSPknNApA9Jv/n5uJUfp/XGApSDSkUJx8i90tC5wAQ3Ias3lZ3zMKGiQPb7DZJTQmPHoxiLyay7+h5YosOTnIegMw5KIqij4QOgfKiINWSXN2nJe0dOgaAoDaYxSdl9crRwDb7paRXJD3b5O9fsbT/tuTnxsnujwKQRf84e/6Ul4cOgfKhINWIozsaZ8r1ttA5AASV2dvqZhfzBw1ss1skvTLp2S59saer/ytJz90+3BIvcwAyZ0xdKfevoUOgfChINaIk/5KkutA5AASz0ePo5CzeVje7mD+oLtIvJb0qhfHdK2f2pXdrsSV/tQtAJs0rdDYcEzoEyoOCVAPmdORPlnRK6BwAgtkgxSdlsRwds7BhYl2kW5VCOTKz28ePHTxXixQnPVuSWs+ecYCkw9KYDSBzzBTx8NgaQUGqcsWicjHHegO1bIMUn9zbtbY3dJAdPW/PUeK31Ul+v7bmzkryxLoXqR88XpKlNh9Aprj7cYWOxjeFzoH0UZCq3Lpc40Klc9sKgOzb6HF0ShbLUZp7jiQ9Vor1hp6b7vtrCrP/xmUnpjkfQBb5v7W1tbFlocpRkKpYU7GpXu6fCJ0DQBC1uudocySd+T/d/X0pzN6BU5CA2jPt6Ynrzw0dAumiIFWx8dGWd0qaGjoHgLKryT1HkgbMrH1FV99dKcx+gaOKDXnx5ytQk8z0yba3Th4TOgfSQ0GqUrMWzhrvso+HzgGg7Gr1trqSu72lZ8maH6cw+0Vykc0vxzoAMumIp5+puzB0CKSHglSlRg88835JPOEdqC2Zva3u2StHad1W53J/18qlaxanMHtXS1KQgBpm0sfnLMhPCJ0D6aAgVaHj5h+xn9zfFzoHgLLKdDl69rS6dMqR9J7epf1XpDB7p+Z05I+WbHq51gOQSQfGg/rH0CGQDgpSFdpSGvURSfuFzgGgbDK952hgm92qdG6rk8w/1NvV97VUZu9CLC0s53oAMusDzfOmHRg6BJJHQaoyheLkQ0z2ntA5AJRN1p9zdKukpjTmu2tR75L+sj7n7bj5R+xnEidYAZCkCRaXLgkdAsmjIFUZj+oukTQudA4AZbExNjs1w+Xol0qpHEm6bOXSvk+lNHuXtpVGXeTSXuVeF0A2mezdxyxsmBg6B5JFQaoizfOmHRhJF4TOAaAsNsZmp6xasmZF6CA7el45Sue2Otd/9Hb1lX2fZf60/Gh3vbvc6wLItPED24x931WGglRFopJ/mE82gZqwwePo5AyXo/T2HElX9i7tuzil2bu1395+rswODbE2gOwy6T3sRaouFKQq0Txv2oFmzpn8QPXbGJudmuEDGdK8re7bvTP73qntJ9eVVVOxqV5mHyn3ugCyz6W9Io/fHzoHkkNBqhK5uPQhrh4BVa92b6uTX907s+98LVKczvzdG2dbLpY0NcTaALLPXBfPLuYPCp0DyaAgVYHWs2cc4DKuHgHVrXbLkdk1vTP73x6qHB151uR9FdlHQ6wNoDK4tNco47lI1YKCVAV89OAHJO0dOgeA1NTsniOXru2dsea8UOVIkkbV131ErgNCrQ+gMrjp4rnFpv1D58CeoyBVuDkL8hPkuih0DgCp2ehxdEqG9xyl9pwjma6fEvcFLUdz5k9tlOm9L/qCabncL5D0u/KnApBRew/aNt6TVQEKUoXzAbtQ0j6hcwBIxUaPo5NrshxJN0wu9b21u1ullOYPhcWl3Ncljdnhn2+1rXVn9C7tv8I95uAGAM/jFzefcRjPo6xwFKQKlj8tP9rNX/zJJoBqsDE2y/KVo/ROqzMtHf/opNDlSC2d+XMkP+FFX3Dd0XPTfX+VpCjSn8seDEB2mSba+HFvCx0De4aCVMH229vPlXRY6BwAErexVvccSbZkcqlv/rJlywbTmT80c4tN+5vrCzv7mpstL3ceAJXDXB9oa2urC50DI0dBqlDFonIyuyR0DgCJy/qVoxRvq7Mlk+M154S+ciRJpWjrZZJ2fmSvl+4sbxoAFWbK5kMebg8dAiNHQapQv4/yb5LUGDoHgERVwlHeKd5Wd/jCLJSj1s6Gs11auIsv+ygfe1dZAwGoOLHrw5IsdA6MDAWpQrn0odAZACQqs+VozrwpB6d6lLf54izcVidJszunH+ayK3bzLfcu7179eNkCAahIJp/V0tFwaugcGBkKUgUqtDe+RlJL6BwAEpPpchTHudSuHLn54iml/kxcOZJkdXHpW7t75pGb/6qcgQBULlP0gdAZMDIUpMrEk5qB6kE5ykY5UqGz8WKZdvuJr3l0c7nyAKh0fnxzceqrQqfA8FGQKszRnTMmy/zM0DkAJCKz5eiYhQ0T4zh3i1Lcc7TXn152blbKUUtxWqvcP/8S31Yandt6W1kCAagGZlHE41gqEAWpwsTx4D9IyoXOAWCPZbocPXsgQzpHeZuWjv/TpAVZ2HMkPXukd1TqklS/22809dx+40NPlCcVgGpg0jlz5k05OHQODA8FqYIce+b0vd10XugcAPYY5Sgj5UiLFA1GW6+XbPJLfatJv0g9D4BqMzr2ugtCh8DwUJAqyMDYwbdK2id0DgB7JLPlKO3T6iTdmJXT6p5TuDf/T5JOG8r3usc/TjkOgGoUx+9qKjbt/go1MoWCVDnMpXeHDgFgj2yMpFOzWI7Ksedo/KOT3pKVPUeS1NKRf6OkTw7x2//Q27V2ZZp5AFQps0PH5rZ2hI6BoaMgVYjWjsbTJZseOgeAEdsYm52yoqsvcw8ZrcUrRy0dDa806ToN8e9Bc31HkqebCkC1MonDGioIBalCuPyi0BkAjBhXjjJ05WhusWl/k31f0t5DfY1H/p0UIwGodq7mQsfUQugYGBoKUgVoLU6fIumU0DkAjEjWrxzdpvSuHN2QtStHTcWm+sFo63clNQzjZQ/3zujP3L8/AJUmelfoBBgaClIFcCu9U/y7AipRJVw5ekUqC2y/cvTWLF05kmTjctsul9Q2vFfpWi1SnEoiALWkc26xaf/QIfDSeNOdcc+eevK20DkADNvGSDo1i1eOau4o72cV2vP/Jve3DPd1sUXXppEHQM0ZOxhtWxg6BF4aBSnjxue2vVmmiaFzABiW2i1HUlcWy1FLR+M7Zfrw8F/p/71q8QP3JZ8IQG3yCyVZ6BTYPQpSxrnHF4bOAGBYMluOyrLnKO7LXDkqdDS+yeT/MaIXW3RVwnEA1LYZc9ob2kKHwO5RkDLs6I7GmZIdFzoHgCF7MqvlKPU9R1JXBvccqbmzcY7k10nKjeDlj9WVnulKOhOA2habvTN0BuweBSnDStuvHnEZFqgMT0ZSbZ5WZ7o+i1eOju5onBm5/0TSuBGO+Pry7vXPJJkJACSdPbuYPyh0COwaBSmjmopN9TKbHzoHgCHJbDkqy5WjP016W+auHJ0z89BY/lNJIz0xamsUlb6WZCYAeFZ9LtKC0CGwaxSkjBqb23qmpAND5wDwkjJbjmr1ytGcBfkJ0cDAT1x6+YiHmK5dsfjBRxOMBQDPY5xQnGEUpIyKnN84QAXIdDmK49ytSu85R9dPLvVlbs/R3OKksaVBfV/SkXswZkBRdGlSmQBgRyafNafY0Bw6B3aOgpRBszunH+byU0LnALBbmS1HtXpbXVOxqX7ARneb9Lo9mWPyq3pvfGBtUrkAYGc8sreGzoCdoyBlUJ2XztXITlwCUB6ZLkepP+fo0UnnZO22umJRuXG5rdeZ2el7OGqLmz6TSCgA2A2X5re9dfKY0DnwYhSkTPK3hk4AYJeetDibR3mnvefIpOuyuOdIixSti/LXyNWewLRv9C7p/0MCcwDgpey/aUvujaFD4MUoSBnT0t5wrGTTQ+cAsFNPWqxTe7r7locOsqO09xyZdN3L477M3VYnyQr35b8hJXIi1F/q4tH/nMAcABiamNvssoiClDGRaWHoDAB26slIOiWL5Sj9PUe2ZNyjk87LYDlSob3xc3K9I5Fh7h9b3r368URmAcBQmE6e3Tn9sNAx8EIUpAxpvqB5lJu9OXQOAC9Sw3uObMn4Rw9fmLnb6iS1tuc/I/MPJjTufyZ7/1UJzQKAoYrqPC6GDoEXoiBlSLRh46lyHRA6B4AXqNk9Ry5dOzlek7kDGSSptaPh4276WELjSrHZRVm8QgagBpjPDx0BL0RByhCPfF7oDABeoGb3HLl07ZS4L5O31bV05P/RZf+S4MjLVi1ZsyLBeQAwdK7Wo4oN+dAx8H8oSBkxa+Gs8eZ2ZugcAP5mk9zOyGI5Kseeo6yWo0J7wztM+mKCIx+oi7d8IsF5ADBsuci4ipQhFKSMGL1189mSxofOAUDS9nL0+t6la34VOsiOyrHnaHK85pwslqPWjvz5MvumJEtoZGwWnb+8e/0zCc0DgJHiLqIMoSBlhJnxGwPIhict1klZLEfl2HPUO3PNgiyWo5aOxne6dLmSK0eS9LmeJQ/8d4LzAGCkZswpNjSHDoHtKEgZ0Dxv2oEuPyl0DgC1u+dIZtesnNn3Ni1SnMr8PbD9tjr/upIsR6bl8T77/L89HeOeaGEDUMPiiA/Ls4KClAFRqXS2pFGhcwA1rqb3HE0urXl7JstRR+PbZPYNJXvlaENOdfNXXb5qYE8HWWR7JxEIAOTqULJ/1mGEKEiZYG8KnQCocTV7W53MrsnqbXWFjsa3SX6lkv27ys38vLuW3LcukWklTUhkDgCYJhU6praEjgEKUnBHnjV5X5mOD50DqGFcOcrglaPW9oa3pFCOZK5/61nSf1OCI/dJcBaAWufR34eOAApScPWjc2dKqg+dA6hRT8r8ZK4cZUtLZ36hm31LSf8d5fpZzyv6kj3S27iCBCA5ZqIgZQAFKThurwMCeVLmp/Uu6b8zdJAdleNAht4Za87L4pWjQkd+gbm+LSmX5FyT+kbXbZuf9P/mWDY5yXkAaptL+daOaa8OnaPWUZACaio27eXSKaFzADWodsuR/OoslyNJ1yjhciTpiUh25u03PvREwnNlnta/JwC1yhXz4XlgFKSAxuW2nC5pTOgcQI2p7XI0sz+Te45SLEdbzKI33tW15t6E525n2S9IJvXVxaMPGFXvB5vpI5IeC50JwG5xm11gFKSguL0OKLOnKEc1VY5ik85N62GwTcWmvSS9LI3ZSYplm5d3r378zuv6/9yzpO+zW+vHTXHZhyRtCJ0NwE41Nc+bNiN0iFpGQQqkqdhUL9epoXMANeQpmZ9KOcqWFMuR3PTBnq6+7qTnPmcv21JQBTyzxOSzWjvzH37u17+97rebVnat+fxgrGkyXSFl7+cCqHUW+xmhM9QyClIgY+u2vVbi9COgTDa76cwslqNnj/L+pVIrR/p2ZstRe75d0tVKoxxJX1y5pO9LSc99vjiyk9KcnyR3XVpoz1/6/H92d3ffY71L+i6IpGMl3RcoGoCdMPkbQmeoZRSkQCyOTw+dAagRz1jkZ6xc0rcsdJAdPe8o76aUlvh278y+8zNZjjryC2S6UVJdCuO7V87suySFuS/kdmLqayTJ9OHWjvxXtMNVrxVdfXfVxVuOknSZJA+SDcCOjplbbNo/dIhaRUEKxGQUJCB928ys2LO4/9bQQXZUnitHGS1HKV45kvy/x48dPDft/91HnjV5X8mPSnONNLj0nkJHw4uurC3vXv9Mb1ff++R6o6TET/sDMGx1pdw2tmIEQkEK4OiOxpku5UPnAKrcgFxv7lmy5sehg+xozrwpB2/bZsvElaNEuey3dfGYs5ZdvW5L0rN3VD9m1OuVSsErB3tvS2f+Yzv7Su/Svh8qF7VIWl3mUAB24O58mB4IBSmA2MXGOyBdLrMLepf2/TB0kB09d+XIpJkpLZHdcpTqlSM9YPHAKcu7Vz+ewuwX8dgXlmOdtJjrX1o6Gjp39rXeGx9YW/9Mbq7JflLuXABe4LS2trY0bkPGS6AgBeDGJwJAmlx6f++SNVeHzrEjrhyltueovy6Oju/tXvenFGa/SKE4+RCZKmv/0YuZyb7VXJz6qp198Y4f3P9UaZ8JZ0m6ocy5APyf/TZNfPiY0CFqEQWpzI6bf8R+kvhhB1Jirn9d2dV3WegcO5ozb8rBpTh3W1pXjsx0VabLUUpHeUt6aDBXOmF59wMPpzB7pzxXN0/pFL1yGxdF0eLmMw4bt7Mvrrp81UDvzL5zzXRVuYMB2M6NQ71CoCCV2Za4/gRVx1+sQOaY6aqepX3/FDrHjspRjnpm9L2j5sqR+x+jXHzi3Tc++PvEZ++amettZVwvbU25ceM+u8uvLlLcs6TvfElXli8SgOeY7JTQGWoRBanMTDo5dAagSi3bVBr9LmXsmOK09xxluhylu+foL8rZSStuXLsmhdm7VJjXcIqknd6WVqlcuqjQ2bC7Oxt8ctx3oaTUHroLYJdmNZ8z89DQIWoNBancvOLvWwey6H/jOD5rdffqbaGDPF+hOPmQNPccZbkctXY2zk9xz9ETiu2k3sV95T9pLY4+WPY10xfJ7T+0aNfvCbq7VRo/dvBcScvKFwuAJIsGBo4PHaLWUJDK6KhiQ17SlNA5gKri/sc4jk9f1b12Y+goz1coTj7Eo7pba/HKUWtn43x3v1bpXDl60uPo1N7uNb9OYfZuNXfkj5L8hHKvWyZHttyXX7C7b1h29bottq3uzZLWlikTAEnO3UdlR0Eqo1xkJ4XOAFSZLe65s1Z1r30odJDnS7scufStGi1HT7n761d2P9CTwuyXFEkfCbFuuZjrUy91pHDPTff9NY7js0x6uly5gFpn0onb/wvlQkEqJ6cgAUky+TtDvVnelXKUo5Uz+y6o0XJ02sql/XekMPslzSk2NEt6c4i1y2jK5kMebn+pb1rVvfZ3Ll1YjkAAJEmHtXQ0pPV4COwEBalMikXlZP660DmAKnJZT1f/taFDPB/lKJ1yZNLTcRy/PlQ5kqQ4ij6rGvgE1+XvH8r39Xb13SDT9WnnAfAs40P2cqIglclDUb4gad/QOYDq4LeMf3TSJaFTPB/lKL1yJItev6p77e1Jzx6qwryGU6t479ELuZoLxcYjh/KtUU7vlvRgyokASDIXBamMKEhlEru4egQkwf2Po+q1YNmyZYOhozyHcpRuOepZ8sB/Jz17qIpF5RTbpaHWDyKK3zqUb1txQ9+T5npXymkAbHfcS+0RRHIoSOXzmtABgCoQS7lz77yu/8+hgzznmIUNExXV3ZLmaXVZLUeF9ny7u6fzEFhps7mfGbIcSdKDUf5iSa8OmaH8rKgh3k7Ys7Tv526+OOVAAKS9Nx380OzQIWoFBakM2tra6mQ6NnQOoOK5f6Z36QO3hI7xnLSfcyTpyiyfVpfic442uen0FUv7b0th9pDNWZCfZNKnQ2YI5LDWjmmzhvrNOYvfJ+nJFPMAkCSz14aOUCsoSGWw+ZCHjpS0d+gcQIX71WTv/1ToEM9J+7Y6SVf2zux7Z1bLUYqn1W120xtWLulblsLsYYkH7Muq0T+7Y/mQn7uyYvGDj7rps2nmASDJjbuRyoSCVAYe0/iBPfSXqE4LurtVCh1EohylWY4i90yUo5aO/BtlfnboHKGYa+5wvt83bb5M0sMpxQGw3XFaxHv3cuD/5LKg8QN7wE32thU39K0PHUSiHKVdjkLfVidJzfOmHWjuXw+dI6z46OF896ofPrLZZf+cVhoAkqT9Cqsbh3z7K0aOgpS2RYoUsf8IGCmXvtTTteZHoXNI5TmQIavlKPUDGSI/IwvlSJKiOP6azA4NnSMos0OPm3/EfsN5yYYn/WpJj6QTCIAkKcehX+VAQUrZnPunvFKuA0LnACrUr5+JR380dAipDAcymK6o0QMZNkfub+hZ3H9rCrOHrbW94S2SiqFzZMFAqX76cL6/76d9W112WVp5AEhypyCVAQUpZXGc4+oRMDKDUeznr+5evS10kNRvqzNd0Tuj78KslqOUD2QIflrdc47unDHZzb4cOkdWxK4jhvuaXJ1/06Sn08gDQJK4K6kcKEgpc2lY93ED2M7lX1zR3b8qdI4586YcTDlKpRxtctPpWTiQQZKaL2geVfLBxZImhM6SGZEdMtyXrLih70mXlqQRB4Ak6ZCjO2dMDh2i2lGQUmbyOaEzAJXGpL5R8dZFoXPMLuYPiuNcanuOZLqid0k29xyVoRxl4rS650QbN3xefKD1QnF84Ehe5nF0RdJRAPyfkgZ4b5kyClKKtm9wtWmhcwAVxs39guXd658JGaL17BkH1EW6WdIrU1nguXIkeSrz90CtlaPWjnxRsveGzpE1Zhozktet7H6gR9LqhOMAeI4bH+akjIKUoq0+ao4kC50DqCimK0PvSTlu/hH7ef3gLyS9Op0V7HLKUTa0dkyd5tKVoXNkkUv1I32tmb6TZBYAz2PiClLKKEgp8pLxAwwMzyMDWwY/FDJAc3HqPltLo38u6ah0VrDLe7vWXCjKUXDHnjl9b1f0XbHvaKdcNuIHM8fuFCQgLa6jmopNI/4AAy+NgpQio+EDw2Lm7/n199dtCLX+nAX5CVEU/UzyQjorUI5SmD0yixQNjC1dp7RuoawCkWvLSF+7sqv/fyWtSTAOgP8zekxu2+zQIaoZBSk9JlGQgCFz3dyzpP+mUMs3FZv2igf1E6W2Ub92y5Hi7JxW95yWexs/7dIbQ+fIMjc9tYcjbkkkCIAXiXiPmSoKUkqOKjY0SNo/dA6gQpSiXOmDoRaftXDW+HG5rT9Sas+XqO1y1Nvd918pzB6xQnu+3eQfC50j81zr9+jlpkw8/BeoSu6toSNUMwpSSnJmKe1fAKqPS1evWPzgb0Os3VRsqq/ftvl7cr02jfkm/yblKDtaitNaZfq2OEBnCOyhPXm1W7RMGfy5B6oEt9iliIKUHgoSMAQmPe2jRn0ixNrFonLjcluvM+nklJa4smdm/0XK4JvEQnu+3d2vUTrlaHPkfkbWylFzR77BovgHksaFzlIJclFujwrSqsUP/EXS2oTiAHih6c1nHMafZSmhIKXEjWYPDIWbfW7V9ff+McDSti7Kf0Ou9pTmX9k7M5sPgS2059tlukFSXQrjN0fubwh9VPuOmudNOzCSfiLp4NBZKkRpYML4hxOY8z8JzADwYjmNH/+q0CGqFQUpJeY6MnQGoAI8vHXU2C+GWLi1Pf8FSeenMXv7bXV9F2SxHLV2Ns6X6UalU442Kdbrs1aOZi2cNT6K/SeSeHD3kPkfVl2+amCPp5h+nUQaAC+Wi/kwPi0UpBTMLU47XKaJoXMA2Wef+O11v91U7lVb2vOfdNP70pht8m/2dPW/Sxm8rS71PUdur8/abXVtbW11Y7Y9szS9o9urVXRXQoP+N6E5AHbA3UrpoSCloBQ5P7DAS1vdO3PNNeVetNDR+F4zLUpjds2Xo6VrfpXC7D1hmw9Z/02Xvz50kEpjiu9MYo6X4geTmANgJ8y5WyklFKQUuJwDGoCX4rq03LegtXTmF0qe1i19tX0gQ/bKkQrtDZ9y13mhc1Qii5VIQaqrj36fxBwAO+Ga1XxB86jQMaoRBSkNbjR6YPceHP/nSUvKuWBrR+MbzHWVUvhzz82/UYt7jkx6Wm6nZW3PkSQV2hveIbMgpyNWgU1jH3vZb5IYtOKGviclPbHDP/5fcXgDkIQx0VMb2VuZAgpSGsybQkcAMu7fly1bNliuxVqK01pdvkQplAQ3/8bKJdm8cpTmbXUmPe1up2fzylH+DJl9LXSOymV3Jfz78y8v+FU8eFJvV1+L3L+c4BpAbXJ/ZegI1YiClLD8afnRkhpC5wAy7E/jxw5eVa7Fjio25C2KfyRpfNKzKUfZK0dz2hteJ1OX0jmlrya44u8nPHLjC341qn6cJJ/s/e+X69aE1wJqi9srQkeoRhSkhB2wb2m60rnPH6gKZrps2dXrtpRjrWMWNkysi+ynkg5KenYtlyNZlMUDGdRazM91sx9IGhs6SwWLS1b3vWRH2gsKksVxUZK6u1WKcqX5kh5Jdj2gdpiLgpQCClLCSnHEDyqwaxssp6+XY6FZC2eNHxiwH7qUT2H812u5HPUseeC/k569p5o78kd5pJ+4tFfoLJXMzO68e8n9yRYW900v/KXeLskkacXiBx+V2zwpe/v3gEoQm9jWkQIKUsJo8sBumL7+7KbtVLW1tdXVb93UJVdrCuO/3tvV925RjjKjMC/fFEk/l7Rv6CyVzl3fKcMyjS2d+dc+94tnr0Z+qQzrAlXHpHxTsak+dI5qQ0FKmnEvKLALpbgUf6McC206ZP3XzOz0FEZTjjJmzvypjSr5zZIODJ2lCsRRnX838an24vca0Q7Hr48fO/hPku5JfG2g+o0aV7e1MXSIakNBSpiLK0jALvxiVffah9JepNDZ8EG53pHCaMpRxsyeP+XlcSm6RWaHhs5SJX684oa+9UkPNdmL3mu49Ia2tra/HaSx7Op1WyLp7eJWO2D4StxmlzQKUoKaik31ls5+B6Dimf3/7N15fJxVvT/wz/fMJGlToCyy1VrbZtICgUpNJqWC3rixeC2LOklaqBRU3K7+9Kq4Xo0Xleu+sipraZt0VBTUqixWBaFZAIHQJZO2QEUQoQt0STJzvr8/2pQuWWbmOc88z0w+79fL1yWZ5/meb7khnc+c85yjP/V7jPqm6ndC5f98KH01w1G4zG6eOSmaidwDYErQvZQMNb5su22hQ22accTOY55+477fWNWWelAEN/vRA1EpE8MP511jQHJoXHRgOgCeaEx0B4y2MAAAIABJREFUsGczhx3+Gz8HqGuqOlmhS+E+KFzd0Zb6LzAchcbsROzoiGbuBo9UcOmJjuXr7vGjsABHDvV9hcw78HvRMv08gC1+9EFUqlRlZtA9lBoGJIciVjl7RDQUxS1d13cN+FV+diJ2tEDuAHCo49IMRyEzN1FzZNTgjwKcGHQvpUQhP4JfP+eKo4b8tuA/Dvze3xb3/guiX/elD6KSxfefrjEgOWT5A0o0FM2o/syv4jWJmvKo0V8AmOa49JgNRxlrzwljODpjwZQj0qbvLgCnBt1LidncXz7+Nt+qy9AzSABOqZ03qfLAb9rtO6+G6j9964eo9HA23TEGJIdE+fwR0YEUWPlQsjflV/0Jkb5rAHnj6FfmZEyHo67k+vtc1/bq1POnHt6XKf8jgNcH3UupUcUPH1386PbRr8xd/QUnHAXgoBC0R1lkwiG1B36z685ndqjgG370Q1Sijtjz3xo5woDkkjAgER1E4dsn0/VNVR/TA7YLduAahqNwOfX8qYeXVZT9EUBd0L2UoOcrdkW+51dxG7Ujf7KtmSFnA7dsk58CeNaPnohKUaYiw/egDjEgucUfTqL9ZTKKO/0oXNtcPUch33Fc9qaOE8MZjuKNsUZVvQU+hCMA261gXhjD0ZwLY4eVV0R/D2g86F5Kk3z9/jvWvuRbdWNHPJ9Fh1kalFqR6lNFQc5NIyoFES6zc4oByZE95zm8Nug+iEJFcN/DydTzrsu+YWHVMcbqzwE4Oz1cgVs7Tky9Hy3hO4elvrl6AQRLAURHvTh3L1lrz+5sTa30obYncy6MHWbT+IMCc4LupUQ9tXmb+h1CRnzTpiMsTS+v0GsA7HLeEVEJUuVz8C4xIDmy7einp8KfNy9ExUvldtclEwlEBvrNUggmu6qposum2dSlYQ1Hfi2rw+5w9I4wzhydfu7MQ20aKwCcFnQvpUoVX02tSPX5O4iMuKGGiEwd7rW/Le79lwBJ1y0RlSKew+kWA5IjURFObRLtT9OR9K9cF31SYv8L6FsdlvzFIc++5r3JJDIOazpR11g9f6yGo/7xmRUA3hB0L6VKIY9O09Qtvg8kOtpzY0eM9KKqudVhN0QlS4HpQfdQShiQHFEoT3Mn2l/Xw0s3POmyYH1T9TtV8HlnBRX3bt6GC1euXJl2VtOReGOsUcS3cLRdBeeGMRzVzptU2T8+cweA04PupYRZEfthvz8UiCemHgfgNaNcNnGkFztOWncvgKedNUVUqpSPebjEgOSKiLPlPkSlQKBOZ4/mXBibrNBbAIiLegKs2qEV5/m+xCgPdY3V8/185khVzwrjM0ezFs6aYCorVwBoCLqXUibA1R2tvX/zf6BoNhtrTNjzDO/QWmAVusxdU0QlSnD8iP8tUU4YkNwZ7VMyojFFrfmts2ItMHYAtwDDHjiZq+6IrXhHd7L7ZUf1nKlrrJ4voovh07I6VT2nc3nv/T7U9mTWwlkTKvp3/A7Am4LupaQpNkkUXyzEUAK8OZvrnj/6+ZHfiyjucNIQUWmLvHT0U5OCbqJUMCA5I1xiR/SKzR01PY+6KhZfU/XfELzFUbkNaYmc+UCy+0VH9ZxhOGI48ptAP7ZqSWpbIcZSwZnZXNdd0z3iEtdp2vsgAOe7YRKVGhHhh/WOMCA5o/yhJHrFfa52hIsnqk+Fytdd1ILgBbWRcx5uXfuMk3oOMRwxHBXAL9qX9zrfOGUocxMzXg3gpCwu1dF+VySTyCiwwk1nRKXM8MN6RxiQ3OEzSESDRP/ioszcxOTxMLoEbs472mUz9vzO5Nq1Dmo5xXDEcOQ7xSbpj36wUMOlI/p2ZPG8oADbs6knkJVeeyIqdYaPezjDgORA7fwZrwJQGXQfRKGh+mcXZTJm3LeQ3afQo7ECvDeMu7YxHDEcFUAGiovab1/zQsFGVH13VpdluXQuY+1fvTVENAYIVzO5woDkgrWc0iTaQ4CXJzw35WGvdeY0xU5T4COOevpMe1sqdAdO+r2VNyzmhTEc1c6bVFnev+NOMBwVytc7kiknH1pk49Tzpx4OZPf8EYDnsrnooWRvCkDolsYShQwDkiMMSA5ERI4PugeisFDgfq/nCsXOiVVkgBvh5nfUNe1tqe85qOOU31t5Q/TMQr4pztbgVt7Z7nBG3ojIfROem3xFIccsqyi7AFkui5UsA9IeXfl1RDQ2KIS72DnCgOSAKo4JugeisFDFA15rHHEYviDAid67kXvsxIn/z3sdt/xeVgfRswtyzk2OuKyu4F7MZDIBHISsTVlfqdKTdVnB43m1QzRm6LFBd1AqeKCUC6rHuTm6kqj4ichjXu6vnT/jBFj7WQetbLBGmruu7xpwUMuZeGOsET4vq+tIhi8c1c6bVClcVldIGRF5b1dy/VOFHLQ2MX0KgLdlf4ddl/Wliu7cOyIaU/iBvSOcQXJB+ANJNEityf9NTAuMUXsjgAqPbWy1xryja9m6f3us45TPy+q2cVkdDVLoJ9pbe9wd1pwlY8yHkUv4V8k6IKngiXx6IhpDxtUmpk8MuolSwIDkBgMS0W67pmFtKt+b46urL4ZirscerELndy1bt8ZjHad8Xla3DaLncFkd7XFNZ1vvTwo9aOycWAUUl+ZwizXlyHpDl7JMxZN5tEU0pkTL+J7UBQYkJ4RrPol2W51MIpPPjTWJmkMA/ZrnDlS+0tnWG6pDJRmOGI4KR+6Z8Nzkjwcx8hGH4T05rqhYvWpJalu2Fz+Q7H4RWZ6bRDRWpQfA96QOMCA5oUzrRAAg+T8jUCm7LgfgdQeeOzuW93zdYw2n/A5HYsENGWjQuopIX6LwmzIA2H0o7KdyvKc9j3GezuMeojHDmAjfkzrAgOSCMq0TAYAgv12m5lwYmwyRXN9cHTh2aqAv/V4A6qWOS4UIR+3JlOddA11jOArEsxmr/3nf0qc2BzF4XeP0cwDMzuUeyeNAaREJ1XOFROHDnexcYEDyKJFABIKjgu6DKAxy2rJ33/vS+AaASg9D78hY+65HfrVxi4caTjEcMRwV0IvW2jP3HKYaCBHzxRxv0QETvSvngRRZL8kjGot49IwbDEgebULNRPjzBoio6Bhozifdn9ZUfaICF3oZVwQf70qu97S9uEvxxlij+LeV9zYDnBXGcFQ7b1JlObfyLrQd1trzgvz5n9NY9WYAb8jxtscfbl2b8+8LBQMS0UhE9IigeygFDEgeZZDmdopEe/RHMv/M9Z602P+Bp99F0tremroh//vd8nsrb7E4e1Vb6kEfanvCrbwDsUuMzutKrr8vyCasyBU536T4XX6j6cv53Uc0Rog5POgWSgEPivVIkD5SeUosEQBo/0BlTgHp9YmqmKg0ehhzvbWZD3m43ymfD4HdZoCzViXDF454CGwgMqpyUcey1L1BNlHXHHsPFKfnep8VLM9vRLEhesyQKHRElQHJAc4geaRRcAaJaLcXupPd/bncEImYLyH/MNEP2Oau5Pqted7vFGeOOHNUQBmFXtS5vOcXQTZRk6gpN4or87h1fVdb6iHnDRERFOASOwcYkDxSy6lMIgBQSE7PE8QXzJgO1fyfPVK0dLSt78j7fof83pAhrM8ccUOGQGRUZWFnW29r0I1Umv4PKxDL49Y8Z48AgeX0EdEIFML3pQ4wIHmknMokAgAINLfnjzL2I8h/tuVvUzX1rTzvdaoQ4SisM0cMRwW3Oxwt71kWdCOzE7GjAf1yHreqwN6U77gKVOR7L9FYIOD7UhcYkDwyAv4gEgEQxUvZXjs3MXk8BIvyHGp7xurFySQyed7vTF1TVbOP4WgrwxHtIzThCADKDL4L4Mhc7xOR+9vb1q/zMPRhHu4lGgv4vtQBBiSPOINEtJsK+rK9NmMqEtC8zw/7TJDnvQyKN8YaBeJnOArtM0cMRwUXqnAUb5zxNgUW5nWztT/zODwDEtHIDm1paeH7e4/4L9Ar4S9rIgCQHAKSiuS585ze3dGWuja/e92pa6x+NwRL4M+GDAxHtK9QhaO5icnjRew1ed7+zIsvicdnpww3RiIamfyh+2dciuoRA5JXIpVBt0AUBqrZBaS6pqqToZibxxA7LORDCHiP3/rmqgtEdBkYjsh/oQpHAJA2476c58YMEJUfplaksv4gZWh6nLf7iUqfLR9XFnQPxY4BySsFAxIRAFHsyu5K05xPfYW0dLWlevO515W6pqpzVGUZAD/+8gltOKqdN6mynOccFVoGikVhCke1ielnAPhMnrdvy2jmOi/jJxKIADjeSw2iscD0V/CcU48YkLxSziARAYCa7AKSQN+dR/m/68TDfpDHfc7E51edLZDb4c8uWqEOR1JZ+Ruec1RQGSgWdSxP3RZ0I4NqE9MnGuPpmburvZ5ZlorMPBY84J5oVDa6gzNIHvEXjVeiDEhEAMSOvvStrqnqZAAn5Fg6Y4FLu67vGsivM+/qmqrOgfUvHFmRszpae1b5UNuTWQtnTTBcVldooVtWBwASkWugMjXP2/vSEvmx1x4iGZ3Mj3WJRmfVlAfdQ7FjQPJufNANEIWByujLTQWSyKP0dV1tqYfyuM+J+sbYWQr8Ej6Go66QhiM+c1RwoQxH8cbYRVDM91Bi8cOta3M6SHooxmROUIjXMkSlz0Q4g+QRP4vxjjNIRAAEmsWHBXJOjmVflP5oPodROhFvrnqDCn4BYJwP5UMbjvjMUSBC98wRANTOn3ECBFd5KLErHcl8zUUvKpLr7DPRmCQZwwkQjxiQvGNAIgKgIhNGer02MX0ioK/PpaYAn22/fc0L3jrLTzxRfSpUfgtgxD9XnkIdjvjMUcGF7pkjADj93JmHirW/hJezhwTff3jphidd9KOKE13UISp1atKcQfKICdM7LrEjAgA7ckCKmMgbFZrLA96d7SembvTYVV5qE9NPgdF74M+J5KENR3zmKBChXFYHQAbGZxYLPIQSxb9MFP/nqiEDnBzoHv9ExSItDEgecQbJK1U/lt4QFZ9RNixRaENO5Yx+Fi2wnnrKw+sTVTEj8gcAR/pQPrThiMvqAhHKZXUAEG+s/qIC53kqImhZtSS1zUU/cxM1RypQ5aIWUakzsPnuNkl7MCB5JcJ/h0S7HTrSiwKckUOtO9uX9d7rsZ+czU3MeHXUyN0Q8eOsla1qzZlhDEezFs6aYCorV3BZXUFlVGVh2JbVAUB9Y9X5EP2qxzJrJjw3+adOGgJgTV8dwB0aiLKRQYQBySO+ufeOP4REu00e7oVEAhEFTsmyTsZYfM5RT1k79fyph6eNXaHAa30ov1WtObMzua7dh9qecLe6QIR1WR3qEjPqVWQJvL4/UFy+cuXKtJuuAKtS76oWUanTiPLDBI8YkLxjQCLabdKek+4PsgEzY8h2QxPBjauSqSdcNjaahkVTx5VVRH+N7ENcLrYwHNE+QhuO4gtmTBexd8Lr5kOKOzqWp+5009Xeoqe7rUdUuiIZ5ft7j/gv0DtudEG0W/Sp8tiQS9NEMq/LssZABNFvOOxpdC0wO3ZEF8OfkLDVipwdxnDEZ44CEdpnjuYmao5Exv4WgmM8ltpmyvBRJ03tUZOoKYfgjS5rEpUyKwxIXvFfoHecQSLaw2Z0ypAvGM12ZuZnD7au2eisoSzEV8d+ooL3+FB6C585on2E9pmj2nmTKtNm168AeD5nSFQ+u2pJapODtvaqlP7T4M92+0QlKaIRLrHziLMf3jEgEb3iNUN/W6ZmcW8fRK9018ro6hurL1foh30ovUWtOSuMM0dcVheIjIi8t6MtfDNHsXNiFaYSvwRczNDoX9uXp67zXucAom91XpOohHEGyTv+C/SOAYlokMq0ob+PoWeW9ndjR2vv024bGl68qfpd6k8gYziifWUAXNze2rM06EYO1NDQED3iUFkG4CwH5XapjX4AgA9HFck57msSlS41DEhe8V+gdwxIRHuo6KxhXhktIGXERr7tvKFhxJumxwFdDPe/A7cAlhsy0KAMFIs62lJLgm7kIC0w24/ddDNEL3BST/G/ncm1a53U2sfcxIxXA1rnui5RKYtY7mLnFQOSdzzYm2iQyqkHfa8FBpBXj3if4BftybUb/GprX7WJ6VOg8mt43anrYFsAe2ZH2/oOx3U9YzgKhBXopWF85giAxNfErgVwoaN690/412RfPuBIG3sueP4RUU6c7a8/hjEgeZcJugGisBBgRu28SfsFj7ndNYcDKBvpPs2Y7/ra2B6nnzvzUDGRO304CJbhiPZlRfXS9rbeW4NuZAhS11x1NRQfcFRvSzqSudDlmUcHOG+I720A8IhP4xEVPaNig+6h2DEgeceARPSKSLSycr9ldhmkJ458i/61QEvSpG985lbBcMsA88ZwRPuygLy/fXnvLUE3MgSpa666WlQ+5Kyi4oMPL93wpLN6+6idP+NVAN5y0AsG86baVB0U9/oxLlHRE+HqJo8YkLxjSifahx6wzE5hRwxIAvmxvx3tVtcc+7wA5zsuy3BE+7Kq+EBHW89NQTcyBKlvqrrGaTgCbupYnlrusN5+RG0Thph9todOXJdMImME3/RrbKJixhkk7xiQvOMMEtE+rOjc/b+jIwWkZzMTJ/7K14YA1DfGzhLFFY7LMhzRvqwILutcnrox6EaGIPGm6msV8kGHNdftsBUfd1jvIDL0M1LadX3XAACMH5/+C4AdfvZAVIwykuEMkkcMSN4xIBHtQ4C3YZ+HqlXssAc8KuSGwTc7fqlPzJymgqVw+/uO4Yj2pVD9UHtr6oagGxmCxJuqrwX0Moc1d1lgfney+2WHNfdT2xSrguK0IV7a+3fuyps37lLgPr96ICpWnEHyjgHJK2FAIjrApPj82EmDXxiJDPd7JpOJpH/qZyNzE5PHq8n8EsCRDstuEbFvZziiQQr9eMfyXl9/lvMk8ebYdY7DEVTx0a621EMuax4oorgUQ+9ed8DfuXK3n30QFSMx3GHZKwYkrywDEtFBrLxt7z9ChzkrTP/k18Pdg9Jm3FUADt56PH9bROzb21vXdzqs6QTDUTBE8LnOtt6fBN3HQVpg4s2x6xzuVgcAEOh1fi8jrL2stkwFlw7z8v675YkyIBEdIGMNZ5A8YkDySrAr6BaIwkbVvn3wn40Mc6K3GF8Pz6xrrJ4P4BKHJTczHNF+VK9ob02Fb6OAFpj4avfhCMCD2+04X587AgDZtvU8AMcN8/J+y/o6T0j9HcDzfvdEVEzUWB6F5BEDkncMSEQHMCL/UZOoOQQArKJiiEt2moj+0q/x6xMzp4noNQ5LbhaxZzIc0SAFvtexvPfLQfdxkMFwBLzfceXnota8pzvZ3e+47kFG2Wlv635ftcAKJHTLXYkCZaO+Pts7FjAgebcz6AaIwkaBQyaYXV8GAKNSP8Qlv1m1JLXNj7EbGhqiajK3ARjl/KWsMRzRfgR6XWdb6tNB93GQFpi61bHr4T4cDUCl8YHkun84rnuQuqaqkwE9+OyjvWTrQd9S5aGxRPsoMxnOIHkUDbqBEsCARDQEhXwm3lSVUOC1B74mQNKvcbcf8/SXAXmDo3IMR7QfARa3n9j7ESBkD0HvCUcCvM95bdWPdixP/cV53SEI8CkMvTnDHvaggGQNHuaxmESv0AgDklecQfKOS+yIhiVTcfCbnb6ynZHf+zFavLH6TRD5gqNy2wB7FsMRDRLFz19rU5egJWQHhLfA1K+J/dSfcCTfKdQOfbObZ04CZMHIV8lzB37HZjiDRLQvseVcYucRA5JXyoBElKN7779j7Uuui9bOm1QJ0ZsADLNrXk52wOLcMG7lXTtvUmV5/447wXBUUAr88cWXcFEyGbqdS6VuTdVVqsPu+pY3Vf3tVO35nOu6w4lo+v8BKB/pGlEctPPlQ8neXhz4bBLRGKb9ac4gecSA5JlwiR1RDkTlDj/qRsZXfg3AdAeldkHNeR3J1J8d1HJq1sJZE0xl5QoB3hx0L2PMykPGp89LrUj1Bd3Iflpg4k2xG0bZ1CBfD/VXTGgqVCCcm6g5UjD6n0MFm4b6NoBu910RFamKDGeQPGJA8kp0R9AtEBUVNX9wXTLeND2uAhfbDw8IJNGxfF3ozlbhsrrAPDbQl75g5c0bw7VaYPdudT+D263sd1NsSktk3qOLH93uvPYw0pFdnwRw2GjXichTQ31fRX09U42omJh0JQOSRwxI3vmyExdRidrQnly7wWXB2stqyxSRn8H70joL0YXtbT2/cdGXSwxHgXnaRPGOR361cUvQjeynBSa+uuoG+BGOgC1W7Tsebl37jA+1h3TGgilHQOVj2VybEekd8gXF006bIipih46LhGu2uwgxIHmlDEhEObjHdcHI1i2XC3SW50Kql3e09rY5aMkpPnMUmK3GZN65aklqqCVdwWmBia+pvhGQRT5U3wWV87qS6x/zofaw+tJln0R22/LvnJ5e1zPMawxIRHv0P30kA5JH3ObbOz4YSpQlEfmTy3p1iZkzFZkvOSh1dcfy3u86qOPUrIWzJhjOHAVhF1TOXbVsw6NBN7KfwXCkerEP1TMiuqC9rTDbeQ+anYgdDcH/y/Ly7uGfiRIGJKLd+lauXMlNGjziDJJHajiDRJStAZO+32U9kcwPAIzzVAPyuwnPTc72DVrBcOYoMFaA93Ys7yloUBiVv+EIAv1ke2vv7X7UHklU8BVk8ezRHsNu562cQSLaTfnBvQucQfJILLaOdKQdEe2h+NfDSzc4e5C6bn7122H1bE9FBF27ysY3tofs0zbOHAVI5JPtrT2+HWScj0QCkQ2rYzcC+l6fhvhKe1vvj32qPaw5C6ZX2wwuy/Z6hf592BfLyv6JAT6XTiTCD+5d4AySR5xBIsqSYJWzWi0wYvWbnmoIXogg+p5C7tSVDc4cBUeh3+po7flR0H3sK5FAZIOJ3SiAL+FIIT/uaEv9rx+1R2Mz5koAZdler1aH3Xp/3Db7spOmiIqcCmeQXGBA8o4BiSg7na4K1a+JXQJgtocSaRFtfLB1zUZHLTnBc44CtbSzrbdgh6JmI5FA5EkTu8m/cIQbOtt6AlleWpuYfgaAd+Vwy/NdyfWPD/fipIq1PHKDCIBy8zAnGJA8Mmo2B90DUTFQFScHOdYkag5Rq1d4KiL6+fZlvfe66McVbuUdqL9t3oZLsfvA0VBIJBDZGIndrMBCn4Zom2ZTH0QAf+ZEAhFjzI+BnBaor8QIve7ZvIEHt9OYJ1C+L3WAAcmjiMW/g+6BqBhEVFe7qFNp+j4DkePzLiBY3tEarh3rGI4C9TRs+t2pFanQbIs7GI6guMiP+qr6Wztx4sLhd4Tz10YT+yCAU3O8bfQdMAWcRSKC4ftSBxiQPHr+ZcsfRKLRpV9GRcprkTMWTDkCwCc9lOgt3xF5P0I0U8BwFKgdFji/I7nx2aAbGZRIILLRxG7xKxxBcVeZ9iW6ru8KZEeD2vkzXgUg1xlgtdb+dvSrEKrnCYmCIKp8X+oAA5JHez515HpPopFt6E5293st0pcu/xCAQ/O8PS0WC++/Y+1LXvtwheEoUArRS7vaUg8F3cigveEIuNCXART32p07zn8guSmwpWjG2isBHJnLPQK0dyXXPzX6lcoldjTmWcOVTS4wILnBH0aiESiwyWuNhkVTx0Hw8XzvF8HX25OpB7z24QrDUcBUvtvR2tsWdBuD9oSjW+FXOBL8ua+i8tyuO58JbBlaXXOsAcD7cr1PRX+e3ZXCo0uI+J7UCQYkF4Q/jESj8HyI48s7yy4GcFx+d0tH5rCJX/fagyvcyjtwD9rDD/tC0E0M2vvMEbDApyH+Vr4jMi/ILe1j58QqRHENctuYYTcT+WWWV3o6NJqoFIjo80H3UAoYkBwQFQYkohEI8IynAi0wAv3vPO/embF2QVDPXByIW3kH7vmoNe8Jy89DIoHIhkjVYt+eOQL+Vr4zcnbQS0uPOAwtAE7I49YHO5auW5/ltRV51CcqLVZfCLqFUsCA5IAKmNaJRqCCf3m5P766+nwAM/K5VwRffSjZ63mDCBe4rC5wVo1c+EBy3T+CbgQYXFZXfZuozPejvgCrTBTnBB2Oaptirwfw6fzuluuzvpIzSESISDnfkzrAgOSC1dDsgEQURsbjRiYiee9c9/fKZyeHYktvhqPgKeTKzmU9dwXdBwA0NDREN5rq2wBt9mcE6ejvS5+9akkq0E2EYufEKgxwC4B8ng/aHLU7W7O9WDmDRATJvPxc0D2UAgYkF4x4Wz5EVOo8nOxdO3/GCap6Rh63ZtSay1auXJnOd2xXGI5CoVMnHvbVoJsAdoej7cf+Y7F/4QgPVUT6znrkVxu3+FQ/a0ccKl8DcHI+94ri5mx33EskEAFQls84RCXkxSB3qSwlDEgOKJQBiWgEajTvJT4Rm7k0n/sEuKYzua4933FdYTgKhR3WmIVheO5odzja5OPMER6qiPS/7b6lT232qX7W4o3Vb4Lk/eygWo1cl+3FT6ZPODzPcYhKCd+POsKA5ILVfwbdAlGoZSJ5zeIkEogo5L153LoZ/dGWfMZ0ieEoHFRwedeydWuC7uOVcIQmn4YITTg6/dyZh0L0ZuT/PuO3ncm1a7O92JYPHJ/nOESlJBTPV5YCBiQHjEaZ2IlGYtKaz21PRqv+A8CxOd8o+o3229cEupNP7bxJlQxHIaC4q7M1dXXQbTQ0NES3H7dpCcZAOAKA/srM1QCm5Xu/FflaTjcYw4BExBkkZxiQHHjx5cwzAPJ6A0hEw7OKRO536cbNW+XH7rvJXk2ipjxSOSEJhqOg7bSCDyPg38+JBCLbj910CxSNPg3xiPRHzwxLOIo3Vy/ytG254q6u1p5VudwiilfnPR5RqRDlDJIjDEgOpFak+iB4Meg+iMJKJZL775oWGFE5P+ex1HwhtSLVl/N4jjQ0NEQrza5lCn1HUD3QHoorutpSvUG20NDQEN0YiS2Ff4fAPhS1FW8NesZ0UO38GSdA9SfequQ4ewRrVxKQAAAgAElEQVQAqnkeIk1UQlT4yIcjDEiOqApTO9FwMjgs11vmdFfNBpDrm54nOk/qact1LGdaYF4+dtMNgLwrsB5oUPcOrQh0i/e9zxz5N3P0UNRWvP2BZHcoPqBrWDR1nLG2FcAED2X+0rG85y8536XKJXY05imfQXKGAckRgT4ZdA9EYSWSe0CyImfmPJDiSrTA5nyfI/EnYj8SIJ9NJcgttdZ+qDvZ3R9UA7uX1f1jMXx85ihM4QgAtu8s+yGA13kooWLxubzuFOESOxrzDMzGoHsoFQxIjihkY9A9EIVYzgEJglwDUu+Ef03O+lBJ1+obY1+H4KNBjU/7+WVXcv19QQ2eSCCyIVLl6zlHYQtH8abqSwC9zFsVaWtPph7I8+aZ3sYmKn79ff38sN4RBiRHDHRj0D0QhZZoTjvR1V5WWwZgTk5jqH4zqENh403Vl6jgC0GMTQcZENjA/n+RSCCy0cRuFZX5Pg0RunBU1xybDajXnQJ3piPpvGaP9vy+mOFxfKJityUMh0OXCgYkR6wKUzvR8F6Ty8XRzVtmARif9Q2CFyZUZhbn2pQLtYnpZwB6TRBj0xAU17e3rV8XxNCJBCIbI7Gb4d+GDI9If/TMMIWjMxZMOUIUPwcwzlMh0e8+vHRDXn+Pmpe2zgBQ7ml8ouK3MegGSgkDkiMRtRuD7oEoxHIKSBlj6nK5XlRvXHnzxl25teRdfMGM6caY2wFUFHpsOpgAL5tI5oogxt4zc3SLp+2tRxaq3eqA3X/mvnT5UgDTPRVS/Wf5jui3PNx/sqfxiUqAAPyg3iEGJEc0XbYx6B6IwkoUU3O53sDOzuFyTVtcn1tH3s25MHYYMvYOAK8q9Ng0NIXesGrZhucKPnALzJMmdhOAC30aIXTL6gDgSYl9G4KzPRcy+OT9d6x9Ke/7LWo890BU5JSPejjFgOTInk/18v8FT1TCFJhy+rkzD83+esn6gWsF7noo2ZvKr7P8JBKI2DRaAb4xC5F0OmK/H8C4El8Tu1aBhT7VD2U4qm+OvU8Fn/RaR1V/29Ha63FrfsMZJBrzuFmYWwxIbgV6ICFRiEl6fCaXMJHDA9d6U87deLTRxL4I4JxCj0vDU9Fkvs+weBFvrPoBFB/wqXwow1G8sfpNqvC6KQMAvKSqH/FaRERPcdALUVET5XtQlxiQ3OoJugGisLKa3ZuYWQtnTQCQ7aGP2/vLJ9yZf1e5q2+e8UYAXy7kmDQ6VflOoceMN8WuhMjHfSofznC0YMZ0iP4CLjZFEPlSV3L9U576SUw9ToEqz70QFTkbMXwP6hADkkMKCWTnJKKiIFKfzWUVmV3HApAsi9756OJHt3voKidnLJhyBNQuBhAp1JiUDenoaks9VMgR6xpjXwHyPNR0dKHbrQ4A5iZqjkQm8zu4eO5O0D4103OV9zrRNyHr3xdEJSuzK122PugmSgkDkkMGlgGJaHhnZHORDmT/5kvELs+/nZxJf6b8JgVeW8AxKRuC2wo5XLy56tMiaPGpfOh2qwOAhkVTx2Ui/b9GDs8HjmCnyeCSZBIZr4VE8EYH/RAVNQE2dCe7+4Puo5QwILlkhdObRMOb+YaFVceMdpGJ6NFZ1tsZyfT93mNPWatrqvqoAucVajzK2kA6o8sKNVhdc+yjUMl/S+qRhXJZHVpgtu+M3qqqWX3IMRqFXr4qmXrCRS0LeZOLOkTFTPmIh3MMSC6lo5xBIhqeDAzgzaNdZG12B04q8NcHkpt2em9rdPVN02cI5NuFGIty9vuHk6nnCzFQXWPsUlH8GP4s6QpnOAIQXx37FoCEo3IrOtt6vS+tw+4lfwKegUQEKN9/OsaA5FD77WtegCBUyyKIwkXeOeoVxkazqiR6l/d+siIW5logu+BGhSa3F2KUuqbYeSK4HmMtHDVWfQrAp5wUU/wLNn0pAHVRbiDSdwb4PoYI4DPwzvEXi3v8ISUajuIdDQ0NIwcglawCkhH7Ryc9jSLeXH2xYPSZLwqI2Lv9HqI+EZsrwFL4szlHaMNRXWPsUoizmVMF8P6O5MZnHdUDFP/hrBZRMVPD956OMSC5pugOugWiEDty5zFPj/xQtWIgizovrlq24TE3LQ1vdiJ2NKAF3z6asqVrO1p7n/ZzhPqm6TPU4A4AlT6UD204qm+uusDxjNm1HctTTrfkN8C5LusRFau0ESfP9NErGJAcUzAgEY1EjVw00usCbM2iTAccLdMZSTSC70FxlN/jUJ5UfJ09qp0/41UK8xu42Nb6YKHcyhsA5jRWvVlVXM6Y/T1qd7lZprfHnPnTZikQc1mTqEhtfrh17TNBN1FqGJAcEzWPB90DUZipIlE7b9Kwn8ZnjGwZtQak021XB5vTWPVmKEYMcxQsFb3Pr9qzFs6aYKz+DkC1D+VDuZU3AMxpip1mRX4Nd8/cbUbEvMv1hirWRs53WY+oeCnfd/qAAck17ecPKtHIDjXjK9813IuasaO+aTRq/Q5IYsV80+cxyKOIsb4sK2loaIiO69+5HNC4D+VDu6xuTqKq1gIrABzqqKRCcXHH0nV+HGB5gQ81iYqQ8H2nDxiQHOtIbnyWO9kRjcLgY8O91IdxTwEjHyCp0cijznvaR11j9bt8enNM7mTGV/izte32Yzddo9B3+FA6tOGovmnG66yRPwI43FVNUVzp+rkjAIgvmDEdwKmu6xIVIxU+2uEHBiR/MM0TjURRX9dYdfpQL+0+DVxHevB+YMIzk57yqTM0NDRERfRrftUnZ9avvHnjLtdF6xurLwfwftd1EeJwFJ8fq1HYuwAc6a6q3PNaTX3ZXb19pDOcPSJ6BQOSDxiQ/GAZkIhGIyKfHOHl1LD3AU+uXLky7UNLAIAdx25aBOAEv+qTGwJxfnJ8fWPsLBX9huu6AB4JaziqS8ycCYu7ARztrKhiU1m5XZBMjjwTnDcRBiSiPVT47LsfGJD8YNTX5T9EJeKC2sT0U4Z6QYGHhrtJgV6/GmpYNHWcKr7iV31yR6GbXdarbYpVqfhy1tEj0h99W1jDkZjMvQCOc1h2h1E9/2+Le//lsOZer09UxQC8wY/aREXoma5l6/4ddBOliAHJD6oPB90CUREwYsz/Dv0CHhzhPt+2M315R3QBBJP9qk9ObXNVaNbCWRMMcDucLjEDAPzdGvP2MO5WV5eYOVMk/ScAkxyWVQEWrUr2djmsuZ+IyPvh7mwmoqKmfL/pGwYkH0wYbx8D4NsSIKJSIcB5dYkZ9Qd+PxMtHz4gqfj2ZlNk+M0jKGTUXUAq79/xQwBDzmbmSyGPWmPeFsZPd2vnzzhBJP0niBzvuHRLe1sq6bjmXrWX1ZZBcLFf9YmKjYyw2oK8YUDywcqbN+5S8FRjoiyIROwPcMAnwl23rf6nAquHvkN9CUj1zTPeCO6MVTRE9CUXdeqaqpoFeJ+LWvt4LGM1tOHIZDL3+hCO2jraUlc4rrkfs3XbPLhdDkhU1MSAM0g+YUDyiQh/aImyopgbb6pedOC3RXHHkNeL+vMsh7Uf96Uu+UIhnjcAqG2KVQnkWhf97OPxtMVbH06mnndc1zP/wpF0RO2uSwCo27oHUj92FyQqWgPGcgbJJwxIflEGJKKsqf7fGQumHLHft6BDnp8iFn2uh483V71GBee7rkvhlUggYgSLAUx0WLa7rFzDG46s9WNZ3T/SYs5/ILlpp+O6+6lNTJ8C4Ew/xyAqKoIXHl664cmg2yhVDEh+YUAiyp7gmL5M+Y/3/dY07X0QQ23IIH58Sm0WAYi6r0thtcFU/zcUcx2WfMKYzFv92r3Ni9Oaqk801v4J7penbYOVdz7cuta3jVMGRSLmUrjfYZCoeHGDBl8xIPnElOkjAGzQfRAVkQvjTdXvGvwimURGITcdeJGqOP/vShXvcV2Twqt2/owTBDrkDor50bXGZN6yatmG59zVdOO0puoTM1DXW3kDwIAaeU9HsucRx3UPEjsnVqGKD/g9DlExGek4DPKOAcknq5aktmG4h8yJaBh6be1FJ+5dAmSsuQEHfNCgxu0Wv/VN02cIdJbLmhRiLTDG2psAjHNUcYOJytvGWDhSgb6/c1nPXY7rDumIiXox3G5HTlT0BGZV0D2UMgYkHylGPMuFiA52tBkYaG1oaIgCQHty7QbsfoO3r8NcDmjFcPZoDImvqXo/gNOcFFNsEht566olqU1O6jk0JxE7KQP1Y1kdVPCl9rbeW13XHUoigQhULi/EWETFJC2G7zF9xIDkI1FluifK3Zu2H/OPKwe/EBy0m53Lh+ohXF43ZsxN1BwJla87KvecauRtu0N8uMxJxE6yBvcCONZ1bRW9trM19Q3XdYezQaobAVQVajyiIvF0IZ79G8sYkHxkVZnuifIh+qm6puoPAoCqHLLfS9bdDFK8ueo1AGa7qkfhljZ9VwB4lYNSLxqTObMzuXatg1pO+RmOoLhjWqb3v5zXHZ5A8LkCjkdUFETBD+B9xoDko+lY/wQAJ4cZEo0xItBr402xXgi+uv8rOMbVIKo43VUtCrfaxPRTAHzQQaltgD171bINjzqo5VR8fqzGt3AEPGh37pifTMLz+VPZqm+q/k8+H0h0MAU/gPcbA5KPdu/Chc6g+yAqYtMBlO33HcVr3ZU3b3BXi8LMiPkavG8TvQMq8zra1ne46Mml2vkzTkBG74I/4ehx6Y++s+vOZ3b4UHtYCuXsEdEQ+Iy7/xiQfCbCH2IipwTT3JVy9LA+hVptc/UcCOZ5LLMLas7rWN7zFydNORSfH6sxGftnHw6BBYBeW1Z2Zvvta17wofaw6udXvQXgDC/REAbKtI9bfPuMAclnArk/6B6ISszk2stqy0a/bGRzE5PHA3qqi4Yo3IzarwGetocfgKKxY/m6u1315EpdU9XJyOBel0tP9/EPsZG3d922+p8+1B5eC4xa+WZBxyQqEgI89EBy086g+yh1DEg+6981cD94YCyRS2XYvPkEr0XSkYrZOHD5HpWc2sT0MwB5m4cSCuCSjuWpO1315EpdU9XJonKPT+Ho38bizCB26Ys/EVsAoK7Q4xIVBw3dLHYpYkDy2SO/2rgFwGNB90FUSiJGvO88Z2W6g1Yo5CLGfNrL/Qr5bEdbaomrflypnT/jBIHc5VM42iZiz1mVTD3hQ+0RNSyaOk4EXyv0uETFwzAgFQADUgEohD/MRA5ZyOu81lCDKS56ofCas2B6tcLTs0fXdLb1fNtZQ46c1lR9orHWl0NgAexUwXntresD2WBo+47oJxUuN2IhKik2Ysv/FnQTYwEDUiEIp0OJXBLBXO9V9DXea1CY2Yz5BPL8e04UP+84MVXIM3+yUpuYfkoG+mf4E44GoGjqbE2t9KH2qGYnYkdD8NkgxiYqBgp5/IFk94tB9zEWMCAVgGTS9wXdA1FJUcRPP3fmoV5KGDWcQSphtYnpEwEsyvP2v1RWpheiJVzPj9Ympp9ijLkHwNE+lE8LcGGQz1pFDVoATAxqfKKwM3z+qGAYkAqgI7nxWQDrgu6DqIREByrtm7wUsMBkV81Q+EQkMh9AZR63dldE+s9fefPGXa578mLO/GmzfAxHGRG5uL0tlfShdlZq5884AcAHghqfqBio4q9B9zBWMCAVjKwMugOiUqJq3+7lfoEe4qoXCh8VfV8et/0Doufct/Spzc4b8mDO/GmzrI3cDX/CkRXV97W39iz1oXa2xGTsVeCukkQjURPJ/DnoJsYKBqRCEXtv0C0QlRSVd8PL2Taq4901Q2FSm5h+CnLfJnqbwPxnR2vv0370lK894civmSMVlY+2L++9xYfaWatvir0PgrcE2QNREXh81bINzwXdxFjBgFQgViL3gOchEbkjmFzbXF2f//3i5eBQCjFjzKU53jJgVM9vb1v3d18aylN904zX7QlHr/KhvAL4aPvynmt9qJ212otOPF6BbwXZA1GRuCfoBsYSBqQC6Vq27t8AQvWXL1GxM6qJ/O/WUD1jQs4IgJx+LhTysVXLe//kUz95qW+a8TqFvRv+hCNA5BMdbalrfKmdAzPQ/xMARwTdB1HYicjdQfcwljAgFZBA+cNN5JJiYU2ipjy/m2WH22YoDOoTsdMAvDrrGxRXdbb1XOdfR7nzPRypfrqjtedHvtTOQV1j9bsBeVfQfRAVgYGyHTwgtpAYkApJhdOjRC4JjqmUvvPzvPd5x91QCKjBu7O+FviTPXziJ/3sJ1fxRPWpKtavZXWA4gsdy3u/60vtHJyxYMoRAvvjoPsgKhLt99+x9qWgmxhLGJAKKLNzx18B9AXdB1GJ+WCe9/Fh19KU7YzEetMfTXRd3zXgazc5iCeqT0VE74biKF8GUHyhY3nqSl9q56jfln8HIscH3QdRMRABVyAVGANSAXXd+cwOBf4WdB9EJUXwljmJqtqc77PY4EM3FKA586fNAjAti0t3WSDRfvuaF/zuKVtjKRzVN8bOUsUlQfdBVCwyGcuAVGAMSAVmVH4fdA9EpcYa+WzON4ms9aEVCpBVc2Y21ynkE11tqYf87idb/ocj+Z+whKM3LKw6RqE3wcsW/URjy+ZDn5/yYNBNjDUMSAWmEf1t0D0QlaB31SVmzsztlszj/rRCQVGVbA4PXhKmTRnqmmOz/Z856vmaL7Vz1QIz0Ce3cWkdUU7+uHLlynTQTYw1DEgF1rEs1Q3gqaD7ICoxETHpb+Ryg514xCMAdvrUDxVYw6Kp4wR440jXKLB6h634UKF6Gk1dc2y2KMbEsjoAqFsT+xwE2YRYItpDoL8LuoexiAEpAAJdEXQPRKVHLog3V70h26v3PJzf4WNDVEAv95W9EcD4ES7pMzDzu5PdLxeqp5HUNsVeL4q7ARzp0xCfD1U4aqw6XRRfDboPoiJjo+XgoxkBYEAKgBXhpwFE7glUvouWHH6vKf/iKRUmow0jvS4qX25vWxeKw7prm2KvN8Bd8DMctaX+z6faOZubqDlSRJYCiAbdC1Fxka6/Le79V9BdjEUMSAHYmam4F9zum8gPp9U/UX1Zthdbtb/xsxkqHCuYO+yLgj+3n9TznQK2M6yxFo4AyIDpuwHAlKAbISo2IlxeFxQGpAB0J7tfhoInIhP5QEWvrL3oxKweAu9Krn8MwBM+t0Q+a2hoiApQP8zLW9MmczFaYAva1BDmJKpqDXxeVheucIT6pqr/EiC/w5yJxjibMQxIAWFACoga/DroHohK1OFmYOA6ZLmNsAhu9bkf8tlLx26aBWDCkC+qfubhpRueLGxHB5uTqKq1Ru4CcIRPQ4QuHMWbq96gkG8H3QdRkXqmM7mOz8kGhAEpIJEIfg1Ag+6DqETNizfFPpzNhZpJ3wIueS1qAh1uc477O5b3/qygzQyhtin2+rEWjuZcGJsMlV8AqAi6F6JipKJ3gO8TA8OAFJBVS1KbAHQF3QdRCftOXVPVyaNd1JHc+CyApQXoh9zau2OdqHnLEK8PwOCDCPgNxj7PHPkSjkTwubCFo7mJyeNtGrcDOC7oXoiKlbHyq6B7GMsYkAIkUP7wE/lnvEB+ecaCKaO+MY3sXgaUKUBP5E5zbWL6KfVNVe+F6LkHvSr4zp5z5wJT1xyb7eeGDCL4XHtr6pt+1PZA0pFx1wOoC7oRoiK2dbtW/CnoJsYyBqQAqeGnA0Q+q+7LlC9LJBAZ6aIH23pWi+CWQjVFTswwxjyqkFuAg/7/+3Q0s+uKIJoaFE9UnypjLxwh3lz9JSguCroPouImK7qT3f1BdzGWMSAFaM+nmz1B90FU4s7aaGI/Gu0iieArAoTiEFHySOTLDyQ37Qxq+Hii+lRE9G4ojvKjfmjDUVPsQqjyMFgijxSWG3kFjAEpYFxmR1QQH6lrjH1lpAtWLUltsoIvF6oh8s1jUzM9i4MavL5pxuvGYjiqb57xRgA3IMvdI4loWH2RqHB774AxIAVMocmgeyAaC0TQEm+u/vhI10zLpH4EQXuheiL3FPrZZDKY58nqm2a8TmHHXDiqS8ycqbC3gzvWEbnwx1VLUtuCbmKsY0AKWEfb+k4AG4Lug2hMUP1hvLnq08O9nEwiYxULAPAvp6Kkf+1s610RxMhz5k+bpbB3A3iVH/VF5bNhDEdzLoxNFpP5o1+hkGjMUSwPugViQAoD5X8MRAWk8u2Rltt1taV6VeVD4PkTRUdgvhXEuHMSsZOsjfgbjpb3BPJnG0n9BSccZdP4A4ApQfdCVCJ2mTLcEXQTxIAUCka5zI6okETQEm+quqkmUVM+1Oudy3uWQRCqs2VoVGvaT+wp+Lr92qZYlTW4C8DRftQX6JfCGI5q502q1PL0rwGcFHQvRCVDZQWX14UDA1IIrEr2dgmQCroPorFFFlVK34rZidiQb2w7Tkh9CcLZ3WIhgu+gBbaQY9Ympk+JAPcAmORHfVH5bHtb79f9qO1F7JxYhVRW3g7g9KB7ISolYvDzoHug3RiQQkIFnEUiKjTBW6KCh+LNVW846LUW2B2ZioWq+tsAOqNcKP714lbcVsghay868XhjzN0KvNaP+mFdVleTqCk/4jAkBTgz6F6ISszO7ZlyLq8LCQakkBA1bUH3QDQmCSZDZWW8sfpLDQ0N0X1f6k5295dpXwJAIA/+U5ZEl6VWpPoKNdzsROxoMzBwF4BqP+or5PIwhqOGhoZopelbCmBe0L0QlaDfdSe7eRZfSDAghUR727q/A+gOug+iMaoMoldsP27Tg7WJ6afs+8IDyU077cSJ56nosqCao5EZi4Kde3Tq+VMPjxr8AUCNH/UVcnlnW8+3/ajtRSKByPZjN90C4N1B90JUmmRp0B3QKxiQwqWgS0SI6ACKWmNMV7wp9v1Tz596+OC3u67vGug8ofcihqRQ6l6V7O0qxECnnzvz0LKK6AoAs/2oH9ZwhBaYDSZ2I4AFQbdCVKI2b97G5dxhwoAUItbapUBhHzImooOUAfhEWUV0XV1T7BNzE5PHAwBaYMsykc8E2xodRLGkEMM0LJo6rn985g4Ap/lRP8zhqG517CYB3ht0K0SlS5KFXCZMo2NACpGu5PqnAPwl6D6ICABwtADfT5tx6+sbqy+fk4idNGD0nUE3RfsTMf5v7d0Cs2NHdDGABj/KhzkcxddU38hwROQvEeEKopBhQAoZES6zIwqZ41T0m9agW6DXBt0M7UPxr/a2dY/6PUx8dey7KniPH7VV8MUwhyOoXhx0K0SlTIAn21vX3Rd0H7S/6OiXUCFlMvbnxpifABgXdC9ERKEmci8A9XOIuubYJ6H4hC/FRT/T2dr7HV9qe8FwNIbpzRA84KWCqJyiwH8BSEP0owe/jphCcluuLHgA0JsP+r7KhQDelGer4bB7mbCvv8codwxIIdOVXL813hy7A4rGoHshIgozEb3bz/p1zbH3iMKfACP6mQ6GIwoZUaxsb+u9xUuN+qbqdwL6XwBsR2vv9Qe+XntZbZnZunURgCEP6R6KAt/rbO096BDVuuaq2aJS1AHJcHldKHGJXRiJ3hR0C0REoaem06/Stc3Vc0RxC3z4e1IFX2Q4orGq6/quAYW05nDLi1u24k7fGgqS4IEH23pWB90GHYwzSCE0Nd1710YTexrAa4LuhYgopDIRu2OdH4XrEjNnCjK/BVDpvHiYl9WtrroBYDgayyxk6pxEVe1BL0TtwKplG/Y+71eTqCk/BLtOOeg6ABloTEYZR6E3C/CxLNtqK9Ud3gS4IegeaGgMSCGUTCITb9SbIfI/QfdCRBRGAmx4ILlpp+u6c+ZPO9bazAoojnJdO9TL6lZX3QDIoqBboWCJoMWKtBz0go08C+D4wS/HYedx1gw9gztaOAKArrbUQ/Gm2OMATh7tWiviaclfWAnw8vZMRVvQfdDQuMQupESjN4FnIhERDUkB58tSai+rLVON/hzANNe1FXI5wxGNZbWX1ZbVN02fsfcbotkEnzVdrT2rBr+Iz4/V+NFbECzQ1p3sfjnoPmhoDEgh1Z5cuwHQe4Pug4golBRPuS5ptm79gaqe4bougM+Hdivv1bGfMRxRQfzzn2UK8/8Gv7TR8iUA0iPeo7h18B9rm2Kvh5W3+ddgYRnL5XVhxoAUYqrmxqB7ICIKIwG2uqxX1xxbCOAjLmsCAFT+p6Mt9X/O63on9aurrgZwSdCN0JjSXJOoKQeArttW/xOKkXaitDC6d4e3iOIi37srnDXtyZSn7dTJXwxIIXZI5cDtAF4Mug8iorBRwUuuatU2xV4vioO2I/ZM5Msdy3u+5ryuVy0w8abYDQr5YNCt0Jhz5PhI39mDX+iIy+z03o7W3qcBIJFARAXz/W+vMAT4adA90MgYkEJs5c0bdylwc9B9EBGF0DYXRWYtnDXBAEvg+HBuVbR0tPZc4bKmI1K3puoqcOaIAiL7zAQdMj7zKwBbhrxQX9mcYWO06u0AjvO9ucLYGbEVNwfdBI2MASnkIhF7LXjCMhHRfkR1u4s6FQM7rwJwgotae6le0bk89VWnNV1ogalvjv1MVD4UdCs0ps2rTUyfCOz+IBiQ5UNc81JfReXte79SubBQzflP2x5IdnN1UMgxIIXcqqXre0ZZo0tERHmIN8UudH0oqkK+3rG898suazrRAlO/JvZTVVwadCs05o2LRMx7Br9QtbcOcc3PH1386HYAqEnUHALFBQXrzmdWzLVB90CjY0AqAmL0mqB7ICIqJbObZ04C8GPHZb/b2dbzJcc1XZC6NVVXMRxRWOg+y+w6l/feD+ja/S6w2Lu8bnyk7wIAEwrXna8e2XfbcgovBqQiUPnsa+6EYlPQfRARlYoyzVwN4AhX9RT4Xkdb6tOu6jkkdc1VV3NZHYXMf5zWfMLUvV+JWbL3H4EnO2pSf937WgntXieCnwTdA2WHAakIrFy5Mg3hjidERC7Em6sXKXCew5I/6GxLfcphPVcYjiisJKPp5sEv0iZ9KwALAArcgpbd/1x70YnHC/DWgHp0bcuussrWoJug7PI7D9oAACAASURBVDAgFQlbVvZTAANB90FEVMziianHQfV7Dkv+oKMt9UmH9dxogalriv2U4YhCbO/M0MNLNzypwJ8BaMbq4sHvRwYG5gOIBNGce3rL4HNVFH4MSEWi67bV/wQw1E4vRESULRO5Eq6W1imu6mhL/beTWi61wNStjl0vwPuCboVoBDV1zbHZg1+IyK0icv9Dyd7U4PcUJbO8zlqI62ceyUcMSEXEWP1+0D0QERWr+ubpdYC810UtBW7tOCn1cYTvGAaJr479hOGIioEo9m7f3Vc2PmnVXjX49ZxE7CQAs4e8scgocEdXW6o36D4oewxIRWRVsrcLwP1B90FEVHRaYFQjV8PF33uC5dNs6tLB5yRCY8+yOgAfDroVoqyoLkgkdi+he3Txo9s723r3PqNjDRYG15hjgh8G3QLlhgGpyAj4HxkRUa7qV1ddBGjcQak77WETL0omkXFQy50WmPjq2HWcOaKiInL8UyZ28CYMLTAAFhS+IV880tmaWhl0E5QbBqQi81qb+iWADUH3QURULGovqy1TyFe8V5J7JoxPN3Zd3xW2DXMkvjr2EwDvD7oRolxl8Moyu0F1a2JvAjAlgHacE9UfBN0D5S4adAOUm2QSmbomuUag3wq6FyIqmD4ALwB4EcDLgL68z2vbANk7myEKUdHDAakEMA7A4VAdD5GjAJQXtOuQiGzZ9j4VTPdY5v6+8vHnddzcs8tJU67smTkCwxEVKQO8a9bCWR/Zb4e30jn76LkXXxJu7V2EGJCKULpv4KdlFdH/AXBo0L0QkQeq/xSRp6B42gqeEshTEPssoP9GJvKCRebFgXGHvOBka9gWmLndM44fkMxUwEwxRqdY6FSjMlt3PwhdkuGpYdHUcdt36pc8lnmsItI/r2NxKlxb9DIcUeFE4gtm7P2QwQ6kJ2Vxj+x7D9SOH+qpPQUOKR/YsSi+YMYKAJBMOqrAe4asqPao/Wpm7GHZ/gECIXJVakVPX9BtUO4k6AYoP/Gm2HcAhPFgQiJ6RR+AdQDWQHStWKQQwdPpNJ7a9rI8nVqRCsVfnLFzYhVHHYbZFjIHwGmAng3g8KD7GomoLmpf3nvLaNfFm2IfAXDVaNcNTzemJXr6w61rn8m/hg9aYOJrYtdC8YGgWyGiIW2P2oopDyS7Xwy6EcodZ5CKVNSa76eN/RhK9FNfoiKzBYJeKNaL4AkoutXgianp1JrQPcw/hNSKVF8KeBC7//fDRAKR9Zg+14gkIDIfwNEBt5gvAfAxD/f/W2307IeTIQtHu585+jHAcEQUYj9lOCpenEEqYvGm2I0ALgm6D6IxZBuAJyB4DCrdkMzjRvTxVcs2PBd0Y36pSdSUj5e+i0TwOQDVQfczKJsZpLrm2Lmi+HWeQ7wkYt/S3rq+M8/7/SLx5th1nDkiCrUBa22sK7n+qaAbofxwBqmIRSDfzkAvBncjJHJtF4DVEHQL8Li19rGoKX/iwdY1G4NurNC6k939AG5MJHDLk5HqJqv6JQFODLqvbAjw33ne2gexFzAcEVFeBG0MR8WNM0hFrr4p9isFzgu6D6IilVagR4DHATyuKt1GMo+91q7vLYalcUGovay2TLZu+4pAP4sAP2QbbQZpzvxps6yN/D2P0gpgYUdbakn+3flC4k3V1wJ6mU/1ewH9DYAaQE4BcKxP4xCVOjUmc+qqZRseDboRyh9nkIqdxTdhGJCIRqEANmJ3EOoWkcc0gyd2oPyJPTMk+2kvdHdFZM8ZQF+qba6+06jeCmBG0D0NxVpzaV43inylo7VnzIUjE0XDqiW9mwa/UX/BCUdJ2cCsjKDGACcr5GQANQj55h1EIfB7hqPixxmkElDXFLtXgDcH3QdRSGwG8AQg3QCesDbTNa6v7O/337H2paAbKzWnnj/18LJx0d9BMbfQY480g1STqCmvNH2bkOPmEiq6rLO190LsDtRhIfGm2E8AfMSf8roxImVvznb56BkLphyxcyBaY0ykFsBJgNYAOBXABH/6IyouIuZN7a3r/hp0H+QNZ5BKQET1CivCgERjzVYIUqJ4QiFdUOmG9j/ekdz4bNCNjRWP/GrjllkLZ729om/HHRC8Jeh+Bk0wfedp7jvv/WXLVrkEYygcCfCkySEcAcB9S5/aDOC+Pf/ba3bzzElRm6kVg5OgqFHZ/X+x+7BiojFC7mE4Kg2cQSoR9c3Vf1XVM4Lug8gH2wGsBvAYVLuNyGPGmu4Hkuv+EXRjtNushbMmVPTvuB/A6wo15kgzSHWNVb8Rkf/ModwTA33p0x/51cYtjtpzQeqbqq5RyAd9qt8L0Td3tPY+7VN91CRqysdh50wxUmNUToGgRoGTAUwDNxeiUmTR0JFM/TnoNsg7BqQSMacp9v/bu/c4uev63uPvz292NzcggKIIFEKySSCbROhmExCqwWux3hA2G0KxiBW1IvZmPVqr8d5aPadVtC3VcyiBZDfjOaKooGKbtmrIzi7BJJPbzm5iCJGLAknIZS/z/Zw/NkTAXDa7M/Ody+v5eOzjAbMz398bTXbnPb/v7/N7fZB+EDsHMAYDkrZIlnXz9XJlXdrQfWFum5Ye6f7rKCeXtE2/MC/PqERbrY5WkC5625RT68fVPaaR3iPO9GvLp1o601u2FTrjGFR8OTqWudfPnTR+8JkL3VNzJG9yaY4NX990dow8QIH8V6Yj96rYIVAYbLGrEms6cj9saWt8QNIlsbMAx5E3aZu7rVcSsgq2Xillw8mTtx4aAIAK9EBHz6b5ixs/6K6vx8xR31D3Jo38Btp5N7s2QzkqqXXL1u2T1HXo67DLl5x72kAYP1vBm9x8jkxNcs2RdHqUoMCJ8OTTsSOgcChIVcTMPuPu342dA3iO4YEJ7t1KlA153zg4/qS1h94gocp0tue+0dI2/T2St8TKYKZrRnoRkbl9NLOi50dFDXRirKWt8VaXilKOhq85qnvtA+2bo5WjYzl0fdN/H/o67PBgiJTNUlCTzJolzZV0coycwBE8kFm59f7YIVA4FKQq0tne8/2WtsYuSfNiZ0HN+ZVL6xMp6+brPSjr7hu60327YwdDabn8sybdHePYTa1NJ7n6Xz+iJ5tWdnb0/H2RI50Im7d42tfkem+R1u918yvKtRwdy1EGQ1jLkhnnayg0SZrtic8xt1kavonxSM8gAgVhrqWxM6CwKEjVxZX43yjYvbGDoGrtkbRRpvVyy8ryGxLzDWtWbHssdjCUh66O3HfmtU1fZ/K5pT72hKT/NZImjOCp6/vrJ96o8plYZ/MWT/uauRWtHMXeVlcEnlm+tU9Sn6R7nn1w4cKFdQfO2DnDEzW5+xyZzdLw2aapklKRsqKKmdlPOjt6uAa8ylCQqkxmRe998xdP/wkT7TBGByVtMmmDTNkQwvq6pGHjiYwDRs1ySXdK+kKpD2zSSM4e7ckHf3sZbfMsdjnqq8JydFSrVq0akrTx0Ff62ccX3jBl/N4DdbNS8tlBajLZHA0Phjg3UlRUCc/7x2JnQOFRkKpQPp//SJIkzOHHSAxJ2iFpo1xZM9/oiXVPGcptTqeVjx0OlSmE8K1UYlEK0ghOCf3Jg+neXPHTjIi1LGr8SrG21R265ug1lbitrtBW3b79oKQHD30dtuC6xlM04NOHzzjZrOHBEN4ss5fFSYqK4voRY72rE2O+q9S8tsYfjPDTVNQGl7Rd0gZJWTNbL7fsvlC/KZvODsSNhmrU0ta4QcOf0BfFC8d8z2+deb4n+b5jvkZa1tmRe0exMp0ga2lr/Kqk9xVp/T6ZL6yVM0eF9orrp71kcNDnSKkmyWdLmn3oxrenxM6GsuHB7NLu9p41sYOg8DiDVK1C8jdKwutECa497r+UbINJG4YnxyXrD6h+YzadfSZ2NNSUThWxIL2Qp4ZeJz/mj7teq9PNpcpzHJSjMvezZb2PS/rxoa/DLl5y/nmpIWtKlJot89k+/Gd8lqTxMXIiItc93R2Uo2pFQapSXemtnS2LGu+R6S2xs6BodsuUM9dGl3XLLSsf2JBJb380djBA7llZ6T6fcWnhMY42ZEHXr7krt6dkgY5ueFtdkcoR2+qKa+3ybb+Q9AtJ33/u4xcvnnlWXcg3W6JZcjW5aZZcsyWNixIUxeZy+0TsECgeClI1S+mjCvoDMbmn0u2TtEnSerlnE7P1SUiyq9NbH4kdDDiaxGx9KOHxzO2oN8k2+dLOdO/qEsY5mqKfOcqHcEVnevOOIq2Po1jbvmWXpF16zkS9ptamhknJ4IUyH56oN3y2abakKWJ3R6Vbnkn3PBQ7BIqHglTFMity2Xltjbeb9K7YWTAihwcmmKlbrqwn2piZmdukpSrle01gzEz2cKmmaF+8eOZZ8vz5R/n2+vzkU0s+MOIIbH5b45e9iGeOFFKv7U7nKEdl4tD1nT8/9HVYU2tTw8S6/ukWvPnwYIjhbXrni+JUCQaUSj4eOwSKi4JU5fKW+nid56+VNDF2FjyH+y9l1v3s5DgLyk6YlM8emrQEVDwLtkdJaQpSKoRLj/K2MljQe7pv6x4sSZCje7YcFeUaqEPl6IrO9JZtxVgfhXWoOGUPfR120dumnDquPjVteKKemmWaJbe5Mr0kTlIcxVcO3YMLVYyCVOXWtm/ZNX9R4z+46aOxs9Sofrn+w8zXy5U114ZE/RtXp3ceiB0MKKY9qt89Uf0lOZaZX3qkx1321Uy6J/bWOmtpa7zVpT8p0vp9+RCu4MxR5Xvo7u1PS+o+9HXHs48vuK7xHA1pVjCfe2iS3qWSzYyVs8Y9XRfGfS52CBQfBakG5D18IbHkJkkvjp2lxvS7h7d3rez7/vGfClSXU7Q7P1TEwV7BdPJz/vW3b2ng2pmqj34DR2tpa7xVRSxHIYQrutN9lKMqtuau3E5JOyX9UBq+6e2+/XXfkun34yarPeb2+dXp7JOxc6D42OtaI1oWT79F7v8YO0cNoRyhpJr/8MKXJSE/IXYOSbL8UJ27vV9mtxTvKL7Fk+QDFvyNkv70t75r+nNLkm8X7/gjkA9/IcoRioCSFMWOSROGZrIVvjZQkGrE8DSd/qxLjbGz1ADKEUqqZdG0T8nsb2LnQMlsCyEspBzVNkpSabnpHV3tuWWxc6A0ktgBUBrZdHYgSH8ZO0cNoByh9Myuih0BJUM5giRp1e3bD06aOHSVXPfFzlL1TJ1d7bk7Y8dA6VCQakhXR+7bfmgPM4piQK5WyhEi4Gd5DTDpFxZSr6Ec4Vmrbt9+cL+Pe6uk78bOUsU8DG+XLc1YTpQFfqnWmFTQn2n4fjsorAG5rsmszN1z/KcCwIlhlDeOJpvODuwP464WJalYVnSn+34SOwRKi4JUY9akcxsl/WvsHFVmwE2tlCMAxUA5wvFQkormwFAqz21SahAFqQbVhXEfk+nXsXNUiQE3tXa1574TOwiAqrSDcoSRoCQVnpm+sHb5tl/EzoHSoyDVoNXp7JNy+3TsHFWg38zeTjkCUCTbhlL5V1KOMFLZdHZg0oShVkk/iJ2l4rl25vft/0LsGIiDglSjJj129lcl/Tx2jgo24KZFne0934sdBEBV2mEh9Ro+vcaJWnX79oP7w7i3iDNJY2KmP+++Z9f+2DkQBwWpRq1atWoohHCzmMoyGmyrA1BMOyykFnLmCKPFdrux8vs7O3Lp2CkQDwWphnWn+34i012xc1QYyhGAYqIcoSAoSaM2EJLUB2KHQFwUpBqXWP4vJT0dO0eFoBwBKCbKEQqKknTizPXF7hVbN8fOgbgoSDVuzYptj8nsE7FzVADKEYBiohyhKChJJ2THwXETPxc7BOKjIEFT8j1flfRQ7BxljHIEoJgoRygqStLImPsH1y1bty92DsRHQYLSaeUT6X2SQuwsZYhR3gCKyLczyhulwAjw47qnc2Xv3bFDoDxQkCBJWtORe0Cuf4qdo8wwyhtAMe2wUPdqRnmjVBgBflT7UlZ3S+wQKB8UJByW1Oujcu2MnaNMsK0OQDGxrQ5RZNPZgaf26BpRkn7D7KMPtG/eHjsGygcFCYetuSu3xxJ7b+wcZYByBKCYKEeIKndvrp+S9CzLHLoWGziMgoTn6Wzv+Z7cvhU7R0SUIwDFtEOp5ArKEWKjJEmShtz8Pem08rGDoLxQkPBbQkPd+1Wb90aiHAEoph1KJVdklm/tix0EkChJkr7Y1Z5bGzsEyg8FCb+l+85NvzS3j8TOUWJMqwNQRL49ZXWvohyh3OTuzfVPmjDU6tIPY2cpsZ6wf/+nY4dAeaIg4Yg6V/b8Sw39sGRaHYBielip1Gu4CBzlatXt2w8+vUe1NN0uyO2Pu+/ZtT92EJQnChKOxvOp/E2S9sYOUmRsqwNQTA8HiW11KHs1tt3uy5mVPf8VOwTKFwUJR3Xo3hz/I3aOImJbHaqEb46dAEf0sFLJwu6OXG/sIMBI5O7N9deFg4uqeQeJSbmwf/9fx86B8maxA6DsWUtb479LWhg7SIH1m+yazo6eWvikDFVuwXWNp4S8vV0KDbGzDEvGS36dXPOLeJB+SbfKbIcUDo5pJbf3Srq4IKl+4+EgXUE5QiW6tPWcCYPJ+LtNen3sLAUW5HYFZ49wPBQkHFfLkhlTlQ/rJE2KnaVAKEdAkTVfO+PFSQiPqXg7Ff4h05H7s7Eu0rJ46mvkyQ9VyJyunXn3Kx5M9+YKtiZQYtVYklz2la6Onlti50D5Y4sdjiuzfGufmz4cO0eBUI6AEuhesfVXkgaKtb7Ldo11jeZrZ7xYntyhwv4ufIRyhGqwOr3zQH04+LZq2W5nUm6gYUKtTejFKFGQMCJd7bmvmez7sXOM0fC0OsoRAEmpEL4u6awCLvlYSvY6yhGqxer0zgNP79Fb3L3Sp7wGWXLjumXr9sUOgspAQcJI+aAl75b0ZOwgo9RvsqsZyABAkloWT7vJpbcWcMldpvDKBzp6NhVwTSC63L25/nrvr+j7JLns853tW/87dg5UDgoSRmxt+5Zdcr0vdo5RYFsdgMMuXjzzLLl9oYBLPuoh9erOjr6tBVwTKBsVvt3uQZ98yidjh0BloSDhhGRW5lZKuit2jhPAtjoAz1MXwq2SJhdouafd9Mau9JYtBVoPKEsVut2uP4RwQ/dt3YOxg6CyUJBwwkII75e0I3aOEeAmsACeZ96i6VfL/KoCLbdHCq/vas+tLdB6QFnL3Zvrf3qvXV05Jck+3J3uWx87BSoPBQknrDvdtztxv0FSiJ3lGAa45gjAczW1Np1k5l8u0HL73P2NmY6+TIHWAyrCs9ckyfWj2FmOze/PXNjzldgpUJkoSBiVNSt7/8Ncfxs7x1EMuKmVbXUAnmti6uCHVZipdQNK/Jqulb0/LcBaQMVZnd554Km9enMZn0l6Ysjq/khLy/qDXJQxChJGbeLj53xC0s9i53gBttUB+C2Xts44W25jvrGspEG5rsms6L2vAGsBFauMt9u5XO9a275lzPdKQ+2iIGHUVq1aNSTzxSqf0d+UIwBHlE/C5yVNGusyLn9HZmXunkJkAipdOZYkl/4Xf0cxVhQkjEmmvffhMhn9zTVHAI6opXX6RS5dN8Zlgslv7OrobS9IKKBKlNk1SQ8+vUcfjR0ClY+ChDHLrMytdOkbESNwzRGAozLzv9bYft+5pJs7O3rvKFAkoKqUyTVJ+0KSXJe7N9cfMQOqBAUJBTHQMPGDkrIxDi3XNZw5AnAkzdfOuMBNbx/jMh/NdOT+qSCBgCoV+0ySm97XvWLr5hjHRvWhIKEg1i1bt88U3i5pbwkPO+DSIvYaAzgaC+EjGsPvOpP/S6YjV64TO4GyEu1Mkulfu9pzy0p6TFQ1ChIKprOjb6tUsuuRhs8cdeS+XaLjAagwlyy+YIpJ1456AbdvnRd631/ASEDVi3Am6eeTxg/dUqJjoUZQkFBQmY7cXSb/lyIfhjNHAI5ryAffJ6l+NK81aU04sO8P02nlCxwLqHqlOpNk0jMhSRavun37wWIeB7WHgoSCe3KPfVCm7iItP+DSIs4cATiWptamBnO7YTSvdWlTKox7Y/c9u/YXOBZQM0oxAjyY3sl1RygGChIKLndvrj+42iTtLvDSlCMAIzIx6W+V6SWjeOmufCp/5ep0tlzu7wZUrKKWJPcvd7XnvlnwdQFRkFAk3R25XrmulxQKtCTlCMCImdl7R/GyPQr2B2uXb/tFwQMBNaooJcm0er+P/1DB1gNegIKEojl0jdBnCrAUAxkAjNglbdMvdPfLT/BlA7Lw9ky656GihAJqWIEHN+wKdfVXZ9PZgQKsBRwRBQlFlbkw90lJY7mB64Bc1zCQAcBIBfO2E3yJS7ox097342LkATA8uKHOD751jCVpQOat3Xdu+mXBggFHQEFCcS1VaDiQWuLSplG8mml1AE5YcC06oReYfzbTkburSHEAHDLW6XYuuyXT3vuzQucCXoiChKL76Xe27FVIXSVpzwm8jGuOAJyw+W0zXm7ShSN9vknfzlzQ+4liZgLwG6O9JsmlO7o6eop9GxFAEgUJJdKV3rLF3W7U8FaW4+GaIwCj4+FEzh5tqD+Qul5LCzZMBsAIHL4mSX7/iF5g6nx6j24qcizgMAoSSqZrZc//NdOnjvM0rjkCMGpufvWInmj6tVLJW3/6nS17ixwJwBGsTu88UBf63zKCkvTIkFJX5e7N9ZckGCAKEkqssz33Scnaj/JtrjkCMGrzW2eeL9nMETzV3fWuzPKtfUUPBeCoVqd3Hnhqj73pGNvtDnpI3r62fcuukgZDzaMgodS8Lhy4UbLMCx7nmiMAY+JJ/soRPU/2OX7WAOXhGNckuZm9qyu9tTNKMNQ0ChJKbnV654EhS94m6ZFDD1GOAIyd6w3HfY7pP0967OylxQ8DYKSOeE2S+2c623uWR4yFGkZBQhRr27fsSoK/VdJuyhGAsWpqbWqQ6YrjPO2xIaWWrFq1aqgkoQCM2POuSXL7VmZW79LYmVC7KEiIZk26t3soaDrlCMBYTUj1v0LSycd4ipvrj7iWAShfz5ak/nETmC6JqOpiB0BtW5vOPRE7A4AqEPQq2dG/7bJbMyt7flC6QABGY3V65wFpZ+wYqHGcQQIAVD7TK472LZc21YcDHy5lHABA5eIMEgAU0Nzr505KDfZPrkt8vCQlPriv3vIDkvTM/sQfunv703ETVqGlSmyTFhzlu4Op4NcPfypdmZpam046rX5vvSTlB0+2ofrBU5/9Xt1g/dPjnjhjD9dVAUDhUJAA4DguXjzzrHr5NA/hPEm/I9M5Jp3t0mRJp0g69dDXZA3sT0mS8sOvDUqpX8MP1Y+TWtoaJcklPSbpUXd/xMx+aaZHFOzRoPwOd23oTvftKPF/ZsVqzk5tUqLJR/n259eke7tLGmiEmt981kQbf9JsszDDzV5mCmdLdqaZne3uL5N0lqQJUr/68w3DL0r6D//ZkqShpF9DL92plrbGfZJ2S9pj0u4g7TbpCbl2eqKHLWhHksr/Ihka7KnksggApUBBAgBJWqqkeVPj+SbNlqnJXE2SZkiaKc+f7JKee42Lj+1oJulMSWea2UWS5C7JXKZEZlJLW+OTcj1k0s9l/pCU+vl5YeuGdPq5b48hSSlLXeZH/n9k66QJQ58vdZ4jecX1014yOKTfVbCLJF0k6eWSpkshJUkm17N/wNxH9adr0qGvs36z0vA/2KEHQkgpJKnQ0jZth8u2mvtmSRvMbYM1KLvmrtyesfw3AkC1oCABqDkXL555VoPnZwf3OTJrkmy2NvksDb/BHHP7KZDTZXq1S68efrsbtD1pfLJlse73oB/kk9R9tTyRLVFoePaf3fSqIzzFZeFPVt2+/WAJYx3WfFNzve3ZfZkN35vpDYMDukg61hiJkkkkm2LSFJm9XpLcJB+SWtqmbXdX1mQbJG3wRNmnd2tj7t5cf9zIAFBa5fDDGgCK4vIl5542EMbPVvAmN58rqUnSbEmnR45WKOtNfp/MV3a293XFDvNCLW2NBySNL8baJq2pP5B63cC4/O8q0X0vPI5Jyzo7cu8oxrGPprl16uRUkrRKetNwsT3m2PFKMSR5r7mtD9IGJcoqn1p/vrbkOJsJoFpRkABUvOY3nzUxNWn8LFdqtoKa3HyuDZehs2NnK6H1bvo/DfV+18+W9T4eO4xU3IJ0SNCRp7HuqW/w6SX532GpkpbNU6+QkhvkulrShKIfszwclLTJpA1y2xCU35Cv8+za5dt+ETsYAIwVBQlAxWi+qbk+2bt7htxnuydzJG9KpNkuTRW3LXjWoEvfk/y2ro7e+xRxw2AJCtKRuf1NZmXPZ4p5iJbWKWcqqXufSX/k0nnFPFaF2SNpg2QbTGGDEmUHh2w997wDUEkoSADK0sWLZ55VF3yWzJtM3uymWXLNUu18Qj9mLluXKHzpvNB7V4ztUJEK0q7+hokz1i1bt68Yiy+49vyXhnzqz2S6RfxZPBFPSdooWVbSRrllQ0oPda/Y+qvYwQDghShIAKK6fMm5px0YrGtKUjZLQU0yazbp5S6dFDtbFcma/AsTH/ud5aW8X06MgmTSuzs7cl8v9LoXLzn/vLqh5M9ldpNinBWrVu6/lCkr10Ylyoa8b9TBgw9237Nrf+xoAGoXBQlASVz0timnpuqT2SlLzXbzOTI1yTVH1TMwoRJk3XRzV3tuVSkOFqEgbZ0ScrMKebbssrfMPHlwfP6TbrpZUn2h1sUxDUnKSVovaYO7ZRPLrz8v9PUyGAJAKVCQABRUU2tTw8S6/ukWNEumJnc1S5ol6XzxM6dcfDep0/vW3JXbWcyDlLwgmb8n0957W6GWa1nU+GaZbpV0bqHWxJgMSuqRlDXTRrmynmhjZkVuo8plOD+AqsCbFQCj0nxTc33dU7unB9NsJT5HIWky8zkMTKgYu2X28Sn5nq8W61P5khYk1+N1fnDK6vTOA2NdqvnaGRck+fBVmV5diGgout2SspJtlCOt4wAAFT1JREFUcIX1KVd2KJVaz/VNAEaLggTguBiYUNX+qy4kS1antz5S6IVLW5AKM7luftu0d7jsnyRNLEAqxPW8wRAh5LvH99f//Kff2bI3djAA5Y2CBOCwltYpZ8oaZnsS5sjVZKY55prFwISq9yszu6Gzved7hVy0hAXpoA3UndP5rc2/Hu0Cza1TJ6cs+bqbrilkMJQdl7RdUlbSBjNbL7fsvlC/KZvODsSNBqBcUJCAGrTgusZTNODTPVGTu82SqUnSPElnxs6GaFzuX9nv4z9UqDeKJStIppWZ9lzbaF8+f/HUee5Ju6RpBUyFyjIkaYc0fG2TmW/0xLqnDOU2MxgCqD0UJKCKMTABo7BqsH/oqofu3v70WBcqVUEy2Zs7O3q+O5rXzls0/Wozv1OM7saRDWh4ol7WTBs9qFt1STazfOs2MRgCqFq8QQKqwMKFC+v2nbXrXA2FJks0S64ml5olzZSUip0PFScr8ysz7b0Pj2WREhWkJ8LkyWd339Y9eKIvbGmb/kHJ/6cYKoITt0emHnNtlCnrQRvlQ5lMevujsYMBGDsKElBZbH7rzClu+dmHtsXNkdQk6UJJDXGjoco8rERXZlbksqNdoBQFyWVf6eroueWEXrRUScumaf9Tsg8WKRZq16OSbzC39cM3vk3WH1D9xmw6+0zsYABGjoIElKkF157/0pCvn+MWZpvUZNIcH94ed3LsbKgZTwXptd0duQdH8+KSnEFK/MrMit77Rvz8pUpaNjXeIem64oUCnsclbZOUlWmDB1ufSg1lnxmauJnBEEB5oiABkR1xYIJ7s8xeFjsbIOlXSdCr1qRzG0/0hSUoSAP9DRNPX7ds3b4RPt/mt037J5e9p4iZgJFiMARQpihIQIk039Rcn+zdPeM5AxNm6Tfb4/i7iHL2iIXU73Wmt2w7kRcVuyC59B9dHbkR38y1ZVHj38r04WLlAQqEwRBAZHWxAwDVZuHChXV7X7arMRXCHJdmS4euFdq9e5qklEv8ikOlOVtJ/octrVN+r5wuQje3fx/pc+cvbvywO+UIFaFBw9upZ7lr+OOzfFBLW+PTZrYhKAxf4xSUrdO49avT2SfjxgWqD59aA2Nw8eKZZ9UFnyXzJkmzJG+SdLGkiZGjAcXwwP4w7lUjvW6i2GeQzPX7nStzPzhujkWNb5bp2+J3HqrTU5I2SpaVtDGEfPdBTXiIwRDA6HEGCRiBy5ece9qBwbqmJGWzFNQk0yzJLpLnX8xbLtSQSyYkA1+UdGJT44rEEz/udVELlkydHvJaJsoRqtdpki6T/DJJSpJEE9WvlkXTfilTVq6NZuq2oGyi/o2r0zsPRM4LlD1+YQDPwcAEYATM3plp77n9eE8r5hkkk57p7MidomNsWJ17/dxJ4wb2P6Dhra4AnjMYwkzdcmU90UYGQwDPR0FCTVp4w5Txzxysu1DSbLnPTpTMlrzJpfNiZwMqwP4kqOV4k+2KusXO1Jlpzy041lPmtzXe4dL1RTk+UF32S9oo+QaZsonbuiQk2dXprY/EDgbEwBY71JR5i6ZfbRY+u++ANZqUGn7U5ExNAE7ExJDoG1qqy7RUIUoC1y+O9e2WRY1vphwBIzZR0jzJ5smlICkkQS1tjU+59J8HwrjruaYJtSSJHQAopa6VPf/PzNp1uBwBGKVL5m1qjHYtkkt7jva9Bdc1niLpayWMA1SrAx7CxylHqDUUJNQa72zPLZXsT6VIn3wDVcKkzza3NU6LcezEj16QfMi/INM5pcwDVBuXNoUQLu1O962PnQUoNQoSalKmo+cfTf5OSYOxswAVbGIi/UOMA7tp75Een9c6Y77Lbip1HqCqmFbXh3GXd6f7dsSOAsRAQULN6uzovcPMrtLwxakARudNza1TLy/1Qc1t3xEft/B5MYAIGDV3/17Yt/+13IAWtYyChJrW2d7zPQt6rUy/jp0FqFRJYp+LnUGS5l07/XUyvTp2DqBimf3bSY//ztu679nFB4eoaRQk1LzOdG51cC2QtDV2FqAy2e/NWzT1jbFDJME/HTkDULlcf5dp73nnqlWrhmJHAWKjIAGSujtyvUNBl0t6IHYWoBJZknyslMdz8+f9/pq/qPH1Lh3zvkgAjmhQZu/MrMz9Dx3jxstALaEgAYesTeeeeGqPFkrWHjsLUHFcl85fPHVetMObbo51bKCC7XX5WzPtPbfHDgKUEwoS8By5e3P9mY6eJWb6ZOwsQOVJ3leyQ/lvBjE0t049V9KVJTs2UB0eUbBXdnX03hs7CFBuKEjAb/PO9txSl39AUj52GKBSuOvaS1ubTn/OQ0WcJmeHb/acJMn7xM2fgRPx4JCl5mfSPQ/FDgKUIwoScBRdHb23KvE3SdodOwtQISYMWf+nJNmCtsZLJI0r3qH8stZWpRYsmTpdUunOXAEVzlzf7G+Y+Mq17Vt2xc4ClCvuFQEcxyVt0y8M8u+41Bg7C1AhHpV0uqSGoh7F9bhMpxb9OEB1cEmfznTklophDMAxUZCAEbi0ten0oWRgpeSviZ0FAIATdFCud2dW5u6MHQSoBOzZBkZg58YnDsw4Y+7ygZP2nmaMEgYAVI5dUnhDZmXvfbGDAJWCM0jACZrXNu1mk/0vSXWxswAAcFSmziGlruJ6I+DEUJCAUWhunXp5kiRpSWfGzgIAwAuZtCwVDr5ndXrngdhZgEpDQQJG6dLWGWcPJeGbki6JnQUAgEOGzPSxzvbc38UOAlQqrkECRmnnxl/vnXju6XdOGGcvkdQcOw8AoObtsqArO1fm2mMHASoZZ5CAApjfNu0dLvtnSRNiZwEA1KSfhvr61u47N/0ydhCg0nGjWKAAOjt67whmV0h6OHYWAEBtMenWMHnyFZQjoDA4gwQU0PyrLniRGvJ3uPyNsbMAAKreXpff1NXRy5Y6oIAoSEDhWUvb9Fsk/3tJ9bHDAACq0kP54K0PpntzsYMA1YaCBBRJy6Lpr5T5Cklnxc4CAKgeJi3L79//3u57du2PnQWoRhQkoIgubm08oy7RMklviJ0FAFDZTHpGZu/pbO9ZHjsLUM0Y8w0U0aMbn9y/q/XJ5ef86rRByV4pBqMAAEZnrYfUGzIrt66KHQSodpxBAkqkpW1qiylZ7lJj7CwAgIrhcv/KU3vtr3L35vpjhwFqAQUJKKEF1zWe4kO61aXrY2cBAJQ51+OW2I2d7T3fix0FqCUUJCCC+W2NrS7dJunU2FkAAOXI7w/1De/g3kZA6VGQgEia2xqnJablcs2PnQUAUDYOuvSRro7cP0ry2GGAWsSQBiCSX2affGrGi+fePnTynv2SXin+PgJArVuvYG/qWpm7O3YQoJZxBgkoAwuuPX9uCKk7JL08dhYAQMkNyfWl/T7u49l0diB2GKDWUZCAMrHwhinj9+2vWyrTh8Q4cACoFX1myQ2d7Vv/O3YQAMMoSECZaVk87RXm9m+MAweAquaS/ev+0PAX2XT2mdhhAPwGBQkoQ8PjwP0LLrtJ/D0FgGqzTRbenWnv+3HsIAB+G2+8gDLW3Dr18iRJviFpRuwsAIAx46wRUAEoSECZu7T1nAlDNv4TMv2lmHQHAJWq101/3NWeWxU7CIBjoyABFWJBW+MlQfqGpFmxswAARmxI7l/rHzfpo+uWrdsXOwyA46MgARWk8crGcadN9o/J7a8kNcTOAwA4pofMwrs72/u6YgcBMHIUJKACLVgydXrI29cke23sLACA37LfTJ+a+Og5X1q1atVQ7DAATgwFCahcNr9t2vUu+6KkM2KHAQBIkr47lMrfvHb5tl/EDgJgdChIQIW7fMm5p/UP1S+V2c3iBrMAEMsjbvrTrvbcN2MHATA2FCSgSrQsmv5KmX9NUlPsLABQQwZN/g8HGyZ9kiEMQHWgIAFVZOHChXX7znz4Rsk+J9eLYucBgKrm+neldEtmRS4bOwqAwqEgAVVo/lUXvMjrBz/OtjsAKALXTjP/686O3jtiRwFQeBQkoIotaJ3WHFL2FbkujZ0FAKrAAbm+vN/HfSabzj4TOwyA4qAgAdVuqZL5mxvf6a7PSDozdhwAqETm+maS1H3ogfbN22NnAVBcFCSgRsy9fu6k8YP7b5brYy6dFDsPAFSILrn9RWZlz3/FDgKgNChIQI25tHXG2UOJf1zyd0lKxc4DAGXJtVOJfzpzQe/XtVQhdhwApUNBAmrUoeuTviTXq2JnAYByYdIzMn0plT/4d6vTOw/EzgOg9ChIQI2bv2ja29zss5Jmxc4CABENmHTbYNCn1qZzT8QOAyAeChKA4UEOmxqvdulvJU2NHQcASihI+r/54B99MN2bix0GQHwUJACHNbU2NUxMHbxBbp8UE+8AVD2/XyH5UCbd81DsJADKBwUJwG95duKduz4iaXLsPABQUKbVyusjmXTuP2NHAVB+KEgAjqr52hkvTjz8ubk+wGhwAFXgZ4n0yTUduR/GDgKgfFGQABzX/KsueJHGDX3AXX8qzigBqDSm1Qr6fGZl7p7YUQCUPwoSgBGjKAGoKBQjAKNAQQJwwp7deifX+yWdEjsPADyf/7cnyae7VvT8KHYSAJWHggRg1C57y8yTByaEGyX/K0lnxc4DoNb5/e5a2rWy96exkwCoXBQkAGPWeGXjuNNP8TaX/bWkGbHzAKgpQdL3k+BL16R7u2OHAVD5KEgACmbhwoV1+166s03ShyXNiZ0HQFU7KOl/W0h9sTO9ZVvsMACqBwUJQFE0t069PEmSD0v6A/GzBkChuB6X9H+GktSX17Zv2RU7DoDqw5sWAEW1YMnU6WHIbpbZH0uaGDsPgMrksnVm4at1+f5lq9M7D8TOA6B6UZAAlMTFrY1n1Kd0owfdLNM5sfMAqAgu+Y/l9uXMytx3h/8dAIqLggSgpBqvbBx32im6Rqb3y3Vp7DwAytLTkv+byb/W2dG3NXYYALWFggQgmkvapl+Y9/Bemb1L0qTYeQBEt1myf94fGr6RTWefiR0GQG2iIAGIbsF1jaeEvC+W2y2SmmLnAVBSA5K+LU9uy6zcen/sMABAQQJQTqxl8dRXu+xd5naVpPGxAwEoms0y/0Z9ve742bLex2OHAYBnUZAAlKXm1qmTk5S1ye09kn43dh4ABXFQ0j2Hzhb9WAxdAFCGKEgAyl7LtY1Nyut6JfpjuV4UOw+AE2Tqlvy2hv11K376nS17Y8cBgGOhIAGoGAtvmDJ+3/6618l0vaS3SmqInQnAUbh2Sv7/zFL/u7Nj689jxwGAkaIgAahIly8597T+UN8qt3dIeoX4eQaUg90mfcc9uYMtdAAqFW8oAFS8+W1TZ7jbH5rZtS41xs4D1JiDLt0ntzuf3uvfzd2b648dCADGgoIEoKq0XNvYZK5Wd18s2czYeYAq1S/pRyZPW53dveau3J7YgQCgUChIAKrWb8qSrpU0I3YeoMIdLkX54N/uTvftjh0IAIqBggSgJixondYcUnqbe/IWk8+NnQeoEHtkus9k387n89+jFAGoBRQkADXn4iXnn1cXkjfI7c2S3iCpPnYmoIw8YdJ97ko/tVc/5JoiALWGggSgps2/6oIXqWHwD1z2Jkmvk3Rq7ExAibmkh8x1r1u4O9PR1yWmzwGoYRQkADiktVWpHZp2kafste56s6RLJSWxcwFF8KSkH8v8/iRl319zV25n7EAAUC4oSABwFAuuPf+leU+9XvIrLdhrZHpJ7EzAKA1J6pL0w0S699yQy6TTyscOBQDliIIEACPUsmTGVIX8a+X2WkmvkXR67EzAMfRJdr/J729IDdz/k+U7noodCAAqAQUJAEahtVWp7cnU3zVPXeHmr5b0Ckknx86FmuUubZb5fyZu/z4YtGptOvdE7FAAUIkoSABQAK2tSm2va7xA7peZ2+UuXS7p/Ni5ULWGZPq5gv/UzH5CIQKAwqEgAUCRNLdOPTdJkt+T61KZzZf85ZIaYudCRXrEpUxieiCfDz89eVLoWnX79oOxQwFANaIgAUCJLFy4sG7fy3bOtODN7mpWYpfJdZGkVOxsKCt7JK2Xe7eZuj2V+klm+da+2KEAoFZQkAAgosveMvPkgfHhYrPwcpfNlXSRpCZJEyJHQ2nskLTOXOtkeshS4aE1y/ty4j5EABANBQkAykxrq1J9dTOmJ/kwV4kukmu2SRf68DVNnG2qTE9J2iJpg8nXebB14+oH1jFZDgDKDwUJACpE45WN4yafFGZYKplpwS6Q+YWSLjBphksnxc4HuUk7grTF5JvMk82msEWpsHHNim2PxQ4HABgZChIAVIHLl5x72uBg/VRPbKpMU91tqhSmSjZV0nnizFOh9Et6RPI+Kekz8z65+ix434HxkzavW7ZuX+yAAICxoSABQJVrvLJx3Oknpc5Sys9xD+e67CzzcI6U/I4SP1uucySdIak+dtbI9rq00+SPyJJHFMIOU7JLpp2WDO0YUv2u7hVbfxU7JACguChIAABJ0vyrLnhRfnw4I+U6Q8q/2N3OlHSGy15s8tPd/dQkSSa7+6mSJks6VeV5c9xBSU+btNtNu+X+lLk9HUy7zfUrMz0eTE/I/VcyezSV0hO/flJP5O7N9ccODgCIj4IEABg9l1266JzxqfrTxg/UDSb1Az7uYH6wTklSbyFVZ3X5Onc1JAopSTJP6tyS552p8uDmrnGWygdT3cBzv2d5uaeGDt/vJ59Xf1KXhBB0MEkl3hDs4JAN5OvtpAEfPzB0sO6kg923dQ+W5j8eAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUuv8PGTn1Xv0NouMAAAAASUVORK5CYII=" style="width: 80px; height: auto;" alt="Logo Kiri" />
            </td>
            <td style="border: none; text-align: center; vertical-align: middle; padding: 0;">
              <h2 style="margin:0; font-size: 14pt; font-weight: bold;">GMAHK Jemaat PISGAH BIDAC</h2>
              <h3 style="margin:5px 0 0 0; font-size: 12pt;">Laporan Keuangan Pembangunan</h3>
              <p style="margin:5px 0 0 0; font-size: 10pt;">Bulan/Tahun: <strong>${monthName} ${targetYear}</strong></p>
            </td>
            <td style="width: 100px; border: none; text-align: right; vertical-align: middle; padding: 0;">
              <img src="./icons/PisgahColor.png" style="width: 80px; height: auto;" alt="Logo Kanan" />
            </td>
          </tr>
        </table>

        <div style="font-family:sans-serif; font-weight:bold; margin-bottom:4px;">Pemasukan</div>
        <table style="${ts}; margin-bottom:16px;">
          <thead>
            <tr>
              <th style="${th} width:15%;">Tanggal</th>
              <th style="${th} width:20%;">No. Voucher/kwitansi</th>
              <th style="${th} width:40%;">Deskripsi Penerimaan</th>
              <th style="${th} width:25%;">Amount IDR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; font-style:italic; background-color:yellow;">Saldo Awal</td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; text-align:right; background-color:yellow;">IDR &nbsp; &nbsp; ${fmtEx(saldoAwal)}</td>
            </tr>
            <tr><td colspan="4" style="background-color:#4472c4; height:12px; border:1px solid #000;"></td></tr>
            ${pemRows}
            <tr>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; font-style:italic; background-color:#ffc000;">Total pembangunan bulan ini</td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; text-align:right; background-color:#ffc000;">IDR &nbsp; &nbsp; ${fmtEx(sumPemasukan)}</td>
            </tr>
            <tr>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; font-style:italic; background-color:yellow;">Total saldo Pemasukan</td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; text-align:right; background-color:yellow;">IDR &nbsp; &nbsp; ${fmtEx(saldoAwal + sumPemasukan)}</td>
            </tr>
          </tbody>
        </table>

        <div style="font-family:sans-serif; font-weight:bold; margin-bottom:4px;">Pengeluaran</div>
        <table style="${ts}">
          <thead>
            <tr>
              <th style="${th} width:15%;">Tanggal</th>
              <th style="${th} width:20%;">No. Voucher/kwitansi</th>
              <th style="${th} width:40%;">Deskripsi Pengeluaran</th>
              <th style="${th} width:25%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${pengRows}
            <tr>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; font-style:italic;">Total saldo Pengeluaran</td>
              <td style="border:1px solid #000; padding:4px; text-align:right;">IDR &nbsp; &nbsp; ${sumPengeluaran === 0 ? '-' : fmtEx(sumPengeluaran)}</td>
            </tr>
            <tr>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px;"></td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; font-style:italic; background-color:yellow;">Saldo Akhir Pembangunan</td>
              <td style="border:1px solid #000; padding:4px; font-weight:bold; text-align:right; background-color:yellow;">IDR &nbsp; &nbsp; ${fmtEx(saldoAwal + sumPemasukan - sumPengeluaran)}</td>
            </tr>
          </tbody>
        </table>
      `;

      const imgBen = useBenImg ? `<img src="${systemConfig.sig_bendahara}" style="height:60px; object-fit:contain; margin:5px 0;">` : `<br><br><br><br><br>`;
      const imgBgn = useBgnImg ? `<img src="${systemConfig.sig_bangun}" style="height:60px; object-fit:contain; margin:5px 0;">` : `<br><br><br><br><br>`;
      const imgKet = useKetuaImg ? `<img src="${systemConfig.sig_ketua}" style="height:60px; object-fit:contain; margin:5px 0;">` : `<br><br><br><br><br>`;
      const imgPen = useGembalaImg ? `<img src="${systemConfig.sig_pendeta}" style="height:60px; object-fit:contain; margin:5px 0;">` : `<br><br><br><br><br>`;

      const nameBen = systemConfig.sig_name_bendahara || 'Herbert JS Sagala';
      const titleBen = systemConfig.sig_title_bendahara || 'Bendahara Jemaat';
      const nameBgn = systemConfig.sig_name_bangun || 'Parulian Parhusip';
      const titleBgn = systemConfig.sig_title_bangun || 'Ketua Pembangunan';
      const nameKet = systemConfig.sig_name_ketua || 'Yosep Santoso';
      const titleKet = systemConfig.sig_title_ketua || 'Ketua Jemaat';
      const namePen = systemConfig.sig_name_pendeta || 'Pdt. Joseph Sitohang';
      const titlePen = systemConfig.sig_title_pendeta || 'Gembala Jemaat';

      const signHtml = `
        <table style="width: 100%; margin-top: 40px; text-align: center; font-family: sans-serif; font-size: 10pt; color: #000; border: none; background: transparent;">
          <tr>
            <td style="width: 25%; border: none; vertical-align: bottom;">Dibuat Oleh,<br>${imgBen}<br><strong>${nameBen}</strong><br>${titleBen}</td>
            <td style="width: 25%; border: none; vertical-align: bottom;">Disetujui Oleh,<br>${imgBgn}<br><strong>${nameBgn}</strong><br>${titleBgn}</td>
            <td style="width: 25%; border: none; vertical-align: bottom;">Disahkan Oleh,<br>${imgKet}<br><strong>${nameKet}</strong><br>${titleKet}</td>
            <td style="width: 25%; border: none; vertical-align: bottom;">Mengetahui,<br>${imgPen}<br><strong>${namePen}</strong><br>${titlePen}</td>
          </tr>
        </table>
      `;

      return html + signHtml;
    }

    function openSidebar() { document.getElementById('sidebar').classList.add('open'); document.getElementById('overlay').classList.add('show'); }
    function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }

    window.onload = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const printId = urlParams.get('print');
      const searchQuery = urlParams.get('search');

      const tk = getToken();
      if (tk) {
        currentUser = getCurrentUser();
        if (currentUser) {
          if (document.getElementById('loginBtnText')) document.getElementById('loginBtnText').innerHTML = '<span class="spinner"></span> Memulihkan...';
          launchApp();
          return;
        }
      }

      if (printId || searchQuery) {
          setStatus('loading', searchQuery ? 'Mencari Transaksi...' : 'Menyiapkan Kuitansi (Publik)...');
          doLogin('test', 'Test1117!');
          return;
      }

      setStatus('loading', 'Menghubungkan...');
      // Run both concurrently without awaiting so the UI is responsive
      loadSystemConfig();
      checkAPIConnection();
    };




// --- INJECTED BY REFACTOR SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.icon-placeholder').forEach(el => {
        if (typeof getIcon === 'function') {
            el.outerHTML = getIcon(el.getAttribute('data-icon'), el.getAttribute('data-size'));
        }
    });
});

// --- EXPORT TO WINDOW ---
window.checkSaldo = checkSaldo;
window.generateComplexReportHtml = generateComplexReportHtml;
window.generateReceiptHTML = generateReceiptHTML;
window.saveSignatureText = saveSignatureText;
window.saveIncTypeForm = saveIncTypeForm;
window.getIncomeTypeConfig = getIncomeTypeConfig;
window.getPhotoBtnText = getPhotoBtnText;
window.loadAllTransactions = loadAllTransactions;
window.isReceiptDuplicate = isReceiptDuplicate;
window.getPhotoBtnIcon = getPhotoBtnIcon;
window.updateMyAccount = updateMyAccount;
window.removePhoto = removePhoto;
window.goToMyUnitHistory = goToMyUnitHistory;
window.doPrintReport = doPrintReport;
window.togglePassword = togglePassword;
window.updateClosingModalStatus = updateClosingModalStatus;
window.renderMasterUnits = renderMasterUnits;
window.renderUsers = renderUsers;
window.saveMutasiForm = saveMutasiForm;
window.apiPost = apiPost;
window.renderPhotoPreview = renderPhotoPreview;
window.loadReport = loadReport;
window.renderMasterDepts = renderMasterDepts;
window.toggleTheme = toggleTheme;
window.getSaldoForSource = getSaldoForSource;
window.deleteIncType = deleteIncType;
window.syncAllData = syncAllData;
window.saveUnitForm = saveUnitForm;
window.deleteTransaction = deleteTransaction;
window.clearToken = clearToken;
window.validatePassword = validatePassword;
window.deleteDept = deleteDept;
window.saveEditTransaction = saveEditTransaction;
window.handleEditTypeChange = handleEditTypeChange;
window.openBulkPrintModal = openBulkPrintModal;
window.renderRoles = renderRoles;
window.selectRoleTab = selectRoleTab;
window.handleManualSync = handleManualSync;
window.openSidebar = openSidebar;
window.formatRupiah = formatRupiah;
window.applyRoleAccess = applyRoleAccess;
window.renderDashboard = renderDashboard;
window.editUser = editUser;
window.getCatBadge = getCatBadge;
window.changePhoto = changePhoto;
window.closeBulkPrintModal = closeBulkPrintModal;
window.deleteUser = deleteUser;
window.updateRolePerm = updateRolePerm;
window.exportHistoryExcel = exportHistoryExcel;
window.getIcon = getIcon;
window.openDashboardDetail = openDashboardDetail;
window.closeDashboardDetail = closeDashboardDetail;
window.handleSignatureUpload = handleSignatureUpload;
window.getToken = getToken;
window.openPhotoModalById = openPhotoModalById;
window.fmtDate = fmtDate;
window.launchApp = launchApp;
window.initForms = initForms;
window.renderLogs = renderLogs;
window.updateAppStatus = updateAppStatus;
window.loginAsPublic = loginAsPublic;
window.approveBulkTx = approveBulkTx;
window.saveExpenseForm = saveExpenseForm;
window.getActiveApiUrl = getActiveApiUrl;
window.groupTransactions = groupTransactions;
window.updateBottomNavIndicator = updateBottomNavIndicator;
window.notify = notify;
window.saveRolePermissions = saveRolePermissions;
window.closeClosingModal = closeClosingModal;
window.todayStr = todayStr;
window.applyConfig = applyConfig;
window.updateIncomeAlloc = updateIncomeAlloc;
window.safeIcon = safeIcon;
window.editIncType = editIncType;
window.handleLogoUpload = handleLogoUpload;
window.updateRoleAnon = updateRoleAnon;
window.handleReceiptPhoto = handleReceiptPhoto;
window.saveDeptForm = saveDeptForm;
window.openPhotoModal = openPhotoModal;
window.checkAPIConnection = checkAPIConnection;
window.fmtInputDate = fmtInputDate;
window.openClosingModal = openClosingModal;
window.showGlobalLoading = showGlobalLoading;
window.renderReportView = renderReportView;
window.setStatus = setStatus;
window.renderMasterIncTypes = renderMasterIncTypes;
window.showCustomConfirm = showCustomConfirm;
window.updateLastReceipts = updateLastReceipts;
window.doLogin = doLogin;
window.updateThemeIcons = updateThemeIcons;
window.terbilang = terbilang;
window.apiPostWithFallback = apiPostWithFallback;
window.cancelEditUnit = cancelEditUnit;
window.searchByReceipt = searchByReceipt;
window.updateGlobalApprovalBadge = updateGlobalApprovalBadge;
window.generatePembangunanReportHtml = generatePembangunanReportHtml;
window.renderIncomeList = renderIncomeList;
window.login = login;
window.renderHistory = renderHistory;
window.toggleMyUnitFilter = toggleMyUnitFilter;
window.resetPhotoUpload = resetPhotoUpload;
window.resetRolePerms = resetRolePerms;
window.checkMutSaldo = checkMutSaldo;
window.getDefaultRolePerms = getDefaultRolePerms;
window.toggleSortHistory = toggleSortHistory;
window.saveUserForm = saveUserForm;
window.printUnitReport = printUnitReport;
window.setToken = setToken;
window.closeSidebar = closeSidebar;
window.resetLogo = resetLogo;
window.closePhotoModal = closePhotoModal;
window.doPrintPembangunan = doPrintPembangunan;
window.renderExpenseList = renderExpenseList;
window.applyReportSensor = applyReportSensor;
window.closeEditModal = closeEditModal;
window.saveAppTextFromInputs = saveAppTextFromInputs;
window.getRolePerms = getRolePerms;
window.exportToExcel = exportToExcel;
window.exportPembangunanExcel = exportPembangunanExcel;
window.saveServerSettings = saveServerSettings;
window.saveIncomeForm = saveIncomeForm;
window.printTransaction = printTransaction;
window.updatePhotoModalView = updatePhotoModalView;
window.getUserUnits = getUserUnits;
window.parseRupiah = parseRupiah;
window.cancelEditDept = cancelEditDept;
window.openEditTrans = openEditTrans;
window.toggleCloseMonthFromModal = toggleCloseMonthFromModal;
window.showPage = showPage;

    function doPrintPartisipasi() {
      const allowedRoles = ['Admin', 'Bendahara', 'Ketua Jemaat', 'Pendeta', 'Gembala'];
      if (!currentUser || !allowedRoles.includes(currentUser.role)) {
        return notify('Anda tidak memiliki akses untuk mencetak laporan ini.', 'error');
      }
      if (!currentReportData) return notify('Generate laporan terlebih dahulu', 'error');

      const html = generatePartisipasiReportHtml(currentReportData);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(html);
      iframe.contentWindow.document.close();

      iframe.contentWindow.focus();
      setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
    window.doPrintPartisipasi = doPrintPartisipasi;

    function generatePartisipasiReportHtml(data) {
      const mNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      let periodStr = `Periode: ${mNames[data.month] || ''} ${data.year || ''}`.trim();
      if (data.mode === 'akumulasi') {
        periodStr = `S/d: ${mNames[data.month] || ''} ${data.year || ''}`.trim();
        if (data.month === 0) periodStr = `S/d: Akhir Tahun ${data.year || ''}`.trim();
      }

      // Filter incomes
      const isMatch = (dateStr) => {
        const d = new Date(dateStr);
        if (data.mode === 'akumulasi') {
          if (data.year !== 0) {
            if (d.getFullYear() > data.year) return false;
            if (d.getFullYear() === data.year && data.month !== 0 && (d.getMonth() + 1) > data.month) return false;
          }
          return true;
        } else {
          if (data.year !== 0 && d.getFullYear() !== data.year) return false;
          if (data.month !== 0 && (d.getMonth() + 1) !== data.month) return false;
          return true;
        }
      };

      const parts = {}; // Group by unit_name -> nama_pemberi -> income_type -> amount
      let grandTotal = 0;
      let grandTotalCats = {};
      let allocDaerah = 0;
      let allocJemaat = 0;
      let allocBangun = 0;

      const isSensorName = document.getElementById('sensorPemasukan') ? document.getElementById('sensorPemasukan').checked : false;
      const isSensorUnit = document.getElementById('sensorUnit') ? document.getElementById('sensorUnit').checked : false;

      (cachedIncome || []).filter(x => isMatch(x.date)).forEach(x => {
        if (x.income_type === 'Mutasi Kas / Setor Bank') return;
        let unit = (x.unit_name && x.unit_name !== '-') ? x.unit_name : 'Lainnya / Tanpa Unit';
        let pemberi = (x.nama_pemberi && x.nama_pemberi !== '-') ? x.nama_pemberi : 'Hamba Tuhan';
        
        if (isSensorUnit && unit !== 'Lainnya / Tanpa Unit') {
          unit = 'Unit *** (Privasi)';
        }
        
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
                <div style="font-weight: 600;">${isSensorName ? '*** (Privasi)' : giver}</div>
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
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background: white; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 5px; color: #0f172a; text-transform: uppercase; }
            h2 { text-align: center; font-size: 14px; margin-bottom: 20px; color: #475569; font-weight: normal; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; font-size: 12px; color: #334155; text-align: left; }
            td { border: 1px solid #e2e8f0; }
            .total-row td { background-color: #f8fafc; font-weight: bold; border-top: 2px solid #94a3b8; }
            @media print {
              @page { size: A4 portrait; margin: 15mm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>LAPORAN PARTISIPASI JEMAAT (PER UNIT PEMBERI)</h1>
          <h2>${systemConfig.app_name || 'Gereja'} - ${periodStr}</h2>

          <table>
            <thead>
              <tr>
                <th style="width:40px; text-align:center;">No</th>
                <th>Nama Anggota & Rincian Kategori</th>
                <th style="text-align:right; width:150px;">Total Bantuan</th>
              </tr>
            </thead>
            <tbody>
              ${tbodyHtml}
              <tr class="total-row">
                <td colspan="2" style="text-align: right; padding: 12px 8px; font-size: 14px;">GRAND TOTAL:</td>
                <td style="text-align: right; padding: 12px 8px; font-size: 14px; color: #059669;">Rp ${fmt(grandTotal)}</td>
              </tr>
            </tbody>
          </table>

          <div style="font-size: 12px; margin-top: 20px; padding: 15px; border: 1px solid #e2e8f0; background-color: #f8fafc; border-radius: 6px; page-break-inside: avoid; break-inside: avoid;">
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
          
          <div style="margin-top: 40px; font-size: 12px; text-align: right; color: #64748b;">
            Dicetak pada: ${new Date().toLocaleString('id-ID')}
          </div>
        </body>
        </html>
      `;
    }

window.apiGet = apiGet;
window.fmt = fmt;
window.calculateExtendedBalances = calculateExtendedBalances;
window.loadSystemConfig = loadSystemConfig;
window.deleteUnit = deleteUnit;
window.editUnit = editUnit;
window.approveTx = approveTx;
window.checkMonthClosed = checkMonthClosed;
window.cancelEditUser = cancelEditUser;
window.loadMasterData = loadMasterData;
window.getCurrentUser = getCurrentUser;
window.renderMutasiList = renderMutasiList;
window.hideGlobalLoading = hideGlobalLoading;
window.cancelEditIncType = cancelEditIncType;
window.loadPembangunanData = loadPembangunanData;
window.doBulkPrint = doBulkPrint;
window.isPrivateCategory = isPrivateCategory;
window.doLogout = doLogout;
window.preLoadLogos = preLoadLogos;
window.handleTypeChange = handleTypeChange;

// --- No. Series Config & Auto Generate ---
function loadSeriesConfig() {
  const month = document.getElementById('seriesMonth').value;
  const year = document.getElementById('seriesYear').value;
  const key = `${year}-${month.padStart(2, '0')}`;
  
  if (typeof systemConfig.receipt_series === 'string') {
    try { systemConfig.receipt_series = JSON.parse(systemConfig.receipt_series); } catch(e) { systemConfig.receipt_series = {}; }
  }
  if (!systemConfig.receipt_series) systemConfig.receipt_series = {};
  const config = systemConfig.receipt_series[key] || {};
  
  const cats = ['Pemasukan', 'PemasukanPembangunan', 'PengeluaranJemaat', 'PengeluaranDaerah', 'PengeluaranPembangunan', 'Mutasi'];
  cats.forEach(cat => {
    document.getElementById(`series_${cat}_start`).value = config[cat] ? config[cat].start : '';
    document.getElementById(`series_${cat}_end`).value = config[cat] ? config[cat].end : '';
  });
}

async function saveSeriesConfig() {
  const month = document.getElementById('seriesMonth').value;
  const year = document.getElementById('seriesYear').value;
  const key = `${year}-${month.padStart(2, '0')}`;
  
  if (typeof systemConfig.receipt_series === 'string') {
    try { systemConfig.receipt_series = JSON.parse(systemConfig.receipt_series); } catch(e) { systemConfig.receipt_series = {}; }
  }
  if (!systemConfig.receipt_series) systemConfig.receipt_series = {};
  if (!systemConfig.receipt_series[key]) systemConfig.receipt_series[key] = {};
  
  const cats = ['Pemasukan', 'PemasukanPembangunan', 'PengeluaranJemaat', 'PengeluaranDaerah', 'PengeluaranPembangunan', 'Mutasi'];
  cats.forEach(cat => {
    const start = document.getElementById(`series_${cat}_start`).value;
    const end = document.getElementById(`series_${cat}_end`).value;
    if (start || end) {
      systemConfig.receipt_series[key][cat] = {
        start: start ? parseInt(start) : null,
        end: end ? parseInt(end) : null
      };
    } else {
      delete systemConfig.receipt_series[key][cat];
    }
  });
  
  localStorage.setItem('BISDAC_config', JSON.stringify(systemConfig));
  
  console.log("saveSeriesConfig dipanggil");
  if (window.showGlobalLoading) window.showGlobalLoading();
  try {
    const res = await window.apiPostWithFallback('saveConfig', { key: 'receipt_series', value: JSON.stringify(systemConfig.receipt_series) });
    if (res.success) {
      if (window.notify) window.notify('Pengaturan No. Series disimpan', 'success');
      else alert('Pengaturan No. Series disimpan');
    } else throw new Error(res.message);
  } catch(e) {
    if (window.notify) window.notify('Gagal menyimpan No. Series: ' + e.message, 'error');
    else alert('Gagal menyimpan No. Series: ' + e.message);
  }
  if (window.hideGlobalLoading) window.hideGlobalLoading();
}

function getNextReceiptNumber(dateStr, typeCat, prefix) {
  if (!dateStr) return { err: 'Pilih tanggal terlebih dahulu' };
  const d = new Date(dateStr);
  const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}`;
  if (typeof systemConfig.receipt_series === 'string') {
    try { systemConfig.receipt_series = JSON.parse(systemConfig.receipt_series); } catch(e) { systemConfig.receipt_series = {}; }
  }
  if (!systemConfig.receipt_series || !systemConfig.receipt_series[key] || !systemConfig.receipt_series[key][typeCat]) {
    return { err: `No. Series untuk ${typeCat} bulan ${key} belum diatur!` };
  }
  const config = systemConfig.receipt_series[key][typeCat];
  if (!config.start) return { err: `Nomor Mulai untuk ${typeCat} bulan ${key} belum diatur!` };
  
  let allTx = [];
  if (typeCat.startsWith('Pemasukan')) allTx = window.cachedIncome || [];
  else if (typeCat.startsWith('Pengeluaran') || typeCat === 'Mutasi') allTx = window.cachedExpense || [];
  
  let maxNum = -1;
  
  allTx.forEach(tx => {
    if (!tx.date || !tx.date.startsWith(key)) return;
    
    let matchCat = false;
    if (typeCat === 'PemasukanPembangunan' && tx.income_type === 'Pembangunan') matchCat = true;
    else if (typeCat === 'Pemasukan' && tx.income_type !== 'Pembangunan' && tx.income_type !== 'Saldo Awal Sistem') matchCat = true;
    else if (typeCat === 'PengeluaranJemaat' && tx.source_balance === 'Jemaat' && tx.department !== 'Mutasi Kas / Setor Bank') matchCat = true;
    else if (typeCat === 'PengeluaranDaerah' && tx.source_balance === 'Daerah' && tx.department !== 'Mutasi Kas / Setor Bank') matchCat = true;
    else if (typeCat === 'PengeluaranPembangunan' && tx.source_balance === 'Pembangunan' && tx.department !== 'Mutasi Kas / Setor Bank') matchCat = true;
    else if (typeCat === 'Mutasi' && tx.department === 'Mutasi Kas / Setor Bank') matchCat = true;
    
    if (matchCat && tx.receipt_no) {
      let rNumStr = String(tx.receipt_no).trim();
      if (prefix === '') {
        if (/^\d+$/.test(rNumStr)) {
          let num = parseInt(rNumStr);
          if (num > maxNum && num >= config.start && (config.end ? num <= config.end : true)) maxNum = num;
        }
      } else {
        if (rNumStr.startsWith(prefix)) {
          let numPart = rNumStr.substring(prefix.length);
          if (/^\d+$/.test(numPart)) {
            let num = parseInt(numPart);
            if (num > maxNum && num >= config.start && (config.end ? num <= config.end : true)) maxNum = num;
          }
        }
      }
    }
  });
  
  let nextNum = maxNum === -1 ? config.start : maxNum + 1;
  if (config.end && nextNum > config.end) {
    return { err: `Nomor seri untuk ${typeCat} bulan ${key} sudah habis (melewati ${config.end}). Silakan perbarui pengaturan No. Series.` };
  }
  
  return { val: prefix + nextNum };
}

window.autoGenerateReceipt = function(formType) {
  let dateInput, inputElem, typeCat, prefix;
  if (formType === 'INC') {
    dateInput = document.getElementById('incDate').value;
    inputElem = document.getElementById('incReceipt');
    let incType = document.getElementById('incType').value;
    if (incType === 'Pembangunan') {
      typeCat = 'PemasukanPembangunan'; prefix = 'PEMB-';
    } else {
      typeCat = 'Pemasukan'; prefix = '';
    }
  } else if (formType === 'EXC') {
    dateInput = document.getElementById('excDate').value;
    inputElem = document.getElementById('excReceipt');
    let source = document.getElementById('excSource').value;
    if (source === 'Jemaat') { typeCat = 'PengeluaranJemaat'; prefix = 'COST-'; }
    else if (source === 'Daerah') { typeCat = 'PengeluaranDaerah'; prefix = 'MBR-'; }
    else if (source === 'Pembangunan') { typeCat = 'PengeluaranPembangunan'; prefix = 'CP-'; }
  } else if (formType === 'PB') {
    dateInput = document.getElementById('pbDate').value;
    inputElem = document.getElementById('pbReceipt');
    typeCat = 'Mutasi'; prefix = 'PB-';
  }
  
  const res = getNextReceiptNumber(dateInput, typeCat, prefix);
  if (res.err) {
    notify(res.err, 'error');
  } else {
    inputElem.value = res.val;
  }
};
window.loadSeriesConfig = loadSeriesConfig;
window.saveSeriesConfig = saveSeriesConfig;

document.addEventListener('DOMContentLoaded', () => {
  const curY = new Date().getFullYear();
  let html = '';
  for(let y = 2024; y <= curY + 5; y++) {
    html += `<option value="${y}" ${y === curY ? 'selected' : ''}>${y}</option>`;
  }
  let seriesYearEl = document.getElementById('seriesYear');
  if (seriesYearEl) {
    seriesYearEl.innerHTML = html;
    document.getElementById('seriesMonth').value = (new Date().getMonth() + 1).toString();
  }
});
