import { useEffect, useMemo, useState } from "react";
import { getDisplayName } from "./appState";

const STORAGE_KEY = "outsiders-bonafide-assistant";
const PUBLIC_SCREENS = new Set(["landing", "login", "signup"]);

const SCREEN_LABELS = {
  landing: "Landing",
  login: "Login",
  signup: "Sign Up",
  dashboard: "Dashboard",
  "create-hangout": "Create Hangout",
  "join-hangout": "Join Hangout",
  voting: "Voting",
  "friend-groups": "Friend Groups",
  "trip-planning": "Trip Planning",
  "bill-split": "Bill Split",
  "rate-outing": "Rate Outing",
  debrief: "Debrief Court",
  profile: "Profile",
};

const QUICK_ACTIONS = {
  default: [
    "Recommend places I would probably like based on my app history.",
    "What should I work on next in this app?",
    "Give me a short plan using the data on this page.",
  ],
  dashboard: [
    "What should my crew focus on next?",
    "Summarize my hangouts, trips, and notifications.",
    "Recommend a few places my crew would probably love.",
  ],
  "friend-groups": [
    "Recommend places for this crew based on what we seem to like.",
    "Help me write a message to rally the crew.",
    "Which hangouts need attention first?",
    "Draft a fun invite or follow-up note for this crew.",
  ],
  "create-hangout": [
    "Recommend real places for this hangout based on the vibe I want.",
    "Brainstorm 5 hangout ideas that fit this crew.",
    "Write a better hangout description for me.",
  ],
  "trip-planning": [
    "Help me plan a trip itinerary from this page.",
    "Suggest real places to eat, stay, or explore for this trip.",
    "Turn this trip into a day-by-day plan.",
  ],
  debrief: [
    "Help me say this more calmly and clearly.",
    "Draft an apology that sounds sincere.",
    "Write a peace-maker message for this situation.",
  ],
  "bill-split": [
    "Write a clean money reminder for the group.",
    "Help explain the split without sounding awkward.",
    "Draft a polite payment follow-up text.",
  ],
  "rate-outing": [
    "Help me write a fun review of the outing.",
    "Summarize the vibe of this hangout.",
    "Turn my thoughts into a punchy recap.",
  ],
  profile: [
    "Rewrite my bio so it sounds fun and social.",
    "Help me introduce myself to a new crew.",
    "Suggest a better profile description.",
  ],
};

function readStoredAssistantState() {
  if (typeof window === "undefined") {
    return { isOpen: false, previousResponseId: null, messages: [] };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      isOpen: Boolean(parsed.isOpen),
      previousResponseId: typeof parsed.previousResponseId === "string" ? parsed.previousResponseId : null,
      messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-14) : [],
    };
  } catch {
    return { isOpen: false, previousResponseId: null, messages: [] };
  }
}

