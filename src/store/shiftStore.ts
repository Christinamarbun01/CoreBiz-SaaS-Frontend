import { create } from 'zustand';

import { API_URL, HARDCODED_TOKEN as TOKEN } from '@/config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Shift {
  id: string;
  tenant_id: string;
  user_id: string;
  opening_balance: number;
  closing_balance: number | null;
  status: 'open' | 'closed';
  created_at: string;
  closed_at: string | null;
}

export interface AuditResult {
  opening_balance: number;
  total_cash_payments: number;
  total_expenses: number;
  expected_cash: number;
  closing_balance: number;
  difference: number;
  status: string;
}

interface ShiftState {
  activeShift: Shift | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  fetchActiveShift: () => Promise<void>;
  openShift: (openingBalance: number) => Promise<void>;
  closeShift: (closingBalance: number) => Promise<AuditResult>;
  clearShift: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useShiftStore = create<ShiftState>((set, get) => ({
  activeShift: null,
  loading: false,
  initialized: false,

  fetchActiveShift: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/shifts/active`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const json = await res.json();
      if (res.ok) {
        set({ activeShift: json.data || null, initialized: true });
      }
    } catch (err) {
      console.error('[ShiftStore] fetchActiveShift error:', err);
    } finally {
      set({ loading: false });
    }
  },

  openShift: async (openingBalance: number) => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/shifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ opening_balance: openingBalance }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal membuka shift');
      set({ activeShift: json.data });
    } catch (err) {
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  closeShift: async (closingBalance: number) => {
    const shift = get().activeShift;
    if (!shift) throw new Error('Tidak ada shift aktif');

    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/shifts/${shift.id}/close`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ closing_balance: closingBalance }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menutup shift');
      set({ activeShift: null });
      return json.audit as AuditResult;
    } catch (err) {
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  clearShift: () => set({ activeShift: null, initialized: false }),
}));
