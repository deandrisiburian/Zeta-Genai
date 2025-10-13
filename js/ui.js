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
function toggleCustomModel() {
  const customModel = document.getElementById('custom-model-modal');
  customModel.classList.toggle('hidden');
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
      upgradeSidebarBtn.disabled = true;
      upgradeSidebarBtn.style.opacity = '0.7';
    } else {
      upgradeSidebarBtn.innerHTML = '<svg class="icon-PIRQLq" width="20" height="20" fill="none" viewBox="0 0 24 24" style="min-width: 20px; min-height: 20px;"><path fill="currentColor" d="M9.371 4.005a.892.892 0 0 0-1.165.483L7.555 6.06a2.767 2.767 0 0 1-1.497 1.494l-1.57.65a.892.892 0 0 0-.483 1.166l.001.001.649 1.57v.001c.28.678.281 1.439.001 2.117l-.65 1.57a.892.892 0 0 0 .483 1.164l1.57.65.001.001c.678.282 1.216.82 1.496 1.498l.65 1.57a.892.892 0 0 0 1.165.483l1.57-.65a2.767 2.767 0 0 1 2.117-.001l1.57.65a.892.892 0 0 0 1.165-.482l.65-1.571h.001a2.767 2.767 0 0 1 1.498-1.496l1.57-.65a.892.892 0 0 0 .482-1.166l-.648-1.568v-.001a2.764 2.764 0 0 1-.002-2.12l.65-1.569a.892.892 0 0 0-.482-1.165l-1.572-.651a2.767 2.767 0 0 1-1.495-1.495l-.65-1.57v-.001a.892.892 0 0 0-1.166-.483l-1.57.648h-.001a2.767 2.767 0 0 1-2.116.002l-1.57-.65Zm8.79 1.298a.892.892 0 0 0 .498.52l1.57.65a2.767 2.767 0 0 1 1.498 3.616l-.65 1.57a.89.89 0 0 0 0 .681l.65 1.57a2.768 2.768 0 0 1-1.498 3.617l-1.57.65a.892.892 0 0 0-.483.482l-.65 1.57a2.767 2.767 0 0 1-3.616 1.498l-1.569-.65a.892.892 0 0 0-.682 0l-1.572.65a2.767 2.767 0 0 1-3.612-1.496l-.652-1.572a.892.892 0 0 0-.481-.483l-1.57-.65a2.767 2.767 0 0 1-1.499-3.614l.65-1.57a.892.892 0 0 0 0-.682l-.65-1.572a2.767 2.767 0 0 1 1.498-3.616l1.57-.65a.892.892 0 0 0 .483-.481V5.34l.65-1.57a2.767 2.767 0 0 1 3.615-1.497l1.569.65c.219.09.464.09.682 0l.002-.001 1.57-.648a2.767 2.767 0 0 1 3.615 1.497l.634 1.532Zm-2.348 3.784a.938.938 0 0 1 0 1.326l-4.05 4.05a.937.937 0 0 1-1.326 0l-1.8-1.8a.937.937 0 1 1 1.326-1.326l1.137 1.137 3.387-3.387a.937.937 0 0 1 1.326 0Z" clip-rule="evenodd" fill-rule="evenodd" data-follow-fill="#6841EA"></path></svg> Tingkatkan ke Pro';
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
    upgradeSidebarBtn.innerHTML = '<svg class="icon-PIRQLq" width="20" height="20" fill="none" viewBox="0 0 24 24" style="min-width: 20px; min-height: 20px;"><path fill="currentColor" d="M9.371 4.005a.892.892 0 0 0-1.165.483L7.555 6.06a2.767 2.767 0 0 1-1.497 1.494l-1.57.65a.892.892 0 0 0-.483 1.166l.001.001.649 1.57v.001c.28.678.281 1.439.001 2.117l-.65 1.57a.892.892 0 0 0 .483 1.164l1.57.65.001.001c.678.282 1.216.82 1.496 1.498l.65 1.57a.892.892 0 0 0 1.165.483l1.57-.65a2.767 2.767 0 0 1 2.117-.001l1.57.65a.892.892 0 0 0 1.165-.482l.65-1.571h.001a2.767 2.767 0 0 1 1.498-1.496l1.57-.65a.892.892 0 0 0 .482-1.166l-.648-1.568v-.001a2.764 2.764 0 0 1-.002-2.12l.65-1.569a.892.892 0 0 0-.482-1.165l-1.572-.651a2.767 2.767 0 0 1-1.495-1.495l-.65-1.57v-.001a.892.892 0 0 0-1.166-.483l-1.57.648h-.001a2.767 2.767 0 0 1-2.116.002l-1.57-.65Zm8.79 1.298a.892.892 0 0 0 .498.52l1.57.65a2.767 2.767 0 0 1 1.498 3.616l-.65 1.57a.89.89 0 0 0 0 .681l.65 1.57a2.768 2.768 0 0 1-1.498 3.617l-1.57.65a.892.892 0 0 0-.483.482l-.65 1.57a2.767 2.767 0 0 1-3.616 1.498l-1.569-.65a.892.892 0 0 0-.682 0l-1.572.65a2.767 2.767 0 0 1-3.612-1.496l-.652-1.572a.892.892 0 0 0-.481-.483l-1.57-.65a2.767 2.767 0 0 1-1.499-3.614l.65-1.57a.892.892 0 0 0 0-.682l-.65-1.572a2.767 2.767 0 0 1 1.498-3.616l1.57-.65a.892.892 0 0 0 .483-.481V5.34l.65-1.57a2.767 2.767 0 0 1 3.615-1.497l1.569.65c.219.09.464.09.682 0l.002-.001 1.57-.648a2.767 2.767 0 0 1 3.615 1.497l.634 1.532Zm-2.348 3.784a.938.938 0 0 1 0 1.326l-4.05 4.05a.937.937 0 0 1-1.326 0l-1.8-1.8a.937.937 0 1 1 1.326-1.326l1.137 1.137 3.387-3.387a.937.937 0 0 1 1.326 0Z" clip-rule="evenodd" fill-rule="evenodd" data-follow-fill="#6841EA"></path></svg> Tingkatkan ke Pro';
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
