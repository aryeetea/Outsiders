import { useEffect, useMemo, useRef, useState } from "react";
import { getAllHangoutProposals, getDisplayName } from "./appState";

const STORAGE_KEY = "outsiders-bonafide-assistant";

const SCREEN_LABELS = {
  landing: "Landing",
  login: "Login",
  signup: "Sign Up",
  dashboard: "Dashboard",
  "create-hangout": "Create Hangout",
  voting: "Voting",
  "friend-groups": "Friend Groups",
  "trip-planning": "Trip Planning",
  "bill-split": "Bill Split",
  "rate-outing": "Rate Outing",
  debrief: "Debrief Court",
  profile: "Profile",
};

const SCREEN_CHIPS = {
  dashboard: [
    "What should my crew do this weekend?",
    "Help me plan a trip",
    "Write a hangout invite message",
  ],
  "create-hangout": [
    "Pick a vibe for this hangout",
    "Suggest some locations for us",
    "Write an invite message",
  ],
  "trip-planning": [
    "Help me plan a day-by-day itinerary",
    "What should we pack?",
    "Find things to do at our destination",
  ],
  voting: [
    "Help me decide between the options",
    "What would you pick and why?",
  ],
  hangouts: [
    "Write a recap of a recent hangout",
    "Help me plan something new",
    "Suggest a theme for next time",
  ],
  "friend-groups": [
    "Plan something for this crew",
    "Help me write a crew description",
    "What's a good first hangout idea?",
  ],
  debrief: [
    "Help me write a debrief note",
    "What went well and what to improve?",
  ],
  "bill-split": [
    "How should we split this fairly?",
    "Help me write a payment reminder",
  ],
};

const DEFAULT_CHIPS = [
  "Help me plan a hangout",
  "Trip ideas for my crew",
  "What should we do this weekend?",
];

function getChipsForScreen(screen) {
  return SCREEN_CHIPS[screen] || DEFAULT_CHIPS;
}

function readStoredAssistantState() {
  if (typeof window === "undefined") {
    return { isOpen: false, previousResponseId: null, messages: [], size: "normal" };
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      isOpen: Boolean(parsed.isOpen),
      previousResponseId: typeof parsed.previousResponseId === "string" ? parsed.previousResponseId : null,
      messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-20) : [],
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
    })),
    proposals: proposals.slice(0, 6).map(summarizeProposal),
    trips,
    favoritePlaces: buildFavoritePlaces(appData),
    notifications,
  };
}

function isClearCommand(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return (
    normalized === "clear"
    || normalized === "clear chat"
    || normalized === "clear the chat"
    || normalized === "clear conversation"
    || normalized === "new chat"
    || normalized === "reset chat"
  );
}

