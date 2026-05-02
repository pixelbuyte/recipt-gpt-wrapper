import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Check, LineChart, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Purchase Ping — Never miss another return window",
  description:
    "The personal dashboard for everything you buy online. Track return windows, warranties, and spending in one place. Email reminders before deadlines close.",
  openGraph: {
    title: "Purchase Ping — Never miss another return window",
    description:
      "Track return windows, warranties, and spending for everything you buy online. Email reminders before deadlines close.",
    url: "/",
    siteName: "Purchase Ping",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Purchase Ping — Never miss another return window",
    description:
      "Track return windows, warranties, and spending for everything you buy online.",
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-accent" />
          <span className="text-base font-semibold tracking-tight">Purchase Ping</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#how" className="hidden text-muted hover:text-ink sm:inline">
            How it works
          </a>
          <a href="#pricing" className="text-muted hover:text-ink">Pricing</a>
          <Link href="/login" className="btn-secondary">Sign in</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-12 pt-16 text-center md:pt-20">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs text-muted">
          <Sparkles className="h-3 w-3 text-accent" />
          New: AI receipt scan on Pro
        </div>
        <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
          The $200 return you forgot about?
          <br />
          <span className="text-accent">Never again.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Purchase Ping is the personal dashboard for everything you buy
          online. Track return windows, warranties, and spending in one place —
          and get an email <strong className="text-ink">3 days before</strong> a
          return deadline closes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/login" className="btn-primary">
            Start free — no card required
          </Link>
          <a href="#pricing" className="text-sm text-muted hover:text-ink">
            See pricing →
          </a>
        </div>
        <p className="mt-4 text-xs text-muted">
          One missed return pays for the year of Pro.
        </p>
      </section>

      {/* Visual / hero card */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="card overflow-hidden p-2">
          <div className="rounded-md border border-border bg-gradient-to-br from-gray-50 to-white p-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MockStat
                label="Returns closing soon"
                value="2"
                sub="next 14 days"
                rows={[
                  ["AirPods Pro", "Apple", "3d", "red"],
                  ["Hoka Clifton 9", "Hoka", "11d", "gray"],
                ]}
              />
              <MockStat
                label="Warranties ending"
                value="1"
                sub="next 30 days"
                rows={[["Standing desk", "Fully", "22d", "amber"]]}
              />
              <MockStat
                label="This month"
                value="$1,427.99"
                sub="6 purchases"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-2 text-center text-3xl font-semibold tracking-tight">
          What it does
        </h2>
        <p className="mb-12 text-center text-muted">Three things, well.</p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Feature
            icon={<Bell className="h-5 w-5" />}
            title="Returns, before they close"
            body="Add a purchase, set the return deadline (we suggest 30 days). We email you 3 days before it ends. No more 'ugh, I missed it by a day.'"
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Warranties on a timeline"
            body="See every warranty expiration in one view. When something breaks, the receipt is two clicks away — not lost in your inbox from 2023."
          />
          <Feature
            icon={<LineChart className="h-5 w-5" />}
            title="Spending without judgment"
            body="Six-month chart, category breakdown, searchable history. Not a budgeting app — just clarity about what you bought."
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="card grid grid-cols-1 gap-8 p-8 md:grid-cols-2 md:p-12">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent">
              <Sparkles className="h-3 w-3" />
              Pro feature
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Snap a receipt, fields fill themselves
            </h2>
            <p className="mt-3 text-sm text-muted">
              Upload a photo or PDF and the merchant, item, price, and date
              prefill from the image. Review, save, done — typing optional.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Works on photos, screenshots, and PDFs
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Powered by Claude vision — same AI behind this site&apos;s code
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Your receipts never train any model
              </li>
            </ul>
          </div>
          <div className="rounded-md border border-border bg-gradient-to-br from-accent-50 to-white p-6">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Receipt</span>
              <span className="rounded-full bg-accent-50 px-2 py-0.5 font-medium text-accent">
                Scanning…
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <FillRow label="Item" value="AirPods Pro (2nd gen)" />
              <FillRow label="Merchant" value="Apple" />
              <FillRow label="Price" value="$249.00" />
              <FillRow label="Date" value="Dec 15, 2024" />
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-border bg-gray-50/40 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Pricing</h2>
          <p className="mt-2 text-center text-sm text-muted">
            Start free. Upgrade when reminders pay for themselves.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <PricingCard
              name="Free"
              price="$0"
              cadence="forever"
              tagline="Up to 10 purchases. Perfect to try it."
              cta="Start free"
              features={[
                "Up to 10 purchases",
                "Dashboard with deadlines",
                "Search & history",
                "Receipt uploads",
              ]}
            />
            <PricingCard
              name="Pro"
              price="$9"
              cadence="per month"
              tagline="One missed return pays for the year."
              cta="Start free, upgrade later"
              highlighted
              features={[
                "Unlimited purchases",
                "Email reminders before windows close",
                "AI receipt scan (auto-fill from image)",
                "CSV import & export",
                "Receipt storage up to 2GB",
              ]}
              note="Annual is $79 (save 26%). Cancel anytime."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">FAQ</h2>
        <div className="mt-10 space-y-6">
          <Faq
            q="Is this a budgeting app?"
            a="No. There&apos;s no budget setting, no goals, no shame messages. It tracks what you bought and when things expire. The chart is for awareness, not enforcement."
          />
          <Faq
            q="Do you sync with my bank or Gmail?"
            a="No, by design. You enter purchases manually or import a CSV. On Pro, you can also snap a photo of the receipt and we auto-fill the fields. We never read your email or connect to your bank."
          />
          <Faq
            q="What happens if I miss the email reminder?"
            a="We email 3 days before the deadline (Pro). The deadline also shows on your dashboard with a colored countdown chip — red ≤3 days, amber ≤7 days, gray otherwise. You can&apos;t miss it unless you really try."
          />
          <Faq
            q="What if I cancel?"
            a="Your data stays. You drop to the free 10-purchase view. Upgrade again any time and everything is right where you left it."
          />
          <Faq
            q="Where does my data live?"
            a="Supabase (US-East). Receipts are stored in a private bucket and only ever accessed by your account. See the privacy page for details."
          />
          <Faq
            q="Can I import from a spreadsheet?"
            a="Yes. CSV import is on every plan. The page shows a sample format and accepts header synonyms (item, name, store, vendor, date, etc.)."
          />
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
        </div>
        <div className="mt-2">© {new Date().getFullYear()} Purchase Ping</div>
      </footer>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card p-6">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent-50 text-accent">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  cadence,
  tagline,
  features,
  cta,
  highlighted,
  note,
}: {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  note?: string;
}) {
  return (
    <div className={"card p-6 " + (highlighted ? "border-accent ring-1 ring-accent" : "")}>
      <div className="text-sm text-muted">{name}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">{price}</span>
        <span className="text-sm text-muted">{cadence}</span>
      </div>
      <p className="mt-2 text-sm text-muted">{tagline}</p>
      <ul className="mt-5 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={highlighted ? "btn-primary mt-6 w-full" : "btn-secondary mt-6 w-full"}
      >
        {cta}
      </Link>
      {note ? <p className="mt-3 text-center text-xs text-muted">{note}</p> : null}
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="card p-5">
      <summary className="cursor-pointer text-sm font-medium">{q}</summary>
      <p className="mt-3 text-sm text-muted">{a}</p>
    </details>
  );
}

function MockStat({
  label,
  value,
  sub,
  rows,
}: {
  label: string;
  value: string;
  sub: string;
  rows?: Array<[string, string, string, "red" | "amber" | "gray"]>;
}) {
  const tones = {
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-800",
    gray: "bg-gray-100 text-gray-700",
  };
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted">{sub}</div>
      {rows ? (
        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
          {rows.map(([title, sub, days, tone]) => (
            <div key={title} className="flex items-center justify-between text-xs">
              <div className="min-w-0">
                <div className="truncate">{title}</div>
                <div className="truncate text-[10px] text-muted">{sub}</div>
              </div>
              <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + tones[tone]}>
                {days} left
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FillRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2">
      <span className="text-xs text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

