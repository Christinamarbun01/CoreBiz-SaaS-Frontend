import { useState } from 'react';
import { API_URL } from '@/config';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PackageMinus, Receipt, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Utility for formatting IDR
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function PnLReportPage() {
  // Date states
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['pnl-report', startDate, endDate],
    queryFn: async () => {

      const token = 'HARDCODED_STATIC_TOKEN_FOR_TESTING';

      const res = await fetch(`${API_URL}/reports/pnl?start_date=${startDate}&end_date=${endDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal mengambil data laporan');
      }
      
      return resData.data;
    }
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
          <TrendingDown size={48} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Ditolak / Error</h2>
        <p className="text-slate-600 max-w-md">
          {error?.message || 'Anda tidak memiliki izin (Owner) untuk melihat laporan keuangan ini.'}
        </p>
      </div>
    );
  }

  const summary = data?.summary || { total_revenue: 0, total_cogs: 0, total_expense: 0, net_profit: 0 };
  const dailyData = data?.daily_breakdown || [];

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      {/* Header & Filter */}
      <div className="p-4 md:p-8 border-b bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laba & Rugi (P&L)</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan finansial dan performa bisnis.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-36 text-xs bg-white border-0 shadow-sm"
            />
            <span className="text-slate-400 text-xs font-medium">to</span>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 w-36 text-xs bg-white border-0 shadow-sm"
            />
          </div>
          <Button onClick={() => refetch()} className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700">
            <Filter size={16} className="mr-2" />
            Terapkan
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-8 flex-1 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-16 bg-slate-100 rounded-t-xl" />
                <CardContent className="h-20 bg-slate-50 rounded-b-xl" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Executive Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-slate-500">Pendapatan Kotor</CardTitle>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{formatIDR(summary.total_revenue)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-slate-500">HPP (Modal Barang)</CardTitle>
                  <PackageMinus className="w-4 h-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{formatIDR(summary.total_cogs)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-slate-500">Biaya Operasional</CardTitle>
                  <Receipt className="w-4 h-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{formatIDR(summary.total_expense)}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg border-0 transform transition-all hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-indigo-100">Laba Bersih (Net Profit)</CardTitle>
                  <TrendingUp className="w-4 h-4 text-indigo-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold">{formatIDR(summary.net_profit)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recharts Visualization */}
            <Card className="p-4 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Tren Laba Harian</h3>
                <p className="text-sm text-slate-500">Visualisasi laba bersih selama periode yang dipilih.</p>
              </div>
              <div className="h-[300px] w-full">
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#64748b' }} 
                        tickMargin={10} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#64748b' }} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => formatIDR(Number(value))}
                        labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="net_profit" 
                        stroke="#4f46e5" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorProfit)" 
                        name="Laba Bersih"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    Tidak ada data untuk periode ini.
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
