import { KanbanBoard } from '@/components/KanbanBoard';

export default function OrdersPage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Order Management</h1>
            <p className="text-xs text-slate-500 font-medium">Monitor and manage incoming orders in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Live System</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6">
        <KanbanBoard />
      </main>
    </div>
  );
}
