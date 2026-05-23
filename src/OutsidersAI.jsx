import { useMemo, useState } from "react";
import { createOpenAIResponse, DEFAULT_OPENAI_MODEL } from "./openaiResponses";

const STORAGE_KEY = "outsiders-ai-api-key";

const SCREEN_LABELS = {
  landing: "Landing",
  login: "Login",
  signup: "Signup",
  dashboard: "Dashboard",
  "create-hangout": "Create Hangout",
  "join-hangout": "Join Hangout",
  voting: "Voting",
  "friend-groups": "Friend Groups",
  "trip-planning": "Trip Planning",
  "bill-split": "Bill Split",
  "rate-outing": "Rate Outing",
  debrief: "Debrief",
  profile: "Profile",
};

const QUICK_ACTIONS = {
  default: [
    "Help me find a place for my hangout — tell me the vibe you're going for.",
    "Suggest fun hangout ideas for a group of friends.",
    "Help me plan a hangout from start to finish.",
  ],
  dashboard: [
    "What's a fun hangout idea for this weekend?",
    "Find somewhere new my crew hasn't been yet.",
    "Help me plan a spontaneous hangout — any city, any vibe.",
  ],
  "create-hangout": [
    "Find venues near [your location] with reservation links.",
    "Give me 3 restaurants in [city] I can book for my group.",
    "Help me write a fun invite description for this hangout.",
  ],
  voting: [
    "Compare our hangout options and recommend the best one.",
    "Explain which option fits the group best and why.",
    "Suggest a fun tiebreaker if the group can't decide.",
  ],
  "friend-groups": [
    "Find hangout spots in [city] that work for a group.",
    "What activities suit a close-knit friend group?",
    "Suggest something unique this crew probably hasn't done.",
  ],
  "trip-planning": [
    "Build a day trip itinerary for [destination] with booking links.",
    "Find the best restaurants near [location] I can reserve now.",
    "Give me a morning-to-night plan for our trip.",
  ],
  "bill-split": [
    "Suggest affordable hangout ideas that keep costs low.",
    "What are free or cheap group activities near [city]?",
    "Help us plan a great hangout on a tight budget.",
  ],
  debrief: [
    "Suggest a low-key hangout to help the group reconnect.",
    "What venues are best for calm, relaxed meetups?",
    "Help me plan something simple everyone will enjoy.",
  ],
};

