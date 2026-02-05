/**
 * Compresses an image file using the Canvas API.
 * 
 * @param file The original image file.
 * @param maxWidth Maximum width for the compressed image (default: 1080px).
 * @param quality Compression quality from 0 to 1 (default: 0.8).
 * @returns A promise that resolves to an object containing the compressed Blob and its Data URL.
 */
export const compressImage = (
    file: File,
    maxWidth: number = 1080,
    quality: number = 0.8
): Promise<{ blob: Blob; dataUrl: string }> => {
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

                // Maintain aspect ratio
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                // Draw image on canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Export as JPEG for total compatibility
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const dataUrl = canvas.toDataURL('image/jpeg', quality);
                            resolve({ blob, dataUrl });
                        } else {
                            reject(new Error('Canvas toBlob failed'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
};
