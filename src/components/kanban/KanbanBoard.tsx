import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import type { Order, OrderStatus } from '../../services/ordersApi';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Loader2 } from 'lucide-react';

const COLUMNS: { id: OrderStatus; title: string }[] = [
  { id: 'draft', title: 'Draft' },
  { id: 'processing', title: 'Processing' },
  { id: 'completed', title: 'Completed' },
  { id: 'canceled', title: 'Canceled' },
];

export function KanbanBoard() {
  const { orders, isLoading, error, updateStatus } = useOrders();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const orderId = active.id as string;
    const order = orders.find((o) => o.id === orderId);
    if (order) setActiveOrder(order);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveOrder(null);
    const { active, over } = event;

    if (!over) return;

    const orderId = active.id as string;
    const newStatus = over.id as OrderStatus;
    const order = orders.find((o) => o.id === orderId);

    if (order && order.status !== newStatus) {
      updateStatus({ id: orderId, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        <p>Gagal memuat pesanan: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 w-full h-full p-6 overflow-x-auto bg-gray-50/30">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            count={orders.filter((o) => o.status === column.id).length}
          >
            {orders
              .filter((o) => o.status === column.id)
              .map((order) => (
                <KanbanCard key={order.id} order={order} />
              ))}
          </KanbanColumn>
        ))}

        <DragOverlay>
          {activeOrder ? <KanbanCard order={activeOrder} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
