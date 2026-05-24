import { z } from 'zod';

// Skema untuk data dari backend
export const tenantSchema = z.object({
  id: z.string().uuid().optional(),
  company_name: z.string().optional().default('-'),
  company_address: z.string().optional().default('-'),
  owner_name: z.string().optional().default('-'),
  owner_phone: z.string().optional().default('-'),
  owner_email: z.string().email('Format email owner tidak valid').optional().or(z.literal('')),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Tenant = z.infer<typeof tenantSchema>;

// Skema untuk form
export const tenantFormSchema = z.object({
  company_name: z.string().min(1, 'Nama perusahaan wajib diisi'),
  company_address: z.string().min(1, 'Alamat perusahaan wajib diisi'),
  owner_name: z.string().min(1, 'Nama lengkap owner wajib diisi'),
  owner_phone: z.string().min(1, 'No HP owner wajib diisi'),
  owner_email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  owner_password: z.string().min(8, 'Password minimal 8 karakter'),
});

export type TenantFormData = z.infer<typeof tenantFormSchema>;
