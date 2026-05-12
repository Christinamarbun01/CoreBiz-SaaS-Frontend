import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanOrder } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MessageSquareText, Receipt, Hash, User, Clock } from 'lucide-react';

interface KanbanCardProps {
  order: KanbanOrder;
  onClick: (order: KanbanOrder) => void;
}

const SOURCE_ICON = {
  pos: <Receipt size={12} />,
  whatsapp: <MessageSquareText size={12} />,
};

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function KanbanCard({ order, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: order.id,
    data: {
      type: 'Order',
      order,
    },
    disabled: order.status === 'completed', // Block dragging if completed
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 h-[120px] min-h-[120px] items-center flex justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"
      />
    );
  }

  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(order)}
    >
      <Card className={cn(
        "cursor-grab active:cursor-grabbing hover:border-slate-300 transition-all shadow-sm",
        order.status === 'completed' && "cursor-default opacity-80"
      )}>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Hash size={10} />
              {shortId}
            </div>
            <Badge variant="outline" className={cn(
              "px-1.5 py-0 text-[10px] gap-1 font-medium",
              order.source === 'whatsapp' ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-50 text-slate-600 border-slate-100"
            )}>
              {SOURCE_ICON[order.source]}
              {order.source.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 truncate">
              <User size={12} className="text-slate-400 shrink-0" />
              {order.customer?.name || 'Pelanggan Anonim'}
            </div>
            <div className="text-sm font-bold text-slate-900">
              {formatRupiah(order.total_amount)}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-50">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock size={10} />
              {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
            {order.payment_status === 'paid' && (
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] px-1 h-4">
                PAID
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
