import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl font-semibold tracking-tight">404</div>
      <p className="mt-4 text-muted">
        That page doesn&apos;t exist. It may have moved, or you may have followed
        a stale link.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link href="/" className="btn-secondary">
          Home
        </Link>
        <Link href="/app" className="btn-primary">
          Open dashboard
        </Link>
      </div>
    </main>
  );
}
