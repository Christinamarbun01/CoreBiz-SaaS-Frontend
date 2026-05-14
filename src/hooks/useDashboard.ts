import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../api/dashboard.service';

export const useDashboard = (period: string) => {
  return useQuery({
    queryKey: ['dashboard', 'profit-loss', period],
    queryFn: () => dashboardService.getProfitLoss(period),
    // Data dashboard di-cache selama 5 menit sesuai default queryClient
    // Jika period berubah, TanStack akan otomatis fetch ulang karena queryKey berbeda
  });
};
