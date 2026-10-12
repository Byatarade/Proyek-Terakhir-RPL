"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRole } from "@/lib/types/database";

export interface EmployeeData {
  id: string;
  storeId: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isCurrentUser: boolean;
}

export interface CreateEmployeeInput {
  fullName: string;
  email: string;
  password: string;
  role: "kasir" | "koki" | "admin_gudang";
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Mengambil daftar seluruh staf pegawai toko milik owner (PRD 9.11 — FR-EM-01 s/d FR-EM-04)
 */
export async function getEmployeesAction(
  providedStoreId?: string,
  currentUserId?: string
): Promise<ActionResponse<EmployeeData[]>> {
  try {
    let effectiveStoreId = providedStoreId;
    let effectiveUserId = currentUserId;

    if (!effectiveStoreId || !effectiveUserId) {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, error: "Sesi tidak ditemukan. Silakan masuk kembali." };
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("store_id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.store_id) {
        return { success: false, error: "Toko tidak terhubung ke profil Anda." };
      }

      if (profile.role !== "owner") {
        return { success: false, error: "Hanya pemilik toko (owner) yang dapat mengelola data pegawai." };
      }

      effectiveStoreId = profile.store_id;
      effectiveUserId = user.id;
    }

    const admin = createAdminClient();

    // 1. Ambil data seluruh profil yang berafiliasi dengan toko ini
    const { data: profiles, error: profilesError } = await admin
      .from("profiles")
      .select("id, store_id, full_name, role, is_active, created_at, updated_at")
      .eq("store_id", effectiveStoreId)
      .order("created_at", { ascending: true });

    if (profilesError) {
      return { success: false, error: profilesError.message };
    }

    // 2. Ambil data email pengguna dari Supabase Auth
    let emailMap = new Map<string, string>();
    try {
      const { data: authUsersData } = await admin.auth.admin.listUsers({
        perPage: 1000,
      });
      if (authUsersData?.users) {
        authUsersData.users.forEach((u) => {
          if (u.email) emailMap.set(u.id, u.email);
        });
      }
    } catch {
      // Fallback jika listUsers gagal
      emailMap = new Map();
    }

    const employees: EmployeeData[] = (profiles || []).map((p) => ({
      id: p.id,
      storeId: p.store_id,
      fullName: p.full_name,
      email: emailMap.get(p.id) || "Email tidak ditemukan",
      role: p.role as UserRole,
      isActive: p.is_active ?? true,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      isCurrentUser: p.id === effectiveUserId,
    }));

    return { success: true, data: employees };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memuat daftar pegawai.",
    };
  }
}

/**
 * Membuat akun pegawai baru terikat ke toko owner (PRD 9.11 — FR-EM-01 & FR-AU-05)
 */
export async function createEmployeeAction(
  input: CreateEmployeeInput
): Promise<ActionResponse<EmployeeData>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Sesi tidak ditemukan. Silakan masuk kembali." };
    }

    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!ownerProfile?.store_id) {
      return { success: false, error: "Toko tidak terhubung ke profil Anda." };
    }

    if (ownerProfile.role !== "owner") {
      return { success: false, error: "Hanya pemilik toko yang memiliki izin membuat akun pegawai." };
    }

    // Validasi Formulir
    const trimmedName = input.fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Nama lengkap pegawai minimal 2 karakter." };
    }

    const trimmedEmail = input.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Format alamat email tidak sah." };
    }

    if (!input.password || input.password.length < 6) {
      return { success: false, error: "Kata sandi awal minimal 6 karakter." };
    }

    const allowedRoles: UserRole[] = ["kasir", "koki", "admin_gudang"];
    if (!allowedRoles.includes(input.role)) {
      return { success: false, error: "Peran pegawai yang dipilih tidak sah." };
    }

    const admin = createAdminClient();

    // 1. Buat akun auth di Supabase Auth (email langsung terkonfirmasi)
    const { data: createdUser, error: createUserError } =
      await admin.auth.admin.createUser({
        email: trimmedEmail,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          full_name: trimmedName,
          store_id: ownerProfile.store_id,
          role: input.role,
        },
      });

    if (createUserError || !createdUser.user) {
      if (
        createUserError?.message.includes("User already registered") ||
        createUserError?.message.includes("already exists")
      ) {
        return {
          success: false,
          error: "Alamat email ini sudah terdaftar di sistem. Gunakan email lain untuk staf ini.",
        };
      }
      return {
        success: false,
        error: createUserError?.message || "Gagal membuat akun pegawai di sistem autentikasi.",
      };
    }

    const newUserId = createdUser.user.id;
    const nowIso = new Date().toISOString();

    // 2. Simpan atau perbarui entri profil pegawai
    const { data: newProfile, error: profileInsertError } = await admin
      .from("profiles")
      .upsert({
        id: newUserId,
        store_id: ownerProfile.store_id,
        full_name: trimmedName,
        role: input.role,
        is_active: true,
        updated_at: nowIso,
      })
      .select("id, store_id, full_name, role, is_active, created_at, updated_at")
      .single();

    if (profileInsertError || !newProfile) {
      // Bersihkan auth user jika pembuatan profil gagal
      await admin.auth.admin.deleteUser(newUserId);
      return {
        success: false,
        error: profileInsertError?.message || "Gagal mengaitkan data profil pegawai ke toko.",
      };
    }

    revalidatePath("/dashboard/pegawai");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        id: newProfile.id,
        storeId: newProfile.store_id,
        fullName: newProfile.full_name,
        email: trimmedEmail,
        role: newProfile.role as UserRole,
        isActive: newProfile.is_active ?? true,
        createdAt: newProfile.created_at,
        updatedAt: newProfile.updated_at,
        isCurrentUser: false,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan tak terduga saat menambah pegawai.",
    };
  }
}

