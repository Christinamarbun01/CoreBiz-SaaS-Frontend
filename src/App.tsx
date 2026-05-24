import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

import { queryClient } from './lib/queryClient';
import { useAuthStore } from './store/useAuthStore';
import { supabase } from './lib/supabase';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { Login } from './pages/Login';
import AppShell from './pages/AppShell';

// Loading Fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

function App() {
  const setUser = useAuthStore(state => state.setUser);
  const setLoading = useAuthStore(state => state.setLoading);

  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        
        // Timeout 3 detik untuk getSession
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout inisialisasi session')), 3000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session } } = (await Promise.race([sessionPromise, timeoutPromise])) as any;
        await setUser(session?.user ?? null);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        await setUser(null);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await setUser(session?.user ?? null);
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
