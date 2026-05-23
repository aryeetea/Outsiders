import { useEffect, useMemo, useState } from "react";
import { DEFAULT_PROFILE } from "./appState";
import { TIME_BLOCKS, WEEK_DAYS, availabilityToText, blocksToAvailability, formatTimeLabel, getAvailabilityBlockSet, hasAvailability } from "./scheduling";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Sora:wght@600;700;800&display=swap');

  * { box-sizing: border-box; }
  body { margin: 0; background: #f6f3eb; }

  .profile-root {
    min-height: 100vh;
    color: #1d2238;
    font-family: 'Space Grotesk', sans-serif;
    background:
      radial-gradient(circle at top left, rgba(255, 181, 138, 0.35), transparent 32%),
      radial-gradient(circle at top right, rgba(123, 214, 255, 0.28), transparent 26%),
      linear-gradient(180deg, #fff9ef 0%, #f7f3eb 100%);
  }

  .profile-shell {
    max-width: 1320px;
    margin: 0 auto;
    padding: 28px 20px 56px;
    display: grid;
    gap: 24px;
  }

  .topbar, .panel, .sheet-panel {
    border: 1px solid rgba(29, 34, 56, 0.12);
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(18px);
    box-shadow: 0 22px 60px rgba(29, 34, 56, 0.08);
  }

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 18px 22px;
  }

  .brand-btn, .nav-btn, .action-btn, .ghost-btn, .slot-chip {
    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;
  }

  .brand-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    border: none;
    background: none;
    cursor: pointer;
    color: #1d2238;
  }

  .logo-mark {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: linear-gradient(135deg, #ff7a6b, #ffb36c);
    box-shadow: 0 12px 22px rgba(255, 122, 107, 0.26);
    display: grid;
    place-items: center;
  }

  .nav-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .nav-btn {
    border: 1px solid rgba(29, 34, 56, 0.12);
    background: rgba(255, 255, 255, 0.85);
    color: #556077;
    padding: 10px 14px;
    border-radius: 999px;
    cursor: pointer;
    font: 700 13px 'Space Grotesk', sans-serif;
  }

  .nav-btn.active, .nav-btn:hover {
    background: #1d2238;
    color: white;
    transform: translateY(-1px);
  }

  .hero-grid {
    display: grid;
    grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
    gap: 24px;
  }

  .panel {
    padding: 24px;
  }

  .profile-card {
    background:
      linear-gradient(165deg, rgba(255,255,255,0.95), rgba(255,246,234,0.92)),
      linear-gradient(135deg, rgba(255,122,107,0.18), rgba(123,214,255,0.16));
  }

  .avatar-circle {
    width: 86px;
    height: 86px;
    border-radius: 28px;
    background: linear-gradient(135deg, #ff7a6b, #ffb36c);
    color: white;
    display: grid;
    place-items: center;
    font: 800 28px 'Sora', sans-serif;
    box-shadow: 0 16px 34px rgba(255, 122, 107, 0.28);
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255, 214, 153, 0.45);
    color: #7b4e12;
    font: 700 12px 'Space Grotesk', sans-serif;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 18px;
  }

  .stat-tile {
    padding: 14px;
    border-radius: 20px;
    background: rgba(255,255,255,0.84);
    border: 1px solid rgba(29, 34, 56, 0.08);
  }

  .stat-label {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 700;
    color: #7a8294;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .action-btn, .ghost-btn {
    border-radius: 18px;
    cursor: pointer;
    font: 700 14px 'Space Grotesk', sans-serif;
    padding: 13px 16px;
  }

  .action-btn {
    border: none;
    background: linear-gradient(135deg, #ff7a6b, #ff9671);
    color: white;
    box-shadow: 0 16px 30px rgba(255, 122, 107, 0.28);
  }

  .ghost-btn {
    border: 1px solid rgba(29, 34, 56, 0.12);
    background: rgba(255,255,255,0.72);
    color: #1d2238;
  }

  .action-btn:hover, .ghost-btn:hover, .slot-chip:hover {
    transform: translateY(-2px);
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .field {
    display: grid;
    gap: 8px;
  }

  .field label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #7a8294;
  }

  .field input, .field textarea {
    width: 100%;
    border: 1px solid rgba(29, 34, 56, 0.12);
    border-radius: 18px;
    padding: 13px 14px;
    background: rgba(255,255,255,0.9);
    color: #1d2238;
    font: 500 15px 'Space Grotesk', sans-serif;
    outline: none;
  }

  .field textarea {
    min-height: 112px;
    resize: vertical;
  }

  .sheet-panel {
    padding: 24px;
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgba(123,214,255,0.24), transparent 25%),
      radial-gradient(circle at top left, rgba(255,122,107,0.18), transparent 30%),
      rgba(255,255,255,0.88);
  }

  .sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 18px;
  }

  .sheet-frame {
    border-radius: 24px;
    border: 1px solid rgba(29, 34, 56, 0.12);
    overflow: auto;
    background: rgba(248, 250, 252, 0.9);
  }

  .sheet-grid {
    display: grid;
    grid-template-columns: 86px repeat(7, minmax(110px, 1fr));
    min-width: 900px;
  }

  .sheet-head, .time-cell, .slot-cell {
    border-right: 1px solid rgba(29, 34, 56, 0.08);
    border-bottom: 1px solid rgba(29, 34, 56, 0.08);
  }

  .sheet-head {
    position: sticky;
    top: 0;
    z-index: 2;
    background: rgba(255,255,255,0.95);
    padding: 14px 10px;
    text-align: center;
  }

  .sheet-head strong {
    display: block;
    font: 700 14px 'Sora', sans-serif;
  }

  .sheet-head span {
    font-size: 12px;
    color: #7a8294;
  }

  .time-cell {
    padding: 12px 10px;
    background: rgba(255,255,255,0.9);
    font-size: 12px;
    font-weight: 700;
    color: #7a8294;
    text-align: right;
  }

  .slot-cell {
    min-height: 40px;
    background: rgba(255,255,255,0.56);
    cursor: pointer;
    position: relative;
  }

  .slot-cell::after {
    content: "";
    position: absolute;
    inset: 6px;
    border-radius: 12px;
    transition: background 140ms ease, transform 140ms ease, box-shadow 140ms ease;
  }

  .slot-cell:hover::after {
    background: rgba(123, 214, 255, 0.18);
    transform: scale(0.97);
  }

  .slot-cell.active::after {
    background: linear-gradient(135deg, #7bd6ff, #56e0a0);
    box-shadow: inset 0 0 0 1px rgba(12, 80, 56, 0.12), 0 10px 18px rgba(86, 224, 160, 0.18);
  }

  .slot-cell.dragging::after {
    background: linear-gradient(135deg, #ffd58f, #ff8f7a);
  }

  .summary-row {
    margin-top: 18px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .slot-chip {
    border: 1px solid rgba(29, 34, 56, 0.12);
    background: rgba(255,255,255,0.92);
    border-radius: 999px;
    padding: 10px 12px;
    font: 700 13px 'Space Grotesk', sans-serif;
    color: #3d475d;
  }

  .notice-card {
    padding: 16px 18px;
    border-radius: 22px;
    background: linear-gradient(135deg, rgba(255, 243, 205, 0.92), rgba(255,255,255,0.9));
    border: 1px solid rgba(255, 174, 68, 0.28);
    color: #7b4e12;
  }

  .notif-list {
    display: grid;
    gap: 12px;
  }

  .notif-item {
    padding: 14px 16px;
    border-radius: 18px;
    background: rgba(255,255,255,0.88);
    border: 1px solid rgba(29, 34, 56, 0.08);
  }

  @media (max-width: 1080px) {
    .hero-grid, .details-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .topbar {
      align-items: flex-start;
      flex-direction: column;
    }
    .profile-grid {
      grid-template-columns: 1fr;
    }
    .profile-shell {
      padding: 16px 12px 40px;
    }
    .panel, .sheet-panel {
      padding: 18px;
      border-radius: 24px;
    }
  }
`;

const NAV_ITEMS = [
  ["Dashboard", "dashboard"],
  ["Hangouts", "create-hangout"],
  ["My Crew", "friend-groups"],
  ["Trips", "trip-planning"],
  ["Bill Split", "bill-split"],
  ["Ratings", "rate-outing"],
  ["Debrief", "debrief"],
];

function initialsFor(profile) {
  const seed = (profile?.name || profile?.username || "You").replace(/^@/, "").trim();
  return seed.slice(0, 2).toUpperCase() || "YO";
}

function weekSummary(availability) {
  const text = availabilityToText(availability);
  return text === "No availability saved" ? "No availability saved yet." : text;
}

export default function OutsidersProfile({ onNavigate, appData, setAppData }) {
  const profile = appData?.profile || DEFAULT_PROFILE;
  const notifications = appData?.notifications || [];
  const [draft, setDraft] = useState(() => profile);
  const [dragMode, setDragMode] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!dragMode) return undefined;
    const stopDrag = () => setDragMode(null);
    window.addEventListener("mouseup", stopDrag);
    return () => window.removeEventListener("mouseup", stopDrag);
  }, [dragMode]);

  const activeBlocks = useMemo(() => getAvailabilityBlockSet(draft.availability), [draft.availability]);
  const availabilitySummary = useMemo(() => weekSummary(draft.availability), [draft.availability]);
  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const availabilityReady = hasAvailability(draft.availability);

  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = () => {
    setAppData?.((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...draft,
      },
    }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const clearAvailability = () => {
    setDraft((prev) => ({ ...prev, availability: DEFAULT_PROFILE.availability }));
  };

  const toggleBlock = (day, time, forcedMode = null) => {
    const key = `${day}-${time}`;
    const blocks = new Set(activeBlocks);
    const shouldAdd = forcedMode ? forcedMode === "add" : !blocks.has(key);
    if (shouldAdd) blocks.add(key);
    else blocks.delete(key);
    setDraft((prev) => ({ ...prev, availability: blocksToAvailability(blocks) }));
  };

  const startDrag = (day, time) => {
    const key = `${day}-${time}`;
    const mode = activeBlocks.has(key) ? "remove" : "add";
    setDragMode(mode);
    toggleBlock(day, time, mode);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="profile-root">
        <div className="profile-shell">
          <div className="topbar">
            <button type="button" className="brand-btn" onClick={() => onNavigate?.("dashboard")}>
              <div className="logo-mark">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>
              </div>
              <div>
                <div style={{ font: "800 22px 'Sora', sans-serif" }}>Outsiders</div>
                <div style={{ fontSize: 12, color: "#7a8294" }}>Profile and availability</div>
              </div>
            </button>
            <div className="nav-row">
              {NAV_ITEMS.map(([label, target]) => (
                <button key={label} type="button" className={`nav-btn ${label === "Dashboard" ? "" : ""}`} onClick={() => onNavigate?.(target)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-grid">
            <section className="panel profile-card">
              <span className="eyebrow">{availabilityReady ? "Availability live" : "Availability missing"}</span>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 16 }}>
                <div className="avatar-circle">{initialsFor(draft)}</div>
                <div>
                  <h1 style={{ margin: "0 0 6px", font: "800 34px 'Sora', sans-serif" }}>{draft.name || "Set up your profile"}</h1>
                  <p style={{ margin: "0 0 8px", color: "#667085", fontWeight: 700 }}>
                    {draft.username ? `@${draft.username.replace(/^@/, "")}` : "Pick a username so your crew recognizes you."}
                  </p>
                  <p style={{ margin: 0, color: "#475467", lineHeight: 1.6 }}>
                    {draft.bio || "Tell the crew a little about yourself, then fill out the availability sheet so planning can work around your week."}
                  </p>
                </div>
              </div>

              <div className="profile-grid">
                <div className="stat-tile">
                  <p className="stat-label">Weekly summary</p>
                  <p style={{ margin: 0, fontWeight: 700, lineHeight: 1.5 }}>{availabilitySummary}</p>
                </div>
                <div className="stat-tile">
                  <p className="stat-label">Notifications</p>
                  <p style={{ margin: "0 0 4px", font: "800 28px 'Sora', sans-serif" }}>{unreadNotifications.length}</p>
                  <p style={{ margin: 0, color: "#667085", fontWeight: 700 }}>Unread crew updates</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                <button type="button" className="action-btn" onClick={saveProfile}>Save Profile</button>
                <button type="button" className="ghost-btn" onClick={() => onNavigate?.("friend-groups")}>Back To My Crew</button>
              </div>
              {saved ? <p style={{ margin: "14px 0 0", color: "#0f766e", fontWeight: 700 }}>Profile saved and availability updated.</p> : null}
            </section>

            <section className="panel">
              <div className="details-grid">
                <div className="field">
                  <label>Full Name</label>
                  <input value={draft.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Your name" />
                </div>
                <div className="field">
                  <label>Username</label>
                  <input value={draft.username} onChange={(event) => updateField("username", event.target.value.replace(/^@/, ""))} placeholder="yourhandle" />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input value={draft.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@example.com" />
                </div>
                <div className="field">
                  <label>Location</label>
                  <input value={draft.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Brooklyn, NY" />
                </div>
                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label>Bio</label>
                  <textarea value={draft.bio} onChange={(event) => updateField("bio", event.target.value)} placeholder="What kind of hangouts are you into?" />
                </div>
              </div>

              {!availabilityReady ? (
                <div className="notice-card" style={{ marginTop: 18 }}>
                  <strong style={{ display: "block", marginBottom: 6 }}>Your weekly availability is required.</strong>
                  <span>Tap or drag across the schedule below to mark when you are free. The rest of the app stays locked until this sheet is filled in.</span>
                </div>
              ) : null}
            </section>
          </div>

          <section className="sheet-panel">
            <div className="sheet-header">
              <div>
                <span className="eyebrow" style={{ background: "rgba(123, 214, 255, 0.18)", color: "#155e75" }}>Availability studio</span>
                <h2 style={{ margin: "12px 0 8px", font: "800 32px 'Sora', sans-serif" }}>Weekly availability sheet</h2>
                <p style={{ margin: 0, color: "#556077", maxWidth: 700, lineHeight: 1.6 }}>
                  Mark every half-hour block when you would realistically say yes to a crew plan. The more accurate this is, the better your hangout suggestions and proposal voting will be.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className="ghost-btn" onClick={clearAvailability}>Clear Sheet</button>
                <button type="button" className="action-btn" onClick={saveProfile}>Save Availability</button>
              </div>
            </div>

            <div className="sheet-frame">
              <div className="sheet-grid">
                <div className="sheet-head" />
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="sheet-head">
                    <strong>{day}</strong>
                    <span>{(getAvailabilityBlockSet(draft.availability).size > 0 && (draft.availability?.slots?.[day]?.length || 0) > 0) ? "Free time saved" : "Tap to mark"}</span>
                  </div>
                ))}

                {TIME_BLOCKS.map((time) => (
                  <FragmentRow
                    key={time}
                    time={time}
                    activeBlocks={activeBlocks}
                    dragMode={dragMode}
                    onMouseDown={startDrag}
                    onMouseEnter={(day) => {
                      if (!dragMode) return;
                      toggleBlock(day, time, dragMode);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="summary-row">
              <div className="slot-chip">Green blocks = available</div>
              <div className="slot-chip">Tap once for a single slot</div>
              <div className="slot-chip">Click and drag to fill a whole stretch</div>
              <div className="slot-chip">{availabilitySummary}</div>
            </div>
          </section>

          <section className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 6px", font: "800 24px 'Sora', sans-serif" }}>Crew notifications</h3>
                <p style={{ margin: 0, color: "#667085" }}>Proposal alerts and crew updates show up here.</p>
              </div>
              {unreadNotifications.length ? (
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setAppData?.((prev) => ({
                    ...prev,
                    notifications: prev.notifications.map((notification) => ({ ...notification, read: true })),
                  }))}
                >
                  Mark all read
                </button>
              ) : null}
            </div>
            <div className="notif-list">
              {notifications.length ? notifications.map((notification) => (
                <div key={notification.id} className="notif-item" style={{ opacity: notification.read ? 0.68 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <strong>{notification.message}</strong>
                    {!notification.read ? <span className="slot-chip" style={{ background: "#eefdf5", color: "#0f766e" }}>New</span> : null}
                  </div>
                  <p style={{ margin: "8px 0 0", color: "#667085", fontSize: 14 }}>
                    {notification.groupName ? `${notification.groupName} · ` : ""}{new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              )) : (
                <div className="notif-item">
                  <strong>No notifications yet.</strong>
                  <p style={{ margin: "8px 0 0", color: "#667085" }}>When someone proposes a hangout in one of your crews, it will show up here.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function FragmentRow({ time, activeBlocks, dragMode, onMouseDown, onMouseEnter }) {
  return (
    <>
      <div className="time-cell">{formatTimeLabel(time)}</div>
      {WEEK_DAYS.map((day) => {
        const key = `${day}-${time}`;
        return (
          <div
            key={key}
            className={`slot-cell ${activeBlocks.has(key) ? "active" : ""} ${dragMode ? "dragging" : ""}`}
            onMouseDown={() => onMouseDown(day, time)}
            onMouseEnter={() => onMouseEnter(day)}
            onClick={() => {
              if (!dragMode) onMouseDown(day, time);
            }}
          />
        );
      })}
    </>
  );
}
