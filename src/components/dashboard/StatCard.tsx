import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  trend: number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, isLoading }) => {
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(value)}
        </h2>
      </div>
      <div className="mt-2 flex items-center text-sm">
        <span className={`flex items-center font-medium ${
          isPositive ? 'text-green-600 dark:text-green-400' : 
          isNegative ? 'text-red-600 dark:text-red-400' : 
          'text-gray-500'
        }`}>
          <TrendIcon className="w-4 h-4 mr-1" />
          {Math.abs(trend)}%
        </span>
        <span className="text-gray-500 dark:text-gray-400 ml-2">vs periode sebelumnya</span>
      </div>
    </div>
  );
};
