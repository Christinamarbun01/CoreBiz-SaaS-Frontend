export type OrderSource = 'pos' | 'whatsapp';
export type OrderStatus = 'draft' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'qris' | 'transfer';

export interface KanbanOrder {
  id: string;
  source: OrderSource;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  method?: PaymentMethod | null;
  notes?: string | null;
  whatsapp_message_id?: string | null;
  custom_data?: Record<string, any> | null;
  created_at: string;
  customer?: {
    id: string;
    name?: string | null;
    phone_number?: string | null;
  } | null;
}
