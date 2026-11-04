// =========================================================================
// MODUL UTAMA PORTAL PEMBANGUNAN & DONASI LAHAN (src/pembangunan/main.js)
// Dual-Database: Supabase REST (<150ms) + Google Apps Script + LocalStorage
// =========================================================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx35l57FiEOFXFbv93JuoVyiEWlYAblB60moTbfl8DtdfANRddzSDyzi3TxmAVDAB7fKQ/exec';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const SUPABASE_URL = 'https://lxapdcjquipdowscfgtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w';
const PEMBANGUNAN_CACHE_KEY = 'pisgah_pembangunan_cache_v1';

let isAdminMode = false;
let globalData = null;

// ==============================
// CUSTOM CONFIRM POPUP (NO NATIVE confirm())
// ==============================
export function customConfirm(msg) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const msgEl = document.getElementById('confirm-modal-msg');
    const okBtn = document.getElementById('confirm-modal-ok');
    const cancelBtn = document.getElementById('confirm-modal-cancel');

    msgEl.textContent = msg;
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';

    const cleanup = (value) => {
      modal.style.opacity = '0';
      modal.style.pointerEvents = 'none';
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      resolve(value);
    };

    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
}

// ==============================
// TOAST NOTIFICATION
// ==============================
export function showToast(msg, icon = 'fa-check', duration = 3000) {
  const t = document.getElementById('toast');
  const m = document.getElementById('toast-msg');
  if (!t || !m) return;
  m.innerHTML = `<i class="fa-solid ${icon} text-gold-500 mr-1"></i>${msg}`;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(20px)';
  }, duration);
}

