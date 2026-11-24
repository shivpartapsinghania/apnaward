export interface ProcessedImage {
  dataUrl: string;
  mimeType: string;
  originalName: string;
}

export async function processUploadedImage(file: File): Promise<ProcessedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file (JPEG, PNG, or WebP).');
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Image file is larger than 15 MB. Please choose a smaller photo.');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read the selected image.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  // Compress via canvas so payload & localStorage remain fast and reliable
  return new Promise<ProcessedImage>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 960;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({
          dataUrl: rawDataUrl,
          mimeType: file.type || 'image/jpeg',
          originalName: file.name,
        });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const outputMime = 'image/jpeg';
      const compressed = canvas.toDataURL(outputMime, 0.8);
      resolve({
        dataUrl: compressed,
        mimeType: outputMime,
        originalName: file.name,
      });
    };
    img.onerror = () => {
      resolve({
        dataUrl: rawDataUrl,
        mimeType: file.type || 'image/jpeg',
        originalName: file.name,
      });
    };
    img.src = rawDataUrl;
  });
}
