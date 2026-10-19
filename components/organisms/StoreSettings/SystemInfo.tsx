import React from "react";
import { ShieldCheck } from "lucide-react";
import { StoreDetailData } from "@/lib/stores/actions";

interface SystemInfoProps {
  storeData: StoreDetailData | null;
}

export function SystemInfo({ storeData }: SystemInfoProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <section className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-5 sm:p-6 shadow-[3px_3px_0px_var(--forest)] space-y-5">
        <div>
          <h2 className="font-heading font-bold text-base text-[var(--forest)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--forest)]" />
            <span>Informasi Akun Toko</span>
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Rincian langganan paket toko dan metadata sistem PayBuy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">
              Paket Langganan
            </span>
            <div className="font-heading font-extrabold text-lg text-[var(--forest)] uppercase">
              {storeData?.plan === "maximal"
                ? "Paket Maximal"
                : storeData?.plan === "pro"
                ? "Paket Pro"
                : "Paket Gratis (Free)"}
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              Mendukung menu mandiri tanpa batas, QRIS dinamis, dan sistem POS
              kasir.
            </p>
          </div>

          <div className="p-4 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">
              Terdaftar Sejak
            </span>
            <div className="font-heading font-bold text-base text-[var(--forest)]">
              {storeData?.createdAt
                ? new Date(storeData.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              ID Toko:{" "}
              <span className="font-mono text-[10px]">{storeData?.id}</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
