import axios from 'axios';
import { supabase } from '../lib/supabase';

// Membuat instance axios dengan konfigurasi dasar
const api = axios.create({
  // Mengambil URL dari environment variable (.env)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000, // Timeout request setelah 10 detik
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menambahkan interceptor untuk menyisipkan token otomatis dari Supabase
api.interceptors.request.use(
  async (config) => {
    // Ambil session dari Supabase
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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Auto logout jika status 401
    if (error.response?.status === 401) {
      console.error('Sesi Anda telah berakhir, silakan login kembali.');
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
