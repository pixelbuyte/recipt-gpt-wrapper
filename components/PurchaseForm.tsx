"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createPurchase } from "@/app/app/purchases/actions";
import { addDaysISO, todayISO } from "@/lib/dates";

type Category = { id: string; name: string };
type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD";

const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "CAD", "AUD"];

export function PurchaseForm({
  categories,
  ocrEnabled,
}: {
  categories: Category[];
  ocrEnabled: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [itemName, setItemName] = useState("");
  const [merchant, setMerchant] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [orderDate, setOrderDate] = useState(todayISO());
  const [returnDeadline, setReturnDeadline] = useState(() => addDaysISO(todayISO(), 30));
  const [warrantyEnd, setWarrantyEnd] = useState(() => addDaysISO(todayISO(), 365));

  const [hasReceipt, setHasReceipt] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanFilled, setScanFilled] = useState(false);
  const receiptRef = useRef<HTMLInputElement | null>(null);

  function onOrderDateChange(next: string) {
    setOrderDate(next);
    if (!next) return;
    // Re-anchor both deadlines to the new order date. Users can still edit
    // either field afterward; if they then change order_date again the
    // defaults will reset, which is the expected "templated" behavior.
    setReturnDeadline(addDaysISO(next, 30));
    setWarrantyEnd(addDaysISO(next, 365));
  }

  async function onScan() {
    const file = receiptRef.current?.files?.[0];
    if (!file) return;
    setScanning(true);
    setScanError(null);
    setScanFilled(false);
    try {
      const fd = new FormData();
      fd.append("receipt", file);
      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error ?? `Scan failed (${res.status})`);
      }
      // Only overwrite fields the model returned non-null for; preserve any
      // values the user already typed in.
      if (body.item_name) setItemName(body.item_name);
      if (body.merchant) setMerchant(body.merchant);
      if (typeof body.price === "number") setPrice(body.price.toFixed(2));
      if (body.currency && CURRENCIES.includes(body.currency)) {
        setCurrency(body.currency as Currency);
      }
      if (body.order_date) onOrderDateChange(body.order_date);
      setScanFilled(true);
    } catch (e) {
      setScanError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
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
          <Field
            label="Item name"
            name="item_name"
            required
            placeholder="AirPods Pro"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <Field
            label="Merchant"
            name="merchant"
            placeholder="Apple"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
          <Field
            label="Order date"
            name="order_date"
            type="date"
            required
            value={orderDate}
            onChange={(e) => onOrderDateChange(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Price"
              name="price"
              required
              placeholder="249.00"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <div>
              <label className="label" htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="input"
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
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
            <div className="flex items-center justify-between">
              <label className="label mb-0" htmlFor="receipt">Receipt (optional)</label>
              {ocrEnabled && hasReceipt ? (
                <button
                  type="button"
                  onClick={onScan}
                  disabled={scanning}
                  className="inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent hover:bg-indigo-100 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {scanning ? "Scanning…" : "Scan with AI"}
                </button>
              ) : null}
            </div>
            <input
              ref={receiptRef}
              id="receipt"
              name="receipt"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(e) => {
                setHasReceipt(Boolean(e.target.files?.length));
                setScanError(null);
                setScanFilled(false);
              }}
              className="mt-1.5 block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-xs text-muted">PNG, JPG, WEBP, or PDF up to 10MB.</p>
            {scanError ? (
              <p className="mt-2 text-xs text-red-600">{scanError}</p>
            ) : scanFilled ? (
              <p className="mt-2 text-xs text-accent">Filled from receipt — review before saving.</p>
            ) : null}
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
