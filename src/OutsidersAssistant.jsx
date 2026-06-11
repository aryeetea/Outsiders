import { useEffect, useMemo, useState } from "react";
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 4H4v5M15 4h5v5M20 15v5h-5M4 15v5h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 9H4V4M15 9h5V4M20 15h-5v5M4 15h5v5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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

export default function OutsidersAssistant({ route, appData }) {
  const stored = useMemo(() => readStoredAssistantState(), []);
  const currentName = getDisplayName(appData?.profile || {});
  const createGreeting = () => ({
    role: "assistant",
    content: `Hey ${currentName}. I'm Dash. I can help you plan hangouts, think through crew decisions, draft messages, and figure out the next best move in Outsiders.`,
  });
  const [isOpen, setIsOpen] = useState(stored.isOpen);
  const [previousResponseId, setPreviousResponseId] = useState(stored.previousResponseId);
  const [messages, setMessages] = useState(stored.isOpen && !stored.messages.length ? [createGreeting()] : stored.messages);
  const [panelSize, setPanelSize] = useState(stored.size || "normal");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const context = useMemo(() => buildContext(route, appData), [appData, route]);

  useEffect(() => {
    persistAssistantState({ isOpen, previousResponseId, messages, size: panelSize });
  }, [isOpen, previousResponseId, messages, panelSize]);

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
        setMessages((currentMessages) => (
          currentMessages.length ? currentMessages : [createGreeting()]
        ));
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
          background: #d98b7f;
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
          height: min(70vh, 620px);
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
          height: min(82vh, 860px);
        }
        .oa-header {
          display: flex;
          justify-content: flex-end;
          padding: 12px;
          border-bottom: 3px solid #17151f;
          background: #fff8ea;
        }
        .oa-icon-btn {
          width: 42px;
          height: 42px;
          border: 3px solid #17151f;
          border-radius: 12px;
          background: #fff;
          color: #17151f;
          box-shadow: 4px 4px 0 #17151f;
          display: grid;
          place-items: center;
          cursor: pointer;
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
          gap: 10px;
        }
        .oa-input-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
          align-items: end;
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
          resize: none;
          box-shadow: 3px 3px 0 #17151f;
          outline: none;
        }
        .oa-input:focus {
          border-color: #d98b7f;
          box-shadow: 4px 4px 0 #d98b7f;
        }
        .oa-send {
          border: 3px solid #17151f;
          border-radius: 14px;
          padding: 12px 16px;
          cursor: pointer;
          font: 400 14px 'Bangers', cursive;
          letter-spacing: 0.05em;
          box-shadow: 4px 4px 0 #17151f;
          background: #d98b7f;
          color: #fff;
          min-height: 52px;
        }
        .oa-send:hover,
        .oa-icon-btn:hover {
          transform: translate(-1px, -2px);
        }
        @media (max-width: 720px) {
          .oa-wrap {
            right: 12px;
            left: 12px;
            bottom: 12px;
            justify-items: stretch;
          }
          .oa-panel,
          .oa-panel.large {
            width: 100%;
            height: min(78vh, 860px);
          }
          .oa-launcher {
            justify-self: end;
          }
          .oa-input-row {
            grid-template-columns: 1fr;
          }
          .oa-send {
            width: 100%;
          }
        }
      `}</style>

      <div className="oa-wrap">
        {isOpen ? (
          <section className={`oa-panel ${panelSize === "large" ? "large" : ""}`} aria-label="Dash assistant">
            <div className="oa-header">
              <button
                type="button"
                className="oa-icon-btn"
                onClick={() => setPanelSize((current) => (current === "large" ? "normal" : "large"))}
                aria-label={panelSize === "large" ? "Minimize Dash" : "Maximize Dash"}
              >
                {panelSize === "large" ? <MinimizeIcon /> : <MaximizeIcon />}
              </button>
            </div>

            <div className="oa-messages">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`oa-bubble ${message.role}`}>
                  {message.content}
                </div>
              ))}
              {isLoading ? <div className="oa-bubble assistant">Thinking...</div> : null}
              {error ? <div className="oa-bubble assistant" style={{ background: "#fff0f0", color: "#991b1b" }}>{error}</div> : null}
            </div>

            <div className="oa-composer">
              <div className="oa-input-row">
                <textarea
                  className="oa-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Message Dash..."
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage(input);
                    }
                  }}
                />
                <button type="button" className="oa-send" onClick={() => sendMessage(input)} disabled={isLoading}>
                  Send
                </button>
              </div>
            </div>
          </section>
        ) : null}

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
