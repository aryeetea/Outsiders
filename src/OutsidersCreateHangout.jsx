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
    max-width: 520px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .form-label {
    display: block;
    font-family: 'Bangers', cursive;
    font-size: 17px;
    letter-spacing: 0.05em;
    color: #1a1a2e;
    margin-bottom: 8px;
  }

  .form-input {
    width: 100%;
    padding: 13px 16px;
    font-size: 15px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    color: #1a1a2e;
    background: #fffdf9;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    outline: none;
    transition: box-shadow 0.15s, border-color 0.15s;
    box-shadow: 4px 4px 0 #1a1a2e;
    resize: none;
  }
  .form-input:focus {
    border-color: #ff6b6b;
    box-shadow: 4px 4px 0 #ff6b6b;
  }
  .form-input::placeholder { color: #bbb; font-weight: 600; }

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

  .btn-secondary {
    background: #ffd93d;
    color: #1a1a2e;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.08em;
    border-radius: 10px;
    box-shadow: 5px 5px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 18px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-secondary:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }
  .btn-secondary:active { transform: translate(2px,2px); box-shadow: 3px 3px 0 #1a1a2e; }

  .btn-outline {
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
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-outline:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }

  .code-box {
    background: #1a1a2e;
    color: #ffd93d;
    border: 4px solid #1a1a2e;
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    font-family: 'Bangers', cursive;
    font-size: 48px;
    letter-spacing: 0.3em;
    box-shadow: 6px 6px 0 #ff6b6b;
    position: relative;
    overflow: hidden;
    user-select: all;
  }
  .code-box::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 12px 12px;
  }

  .link-box {
    background: #fffdf9;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 800;
    color: #555;
    word-break: break-all;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .success-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #e8fde8;
    border: 3px solid #51cf66;
    border-radius: 8px;
    padding: 4px 14px;
    font-family: 'Bangers', cursive;
    font-size: 15px;
    letter-spacing: 0.04em;
    color: #51cf66;
    box-shadow: 3px 3px 0 #51cf66;
  }

  .error-msg {
    font-family: 'Bangers', cursive;
    font-size: 15px;
    color: #ff6b6b;
    margin-top: 6px;
    letter-spacing: 0.04em;
  }

  .shape { position: absolute; pointer-events: none; }

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

  .divider {
    border: none;
    border-top: 3px dashed #e0e0e0;
    margin: 28px 0;
  }

  .step-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px; height: 28px;
    background: #ff6b6b;
    border: 2px solid #1a1a2e;
    border-radius: 50%;
    font-family: 'Bangers', cursive;
    font-size: 15px;
    color: #fff;
    box-shadow: 2px 2px 0 #1a1a2e;
    flex-shrink: 0;
  }
