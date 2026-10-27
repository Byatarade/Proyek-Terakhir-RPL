"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { landingContent } from "@/content/landing";
import { Button } from "@/components/atoms/Button";
import { Menu, X, ArrowRight, Store, DollarSign, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/types/database";

interface NavbarSectionProps {
  initialUser?: { id: string; email?: string } | null;
  initialRole?: UserRole | null;
  storeName?: string | null;
}

export function NavbarSection({
  initialUser = null,
  initialRole = null,
  storeName = null,
}: NavbarSectionProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialUser);
  const [userRole] = useState<UserRole | null>(initialRole);
  const { navbar, brand } = landingContent;

  useEffect(() => {
    const supabase = createClient();
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle ESC key and resize to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isKasir = userRole === "kasir";
  const dashboardHref = isKasir ? "/dashboard/pos" : "/dashboard";
  const dashboardLabel = isKasir ? "Buka Kasir POS" : "Lihat Dashboard";

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--line)] transition-all">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)] rounded-lg"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--leaf)] text-white flex items-center justify-center shadow-subtle group-hover:bg-[var(--leaf-hover)] transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl sm:text-2xl tracking-tight text-zinc-950 leading-none">
                {brand.name}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium tracking-wide uppercase text-zinc-500 mt-0.5">
                {brand.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-8 text-[14px] font-medium text-zinc-600"
            aria-label="Navigasi Utama"
          >
            {navbar.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-black transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)] rounded"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2.5">
                {storeName && (
                  <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-zinc-700 bg-[var(--surface-2)] border border-[var(--line)] px-2.5 py-1 rounded-full font-medium">
                    <Store className="w-3.5 h-3.5 text-[var(--leaf)]" />
                    <span className="max-w-[140px] truncate">{storeName}</span>
                  </span>
                )}
                <Link href={dashboardHref}>
                  <Button variant="primary" size="md" className="gap-2 text-sm font-semibold shadow-subtle hover:shadow-card">
                    <LayoutDashboard className="w-4 h-4 text-white" />
                    <span>{dashboardLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/80" />
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href={navbar.loginHref}>
                  <Button variant="ghost" size="sm" className="font-medium text-sm">
                    {navbar.loginText}
                  </Button>
                </Link>
                <Link href={navbar.registerHref}>
                  <Button variant="primary" size="md" className="gap-2 text-sm">
                    <Store className="w-4 h-4 text-white" />
                    {navbar.registerText}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-zinc-900 border border-[var(--line-strong)] rounded-xl bg-white shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)] cursor-pointer relative w-9 h-9 flex items-center justify-center overflow-hidden"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          >
            <Menu
              className={`w-5 h-5 absolute transition-all duration-200 ease-out ${
                mobileMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <X
              className={`w-5 h-5 absolute transition-all duration-200 ease-out ${
                mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Floating Overlay with Smooth Open & Close Transitions */}
      <div
        className={`sm:hidden fixed inset-x-0 bottom-0 top-18 z-40 flex flex-col justify-start transition-all duration-200 ease-out ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop Blur covering rest of screen */}
        <div
          className={`absolute inset-0 bg-black/25 backdrop-blur-sm transition-opacity duration-200 ease-out cursor-pointer ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Floating Mobile Drawer */}
        <div
          className={`relative z-10 bg-white/95 backdrop-blur-xl border-b border-[var(--line)] px-5 py-6 space-y-4 shadow-elevated max-h-[calc(100vh-4.5rem)] overflow-y-auto transition-all duration-200 ease-out ${
            mobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2"
          }`}
        >
          <nav className="flex flex-col space-y-1 font-medium text-zinc-900">
            {navbar.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors text-sm font-medium text-zinc-800"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-[var(--line)] flex flex-col gap-2.5">
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                {storeName && (
                  <div className="flex items-center justify-between px-3 py-2 bg-[var(--surface-2)] rounded-lg text-xs text-zinc-800">
                    <span className="text-zinc-500">Toko Aktif:</span>
                    <span className="font-semibold flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[var(--leaf)]" />
                      {storeName}
                    </span>
                  </div>
                )}
                <Link href={dashboardHref} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full gap-2 justify-center font-semibold">
                    <LayoutDashboard className="w-4 h-4 text-white" />
                    <span>{dashboardLabel}</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href={navbar.loginHref} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    {navbar.loginText}
                  </Button>
                </Link>
                <Link href={navbar.registerHref} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full gap-2">
                    <Store className="w-4 h-4 text-white" />
                    {navbar.registerText}
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
