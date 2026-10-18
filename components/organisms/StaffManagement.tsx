"use client";

import React, { useState, useTransition } from "react";
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  UserX,
  UserCheck,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  UtensilsCrossed,
  Package,
  Crown,
  X,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { cn } from "@/lib/utils";
import {
  createEmployeeAction,
  updateEmployeeRoleAction,
  resetEmployeePasswordAction,
  toggleEmployeeStatusAction,
  EmployeeData,
} from "@/lib/employees/actions";

interface RoleOption {
  key: "kasir" | "koki" | "admin_gudang";
  label: string;
  badgeVariant: "mint" | "brick" | "neutral";
  icon: React.ReactNode;
  desc: string;
  features: string[];
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    key: "kasir",
    label: "Kasir (Operasional)",
    badgeVariant: "mint",
    icon: <ShoppingBag className="w-4 h-4 text-[var(--leaf)]" />,
    desc: "Melayani transaksi kasir POS, mengubah status masak, dan memanggil antrean pelanggan.",
    features: ["Kasir POS (Input Menu)", "Layar Kasir & Antrian", "Mulai Masak & Panggil Antrian", "Riwayat Transaksi"],
  },
  {
    key: "koki",
    label: "Koki (Dapur)",
    badgeVariant: "brick",
    icon: <UtensilsCrossed className="w-4 h-4 text-[var(--brick)]" />,
    desc: "Memproses pesanan makanan & minuman di dapur.",
    features: ["Layar Dapur", "Mulai Masak Pesanan", "Tandai Pesanan Siap Diambil"],
  },
  {
    key: "admin_gudang",
    label: "Admin Gudang (Logistik)",
    badgeVariant: "neutral",
    icon: <Package className="w-4 h-4 text-zinc-600" />,
    desc: "Mengelola ketersediaan menu dan harga modal.",
    features: ["Kelola Produk & Kategori", "Atur Stok & Tanda Habis", "Lihat & Atur Harga Pokok"],
  },
];

export interface StaffManagementProps {
  initialEmployees?: EmployeeData[];
}

