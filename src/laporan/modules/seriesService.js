// ==========================================
// RECEIPT NUMBER SERIES & CONFIG MODULE
// ==========================================

const fmt = (n) => Math.round(n || 0).toLocaleString('id-ID');
const safeIcon = (name, size) => (typeof window.safeIcon === 'function' ? window.safeIcon(name, size) : (typeof getIcon === 'function' ? getIcon(name, size) : ''));
const hasRole = (user, targetRole) => {
  if (!user || !user.role) return false;
  if (typeof window.hasRole === 'function') return window.hasRole(user, targetRole);
  const roles = user.role.split(',').map(r => r.trim());
  return roles.includes(targetRole);
};
const getRolePerms = (roleStr) => (typeof window.getRolePerms === 'function' ? window.getRolePerms(roleStr) : {});
const notify = (msg, type) => (typeof window.notify === 'function' ? window.notify(msg, type) : alert(msg));
// --- No. Series Config & Auto Generate ---
export let currentSeriesTab = 'history';
export let currentSeriesFilterCat = 'all';
export let currentSeriesSearch = '';
export let cachedSeriesHistoryData = [];

export const SERIES_CATEGORY_META = [
  { id: 'Pemasukan', name: '1. Pemasukan Kas Jemaat', prefix: '', badge: 'badge-blue', icon: 'trendUp' },
  { id: 'PemasukanPembangunan', name: '2. Pemasukan Pembangunan', prefix: 'PEMB-', badge: 'badge-gold', icon: 'hammer' },
  { id: 'PengeluaranJemaat', name: '3. Pengeluaran Kas Jemaat', prefix: 'COST-', badge: 'badge-red', icon: 'trendDown' },
  { id: 'PengeluaranDaerah', name: '4. Pengeluaran Daerah', prefix: 'MBR-', badge: 'badge-purple', icon: 'building' },
  { id: 'PengeluaranPembangunan', name: '5. Pengeluaran Pembangunan', prefix: 'CP-', badge: 'badge-cyan', icon: 'church' },
  { id: 'Mutasi', name: '6. Mutasi / Pindah Buku', prefix: 'PB-', badge: 'badge-teal', icon: 'refresh' },
];

export function switchSeriesTab(tabName) {
  currentSeriesTab = tabName;
  const historyView = document.getElementById('seriesHistoryView');
  const configView = document.getElementById('seriesConfigView');
  const btnHistory = document.getElementById('tabSeriesHistoryBtn');
  const btnConfig = document.getElementById('tabSeriesConfigBtn');
  const btnEdit = document.getElementById('btnEditSeries');

  if (tabName === 'history') {
    if (historyView) historyView.style.display = 'block';
    if (configView) configView.style.display = 'none';
    if (btnHistory) btnHistory.classList.add('active');
    if (btnConfig) btnConfig.classList.remove('active');
    if (btnEdit) btnEdit.style.display = 'none';
    renderSeriesHistory();
  } else {
    if (historyView) historyView.style.display = 'none';
    if (configView) configView.style.display = 'block';
    if (btnHistory) btnHistory.classList.remove('active');
    if (btnConfig) btnConfig.classList.add('active');
    if (btnEdit) btnEdit.style.display = 'inline-flex';
  }
}

export function handleSeriesCardClick(catId) {
  if (currentSeriesFilterCat === catId) {
    currentSeriesFilterCat = 'all';
  } else {
    currentSeriesFilterCat = catId;
  }
  const select = document.getElementById('seriesHistoryFilterCat');
  if (select) select.value = currentSeriesFilterCat;
  handleSeriesHistoryFilter(currentSeriesFilterCat);
}

export function handleSeriesHistoryFilter(cat) {
  currentSeriesFilterCat = cat;
  document.querySelectorAll('.series-stat-card').forEach(card => {
    if (card.dataset.cat === cat) card.classList.add('active');
    else card.classList.remove('active');
  });
  renderSeriesHistoryTable();
}

export function handleSeriesHistorySearch(val) {
  currentSeriesSearch = (val || '').toLowerCase().trim();
  renderSeriesHistoryTable();
}

