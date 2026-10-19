import React from "react";
import Link from "next/link";
import { Wallet, Tag, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { formatRupiah } from "@/lib/utils";
import { ExpenseItem } from "@/lib/finance/actions";
import { DashboardProductProfit } from "@/app/dashboard/page";

interface RecentExpensesListProps {
  recentExpenses: ExpenseItem[];
  topProducts: DashboardProductProfit[];
  onOpenQuickExpense: () => void;
}

export function RecentExpensesList({
  recentExpenses,
  topProducts,
  onOpenQuickExpense,
}: RecentExpensesListProps) {
  return (
    <div className="lg:col-span-5 space-y-4">
      {/* Recent Expenses List */}
      <div className="bg-zinc-50 border border-[var(--line)] rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-[var(--danger)]" />
            <h4 className="font-heading font-bold text-xs sm:text-sm text-zinc-950">
              Biaya Operasional Terakhir
            </h4>
          </div>
          <Link
            href="/dashboard/laporan"
            className="text-[11px] font-semibold text-[var(--leaf)] hover:underline"
          >
            Kelola Biaya
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-400 bg-white rounded-xl border border-zinc-200">
            Belum ada pengeluaran yang dicatat bulan ini.
          </div>
        ) : (
          <div className="space-y-2">
            {recentExpenses.slice(0, 4).map((exp) => (
              <div
                key={exp.id}
                className="p-2.5 rounded-lg bg-white border border-zinc-200/80 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <span className="font-semibold text-zinc-900 block truncate">
                    {exp.category}
                  </span>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    {exp.note || exp.spent_on}
                  </span>
                </div>
                <span className="font-bold text-red-600 font-mono tabular-nums shrink-0">
                  {formatRupiah(exp.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenQuickExpense}
          className="w-full text-xs gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Catat Pengeluaran Baru</span>
        </Button>
      </div>

      {/* Top Profitable Products */}
      {topProducts.length > 0 && (
        <div className="bg-zinc-50 border border-[var(--line)] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[var(--leaf)]" />
              <h4 className="font-heading font-bold text-xs sm:text-sm text-zinc-950">
                Menu Paling Menguntungkan
              </h4>
            </div>
          </div>

          <div className="space-y-2">
            {topProducts.slice(0, 3).map((p) => (
              <div
                key={p.productName}
                className="p-2 rounded-lg bg-white border border-zinc-200/80 flex items-center justify-between text-xs"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-zinc-900 block truncate">
                    {p.productName}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Terjual {p.qtySold}×
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-[var(--forest)] font-mono tabular-nums block">
                    +{formatRupiah(p.grossProfit)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Margin {p.margin.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
