# Deploy Purchase Ping

End-to-end runbook for taking the repo from "merged on main" to "real users can pay." Order matters — each step assumes the previous one is done.

Estimated time: **45–60 minutes** if no DNS surprises.

---

## 0. Revoke the leaked Anthropic key (one-time)

The key pasted in the original chat is compromised.

1. console.anthropic.com → API Keys.
2. Find `sk-ant-api03-pL4-…AA`, click **Disable**.
3. (Optional) Generate a new key if you'll wire AI features in later. Store it only as a Vercel env var, never in source.

---

## 1. Supabase

### 1a. Project

1. supabase.com/dashboard → **New project**.
2. Name `purchase-ping`, generous region near your users, set a strong DB password (save it in 1Password).
3. Wait ~2 min for provisioning.

### 1b. Schema

1. Sidebar → **SQL Editor** → **New query**.
2. Paste the contents of `supabase/schema.sql` from this repo.
3. **Run**. Expect "Success. No rows returned." Verify in **Table Editor** that `profiles`, `categories`, `purchases`, `reminders`, `billing_events` exist, and `categories` has 8 system rows.

### 1c. Storage bucket

1. Sidebar → **Storage** → **New bucket**.
2. Name `receipts`, **Public** off (private). Save.
3. Go to the bucket → **Policies** → leave empty. The signed-URL flow uses the user's session JWT to upload (server action runs with the user's RLS context) and the service role for reads.

### 1d. Auth redirect URLs

Sidebar → **Authentication** → **URL Configuration**:

- **Site URL**: leave for now; we'll set after Vercel deploy.
- **Redirect URLs** (add both):
  - `http://localhost:3000/auth/callback`
  - `https://<vercel-domain>/auth/callback` (placeholder — fill in after Vercel deploy)

### 1e. Grab the keys

Sidebar → **Project Settings** → **API**:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (treat like a password, server-only)

---

## 2. Stripe

### 2a. Product + prices

1. dashboard.stripe.com → **Products** → **Add product**.
2. Name `Purchase Ping Pro`, description optional.
3. Add price 1: **Recurring**, **$9.00 USD / month**. Save.
4. Add price 2: **Recurring**, **$79.00 USD / year**. Save.
5. Copy each **price ID** (starts with `price_…`):
   - monthly → `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY`
   - yearly → `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY`

### 2b. API key

Developers → **API keys** → reveal **Secret key** → `STRIPE_SECRET_KEY` (use **test mode** secret first, swap to live later).

### 2c. Webhook (do this *after* Vercel deploy so you have a domain)

1. Developers → **Webhooks** → **Add endpoint**.
2. URL: `https://<vercel-domain>/api/webhooks/stripe`
3. Events to send: select these five:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Save. Click the endpoint → **Signing secret** → reveal → `STRIPE_WEBHOOK_SECRET`.

### 2d. Customer portal

Settings → **Billing** → **Customer portal**:
- Toggle **Allow customers to cancel subscriptions**: on
- Toggle **Allow customers to update payment methods**: on
- **Default return URL**: `https://<vercel-domain>/app/settings`
- Save.

---

## 3. Resend

1. resend.com → **Domains** → **Add domain**.
2. Use a subdomain you control, e.g. `mail.purchaseping.com`.
3. Resend gives you SPF, DKIM, and DMARC records — paste them into your DNS host. Wait until Resend marks the domain **Verified** (usually 5–30 min).
4. **API Keys** → **Create API key** → name `production`, scope **Sending access** → `RESEND_API_KEY`.
5. `RESEND_FROM_EMAIL` = `Purchase Ping <reminders@mail.purchaseping.com>` (must be on the verified domain).

---

## 4. Vercel

### 4a. Import the repo

1. vercel.com/new → **Import Git Repository** → select `pixelbuyte/recipt-gpt-wrapper`.
2. Framework preset auto-detects **Next.js**. Leave defaults.
3. Don't deploy yet — fill env vars first (see 4b).

### 4b. Environment variables

Project → **Settings** → **Environment Variables**. Add each (Production + Preview + Development):

```
NEXT_PUBLIC_SUPABASE_URL          = <from 1e>
NEXT_PUBLIC_SUPABASE_ANON_KEY     = <from 1e>
SUPABASE_SERVICE_ROLE_KEY         = <from 1e>
STRIPE_SECRET_KEY                 = <from 2b>
STRIPE_WEBHOOK_SECRET             = <leave blank, fill after 2c>
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY = <from 2a>
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY  = <from 2a>
RESEND_API_KEY                    = <from 3>
RESEND_FROM_EMAIL                 = "Purchase Ping <reminders@mail.purchaseping.com>"
CRON_SECRET                       = <generate: `openssl rand -hex 32`>
ANTHROPIC_API_KEY                 = <optional — enables Pro AI receipt scan>
NEXT_PUBLIC_APP_URL               = <leave blank, fill after first deploy>
```

