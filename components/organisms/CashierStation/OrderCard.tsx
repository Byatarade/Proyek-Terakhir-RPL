"use client";

import React, { useTransition, useState } from "react";
import {
  CheckCircle2,
  Volume2,
  XCircle,
  Banknote,
  QrCode,
  Flame,
  Check,
  X,
  AlertTriangle,
  Clock,
  Loader2,
  Printer,
  AlertCircle,
} from "lucide-react";
import {
  CashierOrder,
  confirmOrderPaymentAction,
  updateOrderStatusAction,
  cancelOrderAction,
} from "@/lib/cashier/actions";
import { callCustomerOrderAction } from "@/lib/kitchen/actions";
import { formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { callQueueVoice, formatElapsedTime } from "./audio";

/** Peta konfigurasi warna & label berdasarkan status pesanan */
const STATUS_CONFIG: Record<
  string,
  { label: string; borderClass: string; stripClass: string; badgeClass: string }
> = {
  menunggu_bayar: {
    label: "Menunggu Bayar",
    borderClass: "border-amber-400",
    stripClass: "bg-amber-400",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
  },
  dibayar: {
    label: "Sudah Dibayar",
    borderClass: "border-[var(--leaf)]",
    stripClass: "bg-[var(--leaf)]",
    badgeClass: "bg-[var(--surface-2)] text-[var(--forest)] border-[var(--line)]",
  },
  diproses: {
    label: "Sedang Dimasak",
    borderClass: "border-[var(--blue)]",
    stripClass: "bg-[var(--blue)]",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
  },
  siap: {
    label: "Siap Diambil",
    borderClass: "border-[var(--forest)]",
    stripClass: "bg-[var(--leaf)] ring-2 ring-[var(--forest)]",
    badgeClass:
      "bg-[var(--mint)] text-[var(--forest)] border-[var(--forest)] font-extrabold",
  },
  diambil: {
    label: "Sudah Diambil",
    borderClass: "border-zinc-300",
    stripClass: "bg-zinc-300",
    badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  dibatalkan: {
    label: "Dibatalkan",
    borderClass: "border-red-300",
    stripClass: "bg-red-500",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
  kedaluwarsa: {
    label: "Kedaluwarsa",
    borderClass: "border-zinc-300",
    stripClass: "bg-zinc-400",
    badgeClass: "bg-zinc-100 text-zinc-500 border-zinc-200",
  },
};

interface OrderCardProps {
  order: CashierOrder;
  /** ID order yang sedang diproses aksi (untuk disable tombol) */
  processingOrderId: string | null;
  /** ID order yang sedang ditandai "memanggil" (animasi panggil) */
  calledOrderId: string | null;
  onOrdersUpdate: (updater: (prev: CashierOrder[]) => CashierOrder[]) => void;
  onProcessingChange: (id: string | null) => void;
  onCalledChange: (id: string | null) => void;
  onOpenReceipt: (order: CashierOrder) => void;
  onOpenCancel: (order: CashierOrder) => void;
}

/**
 * OrderCard — Kartu tiket untuk satu pesanan beserta seluruh tombol aksi kasir.
 * Mengelola state loading lokal untuk transitioning tombol.
 */
export function OrderCard({
  order,
  processingOrderId,
  calledOrderId,
  onOrdersUpdate,
  onProcessingChange,
  onCalledChange,
  onOpenReceipt,
  onOpenCancel,
}: OrderCardProps) {
  const [isPending, startTransition] = useTransition();

  const formattedQueue = String(order.queueNumber).padStart(3, "0");
  const elapsed = formatElapsedTime(order.createdAt);
  const isCallActive = calledOrderId === order.id;
  const isThisPending = processingOrderId === order.id && isPending;

  const statusConfig = STATUS_CONFIG[order.status] || {
    label: order.status,
    borderClass: "border-zinc-200",
    stripClass: "bg-zinc-300",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };

  // Handler: Konfirmasi Bayar Tunai
  const handleConfirmPayment = () => {
    onProcessingChange(order.id);
    startTransition(async () => {
      const res = await confirmOrderPaymentAction(order.id);
      if (res.success) {
        onOrdersUpdate((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: "dibayar",
                  paidConfirmedBy: "cashier",
                  paidAt: new Date().toISOString(),
                }
              : o
          )
        );
      }
      onProcessingChange(null);
    });
  };

  // Handler: Mulai Masak
  const handleStartCooking = () => {
    onProcessingChange(order.id);
    startTransition(async () => {
      const res = await updateOrderStatusAction(
        order.id,
        "diproses",
        "Kasir memulai proses masak"
      );
      if (res.success) {
        onOrdersUpdate((prev) =>
          prev.map((o) =>
            o.id === order.id ? { ...o, status: "diproses" } : o
          )
        );
      }
      onProcessingChange(null);
    });
  };

  // Handler: Selesai Masak & Panggil
  const handleFinishCookingAndCall = () => {
    onProcessingChange(order.id);
    startTransition(async () => {
      const res = await updateOrderStatusAction(
        order.id,
        "siap",
        "Pesanan selesai dimasak dan dipanggil oleh kasir"
      );
      if (res.success) {
        onOrdersUpdate((prev) =>
          prev.map((o) =>
            o.id === order.id ? { ...o, status: "siap" } : o
          )
        );
        callQueueVoice(order.queueNumber);
        onCalledChange(order.id);
        setTimeout(() => onCalledChange(null), 3000);
        callCustomerOrderAction(order.id).catch(() => {});
      }
      onProcessingChange(null);
    });
  };

  // Handler: Panggil Ulang
  const handleCallQueue = () => {
    callQueueVoice(order.queueNumber);
    onCalledChange(order.id);
    setTimeout(() => onCalledChange(null), 3000);
    callCustomerOrderAction(order.id).catch(() => {});
  };

  // Handler: Tandai Sudah Diambil
  const handleMarkTaken = () => {
    onProcessingChange(order.id);
    startTransition(async () => {
      const res = await updateOrderStatusAction(
        order.id,
        "diambil",
        "Pesanan diserahkan kasir kepada pelanggan"
      );
      if (res.success) {
        onOrdersUpdate((prev) =>
          prev.map((o) =>
            o.id === order.id ? { ...o, status: "diambil" } : o
          )
        );
      }
      onProcessingChange(null);
    });
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] overflow-hidden flex flex-col relative transition-all",
        order.status === "siap" && "ring-2 ring-[var(--forest)]",
        order.status === "diambil" && "opacity-75 shadow-none border-zinc-300"
      )}
    >
      {/* Takik Karcis Retro Kiri & Kanan */}
      <div className="ticket-notch-left top-[98px]" />
      <div className="ticket-notch-right top-[98px]" />

      {/* Strip Status Vertikal Sisi Kiri */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-2", statusConfig.stripClass)} />

      {/* ── 1. Header Ticket ── */}
      <div className="pl-5 pr-4 pt-4 pb-3.5 border-b-2 border-dashed border-[var(--line)] bg-zinc-50/50">
        <div className="flex items-start justify-between gap-2">
          {/* Nomor Antrian Besar */}
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 block">
              No. Antrian
            </span>
            <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[var(--forest)] tracking-tight tabular-nums">
              {formattedQueue}
            </div>
          </div>

          {/* Status Badge & Elapsed Timer */}
          <div className="flex flex-col items-end space-y-1.5">
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider",
                statusConfig.badgeClass
              )}
            >
              {statusConfig.label}
            </span>
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold font-mono",
                elapsed.level === "danger" && "text-red-600 font-bold",
                elapsed.level === "warning" && "text-amber-700",
                elapsed.level === "normal" && "text-zinc-500"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{elapsed.text}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Badge & Tanda Khusus Pelanggan (FR-KS-08) */}
        <div className="flex items-center flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-zinc-200/60">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase",
              order.paymentMethod === "cash"
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "bg-emerald-100 text-emerald-900 border border-emerald-300"
            )}
          >
            {order.paymentMethod === "cash" ? (
              <>
                <Banknote className="w-3 h-3" />
                <span>Bayar Tunai</span>
              </>
            ) : (
              <>
                <QrCode className="w-3 h-3" />
                <span>QRIS</span>
              </>
            )}
          </span>

          {/* Penanda Khusus: Hanya Dikonfirmasi Pelanggan (BR-09) */}
          {order.paidConfirmedBy === "customer" &&
            order.status !== "menunggu_bayar" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold animate-pulse">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>Cek Bukti Bayar</span>
              </span>
            )}

          {order.paidConfirmedBy === "cashier" && (
            <span className="text-[10px] font-medium text-zinc-500 ml-auto">
              Lunas di Kasir
            </span>
          )}
        </div>
      </div>

      {/* ── 2. Daftar Menu & Harga ── */}
      <div className="p-4 pl-5 flex-1 space-y-2.5">
        <div className="space-y-1.5">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-baseline justify-between text-xs text-zinc-800"
            >
              <div className="flex items-baseline gap-1.5 max-w-[70%]">
                <span className="font-extrabold text-[var(--forest)] tabular-nums">
                  {item.qty}×
                </span>
                <span className="font-medium text-zinc-900 truncate">
                  {item.name}
                </span>
              </div>
              <span className="font-semibold text-zinc-600 tabular-nums">
                {formatRupiah(item.price * item.qty)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="pt-2.5 border-t border-dashed border-[var(--line)] flex items-baseline justify-between">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Total Bayar
          </span>
          <span className="font-heading font-extrabold text-base text-[var(--forest)] tabular-nums">
            {formatRupiah(order.total)}
          </span>
        </div>

        {/* Alasan Batal */}
        {order.cancelReason && (
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 leading-tight">
            <strong>Dibatalkan:</strong> {order.cancelReason}
          </div>
        )}
      </div>

      {/* ── 3. Tombol Aksi Kasir ── */}
      <div className="p-3 pl-4 bg-zinc-50 border-t border-[var(--line)]">
        {/* Status SIAP */}
        {order.status === "siap" && (
          <div className="space-y-2 w-full">
            <Button
              variant="primary"
              size="md"
              onClick={handleMarkTaken}
              disabled={isThisPending}
              className="w-full gap-2 font-bold text-xs sm:text-sm h-11 shadow-[2px_2px_0px_var(--forest)] whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5"
            >
              {isThisPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[3]" />
              )}
              <span>Tandai Sudah Diambil</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handleCallQueue}
                className={cn(
                  "flex-1 gap-1.5 text-xs font-bold h-10 transition-all whitespace-nowrap",
                  isCallActive &&
                    "bg-[var(--mint)] border-[var(--forest)] text-[var(--forest)] font-extrabold ring-2 ring-[var(--forest)]"
                )}
                title="Panggil nomor antrian via speaker"
              >
                <Volume2
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isCallActive && "animate-bounce text-[var(--forest)]"
                  )}
                />
                <span>{isCallActive ? "Memanggil..." : "Panggil Antrian"}</span>
              </Button>

              <button
                type="button"
                onClick={() => onOpenReceipt(order)}
                title="Cetak struk nota"
                className="p-2.5 rounded-xl border border-zinc-300 hover:bg-white text-zinc-700 hover:text-[var(--forest)] transition-colors h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenCancel(order)}
                title="Batalkan pesanan ini"
                className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Status selain SIAP */}
        {order.status !== "siap" && (
          <div className="space-y-2 w-full">
            {/* MENUNGGU BAYAR → Konfirmasi */}
            {order.status === "menunggu_bayar" && (
              <div className="flex items-center gap-2 w-full">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConfirmPayment}
                  disabled={isThisPending}
                  className="flex-1 gap-2 font-bold text-xs sm:text-sm h-11 shadow-[2px_2px_0px_var(--forest)] whitespace-nowrap"
                >
                  {isThisPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Konfirmasi Bayar</span>
                </Button>

                <button
                  type="button"
                  onClick={() => onOpenReceipt(order)}
                  title="Cetak struk nota"
                  className="p-2.5 rounded-xl border border-zinc-300 hover:bg-white text-zinc-700 hover:text-[var(--forest)] transition-colors h-11 w-11 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenCancel(order)}
                  title="Batalkan pesanan ini"
                  className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors h-11 w-11 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* DIBAYAR → Mulai Masak */}
            {order.status === "dibayar" && (
              <div className="flex items-center gap-2 w-full">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStartCooking}
                  disabled={isThisPending}
                  className="flex-1 gap-2 font-bold text-xs sm:text-sm h-11 bg-amber-500 hover:bg-amber-600 text-white border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  {isThisPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Flame className="w-4 h-4 fill-amber-200 text-white" />
                  )}
                  <span>Mulai Dimasak</span>
                </Button>

                <button
                  type="button"
                  onClick={() => onOpenReceipt(order)}
                  title="Cetak struk nota"
                  className="p-2.5 rounded-xl border border-zinc-300 hover:bg-white text-zinc-700 hover:text-[var(--forest)] transition-colors h-11 w-11 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenCancel(order)}
                  title="Batalkan pesanan ini"
                  className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors h-11 w-11 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* DIPROSES → Selesai Masak & Panggil */}
            {order.status === "diproses" && (
              <div className="space-y-2 w-full">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleFinishCookingAndCall}
                  disabled={isThisPending}
                  className="w-full gap-2 font-bold text-xs sm:text-sm h-11 bg-[var(--leaf)] hover:bg-[#156336] text-white border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  {isThisPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[var(--mint)] animate-pulse" />
                  )}
                  <span>Selesai Masak & Panggil</span>
                </Button>

                <div className="flex items-center gap-2">
                  <span className="flex-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
                    <span className="truncate">Sedang dimasak di dapur</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onOpenReceipt(order)}
                    title="Cetak struk nota"
                    className="p-2.5 rounded-xl border border-zinc-300 hover:bg-white text-zinc-700 hover:text-[var(--forest)] transition-colors h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenCancel(order)}
                    title="Batalkan pesanan ini"
                    className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SELESAI / DIBATALKAN / KEDALUWARSA */}
            {["diambil", "dibatalkan", "kedaluwarsa"].includes(
              order.status
            ) && (
              <div className="flex items-center justify-between gap-2 w-full pt-1">
                <span className="text-xs text-zinc-500 font-medium">
                  {order.status === "diambil"
                    ? "Pesanan telah diserahkan"
                    : "Pesanan tidak aktif"}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenReceipt(order)}
                  title="Cetak struk nota"
                  className="p-2 rounded-lg border border-zinc-300 hover:bg-white text-zinc-700 hover:text-[var(--forest)] transition-colors h-9 w-9 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// CancelModal — Modal konfirmasi pembatalan pesanan
// ──────────────────────────────────────────────────────────

interface CancelModalProps {
  order: CashierOrder;
  cancelReason: string;
  isCancelling: boolean;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function CancelModal({
  order,
  cancelReason,
  isCancelling,
  onReasonChange,
  onConfirm,
  onClose,
}: CancelModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-heading font-bold text-base">
              Batalkan Pesanan #{String(order.queueNumber).padStart(3, "0")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed font-normal">
          Pesanan sebesar <strong>{formatRupiah(order.total)}</strong> akan
          dibatalkan. Tindakan ini akan dicatat pada riwayat audit status
          pesanan.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-800 block">
            Pilih atau Tulis Alasan Pembatalan:
          </label>

          <div className="flex flex-wrap gap-1.5 pb-1">
            {[
              "Pelanggan membatalkan pesanan",
              "Pelanggan tidak bayar / tidak hadir",
              "Bahan menu habis",
              "Pesanan dobel / salah input",
            ].map((reason, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onReasonChange(reason)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer",
                  cancelReason === reason
                    ? "bg-red-50 text-red-800 border-red-300 font-bold"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                )}
              >
                {reason}
              </button>
            ))}
          </div>

          <textarea
            value={cancelReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Tulis alasan singkat pembatalan..."
            rows={2}
            className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isCancelling}
            className="text-xs"
          >
            Batal
          </Button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isCancelling || !cancelReason.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-[2px_2px_0px_#7f1d1d] cursor-pointer transition-all"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Membatalkan...</span>
              </>
            ) : (
              <span>Ya, Batalkan Pesanan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// ReceiptModal — Modal cetak struk nota
// ──────────────────────────────────────────────────────────

interface ReceiptModalProps {
  order: CashierOrder;
  storeName: string;
  onClose: () => void;
}

export function ReceiptModal({ order, storeName, onClose }: ReceiptModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
      <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <span className="font-heading font-bold text-sm text-[var(--forest)]">
            Pratinjau Struk Kasir
          </span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Area Kertas Struk 58mm POS */}
        <div
          id="printable-receipt"
          className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 font-mono text-xs text-zinc-900 space-y-3"
        >
          <div className="text-center space-y-0.5 border-b border-dashed border-zinc-400 pb-2">
            <div className="font-bold text-sm uppercase">{storeName}</div>
            <div className="text-[10px] text-zinc-500">Struk Pembayaran Sah</div>
            <div className="text-[10px] text-zinc-500">
              {new Date(order.createdAt).toLocaleString("id-ID")}
            </div>
          </div>

          <div className="text-center py-1 bg-white border border-zinc-300 rounded-md">
            <div className="text-[9px] uppercase text-zinc-500">
              Nomor Antrian
            </div>
            <div className="text-2xl font-bold tracking-wider">
              {String(order.queueNumber).padStart(3, "0")}
            </div>
          </div>

          <div className="space-y-1 border-b border-dashed border-zinc-400 pb-2">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span>
                  {it.qty}x {it.name}
                </span>
                <span>{formatRupiah(it.price * it.qty)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-0.5 text-[11px]">
            <div className="flex justify-between font-bold text-xs pt-1">
              <span>TOTAL:</span>
              <span>{formatRupiah(order.total)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Metode Bayar:</span>
              <span className="uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Status:</span>
              <span className="uppercase">{order.status}</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-zinc-500 border-t border-dashed border-zinc-400 pt-2">
            Terima kasih atas kunjungan Anda!
            <br />
            Didukung oleh PayBuy
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="text-xs"
          >
            Tutup
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => window.print()}
            className="gap-1.5 text-xs font-bold shadow-[2px_2px_0px_var(--forest)]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// OrderGrid — Grid kartu pesanan dengan empty state
// ──────────────────────────────────────────────────────────

interface OrderGridProps {
  orders: CashierOrder[];
  searchQuery: string;
  processingOrderId: string | null;
  calledOrderId: string | null;
  onOrdersUpdate: (updater: (prev: CashierOrder[]) => CashierOrder[]) => void;
  onProcessingChange: (id: string | null) => void;
  onCalledChange: (id: string | null) => void;
  onOpenReceipt: (order: CashierOrder) => void;
  onOpenCancel: (order: CashierOrder) => void;
}

export function OrderGrid({
  orders,
  searchQuery,
  processingOrderId,
  calledOrderId,
  onOrdersUpdate,
  onProcessingChange,
  onCalledChange,
  onOpenReceipt,
  onOpenCancel,
}: OrderGridProps) {
  if (orders.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-[var(--line)] space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] border-2 border-[var(--forest)] flex items-center justify-center text-[var(--forest)] mx-auto shadow-[3px_3px_0px_var(--forest)]">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="font-heading font-bold text-lg text-zinc-950">
          Tidak Ada Pesanan pada Kategori Ini
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          {searchQuery
            ? `Tidak ditemukan pesanan yang cocok dengan "${searchQuery}". Coba kata kunci lain.`
            : "Semua antrian dalam kategori ini telah diproses atau belum ada pesanan baru."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          processingOrderId={processingOrderId}
          calledOrderId={calledOrderId}
          onOrdersUpdate={onOrdersUpdate}
          onProcessingChange={onProcessingChange}
          onCalledChange={onCalledChange}
          onOpenReceipt={onOpenReceipt}
          onOpenCancel={onOpenCancel}
        />
      ))}
    </div>
  );
}
