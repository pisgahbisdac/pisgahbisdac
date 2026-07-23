const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec';
function getActiveApiUrl() { const savedUrl = localStorage.getItem('BISDAC_api_url'); return (savedUrl && savedUrl.trim() !== '') ? savedUrl.trim() : DEFAULT_API_URL; }

let currentUser = null;
let inventoryData = [];

// ==========================================
// UTILS
// ==========================================
function fmt(num) { return new Intl.NumberFormat('id-ID').format(num); }
function fmtDate(d) {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date)) return d;
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${date.getDate()} ${m[date.getMonth()]} ${date.getFullYear()}`;
}

// ==========================================
// API CALLS
// ==========================================
async function apiGet(action, params = {}) {
  const url = new URL(getActiveApiUrl());
  url.searchParams.set('action', action);
  url.searchParams.set('token', localStorage.getItem('BISDAC_token') || '');
  url.searchParams.set('_t', Date.now());
  for (let k in params) url.searchParams.set(k, params[k]);
  
  const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'API Error');
  return data;
}

async function apiPost(action, dataObj) {
  const payload = {
    action: action,
    token: localStorage.getItem('BISDAC_token') || '',
    data: dataObj
  };
  const res = await fetch(getActiveApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    redirect: 'follow',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'API Error');
  return data;
}

// ==========================================
// AUTH & RBAC
// ==========================================
function checkAuth() {
  const token = localStorage.getItem('BISDAC_token');
  const role = localStorage.getItem('BISDAC_role');
  const name = localStorage.getItem('BISDAC_name');
  
  const isAdmin = ['Admin', 'Bendahara', 'Ketua Jemaat', 'Pendeta'].includes(role);
  
  if (token && isAdmin) {
    currentUser = { token, role, name };
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('adminControls').style.display = 'flex';
    document.getElementById('userNameDisplay').textContent = `Hi, ${name}`;
    
    // Tampilkan field rahasia (Nilai)
    document.querySelectorAll('.admin-only-field').forEach(el => el.style.display = 'block');
  } else {
    currentUser = null;
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('adminControls').style.display = 'none';
    
    // Sembunyikan field rahasia
    document.querySelectorAll('.admin-only-field').forEach(el => el.style.display = 'none');
  }
}

// ==========================================
// RENDER UI
// ==========================================
function renderGrid(data) {
  const grid = document.getElementById('inventoryGrid');
  if (!data || data.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: rgba(255,255,255,0.6);">Belum ada data inventaris.</div>`;
    return;
  }
  
  grid.innerHTML = data.map(item => {
    const photoUrl = item.photo ? item.photo : 'https://images.unsplash.com/photo-1548625361-ec8587d60f58?w=500&q=80';
    const isDisposed = item.status === 'Disposed';
    const cardStyle = isDisposed ? 'opacity: 0.7; filter: grayscale(80%); border: 1px solid rgba(239, 68, 68, 0.3);' : '';
    const badgeHtml = isDisposed 
      ? `<div class="inv-badge-status" style="background:rgba(239, 68, 68, 0.9); color:white; font-weight:bold;"><i class="fa-solid fa-ban"></i> DISPOSED</div>`
      : `<div class="inv-badge-status">${item.category ? item.category + ' • ' : ''}${item.location}</div>`;
    
    return `
      <div class="inv-asset-card" style="${cardStyle}" onclick="window.viewDetail('${item.id}')">
        ${badgeHtml}
        <img src="${photoUrl}" class="inv-asset-photo" alt="${item.name}" onerror="this.src='https://via.placeholder.com/500x300?text=No+Photo'">
        <div class="inv-asset-info">
          <div class="inv-asset-name" style="display:flex; align-items:center; gap:8px;">
            ${item.name}
            <span style="font-size:0.7rem; font-weight:bold; color:#000; background-color:var(--accent); padding:3px 8px; border-radius:12px; white-space:nowrap;">
              ${item.qty || 1} ${item.unit || 'Unit'}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px;">
            <div class="inv-asset-meta" style="margin-bottom:0 !important; color:var(--accent); font-family:monospace; font-size:0.8rem;"><i class="fa-solid fa-barcode"></i> ${item.id}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-calendar"></i> ${fmtDate(item.date_acquired)}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-user"></i> ${item.pic}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-truck-ramp-box"></i> ${item.source || '-'}</div>
          </div>
          
          ${currentUser ? `
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
              <div style="font-size:0.75rem; color:rgba(255,255,255,0.6);">Perolehan<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem;">Rp ${fmt(item.value)}</span></div>
              <div style="font-size:0.75rem; color:rgba(255,255,255,0.6); text-align:right;">Taksasi Saat Ini<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem; color:#d4af37;">Rp ${fmt(item.taksasi || 0)}</span></div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function loadData() {
  try {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--accent);"></i></div>`;
    
    const response = await apiGet('getInventory');
    inventoryData = response.data || [];
    // Sort terbaru ke terlama
    inventoryData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderGrid(inventoryData);
    
    // Auto-open detail modal if scanned from barcode/QR
    const urlParams = new URLSearchParams(window.location.search);
    const scanId = urlParams.get('id');
    if (scanId) {
      setTimeout(() => {
        window.viewDetail(scanId);
      }, 300);
    }
  } catch (err) {
    document.getElementById('inventoryGrid').innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: #ef4444;">Gagal memuat data: ${err.message}</div>`;
  }
}

