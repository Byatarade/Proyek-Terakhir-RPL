"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Volume2,
  RefreshCw,
  XCircle,
  Banknote,
  QrCode,
  Utensils,
  ShoppingBag,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  ExternalLink,
  Printer,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronRight,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  Filter,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Monitor,
  Flame,
} from "lucide-react";
import {
  CashierOrder,
  confirmOrderPaymentAction,
  updateOrderStatusAction,
  cancelOrderAction,
  getCashierOrdersAction,
} from "@/lib/cashier/actions";
import { callCustomerOrderAction } from "@/lib/kitchen/actions";
import { formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { OrderStatus } from "@/lib/types/database";

export interface CashierStationProps {
  initialOrders: CashierOrder[];
  storeName: string;
  storeSlug: string;
}

// Suara Chime Lonceng Pemanggil Antrian 2-Nada
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(880, now + 0.22); // A5
    gain2.gain.setValueAtTime(0.28, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.85);
  } catch {
    // Ignore audio restriction
  }
}

// Panggil Nomor Antrian via Suara Bahasa Indonesia
function callQueueVoice(queueNumber: number) {
  playChime();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const formatted = String(queueNumber).padStart(3, "0");
    const utterance = new SpeechSynthesisUtterance(`Nomor antrian ${formatted}, pesanan siap diambil di kasir.`);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 450);
  }
}

// Hitung Waktu Berjalan Sejak Pesanan Dibuat (design.md 356)
function formatElapsedTime(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const diffMinutes = Math.floor((Date.now() - created) / 60000);

  if (diffMinutes < 1) return { text: "Baru saja", level: "normal" as const };
  if (diffMinutes < 5) return { text: `${diffMinutes} mnt lalu`, level: "normal" as const };
  if (diffMinutes <= 10) return { text: `${diffMinutes} mnt lalu`, level: "warning" as const };
  return { text: `${diffMinutes} mnt lalu`, level: "danger" as const };
}

