import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import POSPage from '@/pages/POSPage';
import CustomersPage from '@/pages/CustomersPage';
import ProductsPage from '@/pages/ProductsPage';
import PnLReportPage from '@/pages/PnLReportPage';
import OrdersPage from '@/pages/OrdersPage';
import KanbanCardDetail from '@/components/KanbanCardDetail';
import type { KanbanOrder } from '@/types/order';
import { ShiftBlocker, CloseShiftModal } from '@/components/ShiftManager';
import { ExpenseFormModal } from '@/components/ExpenseFormModal';
import { useShiftStore } from '@/store/shiftStore';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Store,
  Users,
  PackageSearch,
  UserCircle,
  Lock,
  Unlock,
  Loader2,
  CircleDot,
  Wallet,
  LineChart,
  LayoutDashboard,
} from 'lucide-react';

// Demo order — simulasikan data dari Supabase / WhatsApp
const DEMO_ORDER: KanbanOrder = {
  id: 'f3a1b2c4-d5e6-7890-abcd-ef1234567890',
  source: 'whatsapp',
  status: 'draft',
  payment_status: 'unpaid',
  subtotal_amount: 63000,
  discount_amount: 5000,
  total_amount: 58000,
  method: null,
  notes: 'Tolong dibungkus terpisah ya kak',
  whatsapp_message_id: '3B9A2F8E1C4D...',
  created_at: new Date().toISOString(),
  customer: {
    id: 'cust-001',
    name: 'Budi Santoso',
    phone_number: '6281234567890',
  },
  custom_data: {
    pesanan: 'Nasi Goreng Spesial x2, Es Teh Manis x1',
    ukuran: 'Large',
    level_pedas: 'Extra Pedas',
    alamat_antar: 'Jl. Merdeka No. 17',
    waktu_antar: '12:30 WIB',
  },
};

type TabKey = 'pos' | 'orders' | 'crm' | 'inventory' | 'finance';

export default function AppShell() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabKey) || 'pos';
  const setActiveTab = (tab: TabKey) => setSearchParams({ tab });

  const [detailOpen, setDetailOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const { activeShift, loading, initialized, fetchActiveShift } = useShiftStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchActiveShift();
  }, [fetchActiveShift]);

  const needsShift = activeTab === 'pos' && !activeShift;

  if (!initialized && loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Memeriksa status kasir...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* ─── Sidebar ─── */}
      <nav className="w-16 flex-col items-center border-r border-slate-200 bg-white py-4 shadow-sm z-50 flex justify-between">
        <div>
          <div className="mb-8 font-bold text-slate-800 text-xl text-center">CB</div>
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab('pos')}
              className={`rounded-xl h-12 w-12 ${activeTab === 'pos' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title="Kasir POS"
            >
              <Store size={22} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab('orders')}
              className={`rounded-xl h-12 w-12 ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Manajemen Order"
            >
              <LayoutDashboard size={22} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab('crm')}
              className={`rounded-xl h-12 w-12 ${activeTab === 'crm' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Direktori CRM"
            >
              <Users size={22} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab('inventory')}
              className={`rounded-xl h-12 w-12 ${activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Katalog Produk"
            >
              <PackageSearch size={22} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab('finance')}
              className={`rounded-xl h-12 w-12 ${activeTab === 'finance' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Laporan Keuangan (P&L)"
            >
              <LineChart size={22} />
            </Button>
          </div>
        </div>

        {/* ─── Profile Dropdown (bottom of sidebar) ─── */}
        <div className="flex flex-col items-center gap-3 pb-2">
          {activeShift && (
            <div className="flex items-center justify-center" title="Shift aktif">
              <CircleDot size={14} className="text-emerald-500 animate-pulse" />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-12 w-12 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                title="Profil & Shift"
              >
                <UserCircle size={24} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-semibold text-slate-900">Kasir CoreBiz</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'Staff'}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {activeShift ? (
                <>
                  <DropdownMenuLabel className="text-[11px] text-emerald-600 flex items-center gap-1.5">
                    <CircleDot size={10} className="animate-pulse" />
                    Shift Aktif
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
                    onClick={() => setCloseModalOpen(true)}
                  >
                    <Lock size={14} />
                    Tutup Kasir
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Lock size={10} />
                    Belum Ada Shift
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    className="gap-2 text-indigo-600 focus:bg-indigo-50 focus:text-indigo-700"
                    onClick={() => setActiveTab('pos')}
                  >
                    <Unlock size={14} />
                    Buka Kasir
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 overflow-hidden relative">
        {/* Action Buttons — pojok kanan atas */}
        {activeShift && (
          <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
            <Button
              onClick={() => setExpenseModalOpen(true)}
              size="sm"
              variant="outline"
              className="border-slate-300 bg-white text-xs shadow-md text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              <Wallet size={14} className="mr-1.5" />
              Catat Pengeluaran
            </Button>
            <Button
              onClick={() => setDetailOpen(true)}
              size="sm"
              variant="outline"
              className="border-slate-300 bg-white text-xs shadow-md"
            >
              🗂 Preview Kanban Detail
            </Button>
          </div>
        )}

        {/* Shift Gatekeeper: hanya berlaku untuk tab POS */}
        {needsShift ? (
          <ShiftBlocker />
        ) : (
          <>
            {activeTab === 'pos' && <POSPage />}
          </>
        )}

        {/* CRM, Inventory & Finance — tidak di-block oleh shift */}
        {activeTab === 'crm' && <CustomersPage />}
        {activeTab === 'inventory' && <ProductsPage />}
        {activeTab === 'finance' && <PnLReportPage />}
        {activeTab === 'orders' && <OrdersPage />}

        {/* Dialog detail order */}
        <KanbanCardDetail
          open={detailOpen}
          onOpenChange={setDetailOpen}
          order={DEMO_ORDER}
        />

        <ExpenseFormModal
          open={expenseModalOpen}
          onOpenChange={setExpenseModalOpen}
        />
      </main>

      {/* Close Shift Modal */}
      <CloseShiftModal
        open={closeModalOpen}
        onOpenChange={setCloseModalOpen}
      />
    </div>
  );
}
