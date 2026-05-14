import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isLoggingIn } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-8 relative z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>

        <div className="text-center mb-10 mt-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">CoreBiz SaaS</h1>
          <p className="text-gray-400 text-sm">Masuk untuk mengelola sistem Anda</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-500 group-focus-within:text-indigo-400'}`} />
              </div>
              <input
                type="email"
                {...register('email')}
                className={`block w-full pl-11 pr-4 py-3.5 border rounded-xl leading-5 bg-gray-900/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all sm:text-sm ${
                  errors.email 
                    ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="admin@corebiz.com"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-500 group-focus-within:text-indigo-400'}`} />
              </div>
              <input
                type="password"
                {...register('password')}
                className={`block w-full pl-11 pr-4 py-3.5 border rounded-xl leading-5 bg-gray-900/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all sm:text-sm ${
                  errors.password 
                    ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex justify-center items-center py-3.5 px-4 mt-8 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {isLoggingIn ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Masuk ke Dashboard</span>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
