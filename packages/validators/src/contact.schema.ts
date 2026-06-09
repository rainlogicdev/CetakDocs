import { z } from 'zod';

export const ContactSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['person', 'company']).default('person'),
  name: z.string().min(1, 'Nama wajib diisi'),
  companyName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('Format email tidak valid').or(z.literal('')).nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  metadataJson: z.string().default('{}'),
});

export type ContactInput = z.infer<typeof ContactSchema>;
