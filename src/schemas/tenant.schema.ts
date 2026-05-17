import { z } from 'zod';

// Skema untuk data dari backend (Membantu mentransformasi jika ada snake_case)
export const tenantSchema = z.object({
  id: z.string().uuid().optional(), // ID mungkin kosong saat create
  company_name: z.string().optional().default('-'),
  company_address: z.string().optional().default('-'),
  owner_name: z.string().optional().default('-'),
  owner_phone: z.string().optional().default('-'),
  manager_name: z.string().optional().default('-'),
  manager_phone: z.string().optional().default('-'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Tenant = z.infer<typeof tenantSchema>;

// Skema untuk form (Enforce strict validation on creation/edit)
export const tenantFormSchema = z.object({
  company_name: z.string().min(2, 'Nama perusahaan minimal 2 karakter'),
  company_address: z.string().min(5, 'Alamat perusahaan minimal 5 karakter'),
  owner_name: z.string().min(2, 'Nama owner minimal 2 karakter'),
  owner_phone: z.string().min(10, 'Nomor HP owner tidak valid'),
  manager_name: z.string().min(2, 'Nama manager minimal 2 karakter'),
  manager_phone: z.string().min(10, 'Nomor HP manager tidak valid'),
});

export type TenantFormData = z.infer<typeof tenantFormSchema>;
