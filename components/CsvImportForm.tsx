"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { importCsv, type ImportResult } from "@/app/app/purchases/import/actions";

export function CsvImportForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    setResult(null);
    try {
      const r = await importCsv(formData);
      setResult(r);
    } catch (err) {
      // redirect() throws NEXT_REDIRECT — let it propagate.
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (msg.includes("NEXT_REDIRECT")) throw err;
      setResult({ ok: false, errors: [msg] });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <input
        type="file"
        name="csv"
        required
        accept=".csv,text/csv"
        className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent hover:file:bg-indigo-100"
      />

      {result && !result.ok ? (
        <div className="rounded-card border border-red-200 bg-red-50 p-4 text-sm">
          <ul className="space-y-1 text-red-700">
            {result.errors.map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
          {result.helpText ? (
            <p className="mt-3 text-xs text-red-700/80">{result.helpText}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          <Upload className="h-4 w-4" />
          {submitting ? "Importing…" : "Import"}
        </button>
      </div>
    </form>
  );
}
