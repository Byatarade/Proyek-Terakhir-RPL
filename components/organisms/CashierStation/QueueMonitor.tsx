"use client";

import React from "react";
import { X } from "lucide-react";
import { CashierOrder } from "@/lib/cashier/actions";

interface QueueMonitorProps {
  orders: CashierOrder[];
  storeName: string;
  onClose: () => void;
}

/**
 * QueueMonitor — Layar antrian publik mode layar penuh (TV Monitor).
 * Menampilkan nomor antrian SIAP (mencolok) dan SEDANG DIMASAK (redup).
 * FR-KS-09: Layar antrian publik untuk TV/monitor.
 */
export function QueueMonitor({ orders, storeName, onClose }: QueueMonitorProps) {
  const readyOrders = orders.filter((o) => o.status === "siap");
  const cookingOrders = orders.filter((o) =>
    ["dibayar", "diproses"].includes(o.status)
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--forest)] text-white p-6 sm:p-10 overflow-y-auto">
      {/* Header */}
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
          onClick={onClose}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Konten Antrian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto py-8">
        {/* Kolom 1: Siap Diambil */}
        <div className="bg-white/10 p-6 sm:p-8 rounded-2xl border-2 border-[var(--mint)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-heading font-extrabold text-xl text-[var(--mint)] uppercase tracking-wider">
              Silakan Ambil Pesanan
            </span>
            <span className="px-3 py-1 rounded-full bg-[var(--leaf)] text-xs font-bold">
              SIAP DI KASIR
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <div className="text-center py-12 text-white/50 text-sm">
              Belum ada pesanan yang siap dipanggil
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {readyOrders.map((o) => (
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

        {/* Kolom 2: Sedang Dimasak */}
        <div className="bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-heading font-extrabold text-xl text-white/90 uppercase tracking-wider">
              Sedang Dipersiapkan
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
              DI DAPUR
            </span>
          </div>

          {cookingOrders.length === 0 ? (
            <div className="text-center py-12 text-white/50 text-sm">
              Dapur sedang tidak memproses pesanan
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {cookingOrders.map((o) => (
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

      {/* Footer */}
      <div className="text-center pt-6 border-t border-white/10 text-xs text-white/60">
        Pindai QR Menu di meja Anda untuk memesan langsung • Didukung oleh
        PayBuy
      </div>
    </div>
  );
}