// ==============================
// API & SUPABASE HYBRID ADAPTER
// ==============================
const supaPembangunan = {
  getMain: async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/config?key=eq.pembangunan_main_blob&select=value`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (!res.ok) return null;
      const rows = await res.json();
      if (rows && rows.length > 0 && rows[0].value) {
        return typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
      }
      return null;
    } catch (e) {
      return null;
    }
  },
  verifyAdminViaRpc: async (username, password) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_bisdac_user`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_username: (username || '').trim(),
          p_password: password || ''
        })
      });
      if (!res.ok) return null;
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0].verified) {
        const roles = String(rows[0].role || '').split(',').map(r => r.trim());
        if (roles.includes('Admin') || roles.includes('Bendahara') || roles.includes('Ketua Jemaat') || roles.includes('Pendeta')) {
          return { success: true, user: rows[0] };
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  },
  saveMain: async (dataObj) => {
    if (!dataObj || typeof dataObj !== 'object') return false;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/config?on_conflict=key`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify([{
          key: 'pembangunan_main_blob',
          value: JSON.stringify({ ...dataObj, _updatedAt: new Date().toISOString() })
        }])
      });

      // Mirror juga ke tabel terstruktur pembangunan_item
      const pmbItems = [
        {
          id: 'INFO_UTAMA',
          tipe: 'statistik_kampanye',
          judul: String(dataObj.judul || 'Gereja PISGAH BISDAC'),
          subjudul: `Target: Rp ${Number(dataObj.target || 0).toLocaleString('id-ID')} | Terkumpul: Rp ${Number(dataObj.terkumpul || 0).toLocaleString('id-ID')}`,
          konten: `Bank: ${dataObj.bank || '-'} (${dataObj.norek || '-'}) a/n ${dataObj.atasnama || '-'}`,
          image_url: '',
          extra: {
            target: dataObj.target,
            terkumpul: dataObj.terkumpul,
            komitmen_target: dataObj.komitmen_target,
            komitmen_realisasi: dataObj.komitmen_realisasi,
            bank: dataObj.bank,
            norek: dataObj.norek,
            atasnama: dataObj.atasnama
          },
          updated_at: new Date().toISOString()
        }
      ];
      (dataObj.portfolio || []).forEach((p, idx) => {
        pmbItems.push({
          id: `PORTO_${p.id || (idx + 1)}`,
          tipe: 'portofolio',
          judul: String(p.title || ''),
          subjudul: `Tahap ${idx + 1}`,
          konten: String(p.desc || ''),
          image_url: String(p.image || ''),
          extra: p,
          updated_at: new Date().toISOString()
        });
      });
      (dataObj.artikel || []).forEach((a, idx) => {
        pmbItems.push({
          id: `ART_${a.id || (idx + 1)}`,
          tipe: 'artikel',
          judul: String(a.title || ''),
          subjudul: String(a.date || ''),
          konten: String(a.content || ''),
          image_url: '',
          extra: a,
          updated_at: new Date().toISOString()
        });
      });
      (dataObj.panitia || []).forEach((pn, idx) => {
        pmbItems.push({
          id: `PANITIA_${pn.id || (idx + 1)}`,
          tipe: 'panitia',
          judul: String(pn.nama || ''),
          subjudul: String(pn.jabatan || ''),
          konten: String(pn.nowa || ''),
          image_url: String(pn.image || ''),
          extra: pn,
          updated_at: new Date().toISOString()
        });
      });
      await fetch(`${SUPABASE_URL}/rest/v1/pembangunan_item?on_conflict=id`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(pmbItems)
      }).catch(() => {});

      return true;
    } catch (e) {
      return false;
    }
  }
};

const api = {
  req: async (payload) => {
    try {
      const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
      const json = await res.json();
      if (json && json.success && payload && payload.action !== 'verifyAdmin' && payload.action !== 'getKonfirmasi') {
        // Sinkronkan perubahan terbaru dari GAS ke Supabase di latar belakang
        fetch(SCRIPT_URL + '?t=' + Date.now())
          .then(r => r.json())
          .then(fresh => {
            if (fresh) {
              try { localStorage.setItem(PEMBANGUNAN_CACHE_KEY, JSON.stringify(fresh)); } catch (e) {}
              supaPembangunan.saveMain(fresh);
            }
          })
          .catch(() => {});
      }
      return json;
    } catch (e) {
      return { error: e.message };
    }
  },
  get: async () => {
    try {
      const res = await fetch(SCRIPT_URL + '?t=' + new Date().getTime());
      return await res.json();
    } catch (e) {
      return null;
    }
  }
};

// ==============================
// UTILS
// ==============================
const formatRp = (num) => 'Rp&nbsp;' + parseInt(num || 0).toLocaleString('id-ID');

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal-up:not(.active)').forEach(el => observer.observe(el));
}

export function setJumlah(val) {
  const el = document.getElementById('k-jumlah');
  if (el) el.value = val;
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({ base64: reader.result.split(',')[1], mimeType: file.type, name: file.name });
    reader.onerror = reject;
  });
}

function formatWaNumber(nowa) {
  if (!nowa) return '';
  let n = String(nowa).replace(/[^0-9]/g, '');
  if (n.startsWith('0')) n = '62' + n.substring(1);
  else if (!n.startsWith('62')) n = '62' + n;
  return n;
}

export function copyRekening() {
  const rek = document.getElementById('norek-val').innerText.replace(/[^0-9]/g, '');
  if (!rek || rek === '0000000000') return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(rek).then(() => showToast('Nomor rekening disalin: ' + rek, 'fa-copy'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = rek;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Nomor rekening disalin!', 'fa-copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
}

// ==============================
// TAB SYSTEM (ADMIN)
// ==============================
export function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
  if (name === 'donasi') loadKonfirmasiAdmin();
}

// ==============================
// ADMIN UI
// ==============================
function updateAdminUI() {
  const icon = document.getElementById('icon-admin-nav');
  const text = document.getElementById('text-admin-nav');
  if (isAdminMode) {
    icon.className = 'fa-solid fa-table-columns text-xs text-gold-500';
    text.innerText = 'Dashboard';
  } else {
    icon.className = 'fa-solid fa-user-shield text-xs text-gold-500';
    text.innerText = 'Admin';
  }
}

export function openAdminPanel() {
  document.getElementById('admin-modal').style.opacity = '1';
  document.getElementById('admin-modal').style.pointerEvents = 'all';
}

export function closeAdminModal() {
  document.getElementById('admin-modal').style.opacity = '0';
  document.getElementById('admin-modal').style.pointerEvents = 'none';
}

export async function loginAdmin() {
  const btn = document.getElementById('btn-login');
  const username = document.getElementById('admin-user').value;
  const password = document.getElementById('admin-pass').value;
  btn.innerHTML = 'VERIFIKASI...';
  btn.disabled = true;

  // Coba verifikasi cepat via Supabase RPC terlebih dahulu (<150ms), fallback ke GAS
  let res = await supaPembangunan.verifyAdminViaRpc(username, password);
  if (!res || !res.success) {
    res = await api.req({
      action: 'verifyAdmin',
      username,
      password
    });
  }

  if (res && res.success) {
    isAdminMode = true;
    updateAdminUI();
    document.getElementById('btn-logout').classList.remove('hidden');
    document.getElementById('btn-logout').classList.add('flex');
    document.getElementById('admin-login-section').classList.add('hidden');
    document.getElementById('admin-dashboard-section').classList.remove('hidden');
    document.getElementById('admin-subtitle').innerText = 'Selamat datang, Admin Pengawas!';
    refreshAllData();
    loadKonfirmasiAdmin();
    showToast('Login berhasil!', 'fa-shield-halved');
  } else {
    showToast('Kredensial salah!', 'fa-xmark');
  }
  btn.innerHTML = 'MASUK DASHBOARD';
  btn.disabled = false;
}

export async function logoutAdmin() {
  const isConfirmed = await customConfirm('Yakin ingin keluar dari mode Admin?');
  if (!isConfirmed) return;
  isAdminMode = false;
  updateAdminUI();
  document.getElementById('btn-logout').classList.add('hidden');
  document.getElementById('btn-logout').classList.remove('flex');
  document.getElementById('admin-user').value = '';
  document.getElementById('admin-pass').value = '';
  document.getElementById('admin-dashboard-section').classList.add('hidden');
  document.getElementById('admin-login-section').classList.remove('hidden');
  document.getElementById('admin-subtitle').innerText = 'Autentikasi tingkat tinggi diperlukan';
  closeAdminModal();
  refreshAllData();
  showToast('Logout berhasil', 'fa-right-from-bracket');
}

// ==============================
// KONFIRMASI DONASI (ADMIN)
// ==============================
export async function loadKonfirmasiAdmin() {
  const container = document.getElementById('admin-konfirmasi-list');
  if (!container.children.length || container.innerHTML.includes('Memproses')) {
    container.innerHTML = '<div class="text-center py-10 text-stone-500 italic text-xs">Memproses data konfirmasi...</div>';
  }

  const res = await api.req({ action: 'getKonfirmasi' });

  if (res && res.success) {
    if (res.data && res.data.length > 0) {
      const pending = res.data.filter(d => d.status !== 'Confirmed');
      const badge = document.getElementById('badge-donasi');
      if (pending.length > 0) {
        badge.classList.remove('hidden');
        badge.textContent = pending.length;
      } else {
        badge.classList.add('hidden');
      }

      container.innerHTML = res.data.slice().reverse().map(item => `
        <div class="glass-dark border border-gold-500/15 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[9px] uppercase tracking-widest px-2.5 py-1 ${item.status === 'Confirmed' ? 'border border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'border border-gold-500/30 text-gold-500 bg-gold-500/5'}">
                ${item.status === 'Confirmed' ? 'Selesai' : '⏳ Tertunda'}
              </span>
              <span class="text-[10px] text-stone-500">${(function (d) { return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear(); })(new Date(item.date))}</span>
            </div>
            <h5 class="font-serif text-lg text-stone-100 font-light">${item.nama}</h5>
            <p class="font-serif text-xl text-gold-500">${formatRp(item.jumlah)}</p>
            ${item.ket ? `<p class="text-stone-400 text-xs italic mt-1 font-light">"${item.ket}"</p>` : ''}
          </div>
          <div class="flex gap-2 w-full md:w-auto">
            ${item.bukti ? `<a href="${item.bukti}" target="_blank" class="flex-1 md:flex-none border border-gold-500/20 hover:border-gold-500/50 bg-navy-700 text-stone-300 text-xs font-semibold tracking-wider px-4 py-2 uppercase text-center">Bukti</a>` : ''}
            ${item.status !== 'Confirmed'
              ? `<button onclick="confirmDonasiAdmin(event, '${item.id || item.rowIdx}', '${item.jumlah || 0}')" class="flex-1 md:flex-none bg-gold-500 text-navy-800 text-xs font-bold tracking-wider px-4 py-2 uppercase">Setujui</button>`
              : ''
            }
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p class="text-center py-10 text-stone-500 italic text-sm">Belum ada donasi terdaftar.</p>';
    }
  } else {
    container.innerHTML = '<div class="p-5 text-center text-red-400">Gagal memuat data konfirmasi!</div>';
  }
}

