import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        You don&apos;t have access to this page.
      </div>
    );
  }

  const adminClient = createAdminClient();
  const [{ data: profiles }, { data: authData }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    adminClient.auth.admin.listUsers(),
  ]);

  const emailById = new Map(authData?.users.map((u) => [u.id, u.email ?? "—"]) ?? []);
  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    role: p.role,
    created_at: p.created_at,
    email: emailById.get(p.id) ?? "—",
  }));

  return <SettingsView users={users} />;
}
