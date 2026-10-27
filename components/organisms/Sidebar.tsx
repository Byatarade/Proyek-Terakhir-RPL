"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
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
  ChevronsLeft,
  ChevronsRight,
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
        roles: ["owner"],
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
  fullName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  role = "owner",
  storeName,
  storeSlug,
  fullName = "Pengguna Toko",
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  const roleLabelMap: Record<UserRole, string> = {
    owner: "Pemilik Toko (Superadmin)",
    kasir: "Kasir Toko",
    koki: "Kasir Toko",
    admin_gudang: "Kasir Toko",
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

      {/* Sidebar Container: Fixed on mobile, sticky with collapsible width on desktop */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[var(--line)] flex flex-col justify-between transition-all duration-300 ease-in-out select-none",
          "lg:sticky lg:top-0 lg:h-screen shrink-0",
          isCollapsed ? "lg:w-[72px]" : "lg:w-64",
          isOpen ? "w-64 translate-x-0 shadow-lg" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Brand */}
          <div
            className={cn(
              "h-16 border-b border-[var(--line)] flex items-center shrink-0 transition-all",
              isCollapsed ? "px-3 justify-center" : "px-5 justify-between"
            )}
          >
            {isCollapsed ? (
              /* Logo ringkas saat menyusut */
              <Link
                href="/dashboard"
                className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)] rounded-xl p-1"
                title="PayBuy - Beranda Panel Toko"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--leaf)] text-white flex items-center justify-center shadow-xs group-hover:bg-[var(--leaf-hover)] transition-colors">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </Link>
            ) : (
              /* Logo lengkap saat membesar */
              <>
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

                {/* Tombol Susutkan (Desktop) */}
                {onToggleCollapse && (
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus:outline-none cursor-pointer"
                    title="Susutkan Dashboard"
                    aria-label="Susutkan Dashboard"
                  >
                    <ChevronsLeft className="w-5 h-5" />
                  </button>
                )}
              </>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus:outline-none"
              aria-label="Tutup menu samping"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tombol Membesar Khusus Saat Sidebar Menyusut (Desktop) */}
          {isCollapsed && onToggleCollapse && (
            <div className="px-3 pt-3 pb-1 shrink-0 hidden lg:block">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-full h-10 rounded-xl bg-[var(--surface-2)] text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] hover:shadow-[3px_3px_0px_var(--forest)] hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer group"
                title="Klik untuk Perbesar Dashboard (Membesar)"
                aria-label="Perbesar Dashboard"
              >
                <ChevronsRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}

          {/* Store Info Card */}
          {storeName && (
            isCollapsed ? (
              /* Mini Store Pill */
              <div className="px-2.5 py-2 flex justify-center shrink-0 hidden lg:flex">
                <Link
                  href={storeSlug ? `/t/${storeSlug}` : "#"}
                  target={storeSlug ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center text-zinc-700 hover:text-[var(--leaf)] hover:border-[var(--leaf)] hover:bg-white transition-all shadow-2xs"
                  title={`${storeName} ${storeSlug ? `(/t/${storeSlug})` : ""} - Klik untuk lihat menu publik`}
                >
                  <Store className="w-4 h-4 text-[var(--leaf)]" />
                </Link>
              </div>
            ) : (
              /* Full Store Card */
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
            )
          )}

          {/* Grouped Navigation Links */}
          <nav
            className={cn(
              "flex-1 overflow-y-auto space-y-4",
              isCollapsed ? "px-2 py-3" : "px-3 py-4"
            )}
          >
            {NAV_GROUPS.map((group, groupIdx) => {
              const visibleItems = group.items.filter((item) =>
                item.roles.includes(role)
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1">
                  {/* Judul grup navigasi atau garis pemisah */}
                  {isCollapsed ? (
                    groupIdx > 0 && (
                      <div className="w-7 h-[1px] bg-zinc-200 mx-auto my-2.5" />
                    )
                  ) : (
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400 px-3 block">
                      {group.title}
                    </span>
                  )}

                  <div className="space-y-1 pt-0.5">
                    {visibleItems.map((item) => {
                      const isActive =
                        item.href === "/dashboard"
                          ? pathname === "/dashboard"
                          : item.href === "/dashboard/laporan"
                          ? pathname.startsWith("/dashboard/laporan") ||
                            pathname.startsWith("/dashboard/laba-rugi")
                          : pathname.startsWith(item.href);

                      if (isCollapsed) {
                        /* Tampilan saat menyusut: tombol icon dengan tooltip nama menu */
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            onClick={onClose}
                            title={item.label}
                            className={cn(
                              "w-11 h-11 mx-auto flex items-center justify-center rounded-[10px] text-xs transition-all relative border-2",
                              isActive
                                ? "bg-[var(--surface-2)] text-[var(--forest)] border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                                : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 border-transparent"
                            )}
                          >
                            <span
                              className={cn(
                                "transition-colors",
                                isActive
                                  ? "text-[var(--forest)]"
                                  : "text-zinc-500 hover:text-zinc-800"
                              )}
                            >
                              {item.icon}
                            </span>
                          </Link>
                        );
                      }

                      /* Tampilan saat membesar: icon + teks nama menu */
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

          {/* Footer User Role Notice */}
          <div
            className={cn(
              "p-3 border-t border-[var(--line)] bg-zinc-50/50 flex items-center shrink-0",
              isCollapsed ? "justify-center" : "justify-between text-xs text-zinc-500"
            )}
          >
            {isCollapsed ? (
              <span
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 cursor-help"
                title={`${fullName} • ${roleLabelMap[role] || role} (v0.1)`}
              />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="capitalize font-medium text-zinc-700">
                    {roleLabelMap[role] || role}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                  v0.1
                </span>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
