import { supabase } from './supabase';

export type OrderStatus = 'draft' | 'processing' | 'completed' | 'canceled';
export type PaymentStatus = 'unpaid' | 'paid' | 'partial';

export interface Order {
  id: string;
  tenant_id: string;
  customer_id?: string;
  shift_id?: string;
  source: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  custom_data?: any;
  notes?: string;
  whatsapp_message_id?: string;
  created_at: string;
  // Relasi dengan tabel customers
  customers?: {
    name?: string;
    phone_number?: string;
    phone?: string;
  };
}

export const fetchOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(*)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Order[];
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);
};
