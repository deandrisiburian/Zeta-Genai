// ==============================
// auth.js — Authentication UI & logic (macOS / iOS look)
// Replace/merge with existing auth logic
// Note: OAuth flows included as placeholders (need server & client IDs for production).
// ==============================

/* global userState, chatHistory, saveUserState, showNotification,
   closeModal, closeAllModals, updateUIForUserState, loadUserDataFromServer,
   addChatToHistory
*/

// ------------------------------
// Helpers
// ------------------------------
const OAUTH_CONFIG = {
  apple: {
    authUrl: "https://appleid.apple.com/auth/authorize",
    label: "Sign in with Apple"
    // In production: add client_id, redirect_uri, scope, state
  },
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    label: "Sign in with Google"
  },
  facebook: {
    authUrl: "https://www.facebook.com/v14.0/dialog/oauth",
    label: "Sign in with Facebook"
  }
};

function getElement(id) { return document.getElementById(id); }

function openModalById(id) {
  const overlay = getElement('modal-overlay');
  if (overlay) overlay.classList.remove('hidden');
  const el = getElement(id);
  if (el) el.classList.remove('hidden');
}

function closeModalById(id) {
  const el = getElement(id);
  if (el) el.classList.add('hidden');
  const overlay = getElement('modal-overlay');
  // if no other modal open, hide overlay
  const anyVisible = document.querySelector('.modal-card:not(.hidden)');
  if (!anyVisible && overlay) overlay.classList.add('hidden');
}

function showLoginModal() {
  if (userState && userState.isLoggedIn) {
    showNotification('Anda sudah masuk', 'info');
    return;
  }
  closeAllModals();
  openModalById('login-modal');
  // Ensure email step visible
  const emailStep = getElement('login-step-email');
  const codeStep = getElement('login-step-code');
  const phoneStep = getElement('login-step-phone');
  if (emailStep) emailStep.classList.remove('hidden');
  if (codeStep) codeStep.classList.add('hidden');
  if (phoneStep) phoneStep.classList.add('hidden');
}

/* Attach click handlers for provider buttons (delegation) */
document.addEventListener('click', (e) => {
  // OAuth provider
  const providerBtn = e.target.closest('.oauth-btn');
  if (providerBtn) {
    const provider = providerBtn.dataset.provider;
    if (provider) {
      handleOAuthSignIn(provider);
    }
  }

  // Modal close controls
  const closeBtn = e.target.closest('[data-action="close"]');
  if (closeBtn) {
    const parentModal = closeBtn.closest('.modal-card');
    if (parentModal && parentModal.id) closeModalById(parentModal.id);
  }
});

/* OAuth Placeholder: opens popup to provider auth URL (requires real params) */
function handleOAuthSignIn(provider) {
  if (!OAUTH_CONFIG[provider]) {
    showNotification('Provider tidak tersedia', 'error');
    return;
  }

  // In production, construct proper authUrl with client_id, redirect_uri, scope, state
  // Example: `${authUrl}?client_id=...&redirect_uri=...&response_type=code&scope=...&state=...`
  const authUrl = OAUTH_CONFIG[provider].authUrl;

  // Popup size & center
  const w = 600, h = 700;
  const left = (screen.width / 2) - (w / 2);
  const top = (screen.height / 2) - (h / 2);

  const popup = window.open(authUrl, `oauth_${provider}`, `width=${w},height=${h},top=${top},left=${left}`);

  // Fallback simulation for demo: if popup blocked or no backend, simulate a success after delay
  if (!popup) {
    showNotification('Popup diblokir. Menggunakan alur demo...', 'info');
    // simulate
    setTimeout(() => {
      simulateOAuthSuccess(provider);
    }, 800);
    return;
  }

  // In production: listen for message from popup (postMessage) with token/code
  // Here we do a demo fallback — for a real app, replace this with secure server flow.
  const poll = setInterval(() => {
    try {
      if (!popup || popup.closed) {
        clearInterval(poll);
        // If no message received, fallback to simulation
        simulateOAuthSuccess(provider);
      }
    } catch (err) {
      // ignore cross-origin until popup redirects to same-origin redirect_uri
    }
  }, 500);
}

function simulateOAuthSuccess(provider) {
  // Demo: create fake profile
  const fakeEmail = `${provider}_user@demo.zeta`;
  userState.isLoggedIn = true;
  userState.email = fakeEmail;
  userState.username = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
  userState.profilePicture = null;
  saveUserState();

  // load server-sim data
  loadUserDataFromServer();

  updateUIForUserState();
  closeModalById('login-modal');
  showNotification(`Berhasil masuk via ${provider} (mode demo)`, 'success');
}

/* EMAIL / PHONE flows (simulasi) */
function sendVerificationCode() {
  const emailInput = getElement('login-email');
  const phoneInput = getElement('login-phone');

  if (emailInput && emailInput.value.trim()) {
    const email = emailInput.value.trim();
    if (!isValidEmail(email)) {
      showNotification('Masukkan email valid', 'error');
      return;
    }
    // generate & store code
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    userState.verificationCode = code;
    userState.pendingLogin = { type: 'email', value: email };

    // UI steps
    const emailStep = getElement('login-step-email');
    const codeStep = getElement('login-step-code');
    const emailDisplay = getElement('email-display');
    if (emailStep) emailStep.classList.add('hidden');
    if (codeStep) codeStep.classList.remove('hidden');
    if (emailDisplay) emailDisplay.textContent = email;

    // Demo: show code in alert (remove for prod)
    setTimeout(() => {
      alert(`DEMO: Kode verifikasi dikirim ke ${email}: ${code}`);
    }, 400);
    return;
  }

  if (phoneInput && phoneInput.value.trim()) {
    const phone = phoneInput.value.trim();
    // Basic phone validation
    if (!/^\+?\d{7,15}$/.test(phone)) {
      showNotification('Masukkan nomor telepon valid (contoh: +628123...)', 'error');
      return;
    }
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    userState.verificationCode = code;
    userState.pendingLogin = { type: 'phone', value: phone };

    const phoneStep = getElement('login-step-phone');
    const codeStep = getElement('login-step-code');
    if (phoneStep) phoneStep.classList.add('hidden');
    if (codeStep) codeStep.classList.remove('hidden');
    const emailDisplay = getElement('email-display');
    if (emailDisplay) emailDisplay.textContent = phone;

    setTimeout(() => {
      alert(`DEMO: Kode SMS dikirim ke ${phone}: ${code}`);
    }, 400);
    return;
  }

  showNotification('Isi email atau telepon terlebih dahulu', 'error');
}

