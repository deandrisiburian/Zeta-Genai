// Chat management functions

/**
 * Memulai obrolan baru
 */
function startNewChat() {
  // Generate ID unik untuk obrolan
  currentChatId = 'chat-' + Date.now();
  
  // Inisialisasi obrolan dalam riwayat
  chatHistory[currentChatId] = {
    id: currentChatId,
    title: 'Obrolan Baru',
    model: currentModel,
    timestamp: Date.now(),
    messages: []
  };
  
  // Perbarui UI
  const welcomeScreen = document.getElementById('welcome-screen');
  const chatScreen = document.getElementById('chat-screen');
  const messagesContainer = document.getElementById('messages-container');
  
  if (welcomeScreen && chatScreen && messagesContainer) {
    welcomeScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    messagesContainer.innerHTML = '';
  }
  
  // Perbarui daftar obrolan
  addChatToHistory(currentChatId, 'Obrolan Baru');
  
  // Simpan ke penyimpanan lokal
  saveChatHistory();
}

/**
 * Menambahkan pesan ke UI
 * @param {string} text - Teks pesan
 * @param {string} sender - Pengirim (user/assistant)
 * @returns {HTMLElement} Elemen pesan yang dibuat
 */
function addMessage(text, sender) {
  const messagesContainer = document.getElementById('messages-container');
  if (!messagesContainer) return null;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
  
  const avatar = sender === 'user' ? 
    '<div class="avatar user-avatar"><i class="fas fa-user"></i></div>' :
    '<div class="avatar ai-avatar"><i class="fas fa-robot"></i></div>';
  
  const messageId = 'msg-' + Date.now();
  
  messageDiv.innerHTML = `
    ${avatar}
    <div class="message-content">
      <div class="message-text">${formatMessage(text)}</div>
      <div class="message-time">${getCurrentTime()}</div>
    </div>
    <div class="message-actions" id="actions-${messageId}">
      ${sender === 'user' ? 
        `<button class="message-action" onclick="editMessage('${messageId}')"><i class="fas fa-edit"></i> Edit</button>
         <button class="message-action" onclick="copyMessage('${messageId}')"><i class="fas fa-copy"></i> Salin</button>
         <button class="message-action" onclick="downloadMessage('${messageId}')"><i class="fas fa-download"></i> Unduh</button>` :
        `<button class="message-action" onclick="copyMessage('${messageId}')"><i class="fas fa-copy"></i> Salin</button>
         <button class="message-action" onclick="regenerateMessage('${messageId}')"><i class="fas fa-redo"></i> Buat Ulang</button>
         <button class="message-action" onclick="downloadMessage('${messageId}')"><i class="fas fa-download"></i> Unduh</button>`
      }
    </div>
  `;
  
  messageDiv.id = messageId;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  return messageDiv;
}

/**
 * Menambahkan indikator loading
 * @returns {string} ID elemen loading
 */
