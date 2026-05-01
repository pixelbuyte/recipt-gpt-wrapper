"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPurchase } from "@/app/app/purchases/actions";
import { addDaysISO, todayISO } from "@/lib/dates";

type Category = { id: string; name: string };

export function PurchaseForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderDate, setOrderDate] = useState(todayISO());
  const [returnDeadline, setReturnDeadline] = useState(() => addDaysISO(todayISO(), 30));
  const [warrantyEnd, setWarrantyEnd] = useState(() => addDaysISO(todayISO(), 365));

  function onOrderDateChange(next: string) {
    setOrderDate(next);
    if (!next) return;
    // Re-anchor both deadlines to the new order date. Users can still edit
    // either field afterward; if they then change order_date again the
    // defaults will reset, which is the expected "templated" behavior.
    setReturnDeadline(addDaysISO(next, 30));
    setWarrantyEnd(addDaysISO(next, 365));
  }

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    try {
      await createPurchase(formData);
    } catch (err) {
      // redirect() throws NEXT_REDIRECT — let it propagate.
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (msg.includes("NEXT_REDIRECT")) throw err;
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Field label="Item name" name="item_name" required placeholder="AirPods Pro" />
          <Field label="Merchant" name="merchant" placeholder="Apple" />
          <Field
            label="Order date"
            name="order_date"
            type="date"
            required
            value={orderDate}
            onChange={(e) => onOrderDateChange(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price" name="price" required placeholder="249.00" inputMode="decimal" />
            <div>
              <label className="label" htmlFor="currency">Currency</label>
              <select id="currency" name="currency" defaultValue="USD" className="input">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>CAD</option>
                <option>AUD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="category_id">Category</label>
            <select id="category_id" name="category_id" className="input" defaultValue="">
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <Field
            label="Return deadline"
            name="return_deadline"
            type="date"
            value={returnDeadline}
            onChange={(e) => setReturnDeadline(e.target.value)}
            help="Defaults to 30 days from order date."
          />
          <Field
            label="Warranty end"
            name="warranty_end"
            type="date"
            value={warrantyEnd}
            onChange={(e) => setWarrantyEnd(e.target.value)}
            help="Defaults to 1 year from order date."
          />
          <div>
            <label className="label" htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="input"
              placeholder="Anything you want to remember about this purchase…"
            />
          </div>
          <div>
            <label className="label" htmlFor="receipt">Receipt (optional)</label>
            <input
              id="receipt"
              name="receipt"
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-xs text-muted">PNG, JPG, or PDF up to 10MB.</p>
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="sticky bottom-0 -mx-8 flex items-center justify-end gap-3 border-t border-border bg-white/80 px-8 py-4 backdrop-blur">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : "Save purchase"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  help,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; help?: string }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="input" {...rest} />
      {help ? <p className="mt-1 text-xs text-muted">{help}</p> : null}
    </div>
  );
}
