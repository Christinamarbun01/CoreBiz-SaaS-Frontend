import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tenantFormSchema, type TenantFormData, type Tenant } from '@/schemas/tenant.schema';
import { useCreateTenant, useUpdateTenant } from '@/hooks/useTenants';
import { Building, User } from 'lucide-react';

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
      owner_email: '',
      owner_password: '',
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
          company_address: tenantToEdit.company_address || '',
          owner_name: tenantToEdit.owner_name,
          owner_phone: tenantToEdit.owner_phone || '',
          owner_email: tenantToEdit.owner_email || '',
          owner_password: '',
        });
      } else {
        reset({
          company_name: '',
          company_address: '',
          owner_name: '',
          owner_phone: '',
          owner_email: '',
          owner_password: '',
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
      <DialogContent className="sm:max-w-[700px] bg-white overflow-hidden p-0 rounded-xl">
        <div className="bg-indigo-600 px-6 py-4">
          <DialogTitle className="text-xl font-bold text-white">
            {isEditing ? 'Edit Data Tenant' : 'Mendaftarkan Tenant Baru'}
          </DialogTitle>
          <DialogDescription className="text-indigo-100 mt-1 text-sm">
            {isEditing ? 'Ubah informasi tenant dan ownernya.' : 'Isi form di bawah ini untuk mendaftarkan perusahaan dan ownernya.'}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            
            {/* Section Tenant */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800">1. Informasi Tenant</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nama Perusahaan <span className="text-red-500">*</span></Label>
                  <Input
                    id="company_name"
                    placeholder="Contoh: PT Maju Jaya"
                    {...register('company_name')}
                    className={errors.company_name ? 'border-red-500 focus-visible:ring-red-500 bg-white' : 'bg-white'}
                  />
                  {errors.company_name && (
                    <p className="text-xs text-red-500">{errors.company_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_address">Alamat Perusahaan <span className="text-red-500">*</span></Label>
                  <Input
                    id="company_address"
                    placeholder="Contoh: Jl. Sudirman No.1"
                    {...register('company_address')}
                    className={errors.company_address ? 'border-red-500 focus-visible:ring-red-500 bg-white' : 'bg-white'}
                  />
                  {errors.company_address && (
                    <p className="text-xs text-red-500">{errors.company_address.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section Owner */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800">2. Akun Owner</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Nama Lengkap Owner <span className="text-red-500">*</span></Label>
                    <Input
                      id="owner_name"
                      placeholder="Contoh: Budi Santoso"
                      {...register('owner_name')}
                      className={errors.owner_name ? 'border-red-500 focus-visible:ring-red-500 bg-white' : 'bg-white'}
                    />
                    {errors.owner_name && (
                      <p className="text-xs text-red-500">{errors.owner_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_phone">No HP Owner <span className="text-red-500">*</span></Label>
                    <Input
                      id="owner_phone"
                      placeholder="Contoh: 081234567890"
                      {...register('owner_phone')}
                      className={errors.owner_phone ? 'border-red-500 focus-visible:ring-red-500 bg-white' : 'bg-white'}
                    />
                    {errors.owner_phone && (
                      <p className="text-xs text-red-500">{errors.owner_phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner_email">Email Owner <span className="text-red-500">*</span></Label>
                    <Input
                      id="owner_email"
                      type="email"
                      placeholder="budi@majujaya.com"
                      {...register('owner_email')}
                      className={errors.owner_email ? 'border-red-500 focus-visible:ring-red-500 bg-white' : 'bg-white'}
                      disabled={isEditing}
                    />
                    {errors.owner_email && (
                      <p className="text-xs text-red-500">{errors.owner_email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="owner_password">
                      Password {isEditing ? <span className="text-xs text-slate-400 font-normal">(opsional)</span> : <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="owner_password"
                      type="password"
                      placeholder={isEditing ? 'Biarkan kosong jika tidak diubah' : 'Minimal 8 karakter'}
                      {...register('owner_password')}
                      className={errors.owner_password ? 'border-red-500 focus-visible:ring-red-500 bg-white' : 'bg-white'}
                    />
                    {errors.owner_password && (
                      <p className="text-xs text-red-500">{errors.owner_password.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          <DialogFooter className="pt-6 border-t border-slate-100 mt-6">
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Daftarkan Tenant'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
