import { useEffect, useMemo, useState } from "react";
import { buildHangoutInviteLink } from "./siteConfig";
import { isSupabaseConfigured, supabase } from "./supabase";
import { availabilityToText, formatTimeLabel, recommendHangoutTimes } from "./scheduling";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { background: #fffdf9; margin: 0; }
  .root { font-family: 'Nunito', sans-serif; background: #fffdf9; color: #1a1a2e; min-height: 100vh; display: flex; flex-direction: column; }
  .root::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px); background-size: 20px 20px; opacity: 0.04; pointer-events: none; z-index: 0; }
  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }
  .nav-bar { border-bottom: 4px solid #1a1a2e; background: #fffdf9; box-shadow: 0 4px 0 #1a1a2e; position: relative; z-index: 10; }
  .logo-mark { width: 38px; height: 38px; background: #ff6b6b; border: 3px solid #1a1a2e; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 3px 3px 0 #1a1a2e; }
  .logo-link { display: inline-flex; align-items: center; gap: 10px; background: none; border: none; padding: 0; cursor: pointer; }
  .page { flex: 1; padding: 36px 24px 56px; position: relative; z-index: 1; }
  .shell { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 24px; align-items: start; }
  .card { background: #fff; border: 3px solid #1a1a2e; border-radius: 18px; box-shadow: 6px 6px 0 #1a1a2e; padding: 22px 24px; }
  .hero { background: #e8f4fd; border-color: #4ecdc4; box-shadow: 6px 6px 0 #4ecdc4; margin-bottom: 24px; }
  .form-label { display: block; font-family: 'Bangers', cursive; font-size: 16px; letter-spacing: 0.05em; color: #1a1a2e; margin-bottom: 8px; }
  .form-input { width: 100%; padding: 13px 16px; font-size: 15px; font-family: 'Nunito', sans-serif; font-weight: 800; color: #1a1a2e; background: #fffdf9; border: 3px solid #1a1a2e; border-radius: 10px; outline: none; box-shadow: 4px 4px 0 #1a1a2e; }
  .form-input:focus { border-color: #ff6b6b; box-shadow: 4px 4px 0 #ff6b6b; }
  .btn-primary, .btn-secondary, .btn-outline { border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 16px; padding: 10px 18px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-primary { background: #ff6b6b; color: #fff; }
  .btn-secondary { background: #ffd93d; color: #1a1a2e; }
  .btn-outline { background: #fff; color: #1a1a2e; }
  .btn-primary:hover, .btn-secondary:hover, .btn-outline:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .comic-tag { display: inline-block; background: #ffd93d; border: 2px solid #1a1a2e; border-radius: 6px; padding: 1px 10px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.06em; box-shadow: 2px 2px 0 #1a1a2e; transform: rotate(-2deg); margin-bottom: 10px; }
  .error-msg { font-family: 'Bangers', cursive; font-size: 15px; color: #ff6b6b; margin-top: 6px; letter-spacing: 0.04em; }
  .participant { background: #fffdf9; border: 3px solid #1a1a2e; border-radius: 14px; padding: 14px; box-shadow: 4px 4px 0 #1a1a2e; }
  .participant.selected { background: #e8fde8; border-color: #51cf66; box-shadow: 4px 4px 0 #51cf66; }
  .recommendation { background: #fff4e6; border: 3px solid #ff9a3c; border-radius: 14px; padding: 16px; box-shadow: 4px 4px 0 #ff9a3c; }
  .pill { display: inline-flex; border: 2px solid #1a1a2e; border-radius: 999px; padding: 3px 9px; font-size: 12px; font-weight: 900; background: #fff; margin: 3px; }
  .code-box { background: #1a1a2e; color: #ffd93d; border-radius: 14px; padding: 18px; text-align: center; font-family: 'Bangers', cursive; font-size: 42px; letter-spacing: 0.25em; box-shadow: 5px 5px 0 #ff6b6b; user-select: all; }
  .link-box { background: #fffdf9; border: 3px solid #1a1a2e; border-radius: 10px; padding: 12px 16px; font-size: 13px; font-weight: 800; color: #555; word-break: break-all; box-shadow: 3px 3px 0 #1a1a2e; }
  @media (max-width: 980px) { .shell { grid-template-columns: 1fr; } }
`;

function generateCode(existingHangouts) {
  const used = new Set((existingHangouts || []).map((hangout) => hangout?.code).filter(Boolean));
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    if (!used.has(code)) return code;
  }
  return `${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function memberKey(member) {
  return member.userId || member.username || member.name;
}

const IconLogoMark = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>;

export default function OutsidersCreateHangout({ onNavigate, appData, setAppData }) {
  const groups = appData?.groups || [];
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  const selectedGroup = groups.find((group) => String(group.id) === String(selectedGroupId)) || groups[0] || null;
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [profilesById, setProfilesById] = useState({});
  const [form, setForm] = useState({ name: "", date: "", time: "", location: "", vibe: "" });
  const [duration, setDuration] = useState(120);
  const [errors, setErrors] = useState({});
  const [hangout, setHangout] = useState(null);
  const [saveError, setSaveError] = useState("");
  const selectedGroupMembers = useMemo(() => selectedGroup?.members || [], [selectedGroup]);

  useEffect(() => {
    queueMicrotask(() => {
      setSelectedKeys(selectedGroupMembers.map(memberKey).filter(Boolean));
    });
  }, [selectedGroupMembers]);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setCurrentUser(data.user || null);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !selectedGroup?.members?.length) return;
    const ids = selectedGroup.members.map((member) => member.userId).filter(Boolean);
    if (!ids.length) return;
    supabase
      .from("profiles")
      .select("id, full_name, username, availability")
      .in("id", ids)
      .then(({ data }) => {
        const next = {};
        (data || []).forEach((profile) => { next[profile.id] = profile; });
        setProfilesById((prev) => ({ ...prev, ...next }));
      });
  }, [selectedGroup]);

  const participants = useMemo(() => (
    (selectedGroup?.members || []).map((member) => {
      const profile = member.userId ? profilesById[member.userId] : null;
      return {
        id: memberKey(member),
        userId: member.userId || null,
        name: profile?.full_name || member.name,
        username: profile?.username || member.username || "",
        selected: selectedKeys.includes(memberKey(member)),
        availability: profile?.availability || member.availability || null,
      };
    })
  ), [profilesById, selectedGroup, selectedKeys]);

  const selectedParticipants = participants.filter((person) => person.selected);
  const recommendations = useMemo(
    () => recommendHangoutTimes(selectedParticipants, { durationMinutes: Number(duration) || 120 }),
    [duration, selectedParticipants]
  );

  const toggleParticipant = (key) => {
    setSelectedKeys((prev) => prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]);
  };

  const applyRecommendation = (rec) => {
    setForm((prev) => ({ ...prev, date: "", time: rec.start }));
    setErrors((prev) => ({ ...prev, time: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Give your hangout a name.";
    if (!form.location.trim()) next.location = "Add a location.";
    if (!form.time) next.time = "Pick a time or use a recommendation.";
    if (!selectedParticipants.length) next.participants = "Select at least one participant.";
    return next;
  };

  const handleCreate = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const code = generateCode(appData?.hangouts);
    const createdHangout = {
      id: Date.now(),
      name: form.name.trim(),
      date: form.date,
      time: form.time,
      location: form.location.trim(),
      vibe: form.vibe.trim(),
      code,
      link: buildHangoutInviteLink(code),
      groupId: selectedGroup?.id || null,
      groupName: selectedGroup?.name || "",
      participants: selectedParticipants,
      recommendations,
      members: selectedParticipants.map((person) => person.name.slice(0, 2).toUpperCase()),
      ratings: [],
    };

    if (isSupabaseConfigured && currentUser?.id) {
      const { data, error } = await supabase.rpc("create_hangout", {
        hangout_name: createdHangout.name,
        hangout_date: createdHangout.date,
        hangout_time: createdHangout.time,
        hangout_location: createdHangout.location,
        hangout_vibe: createdHangout.vibe,
        hangout_code: createdHangout.code,
        hangout_group_id: createdHangout.groupId,
        hangout_participants: createdHangout.participants,
        hangout_recommendations: createdHangout.recommendations,
      });

      if (error) {
        setSaveError(error.message);
        return;
      }
      createdHangout.id = data.id;
    }

    setAppData?.((prev) => ({ ...prev, hangouts: [...(prev.hangouts || []), createdHangout] }));
    setHangout(createdHangout);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <nav className="nav-bar">
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button type="button" className="logo-link" onClick={() => onNavigate?.("dashboard")} aria-label="Go to home">
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </button>
            <button onClick={() => onNavigate?.("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Bangers', cursive", fontSize: 16, color: "#888", letterSpacing: "0.04em" }}>Back</button>
          </div>
        </nav>

        <main className="page">
          {!hangout ? (
            <>
              <div className="card hero">
                <span className="comic-tag">Hangout Assistant AI</span>
                <h1 className="bangers" style={{ fontSize: 40, margin: "0 0 8px" }}>Find The Best Crew Time</h1>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#555", margin: 0 }}>Select people, compare saved availability, and pick the strongest overlap. No external API key needed.</p>
              </div>

              <div className="shell">
                <section style={{ display: "grid", gap: 20 }}>
                  <div className="card">
                    <h2 className="bangers" style={{ fontSize: 24, margin: "0 0 16px" }}>Hangout Details</h2>
                    <div style={{ display: "grid", gap: 16 }}>
                      <div>
                        <label className="form-label">Hangout Name</label>
                        <input className="form-input" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Friday Night Out" />
                        {errors.name && <p className="error-msg">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="form-label">Crew</label>
                        <select className="form-input" value={selectedGroup?.id || ""} onChange={(e) => setSelectedGroupId(e.target.value)}>
                          {groups.length ? groups.map((group) => <option key={group.id} value={group.id}>{group.emoji} {group.name}</option>) : <option value="">No crew yet</option>}
                        </select>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label className="form-label">Date</label>
                          <input className="form-input" type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
                        </div>
                        <div>
                          <label className="form-label">Time</label>
                          <input className="form-input" type="time" value={form.time} onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))} />
                          {errors.time && <p className="error-msg">{errors.time}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Duration</label>
                        <select className="form-input" value={duration} onChange={(e) => setDuration(e.target.value)}>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours</option>
                          <option value={120}>2 hours</option>
                          <option value={180}>3 hours</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Location</label>
                        <input className="form-input" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Central Park, New York" />
                        {errors.location && <p className="error-msg">{errors.location}</p>}
                      </div>
                      <div>
                        <label className="form-label">Vibe / Description</label>
                        <textarea className="form-input" rows={3} value={form.vibe} onChange={(e) => setForm((prev) => ({ ...prev, vibe: e.target.value }))} placeholder="Casual dinner, dress comfy, good vibes only" />
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h2 className="bangers" style={{ fontSize: 24, margin: "0 0 16px" }}>Selected Participants</h2>
                    {errors.participants && <p className="error-msg">{errors.participants}</p>}
                    <div style={{ display: "grid", gap: 12 }}>
                      {participants.length ? participants.map((person) => (
                        <button key={person.id} type="button" className={`participant ${person.selected ? "selected" : ""}`} onClick={() => toggleParticipant(person.id)}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                            <strong>{person.name}</strong>
                            <span className="pill">{person.selected ? "Selected" : "Tap to select"}</span>
                          </div>
                          <p style={{ textAlign: "left", fontSize: 13, fontWeight: 800, color: "#555", margin: 0 }}>{availabilityToText(person.availability)}</p>
                        </button>
                      )) : (
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#888", margin: 0 }}>Create or join a crew first so participants can be selected.</p>
                      )}
                    </div>
                  </div>
                </section>

                <aside className="card" style={{ position: "sticky", top: 92 }}>
                  <h2 className="bangers" style={{ fontSize: 24, margin: "0 0 14px" }}>Recommended Times</h2>
                  <div style={{ display: "grid", gap: 14 }}>
                    {recommendations.length ? recommendations.map((rec, index) => (
                      <div key={`${rec.day}-${rec.start}`} className="recommendation">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                          <span className="bangers" style={{ fontSize: 18 }}>{index === 0 ? "Top Pick" : `Option ${index + 1}`}</span>
                          <span className="pill">{rec.availableCount}/{rec.totalCount} free</span>
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 900, margin: "0 0 8px" }}>{rec.day}, {formatTimeLabel(rec.start)} - {formatTimeLabel(rec.end)}</p>
                        <p className="bangers" style={{ fontSize: 13, color: "#51cf66", margin: "0 0 5px" }}>Available</p>
                        <div>{rec.available.map((name) => <span key={name} className="pill">{name}</span>)}</div>
                        {rec.unavailable.length > 0 && (
                          <>
                            <p className="bangers" style={{ fontSize: 13, color: "#ff6b6b", margin: "10px 0 5px" }}>Not Available</p>
                            <div>{rec.unavailable.map((name) => <span key={name} className="pill">{name}</span>)}</div>
                          </>
                        )}
                        <button className="btn-primary" style={{ width: "100%", marginTop: 12 }} onClick={() => applyRecommendation(rec)}>Use This Time</button>
                      </div>
                    )) : (
                      <p style={{ fontSize: 13, fontWeight: 800, color: "#888", margin: 0 }}>Select participants with saved availability to see recommendations.</p>
                    )}
                  </div>
                  {saveError && <p className="error-msg">{saveError}</p>}
                  <button className="btn-secondary" style={{ width: "100%", marginTop: 18 }} onClick={handleCreate}>Create Hangout</button>
                </aside>
              </div>
            </>
          ) : (
            <div className="card" style={{ maxWidth: 620, margin: "0 auto" }}>
              <span className="comic-tag">You're all set!</span>
              <h1 className="bangers" style={{ fontSize: 36, margin: "0 0 6px" }}>{hangout.name}</h1>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#666", margin: "0 0 18px" }}>{hangout.time ? formatTimeLabel(hangout.time) : "Time TBD"} · {hangout.location}</p>
              <div className="code-box">{hangout.code}</div>
              <div className="link-box" style={{ marginTop: 16 }}>{hangout.link}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
                <button className="btn-primary" onClick={() => navigator.clipboard.writeText(hangout.link)}>Copy Invite Link</button>
                <button className="btn-outline" onClick={() => setHangout(null)}>Create Another</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
