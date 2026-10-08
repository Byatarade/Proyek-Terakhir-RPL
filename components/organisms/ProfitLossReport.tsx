"use client";

import React, { useState, useTransition } from "react";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Filter,
  Search,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowUpRight,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowDownRight,
  Wallet,
  ShoppingBag,
  CreditCard,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  Building2,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  FileText,
  AlertCircle,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  CheckCircle2,
  X,
  Loader2,
  RefreshCw,
  PieChart,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Badge } from "@/components/atoms/Badge";
import { StatCard } from "@/components/molecules/StatCard";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DotLeader } from "@/components/molecules/DotLeader";
import { cn, formatRupiah } from "@/lib/utils";
import {
  ProfitLossReportData,
  ExpenseItem,
  SaveExpenseInput,
  getProfitLossReportAction,
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from "@/lib/finance/actions";
import { EXPENSE_CATEGORIES } from "@/lib/finance/constants";

export interface ProfitLossReportProps {
  initialData: ProfitLossReportData;
}

export function ProfitLossReport({ initialData }: ProfitLossReportProps) {
  const [data, setData] = useState<ProfitLossReportData>(initialData);
  const [activeTab, setActiveTab] = useState<"summary" | "expenses" | "products">("summary");
  const [activePreset, setActivePreset] = useState<string>(initialData.preset || "thisMonth");

  // Custom date range state
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStart, setCustomStart] = useState(initialData.startDate);
  const [customEnd, setCustomEnd] = useState(initialData.endDate);

  // Expense modal states
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [expenseForm, setExpenseForm] = useState<SaveExpenseInput>({
    spent_on: new Date().toISOString().split("T")[0],
    category: EXPENSE_CATEGORIES[0],
    amount: 50000,
    note: "",
  });
  const [expenseFormError, setExpenseFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null);

  // Expense tab filters
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>("all");
  const [expenseSearchQuery, setExpenseSearchQuery] = useState<string>("");

  // Product tab filters
  const [productSearchQuery, setProductSearchQuery] = useState<string>("");

  // Async loading transition
  const [isPending, startTransition] = useTransition();

  // Load report data by preset or custom range
  const handleApplyPreset = (preset: string) => {
    setActivePreset(preset);
    setShowCustomDate(false);

    startTransition(async () => {
      const res = await getProfitLossReportAction({ preset });
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;

    setActivePreset("custom");
    startTransition(async () => {
      const res = await getProfitLossReportAction({
        preset: "custom",
        startDate: customStart,
        endDate: customEnd,
      });
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  const handleRefresh = () => {
    startTransition(async () => {
      const res = await getProfitLossReportAction({
        preset: activePreset,
        startDate: customStart,
        endDate: customEnd,
      });
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  // Open add expense modal
  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      spent_on: new Date().toISOString().split("T")[0],
      category: EXPENSE_CATEGORIES[0],
      amount: 50000,
      note: "",
    });
    setExpenseFormError(null);
    setExpenseModalOpen(true);
  };

  // Open edit expense modal
  const handleOpenEditExpense = (item: ExpenseItem) => {
    setEditingExpense(item);
    setExpenseForm({
      spent_on: item.spent_on,
      category: item.category,
      amount: item.amount,
      note: item.note || "",
    });
    setExpenseFormError(null);
    setExpenseModalOpen(true);
  };

  // Save expense (Create / Update)
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.spent_on) {
      setExpenseFormError("Tanggal pengeluaran wajib diisi.");
      return;
    }
    if (!expenseForm.category.trim()) {
      setExpenseFormError("Kategori pengeluaran wajib dipilih.");
      return;
    }
    if (expenseForm.amount <= 0) {
      setExpenseFormError("Nominal harus lebih dari Rp 0.");
      return;
    }

    startTransition(async () => {
      if (editingExpense) {
        const res = await updateExpenseAction(editingExpense.id, expenseForm);
        if (!res.success) {
          setExpenseFormError(res.error || "Gagal memperbarui pengeluaran.");
          return;
        }
      } else {
        const res = await createExpenseAction(expenseForm);
        if (!res.success) {
          setExpenseFormError(res.error || "Gagal mencatat pengeluaran.");
          return;
        }
      }

      setExpenseModalOpen(false);
      // Reload report
      const updated = await getProfitLossReportAction({
        preset: activePreset,
        startDate: customStart,
        endDate: customEnd,
      });
      if (updated.success && updated.data) {
        setData(updated.data);
      }
    });
  };

  // Delete expense confirmation
  const handleConfirmDeleteExpense = () => {
    if (!expenseToDelete) return;

    startTransition(async () => {
      const res = await deleteExpenseAction(expenseToDelete.id);
      if (res.success) {
        setDeleteConfirmOpen(false);
        setExpenseToDelete(null);
        // Reload report
        const updated = await getProfitLossReportAction({
          preset: activePreset,
          startDate: customStart,
          endDate: customEnd,
        });
        if (updated.success && updated.data) {
          setData(updated.data);
        }
      }
    });
  };

  // Filtered expenses list
  const filteredExpenses = data.expenses.filter((exp) => {
    const matchCategory =
      expenseCategoryFilter === "all" || exp.category === expenseCategoryFilter;
    const matchSearch =
      !expenseSearchQuery ||
      (exp.note && exp.note.toLowerCase().includes(expenseSearchQuery.toLowerCase())) ||
      exp.category.toLowerCase().includes(expenseSearchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Filtered products list
  const filteredProducts = data.productSales.filter((prod) =>
    prod.productName.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 bg-white select-none">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[var(--line)]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--forest)] bg-[var(--surface-2)] px-3 py-1 rounded-[6px] border border-[var(--line)] mb-2">
            <Receipt className="w-3.5 h-3.5 text-[var(--leaf)]" />
            <span>{data.periodLabel}</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-zinc-950 tracking-tight">
            Riwayat Laba Rugi & Biaya
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal">
            Laporan lengkap omzet penjualan, harga pokok (HPP), laba kotor, dan riwayat pengeluaran operasional toko.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={handleRefresh}
            disabled={isPending}
            className="gap-2 text-xs sm:text-sm"
          >
            <RefreshCw className={cn("w-4 h-4 text-zinc-600", isPending && "animate-spin")} />
            <span>Segarkan Data</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAddExpense}
            className="gap-2 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pengeluaran</span>
          </Button>
        </div>
      </div>

      {/* Date Period Filter Bar */}
      <div className="bg-zinc-50/80 border border-[var(--line)] rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
            <Calendar className="w-4 h-4 text-[var(--leaf)]" />
            <span>Periode Laporan:</span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: "today", label: "Hari Ini" },
              { id: "7days", label: "7 Hari Terakhir" },
              { id: "30days", label: "30 Hari Terakhir" },
              { id: "thisMonth", label: "Bulan Ini" },
              { id: "lastMonth", label: "Bulan Lalu" },
            ].map((p) => {
              const isSelected = activePreset === p.id && !showCustomDate;
              return (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id)}
                  disabled={isPending}
                  className={cn(
                    "px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all cursor-pointer border-2",
                    isSelected
                      ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] font-semibold"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900"
                  )}
                >
                  {p.label}
                </button>
              );
            })}

            <button
              onClick={() => setShowCustomDate(!showCustomDate)}
              className={cn(
                "px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all cursor-pointer border-2 inline-flex items-center gap-1.5",
                activePreset === "custom" || showCustomDate
                  ? "bg-[var(--leaf)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] font-semibold"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
              )}
            >
              <Filter className="w-3 h-3" />
              <span>Kustom Tanggal</span>
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker Accordion */}
        {showCustomDate && (
          <form
            onSubmit={handleApplyCustomRange}
            className="pt-3 mt-2 border-t border-zinc-200/80 flex flex-wrap items-center gap-3 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Dari:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-9 px-2.5 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Sampai:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-9 px-2.5 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending}
              className="text-xs h-9"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Terapkan Rentang"
              )}
            </Button>
          </form>
        )}
      </div>

      {/* 5 Key Metric Cards (design.md & PRD 9.13 FR-LR-02) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* 1. Penjualan */}
        <StatCard
          label="Penjualan (Omset)"
          value={formatRupiah(data.totalRevenue)}
          subtitle={`${data.totalOrders} pesanan lunas`}
          icon={<DollarSign className="w-4 h-4 text-[var(--leaf)]" />}
        />

        {/* 2. HPP Modal Pokok */}
        <StatCard
          label="HPP (Modal Bahan)"
          value={formatRupiah(data.totalCogs)}
          subtitle="Modal pokok pesanan"
          icon={<ShoppingBag className="w-4 h-4 text-zinc-600" />}
        />

        {/* 3. Laba Kotor */}
        <StatCard
          label="Laba Kotor"
          value={formatRupiah(data.grossProfit)}
          subtitle={`Margin: ${data.grossMargin.toFixed(1)}%`}
          icon={<TrendingUp className="w-4 h-4 text-[var(--blue)]" />}
          trend={{
            value: `Margin ${data.grossMargin.toFixed(0)}%`,
            isPositive: data.grossProfit >= 0,
          }}
        />

        {/* 4. Pengeluaran / Biaya */}
        <StatCard
          label="Biaya & Pengeluaran"
          value={formatRupiah(data.totalExpenses)}
          subtitle={`${data.expenses.length} transaksi biaya`}
          icon={<Wallet className="w-4 h-4 text-[var(--danger)]" />}
        />

        {/* 5. Laba Bersih (Featured Hard Highlight Card) */}
        <div
          className={cn(
            "rounded-2xl p-5 border-2 flex flex-col justify-between transition-all duration-200 group relative overflow-hidden",
            data.netProfit >= 0
              ? "bg-[var(--surface-2)] border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)]"
              : "bg-red-50 border-[var(--danger)] shadow-[3px_3px_0px_var(--danger)]"
          )}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--forest)]">
              Laba Bersih (Net)
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-[6px] text-[10px] font-bold border",
                data.netProfit >= 0
                  ? "bg-[var(--mint)] text-[var(--forest)] border-[var(--forest)]"
                  : "bg-red-200 text-red-900 border-red-700"
              )}
            >
              {data.netMargin >= 0
                ? `Margin +${data.netMargin.toFixed(1)}%`
                : `Defisit ${data.netMargin.toFixed(1)}%`}
            </span>
          </div>

          <div className="space-y-1">
            <div
              className={cn(
                "font-heading font-bold text-2xl sm:text-[26px] tracking-tight tabular-nums leading-none",
                data.netProfit >= 0 ? "text-[var(--forest)]" : "text-red-700"
              )}
            >
              {formatRupiah(data.netProfit)}
            </div>
            <p className="text-[11px] text-zinc-600 font-medium pt-1">
              Laba Kotor − Pengeluaran
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[var(--line)]">
        <div className="flex gap-4 sm:gap-8 overflow-x-auto">
          {[
            { id: "summary", label: "Ringkasan & Karcis Laba Rugi", icon: Receipt },
            { id: "expenses", label: `Riwayat Biaya & Pengeluaran (${data.expenses.length})`, icon: Wallet },
            { id: "products", label: `Rincian Produk Terjual (${data.productSales.length})`, icon: ShoppingBag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex items-center gap-2 py-3 px-1 text-xs sm:text-sm font-semibold border-b-3 transition-colors cursor-pointer whitespace-nowrap",
                  isActive
                    ? "border-[var(--leaf)] text-[var(--forest)]"
                    : "border-transparent text-zinc-400 hover:text-zinc-700"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-[var(--leaf)]" : "text-zinc-400")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: RINGKASAN & KARCIS LABA RUGI */}
      {activeTab === "summary" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column (7 cols): Physical Thermal Ticket Style Financial Statement */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              {/* Ticket Notches (design.md 6.1) */}
              <div className="ticket-notch-left top-1/2 -translate-y-1/2" aria-hidden="true" />
              <div className="ticket-notch-right top-1/2 -translate-y-1/2" aria-hidden="true" />

              {/* Receipt Header */}
              <div className="text-center pb-5 border-b border-dashed border-[var(--line)] space-y-1">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] text-[var(--forest)] flex items-center justify-center mx-auto mb-2 border border-[var(--line)]">
                  <Receipt className="w-5 h-5 text-[var(--leaf)]" />
                </div>
                <h3 className="font-heading font-bold text-lg text-zinc-950 uppercase tracking-wide">
                  {data.storeName}
                </h3>
                <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                  Laporan Rekapitulasi Keuangan
                </p>
                <p className="text-[11px] font-medium text-zinc-600 mt-1">
                  Periode: {data.periodLabel}
                </p>
              </div>

              {/* Financial Line Items (Formula Hierarchy) */}
              <div className="py-5 space-y-3.5 text-xs sm:text-sm font-sans">
                {/* 1. Gross Revenue */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-700">
                    (+) Total Pendapatan Penjualan
                  </span>
                  <span className="dot-leader" aria-hidden="true" />
                  <span className="font-bold text-zinc-900 tabular-nums font-mono">
                    {formatRupiah(data.totalRevenue)}
                  </span>
                </div>

                {/* 2. COGS */}
                <div className="flex items-center justify-between text-zinc-600">
                  <span className="font-normal pl-4 text-xs">
                    (−) Harga Pokok Penjualan (HPP Bahan)
                  </span>
                  <span className="dot-leader" aria-hidden="true" />
                  <span className="font-medium text-zinc-600 tabular-nums font-mono">
                    ({formatRupiah(data.totalCogs)})
                  </span>
                </div>

                {/* Gross Profit Subtotal */}
                <div className="pt-2 pb-2 px-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                  <span className="font-semibold text-zinc-900 text-xs sm:text-sm">
                    (=) LABA KOTOR (Gross Profit)
                  </span>
                  <span className="font-bold text-[var(--forest)] tabular-nums font-mono text-sm sm:text-base">
                    {formatRupiah(data.grossProfit)}
                  </span>
                </div>

                {/* 3. Operational Expenses */}
                <div className="flex items-center justify-between text-zinc-600">
                  <span className="font-normal pl-4 text-xs">
                    (−) Total Biaya Operasional Toko
                  </span>
                  <span className="dot-leader" aria-hidden="true" />
                  <span className="font-medium text-red-600 tabular-nums font-mono">
                    ({formatRupiah(data.totalExpenses)})
                  </span>
                </div>

                {/* Perforation Divider */}
                <div className="border-b-2 border-dashed border-zinc-300 my-4" />

                {/* Final Net Profit */}
                <div
                  className={cn(
                    "p-4 rounded-xl border-2 flex items-center justify-between",
                    data.netProfit >= 0
                      ? "bg-[var(--surface-2)] border-[var(--forest)]"
                      : "bg-red-50 border-[var(--danger)]"
                  )}
                >
                  <div>
                    <span className="font-heading font-bold text-sm sm:text-base text-zinc-950 uppercase block">
                      TOTAL LABA BERSIH (NET)
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Laba Kotor − Biaya Operasional
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "font-heading font-bold text-xl sm:text-2xl tabular-nums font-mono block",
                        data.netProfit >= 0 ? "text-[var(--forest)]" : "text-red-700"
                      )}
                    >
                      {formatRupiah(data.netProfit)}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase">
                      Margin: {data.netMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Footer Notes */}
              <div className="pt-4 border-t border-dashed border-[var(--line)] text-center text-[11px] text-zinc-400 font-mono">
                Pencatatan resmi data kasir & transaksi PayBuy • Sesuai Standar Akuntansi UMKM
              </div>
            </div>

            {/* Daily Trends Table */}
            <div className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--leaf)]" />
                  <h4 className="font-heading font-bold text-sm sm:text-base text-zinc-950">
                    Rincian Performa Harian
                  </h4>
                </div>
                <span className="text-xs text-zinc-400">
                  {data.dailyTrends.length} hari
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[var(--surface-2)] text-[var(--forest)] font-semibold border-b border-[var(--line)]">
                      <th className="py-2.5 px-3 rounded-l-[6px]">Tanggal</th>
                      <th className="py-2.5 px-2 text-right">Pesanan</th>
                      <th className="py-2.5 px-3 text-right">Penjualan</th>
                      <th className="py-2.5 px-3 text-right">HPP Modal</th>
                      <th className="py-2.5 px-3 text-right">Biaya</th>
                      <th className="py-2.5 px-3 text-right rounded-r-[6px]">Laba Bersih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {data.dailyTrends.map((d) => (
                      <tr key={d.date} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-2 px-3 font-medium text-zinc-800 whitespace-nowrap">
                          {d.dateFormatted}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-zinc-500 font-mono">
                          {d.ordersCount}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-zinc-900 tabular-nums font-mono">
                          {formatRupiah(d.revenue)}
                        </td>
                        <td className="py-2 px-3 text-right text-zinc-500 tabular-nums font-mono">
                          {formatRupiah(d.cogs)}
                        </td>
                        <td className="py-2 px-3 text-right text-red-600 tabular-nums font-mono">
                          {d.expenses > 0 ? `-${formatRupiah(d.expenses)}` : "Rp 0"}
                        </td>
                        <td
                          className={cn(
                            "py-2 px-3 text-right font-bold tabular-nums font-mono whitespace-nowrap",
                            d.netProfit >= 0 ? "text-[var(--forest)]" : "text-red-600"
                          )}
                        >
                          {formatRupiah(d.netProfit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Payment Methods & Expense Category Share */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment Method Breakdown Card */}
            <div className="bg-white border border-[var(--line)] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[var(--blue)]" />
                <h4 className="font-heading font-bold text-sm sm:text-base text-zinc-950">
                  Metode Pembayaran Pelanggan
                </h4>
              </div>

              <div className="space-y-4">
                {data.paymentMethods.map((pm) => (
                  <div key={pm.method} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-800">
                        {pm.label} ({pm.count} transaksi)
                      </span>
                      <span className="font-bold text-zinc-950 font-mono tabular-nums">
                        {formatRupiah(pm.totalAmount)} ({pm.percentage}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          pm.method === "qris" ? "bg-[var(--blue)]" : "bg-[var(--leaf)]"
                        )}
                        style={{ width: `${pm.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Category Breakdown Card */}
            <div className="bg-white border border-[var(--line)] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[var(--danger)]" />
                  <h4 className="font-heading font-bold text-sm sm:text-base text-zinc-950">
                    Rincian Biaya per Kategori
                  </h4>
                </div>
                <button
                  onClick={() => setActiveTab("expenses")}
                  className="text-xs font-semibold text-[var(--leaf)] hover:underline cursor-pointer"
                >
                  Kelola Biaya
                </button>
              </div>

              {data.expenseCategories.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-400">
                  Belum ada catatan pengeluaran di periode ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.expenseCategories.map((ec) => (
                    <div key={ec.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-700">
                          {ec.category} ({ec.count}×)
                        </span>
                        <span className="font-semibold text-zinc-900 font-mono tabular-nums">
                          {formatRupiah(ec.totalAmount)} ({ec.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--danger)] opacity-80"
                          style={{ width: `${ec.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Information Callout */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-zinc-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-[var(--forest)]">
                <HelpCircle className="w-3.5 h-3.5 text-[var(--leaf)]" />
                <span>Bagaimana Laba Bersih Dihitung?</span>
              </div>
              <p className="leading-relaxed">
                Penjualan dari pesanan terkonfirmasi dikurangi modal harga pokok makanan (HPP), kemudian dikurangi total seluruh biaya operasional toko yang Anda catat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT & PENCATATAN PENGELUARAN */}
      {activeTab === "expenses" && (
        <div className="space-y-5">
          {/* Action & Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/70 p-4 rounded-2xl border border-[var(--line)]">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari catatan biaya..."
                  value={expenseSearchQuery}
                  onChange={(e) => setExpenseSearchQuery(e.target.value)}
                  className="h-9 pl-9 pr-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)] w-48 sm:w-64"
                />
              </div>

              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="h-9 px-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
              >
                <option value="all">Semua Kategori</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleOpenAddExpense}
              className="gap-2 text-xs sm:text-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Biaya Baru</span>
            </Button>
          </div>

          {/* Expenses Table */}
          <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
            {filteredExpenses.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
                  <Wallet className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-base text-zinc-900">
                  Belum Ada Pengeluaran Terdaftar
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Catat pengeluaran seperti belanja bahan baku, gas, plastik, atau gaji pegawai untuk mendapatkan laporan laba bersih yang presisi.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddExpense}
                  className="mt-2 text-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Catat Pengeluaran Pertama</span>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[var(--surface-2)] text-[var(--forest)] font-semibold border-b border-[var(--line)]">
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Kategori Biaya</th>
                      <th className="py-3 px-4">Keterangan / Catatan</th>
                      <th className="py-3 px-4 text-right">Nominal Pengeluaran</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-zinc-800 whitespace-nowrap">
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(exp.spent_on))}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-zinc-100 border border-zinc-200 text-zinc-800">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-600 max-w-xs truncate">
                          {exp.note || "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-red-600 font-mono tabular-nums text-sm whitespace-nowrap">
                          {formatRupiah(exp.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditExpense(exp)}
                              className="p-1.5 rounded-[6px] text-zinc-500 hover:text-[var(--forest)] hover:bg-zinc-100 transition-colors"
                              title="Ubah pengeluaran"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setExpenseToDelete(exp);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 rounded-[6px] text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus pengeluaran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Table Footer Summary */}
                  <tfoot>
                    <tr className="bg-zinc-50/80 font-bold border-t-2 border-[var(--line)]">
                      <td colSpan={3} className="py-3 px-4 text-right text-zinc-900">
                        Total Pengeluaran ({filteredExpenses.length} transaksi):
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 font-mono tabular-nums text-sm">
                        {formatRupiah(
                          filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
                        )}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RINCIAN PENJUALAN PER PRODUK */}
      {activeTab === "products" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/70 p-4 rounded-2xl border border-[var(--line)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama menu..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)] w-64"
              />
            </div>

            <div className="text-xs text-zinc-500 font-medium">
              Total {data.productSales.length} menu terjual pada periode ini
            </div>
          </div>

          <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-400">
                Belum ada data penjualan produk pada periode yang dipilih.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[var(--surface-2)] text-[var(--forest)] font-semibold border-b border-[var(--line)]">
                      <th className="py-3 px-4">Nama Menu</th>
                      <th className="py-3 px-3 text-center">Porsi Terjual</th>
                      <th className="py-3 px-4 text-right">Total Penjualan</th>
                      <th className="py-3 px-4 text-right">Total Modal (HPP)</th>
                      <th className="py-3 px-4 text-right">Laba Kotor</th>
                      <th className="py-3 px-4 text-right">Margin (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.productName} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-zinc-900">
                          {p.productName}
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-[var(--leaf)]">
                          {p.qtySold}×
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-zinc-900 font-mono tabular-nums">
                          {formatRupiah(p.totalRevenue)}
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-500 font-mono tabular-nums">
                          {formatRupiah(p.totalCost)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[var(--forest)] font-mono tabular-nums">
                          {formatRupiah(p.grossProfit)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-[6px] text-[10px] font-bold border",
                              p.profitMargin >= 30
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                            )}
                          >
                            {p.profitMargin.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-zinc-50/80 font-bold border-t-2 border-[var(--line)]">
                      <td className="py-3 px-4 text-zinc-900">Total Penjualan:</td>
                      <td className="py-3 px-3 text-center text-zinc-900 font-mono">
                        {filteredProducts.reduce((sum, p) => sum + p.qtySold, 0)}×
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-900 font-mono tabular-nums">
                        {formatRupiah(
                          filteredProducts.reduce((sum, p) => sum + p.totalRevenue, 0)
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-500 font-mono tabular-nums">
                        {formatRupiah(
                          filteredProducts.reduce((sum, p) => sum + p.totalCost, 0)
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--forest)] font-mono tabular-nums">
                        {formatRupiah(
                          filteredProducts.reduce((sum, p) => sum + p.grossProfit, 0)
                        )}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Form Catat / Ubah Pengeluaran */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[var(--leaf)]" />
                <h3 className="font-heading font-bold text-lg text-zinc-950">
                  {editingExpense ? "Ubah Data Pengeluaran" : "Catat Pengeluaran Baru"}
                </h3>
              </div>
              <button
                onClick={() => setExpenseModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {expenseFormError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{expenseFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveExpense} className="space-y-4">
              {/* Tanggal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Tanggal Pengeluaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={expenseForm.spent_on}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, spent_on: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-sm text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
                  required
                />
              </div>

              {/* Kategori */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Kategori Biaya <span className="text-red-500">*</span>
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, category: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-sm text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nominal Biaya */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Nominal Pengeluaran (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="500"
                    placeholder="Contoh: 75000"
                    value={expenseForm.amount || ""}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        amount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full h-11 pl-10 pr-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-sm font-mono font-bold text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
                    required
                  />
                </div>
                {expenseForm.amount > 0 && (
                  <p className="text-[11px] text-[var(--leaf)] font-medium">
                    Terbaca: {formatRupiah(expenseForm.amount)}
                  </p>
                )}
              </div>

              {/* Catatan / Keterangan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Catatan / Keterangan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Beli beras 10kg & minyak goreng di pasar"
                  value={expenseForm.note || ""}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, note: e.target.value })
                  }
                  className="w-full p-2.5 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[var(--line)]">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setExpenseModalOpen(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isPending}
                  className="gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingExpense ? "Simpan Perubahan" : "Simpan Pengeluaran"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Pengeluaran */}
      {deleteConfirmOpen && expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-heading font-bold text-lg text-zinc-950">
                Hapus Catatan Pengeluaran?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Pengeluaran <strong className="text-zinc-800">{expenseToDelete.category}</strong> sebesar{" "}
                <strong className="text-red-600 font-mono">{formatRupiah(expenseToDelete.amount)}</strong> akan dihapus permanen dari laporan keuangan.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setExpenseToDelete(null);
                }}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmDeleteExpense}
                disabled={isPending}
                className="gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Ya, Hapus Biaya</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
