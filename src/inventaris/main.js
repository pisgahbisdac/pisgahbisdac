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
    
    return `
      <div class="inv-asset-card" onclick="window.viewDetail('${item.id}')">
        <div class="inv-badge-status">${item.category ? item.category + ' • ' : ''}${item.location}</div>
        <img src="${photoUrl}" class="inv-asset-photo" alt="${item.name}" onerror="this.src='https://via.placeholder.com/500x300?text=No+Photo'">
        <div class="inv-asset-info">
          <div class="inv-asset-name">${item.name} <span style="font-size:0.85rem; font-weight:normal; color:#bbb;">(${item.qty || 1} ${item.unit || 'Unit'})</span></div>
          
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
    
    if (!name || !loc || !pic || !cat || !src || !qty || !unit) return showCustomAlert('Mohon lengkapi field wajib (*)', 'error');
    
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
      sub_items: subItems
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
