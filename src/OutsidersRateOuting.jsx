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
  .star-btn { background: none; border: none; cursor: pointer; font-size: 36px; transition: transform 0.15s; line-height: 1; padding: 4px; }
  .star-btn:hover { transform: scale(1.3); }
  .category-card { background: #fffdf9; border: 3px solid #1a1a2e; border-radius: 14px; padding: 18px 20px; box-shadow: 4px 4px 0 #1a1a2e; }
  .btn-primary { background: #ff6b6b; color: #fff; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 18px; padding: 12px 28px; display: inline-flex; align-items: center; gap: 8px; }
  .btn-primary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .form-input { width: 100%; padding: 12px 14px; font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 700; color: #1a1a2e; background: #fffdf9; border: 3px solid #1a1a2e; border-radius: 10px; outline: none; transition: box-shadow 0.15s, border-color 0.15s; box-shadow: 3px 3px 0 #1a1a2e; resize: none; }
  .form-input:focus { border-color: #ff6b6b; box-shadow: 3px 3px 0 #ff6b6b; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid #1a1a2e; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; color: #fff; flex-shrink: 0; box-shadow: 2px 2px 0 #1a1a2e; }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.05em; border: 2px solid; }
  .review-card { background: #fff; border: 3px solid #1a1a2e; border-radius: 14px; padding: 18px 20px; box-shadow: 4px 4px 0 #1a1a2e; margin-bottom: 14px; }
  .profile-chip { display: flex; align-items: center; gap: 8px; background: #fff; border: 3px solid #1a1a2e; border-radius: 50px; padding: 4px 14px 4px 4px; box-shadow: 3px 3px 0 #1a1a2e; cursor: pointer; }
  .notif-dot { width: 8px; height: 8px; background: #ff6b6b; border: 2px solid #1a1a2e; border-radius: 50%; position: absolute; top: -2px; right: -2px; }
  .comic-tag { display: inline-block; background: #ffd93d; border: 2px solid #1a1a2e; border-radius: 6px; padding: 1px 10px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.06em; box-shadow: 2px 2px 0 #1a1a2e; transform: rotate(-2deg); }
  .tab { padding: 9px 20px; font-family: 'Bangers', cursive; font-size: 16px; letter-spacing: 0.05em; border: 3px solid transparent; border-radius: 10px; cursor: pointer; background: none; color: #888; transition: all 0.15s; }
  .tab.active { background: #fff; color: #1a1a2e; border-color: #1a1a2e; box-shadow: 3px 3px 0 #1a1a2e; }
  @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
  .pop { animation: pop 0.3s ease; }
`;

const AVATAR_COLORS = ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"];
const MEMBERS = [
  { initials: "JD", name: "Jordan (You)" },
  { initials: "AL", name: "Alex" },
  { initials: "MK", name: "Maya" },
  { initials: "RB", name: "Ryan" },
];

const CATEGORIES = [
  { key: "vibe", label: "Vibe", emoji: "✨" },
  { key: "location", label: "Location", emoji: "📍" },
  { key: "food", label: "Food & Drinks", emoji: "🍕" },
  { key: "crew", label: "The Crew", emoji: "👥" },
];

const PAST_OUTINGS = [
  {
    id: 1, name: "Friday Night Out 🍕", date: "Jun 6", location: "Central Park, NY",
    ratings: [
      { member: 0, overall: 9, categories: { vibe: 9, location: 8, food: 10, crew: 10 }, comment: "One of the best nights this year honestly 🔥" },
      { member: 1, overall: 8, categories: { vibe: 8, location: 9, food: 8, crew: 9 }, comment: "Great spot, would go back!" },
      { member: 2, overall: 10, categories: { vibe: 10, location: 9, food: 10, crew: 10 }, comment: "PEAK. Need to do this again ASAP 🙌" },
    ],
    color: "#fff4e6", border: "#ff9a3c",
  },
  {
    id: 2, name: "Bowling Night 🎳", date: "May 24", location: "Bowlmor Times Square",
    ratings: [
      { member: 0, overall: 7, categories: { vibe: 7, location: 6, food: 7, crew: 9 }, comment: "Fun but too loud, couldn't hear anyone lol" },
      { member: 3, overall: 8, categories: { vibe: 8, location: 7, food: 6, crew: 10 }, comment: "The crew made it worth it" },
    ],
    color: "#e8f4fd", border: "#4ecdc4",
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

const NAV_ITEMS = [
  { icon: <IconHome />, label: "Dashboard" },
  { icon: <IconCalendar />, label: "Hangouts" },
  { icon: <IconUsers />, label: "My Crew" },
  { icon: <IconPlane />, label: "Trips" },
  { icon: <IconSplit />, label: "Bill Split" },
  { icon: <IconStar />, label: "Ratings" },
  { icon: <IconHeart />, label: "Debrief" },
];

function StarRating({ value, onChange, size = 36 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <button key={n} className="star-btn" style={{ fontSize: size * 0.7 }}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >
          {n <= (hovered || value) ? "⭐" : "☆"}
        </button>
      ))}
    </div>
  );
}

function avgRating(outing) {
  if (!outing.ratings.length) return 0;
  return Math.round((outing.ratings.reduce((s, r) => s + r.overall, 0) / outing.ratings.length) * 10) / 10;
}

const NAV_TARGETS = {
  "Dashboard": "dashboard",
  "Hangouts": "create-hangout",
  "My Crew": "friend-groups",
  "Trips": "trip-planning",
  "Bill Split": "bill-split",
  "Ratings": "rate-outing",
  "Debrief": "debrief",
};

export default function OutsidersRateOuting({ onNavigate }) {
  const [activeNav, setActiveNav] = useState("Ratings");
  const [activeTab, setActiveTab] = useState("Rate");
  const [outings, setOutings] = useState(PAST_OUTINGS);
  const [selectedOuting, setSelectedOuting] = useState(PAST_OUTINGS[0]);
  const [rating, setRating] = useState({ overall: 0, categories: { vibe: 0, location: 0, food: 0, crew: 0 }, comment: "" });
  const [submitted, setSubmitted] = useState(false);
  const handleNav = (label) => {
    setActiveNav(label);
    onNavigate?.(NAV_TARGETS[label] || "rate-outing");
  };

  const alreadyRated = selectedOuting?.ratings.some(r => r.member === 0);

  const handleSubmit = () => {
    if (rating.overall === 0) return;
    const newRating = { member: 0, overall: rating.overall, categories: rating.categories, comment: rating.comment };
    const updatedOuting = { ...selectedOuting, ratings: [...selectedOuting.ratings.filter(r => r.member !== 0), newRating] };
    setOutings(prev => prev.map(o => o.id === updatedOuting.id ? updatedOuting : o));
    setSelectedOuting(updatedOuting);
    setSubmitted(true);
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
            <div style={{ marginBottom: 24 }}>
              <span className="comic-tag">How was it? ⭐</span>
              <h1 className="bangers" style={{ fontSize: 34, margin: "6px 0 4px" }}>Rate The Outing ⭐</h1>
              <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Keep score. Pick better spots next time.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>

              {/* Outing list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p className="bangers" style={{ fontSize: 13, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Past Outings</p>
                {outings.map(o => {
                  const avg = avgRating(o);
                  const myRating = o.ratings.find(r => r.member === 0);
                  return (
                    <div key={o.id} onClick={() => { setSelectedOuting(o); setSubmitted(false); setActiveTab("Rate"); }} style={{ background: selectedOuting?.id === o.id ? o.color : "#fff", border: `3px solid ${selectedOuting?.id === o.id ? o.border : "#1a1a2e"}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer", boxShadow: `5px 5px 0 ${selectedOuting?.id === o.id ? o.border : "#1a1a2e"}`, transition: "all 0.15s" }}>
                      <p className="bangers" style={{ fontSize: 16, margin: "0 0 4px", color: "#1a1a2e" }}>{o.name}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#888", margin: "0 0 8px" }}>📅 {o.date} · 📍 {o.location}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span className="bangers" style={{ fontSize: 18, color: o.border }}>⭐ {avg > 0 ? avg : "—"}/10</span>
                        {myRating
                          ? <span className="badge" style={{ background: "#e8fde8", color: "#51cf66", borderColor: "#51cf66" }}>✓ Rated</span>
                          : <span className="badge" style={{ background: "#fff4e6", color: "#ff9a3c", borderColor: "#ff9a3c" }}>Rate it</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rating detail */}
              {selectedOuting && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* Header */}
                  <div className="card" style={{ background: selectedOuting.color, borderColor: selectedOuting.border, boxShadow: `5px 5px 0 ${selectedOuting.border}` }}>
                    <h2 className="bangers" style={{ fontSize: 26, margin: "0 0 4px" }}>{selectedOuting.name}</h2>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#666", margin: "0 0 12px" }}>📅 {selectedOuting.date} · 📍 {selectedOuting.location}</p>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ background: "#fff", border: `3px solid ${selectedOuting.border}`, borderRadius: 10, padding: "10px 16px", boxShadow: `3px 3px 0 ${selectedOuting.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#888", margin: "0 0 2px" }}>AVG RATING</p>
                        <p className="bangers" style={{ fontSize: 26, margin: 0, color: selectedOuting.border }}>⭐ {avgRating(selectedOuting) || "—"}/10</p>
                      </div>
                      <div style={{ background: "#fff", border: `3px solid ${selectedOuting.border}`, borderRadius: 10, padding: "10px 16px", boxShadow: `3px 3px 0 ${selectedOuting.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#888", margin: "0 0 2px" }}>RATINGS IN</p>
                        <p className="bangers" style={{ fontSize: 26, margin: 0, color: selectedOuting.border }}>{selectedOuting.ratings.length}/4</p>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 8, background: "#f5f3ee", padding: 6, borderRadius: 12, border: "3px solid #1a1a2e", width: "fit-content", boxShadow: "3px 3px 0 #1a1a2e" }}>
                    {["Rate", "All Ratings"].map(t => (
                      <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
                    ))}
                  </div>

                  {activeTab === "Rate" && (
                    <div>
                      {(alreadyRated && !submitted) ? (
                        <div className="card" style={{ textAlign: "center" }}>
                          <p style={{ fontSize: 36, margin: "0 0 8px" }}>✅</p>
                          <p className="bangers" style={{ fontSize: 22, margin: "0 0 4px" }}>You already rated this one!</p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#888", margin: 0 }}>Check "All Ratings" to see what the crew thought.</p>
                        </div>
                      ) : submitted ? (
                        <div className="card" style={{ textAlign: "center", background: "#e8fde8", borderColor: "#51cf66", boxShadow: "5px 5px 0 #51cf66" }}>
                          <p style={{ fontSize: 48, margin: "0 0 8px" }}>🎉</p>
                          <p className="bangers" style={{ fontSize: 26, margin: "0 0 4px", color: "#1a1a2e" }}>Rating submitted!</p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#555", margin: 0 }}>You gave it a {rating.overall}/10. The crew can see your thoughts.</p>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                          {/* Overall */}
                          <div className="card">
                            <p className="bangers" style={{ fontSize: 18, margin: "0 0 14px" }}>⭐ Overall Rating</p>
                            <StarRating value={rating.overall} onChange={v => setRating(p => ({ ...p, overall: v }))} />
                            {rating.overall > 0 && (
                              <p className="bangers" style={{ fontSize: 28, margin: "12px 0 0", color: rating.overall >= 8 ? "#51cf66" : rating.overall >= 5 ? "#ff9a3c" : "#ff6b6b" }}>
                                {rating.overall}/10 — {rating.overall >= 9 ? "ABSOLUTE BANGER 🔥" : rating.overall >= 7 ? "Pretty good 👍" : rating.overall >= 5 ? "It was okay 😐" : "Not great 😬"}
                              </p>
                            )}
                          </div>

                          {/* Category ratings */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            {CATEGORIES.map(cat => (
                              <div key={cat.key} className="category-card">
                                <p className="bangers" style={{ fontSize: 15, margin: "0 0 10px" }}>{cat.emoji} {cat.label}</p>
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                    <button key={n} onClick={() => setRating(p => ({ ...p, categories: { ...p.categories, [cat.key]: n } }))}
                                      style={{ width: 28, height: 28, border: `2px solid ${rating.categories[cat.key] >= n ? "#ff6b6b" : "#ddd"}`, borderRadius: 6, background: rating.categories[cat.key] >= n ? "#ff6b6b" : "#fff", color: rating.categories[cat.key] >= n ? "#fff" : "#aaa", cursor: "pointer", fontWeight: 900, fontSize: 11, transition: "all 0.1s" }}>
                                      {n}
                                    </button>
                                  ))}
                                </div>
                                {rating.categories[cat.key] > 0 && <p className="bangers" style={{ fontSize: 14, margin: "8px 0 0", color: "#ff6b6b" }}>{rating.categories[cat.key]}/10</p>}
                              </div>
                            ))}
                          </div>

                          {/* Comment */}
                          <div className="card">
                            <p className="bangers" style={{ fontSize: 18, margin: "0 0 12px" }}>💬 Leave a comment (optional)</p>
                            <textarea className="form-input" rows={3} placeholder="How was it really? Be honest..." value={rating.comment} onChange={e => setRating(p => ({ ...p, comment: e.target.value }))} />
                          </div>

                          <button className="btn-primary" onClick={handleSubmit} style={{ opacity: rating.overall === 0 ? 0.5 : 1 }}>
                            Submit Rating ⭐
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "All Ratings" && (
                    <div>
                      {selectedOuting.ratings.length === 0 ? (
                        <div className="card" style={{ textAlign: "center" }}>
                          <p style={{ fontSize: 32, margin: "0 0 8px" }}>😶</p>
                          <p className="bangers" style={{ fontSize: 18, color: "#aaa", margin: 0 }}>No ratings yet!</p>
                        </div>
                      ) : selectedOuting.ratings.map((r, i) => (
                        <div key={i} className="review-card">
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <div className="avatar" style={{ background: AVATAR_COLORS[r.member] }}>{MEMBERS[r.member].initials}</div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 900, fontSize: 14, margin: 0 }}>{MEMBERS[r.member].name}</p>
                            </div>
                            <span className="bangers" style={{ fontSize: 24, color: r.overall >= 8 ? "#51cf66" : r.overall >= 5 ? "#ff9a3c" : "#ff6b6b" }}>⭐ {r.overall}/10</span>
                          </div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                            {CATEGORIES.map(cat => (
                              <div key={cat.key} style={{ background: "#f5f3ee", border: "2px solid #e0dbd0", borderRadius: 8, padding: "4px 10px" }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: "#888" }}>{cat.emoji} {cat.label}: </span>
                                <span className="bangers" style={{ fontSize: 14, color: "#1a1a2e" }}>{r.categories[cat.key]}/10</span>
                              </div>
                            ))}
                          </div>
                          {r.comment && <p style={{ fontSize: 14, fontWeight: 700, color: "#555", margin: 0, fontStyle: "italic" }}>"{r.comment}"</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
