import * as React from "react";
import Link from "next/link";
import { Receipt, CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  type?: "login" | "register" | "forgot-password";
}

export function AuthLayout({
  children,
  title,
  subtitle,
  type = "login",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-between selection:bg-[var(--leaf)] selection:text-white">
      {/* Top Bar Navigation */}
      <header className="w-full border-b border-[var(--line)] bg-white px-4 sm:px-8 py-3.5">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)] rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-[var(--leaf)] flex items-center justify-center shadow-subtle group-hover:bg-zinc-800 transition-colors">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl tracking-tight text-zinc-950 leading-none">
                PayBuy
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase text-zinc-500 mt-0.5">
                Kasir & Pesan Mandiri UMKM
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--muted)] hover:text-zinc-950 transition-colors py-1 px-2.5 rounded-md hover:bg-[var(--surface-2)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1020px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
          {/* Side Brand Information (Receipt-styled visual panel) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-6 bg-white border border-[var(--line)] rounded-xl p-7 shadow-subtle relative overflow-hidden">
            {/* Ticket Notches Accent */}
            <div className="ticket-notch-left top-1/2 -translate-y-1/2" aria-hidden="true" />
            <div className="ticket-notch-right top-1/2 -translate-y-1/2" aria-hidden="true" />

            <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--line)] text-[var(--forest)] text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--leaf)]" />
              <span>Multi-Tenant & Terisolasi Aman</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading font-semibold text-2xl text-[var(--ink)] leading-snug">
                Solusi Kasir & Pesan Mandiri untuk Warung dan Kafe
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Kelola menu, terima pembayaran QRIS & tunai, cetak satu QR seumur toko, dan biarkan dapur memasak dengan tenang.
              </p>
            </div>

            <div className="border-t border-dashed border-[var(--line-strong)] my-1" />

            {/* Value Points */}
            <div className="space-y-3.5 text-xs sm:text-sm text-[var(--ink)]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--leaf)] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-medium block">Pelanggan Tanpa Akun & Aplikasi</strong>
                  <span className="text-[var(--muted)] text-xs">
                    Pelanggan tinggal scan QR menu di meja atau konter dan langsung pesan.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--leaf)] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-medium block">Bayar Dulu, Masak Kemudian</strong>
                  <span className="text-[var(--muted)] text-xs">
                    Pesanan baru masuk ke layar dapur setelah pembayaran terkonfirmasi lunas.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--leaf)] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-medium block">Nomor Antrian Atomik & Reset Harian</strong>
                  <span className="text-[var(--muted)] text-xs">
                    Panggilan antrian rapi, tidak ada nomor ganda, reset otomatis per hari.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Paket Gratis Aktif Selamanya</span>
              <span className="font-medium text-[var(--leaf)]">0% Biaya Tersembunyi</span>
            </div>
          </div>

          {/* Form Card Container */}
          <div className="lg:col-span-7 bg-white border border-[var(--line)] rounded-xl p-6 sm:p-9 shadow-card relative">
            <div className="mb-6 sm:mb-8">
              <h1 className="font-heading font-semibold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--line)] bg-white py-4 px-4 text-center text-xs text-[var(--muted)]">
        <p>
          &copy; {new Date().getFullYear()} PayBuy. Sistem Kasir & Pemesanan Mandiri UMKM. Hak cipta dilindungi.
        </p>
      </footer>
    </div>
  );
}
