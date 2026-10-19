import React from "react";
import { Wallet, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { formatRupiah } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/finance/constants";
import { QuickExpenseModalProps } from "./types";

export function QuickExpenseModal({
  isOpen,
  onClose,
  expenseForm,
  setExpenseForm,
  expenseError,
  isPending,
  onSubmit,
}: QuickExpenseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[var(--leaf)]" />
            <h3 className="font-heading font-bold text-lg text-zinc-950">
              Catat Pengeluaran Toko
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {expenseError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{expenseError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 block">
              Tanggal Pengeluaran <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={expenseForm.spent_on}
              onChange={(e) =>
                setExpenseForm((prev) => ({ ...prev, spent_on: e.target.value }))
              }
              className="w-full h-11 px-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-sm text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 block">
              Kategori Biaya <span className="text-red-500">*</span>
            </label>
            <select
              value={expenseForm.category}
              onChange={(e) =>
                setExpenseForm((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full h-11 px-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-sm text-zinc-900 focus:outline-none focus:border-[var(--leaf)] cursor-pointer"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

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
                placeholder="Contoh: 50000"
                value={expenseForm.amount || ""}
                onChange={(e) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    amount: Number(e.target.value) || 0,
                  }))
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 block">
              Catatan / Keterangan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Beli telur 2kg dan minyak goreng"
              value={expenseForm.note || ""}
              onChange={(e) =>
                setExpenseForm((prev) => ({ ...prev, note: e.target.value }))
              }
              className="w-full p-2.5 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
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
              <span>Simpan Pengeluaran</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
