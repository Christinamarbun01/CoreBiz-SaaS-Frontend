import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '../api/tenant.service';
import { type TenantFormData } from '../schemas/tenant.schema';
import { toast } from 'sonner';

export const TENANT_QUERY_KEY = ['tenants'] as const;

export function useTenants(search?: string) {
  return useQuery({
    queryKey: [...TENANT_QUERY_KEY, { search }],
    queryFn: () => tenantService.getTenants(search),
  });
}

export function useTenant(id: string | null) {
  return useQuery({
    queryKey: [...TENANT_QUERY_KEY, id],
    queryFn: () => tenantService.getTenant(id!),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TenantFormData) => tenantService.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEY });
      toast.success('Berhasil menambahkan tenant baru');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal menambahkan tenant');
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TenantFormData }) => 
      tenantService.updateTenant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TENANT_QUERY_KEY, variables.id] });
      toast.success('Berhasil memperbarui data tenant');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal memperbarui data tenant');
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tenantService.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEY });
      toast.success('Berhasil menghapus tenant');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal menghapus tenant');
    },
  });
}
