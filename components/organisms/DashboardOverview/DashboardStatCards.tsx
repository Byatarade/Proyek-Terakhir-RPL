import React from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/molecules/StatCard";
import { formatRupiah } from "@/lib/utils";
import { DashboardStatCardsProps } from "./types";

export function DashboardStatCards({
  todaySales,
  todayOrdersCount,
  todayNetProfit,
  todayGrossProfit,
  activeOrdersCount,
  isOpen,
  isOwner,
}: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <StatCard
        label="Penjualan Hari Ini"
        value={formatRupiah(todaySales)}
        subtitle={`${todayOrdersCount} pesanan masuk`}
        icon={<DollarSign className="w-4 h-4 text-[var(--leaf)]" />}
      />

      {isOwner ? (
        <StatCard
          label="Laba Bersih Hari Ini"
          value={formatRupiah(todayNetProfit)}
          subtitle={`Laba Kotor: ${formatRupiah(todayGrossProfit)}`}
          icon={<TrendingUp className="w-4 h-4 text-[var(--forest)]" />}
          trend={{
            value: todayNetProfit >= 0 ? `+${formatRupiah(todayNetProfit)}` : `Defisit`,
            isPositive: todayNetProfit >= 0,
          }}
        />
      ) : (
        <StatCard
          label="Pesanan Hari Ini"
          value={`${todayOrdersCount} Pesanan`}
          subtitle="Total pesanan masuk"
          icon={<ShoppingBag className="w-4 h-4 text-[var(--blue)]" />}
        />
      )}

      <StatCard
        label="Antrian / Pesanan Aktif"
        value={`${activeOrdersCount} Antrian`}
        subtitle="Sedang dimasak / siap diambil"
        icon={<Clock className="w-4 h-4 text-[var(--amber)]" />}
      />

      <StatCard
        label="Status Operasional"
        value={isOpen ? "Toko Buka" : "Toko Tutup"}
        subtitle="Menerima pesanan QR"
        icon={<CheckCircle2 className="w-4 h-4 text-[var(--leaf)]" />}
      />
    </div>
  );
}
