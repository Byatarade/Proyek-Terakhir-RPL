"use client";

import React, { useState, useTransition } from "react";
import { Receipt, RefreshCw, Plus, Wallet, ShoppingBag } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
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

import { ProfitLossReportProps } from "./types";
import { PeriodFilterBar } from "./PeriodFilterBar";
import { SummaryMetrics } from "./SummaryMetrics";
import { SummaryTab } from "./SummaryTab";
import { ExpensesTab } from "./ExpensesTab";
import { ProductSalesTab } from "./ProductSalesTab";
import { ExpenseModal } from "./ExpenseModal";
import { DeleteExpenseModal } from "./DeleteExpenseModal";

export * from "./types";

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
            Laporan lengkap omzet penjualan, harga pokok (HPP), laba kotor, dan
            riwayat pengeluaran operasional toko.
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
            <RefreshCw
              className={cn("w-4 h-4 text-zinc-600", isPending && "animate-spin")}
            />
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
      <PeriodFilterBar
        activePreset={activePreset}
        showCustomDate={showCustomDate}
        onToggleCustomDate={() => setShowCustomDate(!showCustomDate)}
        onApplyPreset={handleApplyPreset}
        customStart={customStart}
        onCustomStartChange={setCustomStart}
        customEnd={customEnd}
        onCustomEndChange={setCustomEnd}
        onApplyCustomRange={handleApplyCustomRange}
        isPending={isPending}
      />

      {/* 5 Key Metric Cards */}
      <SummaryMetrics data={data} />

      {/* Tabs Navigation */}
      <div className="border-b border-[var(--line)]">
        <div className="flex gap-4 sm:gap-8 overflow-x-auto">
          {[
            {
              id: "summary",
              label: "Ringkasan & Karcis Laba Rugi",
              icon: Receipt,
            },
            {
              id: "expenses",
              label: `Riwayat Biaya & Pengeluaran (${data.expenses.length})`,
              icon: Wallet,
            },
            {
              id: "products",
              label: `Rincian Produk Terjual (${data.productSales.length})`,
              icon: ShoppingBag,
            },
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
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-[var(--leaf)]" : "text-zinc-400"
                  )}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: RINGKASAN & KARCIS LABA RUGI */}
      {activeTab === "summary" && (
        <SummaryTab
          data={data}
          onSwitchToExpensesTab={() => setActiveTab("expenses")}
        />
      )}

      {/* TAB 2: RIWAYAT & PENCATATAN PENGELUARAN */}
      {activeTab === "expenses" && (
        <ExpensesTab
          expenses={data.expenses}
          expenseSearchQuery={expenseSearchQuery}
          onExpenseSearchQueryChange={setExpenseSearchQuery}
          expenseCategoryFilter={expenseCategoryFilter}
          onExpenseCategoryFilterChange={setExpenseCategoryFilter}
          onOpenAddExpense={handleOpenAddExpense}
          onOpenEditExpense={handleOpenEditExpense}
          onOpenDeleteExpense={(item) => {
            setExpenseToDelete(item);
            setDeleteConfirmOpen(true);
          }}
        />
      )}

      {/* TAB 3: RINCIAN PENJUALAN PER PRODUK */}
      {activeTab === "products" && (
        <ProductSalesTab
          productSales={data.productSales}
          productSearchQuery={productSearchQuery}
          onProductSearchQueryChange={setProductSearchQuery}
        />
      )}

      {/* MODAL: Form Catat / Ubah Pengeluaran */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        editingExpense={editingExpense}
        expenseForm={expenseForm}
        onExpenseFormChange={setExpenseForm}
        expenseFormError={expenseFormError}
        isPending={isPending}
        onSaveExpense={handleSaveExpense}
      />

      {/* MODAL: Konfirmasi Hapus Pengeluaran */}
      <DeleteExpenseModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setExpenseToDelete(null);
        }}
        expenseToDelete={expenseToDelete}
        isPending={isPending}
        onConfirmDelete={handleConfirmDeleteExpense}
      />
    </div>
  );
}
