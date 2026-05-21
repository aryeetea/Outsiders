import { useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');

  * { box-sizing: border-box; }
  body { background: #f5f3ee; margin: 0; }

  .root {
    font-family: 'Nunito', sans-serif;
    background: #f5f3ee;
    color: #1a1a2e;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .root::before {
    content: '';
    position: fixed; inset: 0;
    background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.03;
    pointer-events: none; z-index: 0;
  }

  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }

  .top-nav {
    position: sticky; top: 0; z-index: 50;
    background: #fffdf9;
    border-bottom: 4px solid #1a1a2e;
    box-shadow: 0 4px 0 #1a1a2e;
  }

  .logo-mark {
    width: 36px; height: 36px;
    background: #ff6b6b; border: 3px solid #1a1a2e;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .layout { display: flex; flex: 1; position: relative; z-index: 1; }

  .sidebar {
    width: 220px; flex-shrink: 0;
    background: #fffdf9;
    border-right: 4px solid #1a1a2e;
    padding: 24px 16px;
    display: flex; flex-direction: column; gap: 6px;
    position: sticky; top: 68px;
    height: calc(100vh - 68px);
    overflow-y: auto;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    cursor: pointer; font-weight: 800; font-size: 14px;
    color: #666; border: 2.5px solid transparent;
    transition: all 0.15s;
  }
  .nav-item:hover { background: #f5f3ee; color: #1a1a2e; border-color: #e0dbd0; }
  .nav-item.active { background: #fff; color: #1a1a2e; border: 2.5px solid #1a1a2e; box-shadow: 3px 3px 0 #1a1a2e; }

  .nav-section-label {
    font-family: 'Bangers', cursive;
    font-size: 12px; letter-spacing: 0.1em;
    color: #bbb; padding: 8px 14px 4px;
    text-transform: uppercase;
  }

  .main { flex: 1; padding: 28px 32px; overflow-y: auto; }

  .card {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    box-shadow: 5px 5px 0 #1a1a2e;
    padding: 22px 24px;
  }

  /* ── Hype card ── */
  .hype-card {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 18px;
    padding: 20px 22px;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s, box-shadow 0.15s;
  }

  /* ── Hype button ── */
  .hype-btn {
    border: 3px solid #1a1a2e;
    border-radius: 12px;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.06em;
    transition: transform 0.1s, box-shadow 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    user-select: none;
    -webkit-user-select: none;
  }
  .hype-btn:active {
    transform: scale(0.93) translate(3px, 3px) !important;
  }

  /* ── Shake animation ── */
  @keyframes shake {
    0% { transform: rotate(0deg); }
    20% { transform: rotate(-4deg) scale(1.05); }
    40% { transform: rotate(4deg) scale(1.08); }
    60% { transform: rotate(-3deg) scale(1.05); }
    80% { transform: rotate(3deg); }
    100% { transform: rotate(0deg); }
  }
  .shake { animation: shake 0.35s ease; }

  /* ── Bounce ── */
  @keyframes bounce-in {
    0% { transform: scale(0.5); opacity: 0; }
    60% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }
  .bounce-in { animation: bounce-in 0.3s ease forwards; }

  /* ── Hype fill bar ── */
  .hype-fill {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
    border-radius: 0 0 15px 15px;
    opacity: 0.12;
  }

  /* ── Winner banner ── */
  .winner-banner {
    background: #e8fde8;
    border: 3px solid #51cf66;
    border-radius: 14px;
    padding: 16px 20px;
    box-shadow: 5px 5px 0 #51cf66;
    display: flex; align-items: center; gap: 14px;
  }

  /* ── Tab ── */
  .tab {
    padding: 10px 24px;
    font-family: 'Bangers', cursive;
    font-size: 18px; letter-spacing: 0.05em;
    border: 3px solid transparent;
    border-radius: 10px; cursor: pointer;
    background: none; color: #888;
    transition: all 0.15s;
  }
  .tab.active {
    background: #fff; color: #1a1a2e;
    border-color: #1a1a2e;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .badge {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: 6px;
    font-family: 'Bangers', cursive;
    font-size: 12px; letter-spacing: 0.05em; border: 2px solid;
  }

  .profile-chip {
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 3px solid #1a1a2e;
    border-radius: 50px; padding: 4px 14px 4px 4px;
    box-shadow: 3px 3px 0 #1a1a2e; cursor: pointer;
  }

  .notif-dot {
    width: 8px; height: 8px; background: #ff6b6b;
    border: 2px solid #1a1a2e; border-radius: 50%;
    position: absolute; top: -2px; right: -2px;
  }

  .comic-tag {
    display: inline-block;
    background: #ffd93d; border: 2px solid #1a1a2e;
    border-radius: 6px; padding: 1px 10px;
    font-family: 'Bangers', cursive; font-size: 12px;
    letter-spacing: 0.06em; box-shadow: 2px 2px 0 #1a1a2e;
    transform: rotate(-2deg);
  }

  .avatar-sm {
    width: 24px; height: 24px; border-radius: 50%;
    border: 2px solid #1a1a2e;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 9px; color: #fff;
    flex-shrink: 0;
  }

  /* ── Floating +1 ── */
  @keyframes float-up {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-60px) scale(1.4); }
  }
  .float-up {
    position: absolute;
    font-family: 'Bangers', cursive;
    font-size: 22px;
    pointer-events: none;
    animation: float-up 0.8s ease forwards;
    z-index: 10;
  }
`;

const AVATAR_COLORS = ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"];

const HANGOUT = { name: "Friday Night Out 🍕", group: "College Crew", totalMembers: 6 };

const HYPE_EMOJIS = ["⚡", "🔥", "💥", "🚀", "😤", "💯"];

const INITIAL_LOCATION_OPTIONS = [
  { id: 1, label: "Central Park Picnic", emoji: "🌳", detail: "Central Park, NY", hype: 14, myHype: 0, color: "#51cf66", voterColors: ["#ff6b6b", "#4ecdc4", "#a29bfe"] },
  { id: 2, label: "Rooftop Bar", emoji: "🌇", detail: "Brooklyn Rooftop", hype: 9, myHype: 0, color: "#4ecdc4", voterColors: ["#ffd93d", "#51cf66"] },
  { id: 3, label: "Bowling Alley", emoji: "🎳", detail: "Bowlmor Times Square", hype: 5, myHype: 0, color: "#a29bfe", voterColors: ["#ff6b9d"] },
  { id: 4, label: "Pizza & Movie Night", emoji: "🍕", detail: "Someone's place", hype: 3, myHype: 0, color: "#ff9a3c", voterColors: [] },
];

const INITIAL_TIME_OPTIONS = [
  { id: 1, label: "Friday 7:00 PM", emoji: "🌆", detail: "Jun 6 · Evening", hype: 18, myHype: 0, color: "#ff6b6b", voterColors: ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d"] },
  { id: 2, label: "Friday 9:00 PM", emoji: "🌙", detail: "Jun 6 · Late night", hype: 8, myHype: 0, color: "#ffd93d", voterColors: ["#51cf66", "#ff6b9d"] },
  { id: 3, label: "Saturday Noon", emoji: "☀️", detail: "Jun 7 · Afternoon", hype: 2, myHype: 0, color: "#4ecdc4", voterColors: [] },
];

function getHypeLabel(hype) {
  if (hype === 0) return { label: "No hype yet", color: "#ccc" };
  if (hype < 5) return { label: "Lukewarm 🥱", color: "#aaa" };
  if (hype < 10) return { label: "Getting there 👀", color: "#ff9a3c" };
  if (hype < 16) return { label: "On fire! 🔥", color: "#ff6b6b" };
  return { label: "ABSOLUTE BANGER 💥", color: "#ff6b6b" };
}

function HypeSection({ title, emoji, options, onHype }) {
  const maxHype = Math.max(...options.map(o => o.hype), 1);
  const winner = [...options].sort((a, b) => b.hype - a.hype)[0];
  const [floaters, setFloaters] = useState([]);

  const handleHype = (id, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.random() * 40 - 20;
    const id2 = Date.now();
    setFloaters(prev => [...prev, { id: id2, x }]);
    setTimeout(() => setFloaters(prev => prev.filter(f => f.id !== id2)), 850);
    onHype(id);
  };

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 className="bangers" style={{ fontSize: 22, margin: 0 }}>{emoji} {title}</h2>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#888" }}>Slam to hype it up ⚡</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {options.map((opt, idx) => {
          const pct = Math.round((opt.hype / maxHype) * 100);
          const hypeInfo = getHypeLabel(opt.hype);
          const isLeading = opt.id === winner.id;

          return (
            <div key={opt.id} className="hype-card" style={{
              borderColor: isLeading ? opt.color : "#1a1a2e",
              boxShadow: isLeading ? `6px 6px 0 ${opt.color}` : "5px 5px 0 #1a1a2e",
            }}>
              {/* Hype fill */}
              <div className="hype-fill" style={{ height: `${pct}%`, background: opt.color }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, background: "#fffdf9", border: `3px solid ${opt.color}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `3px 3px 0 ${opt.color}` }}>
                      {opt.emoji}
                    </div>
                    <div>
                      <p className="bangers" style={{ fontSize: 18, margin: 0, color: "#1a1a2e" }}>{opt.label}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#888", margin: 0 }}>{opt.detail}</p>
                    </div>
                  </div>
                  {isLeading && <span className="badge" style={{ background: "#ffd93d", color: "#1a1a2e", borderColor: "#1a1a2e" }}>👑 Leading</span>}
                </div>

                {/* Hype bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 12, background: "#f0ebe0", border: "2px solid #1a1a2e", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: opt.color, borderRadius: 99, transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)" }} />
                  </div>
                  <span className="bangers" style={{ fontSize: 22, color: opt.color, minWidth: 48 }}>{opt.hype}</span>
                </div>

                {/* Bottom row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: hypeInfo.color }}>{hypeInfo.label}</span>
                    {opt.myHype > 0 && (
                      <span className="badge" style={{ background: "#e8fde8", color: "#51cf66", borderColor: "#51cf66" }}>
                        You hyped {opt.myHype}x
                      </span>
                    )}
                  </div>

                  {/* Hype button — relative for floaters */}
                  <div style={{ position: "relative" }}>
                    {floaters.map(f => (
                      <span key={f.id} className="float-up" style={{ left: `calc(50% + ${f.x}px)`, top: 0, color: opt.color }}>
                        ⚡+1
                      </span>
                    ))}
                    <button
                      className="hype-btn"
                      onClick={(e) => handleHype(opt.id, e)}
                      style={{
                        background: opt.color,
                        color: "#fff",
                        borderColor: "#1a1a2e",
                        boxShadow: `4px 4px 0 #1a1a2e`,
                        padding: "10px 20px",
                        fontSize: 18,
                        transform: "none",
                      }}
                    >
                      ⚡ HYPE IT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const IconLogoMark = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>;
