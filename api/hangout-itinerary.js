const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

function inferHangoutTheme(hangout = {}) {
  const source = [
    hangout.name,
    hangout.description,
    hangout.manualLocation,
    ...(hangout.locationOptions || []).map((item) => item?.label || ""),
  ].join(" ").toLowerCase();

  if (/\bpicnic|blanket|park lunch|charcuterie|basket\b/.test(source)) return "picnic";
  if (/\bbeach|boardwalk|ocean|shore|lake day\b/.test(source)) return "beach";
  if (/\bbrunch|breakfast|cafe crawl\b/.test(source)) return "brunch";
  if (/\bdinner|restaurant|tasting|supper\b/.test(source)) return "dinner";
  if (/\bmovie|cinema|screening\b/.test(source)) return "movie";
  if (/\bgame night|games|board game|arcade\b/.test(source)) return "games";
  if (/\brooftop|lounge|sunset drinks|cocktail\b/.test(source)) return "rooftop";
  if (/\bmuseum|gallery|exhibit|art walk\b/.test(source)) return "museum";
  if (/\bcoffee|matcha|tea|study date\b/.test(source)) return "coffee";
  return "general";
}

function buildThemeAgenda(theme, name, location, booking = {}) {
  const themed = {
    picnic: [
      { section: "Arrival", time: "20 min before", title: "Claim the picnic spot", notes: `Get to ${booking.meetingPoint || location} early, lay out blankets, and pick the shady or best-view section before the crew arrives.` },
      { section: "Kickoff", time: "Start time", title: "Food spread and settle-in", notes: "Set out snacks, drinks, fruit, and shared picnic food so everyone can eat while people finish arriving." },
      { section: "Main plan", time: "30 min in", title: "Picnic activities block", notes: "Rotate through picnic-friendly activities like card games, conversation prompts, a speaker playlist, frisbee, or taking photos." },
      { section: "Reset", time: "Midpoint", title: "Walk and recharge", notes: "Do a quick walk around the park, waterfront, or garden path, then come back for dessert or a second round of snacks." },
      { section: "Wrap-up", time: "Last 20 min", title: "Clean-up and final photos", notes: "Pack trash, split leftovers, and grab group photos before everyone heads out." },
    ],
    beach: [
      { section: "Arrival", time: "20 min before", title: "Meet by the setup spot", notes: `Gather near ${booking.meetingPoint || location}, claim a good area, and set up towels, umbrellas, and drinks.` },
      { section: "Kickoff", time: "Start time", title: "Ease into the beach day", notes: "Start with snacks, sunscreen, and a quick check-in before anyone wanders too far." },
      { section: "Main plan", time: "30 min in", title: "Water or sand activity block", notes: "Build in a beach-specific activity like swimming, beach games, a photo walk, or a boardwalk stop." },
      { section: "Food", time: "Midpoint", title: "Snacks or nearby food stop", notes: "Pause for cold drinks, fruit, sandwiches, or a quick food run nearby." },
      { section: "Wrap-up", time: "Last 20 min", title: "Sunset reset", notes: "Clean up, rinse off, and decide whether the crew is heading home or continuing somewhere nearby." },
    ],
    brunch: [
      { section: "Arrival", time: "15 min before", title: "Meet and get seated", notes: `Meet near ${booking.meetingPoint || location}, check the reservation, and get the group settled.` },
      { section: "Kickoff", time: "Start time", title: "Order and catch up", notes: "Use the first stretch for ordering, menu recommendations, and getting everyone talking." },
      { section: "Main plan", time: "Midpoint", title: "Main brunch moment", notes: "Leave room for a group toast, dessert split, or a themed conversation moment." },
      { section: "After", time: "After meal", title: "Short walk or next stop", notes: "Add a nearby walk, coffee run, or browse stop so the hangout does not end too abruptly." },
    ],
    dinner: [
      { section: "Arrival", time: "15 min before", title: "Meet and check reservation", notes: `Gather near ${booking.meetingPoint || location} and confirm the table or order plan.` },
      { section: "Kickoff", time: "Start time", title: "Set the tone", notes: "Start with appetizers, intros, or a quick check on dietary needs before the full meal." },
      { section: "Main plan", time: "Midpoint", title: "Dinner flow", notes: "Let the main meal be the center, then add one fun shared moment like dessert, photos, or a toast." },
      { section: "Wrap-up", time: "Last 20 min", title: "Bill and next move", notes: "Handle the check smoothly and decide whether the crew is heading out or continuing somewhere else." },
    ],
    movie: [
      { section: "Arrival", time: "20 min before", title: "Meet before showtime", notes: `Have everyone meet at ${booking.meetingPoint || location} early enough for tickets, snacks, and finding seats.` },
      { section: "Kickoff", time: "Start time", title: "Snacks and seating", notes: "Get popcorn or drinks, then settle everyone before the previews start." },
      { section: "Main plan", time: "During show", title: "Movie block", notes: "Keep the main event simple and build the social part around before or after the screening." },
      { section: "After", time: "After show", title: "Post-movie debrief", notes: "Leave space for reactions, a quick rating, and maybe a dessert or late snack stop." },
    ],
    games: [
      { section: "Arrival", time: "15 min before", title: "Set up the game zone", notes: `Get to ${booking.meetingPoint || location} early enough to lay out games, snacks, and seating.` },
      { section: "Kickoff", time: "Start time", title: "Warm-up round", notes: "Open with an easy game or icebreaker so nobody feels lost jumping in." },
      { section: "Main plan", time: "Midpoint", title: "Main rounds", notes: "Use this block for the bigger game, bracket, or challenge everyone came for." },
      { section: "Wrap-up", time: "Last 20 min", title: "Final round and reset", notes: "Do one last quick game, tally winners if needed, and clean up together." },
    ],
    rooftop: [
      { section: "Arrival", time: "15 min before", title: "Meet before heading up", notes: `Use ${booking.meetingPoint || location} as the meetup anchor so everyone reaches the rooftop together.` },
      { section: "Kickoff", time: "Start time", title: "Settle in with the view", notes: "Start with drinks, photos, and a relaxed catch-up before the crowd gets louder." },
      { section: "Main plan", time: "Midpoint", title: "Main social block", notes: "Build around conversation, sunset timing, a food order, or a mini photo moment." },
      { section: "Wrap-up", time: "Last 20 min", title: "Decide the next move", notes: "End with a clear plan for rides, the next stop, or heading home." },
    ],
    museum: [
      { section: "Arrival", time: "15 min before", title: "Meet before entry", notes: `Gather at ${booking.meetingPoint || location}, sort tickets, and decide the route inside.` },
      { section: "Kickoff", time: "Start time", title: "Start with the featured section", notes: "Use the first section to get everyone into the same flow before splitting attention." },
      { section: "Main plan", time: "Midpoint", title: "Explore and compare favorites", notes: "Pause midway so people can share what they liked most or where they want to linger." },
      { section: "After", time: "After visit", title: "Cafe or walk after", notes: "Add a nearby cafe, bench break, or neighborhood walk so the hangout ends naturally." },
    ],
    coffee: [
      { section: "Arrival", time: "10 min before", title: "Meet and order", notes: `Gather near ${booking.meetingPoint || location}, get drinks in early, and claim the best seating.` },
      { section: "Kickoff", time: "Start time", title: "Catch-up round", notes: "Start with light conversation, check-ins, and whatever brought the crew together." },
      { section: "Main plan", time: "Midpoint", title: "Main conversation block", notes: "Use the middle for the deeper talk, planning chat, or mini activity like journaling or card prompts." },
      { section: "Wrap-up", time: "Last 15 min", title: "Next steps and photo", notes: "End with a quick recap, maybe a photo, and a decision on the next meetup." },
    ],
    general: [
      { section: "Arrival", time: "15 min before", title: "Arrival window", notes: `Have everyone arrive near ${booking.meetingPoint || location} and settle in.` },
      { section: "Kickoff", time: "Start time", title: `${name} kickoff`, notes: `Start the hangout at ${location} and make sure the group is all here.` },
      { section: "Main plan", time: "Midpoint", title: "Main activity block", notes: "Do the main plan, order food if needed, and keep the vibe moving." },
      { section: "Wrap-up", time: "Last 20 min", title: "Close well", notes: "Confirm rides, photos, or the next move before everyone heads out." },
    ],
  };

  return themed[theme] || themed.general;
}

