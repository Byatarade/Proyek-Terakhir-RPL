"use client";

import React, { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  User,
  Mail,
  Lock,
  Globe,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import {
  registerOwnerAction,
  checkSlugAction,
  slugify,
  AuthActionResult,
  SlugCheckResult,
} from "@/lib/auth";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugCheckResult | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [formResult, setFormResult] = useState<AuthActionResult | null>(null);

  // Sync slug from store name until user manually edits slug
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStoreName(val);
    if (!isSlugManual) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManual(true);
    setSlug(slugify(e.target.value));
  };

  // Debounced check for slug availability
  const checkSlugDebounced = useCallback(async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 3) {
      setSlugStatus(null);
      return;
    }
    setIsCheckingSlug(true);
    try {
      const res = await checkSlugAction(slugToCheck);
      setSlugStatus(res);
    } catch {
      setSlugStatus(null);
    } finally {
      setIsCheckingSlug(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!slug || slug.length < 3) {
        setSlugStatus(null);
      } else {
        checkSlugDebounced(slug);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, checkSlugDebounced]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("slug", slug);

    startTransition(async () => {
      const result = await registerOwnerAction(null, formData);
      setFormResult(result);

      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  // If email verification is pending (FR-AU-02)
  if (formResult?.success && formResult.requiresEmailVerification) {
    return (
      <div className="py-6 px-4 text-center space-y-6 animate-stamp">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border-2 border-[var(--forest)] text-[var(--forest)] mx-auto flex items-center justify-center shadow-subtle">
          <Mail className="w-8 h-8 text-[var(--leaf)]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--line)] text-[var(--forest)] text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--leaf)]" />
            <span>Pendaftaran Akun Berhasil</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-[var(--ink)]">
            Periksa Kotak Masuk Email Anda
          </h2>
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
            Kami telah mengirimkan tautan aktivasi ke{" "}
            <strong className="text-[var(--ink)] font-semibold">{email}</strong>.
            Klik tautan tersebut untuk mengonfirmasi akun toko Anda dan memulai onboarding.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-left text-xs text-[var(--muted)] space-y-1.5 max-w-md mx-auto">
          <p className="font-semibold text-[var(--ink)]">Belum menerima email?</p>
          <p>
            1. Periksa folder <strong>Spam / Promosi</strong> di akun email Anda.
          </p>
          <p>
            2. Pastikan alamat email yang dimasukkan sudah benar.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/masuk?registered=true">
            <Button variant="secondary" size="md" className="gap-2">
              <span>Ke Halaman Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Callout */}
      {formResult?.error && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-[var(--danger)]/30 text-[var(--danger)] flex items-start gap-3 text-xs sm:text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Gagal Mendaftar</strong>
            <span>{formResult.error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Full Name */}
        <FormField
          id="fullName"
          label="Nama Pemilik Toko (Owner)"
          required
          helpText="Nama lengkap Anda sebagai penanggung jawab utama toko."
        >
          <div className="relative">
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Contoh: Budi Santoso"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isPending}
              className="pl-10"
            />
            <User
              className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </FormField>

        {/* Store Name */}
        <FormField
          id="storeName"
          label="Nama Toko / Usaha"
          required
          helpText="Nama warung, kafe, atau kedai yang akan tampil pada menu publik."
        >
          <div className="relative">
            <Input
              id="storeName"
              name="storeName"
              type="text"
              placeholder="Contoh: Kopi Kawan Senja"
              value={storeName}
              onChange={handleStoreNameChange}
              required
              disabled={isPending}
              className="pl-10"
            />
            <Store
              className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </FormField>

        {/* Store Slug (URL identifier) */}
        <FormField
          id="slug"
          label="Alamat Tautan Menu (Slug)"
          required
          helpText="Tautan unik untuk QR menu Anda. Terkunci dan tidak dapat diubah setelah toko dibuat."
        >
          <div className="space-y-1.5">
            <div className="relative">
              <Input
                id="slug"
                name="slug"
                type="text"
                placeholder="kopi-kawan-senja"
                value={slug}
                onChange={handleSlugChange}
                required
                disabled={isPending}
                className="pl-10 pr-24 font-mono text-xs sm:text-sm"
              />
              <Globe
                className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {isCheckingSlug ? (
                  <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Cek...</span>
                  </span>
                ) : slugStatus ? (
                  slugStatus.available ? (
                    <span className="text-[11px] font-semibold text-[var(--leaf)] flex items-center gap-1 bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--line)]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Tersedia</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[var(--danger)] flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-[var(--danger)]/30">
                      <AlertCircle className="w-3 h-3" />
                      <span>Dipakai</span>
                    </span>
                  )
                ) : null}
              </div>
            </div>

            {/* URL Preview */}
            <div className="p-2.5 rounded-md bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--muted)] flex items-center gap-1.5">
              <span className="font-semibold text-[var(--forest)] shrink-0">Pratinjau URL:</span>
              <span className="font-mono text-zinc-800 truncate">
                /t/{slug || "nama-toko"}
              </span>
            </div>
          </div>
        </FormField>

        {/* Business Email */}
        <FormField
          id="email"
          label="Alamat Email Akun"
          required
          helpText="Email untuk masuk dan menerima pemberitahuan operasional."
        >
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="budi@kopikawan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="password"
            label="Kata Sandi"
            required
            helpText="Minimal 8 karakter."
          >
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isPending}
                className="pl-10"
              />
              <Lock
                className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </FormField>

          <FormField
            id="confirmPassword"
            label="Konfirmasi Kata Sandi"
            required
            helpText="Ketik ulang kata sandi."
          >
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Ketik ulang kata sandi"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
        </div>

        {/* Terms Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--muted)] leading-relaxed select-none">
            <input
              type="checkbox"
              name="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
              className="mt-0.5 rounded border-[var(--control)] text-[var(--leaf)] focus:ring-[var(--leaf)] h-4 w-4"
            />
            <span>
              Saya menyetujui Ketentuan Layanan & Kebijakan Privasi PayBuy, serta memahami bahwa pendaftaran publik menetapkan saya sebagai pemilik (owner) toko.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending || (slugStatus !== null && !slugStatus.available)}
          className="w-full gap-2 text-base font-semibold shadow-subtle hover:shadow-card mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Membuat Toko & Akun...</span>
            </>
          ) : (
            <>
              <Store className="w-4 h-4" />
              <span>Daftar Toko Gratis</span>
            </>
          )}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="pt-4 border-t border-[var(--line)] text-center text-xs sm:text-sm text-[var(--muted)]">
        <span>Sudah memiliki akun toko? </span>
        <Link
          href="/masuk"
          className="font-semibold text-[var(--leaf)] hover:text-[var(--leaf-hover)] transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--leaf)] rounded"
        >
          Masuk di Sini
        </Link>
      </div>
    </div>
  );
}
