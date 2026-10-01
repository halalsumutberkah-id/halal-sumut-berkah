// generate link dokumen lewat domain kita sendiri (proxy), bukan link
// Cloudinary asli langsung, biar tidak terekspos telanjang di UI
export function getDocumentViewUrl(fileUrl: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || '';
  return `${base}/api/documents/view?src=${encodeURIComponent(fileUrl)}`;
}
