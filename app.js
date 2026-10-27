/**
 * DAILYREMINDER — Pengingat Jadwal dan Tugas Harian
 * Didesain khusus untuk siswa SMK
 * File: app.js
 */

(function () {
  'use strict';

  // ==========================================
  // 1. STORAGE KEYS & INITIAL STATE
  // ==========================================
  const KEYS = {
    USER: 'dailyreminder_user',
    SCHEDULES: 'dailyreminder_schedules',
    TASKS: 'dailyreminder_tasks',
    TRIGGERED: 'dailyreminder_triggered_reminders',
    NOTIF_ALLOWED: 'dailyreminder_notif_permission'
  };

  // Helper date strings (today, tomorrow, day after tomorrow)
  const today = new Date();
  const formatIsoDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatIsoDate(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatIsoDate(tomorrow);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const dayAfterTomorrowStr = formatIsoDate(dayAfterTomorrow);

  // Default User (sesuai screenshot: Mieoeoeo)
  const DEFAULT_USER = {
    username: 'mieoeoeo',
    name: 'Mieoeoeo',
    school: 'SMK Negeri 1 (PPLG)',
    email: 'mieoeoeo@smk.belajar.id',
    isLoggedIn: true
  };

  // Default Schedules (sesuai screenshot 2 & 3)
  const DEFAULT_SCHEDULES = [
    {
      id: 'sch_1',
      judul: 'Upacara Bendera & Pembiasaan Pagi',
      tanggal: todayStr,
      waktu: '07:00',
      kategori: 'Pelajaran',
      catatan: 'Kenakan seragam putih abu-abu lengkap dengan dasi dan topi.',
      pengingat: '15 Menit Sebelumnya',
      createdAt: Date.now() - 300000
    },
    {
      id: 'sch_2',
      judul: 'Praktikum Pemrograman Web (Lab Komputer 2)',
      tanggal: todayStr,
      waktu: '08:30',
      kategori: 'Pelajaran',
      catatan: 'Materi pembuatan antarmuka web interaktif HTML, CSS, JS.',
      pengingat: '30 Menit Sebelumnya',
      createdAt: Date.now() - 200000
    },
    {
      id: 'sch_3',
      judul: 'Istirahat & Sholat Dzuhur Berjamaah',
      tanggal: todayStr,
      waktu: '12:00',
      kategori: 'Pribadi',
      catatan: 'Di musholla sekolah bersama teman sekelas.',
      pengingat: '10 Menit Sebelumnya',
      createdAt: Date.now() - 100000
    },
    {
      id: 'sch_4',
      judul: 'Bimbingan Projek Kreatif & Kewirausahaan',
      tanggal: tomorrowStr,
      waktu: '13:30',
      kategori: 'Pekerjaan',
      catatan: 'Konsultasi ide prototipe aplikasi kasir sederhana.',
      pengingat: '15 Menit Sebelumnya',
      createdAt: Date.now()
    }
  ];

  // Default Tasks (sesuai screenshot 2 & 4)
  const DEFAULT_TASKS = [
    {
      id: 'tsk_1',
      judul: 'Mengerjakan Latihan CSS Flexbox & Grid',
      tanggal: todayStr,
      waktu: '15:00',
      kategori: 'Pelajaran',
      catatan: 'Kumpulkan tangkapan layar hasil latihan di Google Classroom.',
      pengingat: '15 Menit Sebelumnya',
      selesai: true,
      createdAt: Date.now() - 400000
    },
    {
      id: 'tsk_2',
      judul: 'Membaca Dokumentasi JavaScript DOM Event',
      tanggal: todayStr,
      waktu: '19:30',
      kategori: 'Pelajaran',
      catatan: 'Persiapan kuis mingguan besok lusa.',
      pengingat: '30 Menit Sebelumnya',
      selesai: true,
      createdAt: Date.now() - 300000
    },
    {
      id: 'tsk_3',
      judul: 'Membeli Buku Tulis Berpetak untuk Matematika',
      tanggal: tomorrowStr,
      waktu: '16:00',
      kategori: 'Pribadi',
      catatan: 'Beli di fotokopi dekat gerbang sekolah.',
      pengingat: 'Tepat Waktu',
      selesai: true,
      createdAt: Date.now() - 200000
    },
    {
      id: 'tsk_4',
      judul: 'Membuat Laporan Kunjungan Industri',
      tanggal: dayAfterTomorrowStr,
      waktu: '20:00',
      kategori: 'Pekerjaan',
      catatan: 'Format PDF maksimal 10 halaman.',
      pengingat: '1 Hari Sebelumnya',
      selesai: true,
      createdAt: Date.now() - 100000
    }
  ];

  // Application State
  let state = {
    currentUser: null,
    schedules: [],
    tasks: [],
    activeTab: 'beranda',
    filterJadwalCategory: 'Semua',
    filterJadwalSearch: '',
    filterTugasStatus: 'Semua',
    filterTugasCategory: 'Semua',
    filterTugasSearch: '',
    pendingDelete: null // { type: 'jadwal'|'tugas', id: string, title: string }
  };

  // ==========================================
  // 2. STORAGE MANAGEMENT
  // ==========================================
  function loadFromStorage() {
    try {
      const storedUser = localStorage.getItem(KEYS.USER);
      state.currentUser = storedUser ? JSON.parse(storedUser) : DEFAULT_USER;

      const storedSchedules = localStorage.getItem(KEYS.SCHEDULES);
      state.schedules = storedSchedules ? JSON.parse(storedSchedules) : DEFAULT_SCHEDULES;

      const storedTasks = localStorage.getItem(KEYS.TASKS);
      state.tasks = storedTasks ? JSON.parse(storedTasks) : DEFAULT_TASKS;

      // Jika belum pernah tersimpan, simpan default sekarang
      if (!storedSchedules) saveSchedules();
      if (!storedTasks) saveTasks();
      if (!storedUser) saveUser();
    } catch (e) {
      console.error('Gagal membaca localStorage, menggunakan state memori.', e);
      state.currentUser = DEFAULT_USER;
      state.schedules = [...DEFAULT_SCHEDULES];
      state.tasks = [...DEFAULT_TASKS];
    }
  }

  function saveUser() {
    try {
      localStorage.setItem(KEYS.USER, JSON.stringify(state.currentUser));
    } catch (e) {
      console.warn('Gagal menyimpan user:', e);
    }
  }

  function saveSchedules() {
    try {
      localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(state.schedules));
    } catch (e) {
      console.warn('Gagal menyimpan jadwal:', e);
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(state.tasks));
    } catch (e) {
      console.warn('Gagal menyimpan tugas:', e);
    }
  }

  // ==========================================
  // 3. AUDIO & NOTIFICATION SYSTEM
  // ==========================================
  function playReminderChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // Nada 1: D5 (587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Nada 2: A5 (880.00 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.14);
      gain2.gain.setValueAtTime(0.35, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 1.1);
    } catch (err) {
      console.warn('Web Audio chime gagal diputar:', err);
    }
  }

  function checkNotificationPermission() {
    const statusText = document.getElementById('notifStatusText');
    const reqBtn = document.getElementById('btnReqNotification');
    if (!statusText || !reqBtn) return;

    if (!('Notification' in window)) {
      statusText.textContent = 'Status: Browser Anda tidak mendukung Web Notifications';
      reqBtn.disabled = true;
      reqBtn.textContent = 'Tidak Didukung';
      return;
    }

    if (Notification.permission === 'granted') {
      statusText.innerHTML = '<span style="color:#059669; font-weight:700;">Status: Diizinkan (Aktif) ✅</span>';
      reqBtn.textContent = 'Izin Sudah Aktif';
      reqBtn.disabled = true;
    } else if (Notification.permission === 'denied') {
      statusText.innerHTML = '<span style="color:#dc2626; font-weight:700;">Status: Diblokir oleh browser ⚠️</span>';
      reqBtn.textContent = 'Buka di Pengaturan Browser';
      reqBtn.disabled = true;
    } else {
      statusText.textContent = 'Status: Belum Diizinkan (Klik Aktifkan)';
      reqBtn.textContent = 'Aktifkan Izin';
      reqBtn.disabled = false;
    }
  }

  function requestNotificationPermission() {
    if (!('Notification' in window)) {
      showToast('Browser Anda tidak mendukung Web Notification.', 'danger');
      return;
    }

    Notification.requestPermission().then((permission) => {
      checkNotificationPermission();
      if (permission === 'granted') {
        showToast('Izin notifikasi berhasil diaktifkan! 🔔', 'success');
        playReminderChime();
        try {
          new Notification('DailyReminder Siswa SMK', {
            body: 'Pengingat jadwal dan tugas harian Anda siap aktif!',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23dc2626"><circle cx="12" cy="12" r="10"/></svg>'
          });
        } catch (e) {
          console.warn('Gagal memicu test notification:', e);
        }
      } else {
        showToast('Izin notifikasi tidak diberikan.', 'danger');
      }
    });
  }

  function getOffsetMinutes(pengingatStr) {
    switch (pengingatStr) {
      case 'Tepat Waktu': return 0;
      case '5 Menit Sebelumnya': return 5;
      case '10 Menit Sebelumnya': return 10;
      case '15 Menit Sebelumnya': return 15;
      case '30 Menit Sebelumnya': return 30;
      case '1 Jam Sebelumnya': return 60;
      case '1 Hari Sebelumnya': return 1440;
      default: return null;
    }
  }

  function runReminderEngine() {
    const now = new Date();
    const currentTimestamp = now.getTime();

    let triggeredList = [];
    try {
      triggeredList = JSON.parse(localStorage.getItem(KEYS.TRIGGERED) || '[]');
    } catch (e) {
      triggeredList = [];
    }

    const allItems = [
      ...state.schedules.map(s => ({ ...s, itemCategory: 'jadwal' })),
      ...state.tasks.map(t => ({ ...t, itemCategory: 'tugas' }))
    ];

    let pendingRemindersCount = 0;

    allItems.forEach(item => {
      if (!item.pengingat || item.pengingat === 'Tidak Ada Pengingat') return;

      const offset = getOffsetMinutes(item.pengingat);
      if (offset === null) return;

      const [year, month, day] = item.tanggal.split('-').map(Number);
      const [hour, min] = item.waktu.split(':').map(Number);
      const targetDate = new Date(year, month - 1, day, hour, min, 0);
      const targetTime = targetDate.getTime();

      const reminderTime = targetTime - (offset * 60 * 1000);
      const diffMs = currentTimestamp - reminderTime;

      // Jika waktu sekarang berada di rentang 0 sampai 5 menit setelah waktu reminder
      if (diffMs >= 0 && diffMs <= 300000) {
        if (!triggeredList.includes(item.id)) {
          // Trigger reminder!
          triggeredList.push(item.id);
          localStorage.setItem(KEYS.TRIGGERED, JSON.stringify(triggeredList));

          playReminderChime();

          const message = `[${item.itemCategory === 'jadwal' ? 'Jadwal' : 'Tugas'}] "${item.judul}" (${item.pengingat})`;
          showToast(`🔔 Pengingat: ${message}`, 'info');

          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('DailyReminder — Pengingat', {
                body: `${item.judul}\nWaktu: ${item.waktu} WIB (${item.pengingat})`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23dc2626"><circle cx="12" cy="12" r="10"/></svg>'
              });
            } catch (err) {
              console.warn(err);
            }
          }
        }
      }

      // Hitung pengingat untuk hari ini
      if (item.tanggal === todayStr) {
        pendingRemindersCount++;
      }
    });

    // Perbarui badge notifikasi di navbar
    const badge = document.getElementById('notifyBadge');
    if (badge) {
      if (pendingRemindersCount > 0) {
        badge.textContent = pendingRemindersCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  // ==========================================
  // 4. DATE, TIME & GREETING HELPERS
  // ==========================================
  const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const INDO_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  function formatIndonesianDate(dateObj) {
    const dayName = INDO_DAYS[dateObj.getDay()];
    const dateNum = dateObj.getDate();
    const monthName = INDO_MONTHS[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  }

  function formatIndonesianDateStr(isoDateStr) {
    if (!isoDateStr) return '';
    const [y, m, d] = isoDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return formatIndonesianDate(dateObj);
  }

  function getIndoGreeting(name) {
    const hour = new Date().getHours();
    let salam = 'Selamat Datang';
    if (hour >= 4 && hour < 11) {
      salam = 'Selamat Pagi';
    } else if (hour >= 11 && hour < 15) {
      salam = 'Selamat Siang';
    } else if (hour >= 15 && hour < 18) {
      salam = 'Selamat Sore';
    } else {
      salam = 'Selamat Malam';
    }
    return `${salam}, ${name || 'Siswa'}! 👋`;
  }

  // ==========================================
  // 5. TOAST NOTIFICATION UTILITY
  // ==========================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg style="width:18px;height:18px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg style="width:18px;height:18px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg style="width:18px;height:18px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================
  // 6. RENDER HELPERS: BADGES & ICONS
  // ==========================================
  function renderCategoryBadge(cat) {
    const c = (cat || 'Lainnya').toLowerCase();
    let badgeClass = 'badge-lainnya';
    if (c === 'pelajaran') badgeClass = 'badge-pelajaran';
    else if (c === 'pribadi') badgeClass = 'badge-pribadi';
    else if (c === 'pekerjaan') badgeClass = 'badge-pekerjaan';

    return `<span class="badge ${badgeClass}">${escapeHtml(cat || 'Lainnya')}</span>`;
  }

  function renderReminderBadge(pengingat) {
    if (!pengingat || pengingat === 'Tidak Ada Pengingat') return '';
    return `
      <span class="badge badge-reminder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        ${escapeHtml(pengingat)}
      </span>
    `;
  }

  // ==========================================
  // 7. RENDER BERANDA (SKETSA 2)
  // ==========================================
  function renderBeranda() {
    const greetingEl = document.getElementById('berandaGreeting');
    const dateEl = document.getElementById('berandaDate');

    if (greetingEl) {
      greetingEl.textContent = getIndoGreeting(state.currentUser ? state.currentUser.name : 'Siswa');
    }
    if (dateEl) {
      dateEl.textContent = formatIndonesianDate(new Date());
    }

    // Jadwal hari ini
    const todaySchedules = state.schedules.filter(s => s.tanggal === todayStr);
    todaySchedules.sort((a, b) => a.waktu.localeCompare(b.waktu));

    // Tugas
    const todayTasks = state.tasks.filter(t => t.tanggal === todayStr);
    const uncompletedTasks = state.tasks.filter(t => !t.selesai);
    const completedTasks = state.tasks.filter(t => t.selesai);

    // Update Stat Cards
    const statJadwal = document.getElementById('statJadwalHariIni');
    const statPending = document.getElementById('statTugasBelumSelesai');
    const statDone = document.getElementById('statTugasSelesai');

    if (statJadwal) statJadwal.textContent = todaySchedules.length;
    if (statPending) statPending.textContent = uncompletedTasks.length;
    if (statDone) statDone.textContent = completedTasks.length;

    // Badges header
    const badgeJadwal = document.getElementById('badgeCountJadwalHariIni');
    const badgeTugas = document.getElementById('badgeCountTugasHariIni');
    if (badgeJadwal) badgeJadwal.textContent = todaySchedules.length;
    if (badgeTugas) badgeTugas.textContent = todayTasks.length;

    // List Beranda Jadwal
    const listJadwalEl = document.getElementById('listBerandaJadwal');
    if (listJadwalEl) {
      if (todaySchedules.length === 0) {
        listJadwalEl.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <h4>Belum ada jadwal hari ini</h4>
            <p>Klik tombol <strong>+ Tambah</strong> untuk menambahkan kegiatan baru.</p>
          </div>
        `;
      } else {
        listJadwalEl.innerHTML = todaySchedules.map(sch => `
          <div class="item-card schedule-type" data-id="${sch.id}">
            <div class="item-body">
              <div class="item-meta-time">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Pukul ${escapeHtml(sch.waktu)} WIB</span>
              </div>
              <h3 class="item-title">${escapeHtml(sch.judul)}</h3>
              ${sch.catatan ? `<p class="item-note">${escapeHtml(sch.catatan)}</p>` : ''}
              <div class="item-badges">
                ${renderCategoryBadge(sch.kategori)}
                ${renderReminderBadge(sch.pengingat)}
              </div>
            </div>
            <div class="item-actions">
              <button type="button" class="btn-item-action btn-edit-sch" data-id="${sch.id}" title="Ubah Jadwal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button type="button" class="btn-item-action btn-del-sch" data-id="${sch.id}" title="Hapus Jadwal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `).join('');
      }
    }

    // List Beranda Tugas (menampilkan tugas hari ini)
    const listTugasEl = document.getElementById('listBerandaTugas');
    if (listTugasEl) {
      if (todayTasks.length === 0) {
        listTugasEl.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <h4>Tidak ada tugas untuk hari ini</h4>
            <p>Hebat! Semua tugas hari ini sudah terselesaikan.</p>
          </div>
        `;
      } else {
        listTugasEl.innerHTML = todayTasks.map(tsk => `
          <div class="item-card task-type ${tsk.selesai ? 'task-done' : ''}" data-id="${tsk.id}">
            <div class="task-checkbox-wrap">
              <div class="custom-checkbox ${tsk.selesai ? 'checked' : ''} btn-toggle-task" data-id="${tsk.id}" title="Tandai selesai">
                ${tsk.selesai ? `
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ` : ''}
              </div>
            </div>
            <div class="item-body">
              <h3 class="item-title">${escapeHtml(tsk.judul)}</h3>
              <div class="item-meta-time" style="color: #64748b; font-weight: 500;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Tenggat: ${escapeHtml(tsk.waktu)} WIB</span>
              </div>
              ${tsk.catatan ? `<p class="item-note">${escapeHtml(tsk.catatan)}</p>` : ''}
              <div class="item-badges">
                ${renderCategoryBadge(tsk.kategori)}
                ${renderReminderBadge(tsk.pengingat)}
                <span class="badge ${tsk.selesai ? 'badge-status-done' : 'badge-status-pending'}">
                  ${tsk.selesai ? '✓ Selesai' : '⏳ Belum Selesai'}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <button type="button" class="btn-item-action btn-edit-tsk" data-id="${tsk.id}" title="Ubah Tugas">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button type="button" class="btn-item-action btn-del-tsk" data-id="${tsk.id}" title="Hapus Tugas">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // ==========================================
  // 8. RENDER JADWAL VIEW (SKETSA 3 / HALAMAN 2)
  // ==========================================
  function renderJadwal() {
    const listEl = document.getElementById('listSemuaJadwal');
    if (!listEl) return;

    let items = [...state.schedules];

    // Filter kategori
    if (state.filterJadwalCategory && state.filterJadwalCategory !== 'Semua') {
      items = items.filter(s => s.kategori === state.filterJadwalCategory);
    }

    // Filter pencarian
    if (state.filterJadwalSearch) {
      const q = state.filterJadwalSearch.toLowerCase();
      items = items.filter(s => 
        (s.judul && s.judul.toLowerCase().includes(q)) || 
        (s.catatan && s.catatan.toLowerCase().includes(q))
      );
    }

    // Urutkan berdasarkan tanggal & waktu
    items.sort((a, b) => {
      const dateCompare = a.tanggal.localeCompare(b.tanggal);
      if (dateCompare !== 0) return dateCompare;
      return a.waktu.localeCompare(b.waktu);
    });

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h4>Tidak ada jadwal yang cocok</h4>
          <p>Coba ubah kata kunci pencarian atau ganti filter kategori.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items.map(sch => `
      <div class="item-card schedule-type" data-id="${sch.id}">
        <div class="item-body">
          <div class="item-meta-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Pukul ${escapeHtml(sch.waktu)} WIB</span>
            <span class="item-meta-date">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              ${formatIndonesianDateStr(sch.tanggal)}
            </span>
          </div>
          <h3 class="item-title">${escapeHtml(sch.judul)}</h3>
          ${sch.catatan ? `<p class="item-note">${escapeHtml(sch.catatan)}</p>` : ''}
          <div class="item-badges">
            ${renderCategoryBadge(sch.kategori)}
            ${renderReminderBadge(sch.pengingat)}
          </div>
        </div>
        <div class="item-actions">
          <button type="button" class="btn-item-action btn-edit-sch" data-id="${sch.id}" title="Ubah Jadwal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="btn-item-action btn-del-sch" data-id="${sch.id}" title="Hapus Jadwal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  // ==========================================
  // 9. RENDER TUGAS VIEW (SKETSA 4 / HALAMAN 3)
  // ==========================================
  function renderTugas() {
    const listEl = document.getElementById('listSemuaTugas');
    if (!listEl) return;

    let items = [...state.tasks];

    // Filter status
    if (state.filterTugasStatus === 'Belum Selesai') {
      items = items.filter(t => !t.selesai);
    } else if (state.filterTugasStatus === 'Selesai') {
      items = items.filter(t => t.selesai);
    }

    // Filter kategori
    if (state.filterTugasCategory && state.filterTugasCategory !== 'Semua') {
      items = items.filter(t => t.kategori === state.filterTugasCategory);
    }

    // Filter pencarian
    if (state.filterTugasSearch) {
      const q = state.filterTugasSearch.toLowerCase();
      items = items.filter(t => 
        (t.judul && t.judul.toLowerCase().includes(q)) || 
        (t.catatan && t.catatan.toLowerCase().includes(q))
      );
    }

    // Urutkan berdasarkan tanggal & waktu
    items.sort((a, b) => {
      if (a.selesai !== b.selesai) return a.selesai ? 1 : -1;
      const dateCompare = a.tanggal.localeCompare(b.tanggal);
      if (dateCompare !== 0) return dateCompare;
      return a.waktu.localeCompare(b.waktu);
    });

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <h4>Tidak ada tugas yang cocok</h4>
          <p>Coba ubah kata kunci pencarian atau sesuaikan status dan filter kategori.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items.map(tsk => `
      <div class="item-card task-type ${tsk.selesai ? 'task-done' : ''}" data-id="${tsk.id}">
        <div class="task-checkbox-wrap">
          <div class="custom-checkbox ${tsk.selesai ? 'checked' : ''} btn-toggle-task" data-id="${tsk.id}" title="Tandai selesai">
            ${tsk.selesai ? `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ` : ''}
          </div>
        </div>
        <div class="item-body">
          <h3 class="item-title">${escapeHtml(tsk.judul)}</h3>
          <div class="item-meta-time" style="color: #64748b; font-weight: 500;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Tenggat: ${escapeHtml(tsk.waktu)} WIB</span>
            <span class="item-meta-date">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              ${formatIndonesianDateStr(tsk.tanggal)}
            </span>
          </div>
          ${tsk.catatan ? `<p class="item-note">${escapeHtml(tsk.catatan)}</p>` : ''}
          <div class="item-badges">
            ${renderCategoryBadge(tsk.kategori)}
            ${renderReminderBadge(tsk.pengingat)}
            <span class="badge ${tsk.selesai ? 'badge-status-done' : 'badge-status-pending'}">
              ${tsk.selesai ? '✓ Selesai' : '⏳ Belum Selesai'}
            </span>
          </div>
        </div>
        <div class="item-actions">
          <button type="button" class="btn-item-action btn-edit-tsk" data-id="${tsk.id}" title="Ubah Tugas">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="btn-item-action btn-del-tsk" data-id="${tsk.id}" title="Hapus Tugas">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  // ==========================================
  // 10. RENDER PROFIL & PENGATURAN (SKETSA 5)
  // ==========================================
  function renderProfil() {
    const avatar = document.getElementById('profileAvatar');
    const nameEl = document.getElementById('profileName');
    const schoolEl = document.getElementById('profileSchool');
    const emailEl = document.getElementById('profileEmail');

    const user = state.currentUser || DEFAULT_USER;
    if (avatar) {
      avatar.textContent = (user.name ? user.name.charAt(0) : 'S').toUpperCase();
    }
    if (nameEl) nameEl.textContent = user.name || 'Siswa SMK';
    if (schoolEl) schoolEl.textContent = user.school || 'SMK Negeri 1';
    if (emailEl) emailEl.textContent = user.email || 'siswa@smk.belajar.id';

    checkNotificationPermission();
  }

  // ==========================================
  // 11. NAVIGATION TAB SWITCHER
  // ==========================================
  function switchTab(tabName) {
    state.activeTab = tabName;

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabName}`);
    });

    // Render contents for active tab
    if (tabName === 'beranda') renderBeranda();
    else if (tabName === 'jadwal') renderJadwal();
    else if (tabName === 'tugas') renderTugas();
    else if (tabName === 'profil') renderProfil();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // 12. MODAL FORM: TAMBAH & EDIT JADWAL/TUGAS
  // ==========================================
  function openItemModal(type = 'jadwal', editData = null) {
    const modal = document.getElementById('itemModal');
    const title = document.getElementById('modalTitle');
    const typeInput = document.getElementById('itemType');
    const idInput = document.getElementById('itemId');
    const judulInput = document.getElementById('itemJudul');
    const tanggalInput = document.getElementById('itemTanggal');
    const waktuInput = document.getElementById('itemWaktu');
    const kategoriSelect = document.getElementById('itemKategori');
    const catatanInput = document.getElementById('itemCatatan');
    const pengingatSelect = document.getElementById('itemPengingat');
    const labelJudul = document.getElementById('labelItemJudul');
    const labelWaktu = document.getElementById('labelItemWaktu');
    const switcher = document.getElementById('modalTypeSwitcher');

    if (!modal) return;

    if (editData) {
      title.textContent = type === 'jadwal' ? 'Ubah Jadwal Kegiatan' : 'Ubah Tugas Harian';
      switcher.classList.add('hidden'); // Sembunyikan switch tipe saat edit
      idInput.value = editData.id;
      typeInput.value = type;
      judulInput.value = editData.judul || '';
      tanggalInput.value = editData.tanggal || todayStr;
      waktuInput.value = editData.waktu || '08:00';
      kategoriSelect.value = editData.kategori || 'Pelajaran';
      catatanInput.value = editData.catatan || '';
      pengingatSelect.value = editData.pengingat || '15 Menit Sebelumnya';
    } else {
      title.textContent = 'Tambah Data Baru';
      switcher.classList.remove('hidden');
      idInput.value = '';
      typeInput.value = type;
      judulInput.value = '';
      tanggalInput.value = todayStr;
      
      // Default time: next hour
      const nextHour = String(new Date().getHours() + 1).padStart(2, '0');
      waktuInput.value = `${nextHour}:00`;
      
      kategoriSelect.value = 'Pelajaran';
      catatanInput.value = '';
      pengingatSelect.value = '15 Menit Sebelumnya';
    }

    // Update labels and active switcher state
    setItemModalType(type);

    modal.classList.remove('hidden');
    judulInput.focus();
  }

  function setItemModalType(type) {
    const typeInput = document.getElementById('itemType');
    const labelJudul = document.getElementById('labelItemJudul');
    const labelWaktu = document.getElementById('labelItemWaktu');
    const switcherButtons = document.querySelectorAll('.item-type-switcher .type-btn');

    typeInput.value = type;
    if (type === 'jadwal') {
      labelJudul.innerHTML = 'Nama Kegiatan / Pelajaran <span class="required">*</span>';
      labelWaktu.innerHTML = 'Waktu Mulai <span class="required">*</span>';
      document.getElementById('itemJudul').placeholder = 'Contoh: Praktikum Pemrograman Web';
    } else {
      labelJudul.innerHTML = 'Nama Tugas / PR / Proyek <span class="required">*</span>';
      labelWaktu.innerHTML = 'Waktu Tenggat (Deadline) <span class="required">*</span>';
      document.getElementById('itemJudul').placeholder = 'Contoh: Mengerjakan Latihan CSS Flexbox & Grid';
    }

    switcherButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
  }

  function closeItemModal() {
    const modal = document.getElementById('itemModal');
    if (modal) modal.classList.add('hidden');
  }

  function handleItemFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('itemId').value;
    const type = document.getElementById('itemType').value; // 'jadwal' or 'tugas'
    const judul = document.getElementById('itemJudul').value.trim();
    const tanggal = document.getElementById('itemTanggal').value;
    const waktu = document.getElementById('itemWaktu').value;
    const kategori = document.getElementById('itemKategori').value;
    const catatan = document.getElementById('itemCatatan').value.trim();
    const pengingat = document.getElementById('itemPengingat').value;

    if (!judul || !tanggal || !waktu) {
      showToast('Mohon lengkapi judul, tanggal, dan waktu.', 'danger');
      return;
    }

    if (id) {
      // EDIT MODE
      if (type === 'jadwal') {
        const index = state.schedules.findIndex(s => s.id === id);
        if (index !== -1) {
          state.schedules[index] = {
            ...state.schedules[index],
            judul, tanggal, waktu, kategori, catatan, pengingat
          };
          saveSchedules();
          showToast('✅ Jadwal berhasil diperbarui!', 'success');
        }
      } else {
        const index = state.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
          state.tasks[index] = {
            ...state.tasks[index],
            judul, tanggal, waktu, kategori, catatan, pengingat
          };
          saveTasks();
          showToast('✅ Tugas berhasil diperbarui!', 'success');
        }
      }
    } else {
      // CREATE MODE
      const newId = (type === 'jadwal' ? 'sch_' : 'tsk_') + Date.now();
      const newItem = {
        id: newId,
        judul,
        tanggal,
        waktu,
        kategori,
        catatan,
        pengingat,
        createdAt: Date.now()
      };

      if (type === 'jadwal') {
        state.schedules.unshift(newItem);
        saveSchedules();
        showToast('✅ Jadwal baru berhasil disimpan!', 'success');
      } else {
        newItem.selesai = false;
        state.tasks.unshift(newItem);
        saveTasks();
        showToast('✅ Tugas baru berhasil dicatat!', 'success');
      }
    }

    closeItemModal();
    renderBeranda();
    renderJadwal();
    renderTugas();
    runReminderEngine();
  }

  // ==========================================
  // 13. DELETE CONFIRMATION
  // ==========================================
  function confirmDeleteItem(type, id) {
    let item = null;
    if (type === 'jadwal') {
      item = state.schedules.find(s => s.id === id);
    } else {
      item = state.tasks.find(t => t.id === id);
    }

    if (!item) return;

    state.pendingDelete = { type, id, title: item.judul };

    const confirmModal = document.getElementById('confirmDeleteModal');
    const confirmText = document.getElementById('confirmDeleteText');

    if (confirmText) {
      confirmText.textContent = `Apakah Anda yakin ingin menghapus "${item.judul}"? Tindakan ini tidak dapat dibatalkan.`;
    }

    if (confirmModal) confirmModal.classList.remove('hidden');
  }

  function executeDelete() {
    if (!state.pendingDelete) return;

    const { type, id } = state.pendingDelete;
    if (type === 'jadwal') {
      state.schedules = state.schedules.filter(s => s.id !== id);
      saveSchedules();
      showToast('🗑️ Jadwal berhasil dihapus.', 'info');
    } else {
      state.tasks = state.tasks.filter(t => t.id !== id);
      saveTasks();
      showToast('🗑️ Tugas berhasil dihapus.', 'info');
    }

    state.pendingDelete = null;
    const confirmModal = document.getElementById('confirmDeleteModal');
    if (confirmModal) confirmModal.classList.add('hidden');

    renderBeranda();
    renderJadwal();
    renderTugas();
    runReminderEngine();
  }

  // ==========================================
  // 14. TASK COMPLETION TOGGLE
  // ==========================================
  function toggleTaskStatus(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    task.selesai = !task.selesai;
    saveTasks();

    if (task.selesai) {
      showToast(`🎉 Hebat! "${task.judul}" ditandai selesai!`, 'success');
    } else {
      showToast(`"${task.judul}" ditandai belum selesai.`, 'info');
    }

    renderBeranda();
    renderTugas();
  }

  // ==========================================
  // 15. PROFILE EDIT MODAL
  // ==========================================
  function openProfileModal() {
    const modal = document.getElementById('profileModal');
    const user = state.currentUser || DEFAULT_USER;

    document.getElementById('editNama').value = user.name || '';
    document.getElementById('editSekolah').value = user.school || '';
    document.getElementById('editEmail').value = user.email || '';

    if (modal) modal.classList.remove('hidden');
  }

  function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.add('hidden');
  }

  function handleProfileSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('editNama').value.trim();
    const school = document.getElementById('editSekolah').value.trim();
    const email = document.getElementById('editEmail').value.trim();

    if (!name) {
      showToast('Nama pengguna tidak boleh kosong.', 'danger');
      return;
    }

    state.currentUser = {
      ...state.currentUser,
      name,
      school,
      email
    };
    saveUser();
    closeProfileModal();
    renderProfil();
    renderBeranda();
    showToast('✅ Informasi profil berhasil diperbarui!', 'success');
  }

  // ==========================================
  // 16. DATA EXPORT & RESET
  // ==========================================
  function exportDataJson() {
    const exportObject = {
      appName: 'DailyReminder SMK',
      exportDate: new Date().toISOString(),
      user: state.currentUser,
      schedules: state.schedules,
      tasks: state.tasks
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DailyReminder_Backup_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('📥 Data berhasil diekspor ke file JSON!', 'success');
  }

  function resetToDefaultData() {
    if (confirm('Apakah Anda ingin mengembalikan jadwal dan tugas ke data contoh bawaan siswa SMK?')) {
      state.schedules = [...DEFAULT_SCHEDULES];
      state.tasks = [...DEFAULT_TASKS];
      state.currentUser = { ...DEFAULT_USER };
      saveSchedules();
      saveTasks();
      saveUser();

      localStorage.removeItem(KEYS.TRIGGERED);

      renderBeranda();
      renderJadwal();
      renderTugas();
      renderProfil();
      showToast('🔄 Data berhasil direset ke contoh siswa SMK!', 'success');
    }
  }

  // ==========================================
  // 17. NOTIFICATION CENTER MODAL
  // ==========================================
  function openNotificationCenter() {
    const modal = document.getElementById('notificationCenterModal');
    const listEl = document.getElementById('notifCenterList');
    if (!modal || !listEl) return;

    const todayItems = [
      ...state.schedules.filter(s => s.tanggal === todayStr).map(s => ({ ...s, typeLabel: 'Jadwal' })),
      ...state.tasks.filter(t => t.tanggal === todayStr).map(t => ({ ...t, typeLabel: 'Tugas' }))
    ];

    todayItems.sort((a, b) => a.waktu.localeCompare(b.waktu));

    if (todayItems.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <p>Tidak ada kegiatan berjadwal untuk hari ini.</p>
        </div>
      `;
    } else {
      listEl.innerHTML = todayItems.map(item => `
        <div class="item-card ${item.typeLabel === 'Jadwal' ? 'schedule-type' : 'task-type'}" style="padding:12px;">
          <div class="item-body">
            <div class="item-meta-time">
              <span>[${item.typeLabel}] Pukul ${escapeHtml(item.waktu)} WIB</span>
            </div>
            <h4 class="item-title" style="font-size:0.95rem;">${escapeHtml(item.judul)}</h4>
            <div class="item-badges" style="margin-top:4px;">
              ${renderCategoryBadge(item.kategori)}
              ${renderReminderBadge(item.pengingat)}
            </div>
          </div>
        </div>
      `).join('');
    }

    modal.classList.remove('hidden');
  }

  function closeNotificationCenter() {
    const modal = document.getElementById('notificationCenterModal');
    if (modal) modal.classList.add('hidden');
  }

  // ==========================================
  // 18. AUTH LOGIC (LOGIN / LOGOUT / REGISTER)
  // ==========================================
  function setAuthState(isLoggedIn) {
    const authView = document.getElementById('authView');
    const appView = document.getElementById('appView');

    if (isLoggedIn) {
      authView.classList.add('hidden');
      appView.classList.remove('hidden');
      switchTab('beranda');
    } else {
      appView.classList.add('hidden');
      authView.classList.remove('hidden');
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    if (!username) {
      showToast('Masukkan email atau username.', 'danger');
      return;
    }

    state.currentUser = {
      username: username,
      name: username === 'mieoeoeo' ? 'Mieoeoeo' : username,
      school: 'SMK Negeri 1 (PPLG)',
      email: `${username.toLowerCase()}@smk.belajar.id`,
      isLoggedIn: true
    };
    saveUser();
    setAuthState(true);
    showToast(`Selamat datang kembali, ${state.currentUser.name}! ✨`, 'success');
  }

  function handleQuickDemo() {
    state.currentUser = { ...DEFAULT_USER, isLoggedIn: true };
    saveUser();
    setAuthState(true);
    showToast(`Masuk sebagai ${DEFAULT_USER.name} (Mode Demo Siswa SMK) 🚀`, 'success');
  }

  function handleRegister(e) {
    e.preventDefault();
    const nama = document.getElementById('regNama').value.trim();
    const sekolah = document.getElementById('regSekolah').value.trim();
    const username = document.getElementById('regUsername').value.trim();

    if (!nama || !username) {
      showToast('Lengkapi nama dan username.', 'danger');
      return;
    }

    state.currentUser = {
      username: username,
      name: nama,
      school: sekolah || 'SMK Negeri',
      email: username.includes('@') ? username : `${username}@smk.belajar.id`,
      isLoggedIn: true
    };
    saveUser();
    setAuthState(true);
    showToast(`Akun berhasil dibuat! Halo, ${nama}! 🎉`, 'success');
  }

  function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar dari akun DailyReminder?')) {
      if (state.currentUser) {
        state.currentUser.isLoggedIn = false;
        saveUser();
      }
      setAuthState(false);
      showToast('Anda telah keluar dari akun.', 'info');
    }
  }

  // ==========================================
  // 19. ATTACH ALL DOM EVENT LISTENERS
  // ==========================================
  function setupEventListeners() {
    // Auth Tab Switcher
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    tabLoginBtn?.addEventListener('click', () => {
      tabLoginBtn.classList.add('active');
      tabRegisterBtn.classList.remove('active');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    });

    tabRegisterBtn?.addEventListener('click', () => {
      tabRegisterBtn.classList.add('active');
      tabLoginBtn.classList.remove('active');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    });

    // Login & Register Form Submits
    loginForm?.addEventListener('submit', handleLogin);
    registerForm?.addEventListener('submit', handleRegister);
    document.getElementById('btnQuickDemo')?.addEventListener('click', handleQuickDemo);
    document.getElementById('btnLogout')?.addEventListener('click', handleLogout);

    // Nav Tab Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) switchTab(tab);
      });
    });

    // Navbar "+ Tambah" button & FAB
    document.getElementById('btnNavTambah')?.addEventListener('click', () => openItemModal('jadwal'));
    document.getElementById('fabTambah')?.addEventListener('click', () => openItemModal('jadwal'));

    // Buttons on Jadwal & Tugas Pages
    document.querySelector('.btn-tambah-jadwal')?.addEventListener('click', () => openItemModal('jadwal'));
    document.querySelector('.btn-tambah-tugas')?.addEventListener('click', () => openItemModal('tugas'));

    // Modal Item type switchers
    document.querySelectorAll('.item-type-switcher .type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.type;
        if (t) setItemModalType(t);
      });
    });

    // Close Item Modal
    document.getElementById('btnCloseItemModal')?.addEventListener('click', closeItemModal);
    document.getElementById('btnCancelItemModal')?.addEventListener('click', closeItemModal);
    document.getElementById('itemForm')?.addEventListener('submit', handleItemFormSubmit);

    // Delete Modal
    document.getElementById('btnCancelDelete')?.addEventListener('click', () => {
      state.pendingDelete = null;
      document.getElementById('confirmDeleteModal')?.classList.add('hidden');
    });
    document.getElementById('btnConfirmDelete')?.addEventListener('click', executeDelete);

    // Profile Edit Modal
    document.getElementById('btnEditProfile')?.addEventListener('click', openProfileModal);
    document.getElementById('btnCloseProfileModal')?.addEventListener('click', closeProfileModal);
    document.getElementById('btnCancelProfileModal')?.addEventListener('click', closeProfileModal);
    document.getElementById('profileForm')?.addEventListener('submit', handleProfileSubmit);

    // Notification Center Modal
    document.getElementById('btnNotificationCenter')?.addEventListener('click', openNotificationCenter);
    document.getElementById('btnCloseNotifCenter')?.addEventListener('click', closeNotificationCenter);
    document.getElementById('btnDismissNotifCenter')?.addEventListener('click', closeNotificationCenter);

    // Settings actions
    document.getElementById('btnReqNotification')?.addEventListener('click', requestNotificationPermission);
    document.getElementById('btnTestSound')?.addEventListener('click', () => {
      playReminderChime();
      showToast('🔊 Suara lonceng pengingat berhasil dibunyikan!', 'info');
    });
    document.getElementById('btnExportData')?.addEventListener('click', exportDataJson);
    document.getElementById('btnResetData')?.addEventListener('click', resetToDefaultData);

    // Jadwal Search & Filters
    const searchJadwal = document.getElementById('searchJadwalInput');
    searchJadwal?.addEventListener('input', (e) => {
      state.filterJadwalSearch = e.target.value;
      renderJadwal();
    });

    document.querySelectorAll('#jadwalCategoryFilters .pill-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#jadwalCategoryFilters .pill-btn').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filterJadwalCategory = pill.dataset.category || 'Semua';
        renderJadwal();
      });
    });

    // Tugas Search & Filters
    const searchTugas = document.getElementById('searchTugasInput');
    searchTugas?.addEventListener('input', (e) => {
      state.filterTugasSearch = e.target.value;
      renderTugas();
    });

    document.querySelectorAll('#tugasStatusFilters .pill-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#tugasStatusFilters .pill-btn').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filterTugasStatus = pill.dataset.status || 'Semua';
        renderTugas();
      });
    });

    document.querySelectorAll('#tugasCategoryFilters .pill-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#tugasCategoryFilters .pill-btn').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filterTugasCategory = pill.dataset.category || 'Semua';
        renderTugas();
      });
    });

    // Event Delegation for Dynamic Elements (Edit, Delete, Toggle Checkbox)
    document.addEventListener('click', (e) => {
      // Toggle task completion
      const toggleBtn = e.target.closest('.btn-toggle-task');
      if (toggleBtn) {
        const id = toggleBtn.dataset.id;
        if (id) toggleTaskStatus(id);
        return;
      }

      // Edit schedule
      const editSchBtn = e.target.closest('.btn-edit-sch');
      if (editSchBtn) {
        const id = editSchBtn.dataset.id;
        const item = state.schedules.find(s => s.id === id);
        if (item) openItemModal('jadwal', item);
        return;
      }

      // Delete schedule
      const delSchBtn = e.target.closest('.btn-del-sch');
      if (delSchBtn) {
        const id = delSchBtn.dataset.id;
        if (id) confirmDeleteItem('jadwal', id);
        return;
      }

      // Edit task
      const editTskBtn = e.target.closest('.btn-edit-tsk');
      if (editTskBtn) {
        const id = editTskBtn.dataset.id;
        const item = state.tasks.find(t => t.id === id);
        if (item) openItemModal('tugas', item);
        return;
      }

      // Delete task
      const delTskBtn = e.target.closest('.btn-del-tsk');
      if (delTskBtn) {
        const id = delTskBtn.dataset.id;
        if (id) confirmDeleteItem('tugas', id);
        return;
      }
    });

    // Close modals on Backdrop Click or ESC Key
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.add('hidden');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
          modal.classList.add('hidden');
        });
      }
    });
  }

  // ==========================================
  // 20. INITIALIZATION
  // ==========================================
  function init() {
    loadFromStorage();
    setupEventListeners();

    // Check if user is logged in
    const isLoggedIn = state.currentUser && state.currentUser.isLoggedIn !== false;
    setAuthState(isLoggedIn);

    // Initial renders
    renderBeranda();
    renderJadwal();
    renderTugas();
    renderProfil();

    // Start background reminder engine (runs every 15 seconds)
    runReminderEngine();
    setInterval(runReminderEngine, 15000);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
