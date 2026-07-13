const Uploader = {
  images: [],
  maxCount: 1,

  init() {
    this.maxCount = parseInt(document.getElementById('image-count').value) || 1;
    this.bindEvents();
  },

  bindEvents() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const countInput = document.getElementById('image-count');
    const minusBtn = document.getElementById('count-minus');
    const plusBtn = document.getElementById('count-plus');

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      this.handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => this.handleFiles(fileInput.files));

    uploadBtn.addEventListener('click', () => fileInput.click());

    minusBtn.addEventListener('click', () => {
      const v = parseInt(countInput.value) || 1;
      if (v > 1) countInput.value = v - 1;
      this.maxCount = parseInt(countInput.value);
    });
    plusBtn.addEventListener('click', () => {
      const v = parseInt(countInput.value) || 1;
      if (v < 50) countInput.value = v + 1;
      this.maxCount = parseInt(countInput.value);
    });
    countInput.addEventListener('change', () => {
      this.maxCount = parseInt(countInput.value) || 1;
    });

    document.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (items) {
        const files = [];
        for (const item of items) {
          if (item.type.startsWith('image/')) files.push(item.getAsFile());
        }
        if (files.length) this.handleFiles(files);
      }
    });
  },

  handleFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!files.length) {
      Toast.show('No se encontraron imágenes válidas', 'error');
      return;
    }
    const total = this.images.length + files.length;
    if (total > this.maxCount) {
      Toast.show(`Máximo ${this.maxCount} imágenes`, 'error');
      return;
    }
    const loadPromises = files.map((f) => this.loadImage(f));
    Promise.all(loadPromises).then((results) => {
      const loaded = results.filter(Boolean);
      this.images = [...this.images, ...loaded];
      document.getElementById('upload-btn').disabled = false;
      Gallery.render();
      App.showSection('gallery');
      Toast.show(`${loaded.length} imagen(es) cargada(s)`, 'success');
      setTimeout(() => App.showSection('tools'), 800);
    });
  },

  loadImage(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        resolve({ file, img, url, name: file.name, size: file.size, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  },

  reset() {
    this.images = [];
    document.getElementById('image-count').value = 1;
    this.maxCount = 1;
    document.getElementById('upload-btn').disabled = true;
  }
};
