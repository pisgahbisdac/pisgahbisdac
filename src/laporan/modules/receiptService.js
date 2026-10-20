import { GMAHK_LOGO_BASE64 } from './logoAsset.js';
// ==========================================
// RECEIPT SERVICE & PRINTING MODULE
// ==========================================

const fmt = (n) => Math.round(n || 0).toLocaleString('id-ID');
const fmtDate = (d) => (typeof window.fmtDate === 'function' ? window.fmtDate(d) : (d || '-'));
const hasRole = (user, targetRole) => {
  if (!user || !user.role) return false;
  if (typeof window.hasRole === 'function') return window.hasRole(user, targetRole);
  const roles = user.role.split(',').map(r => r.trim());
  return roles.includes(targetRole);
};

export function terbilang(angka) {
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

export function generateReceiptHTML(type, mainTx, customItems = null) {
  if (!mainTx) return '';
  const isMutasiIn = type === 'mutasi_in' || (type === 'income' && (mainTx.income_type === 'Mutasi Kas / Setor Bank' || mainTx.department === 'Mutasi Kas / Setor Bank'));
  const isMutasiOut = type === 'mutasi_out' || type === 'mutasi' || (type === 'expense' && (mainTx.department === 'Mutasi Kas / Setor Bank' || mainTx.income_type === 'Mutasi Kas / Setor Bank')) || (!type && (mainTx.department === 'Mutasi Kas / Setor Bank' || mainTx.income_type === 'Mutasi Kas / Setor Bank'));
  const isMutasi = isMutasiIn || isMutasiOut;
  const isIncome = (type === 'income' || isMutasiIn) && !isMutasiOut;

  const cachedIncome = window.cachedIncome || [];
  const cachedExpense = window.cachedExpense || [];
  const arr = isIncome ? cachedIncome : cachedExpense;
  const targetReceipt = mainTx.receipt_no;
  const targetDate = mainTx.date;

  let items = customItems || [];
  if (!customItems) {
    if (isIncome && !isMutasi && targetReceipt && targetReceipt !== '-') {
      items = arr.filter(x => x.receipt_no === targetReceipt && x.date === targetDate);
    } else {
      items = [mainTx];
    }
  }

  if (isIncome && !isMutasi && items.length > 0) {
    const getWeight = (t) => {
      let str = (t || '').toLowerCase();
      if (str.includes('perpuluhan')) return 1;
      if (str.includes('terpadu')) return 2;
      if (str.includes('khusus')) return 3;
      return 4;
    };
    items.sort((a, b) => getWeight(a.income_type) - getWeight(b.income_type));
  }

  let totalAmt = 0;
  let finalTableHtml = '';

  let ths = '';
  let tds = '';

  const userUnits = (typeof window.getUserUnits === 'function') ? window.getUserUnits() : [];
  const currentUser = window.currentUser || null;
  const getRolePerms = window.getRolePerms || (() => ({}));
  const perms = getRolePerms(currentUser?.role || '');
  const hasRole = window.hasRole || (() => false);
  const isViewer = perms.isAnonymous || (currentUser && (hasRole(currentUser, 'Viewer') || hasRole(currentUser, 'Publik')));
  const isAnon = perms.isAnonymous;
  const masterData = window.masterData || null;
  const isPrivateCategory = window.isPrivateCategory || (() => false);
  let receiptHasHiddenItems = false;

  // Format Nama Sumber Kas (Kas Jemaat / Kas Daerah / Kas Pembangunan)
  let rawSrc = mainTx.source_balance || mainTx.nama_pemberi || mainTx.unit_name || '';
  if (typeof rawSrc === 'string' && rawSrc.includes('|')) rawSrc = rawSrc.split('|')[0].trim();
  let srcName = 'Kas Jemaat';
  if (typeof rawSrc === 'string' && rawSrc.trim()) {
    const sLow = rawSrc.toLowerCase().trim();
    if (sLow === 'daerah' || sLow === 'kas daerah') {
      srcName = 'Kas Daerah';
    } else if (sLow === 'pembangunan' || sLow === 'kas pembangunan') {
      srcName = 'Kas Pembangunan';
    } else if (sLow === 'jemaat' || sLow === 'kas jemaat') {
      srcName = 'Kas Jemaat';
    } else if (sLow.startsWith('kas ')) {
      srcName = rawSrc.trim();
    } else {
      srcName = 'Kas ' + rawSrc.trim();
    }
  }

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
    if (isTransparentInc || !isIncome || isMutasi) shouldHide = false;

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
    } else if (isMutasiIn) {
      headerTitle = 'MUTASI BANK MASUK';
      detailStr = `<br><span style="font-weight: 500; font-size: 10px; color:#444;">(Sumber: ${srcName})</span>`;
      let rawNote = (x.note || '').replace(/\[BANK\]|\[CASH\]/g, '').trim();
      cleanNote = `<br><span style="font-size: 10px; color: #444; font-weight: normal;"><i>Ket: Setoran Kas Masuk Rekening Bank${rawNote ? ' - ' + rawNote : ''}</i></span>`;
    } else if (isMutasiOut) {
      headerTitle = 'MUTASI KAS KELUAR';
      detailStr = `<br><span style="font-weight: 500; font-size: 10px; color:#444;">(Sumber: ${srcName})</span>`;
      let rawNote = (x.note || '').replace(/\[BANK\]|\[CASH\]/g, '').trim();
      cleanNote = `<br><span style="font-size: 10px; color: #444; font-weight: normal;"><i>Ket: Setoran Tunai ke Bank${rawNote ? ' - ' + rawNote : ''}</i></span>`;
    } else {
      let details = [];
      if (parseFloat(x.alloc_daerah) > 0) details.push(`Daerah: #Rp. ${fmt(x.alloc_daerah)}#`);
      if (parseFloat(x.alloc_jemaat) > 0) details.push(`Jemaat: #Rp. ${fmt(x.alloc_jemaat)}#`);
      if (parseFloat(x.alloc_bangun) > 0) details.push(`Bangun: #Rp. ${fmt(x.alloc_bangun)}#`);
      detailStr = details.length > 0 ? `<br><span style="font-weight: 500; font-size: 10px; color:#444;">(${details.join(' | ')})</span>` : '';

      if (x.note && x.note.trim() !== '') {
        let rawNote = x.note.replace(/\[BANK\]|\[CASH\]/g, '').trim();
        if (rawNote) cleanNote = `<br><span style="font-size: 10px; color: #444; font-weight: normal;"><i>Ket: ${rawNote}</i></span>`;
      }
    }

    ths += `<th style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 11px; font-weight:700; text-transform: uppercase; color: #000; background: #f5f5f5;">${headerTitle}</th>`;
    tds += `<td style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 12px; vertical-align: top; color: #000; background: #ffffff;">#Rp. ${fmt(amt)}#${detailStr}${cleanNote}</td>`;
  });
  ths += `<th style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 11px; font-weight:800; background: #e8e8e8; color: #000;">TOTAL</th>`;
  tds += `<td style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 12px; font-weight:800; background: #fafafa; vertical-align: top; color: #000;">#Rp. ${fmt(totalAmt)}#</td>`;

  finalTableHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #333;">
          <thead>
            <tr style="background: #f5f5f5;">
              ${ths}
            </tr>
          </thead>
          <tbody>
            <tr style="background: #ffffff;">
              ${tds}
            </tr>
          </tbody>
        </table>
      `;

  let pihakName = isIncome ? (mainTx.nama_pemberi || mainTx.pihak || 'Umum') : (mainTx.nama_penerima || mainTx.pihak || 'Umum');
  if (isIncome && typeof pihakName === 'string' && pihakName.toLowerCase().startsWith('kolektif ')) {
    pihakName = pihakName.substring(9).trim();
  } else if (isIncome && typeof pihakName === 'string' && pihakName.toLowerCase().endsWith(' - kolektif')) {
    pihakName = pihakName.substring(0, pihakName.length - 11).trim();
  }
  if (receiptHasHiddenItems) pihakName = '*** (Privasi)';
  let docTitle = isIncome ? 'BUKTI PEMASUKAN' : 'BUKTI PENGELUARAN';
  let pihakLabel = isIncome ? 'Telah Terima Dari' : 'Dibayarkan Kepada';
  let signLabel1 = isIncome ? 'Penyetor,' : 'Penerima,';

  if (isMutasiIn) {
    docTitle = 'BUKTI MUTASI BANK MASUK';
    pihakLabel = 'Diterima Dari';
    pihakName = srcName;
    signLabel1 = 'Penyetor,';
  } else if (isMutasiOut) {
    docTitle = 'BUKTI MUTASI KAS KELUAR';
    pihakLabel = 'Disetor Ke';
    pihakName = 'Bank';
    signLabel1 = 'Penyetor,';
  }

  const isCopy = (!currentUser || !hasRole(currentUser, 'Bendahara'));
  const watermarkHtml = isCopy ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 45px; font-weight: 900; color: rgba(220, 38, 38, 0.15); z-index: 10; pointer-events: none; border: 6px solid rgba(220, 38, 38, 0.15); padding: 10px 20px; letter-spacing: 8px; border-radius: 10px; white-space: nowrap;">CERTIFIED TRUE COPY</div>` : '';
  const systemConfig = window.systemConfig || {};

  return `
        <div class="receipt-page" style="position: relative; font-family: 'Inter', 'Helvetica Neue', sans-serif; padding: 15px 15px 10px 15px; max-width: 100%; min-height: 95mm; height: max-content; margin: 0; color: #000; background: white; box-sizing: border-box; page-break-inside: avoid; page-break-after: always; border-bottom: 1px dashed #ccc;">
          ${watermarkHtml}
          <div style="position: relative; z-index: 1; color: #000;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #222; padding-bottom: 8px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${systemConfig.logo_kuitansi || GMAHK_LOGO_BASE64}" style="width: 65px; height: 65px; object-fit: contain;">
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

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; line-height: 1.4; border: 1px solid #ddd;">
            <tr>
              <td style="width: 150px; padding: 6px 8px; vertical-align: top; white-space: nowrap; border: 1px solid #ddd; background: #ffffff;"><strong>${pihakLabel}</strong></td>
              <td style="width: 10px; padding: 6px 4px; vertical-align: top; border: 1px solid #ddd; text-align: center; background: #ffffff;">:</td>
              <td style="padding: 6px 8px; vertical-align: top; font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border: 1px solid #ddd; background: #ffffff;">${pihakName}</td>
            </tr>
            <tr>
              <td style="width: 150px; padding: 6px 8px; vertical-align: top; white-space: nowrap; border: 1px solid #ddd; background: #ffffff;"><strong>Tanggal</strong></td>
              <td style="width: 10px; padding: 6px 4px; vertical-align: top; border: 1px solid #ddd; text-align: center; background: #ffffff;">:</td>
              <td style="padding: 6px 8px; vertical-align: top; font-weight: 600; font-size: 13px; border: 1px solid #ddd; background: #ffffff;">${fmtDate(mainTx.date) || '-'}</td>
            </tr>
            <tr>
              <td style="width: 150px; padding: 6px 8px; vertical-align: top; white-space: nowrap; border: 1px solid #ddd; background: #ffffff;"><strong>Uang Sebesar</strong></td>
              <td style="width: 10px; padding: 6px 4px; vertical-align: top; border: 1px solid #ddd; text-align: center; background: #ffffff;">:</td>
              <td style="padding: 6px 8px; vertical-align: top; font-style: italic; background:#f5f5f5; border: 1px solid #ddd; font-weight: 500;">
                ${terbilang(totalAmt).replace(/\s+/g, ' ').trim()} Rupiah
              </td>
            </tr>
            <tr>
              <td style="width: 150px; padding: 6px 8px; vertical-align: top; white-space: nowrap; border: 1px solid #ddd; background: #ffffff;"><strong>Total</strong></td>
              <td style="width: 10px; padding: 6px 4px; vertical-align: top; border: 1px solid #ddd; text-align: center; background: #ffffff;">:</td>
              <td style="padding: 6px 8px; vertical-align: top; font-weight: 700; font-size: 14px; border: 1px solid #ddd; background: #ffffff;">#Rp. ${fmt(totalAmt)}#</td>
            </tr>
          </table>

          ${finalTableHtml}

          <div style="display: flex; justify-content: ${(isIncome && !isMutasiIn) ? 'flex-end' : 'space-between'}; margin-top: 10px; text-align: center; font-size: 12px;">
            ${(!isIncome || isMutasiIn) ? `
            <div style="width: 180px;">
              <p style="margin: 0 0 50px 0; color:#333;">${signLabel1}</p>
              <p style="margin: 0; text-decoration: underline; font-weight: 600; color:#111;">${isMutasi ? (mainTx.created_by || 'Penyetor') : pihakName}</p>
            </div>
            ` : ''}
            <div style="width: 180px; position: relative;">
              <p style="margin: 0 0 5px 0; color:#333;">${systemConfig.kota_kuitansi || 'Manado'}, ${fmtDate(mainTx.date)}</p>
              <p style="margin: 0; color:#333; position: relative; z-index: 2;">Bendahara,</p>
              <div style="height: 50px; position: relative; z-index: 1;">
                <img src="${systemConfig.sig_stempel || '/stamp.png'}" style="position: absolute; top: 50%; left: -10px; transform: translate(-50%, -50%) rotate(-5deg); height: 110px; width: 110px; opacity: 0.9; z-index: 5; pointer-events: none;">
                ${(systemConfig.sig_bendahara) ? `<img src="${systemConfig.sig_bendahara}" style="max-height: 80px; max-width: 150px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); object-fit: contain; z-index: 10;">` : ''}
              </div>
              <p style="margin: 0; text-decoration: underline; font-weight: 600; color:#111; position: relative; z-index: 12;">${systemConfig.sig_name_bendahara || '....................'}</p>
            </div>
          </div>
          </div>
        </div>
      `;
}

