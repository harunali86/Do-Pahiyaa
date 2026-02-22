/**
 * Compresses an image file to WebP format with a target size limit.
 * @param file The original File object
 * @param options Configuration options (maxWidth, quality, etc.)
 * @returns Promise<File> The compressed WebP file
 */
export async function compressImage(file: File, options?: { maxWidth?: number; maxSizeMB?: number }): Promise<File> {
    const maxWidth = options?.maxWidth || 1920;
    const maxSizeMB = options?.maxSizeMB || 0.2; // Default 200KB as requested
    const quality = 0.8; // Start quality

    if (file.type === 'image/webp' && file.size <= maxSizeMB * 1024 * 1024) {
        return file; // Already good
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Convert to WebP
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob failed'));
                            return;
                        }

                        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
