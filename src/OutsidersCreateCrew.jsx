import { useEffect, useMemo, useState } from "react";
import { createId, getDisplayName } from "./appState";
import { copyTextWithAlert } from "./clipboard";
import { sendNotificationEmails } from "./notificationEmail";
import OutsidersSideNav from "./OutsidersSideNav";
import { buildGroupInviteLink } from "./siteConfig";
import { hydrateMembersWithProfileLinks, isSupabaseConfigured, supabase } from "./supabase";

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
    max-width: 900px;
    margin: 0 auto;
    padding: 28px 24px 60px;
  }
  .hero {
    margin-bottom: 32px;
  }
  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .card {
    background: #fff;
    border: 4px solid #17151f;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 6px 6px 0 #17151f;
  }
  .field { display: grid; gap: 6px; }
  .field label { font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; }
  .field input, .field select {
    border: 3px solid #17151f;
    border-radius: 10px;
    padding: 10px 12px;
    font: 700 15px 'Nunito', sans-serif;
    background: #fffdf7;
    outline: none;
    width: 100%;
  }
  .field input:focus, .field select:focus { border-color: #ff6b6b; }
  .btn {
    border: 3px solid #17151f;
    border-radius: 10px;
    padding: 11px 20px;
    font: 800 15px 'Nunito', sans-serif;
    cursor: pointer;
    transition: transform 120ms, box-shadow 120ms;
  }
  .btn:hover { transform: translate(-1px, -2px); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn.primary { background: #ff6b6b; color: #fff; box-shadow: 4px 4px 0 #17151f; }
  .btn.primary:hover { box-shadow: 5px 5px 0 #17151f; }
  .btn.secondary { background: #ffd93d; color: #17151f; box-shadow: 4px 4px 0 #17151f; }
  .btn.secondary:hover { box-shadow: 5px 5px 0 #17151f; }
  .btn.ghost { background: #fff; color: #17151f; box-shadow: 3px 3px 0 #17151f; }
  .btn.ghost:hover { box-shadow: 4px 4px 0 #17151f; }
  .notice {
    border-radius: 14px;
    border: 3px solid #ff9a3c;
    background: #fff5e6;
    box-shadow: 4px 4px 0 #ff9a3c;
    padding: 12px 16px;
    font-weight: 800;
    color: #7a3b00;
    margin-bottom: 20px;
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

function getDirectInviteByCode(group = {}, code = "") {
  const normalizedCode = String(code || "").trim().toUpperCase();
  return (group.pending || []).find((item) => (
    String(item?.inviteCode || "").trim().toUpperCase() === normalizedCode
    && item?.type !== "join-request"
    && item?.type !== "decline-note"
  )) || null;
}

function notificationRecipientKey(member = {}) {
  if (member.userId) return `user:${member.userId}`;
  if (member.username) return `username:${String(member.username).replace(/^@/, "").toLowerCase()}`;
  if (member.email) return `email:${String(member.email).trim().toLowerCase()}`;
  return `name:${String(member.name || "").trim().toLowerCase()}`;
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
  const [joinCode, setJoinCode] = useState(
    String(routeParams?.inviteCode || routeParams?.groupCode || "").toUpperCase()
  );
  const [notice, setNotice] = useState({ text: "", type: "warn" });
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [generatedInviteCode, setGeneratedInviteCode] = useState("");
  const [generatedInviteGroupId, setGeneratedInviteGroupId] = useState("");
  const [generatedInviteGroupName, setGeneratedInviteGroupName] = useState("");
  const [generatedInviteMembers, setGeneratedInviteMembers] = useState([]);
  const [generatedInviteEmail, setGeneratedInviteEmail] = useState("");
  const [inviteTarget, setInviteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingInviteEmail, setIsSendingInviteEmail] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const showNotice = (text, type = "warn") => setNotice({ text, type });
  const clearNotice = () => setNotice({ text: "", type: "warn" });

  async function createCrewLiveNotifications(members = [], payload = {}) {
    if (!isSupabaseConfigured) return;
    const { members: resolvedMembers } = await hydrateMembersWithProfileLinks(members);
    const recipientRows = resolvedMembers
      .filter((member) => member.userId)
      .map((member) => ({
        user_id: member.userId,
        recipient: member.name,
        recipient_key: notificationRecipientKey(member),
        group_id: payload.groupId || null,
        group_name: payload.groupName || "",
        action_screen: payload.actionScreen || "friend-groups",
        action_params: payload.actionParams || {},
        type: payload.type || "general",
        message: typeof payload.message === "function" ? payload.message(member) : payload.message,
        read: false,
      }));

    if (!recipientRows.length) return;
    const { error } = await supabase.from("notifications").insert(recipientRows);
    if (error) {
      console.warn("Crew live notification sync failed:", error.message);
    }
  }

  // Load current user ID on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setCurrentUserId(data.user.id);
    });
  }, []);

  // Auto-detect invite target from prefilled code
  useEffect(() => {
    const prefilledCode = String(
      routeParams?.groupCode || routeParams?.inviteCode || ""
    )
      .trim()
      .toUpperCase();
    if (!prefilledCode) {
      const timeoutId = window.setTimeout(() => setInviteTarget(null), 0);
      return () => window.clearTimeout(timeoutId);
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
      let resolvedUserId = isSupabaseConfigured ? null : currentUserId || profile.id || null;

      if (isSupabaseConfigured) {
        const { data: userData } = await supabase.auth.getUser();
        resolvedUserId = userData?.user?.id ?? null;

        if (!resolvedUserId) {
          const { data: sessionData } = await supabase.auth.getSession();
          resolvedUserId = sessionData?.session?.user?.id ?? null;
        }

        if (!resolvedUserId) {
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
        emoji: "",
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
        const { data, error } = await supabase.rpc("create_group", {
          next_owner_id: resolvedUserId,
          next_name: nextGroup.name,
          next_emoji: nextGroup.emoji,
          next_code: nextGroup.code,
          next_owner_username: profile.username || "",
          next_members: nextGroup.members,
          next_expenses: [],
          next_pending: [],
          next_cases: [],
          next_hangout_proposals: [],
          next_bill_watch: nextGroup.billWatch,
          next_peace_maker: nextGroup.peaceMaker,
          next_color_index: 0,
        });

        if (error) {
          showNotice(error.message || "We could not create that crew yet.");
          return;
        }

        savedGroup = normalizeSupabaseGroup(data);
      }

      await createCrewLiveNotifications(savedGroup.members, {
        type: "crew-created",
        groupId: savedGroup.id,
        groupName: savedGroup.name,
        actionScreen: "friend-groups",
        actionParams: { groupId: savedGroup.id, tab: "Members" },
        message: `${savedGroup.name} was created. Invite your crew when you are ready.`,
      });

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
      setGeneratedInviteGroupId(savedGroup.id || "");
      setGeneratedInviteGroupName(savedGroup.name || "");
      setGeneratedInviteMembers(savedGroup.members || []);
      showNotice(
        `${savedGroup.name} is live! Share the code below with your crew.`,
        "success"
      );
      setNewGroupName("");
    } finally {
      setIsSaving(false);
    }
  };

  const sendGeneratedCrewInviteEmail = async () => {
    const email = generatedInviteEmail.trim();
    if (!email || !email.includes("@")) {
      showNotice("Enter a valid email address for the invite.");
      return;
    }
    if (!generatedInviteLink || !generatedInviteCode) {
      showNotice("Create a crew first so there is an invite link to send.");
      return;
    }

    setIsSendingInviteEmail(true);
    clearNotice();

    try {
      const result = await sendNotificationEmails({
        recipients: [{ email, name: email.split("@")[0] }],
        subject: `${currentName} invited you to join a crew on Outsiders`,
        intro: `${currentName} invited you to join their crew on Outsiders.`,
        ctaLabel: "Join crew",
        ctaUrl: generatedInviteLink,
        details: [
          `Crew code: ${generatedInviteCode}`,
          "Use the button or paste the code on the Create Crew page.",
        ],
      });

      if (result.failed) {
        showNotice("We tried to send the invite, but the email did not go through.");
        return;
      }

      const inviteGroup = (appData?.groups || []).find((group) => (
        String(group.id || "") === String(generatedInviteGroupId || "")
        || String(group.code || "").trim().toUpperCase() === generatedInviteCode
      )) || {
        id: generatedInviteGroupId || null,
        name: generatedInviteGroupName || "Your crew",
        members: generatedInviteMembers.length
          ? generatedInviteMembers
          : [buildMember(profile, currentName, "Admin", currentUserId || profile.id || null, appData?.avatar)],
      };

      await createCrewLiveNotifications(inviteGroup.members, {
        type: "crew-invite-sent",
        groupId: inviteGroup.id || null,
        groupName: inviteGroup.name || generatedInviteGroupName || "Your crew",
        actionScreen: "friend-groups",
        actionParams: { groupId: inviteGroup.id || generatedInviteGroupId, tab: "Invites" },
        message: `${currentName} sent a crew invite to ${email}.`,
      });

      setGeneratedInviteEmail("");
      showNotice(`Invite email sent to ${email}.`, "success");
    } finally {
      setIsSendingInviteEmail(false);
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
          item.type === "decline-note" &&
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
          `Log in first so your ${declined ? "decline note" : "entry"} is saved.`
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

      const matchedInvite = getDirectInviteByCode(target, code);

      if (!declined) {
        // Add immediately — no approval needed
        const acceptedMember = buildMember(
          profile,
          currentName,
          "Member",
          resolvedUserId,
          appData?.avatar || ""
        );
        let nextGroup = null;
        let nextMembers = [];
        let nextPending = [];

        if (isSupabaseConfigured && target.id) {
          const { data: acceptedGroup, error: acceptError } = await supabase.rpc("accept_group_invite", {
            join_code: code,
            joining_member: acceptedMember,
          });

          if (acceptError) {
            const missingRpc = /accept_group_invite|function.*not.*exist|schema cache/i.test(acceptError.message || "");
            if (!missingRpc) {
              showNotice(acceptError.message || "We could not add you to that crew yet.");
              return;
            }

            const hydratedMembers = await hydrateMembersWithProfileLinks([...(target.members || []), acceptedMember]);
            nextMembers = hydratedMembers.members;
            nextPending = matchedInvite
              ? (target.pending || []).filter((item) => String(item.id) !== String(matchedInvite.id))
              : (target.pending || []);

            const { error } = await supabase
              .from("groups")
              .update({ members: nextMembers, pending: nextPending })
              .eq("id", target.id);

            if (error) {
              showNotice(error.message || "We could not add you to that crew yet.");
              return;
            }

            nextGroup = { ...target, members: nextMembers, pending: nextPending };
          } else {
            nextGroup = normalizeSupabaseGroup(acceptedGroup);
            nextMembers = nextGroup.members || [];
            nextPending = nextGroup.pending || [];
          }

          // ── Notify all existing crew members that someone joined ──────────
          const crewRecipients = Array.from(
            new Set(
              [
                ...nextMembers.map((member) => String(member.userId || "").trim()),
                String(target.owner_id || target.ownerId || "").trim(),
              ]
                .filter(Boolean)
            )
          );

          // Only pass group_id if it looks like a real DB UUID (not a local temp id)
          const notifGroupId = target.id && !String(target.id).startsWith("group-") ? target.id : null;

          if (crewRecipients.length) {
            const { error: notifError } = await supabase.from("notifications").insert(
              crewRecipients.map((uid) => ({
                user_id: uid,
                group_id: notifGroupId,
                group_name: target.name,
                recipient: target.name,
                recipient_key: `user:${uid}`,
                action_screen: "friend-groups",
                action_params: { groupId: target.id, tab: "Members" },
                type: "crew-member-joined",
                message: `${currentName} joined ${target.name}.`,
                read: false,
              }))
            );
            if (notifError) {
              console.warn("Could not send join notifications:", notifError.message);
            }

            // ── Send email notifications to crew members ──────────────────
            try {
              const { data: memberProfiles } = await supabase
                .from("profiles")
                .select("id, email, full_name")
                .in("id", crewRecipients);

              const emailRecipients = (memberProfiles || [])
                .filter((p) => p?.email)
                .map((p) => ({ email: p.email, name: p.full_name || p.email }));

              if (emailRecipients.length) {
                await sendNotificationEmails({
                  recipients: emailRecipients,
                  subject: `${currentName} just joined ${target.name}!`,
                  intro: `${currentName} accepted the invite and is now part of ${target.name}.`,
                  ctaLabel: "View crew",
                  ctaUrl: `${import.meta.env.VITE_SITE_URL || ""}/friend-groups`,
                  details: [`New member: ${currentName}`, `Crew: ${target.name}`],
                });
              }
            } catch (emailErr) {
              console.warn("Could not send join email notifications:", emailErr?.message);
            }
          }
        } else {
          const hydratedMembers = await hydrateMembersWithProfileLinks([...(target.members || []), acceptedMember]);
          nextMembers = hydratedMembers.members;
          nextPending = matchedInvite
            ? (target.pending || []).filter((item) => String(item.id) !== String(matchedInvite.id))
            : (target.pending || []);
          nextGroup = { ...target, members: nextMembers, pending: nextPending };
        }

        setAppData?.((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            id: resolvedUserId || prev.profile?.id || "",
          },
          groups: (prev.groups || []).some((group) => String(group.id) === String(nextGroup.id))
            ? (prev.groups || []).map((group) => (
                String(group.id) === String(nextGroup.id) ? nextGroup : group
              ))
            : [...(prev.groups || []), nextGroup],
        }));
        setInviteTarget(nextGroup);
        showNotice(`You joined ${target.name}.`, "success");
        onNavigate?.("friend-groups", { groupId: target.id, tab: "Members" });
        return;
      }

      // ── Decline path ─────────────────────────────────────────────────────
      const identity = buildPendingIdentity(profile, currentName, resolvedUserId);
      const existingDecline = (target.pending || []).find(
        (item) => item.type === "decline-note" && pendingMatchesIdentity(item, identity)
      );

      if (existingDecline) {
        showNotice(`You already declined ${target.name}.`);
        return;
      }

      const declineEntry = {
        id: createId("decline"),
        type: "decline-note",
        code,
        ...identity,
        clarification: "",
        createdAt: new Date().toISOString(),
      };

      const nextPending = matchedInvite
        ? [
            ...(target.pending || []).filter((item) => String(item.id) !== String(matchedInvite.id)),
            declineEntry,
          ]
        : [...(target.pending || []), declineEntry];

      if (isSupabaseConfigured && target.id) {
        const { error } = await supabase
          .from("groups")
          .update({ pending: nextPending })
          .eq("id", target.id);

        if (error) {
          showNotice(error.message || "We could not save that decline yet.");
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
            crewRecipients.map((uid) => ({
              user_id: uid,
              group_id: target.id,
              group_name: target.name,
              recipient: target.name,
              recipient_key: `user:${uid}`,
              action_screen: "friend-groups",
              action_params: { groupId: target.id, tab: "Invites" },
              type: "crew-invite-declined",
              message: `${currentName} declined the invite to ${target.name}.`,
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
      showNotice(`You declined ${target.name}.`, "warn");
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
                    <div className="field">
                      <label>Email invite</label>
                      <input
                        type="email"
                        value={generatedInviteEmail}
                        onChange={(e) => setGeneratedInviteEmail(e.target.value)}
                        placeholder="friend@example.com"
                        onKeyDown={(e) => e.key === "Enter" && void sendGeneratedCrewInviteEmail()}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => void sendGeneratedCrewInviteEmail()}
                      disabled={isSendingInviteEmail}
                    >
                      {isSendingInviteEmail ? "Sending..." : "Send invite email"}
                    </button>
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
                      {inviteTarget.name}
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
                    inviteAlreadyMember
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

                {inviteTarget ? (
                  <button
                    type="button"
                    className="btn ghost"
                    style={{ width: "100%", marginTop: 8 }}
                    onClick={() => {
                      setInviteTarget(null);
                      setJoinCode("");
                    }}
                  >
                    Try a different code
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
