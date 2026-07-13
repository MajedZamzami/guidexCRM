"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false as const, error: "Only admins can manage users" };
  }
  return { ok: true as const };
}

export async function createUserAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin.ok) return { error: admin.error };

  const email = String(formData.get("email") || "").trim();
  const fullName = String(formData.get("full_name") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !fullName || !password) {
    return { error: "Email, name, and password are all required" };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true as const };
}
