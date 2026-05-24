import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import type { CreateUserFormValues, UpdateUserFormValues } from '../schemas/user.schema';
import { toast } from 'sonner';

export const useUsers = (search?: string) => {
  return useQuery({
    queryKey: ['users', search],
    queryFn: async () => {
      const data = await getUsers();
      const usersArray = Array.isArray(data) ? data : [];
      if (search) {
        const lowerSearch = search.toLowerCase();
        return usersArray.filter(
          (user) =>
            user.full_name?.toLowerCase().includes(lowerSearch) ||
            user.email.toLowerCase().includes(lowerSearch)
        );
      }
      return usersArray;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newUser: CreateUserFormValues) => createUser(newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Pengguna berhasil ditambahkan!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan pengguna');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserFormValues }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Data pengguna berhasil diperbarui!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui pengguna');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Pengguna berhasil dihapus!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus pengguna');
    },
  });
};
