import { resend, EMAIL_FROM } from '@/lib/resend';
import { siteConfig } from '@/lib/site-config';

export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 menit

export function generateOtp() {
  // 6 digit angka, "000000" - "999999"
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(to: string, name: string, otp: string) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: 'Kode Verifikasi Email - Halal Sumut Berkah',
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
            <h2 style="color:#1F2937; font-size:20px; margin:0 0 16px;">Verifikasi Email Anda</h2>
            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 4px;">Halo ${name},</p>
            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 24px;">
              Terima kasih telah mendaftar di Halal Sumut Berkah. Gunakan kode berikut untuk
              memverifikasi email anda dan mengaktifkan akun:
            </p>

            <div style="background:#F9FAFB; border:1.5px dashed #1D7A9C; border-radius:12px; padding:24px; text-align:center; margin-bottom:24px;">
              <span style="font-size:36px; font-weight:bold; letter-spacing:10px; color:#1D7A9C;">${otp}</span>
            </div>

            <p style="color:#6B7280; font-size:13px; line-height:1.6; margin:0 0 4px;">
              Kode ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini kepada
              siapapun, termasuk pihak yang mengaku dari Halal Sumut Berkah.
            </p>
            <p style="color:#6B7280; font-size:13px; line-height:1.6; margin:0;">
              Jika anda tidak merasa mendaftar di halalsumutberkah.id, abaikan email ini.
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
