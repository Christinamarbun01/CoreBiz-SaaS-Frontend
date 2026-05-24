import { useState, useEffect } from 'react';
import { Search, Users, Plus, Edit2, Trash2 } from 'lucide-react';
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
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { UserFormModal } from '@/components/UserFormModal';
import { type User } from '@/schemas/user.schema';
import { Badge } from '@/components/ui/badge';

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: users = [], isLoading, isError } = useUsers(debouncedSearch);
  const deleteMutation = useDeleteUser();

  const handleCreate = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus pengguna ${name}? Tindakan ini akan menghapus aksesnya juga.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Manajemen Pengguna</h1>
            <p className="text-xs text-slate-500">Kelola daftar staff dan manager di sistem</p>
          </div>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          <Plus size={16} className="mr-2" /> Tambah Pengguna
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
                placeholder="Cari nama atau email..."
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
                  <TableHead className="font-semibold text-slate-600">Pengguna</TableHead>
                  <TableHead className="font-semibold text-slate-600">Kontak</TableHead>
                  <TableHead className="font-semibold text-slate-600">Peran & Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isError ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-red-500">
                      Gagal memuat data. Pastikan backend sudah menyala dan endpoint /api/v1/users tersedia.
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                      Tidak ada data pengguna ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="group transition-colors">
                      <TableCell>
                        <div className="font-medium text-slate-900">{user.full_name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-slate-700">{user.phone || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant={user.role === 'manager' ? 'default' : 'secondary'} className={user.role === 'manager' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-100'}>
                            {user.role === 'manager' ? 'Manager' : 'Staff'}
                          </Badge>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit2 size={14} className="mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleDelete(user.id!, user.full_name)}
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

      <UserFormModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        userToEdit={userToEdit} 
      />
    </div>
  );
}
