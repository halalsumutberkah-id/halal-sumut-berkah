// app/lp3h/(dashboard)/settings/change-password/page.tsx

import { ChangePasswordForm } from '@/components/shared/change-password-form';

export default function Lp3hChangePasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Ganti Password</h1>
        <p className="text-sm text-muted-foreground">Perbarui password akun anda secara berkala untuk menjaga keamanan.</p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
