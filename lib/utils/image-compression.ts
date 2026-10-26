/**
 * Utility untuk kompresi gambar client-side dan konversi ke Base64 teks.
 * Memastikan ukuran data di bawah 5 MB untuk menghemat storage pada Supabase.
 */

export interface CompressImageOptions {
  /** Batas ukuran maksimum dalam MB (default: 5 MB) */
  maxSizeMB?: number;
  /** Lebar maksimum piksel (default: 1200) */
  maxWidth?: number;
  /** Tinggi maksimum piksel (default: 1200) */
  maxHeight?: number;
  /** Kualitas kompresi awal 0.1 - 1.0 (default: 0.82) */
  initialQuality?: number;
  /** Kualitas kompresi minimum jika masih melebihi batas (default: 0.3) */
  minQuality?: number;
}

export interface CompressImageResult {
  base64: string;
  sizeBytes: number;
  sizeFormatted: string;
  originalSizeBytes: number;
  originalSizeFormatted: string;
  width: number;
  height: number;
}

/**
 * Format bytes ke string yang mudah dibaca (B, KB, MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Menghitung perkiraan ukuran byte dari teks Data URL Base64
 */
export function estimateBase64SizeBytes(base64String: string): number {
  const parts = base64String.split(",");
  const base64Data = parts[1] || parts[0];
  // Base64 mengkodekan 3 bytes menjadi 4 karakter
  const padding = (base64Data.match(/=+$/) || [""])[0].length;
  return Math.max(0, Math.floor((base64Data.length * 3) / 4) - padding);
}

/**
 * Mengompresi file gambar di sisi browser dan mengubahnya menjadi Data URL Base64
 * dengan jaminan ukuran di bawah batas maxSizeMB (default 5 MB).
 */
export async function compressImageToBase64(
  file: File,
  options: CompressImageOptions = {}
): Promise<CompressImageResult> {
  const {
    maxSizeMB = 5,
    maxWidth = 1200,
    maxHeight = 1200,
    initialQuality = 0.82,
    minQuality = 0.3,
  } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("File yang dipilih bukan gambar yang valid.");
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const originalSizeBytes = file.size;

  // Baca file ke Image object via Object URL
  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Gagal membaca file gambar."));
      image.src = objectUrl;
    });

    // Hitung dimensi target
    let targetWidth = img.naturalWidth || img.width;
    let targetHeight = img.naturalHeight || img.height;

    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Tidak dapat membuat konteks gambar browser (Canvas 2D).");
    }

    // Aktifkan smoothing berkualitas tinggi
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Gambar ke canvas
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Format output: gunakan image/webp jika didukung, fallback ke image/jpeg
    let outputMime = "image/webp";
    const testCanvas = document.createElement("canvas");
    if (testCanvas.toDataURL("image/webp").indexOf("data:image/webp") !== 0) {
      outputMime = "image/jpeg";
    }

    let quality = initialQuality;
    let base64 = canvas.toDataURL(outputMime, quality);
    let sizeBytes = estimateBase64SizeBytes(base64);

    // Jika ukuran masih melebihi batas 5 MB, lakukan iterasi kompresi & resize
    let attempts = 0;
    while (sizeBytes > maxSizeBytes && attempts < 5) {
      attempts++;
      quality = Math.max(minQuality, quality - 0.15);

      // Kurangi dimensi jika kualitas sudah rendah tapi ukuran masih besar
      if (quality <= minQuality + 0.05) {
        targetWidth = Math.round(targetWidth * 0.8);
        targetHeight = Math.round(targetHeight * 0.8);
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      }

      base64 = canvas.toDataURL(outputMime, quality);
      sizeBytes = estimateBase64SizeBytes(base64);
    }

    if (sizeBytes > maxSizeBytes) {
      throw new Error(
        `Gambar terlalu besar (${formatBytes(
          sizeBytes
        )}). Batas maksimal setelah kompresi adalah ${maxSizeMB} MB.`
      );
    }

    return {
      base64,
      sizeBytes,
      sizeFormatted: formatBytes(sizeBytes),
      originalSizeBytes,
      originalSizeFormatted: formatBytes(originalSizeBytes),
      width: targetWidth,
      height: targetHeight,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
