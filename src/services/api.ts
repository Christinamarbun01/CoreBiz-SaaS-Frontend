import axios from 'axios';
import { supabase } from '../lib/supabase';
import { API_URL } from '@/config';
import type { KanbanOrder, OrderStatus } from '@/types/order';

// Membuat instance axios dengan konfigurasi dasar
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Supabase session token automatically
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 by signing out
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Sesi Anda telah berakhir, silakan login kembali.');
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Orders API
export const getOrders = async (): Promise<KanbanOrder[]> => {
  const { data } = await api.get('/orders');
  return data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<KanbanOrder> => {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data;
};

export default api;
