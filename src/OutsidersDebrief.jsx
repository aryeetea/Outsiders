import { useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { background: #f5f3ee; margin: 0; }
  .root { font-family: 'Nunito', sans-serif; background: #f5f3ee; color: #1a1a2e; min-height: 100vh; display: flex; flex-direction: column; }
  .root::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.03; pointer-events: none; z-index: 0; }
  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }
  .top-nav { position: sticky; top: 0; z-index: 50; background: #fffdf9; border-bottom: 4px solid #1a1a2e; box-shadow: 0 4px 0 #1a1a2e; }
  .logo-mark { width: 36px; height: 36px; background: #ff6b6b; border: 3px solid #1a1a2e; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 3px 3px 0 #1a1a2e; }
  .layout { display: flex; flex: 1; position: relative; z-index: 1; }
  .sidebar { width: 220px; flex-shrink: 0; background: #fffdf9; border-right: 4px solid #1a1a2e; padding: 24px 16px; display: flex; flex-direction: column; gap: 6px; position: sticky; top: 68px; height: calc(100vh - 68px); overflow-y: auto; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; cursor: pointer; font-weight: 800; font-size: 14px; color: #666; border: 2.5px solid transparent; transition: all 0.15s; }
  .nav-item:hover { background: #f5f3ee; color: #1a1a2e; border-color: #e0dbd0; }
  .nav-item.active { background: #fff; color: #1a1a2e; border: 2.5px solid #1a1a2e; box-shadow: 3px 3px 0 #1a1a2e; }
  .nav-section-label { font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.1em; color: #bbb; padding: 8px 14px 4px; text-transform: uppercase; }
  .main { flex: 1; padding: 28px 32px; overflow-y: auto; }
  .card { background: #fff; border: 3px solid #1a1a2e; border-radius: 16px; box-shadow: 5px 5px 0 #1a1a2e; padding: 22px 24px; }
  .btn-primary { background: #ff6b6b; color: #fff; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 16px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 8px; }
  .btn-primary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .btn-secondary { background: #ffd93d; color: #1a1a2e; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 15px; padding: 9px 18px; display: inline-flex; align-items: center; gap: 8px; }
  .btn-secondary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .btn-outline { background: #fff; color: #1a1a2e; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 3px 3px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 14px; padding: 8px 16px; display: inline-flex; align-items: center; gap: 6px; }
  .btn-outline:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 #1a1a2e; }
  .form-input { width: 100%; padding: 12px 14px; font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 700; color: #1a1a2e; background: #fffdf9; border: 3px solid #1a1a2e; border-radius: 10px; outline: none; transition: box-shadow 0.15s, border-color 0.15s; box-shadow: 3px 3px 0 #1a1a2e; resize: none; }
  .form-input:focus { border-color: #ff6b9d; box-shadow: 3px 3px 0 #ff6b9d; }
  .form-input::placeholder { color: #bbb; font-weight: 600; }
  .form-label { display: block; font-family: 'Bangers', cursive; font-size: 15px; letter-spacing: 0.05em; color: #1a1a2e; margin-bottom: 6px; }
  .avatar { width: 38px; height: 38px; border-radius: 50%; border: 2.5px solid #1a1a2e; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; color: #fff; flex-shrink: 0; box-shadow: 2px 2px 0 #1a1a2e; }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.05em; border: 2px solid; }
  .step-bubble { width: 36px; height: 36px; border-radius: 50%; border: 3px solid #1a1a2e; display: flex; align-items: center; justify-content: center; font-family: 'Bangers', cursive; font-size: 18px; flex-shrink: 0; box-shadow: 3px 3px 0 #1a1a2e; }
  .message-bubble { border: 3px solid #1a1a2e; border-radius: 16px; padding: 14px 18px; margin-bottom: 12px; position: relative; }
  .message-bubble.them { background: #fff; border-radius: 4px 16px 16px 16px; box-shadow: 4px 4px 0 #1a1a2e; }
  .message-bubble.me { background: #fde8f0; border-color: #ff6b9d; border-radius: 16px 4px 16px 16px; box-shadow: 4px 4px 0 #ff6b9d; }
  .message-bubble.system { background: #fff4e6; border-color: #ff9a3c; border-radius: 12px; box-shadow: 3px 3px 0 #ff9a3c; text-align: center; }
  .profile-chip { display: flex; align-items: center; gap: 8px; background: #fff; border: 3px solid #1a1a2e; border-radius: 50px; padding: 4px 14px 4px 4px; box-shadow: 3px 3px 0 #1a1a2e; cursor: pointer; }
  .notif-dot { width: 8px; height: 8px; background: #ff6b6b; border: 2px solid #1a1a2e; border-radius: 50%; position: absolute; top: -2px; right: -2px; }
  .comic-tag { display: inline-block; background: #ffd93d; border: 2px solid #1a1a2e; border-radius: 6px; padding: 1px 10px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.06em; box-shadow: 2px 2px 0 #1a1a2e; transform: rotate(-2deg); }
  .session-card { background: #fff; border: 3px solid #1a1a2e; border-radius: 14px; padding: 18px 20px; box-shadow: 5px 5px 0 #1a1a2e; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
  .session-card:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal { background: #fff; border: 4px solid #1a1a2e; border-radius: 20px; box-shadow: 10px 10px 0 #1a1a2e; padding: 36px 32px; width: 100%; max-width: 500px; position: relative; max-height: 90vh; overflow-y: auto; }
  .close-btn { position: absolute; top: 16px; right: 16px; background: #f5f3ee; border: 2px solid #1a1a2e; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; box-shadow: 2px 2px 0 #1a1a2e; }
  .progress-step { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; border: 2px solid #e0dbd0; margin-bottom: 10px; }
  .progress-step.done { background: #e8fde8; border-color: #51cf66; }
  .progress-step.active { background: #fde8f0; border-color: #ff6b9d; box-shadow: 3px 3px 0 #ff6b9d; }
`;

const AVATAR_COLORS = ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"];
const MEMBERS = [
  { initials: "JD", name: "Jordan" },
  { initials: "AL", name: "Alex" },
  { initials: "MK", name: "Maya" },
  { initials: "RB", name: "Ryan" },
];

const DEBRIEF_STEPS = [
  { emoji: "🤝", label: "Set the tone", desc: "Everyone agrees to listen without judgment." },
  { emoji: "💬", label: "Share your side", desc: "Each person shares how they felt — no interrupting." },
  { emoji: "👂", label: "Reflect back", desc: "Repeat what you heard. Show you understand." },
  { emoji: "🔍", label: "Find the root", desc: "What actually caused this? Go deeper." },
  { emoji: "💡", label: "Agree on a fix", desc: "What can everyone do differently going forward?" },
  { emoji: "🤜🤛", label: "Close it out", desc: "Shake on it. You're still crew." },
];

const INITIAL_SESSIONS = [
  {
    id: 1,
    title: "The Miami Trip Tension",
    between: [0, 1],
    status: "In Progress",
    step: 2,
    bg: "#fde8f0", border: "#ff6b9d",
    messages: [
      { from: "system", text: "🤝 Debrief session started. Ground rules: listen, don't attack, be honest." },
      { from: 1, text: "I felt like my opinion was ignored when we were planning the trip itinerary." },
      { from: 0, text: "I hear you. I didn't realize I was doing that, I thought we were just going with the majority." },
      { from: "system", text: "✅ Step 2 complete — both sides shared. Moving to Step 3: Reflect back." },
    ],
  },
  {
    id: 2,
    title: "The Friday Night Situation",
    between: [2, 3],
    status: "Resolved",
    step: 6,
    bg: "#e8fde8", border: "#51cf66",
    messages: [
      { from: "system", text: "🤝 Debrief session started." },
      { from: 2, text: "I was upset that you left early without telling anyone." },
      { from: 3, text: "I get that, I should have said something. I just wasn't feeling well." },
      { from: "system", text: "✅ Resolved — crew is back on good terms 🤜🤛" },
    ],
  },
];

const IconLogoMark = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>;
const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconPlane = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const IconSplit = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSend = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;

const NAV_ITEMS = [
  { icon: <IconHome />, label: "Dashboard" },
  { icon: <IconCalendar />, label: "Hangouts" },
  { icon: <IconUsers />, label: "My Crew" },
  { icon: <IconPlane />, label: "Trips" },
  { icon: <IconSplit />, label: "Bill Split" },
  { icon: <IconStar />, label: "Ratings" },
  { icon: <IconHeart />, label: "Debrief" },
];

const NAV_TARGETS = {
  "Dashboard": "dashboard",
  "Hangouts": "create-hangout",
  "My Crew": "friend-groups",
  "Trips": "trip-planning",
  "Bill Split": "bill-split",
  "Ratings": "rate-outing",
  "Debrief": "debrief",
};

export default function OutsidersDebrief({ onNavigate }) {
  const [activeNav, setActiveNav] = useState("Debrief");
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [selectedSession, setSelectedSession] = useState(INITIAL_SESSIONS[0]);
  const [message, setMessage] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", with: 1 });
  const handleNav = (label) => {
    setActiveNav(label);
    onNavigate?.(NAV_TARGETS[label] || "debrief");
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg = { from: 0, text: message };
    const updated = { ...selectedSession, messages: [...selectedSession.messages, newMsg] };
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setSelectedSession(updated);
    setMessage("");
  };

  const advanceStep = () => {
    if (selectedSession.step >= 6) return;
    const nextStep = selectedSession.step + 1;
    const stepInfo = DEBRIEF_STEPS[nextStep - 1];
    const sysMsg = { from: "system", text: `✅ Step ${nextStep}: ${stepInfo.label} — ${stepInfo.desc}` };
    const isResolved = nextStep === 6;
    const updated = { ...selectedSession, step: nextStep, status: isResolved ? "Resolved" : "In Progress", messages: [...selectedSession.messages, sysMsg] };
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setSelectedSession(updated);
  };

  const createSession = () => {
    if (!newForm.title.trim()) return;
    const newSession = {
      id: Date.now(),
      title: newForm.title,
      between: [0, Number(newForm.with)],
      status: "In Progress",
      step: 1,
      bg: "#fde8f0", border: "#ff6b9d",
      messages: [
        { from: "system", text: `🤝 Debrief session started between ${MEMBERS[0].name} and ${MEMBERS[Number(newForm.with)].name}. Ground rules: listen, don't attack, be honest.` },
        { from: "system", text: `📌 Step 1: Set the tone — everyone agrees to listen without judgment.` },
      ],
    };
    setSessions(prev => [...prev, newSession]);
    setSelectedSession(newSession);
    setShowNewModal(false);
    setNewForm({ title: "", with: 1 });
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <nav className="top-nav">
          <div style={{ padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => onNavigate?.("profile")}><IconBell /><div className="notif-dot" /></div>
              <div className="profile-chip" onClick={() => onNavigate?.("profile")}>
                <div style={{ width: 30, height: 30, background: "#ff6b6b", border: "2px solid #1a1a2e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "#fff" }}>JD</div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>Jordan</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="layout">
          <aside className="sidebar">
            <p className="nav-section-label">Menu</p>
            {NAV_ITEMS.map(item => (
              <div key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => handleNav(item.label)}>
                {item.icon} {item.label}
              </div>
            ))}
          </aside>

          <main className="main">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <span className="comic-tag">Let's talk it out 💬</span>
                <h1 className="bangers" style={{ fontSize: 34, margin: "6px 0 4px" }}>Conflict Debrief 🤝</h1>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Some conversations need more than a voice note. Work through it here.</p>
              </div>
              <button className="btn-primary" onClick={() => setShowNewModal(true)}><IconPlus /> New Session</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>

              {/* Session list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p className="bangers" style={{ fontSize: 13, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Sessions</p>

                {/* How it works */}
                <div style={{ background: "#e8f4fd", border: "3px solid #4ecdc4", borderRadius: 14, padding: "14px 16px", boxShadow: "4px 4px 0 #4ecdc4" }}>
                  <p className="bangers" style={{ fontSize: 14, margin: "0 0 8px", color: "#1a1a2e" }}>How it works 🧭</p>
                  {DEBRIEF_STEPS.map((s, i) => (
                    <p key={i} style={{ fontSize: 12, fontWeight: 700, color: "#555", margin: "0 0 4px" }}>{s.emoji} {s.label}</p>
                  ))}
                </div>

                {sessions.map(s => (
                  <div key={s.id} className="session-card" style={{ background: selectedSession?.id === s.id ? s.bg : "#fff", borderColor: selectedSession?.id === s.id ? s.border : "#1a1a2e", boxShadow: `5px 5px 0 ${selectedSession?.id === s.id ? s.border : "#1a1a2e"}` }} onClick={() => setSelectedSession(s)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <p className="bangers" style={{ fontSize: 16, margin: 0, color: "#1a1a2e" }}>{s.title}</p>
                      <span className="badge" style={{ background: s.status === "Resolved" ? "#e8fde8" : "#fde8f0", color: s.status === "Resolved" ? "#51cf66" : "#ff6b9d", borderColor: s.status === "Resolved" ? "#51cf66" : "#ff6b9d" }}>{s.status}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {s.between.map((mi, i) => (
                        <div key={i} className="avatar" style={{ width: 28, height: 28, background: AVATAR_COLORS[mi], fontSize: 10 }}>{MEMBERS[mi].initials}</div>
                      ))}
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#888" }}>{MEMBERS[s.between[0]].name} & {MEMBERS[s.between[1]].name}</span>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {DEBRIEF_STEPS.map((_, i) => (
                          <div key={i} style={{ flex: 1, height: 6, borderRadius: 99, background: i < s.step ? s.border : "#e0dbd0", border: "1px solid #1a1a2e" }} />
                        ))}
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 800, color: "#888", margin: "4px 0 0" }}>Step {s.step}/6 — {DEBRIEF_STEPS[Math.min(s.step-1, 5)].label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Session detail */}
              {selectedSession && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* Header */}
                  <div className="card" style={{ background: selectedSession.bg, borderColor: selectedSession.border, boxShadow: `5px 5px 0 ${selectedSession.border}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <h2 className="bangers" style={{ fontSize: 24, margin: "0 0 8px" }}>{selectedSession.title}</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {selectedSession.between.map((mi, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div className="avatar" style={{ width: 32, height: 32, background: AVATAR_COLORS[mi], fontSize: 11 }}>{MEMBERS[mi].initials}</div>
                              <span style={{ fontSize: 13, fontWeight: 800 }}>{MEMBERS[mi].name}</span>
                              {i === 0 && <span style={{ fontSize: 16 }}>↔️</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <span className="badge" style={{ background: selectedSession.status === "Resolved" ? "#e8fde8" : "#fff", color: selectedSession.status === "Resolved" ? "#51cf66" : "#ff6b9d", borderColor: selectedSession.status === "Resolved" ? "#51cf66" : "#ff6b9d", fontSize: 14 }}>{selectedSession.status}</span>
                    </div>
                  </div>

                  {/* Progress steps */}
                  <div className="card">
                    <p className="bangers" style={{ fontSize: 18, margin: "0 0 14px" }}>Progress 🧭</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                      {DEBRIEF_STEPS.map((s, i) => (
                        <div key={i} className={`progress-step ${i < selectedSession.step ? "done" : i === selectedSession.step ? "active" : ""}`}>
                          <div className="step-bubble" style={{ background: i < selectedSession.step ? "#51cf66" : i === selectedSession.step ? "#ff6b9d" : "#fff", borderColor: i < selectedSession.step ? "#51cf66" : i === selectedSession.step ? "#ff6b9d" : "#ccc", color: i < selectedSession.step ? "#fff" : "#1a1a2e" }}>{s.emoji}</div>
                          <div>
                            <p className="bangers" style={{ fontSize: 13, margin: 0, color: "#1a1a2e" }}>{s.label}</p>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", margin: 0 }}>{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedSession.status !== "Resolved" && (
                      <button className="btn-secondary" style={{ marginTop: 16 }} onClick={advanceStep}>
                        ✅ Mark Step {selectedSession.step} Complete →
                      </button>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="card">
                    <p className="bangers" style={{ fontSize: 18, margin: "0 0 16px" }}>💬 The Conversation</p>
                    <div style={{ minHeight: 200, marginBottom: 16 }}>
                      {selectedSession.messages.map((msg, i) => (
                        <div key={i} className={`message-bubble ${msg.from === "system" ? "system" : msg.from === 0 ? "me" : "them"}`}>
                          {msg.from !== "system" && msg.from !== 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                              <div className="avatar" style={{ width: 24, height: 24, background: AVATAR_COLORS[msg.from], fontSize: 9 }}>{MEMBERS[msg.from].initials}</div>
                              <span style={{ fontSize: 12, fontWeight: 800, color: "#888" }}>{MEMBERS[msg.from].name}</span>
                            </div>
                          )}
                          {msg.from === "system"
                            ? <p className="bangers" style={{ fontSize: 14, margin: 0, color: "#ff9a3c", letterSpacing: "0.04em" }}>{msg.text}</p>
                            : <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#1a1a2e" }}>{msg.text}</p>
                          }
                        </div>
                      ))}
                    </div>

                    {selectedSession.status !== "Resolved" && (
                      <div style={{ display: "flex", gap: 10 }}>
                        <input className="form-input" type="text" placeholder="Say something..." value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} style={{ flex: 1 }} />
                        <button className="btn-primary" onClick={sendMessage} style={{ flexShrink: 0 }}><IconSend /> Send</button>
                      </div>
                    )}

                    {selectedSession.status === "Resolved" && (
                      <div style={{ background: "#e8fde8", border: "3px solid #51cf66", borderRadius: 12, padding: "14px 18px", textAlign: "center", boxShadow: "4px 4px 0 #51cf66" }}>
                        <p className="bangers" style={{ fontSize: 20, margin: 0, color: "#51cf66" }}>🤜🤛 Session closed — you're good!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

        {showNewModal && (
          <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowNewModal(false)}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">Let's fix this 🤝</span>
                <h2 className="bangers" style={{ fontSize: 32, margin: "8px 0 4px" }}>Start A Debrief</h2>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>A safe space to work through the beef.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">What's this about?</label>
                  <input className="form-input" type="text" placeholder="e.g. The Miami Trip Tension" value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Who's involved?</label>
                  <select className="form-input" value={newForm.with} onChange={e => setNewForm(p => ({ ...p, with: e.target.value }))} style={{ padding: "10px 14px" }}>
                    {MEMBERS.filter((_, i) => i !== 0).map((m, i) => <option key={i+1} value={i+1}>{m.name}</option>)}
                  </select>
                </div>
                <div style={{ background: "#fff4e6", border: "3px solid #ff9a3c", borderRadius: 12, padding: "14px", boxShadow: "3px 3px 0 #ff9a3c" }}>
                  <p className="bangers" style={{ fontSize: 15, margin: "0 0 6px", color: "#1a1a2e" }}>Ground rules 📋</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: 0 }}>No attacks. No interrupting. Just honest conversation with the goal of fixing things.</p>
                </div>
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 20, padding: "14px", marginTop: 4 }} onClick={createSession}>
                  Start Session 🤝
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
