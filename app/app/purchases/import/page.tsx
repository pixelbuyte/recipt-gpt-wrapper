import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CsvImportForm } from "@/components/CsvImportForm";

export const dynamic = "force-dynamic";

const SAMPLE = `item_name,merchant,order_date,price,currency,category,return_deadline,warranty_end,notes
AirPods Pro,Apple,2024-12-15,249.00,USD,Electronics,2025-01-14,2025-12-15,Christmas gift
Standing desk,Fully,2024-09-03,899.00,USD,Home,2024-10-03,2031-09-03,
Hoka Clifton 9,Hoka,2025-02-20,145.00,USD,Clothing,2025-03-22,,
`;

export default function ImportPage() {
  return (
    <>
      <Link
        href="/app/purchases"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to purchases
      </Link>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Import from CSV</h1>
      <p className="mb-8 text-sm text-muted">
        Bulk-add purchases from a spreadsheet. Up to 500 rows per file.
      </p>

      <section className="card p-6">
        <h2 className="text-base font-semibold">Upload</h2>
        <p className="mt-1 text-sm text-muted">
          Required columns: <code className="text-ink">item_name</code>,{" "}
          <code className="text-ink">order_date</code>,{" "}
          <code className="text-ink">price</code>. Optional: merchant, currency,
          category, return_deadline, warranty_end, notes.
        </p>
        <div className="mt-5">
          <CsvImportForm />
        </div>
      </section>

      <section className="card mt-6 p-6">
        <h2 className="text-base font-semibold">Format</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>
            Dates can be <code className="text-ink">YYYY-MM-DD</code>,{" "}
            <code className="text-ink">3/15/2025</code>, or{" "}
            <code className="text-ink">Mar 15, 2025</code>.
          </li>
          <li>Prices are in major units (e.g. <code className="text-ink">24.99</code>).</li>
          <li>
            Currency is a 3-letter ISO code; defaults to{" "}
            <code className="text-ink">USD</code> when omitted.
          </li>
          <li>
            Category is matched by name (case-insensitive) against your
            categories. Unknown categories become Uncategorized.
          </li>
          <li>
            Header synonyms accepted: <code className="text-ink">item</code> /{" "}
            <code className="text-ink">name</code>,{" "}
            <code className="text-ink">store</code> /{" "}
            <code className="text-ink">vendor</code>,{" "}
            <code className="text-ink">date</code>,{" "}
            <code className="text-ink">amount</code> /{" "}
            <code className="text-ink">total</code>,{" "}
            <code className="text-ink">return</code>,{" "}
            <code className="text-ink">warranty</code>.
          </li>
        </ul>
      </section>

      <section className="card mt-6 p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold">Sample</h2>
          <a
            download="purchase-ping-sample.csv"
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(SAMPLE)}`}
            className="text-sm text-accent hover:underline"
          >
            Download
          </a>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-gray-50 p-3 text-xs text-ink">
          {SAMPLE}
        </pre>
      </section>
    </>
  );
}
