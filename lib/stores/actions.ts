"use server";

import { createClient } from "@/lib/supabase/server";
import { validateQris } from "@/lib/payments/qris";
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

export interface SavePaymentSettingsInput {
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
 * Mengambil data toko owner untuk wizard onboarding
 */
export async function getStoreOnboardingDataAction(): Promise<ActionResponse<StoreOnboardingData>> {
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

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, name, slug, accept_cash, accept_qris, qris_merchant_name, qris_payload")
      .eq("id", profileData.store_id)
      .maybeSingle();

    const storeData = store as {
      id: string;
      name: string;
      slug: string;
      accept_cash: boolean;
      accept_qris: boolean;
      qris_merchant_name: string | null;
      qris_payload: string | null;
    } | null;

    if (storeError || !storeData) {
      return { success: false, error: "Data toko tidak ditemukan di sistem." };
    }

    return {
      success: true,
      data: {
        id: storeData.id,
        name: storeData.name,
        slug: storeData.slug,
        acceptCash: storeData.accept_cash ?? true,
        acceptQris: storeData.accept_qris ?? false,
        qrisMerchantName: storeData.qris_merchant_name,
        qrisPayload: storeData.qris_payload,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data toko.",
    };
  }
}

/**
 * Menyimpan preferensi metode pembayaran toko dari pertanyaan onboarding QRIS
 * (FR-ST-01, FR-ST-03, FR-PY-03, FR-PY-04)
 */
export async function saveStorePaymentSettingsAction(
  input: SavePaymentSettingsInput
): Promise<ActionResponse<StoreOnboardingData>> {
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
      return { success: false, error: "Hanya pemilik toko (owner) yang dapat mengatur metode pembayaran." };
    }

    const { acceptCash, acceptQris, qrisPayload } = input;

    // Setidaknya satu metode bayar harus aktif
    if (!acceptCash && !acceptQris) {
      return {
        success: false,
        error: "Pilih minimal satu metode pembayaran (Tunai atau QRIS) agar pelanggan dapat membayar.",
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

      // Validasi ketat format QRIS & Checksum CRC16
      const validation = validateQris(qrisPayload);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "Format QRIS tidak sah atau checksum tidak cocok.",
        };
      }

      finalPayload = qrisPayload.trim();
      finalMerchantName = validation.merchantName || input.qrisMerchantName || "Merchant QRIS";
    }

    // Perbarui data toko di database
    const { data: updatedStore, error: updateError } = await supabase
      .from("stores")
      .update({
        accept_cash: acceptCash,
        accept_qris: acceptQris,
        qris_payload: finalPayload,
        qris_merchant_name: finalMerchantName,
      })
      .eq("id", profileData.store_id)
      .select("id, name, slug, accept_cash, accept_qris, qris_merchant_name, qris_payload")
      .single();

    const updatedData = updatedStore as {
      id: string;
      name: string;
      slug: string;
      accept_cash: boolean;
      accept_qris: boolean;
      qris_merchant_name: string | null;
      qris_payload: string | null;
    } | null;

    if (updateError || !updatedData) {
      return {
        success: false,
        error: updateError?.message || "Gagal memperbarui pengaturan pembayaran toko.",
      };
    }

    revalidatePath("/dashboard/pengaturan");
    revalidatePath(`/t/${updatedData.slug}`);
    revalidatePath("/t/[slug]", "page");

    return {
      success: true,
      data: {
        id: updatedData.id,
        name: updatedData.name,
        slug: updatedData.slug,
        acceptCash: updatedData.accept_cash,
        acceptQris: updatedData.accept_qris,
        qrisMerchantName: updatedData.qris_merchant_name,
        qrisPayload: updatedData.qris_payload,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.",
    };
  }
}
