// Main application logic and initialization

// Konfigurasi API
const API_BASE_URL = "/api"; // Akan di-handle oleh backend

// State aplikasi
let currentModel = 'nvidia/nemotron-nano-9b-v2';
let currentChatId = null;
let chatHistory = {};

// State pengguna
let userState = {
  isLoggedIn: false,
  email: null,
  username: "Pengguna Tamu",
  profilePicture: null,
  isPremium: false,
  verificationCode: null,
  customThemes: []
};

// Tool aktif
let activeTool = null;

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

/**
 * Menginisialisasi aplikasi
 */
function initializeApp() {
  loadUserState();
  loadChatHistory();
  setupEventListeners();
  applySavedTheme();
  updateUIForUserState();
  setupModelRestrictions();
  setupFileUploadEvents();
  
  // Event listener untuk input gambar profil
  const profilePictureInput = document.getElementById('profile-picture-input');
  if (profilePictureInput) {
    profilePictureInput.addEventListener('change', handleProfilePictureChange);
  }
  
  // Fokus ke input saat aplikasi dimulai
  setTimeout(() => {
    const userInput = document.getElementById('user-input');
    if (userInput) {
      userInput.focus();
    }
  }, 500);
}

/**
 * Menyiapkan event listener
 */
function setupEventListeners() {
  const chatForm = document.getElementById('chat-form');
  const modelSelect = document.getElementById('model-select');
  const hamburgerMenu = document.getElementById('hamburger-menu');
  
  if (chatForm) {
    chatForm.addEventListener('submit', handleSubmit);
  }
  
  if (modelSelect) {
    modelSelect.addEventListener('change', updateModel);
    modelSelect.value = currentModel;
  }
  
  // Pemilihan tema
  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      changeTheme(theme);
    });
  });
  
  // Tutup pengaturan saat mengklik di luar
  document.addEventListener('click', (e) => {
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel && !settingsPanel.classList.contains('hidden') && 
        !e.target.closest('.settings-panel') && 
        !e.target.closest('.settings-btn')) {
      toggleSettings();
    }
  });
  
  // Tutup modal saat mengklik di luar
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') {
        closeAllModals();
      }
    });
  }
  
  // Event listener menu hamburger
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', toggleSidebar);
  }
  
  // Tutup sidebar saat mengklik di luar pada perangkat mobile
  document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768 && 
        sidebar && sidebar.classList.contains('open') &&
        !e.target.closest('.sidebar') && 
        !e.target.closest('#hamburger-menu')) {
      toggleSidebar();
    }
  });
}

/**
 * Menangani pengiriman form chat
 * @param {Event} e - Event submit
 */
async function handleSubmit(e) {
  e.preventDefault();
  
  const sendBtn = document.getElementById('send-btn');
  const userInput = document.getElementById('user-input');
  const userText = userInput ? userInput.value.trim() : '';
  
  // Validasi input
  if (!userText) {
    showNotification('Silakan masukkan pesan', 'error');
    return;
  }
  
  if (userText.length > 5000) {
    showNotification('Pesan terlalu panjang. Maksimal 5000 karakter diperbolehkan.', 'error');
    return;
  }

  // Periksa apakah model hanya untuk premium bagi pengguna non-premium
  if (!userState.isPremium && isPremiumModel(currentModel)) {
    showNotification('Model ini hanya tersedia untuk pengguna premium. Upgrade untuk mengakses.', 'error');
    showUpgradeModal();
    return;
  }

  // Nonaktifkan tombol kirim sementara
  if (sendBtn) {
    sendBtn.disabled = true;
  }

  // Mulai obrolan baru jika tidak ada yang aktif
  if (!currentChatId) {
    startNewChat();
  }

  // Tambahkan pesan pengguna ke UI
  addMessage(userText, 'user');
  
  if (userInput) {
    userInput.value = '';
    userInput.style.height = 'auto';
  }
  
  // Tampilkan indikator loading
  const loadingId = addLoadingIndicator();
  
  try {
    // Dapatkan respons AI
    const aiResponse = await fetchAIResponse(userText);
    
    // Perbarui riwayat obrolan
    chatHistory[currentChatId].messages.push(
      { role: 'user', content: userText },
      { role: 'assistant', content: aiResponse }
    );
    
    // Perbarui judul obrolan dengan pesan pertama jika ini obrolan baru
    if (chatHistory[currentChatId].title === 'Obrolan Baru' && userText.length < 50) {
      chatHistory[currentChatId].title = userText;
      updateChatTitle(currentChatId, userText);
    }
    
    // Simpan ke penyimpanan lokal
    saveChatHistory();
    
    // Perbarui UI dengan respons
    updateMessage(loadingId, aiResponse);
  } catch (err) {
    console.error('Error mendapatkan respons AI:', err);
    updateMessage(loadingId, `Maaf, terjadi kesalahan: ${err.message}. Silakan coba lagi.`);
    showNotification('Gagal mendapatkan respons. Silakan coba lagi.', 'error');
  } finally {
    // Selalu aktifkan kembali tombol kirim
    if (sendBtn) {
      sendBtn.disabled = false;
    }
    
    // Fokus kembali ke input
    if (userInput) {
      userInput.focus();
    }
  }
}