const STYLES = `
  .outsiders-ai-wrap {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 300;
    font-family: 'Nunito', sans-serif;
  }

  .outsiders-ai-fab {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    border: 4px solid #1a1a2e;
    background: linear-gradient(135deg, #51cf66 0%, #4ecdc4 100%);
    color: #1a1a2e;
    box-shadow: 7px 7px 0 #1a1a2e;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.05em;
  }

  .outsiders-ai-fab:hover {
    transform: translate(-2px, -2px);
    box-shadow: 9px 9px 0 #1a1a2e;
  }

  .outsiders-ai-panel {
    position: absolute;
    right: 0;
    bottom: 90px;
    width: min(420px, calc(100vw - 24px));
    height: min(76vh, 760px);
    background: #fffdf9;
    border: 4px solid #1a1a2e;
    border-radius: 24px;
    box-shadow: 10px 10px 0 #1a1a2e;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .outsiders-ai-header {
    padding: 18px 18px 16px;
    border-bottom: 4px solid #1a1a2e;
    background:
      radial-gradient(circle at top left, rgba(255, 217, 61, 0.7), transparent 42%),
      linear-gradient(135deg, #fff4e6 0%, #e8f4fd 100%);
  }

  .outsiders-ai-screen-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border: 2px solid #1a1a2e;
    border-radius: 999px;
    background: #fff;
    font-family: 'Bangers', cursive;
    font-size: 12px;
    letter-spacing: 0.06em;
  }

  .outsiders-ai-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
    min-height: 0;
  }

  .outsiders-ai-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .outsiders-ai-toolbar-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .outsiders-ai-reset {
    background: #ffd93d;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    padding: 8px 12px;
    font-family: 'Bangers', cursive;
    font-size: 13px;
    letter-spacing: 0.05em;
    cursor: pointer;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .outsiders-ai-conversation {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 4px;
  }

  .outsiders-ai-conversation::-webkit-scrollbar {
    width: 10px;
  }

  .outsiders-ai-conversation::-webkit-scrollbar-thumb {
    background: #d6d1c6;
    border: 2px solid #fffdf9;
    border-radius: 999px;
  }

  .outsiders-ai-input,
  .outsiders-ai-textarea {
    width: 100%;
    border: 3px solid #1a1a2e;
    border-radius: 12px;
    background: #fffdf9;
    color: #1a1a2e;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 700;
    padding: 12px 14px;
    box-sizing: border-box;
    outline: none;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .outsiders-ai-input:focus,
  .outsiders-ai-textarea:focus {
    border-color: #4ecdc4;
    box-shadow: 3px 3px 0 #4ecdc4;
  }

  .outsiders-ai-textarea {
    min-height: 96px;
    resize: none;
  }

  .outsiders-ai-btn,
  .outsiders-ai-chip {
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-weight: 900;
    color: #1a1a2e;
  }

  .outsiders-ai-btn {
    background: #ff6b6b;
    color: #fff;
    border-radius: 12px;
    padding: 11px 16px;
    box-shadow: 4px 4px 0 #1a1a2e;
    font-family: 'Bangers', cursive;
    font-size: 16px;
    letter-spacing: 0.06em;
  }

  .outsiders-ai-btn:disabled {
    cursor: wait;
    opacity: 0.75;
  }

  .outsiders-ai-chip {
    background: #fff;
    border-radius: 16px;
    padding: 10px 12px;
    box-shadow: 3px 3px 0 #1a1a2e;
    text-align: left;
    font-size: 12px;
    line-height: 1.35;
    transition: transform 0.12s, box-shadow 0.12s;
  }

  .outsiders-ai-chip:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 #1a1a2e;
  }

  .outsiders-ai-msg {
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    max-width: 92%;
  }

  .outsiders-ai-msg.user {
    background: #fde8f0;
    border-color: #ff6b9d;
    box-shadow: 4px 4px 0 #ff6b9d;
    margin-left: auto;
  }

  .outsiders-ai-msg.assistant {
    background: #e8fdf2;
    border-color: #51cf66;
    box-shadow: 4px 4px 0 #51cf66;
    margin-right: auto;
  }

  .outsiders-ai-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
  }

  .outsiders-ai-footer {
    border-top: 4px solid #1a1a2e;
    background: linear-gradient(180deg, #fffdf9 0%, #fff7ea 100%);
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .outsiders-ai-footer-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
  }

  .outsiders-ai-compose {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .outsiders-ai-note {
    font-size: 12px;
    line-height: 1.45;
    color: #5d5967;
    font-weight: 700;
  }

  .outsiders-ai-reserve-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #51cf66;
    color: #1a1a2e;
    border: 2px solid #1a1a2e;
    border-radius: 8px;
    padding: 4px 10px;
    font-family: 'Bangers', cursive;
    font-size: 13px;
    letter-spacing: 0.04em;
    text-decoration: none;
    box-shadow: 2px 2px 0 #1a1a2e;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    margin: 2px 1px;
    vertical-align: middle;
  }
  .outsiders-ai-reserve-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .outsiders-ai-link {
    color: #4ecdc4;
    font-weight: 800;
    text-decoration: underline;
    word-break: break-all;
  }

  .ai-tab-bar {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .ai-tab {
    flex: 1;
    padding: 7px 0;
    font-family: 'Bangers', cursive;
    font-size: 15px;
    letter-spacing: 0.06em;
    border: 3px solid #1a1a2e;
    border-radius: 8px;
    cursor: pointer;
    background: #fff;
    color: #1a1a2e;
    box-shadow: 2px 2px 0 #1a1a2e;
    transition: all 0.12s;
  }
  .ai-tab.active {
    background: #1a1a2e;
    color: #fff;
    box-shadow: none;
  }
  .ai-tab:hover:not(.active) {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .ai-avail-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  .ai-avail-person {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 14px;
    box-shadow: 4px 4px 0 #1a1a2e;
    padding: 12px 14px;
  }

  .ai-avail-cell {
    width: 30px;
    height: 26px;
    border-radius: 5px;
    cursor: pointer;
    border: 2px solid #ddd;
    background: #f5f3ee;
    transition: all 0.1s;
    display: block;
  }
  .ai-avail-cell.on {
    background: #51cf66;
    border-color: #1a1a2e;
    box-shadow: 1px 1px 0 #1a1a2e;
  }
  .ai-avail-cell:hover { border-color: #9b59b6; }

  .ai-time-result {
    background: #e8fdf2;
    border: 3px solid #51cf66;
    border-radius: 12px;
    padding: 14px 16px;
    box-shadow: 4px 4px 0 #51cf66;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.6;
    color: #1a1a2e;
    white-space: pre-wrap;
  }

  .ai-find-time-btn {
    width: 100%;
    background: #9b59b6;
    color: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    padding: 11px;
    font-family: 'Bangers', cursive;
    font-size: 18px;
    letter-spacing: 0.06em;
    cursor: pointer;
    box-shadow: 4px 4px 0 #1a1a2e;
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .ai-find-time-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #1a1a2e;
  }
  .ai-find-time-btn:disabled { opacity: 0.65; cursor: wait; }

  @media (max-width: 720px) {
    .outsiders-ai-wrap {
      right: 12px;
      left: 12px;
      bottom: 12px;
    }

    .outsiders-ai-panel {
      right: 0;
      left: 0;
      width: auto;
      bottom: 86px;
    }

    .outsiders-ai-fab {
      margin-left: auto;
    }

    .outsiders-ai-msg {
      max-width: 100%;
    }

    .outsiders-ai-footer-row {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

function safeStringify(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Unable to serialize app data.";
  }
}

function buildAppContext(screen, appData) {
  const groups = appData?.groups || [];
  const hangouts = appData?.hangouts || [];

  const recentLocations = [...new Set(
    hangouts.map(h => h.location).filter(Boolean)
  )].slice(0, 3);

  const summary = {
    currentScreen: SCREEN_LABELS[screen] || screen,
    groups: groups.slice(0, 5).map(g => ({
      name: g.name,
      members: g.members?.length || 0,
    })),
    recentHangouts: hangouts.slice(0, 5).map(h => ({
      name: h.name || h.title,
      location: h.location,
      vibe: h.vibe,
      date: h.date,
    })),
    ...(recentLocations.length > 0 && { knownLocations: recentLocations }),
  };

  return safeStringify(summary);
}

function getQuickActions(screen) {
  return QUICK_ACTIONS[screen] || QUICK_ACTIONS.default;
}

function getSystemInstructions(screen) {
  const screenLabel = SCREEN_LABELS[screen] || "this screen";
  return [
    "You are Outsiders AI, a dedicated hangout planning assistant inside a social app called Outsiders.",
    "Your entire purpose is to help users and their friend groups discover places, plan hangouts, make reservations, and make group decisions easier.",
    "When a user mentions a city, neighborhood, or location, use web search to find specific real places by name — restaurants, bars, cafes, parks, venues, activities, experiences.",
    "Always be specific: name actual places, say what makes them great for groups, and mention price range or vibe when it helps.",
    "For every place you recommend, include a direct reservation or booking link from OpenTable, Resy, Tock, or the venue's own site — format each link as [Reserve on OpenTable](url) or [Book on Resy](url).",
    "If you can't find a specific reservation link, include a Google Maps link formatted as [View on Google Maps](url).",
    "If the user hasn't mentioned a location, ask briefly for their city or neighborhood before recommending spots.",
    "Keep answers short and practical — lead with the best option, offer 2–3 alternatives if useful.",
    "Sound like a knowledgeable friend who knows the best spots: warm, direct, and genuinely helpful.",
    "Avoid vague advice. Every venue recommendation must include the venue name, a one-line reason it fits, and a booking link.",
    `The user is on the ${screenLabel} screen of Outsiders.`,
  ].join(" ");
}

const RESERVATION_PATTERN = /reserve|book|reservation|resy|opentable|yelp|tock/i;

function renderMessageContent(text) {
  if (!text) return null;
  const pattern = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/\S+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    if (match[1]) {
      const label = match[2];
      const url = match[3];
      const isReservation = RESERVATION_PATTERN.test(label + " " + url);
      parts.push(
        <a key={`l-${match.index}`} href={url} target="_blank" rel="noopener noreferrer"
          className={isReservation ? "outsiders-ai-reserve-btn" : "outsiders-ai-link"}>
          {isReservation ? `🗓 ${label}` : label}
        </a>
      );
    } else {
      const url = match[4];
      const isReservation = RESERVATION_PATTERN.test(url);
      parts.push(
        <a key={`u-${match.index}`} href={url} target="_blank" rel="noopener noreferrer"
          className={isReservation ? "outsiders-ai-reserve-btn" : "outsiders-ai-link"}>
          {isReservation ? `🗓 ${url}` : url}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(<span key="t-end">{text.slice(lastIndex)}</span>);
  return parts.length > 0 ? parts : text;
}

function getInitialApiKey() {
  return localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_OPENAI_API_KEY || "";
}

function getGreeting(screen) {
  const greetings = {
    "create-hangout": "Tell me where you're thinking and what kind of hangout you want — I'll find real spots with reservation links and help you lock it in.",
    "trip-planning": "Let's plan your trip! Tell me the destination and how many people are going — I'll find the best spots with booking links so you can reserve ahead.",
    "friend-groups": "Tell me your group's vibe and where you're based — I'll find hangout spots that fit them and include reservation options.",
    dashboard: "What are you planning? Give me a city and a vibe — I'll suggest real places, include booking links, and help you lock in a plan.",
    voting: "Need help deciding? Tell me the options and I'll recommend the best fit for your group — with reservation links if needed.",
    "bill-split": "Looking for the next hangout? Tell me your city and budget and I'll find places with booking options.",
    debrief: "Let's plan something to bring the group back together — tell me where you're based and I'll find a great spot.",
  };
  return greetings[screen] || "Tell me what you're planning and where — I'll find real places, include reservation links, and help you build a hangout your crew will love.";
}

function getWebSearchTools() {
  const timezone = typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "America/New_York";

  return [
    {
      type: "web_search",
      user_location: {
        type: "approximate",
        country: "US",
        timezone,
      },
    },
  ];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const AVAIL_TIMES = ["Morning", "Afternoon", "Evening"];

export default function OutsidersAI({ screen, appData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previousResponseId, setPreviousResponseId] = useState("");
  const [crewAvail, setCrewAvail] = useState([{ name: "You", slots: {} }]);
  const [newCrewName, setNewCrewName] = useState("");
  const [availAiLoading, setAvailAiLoading] = useState(false);
  const [availAiResult, setAvailAiResult] = useState(null);
  const apiKey = getInitialApiKey().trim();

  const appContext = useMemo(() => buildAppContext(screen, appData), [screen, appData]);
  const quickActions = useMemo(() => getQuickActions(screen), [screen]);
  const activeScreenLabel = SCREEN_LABELS[screen] || "Current screen";
  const canSend = draft.trim() && apiKey && !isLoading;

  async function submitPrompt(promptText) {
    const trimmed = promptText.trim();
    if (!trimmed) return;
    if (!apiKey) {
      setError("Outsiders AI is not configured right now.");
      return;
    }

    const userMessage = { role: "user", text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setError("");
    setIsLoading(true);

    try {
      const result = await createOpenAIResponse({
        apiKey,
        model: DEFAULT_OPENAI_MODEL,
        instructions: getSystemInstructions(screen),
        previousResponseId,
        tools: getWebSearchTools(),
        toolChoice: "auto",
        include: ["web_search_call.action.sources"],
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `App context:\n${appContext}\n\nUser request:\n${trimmed}`,
              },
            ],
          },
        ],
      });

      setPreviousResponseId(result.id);
      setMessages((current) => [...current, { role: "assistant", text: result.text }]);
    } catch (requestError) {
      setError(requestError.message || "Something went wrong while contacting OpenAI.");
    } finally {
      setIsLoading(false);
    }
  }

  function clearConversation() {
    setMessages([]);
    setPreviousResponseId("");
    setError("");
  }

  function toggleSlot(personIdx, day, time) {
    const key = `${day}-${time}`;
    setCrewAvail(prev => prev.map((p, i) => {
      if (i !== personIdx) return p;
      return { ...p, slots: { ...p.slots, [key]: !p.slots[key] } };
    }));
  }

  function addCrewMember() {
    const name = newCrewName.trim();
    if (!name) return;
    setCrewAvail(prev => [...prev, { name, slots: {} }]);
    setNewCrewName("");
  }

  function removeCrewMember(idx) {
    setCrewAvail(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleFindBestCrewTime() {
    if (!apiKey) {
      setAvailAiResult({ error: "Add your OpenAI API key to use this feature." });
      return;
    }
    setAvailAiLoading(true);
    setAvailAiResult(null);

    const summary = crewAvail.map(person => {
      const free = Object.entries(person.slots)
        .filter(([, v]) => v)
        .map(([k]) => k.replace("-", " "));
      return `${person.name}: ${free.length > 0 ? free.join(", ") : "no availability marked"}`;
    }).join("\n");

    const prompt = `Here is the weekly availability for a friend group planning a hangout:\n\n${summary}\n\nAnalyze the overlaps and recommend the best 1–3 time slots that work for the most people. For each recommendation: state the day and time, list who can make it, and give a one-line reason it's the best pick. End with a clear "Best pick:" summary.`;

    try {
      const result = await createOpenAIResponse({
        apiKey,
        model: DEFAULT_OPENAI_MODEL,
        instructions: "You are a scheduling assistant. Analyze friend group availability, find the best overlapping windows, and give clear, specific recommendations. Be concise and direct.",
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      });
      setAvailAiResult({ text: result.text });
    } catch (err) {
      setAvailAiResult({ error: err.message || "Something went wrong." });
    } finally {
      setAvailAiLoading(false);
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="outsiders-ai-wrap">
        {isOpen ? (
          <div className="outsiders-ai-panel">
            <div className="outsiders-ai-header">
              <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div className="outsiders-ai-screen-tag">AI Active on {activeScreenLabel}</div>
                  <h3 style={{ margin: "10px 0 4px", fontFamily: "'Bangers', cursive", fontSize: 28, letterSpacing: "0.04em", color: "#1a1a2e" }}>
                    Outsiders AI
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, fontWeight: 800, color: "#5d5967" }}>
                    Your hangout assistant for places, plans, and group timing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{ background: "#fff", border: "3px solid #1a1a2e", borderRadius: 12, width: 42, height: 42, fontSize: 18, fontWeight: 900, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a2e", flexShrink: 0 }}
                >
                  ×
                </button>
              </div>
              <div className="ai-tab-bar">
                {[{ id: "chat", label: "💬 Chat" }, { id: "availability", label: "🗓 Crew Time" }].map(t => (
                  <button key={t.id} type="button" className={`ai-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "chat" && (
              <>
                <div className="outsiders-ai-body">
                  <div className="outsiders-ai-toolbar">
                    <strong style={{ fontFamily: "'Bangers', cursive", fontSize: 18, letterSpacing: "0.05em" }}>Chat</strong>
                    <div className="outsiders-ai-toolbar-meta">
                      <span style={{ fontSize: 11, fontWeight: 900, color: "#4ecdc4" }}>{DEFAULT_OPENAI_MODEL}</span>
                      <button type="button" onClick={clearConversation} className="outsiders-ai-reset">Reset</button>
                    </div>
                  </div>
                  <div className="outsiders-ai-conversation">
                    {messages.length === 0 ? (
                      <div className="outsiders-ai-msg assistant">
                        {getGreeting(screen)}
                        <div className="outsiders-ai-options">
                          {quickActions.map((action) => (
                            <button key={action} type="button" className="outsiders-ai-chip" onClick={() => submitPrompt(action)} disabled={isLoading}>
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div key={`${message.role}-${index}`} className={`outsiders-ai-msg ${message.role}`}>
                          {renderMessageContent(message.text)}
                        </div>
                      ))
                    )}
                    {isLoading ? <div className="outsiders-ai-msg assistant">Finding the best spots for you...</div> : null}
                  </div>
                </div>
                <div className="outsiders-ai-footer">
                  {error ? <p style={{ margin: 0, color: "#ff3b30", fontWeight: 900, fontSize: 12 }}>{error}</p> : null}
                  <div className="outsiders-ai-footer-row">
                    <div className="outsiders-ai-compose">
                      <textarea
                        className="outsiders-ai-textarea"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder={`e.g. "Find a dinner spot in Brooklyn for 6" or "Plan our Saturday evening..."`}
                      />
                      <span className="outsiders-ai-note">Mention your city or neighborhood for the best place suggestions.</span>
                    </div>
                    <button type="button" className="outsiders-ai-btn" onClick={() => submitPrompt(draft)} disabled={!canSend}>
                      {isLoading ? "Thinking..." : "Send"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "availability" && (
              <div className="ai-avail-body">
                <div>
                  <p style={{ fontFamily: "'Bangers', cursive", fontSize: 18, letterSpacing: "0.05em", margin: "0 0 4px", color: "#1a1a2e" }}>
                    When is everyone free?
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#888", margin: "0 0 12px" }}>
                    Tap the grid to mark available slots — green = free. AI will find the best overlap.
                  </p>
                </div>

                {crewAvail.map((person, personIdx) => (
                  <div key={personIdx} className="ai-avail-person">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <strong style={{ fontFamily: "'Bangers', cursive", fontSize: 16, letterSpacing: "0.04em" }}>
                        {personIdx === 0 ? "You" : person.name}
                      </strong>
                      {personIdx > 0 && (
                        <button type="button" onClick={() => removeCrewMember(personIdx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ff6b6b", fontWeight: 900, fontSize: 17, lineHeight: 1 }}>✕</button>
                      )}
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table style={{ borderCollapse: "separate", borderSpacing: "3px", minWidth: "100%" }}>
                        <thead>
                          <tr>
                            <td style={{ width: 72 }} />
                            {DAYS.map(d => (
                              <th key={d} style={{ fontFamily: "'Bangers', cursive", fontSize: 12, letterSpacing: "0.04em", color: "#888", fontWeight: 900, textAlign: "center", paddingBottom: 4 }}>{d}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {AVAIL_TIMES.map(time => (
                            <tr key={time}>
                              <td style={{ fontSize: 11, fontWeight: 800, color: "#9b59b6", paddingRight: 6, whiteSpace: "nowrap", verticalAlign: "middle" }}>{time}</td>
                              {DAYS.map(day => {
                                const key = `${day}-${time}`;
                                const on = !!person.slots[key];
                                return (
                                  <td key={day} style={{ textAlign: "center" }}>
                                    <button type="button" className={`ai-avail-cell ${on ? "on" : ""}`} onClick={() => toggleSlot(personIdx, day, time)} title={`${day} ${time}`} />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    className="outsiders-ai-input"
                    placeholder="Add a crew member's name"
                    value={newCrewName}
                    onChange={e => setNewCrewName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCrewMember()}
                    style={{ flex: 1, minHeight: "auto", padding: "9px 12px", fontSize: 13 }}
                  />
                  <button type="button" onClick={addCrewMember} style={{ background: "#9b59b6", color: "#fff", border: "3px solid #1a1a2e", borderRadius: 10, padding: "9px 14px", fontFamily: "'Bangers', cursive", fontSize: 15, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a2e", whiteSpace: "nowrap" }}>
                    + Add
                  </button>
                </div>

                <button type="button" className="ai-find-time-btn" onClick={handleFindBestCrewTime} disabled={availAiLoading}>
                  {availAiLoading ? "Analyzing availability..." : "Find Best Time for Everyone 🗓"}
                </button>

                {availAiResult && (
                  <div className={availAiResult.error ? "" : "ai-time-result"} style={availAiResult.error ? { color: "#ff6b6b", fontWeight: 900, fontSize: 13 } : {}}>
                    {availAiResult.error ? availAiResult.error : renderMessageContent(availAiResult.text)}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        <button type="button" className="outsiders-ai-fab" onClick={() => setIsOpen((current) => !current)}>
          <span style={{ fontSize: 22 }}>AI</span>
          <span style={{ fontSize: 11 }}>Everywhere</span>
        </button>
      </div>
    </>
  );
}
