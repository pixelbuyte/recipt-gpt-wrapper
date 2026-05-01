import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function anthropic() {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
  _client = new Anthropic({ apiKey: key });
  return _client;
}

export function ocrEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