export function StaffManagement({ initialEmployees = [] }: StaffManagementProps) {
  const [employees, setEmployees] = useState<EmployeeData[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isConfirmToggleModalOpen, setIsConfirmToggleModalOpen] = useState(false);

  // Target Employee for Modals
  const [targetEmployee, setTargetEmployee] = useState<EmployeeData | null>(null);

  // Form States for Add Modal
  const [fullNameInput, setFullNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"kasir" | "koki" | "admin_gudang">("kasir");

  // Form State for Edit Role Modal
  const [newRoleInput, setNewRoleInput] = useState<"kasir" | "koki" | "admin_gudang">("kasir");

  // Form State for Reset Password Modal
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Pending transitions
  const [isSubmitting, startTransition] = useTransition();

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Submit Tambah Pegawai Baru
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await createEmployeeAction({
        fullName: fullNameInput,
        email: emailInput,
        password: passwordInput,
        role: selectedRole,
      });

      if (res.success && res.data) {
        setEmployees((prev) => [...prev, res.data!]);
        setIsAddModalOpen(false);
        setFullNameInput("");
        setEmailInput("");
        setPasswordInput("");
        setSelectedRole("kasir");
        showNotification(`Akun pegawai ${res.data.fullName} berhasil dibuat.`);
      } else {
        setErrorMessage(res.error || "Gagal membuat akun pegawai.");
      }
    });
  };

  // Submit Ubah Role
  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmployee) return;

    startTransition(async () => {
      const res = await updateEmployeeRoleAction(targetEmployee.id, newRoleInput);
      if (res.success) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === targetEmployee.id ? { ...emp, role: newRoleInput } : emp
          )
        );
        setIsEditRoleModalOpen(false);
        showNotification(`Peran pegawai ${targetEmployee.fullName} berhasil diubah.`);
      } else {
        setErrorMessage(res.error || "Gagal mengubah peran pegawai.");
      }
    });
  };

  // Submit Reset Kata Sandi
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmployee) return;

    startTransition(async () => {
      const res = await resetEmployeePasswordAction(targetEmployee.id, newPasswordInput);
      if (res.success) {
        setIsResetPasswordModalOpen(false);
        setNewPasswordInput("");
        showNotification(`Kata sandi akun ${targetEmployee.fullName} berhasil diubah.`);
      } else {
        setErrorMessage(res.error || "Gagal mengatur ulang kata sandi.");
      }
    });
  };

  // Submit Toggle Status Aktif
  const handleConfirmToggle = () => {
    if (!targetEmployee) return;

    startTransition(async () => {
      const res = await toggleEmployeeStatusAction(targetEmployee.id);
      if (res.success && res.data) {
        const nextState = res.data.isActive;
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === targetEmployee.id ? { ...emp, isActive: nextState } : emp
          )
        );
        setIsConfirmToggleModalOpen(false);
        showNotification(
          nextState
            ? `Akun ${targetEmployee.fullName} berhasil diaktifkan kembali.`
            : `Akun ${targetEmployee.fullName} telah dinonaktifkan.`
        );
      } else {
        setErrorMessage(res.error || "Gagal memperbarui status pegawai.");
      }
    });
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      filterRole === "all" || emp.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Role Statistics
  const totalStaff = employees.length;
  const totalKasir = employees.filter((e) => e.role === "kasir" && e.isActive).length;
  const totalKoki = employees.filter((e) => e.role === "koki" && e.isActive).length;
  const totalGudang = employees.filter((e) => e.role === "admin_gudang" && e.isActive).length;

  return (
    <div className="space-y-6 sm:space-y-8 bg-white max-w-5xl">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[var(--line)] pb-5">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-[var(--forest)] flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--forest)]" />
            <span>Manajemen Pegawai & Staf Toko</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Buat dan kelola akun kasir untuk transaksi POS, status proses masak, dan pemanggilan antrian pelanggan.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => {
            setErrorMessage(null);
            setIsAddModalOpen(true);
          }}
          className="gap-2 font-bold text-xs sm:text-sm border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Kasir Baru</span>
        </Button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-[8px] bg-emerald-50 border-2 border-[var(--leaf)] text-emerald-900 shadow-[3px_3px_0px_var(--forest)] flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[var(--leaf)] shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-[8px] bg-red-50 border-2 border-[var(--danger)] text-red-900 shadow-[3px_3px_0px_var(--danger)] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--danger)] shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">{errorMessage}</div>
        </div>
      )}

      {/* 2. Stat Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-[8px] bg-white border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Total Pengguna
          </span>
          <div className="font-heading font-extrabold text-2xl text-[var(--forest)]">
            {totalStaff}
          </div>
          <span className="text-[11px] text-[var(--muted)] block">Owner & Kasir</span>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--leaf)] flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Kasir Aktif</span>
          </span>
          <div className="font-heading font-extrabold text-2xl text-[var(--forest)]">
            {totalKasir}
          </div>
          <span className="text-[11px] text-[var(--muted)] block">Operasional & Antrian</span>
        </div>

        <div className="p-3.5 rounded-[8px] bg-emerald-50 border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--leaf)] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hak Akses</span>
          </span>
          <div className="font-heading font-extrabold text-lg text-[var(--forest)] mt-1">
            Kasir Terpadu
          </div>
          <span className="text-[11px] text-[var(--muted)] block">POS, Masak & Panggil</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-9 pr-3 py-2 rounded-[6px] border-2 border-[var(--forest)] bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mint)] shadow-[1px_1px_0px_var(--forest)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto select-none">
          <span className="text-[11px] font-bold text-[var(--forest)] uppercase tracking-wider shrink-0">
            Peran:
          </span>
          <div className="flex gap-1.5 shrink-0">
            {[
              { key: "all", label: "Semua" },
              { key: "owner", label: "Owner" },
              { key: "kasir", label: "Kasir" },
            ].map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setFilterRole(r.key)}
                className={cn(
                  "px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all border-2 cursor-pointer select-none",
                  filterRole === r.key
                    ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[1px_1px_0px_var(--forest)]"
                    : "bg-white text-[var(--forest)] border-[var(--forest)] hover:bg-zinc-100"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Daftar Pegawai (Table) */}
      <div className="bg-white border-2 border-[var(--forest)] rounded-[8px] shadow-[4px_4px_0px_var(--forest)] overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-[var(--muted)] mx-auto" />
            <h3 className="font-heading font-bold text-base text-[var(--forest)]">
              Tidak Ada Pegawai Ditemukan
            </h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              {searchQuery
                ? "Tidak ada staf yang cocok dengan kriteria pencarian."
                : "Belum ada staf pegawai tambahan. Tambahkan akun kasir atau koki pertama Anda!"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--surface-2)] border-b-2 border-[var(--forest)] text-[10px] font-heading font-bold text-[var(--forest)] uppercase tracking-wider select-none">
                  <th className="py-3 px-4">Nama Pegawai</th>
                  <th className="py-3 px-4">Email Login</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Status Akun</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--line)]">
                {filteredEmployees.map((emp) => {
                  const isOwner = emp.role === "owner";
                  const roleConfig = ROLE_OPTIONS.find((r) => r.key === emp.role);

                  return (
                    <tr
                      key={emp.id}
                      className={cn(
                        "hover:bg-[var(--surface-2)]/50 transition-colors",
                        !emp.isActive && "bg-zinc-50/70 opacity-70"
                      )}
                    >
                      {/* Nama & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-[6px] border-2 flex items-center justify-center font-heading font-extrabold text-xs shadow-[1px_1px_0px_var(--forest)] shrink-0",
                              isOwner
                                ? "bg-[var(--forest)] text-white border-[var(--forest)]"
                                : emp.role === "kasir"
                                ? "bg-[var(--mint)] text-[var(--forest)] border-[var(--forest)]"
                                : emp.role === "koki"
                                ? "bg-amber-100 text-[#8c3e16] border-[var(--forest)]"
                                : "bg-zinc-100 text-zinc-800 border-[var(--forest)]"
                            )}
                          >
                            {emp.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-heading font-bold text-sm text-[var(--forest)] flex items-center gap-1.5 truncate">
                              <span>{emp.fullName}</span>
                              {emp.isCurrentUser && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--mint)] border border-[var(--forest)] font-extrabold">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[var(--muted)]">
                              Terdaftar:{" "}
                              {new Date(emp.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono font-medium text-xs text-zinc-700">
                        {emp.email}
                      </td>

                      {/* Role Pill */}
                      <td className="py-3.5 px-4">
                        {isOwner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[var(--forest)] text-white border-2 border-[var(--forest)] font-heading font-bold text-[11px] shadow-[1px_1px_0px_var(--mint)]">
                            <Crown className="w-3.5 h-3.5 text-amber-300" />
                            <span>Pemilik Toko (Owner)</span>
                          </span>
                        ) : roleConfig ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border-2 font-heading font-bold text-[11px] shadow-[1px_1px_0px_var(--forest)]",
                              roleConfig.key === "kasir" &&
                                "bg-[var(--mint)] text-[var(--forest)] border-[var(--forest)]",
                              roleConfig.key === "koki" &&
                                "bg-amber-100 text-[#8c3e16] border-[var(--forest)]",
                              roleConfig.key === "admin_gudang" &&
                                "bg-zinc-100 text-zinc-800 border-[var(--forest)]"
                            )}
                          >
                            {roleConfig.icon}
                            <span>{roleConfig.label}</span>
                          </span>
                        ) : (
                          <Badge variant="neutral">{emp.role}</Badge>
                        )}
                      </td>

                      {/* Status Aktif */}
                      <td className="py-3.5 px-4">
                        {emp.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-600 font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-red-50 text-red-800 border border-red-400 font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            <span>Dinonaktifkan</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isOwner ? (
                          <span className="text-[11px] text-[var(--muted)] italic">
                            Akses Utama
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Ubah Peran */}
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setTargetEmployee(emp);
                                setNewRoleInput(
                                  emp.role === "owner" ? "kasir" : emp.role
                                );
                                setIsEditRoleModalOpen(true);
                              }}
                              className="text-[11px] font-bold border-2 border-[var(--forest)] shadow-[1px_1px_0px_var(--forest)] p-1.5 h-auto"
                              title="Ubah peran staf"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Role</span>
                            </Button>

                            {/* Reset Password */}
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setTargetEmployee(emp);
                                setNewPasswordInput("");
                                setIsResetPasswordModalOpen(true);
                              }}
                              className="text-[11px] font-bold border-2 border-[var(--forest)] shadow-[1px_1px_0px_var(--forest)] p-1.5 h-auto"
                              title="Reset kata sandi pegawai"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Sandi</span>
                            </Button>

                            {/* Toggle Aktif / Nonaktif (BR-12 & FR-EM-03) */}
                            <button
                              type="button"
                              onClick={() => {
                                setTargetEmployee(emp);
                                setIsConfirmToggleModalOpen(true);
                              }}
                              className={cn(
                                "p-1.5 rounded-[6px] border-2 font-bold transition-all text-[11px] cursor-pointer shadow-[1px_1px_0px_var(--forest)]",
                                emp.isActive
                                  ? "bg-white text-red-700 border-[var(--forest)] hover:bg-red-50"
                                  : "bg-[var(--mint)] text-[var(--forest)] border-[var(--forest)] hover:bg-[var(--leaf)] hover:text-white"
                              )}
                              title={
                                emp.isActive
                                  ? "Nonaktifkan pegawai"
                                  : "Aktifkan kembali pegawai"
                              }
                            >
                              {emp.isActive ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL: TAMBAH PEGAWAI BARU */}
      {isAddModalOpen && (
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
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-[var(--muted)] hover:text-[var(--forest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEmployee} className="p-5 sm:p-6 space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--forest)] uppercase tracking-wider block">
                  Nama Lengkap Pegawai <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
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
                    onChange={(e) => setEmailInput(e.target.value)}
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
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-10 py-2 rounded-[6px] border-2 border-[var(--forest)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mint)] shadow-[1px_1px_0px_var(--forest)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--forest)] focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                      Akun ini bertugas melayani transaksi di kasir POS, memantau & mengubah status pesanan (sedang dimasak), serta memanggil antrean pelanggan.
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
                  onClick={() => setIsAddModalOpen(false)}
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
      )}

      {/* 6. MODAL: UBAH PERAN PEGAWAI */}
      {isEditRoleModalOpen && targetEmployee && (
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
                onClick={() => setIsEditRoleModalOpen(false)}
                className="p-1 rounded text-[var(--muted)] hover:text-[var(--forest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="p-5 space-y-4">
              <p className="text-xs text-[var(--muted)]">
                Pilih peran baru untuk pegawai ini. Menu navigasi dashboard akan langsung disesuaikan saat mereka masuk.
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
                      onChange={() => setNewRoleInput(opt.key)}
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
                  onClick={() => setIsEditRoleModalOpen(false)}
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
      )}

      {/* 7. MODAL: RESET KATA SANDI */}
      {isResetPasswordModalOpen && targetEmployee && (
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
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="p-1 rounded text-[var(--muted)] hover:text-[var(--forest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-5 space-y-4">
              <div className="p-3 rounded-[6px] bg-amber-50 border-2 border-amber-500 text-xs text-amber-900 space-y-1">
                <span className="font-bold block">Perhatian:</span>
                <p className="text-[11px] leading-relaxed">
                  Masukkan kata sandi baru untuk <strong>{targetEmployee.email}</strong>. Berikan kata sandi baru ini kepada staf Anda setelah disimpan.
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
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 pr-10 py-2 rounded-[6px] border-2 border-[var(--forest)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mint)] shadow-[1px_1px_0px_var(--forest)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--forest)] focus:outline-none cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[var(--line)] flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsResetPasswordModalOpen(false)}
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
      )}

      {/* 8. MODAL: KONFIRMASI NONAKTIFKAN / AKTIFKAN */}
      {isConfirmToggleModalOpen && targetEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white border-3 border-[var(--forest)] rounded-[8px] shadow-[6px_6px_0px_var(--forest)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[var(--surface-2)] border-b-2 border-[var(--forest)] flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-[var(--forest)]">
                {targetEmployee.isActive ? "Nonaktifkan Pegawai?" : "Aktifkan Pegawai Kembali?"}
              </h3>
              <button
                type="button"
                onClick={() => setIsConfirmToggleModalOpen(false)}
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
                      Apakah Anda yakin ingin menonaktifkan akun {targetEmployee.fullName}?
                    </strong>
                    <p className="text-[11px] leading-relaxed">
                      Pegawai ini akan langsung dikeluarkan dari sesi aktif dan tidak dapat masuk ke dashboard lagi (BR-12). Riwayat transaksi masa lalu tetap tersimpan utuh.
                    </p>
                  </>
                ) : (
                  <>
                    <strong className="block font-bold">
                      Aktifkan kembali akun {targetEmployee.fullName}?
                    </strong>
                    <p className="text-[11px] leading-relaxed">
                      Pegawai dapat kembali masuk ke dashboard menggunakan email dan kata sandinya.
                    </p>
                  </>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsConfirmToggleModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant={targetEmployee.isActive ? "danger" : "primary"}
                  size="md"
                  onClick={handleConfirmToggle}
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
      )}
    </div>
  );
}
