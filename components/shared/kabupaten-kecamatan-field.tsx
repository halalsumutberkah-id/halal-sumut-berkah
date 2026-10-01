// components/shared/kabupaten-kecamatan-field.tsx

'use client';

import { useEffect, useState } from 'react';
import { getSumutRegencies, getDistricts, type Regency, type District } from '@/lib/wilayah';
import { toTitleCase } from '@/lib/title-case';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KabupatenKecamatanFieldProps {
  kabupatenValue: string;
  kecamatanValue: string;
  onKabupatenChange: (value: string) => void;
  onKecamatanChange: (value: string) => void;
  disabled?: boolean;
  kabupatenError?: string;
  kecamatanError?: string;
}

export function KabupatenKecamatanField({ kabupatenValue, kecamatanValue, onKabupatenChange, onKecamatanChange, disabled, kabupatenError, kecamatanError }: KabupatenKecamatanFieldProps) {
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoadingRegencies, setIsLoadingRegencies] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  useEffect(() => {
    getSumutRegencies()
      .then(setRegencies)
      .catch(() => {})
      .finally(() => setIsLoadingRegencies(false));
  }, []);

  // muat ulang daftar kecamatan tiap kali kabupaten/kota berubah
  useEffect(() => {
    const regency = regencies.find((r) => r.name.toLowerCase() === kabupatenValue.toLowerCase());
    if (!regency) {
      setDistricts([]);
      return;
    }
    setIsLoadingDistricts(true);
    getDistricts(regency.id)
      .then(setDistricts)
      .catch(() => {})
      .finally(() => setIsLoadingDistricts(false));
  }, [kabupatenValue, regencies]);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label>Kabupaten/Kota</Label>
        <Select
          value={kabupatenValue}
          onValueChange={(v) => {
            const next = v ?? '';
            onKabupatenChange(next);
            onKecamatanChange('');
          }}
          disabled={disabled || isLoadingRegencies}
        >
          <SelectTrigger className="w-full">{kabupatenValue ? <SelectValue>{toTitleCase(kabupatenValue)}</SelectValue> : <SelectValue placeholder={isLoadingRegencies ? 'Memuat...' : 'Pilih kabupaten/kota'} />}</SelectTrigger>
          <SelectContent>
            {!isLoadingRegencies && regencies.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">Belum ada data di sini</p>
            ) : (
              regencies.map((r) => (
                <SelectItem key={r.id} value={r.name.toLowerCase()}>
                  {toTitleCase(r.name)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {kabupatenError && <span className="text-xs text-destructive">{kabupatenError}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Kecamatan</Label>
        <Select value={kecamatanValue} onValueChange={(v) => onKecamatanChange(v ?? '')} disabled={disabled || !kabupatenValue || isLoadingDistricts}>
          <SelectTrigger className="w-full">{kecamatanValue ? <SelectValue>{toTitleCase(kecamatanValue)}</SelectValue> : <SelectValue placeholder={isLoadingDistricts ? 'Memuat...' : 'Pilih kecamatan'} />}</SelectTrigger>
          <SelectContent>
            {!isLoadingDistricts && districts.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">Belum ada data di sini</p>
            ) : (
              districts.map((d) => (
                <SelectItem key={d.id} value={d.name.toLowerCase()}>
                  {toTitleCase(d.name)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {kecamatanError && <span className="text-xs text-destructive">{kecamatanError}</span>}
      </div>
    </>
  );
}
