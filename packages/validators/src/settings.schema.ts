import { z } from 'zod';

export const OrganizationSettingsSchema = z.object({
  defaultSignatureName: z.string().nullable().optional(),
  defaultSignatureRole: z.string().nullable().optional(),
  currencySymbol: z.string().default('Rp'),
  dateFormat: z.string().default('dd MMMM yyyy'),
});

export type OrganizationSettings = z.infer<typeof OrganizationSettingsSchema>;

export const OrganizationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nama organisasi wajib diisi'),
  legalName: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('Format email tidak valid').or(z.literal('')).nullable().optional(),
  taxId: z.string().nullable().optional(),
  logoAssetId: z.string().nullable().optional(),
  settingsJson: z.string().default('{}'),
});

export type OrganizationInput = z.infer<typeof OrganizationSchema>;
