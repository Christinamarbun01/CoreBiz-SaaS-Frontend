import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Order } from '../../services/ordersApi';
import { Phone, User, CreditCard } from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';

interface KanbanCardProps {
  order: Order;
}

export function KanbanCard({ order }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: {
      type: 'Order',
      order,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Mengambil nama pelanggan dengan fallback
  const customerName = order.customers?.name || order.custom_data?.customer_name || 'Pelanggan Umum';
  // Mengambil nomor telepon dengan fallback
  const phoneNumber = order.customers?.phone || order.customers?.phone_number || order.custom_data?.phone_number || '-';
  // Mengambil deskripsi pesanan
  const orderDetails = order.notes || order.custom_data?.order_details || 'Tidak ada catatan...';

  // Format ke Rupiah
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(order.total_amount || 0);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
      <Card className={`shadow-sm border-l-4 ${isDragging ? 'shadow-md' : ''}`} style={{ borderLeftColor: getStatusColor(order.status).replace('bg-', '') }}>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              {customerName}
            </CardTitle>
            <Badge variant="secondary" className={`text-white ${getStatusColor(order.status)} capitalize`}>
              {order.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone className="w-3 h-3" />
              {phoneNumber}
            </div>
          </div>
          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border mb-2 line-clamp-2">
            {orderDetails}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <Badge variant="outline" className="text-xs font-normal">
              {order.payment_status}
            </Badge>
            <span className="text-sm font-bold text-gray-800 flex items-center gap-1">
              <CreditCard className="w-4 h-4 text-gray-400" />
              {formattedTotal}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
