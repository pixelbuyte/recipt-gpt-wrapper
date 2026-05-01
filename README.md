# Purchase Ping

Personal control center for online purchases — receipts, return deadlines, warranties, and spending.

Stack: Next.js 14 App Router · TypeScript · Tailwind · Supabase (Auth/Postgres/Storage) · Stripe · Resend · Recharts · Vercel.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # fill in keys
# apply supabase/schema.sql in the Supabase SQL editor
pnpm dev
```

## Folder structure

```
purchase-ping/
├─ app/
│  ├─ (marketing)/
│  │  └─ page.tsx                # landing
│  ├─ login/
│  │  └─ page.tsx
│  ├─ app/
│  │  ├─ layout.tsx              # sidebar shell, auth guard
│  │  ├─ page.tsx                # dashboard
│  │  ├─ purchases/
│  │  │  ├─ page.tsx             # list + filters
│  │  │  ├─ new/page.tsx
│  │  │  └─ [id]/page.tsx
│  │  ├─ settings/page.tsx
│  │  └─ upgrade/page.tsx
│  ├─ api/
│  │  ├─ webhooks/stripe/route.ts
│  │  └─ cron/reminders/route.ts
│  └─ layout.tsx
├─ components/
│  ├─ ui/                        # shadcn primitives
│  ├─ Sidebar.tsx
│  ├─ TopBar.tsx
│  ├─ StatCard.tsx
│  ├─ DeadlineChip.tsx
│  ├─ SpendBarChart.tsx
│  ├─ CategoryDonut.tsx
│  ├─ PurchaseForm.tsx
│  ├─ PurchaseTable.tsx
│  ├─ FiltersBar.tsx
│  ├─ ReceiptUpload.tsx
│  ├─ UpgradeModal.tsx
│  └─ EmptyState.tsx
├─ lib/
│  ├─ supabase/server.ts
│  ├─ supabase/client.ts
│  ├─ stripe.ts
│  ├─ resend.ts
│  ├─ dates.ts
│  ├─ format.ts
│  └─ paywall.ts
├─ supabase/
│  └─ schema.sql
├─ emails/
│  ├─ ReturnReminder.tsx
│  └─ WarrantyReminder.tsx
├─ public/
├─ .env.example
├─ tailwind.config.ts
├─ next.config.mjs
└─ package.json
```

## Routes

| Path | Auth | Purpose |
|---|---|---|
| `/` | public | Landing |
| `/login` | public | Magic link |
| `/app` | yes | Dashboard |
| `/app/purchases` | yes | List + filters |
| `/app/purchases/new` | yes | Add |
| `/app/purchases/[id]` | yes | Detail/edit |
| `/app/settings` | yes | Profile, prefs, billing |
| `/app/upgrade` | yes | Paywall + Stripe checkout |
| `/api/webhooks/stripe` | service | Stripe → DB sync |
| `/api/cron/reminders` | cron | Daily reminder dispatch |

## Environment variables

See `.env.example`. Never commit `.env.local`.

## Implementation order

1. Scaffold Next.js + Tailwind + shadcn + lucide.
2. Supabase project, run `supabase/schema.sql`, create `receipts` storage bucket (private).
3. Auth: magic link, `middleware.ts` to gate `/app/*`, profile auto-create trigger.
4. App shell: sidebar layout, route group `app/app/*`.
5. Add Purchase: form + server action + receipt upload to Supabase Storage.
6. Purchases list: server-rendered table + filters bar.
7. Dashboard: stat cards, Recharts spend + category, sample seeder.
8. Reminders: insert trigger to create reminder rows; `/api/cron/reminders` reads due rows, sends Resend email, marks `sent_at`.
9. Stripe: checkout session, webhook flips `profiles.plan`, customer portal.
10. Paywall: server-side guard in Add Purchase action; `UpgradeModal` on client.
11. Settings + landing + empty states + mobile pass.
12. Deploy to Vercel, set cron to daily 09:00 UTC.

## Cut-if-late checklist

- Skip donut, keep bar chart only.
- Skip warranty reminders, keep return reminders only.
- Skip annual plan, monthly only.
- Skip mobile card-list, use horizontal scroll on table.
