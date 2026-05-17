import api from '../services/api';
import { tenantSchema, type Tenant, type TenantFormData } from '../schemas/tenant.schema';
import { z } from 'zod';

export const tenantService = {
  /**
   * Mengambil daftar tenant.
   * Parameter opsional `search` bisa diimplementasikan nanti di backend.
   */
  async getTenants(search?: string): Promise<Tenant[]> {
    const response = await api.get('/tenants', {
      params: search ? { search } : undefined,
    });
    
    // Validasi response array of tenants dari backend
    const responseData = response.data?.data || response.data;
    return z.array(tenantSchema).parse(responseData);
  },

  /**
   * Mengambil detail satu tenant berdasarkan ID.
   */
  async getTenant(id: string): Promise<Tenant> {
    const response = await api.get(`/tenants/${id}`);
    const responseData = response.data?.data || response.data;
    return tenantSchema.parse(responseData);
  },

  /**
   * Membuat tenant baru.
   */
  async createTenant(data: TenantFormData): Promise<Tenant> {
    const response = await api.post('/tenants', data);
    const responseData = response.data?.data || response.data;
    return tenantSchema.parse(responseData);
  },

  /**
   * Memperbarui data tenant yang ada.
   */
  async updateTenant(id: string, data: TenantFormData): Promise<Tenant> {
    const response = await api.put(`/tenants/${id}`, data);
    const responseData = response.data?.data || response.data;
    return tenantSchema.parse(responseData);
  },

  /**
   * Menghapus tenant berdasarkan ID.
   */
  async deleteTenant(id: string): Promise<void> {
    await api.delete(`/tenants/${id}`);
  }
};
