import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfitLossReportAction } from "@/lib/finance/actions";
import { ProfitLossReport } from "@/components/organisms/ProfitLossReport";
import { AlertCircle, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";

export const metadata: Metadata = {
  title: "Riwayat Laba Rugi & Biaya - PayBuy",
  description: "Laporan performa laba kotor, laba bersih, dan pencatatan biaya operasional toko Anda.",
};

export default async function DashboardLaporanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk?next=/dashboard/laporan");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, store_id")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role || "owner";

  // PRD FR-LR-05: Laporan hanya dapat diakses oleh owner
  if (role !== "owner") {
    return (
      <div className="bg-white border border-[var(--line)] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 my-8 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="font-heading font-bold text-xl text-zinc-950">
          Akses Laporan Terbatas
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
          Laporan keuangan, perhitungan laba rugi, dan pencatatan biaya operasional toko hanya dapat diakses oleh Pemilik Toko (Owner).
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="secondary" size="md">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const reportResult = await getProfitLossReportAction({ preset: "thisMonth" });

  if (!reportResult.success || !reportResult.data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[var(--line)] space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h2 className="font-heading font-bold text-lg text-zinc-950">
          Gagal Memuat Laporan Keuangan
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          {reportResult.error || "Terjadi kendala teknis saat memuat data laporan laba rugi toko."}
        </p>
        <Link href="/dashboard">
          <Button variant="secondary" size="sm" className="mt-2">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    );
  }

  return <ProfitLossReport initialData={reportResult.data} />;
}
