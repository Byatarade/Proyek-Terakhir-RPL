"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateQris } from "@/lib/payments/qris";
import { StorePlan } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

export interface StoreOnboardingData {
  id: string;
  name: string;
  slug: string;
  acceptCash: boolean;
  acceptQris: boolean;
  qrisMerchantName: string | null;
  qrisPayload: string | null;
}

export interface StoreDetailData {
  id: string;
  name: string;
  slug: string;
  plan: StorePlan;
  isOpen: boolean;
  timezone: string;
  orderExpiryMinutes: number;
  acceptCash: boolean;
  acceptQris: boolean;
  qrisMerchantName: string | null;
  qrisPayload: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavePaymentSettingsInput {
  acceptCash: boolean;
  acceptQris: boolean;
  qrisPayload?: string | null;
  qrisMerchantName?: string | null;
}

export interface UpdateStoreSettingsInput {
  name: string;
  isOpen: boolean;
  timezone: string;
  orderExpiryMinutes: number;
  acceptCash: boolean;
  acceptQris: boolean;
  qrisPayload?: string | null;
  qrisMerchantName?: string | null;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Mengambil data lengkap toko owner untuk halaman pengaturan toko lanjutan
 * (PRD 9.3 — FR-ST-01 s/d FR-ST-06)
 */
export async function getStoreSettingsAction(): Promise<ActionResponse<StoreDetailData>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Sesi tidak ditemukan. Silakan masuk kembali." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .maybeSingle();

    const profileData = profile as { store_id?: string; role?: string } | null;

    if (profileError || !profileData?.store_id) {
      return { success: false, error: "Profil toko tidak ditemukan." };
    }

    const admin = createAdminClient();
    const { data: store, error: storeError } = await admin
      .from("stores")
      .select(`
        id,
        name,
        slug,
        plan,
        is_open,
        timezone,
        order_expiry_minutes,
        accept_cash,
        accept_qris,
        qris_merchant_name,
        qris_payload,
        created_at,
        updated_at
      `)
      .eq("id", profileData.store_id)
      .maybeSingle();

    if (storeError || !store) {
      return { success: false, error: "Data toko tidak ditemukan di sistem." };
    }

    return {
      success: true,
      data: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        plan: (store.plan as StorePlan) || "free",
        isOpen: store.is_open ?? true,
        timezone: store.timezone || "Asia/Jakarta",
        orderExpiryMinutes: store.order_expiry_minutes || 15,
        acceptCash: store.accept_cash ?? true,
        acceptQris: store.accept_qris ?? false,
        qrisMerchantName: store.qris_merchant_name,
        qrisPayload: store.qris_payload,
        createdAt: store.created_at,
        updatedAt: store.updated_at,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan saat memuat pengaturan toko.",
    };
  }
}

/**
 * Memperbarui seluruh konfigurasi toko oleh owner
 * (FR-ST-01, FR-ST-03, FR-ST-04, FR-ST-05, FR-ST-06)
 */
