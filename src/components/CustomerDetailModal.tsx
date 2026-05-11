import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface OrderHistory {
  id: string;
  created_at: string;
  source: string;
  status: string;
  total_amount: number;
}

interface CustomerDetail {
  id: string;
  name: string;
  phone_number: string;
  total_orders: number;
  profile_metadata: Record<string, any>;
  orders?: OrderHistory[];
}

interface CustomerDetailModalProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
}

export function CustomerDetailModal({ customerId, open, onOpenChange, token }: CustomerDetailModalProps) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && customerId) {
      fetchCustomerDetail();
    } else {
      setCustomer(null);
    }
  }, [open, customerId]);

  const fetchCustomerDetail = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/v1/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCustomer(data.data);
      } else {
        alert(data.error || 'Gagal mengambil detail pelanggan');
      }
    } catch (err: any) {
      alert('Error fetching customer detail');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pelanggan</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">Memuat profil...</div>
        ) : customer ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="h-14 w-14 rounded-full bg-slate-800 text-white flex items-center justify-center text-2xl font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{customer.name}</h2>
                <p className="text-sm text-slate-500">{customer.phone_number || 'Tidak ada nomor WA'}</p>
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    {customer.total_orders} Total Transaksi
                  </Badge>
                </div>
              </div>
            </div>

            {/* Dynamic Metadata Section */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Informasi Profil</h3>
              {customer.profile_metadata && Object.keys(customer.profile_metadata).length > 0 ? (
                <dl className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 p-4 bg-slate-50">
                  {Object.entries(customer.profile_metadata).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-xs font-semibold uppercase text-slate-400">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="text-sm font-medium text-slate-800 mt-0.5 break-words">
                        {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '—')}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm italic text-slate-400">Tidak ada metadata tambahan.</p>
              )}
            </div>

            {/* Order History */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Riwayat Pesanan</h3>
              {customer.orders && customer.orders.length > 0 ? (
                <div className="rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {customer.orders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 hover:bg-slate-50">
                      <div>
                        <p className="text-xs font-mono text-slate-400">{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm font-medium text-slate-800">
                          {new Date(order.created_at).toLocaleString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="capitalize">{order.source}</Badge>
                        <Badge className="capitalize bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
                          {order.status}
                        </Badge>
                        <span className="font-semibold text-sm text-slate-900 ml-2 w-24 text-right">
                          {formatRupiah(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-slate-400">Belum ada riwayat pesanan.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-slate-500">Pelanggan tidak ditemukan.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
