"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/app`,
      },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
      <div className="w-full">
        <a href="/" className="mb-8 block text-sm text-muted hover:text-ink">
          ← Back
        </a>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Purchase Ping</h1>
        <p className="mt-2 text-sm text-muted">
          We&apos;ll email you a magic link. No password required.
        </p>

        {status === "sent" ? (
          <div className="mt-8 rounded-card border border-border bg-accent-50 p-4 text-sm">
            Check <span className="font-medium">{email}</span> for your sign-in link.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary w-full"
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>
        )}
      </div>
    </main>
  );
}
