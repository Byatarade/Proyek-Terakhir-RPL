"use client";

import React, { useState, useTransition } from "react";
import { Clock, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import {
  TransactionRecord,
  TransactionsResponse,
  getTransactionsAction,
} from "@/lib/transactions/actions";

import { TransactionHistoryProps } from "./types";
import { TransactionStatCards } from "./TransactionStatCards";
import { TransactionFilterBar } from "./TransactionFilterBar";
import { TransactionTable } from "./TransactionTable";
import { TransactionReceiptModal } from "./TransactionReceiptModal";

export type { TransactionHistoryProps } from "./types";

export function TransactionHistory({ initialData }: TransactionHistoryProps) {
  const [data, setData] = useState<TransactionsResponse>(initialData);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<TransactionRecord | null>(null);
  const [datePreset, setDatePreset] = useState<string>("all");

  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (
    preset: string,
    status = selectedStatus,
    payment = selectedPayment
  ) => {
    setDatePreset(preset);
    setSelectedStatus(status);
    setSelectedPayment(payment);

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
        status: selectedStatus,
        paymentMethod: selectedPayment,
        search: searchQuery,
      });
      if (res.success && res.data) {
        setData(res.data);
      }
    });
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

  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) {
      alert("Tidak ada transaksi yang dapat diekspor.");
      return;
    }

    const headers = [
      "ID Pesanan",
      "No. Antrian",
      "Tanggal",
      "Waktu Pesan",
      "Status Pesanan",
      "Metode Pembayaran",
      "Konfirmasi Bayar Oleh",
      "Waktu Bayar",
      "Total Transaksi (Rp)",
      "Rincian Menu",
      "Jumlah Item",
      "Alasan Pembatalan",
      "Token Akses",
    ];

    const statusLabelMap: Record<string, string> = {
      menunggu_bayar: "Menunggu Bayar",
      dibayar: "Sudah Dibayar",
      diproses: "Sedang Dimasak",
      siap: "Siap Diambil",
      diambil: "Selesai (Diambil)",
      dibatalkan: "Dibatalkan",
      kedaluwarsa: "Kedaluwarsa",
    };

    const paymentLabelMap: Record<string, string> = {
      cash: "Tunai",
      qris: "QRIS",
    };

    const confirmerLabelMap: Record<string, string> = {
      cashier: "Kasir",
      customer: "Pelanggan",
      gateway: "Payment Gateway",
    };

    const escapeCsv = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredTransactions.map((tx) => {
      const queueFormatted = String(tx.queueNumber).padStart(3, "0");
      const dateFormatted = tx.queueDate || (tx.createdAt ? tx.createdAt.split("T")[0] : "-");
      const timeFormatted = tx.createdAt
        ? new Date(tx.createdAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";

      const paidAtFormatted = tx.paidAt
        ? new Date(tx.paidAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";

      const statusLabel = statusLabelMap[tx.status] || tx.status;
      const paymentLabel = paymentLabelMap[tx.paymentMethod] || tx.paymentMethod;
      const confirmerLabel = tx.paidConfirmedBy
        ? confirmerLabelMap[tx.paidConfirmedBy] || tx.paidConfirmedBy
        : "-";

      const menuDetails = tx.items
        .map(
          (item) =>
            `${item.qty}x ${item.productName} (@Rp ${item.priceSell.toLocaleString("id-ID")})`
        )
        .join("; ");

      const totalQty = tx.items.reduce((sum, it) => sum + it.qty, 0);

      return [
        escapeCsv(tx.id),
        escapeCsv(`#${queueFormatted}`),
        escapeCsv(dateFormatted),
        escapeCsv(timeFormatted),
        escapeCsv(statusLabel),
        escapeCsv(paymentLabel),
        escapeCsv(confirmerLabel),
        escapeCsv(paidAtFormatted),
        escapeCsv(tx.total),
        escapeCsv(menuDetails),
        escapeCsv(totalQty),
        escapeCsv(tx.cancelReason || "-"),
        escapeCsv(tx.publicToken),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute(
      "download",
      `riwayat-transaksi-${data.storeSlug || "toko"}-${dateStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={handleExportCsv}
            disabled={isPending || filteredTransactions.length === 0}
            className="gap-2 text-xs sm:text-sm font-semibold cursor-pointer"
            title="Unduh rekapan riwayat transaksi dalam format CSV / Excel"
          >
            <Download className="w-4 h-4 text-[var(--leaf)]" />
            <span>Ekspor CSV ({filteredTransactions.length})</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => handleFilterChange(datePreset)}
            disabled={isPending}
            className="gap-2 text-xs sm:text-sm self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={cn("w-4 h-4 text-zinc-600", isPending && "animate-spin")} />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* Summary Stat Pills */}
      <TransactionStatCards
        totalOrders={data.summary.totalOrders}
        completedOrders={data.summary.completedOrders}
        cancelledOrders={data.summary.cancelledOrders}
        totalRevenue={data.summary.totalRevenue}
      />

      {/* Filters Bar */}
      <TransactionFilterBar
        datePreset={datePreset}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        selectedStatus={selectedStatus}
        selectedPayment={selectedPayment}
      />

      {/* Transactions Table */}
      <TransactionTable
        transactions={filteredTransactions}
        onSelectOrder={setSelectedOrder}
      />

      {/* DETAIL MODAL: Thermal Ticket View */}
      <TransactionReceiptModal
        selectedOrder={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
