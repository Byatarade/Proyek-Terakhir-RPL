"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { TicketPerforation } from "@/components/molecules/TicketCard";
import { resendVerificationEmailAction } from "@/lib/auth/actions";

interface EmailVerificationPendingProps {
  email: string;
  storeName?: string;
  slug?: string;
  onBackToEdit?: () => void;
}

export function EmailVerificationPending({
  email,
  storeName,
  slug,
  onBackToEdit,
}: EmailVerificationPendingProps) {
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Deteksi provider email untuk shortcut buka webmail langsung
  const getEmailProviderLink = (emailStr: string) => {
    const domain = emailStr.split("@")[1]?.toLowerCase();
    if (!domain) return null;

    if (domain === "gmail.com" || domain === "googlemail.com") {
      return {
        name: "Buka Google Mail (Gmail)",
        url: "https://mail.google.com",
      };
    }
    if (domain === "yahoo.com" || domain === "yahoo.co.id") {
      return {
        name: "Buka Yahoo Mail",
        url: "https://mail.yahoo.com",
      };
    }
    if (
      domain === "outlook.com" ||
      domain === "hotmail.com" ||
      domain === "live.com"
    ) {
      return {
        name: "Buka Microsoft Outlook",
        url: "https://outlook.live.com",
      };
    }
    return {
      name: "Buka Aplikasi Email",
      url: `mailto:${emailStr}`,
    };
  };

  const provider = getEmailProviderLink(email);

  // Countdown timer untuk tombol kirim ulang
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setResendStatus(null);

    try {
      const res = await resendVerificationEmailAction(email);
      if (res.success) {
        setResendStatus({
          success: true,
          message: res.message || "Tautan verifikasi baru berhasil dikirim!",
        });
        setCooldown(60); // 60 detik cooldown
      } else {
        setResendStatus({
          success: false,
          message: res.error || "Gagal mengirim ulang email.",
        });
      }
    } catch {
      setResendStatus({
        success: false,
        message: "Terjadi kesalahan koneksi saat mengirim email.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="py-2 space-y-6 text-left transform-none rotate-0">
      {/* Stepper Indikator Sederhana */}
      <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[var(--forest)] font-semibold">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
            ✓
          </span>
          <span className="hidden sm:inline">1. Isi Data Toko</span>
        </div>
        <div className="h-0.5 w-6 bg-emerald-400 mx-1" />
        <div className="flex items-center gap-2 text-[var(--leaf)] font-medium">
          <span className="w-5 h-5 rounded-full bg-[var(--leaf)] text-white flex items-center justify-center text-[10px] animate-pulse">
            2
          </span>
          <span>Verifikasi Email</span>
        </div>
        <div className="h-0.5 w-6 bg-[var(--line)] mx-1" />
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <span className="w-5 h-5 rounded-full bg-white border border-[var(--line)] text-[var(--muted)] flex items-center justify-center text-[10px]">
            3
          </span>
          <span className="hidden sm:inline">Setup QRIS</span>
        </div>
      </div>

      {/* Header Pengumuman */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-[var(--leaf)] mx-auto flex items-center justify-center shadow-subtle relative">
          <Mail className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white animate-ping" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pendaftaran Berhasil</span>
          </div>
          <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
            Periksa Kotak Masuk Email Anda
          </h2>
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto mt-1 leading-relaxed">
            Kami telah mengirimkan tautan aktivasi akun toko PayBuy ke alamat email berikut:
          </p>
        </div>
      </div>

      {/* Karcis Rincian Pendaftaran Toko (Nota Style) */}
      <div className="bg-white border-2 border-[var(--line-strong)]/80 rounded-2xl p-5 shadow-card relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
          <span className="font-mono text-xs text-[var(--muted)] uppercase tracking-wider font-medium">
            Tujuan Aktivasi
          </span>
          <Badge variant="amber" size="sm">
            <Clock className="w-3 h-3" />
            <span>Menunggu Konfirmasi</span>
          </Badge>
        </div>

        <div className="py-3 space-y-2">
          <div className="font-mono text-base sm:text-lg font-semibold text-[var(--forest)] break-all flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--leaf)] shrink-0" />
            <span>{email}</span>
          </div>

          {(storeName || slug) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 text-[var(--muted)]">
              {storeName && (
                <div>
                  <span className="block text-[11px] font-medium uppercase">Toko:</span>
                  <span className="font-semibold text-[var(--ink)]">{storeName}</span>
                </div>
              )}
              {slug && (
                <div>
                  <span className="block text-[11px] font-medium uppercase">Tautan Menu:</span>
                  <span className="font-mono font-semibold text-[var(--leaf)]">paybuy.byatara.dev/t/{slug}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <TicketPerforation className="my-2" />

        <div className="text-xs text-[var(--muted)] flex items-start gap-2">
          <span>
            Buka email tersebut lalu klik tombol <strong>&ldquo;Konfirmasi Akun&rdquo;</strong> untuk
            langsung melanjutkan ke halaman <strong>Pengaturan QRIS Toko</strong>.
          </span>
        </div>
      </div>

      {/* Tombol Pintas Buka Email */}
      {provider && (
        <a
          href={provider.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <Button variant="primary" size="lg" className="w-full gap-2 text-sm sm:text-base">
            <ExternalLink className="w-4 h-4" />
            <span>{provider.name}</span>
          </Button>
        </a>
      )}

      {/* Status Notifikasi Pengiriman Ulang */}
      {resendStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
            resendStatus.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {resendStatus.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{resendStatus.message}</span>
        </div>
      )}

      {/* Informasi Bantuan & Troubleshooting */}
      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--muted)] space-y-2">
        <p className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[var(--leaf)]" />
          <span>Belum menerima email dari PayBuy?</span>
        </p>
        <ul className="space-y-1 list-disc list-inside text-[var(--muted)] pl-1">
          <li>
            Tunggu 1–2 menit, lalu periksa tab <strong>Spam / Junk / Promosi</strong> di email Anda.
          </li>
          <li>Pastikan penyimpanan akun email Anda tidak dalam keadaan penuh.</li>
        </ul>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)]">
          <button
            type="button"
            disabled={cooldown > 0 || isResending}
            onClick={handleResend}
            className="text-xs font-semibold text-[var(--leaf)] hover:underline inline-flex items-center gap-1.5 disabled:opacity-50 disabled:no-underline cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
            <span>
              {cooldown > 0
                ? `Kirim ulang tersedia dalam ${cooldown} detik`
                : "Kirim Ulang Email Konfirmasi"}
            </span>
          </button>

          {onBackToEdit && (
            <button
              type="button"
              onClick={onBackToEdit}
              className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Salah ketik email? Ubah</span>
            </button>
          )}
        </div>
      </div>

      {/* Tombol ke Halaman Masuk */}
      <div className="pt-2 flex items-center justify-center">
        <Link href="/masuk?registered=true" className="w-full sm:w-auto">
          <Button variant="secondary" size="md" className="gap-2 w-full text-xs sm:text-sm">
            <span>Sudah Konfirmasi? Masuk ke Akun Toko</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
