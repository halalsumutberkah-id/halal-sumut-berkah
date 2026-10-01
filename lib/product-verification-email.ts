// lib/product-verification-email.ts

import { resend, EMAIL_FROM } from '@/lib/resend';
import { siteConfig } from '@/lib/site-config';

export async function sendProductVerificationEmail(to: string, ownerName: string, productName: string, status: 'terverifikasi' | 'ditolak', adminNote?: string) {
  const isVerified = status === 'terverifikasi';

  const subject = isVerified ? `Produk "${productName}" Telah Diverifikasi - Halal Sumut Berkah` : `Produk "${productName}" Perlu Diperbaiki - Halal Sumut Berkah`;

  const statusColor = isVerified ? '#1D7A9C' : '#DC2626';
  const statusBg = isVerified ? '#F0F9FB' : '#FEF2F2';

  const bodyHtml = isVerified
    ? `<p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 24px;">
        Produk <strong>${productName}</strong> anda telah <strong style="color:${statusColor};">diverifikasi</strong>
        oleh Admin. Produk ini sekarang bisa dipublikasikan ke katalog produk halal melalui menu
        <strong>Publish E-Catalog</strong> di dashboard anda.
      </p>`
    : `<p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 16px;">
        Produk <strong>${productName}</strong> anda <strong style="color:${statusColor};">memerlukan perbaikan</strong>
        sebelum bisa diverifikasi. Berikut catatan dari Admin:
      </p>
      <div style="background:${statusBg}; border-left:4px solid ${statusColor}; border-radius:8px; padding:16px; margin-bottom:20px;">
        <p style="color:#1F2937; font-size:14px; line-height:1.6; margin:0;">
          ${adminNote || 'Silakan hubungi Admin untuk informasi lebih lanjut.'}
        </p>
      </div>
      <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 24px;">
        Silakan perbaiki data produk anda di menu E-Catalog dashboard, produk akan otomatis
        diajukan ulang untuk diverifikasi.
      </p>`;

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
            <h2 style="color:#1F2937; font-size:20px; margin:0 0 16px;">
              ${isVerified ? 'Produk Terverifikasi' : 'Produk Perlu Diperbaiki'}
            </h2>
            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 4px;">Halo ${ownerName},</p>
            ${bodyHtml}
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
