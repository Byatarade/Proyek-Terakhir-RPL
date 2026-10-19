import React from "react";
import { Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { EmployeeData } from "@/lib/employees/actions";

interface DeleteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmployee: EmployeeData | null;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function DeleteStaffModal({
  isOpen,
  onClose,
  targetEmployee,
  isSubmitting,
  onConfirm,
}: DeleteStaffModalProps) {
  if (!isOpen || !targetEmployee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white border-3 border-[var(--forest)] rounded-[8px] shadow-[6px_6px_0px_var(--forest)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-red-50 border-b-2 border-[var(--forest)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h3 className="font-heading font-bold text-base text-[var(--forest)]">
              Hapus Akun Pegawai?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[var(--muted)] hover:text-[var(--forest)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-[6px] border-2 border-red-500 bg-red-50 text-xs space-y-1.5 text-red-950">
            <strong className="block font-bold text-red-900 text-sm">
              Yakin ingin menghapus {targetEmployee.fullName}?
            </strong>
            <p className="text-[11px] text-red-800 leading-relaxed">
              Email login <strong>{targetEmployee.email}</strong> akan dihapus
              dari sistem toko dan tidak dapat masuk kembali.
            </p>
            <p className="text-[10px] text-zinc-500 italic pt-1 border-t border-red-200">
              Catatan: Akun Pemilik (Owner) diproteksi dan tidak dapat dihapus.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menghapus...</span>
                </span>
              ) : (
                "Ya, Hapus Pegawai"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
