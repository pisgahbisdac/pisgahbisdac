// ==========================================
// UI ENHANCEMENTS, CHARTS & DATEPICKER MODULE
// ==========================================

const fmt = (n) => Math.round(n || 0).toLocaleString('id-ID');
const hasRole = (user, targetRole) => {
  if (!user || !user.role) return false;
  if (typeof window.hasRole === 'function') return window.hasRole(user, targetRole);
  const roles = user.role.split(',').map(r => r.trim());
  return roles.includes(targetRole);
};
// =========================================================
// PREMIUM UI: DATE PICKER & PASSWORD
// =========================================================

export function initPremiumDatePickers() {
  const dateInputs = document.querySelectorAll('.premium-date');
  if (typeof AirDatepicker === 'undefined') return;
  dateInputs.forEach(input => {
    if (input.dataset.datepickerInited) return;
    new AirDatepicker(input, {
      locale: {
        days: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
        daysShort: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
        daysMin: ['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'],
        months: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
        today: 'Hari Ini',
        clear: 'Hapus',
        dateFormat: 'yyyy-MM-dd',
        firstDay: 1
      },
      dateFormat: 'yyyy-MM-dd',
      autoClose: true,
      onSelect({ date, formattedDate, datepicker }) {
        input.value = formattedDate;
        input.dispatchEvent(new Event('change'));
      }
    });
    input.dataset.datepickerInited = "true";
  });
}

export function initPasswordStrength(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);
  if (!input || !container) return;

  const html = `
    <div class="meter-container">
      <div class="meter-label">Kekuatan Sandi</div>
      <div class="meter-text" id="${containerId}-text">Lemah</div>
    </div>
    <div class="progress-bar"><div class="progress-fill" id="${containerId}-fill"></div></div>
    <div class="rules">
      <div class="rule-item" id="${containerId}-rule-8"><i class="fa-solid fa-circle-xmark"></i> 8 Karakter</div>
      <div class="rule-item" id="${containerId}-rule-up"><i class="fa-solid fa-circle-xmark"></i> A-Z</div>
      <div class="rule-item" id="${containerId}-rule-low"><i class="fa-solid fa-circle-xmark"></i> a-z</div>
      <div class="rule-item" id="${containerId}-rule-num"><i class="fa-solid fa-circle-xmark"></i> Angka</div>
      <div class="rule-item" id="${containerId}-rule-sym"><i class="fa-solid fa-circle-xmark"></i> @#$</div>
    </div>
  `;
  container.innerHTML = html;

  input.addEventListener('input', () => {
    const val = input.value;
    let strength = 0;

    const r8 = val.length >= 8;
    const rUp = /[A-Z]/.test(val);
    const rLow = /[a-z]/.test(val);
    const rNum = /[0-9]/.test(val);
    const rSym = /[^A-Za-z0-9]/.test(val);

    const updateRule = (id, isValid) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (isValid) {
        el.classList.add('valid');
        el.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + el.innerText;
        strength += 20;
      } else {
        el.classList.remove('valid');
        el.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> ' + el.innerText;
      }
    };

    updateRule(`${containerId}-rule-8`, r8);
    updateRule(`${containerId}-rule-up`, rUp);
    updateRule(`${containerId}-rule-low`, rLow);
    updateRule(`${containerId}-rule-num`, rNum);
    updateRule(`${containerId}-rule-sym`, rSym);

    const fill = document.getElementById(`${containerId}-fill`);
    const text = document.getElementById(`${containerId}-text`);
    if (!fill || !text) return;

    fill.style.width = strength + '%';

    if (strength <= 40) {
      fill.style.background = 'var(--red-pop)';
      text.textContent = 'Lemah';
      text.style.color = 'var(--red-pop)';
    } else if (strength <= 80) {
      fill.style.background = 'var(--gold)';
      text.textContent = 'Sedang';
      text.style.color = 'var(--gold)';
    } else {
      fill.style.background = 'var(--green-pop)';
      text.textContent = 'Kuat';
      text.style.color = 'var(--green-pop)';
    }
  });
}

/* ========================================================
   MODERN DASHBOARD GREETING, DONUT CHART & SABBATH BULLETIN
   ======================================================== */
