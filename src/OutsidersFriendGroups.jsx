import { useEffect, useMemo, useState } from "react";
import { createId, getCurrentUserKey, getDisplayName } from "./appState";
import { buildGroupInviteLink } from "./siteConfig";
import { availabilityToText, hasAvailability } from "./scheduling";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f1dd; }
  .root {
    min-height: 100vh;
    color: #17151f;
    font-family: 'Nunito', sans-serif;
    background:
      radial-gradient(circle at top left, rgba(255, 217, 61, 0.5), transparent 28%),
      radial-gradient(circle at 85% 12%, rgba(110, 215, 255, 0.35), transparent 24%),
      linear-gradient(180deg, #fff6c7 0%, #fffdf6 38%, #f5efe0 100%);
  }
  .root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle, rgba(23, 21, 31, 0.14) 1.2px, transparent 1.4px),
      linear-gradient(135deg, transparent 0 49.2%, rgba(23, 21, 31, 0.035) 49.2% 50.8%, transparent 50.8% 100%);
    background-size: 22px 22px, 140px 140px;
    opacity: 0.6;
    pointer-events: none;
    z-index: 0;
  }
  .root::after {
    content: 'POW! BAM! SNAP!';
    position: fixed;
    right: -18px;
    top: 68px;
    font: 400 clamp(28px, 4vw, 54px) 'Bangers', cursive;
    letter-spacing: 0.12em;
    color: rgba(255, 107, 107, 0.18);
    transform: rotate(-8deg);
    pointer-events: none;
    z-index: 0;
  }
  .shell {
    max-width: 1380px;
    margin: 0 auto;
    padding: 28px 20px 54px;
    display: grid;
    gap: 26px;
    position: relative;
    z-index: 1;
  }
  .glass, .card {
    border-radius: 22px;
    border: 4px solid #17151f;
    background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,250,240,0.98));
    box-shadow: 8px 8px 0 #17151f;
    position: relative;
    overflow: hidden;
  }
  .glass::before, .card::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at top right, rgba(255,255,255,0.7), transparent 30%),
      linear-gradient(135deg, rgba(255,255,255,0.2), transparent 48%);
    pointer-events: none;
  }
  .glass {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 18px 22px;
    flex-wrap: wrap;
  }
  .card { padding: 22px; }
  .brand-btn, .btn, .crew-card, .tab-btn, .vote-btn, .roast-card {
    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;
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
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #ff6b6b, #ff9a3c);
    border: 3px solid #17151f;
    border-radius: 14px;
    display: grid;
    place-items: center;
    box-shadow: 4px 4px 0 #17151f;
    transform: rotate(-7deg);
  }
  .hero {
    padding: 32px;
    background:
      radial-gradient(circle at 12% 18%, rgba(255,255,255,0.84), transparent 18%),
      linear-gradient(135deg, #ffef7d 0%, #fff9cf 32%, #ffffff 100%);
  }
  .layout {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 22px;
  }
  .sidebar-stack, .detail-stack {
    display: grid;
    gap: 16px;
    align-content: start;
  }
  .crew-card {
    padding: 16px;
    border-radius: 16px;
    border: 3px solid #17151f;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,245,230,0.94)),
      radial-gradient(circle at top right, rgba(255, 217, 61, 0.16), transparent 24%);
    box-shadow: 5px 5px 0 #17151f;
    cursor: pointer;
    position: relative;
    text-align: left;
  }
  .crew-card.active, .crew-card:hover {
    transform: translate(-2px, -3px) rotate(-0.7deg);
    background: linear-gradient(180deg, #ffffff, #eafaff);
    border-color: #00a8cc;
    box-shadow: 7px 7px 0 #00a8cc;
  }
  .bangers {
    font-family: 'Bangers', cursive;
    letter-spacing: 0.04em;
  }
  .btn, .vote-btn, .tab-btn {
    border: none;
    cursor: pointer;
    font: 400 15px 'Bangers', cursive;
    letter-spacing: 0.06em;
  }
  .btn {
    border-radius: 12px;
    padding: 13px 16px;
    border: 3px solid #17151f;
    box-shadow: 4px 4px 0 #17151f;
    position: relative;
    z-index: 1;
  }
  .btn:hover, .vote-btn:hover, .tab-btn:hover {
    transform: translate(-1px, -2px);
  }
  .btn.primary {
    background: linear-gradient(135deg, #ff6b6b, #ff8b6b);
    color: white;
  }
  .btn.secondary {
    background: linear-gradient(135deg, #ffd93d, #ffb347);
    color: #17151f;
  }
  .btn.ghost {
    background: linear-gradient(180deg, #ffffff, #fff3c8);
    color: #17151f;
  }
  .tab-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .tab-btn {
    padding: 10px 14px;
    border-radius: 999px;
    background: #fff8df;
    border: 3px solid transparent;
    color: #6b647a;
    font: 800 13px 'Nunito', sans-serif;
    text-transform: uppercase;
  }
  .tab-btn.active {
    background: #17151f;
    color: #fff8dc;
    border-color: #17151f;
    box-shadow: 4px 4px 0 #ff6b6b;
  }
  .member-row, .pending-row, .proposal-card, .roast-card, .bill-card {
    border-radius: 14px;
    border: 3px solid #17151f;
    background: linear-gradient(180deg, #fffef9, #fff8ea);
    padding: 16px;
    box-shadow: 5px 5px 0 #17151f;
    position: relative;
    overflow: hidden;
  }
  .proposal-card::after, .member-row::after, .pending-row::after, .bill-card::after {
    content: '';
    position: absolute;
    right: -18px;
    top: -20px;
    width: 82px;
    height: 82px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,217,61,0.34) 0%, rgba(255,217,61,0.12) 44%, transparent 46%);
    pointer-events: none;
  }
  .vote-grid, .member-list, .roast-list {
    display: grid;
    gap: 12px;
  }
  .vote-btn {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    text-align: left;
    background: linear-gradient(180deg, #ffffff, #fff5de);
    border: 3px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    position: relative;
    z-index: 1;
  }
  .vote-btn.active {
    background: linear-gradient(180deg, #f3ffe7, #e8fde8);
    border-color: #51cf66;
    box-shadow: 4px 4px 0 #51cf66;
  }
  .roast-card {
    background: linear-gradient(180deg, #fff2df, #fff7ee);
    border-color: #ff9a3c;
    box-shadow: 5px 5px 0 #ff9a3c;
  }
  .field {
    display: grid;
    gap: 8px;
    position: relative;
    z-index: 1;
  }
  .field label {
    font-size: 14px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #17151f;
    font-family: 'Bangers', cursive;
  }
  .field input, .field textarea, .field select {
    width: 100%;
    border: 3px solid #17151f;
    border-radius: 12px;
    padding: 13px 14px;
    background: linear-gradient(180deg, #fffef8, #fff7e4);
    font: 700 15px 'Nunito', sans-serif;
    color: #17151f;
    outline: none;
    box-shadow: 3px 3px 0 #17151f;
  }
  .field input:focus, .field textarea:focus, .field select:focus {
    border-color: #ff6b6b;
    box-shadow: 4px 4px 0 #ff6b6b;
  }
  .field textarea {
    min-height: 116px;
    resize: vertical;
  }
  .comic-kicker {
    display: inline-flex;
    width: fit-content;
    padding: 4px 12px;
    border-radius: 10px;
    background: #ffd93d;
    color: #17151f;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.07em;
    border: 2px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    transform: rotate(-2deg);
    position: relative;
    z-index: 1;
  }
  .hero-title {
    max-width: 860px;
    line-height: 0.98;
    text-wrap: balance;
    text-shadow: 2px 2px 0 rgba(255,255,255,0.7);
  }
  .panel-title {
    margin: 0 0 14px;
    font: 400 24px 'Bangers', cursive;
    letter-spacing: 0.05em;
    color: #17151f;
  }
  .stat-chip {
    border-radius: 999px;
    padding: 10px 12px;
    border: 3px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    font-weight: 900;
    background: #fff;
  }
  .section-grid {
    display: grid;
    gap: 14px;
  }
  @media (max-width: 860px) {
    .proposal-columns {
      grid-template-columns: 1fr !important;
    }
  }
  @media (max-width: 1080px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 720px) {
    .shell { padding: 16px 12px 36px; }
    .glass, .hero, .card { padding: 18px; border-radius: 24px; }
    .root::after { display: none; }
  }
`;

const GROUP_COLORS = ["#ff8f7a", "#6ed7ff", "#73e2a7", "#ffcf6e", "#c6a6ff"];

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getInitials(name) {
  return (name || "You").replace(/^@/, "").trim().slice(0, 2).toUpperCase() || "YO";
}

function countVotes(votes = {}, optionId) {
  return Object.values(votes).filter((value) => value === optionId).length;
}

function pickWinner(options = [], votes = {}) {
  return [...options].sort((a, b) => countVotes(votes, b.id) - countVotes(votes, a.id))[0] || null;
}

export default function OutsidersFriendGroups({ onNavigate, appData, setAppData }) {
  const groups = appData?.groups ?? [];
  const profile = appData?.profile || {};
  const currentName = getDisplayName(profile);
  const currentUserKey = getCurrentUserKey(profile);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  const [activeTab, setActiveTab] = useState("Proposals");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("👥");
  const [inviteUsername, setInviteUsername] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [notice, setNotice] = useState("");
  const selectedGroup = groups.find((group) => String(group.id) === String(selectedGroupId)) || groups[0] || null;
  const debriefCount = useMemo(() => selectedGroup?.cases?.length || 0, [selectedGroup]);
  const openDebriefCount = useMemo(() => (selectedGroup?.cases || []).filter((caseItem) => caseItem.status !== "Resolved").length, [selectedGroup]);

  useEffect(() => {
    if (!selectedGroup) return;
    const me = selectedGroup.members.find((member) => member.name === currentName || member.username === `@${profile.username}`);
    if (me && hasAvailability(profile.availability) && availabilityToText(me.availability) !== availabilityToText(profile.availability)) {
      setAppData?.((prev) => ({
        ...prev,
        groups: prev.groups.map((group) => (
          group.id === selectedGroup.id
            ? {
                ...group,
                members: group.members.map((member) => (
                  member.name === me.name ? { ...member, availability: profile.availability } : member
                )),
              }
            : group
        )),
      }));
    }
  }, [currentName, profile.availability, profile.username, selectedGroup, setAppData]);

  const createGroup = () => {
    if (!newGroupName.trim()) {
      setNotice("Give the crew a name first.");
      return;
    }
    const nextGroup = {
      id: createId("group"),
      name: newGroupName.trim(),
      emoji: newGroupEmoji,
      code: generateCode(),
      members: [{
        name: currentName,
        initials: getInitials(currentName),
        role: "Admin",
        username: profile.username ? `@${profile.username}` : "",
        availability: profile.availability,
      }],
      pending: [],
      hangoutProposals: [],
      billWatch: { electedMemberName: "", votes: {}, checklist: ["Track who paid", "Post the split", "Confirm balances"] },
    };
    setAppData?.((prev) => ({ ...prev, groups: [...prev.groups, nextGroup] }));
    setSelectedGroupId(nextGroup.id);
    setNewGroupName("");
    setNotice(`Created ${nextGroup.name}.`);
  };

  const joinCrew = () => {
    const code = joinCode.trim().toUpperCase();
    const target = groups.find((group) => group.code === code);
    if (!target) {
      setNotice("No crew was found with that code.");
      return;
    }
    const already = target.members.some((member) => member.name === currentName || member.username === `@${profile.username}`);
    if (already) {
      setSelectedGroupId(target.id);
      setNotice("You are already in that crew.");
      return;
    }
    setAppData?.((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (
        group.id === target.id
          ? {
              ...group,
              members: [...group.members, {
                name: currentName,
                initials: getInitials(currentName),
                role: "Member",
                username: profile.username ? `@${profile.username}` : "",
                availability: profile.availability,
              }],
            }
          : group
      )),
    }));
    setSelectedGroupId(target.id);
    setJoinCode("");
    setNotice(`Joined ${target.name}.`);
  };

  const inviteMember = () => {
    if (!selectedGroup || !inviteUsername.trim()) {
      setNotice("Add a username to invite.");
      return;
    }
    const username = inviteUsername.startsWith("@") ? inviteUsername : `@${inviteUsername}`;
    setAppData?.((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (
        group.id === selectedGroup.id
          ? {
              ...group,
              pending: [...(group.pending || []), { username, name: username.replace(/^@/, ""), initials: getInitials(username) }],
            }
          : group
      )),
    }));
    setInviteUsername("");
    setNotice(`${username} was added to pending invites.`);
  };

  const castProposalVote = (proposalId, category, optionId) => {
    if (!selectedGroup) return;
    setAppData?.((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (
        group.id === selectedGroup.id
          ? {
              ...group,
              hangoutProposals: group.hangoutProposals.map((proposal) => (
                proposal.id === proposalId
                  ? {
                      ...proposal,
                      votes: {
                        ...proposal.votes,
                        [category]: {
                          ...(proposal.votes?.[category] || {}),
                          [currentUserKey]: optionId,
                        },
                      },
                    }
                  : proposal
              )),
            }
          : group
      )),
    }));
  };

  const finalizeProposal = (proposal) => {
    if (!selectedGroup) return;
    const winningTime = pickWinner(proposal.timeOptions, proposal.votes?.time);
    const winningLocation = pickWinner(proposal.locationOptions, proposal.votes?.location);
    setAppData?.((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (
        group.id === selectedGroup.id
          ? {
              ...group,
              hangoutProposals: group.hangoutProposals.map((item) => (
                item.id === proposal.id
                  ? {
                      ...item,
                      status: "finalized",
                      finalizedChoice: {
                        time: winningTime || null,
                        location: winningLocation || null,
                      },
                    }
                  : item
              )),
            }
          : group
      )),
    }));
    setNotice(`${proposal.name} was finalized for the crew.`);
  };

  const castBillWatchVote = (memberName) => {
    if (!selectedGroup) return;
    setAppData?.((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (
        group.id === selectedGroup.id
          ? {
              ...group,
              billWatch: {
                ...(group.billWatch || {}),
                electedMemberName: memberName,
                votes: {
                  ...(group.billWatch?.votes || {}),
                  [currentUserKey]: memberName,
                },
              },
            }
          : group
      )),
    }));
  };

  const billLeader = selectedGroup?.members?.reduce((best, member) => {
    const votes = Object.values(selectedGroup.billWatch?.votes || {}).filter((value) => value === member.name).length;
    if (!best || votes > best.count) return { name: member.name, count: votes };
    return best;
  }, null);

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <div className="shell">
          <div className="glass">
            <button type="button" className="brand-btn" onClick={() => onNavigate?.("dashboard")}>
              <div className="logo">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>
              </div>
              <div>
                <div style={{ font: "800 22px 'Sora', sans-serif" }}>My Crew</div>
                <div style={{ fontSize: 12, color: "#7a8294" }}>Proposal voting, invites, and roast board</div>
              </div>
            </button>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn ghost" onClick={() => onNavigate?.("dashboard")}>Dashboard</button>
              <button type="button" className="btn ghost" onClick={() => onNavigate?.("profile")}>Availability</button>
              <button type="button" className="btn ghost" onClick={() => onNavigate?.("create-hangout")}>New proposal</button>
            </div>
          </div>

          <section className="glass hero">
            <div style={{ display: "grid", gap: 12 }}>
              <div className="comic-kicker">Crew HQ</div>
              <h1 className="bangers hero-title" style={{ margin: 0, fontSize: 46 }}>Every proposal, vote, invite, and debrief lives inside the crew.</h1>
              <p style={{ margin: 0, maxWidth: 900, color: "#555", lineHeight: 1.6, fontWeight: 800 }}>
                Crew members can propose hangouts, vote on every time and place option, manage outside invites in context, get notifications, and jump into Debrief Court when the room needs to clear the air.
              </p>
            </div>
          </section>

          {notice ? (
            <div className="card" style={{ background: "linear-gradient(135deg, rgba(255,245,230,0.96), rgba(255,255,255,0.92))" }}>
              <strong>{notice}</strong>
            </div>
          ) : null}

          <div className="layout">
            <aside className="sidebar-stack">
              <div className="card">
                <h2 className="panel-title">Your Crews</h2>
                <div style={{ display: "grid", gap: 12 }}>
                  {groups.map((group, index) => (
                    <button key={group.id} type="button" className={`crew-card ${selectedGroup?.id === group.id ? "active" : ""}`} onClick={() => setSelectedGroupId(group.id)}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div>
                          <strong className="bangers" style={{ display: "block", fontSize: 20 }}>{group.emoji} {group.name}</strong>
                          <span style={{ color: "#667085", fontWeight: 700 }}>{group.members.length} members · {group.hangoutProposals?.length || 0} proposals</span>
                        </div>
                        <div style={{ width: 14, height: 14, borderRadius: 999, background: GROUP_COLORS[index % GROUP_COLORS.length] }} />
                      </div>
                    </button>
                  ))}
                  {!groups.length ? <p style={{ margin: 0, color: "#667085" }}>No crews yet. Create one below.</p> : null}
                </div>
              </div>

              <div className="card">
                <h3 className="panel-title" style={{ fontSize: 22 }}>Create A Crew</h3>
                <div className="field">
                  <label>crew name</label>
                  <input value={newGroupName} onChange={(event) => setNewGroupName(event.target.value)} placeholder="Downtown Day Ones" />
                </div>
                <div className="field" style={{ marginTop: 12 }}>
                  <label>emoji</label>
                  <select value={newGroupEmoji} onChange={(event) => setNewGroupEmoji(event.target.value)}>
                    {["👥", "🎉", "🍕", "🏝", "🎮", "🌆", "🛼", "🎬"].map((emoji) => <option key={emoji} value={emoji}>{emoji}</option>)}
                  </select>
                </div>
                <button type="button" className="btn primary" style={{ width: "100%", marginTop: 14 }} onClick={createGroup}>Create crew</button>
              </div>

              <div className="card">
                <h3 className="panel-title" style={{ fontSize: 22 }}>Join By Code</h3>
                <div className="field">
                  <label>crew code</label>
                  <input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="ABC123" />
                </div>
                <button type="button" className="btn secondary" style={{ width: "100%", marginTop: 14 }} onClick={joinCrew}>Join crew</button>
              </div>
            </aside>

            <section className="detail-stack">
              {selectedGroup ? (
                <>
                  <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div>
                        <h2 className="bangers" style={{ margin: "0 0 8px", fontSize: 30 }}>{selectedGroup.emoji} {selectedGroup.name}</h2>
                        <p style={{ margin: 0, color: "#667085" }}>{selectedGroup.members.length} members · crew code {selectedGroup.code}</p>
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span className="stat-chip" style={{ background: "#eefdf5", color: "#0f766e" }}>{selectedGroup.hangoutProposals?.length || 0} active proposals</span>
                        <span className="stat-chip" style={{ background: "#fff5e6", color: "#9a6700" }}>{selectedGroup.pending?.length || 0} pending invites</span>
                      </div>
                    </div>
                    <div className="tab-row" style={{ marginTop: 16 }}>
                      {["Proposals", "Members", "Invites", "Debrief", "Bill Watch"].map((tab) => (
                        <button key={tab} type="button" className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeTab === "Proposals" ? (
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
                        <div>
                          <h3 className="bangers" style={{ margin: "0 0 6px", fontSize: 24 }}>Hangout proposals</h3>
                          <p style={{ margin: 0, color: "#667085" }}>Every crew member can see and vote on each proposal below.</p>
                        </div>
                        <button type="button" className="btn primary" onClick={() => onNavigate?.("create-hangout")}>Propose a hangout</button>
                      </div>
                      <div className="vote-grid">
                        {selectedGroup.hangoutProposals?.length ? selectedGroup.hangoutProposals.map((proposal) => {
                          const topTime = pickWinner(proposal.timeOptions, proposal.votes?.time);
                          const topLocation = pickWinner(proposal.locationOptions, proposal.votes?.location);
                          return (
                            <div key={proposal.id} className="proposal-card">
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
                                <div>
                                  <strong className="bangers" style={{ display: "block", fontSize: 22 }}>{proposal.name}</strong>
                                  <span style={{ color: "#667085", fontWeight: 700 }}>Proposed by {proposal.proposerName}</span>
                                </div>
                                <span className="stat-chip" style={{ padding: "8px 12px", background: proposal.status === "finalized" ? "#eefdf5" : "#fff5e6", color: proposal.status === "finalized" ? "#0f766e" : "#9a6700" }}>{proposal.status}</span>
                              </div>
                              <p style={{ margin: "0 0 12px", color: "#475467" }}>{proposal.description || "No extra description added."}</p>
                              <div className="proposal-columns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div>
                                  <strong className="bangers" style={{ display: "block", marginBottom: 8, fontSize: 16 }}>Vote The Best Time</strong>
                                  <div className="vote-grid">
                                    {proposal.timeOptions.map((option) => (
                                      <button key={option.id} type="button" className={`vote-btn ${proposal.votes?.time?.[currentUserKey] === option.id ? "active" : ""}`} onClick={() => castProposalVote(proposal.id, "time", option.id)}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                          <span>{option.label}</span>
                                          <strong>{countVotes(proposal.votes?.time, option.id)}</strong>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <strong className="bangers" style={{ display: "block", marginBottom: 8, fontSize: 16 }}>Vote The Best Place</strong>
                                  <div className="vote-grid">
                                    {proposal.locationOptions.map((option) => (
                                      <button key={option.id} type="button" className={`vote-btn ${proposal.votes?.location?.[currentUserKey] === option.id ? "active" : ""}`} onClick={() => castProposalVote(proposal.id, "location", option.id)}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                          <span>{option.label}</span>
                                          <strong>{countVotes(proposal.votes?.location, option.id)}</strong>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginTop: 14, alignItems: "center" }}>
                                <div style={{ color: "#667085", fontWeight: 700 }}>
                                  Top time: {topTime?.label || "No votes yet"}<br />
                                  Top place: {topLocation?.label || "No votes yet"}
                                </div>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                  <span className="stat-chip" style={{ background: "#eef8ff", color: "#155e75" }}>{proposal.externalInvites?.length || 0} outside invite{proposal.externalInvites?.length === 1 ? "" : "s"}</span>
                                  {proposal.status !== "finalized" ? <button type="button" className="btn secondary" onClick={() => finalizeProposal(proposal)}>Finalize leading pick</button> : null}
                                </div>
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="proposal-card">
                            <strong>No hangout proposals yet.</strong>
                            <p style={{ margin: "8px 0 0", color: "#667085" }}>Any member can post one from the hangout proposal screen.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Members" ? (
                    <div className="card">
                      <h3 className="bangers" style={{ margin: "0 0 14px", fontSize: 24 }}>Crew members</h3>
                      <div className="member-list">
                        {selectedGroup.members.map((member) => (
                          <div key={`${member.name}-${member.username || ""}`} className="member-row">
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                              <div>
                                <strong style={{ display: "block" }}>{member.name}</strong>
                                <span style={{ color: "#667085", fontWeight: 700 }}>{member.role || "Member"} {member.username ? `· ${member.username}` : ""}</span>
                              </div>
                              <span style={{ borderRadius: 999, padding: "8px 12px", background: hasAvailability(member.availability) ? "#eefdf5" : "#fff5e6", color: hasAvailability(member.availability) ? "#0f766e" : "#9a6700", fontWeight: 700 }}>
                                {hasAvailability(member.availability) ? "Availability set" : "Availability missing"}
                              </span>
                            </div>
                            <p style={{ margin: "10px 0 0", color: "#667085" }}>{availabilityToText(member.availability)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Invites" ? (
                    <div className="card">
                      <h3 className="bangers" style={{ margin: "0 0 14px", fontSize: 24 }}>Crew invites</h3>
                      <div className="field">
                        <label>Invite username</label>
                        <input value={inviteUsername} onChange={(event) => setInviteUsername(event.target.value)} placeholder="theirusername" />
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                        <button type="button" className="btn primary" onClick={inviteMember}>Add pending invite</button>
                        <button type="button" className="btn ghost" onClick={() => navigator.clipboard.writeText(buildGroupInviteLink(selectedGroup.code))}>Copy invite link</button>
                      </div>
                      <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
                        {selectedGroup.pending?.length ? selectedGroup.pending.map((invite) => (
                          <div key={invite.username} className="pending-row">
                            <strong>{invite.username}</strong>
                          </div>
                        )) : <div className="pending-row"><strong>No pending invites.</strong></div>}
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Debrief" ? (
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
                        <div>
                          <h3 className="bangers" style={{ margin: "0 0 6px", fontSize: 24 }}>Debrief Court ❤️</h3>
                          <p style={{ margin: 0, color: "#667085", fontWeight: 800 }}>This crew already has a full comic-style debrief system. Use it when a hangout needs honesty, repair, or a peace maker.</p>
                        </div>
                        <button type="button" className="btn primary" onClick={() => onNavigate?.("debrief")}>Open Debrief</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 18 }}>
                        <div className="roast-card">
                          <p className="bangers" style={{ fontSize: 16, margin: "0 0 6px" }}>Total cases</p>
                          <p style={{ fontSize: 32, fontWeight: 900, color: "#ff9a3c", margin: 0 }}>{debriefCount}</p>
                        </div>
                        <div className="roast-card" style={{ background: "#fde8f0", borderColor: "#ff6b9d", boxShadow: "4px 4px 0 #ff6b9d" }}>
                          <p className="bangers" style={{ fontSize: 16, margin: "0 0 6px" }}>Open cases</p>
                          <p style={{ fontSize: 32, fontWeight: 900, color: "#ff6b9d", margin: 0 }}>{openDebriefCount}</p>
                        </div>
                        <div className="roast-card" style={{ background: "#e8f4fd", borderColor: "#4ecdc4", boxShadow: "4px 4px 0 #4ecdc4" }}>
                          <p className="bangers" style={{ fontSize: 16, margin: "0 0 6px" }}>Peace maker</p>
                          <p style={{ fontSize: 18, fontWeight: 900, color: "#4ecdc4", margin: 0 }}>{selectedGroup.peaceMaker?.electedMemberName || "No one yet"}</p>
                        </div>
                      </div>
                      <div className="roast-card">
                        <strong style={{ display: "block", marginBottom: 8 }}>Why Debrief instead</strong>
                        <p style={{ margin: 0, color: "#555", lineHeight: 1.6, fontWeight: 800 }}>
                          Debrief Court already gives your crew anonymous case filing, answers, apologies, clap-backs, and a voted peace-maker bench. It fits the comic personality of the site better than a separate roast board, so this crew page now points back to that system instead.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Bill Watch" ? (
                    <div className="card">
                      <h3 className="bangers" style={{ margin: "0 0 14px", fontSize: 24 }}>Bill Watch</h3>
                      <p style={{ margin: "0 0 16px", color: "#667085" }}>Existing crew money-role voting still works here too.</p>
                      <div className="vote-grid">
                        {selectedGroup.members.map((member) => {
                          const totalVotes = Object.values(selectedGroup.billWatch?.votes || {}).filter((value) => value === member.name).length;
                          const isMine = selectedGroup.billWatch?.votes?.[currentUserKey] === member.name;
                          return (
                            <div key={member.name} className="bill-card">
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                                <div>
                                  <strong style={{ display: "block" }}>{member.name}</strong>
                                  <span style={{ color: "#667085", fontWeight: 700 }}>{totalVotes} vote{totalVotes === 1 ? "" : "s"} {isMine ? "· your pick" : ""}</span>
                                </div>
                                <button type="button" className="btn secondary" onClick={() => castBillWatchVote(member.name)}>Vote for this person</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {billLeader?.name ? <p style={{ margin: "16px 0 0", color: "#0f766e", fontWeight: 700 }}>{billLeader.name} is currently leading Bill Watch.</p> : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="card">
                  <strong>No crew selected.</strong>
                  <p style={{ margin: "8px 0 0", color: "#667085" }}>Create a crew or join one with a code to start planning.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
