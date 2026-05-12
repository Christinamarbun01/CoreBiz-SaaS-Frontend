import { useEffect, useState, useCallback } from 'react';
import { API_URL } from '@/config';
import { Search, Eye, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CustomerDetailModal } from '@/components/CustomerDetailModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Customer {
  id: string;
  name: string;
  phone_number: string;
  total_orders: number;
}

const HARDCODED_TOKEN = 'HARDCODED_STATIC_TOKEN_FOR_TESTING';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search effect
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {

      const url = new URL(`${API_URL}/customers`);
      if (debouncedSearch) {
        url.searchParams.append('search', debouncedSearch);
      }

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${HARDCODED_TOKEN}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.data || []);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus pelanggan ${name}?`)) return;

    try {

      const res = await fetch(`${API_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${HARDCODED_TOKEN}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert('Berhasil menghapus pelanggan');
        fetchCustomers(); // Refresh list
      } else {
        alert(data.error || 'Gagal menghapus pelanggan');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus');
    }
  };

  const openDetail = (id: string) => {
    setSelectedCustomerId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Direktori Pelanggan (CRM)</h1>
            <p className="text-xs text-slate-500">Kelola profil dan riwayat pesanan pelanggan</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari nama atau nomor WA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            {loading && <span className="text-xs text-slate-400">Memuat...</span>}
          </div>

          {/* Table */}
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[300px] font-semibold text-slate-600">Nama Pelanggan</TableHead>
                  <TableHead className="font-semibold text-slate-600">Nomor WA</TableHead>
                  <TableHead className="text-center font-semibold text-slate-600">Total Transaksi</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                      Tidak ada data pelanggan ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((cust) => (
                    <TableRow key={cust.id} className="group transition-colors">
                      <TableCell className="font-medium text-slate-900">{cust.name}</TableCell>
                      <TableCell className="text-slate-600">{cust.phone_number || '—'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">{cust.total_orders}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                            onClick={() => openDetail(cust.id)}
                          >
                            <Eye size={14} className="mr-1.5" />
                            Detail
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleDelete(cust.id, cust.name)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Modal Detail Customer */}
      <CustomerDetailModal
        customerId={selectedCustomerId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        token={HARDCODED_TOKEN}
      />
    </div>
  );
}
