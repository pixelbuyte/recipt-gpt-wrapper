"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function updateReminderPrefs(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      reminder_returns_enabled: formData.get("returns") === "on",
      reminder_warranty_enabled: formData.get("warranty") === "on",
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/app/settings");
}

export async function deleteAccount(formData: FormData) {
  const confirm = formData.get("confirm");
  if (confirm !== "delete my account") {
    throw new Error("Type 'delete my account' to confirm.");
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  // Cancel any active subscriptions in Stripe so we don't keep billing the
  // user after they delete their account. Stripe's webhook will sync plan
  // state if the auth.users delete below races, but the user row goes away
  // anyway so the sync is a no-op.
  if (profile?.stripe_customer_id) {
    const subs = await stripe().subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "all",
      limit: 20,
    });
    for (const s of subs.data) {
      if (["active", "trialing", "past_due"].includes(s.status)) {
        await stripe().subscriptions.cancel(s.id);
      }
    }
  }

  // Deleting the auth user cascades to profiles, purchases, reminders,
  // and the receipts storage bucket entries via the RLS-bypassing service
  // role admin client + ON DELETE CASCADE foreign keys.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);

  await supabase.auth.signOut();
  redirect("/");
}
