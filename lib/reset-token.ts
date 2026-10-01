import crypto from 'crypto';
import { resend, EMAIL_FROM } from '@/lib/resend';
import { siteConfig } from '@/lib/site-config';

export const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 jam

export function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendResetPasswordEmail(to: string, name: string, token: string) {
  const resetUrl = `${siteConfig.url}/umkm/reset-password?token=${token}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: 'Reset Password - Halal Sumut Berkah',
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
            <h2 style="color:#1F2937; font-size:20px; margin:0 0 16px;">Reset Password Akun Anda</h2>
            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 4px;">Halo ${name},</p>
            <p style="color:#4B5563; font-size:14px; line-height:1.6; margin:0 0 24px;">
              Kami menerima permintaan untuk mereset password akun anda di Halal Sumut Berkah.
              Klik tombol di bawah untuk membuat password baru:
            </p>

            <div style="text-align:center; margin-bottom:24px;">
              <a href="${resetUrl}" style="display:inline-block; background-color:#1D7A9C; color:#FFFFFF; font-size:15px; font-weight:bold; text-decoration:none; padding:14px 32px; border-radius:999px;">
                Reset Password
              </a>
            </div>

            <p style="color:#6B7280; font-size:13px; line-height:1.6; margin:0 0 4px;">
              Link ini berlaku selama <strong>1 jam</strong>. Jika anda tidak meminta reset
              password, abaikan email ini - password anda tidak akan berubah.
            </p>
            <p style="color:#9CA3AF; font-size:12px; line-height:1.6; margin:16px 0 0; word-break:break-all;">
              Atau salin link berikut: ${resetUrl}
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
