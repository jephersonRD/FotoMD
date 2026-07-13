const Resizer = {
  width: 1920,
  height: 1080,
  preset: '',

  open() {
    App.showToolWorkspace('Redimensionador');
    const content = document.getElementById('tool-content');
    content.innerHTML = `
      <div class="option-group">
        <label>Resoluciones predefinidas</label>
        <div class="crop-aspects">
          <button class="crop-btn" data-w="1280" data-h="720">720p</button>
          <button class="crop-btn active" data-w="1920" data-h="1080">1080p</button>
          <button class="crop-btn" data-w="2560" data-h="1440">1440p</button>
          <button class="crop-btn" data-w="3840" data-h="2160">4K</button>
        </div>
      </div>
      <div class="option-group">
        <label>Anchura (px)</label>
        <input type="number" id="resize-width" value="1920" min="1" max="7680">
      </div>
      <div class="option-group">
        <label>Altura (px)</label>
        <input type="number" id="resize-height" value="1080" min="1" max="4320">
      </div>
      <div class="action-row">
        <button id="resize-btn" class="btn-primary">Redimensionar</button>
      </div>
      <div id="resize-progress" class="progress-container hidden">
        <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
        <div class="progress-text" id="resize-status">Procesando...</div>
      </div>
      <div id="resize-results"></div>
    `;

    document.querySelectorAll('.crop-btn[data-w]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.crop-btn[data-w]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('resize-width').value = btn.dataset.w;
        document.getElementById('resize-height').value = btn.dataset.h;
        this.width = parseInt(btn.dataset.w);
        this.height = parseInt(btn.dataset.h);
      });
    });

    document.getElementById('resize-width').addEventListener('input', (e) => { this.width = parseInt(e.target.value) || 1; });
    document.getElementById('resize-height').addEventListener('input', (e) => { this.height = parseInt(e.target.value) || 1; });

    document.getElementById('resize-btn').addEventListener('click', () => this.resize());
  },

  async resize() {
    const progress = document.getElementById('resize-progress');
    const status = document.getElementById('resize-status');
    const results = document.getElementById('resize-results');
    progress.classList.remove('hidden');
    results.innerHTML = '';

    for (let i = 0; i < Uploader.images.length; i++) {
      const img = Uploader.images[i];
      status.textContent = `Redimensionando ${img.name} (${i + 1}/${Uploader.images.length})`;
      progress.querySelector('.progress-fill').style.width = `${(i / Uploader.images.length) * 100}%`;

      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img.img, 0, 0, this.width, this.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      img.resizedBlob = blob;

      const card = document.createElement('div');
      card.className = 'comparison';
      card.innerHTML = `
        <div class="comparison-box"><div class="label">Original</div><div class="value">${img.width}x${img.height}</div></div>
        <div class="comparison-box"><div class="label">Redimensionada</div><div class="value">${this.width}x${this.height}</div></div>
      `;
      results.appendChild(card);
    }

    progress.querySelector('.progress-fill').style.width = '100%';
    status.textContent = 'Redimensionado completado';
    Toast.show('Imágenes redimensionadas', 'success');

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-primary';
    exportBtn.textContent = 'Exportar imágenes';
    exportBtn.onclick = () => Exporter.open();
    results.appendChild(exportBtn);
  }
};
