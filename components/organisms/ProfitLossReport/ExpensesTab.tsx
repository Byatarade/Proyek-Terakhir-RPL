import React, { useMemo } from "react";
import { Search, Plus, Wallet, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { formatRupiah } from "@/lib/utils";
import { ExpenseItem } from "@/lib/finance/actions";
import { EXPENSE_CATEGORIES } from "@/lib/finance/constants";

interface ExpensesTabProps {
  expenses: ExpenseItem[];
  expenseSearchQuery: string;
  onExpenseSearchQueryChange: (q: string) => void;
  expenseCategoryFilter: string;
  onExpenseCategoryFilterChange: (cat: string) => void;
  onOpenAddExpense: () => void;
  onOpenEditExpense: (item: ExpenseItem) => void;
  onOpenDeleteExpense: (item: ExpenseItem) => void;
}

export function ExpensesTab({
  expenses,
  expenseSearchQuery,
  onExpenseSearchQueryChange,
  expenseCategoryFilter,
  onExpenseCategoryFilterChange,
  onOpenAddExpense,
  onOpenEditExpense,
  onOpenDeleteExpense,
}: ExpensesTabProps) {
  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchCategory =
        expenseCategoryFilter === "all" ||
        exp.category === expenseCategoryFilter;
      const matchSearch =
        !expenseSearchQuery ||
        (exp.note &&
          exp.note.toLowerCase().includes(expenseSearchQuery.toLowerCase())) ||
        exp.category.toLowerCase().includes(expenseSearchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [expenses, expenseCategoryFilter, expenseSearchQuery]);

  return (
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
              onChange={(e) => onExpenseSearchQueryChange(e.target.value)}
              className="h-9 pl-9 pr-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)] w-48 sm:w-64"
            />
          </div>

          <select
            value={expenseCategoryFilter}
            onChange={(e) => onExpenseCategoryFilterChange(e.target.value)}
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
          onClick={onOpenAddExpense}
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
              Catat pengeluaran seperti belanja bahan baku, gas, plastik, atau
              gaji pegawai untuk mendapatkan laporan laba bersih yang presisi.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAddExpense}
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
                  <tr
                    key={exp.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
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
                          onClick={() => onOpenEditExpense(exp)}
                          className="p-1.5 rounded-[6px] text-zinc-500 hover:text-[var(--forest)] hover:bg-zinc-100 transition-colors cursor-pointer"
                          title="Ubah pengeluaran"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenDeleteExpense(exp)}
                          className="p-1.5 rounded-[6px] text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
                  <td
                    colSpan={3}
                    className="py-3 px-4 text-right text-zinc-900"
                  >
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
  );
}