function buildFallbackAgenda(hangout = {}) {
  const name = hangout.name || "Hangout";
  const location = (hangout.locationOptions || [])[0]?.label || hangout.manualLocation || "the meetup spot";
  const booking = hangout.planningDetails || {};
  const theme = inferHangoutTheme(hangout);
  const steps = buildThemeAgenda(theme, name, location, booking);

  return steps.map((item, index) => ({
    id: `hangout-fallback-${index + 1}`,
    section: item.section || (index === 0 ? "Arrival" : index === 1 ? "Kickoff" : index === 2 ? "Main plan" : "Wrap-up"),
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
    "Use the hangout name, description, chosen places, chosen time options, planning notes, reservation details, and meeting point.",
    "Infer the actual hangout type from the name and description, then make the ideas match that type closely.",
    "If it sounds like a picnic, include picnic-specific steps or activities such as blanket setup, snack spread, outdoor games, a short walk, photos, or sunset timing when appropriate.",
    "If it sounds like brunch, beach, dinner, rooftop, game night, coffee, museum, or movie plans, make the suggestions fit that exact kind of outing.",
    "Avoid generic filler. Every suggestion should clearly connect to what the user entered.",
    "Do not suggest unrelated activities that clash with the hangout type.",
    "Do not include markdown outside JSON.",
    "",
    `Inferred theme hint: ${inferHangoutTheme(hangout)}`,
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
