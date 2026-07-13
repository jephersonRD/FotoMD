const Compressor = {
  targetSize: 500 * 1024,
  format: 'image/jpeg',

  open() {
    App.showToolWorkspace('Compresor inteligente');
    const content = document.getElementById('tool-content');
    content.innerHTML = `
      <div class="compressor-options">
        <div class="option-group">
          <label>Tamaño objetivo</label>
          <div class="size-presets">
            <button class="size-preset" data-size="200">200 KB</button>
            <button class="size-preset active" data-size="500">500 KB</button>
            <button class="size-preset" data-size="1024">1 MB</button>
            <button class="size-preset" data-size="custom">Personalizado</button>
          </div>
        </div>
        <div class="option-group" id="custom-size-group" style="display:none">
          <label>Tamaño personalizado (KB)</label>
          <input type="number" id="custom-size" value="300" min="10" max="10000">
        </div>
        <div class="option-group">
          <label>Formato de salida</label>
          <select id="compress-format">
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
        <div class="action-row">
          <button id="compress-btn" class="btn-primary">Comprimir imágenes</button>
        </div>
        <div id="compress-progress" class="progress-container hidden">
          <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
          <div class="progress-text" id="compress-status">Procesando...</div>
        </div>
        <div id="compress-results"></div>
      </div>
    `;

    document.querySelectorAll('.size-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-preset').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.size === 'custom') {
          document.getElementById('custom-size-group').style.display = 'block';
          this.targetSize = parseInt(document.getElementById('custom-size').value) * 1024;
        } else {
          document.getElementById('custom-size-group').style.display = 'none';
          this.targetSize = parseInt(btn.dataset.size) * 1024;
        }
      });
    });

    document.getElementById('custom-size').addEventListener('input', () => {
      this.targetSize = parseInt(document.getElementById('custom-size').value) * 1024;
    });

    document.getElementById('compress-format').addEventListener('change', (e) => {
      this.format = e.target.value;
    });

    document.getElementById('compress-btn').addEventListener('click', () => this.compress());
  },

  async compress() {
    const resultsDiv = document.getElementById('compress-results');
    const progress = document.getElementById('compress-progress');
    const status = document.getElementById('compress-status');
    progress.classList.remove('hidden');
    resultsDiv.innerHTML = '';
    const total = Uploader.images.length;
    let done = 0;

    for (const img of Uploader.images) {
      status.textContent = `Comprimiendo ${img.name} (${done + 1}/${total})`;
      const fill = progress.querySelector('.progress-fill');
      fill.style.width = `${((done) / total) * 100}%`;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img.img, 0, 0);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, this.format, 0.85));
        const resultSize = blob.size;
        const saved = ((1 - resultSize / img.size) * 100).toFixed(1);

        const resultDiv = document.createElement('div');
        resultDiv.className = 'comparison';
        resultDiv.innerHTML = `
          <div class="comparison-box"><div class="label">Original</div><div class="value">${Gallery.formatSize(img.size)}</div></div>
          <div class="comparison-box"><div class="label">Comprimido</div><div class="value">${Gallery.formatSize(resultSize)}</div></div>
          <div class="comparison-box" style="grid-column:1/3"><div class="label">Ahorro</div><div class="value">${saved}%</div></div>
        `;
        resultsDiv.appendChild(resultDiv);

        img.compressedBlob = blob;
      } catch (err) {
        Toast.show(`Error al comprimir ${img.name}`, 'error');
      }

      done++;
      fill.style.width = `${(done / total) * 100}%`;
    }

    status.textContent = 'Compresión completada';
    Toast.show(`${done} imagen(es) comprimida(s)`, 'success');

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-primary';
    exportBtn.innerHTML = 'Exportar imágenes comprimidas';
    exportBtn.onclick = () => Exporter.open();
    resultsDiv.appendChild(exportBtn);
  }
};
