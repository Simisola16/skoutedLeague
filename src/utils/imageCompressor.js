/**
 * Client-Side Image Compressor
 * Resizes and compresses image files (e.g. smartphone camera photos)
 * before upload to prevent network timeouts, body-size limit errors, and 'Failed to fetch' exceptions.
 */
export async function compressImage(file, { maxWidth = 1000, maxHeight = 1000, quality = 0.82 } = {}) {
  if (!file || !(file instanceof Blob) || !file.type.startsWith('image/')) {
    return file;
  }

  // Skip SVG or GIF to preserve vector / animation
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onerror = () => resolve(file);
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => resolve(file);
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;

            // If image is already smaller than max bounds and under 400KB, keep original
            if (width <= maxWidth && height <= maxHeight && file.size <= 400 * 1024) {
              return resolve(file);
            }

            // Calculate scaled dimensions while preserving aspect ratio
            if (width > maxWidth || height > maxHeight) {
              if (width / height > maxWidth / maxHeight) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d');

            if (!ctx) return resolve(file);

            // High-quality image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob || blob.size >= file.size) {
                  // If blob couldn't be generated or is somehow larger, use original
                  return resolve(file);
                }

                // Preserve original name but normalize extension to jpg if re-encoded
                const originalName = file.name || 'player-photo.jpg';
                const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                const compressedFile = new File([blob], `${baseName}.jpg`, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });

                resolve(compressedFile);
              },
              'image/jpeg',
              quality
            );
          } catch (canvasErr) {
            console.warn('[Image Compressor] Canvas draw error, using original file:', canvasErr);
            resolve(file);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('[Image Compressor] Exception caught, using original file:', err);
      resolve(file);
    }
  });
}
