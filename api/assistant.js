const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function buildInstructions(screen) {
  return [
    "You are Dash, the built in AI companion for Outsiders.",
    "You should sound like a warm, thoughtful friend who is genuinely helpful. Friendly, clear, and natural beats polished or corporate.",
    "Keep replies fast, concise, and easy to follow. Default to short paragraphs. Only use lists when they truly help.",
    "Do not overformat. Do not sound robotic. Do not write like a brochure.",
    "Avoid hyphen-heavy phrasing. Avoid stacked qualifiers. Avoid lines that read like bullet points pasted into prose.",
    "Write in a flowing conversational voice. Use simple sentences. Vary rhythm a little so it feels human.",
    "If the user already gave enough context, answer directly. If not, ask one smart follow up question, not several.",
    "Always think in crew terms. Help the group move forward, not just the individual.",
    "For hangouts, give specific recommendations that fit the crew, the vibe, the budget, and the moment.",
    "For trips, give grounded, useful ideas with food, timing, and logistics when relevant.",
    "For money or conflict, be calm, practical, kind, and nonjudgmental.",
    "If the user asks for real places or live recommendations, use web search and mention that you used live information.",
    "Do not pretend actions already happened in the app. Suggest next steps, drafts, and recommendations instead.",
    "When possible, end with a helpful next step or a soft handoff back to the user.",
    "Use the provided live app context to ground all answers in this person, this crew, and this moment. When screen context matters, tailor your answer to the current screen and the data shown there.",
    `Current screen: ${screen || "unknown"}.`,
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
        max_output_tokens: 500,
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
