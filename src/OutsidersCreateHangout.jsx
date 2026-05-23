import { useMemo, useState } from "react";
import { createId, getCurrentUserKey, getDisplayName } from "./appState";
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
    background:
      radial-gradient(circle at top left, rgba(255, 217, 61, 0.46), transparent 28%),
      radial-gradient(circle at top right, rgba(110, 215, 255, 0.24), transparent 24%),
      linear-gradient(180deg, #fff7cc 0%, #fffef6 40%, #f5efe0 100%);
    position: relative;
  }
  .root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, rgba(23, 21, 31, 0.14) 1.1px, transparent 1.3px);
    background-size: 22px 22px;
    opacity: 0.5;
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
  .glass, .card {
    border-radius: 22px;
    border: 4px solid #17151f;
    background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,250,240,0.98));
    box-shadow: 8px 8px 0 #17151f;
    position: relative;
    overflow: hidden;
  }
  .glass::before, .card::before, .crew-member::before, .recommendation::before, .pill-list::before, .summary-box::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(255,255,255,0.64), transparent 28%);
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
    background: linear-gradient(135deg, #ff6b6b, #ff9a3c);
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
    background: linear-gradient(180deg, #fffef8, #fff7e4);
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
    background: linear-gradient(135deg, #ff6b6b, #ff8b6b);
    color: white;
  }
  .btn.secondary {
    background: linear-gradient(135deg, #ffd93d, #ffb347);
    color: #17151f;
  }
  .btn.ghost, .mini-btn {
    background: linear-gradient(180deg, #ffffff, #fff3c8);
    color: #17151f;
  }
  .btn:hover, .option-btn:hover, .mini-btn:hover, .crew-member:hover { transform: translate(-1px, -2px); }
  .crew-member, .recommendation, .pill-list, .invite-item {
    border-radius: 18px;
    border: 3px solid #17151f;
    background: linear-gradient(180deg, #fffef9, #fff8ea);
    box-shadow: 5px 5px 0 #17151f;
    position: relative;
    overflow: hidden;
  }
  .crew-member {
    padding: 14px;
    cursor: pointer;
  }
  .crew-member.active {
    background: linear-gradient(180deg, #eefcff, #ebfff4);
    border-color: #00a8cc;
    box-shadow: 6px 6px 0 #00a8cc;
  }
  .option-btn {
    width: 100%;
    border: 3px solid #17151f;
    border-radius: 14px;
    background: linear-gradient(180deg, #ffffff, #fff5de);
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
    background: linear-gradient(180deg, #ffffff, #fff3c8);
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
  }
  .summary-box {
    border-radius: 18px;
    padding: 16px;
    background: linear-gradient(180deg, #fff7de, #fffef9);
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
  }
  @media (max-width: 720px) {
    .shell { padding: 16px 12px 36px; }
    .glass, .card { padding: 18px; border-radius: 24px; }
  }
`;

function memberKey(member) {
  return member.userId || member.username || member.name;
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function OutsidersCreateHangout({ onNavigate, appData, setAppData }) {
  const groups = appData?.groups || [];
  const profile = appData?.profile || {};
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  const [form, setForm] = useState({
    name: "",
    description: "",
    manualDate: "",
    manualTime: "",
    manualLocation: "",
    externalInvite: "",
  });
  const [duration, setDuration] = useState(120);
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

  const recommendations = useMemo(
    () => recommendHangoutTimes(participantPool, { durationMinutes: Number(duration) || 120 }),
    [duration, participantPool]
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
      setError("Give the proposal a name.");
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
    const proposal = {
      id: createId("proposal"),
      name: form.name.trim(),
      description: form.description.trim(),
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
      participants: participants.filter((member) => (selectedMembers.length ? selectedMembers : participants.map(memberKey)).includes(memberKey(member))),
      externalInvites,
      recommendations,
      finalizedChoice: null,
    };

    const otherMembers = selectedGroup.members.filter((member) => member.name !== getDisplayName(profile));
    const notifications = otherMembers.map(() => ({
      id: createId("note"),
      type: "hangout-proposal",
      message: `${getDisplayName(profile)} in your crew has proposed a hangout!`,
      groupId: selectedGroup.id,
      groupName: selectedGroup.name,
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
      notifications: [...(prev.notifications || []), ...notifications],
    }));

    setCreatedProposalId(proposal.id);
    setError("");
  };

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
                <div className="bangers" style={{ fontSize: 24 }}>Create A Hangout Proposal</div>
                <div style={{ fontSize: 12, color: "#7a8294" }}>Crew-scoped planning and voting</div>
              </div>
            </button>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn ghost" onClick={() => onNavigate?.("dashboard")}>Dashboard</button>
              <button type="button" className="btn ghost" onClick={() => onNavigate?.("profile")}>Availability</button>
              <button type="button" className="btn ghost" onClick={() => onNavigate?.("friend-groups")}>Open My Crew</button>
            </div>
          </div>

          {!createdProposal ? (
            <div className="layout">
              <section style={{ display: "grid", gap: 18 }}>
                <div className="card">
                  <div style={{ marginBottom: 18 }}>
                    <div className="comic-kicker">Proposal Composer</div>
                    <h1 className="bangers" style={{ margin: "14px 0 8px", fontSize: 42 }}>Pitch the next hangout.</h1>
                    <p style={{ margin: 0, color: "#556077", lineHeight: 1.6 }}>
                      Any crew member can propose a hangout now. Add multiple time and place options so everyone can vote inside the crew.
                    </p>
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
                      <label>Duration</label>
                      <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                        <option value={180}>3 hours</option>
                      </select>
                    </div>
                    <div className="field full">
                      <label>Proposal name</label>
                      <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Sunset rooftop link-up" />
                    </div>
                    <div className="field full">
                      <label>Description</label>
                      <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Drop the vibe, dress code, and what makes this one worth voting for." />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
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
                  <div className="form-grid" style={{ marginBottom: 16 }}>
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

                <div className="card">
                  <h2 className="section-title">Place Options And External Invites</h2>
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
                    <strong>External invites in this crew proposal</strong>
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
              </section>

              <aside className="sidebar-stack">
                <div className="card">
                  <h2 className="section-title">Availability Recommendations</h2>
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
                  <h2 className="section-title">Proposal Summary</h2>
                  <div className="summary-box">
                    <p style={{ margin: "0 0 10px", fontWeight: 700 }}>{selectedGroup ? `${selectedGroup.emoji} ${selectedGroup.name}` : "No crew selected"}</p>
                    <p style={{ margin: "0 0 10px", color: "#667085" }}>{timeOptions.length} time options · {locationOptions.length} place options · {externalInvites.length} external invite{externalInvites.length === 1 ? "" : "s"}</p>
                    <p style={{ margin: 0, color: "#667085" }}>Once you post this, everyone in the crew can vote on every option inside the crew page.</p>
                  </div>
                  {error ? <p style={{ margin: "14px 0 0", color: "#b42318", fontWeight: 700 }}>{error}</p> : null}
                  <button type="button" className="btn primary" style={{ width: "100%", marginTop: 16 }} onClick={createProposal}>
                    Post proposal to crew
                  </button>
                </div>
              </aside>
            </div>
          ) : (
            <div className="card" style={{ maxWidth: 760, margin: "0 auto" }}>
              <div className="status-chip" style={{ background: "#eefdf5", color: "#0f766e" }}>Proposal Posted</div>
              <h1 className="bangers" style={{ margin: "14px 0 8px", fontSize: 42 }}>{createdProposal.name}</h1>
              <p style={{ margin: "0 0 16px", color: "#667085" }}>The crew can now vote on the proposal inside {createdProposal.groupName}. Notifications have been added for the rest of the crew.</p>
              <div className="summary-box">
                <strong style={{ display: "block", marginBottom: 8 }}>Invite code</strong>
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
      </div>
    </>
  );
}