// ==========================================
// ACTIONS
// ==========================================
window.viewDetail = function(id) {
  const item = inventoryData.find(x => x.id === id);
  if (!item) return;
  
  document.getElementById('detailName').textContent = item.name;
  document.getElementById('detailId').textContent = item.id;
  document.getElementById('detailCategory').textContent = item.category || 'Belum Dikategorikan';
  document.getElementById('detailSource').textContent = item.source || 'Tidak Diketahui Asalnya';
  document.getElementById('detailDate').textContent = fmtDate(item.date_acquired);
  document.getElementById('detailLocation').textContent = item.location;
  document.getElementById('detailPic').textContent = item.pic;
  document.getElementById('detailQty').textContent = item.qty || 1;
  document.getElementById('detailUnit').textContent = item.unit || 'Unit';
  
  const statusContainer = document.getElementById('detailStatusContainer');
  const statusBadge = document.getElementById('detailStatusBadge');
  const disposeInfo = document.getElementById('detailDisposeInfo');
  
  if (item.status === 'Disposed') {
    statusContainer.style.display = 'block';
    statusBadge.innerHTML = '<i class="fa-solid fa-ban"></i> Disposed';
    statusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
    statusBadge.style.color = '#ef4444';
    
    disposeInfo.style.display = 'block';
    document.getElementById('detailDisposeReason').textContent = item.dispose_reason || '-';
    
    if (currentUser && item.dispose_price) {
      document.getElementById('detailDisposePrice').textContent = `Rp ${fmt(item.dispose_price)}`;
      document.getElementById('detailDisposePrice').parentElement.style.display = 'block';
    } else {
      document.getElementById('detailDisposePrice').parentElement.style.display = 'none';
    }
  } else {
    statusContainer.style.display = 'block';
    statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Active';
    statusBadge.style.background = 'rgba(74, 222, 128, 0.1)';
    statusBadge.style.color = '#4ade80';
    disposeInfo.style.display = 'none';
  }
  
  const subItemsEl = document.getElementById('detailSubItems');
  const subItemsContainer = document.getElementById('detailSubItemsContainer');
  if (item.sub_items) {
    subItemsEl.textContent = item.sub_items;
    subItemsContainer.style.display = 'flex';
  } else {
    subItemsContainer.style.display = 'none';
  }
  
  if (item.photo) {
    document.getElementById('detailPhoto').src = item.photo;
    document.getElementById('detailPhoto').style.display = 'block';
  } else {
    document.getElementById('detailPhoto').style.display = 'none';
  }
  
  if (currentUser) {
    document.getElementById('detailValueContainer').style.display = 'block';
    document.getElementById('detailValue').textContent = `Rp ${fmt(item.value)}`;
    document.getElementById('detailTaksasiContainer').style.display = 'block';
    document.getElementById('detailTaksasi').textContent = `Rp ${fmt(item.taksasi || 0)}`;
    document.getElementById('detailAdminActions').style.display = 'flex';
  } else {
    document.getElementById('detailValueContainer').style.display = 'none';
    document.getElementById('detailTaksasiContainer').style.display = 'none';
    document.getElementById('detailAdminActions').style.display = 'none';
  }
  
  // Generate QR Code containing the full URL
  const fullUrl = window.location.origin + window.location.pathname + '?id=' + item.id;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}`;
  
  document.getElementById('qrCodeImg').src = qrApiUrl;
  document.getElementById('qrCodeId').textContent = item.id;
  
  document.getElementById('detailModal').style.display = 'flex';
  
  window.printDirectThermal = async () => {
    try {
      if (!('serial' in navigator)) {
        return showCustomAlert('Browser Anda tidak mendukung Direct Print. Gunakan Google Chrome/Edge di PC atau Chrome di Android.', 'error');
      }
      
      const assetName = document.getElementById('detailName').textContent;
      const assetId = document.getElementById('detailId').textContent.replace('ID: ', '');
      const qrSrc = document.getElementById('qrCodeImg').src;
      
      // Minta izin akses ke port COM (Munculkan Pilihan Printer)
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      const writer = port.writable.getWriter();
      
      showCustomAlert('Menghubungkan ke printer...', 'success');
      
      // Buat Canvas Virtual (384 dots = 48 bytes = standar printer 58mm)
      const canvas = document.createElement('canvas');
      canvas.width = 384; 
      canvas.height = 340; 
      const ctx = canvas.getContext('2d');
      
      // Background Putih
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Teks PISGAH
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = 'bold 32px monospace';
      ctx.fillText('PISGAH', 192, 10);
      
      // Load QR Code
      const qrImg = new Image();
      qrImg.crossOrigin = 'Anonymous';
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrSrc;
      });
      
      // Gambar QR di tengah
      ctx.drawImage(qrImg, 92, 55, 200, 200);
      
      // Teks ID dan Nama
      ctx.font = 'bold 24px monospace';
      ctx.fillText(assetId, 192, 265);
      
      ctx.font = '20px monospace';
      let shortName = assetName.length > 25 ? assetName.substring(0, 22) + '...' : assetName;
      ctx.fillText(shortName, 192, 295);
      
      // Konversi ke bit gambar ESC/POS
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const widthBytes = Math.ceil(canvas.width / 8);
      const height = canvas.height;
      
      const buffer = new Uint8Array(8 + (widthBytes * height));
      // Perintah ESC/POS Print Raster Bit Image (GS v 0)
      buffer[0] = 0x1D; buffer[1] = 0x76; buffer[2] = 0x30; buffer[3] = 0x00;
      buffer[4] = widthBytes & 0xFF; buffer[5] = (widthBytes >> 8) & 0xFF;
      buffer[6] = height & 0xFF; buffer[7] = (height >> 8) & 0xFF;
      
      let offset = 8;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < widthBytes; x++) {
          let byte = 0;
          for (let b = 0; b < 8; b++) {
            const px = x * 8 + b;
            if (px < canvas.width) {
              const idx = (y * canvas.width + px) * 4;
              const lum = (data[idx] * 0.299 + data[idx+1] * 0.587 + data[idx+2] * 0.114);
              if (data[idx+3] > 128 && lum < 128) byte |= (1 << (7 - b));
            }
          }
          buffer[offset++] = byte;
        }
      }
      
      // Inisialisasi, rata tengah, dan potong kertas
      const initCmd = new Uint8Array([0x1B, 0x40]);
      const alignCenter = new Uint8Array([0x1B, 0x61, 0x01]);
      const cutCmd = new Uint8Array([0x0A, 0x0A, 0x0A, 0x0A]);
      
      await writer.write(initCmd);
      await writer.write(alignCenter);
      await writer.write(buffer);
      await writer.write(cutCmd);
      
      writer.releaseLock();
      await port.close();
      
      showCustomAlert('Berhasil dicetak langsung ke printer thermal!', 'success');
    } catch (err) {
      console.error(err);
      if(err.name !== 'NotFoundError') { // NotFoundError occurs if user cancels the prompt
        showCustomAlert('Gagal print: ' + err.message, 'error');
      }
    }
  };
  
  window.printBarcode = () => {
    const qrSrc = document.getElementById('qrCodeImg').src;
    const assetName = document.getElementById('detailName').textContent;
    const assetId = document.getElementById('detailId').textContent.replace('ID: ', '');
    
    const printWin = window.open('', '_blank', 'width=700,height=500');
    printWin.document.write(`
      <html>
        <head>
          <title>Preview Thermal Label - ${assetId}</title>
          <style>
            @page { size: 35mm 50mm; margin: 0; }
            body { 
              font-family: 'Inter', sans-serif, monospace; 
              margin: 0; 
              background: #111827;
              display: flex;
              flex-direction: column;
              align-items: center;
              height: 100vh;
              color: white;
            }
            .toolbar {
              background: #1f2937;
              width: 100%;
              padding: 20px;
              text-align: center;
              box-sizing: border-box;
              border-bottom: 1px solid #374151;
            }
            .toolbar button {
              background: #d4af37;
              border: none;
              padding: 12px 24px;
              font-weight: bold;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              color: #000;
              transition: transform 0.2s;
            }
            .toolbar button:hover { transform: scale(1.05); background: #f0c950; }
            .toolbar p { margin: 10px 0 0 0; font-size: 13px; color: #9ca3af; }
            
            .preview-container {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              width: 100%;
            }
            
            /* Thermal Label Box (Portrait 35mm x 50mm) */
            .label-box { 
              width: 35mm; 
              height: 50mm; 
              background: #fff;
              border: 1.5px solid #000;
              border-radius: 4px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.5);
              padding: 3mm 2mm; 
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              overflow: hidden;
            }
            .label-box h3 { 
              margin: 0; 
              font-size: 11px; 
              text-transform: uppercase; 
              color: #000;
              text-align: center;
              width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .qr-wrapper { position: relative; width: 22mm; height: 22mm; margin: auto 0; }
            .qr-wrapper img.qr { width: 22mm; height: 22mm; display: block; }
            .qr-wrapper img.logo { 
              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
              width: 6mm; height: 6mm; background: white; padding: 0.5mm; border-radius: 50%; object-fit: contain; 
            }
            .id-text { 
              margin: 0; 
              font-size: 10px; 
              font-weight: bold; 
              font-family: monospace; 
              color: #000; 
              text-align: center;
            }
            
            .print-only { display: none; }
            
            /* Print Specific Styles */
            @media print {
              body * { visibility: hidden; }
              body { background: #fff; display: block; height: auto; }
              .print-only { 
                display: flex !important; 
                visibility: visible; 
                position: absolute; 
                left: 0; 
                top: 0; 
                box-shadow: none; 
                border: 1.5px solid #000;
                margin: 0;
              }
              .print-only * { visibility: visible; }
            }
          </style>
        </head>
        <body>
          <div class="toolbar no-print">
            <button onclick="window.print()">🖨️ Cetak ke Printer Thermal</button>
            <p>Pastikan pengaturan ukuran kertas (Paper Size) di printer Anda diatur ke portrait <b>35mm x 50mm</b></p>
          </div>
          
          <div class="preview-container no-print">
            <div class="label-box">
              <h3>${assetName}</h3>
              <div class="qr-wrapper">
                <img class="qr" src="${qrSrc}">
                <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
              </div>
              <div class="id-text">${assetId}</div>
            </div>
          </div>
          
          <!-- Hidden box strictly for printing to avoid UI interference -->
          <div class="label-box print-only">
            <h3>${assetName}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${qrSrc}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${assetId}</div>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
  };
  
  // Setup Action Buttons
  document.getElementById('editBtn').onclick = () => {
    document.getElementById('detailModal').style.display = 'none';
    openFormModal(item);
  };
  
  document.getElementById('deleteBtn').onclick = async () => {
    if (!confirm('Hapus aset ini?')) return;
    const btn = document.getElementById('deleteBtn');
    const oriText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Hapus...';
    btn.disabled = true;
    try {
      await apiPost('deleteInventory', { id: item.id });
      showCustomAlert('Berhasil dihapus!', 'success');
      document.getElementById('detailModal').style.display = 'none';
      loadData();
    } catch(e) {
      showCustomAlert(e.message, 'error');
    } finally {
      btn.innerHTML = oriText;
      btn.disabled = false;
    }
  };
}

window.closeFormModal = function() {
  document.getElementById('formModal').style.display = 'none';
}

function openFormModal(item = null) {
  document.getElementById('formModal').style.display = 'flex';
  
  const imgPreview = document.getElementById('photoPreview');
  imgPreview.style.display = 'none';
  document.getElementById('formPhoto').value = '';
  window.currentPhotoBase64 = '';
  
  if (item) {
    document.getElementById('formTitle').textContent = 'Edit Aset';
    document.getElementById('formId').value = item.id;
    document.getElementById('formName').value = item.name;
    document.getElementById('formDate').value = item.date_acquired ? item.date_acquired.substring(0,10) : '';
    document.getElementById('formValue').value = item.value ? fmt(item.value) : '';
    document.getElementById('formLocation').value = item.location;
    document.getElementById('formCategory').value = item.category || '';
    document.getElementById('formSource').value = item.source || '';
    document.getElementById('formTaksasi').value = item.taksasi ? fmt(item.taksasi) : '';
    document.getElementById('formPic').value = item.pic;
    document.getElementById('formQty').value = item.qty || 1;
    document.getElementById('formUnit').value = item.unit || 'Unit';
    document.getElementById('formSubItems').value = item.sub_items || '';
    
    document.getElementById('formStatus').value = item.status || 'Active';
    document.getElementById('formDisposeReason').value = item.dispose_reason || '';
    document.getElementById('formDisposePrice').value = item.dispose_price ? fmt(item.dispose_price) : '';
    document.getElementById('disposeFields').style.display = (item.status === 'Disposed') ? 'block' : 'none';
    
    if (item.photo) {
      document.getElementById('photoPreviewImg').src = item.photo;
      imgPreview.style.display = 'block';
    }
  } else {
    document.getElementById('formTitle').textContent = 'Tambah Aset Baru';
    document.getElementById('formId').value = '';
    document.getElementById('formName').value = '';
    document.getElementById('formDate').value = '';
    document.getElementById('formValue').value = '';
    document.getElementById('formLocation').value = '';
    document.getElementById('formCategory').value = '';
    document.getElementById('formSource').value = '';
    document.getElementById('formTaksasi').value = '';
    document.getElementById('formPic').value = '';
    document.getElementById('formQty').value = '1';
    document.getElementById('formUnit').value = 'Buah';
    document.getElementById('formSubItems').value = '';
    
    document.getElementById('formStatus').value = 'Active';
    document.getElementById('formDisposeReason').value = '';
    document.getElementById('formDisposePrice').value = '';
    document.getElementById('disposeFields').style.display = 'none';
  }
}

// ==========================================
// PHOTO UPLOAD logic
// ==========================================
document.getElementById('formPhoto').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      // Compress
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;
      if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
      else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const base64 = canvas.toDataURL('image/jpeg', 0.6); // 60% quality
      window.currentPhotoBase64 = base64;
      
      document.getElementById('photoPreviewImg').src = base64;
      document.getElementById('photoPreview').style.display = 'block';
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});


