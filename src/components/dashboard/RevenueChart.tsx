import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Inbox } from 'lucide-react';

interface ChartData {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: ChartData[];
  isLoading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading }) => {
  const formatYAxis = (tickItem: number) => {
    if (tickItem === 0) return '0';
    return `${(tickItem / 1000000).toFixed(1)}M`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 text-white p-3 rounded-lg shadow-xl">
          <p className="text-sm text-gray-300 mb-1">{label}</p>
          <p className="font-semibold text-indigo-400">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full h-[350px] bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[350px] bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400">
        <Inbox className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
        <p>Belum ada data transaksi di periode ini.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
            tickFormatter={formatYAxis}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
