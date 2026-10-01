import { useForm } from '@tanstack/react-form';
import { BUSINESS_TYPES } from '@/schemas/register.schema';

export const defaultValues = {
  email: '',
  password: '',
  confirmPassword: '',

  ownerName: '',
  ownerNik: '',
  ownerGender: '' as 'L' | 'P' | '',
  birthDate: '',
  ownerPhone: '',
  ownerKecamatan: '',
  ownerKabupaten: '',
  ownerAddress: '',
  ktpFile: null as File | null,

  businessName: '',
  logoFile: null as File | null,
  nibNumber: '',
  nibFile: null as File | null,
  establishedYear: new Date().getFullYear(),
  businessKecamatan: '',
  businessKabupaten: '',
  businessAddress: '',
  businessType: '' as (typeof BUSINESS_TYPES)[number] | '',
  businessCategoryId: '',
  customBusinessCategory: '',
  annualRevenue: '',
  businessContactNumber: '',
};

function useRegisterFormType() {
  return useForm({ defaultValues });
}

export type RegisterFormApi = ReturnType<typeof useRegisterFormType>;

export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  cv: 'CV',
  pt: 'PT',
  koperasi: 'Koperasi',
  perorangan: 'Perorangan',
  lainnya: 'Lainnya',
};