export function generateReceiptImageBase64(htmlString, isForViewing = false) {
  return new Promise((resolve, reject) => {
    const overlay = document.getElementById('loadingOverlay');
    const container = document.getElementById('hiddenReceiptContainer');
    if (!container) return reject(new Error("Container not found"));

    if (overlay) overlay.style.display = 'flex';
    container.innerHTML = htmlString;

    // Force white background and black text on ALL elements to prevent dark-mode CSS bleed
    container.style.background = '#ffffff';
    container.style.color = '#000000';
    const els = container.querySelectorAll('div, p, span, th, td, tr, thead, tbody, table, strong, img');
    els.forEach(el => {
      // Force text color to black (except CERTIFIED watermark which has its own color)
      if (!el.style.color && !el.innerHTML.includes('CERTIFIED')) {
        el.style.color = '#000000';
      }
      // Force backgrounds: keep explicit light backgrounds, override any dark/inherited ones
      const bg = el.style.background || el.style.backgroundColor || '';
      const isBgExplicitlyLight = bg && (bg.includes('#f') || bg.includes('#e') || bg.includes('#d') || bg.includes('white') || bg.includes('rgb(2'));
      if (!isBgExplicitlyLight && !bg.includes('rgba')) {
        // Only set transparent for elements that shouldn't have a bg, white for containers
        if (el.tagName === 'TR' || el.tagName === 'THEAD' || el.tagName === 'TBODY' || el.tagName === 'TABLE') {
          if (!el.style.background) el.style.background = 'transparent';
        }
      }
    });

    // Wait briefly for DOM to render completely
    setTimeout(() => {
      html2canvas(container, {
        scale: 2, // High-definition 2x rendering
        useCORS: true,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        ignoreElements: (node) => {
          if (node.id === 'floatingSyncBtn') return true;
          if (node.classList && node.classList.contains('fixed')) return true;
          return false;
        }
      }).then(async origCanvas => {
        // High-definition full-color output: preserve genuine colors of stamps, logos, text
        let base64Str = origCanvas.toDataURL('image/webp', 0.88);
        if (!base64Str.startsWith('data:image/webp')) {
          base64Str = origCanvas.toDataURL('image/jpeg', 0.88);
        }

        // Tag as auto-receipt
        base64Str = base64Str.replace('image/webp', 'image/webp;name=auto-receipt');
        if (!base64Str.includes('name=auto-receipt')) {
          base64Str = base64Str.replace('image/jpeg', 'image/jpeg;name=auto-receipt');
        }

        console.log(`HD Receipt generated: ${base64Str.length} chars, dimension: ${origCanvas.width}x${origCanvas.height}`);

        container.innerHTML = '';
        if (overlay) overlay.style.display = 'none';
        resolve(base64Str);
      }).catch(err => {
        console.error("Error generating receipt image", err);
        container.innerHTML = '';
        if (overlay) overlay.style.display = 'none';
        reject(err);
      });
    }, 150);
  });
}

