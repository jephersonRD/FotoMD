const BatchProcessor = {
  open() {
    App.showToolWorkspace('Procesamiento múltiple');
    const content = document.getElementById('tool-content');
    content.innerHTML = `
      <p style="color:var(--text-secondary);margin-bottom:1rem">Aplica la misma configuración a todas las imágenes cargadas.</p>
      <div class="option-group">
        <label>Acciones a aplicar</label>
        <div class="tab-selector" style="flex-direction:column;border:none;gap:0.5rem">
          <label style="display:flex;align-items:center;gap:0.5rem;color:var(--text-primary);font-size:0.9rem">
            <input type="checkbox" id="batch-compress" checked> Comprimir
          </label>
          <label style="display:flex;align-items:center;gap:0.5rem;color:var(--text-primary);font-size:0.9rem">
            <input type="checkbox" id="batch-enhance" checked> Mejorar calidad
          </label>
          <label style="display:flex;align-items:center;gap:0.5rem;color:var(--text-primary);font-size:0.9rem">
            <input type="checkbox" id="batch-resize"> Redimensionar a 1920x1080
          </label>
        </div>
      </div>
      <div class="action-row">
        <button id="batch-start-btn" class="btn-primary">Procesar todas</button>
      </div>
      <div id="batch-progress" class="progress-container hidden">
        <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
        <div class="progress-text" id="batch-status">Procesando...</div>
      </div>
      <div id="batch-results"></div>
    `;

    document.getElementById('batch-start-btn').addEventListener('click', () => this.process());
  },

  async process() {
    const progress = document.getElementById('batch-progress');
    const status = document.getElementById('batch-status');
    const results = document.getElementById('batch-results');
    const doCompress = document.getElementById('batch-compress').checked;
    const doEnhance = document.getElementById('batch-enhance').checked;
    const doResize = document.getElementById('batch-resize').checked;

    progress.classList.remove('hidden');
    results.innerHTML = '';

    for (let i = 0; i < Uploader.images.length; i++) {
      const img = Uploader.images[i];
      status.textContent = `Procesando ${img.name} (${i + 1}/${Uploader.images.length})`;
      progress.querySelector('.progress-fill').style.width = `${(i / Uploader.images.length) * 100}%`;

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (doResize) {
        canvas.width = 1920;
        canvas.height = 1080;
      }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img.img, 0, 0, canvas.width, canvas.height);

      if (doEnhance) {
        ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
        ctx.drawImage(canvas, 0, 0);
      }

      let quality = 0.85;
      if (doCompress) {
        quality = 0.75;
      }

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      img.batchBlob = blob;

      results.innerHTML += `<div style="color:var(--text-secondary);font-size:0.85rem;padding:0.25rem 0">✓ ${img.name} procesada</div>`;
    }

    progress.querySelector('.progress-fill').style.width = '100%';
    status.textContent = 'Procesamiento completado';
    Toast.show(`${Uploader.images.length} imagen(es) procesadas`, 'success');

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-primary';
    exportBtn.textContent = 'Exportar imágenes';
    exportBtn.onclick = () => Exporter.open();
    results.appendChild(exportBtn);
  }
};