`;

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const IconLogoMark = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/>
  </svg>
);
const IconCopy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function OutsidersCreateHangout({ onNavigate, setAppData }) {
  const [form, setForm] = useState({ name: "", date: "", time: "", location: "", vibe: "" });
  const [errors, setErrors] = useState({});
  const [hangout, setHangout] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Give your hangout a name!";
    if (!form.date) errs.date = "Pick a date!";
    if (!form.time) errs.time = "What time?";
    if (!form.location.trim()) errs.location = "Where are you going?";
    if (!form.vibe.trim()) errs.vibe = "Set the vibe!";
    return errs;
  };

  const handleCreate = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const code = generateCode();
    const createdHangout = { ...form, code, link: `https://outsiders.app/join/${code}`, id: Date.now(), members: ["YOU"] };
    setHangout(createdHangout);
    setAppData?.(prev => ({ ...prev, hangouts: [...prev.hangouts, createdHangout] }));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(hangout.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(hangout.link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const reset = () => { setHangout(null); setForm({ name: "", date: "", time: "", location: "", vibe: "" }); };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        {/* Nav */}
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

          {/* Shapes */}
          <div className="shape" style={{ top: 30, left: "5%", width: 52, height: 52, background: "#ffd93d", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "5px 5px 0 #1a1a2e" }} />
          <div className="shape" style={{ top: 80, right: "7%", width: 42, height: 42, background: "#4ecdc4", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(15deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 60, left: "8%", width: 36, height: 36, background: "#a29bfe", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 40, right: "5%", width: 48, height: 48, background: "#ff6b9d", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(-12deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />

          {!hangout ? (
            /* ── CREATE FORM ── */
            <div className="card">
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <span className="comic-tag">Let's do this! 🎉</span>
                <h1 className="bangers" style={{ fontSize: 38, color: "#1a1a2e", margin: "0 0 6px" }}>Create A Hangout</h1>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Fill in the details and get your invite code.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Hangout name */}
                <div>
                  <label className="form-label">📍 Hangout Name</label>
                  <input className="form-input" type="text" placeholder="e.g. Friday Night Out" value={form.name} onChange={handleChange("name")} />
                  {errors.name && <p className="error-msg">{errors.name}</p>}
                </div>

                {/* Date & Time row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="form-label">📅 Date</label>
                    <input className="form-input" type="date" value={form.date} onChange={handleChange("date")} />
                    {errors.date && <p className="error-msg">{errors.date}</p>}
                  </div>
                  <div>
                    <label className="form-label">⏰ Time</label>
                    <input className="form-input" type="time" value={form.time} onChange={handleChange("time")} />
                    {errors.time && <p className="error-msg">{errors.time}</p>}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="form-label">🗺 Location</label>
                  <input className="form-input" type="text" placeholder="e.g. Central Park, New York" value={form.location} onChange={handleChange("location")} />
                  {errors.location && <p className="error-msg">{errors.location}</p>}
                </div>

                {/* Vibe */}
                <div>
                  <label className="form-label">✨ Vibe / Description</label>
                  <textarea className="form-input" rows={3} placeholder="e.g. Casual dinner, dress comfy, good vibes only 🙌" value={form.vibe} onChange={handleChange("vibe")} />
                  {errors.vibe && <p className="error-msg">{errors.vibe}</p>}
                </div>

                <button className="btn-primary" onClick={handleCreate} style={{ marginTop: 4 }}>
                  Generate Invite Code 🎟
                </button>
              </div>
            </div>

          ) : (
            /* ── SUCCESS / CODE SCREEN ── */
            <div className="card">
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">You're all set! 🎊</span>
                <h1 className="bangers" style={{ fontSize: 36, color: "#1a1a2e", margin: "0 0 4px" }}>{hangout.name}</h1>
                <p style={{ fontSize: 13, color: "#888", fontWeight: 700, margin: 0 }}>
                  📅 {hangout.date} &nbsp;·&nbsp; ⏰ {hangout.time} &nbsp;·&nbsp; 📍 {hangout.location}
                </p>
              </div>

              {/* Vibe */}
              <div style={{ background: "#fff4e6", border: "3px solid #ff9a3c", borderRadius: 12, padding: "12px 16px", marginBottom: 24, boxShadow: "4px 4px 0 #ff9a3c" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#555" }}>✨ {hangout.vibe}</p>
              </div>

              <hr className="divider" />

              {/* Code */}
              <div style={{ marginBottom: 20 }}>
                <p className="bangers" style={{ fontSize: 16, marginBottom: 10, letterSpacing: "0.05em", color: "#1a1a2e" }}>🎟 Share This Code With Your Crew:</p>
                <div className="code-box">{hangout.code}</div>
                <button className="btn-secondary" onClick={copyCode} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
                  {codeCopied ? <><IconCheck /> Code Copied!</> : <><IconCopy /> Copy Code</>}
                </button>
              </div>

              {/* Link */}
              <div style={{ marginBottom: 24 }}>
                <p className="bangers" style={{ fontSize: 16, marginBottom: 10, letterSpacing: "0.05em", color: "#1a1a2e" }}>🔗 Or Share This Link:</p>
                <div className="link-box">{hangout.link}</div>
                <button className="btn-outline" onClick={copyLink} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
                  {linkCopied ? <><IconCheck /> Link Copied!</> : <><IconLink /> Copy Link</>}
                </button>
              </div>

              {/* How it works */}
              <div style={{ background: "#e8f4fd", border: "3px solid #4ecdc4", borderRadius: 12, padding: "16px", boxShadow: "4px 4px 0 #4ecdc4", marginBottom: 24 }}>
                <p className="bangers" style={{ fontSize: 16, margin: "0 0 12px", color: "#1a1a2e", letterSpacing: "0.04em" }}>How Your Friends Join:</p>
                {[
                  "They sign up or log in to Outsiders",
                  "They click 'Join a Hangout'",
                  "They enter the code or use the link",
                  "They're in! 🎉",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 3 ? 10 : 0 }}>
                    <span className="step-pill">{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#444" }}>{step}</span>
                  </div>
                ))}
              </div>

              <button className="btn-primary" onClick={reset} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Create Another Hangout <IconArrow />
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
