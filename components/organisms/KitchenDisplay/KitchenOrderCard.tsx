import React from "react";
import {
  ChefHat,
  Flame,
  Bell,
  Clock,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { KitchenOrderCardProps } from "./types";
import { formatCookingElapsedTime } from "./utils";

export function KitchenOrderCard({
  order,
  isProcessing,
  isCalled,
  isNew,
  onStartCooking,
  onMarkReady,
  onRecallCustomer,
}: KitchenOrderCardProps) {
  const formattedQueue = String(order.queueNumber).padStart(3, "0");
  const isCooking = order.status === "diproses";
  const elapsed = formatCookingElapsedTime(order.paidAt, order.createdAt);

  return (
    <div
      className={cn(
        "relative bg-white border-2 border-[var(--forest)] rounded-[8px] shadow-[4px_4px_0px_var(--forest)] flex flex-col justify-between overflow-hidden transition-all",
        isNew && "ring-4 ring-[var(--amber)] animate-pulse"
      )}
    >
      {/* 1. Status Strip 8px di Sisi Kiri (design.md 9.2) */}
      <div
        className={cn(
          "absolute top-0 bottom-0 left-0 w-2.5 z-10",
          order.status === "siap" && "bg-[var(--mint)] border-r border-[var(--forest)]",
          order.status === "diproses" && "bg-[var(--brick)]",
          order.status === "dibayar" && "bg-[var(--blue)]"
        )}
      />

      {/* Ticket Header */}
      <div className="p-4 pl-6 bg-white border-b-2 border-[var(--forest)] relative">
        {/* Left & Right Half-circle ticket notches on the border line (design.md 6.1 & 9.2) */}
        <div
          className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-[var(--bg)] border-2 border-[var(--forest)] z-20"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-[var(--bg)] border-2 border-[var(--forest)] z-20"
          aria-hidden="true"
        />

        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Nomor Antrian
            </span>
            {/* Nomor Antrian Layar Dapur 48px */}
            <div className="font-heading font-bold text-4xl sm:text-5xl text-[var(--forest)] tabular-nums tracking-tight leading-none mt-1">
              #{formattedQueue}
            </div>
          </div>

          <div className="text-right space-y-1.5">
            {/* Badge Status */}
            <div>
              {order.status === "siap" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[var(--mint)] text-[var(--forest)] border border-[var(--forest)] text-[11px] font-extrabold shadow-[1px_1px_0px_var(--forest)]">
                  <Bell className="w-3 h-3" />
                  <span>Siap Dipanggil</span>
                </span>
              ) : isCooking ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[var(--brick)] text-white text-[11px] font-bold">
                  <Flame className="w-3 h-3" />
                  <span>Sedang Dimasak</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[var(--blue)] text-white text-[11px] font-bold">
                  <ChefHat className="w-3 h-3" />
                  <span>Menunggu Masak</span>
                </span>
              )}
            </div>

            {/* Pewaktu Berjalan */}
            <div
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-bold tabular-nums",
                elapsed.level === "normal" && "text-[var(--forest)]",
                elapsed.level === "warning" && "text-amber-700 font-bold",
                elapsed.level === "danger" && "text-[var(--danger)] font-bold animate-pulse"
              )}
              title="Waktu berjalan sejak pesanan dibayar"
            >
              {elapsed.level === "danger" ? (
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>{elapsed.text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Body: Item List */}
      <div className="p-4 pl-6 flex-1 space-y-3 bg-[var(--bg)]/50">
        <div className="flex items-center justify-between border-b-2 border-dashed border-[var(--forest)] pb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)]">
            Menu yang Harus Dimasak
          </span>
          <span className="text-[10px] font-bold text-[var(--muted)]">
            Total: {order.items.reduce((acc, it) => acc + it.qty, 0)} Porsi
          </span>
        </div>

        <div className="space-y-2 py-1">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 text-sm sm:text-base leading-snug"
            >
              <span className="inline-flex items-center justify-center min-w-[32px] px-1.5 py-0.5 rounded-[4px] bg-white border border-[var(--forest)] font-heading font-extrabold text-[var(--forest)] text-xs tabular-nums shadow-[1px_1px_0px_var(--forest)]">
                {item.qty}×
              </span>
              <span className="font-semibold text-[var(--ink)] pt-0.5">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Footer / Action: Satu Tombol Besar (xl) di Bawah */}
      <div className="p-3 pl-5 bg-white border-t-2 border-[var(--forest)]">
        {order.status === "dibayar" ? (
          <Button
            variant="primary"
            size="xl"
            onClick={() => onStartCooking(order.id)}
            disabled={isProcessing}
            className="w-full gap-2 font-heading font-bold text-sm sm:text-base h-14 bg-[var(--brick)] hover:bg-[#9e4314] text-white border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memulai Proses...</span>
              </>
            ) : (
              <>
                <Flame className="w-5 h-5" />
                <span>Mulai Masak</span>
              </>
            )}
          </Button>
        ) : order.status === "diproses" ? (
          <Button
            variant="primary"
            size="xl"
            onClick={() => onMarkReady(order.id)}
            disabled={isProcessing}
            className="w-full gap-2 font-heading font-bold text-sm sm:text-base h-14 bg-[var(--leaf)] hover:bg-[var(--leaf-hover)] text-white border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menandai & Memanggil...</span>
              </>
            ) : (
              <>
                <Bell className="w-5 h-5" />
                <span>Tandai Siap & Panggil Pelanggan</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="xl"
            onClick={() => onRecallCustomer(order.id)}
            disabled={isProcessing}
            className={cn(
              "w-full gap-2 font-heading font-extrabold text-sm sm:text-base h-14 border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] cursor-pointer transition-all",
              isCalled
                ? "bg-[var(--leaf)] text-white"
                : "bg-[var(--mint)] hover:bg-[#8ecea0] text-[var(--forest)]"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memanggil...</span>
              </>
            ) : isCalled ? (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Telah Dipanggil ke Ponsel!</span>
              </>
            ) : (
              <>
                <Bell className="w-5 h-5 stroke-[2.5]" />
                <span>Panggil Ulang Pelanggan</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
