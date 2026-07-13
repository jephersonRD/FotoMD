const Enhancer = {
  mode: 'auto',

  open() {
    App.showToolWorkspace('Mejorador de calidad');
    const content = document.getElementById('tool-content');
    content.innerHTML = `
      <p style="color:var(--text-secondary);margin-bottom:1rem">Mejora la calidad de tus imágenes con un solo clic.</p>
      <div class="option-group">
        <label>Modo de mejora</label>
        <div class="tab-selector">
          <button class="active" data-mode="auto">Automático</button>
          <button data-mode="x2">x2</button>
          <button data-mode="x4">x4</button>
        </div>
      </div>
      <div class="preview-container">
        <canvas id="enhance-canvas" style="width:100%;height:auto"></canvas>
      </div>
      <div class="action-row">
        <button id="enhance-btn" class="btn-primary">Mejorar imágenes</button>
      </div>
      <div id="enhance-progress" class="progress-container hidden">
        <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
        <div class="progress-text" id="enhance-status">Procesando...</div>
      </div>
      <div id="enhance-results"></div>
    `;

    const canvas = document.getElementById('enhance-canvas');
    canvas.width = Uploader.images[0]?.width || 400;
    canvas.height = Uploader.images[0]?.height || 300;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(Uploader.images[0]?.img, 0, 0);

    document.querySelectorAll('.tab-selector button').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-selector button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.mode = btn.dataset.mode;
      });
    });

    document.getElementById('enhance-btn').addEventListener('click', () => this.enhance());
  },

  async enhance() {
    const progress = document.getElementById('enhance-progress');
    const status = document.getElementById('enhance-status');
    const results = document.getElementById('enhance-results');
    progress.classList.remove('hidden');
    results.innerHTML = '';

    for (let i = 0; i < Uploader.images.length; i++) {
      const img = Uploader.images[i];
      status.textContent = `Mejorando ${img.name} (${i + 1}/${Uploader.images.length})`;
      progress.querySelector('.progress-fill').style.width = `${(i / Uploader.images.length) * 100}%`;

      const canvas = document.createElement('canvas');
      const scale = this.mode === 'x2' ? 2 : this.mode === 'x4' ? 4 : 1.5;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';

      ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
      ctx.drawImage(img.img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      img.enhancedBlob = blob;

      const card = document.createElement('div');
      card.className = 'comparison';
      card.innerHTML = `
        <div class="comparison-box"><div class="label">Original</div><div class="value">${img.width}x${img.height}</div></div>
        <div class="comparison-box"><div class="label">Mejorada</div><div class="value">${canvas.width}x${canvas.height}</div></div>
      `;
      results.appendChild(card);
    }

    progress.querySelector('.progress-fill').style.width = '100%';
    status.textContent = 'Mejora completada';
    Toast.show('Imágenes mejoradas', 'success');

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-primary';
    exportBtn.textContent = 'Exportar imágenes mejoradas';
    exportBtn.onclick = () => Exporter.open();
    results.appendChild(exportBtn);
  }
};
