"use client";

import React, { useState, useTransition } from "react";
import {
  SaveExpenseInput,
  createExpenseAction,
} from "@/lib/finance/actions";
import { EXPENSE_CATEGORIES } from "@/lib/finance/constants";

import {
  DashboardOverviewProps,
  PeriodView,
} from "./types";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStatCards } from "./DashboardStatCards";
import { ProfitLossSection } from "./ProfitLossSection";
import { DashboardNavigationCards } from "./DashboardNavigationCards";
import { QuickExpenseModal } from "./QuickExpenseModal";

export type { DashboardOverviewProps } from "./types";

export function DashboardOverview({
  storeName = "Toko Saya",
  storeSlug,
  isOpen,
  role = "owner",
  todaySales = 0,
  todayCogs = 0,
  todayGrossProfit = 0,
  todayExpenses = 0,
  todayNetProfit = 0,
  todayOrdersCount = 0,
  activeOrdersCount = 0,
  monthSales = 0,
  monthCogs = 0,
  monthGrossProfit = 0,
  monthExpenses = 0,
  monthNetProfit = 0,
  monthOrdersCount = 0,
  recentExpenses = [],
  topProducts = [],
}: DashboardOverviewProps) {
  const [periodView, setPeriodView] = useState<PeriodView>("today");
  const [quickExpenseModal, setQuickExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState<SaveExpenseInput>({
    spent_on: new Date().toISOString().split("T")[0],
    category: EXPENSE_CATEGORIES[0],
    amount: 50000,
    note: "",
  });
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOwner = role === "owner";

  const currentDateFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  const currentMonthFormatted = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Period active stats
  const activeSales = periodView === "today" ? todaySales : monthSales;
  const activeCogs = periodView === "today" ? todayCogs : monthCogs;
  const activeGrossProfit = periodView === "today" ? todayGrossProfit : monthGrossProfit;
  const activeExpenses = periodView === "today" ? todayExpenses : monthExpenses;
  const activeNetProfit = periodView === "today" ? todayNetProfit : monthNetProfit;
  const activeOrders = periodView === "today" ? todayOrdersCount : monthOrdersCount;

  const grossMargin = activeSales > 0 ? (activeGrossProfit / activeSales) * 100 : 0;
  const netMargin = activeSales > 0 ? (activeNetProfit / activeSales) * 100 : 0;

  // Submit quick expense from dashboard
  const handleQuickExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.spent_on) {
      setExpenseError("Tanggal wajib diisi.");
      return;
    }
    if (expenseForm.amount <= 0) {
      setExpenseError("Nominal pengeluaran harus lebih dari Rp 0.");
      return;
    }

    startTransition(async () => {
      const res = await createExpenseAction(expenseForm);
      if (!res.success) {
        setExpenseError(res.error || "Gagal mencatat biaya.");
        return;
      }
      setQuickExpenseModal(false);
      setExpenseForm({
        spent_on: new Date().toISOString().split("T")[0],
        category: EXPENSE_CATEGORIES[0],
        amount: 50000,
        note: "",
      });
      // Force refresh page to show updated stats
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 bg-white select-none">
      {/* Page Header */}
      <DashboardHeader
        storeName={storeName}
        storeSlug={storeSlug}
        currentDateFormatted={currentDateFormatted}
      />

      {/* Top 4 Quick Overview Stat Cards */}
      <DashboardStatCards
        todaySales={todaySales}
        todayOrdersCount={todayOrdersCount}
        todayNetProfit={todayNetProfit}
        todayGrossProfit={todayGrossProfit}
        activeOrdersCount={activeOrdersCount}
        isOpen={isOpen}
        isOwner={isOwner}
      />

      {/* FITUR LABA DAN RUGI PADA DASHBOARD (PRD Section 9.13 & design.md) */}
      {isOwner && (
        <ProfitLossSection
          periodView={periodView}
          setPeriodView={setPeriodView}
          currentMonthFormatted={currentMonthFormatted}
          currentDateFormatted={currentDateFormatted}
          activeSales={activeSales}
          activeCogs={activeCogs}
          activeGrossProfit={activeGrossProfit}
          activeExpenses={activeExpenses}
          activeNetProfit={activeNetProfit}
          activeOrders={activeOrders}
          grossMargin={grossMargin}
          netMargin={netMargin}
          recentExpenses={recentExpenses}
          topProducts={topProducts}
          onOpenQuickExpense={() => setQuickExpenseModal(true)}
        />
      )}

      {/* Navigation shortcuts (POS, Riwayat Transaksi, Laporan Laba Rugi) */}
      <DashboardNavigationCards />

      {/* MODAL: Form Catat Pengeluaran Cepat */}
      <QuickExpenseModal
        isOpen={quickExpenseModal}
        onClose={() => setQuickExpenseModal(false)}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        expenseError={expenseError}
        isPending={isPending}
        onSubmit={handleQuickExpenseSubmit}
      />
    </div>
  );
}
