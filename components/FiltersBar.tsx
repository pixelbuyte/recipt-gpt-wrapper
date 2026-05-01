"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Category = { id: string; name: string };

export function FiltersBar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState(params.get("q") ?? "");
  const cat = params.get("cat") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  // Debounce search updates so we're not pushing a URL on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q) next.set("q", q);
      else next.delete("q");
      if (next.toString() !== params.toString()) {
        startTransition(() => router.replace(`?${next.toString()}`));
      }
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // "/" focuses the search input from anywhere on the page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function setParam(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    startTransition(() => router.replace(`?${next.toString()}`));
  }

  function clear() {
    setQ("");
    startTransition(() => router.replace(`?`));
  }

  const hasFilters = q || cat || from || to;

  return (
    <div className="card mb-4 flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-3">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search item, merchant, notes…"
          className="input pl-9"
        />
        <span className="pointer-events-none absolute left-3 top-2.5 text-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <kbd className="pointer-events-none absolute right-3 top-2 rounded border border-border bg-gray-50 px-1.5 py-0.5 text-[10px] text-muted">
          /
        </kbd>
      </div>
      <select
        value={cat}
        onChange={(e) => setParam("cat", e.target.value)}
        className="input md:w-40"
        aria-label="Category"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={from}
        onChange={(e) => setParam("from", e.target.value)}
        className="input md:w-36"
        aria-label="From"
      />
      <input
        type="date"
        value={to}
        onChange={(e) => setParam("to", e.target.value)}
        className="input md:w-36"
        aria-label="To"
      />
      {hasFilters ? (
        <button onClick={clear} className="btn-secondary md:ml-1">
          Clear
        </button>
      ) : null}
    </div>
  );
}