export async function updateStoreSettingsAction(
  input: UpdateStoreSettingsInput
): Promise<ActionResponse<StoreDetailData>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Sesi telah berakhir. Silakan masuk kembali." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .maybeSingle();

    const profileData = profile as { store_id?: string; role?: string } | null;

    if (!profileData?.store_id) {
      return { success: false, error: "Toko tidak terhubung dengan akun Anda." };
    }

    if (profileData.role !== "owner") {
      return {
        success: false,
        error: "Hanya pemilik toko (owner) yang memiliki hak akses mengubah pengaturan toko.",
      };
    }

    // 1. Validasi Nama Toko
    const trimmedName = input.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return {
        success: false,
        error: "Nama toko wajib diisi (minimal 2 karakter).",
      };
    }

    // 2. Validasi Batas Waktu Kedaluwarsa Pesanan (FR-ST-05)
    const expiryMinutes = Math.max(5, Math.min(1440, Number(input.orderExpiryMinutes) || 15));

    // 3. Validasi Zona Waktu (FR-ST-06)
    const validTimezones = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"];
    const timezone = validTimezones.includes(input.timezone) ? input.timezone : "Asia/Jakarta";

    // 4. Validasi Metode Pembayaran (FR-ST-03)
    const { acceptCash, acceptQris, qrisPayload } = input;
    if (!acceptCash && !acceptQris) {
      return {
        success: false,
        error: "Pilih minimal satu metode pembayaran (Tunai atau QRIS) agar pelanggan dapat bertransaksi.",
      };
    }

    let finalMerchantName: string | null = null;
    let finalPayload: string | null = null;

    if (acceptQris) {
      if (!qrisPayload) {
        return {
          success: false,
          error: "Kode QRIS wajib diunggah bila toko memilih untuk menerima QRIS.",
        };
      }

      // Validasi ketat struktur QRIS & Checksum CRC16
      const validation = validateQris(qrisPayload);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "Format QRIS tidak sah atau checksum CRC16 tidak cocok.",
        };
      }

      finalPayload = qrisPayload.trim();
      finalMerchantName = validation.merchantName || input.qrisMerchantName || "Merchant QRIS";
    }

    const nowIso = new Date().toISOString();
    const admin = createAdminClient();

    // 5. Update data toko
    const { data: updatedStore, error: updateError } = await admin
      .from("stores")
      .update({
        name: trimmedName,
        is_open: Boolean(input.isOpen),
        timezone,
        order_expiry_minutes: expiryMinutes,
        accept_cash: acceptCash,
        accept_qris: acceptQris,
        qris_payload: finalPayload,
        qris_merchant_name: finalMerchantName,
        updated_at: nowIso,
      })
      .eq("id", profileData.store_id)
      .select(`
        id,
        name,
        slug,
        plan,
        is_open,
        timezone,
        order_expiry_minutes,
        accept_cash,
        accept_qris,
        qris_merchant_name,
        qris_payload,
        created_at,
        updated_at
      `)
      .single();

    if (updateError || !updatedStore) {
      return {
        success: false,
        error: updateError?.message || "Gagal memperbarui data pengaturan toko.",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pengaturan");
    revalidatePath("/dashboard/kasir");
    revalidatePath(`/t/${updatedStore.slug}`);
    revalidatePath("/t/[slug]", "page");

    return {
      success: true,
      data: {
        id: updatedStore.id,
        name: updatedStore.name,
        slug: updatedStore.slug,
        plan: (updatedStore.plan as StorePlan) || "free",
        isOpen: updatedStore.is_open ?? true,
        timezone: updatedStore.timezone || "Asia/Jakarta",
        orderExpiryMinutes: updatedStore.order_expiry_minutes || 15,
        acceptCash: updatedStore.accept_cash ?? true,
        acceptQris: updatedStore.accept_qris ?? false,
        qrisMerchantName: updatedStore.qris_merchant_name,
        qrisPayload: updatedStore.qris_payload,
        createdAt: updatedStore.created_at,
        updatedAt: updatedStore.updated_at,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan sistem saat memperbarui toko.",
    };
  }
}

/**
 * Toggle cepat status Buka/Tutup toko (FR-ST-04)
 */
export async function toggleStoreOpenStatusAction(): Promise<ActionResponse<{ isOpen: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    const admin = createAdminClient();
    const { data: currentStore } = await admin
      .from("stores")
      .select("id, slug, is_open")
      .eq("id", profile.store_id)
      .single();

    if (!currentStore) return { success: false, error: "Toko tidak ditemukan." };

    const newIsOpen = !currentStore.is_open;
    const nowIso = new Date().toISOString();

    const { error: updateError } = await admin
      .from("stores")
      .update({
        is_open: newIsOpen,
        updated_at: nowIso,
      })
      .eq("id", profile.store_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pengaturan");
    revalidatePath(`/t/${currentStore.slug}`);
    revalidatePath("/t/[slug]", "page");

    return { success: true, data: { isOpen: newIsOpen } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengubah status toko.",
    };
  }
}

/**
 * Mengambil data toko owner untuk wizard onboarding (Backward Compatibility)
 */
export async function getStoreOnboardingDataAction(): Promise<ActionResponse<StoreOnboardingData>> {
  const res = await getStoreSettingsAction();
  if (!res.success || !res.data) {
    return { success: false, error: res.error };
  }
  return {
    success: true,
    data: {
      id: res.data.id,
      name: res.data.name,
      slug: res.data.slug,
      acceptCash: res.data.acceptCash,
      acceptQris: res.data.acceptQris,
      qrisMerchantName: res.data.qrisMerchantName,
      qrisPayload: res.data.qrisPayload,
    },
  };
}

/**
 * Menyimpan preferensi metode pembayaran toko dari wizard onboarding QRIS
 * (Backward Compatibility)
 */
export async function saveStorePaymentSettingsAction(
  input: SavePaymentSettingsInput
): Promise<ActionResponse<StoreOnboardingData>> {
  const current = await getStoreSettingsAction();
  if (!current.success || !current.data) {
    return { success: false, error: current.error || "Gagal mengambil data toko." };
  }

  const res = await updateStoreSettingsAction({
    name: current.data.name,
    isOpen: current.data.isOpen,
    timezone: current.data.timezone,
    orderExpiryMinutes: current.data.orderExpiryMinutes,
    acceptCash: input.acceptCash,
    acceptQris: input.acceptQris,
    qrisPayload: input.qrisPayload,
    qrisMerchantName: input.qrisMerchantName,
  });

  if (!res.success || !res.data) {
    return { success: false, error: res.error };
  }

  return {
    success: true,
    data: {
      id: res.data.id,
      name: res.data.name,
      slug: res.data.slug,
      acceptCash: res.data.acceptCash,
      acceptQris: res.data.acceptQris,
      qrisMerchantName: res.data.qrisMerchantName,
      qrisPayload: res.data.qrisPayload,
    },
  };
}
