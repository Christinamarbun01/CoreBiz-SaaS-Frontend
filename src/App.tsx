import React, { useEffect, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

import { queryClient } from './lib/queryClient';
import { useAuthStore } from './store/useAuthStore';
import { supabase } from './lib/supabase';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Lazy loading pages
const Login = React.lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const AppShell = React.lazy(() => import('./pages/AppShell'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/*" element={<AppShell />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>

        {/* Global Toast Notifications */}
        <Toaster position="top-right" richColors />

        {/* TanStack Query Devtools */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
