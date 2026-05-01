import Link from "next/link";
import { Bell, ShieldCheck, LineChart } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-accent" />
          <span className="text-base font-semibold tracking-tight">Purchase Ping</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#pricing" className="text-muted hover:text-ink">Pricing</a>
          <Link href="/login" className="btn-secondary">Sign in</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
          Never miss another return window.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Purchase Ping is the personal dashboard for everything you buy online —
          return deadlines, warranties, and spending, all in one place. Stop digging
          through email.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/login" className="btn-primary">Start free — no card required</Link>
          <a href="#pricing" className="btn-secondary">See pricing</a>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-20 md:grid-cols-3">
        <Feature
          icon={<Bell className="h-5 w-5" />}
          title="Returns, before they close."
          body="Drop in a purchase and we email you 3 days before the return window ends. No more “ugh, I missed it by a day.”"
        />
        <Feature
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Warranties you'll actually remember."
          body="See every warranty expiration on one timeline. Find the receipt in two clicks when something breaks."
        />
        <Feature
          icon={<LineChart className="h-5 w-5" />}
          title="A clean view of what you spend."
          body="Six-month chart, category breakdown, searchable history. Not a budgeting app — just clarity."
        />
      </section>

      <section id="pricing" className="border-t border-border bg-gray-50/40 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Pricing</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <PricingCard
              name="Free"
              price="$0"
              cadence="forever"
              tagline="Track up to 10 purchases. Perfect to try it out."
              cta="Start free"
              features={[
                "Up to 10 purchases",
                "Dashboard + deadline view",
                "Search & history",
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
                "Email reminders before return & warranty windows close",
                "Receipt storage up to 2GB",
                "CSV export",
              ]}
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        © {new Date().getFullYear()} Purchase Ping
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
}: {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        "card p-6 " + (highlighted ? "border-accent ring-1 ring-accent" : "")
      }
    >
      <div className="text-sm text-muted">{name}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">{price}</span>
        <span className="text-sm text-muted">{cadence}</span>
      </div>
      <p className="mt-2 text-sm text-muted">{tagline}</p>
      <ul className="mt-5 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      <Link
        href="/login"
        className={highlighted ? "btn-primary mt-6 w-full" : "btn-secondary mt-6 w-full"}
      >
        {cta}
      </Link>
    </div>
  );
}
