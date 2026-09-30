"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, AlertCircle, CheckCircle2, Loader2, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { forgotPasswordAction, AuthActionResult } from "@/lib/auth";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [formResult, setFormResult] = useState<AuthActionResult | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await forgotPasswordAction(null, formData);
      setFormResult(result);
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {formResult?.success && formResult.message && (
        <div
          role="status"
          className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--leaf)]/40 text-[var(--forest)] flex items-start gap-3 text-xs sm:text-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-[var(--leaf)] shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Tautan Terkirim</strong>
            <span>{formResult.message}</span>
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
            <strong className="font-semibold block">Gagal Mengirim Tautan</strong>
            <span>{formResult.error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <FormField
          id="email"
          label="Alamat Email Terdaftar"
          required
          helpText="Kami akan mengirimkan tautan untuk mengatur ulang kata sandi ke email ini."
        >
          <div className="relative">
            <Input
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
              <span>Mengirim Tautan...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Kirim Tautan Pemulihan</span>
            </>
          )}
        </Button>
      </form>

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
