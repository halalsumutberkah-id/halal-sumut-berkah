import { describe, it, expect } from 'vitest';
import { cn, formatRupiah, generateSlug, formatDate } from '@/lib/utils';

describe('cn', () => {
  it('menggabungkan beberapa class jadi 1 string', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center');
  });

  it('resolve konflik utility Tailwind, ambil yang terakhir', () => {
    // tailwind-merge harus pilih px-4 (yang terakhir), bukan px-2
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('mengabaikan value falsy (undefined, false, null)', () => {
    expect(cn('flex', undefined, false, null, 'gap-2')).toBe('flex gap-2');
  });
});

describe('formatRupiah', () => {
  // pakai .replace(/\s/g, "") biar tidak sensitif ke perbedaan spasi
  // "Rp 15.000" vs "Rp15.000" - itu beda versi Node.js/ICU, bukan bug
  // di fungsi aslinya. Yang penting dicek: prefix "Rp", pemisah ribuan
  // titik, dan tidak ada desimal
  it('format angka jadi format Rupiah Indonesia', () => {
    expect(formatRupiah(15000).replace(/\s/g, '')).toBe('Rp15.000');
  });

  it('format 0 dengan benar', () => {
    expect(formatRupiah(0).replace(/\s/g, '')).toBe('Rp0');
  });

  it('tidak menampilkan desimal', () => {
    expect(formatRupiah(1500000).replace(/\s/g, '')).toBe('Rp1.500.000');
  });
});

describe('generateSlug', () => {
  it('mengubah spasi jadi tanda strip', () => {
    expect(generateSlug('Halal Sumut Berkah')).toBe('halal-sumut-berkah');
  });

  it('mengubah ke lowercase', () => {
    expect(generateSlug('LPH LPPOM MUI')).toBe('lph-lppom-mui');
  });

  it('menghapus karakter spesial', () => {
    expect(generateSlug('Toko Ibu & Anak!')).toBe('toko-ibu-anak');
  });

  it('merapikan spasi/strip ganda jadi 1 strip', () => {
    expect(generateSlug('Halal   Sumut -- Berkah')).toBe('halal-sumut-berkah');
  });

  it('menghapus strip di awal dan akhir', () => {
    expect(generateSlug('  -Halal Sumut-  ')).toBe('halal-sumut');
  });

  it('2 nama yang mirip menghasilkan slug yang sama (perlu ditangani di caller)', () => {
    expect(generateSlug('Toko Sumber Rejeki')).toBe(generateSlug('toko sumber rejeki'));
  });
});

describe('formatDate', () => {
  it('format tanggal ke format Indonesia (hari bulan tahun)', () => {
    const result = formatDate(new Date('2026-01-15T00:00:00Z'));
    expect(result).toContain('Januari');
    expect(result).toContain('2026');
  });

  it('menerima input berupa string tanggal', () => {
    const result = formatDate('2026-08-17');
    expect(result).toContain('2026');
  });
});
