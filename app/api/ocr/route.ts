import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { anthropic } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"]);

const ReceiptSchema = z.object({
  merchant: z.string().nullable(),
  item_name: z.string().nullable(),
  price: z.number().nullable(),
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD"]).nullable(),
  order_date: z.string().nullable(),
});

const SYSTEM = [
  "You extract structured data from a receipt or order confirmation.",
  "Return null for any field you can't read confidently — do not guess.",
  "Item name: the most prominent purchased item, or a short summary if multiple line items.",
  "Price: the total in major units (e.g. 24.99 not 2499). Numbers only.",
  "Currency: 3-letter ISO code if visible on the receipt; null if you can't tell.",
  "Order date: ISO 8601 (YYYY-MM-DD).",
].join(" ");

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Pro-only feature.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  if ((profile?.plan ?? "free") !== "pro") {
    return NextResponse.json({ error: "Pro plan required for AI receipt scan." }, { status: 402 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const file = form.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing receipt file." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Receipt must be 10MB or smaller." }, { status: 400 });
  }
  if (!ACCEPTED.has(file.type)) {
    return NextResponse.json(
      { error: "File must be PNG, JPEG, WEBP, GIF, or PDF." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
  const isPdf = file.type === "application/pdf";

  let client: Anthropic;
  try {
    client = anthropic();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  const userBlock: Anthropic.Beta.BetaContentBlockParam = isPdf
    ? {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: bytes },
      }
    : {
        type: "image",
        source: {
          type: "base64",
          media_type: file.type as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
          data: bytes,
        },
      };

  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: SYSTEM,
      output_config: { effort: "low" },
      output_format: betaZodOutputFormat(ReceiptSchema),
      messages: [
        {
          role: "user",
          content: [
            userBlock,
            { type: "text", text: "Extract the receipt fields and return JSON matching the schema." },
          ],
        },
      ],
    });

    if (!response.parsed_output) {
      return NextResponse.json(
        { error: "Could not extract structured fields from this receipt." },
        { status: 422 },
      );
    }
    return NextResponse.json(response.parsed_output);
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic ${e.status}: ${e.message}` },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