function backToEmail() {
  const emailStep = getElement('login-step-email');
  const phoneStep = getElement('login-step-phone');
  const codeStep = getElement('login-step-code');
  if (codeStep) codeStep.classList.add('hidden');
  if (phoneStep) phoneStep.classList.add('hidden');
  if (emailStep) emailStep.classList.remove('hidden');
}

function showPhoneStep() {
  const emailStep = getElement('login-step-email');
  const phoneStep = getElement('login-step-phone');
  if (emailStep) emailStep.classList.add('hidden');
  if (phoneStep) phoneStep.classList.remove('hidden');
}

/* Verify code (both email & phone) */
function verifyCode() {
  const codeInput = getElement('verification-code');
  const entered = codeInput ? codeInput.value.trim() : '';
  if (!entered) {
    showNotification('Masukkan kode verifikasi', 'error');
    return;
  }
  if (entered === userState.verificationCode) {
    // success
    const pending = userState.pendingLogin || {};
    userState.isLoggedIn = true;
    userState.email = pending.type === 'email' ? pending.value : (pending.type === 'phone' ? `${pending.value}@phone.zeta` : 'unknown@zeta');
    userState.username = (userState.email || '').split('@')[0];
    saveUserState();

    // load server data (sim)
    loadUserDataFromServer();
    updateUIForUserState();
    closeModalById('login-modal');
    showNotification('Berhasil masuk!', 'success');

    // cleanup
    userState.verificationCode = null;
    userState.pendingLogin = null;
    return;
  }
  showNotification('Kode verifikasi tidak benar', 'error');
}

/* Resend code — just regenerates code for demo */
function resendCode() {
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  userState.verificationCode = code;
  setTimeout(() => {
    alert(`DEMO: Kode verifikasi baru: ${code}`);
  }, 300);
  showNotification('Kode verifikasi dikirim ulang (demo).', 'info');
}

/* Logout / profile functions (kept minimal) */
function logoutUser() {
  userState.isLoggedIn = false;
  userState.email = null;
  userState.username = null;
  userState.profilePicture = null;
  userState.isPremium = false;
  saveUserState();
  updateUIForUserState();
  showNotification('Berhasil keluar', 'info');
}

/* Upgrade (demo) */
function upgradeToPremium() {
  if (!userState.isLoggedIn) {
    showNotification('Silakan masuk untuk upgrade', 'error');
    showLoginModal();
    return;
  }
  userState.isPremium = true;
  saveUserState();
  updateUIForUserState();
  showNotification('Akun Anda sekarang Premium (demo).', 'success');
}

/* Profile modal */
function showProfileModal() {
  const profileUsername = getElement('profile-username');
  const profilePictureImg = getElement('profile-picture-img');
  if (profileUsername) profileUsername.value = userState.username || '';
  if (profilePictureImg && userState.profilePicture) profilePictureImg.src = userState.profilePicture;
  closeAllModals();
  openModalById('profile-modal');
}

/* Save profile demo */
function saveProfile() {
  const profileUsername = getElement('profile-username');
  if (profileUsername) userState.username = profileUsername.value.trim();
  saveUserState();
  updateUIForUserState();
  closeModalById('profile-modal');
  showNotification('Profil disimpan', 'success');
}

/* Save user state wrapper (calls global saveUserState if present) */
function saveUserState() {
  if (typeof window.saveUserState === 'function') {
    window.saveUserState();
  } else {
    // fallback localStorage
    try {
      localStorage.setItem('zeta_user_state', JSON.stringify(userState || {}));
    } catch (e) { /* ignore */ }
  }
}

/* Load initial handlers (wire up buttons) */
function initAuthUI() {
  // OAuth buttons already delegated via document click handler
  const sendCodeBtn = getElement('send-code-btn');
  const sendPhoneCodeBtn = getElement('send-phone-code-btn');
  const verifyCodeBtn = getElement('verify-code-btn');
  const resendCodeBtn = getElement('resend-code-btn');
  const backToEmailBtn = getElement('back-to-email-btn');
  const showPhoneBtn = getElement('show-phone-btn');

  if (sendCodeBtn) sendCodeBtn.addEventListener('click', sendVerificationCode);
  if (sendPhoneCodeBtn) sendPhoneCodeBtn.addEventListener('click', sendVerificationCode);
  if (verifyCodeBtn) verifyCodeBtn.addEventListener('click', verifyCode);
  if (resendCodeBtn) resendCodeBtn.addEventListener('click', resendCode);
  if (backToEmailBtn) backToEmailBtn.addEventListener('click', backToEmail);
  if (showPhoneBtn) showPhoneBtn.addEventListener('click', showPhoneStep);
}

/* Initialize on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
});
