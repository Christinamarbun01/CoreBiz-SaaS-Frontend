import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertCircle, RefreshCcw } from 'lucide-react';

const ErrorFallback = ({ error, resetErrorBoundary }: { error: any; resetErrorBoundary: (...args: any[]) => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Terjadi Kesalahan</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Maaf, terjadi kesalahan tak terduga pada sistem. Tim kami telah diberitahu.
        </p>
        <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-4 mb-8 text-left overflow-auto max-h-32">
          <code className="text-xs text-red-600 dark:text-red-400 break-words font-mono">
            {error.message}
          </code>
        </div>
        <button
          onClick={resetErrorBoundary}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Muat Ulang Halaman
        </button>
      </div>
    </div>
  );
};

export const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};
