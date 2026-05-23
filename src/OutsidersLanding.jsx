import { useEffect, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&family=Caveat:wght@600;700&display=swap');

  * { box-sizing: border-box; }

  body { background: #fffdf9; margin: 0; }

  .out-root {
    font-family: 'Nunito', sans-serif;
    background: #fffdf9;
    color: #1a1a2e;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Halftone background ── */
  .out-root::before {
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
  .caveat { font-family: 'Caveat', cursive; }

  /* ── Nav ── */
  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: #fffdf9;
    border-bottom: 4px solid #1a1a2e;
    box-shadow: 0 4px 0 #1a1a2e;
  }

  /* ── Logo ── */
  .logo-mark {
    width: 38px;
    height: 38px;
    background: #ff6b6b;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .logo-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  /* ── Buttons ── */
  .btn-primary {
    background: #ff6b6b;
    color: #fff;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.06em;
    border-radius: 8px;
    box-shadow: 5px 5px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 18px;
  }
  .btn-primary:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }
  .btn-primary:active { transform: translate(2px,2px); box-shadow: 3px 3px 0 #1a1a2e; }

  .btn-outline {
    background: #ffd93d;
    color: #1a1a2e;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.06em;
    border-radius: 8px;
    box-shadow: 5px 5px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 18px;
  }
  .btn-outline:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }
  .btn-outline:active { transform: translate(2px,2px); box-shadow: 3px 3px 0 #1a1a2e; }

  .btn-ghost {
    background: transparent;
    border: 3px solid #1a1a2e;
    color: #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.06em;
    border-radius: 8px;
    transition: background 0.15s;
    font-size: 18px;
  }
  .btn-ghost:hover { background: #f0ebe0; }

  /* ── Speech bubble pill ── */
  .speech-bubble {
    display: inline-block;
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 20px;
    padding: 8px 20px;
    font-family: 'Bangers', cursive;
    font-size: 16px;
    letter-spacing: 0.06em;
    box-shadow: 4px 4px 0 #1a1a2e;
    position: relative;
  }
  .speech-bubble::after {
    content: '';
    position: absolute;
    bottom: -14px;
    left: 24px;
    width: 0; height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 14px solid #1a1a2e;
  }
  .speech-bubble::before {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 25px;
    width: 0; height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 12px solid #fff;
    z-index: 1;
  }

  /* ── Feature card ── */
  .feature-card {
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    box-shadow: 6px 6px 0 #1a1a2e;
    transition: transform 0.18s, box-shadow 0.18s;
    position: relative;
    overflow: hidden;
  }
  .feature-card:hover {
    transform: translate(-3px,-3px);
    box-shadow: 9px 9px 0 #1a1a2e;
  }

  /* ── Comic panel border on hero ── */
  .comic-panel {
    border: 4px solid #1a1a2e;
    border-radius: 20px;
    box-shadow: 8px 8px 0 #1a1a2e;
    position: relative;
    overflow: hidden;
  }

  /* ── Starburst ── */
  .starburst {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #ffd93d;
    border: 3px solid #1a1a2e;
    border-radius: 50%;
    width: 72px;
    height: 72px;
    font-family: 'Bangers', cursive;
    font-size: 13px;
    letter-spacing: 0.04em;
    text-align: center;
    line-height: 1.2;
    box-shadow: 4px 4px 0 #1a1a2e;
    transform: rotate(-8deg);
    position: absolute;
    top: -16px;
    right: 20px;
  }

  /* ── Tag badge ── */
  .tag-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 6px;
    font-family: 'Bangers', cursive;
    font-size: 13px;
    letter-spacing: 0.06em;
    border: 2px solid #1a1a2e;
  }

  /* ── Icon box ── */
  .icon-box {
    width: 54px;
    height: 54px;
    background: #fff;
    border: 2.5px solid #1a1a2e;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 3px 3px 0 #1a1a2e;
    flex-shrink: 0;
  }

  /* ── Fade up ── */
  .fade-up {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .fade-up.visible { opacity: 1; transform: translateY(0); }

  /* ── Shape ── */
  .shape {
    position: absolute;
    pointer-events: none;
  }

  /* ── Footer ── */
  .footer-link {
    color: #1a1a2e;
    text-decoration: none;
    font-family: 'Bangers', cursive;
    font-size: 16px;
    letter-spacing: 0.05em;
    transition: opacity 0.2s;
  }
  .footer-link:hover { opacity: 0.5; }

  /* ── ZAP text effect ── */
  .zap {
    display: inline-block;
    background: #ffd93d;
    border: 3px solid #1a1a2e;
    padding: 2px 12px;
    border-radius: 6px;
    transform: rotate(-2deg);
    box-shadow: 3px 3px 0 #1a1a2e;
  }
`;

const CARD_COLORS = [
  { bg: "#fff4e6", tag: "#ff9a3c", tagBg: "#ffe0b2" },
  { bg: "#e8f4fd", tag: "#4ecdc4", tagBg: "#b2ebf2" },
  { bg: "#fde8f0", tag: "#ff6b9d", tagBg: "#f8bbd0" },
  { bg: "#e8fde8", tag: "#51cf66", tagBg: "#c8e6c9" },
  { bg: "#f3e8fd", tag: "#9b59b6", tagBg: "#e1bee7" },
  { bg: "#fdf6e8", tag: "#f39c12", tagBg: "#fff9c4" },
];

const IconCalendar = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconVote = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const IconPlane = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);
const IconSplit = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconStar = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconHeart = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconLogoMark = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/>
  </svg>
);

const FEATURES = [
  { icon: <IconCalendar />, title: "Plan & Schedule Hangouts", body: "Stop letting 'we should hang' die in the chat. Pick a date, lock it in, and actually show up.", tag: "Planning" },
  { icon: <IconVote />, title: "Vote On Places & Times", body: "No more 'idk you pick.' Everyone gets a say, the group decides, and you all show up somewhere nobody hates.", tag: "Voting" },
  { icon: <IconPlane />, title: "Travel Together", body: "Weekend trip or across the world — Outsiders keeps your crew organized so the only thing you worry about is the vibe.", tag: "Travel" },
  { icon: <IconSplit />, title: "Split The Bill", body: "Nobody should lose a friend over who paid for dinner. Split it clean, keep it fair, move on.", tag: "Finance" },
  { icon: <IconStar />, title: "Rate The Outing", body: "Was it a 10 or a disaster? Rate the night and let the data decide where you're going next time.", tag: "Reviews" },
  { icon: <IconHeart />, title: "Conflict Resolution & Debrief", body: "Because some conversations need more than a voice note. Work through the mess before it becomes distance.", tag: "Debrief" },
];

function useFadeUp(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(() => {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
        { threshold: 0.1 }
      );
      obs.observe(el);
      return () => obs.disconnect();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return ref;
}

function FeatureCard({ icon, title, body, tag, delay, index }) {
  const ref = useFadeUp(delay);
  const color = CARD_COLORS[index % CARD_COLORS.length];
  return (
    <div ref={ref} className="feature-card fade-up" style={{ padding: "28px 24px", background: color.bg }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="icon-box">{icon}</div>
        <span className="tag-badge" style={{ background: color.tagBg, color: color.tag, borderColor: color.tag }}>{tag}</span>
      </div>
      <h3 className="bangers" style={{ fontSize: 22, color: "#1a1a2e", margin: "0 0 10px", lineHeight: 1.2 }}>{title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.65, color: "#555", margin: 0, fontWeight: 600 }}>{body}</p>
    </div>
  );
}

export default function OutsidersLanding({ onNavigate }) {
  const heroRef = useFadeUp(100);
  const subRef = useFadeUp(220);
  const ctaRef = useFadeUp(340);
  const featuresRef = useRef(null);

  return (
    <>
      <style>{STYLES}</style>
      <div className="out-root">

        {/* ── Nav ── */}
        <nav className="nav-bar">
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
            <button type="button" className="logo-link" onClick={() => onNavigate?.("landing")} aria-label="Go to home">
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e", letterSpacing: "0.04em" }}>Outsiders</span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="btn-ghost" style={{ padding: "8px 18px", fontSize: 16 }} onClick={() => onNavigate?.("login")}>Log In</button>
              <button className="btn-primary" style={{ padding: "8px 22px", fontSize: 16 }} onClick={() => onNavigate?.("signup")}>Sign Up</button>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ position: "relative", padding: "80px 24px 80px", overflow: "hidden" }}>
          {/* Floating shapes */}
          <div className="shape" style={{ top: 30, left: "4%", width: 56, height: 56, background: "#ffd93d", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "5px 5px 0 #1a1a2e" }} />
          <div className="shape" style={{ top: 80, right: "6%", width: 44, height: 44, background: "#4ecdc4", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(15deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 40, left: "8%", width: 36, height: 36, background: "#a29bfe", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 60, right: "4%", width: 48, height: 48, background: "#ff6b9d", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(-10deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ top: "40%", left: "2%", width: 28, height: 28, background: "#51cf66", border: "3px solid #1a1a2e", borderRadius: "6px", transform: "rotate(20deg)", boxShadow: "3px 3px 0 #1a1a2e" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", textAlign: "center" }}>

            {/* Speech bubble */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 44 }}>
              <span className="speech-bubble">🎉 Now in public beta — join your crew!</span>
            </div>

            {/* Comic panel headline */}
            <div ref={heroRef} className="comic-panel fade-up" style={{ background: "#fff", padding: "40px 32px 32px", marginBottom: 32 }}>
              <div className="starburst">FREE<br/>TO<br/>JOIN!</div>
              <h1 className="bangers" style={{ fontSize: "clamp(44px, 7vw, 88px)", lineHeight: 1.05, margin: "0 0 16px", color: "#1a1a2e" }}>
                Your friend group<br />
                deserves better than<br />
                <span className="zap">a group chat.</span>
              </h1>
              <p ref={subRef} className="fade-up" style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "#555", lineHeight: 1.7, maxWidth: 580, margin: "0 auto", fontWeight: 700 }}>
                Outsiders is where crews actually stay crews — plan it, vote on it, travel for it, split it, and fix the beef when it comes up. No download. Just you and your people.
              </p>
            </div>

            {/* CTA */}
            <div ref={ctaRef} className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <button className="btn-primary" style={{ padding: "16px 36px", fontSize: 22, display: "flex", alignItems: "center", gap: 10 }} onClick={() => onNavigate?.("signup")}>
                Get Started <IconArrowRight />
              </button>
              <button className="btn-outline" style={{ padding: "16px 32px", fontSize: 22 }} onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                See How It Works
              </button>
            </div>

            {/* Social proof */}
            <div style={{ marginTop: 32, display: "flex", justifyContent: "center", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ background: "#fff", border: "3px solid #1a1a2e", borderRadius: 8, padding: "6px 16px", boxShadow: "4px 4px 0 #1a1a2e", display: "flex", alignItems: "center", gap: 8 }}>
                <span>👥</span>
                <span className="bangers" style={{ fontSize: 16, letterSpacing: "0.04em" }}>Start your crew here</span>
              </div>
              <span style={{ fontWeight: 800, color: "#aaa" }}>·</span>
              <span style={{ fontWeight: 800, color: "#888", fontSize: 14 }}>No download. Just open up and show up.</span>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section ref={featuresRef} style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", padding: "20px 24px 120px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="bangers" style={{ fontSize: 14, letterSpacing: "0.12em", color: "#ff6b6b", textTransform: "uppercase" }}>Everything your crew needs</span>
            <h2 className="bangers" style={{ fontSize: "clamp(32px, 5vw, 52px)", color: "#1a1a2e", margin: "8px 0 0" }}>
              Built For Real Friendships ✨
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} delay={i * 100} />
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: "4px solid #1a1a2e", background: "#fff", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "36px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 22, color: "#1a1a2e", letterSpacing: "0.04em" }}>Outsiders</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
              {["Privacy", "Terms", "Docs", "Blog", "Status"].map(l => (
                <a key={l} href="#" className="footer-link">{l}</a>
              ))}
            </div>
            <span className="bangers" style={{ fontSize: 15, color: "#999", letterSpacing: "0.04em" }}>© 2025 Outsiders, Inc.</span>
          </div>
        </footer>

      </div>
    </>
  );
}
