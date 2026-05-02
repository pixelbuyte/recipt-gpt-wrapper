# Launch kit — ProductHunt

Everything you need for the day-of launch. Aim for a **Tuesday or Wednesday**, posted at **00:01 PT** (so US & EU both see it on day-of).

---

## Pre-launch checklist (1 week out)

- [ ] Domain bought, DNS pointed, SSL green.
- [ ] `NEXT_PUBLIC_APP_URL` updated to the live domain in Vercel.
- [ ] Stripe in live mode; tested with a real $1 charge to your own card.
- [ ] Resend domain verified, SPF/DKIM/DMARC green.
- [ ] At least one populated demo account for screenshots (use the "Load 5 sample items" button).
- [ ] `/privacy` and `/terms` reviewed (Termly or a lawyer if you have spare cash).
- [ ] Favicon, OG image (1200×630), Twitter card image.
- [ ] You've **followed 50+ accounts** on ProductHunt and shipped a few thoughtful comments on other launches in the prior week. PH boosts launches from active community members.

## Hunter — optional but useful

Top-tier hunters move PH numbers but charge $200–$1k or want equity. For a $9/mo consumer SaaS this is rarely worth it — you can hunt yourself.

If you do want one: send the message below to **3–5 hunters** a week before launch. Don't mass-spam.

> Subject: Hunting Purchase Ping next [day]?
>
> Hi [name], I shipped Purchase Ping — a personal dashboard that tracks return windows and warranties for online purchases, with email reminders before deadlines close. Targeting consumers who buy a lot online but lose receipts in their inbox.
>
> Looking to launch on PH next [Tuesday]. Would you be up for hunting it? Live preview: [link]. Happy to share the assets I've prepared.
>
> Thanks either way.

---

## Listing copy

### Title (60 char)
**Purchase Ping — Never miss a return window**

Alternates if PH says it's taken:
- "Purchase Ping: track returns, warranties, and spending"
- "Purchase Ping — Receipt control for online shoppers"

### Tagline (60 char)
**The personal dashboard for everything you buy online**

### Description (260 char)
> Purchase Ping is a personal dashboard for the stuff you buy online. Track return windows, warranties, and monthly spending in one place — and get an email 3 days before a return deadline closes. No bank sync. No Gmail parsing. One missed return pays for the year.

### Topics
`Productivity`, `Personal Finance`, `SaaS`

### Maker comment (post 30 minutes after launch)

> Hey PH 👋
>
> I built Purchase Ping after I missed a $180 return on a desk chair I never set up — turns out the window had closed two days earlier while the box sat by my door.
>
> Every receipt-tracking app I tried was either built for accountants (B2B feel) or required wiring up my Gmail. I just wanted a calm dashboard that says "this thing has 3 days left to return."
>
> What it does:
> • Manual entry or AI receipt scan (Pro) — no email/bank sync
> • Email reminders 3 days before return windows close
> • Warranty timeline so the receipt is two clicks away when something breaks
> • 6-month spend chart and category breakdown — for awareness, not budgeting
>
> Free for up to 10 purchases. Pro is $9/mo and the receipt scan auto-fills the form from a photo. Annual saves 26%.
>
> Genuinely curious: how do *you* track returns today? Calendar reminders? Pretending the deadline doesn't exist? Asking for the next iteration of the product.

### "First reply to first comment" template
Always reply to the first commenter within 5 minutes. PH algorithm rewards engagement velocity.

> Thanks [name]! [respond to their actual point]. Curious — would [feature they hinted at] be useful for you specifically, or is the deadline reminder the main draw?

---

## Gallery images (1270×760 or 16:9)

Shoot in light mode, default zoom, on the demo account. Use the **Load 5 sample items** seeder.

1. **Hero — populated dashboard.** Three stat cards visible (returns, warranties, this month) with the colored deadline chips. This is the headline shot.
2. **Add Purchase form.** Show the AI scan button highlighted (after picking a receipt). Annotate "AI fills the fields from a photo."
3. **Purchases list with filters.** Show the search box + a category selected. Annotate "Find that thing you bought 6 months ago."
4. **Mobile.** A clean shot of the dashboard on iPhone width — proves it works on a phone.
5. **Pricing panel** from the landing page.

Tools: [Cleanshot X](https://cleanshot.com) on Mac, or just `cmd+shift+5`. Touch up in [Figma](https://figma.com) or [Canva](https://canva.com) — add a 10px gray border, drop shadow, white background.

## OG / Twitter card image (1200×630)

Headline + product shot in a single image. The current landing's headline reads great over a screenshot of the dashboard. Tools: same as above. Save as `public/og.png` and reference in `app/page.tsx` metadata once the file exists (Next picks it up automatically from `app/opengraph-image.png` per the [convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)).

---

## Day-of timeline (PT)

| Time | Action |
|---|---|
| 00:01 | Submit. Tweet "we're live on PH" with the link. |
| 00:30 | Post the maker comment. |
| 01:00 | DM 5–10 friends asking for an honest comment (NOT just an upvote — comments matter more). |
| 06:00 | Check first comment thread; reply to every comment. |
| 07:00–22:00 | Reply to every comment within 30 minutes. Don't ignore criticism — engage with it. |
| 22:00 | Post a "thank you" comment with the day's stats. |

## Day-of don'ts

- ❌ Don't ask for upvotes anywhere. PH dehoists launches that mass-solicit.
- ❌ Don't post "Pls upvote 🙏" in your friends' Slack.
- ❌ Don't pivot the description after a few hours — locked in once people land on it.
- ❌ Don't burn out replying. Set a 60-min lunch break and a 2-hour dinner break.

---

## After launch (week +1)

- [ ] Email anyone who signed up but hasn't added a purchase: "want me to import a CSV from somewhere?"
- [ ] Write a Show HN post (different angle: technical — "I built a return-window tracker on Next.js 14 + Supabase + Claude vision").
- [ ] Post a teardown on Twitter/X: 3 things that worked, 3 that didn't.
- [ ] Tag everyone who commented on the PH page in a "thanks for the feedback" tweet — they'll often reshare.

## Distribution channels worth trying after PH

| Channel | Effort | Yield | Notes |
|---|---|---|---|
| Show HN | 30 min | medium | Technical angle works ("I shipped X with Y stack"). Often dies fast. |
| Reddit r/personalfinance, r/Frugal, r/buyitforlife | 1 hour | medium | Read rules carefully. No "I built" posts allowed in some — frame as "anyone else lose track of return windows?" |
| Twitter build-in-public thread | 2 hours | medium | Show the metric you care about (signups → free → Pro). |
| Indie Hackers | 30 min | low | Diminished but still has eyeballs. |
| TikTok demo (15s "I built an app to never miss a return") | 4 hours per video | sometimes huge | High variance. Three videos, see what sticks. |
| SEO on "track Amazon returns" / "warranty tracker" | months | compounds | Long game. Worth one good landing page per high-intent keyword. |
| Cold DMs to "I love a good spreadsheet" Twitter accounts | 2 hours | small | Low cost, occasional gold. |

## Honest expectations

- **PH best-case:** #1–5 of the day, 200+ upvotes, 50–100 signups, 1–5 paying conversions in the first week.
- **PH typical:** 50–100 upvotes, 20–40 signups, 0–2 paying conversions.
- **PH bad day:** 20 upvotes, 5 signups, no paid. Still worth it for the SEO link.

The PH launch is the *first* distribution moment, not the only one. Plan for week 2–4 to keep moving traffic.
