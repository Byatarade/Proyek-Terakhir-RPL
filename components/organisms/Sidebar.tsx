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
  Users,
  X,
  Store,
  ExternalLink,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types/database";

interface NavGroup {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles: UserRole[];
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "OPERASIONAL",
    items: [
      {
        label: "Beranda",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
        roles: ["owner", "kasir"],
      },
      {
        label: "Kasir POS (Input Menu)",
        href: "/dashboard/pos",
        icon: <ShoppingBag className="w-4 h-4" />,
        roles: ["owner", "kasir"],
      },
      {
        label: "Layar Kasir (Antrian)",
        href: "/dashboard/kasir",
        icon: <Receipt className="w-4 h-4" />,
        roles: ["owner", "kasir"],
      },
    ],
  },
  {
    title: "KATALOG & LAPORAN",
    items: [
      {
        label: "Menu & Produk",
        href: "/dashboard/menu",
        icon: <Coffee className="w-4 h-4" />,
        roles: ["owner"],
      },
      {
        label: "Riwayat Transaksi",
        href: "/dashboard/transaksi",
        icon: <Clock className="w-4 h-4" />,
        roles: ["owner", "kasir"],
      },
      {
        label: "Laba Rugi & Biaya",
        href: "/dashboard/laporan",
        icon: <BarChart3 className="w-4 h-4" />,
        roles: ["owner"],
      },
    ],
  },
  {
    title: "PENGATURAN",
    items: [
      {
        label: "Kelola Pegawai",
        href: "/dashboard/pegawai",
        icon: <Users className="w-4 h-4" />,
        roles: ["owner"],
      },
      {
        label: "Cetak QR Menu",
        href: "/dashboard/qr",
        icon: <QrCode className="w-4 h-4" />,
        roles: ["owner"],
      },
      {
        label: "Pengaturan Toko",
        href: "/dashboard/pengaturan",
        icon: <Settings className="w-4 h-4" />,
        roles: ["owner"],
      },
    ],
  },
];

export interface SidebarProps {
  role?: UserRole;
  storeName?: string;
  storeSlug?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  role = "owner",
  storeName,
  storeSlug,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const roleLabelMap: Record<UserRole, string> = {
    owner: "Pemilik Toko",
    kasir: "Kasir",
    koki: "Koki Dapur",
    admin_gudang: "Admin Gudang",
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Fixed on mobile, sticky/fixed on desktop */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[var(--line)] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen shrink-0 select-none",
          isOpen ? "translate-x-0 shadow-lg" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Brand: Matches Landing Page Navbar Logo */}
          <div className="h-16 px-5 border-b border-[var(--line)] flex items-center justify-between shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)] rounded-lg p-1"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--leaf)] text-white flex items-center justify-center shadow-xs group-hover:bg-[var(--leaf-hover)] transition-colors">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-base tracking-tight text-zinc-950 leading-none">
                  PayBuy
                </span>
                <span className="text-[10px] font-medium tracking-wide uppercase text-zinc-400 mt-0.5">
                  Panel Toko
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus:outline-none"
              aria-label="Tutup menu samping"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Store Info Card: Clean Minimalist Store Pill */}
          {storeName && (
            <div className="mx-3.5 mt-3.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                  <Store className="w-3.5 h-3.5 text-[var(--leaf)]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-zinc-900 truncate">
                    {storeName}
                  </span>
                  {storeSlug && (
                    <span className="text-[10px] text-zinc-400 font-mono truncate">
                      /t/{storeSlug}
                    </span>
                  )}
                </div>
              </div>

              {storeSlug && (
                <Link
                  href={`/t/${storeSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-zinc-400 hover:text-[var(--leaf)] hover:bg-white transition-colors"
                  title="Buka menu publik"
                >
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}

          {/* Grouped Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
            {NAV_GROUPS.map((group) => {
              const visibleItems = group.items.filter((item) =>
                item.roles.includes(role)
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400 px-3 block">
                    {group.title}
                  </span>
                  <div className="space-y-0.5 pt-1">
                    {visibleItems.map((item) => {
                      const isActive =
                        item.href === "/dashboard"
                          ? pathname === "/dashboard"
                          : item.href === "/dashboard/laporan"
                          ? pathname.startsWith("/dashboard/laporan") || pathname.startsWith("/dashboard/laba-rugi")
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={false}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-[8px] text-xs sm:text-[13px] transition-all group relative border-2",
                            isActive
                              ? "bg-[var(--surface-2)] text-[var(--forest)] font-bold border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)]"
                              : "text-[var(--muted)] hover:text-[var(--ink)] font-medium border-transparent hover:bg-zinc-50"
                          )}
                        >
                          <span
                            className={cn(
                              "shrink-0 transition-colors",
                              isActive
                                ? "text-[var(--forest)]"
                                : "text-zinc-400 group-hover:text-zinc-700"
                            )}
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                          {isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--forest)]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Footer User Role Notice: Clean Minimalist */}
          <div className="p-3 border-t border-[var(--line)] bg-zinc-50/50 flex items-center justify-between text-xs text-zinc-500 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="capitalize font-medium text-zinc-700">
                {roleLabelMap[role] || role}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
              v0.1
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
