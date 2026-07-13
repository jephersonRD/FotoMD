const App = {
  currentSection: 'upload',

  init() {
    this.registerSW();
    this.bindGlobalEvents();
    this.loadUI();
    setTimeout(() => this.hideLoading(), 2000);
  },

  async registerSW() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('sw.js');
      } catch (e) {
        console.log('SW registration failed:', e);
      }
    }
  },

  hideLoading() {
    const screen = document.getElementById('loading-screen');
    screen.classList.add('fade-out');
    setTimeout(() => {
      screen.style.display = 'none';
      document.getElementById('header').classList.remove('hidden');
      document.getElementById('main-content').classList.remove('hidden');
      this.showSection('upload');
      if (!localStorage.getItem('photomd_tutorial_done')) {
        Tutorial.show();
      }
    }, 600);
  },

  loadUI() {
    Uploader.init();
    Gallery.render();

    document.getElementById('upload-btn').addEventListener('click', () => {
      Gallery.render();
      this.showSection('gallery');
    });

    document.getElementById('add-more-btn').addEventListener('click', () => {
      this.showSection('upload');
    });

    document.getElementById('process-btn').addEventListener('click', () => {
      this.showSection('tools');
    });

    document.getElementById('back-to-gallery').addEventListener('click', () => {
      this.showSection('gallery');
    });

    document.getElementById('close-tool').addEventListener('click', () => {
      this.showSection('tools');
    });

    document.getElementById('menu-btn').addEventListener('click', () => this.toggleSidebar());
    document.getElementById('sidebar-overlay').addEventListener('click', () => this.closeSidebar());

    document.querySelectorAll('.sidebar-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        if (section === 'history') {
          this.closeSidebar();
          History.render();
          return;
        }
        this.closeSidebar();
        this.showSection(section);
      });
    });

    document.getElementById('theme-btn').addEventListener('click', () => {
      Toast.show('Modo oscuro siempre activo', 'info');
    });

    document.querySelectorAll('.tool-card').forEach((card) => {
      card.addEventListener('click', () => {
        const tool = card.dataset.tool;
        switch (tool) {
          case 'compressor': Compressor.open(); break;
          case 'background': BackgroundRemover.open(); break;
          case 'enhancer': Enhancer.open(); break;
          case 'crop': Cropper.open(); break;
          case 'resize': Resizer.open(); break;
          case 'editor': Editor.open(); break;
          case 'export': Exporter.open(); break;
          case 'batch': BatchProcessor.open(); break;
        }
        History.add({ tool: card.querySelector('.tool-name')?.textContent || tool });
      });
    });
  },

  bindGlobalEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSidebar();
        const tutorial = document.getElementById('tutorial-overlay');
        if (tutorial) Tutorial.close();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (Editor.history.length) Editor.undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Z') {
        if (Editor.history.length) Editor.redo();
      }
    });
  },

  showSection(section) {
    document.querySelectorAll('.section').forEach((s) => s.classList.add('hidden'));
    const map = { upload: 'upload-section', gallery: 'gallery-section', tools: 'tools-section', workspace: 'tool-workspace' };
    const el = document.getElementById(map[section]);
    if (el) el.classList.remove('hidden');
    this.currentSection = section;

    if (section === 'gallery') Gallery.render();
  },

  showToolWorkspace(title) {
    document.getElementById('tool-title').textContent = title;
    this.showSection('workspace');
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
  },

  closeSidebar() {
    document.getElementById('sidebar').classList.add('hidden');
    document.getElementById('sidebar-overlay').classList.add('hidden');
  }
};

const Toast = {
  show(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
