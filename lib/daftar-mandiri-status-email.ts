// lib/daftar-mandiri-status-email.ts

import { resend, EMAIL_FROM } from '@/lib/resend';
import { siteConfig } from '@/lib/site-config';

const STATUS_LABELS: Record<string, string> = {
  belum_diproses: 'Belum Diproses',
  sedang_diproses: 'Sedang Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

const STATUS_MESSAGES: Record<string, string> = {
  belum_diproses: 'Pengajuan anda telah diterima dan sedang menunggu untuk mulai diproses oleh tim kami.',
  sedang_diproses: 'Pengajuan anda sedang dalam proses. Pendamping yang anda pilih akan segera menghubungi anda kalau belum, silakan tunggu atau hubungi mereka langsung.',
  selesai: 'Selamat! Proses pendampingan sertifikasi halal Daftar Mandiri untuk produk anda telah selesai.',
  ditolak: 'Mohon maaf, pengajuan Daftar Mandiri untuk produk ini tidak dapat dilanjutkan. Silakan periksa catatan di bawah, dan anda bisa mengajukan ulang lewat LP3H/Pendamping lain jika diperlukan.',
};

export async function sendDaftarMandiriStatusEmail(to: string, ownerName: string, productName: string, status: string, adminNote?: string | null) {
  const statusLabel = STATUS_LABELS[status] ?? status;
  const statusMessage = STATUS_MESSAGES[status] ?? '';

  const subject = `Status Pengajuan Daftar Mandiri "${productName}": ${statusLabel} - Halal Sumut Berkah`;

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
            <h2 style="color:#1F2937; font-size:20px; margin:0 0 16px;">Update Status Pengajuan</h2>
            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 16px;">Halo ${ownerName},</p>
            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 20px;">
              Status pengajuan Daftar Mandiri untuk produk <strong>${productName}</strong>
              anda telah diperbarui menjadi:
            </p>

            <div style="background:#F0F9FB; border-left:4px solid #1D7A9C; border-radius:8px; padding:16px; margin-bottom:20px;">
              <p style="color:#1D7A9C; font-size:16px; font-weight:bold; margin:0 0 8px;">${statusLabel}</p>
              <p style="color:#1F2937; font-size:14px; line-height:1.6; margin:0;">${statusMessage}</p>
            </div>

            ${
              adminNote
                ? `<div style="background:#FEF3C7; border-left:4px solid #D97706; border-radius:8px; padding:16px; margin-bottom:20px;">
                     <p style="color:#92400E; font-size:13px; font-weight:bold; margin:0 0 6px;">Catatan:</p>
                     <p style="color:#1F2937; font-size:14px; line-height:1.6; margin:0;">${adminNote}</p>
                   </div>`
                : ''
            }

            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0;">
              Cek detail lengkap pengajuan anda di dashboard UMKM, menu Daftar Mandiri.
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
