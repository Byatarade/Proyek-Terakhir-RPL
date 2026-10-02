"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  ChefHat,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Volume2,
  VolumeX,
  RefreshCw,
  ArrowLeft,
  Tv,
  Check,
  Loader2,
  Layers,
  Sparkles,
  Bell,
} from "lucide-react";
import {
  KitchenOrder,
  startCookingOrderAction,
  markOrderReadyAction,
  callCustomerOrderAction,
  getKitchenOrdersAction,
} from "@/lib/kitchen/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";

export interface KitchenDisplayProps {
  initialOrders: KitchenOrder[];
  storeName: string;
  storeSlug: string;
}

// Suara Chime Dapur untuk Pesanan Masuk Baru (design.md 17 #6 & PRD FR-KT-02)
function playKitchenChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.7);
  } catch {
    // Ignore audio restriction
  }
}

// Format waktu berjalan sejak pesanan dibayar (design.md 356)
function formatCookingElapsedTime(paidAt: string | null, createdAt: string) {
  const startTime = new Date(paidAt || createdAt).getTime();
  const diffMinutes = Math.floor((Date.now() - startTime) / 60000);

  if (diffMinutes < 1) return { text: "< 1 mnt", level: "normal" as const, minutes: 0 };
  if (diffMinutes < 5) return { text: `${diffMinutes} mnt`, level: "normal" as const, minutes: diffMinutes };
  if (diffMinutes <= 10) return { text: `${diffMinutes} mnt`, level: "warning" as const, minutes: diffMinutes };
  return { text: `${diffMinutes} mnt`, level: "danger" as const, minutes: diffMinutes };
}