export function CashierStation({
  initialOrders,
  storeName,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  storeSlug,
}: CashierStationProps) {
  const [orders, setOrders] = useState<CashierOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all_active" | "menunggu_bayar" | "siap" | "dapur" | "selesai">("all_active");
  const [isRefreshing, setIsRefreshing] = useState(false);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Modal Cancel State
  const [cancelModalOrder, setCancelModalOrder] = useState<CashierOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, startCancelTransition] = useTransition();

  // Action Loading ID
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Audio Announce feedback
  const [calledOrderId, setCalledOrderId] = useState<string | null>(null);

  // Modal Cetak Struk
  const [receiptModalOrder, setReceiptModalOrder] = useState<CashierOrder | null>(null);

  // Modal TV Monitor Antrian
  const [tvMonitorOpen, setTvMonitorOpen] = useState(false);

  // Auto Refresh Polling setiap 5 detik (FR-KS-01: diperbarui otomatis tanpa muat ulang)
  useEffect(() => {
    async function refreshOrders() {
      const res = await getCashierOrdersAction();
      if (res.success && res.data) {
        setOrders(res.data);
        setLastUpdated(new Date());
      }
    }

    const interval = setInterval(refreshOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const res = await getCashierOrdersAction();
    if (res.success && res.data) {
      setOrders(res.data);
      setLastUpdated(new Date());
    }
    setIsRefreshing(false);
  };

  // 1. Konfirmasi Pembayaran Kasir (FR-KS-02 & FR-PY-06)
  const handleConfirmPayment = (order: CashierOrder) => {
    setProcessingOrderId(order.id);
    startTransition(async () => {
      const res = await confirmOrderPaymentAction(order.id);
      if (res.success) {
        setOrders((prev) =>
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
      setProcessingOrderId(null);
    });
  };

  // 2. Panggil Nomor Antrian (FR-KS-03)
  const handleCallQueue = (order: CashierOrder) => {
    callQueueVoice(order.queueNumber);
    setCalledOrderId(order.id);
    setTimeout(() => setCalledOrderId(null), 3000);
    // Kirim sinyal panggil ke database agar berdering di ponsel pelanggan (QR menu)
    callCustomerOrderAction(order.id).catch(() => {});
  };

  // 3. Tandai Pesanan Sudah Diambil (FR-KS-03)
  const handleMarkTaken = (order: CashierOrder) => {
    setProcessingOrderId(order.id);
    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, "diambil", "Pesanan diserahkan kasir kepada pelanggan");
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "diambil" } : o))
        );
      }
      setProcessingOrderId(null);
    });
  };

  // 4. Ubah ke Sedang Dimasak (Kasir mulai proses masak / kirim instruksi ke dapur)
  const handleStartCooking = (order: CashierOrder) => {
    setProcessingOrderId(order.id);
    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, "diproses", "Kasir memulai proses masak");
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "diproses" } : o))
        );
      }
      setProcessingOrderId(null);
    });
  };

  // 5. Ubah ke Selesai Masak & Panggil Pelanggan
  const handleFinishCookingAndCall = (order: CashierOrder) => {
    setProcessingOrderId(order.id);
    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, "siap", "Pesanan selesai dimasak dan dipanggil oleh kasir");
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "siap" } : o))
        );
        // Panggil suara chime lonceng + TTS nama/nomor antrian
        callQueueVoice(order.queueNumber);
        setCalledOrderId(order.id);
        setTimeout(() => setCalledOrderId(null), 3000);
        callCustomerOrderAction(order.id).catch(() => {});
      }
      setProcessingOrderId(null);
    });
  };

  // 6. Opsi cepat kasir jika menu langsung siap tanpa proses masak panjang
  const handleMarkReady = (order: CashierOrder) => {
    handleFinishCookingAndCall(order);
  };

  // 5. Batalkan Pesanan (FR-KS-04)
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

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Filter Tab
      if (activeTab === "all_active") {
        if (!["menunggu_bayar", "dibayar", "diproses", "siap"].includes(order.status)) return false;
      } else if (activeTab === "menunggu_bayar") {
        if (order.status !== "menunggu_bayar") return false;
      } else if (activeTab === "siap") {
        if (order.status !== "siap") return false;
      } else if (activeTab === "dapur") {
        if (!["dibayar", "diproses"].includes(order.status)) return false;
      } else if (activeTab === "selesai") {
        if (!["diambil", "dibatalkan"].includes(order.status)) return false;
      }

      // 2. Search Query (Nomor antrian atau nama produk)
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

  // Statistik Ringkas Kasir
  const stats = useMemo(() => {
    const waitingPayment = orders.filter((o) => o.status === "menunggu_bayar");
    const readyToTake = orders.filter((o) => o.status === "siap");
    const inKitchen = orders.filter((o) => ["dibayar", "diproses"].includes(o.status));
    const completedToday = orders.filter((o) => o.status === "diambil");

    const totalWaitingAmount = waitingPayment.reduce((sum, o) => sum + o.total, 0);

    return {
      waitingCount: waitingPayment.length,
      waitingTotal: totalWaitingAmount,
      readyCount: readyToTake.length,
      kitchenCount: inKitchen.length,
      completedCount: completedToday.length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* 1. Top Page Header */}
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
            Pantau pesanan pelanggan, konfirmasi pembayaran tunai, dan panggil nomor antrian saat makanan siap.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Tombol Akses Kasir POS (Input Menu Walk-in) */}
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

          {/* Tombol TV Monitor Antrian Publik */}
          <Button
            variant="secondary"
            size="md"
            onClick={() => setTvMonitorOpen(true)}
            className="gap-2 text-xs sm:text-sm font-semibold border-zinc-300"
          >
            <Monitor className="w-4 h-4 text-[var(--forest)]" />
            <span>Layar Antrian TV (Monitor)</span>
          </Button>

          {/* Tombol Refresh Manual */}
          <Button
            variant="secondary"
            size="md"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="gap-2 text-xs sm:text-sm font-semibold"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-[var(--leaf)]")} />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* 2. Ringkasan 4 Kartu Kasir Cepat */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Menunggu Bayar */}
        <div
          onClick={() => setActiveTab("menunggu_bayar")}
          className={cn(
            "p-4 rounded-xl border-2 cursor-pointer transition-all bg-white",
            activeTab === "menunggu_bayar"
              ? "border-[var(--amber)] shadow-[4px_4px_0px_var(--amber)] ring-1 ring-[var(--amber)]"
              : "border-[var(--line)] hover:border-zinc-400 shadow-2xs"
          )}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Menunggu Bayar</span>
            <Banknote className="w-4 h-4" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-zinc-950">
            {stats.waitingCount} <span className="text-xs font-normal text-zinc-500">Antrian</span>
          </div>
          <div className="text-xs font-semibold text-amber-800 tabular-nums mt-0.5">
            {formatRupiah(stats.waitingTotal)}
          </div>
        </div>

        {/* Siap Diambil */}
        <div
          onClick={() => setActiveTab("siap")}
          className={cn(
            "p-4 rounded-xl border-2 cursor-pointer transition-all bg-white",
            activeTab === "siap"
              ? "border-[var(--leaf)] shadow-[4px_4px_0px_var(--forest)] ring-1 ring-[var(--forest)]"
              : "border-[var(--line)] hover:border-zinc-400 shadow-2xs"
          )}
        >
          <div className="flex items-center justify-between text-[var(--leaf)] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Siap Diambil</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-zinc-950">
            {stats.readyCount} <span className="text-xs font-normal text-zinc-500">Pesanan</span>
          </div>
          <div className="text-xs text-[var(--muted)] mt-0.5">
            Siap dipanggil ke meja kasir
          </div>
        </div>

        {/* Dalam Dapur */}
        <div
          onClick={() => setActiveTab("dapur")}
          className={cn(
            "p-4 rounded-xl border-2 cursor-pointer transition-all bg-white",
            activeTab === "dapur"
              ? "border-[var(--blue)] shadow-[4px_4px_0px_var(--blue)] ring-1 ring-[var(--blue)]"
              : "border-[var(--line)] hover:border-zinc-400 shadow-2xs"
          )}
        >
          <div className="flex items-center justify-between text-[var(--blue)] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sedang Dimasak</span>
            <Utensils className="w-4 h-4" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-zinc-950">
            {stats.kitchenCount} <span className="text-xs font-normal text-zinc-500">Pesanan</span>
          </div>
          <div className="text-xs text-[var(--muted)] mt-0.5">
            Sedang dimasak di dapur
          </div>
        </div>

        {/* Sudah Selesai Hari Ini */}
        <div
          onClick={() => setActiveTab("selesai")}
          className={cn(
            "p-4 rounded-xl border-2 cursor-pointer transition-all bg-white",
            activeTab === "selesai"
              ? "border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] ring-1 ring-[var(--forest)]"
              : "border-[var(--line)] hover:border-zinc-400 shadow-2xs"
          )}
        >
          <div className="flex items-center justify-between text-zinc-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Selesai Hari Ini</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--leaf)]" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-zinc-950">
            {stats.completedCount} <span className="text-xs font-normal text-zinc-500">Diambil</span>
          </div>
          <div className="text-xs text-[var(--muted)] mt-0.5">
            Riwayat transaksi sukses
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Tab Navigasi Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("all_active")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              activeTab === "all_active"
                ? "bg-white text-[var(--forest)] shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            Semua Aktif ({stats.waitingCount + stats.readyCount + stats.kitchenCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("menunggu_bayar")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              activeTab === "menunggu_bayar"
                ? "bg-white text-amber-800 shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            Antre Bayar ({stats.waitingCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("siap")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              activeTab === "siap"
                ? "bg-white text-[var(--leaf)] shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            Siap Diambil ({stats.readyCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dapur")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              activeTab === "dapur"
                ? "bg-white text-[var(--blue)] shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            Di Dapur ({stats.kitchenCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("selesai")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              activeTab === "selesai"
                ? "bg-white text-zinc-900 shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            Selesai / Batal
          </button>
        </div>

        {/* Search Box Nomor Antrian */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. antrian (cth: 001) / menu..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--line)] bg-white text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Grid Kartu Pesanan Kasir (OrderTicket design.md 9.2) */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-[var(--line)] space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] border-2 border-[var(--forest)] flex items-center justify-center text-[var(--forest)] mx-auto shadow-[3px_3px_0px_var(--forest)]">
            <Receipt className="w-7 h-7" />
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const formattedQueue = String(order.queueNumber).padStart(3, "0");
            const elapsed = formatElapsedTime(order.createdAt);
            const isCallActive = calledOrderId === order.id;
            const isThisPending = processingOrderId === order.id && isPending;

            // Status border & badge colors
            const statusConfig = {
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
                badgeClass: "bg-[var(--mint)] text-[var(--forest)] border-[var(--forest)] font-extrabold",
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
            }[order.status] || {
              label: order.status,
              borderClass: "border-zinc-200",
              stripClass: "bg-zinc-300",
              badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
            };

            return (
              <div
                key={order.id}
                className={cn(
                  "bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] overflow-hidden flex flex-col relative transition-all",
                  order.status === "siap" && "ring-2 ring-[var(--forest)]",
                  order.status === "diambil" && "opacity-75 shadow-none border-zinc-300"
                )}
              >
                {/* Takik Karcis Retro Kiri & Kanan (design.md 6.1 & 352) */}
                <div className="ticket-notch-left top-[98px]" />
                <div className="ticket-notch-right top-[98px]" />

                {/* Strip Status Vertikal Sisi Kiri (design.md 353) */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-2", statusConfig.stripClass)} />

                {/* 1. Header Ticket */}
                <div className="pl-5 pr-4 pt-4 pb-3.5 border-b-2 border-dashed border-[var(--line)] bg-zinc-50/50">
                  <div className="flex items-start justify-between gap-2">
                    {/* Nomor Antrian Besar (Montserrat 600) */}
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 block">
                        No. Antrian
                      </span>
                      <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[var(--forest)] tracking-tight tabular-nums">
                        {formattedQueue}
                      </div>
                    </div>

                    {/* Status & Elapsed Timer */}
                    <div className="flex flex-col items-end space-y-1.5">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider",
                          statusConfig.badgeClass
                        )}
                      >
                        {statusConfig.label}
                      </span>

                      {/* Elapsed Time Indicator (design.md 356) */}
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

                  {/* Payment Method Badge & Tanda Khusus Pelanggan (FR-KS-06) */}
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

                    {/* Penanda Khusus: Hanya Dikonfirmasi Pelanggan (FR-KS-06 & BR-09) */}
                    {order.paidConfirmedBy === "customer" && order.status !== "menunggu_bayar" && (
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

                {/* 2. Isi Ticket: Daftar Menu & Harga */}
                <div className="p-4 pl-5 flex-1 space-y-2.5">
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-baseline justify-between text-xs text-zinc-800">
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

                  {/* Total Harga */}
                  <div className="pt-2.5 border-t border-dashed border-[var(--line)] flex items-baseline justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Total Bayar
                    </span>
                    <span className="font-heading font-extrabold text-base text-[var(--forest)] tabular-nums">
                      {formatRupiah(order.total)}
                    </span>
                  </div>

                  {/* Alasan Batal jika ada */}
                  {order.cancelReason && (
                    <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 leading-tight">
                      <strong>Dibatalkan:</strong> {order.cancelReason}
                    </div>
                  )}
                </div>

                {/* 3. Aksi Kasir (Target Sentuh Besar & Rapi) */}
                <div className="p-3 pl-4 bg-zinc-50 border-t border-[var(--line)]">
                  {order.status === "siap" ? (
                    <div className="space-y-2 w-full">
                      {/* Tombol Utama: Tandai Sudah Diambil (Lebar Penuh, Tidak Terpotong) */}
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleMarkTaken(order)}
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

                      {/* Baris Pendukung: Panggil Antrian, Cetak Nota, dan Batalkan */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => handleCallQueue(order)}
                          className={cn(
                            "flex-1 gap-1.5 text-xs font-bold h-10 transition-all whitespace-nowrap",
                            isCallActive && "bg-[var(--mint)] border-[var(--forest)] text-[var(--forest)] font-extrabold ring-2 ring-[var(--forest)]"
                          )}
                          title="Panggil nomor antrian via speaker"
                        >
                          <Volume2 className={cn("w-4 h-4 shrink-0", isCallActive && "animate-bounce text-[var(--forest)]")} />
                          <span>{isCallActive ? "Memanggil..." : "Panggil Antrian"}</span>
                        </Button>

                        {/* Cetak Nota Struk Kasir */}
                        <button
                          type="button"
                          onClick={() => setReceiptModalOrder(order)}
                          title="Cetak struk nota"
                          className="p-2.5 rounded-xl border border-zinc-300 hover:bg-white text-zinc-700 hover:text-[var(--forest)] transition-colors h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Tombol Batalkan Pesanan */}
                        <button
                          type="button"
                          onClick={() => {
                            setCancelModalOrder(order);
                            setCancelReason("");
                          }}
                          title="Batalkan pesanan ini"
                          className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 w-full">
                      {/* Status 1: Menunggu Bayar -> Konfirmasi Pembayaran */}
                      {order.status === "menunggu_bayar" && (
                        <div className="flex items-center gap-2 w-full">
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => handleConfirmPayment(order)}
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
                            onClick={() => setReceiptModalOrder(order)}
                            title="Cetak struk nota"
                            className="p-2.5 rounded-xl border border-zinc-300 hover:bg-white text-zinc-700 hover:text-[var(--forest)] transition-colors h-11 w-11 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCancelModalOrder(order);
                              setCancelReason("");
                            }}
                            title="Batalkan pesanan ini"
                            className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors h-11 w-11 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Status 2: Sudah Dibayar -> Kasir Klik "Mulai Dimasak" */}
                      {order.status === "dibayar" && (
                        <div className="space-y-2 w-full">
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => handleStartCooking(order)}
                            disabled={isThisPending}
                            className="w-full gap-2 font-bold text-xs sm:text-sm h-11 bg-amber-500 hover:bg-amber-600 text-white border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                          >
                            {isThisPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Flame className="w-4 h-4 fill-amber-200 text-white" />
                            )}
                            <span>Mulai Dimasak</span>
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="md"
                              onClick={() => handleMarkReady(order)}
                              disabled={isThisPending}
                              className="flex-1 gap-1.5 text-xs font-semibold h-10 border-zinc-300 whitespace-nowrap"
                              title="Jika menu cepat/minuman tanpa perlu proses masak"
                            >
                              <Check className="w-3.5 h-3.5 text-zinc-600" />
                              <span>Langsung Siap</span>
                            </Button>

                            <button
                              type="button"
                              onClick={() => setReceiptModalOrder(order)}
                              title="Cetak struk nota"
                              className="p-2.5 rounded-xl border border-zinc-300 hover:bg-white text-zinc-700 hover:text-[var(--forest)] transition-colors h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalOrder(order);
                                setCancelReason("");
                              }}
                              title="Batalkan pesanan ini"
                              className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Status 3: Sedang Dimasak -> Kasir Klik "Selesai Masak & Panggil" */}
                      {order.status === "diproses" && (
                        <div className="space-y-2 w-full">
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => handleFinishCookingAndCall(order)}
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
                              onClick={() => setReceiptModalOrder(order)}
                              title="Cetak struk nota"
                              className="p-2.5 rounded-xl border border-zinc-300 hover:bg-white text-zinc-700 hover:text-[var(--forest)] transition-colors h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalOrder(order);
                                setCancelReason("");
                              }}
                              title="Batalkan pesanan ini"
                              className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Status 4: Selesai / Dibatalkan / Kedaluwarsa */}
                      {["diambil", "dibatalkan", "kedaluwarsa"].includes(order.status) && (
                        <div className="flex items-center justify-between gap-2 w-full pt-1">
                          <span className="text-xs text-zinc-500 font-medium">
                            {order.status === "diambil" ? "Pesanan telah diserahkan" : "Pesanan tidak aktif"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setReceiptModalOrder(order)}
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
          })}
        </div>
      )}

      {/* 5. Modal Konfirmasi Pembatalan Pesanan (FR-KS-04) */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base">
                  Batalkan Pesanan #{String(cancelModalOrder.queueNumber).padStart(3, "0")}
                </h3>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              Pesanan sebesar <strong>{formatRupiah(cancelModalOrder.total)}</strong> akan dibatalkan.
              Tindakan ini akan dicatat pada riwayat audit status pesanan.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 block">
                Pilih atau Tulis Alasan Pembatalan:
              </label>

              {/* Opsi Alasan Cepat */}
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
                    onClick={() => setCancelReason(reason)}
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
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tulis alasan singkat pembatalan..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setCancelModalOrder(null)}
                disabled={isCancelling}
                className="text-xs"
              >
                Batal
              </Button>

              <button
                type="button"
                onClick={handleConfirmCancel}
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
      )}

      {/* 6. Modal Cetak Nota Struk Kasir Thermal */}
      {receiptModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
          <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="font-heading font-bold text-sm text-[var(--forest)]">
                Pratinjau Struk Kasir
              </span>
              <button
                onClick={() => setReceiptModalOrder(null)}
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
                  {new Date(receiptModalOrder.createdAt).toLocaleString("id-ID")}
                </div>
              </div>

              <div className="text-center py-1 bg-white border border-zinc-300 rounded-md">
                <div className="text-[9px] uppercase text-zinc-500">Nomor Antrian</div>
                <div className="text-2xl font-bold tracking-wider">
                  {String(receiptModalOrder.queueNumber).padStart(3, "0")}
                </div>
              </div>

              <div className="space-y-1 border-b border-dashed border-zinc-400 pb-2">
                {receiptModalOrder.items.map((it, idx) => (
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
                  <span>{formatRupiah(receiptModalOrder.total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Metode Bayar:</span>
                  <span className="uppercase">{receiptModalOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Status:</span>
                  <span className="uppercase">{receiptModalOrder.status}</span>
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
                onClick={() => setReceiptModalOrder(null)}
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
      )}

      {/* 7. Modal TV Monitor Antrian Publik (FR-KS-05) */}
      {tvMonitorOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--forest)] text-white p-6 sm:p-10 overflow-y-auto">
          <div className="flex items-center justify-between pb-6 border-b border-white/20">
            <div>
              <span className="text-xs tracking-widest uppercase font-bold text-[var(--mint)]">
                Layar Antrian Publik (TV Monitor)
              </span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
                {storeName}
              </h2>
            </div>
            <button
              onClick={() => setTvMonitorOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto py-8">
            {/* Kolom 1: Siap Diambil (Mencolok Besar) */}
            <div className="bg-white/10 p-6 sm:p-8 rounded-2xl border-2 border-[var(--mint)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading font-extrabold text-xl text-[var(--mint)] uppercase tracking-wider">
                  Silakan Ambil Pesanan
                </span>
                <span className="px-3 py-1 rounded-full bg-[var(--leaf)] text-xs font-bold">
                  SIAP DI KASIR
                </span>
              </div>

              {orders.filter((o) => o.status === "siap").length === 0 ? (
                <div className="text-center py-12 text-white/50 text-sm">
                  Belum ada pesanan yang siap dipanggil
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {orders
                    .filter((o) => o.status === "siap")
                    .map((o) => (
                      <div
                        key={o.id}
                        className="p-4 rounded-xl bg-white text-[var(--forest)] text-center font-heading font-extrabold text-4xl sm:text-5xl shadow-lg border-2 border-[var(--mint)] animate-pulse"
                      >
                        {String(o.queueNumber).padStart(3, "0")}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Kolom 2: Sedang Dimasak di Dapur */}
            <div className="bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading font-extrabold text-xl text-white/90 uppercase tracking-wider">
                  Sedang Dipersiapkan
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                  DI DAPUR
                </span>
              </div>

              {orders.filter((o) => ["dibayar", "diproses"].includes(o.status)).length === 0 ? (
                <div className="text-center py-12 text-white/50 text-sm">
                  Dapur sedang tidak memproses pesanan
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {orders
                    .filter((o) => ["dibayar", "diproses"].includes(o.status))
                    .map((o) => (
                      <div
                        key={o.id}
                        className="p-4 rounded-xl bg-white/10 text-white text-center font-heading font-bold text-3xl sm:text-4xl border border-white/20"
                      >
                        {String(o.queueNumber).padStart(3, "0")}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-center pt-6 border-t border-white/10 text-xs text-white/60">
            Pindai QR Menu di meja Anda untuk memesan langsung • Didukung oleh PayBuy
          </div>
        </div>
      )}
    </div>
  );
}
