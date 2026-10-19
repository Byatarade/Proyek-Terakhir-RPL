import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { formatRupiah } from "@/lib/utils";
import { ExpenseItem } from "@/lib/finance/actions";

interface DeleteExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToDelete: ExpenseItem | null;
  isPending: boolean;
  onConfirmDelete: () => void;
}

export function DeleteExpenseModal({
  isOpen,
  onClose,
  expenseToDelete,
  isPending,
  onConfirmDelete,
}: DeleteExpenseModalProps) {
  if (!isOpen || !expenseToDelete) return null;

  return (
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
            Pengeluaran{" "}
            <strong className="text-zinc-800">
              {expenseToDelete.category}
            </strong>{" "}
            sebesar{" "}
            <strong className="text-red-600 font-mono">
              {formatRupiah(expenseToDelete.amount)}
            </strong>{" "}
            akan dihapus permanen dari laporan keuangan.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={onConfirmDelete}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Ya, Hapus Biaya</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
