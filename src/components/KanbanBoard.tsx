import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { KanbanOrder, OrderStatus } from '@/types/order';
import { getOrders, updateOrderStatus } from '@/services/api';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import KanbanCardDetail from './KanbanCardDetail';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const COLUMNS: { id: OrderStatus; title: string }[] = [
  { id: 'draft', title: 'Draft' },
  { id: 'processing', title: 'Processing' },
  { id: 'completed', title: 'Completed' },
  { id: 'cancelled', title: 'Cancelled' },
];

export function KanbanBoard() {
  const queryClient = useQueryClient();
  const [activeOrder, setActiveOrder] = useState<KanbanOrder | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<KanbanOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => 
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status pesanan diperbarui');
    },
    onError: (error: any) => {
      toast.error(`Gagal memperbarui status: ${error.message}`);
    }
  });

  // ─── Realtime Subscription ──────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Realtime change received:', payload);
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          
          if (payload.eventType === 'INSERT') {
            toast.info('Ada pesanan baru masuk!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // ─── Drag & Drop Config ─────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const ordersByStatus = useMemo(() => {
    const map: Record<OrderStatus, KanbanOrder[]> = {
      draft: [],
      processing: [],
      completed: [],
      cancelled: [],
    };
    orders.forEach((order) => {
      if (map[order.status]) {
        map[order.status].push(order);
      }
    });
    return map;
  }, [orders]);

  // ─── Event Handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Order') {
      setActiveOrder(event.active.data.current.order);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveOrder(null);
    const { active, over } = event;
    if (!over) return;

    const orderId = active.id as string;
    const overData = over.data.current;

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let newStatus: OrderStatus | null = null;

    // If dropped over a column
    if (overData?.type === 'Column') {
      newStatus = overData.status;
    } 
    // If dropped over another card
    else if (overData?.type === 'Order') {
      newStatus = overData.order.status;
    }

    if (newStatus && newStatus !== order.status) {
      // Logic Check: Staf tidak bisa menggeser kartu dari completed kembali ke draft
      if (order.status === 'completed' && newStatus === 'draft') {
        toast.error('Pesanan yang sudah selesai tidak bisa dikembalikan ke Draft');
        return;
      }

      updateStatusMutation.mutate({ id: orderId, status: newStatus });
    }
  };

  const handleCardClick = (order: KanbanOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        <p className="text-sm font-medium text-slate-500">Memuat data pesanan...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden pb-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full px-2">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              status={col.id}
              title={col.title}
              orders={ordersByStatus[col.id]}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeOrder ? (
            <div className="w-[300px]">
              <KanbanCard order={activeOrder} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedOrder && (
        <KanbanCardDetail
          order={selectedOrder}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
        />
      )}
    </div>
  );
}
