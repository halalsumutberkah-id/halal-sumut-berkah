import { describe, it, expect } from 'vitest';
import { toTitleCase } from '@/lib/title-case';

describe('toTitleCase', () => {
  it('mengubah huruf pertama tiap kata jadi kapital', () => {
    expect(toTitleCase('rinaldi ihsan')).toBe('Rinaldi Ihsan');
  });

  it('mempertahankan singkatan tetap uppercase (UMKM, LPH, NIB, KTP)', () => {
    expect(toTitleCase('toko umkm sejahtera')).toBe('Toko UMKM Sejahtera');
    expect(toTitleCase('lph lppom mui')).toBe('LPH Lppom Mui');
    expect(toTitleCase('nomor nib usaha')).toBe('Nomor NIB Usaha');
    expect(toTitleCase('upload ktp pemilik')).toBe('Upload KTP Pemilik');
  });

  it('bekerja walau input sudah mixed-case', () => {
    expect(toTitleCase('ToKo IbU')).toBe('Toko Ibu');
  });

  it('return string kosong kalau input null/undefined', () => {
    expect(toTitleCase(null)).toBe('');
    expect(toTitleCase(undefined)).toBe('');
  });

  it('return string kosong kalau input string kosong', () => {
    expect(toTitleCase('')).toBe('');
  });

  it('menangani spasi ganda tanpa error', () => {
    expect(() => toTitleCase('toko  ibu')).not.toThrow();
  });
});
