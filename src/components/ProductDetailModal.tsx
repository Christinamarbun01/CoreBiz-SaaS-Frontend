import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Package, FlaskConical, Loader2, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ──────────────────────────────────────────────────────────────────

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
}

interface RecipeIngredient {
  id: string;
  quantity_required: number;
  created_at: string;
  ingredient_id: string;
  ingredients: {
    id: string;
    name: string;
    sku: string | null;
    current_stock: number;
    is_stock_tracked: boolean;
    type: string;
  };
}

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  token: string;
}

// ─── Toast helper ───────────────────────────────────────────────────────────

function showToast(message: string, type: 'success' | 'error' = 'success') {
  const t = document.createElement('div');
  t.className = `fixed bottom-5 right-5 z-[9999] flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-medium shadow-xl ${
    type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
  }`;
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.4s';
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ProductDetailModal({ open, onOpenChange, product, token }: ProductDetailModalProps) {
  // Recipe state
  const [recipes, setRecipes] = useState<RecipeIngredient[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  // Add-ingredient form
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<Product | null>(null);
  const [qtyRequired, setQtyRequired] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setRecipes([]);
      setSelectedIngredient(null);
      setQtyRequired('');
      setIngredientSearch('');
      setIsDropdownOpen(false);
    }
  }, [open]);

  // Fetch recipes when product changes
  useEffect(() => {
    if (open && product) {
      fetchRecipes();
      fetchAllProducts();
    }
  }, [open, product?.id]);

  const fetchRecipes = async () => {
    if (!product) return;
    setLoadingRecipes(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/products/${product.id}/recipes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRecipes(data.data || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAllProducts(data.data || []);
    } catch (err) {
      console.error('Error fetching products for ingredient list:', err);
    }
  };

  // Filter: only tracked, not self, not already in recipe
  const availableIngredients = allProducts.filter((p) => {
    if (!product) return false;
    if (p.id === product.id) return false; // no self-reference
    if (!p.is_stock_tracked) return false; // must be physical
    if (recipes.some((r) => r.ingredient_id === p.id)) return false; // already in recipe
    const lowerSearch = ingredientSearch.toLowerCase();
    if (lowerSearch && !p.name.toLowerCase().includes(lowerSearch) && !(p.sku && p.sku.toLowerCase().includes(lowerSearch))) return false;
    return true;
  });

  const handleAddRecipe = async () => {
    if (!product || !selectedIngredient) return;
    const qty = parseFloat(qtyRequired);
    if (isNaN(qty) || qty <= 0) {
      showToast('Kuantitas harus lebih dari 0', 'error');
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/products/${product.id}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredient_id: selectedIngredient.id,
          quantity_required: qty,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✅ ${data.message}`);
        setSelectedIngredient(null);
        setQtyRequired('');
        setIngredientSearch('');
        fetchRecipes();
      } else {
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch {
      showToast('Gagal menambahkan bahan baku', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: string, ingredientName: string) => {
    if (!product) return;
    if (!confirm(`Hapus "${ingredientName}" dari resep?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/products/${product.id}/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('✅ Bahan baku dihapus dari resep');
        fetchRecipes();
      } else {
        const data = await res.json();
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch {
      showToast('Gagal menghapus bahan baku', 'error');
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Package size={18} />
            </div>
            <div>
              <span className="block">{product.name}</span>
              {product.sku && (
                <span className="block text-xs font-normal text-slate-400 font-mono">{product.sku}</span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1 gap-1.5">
              <Package size={14} />
              Info Umum
            </TabsTrigger>
            <TabsTrigger value="bom" className="flex-1 gap-1.5">
              <FlaskConical size={14} />
              Resep & Bahan
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════
              TAB 1: Info Umum
          ═══════════════════════════════════════════════════ */}
          <TabsContent value="info">
            <div className="space-y-4">
              {/* Type Badge */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`capitalize ${product.type === 'sellable' ? 'text-blue-600 bg-blue-50 border-blue-200' : product.type === 'component' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-purple-600 bg-purple-50 border-purple-200'}`}>
                  {product.type}
                </Badge>
                {product.is_stock_tracked ? (
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">Stok Dilacak</Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-400 bg-slate-50 border-slate-200">Jasa / Digital</Badge>
                )}
              </div>

              {/* Price Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Harga Jual</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{formatRupiah(product.price)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Harga Modal (HPP)</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{formatRupiah(product.cost)}</p>
                </div>
              </div>

              {/* Margin */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Margin per Unit</p>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">
                  {formatRupiah(product.price - product.cost)}
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    ({product.price > 0 ? ((product.price - product.cost) / product.price * 100).toFixed(1) : 0}%)
                  </span>
                </p>
              </div>

              {/* Stock Info */}
              {product.is_stock_tracked && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Stok Saat Ini</p>
                    <p className={`text-lg font-bold font-mono mt-0.5 ${product.current_stock <= product.min_stock_alert ? 'text-red-600' : 'text-emerald-600'}`}>
                      {product.current_stock}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Batas Alert Min.</p>
                    <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">{product.min_stock_alert}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════
              TAB 2: Resep & Bahan (BOM)
          ═══════════════════════════════════════════════════ */}
          <TabsContent value="bom">
            <div className="space-y-4">
              {/* Recipe List */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Daftar Bahan Baku ({recipes.length})
                </h3>

                {loadingRecipes ? (
                  <div className="flex items-center justify-center py-8 text-slate-400">
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Memuat resep...
                  </div>
                ) : recipes.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-slate-200 py-8 text-center">
                    <FlaskConical size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">Belum ada bahan baku yang ditambahkan.</p>
                    <p className="text-xs text-slate-300 mt-1">Gunakan form di bawah untuk menyusun resep.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
                    {recipes.map((recipe) => (
                      <div key={recipe.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-600 text-xs font-bold shrink-0">
                            {recipe.ingredients?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {recipe.ingredients?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {recipe.ingredients?.sku ? `SKU: ${recipe.ingredients.sku}` : 'No SKU'}
                              <span className="mx-1">·</span>
                              Stok: <span className="font-mono">{recipe.ingredients?.current_stock ?? '—'}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-xs shrink-0">
                            ×{recipe.quantity_required}
                          </Badge>
                          <button
                            onClick={() => handleDeleteRecipe(recipe.id, recipe.ingredients?.name || 'Unknown')}
                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Hapus dari resep"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Ingredient Form */}
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Tambah Bahan Baku ke Resep
                </h4>

                {/* Searchable Combobox */}
                <div className="relative">
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Pilih Bahan Baku</label>
                  <div
                    className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm cursor-pointer hover:border-slate-300 transition-colors"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {selectedIngredient ? (
                      <span className="font-medium text-slate-800">{selectedIngredient.name}</span>
                    ) : (
                      <span className="text-slate-400">Klik untuk mencari bahan baku...</span>
                    )}
                    <Search size={14} className="text-slate-400" />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-xl">
                      <div className="border-b border-slate-100 p-2">
                        <input
                          type="text"
                          className="w-full text-sm outline-none placeholder-slate-400 px-1"
                          placeholder="Ketik nama / SKU bahan..."
                          value={ingredientSearch}
                          onChange={(e) => setIngredientSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto p-1">
                        {availableIngredients.length === 0 ? (
                          <div className="p-3 text-xs text-center text-slate-400">
                            {ingredientSearch
                              ? 'Tidak ditemukan bahan baku yang cocok.'
                              : 'Tidak ada bahan baku tersedia.'}
                          </div>
                        ) : (
                          availableIngredients.slice(0, 20).map((p) => (
                            <button
                              key={p.id}
                              className="w-full text-left px-2 py-2 text-sm rounded hover:bg-slate-50 flex items-center justify-between transition-colors"
                              onClick={() => {
                                setSelectedIngredient(p);
                                setIsDropdownOpen(false);
                                setIngredientSearch('');
                              }}
                            >
                              <span className="font-medium text-slate-800">{p.name}</span>
                              <span className="text-xs text-slate-400 font-mono">{p.sku || '—'}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Jumlah Diperlukan (per produk jadi)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder="contoh: 0.5 atau 2"
                    value={qtyRequired}
                    onChange={(e) => setQtyRequired(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mendukung desimal — misal: 0.5 meter kain, 1.25 kg tepung, 2 lembar kertas.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleAddRecipe}
                  disabled={!selectedIngredient || !qtyRequired || isAdding}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isAdding ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Menambahkan...
                    </>
                  ) : (
                    <>
                      <Plus size={14} className="mr-2" />
                      Tambah ke Resep
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
