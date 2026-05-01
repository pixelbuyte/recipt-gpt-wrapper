import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, plan")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar
        email={profile?.email ?? user.email ?? ""}
        plan={(profile?.plan as "free" | "pro") ?? "free"}
      />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
