import { NewsForm } from '@/components/admin/news/news-form';

export default function NewNewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Tulis Berita & Kegiatan</h1>
        <p className="text-sm text-muted-foreground">Buat informasi baru seputar berita atau kegiatan program halal.</p>
      </div>

      <NewsForm />
    </div>
  );
}
