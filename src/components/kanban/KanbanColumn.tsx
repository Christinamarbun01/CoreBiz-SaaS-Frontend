import { useDroppable } from '@dnd-kit/core';
import type { OrderStatus } from '../../services/ordersApi';

interface KanbanColumnProps {
  id: OrderStatus;
  title: string;
  children: React.ReactNode;
  count: number;
}

export function KanbanColumn({ id, title, children, count }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
      column: id,
    },
  });

  const getHeaderColor = (status: OrderStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-t-gray-400';
      case 'processing':
        return 'bg-blue-50 text-blue-800 border-t-blue-500';
      case 'completed':
        return 'bg-green-50 text-green-800 border-t-green-500';
      case 'canceled':
        return 'bg-red-50 text-red-800 border-t-red-500';
      default:
        return 'bg-gray-100 border-t-gray-400';
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-[300px] max-w-[400px] h-full">
      <div className={`p-3 rounded-t-lg border-t-4 shadow-sm mb-2 font-bold flex justify-between items-center ${getHeaderColor(id)}`}>
        <span>{title}</span>
        <span className="bg-white px-2 py-1 rounded-full text-xs shadow-sm">{count}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 rounded-b-lg overflow-y-auto transition-colors min-h-[500px] ${
          isOver ? 'bg-gray-100 border-2 border-dashed border-gray-300' : 'bg-gray-50/50'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
