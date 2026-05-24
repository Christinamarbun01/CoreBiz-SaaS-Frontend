import api from './api';
import type { User, CreateUserFormValues, UpdateUserFormValues } from '../schemas/user.schema';

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  const responseData = response.data?.data || response.data;
  return Array.isArray(responseData) ? responseData : [];
};

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const createUser = async (user: CreateUserFormValues): Promise<User> => {
  const { data } = await api.post('/users', user);
  return data;
};

export const updateUser = async (id: string, user: UpdateUserFormValues): Promise<User> => {
  const { data } = await api.patch(`/users/${id}`, user);
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};
