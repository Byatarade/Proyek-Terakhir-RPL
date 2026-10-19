import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  QrCode,
  Banknote,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { TicketCard, TicketPerforation } from "@/components/molecules/TicketCard";
import { Step3CompletionProps } from "./types";

export function Step3Completion({ store }: Step3CompletionProps) {
  const router = useRouter();

  return (
    <TicketCard className="p-6 sm:p-9 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-2">
        <span>Setup Onboarding Berhasil</span>
      </div>

      <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
        Toko {store.name} Siap Beroperasi!
      </h2>

      <p className="text-sm text-[var(--muted)] max-w-md mx-auto mt-2 leading-relaxed">
        Metode pembayaran toko Anda telah berhasil dikonfigurasi. Anda kini dapat mulai menyusun
        menu makanan/minuman dan mengunduh QR menu untuk dicetak.
      </p>

      <TicketPerforation className="my-6" />

      {/* Ringkasan Konfigurasi Toko */}
      <div className="max-w-md mx-auto bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-5 text-left space-y-3.5">
        <div>
          <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Toko
          </span>
          <span className="font-heading font-semibold text-base text-[var(--ink)]">
            {store.name}
          </span>
        </div>

        <div className="pt-2 border-t border-[var(--line)]">
          <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Metode Pembayaran Aktif
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {store.acceptQris && (
              <Badge variant="mint" size="sm">
                <QrCode className="w-3 h-3" />
                <span>QRIS Dinamis ({store.qrisMerchantName || "Aktif"})</span>
              </Badge>
            )}
            {store.acceptCash && (
              <Badge variant="forest" size="sm">
                <Banknote className="w-3 h-3" />
                <span>Tunai di Kasir</span>
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--line)]">
          <span className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider block">
            Tautan Menu Publik
          </span>
          <div className="flex items-center justify-between mt-1 text-xs font-mono text-[var(--leaf)] font-semibold">
            <span>paybuy.web.id/t/{store.slug}</span>
            <Link
              href={`/t/${store.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 hover:underline text-[var(--forest)]"
            >
              <span>Buka</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => router.push("/dashboard")}
          className="gap-2 w-full sm:w-auto"
        >
          <span>Buka Dashboard Toko</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Link href={`/t/${store.slug}`} target="_blank" className="w-full sm:w-auto">
          <Button type="button" variant="secondary" size="lg" className="gap-2 w-full">
            <ExternalLink className="w-4 h-4" />
            <span>Pratinjau Menu Pelanggan</span>
          </Button>
        </Link>
      </div>
    </TicketCard>
  );
}
