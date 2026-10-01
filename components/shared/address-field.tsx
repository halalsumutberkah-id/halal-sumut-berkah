// components/shared/address-field.tsx

'use client';

import { useEffect, useState } from 'react';
import { getSumutRegencies, getDistricts, type Regency, type District } from '@/lib/wilayah';
import { toTitleCase } from '@/lib/title-case';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddressFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

// gabungkan 3 bagian jadi 1 string alamat, contoh:
// "jl. sudirman no 10, kecamatan medan kota, kota medan"
function buildAddress(detail: string, kecamatan: string, kabupaten: string) {
  const parts: string[] = [];
  if (detail) parts.push(detail);
  if (kecamatan) parts.push(`kecamatan ${kecamatan}`);
  if (kabupaten) parts.push(kabupaten);
  return parts.join(', ');
}

// best-effort pisahkan kembali string alamat jadi 3 bagian, dipakai saat edit data lama
function parseAddress(address: string) {
  const segments = address.split(',').map((s) => s.trim());
  let kecamatan = '';
  let kabupaten = '';
  const detailParts: string[] = [];

  for (const seg of segments) {
    if (seg.toLowerCase().startsWith('kecamatan ')) {
      kecamatan = seg.replace(/^kecamatan\s+/i, '');
    } else if (/^(kabupaten|kota)\s/i.test(seg)) {
      kabupaten = seg;
    } else if (seg) {
      detailParts.push(seg);
    }
  }

  return { detail: detailParts.join(', '), kecamatan, kabupaten };
}

export function AddressField({ value, onChange, disabled, error }: AddressFieldProps) {
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoadingRegencies, setIsLoadingRegencies] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  const parsedInitial = parseAddress(value);
  const [detail, setDetail] = useState(parsedInitial.detail);
  const [kabupatenName, setKabupatenName] = useState(parsedInitial.kabupaten);
  const [kecamatanName, setKecamatanName] = useState(parsedInitial.kecamatan);

  useEffect(() => {
    getSumutRegencies()
      .then(setRegencies)
      .catch(() => {})
      .finally(() => setIsLoadingRegencies(false));
  }, []);

  // muat ulang daftar kecamatan tiap kali kabupaten/kota berubah
  useEffect(() => {
    const regency = regencies.find((r) => r.name.toLowerCase() === kabupatenName.toLowerCase());
    if (!regency) {
      setDistricts([]);
      return;
    }
    setIsLoadingDistricts(true);
    getDistricts(regency.id)
      .then(setDistricts)
      .catch(() => {})
      .finally(() => setIsLoadingDistricts(false));
  }, [kabupatenName, regencies]);

  function emitChange(nextDetail: string, nextKecamatan: string, nextKabupaten: string) {
    onChange(buildAddress(nextDetail, nextKecamatan, nextKabupaten));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Kabupaten/Kota</Label>
          <Select
            value={kabupatenName}
            onValueChange={(v) => {
              const next = v ?? '';
              setKabupatenName(next);
              setKecamatanName('');
              emitChange(detail, '', next);
            }}
            disabled={disabled || isLoadingRegencies}
          >
            <SelectTrigger className="w-full">{kabupatenName ? <SelectValue>{toTitleCase(kabupatenName)}</SelectValue> : <SelectValue placeholder="Pilih kabupaten/kota" />}</SelectTrigger>
            <SelectContent>
              {regencies.map((r) => (
                <SelectItem key={r.id} value={r.name.toLowerCase()}>
                  {toTitleCase(r.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Kecamatan</Label>
          <Select
            value={kecamatanName}
            onValueChange={(v) => {
              const next = v ?? '';
              setKecamatanName(next);
              emitChange(detail, next, kabupatenName);
            }}
            disabled={disabled || !kabupatenName || isLoadingDistricts}
          >
            <SelectTrigger className="w-full">{kecamatanName ? <SelectValue>{toTitleCase(kecamatanName)}</SelectValue> : <SelectValue placeholder={isLoadingDistricts ? 'Memuat...' : 'Pilih kecamatan'} />}</SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.name.toLowerCase()}>
                  {toTitleCase(d.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Detail Alamat</Label>
        <Textarea
          rows={2}
          placeholder="Nama jalan, nomor, RT/RW, dsb."
          value={detail}
          disabled={disabled}
          onChange={(e) => {
            setDetail(e.target.value);
            emitChange(e.target.value, kecamatanName, kabupatenName);
          }}
        />
      </div>

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
