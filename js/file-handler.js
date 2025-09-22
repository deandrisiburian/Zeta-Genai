// File upload and handling functions

/**
 * Menyiapkan event listener untuk upload file
 */
function setupFileUploadEvents() {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  
  if (!uploadArea || !fileInput) return;
  
  // Drag and drop functionality
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFileSelection(e.dataTransfer.files);
  });

  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });
}

/**
 * Menangani pemilihan file
 * @param {FileList} files - Daftar file yang dipilih
 */
function handleFileSelection(files) {
  const uploadedFilesContainer = document.getElementById('uploaded-files');
  if (!uploadedFilesContainer) return;
  
  uploadedFilesContainer.innerHTML = '';
  const validFiles = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Periksa ukuran file (maks 20MB)
    if (file.size > 20 * 1024 * 1024) {
      showNotification(`File "${file.name}" melebihi batas 20MB`, 'error');
      continue;
    }
    
    validFiles.push(file);
    
    // Buat preview untuk file
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';
    fileElement.innerHTML = `
      <div class="file-info">
        <i class="fas ${getFileIcon(file.type)}"></i>
        <span class="file-name">${file.name}</span>
        <span class="file-size">${formatFileSize(file.size)}</span>
      </div>
      <button class="remove-file" onclick="removeUploadedFile(this)">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    uploadedFilesContainer.appendChild(fileElement);
  }
}

/**
 * Menghapus file yang diupload dari daftar
 * @param {HTMLElement} button - Tombol hapus yang diklik
 */
function removeUploadedFile(button) {
  button.parentElement.remove();
}

/**
 * Memproses file yang diupload
 */
function processUploadedFiles() {
  const fileElements = document.querySelectorAll('.uploaded-file');
  if (fileElements.length === 0) {
    showNotification('Silakan pilih setidaknya satu file', 'error');
    return;
  }
  
  // Simulasi upload dan ekstraksi konten
  fileElements.forEach(fileElement => {
    const fileName = fileElement.querySelector('.file-name').textContent;
    const fileType = getFileTypeFromName(fileName);
    
    // Dalam implementasi nyata, ini akan mengupload file ke server
    // dan mendapatkan konten yang diekstrak
    setTimeout(() => {
      const simulatedContent = simulateFileExtraction(fileName, fileType);
      addMessage(simulatedContent, 'user');
    }, 1000);
  });
  
  closeModal('file-upload-modal');
  showNotification('File berhasil diupload', 'success');
}

/**
 * Mensimulasikan ekstraksi konten file
 * @param {string} fileName - Nama file
 * @param {string} fileType - Tipe file
 * @returns {string} Konten yang disimulasikan
 */
function simulateFileExtraction(fileName, fileType) {
  const baseMessage = `Saya telah mengupload file ${fileType}: ${fileName}. `;
  
  switch (fileType) {
    case 'image':
      return baseMessage + 'Gambar ini berisi konten visual yang ingin saya diskusikan.';
    case 'video':
      return baseMessage + 'Video ini berisi rekaman yang perlu dianalisis atau diinformasikan.';
    case 'document':
      return baseMessage + 'Dokumen ini berisi teks yang perlu saya pahami atau proses.';
    case 'audio':
      return baseMessage + 'Rekaman audio ini berisi informasi yang ingin saya diskusikan.';
    default:
      return baseMessage + 'File ini berisi data yang membutuhkan bantuan.';
  }
}

/**
 * Menangani perubahan gambar profil
 * @param {Event} event - Event perubahan input file
 */
function handleProfilePictureChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) { // Batas 5MB
    showNotification('Gambar profil harus kurang dari 5MB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const profilePictureImg = document.getElementById('profile-picture-img');
    if (profilePictureImg) {
      profilePictureImg.src = e.target.result;
    }
    userState.profilePicture = e.target.result;
    saveUserState();
    updateUserAvatar();
  };
  reader.readAsDataURL(file);
}

/**
 * Membuka modal upload file
 */
function showFileUploadModal() {
  const uploadedFilesContainer = document.getElementById('uploaded-files');
  if (uploadedFilesContainer) {
    uploadedFilesContainer.innerHTML = '';
  }
  closeAllModals();
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('file-upload-modal').classList.remove('hidden');
}
