const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

function buildInstructions(screen) {
  return [
    "You are Outsiders AI, the bona fide hangout assistant for a social planning app.",
    "Be warm, friendly, concise, practical, and playful without being cheesy.",
    "Your strongest job is helping users decide where to go, what fits the vibe, and how to pitch plans well.",
    "Use the provided live app context to help with writing, summarizing, brainstorming, planning, de-escalation, place recommendations, and decision support.",
    "Do not pretend actions were completed in the app. Suggest actions, drafts, and next steps instead.",
    "Important: Outsiders already has a separate deterministic Hangout Assistant for availability overlap and timing recommendations. Do not replace it. If the user needs the mathematically best overlap, point them back to the existing timing assistant while still helping with wording, framing, tradeoffs, and planning.",
    "When recommending places, prioritize the user's stated vibe, budget, group size, and location. Also weigh favorite places and rating patterns from the app context.",
    "If the user asks for real places, current venues, best spots near them, or anything that benefits from current real-world data, use web search before answering.",
    "When web-backed recommendations are used, mention that you used live web information and keep the suggestions grounded and realistic.",
    "When screen context matters, tailor your answer to the current screen and the data shown there.",
    "Prefer actionable outputs: bullets, sample messages, proposal names, itineraries, apology drafts, captions, or checklists.",
    `Current screen key: ${screen || "unknown"}.`,
  ].join("\n");
}

function extractOutput(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return {
      text: payload.output_text.trim(),
      sources: payload?.web_search_call?.action?.sources || [],
    };
  }

  const chunks = [];
  const sources = [];
  for (const item of payload?.output || []) {
    if (item?.type === "message") {
      for (const content of item.content || []) {
        if (content?.type === "output_text" && content.text) {
          chunks.push(content.text);
        }
      }
    }
    if (item?.type === "web_search_call" && Array.isArray(item?.action?.sources)) {
      sources.push(...item.action.sources);
    }
  }

  return {
    text: chunks.join("\n\n").trim(),
    sources,
  };
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
        tools: [
          {
            type: "web_search",
            user_location: {
              type: "approximate",
              country: "US",
              city: typeof context?.currentUser?.location === "string" ? context.currentUser.location : undefined,
              timezone: "America/New_York",
            },
          },
        ],
        tool_choice: "auto",
        include: ["web_search_call.action.sources"],
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

    const { text, sources } = extractOutput(payload);
    if (!text) {
      res.status(502).json({ error: "The assistant returned an empty response." });
      return;
    }

    res.status(200).json({
      responseId: payload.id || null,
      text,
      sources: sources
        .map((item) => ({ title: item?.title || item?.url || "Source", url: item?.url || "" }))
        .filter((item, index, list) => item.url && list.findIndex((candidate) => candidate.url === item.url) === index)
        .slice(0, 5),
      model: payload.model || DEFAULT_MODEL,
    });
  } catch (error) {
    res.status(500).json({
      error: error?.message || "The assistant request failed.",
    });
  }
}
