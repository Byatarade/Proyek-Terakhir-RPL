"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  slugify,
} from "./schemas";
import { AuthActionResult, SlugCheckResult } from "./types";

/**
 * Check if a store slug is available
 */
export async function checkSlugAction(rawSlug: string): Promise<SlugCheckResult> {
  const slug = slugify(rawSlug);
  if (!slug || slug.length < 3) {
    return { available: false, message: "Slug minimal 3 karakter" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return { available: false, message: "Gagal memeriksa ketersediaan slug" };
  }

  if (data) {
    return {
      available: false,
      message: `Tautan "${slug}" sudah digunakan toko lain. Coba pilih nama lain.`,
    };
  }

  return { available: true, message: `Tautan "${slug}" tersedia!` };
}

/**
 * Register a new store owner (Atomic creation with store & profile)
 */
export async function registerOwnerAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    fullName: formData.get("fullName") as string,
    storeName: formData.get("storeName") as string,
    slug: formData.get("slug") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    terms: formData.get("terms") === "on" || formData.get("terms") === "true",
  };

  const validation = registerSchema.safeParse(rawData);
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || "Data pendaftaran tidak valid";
    return { success: false, error: firstError };
  }

  const { fullName, storeName, slug, email, password } = validation.data;

  const supabase = await createClient();

  // Verify slug is not already taken before calling signUp
  const { data: existingStore } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingStore) {
    return {
      success: false,
      error: `Alamat tautan "${slug}" sudah dipakai toko lain. Silakan ubah slug toko Anda.`,
    };
  }

  const headerList = await headers();
  const origin =
    headerList.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://paybuy.byatara.dev";

  // Call Supabase Auth signUp with metadata for handle_new_user trigger
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        store_name: storeName,
        slug: slug,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (authError) {
    if (
      authError.message.includes("User already registered") ||
      (authError.status === 400 && authError.message.includes("already registered"))
    ) {
      return {
        success: false,
        error: "Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain.",
      };
    }

    // Gracefully handle Supabase Free Tier built-in SMTP rate limit (3-4 emails/hour)
    if (
      authError.message.toLowerCase().includes("rate limit") ||
      authError.status === 429
    ) {
      try {
        const adminClient = createAdminClient();
        const { data: adminUser, error: adminErr } =
          await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              store_name: storeName,
              slug: slug,
            },
          });

        if (!adminErr && adminUser?.user) {
          // Immediately sign in user to establish session
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!signInErr) {
            return {
              success: true,
              redirectTo: "/onboarding",
            };
          }

          return {
            success: true,
            redirectTo: "/masuk?registered=true",
          };
        }
      } catch {
        // Fallback to clear error message
      }

      return {
        success: false,
        error:
          "Batas pengiriman email verifikasi Supabase (kuota gratis bawaan) sedang penuh. Silakan matikan 'Confirm email' di Dashboard Supabase (Authentication > Providers > Email) atau coba lagi sebentar.",
      };
    }

    return {
      success: false,
      error: authError.message || "Gagal melakukan pendaftaran. Silakan coba lagi.",
    };
  }

  // If a session is returned immediately (e.g. email confirmation disabled or auto-confirmed)
  if (authData.session) {
    return {
      success: true,
      redirectTo: "/onboarding",
    };
  }

  // If user is created but email verification is pending (FR-AU-02)
  return {
    success: true,
    requiresEmailVerification: true,
    message: `Pendaftaran berhasil! Kami telah mengirimkan tautan konfirmasi ke ${email}. Silakan buka email Anda untuk mengaktifkan akun toko.`,
  };
}

/**
 * Login user for all roles (Owner, Kasir, Koki, Admin Gudang)
 */
export async function loginUserAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const nextUrl = (formData.get("next") as string) || "/dashboard";

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || "Data login tidak valid";
    return { success: false, error: firstError };
  }

  const { email, password } = validation.data;
  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.user) {
    return {
      success: false,
      error: "Email atau kata sandi salah. Silakan periksa kembali.",
    };
  }

  // Check profile and active status (FR-AU-06)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle();

  const profileData = profile as { is_active?: boolean } | null;
  if (profileData && profileData.is_active === false) {
    await supabase.auth.signOut();
    return {
      success: false,
      error:
        "Akun Anda telah dinonaktifkan oleh pemilik toko. Hubungi pengelola untuk mengaktifkan kembali.",
    };
  }

  return {
    success: true,
    redirectTo: nextUrl.startsWith("/") ? nextUrl : "/dashboard",
  };
}

/**
 * Request password recovery email (FR-AU-04)
 */
export async function forgotPasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email") as string,
  };

  const validation = forgotPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || "Alamat email tidak valid";
    return { success: false, error: firstError };
  }

  const { email } = validation.data;
  const supabase = await createClient();

  const headerList = await headers();
  const origin =
    headerList.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://paybuy.byatara.dev";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/dashboard/pengaturan`,
  });

  if (error) {
    return {
      success: false,
      error: error.message || "Gagal mengirim tautan pemulihan kata sandi.",
    };
  }

  return {
    success: true,
    message: `Instruksi pemulihan kata sandi telah dikirim ke ${email} jika akun tersebut terdaftar. Silakan periksa kotak masuk atau spam.`,
  };
}

/**
 * Resend verification email for unconfirmed user (FR-AU-02)
 */
export async function resendVerificationEmailAction(
  email: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const supabase = await createClient();
    const headerList = await headers();
    const origin =
      headerList.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://paybuy.byatara.dev";

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Gagal mengirim ulang email verifikasi.",
      };
    }

    return {
      success: true,
      message: "Tautan verifikasi baru berhasil dikirim. Silakan periksa email Anda.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.",
    };
  }
}

/**
 * Sign out user
 */
export async function logoutUserAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/masuk");
}
