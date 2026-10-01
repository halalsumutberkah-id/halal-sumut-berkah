// lib/sertifikasi-gratis-email.ts

import { resend, EMAIL_FROM } from '@/lib/resend';
import { siteConfig } from '@/lib/site-config';

// B1d - notifikasi EMAIL ke LP3H setiap ada UMKM yang pendampingannya
// nyangkut ke lembaga mereka - dipakai di 3 titik: (1) saat UMKM submit
// dan langsung pilih Pendamping sendiri, (2) saat Admin resmi menugaskan
// lewat verifikasi, (3) saat Admin reassign ke Pendamping lain. Email
// gagal terkirim TIDAK boleh menggagalkan alur utama - selalu dibungkus
// try/catch di titik pemanggilan, sama seperti sendOtpEmail di alur
// registrasi.
export async function sendPendampinganEmail(to: string, lp3hName: string, umkmBusinessName: string, productNames: string[]) {
  const dashboardUrl = `${siteConfig.url}/lp3h/sertifikasi-gratis`;
  const productList = productNames.map((name) => `<li style="margin-bottom:4px;">${name}</li>`).join('');

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: 'Permohonan Pendampingan Self Declare Baru - Halal Sumut Berkah',
    html: `
      <div style="background-color:#F3F4F6; padding:40px 20px; font-family:Arial, Helvetica, sans-serif;">
        <div style="max-width:480px; margin:0 auto; background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <div style="background-color:#1D7A9C; padding:28px 24px; text-align:center;">
            <img src="${siteConfig.url}/images/logo_sumutprov.png" alt="Halal Sumut Berkah" width="48" height="48" style="display:block; margin:0 auto 10px; border:0;" />
            <p style="color:#FFFFFF; font-size:16px; font-weight:bold; letter-spacing:0.5px; margin:0;">
              HALAL SUMUT <span style="color:#FABC09;">BERKAH</span>
            </p>
          </div>

          <div style="padding:32px 28px;">
            <h2 style="color:#1F2937; font-size:20px; margin:0 0 16px;">Permohonan Pendampingan Baru</h2>
            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 4px;">Halo ${lp3hName},</p>
            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 16px;">
              UMKM <strong>${umkmBusinessName}</strong> mengajukan permohonan pendampingan Self Declare untuk produk berikut:
            </p>

            <ul style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 24px; padding-left:20px;">
              ${productList}
            </ul>

            <div style="text-align:center; margin-bottom:24px;">
              <a href="${dashboardUrl}" style="display:inline-block; background-color:#1D7A9C; color:#FFFFFF; font-size:15px; font-weight:bold; text-decoration:none; padding:14px 32px; border-radius:999px;">
                Lihat di Dashboard
              </a>
            </div>

            <p style="color:#6B7280; font-size:13px; line-height:1.6; margin:0;">
              Silakan masuk ke dashboard LP3H anda untuk melihat detail lengkap dan memulai proses pendampingan.
            </p>
          </div>

          <div style="background-color:#F9FAFB; padding:18px 24px; text-align:center; border-top:1px solid #E5E7EB;">
            <p style="color:#9CA3AF; font-size:12px; margin:0;">
              &copy; ${new Date().getFullYear()} Halal Sumut Berkah &mdash; Dinas Koperasi Kota Medan
            </p>
          </div>

        </div>
      </div>
    `,
  });
}
