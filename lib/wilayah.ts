// fetch lewat API route sendiri (bukan langsung ke emsifa) karena
// emsifa.github.io tidak mengirim header CORS untuk request dari browser
export interface Regency {
  id: string;
  name: string; // contoh: "KOTA MEDAN", "KABUPATEN DELI SERDANG"
}

export interface District {
  id: string;
  name: string; // contoh: "MEDAN KOTA"
}

// ambil semua kabupaten/kota di Sumatera Utara
export async function getSumutRegencies(): Promise<Regency[]> {
  const res = await fetch('/api/wilayah/regencies');
  if (!res.ok) throw new Error('Gagal memuat data kabupaten/kota');
  const json = await res.json();
  return json.data;
}

// ambil semua kecamatan dalam 1 kabupaten/kota
export async function getDistricts(regencyId: string): Promise<District[]> {
  const res = await fetch(`/api/wilayah/districts/${regencyId}`);
  if (!res.ok) throw new Error('Gagal memuat data kecamatan');
  const json = await res.json();
  return json.data;
}
