import { useEffect, useMemo, useState } from "react";
import { getVisibleGroupsForProfile } from "./appState";
import { sendNotificationEmails } from "./notificationEmail";
import { hydrateMembersWithProfileLinks, isSupabaseConfigured, supabase } from "./supabase";
import OutsidersSideNav from "./OutsidersSideNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { background: #f5f3ee; margin: 0; }
  .root { font-family: 'Nunito', sans-serif; background: #f5f3ee; color: #1a1a2e; min-height: 100vh; display: flex; flex-direction: column; }
  .root::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.03; pointer-events: none; z-index: 0; }
  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }
  .main { flex: 1; padding: 28px 32px; overflow-y: auto; }
  .debrief-shell {
    background:
      radial-gradient(circle, rgba(201, 179, 104, 0.42) 1.4px, transparent 1.5px),
      linear-gradient(180deg, #fff9ea 0%, #fff6df 100%);
    background-size: 36px 36px, 100% 100%;
    border: 5px solid #1a1a2e;
    border-radius: 28px;
    box-shadow: 0 0 0 4px rgba(255,255,255,0.45) inset;
    padding: 36px 42px 54px;
    position: relative;
    overflow: hidden;
  }
  .debrief-shell::before {
    content: '';
    position: absolute;
    inset: 16px;
    border: 2px solid rgba(26, 26, 46, 0.08);
    border-radius: 22px;
    pointer-events: none;
  }
  .debrief-hero {
    display: grid;
    justify-items: center;
    gap: 22px;
    text-align: center;
    margin-bottom: 30px;
    position: relative;
    z-index: 1;
    max-width: 980px;
    margin-left: auto;
    margin-right: auto;
  }
  .debrief-kicker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    min-width: min(100%, 360px);
    padding: 12px 24px;
    background: #ffd54d;
    border: 5px solid #1a1a2e;
    border-radius: 12px;
    box-shadow: 0 6px 0 #1a1a2e;
    transform: rotate(-1.5deg);
    font: 400 clamp(18px, 2.2vw, 28px) 'Bangers', cursive;
    letter-spacing: 0.08em;
  }
  .debrief-title {
    margin: 0;
    font: 400 clamp(52px, 9vw, 96px) 'Bangers', cursive;
    line-height: 0.92;
    letter-spacing: 0.05em;
    color: #ff6b6b;
    text-shadow: 6px 0 0 #1a1a2e, 12px 0 0 rgba(255, 107, 107, 0.18);
  }
  .debrief-subtitle {
    position: relative;
    background: #fff;
    border: 5px solid #1a1a2e;
    border-radius: 999px;
    box-shadow: 6px 6px 0 #1a1a2e;
    padding: 16px 32px;
    font: 800 clamp(18px, 2vw, 26px) 'Nunito', sans-serif;
  }
  .debrief-subtitle::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -16px;
    width: 24px;
    height: 24px;
    background: #fff;
    border-right: 5px solid #1a1a2e;
    border-bottom: 5px solid #1a1a2e;
    transform: translateX(-50%) rotate(45deg);
  }
  .debrief-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .debrief-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0 18px;
    color: #888a95;
    font: 400 22px 'Bangers', cursive;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .debrief-section-label::before { content: "▸"; font-size: 18px; }
  .debrief-column-card {
    background: rgba(255,255,255,0.72);
    border: 3px solid rgba(26,26,46,0.14);
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 10px 24px rgba(26,26,46,0.06);
  }
  .card { background: #fff; border: 3px solid #1a1a2e; border-radius: 16px; box-shadow: 5px 5px 0 #1a1a2e; padding: 22px 24px; }
  .section-divider {
    height: 3px;
    border-radius: 999px;
    background: rgba(26, 26, 46, 0.08);
    margin: 6px 0;
  }
  .btn-primary { background: #ff6b6b; color: #fff; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 16px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 8px; }
  .btn-primary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .btn-secondary { background: #ffd93d; color: #1a1a2e; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 15px; padding: 9px 18px; display: inline-flex; align-items: center; gap: 8px; }
  .btn-secondary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .btn-outline { background: #fff; color: #1a1a2e; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 3px 3px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 14px; padding: 8px 16px; display: inline-flex; align-items: center; gap: 6px; }
  .btn-outline:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 #1a1a2e; }
  .form-input { width: 100%; padding: 12px 14px; font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 700; color: #1a1a2e; background: #fffdf9; border: 3px solid #1a1a2e; border-radius: 10px; outline: none; transition: box-shadow 0.15s, border-color 0.15s; box-shadow: 3px 3px 0 #1a1a2e; resize: none; }
  .form-input:focus { border-color: #ff6b9d; box-shadow: 3px 3px 0 #ff6b9d; }
  .form-input::placeholder { color: #bbb; font-weight: 600; }
  .form-label { display: block; font-family: 'Bangers', cursive; font-size: 15px; letter-spacing: 0.05em; color: #1a1a2e; margin-bottom: 6px; }
  .avatar { width: 38px; height: 38px; border-radius: 50%; border: 2.5px solid #1a1a2e; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; color: #fff; flex-shrink: 0; box-shadow: 2px 2px 0 #1a1a2e; }
  .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 8px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.05em; border: 2px solid; }
  .case-card { background: #fff; border: 3px solid #1a1a2e; border-radius: 14px; padding: 18px 20px; box-shadow: 5px 5px 0 #1a1a2e; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
  .case-card:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }
  .case-note { border: 3px solid #1a1a2e; border-radius: 14px; padding: 14px 16px; box-shadow: 4px 4px 0 #1a1a2e; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal { background: #fff; border: 4px solid #1a1a2e; border-radius: 20px; box-shadow: 10px 10px 0 #1a1a2e; padding: 36px 32px; width: 100%; max-width: 560px; position: relative; max-height: 90vh; overflow-y: auto; }
  .close-btn { position: absolute; top: 16px; right: 16px; background: #f5f3ee; border: 2px solid #1a1a2e; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; box-shadow: 2px 2px 0 #1a1a2e; }
  .profile-chip { display: flex; align-items: center; gap: 8px; background: #fff; border: 3px solid #1a1a2e; border-radius: 50px; padding: 4px 14px 4px 4px; box-shadow: 3px 3px 0 #1a1a2e; cursor: pointer; }
  .notif-dot { width: 8px; height: 8px; background: #ff6b6b; border: 2px solid #1a1a2e; border-radius: 50%; position: absolute; top: -2px; right: -2px; }
  .comic-tag { display: inline-block; background: #ffd93d; border: 2px solid #1a1a2e; border-radius: 6px; padding: 1px 10px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.06em; box-shadow: 2px 2px 0 #1a1a2e; transform: rotate(-2deg); }
  .debrief-layout-grid { grid-template-columns: minmax(260px, 300px) minmax(0, 1fr); }
  @media (max-width: 1024px) {
    .main { padding: 24px 20px; }
    .debrief-layout-grid { grid-template-columns: 1fr; }
    .debrief-shell { padding: 28px 22px 36px; }
  }
  @media (max-width: 640px) {
    .main { padding: 18px 14px; }
    .debrief-shell { padding: 20px 16px 28px; }
    .debrief-kicker { min-width: 0; width: 100%; }
    .debrief-subtitle { padding: 14px 20px; }
  }
`;

function getInitials(name) {
  const cleaned = (name || "").replace(/^@/, "").trim();
  if (!cleaned) return "??";
  return cleaned.slice(0, 2).toUpperCase();
}

function countMemberVotes(votes = {}, memberName) {
  return Object.values(votes).filter((value) => value === memberName).length;
}

function getLeaderFromMemberVotes(members = [], votes = {}) {
  const ranked = members
    .map((member) => ({ name: member.name, votes: countMemberVotes(votes, member.name) }))
    .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));

  const top = ranked[0];
  const runnerUp = ranked[1];

  if (!top || top.votes === 0) return null;
  if (runnerUp && runnerUp.votes === top.votes) {
    return { name: "", votes: top.votes, isTie: true };
  }
  return { name: top.name, votes: top.votes, isTie: false };
}

function getNextId(items, prefix) {
  const nextNumber = (items || []).reduce((highest, item) => {
    const numeric = Number(String(item.id || "").replace(`${prefix}-`, ""));
    return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
  }, 0) + 1;

  return `${prefix}-${nextNumber}`;
}

function isCurrentMember(member, currentUserId, currentUsername, currentDisplayName) {
  if (!member) return false;
  if (currentUserId && member.userId === currentUserId) return true;
  if (currentUsername && member.username === `@${currentUsername}`) return true;
  return member.name === currentDisplayName;
}

function getStatusTone(status) {
  if (status === "Resolved") return { bg: "#e8fde8", color: "#51cf66", border: "#51cf66" };
  return { bg: "#fde8f0", color: "#ff6b9d", border: "#ff6b9d" };
}

function getResponseTone(kind) {
  if (kind === "apology") return { bg: "#e8fde8", border: "#51cf66", shadow: "#51cf66", label: "Apology" };
  if (kind === "clapback") return { bg: "#fff4e6", border: "#ff9a3c", shadow: "#ff9a3c", label: "Clap Back" };
  return { bg: "#e8f4fd", border: "#4ecdc4", shadow: "#4ecdc4", label: "Response" };
}

export default function OutsidersDebrief({ onNavigate, appData, setAppData }) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [responseDraft, setResponseDraft] = useState("");
  const [responseType, setResponseType] = useState("response");
  const [notice, setNotice] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [newCaseForm, setNewCaseForm] = useState({
    groupId: "",
    scope: "personal",
    targetMemberName: "",
    mediatorName: "",
    title: "",
    details: "",
  });

  const fallbackProfile = useMemo(() => appData?.profile || {}, [appData?.profile]);
  const groups = useMemo(() => getVisibleGroupsForProfile(appData?.groups || [], fallbackProfile), [appData?.groups, fallbackProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (active) setCurrentUser(data.user || null);
    }

    loadUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      if (!session?.user) {
        setCurrentProfile(null);
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !currentUser?.id) return undefined;

    let active = true;

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (active) {
        setCurrentProfile(data || null);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [currentUser]);

  const currentDisplayName = currentProfile?.full_name || currentUser?.user_metadata?.full_name || "You";
  const currentUsername = currentProfile?.username || currentUser?.user_metadata?.username || "";

  const selectedGroup = useMemo(() => {
    return groups.find((group) => String(group.id) === String(activeGroupId)) || groups[0] || null;
  }, [activeGroupId, groups]);

  const groupMembers = useMemo(() => {
    return selectedGroup?.members || [];
  }, [selectedGroup]);

  const currentMember = useMemo(() => {
    return groupMembers.find((member) => isCurrentMember(member, currentUser?.id, currentUsername, currentDisplayName)) || null;
  }, [currentDisplayName, currentUser, currentUsername, groupMembers]);

  const currentVoteKey = currentUser?.id || (currentUsername ? `username:${currentUsername}` : `name:${currentDisplayName}`);
  const peaceMakerBench = selectedGroup?.peaceMaker || { electedMemberName: "", votes: {}, oath: "" };
  const peaceMakerVoteEntries = Object.entries(peaceMakerBench.votes || {});
  const peaceMakerLeader = getLeaderFromMemberVotes(selectedGroup?.members || [], peaceMakerBench.votes || {});

  const cases = useMemo(() => selectedGroup?.cases || [], [selectedGroup]);
  const visibleCases = useMemo(() => cases.filter((caseItem) => {
    if (caseItem.visibility === "group") return true;
    return (
      caseItem.targetUserId === currentUser?.id ||
      (currentUsername && caseItem.targetUsername === `@${currentUsername}`) ||
      caseItem.targetName === currentDisplayName
    );
  }), [cases, currentDisplayName, currentUser, currentUsername]);
  const selectedCase = visibleCases.find((caseItem) => caseItem.id === selectedCaseId) || visibleCases[0] || null;

  const targetedCases = useMemo(() => {
    if (!selectedGroup) return [];
    return cases.filter((caseItem) => (
      caseItem.visibility === "personal" && (
        caseItem.targetUserId === currentUser?.id ||
        (currentUsername && caseItem.targetUsername === `@${currentUsername}`) ||
        caseItem.targetName === currentDisplayName
      )
    ));
  }, [cases, currentDisplayName, currentUser, currentUsername, selectedGroup]);

  const draftMemberOptions = useMemo(() => {
    const chosenGroup = groups.find((group) => String(group.id) === String(newCaseForm.groupId)) || selectedGroup;
    return (chosenGroup?.members || []).filter((member) => !isCurrentMember(member, currentUser?.id, currentUsername, currentDisplayName));
  }, [currentDisplayName, currentUser, currentUsername, groups, newCaseForm.groupId, selectedGroup]);

  const mediatorOptions = useMemo(() => {
    const chosenGroup = groups.find((group) => String(group.id) === String(newCaseForm.groupId)) || selectedGroup;
    return (chosenGroup?.members || []).filter((member) => (
      member.name !== newCaseForm.targetMemberName &&
      !isCurrentMember(member, currentUser?.id, currentUsername, currentDisplayName)
    ));
  }, [currentDisplayName, currentUser, currentUsername, groups, newCaseForm.groupId, newCaseForm.targetMemberName, selectedGroup]);

  async function persistGroupPatch(groupId, uiPatch, dbPatch = uiPatch) {
    const nextGroups = groups.map((group) => (
      String(group.id) === String(groupId) ? { ...group, ...uiPatch } : group
    ));

    setAppData?.((prev) => ({ ...prev, groups: nextGroups }));

    if (isSupabaseConfigured && currentUser?.id) {
      const { error } = await supabase
        .from("groups")
        .update(dbPatch)
        .eq("id", groupId);

      if (error) {
        setNotice(error.message);
        return false;
      }
    }

    return true;
  }

  async function persistCases(groupId, nextCases) {
    return persistGroupPatch(groupId, { cases: nextCases });
  }

  async function persistPeaceMaker(groupId, nextPeaceMaker) {
    return persistGroupPatch(groupId, { peaceMaker: nextPeaceMaker }, { peace_maker: nextPeaceMaker });
  }

  async function createCase() {
    const groupId = newCaseForm.groupId || selectedGroup?.id;
    const targetGroup = groups.find((group) => String(group.id) === String(groupId));
    const { members: resolvedMembers } = targetGroup ? await hydrateMembersWithProfileLinks(targetGroup.members || []) : { members: [] };
    const targetMember = newCaseForm.scope === "group"
      ? null
      : resolvedMembers.find((member) => member.name === newCaseForm.targetMemberName);

    if (!targetGroup) {
      setNotice("Pick a crew first.");
      return;
    }

    if (newCaseForm.scope === "personal" && !targetMember) {
      setNotice("Pick who this case is about.");
      return;
    }

    if (!newCaseForm.title.trim() || !newCaseForm.details.trim()) {
      setNotice("Add both a case title and the full story.");
      return;
    }

    const nextCase = {
      id: getNextId(targetGroup.cases || [], "case"),
      title: newCaseForm.title.trim(),
      body: newCaseForm.details.trim(),
      visibility: newCaseForm.scope,
      targetName: newCaseForm.scope === "group" ? "Whole group" : targetMember.name,
      targetInitials: newCaseForm.scope === "group" ? "GR" : (targetMember.initials || getInitials(targetMember.name)),
      targetUsername: newCaseForm.scope === "group" ? "" : (targetMember.username || ""),
      targetUserId: newCaseForm.scope === "group" ? null : (targetMember.userId || null),
      mediatorName: newCaseForm.scope === "group"
        ? (targetGroup.peaceMaker?.electedMemberName || "")
        : (newCaseForm.mediatorName || ""),
      status: "Open",
      createdLabel: "Just filed",
      sourceLabel: targetGroup.name,
      anonymous: true,
      updates: [
        {
          id: "update-1",
          kind: "case",
          authorLabel: "Anonymous case",
          body: newCaseForm.details.trim(),
        },
      ],
    };

    const nextCases = [nextCase, ...(targetGroup.cases || [])];
    const nextGroupMembers = resolvedMembers.length ? resolvedMembers : (targetGroup.members || []);
    const saved = await persistGroupPatch(
      targetGroup.id,
      { cases: nextCases, members: nextGroupMembers },
      { cases: nextCases, members: nextGroupMembers }
    );
    if (!saved) return;

    if (isSupabaseConfigured) {
      const recipientMembers = newCaseForm.scope === "group"
        ? nextGroupMembers
        : (targetMember ? [targetMember] : []);

      const recipientRows = recipientMembers
        .filter((member) => member.userId)
        .map((member) => ({
          user_id: member.userId,
          recipient: member.name,
          recipient_key: `user:${member.userId}`,
          group_id: targetGroup.id,
          group_name: targetGroup.name,
          action_screen: "debrief",
          action_params: { groupId: String(targetGroup.id), caseId: nextCase.id },
          type: "debrief-case",
          message: newCaseForm.scope === "group"
            ? `A new anonymous case was filed in ${targetGroup.name}.`
            : `A private anonymous case was filed for you in ${targetGroup.name}.`,
          read: false,
        }));

      if (recipientRows.length) {
        const { error } = await supabase.from("notifications").insert(recipientRows);
        if (error) {
          console.warn("Debrief notifications did not fully save:", error.message);
        }
      }

      try {
        await sendNotificationEmails({
          recipients: recipientMembers
            .filter((member) => member.email)
            .map((member) => ({ email: member.email, name: member.name })),
          subject: newCaseForm.scope === "group"
            ? `New anonymous case in ${targetGroup.name}`
            : `Private anonymous case for you in ${targetGroup.name}`,
          intro: newCaseForm.scope === "group"
            ? `A new anonymous group-wide case was filed in ${targetGroup.name}.`
            : `A new anonymous personal case was filed for you in ${targetGroup.name}.`,
          ctaLabel: "Open Debrief Court",
          ctaUrl: "",
          details: [
            `Crew: ${targetGroup.name}`,
            `Case title: ${nextCase.title}`,
            newCaseForm.scope === "personal" ? "This case is visible only to the person named." : "This case is visible to the whole crew.",
          ],
        });
      } catch (emailError) {
        console.warn("Debrief email notifications did not fully send:", emailError.message);
      }
    }

    setActiveGroupId(String(targetGroup.id));
    setSelectedCaseId(nextCase.id);
    setShowNewModal(false);
    setNewCaseForm({ groupId: String(targetGroup.id), scope: "personal", targetMemberName: "", mediatorName: "", title: "", details: "" });
    setNotice(newCaseForm.scope === "group" ? "Anonymous group-wide case filed." : `Anonymous personal case filed against ${targetMember.name}.`);
  }

  async function voteForPeaceMaker(memberName) {
    if (!selectedGroup) return;
    const nextVotes = { ...(peaceMakerBench.votes || {}) };
    if (nextVotes[currentVoteKey] === memberName) {
      delete nextVotes[currentVoteKey];
    } else {
      nextVotes[currentVoteKey] = memberName;
    }
    const leader = getLeaderFromMemberVotes(groupMembers, nextVotes);
    const nextPeaceMaker = {
      ...peaceMakerBench,
      electedMemberName: leader?.isTie ? "" : (leader?.name || ""),
      votes: nextVotes,
      oath: peaceMakerBench.oath || "Hear both sides, cool the temperature, and push the room toward something fair.",
    };

    const saved = await persistPeaceMaker(selectedGroup.id, nextPeaceMaker);
    if (!saved) return;
    setNotice(
      peaceMakerBench.votes?.[currentVoteKey] === memberName
        ? "You removed your peace-maker vote."
        : `${memberName} got your peace-maker vote.`
    );
  }

  async function sendResponse() {
    if (!selectedGroup || !selectedCase || !responseDraft.trim()) return;

    const nextUpdate = {
      id: getNextId(selectedCase.updates || [], "update"),
      kind: responseType,
      authorLabel: responseType === "apology" ? currentDisplayName : currentMember?.name || currentDisplayName,
      body: responseDraft.trim(),
    };

    const nextCases = cases.map((caseItem) => (
      caseItem.id === selectedCase.id
        ? { ...caseItem, updates: [...(caseItem.updates || []), nextUpdate] }
        : caseItem
    ));

    const saved = await persistCases(selectedGroup.id, nextCases);
    if (!saved) return;

    setResponseDraft("");
    setResponseType("response");
    setNotice(responseType === "apology" ? "Apology posted." : "Response posted.");
  }

  async function toggleCaseStatus() {
    if (!selectedGroup || !selectedCase) return;

    const nextStatus = selectedCase.status === "Resolved" ? "Open" : "Resolved";
    const nextCases = cases.map((caseItem) => (
      caseItem.id === selectedCase.id ? { ...caseItem, status: nextStatus } : caseItem
    ));

    const saved = await persistCases(selectedGroup.id, nextCases);
    if (!saved) return;

    setNotice(nextStatus === "Resolved" ? "Case closed for now." : "Case reopened.");
  }

  const profileName = appData?.profile?.name || appData?.profile?.username || "You";

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav activeLabel="Debrief" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length} appData={appData} setAppData={setAppData}>
          <main className="main">
            <section className="debrief-shell">
            <div className="debrief-hero">
              <div className="debrief-kicker">
                <span>⚖️</span>
                <span>Anonymous Court Room</span>
                <span>⚖️</span>
              </div>
              <h1 className="debrief-title">Debrief Court</h1>
              <div className="debrief-subtitle">Bring the crew into session, file the case, and give people one place to answer, apologize, or push back.</div>
              <div className="debrief-actions">
                <button className="btn-primary" onClick={() => setShowNewModal(true)}>+ File A Case</button>
              </div>
            </div>

            {notice ? (
              <div style={{ background: "#fff4e6", border: "3px solid #ff9a3c", borderRadius: 12, padding: "12px 16px", boxShadow: "4px 4px 0 #ff9a3c", marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#7a4d00" }}>{notice}</p>
              </div>
            ) : null}

            {groups.length === 0 ? (
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ fontSize: 38, margin: "0 0 10px" }}>🧱</p>
                <p className="bangers" style={{ fontSize: 24, margin: "0 0 8px" }}>No crew, no red room yet</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#888", margin: "0 0 16px" }}>Create or join a friend group first, then members can file anonymous cases here.</p>
                <button className="btn-secondary" onClick={() => onNavigate?.("friend-groups")}>Go To My Crew</button>
              </div>
            ) : (
              <>
              <div className="debrief-section-label">Case Rooms</div>
              <div className="card" style={{ display: "grid", gap: 22 }}>
                <div>
                  <p className="bangers" style={{ fontSize: 24, margin: "0 0 8px" }}>Court Overview</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#667085", margin: 0 }}>Everything for this crew's Debrief Court lives here in one room: pick the crew, review the bench, open a case, and answer the thread.</p>
                </div>

                <div className="section-divider" />

                <div style={{ display: "grid", gap: 16 }}>
                  <p className="bangers" style={{ fontSize: 18, margin: 0 }}>1. Choose Crew</p>
                  <div style={{ maxWidth: 360 }}>
                    <p className="bangers" style={{ fontSize: 14, margin: "0 0 10px", color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" }}>Choose crew</p>
                    <select className="form-input" value={selectedGroup?.id || ""} onChange={(event) => { setActiveGroupId(event.target.value); setSelectedCaseId(""); }} style={{ padding: "10px 14px" }}>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="section-divider" />

                <div style={{ display: "grid", gap: 16 }}>
                  <p className="bangers" style={{ fontSize: 18, margin: 0 }}>2. Room Snapshot</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                    <div className="card" style={{ background: "#fde8f0", borderColor: "#ff6b9d", boxShadow: "5px 5px 0 #ff6b9d" }}>
                    <p className="bangers" style={{ fontSize: 16, margin: "0 0 8px" }}>Against You</p>
                    <p style={{ fontSize: 34, margin: "0 0 4px", fontWeight: 900, color: "#ff6b9d" }}>{targetedCases.length}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: 0 }}>Cases in this room naming you directly.</p>
                    </div>

                    <div className="card" style={{ background: "#e8f4fd", borderColor: "#4ecdc4", boxShadow: "5px 5px 0 #4ecdc4" }}>
                    <p className="bangers" style={{ fontSize: 16, margin: "0 0 8px" }}>Current Peace Maker</p>
                    <p style={{ fontSize: 24, margin: "0 0 4px", fontWeight: 900, color: "#4ecdc4" }}>
                      {peaceMakerBench.electedMemberName || "No one yet"}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: 0 }}>
                      {peaceMakerVoteEntries.length} crew vote{peaceMakerVoteEntries.length === 1 ? "" : "s"} have been cast.
                    </p>
                    </div>

                    <div className="card" style={{ background: "#fff4e6", borderColor: "#ff9a3c", boxShadow: "5px 5px 0 #ff9a3c" }}>
                    <p className="bangers" style={{ fontSize: 16, margin: "0 0 8px" }}>Room Rules</p>
                    {[
                      "Cases are filed anonymously.",
                      "Speak on behavior, not identity.",
                      "Clap backs stay specific.",
                      "Apologies should name the harm and the fix.",
                    ].map((rule) => (
                      <p key={rule} style={{ fontSize: 12, fontWeight: 800, color: "#555", margin: "0 0 6px" }}>{rule}</p>
                    ))}
                    </div>
                  </div>
                </div>

                <div className="section-divider" />

                <div style={{ display: "grid", gap: 16 }}>
                  <p className="bangers" style={{ fontSize: 18, margin: 0 }}>3. Peace-Maker Bench</p>
                  <div className="card" style={{ background: "#e8f4fd", borderColor: "#4ecdc4", boxShadow: "5px 5px 0 #4ecdc4" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                      <p className="bangers" style={{ fontSize: 16, margin: 0 }}>Peace-Maker Bench ⚖️</p>
                      <span className="badge" style={{ background: "#fff", color: "#4ecdc4", borderColor: "#4ecdc4" }}>
                        {peaceMakerLeader?.isTie ? `Tie at ${peaceMakerLeader.votes} vote${peaceMakerLeader.votes === 1 ? "" : "s"}` : (peaceMakerLeader?.name ? `${peaceMakerLeader.name} leading` : "No vote yet")}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#555", margin: "0 0 10px" }}>
                      Vote for the person you trust most to step in on group cases. One-on-one cases can still name a separate mediator.
                    </p>
                    <div style={{ background: "#fff", border: "2px solid #1a1a2e", borderRadius: 12, padding: "10px 12px", marginBottom: 12 }}>
                      <p className="bangers" style={{ fontSize: 13, margin: "0 0 4px" }}>Bench result</p>
                      <p style={{ fontSize: 13, fontWeight: 900, color: "#1a1a2e", margin: "0 0 4px" }}>
                        {peaceMakerBench.electedMemberName || (peaceMakerLeader?.isTie ? "Tie vote right now" : "No elected peace maker yet")}
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 800, color: "#777", margin: 0 }}>
                        {peaceMakerLeader?.isTie
                          ? "Your crew is tied, so nobody has the bench yet."
                          : (peaceMakerLeader?.name ? `${peaceMakerLeader.name} is currently leading the vote.` : "Nobody is leading because no vote has been cast yet.")}
                      </p>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#1a1a2e", margin: "0 0 12px" }}>
                      {peaceMakerBench.oath || "Hear both sides, cool the temperature, and push the room toward something fair."}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {groupMembers.map((member, index) => {
                        const voteCount = countMemberVotes(peaceMakerBench.votes, member.name);
                        const isMyVote = peaceMakerBench.votes?.[currentVoteKey] === member.name;
                        return (
                          <div key={member.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#fff", border: "2px solid #1a1a2e", borderRadius: 12, padding: "10px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="avatar" style={{ width: 30, height: 30, background: ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"][index % 6], fontSize: 10 }}>{member.initials}</div>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 900, margin: 0 }}>{member.name}</p>
                                <p style={{ fontSize: 11, fontWeight: 800, color: "#777", margin: 0 }}>{voteCount} vote{voteCount === 1 ? "" : "s"} {isMyVote ? "· your pick" : ""}</p>
                              </div>
                            </div>
                            <button className="btn-outline" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => voteForPeaceMaker(member.name)}>
                              {isMyVote ? "Remove my vote" : "Vote"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="section-divider" />

                <div style={{ display: "grid", gap: 16 }}>
                  <p className="bangers" style={{ fontSize: 18, margin: 0 }}>4. Case Rooms</p>
                  <div className="debrief-layout-grid" style={{ display: "grid", gap: 24 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {visibleCases.length === 0 ? (
                      <div style={{ border: "3px dashed #ccc", borderRadius: 14, padding: "18px", textAlign: "center" }}>
                        <p className="bangers" style={{ fontSize: 16, color: "#aaa", margin: "0 0 6px" }}>No visible cases</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#888", margin: 0 }}>You’ll see group-wide cases plus any personal cases aimed at you.</p>
                      </div>
                    ) : visibleCases.map((caseItem) => {
                      const tone = getStatusTone(caseItem.status);
                      const isAgainstMe = caseItem.targetUserId === currentUser?.id || (currentUsername && caseItem.targetUsername === `@${currentUsername}`) || caseItem.targetName === currentDisplayName;
                      return (
                        <div
                          key={caseItem.id}
                          className="case-card"
                          style={{
                            background: selectedCase?.id === caseItem.id ? tone.bg : "#fff",
                            borderColor: selectedCase?.id === caseItem.id ? tone.border : "#1a1a2e",
                            boxShadow: `5px 5px 0 ${selectedCase?.id === caseItem.id ? tone.border : "#1a1a2e"}`,
                          }}
                          onClick={() => setSelectedCaseId(caseItem.id)}
                        >
                          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                            <p className="bangers" style={{ fontSize: 16, margin: 0 }}>{caseItem.title}</p>
                            <span className="badge" style={{ background: tone.bg, color: tone.color, borderColor: tone.border }}>{caseItem.status}</span>
                          </div>
                          <p style={{ fontSize: 12, fontWeight: 800, color: "#777", margin: "0 0 8px" }}>
                            {caseItem.visibility === "group" ? "Whole-crew case" : `Against ${caseItem.targetName}`}
                          </p>
                          {isAgainstMe ? <span className="badge" style={{ background: "#fff", color: "#ff6b6b", borderColor: "#ff6b6b" }}>You were named</span> : null}
                        </div>
                      );
                    })}
                    </div>

                  {selectedGroup && selectedCase ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div className="card" style={{ background: "#fffdf9" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <span className="comic-tag">Filed anonymously</span>
                          <h2 className="bangers" style={{ fontSize: 26, margin: "10px 0 6px" }}>{selectedCase.title}</h2>
                          <p style={{ fontSize: 13, fontWeight: 800, color: "#888", margin: "0 0 10px" }}>
                            {selectedCase.visibility === "group" ? "Whole group issue" : `Against ${selectedCase.targetName}`} · {selectedCase.sourceLabel}
                          </p>
                          <div style={{ background: "#e8f4fd", border: "3px solid #4ecdc4", borderRadius: 12, padding: "12px 14px", boxShadow: "3px 3px 0 #4ecdc4", margin: "0 0 12px", maxWidth: 360 }}>
                            <p className="bangers" style={{ fontSize: 14, margin: "0 0 4px" }}>Peace Maker On This Case</p>
                            <p style={{ fontSize: 13, fontWeight: 900, color: "#1a1a2e", margin: "0 0 4px" }}>
                              {selectedCase.mediatorName || (selectedCase.visibility === "group" ? peaceMakerBench.electedMemberName || "No elected peace maker yet" : "None assigned")}
                            </p>
                            <p style={{ fontSize: 12, fontWeight: 800, color: "#555", margin: 0 }}>
                              {selectedCase.visibility === "group"
                                ? "Group cases can use the crew's voted peace maker."
                                : "Personal cases can bring in an optional peace maker if the filer wants one."}
                            </p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="avatar" style={{ background: "#1a1a2e" }}>AN</div>
                            <span style={{ fontSize: 13, fontWeight: 800 }}>Anonymous filer</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#aaa" }}>{selectedCase.createdLabel}</span>
                          </div>
                        </div>
                        <button className="btn-outline" onClick={toggleCaseStatus}>
                          {selectedCase.status === "Resolved" ? "Reopen" : "Mark Resolved"}
                        </button>
                      </div>
                      </div>

                      <div className="card">
                      <div className="case-note" style={{ background: "#fff4e6", borderColor: "#ff9a3c", boxShadow: "4px 4px 0 #ff9a3c", marginBottom: 16 }}>
                        <p className="bangers" style={{ fontSize: 14, margin: "0 0 6px", color: "#ff9a3c" }}>The Case</p>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>{selectedCase.body}</p>
                      </div>

                      <p className="bangers" style={{ fontSize: 18, margin: "0 0 14px" }}>Thread</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {(selectedCase.updates || []).map((update) => {
                          const tone = getResponseTone(update.kind);
                          return (
                            <div key={update.id} className="case-note" style={{ background: tone.bg, borderColor: tone.border, boxShadow: `4px 4px 0 ${tone.shadow}` }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                                <span className="badge" style={{ background: "#fff", color: tone.border, borderColor: tone.border }}>{tone.label}</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: "#666" }}>{update.authorLabel}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>{update.body}</p>
                            </div>
                          );
                        })}
                      </div>
                      </div>

                      <div className="card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                        <p className="bangers" style={{ fontSize: 18, margin: 0 }}>Address The Court</p>
                        <select className="form-input" value={responseType} onChange={(event) => setResponseType(event.target.value)} style={{ width: 180, padding: "10px 14px" }}>
                          <option value="response">Make a response</option>
                          <option value="clapback">Make a clap back</option>
                          <option value="apology">Own it and apologize</option>
                        </select>
                      </div>
                      <textarea
                        className="form-input"
                        rows={5}
                        placeholder="Say your piece clearly. If you caused harm, name it and explain the fix."
                        value={responseDraft}
                        onChange={(event) => setResponseDraft(event.target.value)}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#777" }}>
                          {selectedCase.visibility === "group"
                            ? "Everyone in the crew can read this thread. The original filer stays anonymous."
                            : "Only the person named can see this private case. The original filer still stays anonymous."}
                        </span>
                        <button className="btn-primary" onClick={sendResponse}>Post Reply</button>
                      </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card" style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 38, margin: "0 0 10px" }}>🕳️</p>
                      <p className="bangers" style={{ fontSize: 22, margin: "0 0 8px" }}>Pick a case room</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#888", margin: 0 }}>Select a visible case on the left to read it, clap back, or apologize.</p>
                    </div>
                  )}
                  </div>
                </div>
              </div>
              </>
            )}
            </section>
          </main>
        </OutsidersSideNav>

        {showNewModal ? (
          <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowNewModal(false)}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">Anonymous filing 🕶️</span>
                <h2 className="bangers" style={{ fontSize: 32, margin: "8px 0 4px" }}>Open A Case</h2>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Pick the crew, decide whether this is personal or for the whole room, then file your case.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">Which crew?</label>
                  <select className="form-input" value={newCaseForm.groupId || selectedGroup?.id || ""} onChange={(event) => setNewCaseForm((current) => ({ ...current, groupId: event.target.value, targetMemberName: "" }))} style={{ padding: "10px 14px" }}>
                    {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Is this personal or about the whole group?</label>
                  <select className="form-input" value={newCaseForm.scope} onChange={(event) => setNewCaseForm((current) => ({ ...current, scope: event.target.value, targetMemberName: "" }))} style={{ padding: "10px 14px" }}>
                    <option value="personal">Specific person</option>
                    <option value="group">Whole group</option>
                  </select>
                </div>
                {newCaseForm.scope === "personal" ? (
                  <div>
                    <label className="form-label">Who is this against?</label>
                    <select className="form-input" value={newCaseForm.targetMemberName} onChange={(event) => setNewCaseForm((current) => ({ ...current, targetMemberName: event.target.value }))} style={{ padding: "10px 14px" }}>
                      <option value="">Pick a group member</option>
                      {draftMemberOptions.map((member) => <option key={member.name} value={member.name}>{member.name}</option>)}
                    </select>
                  </div>
                ) : null}
                {newCaseForm.scope === "personal" ? (
                  <div>
                    <label className="form-label">Optional peace maker</label>
                    <select className="form-input" value={newCaseForm.mediatorName} onChange={(event) => setNewCaseForm((current) => ({ ...current, mediatorName: event.target.value }))} style={{ padding: "10px 14px" }}>
                      <option value="">No peace maker for now</option>
                      {mediatorOptions.map((member) => <option key={member.name} value={member.name}>{member.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div style={{ background: "#e8f4fd", border: "3px solid #4ecdc4", borderRadius: 12, padding: "12px 14px", boxShadow: "3px 3px 0 #4ecdc4" }}>
                    <p className="bangers" style={{ fontSize: 14, margin: "0 0 4px" }}>Group peace maker</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#555", margin: 0 }}>
                      {peaceMakerBench.electedMemberName ? `${peaceMakerBench.electedMemberName} is currently the voted peace maker for this crew.` : "No peace maker has been voted in yet."}
                    </p>
                  </div>
                )}
                <div>
                  <label className="form-label">Case title</label>
                  <input className="form-input" type="text" placeholder="Late-night shade in the group chat" value={newCaseForm.title} onChange={(event) => setNewCaseForm((current) => ({ ...current, title: event.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Make your case</label>
                  <textarea className="form-input" rows={6} placeholder="Explain what happened, why it landed badly, and what needs to change." value={newCaseForm.details} onChange={(event) => setNewCaseForm((current) => ({ ...current, details: event.target.value }))} />
                </div>
                <div style={{ background: "#fde8f0", border: "3px solid #ff6b9d", borderRadius: 12, padding: "14px 16px", boxShadow: "3px 3px 0 #ff6b9d" }}>
                  <p className="bangers" style={{ fontSize: 14, margin: "0 0 6px" }}>How this room works</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: 0 }}>
                    Your name stays hidden on the case. Personal cases are private to the person named and can optionally include a peace maker. Group cases are visible to everyone in the crew and can rely on the voted peace-maker bench.
                  </p>
                </div>
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 20, padding: "14px" }} onClick={createCase}>
                  File Anonymous Case
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