export function KitchenDisplay({
  initialOrders,
  storeName,
  storeSlug,
}: KitchenDisplayProps) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const [activeFilter, setActiveFilter] = useState<"all" | "dibayar" | "diproses" | "siap">("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [calledOrderId, setCalledOrderId] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  // Tick timer setiap 30 detik untuk memperbarui kalkulasi menit waktu berjalan
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data terbaru dari server
  const refreshOrders = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await getKitchenOrdersAction();
      if (res.success && res.data) {
        // Cek jika ada pesanan baru berstatus 'dibayar' yang belum ada di state
        const currentOrderIds = new Set(orders.map((o) => o.id));
        const incomingNewOnes = res.data.filter(
          (o) => o.status === "dibayar" && !currentOrderIds.has(o.id)
        );

        if (incomingNewOnes.length > 0) {
          if (soundEnabled) {
            playKitchenChime();
          }
          const newlyAdded = new Set<string>();
          incomingNewOnes.forEach((o) => newlyAdded.add(o.id));
          setNewOrderIds(newlyAdded);

          // Hilangkan penanda kedip kuning setelah 6 detik
          setTimeout(() => {
            setNewOrderIds(new Set());
          }, 6000);
        }

        setOrders(res.data);
        setConnectionStatus("connected");
      }
    } catch {
      setConnectionStatus("disconnected");
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  };

  // Realtime subscription via Supabase + fallback auto-polling interval
  useEffect(() => {
    const supabase = createClient();

    // Subscribe ke perubahan tabel orders untuk toko ini
    const channel = supabase
      .channel("kitchen-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          refreshOrders();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          setConnectionStatus("disconnected");
        } else {
          setConnectionStatus("connecting");
        }
      });

    // Fallback polling setiap 5 detik (PRD FR-KT-02 & FR-KT-05)
    const pollInterval = setInterval(() => {
      refreshOrders();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [orders, soundEnabled]);

  // Handler tombol "Mulai Masak" (dibayar -> diproses)
  const handleStartCooking = (orderId: string) => {
    setProcessingOrderId(orderId);
    startTransition(async () => {
      await startCookingOrderAction(orderId);
      await refreshOrders();
      setProcessingOrderId(null);
    });
  };

  // Handler tombol "Tandai Siap & Panggil Pelanggan" (diproses -> siap)
  const handleMarkReady = (orderId: string) => {
    setProcessingOrderId(orderId);
    setCalledOrderId(orderId);
    if (soundEnabled) {
      playKitchenChime();
    }
    startTransition(async () => {
      await markOrderReadyAction(orderId);
      await refreshOrders();
      setProcessingOrderId(null);
      setTimeout(() => setCalledOrderId(null), 3500);
    });
  };

  // Handler tombol "Panggil Ulang Pelanggan" (siap -> trigger panggil ulang)
  const handleRecallCustomer = (orderId: string) => {
    setProcessingOrderId(orderId);
    setCalledOrderId(orderId);
    if (soundEnabled) {
      playKitchenChime();
    }
    startTransition(async () => {
      await callCustomerOrderAction(orderId);
      await refreshOrders();
      setProcessingOrderId(null);
      setTimeout(() => setCalledOrderId(null), 3500);
    });
  };

  // Filter pesanan
  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") return orders;
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  // Statistik dapur
  const countWaiting = orders.filter((o) => o.status === "dibayar").length;
  const countCooking = orders.filter((o) => o.status === "diproses").length;
  const countReady = orders.filter((o) => o.status === "siap").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Layar Dapur */}
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
            onClick={() => setSoundEnabled(!soundEnabled)}
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
            onClick={() => refreshOrders(true)}
            disabled={isRefreshing}
            className="gap-1.5 text-xs font-semibold h-[38px] shadow-[2px_2px_0px_var(--forest)]"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* Bar Statistik Dapur & Filter Tabs (4 Kategori) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tab 1: Semua Dapur */}
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={cn(
            "p-3.5 rounded-[8px] border-2 border-[var(--forest)] text-left transition-all cursor-pointer",
            activeFilter === "all"
              ? "bg-[var(--forest)] text-white shadow-[4px_4px_0px_var(--forest)]"
              : "bg-white text-[var(--ink)] shadow-[2px_2px_0px_var(--forest)] hover:bg-[var(--surface-2)]"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Total Antrian
            </span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl tabular-nums mt-1">
            {orders.length}
          </div>
          <span className="text-[10px] sm:text-[11px] opacity-80 block mt-0.5 truncate">
            Semua pesanan dapur
          </span>
        </button>

        {/* Tab 2: Menunggu Dimasak (status: dibayar) */}
        <button
          type="button"
          onClick={() => setActiveFilter("dibayar")}
          className={cn(
            "p-3.5 rounded-[8px] border-2 border-[var(--forest)] text-left transition-all cursor-pointer",
            activeFilter === "dibayar"
              ? "bg-[var(--blue)] text-white shadow-[4px_4px_0px_var(--forest)]"
              : "bg-white text-[var(--ink)] shadow-[2px_2px_0px_var(--forest)] hover:bg-[var(--surface-2)]"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              1. Menunggu
            </span>
            <ChefHat className="w-4 h-4" />
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl tabular-nums mt-1">
            {countWaiting}
          </div>
          <span className="text-[10px] sm:text-[11px] opacity-80 block mt-0.5 truncate">
            Perlu dimasak koki
          </span>
        </button>

        {/* Tab 3: Sedang Dimasak (status: diproses) */}
        <button
          type="button"
          onClick={() => setActiveFilter("diproses")}
          className={cn(
            "p-3.5 rounded-[8px] border-2 border-[var(--forest)] text-left transition-all cursor-pointer",
            activeFilter === "diproses"
              ? "bg-[var(--brick)] text-white shadow-[4px_4px_0px_var(--forest)]"
              : "bg-white text-[var(--ink)] shadow-[2px_2px_0px_var(--forest)] hover:bg-[var(--surface-2)]"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              2. Dimasak
            </span>
            <Flame className="w-4 h-4" />
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl tabular-nums mt-1">
            {countCooking}
          </div>
          <span className="text-[10px] sm:text-[11px] opacity-80 block mt-0.5 truncate">
            Sedang diproses koki
          </span>
        </button>

        {/* Tab 4: Siap Dipanggil (status: siap) */}
        <button
          type="button"
          onClick={() => setActiveFilter("siap")}
          className={cn(
            "p-3.5 rounded-[8px] border-2 border-[var(--forest)] text-left transition-all cursor-pointer",
            activeFilter === "siap"
              ? "bg-[var(--mint)] text-[var(--forest)] shadow-[4px_4px_0px_var(--forest)]"
              : "bg-white text-[var(--ink)] shadow-[2px_2px_0px_var(--forest)] hover:bg-[var(--surface-2)]"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
              3. Siap Dipanggil
            </span>
            <Bell className="w-4 h-4" />
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl tabular-nums mt-1">
            {countReady}
          </div>
          <span className="text-[10px] sm:text-[11px] opacity-80 block mt-0.5 truncate">
            Bisa dipanggil ulang
          </span>
        </button>
      </div>

      {/* Grid Order Tickets Dapur (Sesuai design.md 9.2 OrderTicket) */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-12 text-center shadow-[4px_4px_0px_var(--forest)] space-y-3">
          <div className="w-16 h-16 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] text-[var(--forest)] flex items-center justify-center mx-auto shadow-[2px_2px_0px_var(--forest)]">
            <ChefHat className="w-8 h-8 stroke-[2]" />
          </div>
          <h3 className="font-heading font-bold text-lg text-[var(--forest)]">
            Tidak Ada Pesanan di Dapur
          </h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            Semua pesanan yang dibayar pelanggan telah selesai dimasak atau belum ada pesanan baru. Dapur siap menerima antrian baru!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const formattedQueue = String(order.queueNumber).padStart(3, "0");
            const isCooking = order.status === "diproses";
            const isProcessingThis = processingOrderId === order.id && isPending;
            const isNew = newOrderIds.has(order.id);
            const elapsed = formatCookingElapsedTime(order.paidAt, order.createdAt);

            return (
              <div
                key={order.id}
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
                      {/* Nomor Antrian Layar Dapur 48px (design.md 3.2: Montserrat 600, 48px) */}
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

                      {/* Pewaktu Berjalan (design.md 9.2: < 5 mnt Forest, 5-10 Amber, > 10 Danger) */}
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

                {/* Ticket Body: Item List (design.md 9.2: 2x tebal + nama, pemisah putus-putus) */}
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

                {/* Ticket Footer / Action: Satu Tombol Besar (xl) di Bawah (design.md 9.2 & 7.1) */}
                <div className="p-3 pl-5 bg-white border-t-2 border-[var(--forest)]">
                  {order.status === "dibayar" ? (
                    <Button
                      variant="primary"
                      size="xl"
                      onClick={() => handleStartCooking(order.id)}
                      disabled={isProcessingThis}
                      className="w-full gap-2 font-heading font-bold text-sm sm:text-base h-14 bg-[var(--brick)] hover:bg-[#9e4314] text-white border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] cursor-pointer"
                    >
                      {isProcessingThis ? (
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
                      onClick={() => handleMarkReady(order.id)}
                      disabled={isProcessingThis}
                      className="w-full gap-2 font-heading font-bold text-sm sm:text-base h-14 bg-[var(--leaf)] hover:bg-[var(--leaf-hover)] text-white border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] cursor-pointer"
                    >
                      {isProcessingThis ? (
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
                      onClick={() => handleRecallCustomer(order.id)}
                      disabled={isProcessingThis}
                      className={cn(
                        "w-full gap-2 font-heading font-extrabold text-sm sm:text-base h-14 border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] cursor-pointer transition-all",
                        calledOrderId === order.id
                          ? "bg-[var(--leaf)] text-white"
                          : "bg-[var(--mint)] hover:bg-[#8ecea0] text-[var(--forest)]"
                      )}
                    >
                      {isProcessingThis ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Memanggil...</span>
                        </>
                      ) : calledOrderId === order.id ? (
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
          })}
        </div>
      )}
    </div>
  );
}
