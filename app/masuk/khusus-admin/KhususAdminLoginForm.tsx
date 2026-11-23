"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { loginSuperadminAction } from "@/lib/superadmin/actions";

export function KhususAdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);

      const result = await loginSuperadminAction(null, formData);
      if (!result.success) {
        setError(result.error || "Gagal masuk. Periksa kembali email dan kata sandi.");
        return;
      }

      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  return (
    <AuthLayout
      type="login"
      title="Masuk ke Superadmin Portal"
      subtitle="Pusat kendali dan pengawasan seluruh toko UMKM pada platform PayBuy."
    >
      <div className="space-y-6">
        {/* Special Role Badge */}
        <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line-strong)] text-[var(--forest)] flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--leaf)]" />
            <span>Otoritas Khusus Platform Administrator</span>
          </div>
          <span className="font-heading font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[var(--line)]">
            Superadmin
          </span>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Gagal Masuk Superadmin</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <FormField
            label="Email Superadmin"
            id="superadmin-email"
            required
            helpText="Masukkan alamat email resmi pengelola platform"
          >
            <div className="relative">
              <Input
                id="superadmin-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email superadmin..."
                required
                autoComplete="off"
                className="pl-10"
              />
              <Mail
                className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </FormField>

          <FormField
            label="Kata Sandi"
            id="superadmin-password"
            required
          >
            <div className="relative">
              <Input
                id="superadmin-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                required
                className="pl-10 pr-10"
              />
              <Lock
                className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-black focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </FormField>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Control Center</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-[var(--line)] text-center">
          <Link
            href="/masuk"
            className="text-xs text-[var(--muted)] hover:text-[var(--forest)] font-medium transition-colors"
          >
            ← Bukan Administrator? Masuk ke Portal Toko
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
