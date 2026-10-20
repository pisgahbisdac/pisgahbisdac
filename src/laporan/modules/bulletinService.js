// ==========================================
// SABBATH FINANCIAL BULLETIN SERVICE
// ==========================================

const fmt = (n) => Math.round(n || 0).toLocaleString('id-ID');
export function getRecentSabbaths(count = 6) {
  const result = [];
  const now = new Date();
  let latestSat = new Date(now);
  const day = latestSat.getDay();
  const diffToSat = (day === 6) ? 0 : (day + 1);
  latestSat.setDate(latestSat.getDate() - diffToSat);
  latestSat.setHours(23, 59, 59, 999);

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  for (let i = 0; i < count; i++) {
    const d = new Date(latestSat);
    d.setDate(d.getDate() - (i * 7));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const label = `Sabat, ${d.getDate()} ${months[d.getMonth()]} ${yyyy}${i === 0 ? ' (Terbaru)' : ''}`;
    result.push({ dateStr, label, dateObj: d });
  }
  return result;
}

let currentSabbathBulletinData = null;

export function calculateNetBalancesAsOf(targetDateEnd) {
  const cachedSaldo = window.cachedSaldo || { daerah: 0, jemaat: 0, bangun: 0, total: 0 };
  const cachedIncome = window.cachedIncome || [];
  const cachedExpense = window.cachedExpense || [];
  if (!cachedSaldo) {
    return {
      tanganDaerah: 0,
      bankDaerah: 0,
      tanganJemaat: 0,
      bankJemaat: 0,
      tanganBangun: 0,
      bankBangun: 0,
      calcJemaat: 0,
      calcBangun: 0,
      calcDaerah: 0,
      saldoBersih: 0,
      tanganBersih: 0,
      bankBersih: 0,
      totalTangan: 0,
      totalBank: 0,
      totalGabungan: 0
    };
  }

  const historicalInc = (cachedIncome || []).filter(x => new Date(x.date || x.created_at) <= targetDateEnd);
  const historicalExp = (cachedExpense || []).filter(x => new Date(x.date || x.created_at) <= targetDateEnd);

  let calcDaerah = cachedSaldo.initDaerah || 0;
  let calcJemaat = cachedSaldo.initJemaat || 0;
  let calcBangun = cachedSaldo.initBangun || 0;
  let bankDaerah = calcDaerah;
  let bankJemaat = calcJemaat;
  let bankBangun = calcBangun;
  let tanganDaerah = 0;
  let tanganJemaat = 0;
  let tanganBangun = 0;

  historicalInc.forEach(i => {
    if (i.income_type === 'Mutasi Kas / Setor Bank') return;
    calcDaerah += (i.alloc_daerah || 0);
    calcJemaat += (i.alloc_jemaat || 0);
    calcBangun += (i.alloc_bangun || 0);
    const isCashInc = (i.note || '').includes('[CASH]');
    if (isCashInc) {
      tanganDaerah += (i.alloc_daerah || 0);
      tanganJemaat += (i.alloc_jemaat || 0);
      tanganBangun += (i.alloc_bangun || 0);
    } else {
      bankDaerah += (i.alloc_daerah || 0);
      bankJemaat += (i.alloc_jemaat || 0);
      bankBangun += (i.alloc_bangun || 0);
    }
  });

  historicalExp.forEach(e => {
    const isMutasi = e.department === 'Mutasi Kas / Setor Bank';
    let srcBase = e.source_balance || '';
    let expNote = e.note || '';

    if (srcBase === 'Kas Daerah (Bank)') { srcBase = 'Daerah'; expNote += ' [BANK]'; }
    if (srcBase === 'Kas Daerah (Di Tangan)') { srcBase = 'Daerah'; expNote += ' [CASH]'; }
    if (srcBase === 'Kas Jemaat (Bank)') { srcBase = 'Kas Jemaat'; expNote += ' [BANK]'; }
    if (srcBase === 'Kas Jemaat (Di Tangan)') { srcBase = 'Kas Jemaat'; expNote += ' [CASH]'; }
    if (srcBase === 'Kas Pembangunan (Bank)') { srcBase = 'Pembangunan'; expNote += ' [BANK]'; }
    if (srcBase === 'Kas Pembangunan (Di Tangan)') { srcBase = 'Pembangunan'; expNote += ' [CASH]'; }

    const isCashExp = expNote.includes('[CASH]') || srcBase.includes('Di Tangan');

    if (srcBase.includes('Daerah')) {
      if (!isMutasi) {
        calcDaerah -= e.amount;
        if (isCashExp) tanganDaerah -= e.amount; else bankDaerah -= e.amount;
      } else { tanganDaerah -= e.amount; bankDaerah += e.amount; }
    } else if (srcBase.includes('Pembangunan') || srcBase.includes('bangun')) {
      if (!isMutasi) {
        calcBangun -= e.amount;
        if (isCashExp) tanganBangun -= e.amount; else bankBangun -= e.amount;
      } else { tanganBangun -= e.amount; bankBangun += e.amount; }
    } else {
      if (!isMutasi) {
        calcJemaat -= e.amount;
        if (isCashExp) tanganJemaat -= e.amount; else bankJemaat -= e.amount;
      } else { tanganJemaat -= e.amount; bankJemaat += e.amount; }
    }
  });

  const totalTangan = tanganDaerah + tanganJemaat + tanganBangun;
  const totalBank = bankDaerah + bankJemaat + bankBangun;

  return {
    tanganDaerah,
    bankDaerah,
    tanganJemaat,
    bankJemaat,
    tanganBangun,
    bankBangun,
    calcJemaat,
    calcBangun,
    calcDaerah,
    saldoBersih: calcJemaat + calcBangun,
    tanganBersih: tanganJemaat + tanganBangun,
    bankBersih: bankJemaat + bankBangun,
    totalTangan,
    totalBank,
    totalGabungan: calcDaerah + calcJemaat + calcBangun
  };
}

export function handleBulletinModeChange() {
  const mode = document.getElementById('bulletinModeSelect')?.value || 'kombinasi';
  const sabCont = document.getElementById('bulletinSabbathContainer');
  const monCont = document.getElementById('bulletinMonthContainer');
  if (mode === 'bulan') {
    if (sabCont) sabCont.style.display = 'none';
    if (monCont) monCont.style.display = 'flex';
  } else {
    if (sabCont) sabCont.style.display = 'flex';
    if (monCont) monCont.style.display = 'none';
  }
  renderSabbathBulletinPreview();
}

export function openSabbathBulletinModal() {
  const modal = document.getElementById('sabbathBulletinModal');
  const select = document.getElementById('bulletinSabbathSelect');
  const monthSelect = document.getElementById('bulletinMonthSelect');
  const yearInput = document.getElementById('bulletinYearInput');
  const modeSelect = document.getElementById('bulletinModeSelect');
  if (!modal) return;

  if (window.innerWidth <= 1100 && typeof closeSidebar === 'function') {
    closeSidebar();
  }

  if (select) {
    const sabbaths = getRecentSabbaths(8);
    select.innerHTML = sabbaths.map(s => `<option value="${s.dateStr}">${s.label}</option>`).join('');
  }

  const now = new Date();
  if (monthSelect) monthSelect.value = String(now.getMonth() + 1);
  if (yearInput) yearInput.value = String(now.getFullYear());
  if (modeSelect) modeSelect.value = 'kombinasi';

  handleBulletinModeChange();
  modal.style.display = 'flex';
}

export function closeSabbathBulletinModal() {
  const modal = document.getElementById('sabbathBulletinModal');
  if (modal) modal.style.display = 'none';
}

