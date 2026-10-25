"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CategoryData {
  id: string;
  name: string;
  sort_order: number;
  product_count?: number;
}

export interface ProductData {
  id: string;
  store_id: string;
  category_id: string | null;
  category_name?: string | null;
  name: string;
  description: string | null;
  image_path: string | null;
  price_sell: number;
  price_cost: number;
  is_active: boolean;
  is_available: boolean;
  is_best_seller?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuManagementData {
  storeId: string;
  storeName: string;
  storeSlug: string;
  categories: CategoryData[];
  products: ProductData[];
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Memuat seluruh data menu dan kategori untuk dashboard merchant
 */
export async function getStoreMenuDataAction(
  providedStoreId?: string
): Promise<ActionResponse<MenuManagementData>> {
  try {
    let effectiveStoreId = providedStoreId;
    const supabase = await createClient();

    if (!effectiveStoreId) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, error: "Sesi tidak ditemukan. Silakan masuk kembali." };
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("store_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.store_id) {
        return { success: false, error: "Profil toko tidak ditemukan." };
      }

      effectiveStoreId = profile.store_id;
    }

    // Fetch store info, categories, and products in parallel (saves ~200-400ms)
    const [storeRes, categoriesRes, productsRes] = await Promise.all([
      supabase
        .from("stores")
        .select("id, name, slug")
        .eq("id", effectiveStoreId)
        .single(),
      supabase
        .from("categories")
        .select("id, name, sort_order")
        .eq("store_id", effectiveStoreId)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("products")
        .select("*")
        .eq("store_id", effectiveStoreId)
        .order("created_at", { ascending: false }),
    ]);

    const store = storeRes.data;
    if (!store) {
      return { success: false, error: "Data toko tidak ditemukan." };
    }

    const categoriesData = categoriesRes.data;
    const productsData = productsRes.data;

    const categories = (categoriesData || []) as CategoryData[];
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const products = ((productsData || []) as (ProductData & { is_featured?: boolean })[]).map((p) => ({
      ...p,
      is_best_seller: Boolean(p.is_featured),
      category_name: p.category_id ? categoryMap.get(p.category_id) || null : null,
    }));

    // Attach product counts to categories
    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      product_count: products.filter((p) => p.category_id === cat.id).length,
    }));

    return {
      success: true,
      data: {
        storeId: store.id,
        storeName: store.name,
        storeSlug: store.slug,
        categories: categoriesWithCount,
        products,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan saat memuat menu.",
    };
  }
}

/**
 * Menambah kategori produk baru
 */
export async function createCategoryAction(name: string): Promise<ActionResponse<CategoryData>> {
  try {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: "Nama kategori tidak boleh kosong." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    const { data, error } = await supabase
      .from("categories")
      .insert({
        store_id: profile.store_id,
        name: trimmed,
        sort_order: 0,
      })
      .select("id, name, sort_order")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/menu");
    revalidatePath("/t/[slug]", "page");
    return { success: true, data: data as CategoryData };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal menambah kategori." };
  }
}

/**
 * Mengubah nama kategori
 */
export async function updateCategoryAction(id: string, name: string): Promise<ActionResponse> {
  try {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: "Nama kategori tidak boleh kosong." };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    const { error } = await supabase
      .from("categories")
      .update({ name: trimmed })
      .eq("id", id)
      .eq("store_id", profile.store_id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/menu");
    revalidatePath("/t/[slug]", "page");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal memperbarui kategori." };
  }
}

/**
 * Menghapus kategori
 */
export async function deleteCategoryAction(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    // Unlink products in this category (only for this store)
    await supabase
      .from("products")
      .update({ category_id: null })
      .eq("category_id", id)
      .eq("store_id", profile.store_id);
    // Delete category (only if belongs to this store)
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("store_id", profile.store_id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/menu");
    revalidatePath("/t/[slug]", "page");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus kategori." };
  }
}

export interface SaveProductInput {
  name: string;
  category_id?: string | null;
  description?: string | null;
  price_sell: number;
  price_cost: number;
  is_available: boolean;
  is_active: boolean;
  is_best_seller?: boolean;
  image_path?: string | null;
}

/**
 * Menambah produk baru
 */
export async function createProductAction(input: SaveProductInput): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    if (!input.name.trim()) return { success: false, error: "Nama produk wajib diisi." };
    if (input.price_sell < 0) return { success: false, error: "Harga jual tidak valid." };

    const { error } = await supabase.from("products").insert({
      store_id: profile.store_id,
      name: input.name.trim(),
      category_id: input.category_id || null,
      description: input.description?.trim() || null,
      price_sell: input.price_sell,
      price_cost: input.price_cost || 0,
      is_available: input.is_available ?? true,
      is_active: input.is_active ?? true,
      is_featured: input.is_best_seller ?? false,
      image_path: input.image_path || null,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/menu");
    revalidatePath("/t/[slug]", "page");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal menambah produk." };
  }
}

/**
 * Mengubah data produk
 */
export async function updateProductAction(id: string, input: SaveProductInput): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    if (!input.name.trim()) return { success: false, error: "Nama produk wajib diisi." };
    if (input.price_sell < 0) return { success: false, error: "Harga jual tidak valid." };

    const { error } = await supabase
      .from("products")
      .update({
        name: input.name.trim(),
        category_id: input.category_id || null,
        description: input.description?.trim() || null,
        price_sell: input.price_sell,
        price_cost: input.price_cost || 0,
        is_available: input.is_available,
        is_active: input.is_active,
        is_featured: input.is_best_seller ?? false,
        image_path: input.image_path || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("store_id", profile.store_id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/menu");
    revalidatePath("/t/[slug]", "page");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal memperbarui produk." };
  }
}

/**
 * Mengubah status ketersediaan produk (Tersedia / Habis)
 */
export async function toggleProductAvailabilityAction(
  id: string,
  isAvailable: boolean
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    const { error } = await supabase
      .from("products")
      .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("store_id", profile.store_id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/menu");
    revalidatePath("/t/[slug]", "page");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengubah ketersediaan." };
  }
}

/**
 * Mengubah status tampil produk (Aktif / Disembunyikan)
 */
export async function toggleProductActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    const { error } = await supabase
      .from("products")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("store_id", profile.store_id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/menu");
    revalidatePath("/t/[slug]", "page");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengubah visibilitas." };
  }
}

/**
 * Mengubah status menu terlaris produk (Best Seller) dari dashboard
 */
export async function toggleProductBestSellerAction(
  id: string,
  isBestSeller: boolean
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    const { error } = await supabase
      .from("products")
      .update({ is_featured: isBestSeller, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("store_id", profile.store_id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/menu");
    revalidatePath("/dashboard/pos");
    revalidatePath("/t/[slug]", "page");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengubah status terlaris." };
  }
}

/**
 * Menghapus produk (Aturan BR-07: jika ada pesanan dinonaktifkan, jika belum ada dihapus)
 */
export async function deleteProductAction(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    // Check if product was ever ordered (scoped to this store)
    const { count } = await supabase
      .from("order_items")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id)
      .eq("store_id", profile.store_id);

    if (count && count > 0) {
      // Soft-delete to preserve order history
      const { error } = await supabase
        .from("products")
        .update({ is_active: false, is_available: false, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("store_id", profile.store_id);

      if (error) return { success: false, error: error.message };
    } else {
      // Hard delete if never ordered
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("store_id", profile.store_id);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/menu");
    revalidatePath("/t/[slug]", "page");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus produk." };
  }
}
