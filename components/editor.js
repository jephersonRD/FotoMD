const Editor = {
  settings: { brightness: 100, contrast: 100, saturation: 100, temperature: 0, exposure: 0, shadows: 0, vignette: 0, filter: 'none' },
  history: [],
  historyIndex: -1,

  open() {
    App.showToolWorkspace('Editor básico');
    const content = document.getElementById('tool-content');
    content.innerHTML = `
      <div class="undo-bar">
        <button id="undo-btn" class="icon-btn" disabled><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg></button>
        <button id="redo-btn" class="icon-btn" disabled><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg></button>
        <button id="reset-btn" class="icon-btn" title="Restablecer"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg></button>
      </div>
      <div class="preview-container">
        <canvas id="editor-canvas" style="width:100%;height:auto"></canvas>
      </div>
      <div class="slider-group">
        <label>Brillo <span id="brightness-val">100%</span></label>
        <input type="range" id="brightness" min="0" max="200" value="100">
      </div>
      <div class="slider-group">
        <label>Contraste <span id="contrast-val">100%</span></label>
        <input type="range" id="contrast" min="0" max="200" value="100">
      </div>
      <div class="slider-group">
        <label>Saturación <span id="saturation-val">100%</span></label>
        <input type="range" id="saturation" min="0" max="200" value="100">
      </div>
      <div class="slider-group">
        <label>Temperatura <span id="temperature-val">0</span></label>
        <input type="range" id="temperature" min="-100" max="100" value="0">
      </div>
      <div class="slider-group">
        <label>Exposición <span id="exposure-val">0</span></label>
        <input type="range" id="exposure" min="-100" max="100" value="0">
      </div>
      <div class="slider-group">
        <label>Sombras <span id="shadows-val">0</span></label>
        <input type="range" id="shadows" min="-100" max="100" value="0">
      </div>
      <div class="slider-group">
        <label>Viñeta <span id="vignette-val">0</span></label>
        <input type="range" id="vignette" min="0" max="100" value="0">
      </div>
      <div class="option-group">
        <label>Filtros</label>
        <div class="filters-grid">
          <button class="crop-btn active" data-filter="none">Normal</button>
          <button class="crop-btn" data-filter="grayscale">B/N</button>
          <button class="crop-btn" data-filter="sepia">Sepia</button>
          <button class="crop-btn" data-filter="vintage">Vintage</button>
          <button class="crop-btn" data-filter="warm">Cálido</button>
          <button class="crop-btn" data-filter="cool">Frío</button>
        </div>
      </div>
      <div class="action-row">
        <button id="editor-apply-btn" class="btn-primary">Aplicar a todas</button>
      </div>
      <div id="editor-results"></div>
    `;

    this.renderPreview();
    this.bindControls();
  },

  bindControls() {
    const sliders = ['brightness', 'contrast', 'saturation', 'temperature', 'exposure', 'shadows', 'vignette'];
    sliders.forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener('input', () => {
        this.settings[id] = parseFloat(el.value);
        document.getElementById(`${id}-val`).textContent = el.value + (id === 'brightness' || id === 'contrast' || id === 'saturation' ? '%' : '');
        this.renderPreview();
      });
    });

    document.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.settings.filter = btn.dataset.filter;
        this.renderPreview();
      });
    });

    document.getElementById('undo-btn').addEventListener('click', () => this.undo());
    document.getElementById('redo-btn').addEventListener('click', () => this.redo());
    document.getElementById('reset-btn').addEventListener('click', () => this.reset());
    document.getElementById('editor-apply-btn').addEventListener('click', () => this.apply());
  },

  renderPreview() {
    const canvas = document.getElementById('editor-canvas');
    const img = Uploader.images[0];
    if (!img) return;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.filter = this.getFilterCSS();
    ctx.drawImage(img.img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const b = this.settings.brightness / 100;
    const c = this.settings.contrast / 100;
    const s = this.settings.saturation / 100;
    const t = this.settings.temperature;
    const e = this.settings.exposure / 100 + 1;
    const sh = this.settings.shadows / 100;
    const v = this.settings.vignette / 100;

    for (let p = 0; p < data.length; p += 4) {
      let r = data[p], g = data[p + 1], bl = data[p + 2];

      r *= b; g *= b; bl *= b;

      r = (r - 128) * c + 128;
      g = (g - 128) * c + 128;
      bl = (bl - 128) * c + 128;

      const gray = 0.299 * r + 0.587 * g + 0.114 * bl;
      r = r * s + gray * (1 - s);
      g = g * s + gray * (1 - s);
      bl = bl * s + gray * (1 - s);

      r += t * 0.5;
      bl -= t * 0.5;

      r *= e; g *= e; bl *= e;

      data[p] = this.clamp(r);
      data[p + 1] = this.clamp(g);
      data[p + 2] = this.clamp(bl);
    }

    ctx.putImageData(imageData, 0, 0);

    if (v > 0) {
      const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.3, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.8);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, `rgba(0,0,0,${v})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    this.saveState();
  },

  getFilterCSS() {
    switch (this.settings.filter) {
      case 'grayscale': return 'grayscale(1)';
      case 'sepia': return 'sepia(0.8)';
      case 'vintage': return 'sepia(0.5) contrast(0.9) brightness(0.9)';
      case 'warm': return 'saturate(1.3) hue-rotate(-15deg)';
      case 'cool': return 'saturate(1.2) hue-rotate(15deg)';
      default: return 'none';
    }
  },

  clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); },

  saveState() {
    const canvas = document.getElementById('editor-canvas');
    const state = canvas.toDataURL();
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(state);
    this.historyIndex = this.history.length - 1;
    document.getElementById('undo-btn').disabled = this.historyIndex <= 0;
    document.getElementById('redo-btn').disabled = this.historyIndex >= this.history.length - 1;
  },

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadState(this.history[this.historyIndex]);
    }
  },

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadState(this.history[this.historyIndex]);
    }
  },

  loadState(dataUrl) {
    const canvas = document.getElementById('editor-canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
    img.src = dataUrl;
    document.getElementById('undo-btn').disabled = this.historyIndex <= 0;
    document.getElementById('redo-btn').disabled = this.historyIndex >= this.history.length - 1;
  },

  reset() {
    this.settings = { brightness: 100, contrast: 100, saturation: 100, temperature: 0, exposure: 0, shadows: 0, vignette: 0, filter: 'none' };
    document.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('active'));
    document.querySelector('[data-filter="none"]').classList.add('active');
    ['brightness', 'contrast', 'saturation', 'temperature', 'exposure', 'shadows', 'vignette'].forEach((id) => {
      document.getElementById(id).value = this.settings[id];
      document.getElementById(`${id}-val`).textContent = this.settings[id] + (id === 'brightness' || id === 'contrast' || id === 'saturation' ? '%' : '');
    });
    this.renderPreview();
  },

  async apply() {
    const results = document.getElementById('editor-results');
    for (let i = 0; i < Uploader.images.length; i++) {
      const img = Uploader.images[i];
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.filter = this.getFilterCSS();
      ctx.drawImage(img.img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const b = this.settings.brightness / 100, c = this.settings.contrast / 100, s = this.settings.saturation / 100;
      const t = this.settings.temperature, e = this.settings.exposure / 100 + 1;

      for (let p = 0; p < data.length; p += 4) {
        let r = data[p], g = data[p + 1], bl = data[p + 2];
        r *= b; g *= b; bl *= b;
        r = (r - 128) * c + 128; g = (g - 128) * c + 128; bl = (bl - 128) * c + 128;
        const gray = 0.299 * r + 0.587 * g + 0.114 * bl;
        r = r * s + gray * (1 - s); g = g * s + gray * (1 - s); bl = bl * s + gray * (1 - s);
        r += t * 0.5; bl -= t * 0.5;
        r *= e; g *= e; bl *= e;
        data[p] = this.clamp(r); data[p + 1] = this.clamp(g); data[p + 2] = this.clamp(bl);
      }
      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      img.editedBlob = blob;

      const card = document.createElement('div');
      card.className = 'comparison';
      card.innerHTML = `<div class="comparison-box" style="grid-column:1/3"><div class="label">${img.name}</div><div class="value">Editada</div></div>`;
      results.appendChild(card);
    }
    Toast.show('Edición aplicada a todas las imágenes', 'success');
    if (!document.querySelector('#editor-results .btn-primary')) {
      const btn = document.createElement('button');
      btn.className = 'btn-primary';
      btn.textContent = 'Exportar imágenes';
      btn.onclick = () => Exporter.open();
      results.appendChild(btn);
    }
  }
};
