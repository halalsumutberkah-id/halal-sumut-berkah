// app/admin/(dashboard)/education/new/page.tsx

import { EducationForm } from '@/components/admin/education/education-form';

export default function NewEducationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Tulis Artikel Edukasi</h1>
        <p className="text-sm text-muted-foreground">Buat artikel baru seputar edukasi sertifikasi halal.</p>
      </div>

      <EducationForm />
    </div>
  );
}
