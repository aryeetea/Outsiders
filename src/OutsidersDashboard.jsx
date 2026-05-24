import OutsidersSideNav from "./OutsidersSideNav";

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
    grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
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
  }
`;

const QUICK_ACTIONS = [
  ["Create proposal", "create-hangout", "Pitch a time, place, and vibe for your crew."],
  ["My crew", "friend-groups", "See proposal voting, roast boards, and invites."],
  ["Join hangout", "join-hangout", "Use a code to hop into an invite."],
  ["Availability", "profile", "Update your weekly sheet before plans move."],
];

function leadingChoice(options = [], votes = {}) {
  const counts = options.map((option) => ({
    id: option.id,
    label: option.label,
    count: Object.values(votes).filter((value) => value === option.id).length,
  }));
  return counts.sort((a, b) => b.count - a.count)[0] || null;
}

export default function OutsidersDashboard({ onNavigate, appData }) {
  const groups = appData?.groups || [];
  const proposals = groups.flatMap((group) => (group.hangoutProposals || []).map((proposal) => ({ ...proposal, groupName: group.name })));
  const notifications = appData?.notifications || [];
  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const profile = appData?.profile || {};
  const displayName = profile.name || profile.username || "You";
  const profileName = displayName;

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash-root">
        <OutsidersSideNav activeLabel="Dashboard" onNavigate={onNavigate} profileName={profileName}>
        <div className="dash-shell">
          <section className="glass hero">
            <div className="hero-grid">
              <div>
                <div className="comic-kicker">Welcome Back</div>
                <h1 className="bangers" style={{ margin: "14px 0 10px", fontSize: 46, lineHeight: 1 }}>Plan the next move for {displayName} and the crew.</h1>
                <p style={{ margin: 0, maxWidth: 720, color: "#556077", fontSize: 16, lineHeight: 1.6 }}>
                  Proposal voting, availability-aware planning, crew invites, notifications, and the roast board all now live inside your crew spaces where they belong.
                </p>
              </div>
              <div className="cta-stack">
                <button type="button" className="cta-btn primary" onClick={() => onNavigate?.("create-hangout")}>Create a hangout proposal</button>
                <button type="button" className="cta-btn secondary" onClick={() => onNavigate?.("friend-groups")}>Open my crew</button>
              </div>
            </div>
          </section>

          <section className="stats-grid">
            {[
              ["Live proposals", proposals.length, "#ff8f7a"],
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

          <section className="content-grid">
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                <div>
                  <h2 className="section-title">Crew Proposals</h2>
                  <p style={{ margin: 0, color: "#667085" }}>Every active proposal across your crews.</p>
                </div>
                <button type="button" className="chip-btn" onClick={() => onNavigate?.("friend-groups")}>Manage in crew</button>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {proposals.length ? proposals.map((proposal) => {
                  const topTime = leadingChoice(proposal.timeOptions, proposal.votes?.time);
                  const topLocation = leadingChoice(proposal.locationOptions, proposal.votes?.location);
                  return (
                    <div key={proposal.id} className="proposal-card">
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                        <div>
                          <strong className="bangers" style={{ display: "block", fontSize: 20 }}>{proposal.name}</strong>
                          <span style={{ color: "#667085", fontWeight: 700 }}>{proposal.groupName} · proposed by {proposal.proposerName}</span>
                        </div>
                        <span className="status-chip" style={{ background: proposal.status === "finalized" ? "#eefdf5" : "#fff5e6", color: proposal.status === "finalized" ? "#0f766e" : "#9a6700" }}>
                          {proposal.status}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 10px", color: "#475467" }}>{proposal.description || "No description added yet."}</p>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span className="chip-btn" style={{ cursor: "default" }}>Top time: {topTime?.label || "No votes yet"}</span>
                        <span className="chip-btn" style={{ cursor: "default" }}>Top place: {topLocation?.label || "No votes yet"}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="proposal-card">
                    <strong>No proposals yet.</strong>
                    <p style={{ margin: "8px 0 0", color: "#667085" }}>Create a hangout proposal to start crew voting.</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div className="card">
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

              <div className="card">
                <h2 className="section-title" style={{ marginBottom: 14 }}>Notifications</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {notifications.length ? notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="note-card" style={{ opacity: notification.read ? 0.7 : 1 }}>
                      <strong>{notification.message}</strong>
                      <p style={{ margin: "8px 0 0", color: "#667085" }}>{notification.groupName ? `${notification.groupName} · ` : ""}{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                  )) : (
                    <div className="note-card">
                      <strong>No activity yet.</strong>
                      <p style={{ margin: "8px 0 0", color: "#667085" }}>Hangout proposal alerts will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
        </OutsidersSideNav>
      </div>
    </>
  );
}
