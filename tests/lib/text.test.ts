import { describe, it, expect } from 'vitest';
import { toLower, lowercaseFields } from '@/lib/text';

describe('toLower', () => {
  it('mengubah teks jadi lowercase', () => {
    expect(toLower('HALAL SUMUT')).toBe('halal sumut');
  });

  it('menghapus spasi di awal dan akhir', () => {
    expect(toLower('  Toko Ibu  ')).toBe('toko ibu');
  });
});

describe('lowercaseFields', () => {
  it('melowercase semua field string di object', () => {
    const result = lowercaseFields({
      businessName: 'Toko IBU',
      ownerName: 'SITI AMINAH',
    });

    expect(result.businessName).toBe('toko ibu');
    expect(result.ownerName).toBe('siti aminah');
  });

  it('tidak melowercase field yang ada di exclude list', () => {
    const result = lowercaseFields({ password: 'Rahasia123', businessName: 'Toko IBU' }, ['password']);

    // password TETAP "Rahasia123", tidak boleh ke-lowercase - ini bug
    // kritis kalau sampai kejadian (password jadi tidak match pas login)
    expect(result.password).toBe('Rahasia123');
    expect(result.businessName).toBe('toko ibu');
  });

  it('tidak menyentuh field yang bukan string (angka, array, boolean)', () => {
    const result = lowercaseFields({
      price: 15000,
      isPublished: true,
      permits: ['PIRT', 'BPOM'],
    });

    expect(result.price).toBe(15000);
    expect(result.isPublished).toBe(true);
    expect(result.permits).toEqual(['PIRT', 'BPOM']);
  });

  it('tidak mengubah object aslinya (return object baru)', () => {
    const original = { businessName: 'Toko IBU' };
    const result = lowercaseFields(original);

    expect(original.businessName).toBe('Toko IBU');
    expect(result.businessName).toBe('toko ibu');
  });
});
