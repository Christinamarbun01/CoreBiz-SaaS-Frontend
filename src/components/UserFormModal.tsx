import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  createUserSchema,
  updateUserSchema,
  type User,
  type CreateUserFormValues,
} from '@/schemas/user.schema';
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers';

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit: User | null;
}

export function UserFormModal({ open, onOpenChange, userToEdit }: UserFormModalProps) {
  const isEditing = !!userToEdit;
  
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'staff',
      is_active: true,
    },
  });

  const roleValue = watch('role');
  const isActiveValue = watch('is_active');

  useEffect(() => {
    if (open) {
      if (userToEdit) {
        reset({
          full_name: userToEdit.full_name,
          phone: userToEdit.phone || '',
          role: userToEdit.role,
          is_active: userToEdit.is_active,
          password: '',
        });
      } else {
        reset({
          email: '',
          password: '',
          full_name: '',
          phone: '',
          role: 'staff',
          is_active: true,
        });
      }
    }
  }, [open, userToEdit, reset]);

  const onSubmit = async (data: any) => {
    if (isEditing && userToEdit) {
      // Remove empty password if not changing
      const submitData = { ...data };
      if (!submitData.password) {
        delete submitData.password;
      }
      await updateMutation.mutateAsync({ id: userToEdit.id!, data: submitData });
    } else {
      await createMutation.mutateAsync(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? 'Formulir untuk memperbarui data staff atau manager.' : 'Formulir untuk menambahkan staff atau manager baru.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@perusahaan.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message as string}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEditing && <span className="text-xs text-slate-400 font-normal">(kosongkan jika tidak ingin mengubah)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Minimal 6 karakter"
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="John Doe"
              className={errors.full_name ? 'border-red-500' : ''}
            />
            {errors.full_name && (
              <p className="text-xs text-red-500">{errors.full_name.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="08123456789"
            />
          </div>

          <div className="space-y-2">
            <Label>Peran (Role)</Label>
            <Select 
              value={roleValue} 
              onValueChange={(val: 'staff' | 'manager') => setValue('role', val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message as string}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>Status Aktif</Label>
              <p className="text-xs text-slate-500">
                Pengguna nonaktif tidak dapat login.
              </p>
            </div>
            <Switch
              checked={isActiveValue}
              onCheckedChange={(val) => setValue('is_active', val)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting || createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
