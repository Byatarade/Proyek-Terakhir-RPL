"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  Coffee,
  Clock,
  BarChart3,
  QrCode,
  Settings,
  X,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types/database";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Beranda",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ["owner", "admin_gudang", "kasir", "koki"],
  },
  {
    label: "Layar Kasir",
    href: "/dashboard/kasir",
    icon: <Receipt className="w-5 h-5" />,
    roles: ["owner", "kasir"],
  },
  {
    label: "Layar Dapur",
    href: "/dashboard/dapur",
    icon: <UtensilsCrossed className="w-5 h-5" />,
    roles: ["owner", "koki"],
  },
  {
    label: "Menu & Produk",
    href: "/dashboard/menu",
    icon: <Coffee className="w-5 h-5" />,
    roles: ["owner", "admin_gudang"],
  },
  {
    label: "Riwayat Transaksi",
    href: "/dashboard/transaksi",
    icon: <Clock className="w-5 h-5" />,
    roles: ["owner", "kasir"],
  },
  {
    label: "Laba Rugi & Biaya",
    href: "/dashboard/laporan",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["owner"],
  },
  {
    label: "Cetak QR Menu",
    href: "/dashboard/qr",
    icon: <QrCode className="w-5 h-5" />,
    roles: ["owner"],
  },
  {
    label: "Pengaturan Toko",
    href: "/dashboard/pengaturan",
    icon: <Settings className="w-5 h-5" />,
    roles: ["owner"],
  },
];

export interface SidebarProps {
  role?: UserRole;
  storeName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  role = "owner",
  storeName,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const filteredNavItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-[var(--forest)] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static shrink-0 select-none shadow-card",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header Brand */}
          <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-1 focus:ring-[var(--mint)] rounded p-1"
            >
              <div className="w-8 h-8 rounded-lg bg-white text-[var(--forest)] flex items-center justify-center font-medium">
                <Receipt className="w-4 h-4 text-[var(--leaf)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-semibold text-lg text-white leading-none tracking-tight">
                  PayBuy
                </span>
                <span className="text-[10px] text-white/60 tracking-wider uppercase font-medium mt-0.5">
                  Panel Toko
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Tutup menu samping"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Store Info Pill */}
          {storeName && (
            <div className="mx-3.5 mt-3.5 px-3 py-2 rounded-lg bg-[var(--forest-2)]/70 border border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-[var(--mint)] font-medium block">
                Toko Aktif
              </span>
              <span className="text-xs font-medium text-white truncate block">
                {storeName}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
                    isActive
                      ? "bg-[var(--forest-2)] text-white font-medium"
                      : "text-white/75 hover:bg-[var(--forest-2)]/60 hover:text-white"
                  )}
                >
                  {/* Active Indicator Border */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[var(--mint)] rounded-r"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-[var(--mint)]"
                        : "text-white/60 group-hover:text-white"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer role notice */}
          <div className="p-3.5 border-t border-white/10 text-xs text-white/60 flex items-center justify-between">
            <span className="capitalize">Peran: {role}</span>
            <span className="text-[10px] font-mono text-[var(--mint)] bg-[var(--forest-2)] px-1.5 py-0.5 rounded">
              v0.1
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
