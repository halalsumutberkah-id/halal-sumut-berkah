// app/admin/(dashboard)/daftar-mandiri/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';

interface SubmissionDetail {
  id: string;
  isLowRisk: boolean;
  usesHalalIngredients: boolean;
  simpleCleanProduction: boolean;
  simpleEquipment: boolean;
  simplePreservation: boolean;
  agreedToTerms: boolean;
  status: string;
  adminNote: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    photoUrl: string | null;
    umkm: { businessName: string; ownerName: string; user: { email: string } };
  };
  lp3h: { name: string; phone: string };
  pendamping: { name: string; phone: string } | null;
}

const STATUS_OPTIONS = [
  { value: 'belum_diproses', label: 'Belum Diproses' },
  { value: 'sedang_diproses', label: 'Sedang Diproses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditolak', label: 'Ditolak' },
];

const QUESTIONS: { key: keyof SubmissionDetail; label: string }[] = [
  { key: 'isLowRisk', label: 'Produk berupa barang dan tidak berisiko' },
  { key: 'usesHalalIngredients', label: 'Tidak menggunakan bahan berbahaya, bahan sudah dipastikan halal' },
  { key: 'simpleCleanProduction', label: 'Proses produksi sederhana, bebas kontaminasi najis' },
  { key: 'simpleEquipment', label: 'Peralatan sederhana/manual/semi otomatis (usaha rumahan)' },
  { key: 'simplePreservation', label: 'Proses pengawetan sederhana, tidak kombinasi metode' },
];

async function fetchDetail(id: string): Promise<SubmissionDetail> {
  const res = await fetch(`/api/admin/daftar-mandiri/${id}`);
  const data = await res.json();
  if (!res.ok || !data.data) throw new Error('Data tidak ditemukan');
  return data.data;
}

export default function AdminDaftarMandiriDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: submission, isLoading } = useQuery({
    queryKey: ['admin', 'daftar-mandiri', params.id],
    queryFn: () => fetchDetail(params.id),
  });

  const [status, setStatus] = useState('belum_diproses');
  const [adminNote, setAdminNote] = useState('');
  const [halalCertNumber, setHalalCertNumber] = useState('');
  const [halalCertUrl, setHalalCertUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (submission) {
      setStatus(submission.status);
      setAdminNote(submission.adminNote ?? '');
    }
  }, [submission]);

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/daftar-mandiri/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote, halalCertNumber, halalCertUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }

      toast.success('Status berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['admin', 'daftar-mandiri'] });
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!submission) return null;

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="w-fit gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground" onClick={() => router.push('/admin/daftar-mandiri')}>
        <ArrowLeft className="size-4" />
        Kembali ke daftar pengajuan
      </Button>

      <div>
        <h1 className="text-xl font-semibold text-foreground">{toTitleCase(submission.product.name)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {toTitleCase(submission.product.umkm.businessName)} ({toTitleCase(submission.product.umkm.ownerName)}) &middot; {formatDate(submission.createdAt)}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold text-foreground">Pendampingan</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">LP3H</span>
              <span className="text-sm">
                {toTitleCase(submission.lp3h.name)} &middot; {submission.lp3h.phone}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Pendamping</span>
              <span className="text-sm">{submission.pendamping ? `${toTitleCase(submission.pendamping.name)} \u00b7 ${submission.pendamping.phone}` : '-'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Email UMKM</span>
              <span className="text-sm">{submission.product.umkm.user.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold text-foreground">Jawaban Eligibilitas</h3>
          <div className="flex flex-col gap-2">
            {QUESTIONS.map((q) => {
              const value = submission[q.key] as boolean;
              return (
                <div key={String(q.key)} className="flex items-start gap-2 text-sm">
                  {value ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />}
                  <span>{q.label}</span>
                </div>
              );
            })}
          </div>
          <Badge variant={submission.agreedToTerms ? 'default' : 'destructive'} className="w-fit">
            {submission.agreedToTerms ? 'Menyetujui Pernyataan' : 'Belum Menyetujui'}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold text-foreground">Kelola Status Pengajuan</h3>

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v ?? 'belum_diproses')}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue>{STATUS_OPTIONS.find((o) => o.value === status)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Catatan Internal</Label>
            <Textarea rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Catatan progres pendampingan" />
          </div>

          {status === 'selesai' && (
            <div className="flex flex-col gap-4 rounded-md border border-primary/30 bg-primary/5 p-4">
              <p className="text-xs text-muted-foreground">
                Opsional - isi kalau sertifikat halal resmi sudah terbit (dikonfirmasi via WhatsApp) dan anda ingin langsung mencatatkannya di sini. Kalau dikosongkan, UMKM tetap bisa mengisinya sendiri nanti di menu E-Catalog.
              </p>
              <div className="flex flex-col gap-1.5">
                <Label>Nomor Sertifikat Halal</Label>
                <Input value={halalCertNumber} onChange={(e) => setHalalCertNumber(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>URL Sertifikat Halal</Label>
                <Input placeholder="https://..." value={halalCertUrl} onChange={(e) => setHalalCertUrl(e.target.value)} />
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={isSaving} className="w-fit">
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
