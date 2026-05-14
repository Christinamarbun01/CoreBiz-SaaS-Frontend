import api from '../services/api';
import { dashboardBackendSchema, type DashboardData } from '../schemas/dashboard.schema';

// Re-export data type as alias for easier compatibility if needed, though we can use DashboardData directly
export type ProfitLossData = DashboardData;

export const dashboardService = {
  /**
   * Mengambil data laba rugi dari Backend API.
   * Menggunakan Zod schema untuk validasi runtime dan pemetaan field snake_case ke camelCase.
   */
  async getProfitLoss(period: string): Promise<ProfitLossData> {
    // Melakukan hit API ke backend
    const response = await api.get('/dashboard/profit-loss', {
      params: { period }
    });
    
    // Validasi data yang diterima dengan schema Zod
    // Ini akan mentransformasi snake_case (misal net_profit) ke camelCase (netProfit) otomatis
    return dashboardBackendSchema.parse(response.data);
  }
};
