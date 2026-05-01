import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReminderEmail } from "@/lib/email";
import { todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Vercel cron sends requests with `Authorization: Bearer ${CRON_SECRET}`.
function authorized(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const got = req.headers.get("authorization");
  return got === `Bearer ${expected}`;
}

type DueRow = {
  id: string;
  user_id: string;
  purchase_id: string;
  kind: "return" | "warranty";
  send_at: string;
  purchases: {
    item_name: string;
    merchant: string | null;
    price_cents: number;
    currency: string;
    return_deadline: string | null;
    warranty_end: string | null;
  } | null;
  profiles: {
    email: string;
    plan: "free" | "pro";
    reminder_returns_enabled: boolean;
    reminder_warranty_enabled: boolean;
  } | null;
};

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = todayISO();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://purchaseping.com";

  const { data, error } = await supabase
    .from("reminders")
    .select(
      "id, user_id, purchase_id, kind, send_at, purchases(item_name, merchant, price_cents, currency, return_deadline, warranty_end), profiles(email, plan, reminder_returns_enabled, reminder_warranty_enabled)",
    )
    .is("sent_at", null)
    .lte("send_at", today)
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as DueRow[];
  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const r of rows) {
    const profile = r.profiles;
    const purchase = r.purchases;
    if (!profile || !purchase) {
      skipped++;
      continue;
    }
    // Email reminders are a Pro feature.
    if (profile.plan !== "pro") {
      skipped++;
      continue;
    }
    if (r.kind === "return" && !profile.reminder_returns_enabled) {
      skipped++;
      continue;
    }
    if (r.kind === "warranty" && !profile.reminder_warranty_enabled) {
      skipped++;
      continue;
    }

    const deadlineISO =
      r.kind === "return" ? purchase.return_deadline : purchase.warranty_end;
    if (!deadlineISO) {
      skipped++;
      continue;
    }

    try {
      await sendReminderEmail({
        to: profile.email,
        kind: r.kind,
        itemName: purchase.item_name,
        merchant: purchase.merchant,
        priceCents: purchase.price_cents,
        currency: purchase.currency,
        deadlineISO,
        appUrl,
      });
      // Mark sent. If this update fails we'd risk a duplicate next run, but
      // Resend's idempotency + the once-per-day cron makes that acceptable.
      const { error: updErr } = await supabase
        .from("reminders")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", r.id);
      if (updErr) errors.push(`update ${r.id}: ${updErr.message}`);
      sent++;
    } catch (e) {
      errors.push(`send ${r.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return NextResponse.json({ sent, skipped, errors });
}
