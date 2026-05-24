import { useMemo, useState } from "react";
import { createId, getCurrentUserKey, getDisplayName } from "./appState";
import OutsidersSideNav from "./OutsidersSideNav";
import { buildHangoutInviteLink } from "./siteConfig";
import { availabilityToText, formatTimeLabel, recommendHangoutTimes } from "./scheduling";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f1dd; }
  .root {
    min-height: 100vh;
    color: #17151f;
    font-family: 'Nunito', sans-serif;
    background: #fff6d8;
    position: relative;
  }
  .root::before {
    content: '';
    position: fixed;
    inset: 0;
    background: transparent;
    pointer-events: none;
    z-index: 0;
  }
  .shell {
    max-width: 1320px;
    margin: 0 auto;
    padding: 24px 20px 48px;
    display: grid;
    gap: 24px;
    position: relative;
    z-index: 1;
  }
  .planner-board {
    background:
      radial-gradient(circle, rgba(201, 179, 104, 0.45) 1.4px, transparent 1.5px),
      linear-gradient(180deg, #fff9ea 0%, #fff3cf 100%);
    background-size: 36px 36px, 100% 100%;
    border: 5px solid #17151f;
    border-radius: 28px;
    box-shadow: 0 0 0 4px rgba(255,255,255,0.42) inset;
    padding: 34px 30px 40px;
    position: relative;
    overflow: hidden;
  }
  .planner-board::before {
    content: '';
    position: absolute;
    inset: 16px;
    border: 2px solid rgba(23, 21, 31, 0.08);
    border-radius: 22px;
    pointer-events: none;
  }
  .planner-hero {
    display: grid;
    gap: 14px;
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
    max-width: 760px;
  }
  .planner-title {
    margin: 0;
    font: 400 clamp(48px, 7vw, 94px) 'Bangers', cursive;
    line-height: 0.9;
    letter-spacing: 0.05em;
    color: #ff6b6b;
    text-shadow: 6px 0 0 #17151f, 12px 0 0 rgba(255, 107, 107, 0.18);
  }
  .planner-subtitle {
    margin: 0;
    max-width: 58ch;
    color: #556077;
    line-height: 1.6;
    font-weight: 800;
    font-size: 18px;
  }
  .glass, .card {
    border-radius: 22px;
    border: 4px solid #17151f;
    background: #fffdf7;
    box-shadow: 8px 8px 0 #17151f;
    position: relative;
    overflow: hidden;
  }
  .glass::before, .card::before, .crew-member::before, .recommendation::before, .pill-list::before, .summary-box::before {
    content: '';
    position: absolute;
    inset: 0;
    background: transparent;
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
  .chip-btn {
    border: 3px solid #17151f;
    background: #fff3c8;
    color: #17151f;
    padding: 9px 14px;
    border-radius: 999px;
    cursor: pointer;
    font: 400 14px 'Bangers', cursive;
    letter-spacing: 0.06em;
    box-shadow: 3px 3px 0 #17151f;
    transition: transform 160ms ease, box-shadow 160ms ease;
    position: relative;
    z-index: 1;
  }
  .chip-btn:hover {
    transform: translate(-1px, -2px);
    box-shadow: 5px 5px 0 #17151f;
  }
  .brand-btn, .btn, .option-btn, .mini-btn {
    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }
  .brand-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: none;
    border: none;
    cursor: pointer;
    color: #17151f;
    position: relative;
    z-index: 1;
  }
  .logo {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: #ff7a59;
    border: 3px solid #17151f;
    display: grid;
    place-items: center;
    box-shadow: 4px 4px 0 #17151f;
    transform: rotate(-7deg);
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 22px;
  }
  .main-stack {
    display: grid;
    gap: 18px;
  }
  .card-header {
    display: grid;
    gap: 8px;
    margin-bottom: 18px;
  }
  .planner-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  .planner-stat {
    border-radius: 16px;
    border: 3px solid #17151f;
    background: #fff7de;
    box-shadow: 4px 4px 0 #17151f;
    padding: 14px 16px;
  }
  .field-note {
    font-size: 13px;
    color: #667085;
    font-weight: 700;
    line-height: 1.4;
  }
  .section-block {
    display: grid;
    gap: 14px;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .field {
    display: grid;
    gap: 8px;
    position: relative;
    z-index: 1;
  }
  .field.full {
    grid-column: 1 / -1;
  }
  .field label {
    font-size: 14px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #17151f;
    font-family: 'Bangers', cursive;
  }
  .field input, .field select, .field textarea {
    width: 100%;
    border: 3px solid #17151f;
    border-radius: 12px;
    padding: 13px 14px;
    background: #fff7e4;
    font: 700 15px 'Nunito', sans-serif;
    color: #17151f;
    outline: none;
    box-shadow: 3px 3px 0 #17151f;
  }
  .field input:focus, .field select:focus, .field textarea:focus {
    border-color: #ff6b6b;
    box-shadow: 4px 4px 0 #ff6b6b;
  }
  .field textarea {
    min-height: 112px;
    resize: vertical;
  }
  .btn, .mini-btn {
    border: 3px solid #17151f;
    cursor: pointer;
    font: 400 14px 'Bangers', cursive;
    letter-spacing: 0.06em;
    box-shadow: 4px 4px 0 #17151f;
    position: relative;
    z-index: 1;
  }
  .btn {
    border-radius: 12px;
    padding: 13px 16px;
  }
  .btn.primary {
    background: #ff6b6b;
    color: white;
  }
  .btn.secondary {
    background: #ffd93d;
    color: #17151f;
  }
  .btn.ghost, .mini-btn {
    background: #ffffff;
    color: #17151f;
  }
  .btn:hover, .option-btn:hover, .mini-btn:hover, .crew-member:hover { transform: translate(-1px, -2px); }
  .crew-member, .recommendation, .pill-list, .invite-item {
    border-radius: 18px;
    border: 3px solid #17151f;
    background: #fff8ea;
    box-shadow: 5px 5px 0 #17151f;
    position: relative;
    overflow: hidden;
  }
  .crew-member {
    padding: 14px;
    cursor: pointer;
  }
  .crew-member.active {
    background: #eefcff;
    border-color: #00a8cc;
    box-shadow: 6px 6px 0 #00a8cc;
  }
  .option-btn {
    width: 100%;
    border: 3px solid #17151f;
    border-radius: 14px;
    background: #fff5de;
    padding: 14px;
    text-align: left;
    cursor: pointer;
    box-shadow: 3px 3px 0 #17151f;
  }
  .pill-list {
    padding: 14px;
  }
  .pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 999px;
    border: 3px solid #17151f;
    background: #fff3c8;
    font-size: 13px;
    font-weight: 900;
    box-shadow: 3px 3px 0 #17151f;
    position: relative;
    z-index: 1;
  }
  .mini-btn {
    padding: 8px 10px;
    border-radius: 999px;
  }
  .sidebar-stack {
    display: grid;
    gap: 16px;
    align-content: start;
    position: sticky;
    top: 24px;
    height: fit-content;
  }
  .summary-box {
    border-radius: 18px;
    padding: 16px;
    background: #fff7de;
    border: 3px solid #17151f;
    box-shadow: 5px 5px 0 #17151f;
    position: relative;
    overflow: hidden;
  }
  .recommendation {
    padding: 16px;
  }
  .bangers {
    font-family: 'Bangers', cursive;
    letter-spacing: 0.04em;
  }
  .comic-kicker {
    display: inline-flex;
    width: fit-content;
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
  .section-title {
    margin: 0 0 14px;
    font: 400 24px 'Bangers', cursive;
    letter-spacing: 0.05em;
  }
  .status-chip {
    display: inline-flex;
    padding: 8px 12px;
    border-radius: 999px;
    border: 3px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    font-weight: 900;
  }
  @media (max-width: 1080px) {
    .layout, .form-grid {
      grid-template-columns: 1fr;
    }
    .sidebar-stack {
      position: static;
    }
  }
  @media (max-width: 720px) {
    .shell { padding: 16px 12px 36px; }
    .glass, .card { padding: 18px; border-radius: 24px; }
    .planner-board { padding: 24px 18px 28px; }
  }
`;

function memberKey(member) {
  return member.userId || member.username || member.name;
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function formatDurationHours(value) {
  if (!Number.isFinite(value) || value <= 0) return "Flexible";
  return `${value} hour${value === 1 ? "" : "s"}`;
}

export default function OutsidersCreateHangout({ onNavigate, appData, setAppData }) {
  const groups = appData?.groups || [];
  const profile = appData?.profile || {};
  const profileName = profile.name || profile.username || "You";
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  const [form, setForm] = useState({
    name: "",
    description: "",
    manualDate: "",
    manualTime: "",
    manualLocation: "",
    externalInvite: "",
  });
  const [duration, setDuration] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [timeOptions, setTimeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [externalInvites, setExternalInvites] = useState([]);
  const [createdProposalId, setCreatedProposalId] = useState(null);
  const [error, setError] = useState("");

  const selectedGroup = groups.find((group) => String(group.id) === String(selectedGroupId)) || groups[0] || null;
  const participants = useMemo(() => selectedGroup?.members ?? [], [selectedGroup]);
  const participantPool = useMemo(() => {
    const chosenKeys = selectedMembers.length ? selectedMembers : participants.map(memberKey);
    return participants
      .filter((member) => chosenKeys.includes(memberKey(member)))
      .map((member) => ({
        id: memberKey(member),
        name: member.name,
        availability: member.availability || null,
      }));
  }, [participants, selectedMembers]);

  const parsedDurationHours = duration === "" ? null : Number(duration);
  const hasCustomDuration = Number.isFinite(parsedDurationHours) && parsedDurationHours > 0;
  const durationHours = hasCustomDuration ? parsedDurationHours : null;
  const durationMinutes = hasCustomDuration ? Math.max(30, Math.round(parsedDurationHours * 60)) : 120;

  const recommendations = useMemo(
    () => recommendHangoutTimes(participantPool, { durationMinutes }),
    [durationMinutes, participantPool]
  );

  const createdProposal = useMemo(
    () => selectedGroup?.hangoutProposals?.find((proposal) => proposal.id === createdProposalId) || null,
    [createdProposalId, selectedGroup]
  );

  const toggleMember = (member) => {
    const key = memberKey(member);
    setSelectedMembers((prev) => (
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    ));
  };

  const addRecommendedTime = (rec) => {
    const option = {
      id: createId("time"),
      label: `${rec.day} · ${formatTimeLabel(rec.start)} - ${formatTimeLabel(rec.end)}`,
      meta: { day: rec.day, start: rec.start, end: rec.end },
    };
    setTimeOptions((prev) => prev.some((item) => item.label === option.label) ? prev : [...prev, option]);
  };

  const addManualTime = () => {
    if (!form.manualDate || !form.manualTime) return;
    const date = new Date(`${form.manualDate}T${form.manualTime}`);
    const option = {
      id: createId("time"),
      label: `${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${formatTimeLabel(form.manualTime)}`,
      meta: { date: form.manualDate, time: form.manualTime },
    };
    setTimeOptions((prev) => prev.some((item) => item.label === option.label) ? prev : [...prev, option]);
  };

  const addLocationOption = () => {
    if (!form.manualLocation.trim()) return;
    const option = { id: createId("place"), label: form.manualLocation.trim() };
    setLocationOptions((prev) => prev.some((item) => item.label === option.label) ? prev : [...prev, option]);
    setForm((prev) => ({ ...prev, manualLocation: "" }));
  };

  const addExternalInvite = () => {
    const value = form.externalInvite.trim();
    if (!value) return;
    setExternalInvites((prev) => prev.includes(value) ? prev : [...prev, value]);
    setForm((prev) => ({ ...prev, externalInvite: "" }));
  };

  const createProposal = () => {
    if (!selectedGroup) {
      setError("Create or join a crew first.");
      return;
    }
    if (!form.name.trim()) {
      setError("Give the hangout a name.");
      return;
    }
    if (!timeOptions.length) {
      setError("Add at least one time option.");
      return;
    }
    if (!locationOptions.length) {
      setError("Add at least one place option.");
      return;
    }

    const code = generateCode();
    const chosenMemberKeys = selectedMembers.length ? selectedMembers : participants.map(memberKey);
    const proposalParticipants = participants.filter((member) => chosenMemberKeys.includes(memberKey(member)));
    const proposal = {
      id: createId("proposal"),
      name: form.name.trim(),
      description: form.description.trim(),
      durationHours,
      durationMinutes: durationHours ? durationMinutes : null,
      groupId: selectedGroup.id,
      groupName: selectedGroup.name,
      status: "proposed",
      code,
      link: buildHangoutInviteLink(code),
      createdAt: new Date().toISOString(),
      proposerName: getDisplayName(profile),
      proposerKey: getCurrentUserKey(profile),
      timeOptions,
      locationOptions,
      votes: { availability: {}, vibe: {}, time: {}, location: {} },
      participants: proposalParticipants,
      externalInvites,
      recommendations,
      finalizedChoice: null,
    };

    const otherMembers = proposalParticipants.filter((member) => member.name !== getDisplayName(profile));
    const memberNotifications = otherMembers.map((member) => ({
      id: createId("note"),
      type: "hangout-invite",
      message: `${getDisplayName(profile)} invited you to ${proposal.name}.`,
      groupId: selectedGroup.id,
      groupName: selectedGroup.name,
      proposalId: proposal.id,
      proposalCode: proposal.code,
      link: proposal.link,
      recipient: member.name,
      actionScreen: "join-hangout",
      actionParams: { code: proposal.code },
      createdAt: new Date().toISOString(),
      read: false,
    }));
    const externalNotifications = externalInvites.map((invite) => ({
      id: createId("note"),
      type: "hangout-invite",
      message: `Invite ready for ${invite}: ${proposal.name}.`,
      groupId: selectedGroup.id,
      groupName: selectedGroup.name,
      proposalId: proposal.id,
      proposalCode: proposal.code,
      link: proposal.link,
      recipient: invite,
      actionScreen: "join-hangout",
      actionParams: { code: proposal.code },
      createdAt: new Date().toISOString(),
      read: false,
    }));

    setAppData?.((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (
        group.id === selectedGroup.id
          ? { ...group, hangoutProposals: [...(group.hangoutProposals || []), proposal] }
          : group
      )),
      hangouts: [...(prev.hangouts || []), proposal],
      notifications: [...(prev.notifications || []), ...memberNotifications, ...externalNotifications],
    }));

    setCreatedProposalId(proposal.id);
    setError("");
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav activeLabel="Hangouts" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length}>
        <div className="shell">
          {!createdProposal ? (
            <section className="planner-board">
            <div className="planner-hero">
              <div className="comic-kicker">Hangout Planner</div>
              <h1 className="planner-title">Pitch The Next Hangout.</h1>
              <p className="planner-subtitle">
                Any crew member can propose a hangout now. Add multiple time and place options so everyone can vote inside the crew without the page feeling scattered.
              </p>
            </div>
            <div className="layout">
              <section className="main-stack">
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h2 className="section-title" style={{ marginBottom: 6 }}>Planner Setup</h2>
                      <p style={{ margin: 0, color: "#556077", lineHeight: 1.6 }}>
                        Start with the crew, lock the vibe, and build the options the whole group will vote on.
                      </p>
                    </div>
                  </div>
                  <div className="planner-stats" style={{ marginBottom: 18 }}>
                    <div className="planner-stat">
                      <div className="bangers" style={{ fontSize: 15, marginBottom: 6 }}>Crew</div>
                      <div style={{ fontWeight: 900 }}>{selectedGroup ? `${selectedGroup.emoji} ${selectedGroup.name}` : "Not chosen yet"}</div>
                    </div>
                    <div className="planner-stat">
                      <div className="bangers" style={{ fontSize: 15, marginBottom: 6 }}>Duration</div>
                      <div style={{ fontWeight: 900 }}>{formatDurationHours(durationHours)}</div>
                    </div>
                    <div className="planner-stat">
                      <div className="bangers" style={{ fontSize: 15, marginBottom: 6 }}>Picked so far</div>
                      <div style={{ fontWeight: 900 }}>{timeOptions.length} times · {locationOptions.length} places</div>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label>Crew</label>
                      <select value={selectedGroup?.id || ""} onChange={(event) => setSelectedGroupId(event.target.value)}>
                        {groups.length ? groups.map((group) => (
                          <option key={group.id} value={group.id}>{group.emoji} {group.name}</option>
                        )) : <option value="">No crew yet</option>}
                      </select>
                    </div>
                    <div className="field">
                      <label>Duration In Hours</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={duration}
                        onChange={(event) => setDuration(event.target.value)}
                        placeholder="2"
                      />
                      <div className="field-note">Optional. Enter hours like 1.5 or 2. Leave it blank if the crew can decide later.</div>
                    </div>
                    <div className="field full">
                      <label>Hangout name</label>
                      <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Sunset rooftop link-up" />
                    </div>
                    <div className="field full">
                      <label>Description</label>
                      <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Drop the vibe, dress code, and what makes this one worth voting for." />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header" style={{ marginBottom: 14 }}>
                    <div>
                      <h2 className="section-title" style={{ marginBottom: 6 }}>Pick The Crew Members Involved</h2>
                      <p style={{ margin: 0, color: "#667085" }}>Recommendations use the availability saved on each member profile.</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {participants.length ? participants.map((member) => {
                      const selected = selectedMembers.length ? selectedMembers.includes(memberKey(member)) : true;
                      return (
                        <button key={memberKey(member)} type="button" className={`crew-member ${selected ? "active" : ""}`} onClick={() => toggleMember(member)}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                            <strong>{member.name}</strong>
                            <span style={{ color: selected ? "#0f766e" : "#667085", fontWeight: 700 }}>{selected ? "Included" : "Tap to include"}</span>
                          </div>
                          <p style={{ margin: "8px 0 0", color: "#667085", textAlign: "left" }}>{availabilityToText(member.availability)}</p>
                        </button>
                      );
                    }) : (
                      <p style={{ margin: 0, color: "#667085" }}>Create or join a crew first.</p>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h2 className="section-title">Time Options</h2>
                  <div className="section-block">
                  <div className="form-grid">
                    <div className="field">
                      <label>Date</label>
                      <input type="date" value={form.manualDate} onChange={(event) => setForm((prev) => ({ ...prev, manualDate: event.target.value }))} />
                    </div>
                    <div className="field">
                      <label>Time</label>
                      <input type="time" value={form.manualTime} onChange={(event) => setForm((prev) => ({ ...prev, manualTime: event.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                    <button type="button" className="btn secondary" onClick={addManualTime}>Add manual time option</button>
                  </div>
                  <div className="pill-list">
                    <strong>Chosen time options</strong>
                    <div className="pill-row">
                      {timeOptions.length ? timeOptions.map((option) => (
                        <span key={option.id} className="pill">
                          {option.label}
                          <button type="button" className="mini-btn" onClick={() => setTimeOptions((prev) => prev.filter((item) => item.id !== option.id))}>Remove</button>
                        </span>
                      )) : <span style={{ color: "#667085" }}>No time options added yet.</span>}
                    </div>
                  </div>
                  </div>
                </div>

                <div className="card">
                  <h2 className="section-title">Place Options And External Invites</h2>
                  <div className="section-block">
                  <div className="form-grid">
                    <div className="field">
                      <label>Location idea</label>
                      <input value={form.manualLocation} onChange={(event) => setForm((prev) => ({ ...prev, manualLocation: event.target.value }))} placeholder="Harbor rooftop, pizza spot, game bar..." />
                    </div>
                    <div className="field">
                      <label>Invite someone outside this crew</label>
                      <input value={form.externalInvite} onChange={(event) => setForm((prev) => ({ ...prev, externalInvite: event.target.value }))} placeholder="name, @handle, or phone note" />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                    <button type="button" className="btn secondary" onClick={addLocationOption}>Add place option</button>
                    <button type="button" className="btn ghost" onClick={addExternalInvite}>Add outside invite</button>
                  </div>
                  <div className="pill-list" style={{ marginTop: 16 }}>
                    <strong>Location options</strong>
                    <div className="pill-row">
                      {locationOptions.length ? locationOptions.map((option) => (
                        <span key={option.id} className="pill">
                          {option.label}
                          <button type="button" className="mini-btn" onClick={() => setLocationOptions((prev) => prev.filter((item) => item.id !== option.id))}>Remove</button>
                        </span>
                      )) : <span style={{ color: "#667085" }}>No places added yet.</span>}
                    </div>
                  </div>
                  <div className="pill-list" style={{ marginTop: 12 }}>
                    <strong>External invites for this hangout</strong>
                    <div className="pill-row">
                      {externalInvites.length ? externalInvites.map((invite) => (
                        <span key={invite} className="pill">
                          {invite}
                          <button type="button" className="mini-btn" onClick={() => setExternalInvites((prev) => prev.filter((item) => item !== invite))}>Remove</button>
                        </span>
                      )) : <span style={{ color: "#667085" }}>No outside guests added yet.</span>}
                    </div>
                  </div>
                  </div>
                </div>
              </section>

              <aside className="sidebar-stack">
                <div className="card">
                  <h2 className="section-title">Availability Recommendations</h2>
                  <p className="field-note" style={{ margin: "0 0 14px" }}>
                    {durationHours
                      ? `These suggestions are based on a ${formatDurationHours(durationHours).toLowerCase()} hangout.`
                      : "These suggestions use a 2-hour default until you add a duration."}
                  </p>
                  <div style={{ display: "grid", gap: 12 }}>
                    {recommendations.length ? recommendations.map((rec, index) => (
                      <div key={`${rec.day}-${rec.start}`} className="recommendation">
                        <strong style={{ display: "block", marginBottom: 8 }}>{index === 0 ? "Best overlap" : `Option ${index + 1}`}</strong>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>{rec.day} · {formatTimeLabel(rec.start)} - {formatTimeLabel(rec.end)}</div>
                        <div style={{ color: "#667085", marginBottom: 12 }}>{rec.availableCount}/{rec.totalCount} people free</div>
                        <button type="button" className="btn secondary" onClick={() => addRecommendedTime(rec)}>Add this time</button>
                      </div>
                    )) : (
                      <div className="summary-box">
                        <strong>No recommendations yet.</strong>
                        <p style={{ margin: "8px 0 0", color: "#667085" }}>Select crew members with saved availability to get smarter time suggestions.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h2 className="section-title">Hangout Summary</h2>
                  <div className="summary-box">
                    <p style={{ margin: "0 0 10px", fontWeight: 700 }}>{selectedGroup ? `${selectedGroup.emoji} ${selectedGroup.name}` : "No crew selected"}</p>
                    <p style={{ margin: "0 0 10px", color: "#667085" }}>Duration: {formatDurationHours(durationHours)}</p>
                    <p style={{ margin: "0 0 10px", color: "#667085" }}>{timeOptions.length} time options · {locationOptions.length} place options · {externalInvites.length} external invite{externalInvites.length === 1 ? "" : "s"}</p>
                    <p style={{ margin: 0, color: "#667085" }}>Once you post this, everyone in the crew can vote on every option inside the crew page.</p>
                  </div>
                  {error ? <p style={{ margin: "14px 0 0", color: "#b42318", fontWeight: 700 }}>{error}</p> : null}
                  <button type="button" className="btn primary" style={{ width: "100%", marginTop: 16 }} onClick={createProposal}>
                    Share hangout with crew
                  </button>
                </div>

                <div className="card">
                  <h2 className="section-title">Posting Checklist</h2>
                  <div className="summary-box">
                    <p style={{ margin: "0 0 10px", color: "#667085" }}>{timeOptions.length ? "✓" : "•"} Add at least one time option.</p>
                    <p style={{ margin: "0 0 10px", color: "#667085" }}>{locationOptions.length ? "✓" : "•"} Add at least one place option.</p>
                    <p style={{ margin: "0 0 10px", color: "#667085" }}>{form.name.trim() ? "✓" : "•"} Give the hangout a clear name.</p>
                    <p style={{ margin: 0, color: "#667085" }}>{selectedGroup ? "✓" : "•"} Make sure the right crew is selected.</p>
                  </div>
                </div>
              </aside>
            </div>
            </section>
          ) : (
            <div className="card" style={{ maxWidth: 760, margin: "0 auto" }}>
              <div className="status-chip" style={{ background: "#eefdf5", color: "#0f766e" }}>Hangout Shared</div>
              <h1 className="bangers" style={{ margin: "14px 0 8px", fontSize: 42 }}>{createdProposal.name}</h1>
              <p style={{ margin: "0 0 16px", color: "#667085" }}>The crew can now vote on this hangout inside {createdProposal.groupName}. Notifications have been added for the rest of the crew.</p>
              <div className="summary-box">
                <strong style={{ display: "block", marginBottom: 8 }}>Invite code</strong>
                <p style={{ margin: "0 0 10px", color: "#667085" }}>Duration: {formatDurationHours(createdProposal.durationHours)}</p>
                <div className="bangers" style={{ fontSize: 42, letterSpacing: "0.18em" }}>{createdProposal.code}</div>
                <p style={{ margin: "10px 0 0", color: "#667085" }}>{createdProposal.link}</p>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                <button type="button" className="btn primary" onClick={() => onNavigate?.("friend-groups")}>Open crew voting</button>
                <button type="button" className="btn ghost" onClick={() => onNavigate?.("create-hangout")}>Create another</button>
              </div>
            </div>
          )}
        </div>
        </OutsidersSideNav>
      </div>
    </>
  );
}