// Utility to upgrade past receipts to HD
export async function upgradeOldReceiptsToHD() {
  const cachedIncome = window.cachedIncome || [];
  const cachedExpense = window.cachedExpense || [];
  const apiPostWithFallback = window.apiPostWithFallback;
  const allTrans = [...cachedIncome, ...cachedExpense];
  const toUpgrade = allTrans.filter(x => !x.receipt_photo || (typeof x.receipt_photo === 'string' && x.receipt_photo.includes('name=auto-receipt')));
  if (toUpgrade.length === 0) {
    alert("Semua kuitansi otomatis sudah dalam resolusi HD!");
    return;
  }
  const confirmed = confirm(`Ditemukan ${toUpgrade.length} transaksi yang dapat di-upgrade ke kuitansi HD berwarna. Lanjutkan proses sekarang?`);
  if (!confirmed) return;

  let batchOverlay = document.createElement('div');
  batchOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: sans-serif; text-align: center; padding: 20px;';
  document.body.appendChild(batchOverlay);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toUpgrade.length; i++) {
    const r = toUpgrade[i];
    const isMutasi = (r.department === 'Mutasi Kas / Setor Bank' || r.income_type === 'Mutasi Kas / Setor Bank');
    const type = r.income_type ? 'income' : 'expense';
    batchOverlay.innerHTML = `<h2 style="margin-bottom:8px;">Meng-upgrade Kuitansi HD (${i + 1}/${toUpgrade.length})</h2><p style="color:#10b981;font-weight:bold;">${r.receipt_no || r.transaction_id || ''}</p><p style="margin-top:16px;color:#aaa;font-size:13px;">Menyimpan kuitansi HD berwarna ke server...</p>`;
    try {
      if (isMutasi) {
        const htmlOut = generateReceiptHTML('mutasi_out', r);
        const htmlIn = generateReceiptHTML('mutasi_in', r);
        const [genBase64Out, genBase64In] = await Promise.all([
          generateReceiptImageBase64(htmlOut),
          generateReceiptImageBase64(htmlIn)
        ]);
        const payload = {
          type: 'expense', transaction_id: r.transaction_id || r.id, date: r.date, receipt_no: r.receipt_no, amount: r.amount, note: r.note,
          receipt_photo_base64: genBase64Out,
          receipt_photo_base64_2: genBase64In,
          original: r, department: r.department, source_balance: r.source_balance, nama_penerima: r.nama_penerima
        };
        r.receipt_photo = genBase64Out;
        r.receipt_photo_2 = genBase64In;
        await apiPostWithFallback('editRecord', payload);
      } else {
        const htmlStr = generateReceiptHTML(type, r);
        const genBase64 = await generateReceiptImageBase64(htmlStr);

        let payload;
        if (type === 'income') {
          payload = {
            type: 'income', transaction_id: r.transaction_id || r.id, date: r.date, receipt_no: r.receipt_no, amount: r.amount, note: r.note,
            receipt_photo_base64: genBase64,
            original: r, income_type: r.income_type, unit_name: r.unit_name, nama_pemberi: r.nama_pemberi
          };
        } else {
          payload = {
            type: 'expense', transaction_id: r.transaction_id || r.id, date: r.date, receipt_no: r.receipt_no, amount: r.amount, note: r.note,
            receipt_photo_base64: genBase64,
            original: r, department: r.department, source_balance: r.source_balance, nama_penerima: r.nama_penerima
          };
        }
        r.receipt_photo = genBase64;
        await apiPostWithFallback('editRecord', payload);
      }
      success++;
    } catch (e) {
      console.error("Upgrade HD failed for", r.receipt_no, e);
      failed++;
    }
    await new Promise(res => setTimeout(res, 300));
  }

  batchOverlay.remove();
  alert(`Selesai meng-upgrade kuitansi!\nBerhasil: ${success}\nGagal: ${failed}`);
};

