const Cropper = {
  aspectRatio: NaN,
  rotation: 0,
  flipH: false,
  flipV: false,

  open() {
    App.showToolWorkspace('Recorte avanzado');
    const content = document.getElementById('tool-content');
    content.innerHTML = `
      <div class="option-group">
        <label>Relación de aspecto</label>
        <div class="crop-aspects">
          <button class="crop-btn active" data-ratio="free">Libre</button>
          <button class="crop-btn" data-ratio="1">1:1</button>
          <button class="crop-btn" data-ratio="1.777">16:9</button>
          <button class="crop-btn" data-ratio="1.333">4:3</button>
          <button class="crop-btn" data-ratio="0.562">TikTok</button>
          <button class="crop-btn" data-ratio="1.778">YouTube</button>
          <button class="crop-btn" data-ratio="1">Instagram</button>
        </div>
      </div>
      <div class="crop-container">
        <canvas id="crop-canvas" style="width:100%;height:auto"></canvas>
      </div>
      <div class="crop-toolbar">
        <button class="crop-btn" id="crop-rotate-l">⟲ 90°</button>
        <button class="crop-btn" id="crop-rotate-r">⟳ 90°</button>
        <button class="crop-btn" id="crop-flip-h">↔ Horizontal</button>
        <button class="crop-btn" id="crop-flip-v">↕ Vertical</button>
      </div>
      <div class="action-row">
        <button id="crop-apply-btn" class="btn-primary">Aplicar recorte</button>
      </div>
      <div id="crop-results"></div>
    `;

    this.renderCanvas();

    document.querySelectorAll('.crop-btn[data-ratio]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.crop-btn[data-ratio]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.aspectRatio = btn.dataset.ratio === 'free' ? NaN : parseFloat(btn.dataset.ratio);
      });
    });

    document.getElementById('crop-rotate-l').addEventListener('click', () => { this.rotation -= 90; this.renderCanvas(); });
    document.getElementById('crop-rotate-r').addEventListener('click', () => { this.rotation += 90; this.renderCanvas(); });
    document.getElementById('crop-flip-h').addEventListener('click', () => { this.flipH = !this.flipH; this.renderCanvas(); });
    document.getElementById('crop-flip-v').addEventListener('click', () => { this.flipV = !this.flipV; this.renderCanvas(); });

    document.getElementById('crop-apply-btn').addEventListener('click', () => this.apply());
  },

  renderCanvas() {
    const canvas = document.getElementById('crop-canvas');
    const img = Uploader.images[0];
    if (!img) return;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
    ctx.drawImage(img.img, -img.width / 2, -img.height / 2);
    ctx.restore();

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.setLineDash([]);
  },

  async apply() {
    const canvas = document.getElementById('crop-canvas');
    const results = document.getElementById('crop-results');

    for (const img of Uploader.images) {
      const c = document.createElement('canvas');
      c.width = this.aspectRatio ? Math.min(img.width, img.height * this.aspectRatio) : img.width;
      c.height = this.aspectRatio ? Math.min(img.height, img.width / this.aspectRatio) : img.height;
      const ctx = c.getContext('2d');
      ctx.save();
      ctx.translate(c.width / 2, c.height / 2);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
      ctx.drawImage(img.img, -img.width / 2, -img.height / 2);
      ctx.restore();

      const blob = await new Promise((resolve) => c.toBlob(resolve, 'image/png'));
      img.croppedBlob = blob;

      const card = document.createElement('div');
      card.className = 'comparison';
      card.innerHTML = `
        <div class="comparison-box"><div class="label">Original</div><div class="value">${img.width}x${img.height}</div></div>
        <div class="comparison-box"><div class="label">Recortada</div><div class="value">${c.width}x${c.height}</div></div>
      `;
      results.appendChild(card);
    }

    Toast.show('Recorte aplicado a todas las imágenes', 'success');

    if (!document.querySelector('#crop-results .btn-primary')) {
      const btn = document.createElement('button');
      btn.className = 'btn-primary';
      btn.textContent = 'Exportar imágenes';
      btn.onclick = () => Exporter.open();
      results.appendChild(btn);
    }
  }
};