export function renderSabbathBulletinPreview() {
  const container = document.getElementById('bulletinPaperPreview');
  if (!container) return;

  const mode = document.getElementById('bulletinModeSelect')?.value || 'kombinasi';
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  let titleHeader = '';
  let subtitleHeader = '';
  let cutOffDateLabel = '';
  let endDate = new Date();
  let startWeek = new Date();
  let startMonth = new Date();
  let weekIncomes = [];
  let weekExpenses = [];
  let monthIncomes = [];
  let monthExpenses = [];

  if (mode === 'bulan') {
    const m = parseInt(document.getElementById('bulletinMonthSelect')?.value || (new Date().getMonth() + 1));
    const y = parseInt(document.getElementById('bulletinYearInput')?.value || new Date().getFullYear());
    const startDate = new Date(y, m - 1, 1, 0, 0, 0);
    endDate = new Date(y, m, 0, 23, 59, 59);
    startMonth = startDate;
    startWeek = startDate;

    titleHeader = `REKAPITULASI KEUANGAN BULAN ${months[m - 1].toUpperCase()} ${y}`;
    subtitleHeader = `Periode 1 ${months[m - 1]} s/d ${endDate.getDate()} ${months[m - 1]} ${y}`;
    cutOffDateLabel = `${endDate.getDate()} ${months[m - 1]} ${y} (Akhir Bulan)`;

    monthIncomes = (cachedIncome || []).filter(x => {
      const txDate = new Date(x.date || x.created_at);
      return txDate >= startDate && txDate <= endDate && x.income_type !== 'Mutasi Kas / Setor Bank';
    });

    monthExpenses = (cachedExpense || []).filter(x => {
      const txDate = new Date(x.date || x.created_at);
      return txDate >= startDate && txDate <= endDate && x.department !== 'Mutasi Kas / Setor Bank';
    });
  } else {
    // Mode sabat atau kombinasi
    const select = document.getElementById('bulletinSabbathSelect');
    const sabbaths = getRecentSabbaths(8);
    const selectedDateStr = select ? select.value : (sabbaths[0]?.dateStr || '');
    const activeSabbath = sabbaths.find(s => s.dateStr === selectedDateStr) || sabbaths[0];

    endDate = new Date(selectedDateStr + 'T23:59:59');
    startWeek = new Date(endDate);
    startWeek.setDate(startWeek.getDate() - 6);
    startWeek.setHours(0, 0, 0, 0);

    startMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1, 0, 0, 0);

    const sabLabelClean = activeSabbath ? activeSabbath.label.replace(' (Terbaru)', '') : 'Hari Sabat';
    cutOffDateLabel = sabLabelClean;

    if (mode === 'kombinasi') {
      titleHeader = `WARTA KEUANGAN &bull; ${sabLabelClean.toUpperCase()}`;
      subtitleHeader = `Sabat Ini &amp; Akumulasi Bulan ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
    } else {
      titleHeader = `WARTA KEUANGAN &bull; ${sabLabelClean.toUpperCase()}`;
      subtitleHeader = `Rekapitulasi 1 Pekan Berjalan (s/d ${sabLabelClean})`;
    }

    weekIncomes = (cachedIncome || []).filter(x => {
      const txDate = new Date(x.date || x.created_at);
      return txDate >= startWeek && txDate <= endDate && x.income_type !== 'Mutasi Kas / Setor Bank';
    });

    weekExpenses = (cachedExpense || []).filter(x => {
      const txDate = new Date(x.date || x.created_at);
      return txDate >= startWeek && txDate <= endDate && x.department !== 'Mutasi Kas / Setor Bank';
    });

    monthIncomes = (cachedIncome || []).filter(x => {
      const txDate = new Date(x.date || x.created_at);
      return txDate >= startMonth && txDate <= endDate && x.income_type !== 'Mutasi Kas / Setor Bank';
    });

    monthExpenses = (cachedExpense || []).filter(x => {
      const txDate = new Date(x.date || x.created_at);
      return txDate >= startMonth && txDate <= endDate && x.department !== 'Mutasi Kas / Setor Bank';
    });
  }

  // Agregasi pemasukan dengan pemisahan Kas Jemaat & Kas Daerah
  const calcIncGroup = (list) => {
    let tithe = 0; let churchBudget = 0; let building = 0; let otherIn = 0; let totalIn = 0;
    let allocDaerah = 0; let allocJemaat = 0; let allocBangun = 0;
    list.forEach(x => {
      const amt = parseFloat(x.amount) || 0;
      const cat = (x.income_type || '').toLowerCase();
      totalIn += amt;
      allocDaerah += (parseFloat(x.alloc_daerah) || 0);
      allocJemaat += (parseFloat(x.alloc_jemaat) || 0);
      allocBangun += (parseFloat(x.alloc_bangun) || 0);
      if (cat.includes('persepuluhan') || cat.includes('perpuluhan')) {
        tithe += amt;
      } else if (cat.includes('bangun')) {
        building += amt;
      } else if (x.alloc_jemaat > 0 && x.alloc_daerah === 0 && x.alloc_bangun === 0) {
        churchBudget += amt;
      } else {
        churchBudget += (parseFloat(x.alloc_jemaat) || 0);
        building += (parseFloat(x.alloc_bangun) || 0);
        otherIn += Math.max(0, amt - (parseFloat(x.alloc_jemaat) || 0) - (parseFloat(x.alloc_bangun) || 0));
      }
    });
    if (allocDaerah === 0 && tithe > 0) allocDaerah = tithe;
    if (allocBangun === 0 && building > 0) allocBangun = building;
    if (allocJemaat === 0) allocJemaat = churchBudget + otherIn;
    const incBersih = allocJemaat + allocBangun;
    return { tithe, churchBudget, building, otherIn, totalIn, allocDaerah, allocJemaat, allocBangun, incBersih };
  };

  const incWeek = calcIncGroup(weekIncomes);
  const incMonth = calcIncGroup(monthIncomes);

  // Agregasi pengeluaran per departemen dengan pemisahan Kas Jemaat vs Kas Daerah
  const calcExpGroup = (list) => {
    const expByDept = {};
    let totalOut = 0;
    let outDaerah = 0;
    let outJemaat = 0;
    let outBangun = 0;

    list.forEach(e => {
      const amt = parseFloat(e.amount) || 0;
      totalOut += amt;
      const dept = e.department || 'Lain-lain';
      expByDept[dept] = (expByDept[dept] || 0) + amt;

      let srcBase = e.source_balance || '';
      if (srcBase.includes('Daerah')) {
        outDaerah += amt;
      } else if (srcBase.includes('Pembangunan') || srcBase.includes('bangun')) {
        outBangun += amt;
      } else {
        outJemaat += amt;
      }
    });

    const outBersih = outJemaat + outBangun;
    return { expByDept, totalOut, outDaerah, outJemaat, outBangun, outBersih };
  };

  const expWeek = calcExpGroup(weekExpenses);
  const expMonth = calcExpGroup(monthExpenses);
  const expByDeptWeek = expWeek.expByDept;
  const expByDeptMonth = expMonth.expByDept;
  const totalOutWeek = expWeek.totalOut;
  const totalOutMonth = expMonth.totalOut;

  // Perhitungan Saldo Awal (cut-off 1 milidetik sebelum periode berjalan dimulai)
  const priorWeekCutOff = new Date(startWeek.getTime() - 1);
  const priorMonthCutOff = new Date(startMonth.getTime() - 1);
  const startBalancesWeek = calculateNetBalancesAsOf(priorWeekCutOff);
  const startBalancesMonth = calculateNetBalancesAsOf(priorMonthCutOff);

  // Perhitungan Kas Akhir & Kas Bersih per Hari/Sabat/Bulan terpilih (historical balance cut-off!)
  const netBalances = calculateNetBalancesAsOf(endDate);

  currentSabbathBulletinData = {
    mode,
    titleHeader,
    subtitleHeader,
    cutOffDateLabel,
    endDate,
    startWeek,
    startMonth,
    incWeek,
    incMonth,
    expWeek,
    expMonth,
    expByDeptWeek,
    expByDeptMonth,
    totalOutWeek,
    totalOutMonth,
    netBalances,
    startBalancesWeek,
    startBalancesMonth
  };

  // Render HTML Saldo Awal
  let saldoAwalHtml = '';
  if (mode === 'kombinasi') {
    saldoAwalHtml = `
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 6px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase;">Saldo Awal Kas Jemaat</div>
          <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 3px;">${fmt(startBalancesWeek.calcJemaat)}</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #cbd5e1; display:flex; justify-content:space-between;">
            <span>Pekan: <strong>${fmt(startBalancesWeek.calcJemaat)}</strong></span>
            <span>Bln: <strong>${fmt(startBalancesMonth.calcJemaat)}</strong></span>
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase;">Saldo Awal Pembangunan</div>
          <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 3px;">${fmt(startBalancesWeek.calcBangun)}</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #cbd5e1; display:flex; justify-content:space-between;">
            <span>Pekan: <strong>${fmt(startBalancesWeek.calcBangun)}</strong></span>
            <span>Bln: <strong>${fmt(startBalancesMonth.calcBangun)}</strong></span>
          </div>
        </div>
        <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 800; color: #7e22ce; text-transform: uppercase;">Kas Daerah (Titipan Tithe)</div>
          <div style="font-size: 14px; font-weight: 900; color: #581c87; margin-top: 3px;">${fmt(startBalancesWeek.calcDaerah)}</div>
          <div style="font-size: 9px; color: #9333ea; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #d8b4fe; display:flex; justify-content:space-between;">
            <span>Pekan: <strong>${fmt(startBalancesWeek.calcDaerah)}</strong></span>
            <span>Bln: <strong>${fmt(startBalancesMonth.calcDaerah)}</strong></span>
          </div>
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 900; color: #1d4ed8; text-transform: uppercase;">Total Kas Bersih Awal</div>
          <div style="font-size: 14px; font-weight: 900; color: #1e3a8a; margin-top: 3px;">${fmt(startBalancesWeek.saldoBersih)}</div>
          <div style="font-size: 9px; color: #1e40af; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #bfdbfe; display:flex; justify-content:space-between;">
            <span>Pekan: <strong>${fmt(startBalancesWeek.saldoBersih)}</strong></span>
            <span>Bln: <strong>${fmt(startBalancesMonth.saldoBersih)}</strong></span>
          </div>
        </div>
      </div>
      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 6px 12px; margin-bottom: 14px; display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#334155;">
        <span>🏛️ <strong>Total Saldo Kas Awal (Semua Kas + Daerah):</strong></span>
        <span>Awal Pekan: <strong>${fmt(startBalancesWeek.totalGabungan)}</strong> &nbsp;|&nbsp; Awal Bulan: <strong>${fmt(startBalancesMonth.totalGabungan)}</strong></span>
      </div>
    `;
  } else if (mode === 'sabat') {
    saldoAwalHtml = `
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 6px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase;">Saldo Awal Kas Jemaat</div>
          <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 3px;">${fmt(startBalancesWeek.calcJemaat)}</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #cbd5e1; display:flex; justify-content:space-around;">
            <span>Tunai: <strong>${fmt(startBalancesWeek.tanganJemaat)}</strong></span>
            <span>Bank: <strong>${fmt(startBalancesWeek.bankJemaat)}</strong></span>
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase;">Saldo Awal Pembangunan</div>
          <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 3px;">${fmt(startBalancesWeek.calcBangun)}</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #cbd5e1; display:flex; justify-content:space-around;">
            <span>Tunai: <strong>${fmt(startBalancesWeek.tanganBangun)}</strong></span>
            <span>Bank: <strong>${fmt(startBalancesWeek.bankBangun)}</strong></span>
          </div>
        </div>
        <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 800; color: #7e22ce; text-transform: uppercase;">Kas Daerah (Titipan Tithe)</div>
          <div style="font-size: 14px; font-weight: 900; color: #581c87; margin-top: 3px;">${fmt(startBalancesWeek.calcDaerah)}</div>
          <div style="font-size: 9px; color: #9333ea; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #d8b4fe; display:flex; justify-content:space-around;">
            <span>Tunai: <strong>${fmt(startBalancesWeek.tanganDaerah)}</strong></span>
            <span>Bank: <strong>${fmt(startBalancesWeek.bankDaerah)}</strong></span>
          </div>
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 900; color: #1d4ed8; text-transform: uppercase;">Total Kas Bersih Awal</div>
          <div style="font-size: 14px; font-weight: 900; color: #1e3a8a; margin-top: 3px;">${fmt(startBalancesWeek.saldoBersih)}</div>
          <div style="font-size: 9px; color: #1e40af; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #bfdbfe; display:flex; justify-content:space-around;">
            <span>Tunai: <strong>${fmt(startBalancesWeek.tanganBersih)}</strong></span>
            <span>Bank: <strong>${fmt(startBalancesWeek.bankBersih)}</strong></span>
          </div>
        </div>
      </div>
      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 6px 12px; margin-bottom: 14px; display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#334155;">
        <span>🏛️ <strong>Total Saldo Kas Awal (Semua Kas + Daerah):</strong></span>
        <span><strong>${fmt(startBalancesWeek.totalGabungan)}</strong> (Tunai: ${fmt(startBalancesWeek.totalTangan)} | Bank: ${fmt(startBalancesWeek.totalBank)})</span>
      </div>
    `;
  } else {
    // Mode bulan
    saldoAwalHtml = `
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 6px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase;">Saldo Awal Kas Jemaat</div>
          <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 3px;">${fmt(startBalancesMonth.calcJemaat)}</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #cbd5e1; display:flex; justify-content:space-around;">
            <span>Tunai: <strong>${fmt(startBalancesMonth.tanganJemaat)}</strong></span>
            <span>Bank: <strong>${fmt(startBalancesMonth.bankJemaat)}</strong></span>
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase;">Saldo Awal Pembangunan</div>
          <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 3px;">${fmt(startBalancesMonth.calcBangun)}</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #cbd5e1; display:flex; justify-content:space-around;">
            <span>Tunai: <strong>${fmt(startBalancesMonth.tanganBangun)}</strong></span>
            <span>Bank: <strong>${fmt(startBalancesMonth.bankBangun)}</strong></span>
          </div>
        </div>
        <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 800; color: #7e22ce; text-transform: uppercase;">Kas Daerah (Titipan Tithe)</div>
          <div style="font-size: 14px; font-weight: 900; color: #581c87; margin-top: 3px;">${fmt(startBalancesMonth.calcDaerah)}</div>
          <div style="font-size: 9px; color: #9333ea; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #d8b4fe; display:flex; justify-content:space-around;">
            <span>Tunai: <strong>${fmt(startBalancesMonth.tanganDaerah)}</strong></span>
            <span>Bank: <strong>${fmt(startBalancesMonth.bankDaerah)}</strong></span>
          </div>
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 8px; padding: 8px 10px; text-align:center;">
          <div style="font-size: 10px; font-weight: 900; color: #1d4ed8; text-transform: uppercase;">Total Kas Bersih Awal</div>
          <div style="font-size: 14px; font-weight: 900; color: #1e3a8a; margin-top: 3px;">${fmt(startBalancesMonth.saldoBersih)}</div>
          <div style="font-size: 9px; color: #1e40af; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #bfdbfe; display:flex; justify-content:space-around;">
            <span>Tunai: <strong>${fmt(startBalancesMonth.tanganBersih)}</strong></span>
            <span>Bank: <strong>${fmt(startBalancesMonth.bankBersih)}</strong></span>
          </div>
        </div>
      </div>
      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 6px 12px; margin-bottom: 14px; display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#334155;">
        <span>🏛️ <strong>Total Saldo Kas Awal (Semua Kas + Daerah):</strong></span>
        <span><strong>${fmt(startBalancesMonth.totalGabungan)}</strong> (Tunai: ${fmt(startBalancesMonth.totalTangan)} | Bank: ${fmt(startBalancesMonth.totalBank)})</span>
      </div>
    `;
  }

  // Render HTML preview
  let incomeTableHtml = '';
  let expenseTableHtml = '';

  if (mode === 'kombinasi') {
    incomeTableHtml = `
      <table class="bulletin-table">
        <thead>
          <tr style="background:#f8fafc; font-size:11px; text-transform:uppercase;">
            <th style="text-align:left; color:#475569;">Pos Penerimaan</th>
            <th style="text-align:right; color:#1e3a8a;">Sabat Ini</th>
            <th style="text-align:right; color:#059669;">Bulan Ini</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="color:#334155;">Persembahan Jemaat</td>
            <td style="text-align:right; font-weight:600; color:#0f172a;">${fmt(incWeek.churchBudget)}</td>
            <td style="text-align:right; font-weight:700; color:#0f172a;">${fmt(incMonth.churchBudget)}</td>
          </tr>
          <tr>
            <td style="color:#334155;">Dana Pembangunan</td>
            <td style="text-align:right; font-weight:600; color:#0f172a;">${fmt(incWeek.building)}</td>
            <td style="text-align:right; font-weight:700; color:#0f172a;">${fmt(incMonth.building)}</td>
          </tr>
          <tr>
            <td style="color:#334155;">Pos Lain &amp; Departemen</td>
            <td style="text-align:right; font-weight:600; color:#0f172a;">${fmt(incWeek.otherIn)}</td>
            <td style="text-align:right; font-weight:700; color:#0f172a;">${fmt(incMonth.otherIn)}</td>
          </tr>
          <tr style="background: #eff6ff; font-weight:700; font-size:10px; border-top:1px dashed #bfdbfe;">
            <td style="color:#1d4ed8;">&bull; Subtotal Kas Jemaat &amp; Bangun</td>
            <td style="text-align:right; color:#1d4ed8;">+${fmt(incWeek.incBersih)}</td>
            <td style="text-align:right; color:#1d4ed8;">+${fmt(incMonth.incBersih)}</td>
          </tr>
          <tr>
            <td style="color:#64748b;">Persepuluhan (Tithe / Kas Daerah)</td>
            <td style="text-align:right; font-weight:600; color:#7e22ce;">${fmt(incWeek.tithe)}</td>
            <td style="text-align:right; font-weight:700; color:#7e22ce;">${fmt(incMonth.tithe)}</td>
          </tr>
          <tr style="border-top: 2px solid #cbd5e1; background: #f8fafc;">
            <td style="font-weight:800; color:#0f172a;">TOTAL PENERIMAAN KAS</td>
            <td style="text-align:right; font-weight:800; color:#1e3a8a; font-size:12px;">+${fmt(incWeek.totalIn)}</td>
            <td style="text-align:right; font-weight:900; color:#059669; font-size:12px;">+${fmt(incMonth.totalIn)}</td>
          </tr>
        </tbody>
      </table>
    `;

    const allDepts = Array.from(new Set([...Object.keys(expByDeptWeek), ...Object.keys(expByDeptMonth)])).sort();
    const expRows = allDepts.length > 0
      ? allDepts.map(dept => `
        <tr>
          <td style="color:#334155;">&bull; ${dept}</td>
          <td style="text-align:right; font-weight:600; color:#b91c1c;">${fmt(expByDeptWeek[dept] || 0)}</td>
          <td style="text-align:right; font-weight:700; color:#dc2626;">${fmt(expByDeptMonth[dept] || 0)}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="3" style="text-align:center; color:#94a3b8; padding:8px;">Belum ada pengeluaran dicatat.</td></tr>';

    expenseTableHtml = `
      <table class="bulletin-table">
        <thead>
          <tr style="background:#f8fafc; font-size:11px; text-transform:uppercase;">
            <th style="text-align:left; color:#475569;">Departemen / Keperluan</th>
            <th style="text-align:right; color:#1e3a8a;">Sabat Ini</th>
            <th style="text-align:right; color:#dc2626;">Bulan Ini</th>
          </tr>
        </thead>
        <tbody>
          ${expRows}
          <tr style="background: #fffbeb; font-weight:700; font-size:10px; border-top:1px dashed #fde68a;">
            <td style="color:#b45309;">&bull; Subtotal Beban Jemaat &amp; Bangun</td>
            <td style="text-align:right; color:#b45309;">-${fmt(expWeek.outBersih)}</td>
            <td style="text-align:right; color:#b45309;">-${fmt(expMonth.outBersih)}</td>
          </tr>
          <tr style="background: #faf5ff; font-weight:700; font-size:10px;">
            <td style="color:#7e22ce;">&bull; Subtotal Setoran Kas Daerah</td>
            <td style="text-align:right; color:#7e22ce;">-${fmt(expWeek.outDaerah)}</td>
            <td style="text-align:right; color:#7e22ce;">-${fmt(expMonth.outDaerah)}</td>
          </tr>
          <tr style="border-top: 2px solid #cbd5e1; background: #f8fafc;">
            <td style="font-weight:800; color:#0f172a;">TOTAL PENGELUARAN</td>
            <td style="text-align:right; font-weight:800; color:#b91c1c; font-size:12px;">-${fmt(totalOutWeek)}</td>
            <td style="text-align:right; font-weight:900; color:#dc2626; font-size:12px;">-${fmt(totalOutMonth)}</td>
          </tr>
        </tbody>
      </table>
    `;
  } else {
    // Mode sabat tunggal atau bulan tunggal
    const activeInc = (mode === 'bulan') ? incMonth : incWeek;
    const activeExp = (mode === 'bulan') ? expMonth : expWeek;
    const activeTotalOut = (mode === 'bulan') ? totalOutMonth : totalOutWeek;

    incomeTableHtml = `
      <table class="bulletin-table">
        <thead>
          <tr style="background:#f8fafc; font-size:11px; text-transform:uppercase;">
            <th style="text-align:left; color:#475569;">Pos Penerimaan</th>
            <th style="text-align:right; color:#059669;">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="color:#334155;">Persembahan Jemaat</td>
            <td style="text-align:right; font-weight:700; color:#0f172a;">${fmt(activeInc.churchBudget)}</td>
          </tr>
          <tr>
            <td style="color:#334155;">Dana Pembangunan</td>
            <td style="text-align:right; font-weight:700; color:#0f172a;">${fmt(activeInc.building)}</td>
          </tr>
          <tr>
            <td style="color:#334155;">Pos Lain &amp; Departemen</td>
            <td style="text-align:right; font-weight:700; color:#0f172a;">${fmt(activeInc.otherIn)}</td>
          </tr>
          <tr style="background: #eff6ff; font-weight:700; font-size:10px; border-top:1px dashed #bfdbfe;">
            <td style="color:#1d4ed8;">&bull; Subtotal Kas Jemaat &amp; Bangun</td>
            <td style="text-align:right; color:#1d4ed8;">+${fmt(activeInc.incBersih)}</td>
          </tr>
          <tr>
            <td style="color:#64748b;">Persepuluhan (Tithe / Kas Daerah)</td>
            <td style="text-align:right; font-weight:700; color:#7e22ce;">${fmt(activeInc.tithe)}</td>
          </tr>
          <tr style="border-top: 2px solid #cbd5e1; background: #f8fafc;">
            <td style="font-weight:800; color:#0f172a;">TOTAL PENERIMAAN</td>
            <td style="text-align:right; font-weight:900; color:#059669; font-size:13px;">+${fmt(activeInc.totalIn)}</td>
          </tr>
        </tbody>
      </table>
    `;

    const expRows = Object.keys(activeExp.expByDept).length > 0
      ? Object.entries(activeExp.expByDept).map(([dept, val]) => `
        <tr>
          <td style="color:#334155;">&bull; ${dept}</td>
          <td style="text-align:right; font-weight:700; color:#dc2626;">-${fmt(val)}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="2" style="text-align:center; color:#94a3b8; padding:8px;">Belum ada pengeluaran dicatat.</td></tr>';

    expenseTableHtml = `
      <table class="bulletin-table">
        <thead>
          <tr style="background:#f8fafc; font-size:11px; text-transform:uppercase;">
            <th style="text-align:left; color:#475569;">Departemen / Keperluan</th>
            <th style="text-align:right; color:#dc2626;">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          ${expRows}
          <tr style="background: #fffbeb; font-weight:700; font-size:10px; border-top:1px dashed #fde68a;">
            <td style="color:#b45309;">&bull; Subtotal Beban Jemaat &amp; Bangun</td>
            <td style="text-align:right; color:#b45309;">-${fmt(activeExp.outBersih)}</td>
          </tr>
          <tr style="background: #faf5ff; font-weight:700; font-size:10px;">
            <td style="color:#7e22ce;">&bull; Subtotal Setoran Kas Daerah</td>
            <td style="text-align:right; color:#7e22ce;">-${fmt(activeExp.outDaerah)}</td>
          </tr>
          <tr style="border-top: 2px solid #cbd5e1; background: #f8fafc;">
            <td style="font-weight:800; color:#0f172a;">TOTAL PENGELUARAN</td>
            <td style="text-align:right; font-weight:900; color:#dc2626; font-size:13px;">-${fmt(activeTotalOut)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  const activeStartBal = (mode === 'bulan') ? startBalancesMonth : startBalancesWeek;
  const reconcileInc = (mode === 'bulan') ? incMonth : incWeek;
  const reconcileExp = (mode === 'bulan') ? expMonth : expWeek;

  const includeSig = document.getElementById('bulletinIncludeSignatures') ? document.getElementById('bulletinIncludeSignatures').checked : true;

  const nameBen = systemConfig.sig_name_bendahara || 'Herbert JS Sagala';
  const titleBen = systemConfig.sig_title_bendahara || 'Bendahara Jemaat';
  const nameKet = systemConfig.sig_name_ketua || 'Yosep Santoso';
  const titleKet = systemConfig.sig_title_ketua || 'Ketua Jemaat';
  const namePen = systemConfig.sig_name_pendeta || 'Pdt. Joseph Sitohang';
  const titlePen = systemConfig.sig_title_pendeta || 'Gembala Jemaat';

  const stampUrl = systemConfig.sig_stempel || './stamp.png';
  const sigBenUrl = systemConfig.sig_bendahara;
  const sigKetUrl = systemConfig.sig_ketua;
  const sigPenUrl = systemConfig.sig_pendeta;

  const benSigBlock = (includeSig && sigBenUrl)
    ? `<div style="height:48px; display:flex; align-items:center; justify-content:center; margin: 1px auto;"><img src="${sigBenUrl}" style="max-height:44px; max-width:110px; object-fit:contain;"></div>`
    : `<div style="height:48px;"></div>`;

  const ketSigBlock = includeSig
    ? `<div style="position:relative; height:48px; width:110px; margin: 1px auto; display:flex; align-items:center; justify-content:center;">
        <img src="${stampUrl}" style="position:absolute; top:50%; left:12px; transform:translate(-50%, -50%) rotate(-6deg); height:68px; width:68px; opacity:0.85; z-index:5; pointer-events:none;">
        ${sigKetUrl ? `<img src="${sigKetUrl}" style="max-height:44px; max-width:110px; object-fit:contain; position:relative; z-index:10;">` : ''}
       </div>`
    : `<div style="height:48px;"></div>`;

  const penSigBlock = (includeSig && sigPenUrl)
    ? `<div style="height:48px; display:flex; align-items:center; justify-content:center; margin: 1px auto;"><img src="${sigPenUrl}" style="max-height:44px; max-width:110px; object-fit:contain;"></div>`
    : `<div style="height:48px;"></div>`;

  container.innerHTML = `
    <div style="border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 10px; display:flex; justify-content:space-between; align-items:center;">
      <div style="display:flex; align-items:center; gap: 10px;">
        <img src="./icons/PisgahColor.png" alt="Logo" style="width: 38px; height: 38px; object-fit: contain;">
        <div>
          <h2 class="bulletin-header-title">GMAHK JEMAAT PISGAH</h2>
          <div class="bulletin-header-sub">WARTA &amp; BULETIN KEUANGAN JEMAAT</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size: 12.5px; font-weight: 800; color: #1e3a8a;">${titleHeader}</div>
        <div style="font-size: 10.5px; color: #64748b; margin-top: 1px;">${subtitleHeader}</div>
      </div>
    </div>

    <!-- 1. SALDO AWAL (HISTORIS SEBELUM MUTASI) -->
    <div class="bulletin-section-heading" style="margin-top: 0; margin-bottom: 4px;">
      <span>1. SALDO AWAL KAS (HISTORIS AWAL PERIODE)</span>
      <span style="font-size: 9.5px; color:#475569; font-weight:800;">POSISI SEBELUM MUTASI</span>
    </div>
    ${saldoAwalHtml}

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 14px;">
      <div>
        <div class="bulletin-section-heading" style="margin-top: 4px; margin-bottom: 3px;">
          <span>2. PENERIMAAN KAS</span>
          <span style="font-size: 9.5px; color:#10b981;">MASUK</span>
        </div>
        ${incomeTableHtml}
      </div>

      <div>
        <div class="bulletin-section-heading" style="margin-top: 4px; margin-bottom: 3px;">
          <span>3. PENGELUARAN KAS</span>
          <span style="font-size: 9.5px; color:#ef4444;">KELUAR</span>
        </div>
        ${expenseTableHtml}
      </div>
    </div>

    <!-- 4. SALDO AKHIR KAS BERSIH JEMAAT -->
    <div class="bulletin-section-heading" style="margin-top: 8px; margin-bottom: 4px;">
      <span>4. SALDO AKHIR KAS BERSIH JEMAAT (OPERASIONAL &amp; PEMBANGUNAN)</span>
      <span style="font-size: 9.5px; color:#2563eb; font-weight:800;">MILIK JEMAAT LOKAL</span>
    </div>
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 6px;">
      <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 6px 6px; text-align:center;">
        <div style="font-size: 9.5px; font-weight: 800; color: #b45309; text-transform: uppercase;">Kas Jemaat (Operasional)</div>
        <div style="font-size: 14px; font-weight: 900; color: #92400e; margin-top: 2px;">${fmt(netBalances.calcJemaat)}</div>
        <div style="font-size: 8.5px; color: #78350f; margin-top: 3px; padding-top: 2px; border-top: 1px dashed #fde68a; display:flex; justify-content:space-around;">
          <span>Tunai: <strong>${fmt(netBalances.tanganJemaat)}</strong></span>
          <span>Bank: <strong>${fmt(netBalances.bankJemaat)}</strong></span>
        </div>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px 6px; text-align:center;">
        <div style="font-size: 9.5px; font-weight: 800; color: #15803d; text-transform: uppercase;">Total Pembangunan</div>
        <div style="font-size: 14px; font-weight: 900; color: #166534; margin-top: 2px;">${fmt(netBalances.calcBangun)}</div>
        <div style="font-size: 8.5px; color: #14532d; margin-top: 3px; padding-top: 2px; border-top: 1px dashed #bbf7d0; display:flex; justify-content:space-around;">
          <span>Tunai: <strong>${fmt(netBalances.tanganBangun)}</strong></span>
          <span>Bank: <strong>${fmt(netBalances.bankBangun)}</strong></span>
        </div>
      </div>
      <div style="background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 6px; padding: 6px 6px; text-align:center;">
        <div style="font-size: 9.5px; font-weight: 900; color: #1d4ed8; text-transform: uppercase;">⭐ Total Kas Bersih Jemaat</div>
        <div style="font-size: 14.5px; font-weight: 900; color: #1e3a8a; margin-top: 2px;">${fmt(netBalances.saldoBersih)}</div>
        <div style="font-size: 8.5px; color: #1e40af; margin-top: 3px; padding-top: 2px; border-top: 1px dashed #bfdbfe; display:flex; justify-content:space-around;">
          <span>Tunai: <strong>${fmt(netBalances.tanganBersih)}</strong></span>
          <span>Bank: <strong>${fmt(netBalances.bankBersih)}</strong></span>
        </div>
      </div>
    </div>

    <!-- REKONSILIASI KAS BERSIH -->
    ${mode === 'kombinasi' ? `
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 5px 8px; margin-bottom: 5px; font-size: 9px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2px; flex-wrap:wrap; gap:4px;">
          <span style="color: #0369a1;">
            <strong>📐 Mutasi Sabat Ini:</strong> Saldo Awal Pekan (${fmt(startBalancesWeek.saldoBersih)}) + Masuk (+${fmt(incWeek.incBersih)}) - Keluar (-${fmt(expWeek.outBersih)})
          </span>
          <span style="font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 1px 6px; border-radius: 3px;">
            = Saldo Akhir: <strong>${fmt(netBalances.saldoBersih)}</strong> &bull; ✓ SEIMBANG
          </span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px dashed #bae6fd; padding-top: 2px; flex-wrap:wrap; gap:4px;">
          <span style="color: #0369a1;">
            <strong>📐 Akumulasi Bulan Ini:</strong> Saldo Awal Bulan (${fmt(startBalancesMonth.saldoBersih)}) + Masuk (+${fmt(incMonth.incBersih)}) - Keluar (-${fmt(expMonth.outBersih)})
          </span>
          <span style="font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 1px 6px; border-radius: 3px;">
            = Saldo Akhir: <strong>${fmt(netBalances.saldoBersih)}</strong> &bull; ✓ SEIMBANG
          </span>
        </div>
      </div>
    ` : `
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 5px 8px; margin-bottom: 5px; font-size: 9px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
        <span style="color: #0369a1;">
          <strong>📐 Rekonsiliasi Kas Bersih Jemaat:</strong> Saldo Awal (${fmt(activeStartBal.saldoBersih)}) + Masuk Jemaat &amp; Bangun (+${fmt(reconcileInc.incBersih)}) - Keluar Jemaat &amp; Bangun (-${fmt(reconcileExp.outBersih)})
        </span>
        <span style="font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 1px 6px; border-radius: 3px;">
          = Saldo Akhir (${fmt(netBalances.saldoBersih)}) &bull; ✓ SEIMBANG
        </span>
      </div>
    `}

    <!-- 5. TOTAL SALDO KAS GEREJA (SEMUA KAS + DAERAH) -->
    <div class="bulletin-section-heading" style="margin-top: 5px; margin-bottom: 3px;">
      <span>5. TOTAL SALDO KAS (SEMUA KAS + DAERAH)</span>
      <span style="font-size: 9.5px; color:#16a34a; font-weight:800;">TOTAL SALDO KAS GEREJA</span>
    </div>

    <!-- BANNER FORMULA NO 5 SESUAI PERMINTAAN USER -->
    <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 6px; padding: 6px 10px; margin-bottom: 5px;">
      <div style="display:flex; justify-content:space-between; align-items:center; background: #ffffff; border: 1.5px solid #22c55e; border-radius: 5px; padding: 4px 10px; margin-bottom: 4px;">
        <span style="font-size: 10px; font-weight: 900; color: #14532d; text-transform:uppercase;">
          🏛️ Saldo Akhir Total Kas Gereja (Termasuk Kas Daerah) :
        </span>
        <span style="font-size: 15px; font-weight: 900; color: #15803d;">
          ${fmt(netBalances.totalGabungan)}
        </span>
      </div>

      <!-- FORMULA REKONSILIASI TOTAL KAS GEREJA -->
      ${mode === 'kombinasi' ? `
        <div style="font-size: 9px; background: #dcfce7; border-radius: 4px; padding: 4px 8px; margin-bottom: 4px; color: #14532d;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px; flex-wrap:wrap; gap:4px;">
            <span><strong>Mutasi Sabat Ini:</strong> Saldo Awal Pekan (${fmt(startBalancesWeek.totalGabungan)}) + Total Masuk (+${fmt(incWeek.totalIn)}) - Total Keluar (-${fmt(expWeek.totalOut)})</span>
            <span style="font-weight: 800;">= Saldo Akhir: <strong>${fmt(netBalances.totalGabungan)}</strong> ✓</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #86efac; padding-top:2px; flex-wrap:wrap; gap:4px;">
            <span><strong>Akumulasi Bulan Ini:</strong> Saldo Awal Bulan (${fmt(startBalancesMonth.totalGabungan)}) + Total Masuk (+${fmt(incMonth.totalIn)}) - Total Keluar (-${fmt(expMonth.totalOut)})</span>
            <span style="font-weight: 800;">= Saldo Akhir: <strong>${fmt(netBalances.totalGabungan)}</strong> ✓</span>
          </div>
        </div>
      ` : `
        <div style="font-size: 9px; background: #dcfce7; border-radius: 4px; padding: 3px 8px; margin-bottom: 4px; color: #14532d; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
          <span><strong>📐 Rekonsiliasi Total Kas Gereja:</strong> Saldo Awal (${fmt(activeStartBal.totalGabungan)}) + Total Masuk (+${fmt(reconcileInc.totalIn)}) - Total Keluar (-${fmt(reconcileExp.totalOut)})</span>
          <span style="font-weight: 800;">= Saldo Akhir: <strong>${fmt(netBalances.totalGabungan)}</strong> ✓</span>
        </div>
      `}

      <!-- RINCIAN GABUNGAN: KOMPOSISI DANA & SALDO FISIK -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9px;">
        <div style="background: #ffffff; border: 1px solid #bbf7d0; border-radius: 5px; padding: 4px 8px;">
          <div style="font-weight: 800; color: #166534; margin-bottom: 2px; text-transform:uppercase; font-size:8.5px; border-bottom:1px solid #dcfce7; padding-bottom:1px;">
            📊 Komposisi Saldo Kas Gereja:
          </div>
          <div style="display:flex; justify-content:space-between; color:#1e40af; margin-bottom:1px;">
            <span>• Kas Bersih Jemaat (Operasional &amp; Bangun):</span>
            <strong>${fmt(netBalances.saldoBersih)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; color:#7e22ce;">
            <span>• Kas Daerah (Titipan Persepuluhan):</span>
            <strong>${fmt(netBalances.calcDaerah)}</strong>
          </div>
        </div>
        <div style="background: #ffffff; border: 1px solid #bbf7d0; border-radius: 5px; padding: 4px 8px;">
          <div style="font-weight: 800; color: #166534; margin-bottom: 2px; text-transform:uppercase; font-size:8.5px; border-bottom:1px solid #dcfce7; padding-bottom:1px;">
            🏦 Posisi Fisik Penyimpanan Kas:
          </div>
          <div style="display:flex; justify-content:space-between; color:#334155; margin-bottom:1px;">
            <span>• Kas Tunai di Kasir / Bendahara:</span>
            <strong>${fmt(netBalances.totalTangan)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; color:#334155;">
            <span>• Saldo di Rekening Bank Gereja:</span>
            <strong>${fmt(netBalances.totalBank)}</strong>
          </div>
        </div>
      </div>

      <div style="font-size: 8px; color: #475569; font-style: italic; margin-top: 3px; border-top: 1px dashed #bbf7d0; padding-top: 2px;">
        *Catatan: Selisih antara Total Kas Gereja (${fmt(netBalances.totalGabungan)}) dengan Kas Bersih Jemaat (${fmt(netBalances.saldoBersih)}) adalah pos <strong>Kas Daerah (${fmt(netBalances.calcDaerah)})</strong> yang merupakan titipan Persepuluhan, dipisahkan dari dana operasional jemaat lokal.
      </div>
    </div>

    <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 4px 8px; font-size: 8.5px; color: #92400e; font-style: italic; text-align:center; margin-bottom: 5px; line-height: 1.25;">
      &ldquo;Bawalah seluruh persembahan persepuluhan itu ke dalam rumah perbendaharaan, supaya ada persediaan makanan di rumah-Ku dan ujilah Aku, firman TUHAN semesta alam, apakah Aku tidak membukakan bagimu tingkap-tingkap langit dan mencurahkan berkat kepadamu sampai berkelimpahan.&rdquo; &mdash; <strong>Maleakhi 3:10</strong>
    </div>

    <!-- TANDA TANGAN RESMI PENGURUS GEREJA -->
    <div style="margin-top: 4px; padding-top: 3px; border-top: 1px dashed #cbd5e1; page-break-inside: avoid;">
      <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 9px; border: none; background: transparent;">
        <tbody>
          <tr>
            <td style="width: 33.3%; border: none; vertical-align: top; color: #475569; padding-bottom: 0px;">
              <div>Disiapkan oleh:</div>
              <div style="font-weight: 800; color: #0f172a; margin-top: 1px;">${titleBen.toUpperCase()}</div>
            </td>
            <td style="width: 33.3%; border: none; vertical-align: top; color: #475569; padding-bottom: 0px;">
              <div>Disahkan oleh:</div>
              <div style="font-weight: 800; color: #0f172a; margin-top: 1px;">${titleKet.toUpperCase()}</div>
            </td>
            <td style="width: 33.3%; border: none; vertical-align: top; color: #475569; padding-bottom: 0px;">
              <div>Mengetahui:</div>
              <div style="font-weight: 800; color: #0f172a; margin-top: 1px;">${titlePen.toUpperCase()}</div>
            </td>
          </tr>
          <tr>
            <td style="border: none; vertical-align: middle; padding: 0;">${benSigBlock}</td>
            <td style="border: none; vertical-align: middle; padding: 0;">${ketSigBlock}</td>
            <td style="border: none; vertical-align: middle; padding: 0;">${penSigBlock}</td>
          </tr>
          <tr>
            <td style="border: none; vertical-align: bottom; padding-top: 0px;">
              <div style="font-weight: 800; text-decoration: underline; color: #0f172a; font-size: 10px;">${nameBen}</div>
              <div style="font-size: 8px; color: #64748b; margin-top: 1px;">GMAHK Jemaat Pisgah</div>
            </td>
            <td style="border: none; vertical-align: bottom; padding-top: 0px;">
              <div style="font-weight: 800; text-decoration: underline; color: #0f172a; font-size: 10px;">${nameKet}</div>
              <div style="font-size: 8px; color: #64748b; margin-top: 1px;">GMAHK Jemaat Pisgah</div>
            </td>
            <td style="border: none; vertical-align: bottom; padding-top: 0px;">
              <div style="font-weight: 800; text-decoration: underline; color: #0f172a; font-size: 10px;">${namePen}</div>
              <div style="font-size: 8px; color: #64748b; margin-top: 1px;">GMAHK Jemaat Pisgah</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

export function printSabbathBulletin() {
  const container = document.getElementById('bulletinPaperPreview');
  if (!container || !container.innerHTML) return notify('Buletin belum selesai dimuat.', 'error');

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Buletin Keuangan Sabat - GMAHK Pisgah</title>
        <style>
          @page { 
            size: A4 portrait; 
            margin: 8mm 12mm; 
          }
          * { 
            box-sizing: border-box !important; 
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            color: #0f172a;
            background: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bulletin-sheet-print {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            padding: 0 4px !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
          td, th { padding: 2.5px 5px !important; }
          .bulletin-header-title { font-size: 15px !important; font-weight: 900; margin: 0; text-transform: uppercase; }
          .bulletin-header-sub { font-size: 8.5px !important; font-weight: 700; color: #64748b; margin: 1px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .bulletin-section-heading { font-size: 9.5px !important; font-weight: 800; color: #1e3a8a; text-transform: uppercase; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 2px !important; margin-top: 5px !important; margin-bottom: 3px !important; display: flex; justify-content: space-between; }
          @media print {
            html, body {
              width: 100% !important;
              max-width: 100% !important;
              height: 100% !important;
              overflow: hidden !important;
            }
            .bulletin-sheet-print {
              width: 100% !important;
              max-width: 100% !important;
              zoom: 0.92;
            }
          }
        </style>
      </head>
      <body onload="setTimeout(function(){ window.focus(); window.print(); }, 600)">
        <div class="bulletin-sheet-print">
          ${container.innerHTML}
        </div>
      </body>
    </html>
  `;

  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  setTimeout(() => {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
  }, 15000);
}

export function copySabbathBulletinWhatsApp() {
  const notify = window.notify || alert;
  if (!currentSabbathBulletinData) return notify('Data buletin belum siap.', 'error');

  const d = currentSabbathBulletinData;
  const b = d.netBalances;
  const bStartW = d.startBalancesWeek || {};
  const bStartM = d.startBalancesMonth || {};
  const inW = d.incWeek || {};
  const inM = d.incMonth || {};
  const outW = d.expWeek || { totalOut: d.totalOutWeek, outBersih: d.totalOutWeek, outDaerah: 0 };
  const outM = d.expMonth || { totalOut: d.totalOutMonth, outBersih: d.totalOutMonth, outDaerah: 0 };

  const nameBen = systemConfig.sig_name_bendahara || 'Herbert JS Sagala';
  const nameKet = systemConfig.sig_name_ketua || 'Yosep Santoso';
  const namePen = systemConfig.sig_name_pendeta || 'Pdt. Joseph Sitohang';

  const formatExpDept = (obj) => {
    if (!obj || Object.keys(obj).length === 0) return '  - (Tidak ada pengeluaran dicatat)';
    return Object.entries(obj)
      .map(([k, v]) => `  - ${k} : -Rp ${fmt(v)}`)
      .join('\n');
  };

  let waText = '';

  if (d.mode === 'kombinasi') {
    const expWeekDeptText = formatExpDept(d.expByDeptWeek);
    const expMonthDeptText = formatExpDept(d.expByDeptMonth);

    waText = `🕊️ *WARTA KEUANGAN SABAT*
*GMAHK JEMAAT PISGAH*
📅 *${d.cutOffDateLabel}*
_${d.subtitleHeader}_
══════════════════════════

🏛️ *POSISI SALDO AKHIR KAS (Per ${d.cutOffDateLabel})*
──────────────────────────
⭐ *KAS BERSIH JEMAAT LOKAL:*
• Kas Operasional : Rp ${fmt(b.calcJemaat)}
• Dana Pembangunan : Rp ${fmt(b.calcBangun)}
👉 *Total Kas Bersih Jemaat : Rp ${fmt(b.saldoBersih)}*
   _(Fisik: Tunai Rp ${fmt(b.tanganBersih)} | Bank Rp ${fmt(b.bankBersih)})_

📜 *KAS DAERAH (TITIPAN TITHE):*
• Titipan Belum Disetor : Rp ${fmt(b.calcDaerah)}

──────────────────────────
🏛️ *TOTAL SALDO KAS GEREJA : Rp ${fmt(b.totalGabungan)}*
   _(Termasuk Kas Jemaat & Titipan Daerah)_
   _(Fisik: Tunai Rp ${fmt(b.totalTangan)} | Bank Rp ${fmt(b.totalBank)})_
══════════════════════════

📊 *REKONSILIASI & ARUS KAS:*

🔹 *1. MUTASI SABAT INI (${d.cutOffDateLabel}):*
• Saldo Awal Pekan : Rp ${fmt(bStartW.totalGabungan)}
• Penerimaan Sabat Ini : +Rp ${fmt(inW.totalIn)}
  - Persembahan Jemaat : Rp ${fmt(inW.churchBudget)}
  - Pembangunan : Rp ${fmt(inW.building)}
  - Pos Lain/Dept : Rp ${fmt(inW.otherIn)}
  - Persepuluhan (Tithe) : Rp ${fmt(inW.tithe)}
• Pengeluaran Sabat Ini : -Rp ${fmt(outW.totalOut)}
${expWeekDeptText}
  *(Beban Jemaat: -Rp ${fmt(outW.outBersih)} | Setoran Daerah: -Rp ${fmt(outW.outDaerah)})*
👉 *Saldo Akhir Total Kas : Rp ${fmt(b.totalGabungan)}* ✓
   *(Rumus: ${fmt(bStartW.totalGabungan)} + ${fmt(inW.totalIn)} - ${fmt(outW.totalOut)} = ${fmt(b.totalGabungan)})*

🔹 *2. AKUMULASI BULAN INI:*
• Saldo Awal Bulan : Rp ${fmt(bStartM.totalGabungan)}
• Total Masuk Bulan Ini : +Rp ${fmt(inM.totalIn)}
  - Persembahan Jemaat : Rp ${fmt(inM.churchBudget)}
  - Pembangunan : Rp ${fmt(inM.building)}
  - Pos Lain/Dept : Rp ${fmt(inM.otherIn)}
  - Persepuluhan (Tithe) : Rp ${fmt(inM.tithe)}
• Total Keluar Bulan Ini : -Rp ${fmt(outM.totalOut)}
${expMonthDeptText}
  *(Beban Jemaat: -Rp ${fmt(outM.outBersih)} | Setoran Daerah: -Rp ${fmt(outM.outDaerah)})*
👉 *Saldo Akhir Total Kas : Rp ${fmt(b.totalGabungan)}* ✓
   *(Rumus: ${fmt(bStartM.totalGabungan)} + ${fmt(inM.totalIn)} - ${fmt(outM.totalOut)} = ${fmt(b.totalGabungan)})*

──────────────────────────
📐 *Ringkasan Kas Bersih Jemaat (Operasional & Bangun):*
• Sabat Ini : ${fmt(bStartW.saldoBersih)} + ${fmt(inW.incBersih)} - ${fmt(outW.outBersih)} = *Rp ${fmt(b.saldoBersih)}* ✓
• Bulan Ini : ${fmt(bStartM.saldoBersih)} + ${fmt(inM.incBersih)} - ${fmt(outM.outBersih)} = *Rp ${fmt(b.saldoBersih)}* ✓
══════════════════════════

📖 _"Bawalah seluruh persembahan persepuluhan itu ke dalam rumah perbendaharaan, supaya ada persediaan makanan di rumah-Ku..."_ (Maleakhi 3:10)

✍️ *PENGURUS JEMAAT:*
• *Bendahara Jemaat :* ${nameBen}
• *Ketua Jemaat :* ${nameKet}
• *Gembala Jemaat :* ${namePen}

_Tuhan Memberkati Pelayanan & Persembahan Kita Bersama._
*Perbendaharaan GMAHK Jemaat Pisgah*`;
  } else if (d.mode === 'bulan') {
    const expMonthDeptText = formatExpDept(d.expByDeptMonth);

    waText = `🕊️ *LAPORAN KEUANGAN BULANAN*
*GMAHK JEMAAT PISGAH*
📅 *${d.titleHeader}*
_${d.subtitleHeader}_
══════════════════════════

🏛️ *POSISI SALDO AKHIR KAS (Per ${d.cutOffDateLabel})*
──────────────────────────
⭐ *KAS BERSIH JEMAAT LOKAL:*
• Kas Operasional : Rp ${fmt(b.calcJemaat)}
• Dana Pembangunan : Rp ${fmt(b.calcBangun)}
👉 *Total Kas Bersih Jemaat : Rp ${fmt(b.saldoBersih)}*
   _(Fisik: Tunai Rp ${fmt(b.tanganBersih)} | Bank Rp ${fmt(b.bankBersih)})_

📜 *KAS DAERAH (TITIPAN TITHE):*
• Titipan Belum Disetor : Rp ${fmt(b.calcDaerah)}

──────────────────────────
🏛️ *TOTAL SALDO KAS GEREJA : Rp ${fmt(b.totalGabungan)}*
   _(Termasuk Kas Jemaat & Titipan Daerah)_
   _(Fisik: Tunai Rp ${fmt(b.totalTangan)} | Bank Rp ${fmt(b.totalBank)})_
══════════════════════════

📊 *REKONSILIASI ARUS KAS BULAN INI:*
• Saldo Awal Bulan : Rp ${fmt(bStartM.totalGabungan)}
• Total Penerimaan : +Rp ${fmt(inM.totalIn)}
  - Persembahan Jemaat : Rp ${fmt(inM.churchBudget)}
  - Pembangunan : Rp ${fmt(inM.building)}
  - Pos Lain/Dept : Rp ${fmt(inM.otherIn)}
  - Persepuluhan (Tithe) : Rp ${fmt(inM.tithe)}
• Total Pengeluaran : -Rp ${fmt(outM.totalOut)}
${expMonthDeptText}
  *(Beban Jemaat: -Rp ${fmt(outM.outBersih)} | Setoran Daerah: -Rp ${fmt(outM.outDaerah)})*
👉 *Saldo Akhir Total Kas : Rp ${fmt(b.totalGabungan)}* ✓
   *(Rumus: ${fmt(bStartM.totalGabungan)} + ${fmt(inM.totalIn)} - ${fmt(outM.totalOut)} = ${fmt(b.totalGabungan)})*

──────────────────────────
📐 *Rekonsiliasi Kas Bersih Jemaat:*
Saldo Awal (${fmt(bStartM.saldoBersih)}) + Masuk Jemaat (+${fmt(inM.incBersih)}) - Beban Jemaat (-${fmt(outM.outBersih)}) = *Rp ${fmt(b.saldoBersih)}* ✓
══════════════════════════

📖 _"Bawalah seluruh persembahan persepuluhan itu ke dalam rumah perbendaharaan, supaya ada persediaan makanan di rumah-Ku..."_ (Maleakhi 3:10)

✍️ *PENGURUS JEMAAT:*
• *Bendahara Jemaat :* ${nameBen}
• *Ketua Jemaat :* ${nameKet}
• *Gembala Jemaat :* ${namePen}

_Tuhan Memberkati Pelayanan & Persembahan Kita Bersama._
*Perbendaharaan GMAHK Jemaat Pisgah*`;
  } else {
    // Mode sabat tunggal
    const expWeekDeptText = formatExpDept(d.expByDeptWeek);

    waText = `🕊️ *WARTA KEUANGAN SABAT*
*GMAHK JEMAAT PISGAH*
📅 *${d.cutOffDateLabel}*
══════════════════════════

🏛️ *POSISI SALDO AKHIR KAS (Per ${d.cutOffDateLabel})*
──────────────────────────
⭐ *KAS BERSIH JEMAAT LOKAL:*
• Kas Operasional : Rp ${fmt(b.calcJemaat)}
• Dana Pembangunan : Rp ${fmt(b.calcBangun)}
👉 *Total Kas Bersih Jemaat : Rp ${fmt(b.saldoBersih)}*
   _(Fisik: Tunai Rp ${fmt(b.tanganBersih)} | Bank Rp ${fmt(b.bankBersih)})_

📜 *KAS DAERAH (TITIPAN TITHE):*
• Titipan Belum Disetor : Rp ${fmt(b.calcDaerah)}

──────────────────────────
🏛️ *TOTAL SALDO KAS GEREJA : Rp ${fmt(b.totalGabungan)}*
   _(Termasuk Kas Jemaat & Titipan Daerah)_
   _(Fisik: Tunai Rp ${fmt(b.totalTangan)} | Bank Rp ${fmt(b.totalBank)})_
══════════════════════════

📊 *REKONSILIASI ARUS KAS SABAT INI:*
• Saldo Awal Pekan : Rp ${fmt(bStartW.totalGabungan)}
• Penerimaan Sabat Ini : +Rp ${fmt(inW.totalIn)}
  - Persembahan Jemaat : Rp ${fmt(inW.churchBudget)}
  - Pembangunan : Rp ${fmt(inW.building)}
  - Pos Lain/Dept : Rp ${fmt(inW.otherIn)}
  - Persepuluhan (Tithe) : Rp ${fmt(inW.tithe)}
• Pengeluaran Sabat Ini : -Rp ${fmt(outW.totalOut)}
${expWeekDeptText}
  *(Beban Jemaat: -Rp ${fmt(outW.outBersih)} | Setoran Daerah: -Rp ${fmt(outW.outDaerah)})*
👉 *Saldo Akhir Total Kas : Rp ${fmt(b.totalGabungan)}* ✓
   *(Rumus: ${fmt(bStartW.totalGabungan)} + ${fmt(inW.totalIn)} - ${fmt(outW.totalOut)} = ${fmt(b.totalGabungan)})*

──────────────────────────
📐 *Rekonsiliasi Kas Bersih Jemaat:*
Saldo Awal (${fmt(bStartW.saldoBersih)}) + Masuk Jemaat (+${fmt(inW.incBersih)}) - Beban Jemaat (-${fmt(outW.outBersih)}) = *Rp ${fmt(b.saldoBersih)}* ✓
══════════════════════════

📖 _"Bawalah seluruh persembahan persepuluhan itu ke dalam rumah perbendaharaan, supaya ada persediaan makanan di rumah-Ku..."_ (Maleakhi 3:10)

✍️ *PENGURUS JEMAAT:*
• *Bendahara Jemaat :* ${nameBen}
• *Ketua Jemaat :* ${nameKet}
• *Gembala Jemaat :* ${namePen}

_Tuhan Memberkati Pelayanan & Persembahan Kita Bersama._
*Perbendaharaan GMAHK Jemaat Pisgah*`;
  }

  navigator.clipboard.writeText(waText).then(() => {
    notify('Teks Buletin Sabat berhasil disalin! Siap di-paste ke WhatsApp.', 'success');
  }).catch(err => {
    console.error(err);
    notify('Gagal menyalin teks otomatis. Silakan salin manual.', 'error');
  });
}

// Bind to window for HTML inline access
window.getRecentSabbaths = getRecentSabbaths;
window.calculateNetBalancesAsOf = calculateNetBalancesAsOf;
window.handleBulletinModeChange = handleBulletinModeChange;
window.openSabbathBulletinModal = openSabbathBulletinModal;
window.closeSabbathBulletinModal = closeSabbathBulletinModal;
window.renderSabbathBulletinPreview = renderSabbathBulletinPreview;
window.printSabbathBulletin = printSabbathBulletin;
window.copySabbathBulletinWhatsApp = copySabbathBulletinWhatsApp;