`ANTHROPIC_API_KEY` is optional. When set, Pro users see a **Scan with AI** button on the Add Purchase form that uses Claude vision to pre-fill merchant, item, price, and date from an uploaded receipt. Cost is roughly **$0.01 per scan** on Opus 4.7 — well under the Pro margin even at heavy usage. To disable, leave the variable unset.

### 4c. First deploy

1. **Deployments** → **Redeploy** (or push a commit).
2. Once it goes green, copy the production URL: `https://<project>.vercel.app`.

### 4d. Backfill the URL-dependent env vars

Now you have a domain, fill in:

- `NEXT_PUBLIC_APP_URL` = `https://<project>.vercel.app`
- Add the Stripe webhook from **2c**, then put `STRIPE_WEBHOOK_SECRET` into Vercel.
- In **Supabase → Authentication**, set **Site URL** = `https://<project>.vercel.app` and add `https://<project>.vercel.app/auth/callback` to redirect URLs.

Redeploy after editing env vars (Vercel doesn't hot-reload them).

### 4e. Cron is automatic

`vercel.json` already declares `0 9 * * *` UTC for `/api/cron/reminders`. Vercel reads it on the next deploy. Verify under **Settings → Cron Jobs**. The Bearer auth uses `CRON_SECRET` from 4b.

---

## 5. Smoke test (do this in Stripe **test mode**)

1. Visit `https://<vercel-domain>` → **Start free** → magic link → check inbox.
2. Open the link → land on `/app` (empty state).
3. Click **Load 5 sample items** → dashboard populates with charts.
4. Add a real purchase via the form → it appears in the list.
5. Add 10 more purchases → trying for #11 redirects to `/app/upgrade?reason=limit`.
6. On `/app/upgrade`, click **Start checkout** on either plan.
7. Use test card `4242 4242 4242 4242`, any future expiry, any 3-digit CVC, any ZIP.
8. After redirect to `/app?upgraded=1`:
   - Sidebar plan badge flips from **Free** to **Pro** within a few seconds (the webhook fires).
   - Verify in Supabase: `select plan, plan_renews_at from profiles where email = ...;`
9. `/app/settings` → **Manage billing** opens the Stripe customer portal.
10. Add a purchase with `return_deadline = today + 3` while Pro.
11. Trigger the cron manually:
    ```bash
    curl -H "Authorization: Bearer $CRON_SECRET" \
      https://<vercel-domain>/api/cron/reminders
    ```
    Expected: `{"sent":1,"skipped":0,"errors":[]}`.
12. Check the email arrives. Verify in Supabase: `select sent_at from reminders;` is populated.
13. **Settings → Danger zone** → type `delete my account` → confirm. Account, purchases, receipts, Stripe subscription should all be gone.

---

## 6. Flip Stripe to live mode

Only after 5 passes end-to-end.

1. Stripe dashboard → top-right toggle **Test → Live**.
2. Re-create the product + monthly + yearly prices in live mode (Stripe doesn't carry them over).
3. Re-create the webhook endpoint in live mode (new signing secret).
4. In Vercel env vars, **swap**:
   - `STRIPE_SECRET_KEY` → live secret
   - `STRIPE_WEBHOOK_SECRET` → live signing secret
   - `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` / `_YEARLY` → live price IDs
5. Redeploy.

---

## 7. Custom domain (optional, ~10 min)

1. Vercel → **Settings → Domains** → **Add** `purchaseping.com`.
2. Add the A/CNAME records Vercel shows you at your DNS host.
3. Wait for SSL provisioning (~1–5 min).
4. Update:
   - `NEXT_PUBLIC_APP_URL` → `https://purchaseping.com`
   - Supabase Auth Site URL + Redirect URLs
   - Stripe webhook URL (re-create or edit) — get the new signing secret
   - Stripe customer portal default return URL
5. Redeploy.

---

## Common gotchas

- **Webhook signature verification fails** → you swapped to live mode but kept the test mode `STRIPE_WEBHOOK_SECRET`.
- **Magic link redirects to localhost** → you forgot to add the deployed `/auth/callback` URL to Supabase redirect URLs.
- **Sample seeder errors with "permission denied"** → you didn't run the schema; categories table is empty.
- **Receipt upload returns 400** → the `receipts` storage bucket doesn't exist. Create it.
- **Cron route returns 401 in browser** → expected. It requires the `Authorization: Bearer $CRON_SECRET` header. Vercel's cron runner provides it automatically; manual `curl` needs to set it.
- **"Cannot read property 'plan' of null"** on `/app` → the auth user signed up but the `handle_new_user` trigger didn't fire. Re-run the schema or insert a profile row manually.

---

## After launch

- Watch Stripe → **Payments** for the first paying user.
- Watch Vercel → **Logs** for cron errors.
- Watch Resend → **Logs** for bounces.
- Set a reminder in 30 days to look at conversion (% of free → Pro within 30d after hitting 10-purchase cap).
