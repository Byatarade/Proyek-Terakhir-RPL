"use client";

/**
 * CashierStation/index.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Komposisi utama Organism CashierStation.
 * File ini bertanggung jawab atas:
 *   - State global organism (tab aktif, search, modal open/close, dsb.)
 *   - Komposisi sub-komponen: SummaryCards, StatusTabs, OrderGrid, QueueMonitor
 *   - Barrel export: komponen lain mengimpor dari "@/components/organisms/CashierStation"
 *     bukan dari path internal sub-komponen.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { RefreshCw, ShoppingBag, Monitor } from "lucide-react";

import {
  CashierOrder,
  cancelOrderAction,
} from "@/lib/cashier/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";

import { useOrderPolling } from "./hooks/useOrderPolling";
import { SummaryCards, ActiveTab } from "./SummaryCards";
import { StatusTabs } from "./StatusTabs";
import { OrderGrid, CancelModal, ReceiptModal } from "./OrderCard";
import { QueueMonitor } from "./QueueMonitor";

export interface CashierStationProps {
  initialOrders: CashierOrder[];
  storeName: string;
  storeSlug: string;
}

export function CashierStation({
  initialOrders,
  storeName,
}: // eslint-disable-next-line @typescript-eslint/no-unused-vars
CashierStationProps) {
  // ── Polling & Orders State ──
  const { orders, setOrders, isRefreshing, handleManualRefresh } =
    useOrderPolling(initialOrders);

  // ── UI State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all_active");

  // ── Action State ──
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );
  const [calledOrderId, setCalledOrderId] = useState<string | null>(null);

  // ── Modal State ──
  const [cancelModalOrder, setCancelModalOrder] =
    useState<CashierOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, startCancelTransition] = useTransition();
  const [receiptModalOrder, setReceiptModalOrder] =
    useState<CashierOrder | null>(null);
  const [tvMonitorOpen, setTvMonitorOpen] = useState(false);

  // ── Filter Logic ──
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filter Tab
      if (activeTab === "all_active") {
        if (!["menunggu_bayar", "dibayar", "diproses", "siap"].includes(order.status))
          return false;
      } else if (activeTab === "menunggu_bayar") {
        if (order.status !== "menunggu_bayar") return false;
      } else if (activeTab === "siap") {
        if (order.status !== "siap") return false;
      } else if (activeTab === "dapur") {
        if (!["dibayar", "diproses"].includes(order.status)) return false;
      } else if (activeTab === "selesai") {
        if (!["diambil", "dibatalkan"].includes(order.status)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const formattedQ = String(order.queueNumber).padStart(3, "0");
        const matchNumber =
          String(order.queueNumber) === q ||
          formattedQ === q ||
          formattedQ.includes(q);
        const matchItem = order.items.some((it) =>
          it.name.toLowerCase().includes(q)
        );
        return matchNumber || matchItem;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // ── Statistik ──
  const stats = useMemo(() => {
    const waitingPayment = orders.filter((o) => o.status === "menunggu_bayar");
    const readyToTake = orders.filter((o) => o.status === "siap");
    const inKitchen = orders.filter((o) =>
      ["dibayar", "diproses"].includes(o.status)
    );
    const completedToday = orders.filter((o) => o.status === "diambil");
    return {
      waitingCount: waitingPayment.length,
      waitingTotal: waitingPayment.reduce((sum, o) => sum + o.total, 0),
      readyCount: readyToTake.length,
      kitchenCount: inKitchen.length,
      completedCount: completedToday.length,
    };
  }, [orders]);

  // ── Cancel Handler ──
  const handleConfirmCancel = () => {
    if (!cancelModalOrder || !cancelReason.trim()) return;
    startCancelTransition(async () => {
      const res = await cancelOrderAction(cancelModalOrder.id, cancelReason);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === cancelModalOrder.id
              ? { ...o, status: "dibatalkan", cancelReason }
              : o
          )
        );
        setCancelModalOrder(null);
        setCancelReason("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--leaf)] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--leaf)]">
              Live Kasir & Sinkronisasi Antrian
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-950 tracking-tight mt-1">
            Layar Kasir & Operasional
          </h1>
          <p className="text-sm text-zinc-500 font-normal">
            Pantau pesanan pelanggan, konfirmasi pembayaran tunai, dan panggil
            nomor antrian saat makanan siap.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Link href="/dashboard/pos">
            <Button
              variant="primary"
              size="md"
              className="gap-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_var(--forest)] bg-[var(--leaf)] hover:bg-[#156336] text-white cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[var(--mint)]" />
              <span>Buka Kasir POS (Input Menu)</span>
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setTvMonitorOpen(true)}
            className="gap-2 text-xs sm:text-sm font-semibold border-zinc-300"
          >
            <Monitor className="w-4 h-4 text-[var(--forest)]" />
            <span>Layar Antrian TV (Monitor)</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="gap-2 text-xs sm:text-sm font-semibold"
          >
            <RefreshCw
              className={cn("w-4 h-4", isRefreshing && "animate-spin text-[var(--leaf)]")}
            />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Ringkasan 4 Kartu Statistik ── */}
      <SummaryCards
        stats={stats}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* ── 3. Tab Filter & Search ── */}
      <StatusTabs
        activeTab={activeTab}
        stats={stats}
        searchQuery={searchQuery}
        onTabChange={setActiveTab}
        onSearchChange={setSearchQuery}
      />

      {/* ── 4. Grid Kartu Pesanan ── */}
      <OrderGrid
        orders={filteredOrders}
        searchQuery={searchQuery}
        processingOrderId={processingOrderId}
        calledOrderId={calledOrderId}
        onOrdersUpdate={setOrders}
        onProcessingChange={setProcessingOrderId}
        onCalledChange={setCalledOrderId}
        onOpenReceipt={setReceiptModalOrder}
        onOpenCancel={(order) => {
          setCancelModalOrder(order);
          setCancelReason("");
        }}
      />

      {/* ── 5. Modal Pembatalan ── */}
      {cancelModalOrder && (
        <CancelModal
          order={cancelModalOrder}
          cancelReason={cancelReason}
          isCancelling={isCancelling}
          onReasonChange={setCancelReason}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelModalOrder(null)}
        />
      )}

      {/* ── 6. Modal Cetak Struk ── */}
      {receiptModalOrder && (
        <ReceiptModal
          order={receiptModalOrder}
          storeName={storeName}
          onClose={() => setReceiptModalOrder(null)}
        />
      )}

      {/* ── 7. Layar TV Monitor Antrian ── */}
      {tvMonitorOpen && (
        <QueueMonitor
          orders={orders}
          storeName={storeName}
          onClose={() => setTvMonitorOpen(false)}
        />
      )}
    </div>
  );
}

// ── Barrel Export ──
// Komponen eksternal hanya mengimpor dari "@/components/organisms/CashierStation"
export type { ActiveTab } from "./SummaryCards";
