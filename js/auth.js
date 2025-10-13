// Authentication and user management functions

/**
 * Menampilkan modal login
 */
function showLoginModal() {
  if (userState.isLoggedIn) {
    showNotification('Anda sudah masuk', 'info');
    return;
  }
  
  closeAllModals();
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('login-modal').classList.remove('hidden');
}

/**
 * Mengirim kode verifikasi (simulasi)
 */
function sendVerificationCode() {
  const emailInput = document.getElementById('login-email');
  const email = emailInput ? emailInput.value.trim() : '';
  
  if (!email || !isValidEmail(email)) {
    showNotification('Silakan masukkan alamat email yang valid', 'error');
    return;
  }
  
  // Simulasi pengiriman kode verifikasi
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  userState.verificationCode = code;
  
  // Tampilkan langkah kode
  const emailStep = document.getElementById('login-step-email');
  const codeStep = document.getElementById('login-step-code');
  const emailDisplay = document.getElementById('email-display');
  
  if (emailStep && codeStep && emailDisplay) {
    emailStep.classList.add('hidden');
    codeStep.classList.remove('hidden');
    emailDisplay.textContent = email;
  }
  
  // Untuk tujuan demo, tampilkan kode dalam alert
  setTimeout(() => {
    alert(`DEMO: Kode verifikasi Anda adalah ${code}.`);
  }, 500);
}

/**
 * Kembali ke langkah email
 */
function backToEmail() {
  const emailStep = document.getElementById('login-step-email');
  const codeStep = document.getElementById('login-step-code');
  
  if (emailStep && codeStep) {
    codeStep.classList.add('hidden');
    emailStep.classList.remove('hidden');
  }
}

/**
 * Memverifikasi kode
 */
function verifyCode() {
  const verificationCodeInput = document.getElementById('verification-code');
  const enteredCode = verificationCodeInput ? verificationCodeInput.value.trim() : '';
  
  if (enteredCode === userState.verificationCode) {
    // Berhasil diverifikasi
    const emailInput = document.getElementById('login-email');
    userState.isLoggedIn = true;
    userState.email = emailInput ? emailInput.value.trim() : '';
    
    // Muat data yang disimpan dari server (simulasi)
    loadUserDataFromServer();
    
    saveUserState();
    updateUIForUserState();
    closeModal('login-modal');
    showNotification('Berhasil masuk!', 'success');
  } else {
    showNotification('Kode verifikasi tidak valid', 'error');
  }
}

/**
 * Simulasi memuat data dari server
 */
function loadUserDataFromServer() {
  // Dalam implementasi nyata, ini akan mengambil data dari API server
  const savedData = localStorage.getItem('userServerData_' + userState.email);
  
  if (savedData) {
    const serverData = JSON.parse(savedData);
    userState.username = serverData.username || userState.email.split('@')[0];
    userState.profilePicture = serverData.profilePicture || null;
    userState.customThemes = serverData.customThemes || [];
    
    // Muat riwayat chat dari server
    const serverChatHistory = localStorage.getItem('chatHistory_' + userState.email);
    if (serverChatHistory) {
      chatHistory = JSON.parse(serverChatHistory);
      // Perbarui UI riwayat chat
      const historyList = document.getElementById('history-list');
      if (historyList) {
        historyList.innerHTML = '';
        Object.keys(chatHistory).forEach(chatId => {
          const chat = chatHistory[chatId];
          addChatToHistory(chatId, chat.title);
        });
      }
    }
  }
}

/**
 * Simulasi menyimpan data ke server
 */
function saveUserDataToServer() {
  // Dalam implementasi nyata, ini akan mengirim data ke API server
  const serverData = {
    username: userState.username,
    profilePicture: userState.profilePicture,
    customThemes: userState.customThemes
  };
  
  localStorage.setItem('userServerData_' + userState.email, JSON.stringify(serverData));
  localStorage.setItem('chatHistory_' + userState.email, JSON.stringify(chatHistory));
}

/**
 * Keluar dari akun pengguna
 */
function logoutUser() {
  userState.isLoggedIn = false;
  userState.email = null;
  userState.verificationCode = null;
  saveUserState();
  updateUIForUserState();
  showNotification('Berhasil keluar', 'info');
}

/**
 * Upgrade ke premium (simulasi)
 */
function upgradeToPremium() {
  if (!userState.isLoggedIn) {
    showNotification('Silakan masuk terlebih dahulu untuk tingkatkan', 'error');
    showLoginModal();
    return;
  }
  
  userState.isPremium = true;
  saveUserState();
  updateUIForUserState();
  setupModelRestrictions();
  closeModal('upgrade-modal');
  showNotification('Berhasil tingkatkan ke Premium!', 'success');
}

/**
 * Menyimpan profil pengguna
 */
function saveProfile() {
  const profileUsername = document.getElementById('profile-username');
  if (profileUsername) {
    userState.username = profileUsername.value;
  }
  saveUserState();
  updateUIForUserState();
  closeModal('profile-modal');
  showNotification('Profil berhasil diperbarui', 'success');
}

/**
 * Menampilkan modal profil
 */
function showProfileModal() {
  const profileUsername = document.getElementById('profile-username');
  const profilePictureImg = document.getElementById('profile-picture-img');
  
  if (profileUsername) {
    profileUsername.value = userState.username;
  }
  
  if (profilePictureImg && userState.profilePicture) {
    profilePictureImg.src = userState.profilePicture;
  }
  
  closeAllModals();
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('profile-modal').classList.remove('hidden');
}
