const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

function buildFallbackSuggestions(trip = {}) {
  const days = Math.max(Number(trip.days) || 0, 1);
  const destination = trip.destination || "your destination";
  const suggestionSets = [
    ["Arrive and settle in", "Neighborhood walk and lunch", "Sunset photo stop"],
    ["Brunch spot", "Main attraction block", "Dinner reservation"],
    ["Coffee and slow morning", "Free afternoon for shopping or rest", "Group night activity"],
    ["Scenic stop", "Flexible explore window", "Favorite place recap dinner"],
  ];

  return Array.from({ length: days }, (_, index) => {
    const titles = suggestionSets[index % suggestionSets.length];
    return titles.map((title, itemIndex) => ({
      id: `fallback-${index + 1}-${itemIndex + 1}`,
      day: index + 1,
      time: ["09:00", "13:00", "19:00"][itemIndex] || "",
      title,
      category: ["arrival", "explore", "food"][itemIndex] || "general",
      notes: `${title} in ${destination}, leaving enough room for the crew to adjust based on energy and budget.`,
    }));
  }).flat();
}

function parseJsonResponse(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return [];

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1] : trimmed;
  const parsed = JSON.parse(candidate);
  return Array.isArray(parsed?.suggestions) ? parsed.suggestions : (Array.isArray(parsed) ? parsed : []);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const trip = req.body?.trip && typeof req.body.trip === "object" ? req.body.trip : {};
  if (!trip?.destination || !trip?.startDate || !trip?.endDate) {
    res.status(400).json({ error: "Trip destination and dates are required." });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(200).json({ suggestions: buildFallbackSuggestions(trip), source: "fallback" });
    return;
  }

  const prompt = [
    "Create a useful, realistic group trip itinerary draft.",
    "Return strict JSON with this shape: {\"suggestions\":[{\"id\":\"...\",\"day\":1,\"time\":\"09:00\",\"title\":\"...\",\"category\":\"food|explore|rest|nightlife|travel|general\",\"notes\":\"...\"}]}",
    "Make 2 to 4 suggestions per day.",
    "Keep the suggestions flexible, budget-aware, and group-friendly.",
    "Do not include markdown outside JSON.",
    "",
    `Trip name: ${trip.name || "Trip"}`,
    `Destination: ${trip.destination}`,
    `Start date: ${trip.startDate}`,
    `End date: ${trip.endDate}`,
    `Budget: ${trip.budget || 0}`,
    `Days: ${trip.days || 1}`,
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
        input: prompt,
        reasoning: { effort: "low" },
        max_output_tokens: 900,
      }),
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: payload?.error?.message || "OpenAI request failed." });
      return;
    }

    const outputText = payload?.output_text
      || payload?.output?.flatMap((item) => item?.content || []).find((item) => item?.type === "output_text")?.text
      || "";
    const suggestions = parseJsonResponse(outputText);

    if (!suggestions.length) {
      res.status(200).json({ suggestions: buildFallbackSuggestions(trip), source: "fallback" });
      return;
    }

    res.status(200).json({ suggestions, source: "openai" });
  } catch (error) {
    res.status(200).json({ suggestions: buildFallbackSuggestions(trip), source: "fallback", warning: error?.message || "" });
  }
}
