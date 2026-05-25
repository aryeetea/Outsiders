import { useEffect, useMemo, useState } from "react";
import { getAllHangoutProposals, getDisplayName } from "./appState";

const STORAGE_KEY = "outsiders-bonafide-assistant";

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
    return { isOpen: false, previousResponseId: null, messages: [], size: "normal" };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      isOpen: Boolean(parsed.isOpen),
      previousResponseId: typeof parsed.previousResponseId === "string" ? parsed.previousResponseId : null,
      messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-14) : [],
      size: parsed.size === "large" ? "large" : "normal",
    };
  } catch {
    return { isOpen: false, previousResponseId: null, messages: [], size: "normal" };
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
  const proposals = getAllHangoutProposals(groups, appData?.hangouts || []);
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

function buildLocalFallbackReply(prompt, context, route) {
  const lower = String(prompt || "").toLowerCase();
  const name = context?.currentUser?.name || "You";
  const groups = context?.groups || [];
  const proposals = context?.proposals || [];
  const trips = context?.trips || [];
  const notifications = context?.notifications || [];

  if (lower.includes("next") || lower.includes("what should i work on")) {
    const steps = [];
    if ((notifications || []).some((item) => !item.read)) {
      steps.push("Check your unread notifications first.");
    }
    if ((proposals || []).some((proposal) => proposal.status !== "finalized")) {
      steps.push("Review the hangouts that are still waiting on votes or updates.");
    }
    if ((trips || []).length) {
      steps.push("Open your trip planner and tighten the shared itinerary or checklist.");
    }
    if (!steps.length) {
      steps.push("You look caught up. Start a new hangout or trip when you are ready.");
    }
    return `${name}, here is the cleanest next-step plan:\n\n- ${steps.join("\n- ")}`;
  }

  if (lower.includes("summarize")) {
    return `${name}, here is your quick app snapshot:\n\n- Crews: ${groups.length}\n- Active hangouts: ${proposals.length}\n- Trips: ${trips.length}\n- Recent notifications: ${notifications.length}\n\nOpen the page you want and I can help turn that into a message, outline, or checklist.`;
  }

  if (lower.includes("message") || lower.includes("write") || lower.includes("draft")) {
    return `Try this:\n\n"Hey crew, I tightened the plan on this page. Take a quick look when you can and drop your vote or update so we can lock things in."`;
  }

  if (route === "trip-planning") {
    return `I can still help from this page even without the live AI route.\n\n- tighten the day-by-day itinerary\n- suggest a cleaner trip message\n- turn the current plan into a short checklist\n\nTry asking: "Turn this trip into a simple next-step checklist."`;
  }

  if (route === "create-hangout" || route === "hangouts" || route === "friend-groups") {
    return `I can still help from your hangout context.\n\nTry asking for one of these:\n- "Write a better hangout description."\n- "Give me a short rally message for the crew."\n- "What should we finalize next?"`;
  }

  return `I’m still available in lightweight mode right now.\n\nI can help you:\n- decide the next step\n- draft a message\n- summarize what is on this page\n- turn the current page into a checklist`;
}

export default function OutsidersAssistant({ route, appData }) {
  const stored = useMemo(() => readStoredAssistantState(), []);
  const [isOpen, setIsOpen] = useState(stored.isOpen);
  const [previousResponseId, setPreviousResponseId] = useState(stored.previousResponseId);
  const [messages, setMessages] = useState(stored.messages);
  const [panelSize, setPanelSize] = useState(stored.size || "normal");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const context = useMemo(() => buildContext(route, appData), [appData, route]);
  const quickActions = (QUICK_ACTIONS[route?.screen] || QUICK_ACTIONS.default).slice(0, 2);

  useEffect(() => {
    persistAssistantState({ isOpen, previousResponseId, messages, size: panelSize });
  }, [isOpen, previousResponseId, messages, panelSize]);

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
        if (response.status === 404 || response.status === 500) {
          const fallbackText = buildLocalFallbackReply(prompt, context, route?.screen);
          setPreviousResponseId(null);
          setMessages((current) => [...current, { role: "assistant", content: fallbackText, sources: [] }]);
          return;
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
          gap: 10px;
          justify-items: end;
        }
        .oa-launcher {
          width: 64px;
          height: 64px;
          border-radius: 18px;
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
          width: min(360px, calc(100vw - 24px));
          max-height: min(72vh, 680px);
          border: 4px solid #17151f;
          border-radius: 24px;
          background: #fffdf7;
          box-shadow: 8px 8px 0 #17151f;
          overflow: hidden;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto;
        }
        .oa-panel.large {
          width: min(560px, calc(100vw - 24px));
          max-height: min(82vh, 860px);
        }
        .oa-header {
          background: #fff1c7;
          padding: 14px 16px 12px;
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
        .oa-chip-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .oa-chip {
          border: 3px solid #17151f;
          border-radius: 999px;
          background: #fff;
          padding: 7px 10px;
          cursor: pointer;
          box-shadow: 2px 2px 0 #17151f;
          font: 400 12px 'Bangers', cursive;
          letter-spacing: 0.04em;
        }
        .oa-messages {
          padding: 14px 16px;
          overflow-y: auto;
          display: grid;
          gap: 10px;
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
          padding: 12px 16px 16px;
          border-top: 3px solid #17151f;
          background: #fff8ea;
          display: grid;
          gap: 8px;
        }
        .oa-input {
          width: 100%;
          min-height: 68px;
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
          .oa-panel.large {
            width: 100%;
            max-height: min(84vh, 860px);
          }
          .oa-launcher {
            justify-self: end;
          }
        }
      `}</style>

      <div className="oa-wrap">
        {isOpen ? (
          <section className={`oa-panel ${panelSize === "large" ? "large" : ""}`} aria-label="Outsiders AI assistant">
            <div className="oa-header">
              <div className="oa-kicker">Bona Fide Assistant</div>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                <div>
                  <div className="bangers" style={{ fontSize: 24, color: "#17151f" }}>Outsiders AI</div>
                  <div style={{ fontSize: 12, color: "#667085", fontWeight: 800 }}>
                    {SCREEN_LABELS[route?.screen] || "App"} helper
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button type="button" className="oa-btn" onClick={() => setPanelSize((current) => current === "large" ? "normal" : "large")}>
                    {panelSize === "large" ? "Make smaller" : "Make bigger"}
                  </button>
                  <button type="button" className="oa-btn" onClick={() => setIsOpen(false)}>Close</button>
                </div>
              </div>
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
                  I can help with the page you are on right now: next steps, drafts, summaries, place ideas, and cleaner planning notes.
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
                placeholder="Ask for next steps, a draft, a summary, or ideas..."
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(input);
                  }
                }}
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
                  Uses your live app context. Press Enter to send.
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
