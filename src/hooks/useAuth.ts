import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/auth.service';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setUser, logout: clearStore } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user);
      toast.success('Login berhasil!');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal login. Periksa kembali email dan password Anda.');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearStore();
      queryClient.clear();
      toast.success('Berhasil logout.');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal logout.');
    }
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
