import React from "react";
import { Metadata } from "next";
import { getStoreMenuDataAction } from "@/lib/menu/actions";
import { ProductManagement } from "@/components/organisms/ProductManagement";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-cache";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Kelola Menu & Produk - PayBuy",
  description: "Kelola daftar produk, kategori, harga jual, dan ketersediaan menu toko Anda.",
};

export default async function DashboardMenuPage() {
  const { user, profile } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/masuk?next=/dashboard/menu");
  }

  if (!profile?.store_id) {
    redirect("/onboarding");
  }

  const result = await getStoreMenuDataAction(profile.store_id);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[var(--line)] space-y-3">
        <h2 className="font-heading font-bold text-lg text-zinc-950">
          Gagal Memuat Menu Toko
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          {result.error || "Terjadi kendala saat mengambil data produk toko Anda."}
        </p>
      </div>
    );
  }

  const { categories, products, storeSlug, storeName } = result.data;

  return (
    <ProductManagement
      initialCategories={categories}
      initialProducts={products}
      storeSlug={storeSlug}
      storeName={storeName}
    />
  );
}
