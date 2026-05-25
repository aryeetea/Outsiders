import { useMemo, useState } from "react";
import { getAllHangoutProposals } from "./appState";
import OutsidersSideNav from "./OutsidersSideNav";
import { isSupabaseConfigured, supabase } from "./supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { background: #f5f3ee; margin: 0; }
  .root { font-family: 'Nunito', sans-serif; background: #f5f3ee; color: #1a1a2e; min-height: 100vh; display: flex; flex-direction: column; }
  .root::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.03; pointer-events: none; z-index: 0; }
  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }
  .main { flex: 1; padding: 28px 32px; overflow-y: auto; }
  .rating-shell {
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
  .rating-shell::before {
    content: "";
    position: absolute;
    inset: 16px;
    border: 2px solid rgba(26, 26, 46, 0.08);
    border-radius: 22px;
    pointer-events: none;
  }
  .rating-hero {
    display: grid;
    justify-items: center;
    gap: 22px;
    text-align: center;
    margin-bottom: 34px;
    position: relative;
    z-index: 1;
    max-width: 980px;
    margin-left: auto;
    margin-right: auto;
  }
  .rating-kicker {
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
  .rating-title {
    margin: 0;
    font: 400 clamp(54px, 10vw, 110px) 'Bangers', cursive;
    line-height: 0.92;
    letter-spacing: 0.04em;
    color: #ff6b6b;
    text-shadow: 6px 0 0 #1a1a2e, 12px 0 0 rgba(255, 107, 107, 0.18);
  }
  .rating-title-star {
    display: inline-block;
    margin-left: 12px;
    transform: rotate(8deg) translateY(-4px);
  }
  .rating-subtitle-pill {
    position: relative;
    background: #fff;
    border: 5px solid #1a1a2e;
    border-radius: 999px;
    box-shadow: 6px 6px 0 #1a1a2e;
    padding: 16px 32px;
    font: 800 clamp(18px, 2vw, 28px) 'Nunito', sans-serif;
  }
  .rating-subtitle-pill::after {
    content: "";
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
  .rating-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0 18px;
    color: #888a95;
    font: 400 22px 'Bangers', cursive;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .rating-section-label::before {
    content: "▸";
    font-size: 18px;
  }
  .rating-empty-panel {
    background: rgba(255,255,255,0.84);
    border: 5px dashed #1a1a2e;
    border-radius: 24px;
    min-height: 380px;
    display: grid;
    place-items: center;
    padding: 48px 24px;
    position: relative;
    overflow: hidden;
  }
  .rating-empty-content {
    display: grid;
    justify-items: center;
    gap: 18px;
    text-align: center;
    max-width: 560px;
  }
  .rating-stamp {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #4ecdc4;
    border: 5px solid #1a1a2e;
    border-radius: 10px;
    box-shadow: 0 5px 0 #1a1a2e;
    padding: 14px 24px;
    transform: rotate(1.5deg);
    font: 400 20px 'Bangers', cursive;
    letter-spacing: 0.06em;
  }
  .rating-empty-title {
    margin: 0;
    font: 400 clamp(36px, 6vw, 62px) 'Bangers', cursive;
    line-height: 0.95;
    color: #1a1a2e;
  }
  .rating-empty-copy {
    margin: 0;
    font: 800 clamp(18px, 2.1vw, 28px) 'Nunito', sans-serif;
    line-height: 1.35;
    color: #5a5c66;
  }
  .rating-detail-layout { grid-template-columns: minmax(260px, 320px) minmax(0, 1fr); align-items: start; }
  .rating-column-card {
    background: rgba(255,255,255,0.72);
    border: 3px solid rgba(26, 26, 46, 0.14);
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 10px 24px rgba(26, 26, 46, 0.06);
  }
  .rating-column-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }
  .rating-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    border: 3px solid #1a1a2e;
    box-shadow: 3px 3px 0 #1a1a2e;
    font: 400 16px 'Bangers', cursive;
    letter-spacing: 0.06em;
    color: #1a1a2e;
  }
  .rating-list-stack { display: flex; flex-direction: column; gap: 14px; }
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
  .rating-layout-grid { grid-template-columns: minmax(240px, 280px) minmax(0, 1fr); }
  .rating-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 1024px) {
    .main { padding: 24px 20px; }
    .rating-detail-layout, .rating-summary-grid { grid-template-columns: 1fr; }
    .rating-shell { padding: 28px 22px 36px; }
  }
  @media (max-width: 640px) {
    .main { padding: 18px 14px; }
    .rating-shell { padding: 20px 16px 28px; }
    .rating-kicker { min-width: 0; width: 100%; }
    .rating-subtitle-pill { padding: 14px 20px; }
    .rating-empty-panel { padding: 34px 18px; min-height: 320px; }
  }