// ==========================================
// EVENT LISTENERS & FORMATTING
// ==========================================
window.showCustomAlert = function(msg, type = 'success') {
  const modal = document.getElementById('customAlertModal');
  const title = document.getElementById('alertTitle');
  const message = document.getElementById('alertMessage');
  const icon = document.getElementById('alertIcon');
  
  message.textContent = msg;
  
  if (type === 'error') {
    title.textContent = 'Gagal';
    title.style.color = '#ef4444';
    icon.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
    icon.style.color = '#ef4444';
  } else if (type === 'warning') {
    title.textContent = 'Perhatian';
    title.style.color = '#d4af37';
    icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
    icon.style.color = '#d4af37';
  } else {
    title.textContent = 'Berhasil';
    title.style.color = 'var(--accent)';
    icon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    icon.style.color = 'var(--accent)';
  }
  
  modal.style.display = 'flex';
};

function formatRibuanInput(e) {
  let val = e.target.value.replace(/[^0-9]/g, '');
  if (val) {
    e.target.value = new Intl.NumberFormat('id-ID').format(val);
  } else {
    e.target.value = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadData();
  
  // Format Ribuan
  document.getElementById('formValue').addEventListener('input', formatRibuanInput);
  document.getElementById('formTaksasi').addEventListener('input', formatRibuanInput);
  document.getElementById('formDisposePrice').addEventListener('input', formatRibuanInput);
  
  // Login
  document.getElementById('loginBtn').addEventListener('click', () => {
    document.getElementById('loginModal').style.display = 'flex';
  });
  
  document.getElementById('doLoginBtn').addEventListener('click', async () => {
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;
    if (!u || !p) return showCustomAlert('Isi username dan password', 'error');
    
    const btn = document.getElementById('doLoginBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
    btn.disabled = true;
    
    try {
      const data = await apiGet('login', { username: u, password: p });
      if (data.token) {
        localStorage.setItem('BISDAC_token', data.token);
        
        // Handle varying API response structures
        const role = data.role || (data.user && data.user.role) || '';
        const name = data.nama || (data.user && data.user.nama) || (data.user && data.user.name) || '';
        
        localStorage.setItem('BISDAC_role', role);
        localStorage.setItem('BISDAC_name', name);
      }
    } catch(err) {
      showCustomAlert(err.message, 'error');
    } finally {
      btn.innerHTML = 'Masuk';
      btn.disabled = false;
      document.getElementById('loginModal').style.display = 'none';
      checkAuth();
      if (currentUser) {
        loadData(); // Rerender grid and fetch values
      }
    }
  });
  
  document.getElementById('backupBtn').addEventListener('click', () => {
    document.getElementById('backupModal').style.display = 'flex';
  });
  
  document.getElementById('logoutBtn').addEventListener('click', () => {
    document.getElementById('logoutModal').style.display = 'flex';
  });
  
  document.getElementById('doLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('BISDAC_token');
    localStorage.removeItem('BISDAC_role');
    localStorage.removeItem('BISDAC_name');
    checkAuth();
    renderGrid(inventoryData); // Rerender to hide values
    document.getElementById('logoutModal').style.display = 'none';
  });
  
  // Add Asset
  document.getElementById('addBtn').addEventListener('click', () => {
    openFormModal();
  });
  
  // Save Asset
  document.getElementById('saveBtn').addEventListener('click', async () => {
    const name = document.getElementById('formName').value;
    const date = document.getElementById('formDate').value;
    const val = document.getElementById('formValue').value.replace(/\./g, '');
    const loc = document.getElementById('formLocation').value;
    const cat = document.getElementById('formCategory').value;
    const src = document.getElementById('formSource').value;
    const taks = document.getElementById('formTaksasi').value.replace(/\./g, '');
    const pic = document.getElementById('formPic').value;
    const id = document.getElementById('formId').value;
    const qty = document.getElementById('formQty').value;
    const unit = document.getElementById('formUnit').value;
    const subItems = document.getElementById('formSubItems').value;
    const status = document.getElementById('formStatus').value;
    let disposeReason = document.getElementById('formDisposeReason').value;
    let disposePrice = document.getElementById('formDisposePrice').value.replace(/\./g, '');
    
    if (!name || !loc || !pic || !cat || !src || !qty || !unit) return showCustomAlert('Mohon lengkapi field wajib (*)', 'error');
    if (status === 'Disposed' && !disposeReason) return showCustomAlert('Mohon isi Justifikasi / Alasan Disposal', 'error');
    
    // Pastikan alasan dan harga disposal dihapus jika status bukan Disposed
    if (status !== 'Disposed') {
      disposeReason = '';
      disposePrice = '';
    }
    
    const payload = {
      isUpdate: !!id,
      id: id,
      name: name,
      date_acquired: date,
      value: val,
      location: loc,
      category: cat,
      source: src,
      taksasi: taks,
      pic: pic,
      qty: qty,
      unit: unit,
      sub_items: subItems,
      status: status,
      dispose_reason: disposeReason,
      dispose_price: disposePrice
    };
    
    if (window.currentPhotoBase64) {
      payload.photo_base64 = window.currentPhotoBase64;
    }
    
    const btn = document.getElementById('saveBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
    btn.disabled = true;
    
    try {
      await apiPost('saveInventory', payload);
      showCustomAlert('Berhasil disimpan!', 'success');
      closeFormModal();
      loadData();
    } catch(e) {
      showCustomAlert(e.message, 'error');
    } finally {
      btn.innerHTML = 'Simpan Data';
      btn.disabled = false;
    }
  });
  
  // Search
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = inventoryData.filter(x => 
      x.name.toLowerCase().includes(val) || 
      x.location.toLowerCase().includes(val) || 
      x.pic.toLowerCase().includes(val)
    );
    renderGrid(filtered);
  });
});

