import axios from 'axios';
import { API_URL, HARDCODED_TOKEN } from '@/config';

// Membuat instance axios dengan konfigurasi dasar
const api = axios.create({
  // Mengambil URL dari environment variable (.env)
  // Vite menggunakan prefix VITE_ agar bisa dibaca di client-side
  baseURL: API_URL,
  timeout: 10000, // Timeout request setelah 10 detik
  headers: {
    'Content-Type': 'application/json',
  },
});

// Anda dapat menambahkan interceptor di sini (misalnya untuk menyisipkan token otomatis)
api.interceptors.request.use(
  (config) => {
    // Gunakan token dari localStorage, atau fallback ke HARDCODED_TOKEN untuk dev
    const token = localStorage.getItem('token') || HARDCODED_TOKEN;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Anda bisa menangani error secara global di sini, misal auto logout jika status 401
    if (error.response?.status === 401) {
      console.error('Sesi Anda telah berakhir, silakan login kembali.');
      // Contoh: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

import type { KanbanOrder, OrderStatus } from '@/types/order';

export const getOrders = async (): Promise<KanbanOrder[]> => {
  const { data } = await api.get('/orders');
  return data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<KanbanOrder> => {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data;
};

export default api;
