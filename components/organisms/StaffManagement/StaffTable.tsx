import React from "react";
import {
  Users,
  Crown,
  Shield,
  KeyRound,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { cn } from "@/lib/utils";
import { EmployeeData } from "@/lib/employees/actions";
import { ROLE_OPTIONS } from "./types";

interface StaffTableProps {
  employees: EmployeeData[];
  searchQuery: string;
  onOpenEditRole: (emp: EmployeeData) => void;
  onOpenResetPassword: (emp: EmployeeData) => void;
  onOpenToggleStatus: (emp: EmployeeData) => void;
  onOpenDelete: (emp: EmployeeData) => void;
}

export function StaffTable({
  employees,
  searchQuery,
  onOpenEditRole,
  onOpenResetPassword,
  onOpenToggleStatus,
  onOpenDelete,
}: StaffTableProps) {
  return (
    <div className="bg-white border-2 border-[var(--forest)] rounded-[8px] shadow-[4px_4px_0px_var(--forest)] overflow-hidden">
      {employees.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-[var(--muted)] mx-auto" />
          <h3 className="font-heading font-bold text-base text-[var(--forest)]">
            Tidak Ada Pegawai Ditemukan
          </h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            {searchQuery
              ? "Tidak ada staf yang cocok dengan kriteria pencarian."
              : "Belum ada staf pegawai tambahan. Tambahkan akun kasir atau staf pertama Anda!"}
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
              {employees.map((emp) => {
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
                            onClick={() => onOpenEditRole(emp)}
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
                            onClick={() => onOpenResetPassword(emp)}
                            className="text-[11px] font-bold border-2 border-[var(--forest)] shadow-[1px_1px_0px_var(--forest)] p-1.5 h-auto"
                            title="Reset kata sandi pegawai"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sandi</span>
                          </Button>

                          {/* Toggle Aktif / Nonaktif (BR-12 & FR-EM-03) */}
                          <button
                            type="button"
                            onClick={() => onOpenToggleStatus(emp)}
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

                          {/* Tombol Hapus Pegawai (Khusus non-owner) */}
                          <button
                            type="button"
                            onClick={() => onOpenDelete(emp)}
                            className="p-1.5 rounded-[6px] border-2 font-bold transition-all text-[11px] cursor-pointer shadow-[1px_1px_0px_var(--forest)] bg-white text-red-600 border-[var(--forest)] hover:bg-red-50 hover:text-red-700"
                            title="Hapus akun pegawai"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
  );
}
