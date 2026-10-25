"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import {
  Menu,
  ExternalLink,
  LogOut,
  User,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { logoutUserAction } from "@/lib/auth";
import { UserRole } from "@/lib/types/database";

export interface TopBarProps {
  storeName?: string;
  storeSlug?: string;
  isOpen?: boolean;
  fullName?: string;
  role?: UserRole;
  onOpenSidebar?: () => void;
}

export function TopBar({
  storeName = "Toko Saya",
  storeSlug,
  isOpen = true,
  fullName = "Pengguna",
  role = "owner",
  onOpenSidebar,
}: TopBarProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUserAction();
    });
  };

  const roleLabelMap: Record<UserRole, string> = {
    owner: "Pemilik Toko (Superadmin)",
    kasir: "Kasir Toko",
    koki: "Kasir Toko",
    admin_gudang: "Kasir Toko",
  };

  return (
    <header className="h-16 bg-white border-b border-[var(--line)] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Left: Mobile hamburger & Store info */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-[var(--muted)] hover:text-black hover:bg-[var(--surface-2)] focus:outline-none"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Store Title & Public Menu Link */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-base sm:text-lg text-zinc-950 leading-none truncate max-w-[180px] sm:max-w-[260px]">
                {storeName}
              </h1>
              <Badge
                variant={isOpen ? "mint" : "amber"}
                size="sm"
                className="hidden sm:inline-flex items-center gap-1.5"
              >
                {isOpen ? (
                  <CheckCircle2 className="w-3 h-3 text-[var(--forest)] shrink-0" />
                ) : (
                  <XCircle className="w-3 h-3 text-[var(--forest)] shrink-0" />
                )}
                <span>{isOpen ? "Toko Buka" : "Toko Tutup"}</span>
              </Badge>
            </div>

            {storeSlug && (
              <Link
                href={`/t/${storeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-zinc-400 hover:text-[var(--leaf)] inline-flex items-center gap-1 font-mono transition-colors mt-0.5"
                title="Buka menu publik pelanggan"
              >
                <span>/t/{storeSlug}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Right: User Profile & Logout Action */}
      <div className="flex items-center gap-3">
        {/* User Pill (Minimalist Landing Page Style) */}
        <div className="hidden md:flex items-center gap-2.5 pl-3.5 pr-1.5 py-1 rounded-full bg-zinc-50 border border-zinc-200/80 text-xs">
          <div className="flex flex-col text-right">
            <span className="font-semibold text-zinc-900 leading-tight max-w-[140px] truncate">
              {fullName}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">
              {roleLabelMap[role] || role}
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 font-medium text-xs shrink-0 shadow-2xs">
            <User className="w-3.5 h-3.5 text-[var(--leaf)]" />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-zinc-500 hover:text-[var(--danger)] hover:bg-red-50/80 border border-transparent hover:border-red-200/70 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--danger)]/20 disabled:opacity-50"
          title="Keluar dari akun toko"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[var(--danger)]" />
              <span className="hidden sm:inline">Keluar...</span>
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-[var(--danger)]" />
              <span className="hidden sm:inline">Keluar</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
