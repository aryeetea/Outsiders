const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

function buildFallbackAgenda(hangout = {}) {
  const name = hangout.name || "Hangout";
  const location = (hangout.locationOptions || [])[0]?.label || hangout.manualLocation || "the meetup spot";
  const booking = hangout.planningDetails || {};
  const steps = [
    { time: "15 min before", title: "Arrival window", notes: `Have everyone arrive near ${booking.meetingPoint || location} and settle in.` },
    { time: "Start time", title: `${name} kickoff`, notes: `Start the hangout at ${location} and make sure the group is all here.` },
    { time: "Midpoint", title: "Main activity block", notes: "Do the main plan, order food if needed, and keep the vibe moving." },
    { time: "Wrap-up", title: "Close well", notes: "Confirm rides, photos, or the next move before everyone heads out." },
  ];

  return steps.map((item, index) => ({
    id: `hangout-fallback-${index + 1}`,
    section: index === 0 ? "Arrival" : index === 1 ? "Kickoff" : index === 2 ? "Main plan" : "Wrap-up",
    time: item.time,
    title: item.title,
    notes: [
      item.notes,
      booking.reservationName ? `Reservation: ${booking.reservationName}.` : "",
    ].filter(Boolean).join(" "),
  }));
}

function parseJsonResponse(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return [];
  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1] : trimmed;
  const parsed = JSON.parse(candidate);
  return Array.isArray(parsed?.agendaSuggestions) ? parsed.agendaSuggestions : (Array.isArray(parsed) ? parsed : []);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const hangout = req.body?.hangout && typeof req.body.hangout === "object" ? req.body.hangout : {};
  if (!hangout?.name || !Array.isArray(hangout?.locationOptions) || !hangout.locationOptions.length) {
    res.status(400).json({ error: "Hangout name and at least one place option are required." });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(200).json({ agendaSuggestions: buildFallbackAgenda(hangout), source: "fallback" });
    return;
  }

  const prompt = [
    "Create a useful, realistic hangout run-of-show.",
    "Return strict JSON with this shape: {\"agendaSuggestions\":[{\"id\":\"...\",\"section\":\"Arrival|Kickoff|Main plan|Food|Wrap-up\",\"time\":\"...\",\"title\":\"...\",\"notes\":\"...\"}]}",
    "Make 4 to 6 suggestions total.",
    "The suggestions should feel like a sequence for one hangout, not a trip itinerary.",
    "Use the hangout name, chosen places, chosen time options, planning notes, reservation details, and meeting point.",
    "Avoid generic filler. Ground the ideas in what the user already entered.",
    "Do not include markdown outside JSON.",
    "",
    `Hangout name: ${hangout.name}`,
    `Description: ${hangout.description || ""}`,
    `Time options: ${(hangout.timeOptions || []).map((item) => item.label).join(" | ")}`,
    `Place options: ${(hangout.locationOptions || []).map((item) => item.label).join(" | ")}`,
    `Planning details JSON: ${JSON.stringify(hangout.planningDetails || {})}`,
    `Outside invites: ${(hangout.externalInvites || []).join(", ")}`,
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
        max_output_tokens: 800,
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
    const agendaSuggestions = parseJsonResponse(outputText);

    if (!agendaSuggestions.length) {
      res.status(200).json({ agendaSuggestions: buildFallbackAgenda(hangout), source: "fallback" });
      return;
    }

    res.status(200).json({
      agendaSuggestions: agendaSuggestions.map((item, index) => ({
        id: item.id || `hangout-ai-${index + 1}`,
        section: item.section || "Main plan",
        time: item.time || "",
        title: item.title || "Hangout step",
        notes: item.notes || "",
      })),
      source: "openai",
    });
  } catch (error) {
    res.status(200).json({ agendaSuggestions: buildFallbackAgenda(hangout), source: "fallback", warning: error?.message || "" });
  }
}
