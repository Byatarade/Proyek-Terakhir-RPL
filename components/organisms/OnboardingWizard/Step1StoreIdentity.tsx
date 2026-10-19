import React from "react";
import {
  Store,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { TicketCard } from "@/components/molecules/TicketCard";
import { Step1StoreIdentityProps } from "./types";

export function Step1StoreIdentity({
  store,
  copiedLink,
  onCopyPublicUrl,
  onNext,
}: Step1StoreIdentityProps) {
  return (
    <TicketCard className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
          <Store className="w-6 h-6 text-[var(--leaf)]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-semibold text-2xl text-[var(--ink)]">
              Identitas Toko Anda
            </h2>
            <Badge variant="mint" size="sm">
              Aktif
            </Badge>
          </div>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Konfirmasi nama toko dan alamat tautan menu publik Anda.
          </p>
        </div>
      </div>

      <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl p-5 space-y-4 mb-6">
        <div>
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">
            Nama Toko
          </span>
          <p className="font-heading font-semibold text-xl text-[var(--ink)] mt-0.5">
            {store.name}
          </p>
        </div>

        <div className="pt-3 border-t border-[var(--line)]">
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">
            Tautan Menu Publik Pelanggan (QR Menu)
          </span>
          <div className="mt-1.5 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <code className="px-3 py-2 bg-white border border-[var(--line)] rounded-lg text-sm font-mono text-[var(--leaf)] font-semibold flex-1 select-all break-all">
              paybuy.web.id/t/{store.slug}
            </code>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCopyPublicUrl}
              className="gap-1.5 shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-[var(--muted)] mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Satu tautan dan satu QR seumur toko. Menu dapat diperbarui tanpa mencetak ulang QR.
            </span>
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onNext}
          className="gap-2"
        >
          <span>Lanjut ke Pengaturan Pembayaran</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </TicketCard>
  );
}
