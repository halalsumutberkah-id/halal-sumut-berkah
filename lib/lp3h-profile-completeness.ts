// lib/lp3h-profile-completeness.ts

// field yang WAJIB diisi biar profil LP3H dianggap "lengkap" - persis
// field yang required di updateLp3hProfileSchema (kecuali logoUrl & bio
// yang memang opsional)
export function isLp3hProfileComplete(profile: { jenisLembaga: string | null; lembagaInduk: string | null; officeKecamatan: string | null; officeKabupaten: string | null; officeAddress: string | null; contactEmail: string | null }) {
  return Boolean(profile.jenisLembaga && profile.lembagaInduk && profile.officeKecamatan && profile.officeKabupaten && profile.officeAddress && profile.contactEmail);
}
