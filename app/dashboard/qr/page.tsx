import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { StoreQrManagement } from "@/components/organisms/StoreQrManagement";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-cache";

export const metadata: Metadata = {
  title: "Cetak & Unduh QR Menu Toko - PayBuy",
  description: "Cetak karcis meja dan unduh kode QR menu unik permanen untuk toko Anda.",
};

export default async function DashboardQrPage() {
  const { user, profile, store } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/masuk?next=/dashboard/qr");
  }

  if (!profile?.store_id || !store || !store.slug) {
    redirect("/onboarding");
  }

  // Dapatkan hostname aktif saat ini dari request headers atau env
  const headersList = await headers();
  const host = headersList.get("host") || "paybuy.byatara.dev";
  const proto = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (host.includes("byatara.dev") ? "https://paybuy.byatara.dev" : `${proto}://${host}`);

  return (
    <StoreQrManagement
      storeName={store.name}
      storeSlug={store.slug}
      initialBaseUrl={baseUrl}
    />
  );
}
