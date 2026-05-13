import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { KanbanOrder, OrderStatus } from '@/types/order';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: OrderStatus;
  title: string;
  orders: KanbanOrder[];
  onCardClick: (order: KanbanOrder) => void;
}

const COLUMN_STYLES: Record<OrderStatus, string> = {
  draft: 'bg-slate-50/50 border-slate-200',
  processing: 'bg-amber-50/30 border-amber-100',
  completed: 'bg-emerald-50/30 border-emerald-100',
  cancelled: 'bg-red-50/30 border-red-100',
};

const HEADER_STYLES: Record<OrderStatus, string> = {
  draft: 'text-slate-600',
  processing: 'text-amber-700',
  completed: 'text-emerald-700',
  cancelled: 'text-red-700',
};

export function KanbanColumn({ status, title, orders, onCardClick }: KanbanColumnProps) {
  const orderIds = orders.map((o) => o.id);

  const { setNodeRef } = useSortable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  return (
    <div className="flex flex-col h-full min-w-[280px] w-full max-w-[350px]">
      <div className="flex items-center justify-between px-3 py-2.5 mb-3">
        <div className="flex items-center gap-2">
          <h3 className={cn("text-xs font-bold uppercase tracking-wider", HEADER_STYLES[status])}>
            {title}
          </h3>
          <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-white border border-slate-200 rounded-full text-slate-500 shadow-sm">
            {orders.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 rounded-xl border border-dashed transition-colors flex flex-col gap-3 min-h-[500px]",
          COLUMN_STYLES[status]
        )}
      >
        <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
          {orders.map((order) => (
            <KanbanCard key={order.id} order={order} onClick={onCardClick} />
          ))}
        </SortableContext>
        
        {orders.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40 grayscale py-10">
            <div className="text-[10px] font-medium text-slate-400">Tidak ada pesanan</div>
          </div>
        )}
      </div>
    </div>
  );
}