// Render **bold** and newlines in assistant messages
function renderMessageContent(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

function TypingDots() {
  return (
    <span className="oa-typing-dots" aria-label="Dash is thinking">
      <span />
      <span />
      <span />
    </span>
  );
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

function MaximizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 4H4v5M15 4h5v5M20 15v5h-5M4 15v5h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 9H4V4M15 9h5V4M20 15h-5v5M4 15h5v5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OutsidersAssistant({ route, appData }) {
  const stored = useMemo(() => readStoredAssistantState(), []);
  const currentName = getDisplayName(appData?.profile || {});

  const createGreeting = () => ({
    role: "assistant",
    content: `Hey ${currentName || "there"}! I'm Dash, your Outsiders crew planner. Ask me anything about hangouts, trips, or what your crew should do next.`,
  });

  const [isOpen, setIsOpen] = useState(stored.isOpen);
  const [previousResponseId, setPreviousResponseId] = useState(stored.previousResponseId);
  const [messages, setMessages] = useState(
    stored.isOpen && !stored.messages.length ? [createGreeting()] : stored.messages
  );
  const [panelSize, setPanelSize] = useState(stored.size || "normal");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const context = useMemo(() => buildContext(route, appData), [appData, route]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    persistAssistantState({ isOpen, previousResponseId, messages, size: panelSize });
  }, [isOpen, previousResponseId, messages, panelSize]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const resetConversation = () => {
    setPreviousResponseId(null);
    setMessages([createGreeting()]);
    setInput("");
    setError("");
  };

  const toggleAssistant = () => {
    setIsOpen((current) => {
      const nextIsOpen = !current;
      if (nextIsOpen) {
        setMessages((currentMessages) =>
          currentMessages.length ? currentMessages : [createGreeting()]
        );
      }
      return nextIsOpen;
    });
  };

  const sendMessage = async (rawPrompt) => {
    const prompt = rawPrompt.trim();
    if (!prompt || isLoading) return;
    if (isClearCommand(prompt)) {
      resetConversation();
      return;
    }
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
        throw new Error(payload?.error || "The assistant could not answer right now.");
      }
      setPreviousResponseId(payload.responseId || null);
      setMessages((current) => [...current, { role: "assistant", content: payload.text }]);
    } catch (err) {
      setError(err.message || "The assistant could not answer right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const chips = getChipsForScreen(route?.screen);
  const showChips = messages.length <= 1 && !isLoading;

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
          width: 60px;
          height: 60px;
          border-radius: 18px;
          border: 4px solid #17151f;
          background: #ff6b6b;
          box-shadow: 5px 5px 0 #17151f;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: transform 140ms ease, box-shadow 140ms ease;
        }
        .oa-launcher:hover {
          transform: translate(-1px, -2px);
          box-shadow: 7px 7px 0 #17151f;
        }
        .oa-panel {
          width: min(370px, calc(100vw - 24px));
          height: min(72vh, 640px);
          border: 4px solid #17151f;
          border-radius: 24px;
          background: #fffdf7;
          box-shadow: 8px 8px 0 #17151f;
          overflow: hidden;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto;
          animation: oaPanelIn 200ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .oa-panel.large {
          width: min(560px, calc(100vw - 24px));
          height: min(84vh, 880px);
        }
        @keyframes oaPanelIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        /* ── Header ── */
        .oa-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-bottom: 3px solid #17151f;
          background: #fff8ea;
        }
        .oa-header-identity {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }
        .oa-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 3px solid #17151f;
          background: #ff6b6b;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .oa-header-text {
          min-width: 0;
        }
        .oa-header-name {
          font-family: 'Bangers', cursive;
          font-size: 18px;
          letter-spacing: 0.05em;
          color: #17151f;
          line-height: 1;
        }
        .oa-header-status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #666;
          margin-top: 2px;
        }
        .oa-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          flex-shrink: 0;
        }
        .oa-header-actions {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-shrink: 0;
        }
        .oa-icon-btn {
          width: 34px;
          height: 34px;
          border: 2.5px solid #17151f;
          border-radius: 10px;
          background: #fff;
          color: #17151f;
          box-shadow: 3px 3px 0 #17151f;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: transform 120ms ease;
          flex-shrink: 0;
        }
        .oa-icon-btn:hover {
          transform: translate(-1px, -1px);
        }

        /* ── Messages ── */
        .oa-messages {
          padding: 14px 16px 8px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #fffdf7;
          scroll-behavior: smooth;
        }
        .oa-bubble {
          border: 3px solid #17151f;
          border-radius: 18px;
          padding: 12px 14px;
          box-shadow: 3px 3px 0 #17151f;
          line-height: 1.6;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          word-break: break-word;
        }
        .oa-bubble.user {
          background: #ffe7a8;
          align-self: flex-end;
          max-width: 86%;
          border-bottom-right-radius: 6px;
        }
        .oa-bubble.assistant {
          background: #eefcff;
          align-self: flex-start;
          max-width: 92%;
          border-bottom-left-radius: 6px;
        }
        .oa-bubble.error-bubble {
          background: #fff0f0;
          color: #991b1b;
          align-self: flex-start;
          max-width: 92%;
        }

        /* ── Typing dots ── */
        .oa-typing-dots {
          display: inline-flex;
          gap: 4px;
          align-items: center;
          padding: 2px 0;
        }
        .oa-typing-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #17151f;
          animation: oaDotBounce 1.1s ease-in-out infinite;
        }
        .oa-typing-dots span:nth-child(2) { animation-delay: 0.18s; }
        .oa-typing-dots span:nth-child(3) { animation-delay: 0.36s; }
        @keyframes oaDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }

        /* ── Suggestion chips ── */
        .oa-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          padding: 0 16px 4px;
        }
        .oa-chip {
          border: 2.5px solid #17151f;
          border-radius: 20px;
          padding: 7px 13px;
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 800;
          color: #17151f;
          background: #fff8ea;
          box-shadow: 2px 2px 0 #17151f;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease;
          text-align: left;
          line-height: 1.3;
        }
        .oa-chip:hover {
          background: #ffe7a8;
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0 #17151f;
        }

        /* ── Composer ── */
        .oa-composer {
          padding: 10px 14px 14px;
          border-top: 3px solid #17151f;
          background: #fff8ea;
          display: grid;
          gap: 8px;
        }
        .oa-input-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
          align-items: end;
        }
        .oa-input {
          width: 100%;
          min-height: 60px;
          max-height: 140px;
          border: 3px solid #17151f;
          border-radius: 14px;
          padding: 10px 12px;
          font: 700 14px 'Nunito', sans-serif;
          color: #17151f;
          background: #fff;
          resize: none;
          box-shadow: 3px 3px 0 #17151f;
          outline: none;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .oa-input:focus {
          border-color: #ff6b6b;
          box-shadow: 3px 3px 0 #ff6b6b;
        }
        .oa-input::placeholder { color: #aaa; }
        .oa-send {
          border: 3px solid #17151f;
          border-radius: 12px;
          padding: 10px 16px;
          cursor: pointer;
          font: 400 15px 'Bangers', cursive;
          letter-spacing: 0.06em;
          box-shadow: 3px 3px 0 #17151f;
          background: #ff6b6b;
          color: #fff;
          min-height: 48px;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }
        .oa-send:hover:not(:disabled) {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0 #17151f;
        }
        .oa-send:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media (max-width: 720px) {
          .oa-wrap {
            right: 10px;
            left: 10px;
            bottom: 10px;
            justify-items: stretch;
          }
          .oa-panel,
          .oa-panel.large {
            width: 100%;
            height: min(80vh, 880px);
          }
          .oa-launcher { justify-self: end; }
          .oa-input-row { grid-template-columns: 1fr; }
          .oa-send { width: 100%; }
        }
      `}</style>

      <div className="oa-wrap">
        {isOpen && (
          <section className={`oa-panel${panelSize === "large" ? " large" : ""}`} aria-label="Dash assistant">

            {/* Header */}
            <div className="oa-header">
              <div className="oa-header-identity">
                <div className="oa-avatar">
                  <LauncherIcon />
                </div>
                <div className="oa-header-text">
                  <div className="oa-header-name">Dash</div>
                  <div className="oa-header-status">
                    <span className="oa-status-dot" />
                    crew planner
                  </div>
                </div>
              </div>
              <div className="oa-header-actions">
                <button
                  type="button"
                  className="oa-icon-btn"
                  onClick={resetConversation}
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <TrashIcon />
                </button>
                <button
                  type="button"
                  className="oa-icon-btn"
                  onClick={() => setPanelSize((s) => (s === "large" ? "normal" : "large"))}
                  aria-label={panelSize === "large" ? "Shrink panel" : "Expand panel"}
                >
                  {panelSize === "large" ? <MinimizeIcon /> : <MaximizeIcon />}
                </button>
                <button
                  type="button"
                  className="oa-icon-btn"
                  onClick={toggleAssistant}
                  aria-label="Close Dash"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="oa-messages">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`oa-bubble ${message.role}`}>
                  {message.role === "assistant"
                    ? renderMessageContent(message.content)
                    : message.content}
                </div>
              ))}
              {isLoading && (
                <div className="oa-bubble assistant">
                  <TypingDots />
                </div>
              )}
              {error && (
                <div className="oa-bubble error-bubble">{error}</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion chips */}
            {showChips && (
              <div className="oa-chips">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="oa-chip"
                    onClick={() => sendMessage(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <div className="oa-composer">
              <div className="oa-input-row">
                <textarea
                  className="oa-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Dash anything..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage(input);
                    }
                  }}
                />
                <button
                  type="button"
                  className="oa-send"
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        )}

        <button
          type="button"
          className="oa-launcher"
          onClick={toggleAssistant}
          aria-label={isOpen ? "Close Dash" : "Open Dash"}
        >
          <LauncherIcon />
        </button>
      </div>
    </>
  );
}