// ==========================================
// EXPORT DATA (BACKUP)
// ==========================================
window.exportCSV = function() {
  if (!inventoryData || inventoryData.length === 0) return showCustomAlert('Tidak ada data untuk di-backup.', 'error');
  
  const headers = ['ID', 'TANGGAL_PEROLEHAN', 'NAMA_ASET', 'KATEGORI', 'ASAL_BARANG', 'NILAI_PEROLEHAN', 'TAKSASI_SAAT_INI', 'QTY', 'SATUAN', 'LOKASI', 'PENANGGUNG_JAWAB', 'STATUS', 'JUSTIFIKASI_DISPOSAL', 'HARGA_DISPOSAL', 'RINCIAN'];
  
  const rows = inventoryData.map(item => {
    return [
      item.id,
      fmtDate(item.date_acquired) || '',
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.source || '').replace(/"/g, '""')}"`,
      item.value || 0,
      item.taksasi || 0,
      item.qty || 1,
      item.unit || 'Unit',
      `"${(item.location || '').replace(/"/g, '""')}"`,
      `"${(item.pic || '').replace(/"/g, '""')}"`,
      item.status || 'Active',
      item.status === 'Disposed' ? `"${(item.dispose_reason || '').replace(/"/g, '""').replace(/\n/g, ' ; ')}"` : '""',
      item.status === 'Disposed' ? (item.dispose_price || 0) : '""',
      `"${(item.sub_items || '').replace(/"/g, '""').replace(/\n/g, ' ; ')}"`
    ].join(',');
  });
  
  const csvContent = headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  document.getElementById('backupModal').style.display = 'none';
};

