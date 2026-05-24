import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  tenant_id: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => Promise<void>;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenant_id: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: async (user) => {
    if (!user) {
      set({ user: null, tenant_id: null, role: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      
      // Gunakan Promise.race dengan timeout 3 detik agar tidak loading selamanya jika Supabase lambat/terkendala
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout mengambil data tenant')), 3000)
      );

      const queryPromise = supabase
        .from('tenant_users')
        .select('tenant_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as any;
        
      if (error) {
        console.error('Error fetching tenant data:', error);
        set({ 
          user, 
          tenant_id: null, 
          role: null, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        set({ 
          user, 
          tenant_id: data.tenant_id, 
          role: data.role, 
          isAuthenticated: true, 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Error in setUser:', error);
      set({ 
        user, 
        tenant_id: null, 
        role: null, 
        isAuthenticated: true, 
        isLoading: false 
      });
    }
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  logout: () => {
    set({ user: null, tenant_id: null, role: null, isAuthenticated: false, isLoading: false });
  }
}));
