import React from "react";
import { ShoppingBag, UtensilsCrossed, Package } from "lucide-react";
import { EmployeeData } from "@/lib/employees/actions";

export interface RoleOption {
  key: "kasir" | "koki" | "admin_gudang";
  label: string;
  badgeVariant: "mint" | "brick" | "neutral";
  icon: React.ReactNode;
  desc: string;
  features: string[];
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    key: "kasir",
    label: "Kasir (Operasional)",
    badgeVariant: "mint",
    icon: <ShoppingBag className="w-4 h-4 text-[var(--leaf)]" />,
    desc: "Melayani transaksi kasir POS, mengubah status masak, dan memanggil antrean pelanggan.",
    features: [
      "Kasir POS (Input Menu)",
      "Layar Kasir & Antrian",
      "Mulai Masak & Panggil Antrian",
      "Riwayat Transaksi",
    ],
  },
  {
    key: "koki",
    label: "Koki (Dapur)",
    badgeVariant: "brick",
    icon: <UtensilsCrossed className="w-4 h-4 text-[var(--brick)]" />,
    desc: "Memproses pesanan makanan & minuman di dapur.",
    features: [
      "Layar Dapur",
      "Mulai Masak Pesanan",
      "Tandai Pesanan Siap Diambil",
    ],
  },
  {
    key: "admin_gudang",
    label: "Admin Gudang (Logistik)",
    badgeVariant: "neutral",
    icon: <Package className="w-4 h-4 text-zinc-600" />,
    desc: "Mengelola ketersediaan menu dan harga modal.",
    features: [
      "Kelola Produk & Kategori",
      "Atur Stok & Tanda Habis",
      "Lihat & Atur Harga Pokok",
    ],
  },
];

export interface StaffManagementProps {
  initialEmployees?: EmployeeData[];
}
