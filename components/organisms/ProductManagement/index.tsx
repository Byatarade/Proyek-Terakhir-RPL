"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Tag, Cake } from "lucide-react";
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
  toggleProductBestSellerAction,
  deleteProductAction,
  SaveProductInput,
} from "@/lib/menu/actions";

import {
  ProductManagementProps,
  StatusFilterType,
} from "./types";
import { ProductStatCards } from "./ProductStatCards";
import { ProductFilterBar } from "./ProductFilterBar";
import { ProductTable } from "./ProductTable";
import { ProductFormModal } from "./ProductFormModal";
import { CategoryManagementModal } from "./CategoryManagementModal";

export type { ProductManagementProps } from "./types";

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
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");

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
    is_best_seller: false,
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
      is_best_seller: false,
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
      is_best_seller: Boolean(prod.is_best_seller),
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

  // Quick toggle best seller (Terlaris)
  const handleToggleBestSeller = (prod: ProductData) => {
    const newStatus = !prod.is_best_seller;
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, is_best_seller: newStatus } : p))
    );
    startTransition(async () => {
      await toggleProductBestSellerAction(prod.id, newStatus);
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
    if (
      !confirm(
        `Hapus kategori "${name}"? Produk dalam kategori ini akan dipindahkan ke tanpa kategori.`
      )
    )
      return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setProducts((prev) =>
      prev.map((p) =>
        p.category_id === id
          ? { ...p, category_id: null, category_name: null }
          : p
      )
    );
    startTransition(async () => {
      await deleteCategoryAction(id);
    });
  };

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    if (selectedCategory !== "all" && prod.category_id !== selectedCategory) {
      return false;
    }
    if (statusFilter === "best_seller" && !prod.is_best_seller) return false;
    if (statusFilter === "available" && (!prod.is_available || !prod.is_active)) return false;
    if (statusFilter === "unavailable" && (prod.is_available || !prod.is_active)) return false;
    if (statusFilter === "hidden" && prod.is_active) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchDesc = prod.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    return true;
  });

  const totalBestSeller = products.filter((p) => p.is_best_seller).length;
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
      <ProductStatCards
        totalProducts={products.length}
        totalAvailable={totalAvailable}
        totalUnavailable={totalUnavailable}
        totalHidden={totalHidden}
        totalBestSeller={totalBestSeller}
      />

      {/* 3. Search and Category Filter Tabs */}
      <ProductFilterBar
        categories={categories}
        products={products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* 4. Products Table / List */}
      <ProductTable
        products={filteredProducts}
        onToggleAvailability={handleToggleAvailability}
        onToggleActive={handleToggleActive}
        onToggleBestSeller={handleToggleBestSeller}
        onEditProduct={handleOpenEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* 5. Modal Tambah / Edit Produk */}
      <ProductFormModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        editingProduct={editingProduct}
        categories={categories}
        productForm={productForm}
        setProductForm={setProductForm}
        formError={formError}
        isPending={isPending}
        onSubmit={handleSaveProduct}
      />

      {/* 6. Modal Kelola Kategori */}
      <CategoryManagementModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        isPending={isPending}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