export function isTxInPeriod(tx, yearInt, monthInt) {
  if (tx.year && tx.month) {
    if (parseInt(tx.year) === yearInt && parseInt(tx.month) === monthInt) return true;
  }
  const dateStr = String(tx.date || '').trim();
  if (!dateStr) return false;
  const target1 = `${yearInt}-${String(monthInt).padStart(2, '0')}`;
  const target2 = `${yearInt}-${monthInt}`;
  if (dateStr.startsWith(target1) || dateStr.startsWith(target2)) return true;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    if (d.getFullYear() === yearInt && (d.getMonth() + 1) === monthInt) return true;
  }
  return false;
}

export function detectSeriesCat(tx, isInc) {
  const rNo = String(tx.receipt_no || '').trim().toUpperCase();
  const dept = String(tx.department || '').toLowerCase().trim();
  const incType = String(tx.income_type || '').toLowerCase().trim();
  const srcBal = String(tx.source_balance || '').toLowerCase().trim();

  // 1. Mutasi / Pindah Buku (prefix PB- or PB, or dept mutasi / setor bank / pindah buku)
  if (
    rNo.startsWith('PB-') ||
    rNo.startsWith('PB') ||
    dept === 'mutasi kas / setor bank' ||
    dept.includes('mutasi') ||
    dept.includes('setor bank') ||
    dept.includes('pindah buku')
  ) {
    return 'Mutasi';
  }

  // 2. Pemasukan
  if (isInc) {
    if (rNo.startsWith('PEMB-') || rNo.startsWith('PEMB') || incType.includes('pembangunan')) {
      return 'PemasukanPembangunan';
    }
    return 'Pemasukan';
  }

  // 3. Pengeluaran
  if (rNo.startsWith('CP-') || rNo.startsWith('CP') || srcBal.includes('pembangunan')) {
    return 'PengeluaranPembangunan';
  }
  if (rNo.startsWith('MBR-') || rNo.startsWith('MBR') || srcBal.includes('daerah')) {
    return 'PengeluaranDaerah';
  }
  return 'PengeluaranJemaat';
}

