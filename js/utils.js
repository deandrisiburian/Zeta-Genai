// ================================
// Utility Functions
// ================================

/**
 * Format ukuran file agar mudah dibaca
 * @param {number} bytes - Ukuran file dalam bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * Ambil ikon Font Awesome berdasarkan tipe MIME
 * @param {string} fileType
 * @returns {string}
 */
function getFileIcon(fileType = "") {
  if (fileType.startsWith("image/")) return "fa-file-image";
  if (fileType.startsWith("video/")) return "fa-file-video";
  if (fileType === "application/pdf") return "fa-file-pdf";
  if (/word|document/i.test(fileType)) return "fa-file-word";
  if (/excel|spreadsheet/i.test(fileType)) return "fa-file-excel";
  if (/powerpoint|presentation/i.test(fileType)) return "fa-file-powerpoint";
  if (/zip|compressed/i.test(fileType)) return "fa-file-archive";
  return "fa-file";
}

/**
 * Ambil kategori file dari nama ekstensi
 * @param {string} fileName
 * @returns {string}
 */
function getFileTypeFromName(fileName = "") {
  const ext = fileName.split(".").pop().toLowerCase();
  const map = {
    image: ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
    video: ["mp4", "webm", "avi", "mov", "wmv"],
    audio: ["mp3", "wav", "ogg", "m4a"],
    document: ["pdf", "doc", "docx", "txt", "rtf"],
  };

  return Object.keys(map).find(type => map[type].includes(ext)) || "other";
}

/**
 * Validasi email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Ambil waktu sekarang (HH:MM)
 * @returns {string}
 */
function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Format teks pesan (line break -> <br>)
 * @param {string} text
 * @returns {string}
 */
function formatMessage(text = "") {
  return text.replace(/\n/g, "<br>");
}

/**
 * Generate unique ID
 * @param {string} prefix
 * @returns {string}
 */
function generateId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
function debounce(func, wait = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Cek apakah model premium
 * @param {string} modelId
 * @returns {boolean}
 */
function isPremiumModel(modelId = "") {
  const premiumModels = [
    "google/gemini-pro",
    "openai/gpt-3.5-turbo",
    "openai/gpt-4",
    "anthropic/claude-2",
  ];
  return premiumModels.includes(modelId);
}

/**
 * Ambil nama tampilan model
 * @param {string} modelId
 * @returns {string}
 */
function getModelDisplayName(modelId = "") {
  const modelMap = {
    "gen-1": "Gen 1",
    "gen-1o": "Gen 1o",
    "gen-1.2": "Gen 1.2",
    "nvidia/nemotron-nano-9b-v2:free": "Nemotron Nano",
    "google/gemini-pro": "Gemini Pro",
    "openai/gpt-3.5-turbo": "GPT-3.5 Turbo",
    "openai/gpt-4": "GPT-4",
    "anthropic/claude-2": "Claude 2",
    "google/gemini-2.0-flash-exp:free": "Gemini 2.0 Flash",
    "openai/gpt-oss-120b:free": "GPT OSS 120B",
    "x-ai/grok-4-fast:free": "Grok-4 Fast",
  };

  return modelMap[modelId] || modelId;
}

/**
 * Ambil nama tampilan tool
 * @param {string} tool
 * @returns {string}
 */
function getToolDisplayName(tool = "") {
  const toolMap = {
    learn: "Belajar",
    research: "Riset Mendalam",
    think: "Berpikir Panjang",
    code: "Buat Kode",
    thesis: "Buat Skripsi",
    image: "Buat Gambar",
  };
  return toolMap[tool] || tool;
}

// Export (Node.js + Browser compatibility)
if (typeof module !== "undefined" && module.exports) {
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
    getToolDisplayName,
  };
}
