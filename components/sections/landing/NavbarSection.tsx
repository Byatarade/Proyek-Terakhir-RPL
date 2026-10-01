"use client";

import React, { useState } from "react";
import Link from "next/link";
import { landingContent } from "@/content/landing";
import { Button } from "@/components/atoms/Button";
import { Receipt, Menu, X, ArrowRight, Store } from "lucide-react";

export function NavbarSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navbar, brand } = landingContent;

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--line)] transition-all">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)] rounded-lg"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-950 text-[var(--leaf)] flex items-center justify-center shadow-subtle group-hover:bg-zinc-800 transition-colors">
            <Receipt className="w-5 h-5" />
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
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-zinc-900 border border-[var(--line-strong)] rounded-xl bg-white shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)]"
          aria-expanded={mobileMenuOpen}
          aria-label="Buka menu navigasi"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[var(--line)] bg-white px-5 py-6 space-y-4 shadow-elevated">
          <nav className="flex flex-col space-y-2 font-medium text-zinc-900">
            {navbar.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-[var(--line)] flex flex-col gap-2.5">
            <Link href={navbar.loginHref} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full">
                {navbar.loginText}
              </Button>
            </Link>
            <Link href={navbar.registerHref} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full gap-2">
                {navbar.registerText}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
