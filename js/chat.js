// Chat management functions

/**
 * Memulai obrolan baru
 */
function startNewChat() {
  currentChatId = 'chat-' + Date.now();

  chatHistory[currentChatId] = {
    id: currentChatId,
    title: 'Obrolan Baru',
    model: currentModel,
    timestamp: Date.now(),
    messages: []
  };

  const welcomeScreen = document.getElementById('welcome-screen');
  const chatScreen = document.getElementById('chat-screen');
  const messagesContainer = document.getElementById('messages-container');

  if (welcomeScreen && chatScreen && messagesContainer) {
    welcomeScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    messagesContainer.innerHTML = '';
  }

  addChatToHistory(currentChatId, 'Obrolan Baru');
  saveChatHistory();
}

/**
 * Membuat elemen pesan
 */
function addMessage(text, sender) {
  const messagesContainer = document.getElementById('messages-container');
  if (!messagesContainer) return null;

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;

  const avatar = sender === 'user'
    ? '<div class="avatar user-avatar"><i class="fas fa-user"></i></div>'
    : '<div class="avatar ai-avatar"><i class="fas fa-robot"></i></div>';

  const messageId = 'msg-' + Date.now();

  messageDiv.innerHTML = `
    ${avatar}
    <div class="message-content">
      <div class="message-text">${formatMessage(text)}</div>
      <div class="message-footer">
        <span class="message-time">${getCurrentTime()}</span>
        <div class="message-actions" id="actions-${messageId}">
          ${sender === 'user'
            ? `
              <button class="message-action" onclick="editMessage('${messageId}')"><i class="fas fa-edit"></i></button>
              <button class="message-action" onclick="copyMessage('${messageId}')"><i class="fas fa-copy"></i></button>
              <button class="message-action" onclick="downloadMessage('${messageId}')"><i class="fas fa-download"></i></button>
            `
            : `
              <button class="message-action" onclick="copyMessage('${messageId}')"><i class="fas fa-copy"></i></button>
              <button class="message-action" onclick="regenerateMessage('${messageId}')"><i class="fas fa-redo"></i></button>
              <button class="message-action" onclick="downloadMessage('${messageId}')"><i class="fas fa-download"></i></button>
            `
          }
        </div>
      </div>
    </div>
  `;

  messageDiv.id = messageId;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return messageDiv;
}

/**
 * Indikator loading
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
        <span></span><span></span><span></span>
      </div>
    </div>
  `;

  messagesContainer.appendChild(loadingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return loadingDiv.id;
}

/**
 * Update pesan dari loading ke respons
 */
function updateMessage(messageId, content) {
  const messageEl = document.getElementById(messageId);
  if (!messageEl) return;

  messageEl.classList.remove('loading');
  const messageContent = messageEl.querySelector('.message-content');
  if (messageContent) {
    messageContent.innerHTML = `
      <div class="message-text">${formatMessage(content)}</div>
      <div class="message-footer">
        <span class="message-time">${getCurrentTime()}</span>
        <div class="message-actions" id="actions-${messageId}">
          <button class="message-action" onclick="copyMessage('${messageId}')"><i class="fas fa-copy"></i></button>
          <button class="message-action" onclick="regenerateMessage('${messageId}')"><i class="fas fa-redo"></i></button>
          <button class="message-action" onclick="downloadMessage('${messageId}')"><i class="fas fa-download"></i></button>
        </div>
      </div>
    `;
  }
}
