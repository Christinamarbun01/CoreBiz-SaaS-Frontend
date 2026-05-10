import api from '../services/api';
import { format, subDays } from 'date-fns';

export interface ProfitLossData {
  revenue: number;
  revenueTrend: number;
  cogs: number;
  cogsTrend: number;
  netProfit: number;
  netProfitTrend: number;
  chartData: {
    date: string;
    revenue: number;
  }[];
}

export const dashboardService = {
  /**
   * Mengambil data laba rugi dari Backend API.
   * Backend Express akan melakukan query agregrasi ke Supabase:
   * Revenue = SUM(orders.total_amount) WHERE status = 'completed'
   * COGS = SUM(order_items.quantity * order_items.unit_cost)
   */
  async getProfitLoss(period: string): Promise<ProfitLossData> {
    try {
      // Panggilan ke backend yang semestinya
      const { data } = await api.get<ProfitLossData>('/dashboard/profit-loss', {
        params: { period }
      });
      return data;
    } catch (error: any) {
      // FALLBACK MOCK DATA JIKA BACKEND BELUM DIBUAT (Untuk UI Development)
      console.warn("Backend endpoint /dashboard/profit-loss belum tersedia. Menggunakan Mock Data.");
      
      // Simulasi delay jaringan
      await new Promise(resolve => setTimeout(resolve, 800));

      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      
      // Generate mock chart data
      const chartData = Array.from({ length: days }).map((_, i) => ({
        date: format(subDays(new Date(), days - 1 - i), 'dd MMM'),
        revenue: Math.floor(Math.random() * 5000000) + 1000000,
      }));

      const totalRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);
      const totalCogs = totalRevenue * 0.4; // Asumsi HPP 40%
      const netProfit = totalRevenue - totalCogs;

      return {
        revenue: totalRevenue,
        revenueTrend: 12.5, // +12.5%
        cogs: totalCogs,
        cogsTrend: -2.3, // -2.3%
        netProfit: netProfit,
        netProfitTrend: 15.2, // +15.2%
        chartData,
      };
    }
  }
};