// Admin tool to batch upload old receipts (run via console: window.batchUploadOldReceipts())
export async function batchUploadOldReceipts() {
  const cachedIncome = window.cachedIncome || [];
  const cachedExpense = window.cachedExpense || [];
  const apiPostWithFallback = window.apiPostWithFallback;
  const syncAllData = window.syncAllData;
  const renderHistory = window.renderHistory;
  const allTrans = [...cachedIncome, ...cachedExpense];
  const remaining = allTrans.filter(x => !x.receipt_photo);

  if (remaining.length === 0) {
    alert("Semua transaksi sudah memiliki foto kuitansi!");
    return;
  }

  const toUpdate = remaining;

  const userConfirmed = await new Promise((resolve) => {
    let confOverlay = document.createElement('div');
    confOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 999999; display: flex; align-items: center; justify-content: center;';

    let dialog = document.createElement('div');
    dialog.style.cssText = 'background: #222; padding: 25px; border-radius: 12px; max-width: 400px; text-align: center; color: white; font-family: sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #444;';

    dialog.innerHTML = `
          <h3 style="margin-top: 0; margin-bottom: 15px; color: #10b981;">Konfirmasi Proses</h3>
          <p style="font-size: 15px; line-height: 1.5; margin-bottom: 25px; color: #ddd;">Sistem akan memproses batch sebanyak <b style="color:white;">${toUpdate.length}</b> transaksi agar tidak memberatkan server. Lanjutkan?</p>
          <div style="display: flex; gap: 15px; justify-content: center;">
            <button id="btnBatalBatch" style="padding: 10px 25px; border: none; border-radius: 6px; background: #444; color: white; cursor: pointer; font-size: 14px;">Batal</button>
            <button id="btnLanjutBatch" style="padding: 10px 25px; border: none; border-radius: 6px; background: #10b981; color: white; cursor: pointer; font-size: 14px; font-weight: bold;">Lanjutkan</button>
          </div>
        `;

    confOverlay.appendChild(dialog);
    document.body.appendChild(confOverlay);

    document.getElementById('btnBatalBatch').onclick = () => {
      confOverlay.remove();
      resolve(false);
    };
    document.getElementById('btnLanjutBatch').onclick = () => {
      confOverlay.remove();
      resolve(true);
    };
  });

  if (!userConfirmed) return;

  console.log(`Ditemukan ${remaining.length} transaksi, memproses ${toUpdate.length} transaksi...`);

  let batchOverlay = document.createElement('div');
  batchOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #111; z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: sans-serif; text-align: center;';
  document.body.appendChild(batchOverlay);
  batchOverlay.innerHTML = `<h2>Memproses ${toUpdate.length} transaksi...</h2><p>Jangan tutup halaman ini.</p>`;

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toUpdate.length; i++) {
    let r = toUpdate[i];
    let type = r.income_type ? 'income' : 'expense';

    batchOverlay.innerHTML = `<h2>Memproses ${i + 1} dari ${toUpdate.length}</h2><p>ID: ${r.receipt_no}</p><p style="margin-top: 20px; font-size: 14px; color: #aaa;">Sistem juga sedang menyimpan ke database...</p>`;

    try {
      const htmlStr = generateReceiptHTML(type, r);
      let genBase64 = await generateReceiptImageBase64(htmlStr);

      let payload;
      if (type === 'income') {
        payload = {
          type: 'income', transaction_id: r.transaction_id || r.id, date: r.date, receipt_no: r.receipt_no, amount: r.amount, note: r.note,
          receipt_photo_base64: genBase64, receipt_photo_base64_2: '', receipt_photo_base64_3: '',
          original: r, income_type: r.income_type, unit_name: r.unit_name, nama_pemberi: r.nama_pemberi
        };
      } else {
        payload = {
          type: 'expense', transaction_id: r.transaction_id || r.id, date: r.date, receipt_no: r.receipt_no, amount: r.amount, note: r.note,
          receipt_photo_base64: genBase64, receipt_photo_base64_2: '', receipt_photo_base64_3: '',
          original: r, department: r.department, source_balance: r.source_balance, nama_penerima: r.nama_penerima
        };
      }

      // Use editRecord to update
      await apiPostWithFallback('editRecord', payload);
      success++;
      console.log(`Success ${success}/${toUpdate.length}`);
    } catch (e) {
      console.error("Failed", r.receipt_no, e);
      failed++;
    }

    // Wait 1s between requests to avoid hitting Apps Script rate limits
    await new Promise(res => setTimeout(res, 1000));
  }

  if (batchOverlay) {
    batchOverlay.remove();
  }

  await new Promise(res => {
    let finishOverlay = document.createElement('div');
    finishOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 999999; display: flex; align-items: center; justify-content: center;';
    finishOverlay.innerHTML = `
          <div style="background: #222; padding: 30px; border-radius: 12px; max-width: 400px; text-align: center; color: white; font-family: sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #444;">
            <h3 style="margin-top: 0; margin-bottom: 15px; color: #10b981;">Proses Selesai!</h3>
            <p style="font-size: 15px; line-height: 1.5; color: #ddd; margin-bottom: 25px;">Berhasil: <b style="color:#10b981;">${success}</b><br>Gagal/Dilewati: <b style="color:#ef4444;">${failed}</b></p>
            <button id="btnFinishBatch" style="padding: 10px 30px; border: none; border-radius: 6px; background: #10b981; color: white; cursor: pointer; font-size: 14px; font-weight: bold;">OK</button>
          </div>
        `;
    document.body.appendChild(finishOverlay);
    document.getElementById('btnFinishBatch').onclick = async () => {
      finishOverlay.remove();
      res();
    };
  });

  await syncAllData();
  renderHistory();
};

