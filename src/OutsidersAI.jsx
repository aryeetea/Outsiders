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
    "Summarize what this screen is for and what I should do next.",
    "Give me three ways AI could improve this part of the product.",
    "Write friendlier microcopy for the main call to action on this page.",
  ],
  dashboard: [
    "What should the dashboard AI prioritize for users first?",
    "Suggest a smart daily digest for hangouts, votes, and reminders.",
    "Write a personalized welcome message for an active user.",
  ],
  "create-hangout": [
    "Turn my hangout idea into a polished invite.",
    "Suggest a better event description and schedule.",
    "What details should we auto-fill to reduce friction here?",
  ],
  voting: [
    "Draft fair voting copy that feels fun, not pushy.",
    "Suggest AI features for ranking and tie-breaking options.",
    "Write a short summary of the leading options.",
  ],
  "friend-groups": [
    "Suggest a vibe-based description for a new friend group.",
    "How can AI help organize group energy and preferences?",
    "Draft a better onboarding flow for new groups.",
  ],
  "trip-planning": [
    "Build a weekend itinerary from the current trip context.",
    "Suggest a packing list based on this trip vibe.",
    "What AI planning features would make this page feel magical?",
  ],
  "bill-split": [
    "Explain the current split in plain English.",
    "Write friendlier copy for settling up without awkwardness.",
    "Suggest AI features for spotting unfair or missing expenses.",
  ],
  debrief: [
    "Draft a calm message to help resolve tension between friends.",
    "Suggest AI prompts for each debrief step.",
    "How can AI keep this process supportive and non-judgmental?",
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

  const summary = {
    currentScreen: SCREEN_LABELS[screen] || screen,
    totalGroups: groups.length,
    totalHangouts: hangouts.length,
    groupNames: groups.slice(0, 5).map((group) => group.name || group.title || "Untitled group"),
    hangoutNames: hangouts.slice(0, 5).map((hangout) => hangout.title || hangout.name || "Untitled hangout"),
    rawAppData: appData,
  };

  return safeStringify(summary);
}

function getQuickActions(screen) {
  return QUICK_ACTIONS[screen] || QUICK_ACTIONS.default;
}

function getSystemInstructions(screen) {
  const screenLabel = SCREEN_LABELS[screen] || "this screen";
  return [
    "You are Outsiders AI, a warm and helpful chatbot inside a social planning app.",
    "Answer in a friendly, straight-to-the-point way.",
    "Keep answers practical, supportive, concise, and easy to skim.",
    "Lead with the answer, then give short useful details only if needed.",
    "Avoid sounding robotic, overly formal, or long-winded.",
    "Prefer actionable suggestions, clear UX copy, and realistic product ideas grounded in the current screen context.",
    `The user is currently on the ${screenLabel} screen.`,
    "If you suggest new features, make them feel realistic for a React app used by friend groups planning hangouts, trips, voting, split bills, and debriefs.",
  ].join(" ");
}

function getInitialApiKey() {
  return localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_OPENAI_API_KEY || "";
}

function getGreeting(screen) {
  const activeScreenLabel = SCREEN_LABELS[screen] || "this screen";
  return `Hello, how can I help you today? I can help with ${activeScreenLabel.toLowerCase()} planning, better copy, smarter flows, and feature ideas.`;
}

export default function OutsidersAI({ screen, appData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previousResponseId, setPreviousResponseId] = useState("");
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
                  <h3 style={{ margin: "10px 0 6px", fontFamily: "'Bangers', cursive", fontSize: 28, letterSpacing: "0.04em", color: "#1a1a2e" }}>
                    Outsiders AI
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, fontWeight: 800, color: "#5d5967" }}>
                    Chat with Outsiders AI for help on anything happening in the app.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{ background: "#fff", border: "3px solid #1a1a2e", borderRadius: 12, width: 42, height: 42, fontSize: 18, fontWeight: 900, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a2e" }}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="outsiders-ai-body">
              <div className="outsiders-ai-toolbar">
                <strong style={{ fontFamily: "'Bangers', cursive", fontSize: 18, letterSpacing: "0.05em" }}>Chat</strong>
                <div className="outsiders-ai-toolbar-meta">
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#4ecdc4" }}>{DEFAULT_OPENAI_MODEL}</span>
                  <button
                    type="button"
                    onClick={clearConversation}
                    className="outsiders-ai-reset"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="outsiders-ai-conversation">
                {messages.length === 0 ? (
                  <div className="outsiders-ai-msg assistant">
                    {getGreeting(screen)}
                    <div className="outsiders-ai-options">
                      {quickActions.map((action) => (
                        <button
                          key={action}
                          type="button"
                          className="outsiders-ai-chip"
                          onClick={() => submitPrompt(action)}
                          disabled={isLoading}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`outsiders-ai-msg ${message.role}`}>
                      {message.text}
                    </div>
                  ))
                )}
                {isLoading ? <div className="outsiders-ai-msg assistant">Thinking through the best next step...</div> : null}
              </div>
            </div>

            <div className="outsiders-ai-footer">
              {error ? (
                <p style={{ margin: 0, color: "#ff3b30", fontWeight: 900, fontSize: 12 }}>
                  {error}
                </p>
              ) : null}

              <div className="outsiders-ai-footer-row">
                <div className="outsiders-ai-compose">
                  <textarea
                    className="outsiders-ai-textarea"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={`Ask Outsiders AI anything about ${activeScreenLabel.toLowerCase()}...`}
                  />
                  <span className="outsiders-ai-note">
                    The assistant gets the current screen and shared app context automatically.
                  </span>
                </div>
                <button
                  type="button"
                  className="outsiders-ai-btn"
                  onClick={() => submitPrompt(draft)}
                  disabled={!canSend}
                >
                  {isLoading ? "Thinking..." : "Send"}
                </button>
              </div>
            </div>
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
