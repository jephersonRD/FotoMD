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
            * Si PNG resulta más pesado, se convertirá automáticamente a WebP/JPEG
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

      const result = await this.compressOne(img);
      const resultSize = result.blob.size;
      const saved = ((1 - resultSize / img.size) * 100).toFixed(1);
      const formatLabel = result.actualFormat.split('/')[1].toUpperCase();

      const statusColor = parseFloat(saved) >= 0 ? '#22c55e' : '#ef4444';
      const statusIcon = parseFloat(saved) >= 0 ? '✓' : '⚠';

      const resultDiv = document.createElement('div');
      resultDiv.className = 'comparison';
      resultDiv.innerHTML = `
        <div class="comparison-box">
          <div class="label">Original</div>
          <div class="value">${this.fmt(img.size)}</div>
          <div style="color:var(--text-tertiary);font-size:0.7rem">${result.origWidth}×${result.origHeight}</div>
        </div>
        <div class="comparison-box">
          <div class="label">Comprimido (${formatLabel})</div>
          <div class="value">${this.fmt(resultSize)}</div>
          <div style="color:var(--text-tertiary);font-size:0.7rem">${result.width}×${result.height}</div>
        </div>
        <div class="comparison-box" style="grid-column:1/3">
          <div class="label">${statusIcon} Ahorro</div>
          <div class="value" style="color:${statusColor}">${saved}%</div>
          ${result.message ? `<div style="color:var(--text-tertiary);font-size:0.75rem">${result.message}</div>` : ''}
        </div>
      `;
      resultsDiv.appendChild(resultDiv);

      img.compressedBlob = result.blob;

      done++;
      fill.style.width = `${(done / total) * 100}%`;
    }

    const allReduced = [...document.querySelectorAll('#compress-results .comparison .value')]
      .some((v) => v.textContent.includes('%') && !v.textContent.startsWith('-'));

    if (allReduced) {
      status.textContent = 'Compresión completada';
      Toast.show(`${done} imagen(es) comprimida(s)`, 'success');
    } else {
      status.textContent = 'No se pudo reducir algunas imágenes';
      Toast.show('Algunas imágenes no pudieron comprimirse más', 'info');
    }

    if (!document.querySelector('#compress-results .btn-primary')) {
      const exportBtn = document.createElement('button');
      exportBtn.className = 'btn-primary';
      exportBtn.style.marginTop = '1rem';
      exportBtn.innerHTML = 'Exportar imágenes';
      exportBtn.onclick = () => Exporter.open();
      resultsDiv.appendChild(exportBtn);
    }
  },

  fmt(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  },

  async compressOne(img) {
    const origSize = img.file.size;
    const origW = img.width;
    const origH = img.height;
    const origFormat = img.file.type || 'unknown';
    const target = this.targetSize;
    const preferFormat = this.format;

    console.log('=== COMPRESSOR DEBUG ===');
    console.log('Original:', img.name, origFormat, this.fmt(origSize), `${origW}×${origH}`);
    console.log('Target:', this.fmt(target), 'Preferred format:', preferFormat);

    const getBlob = (canvas, fmt, quality) => {
      return new Promise((r) => {
        try { canvas.toBlob((b) => r(b), fmt, quality); }
        catch (e) { console.warn('toBlob error:', e); r(null); }
      });
    };

    const origBlob = await new Promise((r) => {
      const reader = new FileReader();
      reader.onload = () => r(new Blob([reader.result], { type: img.file.type }));
      reader.readAsArrayBuffer(img.file);
    });

    if (origSize <= target * 0.95) {
      console.log('Already under target → returning original');
      return { blob: origBlob, origWidth: origW, origHeight: origH, width: origW, height: origH, actualFormat: origFormat || 'image/jpeg', message: 'Ya está por debajo del objetivo' };
    }

    let bestBlob = origBlob;
    let bestSize = origSize;

    const updateBest = (blob, w, h, fmt) => {
      if (!blob || blob.size >= bestSize) return;
      bestBlob = blob;
      bestSize = blob.size;
      console.log(`  ✓ Mejor encontrado: ${this.fmt(blob.size)} | ${fmt} | ${w}×${h}`);
    };

    const testLossyScale = async (fmt, scale) => {
      const w = Math.max(32, Math.round(origW * scale));
      const h = Math.max(32, Math.round(origH * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img.img, 0, 0, w, h);

      const qualities = [40, 30, 25, 20, 15, 10, 5];
      for (const qVal of qualities) {
        const q = qVal / 100;
        const blob = await getBlob(canvas, fmt, q);
        if (!blob) continue;

        updateBest(blob, w, h, fmt);

        if (blob.size <= target) {
          console.log(`  ✔ Objetivo alcanzado: ${fmt} q=${q} escala=${scale} → ${this.fmt(blob.size)}`);
          return { blob, width: w, height: h, actualFormat: fmt };
        }
      }
      return null;
    };

    const formatsToTry = [];
    if (preferFormat === 'image/png') {
      formatsToTry.push('image/png', 'image/webp', 'image/jpeg');
    } else {
      formatsToTry.push(preferFormat);
    }

    for (const fmt of formatsToTry) {
      if (fmt === 'image/png') {
        const c = document.createElement('canvas');
        c.width = origW;
        c.height = origH;
        c.getContext('2d').drawImage(img.img, 0, 0);
        const blob = await getBlob(c, 'image/png');
        console.log(`  PNG lossless → ${this.fmt(blob ? blob.size : 0)}`);
        updateBest(blob, origW, origH, 'image/png');
        if (blob && blob.size <= target) {
          return { blob, origWidth: origW, origHeight: origH, width: origW, height: origH, actualFormat: 'image/png', message: '' };
        }
        continue;
      }

      for (let scale = 1; scale >= 0.3; scale -= 0.1) {
        const hit = await testLossyScale(fmt, scale);
        if (hit) {
          return { blob: hit.blob, origWidth: origW, origHeight: origH, width: hit.width, height: hit.height, actualFormat: hit.actualFormat, message: '' };
        }
      }
    }

    if (bestSize < origSize) {
      console.log(`Mejor logrado: ${this.fmt(bestSize)} (ahorro ${((1 - bestSize/origSize)*100).toFixed(1)}%)`);
      const actualFmt = bestBlob.type || formatsToTry.find((f) => f !== 'image/png') || 'image/jpeg';
      return { blob: bestBlob, origWidth: origW, origHeight: origH, width: origW, height: origH, actualFormat: actualFmt, message: `Máxima compresión: ${this.fmt(bestSize)} (objetivo: ${this.fmt(target)})` };
    }

    console.log('No se puede comprimir más → devolviendo original');
    return { blob: origBlob, origWidth: origW, origHeight: origH, width: origW, height: origH, actualFormat: origFormat || 'image/jpeg', message: 'No es posible comprimir más esta imagen' };
  }
};
