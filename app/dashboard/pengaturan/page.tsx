import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { StoreSettings } from "@/components/organisms/StoreSettings";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-cache";

export const metadata: Metadata = {
  title: "Pengaturan Toko & Ganti QRIS - PayBuy",
  description: "Kelola metode pembayaran toko, ganti gambar QRIS, dan sesuaikan preferensi operasional toko Anda.",
};

export default async function StoreSettingsPage() {
  const { user, profile } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/masuk?next=/dashboard/pengaturan");
  }

  if (profile?.role !== "owner") {
    redirect("/dashboard/pos");
  }

  return <StoreSettings />;
}
