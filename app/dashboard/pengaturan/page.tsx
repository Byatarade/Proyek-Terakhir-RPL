import React from "react";
import { Metadata } from "next";
import { StoreSettings } from "@/components/organisms/StoreSettings";

export const metadata: Metadata = {
  title: "Pengaturan Toko & Ganti QRIS - PayBuy",
  description: "Kelola metode pembayaran toko, ganti gambar QRIS, dan sesuaikan preferensi operasional toko Anda.",
};

export default function StoreSettingsPage() {
  return <StoreSettings />;
}