function addLoadingIndicator() {
  const messagesContainer = document.getElementById('messages-container');
  if (!messagesContainer) return '';
  
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message ai-message loading';
  loadingDiv.id = 'loading-' + Date.now();
  
  loadingDiv.innerHTML = `
    <div class="avatar ai-avatar"><i class="fas fa-robot"></i></div>
    <div class="message-content">
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  
  messagesContainer.appendChild(loadingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  return loadingDiv.id;
}

/**
 * Memperbarui konten pesan (dari loading ke respons)
 * @param {string} messageId - ID pesan yang akan diperbarui
 * @param {string} content - Konten baru
 */
function updateMessage(messageId, content) {
  const messageEl = document.getElementById(messageId);
  if (!messageEl) return;
  
  messageEl.classList.remove('loading');
  const messageContent = messageEl.querySelector('.message-content');
  if (messageContent) {
    messageContent.innerHTML = `
      <div class="message-text">${formatMessage(content)}</div>
      <div class="message-time">${getCurrentTime()}</div>
    `;
    
    // Tambahkan actions untuk pesan AI
    if (messageEl.classList.contains('ai-message')) {
      const actionsHtml = `
        <div class="message-actions" id="actions-${messageId}">
          <button class="message-action" onclick="copyMessage('${messageId}')"><i class="fas fa-copy"></i> Salin</button>
          <button class="message-action" onclick="regenerateMessage('${messageId}')"><i class="fas fa-redo"></i> Buat Ulang</button>
          <button class="message-action" onclick="downloadMessage('${messageId}')"><i class="fas fa-download"></i> Unduh</button>
        </div>
      `;
      messageEl.insertAdjacentHTML('beforeend', actionsHtml);
    }
  }
}

/**
 * Memuat obrolan tertentu
 * @param {string} chatId - ID obrolan yang akan dimuat
 */
function loadChat(chatId) {
  const chat = chatHistory[chatId];
  if (!chat) return;
  
  currentChatId = chatId;
  
  // Perbarui UI
  const welcomeScreen = document.getElementById('welcome-screen');
  const chatScreen = document.getElementById('chat-screen');
  const messagesContainer = document.getElementById('messages-container');
  
  if (welcomeScreen && chatScreen && messagesContainer) {
    welcomeScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    
    // Hapus pesan dan muat ulang
    messagesContainer.innerHTML = '';
    chat.messages.forEach(msg => {
      addMessage(msg.content, msg.role);
    });
  }
  
  // Perbarui pemilihan model
  const modelSelect = document.getElementById('model-select');
  const currentModelBadge = document.getElementById('current-model');
  
  if (modelSelect && currentModelBadge) {
    currentModel = chat.model;
    modelSelect.value = currentModel;
    currentModelBadge.textContent = getModelDisplayName(currentModel);
  }
  
  // Perbarui judul obrolan
  const currentChatTitle = document.getElementById('current-chat-title');
  if (currentChatTitle) {
    currentChatTitle.textContent = chat.title;
  }
  
  // Tutup sidebar di perangkat mobile setelah memilih obrolan
  if (window.innerWidth <= 768) {
    toggleSidebar();
  }
}

/**
 * Menghapus obrolan
 * @param {string} chatId - ID obrolan yang akan dihapus
 */
function deleteChat(chatId) {
  if (!confirm('Apakah Anda yakin ingin menghapus obrolan ini?')) return;
  
  // Hapus dari objek riwayat
  delete chatHistory[chatId];
  
  // Hapus dari UI
  const chatItem = document.querySelector(`.history-item[data-chat-id="${chatId}"]`);
  if (chatItem) chatItem.remove();
  
  // Jika obrolan yang dihapus sedang aktif, buat yang baru
  if (currentChatId === chatId) {
    startNewChat();
  }
  
  // Simpan perubahan
  saveChatHistory();
}

/**
 * Menambahkan obrolan ke sidebar riwayat
 * @param {string} chatId - ID obrolan
 * @param {string} title - Judul obrolan
 */
function addChatToHistory(chatId, title) {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;
  
  const chatItem = document.createElement('div');
  chatItem.className = 'history-item';
  chatItem.dataset.chatId = chatId;
  
  chatItem.innerHTML = `
    <i class="fas fa-message"></i>
    <span class="history-title">${title}</span>
    <button class="delete-chat" onclick="deleteChat('${chatId}')">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  chatItem.addEventListener('click', () => loadChat(chatId));
  historyList.prepend(chatItem);
}

/**
 * Memperbarui judul obrolan di sidebar
 * @param {string} chatId - ID obrolan
 * @param {string} newTitle - Judul baru
 */
function updateChatTitle(chatId, newTitle) {
  const chatItem = document.querySelector(`.history-item[data-chat-id="${chatId}"]`);
  if (chatItem) {
    const titleElement = chatItem.querySelector('.history-title');
    if (titleElement) {
      titleElement.textContent = newTitle;
    }
  }
  
  const currentChatTitle = document.getElementById('current-chat-title');
  if (currentChatTitle) {
    currentChatTitle.textContent = newTitle;
  }
}

/**
 * Menyimpan riwayat obrolan ke localStorage
 */
function saveChatHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

/**
 * Memuat riwayat obrolan dari localStorage
 */
function loadChatHistory() {
  const savedHistory = localStorage.getItem('chatHistory');
  if (savedHistory) {
    chatHistory = JSON.parse(savedHistory);
    
    // Isi daftar riwayat
    Object.keys(chatHistory).forEach(chatId => {
      const chat = chatHistory[chatId];
      addChatToHistory(chatId, chat.title);
    });
  }
}

/**
 * Mengekspor obrolan ke file
 */
function exportChat() {
  if (!currentChatId) return;
  
  const chat = chatHistory[currentChatId];
  let exportText = `Ekspor Obrolan Zeta GenAI\n`;
  exportText += `Tanggal: ${new Date().toLocaleString()}\n`;
  exportText += `Model: ${getModelDisplayName(chat.model)}\n\n`;
  
  chat.messages.forEach(msg => {
    exportText += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
  });
  
  const blob = new Blob([exportText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `zeta-chat-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
}

/**
 * Menghasilkan kode QR
 */
function generateQRCode() {
  const text = prompt("Masukkan teks atau URL untuk kode QR:");
  if (!text) return;
  
  // Menggunakan layanan pembuatan kode QR
  window.open(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`, '_blank');
}

/**
 * Menghapus obrolan saat ini
 */
function clearChat() {
  if (!confirm('Hapus semua pesan dalam obrolan ini?')) return;
  
  if (currentChatId && chatHistory[currentChatId]) {
    chatHistory[currentChatId].messages = [];
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
    saveChatHistory();
  }
}

// Fungsi untuk mengelola pesan
function editMessage(messageId) {
  // Implementasi edit pesan
}

function copyMessage(messageId) {
  // Implementasi salin pesan
}

function regenerateMessage(messageId) {
  // Implementasi buat ulang pesan
}

function downloadMessage(messageId) {
  // Implementasi unduh pesan
}
