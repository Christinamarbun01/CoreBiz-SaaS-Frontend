import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tenantFormSchema, type TenantFormData, type Tenant } from '@/schemas/tenant.schema';
import { useCreateTenant, useUpdateTenant } from '@/hooks/useTenants';

interface TenantFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantToEdit?: Tenant | null;
}

export function TenantFormModal({ open, onOpenChange, tenantToEdit }: TenantFormModalProps) {
  const isEditing = !!tenantToEdit;
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TenantFormData>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      company_name: '',
      company_address: '',
      owner_name: '',
      owner_phone: '',
      manager_name: '',
      manager_phone: '',
    }
  });

  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant();

  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      if (tenantToEdit) {
        reset({
          company_name: tenantToEdit.company_name,
          company_address: tenantToEdit.company_address,
          owner_name: tenantToEdit.owner_name,
          owner_phone: tenantToEdit.owner_phone,
          manager_name: tenantToEdit.manager_name,
          manager_phone: tenantToEdit.manager_phone,
        });
      } else {
        reset({
          company_name: '',
          company_address: '',
          owner_name: '',
          owner_phone: '',
          manager_name: '',
          manager_phone: '',
        });
      }
    }
  }, [open, tenantToEdit, reset]);

  const onSubmit = (data: TenantFormData) => {
    if (isEditing && tenantToEdit?.id) {
      updateMutation.mutate(
        { id: tenantToEdit.id, data },
        {
          onSuccess: () => {
            onOpenChange(false);
          }
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-800">
            {isEditing ? 'Edit Data Tenant' : 'Tambah Tenant Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nama Perusahaan</Label>
              <Input
                id="company_name"
                placeholder="PT Contoh Maju Bersama"
                {...register('company_name')}
                className={errors.company_name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.company_name && (
                <p className="text-xs text-red-500">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_address">Alamat Perusahaan</Label>
              <Input
                id="company_address"
                placeholder="Jl. Sudirman No. 123"
                {...register('company_address')}
                className={errors.company_address ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.company_address && (
                <p className="text-xs text-red-500">{errors.company_address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_name">Nama Owner</Label>
                <Input
                  id="owner_name"
                  placeholder="Budi Santoso"
                  {...register('owner_name')}
                  className={errors.owner_name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.owner_name && (
                  <p className="text-xs text-red-500">{errors.owner_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_phone">No. HP Owner</Label>
                <Input
                  id="owner_phone"
                  placeholder="081234567890"
                  {...register('owner_phone')}
                  className={errors.owner_phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.owner_phone && (
                  <p className="text-xs text-red-500">{errors.owner_phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager_name">Nama Manager</Label>
                <Input
                  id="manager_name"
                  placeholder="Andi Wijaya"
                  {...register('manager_name')}
                  className={errors.manager_name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.manager_name && (
                  <p className="text-xs text-red-500">{errors.manager_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager_phone">No. HP Manager</Label>
                <Input
                  id="manager_phone"
                  placeholder="081987654321"
                  {...register('manager_phone')}
                  className={errors.manager_phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.manager_phone && (
                  <p className="text-xs text-red-500">{errors.manager_phone.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isPending}
            >
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
