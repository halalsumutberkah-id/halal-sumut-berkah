// lib/pendamping-notification-email.ts

import { resend, EMAIL_FROM } from '@/lib/resend';
import { siteConfig } from '@/lib/site-config';

export async function sendPendampingNotificationEmail(to: string, pendampingName: string, productName: string, businessName: string, businessContactNumber: string) {
  const subject = `Pengajuan Pendampingan Baru dari ${businessName} - Halal Sumut Berkah`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
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
            <h2 style="color:#1F2937; font-size:20px; margin:0 0 16px;">Ada Pengajuan Pendampingan Baru</h2>
            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 16px;">Halo ${pendampingName},</p>
            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 20px;">
              Anda dipilih sebagai pendamping untuk pengajuan Sertifikasi Halal Gratis (Daftar Mandiri)
              dari UMKM berikut. Silakan hubungi mereka langsung untuk memulai proses pendampingan:
            </p>

            <div style="background:#F0F9FB; border-left:4px solid #1D7A9C; border-radius:8px; padding:16px; margin-bottom:20px;">
              <p style="color:#1F2937; font-size:14px; margin:0 0 6px;"><strong>Nama Usaha:</strong> ${businessName}</p>
              <p style="color:#1F2937; font-size:14px; margin:0 0 6px;"><strong>Produk:</strong> ${productName}</p>
              <p style="color:#1F2937; font-size:14px; margin:0;"><strong>Kontak Usaha:</strong> ${businessContactNumber}</p>
            </div>

            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0;">
              Terima kasih atas kesediaan anda membantu proses sertifikasi halal UMKM ini.
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