export function printTransaction(type, receiptOrId) {
  const cachedIncome = window.cachedIncome || [];
  const cachedExpense = window.cachedExpense || [];
  const notify = window.notify || alert;
  const arr = type === 'income' ? cachedIncome : cachedExpense;
  let mainTx = arr.find(x => x.receipt_no === receiptOrId || x.transaction_id === receiptOrId || x.id === receiptOrId);
  if (!mainTx) {
    const all = [...cachedIncome, ...cachedExpense];
    mainTx = all.find(x => x.receipt_no === receiptOrId || x.transaction_id === receiptOrId || x.id === receiptOrId);
  }
  if (!mainTx) { notify('Transaksi tidak ditemukan.', 'error'); return; }

  let printHtml = '';
  const isMutasi = (mainTx.department === 'Mutasi Kas / Setor Bank' || mainTx.income_type === 'Mutasi Kas / Setor Bank');
  if (isMutasi) {
    if (type === 'income' || type === 'mutasi_in' || mainTx.income_type === 'Mutasi Kas / Setor Bank') {
      printHtml = generateReceiptHTML('mutasi_in', mainTx);
    } else if (type === 'mutasi_out') {
      printHtml = generateReceiptHTML('mutasi_out', mainTx);
    } else {
      printHtml = generateReceiptHTML('mutasi_out', mainTx) + generateReceiptHTML('mutasi_in', mainTx);
    }
  } else {
    printHtml = generateReceiptHTML(type, mainTx);
  }

  document.getElementById('printContainer').innerHTML = printHtml;

  setTimeout(() => {
    window.print();
  }, 500);
}

// Bind to window for HTML inline access
window.terbilang = terbilang;
window.generateReceiptHTML = generateReceiptHTML;
window.generateReceiptImageBase64 = generateReceiptImageBase64;
window.upgradeOldReceiptsToHD = upgradeOldReceiptsToHD;
window.batchUploadOldReceipts = batchUploadOldReceipts;
window.printTransaction = printTransaction;
