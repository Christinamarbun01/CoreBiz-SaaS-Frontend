import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Banknote, QrCode, Building2, CreditCard, Loader2 } from 'lucide-react';

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer';

export interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  subtotal: number;
  onSuccess: () => void;
}

export function CheckoutModal({
  open,
  onOpenChange,
  orderId,
  subtotal,
  onSuccess,
}: CheckoutModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [isPercent, setIsPercent] = useState(false);
  const [discountInput, setDiscountInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMethod('cash');
      setIsPercent(false);
      setDiscountInput('');
    }
  }, [open]);

  // Kalkulasi Diskon Cerdas
  const numInput = Number(discountInput) || 0;
  let discountNominal = 0;

  if (isPercent) {
    // Jika persentase, hitung dari subtotal
    const percent = Math.min(Math.max(numInput, 0), 100); // 0-100%
    discountNominal = Math.floor(subtotal * (percent / 100));
  } else {
    // Jika nominal, pastikan tidak melebihi subtotal
    discountNominal = Math.min(Math.max(numInput, 0), subtotal);
  }

  const totalAkhir = Math.max(0, subtotal - discountNominal);

  async function handlePay() {
    if (!orderId) return;
    
    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = 'HARDCODED_STATIC_TOKEN_FOR_TESTING';

      const res = await fetch(`${API_URL}/api/v1/orders/${orderId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          method,
          discount_amount: discountNominal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses pembayaran');
      }

      // Sukses
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Selesaikan Pembayaran
          </DialogTitle>
          <DialogDescription>
            Tentukan diskon dan metode pembayaran untuk pesanan ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Ringkasan & Diskon */}
          <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Subtotal</span>
              <span className="text-sm font-semibold text-slate-700">{formatRupiah(subtotal)}</span>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">Potongan Harga</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Rp</span>
                  <Switch 
                    checked={isPercent} 
                    onCheckedChange={setIsPercent}
                  />
                  <span className="text-xs text-slate-500 font-medium">%</span>
                </div>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 sm:text-sm">
                    {isPercent ? '%' : 'Rp'}
                  </span>
                </div>
                <Input
                  type="number"
                  placeholder="0"
                  className="pl-9"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  min={0}
                />
              </div>

              {isPercent && numInput > 0 && (
                <div className="flex justify-end">
                  <span className="text-xs text-red-500 font-medium">
                    - {formatRupiah(discountNominal)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-base font-bold text-slate-800">Total Akhir</span>
              <span className="text-2xl font-bold text-emerald-600">
                {formatRupiah(totalAkhir)}
              </span>
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">Metode Pembayaran</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setMethod('cash')}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all',
                  method === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                )}
              >
                <Banknote className="h-6 w-6" />
                <span className="text-xs font-semibold">Tunai</span>
              </button>
              
              <button
                onClick={() => setMethod('qris')}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all',
                  method === 'qris'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                )}
              >
                <QrCode className="h-6 w-6" />
                <span className="text-xs font-semibold">QRIS</span>
              </button>

              <button
                onClick={() => setMethod('transfer')}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all',
                  method === 'transfer'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                )}
              >
                <Building2 className="h-6 w-6" />
                <span className="text-xs font-semibold">Transfer</span>
              </button>
            </div>
          </div>

        </div>

        <Button 
          className="w-full h-12 text-base font-semibold"
          onClick={handlePay}
          disabled={isSubmitting || !orderId}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memproses...
            </>
          ) : (
            'Konfirmasi Pembayaran'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
