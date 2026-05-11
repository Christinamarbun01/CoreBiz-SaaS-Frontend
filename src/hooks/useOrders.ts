import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { fetchOrders, updateOrderStatus } from '../services/ordersApi';
import type { Order, OrderStatus } from '../services/ordersApi';

export const useOrders = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previousOrders = queryClient.getQueryData<Order[]>(['orders']);

      queryClient.setQueryData<Order[]>(['orders'], (old) =>
        old?.map((order) => (order.id === id ? { ...order, status } : order))
      );

      return { previousOrders };
    },
    onError: (_, __, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Realtime Update Received:', payload);
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    updateStatus: updateStatusMutation.mutate,
  };
};
