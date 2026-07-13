const Gallery = {
  render() {
    const grid = document.getElementById('gallery-grid');
    const count = document.getElementById('gallery-count');
    grid.innerHTML = '';
    count.textContent = Uploader.images.length;

    Uploader.images.forEach((img, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <img src="${img.url}" alt="${img.name}" loading="lazy">
        <div class="item-size">${this.formatSize(img.size)}</div>
        <button class="item-remove" data-index="${i}">&times;</button>
      `;
      item.querySelector('.item-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        this.remove(i);
      });
      grid.appendChild(item);
    });

    document.getElementById('process-btn').disabled = Uploader.images.length === 0;
  },

  remove(index) {
    const img = Uploader.images[index];
    if (img) URL.revokeObjectURL(img.url);
    Uploader.images.splice(index, 1);
    this.render();
    if (Uploader.images.length === 0) {
      App.showSection('upload');
    }
  },

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
};
