import { useEffect, useState, useMemo } from 'react';
import { API_URL } from '@/config';
import { PackageSearch, Plus, Search, Edit, Trash2, MoreVertical, PackagePlus, ClipboardList, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProductFormModal } from '@/components/ProductFormModal';
import { StockAdjustModal, type AdjustMode } from '@/components/StockAdjustModal';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { toast, Toaster } from 'sonner';

const HARDCODED_TOKEN = 'HARDCODED_STATIC_TOKEN_FOR_TESTING';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  cost: number;
  type: string;
  is_stock_tracked: boolean;
  current_stock: number;
  min_stock_alert: number;
  categories?: { id: string; name: string };
}

// Custom Hook to manage URL search params without react-router-dom
function useUrlParams() {
  const [params, setParams] = useState(() => new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => setParams(new URLSearchParams(window.location.search));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateParams = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    
    const searchString = current.toString();
    const newUrl = `${window.location.pathname}${searchString ? '?' + searchString : ''}`;
    
    // Only push state if URL actually changed to prevent history bloat
    if (window.location.search !== `?${searchString}`) {
      window.history.pushState({}, '', newUrl);
      setParams(current);
    }
  };

  return [params, updateParams] as const;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  // URL Params Hook
  const [params, updateParams] = useUrlParams();
  
  // Read params
  const currentPage = parseInt(params.get('page') || '1', 10);
  const searchParam = params.get('search') || '';

  // Local state for immediate input feedback
  const [searchInput, setSearchInput] = useState(searchParam);

  // Product Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Stock Adjust Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustMode, setAdjustMode] = useState<AdjustMode>('restock');
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  // Product Detail Modal State (Tabs: Info + BOM)
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const openAdjustModal = (prod: Product, mode: AdjustMode) => {
    setAdjustingProduct(prod);
    setAdjustMode(mode);
    setAdjustModalOpen(true);
  };

  const openDetailModal = (prod: Product) => {
    setDetailProduct(prod);
    setDetailModalOpen(true);
  };

  // Debounce search to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      updateParams({ search: searchInput, page: '1' }); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Sync back from URL to input if URL changes (e.g. Back button)
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  const fetchProducts = async () => {
    setLoading(true);
    try {

      const res = await fetch(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${HARDCODED_TOKEN}` },
      });
      const data = await res.json();
      if (res.ok) setProducts(data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Low Stock Alert (Sonner)
  useEffect(() => {
    if (products.length === 0) return;
    
    const lowStockItems = products.filter(p => p.is_stock_tracked && p.current_stock <= p.min_stock_alert);
    
    if (lowStockItems.length > 0) {
      toast.warning(`Peringatan: ${lowStockItems.length} barang butuh restock hari ini.`, {
        id: 'global-low-stock-alert',
        duration: 5000,
      });
    }
  }, [products]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus produk "${name}"? Data tidak akan benar-benar terhapus (Soft Delete).`)) return;

    try {

      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${HARDCODED_TOKEN}` },
      });
      if (res.ok) {
        alert('✅ Produk berhasil dihapus');
        fetchProducts();
      } else {
        const data = await res.json();
        alert(`Gagal menghapus: ${data.error}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus');
    }
  };

  // Format Helper
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Client-side Filtering & Pagination logic
  const itemsPerPage = 10;
  
  const filteredProducts = useMemo(() => {
    if (!searchParam) return products;
    const lowerSearch = searchParam.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerSearch) || 
      (p.sku && p.sku.toLowerCase().includes(lowerSearch))
    );
  }, [products, searchParam]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  
  const paginatedProducts = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, validPage]);

  // Handle Page Change
  const goToPage = (p: number) => {
    updateParams({ page: p.toString() });
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <Toaster richColors position="top-right" />
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
            <PackageSearch size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Katalog Produk (Inventory)</h1>
            <p className="text-xs text-slate-500">Kelola master data produk, jasa, dan bahan baku</p>
          </div>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} className="mr-2" />
          Tambah Produk
        </Button>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-full max-h-[calc(100vh-120px)]">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 shrink-0">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari nama atau SKU..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            {loading && <span className="text-xs text-slate-400 animate-pulse">Memuat data...</span>}
          </div>

          {/* Table Container */}
          <div className="w-full overflow-auto flex-1">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[120px] font-semibold text-slate-600">SKU</TableHead>
                  <TableHead className="font-semibold text-slate-600">Nama Produk</TableHead>
                  <TableHead className="font-semibold text-slate-600">Tipe</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Harga Jual</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Harga Modal (HPP)</TableHead>
                  <TableHead className="text-center font-semibold text-slate-600">Stok Fisik</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <PackageSearch size={40} className="text-slate-300 mb-3" />
                        <p>Tidak ada data produk ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((prod) => (
                    <TableRow key={prod.id} className="group transition-colors hover:bg-slate-50/50">
                      <TableCell className="font-mono text-xs text-slate-500">
                        {prod.sku || <span className="text-slate-300 italic">Kosong</span>}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{prod.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${prod.type === 'sellable' ? 'text-blue-600 bg-blue-50 border-blue-200' : prod.type === 'component' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-purple-600 bg-purple-50 border-purple-200'}`}>
                          {prod.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-800">
                        {formatRupiah(prod.price)}
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        {formatRupiah(prod.cost)}
                      </TableCell>
                      <TableCell className="text-center">
                        {prod.is_stock_tracked ? (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className={`font-mono font-bold ${prod.current_stock <= prod.min_stock_alert ? 'text-red-500' : 'text-emerald-600'}`}>
                              {prod.current_stock}
                            </span>
                            {prod.current_stock <= prod.min_stock_alert && (
                              <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-500 border-red-200 px-1.5 py-0">
                                <AlertTriangle size={10} />
                                <span className="text-[9px] uppercase tracking-wider font-bold">Stok Tipis</span>
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 data-[state=open]:opacity-100"
                            >
                              <MoreVertical size={15} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => openDetailModal(prod)}
                              >
                                <Eye size={14} className="text-slate-500" />
                                Lihat Detail / Resep
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Edit size={14} className="text-slate-500" />
                                Edit Produk
                              </DropdownMenuItem>
                            </DropdownMenuGroup>

                            {/* Inventory actions — only if tracked */}
                            {prod.is_stock_tracked && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-emerald-600">Kelola Stok</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                  <DropdownMenuItem
                                    className="gap-2 text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800"
                                    onClick={() => openAdjustModal(prod, 'restock')}
                                  >
                                    <PackagePlus size={14} />
                                    Tambah Stok
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2 text-amber-700 focus:bg-amber-50 focus:text-amber-800"
                                    onClick={() => openAdjustModal(prod, 'opname')}
                                  >
                                    <ClipboardList size={14} />
                                    Koreksi Fisik (Opname)
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
                              onClick={() => handleDelete(prod.id, prod.name)}
                            >
                              <Trash2 size={14} />
                              Hapus Produk
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {filteredProducts.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 shrink-0">
              <span className="text-sm text-slate-500">
                Menampilkan <span className="font-medium text-slate-900">{(validPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium text-slate-900">{Math.min(validPage * itemsPerPage, filteredProducts.length)}</span> dari <span className="font-medium text-slate-900">{filteredProducts.length}</span> produk
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => goToPage(validPage - 1)}
                  disabled={validPage === 1}
                >
                  Sebelumnya
                </Button>
                <div className="text-sm font-medium text-slate-700 px-2">
                  {validPage} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => goToPage(validPage + 1)}
                  disabled={validPage === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Form Product */}
      <ProductFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={editingProduct}
        onSuccess={fetchProducts}
        token={HARDCODED_TOKEN}
      />

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        open={adjustModalOpen}
        onOpenChange={setAdjustModalOpen}
        mode={adjustMode}
        product={adjustingProduct}
        onSuccess={fetchProducts}
        token={HARDCODED_TOKEN}
      />

      {/* Product Detail Modal (Tabs: Info + BOM) */}
      <ProductDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        product={detailProduct}
        token={HARDCODED_TOKEN}
      />
    </div>
  );
}
