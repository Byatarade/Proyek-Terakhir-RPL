import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTransactionsAction } from "@/lib/transactions/actions";
import { TransactionHistory } from "@/components/organisms/TransactionHistory";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-cache";

export const metadata: Metadata = {
  title: "Riwayat Transaksi - PayBuy",
  description: "Daftar seluruh riwayat transaksi pesanan, status pembayaran, dan rincian nota belanja toko.",
};

export default async function DashboardTransaksiPage() {
  const { user } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/masuk?next=/dashboard/transaksi");
  }

  const result = await getTransactionsAction();

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[var(--line)] space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h2 className="font-heading font-bold text-lg text-zinc-950">
          Gagal Memuat Riwayat Transaksi
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          {result.error || "Terjadi kendala saat mengambil data pesanan toko Anda."}
        </p>
        <Link href="/dashboard">
          <Button variant="secondary" size="sm" className="mt-2">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    );
  }

  return <TransactionHistory initialData={result.data} />;
}
