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
            * Si PNG resulta m\u00E1s pesado, se convertir\u00E1 autom\u00E1ticamente a WebP/JPEG
          </label>
        </div>
        <div class="action-row">
          <button id="compress-btn" class="btn-primary">Comprimir im\u00E1genes</button>
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
          const raw = document.getElementById('custom-size').value;
          this.targetSize = this.safeInt(raw, 300) * 1024;
        } else {
          document.getElementById('custom-size-group').style.display = 'none';
          this.targetSize = this.safeInt(btn.dataset.size, 500) * 1024;
        }
      });
    });

    document.getElementById('custom-size').addEventListener('input', (e) => {
      this.targetSize = this.safeInt(e.target.value, 300) * 1024;
    });

    document.getElementById('compress-format').addEventListener('change', (e) => {
      this.format = e.target.value;
      this.ext = this.format.split('/')[1] || 'jpg';
    });

    document.getElementById('compress-btn').addEventListener('click', () => this.compress());
  },

  safeInt(v, fallback) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  },

  safeFloat(v, fallback) {
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  },

  fmt(bytes) {
    const b = this.safeFloat(bytes, 0);
    if (b === 0) return '0 B';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  },

  async compress() {
    const resultsDiv = document.getElementById('compress-results');
    const progress = document.getElementById('compress-progress');
    const status = document.getElementById('compress-status');
    progress.classList.remove('hidden');
    resultsDiv.innerHTML = '';
    const total = Uploader.images.length;
    let done = 0;

    for (const rawImg of Uploader.images) {
      status.textContent = `Comprimiendo ${rawImg.name || 'imagen'} (${done + 1}/${total})`;
      const fill = progress.querySelector('.progress-fill');
      fill.style.width = `${total > 0 ? ((done / total) * 100).toFixed(0) : 0}%`;

      try {
        const result = await this.compressOne(rawImg);
        const blobSize = result.blob ? result.blob.size : 0;
        const origSize = this.safeFloat(rawImg.size, 0);
        const saved = origSize > 0 ? ((1 - blobSize / origSize) * 100).toFixed(1) : '0.0';

        const origW = this.safeInt(rawImg.width, 0);
        const origH = this.safeInt(rawImg.height, 0);
        const outW = this.safeInt(result.width, origW);
        const outH = this.safeInt(result.height, origH);
        const fmtLabel = result.actualFormat && result.actualFormat.indexOf('/') > 0
          ? result.actualFormat.split('/')[1].toUpperCase() : 'ORIG';

        const savedNum = parseFloat(saved);
        const statusColor = savedNum >= 0 ? '#22c55e' : '#ef4444';
        const statusIcon = savedNum >= 0 ? '\u2713' : '\u26A0';

        const resultDiv = document.createElement('div');
        resultDiv.className = 'comparison';
        resultDiv.innerHTML = [
          '<div class="comparison-box">',
          '<div class="label">Original</div>',
          '<div class="value">' + this.fmt(origSize) + '</div>',
          '<div style="color:var(--text-tertiary);font-size:0.7rem">' + origW + '\u00D7' + origH + '</div>',
          '</div>',
          '<div class="comparison-box">',
          '<div class="label">Comprimido (' + fmtLabel + ')</div>',
          '<div class="value">' + this.fmt(blobSize) + '</div>',
          '<div style="color:var(--text-tertiary);font-size:0.7rem">' + outW + '\u00D7' + outH + '</div>',
          '</div>',
          '<div class="comparison-box" style="grid-column:1/3">',
          '<div class="label">' + statusIcon + ' Ahorro</div>',
          '<div class="value" style="color:' + statusColor + '">' + saved + '%</div>',
          result.message ? '<div style="color:var(--text-tertiary);font-size:0.75rem">' + result.message + '</div>' : '',
          '</div>'
        ].join('');

        resultsDiv.appendChild(resultDiv);

        if (result.blob && blobSize <= origSize) {
          rawImg.compressedBlob = result.blob;
        }

        console.log('[COMPRESSOR] Resultado final:', {
          nombre: rawImg.name,
          original: origSize,
          comprimido: blobSize,
          ahorro: saved + '%',
          formato: fmtLabel,
          resolucion: outW + 'x' + outH
        });
      } catch (err) {
        Toast.show('Error al comprimir: ' + err.message, 'error');
        console.error('[COMPRESSOR] Error:', err);
      }

      done++;
      fill.style.width = total > 0 ? ((done / total) * 100).toFixed(0) + '%' : '0%';
    }

    status.textContent = 'Compresi\u00F3n completada';
    Toast.show(done + ' imagen(es) procesada(s)', 'success');

    if (!document.querySelector('#compress-results .btn-primary')) {
      const exportBtn = document.createElement('button');
      exportBtn.className = 'btn-primary';
      exportBtn.style.marginTop = '1rem';
      exportBtn.textContent = 'Exportar im\u00E1genes';
      exportBtn.onclick = () => Exporter.open();
      resultsDiv.appendChild(exportBtn);
    }
  },

  async compressOne(img) {
    const origSize = this.safeFloat(img.file ? img.file.size : img.size, 0);
    const origW = this.safeInt(img.width, 0);
    const origH = this.safeInt(img.height, 0);
    const origFormat = (img.file && img.file.type) || 'image/jpeg';
    const target = this.safeFloat(this.targetSize, 500 * 1024);
    const preferFormat = this.format || 'image/jpeg';

    console.log('[COMPRESSOR] Iniciando compresi\u00F3n:', {
      nombre: img.name,
      tamanoOriginal: origSize,
      tamanoObjetivo: target,
      formatoPreferido: preferFormat,
      resolucion: origW + 'x' + origH,
      formatoOriginal: origFormat
    });

    if (!origSize || !origW || !origH || origSize <= 0 || origW <= 0 || origH <= 0) {
      console.error('[COMPRESSOR] Dimensiones inv\u00E1lidas:', { origSize, origW, origH });
      const dummy = await this.readFileAsBlob(img.file);
      return { blob: dummy, origWidth: origW, origHeight: origH, width: origW, height: origH, actualFormat: origFormat, message: 'Datos de imagen inv\u00E1lidos' };
    }

    const origBlob = await this.readFileAsBlob(img.file);

    if (origSize <= target * 0.95) {
      console.log('[COMPRESSOR] Ya est\u00E1 por debajo del objetivo, devolviendo original');
      return { blob: origBlob, origWidth: origW, origHeight: origH, width: origW, height: origH, actualFormat: origFormat || 'image/jpeg', message: 'Ya est\u00E1 por debajo del objetivo' };
    }

    let bestBlob = origBlob;
    let bestSize = origSize;

    const updateBest = (blob, w, h, fmt) => {
      if (!blob) return;
      const s = blob.size;
      if (!Number.isFinite(s) || s <= 0) return;
      if (s >= bestSize) return;
      bestBlob = blob;
      bestSize = s;
      console.log('[COMPRESSOR] Mejor encontrado:', { formato: fmt, peso: s, resolucion: w + 'x' + h });
    };

    const toBlobSafe = (canvas, fmt, quality) => {
      return new Promise((r) => {
        try {
          if (typeof canvas.toBlob !== 'function') { r(null); return; }
          canvas.toBlob((b) => {
            if (!b || !Number.isFinite(b.size)) { r(null); return; }
            r(b);
          }, fmt, quality);
        } catch (e) {
          console.warn('[COMPRESSOR] toBlob error:', e.message);
          r(null);
        }
      });
    };

    const testLossyScale = async (fmt, scale) => {
      const sw = Math.max(32, Math.round(origW * scale));
      const sh = Math.max(32, Math.round(origH * scale));

      if (!Number.isFinite(sw) || !Number.isFinite(sh)) {
        console.warn('[COMPRESSOR] Escala inv\u00E1lida:', { scale, sw, sh });
        return null;
      }

      let canvas;
      try {
        canvas = document.createElement('canvas');
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img.img, 0, 0, sw, sh);
      } catch (e) {
        console.warn('[COMPRESSOR] Error al dibujar canvas:', e.message);
        return null;
      }

      const qualities = [40, 30, 25, 20, 15, 10, 5];
      for (const qVal of qualities) {
        const q = qVal / 100;
        const blob = await toBlobSafe(canvas, fmt, q);
        if (!blob) continue;

        updateBest(blob, sw, sh, fmt);

        if (blob.size <= target) {
          console.log('[COMPRESSOR] Objetivo alcanzado:', { formato: fmt, calidad: q, escala: scale, peso: blob.size });
          return { blob, width: sw, height: sh, actualFormat: fmt };
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
        let c;
        try {
          c = document.createElement('canvas');
          c.width = origW;
          c.height = origH;
          c.getContext('2d').drawImage(img.img, 0, 0);
        } catch (e) { continue; }

        const blob = await toBlobSafe(c, 'image/png');
        if (blob) {
          console.log('[COMPRESSOR] PNG lossless: ' + this.fmt(blob.size));
          updateBest(blob, origW, origH, 'image/png');
          if (blob.size <= target) {
            return { blob, origWidth: origW, origHeight: origH, width: origW, height: origH, actualFormat: 'image/png', message: '' };
          }
        }
        continue;
      }

      for (let s = 1; s >= 0.3; s = Math.round((s - 0.1) * 100) / 100) {
        const hit = await testLossyScale(fmt, s);
        if (hit) {
          return { blob: hit.blob, origWidth: origW, origHeight: origH, width: hit.width, height: hit.height, actualFormat: hit.actualFormat, message: '' };
        }
      }
    }

    if (bestSize < origSize) {
      const pct = origSize > 0 ? ((1 - bestSize / origSize) * 100).toFixed(1) : '0.0';
      const actualFmt = (bestBlob && bestBlob.type) || 'image/jpeg';
      console.log('[COMPRESSOR] Mejor logrado:', { peso: bestSize, ahorro: pct + '%' });
      return { blob: bestBlob, origWidth: origW, origHeight: origH, width: origW, height: origH, actualFormat: actualFmt, message: 'M\u00E1xima compresi\u00F3n: ' + this.fmt(bestSize) + ' (objetivo: ' + this.fmt(target) + ')' };
    }

    console.log('[COMPRESSOR] No se puede comprimir, devolviendo original');
    return { blob: origBlob, origWidth: origW, origHeight: origH, width: origW, height: origH, actualFormat: origFormat || 'image/jpeg', message: 'No es posible comprimir m\u00E1s esta imagen' };
  },

  readFileAsBlob(file) {
    return new Promise((r) => {
      if (!file) {
        r(new Blob([], { type: 'image/jpeg' }));
        return;
      }
      try {
        const reader = new FileReader();
        reader.onload = () => r(new Blob([reader.result], { type: file.type || 'image/jpeg' }));
        reader.onerror = () => r(new Blob([], { type: file.type || 'image/jpeg' }));
        reader.readAsArrayBuffer(file);
      } catch (e) {
        r(new Blob([], { type: 'image/jpeg' }));
      }
    });
  }
};
