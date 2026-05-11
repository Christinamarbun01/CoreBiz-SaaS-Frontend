import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, User, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { MOCK_PRODUCTS } from '@/data/posMockData';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { CheckoutModal } from '@/components/CheckoutModal';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Sub-components ───────────────────────────────────────────────────────────



// ─── Main Page ────────────────────────────────────────────────────────────────

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  
  // Custom Combobox State
  const [customers, setCustomers] = useState<{id: string, name: string, phone_number: string}[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('');

  const {
    items,
    customerId,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    setCustomerId,
    clearCart,
    totalAmount,
    totalItems,
  } = useCartStore();

  // Debounce customer search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedCustomerSearch(customerSearch), 400);
    return () => clearTimeout(handler);
  }, [customerSearch]);

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const url = new URL(`${API_URL}/api/v1/customers`);
        if (debouncedCustomerSearch) {
          url.searchParams.append('search', debouncedCustomerSearch);
        }
        const res = await fetch(url.toString(), {
          headers: { Authorization: 'Bearer HARDCODED_STATIC_TOKEN_FOR_TESTING' }
        });
        const data = await res.json();
        if (res.ok) setCustomers(data.data || []);
      } catch (err) {}
    };
    fetchCustomers();
  }, [debouncedCustomerSearch]);

  const categories = [...new Set(MOCK_PRODUCTS.map((p) => p.category))];
  const filteredProducts = MOCK_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Handle Bayar ──
  async function handleCheckout() {
    if (items.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }

    setIsCreatingDraft(true);
    const payload = {
      source: 'pos' as const,
      status: 'draft',
      payment_status: 'unpaid' as const,
      method: 'cash', // Default placeholder
      customer_id: customerId ?? undefined,
      notes: undefined,
      items: items.map((i: any) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
    };

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = 'HARDCODED_STATIC_TOKEN_FOR_TESTING';

      // 1. Create order
      const createRes = await fetch(`${API_URL}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.error || 'Gagal membuat pesanan');
      }

      const orderId = createData.data.id;
      setCurrentOrderId(orderId);
      setIsCheckoutModalOpen(true);
      
    } catch (err: any) {
      alert(`Gagal Checkout: ${err.message}`);
    } finally {
      setIsCreatingDraft(false);
    }
  }

  function handlePaymentSuccess() {
    clearCart();
    const msg = document.createElement('div');
    msg.className = 'fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] transition-opacity';
    msg.textContent = '✅ Pembayaran berhasil! Stok telah otomatis dipotong.';
    document.body.appendChild(msg);
    setTimeout(() => {
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 500);
    }, 3000);
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">

      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white">
            <CreditCard size={16} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800">POS Kasir</h1>
            <p className="text-xs text-slate-500">CoreBiz SaaS</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ShoppingCart size={16} />
          <span className="font-medium text-slate-700">
            {totalItems()} item di keranjang
          </span>
        </div>
      </header>

      {/* ── Split Screen ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════════════════════════════════════════════════════
            LEFT PANEL — Daftar Produk (70%)
        ════════════════════════════════════════════════════ */}
        <main className="flex w-[70%] flex-col overflow-hidden border-r border-slate-200 bg-white">
          {/* Search */}
          <div className="border-b border-slate-100 px-6 py-4">
            <input
              type="search"
              placeholder="🔍  Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {categories.map((category) => {
              const products = filteredProducts.filter((p) => p.category === category);
              if (products.length === 0) return null;

              return (
                <div key={category} className="mb-6">
                  <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <Package size={12} />
                    {category}
                  </h2>
                  <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
                    {products.map((product: any) => {
                      const cartItem = items.find((i: any) => i.product.id === product.id);
                      const inCart = !!cartItem;

                      return (
                        <button
                          key={product.id}
                          onClick={() => addItem(product)}
                          className={cn(
                            'group relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all hover:shadow-md active:scale-[0.98]',
                            inCart
                              ? 'border-slate-700 bg-slate-50 shadow-sm'
                              : 'border-slate-100 bg-white hover:border-slate-300',
                          )}
                        >
                          {/* Qty badge */}
                          {inCart && (
                            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                              {cartItem.quantity}
                            </span>
                          )}
                          <span className="mb-2 text-2xl">{product.emoji}</span>
                          <p className="text-sm font-medium leading-tight text-slate-800">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {formatRupiah(product.price)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Package size={40} className="mb-3 opacity-30" />
                <p className="text-sm">Produk tidak ditemukan</p>
              </div>
            )}
          </div>
        </main>

        {/* ════════════════════════════════════════════════════
            RIGHT PANEL — Keranjang (30%)
        ════════════════════════════════════════════════════ */}
        <aside className="flex w-[30%] flex-col bg-slate-50">

          {/* Cart Header */}
          <div className="border-b border-slate-200 bg-white px-5 py-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                <ShoppingCart size={16} />
                Keranjang
              </h2>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Kosongkan
                </button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                <ShoppingCart size={40} className="mb-3" />
                <p className="text-sm">Keranjang kosong</p>
                <p className="mt-1 text-xs">Klik produk untuk menambahkan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item: any) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <span className="text-xl">{item.product.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatRupiah(item.product.price)} × {item.quantity}
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        = {formatRupiah(item.product.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => increaseQty(item.product.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      >
                        <Plus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => decreaseQty(item.product.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      >
                        <Minus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="ml-1 text-slate-300 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="border-t border-slate-200 bg-white px-5 py-4 space-y-4">

            {/* Customer Selector (Searchable Combobox) */}
            <div className="relative">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <User size={12} />
                Pelanggan (opsional)
              </label>
              
              <div 
                className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm cursor-pointer hover:border-slate-300 transition-colors"
                onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
              >
                {customerId 
                  ? customers.find(c => c.id === customerId)?.name || 'Pelanggan Terpilih'
                  : <span className="text-slate-400">— Pelanggan Anonim / Tamu —</span>}
              </div>

              {isCustomerDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white p-1.5 shadow-xl bottom-full mb-1">
                  <input
                    type="text"
                    className="w-full border-b border-slate-100 p-2 text-sm outline-none mb-1 focus:border-blue-400 transition-colors"
                    placeholder="Ketik nama atau no WA..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto">
                    <button
                      className="w-full text-left px-2 py-2 text-sm hover:bg-slate-50 text-slate-500 rounded font-medium transition-colors mb-1"
                      onClick={() => {
                        setCustomerId(null);
                        setIsCustomerDropdownOpen(false);
                        setCustomerSearch('');
                      }}
                    >
                      — Pelanggan Anonim / Tamu —
                    </button>
                    {customers.map(c => (
                      <button
                        key={c.id}
                        className="w-full text-left px-2 py-2 text-sm hover:bg-slate-50 text-slate-800 rounded flex justify-between items-center transition-colors"
                        onClick={() => {
                          setCustomerId(c.id);
                          setIsCustomerDropdownOpen(false);
                          setCustomerSearch('');
                        }}
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{c.phone_number || '—'}</span>
                      </button>
                    ))}
                    {customers.length === 0 && customerSearch && (
                      <div className="p-3 text-xs text-center text-slate-400">Pelanggan tidak ditemukan. <br/>Ketik nama/WA lain.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider + Total */}
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Subtotal ({totalItems()} item)</span>
                <span>{formatRupiah(totalAmount())}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Total</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatRupiah(totalAmount())}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={items.length === 0 || isCreatingDraft}
              className="h-12 w-full bg-slate-800 text-base font-semibold tracking-wide hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CreditCard size={18} className="mr-2" />
              {isCreatingDraft ? 'Memproses...' : 'Bayar Sekarang'}
            </Button>
          </div>
        </aside>
      </div>

      <CheckoutModal
        open={isCheckoutModalOpen}
        onOpenChange={setIsCheckoutModalOpen}
        orderId={currentOrderId}
        subtotal={totalAmount()}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
