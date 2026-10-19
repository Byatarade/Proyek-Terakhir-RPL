import React from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Tv,
  Volume2,
  VolumeX,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { KitchenHeaderProps } from "./types";

export function KitchenHeader({
  storeName,
  storeSlug,
  connectionStatus,
  soundEnabled,
  onToggleSound,
  isRefreshing,
  onRefresh,
}: KitchenHeaderProps) {
  return (
    <div className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-4 sm:p-5 shadow-[4px_4px_0px_var(--forest)] flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-[8px] bg-[var(--forest)] text-white flex items-center justify-center border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]">
          <UtensilsCrossed className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-[var(--forest)]">
              Layar Dapur & Antrian Masak
            </h1>
            {/* Indikator Koneksi (PRD FR-KT-05) */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] border text-[11px] font-bold",
                connectionStatus === "connected" &&
                  "bg-[var(--surface-2)] text-[var(--forest)] border-[var(--forest)]",
                connectionStatus === "connecting" &&
                  "bg-amber-50 text-amber-800 border-amber-600 animate-pulse",
                connectionStatus === "disconnected" &&
                  "bg-red-50 text-red-800 border-red-600"
              )}
              title="Status sinkronisasi langsung dengan server"
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  connectionStatus === "connected" && "bg-[var(--leaf)]",
                  connectionStatus === "connecting" && "bg-amber-500",
                  connectionStatus === "disconnected" && "bg-red-500"
                )}
              />
              <span>
                {connectionStatus === "connected"
                  ? "Live Terhubung"
                  : connectionStatus === "connecting"
                  ? "Menghubungkan..."
                  : "Terputus (Polling)"}
              </span>
            </div>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Toko: <strong className="text-[var(--forest)]">{storeName}</strong> • Pesanan yang sudah dibayar otomatis masuk ke sini untuk dimasak koki.
          </p>
        </div>
      </div>

      {/* Toolbar Dapur: Audio Toggle, Refresh, Link Layar Antrian TV */}
      <div className="flex flex-wrap items-center gap-2">
        {storeSlug && (
          <Link
            href={`/t/${storeSlug}/antrian`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] bg-white hover:bg-[var(--surface-2)] text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-semibold transition-all"
          >
            <Tv className="w-4 h-4 stroke-[2.2]" />
            <span>Buka Layar Antrian TV</span>
          </Link>
        )}

        <button
          type="button"
          onClick={onToggleSound}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-semibold transition-all cursor-pointer",
            soundEnabled
              ? "bg-[var(--surface-2)] text-[var(--forest)]"
              : "bg-white text-[var(--muted)]"
          )}
          title={soundEnabled ? "Suara lonceng aktif saat pesanan masuk" : "Suara lonceng nonaktif"}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-[var(--leaf)]" />
              <span>Bel Aktif</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-[var(--muted)]" />
              <span>Bel Hening</span>
            </>
          )}
        </button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-1.5 text-xs font-semibold h-[38px] shadow-[2px_2px_0px_var(--forest)] cursor-pointer"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          <span>Segarkan</span>
        </Button>
      </div>
    </div>
  );
}
