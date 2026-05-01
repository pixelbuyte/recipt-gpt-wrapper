import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← Purchase Ping
      </Link>
      <article className="prose prose-sm mt-6 max-w-none text-ink">{children}</article>
    </main>
  );
}
