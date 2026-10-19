import React from "react";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { EmployeeData } from "@/lib/employees/actions";
import { ROLE_OPTIONS } from "./types";

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmployee: EmployeeData | null;
  newRoleInput: "kasir" | "koki" | "admin_gudang";
  onNewRoleChange: (val: "kasir" | "koki" | "admin_gudang") => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditRoleModal({
  isOpen,
  onClose,
  targetEmployee,
  newRoleInput,
  onNewRoleChange,
  isSubmitting,
  onSubmit,
}: EditRoleModalProps) {
  if (!isOpen || !targetEmployee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white border-3 border-[var(--forest)] rounded-[8px] shadow-[6px_6px_0px_var(--forest)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-[var(--surface-2)] border-b-2 border-[var(--forest)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--forest)]" />
            <h3 className="font-heading font-bold text-base text-[var(--forest)]">
              Ubah Peran: {targetEmployee.fullName}
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

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[var(--muted)]">
            Pilih peran baru untuk pegawai ini. Menu navigasi dashboard akan
            langsung disesuaikan saat mereka masuk.
          </p>

          <div className="space-y-2">
            {ROLE_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-[6px] border-2 cursor-pointer transition-all",
                  newRoleInput === opt.key
                    ? "bg-[var(--surface-2)] border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                    : "bg-white border-[var(--line)] hover:border-[var(--forest)]"
                )}
              >
                <input
                  type="radio"
                  name="edit_role_radio"
                  checked={newRoleInput === opt.key}
                  onChange={() => onNewRoleChange(opt.key)}
                  className="mt-1 w-4 h-4 text-[var(--leaf)] focus:ring-[var(--leaf)]"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {opt.icon}
                    <span className="font-heading font-bold text-xs sm:text-sm text-[var(--forest)]">
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-3 border-t-2 border-[var(--line)] flex justify-end gap-2">
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
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
            >
              {isSubmitting ? "Menyimpan..." : "Perbarui Peran"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
