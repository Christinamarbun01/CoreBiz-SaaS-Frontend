import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import POSPage from '@/pages/POSPage';
import CustomersPage from '@/pages/CustomersPage';
import ProductsPage from '@/pages/ProductsPage';
import PnLReportPage from '@/pages/PnLReportPage';
import OrdersPage from '@/pages/OrdersPage';
import TenantManagementPage from '@/pages/TenantManagementPage';
import UserManagementPage from '@/pages/UserManagementPage';
import KanbanCardDetail from '@/components/KanbanCardDetail';
import type { KanbanOrder } from '@/types/order';
import { ShiftBlocker, CloseShiftModal } from '@/components/ShiftManager';
import { ExpenseFormModal } from '@/components/ExpenseFormModal';
import { useShiftStore } from '@/store/shiftStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
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
  BarChart3,
  Box,
  DollarSign,
  TrendingDown,
  LogOut,
  Building,
  UserCog,
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

type TabKey = 'dashboard' | 'pos' | 'orders' | 'crm' | 'inventory' | 'finance' | 'tenant' | 'users';

// ─── Dashboard Tab Content (embedded from Dashboard.tsx) ─────────────────────
function DashboardTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('view') || 'overview';
  const period = searchParams.get('period') || '7d';

  const setView = (view: string) => setSearchParams({ tab: 'dashboard', view, period });
  const setPeriod = (newPeriod: string) => setSearchParams({ tab: 'dashboard', view: currentTab, period: newPeriod });

  const { data, isLoading, isError, error } = useDashboard(period);

  useEffect(() => {
    if (isError) {
      toast.error(`Gagal memuat data dashboard: ${error?.message}`);
    }
  }, [isError, error]);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Ringkasan Laporan Laba Rugi bisnis Anda.</p>
          </div>

          {/* Filter Periode */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            {[
              { id: '7d', label: '7 Hari' },
              { id: '30d', label: '30 Hari' },
              { id: '90d', label: '3 Bulan' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  period === p.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-gray-200/50 dark:bg-gray-800/50 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setView('overview')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${currentTab === 'overview' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
          >
            <BarChart3 className="w-4 h-4" /> Laba Rugi
          </button>
          <button
            onClick={() => setView('users')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${currentTab === 'users' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
          >
            <Users className="w-4 h-4" /> Pengguna
          </button>
          <button
            onClick={() => setView('inventory')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${currentTab === 'inventory' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
          >
            <Box className="w-4 h-4" /> Inventaris
          </button>
        </div>

        {currentTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Pendapatan (Revenue)"
                value={data?.revenue || 0}
                trend={data?.revenueTrend || 0}
                icon={<DollarSign className="w-5 h-5" />}
                isLoading={isLoading}
              />
              <StatCard
                title="Harga Pokok Penjualan (COGS)"
                value={data?.cogs || 0}
                trend={data?.cogsTrend || 0}
                icon={<TrendingDown className="w-5 h-5" />}
                isLoading={isLoading}
              />
              <StatCard
                title="Laba Bersih (Net Profit)"
                value={data?.netProfit || 0}
                trend={data?.netProfitTrend || 0}
                icon={<Wallet className="w-5 h-5" />}
                isLoading={isLoading}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Grafik Pendapatan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tren pendapatan harian selama periode terpilih.</p>
              </div>
              <RevenueChart data={data?.chartData || []} isLoading={isLoading} />
            </div>
          </div>
        )}

        {currentTab !== 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Modul Sedang Dikembangkan</h2>
            <p className="text-gray-500 dark:text-gray-400">Modul ini akan tersedia pada fase implementasi berikutnya.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AppShell ─────────────────────────────────────────────────────────────────
export default function AppShell() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabKey) || 'dashboard';
  const setActiveTab = (tab: TabKey) => setSearchParams({ tab });

  const [detailOpen, setDetailOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const { activeShift, loading, initialized, fetchActiveShift } = useShiftStore();
  const { user } = useAuthStore();
  const { logout, isLoggingOut } = useAuth();

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

  const navItems: { key: TabKey; icon: React.ReactNode; title: string; activeColor: string }[] = [
    { key: 'dashboard', icon: <LayoutDashboard size={22} />, title: 'Dashboard', activeColor: 'bg-indigo-50 text-indigo-600' },
    { key: 'pos', icon: <Store size={22} />, title: 'Kasir POS', activeColor: 'bg-slate-100 text-slate-900' },
    { key: 'orders', icon: <BarChart3 size={22} />, title: 'Manajemen Order', activeColor: 'bg-indigo-50 text-indigo-600' },
    { key: 'crm', icon: <Users size={22} />, title: 'Direktori CRM', activeColor: 'bg-blue-50 text-blue-600' },
    { key: 'users', icon: <UserCog size={22} />, title: 'Manajemen Pengguna', activeColor: 'bg-amber-50 text-amber-600' },
    { key: 'inventory', icon: <PackageSearch size={22} />, title: 'Katalog Produk', activeColor: 'bg-indigo-50 text-indigo-600' },
    { key: 'finance', icon: <LineChart size={22} />, title: 'Laporan Keuangan (P&L)', activeColor: 'bg-indigo-50 text-indigo-600' },
    { key: 'tenant', icon: <Building size={22} />, title: 'Manajemen Tenant', activeColor: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* ─── Sidebar ─── */}
      <nav className="w-16 flex-col items-center border-r border-slate-200 bg-white py-4 shadow-sm z-50 flex justify-between">
        <div>
          <div className="mb-8 font-bold text-slate-800 text-xl text-center">CB</div>
          <div className="flex flex-col gap-4">
            {navItems.map(({ key, icon, title, activeColor }) => (
              <Button
                key={key}
                variant="ghost"
                size="icon"
                onClick={() => setActiveTab(key)}
                className={`rounded-xl h-12 w-12 ${activeTab === key ? activeColor : 'text-slate-400 hover:text-slate-600'}`}
                title={title}
              >
                {icon}
              </Button>
            ))}
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
                onClick={() => logout()}
                disabled={isLoggingOut}
              >
                <LogOut size={14} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 overflow-hidden relative">
        {/* Action Buttons — pojok kanan bawah */}
        {activeShift && (
          <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
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

        {/* ─── Page Content ─── */}
        {activeTab === 'dashboard' && <DashboardTab />}

        {/* Shift Gatekeeper: hanya berlaku untuk tab POS */}
        {activeTab === 'pos' && (needsShift ? <ShiftBlocker /> : <POSPage />)}

        {activeTab === 'orders' && <OrdersPage />}
        {activeTab === 'crm' && <CustomersPage />}
        {activeTab === 'users' && <UserManagementPage />}
        {activeTab === 'inventory' && <ProductsPage />}
        {activeTab === 'finance' && <PnLReportPage />}
        {activeTab === 'tenant' && <TenantManagementPage />}

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
