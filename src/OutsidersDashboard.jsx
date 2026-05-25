import { getAllHangoutProposals, getCurrentUserKey, getDisplayName, getVisibleGroupsForProfile, isProfileMemberOfGroup } from "./appState";
import OutsidersSideNav from "./OutsidersSideNav";
import { isSupabaseConfigured, supabase } from "./supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f1dd; }
  .dash-root {
    min-height: 100vh;
    font-family: 'Nunito', sans-serif;
    color: #17151f;
    background: #fff6d8;
    position: relative;
  }
  .dash-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background: transparent;
    pointer-events: none;
    z-index: 0;
  }
  .dash-shell {
    max-width: 1320px;
    margin: 0 auto;
    padding: 24px 20px 48px;
    display: grid;
    gap: 24px;
    position: relative;
    z-index: 1;
  }
  .dashboard-board {
    background:
      radial-gradient(circle, rgba(201, 179, 104, 0.45) 1.4px, transparent 1.5px),
      linear-gradient(180deg, #fff9ea 0%, #fff4d6 100%);
    background-size: 36px 36px, 100% 100%;
    border: 5px solid #17151f;
    border-radius: 28px;
    box-shadow: 0 0 0 4px rgba(255,255,255,0.45) inset;
    padding: 36px 34px 42px;
    position: relative;
    overflow: hidden;
  }
  .dashboard-board::before {
    content: '';
    position: absolute;
    inset: 16px;
    border: 2px solid rgba(23, 21, 31, 0.08);
    border-radius: 22px;
    pointer-events: none;
  }
  .dashboard-hero {
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
  .dashboard-kicker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    min-width: min(100%, 340px);
    padding: 12px 24px;
    background: #ffd54d;
    border: 5px solid #17151f;
    border-radius: 12px;
    box-shadow: 0 6px 0 #17151f;
    transform: rotate(-1.5deg);
    font: 400 clamp(18px, 2.2vw, 28px) 'Bangers', cursive;
    letter-spacing: 0.08em;
  }
  .dashboard-title {
    margin: 0;
    font: 400 clamp(52px, 9vw, 96px) 'Bangers', cursive;
    line-height: 0.92;
    letter-spacing: 0.05em;
    color: #ff6b6b;
    text-shadow: 6px 0 0 #17151f, 12px 0 0 rgba(255, 107, 107, 0.18);
  }
  .dashboard-subtitle {
    position: relative;
    background: #fff;
    border: 5px solid #17151f;
    border-radius: 999px;
    box-shadow: 6px 6px 0 #17151f;
    padding: 16px 32px;
    font: 800 clamp(18px, 2vw, 26px) 'Nunito', sans-serif;
  }
  .dashboard-subtitle::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -16px;
    width: 24px;
    height: 24px;
    background: #fff;
    border-right: 5px solid #17151f;
    border-bottom: 5px solid #17151f;
    transform: translateX(-50%) rotate(45deg);
  }
  .dashboard-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .dashboard-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0 18px;
    color: #888a95;
    font: 400 22px 'Bangers', cursive;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .dashboard-section-label::before {
    content: "▸";
    font-size: 18px;
  }
  .dashboard-column-card {
    background: rgba(255,255,255,0.72);
    border: 3px solid rgba(23, 21, 31, 0.14);
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 10px 24px rgba(23,21,31,0.06);
  }
  .dashboard-main-card {
    background: rgba(255,255,255,0.72);
    border: 3px solid rgba(23, 21, 31, 0.14);
    border-radius: 22px;
    padding: 22px;
    box-shadow: 0 10px 24px rgba(23,21,31,0.06);
    display: grid;
    gap: 18px;
  }
  .dashboard-main-section {
    display: grid;
    gap: 12px;
  }
  .dashboard-main-divider {
    height: 3px;
    border-radius: 999px;
    background: rgba(23, 21, 31, 0.08);
  }
  .glass, .card {
    border: 4px solid #17151f;
    background: #fffdf7;
    box-shadow: 8px 8px 0 #17151f;
    position: relative;
    overflow: hidden;
  }
  .glass::before, .card::before, .proposal-card::before, .note-card::before, .quick-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: transparent;
    pointer-events: none;
  }
  .glass {
    border-radius: 22px;
    padding: 18px 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .brand-btn, .quick-btn, .cta-btn, .chip-btn {
    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }
  .brand-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    border: none;
    background: none;
    cursor: pointer;
    color: #17151f;
    position: relative;
    z-index: 1;
  }
  .logo {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: #ff7a59;
    border: 3px solid #17151f;
    display: grid;
    place-items: center;
    box-shadow: 4px 4px 0 #17151f;
    transform: rotate(-7deg);
  }
  .chip-btn {
    border: 3px solid #17151f;
    background: #fff3c8;
    color: #17151f;
    padding: 10px 14px;
    border-radius: 999px;
    cursor: pointer;
    font: 400 14px 'Bangers', cursive;
    letter-spacing: 0.06em;
    box-shadow: 3px 3px 0 #17151f;
    position: relative;
    z-index: 1;
  }
  .chip-btn:hover, .quick-btn:hover, .cta-btn:hover {
    transform: translate(-1px, -2px);
  }
  .hero {
    border-radius: 24px;
    padding: 30px;
    background: #fff2a6;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 22px;
    align-items: stretch;
  }
  .cta-stack {
    display: grid;
    gap: 12px;
    align-content: start;
  }
  .cta-btn, .quick-btn {
    border: 3px solid #17151f;
    border-radius: 18px;
    padding: 14px 16px;
    cursor: pointer;
    font: 400 15px 'Bangers', cursive;
    letter-spacing: 0.05em;
    text-align: left;
    box-shadow: 4px 4px 0 #17151f;
    position: relative;
    z-index: 1;
  }
  .cta-btn.primary {
    background: #ff6b6b;
    color: white;
  }
  .cta-btn.secondary {
    background: #72d8ff;
    color: #093344;
  }
  .stats-grid, .content-grid, .quick-grid {
    display: grid;
    gap: 16px;
  }
  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .content-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .card {
    border-radius: 22px;
    padding: 22px;
  }
  .proposal-card, .note-card {
    border-radius: 18px;
    padding: 16px;
    background: #fff8ea;
    border: 3px solid #17151f;
    box-shadow: 5px 5px 0 #17151f;
    position: relative;
    overflow: hidden;
  }
  .proposal-card {
    animation: fadeSlide 300ms ease both;
  }
  .vote-inline-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 12px;
  }
  .vote-inline-panel {
    display: grid;
    gap: 8px;
    padding: 12px;
    border-radius: 14px;
    border: 3px solid #17151f;
    background: #fffdf7;
    box-shadow: 4px 4px 0 #17151f;
  }
  .vote-inline-btn {
    width: 100%;
    border: 3px solid #17151f;
    border-radius: 12px;
    background: #fff7e4;
    box-shadow: 3px 3px 0 #17151f;
    padding: 11px 12px;
    text-align: left;
    cursor: pointer;
    font: 800 14px 'Nunito', sans-serif;
    color: #17151f;
  }
  .vote-inline-btn.active {
    background: #eefdf5;
    border-color: #0f766e;
    box-shadow: 3px 3px 0 #0f766e;
  }
  .quick-btn {
    background: #fff5de;
    min-height: 112px;
  }
  .bangers {
    font-family: 'Bangers', cursive;
    letter-spacing: 0.04em;
  }
  .comic-kicker {
    display: inline-flex;
    padding: 6px 12px;
    border-radius: 10px;
    background: #ffd93d;
    color: #17151f;
    font: 400 15px 'Bangers', cursive;
    letter-spacing: 0.07em;
    border: 2px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    transform: rotate(-2deg);
  }
  .stat-number {
    font: 400 34px 'Bangers', cursive;
    letter-spacing: 0.05em;
  }
  .section-title {
    margin: 0 0 6px;
    font: 400 26px 'Bangers', cursive;
    letter-spacing: 0.05em;
  }
  .status-chip {
    border-radius: 999px;
    padding: 8px 12px;
    border: 3px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    font-weight: 900;
    background: #fff7da;
  }
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 1080px) {
    .hero-grid, .content-grid, .stats-grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 720px) {
    .dash-shell { padding: 16px 12px 36px; }
    .hero, .card, .glass { padding: 18px; border-radius: 24px; }
    .quick-grid { grid-template-columns: 1fr; }
    .vote-inline-grid { grid-template-columns: 1fr; }
    .dashboard-board { padding: 24px 18px 28px; }
    .dashboard-kicker { min-width: 0; width: 100%; }
  }
