const Exporter = {
  format: 'image/jpeg',
  ext: 'jpg',

  open() {
    App.showToolWorkspace('Exportar imágenes');
    const content = document.getElementById('tool-content');
    content.innerHTML = `
      <p style="color:var(--text-secondary);margin-bottom:1rem">Elige el formato y descarga tus imágenes.</p>
      <div class="option-group">
        <label>Formato de salida</label>
        <div class="format-selector">
          <button class="format-btn active" data-format="image/jpeg" data-ext="jpg">JPG</button>
          <button class="format-btn" data-format="image/png" data-ext="png">PNG</button>
          <button class="format-btn" data-format="image/webp" data-ext="webp">WebP</button>
        </div>
      </div>
      <div class="download-options">
        <div class="download-row">
          <button id="download-all-btn" class="btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Descargar todas (ZIP)
          </button>
          <button id="download-zip-btn" class="btn-secondary">Descargar ZIP</button>
        </div>
        <div id="download-list"></div>
      </div>
    `;

    document.querySelectorAll('.format-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.format-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.format = btn.dataset.format;
        this.ext = btn.dataset.ext;
      });
    });

    document.getElementById('download-all-btn').addEventListener('click', () => this.downloadAll());
    document.getElementById('download-zip-btn').addEventListener('click', () => this.downloadZip());

    this.renderList();
  },

  renderList() {
    const list = document.getElementById('download-list');
    list.innerHTML = '';
    Uploader.images.forEach((img, i) => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <img src="${img.url}" class="thumb" alt="${img.name}">
        <div class="info"><div class="name">${img.name}</div><div class="date">${Gallery.formatSize(img.size)}</div></div>
        <button class="action-btn" data-index="${i}">Descargar</button>
      `;
      item.querySelector('.action-btn').addEventListener('click', () => this.downloadSingle(i));
      list.appendChild(item);
    });
  },

  async downloadSingle(index) {
    const img = Uploader.images[index];
    const blob = img.compressedBlob || img.processedBlob || img.enhancedBlob || img.croppedBlob || img.resizedBlob || img.editedBlob || await this.blobFromImg(img);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PhotoMD_${index + 1}.${this.ext}`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.show(`Descargado ${img.name}`, 'success');
  },

  async downloadAll() {
    for (let i = 0; i < Uploader.images.length; i++) {
      await this.downloadSingle(i);
    }
  },

  async downloadZip() {
    if (typeof JSZip === 'undefined') {
      Toast.show('Descargando imágenes individualmente...', 'info');
      this.downloadAll();
      return;
    }
    const zip = new JSZip();
    for (let i = 0; i < Uploader.images.length; i++) {
      const img = Uploader.images[i];
      const blob = img.compressedBlob || img.processedBlob || img.enhancedBlob || img.croppedBlob || img.resizedBlob || img.editedBlob || await this.blobFromImg(img);
      zip.file(`PhotoMD_${i + 1}.${this.ext}`, blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PhotoMD_imagenes.zip';
    a.click();
    URL.revokeObjectURL(url);
    Toast.show('ZIP descargado', 'success');
  },

  blobFromImg(img) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img.img, 0, 0);
      canvas.toBlob(resolve, this.format, 0.92);
    });
  }
};
