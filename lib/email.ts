import { Resend } from "resend";
import { fmtDate } from "@/lib/dates";
import { formatCents } from "@/lib/format";

let _resend: Resend | null = null;
function client() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  _resend = new Resend(key);
  return _resend;
}

export type ReminderEmail = {
  to: string;
  kind: "return" | "warranty";
  itemName: string;
  merchant: string | null;
  priceCents: number;
  currency: string;
  deadlineISO: string;
  appUrl: string;
};

export async function sendReminderEmail(input: ReminderEmail) {
  const from =
    process.env.RESEND_FROM_EMAIL ?? "Purchase Ping <reminders@purchaseping.com>";
  const subject =
    input.kind === "return"
      ? `Return window closes ${fmtDate(input.deadlineISO)} — ${input.itemName}`
      : `Warranty ends ${fmtDate(input.deadlineISO)} — ${input.itemName}`;

  const headline =
    input.kind === "return"
      ? "Heads up: your return window is closing."
      : "Heads up: your warranty is about to end.";

  return client().emails.send({
    from,
    to: input.to,
    subject,
    html: emailHTML({ ...input, headline }),
    text: emailText({ ...input, headline }),
  });
}

type Body = ReminderEmail & { headline: string };

function emailText(b: Body) {
  return [
    b.headline,
    "",
    `${b.itemName}${b.merchant ? ` — ${b.merchant}` : ""}`,
    `${formatCents(b.priceCents, b.currency)}`,
    `${b.kind === "return" ? "Return by" : "Warranty ends"}: ${fmtDate(b.deadlineISO)}`,
    "",
    `Open Purchase Ping: ${b.appUrl}/app`,
  ].join("\n");
}

function emailHTML(b: Body) {
  const action = b.kind === "return" ? "Return by" : "Warranty ends";
  return `<!doctype html><html><body style="font-family:Inter,system-ui,sans-serif;background:#f7f7f8;padding:24px;color:#0B0B0F">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:24px">
    <tr><td>
      <h1 style="margin:0 0 8px;font-size:18px">${b.headline}</h1>
      <p style="margin:0 0 16px;color:#6B7280;font-size:14px">From Purchase Ping.</p>
      <div style="border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin-bottom:16px">
        <div style="font-weight:600">${escapeHtml(b.itemName)}</div>
        ${b.merchant ? `<div style="color:#6B7280;font-size:13px;margin-top:4px">${escapeHtml(b.merchant)}</div>` : ""}
        <div style="margin-top:8px;font-size:13px"><strong>${formatCents(b.priceCents, b.currency)}</strong></div>
        <div style="margin-top:8px;font-size:13px;color:#6366F1">${action} ${fmtDate(b.deadlineISO)}</div>
      </div>
      <a href="${escapeHtml(b.appUrl)}/app" style="display:inline-block;background:#6366F1;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:14px;font-weight:500">Open Purchase Ping</a>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
