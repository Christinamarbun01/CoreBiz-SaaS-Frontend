import { z } from 'zod';

export const userRoleEnum = z.enum(['staff', 'manager']);
export type UserRole = z.infer<typeof userRoleEnum>;

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Format email tidak valid'),
  full_name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  phone: z.string().optional(),
  role: userRoleEnum,
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
});

export const createUserSchema = userSchema.extend({
  password: z.string().min(6, 'Password minimal 6 karakter'),
}).omit({ id: true, created_at: true });

export const updateUserSchema = userSchema.partial().extend({
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
}).omit({ id: true, created_at: true, email: true });

export type User = z.infer<typeof userSchema>;
export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
