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
  
  const res = await fetch(url.toString());
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
    const valText = currentUser ? `Rp ${fmt(item.value)}` : '*** (Privasi)';
    
    return `
      <div class="asset-card" onclick="window.viewDetail('${item.id}')">
        <div class="badge-status">${item.location}</div>
        <img src="${photoUrl}" class="asset-photo" alt="${item.name}" onerror="this.src='https://via.placeholder.com/500x300?text=No+Photo'">
        <div class="asset-info">
          <div class="asset-name">${item.name}</div>
          <div class="asset-meta"><i class="fa-solid fa-calendar"></i> ${fmtDate(item.date_acquired)}</div>
          <div class="asset-meta"><i class="fa-solid fa-user"></i> ${item.pic}</div>
          ${currentUser ? `<div class="asset-value">Rp ${fmt(item.value)}</div>` : ''}
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
  document.getElementById('detailDate').textContent = fmtDate(item.date_acquired);
  document.getElementById('detailLocation').textContent = item.location;
  document.getElementById('detailPic').textContent = item.pic;
  
  if (item.photo) {
    document.getElementById('detailPhoto').src = item.photo;
    document.getElementById('detailPhoto').style.display = 'block';
  } else {
    document.getElementById('detailPhoto').style.display = 'none';
  }
  
  if (currentUser) {
    document.getElementById('detailValueContainer').style.display = 'block';
    document.getElementById('detailValue').textContent = `Rp ${fmt(item.value)}`;
    document.getElementById('detailAdminActions').style.display = 'flex';
  } else {
    document.getElementById('detailValueContainer').style.display = 'none';
    document.getElementById('detailAdminActions').style.display = 'none';
  }
  
  // Generate Barcode
  JsBarcode("#barcodeSVG", item.id, {
    format: "CODE128",
    lineColor: "#0b1a30",
    width: 2,
    height: 40,
    displayValue: true
  });
  
  document.getElementById('detailModal').style.display = 'flex';
  
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
      alert('Berhasil dihapus!');
      document.getElementById('detailModal').style.display = 'none';
      loadData();
    } catch(e) {
      alert(e.message);
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
    document.getElementById('formValue').value = item.value;
    document.getElementById('formLocation').value = item.location;
    document.getElementById('formPic').value = item.pic;
    
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
    document.getElementById('formPic').value = '';
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
// EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadData();
  
  // Login
  document.getElementById('loginBtn').addEventListener('click', () => {
    document.getElementById('loginModal').style.display = 'flex';
  });
  
  document.getElementById('doLoginBtn').addEventListener('click', async () => {
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;
    if (!u || !p) return alert('Isi username dan password');
    
    const btn = document.getElementById('doLoginBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
    btn.disabled = true;
    
    try {
      const data = await apiGet('login', { username: u, password: p });
      if (data.token) {
        localStorage.setItem('BISDAC_token', data.token);
        localStorage.setItem('BISDAC_role', data.role);
        localStorage.setItem('BISDAC_name', data.nama);
      }
    } catch(err) {
      alert(err.message);
    } finally {
      btn.innerHTML = 'Masuk';
      btn.disabled = false;
      document.getElementById('loginModal').style.display = 'none';
      checkAuth();
    }
  });
  
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (!confirm('Keluar dari mode admin?')) return;
    localStorage.removeItem('BISDAC_token');
    localStorage.removeItem('BISDAC_role');
    localStorage.removeItem('BISDAC_name');
    checkAuth();
    renderGrid(inventoryData); // Rerender to hide values
  });
  
  // Add Asset
  document.getElementById('addBtn').addEventListener('click', () => {
    openFormModal();
  });
  
  // Save Asset
  document.getElementById('saveBtn').addEventListener('click', async () => {
    const name = document.getElementById('formName').value;
    const date = document.getElementById('formDate').value;
    const val = document.getElementById('formValue').value;
    const loc = document.getElementById('formLocation').value;
    const pic = document.getElementById('formPic').value;
    const id = document.getElementById('formId').value;
    
    if (!name || !loc || !pic) return alert('Mohon lengkapi field wajib (*)');
    
    const payload = {
      isUpdate: !!id,
      id: id,
      name: name,
      date_acquired: date,
      value: val,
      location: loc,
      pic: pic
    };
    
    if (window.currentPhotoBase64) {
      payload.photo_base64 = window.currentPhotoBase64;
    }
    
    const btn = document.getElementById('saveBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
    btn.disabled = true;
    
    try {
      await apiPost('saveInventory', payload);
      alert('Berhasil disimpan!');
      closeFormModal();
      loadData();
    } catch(e) {
      alert(e.message);
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
