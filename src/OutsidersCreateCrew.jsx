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
  .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
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
  .notice.success {
    border-color: #51cf66;
    background: #e8fde8;
    box-shadow: 5px 5px 0 #51cf66;
    color: #1a6b2a;
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
  .invite-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
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
    hangoutProposals: Array.isArray(group.hangoutProposals)
      ? group.hangoutProposals
      : Array.isArray(group.hangout_proposals)
      ? group.hangout_proposals
      : [],
    billWatch:
      group.billWatch ||
      group.bill_watch || { electedMemberName: "", votes: {}, checklist: [] },
    peaceMaker:
      group.peaceMaker ||
      group.peace_maker || { electedMemberName: "", votes: {}, oath: "" },
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
    (identity.userId &&
      String(item.userId || "").trim() === String(identity.userId).trim()) ||
    (identity.username &&
      String(item.username || "").trim().toLowerCase() ===
        String(identity.username).trim().toLowerCase()) ||
    (identity.name &&
      String(item.name || "").trim().toLowerCase() ===
        String(identity.name).trim().toLowerCase())
  );
}

export default function OutsidersCreateCrew({
  onNavigate,
  appData,
  setAppData,
  routeParams = {},
}) {
  const profile = useMemo(() => appData?.profile || {}, [appData?.profile]);
  const profileName = profile.name || profile.username || "You";
  const currentName = getDisplayName(profile);

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("👥");
  const [joinCode, setJoinCode] = useState(
    String(routeParams?.inviteCode || routeParams?.groupCode || "").toUpperCase()
  );
  const [notice, setNotice] = useState({ text: "", type: "warn" });
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [generatedInviteCode, setGeneratedInviteCode] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [inviteTarget, setInviteTarget] = useState(null);

  const showNotice = (text, type = "warn") => setNotice({ text, type });
  const clearNotice = () => setNotice({ text: "", type: "warn" });

  // Load current user on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    async function loadCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (active) setCurrentUserId(data?.user?.id || null);
    }
    loadCurrentUser();
    return () => { active = false; };
  }, []);

  // Sync joinCode when routeParams change
  useEffect(() => {
    setJoinCode(
      String(routeParams?.inviteCode || routeParams?.groupCode || "").toUpperCase()
    );
  }, [routeParams?.groupCode, routeParams?.inviteCode]);

  useEffect(() => {
    const normalizedCode = joinCode.trim().toUpperCase();
    if (!normalizedCode) {
      setInviteTarget(null);
      return;
    }
    if (
      inviteTarget &&
      String(inviteTarget.code || "").trim().toUpperCase() !== normalizedCode
    ) {
      setInviteTarget(null);
    }
  }, [inviteTarget, joinCode]);

  // Auto-resolve invite target from prefilled code
  useEffect(() => {
    const prefilledCode = String(
      routeParams?.groupCode || routeParams?.inviteCode || ""
    )
      .trim()
      .toUpperCase();
    if (!prefilledCode) {
      setInviteTarget(null);
      return undefined;
    }
    let active = true;
    async function loadInviteTarget() {
      let target =
        (appData?.groups || []).find(
          (group) =>
            String(group.code || "").trim().toUpperCase() === prefilledCode ||
            (group.pending || []).some(
              (item) =>
                String(item.inviteCode || "").trim().toUpperCase() === prefilledCode
            )
        ) || null;

      if (!target && isSupabaseConfigured) {
        const { data, error } = await supabase.rpc("find_group_by_join_code", {
          join_code: prefilledCode,
        });
        if (!error && data) target = normalizeSupabaseGroup(data);
      }
      if (active) setInviteTarget(target);
    }
    void loadInviteTarget();
    return () => { active = false; };
  }, [appData?.groups, routeParams?.groupCode, routeParams?.inviteCode]);

  // Always fetch the freshest user ID directly from Supabase auth
  const getFreshUserId = async () => {
    if (!isSupabaseConfigured) return currentUserId || profile.id || null;
    const { data } = await supabase.auth.getUser();
    // Fall back to currentUserId / profile.id so a transient getUser() failure
    // (token refresh race, brief network hiccup) doesn't falsely redirect the
    // user to login when they are already authenticated.
    const id = data?.user?.id || currentUserId || profile.id || null;
    if (id) setCurrentUserId(id);
    return id;
  };

  const resolveGroupByCode = async (code) => {
    let target =
      (appData?.groups || []).find(
        (group) =>
          String(group.code || "").trim().toUpperCase() === code ||
          (group.pending || []).some(
            (item) =>
              String(item.inviteCode || "").trim().toUpperCase() === code
          )
      ) || null;

    if (!target && isSupabaseConfigured) {
      const { data, error } = await supabase.rpc("find_group_by_join_code", {
        join_code: code,
      });
      if (error) {
        showNotice(error.message || "We could not look up that crew code.");
        return null;
      }
      if (data) target = normalizeSupabaseGroup(data);
    }
    return target;
  };

  // ─── CREATE CREW ────────────────────────────────────────────
  const createCrew = async () => {
    if (!newGroupName.trim()) {
      showNotice("Give the crew a name first.");
      return;
    }

    setIsSaving(true);
    clearNotice();

    try {
      // For the non-Supabase (local-only) path, fall back to known local state.
      let resolvedUserId = isSupabaseConfigured ? null : currentUserId || profile.id || null;

      if (isSupabaseConfigured) {
        // Always fetch directly from Supabase auth — never rely on local state
        // to decide whether the user is authenticated.
        const { data, error } = await supabase.auth.getUser();
        resolvedUserId = data?.user?.id ?? null;

        if (!resolvedUserId) {
          if (error) {
            // The auth check itself failed (token-refresh race, network hiccup).
            // This is NOT a confirmed "no session" — ask the user to retry
            // rather than bouncing them to login.
            showNotice("Could not verify your session. Please try again.");
            return;
          }
          // getUser() succeeded but returned no user — genuinely not signed in.
          showNotice("Log in first so your crew is saved to your account.");
          onNavigate?.("login", { redirect: "create-crew" });
          return;
        }

        setCurrentUserId(resolvedUserId);
      }

      const newCode = generateCode();
      const ownerMember = buildMember(
        profile,
        currentName,
        "Admin",
        resolvedUserId,
        appData?.avatar
      );

      const nextGroup = {
        id: `group-${Date.now()}`,
        name: newGroupName.trim(),
        emoji: newGroupEmoji,
        code: newCode,
        owner_id: resolvedUserId,
        ownerId: resolvedUserId,
        owner_username: profile.username || "",
        ownerUsername: profile.username || "",
        members: [ownerMember],
        expenses: [],
        pending: [],
        cases: [],
        hangoutProposals: [],
        billWatch: {
          electedMemberName: "",
          votes: {},
          checklist: ["Track who paid", "Post the split", "Confirm balances"],
        },
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
            color_index: 0,
          })
          .select("*")
          .single();

        if (error) {
          showNotice(error.message || "We could not create that crew yet.");
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
      showNotice(
        `${savedGroup.emoji} ${savedGroup.name} is live! Share the code below with your crew.`,
        "success"
      );
      setNewGroupName("");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── JOIN / DECLINE ─────────────────────────────────────────
  const inviteIdentity = buildPendingIdentity(
    profile,
    currentName,
    currentUserId || profile.id || null
  );
  const inviteAlreadyMember = inviteTarget
    ? (inviteTarget.members || []).some((member) =>
        pendingMatchesIdentity(member, inviteIdentity)
      )
    : false;
  const existingInviteDecision = inviteTarget
    ? (inviteTarget.pending || []).find(
        (item) =>
          (item.type === "join-request" || item.type === "decline-note") &&
          pendingMatchesIdentity(item, inviteIdentity)
      )
    : null;

  const submitCrewInviteDecision = async ({ declined = false } = {}) => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      showNotice("Enter a crew or invite code.");
      return;
    }

    setIsSaving(true);
    clearNotice();

    try {
      const resolvedUserId = await getFreshUserId();

      if (isSupabaseConfigured && !resolvedUserId) {
        showNotice(
          `Log in first so your ${declined ? "decline note" : "join request"} is saved.`
        );
        onNavigate?.("login", { redirect: "create-crew", groupCode: code });
        return;
      }

      const target = await resolveGroupByCode(code);
      if (!target) {
        showNotice("No crew was found with that code.");
        return;
      }

      const alreadyMember = (target.members || []).some(
        (member) =>
          String(member.userId || "").trim() === String(resolvedUserId || "") ||
          member.name === currentName ||
          member.username === `@${profile.username}`
      );
      if (alreadyMember) {
        showNotice("You are already in that crew.");
        onNavigate?.("friend-groups");
        return;
      }

      const identity = buildPendingIdentity(profile, currentName, resolvedUserId);
      const existingPending = (target.pending || []).find(
        (item) =>
          (item.type === "join-request" || item.type === "decline-note") &&
          pendingMatchesIdentity(item, identity)
      );

      if (existingPending) {
        showNotice(
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
              clarification: "",
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
          showNotice(
            error.message ||
              `We could not save that ${declined ? "decline" : "join request"} yet.`
          );
          return;
        }

        const crewRecipients = Array.from(
          new Set(
            (target.members || [])
              .map((member) => String(member.userId || "").trim())
              .filter(Boolean)
          )
        );

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
        groups: (prev.groups || []).some(
          (group) => String(group.id) === String(nextGroup.id)
        )
          ? (prev.groups || []).map((group) =>
              String(group.id) === String(nextGroup.id) ? nextGroup : group
            )
          : [...(prev.groups || []), nextGroup],
      }));

      setInviteTarget(nextGroup);
      showNotice(
        declined
          ? `You declined ${target.name}.`
          : `Your request to join ${target.name} is waiting for crew approval.`,
        declined ? "warn" : "success"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const detectInviteTarget = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      showNotice("Enter a crew or invite code.");
      return;
    }

    setIsSaving(true);
    clearNotice();

    try {
      const target = await resolveGroupByCode(code);
      if (!target) {
        showNotice("No crew was found with that code.");
        setInviteTarget(null);
        return;
      }

      setInviteTarget(target);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav
          activeLabel="Create Crew"
          onNavigate={onNavigate}
          profileName={profileName}
          notificationCount={
            (appData?.notifications || []).filter((n) => !n.read).length
          }
          appData={appData}
          setAppData={setAppData}
        >
          <div className="shell">
            <section className="hero">
              <div className="bangers" style={{ fontSize: 18 }}>
                Crew Setup
              </div>
              <h1
                className="bangers"
                style={{ margin: "8px 0", fontSize: 48 }}
              >
                Create or join a crew.
              </h1>
              <p
                style={{
                  margin: 0,
                  color: "#555",
                  fontWeight: 800,
                  lineHeight: 1.6,
                }}
              >
                Start a new crew here, or use a code to join one your people
                already made.
              </p>
            </section>

            {notice.text ? (
              <div className={`notice${notice.type === "success" ? " success" : ""}`}>
                {notice.text}
              </div>
            ) : null}

            <div className="grid">
              {/* ── CREATE CREW ── */}
              <section className="card">
                <h2
                  className="bangers"
                  style={{ margin: "0 0 14px", fontSize: 28 }}
                >
                  Create Crew
                </h2>
                <div className="field">
                  <label>Crew name</label>
                  <input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Downtown Day Ones"
                    onKeyDown={(e) => e.key === "Enter" && void createCrew()}
                  />
                </div>
                <div className="field" style={{ marginTop: 14 }}>
                  <label>Emoji</label>
                  <select
                    value={newGroupEmoji}
                    onChange={(e) => setNewGroupEmoji(e.target.value)}
                  >
                    {["👥", "🎉", "🍕", "🏝", "🎮", "🌆", "🛼", "🎬", "🏀", "🎵", "🌮", "✈️"].map(
                      (emoji) => (
                        <option key={emoji} value={emoji}>
                          {emoji}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn primary"
                  style={{ width: "100%", marginTop: 18 }}
                  onClick={() => void createCrew()}
                  disabled={isSaving}
                >
                  {isSaving ? "Creating..." : "Create crew"}
                </button>

                {generatedInviteCode ? (
                  <div className="invite-box" style={{ marginTop: 16 }}>
                    <strong>Crew code</strong>
                    <div className="invite-value">{generatedInviteCode}</div>
                    <div className="invite-actions">
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() =>
                          void copyTextWithAlert(
                            generatedInviteCode,
                            "Crew code copied."
                          )
                        }
                      >
                        Copy code
                      </button>
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() =>
                          void copyTextWithAlert(
                            generatedInviteLink,
                            "Crew invite link copied."
                          )
                        }
                      >
                        Copy link
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => onNavigate?.("friend-groups")}
                      >
                        Open crew
                      </button>
                    </div>
                    <strong>Invite link</strong>
                    <div className="invite-value">{generatedInviteLink}</div>
                  </div>
                ) : null}
              </section>

              {/* ── JOIN CREW ── */}
              <section className="card">
                <h2
                  className="bangers"
                  style={{ margin: "0 0 14px", fontSize: 28 }}
                >
                  {inviteTarget ? "Crew Invitation" : "Join Crew"}
                </h2>

                {inviteTarget ? (
                  <div className="invite-box" style={{ marginBottom: 16 }}>
                    <strong>
                      {inviteTarget.emoji} {inviteTarget.name}
                    </strong>
                    <div style={{ color: "#667085", fontWeight: 800 }}>
                      {inviteTarget.members?.length || 0} crew member
                      {inviteTarget.members?.length === 1 ? "" : "s"}
                    </div>
                  </div>
                ) : null}

                {!inviteTarget ? (
                  <div className="field">
                    <label>Crew or invite code</label>
                    <input
                      value={joinCode}
                      onChange={(e) =>
                        setJoinCode(e.target.value.toUpperCase())
                      }
                      placeholder="ABC123 or ABC123-XY9Z"
                      onKeyDown={(e) =>
                        e.key === "Enter" && void detectInviteTarget()
                      }
                    />
                  </div>
                ) : null}

                <button
                  type="button"
                  className={`btn ${inviteTarget ? "primary" : "secondary"}`}
                  style={{ width: "100%", marginTop: 18 }}
                  onClick={() =>
                    void (inviteTarget
                      ? submitCrewInviteDecision({ declined: false })
                      : detectInviteTarget())
                  }
                  disabled={
                    isSaving ||
                    inviteAlreadyMember ||
                    existingInviteDecision?.type === "join-request"
                  }
                >
                  {isSaving
                    ? "Saving..."
                    : inviteTarget
                    ? "Accept invite"
                    : "Join Crew"}
                </button>

                {inviteTarget ? (
                  <button
                    type="button"
                    className="btn ghost"
                    style={{ width: "100%", marginTop: 12 }}
                    onClick={() => {
                      void submitCrewInviteDecision({ declined: true });
                    }}
                    disabled={
                      isSaving ||
                      inviteAlreadyMember ||
                      existingInviteDecision?.type === "decline-note"
                    }
                  >
                    Decline invite
                  </button>
                ) : null}
              </section>
            </div>
          </div>
        </OutsidersSideNav>
      </div>
    </>
  );
}
