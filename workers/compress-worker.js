self.onmessage = async (e) => {
  const { imageData, targetSize, format } = e.data;
  try {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageData, 0, 0);

    let quality = 0.92;
    let blob = await canvas.convertToBlob({ type: format || 'image/jpeg', quality });

    while (blob.size > targetSize && quality > 0.1) {
      quality -= 0.05;
      blob = await canvas.convertToBlob({ type: format || 'image/jpeg', quality });
    }

    const originalSize = imageData.size || blob.size;
    const saved = ((1 - blob.size / originalSize) * 100).toFixed(1);

    self.postMessage({
      blob,
      originalSize,
      finalSize: blob.size,
      savedPercent: saved,
      quality
    });
  } catch (err) {
    self.postMessage({ error: err.message });
  }
};