window.exportPDF = function() {
  if (!inventoryData || inventoryData.length === 0) return showCustomAlert('Tidak ada data untuk di-backup.', 'error');
  
  document.getElementById('backupModal').style.display = 'none';
  showCustomAlert('Sedang menyiapkan PDF. Mohon tunggu beberapa detik...', 'success');
  
  const pdfContainer = document.createElement('div');
  pdfContainer.style.padding = '20px';
  pdfContainer.style.fontFamily = 'Arial, sans-serif';
  pdfContainer.style.color = '#333';
  pdfContainer.style.background = '#fff';
  
  let html = `
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
      <h2 style="margin: 0; font-size: 24px; color: #1a2e22;">Laporan Backup Inventaris PISGAH</h2>
      <p style="margin: 5px 0 0; font-size: 14px; color: #666;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
      <thead>
        <tr style="background: #1a2e22; color: white;">
          <th style="padding: 8px; border: 1px solid #ddd; width: 60px;">Foto</th>
          <th style="padding: 8px; border: 1px solid #ddd;">ID & Nama</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Kategori & Lokasi</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Status & Qty</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Nilai (Rp)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  inventoryData.forEach(item => {
    const photoSrc = item.photo ? item.photo : 'https://via.placeholder.com/60?text=No+Photo';
    const statusText = item.status === 'Disposed' 
      ? `<span style="color:red; font-weight:bold;">Disposed</span><br><span style="font-size:8px;">${item.dispose_reason || ''}</span>` 
      : `<span style="color:green; font-weight:bold;">Active</span>`;
    
    html += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <img src="${photoSrc}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong style="font-size:12px;">${item.name}</strong><br>
            <span style="color:#666; font-family:monospace;">${item.id}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${item.category || '-'}<br>
            <span style="color:#666;">${item.location}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${statusText}<br>
            ${item.qty || 1} ${item.unit || 'Unit'}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            Awal: ${fmt(item.value || 0)}<br>
            <span style="color:#666;">Taksasi: ${fmt(item.taksasi || 0)}</span>
          </td>
        </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  pdfContainer.innerHTML = html;
  
  const opt = {
    margin:       10,
    filename:     `Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(pdfContainer).save().then(() => {
    document.getElementById('customAlertModal').style.display = 'none';
  });
};