const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconPlane = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const IconSplit = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

const NAV_ITEMS = [
  { icon: <IconHome />, label: "Dashboard" },
  { icon: <IconCalendar />, label: "Hangouts", active: true },
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

export default function OutsidersVoting({ onNavigate }) {
  const [activeNav, setActiveNav] = useState("Hangouts");
  const [activeTab, setActiveTab] = useState("Location");
  const handleNav = (label) => {
    setActiveNav(label);
    onNavigate?.(NAV_TARGETS[label] || "voting");
  };
  const [locationOptions, setLocationOptions] = useState(INITIAL_LOCATION_OPTIONS);
  const [timeOptions, setTimeOptions] = useState(INITIAL_TIME_OPTIONS);

  const handleLocationHype = (id) => {
    setLocationOptions(prev => prev.map(o => o.id === id ? { ...o, hype: o.hype + 1, myHype: o.myHype + 1 } : o));
  };

  const handleTimeHype = (id) => {
    setTimeOptions(prev => prev.map(o => o.id === id ? { ...o, hype: o.hype + 1, myHype: o.myHype + 1 } : o));
  };

  const locationWinner = [...locationOptions].sort((a, b) => b.hype - a.hype)[0];
  const timeWinner = [...timeOptions].sort((a, b) => b.hype - a.hype)[0];
  const totalLocationHype = locationOptions.reduce((s, o) => s + o.hype, 0);
  const totalTimeHype = timeOptions.reduce((s, o) => s + o.hype, 0);

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        {/* Top Nav */}
        <nav className="top-nav">
          <div style={{ padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", cursor: "pointer" }}><IconBell /><div className="notif-dot" /></div>
              <div className="profile-chip">
                <div style={{ width: 30, height: 30, background: "#ff6b6b", border: "2px solid #1a1a2e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "#fff" }}>JD</div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>Jordan</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="layout">

          {/* Sidebar */}
          <aside className="sidebar">
            <p className="nav-section-label">Menu</p>
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => handleNav(item.label)}>
                {item.icon} {item.label}
              </div>
            ))}
          </aside>

          {/* Main */}
          <main className="main">

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <span className="comic-tag">Hype it up! ⚡</span>
              <h1 className="bangers" style={{ fontSize: 34, margin: "8px 0 4px", color: "#1a1a2e" }}>{HANGOUT.name}</h1>
              <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: "0 0 20px" }}>
                {HANGOUT.group} · Slam the button to hype your favourite option!
              </p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
                {[
                  { label: "Total Location Hype", value: totalLocationHype, color: "#51cf66", bg: "#e8fde8", border: "#51cf66" },
                  { label: "Total Time Hype", value: totalTimeHype, color: "#4ecdc4", bg: "#e8f4fd", border: "#4ecdc4" },
                  { label: "Leading Location", value: locationWinner.emoji + " " + locationWinner.label, color: "#ff9a3c", bg: "#fff4e6", border: "#ff9a3c" },
                  { label: "Leading Time", value: timeWinner.emoji + " " + timeWinner.label, color: "#a29bfe", bg: "#f3e8fd", border: "#9b59b6" },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, border: `3px solid ${s.border}`, borderRadius: 12, padding: "12px 16px", boxShadow: `4px 4px 0 ${s.border}`, minWidth: 140 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "#888", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                    <p className="bangers" style={{ fontSize: 18, margin: 0, color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 8, background: "#f5f3ee", padding: 6, borderRadius: 12, border: "3px solid #1a1a2e", width: "fit-content", boxShadow: "3px 3px 0 #1a1a2e" }}>
                {["Location", "Time"].map(t => (
                  <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                    {t === "Location" ? "📍 " : "⏰ "}{t}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "Location" && (
              <HypeSection
                title="Where are we going?"
                emoji="📍"
                options={locationOptions}
                onHype={handleLocationHype}
              />
            )}

            {activeTab === "Time" && (
              <HypeSection
                title="When are we going?"
                emoji="⏰"
                options={timeOptions}
                onHype={handleTimeHype}
              />
            )}

          </main>
        </div>
      </div>
    </>
  );
}
