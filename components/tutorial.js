const Tutorial = {
  steps: [
    { title: 'Bienvenido a PhotoMD Plus', desc: 'El editor profesional de imágenes para Android y escritorio.' },
    { title: 'Sube tus imágenes', desc: 'Indica cuántas imágenes necesitas y arrástralas o selecciónalas desde tu dispositivo.' },
    { title: 'Elige una herramienta', desc: 'Comprime, recorta, mejora la calidad o elimina fondos con un solo clic.' },
    { title: 'Exporta tus resultados', desc: 'Descarga tus imágenes en JPG, PNG o WebP, individualmente o en un archivo ZIP.' }
  ],
  currentStep: 0,

  show() {
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.id = 'tutorial-overlay';
    overlay.innerHTML = this.renderStep();
    document.body.appendChild(overlay);
    this.bindEvents(overlay);
  },

  renderStep() {
    const step = this.steps[this.currentStep];
    const dots = this.steps.map((_, i) => `<div class="tutorial-dot ${i === this.currentStep ? 'active' : ''}"></div>`).join('');
    const isLast = this.currentStep === this.steps.length - 1;
    return `
      <div class="tutorial-card">
        <h2>${step.title}</h2>
        <p>${step.desc}</p>
        <div class="tutorial-steps">${dots}</div>
        <div style="display:flex;gap:0.75rem;justify-content:center">
          ${this.currentStep > 0 ? '<button id="tutorial-prev" class="btn-secondary">Anterior</button>' : ''}
          <button id="tutorial-next" class="btn-primary">${isLast ? 'Comenzar' : 'Siguiente'}</button>
          <button id="tutorial-skip" class="btn-secondary" style="color:var(--text-tertiary)">Saltar</button>
        </div>
      </div>
    `;
  },

  bindEvents(overlay) {
    overlay.querySelector('#tutorial-next')?.addEventListener('click', () => {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        overlay.innerHTML = this.renderStep();
        this.bindEvents(overlay);
      } else {
        this.close();
      }
    });
    overlay.querySelector('#tutorial-prev')?.addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.currentStep--;
        overlay.innerHTML = this.renderStep();
        this.bindEvents(overlay);
      }
    });
    overlay.querySelector('#tutorial-skip')?.addEventListener('click', () => this.close());
  },

  close() {
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.remove();
    localStorage.setItem('photomd_tutorial_done', 'true');
  }
};
