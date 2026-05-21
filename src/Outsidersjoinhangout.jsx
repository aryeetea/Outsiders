import { useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');

  * { box-sizing: border-box; }
  body { background: #fffdf9; margin: 0; }

  .root {
    font-family: 'Nunito', sans-serif;
    background: #fffdf9;
    color: #1a1a2e;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.04;
    pointer-events: none;
    z-index: 0;
  }

  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }

  .nav-bar {
    border-bottom: 4px solid #1a1a2e;
    background: #fffdf9;
    box-shadow: 0 4px 0 #1a1a2e;
    position: relative;
    z-index: 10;
  }

  .logo-mark {
    width: 38px; height: 38px;
    background: #ff6b6b;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .card {
    background: #fff;
    border: 4px solid #1a1a2e;
    border-radius: 20px;
    box-shadow: 10px 10px 0 #1a1a2e;
    padding: 40px 36px;
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .code-input-wrap {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 8px;
  }

  .code-char {
    width: 52px;
    height: 64px;
    text-align: center;
    font-family: 'Bangers', cursive;
    font-size: 32px;
    letter-spacing: 0.04em;
    color: #1a1a2e;
    background: #fffdf9;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    outline: none;
    box-shadow: 4px 4px 0 #1a1a2e;
    transition: border-color 0.15s, box-shadow 0.15s;
    text-transform: uppercase;
  }
  .code-char:focus {
    border-color: #ff6b6b;
    box-shadow: 4px 4px 0 #ff6b6b;
  }

  .btn-primary {
    width: 100%;
    background: #ff6b6b;
    color: #fff;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.08em;
    border-radius: 10px;
    box-shadow: 6px 6px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 22px;
    padding: 14px;
  }
  .btn-primary:hover { transform: translate(-2px,-2px); box-shadow: 8px 8px 0 #1a1a2e; }
  .btn-primary:active { transform: translate(2px,2px); box-shadow: 4px 4px 0 #1a1a2e; }

  .btn-outline {
    width: 100%;
    background: #fff;
    color: #1a1a2e;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.08em;
    border-radius: 10px;
    box-shadow: 5px 5px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 18px;
    padding: 12px;
  }
  .btn-outline:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }

  .error-msg {
    font-family: 'Bangers', cursive;
    font-size: 15px;
    color: #ff6b6b;
    letter-spacing: 0.04em;
    text-align: center;
  }

  .success-card {
    background: #e8fde8;
    border: 4px solid #51cf66;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 6px 6px 0 #51cf66;
    text-align: center;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 2px dashed #e0e0e0;
    font-size: 14px;
    font-weight: 700;
    color: #444;
  }
  .detail-row:last-child { border-bottom: none; }

  .comic-tag {
    display: inline-block;
    background: #ffd93d;
    border: 3px solid #1a1a2e;
    border-radius: 8px;
    padding: 2px 12px;
    font-family: 'Bangers', cursive;
    font-size: 13px;
    letter-spacing: 0.06em;
    box-shadow: 3px 3px 0 #1a1a2e;
    transform: rotate(-2deg);
    margin-bottom: 12px;
  }

  .shape { position: absolute; pointer-events: none; }

  .divider {
    border: none;
    border-top: 3px dashed #e0e0e0;
    margin: 24px 0;
  }
`;

// Mock hangout database for demo
const MOCK_HANGOUTS = {
  "ABC123": { name: "Friday Night Out", date: "2025-06-06", time: "20:00", location: "Central Park, New York", vibe: "Casual dinner, dress comfy, good vibes only 🙌", host: "Jordan" },
  "XYZ789": { name: "Beach Day 🏖", date: "2025-06-15", time: "11:00", location: "Santa Monica Beach", vibe: "Sun, surf and snacks. Bring sunscreen!", host: "Alex" },
};

const IconLogoMark = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/>
  </svg>
);
const IconCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#51cf66" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function OutsidersJoinHangout({ onNavigate }) {
  const [chars, setChars] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(null);

  const handleChar = (i, val) => {
    const v = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-1);
    const next = [...chars];
    next[i] = v;
    setChars(next);
    setError("");
    if (v && i < 5) {
      document.getElementById(`cc-${i + 1}`)?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      document.getElementById(`cc-${i - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const next = Array(6).fill("").map((_, i) => paste[i] || "");
    setChars(next);
    document.getElementById(`cc-5`)?.focus();
  };

  const handleJoin = () => {
    const code = chars.join("");
    if (code.length < 6) { setError("Enter the full 6-character code!"); return; }
    const hangout = MOCK_HANGOUTS[code] || (code.length === 6 ? { name: "Weekend Vibes 🎉", date: "2025-06-20", time: "18:00", location: "Downtown", vibe: "Come through, it's going to be a good one!", host: "Your friend" } : null);
    if (!hangout) { setError("Hmm, that code doesn't exist. Check it and try again!"); return; }
    setJoined(hangout);
  };

  const reset = () => { setChars(["", "", "", "", "", ""]); setJoined(null); setError(""); };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        <nav className="nav-bar">
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </div>
            <button onClick={() => onNavigate ? onNavigate("dashboard") : reset()} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Bangers', cursive", fontSize: 16, color: "#888", letterSpacing: "0.04em" }}>
              ← Back
            </button>
          </div>
        </nav>

        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", position: "relative", overflow: "hidden" }}>

          <div className="shape" style={{ top: 30, left: "5%", width: 52, height: 52, background: "#ffd93d", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "5px 5px 0 #1a1a2e" }} />
          <div className="shape" style={{ top: 80, right: "7%", width: 42, height: 42, background: "#4ecdc4", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(15deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 60, left: "8%", width: 36, height: 36, background: "#a29bfe", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 40, right: "5%", width: 48, height: 48, background: "#ff6b9d", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(-12deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />

          {!joined ? (
            <div className="card">
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <span className="comic-tag">Got an invite? 🎟</span>
                <h1 className="bangers" style={{ fontSize: 38, color: "#1a1a2e", margin: "0 0 6px" }}>Join A Hangout</h1>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Enter the 6-character code your crew sent you.</p>
              </div>

              {/* Code input */}
              <div style={{ marginBottom: 24 }}>
                <div className="code-input-wrap" onPaste={handlePaste}>
                  {chars.map((c, i) => (
                    <input
                      key={i}
                      id={`cc-${i}`}
                      className="code-char"
                      maxLength={1}
                      value={c}
                      onChange={e => handleChar(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                    />
                  ))}
                </div>
                {error && <p className="error-msg">{error}</p>}
                <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", fontWeight: 700, marginTop: 8 }}>
                  Tip: You can also paste the full code at once
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button className="btn-primary" onClick={handleJoin}>
                  Join The Hangout 🚀
                </button>
                <button className="btn-outline" onClick={() => onNavigate?.("signup")}>
                  I Don't Have A Code
                </button>
              </div>

              <hr className="divider" />

              <p style={{ textAlign: "center", fontSize: 13, color: "#aaa", fontWeight: 700, margin: 0 }}>
                You need an Outsiders account to join. <br />
                <span style={{ color: "#ff6b6b", cursor: "pointer", fontWeight: 800 }} onClick={() => onNavigate?.("signup")}>Sign up here →</span>
              </p>
            </div>

          ) : (
            <div className="card">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <div style={{ width: 64, height: 64, background: "#e8fde8", border: "4px solid #51cf66", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "4px 4px 0 #51cf66" }}>
                    <IconCheck />
                  </div>
                </div>
                <span className="comic-tag" style={{ background: "#e8fde8", borderColor: "#51cf66", color: "#51cf66" }}>You're in! 🎉</span>
                <h1 className="bangers" style={{ fontSize: 36, color: "#1a1a2e", margin: "8px 0 4px" }}>{joined.name}</h1>
                <p style={{ fontSize: 13, color: "#888", fontWeight: 700, margin: 0 }}>Hosted by {joined.host}</p>
              </div>

              {/* Details */}
              <div style={{ background: "#fff", border: "3px solid #1a1a2e", borderRadius: 14, padding: "16px 20px", marginBottom: 20, boxShadow: "5px 5px 0 #1a1a2e" }}>
                <div className="detail-row">
                  <span style={{ fontSize: 20 }}>📅</span>
                  <span>{formatDate(joined.date)}</span>
                </div>
                <div className="detail-row">
                  <span style={{ fontSize: 20 }}>⏰</span>
                  <span>{formatTime(joined.time)}</span>
                </div>
                <div className="detail-row">
                  <span style={{ fontSize: 20 }}>📍</span>
                  <span>{joined.location}</span>
                </div>
                <div className="detail-row">
                  <span style={{ fontSize: 20 }}>✨</span>
                  <span>{joined.vibe}</span>
                </div>
              </div>

              <button className="btn-primary" onClick={() => onNavigate?.("create-hangout")} style={{ marginBottom: 12 }}>
                View My Hangouts 🗓
              </button>
              <button className="btn-outline" onClick={reset}>
                Join Another Hangout
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