export async function renderSeriesHistory() {
  const monthSelect = document.getElementById('seriesMonth');
  const yearSelect = document.getElementById('seriesYear');
  if (!monthSelect || !yearSelect) return;

  const month = monthSelect.value;
  const year = yearSelect.value;
  const yearInt = parseInt(year);
  const monthInt = parseInt(month);
  const key = `${year}-${month.padStart(2, '0')}`;
  const yy = String(yearInt).slice(-2);
  const mm = String(monthInt).padStart(2, '0');
  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const periodLabel = `${monthNames[monthInt] || month} ${year}`;

  const formatCatNum = (cId, n) => {
    if (n === null || n === undefined) return '';
    if (cId === 'Mutasi') {
      return `PB-${yy}${mm}${String(n).padStart(2, '0')}`;
    }
    const m = SERIES_CATEGORY_META.find(x => x.id === cId);
    return `${m ? m.prefix : ''}${n}`;
  };

  const subtitleEl = document.getElementById('seriesHistorySubtitle');
  if (subtitleEl) subtitleEl.textContent = `Periode: ${periodLabel}`;

  if ((!window.cachedIncome || window.cachedIncome.length === 0) && (!window.cachedExpense || window.cachedExpense.length === 0)) {
    if (typeof window.loadAllTransactions === 'function') {
      await window.loadAllTransactions();
    }
  }

  const allInc = window.cachedIncome || [];
  const allExp = window.cachedExpense || [];

  const receiptMap = {};

  const processTx = (tx, isInc) => {
    if (!isTxInPeriod(tx, yearInt, monthInt)) return;
    const rNo = String(tx.receipt_no || '').trim();
    if (!rNo || rNo === '-' || rNo === 'SALDO_AWAL') return;

    const catId = detectSeriesCat(tx, isInc);

    if (catId === 'Mutasi') {
      // Mutasi / Pindah Buku: satu nomor bukti PB mewakili satu transaksi pemindahan kas ke bank.
      // Jangan pernah menjumlahkan kedua sisinya (masuk & keluar) menjadi 2x lipat atau dianggap kolektif!
      if (!receiptMap[rNo]) {
        let displayName = tx.nama_pemberi || tx.nama_penerima || tx.description || tx.uraian || tx.note || tx.department || 'Setoran Kas ke Bank';
        receiptMap[rNo] = {
          receipt_no: rNo,
          catId: 'Mutasi',
          date: tx.date,
          type: 'mutasi',
          name: displayName,
          amount: parseFloat(tx.amount || 0),
          itemsCount: 1,
          rawTx: tx
        };
      } else {
        // Jika sudah ada dari salah satu sisi (misal tercatat di income lalu ketemu di expense),
        // gunakan data expense yang memiliki source_balance dan note lebih lengkap tanpa menambah amount / itemsCount
        if (!isInc && tx.source_balance) {
          receiptMap[rNo].rawTx = tx;
        }
      }
      return;
    }

    const mapKey = (isInc ? 'INC_' : 'EXP_') + rNo;

    if (!receiptMap[mapKey]) {
      receiptMap[mapKey] = {
        receipt_no: rNo,
        catId: catId,
        date: tx.date,
        type: isInc ? 'income' : 'expense',
        name: isInc ? (tx.nama || tx.nama_pemberi || tx.name || 'Jemaat') : (tx.description || tx.uraian || tx.note || tx.department || 'Pengeluaran Kas'),
        amount: 0,
        itemsCount: 0,
        rawTx: tx
      };
    }
    receiptMap[mapKey].amount += parseFloat(tx.amount || 0);
    receiptMap[mapKey].itemsCount += 1;
  };

  allInc.forEach(tx => processTx(tx, true));
  allExp.forEach(tx => processTx(tx, false));

  const allReceipts = Object.values(receiptMap);

  const systemConfig = window.systemConfig || {};
  if (typeof systemConfig.receipt_series === 'string') {
    try { systemConfig.receipt_series = JSON.parse(systemConfig.receipt_series); } catch (e) { systemConfig.receipt_series = {}; }
  }
  const seriesCfg = (systemConfig.receipt_series && systemConfig.receipt_series[key]) || {};

  const catStats = {};
  SERIES_CATEGORY_META.forEach(meta => {
    const catId = meta.id;
    const prefix = meta.prefix;
    const cfg = seriesCfg[catId] || {};
    const catReceipts = allReceipts.filter(r => r.catId === catId);

    const numList = [];
    catReceipts.forEach(r => {
      let rStr = String(r.receipt_no || '').trim().toUpperCase();
      let num = -1;

      if (catId === 'Mutasi') {
        const targetPrefix = `PB-${yy}${mm}`;
        if (rStr.startsWith(targetPrefix)) {
          const part = rStr.substring(targetPrefix.length).replace(/\D/g, '');
          if (part) num = parseInt(part);
        } else if (rStr.startsWith('PB-') || rStr.startsWith('PB')) {
          const digits = rStr.replace(/\D/g, '');
          if (digits.length >= 6 && digits.startsWith(`${yy}${mm}`)) {
            num = parseInt(digits.substring(4));
          } else if (digits.length > 0 && digits.length <= 4) {
            num = parseInt(digits);
          }
        }
      } else if (!prefix) {
        const digits = rStr.replace(/\D/g, '');
        if (digits) num = parseInt(digits);
      } else {
        const uPrefix = prefix.toUpperCase();
        if (rStr.startsWith(uPrefix)) {
          const part = rStr.substring(uPrefix.length).trim();
          const digits = part.replace(/\D/g, '');
          if (digits) num = parseInt(digits);
        } else {
          const digits = rStr.replace(/^[A-Z\s\-_/]+/, '').replace(/\D/g, '');
          if (digits) num = parseInt(digits);
        }
      }
      if (num !== -1) {
        r._num = num;
        if (!numList.includes(num)) numList.push(num);
      } else {
        r._num = 0;
      }
    });

    numList.sort((a, b) => a - b);
    const minNum = numList.length > 0 ? numList[0] : null;
    const maxNum = numList.length > 0 ? numList[numList.length - 1] : null;

    const usedSet = new Set(numList);
    const gaps = [];
    if (minNum !== null && maxNum !== null) {
      for (let n = minNum; n <= maxNum; n++) {
        if (!usedSet.has(n)) {
          gaps.push(n);
        }
      }
    }

    catStats[catId] = {
      meta,
      cfg,
      receipts: catReceipts,
      numList,
      minNum,
      maxNum,
      gaps,
      totalCount: catReceipts.length,
      distinctCount: numList.length,
      totalAmount: catReceipts.reduce((acc, r) => acc + r.amount, 0)
    };

    const lastEl = document.getElementById(`series_${catId}_last`);
    if (lastEl) {
      if (numList.length === 0) {
        lastEl.innerHTML = `No. Terpakai Bulan Ini: <strong style="color:var(--text3)">Belum ada</strong>`;
      } else {
        const usedStr = numList.map(n => formatCatNum(catId, n)).join(', ');
        const gapInfo = gaps.length > 0 ? `<div style="color:var(--red-pop); font-size:11.5px; margin-top:4px; font-weight:600;">⚠️ Ada ${gaps.length} nomor terlewat: ${gaps.map(g => formatCatNum(catId, g)).join(', ')}</div>` : '';
        lastEl.innerHTML = `
          <div>No. Terpakai Bulan Ini: <strong style="color:var(--primary); font-weight:700;">${formatCatNum(catId, minNum)}</strong> s/d <strong style="color:var(--primary); font-weight:700;">${formatCatNum(catId, maxNum)}</strong> (${numList.length} nomor)</div>
          <div style="color:var(--text3); font-size:11px; margin-top:4px; max-height:45px; overflow-y:auto; word-break:break-all;">${usedStr}</div>
          ${gapInfo}
        `;
      }
    }
  });

  cachedSeriesHistoryData = allReceipts;

  // Render Summary Cards
  const cardsContainer = document.getElementById('seriesSummaryCards');
  if (cardsContainer) {
    cardsContainer.innerHTML = SERIES_CATEGORY_META.map(meta => {
      const stat = catStats[meta.id];
      const prefix = meta.prefix;
      const isActive = currentSeriesFilterCat === meta.id;

      let rangeLabel = 'Belum diatur';
      if (stat.cfg.start || stat.cfg.end) {
        let s = stat.cfg.start || 1;
        let e = stat.cfg.end || '...';
        if (meta.id === 'Mutasi') {
          if (typeof s === 'number' && s >= 10000) s = s % 100;
          if (typeof e === 'number' && e >= 10000) e = e % 100;
          rangeLabel = `${formatCatNum('Mutasi', s)} &rarr; ${e === '...' ? '...' : formatCatNum('Mutasi', e)}`;
        } else {
          rangeLabel = `${prefix}${s} &rarr; ${prefix}${e}`;
        }
      }

      let issuedLabel = 'Belum ada kuitansi keluar';
      if (stat.numList.length > 0) {
        issuedLabel = `${formatCatNum(meta.id, stat.minNum)} &rarr; ${formatCatNum(meta.id, stat.maxNum)} (${stat.numList.length} No)`;
      }

      let statusBadge = `<span class="badge badge-gray" style="font-size:11px;">Belum Ada</span>`;
      if (stat.numList.length > 0) {
        if (stat.gaps.length === 0) {
          statusBadge = `<span class="badge badge-green" style="font-size:11px;">✓ Urut Lengkap (${stat.numList.length})</span>`;
        } else {
          statusBadge = `<span class="badge badge-amber" style="font-size:11px;" title="Terlewat: ${stat.gaps.map(g => formatCatNum(meta.id, g)).join(', ')}">⚠️ Loncat ${stat.gaps.length} No</span>`;
        }
      }

      return `
        <div class="series-stat-card ${isActive ? 'active' : ''}" data-cat="${meta.id}" onclick="handleSeriesCardClick('${meta.id}')">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <span class="badge ${meta.badge}" style="font-size:11px; padding:3px 8px;">
                ${meta.name}
              </span>
              ${statusBadge}
            </div>

            <div style="font-size:18px; font-weight:800; color:var(--text); margin-bottom:4px;">
              ${stat.numList.length} <span style="font-size:13px; font-weight:normal; color:var(--text3);">Kuitansi Terbit</span>
            </div>

            <div style="font-size:12px; color:var(--text2); display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span style="color:var(--text3);">No. Keluar:</span>
              <strong style="color:var(--primary); font-family:monospace;">${issuedLabel}</strong>
            </div>

            <div style="font-size:11.5px; color:var(--text3);">
              Rentang Diatur: <span style="font-family:monospace; color:var(--text2);">${rangeLabel}</span>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--glass-border); padding-top:10px; margin-top:12px; font-size:11.5px;">
            <span style="color:var(--text3);">Total Nominal:</span>
            <strong style="color:var(--text); font-size:12.5px;">Rp ${fmt(stat.totalAmount)}</strong>
          </div>
        </div>
      `;
    }).join('');
  }

  renderSeriesHistoryTable();
}

