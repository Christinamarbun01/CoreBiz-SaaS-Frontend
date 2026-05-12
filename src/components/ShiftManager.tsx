import { useState } from 'react';
import { useShiftStore } from '@/store/shiftStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, DollarSign, Loader2, Store } from 'lucide-react';

// ─── Toast helper ─────────────────────────────────────────────────────────────

function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const colors = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-indigo-600',
  };
  const el = document.createElement('div');
  el.className = `fixed bottom-5 right-5 z-[9999] max-w-sm rounded-xl px-5 py-3.5 text-sm font-medium text-white shadow-2xl ${colors[type]}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.4s';
    setTimeout(() => el.remove(), 400);
  }, 4500);
}

// ─── Format ───────────────────────────────────────────────────────────────────

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SHIFT BLOCKER — fullscreen overlay ketika belum buka kasir
// ═══════════════════════════════════════════════════════════════════════════════

export function ShiftBlocker() {
  const [modalOpen, setModalOpen] = useState(false);
  const [balance, setBalance] = useState('');
  const { openShift, loading } = useShiftStore();

  const handleOpen = async () => {
    const amount = parseFloat(balance);
    if (isNaN(amount) || amount < 0) {
      showToast('Masukkan nominal modal laci yang valid', 'error');
      return;
    }
    try {
      await openShift(amount);
      showToast('✅ Shift dibuka. Selamat bekerja!');
      setModalOpen(false);
      setBalance('');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Central card */}
      <div className="relative flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-10 shadow-xl">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-200">
          <Lock size={36} className="text-white" />
        </div>

        <h2 className="mb-2 text-xl font-bold text-slate-900">Kasir Belum Dibuka</h2>
        <p className="mb-8 text-center text-sm text-slate-500 leading-relaxed">
          Anda harus membuka shift kasir terlebih dahulu sebelum
          dapat memproses transaksi atau mengakses modul penjualan.
        </p>

        <Button
          size="lg"
          className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base shadow-md"
          onClick={() => setModalOpen(true)}
        >
          <Store size={20} />
          Buka Kasir Sekarang
        </Button>

        <p className="mt-4 text-[11px] text-slate-400 text-center">
          Shift akan mencatat semua transaksi dan pengeluaran Anda hari ini.
        </p>
      </div>

      {/* Modal Buka Kasir */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign size={18} className="text-indigo-600" />
              Buka Shift Kasir
            </DialogTitle>
            <DialogDescription>
              Masukkan jumlah modal laci awal untuk memulai shift hari ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Modal Laci Awal (Rp)
              </label>
              <Input
                type="number"
                step="1000"
                min="0"
                placeholder="contoh: 500000"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="font-mono text-lg h-12"
                autoFocus
              />
            </div>

            {balance && !isNaN(parseFloat(balance)) && parseFloat(balance) >= 0 && (
              <div className="rounded-lg bg-indigo-50 px-4 py-3 text-center">
                <p className="text-xs text-indigo-500 font-medium">Modal awal</p>
                <p className="text-lg font-bold text-indigo-700">{formatRupiah(parseFloat(balance))}</p>
              </div>
            )}

            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11"
              onClick={handleOpen}
              disabled={loading || !balance}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin mr-2" />Membuka Shift...</>
              ) : (
                'Konfirmasi & Buka Kasir'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CLOSE SHIFT MODAL — blind input, no expected amount shown
// ═══════════════════════════════════════════════════════════════════════════════

interface CloseShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloseShiftModal({ open, onOpenChange }: CloseShiftModalProps) {
  const [balance, setBalance] = useState('');
  const { closeShift, loading } = useShiftStore();

  const handleClose = async () => {
    const amount = parseFloat(balance);
    if (isNaN(amount) || amount < 0) {
      showToast('Masukkan nominal yang valid', 'error');
      return;
    }
    try {
      const audit = await closeShift(amount);

      // Tampilkan hasil audit sebagai toast
      const emoji = audit.difference === 0 ? '✅' : audit.difference > 0 ? '📈' : '⚠️';
      showToast(
        `${emoji} Shift ditutup. ${audit.status} | Ekspektasi: ${formatRupiah(audit.expected_cash)} | Fisik: ${formatRupiah(audit.closing_balance)} | Selisih: ${formatRupiah(audit.difference)}`,
        audit.difference === 0 ? 'success' : audit.difference > 0 ? 'info' : 'error',
      );

      setBalance('');
      onOpenChange(false);
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Lock size={18} />
            Tutup Shift & Audit Laci
          </DialogTitle>
          <DialogDescription>
            Hitung uang fisik di laci kasir Anda, lalu masukkan nominalnya di bawah.
            Sistem akan membandingkan dengan catatan otomatis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Jumlah Uang Fisik di Laci Saat Ini (Rp)
            </label>
            <Input
              type="number"
              step="1000"
              min="0"
              placeholder="Masukkan jumlah uang fisik di laci saat ini"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="font-mono text-lg h-12"
              autoFocus
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              ⚠️ Blind Input — Anda tidak dapat melihat ekspektasi sistem sebelum submit.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleClose}
              disabled={loading || !balance}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin mr-2" />Menutup...</>
              ) : (
                'Tutup Shift'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
