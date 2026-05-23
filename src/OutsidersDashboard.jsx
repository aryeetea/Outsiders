import { useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');

  * { box-sizing: border-box; }
  body { background: #fffdf9; margin: 0; }

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
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.03;
    pointer-events: none;
    z-index: 0;
  }

  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }

  /* ── Top Nav ── */
  .top-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: #fffdf9;
    border-bottom: 4px solid #1a1a2e;
    box-shadow: 0 4px 0 #1a1a2e;
  }

  .logo-mark {
    width: 36px; height: 36px;
    background: #ff6b6b;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 3px 3px 0 #1a1a2e;
    flex-shrink: 0;
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

  /* ── Layout ── */
  .layout {
    display: flex;
    flex: 1;
    position: relative;
    z-index: 1;
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 220px;
    flex-shrink: 0;
    background: #fffdf9;
    border-right: 4px solid #1a1a2e;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: sticky;
    top: 68px;
    height: calc(100vh - 68px);
    overflow-y: auto;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 800;
    font-size: 14px;
    color: #666;
    border: 2.5px solid transparent;
    transition: all 0.15s;
    text-decoration: none;
  }
  .nav-item:hover {
    background: #f5f3ee;
    color: #1a1a2e;
    border-color: #e0dbd0;
  }
  .nav-item.active {
    background: #fff;
    color: #1a1a2e;
    border: 2.5px solid #1a1a2e;
    box-shadow: 3px 3px 0 #1a1a2e;
  }
  .nav-item.active .nav-icon { color: #ff6b6b; }

  .nav-section-label {
    font-family: 'Bangers', cursive;
    font-size: 12px;
    letter-spacing: 0.1em;
    color: #bbb;
    padding: 8px 14px 4px;
    text-transform: uppercase;
  }

  /* ── Main content ── */
  .main {
    flex: 1;
    padding: 28px 32px;
    overflow-y: auto;
  }

  .dashboard-hero {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 18px;
    box-shadow: 6px 6px 0 #1a1a2e;
    padding: 24px;
    margin-bottom: 24px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 20px;
    align-items: center;
  }

  .hero-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 24px;
    align-items: start;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .empty-panel {
    background: #fffdf9;
    border: 3px dashed #4ecdc4;
    border-radius: 14px;
    padding: 22px;
    text-align: center;
  }

  /* ── Cards ── */
  .card {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    box-shadow: 5px 5px 0 #1a1a2e;
    padding: 20px 22px;
  }

  /* ── Stat card ── */
  .stat-card {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 14px;
    box-shadow: 5px 5px 0 #1a1a2e;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .stat-icon {
    width: 48px; height: 48px;
    border: 2.5px solid #1a1a2e;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  /* ── Hangout card ── */
  .hangout-card {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 14px;
    box-shadow: 5px 5px 0 #1a1a2e;
    padding: 18px 20px;
    transition: transform 0.15s, box-shadow 0.15s;
    cursor: pointer;
  }
  .hangout-card:hover {
    transform: translate(-2px,-2px);
    box-shadow: 7px 7px 0 #1a1a2e;
  }

  /* ── Avatar ── */
  .avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 2.5px solid #1a1a2e;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900;
    font-size: 13px;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 2px 2px 0 #1a1a2e;
  }

  .avatar-sm {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 2px solid #1a1a2e;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900;
    font-size: 10px;
    color: #fff;
    flex-shrink: 0;
  }

  /* ── Badge ── */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 6px;
    font-family: 'Bangers', cursive;
    font-size: 12px;
    letter-spacing: 0.05em;
    border: 2px solid;
  }

  /* ── Quick action button ── */
  .quick-btn {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 12px;
    box-shadow: 4px 4px 0 #1a1a2e;
    padding: 16px;
    cursor: pointer;
    transition: transform 0.12s, box-shadow 0.12s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-family: 'Bangers', cursive;
    font-size: 14px;
    letter-spacing: 0.04em;
    color: #1a1a2e;
    text-align: center;
  }
  .quick-btn:hover {
    transform: translate(-2px,-2px);
    box-shadow: 6px 6px 0 #1a1a2e;
  }

  /* ── Activity item ── */
  .activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 2px dashed #f0ebe0;
  }
  .activity-item:last-child { border-bottom: none; }

  .activity-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    border: 2px solid #1a1a2e;
    flex-shrink: 0;
  }

  /* ── Friend item ── */
  .friend-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 2px dashed #f0ebe0;
  }
  .friend-item:last-child { border-bottom: none; }

  /* ── Section header ── */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .see-all {
    font-family: 'Bangers', cursive;
    font-size: 14px;
    letter-spacing: 0.04em;
    color: #ff6b6b;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
  }
  .see-all:hover { text-decoration: underline; }

  /* ── Profile chip ── */
  .profile-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 50px;
    padding: 4px 14px 4px 4px;
    box-shadow: 3px 3px 0 #1a1a2e;
    cursor: pointer;
    transition: transform 0.12s;
  }
  .profile-chip:hover { transform: translate(-1px,-1px); }

  /* ── Notification dot ── */
  .notif-dot {
    width: 8px; height: 8px;
    background: #ff6b6b;
    border: 2px solid #1a1a2e;
    border-radius: 50%;
    position: absolute;
    top: -2px; right: -2px;
  }

  .comic-tag {
    display: inline-block;
    background: #ffd93d;
    border: 2px solid #1a1a2e;
    border-radius: 6px;
    padding: 1px 10px;
    font-family: 'Bangers', cursive;
    font-size: 12px;
    letter-spacing: 0.06em;
    box-shadow: 2px 2px 0 #1a1a2e;
  }

  .btn-primary {
    background: #ff6b6b;
    color: #fff;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.08em;
    border-radius: 10px;
    box-shadow: 4px 4px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 16px;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-primary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }

  .btn-secondary {
    background: #ffd93d;
    color: #1a1a2e;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.08em;
    border-radius: 10px;
    box-shadow: 4px 4px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 16px;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-secondary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }

  @media (max-width: 1080px) {
    .dashboard-grid { grid-template-columns: 1fr; }
    .quick-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 720px) {
    .dashboard-hero { grid-template-columns: 1fr; }
    .hero-actions { justify-content: stretch; }
    .hero-actions button { width: 100%; justify-content: center; }
    .quick-grid { grid-template-columns: 1fr; }
  }
