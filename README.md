<div align="center">
  <br>
  <img src="assets/icon.svg" width="80" height="80" alt="PhotoMD Plus">
  <h1 align="center" style="font-size:2.5rem;font-weight:800;letter-spacing:-0.03em;margin:0.5rem 0">PhotoMD Plus</h1>
  <p align="center" style="font-size:1.1rem;color:#808080;max-width:600px;margin:0 auto">
    Editor profesional de imágenes — PWA moderna para Android y escritorio.
    Comprime, recorta, mejora y edita tus fotos desde cualquier dispositivo.
  </p>
  <br>
  <p>
    <a href="#"><img src="https://img.shields.io/badge/PWA-Instalable-FFD700?style=flat-square&logo=pwa" alt="PWA"></a>
    <a href="#"><img src="https://img.shields.io/badge/Android-Compatible-FFD700?style=flat-square&logo=android" alt="Android"></a>
    <a href="#"><img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5"></a>
    <a href="#"><img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3"></a>
    <a href="#"><img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript"></a>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-FFD700?style=flat-square" alt="License"></a>
  </p>
  <br>
</div>

---

## Características

| Funcionalidad | Descripción |
|---|---|
| Compresión inteligente | Reduce imágenes a 200 KB, 500 KB, 1 MB o tamaño personalizado |
| Eliminación de fondo | Quita el fondo automáticamente con opciones de color |
| Mejora de calidad | Aumenta nitidez, color y resolución (x2, x4, auto) |
| Recorte avanzado | Formatos 1:1, 16:9, 4:3, TikTok, YouTube, Instagram |
| Redimensionado | Presets 720p, 1080p, 1440p, 4K o medidas personalizadas |
| Editor básico | Brillo, contraste, saturación, temperatura, exposición, viñeta, filtros |
| Procesamiento múltiple | Edita lotes de imágenes con la misma configuración |
| Exportación | JPG, PNG, WebP — descarga individual o ZIP |
| Historial | Registro local de todas tus ediciones |
| Deshacer/Rehacer | Sistema completo de historial de cambios |

## Tecnologías

- **HTML5** — Estructura semántica y accesible
- **CSS3** — Variables, animaciones, diseño responsivo, modo oscuro
- **JavaScript ES6+** — Módulos, promesas, Canvas API, File API
- **PWA** — Service Worker, manifest.json, instalable en Android
- **Web Workers** — Procesamiento en segundo plano sin bloqueos
- **Canvas API** — Manipulación de píxeles, filtros, redimensionado
- **Drag & Drop API** — Arrastrar y soltar imágenes
- **Local Storage** — Persistencia del historial de ediciones
- **Librerías:** Cropper.js, Compressor.js, Fabric.js, JSZip, TensorFlow.js, ONNX Runtime Web

## Instalación

```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/photomd-plus.git

# Entra al directorio
cd photomd-plus

# Sirve la aplicación (usa cualquier servidor HTTP)
python3 -m http.server 8080
# o
npx serve .
```

Abre `http://localhost:8080` en tu navegador. En Android, usa "Añadir a pantalla de inicio" para instalar como PWA.

## Uso

1. **Sube imágenes** — Arrastra o selecciona desde galería/cámara
2. **Elige herramienta** — Compresión, fondo, mejora, recorte, etc.
3. **Ajusta parámetros** — Configura cada herramienta a tu gusto
4. **Procesa** — Aplica los cambios a una o varias imágenes
5. **Exporta** — Descarga en JPG, PNG o WebP

## Estructura

```
PhotoMD Plus/
├── index.html          # Página principal
├── style.css           # Estilos y diseño responsivo
├── app.js              # Lógica principal de la aplicación
├── manifest.json       # Configuración PWA
├── sw.js               # Service Worker
├── LICENSE             # MIT License
├── README.md           # Documentación
├── assets/             # Iconos y recursos gráficos
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── components/         # Módulos funcionales
│   ├── uploader.js
│   ├── gallery.js
│   ├── compressor.js
│   ├── background-remover.js
│   ├── enhancer.js
│   ├── cropper.js
│   ├── resizer.js
│   ├── editor.js
│   ├── exporter.js
│   ├── batch-processor.js
│   ├── history.js
│   └── tutorial.js
└── workers/            # Web Workers
    ├── compress-worker.js
    └── enhance-worker.js
```

## Hoja de ruta

- [x] Compresor inteligente con múltiples tamaños objetivo
- [x] Eliminador de fondo con colores personalizados
- [x] Mejorador de calidad con escalado x2/x4
- [x] Recorte avanzado con relaciones predefinidas
- [x] Redimensionado a resoluciones comunes
- [x] Editor básico con filtros y ajustes
- [x] Procesamiento por lotes
- [x] Exportación individual y en ZIP
- [ ] Reconocimiento de objetos con TensorFlow.js
- [ ] Editor de texto y capas con Fabric.js
- [ ] Sincronización en la nube
- [ ] Plugins y extensiones

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios propuestos.

1. Haz fork del proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Distribuido bajo la licencia **MIT**. Consulta [LICENSE](LICENSE) para más información.

---

<div align="center">
  <p style="color:#808080;font-size:0.85rem">
    Built with care for Android &nbsp;|&nbsp; PhotoMD Plus &copy; 2026
  </p>
</div>
