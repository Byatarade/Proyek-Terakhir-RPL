import React, { useState, useEffect } from "react";
import { Wallet, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { formatRupiah } from "@/lib/utils";
import { ExpenseItem, SaveExpenseInput } from "@/lib/finance/actions";
import { EXPENSE_CATEGORIES } from "@/lib/finance/constants";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingExpense: ExpenseItem | null;
  expenseForm: SaveExpenseInput;
  onExpenseFormChange: (form: SaveExpenseInput) => void;
  expenseFormError: string | null;
  isPending: boolean;
  onSaveExpense: (e: React.FormEvent) => void;
}

/** Format angka ke string dengan titik ribuan: 50000 → "50.000" */
function formatWithDots(value: number): string {
  if (!value) return "";
  return value.toLocaleString("id-ID");
}

/** Parse string dengan titik ribuan ke number: "50.000" → 50000 */
function parseDots(str: string): number {
  const clean = str.replace(/\./g, "").replace(/,/g, "").replace(/\D/g, "");
  return clean ? Number(clean) : 0;
}

export function ExpenseModal({
  isOpen,
  onClose,
  editingExpense,
  expenseForm,
  onExpenseFormChange,
  expenseFormError,
  isPending,
  onSaveExpense,
}: ExpenseModalProps) {
  const [amountDisplay, setAmountDisplay] = useState("");

  // Sinkronkan display saat modal dibuka / data berubah
  useEffect(() => {
    if (isOpen) {
      setAmountDisplay(expenseForm.amount > 0 ? formatWithDots(expenseForm.amount) : "");
    }
  }, [isOpen, editingExpense]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, "").replace(/,/g, "").replace(/\D/g, "");
    const numeric = raw ? Number(raw) : 0;
    setAmountDisplay(raw ? formatWithDots(numeric) : "");
    onExpenseFormChange({ ...expenseForm, amount: numeric });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[var(--leaf)]" />
            <h3 className="font-heading font-bold text-lg text-zinc-950">
              {editingExpense
                ? "Ubah Data Pengeluaran"
                : "Catat Pengeluaran Baru"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
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

        <form onSubmit={onSaveExpense} className="space-y-4">
          {/* Tanggal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 block">
              Tanggal Pengeluaran <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={expenseForm.spent_on}
              onChange={(e) =>
                onExpenseFormChange({ ...expenseForm, spent_on: e.target.value })
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
                onExpenseFormChange({ ...expenseForm, category: e.target.value })
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 pointer-events-none select-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountDisplay}
                onChange={handleAmountChange}
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
                onExpenseFormChange({ ...expenseForm, note: e.target.value })
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
              <span>
                {editingExpense ? "Simpan Perubahan" : "Simpan Pengeluaran"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