`;

const AVATAR_COLORS = ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"];
const MEMBERS = [
  { initials: "YOU", name: "You" },
];

const CATEGORY_SETS = {
  outing: [
    { key: "vibe", label: "Vibe", emoji: "✨" },
    { key: "location", label: "Location", emoji: "📍" },
    { key: "food", label: "Food & Drinks", emoji: "🍕" },
    { key: "crew", label: "The Crew", emoji: "👥" },
  ],
  trip: [
    { key: "stay", label: "Stay", emoji: "🛏️" },
    { key: "activities", label: "Activities", emoji: "🗺️" },
    { key: "budget", label: "Budget Flow", emoji: "💸" },
    { key: "crew", label: "Travel Crew", emoji: "👥" },
  ],
};

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

function normalizeRateableItems(appData) {
  const sharedHangouts = getAllHangoutProposals(appData?.groups || [], appData?.hangouts || []).map((hangout) => ({
    ...hangout,
    location: hangout.location || hangout.finalizedChoice?.location?.label || hangout.finalizedChoice?.location || "",
  }));

  const hangouts = sharedHangouts.map((hangout, index) => ({
    ...hangout,
    itemType: "outing",
    ratings: hangout.ratings || [],
    color: hangout.color || { bg: "#fff4e6", border: ["#ff9a3c", "#4ecdc4", "#ff6b9d", "#51cf66"][index % 4] },
    displayDate: hangout.date,
    displayLocation: hangout.location,
  }));

  const trips = (appData?.trips || []).map((trip, index) => ({
    ...trip,
    itemType: "trip",
    ratings: trip.ratings || [],
    color: trip.color || { bg: "#e8f4fd", border: ["#4ecdc4", "#a29bfe", "#ff6b6b", "#51cf66"][index % 4] },
    displayDate: `${trip.startDate} - ${trip.endDate}`,
    displayLocation: trip.destination,
  }));

  return [...hangouts, ...trips];
}

function getTypeCopy(itemType) {
  if (itemType === "trip") {
    return {
      tag: "Worth the trip? ✈️",
      title: "Rate The Trip ⭐",
      subtitle: "Figure out which getaways are worth repeating.",
      empty: "Finished trips will show up here for feedback.",
      listLabel: "Past Trips & Outings",
      thing: "trip",
    };
  }

  return {
    tag: "How was it? ⭐",
    title: "Rate The Outing ⭐",
    subtitle: "Keep score. Pick better spots next time.",
    empty: "Finished outings will show up here for feedback.",
    listLabel: "Past Trips & Outings",
    thing: "outing",
  };
}

function createEmptyRating(itemType) {
  const categories = CATEGORY_SETS[itemType] || CATEGORY_SETS.outing;
  return {
    overall: 0,
    categories: Object.fromEntries(categories.map((category) => [category.key, 0])),
    comment: "",
  };
}

export default function OutsidersRateOuting({ onNavigate, appData, setAppData }) {
  const outings = useMemo(() => normalizeRateableItems(appData), [appData]);
  const [activeTab, setActiveTab] = useState("Rate");
  const [selectedOuting, setSelectedOuting] = useState(() => outings[0] || null);
  const [rating, setRating] = useState(() => createEmptyRating(outings[0]?.itemType || "outing"));
  const [submitted, setSubmitted] = useState(false);
  const currentType = selectedOuting?.itemType || "outing";
  const categories = CATEGORY_SETS[currentType];
  const pageCopy = getTypeCopy(currentType);
  const alreadyRated = selectedOuting?.ratings.some(r => r.member === 0);
  const profileName = appData?.profile?.name || appData?.profile?.username || "You";

  const updateSelectedFromAppData = async (updatedItem) => {
    setSelectedOuting(updatedItem);
    if (updatedItem.itemType === "trip") {
      if (isSupabaseConfigured && updatedItem.id && !String(updatedItem.id).startsWith("trip-")) {
        await supabase
          .from("trips")
          .update({ ratings: updatedItem.ratings })
          .eq("id", updatedItem.id);
      }
      setAppData?.((prev) => ({
        ...prev,
        trips: prev.trips.map((trip) => trip.id === updatedItem.id ? { ...trip, ratings: updatedItem.ratings } : trip),
      }));
      return;
    }

    if (isSupabaseConfigured && updatedItem.groupId) {
      const targetGroup = (appData?.groups || []).find((group) => String(group.id) === String(updatedItem.groupId));
      const nextGroup = targetGroup
        ? {
            ...targetGroup,
            hangoutProposals: (targetGroup.hangoutProposals || []).map((hangout) => (
              hangout.id === updatedItem.id ? { ...hangout, ratings: updatedItem.ratings } : hangout
            )),
          }
        : null;
      if (nextGroup) {
        await supabase
          .from("groups")
          .update({ hangout_proposals: nextGroup.hangoutProposals })
          .eq("id", nextGroup.id);
      }
    }
    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((group) => (
        String(group.id) === String(updatedItem.groupId)
          ? {
              ...group,
              hangoutProposals: (group.hangoutProposals || []).map((hangout) => (
                hangout.id === updatedItem.id ? { ...hangout, ratings: updatedItem.ratings } : hangout
              )),
            }
          : group
      )),
      hangouts: (prev.hangouts || []).map((hangout) => hangout.id === updatedItem.id ? { ...hangout, ratings: updatedItem.ratings } : hangout),
    }));
  };

  const handleSubmit = async () => {
    if (rating.overall === 0) return;
    const newRating = { member: 0, overall: rating.overall, categories: rating.categories, comment: rating.comment };
    const updatedOuting = { ...selectedOuting, ratings: [...selectedOuting.ratings.filter(r => r.member !== 0), newRating] };
    await updateSelectedFromAppData(updatedOuting);
    setSubmitted(true);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav activeLabel="Ratings" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length} appData={appData} setAppData={setAppData}>
          <main className="main">
            <section className="rating-shell">
              <div className="rating-hero">
                <div className="rating-kicker">
                  <span>⭐</span>
                  <span>{currentType === "trip" ? "Trip Receipts" : "How Was It?"}</span>
                  <span>⭐</span>
                </div>
                <h1 className="rating-title">
                  {currentType === "trip" ? "Rate The Trip" : "Rate The Outing"}
                  <span className="rating-title-star">⭐</span>
                </h1>
                <div className="rating-subtitle-pill">{pageCopy.subtitle}</div>
              </div>

              <div className="rating-section-label">{pageCopy.listLabel}</div>

              {outings.length === 0 ? (
                <div className="rating-empty-panel">
                  <div className="rating-empty-content">
                    <div className="rating-stamp">📝 Nothing Filed!</div>
                    <h2 className="rating-empty-title">Nothing To Rate Yet</h2>
                    <p className="rating-empty-copy">
                      Finished hangouts and trips will show up here.
                      <br />
                      Then the crew can leave the real feedback.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rating-detail-layout" style={{ display: "grid", gap: 24 }}>
                  <div className="rating-column-card">
                    <div className="rating-column-title">
                      <div>
                        <p className="bangers" style={{ fontSize: 22, margin: 0, color: "#1a1a2e" }}>Scoreboard</p>
                        <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 800, color: "#7b7e87" }}>Pick a past plan to rate or review.</p>
                      </div>
                      <span className="rating-count-badge">{outings.length}</span>
                    </div>
                    <div className="rating-list-stack">
                      {outings.map(o => {
                        const avg = avgRating(o);
                        const myRating = o.ratings.find(r => r.member === 0);
                        return (
                          <div key={o.id} onClick={() => { setSelectedOuting(o); setRating(createEmptyRating(o.itemType)); setSubmitted(false); setActiveTab("Rate"); }} style={{ background: selectedOuting?.id === o.id ? o.color.bg || o.color : "#fff", border: `3px solid ${selectedOuting?.id === o.id ? o.color.border || o.border : "#1a1a2e"}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer", boxShadow: `5px 5px 0 ${selectedOuting?.id === o.id ? o.color.border || o.border : "#1a1a2e"}`, transition: "all 0.15s" }}>
                            <p className="bangers" style={{ fontSize: 16, margin: "0 0 4px", color: "#1a1a2e" }}>{o.name}</p>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#888", margin: "0 0 8px" }}>
                              {o.itemType === "trip" ? "✈️ Trip" : "🎉 Outing"} · 📅 {o.displayDate} · 📍 {o.displayLocation}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span className="bangers" style={{ fontSize: 18, color: o.color.border || o.border }}>⭐ {avg > 0 ? avg : "—"}/10</span>
                              {myRating
                                ? <span className="badge" style={{ background: "#e8fde8", color: "#51cf66", borderColor: "#51cf66" }}>✓ Rated</span>
                                : <span className="badge" style={{ background: "#fff4e6", color: "#ff9a3c", borderColor: "#ff9a3c" }}>Rate it</span>
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedOuting && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div>
                          <p className="bangers" style={{ fontSize: 26, margin: 0, color: "#1a1a2e" }}>Selected Review</p>
                          <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 800, color: "#7b7e87" }}>Crew reactions, scores, and comments all live here.</p>
                        </div>
                        <span className="badge" style={{ background: "#fff", color: "#1a1a2e", borderColor: "#1a1a2e" }}>{selectedOuting.itemType === "trip" ? "Trip" : "Outing"}</span>
                      </div>

                  {/* Header */}
                  <div className="card" style={{ background: selectedOuting.color.bg || selectedOuting.color, borderColor: selectedOuting.color.border || selectedOuting.border, boxShadow: `5px 5px 0 ${selectedOuting.color.border || selectedOuting.border}` }}>
                    <h2 className="bangers" style={{ fontSize: 26, margin: "0 0 4px" }}>{selectedOuting.name}</h2>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#666", margin: "0 0 12px" }}>
                      {selectedOuting.itemType === "trip" ? "✈️ Trip" : "🎉 Outing"} · 📅 {selectedOuting.displayDate} · 📍 {selectedOuting.displayLocation}
                    </p>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ background: "#fff", border: `3px solid ${selectedOuting.color.border || selectedOuting.border}`, borderRadius: 10, padding: "10px 16px", boxShadow: `3px 3px 0 ${selectedOuting.color.border || selectedOuting.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#888", margin: "0 0 2px" }}>AVG RATING</p>
                        <p className="bangers" style={{ fontSize: 26, margin: 0, color: selectedOuting.color.border || selectedOuting.border }}>⭐ {avgRating(selectedOuting) || "—"}/10</p>
                      </div>
                      <div style={{ background: "#fff", border: `3px solid ${selectedOuting.color.border || selectedOuting.border}`, borderRadius: 10, padding: "10px 16px", boxShadow: `3px 3px 0 ${selectedOuting.color.border || selectedOuting.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#888", margin: "0 0 2px" }}>RATINGS IN</p>
                        <p className="bangers" style={{ fontSize: 26, margin: 0, color: selectedOuting.color.border || selectedOuting.border }}>{selectedOuting.ratings.length}/4</p>
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
                          <p className="bangers" style={{ fontSize: 22, margin: "0 0 4px" }}>You already rated this {pageCopy.thing}!</p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#888", margin: 0 }}>Check "All Ratings" to see what the crew thought.</p>
                        </div>
                      ) : submitted ? (
                        <div className="card" style={{ textAlign: "center", background: "#e8fde8", borderColor: "#51cf66", boxShadow: "5px 5px 0 #51cf66" }}>
                          <p style={{ fontSize: 48, margin: "0 0 8px" }}>🎉</p>
                          <p className="bangers" style={{ fontSize: 26, margin: "0 0 4px", color: "#1a1a2e" }}>Rating submitted!</p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#555", margin: 0 }}>You gave this {pageCopy.thing} a {rating.overall}/10. The crew can see your thoughts.</p>
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
                          <div className="rating-summary-grid" style={{ display: "grid", gap: 14 }}>
                            {categories.map(cat => (
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
                            <textarea className="form-input" rows={3} placeholder={selectedOuting.itemType === "trip" ? "How did the whole trip really go?" : "How was the outing really? Be honest..."} value={rating.comment} onChange={e => setRating(p => ({ ...p, comment: e.target.value }))} />
                          </div>

                          <button className="btn-primary" onClick={handleSubmit} style={{ opacity: rating.overall === 0 ? 0.5 : 1 }}>
                            Submit {selectedOuting.itemType === "trip" ? "Trip" : "Outing"} Rating ⭐
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
                            {CATEGORY_SETS[selectedOuting.itemType || "outing"].map(cat => (
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
              )}
            </section>
          </main>
        </OutsidersSideNav>
      </div>
    </>
  );
}
