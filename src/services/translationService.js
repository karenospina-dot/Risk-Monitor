import { TRANSLATE_FIELDS } from "../constants";

/**
 * Translates all text fields in a risks array from Spanish → English
 * using the Anthropic Claude API. Returns a map: riskId → { field → translated string }
 */
export async function translateRisksToEnglish(risks) {
  const items = [];
  risks.forEach((r) => {
    TRANSLATE_FIELDS.forEach((field) => {
      const text = r[field];
      if (text && text.trim()) {
        items.push({ id: r.id, field, text: text.trim() });
      }
    });
  });

  if (!items.length) return {};

  // Split into chunks of 40 items to stay within token limits
  const CHUNK = 40;
  const chunks = [];
  for (let i = 0; i < items.length; i += CHUNK) {
    chunks.push(items.slice(i, i + CHUNK));
  }

  const map = {};

  for (const chunk of chunks) {
    const chunkPrompt = `You are a professional translator specializing in labor law, risk management, and corporate governance.
Translate each item from Spanish to English. Keep proper nouns, legal codes (e.g. "Ley 2466/2025"), acronyms, and technical terms intact.
Return ONLY a JSON array with the same structure: [{id, field, text}] where text is the English translation.
No preamble, no markdown fences, no extra text — pure JSON array only.

Input:
${JSON.stringify(chunk)}`;

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || "";
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: chunkPrompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`API ${response.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await response.json();
    const raw = data.content?.find((b) => b.type === "text")?.text || "[]";
    const clean = raw.replace(/```json|```/g, "").trim();
    const translated = JSON.parse(clean);
    translated.forEach(({ id, field, text }) => {
      if (!map[id]) map[id] = {};
      map[id][field] = text;
    });
  }

  return map;
}
