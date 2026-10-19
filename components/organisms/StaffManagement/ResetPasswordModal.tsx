import React from "react";
import { KeyRound, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { EmployeeData } from "@/lib/employees/actions";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmployee: EmployeeData | null;
  newPasswordInput: string;
  onNewPasswordChange: (val: string) => void;
  showNewPassword: boolean;
  onToggleShowNewPassword: () => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  targetEmployee,
  newPasswordInput,
  onNewPasswordChange,
  showNewPassword,
  onToggleShowNewPassword,
  isSubmitting,
  onSubmit,
}: ResetPasswordModalProps) {
  if (!isOpen || !targetEmployee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white border-3 border-[var(--forest)] rounded-[8px] shadow-[6px_6px_0px_var(--forest)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-[var(--surface-2)] border-b-2 border-[var(--forest)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[var(--forest)]" />
            <h3 className="font-heading font-bold text-base text-[var(--forest)]">
              Reset Sandi: {targetEmployee.fullName}
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
          <div className="p-3 rounded-[6px] bg-amber-50 border-2 border-amber-500 text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Perhatian:</span>
            <p className="text-[11px] leading-relaxed">
              Masukkan kata sandi baru untuk <strong>{targetEmployee.email}</strong>.
              Berikan kata sandi baru ini kepada staf Anda setelah disimpan.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--forest)] uppercase tracking-wider block">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                minLength={6}
                value={newPasswordInput}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3 pr-10 py-2 rounded-[6px] border-2 border-[var(--forest)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mint)] shadow-[1px_1px_0px_var(--forest)]"
              />
              <button
                type="button"
                onClick={onToggleShowNewPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--forest)] focus:outline-none cursor-pointer"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
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
              {isSubmitting ? "Menyimpan..." : "Simpan Sandi Baru"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
