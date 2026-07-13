self.onmessage = async (e) => {
  const { imageData, mode } = e.data;
  try {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageData, 0, 0);

    const scale = mode === 'x2' ? 2 : mode === 'x4' ? 4 : 1.5;
    if (scale > 1) {
      const w = Math.round(imageData.width * scale);
      const h = Math.round(imageData.height * scale);
      const bigCanvas = new OffscreenCanvas(w, h);
      const bigCtx = bigCanvas.getContext('2d');
      bigCtx.imageSmoothingQuality = 'high';
      bigCtx.drawImage(canvas, 0, 0, w, h);
      const blob = await bigCanvas.convertToBlob({ type: 'image/png' });
      self.postMessage({ blob, width: w, height: h });
    } else {
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      self.postMessage({ blob });
    }
  } catch (err) {
    self.postMessage({ error: err.message });
  }
};
