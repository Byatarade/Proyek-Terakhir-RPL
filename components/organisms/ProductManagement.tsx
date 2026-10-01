"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Tag,
  Cake,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import {
  CategoryData,
  ProductData,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  createProductAction,
  updateProductAction,
  toggleProductAvailabilityAction,
  toggleProductActiveAction,
  deleteProductAction,
  SaveProductInput,
} from "@/lib/menu/actions";

export interface ProductManagementProps {
  initialCategories: CategoryData[];
  initialProducts: ProductData[];
  storeSlug: string;
  storeName: string;
}

export function ProductManagement({
  initialCategories,
  initialProducts,
  storeSlug,
  storeName,
}: ProductManagementProps) {
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [products, setProducts] = useState<ProductData[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "unavailable" | "hidden">("all");

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);

  // Form states for product
  const [productForm, setProductForm] = useState<SaveProductInput>({
    name: "",
    category_id: "",
    description: "",
    price_sell: 25000,
    price_cost: 15000,
    is_available: true,
    is_active: true,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Open modal for adding new product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category_id: categories[0]?.id || "",
      description: "",
      price_sell: 25000,
      price_cost: 15000,
      is_available: true,
      is_active: true,
    });
    setFormError(null);
    setProductModalOpen(true);
  };

  // Open modal for editing existing product
  const handleOpenEditProduct = (prod: ProductData) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category_id: prod.category_id || "",
      description: prod.description || "",
      price_sell: prod.price_sell,
      price_cost: prod.price_cost,
      is_available: prod.is_available,
      is_active: prod.is_active,
    });
    setFormError(null);
    setProductModalOpen(true);
  };

  // Submit product form
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      setFormError("Nama produk wajib diisi.");
      return;
    }
    if (productForm.price_sell <= 0) {
      setFormError("Harga jual harus lebih dari Rp 0.");
      return;
    }

    startTransition(async () => {
      if (editingProduct) {
        const res = await updateProductAction(editingProduct.id, productForm);
        if (!res.success) {
          setFormError(res.error || "Gagal memperbarui produk.");
          return;
        }
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  ...productForm,
                  category_id: productForm.category_id ?? null,
                  description: productForm.description ?? null,
                  category_name:
                    categories.find((c) => c.id === productForm.category_id)?.name || null,
                }
              : p
          )
        );
      } else {
        const res = await createProductAction(productForm);
        if (!res.success) {
          setFormError(res.error || "Gagal menambah produk.");
          return;
        }
        // Optimistic insert
        const newProd: ProductData = {
          id: "temp-" + Date.now(),
          store_id: "store",
          ...productForm,
          category_id: productForm.category_id ?? null,
          description: productForm.description ?? null,
          image_path: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category_name:
            categories.find((c) => c.id === productForm.category_id)?.name || null,
        };
        setProducts((prev) => [newProd, ...prev]);
      }

      setProductModalOpen(false);
    });
  };

  // Quick toggle availability (Tersedia / Habis)
  const handleToggleAvailability = (prod: ProductData) => {
    const newStatus = !prod.is_available;
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, is_available: newStatus } : p))
    );
    startTransition(async () => {
      await toggleProductAvailabilityAction(prod.id, newStatus);
    });
  };

  // Quick toggle visibility (Tampil / Sembunyi)
  const handleToggleActive = (prod: ProductData) => {
    const newStatus = !prod.is_active;
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, is_active: newStatus } : p))
    );
    startTransition(async () => {
      await toggleProductActiveAction(prod.id, newStatus);
    });
  };

  // Delete product
  const handleDeleteProduct = (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}"?`)) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    startTransition(async () => {
      await deleteProductAction(id);
    });
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    startTransition(async () => {
      const res = await createCategoryAction(newCategoryName);
      if (res.success && res.data) {
        setCategories((prev) => [...prev, { ...res.data!, product_count: 0 }]);
        setNewCategoryName("");
      }
    });
  };

  // Update Category
  const handleUpdateCategory = (id: string, name: string) => {
    if (!name.trim()) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
    setEditingCategory(null);
    startTransition(async () => {
      await updateCategoryAction(id, name);
    });
  };

  // Delete Category
  const handleDeleteCategory = (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"? Produk dalam kategori ini akan dipindahkan ke tanpa kategori.`)) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setProducts((prev) =>
      prev.map((p) => (p.category_id === id ? { ...p, category_id: null, category_name: null } : p))
    );
    startTransition(async () => {
      await deleteCategoryAction(id);
    });
  };

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    // Category filter
    if (selectedCategory !== "all" && prod.category_id !== selectedCategory) {
      return false;
    }
    // Status filter
    if (statusFilter === "available" && (!prod.is_available || !prod.is_active)) return false;
    if (statusFilter === "unavailable" && (prod.is_available || !prod.is_active)) return false;
    if (statusFilter === "hidden" && prod.is_active) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchDesc = prod.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    return true;
  });

  const totalAvailable = products.filter((p) => p.is_available && p.is_active).length;
  const totalUnavailable = products.filter((p) => !p.is_available && p.is_active).length;
  const totalHidden = products.filter((p) => !p.is_active).length;

  return (
    <div className="space-y-6 sm:space-y-8 bg-white">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--leaf)] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 mb-2">
            <Cake className="w-3.5 h-3.5 text-[var(--leaf)]" />
            <span>Katalog & Ketersediaan {storeName}</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-zinc-950 tracking-tight">
            Menu & Produk Toko
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl font-normal">
            Kelola daftar menu makanan & minuman, sesuaikan harga jual dan harga modal, serta atur ketersediaan langsung.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Link
            href={`/t/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <span>Menu Publik</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </Link>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setCategoryModalOpen(true)}
            className="gap-2 text-xs sm:text-sm font-semibold rounded-xl"
          >
            <Tag className="w-4 h-4 text-zinc-600" />
            <span>Kategori ({categories.length})</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAddProduct}
            className="gap-2 text-xs sm:text-sm font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Produk</span>
          </Button>
        </div>
      </div>

      {/* 2. Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/70 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Total Produk
          </span>
          <div className="font-heading font-bold text-2xl text-zinc-950 tabular-nums">
            {products.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Tersedia (Ready)
          </span>
          <div className="font-heading font-bold text-2xl text-emerald-600 tabular-nums">
            {totalAvailable}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            Sementara Habis
          </span>
          <div className="font-heading font-bold text-2xl text-amber-600 tabular-nums">
            {totalUnavailable}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-100/60 border border-zinc-200/70 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Disembunyikan
          </span>
          <div className="font-heading font-bold text-2xl text-zinc-700 tabular-nums">
            {totalHidden}
          </div>
        </div>
      </div>

      {/* 3. Search and Category Filter Tabs */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer",
              selectedCategory === "all"
                ? "bg-zinc-950 text-white shadow-2xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
            )}
          >
            Semua Kategori ({products.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer",
                selectedCategory === cat.id
                  ? "bg-zinc-950 text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
              )}
            >
              {cat.name} ({products.filter((p) => p.category_id === cat.id).length})
            </button>
          ))}
        </div>

        {/* Search & Status Filter Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama produk atau deskripsi menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9.5 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40 focus:border-[var(--leaf)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "available" | "unavailable" | "hidden"
                )
              }
              className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40 w-full sm:w-auto cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="available">Hanya Tersedia</option>
              <option value="unavailable">Hanya Habis</option>
              <option value="hidden">Hanya Sembunyi</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Products Table / List */}
      <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-2xs">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
              <Cake className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-900">
              Tidak Ada Produk yang Sesuai
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Coba ubah kata kunci pencarian atau filter status untuk menemukan produk yang diinginkan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-5">Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-right">Harga Jual</th>
                  <th className="py-3 px-4 text-right">Harga Modal</th>
                  <th className="py-3 px-4 text-right">Margin / Laba</th>
                  <th className="py-3 px-4 text-center">Ketersediaan</th>
                  <th className="py-3 px-4 text-center">Tampil</th>
                  <th className="py-3 px-4 sm:px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm font-normal text-zinc-900">
                {filteredProducts.map((prod) => {
                  const margin = prod.price_sell - prod.price_cost;
                  const marginPercent =
                    prod.price_sell > 0
                      ? Math.round((margin / prod.price_sell) * 100)
                      : 0;

                  return (
                    <tr
                      key={prod.id}
                      className={cn(
                        "hover:bg-zinc-50/80 transition-colors",
                        !prod.is_active && "opacity-60 bg-zinc-50/40"
                      )}
                    >
                      {/* Product Name & Description */}
                      <td className="py-3.5 px-4 sm:px-5 max-w-[240px]">
                        <div className="font-semibold text-zinc-950 leading-tight">
                          {prod.name}
                        </div>
                        {prod.description && (
                          <div className="text-xs text-zinc-400 truncate mt-0.5 font-normal">
                            {prod.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-medium border border-zinc-200">
                          {prod.category_name || "Tanpa Kategori"}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right font-heading font-semibold text-zinc-950 tabular-nums">
                        {formatRupiah(prod.price_sell)}
                      </td>

                      {/* Cost Price */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-zinc-500 tabular-nums">
                        {formatRupiah(prod.price_cost)}
                      </td>

                      {/* Profit Margin */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap tabular-nums">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--leaf)]">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{formatRupiah(margin)}</span>
                          <span className="text-[10px] text-zinc-400">({marginPercent}%)</span>
                        </span>
                      </td>

                      {/* Availability Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(prod)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer",
                            prod.is_available
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                          )}
                          title="Klik untuk ubah ketersediaan"
                        >
                          {prod.is_available ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Tersedia</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-amber-600" />
                              <span>Habis</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Active Visibility Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(prod)}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors cursor-pointer",
                            prod.is_active
                              ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                              : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                          )}
                          title={prod.is_active ? "Tampil di menu (klik untuk sembunyikan)" : "Disembunyikan (klik untuk tampilkan)"}
                        >
                          {prod.is_active ? (
                            <Eye className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-zinc-400" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                            title="Edit produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modal Tambah / Edit Produk */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => !isPending && setProductModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-elevated border border-zinc-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <h3 className="font-heading font-bold text-lg text-zinc-950">
                {editingProduct ? "Ubah Data Produk" : "Tambah Produk Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

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
                    setProductForm({ ...productForm, name: e.target.value })
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
                    setProductForm({ ...productForm, category_id: e.target.value })
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
                    setProductForm({ ...productForm, description: e.target.value })
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
                      setProductForm({
                        ...productForm,
                        price_sell: Number(e.target.value),
                      })
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
                      setProductForm({
                        ...productForm,
                        price_cost: Number(e.target.value),
                      })
                    }
                    className="w-full h-11 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
                  />
                  <span className="text-[10px] text-zinc-400">Dipakai untuk hitung laba bersih</span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="pt-2 border-t border-zinc-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={productForm.is_available}
                    onChange={(e) =>
                      setProductForm({ ...productForm, is_available: e.target.checked })
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
                      setProductForm({ ...productForm, is_active: e.target.checked })
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
                  onClick={() => setProductModalOpen(false)}
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
      )}

      {/* 6. Modal Kelola Kategori */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setCategoryModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-[460px] bg-white rounded-3xl shadow-elevated border border-zinc-200 overflow-hidden z-10 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <h3 className="font-heading font-bold text-lg text-zinc-950">
                Kelola Kategori Menu
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
              {/* Add category input */}
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama kategori baru..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 h-10 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isPending || !newCategoryName.trim()}
                  className="gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </Button>
              </form>

              {/* Categories list */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Daftar Kategori ({categories.length})
                </span>

                <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden">
                  {categories.map((cat) => {
                    const isEditing = editingCategory?.id === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className="p-3 flex items-center justify-between gap-2 hover:bg-zinc-50 transition-colors"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) =>
                                setEditingCategory({
                                  ...editingCategory,
                                  name: e.target.value,
                                })
                              }
                              className="h-8 px-2.5 rounded-lg border border-[var(--leaf)] text-xs text-zinc-900 flex-1 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateCategory(cat.id, editingCategory.name)
                              }
                              className="px-2 py-1 rounded bg-[var(--leaf)] text-white text-xs font-semibold"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              className="px-2 py-1 rounded text-zinc-500 hover:bg-zinc-200 text-xs"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 min-w-0">
                              <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                ({cat.product_count ?? 0} item)
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingCategory({ id: cat.id, name: cat.name })
                                }
                                className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60"
                                title="Edit nama"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                title="Hapus kategori"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
