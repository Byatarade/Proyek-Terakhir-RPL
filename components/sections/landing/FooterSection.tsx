"use client";

import React from "react";
import Link from "next/link";

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer
      className={`relative w-full overflow-hidden bg-gradient-to-b from-white via-[#ECFDF5] via-20% to-[#5BD7A7] text-zinc-900 pt-16 sm:pt-20 pb-0 selection:bg-[#10B981] selection:text-white ${className}`}
    >
      {/* Clean Full-Width Seamless Soft Blur Transition (No lines or borders) */}
      <div className="absolute top-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-b from-white via-white/50 to-transparent pointer-events-none select-none z-0 backdrop-blur-sm" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Top 3-Column Section: Social & Contact (Left) | Tech Connector Demo (Center) | Navigation (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 items-start justify-between">
          {/* Left Column: Social Icons, Email, Address */}
          <div className="md:col-span-4 flex flex-col items-start">
            {/* Social Icons Row: Facebook, LinkedIn, X */}
            <div className="flex items-center gap-2.5">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-7 h-7 rounded-full border border-zinc-800/80 flex items-center justify-center text-zinc-800 hover:text-zinc-950 hover:border-zinc-950 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-md border border-zinc-800/80 flex items-center justify-center text-zinc-800 hover:text-zinc-950 hover:border-zinc-950 transition-colors"
              >
                <span className="text-[11px] leading-none font-medium">in</span>
              </a>

              {/* X */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-7 h-7 rounded-md border border-zinc-800/80 flex items-center justify-center text-zinc-800 hover:text-zinc-950 hover:border-zinc-950 transition-colors"
              >
                <span className="text-xs leading-none font-semibold">𝕏</span>
              </a>
            </div>

            {/* Email */}
            <a
              href="mailto:kontak@paybuy.id"
              className="text-lg sm:text-xl font-semibold text-zinc-950 mt-4 hover:underline tracking-tight"
            >
              kontak@paybuy.id
            </a>

            {/* Address */}
            <p className="text-xs sm:text-sm text-zinc-700/90 mt-3 leading-relaxed max-w-xs font-normal">
              Gedung Inovasi UMKM Lt. 3, <br />
              Jl. Kebon Sirih No. 45, Jakarta Pusat, <br />
              DKI Jakarta, 10150
            </p>
          </div>

          {/* Center Column: High-Tech Dot Matrix Connector with 'Daftar Toko Gratis FREE' Button */}
          <div className="md:col-span-5 flex items-center justify-center py-4 md:py-0">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Left Matrix Graphic with Bracket */}
              <div className="hidden lg:flex items-center">
                <div className="grid grid-cols-4 gap-1 opacity-40 p-2 border-r border-t border-b border-zinc-500/40 rounded-r-lg">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        i % 3 === 0 ? "bg-[#10B981]" : "bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
                <div className="w-5 lg:w-8 h-[1px] bg-zinc-400/60" />
              </div>

              {/* Center Pill Button */}
              <Link
                href="/daftar"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs sm:text-sm font-medium shadow-2xl transition-all duration-200 group shrink-0 hover:scale-[1.02]"
              >
                <span>Daftar Toko Gratis</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#10B981]/30 text-emerald-200 border border-[#10B981]/50 tracking-wider">
                  FREE
                </span>
              </Link>

              {/* Right Matrix Graphic with Bracket */}
              <div className="hidden lg:flex items-center">
                <div className="w-5 lg:w-8 h-[1px] bg-zinc-400/60" />
                <div className="grid grid-cols-4 gap-1 opacity-40 p-2 border-l border-t border-b border-zinc-500/40 rounded-l-lg">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        i % 3 === 0 ? "bg-[#10B981]" : "bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Vertical Navigation List */}
          <div className="md:col-span-3 flex flex-col md:items-end items-start gap-2.5">
            <Link
              href="#fitur"
              className="text-sm sm:text-base font-medium text-zinc-900 hover:text-black transition-colors"
            >
              Platform POS
            </Link>
            <Link
              href="#cara-kerja"
              className="text-sm sm:text-base font-medium text-zinc-900 hover:text-black transition-colors"
            >
              Cara Kerja
            </Link>
            <Link
              href="#fitur"
              className="text-sm sm:text-base font-medium text-zinc-900 hover:text-black transition-colors"
            >
              Fitur Unggulan
            </Link>
            <Link
              href="#harga"
              className="text-sm sm:text-base font-medium text-zinc-900 hover:text-black transition-colors"
            >
              Paket & Harga
            </Link>
            <Link
              href="#simulasi"
              className="text-sm sm:text-base font-medium text-zinc-900 hover:text-black transition-colors"
            >
              Simulasi Layar
            </Link>
            <Link
              href="#faq"
              className="text-sm sm:text-base font-medium text-zinc-900 hover:text-black transition-colors"
            >
              Tentang Kami
            </Link>
          </div>
        </div>

        {/* Middle Legal / Copyright Line (Positioned ABOVE the giant wordmark) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-700/80 font-medium mt-12 sm:mt-16 mb-2 sm:mb-3 pt-6 border-t border-zinc-400/30">
          <Link
            href="#"
            className="hover:text-zinc-950 underline underline-offset-4"
          >
            Syarat & Ketentuan
          </Link>
          <div className="text-center">
            © {new Date().getFullYear()} PayBuy. All Rights Reserved. Developed by Byatarade
          </div>
          <Link
            href="#"
            className="hover:text-zinc-950 underline underline-offset-4"
          >
            Kebijakan Privasi
          </Link>
        </div>
      </div>

      {/* Giant Bottom Typography: 'PayBuy' matching reference typeface (Inter/SemiBold) */}
      <div className="w-full overflow-hidden select-none pointer-events-none sm:mt-1 leading-[0.88] pb-1 sm:pb-2">
        <div className="text-center font-semibold font-[family-name:var(--font-inter)] tracking-[-0.035em] text-white/40 text-[18vw] sm:text-[19.5vw] lg:text-[20.5vw] w-full block">
          PayBuy
        </div>
      </div>
    </footer>
  );
};

export const FooterSection = Footer;
export default Footer;
