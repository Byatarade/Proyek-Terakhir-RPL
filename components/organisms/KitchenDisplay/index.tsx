"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { ChefHat } from "lucide-react";
import {
  KitchenOrder,
  startCookingOrderAction,
  markOrderReadyAction,
  callCustomerOrderAction,
  getKitchenOrdersAction,
} from "@/lib/kitchen/actions";
import { createClient } from "@/lib/supabase/client";

import {
  KitchenDisplayProps,
  KitchenFilterType,
  ConnectionStatus,
} from "./types";
import { playKitchenChime } from "./utils";
import { KitchenHeader } from "./KitchenHeader";
import { KitchenFilterStats } from "./KitchenFilterStats";
import { KitchenOrderCard } from "./KitchenOrderCard";

export type { KitchenDisplayProps } from "./types";

export function KitchenDisplay({
  initialOrders,
  storeName,
  storeSlug,
}: KitchenDisplayProps) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const [activeFilter, setActiveFilter] = useState<KitchenFilterType>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <KitchenHeader
        storeName={storeName}
        storeSlug={storeSlug}
        connectionStatus={connectionStatus}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isRefreshing={isRefreshing}
        onRefresh={() => refreshOrders(true)}
      />

      {/* Bar Statistik Dapur & Filter Tabs (4 Kategori) */}
      <KitchenFilterStats
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        totalOrders={orders.length}
        countWaiting={countWaiting}
        countCooking={countCooking}
        countReady={countReady}
      />

      {/* Grid Order Tickets Dapur */}
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
          {filteredOrders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              isProcessing={processingOrderId === order.id && isPending}
              isCalled={calledOrderId === order.id}
              isNew={newOrderIds.has(order.id)}
              onStartCooking={handleStartCooking}
              onMarkReady={handleMarkReady}
              onRecallCustomer={handleRecallCustomer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
