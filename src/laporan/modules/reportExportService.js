// ==========================================
// REPORT GENERATION & EXPORT SERVICE
// ==========================================

import { GMAHK_LOGO_BASE64 } from './logoAsset.js';

const fmt = (n) => Math.round(n || 0).toLocaleString('id-ID');
const hasRole = (user, targetRole) => {
  if (!user || !user.role) return false;
  if (typeof window.hasRole === 'function') return window.hasRole(user, targetRole);
  const roles = user.role.split(',').map(r => r.trim());
  return roles.includes(targetRole);
};
const notify = (msg, type) => (typeof window.notify === 'function' ? window.notify(msg, type) : alert(msg));
export function generateComplexReportHtml(isExcel = false) {
  const currentReportData = window.currentReportData || null;
  const currentUser = window.currentUser || null;
  const systemConfig = window.systemConfig || {};
  const masterData = window.masterData || null;
  const cachedIncome = window.cachedIncome || [];
  const cachedExpense = window.cachedExpense || [];
  if (!currentReportData) return '';
  const month = currentReportData.month;
  const year = currentReportData.year;
  const mode = currentReportData.mode;

  const isViewer = currentUser && (hasRole(currentUser, 'Viewer') || hasRole(currentUser, 'Publik'));
  const isSensorUnit = isViewer || (document.getElementById('sensorUnit') ? document.getElementById('sensorUnit').checked : false);

  const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const periodStr = mode === 'bulanan' ? `${monthNames[month] || '-'} ${year || '-'}` : (mode === 'akumulasi' ? `Akumulasi Thn ${year || '-'}` : (currentReportData.customPeriod || 'Pencarian'));

  const groupedInc = {};
  let totalInc = 0; let totalExp = 0;
  const incByCat = {}; const expByDept = {};
  const saldoAwal = (currentReportData.summary && currentReportData.summary.saldoAwal) || 0;
  const saldoAwalJemaat = (currentReportData.summary && currentReportData.summary.saldoAwalJemaat) || 0;

  const txIn = [];
  const unitsGavePersepuluhan = new Set();
  if (currentReportData.incByCategory) {
    Object.values(currentReportData.incByCategory).forEach(arr => arr.forEach(x => {
      if (x.income_type !== 'Mutasi Kas / Setor Bank') txIn.push(x);
      const tLower = (x.income_type || '').toLowerCase();
      if (tLower.includes('perpuluhan') || tLower.includes('persepuluhan')) {
        if (x.unit_name && x.unit_name.trim() !== '' && x.unit_name.trim() !== '-') {
          unitsGavePersepuluhan.add(x.unit_name);
        }
      }
    }));
  }
  let totalJiwaPemberi = 0;
  if (masterData && masterData.units) {
    masterData.units.forEach(u => {
      if (unitsGavePersepuluhan.has(u.name)) {
        totalJiwaPemberi += (parseInt(u.jumlah_anggota) || 0);
      }
    });
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
    let hasExpenses = false;
    for (let i = 0; i < allTx.length; i++) {
      const x = allTx[i];
      if (x.income_type !== undefined) continue; // Skip income transactions
      hasExpenses = true;
      const isAdminApp = x.approved_by && x.approved_by.includes('Admin');
      const isKetua = x.approved_by && x.approved_by.includes('Ketua Jemaat');
      const isPendeta = x.approved_by && x.approved_by.includes('Pendeta');
      if (!isAdminApp && !isPendeta) gembalaApprovedAll = false;
      if (!isAdminApp && !isKetua) ketuaApprovedAll = false;
    }
    if (!hasExpenses) {
      gembalaApprovedAll = true;
      ketuaApprovedAll = true;
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
        isPerorangan: false,
        notes: []
      };
    }
    const t = x.income_type || 'Lain-Lain';
    const amt = parseFloat(x.amount) || 0;
    let amtJemaat = parseFloat(x.alloc_jemaat) || 0;

    const tLower = t.toLowerCase();
    const isSabat13 = tLower.includes('sabat') && tLower.includes('13');
    const isSabat = tLower.includes('sabat') && !tLower.includes('13');

    // PREFER EXPLICIT ALLOC IF IT EXISTS, FALLBACK TO MATH
    if (x.alloc_jemaat !== undefined && x.alloc_jemaat !== null && x.alloc_jemaat !== '') {
      amtJemaat = parseFloat(x.alloc_jemaat) || 0;
    } else {
      if (t === 'Perpuluhan' || t === 'Khusus Daerah' || isSabat13) {
        amtJemaat = 0;
      } else if (t === 'Terpadu' || isSabat) {
        amtJemaat = amt * 0.5;
      } else if (t !== 'Saldo Awal Sistem' && t !== 'Saldo Awal') {
        amtJemaat = amt; // Khusus Jemaat / Sumbangan / Others get 100%
      }
    }

    if (t === 'Perpuluhan') { groupedInc[key].perpuluhan += amt; groupedInc[key].isPerorangan = true; }
    else if (t === 'Terpadu') { groupedInc[key].terpadu += amt; groupedInc[key].isPerorangan = true; }
    else if (isSabat) { groupedInc[key].terpadu += amt; }
    else if (t === 'Khusus Daerah' || isSabat13) groupedInc[key].khususDaerah += amt;
    else groupedInc[key].khususJemaat += amt;

    groupedInc[key].allocDaerah += parseFloat(x.alloc_daerah || 0);
    groupedInc[key].allocJemaat += amtJemaat;

    if (x.note && x.note.trim() !== '') groupedInc[key].notes.push(x.note.trim());

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

    const sb = x.source_balance || '';
    if (sb === 'Kas Jemaat' || sb === 'Kas Jemaat (Di Tangan)' || sb === 'Kas Jemaat (Bank)') {
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

  let calcCashJ = 0;
  let calcCashD = 0;

  (cachedIncome || []).forEach(i => {
    if (!isUpToReportEnd(i.date)) return;
    if (i.income_type === 'Mutasi Kas / Setor Bank') return;
    const isCashInc = (i.note || '').includes('[CASH]');
    let amtJ = parseFloat(i.alloc_jemaat) || 0;
    let amtD = parseFloat(i.alloc_daerah) || 0;

    if (isMatchDate(i.date)) {
      // Hanya override jika alloc_jemaat/alloc_daerah belum tersimpan di DB
      const hasStoredAlloc = (i.alloc_jemaat !== undefined && i.alloc_jemaat !== null && i.alloc_jemaat !== '');
      if (!hasStoredAlloc) {
        const t = i.income_type || 'Lain-Lain';
        const amt = parseFloat(i.amount) || 0;
        const tLower = t.toLowerCase();
        const isSabat13 = tLower.includes('sabat') && tLower.includes('13');
        const isSabat = tLower.includes('sabat') && !tLower.includes('13');
        if (t === 'Perpuluhan' || t === 'Khusus Daerah' || isSabat13) {
          amtJ = 0; amtD = amt;
        } else if (t === 'Terpadu' || isSabat) {
          amtJ = amt * 0.5; amtD = amt * 0.5;
        } else if (t !== 'Saldo Awal Sistem' && t !== 'Saldo Awal' && !tLower.includes('pembangunan') && !(parseFloat(i.alloc_bangun) > 0)) {
          amtJ = amt; amtD = 0;
        }
      }
      // Jika alloc_jemaat tersimpan, gunakan nilai stored (amtJ/amtD sudah benar dari atas)
    }

    if (isCashInc) {
      calcCashD += amtD; calcCashJ += amtJ;
    }
  });

  (cachedExpense || []).forEach(e => {
    if (!isUpToReportEnd(e.date)) return;
    const isMutasi = e.department === 'Mutasi Kas / Setor Bank';
    let srcBase = e.source_balance;
    if (srcBase === 'Kas Daerah (Bank)' || srcBase === 'Kas Daerah (Di Tangan)') { srcBase = 'Daerah'; }
    if (srcBase === 'Kas Jemaat (Bank)' || srcBase === 'Kas Jemaat (Di Tangan)') { srcBase = 'Kas Jemaat'; }

    const isCashExp = (e.note || '').includes('[CASH]') || (e.source_balance || '').includes('Di Tangan');
    const amt = parseFloat(e.amount || 0);

    if (srcBase === 'Daerah') {
      if (!isMutasi) {
        if (isCashExp) calcCashD -= amt;
      } else { calcCashD -= amt; }
    }
    else if (srcBase === 'Kas Jemaat') {
      if (!isMutasi) {
        if (isCashExp) calcCashJ -= amt;
      } else { calcCashJ -= amt; }
    }
  });

  calcCashJ = Math.max(0, calcCashJ);
  calcCashD = Math.max(0, calcCashD);

  const totalFisikJemaat = saldoAkhirJemaat;
  const calcBankJ = totalFisikJemaat - calcCashJ;
  rightPanel.push({ label: 'Saldo Akhir Bulan ini', val: saldoAkhirJemaat, bold: true, isBorderTop: true, isColored: true });
  rightPanel.push({ label: 'Kas Pada Jemaat', val: saldoAkhirJemaat, indent: true });
  rightPanel.push({ label: 'CASH ON HAND / Tunai', val: calcCashJ, indent: true });
  rightPanel.push({ label: 'SALDO DI BANK', val: calcBankJ, indent: true });
  rightPanel.push({ label: '<span style="font-size:6.5pt;">Balance Saldo Kas Jemaat</span>', val: totalFisikJemaat, bold: true, large: true, isBorderTop: true, isColoredDark: true });

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
  const totalFisikDaerah = saldoAkhirDaerah;
  const calcBankD = totalFisikDaerah - calcCashD;
  rightPanel.push({ label: 'Tunai Di Tangan (Daerah)', val: calcCashD, indent: true, isLightDaerah: true });
  rightPanel.push({ label: 'Saldo Bank (Daerah)', val: calcBankD, indent: true, isLightDaerah: true });
  rightPanel.push({ label: '<span style="font-size:6pt;">Total Uang Untuk Daerah</span>', val: totalFisikDaerah, bold: true, large: true, isBorderTop: true, isColoredDaerah: true });

  const imgBen = useBenImg ? `<img src="${systemConfig.sig_bendahara}" style="height:60px; max-width:140px; object-fit:contain; margin:5px auto; display:block;">` : `<br><br><br><br><br>`;
  const imgKet = useKetuaImg ? `<div style="position:relative; margin:25px auto 5px auto; height:60px; width:140px;"><img src="${systemConfig.sig_stempel || '/stamp.png'}" style="position: absolute; top: 50%; left: 5px; transform: translate(-50%, -50%) rotate(-5deg); height: 110px; width: 110px; opacity: 0.9; z-index: 5; pointer-events: none;"><img src="${systemConfig.sig_ketua}" style="height:60px; max-width:140px; object-fit:contain; position:relative; z-index:10; display:block; margin:0 auto;"></div>` : `<br><br><br><br><br>`;
  const imgPen = useGembalaImg ? `<img src="${systemConfig.sig_pendeta}" style="height:60px; max-width:140px; object-fit:contain; margin:5px auto; display:block;">` : `<br><br><br><br><br>`;

  const nameBen = systemConfig.sig_name_bendahara || 'Herbert JS Sagala';
  const titleBen = systemConfig.sig_title_bendahara || 'Bendahara Jemaat';
  const nameKet = systemConfig.sig_name_ketua || 'Yosep Santoso';
  const titleKet = systemConfig.sig_title_ketua || 'Ketua Jemaat';
  const namePen = systemConfig.sig_name_pendeta || 'Pdt. Joseph Sitohang';
  const titlePen = systemConfig.sig_title_pendeta || 'Gembala Jemaat';

  const signHtml = `
        <table style="width: 100%; margin-top: 40px; text-align: center; font-family: sans-serif; font-size: 10pt; color: #000; border: none; background: transparent; page-break-inside: avoid;">
          <tr>
            <td style="width: 33%; border: none; vertical-align: top;">Dibuat Oleh,</td>
            <td style="width: 33%; border: none; vertical-align: top;">Disahkan Oleh,</td>
            <td style="width: 33%; border: none; vertical-align: top;">Mengetahui,</td>
          </tr>
          <tr>
            <td style="width: 33%; border: none; vertical-align: middle; height: 100px;">${imgBen}</td>
            <td style="width: 33%; border: none; vertical-align: middle; height: 100px;">${imgKet}</td>
            <td style="width: 33%; border: none; vertical-align: middle; height: 100px;">${imgPen}</td>
          </tr>
          <tr>
            <td style="width: 33%; border: none; vertical-align: bottom;"><strong>${nameBen}</strong><br>${titleBen}</td>
            <td style="width: 33%; border: none; vertical-align: bottom;"><strong>${nameKet}</strong><br>${titleKet}</td>
            <td style="width: 33%; border: none; vertical-align: bottom;"><strong>${namePen}</strong><br>${titlePen}</td>
          </tr>
        </table>
      `;

  const tableStyle = isExcel ? 'border-collapse: collapse; font-family: Calibri, sans-serif; font-size: 10pt;' : 'border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 6.5pt; table-layout: auto; word-break: normal;';
  const thStyle = isExcel ? 'border: 1px solid #000; padding: 4px; font-weight: bold; text-align: center; background-color: #e2e8f0;' : 'border: 1px solid #000; padding: 3px 1px; font-weight: bold; text-align: center; background-color: #e2e8f0; color: #000; font-size: 5.5pt; line-height: 1.1; white-space: nowrap;';
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
                      <img src="${GMAHK_LOGO_BASE64}" style="width: 80px; height: auto;" alt="Logo Kiri" />
                    </td>
                    <td style="border: none; text-align: center; vertical-align: middle; padding: 0;">
                      <h2 style="margin:0; font-size: 14pt; font-weight: bold;">DAERAH SUMATERA KAWASAN TENGAH</h2>
                      <h3 style="margin:5px 0 0 0; font-size: 12pt;">LAPORAN KEUANGAN JEMAAT</h3>
                      <p style="margin:5px 0 0 0; font-size: 10pt;">Nama Jemaat: <strong>${systemConfig.app_name || 'PISGAH - BISDAC'}</strong></p>
                      <p style="margin:5px 0 0 0; font-size: 10pt;">Bulan/Tahun: <strong>${periodStr}</strong></p>
                    </td>
                    <td style="width: 100px; border: none; text-align: right; vertical-align: middle; padding: 0;">
                      <img src="${systemConfig.logo_sidebar || systemConfig.logo_login || './icons/PisgahColor.png'}" style="width: 80px; height: auto;" alt="Logo Kanan" />
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
              <th style="${thStyle}">No</th>
              <th style="${thStyle}">Tanggal</th>
              <th style="${thStyle}">Nama Unit Pemberi /<br>Perpuluhan & Terpadu</th>
              <th style="${thStyle}">Nomor<br>Kwitansi</th>
              <th style="${thStyle}">Perpuluhan</th>
              <th style="${thStyle}">Persembahan<br>Terpadu</th>
              <th style="${thStyle}">Persembahan Khusus<br>Kas Jemaat</th>
              <th style="${thStyle}">TOTAL<br>Receipt</th>
              <th style="${thStyle}">Perpuluhan</th>
              <th style="${thStyle}">50% Terpadu<br>Daerah</th>
              <th style="${thStyle}">Persembahan<br>Khusus</th>
              <th style="${thStyle}">Jumlah Uang<br>Daerah</th>
              <th style="${thStyle}">50% Terpadu<br>Jemaat</th>
              <th style="${thStyle}">Persembahan Khusus<br>Kas Jemaat</th>
              <th style="${thStyle}">Jumlah Uang<br>Jemaat</th>
              <th style="${thStyle}">Pemasukan &<br>Pengeluaran Jemaat</th>
              <th style="${thStyle}">TOTAL</th>
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
      } else if (data.hasUnit && isSensorUnit) {
        // Hanya sensor unit yang memiliki anggota (jumlah_anggota > 0)
        const uData = masterData && masterData.units
          ? masterData.units.find(u => String(u.name).toLowerCase() === String(data.nama).toLowerCase())
          : null;
        const unitHasMembers = uData && (parseInt(uData.jumlah_anggota || 0) > 0);
        if (unitHasMembers) dNama = 'Unit *** (Privasi)';
      }

      if (!isTop && data.notes && data.notes.length > 0) {
        const uniqueNotes = [...new Set(data.notes)].join(', ');
        dNama += '<br><span style="font-size:0.9em; font-weight:normal; color:#4b5563;">(' + uniqueNotes + ')</span>';
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

  html += `<tr style="page-break-inside: avoid;"><td colspan="17" style="border: none; padding: 0;">`;

  const bottomFontSize = isExcel ? '10pt' : '6.5pt';
  html += `
        <div style="page-break-inside: avoid;">
        <table style="width: 100%; margin-top: 15px; font-family: sans-serif; font-size: ${bottomFontSize}; line-height: 1.5; border:none;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: top; width: 50%;">
              <div><strong>Total Jiwa Pemberi Perpuluhan:</strong> ${totalJiwaPemberi} Jiwa</div>
              <div style="margin-top: 10px;">
                <strong>Ditransfer ke Rekening Daerah:</strong><br>
                Bank : ${systemConfig.transfer_bank || 'Mandiri'}<br>
                No Rek : ${systemConfig.transfer_rekening || '1070 0850 0012 5'}<br>
                Nama Rek : ${systemConfig.transfer_nama || 'MASEHI ADVENT HARI KETUJUH'}<br>
              </div>
            </td>
            <td style="vertical-align: top; width: 50%;">
              <table style="width: 100%; max-width: 350px; font-size: ${bottomFontSize}; float:right;" cellpadding="0" cellspacing="0">
                <tr><td style="padding-bottom: 4px;">Perpuluhan</td><td style="text-align: right; padding-bottom: 4px;">${isExcel ? sumPerpuluhan : fmt(sumPerpuluhan)}</td></tr>
                <tr><td style="padding-bottom: 4px;">Terpadu (50%)</td><td style="text-align: right; padding-bottom: 4px;">${isExcel ? sumTerpaduDaerah : fmt(sumTerpaduDaerah)}</td></tr>
                <tr><td style="padding-bottom: 4px;">Khusus Daerah</td><td style="text-align: right; padding-bottom: 4px;">${isExcel ? sumKhususDaerah : fmt(sumKhususDaerah)}</td></tr>
                <tr><td style="font-weight:bold; border-top: 1px solid #000; padding-top: 4px;">Total Transfer Daerah</td><td style="font-weight:bold; text-align: right; border-top: 1px solid #000; padding-top: 4px;">${isExcel ? sumPemasukanDaerah : fmt(sumPemasukanDaerah)}</td></tr>
              </table>
            </td>
          </tr>
        </table>
        <div style="clear: both; margin-bottom: 20px;"></div>
      `;

  // SIGNATURE FOR MAIN REPORT
  html += signHtml;
  html += `</div></td></tr></tbody></table>`;

  // --- EXPENSES TABLE ---
  html += `
        <table style="${tableStyle} margin-top: 30px; page-break-before: always;">
          <thead>
            <tr>
              <th colspan="7" style="border: none; background: white; padding-bottom: 20px;">
                <table style="width: 100%; border: none; margin: 0; color: #000; font-family: sans-serif;">
                  <tr>
                    <td style="width: 100px; border: none; text-align: left; vertical-align: middle; padding: 0;">
                      <img src="${GMAHK_LOGO_BASE64}" style="width: 80px; height: auto;" alt="Logo Kiri" />
                    </td>
                    <td style="border: none; text-align: center; vertical-align: middle; padding: 0;">
                      <h2 style="margin:0; font-size: 14pt; font-weight: bold;">DAERAH SUMATERA KAWASAN TENGAH</h2>
                      <h3 style="margin:5px 0 0 0; font-size: 12pt;">LAMPIRAN: RINCIAN PENGELUARAN JEMAAT & DAERAH</h3>
                      <p style="margin:5px 0 0 0; font-size: 10pt;">Nama Jemaat: <strong>${systemConfig.app_name || 'PISGAH - BISDAC'}</strong></p>
                      <p style="margin:5px 0 0 0; font-size: 10pt;">Bulan/Tahun: <strong>${periodStr}</strong></p>
                    </td>
                    <td style="width: 100px; border: none; text-align: right; vertical-align: middle; padding: 0;">
                      <img src="${systemConfig.logo_sidebar || systemConfig.logo_login || './icons/PisgahColor.png'}" style="width: 80px; height: auto;" alt="Logo Kanan" />
                    </td>
                  </tr>
                </table>
              </th>
            </tr>
            <tr>
              <th style="${thStyle}">No</th>
              <th style="${thStyle}">Tanggal</th>
              <th style="${thStyle}">No Bukti</th>
              <th style="${thStyle}">Sumber Kas</th>
              <th style="${thStyle}">Bagian / Dept</th>
              <th style="${thStyle}">Keterangan</th>
              <th style="${thStyle}">Nominal</th>
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
  html += `<tr style="page-break-inside: avoid;"><td colspan="7" style="border: none; padding: 0;">`;

  // SIGNATURE FOR EXPENSES
  html += signHtml;

  html += `</td></tr></tbody></table>`;

  return html;
}

export function doPrintReport() {
  const currentReportData = window.currentReportData || null;
  const currentUser = window.currentUser || null;
  try {
    if (!currentReportData || (!currentReportData.incByCategory && !currentReportData.expByDept)) {
      return notify('Laporan kosong. Buat laporan terlebih dahulu.', 'error');
    }
    const html = generateComplexReportHtml(false);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const baseUrl = window.location.origin + window.location.pathname;
    iframe.contentDocument.write(`<html><head><base href="${baseUrl}"><title>Laporan Keuangan</title><style>@page { size: landscape; margin: 1cm; } @media print { body { margin: 0; } table { page-break-inside: auto; } thead { display: table-header-group; } }</style></head><body onload="setTimeout(function(){ window.focus(); window.print(); }, 800)">${html}</body></html>`);
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

export function exportToExcel() {
  const currentReportData = window.currentReportData || null;
  const currentUser = window.currentUser || null;
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

export function exportHistoryExcel() {
  const currentUser = window.currentUser || null;
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
    const isViewer = perms.isAnonymous || (currentUser && (hasRole(currentUser, 'Viewer') || hasRole(currentUser, 'Publik')));
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
// Bind to window for HTML inline access
window.generateComplexReportHtml = generateComplexReportHtml;
window.doPrintReport = doPrintReport;
window.exportToExcel = exportToExcel;
window.exportHistoryExcel = exportHistoryExcel;