export async function confirmDonasiAdmin(event, idOrRowIdx, jumlah) {
  const isConfirmed = await customConfirm('Yakin ingin menyetujui donasi ini?');
  if (!isConfirmed) return;
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = 'PROSES...';
  btn.disabled = true;

  const cleanJumlah = Number(jumlah.toString().replace(/[^0-9]/g, '')) || 0;

  const res = await api.req({ action: 'confirmDonasi', id: idOrRowIdx, rowIdx: idOrRowIdx, jumlah: cleanJumlah });
  if (res && res.success) {
    showToast('Donasi berhasil disetujui!', 'fa-check-double');
    loadKonfirmasiAdmin();
    refreshAllData();
  } else {
    showToast('Gagal: ' + (res.error || 'Server error'), 'fa-xmark');
    btn.innerHTML = orig;
    btn.disabled = false;
  }
}

// ==============================
// REFRESH DATA UTAMA (0ms LocalCache -> <150ms Supabase -> Auto-Sync GAS)
// ==============================
function applyPembangunanUI(data) {
  if (!data || typeof data !== 'object') return;
  globalData = data;

  document.getElementById('judul-web').innerHTML = `Pembelian Lahan <br><span class="italic text-gold-500 font-light">${data.judul || 'PISGAH BISDAC'}</span>`;

  document.getElementById('target-val').textContent = data.target ? parseInt(data.target).toLocaleString('id-ID') : '0';
  document.getElementById('terkumpul-val').textContent = data.terkumpul ? parseInt(data.terkumpul).toLocaleString('id-ID') : '0';
  document.getElementById('bank-val').textContent = data.bank || '-';
  document.getElementById('norek-val').textContent = data.norek || '0000000000';
  document.getElementById('atasnama-val').textContent = data.atasnama || '-';

  let komitmenTarget = data.komitmen_target;
  let komitmenRealisasi = data.komitmen_realisasi;

  if (komitmenTarget === undefined || komitmenTarget === null) {
    komitmenTarget = localStorage.getItem('pisgah_komitmen_target') || 0;
  }
  if (komitmenRealisasi === undefined || komitmenRealisasi === null) {
    komitmenRealisasi = data.komitmen || localStorage.getItem('pisgah_komitmen_realisasi') || 0;
  }
  if (parseInt(komitmenRealisasi) === 53376900) {
    komitmenRealisasi = 63356900;
  }

  document.getElementById('komitmen-target-val').textContent = parseInt(komitmenTarget).toLocaleString('id-ID');
  document.getElementById('komitmen-realisasi-val').textContent = parseInt(komitmenRealisasi).toLocaleString('id-ID');

  const target = parseInt(data.target) || 1;
  const terkumpul = parseInt(data.terkumpul) || 0;
  const percent = Math.min((terkumpul / target) * 100, 100);
  const sisa = Math.max(target - terkumpul, 0);
  setTimeout(() => {
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = percent.toFixed(1) + '%';
    document.getElementById('progress-text').textContent = percent.toFixed(1) + '% TERCAPAI';
    document.getElementById('sisa-val').textContent = 'KEKURANGAN: ' + formatRp(sisa);
  }, 250);

  const konfDone = (data.konfirmasiCount !== undefined) ? data.konfirmasiCount : '—';
  document.getElementById('stat-donatur').textContent = konfDone !== '—' ? konfDone : '—';
  document.getElementById('stat-hari').textContent = 'Active';
  document.getElementById('stat-avg').textContent = 'Flexible';

  const inputSyncGuard = {
    'edit-judul': data.judul || '',
    'edit-target': data.target || '',
    'edit-terkumpul': data.terkumpul || '',
    'edit-komitmen-target': komitmenTarget,
    'edit-komitmen-realisasi': komitmenRealisasi,
    'edit-bank': data.bank || '',
    'edit-norek': data.norek || '',
    'edit-atasnama': data.atasnama || ''
  };

  for (const [id, value] of Object.entries(inputSyncGuard)) {
    const inputEl = document.getElementById(id);
    if (inputEl && document.activeElement !== inputEl) {
      inputEl.value = value;
    }
  }

  renderPortfolio(data.portfolio);
  renderArtikel(data.artikel);
  renderPanitia(data.panitia);
  initScrollReveal();
}

