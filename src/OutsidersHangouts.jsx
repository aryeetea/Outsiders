import { useMemo } from "react";
import OutsidersSideNav from "./OutsidersSideNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff5dd; }
  .root {
    min-height: 100vh;
    color: #17151f;
    font-family: 'Nunito', sans-serif;
    background: #fff5dd;
  }
  .shell {
    max-width: 1240px;
    margin: 0 auto;
    padding: 28px 20px 48px;
    display: grid;
    gap: 22px;
  }
  .hero, .card {
    border-radius: 24px;
    border: 4px solid #17151f;
    background: #fffdf7;
    box-shadow: 8px 8px 0 #17151f;
  }
  .hero {
    padding: 30px;
    background: #fff1a8;
    display: grid;
    gap: 12px;
  }
  .bangers {
    font-family: 'Bangers', cursive;
    letter-spacing: 0.04em;
  }
  .card {
    padding: 24px;
    display: grid;
    gap: 18px;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
  }
  .stat {
    border-radius: 16px;
    border: 3px solid #17151f;
    background: #fff7de;
    box-shadow: 4px 4px 0 #17151f;
    padding: 16px;
  }
  .section-divider {
    height: 3px;
    border-radius: 999px;
    background: rgba(23, 21, 31, 0.08);
  }
  .section-grid {
    display: grid;
    gap: 14px;
  }
  .proposal {
    border-radius: 16px;
    border: 3px solid #17151f;
    background: #fff8ea;
    box-shadow: 5px 5px 0 #17151f;
    padding: 18px;
    display: grid;
    gap: 12px;
  }
  .meta-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }
  .chip {
    border-radius: 999px;
    padding: 8px 12px;
    border: 3px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    font-weight: 900;
    background: #fff;
  }
  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .btn {
    border-radius: 12px;
    padding: 13px 16px;
    border: 3px solid #17151f;
    box-shadow: 4px 4px 0 #17151f;
    cursor: pointer;
    font: 400 15px 'Bangers', cursive;
    letter-spacing: 0.06em;
  }
  .btn.primary {
    background: #ff6b6b;
    color: #fff;
  }
  .btn.secondary {
    background: #ffd93d;
    color: #17151f;
  }
  .btn.ghost {
    background: #fff;
    color: #17151f;
  }
  .btn:hover {
    transform: translate(-1px, -2px);
  }
  @media (max-width: 720px) {
    .shell { padding: 18px 14px 36px; }
    .hero, .card { padding: 20px; border-radius: 22px; }
    .actions { grid-template-columns: 1fr; }
  }
`;

function leadingChoice(options = [], votes = {}) {
  const counts = options.map((option) => ({
    id: option.id,
    label: option.label,
    count: Object.values(votes || {}).filter((value) => value === option.id).length,
  }));
  return counts.sort((a, b) => b.count - a.count)[0] || null;
}

export default function OutsidersHangouts({ onNavigate, appData, setAppData }) {
  const groups = useMemo(() => appData?.groups || [], [appData?.groups]);
  const profileName = appData?.profile?.name || appData?.profile?.username || "You";
  const proposals = useMemo(
    () => groups.flatMap((group) => (group.hangoutProposals || []).map((proposal) => ({ ...proposal, groupName: group.name, groupId: group.id, groupEmoji: group.emoji }))),
    [groups]
  );
  const finalizedCount = proposals.filter((proposal) => proposal.status === "finalized").length;
  const pendingCount = proposals.filter((proposal) => proposal.status !== "finalized").length;

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav activeLabel="Hangouts" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length} appData={appData} setAppData={setAppData}>
          <div className="shell">
            <section className="hero">
              <div className="bangers" style={{ fontSize: 18 }}>Hangout HQ</div>
              <h1 className="bangers" style={{ margin: 0, fontSize: 50 }}>See every hangout in one place.</h1>
              <p style={{ margin: 0, color: "#555", fontWeight: 800, lineHeight: 1.6 }}>Track what is still being voted on, what is finalized, and jump into the right crew when it is time to manage details.</p>
              <div className="actions">
                <button type="button" className="btn primary" onClick={() => onNavigate?.("create-hangout")}>Create hangout</button>
                <button type="button" className="btn ghost" onClick={() => onNavigate?.("join-hangout")}>Join by code</button>
              </div>
            </section>

            <section className="card">
              <div>
                <h2 className="bangers" style={{ margin: "0 0 8px", fontSize: 28 }}>Overview</h2>
                <p style={{ margin: 0, color: "#667085", fontWeight: 700 }}>Your active crew hangouts are grouped here, while creation stays in its own screen.</p>
              </div>
              <div className="stats">
                <div className="stat">
                  <p className="bangers" style={{ fontSize: 15, margin: "0 0 6px" }}>Total hangouts</p>
                  <p style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>{proposals.length}</p>
                </div>
                <div className="stat" style={{ background: "#fff4e6" }}>
                  <p className="bangers" style={{ fontSize: 15, margin: "0 0 6px" }}>Still voting</p>
                  <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#9a6700" }}>{pendingCount}</p>
                </div>
                <div className="stat" style={{ background: "#eefdf5" }}>
                  <p className="bangers" style={{ fontSize: 15, margin: "0 0 6px" }}>Finalized</p>
                  <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#0f766e" }}>{finalizedCount}</p>
                </div>
              </div>

              <div className="section-divider" />

              <div className="section-grid">
                <div>
                  <h3 className="bangers" style={{ margin: "0 0 8px", fontSize: 22 }}>Live hangouts</h3>
                  <p style={{ margin: 0, color: "#667085", fontWeight: 700 }}>Use this page to review hangouts. Use Create Hangout when you want to post a new one.</p>
                </div>
                {proposals.length ? proposals.map((proposal) => {
                  const topTime = leadingChoice(proposal.timeOptions, proposal.votes?.time);
                  const topLocation = leadingChoice(proposal.locationOptions, proposal.votes?.location);
                  return (
                    <div key={proposal.id} className="proposal">
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <strong className="bangers" style={{ display: "block", fontSize: 22 }}>{proposal.name}</strong>
                          <span style={{ color: "#667085", fontWeight: 700 }}>{proposal.groupEmoji} {proposal.groupName} · started by {proposal.proposerName}</span>
                        </div>
                        <span className="chip" style={{ background: proposal.status === "finalized" ? "#eefdf5" : "#fff5e6", color: proposal.status === "finalized" ? "#0f766e" : "#9a6700" }}>
                          {proposal.status}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: "#475467" }}>{proposal.description || "No description added yet."}</p>
                      <div className="meta-row">
                        <span className="chip" style={{ background: "#eef8ff", color: "#155e75" }}>Top time: {topTime?.label || "No votes yet"}</span>
                        <span className="chip" style={{ background: "#fff7da", color: "#9a6700" }}>Top place: {topLocation?.label || "No votes yet"}</span>
                      </div>
                      <div className="actions">
                        <button type="button" className="btn secondary" onClick={() => onNavigate?.("friend-groups")}>Open in crew</button>
                        <button type="button" className="btn ghost" onClick={() => onNavigate?.("join-hangout", { code: proposal.code })}>Open invite</button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="proposal">
                    <strong>No hangouts yet.</strong>
                    <p style={{ margin: 0, color: "#667085" }}>Create one from the new Create Hangout section when you are ready to start planning.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </OutsidersSideNav>
      </div>
    </>
  );
}
