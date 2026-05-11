import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').max(150, 'Nama maksimal 150 karakter'),
  sku: z.string().max(50, 'SKU maksimal 50 karakter').optional().nullable(),
  price: z.coerce.number().int({ message: 'Harus berupa angka bulat' }).min(0, 'Harga minimal 0'),
  cost: z.coerce.number().int({ message: 'Harus berupa angka bulat' }).min(0, 'HPP minimal 0'),
  type: z.enum(['sellable', 'component', 'both']),
  is_stock_tracked: z.boolean(),
  current_stock: z.coerce.number().int().optional(),
  min_stock_alert: z.coerce.number().int().optional(),
}).superRefine((data, ctx) => {
  if (data.is_stock_tracked) {
    if (data.current_stock === undefined || Number.isNaN(data.current_stock) || data.current_stock < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stok saat ini wajib diisi minimal 0",
        path: ["current_stock"]
      });
    }
    if (data.min_stock_alert === undefined || Number.isNaN(data.min_stock_alert) || data.min_stock_alert < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Batas alert stok wajib diisi minimal 0",
        path: ["min_stock_alert"]
      });
    }
  }
});

type ProductFormValues = z.infer<typeof productSchema>;

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

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
  token: string;
}

export function ProductFormModal({ open, onOpenChange, product, onSuccess, token }: ProductFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      cost: 0,
      type: 'sellable',
      is_stock_tracked: false,
      current_stock: 0,
      min_stock_alert: 0,
    }
  });

  const isStockTracked = watch('is_stock_tracked');

  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          name: product.name,
          sku: product.sku || '',
          price: product.price,
          cost: product.cost,
          type: product.type as 'sellable' | 'component' | 'both',
          is_stock_tracked: product.is_stock_tracked,
          current_stock: product.current_stock,
          min_stock_alert: product.min_stock_alert,
        });
      } else {
        reset({
          name: '',
          sku: '',
          price: 0,
          cost: 0,
          type: 'sellable',
          is_stock_tracked: false,
          current_stock: 0,
          min_stock_alert: 0,
        });
      }
    }
  }, [open, product, reset]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const endpoint = product ? `/api/v1/products/${product.id}` : '/api/v1/products';
      const method = product ? 'PUT' : 'POST';

      // Transform empty strings to null for optional fields
      const payload = {
        ...data,
        sku: data.sku || null,
      };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();

      if (res.ok) {
        // Create custom toast logic or just use alert
        const msg = document.createElement('div');
        msg.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
        msg.textContent = product ? '✅ Produk berhasil diperbarui' : '✅ Produk berhasil ditambahkan';
        document.body.appendChild(msg);
        setTimeout(() => {
          msg.style.opacity = '0';
          setTimeout(() => msg.remove(), 500);
        }, 3000);

        onSuccess();
        onOpenChange(false);
      } else {
        alert(`Gagal: ${responseData.error}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat menyimpan produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Nama Produk <span className="text-red-500">*</span></label>
              <Input {...register('name')} placeholder="Nasi Goreng Spesial" className={errors.name ? 'border-red-500' : ''} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">SKU / Barcode (Opsional)</label>
              <Input {...register('sku')} placeholder="NG-001" className={errors.sku ? 'border-red-500' : ''} />
              {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Harga Jual (Price) <span className="text-red-500">*</span></label>
              <Input type="number" {...register('price')} className={errors.price ? 'border-red-500' : ''} />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Harga Modal (HPP) <span className="text-red-500">*</span></label>
              <Input type="number" {...register('cost')} className={errors.cost ? 'border-red-500' : ''} />
              {errors.cost && <p className="text-xs text-red-500">{errors.cost.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Tipe Produk <span className="text-red-500">*</span></label>
            <select
              {...register('type')}
              className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${errors.type ? 'border-red-500' : ''}`}
            >
              <option value="sellable">Barang Jadi / Jasa (Sellable)</option>
              <option value="component">Bahan Baku (Component)</option>
              <option value="both">Keduanya (Bisa dijual & jadi bahan baku)</option>
            </select>
            {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
          </div>

          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className="flex flex-col mb-4">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    {...register('is_stock_tracked')}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${isStockTracked ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isStockTracked ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="ml-3 font-medium text-sm text-slate-800">
                  Lacak Stok Fisik (Inventory)
                </div>
              </label>
              <p className="text-xs text-slate-500 mt-1 ml-12">
                Aktifkan jika produk ini memiliki fisik. Matikan untuk produk digital atau jasa (misal: Ongkos Kirim, Biaya Servis).
              </p>
            </div>

            {isStockTracked && (
              <div className="grid grid-cols-2 gap-4 mt-2 ml-12 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Stok Saat Ini <span className="text-red-500">*</span></label>
                  <Input type="number" {...register('current_stock')} className={errors.current_stock ? 'border-red-500' : ''} />
                  {errors.current_stock && <p className="text-xs text-red-500">{errors.current_stock.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Batas Alert Minimum <span className="text-red-500">*</span></label>
                  <Input type="number" {...register('min_stock_alert')} className={errors.min_stock_alert ? 'border-red-500' : ''} />
                  {errors.min_stock_alert && <p className="text-xs text-red-500">{errors.min_stock_alert.message}</p>}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-slate-800 text-white hover:bg-slate-700">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
