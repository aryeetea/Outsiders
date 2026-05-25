import { useMemo, useState } from "react";
import OutsidersSideNav from "./OutsidersSideNav";
import { getCurrentUserKey, getDisplayName } from "./appState";
import { isSupabaseConfigured, supabase } from "./supabase";

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
  .section-switcher {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .section-chip {
    border-radius: 999px;
    padding: 10px 14px;
    border: 3px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    background: #fff;
    color: #17151f;
    cursor: pointer;
    font: 400 14px 'Bangers', cursive;
    letter-spacing: 0.06em;
  }
  .section-chip.active {
    background: #ffd93d;
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
  const storedHangouts = useMemo(() => appData?.hangouts || [], [appData?.hangouts]);
  const profileName = appData?.profile?.name || appData?.profile?.username || "You";
  const currentProfile = appData?.profile || {};
  const currentUserKey = getCurrentUserKey(currentProfile);
  const currentDisplayName = getDisplayName(currentProfile);
  const [activeSection, setActiveSection] = useState("voting");
  const proposals = useMemo(
    () => {
      const proposalsById = new Map();

      groups.forEach((group) => {
        (group.hangoutProposals || []).forEach((proposal) => {
          proposalsById.set(String(proposal.id), {
            ...proposal,
            groupName: proposal.groupName || group.name,
            groupId: proposal.groupId || group.id,
            groupEmoji: proposal.groupEmoji || group.emoji,
          });
        });
      });

      storedHangouts.forEach((proposal) => {
        const groupMatch = groups.find((group) => String(group.id) === String(proposal.groupId));
        const normalizedProposal = {
          ...proposal,
          groupName: proposal.groupName || groupMatch?.name || "Your crew",
          groupId: proposal.groupId || groupMatch?.id || null,
          groupEmoji: proposal.groupEmoji || groupMatch?.emoji || "👥",
        };
        proposalsById.set(String(proposal.id), {
          ...normalizedProposal,
          ...(proposalsById.get(String(proposal.id)) || {}),
        });
      });

      return Array.from(proposalsById.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    },
    [groups, storedHangouts]
  );
  const myProposals = useMemo(
    () => proposals.filter((proposal) => proposal.proposerKey === currentUserKey || proposal.proposerName === currentDisplayName),
    [proposals, currentUserKey, currentDisplayName]
  );
  const votingProposals = useMemo(
    () => proposals.filter((proposal) => (
      proposal.status !== "finalized"
      && (!proposal.votes?.time?.[currentUserKey] || !proposal.votes?.location?.[currentUserKey])
    )),
    [proposals, currentUserKey]
  );
  const finalizedCount = proposals.filter((proposal) => proposal.status === "finalized").length;
  const pendingCount = proposals.filter((proposal) => proposal.status !== "finalized").length;

  const deleteProposal = async (proposal) => {
    if (!proposal?.groupId) return;
    const isMine = proposal.proposerKey === currentUserKey || proposal.proposerName === currentDisplayName;
    if (!isMine) return;

    const confirmed = window.confirm(`Delete ${proposal.name}? This removes the hangout, its votes, and related notifications.`);
    if (!confirmed) return;

    const nextGroups = groups.map((group) => (
      String(group.id) === String(proposal.groupId)
        ? {
            ...group,
            hangoutProposals: (group.hangoutProposals || []).filter((item) => item.id !== proposal.id),
          }
        : group
    ));
    const nextGroup = nextGroups.find((group) => String(group.id) === String(proposal.groupId));

    if (isSupabaseConfigured && nextGroup && !String(nextGroup.id).startsWith("group-")) {
      const { error } = await supabase
        .from("groups")
        .update({ hangout_proposals: nextGroup.hangoutProposals || [] })
        .eq("id", nextGroup.id);

      if (error) {
        window.alert(error.message || "We could not delete that hangout yet.");
        return;
      }

      await supabase
        .from("notifications")
        .delete()
        .eq("proposal_id", proposal.id);
    }

    setAppData?.((prev) => ({
      ...prev,
      groups: nextGroups,
      hangouts: (prev.hangouts || []).filter((item) => item.id !== proposal.id),
      notifications: (prev.notifications || []).filter((notification) => notification.proposalId !== proposal.id),
    }));
  };

  const renderProposalCard = (proposal) => {
    const topTime = leadingChoice(proposal.timeOptions, proposal.votes?.time);
    const topLocation = leadingChoice(proposal.locationOptions, proposal.votes?.location);
    const isMine = proposal.proposerKey === currentUserKey || proposal.proposerName === currentDisplayName;
    const myTimeVote = proposal.votes?.time?.[currentUserKey];
    const myLocationVote = proposal.votes?.location?.[currentUserKey];

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
          <span className="chip" style={{ background: isMine ? "#eefdf5" : "#fff", color: isMine ? "#0f766e" : "#555" }}>{isMine ? "You started this" : "Crew plan"}</span>
          <span className="chip" style={{ background: myTimeVote && myLocationVote ? "#eefdf5" : "#fff4e6", color: myTimeVote && myLocationVote ? "#0f766e" : "#9a6700" }}>
            {myTimeVote && myLocationVote ? "Your vote is in" : "Your vote is still needed"}
          </span>
        </div>
        {proposal.agenda?.length ? (
          <div style={{ display: "grid", gap: 8, padding: 14, borderRadius: 14, border: "2px dashed rgba(23,21,31,0.18)", background: "#fffdf7" }}>
            <strong className="bangers" style={{ fontSize: 18 }}>Shared run of show</strong>
            {proposal.agenda.map((item) => (
              <div key={item.id} style={{ color: "#475467", fontWeight: 700 }}>
                {item.section}{item.time ? ` · ${item.time}` : ""}: {item.title}
              </div>
            ))}
          </div>
        ) : null}
        <div className="actions">
          <button type="button" className="btn secondary" onClick={() => onNavigate?.("friend-groups")}>Open in crew</button>
          <button type="button" className="btn ghost" onClick={() => onNavigate?.("join-hangout", { code: proposal.code })}>Open invite</button>
          {isMine ? (
            <button type="button" className="btn ghost" onClick={() => void deleteProposal(proposal)}>Delete hangout</button>
          ) : null}
        </div>
      </div>
    );
  };

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
                  <h3 className="bangers" style={{ margin: "0 0 8px", fontSize: 22 }}>Choose a hangout section</h3>
                  <p style={{ margin: 0, color: "#667085", fontWeight: 700 }}>Use one section for voting, one for what you created, and one for everything else.</p>
                </div>
                <div className="section-switcher">
                  <button type="button" className={`section-chip ${activeSection === "voting" ? "active" : ""}`} onClick={() => setActiveSection("voting")}>Vote On Hangouts</button>
                  <button type="button" className={`section-chip ${activeSection === "created" ? "active" : ""}`} onClick={() => setActiveSection("created")}>Your Hangouts</button>
                  <button type="button" className={`section-chip ${activeSection === "all" ? "active" : ""}`} onClick={() => setActiveSection("all")}>See All Hangouts</button>
                </div>

                {activeSection === "voting" ? (
                  <>
                    <div>
                      <h3 className="bangers" style={{ margin: "0 0 8px", fontSize: 22 }}>Vote on hangouts</h3>
                      <p style={{ margin: 0, color: "#667085", fontWeight: 700 }}>These are the open hangouts that still need your vote.</p>
                    </div>
                    {votingProposals.length ? votingProposals.map(renderProposalCard) : (
                      <div className="proposal">
                        <strong>No hangouts need your vote right now.</strong>
                        <p style={{ margin: 0, color: "#667085" }}>When a crew hangout is still open and your vote is missing, it will show here.</p>
                      </div>
                    )}
                  </>
                ) : null}

                {activeSection === "created" ? (
                  <>
                    <div>
                      <h3 className="bangers" style={{ margin: "0 0 8px", fontSize: 22 }}>Your created hangouts</h3>
                      <p style={{ margin: 0, color: "#667085", fontWeight: 700 }}>Anything you started should show here first.</p>
                    </div>
                    {myProposals.length ? myProposals.map(renderProposalCard) : (
                      <div className="proposal">
                        <strong>You have not posted a hangout yet.</strong>
                        <p style={{ margin: 0, color: "#667085" }}>When you create one, it should show up here first.</p>
                      </div>
                    )}
                  </>
                ) : null}

                {activeSection === "all" ? (
                  <>
                    <div>
                      <h3 className="bangers" style={{ margin: "0 0 8px", fontSize: 22 }}>See all hangouts</h3>
                      <p style={{ margin: 0, color: "#667085", fontWeight: 700 }}>This is the full crew hangout board, including yours and everyone else’s.</p>
                    </div>
                    {proposals.length ? proposals.map(renderProposalCard) : (
                      <div className="proposal">
                        <strong>No hangouts yet.</strong>
                        <p style={{ margin: 0, color: "#667085" }}>Create one from the Create Hangout page when you are ready to start planning.</p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </section>
          </div>
        </OutsidersSideNav>
      </div>
    </>
  );
}