export function renderSeriesHistoryTable() {
  const tbody = document.getElementById('seriesHistoryTableBody');
  if (!tbody) return;

  let list = [...cachedSeriesHistoryData];

  if (currentSeriesFilterCat && currentSeriesFilterCat !== 'all') {
    list = list.filter(r => r.catId === currentSeriesFilterCat);
  }

  if (currentSeriesSearch) {
    list = list.filter(r =>
      r.receipt_no.toLowerCase().includes(currentSeriesSearch) ||
      (r.name || '').toLowerCase().includes(currentSeriesSearch) ||
      (r.date || '').toLowerCase().includes(currentSeriesSearch)
    );
  }

  list.sort((a, b) => {
    if (a.catId !== b.catId) return a.catId.localeCompare(b.catId);
    return (a._num || 0) - (b._num || 0);
  });

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:36px; color:var(--text3);">
          <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
            <span style="font-size:24px;">🧾</span>
            <div style="font-weight:600; font-size:14px; color:var(--text);">Tidak ada transaksi nomor seri kuitansi</div>
            <div style="font-size:12px; color:var(--text3);">Belum ada kuitansi yang keluar dengan kriteria yang dipilih pada periode ini.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(r => {
    const meta = SERIES_CATEGORY_META.find(m => m.id === r.catId) || { name: r.catId, badge: 'badge-gray' };
    const dateFormatted = fmtDate(r.date);
    const deleteId = r.rawTx ? (r.rawTx.transaction_id || r.rawTx.receipt_no || r.receipt_no) : r.receipt_no;
    const collectivePill = r.itemsCount > 1 ? `<span class="badge badge-gray" style="font-size:10px; margin-left:6px;">Kolektif (${r.itemsCount} item)</span>` : '';

    return `
      <tr>
        <td style="white-space:nowrap;">
          <span style="font-family:monospace; font-size:13px; font-weight:700; color:var(--primary); background:var(--badge-gray-bg); border:1px solid var(--glass-border); padding:3px 8px; border-radius:6px;">
            ${r.receipt_no}
          </span>
        </td>
        <td style="white-space:nowrap; font-size:12.5px; color:var(--text2);">${dateFormatted}</td>
        <td>
          <span class="badge ${meta.badge}" style="font-size:11px; padding:2px 7px;">${meta.name}</span>
        </td>
        <td>
          <div style="font-weight:600; font-size:13px; color:var(--text);">${r.name || '-'} ${collectivePill}</div>
        </td>
        <td style="text-align:right; font-weight:700; font-size:13px; color:var(--text); white-space:nowrap;">
          Rp ${fmt(r.amount)}
        </td>
        <td style="text-align:center; white-space:nowrap;">
          <button class="btn-icon-only" style="background:var(--input-bg); border:1px solid var(--glass-border);" title="Cetak / Lihat Kuitansi" onclick="printTransaction('${r.type}', '${deleteId}')">
            ${safeIcon('printer', 'lucide-sm')}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

export async function loadSeriesConfig() {
  const month = document.getElementById('seriesMonth').value;
  const year = document.getElementById('seriesYear').value;
  const key = `${year}-${month.padStart(2, '0')}`;

  const systemConfig = window.systemConfig || {};
  if (typeof systemConfig.receipt_series === 'string') {
    try { systemConfig.receipt_series = JSON.parse(systemConfig.receipt_series); } catch (e) { systemConfig.receipt_series = {}; }
  }
  if (!systemConfig.receipt_series) systemConfig.receipt_series = {};
  const config = systemConfig.receipt_series[key] || {};

  const cats = ['Pemasukan', 'PemasukanPembangunan', 'PengeluaranJemaat', 'PengeluaranDaerah', 'PengeluaranPembangunan', 'Mutasi'];
  cats.forEach(cat => {
    const sEl = document.getElementById(`series_${cat}_start`);
    const eEl = document.getElementById(`series_${cat}_end`);
    if (sEl) sEl.value = config[cat] ? config[cat].start : '';
    if (eEl) eEl.value = config[cat] ? config[cat].end : '';
  });

  await renderSeriesHistory();
}

export async function saveSeriesConfig() {
  const currentUser = window.currentUser || null;
  const perms = getRolePerms(currentUser?.role || '');
  if (!perms.menus.series?.edit && !hasRole(currentUser, 'Admin')) {
    return notify('Anda tidak memiliki izin mengubah pengaturan No. Series.', 'error');
  }
  const month = document.getElementById('seriesMonth').value;
  const year = document.getElementById('seriesYear').value;
  const key = `${year}-${month.padStart(2, '0')}`;

  const systemConfig = window.systemConfig || {};
  if (typeof systemConfig.receipt_series === 'string') {
    try { systemConfig.receipt_series = JSON.parse(systemConfig.receipt_series); } catch (e) { systemConfig.receipt_series = {}; }
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
  } catch (e) {
    if (window.notify) window.notify('Gagal menyimpan No. Series: ' + e.message, 'error');
    else alert('Gagal menyimpan No. Series: ' + e.message);
  }
  if (window.hideGlobalLoading) window.hideGlobalLoading();
}

export function getNextReceiptNumber(dateStr, typeCat, prefix) {
  if (!dateStr) return { err: 'Pilih tanggal terlebih dahulu' };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { err: 'Pilih tanggal yang valid' };
  const yearInt = d.getFullYear();
  const monthInt = d.getMonth() + 1;
  const key = `${yearInt}-${String(monthInt).padStart(2, '0')}`;
  const yy = String(yearInt).slice(-2);
  const mm = String(monthInt).padStart(2, '0');

  const systemConfig = window.systemConfig || {};
  if (typeof systemConfig.receipt_series === 'string') {
    try { systemConfig.receipt_series = JSON.parse(systemConfig.receipt_series); } catch (e) { systemConfig.receipt_series = {}; }
  }
  if (!systemConfig.receipt_series || !systemConfig.receipt_series[key] || !systemConfig.receipt_series[key][typeCat]) {
    return { err: `No. Series untuk ${typeCat} bulan ${key} belum diatur!` };
  }
  const config = systemConfig.receipt_series[key][typeCat];
  if (!config.start && config.start !== 0) return { err: `Nomor Mulai untuk ${typeCat} bulan ${key} belum diatur!` };

  let startNum = parseInt(config.start);
  let endNum = config.end ? parseInt(config.end) : null;
  if (typeCat === 'Mutasi') {
    if (startNum >= 10000) startNum = startNum % 100;
    if (endNum && endNum >= 10000) endNum = endNum % 100;
  }

  let allTx = [];
  if (typeCat.startsWith('Pemasukan')) allTx = window.cachedIncome || [];
  else if (typeCat === 'Mutasi') allTx = [...(window.cachedExpense || []), ...(window.cachedIncome || [])];
  else if (typeCat.startsWith('Pengeluaran')) allTx = window.cachedExpense || [];

  let maxNum = -1;

  allTx.forEach(tx => {
    if (!isTxInPeriod(tx, yearInt, monthInt)) return;

    const isInc = typeCat.startsWith('Pemasukan') || (typeCat === 'Mutasi' && window.cachedIncome && window.cachedIncome.includes(tx));
    const detected = detectSeriesCat(tx, isInc);
    if (detected !== typeCat) return;

    if (tx.receipt_no) {
      let rNumStr = String(tx.receipt_no).trim().toUpperCase();

      if (typeCat === 'Mutasi') {
        const targetPrefix = `PB-${yy}${mm}`;
        let seq = -1;
        if (rNumStr.startsWith(targetPrefix)) {
          const part = rNumStr.substring(targetPrefix.length).replace(/\D/g, '');
          if (part) seq = parseInt(part);
        } else if (rNumStr.startsWith('PB-') || rNumStr.startsWith('PB')) {
          const digits = rNumStr.replace(/\D/g, '');
          if (digits.length >= 6 && digits.startsWith(`${yy}${mm}`)) {
            seq = parseInt(digits.substring(4));
          } else if (digits.length > 0 && digits.length <= 4) {
            seq = parseInt(digits);
          }
        }
        if (seq !== -1) {
          if (seq > maxNum) maxNum = seq;
        }
      } else if (!prefix) {
        if (/^\d+$/.test(rNumStr)) {
          let num = parseInt(rNumStr);
          if (num > maxNum && num >= startNum && (endNum ? num <= endNum : true)) maxNum = num;
        }
      } else {
        const uPrefix = prefix.toUpperCase();
        if (rNumStr.startsWith(uPrefix)) {
          let numPart = rNumStr.substring(uPrefix.length);
          if (/^\d+$/.test(numPart)) {
            let num = parseInt(numPart);
            if (num > maxNum && num >= startNum && (endNum ? num <= endNum : true)) maxNum = num;
          }
        }
      }
    }
  });

  let nextNum = maxNum === -1 ? startNum : maxNum + 1;
  if (endNum && nextNum > endNum) {
    const limitLabel = typeCat === 'Mutasi' ? `PB-${yy}${mm}${String(endNum).padStart(2, '0')}` : (config.end || endNum);
    return { err: `Nomor seri untuk ${typeCat} bulan ${key} sudah habis (melewati ${limitLabel}). Silakan perbarui pengaturan No. Series.` };
  }

  let warning = null;
  if (endNum && (endNum - nextNum <= 3 && endNum - nextNum >= 0)) {
    const sisa = endNum - nextNum;
    if (sisa === 0) {
      warning = `Perhatian: Nomor ${typeCat} ini adalah nomor TERAKHIR yang dialokasikan bulan ini!`;
    } else {
      warning = `Perhatian: Kuota nomor seri ${typeCat} tersisa ${sisa} nomor lagi sebelum batas akhir (${endNum})!`;
    }
  }

  if (typeCat === 'Mutasi') {
    return { val: `PB-${yy}${mm}${String(nextNum).padStart(2, '0')}`, warning };
  }

  let nextNumStr = String(nextNum);
  if (typeof config.start === 'string' && config.start.startsWith('0')) {
    nextNumStr = nextNumStr.padStart(config.start.length, '0');
  }

  return { val: prefix + nextNumStr, warning };
}

export function autoGenerateReceipt(formType) {
  const notify = window.notify || alert;
  let dateInput, inputElem, typeCat, prefix;
  if (formType === 'INC') {
    dateInput = document.getElementById('incDate').value;
    inputElem = document.getElementById('incReceipt');
    let incType = (document.getElementById('incType').value || '').toLowerCase();
    if (incType.includes('pembangunan')) {
      typeCat = 'PemasukanPembangunan'; prefix = 'PEMB-';
    } else {
      typeCat = 'Pemasukan'; prefix = '';
    }
  } else if (formType === 'EXC') {
    dateInput = document.getElementById('expDate').value;
    inputElem = document.getElementById('expReceipt');
    let source = document.getElementById('expSource').value;
    if (source.startsWith('Kas Jemaat')) { typeCat = 'PengeluaranJemaat'; prefix = 'COST-'; }
    else if (source.startsWith('Daerah')) { typeCat = 'PengeluaranDaerah'; prefix = 'MBR-'; }
    else if (source.startsWith('Pembangunan')) { typeCat = 'PengeluaranPembangunan'; prefix = 'CP-'; }
  } else if (formType === 'PB') {
    dateInput = document.getElementById('mutDate').value;
    inputElem = document.getElementById('mutReceipt');
    typeCat = 'Mutasi'; prefix = 'PB-';
  }

  const res = getNextReceiptNumber(dateInput, typeCat, prefix);
  if (res.err) {
    notify(res.err, 'error');
  } else {
    inputElem.value = res.val;
    if (res.warning) {
      notify(res.warning, 'warning');
    }
  }
};
window.loadSeriesConfig = loadSeriesConfig;
window.saveSeriesConfig = saveSeriesConfig;
window.switchSeriesTab = switchSeriesTab;
window.handleSeriesHistoryFilter = handleSeriesHistoryFilter;
window.handleSeriesHistorySearch = handleSeriesHistorySearch;
window.handleSeriesCardClick = handleSeriesCardClick;
// Bind to window for HTML inline access
window.currentSeriesTab = currentSeriesTab;
window.currentSeriesFilterCat = currentSeriesFilterCat;
window.currentSeriesSearch = currentSeriesSearch;
window.cachedSeriesHistoryData = cachedSeriesHistoryData;
window.SERIES_CATEGORY_META = SERIES_CATEGORY_META;
window.switchSeriesTab = switchSeriesTab;
window.handleSeriesCardClick = handleSeriesCardClick;
window.handleSeriesHistoryFilter = handleSeriesHistoryFilter;
window.handleSeriesHistorySearch = handleSeriesHistorySearch;
window.isTxInPeriod = isTxInPeriod;
window.detectSeriesCat = detectSeriesCat;
window.renderSeriesHistory = renderSeriesHistory;
window.renderSeriesHistoryTable = renderSeriesHistoryTable;
window.loadSeriesConfig = loadSeriesConfig;
window.saveSeriesConfig = saveSeriesConfig;
window.getNextReceiptNumber = getNextReceiptNumber;
window.autoGenerateReceipt = autoGenerateReceipt;
