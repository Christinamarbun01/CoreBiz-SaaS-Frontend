import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
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
  const [orders, setOrders] = useState<KanbanOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<KanbanOrder | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<KanbanOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ─── Sync Local State with Query ────────────────────────────────────────────
  const { data: fetchedOrders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  useEffect(() => {
    if (fetchedOrders) {
      setOrders(fetchedOrders);
    }
  }, [fetchedOrders]);


  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status pesanan diperbarui');
    },
    onError: (error: any) => {
      toast.error(`Gagal memperbarui status: ${error.message}`);
      // Revert local state to match server state
      if (fetchedOrders) setOrders(fetchedOrders);
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
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string) => {
    // Check if the id is a column id
    if (COLUMNS.some(col => col.id === id)) return id as OrderStatus;

    // Find the order with this id and return its status
    const order = orders.find(o => o.id === id);
    return order ? order.status : null;
  };

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
    const { active } = event;
    setActiveOrder(active.data.current?.order || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setOrders(prev => prev.map(o =>
      o.id === activeId ? { ...o, status: overContainer } : o
    ));
  };




  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeOrderData = active.data.current?.order as KanbanOrder | undefined;
    setActiveOrder(null);

    if (!over || !activeOrderData) {
      if (fetchedOrders) setOrders(fetchedOrders);
      return;
    }

    const overId = over.id as string;
    const newStatus = findContainer(overId);

    if (newStatus && newStatus !== activeOrderData.status) {
      if (activeOrderData.status === 'completed' && newStatus === 'draft') {
        toast.error('Pesanan yang sudah selesai tidak bisa dikembalikan ke Draft');
        if (fetchedOrders) setOrders(fetchedOrders);
        return;
      }

      updateStatusMutation.mutate({ id: active.id as string, status: newStatus });
    } else {
      if (fetchedOrders) setOrders(fetchedOrders);
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
    <div className="h-full w-full overflow-x-auto overflow-y-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="inline-flex gap-6 h-full min-w-full px-2">
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
              <KanbanCard order={activeOrder} onClick={() => { }} />
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