function persistAssistantState(nextState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

function summarizeProposal(proposal = {}) {
  return {
    name: proposal.name || "Untitled",
    groupName: proposal.groupName || "",
    status: proposal.status || "proposed",
    timeOptions: (proposal.timeOptions || []).slice(0, 3).map((item) => item.label),
    locationOptions: (proposal.locationOptions || []).slice(0, 3).map((item) => item.label),
    externalInvites: proposal.externalInvites?.length || 0,
  };
}

function average(values = []) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function buildFavoritePlaces(appData = {}) {
  const hangouts = Array.isArray(appData.hangouts) ? appData.hangouts : [];
  const trips = Array.isArray(appData.trips) ? appData.trips : [];

  const placeCandidates = [
    ...hangouts
      .filter((item) => item?.location)
      .map((item) => ({
        name: item.name || "Hangout",
        place: item.location,
        type: "hangout",
        overall: average((item.ratings || []).map((rating) => Number(rating.overall) || 0)),
        locationScore: average((item.ratings || []).map((rating) => Number(rating.categories?.location) || 0).filter(Boolean)),
        ratingsCount: (item.ratings || []).length,
      })),
    ...trips
      .filter((item) => item?.destination)
      .map((item) => ({
        name: item.name || "Trip",
        place: item.destination,
        type: "trip",
        overall: average((item.ratings || []).map((rating) => Number(rating.overall) || 0)),
        locationScore: average((item.ratings || []).map((rating) => Number(rating.categories?.location || rating.categories?.stay || rating.categories?.activities) || 0).filter(Boolean)),
        ratingsCount: (item.ratings || []).length,
      })),
  ];

  return placeCandidates
    .sort((a, b) => ((b.locationScore || b.overall) - (a.locationScore || a.overall)) || (b.ratingsCount - a.ratingsCount))
    .slice(0, 6);
}

function buildContext(route, appData) {
  const profile = appData?.profile || {};
  const groups = appData?.groups || [];
  const proposals = groups.flatMap((group) => (group.hangoutProposals || []).map((proposal) => ({ ...proposal, groupName: group.name })));
  const notifications = (appData?.notifications || []).slice(-5).map((item) => ({
    message: item.message,
    groupName: item.groupName,
    read: item.read,
  }));
  const trips = (appData?.trips || []).slice(0, 4).map((trip) => ({
    name: trip.name,
    destination: trip.destination,
    members: trip.members?.length || 0,
    budget: trip.budget,
    spent: trip.spent,
  }));
  const favoritePlaces = buildFavoritePlaces(appData);

  return {
    screen: SCREEN_LABELS[route?.screen] || "App",
    routeParams: route?.params || {},
    currentUser: {
      name: getDisplayName(profile),
      username: profile?.username || "",
      location: profile?.location || "",
      bio: profile?.bio || "",
    },
    appSummary: {
      groups: groups.length,
      proposals: proposals.length,
      trips: trips.length,
      unreadNotifications: notifications.filter((item) => !item.read).length,
    },
    groups: groups.slice(0, 5).map((group) => ({
      name: group.name,
      emoji: group.emoji,
      code: group.code,
      members: group.members?.length || 0,
      pendingInvites: group.pending?.length || 0,
      proposals: (group.hangoutProposals || []).slice(0, 3).map(summarizeProposal),
      openDebriefCases: (group.cases || []).filter((item) => item.status !== "Resolved").length,
    })),
    proposals: proposals.slice(0, 6).map(summarizeProposal),
    trips,
    favoritePlaces,
    notifications,
    note: "Outsiders already has a deterministic Hangout Assistant for overlap timing. That assistant still owns availability-based scheduling suggestions. This bona fide assistant should focus on friendly planning help, place ideas, writing, and recommendations grounded in app history.",
  };
}

function LauncherIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" fill="#fff" stroke="#17151F" strokeWidth="1.4" />
      <circle cx="9" cy="12" r="1.2" fill="#17151F" />
      <circle cx="15" cy="12" r="1.2" fill="#17151F" />
      <path d="M9 15C9.8 15.6 10.75 15.9 12 15.9C13.25 15.9 14.2 15.6 15 15" stroke="#17151F" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function OutsidersAssistant({ route, appData }) {
  const stored = useMemo(() => readStoredAssistantState(), []);
  const [isOpen, setIsOpen] = useState(stored.isOpen);
  const [previousResponseId, setPreviousResponseId] = useState(stored.previousResponseId);
  const [messages, setMessages] = useState(stored.messages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const context = useMemo(() => buildContext(route, appData), [appData, route]);
  const quickActions = QUICK_ACTIONS[route?.screen] || QUICK_ACTIONS.default;
  const isPublicScreen = PUBLIC_SCREENS.has(route?.screen);

  useEffect(() => {
    persistAssistantState({ isOpen, previousResponseId, messages });
  }, [isOpen, previousResponseId, messages]);

  const sendMessage = async (rawPrompt) => {
    const prompt = rawPrompt.trim();
    if (!prompt || isLoading) return;

    const nextUserMessage = { role: "user", content: prompt };
    setMessages((current) => [...current, nextUserMessage]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          previousResponseId,
          screen: route?.screen || "landing",
          context,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("The assistant API route was not found. Run this with Vercel functions enabled, or deploy it with OPENAI_API_KEY set.");
        }
        throw new Error(payload?.error || "The assistant could not answer right now.");
      }

      setPreviousResponseId(payload.responseId || null);
      setMessages((current) => [...current, { role: "assistant", content: payload.text, sources: payload.sources || [] }]);
    } catch (err) {
      setError(err.message || "The assistant could not answer right now.");
      setMessages((current) => current.filter((message, index) => !(index === current.length - 1 && message.role === "user" && message.content === prompt)));
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setPreviousResponseId(null);
    setMessages([]);
    setError("");
  };

  return (
    <>
      <style>{`
        .oa-wrap {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 450;
          display: grid;
          gap: 12px;
          justify-items: end;
        }
        .oa-launcher {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          border: 4px solid #17151f;
          background: #ff6b6b;
          box-shadow: 6px 6px 0 #17151f;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }
        .oa-launcher:hover {
          transform: translate(-1px, -2px);
          box-shadow: 8px 8px 0 #17151f;
        }
        .oa-panel {
          width: min(420px, calc(100vw - 24px));
          max-height: min(78vh, 760px);
          border: 4px solid #17151f;
          border-radius: 24px;
          background: #fffdf7;
          box-shadow: 8px 8px 0 #17151f;
          overflow: hidden;
          display: grid;
          grid-template-rows: auto auto minmax(0, 1fr) auto;
        }
        .oa-header {
          background: #fff1c7;
          padding: 16px 18px 14px;
          border-bottom: 3px solid #17151f;
        }
        .oa-kicker {
          display: inline-flex;
          padding: 5px 12px;
          border: 2px solid #17151f;
          border-radius: 10px;
          background: #ffd93d;
          box-shadow: 3px 3px 0 #17151f;
          font: 400 14px 'Bangers', cursive;
          letter-spacing: 0.07em;
          transform: rotate(-2deg);
        }
        .oa-context {
          padding: 12px 18px;
          background: #eef8ff;
          border-bottom: 3px solid #17151f;
          font-size: 13px;
          line-height: 1.45;
          color: #334155;
        }
        .oa-chip-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .oa-chip {
          border: 3px solid #17151f;
          border-radius: 999px;
          background: #fff;
          padding: 8px 12px;
          cursor: pointer;
          box-shadow: 3px 3px 0 #17151f;
          font: 400 13px 'Bangers', cursive;
          letter-spacing: 0.04em;
        }
        .oa-messages {
          padding: 16px 18px;
          overflow-y: auto;
          display: grid;
          gap: 12px;
          background: #fffdf7;
        }
        .oa-bubble {
          border: 3px solid #17151f;
          border-radius: 18px;
          padding: 12px 14px;
          box-shadow: 4px 4px 0 #17151f;
          white-space: pre-wrap;
          line-height: 1.55;
        }
        .oa-sources {
          margin-top: 10px;
          display: grid;
          gap: 6px;
        }
        .oa-source-link {
          color: #155e75;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          overflow-wrap: anywhere;
        }
        .oa-source-link:hover {
          text-decoration: underline;
        }
        .oa-bubble.user {
          background: #ffe7a8;
        }
        .oa-bubble.assistant {
          background: #eefcff;
        }
        .oa-composer {
          padding: 14px 18px 18px;
          border-top: 3px solid #17151f;
          background: #fff8ea;
          display: grid;
          gap: 10px;
        }
        .oa-input {
          width: 100%;
          min-height: 88px;
          border: 3px solid #17151f;
          border-radius: 16px;
          padding: 12px 14px;
          font: 700 14px 'Nunito', sans-serif;
          color: #17151f;
          background: #fff;
          resize: vertical;
          box-shadow: 3px 3px 0 #17151f;
          outline: none;
        }
        .oa-input:focus {
          border-color: #ff6b6b;
          box-shadow: 4px 4px 0 #ff6b6b;
        }
        .oa-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .oa-btn {
          border: 3px solid #17151f;
          border-radius: 12px;
          padding: 10px 14px;
          cursor: pointer;
          font: 400 14px 'Bangers', cursive;
          letter-spacing: 0.05em;
          box-shadow: 4px 4px 0 #17151f;
          background: #fff;
        }
        .oa-btn.primary {
          background: #ff6b6b;
          color: #fff;
        }
        .oa-btn.secondary {
          background: #ffd93d;
          color: #17151f;
        }
        .oa-btn:hover {
          transform: translate(-1px, -2px);
        }
        .oa-note {
          color: #64748b;
          font-size: 12px;
          line-height: 1.45;
        }
        @media (max-width: 720px) {
          .oa-wrap {
            right: 12px;
            left: 12px;
            bottom: 12px;
            justify-items: stretch;
          }
          .oa-panel {
            width: 100%;
          }
          .oa-launcher {
            justify-self: end;
          }
        }
      `}</style>

      <div className="oa-wrap">
        {isOpen ? (
          <section className="oa-panel" aria-label="Outsiders AI assistant">
            <div className="oa-header">
              <div className="oa-kicker">Bona Fide Assistant</div>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                <div>
                  <div className="bangers" style={{ fontSize: 28, color: "#17151f" }}>Outsiders AI</div>
                  <div style={{ fontSize: 13, color: "#667085", fontWeight: 800 }}>
                    {SCREEN_LABELS[route?.screen] || "App"} helper for place ideas, writing, planning, and calm messaging
                  </div>
                </div>
                <button type="button" className="oa-btn" onClick={() => setIsOpen(false)}>Close</button>
              </div>
            </div>

            <div className="oa-context">
              <strong>{context.currentUser.name}</strong>
              {isPublicScreen ? " is browsing the app." : ` has ${context.appSummary.groups} crew${context.appSummary.groups === 1 ? "" : "s"}, ${context.appSummary.proposals} hangout${context.appSummary.proposals === 1 ? "" : "s"}, and ${context.appSummary.trips} trip${context.appSummary.trips === 1 ? "" : "s"}.`}
              <div className="oa-chip-row">
                {quickActions.map((item) => (
                  <button key={item} type="button" className="oa-chip" onClick={() => sendMessage(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="oa-messages">
              {!messages.length ? (
                <div className="oa-bubble assistant">
                  I can help across the whole app: recommend places based on your vibe and app history, brainstorm hangouts, rewrite hangout plans, draft debrief responses, summarize trips, and turn what is on this screen into clear next steps.
                  {"\n\n"}
                  The existing Hangout Assistant still handles availability overlap and time recommendations.
                </div>
              ) : messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`oa-bubble ${message.role}`}>
                  {message.content}
                  {message.role === "assistant" && Array.isArray(message.sources) && message.sources.length ? (
                    <div className="oa-sources">
                      {message.sources.map((source) => (
                        <a key={source.url} className="oa-source-link" href={source.url} target="_blank" rel="noreferrer">
                          Source: {source.title || source.url}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {isLoading ? <div className="oa-bubble assistant">Thinking through your crew context...</div> : null}
              {error ? <div className="oa-bubble assistant" style={{ background: "#fff0f0", color: "#991b1b" }}>{error}</div> : null}
            </div>

            <div className="oa-composer">
              <textarea
                className="oa-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask for place recommendations, hangout ideas, hangout help, trip plans, reviews, or a message draft..."
              />
              <div className="oa-actions">
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" className="oa-btn primary" onClick={() => sendMessage(input)} disabled={isLoading}>
                    Ask AI
                  </button>
                  <button type="button" className="oa-btn secondary" onClick={resetConversation} disabled={isLoading}>
                    New Chat
                  </button>
                </div>
                <div className="oa-note">
                  Uses live app context and can draw on web-backed place research. It will not replace the timing assistant that already powers schedule overlap suggestions.
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <button
          type="button"
          className="oa-launcher"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? "Close Outsiders AI" : "Open Outsiders AI"}
        >
          <LauncherIcon />
        </button>
      </div>
    </>
  );
}
