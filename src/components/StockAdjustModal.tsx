import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PackagePlus, ClipboardList, AlertTriangle } from 'lucide-react';

export type AdjustMode = 'restock' | 'opname';

interface Product {
  id: string;
  name: string;
  current_stock: number;
  sku: string | null;
}

interface StockAdjustModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AdjustMode;
  product: Product | null;
  onSuccess: () => void;
  token: string;
}

// Simple toast helper
function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toast = document.createElement('div');
  toast.className = [
    'fixed bottom-5 right-5 z-[9999] flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-medium shadow-xl transition-all',
    type === 'success'
      ? 'bg-emerald-600 text-white'
      : 'bg-red-600 text-white',
  ].join(' ');
  toast.textContent = message;
  document.body.appendChild(toast);

  // Slide-in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Fade-out
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

export function StockAdjustModal({
  open,
  onOpenChange,
  mode,
  product,
  onSuccess,
  token,
}: StockAdjustModalProps) {
  const [value, setValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear state on open/close
  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setValue('');
      setError(null);
    }
    onOpenChange(v);
  };

  const numValue = parseInt(value, 10);
  const isRestock = mode === 'restock';

  // Preview calculation
  const stockPreview = product
    ? isRestock
      ? product.current_stock + (isNaN(numValue) ? 0 : numValue)
      : isNaN(numValue)
      ? product.current_stock
      : numValue
    : 0;

  const quantityChange = product
    ? isRestock
      ? numValue
      : numValue - product.current_stock
    : 0;

  const handleSubmit = async () => {
    setError(null);

    if (!product) return;
    if (isNaN(numValue) || numValue < 0) {
      setError('Masukkan angka yang valid (minimal 0)');
      return;
    }

    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/v1/inventory/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          type: mode,
          value: numValue,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`✅ ${data.message}`);
        onSuccess();
        handleOpenChange(false);
      } else {
        setError(data.error || 'Gagal menyimpan penyesuaian stok');
      }
    } catch {
      setError('Terjadi kesalahan koneksi ke server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${isRestock ? 'bg-emerald-600' : 'bg-amber-600'}`}>
              {isRestock ? <PackagePlus size={20} /> : <ClipboardList size={20} />}
            </div>
            <div>
              <DialogTitle>
                {isRestock ? 'Barang Masuk (Restock)' : 'Koreksi Stok Aktual (Opname)'}
              </DialogTitle>
              {product && (
                <p className="text-xs text-slate-500 mt-0.5 font-normal">{product.name}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Info Banner */}
          <div className={`rounded-lg p-3 text-xs ${isRestock ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
            {isRestock ? (
              <p>📦 Masukkan <strong>jumlah barang yang baru diterima</strong>. Nilai ini akan <strong>ditambahkan</strong> ke stok saat ini.</p>
            ) : (
              <>
                <p>🔍 Ini adalah operasi <strong>Opname Fisik</strong>. Masukkan <strong>jumlah stok nyata yang ada di rak</strong> saat ini.</p>
                <p className="mt-1">Sistem akan otomatis menghitung selisih dan menyesuaikan stok.</p>
              </>
            )}
          </div>

          {/* Current Stock Chip */}
          {product && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
              <span className="text-xs text-slate-500">Stok Tercatat Saat Ini</span>
              <span className="font-mono font-bold text-slate-800">{product.current_stock} unit</span>
            </div>
          )}

          {/* Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {isRestock ? 'Jumlah Barang Diterima' : 'Jumlah Stok Aktual di Rak'}
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <Input
              type="number"
              min={0}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              placeholder={isRestock ? 'contoh: 50' : 'contoh: 37'}
              className={`text-lg font-mono font-bold tracking-wider text-center ${error ? 'border-red-400 focus:border-red-500' : ''}`}
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertTriangle size={12} />
                {error}
              </div>
            )}
          </div>

          {/* Stock Preview — tampilkan jika ada input */}
          {value !== '' && !isNaN(numValue) && product && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Preview Perubahan</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Stok Sebelumnya</span>
                <span className="font-mono text-slate-800">{product.current_stock}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Perubahan</span>
                <span className={`font-mono font-bold ${quantityChange > 0 ? 'text-emerald-600' : quantityChange < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                  {quantityChange > 0 ? `+${quantityChange}` : quantityChange}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Stok Setelah</span>
                <span className="font-mono font-bold text-lg text-slate-900">{stockPreview}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || value === ''}
            className={`text-white ${isRestock ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {isSubmitting ? 'Menyimpan...' : isRestock ? 'Simpan Restock' : 'Simpan Koreksi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
