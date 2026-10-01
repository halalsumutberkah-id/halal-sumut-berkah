'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import DOMPurify from 'isomorphic-dompurify';
import { educationContentSchema, EDUCATION_CATEGORIES } from '@/schemas/content.schema';
import { generateSlug } from '@/lib/utils';
import { uploadImage } from '@/lib/upload-file';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeferredImageField, type DeferredImageValue } from '@/components/shared/deferred-image-field';
import { RichTextEditor, type RichTextEditorHandle } from '@/components/shared/rich-text-editor';

export interface EducationRecord {
  id: string;
  title: string;
  category?: string;
  thumbnail: string | null;
  content: string;
  isPublished: boolean;
}

interface EducationFormProps {
  initialData?: EducationRecord;
}

export function EducationForm({ initialData }: EducationFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<RichTextEditorHandle>(null);

  const form = useForm({
    defaultValues: {
      title: initialData?.title ?? '',
      category: initialData?.category ?? 'produk_makanan',
      thumbnail: (initialData?.thumbnail ?? null) as DeferredImageValue,
      content: initialData?.content ?? '',
      isPublished: initialData?.isPublished ?? false,
    },
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const thumbnailUrl = value.thumbnail instanceof File ? await uploadImage(value.thumbnail, 'education-thumbnails') : value.thumbnail;

        const resolvedContent = (await editorRef.current?.resolveContent()) ?? value.content;

        const sanitized = {
          ...value,
          thumbnail: thumbnailUrl ?? '',
          content: DOMPurify.sanitize(resolvedContent),
        };

        const parsed = educationContentSchema.safeParse(sanitized);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setIsLoading(false);
          return;
        }

        const res = await fetch(isEdit ? `/api/admin/education/${initialData.id}` : '/api/admin/education', {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success(isEdit ? 'Artikel berhasil diperbarui' : 'Artikel berhasil dibuat');
        router.push('/admin/education');
        router.refresh();
      } catch {
        toast.error('Gagal mengunggah gambar, silakan coba lagi');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-6"
    >
      <Card>
        <CardContent className="flex flex-col gap-5 pt-6">
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) => {
                const result = educationContentSchema.shape.title.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Judul Artikel</Label>
                <Input id={field.name} disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                {field.state.value && <p className="text-xs text-muted-foreground">URL: /edukasi/{generateSlug(field.state.value)}</p>}
                {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Field
            name="category"
            validators={{
              onChange: ({ value }) => {
                const result = educationContentSchema.shape.category.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => {
              const selectedItem = EDUCATION_CATEGORIES.find((c) => c.value === field.state.value);

              return (
                <div className="flex flex-col gap-1.5">
                  <Label>Kategori Edukasi</Label>
                  <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? '')} disabled={isLoading}>
                    <SelectTrigger className="w-full">{selectedItem ? <SelectValue>{selectedItem.label}</SelectValue> : <SelectValue placeholder="Pilih kategori edukasi" />}</SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Objek Produk & Jasa</SelectLabel>
                        {EDUCATION_CATEGORIES.filter((c) => c.group === 'Objek Produk & Jasa').map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Kompetensi & Aktor Layanan</SelectLabel>
                        {EDUCATION_CATEGORIES.filter((c) => c.group === 'Kompetensi & Aktor Layanan').map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="thumbnail">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Thumbnail</Label>
                <DeferredImageField label="Thumbnail" value={field.state.value} onChange={field.handleChange} disabled={isLoading} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="content"
            validators={{
              onChange: ({ value }) => {
                const result = educationContentSchema.shape.content.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Konten</Label>
                <RichTextEditor ref={editorRef} value={field.state.value} onChange={field.handleChange} disabled={isLoading} />
                {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Field name="isPublished">
            {(field) => (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label htmlFor={field.name}>Publikasikan</Label>
                  <p className="text-xs text-muted-foreground">Kalau nonaktif, artikel disimpan sebagai draft dan tidak tampil di halaman publik.</p>
                </div>
                <Switch id={field.name} checked={field.state.value} onCheckedChange={field.handleChange} disabled={isLoading} />
              </div>
            )}
          </form.Field>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/education')} disabled={isLoading}>
          Batal
        </Button>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isLoading}>
              {isLoading ? 'Mengunggah & menyimpan...' : 'Simpan'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
