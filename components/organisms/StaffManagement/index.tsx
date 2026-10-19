"use client";

import React, { useState, useTransition } from "react";
import { Users, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import {
  createEmployeeAction,
  updateEmployeeRoleAction,
  resetEmployeePasswordAction,
  toggleEmployeeStatusAction,
  deleteEmployeeAction,
  EmployeeData,
} from "@/lib/employees/actions";

import { StaffManagementProps } from "./types";
import { StaffStatCards } from "./StaffStatCards";
import { StaffFilterBar } from "./StaffFilterBar";
import { StaffTable } from "./StaffTable";
import { AddStaffModal } from "./AddStaffModal";
import { EditRoleModal } from "./EditRoleModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { ToggleStatusModal } from "./ToggleStatusModal";
import { DeleteStaffModal } from "./DeleteStaffModal";

export * from "./types";

export function StaffManagement({
  initialEmployees = [],
}: StaffManagementProps) {
  const [employees, setEmployees] = useState<EmployeeData[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [isConfirmToggleModalOpen, setIsConfirmToggleModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Target Employee for Modals
  const [targetEmployee, setTargetEmployee] = useState<EmployeeData | null>(
    null
  );

  // Form States for Add Modal
  const [fullNameInput, setFullNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form State for Edit Role Modal
  const [newRoleInput, setNewRoleInput] = useState<
    "kasir" | "koki" | "admin_gudang"
  >("kasir");

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
        role: "kasir",
      });

      if (res.success && res.data) {
        setEmployees((prev) => [...prev, res.data!]);
        setIsAddModalOpen(false);
        setFullNameInput("");
        setEmailInput("");
        setPasswordInput("");
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
      const res = await updateEmployeeRoleAction(
        targetEmployee.id,
        newRoleInput
      );
      if (res.success) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === targetEmployee.id ? { ...emp, role: newRoleInput } : emp
          )
        );
        setIsEditRoleModalOpen(false);
        showNotification(
          `Peran pegawai ${targetEmployee.fullName} berhasil diubah.`
        );
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
      const res = await resetEmployeePasswordAction(
        targetEmployee.id,
        newPasswordInput
      );
      if (res.success) {
        setIsResetPasswordModalOpen(false);
        setNewPasswordInput("");
        showNotification(
          `Kata sandi akun ${targetEmployee.fullName} berhasil diubah.`
        );
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
            emp.id === targetEmployee.id
              ? { ...emp, isActive: nextState }
              : emp
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

  // Submit Hapus Pegawai (Owner tidak dapat dihapus)
  const handleConfirmDelete = () => {
    if (!targetEmployee) return;

    if (targetEmployee.role === "owner" || targetEmployee.isCurrentUser) {
      setErrorMessage("Akun pemilik toko (Owner) tidak dapat dihapus.");
      setIsDeleteModalOpen(false);
      return;
    }

    startTransition(async () => {
      const res = await deleteEmployeeAction(targetEmployee.id);
      if (res.success) {
        setEmployees((prev) =>
          prev.filter((emp) => emp.id !== targetEmployee.id)
        );
        setIsDeleteModalOpen(false);
        showNotification(
          `Akun pegawai ${targetEmployee.fullName} berhasil dihapus.`
        );
      } else {
        setErrorMessage(res.error || "Gagal menghapus akun pegawai.");
      }
    });
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || emp.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Role Statistics
  const totalStaff = employees.length;
  const totalKasir = employees.filter(
    (e) => e.role === "kasir" && e.isActive
  ).length;

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
            Buat dan kelola akun kasir untuk transaksi POS, status proses masak,
            dan pemanggilan antrian pelanggan.
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
          <div className="text-xs sm:text-sm font-semibold">
            {successMessage}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-[8px] bg-red-50 border-2 border-[var(--danger)] text-red-900 shadow-[3px_3px_0px_var(--danger)] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--danger)] shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">{errorMessage}</div>
        </div>
      )}

      {/* 2. Stat Counter Cards */}
      <StaffStatCards totalStaff={totalStaff} totalKasir={totalKasir} />

      {/* 3. Search & Filter Bar */}
      <StaffFilterBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filterRole={filterRole}
        onFilterRoleChange={setFilterRole}
      />

      {/* 4. Daftar Pegawai (Table) */}
      <StaffTable
        employees={filteredEmployees}
        searchQuery={searchQuery}
        onOpenEditRole={(emp) => {
          setTargetEmployee(emp);
          setNewRoleInput(emp.role === "owner" ? "kasir" : emp.role);
          setIsEditRoleModalOpen(true);
        }}
        onOpenResetPassword={(emp) => {
          setTargetEmployee(emp);
          setNewPasswordInput("");
          setIsResetPasswordModalOpen(true);
        }}
        onOpenToggleStatus={(emp) => {
          setTargetEmployee(emp);
          setIsConfirmToggleModalOpen(true);
        }}
        onOpenDelete={(emp) => {
          setTargetEmployee(emp);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* 5. MODAL: TAMBAH PEGAWAI BARU */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        fullNameInput={fullNameInput}
        onFullNameChange={setFullNameInput}
        emailInput={emailInput}
        onEmailChange={setEmailInput}
        passwordInput={passwordInput}
        onPasswordChange={setPasswordInput}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword(!showPassword)}
        isSubmitting={isSubmitting}
        onSubmit={handleCreateEmployee}
      />

      {/* 6. MODAL: UBAH PERAN PEGAWAI */}
      <EditRoleModal
        isOpen={isEditRoleModalOpen}
        onClose={() => setIsEditRoleModalOpen(false)}
        targetEmployee={targetEmployee}
        newRoleInput={newRoleInput}
        onNewRoleChange={setNewRoleInput}
        isSubmitting={isSubmitting}
        onSubmit={handleUpdateRole}
      />

      {/* 7. MODAL: RESET KATA SANDI */}
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        targetEmployee={targetEmployee}
        newPasswordInput={newPasswordInput}
        onNewPasswordChange={setNewPasswordInput}
        showNewPassword={showNewPassword}
        onToggleShowNewPassword={() => setShowNewPassword(!showNewPassword)}
        isSubmitting={isSubmitting}
        onSubmit={handleResetPassword}
      />

      {/* 8. MODAL: KONFIRMASI NONAKTIFKAN / AKTIFKAN */}
      <ToggleStatusModal
        isOpen={isConfirmToggleModalOpen}
        onClose={() => setIsConfirmToggleModalOpen(false)}
        targetEmployee={targetEmployee}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmToggle}
      />

      {/* 9. MODAL: KONFIRMASI HAPUS PEGAWAI PERMANEN */}
      <DeleteStaffModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        targetEmployee={targetEmployee}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
