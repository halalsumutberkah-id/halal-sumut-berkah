// singkatan yang tetap full uppercase, bukan Title Case biasa
const PRESERVE_UPPERCASE = ['umkm', 'lph', 'nib', 'ktp'];

// contoh: "rinaldi ihsan" -> "Rinaldi Ihsan"
// contoh: "toko umkm sejahtera" -> "Toko UMKM Sejahtera"
export function toTitleCase(text: string | null | undefined) {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (!word) return word;
      if (PRESERVE_UPPERCASE.includes(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