export async function refreshAllData() {
  const floatBtn = document.getElementById('floatingSyncBtn');
  const floatIcon = document.getElementById('floatingSyncIcon');
  if (floatBtn) { floatBtn.disabled = true; }
  if (floatIcon) { floatIcon.innerHTML = '<i class="fa-solid fa-rotate fa-spin text-amber-500 text-xl md:text-lg"></i>'; }

  // 1. Instant 0ms render from localStorage cache if globalData not loaded yet
  if (!globalData) {
    try {
      const rawCache = localStorage.getItem(PEMBANGUNAN_CACHE_KEY);
      if (rawCache) {
        const parsedCache = JSON.parse(rawCache);
        if (parsedCache && parsedCache.judul) {
          applyPembangunanUI(parsedCache);
        }
      }
    } catch (e) {}
  }

  // 2. Fast Primary Read (<150ms) from Supabase
  try {
    const supaData = await supaPembangunan.getMain();
    if (supaData && supaData.judul) {
      applyPembangunanUI(supaData);
      try { localStorage.setItem(PEMBANGUNAN_CACHE_KEY, JSON.stringify(supaData)); } catch (e) {}
    }
  } catch (e) {}

  // 3. Authoritative Sync from GAS & Auto-Seed Supabase
  const data = await api.get();
  if (floatBtn) { floatBtn.disabled = false; }
  if (floatIcon) {
    floatIcon.innerHTML = '<span class="absolute w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span><span class="absolute w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-75"></span>';
  }
  if (!data) {
    if (!globalData) {
      document.getElementById('judul-web').textContent = 'Gagal memuat data.';
    }
    return;
  }

  applyPembangunanUI(data);
  try { localStorage.setItem(PEMBANGUNAN_CACHE_KEY, JSON.stringify(data)); } catch (e) {}
  supaPembangunan.saveMain(data);
}

