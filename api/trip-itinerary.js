const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

function buildFallbackSuggestions(trip = {}) {
  const days = Math.max(Number(trip.days) || 0, 1);
  const destination = trip.destination || "your destination";
  const bookingInfo = trip.bookingInfo || {};
  const preferences = Array.isArray(trip.tripPreferences) ? trip.tripPreferences : [];
  const normalizedDestination = destination.toLowerCase();

  const chinaGuides = {
    beijing: {
      city: "Beijing, China",
      province: "Beijing Municipality",
      ideas: [
        ["Arrive through Beijing Capital or Daxing and settle into Dongcheng", "Walk around Wangfujing and snack through the night market streets", "Evening view near Jingshan Park"],
        ["Forbidden City and Tiananmen Square block", "Lunch with Peking duck in Chaoyang or Dongcheng", "798 Art District or Sanlitun evening"],
        ["Great Wall day around Mutianyu", "Tea break and hutong wander in Gulou", "Hotpot or roast duck dinner"],
      ],
    },
    shanghai: {
      city: "Shanghai, China",
      province: "Shanghai Municipality",
      ideas: [
        ["Settle in near The Bund or Jing'an", "Walk Nanjing Road and the Bund at sunset", "Late dinner in Huangpu or Xuhui"],
        ["Yu Garden and Old Street morning", "French Concession cafe and shopping block", "Lujiazui skyline night"],
        ["Shanghai Museum or an art stop in West Bund", "Xintiandi lunch and people-watching", "River cruise or rooftop finish"],
      ],
    },
    guangzhou: {
      city: "Guangzhou, China",
      province: "Guangdong Province",
      ideas: [
        ["Settle into Tianhe or Yuexiu", "Canton Tower photo stop", "Late dinner for dim sum or roasted meats"],
        ["Chen Clan Ancestral Hall and Liwan wander", "Shamian Island slow afternoon", "Beijing Road night walk"],
        ["Morning tea in Yuexiu", "Pearl River stretch or Haixinsha", "Night market snacks and dessert stop"],
      ],
    },
    shenzhen: {
      city: "Shenzhen, China",
      province: "Guangdong Province",
      ideas: [
        ["Arrive and settle in Futian or Nanshan", "Shenzhen Bay sunset walk", "Seafood or hotpot dinner"],
        ["OCT Loft creative district", "Window of the World or Splendid China afternoon", "Coco Park nightlife block"],
        ["Dameisha or coastal half-day", "Shopping in Luohu or MixC", "Chill cafe night in Nanshan"],
      ],
    },
    chengdu: {
      city: "Chengdu, China",
      province: "Sichuan Province",
      ideas: [
        ["Settle in around Jinjiang or Chunxi Road", "Chunxi Road stroll and snacks", "Sichuan hotpot night"],
        ["People's Park tea house morning", "Jinli Ancient Street and Wuhou Shrine", "Late-night skewers or dessert"],
        ["Panda base early start", "Slow afternoon around Taikoo Li", "Riverside evening or live music"],
      ],
    },
    xian: {
      city: "Xi'an, China",
      province: "Shaanxi Province",
      ideas: [
        ["Arrive and settle inside or near the city wall", "Muslim Quarter food run", "Bell Tower night photos"],
        ["Terracotta Warriors half-day", "Biang biang noodles lunch", "City wall biking or sunset walk"],
        ["Small Wild Goose Pagoda or museum stop", "Yongxingfang snack block", "Tea and recap dinner"],
      ],
    },
    hangzhou: {
      city: "Hangzhou, China",
      province: "Zhejiang Province",
      ideas: [
        ["Settle in near West Lake", "Lakeside sunset walk", "Longjing tea dinner area"],
        ["West Lake boat and causeway morning", "Lingyin Temple or tea village stop", "Night market dessert run"],
        ["Slow brunch in Shangcheng", "Shopping or rest in Hubin", "Golden hour photo stop by the lake"],
      ],
    },
  };

  const matchedChinaGuide = Object.entries(chinaGuides).find(([key]) => normalizedDestination.includes(key))?.[1];
  const baseIdeas = matchedChinaGuide
    ? matchedChinaGuide.ideas
    : [
        ["Arrive and settle in", `Walk a key district in ${destination}`, "Dinner in a popular local area"],
        ["Main landmark block", "Lunch near a popular neighborhood", "Evening market or skyline stop"],
        ["Slow morning cafe or brunch", "Flexible explore window", "Favorite place recap dinner"],
      ];

  const arrivalNotes = [];
  if (bookingInfo.arrivalCity) {
    arrivalNotes.push(`Arrive via ${bookingInfo.arrivalCity}.`);
  }
  if (bookingInfo.layoverCity) {
    arrivalNotes.push(`Watch the layover in ${bookingInfo.layoverCity}.`);
  }
  if (bookingInfo.stayArea || bookingInfo.stayName) {
    arrivalNotes.push(`Stay anchor: ${bookingInfo.stayName || bookingInfo.stayArea}.`);
  }

  return Array.from({ length: days }, (_, index) => {
    const titles = baseIdeas[index % baseIdeas.length];
    return titles.map((title, itemIndex) => ({
      id: `fallback-${index + 1}-${itemIndex + 1}`,
      day: index + 1,
      time: ["09:00", "13:00", "19:00"][itemIndex] || "",
      title,
      category: ["arrival", "explore", "food"][itemIndex] || "general",
      notes: [
        matchedChinaGuide
          ? `${title} around ${matchedChinaGuide.city}${matchedChinaGuide.province ? `, ${matchedChinaGuide.province}` : ""}.`
          : `${title} in ${destination}.`,
        preferences.length ? `Best fit for: ${preferences.join(", ")}.` : "",
        arrivalNotes.join(" "),
      ].filter(Boolean).join(" "),
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
    "Use actual named places, neighborhoods, landmarks, cities, and provinces whenever possible.",
    "If the destination is in China, include real city and province context instead of generic wording.",
    "Respect arrival timing, layovers, and stay location if booking info is provided.",
    "Keep the suggestions flexible, budget-aware, and group-friendly.",
    "Do not include markdown outside JSON.",
    "",
    `Trip name: ${trip.name || "Trip"}`,
    `Destination: ${trip.destination}`,
    `Start date: ${trip.startDate}`,
    `End date: ${trip.endDate}`,
    `Budget: ${trip.budget || 0}`,
    `Days: ${trip.days || 1}`,
    `Trip interests: ${Array.isArray(trip.tripPreferences) ? trip.tripPreferences.join(", ") : ""}`,
    `Booking info JSON: ${JSON.stringify(trip.bookingInfo || {})}`,
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
