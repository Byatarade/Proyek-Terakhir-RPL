import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { EmployeeData } from "@/lib/employees/actions";

interface ToggleStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmployee: EmployeeData | null;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function ToggleStatusModal({
  isOpen,
  onClose,
  targetEmployee,
  isSubmitting,
  onConfirm,
}: ToggleStatusModalProps) {
  if (!isOpen || !targetEmployee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white border-3 border-[var(--forest)] rounded-[8px] shadow-[6px_6px_0px_var(--forest)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-[var(--surface-2)] border-b-2 border-[var(--forest)] flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-[var(--forest)]">
            {targetEmployee.isActive
              ? "Nonaktifkan Pegawai?"
              : "Aktifkan Pegawai Kembali?"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[var(--muted)] hover:text-[var(--forest)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div
            className={cn(
              "p-3.5 rounded-[6px] border-2 text-xs space-y-1",
              targetEmployee.isActive
                ? "bg-red-50 border-red-500 text-red-900"
                : "bg-emerald-50 border-emerald-500 text-emerald-900"
            )}
          >
            {targetEmployee.isActive ? (
              <>
                <strong className="block font-bold">
                  Apakah Anda yakin ingin menonaktifkan akun{" "}
                  {targetEmployee.fullName}?
                </strong>
                <p className="text-[11px] leading-relaxed">
                  Pegawai ini akan langsung dikeluarkan dari sesi aktif dan tidak
                  dapat masuk ke dashboard lagi (BR-12). Riwayat transaksi masa lalu
                  tetap tersimpan utuh.
                </p>
              </>
            ) : (
              <>
                <strong className="block font-bold">
                  Aktifkan kembali akun {targetEmployee.fullName}?
                </strong>
                <p className="text-[11px] leading-relaxed">
                  Pegawai dapat kembali masuk ke dashboard menggunakan email dan
                  kata sandinya.
                </p>
              </>
            )}
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
              variant={targetEmployee.isActive ? "danger" : "primary"}
              size="md"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] font-bold"
            >
              {isSubmitting
                ? "Memproses..."
                : targetEmployee.isActive
                ? "Ya, Nonaktifkan"
                : "Ya, Aktifkan Kembali"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
