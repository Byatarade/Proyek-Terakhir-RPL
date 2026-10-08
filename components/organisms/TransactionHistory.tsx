"use client";

import React, { useState, useTransition } from "react";
import {
  Clock,
  Search,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  Filter,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar,
  Receipt,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  CheckCircle2,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  XCircle,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  AlertCircle,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  Coffee,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  ExternalLink,
  X,
  CreditCard,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  User,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  ShoppingBag,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { StampLunas } from "@/components/molecules/StampLunas";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DotLeader } from "@/components/molecules/DotLeader";
import { cn, formatRupiah } from "@/lib/utils";
import {
  TransactionRecord,
  TransactionsResponse,
  getTransactionsAction,
} from "@/lib/transactions/actions";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { OrderStatus, PaymentMethod } from "@/lib/types/database";

export interface TransactionHistoryProps {
  initialData: TransactionsResponse;
}

export function TransactionHistory({ initialData }: TransactionHistoryProps) {
  const [data, setData] = useState<TransactionsResponse>(initialData);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<TransactionRecord | null>(null);

  // Quick Date Filter
  const [datePreset, setDatePreset] = useState<string>("all");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [customStart, setCustomStart] = useState<string>("");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [customEnd, setCustomEnd] = useState<string>("");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showCustomDate, setShowCustomDate] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (
    preset: string,
    status = selectedStatus,
    payment = selectedPayment
  ) => {
    setDatePreset(preset);

    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    const now = new Date();
    if (preset === "today") {
      startDate = now.toISOString().split("T")[0];
      endDate = startDate;
    } else if (preset === "7days") {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 6);
      startDate = past7.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
    } else if (preset === "30days") {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 29);
      startDate = past30.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
    }

    startTransition(async () => {
      const res = await getTransactionsAction({
        startDate,
        endDate,
        status,
        paymentMethod: payment,
        search: searchQuery,
      });
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await getTransactionsAction({
        startDate: customStart || undefined,
        endDate: customEnd || undefined,
        status: selectedStatus,
        paymentMethod: selectedPayment,
        search: searchQuery,
      });
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  const statusConfig: Record<
    OrderStatus,
    { label: string; variant: "mint" | "forest" | "leaf" | "amber" | "neutral" | "danger" | "blue" }
  > = {
    menunggu_bayar: { label: "Menunggu Bayar", variant: "amber" },
    dibayar: { label: "Sudah Dibayar", variant: "blue" },
    diproses: { label: "Sedang Dimasak", variant: "forest" },
    siap: { label: "Siap Diambil", variant: "mint" },
    diambil: { label: "Selesai (Diambil)", variant: "neutral" },
    dibatalkan: { label: "Dibatalkan", variant: "danger" },
    kedaluwarsa: { label: "Kedaluwarsa", variant: "neutral" },
  };

  const filteredTransactions = data.transactions.filter((tx) => {
    const matchStatus = selectedStatus === "all" || tx.status === selectedStatus;
    const matchPayment = selectedPayment === "all" || tx.paymentMethod === selectedPayment;
    const matchSearch =
      !searchQuery ||
      String(tx.queueNumber).padStart(3, "0").includes(searchQuery) ||
      tx.publicToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchPayment && matchSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 bg-white select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--line)]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--forest)] bg-[var(--surface-2)] px-3 py-1 rounded-[6px] border border-[var(--line)] mb-2">
            <Clock className="w-3.5 h-3.5 text-[var(--leaf)]" />
            <span>Riwayat Seluruh Pesanan</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-zinc-950 tracking-tight">
            Riwayat Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Pantau dan lacak seluruh pesanan masuk, status bayar, detail pesanan, dan konfirmasi transaksi toko.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => handleFilterChange(datePreset)}
          disabled={isPending}
          className="gap-2 text-xs sm:text-sm self-start sm:self-auto"
        >
          <RefreshCw className={cn("w-4 h-4 text-zinc-600", isPending && "animate-spin")} />
          <span>Segarkan</span>
        </Button>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-[var(--line)] bg-zinc-50/60 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
            Total Transaksi
          </span>
          <div className="font-heading font-bold text-xl text-zinc-950 tabular-nums">
            {data.summary.totalOrders} Pesanan
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--line)] bg-zinc-50/60 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
            Pesanan Sukses
          </span>
          <div className="font-heading font-bold text-xl text-[var(--forest)] tabular-nums">
            {data.summary.completedOrders} Selesai
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--line)] bg-zinc-50/60 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
            Dibatalkan / Batal
          </span>
          <div className="font-heading font-bold text-xl text-red-600 tabular-nums">
            {data.summary.cancelledOrders} Batal
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] space-y-1">
          <span className="text-[11px] font-semibold text-[var(--forest)] uppercase tracking-wide">
            Total Nilai Transaksi
          </span>
          <div className="font-heading font-bold text-xl text-[var(--forest)] font-mono tabular-nums">
            {formatRupiah(data.summary.totalRevenue)}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-zinc-50/80 border border-[var(--line)] rounded-2xl p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Date Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: "all", label: "Semua Waktu" },
              { id: "today", label: "Hari Ini" },
              { id: "7days", label: "7 Hari Terakhir" },
              { id: "30days", label: "30 Hari Terakhir" },
            ].map((p) => {
              const isSelected = datePreset === p.id && !showCustomDate;
              return (
                <button
                  key={p.id}
                  onClick={() => handleFilterChange(p.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all cursor-pointer border-2",
                    isSelected
                      ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] font-semibold"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari antrian / token / menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)] w-48 sm:w-64"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" className="h-9 text-xs">
              Cari
            </Button>
          </form>
        </div>

        {/* Status & Payment Method Dropdowns */}
        <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Status Pesanan:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                handleFilterChange(datePreset, e.target.value, selectedPayment);
              }}
              className="h-8 px-2.5 rounded-[6px] border-2 border-[var(--control)] bg-white text-xs text-zinc-800 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="menunggu_bayar">Menunggu Bayar</option>
              <option value="dibayar">Sudah Dibayar</option>
              <option value="diproses">Sedang Dimasak</option>
              <option value="siap">Siap Diambil</option>
              <option value="diambil">Selesai (Diambil)</option>
              <option value="dibatalkan">Dibatalkan</option>
              <option value="kedaluwarsa">Kedaluwarsa</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Metode Pembayaran:</span>
            <select
              value={selectedPayment}
              onChange={(e) => {
                setSelectedPayment(e.target.value);
                handleFilterChange(datePreset, selectedStatus, e.target.value);
              }}
              className="h-8 px-2.5 rounded-[6px] border-2 border-[var(--control)] bg-white text-xs text-zinc-800 focus:outline-none"
            >
              <option value="all">Semua Metode</option>
              <option value="cash">Tunai (Kasir)</option>
              <option value="qris">QRIS Toko</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-bold text-base text-zinc-900">
              Tidak Ada Transaksi Ditemukan
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Coba sesuaikan filter status, metode bayar, atau rentang tanggal untuk melihat transaksi lainnya.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[var(--surface-2)] text-[var(--forest)] font-semibold border-b border-[var(--line)]">
                  <th className="py-3 px-4">No. Antrian</th>
                  <th className="py-3 px-4">Waktu Transaksi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4">Item Pesanan</th>
                  <th className="py-3 px-4 text-right">Total Belanja</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTransactions.map((tx) => {
                  const statusInfo = statusConfig[tx.status] || {
                    label: tx.status,
                    variant: "neutral",
                  };
                  const dateObj = new Date(tx.createdAt);
                  const timeFormatted = new Intl.DateTimeFormat("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(dateObj);
                  const dateFormatted = new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(dateObj);

                  return (
                    <tr key={tx.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Queue Number */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-[6px] bg-[var(--surface-2)] border-2 border-[var(--forest)] font-heading font-bold text-xs text-[var(--forest)] font-mono">
                          #{String(tx.queueNumber).padStart(3, "0")}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-zinc-900">{timeFormatted} WIB</div>
                        <div className="text-[11px] text-zinc-400">{dateFormatted}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant={statusInfo.variant} size="sm">
                          {statusInfo.label}
                        </Badge>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-zinc-100 border border-zinc-200 text-zinc-800">
                          {tx.paymentMethod === "qris" ? (
                            <>
                              <CreditCard className="w-3 h-3 text-[var(--blue)]" />
                              <span>QRIS</span>
                            </>
                          ) : (
                            <>
                              <Receipt className="w-3 h-3 text-[var(--leaf)]" />
                              <span>Tunai</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Order Items preview */}
                      <td className="py-3 px-4 max-w-xs truncate text-zinc-700">
                        {tx.items.map((i) => `${i.qty}× ${i.productName}`).join(", ")}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 text-right font-bold text-zinc-950 font-mono tabular-nums text-sm whitespace-nowrap">
                        {formatRupiah(tx.total)}
                      </td>

                      {/* Detail CTA */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(tx)}
                          className="px-2.5 py-1 rounded-[6px] text-xs font-semibold text-[var(--forest)] bg-[var(--surface-2)] border border-[var(--forest)] hover:bg-[var(--mint)] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Nota</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL: Thermal Ticket View */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] w-full max-w-md p-6 space-y-5 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[var(--leaf)]" />
                <h3 className="font-heading font-bold text-lg text-zinc-950">
                  Rincian Transaksi
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Ticket Box */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-4 relative">
              {/* Queue Header */}
              <div className="text-center pb-3 border-b border-dashed border-zinc-300 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                  Nomor Antrian
                </span>
                <div className="font-heading font-bold text-3xl text-[var(--forest)] font-mono">
                  #{String(selectedOrder.queueNumber).padStart(3, "0")}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Badge variant={statusConfig[selectedOrder.status]?.variant || "neutral"} size="sm">
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </Badge>
                  <span className="text-xs text-zinc-400 font-mono">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(selectedOrder.createdAt))}
                  </span>
                </div>
              </div>

              {/* Items List with Dot Leaders */}
              <div className="space-y-2.5 text-xs">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="font-medium text-zinc-800">
                      <strong>{item.qty}×</strong> {item.productName}
                    </span>
                    <span className="dot-leader" aria-hidden="true" />
                    <span className="font-bold text-zinc-900 font-mono tabular-nums">
                      {formatRupiah(item.qty * item.priceSell)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total & Payment details */}
              <div className="pt-3 border-t border-dashed border-zinc-300 space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-zinc-950">
                  <span>TOTAL TAGIHAN</span>
                  <span className="font-mono text-base text-[var(--forest)]">
                    {formatRupiah(selectedOrder.total)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                  <span>Metode Pembayaran:</span>
                  <span className="font-semibold text-zinc-800 uppercase">
                    {selectedOrder.paymentMethod === "qris" ? "QRIS Toko" : "Tunai (Kasir)"}
                  </span>
                </div>

                {selectedOrder.paidConfirmedBy && (
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Konfirmasi Pembayaran:</span>
                    <span className="font-medium text-zinc-800 capitalize">
                      {selectedOrder.paidConfirmedBy === "customer"
                        ? "Mandiri (Pelanggan)"
                        : "Dikonfirmasi Kasir"}
                    </span>
                  </div>
                )}

                {selectedOrder.cancelReason && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 space-y-0.5 mt-2">
                    <span className="font-semibold block">Alasan Pembatalan:</span>
                    <span>{selectedOrder.cancelReason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedOrder(null)}
                className="w-full"
              >
                Tutup Nota
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
