"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUserSuperadmin, getSuperadminUser } from "./auth";
import { StorePlan } from "@/lib/types/database";

export interface SuperadminStoreItem {
  id: string;
  name: string;
  slug: string;
  plan: StorePlan;
  is_open: boolean;
  accept_cash: boolean;
  accept_qris: boolean;
  created_at: string;
  owner_name: string;
  owner_email: string;
  products_count: number;
  orders_count: number;
  total_revenue: number;
}

export interface SuperadminDashboardMetrics {
  totalStores: number;
  openStores: number;
  closedStores: number;
  planCounts: {
    free: number;
    pro: number;
    maximal: number;
  };
  totalOrders: number;
  totalPlatformRevenue: number;
}

/**
 * Superadmin Login Server Action
 */
export async function loginSuperadminAction(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string; redirectTo?: string }> {
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string);

  if (!email || !password) {
    return { success: false, error: "Email dan kata sandi wajib diisi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: "Email atau kata sandi Superadmin salah.",
    };
  }

  // Security Check: Ensure user is a superadmin
  if (!isUserSuperadmin(data.user)) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Akses ditolak. Akun ini tidak terdaftar sebagai Superadmin.",
    };
  }

  return {
    success: true,
    redirectTo: "/khusus-admin",
  };
}

/**
 * Superadmin Logout Server Action
 */
export async function logoutSuperadminAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/masuk/khusus-admin");
}

/**
 * Fetch all stores & platform metrics with admin privilege
 */
export async function getSuperadminDataAction(): Promise<{
  metrics: SuperadminDashboardMetrics;
  stores: SuperadminStoreItem[];
}> {
  const adminUser = await getSuperadminUser();
  if (!adminUser) {
    throw new Error("Unauthorized: Superadmin access required.");
  }

  const admin = createAdminClient();

  // 1. Fetch stores
  const { data: stores, error: storesErr } = await admin
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });

  if (storesErr) {
    console.error("Superadmin: error fetching stores:", storesErr);
    throw new Error("Gagal mengambil data toko");
  }

  // 2. Fetch profiles
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, store_id, full_name, role");

  // 3. Fetch users for owner emails (fetch up to 1000 users)
  const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const userEmailsMap: Record<string, string> = {};
  usersData?.users?.forEach((u) => {
    userEmailsMap[u.id] = u.email || "-";
  });

  // 4. Fetch products counts
  const { data: products } = await admin
    .from("products")
    .select("id, store_id");

  // 5. Fetch orders counts and totals
  const { data: orders } = await admin
    .from("orders")
    .select("id, store_id, total, status");

  const storeList: SuperadminStoreItem[] = (stores || []).map((s) => {
    const ownerProfile = (profiles || []).find(
      (p) => p.store_id === s.id && p.role === "owner"
    );
    const storeProducts = (products || []).filter((p) => p.store_id === s.id);
    const storeOrders = (orders || []).filter((o) => o.store_id === s.id);
    const storeRevenue = storeOrders
      .filter((o) => o.status !== "dibatalkan" && o.status !== "kedaluwarsa")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      plan: (s.plan || "free") as StorePlan,
      is_open: Boolean(s.is_open),
      accept_cash: Boolean(s.accept_cash),
      accept_qris: Boolean(s.accept_qris),
      created_at: s.created_at,
      owner_name: ownerProfile?.full_name || "Pemilik Toko",
      owner_email: ownerProfile ? userEmailsMap[ownerProfile.id] || "-" : "-",
      products_count: storeProducts.length,
      orders_count: storeOrders.length,
      total_revenue: storeRevenue,
    };
  });

  // Metrics calculation
  const metrics: SuperadminDashboardMetrics = {
    totalStores: storeList.length,
    openStores: storeList.filter((s) => s.is_open).length,
    closedStores: storeList.filter((s) => !s.is_open).length,
    planCounts: {
      free: storeList.filter((s) => s.plan === "free").length,
      pro: storeList.filter((s) => s.plan === "pro").length,
      maximal: storeList.filter((s) => s.plan === "maximal").length,
    },
    totalOrders: (orders || []).length,
    totalPlatformRevenue: (orders || [])
      .filter((o) => o.status !== "dibatalkan" && o.status !== "kedaluwarsa")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0),
  };

  return { metrics, stores: storeList };
}

