// UI manipulation functions

/**
 * Menampilkan notifikasi kepada pengguna
 * @param {string} message - Pesan notifikasi
 * @param {string} type - Jenis notifikasi (info, success, error)
 */
function showNotification(message, type = 'info') {
  const notificationContainer = document.getElementById('notification-container');
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  notificationContainer.appendChild(notification);
  
  // Hapus otomatis setelah 5 detik
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

/**
 * Mengubah tema aplikasi
 * @param {string} theme - Nama tema (light, dark, auto)
 */
function changeTheme(theme) {
  if (theme === 'auto') {
    // Hapus tema yang ditetapkan dan gunakan preferensi OS
    document.body.classList.remove('light-theme', 'dark-theme');
    localStorage.removeItem('preferred-theme');
  } else {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme + '-theme');
    localStorage.setItem('preferred-theme', theme);
  }
}

/**
 * Menerapkan tema yang disimpan dari localStorage
 */
function applySavedTheme() {
  const savedTheme = localStorage.getItem('preferred-theme');
  if (savedTheme) {
    changeTheme(savedTheme);
    
    // Perbarui UI pemilih tema
    document.querySelectorAll('.theme-option').forEach(option => {
      option.classList.remove('active');
      if (option.getAttribute('data-theme') === savedTheme) {
        option.classList.add('active');
      }
    });
  }
}

/**
 * Menampilkan/menyembunyikan panel pengaturan
 */
function toggleSettings() {
  const settingsPanel = document.getElementById('settings-panel');
  settingsPanel.classList.toggle('hidden');
}

/**
 * Menampilkan/menyembunyikan sidebar pada perangkat mobile
 */
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('open');
    
    // Tambahkan overlay saat sidebar terbuka
    if (sidebar.classList.contains('open')) {
      const overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.addEventListener('click', toggleSidebar);
      document.body.appendChild(overlay);
    } else {
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
  }
}

/**
 * Auto-resize textarea berdasarkan konten
 * @param {HTMLTextAreaElement} textarea - Elemen textarea yang akan di-resize
 */
function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px';
}

/**
 * Memasukkan saran ke input pengguna
 * @param {string} suggestion - Teks saran
 */
function insertSuggestion(suggestion) {
  const userInput = document.getElementById('user-input');
  userInput.value = suggestion;
  userInput.focus();
  autoResize(userInput);
}

/**
 * Menutup semua modal
 */
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.add('hidden');
  });
  document.getElementById('modal-overlay').classList.add('hidden');
}

/**
 * Menutup modal tertentu
 * @param {string} modalId - ID modal yang akan ditutup
 */
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  document.getElementById('modal-overlay').classList.add('hidden');
}

/**
 * Memperbarui UI berdasarkan status pengguna
 */
function updateUIForUserState() {
  const userDisplayName = document.getElementById('user-display-name');
  const userPlanStatus = document.getElementById('user-plan-status');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const upgradeSidebarBtn = document.getElementById('upgrade-sidebar-btn');
  
  if (userState.isLoggedIn) {
    // Perbarui info pengguna
    userDisplayName.textContent = userState.email;
    userPlanStatus.textContent = userState.isPremium ? 'Paket Premium' : 'Paket Gratis';
    
    // Perbarui tombol autentikasi
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    
    // Perbarui tombol upgrade
    if (userState.isPremium) {
      upgradeSidebarBtn.innerHTML = '<i class="fas fa-crown"></i> Pengguna Premium';
      upgradeSidebarBtn.disabled = true;
      upgradeSidebarBtn.style.opacity = '0.7';
    } else {
      upgradeSidebarBtn.innerHTML = '<i class="fas fa-crown"></i> Upgrade ke Pro';
      upgradeSidebarBtn.disabled = false;
      upgradeSidebarBtn.style.opacity = '1';
    }
  } else {
    // Reset ke pengguna tamu
    userDisplayName.textContent = 'Pengguna Tamu';
    userPlanStatus.textContent = 'Paket Gratis';
    
    // Perbarui tombol autentikasi
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    
    // Perbarui tombol upgrade
    upgradeSidebarBtn.innerHTML = '<i class="fas fa-crown"></i> Upgrade ke Pro';
    upgradeSidebarBtn.disabled = false;
    upgradeSidebarBtn.style.opacity = '1';
  }
  
  // Perbarui avatar pengguna
  updateUserAvatar();
}

/**
 * Memperbarui avatar pengguna di UI
 */
function updateUserAvatar() {
  const userAvatarElements = document.querySelectorAll('.user-avatar');
  userAvatarElements.forEach(el => {
    if (userState.profilePicture) {
      el.innerHTML = `<img src="${userState.profilePicture}" alt="Profil">`;
    } else {
      el.innerHTML = '<i class="fas fa-user"></i>';
    }
  });
}
