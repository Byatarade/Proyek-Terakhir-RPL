import React from "react";
import { ShoppingBag } from "lucide-react";
import { EmployeeData } from "@/lib/employees/actions";

export interface RoleOption {
  key: "kasir";
  label: string;
  badgeVariant: "mint";
  icon: React.ReactNode;
  desc: string;
  features: string[];
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    key: "kasir",
    label: "Kasir Toko (Operasional)",
    badgeVariant: "mint",
    icon: <ShoppingBag className="w-4 h-4 text-[var(--leaf)]" />,
    desc: "Melayani transaksi kasir manual (POS), memantau antrean kasir & panggil suara, serta melihat riwayat transaksi.",
    features: [
      "Kasir POS (Input Menu Walk-in)",
      "Layar Kasir (Antrian & Panggil Suara)",
      "Riwayat Transaksi Pelanggan",
    ],
  },
];

export interface StaffManagementProps {
  initialEmployees?: EmployeeData[];
}