/**
 * Update store tier/plan (Free / Pro / Maximal)
 */
export async function updateStorePlanAction(
  storeId: string,
  newPlan: StorePlan
): Promise<{ success: boolean; error?: string }> {
  const adminUser = await getSuperadminUser();
  if (!adminUser) return { success: false, error: "Akses tidak diizinkan." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("stores")
    .update({ plan: newPlan, updated_at: new Date().toISOString() })
    .eq("id", storeId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/khusus-admin");
  return { success: true };
}

/**
 * Toggle store open / closed status
 */
export async function toggleStoreStatusAction(
  storeId: string,
  isOpen: boolean
): Promise<{ success: boolean; error?: string }> {
  const adminUser = await getSuperadminUser();
  if (!adminUser) return { success: false, error: "Akses tidak diizinkan." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("stores")
    .update({ is_open: isOpen, updated_at: new Date().toISOString() })
    .eq("id", storeId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/khusus-admin");
  return { success: true };
}

/**
 * Permanently delete a store and all associated data
 */
export async function deleteStoreAction(
  storeId: string
): Promise<{ success: boolean; error?: string }> {
  const adminUser = await getSuperadminUser();
  if (!adminUser) return { success: false, error: "Akses tidak diizinkan." };

  const admin = createAdminClient();

  try {
    // 0. Collect all auth user IDs associated with this store before deleting data
    // a) From profiles table (all staff & owner of this store)
    const { data: storeProfiles } = await admin
      .from("profiles")
      .select("id")
      .eq("store_id", storeId);

    const userIdsToDelete = new Set<string>();
    storeProfiles?.forEach((p) => {
      if (p.id) userIdsToDelete.add(p.id);
    });

    // b) Fetch the store slug to check if any auth user registered with this store slug
    const { data: targetStore } = await admin
      .from("stores")
      .select("slug")
      .eq("id", storeId)
      .maybeSingle();

    // c) Also scan auth users list to catch any user whose metadata links to this store_id or slug
    try {
      const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
      authUsers?.users?.forEach((u) => {
        const meta = u.user_metadata as Record<string, unknown> | undefined;
        if (
          meta?.store_id === storeId ||
          (targetStore?.slug && meta?.slug === targetStore.slug)
        ) {
          userIdsToDelete.add(u.id);
        }
      });
    } catch (scanErr: unknown) {
      console.warn("Superadmin: failed to scan auth users metadata:", scanErr);
    }

    // 1. Delete order status logs (must precede orders due to FK)
    await admin.from("order_status_logs").delete().eq("store_id", storeId);

    // 2. Delete order items (must precede orders & products due to FK)
    await admin.from("order_items").delete().eq("store_id", storeId);

    // 3. Delete orders
    await admin.from("orders").delete().eq("store_id", storeId);

    // 4. Delete queue counters
    await admin.from("queue_counters").delete().eq("store_id", storeId);

    // 5. Delete expenses
    await admin.from("expenses").delete().eq("store_id", storeId);

    // 6. Delete products (must precede categories due to category_id FK)
    await admin.from("products").delete().eq("store_id", storeId);

    // 7. Delete categories
    await admin.from("categories").delete().eq("store_id", storeId);

    // 8. Delete profiles (staff and owner profiles)
    await admin.from("profiles").delete().eq("store_id", storeId);

    // 9. Delete the store record itself
    const { error: storeErr } = await admin.from("stores").delete().eq("id", storeId);
    if (storeErr) {
      throw storeErr;
    }

    // 10. Delete all associated users from Supabase Auth so their emails can be re-registered cleanly
    for (const userId of userIdsToDelete) {
      // Safety check: Never delete the superadmin account!
      if (userId === adminUser.id) continue;

      try {
        const { data: userRecord } = await admin.auth.admin.getUserById(userId);
        if (userRecord?.user?.email === "admin@paybuy.web.id") continue;

        await admin.auth.admin.deleteUser(userId);
      } catch (userDelErr: unknown) {
        console.error(`Superadmin: failed to delete auth user ${userId}:`, userDelErr);
      }
    }

    revalidatePath("/khusus-admin");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus toko.";
    console.error("Superadmin: failed to delete store:", err);
    return { success: false, error: message };
  }
}
