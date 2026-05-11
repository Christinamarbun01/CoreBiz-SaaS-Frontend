// ─── Mock Products ───────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji: string; // Visual cue tanpa perlu gambar
}

export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-001', name: 'Nasi Goreng Spesial', price: 28000, category: 'Makanan', emoji: '🍳' },
  { id: 'prod-002', name: 'Ayam Bakar Madu', price: 35000, category: 'Makanan', emoji: '🍗' },
  { id: 'prod-003', name: 'Mie Goreng Jawa', price: 25000, category: 'Makanan', emoji: '🍜' },
  { id: 'prod-004', name: 'Sate Ayam (10 tusuk)', price: 30000, category: 'Makanan', emoji: '🍢' },
  { id: 'prod-005', name: 'Gado-Gado Komplit', price: 22000, category: 'Makanan', emoji: '🥗' },
  { id: 'prod-006', name: 'Bakso Jumbo', price: 20000, category: 'Makanan', emoji: '🍲' },
  { id: 'prod-007', name: 'Es Teh Manis', price: 5000, category: 'Minuman', emoji: '🧋' },
  { id: 'prod-008', name: 'Jus Alpukat', price: 15000, category: 'Minuman', emoji: '🥑' },
  { id: 'prod-009', name: 'Kopi Susu Gula Aren', price: 18000, category: 'Minuman', emoji: '☕' },
  { id: 'prod-010', name: 'Air Mineral Botol', price: 5000, category: 'Minuman', emoji: '💧' },
  { id: 'prod-011', name: 'Kerupuk Udang', price: 5000, category: 'Tambahan', emoji: '🦐' },
  { id: 'prod-012', name: 'Telur Ceplok', price: 8000, category: 'Tambahan', emoji: '🍳' },
];

// ─── Mock Customers ──────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-001', name: 'Budi Santoso', phone: '08123456789' },
  { id: 'cust-002', name: 'Siti Rahayu', phone: '08234567890' },
  { id: 'cust-003', name: 'Andi Wijaya', phone: '08345678901' },
  { id: 'cust-004', name: 'Dewi Lestari', phone: '08456789012' },
  { id: 'cust-005', name: 'Rudi Hermawan', phone: '08567890123' },
];
