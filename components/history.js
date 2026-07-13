const History = {
  entries: JSON.parse(localStorage.getItem('photomd_history') || '[]'),

  add(entry) {
    this.entries.unshift({ ...entry, date: new Date().toISOString(), id: Date.now() });
    if (this.entries.length > 50) this.entries.pop();
    this.save();
  },

  save() {
    localStorage.setItem('photomd_history', JSON.stringify(this.entries));
  },

  render() {
    App.showToolWorkspace('Historial de ediciones');
    const content = document.getElementById('tool-content');
    if (!this.entries.length) {
      content.innerHTML = `<p style="color:var(--text-tertiary);text-align:center;padding:2rem">No hay ediciones registradas aún.</p>`;
      return;
    }
    content.innerHTML = `<div class="history-list"></div>`;
    const list = content.querySelector('.history-list');
    this.entries.forEach((e) => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="thumb" style="display:flex;align-items:center;justify-content:center;background:var(--accent-dim);color:var(--accent);font-weight:700">${e.tool?.[0]?.toUpperCase() || 'E'}</div>
        <div class="info"><div class="name">${e.tool || 'Edición'}</div><div class="date">${new Date(e.date).toLocaleString()}</div></div>
        <button class="action-btn" data-id="${e.id}">Eliminar</button>
      `;
      item.querySelector('.action-btn').addEventListener('click', () => {
        this.entries = this.entries.filter((x) => x.id !== e.id);
        this.save();
        this.render();
      });
      list.appendChild(item);
    });
  }
};
