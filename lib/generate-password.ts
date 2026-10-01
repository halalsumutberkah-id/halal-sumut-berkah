import { randomBytes } from 'crypto';

// generate password acak, kombinasi huruf besar, kecil, angka, dan simbol
export function generateRandomPassword(length = 12) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const number = '23456789';
  const symbol = '!@#$%';
  const all = upper + lower + number + symbol;

  const pick = (chars: string) => chars[randomBytes(1)[0] % chars.length];

  // pastikan minimal ada 1 dari tiap jenis karakter
  let password = pick(upper) + pick(lower) + pick(number) + pick(symbol);

  for (let i = password.length; i < length; i++) {
    password += pick(all);
  }

  // acak urutan karakternya biar 4 karakter wajib tadi tidak selalu di depan
  return password
    .split('')
    .sort(() => randomBytes(1)[0] - 128)
    .join('');
}
