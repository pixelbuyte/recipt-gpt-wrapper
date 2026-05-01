import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Events that mutate profile state. Anything not in this set still gets
// logged into billing_events for auditing but skips handleEvent.
// invoice.payment_succeeded is intentionally not here — the corresponding
// customer.subscription.updated event already carries the plan state we
// need, so handling it twice would just be duplicate work.
const RELEVANT = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
]);

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    return NextResponse.json(
      { error: `signature verification failed: ${e instanceof Error ? e.message : String(e)}` },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Idempotency: skip if we've recorded this event before. The unique
  // constraint on stripe_event_id makes this safe under retries even if
  // two pods process the event simultaneously — only one INSERT succeeds.
  const dedup = await admin
    .from("billing_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();
  if (dedup.error) {
    return NextResponse.json({ error: dedup.error.message }, { status: 500 });
  }
  if (dedup.data) return NextResponse.json({ received: true, dedup: true });

  if (!RELEVANT.has(event.type)) {
    const { error } = await admin.from("billing_events").insert({
      stripe_event_id: event.id,
      type: event.type,
      payload: event as unknown as Record<string, unknown>,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ received: true });
  }

  try {
    await handleEvent(admin, event);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  // Only record AFTER handleEvent succeeds. If the insert here fails Stripe
  // will retry the event; on retry the dedup SELECT misses and handleEvent
  // runs again. The profile updates inside handleEvent are idempotent.
  const { error: logErr } = await admin.from("billing_events").insert({
    stripe_event_id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });
  if (logErr) {
    return NextResponse.json({ error: logErr.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

type Admin = ReturnType<typeof createAdminClient>;

async function handleEvent(admin: Admin, event: Stripe.Event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId =
      session.client_reference_id ??
      (typeof session.metadata?.supabase_user_id === "string"
        ? session.metadata.supabase_user_id
        : null);
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
    if (userId && customerId) {
      const { error } = await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId, plan: "pro" })
        .eq("id", userId);
      if (error) throw new Error(`profiles update failed: ${error.message}`);
    }
    return;
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const isActive =
      event.type !== "customer.subscription.deleted" &&
      ["active", "trialing", "past_due"].includes(sub.status);
    const renewsAt = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

    const { error } = await admin
      .from("profiles")
      .update({
        plan: isActive ? "pro" : "free",
        plan_renews_at: isActive ? renewsAt : null,
      })
      .eq("stripe_customer_id", customerId);
    if (error) throw new Error(`profiles update failed: ${error.message}`);
    return;
  }

  if (event.type === "invoice.payment_failed") {
    // Keep them on Pro for now — Stripe will retry. We'll only flip to free
    // when the subscription itself transitions to canceled/unpaid.
    return;
  }
}