/**
 * Mendapatkan respons AI dari backend
 * @param {string} promptText - Teks prompt
 * @returns {Promise<string>} Respons AI
 */
async function fetchAIResponse(promptText) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: currentModel,
      message: promptText,
      userId: userState.isLoggedIn ? userState.email : 'guest'
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal mengambil respons');
  }
  
  const data = await response.json();
  return data.response;
}

/**
 * Memperbarui model yang dipilih
 */
function updateModel() {
  const modelSelect = document.getElementById('model-select');
  if (!modelSelect) return;
  
  const selectedModel = modelSelect.value;
  
  // Periksa apakah model hanya untuk premium bagi pengguna non-premium
  if (!userState.isPremium && isPremiumModel(selectedModel)) {
    showNotification('Model ini hanya tersedia untuk pengguna premium. Upgrade untuk mengakses.', 'error');
    modelSelect.value = currentModel; // Kembalikan ke model sebelumnya
    showUpgradeModal();
    return;
  }
  
  currentModel = selectedModel;
  
  const currentModelBadge = document.getElementById('current-model');
  if (currentModelBadge) {
    currentModelBadge.textContent = getModelDisplayName(currentModel);
  }
  
  // Perbarui model obrolan saat ini jika ada obrolan aktif
  if (currentChatId && chatHistory[currentChatId]) {
    chatHistory[currentChatId].model = currentModel;
    saveChatHistory();
  }
}

/**
 * Menyiapkan pembatasan model berdasarkan status pengguna
 */
function setupModelRestrictions() {
  const openrouterModels = document.getElementById('openrouter-models');
  if (!openrouterModels) return;
  
  const premiumOptions = openrouterModels.querySelectorAll('.pro-only');
  
  premiumOptions.forEach(option => {
    if (!userState.isPremium) {
      option.disabled = true;
      option.innerHTML += ' (Hanya Premium)';
    } else {
      option.disabled = false;
      option.innerHTML = option.innerHTML.replace(' (Hanya Premium)', '');
    }
  });
}

/**
 * Memilih tool
 * @param {string} tool - ID tool yang dipilih
 */
function selectTool(tool) {
  activeTool = tool;
  
  // Perbarui UI untuk menunjukkan tool yang aktif
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Berikan prompt khusus berdasarkan tool yang dipilih
  let prompt = '';
  switch(tool) {
    case 'learn':
      prompt = 'Saya ingin belajar tentang: ';
      break;
    case 'research':
      prompt = 'Saya perlu riset mendalam tentang: ';
      break;
    case 'think':
      prompt = 'Saya ingin berpikir mendalam tentang: ';
      break;
    case 'code':
      prompt = 'Saya perlu bantuan coding: ';
      break;
    case 'thesis':
      prompt = 'Saya perlu bantuan dengan skripsi tentang: ';
      break;
    case 'image':
      prompt = 'Saya ingin membuat gambar: ';
      break;
  }
  
  // Masukkan prompt ke input
  const userInput = document.getElementById('user-input');
  if (userInput) {
    userInput.value = prompt;
    userInput.focus();
    autoResize(userInput);
  }
  
  showNotification(`Tool diaktifkan: ${getToolDisplayName(tool)}`, 'info');
}

/**
 * Memuat state pengguna dari localStorage
 */
function loadUserState() {
  const savedUserState = localStorage.getItem('userState');
  if (savedUserState) {
    userState = JSON.parse(savedUserState);
  }
}

/**
 * Menyimpan state pengguna ke localStorage
 */
function saveUserState() {
  localStorage.setItem('userState', JSON.stringify(userState));
  
  if (userState.isLoggedIn) {
    saveUserDataToServer();
  }
}

/**
 * Inisialisasi dengan contoh obrolan jika tidak ada
 */
setTimeout(() => {
  if (Object.keys(chatHistory).length === 0) {
    // Tambahkan contoh obrolan ke riwayat
    currentChatId = 'chat-example';
    chatHistory[currentChatId] = {
      id: currentChatId,
      title: 'Contoh Selamat Datang',
      model: currentModel,
      timestamp: Date.now(),
      messages: [
        {
          role: 'assistant',
          content: 'Halo! Saya Zeta GenAI, asisten AI Anda. Apa yang bisa saya bantu hari ini?'
        }
      ]
    };
    
    addChatToHistory(currentChatId, 'Contoh Selamat Datang');
    saveChatHistory();
  }
}, 1000);

// Fungsi untuk upgrade ke berbagai paket
function upgradeToStudent() {
  showNotification('Fungsionalitas upgrade Pelajar akan diimplementasikan di sini', 'info');
}

function upgradeToPro() {
  showNotification('Fungsionalitas upgrade Pro akan diimplementasikan di sini', 'info');
}

function upgradeToPlus() {
  showNotification('Fungsionalitas upgrade Plus akan diimplementasikan di sini', 'info');
}

// Tampilkan modal upgrade
function showUpgradeModal() {
  closeAllModals();
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('upgrade-modal').classList.remove('hidden');
}
