import axios from 'axios';

// Membuat instance axios dengan konfigurasi dasar
const api = axios.create({
  // Mengambil URL dari environment variable (.env)
  // Vite menggunakan prefix VITE_ agar bisa dibaca di client-side
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000, // Timeout request setelah 10 detik
  headers: {
    'Content-Type': 'application/json',
  },
});

// Anda dapat menambahkan interceptor di sini (misalnya untuk menyisipkan token otomatis)
api.interceptors.request.use(
  (config) => {
    // Contoh: Ambil token dari localStorage
    const token = localStorage.getItem('token');
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

export default api;
