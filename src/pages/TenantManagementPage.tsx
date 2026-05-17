import { useState, useEffect } from 'react';
import { Search, Building, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTenants, useDeleteTenant } from '@/hooks/useTenants';
import { TenantFormModal } from '@/components/TenantFormModal';
import { type Tenant } from '@/schemas/tenant.schema';

export default function TenantManagementPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: tenants = [], isLoading, isError } = useTenants(debouncedSearch);
  const deleteMutation = useDeleteTenant();

  const handleCreate = () => {
    setTenantToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setTenantToEdit(tenant);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus tenant ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
            <Building size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Manajemen Tenant</h1>
            <p className="text-xs text-slate-500">Kelola daftar perusahaan, owner, dan manajer</p>
          </div>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          <Plus size={16} className="mr-2" /> Tambah Tenant
        </Button>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-white">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari nama perusahaan atau owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            {isLoading && <span className="text-xs text-slate-400 animate-pulse">Memuat data...</span>}
          </div>

          {/* Table */}
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-600">Perusahaan</TableHead>
                  <TableHead className="font-semibold text-slate-600">Owner</TableHead>
                  <TableHead className="font-semibold text-slate-600">Manager</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isError ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-red-500">
                      Gagal memuat data. Pastikan backend sudah menyala dan endpoint /api/v1/tenants tersedia.
                    </TableCell>
                  </TableRow>
                ) : tenants.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                      Tidak ada data tenant ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id} className="group transition-colors">
                      <TableCell>
                        <div className="font-medium text-slate-900">{tenant.company_name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-xs" title={tenant.company_address}>
                          {tenant.company_address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-slate-700">{tenant.owner_name}</div>
                        <div className="text-xs text-slate-500">{tenant.owner_phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-slate-700">{tenant.manager_name}</div>
                        <div className="text-xs text-slate-500">{tenant.manager_phone}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                            onClick={() => handleEdit(tenant)}
                          >
                            <Edit2 size={14} className="mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleDelete(tenant.id!, tenant.company_name)}
                            disabled={deleteMutation.isPending}
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

      <TenantFormModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        tenantToEdit={tenantToEdit} 
      />
    </div>
  );
}
