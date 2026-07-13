const BackgroundRemover = {
  bgColor: 'transparent',

  open() {
    App.showToolWorkspace('Eliminador de fondo');
    const content = document.getElementById('tool-content');
    content.innerHTML = `
      <p style="color:var(--text-secondary);margin-bottom:1rem">Selecciona el color de fondo y procesa las imágenes.</p>
      <div class="option-group">
        <label>Color de fondo</label>
        <div class="color-picker-group">
          <button class="color-option transparent active" data-color="transparent" title="Transparente"></button>
          <button class="color-option white" data-color="#FFFFFF" title="Blanco"></button>
          <button class="color-option black" data-color="#0D0D0D" title="Negro"></button>
        </div>
      </div>
      <div class="preview-container" id="bg-preview">
        <canvas id="bg-canvas" style="width:100%;height:auto"></canvas>
      </div>
      <div class="action-row">
        <button id="bg-process-btn" class="btn-primary">Eliminar fondo</button>
      </div>
      <div id="bg-progress" class="progress-container hidden">
        <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
        <div class="progress-text" id="bg-status">Procesando...</div>
      </div>
      <div id="bg-results"></div>
    `;

    document.querySelectorAll('.color-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.bgColor = btn.dataset.color;
      });
    });

    const canvas = document.getElementById('bg-canvas');
    canvas.width = Uploader.images[0]?.width || 400;
    canvas.height = Uploader.images[0]?.height || 300;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(Uploader.images[0]?.img, 0, 0);

    document.getElementById('bg-process-btn').addEventListener('click', () => this.process());
  },

  async process() {
    const progress = document.getElementById('bg-progress');
    const status = document.getElementById('bg-status');
    const results = document.getElementById('bg-results');
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
      ctx.drawImage(img.img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let p = 0; p < data.length; p += 4) {
        const r = data[p], g = data[p + 1], b = data[p + 2];
        const brightness = (r + g + b) / 3;
        const isBg = brightness > 200;
        if (isBg) {
          data[p + 3] = this.bgColor === 'transparent' ? 0 : 255;
          if (this.bgColor !== 'transparent') {
            const bg = this.hexToRgb(this.bgColor);
            data[p] = bg.r; data[p + 1] = bg.g; data[p + 2] = bg.b;
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      img.processedBlob = blob;

      const preview = document.createElement('div');
      preview.className = 'comparison';
      preview.innerHTML = `
        <div class="comparison-box"><div class="label">Original</div><img src="${img.url}" style="width:100%;border-radius:4px;margin-top:0.5rem"></div>
        <div class="comparison-box"><div class="label">Sin fondo</div><img src="${URL.createObjectURL(blob)}" style="width:100%;border-radius:4px;margin-top:0.5rem"></div>
      `;
      results.appendChild(preview);
    }

    progress.querySelector('.progress-fill').style.width = '100%';
    status.textContent = 'Proceso completado';
    Toast.show('Fondo eliminado correctamente', 'success');

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-primary';
    exportBtn.textContent = 'Exportar imágenes';
    exportBtn.onclick = () => Exporter.open();
    results.appendChild(exportBtn);
  },

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
  }
};
