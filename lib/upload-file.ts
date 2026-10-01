// lib/upload-file.ts

async function compressImage(file: File, maxWidth = 1024, quality = 0.8): Promise<Blob> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
    return file;
  }

  try {
    let width = 0;
    let height = 0;
    let imageSource: ImageBitmap | HTMLImageElement;

    if ('createImageBitmap' in window) {
      imageSource = await createImageBitmap(file);
      width = imageSource.width;
      height = imageSource.height;
    } else {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Gagal memuat gambar'));
        };
        img.src = objectUrl;
      });
      imageSource = img;
      width = img.width;
      height = img.height;
    }

    const scale = Math.min(1, maxWidth / width);
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);

    if ('close' in imageSource && typeof imageSource.close === 'function') {
      imageSource.close();
    }

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            canvas.toBlob((fallbackBlob) => resolve(fallbackBlob || file), 'image/jpeg', quality);
          }
        },
        'image/webp',
        quality,
      );
    });
  } catch {
    return file;
  }
}

export function formatErrorMessage(error: unknown, fallbackMessage = 'Terjadi kesalahan sistem, silakan coba lagi'): string {
  if (!error) return fallbackMessage;

  const rawMessage = error instanceof Error ? error.message : String(error);

  if (rawMessage.includes('Failed to fetch') || rawMessage.includes('NetworkError') || rawMessage.includes('Load failed')) {
    return 'Koneksi internet terputus atau tidak stabil. Silakan periksa jaringan Anda.';
  }

  if (rawMessage.includes('AbortError') || rawMessage.includes('timeout')) {
    return 'Waktu permintaan habis karena koneksi lambat. Silakan coba beberapa saat lagi.';
  }

  return rawMessage || fallbackMessage;
}

export async function uploadDocument(file: File, folder: string = 'umkm-documents'): Promise<string> {
  let fileToUpload: Blob | File = file;
  let fileName = file.name;

  if (file.type.startsWith('image/')) {
    try {
      fileToUpload = await compressImage(file);
      fileName = `${file.name.replace(/\.[^/.]+$/, '')}.webp`;
    } catch {
      fileToUpload = file;
    }
  }

  const formData = new FormData();
  formData.append('file', fileToUpload, fileName);
  formData.append('folder', folder);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error || `Gagal mengunggah berkas ${file.name}`);
    }

    return data.url as string;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Koneksi internet lambat: Proses unggah ${file.name} melebihi batas waktu.`);
    }
    if (err.message?.includes('Failed to fetch')) {
      throw new Error(`Gagal mengunggah ${file.name}. Periksa koneksi internet Anda.`);
    }
    throw err;
  }
}

export const uploadImage = uploadDocument;
