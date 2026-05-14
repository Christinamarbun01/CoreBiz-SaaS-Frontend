import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LogOut, LayoutDashboard, User, BarChart3, Users, Box, DollarSign, TrendingDown, Wallet } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { logout, isLoggingOut } = useAuth();
  
  // URL State Management (Rule #5)
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const period = searchParams.get('period') || '7d';

  const setTab = (tab: string) => setSearchParams({ tab, period });
  const setPeriod = (newPeriod: string) => setSearchParams({ tab: currentTab, period: newPeriod });

  // Data Fetching with TanStack Query (Rule #2)
  const { data, isLoading, isError, error } = useDashboard(period);

  useEffect(() => {
    if (isError) {
      toast.error(`Gagal memuat data dashboard: ${error.message}`);
    }
  }, [isError, error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">CoreBiz</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700/50 text-sm border border-gray-200 dark:border-gray-600">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium">{user?.email}</span>
              </div>
              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Ringkasan Laporan Laba Rugi bisnis Anda.</p>
          </div>
          
          {/* Filter Periode (Rule #5) */}
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
            onClick={() => setTab('overview')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${currentTab === 'overview' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
          >
            <BarChart3 className="w-4 h-4" /> Laba Rugi
          </button>
          <button 
            onClick={() => setTab('users')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${currentTab === 'users' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
          >
            <Users className="w-4 h-4" /> Pengguna
          </button>
          <button 
            onClick={() => setTab('inventory')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${currentTab === 'inventory' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
          >
            <Box className="w-4 h-4" /> Inventaris
          </button>
        </div>

        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric Cards Grid */}
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

            {/* Revenue Chart Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Grafik Pendapatan</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tren pendapatan harian selama periode terpilih.</p>
                </div>
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
      </main>
    </div>
  );
};
