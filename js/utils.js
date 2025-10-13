// Utility functions

/**
 * Memformat ukuran file menjadi string yang mudah dibaca
 * @param {number} bytes - Ukuran file dalam bytes
 * @returns {string} Ukuran file yang diformat
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * Mendapatkan ikon Font Awesome berdasarkan tipe file
 * @param {string} fileType - Tipe MIME file
 * @returns {string} Kelas ikon Font Awesome
 */
function getFileIcon(fileType) {
  if (fileType.startsWith('image/')) return 'fa-file-image';
  if (fileType.startsWith('video/')) return 'fa-file-video';
  if (fileType === 'application/pdf') return 'fa-file-pdf';
  if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fa-file-excel';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fa-file-powerpoint';
  if (fileType.includes('zip') || fileType.includes('compressed')) return 'fa-file-archive';
  return 'fa-file';
}

/**
 * Mendapatkan tipe file dari nama file
 * @param {string} fileName - Nama file
 * @returns {string} Kategori tipe file
 */
function getFileTypeFromName(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const videoExtensions = ['mp4', 'webm', 'avi', 'mov', 'wmv'];
  const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  
  if (imageExtensions.includes(extension)) return 'image';
  if (videoExtensions.includes(extension)) return 'video';
  if (audioExtensions.includes(extension)) return 'audio';
  if (documentExtensions.includes(extension)) return 'document';
  return 'other';
}

/**
 * Memvalidasi format email
 * @param {string} email - Alamat email yang akan divalidasi
 * @returns {boolean} True jika email valid
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Mendapatkan waktu saat ini dalam format yang mudah dibaca
 * @returns {string} Waktu yang diformat
 */
function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Memformat teks pesan (mengganti line breaks dengan <br>)
 * @param {string} text - Teks yang akan diformat
 * @returns {string} Teks yang telah diformat
 */
function formatMessage(text) {
  return text.replace(/\n/g, '<br>');
}

/**
 * Menghasilkan ID unik
 * @param {string} prefix - Prefix untuk ID
 * @returns {string} ID unik
 */
function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function untuk membatasi frekuensi pemanggilan fungsi
 * @param {Function} func - Fungsi yang akan di-debounce
 * @param {number} wait - Waktu tunggu dalam milidetik
 * @returns {Function} Fungsi yang telah di-debounce
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Memeriksa apakah model tertentu hanya untuk pengguna premium
 * @param {string} modelId - ID model
 * @returns {boolean} True jika model hanya untuk premium
 */
function isPremiumModel(modelId) {
  const premiumModels = [
    'google/gemini-pro',
    'openai/gpt-3.5-turbo',
    'openai/gpt-4',
    'anthropic/claude-2'
  ];
  return premiumModels.includes(modelId);
}

/**
 * Mendapatkan nama tampilan untuk model
 * @param {string} modelId - ID model
 * @returns {string} Nama tampilan model
 */
function getModelDisplayName(modelId) {
  const modelMap = {
    'gen-1': 'Gen 1',
    'gen-1o': 'Gen 1o',
    'gen-1.2': 'Gen 1.2',
    'nvidia/nemotron-nano-9b-v2:free': 'Nemotron Nano',
    'google/gemini-pro': 'Gemini Pro',
    'openai/gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'openai/gpt-4': 'GPT-4',
    'anthropic/claude-2': 'Claude 2',
    'google/gemini-2.0-flash-exp:free': 'Gemini 2.0 Flash',
    'openai/gpt-oss-120b:free': 'GPT OSS 120B',
    'x-ai/grok-4-fast:free': 'Grok-4 Fast'
  };
  
  return modelMap[modelId] || modelId;
}

/**
 * Mendapatkan nama tampilan untuk tool
 * @param {string} tool - ID tool
 * @returns {string} Nama tampilan tool
 */
function getToolDisplayName(tool) {
  const toolNames = {
    'learn': 'Belajar',
    'research': 'Riset Mendalam',
    'think': 'Berpikir Panjang',
    'code': 'Buat Kode',
    'thesis': 'Buat Skripsi',
    'image': 'Buat Gambar'
  };
  return toolNames[tool] || tool;
}

// Export functions untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatFileSize,
    getFileIcon,
    getFileTypeFromName,
    isValidEmail,
    getCurrentTime,
    formatMessage,
    generateId,
    debounce,
    isPremiumModel,
    getModelDisplayName,
    getToolDisplayName
  };
}
