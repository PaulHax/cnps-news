export function resizeImage(file, maxWidth = 300) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas toBlob failed'));
          const dataUrl = URL.createObjectURL(blob);
          const ext = file.type === 'image/png' ? 'png' : 'jpg';
          const baseName = file.name.replace(/\.[^.]+$/, '');
          resolve({
            blob,
            dataUrl,
            filename: `${baseName}-${width}w.${ext}`,
            width,
            height,
          });
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

export function downloadImage(imageData) {
  const a = document.createElement('a');
  a.href = imageData.dataUrl || URL.createObjectURL(imageData.blob);
  a.download = imageData.filename;
  a.click();
}

export function downloadAllImages(articles) {
  const images = articles.flatMap((a) => a.images.filter((img) => img.blob));
  images.forEach((img) => downloadImage(img));
}