`;

const QUICK_ACTIONS = [
  ["Hangouts", "hangouts", "Review live crew hangouts in one shared space."],
  ["Start a hangout", "create-hangout", "Share a time, place, and vibe with your crew."],
  ["Create a crew", "create-crew", "Start a new crew or use a code to join one."],
  ["My crew", "friend-groups", "See hangout voting, roast boards, and invites."],
  ["Join hangout", "join-hangout", "Use a code to hop into an invite."],
  ["Availability", "profile", "Update your weekly sheet before plans move."],
];

export default function OutsidersDashboard({ onNavigate, appData, setAppData }) {
  const groups = appData?.groups || [];
  const storedHangouts = appData?.hangouts || [];
  const proposals = getAllHangoutProposals(groups, storedHangouts);
  const notifications = appData?.notifications || [];
  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const markNotificationRead = async (notificationId) => {
    if (isSupabaseConfigured) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
    }
    setAppData?.((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map((item) => (
        item.id === notificationId ? { ...item, read: true } : item
      )),
    }));
  };
  const profile = appData?.profile || {};
  const displayName = getDisplayName(profile);
  const profileName = displayName;
  const currentUserKey = getCurrentUserKey(profile);
  const myGroups = getVisibleGroupsForProfile(groups, profile);
  const myProposals = proposals.filter((proposal) => (
    proposal.proposerKey === currentUserKey
    || proposal.proposerName === displayName
    || (proposal.participants || []).some((participant) => isProfileMemberOfGroup({ members: [participant] }, profile))
  ));
  const needsMyVote = proposals.filter((proposal) => (
    proposal.status !== "finalized"
    && !Object.prototype.hasOwnProperty.call(proposal.votes?.time || {}, currentUserKey)
  ));
  const nextSteps = [
    unreadNotifications.length ? `You have ${unreadNotifications.length} unread update${unreadNotifications.length === 1 ? "" : "s"}.` : null,
    needsMyVote.length ? `${needsMyVote.length} hangout vote${needsMyVote.length === 1 ? "" : "s"} still need your input.` : null,
    !myGroups.length ? "Join or create a crew so your shared plans can start syncing." : null,
  ].filter(Boolean);

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash-root">
        <OutsidersSideNav activeLabel="Dashboard" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length} appData={appData} setAppData={setAppData}>
        <div className="dash-shell">
          <section className="dashboard-board">
          <div className="dashboard-hero">
            <div className="dashboard-kicker">
              <span>⚡</span>
              <span>Welcome Back</span>
              <span>⚡</span>
            </div>
            <h1 className="dashboard-title">Plan The Next Move.</h1>
            <div className="dashboard-subtitle">Keep {displayName}, the crew, and every next step in one comic-style home base.</div>
            <div className="dashboard-actions">
              <button type="button" className="cta-btn primary" onClick={() => onNavigate?.("create-hangout")}>Start a hangout</button>
              <button type="button" className="cta-btn secondary" onClick={() => onNavigate?.("create-crew")}>Create or join crew</button>
            </div>
          </div>

          <div className="dashboard-section-label">At A Glance</div>
          <section className="stats-grid">
            {[
              ["Live hangouts", proposals.length, "#ff8f7a"],
              ["Unread alerts", unreadNotifications.length, "#6ed7ff"],
              ["Crew members", groups.reduce((sum, group) => sum + (group.members?.length || 0), 0), "#73e2a7"],
              ["External invites", groups.reduce((sum, group) => sum + (group.hangoutProposals || []).reduce((count, proposal) => count + (proposal.externalInvites?.length || 0), 0), 0), "#ffcf6e"],
            ].map(([label, value, color]) => (
              <div key={label} className="card">
                <div style={{ width: 16, height: 16, borderRadius: 999, background: color, marginBottom: 14 }} />
                <div className="stat-number">{value}</div>
                <div style={{ color: "#667085", fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </section>

          <div className="dashboard-section-label">Crew Flow</div>
          <section className="content-grid">
            <div className="dashboard-main-card">
              <div className="dashboard-main-section">
                <h2 className="section-title" style={{ marginBottom: 14 }}>My Part</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  <div className="note-card">
                    <strong>Your crews</strong>
                    <p style={{ margin: "8px 0 0", color: "#667085" }}>{myGroups.length ? `${myGroups.length} crew${myGroups.length === 1 ? "" : "s"} connected to your profile.` : "You are not connected to a crew yet."}</p>
                  </div>
                  <div className="note-card">
                    <strong>Your hangouts</strong>
                    <p style={{ margin: "8px 0 0", color: "#667085" }}>{myProposals.length ? `${myProposals.length} hangout plan${myProposals.length === 1 ? "" : "s"} involve you right now.` : "No current hangout plans are tied to you yet."}</p>
                  </div>
                  <div className="note-card">
                    <strong>Your alerts</strong>
                    <p style={{ margin: "8px 0 0", color: "#667085" }}>{unreadNotifications.length ? `${unreadNotifications.length} unread alert${unreadNotifications.length === 1 ? "" : "s"} are waiting for you.` : "You are all caught up right now."}</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-main-divider" />

              <div className="dashboard-main-section">
                <h2 className="section-title" style={{ marginBottom: 14 }}>What Needs Me Next</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {nextSteps.length ? nextSteps.map((step) => (
                    <div key={step} className="note-card">
                      <strong>{step}</strong>
                    </div>
                  )) : (
                    <div className="note-card">
                      <strong>Nothing urgent right now.</strong>
                      <p style={{ margin: "8px 0 0", color: "#667085" }}>You are up to date, so you can start the next plan whenever you want.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-main-divider" />

              <div className="dashboard-main-section">
                <h2 className="section-title" style={{ marginBottom: 14 }}>Quick Actions</h2>
                <div className="quick-grid">
                  {QUICK_ACTIONS.map(([label, target, description]) => (
                    <button key={label} type="button" className="quick-btn" onClick={() => onNavigate?.(target)}>
                      <strong className="bangers" style={{ display: "block", marginBottom: 6, fontSize: 18 }}>{label}</strong>
                      <span style={{ color: "#667085", lineHeight: 1.5 }}>{description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="dashboard-main-divider" />

              <div className="dashboard-main-section">
                <h2 className="section-title" style={{ marginBottom: 14 }}>Notifications</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {notifications.length ? notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="note-card" style={{ opacity: notification.read ? 0.7 : 1 }}>
                      <strong>{notification.message}</strong>
                      <p style={{ margin: "8px 0 0", color: "#667085" }}>{notification.groupName ? `${notification.groupName} · ` : ""}{new Date(notification.createdAt).toLocaleString()}</p>
                      {notification.actionScreen ? (
                        <button
                          type="button"
                          className="chip-btn"
                          style={{ marginTop: 10 }}
                          onClick={async () => {
                            await markNotificationRead(notification.id);
                            onNavigate?.(notification.actionScreen, notification.actionParams || {});
                          }}
                        >
                          {notification.type === "hangout-invite" ? "Join hangout" : notification.type === "crew-invite" ? "Join crew" : "Open update"}
                        </button>
                      ) : null}
                    </div>
                  )) : (
                    <div className="note-card">
                      <strong>No activity yet.</strong>
                      <p style={{ margin: "8px 0 0", color: "#667085" }}>Hangout alerts will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
          </section>
        </div>
        </OutsidersSideNav>
      </div>
    </>
  );
}
