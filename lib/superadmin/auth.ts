import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export interface SuperadminUser {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Checks if a given Supabase user has superadmin privileges.
 */
export function isUserSuperadmin(
  user:
    | User
    | {
        email?: string | null;
        app_metadata?: Record<string, unknown>;
        user_metadata?: Record<string, unknown>;
      }
    | null
    | undefined
): boolean {
  if (!user) return false;

  // 1. Check explicit superadmin email
  if (user.email === "admin@paybuy.web.id") {
    return true;
  }

  // 2. Check app_metadata or user_metadata
  if (
    user.app_metadata?.role === "superadmin" ||
    user.app_metadata?.is_superadmin === true ||
    user.user_metadata?.role === "superadmin" ||
    user.user_metadata?.is_superadmin === true
  ) {
    return true;
  }

  return false;
}

/**
 * Returns current superadmin user if authenticated, or null.
 */
export async function getSuperadminUser(): Promise<SuperadminUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isUserSuperadmin(user)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || "admin@paybuy.web.id",
    fullName: user.user_metadata?.full_name || "Super Administrator",
  };
}

/**
 * Enforces superadmin authentication on server components.
 * Redirects to /masuk/khusus-admin if unauthenticated.
 */
export async function requireSuperadmin(): Promise<SuperadminUser> {
  const admin = await getSuperadminUser();
  if (!admin) {
    redirect("/masuk/khusus-admin");
  }
  return admin;
}
