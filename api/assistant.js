const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

function buildInstructions(screen) {
  return [
    "You are Outsiders AI, the bona fide assistant for a social planning app.",
    "Be warm, concise, practical, and playful without being cheesy.",
    "Use the provided live app context to help with writing, summarizing, brainstorming, planning, de-escalation, and decision support.",
    "Do not pretend actions were completed in the app. Suggest actions, drafts, and next steps instead.",
    "Important: Outsiders already has a separate deterministic Hangout Assistant for availability overlap and timing recommendations. Do not replace it. If the user needs the mathematically best overlap, point them back to the existing timing assistant while still helping with wording, framing, tradeoffs, and planning.",
    "When screen context matters, tailor your answer to the current screen and the data shown there.",
    "Prefer actionable outputs: bullets, sample messages, proposal names, itineraries, apology drafts, captions, or checklists.",
    `Current screen key: ${screen || "unknown"}.`,
  ].join("\n");
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const chunks = [];
  for (const item of payload?.output || []) {
    if (item?.type !== "message") continue;
    for (const content of item.content || []) {
      if (content?.type === "output_text" && content.text) {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\n\n").trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({
      error: "OPENAI_API_KEY is missing. Add it to your server environment to enable Outsiders AI.",
    });
    return;
  }

  const message = String(req.body?.message || "").trim();
  const previousResponseId = typeof req.body?.previousResponseId === "string" ? req.body.previousResponseId : null;
  const screen = typeof req.body?.screen === "string" ? req.body.screen : "unknown";
  const context = req.body?.context && typeof req.body.context === "object" ? req.body.context : {};

  if (!message) {
    res.status(400).json({ error: "A message is required." });
    return;
  }

  const contextBlock = JSON.stringify(context, null, 2);
  const input = [
    "Live app context JSON:",
    contextBlock,
    "",
    `User request: ${message}`,
  ].join("\n");

  try {
    const upstream = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        store: true,
        previous_response_id: previousResponseId || undefined,
        instructions: buildInstructions(screen),
        input,
        max_output_tokens: 700,
        reasoning: { effort: "low" },
      }),
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      const errorMessage = payload?.error?.message || "OpenAI request failed.";
      res.status(upstream.status).json({ error: errorMessage });
      return;
    }

    const text = extractOutputText(payload);
    if (!text) {
      res.status(502).json({ error: "The assistant returned an empty response." });
      return;
    }

    res.status(200).json({
      responseId: payload.id || null,
      text,
      model: payload.model || DEFAULT_MODEL,
    });
  } catch (error) {
    res.status(500).json({
      error: error?.message || "The assistant request failed.",
    });
  }
}
