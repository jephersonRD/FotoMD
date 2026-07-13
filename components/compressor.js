const Compressor = {
  targetSize: 500 * 1024,
  format: 'image/jpeg',
  ext: 'jpg',

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
        <div class="option-group">
          <label style="color:var(--text-tertiary);font-size:0.8rem">
            * Si PNG resulta más pesado, se convertirá automáticamente a otro formato
          </label>
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
      this.ext = this.format.split('/')[1];
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
      fill.style.width = `${(done / total) * 100}%`;

      try {
        const result = await this.compressOne(img);
        const resultSize = result.blob.size;
        const saved = ((1 - resultSize / img.size) * 100).toFixed(1);
        const dimensionInfo = result.width ? ` (${result.width}×${result.height})` : '';
        const formatLabel = result.actualFormat ? result.actualFormat.split('/')[1].toUpperCase() : this.ext.toUpperCase();

        const resultDiv = document.createElement('div');
        resultDiv.className = 'comparison';
        resultDiv.innerHTML = `
          <div class="comparison-box">
            <div class="label">Original</div>
            <div class="value">${Gallery.formatSize(img.size)}</div>
            <div style="color:var(--text-tertiary);font-size:0.7rem">${img.width}×${img.height}</div>
          </div>
          <div class="comparison-box">
            <div class="label">Comprimido (${formatLabel})</div>
            <div class="value">${Gallery.formatSize(resultSize)}</div>
            <div style="color:var(--text-tertiary);font-size:0.7rem">${dimensionInfo.replace(' (','')}</div>
          </div>
          <div class="comparison-box" style="grid-column:1/3">
            <div class="label">Ahorro</div>
            <div class="value" style="color:${parseFloat(saved) >= 0 ? '#22c55e' : '#ef4444'}">${saved}%</div>
          </div>
        `;
        resultsDiv.appendChild(resultDiv);

        img.compressedBlob = result.blob;
        if (result.width) { img.width = result.width; img.height = result.height; }
      } catch (err) {
        Toast.show(`Error al comprimir ${img.name}: ${err.message}`, 'error');
      }

      done++;
      fill.style.width = `${(done / total) * 100}%`;
    }

    status.textContent = 'Compresión completada';
    Toast.show(`${done} imagen(es) comprimida(s)`, 'success');

    if (!document.querySelector('#compress-results .btn-primary')) {
      const exportBtn = document.createElement('button');
      exportBtn.className = 'btn-primary';
      exportBtn.style.marginTop = '1rem';
      exportBtn.innerHTML = 'Exportar imágenes comprimidas';
      exportBtn.onclick = () => Exporter.open();
      resultsDiv.appendChild(exportBtn);
    }
  },

  async compressOne(img) {
    const originalSize = img.size;
    const target = this.targetSize;
    let format = this.format;

    if (originalSize <= target * 0.95) {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img.img, 0, 0);
      const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.92));
      if (blob.size <= originalSize) {
        return { blob, width: img.width, height: img.height, actualFormat: 'image/jpeg' };
      }
      return { blob: await this.fileToBlob(img.file), width: img.width, height: img.height, actualFormat: format };
    }

    let bestBlob = null;
    let bestSize = Infinity;
    let bestWidth = img.width;
    let bestHeight = img.height;
    let actualFormat = format;

    const supportsWebP = () => {
      return new Promise((r) => {
        const c = new Image();
        c.onload = () => r(c.width === 1);
        c.onerror = () => r(false);
        c.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
      });
    };

    const candidates = [format];
    if (format === 'image/png') {
      const webpOk = await supportsWebP();
      if (webpOk) candidates.push('image/webp');
      candidates.push('image/jpeg');
    }

    for (const fmt of candidates) {
      const isLossless = fmt === 'image/png';
      if (isLossless) {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        c.getContext('2d').drawImage(img.img, 0, 0);
        const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
        if (blob.size < bestSize) {
          bestBlob = blob;
          bestSize = blob.size;
          bestWidth = img.width;
          bestHeight = img.height;
          actualFormat = 'image/png';
        }
        continue;
      }

      let scale = 1;
      while (scale >= 0.3) {
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        if (w < 50 || h < 50) break;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img.img, 0, 0, w, h);

        for (let q = 80; q >= 5; q -= 5) {
          const quality = q / 100;
          const blob = await new Promise((r) => canvas.toBlob(r, fmt, quality));
          if (!blob) continue;
          if (blob.size < bestSize) {
            bestBlob = blob;
            bestSize = blob.size;
            bestWidth = w;
            bestHeight = h;
            actualFormat = fmt;
          }
          if (blob.size <= target) {
            return { blob, width: w, height: h, actualFormat: fmt };
          }
        }
        scale -= 0.1;
      }
    }

    if (bestBlob && bestSize < originalSize) {
      return { blob: bestBlob, width: bestWidth, height: bestHeight, actualFormat };
    }

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img.img, 0, 0);
    const fallbackBlob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.5));
    if (fallbackBlob && fallbackBlob.size < originalSize) {
      return { blob: fallbackBlob, width: img.width, height: img.height, actualFormat: 'image/jpeg' };
    }

    return { blob: await this.fileToBlob(img.file), width: img.width, height: img.height, actualFormat: format };
  },

  fileToBlob(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const blob = new Blob([reader.result], { type: file.type });
        resolve(blob);
      };
      reader.readAsArrayBuffer(file);
    });
  }
};