`;

const IconLogoMark = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/>
  </svg>
);
const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconPlane = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const IconSplit = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

const NAV_ITEMS = [
  { icon: <IconHome />, label: "Dashboard", active: true },
  { icon: <IconCalendar />, label: "Hangouts" },
  { icon: <IconUsers />, label: "My Crew" },
  { icon: <IconPlane />, label: "Trips" },
  { icon: <IconSplit />, label: "Bill Split" },
  { icon: <IconStar />, label: "Ratings" },
  { icon: <IconHeart />, label: "Debrief" },
];

const HANGOUTS = [];
const FRIENDS = [];
const ACTIVITY = [];

const AVATAR_COLORS = ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"];

const NAV_TARGETS = {
  "Dashboard": "dashboard",
  "Hangouts": "create-hangout",
  "My Crew": "friend-groups",
  "Trips": "trip-planning",
  "Bill Split": "bill-split",
  "Ratings": "rate-outing",
  "Debrief": "debrief",
};

export default function OutsidersDashboard({ onNavigate }) {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const handleNav = (label) => {
    setActiveNav(label);
    onNavigate?.(NAV_TARGETS[label] || "dashboard");
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        {/* ── Top Nav ── */}
        <nav className="top-nav">
          <div style={{ padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

            {/* Logo */}
            <button type="button" className="logo-link" onClick={() => onNavigate?.("dashboard")} aria-label="Go to home">
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </button>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => onNavigate?.("landing")}
                style={{ background: "#ffd93d", color: "#1a1a2e", border: "3px solid #1a1a2e", borderRadius: 10, padding: "8px 14px", fontFamily: "'Bangers', cursive", fontSize: 14, letterSpacing: "0.05em", cursor: "pointer", boxShadow: "3px 3px 0 #1a1a2e" }}
              >
                Log Out
              </button>
              {/* Notification bell */}
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => onNavigate?.("profile")}>
                <IconBell />
                <div className="notif-dot" />
              </div>

              {/* Profile chip */}
              <div className="profile-chip" onClick={() => onNavigate?.("profile")}>
                <div className="avatar" style={{ width: 30, height: 30, background: "#ff6b6b", fontSize: 11 }}>YOU</div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>You</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="layout">

          {/* ── Sidebar ── */}
          <aside className="sidebar">
            <p className="nav-section-label">Menu</p>
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`nav-item ${activeNav === item.label ? "active" : ""}`}
                onClick={() => handleNav(item.label)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}

            <div style={{ marginTop: "auto", paddingTop: 24 }}>
              <div style={{ background: "#fde8f0", border: "3px solid #ff6b9d", borderRadius: 12, padding: "14px", boxShadow: "4px 4px 0 #ff6b9d", textAlign: "center" }}>
                <p className="bangers" style={{ fontSize: 15, margin: "0 0 6px", color: "#1a1a2e" }}>Got beef? 👀</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#666", margin: "0 0 10px" }}>Start a debrief session with your crew.</p>
                <button style={{ width: "100%", background: "#ff6b9d", color: "#fff", border: "2px solid #1a1a2e", borderRadius: 8, padding: "8px", fontFamily: "'Bangers', cursive", fontSize: 14, letterSpacing: "0.04em", cursor: "pointer", boxShadow: "3px 3px 0 #1a1a2e" }} onClick={() => onNavigate?.("debrief")}>
                  Start Debrief
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="main">

            {/* Header */}
            <div className="dashboard-hero">
              <div>
                <span className="comic-tag">Command Center</span>
                <h1 className="bangers" style={{ fontSize: 38, margin: "8px 0 6px", color: "#1a1a2e" }}>
                  Welcome Back
                </h1>
                <p style={{ fontSize: 14, color: "#666", fontWeight: 800, margin: 0, maxWidth: 560 }}>
                  Plan the next hangout, jump into your crew, and keep trips, bills, ratings, and debriefs within reach.
                </p>
              </div>
              <div className="hero-actions">
                <button className="btn-secondary" onClick={() => onNavigate?.("friend-groups")}>
                  <IconUsers /> My Crew
                </button>
                <button className="btn-primary" onClick={() => onNavigate?.("create-hangout")}>
                  <IconPlus /> Create Hangout
                </button>
              </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="stats-grid">
              {[
                { icon: "🗓", label: "Upcoming Hangouts", value: "0", bg: "#fff4e6", border: "#ff9a3c" },
                { icon: "👥", label: "Crew Members", value: "0", bg: "#e8f4fd", border: "#4ecdc4" },
                { icon: "✈️", label: "Trips Planned", value: "0", bg: "#f3e8fd", border: "#9b59b6" },
                { icon: "💸", label: "Bills Pending", value: "$0", bg: "#fde8f0", border: "#ff6b9d" },
              ].map((s) => (
                <div key={s.label} className="stat-card" style={{ background: s.bg, borderColor: s.border, boxShadow: `5px 5px 0 ${s.border}` }}>
                  <div className="stat-icon" style={{ background: "#fff", borderColor: s.border, boxShadow: `3px 3px 0 ${s.border}` }}>{s.icon}</div>
                  <div>
                    <p className="bangers" style={{ fontSize: 26, margin: 0, color: "#1a1a2e", lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 12, margin: 0, color: "#666", fontWeight: 700 }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Two column grid ── */}
            <div className="dashboard-grid">

              {/* LEFT column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Upcoming Hangouts */}
                <div className="card">
                  <div className="section-header">
                    <h2 className="bangers" style={{ fontSize: 22, margin: 0 }}>Upcoming Hangouts 🗓</h2>
                    <button className="see-all" onClick={() => onNavigate?.("create-hangout")}>See All →</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {HANGOUTS.length === 0 ? (
                      <div className="empty-panel">
                        <p style={{ fontSize: 30, margin: "0 0 8px" }}>🗓</p>
                        <h3 className="bangers" style={{ fontSize: 22, margin: "0 0 8px", color: "#1a1a2e" }}>No hangouts yet</h3>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#666", margin: "0 0 14px" }}>Create one when you are ready to start planning.</p>
                        <button className="btn-primary" style={{ margin: "0 auto", justifyContent: "center" }} onClick={() => onNavigate?.("create-hangout")}>
                          <IconPlus /> Create Hangout
                        </button>
                      </div>
                    ) : HANGOUTS.map((h) => (
                      <div key={h.name} className="hangout-card" style={{ background: h.color, borderColor: h.borderColor, boxShadow: `5px 5px 0 ${h.borderColor}` }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                          <h3 className="bangers" style={{ fontSize: 18, margin: 0, color: "#1a1a2e" }}>{h.name}</h3>
                          <span className="badge" style={{ background: h.statusBg, color: h.statusColor, borderColor: h.statusColor }}>{h.status}</span>
                        </div>
                        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>📅 {h.date}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>⏰ {h.time}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>📍 {h.location}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", gap: -4 }}>
                            {h.members.map((m, i) => (
                              <div key={m} className="avatar-sm" style={{ background: AVATAR_COLORS[i], marginLeft: i > 0 ? -8 : 0, border: "2px solid #fff", zIndex: h.members.length - i }}>
                                {m}
                              </div>
                            ))}
                            <span style={{ fontSize: 12, fontWeight: 800, color: "#888", marginLeft: 8, alignSelf: "center" }}>{h.members.length} going</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 800, color: h.borderColor, cursor: "pointer" }}>View →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                  <div className="section-header">
                    <h2 className="bangers" style={{ fontSize: 22, margin: 0 }}>Quick Actions ⚡</h2>
                  </div>
                  <div className="quick-grid">
                    {[
                      { icon: "🎟", label: "Join Hangout" },
                      { icon: "👥", label: "Join Crew" },
                      { icon: "✈️", label: "Plan Trip" },
                      { icon: "💸", label: "Split Bill" },
                      { icon: "⭐", label: "Rate Outing" },
                    ].map((a) => (
                      <button
                        key={a.label}
                        className="quick-btn"
                        onClick={() => onNavigate?.({
                          "Join Hangout": "join-hangout",
                          "Join Crew": "friend-groups",
                          "Plan Trip": "trip-planning",
                          "Split Bill": "bill-split",
                          "Rate Outing": "rate-outing",
                        }[a.label])}
                      >
                        <span style={{ fontSize: 26 }}>{a.icon}</span>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* My Crew */}
                <div className="card">
                  <div className="section-header">
                    <h2 className="bangers" style={{ fontSize: 22, margin: 0 }}>My Crew 👥</h2>
                    <button className="see-all" onClick={() => onNavigate?.("friend-groups")}>See All →</button>
                  </div>
                  {FRIENDS.length === 0 ? (
                    <div className="empty-panel" style={{ padding: 16 }}>
                      <p style={{ fontSize: 26, margin: "0 0 8px" }}>👥</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: "#666", margin: "0 0 12px" }}>No crew members yet.</p>
                      <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => onNavigate?.("friend-groups")}>
                        Join Or Create Crew
                      </button>
                    </div>
                  ) : FRIENDS.map((f) => (
                    <div key={f.name} className="friend-item">
                      <div className="avatar" style={{ background: f.color }}>{f.initials}</div>
                      <div>
                        <p style={{ fontWeight: 900, fontSize: 14, margin: 0, color: "#1a1a2e" }}>{f.name}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#aaa", margin: 0 }}>{f.status}</p>
                      </div>
                    </div>
                  ))}
                  {FRIENDS.length > 0 && (
                    <button style={{ width: "100%", marginTop: 14, background: "#ffd93d", border: "3px solid #1a1a2e", borderRadius: 10, padding: "10px", fontFamily: "'Bangers', cursive", fontSize: 16, letterSpacing: "0.04em", cursor: "pointer", boxShadow: "4px 4px 0 #1a1a2e" }} onClick={() => onNavigate?.("friend-groups")}>
                      + Invite Friends
                    </button>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="card">
                  <div className="section-header">
                    <h2 className="bangers" style={{ fontSize: 22, margin: 0 }}>Activity 🔔</h2>
                  </div>
                  {ACTIVITY.length === 0 ? (
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#888", margin: 0 }}>Recent activity will appear here once people start using the app.</p>
                  ) : ACTIVITY.map((a, i) => (
                    <div key={i} className="activity-item">
                      <div className="activity-dot" style={{ background: a.color, borderColor: a.color }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#444", margin: 0 }}>{a.text}</p>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#bbb", margin: 0 }}>{a.time}</p>
                      </div>
                      <span style={{ fontSize: 18 }}>{a.emoji}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