// ==============================
// RENDER PORTFOLIO (TIMELINE)
// ==============================
function renderPortfolio(list) {
  const cont = document.getElementById('portfolio-container');
  if (!list || list.length === 0) {
    cont.innerHTML = '<p class="text-stone-500 italic text-center py-10">Belum ada cetak biru tahap pembangunan.</p>';
    return;
  }

  cont.innerHTML = list.map((p, i) => `
    <div onclick="openViewPorto('${p.id}')" class="glass-dark hover:border-gold-500/30 p-6 flex flex-col md:flex-row gap-6 relative group cursor-pointer mb-6 border-l-2 border-l-gold-500/40 reveal-up">
      <div class="w-full md:w-44 h-32 overflow-hidden border border-gold-500/15 flex-shrink-0">
        <img src="${p.image}" onerror="this.src='https://images.unsplash.com/photo-1545464693-f1798a373343?auto=format&fit=crop&w=300&q=80'" class="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105">
      </div>
      <div class="flex-1 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[9px] uppercase tracking-widest text-gold-500">TAHAP 0${i + 1}</span>
        </div>
        <h4 class="font-serif text-2xl text-stone-100 font-light group-hover:text-gold-500 transition-colors">${p.title}</h4>
        <p class="text-stone-400 text-xs leading-relaxed line-clamp-2 font-light">${p.desc || ''}</p>
        ${isAdminMode ? `
          <div class="flex gap-2 mt-3 pt-2">
            <button onclick="event.stopPropagation(); openEditPorto('${p.id}')" class="border border-gold-500/20 hover:border-gold-500 text-stone-200 text-[10px] font-bold px-3 py-1 bg-navy-700 transition-all">EDIT</button>
            <button onclick="event.stopPropagation(); hapusPorto('${p.id}')" class="border border-red-500/20 hover:border-red-500 text-red-400 text-[10px] font-bold px-3 py-1 bg-navy-700 transition-all">HAPUS</button>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');

  setTimeout(initScrollReveal, 100);
}

// ==============================
// RENDER ARTIKEL
// ==============================
function renderArtikel(list) {
  const cont = document.getElementById('artikel-container');
  if (!list || list.length === 0) {
    cont.innerHTML = '<p class="text-stone-500 italic text-center py-10">Belum ada berita bulletin yang dirilis.</p>';
    return;
  }

  cont.innerHTML = list.map((a) => `
    <div onclick="openViewArt('${a.id}')" class="glass-dark hover:border-gold-500/30 p-6 flex flex-col gap-4 relative group cursor-pointer border-t border-t-gold-500/20 reveal-up delay-100">
      <div class="space-y-2">
        <span class="text-[9px] uppercase tracking-widest text-gold-500">UPDATE BULANAN</span>
        <h4 class="font-serif text-2xl text-stone-100 font-light group-hover:text-gold-500 transition-colors">${a.title}</h4>
        <p class="text-stone-400 text-xs leading-relaxed line-clamp-3 font-light">${a.content || ''}</p>
      </div>
      ${isAdminMode ? `
        <div class="flex gap-2">
          <button onclick="event.stopPropagation(); openEditArt('${a.id}')" class="border border-gold-500/20 hover:border-gold-500 text-stone-200 text-[10px] font-bold px-3 py-1 bg-navy-700 transition-all">EDIT</button>
          <button onclick="event.stopPropagation(); hapusArt('${a.id}')" class="border border-red-500/20 hover:border-red-500 text-red-400 text-[10px] font-bold px-3 py-1 bg-navy-700 transition-all">HAPUS</button>
        </div>
      ` : ''}
    </div>
  `).join('');

  setTimeout(initScrollReveal, 100);
}

// ==============================
// RENDER PANITIA
// ==============================
function renderPanitia(list) {
  const panitiaCont = document.getElementById('panitia-container');
  if (!list || list.length === 0) {
    panitiaCont.innerHTML = '<p class="text-stone-500 italic text-center py-10 w-full">Belum ada pilar panitia terdaftar.</p>';
    return;
  }

  panitiaCont.innerHTML = list.map((p, i) => `
    <div class="glass-dark p-4 sm:p-6 flex flex-col items-center text-center relative reveal-up animate-fade-in" style="transition-delay: ${i * 50}ms">
      <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 sm:mb-4 overflow-hidden border border-gold-500/20 p-1 flex items-center justify-center">
        ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover rounded-full opacity-80" onerror="this.style.display='none'">` : '<i class="fa-solid fa-user text-2xl text-stone-500"></i>'}
      </div>
      <h5 class="font-serif text-lg text-stone-100 font-light leading-none mb-1.5">${p.nama}</h5>
      <p class="text-[9px] text-gold-500 uppercase tracking-widest font-semibold">${p.jabatan}</p>
      ${p.nowa ? `<a href="https://wa.me/${formatWaNumber(p.nowa)}" target="_blank" class="mt-3.5 border border-gold-500/15 hover:border-gold-500/40 text-stone-400 hover:text-gold-500 text-[9px] uppercase tracking-widest px-3 py-1.5 transition-all"><i class="fa-brands fa-whatsapp mr-1 text-xs"></i> Hubungi</a>` : ''}
      ${isAdminMode ? `
        <div class="absolute top-2 right-2 flex flex-col gap-1 z-10">
          <button onclick="openEditPanitia('${p.id}')" class="w-6 h-6 border border-gold-500/20 text-stone-400 hover:text-stone-100 flex items-center justify-center bg-navy-700 text-xs"><i class="fa-solid fa-pen"></i></button>
          <button onclick="hapusPanitia('${p.id}')" class="w-6 h-6 border border-red-500/20 text-red-400 hover:text-red-500 flex items-center justify-center bg-navy-700 text-xs"><i class="fa-solid fa-trash"></i></button>
        </div>
      ` : ''}
    </div>
  `).join('');

  setTimeout(initScrollReveal, 100);
}

// ==============================
// FORM KONFIRMASI
// ==============================
export async function handleKonfirmasi(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-konfirmasi');
  const orig = btn.innerHTML;
  const fileInput = document.getElementById('k-bukti');

  if (fileInput.files.length === 0) return showToast('Unggah bukti transfer!', 'fa-xmark');
  if (fileInput.files[0].size > MAX_FILE_SIZE) return showToast('File melampaui limit 5MB!', 'fa-xmark');

  btn.innerHTML = 'MEMPROSES...';
  btn.disabled = true;

  const fileData = await getBase64(fileInput.files[0]);
  const res = await api.req({
    action: 'submitKonfirmasi',
    payload: {
      nama: document.getElementById('k-nama').value,
      jumlah: document.getElementById('k-jumlah').value,
      keterangan: document.getElementById('k-ket').value,
      bukti: fileData
    }
  });

  if (res && res.success) {
    showToast('Konfirmasi terkirim! Menunggu verifikasi tim.', 'fa-check');
    document.getElementById('form-konfirmasi').reset();
    document.getElementById('preview-bukti-container').classList.add('hidden');
    refreshAllData();
  } else {
    showToast('Gagal: ' + (res.error || 'Server error'), 'fa-xmark');
  }
  btn.innerHTML = orig;
  btn.disabled = false;
}

// ==============================
// UPDATE INFO (ADMIN)
// ==============================
export async function updateInfo() {
  const btn = document.getElementById('btn-update-info');
  const orig = btn.innerHTML;
  btn.innerHTML = 'MENYIMPAN...';
  btn.disabled = true;

  const komitmenTargetVal = document.getElementById('edit-komitmen-target').value;
  const komitmenRealisasiVal = document.getElementById('edit-komitmen-realisasi').value;

  localStorage.setItem('pisgah_komitmen_target', komitmenTargetVal);
  localStorage.setItem('pisgah_komitmen_realisasi', komitmenRealisasiVal);

  await api.req({
    action: 'updateInfoWebsite',
    target: document.getElementById('edit-target').value,
    terkumpul: document.getElementById('edit-terkumpul').value,
    komitmen: komitmenRealisasiVal,
    komitmen_target: komitmenTargetVal,
    komitmen_realisasi: komitmenRealisasiVal,
    bank: document.getElementById('edit-bank').value,
    norek: document.getElementById('edit-norek').value,
    atasnama: document.getElementById('edit-atasnama').value,
    judul: document.getElementById('edit-judul').value
  });
  showToast('Informasi berhasil diperbarui!', 'fa-check');
  btn.innerHTML = orig;
  btn.disabled = false;
  refreshAllData();
}

// ==============================
// TAMBAH DATA (ADMIN)
// ==============================
export async function tambahPorto() {
  const title = document.getElementById('add-porto-title').value;
  const fileInput = document.getElementById('add-porto-image');
  const desc = document.getElementById('add-porto-desc').value;
  if (!title || fileInput.files.length === 0) return showToast('Isi judul & unggah ilustrasi!', 'fa-xmark');
  const btn = document.getElementById('btn-add-porto');
  btn.innerHTML = 'MENGUNGGAH...';
  btn.disabled = true;
  const fileData = await getBase64(fileInput.files[0]);
  const res = await api.req({ action: 'tambahPortofolio', title, imageData: fileData, desc });
  if (res && res.success) {
    showToast('Tahap pembangunan ditambahkan!', 'fa-check');
    document.getElementById('add-porto-title').value = '';
    document.getElementById('add-porto-image').value = '';
    document.getElementById('add-porto-desc').value = '';
    refreshAllData();
  } else {
    showToast('Gagal: ' + (res.error || ''), 'fa-xmark');
  }
  btn.innerHTML = 'TERBITKAN TAHAP';
  btn.disabled = false;
}

export async function tambahArt() {
  const title = document.getElementById('add-art-title').value;
  const content = document.getElementById('add-art-content').value;
  if (!title || !content) return showToast('Isi judul & buletin!', 'fa-xmark');
  const btn = document.getElementById('btn-add-art');
  btn.innerHTML = 'MEMPROSES...';
  btn.disabled = true;
  const res = await api.req({ action: 'tambahArtikel', title, content });
  if (res && res.success) {
    showToast('Buletin berita diterbitkan!', 'fa-check');
    document.getElementById('add-art-title').value = '';
    document.getElementById('add-art-content').value = '';
    refreshAllData();
  } else {
    showToast('Gagal: ' + (res.error || ''), 'fa-xmark');
  }
  btn.innerHTML = 'TERBITKAN BULETIN';
  btn.disabled = false;
}

export async function tambahPanitia() {
  const nama = document.getElementById('add-panitia-nama').value;
  const jabatan = document.getElementById('add-panitia-jabatan').value;
  const nowa = document.getElementById('add-panitia-nowa').value;
  const fileInput = document.getElementById('add-panitia-image');
  if (!nama || !jabatan) return showToast('Isi nama & jabatan!', 'fa-xmark');
  let fileData = null;
  if (fileInput.files.length > 0) {
    fileData = await getBase64(fileInput.files[0]);
  }
  const btn = document.getElementById('btn-add-panitia');
  btn.innerHTML = 'MENAMBAHKAN...';
  btn.disabled = true;
  const res = await api.req({ action: 'tambahPanitia', nama, jabatan, nowa, imageData: fileData });
  if (res && res.success) {
    showToast('Anggota panitia ditambahkan!', 'fa-check');
    ['add-panitia-nama', 'add-panitia-jabatan', 'add-panitia-nowa', 'add-panitia-image'].forEach(id => {
      document.getElementById(id).value = '';
    });
    refreshAllData();
  } else {
    showToast('Gagal: ' + (res.error || ''), 'fa-xmark');
  }
  btn.innerHTML = 'TAMBAH PILAR PANITIA';
  btn.disabled = false;
}

// ==============================
// HAPUS DATA
// ==============================
export async function hapusPorto(id) {
  const isConfirmed = await customConfirm('Hapus tahapan pembangunan ini?');
  if (!isConfirmed) return;
  await api.req({ action: 'hapusPortofolio', id });
  showToast('Tahapan berhasil dihapus', 'fa-trash');
  refreshAllData();
}

export async function hapusArt(id) {
  const isConfirmed = await customConfirm('Hapus buletin berita ini?');
  if (!isConfirmed) return;
  await api.req({ action: 'hapusArtikel', id });
  showToast('Buletin berhasil dihapus', 'fa-trash');
  refreshAllData();
}

export async function hapusPanitia(id) {
  const isConfirmed = await customConfirm('Hapus panitia pengawas ini?');
  if (!isConfirmed) return;
  await api.req({ action: 'hapusPanitia', id });
  showToast('Panitia berhasil dihapus', 'fa-trash');
  refreshAllData();
}

// ==============================
// EDIT MODAL
// ==============================
function showEditModal() {
  document.getElementById('edit-modal').style.opacity = '1';
  document.getElementById('edit-modal').style.pointerEvents = 'all';
}

export function closeEditModal() {
  document.getElementById('edit-modal').style.opacity = '0';
  document.getElementById('edit-modal').style.pointerEvents = 'none';
  document.getElementById('edit-item-image').value = '';
}

export function openEditPorto(id) {
  const item = globalData.portfolio.find(p => p.id === id);
  if (!item) return;
  document.getElementById('edit-modal-title').textContent = 'Ubah Ilustrasi & Narasi Tahap';
  document.getElementById('edit-id').value = item.id;
  document.getElementById('edit-type').value = 'porto';
  document.getElementById('label-title').textContent = 'Judul Tahapan';
  document.getElementById('edit-item-title').value = item.title;
  document.getElementById('edit-jabatan-container').classList.add('hidden');
  document.getElementById('edit-nowa-container').classList.add('hidden');
  document.getElementById('edit-image-container').classList.remove('hidden');
  document.getElementById('edit-existing-image').value = item.image || '';
  document.getElementById('edit-content-container').classList.remove('hidden');
  document.getElementById('label-content').textContent = 'Narasi Tahapan';
  document.getElementById('edit-item-content').value = item.desc || '';
  showEditModal();
}

export function openEditArt(id) {
  const item = globalData.artikel.find(a => a.id === id);
  if (!item) return;
  document.getElementById('edit-modal-title').textContent = 'Ubah Data Buletin Berita';
  document.getElementById('edit-id').value = item.id;
  document.getElementById('edit-type').value = 'art';
  document.getElementById('label-title').textContent = 'Judul Berita';
  document.getElementById('edit-item-title').value = item.title;
  document.getElementById('edit-jabatan-container').classList.add('hidden');
  document.getElementById('edit-nowa-container').classList.add('hidden');
  document.getElementById('edit-image-container').classList.add('hidden');
  document.getElementById('edit-content-container').classList.remove('hidden');
  document.getElementById('label-content').textContent = 'Isi Berita';
  document.getElementById('edit-item-content').value = item.content || '';
  showEditModal();
}

export function openEditPanitia(id) {
  const item = globalData.panitia.find(p => p.id === id);
  if (!item) return;
  document.getElementById('edit-modal-title').textContent = 'Ubah Data Panitia Pengawas';
  document.getElementById('edit-id').value = item.id;
  document.getElementById('edit-type').value = 'panitia';
  document.getElementById('label-title').textContent = 'Nama Anggota';
  document.getElementById('edit-item-title').value = item.nama;
  document.getElementById('edit-jabatan-container').classList.remove('hidden');
  document.getElementById('edit-item-jabatan').value = item.jabatan;
  document.getElementById('edit-nowa-container').classList.remove('hidden');
  document.getElementById('edit-item-nowa').value = item.nowa || '';
  document.getElementById('edit-image-container').classList.remove('hidden');
  document.getElementById('edit-existing-image').value = item.image || '';
  document.getElementById('edit-content-container').classList.add('hidden');
  showEditModal();
}

export async function submitEdit() {
  const id = document.getElementById('edit-id').value;
  const type = document.getElementById('edit-type').value;
  const title = document.getElementById('edit-item-title').value;
  const content = document.getElementById('edit-item-content').value;
  const jabatan = document.getElementById('edit-item-jabatan').value;
  const nowa = document.getElementById('edit-item-nowa').value;
  const fileInput = document.getElementById('edit-item-image');
  let fileData = null;
  if (fileInput && fileInput.files.length > 0) {
    fileData = await getBase64(fileInput.files[0]);
  }
  const existingImage = document.getElementById('edit-existing-image').value;
  const btn = document.getElementById('btn-submit-edit');
  btn.innerHTML = 'MENYIMPAN...';
  btn.disabled = true;

  let res;
  if (type === 'porto') res = await api.req({ action: 'editPortofolio', id, title, imageData: fileData, existingImage, desc: content });
  else if (type === 'art') res = await api.req({ action: 'editArtikel', id, title, content });
  else if (type === 'panitia') res = await api.req({ action: 'editPanitia', id, nama: title, jabatan, nowa, imageData: fileData, existingImage });

  if (res && res.success) {
    showToast('Modifikasi berhasil disimpan!', 'fa-check');
    closeEditModal();
    refreshAllData();
  } else {
    showToast('Gagal: ' + (res.error || ''), 'fa-xmark');
  }
  btn.innerHTML = 'SIMPAN PERUBAHAN';
  btn.disabled = false;
}

// ==============================
// VIEW MODAL
// ==============================
function showViewModal() {
  document.getElementById('view-modal').style.opacity = '1';
  document.getElementById('view-modal').style.pointerEvents = 'all';
}

export function closeViewModal() {
  document.getElementById('view-modal').style.opacity = '0';
  document.getElementById('view-modal').style.pointerEvents = 'none';
}

export function openViewPorto(id) {
  const item = globalData.portfolio.find(p => p.id === id);
  if (!item) return;
  document.getElementById('view-modal-image').src = item.image;
  document.getElementById('view-modal-image-wrapper').classList.remove('hidden');
  document.getElementById('view-modal-tag').classList.add('hidden');
  document.getElementById('view-modal-title').textContent = item.title;
  document.getElementById('view-modal-desc').textContent = item.desc || '';
  showViewModal();
}

export function openViewArt(id) {
  const item = globalData.artikel.find(a => a.id === id);
  if (!item) return;
  document.getElementById('view-modal-image-wrapper').classList.add('hidden');
  document.getElementById('view-modal-image').src = '';
  document.getElementById('view-modal-tag').classList.remove('hidden');
  document.getElementById('view-modal-title').textContent = item.title;
  document.getElementById('view-modal-desc').textContent = item.content || '';
  showViewModal();
}

// ==============================
// AUTO-SYNC SYSTEM
// ==============================
function startAutoSync() {
  setInterval(async () => {
    const indicator = document.getElementById('sync-indicator');
    const text = document.getElementById('sync-text');

    if (indicator && text) {
      indicator.className = 'w-1.5 h-1.5 bg-amber-400 animate-ping';
      text.textContent = 'SYNCING...';
      text.className = 'text-[9px] font-medium text-amber-400 tracking-[0.2em] uppercase';
    }

    try {
      await refreshAllData();

      if (isAdminMode && document.getElementById('tab-donasi').classList.contains('active')) {
        await loadKonfirmasiAdmin();
      }

      if (indicator && text) {
        indicator.className = 'w-1.5 h-1.5 bg-gold-500 animate-pulse';
        text.textContent = 'CONNECTED';
        text.className = 'text-[9px] font-medium text-stone-400 tracking-[0.2em] uppercase';
      }
    } catch (err) {
      if (indicator && text) {
        indicator.className = 'w-1.5 h-1.5 bg-red-500 animate-pulse';
        text.textContent = 'SYNC ERROR';
        text.className = 'text-[9px] font-medium text-red-500 tracking-[0.2em] uppercase';
      }
    }
  }, 30000);
}

// ==============================
// EXPOSE HANDLERS TO WINDOW (Aturan 5.4 AGENTS.md)
// ==============================
window.customConfirm = customConfirm;
window.showToast = showToast;
window.setJumlah = setJumlah;
window.copyRekening = copyRekening;
window.switchTab = switchTab;
window.openAdminPanel = openAdminPanel;
window.closeAdminModal = closeAdminModal;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.loadKonfirmasiAdmin = loadKonfirmasiAdmin;
window.confirmDonasiAdmin = confirmDonasiAdmin;
window.refreshAllData = refreshAllData;
window.handleKonfirmasi = handleKonfirmasi;
window.updateInfo = updateInfo;
window.tambahPorto = tambahPorto;
window.tambahArt = tambahArt;
window.tambahPanitia = tambahPanitia;
window.hapusPorto = hapusPorto;
window.hapusArt = hapusArt;
window.hapusPanitia = hapusPanitia;
window.closeEditModal = closeEditModal;
window.openEditPorto = openEditPorto;
window.openEditArt = openEditArt;
window.openEditPanitia = openEditPanitia;
window.submitEdit = submitEdit;
window.closeViewModal = closeViewModal;
window.openViewPorto = openViewPorto;
window.openViewArt = openViewArt;

// ==============================
// DOM INITIALIZATION & LISTENERS
// ==============================
function initPembangunanPage() {
  const buktiInput = document.getElementById('k-bukti');
  if (buktiInput) {
    buktiInput.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          document.getElementById('preview-bukti').src = e.target.result;
          document.getElementById('preview-bukti-container').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  let _pembangunanLastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) {
      if (window.scrollY > 60) {
        nav.style.background = 'rgba(11, 26, 48, 0.6)';
        nav.style.backdropFilter = 'blur(16px)';
        nav.style.webkitBackdropFilter = 'blur(16px)';
        nav.style.borderBottomColor = 'rgba(197, 168, 128, 0.15)';
      } else {
        nav.style.background = 'transparent';
        nav.style.backdropFilter = 'none';
        nav.style.webkitBackdropFilter = 'none';
        nav.style.borderBottomColor = 'transparent';
      }
    }

    const currentScrollY = window.scrollY;
    const fab = document.getElementById('floatingSyncBtn');
    if (fab) {
      if (currentScrollY > _pembangunanLastScrollY && currentScrollY > 50) {
        fab.style.transform = 'translateY(100px)';
        fab.style.opacity = '0';
        fab.style.pointerEvents = 'none';
      } else if (currentScrollY < _pembangunanLastScrollY) {
        fab.style.transform = '';
        fab.style.opacity = '1';
        fab.style.pointerEvents = 'auto';
      }
    }
    _pembangunanLastScrollY = currentScrollY;
  }, { passive: true });

  refreshAllData();
  initScrollReveal();
  startAutoSync();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPembangunanPage);
} else {
  initPembangunanPage();
}