export function updateWelcomeGreeting() {
  const currentUser = window.currentUser || null;
  if (!currentUser) return;
  const nameStr = currentUser.nama || currentUser.username || 'Pengguna';
  const roleStr = currentUser.role || 'Publik';

  const greetTitle = document.getElementById('dashGreetingTitle');
  const greetName = document.getElementById('dashGreetingName');
  const roleBadge = document.getElementById('dashUserRoleBadge');
  const datePill = document.getElementById('dashTodayDate');
  const qaContainer = document.getElementById('dashQuickActions');

  if (greetName) greetName.textContent = nameStr;

  const now = new Date();
  const hour = now.getHours();
  let timeGreeting = 'Selamat Datang';
  if (hour >= 4 && hour < 11) timeGreeting = 'Selamat Pagi';
  else if (hour >= 11 && hour < 15) timeGreeting = 'Selamat Siang';
  else if (hour >= 15 && hour < 18) timeGreeting = 'Selamat Sore';
  else timeGreeting = 'Selamat Malam';

  if (greetTitle) {
    greetTitle.innerHTML = `${timeGreeting}, <span id="dashGreetingName" style="color:var(--primary, #d4af37);">${nameStr}</span>!`;
  }

  if (roleBadge) {
    roleBadge.textContent = roleStr;
    if (roleStr === 'Admin') {
      roleBadge.style.color = '#c084fc';
      roleBadge.style.borderColor = 'rgba(192, 132, 252, 0.4)';
      roleBadge.style.background = 'rgba(192, 132, 252, 0.12)';
    } else if (roleStr === 'Bendahara') {
      roleBadge.style.color = '#4ade80';
      roleBadge.style.borderColor = 'rgba(74, 222, 128, 0.4)';
      roleBadge.style.background = 'rgba(74, 222, 128, 0.12)';
    } else if (roleStr === 'Pendeta' || roleStr === 'Ketua Jemaat') {
      roleBadge.style.color = '#60a5fa';
      roleBadge.style.borderColor = 'rgba(96, 165, 250, 0.4)';
      roleBadge.style.background = 'rgba(96, 165, 250, 0.12)';
    } else if (roleStr === 'Publik') {
      roleBadge.style.color = '#cbd5e1';
      roleBadge.style.borderColor = 'rgba(203, 213, 225, 0.3)';
      roleBadge.style.background = 'rgba(255, 255, 255, 0.08)';
    }
  }

  if (datePill) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabat'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    datePill.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  if (qaContainer && hasRole(currentUser, 'Publik')) {
    qaContainer.innerHTML = `
      <button type="button" class="quick-action-btn qa-transfer" onclick="document.getElementById('dashSearchCard')?.scrollIntoView({behavior:'smooth'})">
        <div class="qa-icon-wrap" style="background:rgba(59,130,246,0.15); color:#3b82f6;">
          <svg class="lucide lucide-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <div class="qa-text-wrap">
          <span class="qa-title">Cek Kuitansi</span>
          <span class="qa-desc">Verifikasi Persembahan</span>
        </div>
      </button>
      <button type="button" class="quick-action-btn qa-bulletin" onclick="openSabbathBulletinModal()">
        <div class="qa-icon-wrap" style="background:rgba(212,175,55,0.15); color:#ffd166;">
          <svg class="lucide lucide-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="qa-text-wrap">
          <span class="qa-title">Buletin Sabat</span>
          <span class="qa-desc">Warta Sabat Jemaat</span>
        </div>
      </button>
      <button type="button" class="quick-action-btn qa-income" onclick="window.location.href='https://pisgahbisdac.app/pembangunan.html'">
        <div class="qa-icon-wrap" style="background:rgba(16,185,129,0.15); color:#10b981;">
          <svg class="lucide lucide-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div class="qa-text-wrap">
          <span class="qa-title">Proyek Rumah Tuhan</span>
          <span class="qa-desc">Progres Pembangunan</span>
        </div>
      </button>
      <button type="button" class="quick-action-btn qa-expense" onclick="window.location.href='index.html'">
        <div class="qa-icon-wrap" style="background:rgba(239,68,68,0.15); color:#ef4444;">
          <svg class="lucide lucide-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        </div>
        <div class="qa-text-wrap">
          <span class="qa-title">Halaman Utama</span>
          <span class="qa-desc">Kembali ke Beranda</span>
        </div>
      </button>
    `;
  }
}

let deptDonutChartInstance = null;

export function updateDepartmentDonutChart(expenses) {
  const cachedExpense = window.cachedExpense || [];
  const canvas = document.getElementById('dashDeptDonutChart');
  const legendEl = document.getElementById('dashDeptDonutLegend');
  if (!canvas || typeof Chart === 'undefined') return;

  const validExp = (expenses || []).filter(x => x.department !== 'Mutasi Kas / Setor Bank');
  const catOutBreak = {};
  validExp.forEach(x => {
    const dept = x.department || 'Lain-lain';
    catOutBreak[dept] = (catOutBreak[dept] || 0) + (parseFloat(x.amount) || 0);
  });

  const entries = Object.entries(catOutBreak).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    if (deptDonutChartInstance) {
      deptDonutChartInstance.destroy();
      deptDonutChartInstance = null;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (legendEl) legendEl.innerHTML = '<div style="text-align:center; padding: 12px; color: var(--text3);">Belum ada data pengeluaran departemen pada periode ini.</div>';
    return;
  }

  let labels = [];
  let data = [];
  let otherSum = 0;

  entries.forEach((entry, idx) => {
    if (idx < 5) {
      labels.push(entry[0]);
      data.push(entry[1]);
    } else {
      otherSum += entry[1];
    }
  });

  if (otherSum > 0) {
    labels.push('Lainnya');
    data.push(otherSum);
  }

  const colors = [
    '#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#8338ec', '#3a86ff'
  ];

  if (deptDonutChartInstance) {
    deptDonutChartInstance.destroy();
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  deptDonutChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: isDark ? '#1e293b' : '#ffffff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${fmt(val)} (${pct}%)`;
            }
          }
        }
      },
      cutout: '66%'
    }
  });

  if (legendEl) {
    const totalExp = data.reduce((a, b) => a + b, 0);
    legendEl.innerHTML = labels.map((l, idx) => {
      const val = data[idx];
      const pct = totalExp > 0 ? ((val / totalExp) * 100).toFixed(1) : 0;
      const col = colors[idx % colors.length];
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px; font-size: 11px; cursor: pointer;"
             onclick="openDashboardDetail('expense_cat', '${l.replace(/'/g, "\\'")}')">
          <div style="display:flex; align-items:center; gap: 6px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${col}; flex-shrink: 0;"></span>
            <span style="color: var(--text); font-weight: 600;">${l}</span>
          </div>
          <div style="flex-shrink: 0; font-weight: 700; color: var(--text2);">
            ${fmt(val)} <span style="color: var(--text3); font-size: 10px;">(${pct}%)</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Bind to window for HTML inline access
window.initPremiumDatePickers = initPremiumDatePickers;
window.initPasswordStrength = initPasswordStrength;
window.updateWelcomeGreeting = updateWelcomeGreeting;
window.updateDepartmentDonutChart = updateDepartmentDonutChart;
