import { useRef, useState } from "react";
import OutsidersSideNav from "./OutsidersSideNav";

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

  .main { flex: 1; padding: 28px 32px; overflow-y: auto; }
  .voting-shell {
    background:
      radial-gradient(circle, rgba(201, 179, 104, 0.42) 1.4px, transparent 1.5px),
      linear-gradient(180deg, #fff9ea 0%, #fff6df 100%);
    background-size: 36px 36px, 100% 100%;
    border: 5px solid #1a1a2e;
    border-radius: 28px;
    box-shadow: 0 0 0 4px rgba(255,255,255,0.45) inset;
    padding: 36px 42px 54px;
    position: relative;
    overflow: hidden;
  }
  .voting-shell::before {
    content: '';
    position: absolute;
    inset: 16px;
    border: 2px solid rgba(26, 26, 46, 0.08);
    border-radius: 22px;
    pointer-events: none;
  }
  .voting-hero {
    display: grid;
    justify-items: center;
    gap: 22px;
    text-align: center;
    margin-bottom: 30px;
    position: relative;
    z-index: 1;
    max-width: 980px;
    margin-left: auto;
    margin-right: auto;
  }
  .voting-kicker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    min-width: min(100%, 320px);
    padding: 12px 24px;
    background: #ffd54d;
    border: 5px solid #1a1a2e;
    border-radius: 12px;
    box-shadow: 0 6px 0 #1a1a2e;
    transform: rotate(-1.5deg);
    font: 400 clamp(18px, 2.2vw, 28px) 'Bangers', cursive;
    letter-spacing: 0.08em;
  }
  .voting-title {
    margin: 0;
    font: 400 clamp(52px, 9vw, 94px) 'Bangers', cursive;
    line-height: 0.92;
    letter-spacing: 0.05em;
    color: #ff6b6b;
    text-shadow: 6px 0 0 #1a1a2e, 12px 0 0 rgba(255, 107, 107, 0.18);
  }
  .voting-subtitle {
    position: relative;
    background: #fff;
    border: 5px solid #1a1a2e;
    border-radius: 999px;
    box-shadow: 6px 6px 0 #1a1a2e;
    padding: 16px 32px;
    font: 800 clamp(18px, 2vw, 26px) 'Nunito', sans-serif;
  }
  .voting-subtitle::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -16px;
    width: 24px;
    height: 24px;
    background: #fff;
    border-right: 5px solid #1a1a2e;
    border-bottom: 5px solid #1a1a2e;
    transform: translateX(-50%) rotate(45deg);
  }
  .voting-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0 18px;
    color: #888a95;
    font: 400 22px 'Bangers', cursive;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .voting-section-label::before {
    content: "▸";
    font-size: 18px;
  }
  .voting-summary-grid { display: grid; gap: 14px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 20px; }

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
  @media (max-width: 1024px) {
    .main { padding: 24px 20px; }
    .voting-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .voting-shell { padding: 28px 22px 36px; }
  }
  @media (max-width: 640px) {
    .main { padding: 18px 14px; }
    .voting-kicker { min-width: 0; width: 100%; }
    .voting-subtitle { padding: 14px 20px; }
    .voting-summary-grid { grid-template-columns: 1fr; }
  }
`;

const HANGOUT = { name: "Voting", group: "No active hangout", totalMembers: 0 };

const INITIAL_LOCATION_OPTIONS = [];

const INITIAL_TIME_OPTIONS = [];

function getHypeLabel(hype) {
  if (hype === 0) return { label: "No hype yet", color: "#ccc" };
  if (hype < 5) return { label: "Lukewarm 🥱", color: "#aaa" };
  if (hype < 10) return { label: "Getting there 👀", color: "#ff9a3c" };
  if (hype < 16) return { label: "On fire! 🔥", color: "#ff6b6b" };
  return { label: "ABSOLUTE BANGER 💥", color: "#ff6b6b" };
}

function HypeSection({ title, emoji, options, onHype }) {
  const [floaters, setFloaters] = useState([]);
  const floaterIdRef = useRef(0);

  if (options.length === 0) {
    return (
      <div className="card">
        <h2 className="bangers" style={{ fontSize: 22, margin: "0 0 10px" }}>{emoji} {title}</h2>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#888", margin: 0 }}>No options have been added for this vote yet.</p>
      </div>
    );
  }
  const maxHype = Math.max(...options.map(o => o.hype), 1);
  const winner = [...options].sort((a, b) => b.hype - a.hype)[0];

  const handleHype = (id) => {
    const nextId = floaterIdRef.current + 1;
    floaterIdRef.current = nextId;
    const x = ((nextId % 5) - 2) * 10;
    setFloaters(prev => [...prev, { id: nextId, x }]);
    setTimeout(() => setFloaters(prev => prev.filter(f => f.id !== nextId)), 850);
    onHype(id);
  };

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 className="bangers" style={{ fontSize: 22, margin: 0 }}>{emoji} {title}</h2>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#888" }}>Slam to hype it up ⚡</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {options.map((opt) => {
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
                      onClick={() => handleHype(opt.id)}
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

export default function OutsidersVoting({ onNavigate, appData, setAppData }) {
  const [activeTab, setActiveTab] = useState("Location");
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
  const profileName = appData?.profile?.name || appData?.profile?.username || "You";

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        <OutsidersSideNav activeLabel="Hangouts" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length} appData={appData} setAppData={setAppData}>
          <main className="main">
            <section className="voting-shell">

            <div className="voting-hero">
              <div className="voting-kicker">
                <span>⚡</span>
                <span>Hype It Up</span>
                <span>⚡</span>
              </div>
              <h1 className="voting-title">{HANGOUT.name}</h1>
              <div className="voting-subtitle">{HANGOUT.group} · Slam the button to back your favorite option.</div>
            </div>

              <div className="voting-section-label">Vote Board</div>
              <div className="voting-summary-grid">
                {[
                  { label: "Total Location Hype", value: totalLocationHype, color: "#51cf66", bg: "#e8fde8", border: "#51cf66" },
                  { label: "Total Time Hype", value: totalTimeHype, color: "#4ecdc4", bg: "#e8f4fd", border: "#4ecdc4" },
                  { label: "Leading Location", value: locationWinner ? `${locationWinner.emoji} ${locationWinner.label}` : "—", color: "#ff9a3c", bg: "#fff4e6", border: "#ff9a3c" },
                  { label: "Leading Time", value: timeWinner ? `${timeWinner.emoji} ${timeWinner.label}` : "—", color: "#a29bfe", bg: "#f3e8fd", border: "#9b59b6" },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, border: `3px solid ${s.border}`, borderRadius: 12, padding: "12px 16px", boxShadow: `4px 4px 0 ${s.border}`, minWidth: 140 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "#888", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                    <p className="bangers" style={{ fontSize: 18, margin: 0, color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="voting-section-label">Choose A Lane</div>
              <div style={{ display: "flex", gap: 8, background: "#f5f3ee", padding: 6, borderRadius: 12, border: "3px solid #1a1a2e", width: "fit-content", boxShadow: "3px 3px 0 #1a1a2e" }}>
                {["Location", "Time"].map(t => (
                  <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                    {t === "Location" ? "📍 " : "⏰ "}{t}
                  </button>
                ))}
              </div>
            
            <div style={{ marginTop: 20 }}>

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
            </div>
            </section>

          </main>
        </OutsidersSideNav>
      </div>
    </>
  );
}
