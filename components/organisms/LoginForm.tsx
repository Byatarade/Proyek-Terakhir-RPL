"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { loginUserAction, AuthActionResult } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next") || "/dashboard";
  const errorParam = searchParams.get("error");
  const registeredParam = searchParams.get("registered");
  const verifiedParam = searchParams.get("verified");

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const emailInputRef = React.useRef<HTMLInputElement>(null);

  // Muat email tersimpan jika sebelumnya memilih Ingat Saya
  React.useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("paybuy_remember_email");
      if (savedEmail && emailInputRef.current) {
        emailInputRef.current.value = savedEmail;
      }
    } catch {
      // Abaikan error localStorage
    }
  }, []);

  const [formState, setFormState] = useState<AuthActionResult | null>(() => {
    if (errorParam === "inactive") {
      return {
        success: false,
        error:
          "Akun Anda telah dinonaktifkan oleh pemilik toko. Silakan hubungi pengelola.",
      };
    }
    return null;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("next", nextParam);
    formData.set("remember_me", rememberMe ? "true" : "false");

    const email = (formData.get("email") as string) || "";
    try {
      if (rememberMe && email) {
        localStorage.setItem("paybuy_remember_email", email);
      } else {
        localStorage.removeItem("paybuy_remember_email");
      }
    } catch {
      // Abaikan error localStorage
    }

    startTransition(async () => {
      const result = await loginUserAction(null, formData);
      setFormState(result);

      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Banners */}
      {registeredParam && (
        <div
          role="status"
          className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--leaf)]/40 text-[var(--forest)] flex items-start gap-3 text-xs sm:text-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-[var(--leaf)] shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Pendaftaran Berhasil!</strong>
            <span>Silakan masuk menggunakan email dan kata sandi yang telah didaftarkan.</span>
          </div>
        </div>
      )}

      {verifiedParam && (
        <div
          role="status"
          className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--leaf)]/40 text-[var(--forest)] flex items-start gap-3 text-xs sm:text-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-[var(--leaf)] shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Email Terverifikasi!</strong>
            <span>Email Anda telah berhasil diverifikasi. Silakan masuk ke akun Anda.</span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {formState?.error && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-[var(--danger)]/30 text-[var(--danger)] flex items-start gap-3 text-xs sm:text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Gagal Masuk</strong>
            <span>{formState.error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <input type="hidden" name="next" value={nextParam} />

        {/* Email Field */}
        <FormField id="email" label="Alamat Email" required>
          <div className="relative">
            <Input
              ref={emailInputRef}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@tokomu.com"
              required
              disabled={isPending}
              className="pl-10"
            />
            <Mail
              className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </FormField>

        {/* Password Field */}
        <FormField id="password" label="Kata Sandi" required>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan kata sandi"
              required
              disabled={isPending}
              className="pl-10 pr-10"
            />
            <Lock
              className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)] focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </FormField>

        {/* Remember Me Checkbox & Forgot Password Link */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="remember_me"
              id="remember_me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--leaf)] border-2 border-[var(--forest)] focus:ring-[var(--leaf)] cursor-pointer"
            />
            <span className="text-xs font-medium text-[var(--ink)]">
              Ingat saya
            </span>
          </label>

          <Link
            href="/lupa-sandi"
            className="text-xs font-semibold text-[var(--leaf)] hover:text-[var(--leaf-hover)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--leaf)] rounded shrink-0"
          >
            Lupa kata sandi?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="w-full gap-2 text-base font-semibold shadow-subtle hover:shadow-card"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Akun Toko</span>
            </>
          )}
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="pt-4 border-t border-[var(--line)] text-center text-xs sm:text-sm text-[var(--muted)]">
        <span>Belum memiliki akun toko? </span>
        <Link
          href="/daftar"
          className="font-semibold text-[var(--leaf)] hover:text-[var(--leaf-hover)] transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--leaf)] rounded"
        >
          Daftar Toko Gratis
        </Link>
      </div>
    </div>
  );
}
