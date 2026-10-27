"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  KeyRound,
  Check,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { updatePasswordAction, AuthActionResult } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

interface ResetPasswordFormProps {
  initialEmail?: string | null;
}

export function ResetPasswordForm({ initialEmail }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(initialEmail || null);
  const [formResult, setFormResult] = useState<AuthActionResult | null>(null);

  // Periksa apakah pengguna memiliki sesi pemulihan aktif
  useEffect(() => {
    const supabase = createClient();

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidSession(true);
        if (session.user?.email) {
          setUserEmail(session.user.email);
        }
      } else {
        // Beri sedikit toleransi jika hash URL sedang diproses Supabase
        const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (newSession) {
            setHasValidSession(true);
            if (newSession.user?.email) {
              setUserEmail(newSession.user.email);
            }
          } else {
            setHasValidSession(false);
          }
        });

        // Timeout fallback jika tidak ada sesi
        const timer = setTimeout(() => {
          setHasValidSession((prev) => (prev === null ? false : prev));
        }, 1500);

        return () => {
          listener.subscription.unsubscribe();
          clearTimeout(timer);
        };
      }
    }

    checkAuth();
  }, []);

  const isMinLength = password.length >= 8;
  const isMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updatePasswordAction(null, formData);
      setFormResult(result);

      if (result.success && result.redirectTo) {
        setTimeout(() => {
          router.push(result.redirectTo!);
          router.refresh();
        }, 1200);
      }
    });
  };

  // State: Sedang memeriksa sesi pemulihan
  if (hasValidSession === null) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <Loader2 className="w-8 h-8 text-[var(--leaf)] animate-spin" />
        <p className="text-sm text-[var(--muted)]">Memverifikasi tautan pemulihan kata sandi...</p>
      </div>
    );
  }

  // State: Sesi tidak ditemukan / kedaluwarsa
  if (hasValidSession === false && !formResult?.success) {
    return (
      <div className="space-y-6">
        <div
          role="alert"
          className="p-5 rounded-lg bg-red-50 border border-[var(--danger)]/30 text-[var(--danger)] flex items-start gap-3.5 text-xs sm:text-sm leading-relaxed"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block text-sm">Tautan Tidak Valid atau Sudah Kedaluwarsa</strong>
            <p>
              Tautan pemulihan kata sandi ini sudah tidak berlaku atau sesi telah habis. Silakan ajukan permohonan baru untuk mendapatkan tautan pemulihan yang aktif.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/lupa-sandi"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 text-white font-medium text-sm hover:bg-zinc-800 transition-colors shadow-subtle"
          >
            <KeyRound className="w-4 h-4" />
            <span>Minta Tautan Baru</span>
          </Link>
          <Link
            href="/masuk"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--line)] text-[var(--ink)] font-medium text-sm hover:bg-[var(--surface-2)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Masuk</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner info akun jika email terdeteksi */}
      {userEmail && (
        <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--ink)] flex items-center justify-between">
          <span className="text-[var(--muted)]">Mengatur ulang sandi untuk:</span>
          <span className="font-semibold text-zinc-900">{userEmail}</span>
        </div>
      )}

      {/* Success Banner */}
      {formResult?.success && (
        <div
          role="status"
          className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--leaf)]/40 text-[var(--forest)] flex items-start gap-3 text-xs sm:text-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-[var(--leaf)] shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Kata Sandi Berhasil Diperbarui!</strong>
            <span>{formResult.message} Mengalihkan ke halaman masuk...</span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {formResult?.error && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-[var(--danger)]/30 text-[var(--danger)] flex items-start gap-3 text-xs sm:text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Gagal Memperbarui Kata Sandi</strong>
            <span>{formResult.error}</span>
          </div>
        </div>
      )}

      {!formResult?.success && (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Kata Sandi Baru */}
          <FormField
            id="password"
            label="Kata Sandi Baru"
            required
            helpText="Gunakan minimal 8 karakter gabungan huruf dan angka."
          >
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                required
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
              />
              <Lock
                className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-zinc-900 transition-colors p-0.5 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FormField>

          {/* Konfirmasi Kata Sandi */}
          <FormField
            id="confirmPassword"
            label="Konfirmasi Kata Sandi Baru"
            required
            helpText="Ketik ulang kata sandi baru untuk memastikan kesesuaian."
          >
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Ketik ulang kata sandi baru"
                required
                disabled={isPending}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
              />
              <Lock
                className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-zinc-900 transition-colors p-0.5 rounded"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FormField>

          {/* Checklist Indikator Persyaratan */}
          <div className="p-3 rounded-lg bg-[var(--surface-2)]/60 border border-[var(--line)] space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                  isMinLength
                    ? "bg-[var(--leaf)] text-white"
                    : "bg-zinc-200 text-zinc-400"
                }`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className={isMinLength ? "text-[var(--forest)] font-medium" : "text-[var(--muted)]"}>
                Minimal 8 karakter
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                  isMatch
                    ? "bg-[var(--leaf)] text-white"
                    : "bg-zinc-200 text-zinc-400"
                }`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className={isMatch ? "text-[var(--forest)] font-medium" : "text-[var(--muted)]"}>
                Kata sandi cocok dan sama
              </span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isPending || !isMinLength || !isMatch}
            className="w-full gap-2 text-base font-semibold shadow-subtle hover:shadow-card mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Kata Sandi Baru...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Simpan Kata Sandi Baru</span>
              </>
            )}
          </Button>
        </form>
      )}

      <div className="pt-4 border-t border-[var(--line)] text-center text-xs sm:text-sm text-[var(--muted)]">
        <Link
          href="/masuk"
          className="font-semibold text-[var(--forest)] hover:text-black transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--leaf)] rounded"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>
      </div>
    </div>
  );
}
