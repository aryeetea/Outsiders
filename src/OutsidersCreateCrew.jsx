import { useEffect, useMemo, useState } from "react";
import { createId, getDisplayName } from "./appState";
import { copyTextWithAlert } from "./clipboard";
import OutsidersSideNav from "./OutsidersSideNav";
import { buildGroupInviteLink } from "./siteConfig";
import { isSupabaseConfigured, supabase } from "./supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f1dd; }
  .root {
    min-height: 100vh;
    color: #17151f;
    font-family: 'Nunito', sans-serif;
    background: #fff4b8;
  }
  .shell {
    max-width: 1120px;
    margin: 0 auto;
    padding: 28px 20px 48px;
    display: grid;
    gap: 22px;
  }
  .hero, .card {
    border-radius: 22px;
    border: 4px solid #17151f;
    background: #fffdf7;
    box-shadow: 8px 8px 0 #17151f;
  }
  .hero {
    padding: 30px;
    background: #fff2a6;
  }
  .card {
    padding: 24px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px;
  }
  .field {
    display: grid;
    gap: 8px;
  }
  .field label {
    font: 400 14px 'Bangers', cursive;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .field input, .field select, .field textarea {
    width: 100%;
    border: 3px solid #17151f;
    border-radius: 12px;
    padding: 13px 14px;
    background: #fff7e4;
    font: 700 15px 'Nunito', sans-serif;
    color: #17151f;
    box-shadow: 3px 3px 0 #17151f;
    outline: none;
  }
  .field input:focus, .field select:focus, .field textarea:focus {
    border-color: #ff6b6b;
    box-shadow: 4px 4px 0 #ff6b6b;
  }
  .field textarea {
    min-height: 108px;
    resize: vertical;
  }
  .btn {
    border: 3px solid #17151f;
    border-radius: 12px;
    padding: 13px 16px;
    cursor: pointer;
    font: 400 15px 'Bangers', cursive;
    letter-spacing: 0.06em;
    box-shadow: 4px 4px 0 #17151f;
  }
  .btn.primary { background: #ff6b6b; color: #fff; }
  .btn.secondary { background: #ffd93d; color: #17151f; }
  .btn.ghost { background: #fff; color: #17151f; }
  .btn:hover { transform: translate(-1px, -2px); }
  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }
  .notice {
    border-radius: 16px;
    border: 3px solid #ff9a3c;
    background: #fff4e6;
    box-shadow: 5px 5px 0 #ff9a3c;
    padding: 14px 16px;
    font-weight: 800;
    color: #7a4d00;
  }
  .invite-box {
    border-radius: 14px;
    border: 3px solid #17151f;
    background: #fff7e4;
    box-shadow: 4px 4px 0 #17151f;
    padding: 14px;
    display: grid;
    gap: 10px;
  }
  .invite-value {
    border-radius: 10px;
    border: 2px dashed rgba(23, 21, 31, 0.42);
    background: #fffdf7;
    padding: 10px 12px;
    overflow-wrap: anywhere;
    font: 800 13px 'Nunito', sans-serif;
    color: #475467;
  }
  @media (max-width: 860px) {
    .grid { grid-template-columns: 1fr; }
    .shell { padding: 18px 14px 36px; }
  }
`;

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getInitials(name) {
  return (name || "You").replace(/^@/, "").trim().slice(0, 2).toUpperCase() || "YO";
}

function buildMember(profile = {}, currentName = "You", role = "Member", userId = null, avatar = null) {
  return {
    name: currentName,
    initials: getInitials(currentName),
    role,
    userId,
    username: profile.username ? `@${profile.username}` : "",
    bio: profile.bio || "",
    location: profile.location || "",
    email: profile.email || "",
    availability: profile.availability,
    avatar: avatar || "",
  };
}

function normalizeSupabaseGroup(group = {}) {
  return {
    id: group.id,
    name: group.name || "Untitled Crew",
    emoji: group.emoji || "👥",
    code: group.code || "",
    owner_id: group.owner_id || group.ownerId || null,
    ownerId: group.ownerId || group.owner_id || null,
    owner_username: group.owner_username || group.ownerUsername || "",
    ownerUsername: group.ownerUsername || group.owner_username || "",
    members: Array.isArray(group.members) ? group.members : [],
    expenses: Array.isArray(group.expenses) ? group.expenses : [],
    pending: Array.isArray(group.pending) ? group.pending : [],
    cases: Array.isArray(group.cases) ? group.cases : [],
    hangoutProposals: Array.isArray(group.hangoutProposals) ? group.hangoutProposals : (Array.isArray(group.hangout_proposals) ? group.hangout_proposals : []),
    billWatch: group.billWatch || group.bill_watch || { electedMemberName: "", votes: {}, checklist: [] },
    peaceMaker: group.peaceMaker || group.peace_maker || { electedMemberName: "", votes: {}, oath: "" },
  };
}

function buildPendingIdentity(profile = {}, currentName = "You", userId = null) {
  return {
    userId: userId || profile.id || null,
    username: profile.username ? `@${profile.username}` : "",
    name: currentName,
  };
}

function pendingMatchesIdentity(item = {}, identity = {}) {
  return (
    (identity.userId && String(item.userId || "").trim() === String(identity.userId).trim())
    || (identity.username && String(item.username || "").trim().toLowerCase() === String(identity.username).trim().toLowerCase())
    || (identity.name && String(item.name || "").trim().toLowerCase() === String(identity.name).trim().toLowerCase())
  );
}

export default function OutsidersCreateCrew({ onNavigate, appData, setAppData, routeParams = {} }) {
  const profile = useMemo(() => appData?.profile || {}, [appData?.profile]);
  const profileName = profile.name || profile.username || "You";
  const currentName = getDisplayName(profile);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("👥");
  const [joinCode, setJoinCode] = useState(String(routeParams?.inviteCode || routeParams?.groupCode || "").toUpperCase());
  const [notice, setNotice] = useState("");
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [generatedInviteCode, setGeneratedInviteCode] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [inviteTarget, setInviteTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    async function loadCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (active) setCurrentUserId(data.user?.id || null);
    }
    loadCurrentUser();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setJoinCode(String(routeParams?.inviteCode || routeParams?.groupCode || "").toUpperCase());
  }, [routeParams?.groupCode, routeParams?.inviteCode]);

  useEffect(() => {
    const prefilledCode = String(routeParams?.groupCode || routeParams?.inviteCode || "").trim().toUpperCase();
    if (!prefilledCode) {
      setInviteTarget(null);
      return undefined;
    }

    let active = true;

    async function loadInviteTarget() {
      let target = (appData?.groups || []).find((group) => (
        String(group.code || "").trim().toUpperCase() === prefilledCode
        || (group.pending || []).some((item) => String(item.inviteCode || "").trim().toUpperCase() === prefilledCode)
      )) || null;

      if (!target && isSupabaseConfigured) {
        const { data, error } = await supabase.rpc("find_group_by_join_code", { join_code: prefilledCode });
        if (!error && data) {
          target = normalizeSupabaseGroup(data);
        }
      }

      if (active) {
        setInviteTarget(target);
      }
    }

    void loadInviteTarget();
    return () => {
      active = false;
    };
  }, [appData?.groups, routeParams?.groupCode, routeParams?.inviteCode]);

  const resolveSignedInUserId = async () => {
    if (!isSupabaseConfigured) return currentUserId || profile.id || null;
    if (currentUserId) return currentUserId;

    const [{ data: sessionData }, { data: userData }] = await Promise.all([
      supabase.auth.getSession(),
      supabase.auth.getUser(),
    ]);

    const resolvedUserId = sessionData.session?.user?.id || userData.user?.id || profile.id || null;
    if (resolvedUserId) setCurrentUserId(resolvedUserId);
    return resolvedUserId;
  };

  const resolveGroupByCode = async (code) => {
    let target = (appData?.groups || []).find((group) => (
      String(group.code || "").trim().toUpperCase() === code
      || (group.pending || []).some((item) => String(item.inviteCode || "").trim().toUpperCase() === code)
    )) || null;

    if (!target && isSupabaseConfigured) {
      const { data, error } = await supabase.rpc("find_group_by_join_code", { join_code: code });
      if (error) {
        setNotice(error.message || "We could not look up that crew code.");
        return null;
      }
      if (data) target = normalizeSupabaseGroup(data);
    }

    return target;
  };

  const createCrew = async () => {
    if (!newGroupName.trim()) {
      setNotice("Give the crew a name first.");
      return;
    }

    setIsSaving(true);
    try {
      const resolvedUserId = await resolveSignedInUserId();
      if (isSupabaseConfigured && !resolvedUserId) {
        setNotice("Log in first so your crew is saved to your account.");
        onNavigate?.("login", { redirect: "create-crew" });
        return;
      }

      const nextGroup = {
        id: `group-${Date.now()}`,
        name: newGroupName.trim(),
        emoji: newGroupEmoji,
        code: generateCode(),
        owner_id: resolvedUserId,
        ownerId: resolvedUserId,
        owner_username: profile.username || "",
        ownerUsername: profile.username || "",
        members: [buildMember(profile, currentName, "Admin", resolvedUserId, appData?.avatar)],
        expenses: [],
        pending: [],
        cases: [],
        hangoutProposals: [],
        billWatch: { electedMemberName: "", votes: {}, checklist: ["Track who paid", "Post the split", "Confirm balances"] },
        peaceMaker: { electedMemberName: "", votes: {}, oath: "" },
      };

      let savedGroup = nextGroup;
      if (isSupabaseConfigured && resolvedUserId) {
        const { data, error } = await supabase
          .from("groups")
          .insert({
            name: nextGroup.name,
            emoji: nextGroup.emoji,
            code: nextGroup.code,
            owner_id: resolvedUserId,
            owner_username: profile.username || "",
            members: nextGroup.members,
            expenses: [],
            pending: [],
            cases: [],
            hangout_proposals: [],
            bill_watch: nextGroup.billWatch,
            peace_maker: nextGroup.peaceMaker,
          })
          .select("*")
          .single();

        if (error) {
          setNotice(error.message || "We could not create that crew yet.");
          return;
        }
        savedGroup = normalizeSupabaseGroup(data);
      }

      setAppData?.((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          id: resolvedUserId || prev.profile?.id || "",
        },
        groups: [...(prev.groups || []), savedGroup],
      }));
      setGeneratedInviteLink(buildGroupInviteLink(savedGroup.code));
      setGeneratedInviteCode(savedGroup.code);
      setNotice(`Created ${savedGroup.name}.`);
      setNewGroupName("");
    } finally {
      setIsSaving(false);
    }
  };

  const inviteIdentity = buildPendingIdentity(profile, currentName, currentUserId || profile.id || null);
  const inviteAlreadyMember = inviteTarget ? (inviteTarget.members || []).some((member) => (
    pendingMatchesIdentity(member, inviteIdentity)
  )) : false;
  const existingInviteDecision = inviteTarget ? (inviteTarget.pending || []).find((item) => (
    (item.type === "join-request" || item.type === "decline-note")
    && pendingMatchesIdentity(item, inviteIdentity)
  )) : null;

  const submitCrewInviteDecision = async ({ declined = false } = {}) => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setNotice("Enter a crew or invite code.");
      return;
    }

    setIsSaving(true);
    try {
      const resolvedUserId = await resolveSignedInUserId();
      if (isSupabaseConfigured && !resolvedUserId) {
        setNotice(`Log in first so your ${declined ? "decline note" : "join request"} is saved to your account.`);
        onNavigate?.("login", { redirect: "create-crew", groupCode: code });
        return;
      }

      const target = await resolveGroupByCode(code);

      if (!target) {
        setNotice("No crew was found with that code.");
        return;
      }

      const already = (target.members || []).some((member) => (
        String(member.userId || "").trim() === String(resolvedUserId || "")
        || member.name === currentName
        || member.username === `@${profile.username}`
      ));
      if (already) {
        setNotice("You are already in that crew.");
        onNavigate?.("friend-groups");
        return;
      }

      if (declined && !declineReason.trim()) {
        setNotice("Add a quick clarification before you decline.");
        setShowDeclineForm(true);
        return;
      }

      const identity = buildPendingIdentity(profile, currentName, resolvedUserId);
      const existingPending = (target.pending || []).find((item) => (
        (item.type === "join-request" || item.type === "decline-note")
        && pendingMatchesIdentity(item, identity)
      ));

      if (existingPending) {
        setNotice(
          existingPending.type === "decline-note"
            ? `You already declined ${target.name}.`
            : `Your request to join ${target.name} is already waiting for review.`
        );
        return;
      }

      const nextPending = [
        ...(target.pending || []),
        declined
          ? {
              id: createId("decline"),
              type: "decline-note",
              code,
              ...identity,
              clarification: declineReason.trim(),
              createdAt: new Date().toISOString(),
            }
          : {
              id: createId("join-request"),
              type: "join-request",
              code,
              ...identity,
              role: "Member",
              bio: profile.bio || "",
              location: profile.location || "",
              email: profile.email || "",
              availability: profile.availability,
              avatar: appData?.avatar || "",
              createdAt: new Date().toISOString(),
            },
      ];

      if (isSupabaseConfigured && target.id) {
        const { error } = await supabase
          .from("groups")
          .update({ pending: nextPending })
          .eq("id", target.id);
        if (error) {
          setNotice(error.message || `We could not save that ${declined ? "decline" : "join request"} yet.`);
          return;
        }

        const crewRecipients = Array.from(new Set(
          (target.members || [])
            .map((member) => String(member.userId || "").trim())
            .filter(Boolean)
        ));

        if (crewRecipients.length) {
          await supabase.from("notifications").insert(
            crewRecipients.map((userId) => ({
              user_id: userId,
              group_id: target.id,
              group_name: target.name,
              recipient: target.name,
              recipient_key: `user:${userId}`,
              action_screen: "friend-groups",
              action_params: { groupId: target.id, tab: "Invites" },
              type: declined ? "crew-invite-declined" : "crew-join-request",
              message: declined
                ? `${currentName} declined the invite to ${target.name}.`
                : `${currentName} requested to join ${target.name}.`,
              read: false,
            }))
          );
        }
      }

      const nextGroup = { ...target, pending: nextPending };
      setAppData?.((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          id: resolvedUserId || prev.profile?.id || "",
        },
        groups: (prev.groups || []).some((group) => String(group.id) === String(nextGroup.id))
          ? (prev.groups || []).map((group) => (String(group.id) === String(nextGroup.id) ? nextGroup : group))
          : [...(prev.groups || []), nextGroup],
      }));
      setInviteTarget(nextGroup);
      setNotice(
        declined
          ? `You declined ${target.name}. Your clarification was saved.`
          : `Your request to join ${target.name} is waiting for crew approval.`
      );
      setDeclineReason("");
      setShowDeclineForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav activeLabel="Create Crew" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length} appData={appData} setAppData={setAppData}>
          <div className="shell">
            <section className="hero">
              <div className="bangers" style={{ fontSize: 18 }}>Crew Setup</div>
              <h1 className="bangers" style={{ margin: "8px 0", fontSize: 48 }}>Create or join a crew.</h1>
              <p style={{ margin: 0, color: "#555", fontWeight: 800, lineHeight: 1.6 }}>Start a new crew here, or use a code to join one your people already made.</p>
            </section>

            {notice ? <div className="notice">{notice}</div> : null}

            <div className="grid">
              <section className="card">
                <h2 className="bangers" style={{ margin: "0 0 14px", fontSize: 28 }}>Create Crew</h2>
                <div className="field">
                  <label>Crew name</label>
                  <input value={newGroupName} onChange={(event) => setNewGroupName(event.target.value)} placeholder="Downtown Day Ones" />
                </div>
                <div className="field" style={{ marginTop: 14 }}>
                  <label>Emoji</label>
                  <select value={newGroupEmoji} onChange={(event) => setNewGroupEmoji(event.target.value)}>
                    {["👥", "🎉", "🍕", "🏝", "🎮", "🌆", "🛼", "🎬"].map((emoji) => <option key={emoji} value={emoji}>{emoji}</option>)}
                  </select>
                </div>
                <button type="button" className="btn primary" style={{ width: "100%", marginTop: 18 }} onClick={createCrew} disabled={isSaving}>{isSaving ? "Saving..." : "Create crew"}</button>
                {generatedInviteLink ? (
                  <div className="invite-box" style={{ marginTop: 16 }}>
                    <strong>Crew code</strong>
                    <div className="invite-value">{generatedInviteCode}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button type="button" className="btn ghost" onClick={() => void copyTextWithAlert(generatedInviteCode, "Crew code copied.")}>Copy code</button>
                      <button type="button" className="btn ghost" onClick={() => void copyTextWithAlert(generatedInviteLink, "Crew invite link copied.")}>Copy link</button>
                    </div>
                    <strong>Invite link</strong>
                    <div className="invite-value">{generatedInviteLink}</div>
                  </div>
                ) : null}
              </section>

              <section className="card">
                <h2 className="bangers" style={{ margin: "0 0 14px", fontSize: 28 }}>{inviteTarget ? "Crew Invitation" : "Join Crew"}</h2>
                {inviteTarget ? (
                  <div className="invite-box" style={{ marginBottom: 16 }}>
                    <strong>{inviteTarget.emoji} {inviteTarget.name}</strong>
                    <div style={{ color: "#667085", fontWeight: 800 }}>
                      {inviteTarget.members?.length || 0} crew member{inviteTarget.members?.length === 1 ? "" : "s"} · code {inviteTarget.code}
                    </div>
                    {inviteAlreadyMember ? (
                      <p style={{ margin: 0, color: "#0f766e", fontWeight: 800 }}>You are already in this crew.</p>
                    ) : existingInviteDecision?.type === "join-request" ? (
                      <p style={{ margin: 0, color: "#9a6700", fontWeight: 800 }}>Your request to join is already waiting for approval.</p>
                    ) : existingInviteDecision?.type === "decline-note" ? (
                      <p style={{ margin: 0, color: "#b42318", fontWeight: 800 }}>You already declined this invite: "{existingInviteDecision.clarification}"</p>
                    ) : (
                      <p style={{ margin: 0, color: "#667085", fontWeight: 800 }}>Choose whether you want to request access to this crew or decline the invite.</p>
                    )}
                  </div>
                ) : null}
                <div className="field">
                  <label>Crew or invite code</label>
                  <input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="ABC123 or ABC123-XY9Z" />
                </div>
                {showDeclineForm ? (
                  <div className="field" style={{ marginTop: 14 }}>
                    <label>Why are you declining?</label>
                    <textarea value={declineReason} onChange={(event) => setDeclineReason(event.target.value)} placeholder="A quick note helps the crew understand why you passed." />
                  </div>
                ) : null}
                <button
                  type="button"
                  className="btn secondary"
                  style={{ width: "100%", marginTop: 18 }}
                  onClick={() => void submitCrewInviteDecision({ declined: false })}
                  disabled={isSaving || inviteAlreadyMember || existingInviteDecision?.type === "join-request"}
                >
                  {isSaving ? "Saving..." : "Request to join crew"}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  style={{ width: "100%", marginTop: 12 }}
                  onClick={() => {
                    if (!showDeclineForm) {
                      setShowDeclineForm(true);
                      setNotice("Add a quick clarification so the crew knows why you declined.");
                      return;
                    }
                    void submitCrewInviteDecision({ declined: true });
                  }}
                  disabled={isSaving || inviteAlreadyMember || existingInviteDecision?.type === "decline-note"}
                >
                  {showDeclineForm ? "Send decline" : "Decline invite"}
                </button>
                <button type="button" className="btn ghost" style={{ width: "100%", marginTop: 12 }} onClick={() => onNavigate?.("friend-groups")}>Open my crews</button>
              </section>
            </div>
          </div>
        </OutsidersSideNav>
      </div>
    </>
  );
}
