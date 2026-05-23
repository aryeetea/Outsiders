const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Sora:wght@600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #f6f3eb; }
  .dash-root {
    min-height: 100vh;
    font-family: 'Space Grotesk', sans-serif;
    color: #1d2238;
    background:
      radial-gradient(circle at top left, rgba(255, 122, 107, 0.18), transparent 25%),
      radial-gradient(circle at top right, rgba(123, 214, 255, 0.2), transparent 22%),
      linear-gradient(180deg, #fff9ef 0%, #f7f3eb 100%);
  }
  .dash-shell {
    max-width: 1320px;
    margin: 0 auto;
    padding: 24px 20px 48px;
    display: grid;
    gap: 24px;
  }
  .glass, .card {
    border: 1px solid rgba(29,34,56,0.1);
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(18px);
    box-shadow: 0 20px 52px rgba(29,34,56,0.08);
  }
  .glass {
    border-radius: 28px;
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
    color: #1d2238;
  }
  .logo {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: linear-gradient(135deg, #ff7a6b, #ffb36c);
    display: grid;
    place-items: center;
    box-shadow: 0 12px 24px rgba(255,122,107,0.28);
  }
  .chip-btn {
    border: 1px solid rgba(29,34,56,0.12);
    background: rgba(255,255,255,0.88);
    color: #475467;
    padding: 10px 14px;
    border-radius: 999px;
    cursor: pointer;
    font: 700 13px 'Space Grotesk', sans-serif;
  }
  .chip-btn:hover, .quick-btn:hover, .cta-btn:hover {
    transform: translateY(-2px);
  }
  .hero {
    border-radius: 34px;
    padding: 28px;
    background:
      radial-gradient(circle at right top, rgba(123,214,255,0.18), transparent 28%),
      linear-gradient(135deg, #fffef9, #fff5e5 52%, #eef9ff 100%);
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
    border: none;
    border-radius: 22px;
    padding: 14px 16px;
    cursor: pointer;
    font: 700 15px 'Space Grotesk', sans-serif;
    text-align: left;
  }
  .cta-btn.primary {
    background: linear-gradient(135deg, #ff7a6b, #ff9671);
    color: white;
    box-shadow: 0 18px 32px rgba(255,122,107,0.28);
  }
  .cta-btn.secondary {
    background: linear-gradient(135deg, #72d8ff, #8bf0c4);
    color: #093344;
    box-shadow: 0 18px 32px rgba(114,216,255,0.24);
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
    border-radius: 28px;
    padding: 22px;
  }
  .proposal-card, .note-card {
    border-radius: 22px;
    padding: 16px;
    background: rgba(255,255,255,0.88);
    border: 1px solid rgba(29,34,56,0.08);
  }
  .proposal-card {
    animation: fadeSlide 300ms ease both;
  }
  .quick-btn {
    background: rgba(255,255,255,0.88);
    border: 1px solid rgba(29,34,56,0.08);
    min-height: 112px;
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

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash-root">
        <div className="dash-shell">
          <div className="glass">
            <button type="button" className="brand-btn" onClick={() => onNavigate?.("dashboard")}>
              <div className="logo">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>
              </div>
              <div>
                <div style={{ font: "800 22px 'Sora', sans-serif" }}>Outsiders</div>
                <div style={{ fontSize: 12, color: "#7a8294" }}>Command center</div>
              </div>
            </button>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="chip-btn" onClick={() => onNavigate?.("profile")}>{unreadNotifications.length} notifications</button>
              <button type="button" className="chip-btn" onClick={() => onNavigate?.("friend-groups")}>{groups.length} crews</button>
              <button type="button" className="chip-btn" onClick={() => onNavigate?.("landing")}>Log out</button>
            </div>
          </div>

          <section className="glass hero">
            <div className="hero-grid">
              <div>
                <div style={{ display: "inline-flex", padding: "8px 12px", borderRadius: 999, background: "#fff0c2", color: "#7b4e12", fontWeight: 700 }}>Welcome back</div>
                <h1 style={{ margin: "14px 0 10px", font: "800 42px 'Sora', sans-serif", lineHeight: 1.06 }}>Plan the next move for {displayName} and the crew.</h1>
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
                <div style={{ font: "800 34px 'Sora', sans-serif" }}>{value}</div>
                <div style={{ color: "#667085", fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </section>

          <section className="content-grid">
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ margin: "0 0 6px", font: "800 26px 'Sora', sans-serif" }}>Crew proposals</h2>
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
                          <strong style={{ display: "block", fontSize: 18 }}>{proposal.name}</strong>
                          <span style={{ color: "#667085", fontWeight: 700 }}>{proposal.groupName} · proposed by {proposal.proposerName}</span>
                        </div>
                        <span style={{ borderRadius: 999, padding: "8px 12px", background: proposal.status === "finalized" ? "#eefdf5" : "#fff5e6", color: proposal.status === "finalized" ? "#0f766e" : "#9a6700", fontWeight: 700 }}>
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
                <h2 style={{ margin: "0 0 14px", font: "800 24px 'Sora', sans-serif" }}>Quick actions</h2>
                <div className="quick-grid">
                  {QUICK_ACTIONS.map(([label, target, description]) => (
                    <button key={label} type="button" className="quick-btn" onClick={() => onNavigate?.(target)}>
                      <strong style={{ display: "block", marginBottom: 6 }}>{label}</strong>
                      <span style={{ color: "#667085", lineHeight: 1.5 }}>{description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 style={{ margin: "0 0 14px", font: "800 24px 'Sora', sans-serif" }}>Notifications</h2>
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
      </div>
    </>
  );
}