/**
 * Mengubah peran staf pegawai (PRD 9.11 — FR-EM-02)
 */
export async function updateEmployeeRoleAction(
  userId: string,
  newRole: "kasir" | "koki" | "admin_gudang"
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!ownerProfile?.store_id || ownerProfile.role !== "owner") {
      return { success: false, error: "Hanya pemilik toko yang dapat mengubah peran pegawai." };
    }

    if (userId === user.id) {
      return { success: false, error: "Anda tidak dapat mengubah peran akun pemilik (owner) Anda sendiri." };
    }

    const admin = createAdminClient();

    // Verifikasi pegawai target berada pada toko yang sama
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, store_id, role")
      .eq("id", userId)
      .maybeSingle();

    if (!targetProfile || targetProfile.store_id !== ownerProfile.store_id) {
      return { success: false, error: "Pegawai tidak ditemukan di toko Anda." };
    }

    const nowIso = new Date().toISOString();

    // 1. Update tabel profiles
    const { error: updateError } = await admin
      .from("profiles")
      .update({
        role: newRole,
        updated_at: nowIso,
      })
      .eq("id", userId)
      .eq("store_id", ownerProfile.store_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 2. Update user_metadata auth
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole },
    });

    revalidatePath("/dashboard/pegawai");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memperbarui peran pegawai.",
    };
  }
}

/**
 * Mengatur ulang kata sandi pegawai oleh owner (PRD 9.11 — FR-EM-02)
 */
export async function resetEmployeePasswordAction(
  userId: string,
  newPassword: string
): Promise<ActionResponse<void>> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Kata sandi baru minimal 6 karakter." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!ownerProfile?.store_id || ownerProfile.role !== "owner") {
      return { success: false, error: "Hanya pemilik toko yang dapat mereset kata sandi pegawai." };
    }

    const admin = createAdminClient();

    // Pastikan pegawai berada di toko yang sama
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, store_id")
      .eq("id", userId)
      .maybeSingle();

    if (!targetProfile || targetProfile.store_id !== ownerProfile.store_id) {
      return { success: false, error: "Pegawai tidak ditemukan di toko Anda." };
    }

    // Update password di Supabase Auth
    const { error: updateAuthError } = await admin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateAuthError) {
      return { success: false, error: updateAuthError.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mereset kata sandi pegawai.",
    };
  }
}

/**
 * Mengaktifkan atau menonaktifkan status pegawai (PRD 9.11 — FR-EM-02 & FR-EM-03, BR-12)
 * Pegawai tidak dihapus permanen agar riwayat transaksi masa lalu tetap utuh.
 */
export async function toggleEmployeeStatusAction(
  userId: string
): Promise<ActionResponse<{ isActive: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!ownerProfile?.store_id || ownerProfile.role !== "owner") {
      return { success: false, error: "Hanya pemilik toko yang dapat mengubah status aktif pegawai." };
    }

    if (userId === user.id) {
      return { success: false, error: "Anda tidak dapat menonaktifkan akun pemilik (owner) Anda sendiri." };
    }

    const admin = createAdminClient();

    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, store_id, is_active")
      .eq("id", userId)
      .maybeSingle();

    if (!targetProfile || targetProfile.store_id !== ownerProfile.store_id) {
      return { success: false, error: "Pegawai tidak ditemukan di toko Anda." };
    }

    const newActiveState = !targetProfile.is_active;
    const nowIso = new Date().toISOString();

    const { error: updateError } = await admin
      .from("profiles")
      .update({
        is_active: newActiveState,
        updated_at: nowIso,
      })
      .eq("id", userId)
      .eq("store_id", ownerProfile.store_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/dashboard/pegawai");
    revalidatePath("/dashboard");

    return { success: true, data: { isActive: newActiveState } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memperbarui status aktif pegawai.",
    };
  }
}
