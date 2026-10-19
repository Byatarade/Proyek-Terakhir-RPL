import React from "react";
import { UserPlus, X, Mail, Lock, Eye, EyeOff, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullNameInput: string;
  onFullNameChange: (val: string) => void;
  emailInput: string;
  onEmailChange: (val: string) => void;
  passwordInput: string;
  onPasswordChange: (val: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddStaffModal({
  isOpen,
  onClose,
  fullNameInput,
  onFullNameChange,
  emailInput,
  onEmailChange,
  passwordInput,
  onPasswordChange,
  showPassword,
  onToggleShowPassword,
  isSubmitting,
  onSubmit,
}: AddStaffModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-white border-3 border-[var(--forest)] rounded-[8px] shadow-[6px_6px_0px_var(--forest)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[var(--surface-2)] border-b-2 border-[var(--forest)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[var(--forest)] text-white flex items-center justify-center border-2 border-[var(--forest)] shadow-[1px_1px_0px_var(--forest)]">
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-[var(--forest)]">
                Tambah Pegawai Baru
              </h3>
              <span className="text-[11px] text-[var(--muted)]">
                Akun langsung aktif dan terhubung ke toko Anda
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[var(--muted)] hover:text-[var(--forest)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--forest)] uppercase tracking-wider block">
              Nama Lengkap Pegawai <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              required
              value={fullNameInput}
              onChange={(e) => onFullNameChange(e.target.value)}
              placeholder="Contoh: Siti Rahmawati"
              className="w-full px-3 py-2 rounded-[6px] border-2 border-[var(--forest)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mint)] shadow-[1px_1px_0px_var(--forest)]"
            />
          </div>

          {/* Email Login */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--forest)] uppercase tracking-wider block">
              Alamat Email Login <span className="text-[var(--danger)]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="nama.kasir@gmail.com"
                className="w-full pl-9 pr-3 py-2 rounded-[6px] border-2 border-[var(--forest)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mint)] shadow-[1px_1px_0px_var(--forest)]"
              />
            </div>
            <span className="text-[10px] text-[var(--muted)] block">
              Email ini digunakan staf untuk masuk di halaman <code>/masuk</code>.
            </span>
          </div>

          {/* Password Awal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--forest)] uppercase tracking-wider block">
              Kata Sandi Awal <span className="text-[var(--danger)]">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={passwordInput}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-9 pr-10 py-2 rounded-[6px] border-2 border-[var(--forest)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mint)] shadow-[1px_1px_0px_var(--forest)]"
              />
              <button
                type="button"
                onClick={onToggleShowPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--forest)] focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Info Peran Pegawai Kasir */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-[var(--forest)] uppercase tracking-wider block">
              Peran Akun
            </label>
            <div className="p-3.5 rounded-[6px] bg-[var(--surface-2)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] flex items-start gap-3">
              <div className="p-2 rounded-[6px] bg-[var(--mint)] border-2 border-[var(--forest)] shrink-0">
                <ShoppingBag className="w-5 h-5 text-[var(--forest)]" />
              </div>
              <div className="space-y-1">
                <div className="font-heading font-extrabold text-xs text-[var(--forest)]">
                  Kasir Toko (Operasional & Antrian)
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Akun ini bertugas melayani transaksi di kasir POS, memantau &
                  mengubah status pesanan (sedang dimasak), serta memanggil antrean
                  pelanggan.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t-2 border-[var(--line)] flex items-center justify-end gap-2.5">
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
              className="gap-2 font-bold border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuat Akun...</span>
                </>
              ) : (
                <span>Simpan & Buat Akun</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
