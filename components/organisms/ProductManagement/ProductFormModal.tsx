import React from "react";
import { X, Loader2, Flame } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { ProductFormModalProps } from "./types";
import { ProductImageUpload } from "./ProductImageUpload";

export function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  categories,
  productForm,
  setProductForm,
  formError,
  isPending,
  onSubmit,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => !isPending && onClose()}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-elevated border border-zinc-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <h3 className="font-heading font-bold text-lg text-zinc-950">
            {editingProduct ? "Ubah Data Produk" : "Tambah Produk Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {formError}
            </div>
          )}

          {/* Product Image Upload with Base64 & < 5MB compression */}
          <ProductImageUpload
            imagePath={productForm.image_path}
            onChange={(base64) =>
              setProductForm((prev) => ({ ...prev, image_path: base64 }))
            }
            disabled={isPending}
          />

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Choco Fudge Cake Slice"
              value={productForm.name}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className="w-full h-11 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40 focus:border-[var(--leaf)]"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800">Kategori</label>
            <select
              value={productForm.category_id || ""}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, category_id: e.target.value }))
              }
              className="w-full h-11 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40 focus:border-[var(--leaf)] cursor-pointer"
            >
              <option value="">Pilih Kategori...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800">Deskripsi Ringkas</label>
            <textarea
              rows={2}
              placeholder="Rincian rasa, topping, atau bahan utama (maksimal 2 baris)"
              value={productForm.description || ""}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40 focus:border-[var(--leaf)] resize-none"
            />
          </div>

          {/* Selling Price & Cost Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800">
                Harga Jual (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={productForm.price_sell}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    price_sell: Number(e.target.value),
                  }))
                }
                required
                className="w-full h-11 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
              />
              <span className="text-[10px] text-zinc-400">Harga yang dilihat pelanggan</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800">
                Harga Modal / HPP (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={productForm.price_cost}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    price_cost: Number(e.target.value),
                  }))
                }
                className="w-full h-11 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
              />
              <span className="text-[10px] text-zinc-400">Dipakai untuk hitung laba bersih</span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 hover:bg-amber-50 transition-colors">
              <input
                type="checkbox"
                checked={Boolean(productForm.is_best_seller)}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, is_best_seller: e.target.checked }))
                }
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Menu Terlaris (Best Seller)
                </span>
                <span className="text-[11px] text-zinc-600">
                  Tampilkan badge &quot;Terlaris&quot; dan prioritaskan di bagian atas menu.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={productForm.is_available}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, is_available: e.target.checked }))
                }
                className="w-4 h-4 rounded text-[var(--leaf)] focus:ring-[var(--leaf)] cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900">
                  Stok Tersedia (Ready)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Bila dicentang, pelanggan dapat memesan produk ini.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={productForm.is_active}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="w-4 h-4 rounded text-[var(--leaf)] focus:ring-[var(--leaf)] cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900">
                  Tampilkan di Menu Publik
                </span>
                <span className="text-[11px] text-zinc-500">
                  Bila dinonaktifkan, produk disembunyikan dari pelanggan.
                </span>
              </div>
            </label>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isPending}
              className="gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingProduct ? "Simpan Perubahan" : "Tambah Produk"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
