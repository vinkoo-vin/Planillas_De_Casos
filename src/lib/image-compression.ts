export interface CompressedImageResult {
  dataUrl: string;
  name: string;
  sizeStr: string;
  originalBytes: number;
  compressedBytes: number;
}

/**
 * Optimiza y comprime una imagen seleccionada por el usuario usando Canvas de HTML5,
 * exportándola a formato WebP optimizado para almacenamiento eficiente en PostgreSQL.
 */
export async function compressImageToWebP(
  file: File,
  maxDimension = 1200,
  quality = 0.85
): Promise<CompressedImageResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo seleccionado no es una imagen válida (JPG, PNG, WEBP).");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo de imagen."));
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo decodificar la imagen seleccionada."));
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/webp", quality);
            const approxBytes = Math.round((compressedDataUrl.length * 3) / 4);
            const sizeStr =
              approxBytes < 1048576
                ? `${(approxBytes / 1024).toFixed(1)} KB (optimizado)`
                : `${(approxBytes / 1048576).toFixed(1)} MB (optimizado)`;

            const baseName = file.name.replace(/\.[^/.]+$/, "");
            resolve({
              dataUrl: compressedDataUrl,
              name: `${baseName}.webp`,
              sizeStr,
              originalBytes: file.size,
              compressedBytes: approxBytes,
            });
            return;
          }

          // Fallback en caso de que el contexto 2D no esté disponible
          const fallbackSize =
            file.size < 1048576
              ? `${(file.size / 1024).toFixed(1)} KB`
              : `${(file.size / 1048576).toFixed(1)} MB`;

          resolve({
            dataUrl: rawDataUrl,
            name: file.name,
            sizeStr: fallbackSize,
            originalBytes: file.size,
            compressedBytes: file.size,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}
