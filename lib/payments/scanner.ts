/**
 * Helper untuk membaca QR code dari berkas gambar (PNG, JPG, WEBP)
 * Menggunakan BarcodeDetector (bila didukung browser) dengan fallback ke jsQR.
 */

import jsQR from "jsqr";

export interface ScanQrResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Membaca QR code dari file gambar
 */
export async function readQrFromImageFile(file: File): Promise<ScanQrResult> {
  if (!file.type.startsWith("image/")) {
    return {
      success: false,
      error: "Berkas yang dipilih bukan berkas gambar. Silakan unggah berkas PNG atau JPG.",
    };
  }

  // Maksimal ukuran gambar 10MB
  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: "Ukuran berkas terlalu besar (maksimal 10MB).",
    };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      // 1. Coba menggunakan BarcodeDetector bawaan browser jika tersedia
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        try {
          const barcodeDetector = new (window as unknown as {
            BarcodeDetector: new (options?: { formats: string[] }) => {
              detect: (image: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
            };
          }).BarcodeDetector({ formats: ["qr_code"] });

          const barcodes = await barcodeDetector.detect(img);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            resolve({
              success: true,
              data: barcodes[0].rawValue,
            });
            return;
          }
        } catch {
          // Lanjutkan ke fallback canvas + jsQR
        }
      }

      // 2. Fallback menggunakan Canvas 2D + jsQR
      try {
        // Skalakan jika gambar terlalu besar (> 1200px) agar pembacaan cepat & andal
        let targetWidth = img.naturalWidth || img.width;
        let targetHeight = img.naturalHeight || img.height;
        const maxDimension = 1200;

        if (targetWidth > maxDimension || targetHeight > maxDimension) {
          if (targetWidth > targetHeight) {
            targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
            targetWidth = maxDimension;
          } else {
            targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
            targetHeight = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          resolve({
            success: false,
            error: "Browser Anda tidak mendukung rendering kanvas grafis.",
          });
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

        let code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code && code.data) {
          resolve({
            success: true,
            data: code.data,
          });
          return;
        }

        // Coba sekali lagi dengan resolusi asli bila tadi di-scale
        if (targetWidth !== (img.naturalWidth || img.width)) {
          const origCanvas = document.createElement("canvas");
          origCanvas.width = img.naturalWidth || img.width;
          origCanvas.height = img.naturalHeight || img.height;
          const origCtx = origCanvas.getContext("2d", { willReadFrequently: true });
          if (origCtx) {
            origCtx.drawImage(img, 0, 0);
            const origImageData = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height);
            code = jsQR(origImageData.data, origImageData.width, origImageData.height, {
              inversionAttempts: "attemptBoth",
            });
            if (code && code.data) {
              resolve({
                success: true,
                data: code.data,
              });
              return;
            }
          }
        }

        resolve({
          success: false,
          error:
            "Tidak ditemukan kode QR pada gambar yang diunggah. Pastikan gambar jelas, tidak buram, dan QRIS berada di tengah foto.",
        });
      } catch (err) {
        resolve({
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan saat memproses gambar QR.",
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        success: false,
        error: "Gagal memuat berkas gambar. Silakan gunakan format JPG atau PNG yang valid.",
      });
    };

    img.src = objectUrl;
  });
}
