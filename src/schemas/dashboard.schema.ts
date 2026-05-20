import { z } from 'zod';

// Schema untuk data item chart
export const chartDataItemSchema = z.object({
  date: z.string(),
  revenue: z.coerce.number(),
});

// Schema input backend (menerima snake_case)
export const dashboardBackendSchema = z.object({
  revenue: z.number().or(z.string().transform((val) => parseFloat(val))),
  revenue_trend: z.number().or(z.string().transform((val) => parseFloat(val))).optional(),
  revenueTrend: z.number().optional(),
  
  cogs: z.number().or(z.string().transform((val) => parseFloat(val))),
  cogs_trend: z.number().or(z.string().transform((val) => parseFloat(val))).optional(),
  cogsTrend: z.number().optional(),

  net_profit: z.number().or(z.string().transform((val) => parseFloat(val))).optional(),
  netProfit: z.number().optional(),
  
  net_profit_trend: z.number().or(z.string().transform((val) => parseFloat(val))).optional(),
  netProfitTrend: z.number().optional(),

  chart_data: z.array(chartDataItemSchema).optional(),
  chartData: z.array(chartDataItemSchema).optional(),
}).transform((data) => ({
  // Transformasi hasil akhir ke camelCase yang konsisten untuk Frontend
  revenue: data.revenue,
  revenueTrend: data.revenueTrend ?? data.revenue_trend ?? 0,
  cogs: data.cogs,
  cogsTrend: data.cogsTrend ?? data.cogs_trend ?? 0,
  netProfit: data.netProfit ?? data.net_profit ?? (data.revenue - data.cogs), // fallback calculation jika backend tidak mengirim
  netProfitTrend: data.netProfitTrend ?? data.net_profit_trend ?? 0,
  chartData: data.chartData ?? data.chart_data ?? [],
}));

export type DashboardData = z.infer<typeof dashboardBackendSchema>;
