import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { API_URL } from '@/config';
import { CheckoutModal } from '@/components/CheckoutModal';
import {
  MessageSquareText,
  Receipt,
  User,
  Clock,
  CreditCard,
  Hash,
  PackageCheck,
  StickyNote,
  Plus,
  Trash2,
  Save,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderSource   = 'pos' | 'whatsapp';
export type OrderStatus   = 'draft' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'qris' | 'transfer';

export interface KanbanOrder {
  id: string;
  source: OrderSource;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  method?: PaymentMethod | null;
  notes?: string | null;
  whatsapp_message_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  created_at: string;
  customer?: {
    id: string;
    name?: string | null;
    phone_number?: string | null;
  } | null;
}

interface KanbanCardDetailProps {
  order: KanbanOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Add onSuccess to trigger refetch
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Badge Configs ────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<OrderStatus, string> = {
  draft:      'bg-slate-100 text-slate-600 border-slate-200',
  processing: 'bg-amber-50  text-amber-700  border-amber-200',
  completed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-50    text-red-600     border-red-200',
};

const PAYMENT_STYLE: Record<PaymentStatus, string> = {
  unpaid:   'bg-orange-50 text-orange-600 border-orange-200',
  paid:     'bg-green-50  text-green-700  border-green-200',
  refunded: 'bg-purple-50 text-purple-700 border-purple-200',
};

const SOURCE_ICON: Record<OrderSource, React.ReactNode> = {
  pos:       <Receipt size={12} />,
  whatsapp:  <MessageSquareText size={12} />,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-none">
      <span className="mt-0.5 text-slate-400 shrink-0">{icon}</span>
      <span className="w-32 shrink-0 text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm text-slate-800 break-all">{value}</span>
    </div>
  );
}

// ─── Custom Data Section (Dynamic — No Hardcode) ──────────────────────────────

function CustomDataSection({
  data,
}: {
  data: Record<string, unknown> | null | undefined;
}) {
  const entries = data ? Object.entries(data) : [];

  if (entries.length === 0) {
    return (
      <p className="py-3 text-sm italic text-slate-400">
        Tidak ada catatan tambahan
      </p>
    );
  }

  return (
    <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex items-start gap-4 px-3 py-2.5 bg-white hover:bg-slate-50 transition-colors"
        >
          {/* Key — kapitalkan huruf pertama, ganti underscore dengan spasi */}
          <dt className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {key.replace(/_/g, ' ')}
          </dt>
          {/* Value — render apapun tipenya secara aman */}
          <dd className="text-sm text-slate-700 break-words">
            {typeof value === 'object' && value !== null
              ? <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                  {JSON.stringify(value)}
                </code>
              : String(value ?? '—')}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_PRODUCTS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Nasi Goreng Spesial' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Es Teh Manis' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Ayam Bakar Madu' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KanbanCardDetail({
  order,
  open,
  onOpenChange,
  onSuccess,
}: KanbanCardDetailProps) {
  const [linkedItems, setLinkedItems] = useState<{product_id: string, name: string, quantity: number}[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  if (!order) return null;

  const shortId = order.id.slice(0, 8).toUpperCase();

  const handleAddItem = () => {
    const qty = Number(quantity);
    if (!selectedProductId || qty < 1) return;
    
    const product = DUMMY_PRODUCTS.find((p) => p.id === selectedProductId);
    if (!product) return;

    setLinkedItems((prev) => {
      const existing = prev.find((item) => item.product_id === selectedProductId);
      if (existing) {
        return prev.map((item) =>
          item.product_id === selectedProductId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product_id: product.id, name: product.name, quantity: qty }];
    });
    
    setSelectedProductId('');
    setQuantity(1);
  };

  const handleRemoveItem = (productId: string) => {
    setLinkedItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const handleSubmitLink = async () => {
    if (linkedItems.length === 0) {
      alert('Minimal satu produk harus ditambahkan ke list!');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = 'HARDCODED_STATIC_TOKEN_FOR_TESTING';
      const payload = {
        notes: notes.trim() || undefined,
        items: linkedItems.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))
      };


      const response = await fetch(`${API_URL}/orders/${order.id}/link-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mengikat item.');
      }

      alert('Berhasil mengikat item dan memproses pesanan!');
      setLinkedItems([]);
      setNotes('');
      onOpenChange(false);
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0">

        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            {/* Source badge */}
            <span className={cn(
              'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
              order.source === 'whatsapp'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-slate-100 text-slate-600 border-slate-200',
            )}>
              {SOURCE_ICON[order.source]}
              {order.source.toUpperCase()}
            </span>

            {/* Order status */}
            <span className={cn(
              'rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
              STATUS_STYLE[order.status],
            )}>
              {order.status}
            </span>

            {/* Payment status */}
            <span className={cn(
              'rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
              PAYMENT_STYLE[order.payment_status],
            )}>
              {order.payment_status}
            </span>
          </div>

          <DialogTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Hash size={15} className="text-slate-400" />
            Order {shortId}
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-400">
            {formatDateTime(order.created_at)}
          </DialogDescription>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="px-6 py-4 space-y-5">

          {/* Info Umum */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Informasi Order
            </h3>
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-white divide-y divide-slate-100">
              <InfoRow
                icon={<User size={14} />}
                label="Pelanggan"
                value={
                  order.customer
                    ? `${order.customer.name ?? 'Tanpa Nama'} ${order.customer.phone_number ? `(${order.customer.phone_number})` : ''}`
                    : 'Pelanggan Anonim'
                }
              />
              <InfoRow
                icon={<CreditCard size={14} />}
                label="Metode Bayar"
                value={order.method ? order.method.toUpperCase() : '—'}
              />
              <InfoRow
                icon={<Clock size={14} />}
                label="Dibuat"
                value={formatDateTime(order.created_at)}
              />
              {order.whatsapp_message_id && (
                <InfoRow
                  icon={<MessageSquareText size={14} />}
                  label="WA Message ID"
                  value={
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                      {order.whatsapp_message_id}
                    </code>
                  }
                />
              )}
              {order.notes && (
                <InfoRow
                  icon={<StickyNote size={14} />}
                  label="Catatan"
                  value={order.notes}
                />
              )}
            </div>
          </section>

          {/* Rincian Harga */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Rincian Pembayaran
            </h3>
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 border-b border-slate-100">
                <span className="text-sm text-slate-500">Subtotal</span>
                <span className="text-sm text-slate-700">{formatRupiah(order.subtotal_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between px-4 py-2.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Diskon</span>
                  <span className="text-sm text-red-500">
                    − {formatRupiah(order.discount_amount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between px-4 py-3 bg-slate-50">
                <span className="text-sm font-semibold text-slate-800">Total</span>
                <span className="text-base font-bold text-slate-900">
                  {formatRupiah(order.total_amount)}
                </span>
              </div>
            </div>
          </section>

          {/* Custom Data — Dynamic, no hardcode */}
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <PackageCheck size={12} />
              Data Pesanan (dari WA)
            </h3>
            <CustomDataSection data={order.custom_data} />
          </section>

          {/* Form Pengikatan Produk */}
          <section className="pt-4 border-t border-slate-100">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Link2 size={12} />
              Pengikatan Tagihan & Catatan
            </h3>
            
            <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Produk..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_PRODUCTS.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id}>
                          {prod.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input 
                  type="number" 
                  className="w-20" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} 
                  min={1} 
                />
                <Button type="button" variant="secondary" onClick={handleAddItem}>
                  <Plus size={16} />
                </Button>
              </div>

              {linkedItems.length > 0 && (
                <ul className="divide-y divide-slate-100 rounded-md border border-slate-100 bg-slate-50">
                  {linkedItems.map((item) => (
                    <li key={item.product_id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span>
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <span className="ml-2 font-mono text-slate-500">x{item.quantity}</span>
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveItem(item.product_id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Catatan Tambahan
                </label>
                <textarea
                  className="w-full rounded-md border border-slate-200 p-2.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  rows={3}
                  placeholder="Tulis catatan opsional (misal: pedas, tanpa micin)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button 
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" 
                onClick={handleSubmitLink}
                disabled={isSubmitting || linkedItems.length === 0}
              >
                <Save size={16} />
                {isSubmitting ? 'Memproses...' : 'Simpan & Proses Pesanan'}
              </Button>
            </div>
          </section>

          {/* Selesaikan Pesanan */}
          {(order.status === 'processing' || order.status === 'draft') && (
            <section className="pt-4 mt-4 border-t border-slate-100">
              <Button 
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base"
                onClick={() => setIsCheckoutModalOpen(true)}
              >
                <PackageCheck size={20} />
                Selesaikan & Bayar Pesanan
              </Button>
            </section>
          )}

        </div>
      </DialogContent>

      <CheckoutModal
        open={isCheckoutModalOpen}
        onOpenChange={setIsCheckoutModalOpen}
        orderId={order.id}
        subtotal={order.subtotal_amount}
        onSuccess={handlePaymentSuccess}
      />
    </Dialog>
  );
}
