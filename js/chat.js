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
  
  const messageId = 'msg-' + Date.now();
  
  messageDiv.innerHTML = `
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
         <button class="message-action" onclick="downloadMessage('${messageId}')"><i class="fas fa-download"></i> Unduh</button> 
         <button class="message-action" onclick="regenerateMessage('${messageId}')"><i class="fas fa-redo"></i> Buat Ulang</button>`
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
    <svg class="icon-PIRQLq" width="20" height="20" fill="none" viewBox="0 0 256 256" style="min-width: 20px; min-height: 20px; color: var(--theme-icon-secondary);"><g><path fill="currentColor" d="M57 108c0-49.767 40.592-90 90.526-90s90.526 40.233 90.526 90c0 11.219-2.069 21.979-5.857 31.909a103.995 103.995 0 0 0-.774 2.071l.004.043c.032.331.086.781.192 1.638l4.06 32.98c.188 1.522.401 3.248.452 4.75.056 1.663-.014 4.244-1.253 6.952a15 15 0 0 1-7.715 7.539c-2.736 1.176-5.318 1.187-6.979 1.092-1.501-.085-3.222-.338-4.738-.561l-32.13-4.71c-.884-.129-1.349-.197-1.69-.237a.916.916 0 0 0-.046-.005l-.141.048c-.427.149-1.007.365-1.999.737-9.939 3.722-20.699 5.754-31.912 5.754-1.796 0-3.58-.052-5.352-.155C132.644 221.332 110.001 238 83.316 238a62.462 62.462 0 0 1-20.821-3.556c-1.08-.381-1.75-.617-2.242-.78l-.22-.071a78.15 78.15 0 0 0-1.731.225l-29.949 4.09a9.998 9.998 0 0 1-11.117-12.069l6.114-27.617a77.301 77.301 0 0 0 .41-1.919 21.698 21.698 0 0 0-.07-.237 134.95 134.95 0 0 0-.8-2.493A66.171 66.171 0 0 1 19.632 173c0-26.261 15.332-49.086 37.547-59.3a90.747 90.747 0 0 1-.18-5.7Zm20 .314a63.34 63.34 0 0 1 6.316-.314C118.715 108 147 137.331 147 173c0 1.68-.063 3.347-.186 4.997.237.002.474.003.712.003 8.783 0 17.169-1.589 24.896-4.483l.429-.162c1.413-.531 3.08-1.159 4.603-1.48a18.96 18.96 0 0 1 4.002-.427c1.551-.009 3.129.225 4.403.414l.356.053 29.257 4.288-3.705-30.098-.043-.345c-.154-1.235-.345-2.763-.31-4.261.033-1.375.172-2.519.47-3.861.325-1.468.942-3.078 1.466-4.442l.158-.415c2.934-7.691 4.544-16.038 4.544-24.781 0-38.598-31.513-70-70.526-70C108.514 38 77 69.402 77 108v.314Zm48.608 76.019A46.455 46.455 0 0 0 127 173c0-25.082-19.785-45-43.684-45-23.9 0-43.684 19.918-43.684 45a46.172 46.172 0 0 0 2.448 14.906c.562 1.712 1.2 3.652 1.456 5.283.24 1.531.298 2.709.208 4.256-.095 1.641-.472 3.33-.78 4.707l-.087.392-3.012 13.606 15.73-2.148.355-.049c1.243-.172 2.769-.383 4.232-.373 1.385.01 2.416.115 3.774.386 1.441.287 3.17.9 4.704 1.444l.491.174A42.451 42.451 0 0 0 83.316 218c19.996 0 37.111-13.943 42.169-33.188.037-.161.079-.321.123-.479Zm-65.427 49.249h-.006.006Z" clip-rule="evenodd" fill-rule="evenodd" data-follow-fill="#000"></path></g></svg>
    <span class="history-title">${title}</span>
    <button class="delete-chat" onclick="deleteChat('${chatId}')">
      <svg class="icon-PIRQLq" width="16" height="16" fill="none" viewBox="0 0 256 256" style="min-width: 16px; min-height: 16px;"><g><path fill="currentColor" d="M128 42c-47.496 0-86 38.504-86 86s38.504 86 86 86 86-38.504 86-86-38.504-86-86-86ZM22 128C22 69.458 69.458 22 128 22s106 47.458 106 106-47.458 106-106 106S22 186.542 22 128Z" clip-rule="evenodd" fill-rule="evenodd" data-follow-fill="#000"></path><path fill="currentColor" d="M160.854 81.004c3.864-3.946 10.195-4.013 14.141-.15 3.947 3.864 4.014 10.195.151 14.142l-32.968 33.676 32.824 32.188c3.943 3.867 4.005 10.198.138 14.142-3.867 3.943-10.198 4.005-14.142.138L128 142.78l-32.998 32.36c-3.944 3.867-10.275 3.805-14.142-.138-3.867-3.944-3.805-10.275.138-14.142l32.824-32.188-32.968-33.676c-3.863-3.947-3.796-10.278.15-14.142 3.947-3.863 10.278-3.796 14.142.15L128 114.565l32.854-33.56Z" clip-rule="evenodd" fill-rule="evenodd" data-follow-fill="#000"></path></g></svg>
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
 // Fungsi untuk mengedit pesan
    function editMessage(messageId) {
      const messageElement = document.getElementById(messageId);
      const messageText = messageElement.querySelector('.message-text');
      const originalText = messageText.textContent;
      
      // Ganti dengan input field
      messageText.innerHTML = `<textarea id="message-edit" oninput="autoResize(this)" style="height: auto;">${originalText}</textarea>`;
      
      // Tambahkan tombol save dan cancel
      const actions = document.getElementById(`actions-${messageId}`);
      actions.innerHTML = `
        <button class="message-action" onclick="saveMessageEdit('${messageId}')"><i class="fas fa-save"></i> Perbarui</button>
        <button class="message-action" onclick="cancelMessageEdit('${messageId}', '${originalText}')"><i class="fas fa-times"></i> Batalkan</button>
      `;
    }
    // Fungsi untuk menyimpan edit pesan
    function saveMessageEdit(messageId) {
      const messageElement = document.getElementById(messageId);
      const textarea = messageElement.querySelector('.message-edit');
      const newText = textarea.value;
      
      // Kembalikan ke format normal
      messageElement.querySelector('.message-text').innerHTML = formatMessage(newText);
      
      // Kembalikan actions
      const actions = document.getElementById(`actions-${messageId}`);
      actions.innerHTML = `
        <button class="message-action" onclick="editMessage('${messageId}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="message-action" onclick="copyMessage('${messageId}')"><i class="fas fa-copy"></i> Salin</button>
        <button class="message-action" onclick="downloadMessage('${messageId}')"><i class="fas fa-download"></i> Unduh</button>
      `;
      
      // Update chat history
      if (currentChatId && chatHistory[currentChatId]) {
        const messageIndex = Array.from(messagesContainer.children).indexOf(messageElement);
        if (messageIndex !== -1 && chatHistory[currentChatId].messages[messageIndex]) {
          chatHistory[currentChatId].messages[messageIndex].content = newText;
          saveChatHistory();
        }
      }
      
      showNotification('Pesan diperbarui', 'success');
    }
    // Fungsi untuk membatalkan edit pesan
    function cancelMessageEdit(messageId, originalText) {
      const messageElement = document.getElementById(messageId);
      messageElement.querySelector('.message-text').innerHTML = formatMessage(originalText);
      
      // Kembalikan actions
      const actions = document.getElementById(`actions-${messageId}`);
      actions.innerHTML = `
        <button class="message-action" onclick="editMessage('${messageId}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="message-action" onclick="copyMessage('${messageId}')"><i class="fas fa-copy"></i> Salin</button>
        <button class="message-action" onclick="downloadMessage('${messageId}')"><i class="fas fa-download"></i> Unduh</button>
      `;
    }
    // Fungsi untuk menyalin pesan
    function copyMessage(messageId) {
      const messageElement = document.getElementById(messageId);
      const messageText = messageElement.querySelector('.message-text').textContent;
      
      navigator.clipboard.writeText(messageText).then(() => {
        showNotification('Pesan disalin ke clipboard', 'success');
      }).catch(err => {
        console.error('Gagal untuk menyalin: ', err);
        showNotification('Gagal menyalin pesan', 'error');
      });
    }
    // Fungsi untuk regenerate pesan AI
    async function regenerateMessage(messageId) {
      const messageElement = document.getElementById(messageId);
      const messageIndex = Array.from(messagesContainer.children).indexOf(messageElement);
      
      // Dapatkan pesan user sebelumnya
      if (messageIndex > 0 && currentChatId && chatHistory[currentChatId]) {
        const userMessage = chatHistory[currentChatId].messages[messageIndex - 1];
        
        if (userMessage && userMessage.role === 'user') {
          // Hapus pesan AI yang lama
          messageElement.remove();
          
          // Tambahkan loading indicator
          const loadingId = addLoadingIndicator();
          
          try {
            // Dapatkan respons AI baru
            const aiResponse = await fetchAIResponse(userMessage.content);
            
            // Update chat history
            chatHistory[currentChatId].messages[messageIndex] = { role: 'assistant', content: aiResponse };
            
            // Save to local storage
            saveChatHistory();
            
            // Update UI dengan respons baru
            updateMessage(loadingId, aiResponse);
          } catch (err) {
            console.error('Error membuat ulang respons AI:', err);
            updateMessage(loadingId, `Maaf, Saya tidak mengenal error: ${err.message}. Coba lagi nanti.`);
            showNotification('Gagal untuk membuat ulang respons. Coba lagi nanti.', 'error');
          }
        }
      }
    }
    // Fungsi untuk mengunduh pesan
    function downloadMessage(messageId) {
      const messageElement = document.getElementById(messageId);
      const messageText = messageElement.querySelector('.message-text').textContent;
      const sender = messageElement.classList.contains('user-message') ? 'User' : 'AI';
      const timestamp = messageElement.querySelector('.message-time').textContent;
      
      const content = `${sender} (${timestamp}):\n${messageText}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `zeta-message-${messageId}.txt`;
      link.click();
    }