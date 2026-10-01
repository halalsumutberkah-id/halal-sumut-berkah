// components/umkm/daftar-mandiri/daftar-mandiri-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { daftarMandiriSchema } from '@/schemas/daftar-mandiri.schema';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toTitleCase } from '@/lib/title-case';

interface ProductOption {
  id: string;
  name: string;
}

interface Lp3hOption {
  id: string;
  name: string;
}

interface PendampingOption {
  id: string;
  name: string;
  phone: string;
}

interface DaftarMandiriFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductOption[];
  onSuccess: () => void;
}

const emptyValues = {
  productId: '',
  lp3hId: '',
  pendampingId: '',
  isLowRisk: false,
  usesHalalIngredients: false,
  simpleCleanProduction: false,
  simpleEquipment: false,
  simplePreservation: false,
  agreedToTerms: false,
};

const QUESTIONS: { name: keyof typeof emptyValues; label: string }[] = [
  { name: 'isLowRisk', label: 'Apakah produk yang diajukan berupa barang dan tidak berisiko?' },
  {
    name: 'usesHalalIngredients',
    label: 'Apakah produk yang diajukan tidak menggunakan bahan berbahaya dan hanya menggunakan bahan yang sudah dipastikan kehalalannya?',
  },
  {
    name: 'simpleCleanProduction',
    label: 'Apakah proses produksi dilakukan secara sederhana dan dipastikan bebas dari kontaminasi najis dan bahan tidak halal?',
  },
  {
    name: 'simpleEquipment',
    label: 'Apakah menggunakan peralatan produksi dengan teknologi sederhana atau dilakukan secara manual dan/atau semi otomatis (usaha rumahan, bukan pabrik)?',
  },
  {
    name: 'simplePreservation',
    label: 'Apakah proses pengawetan produk dilakukan secara sederhana dan tidak menggunakan kombinasi metode pengawetan?',
  },
];

export function DaftarMandiriFormDialog({ open, onOpenChange, products, onSuccess }: DaftarMandiriFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lp3hList, setLp3hList] = useState<Lp3hOption[]>([]);
  const [pendampingList, setPendampingList] = useState<PendampingOption[]>([]);
  const [isLoadingPendamping, setIsLoadingPendamping] = useState(false);

  const form = useForm({
    defaultValues: emptyValues,
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      const parsed = daftarMandiriSchema.safeParse(value);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/umkm/daftar-mandiri', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success('Pengajuan berhasil dikirim');
        onOpenChange(false);
        onSuccess();
      } catch {
        toast.error('Terjadi kesalahan pada server');
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(emptyValues);
      setPendampingList([]);
      fetch('/api/public/lp3h')
        .then((res) => res.json())
        .then((res) => setLp3hList(res.data || []))
        .catch(() => toast.error('Gagal memuat daftar LP3H'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleLp3hChange(lp3hId: string, onFieldChange: (v: string) => void) {
    onFieldChange(lp3hId);
    form.setFieldValue('pendampingId', '');
    setPendampingList([]);

    if (!lp3hId) return;

    setIsLoadingPendamping(true);
    try {
      const res = await fetch(`/api/public/lp3h/${lp3hId}/pendamping`);
      const data = await res.json();
      setPendampingList(data.data || []);
    } catch {
      toast.error('Gagal memuat daftar Pendamping');
    } finally {
      setIsLoadingPendamping(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajukan Sertifikasi Halal Gratis</DialogTitle>
          <DialogDescription>Pilih produk yang ingin diurus sertifikat halalnya, lalu lengkapi form berikut.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="productId">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Pilih Produk</Label>
                <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? '')} disabled={isLoading}>
                  <SelectTrigger className="w-full">{field.state.value ? <SelectValue>{toTitleCase(products.find((p) => p.id === field.state.value)?.name ?? '')}</SelectValue> : <SelectValue placeholder="Pilih produk" />}</SelectTrigger>
                  <SelectContent>
                    {products.length === 0 ? (
                      <p className="px-2 py-3 text-center text-sm text-muted-foreground">Belum ada data di sini</p>
                    ) : (
                      products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {toTitleCase(p.name)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="lp3hId">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Pilih LP3H</Label>
                <Select value={field.state.value} onValueChange={(v) => handleLp3hChange(v ?? '', field.handleChange)} disabled={isLoading}>
                  <SelectTrigger className="w-full">{field.state.value ? <SelectValue>{toTitleCase(lp3hList.find((l) => l.id === field.state.value)?.name ?? '')}</SelectValue> : <SelectValue placeholder="Pilih LP3H" />}</SelectTrigger>
                  <SelectContent>
                    {lp3hList.length === 0 ? (
                      <p className="px-2 py-3 text-center text-sm text-muted-foreground">Belum ada data di sini</p>
                    ) : (
                      lp3hList.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {toTitleCase(l.name)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.lp3hId}>
            {(lp3hId) => (
              <form.Field name="pendampingId">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Pilih Pendamping</Label>
                    <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? '')} disabled={isLoading || pendampingList.length === 0}>
                      <SelectTrigger className="w-full">
                        {field.state.value ? <SelectValue>{toTitleCase(pendampingList.find((p) => p.id === field.state.value)?.name ?? '')}</SelectValue> : <SelectValue placeholder={isLoadingPendamping ? 'Memuat...' : 'Pilih LP3H dulu'} />}
                      </SelectTrigger>
                      <SelectContent>
                        {pendampingList.length === 0 ? (
                          <p className="px-2 py-3 text-center text-sm text-muted-foreground">{lp3hId ? 'Belum ada data di sini' : 'Pilih LP3H terlebih dahulu'}</p>
                        ) : (
                          pendampingList.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {toTitleCase(p.name)} - {p.phone}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            )}
          </form.Subscribe>

          <div className="flex flex-col gap-3 border-t pt-4">
            <h4 className="text-sm font-semibold">Pertanyaan Eligibilitas</h4>
            {QUESTIONS.map((q) => (
              <form.Field key={q.name} name={q.name}>
                {(field) => (
                  <label className="flex items-start gap-2 text-sm font-normal">
                    <Checkbox checked={field.state.value as boolean} disabled={isLoading} onCheckedChange={(checked) => field.handleChange(checked === true)} />
                    <span>{q.label}</span>
                  </label>
                )}
              </form.Field>
            ))}
          </div>

          <form.Field name="agreedToTerms">
            {(field) => (
              <label className="flex items-start gap-2 border-t pt-4 text-sm font-normal">
                <Checkbox checked={field.state.value} disabled={isLoading} onCheckedChange={(checked) => field.handleChange(checked === true)} />
                <span>Pernyataan Bersedia mengikuti Fasilitasi Sertifikasi Halal Self Declare sesuai ketentuan prosedur yang berlaku.</span>
              </label>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || isLoading}>
                  {isLoading ? 'Mengirim...' : 'Ajukan'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
